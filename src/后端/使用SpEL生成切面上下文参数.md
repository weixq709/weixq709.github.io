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

首先，定义如下日志注解，从上下文中获取用户ID。
```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.FIELD})
public interface Log {
  
  /**
   * 默认从session中获取用户ID
   */
  String value() default "#session.userId";
}
```

接下来，定义注解切面。
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
    Class<?> clazz = joinPoint.getTarget().getClass();
    Method method = ((MethodSignature) joinPoint.getSignature()).getMethod();

    Log annotation = method.getAnnotation(Log.class);
    if(annotation == null) {
      // 方法注解优先级大于类注解
      annotation = clazz.getAnnotation(Log.class);
    }

    Object reuslt = null;
    try {
      result = joinPoint.proceed();
    } finally {
      // 构建session
      JSONObject session = null;
      // 构建请求参数
      JSONObject parameter = buildRequestParameters(method, joinPoint.getArgs());
      // 构建响应参数
      JSONObject returnValue = JSONObject.parseObject(
      Optional.ofNullable(reuslt).map(v -> JSONObject.toJSONString(v)).orElse("{}"));
      StantdardEvaluationContext context = buildContext(session, parameter, returnValue);
      
      SpelExpressionParser parser = new SpelExpressionParser();
      SpelExpression expression = parser.parseRaw(logAnnotaion.value());
      String userId = expression.getValue(context, String.class);
      // TODO 设置字段并保存日志记录
    }
  }

  private StantdardEvaluationContext buildContext(JSONObject session, 
                                                  JSONObject parameter, 
                                                  JSONObject returnValue) {
    StandardEvaluationContext context = new StandardEvaluationContext();
    context.setVariable("session", session)
    context.setVariable("parameter", parameter);
    context.setVariable("returnValue", returnValue);
    // 解决链式获取属性，父属性不存在报错问题
    context.setPropertyAccessors(new ArraryList<>(Arrays.asList(new SafetyMapAccessor())));
    return context;
  }

  private JSONObject buildRequestParameters(Mehtod method, Object[] args) {
    JSONObject parmas = new JSONObject();
    Parameter[] parameters = method.getParameters();

    if(args == null) {
      args = new Object[0];
    }

    for(int index = 0; i < parameters.length; index ++) {
      Parameter parameter = parameters[index];
      params.put(parameter.getName(), args[index]);
    }
    return parms;
  }

  private static class SafetyMapAccessor extends MapAccessor {

    public boolean canRead(EvaluationContext context, Object target, String name) {
      return target instanceof Map;
    }

    public TypedValue read(EvaluationContext context, Object target, String name) {
      if(target == null) {
        return TypedValue.NULL;
      }
      Map<?, ?> map = (Map) target;
      Object value = map.get(name);
      return value != null ? new TypedValue(value) : TypedValue.NULL;
    }
  }
}
```