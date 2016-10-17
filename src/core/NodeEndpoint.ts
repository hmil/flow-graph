import Type from './Type';
import Edge from './Edge';
import Node from './Node';

interface NodeJSON {
  name: string;
  type: string;
}

export default class NodeEndpoint {

  private _edges: Array<Edge>;
  private _type: Type;
  private _name: string;
  private _graph: any;
  public node: Node;

  constructor(graph, node, props) {
    this._edges = [];
    this._type = new Type(props.type || '*');
    this._name = props.name;
    this._graph = graph;
    this.node = node; // TODO: make private
  }

  toJSON(): NodeJSON {
    return {
      name: this._name,
      type: this._type.toString()
    };
  }

  connect(edge: Edge): void {
    this._edges.push(edge);
  }

  disconnect(edge: Edge): void {
    let id = this._edges.indexOf(edge);
    if (id != -1) {
      this._edges.splice(id, 1);
    }
  }

  get type() {
    return this._type;
  }

  get edges() {
    return this._edges;
  }

  get name() {
    return this._name;
  }

  // Duck typing utilities
  get isInput() {
    return false;
  }
  get isOutput() {
    return false;
  }


  toString() {
    return `[${this.node}].<${this.name}>:${this.type}`;
  }
}
