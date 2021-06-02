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
} /* eslint class-methods-use-this: ["error", { "exceptMethods": ["getName", "getType"] }] */
/* eslint-env es6 */

export default class Event {
  constructor() {
    _defineProperty(this, 'store', {});
    _defineProperty(
      this,
      'verifierPattern',
      /^[a-z0-9-_]+:before$|after$|retry$|\*$/
    );
    _defineProperty(this, 'wildcards', ['*', 'error', 'completed']);
    _defineProperty(this, 'emptyFunc', () => {});
    this.store.before = {};
    this.store.after = {};
    this.store.retry = {};
    this.store.wildcard = {};
    this.store.error = this.emptyFunc;
    this.store.completed = this.emptyFunc;
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
    if (typeof cb !== 'function')
      throw new Error('Event should be an function');
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
  emit(key, args) {
    if (this.wildcards.indexOf(key) > -1) {
      this.wildcard(key, ...[key, args]);
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
      return keys.length > 1
        ? !!this.store[keys[1]][keys[0]]
        : !!this.store.wildcard[keys[0]];
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
    const parsed = key.match(/(.*):.*/);
    return parsed ? parsed[1] : '';
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
    const parsed = key.match(/^[a-z0-9-_]+:(.*)/);
    return parsed ? parsed[1] : '';
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
  }
}
