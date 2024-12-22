---
title: Spring单元测试日志断言
createTime: 2024/12/22 17:44:45
permalink: /article/5fo75ulk/
tags:
  - spring
  - 单元测试
---

在使用`springboot test`做单元测试时，我们需要根据输出的日志内容进行断言。但是，`spring`并没有直接提供可用的方式，本文将介绍如何在`spring`单元测试中根据日志输出内容进行断言。

<!-- more -->

## 1. 引入依赖

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <exclusions>
            <exclusion>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-logging</artifactId>
            </exclusion>
        </exclusions>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-log4j2</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
    </dependency>
</dependencies>

```

> [!TIP]
> 本文使用的是`log4j2`，如需使用`logback`或其他日志框架，请自行查看文档，继承对应框架的日志抽象类实现。

## 2. 实现自定义Appender
```java
import org.apache.logging.log4j.core.appender.AbstractAppender;
import org.apache.logging.log4j.core.config.Property;

public class MemoryAppender extends AbstractAppender {

  private List<String> messages = new ArrayList<>();

  protected MemoryAppender() {
      super("MemoryAppender", null, null, true, Property.EMPTY_ARRAY);
  }

  @Override
  public void append(LogEvent logEvent) {
      messages.add(logEvent.getMessage().getFormattedMessage());
  }

  public List<String> getMessages() {
      return messages;
  }
}
```

## 3. 注册自定义Appdener
```java
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.core.*;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.boot.test.context.SpringBootTest;
import java.util.ArrayList;
import java.util.List;

@SpringBootTest
public class LogCaptureTest {

  private static final org.slf4j.Logger LOGGER = 
                      LoggerFactory.getLogger(LogCaptureTest.class);

  @Test
  public void test() {
    Logger rootLogger = (Logger) LogManager.getRootLogger();
    LoggerContext context = rootLogger.getContext();
    MemoryAppender memoryAppender = new MemoryAppender();
    rootLogger.addAppender(memoryAppender);
    context.updateLoggers();

    LOGGER.info("Hello");
    System.out.println("messages: " + memoryAppender.getMessages());
    Assertions.assertTrue(memoryAppender.getMessages().contains("Hello"));
  }
}
```

