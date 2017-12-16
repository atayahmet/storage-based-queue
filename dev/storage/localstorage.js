/* @flow */

import type IStorage from '../../interfaces/storage';
import type IConfig from '../../interfaces/storage';
import type IJob from '../../interfaces/job';

export default class LocalStorage implements IStorage {
  storage: Object;
  config: IConfig;
  prefix: string;

  constructor(config: IConfig) {
    this.storage = localStorage;
    this.config = config;
    this.prefix = config.get('storage').prefix;
  }

  get(key: string): Array<IJob|[]> {
    try {
      const name = this.storageName(key);
      return this.has(name) ? JSON.parse(this.storage.getItem(name)) : [];
    } catch(e) {
      return [];
    }
  }

  set(key: string, value: string): void {
    this.storage.setItem(this.storageName(key), value);
  }

  has(key: string): boolean {
    return key in this.storage;
  }

  clear(key: string): void {
    this.storage.removeItem(this.storageName(key));
  }

  clearAll(): void {
    this.storage.clear();
  }

  storageName(suffix: string) {
    return `${this.prefix}_${suffix}`;
  }
}
