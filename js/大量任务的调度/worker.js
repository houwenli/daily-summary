self.onmessage = event => {
  console.log(1111, event)

  let { data} = event

  let { taskList } = data

  taskList.forEach(task => {
    ((fn) => {fn})(eval(task))
  });
}