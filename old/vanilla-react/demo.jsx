/**
 * 原始的React.createElement返回的对象:
 * {
 *   type: 'h1',
 *   props: {
 *     id: 'title'
 *     children: {
 *       type: 'a',
 *       props: {
 *         href: 'lesenelir.me',
 *         children: 'Lesenelir Blog'
 *       }
 *     }
 *   }
 * }
 *
 * JSX:
 * <h1 id="title">
 *   <a href="lesenelir.me">Lesenelir Blog</a>
 * </h1>
 *
 */
const res = React.createElement(
  'h1',
  {id: 'title'},
  React.createElement(
    'a',
    {href: 'lesenelir.me'},
    'Lesenelir Blog'
  )
)
console.log(res)

function App() {
  return (
    <>
      Hello
    </>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App/>)
