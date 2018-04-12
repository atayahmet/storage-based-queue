/* @flow */
import groupBy from 'group-by';
import LocalStorage from './storage/localstorage';
import type IConfig from '../interfaces/config';
import type IStorage from '../interfaces/storage';
import type ITask from '../interfaces/task';
import Config from './config';
import { excludeSpecificTasks, lifo, fifo } from './utils';
import LocalForageAdapter from './storage/localforage';

export default class StorageCapsule {
  config: IConfig;
  storage: IStorage;
  storageChannel: string;

  constructor(config: IConfig, storage: IStorage | null) {
    this.config = config;
    this.storage = this.initStorage(storage);
  }

  initStorage(storage: any) {
    if (typeof storage === 'object') {
      return storage;
    } else if (typeof storage === 'function') {
      return new storage(this.config);
    }

    return new LocalForageAdapter(this.config);
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
      .map(key => parseInt(key))
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
    task = this.prepareTask(task);

    // add task to storage
    tasks.push(task);

    // save tasks
    await this.storage.set(this.storageChannel, tasks);

    return task._id;
  }

  /**
   * Update channel store.
   *
   * @return {string}
   *   The value. This annotation can be used for type hinting purposes.
   */
  async update(id: string, update: { [property: string]: any }): Promise<boolean> {
    const data: any[] = await this.all();
    console.log('ddd->', data);
    const index: number = data.findIndex(t => t._id == id);

    if (index < 0) return false;

    // merge existing object with given update object
    data[index] = Object.assign({}, data[index], update);

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
    const index: number = data.findIndex(d => d._id === id);

    if (index < 0) return false;

    delete data[index];

    await this.storage.set(this.storageChannel, data.filter(d => d));
    return true;
  }

  /**
   * Get all tasks
   *
   * @return {Any[]}
   *
   * @api public
   */
  all(): Promise<ITask[]> {
    return this.storage.get(this.storageChannel);
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
    task.createdAt = Date.now();
    task._id = this.generateId();
    return task;
  }

  /**
   * Add some necessary properties
   *
   * @param  {ITask[]} tasks
   * @return {Function}
   *
   * @api public
   */
  reduceTasks(tasks: ITask[]) {
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
    console.log('fff->', limit, tasks, !(limit === -1 || limit > tasks.length));
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
  clear(channel: string): void {
    this.storage.clear(channel);
  }
}
