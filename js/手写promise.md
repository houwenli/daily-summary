## 手写Promise
### promise解决的问题
先看一个例子
```js
let fs = require('fs')
fs.readFile('./name.txt','utf8',function(err,data){
  fs.readFile(data, 'utf8',function(err,data){
    fs.readFile(data,'utf8',function(err,data){
      console.log(data);
    })
  })
})
```
我们之前处理多个异步请求，下一个请求依赖上一个请求结果的的时候往往都会这么写，再在每次请求中组装我们想要的结果，就会使代码变的越来越难以理解，后续阅读维护成本就越来越高，这就是臭名昭著的回调地狱

另外如果并发请求也会处理的比较困难

promise就是为了解决这种情况
- 解决循环嵌套的回调
- 处理并发的异步请求

我们看看promise是怎么处理的
```js
let fs = require('fs')

function read(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) reject(err);
      resolve(data);
    })
  })
}

read('./name.txt').then((data)=>{
  return read(data) 
}).then((data)=>{
  return read(data)  
}).then((data)=>{
    console.log(data);
},err=>{
    console.log(err);
})
```
格式变成线性得了，很优雅，维护和阅读成本也会小了很多

### 开始手写Promise
```js
// 先看看基本用法
const p = new Promise((resolve, reject) => {
    resolve()
    // reject()
})
p.then(ret => {}, err => {})
```
从上面的例子我们可以分析出
- Promise可以理解成定义了一个类
- 类的构造函数接收一个方法，这个方法有俩参数，由类去实现
- 构造函数接收的方法是立即执行的
- promise有3个状态，pending(等待)，fulfilled(成功)，rejected(失败)
- promise状态改变后就不能发生变化了
- resolve，改变promise状态，并且返回一个成功的值
- reject，改变promise状态，并且返回一个失败的值
- then中接收两个方法，onFullfiled参数是resolve的值，onRejected参数是reject的值

基于上面的特征我们实现一下promise
```js
const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';
class Promise {
    // 传入的方法
    constructor (executor) {
        this.status = PENDING; // 初始化为等待状态
        this.value = undefined; // 记录成功信息
        this.reason = undefined; // 记录失败信息

        let resolve = (value) => {
            // 目的是为了锁状态，发生变化后就不能更改
            if (this.status === PENDING) {
                this.status = FULFILLED;
                this.value = value;
            }
        }
        let reject = (err) => {
            // 目的是为了锁状态，发生变化后就不能更改
            if (this.status === PENDING) {
                this.status = REJECTED;
                this.reason = err;
            }
        }
        // 立即执行
        try {
            executor(resolve, reject);
        } catch(err) {
            reject(err)
        }
    }

    then (onFullfiled, onRejected) {
        // 状态变为FULFILLED，成功
        if (this.status === FULFILLED) {
            onFullfiled(this.value)
        }

        // 状态变为REJECTED，失败
        if (this.status === REJECTED) {
            onRejected(this.reason)
        }
    }
}
```
验证一下结果
```js
const p = new Promise((resolve, reject) => {
    resolve(123)
    resolve(456) // 没有用，状态发生变化就会锁住
})
p.then(ret => {console.log(ret)})

const p1 = new Promise((resolve, reject) => {
    reject(456)
})
p1.then(ret => {console.log(ret)}, err => {console.log(err)})
```
我们按照上面的逻辑实现了一个类，验证结果也是完全符合预期的

### 现在我们看看异步
```js
const p = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve(123)
    }, 1000)
})
p.then(ret => {console.log(ret)})
```
上面的例子我们跑过之后会发现，什么也没有打印，为什么呢？
- 我们实现的Promsie类是同步的，当执行到then的时候由于没有调用过resove或者reject，此时Promise实例中的状态仍然处于PENDING状态，所以then中的两个方法都不会执行

怎么解决呢，我们需要判断then中的PENDING状态，另外，promise是可以允许下面这种调用的
```js
p.then(ret => {console.log(ret)})
p.then(ret => {console.log(ret, 1111)})
p.then(ret => {console.log(ret, 2222)})
```
我们理一下，在调用then时PENDING的时候我们要把处理方法缓存下来，当promise中调用resolve或则reject的时候拿出来调用，另外基于上面的调用方式，then中的处理方法应该是一个数组

