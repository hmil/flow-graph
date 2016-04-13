import Type from './Type.js';

export default class Cast {

  constructor(src, dest, fn) {
    this._src = new Type(src);
    this._dest = new Type(dest);
    this._fn = fn;
  }

  get src() {
    return this._src;
  }

  get dest() {
    return this._dest;
  }

  cast(value) {
    return this._fn(value);
  }
}
