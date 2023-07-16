import createElement from "./createElement"

const myReact = {
  createElement,
}

/**
 *  最后创建的对象如下：
 *
 *  const element = {
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
 *        },
 *        // 元素节点
 *        {
 *          type: 'a',
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
const element =  myReact.createElement(
  'div',
  { id: 'foo', class: 'bar'},
  'Hello',
  myReact.createElement('a', null, 'bar'),
)

console.log(element)

