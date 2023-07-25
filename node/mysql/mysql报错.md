# mysql 报错

## Client does not support authentication protocol requested by server; consider upgrading MySQL client

MySql 8.0换了新的身份验证插件（caching_sha2_password）, 旧的身份验证插件为（mysql_native_password）。
以默认创建的用户和密码都是这个加密方式。而npm包里的mysql模块还是使用原来的mysql_native_password加密方式，两者不互通，连接会报错。

```js
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'xxx';
// 然后刷新缓存：
flush privileges;
```
