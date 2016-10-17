import Type from './Type';

export default class Cast {

  private _src: Type;
  private _dest: Type;
  private _fn: (any) => any;

  constructor(src: string, dest: string, fn: (any) => any) {
    this._src = new Type(src);
    this._dest = new Type(dest);
    this._fn = fn;
  }

  get src(): Type {
    return this._src;
  }

  get dest(): Type {
    return this._dest;
  }

  cast(value): any {
    return this._fn(value);
  }
}
