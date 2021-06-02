import _Object$values from '@babel/runtime-corejs2/core-js/object/values';
import _Promise from '@babel/runtime-corejs2/core-js/promise';
/* eslint import/no-cycle: "off" */

import Queue from './queue';
import Channel from './channel';
import StorageCapsule from './storage-capsule';
import { excludeSpecificTasks, hasMethod, isFunction } from './utils';
import {
  eventFiredLog,
  queueStoppedLog,
  workerRunninLog,
  queueEmptyLog,
  notFoundLog,
  workerDoneLog,
  workerFailedLog,
} from './console';

/* global Worker */
/* eslint no-underscore-dangle: [2, { "allow": ["_id"] }] */
/* eslint no-param-reassign: "error" */
/* eslint use-isnan: "error" */

/**
 * Task priority controller helper
 * Context: Channel
 *
 * @return {ITask}
 * @param {ITask} task
 *
 * @api private
 */
export function checkPriority(task) {
  task.priority = task.priority || 0;

  if (typeof task.priority !== 'number') task.priority = 0;

  return task;
}

/**
 * Shortens function the db belongsto current channel
 * Context: Channel
 *
 * @return {StorageCapsule}
 *
 * @api private
 */
export function db() {
  return this.storage.channel(this.name());
}

/**
 * Get unfreezed tasks by the filter function
 * Context: Channel
 *
 * @return {ITask}
 *
 * @api private
 */
export async function getTasksWithoutFreezed() {
  return (await db.call(this).all()).filter(
    excludeSpecificTasks.bind(['freezed'])
  );
}

/**
 * Log proxy helper
 * Context: Channel
 *
 * @return {void}
 * @param {string} key
 * @param {string} data
 * @param {boolean} cond
 *
 * @api private
 */
export function logProxy(wrapperFunc, ...args) {
  if (this.config.get('debug') && typeof wrapperFunc === 'function') {
    wrapperFunc(args);
  }
}

/**
 * New task save helper
 * Context: Channel
 *
 * @param {ITask} task
 * @return {string|boolean}
 *
 * @api private
 */
export async function saveTask(task) {
  const result = await db.call(this).save(checkPriority(task));
  return result;
}

/**
 * Task remove helper
 * Context: Channel
 *
 * @param {string} id
 * @return {boolean}
 *
 * @api private
 */
export async function removeTask(id) {
  const result = await db.call(this).delete(id);
  return result;
}

/**
 * Events dispatcher helper
 * Context: Channel
 *
 * @param {ITask} task
 * @param {string} type
 * @return {void}
 *
 * @api private
 */
export function dispatchEvents(task, type) {
  if (!('tag' in task)) return false;

  const events = [
    [`${task.tag}:${type}`, 'fired'],
    [`${task.tag}:*`, 'wildcard-fired'],
  ];

  events.forEach((e) => {
    this.event.emit(e[0], task);
    logProxy.call(this, eventFiredLog, ...e);
  });

  return true;
}

/**
 * Queue stopper helper
 * Context: Channel
 *
 * @return {void}
 *
 * @api private
 */
export function stopQueue() {
  this.stop();

  this.running = false;

  clearTimeout(this.currentTimeout);

  logProxy.call(this, queueStoppedLog, 'stop');
}

/**
 * Failed job handler
 * Context: Channel
 *
 * @param {ITask} task
 * @return {ITask} job
 * @return {Function}
 *
 * @api private
 */
export async function failedJobHandler(task) {
  return async function childFailedHandler() {
    removeTask.call(this, task._id);

    this.event.emit('error', task);

    logProxy.call(this, workerFailedLog);

    /* istanbul ignore next */
    await this.next();
  };
}

/**
 * Helper of the lock task of the current job
 * Context: Channel
 *
 * @param {ITask} task
 * @return {boolean}
 *
 * @api private
 */
export async function lockTask(task) {
  const result = await db.call(this).update(task._id, { locked: true });
  return result;
}

/**
 * Class event luancher helper
 * Context: Channel
 *
 * @param {string} name
 * @param {IWorker} worker
 * @param {any} args
 * @return {boolean|void}
 *
 * @api private
 */
export function fireJobInlineEvent(name, worker, args) {
  if (hasMethod(worker, name) && isFunction(worker[name])) {
    worker[name].call(worker, args);
    return true;
  }
  return false;
}

/**
 * Process handler of succeeded job
 * Context: Channel
 *
 * @param {ITask} task
 * @return {void}
 *
 * @api private
 */
export function successProcess(task) {
  removeTask.call(this, task._id);
}

/**
 * Update task's retry value
 * Context: Channel
 *
 * @param {ITask} task
 * @param {IWorker} worker
 * @return {ITask}
 *
 * @api private
 */
export function updateRetry(task, worker) {
  if (!('retry' in worker)) worker.retry = 1;

  if (!('tried' in task)) {
    task.tried = 0;
    task.retry = worker.retry;
  }

  task.tried += 1;

  if (task.tried >= worker.retry) {
    task.freezed = true;
  }

  return task;
}

