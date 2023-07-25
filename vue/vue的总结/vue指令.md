# vue指令

vue自带的指令有，v-if，v-for，v-model等

vue还可以自定义指令

语法

```js
// 全局注册
// 他也支持一些狗子函数
Vue.directive('xxx', {
    bind(el, binding, vnode, oldVnode) {

    },
    inserted () {

    },
    update () {

    },
    unbind () {

    }
})
```

## 钩子函数

- bind：只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置
- inserted：被绑定元素插入父节点时调用 (仅保证父节点存在，但不一定已被插入文档中)
- update：所在组件的 VNode 更新时调用，但是可能发生在其子 VNode 更新之前。指令的值可能发生了改变，也可能没有。但是你可以通过比较更新前后的值来忽略不必要的模板更新
- unbind：只调用一次，指令与元素解绑时调用

## 钩子函数参数

- el：可以直接操作dom
- binding：一个对象，包含以下 property：
  - name：指令名，不包括 v- 前缀
  - value：指令的绑定值，例如：v-my-directive="1 + 1" 中，绑定值为 2
  - arg：传给指令的参数，可选。例如 v-my-directive:foo 中，参数为 "foo"

## 举个例子，图片懒加载

```js
const LazyLoad = {
    // install方法
    install(Vue,options){

    // 代替图片的loading图
        let defaultSrc = options.default;
        Vue.directive('lazy',{
            bind(el,binding){
                LazyLoad.init(el,binding.value,defaultSrc);
            },
            inserted(el){
                // 兼容处理
                if('IntersectionObserver' in window){
                    LazyLoad.observe(el);
                }else{
                    LazyLoad.listenerScroll(el);
                }
                
            },
        })
    },
    // 初始化
    init(el,val,def){
        // data-src 储存真实src
        el.setAttribute('data-src',val);
        // 设置src为loading图
        el.setAttribute('src',def);
    },
    // 利用IntersectionObserver监听el
    observe(el){
        let io = new IntersectionObserver(entries => {
            let realSrc = el.dataset.src;
            if(entries[0].isIntersecting){
                if(realSrc){
                    el.src = realSrc;
                    el.removeAttribute('data-src');
                }
            }
        });
        io.observe(el);
    },
    // 监听scroll事件
    listenerScroll(el){
        let handler = LazyLoad.throttle(LazyLoad.load,300);
        LazyLoad.load(el);
        window.addEventListener('scroll',() => {
            handler(el);
        });
    },
    // 加载真实图片
    load(el){
        let windowHeight = document.documentElement.clientHeight
        let elTop = el.getBoundingClientRect().top;
        let elBtm = el.getBoundingClientRect().bottom;
        let realSrc = el.dataset.src;
        if(elTop - windowHeight<0&&elBtm > 0){
            if(realSrc){
                el.src = realSrc;
                el.removeAttribute('data-src');
            }
        }
    },
    // 节流
    throttle(fn,delay){
        let timer; 
        let prevTime;
        return function(...args){
            let currTime = Date.now();
            let context = this;
            if(!prevTime) prevTime = currTime;
            clearTimeout(timer);
            
            if(currTime - prevTime > delay){
                prevTime = currTime;
                fn.apply(context,args);
                clearTimeout(timer);
                return;
            }

            timer = setTimeout(function(){
                prevTime = Date.now();
                timer = null;
                fn.apply(context,args);
            },delay);
        }
    }

}
export default LazyLoad;
```
