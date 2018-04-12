// @flow
import type IStorage from '../../interfaces/storage';
import type IConfig from '../../interfaces/storage';
import type ITask from '../../interfaces/task';
import localForage from "localforage";

export default class LocalForageAdapter implements IStorage {
  config: IConfig;
  drivers: string[] = ['localstorage', 'indexeddb', 'websql'];
  prefix: string;

  constructor(config: IConfig) {
    this.config = config;
    this.prefix = this.config.get('prefix');
    localForage.config({driver: this.getDriver(), name: this.prefix})
  }

  /**
   * Take item from storage by key
   *
   * @param  {String} key
   * @return {Promise<ITask>} (array)
   *
   * @api public
   */
  async get(key: string): Promise<ITask[]> {
    const items = await localForage.getItem(this.storageName(key));
    return (typeof(items) === 'string' ? JSON.parse(items) : items) || [];
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
  async set(key: string, value: string): Promise<any> {
    return await localForage.setItem(this.storageName(key), value);
  }

  /**
   * Item checker in storage
   *
   * @param  {String} key
   * @return {Promise<Boolean>}
   *
   * @api public
   */
  async has(key: string): Promise<boolean> {
    const keys: string[] = await localForage.keys();
    return keys.indexOf(this.storageName(key)) > -1;
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
    return await localForage.removeItem(this.storageName(key));
  }

  /**
   * Remove all items
   *
   * @return {Promise<Any>}
   *
   * @api public
   */
  async clearAll(): Promise<any> {
    const keys: string[] = (await localForage.keys());
    return await Promise.all(keys.map(async key => await this.clear(key)));
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

  getDriver() {
    const defaultDriver: string = this.config.get('defaultStorage');
    const driver: string = (this.config.get('storage').toLowerCase() || defaultDriver);
    return this.drivers.indexOf(driver) > -1 ? localForage[driver.toUpperCase()]
      : localForage[defaultDriver.toUpperCase()];
  }
}
