## sleep函数

我们开发的时候可能会遇到如下场景：我们需要在项目运行起来后的十分钟之后去执行一段代码

先看一段代码
```js
function fnA() {
    console.log('A');
}
function fnB() {
    console.log('B');
}
function fnC() {
    console.log('C');
}


// 实现目标
fnA(); // 1 秒后打印
fnB(); // 2 秒后打印
fnC(); // 3 秒后打印
```

### setTimeout
```js
setTimeout(fnA, 1000);
setTimeout(fnB, 2000);
setTimeout(fnC, 3000);
```
定时器确实可以满足我们的需求，但是如果项目中到处些定时器的可能会让人很疑惑，我们来封装一下
```js
function sleep (fn, time) {
    setTimeout(() => {
        fn()
    }, time)
}
sleep(fnA, 1000)
sleep(fnB, 2000)
sleep(fnC, 3000)
```

这种方式没有阻塞同步任务

### Promise
```js
function sleep(time) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, time)
    })
}
sleep(1000).then(fnA)
sleep(2000).then(fnB)
sleep(3000).then(fnC)
```
不用再传入回调函数，采用链式调用，结构很优雅，但是仍然没有阻塞同步任务

### Async/Await
```js
// js还是使用promise版本
function sleep(time) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, time)
    })
}
async function sleepTest() {
    fnA()
    await sleep(1000)
    fnB()
    await sleep(2000)
    fnC()
    await sleep(3000)
}
```
