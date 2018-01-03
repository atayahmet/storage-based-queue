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
    if (!this.currentChannel) return false;
    this.storage.clear(this.currentChannel);
    return true;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY29tcG9uZW50LXByb3BzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2dyb3VwLWJ5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3RvLWZ1bmN0aW9uL2luZGV4LmpzIiwic3JjL2NvbmZpZy5kYXRhLmpzIiwic3JjL2NvbmZpZy5qcyIsInNyYy9jb250YWluZXIuanMiLCJzcmMvZXZlbnQuanMiLCJzcmMvaW5kZXguanMiLCJzcmMvcXVldWUuanMiLCJzcmMvc3RvcmFnZS1jYXBzdWxlLmpzIiwic3JjL3N0b3JhZ2UvbG9jYWxzdG9yYWdlLmpzIiwic3JjL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7V0N4SmUsQUFDSixBQUNUO1VBRmEsQUFFTCxBQUNSO1dBSGEsQUFHSixBQUNUO1NBQU8sQ0FKTSxBQUlMLEFBQ1IsQ0FMYSxBQUNiO2EsQUFE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c0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIEdsb2JhbCBOYW1lc1xuICovXG5cbnZhciBnbG9iYWxzID0gL1xcYihBcnJheXxEYXRlfE9iamVjdHxNYXRofEpTT04pXFxiL2c7XG5cbi8qKlxuICogUmV0dXJuIGltbWVkaWF0ZSBpZGVudGlmaWVycyBwYXJzZWQgZnJvbSBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge1N0cmluZ3xGdW5jdGlvbn0gbWFwIGZ1bmN0aW9uIG9yIHByZWZpeFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc3RyLCBmbil7XG4gIHZhciBwID0gdW5pcXVlKHByb3BzKHN0cikpO1xuICBpZiAoZm4gJiYgJ3N0cmluZycgPT0gdHlwZW9mIGZuKSBmbiA9IHByZWZpeGVkKGZuKTtcbiAgaWYgKGZuKSByZXR1cm4gbWFwKHN0ciwgcCwgZm4pO1xuICByZXR1cm4gcDtcbn07XG5cbi8qKlxuICogUmV0dXJuIGltbWVkaWF0ZSBpZGVudGlmaWVycyBpbiBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHByb3BzKHN0cikge1xuICByZXR1cm4gc3RyXG4gICAgLnJlcGxhY2UoL1xcLlxcdyt8XFx3KyAqXFwofFwiW15cIl0qXCJ8J1teJ10qJ3xcXC8oW14vXSspXFwvL2csICcnKVxuICAgIC5yZXBsYWNlKGdsb2JhbHMsICcnKVxuICAgIC5tYXRjaCgvW2EtekEtWl9dXFx3Ki9nKVxuICAgIHx8IFtdO1xufVxuXG4vKipcbiAqIFJldHVybiBgc3RyYCB3aXRoIGBwcm9wc2AgbWFwcGVkIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge0FycmF5fSBwcm9wc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG1hcChzdHIsIHByb3BzLCBmbikge1xuICB2YXIgcmUgPSAvXFwuXFx3K3xcXHcrICpcXCh8XCJbXlwiXSpcInwnW14nXSonfFxcLyhbXi9dKylcXC98W2EtekEtWl9dXFx3Ki9nO1xuICByZXR1cm4gc3RyLnJlcGxhY2UocmUsIGZ1bmN0aW9uKF8pe1xuICAgIGlmICgnKCcgPT0gX1tfLmxlbmd0aCAtIDFdKSByZXR1cm4gZm4oXyk7XG4gICAgaWYgKCF+cHJvcHMuaW5kZXhPZihfKSkgcmV0dXJuIF87XG4gICAgcmV0dXJuIGZuKF8pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gdW5pcXVlIGFycmF5LlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFyclxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiB1bmlxdWUoYXJyKSB7XG4gIHZhciByZXQgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgIGlmICh+cmV0LmluZGV4T2YoYXJyW2ldKSkgY29udGludWU7XG4gICAgcmV0LnB1c2goYXJyW2ldKTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59XG5cbi8qKlxuICogTWFwIHdpdGggcHJlZml4IGBzdHJgLlxuICovXG5cbmZ1bmN0aW9uIHByZWZpeGVkKHN0cikge1xuICByZXR1cm4gZnVuY3Rpb24oXyl7XG4gICAgcmV0dXJuIHN0ciArIF87XG4gIH07XG59XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgdG9GdW5jdGlvbiA9IHJlcXVpcmUoJ3RvLWZ1bmN0aW9uJyk7XG5cbi8qKlxuICogR3JvdXAgYGFycmAgd2l0aCBjYWxsYmFjayBgZm4odmFsLCBpKWAuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufFN0cmluZ30gZm4gb3IgcHJvcFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXJyLCBmbil7XG4gIHZhciByZXQgPSB7fTtcbiAgdmFyIHByb3A7XG4gIGZuID0gdG9GdW5jdGlvbihmbik7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyArK2kpIHtcbiAgICBwcm9wID0gZm4oYXJyW2ldLCBpKTtcbiAgICByZXRbcHJvcF0gPSByZXRbcHJvcF0gfHwgW107XG4gICAgcmV0W3Byb3BdLnB1c2goYXJyW2ldKTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59OyIsIlxuLyoqXG4gKiBNb2R1bGUgRGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIGV4cHI7XG50cnkge1xuICBleHByID0gcmVxdWlyZSgncHJvcHMnKTtcbn0gY2F0Y2goZSkge1xuICBleHByID0gcmVxdWlyZSgnY29tcG9uZW50LXByb3BzJyk7XG59XG5cbi8qKlxuICogRXhwb3NlIGB0b0Z1bmN0aW9uKClgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gdG9GdW5jdGlvbjtcblxuLyoqXG4gKiBDb252ZXJ0IGBvYmpgIHRvIGEgYEZ1bmN0aW9uYC5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSBvYmpcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gdG9GdW5jdGlvbihvYmopIHtcbiAgc3dpdGNoICh7fS50b1N0cmluZy5jYWxsKG9iaikpIHtcbiAgICBjYXNlICdbb2JqZWN0IE9iamVjdF0nOlxuICAgICAgcmV0dXJuIG9iamVjdFRvRnVuY3Rpb24ob2JqKTtcbiAgICBjYXNlICdbb2JqZWN0IEZ1bmN0aW9uXSc6XG4gICAgICByZXR1cm4gb2JqO1xuICAgIGNhc2UgJ1tvYmplY3QgU3RyaW5nXSc6XG4gICAgICByZXR1cm4gc3RyaW5nVG9GdW5jdGlvbihvYmopO1xuICAgIGNhc2UgJ1tvYmplY3QgUmVnRXhwXSc6XG4gICAgICByZXR1cm4gcmVnZXhwVG9GdW5jdGlvbihvYmopO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZGVmYXVsdFRvRnVuY3Rpb24ob2JqKTtcbiAgfVxufVxuXG4vKipcbiAqIERlZmF1bHQgdG8gc3RyaWN0IGVxdWFsaXR5LlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBkZWZhdWx0VG9GdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iail7XG4gICAgcmV0dXJuIHZhbCA9PT0gb2JqO1xuICB9O1xufVxuXG4vKipcbiAqIENvbnZlcnQgYHJlYCB0byBhIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7UmVnRXhwfSByZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiByZWdleHBUb0Z1bmN0aW9uKHJlKSB7XG4gIHJldHVybiBmdW5jdGlvbihvYmope1xuICAgIHJldHVybiByZS50ZXN0KG9iaik7XG4gIH07XG59XG5cbi8qKlxuICogQ29udmVydCBwcm9wZXJ0eSBgc3RyYCB0byBhIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc3RyaW5nVG9GdW5jdGlvbihzdHIpIHtcbiAgLy8gaW1tZWRpYXRlIHN1Y2ggYXMgXCI+IDIwXCJcbiAgaWYgKC9eICpcXFcrLy50ZXN0KHN0cikpIHJldHVybiBuZXcgRnVuY3Rpb24oJ18nLCAncmV0dXJuIF8gJyArIHN0cik7XG5cbiAgLy8gcHJvcGVydGllcyBzdWNoIGFzIFwibmFtZS5maXJzdFwiIG9yIFwiYWdlID4gMThcIiBvciBcImFnZSA+IDE4ICYmIGFnZSA8IDM2XCJcbiAgcmV0dXJuIG5ldyBGdW5jdGlvbignXycsICdyZXR1cm4gJyArIGdldChzdHIpKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGBvYmplY3RgIHRvIGEgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdFxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBvYmplY3RUb0Z1bmN0aW9uKG9iaikge1xuICB2YXIgbWF0Y2ggPSB7fTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIG1hdGNoW2tleV0gPSB0eXBlb2Ygb2JqW2tleV0gPT09ICdzdHJpbmcnXG4gICAgICA/IGRlZmF1bHRUb0Z1bmN0aW9uKG9ialtrZXldKVxuICAgICAgOiB0b0Z1bmN0aW9uKG9ialtrZXldKTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24odmFsKXtcbiAgICBpZiAodHlwZW9mIHZhbCAhPT0gJ29iamVjdCcpIHJldHVybiBmYWxzZTtcbiAgICBmb3IgKHZhciBrZXkgaW4gbWF0Y2gpIHtcbiAgICAgIGlmICghKGtleSBpbiB2YWwpKSByZXR1cm4gZmFsc2U7XG4gICAgICBpZiAoIW1hdGNoW2tleV0odmFsW2tleV0pKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xufVxuXG4vKipcbiAqIEJ1aWx0IHRoZSBnZXR0ZXIgZnVuY3Rpb24uIFN1cHBvcnRzIGdldHRlciBzdHlsZSBmdW5jdGlvbnNcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBnZXQoc3RyKSB7XG4gIHZhciBwcm9wcyA9IGV4cHIoc3RyKTtcbiAgaWYgKCFwcm9wcy5sZW5ndGgpIHJldHVybiAnXy4nICsgc3RyO1xuXG4gIHZhciB2YWwsIGksIHByb3A7XG4gIGZvciAoaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgIHByb3AgPSBwcm9wc1tpXTtcbiAgICB2YWwgPSAnXy4nICsgcHJvcDtcbiAgICB2YWwgPSBcIignZnVuY3Rpb24nID09IHR5cGVvZiBcIiArIHZhbCArIFwiID8gXCIgKyB2YWwgKyBcIigpIDogXCIgKyB2YWwgKyBcIilcIjtcblxuICAgIC8vIG1pbWljIG5lZ2F0aXZlIGxvb2tiZWhpbmQgdG8gYXZvaWQgcHJvYmxlbXMgd2l0aCBuZXN0ZWQgcHJvcGVydGllc1xuICAgIHN0ciA9IHN0cmlwTmVzdGVkKHByb3AsIHN0ciwgdmFsKTtcbiAgfVxuXG4gIHJldHVybiBzdHI7XG59XG5cbi8qKlxuICogTWltaWMgbmVnYXRpdmUgbG9va2JlaGluZCB0byBhdm9pZCBwcm9ibGVtcyB3aXRoIG5lc3RlZCBwcm9wZXJ0aWVzLlxuICpcbiAqIFNlZTogaHR0cDovL2Jsb2cuc3RldmVubGV2aXRoYW4uY29tL2FyY2hpdmVzL21pbWljLWxvb2tiZWhpbmQtamF2YXNjcmlwdFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzdHJpcE5lc3RlZCAocHJvcCwgc3RyLCB2YWwpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKG5ldyBSZWdFeHAoJyhcXFxcLik/JyArIHByb3AsICdnJyksIGZ1bmN0aW9uKCQwLCAkMSkge1xuICAgIHJldHVybiAkMSA/ICQwIDogdmFsO1xuICB9KTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IHtcbiAgc3RvcmFnZTogJ2xvY2Fsc3RvcmFnZScsXG4gIHByZWZpeDogJ3NxX2pvYnMnLFxuICB0aW1lb3V0OiAxMDAwLFxuICBsaW1pdDogLTEsXG4gIHByaW5jaXBsZTogJ2ZpZm8nXG59O1xuIiwiLyogQGZsb3cgKi9cbmltcG9ydCB0eXBlIElDb25maWcgZnJvbSAnLi4vaW50ZXJmYWNlcy9jb25maWcnO1xuaW1wb3J0IGNvbmZpZ0RhdGEgZnJvbSAnLi9jb25maWcuZGF0YSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbmZpZyB7XG4gIGNvbmZpZzogSUNvbmZpZyA9IGNvbmZpZ0RhdGE7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBJQ29uZmlnID0ge30pIHtcbiAgICB0aGlzLm1lcmdlKGNvbmZpZyk7XG4gIH1cblxuICBzZXQobmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgdGhpcy5jb25maWdbbmFtZV0gPSB2YWx1ZTtcbiAgfVxuXG4gIGdldChuYW1lOiBzdHJpbmcpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZ1tuYW1lXTtcbiAgfVxuXG4gIGhhcyhuYW1lOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuY29uZmlnLCBuYW1lKTtcbiAgfVxuXG4gIG1lcmdlKGNvbmZpZzoge1tzdHJpbmddOiBhbnl9KSB7XG4gICAgdGhpcy5jb25maWcgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmNvbmZpZywgY29uZmlnKTtcbiAgfVxuXG4gIHJlbW92ZShuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZGVsZXRlIHRoaXMuY29uZmlnW25hbWVdO1xuICB9XG5cbiAgYWxsKCk6IElDb25maWcge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZztcbiAgfVxufVxuIiwiLyogQGZsb3cgKi9cbmltcG9ydCB0eXBlIElDb250YWluZXIgZnJvbSAnLi4vaW50ZXJmYWNlcy9jb250YWluZXInO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb250YWluZXIgaW1wbGVtZW50cyBJQ29udGFpbmVyIHtcblxuICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgX2NvbnRhaW5lcjoge1twcm9wZXJ0eTogc3RyaW5nXTogYW55fSA9IHt9O1xuXG4gIGhhcyhpZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLl9jb250YWluZXIsIGlkKTtcbiAgfVxuXG4gIGdldChpZDogc3RyaW5nKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5fY29udGFpbmVyW2lkXTtcbiAgfVxuXG4gIGFsbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fY29udGFpbmVyO1xuICB9XG5cbiAgYmluZChpZDogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgdGhpcy5fY29udGFpbmVyW2lkXSA9IHZhbHVlO1xuICB9XG5cbiAgcmVtb3ZlKGlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBpZiAoISBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5fY29udGFpbmVyLCBpZCkpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gZGVsZXRlIHRoaXMuX2NvbnRhaW5lcltpZF07XG4gIH1cblxuICByZW1vdmVBbGwoKTogdm9pZCB7XG4gICAgdGhpcy5fY29udGFpbmVyID0ge307XG4gIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIEV2ZW50IHtcbiAgc3RvcmUgPSB7fTtcbiAgdmVyaWZpZXJQYXR0ZXJuID0gL15bYS16MC05XFwtXFxfXStcXDpiZWZvcmUkfGFmdGVyJHxyZXRyeSR8XFwqJC87XG4gIHdpbGRjYXJkcyA9IFsnKicsICdlcnJvciddO1xuICBlbXB0eUZ1bmMgPSAoKSA9PiB7fTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnN0b3JlLmJlZm9yZSA9IHt9O1xuICAgIHRoaXMuc3RvcmUuYWZ0ZXIgPSB7fTtcbiAgICB0aGlzLnN0b3JlLnJldHJ5ID0ge307XG4gICAgdGhpcy5zdG9yZS53aWxkY2FyZCA9IHt9O1xuICAgIHRoaXMuc3RvcmUuZXJyb3IgPSB0aGlzLmVtcHR5RnVuYztcbiAgICB0aGlzLnN0b3JlWycqJ10gPSB0aGlzLmVtcHR5RnVuYztcbiAgfVxuXG4gIG9uKGtleTogc3RyaW5nLCBjYjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICBpZiAodHlwZW9mKGNiKSAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgbmV3IEVycm9yKCdFdmVudCBzaG91bGQgYmUgYW4gZnVuY3Rpb24nKTtcbiAgICBpZiAodGhpcy5pc1ZhbGlkKGtleSkpIHRoaXMuYWRkKGtleSwgY2IpO1xuICB9XG5cbiAgZW1pdChrZXk6IHN0cmluZywgYXJnczogYW55KSB7XG4gICAgaWYgKHRoaXMud2lsZGNhcmRzLmluZGV4T2Yoa2V5KSA+IC0xKSB7XG4gICAgICB0aGlzLndpbGRjYXJkKGtleSwgLi4uYXJndW1lbnRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgdHlwZSA9IHRoaXMuZ2V0VHlwZShrZXkpO1xuICAgICAgY29uc3QgbmFtZSA9IHRoaXMuZ2V0TmFtZShrZXkpO1xuXG4gICAgICBpZiAodGhpcy5zdG9yZVt0eXBlXSkge1xuICAgICAgICBjb25zdCBjYiA9IHRoaXMuc3RvcmVbdHlwZV1bbmFtZV0gfHwgdGhpcy5lbXB0eUZ1bmM7XG4gICAgICAgIGNiLmNhbGwobnVsbCwgYXJncyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy53aWxkY2FyZCgnKicsIGtleSwgYXJncyk7XG4gIH1cblxuICB3aWxkY2FyZChrZXk6IHN0cmluZywgYWN0aW9uS2V5OiBzdHJpbmcsIGFyZ3M6IGFueSkge1xuICAgIGlmICh0aGlzLnN0b3JlLndpbGRjYXJkW2tleV0pIHtcbiAgICAgIHRoaXMuc3RvcmUud2lsZGNhcmRba2V5XS5jYWxsKG51bGwsIGFjdGlvbktleSwgYXJncyk7XG4gICAgfVxuICB9XG5cbiAgYWRkKGtleTogc3RyaW5nLCBjYjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICBpZiAodGhpcy53aWxkY2FyZHMuaW5kZXhPZihrZXkpID4tMSkge1xuICAgICAgdGhpcy5zdG9yZS53aWxkY2FyZFtrZXldID0gY2I7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHR5cGUgPSB0aGlzLmdldFR5cGUoa2V5KTtcbiAgICAgIGNvbnN0IG5hbWUgPSB0aGlzLmdldE5hbWUoa2V5KTtcbiAgICAgIHRoaXMuc3RvcmVbdHlwZV1bbmFtZV0gPSBjYjtcbiAgICB9XG4gIH1cblxuICBoYXMoa2V5OiBzdHJpbmcpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qga2V5cyA9IGtleS5zcGxpdCgnOicpO1xuICAgICAgcmV0dXJuIGtleXMubGVuZ3RoID4gMSA/ICEhIHRoaXMuc3RvcmVba2V5c1sxXV1ba2V5c1swXV0gOiAhISB0aGlzLnN0b3JlLndpbGRjYXJkW2tleXNbMF1dO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGdldE5hbWUoa2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBrZXkubWF0Y2goLyguKilcXDouKi8pWzFdO1xuICB9XG5cbiAgZ2V0VHlwZShrZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGtleS5tYXRjaCgvXlthLXowLTlcXC1cXF9dK1xcOiguKikvKVsxXTtcbiAgfVxuXG4gIGlzVmFsaWQoa2V5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy52ZXJpZmllclBhdHRlcm4udGVzdChrZXkpIHx8IHRoaXMud2lsZGNhcmRzLmluZGV4T2Yoa2V5KSA+LTE7XG4gIH1cbn1cbiIsImltcG9ydCBRdWV1ZSBmcm9tICcuL3F1ZXVlJztcblxud2luZG93LlF1ZXVlID0gUXVldWU7XG5cbmV4cG9ydCBkZWZhdWx0IFF1ZXVlO1xuIiwiLyogQGZsb3cgKi9cbmltcG9ydCB0eXBlIElDb25maWcgZnJvbSBcIi4uL2ludGVyZmFjZXMvY29uZmlnXCI7XG5pbXBvcnQgdHlwZSBJVGFzayBmcm9tIFwiLi4vaW50ZXJmYWNlcy90YXNrXCI7XG5pbXBvcnQgdHlwZSBJSm9iIGZyb20gXCIuLi9pbnRlcmZhY2VzL2pvYlwiO1xuaW1wb3J0IENvbnRhaW5lciBmcm9tIFwiLi9jb250YWluZXJcIjtcbmltcG9ydCBTdG9yYWdlQ2Fwc3VsZSBmcm9tIFwiLi9zdG9yYWdlLWNhcHN1bGVcIjtcbmltcG9ydCBDb25maWcgZnJvbSBcIi4vY29uZmlnXCI7XG5pbXBvcnQgRXZlbnQgZnJvbSBcIi4vZXZlbnRcIjtcbmltcG9ydCB7XG4gIGNsb25lLFxuICBoYXNNZXRob2QsXG4gIGlzRnVuY3Rpb24sXG4gIGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzLFxuICB1dGlsQ2xlYXJCeVRhZ1xufSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IExvY2FsU3RvcmFnZSBmcm9tIFwiLi9zdG9yYWdlL2xvY2Fsc3RvcmFnZVwiO1xuXG5pbnRlcmZhY2UgSUpvYkluc3RhbmNlIHtcbiAgcHJpb3JpdHk6IG51bWJlcjtcbiAgcmV0cnk6IG51bWJlcjtcbiAgaGFuZGxlKGFyZ3M6IGFueSk6IGFueTtcbiAgYmVmb3JlKGFyZ3M6IGFueSk6IHZvaWQ7XG4gIGFmdGVyKGFyZ3M6IGFueSk6IHZvaWQ7XG59XG5cbmxldCBRdWV1ZSA9ICgoKSA9PiB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIFF1ZXVlLkZJRk8gPSBcImZpZm9cIjtcbiAgUXVldWUuTElGTyA9IFwibGlmb1wiO1xuXG4gIGZ1bmN0aW9uIFF1ZXVlKGNvbmZpZzogSUNvbmZpZykge1xuICAgIF9jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsIGNvbmZpZyk7XG4gIH1cblxuICBmdW5jdGlvbiBfY29uc3RydWN0b3IoY29uZmlnKSB7XG4gICAgdGhpcy5jdXJyZW50Q2hhbm5lbDtcbiAgICB0aGlzLmN1cnJlbnRUaW1lb3V0O1xuICAgIHRoaXMuc3RvcHBlZCA9IHRydWU7XG4gICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgdGhpcy5jaGFubmVscyA9IHt9O1xuICAgIHRoaXMuY29uZmlnID0gbmV3IENvbmZpZyhjb25maWcpO1xuICAgIHRoaXMuc3RvcmFnZSA9IG5ldyBTdG9yYWdlQ2Fwc3VsZShcbiAgICAgIHRoaXMuY29uZmlnLFxuICAgICAgbmV3IExvY2FsU3RvcmFnZSh0aGlzLmNvbmZpZylcbiAgICApO1xuICAgIHRoaXMuZXZlbnQgPSBuZXcgRXZlbnQoKTtcbiAgICB0aGlzLmNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoKTtcbiAgICB0aGlzLnRpbWVvdXQgPSB0aGlzLmNvbmZpZy5nZXQoXCJ0aW1lb3V0XCIpO1xuICB9XG5cbiAgUXVldWUucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKHRhc2spOiBzdHJpbmcgfCBib29sZWFuIHtcbiAgICBpZiAoIWNhbk11bHRpcGxlLmNhbGwodGhpcywgdGFzaykpIHJldHVybiBmYWxzZTtcblxuICAgIGNvbnN0IGlkID0gc2F2ZVRhc2suY2FsbCh0aGlzLCB0YXNrKTtcblxuICAgIGlmIChpZCAmJiB0aGlzLnN0b3BwZWQgJiYgdGhpcy5ydW5uaW5nID09PSB0cnVlKSB7XG4gICAgICB0aGlzLnN0YXJ0KCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGlkO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuc3RvcHBlZCkge1xuICAgICAgY29uc29sZS5sb2coXCJbc3RvcHBlZF0tPiBuZXh0XCIpO1xuICAgICAgc3RhdHVzT2ZmLmNhbGwodGhpcyk7XG4gICAgICByZXR1cm4gc3RvcFF1ZXVlLmNhbGwodGhpcyk7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKFwiW25leHRdLT5cIik7XG4gICAgdGhpcy5zdGFydCgpO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCk6IGJvb2xlYW4ge1xuICAgIC8vIFN0b3AgdGhlIHF1ZXVlIGZvciByZXN0YXJ0XG4gICAgdGhpcy5zdG9wcGVkID0gZmFsc2U7XG5cbiAgICAvLyBSZWdpc3RlciB0YXNrcywgaWYgbm90IHJlZ2lzdGVyZWRcbiAgICByZWdpc3RlckpvYnMuY2FsbCh0aGlzKTtcblxuICAgIC8vIENyZWF0ZSBhIHRpbWVvdXQgZm9yIHN0YXJ0IHF1ZXVlXG4gICAgdGhpcy5ydW5uaW5nID0gY3JlYXRlVGltZW91dC5jYWxsKHRoaXMpID4gMDtcbiAgICBjb25zb2xlLmxvZyhcIltzdGFydGVkXS0+XCIsIHRoaXMucnVubmluZyk7XG4gICAgcmV0dXJuIHRoaXMucnVubmluZztcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKFwiW3N0b3BwaW5nXS0+XCIpO1xuICAgIHRoaXMuc3RvcHBlZCA9IHRydWU7IC8vdGhpcy5ydW5uaW5nO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5mb3JjZVN0b3AgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZyhcIltmb3JjZVN0b3BwZWRdLT5cIik7XG4gICAgc3RvcFF1ZXVlLmNhbGwodGhpcyk7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKGNoYW5uZWw6IHN0cmluZykge1xuICAgIGlmICghKGNoYW5uZWwgaW4gdGhpcy5jaGFubmVscykpIHtcbiAgICAgIHRoaXMuY3VycmVudENoYW5uZWwgPSBjaGFubmVsO1xuICAgICAgdGhpcy5jaGFubmVsc1tjaGFubmVsXSA9IGNsb25lKHRoaXMpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmNoYW5uZWxzW2NoYW5uZWxdO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5jaGFubmVsID0gZnVuY3Rpb24obmFtZTogc3RyaW5nKSB7XG4gICAgaWYgKCF0aGlzLmNoYW5uZWxzW25hbWVdKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENoYW5uZWwgb2YgXCIke25hbWV9XCIgbm90IGZvdW5kYCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuY2hhbm5lbHNbbmFtZV07XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLmlzRW1wdHkgPSBmdW5jdGlvbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jb3VudCgpIDwgMTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuY291bnQgPSBmdW5jdGlvbigpOiBBcnJheTxJVGFzaz4ge1xuICAgIHJldHVybiBnZXRUYXNrc1dpdGhvdXRGcmVlemVkLmNhbGwodGhpcykubGVuZ3RoO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5jb3VudEJ5VGFnID0gZnVuY3Rpb24odGFnOiBzdHJpbmcpOiBBcnJheTxJVGFzaz4ge1xuICAgIHJldHVybiBnZXRUYXNrc1dpdGhvdXRGcmVlemVkLmNhbGwodGhpcykuZmlsdGVyKHQgPT4gdC50YWcgPT09IHRhZykubGVuZ3RoO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCk6IGJvb2xlYW4ge1xuICAgIGlmICghIHRoaXMuY3VycmVudENoYW5uZWwpIHJldHVybiBmYWxzZTtcbiAgICB0aGlzLnN0b3JhZ2UuY2xlYXIodGhpcy5jdXJyZW50Q2hhbm5lbCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLmNsZWFyQnlUYWcgPSBmdW5jdGlvbih0YWc6IHN0cmluZyk6IHZvaWQge1xuICAgIGRiXG4gICAgICAuY2FsbCh0aGlzKVxuICAgICAgLmFsbCgpXG4gICAgICAuZmlsdGVyKHV0aWxDbGVhckJ5VGFnLmJpbmQodGFnKSlcbiAgICAgIC5mb3JFYWNoKHQgPT4gZGIuY2FsbCh0aGlzKS5kZWxldGUodC5faWQpKTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24oaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBnZXRUYXNrc1dpdGhvdXRGcmVlemVkLmNhbGwodGhpcykuZmluZEluZGV4KHQgPT4gdC5faWQgPT09IGlkKSA+IC0xO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5oYXNCeVRhZyA9IGZ1bmN0aW9uKHRhZzogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGdldFRhc2tzV2l0aG91dEZyZWV6ZWQuY2FsbCh0aGlzKS5maW5kSW5kZXgodCA9PiB0LnRhZyA9PT0gdGFnKSA+IC0xO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5zZXRUaW1lb3V0ID0gZnVuY3Rpb24odmFsOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnRpbWVvdXQgPSB2YWw7XG4gICAgdGhpcy5jb25maWcuc2V0KFwidGltZW91dFwiLCB2YWwpO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5zZXRMaW1pdCA9IGZ1bmN0aW9uKHZhbDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5jb25maWcuc2V0KFwibGltaXRcIiwgdmFsKTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuc2V0UHJlZml4ID0gZnVuY3Rpb24odmFsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmNvbmZpZy5zZXQoXCJwcmVmaXhcIiwgdmFsKTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuc2V0UHJpbmNpcGxlID0gZnVuY3Rpb24odmFsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmNvbmZpZy5zZXQoXCJwcmluY2lwbGVcIiwgdmFsKTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUub24gPSBmdW5jdGlvbihrZXk6IHN0cmluZywgY2I6IEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgdGhpcy5ldmVudC5vbiguLi5hcmd1bWVudHMpO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5lcnJvciA9IGZ1bmN0aW9uKGNiOiBGdW5jdGlvbik6IHZvaWQge1xuICAgIHRoaXMuZXZlbnQub24oXCJlcnJvclwiLCBjYik7XG4gIH07XG5cbiAgUXVldWUucmVnaXN0ZXIgPSBmdW5jdGlvbihqb2JzOiBBcnJheTxJSm9iPikge1xuICAgIGlmICghKGpvYnMgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlF1ZXVlIGpvYnMgc2hvdWxkIGJlIG9iamVjdHMgd2l0aGluIGFuIGFycmF5XCIpO1xuICAgIH1cblxuICAgIFF1ZXVlLmlzUmVnaXN0ZXJlZCA9IGZhbHNlO1xuICAgIFF1ZXVlLmpvYnMgPSBqb2JzO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGdldFRhc2tzV2l0aG91dEZyZWV6ZWQoKSB7XG4gICAgcmV0dXJuIGRiXG4gICAgICAuY2FsbCh0aGlzKVxuICAgICAgLmFsbCgpXG4gICAgICAuZmlsdGVyKGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzLmJpbmQoW1wiZnJlZXplZFwiXSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gZGlzcGF0Y2hFdmVudHModGFzazogSVRhc2ssIHR5cGU6IHN0cmluZykge1xuICAgIGlmIChcInRhZ1wiIGluIHRhc2spIHtcbiAgICAgIHRoaXMuZXZlbnQuZW1pdChgJHt0YXNrLnRhZ306JHt0eXBlfWAsIHRhc2spO1xuICAgICAgdGhpcy5ldmVudC5lbWl0KGAke3Rhc2sudGFnfToqYCwgdGFzayk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZGIoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmFnZS5jaGFubmVsKHRoaXMuY3VycmVudENoYW5uZWwpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2F2ZVRhc2sodGFzazogSVRhc2spIHtcbiAgICByZXR1cm4gZGIuY2FsbCh0aGlzKS5zYXZlKHRhc2spO1xuICB9XG5cbiAgZnVuY3Rpb24gc2F2ZVRhc2sodGFzazogSVRhc2spIHtcbiAgICByZXR1cm4gZGIuY2FsbCh0aGlzKS5zYXZlKGNoZWNrUHJpb3JpdHkodGFzaykpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tQcmlvcml0eSh0YXNrOiBJVGFzaykge1xuICAgIHRhc2sucHJpb3JpdHkgPSB0YXNrLnByaW9yaXR5IHx8IDA7XG5cbiAgICBpZiAoaXNOYU4odGFzay5wcmlvcml0eSkpIHRhc2sucHJpb3JpdHkgPSAwO1xuXG4gICAgcmV0dXJuIHRhc2s7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVUaW1lb3V0KCk6IG51bWJlciB7XG4gICAgY29uc3QgdGltZW91dCA9IHRoaXMuY29uZmlnLmdldChcInRpbWVvdXRcIik7XG4gICAgcmV0dXJuICh0aGlzLmN1cnJlbnRUaW1lb3V0ID0gc2V0VGltZW91dChsb29wSGFuZGxlci5iaW5kKHRoaXMpLCB0aW1lb3V0KSk7XG4gIH1cblxuICBmdW5jdGlvbiBsb2NrVGFzayh0YXNrKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGRiLmNhbGwodGhpcykudXBkYXRlKHRhc2suX2lkLCB7IGxvY2tlZDogdHJ1ZSB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZVRhc2soaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBkYi5jYWxsKHRoaXMpLmRlbGV0ZShpZCk7XG4gIH1cblxuICBmdW5jdGlvbiBsb29wSGFuZGxlcigpOiB2b2lkIHtcbiAgICBjb25zdCBzZWxmOiBRdWV1ZSA9IHRoaXM7XG4gICAgY29uc3QgdGFzazogSVRhc2sgPSBkYlxuICAgICAgLmNhbGwoc2VsZilcbiAgICAgIC5mZXRjaCgpXG4gICAgICAuc2hpZnQoKTtcblxuICAgIGlmICh0YXNrID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnNvbGUubG9nKGAtPiAke3RoaXMuY3VycmVudENoYW5uZWx9IGNoYW5uZWwgaXMgZW1wdHkuLi5gKTtcbiAgICAgIHN0b3BRdWV1ZS5jYWxsKHRoaXMpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghc2VsZi5jb250YWluZXIuaGFzKHRhc2suaGFuZGxlcikpIHtcbiAgICAgIGNvbnNvbGUud2Fybih0YXNrLmhhbmRsZXIgKyBcIi0+IGpvYiBub3QgZm91bmRcIik7XG4gICAgfVxuXG4gICAgY29uc3Qgam9iOiBJSm9iID0gc2VsZi5jb250YWluZXIuZ2V0KHRhc2suaGFuZGxlcik7XG4gICAgY29uc3Qgam9iSW5zdGFuY2U6IElKb2JJbnN0YW5jZSA9IG5ldyBqb2IuaGFuZGxlcigpO1xuXG4gICAgLy8gbG9jayB0aGUgY3VycmVudCB0YXNrIGZvciBwcmV2ZW50IHJhY2UgY29uZGl0aW9uXG4gICAgbG9ja1Rhc2suY2FsbChzZWxmLCB0YXNrKTtcblxuICAgIC8vIGZpcmUgam9iIGJlZm9yZSBldmVudFxuICAgIGZpcmVKb2JJbmxpbmVFdmVudC5jYWxsKHRoaXMsIFwiYmVmb3JlXCIsIGpvYkluc3RhbmNlLCB0YXNrLmFyZ3MpO1xuXG4gICAgLy8gZGlzcGFjdGggY3VzdG9tIGJlZm9yZSBldmVudFxuICAgIGRpc3BhdGNoRXZlbnRzLmNhbGwodGhpcywgdGFzaywgXCJiZWZvcmVcIik7XG5cbiAgICAvLyBwcmVwYXJpbmcgd29ya2VyIGRlcGVuZGVuY2llc1xuICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9IE9iamVjdC52YWx1ZXMoam9iLmRlcHMgfHwge30pO1xuXG4gICAgLy8gVGFzayBydW5uZXIgcHJvbWlzZVxuICAgIGpvYkluc3RhbmNlLmhhbmRsZVxuICAgICAgLmNhbGwoam9iSW5zdGFuY2UsIHRhc2suYXJncywgLi4uZGVwZW5kZW5jaWVzKVxuICAgICAgLnRoZW4oam9iUmVzcG9uc2UuY2FsbChzZWxmLCB0YXNrLCBqb2JJbnN0YW5jZSkuYmluZChzZWxmKSlcbiAgICAgIC5jYXRjaChqb2JGYWlsZWRSZXNwb25zZS5jYWxsKHNlbGYsIHRhc2ssIGpvYkluc3RhbmNlKS5iaW5kKHNlbGYpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGpvYlJlc3BvbnNlKHRhc2s6IElUYXNrLCBqb2I6IElKb2JJbnN0YW5jZSk6IEZ1bmN0aW9uIHtcbiAgICBjb25zdCBzZWxmOiBRdWV1ZSA9IHRoaXM7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHJlc3VsdDogYm9vbGVhbikge1xuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICBzdWNjZXNzUHJvY2Vzcy5jYWxsKHNlbGYsIHRhc2ssIGpvYik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXRyeVByb2Nlc3MuY2FsbChzZWxmLCB0YXNrLCBqb2IpO1xuICAgICAgfVxuXG4gICAgICAvLyBmaXJlIGpvYiBhZnRlciBldmVudFxuICAgICAgZmlyZUpvYklubGluZUV2ZW50LmNhbGwodGhpcywgXCJhZnRlclwiLCBqb2IsIHRhc2suYXJncyk7XG5cbiAgICAgIC8vIGRpc3BhY3RoIGN1c3RvbSBhZnRlciBldmVudFxuICAgICAgZGlzcGF0Y2hFdmVudHMuY2FsbCh0aGlzLCB0YXNrLCBcImFmdGVyXCIpO1xuXG4gICAgICAvLyB0cnkgbmV4dCBxdWV1ZSBqb2JcbiAgICAgIHNlbGYubmV4dCgpO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBqb2JGYWlsZWRSZXNwb25zZSh0YXNrOiBJVGFzaywgam9iOiBJSm9iSW5zdGFuY2UpOiBGdW5jdGlvbiB7XG4gICAgcmV0dXJuIChyZXN1bHQ6IGJvb2xlYW4pID0+IHtcbiAgICAgIHJlbW92ZVRhc2suY2FsbCh0aGlzLCB0YXNrLl9pZCk7XG5cbiAgICAgIHRoaXMuZXZlbnQuZW1pdChcImVycm9yXCIsIHRhc2spO1xuXG4gICAgICB0aGlzLm5leHQoKTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gZmlyZUpvYklubGluZUV2ZW50KFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBqb2I6IElKb2JJbnN0YW5jZSxcbiAgICBhcmdzOiBhbnlcbiAgKTogdm9pZCB7XG4gICAgaWYgKCFoYXNNZXRob2Qoam9iLCBuYW1lKSkgcmV0dXJuO1xuXG4gICAgaWYgKG5hbWUgPT0gXCJiZWZvcmVcIiAmJiBpc0Z1bmN0aW9uKGpvYi5iZWZvcmUpKSB7XG4gICAgICBqb2IuYmVmb3JlLmNhbGwoam9iLCBhcmdzKTtcbiAgICB9IGVsc2UgaWYgKG5hbWUgPT0gXCJhZnRlclwiICYmIGlzRnVuY3Rpb24oam9iLmFmdGVyKSkge1xuICAgICAgam9iLmFmdGVyLmNhbGwoam9iLCBhcmdzKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzdGF0dXNPZmYoKTogdm9pZCB7XG4gICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBzdG9wUXVldWUoKTogdm9pZCB7XG4gICAgdGhpcy5zdG9wKCk7XG5cbiAgICBpZiAodGhpcy5jdXJyZW50VGltZW91dCkge1xuICAgICAgLy8gdW5zZXQgY3VycmVudCB0aW1lb3V0IHZhbHVlXG4gICAgICB0aGlzLmN1cnJlbnRUaW1lb3V0ID0gY2xlYXJUaW1lb3V0KHRoaXMuY3VycmVudFRpbWVvdXQpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHN1Y2Nlc3NQcm9jZXNzKHRhc2s6IElUYXNrLCBqb2I6IElKb2JJbnN0YW5jZSk6IHZvaWQge1xuICAgIHJlbW92ZVRhc2suY2FsbCh0aGlzLCB0YXNrLl9pZCk7XG4gIH1cblxuICBmdW5jdGlvbiByZXRyeVByb2Nlc3ModGFzazogSVRhc2ssIGpvYjogSUpvYkluc3RhbmNlKTogYm9vbGVhbiB7XG4gICAgLy8gZGlzcGFjdGggY3VzdG9tIHJldHJ5IGV2ZW50XG4gICAgZGlzcGF0Y2hFdmVudHMuY2FsbCh0aGlzLCB0YXNrLCBcInJldHJ5XCIpO1xuXG4gICAgLy8gdXBkYXRlIHJldHJ5IHZhbHVlXG4gICAgbGV0IHVwZGF0ZVRhc2s6IElUYXNrID0gdXBkYXRlUmV0cnkuY2FsbCh0aGlzLCB0YXNrLCBqb2IpO1xuXG4gICAgLy8gZGVsZXRlIGxvY2sgcHJvcGVydHkgZm9yIG5leHQgcHJvY2Vzc1xuICAgIHVwZGF0ZVRhc2subG9ja2VkID0gZmFsc2U7XG5cbiAgICByZXR1cm4gZGIuY2FsbCh0aGlzKS51cGRhdGUodGFzay5faWQsIHVwZGF0ZVRhc2spO1xuICB9XG5cbiAgZnVuY3Rpb24gY2FuTXVsdGlwbGUodGFzazogSVRhc2spOiBib29sZWFuIHtcbiAgICBpZiAodHlwZW9mIHRhc2sgIT09IFwib2JqZWN0XCIgfHwgdGFzay51bmlxdWUgIT09IHRydWUpIHJldHVybiB0cnVlO1xuXG4gICAgcmV0dXJuIHRoaXMuaGFzQnlUYWcodGFzay50YWcpIDwgMTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZVJldHJ5KHRhc2s6IElUYXNrLCBqb2I6IElKb2JJbnN0YW5jZSk6IElUYXNrIHtcbiAgICBpZiAoIShcInJldHJ5XCIgaW4gam9iKSkgam9iLnJldHJ5ID0gMTtcblxuICAgIGlmICghKFwidHJpZWRcIiBpbiB0YXNrKSkge1xuICAgICAgdGFzay50cmllZCA9IDA7XG4gICAgICB0YXNrLnJldHJ5ID0gam9iLnJldHJ5O1xuICAgIH1cblxuICAgICsrdGFzay50cmllZDtcblxuICAgIGlmICh0YXNrLnRyaWVkID49IGpvYi5yZXRyeSkge1xuICAgICAgdGFzay5mcmVlemVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGFzaztcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlZ2lzdGVySm9icygpOiB2b2lkIHtcbiAgICBpZiAoUXVldWUuaXNSZWdpc3RlcmVkKSByZXR1cm47XG5cbiAgICBjb25zdCBqb2JzID0gUXVldWUuam9icyB8fCBbXTtcblxuICAgIGZvciAoY29uc3Qgam9iIG9mIGpvYnMpIHtcbiAgICAgIGNvbnN0IGZ1bmNTdHIgPSBqb2IuaGFuZGxlci50b1N0cmluZygpO1xuICAgICAgY29uc3QgW3N0ckZ1bmN0aW9uLCBuYW1lXSA9IGZ1bmNTdHIubWF0Y2goL2Z1bmN0aW9uXFxzKFthLXpBLVpfXSspLio/Lyk7XG4gICAgICBpZiAobmFtZSkgdGhpcy5jb250YWluZXIuYmluZChuYW1lLCBqb2IpO1xuICAgIH1cblxuICAgIFF1ZXVlLmlzUmVnaXN0ZXJlZCA9IHRydWU7XG4gIH1cblxuICByZXR1cm4gUXVldWU7XG59KSgpO1xuXG5leHBvcnQgZGVmYXVsdCBRdWV1ZTtcbiIsIi8qIEBmbG93ICovXG5cbmltcG9ydCBncm91cEJ5IGZyb20gXCJncm91cC1ieVwiO1xuaW1wb3J0IExvY2FsU3RvcmFnZSBmcm9tIFwiLi9zdG9yYWdlL2xvY2Fsc3RvcmFnZVwiO1xuaW1wb3J0IHR5cGUgSUNvbmZpZyBmcm9tIFwiLi4vaW50ZXJmYWNlcy9jb25maWdcIjtcbmltcG9ydCB0eXBlIElTdG9yYWdlIGZyb20gXCIuLi9pbnRlcmZhY2VzL3N0b3JhZ2VcIjtcbmltcG9ydCB0eXBlIElUYXNrIGZyb20gXCIuLi9pbnRlcmZhY2VzL3Rhc2tcIjtcbmltcG9ydCBDb25maWcgZnJvbSBcIi4vY29uZmlnXCI7XG5pbXBvcnQgeyBleGNsdWRlU3BlY2lmaWNUYXNrcywgbGlmbywgZmlmbyB9IGZyb20gXCIuL3V0aWxzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0b3JhZ2VDYXBzdWxlIHtcbiAgY29uZmlnOiBJQ29uZmlnO1xuICBzdG9yYWdlOiBJU3RvcmFnZTtcbiAgc3RvcmFnZUNoYW5uZWw6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcihjb25maWc6IElDb25maWcsIHN0b3JhZ2U6IElTdG9yYWdlKSB7XG4gICAgdGhpcy5zdG9yYWdlID0gc3RvcmFnZTtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgfVxuXG4gIGNoYW5uZWwobmFtZTogc3RyaW5nKTogU3RvcmFnZUNhcHN1bGUge1xuICAgIHRoaXMuc3RvcmFnZUNoYW5uZWwgPSBuYW1lO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZmV0Y2goKTogQXJyYXk8YW55PiB7XG4gICAgY29uc3QgYWxsID0gdGhpcy5hbGwoKS5maWx0ZXIoZXhjbHVkZVNwZWNpZmljVGFza3MpO1xuICAgIGNvbnN0IHRhc2tzID0gZ3JvdXBCeShhbGwsIFwicHJpb3JpdHlcIik7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRhc2tzKVxuICAgICAgLm1hcChrZXkgPT4gcGFyc2VJbnQoa2V5KSlcbiAgICAgIC5zb3J0KChhLCBiKSA9PiBiIC0gYSlcbiAgICAgIC5yZWR1Y2UodGhpcy5yZWR1Y2VUYXNrcyh0YXNrcyksIFtdKTtcbiAgfVxuXG4gIHNhdmUodGFzazogSVRhc2spOiBzdHJpbmcgfCBib29sZWFuIHtcbiAgICAvLyBnZXQgYWxsIHRhc2tzIGN1cnJlbnQgY2hhbm5lbCdzXG4gICAgY29uc3QgdGFza3M6IElUYXNrW10gPSB0aGlzLnN0b3JhZ2UuZ2V0KHRoaXMuc3RvcmFnZUNoYW5uZWwpO1xuXG4gICAgLy8gY2hlY2sgY2hhbm5lbCBsaW1pdC5cbiAgICAvLyBpZiBsaW1pdCBpcyBleGNlZWRlZCwgZG9lcyBub3QgaW5zZXJ0IG5ldyB0YXNrXG4gICAgaWYgKHRoaXMuaXNFeGNlZWRlZCgpKSB7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIGBUYXNrIGxpbWl0IGV4Y2VlZGVkOiBUaGUgJyR7XG4gICAgICAgICAgdGhpcy5zdG9yYWdlQ2hhbm5lbFxuICAgICAgICB9JyBjaGFubmVsIGxpbWl0IGlzICR7dGhpcy5jb25maWcuZ2V0KFwibGltaXRcIil9YFxuICAgICAgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBwcmVwYXJlIGFsbCBwcm9wZXJ0aWVzIGJlZm9yZSBzYXZlXG4gICAgLy8gZXhhbXBsZTogY3JlYXRlZEF0IGV0Yy5cbiAgICB0YXNrID0gdGhpcy5wcmVwYXJlVGFzayh0YXNrKTtcblxuICAgIC8vIGFkZCB0YXNrIHRvIHN0b3JhZ2VcbiAgICB0YXNrcy5wdXNoKHRhc2spO1xuXG4gICAgLy8gc2F2ZSB0YXNrc1xuICAgIHRoaXMuc3RvcmFnZS5zZXQodGhpcy5zdG9yYWdlQ2hhbm5lbCwgSlNPTi5zdHJpbmdpZnkodGFza3MpKTtcblxuICAgIHJldHVybiB0YXNrLl9pZDtcbiAgfVxuXG4gIHVwZGF0ZShpZDogc3RyaW5nLCB1cGRhdGU6IHsgW3Byb3BlcnR5OiBzdHJpbmddOiBhbnkgfSk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGRhdGE6IGFueVtdID0gdGhpcy5hbGwoKTtcbiAgICBjb25zdCBpbmRleDogbnVtYmVyID0gZGF0YS5maW5kSW5kZXgodCA9PiB0Ll9pZCA9PSBpZCk7XG5cbiAgICBpZiAoaW5kZXggPCAwKSByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBtZXJnZSBleGlzdGluZyBvYmplY3Qgd2l0aCBnaXZlbiB1cGRhdGUgb2JqZWN0XG4gICAgZGF0YVtpbmRleF0gPSBPYmplY3QuYXNzaWduKHt9LCBkYXRhW2luZGV4XSwgdXBkYXRlKTtcblxuICAgIC8vIHNhdmUgdG8gdGhlIHN0b3JhZ2UgYXMgc3RyaW5nXG4gICAgdGhpcy5zdG9yYWdlLnNldCh0aGlzLnN0b3JhZ2VDaGFubmVsLCBKU09OLnN0cmluZ2lmeShkYXRhKSk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGRlbGV0ZShpZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3QgZGF0YTogYW55W10gPSB0aGlzLmFsbCgpO1xuICAgIGNvbnN0IGluZGV4OiBudW1iZXIgPSBkYXRhLmZpbmRJbmRleChkID0+IGQuX2lkID09PSBpZCk7XG5cbiAgICBpZiAoaW5kZXggPCAwKSByZXR1cm4gZmFsc2U7XG5cbiAgICBkZWxldGUgZGF0YVtpbmRleF07XG5cbiAgICB0aGlzLnN0b3JhZ2Uuc2V0KFxuICAgICAgdGhpcy5zdG9yYWdlQ2hhbm5lbCxcbiAgICAgIEpTT04uc3RyaW5naWZ5KGRhdGEuZmlsdGVyKGQgPT4gZCkpXG4gICAgKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGFsbCgpOiBBcnJheTxhbnk+IHtcbiAgICByZXR1cm4gdGhpcy5zdG9yYWdlLmdldCh0aGlzLnN0b3JhZ2VDaGFubmVsKTtcbiAgfVxuXG4gIGdlbmVyYXRlSWQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gKCgxICsgTWF0aC5yYW5kb20oKSkgKiAweDEwMDAwKS50b1N0cmluZygxNik7XG4gIH1cblxuICBwcmVwYXJlVGFzayh0YXNrOiBJVGFzayk6IElUYXNrIHtcbiAgICB0YXNrLmNyZWF0ZWRBdCA9IERhdGUubm93KCk7XG4gICAgdGFzay5faWQgPSB0aGlzLmdlbmVyYXRlSWQoKTtcbiAgICByZXR1cm4gdGFzaztcbiAgfVxuXG4gIHJlZHVjZVRhc2tzKHRhc2tzOiBJVGFza1tdKSB7XG4gICAgY29uc3QgcmVkdWNlRnVuYyA9IChyZXN1bHQ6IElUYXNrW10sIGtleTogYW55KSA9PiB7XG4gICAgICBpZiAodGhpcy5jb25maWcuZ2V0KFwicHJpbmNpcGxlXCIpID09PSBcImxpZm9cIikge1xuICAgICAgICByZXR1cm4gcmVzdWx0LmNvbmNhdCh0YXNrc1trZXldLnNvcnQobGlmbykpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5jb25jYXQodGFza3Nba2V5XS5zb3J0KGZpZm8pKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIHJlZHVjZUZ1bmMuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGlzRXhjZWVkZWQoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgbGltaXQ6IG51bWJlciA9IHRoaXMuY29uZmlnLmdldChcImxpbWl0XCIpO1xuICAgIGNvbnN0IHRhc2tzOiBJVGFza1tdID0gdGhpcy5hbGwoKS5maWx0ZXIoZXhjbHVkZVNwZWNpZmljVGFza3MpO1xuICAgIHJldHVybiAhKGxpbWl0ID09PSAtMSB8fCBsaW1pdCA+IHRhc2tzLmxlbmd0aCk7XG4gIH1cblxuICBjbGVhcihjaGFubmVsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnN0b3JhZ2UuY2xlYXIoY2hhbm5lbCk7XG4gIH1cbn1cbiIsIi8qIEBmbG93ICovXG5cbmltcG9ydCB0eXBlIElTdG9yYWdlIGZyb20gJy4uLy4uL2ludGVyZmFjZXMvc3RvcmFnZSc7XG5pbXBvcnQgdHlwZSBJQ29uZmlnIGZyb20gJy4uLy4uL2ludGVyZmFjZXMvc3RvcmFnZSc7XG5pbXBvcnQgdHlwZSBJSm9iIGZyb20gJy4uLy4uL2ludGVyZmFjZXMvam9iJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9jYWxTdG9yYWdlIGltcGxlbWVudHMgSVN0b3JhZ2Uge1xuICBzdG9yYWdlOiBPYmplY3Q7XG4gIGNvbmZpZzogSUNvbmZpZztcblxuICBjb25zdHJ1Y3Rvcihjb25maWc6IElDb25maWcpIHtcbiAgICB0aGlzLnN0b3JhZ2UgPSBsb2NhbFN0b3JhZ2U7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gIH1cblxuICBnZXQoa2V5OiBzdHJpbmcpOiBBcnJheTxJSm9ifFtdPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG5hbWUgPSB0aGlzLnN0b3JhZ2VOYW1lKGtleSk7XG4gICAgICByZXR1cm4gdGhpcy5oYXMobmFtZSkgPyBKU09OLnBhcnNlKHRoaXMuc3RvcmFnZS5nZXRJdGVtKG5hbWUpKSA6IFtdO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfVxuXG4gIHNldChrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmFnZS5zZXRJdGVtKHRoaXMuc3RvcmFnZU5hbWUoa2V5KSwgdmFsdWUpO1xuICB9XG5cbiAgaGFzKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGtleSBpbiB0aGlzLnN0b3JhZ2U7XG4gIH1cblxuICBjbGVhcihrZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmFnZS5yZW1vdmVJdGVtKHRoaXMuc3RvcmFnZU5hbWUoa2V5KSk7XG4gIH1cblxuICBjbGVhckFsbCgpOiB2b2lkIHtcbiAgICB0aGlzLnN0b3JhZ2UuY2xlYXIoKTtcbiAgfVxuXG4gIHN0b3JhZ2VOYW1lKHN1ZmZpeDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIGAke3RoaXMuZ2V0UHJlZml4KCl9XyR7c3VmZml4fWA7XG4gIH1cblxuICBnZXRQcmVmaXgoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnLmdldCgncHJlZml4Jyk7XG4gIH1cbn1cbiIsIi8qIEBmbG93ICovXG5pbXBvcnQgdHlwZSBJVGFzayBmcm9tICcuLi9pbnRlcmZhY2VzL3Rhc2snO1xuXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUob2JqOiBPYmplY3QpIHtcbiAgdmFyIG5ld0NsYXNzID0gT2JqZWN0LmNyZWF0ZShcbiAgICBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKSxcbiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvYmopLnJlZHVjZSgocHJvcHMsIG5hbWUpID0+IHtcbiAgICAgIHByb3BzW25hbWVdID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmosIG5hbWUpO1xuICAgICAgcmV0dXJuIHByb3BzO1xuICAgIH0sIHt9KVxuICApO1xuXG4gIGlmICghIE9iamVjdC5pc0V4dGVuc2libGUob2JqKSkge1xuICAgIE9iamVjdC5wcmV2ZW50RXh0ZW5zaW9ucyhuZXdDbGFzcyk7XG4gIH1cbiAgaWYgKE9iamVjdC5pc1NlYWxlZChvYmopKSB7XG4gICAgT2JqZWN0LnNlYWwobmV3Q2xhc3MpO1xuICB9XG4gIGlmIChPYmplY3QuaXNGcm96ZW4ob2JqKSkge1xuICAgIE9iamVjdC5mcmVlemUobmV3Q2xhc3MpO1xuICB9XG5cbiAgcmV0dXJuIG5ld0NsYXNzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzUHJvcGVydHkob2JqOiBGdW5jdGlvbiwgbmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBuYW1lKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc01ldGhvZChpbnN0YW5jZTogYW55LCBtZXRob2Q6IHN0cmluZykge1xuICByZXR1cm4gaW5zdGFuY2UgaW5zdGFuY2VvZiBPYmplY3QgJiYgKG1ldGhvZCBpbiBpbnN0YW5jZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Z1bmN0aW9uKGZ1bmM6IEZ1bmN0aW9uKSB7XG4gIHJldHVybiBmdW5jIGluc3RhbmNlb2YgRnVuY3Rpb247XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleGNsdWRlU3BlY2lmaWNUYXNrcyh0YXNrOiBJVGFzaykge1xuICBjb25zdCBjb25kaXRpb25zID0gQXJyYXkuaXNBcnJheSh0aGlzKSA/IHRoaXMgOiBbJ2ZyZWV6ZWQnLCAnbG9ja2VkJ107XG4gIGNvbnN0IHJlc3VsdHMgPSBbXTtcblxuICBmb3IgKGNvbnN0IGMgb2YgY29uZGl0aW9ucykge1xuICAgIHJlc3VsdHMucHVzaChoYXNQcm9wZXJ0eSh0YXNrLCBjKSA9PT0gZmFsc2UgfHwgdGFza1tjXSA9PT0gZmFsc2UpO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdHMuaW5kZXhPZihmYWxzZSkgPiAtMSA/IGZhbHNlIDogdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHV0aWxDbGVhckJ5VGFnKHRhc2s6IElUYXNrKTogYm9vbGVhbiB7XG4gIGlmICghIGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzLmNhbGwoWydsb2NrZWQnXSwgdGFzaykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRhc2sudGFnID09PSB0aGlzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmlmbyhhOiBJVGFzaywgYjogSVRhc2spIHtcbiAgcmV0dXJuIGEuY3JlYXRlZEF0IC0gYi5jcmVhdGVkQXQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaWZvKGE6IElUYXNrLCBiOiBJVGFzaykge1xuICByZXR1cm4gYi5jcmVhdGVkQXQgLSBhLmNyZWF0ZWRBdDtcbn1cbiJdfQ==
