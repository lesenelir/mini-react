// const element = (
//   <div id='foo'>
//     <a>bar</a>
//     <b/>
//   </div>
// )

// const element =  myReact.createElement(
//   'div',
//   { id: 'foo' },
//   myReact.createElement('a', null, 'bar'), // children
//   myReact.createElement('b') // children
// )

// 创建文本节点 => 目的：统一数据结构都为一个对象
function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  }
}

// 创建元素节点
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child => (
        typeof child === 'object' ? child : createTextElement(child)
      ))
    }
  }
}

export default createElement
