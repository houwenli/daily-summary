## 协变与逆变
这个概念比较陌生，在函数的类型兼容中我们会遇到一个问题
定义一个函数 A -> B，实际操作中我们可能入参是C，返回是D(C -> D)这样，当然入参C和A肯定有关系，返回D和B也有关系
那么问题来了，关系是什么呢，入参和返回，定义和调用中，到底谁是父类型，谁是子类型呢

开始文章之前我们先约定一下标记
A《 B 是指A是B的子类型
A -> B 指的是入参是A，返回值是B
x: A 是指x的类型是A

#### 下面我们看一个有趣的事情
假设我们有如下一个关系，可以直接想象用类吧，也可以想象成自然界的关系
GrayDog 《  Dog 《  Animal
灰狗是狗的子类，狗是动物的子类

我们定义一个方法
Dog -> Dog

我们要如何实现这个方法呢，当然Dog -> Dog是肯定没有问题的，有其他实现么
例如以下几种情况，那种可以实现
GrayDog -> GrayDog
GrayDog -> Animal
Animal -> Animal
Animal -> Greyhound

我们可以挨个分析一下
1、GrayDog -> GrayDog
我们的入参是dog，dog可能不只是grayDog，可能是yellowDog，所以入参只是grayDog肯定不合适

2、GrayDog -> Animal
和1一样

3、Animal -> Animal
先分析一下入参，我们需要的是dog，我们可能以所有的狗来调用，所有的狗除了是狗，还是动物，所以动物的入参就是兼容的
而返回呢，原始方法中我们需要返回的是dog，我们可能需要让dog汪汪叫，但是当前方法有可能返回了一个cat，所以返回值不兼容

4、Animal -> Greyhound
这个就满足了3的分析

综上得出结论：Animal -> Greyhound 《 Dog -> Dog

实际上我们还能通过代码的方式来理解
首先来看看返回值（比较好理解）
比如：
let A = Dog -> Dog
let B = Animal -> Greyhound

我们给方法赋值，其实A的类型可以理解成就是Dog，而B的类型就是Greyhound
而Dog = Greyhound 照我们上面的说法子类型可以赋值给父类型就是成立的了

同样的来看看参数
我们假设返回值一样，Dog -> Dog
现在定义了一个GrayDog -> Dog
let A = Dog -> Dog
let B = GrayDog -> Dog

function (B) {
    console.log(GrayDog.'我是灰色的')
}

A = B 后
我们给A传参Dog，这个时候方法体已经变成了上面的，而方法体中需要 GrayDog的灰色属性，Dog中肯定不会有这么具体的属性，所以就不兼容

再来看看Animal -> Dog
let A = Dog -> Dog
let B = Animal -> Dog

function (B) {
    console.log(Animal.'我是动物')
}
A = B 后
我们给A传参Dog，方法体变成了有关Animal的，不管里面有啥属性方法，Dog作为子类型都会存在，所以是兼容的

结论：
let A = Dog -> Dog
let B = Animal -> Greyhound

A = B
实际上就是说用Dog去适配Animal的方法体

```js
interface Animal {
    age: number
}
    
interface Dog extends Animal {
    bark(): void
}

let haveAnimal = (animal: Animal) => {
    animal.age
}
let haveDog = (dog: Dog) => {
    dog.age
    dog.bark()
}

// 不能将类型“(dog: Dog) => void”分配给类型“(animal: Animal) => void”。
//   参数“dog”和“animal” 的类型不兼容。
//     类型 "Animal" 中缺少属性 "bark"，但类型 "Dog" 中需要该属性。
// 报错
haveAnimal = haveDog

```