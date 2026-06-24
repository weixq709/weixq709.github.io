---
title: Maven使用教程
createTime: 2026/04/28 20:45:28
permalink: /82yrmmah/
---

## 什么是Maven

Maven 是 Apache 软件基金会下的一个开源项目，用于帮助开发者自动化构建过程、依赖管理和项目信息管理。通过使用标准的目录结构和配置文件（pom.xml），Maven 可以简化编译、打包、测试和部署等操作。

<ScenarioMatcher />

## 安装与配置

### 前置条件

- JDK: 1.8
- Maven: 3.9.9

### 下载与安装

**Windows**

1. 下载<a href="https://dlcdn.apache.org/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.zip">Apache Maven 3.9.9</a>。

2. 解压文件到指定目录，例如：D:\maven。

   文件结构如下

   ```file-tree
   .
   ├── bin
   │   └── mvn.cmd
   ├── conf
   │   └── settings.xml
   ├── lib
   └── …
   ```

3. 在**系统->系统信息->高级系统设置->环境变量->系统变量**中找到**Path**，添加D:\maven\bin。

4. 打开cmd，执行下面的命令

```sh
mvn -v
```

输出下面的内容说明安装成功

```sh
Apache Maven 3.9.9 (8e8579a9e76f7d015ee5ec7bfcdc97d260186937)
Maven home: D:\software\apache-maven-3.9.9
Java version: 1.8.0_421, vendor: Oracle Corporation, runtime: D:\software\java8\jre
Default locale: zh_CN, platform encoding: GBK
OS name: "windows 11", version: "10.0", arch: "amd64", family: "windows"
```

**Linux / Mac**

1. 下载<a href="https://dlcdn.apache.org/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.tar.gz">Apache Maven 3.9.9</a>。

2. 解压文件到指定目录，例如：/user/software/maven。

   ```sh
   # 解压文件
   tar -zxvf apache-maven-3.9.9-bin.tar.gz
   # 移动到安装目录
   mv apache-maven-3.9.9-bin /user/software/maven
   ```

3. 执行下面的命令。

   ```sh
   vi ~/.bashrc  # 或 vi ~/.zshrc
   ```

   在文件末尾添加

   ```sh
   export MAVEN_HOME=/usr/local/maven

   export PATH=$MAVEN_HOME/bin:$PATH
   ```

> [!TIP]
> 其他版本请查看<a href="https://maven.apache.org/docs/history.html">历史版本</a>。

### 常见配置

Maven 的配置文件为 `settings.xml`，位于 Maven 安装目录下的 `conf/settings.xml`（全局配置）或 `~/.m2/settings.xml`（用户配置，优先级更高）。

### 设置本地仓库

Maven 默认将依赖下载到 `~/.m2/repository`，可通过 `localRepository` 修改为自定义路径：

```xml
<settings>
  <localRepository>D:/maven/repository</localRepository>
</settings>
```

### 设置镜像源

默认从 Maven 中央仓库下载依赖，国内访问较慢，可替换为国内镜像。`mirrorOf` 为 `*` 表示代理所有仓库，设置为 `central` 则只代理中央仓库。

常用镜像源如下：

| 名称                   | URL                                                                |
| ---------------------- | ------------------------------------------------------------------ |
| Maven 中央仓库（官方） | `https://repo1.maven.org/maven2`                                   |
| 阿里云公共仓库         | `https://maven.aliyun.com/repository/public`                       |
| 腾讯云镜像             | `https://mirrors.cloud.tencent.com/nexus/repository/maven-public/` |
| 华为云镜像             | `https://repo.huaweicloud.com/repository/maven/`                   |

```xml
<settings>
  <mirrors>
    <!-- 阿里云镜像（推荐） -->
    <mirror>
      <id>aliyunmaven</id>
      <name>阿里云公共仓库</name>
      <url>https://maven.aliyun.com/repository/public</url>
      <mirrorOf>*</mirrorOf>
    </mirror>
  </mirrors>
</settings>
```

### 授权认证

访问私有仓库（如 Nexus、Artifactory）时，需在 `settings.xml` 中配置凭证。`server` 的 `id` 必须与 `pom.xml` 或 `mirrors` 中的仓库 `id` 一致。

