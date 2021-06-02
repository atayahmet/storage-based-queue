/* @flow */
/* eslint import/no-cycle: "off" */
import type { IConfig } from './interfaces/config';
import Channel from './channel';
import Container from './container';
import Config from './config';

export default class Queue {
  static FIFO: string = 'fifo';

  static LIFO: string = 'lifo';

  static drivers: Object = {};

  static workerDeps: Object = {};

  static container: Container;

  static worker: Container;

  static workers: ({[prop: string]: any }) => void;

  static deps: ({[prop: string]: any }) => void;

  static use: ({[prop: string]: any }) => void;

  config: Config;

  container: Container;

  constructor(config: IConfig) {
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
  create(channel: string): Queue {
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
  channel(name: string): Queue {
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
  setTimeout(val: number): void {
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
  setLimit(val: number): void {
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
  setPrefix(val: string): void {
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
  setPrinciple(val: string): void {
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
  setDebug(val: boolean): void {
    this.config.set('debug', val);
  }

  setStorage(val: string): void {
    this.config.set('storage', val);
  }
}

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
Queue.workers = function workers(workersObj: { [prop: string]: any } = {}): void {
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
  Object.keys(driver).forEach((name) => {
    Queue.drivers[name] = driver[name];
  });
};
