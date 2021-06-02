// @flow
import type { IStorage } from '../interfaces/storage';
import type { IConfig } from '../interfaces/config';
import type { ITask } from '../interfaces/task';

/* global localStorage */

export default class LocalStorageAdapter implements IStorage {
  config: IConfig;

  prefix: string;

  constructor(config: IConfig) {
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
  async get(name: string): Promise<ITask[]> {
    const result: any = localStorage.getItem(this.storageName(name));
    return JSON.parse(result) || [];
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
  async set(key: string, value: any[]): Promise<any> {
    localStorage.setItem(this.storageName(key), JSON.stringify(value));
    return value;
  }

  /**
   * Item checker in local storage
   *
   * @param  {String} key
   * @return {Promise<Boolean>}
   *
   * @api public
   */
  async has(key: string): Promise<boolean> {
    return Object.prototype.hasOwnProperty.call(localStorage, this.storageName(key));
  }

  /**
   * Remove item
   *
   * @param  {String} key
   * @return {Promise<Any>}
   *
   * @api public
   */
  async clear(key: string): Promise<any> {
    const result = (await this.has(key)) ? delete localStorage[this.storageName(key)] : false;
    return result;
  }

  /**
   * Compose collection name by suffix
   *
   * @param  {String} suffix
   * @return {String}
   *
   * @api public
   */
  storageName(suffix: string): string {
    return suffix.startsWith(this.getPrefix()) ? suffix : `${this.getPrefix()}_${suffix}`;
  }

  /**
   * Get prefix of channel collection
   *
   * @return {String}
   *
   * @api public
   */
  getPrefix(): string {
    return this.config.get('prefix');
  }
}
