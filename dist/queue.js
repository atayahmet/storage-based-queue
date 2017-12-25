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
    console.log('valx', this.config.get("principle"));
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
"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();

var _groupBy = require("group-by");var _groupBy2 = _interopRequireDefault(_groupBy);
var _localstorage = require("./storage/localstorage");var _localstorage2 = _interopRequireDefault(_localstorage);



var _config = require("./config");var _config2 = _interopRequireDefault(_config);
var _utils = require("./utils");function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var

StorageCapsule = function () {




  function StorageCapsule(config, storage) {_classCallCheck(this, StorageCapsule);
    this.storage = storage;
    this.config = config;
  }_createClass(StorageCapsule, [{ key: "channel", value: function channel(

    name) {
      this.storageChannel = name;
      return this;
    } }, { key: "fetch", value: function fetch()

    {
      var all = this.all().filter(_utils.excludeSpecificTasks);
      var tasks = (0, _groupBy2.default)(all, "priority");
      return Object.keys(tasks).
      map(function (key) {return parseInt(key);}).
      sort(function (a, b) {return b - a;}).
      reduce(this.reduceTasks(tasks), []);
    } }, { key: "save", value: function save(

    task) {
      try {
        // get all tasks current channel's
        var tasks = this.storage.get(this.storageChannel);

        // check channel limit.
        // if limit is exceeded, does not insert new task
        if (this.isExceeded()) {
          console.warn("Task limit exceeded: The '" +

          this.storageChannel + "' channel limit is " +
          this.config.get("limit"));

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
    } }, { key: "update", value: function update(

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
    } }, { key: "delete", value: function _delete(

    id) {
      try {
        var data = this.all();
        var index = data.findIndex(function (d) {return d._id === id;});

        if (index < 0) return false;

        delete data[index];

        this.storage.set(
        this.storageChannel,
        JSON.stringify(data.filter(function (d) {return d;})));

        return true;
      } catch (e) {
        return false;
      }
    } }, { key: "all", value: function all()

    {
      return this.storage.get(this.storageChannel);
    } }, { key: "generateId", value: function generateId()

    {
      return ((1 + Math.random()) * 0x10000).toString(16);
    } }, { key: "prepareTask", value: function prepareTask(

    task) {
      task.createdAt = Date.now();
      task._id = this.generateId();
      return task;
    } }, { key: "reduceTasks", value: function reduceTasks(

    tasks) {var _this = this;
      var reduceFunc = function reduceFunc(result, key) {
        if (_this.config.get("principle") === "lifo") {
          return result.concat(tasks[key].sort(_utils.lifo));
        } else {
          return result.concat(tasks[key].sort(_utils.fifo));
        }
      };

      return reduceFunc.bind(this);
    } }, { key: "isExceeded", value: function isExceeded()

    {
      var limit = this.config.get("limit");
      var tasks = this.all().filter(_utils.excludeSpecificTasks);
      return !(limit === -1 || limit > tasks.length);
    } }, { key: "clear", value: function clear(

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvY29uZmlnLmRhdGEuanMiLCJkZXYvY29uZmlnLmpzIiwiZGV2L2NvbnRhaW5lci5qcyIsImRldi9ldmVudC5qcyIsImRldi9pbmRleC5qcyIsImRldi9xdWV1ZS5qcyIsImRldi9zdG9yYWdlLWNhcHN1bGUuanMiLCJkZXYvc3RvcmFnZS9sb2NhbHN0b3JhZ2UuanMiLCJkZXYvdXRpbHMuanMiLCJub2RlX21vZHVsZXMvY29tcG9uZW50LXByb3BzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2dyb3VwLWJ5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3RvLWZ1bmN0aW9uL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztXQ0FlLEFBQ0osQUFDVDtVQUZhLEFBRUwsQUFDUjtXQUhhLEFBR0osQUFDVDtTQUFPLENBSk0sQUFJTCxBQUNSLENBTGEsQUFDYjthLEFBRGEsQUFLRjs7Ozs7QUNIYix1Qzs7QSxBQUVxQixxQkFHbkI7OztvQkFBa0MsS0FBdEIsQUFBc0IsNkVBQUosQUFBSSxzQ0FGbEMsQUFFa0Msa0JBQ2hDO1NBQUEsQUFBSyxNQUFMLEFBQVcsQUFDWjtBLHVEQUVHOztBLFUsQUFBYyxPQUFrQixBQUNsQztXQUFBLEFBQUssT0FBTCxBQUFZLFFBQVosQUFBb0IsQUFDckI7QSx1Q0FFRzs7QSxVQUFtQixBQUNyQjthQUFPLEtBQUEsQUFBSyxPQUFaLEFBQU8sQUFBWSxBQUNwQjtBLHVDQUVHOztBLFVBQWMsQUFDaEI7YUFBTyxPQUFBLEFBQU8sVUFBUCxBQUFpQixlQUFqQixBQUFnQyxLQUFLLEtBQXJDLEFBQTBDLFFBQWpELEFBQU8sQUFBa0QsQUFDMUQ7QSx5Q0FFSzs7QSxZQUF5QixBQUM3QjtXQUFBLEFBQUssU0FBUyxPQUFBLEFBQU8sT0FBUCxBQUFjLElBQUksS0FBbEIsQUFBdUIsUUFBckMsQUFBYyxBQUErQixBQUM5QztBLDBDQUVNOztB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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImV4cG9ydCBkZWZhdWx0IHtcbiAgc3RvcmFnZTogJ2xvY2Fsc3RvcmFnZScsXG4gIHByZWZpeDogJ3NxX2pvYnMnLFxuICB0aW1lb3V0OiAxMDAwLFxuICBsaW1pdDogLTEsXG4gIHByaW5jaXBsZTogJ2ZpZm8nXG59O1xuIiwiLyogQGZsb3cgKi9cbmltcG9ydCB0eXBlIElDb25maWcgZnJvbSAnLi4vaW50ZXJmYWNlcy9jb25maWcnO1xuaW1wb3J0IGNvbmZpZ0RhdGEgZnJvbSAnLi9jb25maWcuZGF0YSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbmZpZyB7XG4gIGNvbmZpZzogSUNvbmZpZyA9IGNvbmZpZ0RhdGE7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBJQ29uZmlnID0ge30pIHtcbiAgICB0aGlzLm1lcmdlKGNvbmZpZyk7XG4gIH1cblxuICBzZXQobmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgdGhpcy5jb25maWdbbmFtZV0gPSB2YWx1ZTtcbiAgfVxuXG4gIGdldChuYW1lOiBzdHJpbmcpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZ1tuYW1lXTtcbiAgfVxuXG4gIGhhcyhuYW1lOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuY29uZmlnLCBuYW1lKTtcbiAgfVxuXG4gIG1lcmdlKGNvbmZpZzoge1tzdHJpbmddOiBhbnl9KSB7XG4gICAgdGhpcy5jb25maWcgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmNvbmZpZywgY29uZmlnKTtcbiAgfVxuXG4gIHJlbW92ZShuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZGVsZXRlIHRoaXMuY29uZmlnW25hbWVdO1xuICB9XG5cbiAgYWxsKCk6IElDb25maWcge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZztcbiAgfVxufVxuIiwiLyogQGZsb3cgKi9cbmltcG9ydCB0eXBlIElDb250YWluZXIgZnJvbSAnLi4vaW50ZXJmYWNlcy9jb250YWluZXInO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb250YWluZXIgaW1wbGVtZW50cyBJQ29udGFpbmVyIHtcblxuICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgX2NvbnRhaW5lcjoge1twcm9wZXJ0eTogc3RyaW5nXTogYW55fSA9IHt9O1xuXG4gIGhhcyhpZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLl9jb250YWluZXIsIGlkKTtcbiAgfVxuXG4gIGdldChpZDogc3RyaW5nKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5fY29udGFpbmVyW2lkXTtcbiAgfVxuXG4gIGFsbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fY29udGFpbmVyO1xuICB9XG5cbiAgYmluZChpZDogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgdGhpcy5fY29udGFpbmVyW2lkXSA9IHZhbHVlO1xuICB9XG5cbiAgcmVtb3ZlKGlkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuX2NvbnRhaW5lciwgaWQpKSB7XG4gICAgICBkZWxldGUgdGhpcy5fY29udGFpbmVyW2lkXTtcbiAgICB9XG4gIH1cblxuICByZW1vdmVBbGwoKTogdm9pZCB7XG4gICAgdGhpcy5fY29udGFpbmVyID0ge307XG4gIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIEV2ZW50IHtcbiAgc3RvcmUgPSB7fTtcbiAgdmVyaWZpZXJQYXR0ZXJuID0gL15bYS16MC05XFwtXFxfXStcXDpiZWZvcmUkfGFmdGVyJHxyZXRyeSR8XFwqJC87XG4gIHdpbGRjYXJkcyA9IFsnKicsICdlcnJvciddO1xuICBlbXB0eUZ1bmMgPSAoKSA9PiB7fTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnN0b3JlLmJlZm9yZSA9IHt9O1xuICAgIHRoaXMuc3RvcmUuYWZ0ZXIgPSB7fTtcbiAgICB0aGlzLnN0b3JlLnJldHJ5ID0ge307XG4gICAgdGhpcy5zdG9yZS53aWxkY2FyZCA9IHt9O1xuICAgIHRoaXMuc3RvcmUuZXJyb3IgPSB0aGlzLmVtcHR5RnVuYztcbiAgICB0aGlzLnN0b3JlWycqJ10gPSB0aGlzLmVtcHR5RnVuYztcbiAgfVxuXG4gIG9uKGtleTogc3RyaW5nLCBjYjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICBpZiAodHlwZW9mKGNiKSAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgbmV3IEVycm9yKCdFdmVudCBzaG91bGQgYmUgYW4gZnVuY3Rpb24nKTtcbiAgICBpZiAodGhpcy5pc1ZhbGlkKGtleSkpIHRoaXMuYWRkKGtleSwgY2IpO1xuICB9XG5cbiAgZW1pdChrZXk6IHN0cmluZywgYXJnczogYW55KSB7XG4gICAgaWYgKHRoaXMud2lsZGNhcmRzLmluZGV4T2Yoa2V5KSA+IC0xKSB7XG4gICAgICB0aGlzLndpbGRjYXJkKGtleSwgLi4uYXJndW1lbnRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgdHlwZSA9IHRoaXMuZ2V0VHlwZShrZXkpO1xuICAgICAgY29uc3QgbmFtZSA9IHRoaXMuZ2V0TmFtZShrZXkpO1xuXG4gICAgICBpZiAodGhpcy5zdG9yZVt0eXBlXSkge1xuICAgICAgICBjb25zdCBjYiA9IHRoaXMuc3RvcmVbdHlwZV1bbmFtZV0gfHwgdGhpcy5lbXB0eUZ1bmM7XG4gICAgICAgIGNiLmNhbGwobnVsbCwgYXJncyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy53aWxkY2FyZCgnKicsIGtleSwgYXJncyk7XG4gIH1cblxuICB3aWxkY2FyZChrZXk6IHN0cmluZywgYWN0aW9uS2V5OiBzdHJpbmcsIGFyZ3M6IGFueSkge1xuICAgIGlmICh0aGlzLnN0b3JlLndpbGRjYXJkW2tleV0pIHtcbiAgICAgIHRoaXMuc3RvcmUud2lsZGNhcmRba2V5XS5jYWxsKG51bGwsIGFjdGlvbktleSwgYXJncyk7XG4gICAgfVxuICB9XG5cbiAgYWRkKGtleTogc3RyaW5nLCBjYjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICBpZiAodGhpcy53aWxkY2FyZHMuaW5kZXhPZihrZXkpID4tMSkge1xuICAgICAgdGhpcy5zdG9yZS53aWxkY2FyZFtrZXldID0gY2I7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHR5cGUgPSB0aGlzLmdldFR5cGUoa2V5KTtcbiAgICAgIGNvbnN0IG5hbWUgPSB0aGlzLmdldE5hbWUoa2V5KTtcbiAgICAgIHRoaXMuc3RvcmVbdHlwZV1bbmFtZV0gPSBjYjtcbiAgICB9XG4gIH1cblxuICBoYXMoa2V5OiBzdHJpbmcpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qga2V5cyA9IGtleS5zcGxpdCgnOicpO1xuICAgICAgcmV0dXJuIGtleXMubGVuZ3RoID4gMSA/ICEhIHRoaXMuc3RvcmVba2V5c1sxXV1ba2V5c1swXV0gOiAhISB0aGlzLnN0b3JlLndpbGRjYXJkW2tleXNbMF1dO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGdldE5hbWUoa2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBrZXkubWF0Y2goLyguKilcXDouKi8pWzFdO1xuICB9XG5cbiAgZ2V0VHlwZShrZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGtleS5tYXRjaCgvXlthLXowLTlcXC1cXF9dK1xcOiguKikvKVsxXTtcbiAgfVxuXG4gIGlzVmFsaWQoa2V5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy52ZXJpZmllclBhdHRlcm4udGVzdChrZXkpIHx8IHRoaXMud2lsZGNhcmRzLmluZGV4T2Yoa2V5KSA+LTE7XG4gIH1cbn1cbiIsImltcG9ydCBRdWV1ZSBmcm9tICcuL3F1ZXVlJztcblxud2luZG93LlF1ZXVlID0gUXVldWU7XG5cbmV4cG9ydCBkZWZhdWx0IFF1ZXVlO1xuIiwiLyogQGZsb3cgKi9cbmltcG9ydCB0eXBlIElDb25maWcgZnJvbSBcIi4uL2ludGVyZmFjZXMvY29uZmlnXCI7XG5pbXBvcnQgdHlwZSBJVGFzayBmcm9tIFwiLi4vaW50ZXJmYWNlcy90YXNrXCI7XG5pbXBvcnQgdHlwZSBJSm9iIGZyb20gXCIuLi9pbnRlcmZhY2VzL2pvYlwiO1xuaW1wb3J0IENvbnRhaW5lciBmcm9tIFwiLi9jb250YWluZXJcIjtcbmltcG9ydCBTdG9yYWdlQ2Fwc3VsZSBmcm9tIFwiLi9zdG9yYWdlLWNhcHN1bGVcIjtcbmltcG9ydCBDb25maWcgZnJvbSBcIi4vY29uZmlnXCI7XG5pbXBvcnQgRXZlbnQgZnJvbSBcIi4vZXZlbnRcIjtcbmltcG9ydCB7XG4gIGNsb25lLFxuICBoYXNNZXRob2QsXG4gIGlzRnVuY3Rpb24sXG4gIGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzLFxuICB1dGlsQ2xlYXJCeVRhZ1xufSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IExvY2FsU3RvcmFnZSBmcm9tIFwiLi9zdG9yYWdlL2xvY2Fsc3RvcmFnZVwiO1xuXG5pbnRlcmZhY2UgSUpvYkluc3RhbmNlIHtcbiAgcHJpb3JpdHk6IG51bWJlcjtcbiAgcmV0cnk6IG51bWJlcjtcbiAgaGFuZGxlKGFyZ3M6IGFueSk6IGFueTtcbiAgYmVmb3JlKGFyZ3M6IGFueSk6IHZvaWQ7XG4gIGFmdGVyKGFyZ3M6IGFueSk6IHZvaWQ7XG59XG5cbmxldCBRdWV1ZSA9ICgoKSA9PiB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIFF1ZXVlLkZJRk8gPSBcImZpZm9cIjtcbiAgUXVldWUuTElGTyA9IFwibGlmb1wiO1xuXG4gIGZ1bmN0aW9uIFF1ZXVlKGNvbmZpZzogSUNvbmZpZykge1xuICAgIF9jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsIGNvbmZpZyk7XG4gIH1cblxuICBmdW5jdGlvbiBfY29uc3RydWN0b3IoY29uZmlnKSB7XG4gICAgdGhpcy5jdXJyZW50Q2hhbm5lbDtcbiAgICB0aGlzLmN1cnJlbnRUaW1lb3V0O1xuICAgIHRoaXMuc3RvcHBlZCA9IHRydWU7XG4gICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgdGhpcy5jaGFubmVscyA9IHt9O1xuICAgIHRoaXMuY29uZmlnID0gbmV3IENvbmZpZyhjb25maWcpO1xuICAgIHRoaXMuc3RvcmFnZSA9IG5ldyBTdG9yYWdlQ2Fwc3VsZShcbiAgICAgIHRoaXMuY29uZmlnLFxuICAgICAgbmV3IExvY2FsU3RvcmFnZSh0aGlzLmNvbmZpZylcbiAgICApO1xuICAgIHRoaXMuZXZlbnQgPSBuZXcgRXZlbnQoKTtcbiAgICB0aGlzLmNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoKTtcbiAgICB0aGlzLnRpbWVvdXQgPSB0aGlzLmNvbmZpZy5nZXQoXCJ0aW1lb3V0XCIpO1xuICB9XG5cbiAgUXVldWUucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKHRhc2spIHtcbiAgICBjb25zdCBpZCA9IHNhdmVUYXNrLmNhbGwodGhpcywgdGFzayk7XG5cbiAgICBpZiAoaWQgJiYgdGhpcy5zdG9wcGVkICYmIHRoaXMucnVubmluZyA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy5zdGFydCgpO1xuICAgIH1cblxuICAgIHJldHVybiBpZDtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnN0b3BwZWQpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiW3N0b3BwZWRdLT4gbmV4dFwiKTtcbiAgICAgIHN0YXR1c09mZi5jYWxsKHRoaXMpO1xuICAgICAgcmV0dXJuIHN0b3BRdWV1ZS5jYWxsKHRoaXMpO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyhcIltuZXh0XS0+XCIpO1xuICAgIHRoaXMuc3RhcnQoKTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpOiBib29sZWFuIHtcbiAgICAvLyBTdG9wIHRoZSBxdWV1ZSBmb3IgcmVzdGFydFxuICAgIHRoaXMuc3RvcHBlZCA9IGZhbHNlO1xuXG4gICAgLy8gUmVnaXN0ZXIgdGFza3MsIGlmIG5vdCByZWdpc3RlcmVkXG4gICAgcmVnaXN0ZXJKb2JzLmNhbGwodGhpcyk7XG5cbiAgICAvLyBDcmVhdGUgYSB0aW1lb3V0IGZvciBzdGFydCBxdWV1ZVxuICAgIHRoaXMucnVubmluZyA9IGNyZWF0ZVRpbWVvdXQuY2FsbCh0aGlzKSA+IDA7XG4gICAgY29uc29sZS5sb2coXCJbc3RhcnRlZF0tPlwiLCB0aGlzLnJ1bm5pbmcpO1xuICAgIHJldHVybiB0aGlzLnJ1bm5pbmc7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZyhcIltzdG9wcGluZ10tPlwiKTtcbiAgICB0aGlzLnN0b3BwZWQgPSB0cnVlOyAvL3RoaXMucnVubmluZztcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuZm9yY2VTdG9wID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coXCJbZm9yY2VTdG9wcGVkXS0+XCIpO1xuICAgIHN0b3BRdWV1ZS5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbihjaGFubmVsOiBzdHJpbmcpIHtcbiAgICBpZiAoIShjaGFubmVsIGluIHRoaXMuY2hhbm5lbHMpKSB7XG4gICAgICB0aGlzLmN1cnJlbnRDaGFubmVsID0gY2hhbm5lbDtcbiAgICAgIHRoaXMuY2hhbm5lbHNbY2hhbm5lbF0gPSBjbG9uZSh0aGlzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5jaGFubmVsc1tjaGFubmVsXTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuY2hhbm5lbCA9IGZ1bmN0aW9uKG5hbWU6IHN0cmluZykge1xuICAgIGlmICghdGhpcy5jaGFubmVsc1tuYW1lXSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDaGFubmVsIG9mIFwiJHtuYW1lfVwiIG5vdCBmb3VuZGApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmNoYW5uZWxzW25hbWVdO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5pc0VtcHR5ID0gZnVuY3Rpb24oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY291bnQoKSA8IDE7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLmNvdW50ID0gZnVuY3Rpb24oKTogQXJyYXk8SVRhc2s+IHtcbiAgICByZXR1cm4gZ2V0VGFza3NXaXRob3V0RnJlZXplZC5jYWxsKHRoaXMpLmxlbmd0aDtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuY291bnRCeVRhZyA9IGZ1bmN0aW9uKHRhZzogc3RyaW5nKTogQXJyYXk8SVRhc2s+IHtcbiAgICByZXR1cm4gZ2V0VGFza3NXaXRob3V0RnJlZXplZC5jYWxsKHRoaXMpLmZpbHRlcih0ID0+IHQudGFnID09PSB0YWcpLmxlbmd0aDtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5jdXJyZW50Q2hhbm5lbCkge1xuICAgICAgdGhpcy5zdG9yYWdlLmNsZWFyKHRoaXMuY3VycmVudENoYW5uZWwpO1xuICAgIH1cbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuY2xlYXJCeVRhZyA9IGZ1bmN0aW9uKHRhZzogc3RyaW5nKTogdm9pZCB7XG4gICAgZGJcbiAgICAgIC5jYWxsKHRoaXMpXG4gICAgICAuYWxsKClcbiAgICAgIC5maWx0ZXIodXRpbENsZWFyQnlUYWcuYmluZCh0YWcpKVxuICAgICAgLmZvckVhY2godCA9PiBkYi5jYWxsKHRoaXMpLmRlbGV0ZSh0Ll9pZCkpO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbihpZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGdldFRhc2tzV2l0aG91dEZyZWV6ZWQuY2FsbCh0aGlzKS5maW5kSW5kZXgodCA9PiB0Ll9pZCA9PT0gaWQpID4gLTE7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLmhhc0J5VGFnID0gZnVuY3Rpb24odGFnOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZ2V0VGFza3NXaXRob3V0RnJlZXplZC5jYWxsKHRoaXMpLmZpbmRJbmRleCh0ID0+IHQudGFnID09PSB0YWcpID4gLTE7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLnNldFRpbWVvdXQgPSBmdW5jdGlvbih2YWw6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMudGltZW91dCA9IHZhbDtcbiAgICB0aGlzLmNvbmZpZy5zZXQoXCJ0aW1lb3V0XCIsIHZhbCk7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLnNldExpbWl0ID0gZnVuY3Rpb24odmFsOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLmNvbmZpZy5zZXQoXCJsaW1pdFwiLCB2YWwpO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5zZXRQcmVmaXggPSBmdW5jdGlvbih2YWw6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuY29uZmlnLnNldChcInByZWZpeFwiLCB2YWwpO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5zZXRQcmluY2lwbGUgPSBmdW5jdGlvbih2YWw6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuY29uZmlnLnNldChcInByaW5jaXBsZVwiLCB2YWwpO1xuICAgIGNvbnNvbGUubG9nKCd2YWx4JywgdGhpcy5jb25maWcuZ2V0KFwicHJpbmNpcGxlXCIpKTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUub24gPSBmdW5jdGlvbihrZXk6IHN0cmluZywgY2I6IEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgdGhpcy5ldmVudC5vbiguLi5hcmd1bWVudHMpO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5lcnJvciA9IGZ1bmN0aW9uKGNiOiBGdW5jdGlvbik6IHZvaWQge1xuICAgIHRoaXMuZXZlbnQub24oXCJlcnJvclwiLCBjYik7XG4gIH07XG5cbiAgUXVldWUucmVnaXN0ZXIgPSBmdW5jdGlvbihqb2JzOiBBcnJheTxJSm9iPikge1xuICAgIGlmICghKGpvYnMgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlF1ZXVlIGpvYnMgc2hvdWxkIGJlIG9iamVjdHMgd2l0aGluIGFuIGFycmF5XCIpO1xuICAgIH1cblxuICAgIFF1ZXVlLmlzUmVnaXN0ZXJlZCA9IGZhbHNlO1xuICAgIFF1ZXVlLmpvYnMgPSBqb2JzO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGdldFRhc2tzV2l0aG91dEZyZWV6ZWQoKSB7XG4gICAgcmV0dXJuIGRiXG4gICAgICAuY2FsbCh0aGlzKVxuICAgICAgLmFsbCgpXG4gICAgICAuZmlsdGVyKGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzLmJpbmQoW1wiZnJlZXplZFwiXSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gZGlzcGF0Y2hFdmVudHModGFzazogSVRhc2ssIHR5cGU6IHN0cmluZykge1xuICAgIGlmIChcInRhZ1wiIGluIHRhc2spIHtcbiAgICAgIHRoaXMuZXZlbnQuZW1pdChgJHt0YXNrLnRhZ306JHt0eXBlfWAsIHRhc2spO1xuICAgICAgdGhpcy5ldmVudC5lbWl0KGAke3Rhc2sudGFnfToqYCwgdGFzayk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZGIoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmFnZS5jaGFubmVsKHRoaXMuY3VycmVudENoYW5uZWwpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2F2ZVRhc2sodGFzazogSVRhc2spIHtcbiAgICByZXR1cm4gZGIuY2FsbCh0aGlzKS5zYXZlKHRhc2spO1xuICB9XG5cbiAgZnVuY3Rpb24gc2F2ZVRhc2sodGFzazogSVRhc2spIHtcbiAgICByZXR1cm4gZGIuY2FsbCh0aGlzKS5zYXZlKGNoZWNrUHJpb3JpdHkodGFzaykpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tQcmlvcml0eSh0YXNrOiBJVGFzaykge1xuICAgIHRhc2sucHJpb3JpdHkgPSB0YXNrLnByaW9yaXR5IHx8IDA7XG5cbiAgICBpZiAoaXNOYU4odGFzay5wcmlvcml0eSkpIHRhc2sucHJpb3JpdHkgPSAwO1xuXG4gICAgcmV0dXJuIHRhc2s7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVUaW1lb3V0KCk6IG51bWJlciB7XG4gICAgY29uc3QgdGltZW91dCA9IHRoaXMuY29uZmlnLmdldChcInRpbWVvdXRcIik7XG4gICAgcmV0dXJuICh0aGlzLmN1cnJlbnRUaW1lb3V0ID0gc2V0VGltZW91dChsb29wSGFuZGxlci5iaW5kKHRoaXMpLCB0aW1lb3V0KSk7XG4gIH1cblxuICBmdW5jdGlvbiBsb2NrVGFzayh0YXNrKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGRiLmNhbGwodGhpcykudXBkYXRlKHRhc2suX2lkLCB7IGxvY2tlZDogdHJ1ZSB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZVRhc2soaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBkYi5jYWxsKHRoaXMpLmRlbGV0ZShpZCk7XG4gIH1cblxuICBmdW5jdGlvbiBsb29wSGFuZGxlcigpOiB2b2lkIHtcbiAgICBjb25zdCBzZWxmOiBRdWV1ZSA9IHRoaXM7XG4gICAgY29uc3QgdGFzazogSVRhc2sgPSBkYlxuICAgICAgLmNhbGwoc2VsZilcbiAgICAgIC5mZXRjaCgpXG4gICAgICAuc2hpZnQoKTtcblxuICAgIGlmICh0YXNrID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnNvbGUubG9nKGAtPiAke3RoaXMuY3VycmVudENoYW5uZWx9IGNoYW5uZWwgaXMgZW1wdHkuLi5gKTtcbiAgICAgIHN0b3BRdWV1ZS5jYWxsKHRoaXMpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghc2VsZi5jb250YWluZXIuaGFzKHRhc2suaGFuZGxlcikpIHtcbiAgICAgIGNvbnNvbGUud2Fybih0YXNrLmhhbmRsZXIgKyBcIi0+IGpvYiBub3QgZm91bmRcIik7XG4gICAgfVxuXG4gICAgY29uc3Qgam9iOiBJSm9iID0gc2VsZi5jb250YWluZXIuZ2V0KHRhc2suaGFuZGxlcik7XG4gICAgY29uc3Qgam9iSW5zdGFuY2U6IElKb2JJbnN0YW5jZSA9IG5ldyBqb2IuaGFuZGxlcigpO1xuXG4gICAgLy8gbG9jayB0aGUgY3VycmVudCB0YXNrIGZvciBwcmV2ZW50IHJhY2UgY29uZGl0aW9uXG4gICAgbG9ja1Rhc2suY2FsbChzZWxmLCB0YXNrKTtcblxuICAgIC8vIGZpcmUgam9iIGJlZm9yZSBldmVudFxuICAgIGZpcmVKb2JJbmxpbmVFdmVudC5jYWxsKHRoaXMsIFwiYmVmb3JlXCIsIGpvYkluc3RhbmNlLCB0YXNrLmFyZ3MpO1xuXG4gICAgLy8gZGlzcGFjdGggY3VzdG9tIGJlZm9yZSBldmVudFxuICAgIGRpc3BhdGNoRXZlbnRzLmNhbGwodGhpcywgdGFzaywgXCJiZWZvcmVcIik7XG5cbiAgICAvLyBwcmVwYXJpbmcgd29ya2VyIGRlcGVuZGVuY2llc1xuICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9IE9iamVjdC52YWx1ZXMoam9iLmRlcHMgfHwge30pO1xuXG4gICAgLy8gVGFzayBydW5uZXIgcHJvbWlzZVxuICAgIGpvYkluc3RhbmNlLmhhbmRsZVxuICAgICAgLmNhbGwoam9iSW5zdGFuY2UsIHRhc2suYXJncywgLi4uZGVwZW5kZW5jaWVzKVxuICAgICAgLnRoZW4oam9iUmVzcG9uc2UuY2FsbChzZWxmLCB0YXNrLCBqb2JJbnN0YW5jZSkuYmluZChzZWxmKSlcbiAgICAgIC5jYXRjaChqb2JGYWlsZWRSZXNwb25zZS5jYWxsKHNlbGYsIHRhc2ssIGpvYkluc3RhbmNlKS5iaW5kKHNlbGYpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGpvYlJlc3BvbnNlKHRhc2s6IElUYXNrLCBqb2I6IElKb2JJbnN0YW5jZSk6IEZ1bmN0aW9uIHtcbiAgICBjb25zdCBzZWxmOiBRdWV1ZSA9IHRoaXM7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHJlc3VsdDogYm9vbGVhbikge1xuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICBzdWNjZXNzUHJvY2Vzcy5jYWxsKHNlbGYsIHRhc2ssIGpvYik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXRyeVByb2Nlc3MuY2FsbChzZWxmLCB0YXNrLCBqb2IpO1xuICAgICAgfVxuXG4gICAgICAvLyBmaXJlIGpvYiBhZnRlciBldmVudFxuICAgICAgZmlyZUpvYklubGluZUV2ZW50LmNhbGwodGhpcywgXCJhZnRlclwiLCBqb2IsIHRhc2suYXJncyk7XG5cbiAgICAgIC8vIGRpc3BhY3RoIGN1c3RvbSBhZnRlciBldmVudFxuICAgICAgZGlzcGF0Y2hFdmVudHMuY2FsbCh0aGlzLCB0YXNrLCBcImFmdGVyXCIpO1xuXG4gICAgICAvLyB0cnkgbmV4dCBxdWV1ZSBqb2JcbiAgICAgIHNlbGYubmV4dCgpO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBqb2JGYWlsZWRSZXNwb25zZSh0YXNrOiBJVGFzaywgam9iOiBJSm9iSW5zdGFuY2UpOiBGdW5jdGlvbiB7XG4gICAgcmV0dXJuIChyZXN1bHQ6IGJvb2xlYW4pID0+IHtcbiAgICAgIHJlbW92ZVRhc2suY2FsbCh0aGlzLCB0YXNrLl9pZCk7XG5cbiAgICAgIHRoaXMuZXZlbnQuZW1pdChcImVycm9yXCIsIHRhc2spO1xuXG4gICAgICB0aGlzLm5leHQoKTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gZmlyZUpvYklubGluZUV2ZW50KFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBqb2I6IElKb2JJbnN0YW5jZSxcbiAgICBhcmdzOiBhbnlcbiAgKTogdm9pZCB7XG4gICAgaWYgKCFoYXNNZXRob2Qoam9iLCBuYW1lKSkgcmV0dXJuO1xuXG4gICAgaWYgKG5hbWUgPT0gXCJiZWZvcmVcIiAmJiBpc0Z1bmN0aW9uKGpvYi5iZWZvcmUpKSB7XG4gICAgICBqb2IuYmVmb3JlLmNhbGwoam9iLCBhcmdzKTtcbiAgICB9IGVsc2UgaWYgKG5hbWUgPT0gXCJhZnRlclwiICYmIGlzRnVuY3Rpb24oam9iLmFmdGVyKSkge1xuICAgICAgam9iLmFmdGVyLmNhbGwoam9iLCBhcmdzKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzdGF0dXNPZmYoKTogdm9pZCB7XG4gICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBzdG9wUXVldWUoKTogdm9pZCB7XG4gICAgdGhpcy5zdG9wKCk7XG5cbiAgICBpZiAodGhpcy5jdXJyZW50VGltZW91dCkge1xuICAgICAgLy8gdW5zZXQgY3VycmVudCB0aW1lb3V0IHZhbHVlXG4gICAgICB0aGlzLmN1cnJlbnRUaW1lb3V0ID0gY2xlYXJUaW1lb3V0KHRoaXMuY3VycmVudFRpbWVvdXQpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHN1Y2Nlc3NQcm9jZXNzKHRhc2s6IElUYXNrLCBqb2I6IElKb2JJbnN0YW5jZSk6IHZvaWQge1xuICAgIHJlbW92ZVRhc2suY2FsbCh0aGlzLCB0YXNrLl9pZCk7XG4gIH1cblxuICBmdW5jdGlvbiByZXRyeVByb2Nlc3ModGFzazogSVRhc2ssIGpvYjogSUpvYkluc3RhbmNlKTogYm9vbGVhbiB7XG4gICAgLy8gZGlzcGFjdGggY3VzdG9tIHJldHJ5IGV2ZW50XG4gICAgZGlzcGF0Y2hFdmVudHMuY2FsbCh0aGlzLCB0YXNrLCBcInJldHJ5XCIpO1xuXG4gICAgLy8gdXBkYXRlIHJldHJ5IHZhbHVlXG4gICAgbGV0IHVwZGF0ZVRhc2s6IElUYXNrID0gdXBkYXRlUmV0cnkuY2FsbCh0aGlzLCB0YXNrLCBqb2IpO1xuXG4gICAgLy8gZGVsZXRlIGxvY2sgcHJvcGVydHkgZm9yIG5leHQgcHJvY2Vzc1xuICAgIHVwZGF0ZVRhc2subG9ja2VkID0gZmFsc2U7XG5cbiAgICByZXR1cm4gZGIuY2FsbCh0aGlzKS51cGRhdGUodGFzay5faWQsIHVwZGF0ZVRhc2spO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlUmV0cnkodGFzazogSVRhc2ssIGpvYjogSUpvYkluc3RhbmNlKTogSVRhc2sge1xuICAgIGlmICghKFwicmV0cnlcIiBpbiBqb2IpKSB7XG4gICAgICBqb2IucmV0cnkgPSAxO1xuICAgIH1cblxuICAgIGlmICghKFwidHJpZWRcIiBpbiB0YXNrKSkge1xuICAgICAgdGFzay50cmllZCA9IDA7XG4gICAgICB0YXNrLnJldHJ5ID0gam9iLnJldHJ5O1xuICAgIH1cblxuICAgICsrdGFzay50cmllZDtcblxuICAgIGlmICh0YXNrLnRyaWVkID49IGpvYi5yZXRyeSkge1xuICAgICAgdGFzay5mcmVlemVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGFzaztcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlZ2lzdGVySm9icygpOiB2b2lkIHtcbiAgICBpZiAoUXVldWUuaXNSZWdpc3RlcmVkKSByZXR1cm47XG5cbiAgICBjb25zdCBqb2JzID0gUXVldWUuam9icyB8fCBbXTtcblxuICAgIGZvciAoY29uc3Qgam9iIG9mIGpvYnMpIHtcbiAgICAgIGNvbnN0IGZ1bmNTdHIgPSBqb2IuaGFuZGxlci50b1N0cmluZygpO1xuICAgICAgY29uc3QgW3N0ckZ1bmN0aW9uLCBuYW1lXSA9IGZ1bmNTdHIubWF0Y2goL2Z1bmN0aW9uXFxzKFthLXpBLVpfXSspLio/Lyk7XG4gICAgICBpZiAobmFtZSkgdGhpcy5jb250YWluZXIuYmluZChuYW1lLCBqb2IpO1xuICAgIH1cblxuICAgIFF1ZXVlLmlzUmVnaXN0ZXJlZCA9IHRydWU7XG4gIH1cblxuICByZXR1cm4gUXVldWU7XG59KSgpO1xuXG5leHBvcnQgZGVmYXVsdCBRdWV1ZTtcbiIsIi8qIEBmbG93ICovXG5cbmltcG9ydCBncm91cEJ5IGZyb20gXCJncm91cC1ieVwiO1xuaW1wb3J0IExvY2FsU3RvcmFnZSBmcm9tIFwiLi9zdG9yYWdlL2xvY2Fsc3RvcmFnZVwiO1xuaW1wb3J0IHR5cGUgSUNvbmZpZyBmcm9tIFwiLi4vaW50ZXJmYWNlcy9jb25maWdcIjtcbmltcG9ydCB0eXBlIElTdG9yYWdlIGZyb20gXCIuLi9pbnRlcmZhY2VzL3N0b3JhZ2VcIjtcbmltcG9ydCB0eXBlIElUYXNrIGZyb20gXCIuLi9pbnRlcmZhY2VzL3Rhc2tcIjtcbmltcG9ydCBDb25maWcgZnJvbSBcIi4vY29uZmlnXCI7XG5pbXBvcnQgeyBleGNsdWRlU3BlY2lmaWNUYXNrcywgbGlmbywgZmlmbyB9IGZyb20gXCIuL3V0aWxzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0b3JhZ2VDYXBzdWxlIHtcbiAgY29uZmlnOiBJQ29uZmlnO1xuICBzdG9yYWdlOiBJU3RvcmFnZTtcbiAgc3RvcmFnZUNoYW5uZWw6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcihjb25maWc6IElDb25maWcsIHN0b3JhZ2U6IElTdG9yYWdlKSB7XG4gICAgdGhpcy5zdG9yYWdlID0gc3RvcmFnZTtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgfVxuXG4gIGNoYW5uZWwobmFtZTogc3RyaW5nKTogU3RvcmFnZUNhcHN1bGUge1xuICAgIHRoaXMuc3RvcmFnZUNoYW5uZWwgPSBuYW1lO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZmV0Y2goKTogQXJyYXk8YW55PiB7XG4gICAgY29uc3QgYWxsID0gdGhpcy5hbGwoKS5maWx0ZXIoZXhjbHVkZVNwZWNpZmljVGFza3MpO1xuICAgIGNvbnN0IHRhc2tzID0gZ3JvdXBCeShhbGwsIFwicHJpb3JpdHlcIik7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRhc2tzKVxuICAgICAgLm1hcChrZXkgPT4gcGFyc2VJbnQoa2V5KSlcbiAgICAgIC5zb3J0KChhLCBiKSA9PiBiIC0gYSlcbiAgICAgIC5yZWR1Y2UodGhpcy5yZWR1Y2VUYXNrcyh0YXNrcyksIFtdKTtcbiAgfVxuXG4gIHNhdmUodGFzazogSVRhc2spOiBzdHJpbmcgfCBib29sZWFuIHtcbiAgICB0cnkge1xuICAgICAgLy8gZ2V0IGFsbCB0YXNrcyBjdXJyZW50IGNoYW5uZWwnc1xuICAgICAgY29uc3QgdGFza3M6IElUYXNrW10gPSB0aGlzLnN0b3JhZ2UuZ2V0KHRoaXMuc3RvcmFnZUNoYW5uZWwpO1xuXG4gICAgICAvLyBjaGVjayBjaGFubmVsIGxpbWl0LlxuICAgICAgLy8gaWYgbGltaXQgaXMgZXhjZWVkZWQsIGRvZXMgbm90IGluc2VydCBuZXcgdGFza1xuICAgICAgaWYgKHRoaXMuaXNFeGNlZWRlZCgpKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICBgVGFzayBsaW1pdCBleGNlZWRlZDogVGhlICcke1xuICAgICAgICAgICAgdGhpcy5zdG9yYWdlQ2hhbm5lbFxuICAgICAgICAgIH0nIGNoYW5uZWwgbGltaXQgaXMgJHt0aGlzLmNvbmZpZy5nZXQoXCJsaW1pdFwiKX1gXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gcHJlcGFyZSBhbGwgcHJvcGVydGllcyBiZWZvcmUgc2F2ZVxuICAgICAgLy8gZXhhbXBsZTogY3JlYXRlZEF0IGV0Yy5cbiAgICAgIHRhc2sgPSB0aGlzLnByZXBhcmVUYXNrKHRhc2spO1xuXG4gICAgICAvLyBhZGQgdGFzayB0byBzdG9yYWdlXG4gICAgICB0YXNrcy5wdXNoKHRhc2spO1xuXG4gICAgICAvLyBzYXZlIHRhc2tzXG4gICAgICB0aGlzLnN0b3JhZ2Uuc2V0KHRoaXMuc3RvcmFnZUNoYW5uZWwsIEpTT04uc3RyaW5naWZ5KHRhc2tzKSk7XG5cbiAgICAgIHJldHVybiB0YXNrLl9pZDtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlKGlkOiBzdHJpbmcsIHVwZGF0ZTogeyBbcHJvcGVydHk6IHN0cmluZ106IGFueSB9KTogYm9vbGVhbiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRhdGE6IGFueVtdID0gdGhpcy5hbGwoKTtcbiAgICAgIGNvbnN0IGluZGV4OiBudW1iZXIgPSBkYXRhLmZpbmRJbmRleCh0ID0+IHQuX2lkID09IGlkKTtcblxuICAgICAgaWYgKGluZGV4IDwgMCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAvLyBtZXJnZSBleGlzdGluZyBvYmplY3Qgd2l0aCBnaXZlbiB1cGRhdGUgb2JqZWN0XG4gICAgICBkYXRhW2luZGV4XSA9IE9iamVjdC5hc3NpZ24oe30sIGRhdGFbaW5kZXhdLCB1cGRhdGUpO1xuXG4gICAgICAvLyBzYXZlIHRvIHRoZSBzdG9yYWdlIGFzIHN0cmluZ1xuICAgICAgdGhpcy5zdG9yYWdlLnNldCh0aGlzLnN0b3JhZ2VDaGFubmVsLCBKU09OLnN0cmluZ2lmeShkYXRhKSk7XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBkZWxldGUoaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkYXRhOiBhbnlbXSA9IHRoaXMuYWxsKCk7XG4gICAgICBjb25zdCBpbmRleDogbnVtYmVyID0gZGF0YS5maW5kSW5kZXgoZCA9PiBkLl9pZCA9PT0gaWQpO1xuXG4gICAgICBpZiAoaW5kZXggPCAwKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIGRlbGV0ZSBkYXRhW2luZGV4XTtcblxuICAgICAgdGhpcy5zdG9yYWdlLnNldChcbiAgICAgICAgdGhpcy5zdG9yYWdlQ2hhbm5lbCxcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkoZGF0YS5maWx0ZXIoZCA9PiBkKSlcbiAgICAgICk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgYWxsKCk6IEFycmF5PGFueT4ge1xuICAgIHJldHVybiB0aGlzLnN0b3JhZ2UuZ2V0KHRoaXMuc3RvcmFnZUNoYW5uZWwpO1xuICB9XG5cbiAgZ2VuZXJhdGVJZCgpOiBzdHJpbmcge1xuICAgIHJldHVybiAoKDEgKyBNYXRoLnJhbmRvbSgpKSAqIDB4MTAwMDApLnRvU3RyaW5nKDE2KTtcbiAgfVxuXG4gIHByZXBhcmVUYXNrKHRhc2s6IElUYXNrKTogSVRhc2sge1xuICAgIHRhc2suY3JlYXRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICB0YXNrLl9pZCA9IHRoaXMuZ2VuZXJhdGVJZCgpO1xuICAgIHJldHVybiB0YXNrO1xuICB9XG5cbiAgcmVkdWNlVGFza3ModGFza3M6IElUYXNrW10pIHtcbiAgICBjb25zdCByZWR1Y2VGdW5jID0gKHJlc3VsdDogSVRhc2tbXSwga2V5OiBhbnkpID0+IHtcbiAgICAgIGlmICh0aGlzLmNvbmZpZy5nZXQoXCJwcmluY2lwbGVcIikgPT09IFwibGlmb1wiKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQuY29uY2F0KHRhc2tzW2tleV0uc29ydChsaWZvKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVzdWx0LmNvbmNhdCh0YXNrc1trZXldLnNvcnQoZmlmbykpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gcmVkdWNlRnVuYy5iaW5kKHRoaXMpO1xuICB9XG5cbiAgaXNFeGNlZWRlZCgpOiBib29sZWFuIHtcbiAgICBjb25zdCBsaW1pdDogbnVtYmVyID0gdGhpcy5jb25maWcuZ2V0KFwibGltaXRcIik7XG4gICAgY29uc3QgdGFza3M6IElUYXNrW10gPSB0aGlzLmFsbCgpLmZpbHRlcihleGNsdWRlU3BlY2lmaWNUYXNrcyk7XG4gICAgcmV0dXJuICEobGltaXQgPT09IC0xIHx8IGxpbWl0ID4gdGFza3MubGVuZ3RoKTtcbiAgfVxuXG4gIGNsZWFyKGNoYW5uZWw6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmFnZS5jbGVhcihjaGFubmVsKTtcbiAgfVxufVxuIiwiLyogQGZsb3cgKi9cblxuaW1wb3J0IHR5cGUgSVN0b3JhZ2UgZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9zdG9yYWdlJztcbmltcG9ydCB0eXBlIElDb25maWcgZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9zdG9yYWdlJztcbmltcG9ydCB0eXBlIElKb2IgZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9qb2InO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMb2NhbFN0b3JhZ2UgaW1wbGVtZW50cyBJU3RvcmFnZSB7XG4gIHN0b3JhZ2U6IE9iamVjdDtcbiAgY29uZmlnOiBJQ29uZmlnO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogSUNvbmZpZykge1xuICAgIHRoaXMuc3RvcmFnZSA9IGxvY2FsU3RvcmFnZTtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgfVxuXG4gIGdldChrZXk6IHN0cmluZyk6IEFycmF5PElKb2J8W10+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgbmFtZSA9IHRoaXMuc3RvcmFnZU5hbWUoa2V5KTtcbiAgICAgIHJldHVybiB0aGlzLmhhcyhuYW1lKSA/IEpTT04ucGFyc2UodGhpcy5zdG9yYWdlLmdldEl0ZW0obmFtZSkpIDogW107XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICB9XG5cbiAgc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5zdG9yYWdlLnNldEl0ZW0odGhpcy5zdG9yYWdlTmFtZShrZXkpLCB2YWx1ZSk7XG4gIH1cblxuICBoYXMoa2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4ga2V5IGluIHRoaXMuc3RvcmFnZTtcbiAgfVxuXG4gIGNsZWFyKGtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5zdG9yYWdlLnJlbW92ZUl0ZW0odGhpcy5zdG9yYWdlTmFtZShrZXkpKTtcbiAgfVxuXG4gIGNsZWFyQWxsKCk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmFnZS5jbGVhcigpO1xuICB9XG5cbiAgc3RvcmFnZU5hbWUoc3VmZml4OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gYCR7dGhpcy5nZXRQcmVmaXgoKX1fJHtzdWZmaXh9YDtcbiAgfVxuXG4gIGdldFByZWZpeCgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWcuZ2V0KCdwcmVmaXgnKTtcbiAgfVxufVxuIiwiLyogQGZsb3cgKi9cbmltcG9ydCB0eXBlIElUYXNrIGZyb20gJy4uL2ludGVyZmFjZXMvdGFzayc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZShvYmo6IE9iamVjdCkge1xuICB2YXIgbmV3Q2xhc3MgPSBPYmplY3QuY3JlYXRlKFxuICAgIE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopLFxuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG9iaikucmVkdWNlKChwcm9wcywgbmFtZSkgPT4ge1xuICAgICAgcHJvcHNbbmFtZV0gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iaiwgbmFtZSk7XG4gICAgICByZXR1cm4gcHJvcHM7XG4gICAgfSwge30pXG4gICk7XG5cbiAgaWYgKCEgT2JqZWN0LmlzRXh0ZW5zaWJsZShvYmopKSB7XG4gICAgT2JqZWN0LnByZXZlbnRFeHRlbnNpb25zKG5ld0NsYXNzKTtcbiAgfVxuICBpZiAoT2JqZWN0LmlzU2VhbGVkKG9iaikpIHtcbiAgICBPYmplY3Quc2VhbChuZXdDbGFzcyk7XG4gIH1cbiAgaWYgKE9iamVjdC5pc0Zyb3plbihvYmopKSB7XG4gICAgT2JqZWN0LmZyZWV6ZShuZXdDbGFzcyk7XG4gIH1cblxuICByZXR1cm4gbmV3Q2xhc3M7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNQcm9wZXJ0eShvYmo6IEZ1bmN0aW9uLCBuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIG5hbWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzTWV0aG9kKGluc3RhbmNlOiBhbnksIG1ldGhvZDogc3RyaW5nKSB7XG4gIHJldHVybiBpbnN0YW5jZSBpbnN0YW5jZW9mIE9iamVjdCAmJiAobWV0aG9kIGluIGluc3RhbmNlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRnVuY3Rpb24oZnVuYzogRnVuY3Rpb24pIHtcbiAgcmV0dXJuIGZ1bmMgaW5zdGFuY2VvZiBGdW5jdGlvbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzKHRhc2s6IElUYXNrKSB7XG4gIGNvbnN0IGNvbmRpdGlvbnMgPSBBcnJheS5pc0FycmF5KHRoaXMpID8gdGhpcyA6IFsnZnJlZXplZCcsICdsb2NrZWQnXTtcbiAgY29uc3QgcmVzdWx0cyA9IFtdO1xuXG4gIGZvciAoY29uc3QgYyBvZiBjb25kaXRpb25zKSB7XG4gICAgcmVzdWx0cy5wdXNoKGhhc1Byb3BlcnR5KHRhc2ssIGMpID09PSBmYWxzZSB8fCB0YXNrW2NdID09PSBmYWxzZSk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0cy5pbmRleE9mKGZhbHNlKSA+IC0xID8gZmFsc2UgOiB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXRpbENsZWFyQnlUYWcodGFzazogSVRhc2spOiBib29sZWFuIHtcbiAgaWYgKCEgZXhjbHVkZVNwZWNpZmljVGFza3MuY2FsbChbJ2xvY2tlZCddLCB0YXNrKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdGFzay50YWcgPT09IHRoaXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaWZvKGE6IElUYXNrLCBiOiBJVGFzaykge1xuICByZXR1cm4gYS5jcmVhdGVkQXQgLSBiLmNyZWF0ZWRBdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpZm8oYTogSVRhc2ssIGI6IElUYXNrKSB7XG4gIHJldHVybiBiLmNyZWF0ZWRBdCAtIGEuY3JlYXRlZEF0O1xufVxuIiwiLyoqXG4gKiBHbG9iYWwgTmFtZXNcbiAqL1xuXG52YXIgZ2xvYmFscyA9IC9cXGIoQXJyYXl8RGF0ZXxPYmplY3R8TWF0aHxKU09OKVxcYi9nO1xuXG4vKipcbiAqIFJldHVybiBpbW1lZGlhdGUgaWRlbnRpZmllcnMgcGFyc2VkIGZyb20gYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtTdHJpbmd8RnVuY3Rpb259IG1hcCBmdW5jdGlvbiBvciBwcmVmaXhcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHN0ciwgZm4pe1xuICB2YXIgcCA9IHVuaXF1ZShwcm9wcyhzdHIpKTtcbiAgaWYgKGZuICYmICdzdHJpbmcnID09IHR5cGVvZiBmbikgZm4gPSBwcmVmaXhlZChmbik7XG4gIGlmIChmbikgcmV0dXJuIG1hcChzdHIsIHAsIGZuKTtcbiAgcmV0dXJuIHA7XG59O1xuXG4vKipcbiAqIFJldHVybiBpbW1lZGlhdGUgaWRlbnRpZmllcnMgaW4gYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwcm9wcyhzdHIpIHtcbiAgcmV0dXJuIHN0clxuICAgIC5yZXBsYWNlKC9cXC5cXHcrfFxcdysgKlxcKHxcIlteXCJdKlwifCdbXiddKid8XFwvKFteL10rKVxcLy9nLCAnJylcbiAgICAucmVwbGFjZShnbG9iYWxzLCAnJylcbiAgICAubWF0Y2goL1thLXpBLVpfXVxcdyovZylcbiAgICB8fCBbXTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gYHN0cmAgd2l0aCBgcHJvcHNgIG1hcHBlZCB3aXRoIGBmbmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtBcnJheX0gcHJvcHNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBtYXAoc3RyLCBwcm9wcywgZm4pIHtcbiAgdmFyIHJlID0gL1xcLlxcdyt8XFx3KyAqXFwofFwiW15cIl0qXCJ8J1teJ10qJ3xcXC8oW14vXSspXFwvfFthLXpBLVpfXVxcdyovZztcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKHJlLCBmdW5jdGlvbihfKXtcbiAgICBpZiAoJygnID09IF9bXy5sZW5ndGggLSAxXSkgcmV0dXJuIGZuKF8pO1xuICAgIGlmICghfnByb3BzLmluZGV4T2YoXykpIHJldHVybiBfO1xuICAgIHJldHVybiBmbihfKTtcbiAgfSk7XG59XG5cbi8qKlxuICogUmV0dXJuIHVuaXF1ZSBhcnJheS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gdW5pcXVlKGFycikge1xuICB2YXIgcmV0ID0gW107XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAofnJldC5pbmRleE9mKGFycltpXSkpIGNvbnRpbnVlO1xuICAgIHJldC5wdXNoKGFycltpXSk7XG4gIH1cblxuICByZXR1cm4gcmV0O1xufVxuXG4vKipcbiAqIE1hcCB3aXRoIHByZWZpeCBgc3RyYC5cbiAqL1xuXG5mdW5jdGlvbiBwcmVmaXhlZChzdHIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKF8pe1xuICAgIHJldHVybiBzdHIgKyBfO1xuICB9O1xufVxuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIHRvRnVuY3Rpb24gPSByZXF1aXJlKCd0by1mdW5jdGlvbicpO1xuXG4vKipcbiAqIEdyb3VwIGBhcnJgIHdpdGggY2FsbGJhY2sgYGZuKHZhbCwgaSlgLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFyclxuICogQHBhcmFtIHtGdW5jdGlvbnxTdHJpbmd9IGZuIG9yIHByb3BcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFyciwgZm4pe1xuICB2YXIgcmV0ID0ge307XG4gIHZhciBwcm9wO1xuICBmbiA9IHRvRnVuY3Rpb24oZm4pO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgKytpKSB7XG4gICAgcHJvcCA9IGZuKGFycltpXSwgaSk7XG4gICAgcmV0W3Byb3BdID0gcmV0W3Byb3BdIHx8IFtdO1xuICAgIHJldFtwcm9wXS5wdXNoKGFycltpXSk7XG4gIH1cblxuICByZXR1cm4gcmV0O1xufTsiLCJcbi8qKlxuICogTW9kdWxlIERlcGVuZGVuY2llc1xuICovXG5cbnZhciBleHByO1xudHJ5IHtcbiAgZXhwciA9IHJlcXVpcmUoJ3Byb3BzJyk7XG59IGNhdGNoKGUpIHtcbiAgZXhwciA9IHJlcXVpcmUoJ2NvbXBvbmVudC1wcm9wcycpO1xufVxuXG4vKipcbiAqIEV4cG9zZSBgdG9GdW5jdGlvbigpYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRvRnVuY3Rpb247XG5cbi8qKlxuICogQ29udmVydCBgb2JqYCB0byBhIGBGdW5jdGlvbmAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gb2JqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHRvRnVuY3Rpb24ob2JqKSB7XG4gIHN3aXRjaCAoe30udG9TdHJpbmcuY2FsbChvYmopKSB7XG4gICAgY2FzZSAnW29iamVjdCBPYmplY3RdJzpcbiAgICAgIHJldHVybiBvYmplY3RUb0Z1bmN0aW9uKG9iaik7XG4gICAgY2FzZSAnW29iamVjdCBGdW5jdGlvbl0nOlxuICAgICAgcmV0dXJuIG9iajtcbiAgICBjYXNlICdbb2JqZWN0IFN0cmluZ10nOlxuICAgICAgcmV0dXJuIHN0cmluZ1RvRnVuY3Rpb24ob2JqKTtcbiAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOlxuICAgICAgcmV0dXJuIHJlZ2V4cFRvRnVuY3Rpb24ob2JqKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGRlZmF1bHRUb0Z1bmN0aW9uKG9iaik7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWZhdWx0IHRvIHN0cmljdCBlcXVhbGl0eS5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZGVmYXVsdFRvRnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiBmdW5jdGlvbihvYmope1xuICAgIHJldHVybiB2YWwgPT09IG9iajtcbiAgfTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGByZWAgdG8gYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1JlZ0V4cH0gcmVcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcmVnZXhwVG9GdW5jdGlvbihyZSkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqKXtcbiAgICByZXR1cm4gcmUudGVzdChvYmopO1xuICB9O1xufVxuXG4vKipcbiAqIENvbnZlcnQgcHJvcGVydHkgYHN0cmAgdG8gYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHN0cmluZ1RvRnVuY3Rpb24oc3RyKSB7XG4gIC8vIGltbWVkaWF0ZSBzdWNoIGFzIFwiPiAyMFwiXG4gIGlmICgvXiAqXFxXKy8udGVzdChzdHIpKSByZXR1cm4gbmV3IEZ1bmN0aW9uKCdfJywgJ3JldHVybiBfICcgKyBzdHIpO1xuXG4gIC8vIHByb3BlcnRpZXMgc3VjaCBhcyBcIm5hbWUuZmlyc3RcIiBvciBcImFnZSA+IDE4XCIgb3IgXCJhZ2UgPiAxOCAmJiBhZ2UgPCAzNlwiXG4gIHJldHVybiBuZXcgRnVuY3Rpb24oJ18nLCAncmV0dXJuICcgKyBnZXQoc3RyKSk7XG59XG5cbi8qKlxuICogQ29udmVydCBgb2JqZWN0YCB0byBhIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3RcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gb2JqZWN0VG9GdW5jdGlvbihvYmopIHtcbiAgdmFyIG1hdGNoID0ge307XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBtYXRjaFtrZXldID0gdHlwZW9mIG9ialtrZXldID09PSAnc3RyaW5nJ1xuICAgICAgPyBkZWZhdWx0VG9GdW5jdGlvbihvYmpba2V5XSlcbiAgICAgIDogdG9GdW5jdGlvbihvYmpba2V5XSk7XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbCl7XG4gICAgaWYgKHR5cGVvZiB2YWwgIT09ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG4gICAgZm9yICh2YXIga2V5IGluIG1hdGNoKSB7XG4gICAgICBpZiAoIShrZXkgaW4gdmFsKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgaWYgKCFtYXRjaFtrZXldKHZhbFtrZXldKSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbn1cblxuLyoqXG4gKiBCdWlsdCB0aGUgZ2V0dGVyIGZ1bmN0aW9uLiBTdXBwb3J0cyBnZXR0ZXIgc3R5bGUgZnVuY3Rpb25zXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZ2V0KHN0cikge1xuICB2YXIgcHJvcHMgPSBleHByKHN0cik7XG4gIGlmICghcHJvcHMubGVuZ3RoKSByZXR1cm4gJ18uJyArIHN0cjtcblxuICB2YXIgdmFsLCBpLCBwcm9wO1xuICBmb3IgKGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICBwcm9wID0gcHJvcHNbaV07XG4gICAgdmFsID0gJ18uJyArIHByb3A7XG4gICAgdmFsID0gXCIoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgXCIgKyB2YWwgKyBcIiA/IFwiICsgdmFsICsgXCIoKSA6IFwiICsgdmFsICsgXCIpXCI7XG5cbiAgICAvLyBtaW1pYyBuZWdhdGl2ZSBsb29rYmVoaW5kIHRvIGF2b2lkIHByb2JsZW1zIHdpdGggbmVzdGVkIHByb3BlcnRpZXNcbiAgICBzdHIgPSBzdHJpcE5lc3RlZChwcm9wLCBzdHIsIHZhbCk7XG4gIH1cblxuICByZXR1cm4gc3RyO1xufVxuXG4vKipcbiAqIE1pbWljIG5lZ2F0aXZlIGxvb2tiZWhpbmQgdG8gYXZvaWQgcHJvYmxlbXMgd2l0aCBuZXN0ZWQgcHJvcGVydGllcy5cbiAqXG4gKiBTZWU6IGh0dHA6Ly9ibG9nLnN0ZXZlbmxldml0aGFuLmNvbS9hcmNoaXZlcy9taW1pYy1sb29rYmVoaW5kLWphdmFzY3JpcHRcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc3RyaXBOZXN0ZWQgKHByb3AsIHN0ciwgdmFsKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZShuZXcgUmVnRXhwKCcoXFxcXC4pPycgKyBwcm9wLCAnZycpLCBmdW5jdGlvbigkMCwgJDEpIHtcbiAgICByZXR1cm4gJDEgPyAkMCA6IHZhbDtcbiAgfSk7XG59XG4iXX0=
