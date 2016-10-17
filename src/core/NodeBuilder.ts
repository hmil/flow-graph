import NodeInput from './NodeInput';
import NodeOutput from './NodeOutput';
import { default as Node, NodeAttributes } from './Node';
import { uid } from '../utils';
import Type from './Type';


// Thses two classes allow to provide a node output handle to the factory, before
// the node is actually created.
class OutputSurrogate {

  private _provider: NodeProvider;
  private _name: string;

  constructor(name: string, nodeProvider: NodeProvider) {
    this._provider = nodeProvider;
    this._name = name;
  }

  send(data: any) {
    this._provider.node.send(this._name, data);
  }
}

class NodeProvider {

  private _node?: Node;

  get node(): Node {
    if (this._node === undefined) {
      throw new Error('Node is not yet available. (Probably calling output.send in constructor) TODO: point to usage doc');
    }
    return this._node;
  }

  set node(node: Node) {
    this._node = node;
  }
}

interface InputParams {
  name: string;
  type: Type;
  handle: (data: any) => void;
}

interface OutputParams {
  name: string;
  type: Type;
}

export default class NodeBuilder {

  private _closed: boolean;
  private _classname: string;
  private _teardown?: () => void;
  private _inputs: Array<InputParams>;
  private _outputs: Array<OutputParams>;
  private _nodeProvider: NodeProvider;
  private _id: string;
  private _props: any;

  name: string;
  icon: string;
  x: number;
  y: number;

  constructor(classname: string, attrs: NodeAttributes = {}) {
    this._closed = false;
    this._classname = classname;
    this._inputs = [];
    this._outputs = [];
    this._nodeProvider = new NodeProvider();
    this._id = attrs.id || uid();
    this.name = attrs.name || 'untitled node';
    this.icon = attrs.icon || '';
    this.x = parseInt('' + attrs.x);
    this.y = parseInt('' + attrs.y);
    this._props = attrs.props || {};
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

  build(graph) {
    this._closed = true;

    const node = new Node(this._classname, graph, {
      id: this._id,
      name: this.name,
      icon: this.icon,
      x: this.x, y: this.y,
      props: this.props
    });
    for (let input of this._inputs) {
      node.addInput(new NodeInput(graph, node, input));
    }
    for (let output of this._outputs) {
      node.addOutput(new NodeOutput(graph, node, output));
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

  get props() {
    return this._props;
  }

  get id() {
    return this._id;
  }
}
