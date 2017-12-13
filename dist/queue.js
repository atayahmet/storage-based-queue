(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.default = {
  storage: 'localstorage',
  prefix: 'sq_jobs',
  timeout: 1000,
  max: -1,
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
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _slicedToArray = function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"]) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}();



var _container = require('./container');var _container2 = _interopRequireDefault(_container);
var _storageCapsule = require('./storage-capsule');var _storageCapsule2 = _interopRequireDefault(_storageCapsule);
var _config = require('./config');var _config2 = _interopRequireDefault(_config);
var _event2 = require('./event');var _event3 = _interopRequireDefault(_event2);
var _utils = require('./utils');
var _localstorage = require('./storage/localstorage');var _localstorage2 = _interopRequireDefault(_localstorage);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {arr2[i] = arr[i];}return arr2;} else {return Array.from(arr);}}









var Queue = function () {
  "use strict";

  Queue.FIFO = 'fifo';
  Queue.LIFO = 'lifo';

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
    this.storage = new _storageCapsule2.default(this.config, new _localstorage2.default(this.config));
    this.event = new _event3.default();
    this.container = new _container2.default();
    this.timeout = this.config.get('timeout');
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
      console.log('[stopped]-> next');
      statusOff.call(this);
      return stopQueue.call(this);
    }
    console.log('[next]->');
    this.start();
  };

  Queue.prototype.start = function () {
    // Stop the queue for restart
    this.stopped = false;

    // Register tasks, if not registered
    registerJobs.call(this);

    // Create a timeout for start queue
    this.running = createTimeout.call(this) > 0;
    console.log('[started]->', this.running);
    return this.running;
  };

  Queue.prototype.stop = function () {
    console.log('[stopping]->');
    this.stopped = true; //this.running;
  };

  Queue.prototype.forceStop = function () {
    console.log('[forceStopped]->');
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
      throw new Error('Channel of "' + name + '" not found');
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
    db.call(this).all().
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
    this.config.get('timeout', val);
  };

  Queue.prototype.setMax = function (val) {
    this.config.get('max', val);
  };

  Queue.prototype.setPrefix = function (val) {
    this.config.get('prefix', val);
  };

  Queue.prototype.setPrinciple = function (val) {
    this.config.get('principle', val);
  };

  Queue.prototype.on = function (key, cb) {var _event;
    (_event = this.event).on.apply(_event, arguments);
  };

  Queue.prototype.error = function (cb) {
    this.event.on('error', cb);
  };

  Queue.register = function (jobs) {
    if (!(jobs instanceof Array)) {
      throw new Error('Queue jobs should be objects within an array');
    }

    Queue.isRegistered = false;
    Queue.jobs = jobs;
  };

  function getTasksWithoutFreezed() {
    return db.call(this).all().
    filter(_utils.excludeSpecificTasks.bind(['freezed']));
  }

  function dispatchEvents(task, type) {
    if ('tag' in task) {
      this.event.emit(task.tag + ':' + type, task);
      this.event.emit(task.tag + ':*', task);
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
    var timeout = this.config.get('timeout');
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
    var task = db.call(self).fetch().shift();

    if (task === undefined) {
      console.log('queue empty...');
      stopQueue.call(this);
      return;
    }

    if (!self.container.has(task.handler)) {
      console.warn(task.handler + '-> job not found');
    }

    var job = self.container.get(task.handler);
    var jobInstance = new job.handler();

    // lock the current task for prevent race condition
    lockTask.call(self, task);

    // fire job before event
    fireJobInlineEvent.call(this, 'before', jobInstance, task.args);

    // dispacth custom before event
    dispatchEvents.call(this, task, 'before');

    // preparing worker dependencies
    var dependencies = Object.values(job.deps || {});

    // Task runner promise
    (_jobInstance$handle = jobInstance.handle).call.apply(_jobInstance$handle, [jobInstance, task.args].concat(_toConsumableArray(dependencies))).
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
      fireJobInlineEvent.call(this, 'after', job, task.args);

      // dispacth custom after event
      dispatchEvents.call(this, task, 'after');

      // try next queue job
      self.next();
    };
  }

  function jobFailedResponse(task, job) {var _this2 = this;
    return function (result) {
      removeTask.call(_this2, task._id);

      _this2.event.emit('error', task);

      _this2.next();
    };
  }

  function fireJobInlineEvent(name, job, args) {
    if (!(0, _utils.hasMethod)(job, name)) return;

    if (name == 'before' && (0, _utils.isFunction)(job.before)) {
      job.before.call(job, args);
    } else
    if (name == 'after' && (0, _utils.isFunction)(job.after)) {
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
    dispatchEvents.call(this, task, 'retry');

    // update retry value
    var updateTask = updateRetry.call(this, task, job);

    // delete lock property for next process
    updateTask.locked = false;

    return db.call(this).update(task._id, updateTask);
  }

  function updateRetry(task, job) {
    if (!('retry' in job)) {
      job.retry = 1;
    }

    if (!('tried' in task)) {
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
var _orderbyTime = require('orderby-time');var _orderbyTime2 = _interopRequireDefault(_orderbyTime);
var _localstorage = require('./storage/localstorage');var _localstorage2 = _interopRequireDefault(_localstorage);



var _config = require('./config');var _config2 = _interopRequireDefault(_config);
var _utils = require('./utils');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var

StorageCapsule = function () {



  function StorageCapsule(config, storage) {_classCallCheck(this, StorageCapsule);
    this.storage = storage;
  }_createClass(StorageCapsule, [{ key: 'channel', value: function channel(

    name) {
      this.storageChannel = name;
      return this;
    } }, { key: 'fetch', value: function fetch()

    {
      var all = this.all().filter(_utils.excludeSpecificTasks);
      var tasks = (0, _groupBy2.default)(all, 'priority');
      return Object.
      keys(tasks).
      map(function (key) {return parseInt(key);}).
      sort(function (a, b) {return b - a;}).
      reduce(function (result, key) {return result.concat((0, _orderbyTime2.default)('createdAt', tasks[key]));}, []);
    } }, { key: 'save', value: function save(

    task) {
      try {
        // prepare all properties before save
        // example: createdAt etc.
        task = this.prepareTask(task);

        // get all tasks current channel's
        var tasks = this.storage.get(this.storageChannel);

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
    } }, { key: 'clear', value: function clear(

    channel) {
      this.storage.clear(channel);
    } }]);return StorageCapsule;}();exports.default = StorageCapsule;

},{"./config":2,"./storage/localstorage":8,"./utils":9,"group-by":12,"orderby-time":13}],8:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var





LocalStorage = function () {




  function LocalStorage(config) {_classCallCheck(this, LocalStorage);
    this.storage = localStorage;
    this.config = config;
    this.prefix = config.get('storage').prefix;
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
      return this.prefix + '_' + suffix;
    } }]);return LocalStorage;}();exports.default = LocalStorage;

},{}],9:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.


clone = clone;exports.





















hasProperty = hasProperty;exports.



hasMethod = hasMethod;exports.



isFunction = isFunction;exports.



excludeSpecificTasks = excludeSpecificTasks;exports.










