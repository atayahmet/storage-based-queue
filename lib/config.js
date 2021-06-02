import _Object$keys from '@babel/runtime-corejs2/core-js/object/keys';
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

import configData from './enum/config.data';

export default class Config {
  constructor(config = {}) {
    _defineProperty(this, 'config', {});
    _defineProperty(this, 'timeout', void 0);
    _defineProperty(this, 'storage', void 0);
    _defineProperty(this, 'principle', void 0);
    _defineProperty(this, 'prefix', void 0);
    _defineProperty(this, 'limit', void 0);
    this.merge(configData);
    this.merge(config);
  }

  /**
   * Set config to global config reference
   *
   * @param  {String} name
   * @param  {Any} value
   * @return {void}
   *
   * @api public
   */
  set(name, value) {
    this.config[name] = value;
  }

  /**
   * Get a config
   *
   * @param  {String} name
   * @return {any}
   *
   * @api public
   */
  get(name) {
    return this.config[name];
  }

  /**
   * Check config property
   *
   * @param  {String} name
   * @return {any}
   *
   * @api public
   */
  has(name) {
    return Object.prototype.hasOwnProperty.call(this.config, name);
  }

  /**
   * Merge two config object
   *
   * @param  {String} name
   * @return {void}
   *
   * @api public
   */
  merge(config) {
    _Object$keys(config).forEach((key) => {
      this.config[key] = config[key];
    });
  }

  /**
   * Remove a config
   *
   * @param  {String} name
   * @return {Boolean}
   *
   * @api public
   */
  remove(name) {
    return delete this.config[name];
  }

  /**
   * Get all config
   *
   * @param  {String} name
   * @return {IConfig[]}
   *
   * @api public
   */
  all() {
    return this.config;
  }
}
