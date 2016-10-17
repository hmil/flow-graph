
interface Listener {
  (data: any): void;
}

export interface ListenerMap {
  [key: string]: Array<Listener>;
}

export default class EventEmitter {

  private _listeners: ListenerMap;

  constructor() {
    this._listeners = {};
  }

  on(evtName: string, listener: Listener): void {
    let bucket = this._listeners[evtName] || (this._listeners[evtName] = new Array<Listener>());
    bucket.push(listener);
  }

  off(evtName: string, listener: Listener): void {
    let bucket = this._listeners[evtName];
    if (bucket !== undefined) {
      let idx = bucket.indexOf(listener);
      if (idx >= 0) {
        bucket.splice(idx, 1);
      } else {
        console.warn(`EventEmitter.off: bucket ${evtName} does not contain listener ${listener}`);
      }
      if (bucket.length === 0) {
        delete this._listeners[evtName];
      }
    } else {
      console.warn(`EventEmitter.off: bucket ${evtName} does not exist`);
    }
  }

  trigger(evtName: string, data?: any): void {
    let bucket = this._listeners[evtName];
    if (bucket != null) {
      for (let listener of bucket) {
        listener(data);
      }
    }
  }
}
