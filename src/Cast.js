

export default class Cast {

  constructor(src, dest, fn) {
    this._src = src;
    this._dest = dest;
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
