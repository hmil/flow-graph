import NodeInput from './NodeInput.js';
import NodeOutput from './NodeOutput.js';
import EventEmitter from './EventEmitter.js';
import { uid } from '../utils.js';

export default class Node extends EventEmitter {

  constructor(graph, params = {}) {
    super();

    this._id = params.hasOwnProperty('id') ? params.id : uid();
    this._pos = {x: params.x || 0, y: params.y || 0};
    this._graph = graph;
    this._inputs = {};
    this._outputs = {};
    this._x = params.x || 0;
    this._y = params.y || 0;
    this.name = params.name || 'unnamed node';
    if (params.input) {
      for (let input of params.input) {
        this.addInput(input);
      }
    }
    if (params.output) {
      for (let output of params.output) {
        this.addOutput(output);
      }
    }
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
    this._inputs[input.name] = new NodeInput(this, input);
  }

  addOutput(output) {
    if (this._outputs.hasOwnProperty(output.name)) {
      throw new Error(`Output ${output.name} was defined twice! (first time with type ${this._outputs[output.name].type}, second time with type ${output.type})`);
    }
    this._outputs[output.name] = new NodeOutput(this, output);
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
    this.trigger('change');
  }

  set y(y) {
    this._y = y;
    this.trigger('change');
  }

  toString() {
    return this.name;
  }
}
