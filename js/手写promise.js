// const p = new Promise((resolve, reject) => {
//   resolve(111)
//   // reject()
// })
// p.then(ret => {console.log(ret)}, err => {})



class MyPromise {
  constructor(callback) {
    this.status = 'pending'; // pending, reject, fullfilled
    this.value = undefined
    this.err = undefined
    this.resolveFnList = []
    this.rejectFnList = []

    this.resolve = (val) => {
      if(this.status == 'pending') {
        this.status = 'fullfilled'
        this.value = val

        this.resolveFnList.forEach(item => item(this.value))
      }
    }
  
    this.reject = (err) => {
      if(this.status == 'pending') {
        this.status = 'reject'
        this.err = err
        this.rejectFnList.forEach(item => item(this.err))
      }
    }

    try{
      callback(this.resolve, this.reject)
    } catch(err) {
      this.reject(err)
    }
  }

  then(resolveFn, rejectFn) {
    if(this.status == 'fullfilled') {
      resolveFn(this.value)
    }

    if(this.status == 'reject') {
      rejectFn(this.err)
    }

    if(this.status == 'pending') {
      this.resolveFnList.push(resolveFn)
      this.rejectFnList.push(rejectFn)
    }
    
  }
}


const p = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(111)
  }, 2000)

  // resolve(111)
 
  // reject()
})
p.then(ret => {console.log(222, ret)}, err => {})
p.then(ret => {console.log(333, ret)}, err => {})