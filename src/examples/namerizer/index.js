import React from "react";
import ReactDOM from "react-dom";
import { SwiftUI as View } from "../../SwiftUI";
import { Themes } from "./Themes";
import { List, Image, VStack, Text } from "./components";
import { Colors, Alignment } from "./enums";

const { leading } = Alignment;
const { gray } = Colors;

const Content = View(() => {
  const model = Themes.listModel;

  List(model.items, { action: model.selectItem }, item => {
    Image(item.image);
    VStack({ alignment: leading }, () => {
      Text(item.title);
      Text(item.subtitle).color(gray);
    });
  });
});

ReactDOM.render(
  <Content />,
  document.body.appendChild(document.createElement("div"))
);
