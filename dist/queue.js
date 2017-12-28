(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){

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
},{"to-function":3}],3:[function(require,module,exports){

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

},{"component-props":1,"props":1}],4:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.default = {
  storage: 'localstorage',
  prefix: 'sq_jobs',
  timeout: 1000,
  limit: -1,
  principle: 'fifo' };

},{}],5:[function(require,module,exports){
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

},{"./config.data":4}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _queue = require('./queue');var _queue2 = _interopRequireDefault(_queue);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

window.Queue = _queue2.default;exports.default = _queue2.default;

},{"./queue":9}],9:[function(require,module,exports){
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

},{"./config":5,"./container":6,"./event":7,"./storage-capsule":10,"./storage/localstorage":11,"./utils":12}],10:[function(require,module,exports){
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

},{"./config":5,"./storage/localstorage":11,"./utils":12,"group-by":2}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY29tcG9uZW50LXByb3BzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2dyb3VwLWJ5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3RvLWZ1bmN0aW9uL2luZGV4LmpzIiwic3JjL2NvbmZpZy5kYXRhLmpzIiwic3JjL2NvbmZpZy5qcyIsInNyYy9jb250YWluZXIuanMiLCJzcmMvZXZlbnQuanMiLCJzcmMvaW5kZXguanMiLCJzcmMvcXVldWUuanMiLCJzcmMvc3RvcmFnZS1jYXBzdWxlLmpzIiwic3JjL3N0b3JhZ2UvbG9jYWxzdG9yYWdlLmpzIiwic3JjL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7V0N4SmUsQUFDSixBQUNUO1VBRmEsQUFFTCxBQUNSO1dBSGEsQUFHSixBQUNUO1NBQU8sQ0FKTSxBQUlMLEFBQ1IsQ0FMYSxBQUNiO2EsQUFEYSxBQUtGOzs7OztBQ0hiLHVDOztBLEFBRXFCLHFCQUduQjs7O29CQUFrQyxLQUF0QixBQUFzQiw2RUFBSixBQUFJLHNDQUZsQyxBQUVrQyxrQkFDaEM7U0FBQSxBQUFLLE1BQUwsQUFBVyxBQUNaO0EsdURBRUc7O0EsVSxBQUFjLE9BQWtCLEFBQ2xDO1dBQUEsQUFBSyxPQUFMLEFBQVksUUFBWixBQUFvQixBQUNyQjtBLHVDQUVHOztBLFVBQW1CLEFBQ3JCO2FBQU8sS0FBQSxBQUFLLE9BQVosQUFBTyxBQUFZLEFBQ3BCO0EsdUNBRUc7O0EsVUFBYyxBQUNoQjthQUFPLE9BQUEsQUFBTyxVQUFQLEFBQWlCLGVBQWpCLEFBQWdDLEtBQUssS0FBckMsQUFBMEMsUUFBakQsQUFBTyxBQUFrRCxBQUMxRDtBLHlDQUVLOztBLFlBQXlCLEFBQzdCO1dBQUEsQUFBSyxTQUFTLE9BQUEsQUFBTyxPQUFQLEFBQWMsSUFBSSxLQUFsQixBQUF1QixRQUFyQyxBQUFjLEFBQStCLEFBQzlDO0EsMENBRU07O0EsVUFBdUIsQUFDNUI7YUFBTyxPQUFPLEtBQUEsQUFBSyxPQUFuQixBQUFjLEFBQVksQUFDM0I7QSx1Q0FFYzs7QUFDYjthQUFPLEtBQVAsQUFBWSxBQUNiO0EsOEMsQUE3QmtCOzs7Ozs7QSxBQ0RBLHdCQUVuQjs7dUJBQWM7O0FBQUEsY0FFZCxHQUZjLEFBQUUsQUFFd0IsMkRBRXBDOztBLFFBQXFCLEFBQ3ZCO2FBQU8sT0FBQSxBQUFPLFVBQVAsQUFBaUIsZUFBakIsQUFBZ0MsS0FBSyxLQUFyQyxBQUEwQyxZQUFqRCxBQUFPLEFBQXNELEFBQzlEO0EsdUNBRUc7O0EsUUFBaUIsQUFDbkI7YUFBTyxLQUFBLEFBQUssV0FBWixBQUFPLEFBQWdCLEFBQ3hCO0EsdUNBRUs7O0FBQ0o7YUFBTyxLQUFQLEFBQVksQUFDYjtBLHdDQUVJOztBLFEsQUFBWSxPQUFrQixBQUNqQztXQUFBLEFBQUssV0FBTCxBQUFnQixNQUFoQixBQUFzQixBQUN2QjtBLDBDQUVNOztBLFFBQWtCLEFBQ3ZCO1VBQUksT0FBQSxBQUFPLFVBQVAsQUFBaUIsZUFBakIsQUFBZ0MsS0FBSyxLQUFyQyxBQUEwQyxZQUE5QyxBQUFJLEFBQXNELEtBQUssQUFDN0Q7ZUFBTyxLQUFBLEFBQUssV0FBWixBQUFPLEFBQWdCLEFBQ3hCO0FBQ0Y7QSw2Q0FFaUI7O0FBQ2hCO1dBQUEsQUFBSyxhQUFMLEFBQWtCLEFBQ25CO0EsUSx5QyxBQTlCa0I7Ozt5d0IsQUNIQSxvQkFNbkI7Ozs7OzttQkFBYyxtQ0FMZCxBQUtjLFFBTE4sQUFLTSxRQUpkLEFBSWMsa0JBSkksQUFJSixpREFIZCxBQUdjLFlBSEYsQ0FBQSxBQUFDLEtBQUQsQUFBTSxBQUdKLGNBRmQsQUFFYyxZQUZGLFlBQU0sQUFBRSxDQUVOLEFBQ1o7U0FBQSxBQUFLLE1BQUwsQUFBVyxTQUFYLEFBQW9CLEFBQ3BCO1NBQUEsQUFBSyxNQUFMLEFBQVcsUUFBWCxBQUFtQixBQUNuQjtTQUFBLEFBQUssTUFBTCxBQUFXLFFBQVgsQUFBbUIsQUFDbkI7U0FBQSxBQUFLLE1BQUwsQUFBVyxXQUFYLEFBQXNCLEFBQ3RCO1NBQUEsQUFBSyxNQUFMLEFBQVcsUUFBUSxLQUFuQixBQUF3QixBQUN4QjtTQUFBLEFBQUssTUFBTCxBQUFXLE9BQU8sS0FBbEIsQUFBdUIsQUFDeEI7QSxxREFFRTs7QSxTLEFBQWEsSUFBb0IsQUFDbEM7VUFBSSxPQUFBLEFBQU8sT0FBWCxBQUFtQixZQUFZLE1BQU0sSUFBQSxBQUFJLE1BQVYsQUFBTSxBQUFVLEFBQy9DO1VBQUksS0FBQSxBQUFLLFFBQVQsQUFBSSxBQUFhLE1BQU0sS0FBQSxBQUFLLElBQUwsQUFBUyxLQUFULEFBQWMsQUFDdEM7QSx3Q0FFSTs7QSxTLEFBQWEsTUFBVyxBQUMzQjtVQUFJLEtBQUEsQUFBSyxVQUFMLEFBQWUsUUFBZixBQUF1QixPQUFPLENBQWxDLEFBQW1DLEdBQUcsQUFDcEM7YUFBQSxBQUFLLHNCQUFMLEFBQWMsdUNBQWQsQUFBc0IsQUFDdkI7QUFGRCxhQUVPLEFBQ0w7WUFBTSxPQUFPLEtBQUEsQUFBSyxRQUFsQixBQUFhLEFBQWEsQUFDMUI7WUFBTSxPQUFPLEtBQUEsQUFBSyxRQUFsQixBQUFhLEFBQWEsQUFFMUI7O1lBQUksS0FBQSxBQUFLLE1BQVQsQUFBSSxBQUFXLE9BQU8sQUFDcEI7Y0FBTSxLQUFLLEtBQUEsQUFBSyxNQUFMLEFBQVcsTUFBWCxBQUFpQixTQUFTLEtBQXJDLEFBQTBDLEFBQzFDO2FBQUEsQUFBRyxLQUFILEFBQVEsTUFBUixBQUFjLEFBQ2Y7QUFDRjtBQUVEOztXQUFBLEFBQUssU0FBTCxBQUFjLEtBQWQsQUFBbUIsS0FBbkIsQUFBd0IsQUFDekI7QSw0Q0FFUTs7QSxTLEFBQWEsVyxBQUFtQixNQUFXLEFBQ2xEO1VBQUksS0FBQSxBQUFLLE1BQUwsQUFBVyxTQUFmLEFBQUksQUFBb0IsTUFBTSxBQUM1QjthQUFBLEFBQUssTUFBTCxBQUFXLFNBQVgsQUFBb0IsS0FBcEIsQUFBeUIsS0FBekIsQUFBOEIsTUFBOUIsQUFBb0MsV0FBcEMsQUFBK0MsQUFDaEQ7QUFDRjtBLHVDQUVHOztBLFMsQUFBYSxJQUFvQixBQUNuQztVQUFJLEtBQUEsQUFBSyxVQUFMLEFBQWUsUUFBZixBQUF1QixPQUFNLENBQWpDLEFBQWtDLEdBQUcsQUFDbkM7YUFBQSxBQUFLLE1BQUwsQUFBVyxTQUFYLEFBQW9CLE9BQXBCLEFBQTJCLEFBQzVCO0FBRkQsYUFFTyxBQUNMO1lBQU0sT0FBTyxLQUFBLEFBQUssUUFBbEIsQUFBYSxBQUFhLEFBQzFCO1lBQU0sT0FBTyxLQUFBLEFBQUssUUFBbEIsQUFBYSxBQUFhLEFBQzFCO2FBQUEsQUFBSyxNQUFMLEFBQVcsTUFBWCxBQUFpQixRQUFqQixBQUF5QixBQUMxQjtBQUNGO0EsdUNBRUc7O0EsU0FBYSxBQUNmO1VBQUksQUFDRjtZQUFNLE9BQU8sSUFBQSxBQUFJLE1BQWpCLEFBQWEsQUFBVSxBQUN2QjtlQUFPLEtBQUEsQUFBSyxTQUFMLEFBQWMsSUFBSSxDQUFDLENBQUUsS0FBQSxBQUFLLE1BQU0sS0FBWCxBQUFXLEFBQUssSUFBSSxLQUF6QyxBQUFxQixBQUFvQixBQUFLLE1BQU0sQ0FBQyxDQUFFLEtBQUEsQUFBSyxNQUFMLEFBQVcsU0FBUyxLQUFsRixBQUE4RCxBQUFvQixBQUFLLEFBQ3hGO0FBSEQsUUFHRSxPQUFBLEFBQU0sR0FBRyxBQUNUO2VBQUEsQUFBTyxBQUNSO0FBQ0Y7QSwyQ0FFTzs7QSxTQUFxQixBQUMzQjthQUFPLElBQUEsQUFBSSxNQUFKLEFBQVUsWUFBakIsQUFBTyxBQUFzQixBQUM5QjtBLDJDQUVPOztBLFNBQXFCLEFBQzNCO2FBQU8sSUFBQSxBQUFJLE1BQUosQUFBVSx3QkFBakIsQUFBTyxBQUFrQyxBQUMxQztBLDJDQUVPOztBLFNBQWEsQUFDbkI7YUFBTyxLQUFBLEFBQUssZ0JBQUwsQUFBcUIsS0FBckIsQUFBMEIsUUFBUSxLQUFBLEFBQUssVUFBTCxBQUFlLFFBQWYsQUFBdUIsT0FBTSxDQUF0RSxBQUF1RSxBQUN4RTtBLDZDLEFBdkVrQjs7OzJFQ0FyQixnQzs7QUFFQSxPQUFBLEFBQU8sd0I7Ozs7Ozs7QUNFUCx3QztBQUNBLG1EO0FBQ0Esa0M7QUFDQSxpQztBQUNBOzs7Ozs7O0FBT0Esc0Q7Ozs7Ozs7Ozs7QUFVQSxJQUFJLG9CQUFlLEFBQ2pCO0FBRUE7O1FBQUEsQUFBTSxPQUFOLEFBQWEsQUFDYjtRQUFBLEFBQU0sT0FBTixBQUFhLEFBRWI7O1dBQUEsQUFBUyxNQUFULEFBQWUsUUFBaUIsQUFDOUI7aUJBQUEsQUFBYSxLQUFiLEFBQWtCLE1BQWxCLEFBQXdCLEFBQ3pCO0FBRUQ7O1dBQUEsQUFBUyxhQUFULEFBQXNCLFFBQVEsQUFDNUI7U0FBQSxBQUFLLEFBQ0w7U0FBQSxBQUFLLEFBQ0w7U0FBQSxBQUFLLFVBQUwsQUFBZSxBQUNmO1NBQUEsQUFBSyxVQUFMLEFBQWUsQUFDZjtTQUFBLEFBQUssV0FBTCxBQUFnQixBQUNoQjtTQUFBLEFBQUssU0FBUyxxQkFBZCxBQUFjLEFBQVcsQUFDekI7U0FBQSxBQUFLLCtCQUNIO1NBRGEsQUFDUixBQUNMLE1BRmE7K0JBRUksS0FGbkIsQUFBZSxBQUViLEFBQXNCLEFBRXhCOztTQUFBLEFBQUssUUFBUSxZQUFiLEFBQ0E7U0FBQSxBQUFLLFlBQVksZ0JBQWpCLEFBQ0E7U0FBQSxBQUFLLFVBQVUsS0FBQSxBQUFLLE9BQUwsQUFBWSxJQUEzQixBQUFlLEFBQWdCLEFBQ2hDO0FBRUQ7O1FBQUEsQUFBTSxVQUFOLEFBQWdCLE1BQU0sVUFBQSxBQUFTLE1BQU0sQUFDbkM7UUFBTSxLQUFLLFNBQUEsQUFBUyxLQUFULEFBQWMsTUFBekIsQUFBVyxBQUFvQixBQUUvQjs7UUFBSSxNQUFNLEtBQU4sQUFBVyxXQUFXLEtBQUEsQUFBSyxZQUEvQixBQUEyQyxNQUFNLEFBQy9DO1dBQUEsQUFBSyxBQUNOO0FBRUQ7O1dBQUEsQUFBTyxBQUNSO0FBUkQsQUFVQTs7UUFBQSxBQUFNLFVBQU4sQUFBZ0IsT0FBTyxZQUFXLEFBQ2hDO1FBQUksS0FBSixBQUFTLFNBQVMsQUFDaEI7Y0FBQSxBQUFRLElBQVIsQUFBWSxBQUNaO2dCQUFBLEFBQVUsS0FBVixBQUFlLEFBQ2Y7YUFBTyxVQUFBLEFBQVUsS0FBakIsQUFBTyxBQUFlLEFBQ3ZCO0FBQ0Q7WUFBQSxBQUFRLElBQVIsQUFBWSxBQUNaO1NBQUEsQUFBSyxBQUNOO0FBUkQsQUFVQTs7UUFBQSxBQUFNLFVBQU4sQUFBZ0IsUUFBUSxZQUFvQixBQUMxQztBQUNBO1NBQUEsQUFBSyxVQUFMLEFBQWUsQUFFZjs7QUFDQTtpQkFBQSxBQUFhLEtBQWIsQUFBa0IsQUFFbEI7O0FBQ0E7U0FBQSxBQUFLLFVBQVUsY0FBQSxBQUFjLEtBQWQsQUFBbUIsUUFBbEMsQUFBMEMsQUFDMUM7WUFBQSxBQUFRLElBQVIsQUFBWSxlQUFlLEtBQTNCLEFBQWdDLEFBQ2hDO1dBQU8sS0FBUCxBQUFZLEFBQ2I7QUFYRCxBQWFBOztRQUFBLEFBQU0sVUFBTixBQUFnQixPQUFPO1lBQ3JCLEFBQVEsSUFBUixBQUFZLEFBQ1o7U0FBQSxBQUFLLFVBRjJCLEFBRWhDLEFBQWUsS0FGaUIsQUFDaEMsQ0FDcUIsQUFDdEI7QUFIRCxBQUtBOztRQUFBLEFBQU0sVUFBTixBQUFnQixZQUFZLFlBQVcsQUFDckM7WUFBQSxBQUFRLElBQVIsQUFBWSxBQUNaO2NBQUEsQUFBVSxLQUFWLEFBQWUsQUFDaEI7QUFIRCxBQUtBOztRQUFBLEFBQU0sVUFBTixBQUFnQixTQUFTLFVBQUEsQUFBUyxTQUFpQixBQUNqRDtRQUFJLEVBQUUsV0FBVyxLQUFqQixBQUFJLEFBQWtCLFdBQVcsQUFDL0I7V0FBQSxBQUFLLGlCQUFMLEFBQXNCLEFBQ3RCO1dBQUEsQUFBSyxTQUFMLEFBQWMsV0FBVyxrQkFBekIsQUFBeUIsQUFBTSxBQUNoQztBQUVEOztXQUFPLEtBQUEsQUFBSyxTQUFaLEFBQU8sQUFBYyxBQUN0QjtBQVBELEFBU0E7O1FBQUEsQUFBTSxVQUFOLEFBQWdCLFVBQVUsVUFBQSxBQUFTLE1BQWMsQUFDL0M7UUFBSSxDQUFDLEtBQUEsQUFBSyxTQUFWLEFBQUssQUFBYyxPQUFPLEFBQ3hCO1lBQU0sSUFBQSxBQUFJLHdCQUFKLEFBQXlCLE9BQS9CLEFBQ0Q7QUFFRDs7V0FBTyxLQUFBLEFBQUssU0FBWixBQUFPLEFBQWMsQUFDdEI7QUFORCxBQVFBOztRQUFBLEFBQU0sVUFBTixBQUFnQixVQUFVLFlBQW9CLEFBQzVDO1dBQU8sS0FBQSxBQUFLLFVBQVosQUFBc0IsQUFDdkI7QUFGRCxBQUlBOztRQUFBLEFBQU0sVUFBTixBQUFnQixRQUFRLFlBQXlCLEFBQy9DO1dBQU8sdUJBQUEsQUFBdUIsS0FBdkIsQUFBNEIsTUFBbkMsQUFBeUMsQUFDMUM7QUFGRCxBQUlBOztRQUFBLEFBQU0sVUFBTixBQUFnQixhQUFhLFVBQUEsQUFBUyxLQUEyQixBQUMvRDtXQUFPLHVCQUFBLEFBQXVCLEtBQXZCLEFBQTRCLE1BQTVCLEFBQWtDLE9BQU8scUJBQUssRUFBQSxBQUFFLFFBQVAsQUFBZSxJQUF4RCxHQUFQLEFBQW9FLEFBQ3JFO0FBRkQsQUFJQTs7UUFBQSxBQUFNLFVBQU4sQUFBZ0IsUUFBUSxZQUFpQixBQUN2QztRQUFJLEtBQUosQUFBUyxnQkFBZ0IsQUFDdkI7V0FBQSxBQUFLLFFBQUwsQUFBYSxNQUFNLEtBQW5CLEFBQXdCLEFBQ3pCO0FBQ0Y7QUFKRCxBQU1BOztRQUFBLEFBQU0sVUFBTixBQUFnQixhQUFhLFVBQUEsQUFBUyxLQUFtQixhQUN2RDtBQUNHO0FBREgsU0FBQSxBQUNRLEFBQ0w7QUFGSCxBQUdHO0FBSEgsV0FHVSxzQkFBQSxBQUFlLEtBSHpCLEFBR1UsQUFBb0IsQUFDM0I7QUFKSCxZQUlXLHFCQUFLLEdBQUEsQUFBRyxZQUFILEFBQWMsT0FBTyxFQUExQixBQUFLLEFBQXVCLEtBSnZDLEFBS0Q7QUFORCxBQVFBOztRQUFBLEFBQU0sVUFBTixBQUFnQixNQUFNLFVBQUEsQUFBUyxJQUFxQixBQUNsRDtXQUFPLHVCQUFBLEFBQXVCLEtBQXZCLEFBQTRCLE1BQTVCLEFBQWtDLFVBQVUscUJBQUssRUFBQSxBQUFFLFFBQVAsQUFBZSxHQUEzRCxLQUFpRSxDQUF4RSxBQUF5RSxBQUMxRTtBQUZELEFBSUE7O1FBQUEsQUFBTSxVQUFOLEFBQWdCLFdBQVcsVUFBQSxBQUFTLEtBQXNCLEFBQ3hEO1dBQU8sdUJBQUEsQUFBdUIsS0FBdkIsQUFBNEIsTUFBNUIsQUFBa0MsVUFBVSxxQkFBSyxFQUFBLEFBQUUsUUFBUCxBQUFlLElBQTNELEtBQWtFLENBQXpFLEFBQTBFLEFBQzNFO0FBRkQsQUFJQTs7UUFBQSxBQUFNLFVBQU4sQUFBZ0IsYUFBYSxVQUFBLEFBQVMsS0FBbUIsQUFDdkQ7U0FBQSxBQUFLLFVBQUwsQUFBZSxBQUNmO1NBQUEsQUFBSyxPQUFMLEFBQVksSUFBWixBQUFnQixXQUFoQixBQUEyQixBQUM1QjtBQUhELEFBS0E7O1FBQUEsQUFBTSxVQUFOLEFBQWdCLFdBQVcsVUFBQSxBQUFTLEtBQW1CLEFBQ3JEO1NBQUEsQUFBSyxPQUFMLEFBQVksSUFBWixBQUFnQixTQUFoQixBQUF5QixBQUMxQjtBQUZELEFBSUE7O1FBQUEsQUFBTSxVQUFOLEFBQWdCLFlBQVksVUFBQSxBQUFTLEtBQW1CLEFBQ3REO1NBQUEsQUFBSyxPQUFMLEFBQVksSUFBWixBQUFnQixVQUFoQixBQUEwQixBQUMzQjtBQUZELEFBSUE7O1FBQUEsQUFBTSxVQUFOLEFBQWdCLGVBQWUsVUFBQSxBQUFTLEtBQW1CLEFBQ3pEO1NBQUEsQUFBSyxPQUFMLEFBQVksSUFBWixBQUFnQixhQUFoQixBQUE2QixBQUM5QjtBQUZELEFBSUE7O1FBQUEsQUFBTSxVQUFOLEFBQWdCLEtBQUssVUFBQSxBQUFTLEtBQVQsQUFBc0IsSUFBb0IsS0FDN0Q7bUJBQUEsQUFBSyxPQUFMLEFBQVcsaUJBQVgsQUFBaUIsQUFDbEI7QUFGRCxBQUlBOztRQUFBLEFBQU0sVUFBTixBQUFnQixRQUFRLFVBQUEsQUFBUyxJQUFvQixBQUNuRDtTQUFBLEFBQUssTUFBTCxBQUFXLEdBQVgsQUFBYyxTQUFkLEFBQXVCLEFBQ3hCO0FBRkQsQUFJQTs7UUFBQSxBQUFNLFdBQVcsVUFBQSxBQUFTLE1BQW1CLEFBQzNDO1FBQUksRUFBRSxnQkFBTixBQUFJLEFBQWtCLFFBQVEsQUFDNUI7WUFBTSxJQUFBLEFBQUksTUFBVixBQUFNLEFBQVUsQUFDakI7QUFFRDs7VUFBQSxBQUFNLGVBQU4sQUFBcUIsQUFDckI7VUFBQSxBQUFNLE9BQU4sQUFBYSxBQUNkO0FBUEQsQUFTQTs7V0FBQSxBQUFTLHlCQUF5QixBQUNoQzs7QUFBTyxTQUFBLEFBQ0MsQUFDTDtBQUZJLEFBR0osT0FISSxBQUNKO0FBREksV0FHRyw0QkFBQSxBQUFxQixLQUFLLENBSHBDLEFBQU8sQUFHRyxBQUEwQixBQUFDLEFBQ3RDO0FBRUQ7O1dBQUEsQUFBUyxlQUFULEFBQXdCLE1BQXhCLEFBQXFDLE1BQWMsQUFDakQ7UUFBSSxTQUFKLEFBQWEsTUFBTSxBQUNqQjtXQUFBLEFBQUssTUFBTCxBQUFXLEtBQVEsS0FBbkIsQUFBd0IsWUFBeEIsQUFBK0IsTUFBL0IsQUFBdUMsQUFDdkM7V0FBQSxBQUFLLE1BQUwsQUFBVyxLQUFRLEtBQW5CLEFBQXdCLFlBQXhCLEFBQWlDLEFBQ2xDO0FBQ0Y7QUFFRDs7V0FBQSxBQUFTLEtBQUssQUFDWjtXQUFPLEtBQUEsQUFBSyxRQUFMLEFBQWEsUUFBUSxLQUE1QixBQUFPLEFBQTBCLEFBQ2xDO0FBRUQ7O1dBQUEsQUFBUyxTQUFULEFBQWtCLE1BQWEsQUFDN0I7V0FBTyxHQUFBLEFBQUcsS0FBSCxBQUFRLE1BQVIsQUFBYyxLQUFyQixBQUFPLEFBQW1CLEFBQzNCO0FBRUQ7O1dBQUEsQUFBUyxTQUFULEFBQWtCLE1BQWEsQUFDN0I7V0FBTyxHQUFBLEFBQUcsS0FBSCxBQUFRLE1BQVIsQUFBYyxLQUFLLGNBQTFCLEFBQU8sQUFBbUIsQUFBYyxBQUN6QztBQUVEOztXQUFBLEFBQVMsY0FBVCxBQUF1QixNQUFhLEFBQ2xDO1NBQUEsQUFBSyxXQUFXLEtBQUEsQUFBSyxZQUFyQixBQUFpQyxBQUVqQzs7UUFBSSxNQUFNLEtBQVYsQUFBSSxBQUFXLFdBQVcsS0FBQSxBQUFLLFdBQUwsQUFBZ0IsQUFFMUM7O1dBQUEsQUFBTyxBQUNSO0FBRUQ7O1dBQUEsQUFBUyxnQkFBd0IsQUFDL0I7UUFBTSxVQUFVLEtBQUEsQUFBSyxPQUFMLEFBQVksSUFBNUIsQUFBZ0IsQUFBZ0IsQUFDaEM7V0FBUSxLQUFBLEFBQUssaUJBQWlCLFdBQVcsWUFBQSxBQUFZLEtBQXZCLEFBQVcsQUFBaUIsT0FBMUQsQUFBOEIsQUFBbUMsQUFDbEU7QUFFRDs7V0FBQSxBQUFTLFNBQVQsQUFBa0IsTUFBZSxBQUMvQjtXQUFPLEdBQUEsQUFBRyxLQUFILEFBQVEsTUFBUixBQUFjLE9BQU8sS0FBckIsQUFBMEIsS0FBSyxFQUFFLFFBQXhDLEFBQU8sQUFBK0IsQUFBVSxBQUNqRDtBQUVEOztXQUFBLEFBQVMsV0FBVCxBQUFvQixJQUFxQixBQUN2QztXQUFPLEdBQUEsQUFBRyxLQUFILEFBQVEsTUFBUixBQUFjLE9BQXJCLEFBQU8sQUFBcUIsQUFDN0I7QUFFRDs7V0FBQSxBQUFTLGNBQW9CLEtBQzNCO1FBQU0sT0FBTixBQUFvQixBQUNwQjtRQUFNO0FBQWMsUUFBQSxBQUNqQixDQURpQixBQUNaLEFBQ0w7QUFGaUIsQUFHakI7QUFISCxBQUFvQixBQUtwQjs7UUFBSSxTQUFKLEFBQWEsV0FBVyxBQUN0QjtjQUFBLEFBQVEsWUFBVSxLQUFsQixBQUF1QixpQkFDdkI7Z0JBQUEsQUFBVSxLQUFWLEFBQWUsQUFDZjtBQUNEO0FBRUQ7O1FBQUksQ0FBQyxLQUFBLEFBQUssVUFBTCxBQUFlLElBQUksS0FBeEIsQUFBSyxBQUF3QixVQUFVLEFBQ3JDO2NBQUEsQUFBUSxLQUFLLEtBQUEsQUFBSyxVQUFsQixBQUE0QixBQUM3QjtBQUVEOztRQUFNLE1BQVksS0FBQSxBQUFLLFVBQUwsQUFBZSxJQUFJLEtBQXJDLEFBQWtCLEFBQXdCLEFBQzFDO1FBQU0sY0FBNEIsSUFBSSxJQUF0QyxBQUFrQyxBQUFRLEFBRTFDOztBQUNBO2FBQUEsQUFBUyxLQUFULEFBQWMsTUFBZCxBQUFvQixBQUVwQjs7QUFDQTt1QkFBQSxBQUFtQixLQUFuQixBQUF3QixNQUF4QixBQUE4QixVQUE5QixBQUF3QyxhQUFhLEtBQXJELEFBQTBELEFBRTFEOztBQUNBO21CQUFBLEFBQWUsS0FBZixBQUFvQixNQUFwQixBQUEwQixNQUExQixBQUFnQyxBQUVoQzs7QUFDQTtRQUFNLGVBQWUsT0FBQSxBQUFPLE9BQU8sSUFBQSxBQUFJLFFBQXZDLEFBQXFCLEFBQTBCLEFBRS9DOztBQUNBO3VDQUFBLEFBQVksQUFDVDtBQURILHFDQUFBLEFBQ1EsYUFBYSxLQURyQixBQUMwQixnQ0FEMUIsQUFDbUMsQUFDaEM7QUFGSCxTQUVRLFlBQUEsQUFBWSxLQUFaLEFBQWlCLE1BQWpCLEFBQXVCLE1BQXZCLEFBQTZCLGFBQTdCLEFBQTBDLEtBRmxELEFBRVEsQUFBK0MsQUFDcEQ7QUFISCxVQUdTLGtCQUFBLEFBQWtCLEtBQWxCLEFBQXVCLE1BQXZCLEFBQTZCLE1BQTdCLEFBQW1DLGFBQW5DLEFBQWdELEtBSHpELEFBR1MsQUFBcUQsQUFDL0Q7QUFFRDs7V0FBQSxBQUFTLFlBQVQsQUFBcUIsTUFBckIsQUFBa0MsS0FBNkIsQUFDN0Q7UUFBTSxPQUFOLEFBQW9CLEFBQ3BCO1dBQU8sVUFBQSxBQUFTLFFBQWlCLEFBQy9CO1VBQUEsQUFBSSxRQUFRLEFBQ1Y7dUJBQUEsQUFBZSxLQUFmLEFBQW9CLE1BQXBCLEFBQTBCLE1BQTFCLEFBQWdDLEFBQ2pDO0FBRkQsYUFFTyxBQUNMO3FCQUFBLEFBQWEsS0FBYixBQUFrQixNQUFsQixBQUF3QixNQUF4QixBQUE4QixBQUMvQjtBQUVEOztBQUNBO3lCQUFBLEFBQW1CLEtBQW5CLEFBQXdCLE1BQXhCLEFBQThCLFNBQTlCLEFBQXVDLEtBQUssS0FBNUMsQUFBaUQsQUFFakQ7O0FBQ0E7cUJBQUEsQUFBZSxLQUFmLEFBQW9CLE1BQXBCLEFBQTBCLE1BQTFCLEFBQWdDLEFBRWhDOztBQUNBO1dBQUEsQUFBSyxBQUNOO0FBZkQsQUFnQkQ7QUFFRDs7V0FBQSxBQUFTLGtCQUFULEFBQTJCLE1BQTNCLEFBQXdDLEtBQTZCLGNBQ25FO1dBQU8sVUFBQSxBQUFDLFFBQW9CLEFBQzFCO2lCQUFBLEFBQVcsYUFBVyxLQUF0QixBQUEyQixBQUUzQjs7YUFBQSxBQUFLLE1BQUwsQUFBVyxLQUFYLEFBQWdCLFNBQWhCLEFBQXlCLEFBRXpCOzthQUFBLEFBQUssQUFDTjtBQU5ELEFBT0Q7QUFFRDs7V0FBQSxBQUFTLEFBQ1A7QUFERixBQUVFO0FBRkYsQUFHRTtBQUhGLEFBSVE7QUFDTjtRQUFJLENBQUMsc0JBQUEsQUFBVSxLQUFmLEFBQUssQUFBZSxPQUFPLEFBRTNCOztRQUFJLFFBQUEsQUFBUSxZQUFZLHVCQUFXLElBQW5DLEFBQXdCLEFBQWUsU0FBUyxBQUM5QztVQUFBLEFBQUksT0FBSixBQUFXLEtBQVgsQUFBZ0IsS0FBaEIsQUFBcUIsQUFDdEI7QUFGRCxXQUVPLElBQUksUUFBQSxBQUFRLFdBQVcsdUJBQVcsSUFBbEMsQUFBdUIsQUFBZSxRQUFRLEFBQ25EO1VBQUEsQUFBSSxNQUFKLEFBQVUsS0FBVixBQUFlLEtBQWYsQUFBb0IsQUFDckI7QUFDRjtBQUVEOztXQUFBLEFBQVMsWUFBa0IsQUFDekI7U0FBQSxBQUFLLFVBQUwsQUFBZSxBQUNoQjtBQUVEOztXQUFBLEFBQVMsWUFBa0IsQUFDekI7U0FBQSxBQUFLLEFBRUw7O1FBQUksS0FBSixBQUFTLGdCQUFnQixBQUN2QjtBQUNBO1dBQUEsQUFBSyxpQkFBaUIsYUFBYSxLQUFuQyxBQUFzQixBQUFrQixBQUN6QztBQUNGO0FBRUQ7O1dBQUEsQUFBUyxlQUFULEFBQXdCLE1BQXhCLEFBQXFDLEtBQXlCLEFBQzVEO2VBQUEsQUFBVyxLQUFYLEFBQWdCLE1BQU0sS0FBdEIsQUFBMkIsQUFDNUI7QUFFRDs7V0FBQSxBQUFTLGFBQVQsQUFBc0IsTUFBdEIsQUFBbUMsS0FBNEIsQUFDN0Q7QUFDQTttQkFBQSxBQUFlLEtBQWYsQUFBb0IsTUFBcEIsQUFBMEIsTUFBMUIsQUFBZ0MsQUFFaEM7O0FBQ0E7UUFBSSxhQUFvQixZQUFBLEFBQVksS0FBWixBQUFpQixNQUFqQixBQUF1QixNQUEvQyxBQUF3QixBQUE2QixBQUVyRDs7QUFDQTtlQUFBLEFBQVcsU0FBWCxBQUFvQixBQUVwQjs7V0FBTyxHQUFBLEFBQUcsS0FBSCxBQUFRLE1BQVIsQUFBYyxPQUFPLEtBQXJCLEFBQTBCLEtBQWpDLEFBQU8sQUFBK0IsQUFDdkM7QUFFRDs7V0FBQSxBQUFTLFlBQVQsQUFBcUIsTUFBckIsQUFBa0MsS0FBMEIsQUFDMUQ7UUFBSSxFQUFFLFdBQU4sQUFBSSxBQUFhLE1BQU0sQUFDckI7VUFBQSxBQUFJLFFBQUosQUFBWSxBQUNiO0FBRUQ7O1FBQUksRUFBRSxXQUFOLEFBQUksQUFBYSxPQUFPLEFBQ3RCO1dBQUEsQUFBSyxRQUFMLEFBQWEsQUFDYjtXQUFBLEFBQUssUUFBUSxJQUFiLEFBQWlCLEFBQ2xCO0FBRUQ7O01BQUUsS0FBRixBQUFPLEFBRVA7O1FBQUksS0FBQSxBQUFLLFNBQVMsSUFBbEIsQUFBc0IsT0FBTyxBQUMzQjtXQUFBLEFBQUssVUFBTCxBQUFlLEFBQ2hCO0FBRUQ7O1dBQUEsQUFBTyxBQUNSO0FBRUQ7O1dBQUEsQUFBUyxlQUFxQixBQUM1QjtRQUFJLE1BQUosQUFBVSxjQUFjLEFBRXhCOztRQUFNLE9BQU8sTUFBQSxBQUFNLFFBQW5CLEFBQTJCLEdBSEMsc0dBSzVCOzsyQkFBQSxBQUFrQixrSUFBTSxLQUFiLEFBQWEsWUFDdEI7WUFBTSxVQUFVLElBQUEsQUFBSSxRQUFwQixBQUFnQixBQUFZLFdBRE4sSUFFTTtnQkFBQSxBQUFRLE1BRmQsQUFFTSxBQUFjLGlGQUZwQixBQUVmLGlDQUZlLEFBRUYsdUJBQ3BCO1lBQUEsQUFBSSxNQUFNLEtBQUEsQUFBSyxVQUFMLEFBQWUsS0FBZixBQUFvQixNQUFwQixBQUEwQixBQUNyQztBQVQyQix1TkFXNUI7O1VBQUEsQUFBTSxlQUFOLEFBQXFCLEFBQ3RCO0FBRUQ7O1NBQUEsQUFBTyxBQUNSO0FBNVZELEFBQVksQ0FBQyxHOztBLEFBOFZFOzs7OztBQ3JYZixtQztBQUNBLHNEOzs7O0FBSUEsa0M7QUFDQSxnQzs7QSxBQUVxQiw2QkFLbkI7Ozs7OzBCQUFBLEFBQVksUUFBWixBQUE2QixTQUFtQix1QkFDOUM7U0FBQSxBQUFLLFVBQUwsQUFBZSxBQUNmO1NBQUEsQUFBSyxTQUFMLEFBQWMsQUFDZjtBLG1FQUVPOztBLFVBQThCLEFBQ3BDO1dBQUEsQUFBSyxpQkFBTCxBQUFzQixBQUN0QjthQUFBLEFBQU8sQUFDUjtBLHlDQUVtQjs7QUFDbEI7VUFBTSxNQUFNLEtBQUEsQUFBSyxNQUFMLEFBQVcsY0FBdkIsQUFDQTtVQUFNLFFBQVEsdUJBQUEsQUFBUSxLQUF0QixBQUFjLEFBQWEsQUFDM0I7b0JBQU8sQUFBTyxLQUFQLEFBQVksQUFDaEI7QUFESSxTQUFBLENBQ0EsdUJBQU8sU0FBUCxBQUFPLEFBQVMsS0FEaEIsQUFFSjtBQUZJLFdBRUMsVUFBQSxBQUFDLEdBQUQsQUFBSSxXQUFNLElBQVYsQUFBYyxFQUZmLEFBR0o7QUFISSxhQUdHLEtBQUEsQUFBSyxZQUhSLEFBR0csQUFBaUIsUUFIM0IsQUFBTyxBQUc0QixBQUNwQztBLHdDQUVJOztBLFVBQStCLEFBQ2xDO1VBQUksQUFDRjtBQUNBO1lBQU0sUUFBaUIsS0FBQSxBQUFLLFFBQUwsQUFBYSxJQUFJLEtBQXhDLEFBQXVCLEFBQXNCLEFBRTdDOztBQUNBO0FBQ0E7WUFBSSxLQUFKLEFBQUksQUFBSyxjQUFjLEFBQ3JCO2tCQUFBLEFBQVEsS0FFSjs7ZUFGSixBQUVTLGlCQUNlO2VBQUEsQUFBSyxPQUFMLEFBQVksSUFIcEMsQUFHd0IsQUFBZ0IsQUFFeEM7O2lCQUFBLEFBQU8sQUFDUjtBQUVEOztBQUNBO0FBQ0E7ZUFBTyxLQUFBLEFBQUssWUFBWixBQUFPLEFBQWlCLEFBRXhCOztBQUNBO2NBQUEsQUFBTSxLQUFOLEFBQVcsQUFFWDs7QUFDQTthQUFBLEFBQUssUUFBTCxBQUFhLElBQUksS0FBakIsQUFBc0IsZ0JBQWdCLEtBQUEsQUFBSyxVQUEzQyxBQUFzQyxBQUFlLEFBRXJEOztlQUFPLEtBQVAsQUFBWSxBQUNiO0FBMUJELFFBMEJFLE9BQUEsQUFBTyxHQUFHLEFBQ1Y7ZUFBQSxBQUFPLEFBQ1I7QUFDRjtBLDBDQUVNOztBLFEsQUFBWSxTQUE4QyxBQUMvRDtVQUFJLEFBQ0Y7WUFBTSxPQUFjLEtBQXBCLEFBQW9CLEFBQUssQUFDekI7WUFBTSxRQUFnQixLQUFBLEFBQUssVUFBVSxxQkFBSyxFQUFBLEFBQUUsT0FBUCxBQUFjLEdBQW5ELEFBQXNCLEFBRXRCOztZQUFJLFFBQUosQUFBWSxHQUFHLE9BQUEsQUFBTyxBQUV0Qjs7QUFDQTthQUFBLEFBQUssU0FBUyxPQUFBLEFBQU8sT0FBUCxBQUFjLElBQUksS0FBbEIsQUFBa0IsQUFBSyxRQUFyQyxBQUFjLEFBQStCLEFBRTdDOztBQUNBO2FBQUEsQUFBSyxRQUFMLEFBQWEsSUFBSSxLQUFqQixBQUFzQixnQkFBZ0IsS0FBQSxBQUFLLFVBQTNDLEFBQXNDLEFBQWUsQUFFckQ7O2VBQUEsQUFBTyxBQUNSO0FBYkQsUUFhRSxPQUFBLEFBQU8sR0FBRyxBQUNWO2VBQUEsQUFBTyxBQUNSO0FBQ0Y7QSwwQ0FFTTs7QSxRQUFxQixBQUMxQjtVQUFJLEFBQ0Y7WUFBTSxPQUFjLEtBQXBCLEFBQW9CLEFBQUssQUFDekI7WUFBTSxRQUFnQixLQUFBLEFBQUssVUFBVSxxQkFBSyxFQUFBLEFBQUUsUUFBUCxBQUFlLEdBQXBELEFBQXNCLEFBRXRCOztZQUFJLFFBQUosQUFBWSxHQUFHLE9BQUEsQUFBTyxBQUV0Qjs7ZUFBTyxLQUFQLEFBQU8sQUFBSyxBQUVaOzthQUFBLEFBQUssUUFBTCxBQUFhLEFBQ1g7YUFERixBQUNPLEFBQ0w7YUFBQSxBQUFLLFVBQVUsS0FBQSxBQUFLLE9BQU8scUJBQUEsQUFBSyxFQUZsQyxBQUVFLEFBQWUsQUFFakI7O2VBQUEsQUFBTyxBQUNSO0FBYkQsUUFhRSxPQUFBLEFBQU8sR0FBRyxBQUNWO2VBQUEsQUFBTyxBQUNSO0FBQ0Y7QSx1Q0FFaUI7O0FBQ2hCO2FBQU8sS0FBQSxBQUFLLFFBQUwsQUFBYSxJQUFJLEtBQXhCLEFBQU8sQUFBc0IsQUFDOUI7QSw4Q0FFb0I7O0FBQ25CO2FBQU8sQ0FBQyxDQUFDLElBQUksS0FBTCxBQUFLLEFBQUssWUFBWCxBQUF1QixTQUF2QixBQUFnQyxTQUF2QyxBQUFPLEFBQXlDLEFBQ2pEO0EsK0NBRVc7O0EsVUFBb0IsQUFDOUI7V0FBQSxBQUFLLFlBQVksS0FBakIsQUFBaUIsQUFBSyxBQUN0QjtXQUFBLEFBQUssTUFBTSxLQUFYLEFBQVcsQUFBSyxBQUNoQjthQUFBLEFBQU8sQUFDUjtBLCtDQUVXOztBLFdBQWdCLGFBQzFCO1VBQU0sYUFBYSxTQUFiLEFBQWEsV0FBQSxBQUFDLFFBQUQsQUFBa0IsS0FBYSxBQUNoRDtZQUFJLE1BQUEsQUFBSyxPQUFMLEFBQVksSUFBWixBQUFnQixpQkFBcEIsQUFBcUMsUUFBUSxBQUMzQztpQkFBTyxPQUFBLEFBQU8sT0FBTyxNQUFBLEFBQU0sS0FBTixBQUFXLFlBQWhDLEFBQU8sQUFDUjtBQUZELGVBRU8sQUFDTDtpQkFBTyxPQUFBLEFBQU8sT0FBTyxNQUFBLEFBQU0sS0FBTixBQUFXLFlBQWhDLEFBQU8sQUFDUjtBQUNGO0FBTkQsQUFRQTs7YUFBTyxXQUFBLEFBQVcsS0FBbEIsQUFBTyxBQUFnQixBQUN4QjtBLDhDQUVxQjs7QUFDcEI7VUFBTSxRQUFnQixLQUFBLEFBQUssT0FBTCxBQUFZLElBQWxDLEFBQXNCLEFBQWdCLEFBQ3RDO1VBQU0sUUFBaUIsS0FBQSxBQUFLLE1BQUwsQUFBVyxjQUFsQyxBQUNBO2FBQU8sRUFBRSxVQUFVLENBQVYsQUFBVyxLQUFLLFFBQVEsTUFBakMsQUFBTyxBQUFnQyxBQUN4QztBLHlDQUVLOztBLGFBQXVCLEFBQzNCO1dBQUEsQUFBSyxRQUFMLEFBQWEsTUFBYixBQUFtQixBQUNwQjtBLHNELEFBaElrQjs7Ozs7Ozs7O0EsQUNKQSwyQkFJbkI7Ozs7d0JBQUEsQUFBWSxRQUFpQix1QkFDM0I7U0FBQSxBQUFLLFVBQUwsQUFBZSxBQUNmO1NBQUEsQUFBSyxTQUFMLEFBQWMsQUFDZjtBLDZEQUVHOztBLFNBQTZCLEFBQy9CO1VBQUksQUFDRjtZQUFNLE9BQU8sS0FBQSxBQUFLLFlBQWxCLEFBQWEsQUFBaUIsQUFDOUI7ZUFBTyxLQUFBLEFBQUssSUFBTCxBQUFTLFFBQVEsS0FBQSxBQUFLLE1BQU0sS0FBQSxBQUFLLFFBQUwsQUFBYSxRQUF6QyxBQUFpQixBQUFXLEFBQXFCLFNBQXhELEFBQWlFLEFBQ2xFO0FBSEQsUUFHRSxPQUFBLEFBQU0sR0FBRyxBQUNUO2VBQUEsQUFBTyxBQUNSO0FBQ0Y7QSx1Q0FFRzs7QSxTLEFBQWEsT0FBcUIsQUFDcEM7V0FBQSxBQUFLLFFBQUwsQUFBYSxRQUFRLEtBQUEsQUFBSyxZQUExQixBQUFxQixBQUFpQixNQUF0QyxBQUE0QyxBQUM3QztBLHVDQUVHOztBLFNBQXNCLEFBQ3hCO2FBQU8sT0FBTyxLQUFkLEFBQW1CLEFBQ3BCO0EseUNBRUs7O0EsU0FBbUIsQUFDdkI7V0FBQSxBQUFLLFFBQUwsQUFBYSxXQUFXLEtBQUEsQUFBSyxZQUE3QixBQUF3QixBQUFpQixBQUMxQztBLDRDQUVnQjs7QUFDZjtXQUFBLEFBQUssUUFBTCxBQUFhLEFBQ2Q7QSwrQ0FFVzs7QSxZQUFnQixBQUMxQjthQUFVLEtBQVYsQUFBVSxBQUFLLG9CQUFmLEFBQThCLEFBQy9CO0EsNkNBRVc7O0FBQ1Y7YUFBTyxLQUFBLEFBQUssT0FBTCxBQUFZLElBQW5CLEFBQU8sQUFBZ0IsQUFDeEI7QSxvRCxBQXhDa0I7Ozs7OztBLEFDSEwsUSxBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0EsQUFzQkEsYyxBQUFBOzs7O0EsQUFJQSxZLEFBQUE7Ozs7QSxBQUlBLGEsQUFBQTs7OztBLEFBSUEsdUIsQUFBQTs7Ozs7Ozs7Ozs7QSxBQVdBLGlCLEFBQUE7Ozs7Ozs7QSxBQU9BLE8sQUFBQTs7OztBLEFBSUEsTyxBQUFBLEtBeERULFNBQUEsQUFBUyxNQUFULEFBQWUsS0FBYSxDQUNqQyxJQUFJLFdBQVcsT0FBQSxBQUFPLE9BQ3BCLE9BQUEsQUFBTyxlQURNLEFBQ2IsQUFBc0IsTUFDdEIsT0FBQSxBQUFPLG9CQUFQLEFBQTJCLEtBQTNCLEFBQWdDLE9BQU8sVUFBQSxBQUFDLE9BQUQsQUFBUSxNQUFTLENBQ3RELE1BQUEsQUFBTSxRQUFRLE9BQUEsQUFBTyx5QkFBUCxBQUFnQyxLQUE5QyxBQUFjLEFBQXFDLE1BQ25ELE9BQUEsQUFBTyxBQUNSLE1BSEQsR0FGRixBQUFlLEFBRWIsQUFHRyxLQUdMLElBQUksQ0FBRSxPQUFBLEFBQU8sYUFBYixBQUFNLEFBQW9CLE1BQU0sQ0FDOUIsT0FBQSxBQUFPLGtCQUFQLEFBQXlCLEFBQzFCLFVBQ0QsS0FBSSxPQUFBLEFBQU8sU0FBWCxBQUFJLEFBQWdCLE1BQU0sQ0FDeEIsT0FBQSxBQUFPLEtBQVAsQUFBWSxBQUNiLFVBQ0QsS0FBSSxPQUFBLEFBQU8sU0FBWCxBQUFJLEFBQWdCLE1BQU0sQ0FDeEIsT0FBQSxBQUFPLE9BQVAsQUFBYyxBQUNmLFVBRUQsUUFBQSxBQUFPLEFBQ1IsU0FFTSxVQUFBLEFBQVMsWUFBVCxBQUFxQixLQUFyQixBQUFvQyxNQUF1QixDQUNoRSxPQUFPLE9BQUEsQUFBTyxVQUFQLEFBQWlCLGVBQWpCLEFBQWdDLEtBQWhDLEFBQXFDLEtBQTVDLEFBQU8sQUFBMEMsQUFDbEQsTUFFTSxVQUFBLEFBQVMsVUFBVCxBQUFtQixVQUFuQixBQUFrQyxRQUFnQixDQUN2RCxPQUFPLG9CQUFBLEFBQW9CLFVBQVcsVUFBdEMsQUFBZ0QsQUFDakQsU0FFTSxVQUFBLEFBQVMsV0FBVCxBQUFvQixNQUFnQixDQUN6QyxPQUFPLGdCQUFQLEFBQXVCLEFBQ3hCLFNBRU0sVUFBQSxBQUFTLHFCQUFULEFBQThCLE1BQWEsQ0FDaEQsSUFBTSxhQUFhLE1BQUEsQUFBTSxRQUFOLEFBQWMsUUFBZCxBQUFzQixPQUFPLENBQUEsQUFBQyxXQUFqRCxBQUFnRCxBQUFZLFVBQzVELElBQU0sVUFBTixBQUFnQixHQUZnQyx1R0FJaEQscUJBQUEsQUFBZ0Isd0lBQVksS0FBakIsQUFBaUIsZ0JBQzFCLFFBQUEsQUFBUSxLQUFLLFlBQUEsQUFBWSxNQUFaLEFBQWtCLE9BQWxCLEFBQXlCLFNBQVMsS0FBQSxBQUFLLE9BQXBELEFBQTJELEFBQzVELE9BTitDLGlOQVFoRCxRQUFPLFFBQUEsQUFBUSxRQUFSLEFBQWdCLFNBQVMsQ0FBekIsQUFBMEIsSUFBMUIsQUFBOEIsUUFBckMsQUFBNkMsQUFDOUMsS0FFTSxVQUFBLEFBQVMsZUFBVCxBQUF3QixNQUFzQixDQUNuRCxJQUFJLENBQUUscUJBQUEsQUFBcUIsS0FBSyxDQUExQixBQUEwQixBQUFDLFdBQWpDLEFBQU0sQUFBc0MsT0FBTyxDQUNqRCxPQUFBLEFBQU8sQUFDUixNQUNELFFBQU8sS0FBQSxBQUFLLFFBQVosQUFBb0IsQUFDckIsS0FFTSxVQUFBLEFBQVMsS0FBVCxBQUFjLEdBQWQsQUFBd0IsR0FBVSxDQUN2QyxPQUFPLEVBQUEsQUFBRSxZQUFZLEVBQXJCLEFBQXVCLEFBQ3hCLFVBRU0sVUFBQSxBQUFTLEtBQVQsQUFBYyxHQUFkLEFBQXdCLEdBQVUsQUFDdkM7U0FBTyxFQUFBLEFBQUUsWUFBWSxFQUFyQixBQUF1QixBQUN4QiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIEdsb2JhbCBOYW1lc1xuICovXG5cbnZhciBnbG9iYWxzID0gL1xcYihBcnJheXxEYXRlfE9iamVjdHxNYXRofEpTT04pXFxiL2c7XG5cbi8qKlxuICogUmV0dXJuIGltbWVkaWF0ZSBpZGVudGlmaWVycyBwYXJzZWQgZnJvbSBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge1N0cmluZ3xGdW5jdGlvbn0gbWFwIGZ1bmN0aW9uIG9yIHByZWZpeFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc3RyLCBmbil7XG4gIHZhciBwID0gdW5pcXVlKHByb3BzKHN0cikpO1xuICBpZiAoZm4gJiYgJ3N0cmluZycgPT0gdHlwZW9mIGZuKSBmbiA9IHByZWZpeGVkKGZuKTtcbiAgaWYgKGZuKSByZXR1cm4gbWFwKHN0ciwgcCwgZm4pO1xuICByZXR1cm4gcDtcbn07XG5cbi8qKlxuICogUmV0dXJuIGltbWVkaWF0ZSBpZGVudGlmaWVycyBpbiBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHByb3BzKHN0cikge1xuICByZXR1cm4gc3RyXG4gICAgLnJlcGxhY2UoL1xcLlxcdyt8XFx3KyAqXFwofFwiW15cIl0qXCJ8J1teJ10qJ3xcXC8oW14vXSspXFwvL2csICcnKVxuICAgIC5yZXBsYWNlKGdsb2JhbHMsICcnKVxuICAgIC5tYXRjaCgvW2EtekEtWl9dXFx3Ki9nKVxuICAgIHx8IFtdO1xufVxuXG4vKipcbiAqIFJldHVybiBgc3RyYCB3aXRoIGBwcm9wc2AgbWFwcGVkIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge0FycmF5fSBwcm9wc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG1hcChzdHIsIHByb3BzLCBmbikge1xuICB2YXIgcmUgPSAvXFwuXFx3K3xcXHcrICpcXCh8XCJbXlwiXSpcInwnW14nXSonfFxcLyhbXi9dKylcXC98W2EtekEtWl9dXFx3Ki9nO1xuICByZXR1cm4gc3RyLnJlcGxhY2UocmUsIGZ1bmN0aW9uKF8pe1xuICAgIGlmICgnKCcgPT0gX1tfLmxlbmd0aCAtIDFdKSByZXR1cm4gZm4oXyk7XG4gICAgaWYgKCF+cHJvcHMuaW5kZXhPZihfKSkgcmV0dXJuIF87XG4gICAgcmV0dXJuIGZuKF8pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gdW5pcXVlIGFycmF5LlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFyclxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiB1bmlxdWUoYXJyKSB7XG4gIHZhciByZXQgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgIGlmICh+cmV0LmluZGV4T2YoYXJyW2ldKSkgY29udGludWU7XG4gICAgcmV0LnB1c2goYXJyW2ldKTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59XG5cbi8qKlxuICogTWFwIHdpdGggcHJlZml4IGBzdHJgLlxuICovXG5cbmZ1bmN0aW9uIHByZWZpeGVkKHN0cikge1xuICByZXR1cm4gZnVuY3Rpb24oXyl7XG4gICAgcmV0dXJuIHN0ciArIF87XG4gIH07XG59XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgdG9GdW5jdGlvbiA9IHJlcXVpcmUoJ3RvLWZ1bmN0aW9uJyk7XG5cbi8qKlxuICogR3JvdXAgYGFycmAgd2l0aCBjYWxsYmFjayBgZm4odmFsLCBpKWAuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufFN0cmluZ30gZm4gb3IgcHJvcFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXJyLCBmbil7XG4gIHZhciByZXQgPSB7fTtcbiAgdmFyIHByb3A7XG4gIGZuID0gdG9GdW5jdGlvbihmbik7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyArK2kpIHtcbiAgICBwcm9wID0gZm4oYXJyW2ldLCBpKTtcbiAgICByZXRbcHJvcF0gPSByZXRbcHJvcF0gfHwgW107XG4gICAgcmV0W3Byb3BdLnB1c2goYXJyW2ldKTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59OyIsIlxuLyoqXG4gKiBNb2R1bGUgRGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIGV4cHI7XG50cnkge1xuICBleHByID0gcmVxdWlyZSgncHJvcHMnKTtcbn0gY2F0Y2goZSkge1xuICBleHByID0gcmVxdWlyZSgnY29tcG9uZW50LXByb3BzJyk7XG59XG5cbi8qKlxuICogRXhwb3NlIGB0b0Z1bmN0aW9uKClgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gdG9GdW5jdGlvbjtcblxuLyoqXG4gKiBDb252ZXJ0IGBvYmpgIHRvIGEgYEZ1bmN0aW9uYC5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSBvYmpcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gdG9GdW5jdGlvbihvYmopIHtcbiAgc3dpdGNoICh7fS50b1N0cmluZy5jYWxsKG9iaikpIHtcbiAgICBjYXNlICdbb2JqZWN0IE9iamVjdF0nOlxuICAgICAgcmV0dXJuIG9iamVjdFRvRnVuY3Rpb24ob2JqKTtcbiAgICBjYXNlICdbb2JqZWN0IEZ1bmN0aW9uXSc6XG4gICAgICByZXR1cm4gb2JqO1xuICAgIGNhc2UgJ1tvYmplY3QgU3RyaW5nXSc6XG4gICAgICByZXR1cm4gc3RyaW5nVG9GdW5jdGlvbihvYmopO1xuICAgIGNhc2UgJ1tvYmplY3QgUmVnRXhwXSc6XG4gICAgICByZXR1cm4gcmVnZXhwVG9GdW5jdGlvbihvYmopO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZGVmYXVsdFRvRnVuY3Rpb24ob2JqKTtcbiAgfVxufVxuXG4vKipcbiAqIERlZmF1bHQgdG8gc3RyaWN0IGVxdWFsaXR5LlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBkZWZhdWx0VG9GdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iail7XG4gICAgcmV0dXJuIHZhbCA9PT0gb2JqO1xuICB9O1xufVxuXG4vKipcbiAqIENvbnZlcnQgYHJlYCB0byBhIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7UmVnRXhwfSByZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiByZWdleHBUb0Z1bmN0aW9uKHJlKSB7XG4gIHJldHVybiBmdW5jdGlvbihvYmope1xuICAgIHJldHVybiByZS50ZXN0KG9iaik7XG4gIH07XG59XG5cbi8qKlxuICogQ29udmVydCBwcm9wZXJ0eSBgc3RyYCB0byBhIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc3RyaW5nVG9GdW5jdGlvbihzdHIpIHtcbiAgLy8gaW1tZWRpYXRlIHN1Y2ggYXMgXCI+IDIwXCJcbiAgaWYgKC9eICpcXFcrLy50ZXN0KHN0cikpIHJldHVybiBuZXcgRnVuY3Rpb24oJ18nLCAncmV0dXJuIF8gJyArIHN0cik7XG5cbiAgLy8gcHJvcGVydGllcyBzdWNoIGFzIFwibmFtZS5maXJzdFwiIG9yIFwiYWdlID4gMThcIiBvciBcImFnZSA+IDE4ICYmIGFnZSA8IDM2XCJcbiAgcmV0dXJuIG5ldyBGdW5jdGlvbignXycsICdyZXR1cm4gJyArIGdldChzdHIpKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGBvYmplY3RgIHRvIGEgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdFxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBvYmplY3RUb0Z1bmN0aW9uKG9iaikge1xuICB2YXIgbWF0Y2ggPSB7fTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIG1hdGNoW2tleV0gPSB0eXBlb2Ygb2JqW2tleV0gPT09ICdzdHJpbmcnXG4gICAgICA/IGRlZmF1bHRUb0Z1bmN0aW9uKG9ialtrZXldKVxuICAgICAgOiB0b0Z1bmN0aW9uKG9ialtrZXldKTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24odmFsKXtcbiAgICBpZiAodHlwZW9mIHZhbCAhPT0gJ29iamVjdCcpIHJldHVybiBmYWxzZTtcbiAgICBmb3IgKHZhciBrZXkgaW4gbWF0Y2gpIHtcbiAgICAgIGlmICghKGtleSBpbiB2YWwpKSByZXR1cm4gZmFsc2U7XG4gICAgICBpZiAoIW1hdGNoW2tleV0odmFsW2tleV0pKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xufVxuXG4vKipcbiAqIEJ1aWx0IHRoZSBnZXR0ZXIgZnVuY3Rpb24uIFN1cHBvcnRzIGdldHRlciBzdHlsZSBmdW5jdGlvbnNcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBnZXQoc3RyKSB7XG4gIHZhciBwcm9wcyA9IGV4cHIoc3RyKTtcbiAgaWYgKCFwcm9wcy5sZW5ndGgpIHJldHVybiAnXy4nICsgc3RyO1xuXG4gIHZhciB2YWwsIGksIHByb3A7XG4gIGZvciAoaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgIHByb3AgPSBwcm9wc1tpXTtcbiAgICB2YWwgPSAnXy4nICsgcHJvcDtcbiAgICB2YWwgPSBcIignZnVuY3Rpb24nID09IHR5cGVvZiBcIiArIHZhbCArIFwiID8gXCIgKyB2YWwgKyBcIigpIDogXCIgKyB2YWwgKyBcIilcIjtcblxuICAgIC8vIG1pbWljIG5lZ2F0aXZlIGxvb2tiZWhpbmQgdG8gYXZvaWQgcHJvYmxlbXMgd2l0aCBuZXN0ZWQgcHJvcGVydGllc1xuICAgIHN0ciA9IHN0cmlwTmVzdGVkKHByb3AsIHN0ciwgdmFsKTtcbiAgfVxuXG4gIHJldHVybiBzdHI7XG59XG5cbi8qKlxuICogTWltaWMgbmVnYXRpdmUgbG9va2JlaGluZCB0byBhdm9pZCBwcm9ibGVtcyB3aXRoIG5lc3RlZCBwcm9wZXJ0aWVzLlxuICpcbiAqIFNlZTogaHR0cDovL2Jsb2cuc3RldmVubGV2aXRoYW4uY29tL2FyY2hpdmVzL21pbWljLWxvb2tiZWhpbmQtamF2YXNjcmlwdFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzdHJpcE5lc3RlZCAocHJvcCwgc3RyLCB2YWwpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKG5ldyBSZWdFeHAoJyhcXFxcLik/JyArIHByb3AsICdnJyksIGZ1bmN0aW9uKCQwLCAkMSkge1xuICAgIHJldHVybiAkMSA/ICQwIDogdmFsO1xuICB9KTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IHtcbiAgc3RvcmFnZTogJ2xvY2Fsc3RvcmFnZScsXG4gIHByZWZpeDogJ3NxX2pvYnMnLFxuICB0aW1lb3V0OiAxMDAwLFxuICBsaW1pdDogLTEsXG4gIHByaW5jaXBsZTogJ2ZpZm8nXG59O1xuIiwiLyogQGZsb3cgKi9cbmltcG9ydCB0eXBlIElDb25maWcgZnJvbSAnLi4vaW50ZXJmYWNlcy9jb25maWcnO1xuaW1wb3J0IGNvbmZpZ0RhdGEgZnJvbSAnLi9jb25maWcuZGF0YSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbmZpZyB7XG4gIGNvbmZpZzogSUNvbmZpZyA9IGNvbmZpZ0RhdGE7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBJQ29uZmlnID0ge30pIHtcbiAgICB0aGlzLm1lcmdlKGNvbmZpZyk7XG4gIH1cblxuICBzZXQobmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgdGhpcy5jb25maWdbbmFtZV0gPSB2YWx1ZTtcbiAgfVxuXG4gIGdldChuYW1lOiBzdHJpbmcpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZ1tuYW1lXTtcbiAgfVxuXG4gIGhhcyhuYW1lOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuY29uZmlnLCBuYW1lKTtcbiAgfVxuXG4gIG1lcmdlKGNvbmZpZzoge1tzdHJpbmddOiBhbnl9KSB7XG4gICAgdGhpcy5jb25maWcgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmNvbmZpZywgY29uZmlnKTtcbiAgfVxuXG4gIHJlbW92ZShuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZGVsZXRlIHRoaXMuY29uZmlnW25hbWVdO1xuICB9XG5cbiAgYWxsKCk6IElDb25maWcge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZztcbiAgfVxufVxuIiwiLyogQGZsb3cgKi9cbmltcG9ydCB0eXBlIElDb250YWluZXIgZnJvbSAnLi4vaW50ZXJmYWNlcy9jb250YWluZXInO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb250YWluZXIgaW1wbGVtZW50cyBJQ29udGFpbmVyIHtcblxuICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgX2NvbnRhaW5lcjoge1twcm9wZXJ0eTogc3RyaW5nXTogYW55fSA9IHt9O1xuXG4gIGhhcyhpZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLl9jb250YWluZXIsIGlkKTtcbiAgfVxuXG4gIGdldChpZDogc3RyaW5nKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5fY29udGFpbmVyW2lkXTtcbiAgfVxuXG4gIGFsbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fY29udGFpbmVyO1xuICB9XG5cbiAgYmluZChpZDogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgdGhpcy5fY29udGFpbmVyW2lkXSA9IHZhbHVlO1xuICB9XG5cbiAgcmVtb3ZlKGlkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuX2NvbnRhaW5lciwgaWQpKSB7XG4gICAgICBkZWxldGUgdGhpcy5fY29udGFpbmVyW2lkXTtcbiAgICB9XG4gIH1cblxuICByZW1vdmVBbGwoKTogdm9pZCB7XG4gICAgdGhpcy5fY29udGFpbmVyID0ge307XG4gIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIEV2ZW50IHtcbiAgc3RvcmUgPSB7fTtcbiAgdmVyaWZpZXJQYXR0ZXJuID0gL15bYS16MC05XFwtXFxfXStcXDpiZWZvcmUkfGFmdGVyJHxyZXRyeSR8XFwqJC87XG4gIHdpbGRjYXJkcyA9IFsnKicsICdlcnJvciddO1xuICBlbXB0eUZ1bmMgPSAoKSA9PiB7fTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnN0b3JlLmJlZm9yZSA9IHt9O1xuICAgIHRoaXMuc3RvcmUuYWZ0ZXIgPSB7fTtcbiAgICB0aGlzLnN0b3JlLnJldHJ5ID0ge307XG4gICAgdGhpcy5zdG9yZS53aWxkY2FyZCA9IHt9O1xuICAgIHRoaXMuc3RvcmUuZXJyb3IgPSB0aGlzLmVtcHR5RnVuYztcbiAgICB0aGlzLnN0b3JlWycqJ10gPSB0aGlzLmVtcHR5RnVuYztcbiAgfVxuXG4gIG9uKGtleTogc3RyaW5nLCBjYjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICBpZiAodHlwZW9mKGNiKSAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgbmV3IEVycm9yKCdFdmVudCBzaG91bGQgYmUgYW4gZnVuY3Rpb24nKTtcbiAgICBpZiAodGhpcy5pc1ZhbGlkKGtleSkpIHRoaXMuYWRkKGtleSwgY2IpO1xuICB9XG5cbiAgZW1pdChrZXk6IHN0cmluZywgYXJnczogYW55KSB7XG4gICAgaWYgKHRoaXMud2lsZGNhcmRzLmluZGV4T2Yoa2V5KSA+IC0xKSB7XG4gICAgICB0aGlzLndpbGRjYXJkKGtleSwgLi4uYXJndW1lbnRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgdHlwZSA9IHRoaXMuZ2V0VHlwZShrZXkpO1xuICAgICAgY29uc3QgbmFtZSA9IHRoaXMuZ2V0TmFtZShrZXkpO1xuXG4gICAgICBpZiAodGhpcy5zdG9yZVt0eXBlXSkge1xuICAgICAgICBjb25zdCBjYiA9IHRoaXMuc3RvcmVbdHlwZV1bbmFtZV0gfHwgdGhpcy5lbXB0eUZ1bmM7XG4gICAgICAgIGNiLmNhbGwobnVsbCwgYXJncyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy53aWxkY2FyZCgnKicsIGtleSwgYXJncyk7XG4gIH1cblxuICB3aWxkY2FyZChrZXk6IHN0cmluZywgYWN0aW9uS2V5OiBzdHJpbmcsIGFyZ3M6IGFueSkge1xuICAgIGlmICh0aGlzLnN0b3JlLndpbGRjYXJkW2tleV0pIHtcbiAgICAgIHRoaXMuc3RvcmUud2lsZGNhcmRba2V5XS5jYWxsKG51bGwsIGFjdGlvbktleSwgYXJncyk7XG4gICAgfVxuICB9XG5cbiAgYWRkKGtleTogc3RyaW5nLCBjYjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICBpZiAodGhpcy53aWxkY2FyZHMuaW5kZXhPZihrZXkpID4tMSkge1xuICAgICAgdGhpcy5zdG9yZS53aWxkY2FyZFtrZXldID0gY2I7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHR5cGUgPSB0aGlzLmdldFR5cGUoa2V5KTtcbiAgICAgIGNvbnN0IG5hbWUgPSB0aGlzLmdldE5hbWUoa2V5KTtcbiAgICAgIHRoaXMuc3RvcmVbdHlwZV1bbmFtZV0gPSBjYjtcbiAgICB9XG4gIH1cblxuICBoYXMoa2V5OiBzdHJpbmcpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qga2V5cyA9IGtleS5zcGxpdCgnOicpO1xuICAgICAgcmV0dXJuIGtleXMubGVuZ3RoID4gMSA/ICEhIHRoaXMuc3RvcmVba2V5c1sxXV1ba2V5c1swXV0gOiAhISB0aGlzLnN0b3JlLndpbGRjYXJkW2tleXNbMF1dO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGdldE5hbWUoa2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBrZXkubWF0Y2goLyguKilcXDouKi8pWzFdO1xuICB9XG5cbiAgZ2V0VHlwZShrZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGtleS5tYXRjaCgvXlthLXowLTlcXC1cXF9dK1xcOiguKikvKVsxXTtcbiAgfVxuXG4gIGlzVmFsaWQoa2V5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy52ZXJpZmllclBhdHRlcm4udGVzdChrZXkpIHx8IHRoaXMud2lsZGNhcmRzLmluZGV4T2Yoa2V5KSA+LTE7XG4gIH1cbn1cbiIsImltcG9ydCBRdWV1ZSBmcm9tICcuL3F1ZXVlJztcblxud2luZG93LlF1ZXVlID0gUXVldWU7XG5cbmV4cG9ydCBkZWZhdWx0IFF1ZXVlO1xuIiwiLyogQGZsb3cgKi9cbmltcG9ydCB0eXBlIElDb25maWcgZnJvbSBcIi4uL2ludGVyZmFjZXMvY29uZmlnXCI7XG5pbXBvcnQgdHlwZSBJVGFzayBmcm9tIFwiLi4vaW50ZXJmYWNlcy90YXNrXCI7XG5pbXBvcnQgdHlwZSBJSm9iIGZyb20gXCIuLi9pbnRlcmZhY2VzL2pvYlwiO1xuaW1wb3J0IENvbnRhaW5lciBmcm9tIFwiLi9jb250YWluZXJcIjtcbmltcG9ydCBTdG9yYWdlQ2Fwc3VsZSBmcm9tIFwiLi9zdG9yYWdlLWNhcHN1bGVcIjtcbmltcG9ydCBDb25maWcgZnJvbSBcIi4vY29uZmlnXCI7XG5pbXBvcnQgRXZlbnQgZnJvbSBcIi4vZXZlbnRcIjtcbmltcG9ydCB7XG4gIGNsb25lLFxuICBoYXNNZXRob2QsXG4gIGlzRnVuY3Rpb24sXG4gIGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzLFxuICB1dGlsQ2xlYXJCeVRhZ1xufSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IExvY2FsU3RvcmFnZSBmcm9tIFwiLi9zdG9yYWdlL2xvY2Fsc3RvcmFnZVwiO1xuXG5pbnRlcmZhY2UgSUpvYkluc3RhbmNlIHtcbiAgcHJpb3JpdHk6IG51bWJlcjtcbiAgcmV0cnk6IG51bWJlcjtcbiAgaGFuZGxlKGFyZ3M6IGFueSk6IGFueTtcbiAgYmVmb3JlKGFyZ3M6IGFueSk6IHZvaWQ7XG4gIGFmdGVyKGFyZ3M6IGFueSk6IHZvaWQ7XG59XG5cbmxldCBRdWV1ZSA9ICgoKSA9PiB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIFF1ZXVlLkZJRk8gPSBcImZpZm9cIjtcbiAgUXVldWUuTElGTyA9IFwibGlmb1wiO1xuXG4gIGZ1bmN0aW9uIFF1ZXVlKGNvbmZpZzogSUNvbmZpZykge1xuICAgIF9jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsIGNvbmZpZyk7XG4gIH1cblxuICBmdW5jdGlvbiBfY29uc3RydWN0b3IoY29uZmlnKSB7XG4gICAgdGhpcy5jdXJyZW50Q2hhbm5lbDtcbiAgICB0aGlzLmN1cnJlbnRUaW1lb3V0O1xuICAgIHRoaXMuc3RvcHBlZCA9IHRydWU7XG4gICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgdGhpcy5jaGFubmVscyA9IHt9O1xuICAgIHRoaXMuY29uZmlnID0gbmV3IENvbmZpZyhjb25maWcpO1xuICAgIHRoaXMuc3RvcmFnZSA9IG5ldyBTdG9yYWdlQ2Fwc3VsZShcbiAgICAgIHRoaXMuY29uZmlnLFxuICAgICAgbmV3IExvY2FsU3RvcmFnZSh0aGlzLmNvbmZpZylcbiAgICApO1xuICAgIHRoaXMuZXZlbnQgPSBuZXcgRXZlbnQoKTtcbiAgICB0aGlzLmNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoKTtcbiAgICB0aGlzLnRpbWVvdXQgPSB0aGlzLmNvbmZpZy5nZXQoXCJ0aW1lb3V0XCIpO1xuICB9XG5cbiAgUXVldWUucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKHRhc2spIHtcbiAgICBjb25zdCBpZCA9IHNhdmVUYXNrLmNhbGwodGhpcywgdGFzayk7XG5cbiAgICBpZiAoaWQgJiYgdGhpcy5zdG9wcGVkICYmIHRoaXMucnVubmluZyA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy5zdGFydCgpO1xuICAgIH1cblxuICAgIHJldHVybiBpZDtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnN0b3BwZWQpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiW3N0b3BwZWRdLT4gbmV4dFwiKTtcbiAgICAgIHN0YXR1c09mZi5jYWxsKHRoaXMpO1xuICAgICAgcmV0dXJuIHN0b3BRdWV1ZS5jYWxsKHRoaXMpO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyhcIltuZXh0XS0+XCIpO1xuICAgIHRoaXMuc3RhcnQoKTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpOiBib29sZWFuIHtcbiAgICAvLyBTdG9wIHRoZSBxdWV1ZSBmb3IgcmVzdGFydFxuICAgIHRoaXMuc3RvcHBlZCA9IGZhbHNlO1xuXG4gICAgLy8gUmVnaXN0ZXIgdGFza3MsIGlmIG5vdCByZWdpc3RlcmVkXG4gICAgcmVnaXN0ZXJKb2JzLmNhbGwodGhpcyk7XG5cbiAgICAvLyBDcmVhdGUgYSB0aW1lb3V0IGZvciBzdGFydCBxdWV1ZVxuICAgIHRoaXMucnVubmluZyA9IGNyZWF0ZVRpbWVvdXQuY2FsbCh0aGlzKSA+IDA7XG4gICAgY29uc29sZS5sb2coXCJbc3RhcnRlZF0tPlwiLCB0aGlzLnJ1bm5pbmcpO1xuICAgIHJldHVybiB0aGlzLnJ1bm5pbmc7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZyhcIltzdG9wcGluZ10tPlwiKTtcbiAgICB0aGlzLnN0b3BwZWQgPSB0cnVlOyAvL3RoaXMucnVubmluZztcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuZm9yY2VTdG9wID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coXCJbZm9yY2VTdG9wcGVkXS0+XCIpO1xuICAgIHN0b3BRdWV1ZS5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbihjaGFubmVsOiBzdHJpbmcpIHtcbiAgICBpZiAoIShjaGFubmVsIGluIHRoaXMuY2hhbm5lbHMpKSB7XG4gICAgICB0aGlzLmN1cnJlbnRDaGFubmVsID0gY2hhbm5lbDtcbiAgICAgIHRoaXMuY2hhbm5lbHNbY2hhbm5lbF0gPSBjbG9uZSh0aGlzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5jaGFubmVsc1tjaGFubmVsXTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuY2hhbm5lbCA9IGZ1bmN0aW9uKG5hbWU6IHN0cmluZykge1xuICAgIGlmICghdGhpcy5jaGFubmVsc1tuYW1lXSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDaGFubmVsIG9mIFwiJHtuYW1lfVwiIG5vdCBmb3VuZGApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmNoYW5uZWxzW25hbWVdO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5pc0VtcHR5ID0gZnVuY3Rpb24oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY291bnQoKSA8IDE7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLmNvdW50ID0gZnVuY3Rpb24oKTogQXJyYXk8SVRhc2s+IHtcbiAgICByZXR1cm4gZ2V0VGFza3NXaXRob3V0RnJlZXplZC5jYWxsKHRoaXMpLmxlbmd0aDtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuY291bnRCeVRhZyA9IGZ1bmN0aW9uKHRhZzogc3RyaW5nKTogQXJyYXk8SVRhc2s+IHtcbiAgICByZXR1cm4gZ2V0VGFza3NXaXRob3V0RnJlZXplZC5jYWxsKHRoaXMpLmZpbHRlcih0ID0+IHQudGFnID09PSB0YWcpLmxlbmd0aDtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5jdXJyZW50Q2hhbm5lbCkge1xuICAgICAgdGhpcy5zdG9yYWdlLmNsZWFyKHRoaXMuY3VycmVudENoYW5uZWwpO1xuICAgIH1cbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuY2xlYXJCeVRhZyA9IGZ1bmN0aW9uKHRhZzogc3RyaW5nKTogdm9pZCB7XG4gICAgZGJcbiAgICAgIC5jYWxsKHRoaXMpXG4gICAgICAuYWxsKClcbiAgICAgIC5maWx0ZXIodXRpbENsZWFyQnlUYWcuYmluZCh0YWcpKVxuICAgICAgLmZvckVhY2godCA9PiBkYi5jYWxsKHRoaXMpLmRlbGV0ZSh0Ll9pZCkpO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbihpZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGdldFRhc2tzV2l0aG91dEZyZWV6ZWQuY2FsbCh0aGlzKS5maW5kSW5kZXgodCA9PiB0Ll9pZCA9PT0gaWQpID4gLTE7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLmhhc0J5VGFnID0gZnVuY3Rpb24odGFnOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZ2V0VGFza3NXaXRob3V0RnJlZXplZC5jYWxsKHRoaXMpLmZpbmRJbmRleCh0ID0+IHQudGFnID09PSB0YWcpID4gLTE7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLnNldFRpbWVvdXQgPSBmdW5jdGlvbih2YWw6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMudGltZW91dCA9IHZhbDtcbiAgICB0aGlzLmNvbmZpZy5zZXQoXCJ0aW1lb3V0XCIsIHZhbCk7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLnNldExpbWl0ID0gZnVuY3Rpb24odmFsOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLmNvbmZpZy5zZXQoXCJsaW1pdFwiLCB2YWwpO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5zZXRQcmVmaXggPSBmdW5jdGlvbih2YWw6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuY29uZmlnLnNldChcInByZWZpeFwiLCB2YWwpO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5zZXRQcmluY2lwbGUgPSBmdW5jdGlvbih2YWw6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuY29uZmlnLnNldChcInByaW5jaXBsZVwiLCB2YWwpO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKGtleTogc3RyaW5nLCBjYjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICB0aGlzLmV2ZW50Lm9uKC4uLmFyZ3VtZW50cyk7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLmVycm9yID0gZnVuY3Rpb24oY2I6IEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgdGhpcy5ldmVudC5vbihcImVycm9yXCIsIGNiKTtcbiAgfTtcblxuICBRdWV1ZS5yZWdpc3RlciA9IGZ1bmN0aW9uKGpvYnM6IEFycmF5PElKb2I+KSB7XG4gICAgaWYgKCEoam9icyBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUXVldWUgam9icyBzaG91bGQgYmUgb2JqZWN0cyB3aXRoaW4gYW4gYXJyYXlcIik7XG4gICAgfVxuXG4gICAgUXVldWUuaXNSZWdpc3RlcmVkID0gZmFsc2U7XG4gICAgUXVldWUuam9icyA9IGpvYnM7XG4gIH07XG5cbiAgZnVuY3Rpb24gZ2V0VGFza3NXaXRob3V0RnJlZXplZCgpIHtcbiAgICByZXR1cm4gZGJcbiAgICAgIC5jYWxsKHRoaXMpXG4gICAgICAuYWxsKClcbiAgICAgIC5maWx0ZXIoZXhjbHVkZVNwZWNpZmljVGFza3MuYmluZChbXCJmcmVlemVkXCJdKSk7XG4gIH1cblxuICBmdW5jdGlvbiBkaXNwYXRjaEV2ZW50cyh0YXNrOiBJVGFzaywgdHlwZTogc3RyaW5nKSB7XG4gICAgaWYgKFwidGFnXCIgaW4gdGFzaykge1xuICAgICAgdGhpcy5ldmVudC5lbWl0KGAke3Rhc2sudGFnfToke3R5cGV9YCwgdGFzayk7XG4gICAgICB0aGlzLmV2ZW50LmVtaXQoYCR7dGFzay50YWd9OipgLCB0YXNrKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBkYigpIHtcbiAgICByZXR1cm4gdGhpcy5zdG9yYWdlLmNoYW5uZWwodGhpcy5jdXJyZW50Q2hhbm5lbCk7XG4gIH1cblxuICBmdW5jdGlvbiBzYXZlVGFzayh0YXNrOiBJVGFzaykge1xuICAgIHJldHVybiBkYi5jYWxsKHRoaXMpLnNhdmUodGFzayk7XG4gIH1cblxuICBmdW5jdGlvbiBzYXZlVGFzayh0YXNrOiBJVGFzaykge1xuICAgIHJldHVybiBkYi5jYWxsKHRoaXMpLnNhdmUoY2hlY2tQcmlvcml0eSh0YXNrKSk7XG4gIH1cblxuICBmdW5jdGlvbiBjaGVja1ByaW9yaXR5KHRhc2s6IElUYXNrKSB7XG4gICAgdGFzay5wcmlvcml0eSA9IHRhc2sucHJpb3JpdHkgfHwgMDtcblxuICAgIGlmIChpc05hTih0YXNrLnByaW9yaXR5KSkgdGFzay5wcmlvcml0eSA9IDA7XG5cbiAgICByZXR1cm4gdGFzaztcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVRpbWVvdXQoKTogbnVtYmVyIHtcbiAgICBjb25zdCB0aW1lb3V0ID0gdGhpcy5jb25maWcuZ2V0KFwidGltZW91dFwiKTtcbiAgICByZXR1cm4gKHRoaXMuY3VycmVudFRpbWVvdXQgPSBzZXRUaW1lb3V0KGxvb3BIYW5kbGVyLmJpbmQodGhpcyksIHRpbWVvdXQpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxvY2tUYXNrKHRhc2spOiBib29sZWFuIHtcbiAgICByZXR1cm4gZGIuY2FsbCh0aGlzKS51cGRhdGUodGFzay5faWQsIHsgbG9ja2VkOiB0cnVlIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlVGFzayhpZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGRiLmNhbGwodGhpcykuZGVsZXRlKGlkKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxvb3BIYW5kbGVyKCk6IHZvaWQge1xuICAgIGNvbnN0IHNlbGY6IFF1ZXVlID0gdGhpcztcbiAgICBjb25zdCB0YXNrOiBJVGFzayA9IGRiXG4gICAgICAuY2FsbChzZWxmKVxuICAgICAgLmZldGNoKClcbiAgICAgIC5zaGlmdCgpO1xuXG4gICAgaWYgKHRhc2sgPT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc29sZS5sb2coYC0+ICR7dGhpcy5jdXJyZW50Q2hhbm5lbH0gY2hhbm5lbCBpcyBlbXB0eS4uLmApO1xuICAgICAgc3RvcFF1ZXVlLmNhbGwodGhpcyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFzZWxmLmNvbnRhaW5lci5oYXModGFzay5oYW5kbGVyKSkge1xuICAgICAgY29uc29sZS53YXJuKHRhc2suaGFuZGxlciArIFwiLT4gam9iIG5vdCBmb3VuZFwiKTtcbiAgICB9XG5cbiAgICBjb25zdCBqb2I6IElKb2IgPSBzZWxmLmNvbnRhaW5lci5nZXQodGFzay5oYW5kbGVyKTtcbiAgICBjb25zdCBqb2JJbnN0YW5jZTogSUpvYkluc3RhbmNlID0gbmV3IGpvYi5oYW5kbGVyKCk7XG5cbiAgICAvLyBsb2NrIHRoZSBjdXJyZW50IHRhc2sgZm9yIHByZXZlbnQgcmFjZSBjb25kaXRpb25cbiAgICBsb2NrVGFzay5jYWxsKHNlbGYsIHRhc2spO1xuXG4gICAgLy8gZmlyZSBqb2IgYmVmb3JlIGV2ZW50XG4gICAgZmlyZUpvYklubGluZUV2ZW50LmNhbGwodGhpcywgXCJiZWZvcmVcIiwgam9iSW5zdGFuY2UsIHRhc2suYXJncyk7XG5cbiAgICAvLyBkaXNwYWN0aCBjdXN0b20gYmVmb3JlIGV2ZW50XG4gICAgZGlzcGF0Y2hFdmVudHMuY2FsbCh0aGlzLCB0YXNrLCBcImJlZm9yZVwiKTtcblxuICAgIC8vIHByZXBhcmluZyB3b3JrZXIgZGVwZW5kZW5jaWVzXG4gICAgY29uc3QgZGVwZW5kZW5jaWVzID0gT2JqZWN0LnZhbHVlcyhqb2IuZGVwcyB8fCB7fSk7XG5cbiAgICAvLyBUYXNrIHJ1bm5lciBwcm9taXNlXG4gICAgam9iSW5zdGFuY2UuaGFuZGxlXG4gICAgICAuY2FsbChqb2JJbnN0YW5jZSwgdGFzay5hcmdzLCAuLi5kZXBlbmRlbmNpZXMpXG4gICAgICAudGhlbihqb2JSZXNwb25zZS5jYWxsKHNlbGYsIHRhc2ssIGpvYkluc3RhbmNlKS5iaW5kKHNlbGYpKVxuICAgICAgLmNhdGNoKGpvYkZhaWxlZFJlc3BvbnNlLmNhbGwoc2VsZiwgdGFzaywgam9iSW5zdGFuY2UpLmJpbmQoc2VsZikpO1xuICB9XG5cbiAgZnVuY3Rpb24gam9iUmVzcG9uc2UodGFzazogSVRhc2ssIGpvYjogSUpvYkluc3RhbmNlKTogRnVuY3Rpb24ge1xuICAgIGNvbnN0IHNlbGY6IFF1ZXVlID0gdGhpcztcbiAgICByZXR1cm4gZnVuY3Rpb24ocmVzdWx0OiBib29sZWFuKSB7XG4gICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgIHN1Y2Nlc3NQcm9jZXNzLmNhbGwoc2VsZiwgdGFzaywgam9iKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHJ5UHJvY2Vzcy5jYWxsKHNlbGYsIHRhc2ssIGpvYik7XG4gICAgICB9XG5cbiAgICAgIC8vIGZpcmUgam9iIGFmdGVyIGV2ZW50XG4gICAgICBmaXJlSm9iSW5saW5lRXZlbnQuY2FsbCh0aGlzLCBcImFmdGVyXCIsIGpvYiwgdGFzay5hcmdzKTtcblxuICAgICAgLy8gZGlzcGFjdGggY3VzdG9tIGFmdGVyIGV2ZW50XG4gICAgICBkaXNwYXRjaEV2ZW50cy5jYWxsKHRoaXMsIHRhc2ssIFwiYWZ0ZXJcIik7XG5cbiAgICAgIC8vIHRyeSBuZXh0IHF1ZXVlIGpvYlxuICAgICAgc2VsZi5uZXh0KCk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGpvYkZhaWxlZFJlc3BvbnNlKHRhc2s6IElUYXNrLCBqb2I6IElKb2JJbnN0YW5jZSk6IEZ1bmN0aW9uIHtcbiAgICByZXR1cm4gKHJlc3VsdDogYm9vbGVhbikgPT4ge1xuICAgICAgcmVtb3ZlVGFzay5jYWxsKHRoaXMsIHRhc2suX2lkKTtcblxuICAgICAgdGhpcy5ldmVudC5lbWl0KFwiZXJyb3JcIiwgdGFzayk7XG5cbiAgICAgIHRoaXMubmV4dCgpO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBmaXJlSm9iSW5saW5lRXZlbnQoXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIGpvYjogSUpvYkluc3RhbmNlLFxuICAgIGFyZ3M6IGFueVxuICApOiB2b2lkIHtcbiAgICBpZiAoIWhhc01ldGhvZChqb2IsIG5hbWUpKSByZXR1cm47XG5cbiAgICBpZiAobmFtZSA9PSBcImJlZm9yZVwiICYmIGlzRnVuY3Rpb24oam9iLmJlZm9yZSkpIHtcbiAgICAgIGpvYi5iZWZvcmUuY2FsbChqb2IsIGFyZ3MpO1xuICAgIH0gZWxzZSBpZiAobmFtZSA9PSBcImFmdGVyXCIgJiYgaXNGdW5jdGlvbihqb2IuYWZ0ZXIpKSB7XG4gICAgICBqb2IuYWZ0ZXIuY2FsbChqb2IsIGFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXR1c09mZigpOiB2b2lkIHtcbiAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0b3BRdWV1ZSgpOiB2b2lkIHtcbiAgICB0aGlzLnN0b3AoKTtcblxuICAgIGlmICh0aGlzLmN1cnJlbnRUaW1lb3V0KSB7XG4gICAgICAvLyB1bnNldCBjdXJyZW50IHRpbWVvdXQgdmFsdWVcbiAgICAgIHRoaXMuY3VycmVudFRpbWVvdXQgPSBjbGVhclRpbWVvdXQodGhpcy5jdXJyZW50VGltZW91dCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc3VjY2Vzc1Byb2Nlc3ModGFzazogSVRhc2ssIGpvYjogSUpvYkluc3RhbmNlKTogdm9pZCB7XG4gICAgcmVtb3ZlVGFzay5jYWxsKHRoaXMsIHRhc2suX2lkKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJldHJ5UHJvY2Vzcyh0YXNrOiBJVGFzaywgam9iOiBJSm9iSW5zdGFuY2UpOiBib29sZWFuIHtcbiAgICAvLyBkaXNwYWN0aCBjdXN0b20gcmV0cnkgZXZlbnRcbiAgICBkaXNwYXRjaEV2ZW50cy5jYWxsKHRoaXMsIHRhc2ssIFwicmV0cnlcIik7XG5cbiAgICAvLyB1cGRhdGUgcmV0cnkgdmFsdWVcbiAgICBsZXQgdXBkYXRlVGFzazogSVRhc2sgPSB1cGRhdGVSZXRyeS5jYWxsKHRoaXMsIHRhc2ssIGpvYik7XG5cbiAgICAvLyBkZWxldGUgbG9jayBwcm9wZXJ0eSBmb3IgbmV4dCBwcm9jZXNzXG4gICAgdXBkYXRlVGFzay5sb2NrZWQgPSBmYWxzZTtcblxuICAgIHJldHVybiBkYi5jYWxsKHRoaXMpLnVwZGF0ZSh0YXNrLl9pZCwgdXBkYXRlVGFzayk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVSZXRyeSh0YXNrOiBJVGFzaywgam9iOiBJSm9iSW5zdGFuY2UpOiBJVGFzayB7XG4gICAgaWYgKCEoXCJyZXRyeVwiIGluIGpvYikpIHtcbiAgICAgIGpvYi5yZXRyeSA9IDE7XG4gICAgfVxuXG4gICAgaWYgKCEoXCJ0cmllZFwiIGluIHRhc2spKSB7XG4gICAgICB0YXNrLnRyaWVkID0gMDtcbiAgICAgIHRhc2sucmV0cnkgPSBqb2IucmV0cnk7XG4gICAgfVxuXG4gICAgKyt0YXNrLnRyaWVkO1xuXG4gICAgaWYgKHRhc2sudHJpZWQgPj0gam9iLnJldHJ5KSB7XG4gICAgICB0YXNrLmZyZWV6ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiB0YXNrO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVnaXN0ZXJKb2JzKCk6IHZvaWQge1xuICAgIGlmIChRdWV1ZS5pc1JlZ2lzdGVyZWQpIHJldHVybjtcblxuICAgIGNvbnN0IGpvYnMgPSBRdWV1ZS5qb2JzIHx8IFtdO1xuXG4gICAgZm9yIChjb25zdCBqb2Igb2Ygam9icykge1xuICAgICAgY29uc3QgZnVuY1N0ciA9IGpvYi5oYW5kbGVyLnRvU3RyaW5nKCk7XG4gICAgICBjb25zdCBbc3RyRnVuY3Rpb24sIG5hbWVdID0gZnVuY1N0ci5tYXRjaCgvZnVuY3Rpb25cXHMoW2EtekEtWl9dKykuKj8vKTtcbiAgICAgIGlmIChuYW1lKSB0aGlzLmNvbnRhaW5lci5iaW5kKG5hbWUsIGpvYik7XG4gICAgfVxuXG4gICAgUXVldWUuaXNSZWdpc3RlcmVkID0gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBRdWV1ZTtcbn0pKCk7XG5cbmV4cG9ydCBkZWZhdWx0IFF1ZXVlO1xuIiwiLyogQGZsb3cgKi9cblxuaW1wb3J0IGdyb3VwQnkgZnJvbSBcImdyb3VwLWJ5XCI7XG5pbXBvcnQgTG9jYWxTdG9yYWdlIGZyb20gXCIuL3N0b3JhZ2UvbG9jYWxzdG9yYWdlXCI7XG5pbXBvcnQgdHlwZSBJQ29uZmlnIGZyb20gXCIuLi9pbnRlcmZhY2VzL2NvbmZpZ1wiO1xuaW1wb3J0IHR5cGUgSVN0b3JhZ2UgZnJvbSBcIi4uL2ludGVyZmFjZXMvc3RvcmFnZVwiO1xuaW1wb3J0IHR5cGUgSVRhc2sgZnJvbSBcIi4uL2ludGVyZmFjZXMvdGFza1wiO1xuaW1wb3J0IENvbmZpZyBmcm9tIFwiLi9jb25maWdcIjtcbmltcG9ydCB7IGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzLCBsaWZvLCBmaWZvIH0gZnJvbSBcIi4vdXRpbHNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RvcmFnZUNhcHN1bGUge1xuICBjb25maWc6IElDb25maWc7XG4gIHN0b3JhZ2U6IElTdG9yYWdlO1xuICBzdG9yYWdlQ2hhbm5lbDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogSUNvbmZpZywgc3RvcmFnZTogSVN0b3JhZ2UpIHtcbiAgICB0aGlzLnN0b3JhZ2UgPSBzdG9yYWdlO1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICB9XG5cbiAgY2hhbm5lbChuYW1lOiBzdHJpbmcpOiBTdG9yYWdlQ2Fwc3VsZSB7XG4gICAgdGhpcy5zdG9yYWdlQ2hhbm5lbCA9IG5hbWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBmZXRjaCgpOiBBcnJheTxhbnk+IHtcbiAgICBjb25zdCBhbGwgPSB0aGlzLmFsbCgpLmZpbHRlcihleGNsdWRlU3BlY2lmaWNUYXNrcyk7XG4gICAgY29uc3QgdGFza3MgPSBncm91cEJ5KGFsbCwgXCJwcmlvcml0eVwiKTtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGFza3MpXG4gICAgICAubWFwKGtleSA9PiBwYXJzZUludChrZXkpKVxuICAgICAgLnNvcnQoKGEsIGIpID0+IGIgLSBhKVxuICAgICAgLnJlZHVjZSh0aGlzLnJlZHVjZVRhc2tzKHRhc2tzKSwgW10pO1xuICB9XG5cbiAgc2F2ZSh0YXNrOiBJVGFzayk6IHN0cmluZyB8IGJvb2xlYW4ge1xuICAgIHRyeSB7XG4gICAgICAvLyBnZXQgYWxsIHRhc2tzIGN1cnJlbnQgY2hhbm5lbCdzXG4gICAgICBjb25zdCB0YXNrczogSVRhc2tbXSA9IHRoaXMuc3RvcmFnZS5nZXQodGhpcy5zdG9yYWdlQ2hhbm5lbCk7XG5cbiAgICAgIC8vIGNoZWNrIGNoYW5uZWwgbGltaXQuXG4gICAgICAvLyBpZiBsaW1pdCBpcyBleGNlZWRlZCwgZG9lcyBub3QgaW5zZXJ0IG5ldyB0YXNrXG4gICAgICBpZiAodGhpcy5pc0V4Y2VlZGVkKCkpIHtcbiAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgIGBUYXNrIGxpbWl0IGV4Y2VlZGVkOiBUaGUgJyR7XG4gICAgICAgICAgICB0aGlzLnN0b3JhZ2VDaGFubmVsXG4gICAgICAgICAgfScgY2hhbm5lbCBsaW1pdCBpcyAke3RoaXMuY29uZmlnLmdldChcImxpbWl0XCIpfWBcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyBwcmVwYXJlIGFsbCBwcm9wZXJ0aWVzIGJlZm9yZSBzYXZlXG4gICAgICAvLyBleGFtcGxlOiBjcmVhdGVkQXQgZXRjLlxuICAgICAgdGFzayA9IHRoaXMucHJlcGFyZVRhc2sodGFzayk7XG5cbiAgICAgIC8vIGFkZCB0YXNrIHRvIHN0b3JhZ2VcbiAgICAgIHRhc2tzLnB1c2godGFzayk7XG5cbiAgICAgIC8vIHNhdmUgdGFza3NcbiAgICAgIHRoaXMuc3RvcmFnZS5zZXQodGhpcy5zdG9yYWdlQ2hhbm5lbCwgSlNPTi5zdHJpbmdpZnkodGFza3MpKTtcblxuICAgICAgcmV0dXJuIHRhc2suX2lkO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGUoaWQ6IHN0cmluZywgdXBkYXRlOiB7IFtwcm9wZXJ0eTogc3RyaW5nXTogYW55IH0pOiBib29sZWFuIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZGF0YTogYW55W10gPSB0aGlzLmFsbCgpO1xuICAgICAgY29uc3QgaW5kZXg6IG51bWJlciA9IGRhdGEuZmluZEluZGV4KHQgPT4gdC5faWQgPT0gaWQpO1xuXG4gICAgICBpZiAoaW5kZXggPCAwKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIC8vIG1lcmdlIGV4aXN0aW5nIG9iamVjdCB3aXRoIGdpdmVuIHVwZGF0ZSBvYmplY3RcbiAgICAgIGRhdGFbaW5kZXhdID0gT2JqZWN0LmFzc2lnbih7fSwgZGF0YVtpbmRleF0sIHVwZGF0ZSk7XG5cbiAgICAgIC8vIHNhdmUgdG8gdGhlIHN0b3JhZ2UgYXMgc3RyaW5nXG4gICAgICB0aGlzLnN0b3JhZ2Uuc2V0KHRoaXMuc3RvcmFnZUNoYW5uZWwsIEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGRlbGV0ZShpZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRhdGE6IGFueVtdID0gdGhpcy5hbGwoKTtcbiAgICAgIGNvbnN0IGluZGV4OiBudW1iZXIgPSBkYXRhLmZpbmRJbmRleChkID0+IGQuX2lkID09PSBpZCk7XG5cbiAgICAgIGlmIChpbmRleCA8IDApIHJldHVybiBmYWxzZTtcblxuICAgICAgZGVsZXRlIGRhdGFbaW5kZXhdO1xuXG4gICAgICB0aGlzLnN0b3JhZ2Uuc2V0KFxuICAgICAgICB0aGlzLnN0b3JhZ2VDaGFubmVsLFxuICAgICAgICBKU09OLnN0cmluZ2lmeShkYXRhLmZpbHRlcihkID0+IGQpKVxuICAgICAgKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBhbGwoKTogQXJyYXk8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmFnZS5nZXQodGhpcy5zdG9yYWdlQ2hhbm5lbCk7XG4gIH1cblxuICBnZW5lcmF0ZUlkKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICgoMSArIE1hdGgucmFuZG9tKCkpICogMHgxMDAwMCkudG9TdHJpbmcoMTYpO1xuICB9XG5cbiAgcHJlcGFyZVRhc2sodGFzazogSVRhc2spOiBJVGFzayB7XG4gICAgdGFzay5jcmVhdGVkQXQgPSBEYXRlLm5vdygpO1xuICAgIHRhc2suX2lkID0gdGhpcy5nZW5lcmF0ZUlkKCk7XG4gICAgcmV0dXJuIHRhc2s7XG4gIH1cblxuICByZWR1Y2VUYXNrcyh0YXNrczogSVRhc2tbXSkge1xuICAgIGNvbnN0IHJlZHVjZUZ1bmMgPSAocmVzdWx0OiBJVGFza1tdLCBrZXk6IGFueSkgPT4ge1xuICAgICAgaWYgKHRoaXMuY29uZmlnLmdldChcInByaW5jaXBsZVwiKSA9PT0gXCJsaWZvXCIpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5jb25jYXQodGFza3Nba2V5XS5zb3J0KGxpZm8pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByZXN1bHQuY29uY2F0KHRhc2tzW2tleV0uc29ydChmaWZvKSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiByZWR1Y2VGdW5jLmJpbmQodGhpcyk7XG4gIH1cblxuICBpc0V4Y2VlZGVkKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGxpbWl0OiBudW1iZXIgPSB0aGlzLmNvbmZpZy5nZXQoXCJsaW1pdFwiKTtcbiAgICBjb25zdCB0YXNrczogSVRhc2tbXSA9IHRoaXMuYWxsKCkuZmlsdGVyKGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzKTtcbiAgICByZXR1cm4gIShsaW1pdCA9PT0gLTEgfHwgbGltaXQgPiB0YXNrcy5sZW5ndGgpO1xuICB9XG5cbiAgY2xlYXIoY2hhbm5lbDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5zdG9yYWdlLmNsZWFyKGNoYW5uZWwpO1xuICB9XG59XG4iLCIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgdHlwZSBJU3RvcmFnZSBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL3N0b3JhZ2UnO1xuaW1wb3J0IHR5cGUgSUNvbmZpZyBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL3N0b3JhZ2UnO1xuaW1wb3J0IHR5cGUgSUpvYiBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL2pvYic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExvY2FsU3RvcmFnZSBpbXBsZW1lbnRzIElTdG9yYWdlIHtcbiAgc3RvcmFnZTogT2JqZWN0O1xuICBjb25maWc6IElDb25maWc7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBJQ29uZmlnKSB7XG4gICAgdGhpcy5zdG9yYWdlID0gbG9jYWxTdG9yYWdlO1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICB9XG5cbiAgZ2V0KGtleTogc3RyaW5nKTogQXJyYXk8SUpvYnxbXT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBuYW1lID0gdGhpcy5zdG9yYWdlTmFtZShrZXkpO1xuICAgICAgcmV0dXJuIHRoaXMuaGFzKG5hbWUpID8gSlNPTi5wYXJzZSh0aGlzLnN0b3JhZ2UuZ2V0SXRlbShuYW1lKSkgOiBbXTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gIH1cblxuICBzZXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnN0b3JhZ2Uuc2V0SXRlbSh0aGlzLnN0b3JhZ2VOYW1lKGtleSksIHZhbHVlKTtcbiAgfVxuXG4gIGhhcyhrZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBrZXkgaW4gdGhpcy5zdG9yYWdlO1xuICB9XG5cbiAgY2xlYXIoa2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnN0b3JhZ2UucmVtb3ZlSXRlbSh0aGlzLnN0b3JhZ2VOYW1lKGtleSkpO1xuICB9XG5cbiAgY2xlYXJBbGwoKTogdm9pZCB7XG4gICAgdGhpcy5zdG9yYWdlLmNsZWFyKCk7XG4gIH1cblxuICBzdG9yYWdlTmFtZShzdWZmaXg6IHN0cmluZykge1xuICAgIHJldHVybiBgJHt0aGlzLmdldFByZWZpeCgpfV8ke3N1ZmZpeH1gO1xuICB9XG5cbiAgZ2V0UHJlZml4KCkge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZy5nZXQoJ3ByZWZpeCcpO1xuICB9XG59XG4iLCIvKiBAZmxvdyAqL1xuaW1wb3J0IHR5cGUgSVRhc2sgZnJvbSAnLi4vaW50ZXJmYWNlcy90YXNrJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNsb25lKG9iajogT2JqZWN0KSB7XG4gIHZhciBuZXdDbGFzcyA9IE9iamVjdC5jcmVhdGUoXG4gICAgT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaiksXG4gICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMob2JqKS5yZWR1Y2UoKHByb3BzLCBuYW1lKSA9PiB7XG4gICAgICBwcm9wc1tuYW1lXSA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqLCBuYW1lKTtcbiAgICAgIHJldHVybiBwcm9wcztcbiAgICB9LCB7fSlcbiAgKTtcblxuICBpZiAoISBPYmplY3QuaXNFeHRlbnNpYmxlKG9iaikpIHtcbiAgICBPYmplY3QucHJldmVudEV4dGVuc2lvbnMobmV3Q2xhc3MpO1xuICB9XG4gIGlmIChPYmplY3QuaXNTZWFsZWQob2JqKSkge1xuICAgIE9iamVjdC5zZWFsKG5ld0NsYXNzKTtcbiAgfVxuICBpZiAoT2JqZWN0LmlzRnJvemVuKG9iaikpIHtcbiAgICBPYmplY3QuZnJlZXplKG5ld0NsYXNzKTtcbiAgfVxuXG4gIHJldHVybiBuZXdDbGFzcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc1Byb3BlcnR5KG9iajogRnVuY3Rpb24sIG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgbmFtZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNNZXRob2QoaW5zdGFuY2U6IGFueSwgbWV0aG9kOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGluc3RhbmNlIGluc3RhbmNlb2YgT2JqZWN0ICYmIChtZXRob2QgaW4gaW5zdGFuY2UpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNGdW5jdGlvbihmdW5jOiBGdW5jdGlvbikge1xuICByZXR1cm4gZnVuYyBpbnN0YW5jZW9mIEZ1bmN0aW9uO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXhjbHVkZVNwZWNpZmljVGFza3ModGFzazogSVRhc2spIHtcbiAgY29uc3QgY29uZGl0aW9ucyA9IEFycmF5LmlzQXJyYXkodGhpcykgPyB0aGlzIDogWydmcmVlemVkJywgJ2xvY2tlZCddO1xuICBjb25zdCByZXN1bHRzID0gW107XG5cbiAgZm9yIChjb25zdCBjIG9mIGNvbmRpdGlvbnMpIHtcbiAgICByZXN1bHRzLnB1c2goaGFzUHJvcGVydHkodGFzaywgYykgPT09IGZhbHNlIHx8IHRhc2tbY10gPT09IGZhbHNlKTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHRzLmluZGV4T2YoZmFsc2UpID4gLTEgPyBmYWxzZSA6IHRydWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1dGlsQ2xlYXJCeVRhZyh0YXNrOiBJVGFzayk6IGJvb2xlYW4ge1xuICBpZiAoISBleGNsdWRlU3BlY2lmaWNUYXNrcy5jYWxsKFsnbG9ja2VkJ10sIHRhc2spKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0YXNrLnRhZyA9PT0gdGhpcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpZm8oYTogSVRhc2ssIGI6IElUYXNrKSB7XG4gIHJldHVybiBhLmNyZWF0ZWRBdCAtIGIuY3JlYXRlZEF0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGlmbyhhOiBJVGFzaywgYjogSVRhc2spIHtcbiAgcmV0dXJuIGIuY3JlYXRlZEF0IC0gYS5jcmVhdGVkQXQ7XG59XG4iXX0=
