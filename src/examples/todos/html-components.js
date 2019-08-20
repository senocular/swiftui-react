import React from "react";
import { SwiftUI } from "../../SwiftUI";

export const Div = SwiftUI(({children}) =>
    <div>{children}</div>
);

export const H1 = SwiftUI((text, props) =>
    <h1>{ text }</h1>
);

export const Ul = SwiftUI((items, { childrenAll }) =>
    <ul>{childrenAll}</ul>
);

export const Li = SwiftUI((text, { lineThrough }) => {
    const textDecoration = lineThrough ? "line-through" : "normal";
    return <li style={{ textDecoration }}>{ text }</li>;
});
