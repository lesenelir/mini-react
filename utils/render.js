function render(element, container) {
  // 创建元素
  const dom = element.type === 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(element.type)

  // 给节点assign props不是children属性（即，赋值标签的属性）
  Object.keys(element.props).filter(key => {
    return key !== 'children'
  }).forEach(name => {
    dom[name] = element.props[name]
  })

  // element对象的children数组属性有子元素（对象）则重新构建新的节点塞入上一级节点
  element.props.children.forEach(child => {
    return render(child, dom)
  })

  // 新创建的原生节点追加到上一层节点中
  container.appendChild(dom)
}

export default render
