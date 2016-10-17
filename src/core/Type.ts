
const PARSE_RX = /^(?:([a-z0-9_-]+)(\[\])?\:)?(\*|[a-z0-9_-]+)(\[\])?$/i;


export default class Type {

  private _type: string;
  private _array: boolean;

  constructor(def: string) {
    let parsed = def.match(PARSE_RX);
    // parsed = [def, T_type, T_array, type, array]

    if (parsed === null || parsed[3] == null) {
      throw new Error(`Invalid type definition: ${def}`);
    }

    this._type = parsed[3];
    this._array = parsed[4] != null;
  }

  get isWildcard(): boolean {
    return this._type === '*' && this._array === false;
  }

  get isWildcardArray(): boolean {
    return this._type === '*' && this._array === true;
  }

  get isArray(): boolean {
    return this._array;
  }

  eq(other: Type): boolean {
    return this._type === other._type && this._array === other._array;
  }

  lte(other: Type): boolean {
    return (
      // * <: *
      other.isWildcard ||
      // *[] <: *[]
      other.isWildcardArray && this.isArray ||
      // T[] <: T[] and T <: T
      other._type === this._type &&
        (other.isArray && this.isArray || !other.isArray && !this.isArray));
  }

  toString() {
    return this._type + ((this._array) ? '[]' : '');
  }
}
