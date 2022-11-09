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

// element元素节点
/**
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
