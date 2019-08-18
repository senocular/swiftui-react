// https://developer.apple.com/xcode/swiftUI/

import React, {
  createElement,
  Component,
  Fragment,
  isValidElement
} from "react";
import { last, isReactComponent } from "./utils";

// Tracks SwiftUI component creation and
// place in the component hierarchy
const componentStack = [];

// Type associations made to SwiftUI components
// that determines how they're rendered
const Types = {
  CLASS: "class",
  COMPONENT: "component",
  CHILD: "child"
};

// User-facing strings
const Strings = {
  ERR_EMPTY_STACK:
    "SwiftUI RenderError: Attempted to render a SwiftUI component without a valid SwiftUI component root. Make sure all SwiftUI components are being called within a SwiftUI ancestor added to the React DOM.",
  ERR_UNKNOWN_TYPE:
    "SwiftUI RenderError: Attempted to render a SwiftUI component of an unknown type."
};

// Special key values being accessed within
// or sometimes added to user data
const VALUE_KEY = "value";
const KEY_FIELD_KEY = "keyField";
const DEFAULT_KEY_FIELD = "id";

/**
 * Captures the values from an arguments array for a SwiftUI
 * component call returning values in well known positions.
 * @param {any[]} args Arguments provided to the original SwiftUI
 * component call.
 * @param {boolean} hasValue Whether or not the component definition
 * expects a value.
 * @returns {any[]} A normalized arguments array in the format
 * [value, props, childrenExecutor]
 */
function normalizeComponentArgs(args, hasValue) {
  let childrenExecutor = null;
  const lastArg = last(args);
  if (typeof lastArg === "function") {
    childrenExecutor = lastArg;
    args.pop();
  }

  let value = null;
  let props;

  const count = args.length;
  if (count > 1) {
    // (value, props [, childrenExecutor])

    // even if the component was not defined with a value
    // parameter (hasValue = false), the number of arguments
    // is suggesting a value is getting passed in anyway

    value = args[0];
    props = {
      ...args[1],
      [VALUE_KEY]: value
    };
  } else if (count === 1) {
    // (props|value [, childrenExecutor])

    if (hasValue) {
      value = args[0];
      props = { [VALUE_KEY]: value };
    } else {
      props = args[0];
      if (VALUE_KEY in props) {
        value = props[VALUE_KEY];
      }
    }
  }

  return [value, props || {}, childrenExecutor];
}

/**
 * Renders a component by calling its executor or creating a React
 * element using a class-based SwiftUIComponent.
 * @param {string} type Component type.
 * @param {object} props Props to send to the executor where applicable.
 * @param {Function|SwiftUIComponent} executor Component executor function
 * or component class.
 * @param {boolean} hasValue Whether or not the component definition
 * expects a value.
 * @param {any} value Value provided for the component.
 * @param {number} index Location within an iteration if rendering a
 * component in a loop.
 * @param {any[]} collection The collection of values being iterated through
 * if rendering the component in a value loop.
 * @returns {ReactElement} A React element representing the rendition
 * of the component.
 */
function renderComponent(
  type,
  props,
  executor,
  hasValue = false,
  value = null,
  index = 0,
  collection = null
) {
  let key = props.key || index;
  let rendered; // return value from render (usually a React element)
  const components = []; // SwiftUI components created within this component
  componentStack.push(components);

  try {
    switch (type) {
      // When a component is created from a class and
      // called as a function.
      // ex: Comp = SwiftUI(class); Comp();

      case Types.CLASS: {
        // Because classes have additional life-cycle methods,
        // they need to be created as a React element rather
        // than simply called as functions in order for those
        // life-cycle methods to continue to function
        // correctly. In this case, the executor is a
        // SwiftUIComponent

        rendered = createElement(executor, props);
        break;
      }

      // When a component is created from a funtion and
      // called as a function or when a component is
      // created used as a React component
      // ex: Comp = SwiftUI(function); Comp();
      // ex: Comp = SwiftUI(class|function); <Comp />;

      case Types.COMPONENT: {
        rendered = hasValue ? executor(value, props) : executor(props);
        break;
      }

      // When the "component" is, or an iteration of, the
      // children block of another component call
      // ex: Comp = SwiftUI(...); Comp(value[s], props, value[s] => { });

      case Types.CHILD: {
        // to help sync instances and reduce component churn
        // try to identify a key for the rendered React components

        if (value) {
          const keyField =
            props[KEY_FIELD_KEY] ||
            (collection && collection[KEY_FIELD_KEY]) ||
            DEFAULT_KEY_FIELD;
          key = value[keyField] || key;
        }

        // children exutors call over values (if exist), not
        // props, where if values are arrays, an executor is
        // called like a map function.

        rendered = hasValue
          ? collection
            ? executor(value, index, collection)
            : executor(value)
          : executor();
        break;
      }

      default: {
        console.error(Strings.ERR_UNKNOWN_TYPE, type);
        rendered = null;
        break;
      }
    }
  } finally {
    componentStack.pop();
  }

  if (!components.length && rendered == null) {
    return null;
  }

  // The final result is a combination of the SwiftUI components
  // used in this component followed by any React component the
  // executor created and returned

  return (
    <Fragment key={key}>
      {renderComponents(components)}
      {rendered}
    </Fragment>
  );
}

