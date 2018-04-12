/* eslint class-methods-use-this: ["error", { "exceptMethods": ["getName", "getType"] }] */
/* eslint-env es6 */

export default class Event {





  constructor() {this.store = {};this.verifierPattern = /^[a-z0-9-_]+:before$|after$|retry$|\*$/;this.wildcards = ['*', 'error'];this.emptyFunc = () => {};
    this.store.before = {};
    this.store.after = {};
    this.store.retry = {};
    this.store.wildcard = {};
    this.store.error = this.emptyFunc;
    this.store['*'] = this.emptyFunc;
  }

  /**
     * Create event
     *
     * @param  {String} key
     * @param  {Function} cb
     * @return {void}
     *
     * @api public
     */
  on(key, cb) {
    if (typeof cb !== 'function') throw new Error('Event should be an function');
    if (this.isValid(key)) this.add(key, cb);
  }

  /**
     * Run event via it's key
     *
     * @param  {String} key
     * @param  {Any} args
     * @return {void}
     *
     * @api public
     */
  emit() {for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {args[_key] = arguments[_key];}
    const [key] = args;
    if (this.wildcards.indexOf(key) > -1) {
      this.wildcard(key, ...args);
    } else {
      const type = this.getType(key);
      const name = this.getName(key);

      if (this.store[type]) {
        const cb = this.store[type][name] || this.emptyFunc;
        cb.call(null, args);
      }
    }

    this.wildcard('*', key, args);
  }

  /**
     * Run wildcard events
     *
     * @param  {String} key
     * @param  {String} actionKey
     * @param  {Any} args
     * @return {void}
     *
     * @api public
     */
  wildcard(key, actionKey, args) {
    if (this.store.wildcard[key]) {
      this.store.wildcard[key].call(null, actionKey, args);
    }
  }

  /**
     * Add event to store
     *
     * @param  {String} key
     * @param  {Function} cb
     * @return {void}
     *
     * @api public
     */
  add(key, cb) {
    if (this.wildcards.indexOf(key) > -1) {
      this.store.wildcard[key] = cb;
    } else {
      const type = this.getType(key);
      const name = this.getName(key);
      this.store[type][name] = cb;
    }
  }

  /**
     * Check event in store
     *
     * @param  {String} key
     * @return {Boolean}
     *
     * @api public
     */
  has(key) {
    try {
      const keys = key.split(':');
      return keys.length > 1 ? !!this.store[keys[1]][keys[0]] : !!this.store.wildcard[keys[0]];
    } catch (e) {
      return false;
    }
  }

  /**
     * Get event name by parse key
     *
     * @param  {String} key
     * @return {String}
     *
     * @api public
     */
  getName(key) {
    return key.match(/(.*):.*/)[1];
  }

  /**
     * Get event type by parse key
     *
     * @param  {String} key
     * @return {String}
     *
     * @api public
     */
  getType(key) {
    return key.match(/^[a-z0-9-_]+:(.*)/)[1];
  }

  /**
     * Checker of event keys
     *
     * @param  {String} key
     * @return {Boolean}
     *
     * @api public
     */
  isValid(key) {
    return this.verifierPattern.test(key) || this.wildcards.indexOf(key) > -1;
  }}

