import { uid } from './utils.js';
import EventEmitter from './EventEmitter.js';

export default class GraphObject extends EventEmitter {

  constructor() {
    super();
    this._id = uid();
  }

  get id() {
    return this._id;
  }
}
