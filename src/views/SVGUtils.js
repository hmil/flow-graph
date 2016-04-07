
export function createSVGNode(name, attrs = {}) {
  let node = document.createElementNS('http://www.w3.org/2000/svg', name);

  for (let i in attrs) {
    node.setAttribute(i, attrs[i]);
  }
  return node;
}
