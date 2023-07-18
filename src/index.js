import createElement from "./createElement"
import render from "./render"

const myReact = {
  createElement,
  render
}


const handleInput = (e) => {
  const oH1 = document.getElementById('h1')
  oH1.innerText = 'Hello ' +  e.target.value
  console.log(oH1)
  console.log('input')
}

/**
 *  最后创建的对象如下：
 *
 *  const element = {
 *    type: 'div',
 *    props: {
 *      id: 'foo',
 *      class: 'hello',
 *      style: {
 *        color: 'blue'
 *      }
 *      children: [
 *        // 文本节点
 *        {
 *          type: 'TEXT_ELEMENT',
 *          props: {
 *            nodeValue: 'Hello',
 *            children: []
 *          }
 *        },
 *        // 元素节点
 *        {
 *          type: 'div',
 *          props: {
 *            children: [
 *              {
 *                type: 'TEXT_ELEMENT',
 *                props: {
 *                  nodeValue: 'bar',
 *                }
 *              }
 *            ]
 *          }
 *        },
 *        // 元素节点
 *        {
 *          type: 'input',
 *          props: {
 *            id: 'input',
 *            oninput: handleInput,
 *            children: []
 *          }
 *        },
 *        // 元素节点
 *        {
 *          type: 'h1',
 *          props: {
 *            id: 'h1',
 *            children: [
 *              // 文本节点
 *              {
 *                type: 'TEXT_ELEMENT',
 *                props: {
 *                  nodeValue: 'Hello',
 *                  children: []
 *                }
 *              }
 *            ]
 *          }
 *        }
 *      ]
 *    }
 *  }
 *
 */

//      babel                                createDom
// JSX  ----->  createElement  -----> object  ----->  dom  ----->  render
const element =  myReact.createElement(
  'div',
  { id: 'foo', class: 'bar', style: 'color: blue' },
  'Hello',
  myReact.createElement('div', null, 'bar'),
  myReact.createElement('input', {id: 'input', oninput: handleInput}, null),
  myReact.createElement('h1', {id: 'h1'}, 'Hello')
)

// 渲染
const container = document.getElementById('root')
myReact.render(element, container)

console.log(element)