来看一下新的代码
```js
const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';
class Promise {
    // 传入的方法
    constructor (executor) {
        this.status = PENDING; // 初始化为等待状态
        this.value = undefined; // 记录成功信息
        this.reason = undefined; // 记录失败信息

        // 存储异步pending时的状态
        this.onResolveCallbacks = [];
        this.onRejectCallbacks = [];


        let resolve = (value) => {
            // 目的是为了锁状态，发生变化后就不能更改
            if (this.status === PENDING) {
                this.status = FULFILLED;
                this.value = value;

                this.onResolveCallbacks.forEach(fn => fn())
            }
        }
        let reject = (err) => {
            // 目的是为了锁状态，发生变化后就不能更改
            if (this.status === PENDING) {
                this.status = REJECTED;
                this.reason = err;

                this.onRejectCallbacks.forEach(fn => fn())
            }
        }
        // 立即执行
        try {
            executor(resolve, reject);
        } catch(err) {
            reject(err)
        }
    }

    then (onFullfiled, onRejected) {
        // 状态变为FULFILLED，成功
        if (this.status === FULFILLED) {
            onFullfiled(this.value)
        }

        // 状态变为REJECTED，失败
        if (this.status === REJECTED) {
            onRejected(this.reason)
        }

        // 状态仍为PENDING
        if (this.status === PENDING) {
            // 需要参数，所以用匿名函数包一下
            this.onResolveCallbacks.push(() => {
                onFullfiled(this.value)
            })

            this.onRejectCallbacks.push(() => {
                onRejected(this.reason)
            })
        }
        
    }
}
```
测试一下代码，没问题，异步也可以调用了
```js
const p = new Promise((resolve, reject) => {
    setTimeout(()=> {
        resolve('deded')
    }, 1000)
})
p.then(ret => {console.log(ret)})
```

### 处理链式调用
好了目前为止我们基本实现了功能，现在我们来处理Promsie的链式调用
```js
const p = new Promise((resolve, reject) => {
    resolve('deded')
})
p.then()
.then(ret=>{console.log(ret); return 'aaaa'})
.then(ret=>{console.log(ret);})
```
上面的现象我们能总结出
- then是可以不传参数的
- then应该是返回了一个新的Promise对象

我们来看一下新的实现
```js
const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';
class Promise {
    // 传入的方法
    constructor (executor) {
        this.status = PENDING; // 初始化为等待状态
        this.value = undefined; // 记录成功信息
        this.reason = undefined; // 记录失败信息

        // 存储异步pending时的状态
        this.onResolveCallbacks = [];
        this.onRejectCallbacks = [];


        let resolve = (value) => {
            // 目的是为了锁状态，发生变化后就不能更改
            if (this.status === PENDING) {
                this.status = FULFILLED;
                this.value = value;

                this.onResolveCallbacks.forEach(fn => fn())
            }
        }
        let reject = (err) => {
            // 目的是为了锁状态，发生变化后就不能更改
            if (this.status === PENDING) {
                this.status = REJECTED;
                this.reason = err;

                this.onRejectCallbacks.forEach(fn => fn())
            }
        }
        // 立即执行
        try {
            executor(resolve, reject);
        } catch(err) {
            reject(err)
        }
    }

    then (onFullfiled, onRejected) {
        // 兼容onFullfiled，onRejected为空的情况
        onFullfiled = typeof onFullfiled === 'function' ? onFullfiled : v => v;
        onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err };

        let promise2 = new Promise((resolve, reject) => {
            // 状态变为FULFILLED，成功
            if (this.status === FULFILLED) {
                try {
                    let x = onFullfiled(this.value)
                    resolve(x)
                } catch(e) {
                    reject(e)
                }
                
            }

            // 状态变为REJECTED，失败
            if (this.status === REJECTED) {
                try {
                    let x = onRejected(this.reason)
                    resolve(x)
                } catch(e) {
                    reject(e)
                }
            }

            // 状态仍为PENDING
            if (this.status === PENDING) {
                try {
                    // 需要参数，所以用匿名函数包一下
                    this.onResolveCallbacks.push(() => {
                        let x = onFullfiled(this.value)
                        resolve(x)
                    })

                    this.onRejectCallbacks.push(() => {
                        let x = onRejected(this.reason)
                        reject(e)
                    })
                } catch(e) {
                    reject(e)
                }
                
            }
        })

        return promise2
        
    }
}
```
验证代码，可以链式调用，then可以传空方法
```js
const p = new Promise((resolve, reject) => {
    resolve('deded')
})
p.then()
.then(ret=>{console.log(ret); return 'aaaa'})
.then(ret=>{console.log(ret);})
```

