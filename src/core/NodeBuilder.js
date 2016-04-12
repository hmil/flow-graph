import NodeInput from './NodeInput.js';
import NodeOutput from './NodeOutput.js';
import Node from './Node.js';


// Thses two classes allow to provide a node output handle to the factory, before
// the node is actually created.
class OutputSurrogate {
  constructor(name, nodeProvider) {
    this._provider = nodeProvider;
    this._name = name;
  }

  send(data) {
    this._provider.node.send(this._name, data);
  }
}

class NodeProvider {
  constructor() {
    this._node = null;
  }

  get node() {
    if (this._node === null) {
      throw new Error('Node is not yet available. (Probably calling output.send in constructor) TODO: point to usage doc');
    }
    return this._node;
  }

  set node(node) {
    this._node = node;
  }
}

export default class NodeBuilder {
  constructor(name) {
    this._closed = false;
    this._name = name;
    this._teardown = null;
    this._inputs = [];
    this._outputs = [];
    this._nodeProvider = new NodeProvider();
  }

  input(name, type, handle) {
    this._ensureOpened();
    this._inputs.push({ name, type, handle });
    return this;
  }

  output(name, type) {
    this._ensureOpened();
    this._outputs.push({ name, type });
    return new OutputSurrogate(name, this._nodeProvider);
  }

  teardown(handle) {
    this._ensureOpened();
    if (this._teardown != null) {
      throw new Error('You can only define one teardown handle.');
    }
    this._teardown = handle;
    return this;
  }

  build(graph, props) {
    this._closed = true;

    const node = new Node(this._name, graph, props);
    for (let input of this._inputs) {
      node.addInput(new NodeInput(node, input));
    }
    for (let output of this._outputs) {
      node.addOutput(new NodeOutput(node, output));
    }
    if (this._teardown) {
      node.on('remove', this._teardown);
    }
    this._nodeProvider.node = node;
    return node;
  }

  _ensureOpened() {
    if (this._closed) {
      throw new Error('Modifying builder after it was closed. (Probably calling a builder method in a callback) TODO: point user to usage doc');
    }
  }
}