/**
 * Renders multiple components.
 * @param {any[]} components Array of components to render, usually
 * from a component set pulled out of the componentStack.
 */
function renderComponents(components) {
  return components.map(({ type, props, executor, hasValue, value }, index) =>
    renderComponent(type, props, executor, hasValue, value, index)
  );
}

/**
 * Renders the children of a component adding them to a component's
 * props value, looping through multiple iterations of rendering the
 * children if the component was provided an array value.
 * @param {object} props Parent component props.
 * @param {boolean} hasValue Whether or not the component definition
 * expects a value.
 * @param {any} value Value provided to component.
 * @param {Function} executor Executor function for containing the
 * component children.
 * @returns {object} An updated props object containing an additional
 * children and childrenAll properties representing the children
 * components that were rendered.
 */
function renderChildrenToProps(props, hasValue, value, executor) {
  let children = props.children || null;
  let childrenAll = children ? [children] : [];

  if (executor) {
    const isCollectionValue = hasValue && Array.isArray(value);
    const collection = isCollectionValue ? value : null;
    const values = isCollectionValue ? value : [value];

    childrenAll = values.map((value, index) =>
      renderComponent(
        Types.CHILD,
        props,
        executor,
        hasValue,
        value,
        index,
        collection
      )
    );

    children = childrenAll[0];
  }

  return { ...props, children, childrenAll };
}

/**
 * Creates a SwiftUI component or SwiftUI component element. SwiftUI
 * components are callable constructor functions with the name
 * SwiftUIComponent, though each component created is a unique and
 * separate version of a SwiftUIComponent definition.
 * @param {Function|ReactElement} executor Function, class, or React element
 * to transform into a SwiftUI component or SwiftUI component element.
 * @returns {Function|ReactElement} Returns a SwiftUI component constructor
 * function when given a function or a SwiftUI component element when given
 * a React element.
 */
export function SwiftUI(executor) {
  // If called with a react element as the executor
  // ex: SwiftUI(<MyComponent />)
  // hijack the element's type and props and run it through
  // a SwiftUI component to allow other uses of SwiftUI components
  // within it and its children to render correctly

  if (isValidElement(executor)) {
    const Comp = SwiftUI(executor.type);
    return <Comp {...executor.props} />;
  }

  // Get some information about the way the call is being
  // made that helps determines how the component behaves

  const isClass = isReactComponent(executor);
  const baseClass = isClass ? executor : Component;
  const hasValue = !isClass && executor.length > 1;

  // The returned component definition which can be called
  // as a function or be used as a class component

  /**
   * Constructor for SwiftUI components. Can be called as a
   * function or used as a React component.
   * @param {...any} args Arguments in variations of the format
   * [value, props, childrenExecutor] where value or props may
   * be omitted and where component executor arity determines
   * which parameter is used when the other is not provided.
   * @returns {Proxy} When called as a function, returns a proxy
   * for the component's props. Methods called from this proxy
   * represent the prop being set (method name = prop name) and
   * its arguments the prop's value.
   */
  const SwiftUIComponent = function(...args) {
    // When used as a react component
    // ex: <SwiftUIComponent />
    // because all SwiftUIComponents are defined as extending
    // React's Component (or a class that already does) it will
    // be instantiated with `new` when rendered by React and
    // new.target will be defined

    if (new.target) {
      // super() for non-class constructor functions
      const instance = Reflect.construct(baseClass, args, new.target);

      // The render method is overridden to act as an executor that
      // can handle rendering other SwiftUI component instances. If
      // extending another class, that class's render method is used
      // as the executor when rendering (i.e. super.render())

      const render = isClass ? instance.render.bind(instance) : executor;
      instance.render = function() {
        return renderComponent(
          Types.COMPONENT,
          this.props,
          render,
          hasValue,
          this.props[VALUE_KEY]
        );
      };
      return instance;
    }

    // When the component is called as a function
    // ex: SwiftUIComponent()

    const [value, props, childrenExecutor] = normalizeComponentArgs(
      args,
      hasValue
    );

    const descriptor = {
      type: isClass ? Types.CLASS : Types.COMPONENT,
      props: renderChildrenToProps(props, hasValue, value, childrenExecutor),
      executor: isClass ? SwiftUIComponent : executor,
      hasValue,
      value
    };

    // Add the component to the component list in
    // the current place in the component hierarchy.
    // When the parent component is finished rendering, it
    // will process all the components at this level in
    // the hierarchy to create React elements for each.

    if (componentStack.length) {
      const siblings = last(componentStack);
      siblings.push(descriptor);
    } else {
      console.error(Strings.ERR_EMPTY_STACK, descriptor);
    }

    // Proxy used to allow arbitrary prop setting through
    // methods called from the SwiftUI component call
    // ex: SwiftUIComponent(...).myPropName(myPropValue)

    return new Proxy(descriptor.props, {
      get(target, prop) {
        return function(...args) {
          const count = args.length;
          target[prop] = !count ? true : count === 1 ? args[0] : args;
          return this;
        };
      }
    });
  };

  // Manual inheritance set up since not using class syntax
  // (not using class so SwiftUIComponent is callable)

  Object.setPrototypeOf(SwiftUIComponent, baseClass);
  Object.setPrototypeOf(SwiftUIComponent.prototype, baseClass.prototype);

  return SwiftUIComponent;
}
