## map，set，WeakMap，WeakSet用法和区别

### Set
es6 提供的新的数据结构，类似于数组，但是成员都是唯一值

Set是构造函数

构造函数可以接收一个数组作为参数，也可以不接受参数使用add的方式添加实例成员，另外Set还可以接收类数组作为参数
```js
// 第一种
const s = new Set();
[2, 3, 5, 4, 5, 2, 2].forEach(x => s.add(x));
// s => Set(4) {2, 3, 5, 4}

// 第二种
const items = new Set([1, 2, 3, 4, 5, 5, 5, 5]);
// items => Set(5) {1, 2, 3, 4, 5}

// 第三种
const set = new Set(document.querySelectorAll('div'));

```

上面的例子我们可以得到两种巧妙的方法

1、去除数组中重复数据
```js
const items = [...new Set([1, 2, 3, 4, 5, 5, 5, 5])];
```
2、去除字符串中的重复字符
```js
const items = [...new Set('aabccsdd')].join('');
```

像Set加入值的时候不会发生类型转换，所以5和"5"是不一样的，当然对象存储的地址，两个{}空对象也是不相等的，Set内部判断值是否相同类似于===全等运算符，**只有一点差异，Set会认为NaN等于NaN，但是===会认为NaN不等于NaN**
```js
let set = new Set();
let a = NaN;
let b = NaN;
set.add(a);
set.add(b);
set // Set(1) {NaN}

a === b // false
```

#### Set的实例属性和方法
属性
- Set.prototype.constructor：构造函数，其实就是Set函数
- Set.prototype.size：返回Set实例成员的总数，**size属性不可以赋值，不会报错，但是修改无用**

方法，主要分为两大类，操作方法和遍历方法

操作方法
- Set.prototype.add(value)：添加值，返回添加值后的Set数据
- Set.prototype.delete(value)：删除值，返回bool值，表示删除是否成功
- Set.prototype.has(value)：返回bool值，表示是否包含该值
- Set.prototype.clear()：清楚所有成员，没有返回值
```js
s.add(1).add(2).add(2);
// 注意2被加入了两次

s.size // 2

s.has(1) // true
s.has(2) // true
s.has(3) // false

s.delete(2);
s.has(2) // false
```
Array.from方法可以将 Set 结构转为数组，所以我们可以得到数组去重的另一种方法
```js
const items = Array.from(new Set([1, 2, 3, 4, 5, 5, 5, 5]));
```

遍历方法
- Set.prototype.keys()：返回键名
- Set.prototype.values()：返回键值
- Set.prototype.entries()：返回键值对
- Set.prototype.forEach()：使用回调遍历每个成员

**Set的遍历顺序就是插入顺序，这个特性非常有用，比如使用Set保存一个回调列表，调用时就可以保证按顺序执行**

keys方法、values方法、entries方法返回的都是遍历器对象，由于 Set 结构没有键名，只有键值，所以keys方法和values方法的行为完全一致**基于这种说法，for in遍历Set实例时无法获取到值，for of是可以的**
```js
let set = new Set(['red', 'green', 'blue']);

for (let item of set.keys()) {
  console.log(item);
}
// red
// green
// blue

for (let item of set.values()) {
  console.log(item);
}
// red
// green
// blue

for (let item of set.entries()) {
  console.log(item);
}
// ["red", "red"]
// ["green", "green"]
// ["blue", "blue"]
```

### WeakSet
WeakSet 结构与 Set 类似，也是不重复的值的集合。但是，它与 Set 有两个区别。
- WeakSet的值只能是对象，而不能是其他的值
- 不适合被引用，也不可遍历

WeakSet 中的对象都是弱引用，即垃圾回收机制不考虑 WeakSet 对该对象的引用，也就是说，如果其他对象都不再引用该对象，那么垃圾回收机制会自动回收该对象所占用的内存，不考虑该对象还存在于 WeakSet 之中。
  - 由于上面这个特点，WeakSet 的成员是不适合引用的，因为它会随时消失。
  - 由于 WeakSet 内部有多少个成员，取决于垃圾回收机制有没有运行，运行前后很可能成员个数是不一样的，而垃圾回收机制何时运行是不可预测的，因此 ES6 规定 WeakSet 不可遍历。

**方法只有操作方法，因为无法遍历，无遍历方法**

属性
- Set.prototype.constructor：构造函数，其实就是Set函数
- 无size属性

