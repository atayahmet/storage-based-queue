// @flow
import type IStorage from '../../interfaces/storage';
import type ITask from '../../interfaces/task';
import type IConfig from '../../interfaces/config';
import { AsyncStorage } from 'react-native';

export default class AsyncStorageAdapter {
  config: IConfig;

  constructor(config: IConfig) {
    this.config = config;
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
    const items = await AsyncStorage.getItem(this.storageName(key));
    return (typeof items === 'string' ? JSON.parse(items) : items) || [];
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
    return await AsyncStorage.setItem(this.storageName(key), JSON.stringify(value));
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
    const keys: string[] = await AsyncStorage.getAllKeys();
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
    return await AsyncStorage.removeItem(this.storageName(key));
  }

  /**
   * Remove all items
   *
   * @return {Promise<Any>}
   *
   * @api public
   */
  async clearAll(): Promise<any> {
    const keys: string[] = await AsyncStorage.getAllKeys();
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
}
