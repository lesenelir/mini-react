import createElement from "./createElement"
import render from "./render"

const myReact = {
  createElement,
  render
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
)

// 渲染
const container = document.getElementById('root')
myReact.render(element, container)

console.log(element)

