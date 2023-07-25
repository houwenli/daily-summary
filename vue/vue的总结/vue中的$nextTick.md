# vue中的$nextTick

官方定义：在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM

## 为什么使用

```js
{{num}}
for(let i=0; i<100000; i++){
    num = i
}
```

像这一种，如果正常考虑，每次循环时num都会改变，相应的我们视图也应该发生变化，这种情况肯定是不可取的，这会照成很大的性能问题，js运行速度是很快的

nextTick就只需要更新一次就够了，实际上这里牵扯到了事件循环和宏任务以及微任务的问题

## 实现原理

nextTick中会根据当前环境支持什么方法则确定调用哪个，分别有：

Promise.then、MutationObserver、setImmediate、setTimeout

通过上面任意一种方法，进行降级操作
