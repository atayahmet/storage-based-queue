var _extends =
  Object.assign ||
  function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };

import Channel from './channel';
import Container from './container';
import Config from './config';

export default function Queue(config) {
  this.config = new Config(config);
}

Queue.FIFO = 'fifo';
Queue.LIFO = 'lifo';
Queue.drivers = {};
Queue.workerDeps = {};
Queue.worker = new Container();
Queue.prototype.container = new Container();

/**
 * Create a new channel
 *
 * @param  {String} task
 * @return {Queue} channel
 *
 * @api public
 */
Queue.prototype.create = function create(channel) {
  if (!this.container.has(channel)) {
    this.container.bind(channel, new Channel(channel, this.config));
  }
  return this.container.get(channel);
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
  if (!this.container.has(name)) {
    throw new Error(`"${name}" channel not found`);
  }
  return this.container.get(name);
};

/**
 * Set config timeout value
 *
 * @param  {Number} val
 * @return {Void}
 *
 * @api public
 */
Queue.prototype.setTimeout = function setTimeout(val) {
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
 * Register worker
 *
 * @param  {Array<IJob>} jobs
 * @return {Void}
 *
 * @api public
 */
Queue.workers = function workers() {
  let workersObj =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
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
Queue.deps = function deps() {
  let dependencies =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
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
Queue.use = function use() {
  let driver =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  Queue.drivers = _extends({}, Queue.drivers, driver);
};
