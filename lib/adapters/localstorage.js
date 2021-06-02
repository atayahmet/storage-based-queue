import _JSON$stringify from '@babel/runtime-corejs2/core-js/json/stringify';
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

/* global localStorage */

export default class LocalStorageAdapter {
  constructor(config) {
    _defineProperty(this, 'config', void 0);
    _defineProperty(this, 'prefix', void 0);
    this.config = config;
    this.prefix = this.config.get('prefix');
  }

  /**
   * Take item from local storage by key
   *
   * @param  {String} key
   * @return {Promise<ITask>} (array)
   *
   * @api public
   */
  async get(name) {
    const result = localStorage.getItem(this.storageName(name));
    return JSON.parse(result) || [];
  }

  /**
   * Add item to local storage
   *
   * @param  {String} key
   * @param  {String} value
   * @return {Promise<Any>}
   *
   * @api public
   */
  async set(key, value) {
    localStorage.setItem(this.storageName(key), _JSON$stringify(value));
    return value;
  }

  /**
   * Item checker in local storage
   *
   * @param  {String} key
   * @return {Promise<Boolean>}
   *
   * @api public
   */
  async has(key) {
    return Object.prototype.hasOwnProperty.call(
      localStorage,
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
      ? delete localStorage[this.storageName(key)]
      : false;
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
}
