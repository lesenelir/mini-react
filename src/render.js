// /**
//  * @param element object
//  * @param container dom
//  */
// function render(element, container) {
//   const dom =
//     element.type === 'TEXT_ELEMENT'
//       ? document.createTextNode('')
//       : document.createElement(element.type)
//
//   Object.keys(element.props).filter((key) => key !== 'children').forEach((name) => {
//     dom[name] = element.props[name]
//   })
//
//   // 子元素递归进行渲染
//   element.props.children.forEach((child) => {
//     render(child, dom)
//   })
//
//   container.append(dom)
// }

// Create a dom based on the fiber
function createDom(fiber) {
  const dom =
    fiber.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type)

  Object.keys(fiber.props).filter((key) => key !== 'children').forEach((name) => {
    dom[name] = fiber.props[name]
  })

  return dom
}

let nextUnitOfWork = null
let wipRoot = null  // workInProgressTree => keep track of the root of the fiber tree.

function commitRoot() {
  // add fiber tree to dom (commit phase)
  commitWork(wipRoot.child)
  wipRoot = null
}

function commitWork(fiber) {
  if (!fiber) return

  // 前序遍历 递归
  const domParent = fiber.parent.dom
  domParent.appendChild(fiber.dom)
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

// render
function render(element, container) {
  // set first unit of work (first fiber)
  // initial the first root fiber, root fiber 第一个 container 是 div#root
  // nextUnitOfWork = {
  //   dom: container,
  //   props: {
  //     children: [element] // 把整个 element 作为 root fiber 的子元素
  //   },
  //   child: null,
  //   sibling: null,
  //   parent: null
  // }

  wipRoot = {
    dom: container,
    props: {
      children: [element]
    },
    child: null,
    sibling: null,
    parent: null
  }

  nextUnitOfWork = wipRoot
}

/**
 *  workLoop 函数是调度函数，根据浏览器的帧时间来决定是否继续执行任务    =>   构建整颗 Fiber Tree
 *  performUnitOfWork 函数是实际执行任务的函数，执行任务并返回下一个任务
 */

/**
 * 调度任务函数
 *
 *   首先会将整个渲染任务 workLoop 拆分为不同的渲染单元 unit of work，这些 unit of work 作为一个 fiber 节点
 *   从 root fiber 开始渲染，当渲染到 root fiber 的时候，代表整个渲染任务完成
 *
 * @param deadline
 */
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

  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
  }

  // 为了让浏览器空闲时继续执行任务，重新调用 requestIdleCallback
  requestIdleCallback(workLoop)
}

// 第一次向浏览器请求，当浏览器空闲时执行 workLoop
requestIdleCallback(workLoop)

/**
 * 该函数： 执行一个渲染工作，并返回一个渲染工作； ===> build fiber tree
 *
 * 主要分为三个步骤：（没有 commit 阶段的情况）
 *  1. 将元素添加到 DOM 节点上
 *  2. 为元素创建下一个新的工作单元 fiber
 *  3. 选择下一个工作单元
 */
function performUnitOfWork(fiber) {
  // set unit of work
  // 1. add dom node
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  // Adding new dom node to the dom tree, but there is a problem that the browser will interrupt the rendering process.
  // The user will see an incomplete UI. So, we need render and commit phase.
  // if (fiber.parent) {
  //   fiber.parent.dom.appendChild(fiber.dom)
  // }

  // 2. create new fiber
  // This step is purpose to create new fiber, and then add it to the fiber tree, and then return it.
  const elements = fiber.props.children
  let index = 0
  let prevSibling = null // 当前正在处理 fiber 的前一个兄弟 fiber

  while (index < elements.length) {
    const element = elements[index]

    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null
    }

    // add it to fiber tree
    if (index === 0) {
      fiber.child = newFiber // newFiber 挂载到 fiber 的 child 属性上 （第一个子元素）
    } else {
      prevSibling.sibling = newFiber // no child, add to sibling (第二个及以后的子元素)
    }

    prevSibling = newFiber
    index++
  }

  // 3. return next unit of work (next fiber)
  // search for next unit of work
  // 优先级：child > sibling > parent.sibling > parent.parent.sibling > ...
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


export default render

