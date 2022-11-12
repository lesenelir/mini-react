function render(element, container) {
  // 创建元素
  const dom = element.type === 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(element.type)

  // 给节点assign props不是children属性（即，赋值标签的属性）
  Object.keys(element.props).filter(key => {
    return key !== 'children'
  }).forEach(name => {
    dom[name] = element.props[name]
  })

  // element对象的children数组属性有子元素（对象）则重新构建新的节点塞入上一级节点
  // element.props.children.forEach(child => {
  //   return render(child, dom)
  // })

  // 新创建的原生节点追加到上一层节点中
  container.appendChild(dom)
}

// 下一个unit单元任务
let nextUnitOfWork = null


// 调度： 通过workLoop调度整个渲染
function workLoop(deadline) {
  // 是否要停止渲染： false
  let shouldYield = false

  while (nextUnitOfWork && !shouldYield) {
    // 调用performUnitOfWork执行渲染工作
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork) // 返回新的unit任务
    // 一个单元渲染完后检查是否有足够的剩余时间
    // 剩余时间足够大于1，有足够的时间进行下一次的渲染，则一直进入渲染跑本次workLoop
    // 剩余时间不够小于1，没有足够的时间进行下一次的渲染，终止渲染，则跳出循环，等下一次浏览器空闲再请求
    shouldYield = deadline.timeRemaining() < 1  // timeRemaining剩余时间大于1说明浏览器空闲 跳出循环
  }
  // 剩余时间不够，调用requestIdleCallback，让浏览器在空闲的时候进行workLoop
  requestIdleCallback(workLoop)
}

// 第一次请求在浏览器空闲时执行
requestIdleCallback(workLoop)

// 执行一个渲染任务unit单元（执行渲染工作，并返回下一个渲染工作）
function performUnitOfWork(work) {
  // TODO

}

export default render
