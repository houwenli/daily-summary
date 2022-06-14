## 处理资源

前面发现，我们打包的文件比较乱，所有的js都在main.js里面，如果我们需要分开打包怎么办呢，比如分成多个js，css单独打包，图片文件单独打包？

### 修改输出资源的名称和路径

修改js输出路径
```js
output: {
    path: path.resolve(__dirname, "dist"),
    filename: "static/js/main.js", // 将 js 文件输出到 static/js 目录中
},
```

修改图片输出路径**generator**
```js
{
    test: /\.(png|jpe?g|gif|webp)$/,
    type: 'asset',
    parser: {
        dataUrlCondition: {
            maxSize: 10 * 1024 // 小于10kb的图片会被base64处理
        }
    },
    generator: {
        // [hash:8]: hash值取8位
        // [ext]: 使用之前的文件扩展名
        // [query]: 添加之前的query参数
        filename: 'static/images/[hash][ext][query]'
    }
}
```
这样生成的图片名称就是15a71b7de9d49428b12b.jpeg

如果觉得名称太长可以使用hash:10的方式

### 自动清空上次打包资源
```js
output: {
    clean: true, // 自动将上次打包目录资源清空
},
```

### 处理字体图标资源
其实我们不需要任何配置，字体文件就能被识别，并且编译到根目录下面去

但是我们问了代码结构可读性，需要额外的一些配置，比如文件路径等
```js
{
    test: /\.(ttf|woff2?)$/,
    type: "asset/resource",
    generator: {
        filename: "static/media/[hash:8][ext][query]",
    },
},
```
注意一下asset/resource和asset的区别
- type: "asset/resource" 相当于file-loader, 将文件转化成 Webpack 能识别的资源，其他不做处理
- type: "asset" 相当于url-loader, 将文件转化成 Webpack 能识别的资源，同时小于某个大小的资源会处理成 data URI 形式

### 处理其他资源
统一通过asset/resource处理就好了
```js
{
    test: /\.(ttf|woff2?|map4|map3|avi)$/,
    type: "asset/resource",
    generator: {
        filename: "static/media/[hash:8][ext][query]",
    },
}
```

### 处理js资源
js资源其实已经处理过了，那么这里还需要处理什么呢？

因为webpack处理js资源的能力是有限的，只能编译 js 中 ES 模块化语法，不能编译其他语法，所以在低版本浏览器中运行是有问题的，所以我们需要对js做一些兼容性处理

另外，各个人写代码的规范会有差异，我们需要统一代码规范

这里我们用到两个工具
- babel js 兼容性处理
- eslint js 代码规范

我们先完成 Eslint，检测代码格式无误后，在由 Babel 做代码兼容性处理

### Eslint
我们使用 Eslint，关键是写 Eslint 配置文件，里面写上各种 rules 规则，将来运行 Eslint 时就会以写的规则对代码进行检查

#### 配置文件
.eslintrc.*：新建文件，位于项目根目录，格式有以下几种
- .eslintrc
- .eslintrc.js
- .eslintrc.json
  
区别在于配置格式不一样，比如.js文件需要按照esmodule规范书写，比如
```js
module.exports = {}
```
其他两种直接用json格式就好了
#### 具体配置
```js
module.exports = {
    // 解析选项
    parserOptions: {},
    // 具体检查规则
    rules: {},
    // 继承其他规则
    extends: [],
    // ...
    // 其他规则详见：https://eslint.bootcss.com/docs/user-guide/configuring
};
```
其中parserOptions 主要配置语法，模块化，还有一些其他特性， 比如
```js
parserOptions: {
    ecmaVersion: 6, // ES 语法版本
    sourceType: "module", // ES 模块化
    ecmaFeatures: { // ES 其他特性
        jsx: true // 如果是 React 项目，就需要开启 jsx 语法
    }
}
```

rules的规则是最重要的，也是最复杂的，可以看官方文档，也可以继承一个eslint规范，再自定义修改
- "off" 或 0 - 关闭规则
- "warn" 或 1 - 开启规则，使用警告级别的错误：warn (不会导致程序退出)
- "error" 或 2 - 开启规则，使用错误级别的错误：error (当被触发的时候，程序会退出)
```js
rules: {
  semi: "error", // 禁止使用分号
  'array-callback-return': 'warn', // 强制数组方法的回调函数中有 return 语句，否则警告
  'default-case': [
    'warn', // 要求 switch 语句中有 default 分支，否则警告
    { commentPattern: '^no default$' } // 允许在最后注释 no default, 就不会有警告了
  ],
  eqeqeq: [
    'warn', // 强制使用 === 和 !==，否则警告
    'smart' // https://eslint.bootcss.com/docs/rules/eqeqeq#smart 除了少数情况下不会有警告
  ],
}
```
extends就比较简单了，我们可以继承一套其他规范，比如
- Eslint 官方的规则：eslint:recommended
- Vue Cli 官方的规则：plugin:vue/essential

#### 使用方法
```js
npm i eslint-webpack-plugin eslint -D
```

配置webpack.config.js
```js
const ESLintWebpackPlugin = require("eslint-webpack-plugin");

plugins: [
    new ESLintWebpackPlugin({
      // 指定检查文件的根目录
      context: path.resolve(__dirname, "src"),
    }),
],
```

### Babel
JavaScript 编译器。

主要用于将 ES6 语法编写的代码转换为向后兼容的 JavaScript 语法，以便能够运行在当前和旧版本的浏览器或其他环境中

#### 配置文件
- babel.config.*：新建文件，位于项目根目录
    - babel.config.js
    - babel.config.json
- .babelrc.*：新建文件，位于项目根目录
    - .babelrc
    - .babelrc.js
    - .babelrc.json

#### 具体配置
```js
module.exports = {
    // 预设
    presets: [],
};
```
presets 预设

简单理解：就是一组 Babel 插件, 扩展 Babel 功能

- @babel/preset-env: 一个智能预设，允许您使用最新的 JavaScript。
- @babel/preset-react：一个用来编译 React jsx 语法的预设
- @babel/preset-typescript：一个用来编译 TypeScript 语法的预设

#### 在 Webpack 中使用
```js
npm i babel-loader @babel/core @babel/preset-env -D
```
定义babel配置
```js
module.exports = {
    presets: ["@babel/preset-env"],
};
```
webpack配置
```js
{
    test: /\.js$/,
    exclude: /node_modules/, // 排除node_modules代码不编译
    loader: "babel-loader",
},
```

执行npx webpack的时候就会发现，const箭头函数语法已经被转义成es5语法了

### 处理html
为什么要处理html呢，在前面我们的index.html中可以看到，js文件是我们手动引进去的，目前只有一个文件，那么如果文件很多呢，一个个引就会很麻烦，而且很不方便，我们可以考虑用一个插件自动把js文件打进html文件中

看看html-webpack-plugin这个插件吧
```js
npm i html-webpack-plugin -D
```
#### 配置
```js
const HtmlWebpackPlugin = require("html-webpack-plugin");
plugins: [
    new HtmlWebpackPlugin({
      // 以 public/index.html 为模板创建文件
      // 新的html文件有两个特点：1. 内容和源文件一致 2. 自动引入打包生成的js等资源
      template: path.resolve(__dirname, "public/index.html"),
    }),
],
```


