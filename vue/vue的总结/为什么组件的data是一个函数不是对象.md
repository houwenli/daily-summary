# 为什么组件的data是一个函数不是对象

其实这么说也不严谨，实际上根组件是既可以用函数也可以用对象的

我们知道vue中组件是用Vue.component()

我们再来看看一个简单例子

```js
function Component () {

}
Component.property.data = {
    count: 0
}

const componentA = new Component()
const componentB = new Component()

componentA.data.count = 1

// componentB.data.count = 1
```

产生这样的原因这是两者共用了同一个内存地址，这就很不合理了

```js
function Component () {

}
Component.property.data = () => {
    return {
        count: 0
    }
}
```

这样就不会出现这种问题了，这种模式实际上是用工厂函数重新生成一个data，这个各个组件的data就可以隔离的

而根组件永远只有一个，所以不会出现污染的情况，所以既可以使用对象，也可以使用方法