/**
 * Process handler of retried job
 * Context: Channel
 *
 * @param {ITask} task
 * @param {IWorker} worker
 * @return {boolean}
 *
 * @api private
 */
export async function retryProcess(task, worker) {
  // dispacth custom retry event
  dispatchEvents.call(this, task, 'retry');

  // update retry value
  const updateTask = updateRetry.call(this, task, worker);

  // delete lock property for next process
  updateTask.locked = false;

  const result = await db.call(this).update(task._id, updateTask);

  return result;
}

/**
 * Succeed job handler
 * Context: Channel
 *
 * @param {ITask} task
 * @param {IWorker} worker
 * @return {Function}
 *
 * @api private
 */
export async function successJobHandler(task, worker) {
  const self = this;
  return async function childSuccessJobHandler(result) {
    // dispatch job process after runs a task but only non error jobs
    if (result) {
      // go ahead to success process
      successProcess.call(self, task);
    } else {
      // go ahead to retry process
      await retryProcess.call(self, task, worker);
    }

    // fire job after event
    fireJobInlineEvent.call(self, 'after', worker, task.args);

    // dispacth custom after event
    dispatchEvents.call(self, task, 'after');

    // show console
    logProxy.call(self, workerDoneLog, result, task, worker);

    // try next queue job
    await self.next();
  };
}

/**
 * Job handler helper
 * Context: Channel
 *
 * @param {ITask} task
 * @param {IJob} worker
 * @param {IWorker} workerInstance
 * @return {Function}
 *
 * @api private
 */
export /* istanbul ignore next */ function loopHandler(
  task,
  worker,
  workerInstance
) {
  return async function childLoopHandler() {
    let workerPromise;
    const self = this;

    // lock the current task for prevent race condition
    await lockTask.call(self, task);

    // fire job before event
    fireJobInlineEvent.call(this, 'before', workerInstance, task.args);

    // dispacth custom before event
    dispatchEvents.call(this, task, 'before');

    // if has any dependency in dependencies, get it
    const deps = Queue.workerDeps[task.handler];

    // preparing worker dependencies
    const dependencies = _Object$values(deps || {});

    // show console
    logProxy.call(
      this,
      workerRunninLog,
      worker,
      workerInstance,
      task,
      self.name(),
      Queue.workerDeps
    );

    // Check worker instance and route the process via instance
    if (workerInstance instanceof Worker) {
      // start the native worker by passing task parameters and dependencies.
      // Note: Native worker parameters can not be class or function.
      workerInstance.postMessage({ args: task.args, dependencies });

      // Wrap the worker with promise class.
      workerPromise = new _Promise((resolve) => {
        // Set function to worker onmessage event for handle the repsonse of worker.
        workerInstance.onmessage = (response) => {
          resolve(worker.handler(response));

          // Terminate browser worker.
          workerInstance.terminate();
        };
      });
    } else {
      // This is custom worker class.
      // Call the handle function in worker and get promise instance.
      workerPromise = workerInstance.handle.call(
        workerInstance,
        task.args,
        ...dependencies
      );
    }

    workerPromise
      // Handle worker return process.
      .then(
        (await successJobHandler.call(self, task, workerInstance)).bind(self)
      )
      // Handle errors in worker while it was running.
      .catch((await failedJobHandler.call(self, task)).bind(self));
  };
}

/**
 * Timeout creator helper
 * Context: Channel
 *
 * @return {number}
 *
 * @api private
 */
export async function createTimeout() {
  // if running any job, stop it
  // the purpose here is to prevent cocurrent operation in same channel
  clearTimeout(this.currentTimeout);

  // Get next task
  const task = (await db.call(this).fetch()).shift();

  if (task === undefined) {
    logProxy.call(this, queueEmptyLog, this.name());
    this.event.emit('completed', task);
    return 0;
  }

  if (!Queue.worker.has(task.handler)) {
    logProxy.call(this, notFoundLog, task.handler);
    await (await failedJobHandler.call(this, task)).call(this);
    return 0;
  }

  // Get worker with handler name
  const JobWorker = Queue.worker.get(task.handler);

  // Create a worker instance
  const workerInstance =
    typeof JobWorker === 'object' ? new Worker(JobWorker.uri) : new JobWorker();

  // get always last updated config value
  const timeout = this.config.get('timeout');

  // create a array with handler parameters for shorten line numbers
  const params = [task, JobWorker, workerInstance];

  // Get handler function for handle on completed event
  const handler = (await loopHandler.call(this, ...params)).bind(this);

  // create new timeout for process a job in queue
  // binding loopHandler function to setTimeout
  // then return the timeout instance
  this.currentTimeout = setTimeout(handler, timeout);

  return this.currentTimeout;
}

/**
 * Set the status to false of queue
 * Context: Channel
 *
 * @return {void}
 *
 * @api private
 */
export function statusOff() {
  this.running = false;
}

/**
 * Checks whether a task is replicable or not
 * Context: Channel
 *
 * @param {ITask} task
 * @return {boolean}
 *
 * @api private
 */
export async function canMultiple(task) {
  if (typeof task !== 'object' || task.unique !== true) return true;
  return (await this.hasByTag(task.tag)) === false;
}
