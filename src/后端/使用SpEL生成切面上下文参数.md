---
title: 使用SpEL生成切面上下文参数
createTime: 2025/08/17 12:03:26
permalink: /article/use-spel-generate-aop-context/
tags:
  - java
  - springboot
  - SpEL
---

在面向切面编程（AOP）中，我们经常需要自定义切面来拦截方法来实现一些自定义操作，例如：记录操作日志。切面注解的属性值可能需要从方法调用的上下文（如方法参数、返回值、Session属性等）中动态获取。本文将利用SpEl自定义上下文，实现运行时在切面中支持使用SpEL表达式动态解析参数值。

<!-- more -->
Spring框架提供了强大的Spring表达式语言（SpEL），它可以用于在运行时解析表达式并从各种来源获取值。Spring Cache注解（如`@Cacheable`）就利用了SpEL来动态生成缓存键（key），例如：`@Cacheable(key = "#user.id")`。我们可以参考Spring Cache的方式，在自定义切面中利用SpEL来动态解析上下文参数。


```java
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.expression.Expression;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

@Aspect
@Component
public class LogAspect {

  @Around("@annotation(com.example.Log)")
  public Object saveLog(ProceedingJoinPoint joinPoint) throws Throwable {
    Method method = ((MethodSignature) joinPoint.getSignature()).getMethod();
    Log logAnnotation = method.getAnnotation(Log.class);
    String expressionStr = logAnnotation.value(); // 获取SpEL表达式

    // TODO
    return joinPoint.proceed();
  }
}
```