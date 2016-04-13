import NodeEndpoint from './NodeEndpoint.js';

export default class NodeInput extends NodeEndpoint {

  constructor(graph, node, props) {
    super(graph, node, props);
    this._handle = props.handle;
  }

  get isInput() {
    return true;
  }

  receive(data, sender) {
    this._handle(data, {
      nodeclass: sender.node.classname,
      node: sender.node.name,
      endpoint: sender.node.endpoint
    });
  }
}
