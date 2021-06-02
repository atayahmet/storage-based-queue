import _Object$keys from '@babel/runtime-corejs2/core-js/object/keys';
import _Object$defineProperty from '@babel/runtime-corejs2/core-js/object/define-property';
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
/* eslint import/no-cycle: "off" */

import Channel from './channel';
import Container from './container';
import Config from './config';

export default class Queue {
  constructor(config) {
    _defineProperty(this, 'config', void 0);
    _defineProperty(this, 'container', void 0);
    this.config = new Config(config);
    this.container = Queue.container;
  }

  /**
   * Create a new channel
   *
   * @param  {String} task
   * @return {Queue} channel
   *
   * @api public
   */
  create(channel) {
    if (!this.container.has(channel)) {
      this.container.bind(channel, new Channel(channel, this.config));
    }
    return this.container.get(channel);
  }

  /**
   * Get channel instance by channel name
   *
   * @param  {String} name
   * @return {Queue}
   *
   * @api public
   */
  channel(name) {
    if (!this.container.has(name)) {
      throw new Error(`"${name}" channel not found`);
    }
    return this.container.get(name);
  }

  /**
   * Set config timeout value
   *
   * @param  {Number} val
   * @return {Void}
   *
   * @api public
   */
  setTimeout(val) {
    this.config.set('timeout', val);
  }

  /**
   * Set config limit value
   *
   * @param  {Number} val
   * @return {Void}
   *
   * @api public
   */
  setLimit(val) {
    this.config.set('limit', val);
  }

  /**
   * Set config prefix value
   *
   * @param  {String} val
   * @return {Void}
   *
   * @api public
   */
  setPrefix(val) {
    this.config.set('prefix', val);
  }

  /**
   * Set config priciple value
   *
   * @param  {String} val
   * @return {Void}
   *
   * @api public
   */
  setPrinciple(val) {
    this.config.set('principle', val);
  }

  /**
   * Set config debug value
   *
   * @param  {Boolean} val
   * @return {Void}
   *
   * @api public
   */
  setDebug(val) {
    this.config.set('debug', val);
  }

  setStorage(val) {
    this.config.set('storage', val);
  }
}
_defineProperty(Queue, 'FIFO', 'fifo');
_defineProperty(Queue, 'LIFO', 'lifo');
_defineProperty(Queue, 'drivers', {});
_defineProperty(Queue, 'workerDeps', {});
_defineProperty(Queue, 'container', void 0);
_defineProperty(Queue, 'worker', void 0);
_defineProperty(Queue, 'workers', void 0);
_defineProperty(Queue, 'deps', void 0);
_defineProperty(Queue, 'use', void 0);

Queue.worker = new Container();

Queue.container = new Container();

/**
 * Register worker
 *
 * @param  {Array<IJob>} jobs
 * @return {Void}
 *
 * @api public
 */
Queue.workers = function workers(workersObj = {}) {
  if (!(workersObj instanceof Object)) {
    throw new Error('The parameters should be object.');
  }

  Queue.worker.merge(workersObj);
};

/**
 * Added workers dependencies
 *
 * @param  {Object} driver
 * @return {Void}
 *
 * @api public
 */
Queue.deps = function deps(dependencies = {}) {
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
Queue.use = function use(driver = {}) {
  _Object$keys(driver).forEach((name) => {
    Queue.drivers[name] = driver[name];
  });
};
