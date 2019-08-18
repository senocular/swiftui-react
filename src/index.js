import React, { Component } from "react";
import ReactDOM from "react-dom";
import { SwiftUI as View } from "./SwiftUI";
import { Themes } from "./Themes";
import { List, Image, VStack, Text, TextNested, TextClass } from "./components";

// TODO: colors and leading as enum values
// leading should be left align in the vstack column

const Content = View(({ Themes }) => {
  const model = Themes.listModel;

  List(model.items, { action: model.selectItem, keyField: "uuid" }, item => {
    Image(item.image);
    VStack({ alignment: "leading" }, () => {
      Text(item.title);
      TextNested(item.subtitle).color("gray");
      TextClass({ text: "As seen on TV" })
        .color("red")
        .fontStyle("italic");
    });
  });
});

class Container extends Component {
  static getSortedThemes(Themes) {
    const items = Themes.listModel.items.slice();
    items.sort(() => (Math.random() > 0.5 ? 1 : -1));
    return {
      ...Themes,
      listModel: {
        ...Themes.listModel,
        items
      }
    };
  }

  state = {
    Themes: Container.getSortedThemes(Themes)
  };

  onClick = event => {
    this.setState(state => ({
      Themes: Container.getSortedThemes(state.Themes)
    }));
  };

  render() {
    return (
      <div>
        <div>
          <button onClick={this.onClick}>Sort</button>
        </div>
        <Content Themes={this.state.Themes} />
        <div>{this.props.children}</div>
      </div>
    );
  }
}

function Foo(props) {
  Content(props);
  return (
    <div>
      <Container>Container Children</Container>
      Hi <Bar>Bar Child</Bar> {props.children}
    </div>
  );
}

const Bar = View(props => {
  return (
    <div>
      <Text value="BAR" color="green" />
      {props.children}
    </div>
  );
});

ReactDOM.render(
  View(<Foo Themes={Themes}>Foo Child</Foo>),
  document.body.appendChild(document.createElement("div"))
);
