---
title: Maven使用教程
createTime: 2026/04/28 20:45:28
permalink: /java/maven-guide/
---

## 什么是Maven {#what-is-maven}

Maven 是 Apache 软件基金会下的一个开源项目，用于帮助开发者自动化构建过程、依赖管理和项目信息管理。通过使用标准的目录结构和配置文件（pom.xml），Maven 可以简化编译、打包、测试和部署等操作。

## 安装与配置 {#installation-and-configuration}

### 前置条件 {#prerequisites}

- JDK: 1.8
- Maven: 3.9.9

### 下载与安装 {#download-and-installation}

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
   ├── lib/
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

### 常见配置 {#common-configuration}

Maven 的配置文件为 `settings.xml`，位于 Maven 安装目录下的 `conf/settings.xml`（全局配置）或 `~/.m2/settings.xml`（用户配置，优先级更高）。

### 设置本地仓库 {#setting-local-repository}

Maven 默认将依赖下载到 `~/.m2/repository`，可通过 `localRepository` 修改为自定义路径：

```xml
<settings>
  <localRepository>D:/maven/repository</localRepository>
</settings>
```

### 设置镜像源 {#setting-mirrors}

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

### 授权认证 {#authentication}

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

### 激活 Profile {#activate-profile}

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

## 核心概念 {#core-concept}

### 坐标 {#coordinates}

Maven 用一组坐标唯一标识仓库中的每个构件，由三个必填字段组成：

```xml
<groupId>org.springframework.boot</groupId>    <!-- 组织/项目名，通常为包名倒写 -->
<artifactId>spring-boot-starter-web</artifactId> <!-- 模块名 -->
<version>3.3.0</version>                        <!-- 版本号 -->
```

可选字段：

- `packaging`：打包类型，默认 `jar`，可选 `war`、`pom` 等
- `classifier`：附加标识，如 `sources`、`javadoc`

### POM {#pom}

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

### 依赖管理 {#dependency-management}

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

### 依赖范围 {#scope-range}

`scope` 控制依赖在哪些阶段的 classpath 中可用：

| scope             | 编译 | 测试 | 运行 | 说明                                     |
| ----------------- | :--: | :--: | :--: | ---------------------------------------- |
| `compile`（默认） |  ✅  |  ✅  |  ✅  | 会打入最终包                             |
| `provided`        |  ✅  |  ✅  |  ❌  | 运行时由容器提供，如 `servlet-api`       |
| `runtime`         |  ❌  |  ✅  |  ✅  | 编译不需要，运行需要，如 JDBC 驱动       |
| `test`            |  ❌  |  ✅  |  ❌  | 仅测试用，如 JUnit，不会打入最终包       |
| `system`          |  ✅  |  ✅  |  ❌  | 类似 `provided`，需手动指定本地路径      |
| `import`          |  —   |  —   |  —   | 仅用于 `<dependencyManagement>` 导入 BOM |

### 仓库 {#repository}

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

### 生命周期 {#life-cycle}

Maven 定义了三套相互独立的生命周期，每套生命周期由一组有序的阶段（phase）构成，执行某个阶段时，该阶段之前的所有阶段会依次自动执行。

| 生命周期  | 说明                                           |
| --------- | ---------------------------------------------- |
| `default` | 核心生命周期，负责项目的编译、测试、打包、部署 |
| `clean`   | 清理生命周期，删除上一次构建产生的文件         |
| `site`    | 站点生命周期，生成项目文档站点                 |

#### clean 生命周期 #{clean-lifecycle}

| 阶段         | 说明                |
| ------------ | ------------------- |
| `pre-clean`  | 清理前的准备工作    |
| `clean`      | 删除 `target/` 目录 |
| `post-clean` | 清理后的收尾工作    |

#### default 生命周期 {#default-lifecycle}

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

#### site 生命周期 {#site-lifecycle}

| 阶段          | 说明                 |
| ------------- | -------------------- |
| `pre-site`    | 生成站点前的准备工作 |
| `site`        | 生成项目文档站点     |
| `post-site`   | 生成后的收尾工作     |
| `site-deploy` | 将站点部署到服务器   |

### 多模块项目 {#multi-project}

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

