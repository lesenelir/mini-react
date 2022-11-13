import createElement from "./utils/createElement"
import render from "./utils/render"

const MyReact = {
  createElement,
  render
}


const element = MyReact.createElement(
  "div",
  {id: "foo", class: 'hello'},
  'Hello ',
  MyReact.createElement('a', null, 'Lesenelir'),
  MyReact.createElement('b')
)

console.log(element)

/**
 *  DOM结构：
 *    -- 即使有class属性，但是id属性优先级更高
 *
 *  <div id='foo'>
 *    "Hello "
 *    <a>Lesenelir</a>
 *    <b></b>
 *  </div>
 */


/**
 *  element节点：
 *
 *  {
 *    type: 'div',
 *    props: {
 *      id: 'foo',
 *      class: 'hello',
 *      children: [
 *        // 文本节点
 *        {
 *          type: 'TEXT_ELEMENT',
 *          props: {
 *            nodeValue: 'Hello',
 *            children: []
 *          }
 *        }
 *        // MyReact节点
 *        {
 *          type: 'a',
 *          props: {
 *            children: [
 *              {
 *                type: 'TEXT_ELEMENT',
 *                props: {
 *                  nodeValue: 'bar',
 *                  children: []
 *                }
 *              }
 *            ]
 *          }
 *        }
 *        // MyReact节点
 *        {
 *          type: 'b',
 *          props: {
 *            children: []
 *          }
 *        }
 *      ]
 *    }
 *  }
 */

const container = document.getElementById("root")
MyReact.render(element, container)
