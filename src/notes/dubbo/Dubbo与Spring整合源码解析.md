---
title: Dubbo与Spring整合源码解析
createTime: 2025/01/12 22:48:12
permalink: /dubbo/dubbo-integration-spring/
---
Dubbo是一个RPC框架，通常需要结合Spring进行使用。本文将说明Dubbo如何利用Spring扩展点与Dubbo进行整合。

## 整合入口
Dubbo提供了`@EnableDubbo`注解用于快速在Spring项目中与Dubbo进行整合。`@EnableDubbo`内部包括两个注解：`@EnableDubboConfig`和`@DubboComponentScan`，其作用分别为**生成Dubbo配置类**
和**Dubbo Bean扫描**。

### 1. 生成Dubbo配置类
`@EnableDubboConfig`注解通过`@Import`注解属性值`DubboConfigConfigurationRegistrar`引入`DubboConfigConfiguration.Single`或`DubboConfigConfiguration.Multiple`配置类Bean，默认情况下，因`@EnableDubbo`的value属性值为true，支持在配置文件中声明同一类型的多个配置属性。例如：

```properties
# 支持Dubbo协议
dubbo.protocols.p1.id = dubbo
dubbo.protocols.p2.name = dubbo
dubbo.protocols.p1.port = 20880

# 支持rest协议
dubbo.protocols.p1.id = rest
dubbo.protocols.p2.name = rest
dubbo.protocols.p1.port = 20881
```

如果配置`@EnableDubbo#value`为false，仅允许支持单个配置
```properties
dubbo.protocol.name = dubbo
dubbo.protocol.port = 20880
```

`DubboConfigConfiguration.Single`和`DubboConfigConfiguration.Multiple`都被`EnableConfigurationBeanBindings`注解，每个属性值表示一类配置，例如：
```java
@EnableConfigurationBeanBinding(prefix = "dubbo.applications", type = ApplicationConfig.class, multiple = true)
```
> [!TIP]
> 此配置仅在multipe属性为true时生效。

`EnableConfigurationBeanBindings`通过`ConfigurationBeanBindingsRegister`进行解析。对于注解内部的单个`EnableConfigurationBeanBinding`，都会生成一个配置Bean对应Dubbo中10种全局配置类。



## Dubbo Bean扫描
## 服务导入
## 服务导出