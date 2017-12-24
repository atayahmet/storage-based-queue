(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.default = {
  storage: 'localstorage',
  prefix: 'sq_jobs',
  timeout: 1000,
  limit: -1,
  principle: 'fifo' };

},{}],2:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();

var _config = require('./config.data');var _config2 = _interopRequireDefault(_config);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var

Config = function () {


  function Config() {var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};_classCallCheck(this, Config);this.config = _config2.default;
    this.merge(config);
  }_createClass(Config, [{ key: 'set', value: function set(

    name, value) {
      this.config[name] = value;
    } }, { key: 'get', value: function get(

    name) {
      return this.config[name];
    } }, { key: 'has', value: function has(

    name) {
      return Object.prototype.hasOwnProperty.call(this.config, name);
    } }, { key: 'merge', value: function merge(

    config) {
      this.config = Object.assign({}, this.config, config);
    } }, { key: 'remove', value: function remove(

    name) {
      return delete this.config[name];
    } }, { key: 'all', value: function all()

    {
      return this.config;
    } }]);return Config;}();exports.default = Config;

},{"./config.data":1}],3:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var


Container = function () {

  function Container() {_classCallCheck(this, Container);this.

    _container = {};}_createClass(Container, [{ key: 'has', value: function has(

    id) {
      return Object.prototype.hasOwnProperty.call(this._container, id);
    } }, { key: 'get', value: function get(

    id) {
      return this._container[id];
    } }, { key: 'all', value: function all()

    {
      return this._container;
    } }, { key: 'bind', value: function bind(

    id, value) {
      this._container[id] = value;
    } }, { key: 'remove', value: function remove(

    id) {
      if (Object.prototype.hasOwnProperty.call(this._container, id)) {
        delete this._container[id];
      }
    } }, { key: 'removeAll', value: function removeAll()

    {
      this._container = {};
    } }]);return Container;}();exports.default = Container;

},{}],4:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var Event = function () {





  function Event() {_classCallCheck(this, Event);this.store = {};this.verifierPattern = /^[a-z0-9\-\_]+\:before$|after$|retry$|\*$/;this.wildcards = ['*', 'error'];this.emptyFunc = function () {};
    this.store.before = {};
    this.store.after = {};
    this.store.retry = {};
    this.store.wildcard = {};
    this.store.error = this.emptyFunc;
    this.store['*'] = this.emptyFunc;
  }_createClass(Event, [{ key: 'on', value: function on(

    key, cb) {
      if (typeof cb !== 'function') throw new Error('Event should be an function');
      if (this.isValid(key)) this.add(key, cb);
    } }, { key: 'emit', value: function emit(

    key, args) {
      if (this.wildcards.indexOf(key) > -1) {
        this.wildcard.apply(this, [key].concat(Array.prototype.slice.call(arguments)));
      } else {
        var type = this.getType(key);
        var name = this.getName(key);

        if (this.store[type]) {
          var cb = this.store[type][name] || this.emptyFunc;
          cb.call(null, args);
        }
      }

      this.wildcard('*', key, args);
    } }, { key: 'wildcard', value: function wildcard(

    key, actionKey, args) {
      if (this.store.wildcard[key]) {
        this.store.wildcard[key].call(null, actionKey, args);
      }
    } }, { key: 'add', value: function add(

    key, cb) {
      if (this.wildcards.indexOf(key) > -1) {
        this.store.wildcard[key] = cb;
      } else {
        var type = this.getType(key);
        var name = this.getName(key);
        this.store[type][name] = cb;
      }
    } }, { key: 'has', value: function has(

    key) {
      try {
        var keys = key.split(':');
        return keys.length > 1 ? !!this.store[keys[1]][keys[0]] : !!this.store.wildcard[keys[0]];
      } catch (e) {
        return false;
      }
    } }, { key: 'getName', value: function getName(

    key) {
      return key.match(/(.*)\:.*/)[1];
    } }, { key: 'getType', value: function getType(

    key) {
      return key.match(/^[a-z0-9\-\_]+\:(.*)/)[1];
    } }, { key: 'isValid', value: function isValid(

    key) {
      return this.verifierPattern.test(key) || this.wildcards.indexOf(key) > -1;
    } }]);return Event;}();exports.default = Event;

},{}],5:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _queue = require('./queue');var _queue2 = _interopRequireDefault(_queue);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

window.Queue = _queue2.default;exports.default = _queue2.default;

},{"./queue":6}],6:[function(require,module,exports){
"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _slicedToArray = function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"]) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}();



var _container = require("./container");var _container2 = _interopRequireDefault(_container);
var _storageCapsule = require("./storage-capsule");var _storageCapsule2 = _interopRequireDefault(_storageCapsule);
var _config = require("./config");var _config2 = _interopRequireDefault(_config);
var _event2 = require("./event");var _event3 = _interopRequireDefault(_event2);
var _utils = require("./utils");






var _localstorage = require("./storage/localstorage");var _localstorage2 = _interopRequireDefault(_localstorage);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {arr2[i] = arr[i];}return arr2;} else {return Array.from(arr);}}









var Queue = function () {
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
    this.config = new _config2.default(config);
    this.storage = new _storageCapsule2.default(
    this.config,
    new _localstorage2.default(this.config));

    this.event = new _event3.default();
    this.container = new _container2.default();
    this.timeout = this.config.get("timeout");
  }

  Queue.prototype.add = function (task) {
    var id = saveTask.call(this, task);

    if (id && this.stopped && this.running === true) {
      this.start();
    }

    return id;
  };

  Queue.prototype.next = function () {
    if (this.stopped) {
      console.log("[stopped]-> next");
      statusOff.call(this);
      return stopQueue.call(this);
    }
    console.log("[next]->");
    this.start();
  };

  Queue.prototype.start = function () {
    // Stop the queue for restart
    this.stopped = false;

    // Register tasks, if not registered
    registerJobs.call(this);

    // Create a timeout for start queue
    this.running = createTimeout.call(this) > 0;
    console.log("[started]->", this.running);
    return this.running;
  };

  Queue.prototype.stop = function () {
    console.log("[stopping]->");
    this.stopped = true; //this.running;
  };

  Queue.prototype.forceStop = function () {
    console.log("[forceStopped]->");
    stopQueue.call(this);
  };

  Queue.prototype.create = function (channel) {
    if (!(channel in this.channels)) {
      this.currentChannel = channel;
      this.channels[channel] = (0, _utils.clone)(this);
    }

    return this.channels[channel];
  };

  Queue.prototype.channel = function (name) {
    if (!this.channels[name]) {
      throw new Error("Channel of \"" + name + "\" not found");
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
    return getTasksWithoutFreezed.call(this).filter(function (t) {return t.tag === tag;}).length;
  };

  Queue.prototype.clear = function () {
    if (this.currentChannel) {
      this.storage.clear(this.currentChannel);
    }
  };

  Queue.prototype.clearByTag = function (tag) {var _this = this;
    db.
    call(this).
    all().
    filter(_utils.utilClearByTag.bind(tag)).
    forEach(function (t) {return db.call(_this).delete(t._id);});
  };

  Queue.prototype.has = function (id) {
    return getTasksWithoutFreezed.call(this).findIndex(function (t) {return t._id === id;}) > -1;
  };

  Queue.prototype.hasByTag = function (tag) {
    return getTasksWithoutFreezed.call(this).findIndex(function (t) {return t.tag === tag;}) > -1;
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

  Queue.prototype.on = function (key, cb) {var _event;
    (_event = this.event).on.apply(_event, arguments);
  };

  Queue.prototype.error = function (cb) {
    this.event.on("error", cb);
  };

  Queue.register = function (jobs) {
    if (!(jobs instanceof Array)) {
      throw new Error("Queue jobs should be objects within an array");
    }

    Queue.isRegistered = false;
    Queue.jobs = jobs;
  };

  function getTasksWithoutFreezed() {
    return db.
    call(this).
    all().
    filter(_utils.excludeSpecificTasks.bind(["freezed"]));
  }

  function dispatchEvents(task, type) {
    if ("tag" in task) {
      this.event.emit(task.tag + ":" + type, task);
      this.event.emit(task.tag + ":*", task);
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
    var timeout = this.config.get("timeout");
    return this.currentTimeout = setTimeout(loopHandler.bind(this), timeout);
  }

  function lockTask(task) {
    return db.call(this).update(task._id, { locked: true });
  }

  function removeTask(id) {
    return db.call(this).delete(id);
  }

  function loopHandler() {var _jobInstance$handle;
    var self = this;
    var task = db.
    call(self).
    fetch().
    shift();

    if (task === undefined) {
      console.log("-> " + this.currentChannel + " channel is empty...");
      stopQueue.call(this);
      return;
    }

    if (!self.container.has(task.handler)) {
      console.warn(task.handler + "-> job not found");
    }

    var job = self.container.get(task.handler);
    var jobInstance = new job.handler();

    // lock the current task for prevent race condition
    lockTask.call(self, task);

    // fire job before event
    fireJobInlineEvent.call(this, "before", jobInstance, task.args);

    // dispacth custom before event
    dispatchEvents.call(this, task, "before");

    // preparing worker dependencies
    var dependencies = Object.values(job.deps || {});

    // Task runner promise
    (_jobInstance$handle = jobInstance.handle).
    call.apply(_jobInstance$handle, [jobInstance, task.args].concat(_toConsumableArray(dependencies))).
    then(jobResponse.call(self, task, jobInstance).bind(self)).
    catch(jobFailedResponse.call(self, task, jobInstance).bind(self));
  }

  function jobResponse(task, job) {
    var self = this;
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

  function jobFailedResponse(task, job) {var _this2 = this;
    return function (result) {
      removeTask.call(_this2, task._id);

      _this2.event.emit("error", task);

      _this2.next();
    };
  }

  function fireJobInlineEvent(
  name,
  job,
  args)
  {
    if (!(0, _utils.hasMethod)(job, name)) return;

    if (name == "before" && (0, _utils.isFunction)(job.before)) {
      job.before.call(job, args);
    } else if (name == "after" && (0, _utils.isFunction)(job.after)) {
      job.after.call(job, args);
    }
  }

  function statusOff() {
    this.running = false;
  }

  function stopQueue() {
    this.stop();

    if (this.currentTimeout) {
      // unset current timeout value
      this.currentTimeout = clearTimeout(this.currentTimeout);
    }
  }

  function successProcess(task, job) {
    removeTask.call(this, task._id);
  }

  function retryProcess(task, job) {
    // dispacth custom retry event
    dispatchEvents.call(this, task, "retry");

    // update retry value
    var updateTask = updateRetry.call(this, task, job);

    // delete lock property for next process
    updateTask.locked = false;

    return db.call(this).update(task._id, updateTask);
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

    var jobs = Queue.jobs || [];var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {

      for (var _iterator = jobs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var job = _step.value;
        var funcStr = job.handler.toString();var _funcStr$match =
        funcStr.match(/function\s([a-zA-Z_]+).*?/),_funcStr$match2 = _slicedToArray(_funcStr$match, 2),strFunction = _funcStr$match2[0],name = _funcStr$match2[1];
        if (name) this.container.bind(name, job);
      }} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator.return) {_iterator.return();}} finally {if (_didIteratorError) {throw _iteratorError;}}}

    Queue.isRegistered = true;
  }

  return Queue;
}();exports.default =

