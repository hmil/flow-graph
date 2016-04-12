import EventEmitter from './EventEmitter.js';

class Edge extends EventEmitter {

  constructor(graph, src, dest) {
    super();
    this._graph = graph;
    this._src = src;
    this._dest = dest;
  }

  toJSON() {
    return {
      src: {
        name: this._src.name,
        node: this._src.node.id
      },
      dest: {
        name: this._dest.name,
        node: this._dest.node.id
      }
    };
  }

  get src() {
    return this._src;
  }

  get dest() {
    return this._dest;
  }

  remove() {
    this._graph.unlink(this._src, this._dest);
  }

  toString() {
    return `${this.src} --> ${this.dest}`;
  }
}

Edge.srcFromJSON = function(graph, data) {
  return graph.nodes[data.src.node].outputs[data.src.name];
};

Edge.destFromJSON = function(graph, data) {
  return graph.nodes[data.dest.node].inputs[data.dest.name];
};

export default Edge;
