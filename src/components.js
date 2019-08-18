import React, { Component } from "react";
import { SwiftUI } from "./SwiftUI";

export const List = SwiftUI((items, { action, childrenAll }) => {
  const itemStyle = {
    borderBottom: "1px solid #efefef",
    padding: 5,
    cursor: "pointer"
  };
  return (
    <div>
      {childrenAll.map((children, index) => {
        const { uuid, title } = items[index];
        return (
          <div key={uuid} style={itemStyle} onClick={() => action(title)}>
            {children}
          </div>
        );
      })}
    </div>
  );
});

export const Image = SwiftUI((image, props) => {
  const style = {
    margin: "0 5px",
    verticalAlign: "top"
  };
  return <img style={style} src={image} alt="" />;
});

export const VStack = SwiftUI(({ alignment, children }) => {
  const style = {
    display: "inline-flex",
    flexDirection: "column"
  };
  return (
    <v-stack style={style} data-alignment={alignment}>
      {children}
    </v-stack>
  );
});

export const Text = SwiftUI(
  (text, { color = "black", fontStyle = "normal" }) => {
    return <span style={{ color, fontStyle }}>{text}</span>;
  }
);

export const TextNested = SwiftUI((text, props) => {
  Text(text, props);
});

export const TextClass = SwiftUI(
  class TextClass extends Component {
    static count = 0;
    myCount = ++TextClass.count;

    render() {
      Text(this.props.text, this.props);
      return <div>Instance #{this.myCount}</div>;
    }
  }
);
