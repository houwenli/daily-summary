/**
 * 分析
 */

class TaskPro {
  constructor() {
    this._taskList = []
    this._isRunning = false
    this._currentIndex = 0
  }
  addTask(fn) {
    this._taskList.push(fn)
  }

  // 可能会执行多次，如果正在运行的时候不要执行后续操作
  async run() {
    if (this._isRunning) {
      return
    }
    this._isRunning = true

    // 取出任务执行
    await this._runTask()
  }

  // 这里不直接操作数组，使用数组下标的形式
  // 好处就是可以判断任务中是否执行了next方法
  async _runTask() {
    if(this._currentIndex >= this._taskList.length) {
      this._isRunning = false
      this._currentIndex = 0
      this._taskList = []
      return
    }

    // 没有越界，取出任务执行
    let task =  this._taskList[this._currentIndex]
    let currentIndex = this._currentIndex
    await task(this._next.bind(this))
    let nowIndex = this._currentIndex
    if (currentIndex === nowIndex) {
      await this._next()
    }
  }

  // 执行下一个任务
  async _next() {
    this._currentIndex++
    await this._runTask()
  }
}


const t= new TaskPro()

t.addTask(async (next) => {
  console.log(1, 'start')
  await next()
  console.log(1, 'end')
})

t.addTask(() => {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(2)
      resolve()
    }, 3000)
  })
  
})

t.addTask(() => {
  console.log(3)
})

t.addTask(() => {
  console.log(4)
})

t.run()