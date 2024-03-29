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
let wipRoot = null
let currentRoot = null
let deletions = null  // 记录所有要删除的节点


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
  // nextUnitOfWork = {
  //   dom: container,
  //   props: {
  //     children: [element]
  //   },
  //   child: null,
  //   sibling: null,
  //   parent: null
  // }

  // workingInProgressRoot 正在渲染的根
  wipRoot = {
    dom: container,
    props: {
      children: [element]
    },
    child: null,
    sibling: null,
    parent: null,
    alternate: currentRoot  // 当前fiber的上一个fiber
  }
  deletions = []

  nextUnitOfWork = wipRoot
}


function commitRoot() {
  // TODO add nodes to dom
  deletions.forEach(commitWork)
  // 当完成了整个渲染（所有unit单元都执行完），将整颗fiber Tree to the dom
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
}


function updateDom(dom, preProps, nextProps) {
  // 对比两次props来决定怎么更新

  // 删除已经没有的或者发生变化的事件处理函数
  const isEvent = key => key.startsWith('on')
  Object.keys(preProps)
    .filter(isEvent)
    .filter(key => !key in nextProps || preProps[key] !== nextProps[key])
    .forEach(key => {
      const eventType = key.toLowerCase().substring(2)
      dom.removeEventListener(eventType, preProps[key])
    })

  // 添加事件处理函数
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(key => preProps[key] !== nextProps[key])
    .forEach(key => {
      const eventType = key.toLowerCase().substring(2)
      dom.addEventListener(eventType, nextProps[key])
    })

  // Remove old properties
  // 删除已经没有的props
  Object.keys(preProps)
    .filter(key => key !== 'children')
    .filter(key => !key in nextProps)
    .forEach(key => {
      dom[key] = ''
    })

  // Set new or changed properties
  // 赋予新的、改变的、props
  Object.keys(nextProps)
    .filter(key => key !== 'children')
    .filter(key => !key in preProps || preProps[key] !== nextProps[key])
    .forEach(key => {
      dom[key] = nextProps[key]
    })

}


function commitWork(fiber) {
  if (!fiber) {
    return
  }

  // 父节点的dom
  // const domParent = fiber.parent.dom
  let domParentFiber = fiber.parent
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent
  }
  const domParent = domParentFiber.dom


  // domParent.appendChild(fiber.dom)
  if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
    domParent.appendChild(fiber.dom)
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
    updateDom(
     fiber.dom,
     fiber.alternate.props,
     fiber.props
    )
  } else if (fiber.effectTag === 'DELETION' && fiber.dom != null) {
    // domParent.removeChild(fiber.dom)
    commitDeletion(fiber, domParent)
  }

  // commit阶段是同步的
  // 使用递归来保证同步性
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}


/**
 * @param fiber
 * @param domParent
 */
function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber.child, domParent)
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

  // 检查所有的unit of work 是否都做完了
  // wipRoot是否全部渲染完毕
  // commit阶段
  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
  }

  requestIdleCallback(workLoop)
}


// 第一次在浏览器空闲时渲染
requestIdleCallback(workLoop)


function reconcileChildren(wipFiber, elements) {
  let index = 0
  // fiber的child 只能有一个
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child
  let prevSibling = null

  while (index < elements.length || oldFiber) {
    const element = elements[index]
    const sameType = element && oldFiber && element.type === oldFiber.type
    let newFiber = null

    // Diff的三种情况
    if (sameType) {
      // 更新 保存DOM
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom, // 省去了创建新DOM的过程，性能优化
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE'
      }
    }
    if (element && !sameType) {
      // 新建
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT'
      }
    }
    if (oldFiber && !sameType) {
      // 删除
      oldFiber.effectTag = 'DELETION'
      deletions.push(oldFiber)
    }

    if (oldFiber) {
      // 一个fiber只能有一个child，如果要遍历多个child，则需要遍历child的sibling
      oldFiber = oldFiber.sibling
    }

    // 将新创建的fiber元素 添加到fiber tree数据结构中
    // 如果新创建的fiber元素是first child 则是child
    // 如果不是first child 则是sibling
    if (index === 0) {
      wipFiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }
    prevSibling = newFiber

    index++
  }

}


/**
 * 执行一个渲染单元(fiber)，并返回下一个fiber (unit of work)
 * @param fiber
 * @returns {null|*|{parent, dom: null, sibling: null, type, props: *, child: null}} next unit of work
 */
function performUnitOfWork(fiber) {
  // 执行一个 unit of work 需要做的事情：
  // 1. add the element to the DOM
  // 2. create the fibers for the element's children
  // 3. select the next unit of work

  console.log(fiber)

  const isFunctionComponent = fiber.type instanceof Function

  if (isFunctionComponent) {
    // 函数式组件没有dom
    updateFunctionComponent(fiber)
  } else {
     updateHostComponent(fiber)
  }

  // 1. create dom node
  // if (!fiber.dom) {
  //   fiber.dom = createDom(fiber)
  // }
  // 将fiber dom追加到fiber父节点
  // if (fiber.parent) {
  //   fiber.parent.dom.appendChild(fiber.dom)
  // }

  // 2. create a new fiber
  // const elements = fiber.props.children  // elements 是整个数组里的对象
  // console.log(elements)
  //
  // // 新建newFiber，构建fiber整个节点
  // reconcileChildren(fiber, elements)
  // let prevSibling = null

  // 构建fiber的联系
  // for (let i = 0; i < elements.length; i++) {
  //   const element = elements[i]
  //
  //   const newFiber = {
  //     type: element.type,
  //     props: element.props,
  //     dom: null,
  //     child: null,
  //     sibling: null,
  //     parent: fiber
  //   }
  //
  //   // 将新创建的fiber元素 添加到fiber tree数据结构中
  //   // 如果新创建的fiber元素是first child 则是child
  //   // 如果不是first child 则是sibling
  //   if (i === 0) {
  //     fiber.child = newFiber
  //   } else {
  //     prevSibling.sibling = newFiber
  //   }
  //   prevSibling = newFiber
  // }


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

// 上一次的fiber
let wipFiber = null
let hookIndex = null

function updateFunctionComponent(fiber) {
  wipFiber = fiber
  hookIndex = 0
  wipFiber.hooks = []
  // 运行function component to get child
  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber, children)
}

function useState(initial) {
  const oldHook = wipFiber.alternate && wipFiber.alternate.hooks && wipFiber.alternate.hooks[hookIndex]
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: []
  }

  // 运行action
  const actions = oldHook ? oldHook.queue: []
  actions.forEach(action => {
    hook.state = action(hook.state)
  })

  // setXXX
  // action 是 传入给useState的函数
  const setState = action => {
    hook.queue.push(action)
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot
    }
    nextUnitOfWork = wipRoot
    deletions = []
  }

  // hook追加到fiber的hooks
  wipFiber.hooks.push(hook)
  hookIndex++

  return [hook.state, setState]
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
  reconcileChildren(fiber, fiber.props.children)
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
export {
  useState
}
