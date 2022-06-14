## 手写loader

### 手写 clean-log-loader

清除js中的console.log

很简单，使用正则表达式就好了
```js
module.exports = function cleanLogLoader(content) {
  // 将console.log替换为空
  return content.replace(/console\.log\(.*\);?/g, "");
};
```

### 手写 banner-loader
思路：
定义一个头部，然后加在文件头部然后return出去就好了

通常我们再获取options的时候都要校验一下数据格式，防止写错配置导致loader运行出错，如果schema格式校验失败，直接抛出异常，当前loader直接不执行
```js
const schema = require("./schema.json");

module.exports = function (content) {
  // 获取loader的options，同时对options内容进行校验
  // schema是options的校验规则（符合 JSON schema 规则）
  const options = this.getOptions(schema);

  const prefix = `
    /*
    * Author: ${options.author}
    */
  `;

  return `${prefix} \n ${content}`;
};
```

schema文件格式，示例

additionalProperties // 是否允许追加属性
```js
{
  "type": "object",
  "properties": {
    "author": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```