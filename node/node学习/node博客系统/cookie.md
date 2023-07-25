# cookie

cookie用于登陆验证，请求时浏览器会把cookie带到服务端

server端可以修改cookie返回给浏览器端

server可以设置httpOnly限制浏览器端修改cookie

cookie 有以下特点

- cookie会有大小限制，5k左右
- 跨域不共享
- 格式是k1=v1; k2=v2; k3=v3; 可以存储结构化数据

## 浏览器操作cookie

```js
// 读取
document.cookie
// 可以设置一系列限制，如path，httpOnly，expires等
// 设置
document.cookie='k1=v1;httpOnly;expires=1d;path=/'
```

## server操作cookie

```js
// 读取 注意这是request
req.headers.cookie;

// 设置 注意这是response
res.setHeader('Set-Cookie', `username=${username};path=/;httpOnly`);
```
