---
title: SpringBoot源码分析
createTime: 2026/04/30 09:33:07
permalink: /java/spring/analyze-spring-boot-source/
aside: false
---

本文通过`SpringBoot`源码分析核心功能、源码实现及可用扩展点。

> [!TIP]
> 本文使用`SpringBoot`版本为`2.2.x`。

==222=={.important}

## 启动流程

1.使用`SpringApplication`启动

```java
public class Application {
  public static void main(String[] args) {
    ConfigurableApplicationContext context = SpringApplication.run(Application.class, args);
  }
}
```

## 自动装配

## Starters

<style>
mark.important {
  color: var(--vp-c-tip-1);
  font-family: var(--vp-font-family-mono);
  background-color: var(--vp-custom-block-tip-code-bg);
  padding: 3px 6px;
  border-radius: 4px;
  transition: color var(--vp-t-color), background-color var(--vp-t-color);
  font-weight: 400 !important;
}
</style>
