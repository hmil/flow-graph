import Edge from './Edge.js';
import Cast from './Cast.js';
import Node from './Node.js';
import EventEmitter from './EventEmitter.js';
import { styleManager } from '../utils.js';

class FlowGraph extends EventEmitter {

  constructor() {
    super();
    this._nodes = {};
    this._edges = [];
    this._casts = {};
  }

  setJSON(data) {
    this.removeAll();

    for (let node of data.nodes) {
      this.addNode(node);
    }
    for (let edge of data.edges) {
      let src = Edge.srcFromJSON(this, edge);
      let dest = Edge.destFromJSON(this, edge);
      this.link(src, dest);
    }
    return this;
  }

  toJSON() {
    const data = {
      version: 0,
      nodes: [],
      edges: []
    };

    for (let i in this._nodes) {
      data.nodes.push(this._nodes[i].toJSON());
    }
    for (let i in this._edges) {
      data.edges.push(this._edges[i].toJSON());
    }

    return data;
  }

  removeAll() {
    const nb_edges = this._edges.length;
    for (let i = 0 ; i < nb_edges ; i++) {
      this._edges[0].remove();
    }
    for (let i of Object.keys(this._nodes)) {
      this._nodes[i].remove();
    }
  }

  addNode(nodeDef) {
    const node = new Node(this, nodeDef);
    if (this._nodes.hasOwnProperty(node.id)) {
      throw new Error(`Node ${node.id} already exists in the graph`);
    }
    this._nodes[node.id] = node;
    this.trigger('change');
    return node;
  }

  removeNode(node) {
    delete this._nodes[node.id];
  }

  link(output, input) {
    if (!(output.isOutput)) {
      throw new Error('FlowGraph.link(output, input): output must be a node output.');
    }
    if (!(input.isInput)) {
      throw new Error('FlowGraph.link(output, input): input must be a node input.');
    }

    let edge = new Edge(this, output, input);

    const trace = this.typeCheck(edge.src.type, edge.dest.type);
    if (trace === false) {
      throw new Error(`Cannot create edge ${edge} because '${output.type}' is not a subtype of '${input.type}'.`);
    }

    output.edges.forEach(function(e) {
      if(e.dest == input) {
        throw new Error(`This edge already exists: ${e}`);
      }
    });

    output.connect(edge);
    input.connect(edge);
    this._edges.push(edge);
    this.trigger('change');
  }

  unlink(output, input) {
    const edge = output.edges.find(function(e) {
      return e.dest == input;
    });

    if (edge == null) {
      console.warn(`unlink: There is no edge between ${output} and ${input}`);
    }

    edge.src.disconnect(edge);
    edge.dest.disconnect(edge);
    this._edges.splice(this._edges.indexOf(edge), 1);
    this.trigger('change');
  }

  /**
   * Checks that output.type <: input.type
   */
  typeCheck(outType, inType) {
    const visited = {};
    visited[outType] = true;

    const _typeTrace = (output, input) => {
      if (output.lte(input)) {
        return [];
      } else {
        return this._getCastsFor(output).map((cast) => {
          const dest = cast.dest;
          if (visited[dest]) return false;

          const trace = _typeTrace(dest, input);
          return (trace === false) ? false : trace.concat([cast]);
        }).reduce(function(a, b) {
          return (a !== false) ? a : b;
        }, false);
      }
    };

    return _typeTrace(outType, inType);
  }


  addCast(src, dest, fn) {
    let casts = this._casts[src];
    if (casts === undefined) {
      casts = this._casts[src] = [];
    }

    casts.push(new Cast(src, dest, fn));
  }

  _getCastsFor(srcType) {
    return this._casts[srcType.toString()] || [];
  }

  get edges() {
    return this._edges.slice();
  }

  get nodes() {
    return this._nodes;
  }
}

FlowGraph.setStyle = function(style) {
  styleManager.setStyle(style);
};

FlowGraph.fromJSON = function(data) {
  return new FlowGraph().setJSON(data);
};

export default FlowGraph;
