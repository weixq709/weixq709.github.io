---
title: spring异步切面支持
createTime: 2025/01/20 19:58:41
permalink: /article/g8747vh2/
---
某些场景下，我们希望异步执行业务方法，比如发送短信、邮件等，避免阻塞主线程，提高系统的吞吐量。本文将介绍，如何自定义注解实现类似`@Async`的功能，并解决异步切面中无法使用除环绕通知的其他通知类型的问题。

<!-- more -->

## 问题背景
假设有一个需求，需要在支持异步执行任务，同时业务方法上可使用其他切面注解，直接使用`@Aspect`定义切面并使用线程异步执行业务方法的方式，会导致排序在异步切面后的其他非环绕切面(环绕切面无此问题)无法获取`Invocation`对象，这是由于`ExposeInvocationInterceptor`被默认添加到第一个切面以暴露当前`Invocation`对象。即使使用`@Order`也无法改变切面顺序在`ExposeInvocationInterceptor`之前，因为`ExposeInvocationInterceptor`实现了`PriorityOrdered`接口，被此接口标记的bean会先于被`Ordered`标记的bean执行。

## 解决方案
为解决此问题，参考`AsyncExecutionInterceptor`、`AsyncAnnotationBeanPostProcessor`、`AsyncAnnotationAdvisor`，通过继承`AbstractBeanFactoryAwareAdvisingPostProcessor`提供开箱即用异步切面支持。

### 定义注解
```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface CustomTask {
  
}
```

### 定义切面
```java
import org.springframework.aop.interceptor.AsyncUncaughExceptionHandler;
import org.springframework.aop.scheduling.annotation.AsyncAnnotationAdvisor;

public class CustomTaskAnnotationAdvisor extends AsyncAnnotationAdvisor {
  public CustomTaskAnnotationAdvisor() {
    super(null, (Supplier)null);
    setAsyncAnnotationType(CustomTask.class);
  }

  @Override
  protected void buildAdvice(Supplier<Executor> executor, Supplier<AsyncUncaughtExceptionHandler> exceptionHandler) {
    return new CustomTaskInterceptor();
  }
}
```
```java
import org.aopalliance.intercept.MethodInterceptor;
import org.aopalliance.intercept.MethodInvocation;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.BeanFactoryAware;

public class CustomTaskInterceptor extends MethodInterceptor, BeanFactoryAware {

  private BeanFactory beanFactory;
  
  @Override
  public Object invoke(MethodInvocation invocation) throws Throwable {
    // do something
    // 异步切面，无需返回结果
    return null;
  }

  @Override
  public void setBeanFactory(BeanFactory beanFactory) throws BeansException {
    this.beanFactory = beanFactory;
  }
}
```

### 切面支持
```java
public class AsyncAdvisingSupportBeanPostProcessor 
  extends AbstractBeanFactoryAwareAdvisingPostProcessor {
  
  private AsyncAnnotationAdvisor asyncAdvisor;

  public AsyncAdvisingSupportBeanPostProcessor(AsyncAnnotationAdvisor advisor) {
    this.asyncAdvisor = advisor;
    this.setBeforeExistingAdvisors(true);
  }

  public void setBeanFactory(BeanFactory beanFactory) {
    super.setBeanFactory(beanFactory);
    this.advisor.setBeanFactory(beanFactory);
    this.advisor = this.asyncAdvisor;
  }
}
```

### 注册切面
```java
@Configuration
public class SystemConfig {

  @Bean
  public AsyncAdvisingSupportBeanPostProcessor asyncAnnotationBeanPostProcessor() {
    return new AsyncAdvisingSupportBeanPostProcessor(new CustomTaskAnnotationAdvisor());
  }
}
```
