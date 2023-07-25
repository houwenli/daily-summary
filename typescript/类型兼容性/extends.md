# extends

这个很神奇

```js

type MyExclude<T, U> = T extends U ? never : T
type Result = MyExclude('a' | 'b' | 'c', 'a') // 'b' | 'c'

```

当T是联合类型时，这个叫做分布式条件类型，理解父子类型就很好理解了，有点类似于数学中的因式分解

(a + b + c) * x = ax + bx + cx

上面的例子可以分解成'a' | 'b' | 'c'，分别判断a,b,c是否属于a的子类型，如果是就不管，不是就取出来

当然也可以把never和T互换，可以想象一下结果是什么
