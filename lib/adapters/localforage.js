function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}
import localForage from 'localforage';




export default class LocalForageAdapter {




  constructor(config) {this.drivers = ['localstorage', 'indexeddb', 'websql'];
    this.config = config;
    this.prefix = this.config.get('prefix');
    localForage.config({ driver: this.getDriver(), name: this.prefix });
  }

  /**
     * Take item from storage by key
     *
     * @param  {String} key
     * @return {Promise<ITask>} (array)
     *
     * @api public
     */
  get(key) {var _this = this;return _asyncToGenerator(function* () {
      const items = yield localForage.getItem(_this.storageName(key));
      return (typeof items === 'string' ? JSON.parse(items) : items) || [];})();
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
  set(key, value) {var _this2 = this;return _asyncToGenerator(function* () {
      const result = yield localForage.setItem(_this2.storageName(key), value);
      return result;})();
  }

  /**
     * Item checker in storage
     *
     * @param  {String} key
     * @return {Promise<Boolean>}
     *
     * @api public
     */
  has(key) {var _this3 = this;return _asyncToGenerator(function* () {
      const keys = yield localForage.keys();
      return keys.indexOf(_this3.storageName(key)) > -1;})();
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
      const result = yield localForage.removeItem(_this4.storageName(key));
      return result;})();
  }

  /**
     * Remove all items
     *
     * @return {Promise<Any>}
     *
     * @api public
     */
  clearAll() {var _this5 = this;return _asyncToGenerator(function* () {
      const keys = yield localForage.keys();
      const result = yield Promise.all(keys.map((() => {var _ref = _asyncToGenerator(function* (key) {
          const cleared = yield _this5.clear(key);
          return cleared;
        });return function (_x) {return _ref.apply(this, arguments);};})()));
      return result;})();
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

  getDriver() {
    const defaultDriver = this.config.get('defaultStorage');
    const driver = (this.config.get('storage') || defaultDriver).toLowerCase();
    return this.drivers.indexOf(driver) > -1 ?
    localForage[driver.toUpperCase()] :
    localForage[defaultDriver.toUpperCase()];
  }}

