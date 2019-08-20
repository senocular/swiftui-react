# SwiftUI-React

A [SwiftUI](https://developer.apple.com/xcode/swiftui/)-inspired syntax for [React](https://reactjs.org/) components.

**SwiftUI-React**

```javascript
function SwiftUITodos(props) {
  Div(() => {
    H1("Todos");
    Ul(props.todos, todo => {
      Li(todo.text).lineThrough(todo.checked);
    });
  });
}
```

### What it is

An alternative approach for representing React components and component hierarchies using function calls instead of JSX, _inspired_ by the syntax used by Apple's SwiftUI.

### What it is not

A port of, or attempt to recreate, SwiftUI or its API within React.

## API

The SwiftUI-React API consists of one factory function, `SwiftUI()`, and the components it creates. Swift-React components can be used as React components or called as regular functions. When called as functions, they will add React components to the React DOM just as though they were used as React components.

### `SwiftUI`

A factory function for creating SwiftUI-React components.

```javascript
function SwiftUI(
    executor:
      ReactElement |
      ReactComponent |
      ((value: any, props: object) => ReactElement | void)
  ):SwiftUIComponent
```

#### Parameters

**executor**: A React element, React component (function or class), or specialized component function that includes a `value` parameter along with the standard function component `props` parameter that is to be converted into a SwiftUI-React component or element instance.

#### Returns

A unique SwiftUIComponent function representing the component created, or a React element thats an instance of a SwiftUIComponent wrapping the React element passed.

#### Description

Essentially, `SwiftUI()` converts React components into SwiftUI-React components.  It supports both function components and class components as well as a third variation of a function component that has two parameters.

```javascript
const SwiftUIComponent = SwiftUI(ReactComponent);
```

The third function variation - a value-first component - is recognized when the arity of a function given to `SwiftUI()` is greater than 1.  In this case, when the component is called, it would expect the first argument to be its `value` and the second to be its `props` rather than the first being the `props` as is the normal behavior.  The `value` argument is simply a convenience parameter that maps to `props.componentValue`.

```javascript
const SuiComp = SwiftUI(function Comp (value, props) {});
SuiComp(100);
// is the same as
const SuiComp = SwiftUI(function Comp (props) {});
SuiComp({ componentValue: 100 });
```

Aside from components, it can also convert React elements into SwiftUI-React elements.  This is not normally necessary because you would generally just create and use SwiftUI-React components.

```javascript
function Comp (props) {}
SwiftUI(<Comp />);
// is the same as
function Comp (props) {}
const SuiComp = SwiftUI(Comp);
<SuiComp />;
```

Components returned from `SwiftUI()` calls are callable class constructors that can be used as React components or called as normal functions.  These constructors are identified in this documentation as having the type `SwiftUIComponent` but each is unique.

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

#### Parameters

**value**: The value pased into the function call, or whats in `props.componentValue`.  This is used if the component was defined as a value-first component or if the component was called with a non-object first argument.

**props**: The props object to use for the component.

**childrenExecutor**: A function that is used to set up the children of the component. This will either get passed `props.componentValue` or if `props.componentValue` is an array, will be treated as a map function that maps over all the values in that array.

#### Returns

A Proxy object which transforms method calls into props setters, where the name of the method called becomes a prop name and the argument(s) passed in become its value.

#### Description

TODO

## Usage

In order for SwiftUI-React component function calls to be recognized as components, they must be used within the context of a SwiftUI-React-capable hierarchy. This means being within the render body of a component that is itself, or has an ancestor that is a SwiftUI-React component that been added to the React DOM as a normal React component.

```jsx
const H1 = SwiftUI((value, props) => {
  return <h1>{value}</h1>;
});

const App = SwiftUI(function () {
  H1("App"); // allowed because App is added as <App /> (below)
});

ReactDOM.render(<App />, document.getElementById("app"));
```

If your root is not a SwiftUI-React component, you can conveniently wrap it in a call to `SwiftUI()` to enable SwiftUI-React component calls within your components.

```jsx
function App() {
  return <div>App</div>;
}
ReactDOM.render(SwiftUI(<App />), document.getElementById("app"));
```

## FAQ

### Why?

This project was an exploration in seeing how close a React component could get to using a syntax similar to that seen with SwiftUI. The driving example was the one used on [Apple's landing page for SwiftUI](https://developer.apple.com/xcode/swiftui/).

![SwiftUI Example](https://developer.apple.com/xcode/swiftui/images/hero-lockup-medium.png)

This example was simple yet demonstrated a number of different characteristics of the SwiftUI that would have made a (React-backed) JavaScript implementation interesting to attempt.  The SwiftUI version of this example (called "namerizer") is available in the [Examples](src/examples).

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
    React.createElement('li', {color: todo.color}, todo.text)
  ))
])
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
