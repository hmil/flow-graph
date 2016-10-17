import EventEmitter from './EventEmitter';
import { uid } from '../utils';
import NodeInput from './NodeInput';
import NodeOutput from './NodeOutput';
import { v1 } from './dto';


interface InputMap {
  [key: string]: NodeInput;
}

interface OutputMap {
  [key: string]: NodeOutput;
}

export interface NodeAttributes {
  id?: string;
  x?: number;
  y?: number;
  name?: string;
  icon?: string;
  props?: any;
}

export default class Node extends EventEmitter {

  private _classname: string;
  private _graph: any;
  private _id: string;
  private _x: number;
  private _y: number;
  private _props: any;
  private _inputs: InputMap;
  private _outputs: OutputMap;

  name: string;
  icon: string;

  constructor(classname, graph, attrs: NodeAttributes = {}) {
    super();

    this._classname = classname;
    this._graph = graph;

    this._id = attrs.id != null ? attrs.id : uid();
    this._x = attrs.x || 0;
    this._y = attrs.y || 0;
    this.name = attrs.name || classname;
    this.icon = attrs.icon || '';
    this._props = attrs.props || {};

    this._inputs = {};
    this._outputs = {};
  }

  toJSON(): v1.Node {
    return {
      id: this._id,
      x: this._x,
      y: this._y,
      name: this.name,
      props: this._props
    };
  }

  addInput(input) {
    if (this._inputs.hasOwnProperty(input.name)) {
      throw new Error(`Input ${input.name} was defined twice! (first time with type ${this._inputs[input.name].type}, second time with type ${input.type})`);
    }
    this._inputs[input.name] = input;
  }

  addOutput(output) {
    if (this._outputs.hasOwnProperty(output.name)) {
      throw new Error(`Output ${output.name} was defined twice! (first time with type ${this._outputs[output.name].type}, second time with type ${output.type})`);
    }
    this._outputs[output.name] = output;
  }

  removeInput(name) {
    delete this._inputs[name];
    // TODO check bonds
  }

  removeOutput(name) {
    delete this._outputs[name];
    // TODO check bonds
  }

  remove() {
    this._graph.removeNode(this);
    // TODO: ensure all listeners are removed
  }

  send(outputName, data) {
    this._outputs[outputName].send(data);
  }

  get id() {
    return this._id;
  }

  input(name) {
    return this._inputs[name];
  }

  output(name) {
    return this._outputs[name];
  }

  get inputs() {
    return this._inputs;
  }

  get outputs() {
    return this._outputs;
  }

  get n_inputs() {
    return Object.keys(this._inputs).length;
  }

  get n_outputs() {
    return Object.keys(this._outputs).length;
  }

  get classname() {
    return this._classname;
  }

  get props() {
    return this._props;
  }

  getInputIndex(input) {
    return Object.keys(this._inputs).indexOf(input.name);
  }

  getOutputIndex(output) {
    return Object.keys(this._outputs).indexOf(output.name);
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  set x(x) {
    this._x = x;
    this._signalChange();
  }

  set y(y) {
    this._y = y;
    this._signalChange();
  }

  _signalChange() {
    this.trigger('change');
    this._graph.trigger('update');
  }

  toString() {
    return this.name;
  }
}
