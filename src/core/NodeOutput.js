import NodeEndpoint from './NodeEndpoint.js';

export default class NodeOutput extends NodeEndpoint {
  get isOutput() {
    return true;
  }

  send(data) {
    // TODO: implement a global FIFO queue for treating sends
    const edges = this.edges.slice();
    for(let e of edges) {
      e.dest.receive(data);
    }
  }
}
