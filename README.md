# SwiftUI-React

A [SwiftUI](https://developer.apple.com/xcode/swiftui/)-inspired syntax for [React](https://reactjs.org/) components.

**React**

```javascript
function ReactTodos(props) {
  return (
    <div>
      <h1>Todos</h1>
      <ul>
        {props.todos.map(todo => (
          <li color={todo.color}>{todo.text}</li>
        ))}
      </ul>
    </div>
  );
}
```

**SwiftUI-React**

```javascript
function SwiftUITodos(props) {
  Div(() => {
    H1("Todos");
    Ul(props.todos, todo => {
      Li(todo.text).color(todo.color);
    });
  });
}
```

### What it is

An alternative approach for representing React components and component hierarchies using function calls instead of JSX, _inspired_ by the syntax used by Apple's SwiftUI.

### What it is not

A port of, or attempt to recreate, SwiftUI or its API within React.

## API

SwiftUI-React consists of a single factory function, `SwiftUI()`. It's used to create SwiftUI-React components that are both React components as well as functions which can be called directly within a render pass to add components to the React DOM.

In order for SwiftUI-React component function calls to be recognized as components, they must be used within the context of a SwiftUI-React-capable hierarchy. The easiest way to do this is to wrap the component used within `ReactDOM.render()` with `SwiftUI()`.

```javascript
ReactDOM.render(SwiftUI(<App />), document.getElementById("app"));
```

Alternatively, any SwiftUI-react component rendered as a normal React component will also serve as the root for a SwiftUI-React-capable hierarchy.

```javascript
const SuiApp = SwiftUI(App);
ReactDOM.render(<SuiApp />, document.getElementById("app"));
```

### `SwiftUI`

A factory function for creating SwiftUI-React components.

```javascript
function SwiftUI(
    executor:
      ReactElement |
      ReactComponent |
      ((value: any, props: object) => ReactElement | void)
  ):Function
```

TODO

### `SwiftUIComponent`

A component type created by calling `SwiftUI()`.

```javascript
type ChildrenExecutor =
  ((value?: any) => ReactElement | void) |
  ((value: any, index: number, collection: any[]) => ReactElement | void)
function SwiftUIComponent(
    value?: any,
    props?: object,
    childrenExecutor?: ChildrenExecutor
  ):Proxy;
function SwiftUIComponent(
    value: any,
    childrenExecutor: ChildrenExecutor
  ):Proxy;
function SwiftUIComponent(
    props: object,
    childrenExecutor: ChildrenExecutor
  ):Proxy;
function SwiftUIComponent(
    props: object
  ):Proxy;
function SwiftUIComponent(
    childrenExecutor: ChildrenExecutor
  ):Proxy;
```

TODO

## Usage

TODO

## FAQ

### Why?

This project was an exploration in seeing how close a React component could get to using a syntax similar to that seen with SwiftUI. The driving example was the one used on [Apple's landing page for SwiftUI](https://developer.apple.com/xcode/swiftui/).

![SwiftUI Example](https://developer.apple.com/xcode/swiftui/images/hero-lockup-medium.png)

The example was simple yet demonstrated a number of different characteristics of the SwuitUI that would have made a (React-backed) JavaScript implementation interesting to attempt.

### Should I use this?

Probably not. This was an exploration made without any intention for the code to be used in production with real-world projects. Because it is a wrapper over React's own component implementation, there would also be performance implications with the extra overhead necessary to implement this API.

However, if this approach really floats your boat and you stick to using it in small, personal projects, you should be fine. While it was simply an exploration around syntax, attention was given in attempting to make the solution a robust one.

### Isn't this the same as `React.createElement`?

At first glance, the use of SwfitUI-React components do look very similar to uses of `React.createElement`:

**React**

```javascript

React.createElement('div', null, [
  React.createElement('h1', null, 'Todos')
    React.createElement('ul', null, todos.map(todo =>
      React.createElement('li', {color: todo.color, todo.text)
    ))
  ])
}
```

**SwiftUI-React**

```javascript
Div(() => {
  H1("Todos");
  Ul(todos, todo => {
    Li(todo.text).color(todo.color);
  });
});
```

The difference is that SwiftUI components are compositions of functions rather than compositions of objects. This is most apparent with the `Div` component as you can see that it uses a function to define its children rather than an array of objects as is seen with the `createElement` example.

Each SwiftUI component itself is also a function. While React components can also be functions, or are classes that have `render()` methods that serve the same purpose, SwiftUI component functions get called before their respective render calls are made by React, used to create the elements that React will ultimately use in the rendering process.
