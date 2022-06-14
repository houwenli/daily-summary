## loader原理

### loader 概念
帮助 webpack 将不同类型的文件转换为 webpack 可识别的模块。

### loader 执行顺序
1、分类
- pre： 前置 loader
- normal： 普通 loader
- inline： 内联 loader
- post： 后置 loader

2、执行顺序
- 4 类 loader 的执行优级为：pre > normal > inline > post 。
- 相同优先级的 loader 执行顺序为：从右到左，从下到上。

例如
```js
module: {
  rules: [
    {
      enforce: "pre",
      test: /\.js$/,
      loader: "loader1",
    },
  ]
}
```
3、使用loader的方式
- 配置方式：在 webpack.config.js 文件中指定 loader。（pre、normal、post loader）
- 内联方式：在每个 import 语句中显式指定 loader。（inline loader）

4、inline loader
用法
```js
import Styles from 'style-loader!css-loader?modules!./styles.css';
```
含义：

使用 css-loader 和 style-loader 处理 styles.css 文件

通过 ! 将资源中的 loader 分开

inline loader 可以通过添加不同前缀，跳过其他类型 loader。
- ! 跳过 normal loader。
- -! 跳过 pre 和 normal loader。
- !! 跳过 pre、 normal 和 post loader。

### 开发一个简单loader

```js
// 它接受要处理的源码作为参数，输出转换后的 js 代码。
module.exports = function loader1(content) {
    console.log("hello loader");
    return content;
};
```

loader接收3个参数
- content 源文件的内容
- map SourceMap 数据
- meta 数据，可以是任何内容，主要是用于loader中的参数传递

### loader的分类
#### 1、同步loader
```js
module.exports = function (content, map, meta) {
  return content;
};
```
也可以使用callback的方式，这种方式更灵活，可以传递多个参数，推荐使用
```js
module.exports = function (content, map, meta) {
    // 传递map，让source-map不中断
    // 传递meta，让下一个loader接收到其他参数
    this.callback(null, content, map, meta);
    return; // 当调用 callback() 函数时，总是返回 undefined
};
```

#### 2、异步loader
使用this.async()
```js
module.exports = function (content, map, meta) {
    const callback = this.async();
    // 进行异步操作
    setTimeout(() => {
        callback(null, result, map, meta);
    }, 1000);
};
```
**由于同步计算过于耗时，在 Node.js 这样的单线程环境下进行此操作并不是好的方案，我们建议尽可能地使你的 loader 异步化。但如果计算量很小，同步 loader 也是可以的。**

#### 3、Raw Loader
默认情况下，资源文件会被转化为 UTF-8 字符串，然后传给 loader。通过设置 raw 为 true，loader 可以接收原始的 Buffer。

比如我们处理一些图片资源就需要用到这种loader

module.exports.raw = true; // 开启 Raw Loader
```js
module.exports = function (content) {
    // content是一个Buffer数据
    return content;
};
module.exports.raw = true; // 开启 Raw Loader
```

#### Pitching Loader

```js
module.exports = function (content) {
    return content;
};
module.exports.pitch = function (remainingRequest, precedingRequest, data) {
    console.log("do somethings");
};
```
webpack 会先从左到右执行 loader 链中的每个 loader 上的 pitch 方法（如果有），然后再从右到左执行 loader 链中的每个 loader 上的普通 loader 方法
<img width="100%" src="./images/loader1.png">

在这个过程中，如果有pitch return则 loader 链被阻断。webpack 会跳过后面所有的的 pitch 和 loader，直接进入上一个 loader 
<img width="100%" src="./images/loader2.png">

#### 常用的loader Api
更多文档可以看官网<a href="https://webpack.docschina.org/api/loaders/#the-loader-context"> webpack 官方 loader api 文档</a>

- this.async 异步回调 loader。返回 this.callback
- this.callback 可以同步或者异步调用的并返回多个结果的函数
- this.getOptions(schema) 获取 loader 的 options
- this.emitFile 产生一个文件
- this.utils.contextify 返回一个相对路径
- this.utils.absolutify 返回一个绝对路径

