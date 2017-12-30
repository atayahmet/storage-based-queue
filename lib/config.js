

import configData from './config.data';

export default class Config {


  constructor() {let config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};this.config = configData;
    this.merge(config);
  }

  set(name, value) {
    this.config[name] = value;
  }

  get(name) {
    return this.config[name];
  }

  has(name) {
    return Object.prototype.hasOwnProperty.call(this.config, name);
  }

  merge(config) {
    this.config = Object.assign({}, this.config, config);
  }

  remove(name) {
    return delete this.config[name];
  }

  all() {
    return this.config;
  }}

