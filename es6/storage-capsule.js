

import groupBy from 'group-by';
import orderBy from 'orderby-time';
import LocalStorage from './storage/localstorage';



import Config from './config';
import { excludeSpecificTasks } from './utils';

export default class StorageCapsule {



  constructor(config, storage) {
    this.storage = storage;
  }

  channel(name) {
    this.storageChannel = name;
    return this;
  }

  fetch() {
    const all = this.all().filter(excludeSpecificTasks);
    const tasks = groupBy(all, 'priority');
    return Object.
    keys(tasks).
    map(key => parseInt(key)).
    sort((a, b) => b - a).
    reduce((result, key) => result.concat(orderBy('createdAt', tasks[key])), []);
  }

  save(task) {
    try {
      // prepare all properties before save
      // example: createdAt etc.
      task = this.prepareTask(task);

      // get all tasks current channel's
      const tasks = this.storage.get(this.storageChannel);

      // add task to storage
      tasks.push(task);

      // save tasks
      this.storage.set(this.storageChannel, JSON.stringify(tasks));

      return task._id;
    } catch (e) {
      return false;
    }
  }

  update(id, update) {
    try {
      const data = this.all();
      const index = data.findIndex(t => t._id == id);

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

  delete(id) {
    try {
      const data = this.all();
      const index = data.findIndex(d => d._id === id);

      if (index < 0) return false;

      delete data[index];

      this.storage.set(this.storageChannel, JSON.stringify(data.filter(d => d)));
      return true;
    } catch (e) {
      return false;
    }
  }

  all() {
    return this.storage.get(this.storageChannel);
  }

  generateId() {
    return ((1 + Math.random()) * 0x10000).toString(16);
  }

  prepareTask(task) {
    task.createdAt = Date.now();
    task._id = this.generateId();
    return task;
  }

  clear(channel) {
    this.storage.clear(channel);
  }}

