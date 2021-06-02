import _Object$defineProperty from '@babel/runtime-corejs2/core-js/object/define-property';
function _defineProperty(obj, key, value) {
  if (key in obj) {
    _Object$defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

export default class Container {
  constructor() {
    _defineProperty(this, 'store', {});
  }

  // freeze(id: string): void {
  //   console.log(this, id);
  // }

  // add(value: any): void {
  //   console.log(this, value);
  // }

  /**
   * Check item in container
   *
   * @param  {String} id
   * @return {Boolean}
   *
   * @api public
   */
  has(id) {
    return Object.prototype.hasOwnProperty.call(this.store, id);
  }

  /**
   * Get item from container
   *
   * @param  {String} id
   * @return {Any}
   *
   * @api public
   */
  get(id) {
    return this.store[id];
  }

  /**
   * Get all items from container
   *
   * @return {Object}
   *
   * @api public
   */
  all() {
    return this.store;
  }

  /**
   * Add item to container
   *
   * @param  {String} id
   * @param  {Any} value
   * @return {void}
   *
   * @api public
   */
  bind(id, value) {
    this.store[id] = value;
  }

  /**
   * Merge continers
   *
   * @param  {Object} data
   * @return {void}
   *
   * @api public
   */
  merge(data = {}) {
    this.store = { ...this.store, ...data };
  }

  /**
   * Remove item from container
   *
   * @param  {String} id
   * @return {Boolean}
   *
   * @api public
   */
  remove(id) {
    if (!this.has(id)) return false;
    return delete this.store[id];
  }

  /**
   * Remove all items from container
   *
   * @return {void}
   *
   * @api public
   */
  removeAll() {
    this.store = {};
  }
}
