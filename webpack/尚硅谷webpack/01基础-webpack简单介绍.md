## webpack简单介绍

### 为什么使用webpack
开发时我么会使用框架开发，比如vue，react，还会使用es6语法，还有css处理器等语法进行开发。但是很多浏览器都是不支持的，我们就必须得给代码重新编译成浏览器可识别的语法才行，所以我们就需要打包工具帮忙做这些事。

除此之外，打包工具还能帮助我们做代码压缩，浏览器兼容，性能提升等

目前流行的打包工具有
grant
gulp
rollup
webpack
vite
等等

### Webpack 是一个静态资源打包工具
它会以一个或多个文件作为打包的入口，将我们整个项目所有文件编译组合成一个或多个文件输出出去。

输出的文件就是编译好的文件，就可以在浏览器段运行了。
### Webpack 本身功能是有限的:
- 开发模式：仅能编译 JS 中的 ES Module 语法
- 生产模式：能编译 JS 中的 ES Module 语法，还能压缩 JS 代码
- Webpack 本身功能比较少，只能处理 js 资源，一旦遇到 css 等其他资源就会报错。

### 启用webpack
- 开发模式
```js
npx webpack ./src/main.js --mode=development
```
- 生产模式
```js
npx webpack ./src/main.js --mode=production
```

### 5大核心概念
- entry（入口）
  - 指示 Webpack 从哪个文件开始打包
- output（输出）
  - 指示 Webpack 打包完的文件输出到哪里去，如何命名等
- loader（加载器）
  - webpack 本身只能处理 js、json 等资源，其他资源需要借助 loader，Webpack 才能解析
- plugins（插件）
  - 扩展webpack功能
- mode（模式）
  - 开发模式：development
  - 生产模式：production

在项目根目录下新建文件：webpack.config.js
```js
module.exports = {
  // 入口
  entry: "",
  // 输出
  output: {},
  // 加载器
  module: {
    rules: [],
  },
  // 插件
  plugins: [],
  // 模式
  mode: "",
};
```
Webpack 是基于 Node.js 运行的，所以采用 Common.js 模块化规范