**HTTP 用户名/密码认证**（最常见，适用于 Nexus、Artifactory 等）：

```xml
<settings>
  <servers>
    <server>
      <id>my-nexus</id>
      <username>admin</username>
      <password>admin123</password>
    </server>
  </servers>
</settings>
```

密码支持 Maven 加密存储，执行 `mvn --encrypt-password <password>` 获取密文后填入 `<password>` 字段。

**SSH 私钥认证**（适用于通过 SSH 协议部署到远程服务器，常见于 `scp://` 或 `sftp://` 类型的 distributionManagement）：

```xml
<settings>
  <servers>
    <server>
      <id>my-ssh-server</id>
      <username>deploy</username>
      <!-- 私钥文件路径，默认为 ~/.ssh/id_rsa -->
      <privateKey>/home/deploy/.ssh/id_rsa</privateKey>
      <!-- 私钥有密码时填写，无密码则删除此行 -->
      <passphrase>your_passphrase</passphrase>
    </server>
  </servers>
</settings>
```

### 激活 Profile

Profile 可以为不同环境（开发、测试、生产）提供不同的配置，通过 `activeProfiles` 指定默认激活的 Profile：

```xml
<settings>
  <profiles>
    <profile>
      <id>dev</id>
      <properties>
        <env>development</env>
      </properties>
      <repositories>
        <repository>
          <id>my-nexus</id>
          <url>http://nexus.example.com/repository/maven-public/</url>
          <releases><enabled>true</enabled></releases>
          <snapshots><enabled>true</enabled></snapshots>
        </repository>
      </repositories>
    </profile>
  </profiles>

  <activeProfiles>
    <activeProfile>dev</activeProfile>
  </activeProfiles>
</settings>
```

也可以在执行命令时通过 `-P` 参数临时激活指定 Profile：

```sh
mvn clean install -P dev
```

### 完整配置

以下是一份可直接使用的 `settings.xml`，将其放在 `~/.m2/settings.xml` 即可生效。私有仓库认证部分已注释，按需取消注释并修改。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.2.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.2.0
            https://maven.apache.org/xsd/settings-1.2.0.xsd">

  <!-- 本地仓库路径，默认为 ~/.m2/repository -->
  <localRepository>D:/maven/repository</localRepository>

  <mirrors>
    <!-- 阿里云镜像，代理所有仓库 -->
    <mirror>
      <id>aliyunmaven</id>
      <name>阿里云公共仓库</name>
      <url>https://maven.aliyun.com/repository/public</url>
      <mirrorOf>*</mirrorOf>
    </mirror>
  </mirrors>

  <servers>
    <!--
      私有仓库 HTTP 认证（如 Nexus/Artifactory）
      id 需与 pom.xml 中的仓库 id 或上方 mirror 的 id 保持一致
      ===================== 按需修改 =====================
    <server>
      <id>my-nexus</id>
      <username>admin</username>
      <password>admin123</password>
    </server>
    -->

    <!--
      SSH 私钥认证（用于 scp/sftp 部署场景）
      ===================== 按需修改 =====================
    <server>
      <id>my-ssh-server</id>
      <username>deploy</username>
      <privateKey>/home/deploy/.ssh/id_rsa</privateKey>
      <passphrase>your_passphrase</passphrase>
    </server>
    -->
  </servers>

  <profiles>
    <profile>
      <id>default</id>
      <properties>
        <!-- 默认编码 -->
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
      </properties>
    </profile>
  </profiles>

  <activeProfiles>
    <activeProfile>default</activeProfile>
  </activeProfiles>

