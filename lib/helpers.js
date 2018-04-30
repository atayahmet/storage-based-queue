import Queue from './queue';
import Channel from './channel';
import { excludeSpecificTasks, log, hasMethod, isFunction } from './utils';
import StorageCapsule from './storage-capsule';

function _asyncToGenerator(fn) {
  return function () {
    const gen = fn.apply(this, arguments);
    return new Promise((resolve, reject) => {
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
    });
  };
}

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
 * Context: Channel
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
 * Context: Channel
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
 * Context: Channel
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

  const events = [[`${task.tag}:${type}`, 'fired'], [`${task.tag}:*`, 'wildcard-fired']];

  events.forEach((e) => {
    this.event.emit(e[0], task);
    logProxy.call(this, `event.${e[1]}`, e[0]);
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

  clearTimeout(this.currentTimeout);

  logProxy.call(this, 'queue.stopped', 'stop');
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
export const failedJobHandler = (() => {
  const _ref4 = _asyncToGenerator(function* (task) {
    return (() => {
      const _ref5 = _asyncToGenerator(function* () {
        removeTask.call(this, task._id);

        this.event.emit('error', task);

        /* istanbul ignore next */
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
 * Context: Channel
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
export const retryProcess = (() => {
  const _ref7 = _asyncToGenerator(function* (task, worker) {
    // dispacth custom retry event
    dispatchEvents.call(this, task, 'retry');

    // update retry value
    const updateTask = updateRetry.call(this, task, worker);

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
 * Succeed job handler
 * Context: Channel
 *
 * @param {ITask} task
 * @param {IWorker} worker
 * @return {Function}
 *
 * @api private
 */
export const successJobHandler = (() => {
  const _ref8 = _asyncToGenerator(function* (task, worker) {
    const self = this;
    return (() => {
      const _ref9 = _asyncToGenerator(function* (result) {
        // dispatch job process after runs a task but only non error jobs
        if (result) {
          // go ahead to success process
          successProcess.call(self, task);
        } else {
          // go ahead to retry process
          retryProcess.call(self, task, worker);
        }

        // fire job after event
        fireJobInlineEvent.call(self, 'after', worker, task.args);

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
 * Context: Channel
 *
 * @param {ITask} task
 * @param {IJob} worker
 * @param {IWorker} workerInstance
 * @return {Function}
 *
 * @api private
 */

export /* istanbul ignore next */ function loopHandler(task, worker, workerInstance) {
  return (() => {
    const _ref10 = _asyncToGenerator(function* () {
      const self = this;

      // lock the current task for prevent race condition
      yield lockTask.call(self, task);

      // fire job before event
      fireJobInlineEvent.call(this, 'before', workerInstance, task.args);

      // dispacth custom before event
      dispatchEvents.call(this, task, 'before');

      const deps = Queue.workerDeps[worker.name];

      // preparing worker dependencies
      const dependencies = Object.values(deps || {});

      // Task runner promise
      workerInstance.handle
        .call(workerInstance, task.args, ...dependencies)
        .then((yield successJobHandler.call(self, task, workerInstance)).bind(self))
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
 * Context: Channel
 *
 * @return {number}""
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
      yield (yield failedJobHandler.call(this, task)).call(this);
      return 1;
    }

    // Get worker with handler name
    const JobWorker = this.container.get(task.handler);

    // Create a worker instance
    const workerInstance = new JobWorker();

    // get always last updated config value
    const timeout = this.config.get('timeout');

    // create a array with handler parameters for shorten line numbers
    const params = [task, JobWorker, workerInstance];

    // Get handler function for handle on completed event
    const handler = (yield loopHandler.call(this, ...params)).bind(this);

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
export const canMultiple = (() => {
  const _ref12 = _asyncToGenerator(function* (task) {
    if (typeof task !== 'object' || task.unique !== true) return true;
    return (yield this.hasByTag(task.tag)) === false;
  });
  return function canMultiple(_x10) {
    return _ref12.apply(this, arguments);
  };
})();

/**
 * Job handler class register
 * Context: Channel
 *
 * @param {ITask} task
 * @param {IWorker} worker
 * @return {void}
 *
 * @api private
 */
export function registerWorkers() {
  if (Queue.isRegistered) return false;

  const workers = Queue.queueWorkers || {};

  this.container.merge(workers);

  Queue.isRegistered = true;

  return true;
}
