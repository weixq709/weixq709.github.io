---
title: 基于quartz实现动态定时任务
createTime: 2024/10/08 22:54:02
permalink: /article/3gbgmpcy/
tags:
  - java
  - springboot
  - quartz
---

## 为什么需要动态定时任务？

在开发过程中，我们经常需要定时执行一些任务，比如定时发送邮件、定时清理缓存等。这些任务的特点是定时执行，不需要人工干预。但是，如果任务的数量和频率经常变化，那么手动配置定时任务就会变得非常麻烦。因此，我们需要一种能够动态配置定时任务的方式，这样就可以根据实际需求随时添加、修改和删除定时任务。本文将说明如何基于quartz和springboot实现动态定时任务。

## 实现步骤

### 引入依赖

```xml
<dependency>
	<groupId>org.quartz-schduler</groupId>
  <artifactId>quartz</artifactId>
  <version>2.3.2</version>
</dependency>

```

### 创建定时任务表

此处新建任务表的目的是，将动态任务与静态任务分离，避免造成冲突。

```sql
drop table if exists quartz_job;
create table quartz_job(
  id int primary key AUTO_INCREMENT,
  job_id varchar(32) not null comment '任务ID',
  job_name varchar(100) not null comment '任务名称',
  job_bean_name varchar(100) not null comment '任务beanName',
  job_group varchar(20) not null comment '任务分组',
  cron not null comment '任务执行表达式',
  data meduimtext comment '任务参数',
  create_time datetime comment '创建时间',
  update_time datetime comment '更新时间'
);
```

### 创建系统任务表

