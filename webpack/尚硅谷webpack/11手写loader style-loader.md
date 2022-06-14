## 11手写loader style-loader

### style-loader
作用：动态创建 style 标签，插入 js 中的样式代码，使样式生效。

思路：
这个laoder是处理css文件的，我们获取css文件的内容，然后创建style标签，把css填充到style标签，并且appendChild到文件头部就好了

用JSON.stringify包裹一下的原因是因为content中有换行会导致js执行出错
```js
module.exports = function (content) {

    // 因为content中有换行会导致js执行出错，所以使用JSON.stringify包裹一下
    const script = `
        const styleEle = document.createElement('style');
        styleEle.innerHTML = ${JSON.stringify(content)};
        document.head.appendChild(styleEle);
    `;
    return script;
}
```
此时我们会发现/

css中的图片路径没有处理，这种方式只能处理普通样式

这里需要借助css-loader，处理依赖路径，并且下载依赖

直接在loader中使用css-loader之后，再查看会发现

css-loader会返回一段js，这段js就是处理css的方法，最后export default xxx

```js
Imports
import ___CSS_LOADER_API_NO_SOURCEMAP_IMPORT___ from "../../node_modules/css-loader/dist/runtime/noSourceMaps.js";
import ___CSS_LOADER_API_IMPORT___ from "../../node_modules/css-loader/dist/runtime/api.js";
import ___CSS_LOADER_GET_URL_IMPORT___ from "../../node_modules/css-loader/dist/runtime/getUrl.js";
var ___CSS_LOADER_URL_IMPORT_0___ = new URL("../asset/aaa.png", import.meta.url);
var ___CSS_LOADER_URL_IMPORT_1___ = new URL("../asset/bbb.jpg", import.meta.url);
var ___CSS_LOADER_URL_IMPORT_2___ = new URL("../asset/ccc.jpeg", import.meta.url);
var ___CSS_LOADER_EXPORT___ = ___CSS_LOADER_API_IMPORT___(___CSS_LOADER_API_NO_SOURCEMAP_IMPORT___);
var ___CSS_LOADER_URL_REPLACEMENT_0___ = ___CSS_LOADER_GET_URL_IMPORT___(___CSS_LOADER_URL_IMPORT_0___);
var ___CSS_LOADER_URL_REPLACEMENT_1___ = ___CSS_LOADER_GET_URL_IMPORT___(___CSS_LOADER_URL_IMPORT_1___);
var ___CSS_LOADER_URL_REPLACEMENT_2___ = ___CSS_LOADER_GET_URL_IMPORT___(___CSS_LOADER_URL_IMPORT_2___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".box1 {\n    width: 100px;\n    height: 100px;\n    background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\n    background-size: cover;\n}\n\n.box2 {\n    width: 100px;\n    height: 100px;\n    background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_1___ + ");\n    background-size: cover;\n}\n\n.box3 {\n    width: 100px;\n    height: 100px;\n    background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_2___ + ");\n    background-size: cover;\n}", ""]);
// Exports
export default ___CSS_LOADER_EXPORT___;
```

那我们想想该怎么做呢，可以提前拿到css的处理结果吗

**在nomal loader中直接运行js会比较麻烦，我们可以提前拿到文件处理路径，然后再import就好了**

使用pitch-loader

pitch方法可以提前拿到后面**所有loader**的处理

/Users/houwenli/Documents/工作空间/workspace_test/webpack_code/day4/node_modules/css-loader/dist/cjs.js!/Users/houwenli/Documents/工作空间/workspace_test/webpack_code/day4/node_modules/sass-loader/dist/cjs.js!/Users/houwenli/Documents/工作空间/workspace_test/webpack_code/day4/src/css/index.css

这里是一个绝对路径，我们最终需要转化成一个相对路径才能处理

比如第一个loader最终希望得到：../../node_modules/css-loader/dist/cjs.js!./index.css

```js
/* 
要求：
    1. 必须是相对路径
    2. 相对路径必须以 ./ 或 ../ 开头
    3. 相对路径的路径分隔符必须是 / ，不能是 \
*/
```

最终的实现
```js
module.exports = function (content) {}
module.exports.pitch = function (remainingRequest) {
    // 这里是一个绝对路径，我们最终需要转化成一个相对路径才能处理
    // 最终希望得到：../../node_modules/css-loader/dist/cjs.js!./index.css
    /* 
    要求：
      1. 必须是相对路径
      2. 相对路径必须以 ./ 或 ../ 开头
      3. 相对路径的路径分隔符必须是 / ，不能是 \
    */
    const relativeRequest = remainingRequest
    .split('!')
    .map(item => {
        const relativePath = this.utils.contextify(this.context, item);
        return relativePath;
    })
    .join('!');

    // relativeRequest是inline loader用法，代表要处理的index.css资源, 使用css-loader处理
    // !!代表禁用所有配置的loader，只使用inline loader。（也就是外面我们style-loader和css-loader）,它们被禁用了，只是用我们指定的inline loader，也就是css-loader
    // 自测如果没有!! 这种类似修饰符会报错
    const script = `
        import style from '!!${relativeRequest}'
        const styleEle = document.createElement('style');
        styleEle.innerHTML = style;
        document.head.appendChild(styleEle);
    `;

    // style-loader是第一个loader, 由于return导致熔断，所以其他loader不执行了（不管是normal还是pitch）
    return script;

};
```

注意：

import style from '!!${relativeRequest}'

!!代表禁用所有配置的loader，只使用inline loader。（也就是外面我们style-loader和css-loader）,它们被禁用了，只是用我们指定的inline loader，也就是当前css-loader

自测如果没有!! 这种类似修饰符会报错

最后，我们这个style-loader已经写完了，所以就不需要后面的loader了，所以使用return 熔断