## 插件 {#plugins}

Maven 插件是构建过程的执行者，每个生命周期阶段的具体工作都由插件的 **Goal（目标）** 完成。插件绑定到生命周期阶段后，执行到该阶段时会自动触发对应 Goal。

插件坐标格式：`groupId:artifactId:version`，在 `pom.xml` 的 `<build><plugins>` 中配置。

### 常见内置插件 {#common-plugins}

Maven 默认绑定了一套核心插件，无需显式声明即可使用，但可以覆盖配置调整行为。

#### maven-compiler-plugin

控制 Java 源码的编译版本和编码。

```xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-compiler-plugin</artifactId>
  <version>3.13.0</version>
  <configuration>
    <!-- Java 17 及以上推荐用 release 代替 source/target -->
    <release>17</release>
    <encoding>UTF-8</encoding>
    <!-- 开启增量编译（默认已开启） -->
    <useIncrementalCompilation>true</useIncrementalCompilation>
    <!-- 传递额外的编译器参数 -->
    <compilerArgs>
      <arg>-parameters</arg>
    </compilerArgs>
  </configuration>
</plugin>
```

#### maven-surefire-plugin

负责运行单元测试（绑定到 `test` 阶段），支持 JUnit 4/5、TestNG。

```xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-surefire-plugin</artifactId>
  <version>3.3.0</version>
  <configuration>
    <!-- 跳过测试 -->
    <!-- <skipTests>true</skipTests> -->

    <!-- 并行执行测试 -->
    <parallel>methods</parallel>
    <threadCount>4</threadCount>

    <!-- 排除某些测试类 -->
    <excludes>
      <exclude>**/*IntegrationTest.java</exclude>
    </excludes>

    <!-- 测试失败后继续执行 -->
    <testFailureIgnore>false</testFailureIgnore>

    <!-- 传递 JVM 参数 -->
    <argLine>-Xmx512m -Dfile.encoding=UTF-8</argLine>
  </configuration>
</plugin>
```

#### maven-jar-plugin

将编译结果打包为 JAR，并可配置 `MANIFEST.MF`。

```xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-jar-plugin</artifactId>
  <version>3.4.1</version>
  <configuration>
    <archive>
      <manifest>
        <!-- 指定可执行 JAR 的入口类 -->
        <mainClass>com.example.Main</mainClass>
        <!-- 将依赖坐标写入 MANIFEST.MF 的 Class-Path -->
        <addClasspath>true</addClasspath>
        <classpathPrefix>lib/</classpathPrefix>
      </manifest>
      <manifestEntries>
        <!-- 自定义 MANIFEST 属性 -->
        <Build-Time>${maven.build.timestamp}</Build-Time>
      </manifestEntries>
    </archive>
    <!-- 排除不需要打入 JAR 的文件 -->
    <excludes>
      <exclude>**/*.xml</exclude>
    </excludes>
  </configuration>
</plugin>
```

#### maven-war-plugin

将 Web 项目打包为 WAR，用于部署到 Tomcat 等容器。

```xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-war-plugin</artifactId>
  <version>3.4.0</version>
  <configuration>
    <!-- WAR 包名（默认为 artifactId-version） -->
    <warName>myapp</warName>
    <!-- Web 资源目录（默认为 src/main/webapp） -->
    <webResources>
      <resource>
        <directory>src/main/resources</directory>
        <targetPath>WEB-INF/classes</targetPath>
      </resource>
    </webResources>
    <!-- 排除 scope 为 provided 的依赖（容器已提供） -->
    <packagingExcludes>WEB-INF/lib/servlet-api*.jar</packagingExcludes>
  </configuration>
</plugin>
```

#### maven-resources-plugin

控制资源文件的复制和变量过滤（将 `${...}` 占位符替换为实际值）。

```xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-resources-plugin</artifactId>
  <version>3.3.1</version>
  <configuration>
    <encoding>UTF-8</encoding>
  </configuration>
</plugin>
```

开启资源过滤需在 `<resources>` 中声明：

```xml
<build>
  <resources>
    <resource>
      <directory>src/main/resources</directory>
      <!-- 开启 ${} 变量替换 -->
      <filtering>true</filtering>
      <!-- 只过滤指定文件类型 -->
      <includes>
        <include>**/*.properties</include>
        <include>**/*.yml</include>
      </includes>
    </resource>
  </resources>
</build>
```

