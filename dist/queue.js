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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY29tcG9uZW50LXByb3BzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2dyb3VwLWJ5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3RvLWZ1bmN0aW9uL2luZGV4LmpzIiwic3JjL2NvbmZpZy5kYXRhLmpzIiwic3JjL2NvbmZpZy5qcyIsInNyYy9jb250YWluZXIuanMiLCJzcmMvZXZlbnQuanMiLCJzcmMvaW5kZXguanMiLCJzcmMvcXVldWUuanMiLCJzcmMvc3RvcmFnZS1jYXBzdWxlLmpzIiwic3JjL3N0b3JhZ2UvbG9jYWxzdG9yYWdlLmpzIiwic3JjL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7V0N4SmUsQUFDSixBQUNUO1VBRmEsQUFFTCxBQUNSO1dBSGEsQUFHSixBQUNUO1NBQU8sQ0FKTSxBQUlMLEFBQ1IsQ0FMYSxBQUNiO2EsQUFE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IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBHbG9iYWwgTmFtZXNcbiAqL1xuXG52YXIgZ2xvYmFscyA9IC9cXGIoQXJyYXl8RGF0ZXxPYmplY3R8TWF0aHxKU09OKVxcYi9nO1xuXG4vKipcbiAqIFJldHVybiBpbW1lZGlhdGUgaWRlbnRpZmllcnMgcGFyc2VkIGZyb20gYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtTdHJpbmd8RnVuY3Rpb259IG1hcCBmdW5jdGlvbiBvciBwcmVmaXhcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHN0ciwgZm4pe1xuICB2YXIgcCA9IHVuaXF1ZShwcm9wcyhzdHIpKTtcbiAgaWYgKGZuICYmICdzdHJpbmcnID09IHR5cGVvZiBmbikgZm4gPSBwcmVmaXhlZChmbik7XG4gIGlmIChmbikgcmV0dXJuIG1hcChzdHIsIHAsIGZuKTtcbiAgcmV0dXJuIHA7XG59O1xuXG4vKipcbiAqIFJldHVybiBpbW1lZGlhdGUgaWRlbnRpZmllcnMgaW4gYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwcm9wcyhzdHIpIHtcbiAgcmV0dXJuIHN0clxuICAgIC5yZXBsYWNlKC9cXC5cXHcrfFxcdysgKlxcKHxcIlteXCJdKlwifCdbXiddKid8XFwvKFteL10rKVxcLy9nLCAnJylcbiAgICAucmVwbGFjZShnbG9iYWxzLCAnJylcbiAgICAubWF0Y2goL1thLXpBLVpfXVxcdyovZylcbiAgICB8fCBbXTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gYHN0cmAgd2l0aCBgcHJvcHNgIG1hcHBlZCB3aXRoIGBmbmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtBcnJheX0gcHJvcHNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBtYXAoc3RyLCBwcm9wcywgZm4pIHtcbiAgdmFyIHJlID0gL1xcLlxcdyt8XFx3KyAqXFwofFwiW15cIl0qXCJ8J1teJ10qJ3xcXC8oW14vXSspXFwvfFthLXpBLVpfXVxcdyovZztcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKHJlLCBmdW5jdGlvbihfKXtcbiAgICBpZiAoJygnID09IF9bXy5sZW5ndGggLSAxXSkgcmV0dXJuIGZuKF8pO1xuICAgIGlmICghfnByb3BzLmluZGV4T2YoXykpIHJldHVybiBfO1xuICAgIHJldHVybiBmbihfKTtcbiAgfSk7XG59XG5cbi8qKlxuICogUmV0dXJuIHVuaXF1ZSBhcnJheS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gdW5pcXVlKGFycikge1xuICB2YXIgcmV0ID0gW107XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAofnJldC5pbmRleE9mKGFycltpXSkpIGNvbnRpbnVlO1xuICAgIHJldC5wdXNoKGFycltpXSk7XG4gIH1cblxuICByZXR1cm4gcmV0O1xufVxuXG4vKipcbiAqIE1hcCB3aXRoIHByZWZpeCBgc3RyYC5cbiAqL1xuXG5mdW5jdGlvbiBwcmVmaXhlZChzdHIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKF8pe1xuICAgIHJldHVybiBzdHIgKyBfO1xuICB9O1xufVxuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIHRvRnVuY3Rpb24gPSByZXF1aXJlKCd0by1mdW5jdGlvbicpO1xuXG4vKipcbiAqIEdyb3VwIGBhcnJgIHdpdGggY2FsbGJhY2sgYGZuKHZhbCwgaSlgLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFyclxuICogQHBhcmFtIHtGdW5jdGlvbnxTdHJpbmd9IGZuIG9yIHByb3BcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFyciwgZm4pe1xuICB2YXIgcmV0ID0ge307XG4gIHZhciBwcm9wO1xuICBmbiA9IHRvRnVuY3Rpb24oZm4pO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgKytpKSB7XG4gICAgcHJvcCA9IGZuKGFycltpXSwgaSk7XG4gICAgcmV0W3Byb3BdID0gcmV0W3Byb3BdIHx8IFtdO1xuICAgIHJldFtwcm9wXS5wdXNoKGFycltpXSk7XG4gIH1cblxuICByZXR1cm4gcmV0O1xufTsiLCJcbi8qKlxuICogTW9kdWxlIERlcGVuZGVuY2llc1xuICovXG5cbnZhciBleHByO1xudHJ5IHtcbiAgZXhwciA9IHJlcXVpcmUoJ3Byb3BzJyk7XG59IGNhdGNoKGUpIHtcbiAgZXhwciA9IHJlcXVpcmUoJ2NvbXBvbmVudC1wcm9wcycpO1xufVxuXG4vKipcbiAqIEV4cG9zZSBgdG9GdW5jdGlvbigpYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRvRnVuY3Rpb247XG5cbi8qKlxuICogQ29udmVydCBgb2JqYCB0byBhIGBGdW5jdGlvbmAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gb2JqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHRvRnVuY3Rpb24ob2JqKSB7XG4gIHN3aXRjaCAoe30udG9TdHJpbmcuY2FsbChvYmopKSB7XG4gICAgY2FzZSAnW29iamVjdCBPYmplY3RdJzpcbiAgICAgIHJldHVybiBvYmplY3RUb0Z1bmN0aW9uKG9iaik7XG4gICAgY2FzZSAnW29iamVjdCBGdW5jdGlvbl0nOlxuICAgICAgcmV0dXJuIG9iajtcbiAgICBjYXNlICdbb2JqZWN0IFN0cmluZ10nOlxuICAgICAgcmV0dXJuIHN0cmluZ1RvRnVuY3Rpb24ob2JqKTtcbiAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOlxuICAgICAgcmV0dXJuIHJlZ2V4cFRvRnVuY3Rpb24ob2JqKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGRlZmF1bHRUb0Z1bmN0aW9uKG9iaik7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWZhdWx0IHRvIHN0cmljdCBlcXVhbGl0eS5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZGVmYXVsdFRvRnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiBmdW5jdGlvbihvYmope1xuICAgIHJldHVybiB2YWwgPT09IG9iajtcbiAgfTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGByZWAgdG8gYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1JlZ0V4cH0gcmVcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcmVnZXhwVG9GdW5jdGlvbihyZSkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqKXtcbiAgICByZXR1cm4gcmUudGVzdChvYmopO1xuICB9O1xufVxuXG4vKipcbiAqIENvbnZlcnQgcHJvcGVydHkgYHN0cmAgdG8gYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHN0cmluZ1RvRnVuY3Rpb24oc3RyKSB7XG4gIC8vIGltbWVkaWF0ZSBzdWNoIGFzIFwiPiAyMFwiXG4gIGlmICgvXiAqXFxXKy8udGVzdChzdHIpKSByZXR1cm4gbmV3IEZ1bmN0aW9uKCdfJywgJ3JldHVybiBfICcgKyBzdHIpO1xuXG4gIC8vIHByb3BlcnRpZXMgc3VjaCBhcyBcIm5hbWUuZmlyc3RcIiBvciBcImFnZSA+IDE4XCIgb3IgXCJhZ2UgPiAxOCAmJiBhZ2UgPCAzNlwiXG4gIHJldHVybiBuZXcgRnVuY3Rpb24oJ18nLCAncmV0dXJuICcgKyBnZXQoc3RyKSk7XG59XG5cbi8qKlxuICogQ29udmVydCBgb2JqZWN0YCB0byBhIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3RcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gb2JqZWN0VG9GdW5jdGlvbihvYmopIHtcbiAgdmFyIG1hdGNoID0ge307XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBtYXRjaFtrZXldID0gdHlwZW9mIG9ialtrZXldID09PSAnc3RyaW5nJ1xuICAgICAgPyBkZWZhdWx0VG9GdW5jdGlvbihvYmpba2V5XSlcbiAgICAgIDogdG9GdW5jdGlvbihvYmpba2V5XSk7XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbCl7XG4gICAgaWYgKHR5cGVvZiB2YWwgIT09ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG4gICAgZm9yICh2YXIga2V5IGluIG1hdGNoKSB7XG4gICAgICBpZiAoIShrZXkgaW4gdmFsKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgaWYgKCFtYXRjaFtrZXldKHZhbFtrZXldKSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbn1cblxuLyoqXG4gKiBCdWlsdCB0aGUgZ2V0dGVyIGZ1bmN0aW9uLiBTdXBwb3J0cyBnZXR0ZXIgc3R5bGUgZnVuY3Rpb25zXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZ2V0KHN0cikge1xuICB2YXIgcHJvcHMgPSBleHByKHN0cik7XG4gIGlmICghcHJvcHMubGVuZ3RoKSByZXR1cm4gJ18uJyArIHN0cjtcblxuICB2YXIgdmFsLCBpLCBwcm9wO1xuICBmb3IgKGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICBwcm9wID0gcHJvcHNbaV07XG4gICAgdmFsID0gJ18uJyArIHByb3A7XG4gICAgdmFsID0gXCIoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgXCIgKyB2YWwgKyBcIiA/IFwiICsgdmFsICsgXCIoKSA6IFwiICsgdmFsICsgXCIpXCI7XG5cbiAgICAvLyBtaW1pYyBuZWdhdGl2ZSBsb29rYmVoaW5kIHRvIGF2b2lkIHByb2JsZW1zIHdpdGggbmVzdGVkIHByb3BlcnRpZXNcbiAgICBzdHIgPSBzdHJpcE5lc3RlZChwcm9wLCBzdHIsIHZhbCk7XG4gIH1cblxuICByZXR1cm4gc3RyO1xufVxuXG4vKipcbiAqIE1pbWljIG5lZ2F0aXZlIGxvb2tiZWhpbmQgdG8gYXZvaWQgcHJvYmxlbXMgd2l0aCBuZXN0ZWQgcHJvcGVydGllcy5cbiAqXG4gKiBTZWU6IGh0dHA6Ly9ibG9nLnN0ZXZlbmxldml0aGFuLmNvbS9hcmNoaXZlcy9taW1pYy1sb29rYmVoaW5kLWphdmFzY3JpcHRcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc3RyaXBOZXN0ZWQgKHByb3AsIHN0ciwgdmFsKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZShuZXcgUmVnRXhwKCcoXFxcXC4pPycgKyBwcm9wLCAnZycpLCBmdW5jdGlvbigkMCwgJDEpIHtcbiAgICByZXR1cm4gJDEgPyAkMCA6IHZhbDtcbiAgfSk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCB7XG4gIHN0b3JhZ2U6ICdsb2NhbHN0b3JhZ2UnLFxuICBwcmVmaXg6ICdzcV9qb2JzJyxcbiAgdGltZW91dDogMTAwMCxcbiAgbGltaXQ6IC0xLFxuICBwcmluY2lwbGU6ICdmaWZvJ1xufTtcbiIsIi8qIEBmbG93ICovXG5pbXBvcnQgdHlwZSBJQ29uZmlnIGZyb20gJy4uL2ludGVyZmFjZXMvY29uZmlnJztcbmltcG9ydCBjb25maWdEYXRhIGZyb20gJy4vY29uZmlnLmRhdGEnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25maWcge1xuICBjb25maWc6IElDb25maWcgPSBjb25maWdEYXRhO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogSUNvbmZpZyA9IHt9KSB7XG4gICAgdGhpcy5tZXJnZShjb25maWcpO1xuICB9XG5cbiAgc2V0KG5hbWU6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQge1xuICAgIHRoaXMuY29uZmlnW25hbWVdID0gdmFsdWU7XG4gIH1cblxuICBnZXQobmFtZTogc3RyaW5nKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWdbbmFtZV07XG4gIH1cblxuICBoYXMobmFtZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLmNvbmZpZywgbmFtZSk7XG4gIH1cblxuICBtZXJnZShjb25maWc6IHtbc3RyaW5nXTogYW55fSkge1xuICAgIHRoaXMuY29uZmlnID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5jb25maWcsIGNvbmZpZyk7XG4gIH1cblxuICByZW1vdmUobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGRlbGV0ZSB0aGlzLmNvbmZpZ1tuYW1lXTtcbiAgfVxuXG4gIGFsbCgpOiBJQ29uZmlnIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc7XG4gIH1cbn1cbiIsIi8qIEBmbG93ICovXG5pbXBvcnQgdHlwZSBJQ29udGFpbmVyIGZyb20gJy4uL2ludGVyZmFjZXMvY29udGFpbmVyJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29udGFpbmVyIGltcGxlbWVudHMgSUNvbnRhaW5lciB7XG5cbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIF9jb250YWluZXI6IHtbcHJvcGVydHk6IHN0cmluZ106IGFueX0gPSB7fTtcblxuICBoYXMoaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5fY29udGFpbmVyLCBpZCk7XG4gIH1cblxuICBnZXQoaWQ6IHN0cmluZyk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnRhaW5lcltpZF07XG4gIH1cblxuICBhbGwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnRhaW5lcjtcbiAgfVxuXG4gIGJpbmQoaWQ6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQge1xuICAgIHRoaXMuX2NvbnRhaW5lcltpZF0gPSB2YWx1ZTtcbiAgfVxuXG4gIHJlbW92ZShpZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgaWYgKCEgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuX2NvbnRhaW5lciwgaWQpKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIGRlbGV0ZSB0aGlzLl9jb250YWluZXJbaWRdO1xuICB9XG5cbiAgcmVtb3ZlQWxsKCk6IHZvaWQge1xuICAgIHRoaXMuX2NvbnRhaW5lciA9IHt9O1xuICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBFdmVudCB7XG4gIHN0b3JlID0ge307XG4gIHZlcmlmaWVyUGF0dGVybiA9IC9eW2EtejAtOVxcLVxcX10rXFw6YmVmb3JlJHxhZnRlciR8cmV0cnkkfFxcKiQvO1xuICB3aWxkY2FyZHMgPSBbJyonLCAnZXJyb3InXTtcbiAgZW1wdHlGdW5jID0gKCkgPT4ge307XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5zdG9yZS5iZWZvcmUgPSB7fTtcbiAgICB0aGlzLnN0b3JlLmFmdGVyID0ge307XG4gICAgdGhpcy5zdG9yZS5yZXRyeSA9IHt9O1xuICAgIHRoaXMuc3RvcmUud2lsZGNhcmQgPSB7fTtcbiAgICB0aGlzLnN0b3JlLmVycm9yID0gdGhpcy5lbXB0eUZ1bmM7XG4gICAgdGhpcy5zdG9yZVsnKiddID0gdGhpcy5lbXB0eUZ1bmM7XG4gIH1cblxuICBvbihrZXk6IHN0cmluZywgY2I6IEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgaWYgKHR5cGVvZihjYikgIT09ICdmdW5jdGlvbicpIHRocm93IG5ldyBFcnJvcignRXZlbnQgc2hvdWxkIGJlIGFuIGZ1bmN0aW9uJyk7XG4gICAgaWYgKHRoaXMuaXNWYWxpZChrZXkpKSB0aGlzLmFkZChrZXksIGNiKTtcbiAgfVxuXG4gIGVtaXQoa2V5OiBzdHJpbmcsIGFyZ3M6IGFueSkge1xuICAgIGlmICh0aGlzLndpbGRjYXJkcy5pbmRleE9mKGtleSkgPiAtMSkge1xuICAgICAgdGhpcy53aWxkY2FyZChrZXksIC4uLmFyZ3VtZW50cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHR5cGUgPSB0aGlzLmdldFR5cGUoa2V5KTtcbiAgICAgIGNvbnN0IG5hbWUgPSB0aGlzLmdldE5hbWUoa2V5KTtcblxuICAgICAgaWYgKHRoaXMuc3RvcmVbdHlwZV0pIHtcbiAgICAgICAgY29uc3QgY2IgPSB0aGlzLnN0b3JlW3R5cGVdW25hbWVdIHx8IHRoaXMuZW1wdHlGdW5jO1xuICAgICAgICBjYi5jYWxsKG51bGwsIGFyZ3MpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMud2lsZGNhcmQoJyonLCBrZXksIGFyZ3MpO1xuICB9XG5cbiAgd2lsZGNhcmQoa2V5OiBzdHJpbmcsIGFjdGlvbktleTogc3RyaW5nLCBhcmdzOiBhbnkpIHtcbiAgICBpZiAodGhpcy5zdG9yZS53aWxkY2FyZFtrZXldKSB7XG4gICAgICB0aGlzLnN0b3JlLndpbGRjYXJkW2tleV0uY2FsbChudWxsLCBhY3Rpb25LZXksIGFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIGFkZChrZXk6IHN0cmluZywgY2I6IEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgaWYgKHRoaXMud2lsZGNhcmRzLmluZGV4T2Yoa2V5KSA+LTEpIHtcbiAgICAgIHRoaXMuc3RvcmUud2lsZGNhcmRba2V5XSA9IGNiO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB0eXBlID0gdGhpcy5nZXRUeXBlKGtleSk7XG4gICAgICBjb25zdCBuYW1lID0gdGhpcy5nZXROYW1lKGtleSk7XG4gICAgICB0aGlzLnN0b3JlW3R5cGVdW25hbWVdID0gY2I7XG4gICAgfVxuICB9XG5cbiAgaGFzKGtleTogc3RyaW5nKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGtleXMgPSBrZXkuc3BsaXQoJzonKTtcbiAgICAgIHJldHVybiBrZXlzLmxlbmd0aCA+IDEgPyAhISB0aGlzLnN0b3JlW2tleXNbMV1dW2tleXNbMF1dIDogISEgdGhpcy5zdG9yZS53aWxkY2FyZFtrZXlzWzBdXTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBnZXROYW1lKGtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4ga2V5Lm1hdGNoKC8oLiopXFw6LiovKVsxXTtcbiAgfVxuXG4gIGdldFR5cGUoa2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBrZXkubWF0Y2goL15bYS16MC05XFwtXFxfXStcXDooLiopLylbMV07XG4gIH1cblxuICBpc1ZhbGlkKGtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMudmVyaWZpZXJQYXR0ZXJuLnRlc3Qoa2V5KSB8fCB0aGlzLndpbGRjYXJkcy5pbmRleE9mKGtleSkgPi0xO1xuICB9XG59XG4iLCJpbXBvcnQgUXVldWUgZnJvbSAnLi9xdWV1ZSc7XG5cbndpbmRvdy5RdWV1ZSA9IFF1ZXVlO1xuXG5leHBvcnQgZGVmYXVsdCBRdWV1ZTtcbiIsIi8qIEBmbG93ICovXG5pbXBvcnQgdHlwZSBJQ29uZmlnIGZyb20gXCIuLi9pbnRlcmZhY2VzL2NvbmZpZ1wiO1xuaW1wb3J0IHR5cGUgSVRhc2sgZnJvbSBcIi4uL2ludGVyZmFjZXMvdGFza1wiO1xuaW1wb3J0IHR5cGUgSUpvYiBmcm9tIFwiLi4vaW50ZXJmYWNlcy9qb2JcIjtcbmltcG9ydCBDb250YWluZXIgZnJvbSBcIi4vY29udGFpbmVyXCI7XG5pbXBvcnQgU3RvcmFnZUNhcHN1bGUgZnJvbSBcIi4vc3RvcmFnZS1jYXBzdWxlXCI7XG5pbXBvcnQgQ29uZmlnIGZyb20gXCIuL2NvbmZpZ1wiO1xuaW1wb3J0IEV2ZW50IGZyb20gXCIuL2V2ZW50XCI7XG5pbXBvcnQge1xuICBjbG9uZSxcbiAgaGFzTWV0aG9kLFxuICBpc0Z1bmN0aW9uLFxuICBleGNsdWRlU3BlY2lmaWNUYXNrcyxcbiAgdXRpbENsZWFyQnlUYWdcbn0gZnJvbSBcIi4vdXRpbHNcIjtcbmltcG9ydCBMb2NhbFN0b3JhZ2UgZnJvbSBcIi4vc3RvcmFnZS9sb2NhbHN0b3JhZ2VcIjtcblxuaW50ZXJmYWNlIElKb2JJbnN0YW5jZSB7XG4gIHByaW9yaXR5OiBudW1iZXI7XG4gIHJldHJ5OiBudW1iZXI7XG4gIGhhbmRsZShhcmdzOiBhbnkpOiBhbnk7XG4gIGJlZm9yZShhcmdzOiBhbnkpOiB2b2lkO1xuICBhZnRlcihhcmdzOiBhbnkpOiB2b2lkO1xufVxuXG5sZXQgUXVldWUgPSAoKCkgPT4ge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICBRdWV1ZS5GSUZPID0gXCJmaWZvXCI7XG4gIFF1ZXVlLkxJRk8gPSBcImxpZm9cIjtcblxuICBmdW5jdGlvbiBRdWV1ZShjb25maWc6IElDb25maWcpIHtcbiAgICBfY29uc3RydWN0b3IuY2FsbCh0aGlzLCBjb25maWcpO1xuICB9XG5cbiAgZnVuY3Rpb24gX2NvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgIHRoaXMuY3VycmVudENoYW5uZWw7XG4gICAgdGhpcy5jdXJyZW50VGltZW91dDtcbiAgICB0aGlzLnN0b3BwZWQgPSB0cnVlO1xuICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICAgIHRoaXMuY2hhbm5lbHMgPSB7fTtcbiAgICB0aGlzLmNvbmZpZyA9IG5ldyBDb25maWcoY29uZmlnKTtcbiAgICB0aGlzLnN0b3JhZ2UgPSBuZXcgU3RvcmFnZUNhcHN1bGUoXG4gICAgICB0aGlzLmNvbmZpZyxcbiAgICAgIG5ldyBMb2NhbFN0b3JhZ2UodGhpcy5jb25maWcpXG4gICAgKTtcbiAgICB0aGlzLmV2ZW50ID0gbmV3IEV2ZW50KCk7XG4gICAgdGhpcy5jb250YWluZXIgPSBuZXcgQ29udGFpbmVyKCk7XG4gICAgdGhpcy50aW1lb3V0ID0gdGhpcy5jb25maWcuZ2V0KFwidGltZW91dFwiKTtcbiAgfVxuXG4gIFF1ZXVlLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbih0YXNrKTogc3RyaW5nIHwgYm9vbGVhbiB7XG4gICAgaWYgKCFjYW5NdWx0aXBsZS5jYWxsKHRoaXMsIHRhc2spKSByZXR1cm4gZmFsc2U7XG5cbiAgICBjb25zdCBpZCA9IHNhdmVUYXNrLmNhbGwodGhpcywgdGFzayk7XG5cbiAgICBpZiAoaWQgJiYgdGhpcy5zdG9wcGVkICYmIHRoaXMucnVubmluZyA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy5zdGFydCgpO1xuICAgIH1cblxuICAgIHJldHVybiBpZDtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnN0b3BwZWQpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiW3N0b3BwZWRdLT4gbmV4dFwiKTtcbiAgICAgIHN0YXR1c09mZi5jYWxsKHRoaXMpO1xuICAgICAgcmV0dXJuIHN0b3BRdWV1ZS5jYWxsKHRoaXMpO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyhcIltuZXh0XS0+XCIpO1xuICAgIHRoaXMuc3RhcnQoKTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpOiBib29sZWFuIHtcbiAgICAvLyBTdG9wIHRoZSBxdWV1ZSBmb3IgcmVzdGFydFxuICAgIHRoaXMuc3RvcHBlZCA9IGZhbHNlO1xuXG4gICAgLy8gUmVnaXN0ZXIgdGFza3MsIGlmIG5vdCByZWdpc3RlcmVkXG4gICAgcmVnaXN0ZXJKb2JzLmNhbGwodGhpcyk7XG5cbiAgICAvLyBDcmVhdGUgYSB0aW1lb3V0IGZvciBzdGFydCBxdWV1ZVxuICAgIHRoaXMucnVubmluZyA9IGNyZWF0ZVRpbWVvdXQuY2FsbCh0aGlzKSA+IDA7XG4gICAgY29uc29sZS5sb2coXCJbc3RhcnRlZF0tPlwiLCB0aGlzLnJ1bm5pbmcpO1xuICAgIHJldHVybiB0aGlzLnJ1bm5pbmc7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZyhcIltzdG9wcGluZ10tPlwiKTtcbiAgICB0aGlzLnN0b3BwZWQgPSB0cnVlOyAvL3RoaXMucnVubmluZztcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuZm9yY2VTdG9wID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coXCJbZm9yY2VTdG9wcGVkXS0+XCIpO1xuICAgIHN0b3BRdWV1ZS5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbihjaGFubmVsOiBzdHJpbmcpIHtcbiAgICBpZiAoIShjaGFubmVsIGluIHRoaXMuY2hhbm5lbHMpKSB7XG4gICAgICB0aGlzLmN1cnJlbnRDaGFubmVsID0gY2hhbm5lbDtcbiAgICAgIHRoaXMuY2hhbm5lbHNbY2hhbm5lbF0gPSBjbG9uZSh0aGlzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5jaGFubmVsc1tjaGFubmVsXTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuY2hhbm5lbCA9IGZ1bmN0aW9uKG5hbWU6IHN0cmluZykge1xuICAgIGlmICghdGhpcy5jaGFubmVsc1tuYW1lXSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDaGFubmVsIG9mIFwiJHtuYW1lfVwiIG5vdCBmb3VuZGApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmNoYW5uZWxzW25hbWVdO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5pc0VtcHR5ID0gZnVuY3Rpb24oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY291bnQoKSA8IDE7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLmNvdW50ID0gZnVuY3Rpb24oKTogQXJyYXk8SVRhc2s+IHtcbiAgICByZXR1cm4gZ2V0VGFza3NXaXRob3V0RnJlZXplZC5jYWxsKHRoaXMpLmxlbmd0aDtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuY291bnRCeVRhZyA9IGZ1bmN0aW9uKHRhZzogc3RyaW5nKTogQXJyYXk8SVRhc2s+IHtcbiAgICByZXR1cm4gZ2V0VGFza3NXaXRob3V0RnJlZXplZC5jYWxsKHRoaXMpLmZpbHRlcih0ID0+IHQudGFnID09PSB0YWcpLmxlbmd0aDtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpOiBib29sZWFuIHtcbiAgICBpZiAoISB0aGlzLmN1cnJlbnRDaGFubmVsKSByZXR1cm4gZmFsc2U7XG4gICAgdGhpcy5zdG9yYWdlLmNsZWFyKHRoaXMuY3VycmVudENoYW5uZWwpO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5jbGVhckJ5VGFnID0gZnVuY3Rpb24odGFnOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBkYlxuICAgICAgLmNhbGwodGhpcylcbiAgICAgIC5hbGwoKVxuICAgICAgLmZpbHRlcih1dGlsQ2xlYXJCeVRhZy5iaW5kKHRhZykpXG4gICAgICAuZm9yRWFjaCh0ID0+IGRiLmNhbGwodGhpcykuZGVsZXRlKHQuX2lkKSk7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uKGlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZ2V0VGFza3NXaXRob3V0RnJlZXplZC5jYWxsKHRoaXMpLmZpbmRJbmRleCh0ID0+IHQuX2lkID09PSBpZCkgPiAtMTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuaGFzQnlUYWcgPSBmdW5jdGlvbih0YWc6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBnZXRUYXNrc1dpdGhvdXRGcmVlemVkLmNhbGwodGhpcykuZmluZEluZGV4KHQgPT4gdC50YWcgPT09IHRhZykgPiAtMTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuc2V0VGltZW91dCA9IGZ1bmN0aW9uKHZhbDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy50aW1lb3V0ID0gdmFsO1xuICAgIHRoaXMuY29uZmlnLnNldChcInRpbWVvdXRcIiwgdmFsKTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuc2V0TGltaXQgPSBmdW5jdGlvbih2YWw6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuY29uZmlnLnNldChcImxpbWl0XCIsIHZhbCk7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLnNldFByZWZpeCA9IGZ1bmN0aW9uKHZhbDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5jb25maWcuc2V0KFwicHJlZml4XCIsIHZhbCk7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLnNldFByaW5jaXBsZSA9IGZ1bmN0aW9uKHZhbDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5jb25maWcuc2V0KFwicHJpbmNpcGxlXCIsIHZhbCk7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLm9uID0gZnVuY3Rpb24oa2V5OiBzdHJpbmcsIGNiOiBGdW5jdGlvbik6IHZvaWQge1xuICAgIHRoaXMuZXZlbnQub24oLi4uYXJndW1lbnRzKTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuZXJyb3IgPSBmdW5jdGlvbihjYjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICB0aGlzLmV2ZW50Lm9uKFwiZXJyb3JcIiwgY2IpO1xuICB9O1xuXG4gIFF1ZXVlLnJlZ2lzdGVyID0gZnVuY3Rpb24oam9iczogQXJyYXk8SUpvYj4pIHtcbiAgICBpZiAoIShqb2JzIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJRdWV1ZSBqb2JzIHNob3VsZCBiZSBvYmplY3RzIHdpdGhpbiBhbiBhcnJheVwiKTtcbiAgICB9XG5cbiAgICBRdWV1ZS5pc1JlZ2lzdGVyZWQgPSBmYWxzZTtcbiAgICBRdWV1ZS5qb2JzID0gam9icztcbiAgfTtcblxuICBmdW5jdGlvbiBnZXRUYXNrc1dpdGhvdXRGcmVlemVkKCkge1xuICAgIHJldHVybiBkYlxuICAgICAgLmNhbGwodGhpcylcbiAgICAgIC5hbGwoKVxuICAgICAgLmZpbHRlcihleGNsdWRlU3BlY2lmaWNUYXNrcy5iaW5kKFtcImZyZWV6ZWRcIl0pKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRpc3BhdGNoRXZlbnRzKHRhc2s6IElUYXNrLCB0eXBlOiBzdHJpbmcpIHtcbiAgICBpZiAoXCJ0YWdcIiBpbiB0YXNrKSB7XG4gICAgICB0aGlzLmV2ZW50LmVtaXQoYCR7dGFzay50YWd9OiR7dHlwZX1gLCB0YXNrKTtcbiAgICAgIHRoaXMuZXZlbnQuZW1pdChgJHt0YXNrLnRhZ306KmAsIHRhc2spO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGRiKCkge1xuICAgIHJldHVybiB0aGlzLnN0b3JhZ2UuY2hhbm5lbCh0aGlzLmN1cnJlbnRDaGFubmVsKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNhdmVUYXNrKHRhc2s6IElUYXNrKSB7XG4gICAgcmV0dXJuIGRiLmNhbGwodGhpcykuc2F2ZSh0YXNrKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNhdmVUYXNrKHRhc2s6IElUYXNrKSB7XG4gICAgcmV0dXJuIGRiLmNhbGwodGhpcykuc2F2ZShjaGVja1ByaW9yaXR5KHRhc2spKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNoZWNrUHJpb3JpdHkodGFzazogSVRhc2spIHtcbiAgICB0YXNrLnByaW9yaXR5ID0gdGFzay5wcmlvcml0eSB8fCAwO1xuXG4gICAgaWYgKGlzTmFOKHRhc2sucHJpb3JpdHkpKSB0YXNrLnByaW9yaXR5ID0gMDtcblxuICAgIHJldHVybiB0YXNrO1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlVGltZW91dCgpOiBudW1iZXIge1xuICAgIGNvbnN0IHRpbWVvdXQgPSB0aGlzLmNvbmZpZy5nZXQoXCJ0aW1lb3V0XCIpO1xuICAgIHJldHVybiAodGhpcy5jdXJyZW50VGltZW91dCA9IHNldFRpbWVvdXQobG9vcEhhbmRsZXIuYmluZCh0aGlzKSwgdGltZW91dCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9ja1Rhc2sodGFzayk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBkYi5jYWxsKHRoaXMpLnVwZGF0ZSh0YXNrLl9pZCwgeyBsb2NrZWQ6IHRydWUgfSk7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVUYXNrKGlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZGIuY2FsbCh0aGlzKS5kZWxldGUoaWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9vcEhhbmRsZXIoKTogdm9pZCB7XG4gICAgY29uc3Qgc2VsZjogUXVldWUgPSB0aGlzO1xuICAgIGNvbnN0IHRhc2s6IElUYXNrID0gZGJcbiAgICAgIC5jYWxsKHNlbGYpXG4gICAgICAuZmV0Y2goKVxuICAgICAgLnNoaWZ0KCk7XG5cbiAgICBpZiAodGFzayA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zb2xlLmxvZyhgLT4gJHt0aGlzLmN1cnJlbnRDaGFubmVsfSBjaGFubmVsIGlzIGVtcHR5Li4uYCk7XG4gICAgICBzdG9wUXVldWUuY2FsbCh0aGlzKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXNlbGYuY29udGFpbmVyLmhhcyh0YXNrLmhhbmRsZXIpKSB7XG4gICAgICBjb25zb2xlLndhcm4odGFzay5oYW5kbGVyICsgXCItPiBqb2Igbm90IGZvdW5kXCIpO1xuICAgIH1cblxuICAgIGNvbnN0IGpvYjogSUpvYiA9IHNlbGYuY29udGFpbmVyLmdldCh0YXNrLmhhbmRsZXIpO1xuICAgIGNvbnN0IGpvYkluc3RhbmNlOiBJSm9iSW5zdGFuY2UgPSBuZXcgam9iLmhhbmRsZXIoKTtcblxuICAgIC8vIGxvY2sgdGhlIGN1cnJlbnQgdGFzayBmb3IgcHJldmVudCByYWNlIGNvbmRpdGlvblxuICAgIGxvY2tUYXNrLmNhbGwoc2VsZiwgdGFzayk7XG5cbiAgICAvLyBmaXJlIGpvYiBiZWZvcmUgZXZlbnRcbiAgICBmaXJlSm9iSW5saW5lRXZlbnQuY2FsbCh0aGlzLCBcImJlZm9yZVwiLCBqb2JJbnN0YW5jZSwgdGFzay5hcmdzKTtcblxuICAgIC8vIGRpc3BhY3RoIGN1c3RvbSBiZWZvcmUgZXZlbnRcbiAgICBkaXNwYXRjaEV2ZW50cy5jYWxsKHRoaXMsIHRhc2ssIFwiYmVmb3JlXCIpO1xuXG4gICAgLy8gcHJlcGFyaW5nIHdvcmtlciBkZXBlbmRlbmNpZXNcbiAgICBjb25zdCBkZXBlbmRlbmNpZXMgPSBPYmplY3QudmFsdWVzKGpvYi5kZXBzIHx8IHt9KTtcblxuICAgIC8vIFRhc2sgcnVubmVyIHByb21pc2VcbiAgICBqb2JJbnN0YW5jZS5oYW5kbGVcbiAgICAgIC5jYWxsKGpvYkluc3RhbmNlLCB0YXNrLmFyZ3MsIC4uLmRlcGVuZGVuY2llcylcbiAgICAgIC50aGVuKGpvYlJlc3BvbnNlLmNhbGwoc2VsZiwgdGFzaywgam9iSW5zdGFuY2UpLmJpbmQoc2VsZikpXG4gICAgICAuY2F0Y2goam9iRmFpbGVkUmVzcG9uc2UuY2FsbChzZWxmLCB0YXNrLCBqb2JJbnN0YW5jZSkuYmluZChzZWxmKSk7XG4gIH1cblxuICBmdW5jdGlvbiBqb2JSZXNwb25zZSh0YXNrOiBJVGFzaywgam9iOiBJSm9iSW5zdGFuY2UpOiBGdW5jdGlvbiB7XG4gICAgY29uc3Qgc2VsZjogUXVldWUgPSB0aGlzO1xuICAgIHJldHVybiBmdW5jdGlvbihyZXN1bHQ6IGJvb2xlYW4pIHtcbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgc3VjY2Vzc1Byb2Nlc3MuY2FsbChzZWxmLCB0YXNrLCBqb2IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0cnlQcm9jZXNzLmNhbGwoc2VsZiwgdGFzaywgam9iKTtcbiAgICAgIH1cblxuICAgICAgLy8gZmlyZSBqb2IgYWZ0ZXIgZXZlbnRcbiAgICAgIGZpcmVKb2JJbmxpbmVFdmVudC5jYWxsKHRoaXMsIFwiYWZ0ZXJcIiwgam9iLCB0YXNrLmFyZ3MpO1xuXG4gICAgICAvLyBkaXNwYWN0aCBjdXN0b20gYWZ0ZXIgZXZlbnRcbiAgICAgIGRpc3BhdGNoRXZlbnRzLmNhbGwodGhpcywgdGFzaywgXCJhZnRlclwiKTtcblxuICAgICAgLy8gdHJ5IG5leHQgcXVldWUgam9iXG4gICAgICBzZWxmLm5leHQoKTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gam9iRmFpbGVkUmVzcG9uc2UodGFzazogSVRhc2ssIGpvYjogSUpvYkluc3RhbmNlKTogRnVuY3Rpb24ge1xuICAgIHJldHVybiAocmVzdWx0OiBib29sZWFuKSA9PiB7XG4gICAgICByZW1vdmVUYXNrLmNhbGwodGhpcywgdGFzay5faWQpO1xuXG4gICAgICB0aGlzLmV2ZW50LmVtaXQoXCJlcnJvclwiLCB0YXNrKTtcblxuICAgICAgdGhpcy5uZXh0KCk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpcmVKb2JJbmxpbmVFdmVudChcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgam9iOiBJSm9iSW5zdGFuY2UsXG4gICAgYXJnczogYW55XG4gICk6IHZvaWQge1xuICAgIGlmICghaGFzTWV0aG9kKGpvYiwgbmFtZSkpIHJldHVybjtcblxuICAgIGlmIChuYW1lID09IFwiYmVmb3JlXCIgJiYgaXNGdW5jdGlvbihqb2IuYmVmb3JlKSkge1xuICAgICAgam9iLmJlZm9yZS5jYWxsKGpvYiwgYXJncyk7XG4gICAgfSBlbHNlIGlmIChuYW1lID09IFwiYWZ0ZXJcIiAmJiBpc0Z1bmN0aW9uKGpvYi5hZnRlcikpIHtcbiAgICAgIGpvYi5hZnRlci5jYWxsKGpvYiwgYXJncyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc3RhdHVzT2ZmKCk6IHZvaWQge1xuICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RvcFF1ZXVlKCk6IHZvaWQge1xuICAgIHRoaXMuc3RvcCgpO1xuXG4gICAgaWYgKHRoaXMuY3VycmVudFRpbWVvdXQpIHtcbiAgICAgIC8vIHVuc2V0IGN1cnJlbnQgdGltZW91dCB2YWx1ZVxuICAgICAgdGhpcy5jdXJyZW50VGltZW91dCA9IGNsZWFyVGltZW91dCh0aGlzLmN1cnJlbnRUaW1lb3V0KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzdWNjZXNzUHJvY2Vzcyh0YXNrOiBJVGFzaywgam9iOiBJSm9iSW5zdGFuY2UpOiB2b2lkIHtcbiAgICByZW1vdmVUYXNrLmNhbGwodGhpcywgdGFzay5faWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmV0cnlQcm9jZXNzKHRhc2s6IElUYXNrLCBqb2I6IElKb2JJbnN0YW5jZSk6IGJvb2xlYW4ge1xuICAgIC8vIGRpc3BhY3RoIGN1c3RvbSByZXRyeSBldmVudFxuICAgIGRpc3BhdGNoRXZlbnRzLmNhbGwodGhpcywgdGFzaywgXCJyZXRyeVwiKTtcblxuICAgIC8vIHVwZGF0ZSByZXRyeSB2YWx1ZVxuICAgIGxldCB1cGRhdGVUYXNrOiBJVGFzayA9IHVwZGF0ZVJldHJ5LmNhbGwodGhpcywgdGFzaywgam9iKTtcblxuICAgIC8vIGRlbGV0ZSBsb2NrIHByb3BlcnR5IGZvciBuZXh0IHByb2Nlc3NcbiAgICB1cGRhdGVUYXNrLmxvY2tlZCA9IGZhbHNlO1xuXG4gICAgcmV0dXJuIGRiLmNhbGwodGhpcykudXBkYXRlKHRhc2suX2lkLCB1cGRhdGVUYXNrKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbk11bHRpcGxlKHRhc2s6IElUYXNrKTogYm9vbGVhbiB7XG4gICAgaWYgKHR5cGVvZiB0YXNrICE9PSBcIm9iamVjdFwiIHx8IHRhc2sudW5pcXVlICE9PSB0cnVlKSByZXR1cm4gdHJ1ZTtcblxuICAgIHJldHVybiB0aGlzLmhhc0J5VGFnKHRhc2sudGFnKSA8IDE7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVSZXRyeSh0YXNrOiBJVGFzaywgam9iOiBJSm9iSW5zdGFuY2UpOiBJVGFzayB7XG4gICAgaWYgKCEoXCJyZXRyeVwiIGluIGpvYikpIHtcbiAgICAgIGpvYi5yZXRyeSA9IDE7XG4gICAgfVxuXG4gICAgaWYgKCEoXCJ0cmllZFwiIGluIHRhc2spKSB7XG4gICAgICB0YXNrLnRyaWVkID0gMDtcbiAgICAgIHRhc2sucmV0cnkgPSBqb2IucmV0cnk7XG4gICAgfVxuXG4gICAgKyt0YXNrLnRyaWVkO1xuXG4gICAgaWYgKHRhc2sudHJpZWQgPj0gam9iLnJldHJ5KSB7XG4gICAgICB0YXNrLmZyZWV6ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiB0YXNrO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVnaXN0ZXJKb2JzKCk6IHZvaWQge1xuICAgIGlmIChRdWV1ZS5pc1JlZ2lzdGVyZWQpIHJldHVybjtcblxuICAgIGNvbnN0IGpvYnMgPSBRdWV1ZS5qb2JzIHx8IFtdO1xuXG4gICAgZm9yIChjb25zdCBqb2Igb2Ygam9icykge1xuICAgICAgY29uc3QgZnVuY1N0ciA9IGpvYi5oYW5kbGVyLnRvU3RyaW5nKCk7XG4gICAgICBjb25zdCBbc3RyRnVuY3Rpb24sIG5hbWVdID0gZnVuY1N0ci5tYXRjaCgvZnVuY3Rpb25cXHMoW2EtekEtWl9dKykuKj8vKTtcbiAgICAgIGlmIChuYW1lKSB0aGlzLmNvbnRhaW5lci5iaW5kKG5hbWUsIGpvYik7XG4gICAgfVxuXG4gICAgUXVldWUuaXNSZWdpc3RlcmVkID0gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBRdWV1ZTtcbn0pKCk7XG5cbmV4cG9ydCBkZWZhdWx0IFF1ZXVlO1xuIiwiLyogQGZsb3cgKi9cblxuaW1wb3J0IGdyb3VwQnkgZnJvbSBcImdyb3VwLWJ5XCI7XG5pbXBvcnQgTG9jYWxTdG9yYWdlIGZyb20gXCIuL3N0b3JhZ2UvbG9jYWxzdG9yYWdlXCI7XG5pbXBvcnQgdHlwZSBJQ29uZmlnIGZyb20gXCIuLi9pbnRlcmZhY2VzL2NvbmZpZ1wiO1xuaW1wb3J0IHR5cGUgSVN0b3JhZ2UgZnJvbSBcIi4uL2ludGVyZmFjZXMvc3RvcmFnZVwiO1xuaW1wb3J0IHR5cGUgSVRhc2sgZnJvbSBcIi4uL2ludGVyZmFjZXMvdGFza1wiO1xuaW1wb3J0IENvbmZpZyBmcm9tIFwiLi9jb25maWdcIjtcbmltcG9ydCB7IGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzLCBsaWZvLCBmaWZvIH0gZnJvbSBcIi4vdXRpbHNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RvcmFnZUNhcHN1bGUge1xuICBjb25maWc6IElDb25maWc7XG4gIHN0b3JhZ2U6IElTdG9yYWdlO1xuICBzdG9yYWdlQ2hhbm5lbDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogSUNvbmZpZywgc3RvcmFnZTogSVN0b3JhZ2UpIHtcbiAgICB0aGlzLnN0b3JhZ2UgPSBzdG9yYWdlO1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICB9XG5cbiAgY2hhbm5lbChuYW1lOiBzdHJpbmcpOiBTdG9yYWdlQ2Fwc3VsZSB7XG4gICAgdGhpcy5zdG9yYWdlQ2hhbm5lbCA9IG5hbWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBmZXRjaCgpOiBBcnJheTxhbnk+IHtcbiAgICBjb25zdCBhbGwgPSB0aGlzLmFsbCgpLmZpbHRlcihleGNsdWRlU3BlY2lmaWNUYXNrcyk7XG4gICAgY29uc3QgdGFza3MgPSBncm91cEJ5KGFsbCwgXCJwcmlvcml0eVwiKTtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGFza3MpXG4gICAgICAubWFwKGtleSA9PiBwYXJzZUludChrZXkpKVxuICAgICAgLnNvcnQoKGEsIGIpID0+IGIgLSBhKVxuICAgICAgLnJlZHVjZSh0aGlzLnJlZHVjZVRhc2tzKHRhc2tzKSwgW10pO1xuICB9XG5cbiAgc2F2ZSh0YXNrOiBJVGFzayk6IHN0cmluZyB8IGJvb2xlYW4ge1xuICAgIC8vIGdldCBhbGwgdGFza3MgY3VycmVudCBjaGFubmVsJ3NcbiAgICBjb25zdCB0YXNrczogSVRhc2tbXSA9IHRoaXMuc3RvcmFnZS5nZXQodGhpcy5zdG9yYWdlQ2hhbm5lbCk7XG5cbiAgICAvLyBjaGVjayBjaGFubmVsIGxpbWl0LlxuICAgIC8vIGlmIGxpbWl0IGlzIGV4Y2VlZGVkLCBkb2VzIG5vdCBpbnNlcnQgbmV3IHRhc2tcbiAgICBpZiAodGhpcy5pc0V4Y2VlZGVkKCkpIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgYFRhc2sgbGltaXQgZXhjZWVkZWQ6IFRoZSAnJHtcbiAgICAgICAgICB0aGlzLnN0b3JhZ2VDaGFubmVsXG4gICAgICAgIH0nIGNoYW5uZWwgbGltaXQgaXMgJHt0aGlzLmNvbmZpZy5nZXQoXCJsaW1pdFwiKX1gXG4gICAgICApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIHByZXBhcmUgYWxsIHByb3BlcnRpZXMgYmVmb3JlIHNhdmVcbiAgICAvLyBleGFtcGxlOiBjcmVhdGVkQXQgZXRjLlxuICAgIHRhc2sgPSB0aGlzLnByZXBhcmVUYXNrKHRhc2spO1xuXG4gICAgLy8gYWRkIHRhc2sgdG8gc3RvcmFnZVxuICAgIHRhc2tzLnB1c2godGFzayk7XG5cbiAgICAvLyBzYXZlIHRhc2tzXG4gICAgdGhpcy5zdG9yYWdlLnNldCh0aGlzLnN0b3JhZ2VDaGFubmVsLCBKU09OLnN0cmluZ2lmeSh0YXNrcykpO1xuXG4gICAgcmV0dXJuIHRhc2suX2lkO1xuICB9XG5cbiAgdXBkYXRlKGlkOiBzdHJpbmcsIHVwZGF0ZTogeyBbcHJvcGVydHk6IHN0cmluZ106IGFueSB9KTogYm9vbGVhbiB7XG4gICAgY29uc3QgZGF0YTogYW55W10gPSB0aGlzLmFsbCgpO1xuICAgIGNvbnN0IGluZGV4OiBudW1iZXIgPSBkYXRhLmZpbmRJbmRleCh0ID0+IHQuX2lkID09IGlkKTtcblxuICAgIGlmIChpbmRleCA8IDApIHJldHVybiBmYWxzZTtcblxuICAgIC8vIG1lcmdlIGV4aXN0aW5nIG9iamVjdCB3aXRoIGdpdmVuIHVwZGF0ZSBvYmplY3RcbiAgICBkYXRhW2luZGV4XSA9IE9iamVjdC5hc3NpZ24oe30sIGRhdGFbaW5kZXhdLCB1cGRhdGUpO1xuXG4gICAgLy8gc2F2ZSB0byB0aGUgc3RvcmFnZSBhcyBzdHJpbmdcbiAgICB0aGlzLnN0b3JhZ2Uuc2V0KHRoaXMuc3RvcmFnZUNoYW5uZWwsIEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZGVsZXRlKGlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCBkYXRhOiBhbnlbXSA9IHRoaXMuYWxsKCk7XG4gICAgY29uc3QgaW5kZXg6IG51bWJlciA9IGRhdGEuZmluZEluZGV4KGQgPT4gZC5faWQgPT09IGlkKTtcblxuICAgIGlmIChpbmRleCA8IDApIHJldHVybiBmYWxzZTtcblxuICAgIGRlbGV0ZSBkYXRhW2luZGV4XTtcblxuICAgIHRoaXMuc3RvcmFnZS5zZXQoXG4gICAgICB0aGlzLnN0b3JhZ2VDaGFubmVsLFxuICAgICAgSlNPTi5zdHJpbmdpZnkoZGF0YS5maWx0ZXIoZCA9PiBkKSlcbiAgICApO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgYWxsKCk6IEFycmF5PGFueT4ge1xuICAgIHJldHVybiB0aGlzLnN0b3JhZ2UuZ2V0KHRoaXMuc3RvcmFnZUNoYW5uZWwpO1xuICB9XG5cbiAgZ2VuZXJhdGVJZCgpOiBzdHJpbmcge1xuICAgIHJldHVybiAoKDEgKyBNYXRoLnJhbmRvbSgpKSAqIDB4MTAwMDApLnRvU3RyaW5nKDE2KTtcbiAgfVxuXG4gIHByZXBhcmVUYXNrKHRhc2s6IElUYXNrKTogSVRhc2sge1xuICAgIHRhc2suY3JlYXRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICB0YXNrLl9pZCA9IHRoaXMuZ2VuZXJhdGVJZCgpO1xuICAgIHJldHVybiB0YXNrO1xuICB9XG5cbiAgcmVkdWNlVGFza3ModGFza3M6IElUYXNrW10pIHtcbiAgICBjb25zdCByZWR1Y2VGdW5jID0gKHJlc3VsdDogSVRhc2tbXSwga2V5OiBhbnkpID0+IHtcbiAgICAgIGlmICh0aGlzLmNvbmZpZy5nZXQoXCJwcmluY2lwbGVcIikgPT09IFwibGlmb1wiKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQuY29uY2F0KHRhc2tzW2tleV0uc29ydChsaWZvKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVzdWx0LmNvbmNhdCh0YXNrc1trZXldLnNvcnQoZmlmbykpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gcmVkdWNlRnVuYy5iaW5kKHRoaXMpO1xuICB9XG5cbiAgaXNFeGNlZWRlZCgpOiBib29sZWFuIHtcbiAgICBjb25zdCBsaW1pdDogbnVtYmVyID0gdGhpcy5jb25maWcuZ2V0KFwibGltaXRcIik7XG4gICAgY29uc3QgdGFza3M6IElUYXNrW10gPSB0aGlzLmFsbCgpLmZpbHRlcihleGNsdWRlU3BlY2lmaWNUYXNrcyk7XG4gICAgcmV0dXJuICEobGltaXQgPT09IC0xIHx8IGxpbWl0ID4gdGFza3MubGVuZ3RoKTtcbiAgfVxuXG4gIGNsZWFyKGNoYW5uZWw6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmFnZS5jbGVhcihjaGFubmVsKTtcbiAgfVxufVxuIiwiLyogQGZsb3cgKi9cblxuaW1wb3J0IHR5cGUgSVN0b3JhZ2UgZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9zdG9yYWdlJztcbmltcG9ydCB0eXBlIElDb25maWcgZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9zdG9yYWdlJztcbmltcG9ydCB0eXBlIElKb2IgZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9qb2InO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMb2NhbFN0b3JhZ2UgaW1wbGVtZW50cyBJU3RvcmFnZSB7XG4gIHN0b3JhZ2U6IE9iamVjdDtcbiAgY29uZmlnOiBJQ29uZmlnO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogSUNvbmZpZykge1xuICAgIHRoaXMuc3RvcmFnZSA9IGxvY2FsU3RvcmFnZTtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgfVxuXG4gIGdldChrZXk6IHN0cmluZyk6IEFycmF5PElKb2J8W10+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgbmFtZSA9IHRoaXMuc3RvcmFnZU5hbWUoa2V5KTtcbiAgICAgIHJldHVybiB0aGlzLmhhcyhuYW1lKSA/IEpTT04ucGFyc2UodGhpcy5zdG9yYWdlLmdldEl0ZW0obmFtZSkpIDogW107XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICB9XG5cbiAgc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5zdG9yYWdlLnNldEl0ZW0odGhpcy5zdG9yYWdlTmFtZShrZXkpLCB2YWx1ZSk7XG4gIH1cblxuICBoYXMoa2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4ga2V5IGluIHRoaXMuc3RvcmFnZTtcbiAgfVxuXG4gIGNsZWFyKGtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5zdG9yYWdlLnJlbW92ZUl0ZW0odGhpcy5zdG9yYWdlTmFtZShrZXkpKTtcbiAgfVxuXG4gIGNsZWFyQWxsKCk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmFnZS5jbGVhcigpO1xuICB9XG5cbiAgc3RvcmFnZU5hbWUoc3VmZml4OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gYCR7dGhpcy5nZXRQcmVmaXgoKX1fJHtzdWZmaXh9YDtcbiAgfVxuXG4gIGdldFByZWZpeCgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWcuZ2V0KCdwcmVmaXgnKTtcbiAgfVxufVxuIiwiLyogQGZsb3cgKi9cbmltcG9ydCB0eXBlIElUYXNrIGZyb20gJy4uL2ludGVyZmFjZXMvdGFzayc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZShvYmo6IE9iamVjdCkge1xuICB2YXIgbmV3Q2xhc3MgPSBPYmplY3QuY3JlYXRlKFxuICAgIE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopLFxuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG9iaikucmVkdWNlKChwcm9wcywgbmFtZSkgPT4ge1xuICAgICAgcHJvcHNbbmFtZV0gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iaiwgbmFtZSk7XG4gICAgICByZXR1cm4gcHJvcHM7XG4gICAgfSwge30pXG4gICk7XG5cbiAgaWYgKCEgT2JqZWN0LmlzRXh0ZW5zaWJsZShvYmopKSB7XG4gICAgT2JqZWN0LnByZXZlbnRFeHRlbnNpb25zKG5ld0NsYXNzKTtcbiAgfVxuICBpZiAoT2JqZWN0LmlzU2VhbGVkKG9iaikpIHtcbiAgICBPYmplY3Quc2VhbChuZXdDbGFzcyk7XG4gIH1cbiAgaWYgKE9iamVjdC5pc0Zyb3plbihvYmopKSB7XG4gICAgT2JqZWN0LmZyZWV6ZShuZXdDbGFzcyk7XG4gIH1cblxuICByZXR1cm4gbmV3Q2xhc3M7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNQcm9wZXJ0eShvYmo6IEZ1bmN0aW9uLCBuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIG5hbWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzTWV0aG9kKGluc3RhbmNlOiBhbnksIG1ldGhvZDogc3RyaW5nKSB7XG4gIHJldHVybiBpbnN0YW5jZSBpbnN0YW5jZW9mIE9iamVjdCAmJiAobWV0aG9kIGluIGluc3RhbmNlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRnVuY3Rpb24oZnVuYzogRnVuY3Rpb24pIHtcbiAgcmV0dXJuIGZ1bmMgaW5zdGFuY2VvZiBGdW5jdGlvbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzKHRhc2s6IElUYXNrKSB7XG4gIGNvbnN0IGNvbmRpdGlvbnMgPSBBcnJheS5pc0FycmF5KHRoaXMpID8gdGhpcyA6IFsnZnJlZXplZCcsICdsb2NrZWQnXTtcbiAgY29uc3QgcmVzdWx0cyA9IFtdO1xuXG4gIGZvciAoY29uc3QgYyBvZiBjb25kaXRpb25zKSB7XG4gICAgcmVzdWx0cy5wdXNoKGhhc1Byb3BlcnR5KHRhc2ssIGMpID09PSBmYWxzZSB8fCB0YXNrW2NdID09PSBmYWxzZSk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0cy5pbmRleE9mKGZhbHNlKSA+IC0xID8gZmFsc2UgOiB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXRpbENsZWFyQnlUYWcodGFzazogSVRhc2spOiBib29sZWFuIHtcbiAgaWYgKCEgZXhjbHVkZVNwZWNpZmljVGFza3MuY2FsbChbJ2xvY2tlZCddLCB0YXNrKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdGFzay50YWcgPT09IHRoaXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaWZvKGE6IElUYXNrLCBiOiBJVGFzaykge1xuICByZXR1cm4gYS5jcmVhdGVkQXQgLSBiLmNyZWF0ZWRBdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpZm8oYTogSVRhc2ssIGI6IElUYXNrKSB7XG4gIHJldHVybiBiLmNyZWF0ZWRBdCAtIGEuY3JlYXRlZEF0O1xufVxuIl19
