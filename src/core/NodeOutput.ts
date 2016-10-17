import NodeEndpoint from './NodeEndpoint';

export default class NodeOutput extends NodeEndpoint {
  get isOutput(): boolean {
    return true;
  }

  send(data): void {
    // TODO: implement a global FIFO queue for treating sends
    const edges = this.edges.slice();
    for(let e of edges) {
      try {
        e.dest.receive(data, this);
      } catch (error) {
        console.error(error.stack);
      }
    }
  }
}
