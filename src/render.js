/**
 * @param element object
 * @param container dom
 */
function render(element, container) {
  const dom =
    element.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(element.type)

  Object.keys(element.props).filter((key) => key !== 'children').forEach((name) => {
    dom[name] = element.props[name]
  })

  // 子元素递归进行渲染
  // element.props.children.forEach((child) => {
  //   render(child, dom)
  // })

  container.append(dom)
}

let nextUnitOfWork = null

function workLoop(deadline) {
  // 是否要放弃渲染， 是否要让步（有更高优先级的任务，就需要让步）
  let shouldYield = false

  // 有任务，并且没有让步
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    // 判断是否还有剩余的时间进行渲染，如果没有就让步
    shouldYield = deadline.timeRemaining() < 1
  }

  requestIdleCallback(workLoop)
}

// 第一次向浏览器请求，当浏览器空闲时执行 workLoop
requestIdleCallback(workLoop)

// 执行一个渲染工作，并返回一个渲染工作
function performUnitOfWork(nextUnitOfWork) {
  // TODO

}


export default render

