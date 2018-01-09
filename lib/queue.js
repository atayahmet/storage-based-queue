



import Container from "./container";
import StorageCapsule from "./storage-capsule";
import Config from "./config";
import Event from "./event";

import {
log,
clone,
hasMethod,
isFunction,
excludeSpecificTasks,
utilClearByTag } from
"./utils";
import LocalStorage from "./storage/localstorage";









let Queue = (() => {
  "use strict";

  Queue.FIFO = "fifo";
  Queue.LIFO = "lifo";

  function Queue(config) {
    _constructor.call(this, config);
  }

  function _constructor(config) {
    this.currentChannel;
    this.currentTimeout;
    this.stopped = true;
    this.running = false;
    this.channels = {};
    this.config = new Config(config);
    this.storage = new StorageCapsule(
    this.config,
    new LocalStorage(this.config));

    this.event = new Event();
    this.container = new Container();
    this.timeout = this.config.get("timeout");
  }

  Queue.prototype.add = function (task) {
    if (!canMultiple.call(this, task)) return false;

    const id = saveTask.call(this, task);

    if (id && this.stopped && this.running === true) {
      this.start();
    }

    // pass activity to the log service.
    logProxy.call(this, 'queue.created', task.handler);

    return id;
  };

  Queue.prototype.next = function () {
    if (this.stopped) {
      statusOff.call(this);
      return stopQueue.call(this);
    }

    logProxy.call(this, 'queue.next', 'next');

    this.start();
  };

  Queue.prototype.start = function () {
    // Stop the queue for restart
    this.stopped = false;

    // Register tasks, if not registered
    registerJobs.call(this);

    // Create a timeout for start queue
    this.running = createTimeout.call(this) > 0;

    logProxy.call(this, 'queue.starting', 'start');

    return this.running;
  };

  Queue.prototype.stop = function () {
    logProxy.call(this, 'queue.stopping', 'stop');
    this.stopped = true;
  };

  Queue.prototype.forceStop = function () {
    stopQueue.call(this);
  };

  Queue.prototype.create = function (channel) {
    if (!(channel in this.channels)) {
      this.currentChannel = channel;
      this.channels[channel] = clone(this);
    }

    return this.channels[channel];
  };

  Queue.prototype.channel = function (name) {
    if (!this.channels[name]) {
      throw new Error(`Channel of "${name}" not found`);
    }

    return this.channels[name];
  };

  Queue.prototype.isEmpty = function () {
    return this.count() < 1;
  };

  Queue.prototype.count = function () {
    return getTasksWithoutFreezed.call(this).length;
  };

  Queue.prototype.countByTag = function (tag) {
    return getTasksWithoutFreezed.call(this).filter(t => t.tag === tag).length;
  };

  Queue.prototype.clear = function () {
    if (!this.currentChannel) return false;
    this.storage.clear(this.currentChannel);
    return true;
  };

  Queue.prototype.clearByTag = function (tag) {
    db.
    call(this).
    all().
    filter(utilClearByTag.bind(tag)).
    forEach(t => db.call(this).delete(t._id));
  };

  Queue.prototype.has = function (id) {
    return getTasksWithoutFreezed.call(this).findIndex(t => t._id === id) > -1;
  };

  Queue.prototype.hasByTag = function (tag) {
    return getTasksWithoutFreezed.call(this).findIndex(t => t.tag === tag) > -1;
  };

  Queue.prototype.setTimeout = function (val) {
    this.timeout = val;
    this.config.set("timeout", val);
  };

  Queue.prototype.setLimit = function (val) {
    this.config.set("limit", val);
  };

  Queue.prototype.setPrefix = function (val) {
    this.config.set("prefix", val);
  };

  Queue.prototype.setPrinciple = function (val) {
    this.config.set("principle", val);
  };

  Queue.prototype.setDebug = function (val) {
    this.config.set("debug", val);
  };

  Queue.prototype.on = function (key, cb) {
    this.event.on(...arguments);
    logProxy.call(this, 'event.created', key);
  };

  Queue.register = function (jobs) {
    if (!(jobs instanceof Array)) {
      throw new Error("Queue jobs should be objects within an array");
    }

    Queue.isRegistered = false;
    Queue.jobs = jobs;
  };

  function logProxy(key, data, cond) {
    log.call(
    // debug mode status
    this.config.get('debug'),

    // log arguments
    ...arguments);

  }

  function getTasksWithoutFreezed() {
    return db.
    call(this).
    all().
    filter(excludeSpecificTasks.bind(["freezed"]));
  }

  function dispatchEvents(task, type) {
    if ("tag" in task) {
      const events = [
      [`${task.tag}:${type}`, 'fired'],
      [`${task.tag}:*`, 'wildcard-fired']];


      for (const event of events) {
        this.event.emit(event[0], task);
        logProxy.call(this, `event.${event[1]}`, event[0]);
      }
    }
  }

  function db() {
    return this.storage.channel(this.currentChannel);
  }

  function saveTask(task) {
    return db.call(this).save(task);
  }

  function saveTask(task) {
    return db.call(this).save(checkPriority(task));
  }

  function checkPriority(task) {
    task.priority = task.priority || 0;

    if (isNaN(task.priority)) task.priority = 0;

    return task;
  }

  function createTimeout() {
    // if running any job, stop it
    // the purpose here is to prevent cocurrent operation in same channel
    clearTimeout(this.currentTimeout);

    // get always last updated config value
    const timeout = this.config.get("timeout");

    // create new timeout for process a job in queue
    // binding loopHandler function to setTimeout
    // then return the timeout instance
    return this.currentTimeout = setTimeout(loopHandler.bind(this), timeout);
  }

  function lockTask(task) {
    return db.call(this).update(task._id, { locked: true });
  }

  function removeTask(id) {
    return db.call(this).delete(id);
  }

  function loopHandler() {
    const self = this;
    const task = db.
    call(self).
    fetch().
    shift();

    if (task === undefined) {
      stopQueue.call(this);
      logProxy.call(this, 'queue.empty', this.currentChannel);
      return;
    }

    if (!self.container.has(task.handler)) {
      logProxy.call(this, 'queue.not-found', task.handler);
      failedJobHandler.call(this, task).call();
      return;
    }

    const job = self.container.get(task.handler);
    const jobInstance = new job.handler();

    // lock the current task for prevent race condition
    lockTask.call(self, task);

    // fire job before event
    fireJobInlineEvent.call(this, "before", jobInstance, task.args);

    // dispacth custom before event
    dispatchEvents.call(this, task, "before");

    // preparing worker dependencies
    const dependencies = Object.values(job.deps || {});

    // Task runner promise
    jobInstance.handle.
    call(jobInstance, task.args, ...dependencies).
    then(successJobHandler.call(self, task, jobInstance).bind(self)).
    catch(failedJobHandler.call(self, task, jobInstance).bind(self));
  }

  function successJobHandler(task, job) {
    const self = this;
    return function (result) {
      if (result) {
        successProcess.call(self, task, job);
      } else {
        retryProcess.call(self, task, job);
      }

      // fire job after event
      fireJobInlineEvent.call(this, "after", job, task.args);

      // dispacth custom after event
      dispatchEvents.call(this, task, "after");

      // try next queue job
      self.next();
    };
  }

  function failedJobHandler(task, job) {
    return result => {
      removeTask.call(this, task._id);

      this.event.emit("error", task);

      this.next();
    };
  }

  function fireJobInlineEvent(name, job, args) {
    if (!hasMethod(job, name)) return;

    if (name == "before" && isFunction(job.before)) {
      job.before.call(job, args);
    } else if (name == "after" && isFunction(job.after)) {
      job.after.call(job, args);
    }
  }

  function statusOff() {
    this.running = false;
  }

  function stopQueue() {
    this.stop();

    clearTimeout(this.currentTimeout);

    logProxy.call(this, 'queue.stopped', 'stop');
  }

  function successProcess(task, job) {
    removeTask.call(this, task._id);
  }

  function retryProcess(task, job) {
    // dispacth custom retry event
    dispatchEvents.call(this, task, "retry");

    // update retry value
    let updateTask = updateRetry.call(this, task, job);

    // delete lock property for next process
    updateTask.locked = false;

    return db.call(this).update(task._id, updateTask);
  }

  function canMultiple(task) {
    if (typeof task !== "object" || task.unique !== true) return true;

    return this.hasByTag(task.tag) < 1;
  }

  function updateRetry(task, job) {
    if (!("retry" in job)) {
      job.retry = 1;
    }

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

  function registerJobs() {
    if (Queue.isRegistered) return;

    const jobs = Queue.jobs || [];

    for (const job of jobs) {
      const funcStr = job.handler.toString();
      const [strFunction, name] = funcStr.match(/function\s([a-zA-Z_]+).*?/);
      if (name) this.container.bind(name, job);
    }

    Queue.isRegistered = true;
  }

  return Queue;
})();

export default Queue;

