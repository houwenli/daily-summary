# vue组件和插件的区别

## vue组件

vue组件实际上是把我们的页面拆成一个个小模块，从而形成一个个组件，一个.vue文件就可以看作是一个组件

vue组件的优点

- 降低耦合度
- 调试方便
- 提高可维护性

看看定义吧

```js
// 第一种形式
// 一个完整的.vue文件
<template>
</template>
<script>
export default{ 
    ...
}
</script>
<style>
</style>

// 第二种形式

<template id="testComponent">     // 组件显示的内容
    <div>component!</div>   
</template>

Vue.component('componentA',{ 
    template: '#testComponent'  
    template: `<div>component</div>`  // 组件内容少可以通过这种形式
})
```

## vue插件

vue插件通常用来对vue功能的扩展，或者是对vue实例功能的扩展

插件的功能没有严格的限制，主要功能有以下

- 添加全局方法和属性
- 添加全局资源
- 添加一些mixin
- 添加vue实力方法

看看插件的定义方式吧

vue插件应该暴露一个install方法，接收两个参数，第一个是vue构造器，第二个参数是可选参数

```js
MyPlugin.install = function (Vue, options) {
    // 1. 添加全局方法或 property
    Vue.myGlobalMethod = function () {
        // 逻辑...
    }

    // 2. 添加全局资源
    Vue.directive('my-directive', {
        bind (el, binding, vnode, oldVnode) {
        // 逻辑...
        }
        ...
    })

    // 3. 注入组件选项
    Vue.mixin({
        created: function () {
        // 逻辑...
        }
        ...
    })

    // 4. 添加实例方法
    Vue.prototype.$myMethod = function (methodOptions) {
        // 逻辑...
    }
}

// 插件使用时
Vue.use(MyPlugin, {})
```

## 使用场景

组件实际上是一些业务模块
插件实际上是对功能的扩展，它的目标是vue本身，比如说全局自定义指令，再比如说一个公共方法，当然这个也可以抽离出来
