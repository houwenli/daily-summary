/**
 * 运行一个耗时任务
 * 如果要异步执行任务，请返回promise
 * 要尽快完成任务，同时不能让页面产生卡顿
 * 尽量兼容更多浏览器
 */

function _runTask(task, callback) {
  // if(当前帧是否有剩余时间) {
  //   task()
  //   callback()
  // } else {
  //   _runTask(task, callback)
  // }

  // 但是这个方法有兼容性问题，safari就不认这个方法
  // requestIdleCallback((idle) => {
  //   if (idle.timeRemaining() > 0) {
  //     task()
  //     callback()
  //   } else {
  //     _runTask(task, callback)
  //   }
  // })

  // 所以我们使用requestAnimationFrame来实现
  // 得自己实现每一帧执行多少任务
  let now = Date.now()
  requestAnimationFrame(() => {
    if (Date.now() - now  < 1000 / 60) {
      task()
      callback()
    } else {
      _runTask(task, callback)
    }
  })
}

function runTask(task) {
  return new Promise((resolve) => {
    // 微任务仍然会卡顿
    // Promise.resolve().then(() => {
    //   task()
    //   resolve()
    // })

    // 宏任务的话画面不流畅
    // 因为事件循环实际上是这样的
    // for(;;) {
    //   取出一个宏任务
    //   执行宏任务
    //   ...
    //   if(渲染机制到达) {
    //     渲染
    //   }
    // }
    // 像我们这里1000个任务是都在任务队列中等着呢，关健就是这个渲染机制到达，不同浏览器处理是不一样的
    // 像谷歌可能就会降低刷新频率来执行更多的任务，safari则仍然遵从着16.6ms一次
    // 所以在谷歌中看的就会有些卡顿
    // setTimeout(() => {
    //   task()
    //   resolve()
    // }, 0)

    // requestAnimationFrame虽然不会造成卡顿，但是不满足尽快执行的规则
    // 这就造成其实每次刷新期间可以多次执行的，但是只执行了一次
    // requestAnimationFrame(() => {
    //   task()
    //   resolve()
    // })

    // 其实这里我们可以想到实现方法
    // 我们是不是可以自己判断当前次刷新前是否还有剩余时间执行任务呢，如果有就执行，没有就推迟到下一个时间段执行
    _runTask(task, resolve)
  })
  
  
}