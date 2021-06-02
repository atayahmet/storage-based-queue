// @flow
import type { IStorage } from '../interfaces/storage';
import type { IConfig } from '../interfaces/config';
import type { ITask } from '../interfaces/task';

export default class InMemoryAdapter implements IStorage {
  config: IConfig;

  prefix: string;

  store: { [prop: string]: any } = {};

  constructor(config: IConfig) {
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
  async get(name: string): Promise<ITask[]> {
    const collName = this.storageName(name);
    return [...this.getCollection(collName)];
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
  async set(key: string, value: any[]): Promise<any> {
    this.store[this.storageName(key)] = [...value];
    return value;
  }

  /**
   * Item checker in store
   *
   * @param  {String} key
   * @return {Promise<Boolean>}
   *
   * @api public
   */
  async has(key: string): Promise<boolean> {
    return Object.prototype.hasOwnProperty.call(this.store, this.storageName(key));
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
    const result = (await this.has(key)) ? delete this.store[this.storageName(key)] : false;
    this.store = { ...this.store };
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

  /**
   * Get collection
   *
   * @param  {String} name
   * @return {String}
   *
   * @api private
   */
  getCollection(name: string): any {
    const has = Object.prototype.hasOwnProperty.call(this.store, name);
    if (!has) this.store[name] = [];
    return this.store[name];
  }
}
