## CleanWebpackPlugin

**作用：**

在webpack打包文件输出前，清除之前的内容

**思路：**
- 应该在最后生成文件emit的时候，如果在其他时机，比如在一开始的时候删除，一旦webpack出错，就会直接断掉，什么都不会输出，这时又把上次的结果给删了，显然不太合理
- 如何清空上次打包内容？
  - 通过 compiler 对象获取webpack-config中配置的输出目录
  - 通过文件操作清空内容：通过 compiler.outputFileSystem 操作文件

具体实现：

处理删除文件的时候要递归删除文件夹下所有文件才能再删除文件夹，compiler.outputFileSystem.readdirSync(xxxx)读取的是xxxx下的文件（相对路径），在操作文件的时候一定要加上xxxx
```js
class ClearWebpackPlugin {
    apply (compiler) {
        // 获取文件操作对象
        const fs = compiler.outputFileSystem;

        // 使用emit异步钩子
        compiler.hooks.emit.tapPromise('ClearWebpackPlugin', (compilation) => {
            return new Promise((resolve) => {
                // 获取输出目录
                const outputPath = compiler.options.output.path;
                // 删除目录下所有文件
                const err = this.removeFile(fs, outputPath);

                resolve(err);
            });
        });
    }
    // 删除文件夹下所有内容
    // 删除操作只能删除文件和空文件夹
    // 所以删除操作需要递归进行，如果文件夹中有子文件夹仍然需要调用该方法
    removeFile (fs, outputPath) {
        try {
            // 读取当前目录下所有文件
            const files = fs.readdirSync(outputPath) || [];
            // 遍历文件，删除
            // 此时的files只是当前目录下的文件名需要拼上outputPath
            files.forEach(path => {
                const filePath = `${outputPath}/${path}`;
                // 分析文件，判断类型
                const fileStat = fs.statSync(filePath);
                // 如果是文件夹，遍历
                if (fileStat.isDirectory()) {
                    this.removeFile(fs, filePath);
                } else {
                    // 文件就直接删除
                    fs.unlinkSync(filePath);
                }
            });

            // 最后删除整个目录
            fs.rmdirSync(outputPath);
        } catch (e) {
            return e;
        }
    }
}

module.exports = ClearWebpackPlugin;
```