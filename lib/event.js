export default class Event {





  constructor() {this.store = {};this.verifierPattern = /^[a-z0-9\-\_]+\:before$|after$|retry$|\*$/;this.wildcards = ['*', 'error'];this.emptyFunc = () => {};
    this.store.before = {};
    this.store.after = {};
    this.store.retry = {};
    this.store.wildcard = {};
    this.store.error = this.emptyFunc;
    this.store['*'] = this.emptyFunc;
  }

  on(key, cb) {
    if (typeof cb !== 'function') throw new Error('Event should be an function');
    if (this.isValid(key)) this.add(key, cb);
  }

  emit(key, args) {
    if (this.wildcards.indexOf(key) > -1) {
      this.wildcard(key, ...arguments);
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

  wildcard(key, actionKey, args) {
    if (this.store.wildcard[key]) {
      this.store.wildcard[key].call(null, actionKey, args);
    }
  }

  add(key, cb) {
    if (this.wildcards.indexOf(key) > -1) {
      this.store.wildcard[key] = cb;
    } else {
      const type = this.getType(key);
      const name = this.getName(key);
      this.store[type][name] = cb;
    }
  }

  has(key) {
    try {
      const keys = key.split(':');
      return keys.length > 1 ? !!this.store[keys[1]][keys[0]] : !!this.store.wildcard[keys[0]];
    } catch (e) {
      return false;
    }
  }

  getName(key) {
    return key.match(/(.*)\:.*/)[1];
  }

  getType(key) {
    return key.match(/^[a-z0-9\-\_]+\:(.*)/)[1];
  }

  isValid(key) {
    return this.verifierPattern.test(key) || this.wildcards.indexOf(key) > -1;
  }}

