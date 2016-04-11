import NodeEndpoint from './NodeEndpoint.js';

export default class NodeInput extends NodeEndpoint {
  get isInput() {
    return true;
  }
}