#### maven-clean-plugin

清理构建产物，默认删除 `target/` 目录。

```xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-clean-plugin</artifactId>
  <version>3.4.0</version>
  <configuration>
    <filesets>
      <!-- 额外清理指定目录 -->
      <fileset>
        <directory>logs</directory>
        <includes>
          <include>**/*.log</include>
        </includes>
      </fileset>
    </filesets>
  </configuration>
</plugin>
```

#### maven-deploy-plugin

将构件发布到远程仓库（绑定到 `deploy` 阶段）。

```xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-deploy-plugin</artifactId>
  <version>3.1.2</version>
  <configuration>
    <!-- 跳过 deploy（多模块中某个子模块不需要发布时使用） -->
    <skip>false</skip>
  </configuration>
</plugin>
```

配合 `pom.xml` 中的 `<distributionManagement>` 使用：

```xml
<distributionManagement>
  <repository>
    <id>my-nexus-releases</id>
    <url>http://nexus.example.com/repository/maven-releases/</url>
  </repository>
  <snapshotRepository>
    <id>my-nexus-snapshots</id>
    <url>http://nexus.example.com/repository/maven-snapshots/</url>
  </snapshotRepository>
</distributionManagement>
```

### 常见第三方插件 {#third-party-plugins}

#### spring-boot-maven-plugin

Spring Boot 项目专用，打包可执行 Fat JAR，内嵌 Tomcat 等容器。

```xml
<plugin>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-maven-plugin</artifactId>
  <version>3.3.0</version>
  <configuration>
    <!-- 指定主类（通常自动检测，多主类时手动指定） -->
    <mainClass>com.example.Application</mainClass>
    <!-- 排除不需要打入包的依赖 -->
    <excludes>
      <exclude>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
      </exclude>
    </excludes>
    <!-- 分层打包，优化 Docker 镜像构建缓存 -->
    <layers>
      <enabled>true</enabled>
    </layers>
  </configuration>
  <executions>
    <execution>
      <goals>
        <!-- repackage: 将普通 JAR 重新打包为可执行 Fat JAR -->
        <goal>repackage</goal>
      </goals>
    </execution>
  </executions>
</plugin>
```

常用命令：

```sh
# 打包为可执行 JAR
mvn spring-boot:repackage

# 直接运行应用
mvn spring-boot:run

# 构建 Docker 镜像（需配置 image）
mvn spring-boot:build-image
```

#### maven-shade-plugin

将项目及其所有依赖合并为一个 Uber JAR（Fat JAR），支持类重定位以解决依赖冲突。

```xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-shade-plugin</artifactId>
  <version>3.6.0</version>
  <executions>
    <execution>
      <phase>package</phase>
      <goals>
        <goal>shade</goal>
      </goals>
      <configuration>
        <transformers>
          <!-- 设置可执行 JAR 入口类 -->
          <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
            <mainClass>com.example.Main</mainClass>
          </transformer>
          <!-- 合并 META-INF/services 文件（SPI 机制） -->
          <transformer implementation="org.apache.maven.plugins.shade.resource.ServicesResourceTransformer"/>
          <!-- 合并 Spring 配置文件（Spring 项目必须） -->
          <transformer implementation="org.apache.maven.plugins.shade.resource.AppendingTransformer">
            <resource>META-INF/spring.handlers</resource>
          </transformer>
        </transformers>
        <!-- 类重定位：解决依赖中同名类冲突 -->
        <relocations>
          <relocation>
            <pattern>com.google.guava</pattern>
            <shadedPattern>com.example.shaded.guava</shadedPattern>
          </relocation>
        </relocations>
        <!-- 排除不需要打入的依赖 -->
        <artifactSet>
          <excludes>
            <exclude>junit:junit</exclude>
          </excludes>
        </artifactSet>
      </configuration>
    </execution>
  </executions>
</plugin>
```

#### maven-assembly-plugin

创建自定义格式的分发包（zip、tar.gz 等），支持按描述符灵活控制内容。

```xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-assembly-plugin</artifactId>
  <version>3.7.1</version>
  <configuration>
    <!-- 使用内置描述符：jar-with-dependencies / bin / src / project -->
    <descriptorRefs>
      <descriptorRef>jar-with-dependencies</descriptorRef>
    </descriptorRefs>
    <!-- 或使用自定义描述符文件 -->
    <!-- <descriptors>
      <descriptor>src/assembly/distribution.xml</descriptor>
    </descriptors> -->
    <archive>
      <manifest>
        <mainClass>com.example.Main</mainClass>
      </manifest>
    </archive>
  </configuration>
  <executions>
    <execution>
      <id>make-assembly</id>
      <phase>package</phase>
      <goals>
        <goal>single</goal>
      </goals>
    </execution>
  </executions>
</plugin>
```

#### jacoco-maven-plugin

统计单元测试覆盖率，生成 HTML 报告，可配置覆盖率阈值在 CI 中做质量门禁。

```xml
<plugin>
  <groupId>org.jacoco</groupId>
  <artifactId>jacoco-maven-plugin</artifactId>
  <version>0.8.12</version>
  <executions>
    <!-- 在测试前准备 JaCoCo Agent -->
    <execution>
      <id>prepare-agent</id>
      <goals>
        <goal>prepare-agent</goal>
      </goals>
    </execution>
    <!-- 在测试后生成覆盖率报告 -->
    <execution>
      <id>report</id>
      <phase>verify</phase>
      <goals>
        <goal>report</goal>
      </goals>
    </execution>
    <!-- 可选：检查覆盖率阈值，不达标则构建失败 -->
    <execution>
      <id>check</id>
      <goals>
        <goal>check</goal>
      </goals>
      <configuration>
        <rules>
          <rule>
            <element>BUNDLE</element>
            <limits>
              <limit>
                <counter>LINE</counter>
                <value>COVEREDRATIO</value>
                <minimum>0.80</minimum>
              </limit>
            </limits>
          </rule>
        </rules>
      </configuration>
    </execution>
  </executions>
  <configuration>
    <!-- 排除不需要统计的类 -->
    <excludes>
      <exclude>com/example/generated/**</exclude>
      <exclude>**/*Config.class</exclude>
    </excludes>
  </configuration>
</plugin>
```

生成报告后，用浏览器打开 `target/site/jacoco/index.html` 查看覆盖率详情。

#### checkstyle-maven-plugin

检查代码风格，不符合规范时可使构建失败，常用于 CI 强制代码规范。

```xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-checkstyle-plugin</artifactId>
  <version>3.4.0</version>
  <configuration>
    <!-- 使用内置规则集：sun_checks.xml / google_checks.xml -->
    <configLocation>google_checks.xml</configLocation>
    <!-- 或使用项目内自定义规则 -->
    <!-- <configLocation>checkstyle.xml</configLocation> -->
    <encoding>UTF-8</encoding>
    <!-- 发现违规时使构建失败 -->
    <failsOnError>true</failsOnError>
    <!-- 违规数量超过阈值才失败 -->
    <maxAllowedViolations>0</maxAllowedViolations>
  </configuration>
  <executions>
    <execution>
      <id>validate</id>
      <phase>validate</phase>
      <goals>
        <goal>check</goal>
      </goals>
    </execution>
  </executions>
</plugin>
```

#### versions-maven-plugin

批量管理 POM 中的版本号，适合多模块项目统一升版本。

```xml
<plugin>
  <groupId>org.codehaus.mojo</groupId>
  <artifactId>versions-maven-plugin</artifactId>
  <version>2.17.1</version>
</plugin>
```

常用命令：

```sh
# 查看有新版本的依赖
mvn versions:display-dependency-updates

# 查看有新版本的插件
mvn versions:display-plugin-updates

# 统一修改项目版本号
mvn versions:set -DnewVersion=2.0.0

# 确认修改（删除备份文件）
mvn versions:commit

# 回滚修改
mvn versions:revert
```

#### exec-maven-plugin

在构建过程中执行 Java 类或外部程序。

