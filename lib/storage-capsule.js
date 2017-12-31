

import groupBy from "group-by";
import LocalStorage from "./storage/localstorage";



import Config from "./config";
import { excludeSpecificTasks, lifo, fifo } from "./utils";

export default class StorageCapsule {




  constructor(config, storage) {
    this.storage = storage;
    this.config = config;
  }

  channel(name) {
    this.storageChannel = name;
    return this;
  }

  fetch() {
    const all = this.all().filter(excludeSpecificTasks);
    const tasks = groupBy(all, "priority");
    return Object.keys(tasks).
    map(key => parseInt(key)).
    sort((a, b) => b - a).
    reduce(this.reduceTasks(tasks), []);
  }

  save(task) {
    // get all tasks current channel's
    const tasks = this.storage.get(this.storageChannel);

    // check channel limit.
    // if limit is exceeded, does not insert new task
    if (this.isExceeded()) {
      console.warn(
      `Task limit exceeded: The '${
      this.storageChannel
      }' channel limit is ${this.config.get("limit")}`);

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
  }

  update(id, update) {
    const data = this.all();
    const index = data.findIndex(t => t._id == id);

    if (index < 0) return false;

    // merge existing object with given update object
    data[index] = Object.assign({}, data[index], update);

    // save to the storage as string
    this.storage.set(this.storageChannel, JSON.stringify(data));

    return true;
  }

  delete(id) {
    const data = this.all();
    const index = data.findIndex(d => d._id === id);

    if (index < 0) return false;

    delete data[index];

    this.storage.set(
    this.storageChannel,
    JSON.stringify(data.filter(d => d)));

    return true;
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

  reduceTasks(tasks) {
    const reduceFunc = (result, key) => {
      if (this.config.get("principle") === "lifo") {
        return result.concat(tasks[key].sort(lifo));
      } else {
        return result.concat(tasks[key].sort(fifo));
      }
    };

    return reduceFunc.bind(this);
  }

  isExceeded() {
    const limit = this.config.get("limit");
    const tasks = this.all().filter(excludeSpecificTasks);
    return !(limit === -1 || limit > tasks.length);
  }

  clear(channel) {
    this.storage.clear(channel);
  }}

