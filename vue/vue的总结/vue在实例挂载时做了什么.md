# vue在实例挂载时做了什么

这个问题实际上是对vue全流程的一个介绍了

- 调用_init方法，调用initLifecycle,initRender,initState等方法，定义一些内部使用方法，$get,$set等，主要初始化生命周期，对数据响应式化等等
- 调用$mount进行页面的挂载
- $mount中调用mountComponent方法
- mountComponent方法中调用了updateComponent更新函数
- updateComponent中使用render方法缓存了虚拟dom
- 最后调用_update把虚拟dom渲染成真实dom，并且渲染到页面上
