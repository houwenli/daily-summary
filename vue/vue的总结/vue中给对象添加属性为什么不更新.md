# vue中给对象添加属性为什么不更新

这个问题其实很简单，因为vue数据响应式的原理是使用Object.defineProperty，我们看看下面的例子

```js
Object.defineProperty( obj, 'foo', {
    get() {

    },
    set (val) {

    }
})
```

此时我们可以看到对data进行递归响应式时是把已经存在的key做了响应式，所以新增的key就没办法做响应式了

解决办法有

- 少量数据用Vue.set，这里实际上仍然是调用了vue的响应式方法，在data上新增了key和value的响应
- 大量数据时使用Object.assign，使用一个新对象，替换掉老对象
- 实在不知道怎么做时使用，$forceUpdate，强制刷新vue实例，不建议使用

当然数组也会有这样的问题，在Vue中劫持了一些方法，比如pop，shift，push，concat等方法，在添加元素时对元素做了响应式化
