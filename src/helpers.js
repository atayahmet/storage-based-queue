/* @flow */
import { watch } from 'is-offline';
import Queue from './queue';
import { excludeSpecificTasks, log, hasMethod, isFunction } from './utils';
import StorageCapsule from './storage-capsule';
import type ITask from '../interfaces/task';
import type { IJob, IJobInstance } from '../interfaces/job';

/* global navigator:true */
/* eslint no-underscore-dangle: [2, { "allow": ["_id"] }] */
/* eslint no-param-reassign: "error" */
/* eslint use-isnan: "error" */

/**
 * Task priority controller helper
 * Context: Queue
 *
 * @return {ITask}
 * @param {ITask} task
 *
 * @api private
 */
export function checkPriority(task: ITask): ITask {
  task.priority = task.priority || 0;

  if (typeof task.priority !== 'number') task.priority = 0;

  return task;
}

/**
 * Shortens function the db belongsto current channel
 * Context: Queue
 *
 * @return {StorageCapsule}
 *
 * @api private
 */
export function db(): StorageCapsule {
  return (this: any).storage.channel((this: any).currentChannel);
}

/**
 * Get unfreezed tasks by the filter function
 * Context: Queue
 *
 * @return {ITask}
 *
 * @api private
 */
export async function getTasksWithoutFreezed(): Promise<ITask[]> {
  return (await db.call(this).all()).filter(excludeSpecificTasks.bind(['freezed']));
}

/**
 * Log proxy helper
 * Context: Queue
 *
 * @return {void}
 * @param {string} key
 * @param {string} data
 * @param {boolean} cond
 *
 * @api private
 */
export function logProxy(...args: any): void {
  log.call(
    // debug mode status
    (this: any).config.get('debug'),

    // log arguments
    ...args,
  );
}

/**
 * New task save helper
 * Context: Queue
 *
 * @param {ITask} task
 * @return {string|boolean}
 *
 * @api private
 */
export async function saveTask(task: ITask): Promise<string | boolean> {
  const result = await db.call(this).save(checkPriority(task));
  return result;
}

/**
 * Task remove helper
 * Context: Queue
 *
 * @param {string} id
 * @return {boolean}
 *
 * @api private
 */
export async function removeTask(id: string): Promise<boolean> {
  const result = await db.call(this).delete(id);
  return result;
}

/**
 * Events dispatcher helper
 * Context: Queue
 *
 * @param {ITask} task
 * @param {string} type
 * @return {void}
 *
 * @api private
 */
export function dispatchEvents(task: ITask, type: string): boolean | void {
  if (!('tag' in task)) return false;

  const events = [[`${task.tag}:${type}`, 'fired'], [`${task.tag}:*`, 'wildcard-fired']];

  events.forEach((e) => {
    this.event.emit(e[0], task);
    logProxy.call((this: any), `event.${e[1]}`, e[0]);
  });

  return true;
}

/**
 * Queue stopper helper
 * Context: Queue
 *
 * @return {void}
 *
 * @api private
 */
export function stopQueue(): void {
  this.stop();

  clearTimeout(this.currentTimeout);

  logProxy.call(this, 'queue.stopped', 'stop');
}

/**
 * Failed job handler
 * Context: Queue
 *
 * @param {ITask} task
 * @return {ITask} job
 * @return {Function}
 *
 * @api private
 */
export async function failedJobHandler(task: ITask): Promise<Function> {
  return async function childFailedHandler(): Promise<void> {
    removeTask.call(this, task._id);

    this.event.emit('error', task);

    await this.next();
  };
}

/**
 * Helper of the lock task of the current job
 * Context: Queue
 *
 * @param {ITask} task
 * @return {boolean}
 *
 * @api private
 */
export async function lockTask(task: ITask): Promise<boolean> {
  const result = await db.call(this).update(task._id, { locked: true });
  return result;
}

