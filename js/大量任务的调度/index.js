/**
 * 运行一个耗时任务
 * 如果要异步执行任务，请返回promise
 * 要尽快完成任务，同时不能让页面产生卡顿
 * 尽量兼容更多浏览器
 */

function runTask(task) {
  task()
}