utilClearByTag = utilClearByTag;function clone(obj) {var newClass = Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyNames(obj).reduce(function (props, name) {props[name] = Object.getOwnPropertyDescriptor(obj, name);return props;}, {}));if (!Object.isExtensible(obj)) {Object.preventExtensions(newClass);}if (Object.isSealed(obj)) {Object.seal(newClass);}if (Object.isFrozen(obj)) {Object.freeze(newClass);}return newClass;}function hasProperty(obj, name) {return Object.prototype.hasOwnProperty.call(obj, name);}function hasMethod(instance, method) {return instance instanceof Object && method in instance;}function isFunction(func) {return func instanceof Function;}function excludeSpecificTasks(task) {var conditions = Array.isArray(this) ? this : ['freezed', 'locked'];var results = [];var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {for (var _iterator = conditions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var c = _step.value;results.push(hasProperty(task, c) === false || task[c] === false);}} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator.return) {_iterator.return();}} finally {if (_didIteratorError) {throw _iteratorError;}}}return results.indexOf(false) > -1 ? false : true;}function utilClearByTag(task) {
  if (!excludeSpecificTasks.call(['locked'], task)) {
    return false;
  }
  return task.tag === this;
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
'use strict'

/*!
 * exports.
 */

module.exports = curry2

/**
 * Curry a binary function.
 *
 * @param {Function} fn
 * Binary function to curry.
 *
 * @param {Object} [self]
 * Function `this` context.
 *
 * @return {Function|*}
 * If partially applied, return unary function, otherwise, return result of full application.
 */

function curry2 (fn, self) {
  var out = function () {
    return arguments.length > 1
    ? fn.call(self, arguments[0], arguments[1])
    : fn.bind(self, arguments[0])
  }

  out.uncurry = function uncurry () {
    return fn
  }

  return out
}

},{}],12:[function(require,module,exports){

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
},{"to-function":15}],13:[function(require,module,exports){
'use strict'

/*!
 * imports.
 */

var curry2 = require('curry2')
var selectn = require('selectn')

/*!
 * exports.
 */

module.exports = curry2(order)

/**
 * Curried function returning a new array sorted by time without mutating the original array.
 *
 * @param {String} [path]
 * Dot or bracket-notation object path string.
 *
 * @param {Array} list
 * Array to sort.
 *
 * @return {Array}
 * Array sorted by time.
 */

function order (path, list) {
  return [].concat(list).sort(function sort (a, b) {
    return (new Date(path ? selectn(path, a) : a).getTime()) - (new Date(path ? selectn(path, b) : b).getTime())
  })
}

},{"curry2":11,"selectn":14}],14:[function(require,module,exports){
/*!
 * exports.
 */

module.exports = selectn;

/**
 * Select n-levels deep into an object given a dot/bracket-notation query.
 * If partially applied, returns a function accepting the second argument.
 *
 * ### Examples:
 *
 *      selectn('name.first', contact);
 *
 *      selectn('addresses[0].street', contact);
 *
 *      contacts.map(selectn('name.first'));
 *
 * @param  {String | Array} query
 * dot/bracket-notation query string or array of properties
 *
 * @param  {Object} object
 * object to access
 *
 * @return {Function}
 * accessor function that accepts an object to be queried
 */

function selectn(query) {
  var parts;

  if (Array.isArray(query)) {
    parts = query;
  }
  else {
    // normalize query to `.property` access (i.e. `a.b[0]` becomes `a.b.0`)
    query = query.replace(/\[(\d+)\]/g, '.$1');
    parts = query.split('.');
  }

  /**
   * Accessor function that accepts an object to be queried
   *
   * @private
   *
   * @param  {Object} object
   * object to access
   *
   * @return {Mixed}
   * value at given reference or undefined if it does not exist
   */

  function accessor(object) {
    var ref = (object != null) ? object : (1, eval)('this');
    var len = parts.length;
    var idx = 0;

    // iteratively save each segment's reference
    for (; idx < len; idx += 1) {
      if (ref != null) ref = ref[parts[idx]];
    }

    return ref;
  }

  // curry accessor function allowing partial application
  return arguments.length > 1
       ? accessor(arguments[1])
       : accessor;
}

},{}],15:[function(require,module,exports){

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvY29uZmlnLmRhdGEuanMiLCJsaWIvY29uZmlnLmpzIiwibGliL2NvbnRhaW5lci5qcyIsImxpYi9ldmVudC5qcyIsImxpYi9pbmRleC5qcyIsImxpYi9xdWV1ZS5qcyIsImxpYi9zdG9yYWdlLWNhcHN1bGUuanMiLCJsaWIvc3RvcmFnZS9sb2NhbHN0b3JhZ2UuanMiLCJsaWIvdXRpbHMuanMiLCJub2RlX21vZHVsZXMvY29tcG9uZW50LXByb3BzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2N1cnJ5Mi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9ncm91cC1ieS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9vcmRlcmJ5LXRpbWUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc2VsZWN0bi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy90by1mdW5jdGlvbi9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7V0NBZSxBQUNKLEFBQ1Q7VUFGYSxBQUVMLEFBQ1I7V0FIYSxBQUdKLEFBQ1Q7T0FBSyxDQUpRLEFBSVAsQUFDTixDQUxhLEFBQ2I7YSxBQURhLEFBS0Y7Ozs7O0FDSGIsdUM7O0EsQUFFcUIscUJBR25COzs7b0JBQWtDLEtBQXRCLEFBQXNCLDZFQUFKLEFBQUksc0NBRmxDLEFBRWtDLGtCQUNoQztTQUFBLEFBQUssTUFBTCxBQUFXLEFBQ1o7QSx1REFFRzs7QSxVLEFBQWMsT0FBa0IsQUFDbEM7V0FBQSxBQUFLLE9BQUwsQUFBWSxRQUFaLEFBQW9CLEFBQ3JCO0EsdUNBRUc7O0EsVUFBbUIsQUFDckI7YUFBTyxLQUFBLEFBQUssT0FBWixBQUFPLEFBQVksQUFDcEI7QSx1Q0FFRzs7QSxVQUFjLEFBQ2hCO2FBQU8sT0FBQSxBQUFPLFVBQVAsQUFBaUIsZUFBakIsQUFBZ0MsS0FBSyxLQUFyQyxBQUEwQyxRQUFqRCxBQUFPLEFBQWtELEFBQzFEO0EseUNBRUs7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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZXhwb3J0IGRlZmF1bHQge1xuICBzdG9yYWdlOiAnbG9jYWxzdG9yYWdlJyxcbiAgcHJlZml4OiAnc3Ffam9icycsXG4gIHRpbWVvdXQ6IDEwMDAsXG4gIG1heDogLTEsXG4gIHByaW5jaXBsZTogJ2ZpZm8nXG59O1xuIiwiLyogQGZsb3cgKi9cbmltcG9ydCB0eXBlIElDb25maWcgZnJvbSAnLi4vaW50ZXJmYWNlcy9jb25maWcnO1xuaW1wb3J0IGNvbmZpZ0RhdGEgZnJvbSAnLi9jb25maWcuZGF0YSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbmZpZyB7XG4gIGNvbmZpZzogSUNvbmZpZyA9IGNvbmZpZ0RhdGE7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBJQ29uZmlnID0ge30pIHtcbiAgICB0aGlzLm1lcmdlKGNvbmZpZyk7XG4gIH1cblxuICBzZXQobmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgdGhpcy5jb25maWdbbmFtZV0gPSB2YWx1ZTtcbiAgfVxuXG4gIGdldChuYW1lOiBzdHJpbmcpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZ1tuYW1lXTtcbiAgfVxuXG4gIGhhcyhuYW1lOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuY29uZmlnLCBuYW1lKTtcbiAgfVxuXG4gIG1lcmdlKGNvbmZpZzoge1tzdHJpbmddOiBhbnl9KSB7XG4gICAgdGhpcy5jb25maWcgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmNvbmZpZywgY29uZmlnKTtcbiAgfVxuXG4gIHJlbW92ZShuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZGVsZXRlIHRoaXMuY29uZmlnW25hbWVdO1xuICB9XG5cbiAgYWxsKCk6IElDb25maWcge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZztcbiAgfVxufVxuIiwiLyogQGZsb3cgKi9cbmltcG9ydCB0eXBlIElDb250YWluZXIgZnJvbSAnLi4vaW50ZXJmYWNlcy9jb250YWluZXInO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb250YWluZXIgaW1wbGVtZW50cyBJQ29udGFpbmVyIHtcblxuICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgX2NvbnRhaW5lcjoge1twcm9wZXJ0eTogc3RyaW5nXTogYW55fSA9IHt9O1xuXG4gIGhhcyhpZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLl9jb250YWluZXIsIGlkKTtcbiAgfVxuXG4gIGdldChpZDogc3RyaW5nKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5fY29udGFpbmVyW2lkXTtcbiAgfVxuXG4gIGFsbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fY29udGFpbmVyO1xuICB9XG5cbiAgYmluZChpZDogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgdGhpcy5fY29udGFpbmVyW2lkXSA9IHZhbHVlO1xuICB9XG5cbiAgcmVtb3ZlKGlkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuX2NvbnRhaW5lciwgaWQpKSB7XG4gICAgICBkZWxldGUgdGhpcy5fY29udGFpbmVyW2lkXTtcbiAgICB9XG4gIH1cblxuICByZW1vdmVBbGwoKTogdm9pZCB7XG4gICAgdGhpcy5fY29udGFpbmVyID0ge307XG4gIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIEV2ZW50IHtcbiAgc3RvcmUgPSB7fTtcbiAgdmVyaWZpZXJQYXR0ZXJuID0gL15bYS16MC05XFwtXFxfXStcXDpiZWZvcmUkfGFmdGVyJHxyZXRyeSR8XFwqJC87XG4gIHdpbGRjYXJkcyA9IFsnKicsICdlcnJvciddO1xuICBlbXB0eUZ1bmMgPSAoKSA9PiB7fTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnN0b3JlLmJlZm9yZSA9IHt9O1xuICAgIHRoaXMuc3RvcmUuYWZ0ZXIgPSB7fTtcbiAgICB0aGlzLnN0b3JlLnJldHJ5ID0ge307XG4gICAgdGhpcy5zdG9yZS53aWxkY2FyZCA9IHt9O1xuICAgIHRoaXMuc3RvcmUuZXJyb3IgPSB0aGlzLmVtcHR5RnVuYztcbiAgICB0aGlzLnN0b3JlWycqJ10gPSB0aGlzLmVtcHR5RnVuYztcbiAgfVxuXG4gIG9uKGtleTogc3RyaW5nLCBjYjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICBpZiAodHlwZW9mKGNiKSAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgbmV3IEVycm9yKCdFdmVudCBzaG91bGQgYmUgYW4gZnVuY3Rpb24nKTtcbiAgICBpZiAodGhpcy5pc1ZhbGlkKGtleSkpIHRoaXMuYWRkKGtleSwgY2IpO1xuICB9XG5cbiAgZW1pdChrZXk6IHN0cmluZywgYXJnczogYW55KSB7XG4gICAgaWYgKHRoaXMud2lsZGNhcmRzLmluZGV4T2Yoa2V5KSA+IC0xKSB7XG4gICAgICB0aGlzLndpbGRjYXJkKGtleSwgLi4uYXJndW1lbnRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgdHlwZSA9IHRoaXMuZ2V0VHlwZShrZXkpO1xuICAgICAgY29uc3QgbmFtZSA9IHRoaXMuZ2V0TmFtZShrZXkpO1xuXG4gICAgICBpZiAodGhpcy5zdG9yZVt0eXBlXSkge1xuICAgICAgICBjb25zdCBjYiA9IHRoaXMuc3RvcmVbdHlwZV1bbmFtZV0gfHwgdGhpcy5lbXB0eUZ1bmM7XG4gICAgICAgIGNiLmNhbGwobnVsbCwgYXJncyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy53aWxkY2FyZCgnKicsIGtleSwgYXJncyk7XG4gIH1cblxuICB3aWxkY2FyZChrZXk6IHN0cmluZywgYWN0aW9uS2V5OiBzdHJpbmcsIGFyZ3M6IGFueSkge1xuICAgIGlmICh0aGlzLnN0b3JlLndpbGRjYXJkW2tleV0pIHtcbiAgICAgIHRoaXMuc3RvcmUud2lsZGNhcmRba2V5XS5jYWxsKG51bGwsIGFjdGlvbktleSwgYXJncyk7XG4gICAgfVxuICB9XG5cbiAgYWRkKGtleTogc3RyaW5nLCBjYjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICBpZiAodGhpcy53aWxkY2FyZHMuaW5kZXhPZihrZXkpID4tMSkge1xuICAgICAgdGhpcy5zdG9yZS53aWxkY2FyZFtrZXldID0gY2I7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHR5cGUgPSB0aGlzLmdldFR5cGUoa2V5KTtcbiAgICAgIGNvbnN0IG5hbWUgPSB0aGlzLmdldE5hbWUoa2V5KTtcbiAgICAgIHRoaXMuc3RvcmVbdHlwZV1bbmFtZV0gPSBjYjtcbiAgICB9XG4gIH1cblxuICBoYXMoa2V5OiBzdHJpbmcpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qga2V5cyA9IGtleS5zcGxpdCgnOicpO1xuICAgICAgcmV0dXJuIGtleXMubGVuZ3RoID4gMSA/ICEhIHRoaXMuc3RvcmVba2V5c1sxXV1ba2V5c1swXV0gOiAhISB0aGlzLnN0b3JlLndpbGRjYXJkW2tleXNbMF1dO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGdldE5hbWUoa2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBrZXkubWF0Y2goLyguKilcXDouKi8pWzFdO1xuICB9XG5cbiAgZ2V0VHlwZShrZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGtleS5tYXRjaCgvXlthLXowLTlcXC1cXF9dK1xcOiguKikvKVsxXTtcbiAgfVxuXG4gIGlzVmFsaWQoa2V5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy52ZXJpZmllclBhdHRlcm4udGVzdChrZXkpIHx8IHRoaXMud2lsZGNhcmRzLmluZGV4T2Yoa2V5KSA+LTE7XG4gIH1cbn1cbiIsImltcG9ydCBRdWV1ZSBmcm9tICcuL3F1ZXVlJztcblxud2luZG93LlF1ZXVlID0gUXVldWU7XG5cbmV4cG9ydCBkZWZhdWx0IFF1ZXVlO1xuIiwiLyogQGZsb3cgKi9cbmltcG9ydCB0eXBlIElDb25maWcgZnJvbSAnLi4vaW50ZXJmYWNlcy9jb25maWcnO1xuaW1wb3J0IHR5cGUgSVRhc2sgZnJvbSAnLi4vaW50ZXJmYWNlcy90YXNrJztcbmltcG9ydCB0eXBlIElKb2IgZnJvbSAnLi4vaW50ZXJmYWNlcy9qb2InO1xuaW1wb3J0IENvbnRhaW5lciBmcm9tICcuL2NvbnRhaW5lcic7XG5pbXBvcnQgU3RvcmFnZUNhcHN1bGUgZnJvbSAnLi9zdG9yYWdlLWNhcHN1bGUnO1xuaW1wb3J0IENvbmZpZyBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgRXZlbnQgZnJvbSAnLi9ldmVudCc7XG5pbXBvcnQgeyBjbG9uZSwgaGFzTWV0aG9kLCBpc0Z1bmN0aW9uLCBleGNsdWRlU3BlY2lmaWNUYXNrcywgdXRpbENsZWFyQnlUYWcgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCBMb2NhbFN0b3JhZ2UgZnJvbSAnLi9zdG9yYWdlL2xvY2Fsc3RvcmFnZSc7XG5cbmludGVyZmFjZSBJSm9iSW5zdGFuY2Uge1xuICBwcmlvcml0eTogbnVtYmVyO1xuICByZXRyeTogbnVtYmVyO1xuICBoYW5kbGUoYXJnczogYW55KTogYW55O1xuICBiZWZvcmUoYXJnczogYW55KTogdm9pZDtcbiAgYWZ0ZXIoYXJnczogYW55KTogdm9pZDtcbn1cblxubGV0IFF1ZXVlID0gKCgpID0+IHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgUXVldWUuRklGTyA9ICdmaWZvJztcbiAgUXVldWUuTElGTyA9ICdsaWZvJztcblxuICBmdW5jdGlvbiBRdWV1ZShjb25maWc6IElDb25maWcpIHtcbiAgICBfY29uc3RydWN0b3IuY2FsbCh0aGlzLCBjb25maWcpO1xuICB9XG5cbiAgZnVuY3Rpb24gX2NvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgIHRoaXMuY3VycmVudENoYW5uZWw7XG4gICAgdGhpcy5jdXJyZW50VGltZW91dDtcbiAgICB0aGlzLnN0b3BwZWQgPSB0cnVlO1xuICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICAgIHRoaXMuY2hhbm5lbHMgPSB7fTtcbiAgICB0aGlzLmNvbmZpZyA9IG5ldyBDb25maWcoY29uZmlnKTtcbiAgICB0aGlzLnN0b3JhZ2UgPSBuZXcgU3RvcmFnZUNhcHN1bGUodGhpcy5jb25maWcsIG5ldyBMb2NhbFN0b3JhZ2UodGhpcy5jb25maWcpKTtcbiAgICB0aGlzLmV2ZW50ID0gbmV3IEV2ZW50O1xuICAgIHRoaXMuY29udGFpbmVyID0gbmV3IENvbnRhaW5lcjtcbiAgICB0aGlzLnRpbWVvdXQgPSB0aGlzLmNvbmZpZy5nZXQoJ3RpbWVvdXQnKTtcbiAgfVxuXG4gIFF1ZXVlLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbih0YXNrKSB7XG4gICAgY29uc3QgaWQgPSBzYXZlVGFzay5jYWxsKHRoaXMsIHRhc2spO1xuXG4gICAgaWYgKGlkICYmIHRoaXMuc3RvcHBlZCAmJiB0aGlzLnJ1bm5pbmcgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuc3RhcnQoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gaWQ7XG4gIH1cblxuICBRdWV1ZS5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnN0b3BwZWQpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdbc3RvcHBlZF0tPiBuZXh0Jyk7XG4gICAgICBzdGF0dXNPZmYuY2FsbCh0aGlzKTtcbiAgICAgIHJldHVybiBzdG9wUXVldWUuY2FsbCh0aGlzKTtcbiAgICB9XG4gICAgY29uc29sZS5sb2coJ1tuZXh0XS0+Jyk7XG4gICAgdGhpcy5zdGFydCgpO1xuICB9XG5cbiAgUXVldWUucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKTogYm9vbGVhbiB7XG4gICAgLy8gU3RvcCB0aGUgcXVldWUgZm9yIHJlc3RhcnRcbiAgICB0aGlzLnN0b3BwZWQgPSBmYWxzZTtcblxuICAgIC8vIFJlZ2lzdGVyIHRhc2tzLCBpZiBub3QgcmVnaXN0ZXJlZFxuICAgIHJlZ2lzdGVySm9icy5jYWxsKHRoaXMpO1xuXG4gICAgLy8gQ3JlYXRlIGEgdGltZW91dCBmb3Igc3RhcnQgcXVldWVcbiAgICB0aGlzLnJ1bm5pbmcgPSBjcmVhdGVUaW1lb3V0LmNhbGwodGhpcykgPiAwO1xuICAgIGNvbnNvbGUubG9nKCdbc3RhcnRlZF0tPicsIHRoaXMucnVubmluZyk7XG4gICAgcmV0dXJuIHRoaXMucnVubmluZztcbiAgfVxuXG4gIFF1ZXVlLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ1tzdG9wcGluZ10tPicpO1xuICAgIHRoaXMuc3RvcHBlZCA9IHRydWU7Ly90aGlzLnJ1bm5pbmc7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLmZvcmNlU3RvcCA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCdbZm9yY2VTdG9wcGVkXS0+Jyk7XG4gICAgc3RvcFF1ZXVlLmNhbGwodGhpcyk7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKGNoYW5uZWw6IHN0cmluZykge1xuICAgIGlmICghIChjaGFubmVsIGluIHRoaXMuY2hhbm5lbHMpKSB7XG4gICAgICB0aGlzLmN1cnJlbnRDaGFubmVsID0gY2hhbm5lbDtcbiAgICAgIHRoaXMuY2hhbm5lbHNbY2hhbm5lbF0gPSBjbG9uZSh0aGlzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5jaGFubmVsc1tjaGFubmVsXTtcbiAgfVxuXG4gIFF1ZXVlLnByb3RvdHlwZS5jaGFubmVsID0gZnVuY3Rpb24obmFtZTogc3RyaW5nKSB7XG4gICAgaWYgKCEgdGhpcy5jaGFubmVsc1tuYW1lXSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDaGFubmVsIG9mIFwiJHtuYW1lfVwiIG5vdCBmb3VuZGApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmNoYW5uZWxzW25hbWVdO1xuICB9XG5cbiAgUXVldWUucHJvdG90eXBlLmlzRW1wdHkgPSBmdW5jdGlvbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jb3VudCgpIDwgMTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuY291bnQgPSBmdW5jdGlvbigpOiBBcnJheTxJVGFzaz4ge1xuICAgIHJldHVybiBnZXRUYXNrc1dpdGhvdXRGcmVlemVkLmNhbGwodGhpcykubGVuZ3RoO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5jb3VudEJ5VGFnID0gZnVuY3Rpb24odGFnOiBzdHJpbmcpOiBBcnJheTxJVGFzaz4ge1xuICAgIHJldHVybiBnZXRUYXNrc1dpdGhvdXRGcmVlemVkLmNhbGwodGhpcykuZmlsdGVyKHQgPT4gdC50YWcgPT09IHRhZykubGVuZ3RoO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmN1cnJlbnRDaGFubmVsKSB7XG4gICAgICB0aGlzLnN0b3JhZ2UuY2xlYXIodGhpcy5jdXJyZW50Q2hhbm5lbCk7XG4gICAgfVxuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5jbGVhckJ5VGFnID0gZnVuY3Rpb24odGFnOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBkYi5jYWxsKHRoaXMpLmFsbCgpXG4gICAgICAuZmlsdGVyKHV0aWxDbGVhckJ5VGFnLmJpbmQodGFnKSlcbiAgICAgIC5mb3JFYWNoKHQgPT4gZGIuY2FsbCh0aGlzKS5kZWxldGUodC5faWQpKTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24oaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBnZXRUYXNrc1dpdGhvdXRGcmVlemVkLmNhbGwodGhpcykuZmluZEluZGV4KHQgPT4gdC5faWQgPT09IGlkKSA+IC0xO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5oYXNCeVRhZyA9IGZ1bmN0aW9uKHRhZzogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGdldFRhc2tzV2l0aG91dEZyZWV6ZWQuY2FsbCh0aGlzKS5maW5kSW5kZXgodCA9PiB0LnRhZyA9PT0gdGFnKSA+IC0xO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5zZXRUaW1lb3V0ID0gZnVuY3Rpb24odmFsOiBudW1iZXIpIHtcbiAgICB0aGlzLnRpbWVvdXQgPSB2YWw7XG4gICAgdGhpcy5jb25maWcuZ2V0KCd0aW1lb3V0JywgdmFsKTtcbiAgfVxuXG4gIFF1ZXVlLnByb3RvdHlwZS5zZXRNYXggPSBmdW5jdGlvbih2YWw6IG51bWJlcikge1xuICAgIHRoaXMuY29uZmlnLmdldCgnbWF4JywgdmFsKTtcbiAgfVxuXG4gIFF1ZXVlLnByb3RvdHlwZS5zZXRQcmVmaXggPSBmdW5jdGlvbih2YWw6IG51bWJlcikge1xuICAgIHRoaXMuY29uZmlnLmdldCgncHJlZml4JywgdmFsKTtcbiAgfVxuXG4gIFF1ZXVlLnByb3RvdHlwZS5zZXRQcmluY2lwbGUgPSBmdW5jdGlvbih2YWw6IG51bWJlcikge1xuICAgIHRoaXMuY29uZmlnLmdldCgncHJpbmNpcGxlJywgdmFsKTtcbiAgfVxuXG4gIFF1ZXVlLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKGtleTogc3RyaW5nLCBjYjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICB0aGlzLmV2ZW50Lm9uKC4uLmFyZ3VtZW50cyk7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLmVycm9yID0gZnVuY3Rpb24oY2I6IEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgdGhpcy5ldmVudC5vbignZXJyb3InLCBjYik7XG4gIH07XG5cbiAgUXVldWUucmVnaXN0ZXIgPSBmdW5jdGlvbiAoam9iczogQXJyYXk8SUpvYj4pIHtcbiAgICBpZiAoISAoam9icyBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdRdWV1ZSBqb2JzIHNob3VsZCBiZSBvYmplY3RzIHdpdGhpbiBhbiBhcnJheScpO1xuICAgIH1cblxuICAgIFF1ZXVlLmlzUmVnaXN0ZXJlZCA9IGZhbHNlO1xuICAgIFF1ZXVlLmpvYnMgPSBqb2JzO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGdldFRhc2tzV2l0aG91dEZyZWV6ZWQoKSB7XG4gICAgcmV0dXJuIGRiLmNhbGwodGhpcykuYWxsKClcbiAgICAgIC5maWx0ZXIoZXhjbHVkZVNwZWNpZmljVGFza3MuYmluZChbJ2ZyZWV6ZWQnXSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gZGlzcGF0Y2hFdmVudHModGFzazogSVRhc2ssIHR5cGU6IHN0cmluZykge1xuICAgIGlmICgndGFnJyBpbiB0YXNrKSB7XG4gICAgICB0aGlzLmV2ZW50LmVtaXQoYCR7dGFzay50YWd9OiR7dHlwZX1gLCB0YXNrKTtcbiAgICAgIHRoaXMuZXZlbnQuZW1pdChgJHt0YXNrLnRhZ306KmAsIHRhc2spO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGRiKCkge1xuICAgIHJldHVybiB0aGlzLnN0b3JhZ2UuY2hhbm5lbCh0aGlzLmN1cnJlbnRDaGFubmVsKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNhdmVUYXNrKHRhc2s6IElUYXNrKSB7XG4gICAgcmV0dXJuIGRiLmNhbGwodGhpcykuc2F2ZSh0YXNrKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNhdmVUYXNrKHRhc2s6IElUYXNrKSB7XG4gICAgcmV0dXJuIGRiLmNhbGwodGhpcykuc2F2ZShjaGVja1ByaW9yaXR5KHRhc2spKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNoZWNrUHJpb3JpdHkodGFzazogSVRhc2spIHtcbiAgICB0YXNrLnByaW9yaXR5ID0gdGFzay5wcmlvcml0eSB8fCAwO1xuXG4gICAgaWYgKGlzTmFOKHRhc2sucHJpb3JpdHkpKSB0YXNrLnByaW9yaXR5ID0gMDtcblxuICAgIHJldHVybiB0YXNrO1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlVGltZW91dCgpOiBudW1iZXIge1xuICAgIGNvbnN0IHRpbWVvdXQgPSB0aGlzLmNvbmZpZy5nZXQoJ3RpbWVvdXQnKTtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50VGltZW91dCA9IHNldFRpbWVvdXQobG9vcEhhbmRsZXIuYmluZCh0aGlzKSwgdGltZW91dCk7XG4gIH1cblxuICBmdW5jdGlvbiBsb2NrVGFzayh0YXNrKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGRiLmNhbGwodGhpcykudXBkYXRlKHRhc2suX2lkLCB7bG9ja2VkOiB0cnVlfSk7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVUYXNrKGlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZGIuY2FsbCh0aGlzKS5kZWxldGUoaWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9vcEhhbmRsZXIoKTogdm9pZCB7XG4gICAgY29uc3Qgc2VsZjogUXVldWUgPSB0aGlzO1xuICAgIGNvbnN0IHRhc2s6IElUYXNrID0gZGIuY2FsbChzZWxmKS5mZXRjaCgpLnNoaWZ0KCk7XG5cbiAgICBpZiAodGFzayA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zb2xlLmxvZygncXVldWUgZW1wdHkuLi4nKTtcbiAgICAgIHN0b3BRdWV1ZS5jYWxsKHRoaXMpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghIHNlbGYuY29udGFpbmVyLmhhcyh0YXNrLmhhbmRsZXIpKSB7XG4gICAgICBjb25zb2xlLndhcm4odGFzay5oYW5kbGVyICsgJy0+IGpvYiBub3QgZm91bmQnKVxuICAgIH1cblxuICAgIGNvbnN0IGpvYjogSUpvYiA9IHNlbGYuY29udGFpbmVyLmdldCh0YXNrLmhhbmRsZXIpO1xuICAgIGNvbnN0IGpvYkluc3RhbmNlOiBJSm9iSW5zdGFuY2UgPSBuZXcgam9iLmhhbmRsZXI7XG5cbiAgICAvLyBsb2NrIHRoZSBjdXJyZW50IHRhc2sgZm9yIHByZXZlbnQgcmFjZSBjb25kaXRpb25cbiAgICBsb2NrVGFzay5jYWxsKHNlbGYsIHRhc2spO1xuXG4gICAgLy8gZmlyZSBqb2IgYmVmb3JlIGV2ZW50XG4gICAgZmlyZUpvYklubGluZUV2ZW50LmNhbGwodGhpcywgJ2JlZm9yZScsIGpvYkluc3RhbmNlLCB0YXNrLmFyZ3MpO1xuXG4gICAgLy8gZGlzcGFjdGggY3VzdG9tIGJlZm9yZSBldmVudFxuICAgIGRpc3BhdGNoRXZlbnRzLmNhbGwodGhpcywgdGFzaywgJ2JlZm9yZScpO1xuXG4gICAgLy8gcHJlcGFyaW5nIHdvcmtlciBkZXBlbmRlbmNpZXNcbiAgICBjb25zdCBkZXBlbmRlbmNpZXMgPSBPYmplY3QudmFsdWVzKGpvYi5kZXBzIHx8IHt9KTtcblxuICAgIC8vIFRhc2sgcnVubmVyIHByb21pc2VcbiAgICBqb2JJbnN0YW5jZS5oYW5kbGUuY2FsbChqb2JJbnN0YW5jZSwgdGFzay5hcmdzLCAuLi5kZXBlbmRlbmNpZXMpXG4gICAgICAudGhlbihqb2JSZXNwb25zZS5jYWxsKHNlbGYsIHRhc2ssIGpvYkluc3RhbmNlKS5iaW5kKHNlbGYpKVxuICAgICAgLmNhdGNoKGpvYkZhaWxlZFJlc3BvbnNlLmNhbGwoc2VsZiwgdGFzaywgam9iSW5zdGFuY2UpLmJpbmQoc2VsZikpO1xuICB9XG5cbiAgZnVuY3Rpb24gam9iUmVzcG9uc2UodGFzazogSVRhc2ssIGpvYjogSUpvYkluc3RhbmNlKTogRnVuY3Rpb24ge1xuICAgIGNvbnN0IHNlbGY6IFF1ZXVlID0gdGhpcztcbiAgICByZXR1cm4gZnVuY3Rpb24gKHJlc3VsdDogYm9vbGVhbikge1xuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICBzdWNjZXNzUHJvY2Vzcy5jYWxsKHNlbGYsIHRhc2ssIGpvYik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXRyeVByb2Nlc3MuY2FsbChzZWxmLCB0YXNrLCBqb2IpO1xuICAgICAgfVxuXG4gICAgICAvLyBmaXJlIGpvYiBhZnRlciBldmVudFxuICAgICAgZmlyZUpvYklubGluZUV2ZW50LmNhbGwodGhpcywgJ2FmdGVyJywgam9iLCB0YXNrLmFyZ3MpO1xuXG4gICAgICAvLyBkaXNwYWN0aCBjdXN0b20gYWZ0ZXIgZXZlbnRcbiAgICAgIGRpc3BhdGNoRXZlbnRzLmNhbGwodGhpcywgdGFzaywgJ2FmdGVyJyk7XG5cbiAgICAgIC8vIHRyeSBuZXh0IHF1ZXVlIGpvYlxuICAgICAgc2VsZi5uZXh0KCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gam9iRmFpbGVkUmVzcG9uc2UodGFzazogSVRhc2ssIGpvYjogSUpvYkluc3RhbmNlKTogRnVuY3Rpb24ge1xuICAgIHJldHVybiAocmVzdWx0OiBib29sZWFuKSA9PiB7XG4gICAgICByZW1vdmVUYXNrLmNhbGwodGhpcywgdGFzay5faWQpO1xuXG4gICAgICB0aGlzLmV2ZW50LmVtaXQoJ2Vycm9yJywgdGFzayk7XG5cbiAgICAgIHRoaXMubmV4dCgpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGZpcmVKb2JJbmxpbmVFdmVudChuYW1lOiBzdHJpbmcsIGpvYjogSUpvYkluc3RhbmNlLCBhcmdzOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAoISBoYXNNZXRob2Qoam9iLCBuYW1lKSkgcmV0dXJuO1xuXG4gICAgaWYgKG5hbWUgPT0gJ2JlZm9yZScgJiYgaXNGdW5jdGlvbihqb2IuYmVmb3JlKSkge1xuICAgICAgam9iLmJlZm9yZS5jYWxsKGpvYiwgYXJncyk7XG4gICAgfVxuICAgIGVsc2UgaWYgKG5hbWUgPT0gJ2FmdGVyJyAmJiBpc0Z1bmN0aW9uKGpvYi5hZnRlcikpIHtcbiAgICAgIGpvYi5hZnRlci5jYWxsKGpvYiwgYXJncyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc3RhdHVzT2ZmKCk6IHZvaWQge1xuICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RvcFF1ZXVlKCk6IHZvaWQge1xuICAgIHRoaXMuc3RvcCgpO1xuXG4gICAgaWYgKHRoaXMuY3VycmVudFRpbWVvdXQpIHtcbiAgICAgIC8vIHVuc2V0IGN1cnJlbnQgdGltZW91dCB2YWx1ZVxuICAgICAgdGhpcy5jdXJyZW50VGltZW91dCA9IGNsZWFyVGltZW91dCh0aGlzLmN1cnJlbnRUaW1lb3V0KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzdWNjZXNzUHJvY2Vzcyh0YXNrOiBJVGFzaywgam9iOiBJSm9iSW5zdGFuY2UpOiB2b2lkIHtcbiAgICByZW1vdmVUYXNrLmNhbGwodGhpcywgdGFzay5faWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmV0cnlQcm9jZXNzKHRhc2s6IElUYXNrLCBqb2I6IElKb2JJbnN0YW5jZSk6IGJvb2xlYW4ge1xuICAgIC8vIGRpc3BhY3RoIGN1c3RvbSByZXRyeSBldmVudFxuICAgIGRpc3BhdGNoRXZlbnRzLmNhbGwodGhpcywgdGFzaywgJ3JldHJ5Jyk7XG5cbiAgICAvLyB1cGRhdGUgcmV0cnkgdmFsdWVcbiAgICBsZXQgdXBkYXRlVGFzazogSVRhc2sgPSB1cGRhdGVSZXRyeS5jYWxsKHRoaXMsIHRhc2ssIGpvYik7XG5cbiAgICAvLyBkZWxldGUgbG9jayBwcm9wZXJ0eSBmb3IgbmV4dCBwcm9jZXNzXG4gICAgdXBkYXRlVGFzay5sb2NrZWQgPSBmYWxzZTtcblxuICAgIHJldHVybiBkYi5jYWxsKHRoaXMpLnVwZGF0ZSh0YXNrLl9pZCwgdXBkYXRlVGFzayk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVSZXRyeSh0YXNrOiBJVGFzaywgam9iOiBJSm9iSW5zdGFuY2UpOiBJVGFzayB7XG4gICAgaWYgKCEgKCdyZXRyeScgaW4gam9iKSkge1xuICAgICAgam9iLnJldHJ5ID0gMTtcbiAgICB9XG5cbiAgICBpZiAoISAoJ3RyaWVkJyBpbiB0YXNrKSkge1xuICAgICAgdGFzay50cmllZCA9IDA7XG4gICAgICB0YXNrLnJldHJ5ID0gam9iLnJldHJ5O1xuICAgIH1cblxuICAgICsrdGFzay50cmllZDtcblxuICAgIGlmICh0YXNrLnRyaWVkID49IGpvYi5yZXRyeSkge1xuICAgICAgdGFzay5mcmVlemVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGFzaztcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlZ2lzdGVySm9icygpOiB2b2lkIHtcbiAgICBpZiAoUXVldWUuaXNSZWdpc3RlcmVkKSByZXR1cm47XG5cbiAgICBjb25zdCBqb2JzID0gUXVldWUuam9icyB8fCBbXTtcblxuICAgIGZvciAoY29uc3Qgam9iIG9mIGpvYnMpIHtcbiAgICAgIGNvbnN0IGZ1bmNTdHIgPSBqb2IuaGFuZGxlci50b1N0cmluZygpO1xuICAgICAgY29uc3QgW3N0ckZ1bmN0aW9uLCBuYW1lXSA9IGZ1bmNTdHIubWF0Y2goL2Z1bmN0aW9uXFxzKFthLXpBLVpfXSspLio/Lyk7XG4gICAgICBpZiAobmFtZSkgdGhpcy5jb250YWluZXIuYmluZChuYW1lLCBqb2IpO1xuICAgIH1cblxuICAgIFF1ZXVlLmlzUmVnaXN0ZXJlZCA9IHRydWU7XG4gIH1cblxuICByZXR1cm4gUXVldWU7XG59KSgpO1xuXG5leHBvcnQgZGVmYXVsdCBRdWV1ZTtcbiIsIi8qIEBmbG93ICovXG5cbmltcG9ydCBncm91cEJ5IGZyb20gJ2dyb3VwLWJ5J1xuaW1wb3J0IG9yZGVyQnkgZnJvbSAnb3JkZXJieS10aW1lJztcbmltcG9ydCBMb2NhbFN0b3JhZ2UgZnJvbSAnLi9zdG9yYWdlL2xvY2Fsc3RvcmFnZSc7XG5pbXBvcnQgdHlwZSBJQ29uZmlnIGZyb20gJy4uL2ludGVyZmFjZXMvY29uZmlnJztcbmltcG9ydCB0eXBlIElTdG9yYWdlIGZyb20gJy4uL2ludGVyZmFjZXMvc3RvcmFnZSc7XG5pbXBvcnQgdHlwZSBJVGFzayBmcm9tICcuLi9pbnRlcmZhY2VzL3Rhc2snO1xuaW1wb3J0IENvbmZpZyBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgeyBleGNsdWRlU3BlY2lmaWNUYXNrcyB9IGZyb20gJy4vdXRpbHMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdG9yYWdlQ2Fwc3VsZSB7XG4gIHN0b3JhZ2U6IElTdG9yYWdlO1xuICBzdG9yYWdlQ2hhbm5lbDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogQ29uZmlnLCBzdG9yYWdlOiBJU3RvcmFnZSkge1xuICAgIHRoaXMuc3RvcmFnZSA9IHN0b3JhZ2U7XG4gIH1cblxuICBjaGFubmVsKG5hbWU6IHN0cmluZyk6IFN0b3JhZ2VDYXBzdWxlIHtcbiAgICB0aGlzLnN0b3JhZ2VDaGFubmVsID0gbmFtZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGZldGNoKCk6IEFycmF5PGFueT4ge1xuICAgIGNvbnN0IGFsbCA9IHRoaXMuYWxsKCkuZmlsdGVyKGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzKTtcbiAgICBjb25zdCB0YXNrcyA9IGdyb3VwQnkoYWxsLCAncHJpb3JpdHknKTtcbiAgICByZXR1cm4gT2JqZWN0XG4gICAgICAua2V5cyh0YXNrcylcbiAgICAgIC5tYXAoa2V5ID0+IHBhcnNlSW50KGtleSkpXG4gICAgICAuc29ydCgoYSwgYikgPT4gYiAtIGEpXG4gICAgICAucmVkdWNlKChyZXN1bHQsIGtleSkgPT4gcmVzdWx0LmNvbmNhdChvcmRlckJ5KCdjcmVhdGVkQXQnLCB0YXNrc1trZXldKSksIFtdKTtcbiAgfVxuXG4gIHNhdmUodGFzazogSVRhc2spOiBzdHJpbmd8Ym9vbGVhbiB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIHByZXBhcmUgYWxsIHByb3BlcnRpZXMgYmVmb3JlIHNhdmVcbiAgICAgIC8vIGV4YW1wbGU6IGNyZWF0ZWRBdCBldGMuXG4gICAgICB0YXNrID0gdGhpcy5wcmVwYXJlVGFzayh0YXNrKTtcblxuICAgICAgLy8gZ2V0IGFsbCB0YXNrcyBjdXJyZW50IGNoYW5uZWwnc1xuICAgICAgY29uc3QgdGFza3M6IGFueVtdID0gdGhpcy5zdG9yYWdlLmdldCh0aGlzLnN0b3JhZ2VDaGFubmVsKTtcblxuICAgICAgLy8gYWRkIHRhc2sgdG8gc3RvcmFnZVxuICAgICAgdGFza3MucHVzaCh0YXNrKTtcblxuICAgICAgLy8gc2F2ZSB0YXNrc1xuICAgICAgdGhpcy5zdG9yYWdlLnNldCh0aGlzLnN0b3JhZ2VDaGFubmVsLCBKU09OLnN0cmluZ2lmeSh0YXNrcykpO1xuXG4gICAgICByZXR1cm4gdGFzay5faWQ7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlKGlkOiBzdHJpbmcsIHVwZGF0ZToge1twcm9wZXJ0eTogc3RyaW5nXTogYW55fSk6IGJvb2xlYW4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkYXRhOiBhbnlbXSA9IHRoaXMuYWxsKCk7XG4gICAgICBjb25zdCBpbmRleDogbnVtYmVyID0gZGF0YS5maW5kSW5kZXgodCA9PiB0Ll9pZCA9PSBpZCk7XG5cbiAgICAgIGlmIChpbmRleCA8IDApIHJldHVybiBmYWxzZTtcblxuICAgICAgLy8gbWVyZ2UgZXhpc3Rpbmcgb2JqZWN0IHdpdGggZ2l2ZW4gdXBkYXRlIG9iamVjdFxuICAgICAgZGF0YVtpbmRleF0gPSBPYmplY3QuYXNzaWduKHt9LCBkYXRhW2luZGV4XSwgdXBkYXRlKTtcblxuICAgICAgLy8gc2F2ZSB0byB0aGUgc3RvcmFnZSBhcyBzdHJpbmdcbiAgICAgIHRoaXMuc3RvcmFnZS5zZXQodGhpcy5zdG9yYWdlQ2hhbm5lbCwgSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBkZWxldGUoaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkYXRhOiBhbnlbXSA9IHRoaXMuYWxsKCk7XG4gICAgICBjb25zdCBpbmRleDogbnVtYmVyID0gZGF0YS5maW5kSW5kZXgoZCA9PiBkLl9pZCA9PT0gaWQpO1xuXG4gICAgICBpZiAoaW5kZXggPCAwKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIGRlbGV0ZSBkYXRhW2luZGV4XTtcblxuICAgICAgdGhpcy5zdG9yYWdlLnNldCh0aGlzLnN0b3JhZ2VDaGFubmVsLCBKU09OLnN0cmluZ2lmeShkYXRhLmZpbHRlcihkID0+IGQpKSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBhbGwoKTogQXJyYXk8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmFnZS5nZXQodGhpcy5zdG9yYWdlQ2hhbm5lbCk7XG4gIH1cblxuICBnZW5lcmF0ZUlkKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICgoMSArIE1hdGgucmFuZG9tKCkpICogMHgxMDAwMCkudG9TdHJpbmcoMTYpO1xuICB9XG5cbiAgcHJlcGFyZVRhc2sodGFzazogSVRhc2spOiBJVGFzayB7XG4gICAgdGFzay5jcmVhdGVkQXQgPSBEYXRlLm5vdygpO1xuICAgIHRhc2suX2lkID0gdGhpcy5nZW5lcmF0ZUlkKCk7XG4gICAgcmV0dXJuIHRhc2s7XG4gIH1cblxuICBjbGVhcihjaGFubmVsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnN0b3JhZ2UuY2xlYXIoY2hhbm5lbCk7XG4gIH1cbn1cbiIsIi8qIEBmbG93ICovXG5cbmltcG9ydCB0eXBlIElTdG9yYWdlIGZyb20gJy4uLy4uL2ludGVyZmFjZXMvc3RvcmFnZSc7XG5pbXBvcnQgdHlwZSBJQ29uZmlnIGZyb20gJy4uLy4uL2ludGVyZmFjZXMvc3RvcmFnZSc7XG5pbXBvcnQgdHlwZSBJSm9iIGZyb20gJy4uLy4uL2ludGVyZmFjZXMvam9iJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9jYWxTdG9yYWdlIGltcGxlbWVudHMgSVN0b3JhZ2Uge1xuICBzdG9yYWdlOiBPYmplY3Q7XG4gIGNvbmZpZzogSUNvbmZpZztcbiAgcHJlZml4OiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBJQ29uZmlnKSB7XG4gICAgdGhpcy5zdG9yYWdlID0gbG9jYWxTdG9yYWdlO1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgIHRoaXMucHJlZml4ID0gY29uZmlnLmdldCgnc3RvcmFnZScpLnByZWZpeDtcbiAgfVxuXG4gIGdldChrZXk6IHN0cmluZyk6IEFycmF5PElKb2J8W10+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgbmFtZSA9IHRoaXMuc3RvcmFnZU5hbWUoa2V5KTtcbiAgICAgIHJldHVybiB0aGlzLmhhcyhuYW1lKSA/IEpTT04ucGFyc2UodGhpcy5zdG9yYWdlLmdldEl0ZW0obmFtZSkpIDogW107XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICB9XG5cbiAgc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5zdG9yYWdlLnNldEl0ZW0odGhpcy5zdG9yYWdlTmFtZShrZXkpLCB2YWx1ZSk7XG4gIH1cblxuICBoYXMoa2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4ga2V5IGluIHRoaXMuc3RvcmFnZTtcbiAgfVxuXG4gIGNsZWFyKGtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5zdG9yYWdlLnJlbW92ZUl0ZW0odGhpcy5zdG9yYWdlTmFtZShrZXkpKTtcbiAgfVxuXG4gIGNsZWFyQWxsKCk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmFnZS5jbGVhcigpO1xuICB9XG5cbiAgc3RvcmFnZU5hbWUoc3VmZml4OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gYCR7dGhpcy5wcmVmaXh9XyR7c3VmZml4fWA7XG4gIH1cbn1cbiIsIi8qIEBmbG93ICovXG5pbXBvcnQgdHlwZSBJVGFzayBmcm9tICcuLi9pbnRlcmZhY2VzL3Rhc2snO1xuXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUob2JqOiBPYmplY3QpIHtcbiAgdmFyIG5ld0NsYXNzID0gT2JqZWN0LmNyZWF0ZShcbiAgICBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKSxcbiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvYmopLnJlZHVjZSgocHJvcHMsIG5hbWUpID0+IHtcbiAgICAgIHByb3BzW25hbWVdID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmosIG5hbWUpO1xuICAgICAgcmV0dXJuIHByb3BzO1xuICAgIH0sIHt9KVxuICApO1xuXG4gIGlmICghIE9iamVjdC5pc0V4dGVuc2libGUob2JqKSkge1xuICAgIE9iamVjdC5wcmV2ZW50RXh0ZW5zaW9ucyhuZXdDbGFzcyk7XG4gIH1cbiAgaWYgKE9iamVjdC5pc1NlYWxlZChvYmopKSB7XG4gICAgT2JqZWN0LnNlYWwobmV3Q2xhc3MpO1xuICB9XG4gIGlmIChPYmplY3QuaXNGcm96ZW4ob2JqKSkge1xuICAgIE9iamVjdC5mcmVlemUobmV3Q2xhc3MpO1xuICB9XG5cbiAgcmV0dXJuIG5ld0NsYXNzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzUHJvcGVydHkob2JqOiBGdW5jdGlvbiwgbmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBuYW1lKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc01ldGhvZChpbnN0YW5jZTogYW55LCBtZXRob2Q6IHN0cmluZykge1xuICByZXR1cm4gaW5zdGFuY2UgaW5zdGFuY2VvZiBPYmplY3QgJiYgKG1ldGhvZCBpbiBpbnN0YW5jZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Z1bmN0aW9uKGZ1bmM6IEZ1bmN0aW9uKSB7XG4gIHJldHVybiBmdW5jIGluc3RhbmNlb2YgRnVuY3Rpb247XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleGNsdWRlU3BlY2lmaWNUYXNrcyh0YXNrOiBJVGFzaykge1xuICBjb25zdCBjb25kaXRpb25zID0gQXJyYXkuaXNBcnJheSh0aGlzKSA/IHRoaXMgOiBbJ2ZyZWV6ZWQnLCAnbG9ja2VkJ107XG4gIGNvbnN0IHJlc3VsdHMgPSBbXTtcblxuICBmb3IgKGNvbnN0IGMgb2YgY29uZGl0aW9ucykge1xuICAgIHJlc3VsdHMucHVzaChoYXNQcm9wZXJ0eSh0YXNrLCBjKSA9PT0gZmFsc2UgfHwgdGFza1tjXSA9PT0gZmFsc2UpO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdHMuaW5kZXhPZihmYWxzZSkgPiAtMSA/IGZhbHNlIDogdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHV0aWxDbGVhckJ5VGFnKHRhc2s6IElUYXNrKTogYm9vbGVhbiB7XG4gIGlmICghIGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzLmNhbGwoWydsb2NrZWQnXSwgdGFzaykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRhc2sudGFnID09PSB0aGlzO1xufVxuIiwiLyoqXG4gKiBHbG9iYWwgTmFtZXNcbiAqL1xuXG52YXIgZ2xvYmFscyA9IC9cXGIoQXJyYXl8RGF0ZXxPYmplY3R8TWF0aHxKU09OKVxcYi9nO1xuXG4vKipcbiAqIFJldHVybiBpbW1lZGlhdGUgaWRlbnRpZmllcnMgcGFyc2VkIGZyb20gYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtTdHJpbmd8RnVuY3Rpb259IG1hcCBmdW5jdGlvbiBvciBwcmVmaXhcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHN0ciwgZm4pe1xuICB2YXIgcCA9IHVuaXF1ZShwcm9wcyhzdHIpKTtcbiAgaWYgKGZuICYmICdzdHJpbmcnID09IHR5cGVvZiBmbikgZm4gPSBwcmVmaXhlZChmbik7XG4gIGlmIChmbikgcmV0dXJuIG1hcChzdHIsIHAsIGZuKTtcbiAgcmV0dXJuIHA7XG59O1xuXG4vKipcbiAqIFJldHVybiBpbW1lZGlhdGUgaWRlbnRpZmllcnMgaW4gYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwcm9wcyhzdHIpIHtcbiAgcmV0dXJuIHN0clxuICAgIC5yZXBsYWNlKC9cXC5cXHcrfFxcdysgKlxcKHxcIlteXCJdKlwifCdbXiddKid8XFwvKFteL10rKVxcLy9nLCAnJylcbiAgICAucmVwbGFjZShnbG9iYWxzLCAnJylcbiAgICAubWF0Y2goL1thLXpBLVpfXVxcdyovZylcbiAgICB8fCBbXTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gYHN0cmAgd2l0aCBgcHJvcHNgIG1hcHBlZCB3aXRoIGBmbmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtBcnJheX0gcHJvcHNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBtYXAoc3RyLCBwcm9wcywgZm4pIHtcbiAgdmFyIHJlID0gL1xcLlxcdyt8XFx3KyAqXFwofFwiW15cIl0qXCJ8J1teJ10qJ3xcXC8oW14vXSspXFwvfFthLXpBLVpfXVxcdyovZztcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKHJlLCBmdW5jdGlvbihfKXtcbiAgICBpZiAoJygnID09IF9bXy5sZW5ndGggLSAxXSkgcmV0dXJuIGZuKF8pO1xuICAgIGlmICghfnByb3BzLmluZGV4T2YoXykpIHJldHVybiBfO1xuICAgIHJldHVybiBmbihfKTtcbiAgfSk7XG59XG5cbi8qKlxuICogUmV0dXJuIHVuaXF1ZSBhcnJheS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gdW5pcXVlKGFycikge1xuICB2YXIgcmV0ID0gW107XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAofnJldC5pbmRleE9mKGFycltpXSkpIGNvbnRpbnVlO1xuICAgIHJldC5wdXNoKGFycltpXSk7XG4gIH1cblxuICByZXR1cm4gcmV0O1xufVxuXG4vKipcbiAqIE1hcCB3aXRoIHByZWZpeCBgc3RyYC5cbiAqL1xuXG5mdW5jdGlvbiBwcmVmaXhlZChzdHIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKF8pe1xuICAgIHJldHVybiBzdHIgKyBfO1xuICB9O1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbi8qIVxuICogZXhwb3J0cy5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGN1cnJ5MlxuXG4vKipcbiAqIEN1cnJ5IGEgYmluYXJ5IGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBCaW5hcnkgZnVuY3Rpb24gdG8gY3VycnkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IFtzZWxmXVxuICogRnVuY3Rpb24gYHRoaXNgIGNvbnRleHQuXG4gKlxuICogQHJldHVybiB7RnVuY3Rpb258Kn1cbiAqIElmIHBhcnRpYWxseSBhcHBsaWVkLCByZXR1cm4gdW5hcnkgZnVuY3Rpb24sIG90aGVyd2lzZSwgcmV0dXJuIHJlc3VsdCBvZiBmdWxsIGFwcGxpY2F0aW9uLlxuICovXG5cbmZ1bmN0aW9uIGN1cnJ5MiAoZm4sIHNlbGYpIHtcbiAgdmFyIG91dCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA+IDFcbiAgICA/IGZuLmNhbGwoc2VsZiwgYXJndW1lbnRzWzBdLCBhcmd1bWVudHNbMV0pXG4gICAgOiBmbi5iaW5kKHNlbGYsIGFyZ3VtZW50c1swXSlcbiAgfVxuXG4gIG91dC51bmN1cnJ5ID0gZnVuY3Rpb24gdW5jdXJyeSAoKSB7XG4gICAgcmV0dXJuIGZuXG4gIH1cblxuICByZXR1cm4gb3V0XG59XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgdG9GdW5jdGlvbiA9IHJlcXVpcmUoJ3RvLWZ1bmN0aW9uJyk7XG5cbi8qKlxuICogR3JvdXAgYGFycmAgd2l0aCBjYWxsYmFjayBgZm4odmFsLCBpKWAuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufFN0cmluZ30gZm4gb3IgcHJvcFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXJyLCBmbil7XG4gIHZhciByZXQgPSB7fTtcbiAgdmFyIHByb3A7XG4gIGZuID0gdG9GdW5jdGlvbihmbik7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyArK2kpIHtcbiAgICBwcm9wID0gZm4oYXJyW2ldLCBpKTtcbiAgICByZXRbcHJvcF0gPSByZXRbcHJvcF0gfHwgW107XG4gICAgcmV0W3Byb3BdLnB1c2goYXJyW2ldKTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59OyIsIid1c2Ugc3RyaWN0J1xuXG4vKiFcbiAqIGltcG9ydHMuXG4gKi9cblxudmFyIGN1cnJ5MiA9IHJlcXVpcmUoJ2N1cnJ5MicpXG52YXIgc2VsZWN0biA9IHJlcXVpcmUoJ3NlbGVjdG4nKVxuXG4vKiFcbiAqIGV4cG9ydHMuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBjdXJyeTIob3JkZXIpXG5cbi8qKlxuICogQ3VycmllZCBmdW5jdGlvbiByZXR1cm5pbmcgYSBuZXcgYXJyYXkgc29ydGVkIGJ5IHRpbWUgd2l0aG91dCBtdXRhdGluZyB0aGUgb3JpZ2luYWwgYXJyYXkuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IFtwYXRoXVxuICogRG90IG9yIGJyYWNrZXQtbm90YXRpb24gb2JqZWN0IHBhdGggc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGxpc3RcbiAqIEFycmF5IHRvIHNvcnQuXG4gKlxuICogQHJldHVybiB7QXJyYXl9XG4gKiBBcnJheSBzb3J0ZWQgYnkgdGltZS5cbiAqL1xuXG5mdW5jdGlvbiBvcmRlciAocGF0aCwgbGlzdCkge1xuICByZXR1cm4gW10uY29uY2F0KGxpc3QpLnNvcnQoZnVuY3Rpb24gc29ydCAoYSwgYikge1xuICAgIHJldHVybiAobmV3IERhdGUocGF0aCA/IHNlbGVjdG4ocGF0aCwgYSkgOiBhKS5nZXRUaW1lKCkpIC0gKG5ldyBEYXRlKHBhdGggPyBzZWxlY3RuKHBhdGgsIGIpIDogYikuZ2V0VGltZSgpKVxuICB9KVxufVxuIiwiLyohXG4gKiBleHBvcnRzLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gc2VsZWN0bjtcblxuLyoqXG4gKiBTZWxlY3Qgbi1sZXZlbHMgZGVlcCBpbnRvIGFuIG9iamVjdCBnaXZlbiBhIGRvdC9icmFja2V0LW5vdGF0aW9uIHF1ZXJ5LlxuICogSWYgcGFydGlhbGx5IGFwcGxpZWQsIHJldHVybnMgYSBmdW5jdGlvbiBhY2NlcHRpbmcgdGhlIHNlY29uZCBhcmd1bWVudC5cbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKlxuICogICAgICBzZWxlY3RuKCduYW1lLmZpcnN0JywgY29udGFjdCk7XG4gKlxuICogICAgICBzZWxlY3RuKCdhZGRyZXNzZXNbMF0uc3RyZWV0JywgY29udGFjdCk7XG4gKlxuICogICAgICBjb250YWN0cy5tYXAoc2VsZWN0bignbmFtZS5maXJzdCcpKTtcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmcgfCBBcnJheX0gcXVlcnlcbiAqIGRvdC9icmFja2V0LW5vdGF0aW9uIHF1ZXJ5IHN0cmluZyBvciBhcnJheSBvZiBwcm9wZXJ0aWVzXG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSBvYmplY3RcbiAqIG9iamVjdCB0byBhY2Nlc3NcbiAqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIGFjY2Vzc29yIGZ1bmN0aW9uIHRoYXQgYWNjZXB0cyBhbiBvYmplY3QgdG8gYmUgcXVlcmllZFxuICovXG5cbmZ1bmN0aW9uIHNlbGVjdG4ocXVlcnkpIHtcbiAgdmFyIHBhcnRzO1xuXG4gIGlmIChBcnJheS5pc0FycmF5KHF1ZXJ5KSkge1xuICAgIHBhcnRzID0gcXVlcnk7XG4gIH1cbiAgZWxzZSB7XG4gICAgLy8gbm9ybWFsaXplIHF1ZXJ5IHRvIGAucHJvcGVydHlgIGFjY2VzcyAoaS5lLiBgYS5iWzBdYCBiZWNvbWVzIGBhLmIuMGApXG4gICAgcXVlcnkgPSBxdWVyeS5yZXBsYWNlKC9cXFsoXFxkKylcXF0vZywgJy4kMScpO1xuICAgIHBhcnRzID0gcXVlcnkuc3BsaXQoJy4nKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBY2Nlc3NvciBmdW5jdGlvbiB0aGF0IGFjY2VwdHMgYW4gb2JqZWN0IHRvIGJlIHF1ZXJpZWRcbiAgICpcbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSBvYmplY3RcbiAgICogb2JqZWN0IHRvIGFjY2Vzc1xuICAgKlxuICAgKiBAcmV0dXJuIHtNaXhlZH1cbiAgICogdmFsdWUgYXQgZ2l2ZW4gcmVmZXJlbmNlIG9yIHVuZGVmaW5lZCBpZiBpdCBkb2VzIG5vdCBleGlzdFxuICAgKi9cblxuICBmdW5jdGlvbiBhY2Nlc3NvcihvYmplY3QpIHtcbiAgICB2YXIgcmVmID0gKG9iamVjdCAhPSBudWxsKSA/IG9iamVjdCA6ICgxLCBldmFsKSgndGhpcycpO1xuICAgIHZhciBsZW4gPSBwYXJ0cy5sZW5ndGg7XG4gICAgdmFyIGlkeCA9IDA7XG5cbiAgICAvLyBpdGVyYXRpdmVseSBzYXZlIGVhY2ggc2VnbWVudCdzIHJlZmVyZW5jZVxuICAgIGZvciAoOyBpZHggPCBsZW47IGlkeCArPSAxKSB7XG4gICAgICBpZiAocmVmICE9IG51bGwpIHJlZiA9IHJlZltwYXJ0c1tpZHhdXTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVmO1xuICB9XG5cbiAgLy8gY3VycnkgYWNjZXNzb3IgZnVuY3Rpb24gYWxsb3dpbmcgcGFydGlhbCBhcHBsaWNhdGlvblxuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA+IDFcbiAgICAgICA/IGFjY2Vzc29yKGFyZ3VtZW50c1sxXSlcbiAgICAgICA6IGFjY2Vzc29yO1xufVxuIiwiXG4vKipcbiAqIE1vZHVsZSBEZXBlbmRlbmNpZXNcbiAqL1xuXG52YXIgZXhwcjtcbnRyeSB7XG4gIGV4cHIgPSByZXF1aXJlKCdwcm9wcycpO1xufSBjYXRjaChlKSB7XG4gIGV4cHIgPSByZXF1aXJlKCdjb21wb25lbnQtcHJvcHMnKTtcbn1cblxuLyoqXG4gKiBFeHBvc2UgYHRvRnVuY3Rpb24oKWAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB0b0Z1bmN0aW9uO1xuXG4vKipcbiAqIENvbnZlcnQgYG9iamAgdG8gYSBgRnVuY3Rpb25gLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IG9ialxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiB0b0Z1bmN0aW9uKG9iaikge1xuICBzd2l0Y2ggKHt9LnRvU3RyaW5nLmNhbGwob2JqKSkge1xuICAgIGNhc2UgJ1tvYmplY3QgT2JqZWN0XSc6XG4gICAgICByZXR1cm4gb2JqZWN0VG9GdW5jdGlvbihvYmopO1xuICAgIGNhc2UgJ1tvYmplY3QgRnVuY3Rpb25dJzpcbiAgICAgIHJldHVybiBvYmo7XG4gICAgY2FzZSAnW29iamVjdCBTdHJpbmddJzpcbiAgICAgIHJldHVybiBzdHJpbmdUb0Z1bmN0aW9uKG9iaik7XG4gICAgY2FzZSAnW29iamVjdCBSZWdFeHBdJzpcbiAgICAgIHJldHVybiByZWdleHBUb0Z1bmN0aW9uKG9iaik7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBkZWZhdWx0VG9GdW5jdGlvbihvYmopO1xuICB9XG59XG5cbi8qKlxuICogRGVmYXVsdCB0byBzdHJpY3QgZXF1YWxpdHkuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGRlZmF1bHRUb0Z1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqKXtcbiAgICByZXR1cm4gdmFsID09PSBvYmo7XG4gIH07XG59XG5cbi8qKlxuICogQ29udmVydCBgcmVgIHRvIGEgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtSZWdFeHB9IHJlXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHJlZ2V4cFRvRnVuY3Rpb24ocmUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iail7XG4gICAgcmV0dXJuIHJlLnRlc3Qob2JqKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IHByb3BlcnR5IGBzdHJgIHRvIGEgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzdHJpbmdUb0Z1bmN0aW9uKHN0cikge1xuICAvLyBpbW1lZGlhdGUgc3VjaCBhcyBcIj4gMjBcIlxuICBpZiAoL14gKlxcVysvLnRlc3Qoc3RyKSkgcmV0dXJuIG5ldyBGdW5jdGlvbignXycsICdyZXR1cm4gXyAnICsgc3RyKTtcblxuICAvLyBwcm9wZXJ0aWVzIHN1Y2ggYXMgXCJuYW1lLmZpcnN0XCIgb3IgXCJhZ2UgPiAxOFwiIG9yIFwiYWdlID4gMTggJiYgYWdlIDwgMzZcIlxuICByZXR1cm4gbmV3IEZ1bmN0aW9uKCdfJywgJ3JldHVybiAnICsgZ2V0KHN0cikpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYG9iamVjdGAgdG8gYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0XG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG9iamVjdFRvRnVuY3Rpb24ob2JqKSB7XG4gIHZhciBtYXRjaCA9IHt9O1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgbWF0Y2hba2V5XSA9IHR5cGVvZiBvYmpba2V5XSA9PT0gJ3N0cmluZydcbiAgICAgID8gZGVmYXVsdFRvRnVuY3Rpb24ob2JqW2tleV0pXG4gICAgICA6IHRvRnVuY3Rpb24ob2JqW2tleV0pO1xuICB9XG4gIHJldHVybiBmdW5jdGlvbih2YWwpe1xuICAgIGlmICh0eXBlb2YgdmFsICE9PSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xuICAgIGZvciAodmFyIGtleSBpbiBtYXRjaCkge1xuICAgICAgaWYgKCEoa2V5IGluIHZhbCkpIHJldHVybiBmYWxzZTtcbiAgICAgIGlmICghbWF0Y2hba2V5XSh2YWxba2V5XSkpIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG59XG5cbi8qKlxuICogQnVpbHQgdGhlIGdldHRlciBmdW5jdGlvbi4gU3VwcG9ydHMgZ2V0dGVyIHN0eWxlIGZ1bmN0aW9uc1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGdldChzdHIpIHtcbiAgdmFyIHByb3BzID0gZXhwcihzdHIpO1xuICBpZiAoIXByb3BzLmxlbmd0aCkgcmV0dXJuICdfLicgKyBzdHI7XG5cbiAgdmFyIHZhbCwgaSwgcHJvcDtcbiAgZm9yIChpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgcHJvcCA9IHByb3BzW2ldO1xuICAgIHZhbCA9ICdfLicgKyBwcm9wO1xuICAgIHZhbCA9IFwiKCdmdW5jdGlvbicgPT0gdHlwZW9mIFwiICsgdmFsICsgXCIgPyBcIiArIHZhbCArIFwiKCkgOiBcIiArIHZhbCArIFwiKVwiO1xuXG4gICAgLy8gbWltaWMgbmVnYXRpdmUgbG9va2JlaGluZCB0byBhdm9pZCBwcm9ibGVtcyB3aXRoIG5lc3RlZCBwcm9wZXJ0aWVzXG4gICAgc3RyID0gc3RyaXBOZXN0ZWQocHJvcCwgc3RyLCB2YWwpO1xuICB9XG5cbiAgcmV0dXJuIHN0cjtcbn1cblxuLyoqXG4gKiBNaW1pYyBuZWdhdGl2ZSBsb29rYmVoaW5kIHRvIGF2b2lkIHByb2JsZW1zIHdpdGggbmVzdGVkIHByb3BlcnRpZXMuXG4gKlxuICogU2VlOiBodHRwOi8vYmxvZy5zdGV2ZW5sZXZpdGhhbi5jb20vYXJjaGl2ZXMvbWltaWMtbG9va2JlaGluZC1qYXZhc2NyaXB0XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHN0cmlwTmVzdGVkIChwcm9wLCBzdHIsIHZhbCkge1xuICByZXR1cm4gc3RyLnJlcGxhY2UobmV3IFJlZ0V4cCgnKFxcXFwuKT8nICsgcHJvcCwgJ2cnKSwgZnVuY3Rpb24oJDAsICQxKSB7XG4gICAgcmV0dXJuICQxID8gJDAgOiB2YWw7XG4gIH0pO1xufVxuIl19
