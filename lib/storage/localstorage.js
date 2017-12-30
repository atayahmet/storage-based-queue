





export default class LocalStorage {



  constructor(config) {
    this.storage = localStorage;
    this.config = config;
  }

  get(key) {
    try {
      const name = this.storageName(key);
      return this.has(name) ? JSON.parse(this.storage.getItem(name)) : [];
    } catch (e) {
      return [];
    }
  }

  set(key, value) {
    this.storage.setItem(this.storageName(key), value);
  }

  has(key) {
    return key in this.storage;
  }

  clear(key) {
    this.storage.removeItem(this.storageName(key));
  }

  clearAll() {
    this.storage.clear();
  }

  storageName(suffix) {
    return `${this.getPrefix()}_${suffix}`;
  }

  getPrefix() {
    return this.config.get('prefix');
  }}

