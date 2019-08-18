export function last(arr) {
  return arr.length > 0 ? arr[arr.length - 1] : undefined;
}

export function isReactComponent(component) {
  return Boolean(
    typeof component === "function" &&
      component.prototype &&
      component.prototype.isReactComponent
  );
}
