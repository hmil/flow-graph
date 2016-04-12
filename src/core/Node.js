import NodeInput from './NodeInput.js';
import NodeOutput from './NodeOutput.js';
import EventEmitter from './EventEmitter.js';
import { uid } from '../utils.js';

export default class Node extends EventEmitter {

  constructor(classname, graph, props = {}) {
    super();

    this._classname = classname;
    this._graph = graph;

    this._id = props.hasOwnProperty('id') ? props.id : uid();
    this._pos = {x: props.x || 0, y: props.y || 0};
    this._x = props.x || 0;
    this._y = props.y || 0;
    this.name = props.name || 'unnamed node';

    this._inputs = {};
    this._outputs = {};
  }

  toJSON() {
    const data = {
      id: this._id,
      x: this._x,
      y: this._y,
      name: this.name,
      input: [],
      output: []
    };

    for (let i in this._inputs) {
      data.input.push(this._inputs[i].toJSON());
    }

    for (let i in this._outputs) {
      data.output.push(this._outputs[i].toJSON());
    }

    return data;
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