Queue;

},{"./config":2,"./container":3,"./event":4,"./storage-capsule":7,"./storage/localstorage":8,"./utils":9}],7:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();

var _groupBy = require('group-by');var _groupBy2 = _interopRequireDefault(_groupBy);
var _localstorage = require('./storage/localstorage');var _localstorage2 = _interopRequireDefault(_localstorage);



var _config = require('./config');var _config2 = _interopRequireDefault(_config);
var _utils = require('./utils');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var

StorageCapsule = function () {




  function StorageCapsule(config, storage) {_classCallCheck(this, StorageCapsule);
    this.storage = storage;
    this.config = config;
  }_createClass(StorageCapsule, [{ key: 'channel', value: function channel(

    name) {
      this.storageChannel = name;
      return this;
    } }, { key: 'fetch', value: function fetch()

    {var _this = this;
      var all = this.all().filter(_utils.excludeSpecificTasks);
      var tasks = (0, _groupBy2.default)(all, 'priority');
      return Object.
      keys(tasks).
      map(function (key) {return parseInt(key);}).
      sort(function (a, b) {return b - a;}).
      reduce(function (result, key) {
        if (_this.config.get('principle') === 'lifo') {
          return result.concat(tasks[key].sort(_utils.lifo));
        } else {
          return result.concat(tasks[key].sort(_utils.fifo));
        }
      }, []);
    } }, { key: 'save', value: function save(

    task) {
      try {
        // get all tasks current channel's
        var tasks = this.storage.get(this.storageChannel);

        // check channel limit.
        // if limit is exceeded, does not insert new task
        if (this.isExceeded()) {
          console.warn('Task limit exceeded: The \'' + this.storageChannel + '\' channel limit is ' + this.config.get('limit'));
          return false;
        }

        // prepare all properties before save
        // example: createdAt etc.
        task = this.prepareTask(task);

        // add task to storage
        tasks.push(task);

        // save tasks
        this.storage.set(this.storageChannel, JSON.stringify(tasks));

        return task._id;
      } catch (e) {
        return false;
      }
    } }, { key: 'update', value: function update(

    id, _update) {
      try {
        var data = this.all();
        var index = data.findIndex(function (t) {return t._id == id;});

        if (index < 0) return false;

        // merge existing object with given update object
        data[index] = Object.assign({}, data[index], _update);

        // save to the storage as string
        this.storage.set(this.storageChannel, JSON.stringify(data));

        return true;
      } catch (e) {
        return false;
      }
    } }, { key: 'delete', value: function _delete(

    id) {
      try {
        var data = this.all();
        var index = data.findIndex(function (d) {return d._id === id;});

        if (index < 0) return false;

        delete data[index];

        this.storage.set(this.storageChannel, JSON.stringify(data.filter(function (d) {return d;})));
        return true;
      } catch (e) {
        return false;
      }
    } }, { key: 'all', value: function all()

    {
      return this.storage.get(this.storageChannel);
    } }, { key: 'generateId', value: function generateId()

    {
      return ((1 + Math.random()) * 0x10000).toString(16);
    } }, { key: 'prepareTask', value: function prepareTask(

    task) {
      task.createdAt = Date.now();
      task._id = this.generateId();
      return task;
    } }, { key: 'isExceeded', value: function isExceeded()

    {
      var limit = this.config.get('limit');
      var tasks = this.all().filter(_utils.excludeSpecificTasks);
      return !(limit === -1 || limit > tasks.length);
    } }, { key: 'clear', value: function clear(

    channel) {
      this.storage.clear(channel);
    } }]);return StorageCapsule;}();exports.default = StorageCapsule;

},{"./config":2,"./storage/localstorage":8,"./utils":9,"group-by":11}],8:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var





LocalStorage = function () {



  function LocalStorage(config) {_classCallCheck(this, LocalStorage);
    this.storage = localStorage;
    this.config = config;
  }_createClass(LocalStorage, [{ key: 'get', value: function get(

    key) {
      try {
        var name = this.storageName(key);
        return this.has(name) ? JSON.parse(this.storage.getItem(name)) : [];
      } catch (e) {
        return [];
      }
    } }, { key: 'set', value: function set(

    key, value) {
      this.storage.setItem(this.storageName(key), value);
    } }, { key: 'has', value: function has(

    key) {
      return key in this.storage;
    } }, { key: 'clear', value: function clear(

    key) {
      this.storage.removeItem(this.storageName(key));
    } }, { key: 'clearAll', value: function clearAll()

    {
      this.storage.clear();
    } }, { key: 'storageName', value: function storageName(

    suffix) {
      return this.getPrefix() + '_' + suffix;
    } }, { key: 'getPrefix', value: function getPrefix()

    {
      return this.config.get('prefix');
    } }]);return LocalStorage;}();exports.default = LocalStorage;

},{}],9:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.


clone = clone;exports.





















hasProperty = hasProperty;exports.



hasMethod = hasMethod;exports.



isFunction = isFunction;exports.



excludeSpecificTasks = excludeSpecificTasks;exports.










utilClearByTag = utilClearByTag;exports.






fifo = fifo;exports.



lifo = lifo;function clone(obj) {var newClass = Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyNames(obj).reduce(function (props, name) {props[name] = Object.getOwnPropertyDescriptor(obj, name);return props;}, {}));if (!Object.isExtensible(obj)) {Object.preventExtensions(newClass);}if (Object.isSealed(obj)) {Object.seal(newClass);}if (Object.isFrozen(obj)) {Object.freeze(newClass);}return newClass;}function hasProperty(obj, name) {return Object.prototype.hasOwnProperty.call(obj, name);}function hasMethod(instance, method) {return instance instanceof Object && method in instance;}function isFunction(func) {return func instanceof Function;}function excludeSpecificTasks(task) {var conditions = Array.isArray(this) ? this : ['freezed', 'locked'];var results = [];var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {for (var _iterator = conditions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var c = _step.value;results.push(hasProperty(task, c) === false || task[c] === false);}} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator.return) {_iterator.return();}} finally {if (_didIteratorError) {throw _iteratorError;}}}return results.indexOf(false) > -1 ? false : true;}function utilClearByTag(task) {if (!excludeSpecificTasks.call(['locked'], task)) {return false;}return task.tag === this;}function fifo(a, b) {return a.createdAt - b.createdAt;}function lifo(a, b) {
  return b.createdAt - a.createdAt;
}

},{}],10:[function(require,module,exports){
/**
 * Global Names
 */

var globals = /\b(Array|Date|Object|Math|JSON)\b/g;

/**
 * Return immediate identifiers parsed from `str`.
 *
 * @param {String} str
 * @param {String|Function} map function or prefix
 * @return {Array}
 * @api public
 */

module.exports = function(str, fn){
  var p = unique(props(str));
  if (fn && 'string' == typeof fn) fn = prefixed(fn);
  if (fn) return map(str, p, fn);
  return p;
};

/**
 * Return immediate identifiers in `str`.
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

function props(str) {
  return str
    .replace(/\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\//g, '')
    .replace(globals, '')
    .match(/[a-zA-Z_]\w*/g)
    || [];
}

/**
 * Return `str` with `props` mapped with `fn`.
 *
 * @param {String} str
 * @param {Array} props
 * @param {Function} fn
 * @return {String}
 * @api private
 */

function map(str, props, fn) {
  var re = /\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\/|[a-zA-Z_]\w*/g;
  return str.replace(re, function(_){
    if ('(' == _[_.length - 1]) return fn(_);
    if (!~props.indexOf(_)) return _;
    return fn(_);
  });
}

/**
 * Return unique array.
 *
 * @param {Array} arr
 * @return {Array}
 * @api private
 */

function unique(arr) {
  var ret = [];

  for (var i = 0; i < arr.length; i++) {
    if (~ret.indexOf(arr[i])) continue;
    ret.push(arr[i]);
  }

  return ret;
}

/**
 * Map with prefix `str`.
 */

