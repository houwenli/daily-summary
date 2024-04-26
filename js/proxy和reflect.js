// const obj = {}
// obj.a = 1

// Reflect.set(obj, 'a', 2)

// console.log(obj.a)



// const obj = {
//   a: 1,
//   b: 2,
//   get c() {
//     return this.a + this.b
//   }
// }

// console.log(obj.c)

// console.log(Reflect.get(obj, 'c', {a: 3, b: 4}))

// const proxy = new Proxy(obj, {
//   get(target, key) {
//     console.log('read', key)
//     return target[key]
//   }
// })

// console.log(proxy.c)

// const proxy1 = new Proxy(obj, {
//   get(target, key) {
//     console.log('read', key)
//     return Reflect.get(target, key, proxy1)
//   }
// })

// console.log(proxy1.c)



const obj = {
  a: 1,
  b: 2,
  [Symbol(0)]: 111
}

Object.defineProperty(obj, 'c', {
  value: 3,
  enumerable: false
})

console.log(Object.keys(obj))

console.log(Object.getOwnPropertyNames(obj))
console.log(Object.getOwnPropertySymbols(obj))

console.log(Reflect.ownKeys(obj))