# canvas优化

canvas渲染实际上就是一个不断擦除和绘制的过程，一般都要配合requestAnimationFrame实现，这样动画才会丝滑

实际上动画的优化要从两方面入手：

- 尽可能少的绘制
- 尽可能快的绘制

## 尽可能少的绘制

### canvas外的不绘制

我们创建对象的时候存储对象的位置信息，每次发生变化的位置信息都更新，这样就能判断时候在可视区域外了

### 分层

- 动静分成，把静态物体绘制在同一层，动态物体绘制在另一层，然后触发重复渲染的时候只在动态层就好了
- 按功能分层，比如一层专门处理一些交互，比如点击事件之类，另一层就是纯粹渲染
- 临时分层，比如拖动物体的时候，可以临时创建一个canvas，然后拖动的时候渲染的是临时canvas，当拖动结束，去掉临时分层，在原canvas上重新绘制

### 批量绘制

这个和vue中的nextTick差不多，就是收集一系列的操作，在下一个事件周期统一执行

```js
    function batchRender() {
        if (!this.pending) {
            this.pending = true
            requestAnimationFrame(() => {
                this.render()
                this.pending = false
            })
        }
    }
```

### 局部绘制

这里需要引入包围盒的概念，其实就是找到变化区域的最小x，y和最大x，y组成一个新的区间

循环遍历对象查找会有交叉的元素，只绘制这些元素就好了

## 尽可能快的绘制

### 尽量少使用api

比如画折线的时候，我们可以beginPath之后使用lineTo或者moveTo，不要重复去beginPath

### 缓存

有些元素绘制麻烦，但是变化频率有规则，我们可以采用离屏canvas的方式进行缓存，创建一个offscreenVCanvas，然后在offscreenVCanvas上绘制好后，再用drawImage的方式画在原来的canvas上
