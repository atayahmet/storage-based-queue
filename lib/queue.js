import Container from './container';
import StorageCapsule from './storage-capsule';
import Config from './config';
import Event from './event';

import { clone, utilClearByTag } from './utils';

import {
  getTasksWithoutFreezed,
  createTimeout,
  registerWorkers,
  canMultiple,
  stopQueue,
  statusOff,
  logProxy,
  saveTask,
  db,
} from './helpers';

const _extends =
  Object.assign ||
  function (target) {
    for (let i = 1; i < arguments.length; i++) {
      const source = arguments[i];
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
function _asyncToGenerator(fn) {
  return function () {
    const gen = fn.apply(this, arguments);
    return new Promise(((resolve, reject) => {
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
            (value) => {
              step('next', value);
            },
            (err) => {
              step('throw', err);
            },
          );
        }
      }
      return step('next');
    }));
  };
}

/* eslint no-underscore-dangle: [2, { "allow": ["_id"] }] */

export default function Queue(config) {
  this.channels = {};
  this.config = new Config(config);

  // if custom storage driver exists, setup it
  const { storage } = Queue.drivers;
  this.storage = new StorageCapsule(this.config, storage);

  // Default job timeout
  this.timeout = this.config.get('timeout');
}

Queue.FIFO = 'fifo';
Queue.LIFO = 'lifo';
Queue.drivers = {};
Queue.queueWorkers = {};
Queue.workerDeps = {};

Queue.prototype.currentChannel = null;
Queue.prototype.stopped = true;
Queue.prototype.running = false;
Queue.prototype.event = new Event();
Queue.prototype.container = new Container();

/**
 * Create new job to channel
 *
 * @param  {Object} task
 * @return {String|Boolean} job
 *
 * @api public
 */
Queue.prototype.add = (() => {
  const _ref = _asyncToGenerator(function* (task) {
    if (!(yield canMultiple.call(this, task))) return false;

    const id = yield saveTask.call(this, task);

    if (id && this.stopped && this.running === true) {
      yield this.start();
    }

    // pass activity to the log service.
    logProxy.call(this, 'queue.created', task.handler);

    return id;
  });
  function add(_x) {
    return _ref.apply(this, arguments);
  }
  return add;
})();

/**
 * Process next job
 *
 * @return {void}
 *
 * @api public
 */
Queue.prototype.next = (() => {
  const _ref2 = _asyncToGenerator(function* () {
    if (this.stopped) {
      statusOff.call(this);
      return stopQueue.call(this);
    }

    // Generate a log message
    logProxy.call(this, 'queue.next', 'next');

    // start queue again
    yield this.start();

    return true;
  });
  function next() {
    return _ref2.apply(this, arguments);
  }
  return next;
})();

/**
 * Start queue listener
 *
 * @return {Boolean} job
 *
 * @api public
 */
Queue.prototype.start = (() => {
  const _ref3 = _asyncToGenerator(function* () {
    // Stop the queue for restart
    this.stopped = false;

    // Register tasks, if not registered
    registerWorkers.call(this);

    logProxy.call(this, 'queue.starting', 'start');

    // Create a timeout for start queue
    this.running = (yield createTimeout.call(this)) > 0;

    return this.running;
  });
  function start() {
    return _ref3.apply(this, arguments);
  }
  return start;
})();

/**
 * Stop queue listener after end of current task
 *
 * @return {Void}
 *
 * @api public
 */
Queue.prototype.stop = function stop() {
  logProxy.call(this, 'queue.stopping', 'stop');
  this.stopped = true;
};

/**
 * Stop queue listener including current task
 *
 * @return {Void}
 *
 * @api public
 */
Queue.prototype.forceStop = function forceStop() {
  /* istanbul ignore next */
  stopQueue.call(this);
};

/**
 * Create a new channel
 *
 * @param  {String} task
 * @return {Queue} channel
 *
 * @api public
 */
Queue.prototype.create = function create(channel) {
  if (!(channel in this.channels)) {
    this.currentChannel = channel;
    this.channels[channel] = clone(this);
  }

  return this.channels[channel];
};

/**
 * Get channel instance by channel name
 *
 * @param  {String} name
 * @return {Queue}
 *
 * @api public
 */
Queue.prototype.channel = function channel(name) {
  if (!this.channels[name]) {
    throw new Error(`Channel of "${name}" not found`);
  }

  return this.channels[name];
};

/**
 * Check whether there is any task
 *
 * @return {Booelan}
 *
 * @api public
 */
Queue.prototype.isEmpty = (() => {
  const _ref4 = _asyncToGenerator(function* () {
    return (yield this.count()) < 1;
  });
  function isEmpty() {
    return _ref4.apply(this, arguments);
  }
  return isEmpty;
})();

/**
 * Get task count
 *
 * @return {Number}
 *
 * @api public
 */
Queue.prototype.count = (() => {
  const _ref5 = _asyncToGenerator(function* () {
    return (yield getTasksWithoutFreezed.call(this)).length;
  });
  function count() {
    return _ref5.apply(this, arguments);
  }
  return count;
})();

