## legos 原理

### legos是什么东西
主要是实现了前端工作流，从项目开发，调试，编译，打包，发布的全流程工作

主要分为两部分，一部分是包管理功能，legos install， legos publish 实际上是调用了npm来实现的

另一部分是编译功能如legos build，legos release等等，实际上是对webpack的二次开发实现的

当然这里是有缺陷的，legos最新版本是使用webpack4开发的，还没有更新到最新的webpack5

### 首先了解命令行工具
详见另一篇文章，使用commander开发属于自己的命令行工具 
但是legos没有采用commander包


### 简单介绍

使用观察者模式先创建一个task存取器，use方法存入方法，excute方法取出方法执行
```js
var task = {};
task.use = function (taskName, desc, ...cb) {
  cache[taskName] = cb
}
task.excute = function (opts) {
  var taskName = opts[0];
  var p;
  if (cache[taskName]) {
    p = Promise.resolve()
    cache[taskName].forEach(func => {
      p = p.then(data => {
        return new Promise((resolve, reject) => {
          func(opts, function (err, data) {
            if (err) {
              reject(err)
            } else {
              resolve(data);
            }
          })
        })
      })
    })
  } else {
    console.log(`未知命令 legos ${taskName || ''} 输入命令legos help查看使用说明`);
    p = Promise.resolve()
  }
  return p
}
```


### legos help

router.js中定义了一系列指令
```js
task.use('help', '命令帮助', lhelp.help);
task.use('install', '从legos安装包', lnpm.command);
task.use('info', '查看legos包信息', lnpm.command);
// task.use('adduser', lnpm.command, '注册');
task.use('dedupe', 'legos包去重', lnpm.command);
```
当工具接收到参数时，先判断参数中时候有help，如果的话就通过fs.readFileSync读取router文件，再通过正则解析找出指令和描述，循环拼接输出

### legos build
前置会有很多操作，比如确认我们自定义的一些webpack配置文件有没有，业务需要的依赖包是否全部下载，或则是否需要更新，私有域的包是否全部更新，以及非watch模式下清除dist文件等等

接下来是主要的处理

1、生成webpack配置，这一步会有很多判断处理，加载loader，plugin等

2、var webpack = require('webpack');
mc = webpack(webpackConfig);
使用webpack编译我们的业务代码

3、如果参数有--watch，就会启用webpack-dev-server

### legos release
这个得流程和legos build差不多，就在最后阶段，生成文件后涉及文件上传服务器功能，使用ftp上传