```xml
<plugin>
  <groupId>org.codehaus.mojo</groupId>
  <artifactId>exec-maven-plugin</artifactId>
  <version>3.3.0</version>
  <configuration>
    <mainClass>com.example.Main</mainClass>
    <arguments>
      <argument>--profile</argument>
      <argument>dev</argument>
    </arguments>
    <systemProperties>
      <systemProperty>
        <key>env</key>
        <value>test</value>
      </systemProperty>
    </systemProperties>
  </configuration>
</plugin>
```

常用命令：

```sh
# 运行 Java 主类（使用项目依赖的 classpath）
mvn exec:java

# 执行外部命令
mvn exec:exec -Dexec.executable="python3" -Dexec.args="script.py"
```

### 自定义插件 {#custom-plugin}

当内置和第三方插件无法满足特定需求时，可以开发自定义 Maven 插件。

#### 所需依赖 {#requires-dependencies}

创建一个标准的 Maven 项目，`packaging` 设为 `maven-plugin`，并引入以下依赖：

| 依赖 | 说明 |
| ---- | ---- |
| `maven-plugin-api` | 插件 API，提供 `Mojo` 基类和核心接口 |
| `maven-plugin-annotations` | 提供 `@Mojo`、`@Parameter`、`@Component` 等注解 |
| `maven-project`（可选） | 访问 `MavenProject`，获取 POM 信息和源目录 |
| `maven-plugin-plugin` | 从注解生成插件描述符（`plugin.xml`） |

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project>
  <modelVersion>4.0.0</modelVersion>

  <groupId>com.example</groupId>
  <artifactId>hello-maven-plugin</artifactId>
  <version>1.0.0</version>
  <!-- 必须为 maven-plugin -->
  <packaging>maven-plugin</packaging>

  <properties>
    <maven.compiler.release>11</maven.compiler.release>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>

  <dependencies>
    <!-- 插件核心 API -->
    <dependency>
      <groupId>org.apache.maven</groupId>
      <artifactId>maven-plugin-api</artifactId>
      <version>3.9.6</version>
      <scope>provided</scope>
    </dependency>
    <!-- 注解支持（@Mojo、@Parameter 等） -->
    <dependency>
      <groupId>org.apache.maven.plugin-tools</groupId>
      <artifactId>maven-plugin-annotations</artifactId>
      <version>3.13.1</version>
      <scope>provided</scope>
    </dependency>
    <!-- 可选：访问 MavenProject 对象 -->
    <dependency>
      <groupId>org.apache.maven</groupId>
      <artifactId>maven-core</artifactId>
      <version>3.9.6</version>
      <scope>provided</scope>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <!-- 从注解生成 plugin.xml 描述符 -->
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-plugin-plugin</artifactId>
        <version>3.13.1</version>
        <executions>
          <execution>
            <id>default-descriptor</id>
            <phase>process-classes</phase>
          </execution>
        </executions>
      </plugin>
    </plugins>
  </build>
</project>
```

#### 编写 Mojo {#writing-mojo}

每个 Goal 对应一个 Mojo 类，继承 `AbstractMojo` 并实现 `execute()` 方法。

```java
package com.example;

import org.apache.maven.plugin.AbstractMojo;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.plugin.MojoFailureException;
import org.apache.maven.plugins.annotations.LifecyclePhase;
import org.apache.maven.plugins.annotations.Mojo;
import org.apache.maven.plugins.annotations.Parameter;
import org.apache.maven.project.MavenProject;
import org.apache.maven.plugins.annotations.Component;

/**
 * @Mojo 声明一个 Goal
 *   name:              goal 名称，即 mvn groupId:artifactId:goalName 中的 goalName
 *   defaultPhase:      默认绑定的生命周期阶段
 *   requiresProject:   是否必须在 Maven 项目中执行（默认 true）
 *   threadSafe:        是否线程安全（并行构建时需要）
 */
@Mojo(
    name = "hello",
    defaultPhase = LifecyclePhase.COMPILE,
    requiresProject = true,
    threadSafe = true
)
public class HelloMojo extends AbstractMojo {

    /**
     * @Parameter 声明一个可配置参数
     *   property:      对应的命令行 -D 属性名
     *   defaultValue:  默认值，支持 ${project.xxx} 等表达式
     *   required:      是否必填
     *   readonly:      只读，不允许用户覆盖
     */
    @Parameter(property = "hello.name", defaultValue = "World", required = false)
    private String name;

