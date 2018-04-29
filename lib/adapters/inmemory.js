const _extends =
  Object.assign ||
  function (target) {
    for (let i = 1; i < arguments.length; i++) {
      const source = arguments[i];
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
function _asyncToGenerator(fn) {
  return function () {
    const gen = fn.apply(this, arguments);
    return new Promise(((resolve, reject) => {
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
            (value) => {
              step('next', value);
            },
            (err) => {
              step('throw', err);
            },
          );
        }
      }
      return step('next');
    }));
  };
}

export default class InMemoryAdapter {
  constructor(config) {
    this.store = {};
    this.config = config;
    this.prefix = this.config.get('prefix');
  }

  /**
   * Take item from storage by key
   *
   * @param  {String} key
   * @return {Promise<ITask>} (array)
   *
   * @api public
   */
  get(name) {
    const _this = this;
    return _asyncToGenerator(function* () {
      const collName = _this.storageName(name);
      return [..._this.getCollection(collName)];
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
    const _this2 = this;
    return _asyncToGenerator(function* () {
      _this2.store[_this2.storageName(key)] = [...value];
      return value;
    })();
  }

  /**
   * Item checker in storage
   *
   * @param  {String} key
   * @return {Promise<Boolean>}
   *
   * @api public
   */
  has(key) {
    const _this3 = this;
    return _asyncToGenerator(function* () {
      return Object.prototype.hasOwnProperty.call(_this3.store, _this3.storageName(key));
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
    const _this4 = this;
    return _asyncToGenerator(function* () {
      const collName = _this4.storageName(key);
      const result = _this4.has(key) ? delete _this4.store[collName] : false;
      _this4.store = _extends({}, _this4.store);
      return result;
    })();
  }

  /**
   * Compose storage name by suffix
   *
   * @param  {String} suffix
   * @return {String}
   *
   * @api public
   */
  storageName(suffix) {
    return suffix.startsWith(this.getPrefix()) ? suffix : `${this.getPrefix()}_${suffix}`;
  }

  /**
   * Get prefix of channel storage
   *
   * @return {String}
   *
   * @api public
   */
  getPrefix() {
    return this.config.get('prefix');
  }

  getCollection(name) {
    const has = Object.prototype.hasOwnProperty.call(this.store, name);
    if (!has) this.store[name] = [];
    return this.store[name];
  }
}