操作方法：
- WeakSet.prototype.add(value)：向 WeakSet 实例添加一个新成员。
- WeakSet.prototype.delete(value)：清除 WeakSet 实例的指定成员。
- WeakSet.prototype.has(value)：返回一个布尔值，表示某个值是否在 WeakSet 实例之中。

WeakSet 不能遍历，是因为成员都是弱引用，随时可能消失，遍历机制无法保证成员的存在，很可能刚刚遍历结束，成员就取不到了。WeakSet 的一个用处，是储存 DOM 节点，而不用担心这些节点从文档移除时，会引发内存泄漏。
```js
const foos = new WeakSet()
class Foo {
  constructor() {
    foos.add(this)
  }
  method () {
    if (!foos.has(this)) {
      throw new TypeError('Foo.prototype.method 只能在Foo的实例上调用！');
    }
  }
}
```
这里使用 WeakSet 的好处是，foos对实例的引用，不会被计入内存回收机制，所以删除实例的时候，不用考虑foos，也不会出现内存泄漏。

### Map
它类似于对象，也是键值对的集合，但是“键”的范围不限于字符串，各种类型的值（包括对象）都可以当作键。也就是说，Object 结构提供了“字符串—值”的对应，Map 结构提供了“值—值”的对应，是一种更完善的 Hash 结构实现。如果你需要“键值对”的数据结构，Map 比 Object 更合适。

实例的属性和操作方法

- Map.prototype.size：属性返回 Map 结构的成员总数。
- Map.prototype.set(key, value)：set方法设置键名key对应的键值为value，然后返回整个 Map 结构。如果key已经有值，则键值会被更新，否则就新生成该键。
- Map.prototype.get(key)：get方法读取key对应的键值，如果找不到key，返回undefined。
- Map.prototype.has(key)：has方法返回一个布尔值，表示某个键是否在当前 Map 对象之中。
- Map.prototype.delete(key)：delete方法删除某个键，返回true。如果删除失败，返回false。
- Map.prototype.clear()：clear方法清除所有成员，没有返回值。
基本用法
```js
const m = new Map();
const o = {p: 'Hello World'};

m.set(o, 'content')
m.get(o) // "content"

m.has(o) // true
m.delete(o) // true
m.has(o) // false
```

作为构造函数，Map 也可以接受一个数组作为参数。该数组的成员是一个个表示键值对的数组。数组中，如果
```js
const map = new Map([
  ['name', '张三'],
  ['title', 'Author'],
  ['name1', '张三', 'ddd'], // 多的话只取两个
  ['age'], // 少一个相当于 ['age', undefined]
  [], // 没有，相当于[undefined, undefined]
]);

map.size // 2
map.has('name') // true
map.get('name') // "张三"
map.has('title') // true
map.get('title') // "Author
```
不仅仅是数组，任何具有 Iterator 接口、且每个成员都是一个双元素的数组的数据结构都可以当作Map构造函数的参数。这就是说，Set和Map都可以用来生成新的 Map。
```js
const set = new Set([
  ['foo', 1],
  ['bar', 2]
]);
const m1 = new Map(set);
m1.get('foo') // 1

const m2 = new Map(m1);
m2.get('foo') // 1
```

Map 的键实际上是跟内存地址绑定的，只要内存地址不一样，就视为两个键。这就解决了同名属性碰撞（clash）的问题，我们扩展别人的库的时候，如果使用对象作为键名，就不用担心自己的属性与原作者的属性同名。

如果 Map 的键是一个简单类型的值（数字、字符串、布尔值），则只要两个值严格相等，Map 将其视为一个键，比如0和-0就是一个键，布尔值true和字符串true则是两个不同的键。另外，undefined和null也是两个不同的键。虽然NaN不严格相等于自身，但 Map 将其视为同一个键。

遍历方法
- Map.prototype.keys()：返回键名的遍历器。
- Map.prototype.values()：返回键值的遍历器。
- Map.prototype.entries()：返回所有成员的遍历器。
- Map.prototype.forEach()：遍历 Map 的所有成员。

Map 结构转为数组结构，比较快速的方法是使用扩展运算符（...）
```js
const map = new Map([
  [1, 'one'],
  [2, 'two'],
  [3, 'three'],
])

[...map.keys()] // [1, 2, 3]

[...map.values()] // ['one', 'two', 'three']

[...map.entries()] // [[1, 'one'], [2, 'two'], [3, 'three']]

[...map] // [[1, 'one'], [2, 'two'], [3, 'three']]
```

