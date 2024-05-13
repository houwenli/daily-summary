const card = document.querySelector('.card')

card.onmousedown = (e) => {
  console.log(333, e)
  let x = e.pageX - card.offsetLeft;
  let y = e.pageY - card.offsetTop;

  window.onmousemove = (e) => {
    const cx = e.pageX - x
    const cy = e.pageY - y
    card.style.left = `${cx}px`
    card.style.top = `${cy}px`

    // 通知其他窗口
    // 标签页模式
    // 服务器模式--跨平台
    channel.postMessage(getScreenPoint(cx, cy))
  }

  window.onmouseup = () => {
    window.onmousemove = null
    window.onmouseup = null
  }
}

const BAR = 79

function getClientPoint(screenX, screenY) {
  const clientX = screenX - window.screenX
  const clientY = screenY - window.screenY - BAR

  return [clientX, clientY]
}

function getScreenPoint(clientX, clientY) {
  const screenX = clientX + window.screenX
  const screenY = clientY + BAR + window.screenY

  return [screenX, screenY]
}

function init () {
  if(location.search.indexOf('hidden') >= 0) {
    card.style.left = '-1000px'
  }
}

init()


const channel = new BroadcastChannel('card')
channel.onmessage = (e) => {
  console.log(e.data)

  const [clientX, clientY] = getClientPoint(...e.data)

  card.style.left = `${clientX}px`
  card.style.top = `${clientY}px`
}