function prefixed(str) {
  return function(_){
    return str + _;
  };
}

},{}],11:[function(require,module,exports){

/**
 * Module dependencies.
 */

var toFunction = require('to-function');

/**
 * Group `arr` with callback `fn(val, i)`.
 *
 * @param {Array} arr
 * @param {Function|String} fn or prop
 * @return {Array}
 * @api public
 */

module.exports = function(arr, fn){
  var ret = {};
  var prop;
  fn = toFunction(fn);

  for (var i = 0; i < arr.length; ++i) {
    prop = fn(arr[i], i);
    ret[prop] = ret[prop] || [];
    ret[prop].push(arr[i]);
  }

  return ret;
};
},{"to-function":12}],12:[function(require,module,exports){

/**
 * Module Dependencies
 */

var expr;
try {
  expr = require('props');
} catch(e) {
  expr = require('component-props');
}

/**
 * Expose `toFunction()`.
 */

module.exports = toFunction;

/**
 * Convert `obj` to a `Function`.
 *
 * @param {Mixed} obj
 * @return {Function}
 * @api private
 */

function toFunction(obj) {
  switch ({}.toString.call(obj)) {
    case '[object Object]':
      return objectToFunction(obj);
    case '[object Function]':
      return obj;
    case '[object String]':
      return stringToFunction(obj);
    case '[object RegExp]':
      return regexpToFunction(obj);
    default:
      return defaultToFunction(obj);
  }
}

/**
 * Default to strict equality.
 *
 * @param {Mixed} val
 * @return {Function}
 * @api private
 */

function defaultToFunction(val) {
  return function(obj){
    return val === obj;
  };
}

/**
 * Convert `re` to a function.
 *
 * @param {RegExp} re
 * @return {Function}
 * @api private
 */

function regexpToFunction(re) {
  return function(obj){
    return re.test(obj);
  };
}

/**
 * Convert property `str` to a function.
 *
 * @param {String} str
 * @return {Function}
 * @api private
 */

function stringToFunction(str) {
  // immediate such as "> 20"
  if (/^ *\W+/.test(str)) return new Function('_', 'return _ ' + str);

  // properties such as "name.first" or "age > 18" or "age > 18 && age < 36"
  return new Function('_', 'return ' + get(str));
}

/**
 * Convert `object` to a function.
 *
 * @param {Object} object
 * @return {Function}
 * @api private
 */

function objectToFunction(obj) {
  var match = {};
  for (var key in obj) {
    match[key] = typeof obj[key] === 'string'
      ? defaultToFunction(obj[key])
      : toFunction(obj[key]);
  }
  return function(val){
    if (typeof val !== 'object') return false;
    for (var key in match) {
      if (!(key in val)) return false;
      if (!match[key](val[key])) return false;
    }
    return true;
  };
}

/**
 * Built the getter function. Supports getter style functions
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function get(str) {
  var props = expr(str);
  if (!props.length) return '_.' + str;

  var val, i, prop;
  for (i = 0; i < props.length; i++) {
    prop = props[i];
    val = '_.' + prop;
    val = "('function' == typeof " + val + " ? " + val + "() : " + val + ")";

    // mimic negative lookbehind to avoid problems with nested properties
    str = stripNested(prop, str, val);
  }

  return str;
}

/**
 * Mimic negative lookbehind to avoid problems with nested properties.
 *
 * See: http://blog.stevenlevithan.com/archives/mimic-lookbehind-javascript
 *
 * @param {String} prop
 * @param {String} str
 * @param {String} val
 * @return {String}
 * @api private
 */

function stripNested (prop, str, val) {
  return str.replace(new RegExp('(\\.)?' + prop, 'g'), function($0, $1) {
    return $1 ? $0 : val;
  });
}

},{"component-props":10,"props":10}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvY29uZmlnLmRhdGEuanMiLCJkZXYvY29uZmlnLmpzIiwiZGV2L2NvbnRhaW5lci5qcyIsImRldi9ldmVudC5qcyIsImRldi9pbmRleC5qcyIsImRldi9xdWV1ZS5qcyIsImRldi9zdG9yYWdlLWNhcHN1bGUuanMiLCJkZXYvc3RvcmFnZS9sb2NhbHN0b3JhZ2UuanMiLCJkZXYvdXRpbHMuanMiLCJub2RlX21vZHVsZXMvY29tcG9uZW50LXByb3BzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2dyb3VwLWJ5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3RvLWZ1bmN0aW9uL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztXQ0FlLEFBQ0osQUFDVDtVQUZhLEFBRUwsQUFDUjtXQUhhLEFBR0osQUFDVDtTQUFPLENBSk0sQUFJTCxBQUNSLENBTGEsQUFDYjthLEFBRGEsQUFLRjs7Ozs7QUNIYix1Qzs7QSxBQUVxQixxQkFHbkI7OztvQkFBa0MsS0FBdEIsQUFBc0IsNkVBQUosQUFBSSxzQ0FGbEMsQUFFa0Msa0JBQ2hDO1NBQUEsQUFBSyxNQUFMLEFBQVcsQUFDWjtBLHVEQUVHOztBLFUsQUFBYyxPQUFrQixBQUNsQztXQUFBLEFBQUssT0FBTCxBQUFZLFFBQVosQUFBb0IsQUFDckI7QSx1Q0FFRzs7QSxVQUFtQixBQUNyQjthQUFPLEtBQUEsQUFBSyxPQUFaLEFBQU8sQUFBWSxBQUNwQjtBLHVDQUVHOztBLFVBQWMsQUFDaEI7YUFBTyxPQUFBLEFBQU8sVUFBUCxBQUFpQixlQUFqQixBQUFnQyxLQUFLLEtBQXJDLEFBQTBDLFFBQWpELEFBQU8sQUFBa0QsQUFDMUQ7QSx5Q0FFSzs7QSxZQUF5QixBQUM3QjtXQUFBLEFBQUssU0FBUyxPQUFBLEFBQU8sT0FBUCxBQUFjLElBQUksS0FBbEIsQUFBdUIsUUFBckMsQUFBYyxBQUErQixBQUM5QztBLDBDQUVNOztB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJleHBvcnQgZGVmYXVsdCB7XG4gIHN0b3JhZ2U6ICdsb2NhbHN0b3JhZ2UnLFxuICBwcmVmaXg6ICdzcV9qb2JzJyxcbiAgdGltZW91dDogMTAwMCxcbiAgbGltaXQ6IC0xLFxuICBwcmluY2lwbGU6ICdmaWZvJ1xufTtcbiIsIi8qIEBmbG93ICovXG5pbXBvcnQgdHlwZSBJQ29uZmlnIGZyb20gJy4uL2ludGVyZmFjZXMvY29uZmlnJztcbmltcG9ydCBjb25maWdEYXRhIGZyb20gJy4vY29uZmlnLmRhdGEnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25maWcge1xuICBjb25maWc6IElDb25maWcgPSBjb25maWdEYXRhO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogSUNvbmZpZyA9IHt9KSB7XG4gICAgdGhpcy5tZXJnZShjb25maWcpO1xuICB9XG5cbiAgc2V0KG5hbWU6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQge1xuICAgIHRoaXMuY29uZmlnW25hbWVdID0gdmFsdWU7XG4gIH1cblxuICBnZXQobmFtZTogc3RyaW5nKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWdbbmFtZV07XG4gIH1cblxuICBoYXMobmFtZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLmNvbmZpZywgbmFtZSk7XG4gIH1cblxuICBtZXJnZShjb25maWc6IHtbc3RyaW5nXTogYW55fSkge1xuICAgIHRoaXMuY29uZmlnID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5jb25maWcsIGNvbmZpZyk7XG4gIH1cblxuICByZW1vdmUobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGRlbGV0ZSB0aGlzLmNvbmZpZ1tuYW1lXTtcbiAgfVxuXG4gIGFsbCgpOiBJQ29uZmlnIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc7XG4gIH1cbn1cbiIsIi8qIEBmbG93ICovXG5pbXBvcnQgdHlwZSBJQ29udGFpbmVyIGZyb20gJy4uL2ludGVyZmFjZXMvY29udGFpbmVyJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29udGFpbmVyIGltcGxlbWVudHMgSUNvbnRhaW5lciB7XG5cbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIF9jb250YWluZXI6IHtbcHJvcGVydHk6IHN0cmluZ106IGFueX0gPSB7fTtcblxuICBoYXMoaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5fY29udGFpbmVyLCBpZCk7XG4gIH1cblxuICBnZXQoaWQ6IHN0cmluZyk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnRhaW5lcltpZF07XG4gIH1cblxuICBhbGwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnRhaW5lcjtcbiAgfVxuXG4gIGJpbmQoaWQ6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQge1xuICAgIHRoaXMuX2NvbnRhaW5lcltpZF0gPSB2YWx1ZTtcbiAgfVxuXG4gIHJlbW92ZShpZDogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLl9jb250YWluZXIsIGlkKSkge1xuICAgICAgZGVsZXRlIHRoaXMuX2NvbnRhaW5lcltpZF07XG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlQWxsKCk6IHZvaWQge1xuICAgIHRoaXMuX2NvbnRhaW5lciA9IHt9O1xuICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBFdmVudCB7XG4gIHN0b3JlID0ge307XG4gIHZlcmlmaWVyUGF0dGVybiA9IC9eW2EtejAtOVxcLVxcX10rXFw6YmVmb3JlJHxhZnRlciR8cmV0cnkkfFxcKiQvO1xuICB3aWxkY2FyZHMgPSBbJyonLCAnZXJyb3InXTtcbiAgZW1wdHlGdW5jID0gKCkgPT4ge307XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5zdG9yZS5iZWZvcmUgPSB7fTtcbiAgICB0aGlzLnN0b3JlLmFmdGVyID0ge307XG4gICAgdGhpcy5zdG9yZS5yZXRyeSA9IHt9O1xuICAgIHRoaXMuc3RvcmUud2lsZGNhcmQgPSB7fTtcbiAgICB0aGlzLnN0b3JlLmVycm9yID0gdGhpcy5lbXB0eUZ1bmM7XG4gICAgdGhpcy5zdG9yZVsnKiddID0gdGhpcy5lbXB0eUZ1bmM7XG4gIH1cblxuICBvbihrZXk6IHN0cmluZywgY2I6IEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgaWYgKHR5cGVvZihjYikgIT09ICdmdW5jdGlvbicpIHRocm93IG5ldyBFcnJvcignRXZlbnQgc2hvdWxkIGJlIGFuIGZ1bmN0aW9uJyk7XG4gICAgaWYgKHRoaXMuaXNWYWxpZChrZXkpKSB0aGlzLmFkZChrZXksIGNiKTtcbiAgfVxuXG4gIGVtaXQoa2V5OiBzdHJpbmcsIGFyZ3M6IGFueSkge1xuICAgIGlmICh0aGlzLndpbGRjYXJkcy5pbmRleE9mKGtleSkgPiAtMSkge1xuICAgICAgdGhpcy53aWxkY2FyZChrZXksIC4uLmFyZ3VtZW50cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHR5cGUgPSB0aGlzLmdldFR5cGUoa2V5KTtcbiAgICAgIGNvbnN0IG5hbWUgPSB0aGlzLmdldE5hbWUoa2V5KTtcblxuICAgICAgaWYgKHRoaXMuc3RvcmVbdHlwZV0pIHtcbiAgICAgICAgY29uc3QgY2IgPSB0aGlzLnN0b3JlW3R5cGVdW25hbWVdIHx8IHRoaXMuZW1wdHlGdW5jO1xuICAgICAgICBjYi5jYWxsKG51bGwsIGFyZ3MpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMud2lsZGNhcmQoJyonLCBrZXksIGFyZ3MpO1xuICB9XG5cbiAgd2lsZGNhcmQoa2V5OiBzdHJpbmcsIGFjdGlvbktleTogc3RyaW5nLCBhcmdzOiBhbnkpIHtcbiAgICBpZiAodGhpcy5zdG9yZS53aWxkY2FyZFtrZXldKSB7XG4gICAgICB0aGlzLnN0b3JlLndpbGRjYXJkW2tleV0uY2FsbChudWxsLCBhY3Rpb25LZXksIGFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIGFkZChrZXk6IHN0cmluZywgY2I6IEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgaWYgKHRoaXMud2lsZGNhcmRzLmluZGV4T2Yoa2V5KSA+LTEpIHtcbiAgICAgIHRoaXMuc3RvcmUud2lsZGNhcmRba2V5XSA9IGNiO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB0eXBlID0gdGhpcy5nZXRUeXBlKGtleSk7XG4gICAgICBjb25zdCBuYW1lID0gdGhpcy5nZXROYW1lKGtleSk7XG4gICAgICB0aGlzLnN0b3JlW3R5cGVdW25hbWVdID0gY2I7XG4gICAgfVxuICB9XG5cbiAgaGFzKGtleTogc3RyaW5nKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGtleXMgPSBrZXkuc3BsaXQoJzonKTtcbiAgICAgIHJldHVybiBrZXlzLmxlbmd0aCA+IDEgPyAhISB0aGlzLnN0b3JlW2tleXNbMV1dW2tleXNbMF1dIDogISEgdGhpcy5zdG9yZS53aWxkY2FyZFtrZXlzWzBdXTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBnZXROYW1lKGtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4ga2V5Lm1hdGNoKC8oLiopXFw6LiovKVsxXTtcbiAgfVxuXG4gIGdldFR5cGUoa2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBrZXkubWF0Y2goL15bYS16MC05XFwtXFxfXStcXDooLiopLylbMV07XG4gIH1cblxuICBpc1ZhbGlkKGtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMudmVyaWZpZXJQYXR0ZXJuLnRlc3Qoa2V5KSB8fCB0aGlzLndpbGRjYXJkcy5pbmRleE9mKGtleSkgPi0xO1xuICB9XG59XG4iLCJpbXBvcnQgUXVldWUgZnJvbSAnLi9xdWV1ZSc7XG5cbndpbmRvdy5RdWV1ZSA9IFF1ZXVlO1xuXG5leHBvcnQgZGVmYXVsdCBRdWV1ZTtcbiIsIi8qIEBmbG93ICovXG5pbXBvcnQgdHlwZSBJQ29uZmlnIGZyb20gXCIuLi9pbnRlcmZhY2VzL2NvbmZpZ1wiO1xuaW1wb3J0IHR5cGUgSVRhc2sgZnJvbSBcIi4uL2ludGVyZmFjZXMvdGFza1wiO1xuaW1wb3J0IHR5cGUgSUpvYiBmcm9tIFwiLi4vaW50ZXJmYWNlcy9qb2JcIjtcbmltcG9ydCBDb250YWluZXIgZnJvbSBcIi4vY29udGFpbmVyXCI7XG5pbXBvcnQgU3RvcmFnZUNhcHN1bGUgZnJvbSBcIi4vc3RvcmFnZS1jYXBzdWxlXCI7XG5pbXBvcnQgQ29uZmlnIGZyb20gXCIuL2NvbmZpZ1wiO1xuaW1wb3J0IEV2ZW50IGZyb20gXCIuL2V2ZW50XCI7XG5pbXBvcnQge1xuICBjbG9uZSxcbiAgaGFzTWV0aG9kLFxuICBpc0Z1bmN0aW9uLFxuICBleGNsdWRlU3BlY2lmaWNUYXNrcyxcbiAgdXRpbENsZWFyQnlUYWdcbn0gZnJvbSBcIi4vdXRpbHNcIjtcbmltcG9ydCBMb2NhbFN0b3JhZ2UgZnJvbSBcIi4vc3RvcmFnZS9sb2NhbHN0b3JhZ2VcIjtcblxuaW50ZXJmYWNlIElKb2JJbnN0YW5jZSB7XG4gIHByaW9yaXR5OiBudW1iZXI7XG4gIHJldHJ5OiBudW1iZXI7XG4gIGhhbmRsZShhcmdzOiBhbnkpOiBhbnk7XG4gIGJlZm9yZShhcmdzOiBhbnkpOiB2b2lkO1xuICBhZnRlcihhcmdzOiBhbnkpOiB2b2lkO1xufVxuXG5sZXQgUXVldWUgPSAoKCkgPT4ge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICBRdWV1ZS5GSUZPID0gXCJmaWZvXCI7XG4gIFF1ZXVlLkxJRk8gPSBcImxpZm9cIjtcblxuICBmdW5jdGlvbiBRdWV1ZShjb25maWc6IElDb25maWcpIHtcbiAgICBfY29uc3RydWN0b3IuY2FsbCh0aGlzLCBjb25maWcpO1xuICB9XG5cbiAgZnVuY3Rpb24gX2NvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgIHRoaXMuY3VycmVudENoYW5uZWw7XG4gICAgdGhpcy5jdXJyZW50VGltZW91dDtcbiAgICB0aGlzLnN0b3BwZWQgPSB0cnVlO1xuICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICAgIHRoaXMuY2hhbm5lbHMgPSB7fTtcbiAgICB0aGlzLmNvbmZpZyA9IG5ldyBDb25maWcoY29uZmlnKTtcbiAgICB0aGlzLnN0b3JhZ2UgPSBuZXcgU3RvcmFnZUNhcHN1bGUoXG4gICAgICB0aGlzLmNvbmZpZyxcbiAgICAgIG5ldyBMb2NhbFN0b3JhZ2UodGhpcy5jb25maWcpXG4gICAgKTtcbiAgICB0aGlzLmV2ZW50ID0gbmV3IEV2ZW50KCk7XG4gICAgdGhpcy5jb250YWluZXIgPSBuZXcgQ29udGFpbmVyKCk7XG4gICAgdGhpcy50aW1lb3V0ID0gdGhpcy5jb25maWcuZ2V0KFwidGltZW91dFwiKTtcbiAgfVxuXG4gIFF1ZXVlLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbih0YXNrKSB7XG4gICAgY29uc3QgaWQgPSBzYXZlVGFzay5jYWxsKHRoaXMsIHRhc2spO1xuXG4gICAgaWYgKGlkICYmIHRoaXMuc3RvcHBlZCAmJiB0aGlzLnJ1bm5pbmcgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuc3RhcnQoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gaWQ7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5zdG9wcGVkKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIltzdG9wcGVkXS0+IG5leHRcIik7XG4gICAgICBzdGF0dXNPZmYuY2FsbCh0aGlzKTtcbiAgICAgIHJldHVybiBzdG9wUXVldWUuY2FsbCh0aGlzKTtcbiAgICB9XG4gICAgY29uc29sZS5sb2coXCJbbmV4dF0tPlwiKTtcbiAgICB0aGlzLnN0YXJ0KCk7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKTogYm9vbGVhbiB7XG4gICAgLy8gU3RvcCB0aGUgcXVldWUgZm9yIHJlc3RhcnRcbiAgICB0aGlzLnN0b3BwZWQgPSBmYWxzZTtcblxuICAgIC8vIFJlZ2lzdGVyIHRhc2tzLCBpZiBub3QgcmVnaXN0ZXJlZFxuICAgIHJlZ2lzdGVySm9icy5jYWxsKHRoaXMpO1xuXG4gICAgLy8gQ3JlYXRlIGEgdGltZW91dCBmb3Igc3RhcnQgcXVldWVcbiAgICB0aGlzLnJ1bm5pbmcgPSBjcmVhdGVUaW1lb3V0LmNhbGwodGhpcykgPiAwO1xuICAgIGNvbnNvbGUubG9nKFwiW3N0YXJ0ZWRdLT5cIiwgdGhpcy5ydW5uaW5nKTtcbiAgICByZXR1cm4gdGhpcy5ydW5uaW5nO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coXCJbc3RvcHBpbmddLT5cIik7XG4gICAgdGhpcy5zdG9wcGVkID0gdHJ1ZTsgLy90aGlzLnJ1bm5pbmc7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLmZvcmNlU3RvcCA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKFwiW2ZvcmNlU3RvcHBlZF0tPlwiKTtcbiAgICBzdG9wUXVldWUuY2FsbCh0aGlzKTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oY2hhbm5lbDogc3RyaW5nKSB7XG4gICAgaWYgKCEoY2hhbm5lbCBpbiB0aGlzLmNoYW5uZWxzKSkge1xuICAgICAgdGhpcy5jdXJyZW50Q2hhbm5lbCA9IGNoYW5uZWw7XG4gICAgICB0aGlzLmNoYW5uZWxzW2NoYW5uZWxdID0gY2xvbmUodGhpcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuY2hhbm5lbHNbY2hhbm5lbF07XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLmNoYW5uZWwgPSBmdW5jdGlvbihuYW1lOiBzdHJpbmcpIHtcbiAgICBpZiAoIXRoaXMuY2hhbm5lbHNbbmFtZV0pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2hhbm5lbCBvZiBcIiR7bmFtZX1cIiBub3QgZm91bmRgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5jaGFubmVsc1tuYW1lXTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuaXNFbXB0eSA9IGZ1bmN0aW9uKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNvdW50KCkgPCAxO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5jb3VudCA9IGZ1bmN0aW9uKCk6IEFycmF5PElUYXNrPiB7XG4gICAgcmV0dXJuIGdldFRhc2tzV2l0aG91dEZyZWV6ZWQuY2FsbCh0aGlzKS5sZW5ndGg7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLmNvdW50QnlUYWcgPSBmdW5jdGlvbih0YWc6IHN0cmluZyk6IEFycmF5PElUYXNrPiB7XG4gICAgcmV0dXJuIGdldFRhc2tzV2l0aG91dEZyZWV6ZWQuY2FsbCh0aGlzKS5maWx0ZXIodCA9PiB0LnRhZyA9PT0gdGFnKS5sZW5ndGg7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuY3VycmVudENoYW5uZWwpIHtcbiAgICAgIHRoaXMuc3RvcmFnZS5jbGVhcih0aGlzLmN1cnJlbnRDaGFubmVsKTtcbiAgICB9XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLmNsZWFyQnlUYWcgPSBmdW5jdGlvbih0YWc6IHN0cmluZyk6IHZvaWQge1xuICAgIGRiXG4gICAgICAuY2FsbCh0aGlzKVxuICAgICAgLmFsbCgpXG4gICAgICAuZmlsdGVyKHV0aWxDbGVhckJ5VGFnLmJpbmQodGFnKSlcbiAgICAgIC5mb3JFYWNoKHQgPT4gZGIuY2FsbCh0aGlzKS5kZWxldGUodC5faWQpKTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24oaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBnZXRUYXNrc1dpdGhvdXRGcmVlemVkLmNhbGwodGhpcykuZmluZEluZGV4KHQgPT4gdC5faWQgPT09IGlkKSA+IC0xO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5oYXNCeVRhZyA9IGZ1bmN0aW9uKHRhZzogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGdldFRhc2tzV2l0aG91dEZyZWV6ZWQuY2FsbCh0aGlzKS5maW5kSW5kZXgodCA9PiB0LnRhZyA9PT0gdGFnKSA+IC0xO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5zZXRUaW1lb3V0ID0gZnVuY3Rpb24odmFsOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnRpbWVvdXQgPSB2YWw7XG4gICAgdGhpcy5jb25maWcuc2V0KFwidGltZW91dFwiLCB2YWwpO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5zZXRMaW1pdCA9IGZ1bmN0aW9uKHZhbDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5jb25maWcuc2V0KFwibGltaXRcIiwgdmFsKTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuc2V0UHJlZml4ID0gZnVuY3Rpb24odmFsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmNvbmZpZy5zZXQoXCJwcmVmaXhcIiwgdmFsKTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuc2V0UHJpbmNpcGxlID0gZnVuY3Rpb24odmFsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmNvbmZpZy5zZXQoXCJwcmluY2lwbGVcIiwgdmFsKTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUub24gPSBmdW5jdGlvbihrZXk6IHN0cmluZywgY2I6IEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgdGhpcy5ldmVudC5vbiguLi5hcmd1bWVudHMpO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5lcnJvciA9IGZ1bmN0aW9uKGNiOiBGdW5jdGlvbik6IHZvaWQge1xuICAgIHRoaXMuZXZlbnQub24oXCJlcnJvclwiLCBjYik7XG4gIH07XG5cbiAgUXVldWUucmVnaXN0ZXIgPSBmdW5jdGlvbihqb2JzOiBBcnJheTxJSm9iPikge1xuICAgIGlmICghKGpvYnMgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlF1ZXVlIGpvYnMgc2hvdWxkIGJlIG9iamVjdHMgd2l0aGluIGFuIGFycmF5XCIpO1xuICAgIH1cblxuICAgIFF1ZXVlLmlzUmVnaXN0ZXJlZCA9IGZhbHNlO1xuICAgIFF1ZXVlLmpvYnMgPSBqb2JzO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGdldFRhc2tzV2l0aG91dEZyZWV6ZWQoKSB7XG4gICAgcmV0dXJuIGRiXG4gICAgICAuY2FsbCh0aGlzKVxuICAgICAgLmFsbCgpXG4gICAgICAuZmlsdGVyKGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzLmJpbmQoW1wiZnJlZXplZFwiXSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gZGlzcGF0Y2hFdmVudHModGFzazogSVRhc2ssIHR5cGU6IHN0cmluZykge1xuICAgIGlmIChcInRhZ1wiIGluIHRhc2spIHtcbiAgICAgIHRoaXMuZXZlbnQuZW1pdChgJHt0YXNrLnRhZ306JHt0eXBlfWAsIHRhc2spO1xuICAgICAgdGhpcy5ldmVudC5lbWl0KGAke3Rhc2sudGFnfToqYCwgdGFzayk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZGIoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmFnZS5jaGFubmVsKHRoaXMuY3VycmVudENoYW5uZWwpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2F2ZVRhc2sodGFzazogSVRhc2spIHtcbiAgICByZXR1cm4gZGIuY2FsbCh0aGlzKS5zYXZlKHRhc2spO1xuICB9XG5cbiAgZnVuY3Rpb24gc2F2ZVRhc2sodGFzazogSVRhc2spIHtcbiAgICByZXR1cm4gZGIuY2FsbCh0aGlzKS5zYXZlKGNoZWNrUHJpb3JpdHkodGFzaykpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tQcmlvcml0eSh0YXNrOiBJVGFzaykge1xuICAgIHRhc2sucHJpb3JpdHkgPSB0YXNrLnByaW9yaXR5IHx8IDA7XG5cbiAgICBpZiAoaXNOYU4odGFzay5wcmlvcml0eSkpIHRhc2sucHJpb3JpdHkgPSAwO1xuXG4gICAgcmV0dXJuIHRhc2s7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVUaW1lb3V0KCk6IG51bWJlciB7XG4gICAgY29uc3QgdGltZW91dCA9IHRoaXMuY29uZmlnLmdldChcInRpbWVvdXRcIik7XG4gICAgcmV0dXJuICh0aGlzLmN1cnJlbnRUaW1lb3V0ID0gc2V0VGltZW91dChsb29wSGFuZGxlci5iaW5kKHRoaXMpLCB0aW1lb3V0KSk7XG4gIH1cblxuICBmdW5jdGlvbiBsb2NrVGFzayh0YXNrKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGRiLmNhbGwodGhpcykudXBkYXRlKHRhc2suX2lkLCB7IGxvY2tlZDogdHJ1ZSB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZVRhc2soaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBkYi5jYWxsKHRoaXMpLmRlbGV0ZShpZCk7XG4gIH1cblxuICBmdW5jdGlvbiBsb29wSGFuZGxlcigpOiB2b2lkIHtcbiAgICBjb25zdCBzZWxmOiBRdWV1ZSA9IHRoaXM7XG4gICAgY29uc3QgdGFzazogSVRhc2sgPSBkYlxuICAgICAgLmNhbGwoc2VsZilcbiAgICAgIC5mZXRjaCgpXG4gICAgICAuc2hpZnQoKTtcblxuICAgIGlmICh0YXNrID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnNvbGUubG9nKGAtPiAke3RoaXMuY3VycmVudENoYW5uZWx9IGNoYW5uZWwgaXMgZW1wdHkuLi5gKTtcbiAgICAgIHN0b3BRdWV1ZS5jYWxsKHRoaXMpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghc2VsZi5jb250YWluZXIuaGFzKHRhc2suaGFuZGxlcikpIHtcbiAgICAgIGNvbnNvbGUud2Fybih0YXNrLmhhbmRsZXIgKyBcIi0+IGpvYiBub3QgZm91bmRcIik7XG4gICAgfVxuXG4gICAgY29uc3Qgam9iOiBJSm9iID0gc2VsZi5jb250YWluZXIuZ2V0KHRhc2suaGFuZGxlcik7XG4gICAgY29uc3Qgam9iSW5zdGFuY2U6IElKb2JJbnN0YW5jZSA9IG5ldyBqb2IuaGFuZGxlcigpO1xuXG4gICAgLy8gbG9jayB0aGUgY3VycmVudCB0YXNrIGZvciBwcmV2ZW50IHJhY2UgY29uZGl0aW9uXG4gICAgbG9ja1Rhc2suY2FsbChzZWxmLCB0YXNrKTtcblxuICAgIC8vIGZpcmUgam9iIGJlZm9yZSBldmVudFxuICAgIGZpcmVKb2JJbmxpbmVFdmVudC5jYWxsKHRoaXMsIFwiYmVmb3JlXCIsIGpvYkluc3RhbmNlLCB0YXNrLmFyZ3MpO1xuXG4gICAgLy8gZGlzcGFjdGggY3VzdG9tIGJlZm9yZSBldmVudFxuICAgIGRpc3BhdGNoRXZlbnRzLmNhbGwodGhpcywgdGFzaywgXCJiZWZvcmVcIik7XG5cbiAgICAvLyBwcmVwYXJpbmcgd29ya2VyIGRlcGVuZGVuY2llc1xuICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9IE9iamVjdC52YWx1ZXMoam9iLmRlcHMgfHwge30pO1xuXG4gICAgLy8gVGFzayBydW5uZXIgcHJvbWlzZVxuICAgIGpvYkluc3RhbmNlLmhhbmRsZVxuICAgICAgLmNhbGwoam9iSW5zdGFuY2UsIHRhc2suYXJncywgLi4uZGVwZW5kZW5jaWVzKVxuICAgICAgLnRoZW4oam9iUmVzcG9uc2UuY2FsbChzZWxmLCB0YXNrLCBqb2JJbnN0YW5jZSkuYmluZChzZWxmKSlcbiAgICAgIC5jYXRjaChqb2JGYWlsZWRSZXNwb25zZS5jYWxsKHNlbGYsIHRhc2ssIGpvYkluc3RhbmNlKS5iaW5kKHNlbGYpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGpvYlJlc3BvbnNlKHRhc2s6IElUYXNrLCBqb2I6IElKb2JJbnN0YW5jZSk6IEZ1bmN0aW9uIHtcbiAgICBjb25zdCBzZWxmOiBRdWV1ZSA9IHRoaXM7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHJlc3VsdDogYm9vbGVhbikge1xuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICBzdWNjZXNzUHJvY2Vzcy5jYWxsKHNlbGYsIHRhc2ssIGpvYik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXRyeVByb2Nlc3MuY2FsbChzZWxmLCB0YXNrLCBqb2IpO1xuICAgICAgfVxuXG4gICAgICAvLyBmaXJlIGpvYiBhZnRlciBldmVudFxuICAgICAgZmlyZUpvYklubGluZUV2ZW50LmNhbGwodGhpcywgXCJhZnRlclwiLCBqb2IsIHRhc2suYXJncyk7XG5cbiAgICAgIC8vIGRpc3BhY3RoIGN1c3RvbSBhZnRlciBldmVudFxuICAgICAgZGlzcGF0Y2hFdmVudHMuY2FsbCh0aGlzLCB0YXNrLCBcImFmdGVyXCIpO1xuXG4gICAgICAvLyB0cnkgbmV4dCBxdWV1ZSBqb2JcbiAgICAgIHNlbGYubmV4dCgpO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBqb2JGYWlsZWRSZXNwb25zZSh0YXNrOiBJVGFzaywgam9iOiBJSm9iSW5zdGFuY2UpOiBGdW5jdGlvbiB7XG4gICAgcmV0dXJuIChyZXN1bHQ6IGJvb2xlYW4pID0+IHtcbiAgICAgIHJlbW92ZVRhc2suY2FsbCh0aGlzLCB0YXNrLl9pZCk7XG5cbiAgICAgIHRoaXMuZXZlbnQuZW1pdChcImVycm9yXCIsIHRhc2spO1xuXG4gICAgICB0aGlzLm5leHQoKTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gZmlyZUpvYklubGluZUV2ZW50KFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBqb2I6IElKb2JJbnN0YW5jZSxcbiAgICBhcmdzOiBhbnlcbiAgKTogdm9pZCB7XG4gICAgaWYgKCFoYXNNZXRob2Qoam9iLCBuYW1lKSkgcmV0dXJuO1xuXG4gICAgaWYgKG5hbWUgPT0gXCJiZWZvcmVcIiAmJiBpc0Z1bmN0aW9uKGpvYi5iZWZvcmUpKSB7XG4gICAgICBqb2IuYmVmb3JlLmNhbGwoam9iLCBhcmdzKTtcbiAgICB9IGVsc2UgaWYgKG5hbWUgPT0gXCJhZnRlclwiICYmIGlzRnVuY3Rpb24oam9iLmFmdGVyKSkge1xuICAgICAgam9iLmFmdGVyLmNhbGwoam9iLCBhcmdzKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzdGF0dXNPZmYoKTogdm9pZCB7XG4gICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBzdG9wUXVldWUoKTogdm9pZCB7XG4gICAgdGhpcy5zdG9wKCk7XG5cbiAgICBpZiAodGhpcy5jdXJyZW50VGltZW91dCkge1xuICAgICAgLy8gdW5zZXQgY3VycmVudCB0aW1lb3V0IHZhbHVlXG4gICAgICB0aGlzLmN1cnJlbnRUaW1lb3V0ID0gY2xlYXJUaW1lb3V0KHRoaXMuY3VycmVudFRpbWVvdXQpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHN1Y2Nlc3NQcm9jZXNzKHRhc2s6IElUYXNrLCBqb2I6IElKb2JJbnN0YW5jZSk6IHZvaWQge1xuICAgIHJlbW92ZVRhc2suY2FsbCh0aGlzLCB0YXNrLl9pZCk7XG4gIH1cblxuICBmdW5jdGlvbiByZXRyeVByb2Nlc3ModGFzazogSVRhc2ssIGpvYjogSUpvYkluc3RhbmNlKTogYm9vbGVhbiB7XG4gICAgLy8gZGlzcGFjdGggY3VzdG9tIHJldHJ5IGV2ZW50XG4gICAgZGlzcGF0Y2hFdmVudHMuY2FsbCh0aGlzLCB0YXNrLCBcInJldHJ5XCIpO1xuXG4gICAgLy8gdXBkYXRlIHJldHJ5IHZhbHVlXG4gICAgbGV0IHVwZGF0ZVRhc2s6IElUYXNrID0gdXBkYXRlUmV0cnkuY2FsbCh0aGlzLCB0YXNrLCBqb2IpO1xuXG4gICAgLy8gZGVsZXRlIGxvY2sgcHJvcGVydHkgZm9yIG5leHQgcHJvY2Vzc1xuICAgIHVwZGF0ZVRhc2subG9ja2VkID0gZmFsc2U7XG5cbiAgICByZXR1cm4gZGIuY2FsbCh0aGlzKS51cGRhdGUodGFzay5faWQsIHVwZGF0ZVRhc2spO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlUmV0cnkodGFzazogSVRhc2ssIGpvYjogSUpvYkluc3RhbmNlKTogSVRhc2sge1xuICAgIGlmICghKFwicmV0cnlcIiBpbiBqb2IpKSB7XG4gICAgICBqb2IucmV0cnkgPSAxO1xuICAgIH1cblxuICAgIGlmICghKFwidHJpZWRcIiBpbiB0YXNrKSkge1xuICAgICAgdGFzay50cmllZCA9IDA7XG4gICAgICB0YXNrLnJldHJ5ID0gam9iLnJldHJ5O1xuICAgIH1cblxuICAgICsrdGFzay50cmllZDtcblxuICAgIGlmICh0YXNrLnRyaWVkID49IGpvYi5yZXRyeSkge1xuICAgICAgdGFzay5mcmVlemVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGFzaztcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlZ2lzdGVySm9icygpOiB2b2lkIHtcbiAgICBpZiAoUXVldWUuaXNSZWdpc3RlcmVkKSByZXR1cm47XG5cbiAgICBjb25zdCBqb2JzID0gUXVldWUuam9icyB8fCBbXTtcblxuICAgIGZvciAoY29uc3Qgam9iIG9mIGpvYnMpIHtcbiAgICAgIGNvbnN0IGZ1bmNTdHIgPSBqb2IuaGFuZGxlci50b1N0cmluZygpO1xuICAgICAgY29uc3QgW3N0ckZ1bmN0aW9uLCBuYW1lXSA9IGZ1bmNTdHIubWF0Y2goL2Z1bmN0aW9uXFxzKFthLXpBLVpfXSspLio/Lyk7XG4gICAgICBpZiAobmFtZSkgdGhpcy5jb250YWluZXIuYmluZChuYW1lLCBqb2IpO1xuICAgIH1cblxuICAgIFF1ZXVlLmlzUmVnaXN0ZXJlZCA9IHRydWU7XG4gIH1cblxuICByZXR1cm4gUXVldWU7XG59KSgpO1xuXG5leHBvcnQgZGVmYXVsdCBRdWV1ZTtcbiIsIi8qIEBmbG93ICovXG5cbmltcG9ydCBncm91cEJ5IGZyb20gJ2dyb3VwLWJ5J1xuaW1wb3J0IExvY2FsU3RvcmFnZSBmcm9tICcuL3N0b3JhZ2UvbG9jYWxzdG9yYWdlJztcbmltcG9ydCB0eXBlIElDb25maWcgZnJvbSAnLi4vaW50ZXJmYWNlcy9jb25maWcnO1xuaW1wb3J0IHR5cGUgSVN0b3JhZ2UgZnJvbSAnLi4vaW50ZXJmYWNlcy9zdG9yYWdlJztcbmltcG9ydCB0eXBlIElUYXNrIGZyb20gJy4uL2ludGVyZmFjZXMvdGFzayc7XG5pbXBvcnQgQ29uZmlnIGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7IGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzLCBsaWZvLCBmaWZvIH0gZnJvbSAnLi91dGlscyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0b3JhZ2VDYXBzdWxlIHtcbiAgY29uZmlnOiBJQ29uZmlnXG4gIHN0b3JhZ2U6IElTdG9yYWdlO1xuICBzdG9yYWdlQ2hhbm5lbDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogSUNvbmZpZywgc3RvcmFnZTogSVN0b3JhZ2UpIHtcbiAgICB0aGlzLnN0b3JhZ2UgPSBzdG9yYWdlO1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICB9XG5cbiAgY2hhbm5lbChuYW1lOiBzdHJpbmcpOiBTdG9yYWdlQ2Fwc3VsZSB7XG4gICAgdGhpcy5zdG9yYWdlQ2hhbm5lbCA9IG5hbWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBmZXRjaCgpOiBBcnJheTxhbnk+IHtcbiAgICBjb25zdCBhbGwgPSB0aGlzLmFsbCgpLmZpbHRlcihleGNsdWRlU3BlY2lmaWNUYXNrcyk7XG4gICAgY29uc3QgdGFza3MgPSBncm91cEJ5KGFsbCwgJ3ByaW9yaXR5Jyk7XG4gICAgcmV0dXJuIE9iamVjdFxuICAgICAgLmtleXModGFza3MpXG4gICAgICAubWFwKGtleSA9PiBwYXJzZUludChrZXkpKVxuICAgICAgLnNvcnQoKGEsIGIpID0+IGIgLSBhKVxuICAgICAgLnJlZHVjZSgocmVzdWx0LCBrZXkpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLmdldCgncHJpbmNpcGxlJykgPT09ICdsaWZvJykge1xuICAgICAgICAgIHJldHVybiByZXN1bHQuY29uY2F0KHRhc2tzW2tleV0uc29ydChsaWZvKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdC5jb25jYXQodGFza3Nba2V5XS5zb3J0KGZpZm8pKTtcbiAgICAgICAgfVxuICAgICAgfSwgW10pO1xuICB9XG5cbiAgc2F2ZSh0YXNrOiBJVGFzayk6IHN0cmluZ3xib29sZWFuIHtcbiAgICB0cnkge1xuICAgICAgLy8gZ2V0IGFsbCB0YXNrcyBjdXJyZW50IGNoYW5uZWwnc1xuICAgICAgY29uc3QgdGFza3M6IElUYXNrW10gPSB0aGlzLnN0b3JhZ2UuZ2V0KHRoaXMuc3RvcmFnZUNoYW5uZWwpO1xuXG4gICAgICAvLyBjaGVjayBjaGFubmVsIGxpbWl0LlxuICAgICAgLy8gaWYgbGltaXQgaXMgZXhjZWVkZWQsIGRvZXMgbm90IGluc2VydCBuZXcgdGFza1xuICAgICAgaWYgKHRoaXMuaXNFeGNlZWRlZCgpKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgVGFzayBsaW1pdCBleGNlZWRlZDogVGhlICcke3RoaXMuc3RvcmFnZUNoYW5uZWx9JyBjaGFubmVsIGxpbWl0IGlzICR7dGhpcy5jb25maWcuZ2V0KCdsaW1pdCcpfWApO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIHByZXBhcmUgYWxsIHByb3BlcnRpZXMgYmVmb3JlIHNhdmVcbiAgICAgIC8vIGV4YW1wbGU6IGNyZWF0ZWRBdCBldGMuXG4gICAgICB0YXNrID0gdGhpcy5wcmVwYXJlVGFzayh0YXNrKTtcblxuICAgICAgLy8gYWRkIHRhc2sgdG8gc3RvcmFnZVxuICAgICAgdGFza3MucHVzaCh0YXNrKTtcblxuICAgICAgLy8gc2F2ZSB0YXNrc1xuICAgICAgdGhpcy5zdG9yYWdlLnNldCh0aGlzLnN0b3JhZ2VDaGFubmVsLCBKU09OLnN0cmluZ2lmeSh0YXNrcykpO1xuXG4gICAgICByZXR1cm4gdGFzay5faWQ7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlKGlkOiBzdHJpbmcsIHVwZGF0ZToge1twcm9wZXJ0eTogc3RyaW5nXTogYW55fSk6IGJvb2xlYW4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkYXRhOiBhbnlbXSA9IHRoaXMuYWxsKCk7XG4gICAgICBjb25zdCBpbmRleDogbnVtYmVyID0gZGF0YS5maW5kSW5kZXgodCA9PiB0Ll9pZCA9PSBpZCk7XG5cbiAgICAgIGlmIChpbmRleCA8IDApIHJldHVybiBmYWxzZTtcblxuICAgICAgLy8gbWVyZ2UgZXhpc3Rpbmcgb2JqZWN0IHdpdGggZ2l2ZW4gdXBkYXRlIG9iamVjdFxuICAgICAgZGF0YVtpbmRleF0gPSBPYmplY3QuYXNzaWduKHt9LCBkYXRhW2luZGV4XSwgdXBkYXRlKTtcblxuICAgICAgLy8gc2F2ZSB0byB0aGUgc3RvcmFnZSBhcyBzdHJpbmdcbiAgICAgIHRoaXMuc3RvcmFnZS5zZXQodGhpcy5zdG9yYWdlQ2hhbm5lbCwgSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBkZWxldGUoaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkYXRhOiBhbnlbXSA9IHRoaXMuYWxsKCk7XG4gICAgICBjb25zdCBpbmRleDogbnVtYmVyID0gZGF0YS5maW5kSW5kZXgoZCA9PiBkLl9pZCA9PT0gaWQpO1xuXG4gICAgICBpZiAoaW5kZXggPCAwKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIGRlbGV0ZSBkYXRhW2luZGV4XTtcblxuICAgICAgdGhpcy5zdG9yYWdlLnNldCh0aGlzLnN0b3JhZ2VDaGFubmVsLCBKU09OLnN0cmluZ2lmeShkYXRhLmZpbHRlcihkID0+IGQpKSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBhbGwoKTogQXJyYXk8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmFnZS5nZXQodGhpcy5zdG9yYWdlQ2hhbm5lbCk7XG4gIH1cblxuICBnZW5lcmF0ZUlkKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICgoMSArIE1hdGgucmFuZG9tKCkpICogMHgxMDAwMCkudG9TdHJpbmcoMTYpO1xuICB9XG5cbiAgcHJlcGFyZVRhc2sodGFzazogSVRhc2spOiBJVGFzayB7XG4gICAgdGFzay5jcmVhdGVkQXQgPSBEYXRlLm5vdygpO1xuICAgIHRhc2suX2lkID0gdGhpcy5nZW5lcmF0ZUlkKCk7XG4gICAgcmV0dXJuIHRhc2s7XG4gIH1cblxuICBpc0V4Y2VlZGVkKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGxpbWl0OiBudW1iZXIgPSB0aGlzLmNvbmZpZy5nZXQoJ2xpbWl0Jyk7XG4gICAgY29uc3QgdGFza3M6IElUYXNrW10gPSB0aGlzLmFsbCgpLmZpbHRlcihleGNsdWRlU3BlY2lmaWNUYXNrcyk7XG4gICAgcmV0dXJuICEgKGxpbWl0ID09PSAtMSB8fCBsaW1pdCA+IHRhc2tzLmxlbmd0aCk7XG4gIH1cblxuICBjbGVhcihjaGFubmVsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnN0b3JhZ2UuY2xlYXIoY2hhbm5lbCk7XG4gIH1cbn1cbiIsIi8qIEBmbG93ICovXG5cbmltcG9ydCB0eXBlIElTdG9yYWdlIGZyb20gJy4uLy4uL2ludGVyZmFjZXMvc3RvcmFnZSc7XG5pbXBvcnQgdHlwZSBJQ29uZmlnIGZyb20gJy4uLy4uL2ludGVyZmFjZXMvc3RvcmFnZSc7XG5pbXBvcnQgdHlwZSBJSm9iIGZyb20gJy4uLy4uL2ludGVyZmFjZXMvam9iJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9jYWxTdG9yYWdlIGltcGxlbWVudHMgSVN0b3JhZ2Uge1xuICBzdG9yYWdlOiBPYmplY3Q7XG4gIGNvbmZpZzogSUNvbmZpZztcblxuICBjb25zdHJ1Y3Rvcihjb25maWc6IElDb25maWcpIHtcbiAgICB0aGlzLnN0b3JhZ2UgPSBsb2NhbFN0b3JhZ2U7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gIH1cblxuICBnZXQoa2V5OiBzdHJpbmcpOiBBcnJheTxJSm9ifFtdPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG5hbWUgPSB0aGlzLnN0b3JhZ2VOYW1lKGtleSk7XG4gICAgICByZXR1cm4gdGhpcy5oYXMobmFtZSkgPyBKU09OLnBhcnNlKHRoaXMuc3RvcmFnZS5nZXRJdGVtKG5hbWUpKSA6IFtdO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfVxuXG4gIHNldChrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmFnZS5zZXRJdGVtKHRoaXMuc3RvcmFnZU5hbWUoa2V5KSwgdmFsdWUpO1xuICB9XG5cbiAgaGFzKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGtleSBpbiB0aGlzLnN0b3JhZ2U7XG4gIH1cblxuICBjbGVhcihrZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmFnZS5yZW1vdmVJdGVtKHRoaXMuc3RvcmFnZU5hbWUoa2V5KSk7XG4gIH1cblxuICBjbGVhckFsbCgpOiB2b2lkIHtcbiAgICB0aGlzLnN0b3JhZ2UuY2xlYXIoKTtcbiAgfVxuXG4gIHN0b3JhZ2VOYW1lKHN1ZmZpeDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIGAke3RoaXMuZ2V0UHJlZml4KCl9XyR7c3VmZml4fWA7XG4gIH1cblxuICBnZXRQcmVmaXgoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnLmdldCgncHJlZml4Jyk7XG4gIH1cbn1cbiIsIi8qIEBmbG93ICovXG5pbXBvcnQgdHlwZSBJVGFzayBmcm9tICcuLi9pbnRlcmZhY2VzL3Rhc2snO1xuXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUob2JqOiBPYmplY3QpIHtcbiAgdmFyIG5ld0NsYXNzID0gT2JqZWN0LmNyZWF0ZShcbiAgICBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKSxcbiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvYmopLnJlZHVjZSgocHJvcHMsIG5hbWUpID0+IHtcbiAgICAgIHByb3BzW25hbWVdID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmosIG5hbWUpO1xuICAgICAgcmV0dXJuIHByb3BzO1xuICAgIH0sIHt9KVxuICApO1xuXG4gIGlmICghIE9iamVjdC5pc0V4dGVuc2libGUob2JqKSkge1xuICAgIE9iamVjdC5wcmV2ZW50RXh0ZW5zaW9ucyhuZXdDbGFzcyk7XG4gIH1cbiAgaWYgKE9iamVjdC5pc1NlYWxlZChvYmopKSB7XG4gICAgT2JqZWN0LnNlYWwobmV3Q2xhc3MpO1xuICB9XG4gIGlmIChPYmplY3QuaXNGcm96ZW4ob2JqKSkge1xuICAgIE9iamVjdC5mcmVlemUobmV3Q2xhc3MpO1xuICB9XG5cbiAgcmV0dXJuIG5ld0NsYXNzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzUHJvcGVydHkob2JqOiBGdW5jdGlvbiwgbmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBuYW1lKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc01ldGhvZChpbnN0YW5jZTogYW55LCBtZXRob2Q6IHN0cmluZykge1xuICByZXR1cm4gaW5zdGFuY2UgaW5zdGFuY2VvZiBPYmplY3QgJiYgKG1ldGhvZCBpbiBpbnN0YW5jZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Z1bmN0aW9uKGZ1bmM6IEZ1bmN0aW9uKSB7XG4gIHJldHVybiBmdW5jIGluc3RhbmNlb2YgRnVuY3Rpb247XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleGNsdWRlU3BlY2lmaWNUYXNrcyh0YXNrOiBJVGFzaykge1xuICBjb25zdCBjb25kaXRpb25zID0gQXJyYXkuaXNBcnJheSh0aGlzKSA/IHRoaXMgOiBbJ2ZyZWV6ZWQnLCAnbG9ja2VkJ107XG4gIGNvbnN0IHJlc3VsdHMgPSBbXTtcblxuICBmb3IgKGNvbnN0IGMgb2YgY29uZGl0aW9ucykge1xuICAgIHJlc3VsdHMucHVzaChoYXNQcm9wZXJ0eSh0YXNrLCBjKSA9PT0gZmFsc2UgfHwgdGFza1tjXSA9PT0gZmFsc2UpO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdHMuaW5kZXhPZihmYWxzZSkgPiAtMSA/IGZhbHNlIDogdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHV0aWxDbGVhckJ5VGFnKHRhc2s6IElUYXNrKTogYm9vbGVhbiB7XG4gIGlmICghIGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzLmNhbGwoWydsb2NrZWQnXSwgdGFzaykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRhc2sudGFnID09PSB0aGlzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmlmbyhhOiBJVGFzaywgYjogSVRhc2spIHtcbiAgcmV0dXJuIGEuY3JlYXRlZEF0IC0gYi5jcmVhdGVkQXQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaWZvKGE6IElUYXNrLCBiOiBJVGFzaykge1xuICByZXR1cm4gYi5jcmVhdGVkQXQgLSBhLmNyZWF0ZWRBdDtcbn1cbiIsIi8qKlxuICogR2xvYmFsIE5hbWVzXG4gKi9cblxudmFyIGdsb2JhbHMgPSAvXFxiKEFycmF5fERhdGV8T2JqZWN0fE1hdGh8SlNPTilcXGIvZztcblxuLyoqXG4gKiBSZXR1cm4gaW1tZWRpYXRlIGlkZW50aWZpZXJzIHBhcnNlZCBmcm9tIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSBtYXAgZnVuY3Rpb24gb3IgcHJlZml4XG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdHIsIGZuKXtcbiAgdmFyIHAgPSB1bmlxdWUocHJvcHMoc3RyKSk7XG4gIGlmIChmbiAmJiAnc3RyaW5nJyA9PSB0eXBlb2YgZm4pIGZuID0gcHJlZml4ZWQoZm4pO1xuICBpZiAoZm4pIHJldHVybiBtYXAoc3RyLCBwLCBmbik7XG4gIHJldHVybiBwO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gaW1tZWRpYXRlIGlkZW50aWZpZXJzIGluIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcHJvcHMoc3RyKSB7XG4gIHJldHVybiBzdHJcbiAgICAucmVwbGFjZSgvXFwuXFx3K3xcXHcrICpcXCh8XCJbXlwiXSpcInwnW14nXSonfFxcLyhbXi9dKylcXC8vZywgJycpXG4gICAgLnJlcGxhY2UoZ2xvYmFscywgJycpXG4gICAgLm1hdGNoKC9bYS16QS1aX11cXHcqL2cpXG4gICAgfHwgW107XG59XG5cbi8qKlxuICogUmV0dXJuIGBzdHJgIHdpdGggYHByb3BzYCBtYXBwZWQgd2l0aCBgZm5gLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7QXJyYXl9IHByb3BzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbWFwKHN0ciwgcHJvcHMsIGZuKSB7XG4gIHZhciByZSA9IC9cXC5cXHcrfFxcdysgKlxcKHxcIlteXCJdKlwifCdbXiddKid8XFwvKFteL10rKVxcL3xbYS16QS1aX11cXHcqL2c7XG4gIHJldHVybiBzdHIucmVwbGFjZShyZSwgZnVuY3Rpb24oXyl7XG4gICAgaWYgKCcoJyA9PSBfW18ubGVuZ3RoIC0gMV0pIHJldHVybiBmbihfKTtcbiAgICBpZiAoIX5wcm9wcy5pbmRleE9mKF8pKSByZXR1cm4gXztcbiAgICByZXR1cm4gZm4oXyk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFJldHVybiB1bmlxdWUgYXJyYXkuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHVuaXF1ZShhcnIpIHtcbiAgdmFyIHJldCA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKH5yZXQuaW5kZXhPZihhcnJbaV0pKSBjb250aW51ZTtcbiAgICByZXQucHVzaChhcnJbaV0pO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn1cblxuLyoqXG4gKiBNYXAgd2l0aCBwcmVmaXggYHN0cmAuXG4gKi9cblxuZnVuY3Rpb24gcHJlZml4ZWQoc3RyKSB7XG4gIHJldHVybiBmdW5jdGlvbihfKXtcbiAgICByZXR1cm4gc3RyICsgXztcbiAgfTtcbn1cbiIsIlxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciB0b0Z1bmN0aW9uID0gcmVxdWlyZSgndG8tZnVuY3Rpb24nKTtcblxuLyoqXG4gKiBHcm91cCBgYXJyYCB3aXRoIGNhbGxiYWNrIGBmbih2YWwsIGkpYC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJcbiAqIEBwYXJhbSB7RnVuY3Rpb258U3RyaW5nfSBmbiBvciBwcm9wXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcnIsIGZuKXtcbiAgdmFyIHJldCA9IHt9O1xuICB2YXIgcHJvcDtcbiAgZm4gPSB0b0Z1bmN0aW9uKGZuKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7ICsraSkge1xuICAgIHByb3AgPSBmbihhcnJbaV0sIGkpO1xuICAgIHJldFtwcm9wXSA9IHJldFtwcm9wXSB8fCBbXTtcbiAgICByZXRbcHJvcF0ucHVzaChhcnJbaV0pO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn07IiwiXG4vKipcbiAqIE1vZHVsZSBEZXBlbmRlbmNpZXNcbiAqL1xuXG52YXIgZXhwcjtcbnRyeSB7XG4gIGV4cHIgPSByZXF1aXJlKCdwcm9wcycpO1xufSBjYXRjaChlKSB7XG4gIGV4cHIgPSByZXF1aXJlKCdjb21wb25lbnQtcHJvcHMnKTtcbn1cblxuLyoqXG4gKiBFeHBvc2UgYHRvRnVuY3Rpb24oKWAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB0b0Z1bmN0aW9uO1xuXG4vKipcbiAqIENvbnZlcnQgYG9iamAgdG8gYSBgRnVuY3Rpb25gLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IG9ialxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiB0b0Z1bmN0aW9uKG9iaikge1xuICBzd2l0Y2ggKHt9LnRvU3RyaW5nLmNhbGwob2JqKSkge1xuICAgIGNhc2UgJ1tvYmplY3QgT2JqZWN0XSc6XG4gICAgICByZXR1cm4gb2JqZWN0VG9GdW5jdGlvbihvYmopO1xuICAgIGNhc2UgJ1tvYmplY3QgRnVuY3Rpb25dJzpcbiAgICAgIHJldHVybiBvYmo7XG4gICAgY2FzZSAnW29iamVjdCBTdHJpbmddJzpcbiAgICAgIHJldHVybiBzdHJpbmdUb0Z1bmN0aW9uKG9iaik7XG4gICAgY2FzZSAnW29iamVjdCBSZWdFeHBdJzpcbiAgICAgIHJldHVybiByZWdleHBUb0Z1bmN0aW9uKG9iaik7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBkZWZhdWx0VG9GdW5jdGlvbihvYmopO1xuICB9XG59XG5cbi8qKlxuICogRGVmYXVsdCB0byBzdHJpY3QgZXF1YWxpdHkuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGRlZmF1bHRUb0Z1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqKXtcbiAgICByZXR1cm4gdmFsID09PSBvYmo7XG4gIH07XG59XG5cbi8qKlxuICogQ29udmVydCBgcmVgIHRvIGEgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtSZWdFeHB9IHJlXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHJlZ2V4cFRvRnVuY3Rpb24ocmUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iail7XG4gICAgcmV0dXJuIHJlLnRlc3Qob2JqKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IHByb3BlcnR5IGBzdHJgIHRvIGEgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzdHJpbmdUb0Z1bmN0aW9uKHN0cikge1xuICAvLyBpbW1lZGlhdGUgc3VjaCBhcyBcIj4gMjBcIlxuICBpZiAoL14gKlxcVysvLnRlc3Qoc3RyKSkgcmV0dXJuIG5ldyBGdW5jdGlvbignXycsICdyZXR1cm4gXyAnICsgc3RyKTtcblxuICAvLyBwcm9wZXJ0aWVzIHN1Y2ggYXMgXCJuYW1lLmZpcnN0XCIgb3IgXCJhZ2UgPiAxOFwiIG9yIFwiYWdlID4gMTggJiYgYWdlIDwgMzZcIlxuICByZXR1cm4gbmV3IEZ1bmN0aW9uKCdfJywgJ3JldHVybiAnICsgZ2V0KHN0cikpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYG9iamVjdGAgdG8gYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0XG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG9iamVjdFRvRnVuY3Rpb24ob2JqKSB7XG4gIHZhciBtYXRjaCA9IHt9O1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgbWF0Y2hba2V5XSA9IHR5cGVvZiBvYmpba2V5XSA9PT0gJ3N0cmluZydcbiAgICAgID8gZGVmYXVsdFRvRnVuY3Rpb24ob2JqW2tleV0pXG4gICAgICA6IHRvRnVuY3Rpb24ob2JqW2tleV0pO1xuICB9XG4gIHJldHVybiBmdW5jdGlvbih2YWwpe1xuICAgIGlmICh0eXBlb2YgdmFsICE9PSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xuICAgIGZvciAodmFyIGtleSBpbiBtYXRjaCkge1xuICAgICAgaWYgKCEoa2V5IGluIHZhbCkpIHJldHVybiBmYWxzZTtcbiAgICAgIGlmICghbWF0Y2hba2V5XSh2YWxba2V5XSkpIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG59XG5cbi8qKlxuICogQnVpbHQgdGhlIGdldHRlciBmdW5jdGlvbi4gU3VwcG9ydHMgZ2V0dGVyIHN0eWxlIGZ1bmN0aW9uc1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGdldChzdHIpIHtcbiAgdmFyIHByb3BzID0gZXhwcihzdHIpO1xuICBpZiAoIXByb3BzLmxlbmd0aCkgcmV0dXJuICdfLicgKyBzdHI7XG5cbiAgdmFyIHZhbCwgaSwgcHJvcDtcbiAgZm9yIChpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgcHJvcCA9IHByb3BzW2ldO1xuICAgIHZhbCA9ICdfLicgKyBwcm9wO1xuICAgIHZhbCA9IFwiKCdmdW5jdGlvbicgPT0gdHlwZW9mIFwiICsgdmFsICsgXCIgPyBcIiArIHZhbCArIFwiKCkgOiBcIiArIHZhbCArIFwiKVwiO1xuXG4gICAgLy8gbWltaWMgbmVnYXRpdmUgbG9va2JlaGluZCB0byBhdm9pZCBwcm9ibGVtcyB3aXRoIG5lc3RlZCBwcm9wZXJ0aWVzXG4gICAgc3RyID0gc3RyaXBOZXN0ZWQocHJvcCwgc3RyLCB2YWwpO1xuICB9XG5cbiAgcmV0dXJuIHN0cjtcbn1cblxuLyoqXG4gKiBNaW1pYyBuZWdhdGl2ZSBsb29rYmVoaW5kIHRvIGF2b2lkIHByb2JsZW1zIHdpdGggbmVzdGVkIHByb3BlcnRpZXMuXG4gKlxuICogU2VlOiBodHRwOi8vYmxvZy5zdGV2ZW5sZXZpdGhhbi5jb20vYXJjaGl2ZXMvbWltaWMtbG9va2JlaGluZC1qYXZhc2NyaXB0XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHN0cmlwTmVzdGVkIChwcm9wLCBzdHIsIHZhbCkge1xuICByZXR1cm4gc3RyLnJlcGxhY2UobmV3IFJlZ0V4cCgnKFxcXFwuKT8nICsgcHJvcCwgJ2cnKSwgZnVuY3Rpb24oJDAsICQxKSB7XG4gICAgcmV0dXJuICQxID8gJDAgOiB2YWw7XG4gIH0pO1xufVxuIl19
