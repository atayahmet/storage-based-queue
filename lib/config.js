import configData from './enum/config.data';

export default class Config {
  constructor() {
    const config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    this.config = configData;
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
    this.config = Object.assign({}, this.config, config);
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
