export default class Container {
  constructor() {
    this.store = {};
  }

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
  merge() {
    let data =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    this.store = Object.assign({}, this.store, data);
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
