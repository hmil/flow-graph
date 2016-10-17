import EventEmitter from './EventEmitter';
import { v1 } from './dto';
import NodeOutput from './NodeOutput';
import NodeInput from './NodeInput';

export default class Edge extends EventEmitter {

  private _graph: any;
  private _src: NodeOutput;
  private _dest: NodeInput;

  constructor(graph, src, dest) {
    super();
    this._graph = graph;
    this._src = src;
    this._dest = dest;
  }

  toJSON(): v1.Edge {
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

  static srcFromJSON(graph, data) {
    return graph.nodes[data.src.node].outputs[data.src.name];
  }

  static destFromJSON(graph, data) {
    return graph.nodes[data.dest.node].inputs[data.dest.name];
  }
}
