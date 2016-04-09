import Type from './Type.js';

export default class NodeEndpoint {

  constructor(node, props) {
    this._edges = [];
    this._type = new Type(props.type || '*');
    this._name = props.name;
    this.node = node;
  }

  connect(edge) {
    this._edges.push(edge);
  }

  disconnect(edge) {
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


  toString() {
    return `[${this.node}].<${this.name}>:${this.type}`;
  }
}