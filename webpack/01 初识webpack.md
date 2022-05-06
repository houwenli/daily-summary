## 初识webpack

#### 安装
1、安装到本地
npm i -D webpack

2、安装到全局
npm i -g webpack

安装完后你可以通过这些途径运行安装到本项目的 Webpack：
- 在项目根目录下对应的命令行里通过 node_modules/.bin/webpack 运行 Webpack 可执行文件。
- 在package.json中的npm script中用如下方式使用webpack，后面再讲webpack的配置用法
```js
"scripts": {
    "start": "webpack --config webpack.config.js"
}
```

#### 使用 Webpack
简单例子，webpack是运行在node环境下，所以最后是通过commonjs规范导出了一个如何构建的对象

执行结束后，根据到处规则，会发现项目中多了一个dist文件夹，里面有bundle.js，这个就是webpack打包的一个总js

他会从入口文件main.js开始，通过导入语句，查找所有的依赖，最后把入口文件和依赖都打包到一个单独的文件。内置支持了AMD，commonjs和es6语法的支持
```js
const path = require('path');

module.exports = {
  // JavaScript 执行入口文件
  entry: './main.js',
  output: {
    // 把所有依赖的模块合并输出到一个 bundle.js 文件
    filename: 'bundle.js',
    // 输出文件都放到 dist 目录下
    path: path.resolve(__dirname, './dist'),
  }
};
```

