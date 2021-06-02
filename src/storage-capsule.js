/* @flow */
import groupBy from 'group-by';
import type { IConfig } from './interfaces/config';
import type { IStorage } from './interfaces/storage';
import type { ITask } from './interfaces/task';
import { LocalStorageAdapter, InMemoryAdapter } from './adapters';
import { excludeSpecificTasks, lifo, fifo } from './utils';

/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
/* eslint no-underscore-dangle: [2, { "allow": ["_id"] }] */
/* eslint class-methods-use-this: ["error", { "exceptMethods": ["generateId"] }] */

export default class StorageCapsule {
  config: IConfig;

  storage: IStorage;

  storageChannel: string;

  constructor(config: IConfig, storage: IStorage) {
    this.config = config;
    this.storage = this.initialize(storage);
  }

  initialize(Storage: any): IStorage {
    /* eslint no-else-return: off */
    if (typeof Storage === 'object') {
      return Storage;
    } else if (typeof Storage === 'function') {
      return new Storage(this.config);
    } else if (this.config.get('storage') === 'localstorage') {
      return new LocalStorageAdapter(this.config);
    }
    return new InMemoryAdapter(this.config);
  }

  /**
   * Select a channel by channel name
   *
   * @param  {String} name
   * @return {StorageCapsule}
   *
   * @api public
   */
  channel(name: string): StorageCapsule {
    this.storageChannel = name;
    return this;
  }

  /**
   * Fetch tasks from storage with ordered
   *
   * @return {any[]}
   *
   * @api public
   */
  async fetch(): Promise<any[]> {
    const all = (await this.all()).filter(excludeSpecificTasks);
    const tasks = groupBy(all, 'priority');
    return Object.keys(tasks)
      .map((key) => parseInt(key, 10))
      .sort((a, b) => b - a)
      .reduce(this.reduceTasks(tasks), []);
  }

  /**
   * Save task to storage
   *
   * @param  {ITask} task
   * @return {String|Boolean}
   *
   * @api public
   */
  async save(task: ITask): Promise<string | boolean> {
    if (typeof task !== 'object') return false;

    // get all tasks current channel's
    const tasks: ITask[] = await this.storage.get(this.storageChannel);

    // Check the channel limit.
    // If limit is exceeded, does not insert new task
    if (await this.isExceeded()) {
      console.warn(`Task limit exceeded: The '${this.storageChannel}' channel limit is ${this.config.get('limit')}`);
      return false;
    }

    // prepare all properties before save
    // example: createdAt etc.
    const newTask = this.prepareTask(task);

    // add task to storage
    tasks.push(newTask);

    // save tasks
    await this.storage.set(this.storageChannel, tasks);

    return newTask._id;
  }

  /**
   * Update channel store.
   *
   * @return {string}
   *   The value. This annotation can be used for type hinting purposes.
   */
  async update(id: string, update: { [property: string]: any }): Promise<boolean> {
    const data: any[] = await this.all();
    const index: number = data.findIndex((t) => t._id === id);

    // if index not found, return false
    if (index < 0) return false;

    // merge existing object with given update object
    data[index] = { ...data[index], ...update };

    // save to the storage as string
    await this.storage.set(this.storageChannel, data);

    return true;
  }

  /**
   * Remove task from storage
   *
   * @param  {String} id
   * @return {Boolean}
   *
   * @api public
   */
  async delete(id: string): Promise<boolean> {
    const data: any[] = await this.all();
    const index: number = data.findIndex((d) => d._id === id);

    if (index < 0) return false;

    delete data[index];

    await this.storage.set(this.storageChannel, data.filter((d) => d));

    return true;
  }

  /**
   * Get all tasks
   *
   * @return {Any[]}
   *
   * @api public
   */
  async all(): Promise<ITask[]> {
    const items = await this.storage.get(this.storageChannel);
    return items;
  }

  /**
   * Generate unique id
   *
   * @return {String}
   *
   * @api public
   */
  generateId(): string {
    return ((1 + Math.random()) * 0x10000).toString(16);
  }

  /**
   * Add some necessary properties
   *
   * @param  {String} id
   * @return {ITask}
   *
   * @api public
   */
  prepareTask(task: ITask): ITask {
    /* eslint no-param-reassign: off */
    const newTask: any = {};
    Object.keys(task).forEach((key) => {
      newTask[key] = task[key];
    });
    newTask.createdAt = Date.now();
    newTask._id = this.generateId();
    return newTask;
  }

  /**
   * Add some necessary properties
   *
   * @param  {ITask[]} tasks
   * @return {Function}
   *
   * @api public
   */
  reduceTasks(tasks: ITask[]): Function {
    const reduceFunc = (result: ITask[], key: any): ITask[] => {
      if (this.config.get('principle') === 'lifo') {
        return result.concat(tasks[key].sort(lifo));
      }
      return result.concat(tasks[key].sort(fifo));
    };

    return reduceFunc.bind(this);
  }

  /**
   * Task limit checker
   *
   * @return {Boolean}
   *
   * @api public
   */
  async isExceeded(): Promise<boolean> {
    const limit: number = this.config.get('limit');
    const tasks: ITask[] = (await this.all()).filter(excludeSpecificTasks);
    return !(limit === -1 || limit > tasks.length);
  }

  /**
   * Clear tasks with given channel name
   *
   * @param  {String} channel
   * @return {void}
   *
   * @api public
   */
  async clear(channel: string): Promise<void> {
    await this.storage.clear(channel);
  }
}
