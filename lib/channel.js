function _defineProperty(obj, key, value) {
  if (key in obj) {
    _Object$defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
import _Symbol from '@babel/runtime-corejs2/core-js/symbol';
import _Promise from '@babel/runtime-corejs2/core-js/promise';
import _Object$defineProperty from '@babel/runtime-corejs2/core-js/object/define-property';
/* eslint import/no-cycle: "off" */

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
  stopQueue,
  getTasksWithoutFreezed,
} from './helpers';
import {
  taskAddedLog,
  nextTaskLog,
  queueStoppingLog,
  queueStartLog,
  eventCreatedLog,
} from './console';

/* eslint no-underscore-dangle: [2, { "allow": ["_id"] }] */

const channelName = _Symbol('channel-name');

export default class Channel {
  constructor(name, config) {
    _defineProperty(this, 'stopped', true);
    _defineProperty(this, 'running', false);
    _defineProperty(this, 'timeout', void 0);
    _defineProperty(this, 'storage', void 0);
    _defineProperty(this, 'config', void 0);
    _defineProperty(this, 'event', new Event());
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
  async add(task) {
    if (!(await canMultiple.call(this, task))) return false;

    const id = await saveTask.call(this, task);

    if (id && this.running === true) {
      await this.start();
    }

    // pass activity to the log service.
    logProxy.call(this, taskAddedLog, task);

    return id;
  }

  /**
   * Process next job
   *
   * @return {void}
   *
   * @api public
   */
  async next() {
    if (this.stopped) {
      return stopQueue.call(this);
    }

    // Generate a log message
    logProxy.call(this, nextTaskLog, 'next');

    // start queue again
    await this.start();

    return true;
  }

  /**
   * Start queue listener
   *
   * @return {Boolean} job
   *
   * @api public
   */
  async start() {
    this.stopped = false;
    this.running = true;

    logProxy.call(this, queueStartLog, 'start');

    // Create a timeout for start the queue
    await createTimeout.call(this);
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
   * Check if the channel working
   *
   * @return {Boolean}
   *
   * @api public
   */
  status() {
    return this.running;
  }

  /**
   * Check whether there is any task
   *
   * @return {Booelan}
   *
   * @api public
   */
  async isEmpty() {
    return (await this.count()) < 1;
  }

  /**
   * Get task count
   *
   * @return {Number}
   *
   * @api public
   */
  async count() {
    return (await getTasksWithoutFreezed.call(this)).length;
  }

  /**
   * Get task count by tag
   *
   * @param  {String} tag
   * @return {Array<ITask>}
   *
   * @api public
   */
  async countByTag(tag) {
    return (await getTasksWithoutFreezed.call(this)).filter(
      (t) => t.tag === tag
    ).length;
  }

  /**
   * Remove all tasks from channel
   *
   * @return {Boolean}
   *
   * @api public
   */
  async clear() {
    if (!this.name()) return false;
    await this.storage.clear(this.name());
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
  async clearByTag(tag) {
    const self = this;
    const data = await db.call(self).all();
    const removes = data.filter(utilClearByTag.bind(tag)).map(async (t) => {
      const result = await db.call(self).delete(t._id);
      return result;
    });
    await _Promise.all(removes);
  }

  /**
   * Check a task whether exists by job id
   *
   * @param  {String} tag
   * @return {Boolean}
   *
   * @api public
   */
  async has(id) {
    return (
      (await getTasksWithoutFreezed.call(this)).findIndex((t) => t._id === id) >
      -1
    );
  }

  /**
   * Check a task whether exists by tag
   *
   * @param  {String} tag
   * @return {Boolean}
   *
   * @api public
   */
  async hasByTag(tag) {
    return (
      (await getTasksWithoutFreezed.call(this)).findIndex(
        (t) => t.tag === tag
      ) > -1
    );
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
    logProxy.call(this, eventCreatedLog, key, this.name());
  }
}