### 处理then中的promise和then中的循环调用
先来看看下面这种调用
```js
const p = new Promise((resolve, reject) => {
    resolve(500)
})

// 循环调用 报错
const p2 = p.then(ret => {console.log(ret);return p2;})

// 注意这里就不算循环调用了，因为p2，已经和第一个.then创建的promise对象不是同一个了
const p2 = p.then(ret => {console.log(ret);return p2;}).then(ret => {})

// return promsie
const p3 = p.then(ret => {
    console.log(ret);
    return new Promise((resolve, reject) => {
        resolve(1000)
    })
})
```
这里就不上全部代码了，从上面的表现我们可以看到，只要处理then中的方法就好了，我们先从简单的fulfilled状态来看一下

从上面的例子我们可以看出
- 当前then创建的promise也要拿进来和then中返回的promise实例作比较，如果一样要报错
- 如果当前then中的方法返回的是promise实例，我们要先获取返回值

then中改造
```js
then () {
    let promise2 = new Promsie((resolve, reject) => {
        // ...
        if (this.status === FULFILLED) {
            try {
                // let x = onFullfiled(this.value)
                // resolve(x)

                // 更换成一个方法处理，因为catch中也有可能传入promise
                // 当前then创建的promise也要拿进来和then中返回的promise实例作比较
                // js同步执行的，所以执行到这里时promise2还没有定义呢，let是不会有变量提升的
                // 所以使用setTimeout宏任务延迟执行
                setTimeout(() => {
                    var x = onFullfiled(this.value);
                    resolvePromise(x, resolve, reject, promise2)
                }, 0)
            } catch(e) {
                reject(e)
            }
        }
        // ...
    })
    return promise2
}

function resolvePromise(x, resolve, reject, promise2) {
    if (x === promise2) {
        return reject(new Error('Uncaught (in promise) TypeError: Chaining cycle detected for promise #<Promise>'))
    }

    if (x instanceof Promise) {
        x.then(value => {
            resolve(value)
        }, err => {
            reject(err)
        })
    } else {
        resolve(x)
    }
}
            
```

### 基本就处理完了，另外还有then中promise递归解析的一些过程，还有一些边界处理
下面是一份完整代码
```js
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

function resolvePromise(x, resolve, reject, promise2) {
    if (x === promise2) {
        return reject(new Error('Uncaught (in promise) TypeError: Chaining cycle detected for promise #<Promise>'))
    }

    if (x instanceof Promise) {
        x.then(value => {
            resolve(value)
        }, err => {
            reject(err)
        })
    } else {
        resolve(x)
    }
}

class Promise {
    constructor (executor) {

        this.status = PENDING; // 初始化为等待状态
        this.value = undefined; // 记录成功信息
        this.reason = undefined; // 记录失败信息

        this.onResolveCallbacks = [];
        this.onRejectCallbacks = [];

        let resolve = (value) => {
            if (this.status === PENDING) {
                this.status = FULFILLED;
                this.value = value;
                this.onResolveCallbacks.forEach(fn => fn())
            }
        }
        let reject = (err) => {
            if (this.status === PENDING) {
                this.status = REJECTED;
                this.reason = err;

                this.onRejectCallbacks.forEach(fn => fn())
            }
        }
        // 立即执行
        try {
            executor(resolve, reject);
        } catch(err) {
            reject(err)
        }
        
    }

    then (onFullfiled, onRejected) {
        let promise2 = new Promise((resolve, reject) => {
            onFullfiled = typeof onFullfiled === 'function' ? onFullfiled : k => k
            onRejected = typeof onRejected === 'function' ? onRejected : err => err

            if (this.status === FULFILLED) {
                // js同步执行的，所以执行到这里时promise2还没有定义呢，let是不会有变量提升的
                // 所以使用setTimeout宏任务延迟执行
                setTimeout(() => {
                    let x = onFullfiled(this.value);
                    resolvePromise(x, resolve, reject, promise2)
                }, 0)
            }

            if (this.status === REJECTED) {
                setTimeout(() => {
                    let x = onRejected(this.reason)
                    resolvePromise(x, resolve, reject, promise2)
                }, 0)
            }

            if (this.status === PENDING) {
                this.onResolveCallbacks.push(() => {
                    setTimeout(() => {
                        let x = onFullfiled(this.value);
                        resolvePromise(x, resolve, reject, promise2)
                    }, 0)
                })
                this.onRejectCallbacks.push(() => {
                    setTimeout(() => {
                        let x = onRejected(this.reason)
                        resolvePromise(x, resolve, reject, promise2)
                    }, 0)
                })
            }
        })
        return promise2;

    }
}
```
测试使用
```js
const p = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve('dedede')
    }, 2000)
}).then(ret => {
    console.log(ret)
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('aaaa')
        }, 3000)
    })
}).then(ret => {
    console.log(ret)
})
```