使用map和filter可以快速实现map的遍历和过滤
```js
const map0 = new Map()
  .set(1, 'a')
  .set(2, 'b')
  .set(3, 'c');

const map1 = new Map([...map0].filter((item, index) => {
    return index > 2
}) )

const map2 = new Map(
  [...map0].map(([k, v]) => [k * 2, '_' + v])
    );

```
此外map还有forEach方法，和数组的方法类似，用于遍历map实例，**map的forEach还接受第二个参数用来绑定this**
```js
const map = new Map([['a', 1], ['b', 2], ['c', 3]])
const reporter = {
  report: function(key, value) {
    console.log("Key: %s, Value: %s", key, value);
  }
};
map.forEach(function(value, key, map) {
  this.report(key, value);
}, reporter);
```
上面代码中，forEach方法的回调函数的this，就指向reporter。

### WeakMap
WeakMap结构与Map结构类似，也是用于生成键值对的集合。

WeakMap与Map的区别有两点。
- WeakMap只接受对象作为键名（null除外），不接受其他类型的值作为键名
- WeakMap的键名所指向的对象，不计入垃圾回收机制。

我们先来看看痛点
```js
const e1 = document.getElementById('foo');
const e2 = document.getElementById('bar');
const arr = [
  [e1, 'foo 元素'],
  [e2, 'bar 元素'],
];

// 一旦我们不想使用e1，e2
arr [0] = null;
arr [1] = null;

```
上面这样的写法显然很不方便。一旦忘了写，就会造成内存泄露。

WeakMap 就是为了解决这个问题而诞生的，它的键名所引用的对象都是弱引用，即垃圾回收机制不将该引用考虑在内。因此，只要所引用的对象的其他引用都被清除，垃圾回收机制就会释放该对象所占用的内存。也就是说，一旦不再需要，WeakMap 里面的键名对象和所对应的键值对会自动消失，不用手动删除引用。
```js
const wm = new WeakMap();

const element = document.getElementById('example');

wm.set(element, 'some information');
wm.get(element)
```
当我们要清除element时，完全不用担心vm中的element引用

WeakMap不能遍历，所以没有遍历方法，也就只有几个操作方法了，get， set， has，delete

### node中演示垃圾回收后的内存释放

首先打开node命令行， --expose-gc参数表示允许手动执行垃圾回收机制。
```js
$ node --expose-gc
```
然后按如下输入观察结果
```cmd
> global.gc();
undefined

// 查看内存占用的初始状态，heapUsed 为 4M 左右
> process.memoryUsage();
{ rss: 21106688,
  heapTotal: 7376896,
  heapUsed: 4153936,
  external: 9059 }

> let wm = new WeakMap();
undefined

// 新建一个变量 key，指向一个 5*1024*1024 的数组
> let key = new Array(5 * 1024 * 1024);
undefined

// 设置 WeakMap 实例的键名，也指向 key 数组
// 这时，key 数组实际被引用了两次，
// 变量 key 引用一次，WeakMap 的键名引用了第二次
// 但是，WeakMap 是弱引用，对于引擎来说，引用计数还是1
> wm.set(key, 1);
WeakMap {}

> global.gc();
undefined

// 这时内存占用 heapUsed 增加到 45M 了
> process.memoryUsage();
{ rss: 67538944,
  heapTotal: 7376896,
  heapUsed: 45782816,
  external: 8945 }

// 清除变量 key 对数组的引用，
// 但没有手动清除 WeakMap 实例的键名对数组的引用
> key = null;
null

// 再次执行垃圾回收
> global.gc();
undefined

// 内存占用 heapUsed 变回 4M 左右，
// 可以看到 WeakMap 的键名引用没有阻止 gc 对内存的回收
> process.memoryUsage();
{ rss: 20639744,
  heapTotal: 8425472,
  heapUsed: 3979792,
  external: 8956 }
```
上面代码中，只要外部的引用消失，WeakMap 内部的引用，就会自动被垃圾回收清除。由此可见，有了 WeakMap 的帮助，解决内存泄漏就会简单很多。

### WeakMap 的用途
WeakMap 应用的典型场合就是 DOM 节点作为键名
```js
let myWeakmap = new WeakMap();

myWeakmap.set(
  document.getElementById('logo'),
  {timesClicked: 0})
;

document.getElementById('logo').addEventListener('click', function() {
  let logoData = myWeakmap.get(document.getElementById('logo'));
  logoData.timesClicked++;
}, false);
```

可以想象原始的方法，我们再addEventListener中仍然使用document.getElementById('logo')，一旦logo dom节点删除，内存中仍然会存在引用
