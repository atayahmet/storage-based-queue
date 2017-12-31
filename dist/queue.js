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
      if (!Object.prototype.hasOwnProperty.call(this._container, id)) return false;
      return delete this._container[id];
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
"use strict";var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};Object.defineProperty(exports, "__esModule", { value: true });var _slicedToArray = function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"]) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}();var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {return typeof obj === "undefined" ? "undefined" : _typeof2(obj);} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);};



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
    if (!canMultiple.call(this, task)) return false;

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

  function canMultiple(task) {
    if ((typeof task === "undefined" ? "undefined" : _typeof(task)) !== "object" || task.unique !== true) return true;

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
    } }, { key: "update", value: function update(

    id, _update) {
      var data = this.all();
      var index = data.findIndex(function (t) {return t._id == id;});

      if (index < 0) return false;

      // merge existing object with given update object
      data[index] = Object.assign({}, data[index], _update);

      // save to the storage as string
      this.storage.set(this.storageChannel, JSON.stringify(data));

      return true;
    } }, { key: "delete", value: function _delete(

    id) {
      var data = this.all();
      var index = data.findIndex(function (d) {return d._id === id;});

      if (index < 0) return false;

      delete data[index];

      this.storage.set(
      this.storageChannel,
      JSON.stringify(data.filter(function (d) {return d;})));

      return true;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY29tcG9uZW50LXByb3BzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2dyb3VwLWJ5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3RvLWZ1bmN0aW9uL2luZGV4LmpzIiwic3JjL2NvbmZpZy5kYXRhLmpzIiwic3JjL2NvbmZpZy5qcyIsInNyYy9jb250YWluZXIuanMiLCJzcmMvZXZlbnQuanMiLCJzcmMvaW5kZXguanMiLCJzcmMvcXVldWUuanMiLCJzcmMvc3RvcmFnZS1jYXBzdWxlLmpzIiwic3JjL3N0b3JhZ2UvbG9jYWxzdG9yYWdlLmpzIiwic3JjL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7V0N4SmUsQUFDSixBQUNUO1VBRmEsQUFFTCxBQUNSO1dBSGEsQUFHSixBQUNUO1NBQU8sQ0FKTSxBQUlMLEFBQ1IsQ0FMYSxBQUNiO2EsQUFE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bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIEdsb2JhbCBOYW1lc1xuICovXG5cbnZhciBnbG9iYWxzID0gL1xcYihBcnJheXxEYXRlfE9iamVjdHxNYXRofEpTT04pXFxiL2c7XG5cbi8qKlxuICogUmV0dXJuIGltbWVkaWF0ZSBpZGVudGlmaWVycyBwYXJzZWQgZnJvbSBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge1N0cmluZ3xGdW5jdGlvbn0gbWFwIGZ1bmN0aW9uIG9yIHByZWZpeFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc3RyLCBmbil7XG4gIHZhciBwID0gdW5pcXVlKHByb3BzKHN0cikpO1xuICBpZiAoZm4gJiYgJ3N0cmluZycgPT0gdHlwZW9mIGZuKSBmbiA9IHByZWZpeGVkKGZuKTtcbiAgaWYgKGZuKSByZXR1cm4gbWFwKHN0ciwgcCwgZm4pO1xuICByZXR1cm4gcDtcbn07XG5cbi8qKlxuICogUmV0dXJuIGltbWVkaWF0ZSBpZGVudGlmaWVycyBpbiBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHByb3BzKHN0cikge1xuICByZXR1cm4gc3RyXG4gICAgLnJlcGxhY2UoL1xcLlxcdyt8XFx3KyAqXFwofFwiW15cIl0qXCJ8J1teJ10qJ3xcXC8oW14vXSspXFwvL2csICcnKVxuICAgIC5yZXBsYWNlKGdsb2JhbHMsICcnKVxuICAgIC5tYXRjaCgvW2EtekEtWl9dXFx3Ki9nKVxuICAgIHx8IFtdO1xufVxuXG4vKipcbiAqIFJldHVybiBgc3RyYCB3aXRoIGBwcm9wc2AgbWFwcGVkIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge0FycmF5fSBwcm9wc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG1hcChzdHIsIHByb3BzLCBmbikge1xuICB2YXIgcmUgPSAvXFwuXFx3K3xcXHcrICpcXCh8XCJbXlwiXSpcInwnW14nXSonfFxcLyhbXi9dKylcXC98W2EtekEtWl9dXFx3Ki9nO1xuICByZXR1cm4gc3RyLnJlcGxhY2UocmUsIGZ1bmN0aW9uKF8pe1xuICAgIGlmICgnKCcgPT0gX1tfLmxlbmd0aCAtIDFdKSByZXR1cm4gZm4oXyk7XG4gICAgaWYgKCF+cHJvcHMuaW5kZXhPZihfKSkgcmV0dXJuIF87XG4gICAgcmV0dXJuIGZuKF8pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gdW5pcXVlIGFycmF5LlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFyclxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiB1bmlxdWUoYXJyKSB7XG4gIHZhciByZXQgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgIGlmICh+cmV0LmluZGV4T2YoYXJyW2ldKSkgY29udGludWU7XG4gICAgcmV0LnB1c2goYXJyW2ldKTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59XG5cbi8qKlxuICogTWFwIHdpdGggcHJlZml4IGBzdHJgLlxuICovXG5cbmZ1bmN0aW9uIHByZWZpeGVkKHN0cikge1xuICByZXR1cm4gZnVuY3Rpb24oXyl7XG4gICAgcmV0dXJuIHN0ciArIF87XG4gIH07XG59XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgdG9GdW5jdGlvbiA9IHJlcXVpcmUoJ3RvLWZ1bmN0aW9uJyk7XG5cbi8qKlxuICogR3JvdXAgYGFycmAgd2l0aCBjYWxsYmFjayBgZm4odmFsLCBpKWAuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufFN0cmluZ30gZm4gb3IgcHJvcFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXJyLCBmbil7XG4gIHZhciByZXQgPSB7fTtcbiAgdmFyIHByb3A7XG4gIGZuID0gdG9GdW5jdGlvbihmbik7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyArK2kpIHtcbiAgICBwcm9wID0gZm4oYXJyW2ldLCBpKTtcbiAgICByZXRbcHJvcF0gPSByZXRbcHJvcF0gfHwgW107XG4gICAgcmV0W3Byb3BdLnB1c2goYXJyW2ldKTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59OyIsIlxuLyoqXG4gKiBNb2R1bGUgRGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIGV4cHI7XG50cnkge1xuICBleHByID0gcmVxdWlyZSgncHJvcHMnKTtcbn0gY2F0Y2goZSkge1xuICBleHByID0gcmVxdWlyZSgnY29tcG9uZW50LXByb3BzJyk7XG59XG5cbi8qKlxuICogRXhwb3NlIGB0b0Z1bmN0aW9uKClgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gdG9GdW5jdGlvbjtcblxuLyoqXG4gKiBDb252ZXJ0IGBvYmpgIHRvIGEgYEZ1bmN0aW9uYC5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSBvYmpcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gdG9GdW5jdGlvbihvYmopIHtcbiAgc3dpdGNoICh7fS50b1N0cmluZy5jYWxsKG9iaikpIHtcbiAgICBjYXNlICdbb2JqZWN0IE9iamVjdF0nOlxuICAgICAgcmV0dXJuIG9iamVjdFRvRnVuY3Rpb24ob2JqKTtcbiAgICBjYXNlICdbb2JqZWN0IEZ1bmN0aW9uXSc6XG4gICAgICByZXR1cm4gb2JqO1xuICAgIGNhc2UgJ1tvYmplY3QgU3RyaW5nXSc6XG4gICAgICByZXR1cm4gc3RyaW5nVG9GdW5jdGlvbihvYmopO1xuICAgIGNhc2UgJ1tvYmplY3QgUmVnRXhwXSc6XG4gICAgICByZXR1cm4gcmVnZXhwVG9GdW5jdGlvbihvYmopO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZGVmYXVsdFRvRnVuY3Rpb24ob2JqKTtcbiAgfVxufVxuXG4vKipcbiAqIERlZmF1bHQgdG8gc3RyaWN0IGVxdWFsaXR5LlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBkZWZhdWx0VG9GdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iail7XG4gICAgcmV0dXJuIHZhbCA9PT0gb2JqO1xuICB9O1xufVxuXG4vKipcbiAqIENvbnZlcnQgYHJlYCB0byBhIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7UmVnRXhwfSByZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiByZWdleHBUb0Z1bmN0aW9uKHJlKSB7XG4gIHJldHVybiBmdW5jdGlvbihvYmope1xuICAgIHJldHVybiByZS50ZXN0KG9iaik7XG4gIH07XG59XG5cbi8qKlxuICogQ29udmVydCBwcm9wZXJ0eSBgc3RyYCB0byBhIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc3RyaW5nVG9GdW5jdGlvbihzdHIpIHtcbiAgLy8gaW1tZWRpYXRlIHN1Y2ggYXMgXCI+IDIwXCJcbiAgaWYgKC9eICpcXFcrLy50ZXN0KHN0cikpIHJldHVybiBuZXcgRnVuY3Rpb24oJ18nLCAncmV0dXJuIF8gJyArIHN0cik7XG5cbiAgLy8gcHJvcGVydGllcyBzdWNoIGFzIFwibmFtZS5maXJzdFwiIG9yIFwiYWdlID4gMThcIiBvciBcImFnZSA+IDE4ICYmIGFnZSA8IDM2XCJcbiAgcmV0dXJuIG5ldyBGdW5jdGlvbignXycsICdyZXR1cm4gJyArIGdldChzdHIpKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGBvYmplY3RgIHRvIGEgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdFxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBvYmplY3RUb0Z1bmN0aW9uKG9iaikge1xuICB2YXIgbWF0Y2ggPSB7fTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIG1hdGNoW2tleV0gPSB0eXBlb2Ygb2JqW2tleV0gPT09ICdzdHJpbmcnXG4gICAgICA/IGRlZmF1bHRUb0Z1bmN0aW9uKG9ialtrZXldKVxuICAgICAgOiB0b0Z1bmN0aW9uKG9ialtrZXldKTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24odmFsKXtcbiAgICBpZiAodHlwZW9mIHZhbCAhPT0gJ29iamVjdCcpIHJldHVybiBmYWxzZTtcbiAgICBmb3IgKHZhciBrZXkgaW4gbWF0Y2gpIHtcbiAgICAgIGlmICghKGtleSBpbiB2YWwpKSByZXR1cm4gZmFsc2U7XG4gICAgICBpZiAoIW1hdGNoW2tleV0odmFsW2tleV0pKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xufVxuXG4vKipcbiAqIEJ1aWx0IHRoZSBnZXR0ZXIgZnVuY3Rpb24uIFN1cHBvcnRzIGdldHRlciBzdHlsZSBmdW5jdGlvbnNcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBnZXQoc3RyKSB7XG4gIHZhciBwcm9wcyA9IGV4cHIoc3RyKTtcbiAgaWYgKCFwcm9wcy5sZW5ndGgpIHJldHVybiAnXy4nICsgc3RyO1xuXG4gIHZhciB2YWwsIGksIHByb3A7XG4gIGZvciAoaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgIHByb3AgPSBwcm9wc1tpXTtcbiAgICB2YWwgPSAnXy4nICsgcHJvcDtcbiAgICB2YWwgPSBcIignZnVuY3Rpb24nID09IHR5cGVvZiBcIiArIHZhbCArIFwiID8gXCIgKyB2YWwgKyBcIigpIDogXCIgKyB2YWwgKyBcIilcIjtcblxuICAgIC8vIG1pbWljIG5lZ2F0aXZlIGxvb2tiZWhpbmQgdG8gYXZvaWQgcHJvYmxlbXMgd2l0aCBuZXN0ZWQgcHJvcGVydGllc1xuICAgIHN0ciA9IHN0cmlwTmVzdGVkKHByb3AsIHN0ciwgdmFsKTtcbiAgfVxuXG4gIHJldHVybiBzdHI7XG59XG5cbi8qKlxuICogTWltaWMgbmVnYXRpdmUgbG9va2JlaGluZCB0byBhdm9pZCBwcm9ibGVtcyB3aXRoIG5lc3RlZCBwcm9wZXJ0aWVzLlxuICpcbiAqIFNlZTogaHR0cDovL2Jsb2cuc3RldmVubGV2aXRoYW4uY29tL2FyY2hpdmVzL21pbWljLWxvb2tiZWhpbmQtamF2YXNjcmlwdFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzdHJpcE5lc3RlZCAocHJvcCwgc3RyLCB2YWwpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKG5ldyBSZWdFeHAoJyhcXFxcLik/JyArIHByb3AsICdnJyksIGZ1bmN0aW9uKCQwLCAkMSkge1xuICAgIHJldHVybiAkMSA/ICQwIDogdmFsO1xuICB9KTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IHtcbiAgc3RvcmFnZTogJ2xvY2Fsc3RvcmFnZScsXG4gIHByZWZpeDogJ3NxX2pvYnMnLFxuICB0aW1lb3V0OiAxMDAwLFxuICBsaW1pdDogLTEsXG4gIHByaW5jaXBsZTogJ2ZpZm8nXG59O1xuIiwiLyogQGZsb3cgKi9cbmltcG9ydCB0eXBlIElDb25maWcgZnJvbSAnLi4vaW50ZXJmYWNlcy9jb25maWcnO1xuaW1wb3J0IGNvbmZpZ0RhdGEgZnJvbSAnLi9jb25maWcuZGF0YSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbmZpZyB7XG4gIGNvbmZpZzogSUNvbmZpZyA9IGNvbmZpZ0RhdGE7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBJQ29uZmlnID0ge30pIHtcbiAgICB0aGlzLm1lcmdlKGNvbmZpZyk7XG4gIH1cblxuICBzZXQobmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgdGhpcy5jb25maWdbbmFtZV0gPSB2YWx1ZTtcbiAgfVxuXG4gIGdldChuYW1lOiBzdHJpbmcpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZ1tuYW1lXTtcbiAgfVxuXG4gIGhhcyhuYW1lOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuY29uZmlnLCBuYW1lKTtcbiAgfVxuXG4gIG1lcmdlKGNvbmZpZzoge1tzdHJpbmddOiBhbnl9KSB7XG4gICAgdGhpcy5jb25maWcgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmNvbmZpZywgY29uZmlnKTtcbiAgfVxuXG4gIHJlbW92ZShuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZGVsZXRlIHRoaXMuY29uZmlnW25hbWVdO1xuICB9XG5cbiAgYWxsKCk6IElDb25maWcge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZztcbiAgfVxufVxuIiwiLyogQGZsb3cgKi9cbmltcG9ydCB0eXBlIElDb250YWluZXIgZnJvbSAnLi4vaW50ZXJmYWNlcy9jb250YWluZXInO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb250YWluZXIgaW1wbGVtZW50cyBJQ29udGFpbmVyIHtcblxuICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgX2NvbnRhaW5lcjoge1twcm9wZXJ0eTogc3RyaW5nXTogYW55fSA9IHt9O1xuXG4gIGhhcyhpZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLl9jb250YWluZXIsIGlkKTtcbiAgfVxuXG4gIGdldChpZDogc3RyaW5nKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5fY29udGFpbmVyW2lkXTtcbiAgfVxuXG4gIGFsbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fY29udGFpbmVyO1xuICB9XG5cbiAgYmluZChpZDogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgdGhpcy5fY29udGFpbmVyW2lkXSA9IHZhbHVlO1xuICB9XG5cbiAgcmVtb3ZlKGlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBpZiAoISBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5fY29udGFpbmVyLCBpZCkpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gZGVsZXRlIHRoaXMuX2NvbnRhaW5lcltpZF07XG4gIH1cblxuICByZW1vdmVBbGwoKTogdm9pZCB7XG4gICAgdGhpcy5fY29udGFpbmVyID0ge307XG4gIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIEV2ZW50IHtcbiAgc3RvcmUgPSB7fTtcbiAgdmVyaWZpZXJQYXR0ZXJuID0gL15bYS16MC05XFwtXFxfXStcXDpiZWZvcmUkfGFmdGVyJHxyZXRyeSR8XFwqJC87XG4gIHdpbGRjYXJkcyA9IFsnKicsICdlcnJvciddO1xuICBlbXB0eUZ1bmMgPSAoKSA9PiB7fTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnN0b3JlLmJlZm9yZSA9IHt9O1xuICAgIHRoaXMuc3RvcmUuYWZ0ZXIgPSB7fTtcbiAgICB0aGlzLnN0b3JlLnJldHJ5ID0ge307XG4gICAgdGhpcy5zdG9yZS53aWxkY2FyZCA9IHt9O1xuICAgIHRoaXMuc3RvcmUuZXJyb3IgPSB0aGlzLmVtcHR5RnVuYztcbiAgICB0aGlzLnN0b3JlWycqJ10gPSB0aGlzLmVtcHR5RnVuYztcbiAgfVxuXG4gIG9uKGtleTogc3RyaW5nLCBjYjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICBpZiAodHlwZW9mKGNiKSAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgbmV3IEVycm9yKCdFdmVudCBzaG91bGQgYmUgYW4gZnVuY3Rpb24nKTtcbiAgICBpZiAodGhpcy5pc1ZhbGlkKGtleSkpIHRoaXMuYWRkKGtleSwgY2IpO1xuICB9XG5cbiAgZW1pdChrZXk6IHN0cmluZywgYXJnczogYW55KSB7XG4gICAgaWYgKHRoaXMud2lsZGNhcmRzLmluZGV4T2Yoa2V5KSA+IC0xKSB7XG4gICAgICB0aGlzLndpbGRjYXJkKGtleSwgLi4uYXJndW1lbnRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgdHlwZSA9IHRoaXMuZ2V0VHlwZShrZXkpO1xuICAgICAgY29uc3QgbmFtZSA9IHRoaXMuZ2V0TmFtZShrZXkpO1xuXG4gICAgICBpZiAodGhpcy5zdG9yZVt0eXBlXSkge1xuICAgICAgICBjb25zdCBjYiA9IHRoaXMuc3RvcmVbdHlwZV1bbmFtZV0gfHwgdGhpcy5lbXB0eUZ1bmM7XG4gICAgICAgIGNiLmNhbGwobnVsbCwgYXJncyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy53aWxkY2FyZCgnKicsIGtleSwgYXJncyk7XG4gIH1cblxuICB3aWxkY2FyZChrZXk6IHN0cmluZywgYWN0aW9uS2V5OiBzdHJpbmcsIGFyZ3M6IGFueSkge1xuICAgIGlmICh0aGlzLnN0b3JlLndpbGRjYXJkW2tleV0pIHtcbiAgICAgIHRoaXMuc3RvcmUud2lsZGNhcmRba2V5XS5jYWxsKG51bGwsIGFjdGlvbktleSwgYXJncyk7XG4gICAgfVxuICB9XG5cbiAgYWRkKGtleTogc3RyaW5nLCBjYjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICBpZiAodGhpcy53aWxkY2FyZHMuaW5kZXhPZihrZXkpID4tMSkge1xuICAgICAgdGhpcy5zdG9yZS53aWxkY2FyZFtrZXldID0gY2I7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHR5cGUgPSB0aGlzLmdldFR5cGUoa2V5KTtcbiAgICAgIGNvbnN0IG5hbWUgPSB0aGlzLmdldE5hbWUoa2V5KTtcbiAgICAgIHRoaXMuc3RvcmVbdHlwZV1bbmFtZV0gPSBjYjtcbiAgICB9XG4gIH1cblxuICBoYXMoa2V5OiBzdHJpbmcpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qga2V5cyA9IGtleS5zcGxpdCgnOicpO1xuICAgICAgcmV0dXJuIGtleXMubGVuZ3RoID4gMSA/ICEhIHRoaXMuc3RvcmVba2V5c1sxXV1ba2V5c1swXV0gOiAhISB0aGlzLnN0b3JlLndpbGRjYXJkW2tleXNbMF1dO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGdldE5hbWUoa2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBrZXkubWF0Y2goLyguKilcXDouKi8pWzFdO1xuICB9XG5cbiAgZ2V0VHlwZShrZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGtleS5tYXRjaCgvXlthLXowLTlcXC1cXF9dK1xcOiguKikvKVsxXTtcbiAgfVxuXG4gIGlzVmFsaWQoa2V5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy52ZXJpZmllclBhdHRlcm4udGVzdChrZXkpIHx8IHRoaXMud2lsZGNhcmRzLmluZGV4T2Yoa2V5KSA+LTE7XG4gIH1cbn1cbiIsImltcG9ydCBRdWV1ZSBmcm9tICcuL3F1ZXVlJztcblxud2luZG93LlF1ZXVlID0gUXVldWU7XG5cbmV4cG9ydCBkZWZhdWx0IFF1ZXVlO1xuIiwiLyogQGZsb3cgKi9cbmltcG9ydCB0eXBlIElDb25maWcgZnJvbSBcIi4uL2ludGVyZmFjZXMvY29uZmlnXCI7XG5pbXBvcnQgdHlwZSBJVGFzayBmcm9tIFwiLi4vaW50ZXJmYWNlcy90YXNrXCI7XG5pbXBvcnQgdHlwZSBJSm9iIGZyb20gXCIuLi9pbnRlcmZhY2VzL2pvYlwiO1xuaW1wb3J0IENvbnRhaW5lciBmcm9tIFwiLi9jb250YWluZXJcIjtcbmltcG9ydCBTdG9yYWdlQ2Fwc3VsZSBmcm9tIFwiLi9zdG9yYWdlLWNhcHN1bGVcIjtcbmltcG9ydCBDb25maWcgZnJvbSBcIi4vY29uZmlnXCI7XG5pbXBvcnQgRXZlbnQgZnJvbSBcIi4vZXZlbnRcIjtcbmltcG9ydCB7XG4gIGNsb25lLFxuICBoYXNNZXRob2QsXG4gIGlzRnVuY3Rpb24sXG4gIGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzLFxuICB1dGlsQ2xlYXJCeVRhZ1xufSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IExvY2FsU3RvcmFnZSBmcm9tIFwiLi9zdG9yYWdlL2xvY2Fsc3RvcmFnZVwiO1xuXG5pbnRlcmZhY2UgSUpvYkluc3RhbmNlIHtcbiAgcHJpb3JpdHk6IG51bWJlcjtcbiAgcmV0cnk6IG51bWJlcjtcbiAgaGFuZGxlKGFyZ3M6IGFueSk6IGFueTtcbiAgYmVmb3JlKGFyZ3M6IGFueSk6IHZvaWQ7XG4gIGFmdGVyKGFyZ3M6IGFueSk6IHZvaWQ7XG59XG5cbmxldCBRdWV1ZSA9ICgoKSA9PiB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIFF1ZXVlLkZJRk8gPSBcImZpZm9cIjtcbiAgUXVldWUuTElGTyA9IFwibGlmb1wiO1xuXG4gIGZ1bmN0aW9uIFF1ZXVlKGNvbmZpZzogSUNvbmZpZykge1xuICAgIF9jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsIGNvbmZpZyk7XG4gIH1cblxuICBmdW5jdGlvbiBfY29uc3RydWN0b3IoY29uZmlnKSB7XG4gICAgdGhpcy5jdXJyZW50Q2hhbm5lbDtcbiAgICB0aGlzLmN1cnJlbnRUaW1lb3V0O1xuICAgIHRoaXMuc3RvcHBlZCA9IHRydWU7XG4gICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgdGhpcy5jaGFubmVscyA9IHt9O1xuICAgIHRoaXMuY29uZmlnID0gbmV3IENvbmZpZyhjb25maWcpO1xuICAgIHRoaXMuc3RvcmFnZSA9IG5ldyBTdG9yYWdlQ2Fwc3VsZShcbiAgICAgIHRoaXMuY29uZmlnLFxuICAgICAgbmV3IExvY2FsU3RvcmFnZSh0aGlzLmNvbmZpZylcbiAgICApO1xuICAgIHRoaXMuZXZlbnQgPSBuZXcgRXZlbnQoKTtcbiAgICB0aGlzLmNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoKTtcbiAgICB0aGlzLnRpbWVvdXQgPSB0aGlzLmNvbmZpZy5nZXQoXCJ0aW1lb3V0XCIpO1xuICB9XG5cbiAgUXVldWUucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKHRhc2spOiBzdHJpbmcgfCBib29sZWFuIHtcbiAgICBpZiAoIWNhbk11bHRpcGxlLmNhbGwodGhpcywgdGFzaykpIHJldHVybiBmYWxzZTtcblxuICAgIGNvbnN0IGlkID0gc2F2ZVRhc2suY2FsbCh0aGlzLCB0YXNrKTtcblxuICAgIGlmIChpZCAmJiB0aGlzLnN0b3BwZWQgJiYgdGhpcy5ydW5uaW5nID09PSB0cnVlKSB7XG4gICAgICB0aGlzLnN0YXJ0KCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGlkO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuc3RvcHBlZCkge1xuICAgICAgY29uc29sZS5sb2coXCJbc3RvcHBlZF0tPiBuZXh0XCIpO1xuICAgICAgc3RhdHVzT2ZmLmNhbGwodGhpcyk7XG4gICAgICByZXR1cm4gc3RvcFF1ZXVlLmNhbGwodGhpcyk7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKFwiW25leHRdLT5cIik7XG4gICAgdGhpcy5zdGFydCgpO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCk6IGJvb2xlYW4ge1xuICAgIC8vIFN0b3AgdGhlIHF1ZXVlIGZvciByZXN0YXJ0XG4gICAgdGhpcy5zdG9wcGVkID0gZmFsc2U7XG5cbiAgICAvLyBSZWdpc3RlciB0YXNrcywgaWYgbm90IHJlZ2lzdGVyZWRcbiAgICByZWdpc3RlckpvYnMuY2FsbCh0aGlzKTtcblxuICAgIC8vIENyZWF0ZSBhIHRpbWVvdXQgZm9yIHN0YXJ0IHF1ZXVlXG4gICAgdGhpcy5ydW5uaW5nID0gY3JlYXRlVGltZW91dC5jYWxsKHRoaXMpID4gMDtcbiAgICBjb25zb2xlLmxvZyhcIltzdGFydGVkXS0+XCIsIHRoaXMucnVubmluZyk7XG4gICAgcmV0dXJuIHRoaXMucnVubmluZztcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKFwiW3N0b3BwaW5nXS0+XCIpO1xuICAgIHRoaXMuc3RvcHBlZCA9IHRydWU7IC8vdGhpcy5ydW5uaW5nO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5mb3JjZVN0b3AgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZyhcIltmb3JjZVN0b3BwZWRdLT5cIik7XG4gICAgc3RvcFF1ZXVlLmNhbGwodGhpcyk7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKGNoYW5uZWw6IHN0cmluZykge1xuICAgIGlmICghKGNoYW5uZWwgaW4gdGhpcy5jaGFubmVscykpIHtcbiAgICAgIHRoaXMuY3VycmVudENoYW5uZWwgPSBjaGFubmVsO1xuICAgICAgdGhpcy5jaGFubmVsc1tjaGFubmVsXSA9IGNsb25lKHRoaXMpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmNoYW5uZWxzW2NoYW5uZWxdO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5jaGFubmVsID0gZnVuY3Rpb24obmFtZTogc3RyaW5nKSB7XG4gICAgaWYgKCF0aGlzLmNoYW5uZWxzW25hbWVdKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENoYW5uZWwgb2YgXCIke25hbWV9XCIgbm90IGZvdW5kYCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuY2hhbm5lbHNbbmFtZV07XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLmlzRW1wdHkgPSBmdW5jdGlvbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jb3VudCgpIDwgMTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuY291bnQgPSBmdW5jdGlvbigpOiBBcnJheTxJVGFzaz4ge1xuICAgIHJldHVybiBnZXRUYXNrc1dpdGhvdXRGcmVlemVkLmNhbGwodGhpcykubGVuZ3RoO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5jb3VudEJ5VGFnID0gZnVuY3Rpb24odGFnOiBzdHJpbmcpOiBBcnJheTxJVGFzaz4ge1xuICAgIHJldHVybiBnZXRUYXNrc1dpdGhvdXRGcmVlemVkLmNhbGwodGhpcykuZmlsdGVyKHQgPT4gdC50YWcgPT09IHRhZykubGVuZ3RoO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmN1cnJlbnRDaGFubmVsKSB7XG4gICAgICB0aGlzLnN0b3JhZ2UuY2xlYXIodGhpcy5jdXJyZW50Q2hhbm5lbCk7XG4gICAgfVxuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5jbGVhckJ5VGFnID0gZnVuY3Rpb24odGFnOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBkYlxuICAgICAgLmNhbGwodGhpcylcbiAgICAgIC5hbGwoKVxuICAgICAgLmZpbHRlcih1dGlsQ2xlYXJCeVRhZy5iaW5kKHRhZykpXG4gICAgICAuZm9yRWFjaCh0ID0+IGRiLmNhbGwodGhpcykuZGVsZXRlKHQuX2lkKSk7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uKGlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZ2V0VGFza3NXaXRob3V0RnJlZXplZC5jYWxsKHRoaXMpLmZpbmRJbmRleCh0ID0+IHQuX2lkID09PSBpZCkgPiAtMTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuaGFzQnlUYWcgPSBmdW5jdGlvbih0YWc6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBnZXRUYXNrc1dpdGhvdXRGcmVlemVkLmNhbGwodGhpcykuZmluZEluZGV4KHQgPT4gdC50YWcgPT09IHRhZykgPiAtMTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuc2V0VGltZW91dCA9IGZ1bmN0aW9uKHZhbDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy50aW1lb3V0ID0gdmFsO1xuICAgIHRoaXMuY29uZmlnLnNldChcInRpbWVvdXRcIiwgdmFsKTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuc2V0TGltaXQgPSBmdW5jdGlvbih2YWw6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuY29uZmlnLnNldChcImxpbWl0XCIsIHZhbCk7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLnNldFByZWZpeCA9IGZ1bmN0aW9uKHZhbDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5jb25maWcuc2V0KFwicHJlZml4XCIsIHZhbCk7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLnNldFByaW5jaXBsZSA9IGZ1bmN0aW9uKHZhbDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5jb25maWcuc2V0KFwicHJpbmNpcGxlXCIsIHZhbCk7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLm9uID0gZnVuY3Rpb24oa2V5OiBzdHJpbmcsIGNiOiBGdW5jdGlvbik6IHZvaWQge1xuICAgIHRoaXMuZXZlbnQub24oLi4uYXJndW1lbnRzKTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuZXJyb3IgPSBmdW5jdGlvbihjYjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICB0aGlzLmV2ZW50Lm9uKFwiZXJyb3JcIiwgY2IpO1xuICB9O1xuXG4gIFF1ZXVlLnJlZ2lzdGVyID0gZnVuY3Rpb24oam9iczogQXJyYXk8SUpvYj4pIHtcbiAgICBpZiAoIShqb2JzIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJRdWV1ZSBqb2JzIHNob3VsZCBiZSBvYmplY3RzIHdpdGhpbiBhbiBhcnJheVwiKTtcbiAgICB9XG5cbiAgICBRdWV1ZS5pc1JlZ2lzdGVyZWQgPSBmYWxzZTtcbiAgICBRdWV1ZS5qb2JzID0gam9icztcbiAgfTtcblxuICBmdW5jdGlvbiBnZXRUYXNrc1dpdGhvdXRGcmVlemVkKCkge1xuICAgIHJldHVybiBkYlxuICAgICAgLmNhbGwodGhpcylcbiAgICAgIC5hbGwoKVxuICAgICAgLmZpbHRlcihleGNsdWRlU3BlY2lmaWNUYXNrcy5iaW5kKFtcImZyZWV6ZWRcIl0pKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRpc3BhdGNoRXZlbnRzKHRhc2s6IElUYXNrLCB0eXBlOiBzdHJpbmcpIHtcbiAgICBpZiAoXCJ0YWdcIiBpbiB0YXNrKSB7XG4gICAgICB0aGlzLmV2ZW50LmVtaXQoYCR7dGFzay50YWd9OiR7dHlwZX1gLCB0YXNrKTtcbiAgICAgIHRoaXMuZXZlbnQuZW1pdChgJHt0YXNrLnRhZ306KmAsIHRhc2spO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGRiKCkge1xuICAgIHJldHVybiB0aGlzLnN0b3JhZ2UuY2hhbm5lbCh0aGlzLmN1cnJlbnRDaGFubmVsKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNhdmVUYXNrKHRhc2s6IElUYXNrKSB7XG4gICAgcmV0dXJuIGRiLmNhbGwodGhpcykuc2F2ZSh0YXNrKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNhdmVUYXNrKHRhc2s6IElUYXNrKSB7XG4gICAgcmV0dXJuIGRiLmNhbGwodGhpcykuc2F2ZShjaGVja1ByaW9yaXR5KHRhc2spKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNoZWNrUHJpb3JpdHkodGFzazogSVRhc2spIHtcbiAgICB0YXNrLnByaW9yaXR5ID0gdGFzay5wcmlvcml0eSB8fCAwO1xuXG4gICAgaWYgKGlzTmFOKHRhc2sucHJpb3JpdHkpKSB0YXNrLnByaW9yaXR5ID0gMDtcblxuICAgIHJldHVybiB0YXNrO1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlVGltZW91dCgpOiBudW1iZXIge1xuICAgIGNvbnN0IHRpbWVvdXQgPSB0aGlzLmNvbmZpZy5nZXQoXCJ0aW1lb3V0XCIpO1xuICAgIHJldHVybiAodGhpcy5jdXJyZW50VGltZW91dCA9IHNldFRpbWVvdXQobG9vcEhhbmRsZXIuYmluZCh0aGlzKSwgdGltZW91dCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9ja1Rhc2sodGFzayk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBkYi5jYWxsKHRoaXMpLnVwZGF0ZSh0YXNrLl9pZCwgeyBsb2NrZWQ6IHRydWUgfSk7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVUYXNrKGlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZGIuY2FsbCh0aGlzKS5kZWxldGUoaWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9vcEhhbmRsZXIoKTogdm9pZCB7XG4gICAgY29uc3Qgc2VsZjogUXVldWUgPSB0aGlzO1xuICAgIGNvbnN0IHRhc2s6IElUYXNrID0gZGJcbiAgICAgIC5jYWxsKHNlbGYpXG4gICAgICAuZmV0Y2goKVxuICAgICAgLnNoaWZ0KCk7XG5cbiAgICBpZiAodGFzayA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zb2xlLmxvZyhgLT4gJHt0aGlzLmN1cnJlbnRDaGFubmVsfSBjaGFubmVsIGlzIGVtcHR5Li4uYCk7XG4gICAgICBzdG9wUXVldWUuY2FsbCh0aGlzKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXNlbGYuY29udGFpbmVyLmhhcyh0YXNrLmhhbmRsZXIpKSB7XG4gICAgICBjb25zb2xlLndhcm4odGFzay5oYW5kbGVyICsgXCItPiBqb2Igbm90IGZvdW5kXCIpO1xuICAgIH1cblxuICAgIGNvbnN0IGpvYjogSUpvYiA9IHNlbGYuY29udGFpbmVyLmdldCh0YXNrLmhhbmRsZXIpO1xuICAgIGNvbnN0IGpvYkluc3RhbmNlOiBJSm9iSW5zdGFuY2UgPSBuZXcgam9iLmhhbmRsZXIoKTtcblxuICAgIC8vIGxvY2sgdGhlIGN1cnJlbnQgdGFzayBmb3IgcHJldmVudCByYWNlIGNvbmRpdGlvblxuICAgIGxvY2tUYXNrLmNhbGwoc2VsZiwgdGFzayk7XG5cbiAgICAvLyBmaXJlIGpvYiBiZWZvcmUgZXZlbnRcbiAgICBmaXJlSm9iSW5saW5lRXZlbnQuY2FsbCh0aGlzLCBcImJlZm9yZVwiLCBqb2JJbnN0YW5jZSwgdGFzay5hcmdzKTtcblxuICAgIC8vIGRpc3BhY3RoIGN1c3RvbSBiZWZvcmUgZXZlbnRcbiAgICBkaXNwYXRjaEV2ZW50cy5jYWxsKHRoaXMsIHRhc2ssIFwiYmVmb3JlXCIpO1xuXG4gICAgLy8gcHJlcGFyaW5nIHdvcmtlciBkZXBlbmRlbmNpZXNcbiAgICBjb25zdCBkZXBlbmRlbmNpZXMgPSBPYmplY3QudmFsdWVzKGpvYi5kZXBzIHx8IHt9KTtcblxuICAgIC8vIFRhc2sgcnVubmVyIHByb21pc2VcbiAgICBqb2JJbnN0YW5jZS5oYW5kbGVcbiAgICAgIC5jYWxsKGpvYkluc3RhbmNlLCB0YXNrLmFyZ3MsIC4uLmRlcGVuZGVuY2llcylcbiAgICAgIC50aGVuKGpvYlJlc3BvbnNlLmNhbGwoc2VsZiwgdGFzaywgam9iSW5zdGFuY2UpLmJpbmQoc2VsZikpXG4gICAgICAuY2F0Y2goam9iRmFpbGVkUmVzcG9uc2UuY2FsbChzZWxmLCB0YXNrLCBqb2JJbnN0YW5jZSkuYmluZChzZWxmKSk7XG4gIH1cblxuICBmdW5jdGlvbiBqb2JSZXNwb25zZSh0YXNrOiBJVGFzaywgam9iOiBJSm9iSW5zdGFuY2UpOiBGdW5jdGlvbiB7XG4gICAgY29uc3Qgc2VsZjogUXVldWUgPSB0aGlzO1xuICAgIHJldHVybiBmdW5jdGlvbihyZXN1bHQ6IGJvb2xlYW4pIHtcbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgc3VjY2Vzc1Byb2Nlc3MuY2FsbChzZWxmLCB0YXNrLCBqb2IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0cnlQcm9jZXNzLmNhbGwoc2VsZiwgdGFzaywgam9iKTtcbiAgICAgIH1cblxuICAgICAgLy8gZmlyZSBqb2IgYWZ0ZXIgZXZlbnRcbiAgICAgIGZpcmVKb2JJbmxpbmVFdmVudC5jYWxsKHRoaXMsIFwiYWZ0ZXJcIiwgam9iLCB0YXNrLmFyZ3MpO1xuXG4gICAgICAvLyBkaXNwYWN0aCBjdXN0b20gYWZ0ZXIgZXZlbnRcbiAgICAgIGRpc3BhdGNoRXZlbnRzLmNhbGwodGhpcywgdGFzaywgXCJhZnRlclwiKTtcblxuICAgICAgLy8gdHJ5IG5leHQgcXVldWUgam9iXG4gICAgICBzZWxmLm5leHQoKTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gam9iRmFpbGVkUmVzcG9uc2UodGFzazogSVRhc2ssIGpvYjogSUpvYkluc3RhbmNlKTogRnVuY3Rpb24ge1xuICAgIHJldHVybiAocmVzdWx0OiBib29sZWFuKSA9PiB7XG4gICAgICByZW1vdmVUYXNrLmNhbGwodGhpcywgdGFzay5faWQpO1xuXG4gICAgICB0aGlzLmV2ZW50LmVtaXQoXCJlcnJvclwiLCB0YXNrKTtcblxuICAgICAgdGhpcy5uZXh0KCk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpcmVKb2JJbmxpbmVFdmVudChcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgam9iOiBJSm9iSW5zdGFuY2UsXG4gICAgYXJnczogYW55XG4gICk6IHZvaWQge1xuICAgIGlmICghaGFzTWV0aG9kKGpvYiwgbmFtZSkpIHJldHVybjtcblxuICAgIGlmIChuYW1lID09IFwiYmVmb3JlXCIgJiYgaXNGdW5jdGlvbihqb2IuYmVmb3JlKSkge1xuICAgICAgam9iLmJlZm9yZS5jYWxsKGpvYiwgYXJncyk7XG4gICAgfSBlbHNlIGlmIChuYW1lID09IFwiYWZ0ZXJcIiAmJiBpc0Z1bmN0aW9uKGpvYi5hZnRlcikpIHtcbiAgICAgIGpvYi5hZnRlci5jYWxsKGpvYiwgYXJncyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc3RhdHVzT2ZmKCk6IHZvaWQge1xuICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RvcFF1ZXVlKCk6IHZvaWQge1xuICAgIHRoaXMuc3RvcCgpO1xuXG4gICAgaWYgKHRoaXMuY3VycmVudFRpbWVvdXQpIHtcbiAgICAgIC8vIHVuc2V0IGN1cnJlbnQgdGltZW91dCB2YWx1ZVxuICAgICAgdGhpcy5jdXJyZW50VGltZW91dCA9IGNsZWFyVGltZW91dCh0aGlzLmN1cnJlbnRUaW1lb3V0KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzdWNjZXNzUHJvY2Vzcyh0YXNrOiBJVGFzaywgam9iOiBJSm9iSW5zdGFuY2UpOiB2b2lkIHtcbiAgICByZW1vdmVUYXNrLmNhbGwodGhpcywgdGFzay5faWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmV0cnlQcm9jZXNzKHRhc2s6IElUYXNrLCBqb2I6IElKb2JJbnN0YW5jZSk6IGJvb2xlYW4ge1xuICAgIC8vIGRpc3BhY3RoIGN1c3RvbSByZXRyeSBldmVudFxuICAgIGRpc3BhdGNoRXZlbnRzLmNhbGwodGhpcywgdGFzaywgXCJyZXRyeVwiKTtcblxuICAgIC8vIHVwZGF0ZSByZXRyeSB2YWx1ZVxuICAgIGxldCB1cGRhdGVUYXNrOiBJVGFzayA9IHVwZGF0ZVJldHJ5LmNhbGwodGhpcywgdGFzaywgam9iKTtcblxuICAgIC8vIGRlbGV0ZSBsb2NrIHByb3BlcnR5IGZvciBuZXh0IHByb2Nlc3NcbiAgICB1cGRhdGVUYXNrLmxvY2tlZCA9IGZhbHNlO1xuXG4gICAgcmV0dXJuIGRiLmNhbGwodGhpcykudXBkYXRlKHRhc2suX2lkLCB1cGRhdGVUYXNrKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbk11bHRpcGxlKHRhc2s6IElUYXNrKTogYm9vbGVhbiB7XG4gICAgaWYgKHR5cGVvZiB0YXNrICE9PSBcIm9iamVjdFwiIHx8IHRhc2sudW5pcXVlICE9PSB0cnVlKSByZXR1cm4gdHJ1ZTtcblxuICAgIHJldHVybiB0aGlzLmhhc0J5VGFnKHRhc2sudGFnKSA8IDE7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVSZXRyeSh0YXNrOiBJVGFzaywgam9iOiBJSm9iSW5zdGFuY2UpOiBJVGFzayB7XG4gICAgaWYgKCEoXCJyZXRyeVwiIGluIGpvYikpIHtcbiAgICAgIGpvYi5yZXRyeSA9IDE7XG4gICAgfVxuXG4gICAgaWYgKCEoXCJ0cmllZFwiIGluIHRhc2spKSB7XG4gICAgICB0YXNrLnRyaWVkID0gMDtcbiAgICAgIHRhc2sucmV0cnkgPSBqb2IucmV0cnk7XG4gICAgfVxuXG4gICAgKyt0YXNrLnRyaWVkO1xuXG4gICAgaWYgKHRhc2sudHJpZWQgPj0gam9iLnJldHJ5KSB7XG4gICAgICB0YXNrLmZyZWV6ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiB0YXNrO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVnaXN0ZXJKb2JzKCk6IHZvaWQge1xuICAgIGlmIChRdWV1ZS5pc1JlZ2lzdGVyZWQpIHJldHVybjtcblxuICAgIGNvbnN0IGpvYnMgPSBRdWV1ZS5qb2JzIHx8IFtdO1xuXG4gICAgZm9yIChjb25zdCBqb2Igb2Ygam9icykge1xuICAgICAgY29uc3QgZnVuY1N0ciA9IGpvYi5oYW5kbGVyLnRvU3RyaW5nKCk7XG4gICAgICBjb25zdCBbc3RyRnVuY3Rpb24sIG5hbWVdID0gZnVuY1N0ci5tYXRjaCgvZnVuY3Rpb25cXHMoW2EtekEtWl9dKykuKj8vKTtcbiAgICAgIGlmIChuYW1lKSB0aGlzLmNvbnRhaW5lci5iaW5kKG5hbWUsIGpvYik7XG4gICAgfVxuXG4gICAgUXVldWUuaXNSZWdpc3RlcmVkID0gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBRdWV1ZTtcbn0pKCk7XG5cbmV4cG9ydCBkZWZhdWx0IFF1ZXVlO1xuIiwiLyogQGZsb3cgKi9cblxuaW1wb3J0IGdyb3VwQnkgZnJvbSBcImdyb3VwLWJ5XCI7XG5pbXBvcnQgTG9jYWxTdG9yYWdlIGZyb20gXCIuL3N0b3JhZ2UvbG9jYWxzdG9yYWdlXCI7XG5pbXBvcnQgdHlwZSBJQ29uZmlnIGZyb20gXCIuLi9pbnRlcmZhY2VzL2NvbmZpZ1wiO1xuaW1wb3J0IHR5cGUgSVN0b3JhZ2UgZnJvbSBcIi4uL2ludGVyZmFjZXMvc3RvcmFnZVwiO1xuaW1wb3J0IHR5cGUgSVRhc2sgZnJvbSBcIi4uL2ludGVyZmFjZXMvdGFza1wiO1xuaW1wb3J0IENvbmZpZyBmcm9tIFwiLi9jb25maWdcIjtcbmltcG9ydCB7IGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzLCBsaWZvLCBmaWZvIH0gZnJvbSBcIi4vdXRpbHNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RvcmFnZUNhcHN1bGUge1xuICBjb25maWc6IElDb25maWc7XG4gIHN0b3JhZ2U6IElTdG9yYWdlO1xuICBzdG9yYWdlQ2hhbm5lbDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogSUNvbmZpZywgc3RvcmFnZTogSVN0b3JhZ2UpIHtcbiAgICB0aGlzLnN0b3JhZ2UgPSBzdG9yYWdlO1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICB9XG5cbiAgY2hhbm5lbChuYW1lOiBzdHJpbmcpOiBTdG9yYWdlQ2Fwc3VsZSB7XG4gICAgdGhpcy5zdG9yYWdlQ2hhbm5lbCA9IG5hbWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBmZXRjaCgpOiBBcnJheTxhbnk+IHtcbiAgICBjb25zdCBhbGwgPSB0aGlzLmFsbCgpLmZpbHRlcihleGNsdWRlU3BlY2lmaWNUYXNrcyk7XG4gICAgY29uc3QgdGFza3MgPSBncm91cEJ5KGFsbCwgXCJwcmlvcml0eVwiKTtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGFza3MpXG4gICAgICAubWFwKGtleSA9PiBwYXJzZUludChrZXkpKVxuICAgICAgLnNvcnQoKGEsIGIpID0+IGIgLSBhKVxuICAgICAgLnJlZHVjZSh0aGlzLnJlZHVjZVRhc2tzKHRhc2tzKSwgW10pO1xuICB9XG5cbiAgc2F2ZSh0YXNrOiBJVGFzayk6IHN0cmluZyB8IGJvb2xlYW4ge1xuICAgIC8vIGdldCBhbGwgdGFza3MgY3VycmVudCBjaGFubmVsJ3NcbiAgICBjb25zdCB0YXNrczogSVRhc2tbXSA9IHRoaXMuc3RvcmFnZS5nZXQodGhpcy5zdG9yYWdlQ2hhbm5lbCk7XG5cbiAgICAvLyBjaGVjayBjaGFubmVsIGxpbWl0LlxuICAgIC8vIGlmIGxpbWl0IGlzIGV4Y2VlZGVkLCBkb2VzIG5vdCBpbnNlcnQgbmV3IHRhc2tcbiAgICBpZiAodGhpcy5pc0V4Y2VlZGVkKCkpIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgYFRhc2sgbGltaXQgZXhjZWVkZWQ6IFRoZSAnJHtcbiAgICAgICAgICB0aGlzLnN0b3JhZ2VDaGFubmVsXG4gICAgICAgIH0nIGNoYW5uZWwgbGltaXQgaXMgJHt0aGlzLmNvbmZpZy5nZXQoXCJsaW1pdFwiKX1gXG4gICAgICApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIHByZXBhcmUgYWxsIHByb3BlcnRpZXMgYmVmb3JlIHNhdmVcbiAgICAvLyBleGFtcGxlOiBjcmVhdGVkQXQgZXRjLlxuICAgIHRhc2sgPSB0aGlzLnByZXBhcmVUYXNrKHRhc2spO1xuXG4gICAgLy8gYWRkIHRhc2sgdG8gc3RvcmFnZVxuICAgIHRhc2tzLnB1c2godGFzayk7XG5cbiAgICAvLyBzYXZlIHRhc2tzXG4gICAgdGhpcy5zdG9yYWdlLnNldCh0aGlzLnN0b3JhZ2VDaGFubmVsLCBKU09OLnN0cmluZ2lmeSh0YXNrcykpO1xuXG4gICAgcmV0dXJuIHRhc2suX2lkO1xuICB9XG5cbiAgdXBkYXRlKGlkOiBzdHJpbmcsIHVwZGF0ZTogeyBbcHJvcGVydHk6IHN0cmluZ106IGFueSB9KTogYm9vbGVhbiB7XG4gICAgY29uc3QgZGF0YTogYW55W10gPSB0aGlzLmFsbCgpO1xuICAgIGNvbnN0IGluZGV4OiBudW1iZXIgPSBkYXRhLmZpbmRJbmRleCh0ID0+IHQuX2lkID09IGlkKTtcblxuICAgIGlmIChpbmRleCA8IDApIHJldHVybiBmYWxzZTtcblxuICAgIC8vIG1lcmdlIGV4aXN0aW5nIG9iamVjdCB3aXRoIGdpdmVuIHVwZGF0ZSBvYmplY3RcbiAgICBkYXRhW2luZGV4XSA9IE9iamVjdC5hc3NpZ24oe30sIGRhdGFbaW5kZXhdLCB1cGRhdGUpO1xuXG4gICAgLy8gc2F2ZSB0byB0aGUgc3RvcmFnZSBhcyBzdHJpbmdcbiAgICB0aGlzLnN0b3JhZ2Uuc2V0KHRoaXMuc3RvcmFnZUNoYW5uZWwsIEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZGVsZXRlKGlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCBkYXRhOiBhbnlbXSA9IHRoaXMuYWxsKCk7XG4gICAgY29uc3QgaW5kZXg6IG51bWJlciA9IGRhdGEuZmluZEluZGV4KGQgPT4gZC5faWQgPT09IGlkKTtcblxuICAgIGlmIChpbmRleCA8IDApIHJldHVybiBmYWxzZTtcblxuICAgIGRlbGV0ZSBkYXRhW2luZGV4XTtcblxuICAgIHRoaXMuc3RvcmFnZS5zZXQoXG4gICAgICB0aGlzLnN0b3JhZ2VDaGFubmVsLFxuICAgICAgSlNPTi5zdHJpbmdpZnkoZGF0YS5maWx0ZXIoZCA9PiBkKSlcbiAgICApO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgYWxsKCk6IEFycmF5PGFueT4ge1xuICAgIHJldHVybiB0aGlzLnN0b3JhZ2UuZ2V0KHRoaXMuc3RvcmFnZUNoYW5uZWwpO1xuICB9XG5cbiAgZ2VuZXJhdGVJZCgpOiBzdHJpbmcge1xuICAgIHJldHVybiAoKDEgKyBNYXRoLnJhbmRvbSgpKSAqIDB4MTAwMDApLnRvU3RyaW5nKDE2KTtcbiAgfVxuXG4gIHByZXBhcmVUYXNrKHRhc2s6IElUYXNrKTogSVRhc2sge1xuICAgIHRhc2suY3JlYXRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICB0YXNrLl9pZCA9IHRoaXMuZ2VuZXJhdGVJZCgpO1xuICAgIHJldHVybiB0YXNrO1xuICB9XG5cbiAgcmVkdWNlVGFza3ModGFza3M6IElUYXNrW10pIHtcbiAgICBjb25zdCByZWR1Y2VGdW5jID0gKHJlc3VsdDogSVRhc2tbXSwga2V5OiBhbnkpID0+IHtcbiAgICAgIGlmICh0aGlzLmNvbmZpZy5nZXQoXCJwcmluY2lwbGVcIikgPT09IFwibGlmb1wiKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQuY29uY2F0KHRhc2tzW2tleV0uc29ydChsaWZvKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVzdWx0LmNvbmNhdCh0YXNrc1trZXldLnNvcnQoZmlmbykpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gcmVkdWNlRnVuYy5iaW5kKHRoaXMpO1xuICB9XG5cbiAgaXNFeGNlZWRlZCgpOiBib29sZWFuIHtcbiAgICBjb25zdCBsaW1pdDogbnVtYmVyID0gdGhpcy5jb25maWcuZ2V0KFwibGltaXRcIik7XG4gICAgY29uc3QgdGFza3M6IElUYXNrW10gPSB0aGlzLmFsbCgpLmZpbHRlcihleGNsdWRlU3BlY2lmaWNUYXNrcyk7XG4gICAgcmV0dXJuICEobGltaXQgPT09IC0xIHx8IGxpbWl0ID4gdGFza3MubGVuZ3RoKTtcbiAgfVxuXG4gIGNsZWFyKGNoYW5uZWw6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmFnZS5jbGVhcihjaGFubmVsKTtcbiAgfVxufVxuIiwiLyogQGZsb3cgKi9cblxuaW1wb3J0IHR5cGUgSVN0b3JhZ2UgZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9zdG9yYWdlJztcbmltcG9ydCB0eXBlIElDb25maWcgZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9zdG9yYWdlJztcbmltcG9ydCB0eXBlIElKb2IgZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9qb2InO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMb2NhbFN0b3JhZ2UgaW1wbGVtZW50cyBJU3RvcmFnZSB7XG4gIHN0b3JhZ2U6IE9iamVjdDtcbiAgY29uZmlnOiBJQ29uZmlnO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogSUNvbmZpZykge1xuICAgIHRoaXMuc3RvcmFnZSA9IGxvY2FsU3RvcmFnZTtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgfVxuXG4gIGdldChrZXk6IHN0cmluZyk6IEFycmF5PElKb2J8W10+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgbmFtZSA9IHRoaXMuc3RvcmFnZU5hbWUoa2V5KTtcbiAgICAgIHJldHVybiB0aGlzLmhhcyhuYW1lKSA/IEpTT04ucGFyc2UodGhpcy5zdG9yYWdlLmdldEl0ZW0obmFtZSkpIDogW107XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICB9XG5cbiAgc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5zdG9yYWdlLnNldEl0ZW0odGhpcy5zdG9yYWdlTmFtZShrZXkpLCB2YWx1ZSk7XG4gIH1cblxuICBoYXMoa2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4ga2V5IGluIHRoaXMuc3RvcmFnZTtcbiAgfVxuXG4gIGNsZWFyKGtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5zdG9yYWdlLnJlbW92ZUl0ZW0odGhpcy5zdG9yYWdlTmFtZShrZXkpKTtcbiAgfVxuXG4gIGNsZWFyQWxsKCk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmFnZS5jbGVhcigpO1xuICB9XG5cbiAgc3RvcmFnZU5hbWUoc3VmZml4OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gYCR7dGhpcy5nZXRQcmVmaXgoKX1fJHtzdWZmaXh9YDtcbiAgfVxuXG4gIGdldFByZWZpeCgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWcuZ2V0KCdwcmVmaXgnKTtcbiAgfVxufVxuIiwiLyogQGZsb3cgKi9cbmltcG9ydCB0eXBlIElUYXNrIGZyb20gJy4uL2ludGVyZmFjZXMvdGFzayc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZShvYmo6IE9iamVjdCkge1xuICB2YXIgbmV3Q2xhc3MgPSBPYmplY3QuY3JlYXRlKFxuICAgIE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopLFxuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG9iaikucmVkdWNlKChwcm9wcywgbmFtZSkgPT4ge1xuICAgICAgcHJvcHNbbmFtZV0gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iaiwgbmFtZSk7XG4gICAgICByZXR1cm4gcHJvcHM7XG4gICAgfSwge30pXG4gICk7XG5cbiAgaWYgKCEgT2JqZWN0LmlzRXh0ZW5zaWJsZShvYmopKSB7XG4gICAgT2JqZWN0LnByZXZlbnRFeHRlbnNpb25zKG5ld0NsYXNzKTtcbiAgfVxuICBpZiAoT2JqZWN0LmlzU2VhbGVkKG9iaikpIHtcbiAgICBPYmplY3Quc2VhbChuZXdDbGFzcyk7XG4gIH1cbiAgaWYgKE9iamVjdC5pc0Zyb3plbihvYmopKSB7XG4gICAgT2JqZWN0LmZyZWV6ZShuZXdDbGFzcyk7XG4gIH1cblxuICByZXR1cm4gbmV3Q2xhc3M7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNQcm9wZXJ0eShvYmo6IEZ1bmN0aW9uLCBuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIG5hbWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzTWV0aG9kKGluc3RhbmNlOiBhbnksIG1ldGhvZDogc3RyaW5nKSB7XG4gIHJldHVybiBpbnN0YW5jZSBpbnN0YW5jZW9mIE9iamVjdCAmJiAobWV0aG9kIGluIGluc3RhbmNlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRnVuY3Rpb24oZnVuYzogRnVuY3Rpb24pIHtcbiAgcmV0dXJuIGZ1bmMgaW5zdGFuY2VvZiBGdW5jdGlvbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzKHRhc2s6IElUYXNrKSB7XG4gIGNvbnN0IGNvbmRpdGlvbnMgPSBBcnJheS5pc0FycmF5KHRoaXMpID8gdGhpcyA6IFsnZnJlZXplZCcsICdsb2NrZWQnXTtcbiAgY29uc3QgcmVzdWx0cyA9IFtdO1xuXG4gIGZvciAoY29uc3QgYyBvZiBjb25kaXRpb25zKSB7XG4gICAgcmVzdWx0cy5wdXNoKGhhc1Byb3BlcnR5KHRhc2ssIGMpID09PSBmYWxzZSB8fCB0YXNrW2NdID09PSBmYWxzZSk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0cy5pbmRleE9mKGZhbHNlKSA+IC0xID8gZmFsc2UgOiB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXRpbENsZWFyQnlUYWcodGFzazogSVRhc2spOiBib29sZWFuIHtcbiAgaWYgKCEgZXhjbHVkZVNwZWNpZmljVGFza3MuY2FsbChbJ2xvY2tlZCddLCB0YXNrKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdGFzay50YWcgPT09IHRoaXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaWZvKGE6IElUYXNrLCBiOiBJVGFzaykge1xuICByZXR1cm4gYS5jcmVhdGVkQXQgLSBiLmNyZWF0ZWRBdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpZm8oYTogSVRhc2ssIGI6IElUYXNrKSB7XG4gIHJldHVybiBiLmNyZWF0ZWRBdCAtIGEuY3JlYXRlZEF0O1xufVxuIl19
