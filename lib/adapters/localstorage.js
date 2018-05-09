function _asyncToGenerator(fn) {
  return function() {
    var gen = fn.apply(this, arguments);
    return new Promise(function(resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }
        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(
            function(value) {
              step('next', value);
            },
            function(err) {
              step('throw', err);
            }
          );
        }
      }
      return step('next');
    });
  };
}

/* global localStorage */

export default class LocalStorageAdapter {
  constructor(config) {
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
  get(name) {
    var _this = this;
    return _asyncToGenerator(function*() {
      const result = localStorage.getItem(_this.storageName(name));
      return JSON.parse(result) || [];
    })();
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
  set(key, value) {
    var _this2 = this;
    return _asyncToGenerator(function*() {
      localStorage.setItem(_this2.storageName(key), JSON.stringify(value));
      return value;
    })();
  }

  /**
   * Item checker in local storage
   *
   * @param  {String} key
   * @return {Promise<Boolean>}
   *
   * @api public
   */
  has(key) {
    var _this3 = this;
    return _asyncToGenerator(function*() {
      return Object.prototype.hasOwnProperty.call(
        localStorage,
        _this3.storageName(key)
      );
    })();
  }

  /**
   * Remove item
   *
   * @param  {String} key
   * @return {Promise<Any>}
   *
   * @api public
   */
  clear(key) {
    var _this4 = this;
    return _asyncToGenerator(function*() {
      const result = (yield _this4.has(key))
        ? delete localStorage[_this4.storageName(key)]
        : false;
      return result;
    })();
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
