---
title: springboot解析yaml配置文件
createTime: 2024/10/09 10:59:26
permalink: /article/8kykzwya/
# 摘要
excerpt: 在 Spring Boot 中，YAML 配置文件提供了一种结构化的方式来管理应用配置。使用 .yml 或 .yaml 文件，开发者可以定义层次化的配置，如数据库连接和自定义属性。Spring Boot 自动加载 application.yml 文件，并通过 @ConfigurationProperties 注解将配置映射到 Java 对象上，提升可读性并减少配置错误，非常适合大型应用。
---

配置步骤：

- 在 `src/main/resources` 目录下创建 `test.yml` 文件。
- 添加配置项，例如：

```yaml
test:
  name: zhangsan
  age: 18
  city: hangzhou
```

- 创建一个自定义的 `YamlPropertySourceFactory` 类，用于加载 YAML 文件，例如：

```java
import org.springframework.boot.env.YamlPropertySourceLoader;
import org.springframework.core.env.PropertySource;
import org.springframework.core.io.support.EncodedResource;
import org.springframework.core.io.support.PropertySourceFactory;

import java.io.IOException;
import java.util.Objects;

public class YamlPropertySourceFactory implements PropertySourceFactory {

  @Override
  public PropertySource<?> createPropertySource(String name, EncodedResource resource) throws IOException {
    String resourceName = Optional.ofNullable(name).orElse(resource.getResource().getFilename());
    List<PropertySource<?>> yamlSources = new YamlPropertySourceLoader().load(resourceName, resource.getResource());
    return yamlSources.get(0);
  }
}
```

- 创建一个 Java 类，用于映射配置项，例如：

```java
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "test")
@PropertySource(value = "classpath:test.yaml", factory = YamlPropertySourceFactory.class)
public class TestProperties {
    private String name;
    private int age;
    private String city;

    // getter 和 setter 方法
}
```
