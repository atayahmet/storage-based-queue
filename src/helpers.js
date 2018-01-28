/* @flow */
import Queue from './queue';
import { excludeSpecificTasks, log, hasMethod, isFunction } from './utils';
import StorageCapsule from './storage-capsule';
import type ITask from '../interfaces/task';
import type IJob from '../interfaces/job';
import type IJobInstance from '../interfaces/job';

/**
 * Get unfreezed tasks by the filter function
 * Context: Queue
 *
 * @return {ITask}
 *
 * @api private
 */
export function getTasksWithoutFreezed(): ITask {
  return db
    .call(this)
    .all()
    .filter(excludeSpecificTasks.bind(["freezed"]));
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
  return (this:any).storage.channel((this:any).currentChannel);
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
export function logProxy(key: string, data: string, cond: boolean = true): void {
  log.call(
    // debug mode status
    (this:any).config.get('debug'),

    // log arguments
    ...arguments
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
export function saveTask(task: ITask): string | boolean {
  return db.call(this).save(checkPriority(task));
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
export function removeTask(id: string): boolean {
  return db.call(this).delete(id);
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
export function dispatchEvents(task: ITask, type: string): boolean|void {
  if (! ("tag" in task)) return false;
  const events = [
    [`${task.tag}:${type}`, 'fired'],
    [`${task.tag}:*`, 'wildcard-fired']
  ];

  for (const event of events) {
    this.event.emit(event[0], task);
    logProxy.call((this:any), `event.${event[1]}`, event[0]);
  }
}

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

  if (isNaN(task.priority)) task.priority = 0;

  return task;
}

/**
 * Timeout creator helper
 * Context: Queue
 *
 * @return {number}
 *
 * @api private
 */
export function createTimeout(): number {
  // if running any job, stop it
  // the purpose here is to prevent cocurrent operation in same channel
  clearTimeout(this.currentTimeout);

  const task: ITask = db.call(this).fetch().shift();

  if (task === undefined) {
    logProxy.call(this, 'queue.empty', this.currentChannel);
    stopQueue.call(this);
    return 1;
  }

  if (! this.container.has(task.handler)) {
    logProxy.call(this, 'queue.not-found', task.handler);
    failedJobHandler.call(this, task).call();
    return 1;
  }

  const job: IJob = this.container.get(task.handler);
  const jobInstance: IJobInstance = new job.handler();

  // get always last updated config value
  const timeout: number = jobInstance.timeout || this.config.get("timeout");

  const handler: Function = loopHandler.call(this, task, job, jobInstance).bind(this);

  // create new timeout for process a job in queue
  // binding loopHandler function to setTimeout
  // then return the timeout instance
  return (this.currentTimeout = setTimeout(handler, timeout));
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
  return (): void => {
    const self: Queue = this;

    // lock the current task for prevent race condition
    lockTask.call(self, task);

    // fire job before event
    fireJobInlineEvent.call(this, "before", jobInstance, task.args);

    // dispacth custom before event
    dispatchEvents.call(this, task, "before");

    // preparing worker dependencies
    const dependencies = Object.values(job.deps || {});

    // Task runner promise
    jobInstance.handle
      .call(jobInstance, task.args, ...dependencies)
      .then(successJobHandler.call(self, task, jobInstance).bind(self))
      .catch(failedJobHandler.call(self, task, jobInstance).bind(self));
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
export function lockTask(task: ITask): boolean {
  return db.call(this).update(task._id, { locked: true });
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
export function fireJobInlineEvent(name: string, job: IJobInstance, args: any): boolean|void {
  if (!hasMethod(job, name)) return false;

  if (name == "before" && isFunction(job.before)) {
    job.before.call(job, args);
  } else if (name == "after" && isFunction(job.after)) {
    job.after.call(job, args);
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
export function successJobHandler(task: ITask, job: IJobInstance): Function {
  const self: Queue = this;
  return function(result: boolean): void {
    // dispatch job process after runs a task but only non error jobs
    dispatchProcess.call(self, result, task, job);

    // fire job after event
    fireJobInlineEvent.call(self, "after", job, task.args);

    // dispacth custom after event
    dispatchEvents.call(self, task, "after");

    // try next queue job
    self.next();
  };
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
export function failedJobHandler(task: ITask, job?: IJobInstance): Function {
  return (result: boolean): void => {
    removeTask.call(this, task._id);

    this.event.emit("error", task);

    this.next();
  };
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
    successProcess.call(self, task, job);
  } else {
    retryProcess.call(self, task, job);
  }
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
export function successProcess(task: ITask, job: IJobInstance): void {
  removeTask.call(this, task._id);
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
 * Process handler of retried job
 * Context: Queue
 *
 * @param {ITask} task
 * @param {IJobInstance} job
 * @return {boolean}
 *
 * @api private
 */
export function retryProcess(task: ITask, job: IJobInstance): boolean {
  // dispacth custom retry event
  dispatchEvents.call(this, task, "retry");

  // update retry value
  let updateTask: ITask = updateRetry.call(this, task, job);

  // delete lock property for next process
  updateTask.locked = false;

  return db.call(this).update(task._id, updateTask);
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
export function canMultiple(task: ITask): boolean {
  if (typeof task !== "object" || task.unique !== true) return true;

  return this.hasByTag(task.tag) < 1;
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
  if (!("retry" in job)) job.retry = 1;

  if (!("tried" in task)) {
    task.tried = 0;
    task.retry = job.retry;
  }

  ++task.tried;

  if (task.tried >= job.retry) {
    task.freezed = true;
  }

  return task;
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

  for (const job of jobs) {
    const funcStr = job.handler.toString();
    const [strFunction, name] = funcStr.match(/function\s([a-zA-Z_]+).*?/);
    if (name) this.container.bind(name, job);
  }

  Queue.isRegistered = true;
}
