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

const isEvent = key => key.startsWith("on") // 特殊的属性： 事件 （以 on 开头）

function updateDom(dom, prevProps, nextProps) {
  // element and oldFiber have the same type (div), but they don't have the same props
  // thus, need to compare the props and update the dom

  // 1. remove or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(key => !(key in nextProps) || prevProps[key] !== nextProps[key])
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2)

      dom.removeEventListener(eventType, prevProps[name])
    })

  // 2. add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(key => prevProps[key] !== nextProps[key])
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2)

      dom.addEventListener(eventType, nextProps[name])
    })

  // 3. remove old props
  Object.keys(prevProps)
    .filter(key => key !== 'children')
    .filter(key => !key in nextProps)
    .forEach(name => {
      dom[name] = ""
    })

  // 4. ser new props
  Object.keys(nextProps)
    .filter(key => key !== 'children')
    .filter(key => !(key in prevProps) || prevProps[key] !== nextProps[key])
    .forEach(name => {
      dom[name] = nextProps[name]
    })

}

let nextUnitOfWork = null
let wipRoot = null  // workInProgressTree => keep track of the root of the fiber tree.
let deletions = null // keep track of the nodes that need to be deleted

function commitRoot() {
  // add fiber tree to dom (commit phase)
  deletions.forEach(commitWork)
  commitWork(wipRoot.child)
  wipRoot = null
}

function commitWork(fiber) {
  if (!fiber) return

  // 前序遍历 递归
  const domParent = fiber.parent.dom
  if (fiber.effectTag === 'PLACEMENT' && fiber.dom !== null) {
    domParent.appendChild(fiber.dom)
  } else if (fiber.effectTag === 'DELETION') {
    domParent.removeChild(fiber.dom)
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom !== null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props)
  }

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
    parent: null,
  }

  deletions = []
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
  // const elements = fiber.props.children
  // let index = 0
  // let prevSibling = null // 当前正在处理 fiber 的前一个兄弟 fiber
  //
  // while (index < elements.length) {
  //   const element = elements[index]
  //
  //   const newFiber = {
  //     type: element.type,
  //     props: element.props,
  //     parent: fiber,
  //     dom: null
  //   }
  //
  //   // add it to fiber tree
  //   if (index === 0) {
  //     fiber.child = newFiber // newFiber 挂载到 fiber 的 child 属性上 （第一个子元素）
  //   } else {
  //     prevSibling.sibling = newFiber // no child, add to sibling (第二个及以后的子元素)
  //   }
  //
  //   prevSibling = newFiber
  //   index++
  // }

  const elements = fiber.props.children
  reconcileChildren(fiber, elements) // 新建 fiber，构建 fiber tree

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


// The parameter wiFiber is the current fiber, and elements is the children of the current fiber.
// Diffing algorithm -> optimize create new fiber process
function reconcileChildren(wipFiber, elements) {
  // 2. create new fiber
  // This step is purpose to create new fiber, and then add it to the fiber tree, and then return it.
  let index = 0
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child // rendered fiber tree last time
  let prevSibling = null // 当前正在处理 fiber 的前一个兄弟 fiber

  while (index < elements.length || oldFiber) {
    const element = elements[index] // current element
    let newFiber = null

    // compare oldFiber and element
    // 查看 oldFiber 和 workInProgressFiber 的 element 的 type 是否相同
    const sameType = oldFiber && element && element.type === oldFiber.type

    if (sameType) {
      // update the node
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,    // 继承之前的 dom 节点， 不需要新创建 dom，更有利于性能
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE'
      }
    }

    if (!sameType && element) {
      // add new node
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT'
      }
    }

    if (!sameType && oldFiber) {
      // delete old node
      // don't need to create newFiber, just add effectTag to oldFiber
      oldFiber.effectTag = 'DELETION'
      deletions.push(oldFiber)
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    // build a new Fiber tree
    if (index === 0) {
      wipFiber.child = newFiber // newFiber 挂载到 fiber 的 child 属性上 （第一个子元素）
    } else if (element) {
      prevSibling.sibling = newFiber // no child, add to sibling (第二个及以后的子元素)
    }

    prevSibling = newFiber
    index++
  }

}


export default render

