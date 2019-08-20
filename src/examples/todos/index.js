import React from "react";
import ReactDOM from "react-dom";
import { SwiftUI } from "../../SwiftUI";
import { Div, H1, Ul, Li } from "./html-components";
import todos from "./todos.json";

function SwiftUITodos(props) {
  Div(() => {
    H1("Todos");
    Ul(props.todos, todo => {
      Li(todo.text).lineThrough(todo.checked);
    });
  });
}

ReactDOM.render(
  SwiftUI(<SwiftUITodos todos={ todos } />),
  document.body.appendChild(document.createElement("div"))
);