</settings>
```

## 核心概念

### 坐标

Maven 用一组坐标唯一标识仓库中的每个构件，由三个必填字段组成：

```xml
<groupId>org.springframework.boot</groupId>    <!-- 组织/项目名，通常为包名倒写 -->
<artifactId>spring-boot-starter-web</artifactId> <!-- 模块名 -->
<version>3.3.0</version>                        <!-- 版本号 -->
```

可选字段：

- `packaging`：打包类型，默认 `jar`，可选 `war`、`pom` 等
- `classifier`：附加标识，如 `sources`、`javadoc`

### POM

POM（Project Object Model）是 Maven 项目的核心配置文件 `pom.xml`，描述项目的元信息、依赖、构建配置等。每个 Maven 项目有且仅有一个 `pom.xml`。

所有 `pom.xml` 都隐式继承自 **Super POM**（Maven 内置的顶层 POM），它定义了默认的仓库地址、目录结构、插件版本等约定，这也是 Maven"约定优于配置"的基础。

一份典型的 `pom.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
           https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <!-- 项目坐标 -->
  <groupId>com.example</groupId>
  <artifactId>my-app</artifactId>
  <version>1.0.0-SNAPSHOT</version>
  <packaging>jar</packaging>

  <!-- 属性，可在 pom 中通过 ${property} 引用 -->
  <properties>
    <java.version>17</java.version>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>

  <!-- 依赖 -->
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
      <version>3.3.0</version>
    </dependency>
  </dependencies>
</project>
```

### BOM

BOM（Bill of Materials）是一种特殊的 POM，`packaging` 为 `pom`，专门用于集中管理一组相关依赖的版本号，让使用方引入依赖时无需再指定版本。

**引入 BOM**：在 `<dependencyManagement>` 中以 `import` scope 引入：

```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-dependencies</artifactId>
      <version>3.3.0</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>
```

引入后，`<dependencies>` 中声明 Spring Boot 生态的依赖就不必再写版本号：

```xml
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <!-- 版本由 BOM 统一管理 -->
  </dependency>
</dependencies>
```

### 依赖管理

**`<dependencyManagement>`** 用于在父 POM 中声明依赖的版本和 scope，子模块继承后直接引用无需重复指定版本，实现多模块项目的版本统一管理。与直接写在 `<dependencies>` 中不同，`<dependencyManagement>` 中的声明不会自动引入依赖，只是"锁版本"。

```xml
<!-- 父 POM -->
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>com.fasterxml.jackson.core</groupId>
      <artifactId>jackson-databind</artifactId>
      <version>2.17.1</version>
    </dependency>
  </dependencies>
</dependencyManagement>
```

```xml
<!-- 子模块 POM，无需写版本 -->
<dependencies>
  <dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
  </dependency>
</dependencies>
```

**依赖传递**：引入一个依赖时，该依赖自身的依赖也会被自动引入，形成依赖树。可用 `mvn dependency:tree` 查看完整依赖树。

**依赖冲突解决**：当依赖树中存在同一构件的不同版本时，Maven 按以下规则选择：

- **最短路径优先**：依赖树中路径更短的版本优先
- **声明顺序优先**：路径相同时，`pom.xml` 中先声明的优先

如需强制指定版本，在当前项目的 `<dependencies>` 中直接声明即可覆盖传递依赖的版本。

### 依赖范围

`scope` 控制依赖在哪些阶段的 classpath 中可用：

| scope             | 编译 | 测试 | 运行 | 说明                                     |
| ----------------- | :--: | :--: | :--: | ---------------------------------------- |
| `compile`（默认） |  ✅  |  ✅  |  ✅  | 会打入最终包                             |
| `provided`        |  ✅  |  ✅  |  ❌  | 运行时由容器提供，如 `servlet-api`       |
| `runtime`         |  ❌  |  ✅  |  ✅  | 编译不需要，运行需要，如 JDBC 驱动       |
| `test`            |  ❌  |  ✅  |  ❌  | 仅测试用，如 JUnit，不会打入最终包       |
| `system`          |  ✅  |  ✅  |  ❌  | 类似 `provided`，需手动指定本地路径      |
| `import`          |  —   |  —   |  —   | 仅用于 `<dependencyManagement>` 导入 BOM |

### 仓库

Maven 按以下顺序查找依赖：

**本地仓库** → **远程仓库（私服 / 中央仓库）**

- **本地仓库**：`~/.m2/repository`，下载过的构件缓存在此，优先使用
- **私服**：企业内部搭建的 Nexus / Artifactory，缓存外部依赖，也托管内部构件
- **中央仓库**：`https://repo1.maven.org/maven2`，Maven 官方维护的公共仓库

