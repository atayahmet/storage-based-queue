var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}




export default class InMemoryAdapter {




  constructor(config) {this.store = {};
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
  get(name) {var _this = this;return _asyncToGenerator(function* () {
      const collName = _this.storageName(name);
      return [..._this.getCollection(collName)];})();
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
  set(key, value) {var _this2 = this;return _asyncToGenerator(function* () {
      _this2.store[_this2.storageName(key)] = [...value];
      return value;})();
  }

  /**
     * Item checker in store
     *
     * @param  {String} key
     * @return {Promise<Boolean>}
     *
     * @api public
     */
  has(key) {var _this3 = this;return _asyncToGenerator(function* () {
      return Object.prototype.hasOwnProperty.call(_this3.store, _this3.storageName(key));})();
  }

  /**
     * Remove item
     *
     * @param  {String} key
     * @return {Promise<Any>}
     *
     * @api public
     */
  clear(key) {var _this4 = this;return _asyncToGenerator(function* () {
      const collName = _this4.storageName(key);
      const result = (yield _this4.has(key)) ? delete _this4.store[collName] : false;
      _this4.store = _extends({}, _this4.store);
      return result;})();
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
    return suffix.startsWith(this.getPrefix()) ? suffix : `${this.getPrefix()}_${suffix}`;
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
  }}

