## watcher和dep

在本节课我们改写了observe方法

```js
function observe (obj, vm) {
    // 数组
    if (Array.isArray(obj)) {
        obj.__proto__ = arr_methods
        for(let i = 0; i < obj.length; i++) {
            observe(obj[i], vm)

            // 这里在vue源码中没有，这也是vue改变下标没用的原因
            // Object.defineProperty操作的是对象，实际上也能操作数组，key值就是数组的下标
            // vue中没有实现这个功能是因为性能问题
            // 作者也有回答，大体来说，就是 性能代价和获得的用户体验不成正比。
            defineReactive.call(vm, obj, i, obj[i], true);
        }
    } 
    // 对象
    else {
        let keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
            let prop = keys[i];
            // 判断属性是不是引用类型，如果是引用类型就需要递归，如果不是就不用
            // 如果是数组就需要循环数组，对数组中的元素再完成上面的判断
    
            let value = obj[prop];
            defineReactive.call(vm, obj, prop, value, true);
        }
    }

}
```
从这里我们可以解释一个问题，在使用vue时，我们在用数组下标去改变数组值的时候不生效，从这里我们可以看出，当值是数组时，vue是没对值进行响应式化的

Object.defineProperty操作的是对象，实际上也能操作数组，key值就是数组的下标

vue中没有实现这个功能是因为性能问题

作者也有回答，大体来说，就是 性能代价和获得的用户体验不成正比。

在实验中，当读取下标的次数增长太多，性能消耗会成指数式增长，对vue这种及时性要求很强的框架来说，用户体验会变得很差

#### 实现watcher和依赖收集
结合发布订阅模式，在vue中我们可以有以下理解
- 首先我们创建一个全局的watcher（vue中是按组件创建的，这里我们简单理解）
- 模板中有使用变量时{{name}}，这时相当于是订阅，告诉vue我们订阅了这个属性，当有修改的时候记得通知模板，这里就是收集依赖的过程，传入处理函数
- 当订阅的数据发生变化的时候，我们就调用这个数据的依赖，调用处理函数进行更新

watcher.js
```js
class Watcher {
    /**
     * 
     * @param {*} vm 
     * @param {*} expOrFn 
     * // 如果是渲染watcher这里穿的就是方法，如果是计算属性，watcher传入的就是一个字符串？？？
     */
    constructor (vm, expOrFn) {
        this.vm = vm;
        
        this.getter = expOrFn;

        this.deps = [];

        this.depIds = {}; // vue源码里面，这里是一个set结构，保证数据的唯一性，简化代码先不讨论这一块

        // 一开始时需要渲染
        this.get();
    }

    // 计算属性，触发getter
    get () {
        this.getter.call(this.vm, this.vm);
    }

    run () {
        this.get();
    }

    update () {
        this.run();
    }

    cleanupDep () {

    }
}
```

dep.js
```js
class Dep {
    constructor () {
        this.subs = []; // 存储的是与当前dep关联的watcher
    }

    // 添加一个watcher
    addSub (sub) {

    }

    // 删除一个watcher
    remove (sub) {

    }

    // 将当前dep与watcher关联
    depend () {

    }

    // 触发与之关联的watcher的update方法，起到更新作用
    notify () {
        if (Dep.target) {
            Dep.target.update();
        }
    }
}

// 存储全局的watcher
Dep.target = null;
```

在数据get，set的时候存储依赖和触发依赖
```js
Object.defineProperty(target, key, {
    enumerable: !!enumerable,
    configurable: true,
    set (newVal) {
        console.log(`设置${key}属性为${newVal}`);

        if (value === newVal) {
            return;
        }

        value = newVal;
        if(typeof value === 'object' && value !== null) {
            // 将新数据进行响应式化
            observe(value, that);
        }

        // that.mountComponent()

        // 派发更新
        dep.notify();

    },
    get () {
        // 依赖收集
        console.log(`读取${key}属性`);
        return value;
    }
});
```

首先这是简化代码，属性的set都会触发更新

一进入页面的时候会触发全局更新，此时也相当于是个观察者模式，页面主组件订阅了所有的{{name}}{{age}}等等属性，这里传入了mount方法，当有数据发生变化时，就会触发订阅事件，调用mount方法，整个主组件都会重新渲染
```js
// 执行
JGVue.prototype.mountComponent = function () {
    let mount = () => {
        this.update(this.render())
    }
    
    // mount.call(this)

    // 本质上应该教给watcher来调用，以后会学
    Dep.target = new Watcher(this, mount);
}
```

#### 如何将属性与当前watcher关联起来
- 在全局准备一个targetStack（watcher栈，简单理解为watcher数组，把一个操作中需要用到的watcher存起来）
- 在watcher调用get方法时，将当前的watcher放入全局，在get之前结束的时候，将这个全局watcher移除，提供pushTarget和popTarget方法
- 在每一个属性中，都有一个dep对象

简单解释

我们再访问对象属性的时候（get），我们的渲染watcher就在全局中
将属性与watcher关联，其实就是将当前渲染的watcher存储到属性相关的dep中
同时将dep也存储到全局的watcher中
- 属性引用了当前的渲染watcher，**属性知道谁要渲染他**
- 当前渲染watcher引用了dep属性，**渲染watcher知道他要渲染谁**

我们的dep中有一个subs属性，存储的就是**知道要渲染什么的watcher**
另外有一个notify方法，去执行watcher中的update方法