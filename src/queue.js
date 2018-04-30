/* @flow */
import type IConfig from '../interfaces/config';
import Channel from './channel';
import Container from './container';
import Config from './config';

export default function Queue(config: IConfig) {
  this.config = new Config(config);
}

Queue.FIFO = 'fifo';
Queue.LIFO = 'lifo';
Queue.drivers = {};
Queue.queueWorkers = {};
Queue.workerDeps = {};

Queue.prototype.container = new Container();

/**
 * Create a new channel
 *
 * @param  {String} task
 * @return {Queue} channel
 *
 * @api public
 */
Queue.prototype.create = function create(channel: string): Queue {
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
Queue.prototype.channel = function channel(name: string): Queue {
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
Queue.prototype.setTimeout = function setTimeout(val: number): void {
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
Queue.prototype.setLimit = function setLimit(val: number): void {
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
Queue.prototype.setPrefix = function setPrefix(val: string): void {
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
Queue.prototype.setPrinciple = function setPrinciple(val: string): void {
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
Queue.prototype.setDebug = function setDebug(val: boolean): void {
  this.config.set('debug', val);
};

Queue.prototype.setStorage = function setStorage(val: string): void {
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
Queue.workers = function workers(workersObj: { [prop: string]: any } = {}): void {
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
Queue.deps = function deps(dependencies: { [prop: string]: any } = {}): void {
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
Queue.use = function use(driver: { [prop: string]: any } = {}): void {
  Queue.drivers = { ...Queue.drivers, ...driver };
};
