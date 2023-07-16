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

/**
 *  workLoop 函数是调度函数，根据浏览器的帧时间来决定是否继续执行任务
 *  performUnitOfWork 函数是实际执行任务的函数，执行任务并返回下一个任务
 */

let nextUnitOfWork = null

// 调度任务函数
function workLoop(deadline) {
  // 是否要放弃渲染， 是否要让步（有更高优先级的任务，就需要让步）
  let shouldYield = false

  // 有任务，并且没有让步则执行 while 循环，
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    // 尽可能的会执行更多的任务，知道浏览器的帧时间消耗完
    // 判断是否还有剩余的时间进行渲染，如果没有就让步
    shouldYield = deadline.timeRemaining() < 1
  }

  // 为了让浏览器空闲时继续执行任务，重新调用 requestIdleCallback
  requestIdleCallback(workLoop)
}

// 第一次向浏览器请求，当浏览器空闲时执行 workLoop
requestIdleCallback(workLoop)

// 执行一个渲染工作，并返回一个渲染工作
function performUnitOfWork(nextUnitOfWork) {
  // TODO

}


export default render

