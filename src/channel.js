// @flow
import type ITask from './../interfaces/task';
import type IConfig from '../interfaces/config';
import Event from './event';
import Container from './container';
import StorageCapsule from './storage-capsule';
import Queue from './queue';
import { utilClearByTag } from './utils';
import {
  db,
  canMultiple,
  saveTask,
  logProxy,
  registerWorkers,
  createTimeout,
  statusOff,
  stopQueue,
  getTasksWithoutFreezed,
} from './helpers';

/* eslint no-underscore-dangle: [2, { "allow": ["_id"] }] */

const channelName = Symbol('channel-name');

export default class Channel {
  stopped: boolean = true;
  running: boolean = false;
  timeout: number;
  storage: StorageCapsule;
  config: IConfig;
  event = new Event();
  container = new Container();

  constructor(name: string, config: IConfig) {
    this.config = config;

    // Default worker circle timeout
    this.timeout = this.config.get('timeout');

    // save channel name to this class with symbolic key
    (this: Object)[channelName] = name;

    // if custom storage driver exists, setup it
    const { drivers }: any = Queue;
    const storage = new StorageCapsule(config, drivers.storage);
    this.storage = storage.channel(name);
  }

  name(): string {
    return (this: Object)[channelName];
  }

  /**
   * Create new job to channel
   *
   * @param  {Object} task
   * @return {String|Boolean} job
   *
   * @api public
   */
  async add(task: ITask): Promise<string | boolean> {
    if (!(await canMultiple.call(this, task))) return false;

    const id = await saveTask.call(this, task);

    if (id && this.stopped && this.running === true) {
      await this.start();
    }

    // pass activity to the log service.
    logProxy.call(this, 'queue.created', task.handler);

    return id;
  }

  /**
   * Process next job
   *
   * @return {void}
   *
   * @api public
   */
  async next(): Promise<void | boolean> {
    if (this.stopped) {
      statusOff.call(this);
      return stopQueue.call(this);
    }

    // Generate a log message
    logProxy.call(this, 'queue.next', 'next');

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
  async start(): Promise<boolean> {
    // Stop the queue for restart
    this.stopped = false;

    // Register tasks, if not registered
    registerWorkers.call(this);

    logProxy.call(this, 'queue.starting', 'start');

    // Create a timeout for start queue
    this.running = (await createTimeout.call(this)) > 0;

    return this.running;
  }

  /**
   * Stop queue listener after end of current task
   *
   * @return {Void}
   *
   * @api public
   */
  stop(): void {
    logProxy.call(this, 'queue.stopping', 'stop');
    this.stopped = true;
  }

  /**
   * Stop queue listener including current task
   *
   * @return {Void}
   *
   * @api public
   */
  forceStop(): void {
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
  async isEmpty(): Promise<boolean> {
    return (await this.count()) < 1;
  }

  /**
   * Get task count
   *
   * @return {Number}
   *
   * @api public
   */
  async count(): Promise<number> {
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
  async countByTag(tag: string): Promise<number> {
    return (await getTasksWithoutFreezed.call(this)).filter(t => t.tag === tag).length;
  }

  /**
   * Remove all tasks from channel
   *
   * @return {Boolean}
   *
   * @api public
   */
  clear(): boolean {
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
  async clearByTag(tag: string): Promise<void> {
    const self = this;
    const data = await db.call(self).all();
    const removes = data.filter(utilClearByTag.bind(tag)).map(async (t) => {
      const result = await db.call(self).delete(t._id);
      return result;
    });
    await Promise.all(removes);
  }

  /**
   * Check a task whether exists by job id
   *
   * @param  {String} tag
   * @return {Boolean}
   *
   * @api public
   */
  async has(id: string): Promise<boolean> {
    return (await getTasksWithoutFreezed.call(this)).findIndex(t => t._id === id) > -1;
  }

  /**
   * Check a task whether exists by tag
   *
   * @param  {String} tag
   * @return {Boolean}
   *
   * @api public
   */
  async hasByTag(tag: string): Promise<boolean> {
    return (await getTasksWithoutFreezed.call(this)).findIndex(t => t.tag === tag) > -1;
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
  on(key: string, cb: Function): void {
    this.event.on(...[key, cb]);
    logProxy.call(this, 'event.created', key);
  }
}
