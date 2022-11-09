/**
 *
 * @param type
 * @param props
 * @param children 收集容器
 * @returns {{type, props: (*&{children: (*|{type: string, props: {nodeValue, children: *[]}})[]})}}
 */
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child => (
        typeof child === 'object'
          ? child
          : createTextElement(child)
      ))
    }
  }
}

// 生成纯文字节点
// 纯文本节点的类型type 是 TEXT_ELEMENT
function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  }
}

export default createElement
