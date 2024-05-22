# 工作中使用webpack优化了什么

首先我们要了解webpack能干什么，webpack是一种构建javascript应用程序的静态模块打包器，能够加载应用中所有的资源文件，包括图片，css，视频字体文件等非js模块，将其合并打包成浏览器兼容的web资源文件

整个流程就是

- 输入：从文件系统读入代码文件
- 模块递归处理：调用Loader转译Module内容，并将结果转换为AST树，从中分析模块依赖关系，进一步递归调用模块处理程序，直到所有依赖文件都处理完毕
- 后处理：所有模块处理完毕之后，执行后处理操作，包括模块合并，产物优化等等，最终输出chunk集合
- 输出：将chunk写出外部文件系统

归根结底实际上就是做了两个操作
- 构建阶段，解析转换优化代码
- 运行阶段，输出资源文件

这其实也对应了我们的开发环境和线上环境，开发阶段关注的构建，怎么快怎么来。线上环境就要关注性能了，怎么好怎么来

## 优化

优化的前提一定要采用新版本的webpack，这算得上是性价比最高的优化手段了，每个版本的升级，构建功能在不断增强，但是性能在不断优化，webpack4我用了很多优化手段，比如缓存，多核编译，代码分割等等都试过了，优化效果很有限，升级之后立马发现构建和热更新速度飙升

## 构建优化手段
首先我们可以借助性能分析工具统计我们什么地方耗时严重，针对处理

使用下面方式可以得出构建耗时数据，会在根目录下生成stats.json文件
```js
webpack --json=stats.json
```
然后使用下面工具就能得到一个数据面板，比如Webpack Analysis

### 持久化缓存
其实细想一下，我们开发中除了我们自己的业务代码，其他比如node_module包中的依赖是不是很少发生变化，但是我们编译的时候仍然要走一遍构建过程，这是很耗时的

webpack能够将首次构建的过程与结果数据保存在本地文件系统，当我们二次编译的时候如果比较文件的hash值或者时间戳，跳过没有变化的模块直接使用上次构建结果

开启的方式很简单，当然在webpack4中cache也是一个很好的优化手段，比如cache-loader，使用起来就麻烦多了

```js
module.exports = {
  cache: {
    type: 'filesystem',
    // 其他配置
  }
}
```
### 并行构建
使用HappyPack，已经不在维护了

使用 Thread-loader处理加载问题

TerserPlugin 配置parallel: n，处理文件压缩问题

### 约束loader执行范围，比如exclude，include

### 开发模式禁用产物优化

webpack提供了许多产物优化功能，比如tree-shaking,splitChunks,minimizer等等，这些都是很耗时的，会增加构建器的负担

- optimization.minimize 保持默认值或 false，关闭代码压缩；
- optimization.concatenateModules 保持默认值或 false，关闭模块合并；
- optimization.splitChunks 保持默认值或 false，关闭代码分包；
- optimization.usedExports 保持默认值或 false，关闭 Tree-shaking 功能；

### 热更新时最小化watch范围
```js
module.exports = {
  //...
  watchOptions: {
    ignored: /node_modules/
  },
};
```

### 合理使用source-map，生产环境需要错误越详细越好，开放环境适当的可以放宽限制，比如eval

### 设置resolve，缩小搜索范围

## 生产环境优化手段

生产环境重点就不在构建了，构建速度可以很慢，性能也就是用户体验一定要好

从根本上来看，代码量小，请求数据少，有效利用缓存是优化的关键

另外我们也可以借助工具Webpack Bundle Analyzer，编译完成后会打开一个本地视图窗口，观察各个模块大小

### splitChunk 分块是重中之重

模块带包有些问题
- 如果所有文件都打包在一个文件会怎样
- 重复引用的模块怎么处理
- 资源冗余，是否有些代码不需要一开始加载
- 缓存如何做

所以就有了分块的优化

#### 根据使用频率
被分块超过两次引用的就进行分包
```js
module.exports = {
  //...
  optimization: {
    splitChunks: {
      // 设定引用次数超过 2 的模块才进行分包
      minChunks: 2
    },
  },
}
```
#### 限制分包数量，限制分包体积

#### 使用缓存组cacheGroups
缓存组的作用在于能为不同类型的资源设置更具适用性的分包规则，一个典型场景是将所有 node_modules 下的模块统一打包到 vendors 产物，从而实现第三方库与业务代码的分离
```js
module.exports = {
  //...
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
            test: /[\\/]node_modules[\\/]/,
            minChunks: 1,
            minSize: 0
        }
      },
    },
  },
};
```
### 代码压缩
- js压缩 terser-webpack-plugin
- css压缩 CssMinimizerWebpackPlugin 

### 动态加载 比如各个路由页面

### 缓存优化，使用contentHash

### 使用externals设置外部依赖

webpack会预设已经存在相关库，就不会在打包进去，外部依赖结合cdn特性就能实现优化

### 开启tree-shaking

```js
module.exports = {
  mode: "production",
  optimization: {
    usedExports: true,
  },
};
```
