# session

用cookie登陆会有什么问题

暴露了username，这个其实是敏感字端，不应该暴露出去，因为用户可能在各个平台使用的同一个用户名，这是不正确的

## 解决方案

使用session，cookie中存储一个userid（或则叫connectid，或则sid），server端可以根据这个值查出具体存储的信息，这个方案就叫session