在 `pom.xml` 中可添加额外的远程仓库：

```xml
<repositories>
  <repository>
    <id>my-nexus</id>
    <url>http://nexus.example.com/repository/maven-public/</url>
    <releases><enabled>true</enabled></releases>
    <snapshots><enabled>true</enabled></snapshots>
  </repository>
</repositories>
```

### 生命周期

Maven 定义了三套相互独立的生命周期，每套生命周期由一组有序的阶段（phase）构成，执行某个阶段时，该阶段之前的所有阶段会依次自动执行。

| 生命周期  | 说明                                           |
| --------- | ---------------------------------------------- |
| `default` | 核心生命周期，负责项目的编译、测试、打包、部署 |
| `clean`   | 清理生命周期，删除上一次构建产生的文件         |
| `site`    | 站点生命周期，生成项目文档站点                 |

#### clean 生命周期

| 阶段         | 说明                |
| ------------ | ------------------- |
| `pre-clean`  | 清理前的准备工作    |
| `clean`      | 删除 `target/` 目录 |
| `post-clean` | 清理后的收尾工作    |

#### default 生命周期

default 生命周期包含 23 个阶段，日常最常用的如下：

| 阶段                      | 说明                                       |
| ------------------------- | ------------------------------------------ |
| `validate`                | 验证项目结构和必要信息是否完整             |
| `initialize`              | 初始化构建状态，如设置属性、创建目录       |
| `generate-sources`        | 生成源代码（如 APT、proto 等代码生成插件） |
| `process-sources`         | 处理源代码（如过滤资源变量）               |
| `generate-resources`      | 生成资源文件                               |
| `process-resources`       | 将资源文件复制到 `target/classes`          |
| `compile`                 | 编译源代码到 `target/classes`              |
| `process-classes`         | 对编译结果进行后处理（如字节码增强）       |
| `generate-test-sources`   | 生成测试源代码                             |
| `process-test-sources`    | 处理测试源代码                             |
| `generate-test-resources` | 生成测试资源文件                           |
| `process-test-resources`  | 将测试资源复制到 `target/test-classes`     |
| `test-compile`            | 编译测试代码到 `target/test-classes`       |
| `process-test-classes`    | 对测试编译结果进行后处理                   |
| `test`                    | 运行单元测试（使用 Surefire 插件）         |
| `prepare-package`         | 打包前的准备工作                           |
| `package`                 | 将编译结果打包为 jar/war 等                |
| `pre-integration-test`    | 集成测试前的准备（如启动服务器）           |
| `integration-test`        | 运行集成测试                               |
| `post-integration-test`   | 集成测试后的收尾（如停止服务器）           |
| `verify`                  | 验证包是否有效、符合质量标准               |
| `install`                 | 将包安装到本地仓库，供本地其他项目使用     |
| `deploy`                  | 将包发布到远程仓库                         |

> [!TIP]
> 执行 `mvn package` 时，`validate` → `compile` → `test` → `package` 各阶段会依次执行。如需跳过测试，可加 `-DskipTests`。

#### site 生命周期

| 阶段          | 说明                 |
| ------------- | -------------------- |
| `pre-site`    | 生成站点前的准备工作 |
| `site`        | 生成项目文档站点     |
| `post-site`   | 生成后的收尾工作     |
| `site-deploy` | 将站点部署到服务器   |

### 多模块项目

大型项目通常拆分为多个子模块，由一个父 POM 统一管理。父 POM 的 `packaging` 必须为 `pom`：

```xml
<!-- 父 POM -->
<groupId>com.example</groupId>
<artifactId>my-parent</artifactId>
<version>1.0.0</version>
<packaging>pom</packaging>

<modules>
  <module>my-api</module>
  <module>my-service</module>
  <module>my-web</module>
</modules>
```

子模块通过 `<parent>` 继承父 POM：

```xml
<!-- 子模块 POM -->
<parent>
  <groupId>com.example</groupId>
  <artifactId>my-parent</artifactId>
  <version>1.0.0</version>
</parent>

<artifactId>my-service</artifactId>
```

在父目录执行 `mvn install` 会按模块依赖顺序依次构建所有子模块。

## 插件

## 命令及参数
