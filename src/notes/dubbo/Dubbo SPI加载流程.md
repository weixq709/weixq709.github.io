---
title: Dubbo SPI加载流程
createTime: 2025/01/09 09:09:10
permalink: /dubbo/dubbo-spi-load-process/
---

在阅读`Dubbo`源码时，我们知道，`Dubbo`框架自定义了一套SPI机制。本文将分析`Dubbo`自定义SPI的原因，比较与`JAVA SPI`的优点以及`Dubb`如何通过`SPI`加载扩展点。

<!-- more -->

## JAVA SPI

在讨论`Dubbo SPI`前，先回顾一下`Java是如何加载扩展类的。java spi通过读取classpath下的默认文件夹META-INF/services下的所有文件，然后读取文件内接口的全限定类名，依次加载接口下的所有扩展点实现。

例如：

```java
package com.demo;
public interface Car {

  String getColor();
}
```

```java
package com.demo;
public class RedCar implements Car {

  public String getColor() {
    return "red";
  }
}
```

```java
package com.demo;
public class BlackCar implements Car {

  public String getColor() {
    reutrn "black";
  }
}
```

然后，在classpath:META-INF/services目录下新建文件，文件名称为接口路径。

> [!TIP]
> 此处以maven工程说明。

文件内容如下：
```txt
com.demo.RedCar
com.demo.BlackCar
```

最后，加载扩展点
```java
ServiceLoader<Car> cars = ServiceLoder.load(Car.class);
for(Car car : cars) {
  System.out.println(car.getColor());
}
```

以上示例可以看到，Java SPI存在以下问题：
- 无法按需加载，启动时就加载所有实现类，如果有些实现类永远不会被用到，会造成资源浪费。
- 获取扩展点的方式不够灵活，只能通过`Iterator`遍历获取，不能根据名称获取。
- 扩展点加载失败时，仅抛出异常，不提供异常具体的扩展点信息。

## Dubbo SPI

### Dubbo spi加载流程分析
1. 读取配置文件

   Dubbo按照优先级顺序从以下目录读取：

   - META-INF/dubbo/internal: 加载内部扩展点目录，优先级最高，不支持扩展点实现覆盖。

   - META-INF/dubbo: 加载用户自定义扩展点实现，优先级一般，支持扩展点实现覆盖。

   - META-INF/services: JAVA SPI默认目录，优先级最低，支持扩展点实现覆盖。

     

   | 目录             | 优先级            | 是否支持覆盖 | 实现类                         |
   | ---------------- | ----------------- | ------------ | ------------------------------ |
   | /dubbo/internal/ | Integer.MIN_VALUE | 否           | `DubboInternalLoadingStrategy` |
   | /dubbo/          | 0                 | 是           | `DubboLoadingStrategy`         |
   | /services        | Integer.MAX_VALUE | 是           | `ServicesLoadingStrategy`      |

   > [!TIP]
   > 本文使用`Dubbo 2.7.7进行说明`。

2. 加载扩展点文件

   - 如果扩展点名称为空，抛出异常。
   - 如果扩展点名称为`true`，查找默认的扩展点实现（[默认扩展点声明](#declare-default-extension)）。
   - 否则，根据name查找扩展点实现。

   > [!TIP]
   > 此处为保证在多线程环境下多个扩展点仅实例化一次，需要获取一把锁。但是扩展点实例创建在加锁操作之后完成，于是，`Dubbo`采用使用`Holder`对象内部包裹扩展点实例的方式进行加锁操作。

3. 根据扩展点名称按需创建扩展点实例

   - 查找扩展点实例缓存，如果在缓存中，返回。
   - 否则使用无参构造器创建扩展点实例。

4. 依赖注入

   - 判断扩展点对象工厂是否为空，如果为空返回`null`，默认实现为[自适应扩展工厂](#adaptive-extension-factory)。
   - 查找`Setter`方法，不是`Setter`方法跳过执行。
   - 如果方法使用`@DisableInject`标记，跳过执行。
   - 如果参数类型不是`Java`基本类型，跳过执行。
   - 属性注入。
     1. 如果方法上不包含`@Inject`注解，使用属性名称注入（`ByName`）。
     2. 如果方法上包含`@Inject`且`enable`为false，不注入。
     3. 如果方法上包含`@Inject`切`type`值为`ByType`，按参数类型注入。
     4. 如果方法上包含`@Inject`且`type`值为`ByName`，按属性名称注入。

5. aop

   - 获取所有的包装类扩展点，使用`WrapperComparator`进行升序排序，排序完成后倒序。

     如果包装类上包含`@Active`，使用`value`属性作为顺序值排序，否则顺序默认为0。

   - 依次遍历所有包装类，包裹当前实例。

     1. 如果包装类上不包含`@Wrapper`，获取当前扩展点实例类型的构造器，传入当前实例构建包装类实例。
     2. 如果包含此注解，判断当前扩展点名称是否在`match`属性中并且不在`mismatches`属性中，按照**1**进行包裹。

6. 初始化

   如果扩展点实现了`Dubbo LifeCycle`, 执行`initialize`方法。

### 自适应扩展

自适应扩展又称为动态扩展,可以在运行时生成扩展对象。ExtensionLoader中的getAdaptiveExtension()方法,这个方法也是我们看到的第一个获取扩展对象的方法. ,这个方法可以帮助我们通过SPI机制从扩展文件中找到需要的扩展类型并创建它的对象, **自适应扩展:如果对设计模式比较了解的可能会联想到适配器模式**,自适应扩展其实就是适配器模式的思路,自适应扩展有两种策略:

- 一种是我们自己实现自适应扩展:然后使用@Adaptive修饰这个时候适配器的逻辑由我们自己实现,当扩展加载器去查找具体的扩展的时候可以通过找到我们这个对应的适配器扩展,然后适配器扩展帮忙去查询真正的扩展,这个比如我们下面要举的扩展注入器的例子,具体扩展通过扩展注入器适配器,注入器适配器来查询具体的注入器扩展实现来帮忙查找扩展。

  例如：

  ```java
  @Adaptive
  public class AdaptiveExtensionFactory implements ExtensionFactory {
  
      private final List<ExtensionFactory> factories;
  
      public AdaptiveExtensionFactory() {
          ExtensionLoader<ExtensionFactory> loader = ExtensionLoader.getExtensionLoader(ExtensionFactory.class);
          List<ExtensionFactory> list = new ArrayList<ExtensionFactory>();
          for (String name : loader.getSupportedExtensions()) {
              list.add(loader.getExtension(name));
          }
          factories = Collections.unmodifiableList(list);
      }
  
      @Override
      public <T> T getExtension(Class<T> type, String name) {
          for (ExtensionFactory factory : factories) {
              T extension = factory.getExtension(type, name);
              if (extension != null) {
                  return extension;
              }
          }
          return null;
      }
  }
  ```

- 还有一种方式是我们未实现这个自适应扩展,Dubbo在运行时通过字节码动态代理的方式在运行时生成一个适配器,使用这个适配器映射到具体的扩展. 第二种情况往往用在比如 Protocol、Cluster、LoadBalance 等。有时，有些拓展并不想在框架启动阶段被加载，而是希望在拓展方法被调用时，根据运行时参数进行加载。(如果还不了解可以考虑看下@Adaptive注解加载方法上面的时候扩展是如何加载的)。

  ```java
  @SPI(RandomLoadBalance.NAME)
  public interface LoadBalance {
  
      @Adaptive("loadbalance")
      <T> Invoker<T> select(List<Invoker<T>> invokers, URL url, Invocation invocation) throws RpcException;
  }
  ```

  上面的方法会在加载时生成自适应扩展类

  ```java
  public class LoadBalance$Adaptive implements LoadBalance {
    
    public Invoker select(List invokers, URL url, Invocation invocation) throws RpcException {
      if (invokers == null) 
        throw new IllegalArgumentException("url == null");
      if (url == null) 
        throw new IllegalArgumentException("invocation == null"); 
      String methodName = invocation.getMethodName();
      String extName = url.getMethodParameter(methodName, "loadbalance", "random");
      if(extName == null) 
        throw new IllegalStateException("Failed to get extension (org.apache.dubbo.rpc.cluster.LoadBalance)         			  								name from url (" + url.toString() + ") use keys([loadbalance])");
      LoadBalance extension =       						    			(LoadBalance)ExtensionLoader.getExtensionLoader(LoadBalance.class).getExtension(extName);
      return extension.select(invokers, url, invocation);
    }
  }
  ```

### 激活扩展

激活扩展指的是通过指定的条件激活扩展类，激活的扩展类可以出现多个。

```java
@Activate(group = {CONSUMER, PROVIDER}, value = CACHE_KEY)
public class CacheFilter implements Filter {}
```

该扩展在消费者和提供者同时生效，并且`URL`中出现`cache`参数次扩展点生效。

```java
@Activate(group = CommonConstants.PROVIDER, value = TOKEN_KEY)
public class TokenFilter implements Filter {}
```

该扩展仅在服务提供者生效，并且`URL`中出现`token`参数。

### 其他

<h4 id="declare-default-extension">1. 如何声明默认扩展点实现</h4>

使用`dubbo`提供的注解`@SPI`，并设置`value`属性，属性值不能为`true`。

```java
@SPI("custom")
public class CustomExtension {}
```

<h4 id="adaptive-extension-factory">2. 自适应扩展工厂</h4>

扩展点工厂`ExtensionFactory`包含三个扩展点实现：`AdaptiveExtensionFactory`、`SpringExtensionFactory`、`SpiExtensionFactory`。`ExtensionLoader`中默认获取的是`AdaptiveExtensionFactory`，该扩展点是一个自定义实现的扩展点适配工厂，实例化时会加载所有的扩展点工厂，并在加载扩展点时，依次从所有的扩展点工厂中查找扩展点，如果在某个扩展点工厂中找到对应的扩展点则返回目标扩展实例，未找到则继续在其他扩展点工厂中查找，未找到返回`null`。

需要注意的是，`Dubbo 2.x`默认不支持对扩展点工厂进行排序，因此无法控制加载扩展点时优先从`Spring`容器还是`Dubbo`中查找。
