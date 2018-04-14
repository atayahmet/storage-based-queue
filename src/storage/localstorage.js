/* @flow */
import type { IConfig, IStorage } from '../../interfaces/storage';
import type ITask from '../../interfaces/task';

/* global localStorage:true */

export default class LocalStorage implements IStorage {
  storage: Object;
  config: IConfig;

  constructor(config: IConfig) {
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
  get(key: string): Array<ITask | []> {
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
  set(key: string, value: string): void {
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
  has(key: string): boolean {
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
  clear(key: string): void {
    this.storage.removeItem(this.storageName(key));
  }

  /**
   * Remove all items
   *
   * @return {void}
   *
   * @api public
   */
  clearAll(): void {
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
  storageName(suffix: string) {
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
  }
}
