import NodeEndpoint from './NodeEndpoint.js';

var dbg_indent = -1;

export default class NodeOutput extends NodeEndpoint {
  get isOutput() {
    return true;
  }

  send(data) {
    // TODO: implement a global FIFO queue for treating sends
    const edges = this.edges.slice();
    dbg_indent++;
    for(let e of edges) {
      this._graph.log('    '.repeat(dbg_indent) + e);
      try {
        e.dest.receive(data, this);
      } catch (error) {
        console.error(error.stack);
      }
    }
    dbg_indent--;
  }
}
