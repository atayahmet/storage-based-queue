/* @flow */
import type IConfig from '../interfaces/config';
import Channel from './channel';
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

/* eslint no-underscore-dangle: [2, { "allow": ["_id"] }] */

export default function Queue(config: IConfig) {
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
Queue.prototype.add = async function add(task): Promise<string | boolean> {
  if (!(await canMultiple.call(this, task))) return false;

  const id = await saveTask.call(this, task);

  if (id && this.stopped && this.running === true) {
    await this.start();
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
Queue.prototype.next = async function next(): Promise<void | boolean> {
  if (this.stopped) {
    statusOff.call(this);
    return stopQueue.call(this);
  }

  // Generate a log message
  logProxy.call(this, 'queue.next', 'next');

  // start queue again
  await this.start();

  return true;
};

/**
 * Start queue listener
 *
 * @return {Boolean} job
 *
 * @api public
 */
Queue.prototype.start = async function start(): Promise<boolean> {
  // Stop the queue for restart
  this.stopped = false;

  // Register tasks, if not registered
  registerWorkers.call(this);

  logProxy.call(this, 'queue.starting', 'start');

  // Create a timeout for start queue
  this.running = (await createTimeout.call(this)) > 0;

  return this.running;
};

/**
 * Stop queue listener after end of current task
 *
 * @return {Void}
 *
 * @api public
 */
Queue.prototype.stop = function stop(): void {
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
Queue.prototype.forceStop = function forceStop(): void {
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
Queue.prototype.create = function create(channel: string): Queue {
  if (!(channel in this.channels)) {
    this.currentChannel = channel;
    this.channels[channel] = clone(this);
    // this.channels[channel] = new Channel(channel);
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
Queue.prototype.channel = function channel(name: string): Queue {
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
Queue.prototype.isEmpty = async function isEmpty(): Promise<boolean> {
  return (await this.count()) < 1;
};

/**
 * Get task count
 *
 * @return {Number}
 *
 * @api public
 */
Queue.prototype.count = async function count(): Promise<number> {
  return (await getTasksWithoutFreezed.call(this)).length;
};

/**
 * Get task count by tag
 *
 * @param  {String} tag
 * @return {Array<ITask>}
 *
 * @api public
 */
Queue.prototype.countByTag = async function countByTag(tag: string): Promise<number> {
  return (await getTasksWithoutFreezed.call(this)).filter(t => t.tag === tag).length;
};

/**
 * Remove all tasks from channel
 *
 * @return {Boolean}
 *
 * @api public
 */
Queue.prototype.clear = function clear(): boolean {
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
Queue.prototype.clearByTag = async function clearByTag(tag: string): Promise<void> {
  const self = this;
  const data = await db.call(self).all();
  const removes = data.filter(utilClearByTag.bind(tag)).map(async (t) => {
    const result = await db.call(self).delete(t._id);
    return result;
  });
  await Promise.all(removes);
};

/**
 * Check a task whether exists by job id
 *
 * @param  {String} tag
 * @return {Boolean}
 *
 * @api public
 */
Queue.prototype.has = async function has(id: string): Promise<boolean> {
  return (await getTasksWithoutFreezed.call(this)).findIndex(t => t._id === id) > -1;
};

/**
 * Check a task whether exists by tag
 *
 * @param  {String} tag
 * @return {Boolean}
 *
 * @api public
 */
Queue.prototype.hasByTag = async function hasByTag(tag: string): Promise<boolean> {
  return (await getTasksWithoutFreezed.call(this)).findIndex(t => t.tag === tag) > -1;
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
 * Set action events
 *
 * @param  {String} key
 * @param  {Function} cb
 * @return {Void}
 *
 * @api public
 */
Queue.prototype.on = function on(key: string, cb: Function): void {
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
