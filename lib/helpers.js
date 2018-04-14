function _asyncToGenerator(fn) {
  return function () {
    const gen = fn.apply(this, arguments);
    return new Promise(((resolve, reject) => {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }
        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(
            (value) => {
              step('next', value);
            },
            (err) => {
              step('throw', err);
            },
          );
        }
      }
      return step('next');
    }));
  };
}
import { watch } from 'is-offline';
import Queue from './queue';
import { excludeSpecificTasks, log, hasMethod, isFunction } from './utils';
import StorageCapsule from './storage-capsule';

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
export function checkPriority(task) {
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
export function db() {
  return this.storage.channel(this.currentChannel);
}

/**
 * Get unfreezed tasks by the filter function
 * Context: Queue
 *
 * @return {ITask}
 *
 * @api private
 */
export const getTasksWithoutFreezed = (() => {
  const _ref = _asyncToGenerator(function* () {
    return (yield db.call(this).all()).filter(excludeSpecificTasks.bind(['freezed']));
  });
  return function getTasksWithoutFreezed() {
    return _ref.apply(this, arguments);
  };
})();

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
export function logProxy() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  log.call(
    // debug mode status
    this.config.get('debug'),

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
export const saveTask = (() => {
  const _ref2 = _asyncToGenerator(function* (task) {
    const result = yield db.call(this).save(checkPriority(task));
    return result;
  });
  return function saveTask(_x) {
    return _ref2.apply(this, arguments);
  };
})();

/**
 * Task remove helper
 * Context: Queue
 *
 * @param {string} id
 * @return {boolean}
 *
 * @api private
 */
export const removeTask = (() => {
  const _ref3 = _asyncToGenerator(function* (id) {
    const result = yield db.call(this).delete(id);
    return result;
  });
  return function removeTask(_x2) {
    return _ref3.apply(this, arguments);
  };
})();

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
export function dispatchEvents(task, type) {
  if (!('tag' in task)) return false;

  const events = [[`${task.tag}:${type}`, 'fired'], [`${task.tag}:*`, 'wildcard-fired']];

  events.forEach((e) => {
    this.event.emit(e[0], task);
    logProxy.call(this, `event.${e[1]}`, e[0]);
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
export function stopQueue() {
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
export const failedJobHandler = (() => {
  const _ref4 = _asyncToGenerator(function* (task) {
    return (() => {
      const _ref5 = _asyncToGenerator(function* () {
        removeTask.call(this, task._id);

        this.event.emit('error', task);

        yield this.next();
      });
      function childFailedHandler() {
        return _ref5.apply(this, arguments);
      }
      return childFailedHandler;
    })();
  });
  return function failedJobHandler(_x3) {
    return _ref4.apply(this, arguments);
  };
})();

/**
 * Helper of the lock task of the current job
 * Context: Queue
 *
 * @param {ITask} task
 * @return {boolean}
 *
 * @api private
 */
export const lockTask = (() => {
  const _ref6 = _asyncToGenerator(function* (task) {
    const result = yield db.call(this).update(task._id, { locked: true });
    return result;
  });
  return function lockTask(_x4) {
    return _ref6.apply(this, arguments);
  };
})();

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
export function fireJobInlineEvent(name, job, args) {
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
export function successProcess(task) {
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
export function updateRetry(task, job) {
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
export const retryProcess = (() => {
  const _ref7 = _asyncToGenerator(function* (task, job) {
    // dispacth custom retry event
    dispatchEvents.call(this, task, 'retry');

    // update retry value
    const updateTask = updateRetry.call(this, task, job);

    // delete lock property for next process
    updateTask.locked = false;

    const result = yield db.call(this).update(task._id, updateTask);

    return result;
  });
  return function retryProcess(_x5, _x6) {
    return _ref7.apply(this, arguments);
  };
})();

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
export function dispatchProcess(result, task, job) {
  const self = this;
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
export const successJobHandler = (() => {
  const _ref8 = _asyncToGenerator(function* (task, job) {
    const self = this;
    return (() => {
      const _ref9 = _asyncToGenerator(function* (result) {
        // dispatch job process after runs a task but only non error jobs
        dispatchProcess.call(self, result, task, job);

        // fire job after event
        fireJobInlineEvent.call(self, 'after', job, task.args);

        // dispacth custom after event
        dispatchEvents.call(self, task, 'after');

        // try next queue job
        yield self.next();
      });
      function childSuccessJobHandler(_x9) {
        return _ref9.apply(this, arguments);
      }
      return childSuccessJobHandler;
    })();
  });
  return function successJobHandler(_x7, _x8) {
    return _ref8.apply(this, arguments);
  };
})();

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
export function loopHandler(task, job, jobInstance) {
  return (() => {
    const _ref10 = _asyncToGenerator(function* () {
      const self = this;

      // lock the current task for prevent race condition
      yield lockTask.call(self, task);

      // fire job before event
      fireJobInlineEvent.call(this, 'before', jobInstance, task.args);

      // dispacth custom before event
      dispatchEvents.call(this, task, 'before');

      // preparing worker dependencies
      const dependencies = Object.values(job.deps || {});

      // Task runner promise
      jobInstance.handle
        .call(jobInstance, task.args, ...dependencies)
        .then((yield successJobHandler.call(self, task, jobInstance)).bind(self))
        .catch((yield failedJobHandler.call(self, task)).bind(self));
    });
    function childLoopHandler() {
      return _ref10.apply(this, arguments);
    }
    return childLoopHandler;
  })();
}

/**
 * Timeout creator helper
 * Context: Queue
 *
 * @return {number}
 *
 * @api private
 */
export const createTimeout = (() => {
  const _ref11 = _asyncToGenerator(function* () {
    // if running any job, stop it
    // the purpose here is to prevent cocurrent operation in same channel
    clearTimeout(this.currentTimeout);

    // Get next task
    const task = (yield db.call(this).fetch()).shift();

    if (task === undefined) {
      logProxy.call(this, 'queue.empty', this.currentChannel);
      stopQueue.call(this);
      return 1;
    }

    if (!this.container.has(task.handler)) {
      logProxy.call(this, 'queue.not-found', task.handler);
      yield (yield failedJobHandler.call(this, task)).call();
      return 1;
    }

    // Get worker with handler name
    const job = this.container.get(task.handler);

    // Set fresh worker name avoid to eslint errors
    const JobWorker = job.handler;

    // Create a worker instance
    const jobInstance = new JobWorker();

    // get always last updated config value
    const timeout = jobInstance.timeout || this.config.get('timeout');

    // Get handler function for handle on completed event
    const handler = (yield loopHandler.call(this, task, job, jobInstance)).bind(this);

    // create new timeout for process a job in queue
    // binding loopHandler function to setTimeout
    // then return the timeout instance
    this.currentTimeout = setTimeout(handler, timeout);

    return this.currentTimeout;
  });
  return function createTimeout() {
    return _ref11.apply(this, arguments);
  };
})();

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
export function statusOff() {
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
export const canMultiple = (() => {
  const _ref12 = _asyncToGenerator(function* (task) {
    if (typeof task !== 'object' || task.unique !== true) return true;

    return (yield this.hasByTag(task.tag)) < 1;
  });
  return function canMultiple(_x10) {
    return _ref12.apply(this, arguments);
  };
})();

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
export function registerJobs() {
  if (Queue.isRegistered) return;

  const jobs = Queue.jobs || [];

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
export function checkNetwork() {
  const status = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : navigator.onLine;
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
export function removeNetworkEvent() {
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
export function queueCtrl(status) {
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
export function createNetworkEvent(network) {
  if (network) this.networkObserver = watch(queueCtrl.bind(this));
}
