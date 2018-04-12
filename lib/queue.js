function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}


import Container from './container';
import StorageCapsule from './storage-capsule';
import Config from './config';
import Event from './event';

import {
clone,
excludeSpecificTasks,
utilClearByTag } from
"./utils";

import {
getTasksWithoutFreezed,
fireJobInlineEvent,
dispatchEvents,
createTimeout,
loopHandler,
registerJobs,
canMultiple,
stopQueue,
statusOff,
logProxy,
saveTask,
checkNetwork,
createNetworkEvent,
removeNetworkEvent,
db } from
'./helpers';


let Queue = (() => {
  "use strict";

  Queue.FIFO = "fifo";
  Queue.LIFO = "lifo";

  function Queue(config) {
    _constructor.call(this, config);
  }

  function _constructor(config) {
    this.channels = {};
    this.config = new Config(config);
    this.storage = new StorageCapsule(
    this.config,
    Queue.storageDriver);


    // Default job timeout
    this.timeout = this.config.get("timeout");

    const network = this.config.get('network');

    // network observer
    createNetworkEvent.call(this, network);
  }

  Queue.prototype.currentChannel;
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
  Queue.prototype.add = (() => {var _ref = _asyncToGenerator(function* (task) {
      if (!canMultiple.call(this, task)) return false;

      const id = yield saveTask.call(this, task);

      if (id && this.stopped && this.running === true) {
        yield this.start();
      }

      // pass activity to the log service.
      logProxy.call(this, 'queue.created', task.handler);

      return id;
    });return function (_x) {return _ref.apply(this, arguments);};})();

  /**
                                                                         * Process next job
                                                                         *
                                                                         * @return {void}
                                                                         *
                                                                         * @api public
                                                                         */
  Queue.prototype.next = _asyncToGenerator(function* () {
    if (this.stopped) {
      statusOff.call(this);
      return stopQueue.call(this);
    }

    logProxy.call(this, 'queue.next', 'next');

    yield this.start();
  });

  /**
       * Start queue listener
       *
       * @return {Boolean} job
       *
       * @api public
       */
  Queue.prototype.start = _asyncToGenerator(function* () {
    if (!checkNetwork.call(this)) return false;

    // Stop the queue for restart
    this.stopped = false;

    // Register tasks, if not registered
    registerJobs.call(this);

    logProxy.call(this, 'queue.starting', 'start');

    // Create a timeout for start queue
    this.running = (yield createTimeout.call(this)) > 0;

    return this.running;
  });

  /**
       * Stop queue listener after end of current task
       *
       * @return {Void}
       *
       * @api public
       */
  Queue.prototype.stop = function () {
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
  Queue.prototype.forceStop = function () {
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
  Queue.prototype.create = function (channel) {
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
  Queue.prototype.channel = function (name) {
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
  Queue.prototype.isEmpty = _asyncToGenerator(function* () {
    return (yield this.count()) < 1;
  });

  /**
       * Get task count
       *
       * @return {Number}
       *
       * @api public
       */
  Queue.prototype.count = _asyncToGenerator(function* () {
    return (yield getTasksWithoutFreezed.call(this)).length;
  });

  /**
       * Get task count by tag
       *
       * @param  {String} tag
       * @return {Array<ITask>}
       *
       * @api public
       */
  Queue.prototype.countByTag = (() => {var _ref6 = _asyncToGenerator(function* (tag) {
      return (yield getTasksWithoutFreezed.call(this)).filter(function (t) {return t.tag === tag;}).length;
    });return function (_x2) {return _ref6.apply(this, arguments);};})();

  /**
                                                                           * Remove all tasks from channel
                                                                           *
                                                                           * @return {Boolean}
                                                                           *
                                                                           * @api public
                                                                           */
  Queue.prototype.clear = function () {
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
  Queue.prototype.clearByTag = (() => {var _ref7 = _asyncToGenerator(function* (tag) {var _this = this;
      (yield db.
      call(this).
      all()).
      filter(utilClearByTag.bind(tag)).
      forEach(function (t) {return db.call(_this).delete(t._id);});
    });return function (_x3) {return _ref7.apply(this, arguments);};})();

  /**
                                                                           * Check a task whether exists by job id
                                                                           *
                                                                           * @param  {String} tag
                                                                           * @return {Boolean}
                                                                           *
                                                                           * @api public
                                                                           */
  Queue.prototype.has = (() => {var _ref8 = _asyncToGenerator(function* (id) {
      return (yield getTasksWithoutFreezed.call(this)).findIndex(function (t) {return t._id === id;}) > -1;
    });return function (_x4) {return _ref8.apply(this, arguments);};})();

  /**
                                                                           * Check a task whether exists by tag
                                                                           *
                                                                           * @param  {String} tag
                                                                           * @return {Boolean}
                                                                           *
                                                                           * @api public
                                                                           */
  Queue.prototype.hasByTag = (() => {var _ref9 = _asyncToGenerator(function* (tag) {
      return (yield getTasksWithoutFreezed.call(this)).findIndex(function (t) {return t.tag === tag;}) > -1;
    });return function (_x5) {return _ref9.apply(this, arguments);};})();

  /**
                                                                           * Set config timeout value
                                                                           *
                                                                           * @param  {Number} val
                                                                           * @return {Void}
                                                                           *
                                                                           * @api public
                                                                           */
  Queue.prototype.setTimeout = function (val) {
    this.timeout = val;
    this.config.set("timeout", val);
  };

  /**
      * Set config limit value
      *
      * @param  {Number} val
      * @return {Void}
      *
      * @api public
      */
  Queue.prototype.setLimit = function (val) {
    this.config.set("limit", val);
  };

  /**
      * Set config prefix value
      *
      * @param  {String} val
      * @return {Void}
      *
      * @api public
      */
  Queue.prototype.setPrefix = function (val) {
    this.config.set("prefix", val);
  };

  /**
      * Set config priciple value
      *
      * @param  {String} val
      * @return {Void}
      *
      * @api public
      */
  Queue.prototype.setPrinciple = function (val) {
    this.config.set("principle", val);
  };

  /**
      * Set config debug value
      *
      * @param  {Boolean} val
      * @return {Void}
      *
      * @api public
      */
  Queue.prototype.setDebug = function (val) {
    this.config.set("debug", val);
  };

  /**
      * Set config network value
      *
      * @param  {Boolean} val
      * @return {Void}
      *
      * @api public
      */
  Queue.prototype.setNetwork = function (val) {
    this.config.set("network", val);

    // clear network event if it exists
    removeNetworkEvent.call(this);

    // if value true, create new network event
    createNetworkEvent.call(this, val);
  };

  Queue.prototype.setStorage = function (val) {
    this.config.set("storage", val);
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
  Queue.prototype.on = function (key, cb) {
    this.event.on(...arguments);
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
  Queue.register = function (jobs) {
    if (!(jobs instanceof Array)) {
      throw new Error("Queue jobs should be objects within an array");
    }

    Queue.isRegistered = false;
    Queue.jobs = jobs;
  };

  Queue.storage = function (storage) {
    console.log('driver->', storage);
    Queue.storageDriver = storage;
  };

  return Queue;
})();

export default Queue;