/**
 * Class event luancher helper
 * Context: Queue
 *
 * @param {string} name
 * @param {IJobInstance} job
 * @param {any} args
 * @return {boolean|void}
 *
 * @api private
 */
export function fireJobInlineEvent(name: string, job: IJobInstance, args: any): boolean {
  if (!hasMethod(job, name)) return false;

  if (name === 'before' && isFunction(job.before)) {
    job.before.call(job, args);
  } else if (name === 'after' && isFunction(job.after)) {
    job.after.call(job, args);
  }

  return true;
}

/**
 * Process handler of succeeded job
 * Context: Queue
 *
 * @param {ITask} task
 * @param {IJobInstance} job
 * @return {void}
 *
 * @api private
 */
export function successProcess(task: ITask): void {
  removeTask.call(this, task._id);
}

/**
 * Update task's retry value
 * Context: Queue
 *
 * @param {ITask} task
 * @param {IJobInstance} job
 * @return {ITask}
 *
 * @api private
 */
export function updateRetry(task: ITask, job: IJobInstance): ITask {
  if (!('retry' in job)) job.retry = 1;

  if (!('tried' in task)) {
    task.tried = 0;
    task.retry = job.retry;
  }

  task.tried += 1;

  if (task.tried >= job.retry) {
    task.freezed = true;
  }

  return task;
}

/**
 * Process handler of retried job
 * Context: Queue
 *
 * @param {ITask} task
 * @param {IJobInstance} job
 * @return {boolean}
 *
 * @api private
 */
export async function retryProcess(task: ITask, job: IJobInstance): Promise<boolean> {
  // dispacth custom retry event
  dispatchEvents.call(this, task, 'retry');

  // update retry value
  const updateTask: ITask = updateRetry.call(this, task, job);

  // delete lock property for next process
  updateTask.locked = false;

  const result = await db.call(this).update(task._id, updateTask);

  return result;
}

/**
 * Dispatch non-error job process after runs
 * Context: Queue
 *
 * @param {boolean} result
 * @param {ITask} task
 * @param {IJobInstance} job
 * @return {void}
 *
 * @api private
 */
export function dispatchProcess(result: boolean, task: ITask, job: IJob): void {
  const self: Queue = this;
  if (result) {
    successProcess.call(self, task);
  } else {
    retryProcess.call(self, task, job);
  }
}

/**
 * Succeed job handler
 * Context: Queue
 *
 * @param {ITask} task
 * @param {IJobInstance} job
 * @return {Function}
 *
 * @api private
 */
export async function successJobHandler(task: ITask, job: IJobInstance): Promise<Function> {
  const self: Queue = this;
  return async function childSuccessJobHandler(result: boolean): Promise<void> {
    // dispatch job process after runs a task but only non error jobs
    dispatchProcess.call(self, result, task, job);

    // fire job after event
    fireJobInlineEvent.call(self, 'after', job, task.args);

    // dispacth custom after event
    dispatchEvents.call(self, task, 'after');

    // try next queue job
    await self.next();
  };
}

/**
 * Job handler helper
 * Context: Queue
 *
 * @param {ITask} task
 * @param {IJob} job
 * @param {IJobInstance} jobInstance
 * @return {Function}
 *
 * @api private
 */
export function loopHandler(task: ITask, job: IJob, jobInstance: IJobInstance): Function {
  return async function childLoopHandler(): Promise<void> {
    const self: Queue = this;

    // lock the current task for prevent race condition
    await lockTask.call(self, task);

    // fire job before event
    fireJobInlineEvent.call(this, 'before', jobInstance, task.args);

    // dispacth custom before event
    dispatchEvents.call(this, task, 'before');

    // preparing worker dependencies
    const dependencies = Object.values(job.deps || {});

    // Task runner promise
    jobInstance.handle
      .call(jobInstance, task.args, ...dependencies)
      .then((await successJobHandler.call(self, task, jobInstance)).bind(self))
      .catch((await failedJobHandler.call(self, task)).bind(self));
  };
}

