import Edge from './Edge';
import Cast from './Cast';
import NodeBuilder from './NodeBuilder';
import EventEmitter from './EventEmitter';
import { v1 } from './dto';
import Node from './Node';
import NodeOutput from './NodeOutput';
import NodeInput from './NodeInput';
import Type from './Type';

interface NodeMap {
  [key: string]: Node;
}

interface CastMap {
  [key: string]: Array<Cast>;
}

interface Factory {
  (NodeBuilder): Node;
}

interface FactoryMap {
  [key: string]: Factory;
}

export default class FlowGraph extends EventEmitter {

  private _nodes: NodeMap;
  private _edges: Array<Edge>;
  private _casts: CastMap;
  private _defs: FactoryMap;
  private _debug: boolean;

  constructor() {
    super();
    this._nodes = {};
    this._edges = [];
    this._casts = {};
    this._defs = {};
    this._debug = false;
  }

  setDebug(debug: boolean): void {
    this._debug = debug;
  }

  getDebug(): boolean {
    return this._debug;
  }

  log(message: string): void {
    if (this._debug) {
      console.log(message);
    }
  }

  defineNode(name: string, factory: Factory): void {
    if (this._defs.hasOwnProperty(name)) {
      throw new Error(`Trying to define node ${name} but this node already exists`);
    }
    this._defs[name] = factory;
  }


  defineCast(src: string, dest: string, fn: (any) => any) {
    let casts = this._casts[src];
    if (casts === undefined) {
      casts = this._casts[src] = [];
    }

    casts.push(new Cast(src, dest, fn));
  }

  _createNode(name: string, props: any) {
    let factory = this._defs[name];

    if (factory == null) {
      throw new Error(`Node type '${name}' was not defined`);
    }

    let def = new NodeBuilder(name, props);
    factory(def);
    return def.build(this);
  }

  setJSON(data) {
    if (!data.hasOwnProperty('@ioflow-version')) {
      throw new Error('FlowGraph: Invalid JSON data');
    }
    this.removeAll();

    for (let node of data.nodes) {
      this.addNode(node.n, node.p);
    }
    for (let edge of data.edges) {
      let src = Edge.srcFromJSON(this, edge);
      let dest = Edge.destFromJSON(this, edge);
      this.link(src, dest);
    }
    return this;
  }

  toJSON(): v1.Graph {
    const data: v1.Graph = {
      '@ioflow-version': 0,
      nodes: [],
      edges: []
    };

    for (let i in this._nodes) {
      data.nodes.push({
        n: this._nodes[i].classname,
        p: this._nodes[i].toJSON()
      });
    }
    for (let i in this._edges) {
      data.edges.push(this._edges[i].toJSON());
    }

    return data;
  }

  removeAll(): void {
    const nb_edges = this._edges.length;
    for (let i = 0 ; i < nb_edges ; i++) {
      this._edges[0].remove();
    }
    for (let i of Object.keys(this._nodes)) {
      this._nodes[i].remove();
    }
  }

  addNode(name: string, props: any): Node {
    const node = this._createNode(name, props);
    if (this._nodes.hasOwnProperty(node.id)) {
      throw new Error(`Node ${node.id} already exists in the graph`);
    }
    this._nodes[node.id] = node;
    this._signalChange();
    return node;
  }

  removeNode(node: Node): void {
    this._nodes[node.id].trigger('remove');
    delete this._nodes[node.id];
    this._signalChange();
  }

  link(output: NodeOutput, input: NodeInput) {
    if (output == null || !output.isOutput) {
      throw new Error('FlowGraph.link(output, input): output must be a node output.');
    }
    if (input == null || !input.isInput) {
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
    this._signalChange();
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
    this._signalChange();
  }

  /**
   * Checks that output.type <: input.type
   */
  typeCheck(outType, inType) {
    const visited: {[key: string]: boolean} = {};
    visited[outType] = true;

    const _typeTrace = (output, input) => {
      if (output.lte(input)) {
        return [];
      } else {
        return this._getCastsFor(output).map((cast) => {
          const dest = cast.dest;
          if (visited[dest.toString()]) return false;

          const trace = _typeTrace(dest, input);
          return (trace === false) ? false : trace.concat([cast]);
        }).reduce(function(a, b) {
          return (a !== false) ? a : b;
        }, false);
      }
    };

    return _typeTrace(outType, inType);
  }

  _getCastsFor(srcType: Type): Array<Cast> {
    return this._casts[srcType.toString()] || [];
  }

  _signalChange() {
    this.trigger('change');
    this.trigger('update');
  }

  get edges() {
    return this._edges.slice();
  }

  get nodes() {
    return this._nodes;
  }

  get library() {
    return this._defs;
  }

  static fromJSON(data: v1.Graph): FlowGraph {
    return new FlowGraph().setJSON(data);
  }
}
