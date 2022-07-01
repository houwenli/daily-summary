## BFC

### BFC 即 Block Formatting Contexts (块级格式化上下文)

具有BFC特性的容器可以看做是隔离了的独立容器，容器里面的元素不会在布局上影响外面的元素

通俗一点可以把BFC特性容器理解成一个大箱子，箱子内的东西无论怎么翻江倒海都不会影响外部元素

### 触发BFC
- body根元素
- 浮动元素，float除了none的其他属性
- 绝对定位元素：position (absolute、fixed)
- display 为 inline-block、table-cells、flex
- overflow为auto， scroll，hidden

### BFC解决问题
1、同一个BFC下边距发生重叠，我们会发现两个div之间的边距只有100
```js
<head>
div{
    width: 100px;
    height: 100px;
    background: lightblue;
    margin: 100px;
}
</head>
<body>
    <div></div>
    <div></div>
</body>
```
要解决这个问题可以把两个元素放在不同的BFC中，比如
```js
<div style="overflow: hidden;">
    <p></p>
</div>
<div style="overflow: hidden;">
    <p></p>
</div>
```

2、BFC 可以包含浮动的元素
我们开发的时候如果有元素设置了float，这时会发现撑不起容器了，因为float元素脱离文档流，此时父容器等于没有了内容

我们通常的处理是加入hack，比如clearfix，这就把我们的父元素变成了BFC类型容器
```css
.clearfix {
  overflow: auto;
}
/* 为了兼容性更好加入 */
.clearfix::after {
  content: "";
  clear: both;
  display: table;
}
```

3、BFC 可以阻止元素被浮动元素覆盖

当我们一个元素有float，另外一个没有float，就会发现float元素会把无float元素遮盖一块，当然内容不会遮盖
```html
<div style="height: 100px;width: 100px;float: left;background: lightblue">我是一个左浮动的元素</div>
<div style="width: 200px; height: 200px;background: #eee">我是一个没有设置浮动, 
也没有触发 BFC 元素, width: 200px; height:200px; background: #eee;</div>
```

这时我们就可以启用BFC，在第二个元素中加入 overflow: hidden，

这个方法可以用来实现两列自适应布局，效果不错，这时候左边的宽度固定，右边的内容自适应宽度(