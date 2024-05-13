/**
 * 运行一个耗时任务
 * 如果要异步执行任务，请返回promise
 * 要尽快完成任务，同时不能让页面产生卡顿
 * 尽量兼容更多浏览器
 */

// 交给webworker处理
// 1000个任务，使用3个worker处理
let workerList = []
let taskList = new Map()
for(let i = 1; i <= 3; i++) {
  let worker = new Worker('./worker.js', { name: `worker${i}` })
  workerList.push(worker)
  taskList.set(worker, [])
}

let count = 0

let timeId= null
function runTask(task) {
  clearTimeout(timeId)
  count++

  let workerTask = taskList.get(workerList[count % 3])
  workerTask.push(task.toString())

  timeId = setTimeout(() => {
    workerList.forEach((worker) => {
      let workerTask = taskList.get(worker)
      worker.postMessage({
        taskList: workerTask
      });
    })
  }, 0)
  
}