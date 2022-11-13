/**
 * 给fiber创建dom节点
 * @param fiber
 * @returns {HTMLDOM|*}
 */
function createDom(fiber) {
  // 创建父节点
  const dom = fiber.type === 'TEXT_ELEMENT'
        ? document.createTextNode('')
        : document.createElement(fiber.type)

  // 给节点赋属性值
  Object.keys(fiber.props).filter(key => {
    return key !== 'children'
  }).forEach(name => {
    dom[name] = fiber.props[name]
  })

  return dom
}


let nextUnitOfWork = null


/**
 * 开始渲染（将一次渲染任务拆分为多个unit of work）
 * 发出第一个fiber
 * @param element creteElement 创建的一个描述DOM的对象
 * @param container
 */
function render(element, container) {
  // 第一个root fiber： unit of work
  // 初始化第一个工作 (fiber)
  // fiber元素的数据结构
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element]
    },
    child: null,
    sibling: null,
    parent: null
  }
}


/**
 * 当浏览器空闲，调用workLoop，调度整个渲染
 * @param deadline  requestIdleCallback(fn(deadline))该API回调函数参数的参数，object
 */
function workLoop(deadline) {
  // 是否要停止渲染
  let shouldYield = false

  // 如果 nextUnitOfWork 返回是undefined 则结束循环， Fiber树的渲染结束
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    // 剩余时间小于1ms，没有足够的时间进行下一次渲染，则退出while
    shouldYield = deadline.timeRemaining() < 1
  }

  requestIdleCallback(workLoop)
}


// 第一次在浏览器空闲时渲染
requestIdleCallback(workLoop)


/**
 * 执行一个渲染单元(fiber)，并返回下一个fiber (unit of work)
 * @param fiber
 * @returns {null|*|{parent, dom: null, sibling: null, type, props: *, child: null}} next unit of work
 */
function performUnitOfWork(fiber) {
  // 执行一个 unit of work 需要做的事情：
  // 1. add the element to the DOM
  // 2. create the fibers for the elements's children
  // 3. select the next unit of work

  console.log(fiber)

  // 1. create dom node
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
  // 将fiber dom追加到fiber父节点
  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom)
  }

  // 2. create a new fiber
  const elements = fiber.props.children  // elements 是整个数组里的对象
  console.log(elements)
  let prevSibling = null

  // 构建fiber的联系
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i]

    const newFiber = {
      type: element.type,
      props: element.props,
      dom: null,
      child: null,
      sibling: null,
      parent: fiber
    }

    // 将新创建的fiber元素 添加到fiber tree数据结构中
    // 如果新创建的fiber元素是first child 则是child
    // 如果不是first child 则是sibling
    if (i === 0) {
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }
    prevSibling = newFiber
  }


  // 3. search for the next unit of work and return it
  // 向上查找，返回下一个fiber (unit of work)
  // child -> sibling -> uncle
  if (fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }

}


// StepIII: concurrent mode
// function render(element, container) {
//   // 创建元素
//   const dom = element.type === 'TEXT_ELEMENT'
//     ? document.createTextNode('')
//     : document.createElement(element.type)
//
//   // 给节点assign props不是children属性（即，赋值标签的属性）
//   Object.keys(element.props).filter(key => {
//     return key !== 'children'
//   }).forEach(name => {
//     dom[name] = element.props[name]
//   })
//
//   // element对象的children数组属性有子元素（对象）则重新构建新的节点塞入上一级节点
//   // element.props.children.forEach(child => {
//   //   return render(child, dom)
//   // })
//
//   // 新创建的原生节点追加到上一层节点中
//   container.appendChild(dom)
// }
//
// // 下一个unit单元任务
// let nextUnitOfWork = null
//
//
// // 调度： 通过workLoop调度整个渲染，workLoop是作为requestIdleCallback的参数
// // deadline 是一个对象
// function workLoop(deadline) {
//   // 是否要停止渲染： false
//   let shouldYield = false
//
//   while (nextUnitOfWork && !shouldYield) {
//     // 调用performUnitOfWork执行渲染工作
//     nextUnitOfWork = performUnitOfWork(nextUnitOfWork) // 返回新的unit任务
//     // 一个单元渲染完后检查是否有足够的剩余时间
//     // 浏览器空闲时间足够大于1，有足够的时间进行下一次的渲染，则一直进入渲染跑本次workLoop
//     // 浏览器空闲时间不够小于1，没有足够的时间进行下一次的渲染，终止渲染，则跳出循环，等下一次浏览器空闲再请求
//     shouldYield = deadline.timeRemaining() < 1  // timeRemaining剩余时间大于1说明浏览器空闲 跳出循环
//   }
//   // 浏览器空闲时间不够，再次调用requestIdleCallback，让浏览器在空闲的时候继续进行workLoop
//   requestIdleCallback(workLoop)
// }
//
// // 第一次请求在浏览器空闲时执行
// requestIdleCallback(workLoop)
//
// // 执行一个渲染任务unit单元（执行渲染工作，并返回下一个渲染工作）
// function performUnitOfWork(work) {
//   // TODO
//
// }

export default render
