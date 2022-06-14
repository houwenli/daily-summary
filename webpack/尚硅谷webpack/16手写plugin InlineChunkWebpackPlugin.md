## InlineChunkWebpackPlugin

**作用：**
webpack 打包生成的 runtime 文件太小了，额外发送请求性能不好，所以需要将其内联到 js 中，从而减少请求数量

**实现思路：**
- 我们需要借助 html-webpack-plugin 来实现
    - 在 html-webpack-plugin 输出 index.html 前将内联 runtime 注入进去
    - 删除多余的 runtime 文件
- 如何操作 html-webpack-plugin？<a href="https://github.com/jantimon/html-webpack-plugin/#afteremit-hook">官方文档</a>
  - const hooks = HtmlWebpackPlugin.getHooks(compilation);
  - hooks.alterAssetTagGroups.tap('xxx', data)

上面的html-webpack-plugin中的data会返回一系列的标签bodyTags，headTags，他们的结构像下面这种，有点像ast语法树
```js
// <script src="xxx"></script>
{
    tagName: 'script',
    voidTag: false,
    meta: { plugin: 'html-webpack-plugin' },
    attributes: { defer: true, type: undefined, src: 'runtime~main.js' }
},

// <script>xxx</script>
{
    tagName: 'script',
    innerHTML: runtime文件内容,
    closeTag: true
},

// 当然还有link，div等其他标签
```
我们找到响应的标签，<script src="xxx"></script>=> <script>xxx</script>进行转化就好了

最后删除生成的runtime文件，要在emit之后操作，delete compilation.assets[xxx];
```js
 hooks.afterEmit.tap('InlineChunkWebpackPlugin', () => {
    Object.keys(compilation.assets).forEach(filename => {
        if (this.tests.some(test => test.test(filename))) {
            delete compilation.assets[filename];
        }
    });
    
});
```


具体实现
```js
const HtmlWebpackPlugin = require('safe-require')('html-webpack-plugin');

class InlineChunkWebpackPlugin {
    constructor(tests) {
        this.tests = tests;
    }
    apply (compiler) {
        compiler.hooks.compilation.tap('InlineChunkWebpackPlugin', (compilation) => {

            // 1、获取html-webpack-plugin的hooks
            // 2、注册html-webpack-plugin的hooks -> alterAssetTagGroups
            // 3、将script中的runtime文件，变成inline script
            const hooks = HtmlWebpackPlugin.getHooks(compilation);
            hooks.alterAssetTagGroups.tap('InlineChunkWebpackPlugin', (data) => {
                // 我们只用里面的headTags和bodyTags
                // 这两个tags里面的资源都需要处理
                data.bodyTags = this.getInlineChunk(data.bodyTags, compilation.assets);
                data.headTags = this.getInlineChunk(data.headTags, compilation.assets);
            });

            // 最后删除runtime文件
            hooks.afterEmit.tap('InlineChunkWebpackPlugin', () => {
                Object.keys(compilation.assets).forEach(filename => {
                    if (this.tests.some(test => test.test(filename))) {
                        delete compilation.assets[filename];
                    }
                });
                
            });
        });
    }
    getInlineChunk (tags, assets) {
        // 实际就是这种转变
        // <script src="xxx"></script> => <script>xxx</script>
        // {
        //     tagName: 'script',
        //     voidTag: false,
        //     meta: { plugin: 'html-webpack-plugin' },
        //     attributes: { defer: true, type: undefined, src: 'runtime~main.js' }
        // },
        // 改成
        // {
        //     tagName: 'script',
        //     innerHTML: runtime文件内容,
        //     closeTag: true
        // },
        return tags.map(tag => {
            const filename = tag.attributes && tag.attributes.src;
            if (this.tests.some(test => test.test(filename))){
                tag = {
                    tagName: 'script',
                    innerHTML: assets[filename].source(),
                    closeTag: true
                };
            }
            return tag;
        });
    }
}

module.exports = InlineChunkWebpackPlugin;
```