import createElement from "./src/createElement"


const MyReact = {
  createElement
}


const element = MyReact.createElement(
  "div",
  {id: "foo", class: 'hello'},
  'Hello',
  MyReact.createElement('a', null, 'bar'),
  MyReact.createElement('b')
)

console.log(element)


// const container = document.getElementById("root")
// ReactDOM.render(element, container)
