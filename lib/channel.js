function _asyncToGenerator(fn) {
  return function() {
    var gen = fn.apply(this, arguments);
    return new Promise(function(resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }
        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(
            function(value) {
              step('next', value);
            },
            function(err) {
              step('throw', err);
            }
          );
        }
      }
      return step('next');
    });
  };
}

import Event from './event';
import StorageCapsule from './storage-capsule';
import Queue from './queue';
import { utilClearByTag } from './utils';
import {
  db,
  canMultiple,
  saveTask,
  logProxy,
  createTimeout,
  statusOff,
  stopQueue,
  getTasksWithoutFreezed
} from './helpers';
import {
  taskAddedLog,
  nextTaskLog,
  queueStoppingLog,
  queueStartLog,
  eventCreatedLog
} from './console';

/* eslint no-underscore-dangle: [2, { "allow": ["_id"] }] */

const channelName = Symbol('channel-name');

export default class Channel {
  constructor(name, config) {
    this.stopped = true;
    this.running = false;
    this.event = new Event();
    this.config = config;

    // save channel name to this class with symbolic key
    this[channelName] = name;

    // if custom storage driver exists, setup it
    const { drivers } = Queue;
    const storage = new StorageCapsule(config, drivers.storage);
    this.storage = storage.channel(name);
  }

  /**
   * Get channel name
   *
   * @return {String} channel name
   *
   * @api public
   */
  name() {
    return this[channelName];
  }

  /**
   * Create new job to channel
   *
   * @param  {Object} task
   * @return {String|Boolean} job
   *
   * @api public
   */
  add(task) {
    var _this = this;
    return _asyncToGenerator(function*() {
      if (!(yield canMultiple.call(_this, task))) return false;

      const id = yield saveTask.call(_this, task);

      if (id && _this.stopped && _this.running === true) {
        yield _this.start();
      }

      // pass activity to the log service.
      logProxy.call(_this, taskAddedLog, task);

      return id;
    })();
  }

  /**
   * Process next job
   *
   * @return {void}
   *
   * @api public
   */
  next() {
    var _this2 = this;
    return _asyncToGenerator(function*() {
      if (_this2.stopped) {
        statusOff.call(_this2);
        return stopQueue.call(_this2);
      }

      // Generate a log message
      logProxy.call(_this2, nextTaskLog, 'next');

      // start queue again
      yield _this2.start();

      return true;
    })();
  }

  /**
   * Start queue listener
   *
   * @return {Boolean} job
   *
   * @api public
   */
  start() {
    var _this3 = this;
    return _asyncToGenerator(function*() {
      // Stop the queue for restart
      _this3.stopped = false;

      // Register tasks, if not registered
      // registerWorkers.call(this);

      logProxy.call(_this3, queueStartLog, 'start');

      // Create a timeout for start queue
      _this3.running = (yield createTimeout.call(_this3)) > 0;

      return _this3.running;
    })();
  }

  /**
   * Stop queue listener after end of current task
   *
   * @return {Void}
   *
   * @api public
   */
  stop() {
    logProxy.call(this, queueStoppingLog, 'stop');
    this.stopped = true;
  }

  /**
   * Stop queue listener including current task
   *
   * @return {Void}
   *
   * @api public
   */
  forceStop() {
    /* istanbul ignore next */
    stopQueue.call(this);
  }

  /**
   * Check whether there is any task
   *
   * @return {Booelan}
   *
   * @api public
   */
  isEmpty() {
    var _this4 = this;
    return _asyncToGenerator(function*() {
      return (yield _this4.count()) < 1;
    })();
  }

  /**
   * Get task count
   *
   * @return {Number}
   *
   * @api public
   */
  count() {
    var _this5 = this;
    return _asyncToGenerator(function*() {
      return (yield getTasksWithoutFreezed.call(_this5)).length;
    })();
  }

  /**
   * Get task count by tag
   *
   * @param  {String} tag
   * @return {Array<ITask>}
   *
   * @api public
   */
  countByTag(tag) {
    var _this6 = this;
    return _asyncToGenerator(function*() {
      return (yield getTasksWithoutFreezed.call(_this6)).filter(function(t) {
        return t.tag === tag;
      }).length;
    })();
  }

  /**
   * Remove all tasks from channel
   *
   * @return {Boolean}
   *
   * @api public
   */
  clear() {
    if (!this.name()) return false;
    this.storage.clear(this.name());
    return true;
  }

  /**
   * Remove all tasks from channel by tag
   *
   * @param  {String} tag
   * @return {Boolean}
   *
   * @api public
   */
  clearByTag(tag) {
    var _this7 = this;
    return _asyncToGenerator(function*() {
      const self = _this7;
      const data = yield db.call(self).all();
      const removes = data.filter(utilClearByTag.bind(tag)).map(
        (() => {
          var _ref = _asyncToGenerator(function*(t) {
            const result = yield db.call(self).delete(t._id);
            return result;
          });
          return function(_x) {
            return _ref.apply(this, arguments);
          };
        })()
      );
      yield Promise.all(removes);
    })();
  }

  /**
   * Check a task whether exists by job id
   *
   * @param  {String} tag
   * @return {Boolean}
   *
   * @api public
   */
  has(id) {
    var _this8 = this;
    return _asyncToGenerator(function*() {
      return (
        (yield getTasksWithoutFreezed.call(_this8)).findIndex(function(t) {
          return t._id === id;
        }) > -1
      );
    })();
  }

  /**
   * Check a task whether exists by tag
   *
   * @param  {String} tag
   * @return {Boolean}
   *
   * @api public
   */
  hasByTag(tag) {
    var _this9 = this;
    return _asyncToGenerator(function*() {
      return (
        (yield getTasksWithoutFreezed.call(_this9)).findIndex(function(t) {
          return t.tag === tag;
        }) > -1
      );
    })();
  }

  /**
   * Set action events
   *
   * @param  {String} key
   * @param  {Function} cb
   * @return {Void}
   *
   * @api public
   */
  on(key, cb) {
    this.event.on(...[key, cb]);
    logProxy.call(this, eventCreatedLog, key);
  }
}
