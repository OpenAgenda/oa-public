function makeUnselectable(node) {
  if (node.nodeType == 1) {
      node.setAttribute("unselectable", "on");
  }
  var child = node.firstChild;
  while (child) {
      makeUnselectable(child);
      child = child.nextSibling;
  }
}