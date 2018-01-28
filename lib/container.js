


export default class Container {

  constructor() {this.

    _container = {};}

  /**
                       * Check item in container
                       *
                       * @param  {String} id
                       * @return {Boolean}
                       *
                       * @api public
                       */
  has(id) {
    return Object.prototype.hasOwnProperty.call(this._container, id);
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
    return this._container[id];
  }

  /**
     * Get all items from container
     *
     * @return {Object}
     *
     * @api public
     */
  all() {
    return this._container;
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
    this._container[id] = value;
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
    return delete this._container[id];
  }

  /**
     * Remove all items from container
     *
     * @return {void}
     *
     * @api public
     */
  removeAll() {
    this._container = {};
  }}