/**
 * Timeout creator helper
 * Context: Queue
 *
 * @return {number}
 *
 * @api private
 */
export async function createTimeout(): Promise<number> {
  // if running any job, stop it
  // the purpose here is to prevent cocurrent operation in same channel
  clearTimeout(this.currentTimeout);

  // Get next task
  const task: ITask = (await db.call(this).fetch()).shift();

  if (task === undefined) {
    logProxy.call(this, 'queue.empty', this.currentChannel);
    stopQueue.call(this);
    return 1;
  }

  if (!this.container.has(task.handler)) {
    logProxy.call(this, 'queue.not-found', task.handler);
    await (await failedJobHandler.call(this, task)).call();
    return 1;
  }

  // Get worker with handler name
  const job: IJob = this.container.get(task.handler);

  // Set fresh worker name avoid to eslint errors
  const JobWorker = job.handler;

  // Create a worker instance
  const jobInstance: IJobInstance = new JobWorker();

  // get always last updated config value
  const timeout: number = jobInstance.timeout || this.config.get('timeout');

  // Get handler function for handle on completed event
  const handler: Function = (await loopHandler.call(this, task, job, jobInstance)).bind(this);

  // create new timeout for process a job in queue
  // binding loopHandler function to setTimeout
  // then return the timeout instance
  this.currentTimeout = setTimeout(handler, timeout);

  return this.currentTimeout;
}

/**
 * Process handler of succeeded job
 * Context: Queue
 *
 * @param {ITask} task
 * @param {IJobInstance} job
 * @return {void}
 *
 * @api private
 */
export function statusOff(): void {
  this.running = false;
}

/**
 * Checks whether a task is replicable or not
 * Context: Queue
 *
 * @param {ITask} task
 * @return {boolean}
 *
 * @api private
 */
export async function canMultiple(task: ITask): Promise<boolean> {
  if (typeof task !== 'object' || task.unique !== true) return true;

  return (await this.hasByTag(task.tag)) < 1;
}

/**
 * Job handler class register
 * Context: Queue
 *
 * @param {ITask} task
 * @param {IJobInstance} job
 * @return {void}
 *
 * @api private
 */
export function registerJobs(): void {
  if (Queue.isRegistered) return;

  const jobs: IJob[] = Queue.jobs || [];

  jobs.forEach((job) => {
    const funcStr = job.handler.toString();
    const [, name] = funcStr.match(/function\s([a-zA-Z_]+).*?/);
    if (name) this.container.bind(name, job);
  });

  Queue.isRegistered = true;
}

/**
 * Check network and return queue avaibility status
 * Context: Queue
 *
 * @param {Boolean} status
 * @return {Boolean}
 *
 * @api private
 */
export function checkNetwork(status: boolean = navigator.onLine): boolean {
  const network = this.config.get('network');
  return !(!status && network);
}

/**
 * Remove network observer event
 * Context: Queue
 *
 * @param {Boolean} status
 * @return {void}
 *
 * @api private
 */
export function removeNetworkEvent(): void {
  if (typeof this.networkObserver === 'function') this.networkObserver();
}

/**
 * Queue controller via boolean value
 * Context: Queue
 *
 * @param {Boolean} status
 * @return {void}
 *
 * @api private
 */
export function queueCtrl(status: boolean): void {
  const channel = this.channels[this.currentChannel];
  if (status) {
    channel.forceStop();
    logProxy.call(this, 'queue.offline', 'offline');
  } else {
    setTimeout(channel.start.bind(this), 2000);
    logProxy.call(this, 'queue.online', 'online');
  }
}

/**
 * if network status true, create new network event
 * Context: Queue
 *
 * @param {Boolean} network
 * @return {void}
 *
 * @api private
 */
export function createNetworkEvent(network: boolean): void {
  if (network) this.networkObserver = watch(queueCtrl.bind(this));
}