### 再来看看Promise的api
- Promise.resolve()
- Promise.reject()
- Promise.prototype.catch()
- Promise.prototype.finally()
- Promise.all()
- Promise.race(）

#### Promise.resolve
默认产生一个成功的 promise。

来看一个resolve的实现
```js
class Promise {
    ...

    static resolve(data){
        return new Promise((resolve,reject)=>{
            resolve(data);
        })
    }
    ...
}

// 但是当我们写一个异步就不行了
Promise.resolve(new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve('dedede') 
    }, 1000)
})).then(ret => {
    console.log(ret)
})
```
从上面可以看到调用resolve的时候我们传入了一个promise，promise内部的resolve处理不了promise，这时我们就要对这块加一个逻辑
```js
class Promise {
    ...
    let resolve = (value) => {
        
        if (value instanceof Promise) {
            // 此时要递归处理
            // 递归解析 
            return value.then(resolve, reject)
        }

        if (this.status === PENDING) {
            this.status = FULFILLED;
            this.value = value;
            this.onResolveCallbacks.forEach(fn => fn())
        }
    }
    ...
}
```

这里也可以直接修改Promise.resolve方法
```js
static resolve (data) {
    return new Promise((resolve, reject)=>{
        if (data instanceof Promise) {
            data.then(resolve, reject)
        } else {
            resolve(data);
        }
    })
}
```

#### Promise.reject
```js
static reject (reason) {
    return new Promise((resolve, reject)=>{
        reject(reason);
    })
}
```

#### race
```js
// 竞赛原则，只要有一个返回就可以resolve
static race (promises) {
    return new Promise ((resolve, reject) => {
        promises.forEach(value => {
            if (value instanceof Promise) {
                value.then(resolve, reject)
            } else {
                resolve(value)
            }
        })
    })
}
```

#### all
```js
// all 等待原则，所有都返回
static all (promises) {
    return new Promise ((resolve, reject) => {
        const resArr = [];
        let orderIndex = 0;

        const processResultByKey = (value, index) => {
            resArr[index] = value
            orderIndex++

            if (orderIndex == promises.length) {
                resolve(resArr)
            }
        }

        promises.forEach((value, index) => {
            if (value instanceof Promise) {
                value.then(ret => {
                    processResultByKey(ret, index)
                }, reject)
            } else {
                processResultByKey(value, index)
            }
        })
    })
}
```

#### Promise.prototype.catch
Promise.prototype.catch 用来捕获 promise 的异常，就相当于一个没有成功的 then。
```js
catch (errCallback) {
    return this.then(null, errCallback)
}
```

#### Promise.prototype.finaly
```js
// Promise.prototype.finally 表示不是最终的意思，而是无论如何都会执行的意思,如果返回一个 promise 会等待这个 promise 也执行完毕。如果返回的是成功的 promise，会采用上一次的结果；如果返回的是失败的 promise，会用这个失败的结果，传到 catch 中。
finally (callback) {
    return this.then( value => {
        return Promise.resolve(callback()).then(() => value)
    }, reason => {
        return Promise.resolve(callback()).then(() => {throw reason})
    })  
}
```
