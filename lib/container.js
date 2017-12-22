


export default class Container {

  constructor() {this.

    _container = {};}

  has(id) {
    return Object.prototype.hasOwnProperty.call(this._container, id);
  }

  get(id) {
    return this._container[id];
  }

  all() {
    return this._container;
  }

  bind(id, value) {
    this._container[id] = value;
  }

  remove(id) {
    if (Object.prototype.hasOwnProperty.call(this._container, id)) {
      delete this._container[id];
    }
  }

  removeAll() {
    this._container = {};
  }
}