本文使用的数据库类型是MYSQL，如需其他类型的数据库，请在[quartz github](https://github.com/quartz-scheduler/quartz/blob/main/quartz/src/main/resources/org/quartz/impl/jdbcjobstore/)查看对应的sql文件。

:::details 点击查看

```sql
DROP TABLE IF EXISTS QRTZ_FIRED_TRIGGERS;
DROP TABLE IF EXISTS QRTZ_PAUSED_TRIGGER_GRPS;
DROP TABLE IF EXISTS QRTZ_SCHEDULER_STATE;
DROP TABLE IF EXISTS QRTZ_LOCKS;
DROP TABLE IF EXISTS QRTZ_SIMPLE_TRIGGERS;
DROP TABLE IF EXISTS QRTZ_SIMPROP_TRIGGERS;
DROP TABLE IF EXISTS QRTZ_CRON_TRIGGERS;
DROP TABLE IF EXISTS QRTZ_BLOB_TRIGGERS;
DROP TABLE IF EXISTS QRTZ_TRIGGERS;
DROP TABLE IF EXISTS QRTZ_JOB_DETAILS;
DROP TABLE IF EXISTS QRTZ_CALENDARS;


CREATE TABLE QRTZ_JOB_DETAILS
  (
    SCHED_NAME VARCHAR(120) NOT NULL,
    JOB_NAME  VARCHAR(200) NOT NULL,
    JOB_GROUP VARCHAR(200) NOT NULL,
    DESCRIPTION VARCHAR(250) NULL,
    JOB_CLASS_NAME   VARCHAR(250) NOT NULL,
    IS_DURABLE VARCHAR(1) NOT NULL,
    IS_NONCONCURRENT VARCHAR(1) NOT NULL,
    IS_UPDATE_DATA VARCHAR(1) NOT NULL,
    REQUESTS_RECOVERY VARCHAR(1) NOT NULL,
    JOB_DATA BLOB NULL,
    PRIMARY KEY (SCHED_NAME,JOB_NAME,JOB_GROUP)
);

CREATE TABLE QRTZ_TRIGGERS
  (
    SCHED_NAME VARCHAR(120) NOT NULL,
    TRIGGER_NAME VARCHAR(200) NOT NULL,
    TRIGGER_GROUP VARCHAR(200) NOT NULL,
    JOB_NAME  VARCHAR(200) NOT NULL,
    JOB_GROUP VARCHAR(200) NOT NULL,
    DESCRIPTION VARCHAR(250) NULL,
    NEXT_FIRE_TIME BIGINT(13) NULL,
    PREV_FIRE_TIME BIGINT(13) NULL,
    PRIORITY INTEGER NULL,
    TRIGGER_STATE VARCHAR(16) NOT NULL,
    TRIGGER_TYPE VARCHAR(8) NOT NULL,
    START_TIME BIGINT(13) NOT NULL,
    END_TIME BIGINT(13) NULL,
    CALENDAR_NAME VARCHAR(200) NULL,
    MISFIRE_INSTR SMALLINT(2) NULL,
    JOB_DATA BLOB NULL,
    PRIMARY KEY (SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP),
    FOREIGN KEY (SCHED_NAME,JOB_NAME,JOB_GROUP)
        REFERENCES QRTZ_JOB_DETAILS(SCHED_NAME,JOB_NAME,JOB_GROUP)
);

CREATE TABLE QRTZ_SIMPLE_TRIGGERS
  (
    SCHED_NAME VARCHAR(120) NOT NULL,
    TRIGGER_NAME VARCHAR(200) NOT NULL,
    TRIGGER_GROUP VARCHAR(200) NOT NULL,
    REPEAT_COUNT BIGINT(7) NOT NULL,
    REPEAT_INTERVAL BIGINT(12) NOT NULL,
    TIMES_TRIGGERED BIGINT(10) NOT NULL,
    PRIMARY KEY (SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP),
    FOREIGN KEY (SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP)
        REFERENCES QRTZ_TRIGGERS(SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP)
);

CREATE TABLE QRTZ_CRON_TRIGGERS
  (
    SCHED_NAME VARCHAR(120) NOT NULL,
    TRIGGER_NAME VARCHAR(200) NOT NULL,
    TRIGGER_GROUP VARCHAR(200) NOT NULL,
    CRON_EXPRESSION VARCHAR(200) NOT NULL,
    TIME_ZONE_ID VARCHAR(80),
    PRIMARY KEY (SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP),
    FOREIGN KEY (SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP)
        REFERENCES QRTZ_TRIGGERS(SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP)
);

CREATE TABLE QRTZ_SIMPROP_TRIGGERS
  (
    SCHED_NAME VARCHAR(120) NOT NULL,
    TRIGGER_NAME VARCHAR(200) NOT NULL,
    TRIGGER_GROUP VARCHAR(200) NOT NULL,
    STR_PROP_1 VARCHAR(512) NULL,
    STR_PROP_2 VARCHAR(512) NULL,
    STR_PROP_3 VARCHAR(512) NULL,
    INT_PROP_1 INT NULL,
    INT_PROP_2 INT NULL,
    LONG_PROP_1 BIGINT NULL,
    LONG_PROP_2 BIGINT NULL,
    DEC_PROP_1 NUMERIC(13,4) NULL,
    DEC_PROP_2 NUMERIC(13,4) NULL,
    BOOL_PROP_1 VARCHAR(1) NULL,
    BOOL_PROP_2 VARCHAR(1) NULL,
    PRIMARY KEY (SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP),
    FOREIGN KEY (SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP)
    REFERENCES QRTZ_TRIGGERS(SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP)
);

CREATE TABLE QRTZ_BLOB_TRIGGERS
  (
    SCHED_NAME VARCHAR(120) NOT NULL,
    TRIGGER_NAME VARCHAR(200) NOT NULL,
    TRIGGER_GROUP VARCHAR(200) NOT NULL,
    BLOB_DATA BLOB NULL,
    PRIMARY KEY (SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP),
    FOREIGN KEY (SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP)
        REFERENCES QRTZ_TRIGGERS(SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP)
);

CREATE TABLE QRTZ_CALENDARS
  (
    SCHED_NAME VARCHAR(120) NOT NULL,
    CALENDAR_NAME  VARCHAR(200) NOT NULL,
    CALENDAR BLOB NOT NULL,
    PRIMARY KEY (SCHED_NAME,CALENDAR_NAME)
);

CREATE TABLE QRTZ_PAUSED_TRIGGER_GRPS
  (
    SCHED_NAME VARCHAR(120) NOT NULL,
    TRIGGER_GROUP  VARCHAR(200) NOT NULL,
    PRIMARY KEY (SCHED_NAME,TRIGGER_GROUP)
);

CREATE TABLE QRTZ_FIRED_TRIGGERS
  (
    SCHED_NAME VARCHAR(120) NOT NULL,
    ENTRY_ID VARCHAR(95) NOT NULL,
    TRIGGER_NAME VARCHAR(200) NOT NULL,
    TRIGGER_GROUP VARCHAR(200) NOT NULL,
    INSTANCE_NAME VARCHAR(200) NOT NULL,
    FIRED_TIME BIGINT(13) NOT NULL,
    SCHED_TIME BIGINT(13) NOT NULL,
    PRIORITY INTEGER NOT NULL,
    STATE VARCHAR(16) NOT NULL,
    JOB_NAME VARCHAR(200) NULL,
    JOB_GROUP VARCHAR(200) NULL,
    IS_NONCONCURRENT VARCHAR(1) NULL,
    REQUESTS_RECOVERY VARCHAR(1) NULL,
    PRIMARY KEY (SCHED_NAME,ENTRY_ID)
);

CREATE TABLE QRTZ_SCHEDULER_STATE
  (
    SCHED_NAME VARCHAR(120) NOT NULL,
    INSTANCE_NAME VARCHAR(200) NOT NULL,
    LAST_CHECKIN_TIME BIGINT(13) NOT NULL,
    CHECKIN_INTERVAL BIGINT(13) NOT NULL,
    PRIMARY KEY (SCHED_NAME,INSTANCE_NAME)
);

CREATE TABLE QRTZ_LOCKS
  (
    SCHED_NAME VARCHAR(120) NOT NULL,
    LOCK_NAME  VARCHAR(40) NOT NULL,
    PRIMARY KEY (SCHED_NAME,LOCK_NAME)
);
```

:::

### 定义实体类

**Job**用于数据库操作，**JobInfo**用于调用接口创建任务时描述任务信息。**jobId**是唯一任务标识，为防止任务重复，可采用UUID或雪花算法生成，对应**QRTZ_JOB_DETIALS**表的**JOB_NAME**字段。jobName用于描述任务名称，便于开发人员查找任务。jobBeanName用于记录任务在spring容器中的bean名称，如果某些场景下需要调整任务类的包名，任务管理器会在启动时根据bean名称自动查找对应的class，然后更新任务信息并重新启动，解决了原生API调整类路径重启任务直接报错的问题。group用于记录任务所属组，便于管理。cron用于记录任务执行时间。data用于记录任务执行时需要传递的参数。createTime和updateTime用于记录任务创建和修改时间。

:::details 查看代码

```java
public class Job {

  private String jobId;

  private String jobName;

  private String group;

  private String jobBeanName;

  private String cron;

  private String data;

  private Date createTime;

  private Date updateTime;

  // 省略getter setter toString
  public toJobInfo() {
    // ...
  }
}

public class JobInfo {

  private String jobId;

  private String jobName;

  private String group;

  private String jobBeanName;

  private String cron;

  private String data;

  private Date createTime;

  private Date updateTime;
  // 省略getter setter toString

  public Job toJob() {
    // ...
  }
}
```

:::

### 定义Mapper

:::details 查看代码

```java
public interface JobRepository{

   @Select("select * from quartz_job")
   @Result(column="job_group", property="group")
   List<Joob> findAll();

   @Insert("insert into quartz_job(job_id, job_name, job_bean_name, job_group, cron, data," +
           "create_time, update_time) values (" +
           "#{jobId}, #{jobName}, #{jobBeanName}, #{group}, #{cron}, #{data}, #{createTime}, #{updateTime})")
   int add(Job job);

   @Update("update quartz_job set job_name=#{jobName}, job_group=#{group}, cron=#{cron}, data=#{data}," +
           "update_time=#{updateTime} where job_id = #{jobId}")
   int update(Job job);

   @Delete("delete from quartz_job where job_id = #{jobId}")
   int deleteByJobId(String jobId);

   @Select("select * from quartz_job where job_di = #{jobId}")
   @Result(column="job_group", property="group")
   Job get(String jobId);
}
```

:::

> [!TIP]
> 此处为展示方便，直接使用注解编写SQL，也可在XML文件中编写。

### 创建任务管理器

任务管理器负责任务的创建、修改、删除、暂停、恢复、立即执行、查询等操作，通过调用Scheduler接口实现，通过调用JobRepository接口实现数据库操作。任务管理器包含两类操作，一类是添加任务操作，此时仅仅是将任务添加到表中，而不会立即启动任务。另一类是调度任务操作，调用接口时，根据jobId查询任务信息，如果任务不存在，则抛出异常，如果任务存在，则根据任务信息创建JobDetail和Trigger，然后调用Scheduler接口启动任务。在容器启动时，任务管理器利用spring声明周期(SmartInitializingSingleton#afterSingletonsInstantiated)，在所有bean初始化完成后，查询所有启动的任务，启动任务。如果某些任务永远不会启动，则会在控制台打印日志，提示任务未启动。

:::details 查看代码

```java
public interface JobManager{
  
  String add(JobInfo job);
  
  void update(JobInfo job) throws JobNotExistsException;
  
  void delete(String jobId);
  
  Job get(String jobId);
  
  void schedule(String jobId) throws JobNotExistsException;

  void reschedule(String jobId, String cron) throws JobNotExistsException;

  void reschedule(String jobId, String cron, Map<String, Object> jobParameters) throws JobNotExistsException;

  void pause(String jobId);

  void resume(String jobId);

  void remove(string jobId) throws JobNotExistsException;

  boolean isRunning(String jobId) throws JobNotExistsException;

  void runJobNow(String jobId) throws JobNotExistsException;
}

public class SimpleJobManager implements JobManager, SmartInitializingSingleton {

  private static final String DEFAULT_JOB_GROUP = "default_job_group";
  private static final String DEFAULT_TRIGGER_GROUP = "default_trigger_group";

  @Autowired
  private Scheduler scheduler;

  @Autowired
  private JobRepository jobRepository;

  @Override
  public void afterSingltonsInstantiated() {
     loadAllTasks();
  }

  @Override
  public String add(JobInfo job) {
    Assert.notNull(job.getJobName(), "任务名称不能为空");
    Assert.notNull(job.getJobBeanName(), "任务bean不能为空");
    Assert.notNull(job.getCron(), "cron表达式不能为空");

    String group = applyDefaultGroupIfNecessary(job.getGroup());
    String jobId = generateJobId();
    job.setJobId(jobId);
    job.setGroup(group);
    job.setCreateTime(new Date());
    job.setUpdateTime(new Date());
    jobRepository.add(job.toJob());
    log.debug("添加任务成功，job: {}", job);
    return jobId;
  }

  @Override
  public void update(JobInfo jobInfo){
    Job oldJob = jobRepository.get(jobInfo.getJobId());
    job newJob = jobInfo.toJob();
    Assert.notNull(oldJob, new JobNotExistsException("任务不存在"));
    Assert.notNull(jobInfo.getJobBeanName(), "任务bean不能为空");
    Assert.notNull(jobInfo.getCron(), "cron表达式不能为空");
    oldJob.setJobName(newJob.getJobName());
    oldJob.setDescription(newJob.getDescription());
    oldJob.setCron(newJob.getCron());
    oldJob.setData(newJob.getData());
    oldJob.setUpdateTime(new Date());
    jobRepository.update(oldJob);
    log.debug("修改任务成功，job: {}", jobInfo);
  }

  @Override
  public void delete(String jobId) {
    Assert.notNull(jobId, "任务ID不能为空");
    jobRepository.deleteByJobId(jobId);
  }

  @Override
  public JobInfo get(String jobId) {
    Assert.notNull(jobId, "任务ID不能为空");
    Job job = jobRepository.get(jobId);
    if(job == null) {
      return null;
    }
    return job.toJobInfo();
  }

  @Override
  public void schedule(String jobId) {
    Job job = jobRespository.get(jobId);
    Assert.notNulll(job, "任务不存在：" + jobId);
    JobKey jobKey = JobKey.jobKey(jobId, job.getGroup());
    if(isExistsJob(jobKey)) {
      throw new BaseException("任务已添加：" + job.getJobName());
    }
    if(isRunning(jobKey)) {
      throw new BaseException("任务已运行：" + jobId);
    }
    JobInfo jobInfo = job.toJobInfo();
    jobDetail jobDetail = createJobDetail(jobInfo);
    Trigger trigger = createJobTrigger(jobInfo, jobKey);
    try {
      scheduler.addJob(jobDetail, false);
      scheduler.scheduleJob(trigger);
    } catch(SchedulerException e) {
      throw new BaseException("启动任务失败，jobId: " + jobId + "，jobName: " + job.getJobName(), e);
    }
  }

  @Override
  public void reschedule(String jobId) {
    reschedule(jobId, null);
  }

  @Override
  public void reschedule(String jobId, String cron) {
    reschedule(jobId, cron, null);
  }

  @Override
  public void reschedule(String jobId, String cron, Map<String, Object> jobParameters) {
    Job job = jobRepository.get(jobId);
    Assert.notNull(job, new JobNotExistsException("任务不存在：" + jobId));
    String group = job.getGroup();
    JobKey jobKey = JobKey.jobKey(jobId, group);
    TriggerKey triggerKey = TriggerKey.triggerKey(jobId, DEFAULT_TRIGGER_GROUP);
    try {
      if(jobParameters != null && !jobParameters.isEmpty()) {
        jobParameters = jobInfo.getData();
      }
      JobDetail jobDetail = createJobDetail(jobId, job.getJboName(), job.getJobBeanName(), group, jobParameters);
      // 替换
      scheduler.addJob(jobDetail, true);

      // 手动传入 > 配置
      if(StringUtils.isNotEmpty(cron)) {
        cron = job.getCron();
      }
      Trigger trigger = createJobTrigger(jobId, jobKey, DEFAULT_TRIGGER_GROUP, cron);
      scheduler.rescheduleJob(triggerKey, trigger);
    } catch(SchedulerException e) {
      throw new BaseException("重启任务失败：" + jobId, e);
    }
  }

  public void pause(String jobId) {
    Job job = jobRepository.get(jobId);
    Assert.notNull(job, new JobNotExistsException("任务不存在: " + jobId));
    pause(job);
  }

  public void resume(String jobId) {
    Job job = jobRepository.get(jobId);
    Assert.notNull(job, new JobNotExistsException("任务不存在: " + jobId));
    JobKey jobKey = JobKey.jobKey(jobId, job.getGroup);
    try {
      scheduler.resumeJob(jobKey);
    } catch(SchedulerException e) {
      throw new BaseExcpetion("恢复任务失败: " + jobId, e);
    }
  }

  public void remove(String jobId) {
    Job job = jobRepository.get(jobId);
    Assert.notNull(job, new JobNotExistsException("任务不存在: " + jobId));
    pause(job);
    JobKey jobKey = JobKey.jobKey(jobId, job.getGroup);
    try {
      scheduler.deleteJob(jobKey);
    } catch(SchedulerException e) {
      throw new BaseExcpetion("删除任务失败: " + jobId, e);
    }
  }

  public boolean isRunnging(Stringg jobId) {
    Job job = jobRepository.get(jobId);
    Assert.notNull(job, new JobNotExistsException("任务不存在: " + jobId));
    return isRunning(JobKey.jobKey(jobId, job.getGroup()));
  }

  public void runJobNow(String jobId) {
    Job job = jobRepository.get(jobId);
    Assert.notNull(job, new JobNotExistsException("任务不存在: " + jobId));
    try {
      scheduler.deleteJob(JobKey.jobKey(jobId, job.getGroup());
    } catch(SchedulerException e) {
      throw new BaseExcpetion("删除任务失败: " + jobId, e);
    }
  }

  private String generateJobId() {
    String jobId = null;
    while(true) {
      jobId = UUID.randomUUID().replaceAll("-", "");
      Job job = jobRepository.get(jobId);
      if(job == null) {
        return jobId;
      }
    }
  }

  private JobDetail createJobDetail(JobInfo job) {
    String beanName = job.getJobBeanName();
    String jobId = job.getJobId();
    String jobName = job.getJobName();
    String group = job.getGroup();
    Map<String, Object> data = job.getData();
    return createJobDetail(jobId, jobName, beanName, group, data);
  }

  private <T extends org.quartz.Job> JobDetail createJobDetail(String jobId, String jobName, String beanName,
                                                              String group, Map<String, Object> jobData) {
    BeanDefinition beanDefinition = ApplicationContextUtil.getBeanDefinition(beanName);
    if(beanDefinition == null) {
      throw new BaseException("Not found beanDefinition: " + beanName);
    }
    Class<T> jobClass = null;
    try {
      jobClass = (Class<T>) Class.forName(beanDefinition.getBeanClassName());
    } catch(ClassNotException e) {
      throw new BaseException("Not found bean class: " + beanDefinition.getBeanClassName());
    }
    JobDetail jobDetail = JobBuilder.newJob(jobClass)
      															.withIdentity(jobId, group);
    																.storeDurably(true)
                                    .build();
    if(jobData == null) {
       jobData = new HashMap<>();
    }
    // 添加默认参数
    jobData.put("jobId", jobId);
    jobData.put("jobName", jobName);
    jobDetail.getJobDataMap().putAll(jobData);
    return jobDetail;
  }

  private Trigger createJobTrigger(JobInfo job, JobKey jobKey) {
    return createJobTrigger(job.getJobId(), jobKey, DEFAULT_TRIGGER_GROUP, job.getCron());
  }

  private Trigger createJobTrigger(String jobId, JobKey jobKey, String triggerGroup, String cron) {
    TriggerBuilder<Trigger> builder = TriggerBuilder.newTrigger();
    builder.withIdentity(jobId, triggerGroup);
    builder.startAt(DateBuilder.futureDate(1, DateBuilder.IntervalUnit.SECOND));
    builder.withSchedule(CronScheduleBuilder.cronSchedule(cron));
    builder.forJob(jobKey);
    return builder.build();
  }

  private void loadAllTasks() {
    List<Job> jobs = jobRepository.findEnableJobs();
    // 添加新任务或重启任务
    for(Job job : jobs) {
      JobInfo jobInfo = job.toJobInfo();
      JobKey jobKey = JobKey.jobKey(job.getJobId(), job.getGroup());
      JobDetail jobDetail = createJobDetail(jobInfo);
      Trigger trigger = createJobTrigger(jobInfo, jobKey);
      if(!willTriggerInFuture(cron)) {
        jobInfo.setStatus(JobStatus.DISABLE.getStatus());
        update(jobInfo);
        log.warn('任务永不执行，请检查配置，jobId: {}, jobName: {}, cron: {}', jobId, jobName, cron);
      } else {
        try {
          boolean existsJob = isExistsJob(jobKey);
          scheduler.addJob(jobDetail, true);
          Trigger existsTrigger = scheduler.getTrigger(trigger.getKey());
          if(existsTrigger != null && (isRunning(jobKey) || existsJob)) {
            scheduler.rescheduleJob(trigger.getKey(), tirgger);
          } else {
            scheduler.scheduleJob(trigger);
          }
          log.info("启动任务成功，jobId: {}", job.getJobId());
        } catch(SchedulerException e) {
          throw new BaseException("启动任务失败:" + job.getJobId(), e);
        }
      }
    }
    log.info("Loaded All tasks !");
  }

  private boolean isSameJob(JobKey jobKey, JobKey targetJobKey) {
    String jobId = targetJobKey.getName();
    String group = applayDefaultGroupIfNecessary(targetJobKey.getGroup());
    return jobkey.getName.equals(jobId) && jobKey.getGroup().equals(group);
  }

  private boolean isExistsJob(JobKey jobKey) {
    try {
      return scheduler.checkExists(jobKey);
    } catch(SchedulerException e) {
      throw new BaseException("系统错误", e);
    }
  }

  private boolean isRunning(JobKey jobKey) {
    try {
      List<JobExecutionContext> currentlyExecutingJobs = scheduler.getCurrentlyExecutingJobs();
      return currentlyExecutingJobs.stream()
        			.filter(item -> isSameJob(item.getJobDetail(), jobKey))
        			.findFirst()
        			.isPresent();
    } catch(SchedulerException e) {
      throw new BaseException("系统错误", e);
    }
  }

  private String applyDefaultGroupIfNecessary(String group) {
    return StringUtils.isEmpty(group) ? DEFAULT_JOB_GROUP : group;
  }

  private void pause(Job job) {
    JobKey jobKey = JobKey.jobKey(job.getJobId(), job.getGroup());
    try {
      scheduler.pauseJob(jobKey);
    } catch(SchedulerException e) {
      throw new BaseException("暂停任务失败，jobId: " + job.getJobId(), e);
    }
  }

  private boolean willTriggerInFuture(String cron) {
    try {
      CronExpression cronExpression = new CronExpression(cron);
      Date nextValidTime = cronExpression.getNextValidTimeAfter(new Date());
      return nextValidTime != null;
    } catch(Exception e) {
      return false;
    }
  }
}
```

:::

### 使用任务工厂创建任务

Spring提供了创建quartz任务的接口，便于用户定制任务的创建过程。此处，我们使用该工厂来完成任务实例属性自动注入的功能，以便在任务调度时，可以很方便的注入其他业务bean并调用接口。

```java
public class SpringJobFactory extends AdaptableJobFactory {

  @Autowired
  private AutowiredCapableBeanFactory beanFactory;

  @Override
  protected Object createJobInstance(TriggerFiredBundle bundle) throws Exception {
    Object jobInstance = super.createJobInstance(bundle);
    beanFactory.autowireBean(jobInstance);
    return jobInstance;
  }
}
```

> [!TIP]
> 任务类上使用 **@Component** 标记，仅是为了启动任务时，能够根据bean名称查找class，实际调用任务的对象是通过**AdaptableJobFactory**创建的，与@Component注解创建的对象不是同一对象。因此，无法通过@Component注解完成属性注入。

### 配置任务管理器

大多数情况下，mapper接口都是放在统一的mapper包下。但是，JobRepository属于系统接口，为了避免与业务mapper混淆，我们将其放在单独的包下。此时，可以通过手动添加mapper扫描包的方式，将JobRepository接口扫描到Spring容器中。但是，通常情况下，我们会将所有任务相关的类都放在统一包下。比如：Job、JobRepository、JobManager、SimpleJobManager、SpringJobFactory都放在job包下，此时添加额外的扫描路径会扫描多个类，实际仅扫描到一个mapper接口，会造成额外的开销(虽然开销较小)。为避免此问题，我们通过手动配置JobRepository的sqlSessionFactory，将JobRepository接口扫描到Spring容器中。

```java
@Configuration
public class SystemConfig {
  @Bean
	public JobManager jobManager() {
    return new SimpleJobManager();
  }

  @Bean
  public JobRepository jobRepository(SqlSessionFactory sqlSessionFactory) {
    sqlSessionFactory.getConfiguration.addMapper(JobRepository.class);
    MapperFactoryBean<JobRepository> jobRepository = new MapperFacotryBean<>(JobRepository.class);
    jobRepository.setSqlSessionFactory(sqlSessionFactory);
    return jobRepository.getObject();
  }

  @Bean
  public SchedulerFactoryBeanCustomizer schedulerFactoryBeanCustomizer(DataSource dataSource,
                                                                       JobFactory jobFactory) {
    return schedulerFactoryBean -> {
      schedulerFactoryBean.setJobFactory(jobFactory);
      schedulerFactoryBean.setDataSource(dataSource);
      schedulerFactoryBean.setConfigLocation(new ClassPathResource("spring-quartz.properties"));
    };
  }

  @Bean
  public SpringJobFactory jobFactory() {
    return new SpringJobFactory();
  }
}
```

说明：
1.JobRepository是一个Mapper，通常我们会使用@MapperScan扫描或@Mapper标记。
因JobRepository属于系统接口，不属于业务接口，通常不会放在mapper扫描路径下，因此单独使用配置方式进行添加。
2.quartz任务类的子类默认不支持spring属性注入，通过自定义任务工厂，并结合spring扩展点，完成任务类对spring属性注入支持。

### QUARTZ配置

:::details 查看配置

```properties
#============================================================================
# Configure JobStore
# Using Spirng dataSource in quartzJobsConfig.xml
# Spring uses LocalDataSourceJobStore extension of JobStoreCMT
#============================================================================

org.quartz.jobStore.useProperties=false
org.quartz.jobStore.tablePrefix=QRTZ_
org.quartz.jobStore.isCluster=true
org.quartz.jobStore.clusterCheckinInterval=5000
org.quartz.jobStore.misfireThreshold=60000
org.quartz.jobStore.txIsolationLevelReadCommitted=true

#============================================================================
# Change this to match your DB vendor
#============================================================================

org.quartz.jobStore.class=org.quartz.impl.jdbcstore.JobStoreTX
org.quartz.jobStore.driverDelegateClass=org.quartz.impl.jdbcstore.StdJDBCDelegate

#============================================================================
# Configure Main Scheduler properties
# Needed to manage cluster instances
#============================================================================
org.quartz.scheduler.instanceId=AUTO
org.quartz.scheduler.instanceName=MY_CLUSTER_JOB_SCHEDULER
org.quartz.scheduler.rmi.export=false
org.quartz.scheduler.rmi.proxy=false

#============================================================================
# Configure ThreadPool
#============================================================================

org.quartz.threadPool.class = org.quartz.simpl.SimpleThreadPool
org.quartz.threadPool.threadCount = 10
org.quartz.threadPool.threadPriority = 5
org.quartz.threadPool.threadsInheritContextClassLoaderOfInitializingThread=true
```

:::

### 示例

```java
@Component(MyJob.JOB_NAME)
public class MyJob extends QuartzJobBean {

  private static final String JOB_NAME = "MyJob";

  @Autowired
  private DemoService demoService;

  @Override
  protected void executeInternal(JobExecutionContext context) throws JobExecutionException {
      System.out.println("MyJob execute");
      demoService.doSomething();
  }
}

@Service
public class DemoService {

  @Autowired
  private JobManager jobManager;

  public void addJob() {
    Job job = new Job();
    job.setJobId(UUID.randomUUID().replaceAll('-', '').toString());
    job.setJobName("test");
    job.setJobBeanName(MyJob.JOB_NAME);
    // 设置参数
    job.setData(new HashMap<>());
    // ...
    jobManager.addJob(job);
  }

  public void start(String jobId) {
    // ...
    jobManager.scheduleJob(jobId);
  }
}
```
