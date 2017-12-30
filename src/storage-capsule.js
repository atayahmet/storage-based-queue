/* @flow */

import groupBy from "group-by";
import LocalStorage from "./storage/localstorage";
import type IConfig from "../interfaces/config";
import type IStorage from "../interfaces/storage";
import type ITask from "../interfaces/task";
import Config from "./config";
import { excludeSpecificTasks, lifo, fifo } from "./utils";

export default class StorageCapsule {
  config: IConfig;
  storage: IStorage;
  storageChannel: string;

  constructor(config: IConfig, storage: IStorage) {
    this.storage = storage;
    this.config = config;
  }

  channel(name: string): StorageCapsule {
    this.storageChannel = name;
    return this;
  }

  fetch(): Array<any> {
    const all = this.all().filter(excludeSpecificTasks);
    const tasks = groupBy(all, "priority");
    return Object.keys(tasks)
      .map(key => parseInt(key))
      .sort((a, b) => b - a)
      .reduce(this.reduceTasks(tasks), []);
  }

  save(task: ITask): string | boolean {
    try {
      // get all tasks current channel's
      const tasks: ITask[] = this.storage.get(this.storageChannel);

      // check channel limit.
      // if limit is exceeded, does not insert new task
      if (this.isExceeded()) {
        console.warn(
          `Task limit exceeded: The '${
            this.storageChannel
          }' channel limit is ${this.config.get("limit")}`
        );
        return false;
      }

      // prepare all properties before save
      // example: createdAt etc.
      task = this.prepareTask(task);

      // add task to storage
      tasks.push(task);

      // save tasks
      this.storage.set(this.storageChannel, JSON.stringify(tasks));

      return task._id;
    } catch (e) {
      return false;
    }
  }

  update(id: string, update: { [property: string]: any }): boolean {
    try {
      const data: any[] = this.all();
      const index: number = data.findIndex(t => t._id == id);

      if (index < 0) return false;

      // merge existing object with given update object
      data[index] = Object.assign({}, data[index], update);

      // save to the storage as string
      this.storage.set(this.storageChannel, JSON.stringify(data));

      return true;
    } catch (e) {
      return false;
    }
  }

  delete(id: string): boolean {
    try {
      const data: any[] = this.all();
      const index: number = data.findIndex(d => d._id === id);

      if (index < 0) return false;

      delete data[index];

      this.storage.set(
        this.storageChannel,
        JSON.stringify(data.filter(d => d))
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  all(): Array<any> {
    return this.storage.get(this.storageChannel);
  }

  generateId(): string {
    return ((1 + Math.random()) * 0x10000).toString(16);
  }

  prepareTask(task: ITask): ITask {
    task.createdAt = Date.now();
    task._id = this.generateId();
    return task;
  }

  reduceTasks(tasks: ITask[]) {
    const reduceFunc = (result: ITask[], key: any) => {
      if (this.config.get("principle") === "lifo") {
        return result.concat(tasks[key].sort(lifo));
      } else {
        return result.concat(tasks[key].sort(fifo));
      }
    };

    return reduceFunc.bind(this);
  }

  isExceeded(): boolean {
    const limit: number = this.config.get("limit");
    const tasks: ITask[] = this.all().filter(excludeSpecificTasks);
    return !(limit === -1 || limit > tasks.length);
  }

  clear(channel: string): void {
    this.storage.clear(channel);
  }
}
