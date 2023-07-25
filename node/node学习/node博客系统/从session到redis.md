# session 到redis

## session 的问题

我们使用session做sid和用户信息映射的时候是直接在服务端运行内存中创建一个变量的，这就会造成很多问题

- 进程内存有限，访问量大的时候会造成内存使用量暴增，所有用户的映射关系都会存在内存中，这就很不合理
- 线上一般都是多进程的，进程之间的内存无法共享

## 解决方案redis

redis是web server最常用的缓存数据库，数据存放在内存中

相比较于mysql，redis的访问数独更快（内存和硬盘的访问速度不是一个数量级）

redis成本高，比较昂贵，存储的数据量更小

可以讲web server和redis拆分成两个服务

双方都是独立的，可扩展的（例如都可以扩展成集群）

包括mysql，也是一个单独的服务，也可扩展

## 为什么session适用于redis

- session访问频繁，对性能要求比较高
- session不用考虑断电丢失数据的问题（因为数据不重要，只是为了加快程序执行的数独，丢了可以重新生成）
- session数据量不会太大（相比于mysql存储的数据）

## 为什么网站数据不适用于redis

- 操作频率不高
- 断电不能丢失，必须保留
- 数据量大，内存成本太高

## redis安装

redis实际上也是key-value存储结构

brew install redis@^3.1.2

注意不要安装4.0以上，因为在执行get，set的时候会报错，The client is closed

## 用法

- redis-server启动redis
- redis-cli可以操作redis

## 简单的一些语法（记得以后补上）

- set key value
- get key
- keys * 查看所有的key
- flushall 清空redis

### node操作redis

```js
const redis = require('redis');
onst redisClient = redis.createClient(port, host);

redisClient.on('error', err => {
    console.log(err)
})

// val必须为字符串
redisClient.set(key, val, redis.print)
redisClient.get(key, (err, val) => {})

redisClient.quit(); // 退出
```
