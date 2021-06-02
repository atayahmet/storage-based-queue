/* @flow */
import type { IConfig } from './interfaces/config';
import configData from './enum/config.data';

export default class Config {
  config: any = {}

  timeout: number;

  storage: string;

  principle: string;

  prefix: string;

  limit: number;

  constructor(config: any = {}) {
    this.merge(configData);
    this.merge(config);
  }

  /**
   * Set config to global config reference
   *
   * @param  {String} name
   * @param  {Any} value
   * @return {void}
   *
   * @api public
   */
  set(name: string, value: any): void {
    this.config[name] = value;
  }

  /**
   * Get a config
   *
   * @param  {String} name
   * @return {any}
   *
   * @api public
   */
  get(name: string): any {
    return this.config[name];
  }

  /**
   * Check config property
   *
   * @param  {String} name
   * @return {any}
   *
   * @api public
   */
  has(name: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.config, name);
  }

  /**
   * Merge two config object
   *
   * @param  {String} name
   * @return {void}
   *
   * @api public
   */
  merge(config: { [string]: any }): void {
    Object.keys(config).forEach((key) => {
      this.config[key] = config[key];
    });
  }

  /**
   * Remove a config
   *
   * @param  {String} name
   * @return {Boolean}
   *
   * @api public
   */
  remove(name: string): boolean {
    return delete this.config[name];
  }

  /**
   * Get all config
   *
   * @param  {String} name
   * @return {IConfig[]}
   *
   * @api public
   */
  all(): IConfig {
    return this.config;
  }
}
