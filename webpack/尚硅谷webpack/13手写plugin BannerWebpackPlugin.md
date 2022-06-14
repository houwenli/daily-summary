## BannerWebpackPlugin

前面我们用loader的方式为文件添加了头部注释，这样每个经过这个loader处理的文件都会添加这么一段注释

我们现在来用plugin实现一下，在webpack处理结束之后emit文件之前这个阶段来添加这一段注释

开发思路:

- 需要打包输出前添加注释：需要使用 compiler.hooks.emit 钩子, 它是打包输出前触发。
- 如何获取打包输出的资源？compilation.assets 可以获取所有即将输出的资源文件。

开发的时候需要注意，只能处理js和css文件，其他诸如图片资源，字体资源，加入注释就会把文件搞坏

具体实现如下
```js
class BannerPlugin {
    constructor (options = {}) {
        this.options = options;
    }
    apply (compiler) {
        const extentions = ['js', 'css'];

        // emit 是异步钩子
        compiler.hooks.emit.tapPromise('BannerPlugin', (compilation) => {
            // console.log(compilation.assets);
            return new Promise(resolve => {
                // compilation.assets包含所有即将输出的资源
                // 通过过滤只保留需要处理的文件
                const assetPaths = Object.keys(compilation.assets || {})
                    .filter(item => {
                        const pathArr = item.split('.') || [];
                        const extra = pathArr[pathArr.length-1];
                        return extentions.indexOf(extra) > -1;
                    });
                // console.log(assetPaths);
                // 获取文件内容，插入头部注释
                assetPaths.forEach(path => {
                    const fileContent = compilation.assets[path];
                    const prefix = `/*
* Author: ${this.options.author}
*/
                    `;
                    const source = prefix + fileContent.source();
                    // 重新设置文件内容
                    // 特定格式设置
                    compilation.assets[path] = {
                        source() {
                            return source;
                        },
                        size() {
                            return source.length;
                        }
                    };
                });
                resolve();
            });
        });
    }
}

module.exports = BannerPlugin;
```