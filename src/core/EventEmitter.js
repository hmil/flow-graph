

export default class EventEmitter {

  constructor() {
    this._listeners = {};
  }

  on(evtName, listener) {
    let bucket = this._listeners[evtName];
    if (bucket === undefined) {
      bucket = this._listeners[evtName] = [];
    }

    bucket.push(listener);
  }

  off(evtName, listener) {
    let bucket = this._listeners[evtName];
    if (bucket !== undefined) {
      let idx = bucket.indexOf(listener);
      if (idx >= 0) {
        bucket.splice(idx, 1);
      } else {
        console.warn(`EventEmitter.off: bucket ${evtName} does not contain listener ${listener}`);
      }
      if (bucket.size === 0) {
        delete this._listeners[evtName];
      }
    } else {
      console.warn(`EventEmitter.off: bucket ${evtName} does not exist`);
    }
  }

  trigger(evtName, data) {
    let bucket = this._listeners[evtName];
    if (bucket != null) {
      for (let listener of bucket) {
        listener(data);
      }
    }
  }
}
