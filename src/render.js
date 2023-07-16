/**
 * @param element object
 * @param container dom
 */
function render(element, container) {
  const dom =
    element.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(element.type)

  Object.keys(element.props).filter((key) => key !== 'children').forEach((name) => {
    dom[name] = element.props[name]
  })

  // 子元素递归进行渲染
  element.props.children.forEach((child) => {
    render(child, dom)
  })

  container.append(dom)
}

export default render

