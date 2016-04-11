import NodeEndpoint from './NodeEndpoint.js';

export default class NodeOutput extends NodeEndpoint {
  get isOutput() {
    return true;
  }
}
