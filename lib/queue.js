




import LocalStorage from "./storage/localstorage";
import Container from "./container";
import StorageCapsule from "./storage-capsule";
import Config from "./config";
import Event from "./event";

import {
log,
clone,
hasMethod,
isFunction,
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
    new LocalStorage(this.config));


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
  Queue.prototype.add = function (task) {
    if (!canMultiple.call(this, task)) return false;

    const id = saveTask.call(this, task);

    if (id && this.stopped && this.running === true) {
      this.start();
    }

    // pass activity to the log service.
    logProxy.call(this, 'queue.created', task.handler);

    return id;
  };

  /**
      * Process next job
      *
      * @return {void}
      *
      * @api public
      */
  Queue.prototype.next = function () {
    if (this.stopped) {
      statusOff.call(this);
      return stopQueue.call(this);
    }

    logProxy.call(this, 'queue.next', 'next');

    this.start();
  };

  /**
      * Start queue listener
      *
      * @return {Boolean} job
      *
      * @api public
      */
  Queue.prototype.start = function () {
    if (!checkNetwork.call(this)) return false;

    // Stop the queue for restart
    this.stopped = false;

    // Register tasks, if not registered
    registerJobs.call(this);

    logProxy.call(this, 'queue.starting', 'start');

    // Create a timeout for start queue
    this.running = createTimeout.call(this) > 0;

    return this.running;
  };

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
  Queue.prototype.isEmpty = function () {
    return this.count() < 1;
  };

  /**
      * Get task count
      *
      * @return {Number}
      *
      * @api public
      */
  Queue.prototype.count = function () {
    return getTasksWithoutFreezed.call(this).length;
  };

  /**
      * Get task count by tag
      *
      * @param  {String} tag
      * @return {Array<ITask>}
      *
      * @api public
      */
  Queue.prototype.countByTag = function (tag) {
    return getTasksWithoutFreezed.call(this).filter(t => t.tag === tag).length;
  };

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
  Queue.prototype.clearByTag = function (tag) {
    db.
    call(this).
    all().
    filter(utilClearByTag.bind(tag)).
    forEach(t => db.call(this).delete(t._id));
  };

  /**
      * Check a task whether exists by job id
      *
      * @param  {String} tag
      * @return {Boolean}
      *
      * @api public
      */
  Queue.prototype.has = function (id) {
    return getTasksWithoutFreezed.call(this).findIndex(t => t._id === id) > -1;
  };

  /**
      * Check a task whether exists by tag
      *
      * @param  {String} tag
      * @return {Boolean}
      *
      * @api public
      */
  Queue.prototype.hasByTag = function (tag) {
    return getTasksWithoutFreezed.call(this).findIndex(t => t.tag === tag) > -1;
  };

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

  return Queue;
})();

export default Queue;

