# express 中间件

```js
function func1 (req, res, next) {
    ...
    next()
}
function func2 (req, res, next) {
    ...
    next()
}
app.use(func1, func2)
```

上面的func1，func2就是中间件，扩展了express的功能，可以把use理解成是一个队列，前一个方法执行了next()才会执行下一个方法

use可以多放点中间件，比如之前的登陆校验就能放这里
