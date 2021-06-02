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

export default class InMemoryAdapter {
  constructor(config) {
    _defineProperty(this, 'config', void 0);
    _defineProperty(this, 'prefix', void 0);
    _defineProperty(this, 'store', {});
    this.config = config;
    this.prefix = this.config.get('prefix');
  }

  /**
   * Take item from store by key
   *
   * @param  {String} key
   * @return {Promise<ITask>} (array)
   *
   * @api public
   */
  async get(name) {
    const collName = this.storageName(name);
    return [...this.getCollection(collName)];
  }

  /**
   * Add item to store
   *
   * @param  {String} key
   * @param  {String} value
   * @return {Promise<Any>}
   *
   * @api public
   */
  async set(key, value) {
    this.store[this.storageName(key)] = [...value];
    return value;
  }

  /**
   * Item checker in store
   *
   * @param  {String} key
   * @return {Promise<Boolean>}
   *
   * @api public
   */
  async has(key) {
    return Object.prototype.hasOwnProperty.call(
      this.store,
      this.storageName(key)
    );
  }

  /**
   * Remove item
   *
   * @param  {String} key
   * @return {Promise<Any>}
   *
   * @api public
   */
  async clear(key) {
    const result = (await this.has(key))
      ? delete this.store[this.storageName(key)]
      : false;
    this.store = { ...this.store };
    return result;
  }

  /**
   * Compose collection name by suffix
   *
   * @param  {String} suffix
   * @return {String}
   *
   * @api public
   */
  storageName(suffix) {
    return suffix.startsWith(this.getPrefix())
      ? suffix
      : `${this.getPrefix()}_${suffix}`;
  }

  /**
   * Get prefix of channel collection
   *
   * @return {String}
   *
   * @api public
   */
  getPrefix() {
    return this.config.get('prefix');
  }

  /**
   * Get collection
   *
   * @param  {String} name
   * @return {String}
   *
   * @api private
   */
  getCollection(name) {
    const has = Object.prototype.hasOwnProperty.call(this.store, name);
    if (!has) this.store[name] = [];
    return this.store[name];
  }
}
