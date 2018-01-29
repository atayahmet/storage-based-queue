





export default class LocalStorage {



  constructor(config) {
    this.storage = localStorage;
    this.config = config;
  }

  /**
     * Take item from storage by key
     *
     * @param  {String} key
     * @return {ITask[]}
     *
     * @api public
     */
  get(key) {
    try {
      const name = this.storageName(key);
      return this.has(name) ? JSON.parse(this.storage.getItem(name)) : [];
    } catch (e) {
      return [];
    }
  }

  /**
     * Add item to local storage
     *
     * @param  {String} key
     * @param  {String} value
     * @return {void}
     *
     * @api public
     */
  set(key, value) {
    this.storage.setItem(this.storageName(key), value);
  }

  /**
     * Item checker in local storage
     *
     * @param  {String} key
     * @return {Boolean}
     *
     * @api public
     */
  has(key) {
    return key in this.storage;
  }

  /**
     * Remove item
     *
     * @param  {String} key
     * @return {void}
     *
     * @api public
     */
  clear(key) {
    this.storage.removeItem(this.storageName(key));
  }

  /**
     * Remove all items
     *
     * @return {void}
     *
     * @api public
     */
  clearAll() {
    this.storage.clear();
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
    return `${this.getPrefix()}_${suffix}`;
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
  }}

