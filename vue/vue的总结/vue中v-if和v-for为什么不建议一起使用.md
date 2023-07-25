# vue中v-if和v-for为什么不建议一起使用

v-if用于条件性的渲染一部分内容

v-for用于循环一个列表

```js
<div id="app">
    <p v-if="isShow" v-for="item in items">
        {{ item.title }}
    </p>
</div>
```

为什么不建议一起使用，是因为优先级上

v-for的优先级高于v-if

就是说当在判断v-if的执行条件的时候，列表其实已经渲染一遍了，而实际上我们需要的是v-if为false的时候里面不用再渲染，所以就会造成性能的浪费

正确的做法是，在v-for外层再包一层元素

```js
<div id="app">
    <div v-if="isShow">
        <p v-for="item in items">
            {{ item.title }}
        </p>
    </div>
</div>
```
