import GraphObject from './GraphObject.js';

export default class Edge extends GraphObject {

  constructor(graph, src, dest) {
    super();
    this._graph = graph;
    this._src = src;
    this._dest = dest;
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
