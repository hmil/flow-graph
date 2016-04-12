import NodeEndpoint from './NodeEndpoint.js';

export default class NodeInput extends NodeEndpoint {

  constructor(node, props) {
    super(node, props);
    this._handle = props.handle;
  }

  get isInput() {
    return true;
  }

  receive(data) {
    this._handle(data);
  }
}
