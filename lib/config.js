/* @flow */
import type IConfig from '../interfaces/config';
import configData from './config.data';

export default class Config {
  config: IConfig = configData;

  constructor(config: IConfig = {}) {
    this.merge(config);
  }

  set(name: string, value: any): void {
    this.config[name] = value;
  }

  get(name: string): any {
    return this.config[name];
  }

  has(name: string) {
    return Object.prototype.hasOwnProperty.call(this.config, name);
  }

  merge(config: {[string]: any}) {
    this.config = Object.assign({}, this.config, config);
  }

  remove(name: string): boolean {
    return delete this.config[name];
  }

  all(): IConfig {
    return this.config;
  }
}