    @Parameter(property = "hello.skip", defaultValue = "false")
    private boolean skip;

    /**
     * @Component 注入 Maven 内置组件
     */
    @Component
    private MavenProject project;

    @Override
    public void execute() throws MojoExecutionException, MojoFailureException {
        if (skip) {
            getLog().info("Skipping hello-maven-plugin");
            return;
        }

        // getLog() 提供 debug/info/warn/error 四个级别的日志
        getLog().info("Hello, " + name + "!");
        getLog().info("Project: " + project.getArtifactId() + " v" + project.getVersion());

        // 读取项目源码目录
        getLog().debug("Source directory: " + project.getBuild().getSourceDirectory());

        // 抛出 MojoExecutionException 表示插件执行错误（基础设施问题）
        // 抛出 MojoFailureException 表示构建失败（业务/质量问题）
    }
}
```

#### 访问项目文件 {#visit-project-file}

```java
import java.io.File;
import java.util.List;

@Mojo(name = "scan", defaultPhase = LifecyclePhase.VERIFY)
public class ScanMojo extends AbstractMojo {

    /** 项目构建输出目录，通常为 target/ */
    @Parameter(defaultValue = "${project.build.directory}", readonly = true)
    private File outputDirectory;

    /** 项目编译后的 classes 目录 */
    @Parameter(defaultValue = "${project.build.outputDirectory}", readonly = true)
    private File classesDirectory;

    /** 项目源码目录列表 */
    @Parameter(defaultValue = "${project.compileSourceRoots}", readonly = true)
    private List<String> sourceRoots;

    /** 注入整个 MavenProject，可获取依赖、模块等所有信息 */
    @Component
    private MavenProject project;

    @Override
    public void execute() throws MojoExecutionException {
        getLog().info("Output dir: " + outputDirectory.getAbsolutePath());
        getLog().info("Classes dir: " + classesDirectory.getAbsolutePath());

        // 遍历源码目录下的所有 .java 文件
        for (String sourceRoot : sourceRoots) {
            File srcDir = new File(sourceRoot);
            if (srcDir.exists()) {
                scanDirectory(srcDir);
            }
        }
    }

    private void scanDirectory(File dir) {
        for (File file : dir.listFiles()) {
            if (file.isDirectory()) {
                scanDirectory(file);
            } else if (file.getName().endsWith(".java")) {
                getLog().info("Found: " + file.getPath());
            }
        }
    }
}
```

#### 安装并使用插件 {#install-and-use-plugin}

开发完成后，安装到本地仓库：

```sh
cd hello-maven-plugin
mvn clean install
```

在其他项目的 `pom.xml` 中引用：

```xml
<build>
  <plugins>
    <plugin>
      <groupId>com.example</groupId>
      <artifactId>hello-maven-plugin</artifactId>
      <version>1.0.0</version>
      <configuration>
        <!-- 覆盖 @Parameter 默认值 -->
        <name>Maven</name>
      </configuration>
      <executions>
        <execution>
          <id>run-hello</id>
          <!-- 绑定到指定生命周期阶段 -->
          <phase>compile</phase>
          <goals>
            <goal>hello</goal>
          </goals>
        </execution>
      </executions>
    </plugin>
  </plugins>
</build>
```

也可以直接命令行执行，无需绑定到生命周期：

```sh
# 完整写法
mvn com.example:hello-maven-plugin:1.0.0:hello

# 若 groupId 符合 Maven 插件约定（org.apache.maven.plugins 或 org.codehaus.mojo），
# 可使用短前缀，否则需在 settings.xml 中配置 pluginGroups
mvn hello:hello -Dhello.name=World
```

#### 调试插件 {#debug-pluin}

```sh
# 以 debug 模式启动，等待调试器连接（默认端口 8000）
mvnDebug com.example:hello-maven-plugin:1.0.0:hello
```

在 IDE 中创建一个 **Remote JVM Debug** 配置，连接 `localhost:8000`，即可在 Mojo 代码中打断点调试。


## 完整配置

```xml
<!-- @include: ./pom.xml -->
```
