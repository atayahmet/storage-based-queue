function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}
import groupBy from "group-by";
import LocalStorage from "./storage/localstorage";



import Config from "./config";
import { excludeSpecificTasks, lifo, fifo } from "./utils";
import LocalForageAdapter from "./storage/localforage";

export default class StorageCapsule {




  constructor(config, storage) {
    this.config = config;
    this.storage = this.initStorage(storage);
  }

  initStorage(storage) {
    if (typeof storage === 'object') {
      return storage;
    } else
    if (typeof storage === 'function') {
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
  channel(name) {
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
  fetch() {var _this = this;return _asyncToGenerator(function* () {
      const all = (yield _this.all()).filter(excludeSpecificTasks);
      const tasks = groupBy(all, "priority");
      return Object.keys(tasks).
      map(function (key) {return parseInt(key);}).
      sort(function (a, b) {return b - a;}).
      reduce(_this.reduceTasks(tasks), []);})();
  }

  /**
     * Save task to storage
     *
     * @param  {ITask} task
     * @return {String|Boolean}
     *
     * @api public
     */
  save(task) {var _this2 = this;return _asyncToGenerator(function* () {
      // get all tasks current channel's
      const tasks = yield _this2.storage.get(_this2.storageChannel);

      // Check the channel limit.
      // If limit is exceeded, does not insert new task
      if (yield _this2.isExceeded()) {
        console.warn(
        `Task limit exceeded: The '${
        _this2.storageChannel
        }' channel limit is ${_this2.config.get("limit")}`);

        return false;
      }

      // prepare all properties before save
      // example: createdAt etc.
      task = _this2.prepareTask(task);

      // add task to storage
      tasks.push(task);

      // save tasks
      yield _this2.storage.set(_this2.storageChannel, tasks);

      return task._id;})();
  }

  /**
     * Update channel store.
     *
     * @return {string}
     *   The value. This annotation can be used for type hinting purposes.
     */
  update(id, update) {var _this3 = this;return _asyncToGenerator(function* () {
      const data = yield _this3.all();
      console.log('ddd->', data);
      const index = data.findIndex(function (t) {return t._id == id;});

      if (index < 0) return false;

      // merge existing object with given update object
      data[index] = Object.assign({}, data[index], update);

      // save to the storage as string
      yield _this3.storage.set(_this3.storageChannel, data);

      return true;})();
  }

  /**
     * Remove task from storage
     *
     * @param  {String} id
     * @return {Boolean}
     *
     * @api public
     */
  delete(id) {var _this4 = this;return _asyncToGenerator(function* () {
      const data = yield _this4.all();
      const index = data.findIndex(function (d) {return d._id === id;});

      if (index < 0) return false;

      delete data[index];

      yield _this4.storage.set(
      _this4.storageChannel,
      data.filter(function (d) {return d;}));

      return true;})();
  }

  /**
     * Get all tasks
     *
     * @return {Any[]}
     *
     * @api public
     */
  all() {
    return this.storage.get(this.storageChannel);
  }

  /**
     * Generate unique id
     *
     * @return {String}
     *
     * @api public
     */
  generateId() {
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
  prepareTask(task) {
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

  /**
     * Task limit checker
     *
     * @return {Boolean}
     *
     * @api public
     */
  isExceeded() {var _this5 = this;return _asyncToGenerator(function* () {
      const limit = _this5.config.get("limit");
      const tasks = (yield _this5.all()).filter(excludeSpecificTasks);
      console.log('fff->', limit, tasks, !(limit === -1 || limit > tasks.length));
      return !(limit === -1 || limit > tasks.length);})();
  }

  /**
     * Clear tasks with given channel name
     *
     * @param  {String} channel
     * @return {void}
     *
     * @api public
     */
  clear(channel) {
    this.storage.clear(channel);
  }}