/**
 * Get task count by tag
 *
 * @param  {String} tag
 * @return {Array<ITask>}
 *
 * @api public
 */
Queue.prototype.countByTag = (() => {
  const _ref6 = _asyncToGenerator(function* (tag) {
    return (yield getTasksWithoutFreezed.call(this)).filter(t => t.tag === tag).length;
  });
  function countByTag(_x2) {
    return _ref6.apply(this, arguments);
  }
  return countByTag;
})();

/**
 * Remove all tasks from channel
 *
 * @return {Boolean}
 *
 * @api public
 */
Queue.prototype.clear = function clear() {
  if (!this.currentChannel) return false;
  this.storage.clear(this.currentChannel);
  return true;
};

/**
 * Remove all tasks from channel by tag
 *
 * @param  {String} tag
 * @return {Boolean}
 *
 * @api public
 */
Queue.prototype.clearByTag = (() => {
  const _ref7 = _asyncToGenerator(function* (tag) {
    const self = this;
    const data = yield db.call(self).all();
    const removes = data.filter(utilClearByTag.bind(tag)).map((() => {
      const _ref8 = _asyncToGenerator(function* (t) {
        const result = yield db.call(self).delete(t._id);
        return result;
      });
      return function (_x4) {
        return _ref8.apply(this, arguments);
      };
    })());
    yield Promise.all(removes);
  });
  function clearByTag(_x3) {
    return _ref7.apply(this, arguments);
  }
  return clearByTag;
})();

/**
 * Check a task whether exists by job id
 *
 * @param  {String} tag
 * @return {Boolean}
 *
 * @api public
 */
Queue.prototype.has = (() => {
  const _ref9 = _asyncToGenerator(function* (id) {
    return (
      (yield getTasksWithoutFreezed.call(this)).findIndex(t => t._id === id) > -1
    );
  });
  function has(_x5) {
    return _ref9.apply(this, arguments);
  }
  return has;
})();

/**
 * Check a task whether exists by tag
 *
 * @param  {String} tag
 * @return {Boolean}
 *
 * @api public
 */
Queue.prototype.hasByTag = (() => {
  const _ref10 = _asyncToGenerator(function* (tag) {
    return (
      (yield getTasksWithoutFreezed.call(this)).findIndex(t => t.tag === tag) > -1
    );
  });
  function hasByTag(_x6) {
    return _ref10.apply(this, arguments);
  }
  return hasByTag;
})();

/**
 * Set config timeout value
 *
 * @param  {Number} val
 * @return {Void}
 *
 * @api public
 */
Queue.prototype.setTimeout = function setTimeout(val) {
  this.timeout = val;
  this.config.set('timeout', val);
};

/**
 * Set config limit value
 *
 * @param  {Number} val
 * @return {Void}
 *
 * @api public
 */
Queue.prototype.setLimit = function setLimit(val) {
  this.config.set('limit', val);
};

/**
 * Set config prefix value
 *
 * @param  {String} val
 * @return {Void}
 *
 * @api public
 */
Queue.prototype.setPrefix = function setPrefix(val) {
  this.config.set('prefix', val);
};

/**
 * Set config priciple value
 *
 * @param  {String} val
 * @return {Void}
 *
 * @api public
 */
Queue.prototype.setPrinciple = function setPrinciple(val) {
  this.config.set('principle', val);
};

/**
 * Set config debug value
 *
 * @param  {Boolean} val
 * @return {Void}
 *
 * @api public
 */
Queue.prototype.setDebug = function setDebug(val) {
  this.config.set('debug', val);
};

Queue.prototype.setStorage = function setStorage(val) {
  this.config.set('storage', val);
};

/**
 * Set action events
 *
 * @param  {String} key
 * @param  {Function} cb
 * @return {Void}
 *
 * @api public
 */
Queue.prototype.on = function on(key, cb) {
  this.event.on(...[key, cb]);
  logProxy.call(this, 'event.created', key);
};

/**
 * Register worker
 *
 * @param  {Array<IJob>} jobs
 * @return {Void}
 *
 * @api public
 */
Queue.workers = function workers() {
  const workersObj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (!(workersObj instanceof Object)) {
    throw new Error('The parameters should be object.');
  }

  Queue.isRegistered = false;
  Queue.queueWorkers = workersObj;
};

/**
 * Added workers dependencies
 *
 * @param  {Object} driver
 * @return {Void}
 *
 * @api public
 */
Queue.deps = function deps() {
  const dependencies = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (!(dependencies instanceof Object)) {
    throw new Error('The parameters should be object.');
  }

  Queue.workerDeps = dependencies;
};

/**
 * Setup a custom driver
 *
 * @param  {Object} driver
 * @return {Void}
 *
 * @api public
 */
Queue.use = function use(driver) {
  Queue.drivers = _extends({}, Queue.drivers, driver);
};
