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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY29tcG9uZW50LXByb3BzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2dyb3VwLWJ5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3RvLWZ1bmN0aW9uL2luZGV4LmpzIiwic3JjL2NvbmZpZy5kYXRhLmpzIiwic3JjL2NvbmZpZy5qcyIsInNyYy9jb250YWluZXIuanMiLCJzcmMvZXZlbnQuanMiLCJzcmMvaW5kZXguanMiLCJzcmMvcXVldWUuanMiLCJzcmMvc3RvcmFnZS1jYXBzdWxlLmpzIiwic3JjL3N0b3JhZ2UvbG9jYWxzdG9yYWdlLmpzIiwic3JjL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7V0N4SmUsQUFDSixBQUNUO1VBRmEsQUFFTCxBQUNSO1dBSGEsQUFHSixBQUNUO1NBQU8sQ0FKTSxBQUlMLEFBQ1IsQ0FMYSxBQUNiO2EsQUFEYSxBQUtGOzs7OztBQ0hiLHVDOztBLEFBRXFCLHFCQUduQjs7O29CQUFrQyxLQUF0QixBQUFzQiw2RUFBSixBQUFJLHNDQUZsQyxBQUVrQyxrQkFDaEM7U0FBQSxBQUFLLE1BQUwsQUFBVyxBQUNaO0EsdURBRUc7O0EsVSxBQUFjLE9BQWtCLEFBQ2xDO1dBQUEsQUFBSyxPQUFMLEFBQVksUUFBWixBQUFvQixBQUNyQjtBLHVDQUVHOztBLFVBQW1CLEFBQ3JCO2FBQU8sS0FBQSxBQUFLLE9BQVosQUFBTyxBQUFZLEFBQ3BCO0EsdUNBRUc7O0EsVUFBYyxBQUNoQjthQUFPLE9BQUEsQUFBTyxVQUFQLEFBQWlCLGVBQWpCLEFBQWdDLEtBQUssS0FBckMsQUFBMEMsUUFBakQsQUFBTyxBQUFrRCxBQUMxRDtBLHlDQUVLOztBLFlBQXlCLEFBQzdCO1dBQUEsQUFBSyxTQUFTLE9BQUEsQUFBTyxPQUFQLEFBQWMsSUFBSSxLQUFsQixBQUF1QixRQUFyQyxBQUFjLEFBQStCLEFBQzlDO0EsMENBRU07O0EsVUFBdUIsQUFDNUI7YUFBTyxPQUFPLEtBQUEsQUFBSyxPQUFuQixBQUFjLEFBQVksQUFDM0I7QSx1Q0FFYzs7QUFDYjthQUFPLEtBQVAsQUFBWSxBQUNiO0EsOEMsQUE3QmtCOzs7Ozs7QSxBQ0RBLHdCQUVuQjs7dUJBQWM7O0FBQUEsY0FFZCxHQUZjLEFBQUUsQUFFd0IsMkRBRXBDOztBLFFBQXFCLEFBQ3ZCO2FBQU8sT0FBQSxBQUFPLFVBQVAsQUFBaUIsZUFBakIsQUFBZ0MsS0FBSyxLQUFyQyxBQUEwQyxZQUFqRCxBQUFPLEFBQXNELEFBQzlEO0EsdUNBRUc7O0EsUUFBaUIsQUFDbkI7YUFBTyxLQUFBLEFBQUssV0FBWixBQUFPLEFBQWdCLEFBQ3hCO0EsdUNBRUs7O0FBQ0o7YUFBTyxLQUFQLEFBQVksQUFDYjtBLHdDQUVJOztBLFEsQUFBWSxPQUFrQixBQUNqQztXQUFBLEFBQUssV0FBTCxBQUFnQixNQUFoQixBQUFzQixBQUN2QjtBLDBDQUVNOztBLFFBQWtCLEFBQ3ZCO1VBQUksT0FBQSxBQUFPLFVBQVAsQUFBaUIsZUFBakIsQUFBZ0MsS0FBSyxLQUFyQyxBQUEwQyxZQUE5QyxBQUFJLEFBQXNELEtBQUssQUFDN0Q7ZUFBTyxLQUFBLEFBQUssV0FBWixBQUFPLEFBQWdCLEFBQ3hCO0FBQ0Y7QSw2Q0FFaUI7O0FBQ2hCO1dBQUEsQUFBSyxhQUFMLEFBQWtCLEFBQ25CO0EsUSx5QyxBQTlCa0I7Ozt5d0IsQUNIQSxvQkFNbkI7Ozs7OzttQkFBYyxtQ0FMZCxBQUtjLFFBTE4sQUFLTSxRQUpkLEFBSWMsa0JBSkksQUFJSixpREFIZCxBQUdjLFlBSEYsQ0FBQSxBQUFDLEtBQUQsQUFBTSxBQUdKLGNBRmQsQUFFYyxZQUZGLFlBQU0sQUFBRSxDQUVOLEFBQ1o7U0FBQSxBQUFLLE1BQUwsQUFBVyxTQUFYLEFBQW9CLEFBQ3BCO1NBQUEsQUFBSyxNQUFMLEFBQVcsUUFBWCxBQUFtQixBQUNuQjtTQUFBLEFBQUssTUFBTCxBQUFXLFFBQVgsQUFBbUIsQUFDbkI7U0FBQSxBQUFLLE1BQUwsQUFBVyxXQUFYLEFBQXNCLEFBQ3RCO1NBQUEsQUFBSyxNQUFMLEFBQVcsUUFBUSxLQUFuQixBQUF3QixBQUN4QjtTQUFBLEFBQUssTUFBTCxBQUFXLE9BQU8sS0FBbEIsQUFBdUIsQUFDeEI7QSxxREFFRTs7QSxTLEFBQWEsSUFBb0IsQUFDbEM7VUFBSSxPQUFBLEFBQU8sT0FBWCxBQUFtQixZQUFZLE1BQU0sSUFBQSxBQUFJLE1BQVYsQUFBTSxBQUFVLEFBQy9DO1VBQUksS0FBQSxBQUFLLFFBQVQsQUFBSSxBQUFhLE1BQU0sS0FBQSxBQUFLLElBQUwsQUFBUyxLQUFULEFBQWMsQUFDdEM7QSx3Q0FFSTs7QSxTLEFBQWEsTUFBVyxBQUMzQjtVQUFJLEtBQUEsQUFBSyxVQUFMLEFBQWUsUUFBZixBQUF1QixPQUFPLENBQWxDLEFBQW1DLEdBQUcsQUFDcEM7YUFBQSxBQUFLLHNCQUFMLEFBQWMsdUNBQWQsQUFBc0IsQUFDdkI7QUFGRCxhQUVPLEFBQ0w7WUFBTSxPQUFPLEtBQUEsQUFBSyxRQUFsQixBQUFhLEFBQWEsQUFDMUI7WUFBTSxPQUFPLEtBQUEsQUFBSyxRQUFsQixBQUFhLEFBQWEsQUFFMUI7O1lBQUksS0FBQSxBQUFLLE1BQVQsQUFBSSxBQUFXLE9BQU8sQUFDcEI7Y0FBTSxLQUFLLEtBQUEsQUFBSyxNQUFMLEFBQVcsTUFBWCxBQUFpQixTQUFTLEtBQXJDLEFBQTBDLEFBQzFDO2FBQUEsQUFBRyxLQUFILEFBQVEsTUFBUixBQUFjLEFBQ2Y7QUFDRjtBQUVEOztXQUFBLEFBQUssU0FBTCxBQUFjLEtBQWQsQUFBbUIsS0FBbkIsQUFBd0IsQUFDekI7QSw0Q0FFUTs7QSxTLEFBQWEsVyxBQUFtQixNQUFXLEFBQ2xEO1VBQUksS0FBQSxBQUFLLE1BQUwsQUFBVyxTQUFmLEFBQUksQUFBb0IsTUFBTSxBQUM1QjthQUFBLEFBQUssTUFBTCxBQUFXLFNBQVgsQUFBb0IsS0FBcEIsQUFBeUIsS0FBekIsQUFBOEIsTUFBOUIsQUFBb0MsV0FBcEMsQUFBK0MsQUFDaEQ7QUFDRjtBLHVDQUVHOztBLFMsQUFBYSxJQUFvQixBQUNuQztVQUFJLEtBQUEsQUFBSyxVQUFMLEFBQWUsUUFBZixBQUF1QixPQUFNLENBQWpDLEFBQWtDLEdBQUcsQUFDbkM7YUFBQSxBQUFLLE1BQUwsQUFBVyxTQUFYLEFBQW9CLE9BQXBCLEFBQTJCLEFBQzVCO0FBRkQsYUFFTyxBQUNMO1lBQU0sT0FBTyxLQUFBLEFBQUssUUFBbEIsQUFBYSxBQUFhLEFBQzFCO1lBQU0sT0FBTyxLQUFBLEFBQUssUUFBbEIsQUFBYSxBQUFhLEFBQzFCO2FBQUEsQUFBSyxNQUFMLEFBQVcsTUFBWCxBQUFpQixRQUFqQixBQUF5QixBQUMxQjtBQUNGO0EsdUNBRUc7O0EsU0FBYSxBQUNmO1VBQUksQUFDRjtZQUFNLE9BQU8sSUFBQSxBQUFJLE1BQWpCLEFBQWEsQUFBVSxBQUN2QjtlQUFPLEtBQUEsQUFBSyxTQUFMLEFBQWMsSUFBSSxDQUFDLENBQUUsS0FBQSxBQUFLLE1BQU0sS0FBWCxBQUFXLEFBQUssSUFBSSxLQUF6QyxBQUFxQixBQUFvQixBQUFLLE1BQU0sQ0FBQyxDQUFFLEtBQUEsQUFBSyxNQUFMLEFBQVcsU0FBUyxLQUFsRixBQUE4RCxBQUFvQixBQUFLLEFBQ3hGO0FBSEQsUUFHRSxPQUFBLEFBQU0sR0FBRyxBQUNUO2VBQUEsQUFBTyxBQUNSO0FBQ0Y7QSwyQ0FFTzs7QSxTQUFxQixBQUMzQjthQUFPLElBQUEsQUFBSSxNQUFKLEFBQVUsWUFBakIsQUFBTyxBQUFzQixBQUM5QjtBLDJDQUVPOztBLFNBQXFCLEFBQzNCO2FBQU8sSUFBQSxBQUFJLE1BQUosQUFBVSx3QkFBakIsQUFBTyxBQUFrQyxBQUMxQztBLDJDQUVPOztBLFNBQWEsQUFDbkI7YUFBTyxLQUFBLEFBQUssZ0JBQUwsQUFBcUIsS0FBckIsQUFBMEIsUUFBUSxLQUFBLEFBQUssVUFBTCxBQUFlLFFBQWYsQUFBdUIsT0FBTSxDQUF0RSxBQUF1RSxBQUN4RTtBLDZDLEFBdkVrQjs7OzJFQ0FyQixnQzs7QUFFQSxPQUFBLEFBQU8sd0I7Ozs7Ozs7QUNFUCx3QztBQUNBLG1EO0FBQ0Esa0M7QUFDQSxpQztBQUNBOzs7Ozs7O0FBT0Esc0Q7Ozs7Ozs7Ozs7QUFVQSxJQUFJLG9CQUFlLEFBQ2pCO0FBRUE7O1FBQUEsQUFBTSxPQUFOLEFBQWEsQUFDYjtRQUFBLEFBQU0sT0FBTixBQUFhLEFBRWI7O1dBQUEsQUFBUyxNQUFULEFBQWUsUUFBaUIsQUFDOUI7aUJBQUEsQUFBYSxLQUFiLEFBQWtCLE1BQWxCLEFBQXdCLEFBQ3pCO0FBRUQ7O1dBQUEsQUFBUyxhQUFULEFBQXNCLFFBQVEsQUFDNUI7U0FBQSxBQUFLLEFBQ0w7U0FBQSxBQUFLLEFBQ0w7U0FBQSxBQUFLLFVBQUwsQUFBZSxBQUNmO1NBQUEsQUFBSyxVQUFMLEFBQWUsQUFDZjtTQUFBLEFBQUssV0FBTCxBQUFnQixBQUNoQjtTQUFBLEFBQUssU0FBUyxxQkFBZCxBQUFjLEFBQVcsQUFDekI7U0FBQSxBQUFLLCtCQUNIO1NBRGEsQUFDUixBQUNMLE1BRmE7K0JBRUksS0FGbkIsQUFBZSxBQUViLEFBQXNCLEFBRXhCOztTQUFBLEFBQUssUUFBUSxZQUFiLEFBQ0E7U0FBQSxBQUFLLFlBQVksZ0JBQWpCLEFBQ0E7U0FBQSxBQUFLLFVBQVUsS0FBQSxBQUFLLE9BQUwsQUFBWSxJQUEzQixBQUFlLEFBQWdCLEFBQ2hDO0FBRUQ7O1FBQUEsQUFBTSxVQUFOLEFBQWdCLE1BQU0sVUFBQSxBQUFTLE1BQXdCLEFBQ3JEO1FBQUksQ0FBQyxZQUFBLEFBQVksS0FBWixBQUFpQixNQUF0QixBQUFLLEFBQXVCLE9BQU8sT0FBQSxBQUFPLEFBRTFDOztRQUFNLEtBQUssU0FBQSxBQUFTLEtBQVQsQUFBYyxNQUF6QixBQUFXLEFBQW9CLEFBRS9COztRQUFJLE1BQU0sS0FBTixBQUFXLFdBQVcsS0FBQSxBQUFLLFlBQS9CLEFBQTJDLE1BQU0sQUFDL0M7V0FBQSxBQUFLLEFBQ047QUFFRDs7V0FBQSxBQUFPLEFBQ1I7QUFWRCxBQVlBOztRQUFBLEFBQU0sVUFBTixBQUFnQixPQUFPLFlBQVcsQUFDaEM7UUFBSSxLQUFKLEFBQVMsU0FBUyxBQUNoQjtjQUFBLEFBQVEsSUFBUixBQUFZLEFBQ1o7Z0JBQUEsQUFBVSxLQUFWLEFBQWUsQUFDZjthQUFPLFVBQUEsQUFBVSxLQUFqQixBQUFPLEFBQWUsQUFDdkI7QUFDRDtZQUFBLEFBQVEsSUFBUixBQUFZLEFBQ1o7U0FBQSxBQUFLLEFBQ047QUFSRCxBQVVBOztRQUFBLEFBQU0sVUFBTixBQUFnQixRQUFRLFlBQW9CLEFBQzFDO0FBQ0E7U0FBQSxBQUFLLFVBQUwsQUFBZSxBQUVmOztBQUNBO2lCQUFBLEFBQWEsS0FBYixBQUFrQixBQUVsQjs7QUFDQTtTQUFBLEFBQUssVUFBVSxjQUFBLEFBQWMsS0FBZCxBQUFtQixRQUFsQyxBQUEwQyxBQUMxQztZQUFBLEFBQVEsSUFBUixBQUFZLGVBQWUsS0FBM0IsQUFBZ0MsQUFDaEM7V0FBTyxLQUFQLEFBQVksQUFDYjtBQVhELEFBYUE7O1FBQUEsQUFBTSxVQUFOLEFBQWdCLE9BQU87WUFDckIsQUFBUSxJQUFSLEFBQVksQUFDWjtTQUFBLEFBQUssVUFGMkIsQUFFaEMsQUFBZSxLQUZpQixBQUNoQyxDQUNxQixBQUN0QjtBQUhELEFBS0E7O1FBQUEsQUFBTSxVQUFOLEFBQWdCLFlBQVksWUFBVyxBQUNyQztZQUFBLEFBQVEsSUFBUixBQUFZLEFBQ1o7Y0FBQSxBQUFVLEtBQVYsQUFBZSxBQUNoQjtBQUhELEFBS0E7O1FBQUEsQUFBTSxVQUFOLEFBQWdCLFNBQVMsVUFBQSxBQUFTLFNBQWlCLEFBQ2pEO1FBQUksRUFBRSxXQUFXLEtBQWpCLEFBQUksQUFBa0IsV0FBVyxBQUMvQjtXQUFBLEFBQUssaUJBQUwsQUFBc0IsQUFDdEI7V0FBQSxBQUFLLFNBQUwsQUFBYyxXQUFXLGtCQUF6QixBQUF5QixBQUFNLEFBQ2hDO0FBRUQ7O1dBQU8sS0FBQSxBQUFLLFNBQVosQUFBTyxBQUFjLEFBQ3RCO0FBUEQsQUFTQTs7UUFBQSxBQUFNLFVBQU4sQUFBZ0IsVUFBVSxVQUFBLEFBQVMsTUFBYyxBQUMvQztRQUFJLENBQUMsS0FBQSxBQUFLLFNBQVYsQUFBSyxBQUFjLE9BQU8sQUFDeEI7WUFBTSxJQUFBLEFBQUksd0JBQUosQUFBeUIsT0FBL0IsQUFDRDtBQUVEOztXQUFPLEtBQUEsQUFBSyxTQUFaLEFBQU8sQUFBYyxBQUN0QjtBQU5ELEFBUUE7O1FBQUEsQUFBTSxVQUFOLEFBQWdCLFVBQVUsWUFBb0IsQUFDNUM7V0FBTyxLQUFBLEFBQUssVUFBWixBQUFzQixBQUN2QjtBQUZELEFBSUE7O1FBQUEsQUFBTSxVQUFOLEFBQWdCLFFBQVEsWUFBeUIsQUFDL0M7V0FBTyx1QkFBQSxBQUF1QixLQUF2QixBQUE0QixNQUFuQyxBQUF5QyxBQUMxQztBQUZELEFBSUE7O1FBQUEsQUFBTSxVQUFOLEFBQWdCLGFBQWEsVUFBQSxBQUFTLEtBQTJCLEFBQy9EO1dBQU8sdUJBQUEsQUFBdUIsS0FBdkIsQUFBNEIsTUFBNUIsQUFBa0MsT0FBTyxxQkFBSyxFQUFBLEFBQUUsUUFBUCxBQUFlLElBQXhELEdBQVAsQUFBb0UsQUFDckU7QUFGRCxBQUlBOztRQUFBLEFBQU0sVUFBTixBQUFnQixRQUFRLFlBQWlCLEFBQ3ZDO1FBQUksS0FBSixBQUFTLGdCQUFnQixBQUN2QjtXQUFBLEFBQUssUUFBTCxBQUFhLE1BQU0sS0FBbkIsQUFBd0IsQUFDekI7QUFDRjtBQUpELEFBTUE7O1FBQUEsQUFBTSxVQUFOLEFBQWdCLGFBQWEsVUFBQSxBQUFTLEtBQW1CLGFBQ3ZEO0FBQ0c7QUFESCxTQUFBLEFBQ1EsQUFDTDtBQUZILEFBR0c7QUFISCxXQUdVLHNCQUFBLEFBQWUsS0FIekIsQUFHVSxBQUFvQixBQUMzQjtBQUpILFlBSVcscUJBQUssR0FBQSxBQUFHLFlBQUgsQUFBYyxPQUFPLEVBQTFCLEFBQUssQUFBdUIsS0FKdkMsQUFLRDtBQU5ELEFBUUE7O1FBQUEsQUFBTSxVQUFOLEFBQWdCLE1BQU0sVUFBQSxBQUFTLElBQXFCLEFBQ2xEO1dBQU8sdUJBQUEsQUFBdUIsS0FBdkIsQUFBNEIsTUFBNUIsQUFBa0MsVUFBVSxxQkFBSyxFQUFBLEFBQUUsUUFBUCxBQUFlLEdBQTNELEtBQWlFLENBQXhFLEFBQXlFLEFBQzFFO0FBRkQsQUFJQTs7UUFBQSxBQUFNLFVBQU4sQUFBZ0IsV0FBVyxVQUFBLEFBQVMsS0FBc0IsQUFDeEQ7V0FBTyx1QkFBQSxBQUF1QixLQUF2QixBQUE0QixNQUE1QixBQUFrQyxVQUFVLHFCQUFLLEVBQUEsQUFBRSxRQUFQLEFBQWUsSUFBM0QsS0FBa0UsQ0FBekUsQUFBMEUsQUFDM0U7QUFGRCxBQUlBOztRQUFBLEFBQU0sVUFBTixBQUFnQixhQUFhLFVBQUEsQUFBUyxLQUFtQixBQUN2RDtTQUFBLEFBQUssVUFBTCxBQUFlLEFBQ2Y7U0FBQSxBQUFLLE9BQUwsQUFBWSxJQUFaLEFBQWdCLFdBQWhCLEFBQTJCLEFBQzVCO0FBSEQsQUFLQTs7UUFBQSxBQUFNLFVBQU4sQUFBZ0IsV0FBVyxVQUFBLEFBQVMsS0FBbUIsQUFDckQ7U0FBQSxBQUFLLE9BQUwsQUFBWSxJQUFaLEFBQWdCLFNBQWhCLEFBQXlCLEFBQzFCO0FBRkQsQUFJQTs7UUFBQSxBQUFNLFVBQU4sQUFBZ0IsWUFBWSxVQUFBLEFBQVMsS0FBbUIsQUFDdEQ7U0FBQSxBQUFLLE9BQUwsQUFBWSxJQUFaLEFBQWdCLFVBQWhCLEFBQTBCLEFBQzNCO0FBRkQsQUFJQTs7UUFBQSxBQUFNLFVBQU4sQUFBZ0IsZUFBZSxVQUFBLEFBQVMsS0FBbUIsQUFDekQ7U0FBQSxBQUFLLE9BQUwsQUFBWSxJQUFaLEFBQWdCLGFBQWhCLEFBQTZCLEFBQzlCO0FBRkQsQUFJQTs7UUFBQSxBQUFNLFVBQU4sQUFBZ0IsS0FBSyxVQUFBLEFBQVMsS0FBVCxBQUFzQixJQUFvQixLQUM3RDttQkFBQSxBQUFLLE9BQUwsQUFBVyxpQkFBWCxBQUFpQixBQUNsQjtBQUZELEFBSUE7O1FBQUEsQUFBTSxVQUFOLEFBQWdCLFFBQVEsVUFBQSxBQUFTLElBQW9CLEFBQ25EO1NBQUEsQUFBSyxNQUFMLEFBQVcsR0FBWCxBQUFjLFNBQWQsQUFBdUIsQUFDeEI7QUFGRCxBQUlBOztRQUFBLEFBQU0sV0FBVyxVQUFBLEFBQVMsTUFBbUIsQUFDM0M7UUFBSSxFQUFFLGdCQUFOLEFBQUksQUFBa0IsUUFBUSxBQUM1QjtZQUFNLElBQUEsQUFBSSxNQUFWLEFBQU0sQUFBVSxBQUNqQjtBQUVEOztVQUFBLEFBQU0sZUFBTixBQUFxQixBQUNyQjtVQUFBLEFBQU0sT0FBTixBQUFhLEFBQ2Q7QUFQRCxBQVNBOztXQUFBLEFBQVMseUJBQXlCLEFBQ2hDOztBQUFPLFNBQUEsQUFDQyxBQUNMO0FBRkksQUFHSixPQUhJLEFBQ0o7QUFESSxXQUdHLDRCQUFBLEFBQXFCLEtBQUssQ0FIcEMsQUFBTyxBQUdHLEFBQTBCLEFBQUMsQUFDdEM7QUFFRDs7V0FBQSxBQUFTLGVBQVQsQUFBd0IsTUFBeEIsQUFBcUMsTUFBYyxBQUNqRDtRQUFJLFNBQUosQUFBYSxNQUFNLEFBQ2pCO1dBQUEsQUFBSyxNQUFMLEFBQVcsS0FBUSxLQUFuQixBQUF3QixZQUF4QixBQUErQixNQUEvQixBQUF1QyxBQUN2QztXQUFBLEFBQUssTUFBTCxBQUFXLEtBQVEsS0FBbkIsQUFBd0IsWUFBeEIsQUFBaUMsQUFDbEM7QUFDRjtBQUVEOztXQUFBLEFBQVMsS0FBSyxBQUNaO1dBQU8sS0FBQSxBQUFLLFFBQUwsQUFBYSxRQUFRLEtBQTVCLEFBQU8sQUFBMEIsQUFDbEM7QUFFRDs7V0FBQSxBQUFTLFNBQVQsQUFBa0IsTUFBYSxBQUM3QjtXQUFPLEdBQUEsQUFBRyxLQUFILEFBQVEsTUFBUixBQUFjLEtBQXJCLEFBQU8sQUFBbUIsQUFDM0I7QUFFRDs7V0FBQSxBQUFTLFNBQVQsQUFBa0IsTUFBYSxBQUM3QjtXQUFPLEdBQUEsQUFBRyxLQUFILEFBQVEsTUFBUixBQUFjLEtBQUssY0FBMUIsQUFBTyxBQUFtQixBQUFjLEFBQ3pDO0FBRUQ7O1dBQUEsQUFBUyxjQUFULEFBQXVCLE1BQWEsQUFDbEM7U0FBQSxBQUFLLFdBQVcsS0FBQSxBQUFLLFlBQXJCLEFBQWlDLEFBRWpDOztRQUFJLE1BQU0sS0FBVixBQUFJLEFBQVcsV0FBVyxLQUFBLEFBQUssV0FBTCxBQUFnQixBQUUxQzs7V0FBQSxBQUFPLEFBQ1I7QUFFRDs7V0FBQSxBQUFTLGdCQUF3QixBQUMvQjtRQUFNLFVBQVUsS0FBQSxBQUFLLE9BQUwsQUFBWSxJQUE1QixBQUFnQixBQUFnQixBQUNoQztXQUFRLEtBQUEsQUFBSyxpQkFBaUIsV0FBVyxZQUFBLEFBQVksS0FBdkIsQUFBVyxBQUFpQixPQUExRCxBQUE4QixBQUFtQyxBQUNsRTtBQUVEOztXQUFBLEFBQVMsU0FBVCxBQUFrQixNQUFlLEFBQy9CO1dBQU8sR0FBQSxBQUFHLEtBQUgsQUFBUSxNQUFSLEFBQWMsT0FBTyxLQUFyQixBQUEwQixLQUFLLEVBQUUsUUFBeEMsQUFBTyxBQUErQixBQUFVLEFBQ2pEO0FBRUQ7O1dBQUEsQUFBUyxXQUFULEFBQW9CLElBQXFCLEFBQ3ZDO1dBQU8sR0FBQSxBQUFHLEtBQUgsQUFBUSxNQUFSLEFBQWMsT0FBckIsQUFBTyxBQUFxQixBQUM3QjtBQUVEOztXQUFBLEFBQVMsY0FBb0IsS0FDM0I7UUFBTSxPQUFOLEFBQW9CLEFBQ3BCO1FBQU07QUFBYyxRQUFBLEFBQ2pCLENBRGlCLEFBQ1osQUFDTDtBQUZpQixBQUdqQjtBQUhILEFBQW9CLEFBS3BCOztRQUFJLFNBQUosQUFBYSxXQUFXLEFBQ3RCO2NBQUEsQUFBUSxZQUFVLEtBQWxCLEFBQXVCLGlCQUN2QjtnQkFBQSxBQUFVLEtBQVYsQUFBZSxBQUNmO0FBQ0Q7QUFFRDs7UUFBSSxDQUFDLEtBQUEsQUFBSyxVQUFMLEFBQWUsSUFBSSxLQUF4QixBQUFLLEFBQXdCLFVBQVUsQUFDckM7Y0FBQSxBQUFRLEtBQUssS0FBQSxBQUFLLFVBQWxCLEFBQTRCLEFBQzdCO0FBRUQ7O1FBQU0sTUFBWSxLQUFBLEFBQUssVUFBTCxBQUFlLElBQUksS0FBckMsQUFBa0IsQUFBd0IsQUFDMUM7UUFBTSxjQUE0QixJQUFJLElBQXRDLEFBQWtDLEFBQVEsQUFFMUM7O0FBQ0E7YUFBQSxBQUFTLEtBQVQsQUFBYyxNQUFkLEFBQW9CLEFBRXBCOztBQUNBO3VCQUFBLEFBQW1CLEtBQW5CLEFBQXdCLE1BQXhCLEFBQThCLFVBQTlCLEFBQXdDLGFBQWEsS0FBckQsQUFBMEQsQUFFMUQ7O0FBQ0E7bUJBQUEsQUFBZSxLQUFmLEFBQW9CLE1BQXBCLEFBQTBCLE1BQTFCLEFBQWdDLEFBRWhDOztBQUNBO1FBQU0sZUFBZSxPQUFBLEFBQU8sT0FBTyxJQUFBLEFBQUksUUFBdkMsQUFBcUIsQUFBMEIsQUFFL0M7O0FBQ0E7dUNBQUEsQUFBWSxBQUNUO0FBREgscUNBQUEsQUFDUSxhQUFhLEtBRHJCLEFBQzBCLGdDQUQxQixBQUNtQyxBQUNoQztBQUZILFNBRVEsWUFBQSxBQUFZLEtBQVosQUFBaUIsTUFBakIsQUFBdUIsTUFBdkIsQUFBNkIsYUFBN0IsQUFBMEMsS0FGbEQsQUFFUSxBQUErQyxBQUNwRDtBQUhILFVBR1Msa0JBQUEsQUFBa0IsS0FBbEIsQUFBdUIsTUFBdkIsQUFBNkIsTUFBN0IsQUFBbUMsYUFBbkMsQUFBZ0QsS0FIekQsQUFHUyxBQUFxRCxBQUMvRDtBQUVEOztXQUFBLEFBQVMsWUFBVCxBQUFxQixNQUFyQixBQUFrQyxLQUE2QixBQUM3RDtRQUFNLE9BQU4sQUFBb0IsQUFDcEI7V0FBTyxVQUFBLEFBQVMsUUFBaUIsQUFDL0I7VUFBQSxBQUFJLFFBQVEsQUFDVjt1QkFBQSxBQUFlLEtBQWYsQUFBb0IsTUFBcEIsQUFBMEIsTUFBMUIsQUFBZ0MsQUFDakM7QUFGRCxhQUVPLEFBQ0w7cUJBQUEsQUFBYSxLQUFiLEFBQWtCLE1BQWxCLEFBQXdCLE1BQXhCLEFBQThCLEFBQy9CO0FBRUQ7O0FBQ0E7eUJBQUEsQUFBbUIsS0FBbkIsQUFBd0IsTUFBeEIsQUFBOEIsU0FBOUIsQUFBdUMsS0FBSyxLQUE1QyxBQUFpRCxBQUVqRDs7QUFDQTtxQkFBQSxBQUFlLEtBQWYsQUFBb0IsTUFBcEIsQUFBMEIsTUFBMUIsQUFBZ0MsQUFFaEM7O0FBQ0E7V0FBQSxBQUFLLEFBQ047QUFmRCxBQWdCRDtBQUVEOztXQUFBLEFBQVMsa0JBQVQsQUFBMkIsTUFBM0IsQUFBd0MsS0FBNkIsY0FDbkU7V0FBTyxVQUFBLEFBQUMsUUFBb0IsQUFDMUI7aUJBQUEsQUFBVyxhQUFXLEtBQXRCLEFBQTJCLEFBRTNCOzthQUFBLEFBQUssTUFBTCxBQUFXLEtBQVgsQUFBZ0IsU0FBaEIsQUFBeUIsQUFFekI7O2FBQUEsQUFBSyxBQUNOO0FBTkQsQUFPRDtBQUVEOztXQUFBLEFBQVMsQUFDUDtBQURGLEFBRUU7QUFGRixBQUdFO0FBSEYsQUFJUTtBQUNOO1FBQUksQ0FBQyxzQkFBQSxBQUFVLEtBQWYsQUFBSyxBQUFlLE9BQU8sQUFFM0I7O1FBQUksUUFBQSxBQUFRLFlBQVksdUJBQVcsSUFBbkMsQUFBd0IsQUFBZSxTQUFTLEFBQzlDO1VBQUEsQUFBSSxPQUFKLEFBQVcsS0FBWCxBQUFnQixLQUFoQixBQUFxQixBQUN0QjtBQUZELFdBRU8sSUFBSSxRQUFBLEFBQVEsV0FBVyx1QkFBVyxJQUFsQyxBQUF1QixBQUFlLFFBQVEsQUFDbkQ7VUFBQSxBQUFJLE1BQUosQUFBVSxLQUFWLEFBQWUsS0FBZixBQUFvQixBQUNyQjtBQUNGO0FBRUQ7O1dBQUEsQUFBUyxZQUFrQixBQUN6QjtTQUFBLEFBQUssVUFBTCxBQUFlLEFBQ2hCO0FBRUQ7O1dBQUEsQUFBUyxZQUFrQixBQUN6QjtTQUFBLEFBQUssQUFFTDs7UUFBSSxLQUFKLEFBQVMsZ0JBQWdCLEFBQ3ZCO0FBQ0E7V0FBQSxBQUFLLGlCQUFpQixhQUFhLEtBQW5DLEFBQXNCLEFBQWtCLEFBQ3pDO0FBQ0Y7QUFFRDs7V0FBQSxBQUFTLGVBQVQsQUFBd0IsTUFBeEIsQUFBcUMsS0FBeUIsQUFDNUQ7ZUFBQSxBQUFXLEtBQVgsQUFBZ0IsTUFBTSxLQUF0QixBQUEyQixBQUM1QjtBQUVEOztXQUFBLEFBQVMsYUFBVCxBQUFzQixNQUF0QixBQUFtQyxLQUE0QixBQUM3RDtBQUNBO21CQUFBLEFBQWUsS0FBZixBQUFvQixNQUFwQixBQUEwQixNQUExQixBQUFnQyxBQUVoQzs7QUFDQTtRQUFJLGFBQW9CLFlBQUEsQUFBWSxLQUFaLEFBQWlCLE1BQWpCLEFBQXVCLE1BQS9DLEFBQXdCLEFBQTZCLEFBRXJEOztBQUNBO2VBQUEsQUFBVyxTQUFYLEFBQW9CLEFBRXBCOztXQUFPLEdBQUEsQUFBRyxLQUFILEFBQVEsTUFBUixBQUFjLE9BQU8sS0FBckIsQUFBMEIsS0FBakMsQUFBTyxBQUErQixBQUN2QztBQUVEOztXQUFBLEFBQVMsWUFBVCxBQUFxQixNQUFzQixBQUN6QztRQUFJLFFBQUEsQUFBTyw2Q0FBUCxBQUFPLFdBQVAsQUFBZ0IsWUFBWSxLQUFBLEFBQUssV0FBckMsQUFBZ0QsTUFBTSxPQUFBLEFBQU8sQUFFN0Q7O1dBQU8sS0FBQSxBQUFLLFNBQVMsS0FBZCxBQUFtQixPQUExQixBQUFpQyxBQUNsQztBQUVEOztXQUFBLEFBQVMsWUFBVCxBQUFxQixNQUFyQixBQUFrQyxLQUEwQixBQUMxRDtRQUFJLEVBQUUsV0FBTixBQUFJLEFBQWEsTUFBTSxBQUNyQjtVQUFBLEFBQUksUUFBSixBQUFZLEFBQ2I7QUFFRDs7UUFBSSxFQUFFLFdBQU4sQUFBSSxBQUFhLE9BQU8sQUFDdEI7V0FBQSxBQUFLLFFBQUwsQUFBYSxBQUNiO1dBQUEsQUFBSyxRQUFRLElBQWIsQUFBaUIsQUFDbEI7QUFFRDs7TUFBRSxLQUFGLEFBQU8sQUFFUDs7UUFBSSxLQUFBLEFBQUssU0FBUyxJQUFsQixBQUFzQixPQUFPLEFBQzNCO1dBQUEsQUFBSyxVQUFMLEFBQWUsQUFDaEI7QUFFRDs7V0FBQSxBQUFPLEFBQ1I7QUFFRDs7V0FBQSxBQUFTLGVBQXFCLEFBQzVCO1FBQUksTUFBSixBQUFVLGNBQWMsQUFFeEI7O1FBQU0sT0FBTyxNQUFBLEFBQU0sUUFBbkIsQUFBMkIsR0FIQyxzR0FLNUI7OzJCQUFBLEFBQWtCLGtJQUFNLEtBQWIsQUFBYSxZQUN0QjtZQUFNLFVBQVUsSUFBQSxBQUFJLFFBQXBCLEFBQWdCLEFBQVksV0FETixJQUVNO2dCQUFBLEFBQVEsTUFGZCxBQUVNLEFBQWMsaUZBRnBCLEFBRWYsaUNBRmUsQUFFRix1QkFDcEI7WUFBQSxBQUFJLE1BQU0sS0FBQSxBQUFLLFVBQUwsQUFBZSxLQUFmLEFBQW9CLE1BQXBCLEFBQTBCLEFBQ3JDO0FBVDJCLHVOQVc1Qjs7VUFBQSxBQUFNLGVBQU4sQUFBcUIsQUFDdEI7QUFFRDs7U0FBQSxBQUFPLEFBQ1I7QUFwV0QsQUFBWSxDQUFDLEc7O0EsQUFzV0U7Ozs7O0FDN1hmLG1DO0FBQ0Esc0Q7Ozs7QUFJQSxrQztBQUNBLGdDOztBLEFBRXFCLDZCQUtuQjs7Ozs7MEJBQUEsQUFBWSxRQUFaLEFBQTZCLFNBQW1CLHVCQUM5QztTQUFBLEFBQUssVUFBTCxBQUFlLEFBQ2Y7U0FBQSxBQUFLLFNBQUwsQUFBYyxBQUNmO0EsbUVBRU87O0EsVUFBOEIsQUFDcEM7V0FBQSxBQUFLLGlCQUFMLEFBQXNCLEFBQ3RCO2FBQUEsQUFBTyxBQUNSO0EseUNBRW1COztBQUNsQjtVQUFNLE1BQU0sS0FBQSxBQUFLLE1BQUwsQUFBVyxjQUF2QixBQUNBO1VBQU0sUUFBUSx1QkFBQSxBQUFRLEtBQXRCLEFBQWMsQUFBYSxBQUMzQjtvQkFBTyxBQUFPLEtBQVAsQUFBWSxBQUNoQjtBQURJLFNBQUEsQ0FDQSx1QkFBTyxTQUFQLEFBQU8sQUFBUyxLQURoQixBQUVKO0FBRkksV0FFQyxVQUFBLEFBQUMsR0FBRCxBQUFJLFdBQU0sSUFBVixBQUFjLEVBRmYsQUFHSjtBQUhJLGFBR0csS0FBQSxBQUFLLFlBSFIsQUFHRyxBQUFpQixRQUgzQixBQUFPLEFBRzRCLEFBQ3BDO0Esd0NBRUk7O0EsVUFBK0IsQUFDbEM7VUFBSSxBQUNGO0FBQ0E7WUFBTSxRQUFpQixLQUFBLEFBQUssUUFBTCxBQUFhLElBQUksS0FBeEMsQUFBdUIsQUFBc0IsQUFFN0M7O0FBQ0E7QUFDQTtZQUFJLEtBQUosQUFBSSxBQUFLLGNBQWMsQUFDckI7a0JBQUEsQUFBUSxLQUVKOztlQUZKLEFBRVMsaUJBQ2U7ZUFBQSxBQUFLLE9BQUwsQUFBWSxJQUhwQyxBQUd3QixBQUFnQixBQUV4Qzs7aUJBQUEsQUFBTyxBQUNSO0FBRUQ7O0FBQ0E7QUFDQTtlQUFPLEtBQUEsQUFBSyxZQUFaLEFBQU8sQUFBaUIsQUFFeEI7O0FBQ0E7Y0FBQSxBQUFNLEtBQU4sQUFBVyxBQUVYOztBQUNBO2FBQUEsQUFBSyxRQUFMLEFBQWEsSUFBSSxLQUFqQixBQUFzQixnQkFBZ0IsS0FBQSxBQUFLLFVBQTNDLEFBQXNDLEFBQWUsQUFFckQ7O2VBQU8sS0FBUCxBQUFZLEFBQ2I7QUExQkQsUUEwQkUsT0FBQSxBQUFPLEdBQUcsQUFDVjtlQUFBLEFBQU8sQUFDUjtBQUNGO0EsMENBRU07O0EsUSxBQUFZLFNBQThDLEFBQy9EO1VBQUksQUFDRjtZQUFNLE9BQWMsS0FBcEIsQUFBb0IsQUFBSyxBQUN6QjtZQUFNLFFBQWdCLEtBQUEsQUFBSyxVQUFVLHFCQUFLLEVBQUEsQUFBRSxPQUFQLEFBQWMsR0FBbkQsQUFBc0IsQUFFdEI7O1lBQUksUUFBSixBQUFZLEdBQUcsT0FBQSxBQUFPLEFBRXRCOztBQUNBO2FBQUEsQUFBSyxTQUFTLE9BQUEsQUFBTyxPQUFQLEFBQWMsSUFBSSxLQUFsQixBQUFrQixBQUFLLFFBQXJDLEFBQWMsQUFBK0IsQUFFN0M7O0FBQ0E7YUFBQSxBQUFLLFFBQUwsQUFBYSxJQUFJLEtBQWpCLEFBQXNCLGdCQUFnQixLQUFBLEFBQUssVUFBM0MsQUFBc0MsQUFBZSxBQUVyRDs7ZUFBQSxBQUFPLEFBQ1I7QUFiRCxRQWFFLE9BQUEsQUFBTyxHQUFHLEFBQ1Y7ZUFBQSxBQUFPLEFBQ1I7QUFDRjtBLDBDQUVNOztBLFFBQXFCLEFBQzFCO1VBQUksQUFDRjtZQUFNLE9BQWMsS0FBcEIsQUFBb0IsQUFBSyxBQUN6QjtZQUFNLFFBQWdCLEtBQUEsQUFBSyxVQUFVLHFCQUFLLEVBQUEsQUFBRSxRQUFQLEFBQWUsR0FBcEQsQUFBc0IsQUFFdEI7O1lBQUksUUFBSixBQUFZLEdBQUcsT0FBQSxBQUFPLEFBRXRCOztlQUFPLEtBQVAsQUFBTyxBQUFLLEFBRVo7O2FBQUEsQUFBSyxRQUFMLEFBQWEsQUFDWDthQURGLEFBQ08sQUFDTDthQUFBLEFBQUssVUFBVSxLQUFBLEFBQUssT0FBTyxxQkFBQSxBQUFLLEVBRmxDLEFBRUUsQUFBZSxBQUVqQjs7ZUFBQSxBQUFPLEFBQ1I7QUFiRCxRQWFFLE9BQUEsQUFBTyxHQUFHLEFBQ1Y7ZUFBQSxBQUFPLEFBQ1I7QUFDRjtBLHVDQUVpQjs7QUFDaEI7YUFBTyxLQUFBLEFBQUssUUFBTCxBQUFhLElBQUksS0FBeEIsQUFBTyxBQUFzQixBQUM5QjtBLDhDQUVvQjs7QUFDbkI7YUFBTyxDQUFDLENBQUMsSUFBSSxLQUFMLEFBQUssQUFBSyxZQUFYLEFBQXVCLFNBQXZCLEFBQWdDLFNBQXZDLEFBQU8sQUFBeUMsQUFDakQ7QSwrQ0FFVzs7QSxVQUFvQixBQUM5QjtXQUFBLEFBQUssWUFBWSxLQUFqQixBQUFpQixBQUFLLEFBQ3RCO1dBQUEsQUFBSyxNQUFNLEtBQVgsQUFBVyxBQUFLLEFBQ2hCO2FBQUEsQUFBTyxBQUNSO0EsK0NBRVc7O0EsV0FBZ0IsYUFDMUI7VUFBTSxhQUFhLFNBQWIsQUFBYSxXQUFBLEFBQUMsUUFBRCxBQUFrQixLQUFhLEFBQ2hEO1lBQUksTUFBQSxBQUFLLE9BQUwsQUFBWSxJQUFaLEFBQWdCLGlCQUFwQixBQUFxQyxRQUFRLEFBQzNDO2lCQUFPLE9BQUEsQUFBTyxPQUFPLE1BQUEsQUFBTSxLQUFOLEFBQVcsWUFBaEMsQUFBTyxBQUNSO0FBRkQsZUFFTyxBQUNMO2lCQUFPLE9BQUEsQUFBTyxPQUFPLE1BQUEsQUFBTSxLQUFOLEFBQVcsWUFBaEMsQUFBTyxBQUNSO0FBQ0Y7QUFORCxBQVFBOzthQUFPLFdBQUEsQUFBVyxLQUFsQixBQUFPLEFBQWdCLEFBQ3hCO0EsOENBRXFCOztBQUNwQjtVQUFNLFFBQWdCLEtBQUEsQUFBSyxPQUFMLEFBQVksSUFBbEMsQUFBc0IsQUFBZ0IsQUFDdEM7VUFBTSxRQUFpQixLQUFBLEFBQUssTUFBTCxBQUFXLGNBQWxDLEFBQ0E7YUFBTyxFQUFFLFVBQVUsQ0FBVixBQUFXLEtBQUssUUFBUSxNQUFqQyxBQUFPLEFBQWdDLEFBQ3hDO0EseUNBRUs7O0EsYUFBdUIsQUFDM0I7V0FBQSxBQUFLLFFBQUwsQUFBYSxNQUFiLEFBQW1CLEFBQ3BCO0Esc0QsQUFoSWtCOzs7Ozs7Ozs7QSxBQ0pBLDJCQUluQjs7Ozt3QkFBQSxBQUFZLFFBQWlCLHVCQUMzQjtTQUFBLEFBQUssVUFBTCxBQUFlLEFBQ2Y7U0FBQSxBQUFLLFNBQUwsQUFBYyxBQUNmO0EsNkRBRUc7O0EsU0FBNkIsQUFDL0I7VUFBSSxBQUNGO1lBQU0sT0FBTyxLQUFBLEFBQUssWUFBbEIsQUFBYSxBQUFpQixBQUM5QjtlQUFPLEtBQUEsQUFBSyxJQUFMLEFBQVMsUUFBUSxLQUFBLEFBQUssTUFBTSxLQUFBLEFBQUssUUFBTCxBQUFhLFFBQXpDLEFBQWlCLEFBQVcsQUFBcUIsU0FBeEQsQUFBaUUsQUFDbEU7QUFIRCxRQUdFLE9BQUEsQUFBTSxHQUFHLEFBQ1Q7ZUFBQSxBQUFPLEFBQ1I7QUFDRjtBLHVDQUVHOztBLFMsQUFBYSxPQUFxQixBQUNwQztXQUFBLEFBQUssUUFBTCxBQUFhLFFBQVEsS0FBQSxBQUFLLFlBQTFCLEFBQXFCLEFBQWlCLE1BQXRDLEFBQTRDLEFBQzdDO0EsdUNBRUc7O0EsU0FBc0IsQUFDeEI7YUFBTyxPQUFPLEtBQWQsQUFBbUIsQUFDcEI7QSx5Q0FFSzs7QSxTQUFtQixBQUN2QjtXQUFBLEFBQUssUUFBTCxBQUFhLFdBQVcsS0FBQSxBQUFLLFlBQTdCLEFBQXdCLEFBQWlCLEFBQzFDO0EsNENBRWdCOztBQUNmO1dBQUEsQUFBSyxRQUFMLEFBQWEsQUFDZDtBLCtDQUVXOztBLFlBQWdCLEFBQzFCO2FBQVUsS0FBVixBQUFVLEFBQUssb0JBQWYsQUFBOEIsQUFDL0I7QSw2Q0FFVzs7QUFDVjthQUFPLEtBQUEsQUFBSyxPQUFMLEFBQVksSUFBbkIsQUFBTyxBQUFnQixBQUN4QjtBLG9ELEFBeENrQjs7Ozs7O0EsQUNITCxRLEFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QSxBQXNCQSxjLEFBQUE7Ozs7QSxBQUlBLFksQUFBQTs7OztBLEFBSUEsYSxBQUFBOzs7O0EsQUFJQSx1QixBQUFBOzs7Ozs7Ozs7OztBLEFBV0EsaUIsQUFBQTs7Ozs7OztBLEFBT0EsTyxBQUFBOzs7O0EsQUFJQSxPLEFBQUEsS0F4RFQsU0FBQSxBQUFTLE1BQVQsQUFBZSxLQUFhLENBQ2pDLElBQUksV0FBVyxPQUFBLEFBQU8sT0FDcEIsT0FBQSxBQUFPLGVBRE0sQUFDYixBQUFzQixNQUN0QixPQUFBLEFBQU8sb0JBQVAsQUFBMkIsS0FBM0IsQUFBZ0MsT0FBTyxVQUFBLEFBQUMsT0FBRCxBQUFRLE1BQVMsQ0FDdEQsTUFBQSxBQUFNLFFBQVEsT0FBQSxBQUFPLHlCQUFQLEFBQWdDLEtBQTlDLEFBQWMsQUFBcUMsTUFDbkQsT0FBQSxBQUFPLEFBQ1IsTUFIRCxHQUZGLEFBQWUsQUFFYixBQUdHLEtBR0wsSUFBSSxDQUFFLE9BQUEsQUFBTyxhQUFiLEFBQU0sQUFBb0IsTUFBTSxDQUM5QixPQUFBLEFBQU8sa0JBQVAsQUFBeUIsQUFDMUIsVUFDRCxLQUFJLE9BQUEsQUFBTyxTQUFYLEFBQUksQUFBZ0IsTUFBTSxDQUN4QixPQUFBLEFBQU8sS0FBUCxBQUFZLEFBQ2IsVUFDRCxLQUFJLE9BQUEsQUFBTyxTQUFYLEFBQUksQUFBZ0IsTUFBTSxDQUN4QixPQUFBLEFBQU8sT0FBUCxBQUFjLEFBQ2YsVUFFRCxRQUFBLEFBQU8sQUFDUixTQUVNLFVBQUEsQUFBUyxZQUFULEFBQXFCLEtBQXJCLEFBQW9DLE1BQXVCLENBQ2hFLE9BQU8sT0FBQSxBQUFPLFVBQVAsQUFBaUIsZUFBakIsQUFBZ0MsS0FBaEMsQUFBcUMsS0FBNUMsQUFBTyxBQUEwQyxBQUNsRCxNQUVNLFVBQUEsQUFBUyxVQUFULEFBQW1CLFVBQW5CLEFBQWtDLFFBQWdCLENBQ3ZELE9BQU8sb0JBQUEsQUFBb0IsVUFBVyxVQUF0QyxBQUFnRCxBQUNqRCxTQUVNLFVBQUEsQUFBUyxXQUFULEFBQW9CLE1BQWdCLENBQ3pDLE9BQU8sZ0JBQVAsQUFBdUIsQUFDeEIsU0FFTSxVQUFBLEFBQVMscUJBQVQsQUFBOEIsTUFBYSxDQUNoRCxJQUFNLGFBQWEsTUFBQSxBQUFNLFFBQU4sQUFBYyxRQUFkLEFBQXNCLE9BQU8sQ0FBQSxBQUFDLFdBQWpELEFBQWdELEFBQVksVUFDNUQsSUFBTSxVQUFOLEFBQWdCLEdBRmdDLHVHQUloRCxxQkFBQSxBQUFnQix3SUFBWSxLQUFqQixBQUFpQixnQkFDMUIsUUFBQSxBQUFRLEtBQUssWUFBQSxBQUFZLE1BQVosQUFBa0IsT0FBbEIsQUFBeUIsU0FBUyxLQUFBLEFBQUssT0FBcEQsQUFBMkQsQUFDNUQsT0FOK0MsaU5BUWhELFFBQU8sUUFBQSxBQUFRLFFBQVIsQUFBZ0IsU0FBUyxDQUF6QixBQUEwQixJQUExQixBQUE4QixRQUFyQyxBQUE2QyxBQUM5QyxLQUVNLFVBQUEsQUFBUyxlQUFULEFBQXdCLE1BQXNCLENBQ25ELElBQUksQ0FBRSxxQkFBQSxBQUFxQixLQUFLLENBQTFCLEFBQTBCLEFBQUMsV0FBakMsQUFBTSxBQUFzQyxPQUFPLENBQ2pELE9BQUEsQUFBTyxBQUNSLE1BQ0QsUUFBTyxLQUFBLEFBQUssUUFBWixBQUFvQixBQUNyQixLQUVNLFVBQUEsQUFBUyxLQUFULEFBQWMsR0FBZCxBQUF3QixHQUFVLENBQ3ZDLE9BQU8sRUFBQSxBQUFFLFlBQVksRUFBckIsQUFBdUIsQUFDeEIsVUFFTSxVQUFBLEFBQVMsS0FBVCxBQUFjLEdBQWQsQUFBd0IsR0FBVSxBQUN2QztTQUFPLEVBQUEsQUFBRSxZQUFZLEVBQXJCLEFBQXVCLEFBQ3hCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogR2xvYmFsIE5hbWVzXG4gKi9cblxudmFyIGdsb2JhbHMgPSAvXFxiKEFycmF5fERhdGV8T2JqZWN0fE1hdGh8SlNPTilcXGIvZztcblxuLyoqXG4gKiBSZXR1cm4gaW1tZWRpYXRlIGlkZW50aWZpZXJzIHBhcnNlZCBmcm9tIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSBtYXAgZnVuY3Rpb24gb3IgcHJlZml4XG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdHIsIGZuKXtcbiAgdmFyIHAgPSB1bmlxdWUocHJvcHMoc3RyKSk7XG4gIGlmIChmbiAmJiAnc3RyaW5nJyA9PSB0eXBlb2YgZm4pIGZuID0gcHJlZml4ZWQoZm4pO1xuICBpZiAoZm4pIHJldHVybiBtYXAoc3RyLCBwLCBmbik7XG4gIHJldHVybiBwO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gaW1tZWRpYXRlIGlkZW50aWZpZXJzIGluIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcHJvcHMoc3RyKSB7XG4gIHJldHVybiBzdHJcbiAgICAucmVwbGFjZSgvXFwuXFx3K3xcXHcrICpcXCh8XCJbXlwiXSpcInwnW14nXSonfFxcLyhbXi9dKylcXC8vZywgJycpXG4gICAgLnJlcGxhY2UoZ2xvYmFscywgJycpXG4gICAgLm1hdGNoKC9bYS16QS1aX11cXHcqL2cpXG4gICAgfHwgW107XG59XG5cbi8qKlxuICogUmV0dXJuIGBzdHJgIHdpdGggYHByb3BzYCBtYXBwZWQgd2l0aCBgZm5gLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7QXJyYXl9IHByb3BzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbWFwKHN0ciwgcHJvcHMsIGZuKSB7XG4gIHZhciByZSA9IC9cXC5cXHcrfFxcdysgKlxcKHxcIlteXCJdKlwifCdbXiddKid8XFwvKFteL10rKVxcL3xbYS16QS1aX11cXHcqL2c7XG4gIHJldHVybiBzdHIucmVwbGFjZShyZSwgZnVuY3Rpb24oXyl7XG4gICAgaWYgKCcoJyA9PSBfW18ubGVuZ3RoIC0gMV0pIHJldHVybiBmbihfKTtcbiAgICBpZiAoIX5wcm9wcy5pbmRleE9mKF8pKSByZXR1cm4gXztcbiAgICByZXR1cm4gZm4oXyk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFJldHVybiB1bmlxdWUgYXJyYXkuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHVuaXF1ZShhcnIpIHtcbiAgdmFyIHJldCA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKH5yZXQuaW5kZXhPZihhcnJbaV0pKSBjb250aW51ZTtcbiAgICByZXQucHVzaChhcnJbaV0pO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn1cblxuLyoqXG4gKiBNYXAgd2l0aCBwcmVmaXggYHN0cmAuXG4gKi9cblxuZnVuY3Rpb24gcHJlZml4ZWQoc3RyKSB7XG4gIHJldHVybiBmdW5jdGlvbihfKXtcbiAgICByZXR1cm4gc3RyICsgXztcbiAgfTtcbn1cbiIsIlxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciB0b0Z1bmN0aW9uID0gcmVxdWlyZSgndG8tZnVuY3Rpb24nKTtcblxuLyoqXG4gKiBHcm91cCBgYXJyYCB3aXRoIGNhbGxiYWNrIGBmbih2YWwsIGkpYC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJcbiAqIEBwYXJhbSB7RnVuY3Rpb258U3RyaW5nfSBmbiBvciBwcm9wXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcnIsIGZuKXtcbiAgdmFyIHJldCA9IHt9O1xuICB2YXIgcHJvcDtcbiAgZm4gPSB0b0Z1bmN0aW9uKGZuKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7ICsraSkge1xuICAgIHByb3AgPSBmbihhcnJbaV0sIGkpO1xuICAgIHJldFtwcm9wXSA9IHJldFtwcm9wXSB8fCBbXTtcbiAgICByZXRbcHJvcF0ucHVzaChhcnJbaV0pO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn07IiwiXG4vKipcbiAqIE1vZHVsZSBEZXBlbmRlbmNpZXNcbiAqL1xuXG52YXIgZXhwcjtcbnRyeSB7XG4gIGV4cHIgPSByZXF1aXJlKCdwcm9wcycpO1xufSBjYXRjaChlKSB7XG4gIGV4cHIgPSByZXF1aXJlKCdjb21wb25lbnQtcHJvcHMnKTtcbn1cblxuLyoqXG4gKiBFeHBvc2UgYHRvRnVuY3Rpb24oKWAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB0b0Z1bmN0aW9uO1xuXG4vKipcbiAqIENvbnZlcnQgYG9iamAgdG8gYSBgRnVuY3Rpb25gLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IG9ialxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiB0b0Z1bmN0aW9uKG9iaikge1xuICBzd2l0Y2ggKHt9LnRvU3RyaW5nLmNhbGwob2JqKSkge1xuICAgIGNhc2UgJ1tvYmplY3QgT2JqZWN0XSc6XG4gICAgICByZXR1cm4gb2JqZWN0VG9GdW5jdGlvbihvYmopO1xuICAgIGNhc2UgJ1tvYmplY3QgRnVuY3Rpb25dJzpcbiAgICAgIHJldHVybiBvYmo7XG4gICAgY2FzZSAnW29iamVjdCBTdHJpbmddJzpcbiAgICAgIHJldHVybiBzdHJpbmdUb0Z1bmN0aW9uKG9iaik7XG4gICAgY2FzZSAnW29iamVjdCBSZWdFeHBdJzpcbiAgICAgIHJldHVybiByZWdleHBUb0Z1bmN0aW9uKG9iaik7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBkZWZhdWx0VG9GdW5jdGlvbihvYmopO1xuICB9XG59XG5cbi8qKlxuICogRGVmYXVsdCB0byBzdHJpY3QgZXF1YWxpdHkuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGRlZmF1bHRUb0Z1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqKXtcbiAgICByZXR1cm4gdmFsID09PSBvYmo7XG4gIH07XG59XG5cbi8qKlxuICogQ29udmVydCBgcmVgIHRvIGEgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtSZWdFeHB9IHJlXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHJlZ2V4cFRvRnVuY3Rpb24ocmUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iail7XG4gICAgcmV0dXJuIHJlLnRlc3Qob2JqKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IHByb3BlcnR5IGBzdHJgIHRvIGEgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzdHJpbmdUb0Z1bmN0aW9uKHN0cikge1xuICAvLyBpbW1lZGlhdGUgc3VjaCBhcyBcIj4gMjBcIlxuICBpZiAoL14gKlxcVysvLnRlc3Qoc3RyKSkgcmV0dXJuIG5ldyBGdW5jdGlvbignXycsICdyZXR1cm4gXyAnICsgc3RyKTtcblxuICAvLyBwcm9wZXJ0aWVzIHN1Y2ggYXMgXCJuYW1lLmZpcnN0XCIgb3IgXCJhZ2UgPiAxOFwiIG9yIFwiYWdlID4gMTggJiYgYWdlIDwgMzZcIlxuICByZXR1cm4gbmV3IEZ1bmN0aW9uKCdfJywgJ3JldHVybiAnICsgZ2V0KHN0cikpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYG9iamVjdGAgdG8gYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0XG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG9iamVjdFRvRnVuY3Rpb24ob2JqKSB7XG4gIHZhciBtYXRjaCA9IHt9O1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgbWF0Y2hba2V5XSA9IHR5cGVvZiBvYmpba2V5XSA9PT0gJ3N0cmluZydcbiAgICAgID8gZGVmYXVsdFRvRnVuY3Rpb24ob2JqW2tleV0pXG4gICAgICA6IHRvRnVuY3Rpb24ob2JqW2tleV0pO1xuICB9XG4gIHJldHVybiBmdW5jdGlvbih2YWwpe1xuICAgIGlmICh0eXBlb2YgdmFsICE9PSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xuICAgIGZvciAodmFyIGtleSBpbiBtYXRjaCkge1xuICAgICAgaWYgKCEoa2V5IGluIHZhbCkpIHJldHVybiBmYWxzZTtcbiAgICAgIGlmICghbWF0Y2hba2V5XSh2YWxba2V5XSkpIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG59XG5cbi8qKlxuICogQnVpbHQgdGhlIGdldHRlciBmdW5jdGlvbi4gU3VwcG9ydHMgZ2V0dGVyIHN0eWxlIGZ1bmN0aW9uc1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGdldChzdHIpIHtcbiAgdmFyIHByb3BzID0gZXhwcihzdHIpO1xuICBpZiAoIXByb3BzLmxlbmd0aCkgcmV0dXJuICdfLicgKyBzdHI7XG5cbiAgdmFyIHZhbCwgaSwgcHJvcDtcbiAgZm9yIChpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgcHJvcCA9IHByb3BzW2ldO1xuICAgIHZhbCA9ICdfLicgKyBwcm9wO1xuICAgIHZhbCA9IFwiKCdmdW5jdGlvbicgPT0gdHlwZW9mIFwiICsgdmFsICsgXCIgPyBcIiArIHZhbCArIFwiKCkgOiBcIiArIHZhbCArIFwiKVwiO1xuXG4gICAgLy8gbWltaWMgbmVnYXRpdmUgbG9va2JlaGluZCB0byBhdm9pZCBwcm9ibGVtcyB3aXRoIG5lc3RlZCBwcm9wZXJ0aWVzXG4gICAgc3RyID0gc3RyaXBOZXN0ZWQocHJvcCwgc3RyLCB2YWwpO1xuICB9XG5cbiAgcmV0dXJuIHN0cjtcbn1cblxuLyoqXG4gKiBNaW1pYyBuZWdhdGl2ZSBsb29rYmVoaW5kIHRvIGF2b2lkIHByb2JsZW1zIHdpdGggbmVzdGVkIHByb3BlcnRpZXMuXG4gKlxuICogU2VlOiBodHRwOi8vYmxvZy5zdGV2ZW5sZXZpdGhhbi5jb20vYXJjaGl2ZXMvbWltaWMtbG9va2JlaGluZC1qYXZhc2NyaXB0XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHN0cmlwTmVzdGVkIChwcm9wLCBzdHIsIHZhbCkge1xuICByZXR1cm4gc3RyLnJlcGxhY2UobmV3IFJlZ0V4cCgnKFxcXFwuKT8nICsgcHJvcCwgJ2cnKSwgZnVuY3Rpb24oJDAsICQxKSB7XG4gICAgcmV0dXJuICQxID8gJDAgOiB2YWw7XG4gIH0pO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQge1xuICBzdG9yYWdlOiAnbG9jYWxzdG9yYWdlJyxcbiAgcHJlZml4OiAnc3Ffam9icycsXG4gIHRpbWVvdXQ6IDEwMDAsXG4gIGxpbWl0OiAtMSxcbiAgcHJpbmNpcGxlOiAnZmlmbydcbn07XG4iLCIvKiBAZmxvdyAqL1xuaW1wb3J0IHR5cGUgSUNvbmZpZyBmcm9tICcuLi9pbnRlcmZhY2VzL2NvbmZpZyc7XG5pbXBvcnQgY29uZmlnRGF0YSBmcm9tICcuL2NvbmZpZy5kYXRhJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29uZmlnIHtcbiAgY29uZmlnOiBJQ29uZmlnID0gY29uZmlnRGF0YTtcblxuICBjb25zdHJ1Y3Rvcihjb25maWc6IElDb25maWcgPSB7fSkge1xuICAgIHRoaXMubWVyZ2UoY29uZmlnKTtcbiAgfVxuXG4gIHNldChuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLmNvbmZpZ1tuYW1lXSA9IHZhbHVlO1xuICB9XG5cbiAgZ2V0KG5hbWU6IHN0cmluZyk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnW25hbWVdO1xuICB9XG5cbiAgaGFzKG5hbWU6IHN0cmluZykge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5jb25maWcsIG5hbWUpO1xuICB9XG5cbiAgbWVyZ2UoY29uZmlnOiB7W3N0cmluZ106IGFueX0pIHtcbiAgICB0aGlzLmNvbmZpZyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuY29uZmlnLCBjb25maWcpO1xuICB9XG5cbiAgcmVtb3ZlKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBkZWxldGUgdGhpcy5jb25maWdbbmFtZV07XG4gIH1cblxuICBhbGwoKTogSUNvbmZpZyB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnO1xuICB9XG59XG4iLCIvKiBAZmxvdyAqL1xuaW1wb3J0IHR5cGUgSUNvbnRhaW5lciBmcm9tICcuLi9pbnRlcmZhY2VzL2NvbnRhaW5lcic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbnRhaW5lciBpbXBsZW1lbnRzIElDb250YWluZXIge1xuXG4gIGNvbnN0cnVjdG9yKCkge31cblxuICBfY29udGFpbmVyOiB7W3Byb3BlcnR5OiBzdHJpbmddOiBhbnl9ID0ge307XG5cbiAgaGFzKGlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuX2NvbnRhaW5lciwgaWQpO1xuICB9XG5cbiAgZ2V0KGlkOiBzdHJpbmcpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLl9jb250YWluZXJbaWRdO1xuICB9XG5cbiAgYWxsKCkge1xuICAgIHJldHVybiB0aGlzLl9jb250YWluZXI7XG4gIH1cblxuICBiaW5kKGlkOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLl9jb250YWluZXJbaWRdID0gdmFsdWU7XG4gIH1cblxuICByZW1vdmUoaWQ6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5fY29udGFpbmVyLCBpZCkpIHtcbiAgICAgIGRlbGV0ZSB0aGlzLl9jb250YWluZXJbaWRdO1xuICAgIH1cbiAgfVxuXG4gIHJlbW92ZUFsbCgpOiB2b2lkIHtcbiAgICB0aGlzLl9jb250YWluZXIgPSB7fTtcbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXZlbnQge1xuICBzdG9yZSA9IHt9O1xuICB2ZXJpZmllclBhdHRlcm4gPSAvXlthLXowLTlcXC1cXF9dK1xcOmJlZm9yZSR8YWZ0ZXIkfHJldHJ5JHxcXCokLztcbiAgd2lsZGNhcmRzID0gWycqJywgJ2Vycm9yJ107XG4gIGVtcHR5RnVuYyA9ICgpID0+IHt9O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc3RvcmUuYmVmb3JlID0ge307XG4gICAgdGhpcy5zdG9yZS5hZnRlciA9IHt9O1xuICAgIHRoaXMuc3RvcmUucmV0cnkgPSB7fTtcbiAgICB0aGlzLnN0b3JlLndpbGRjYXJkID0ge307XG4gICAgdGhpcy5zdG9yZS5lcnJvciA9IHRoaXMuZW1wdHlGdW5jO1xuICAgIHRoaXMuc3RvcmVbJyonXSA9IHRoaXMuZW1wdHlGdW5jO1xuICB9XG5cbiAgb24oa2V5OiBzdHJpbmcsIGNiOiBGdW5jdGlvbik6IHZvaWQge1xuICAgIGlmICh0eXBlb2YoY2IpICE9PSAnZnVuY3Rpb24nKSB0aHJvdyBuZXcgRXJyb3IoJ0V2ZW50IHNob3VsZCBiZSBhbiBmdW5jdGlvbicpO1xuICAgIGlmICh0aGlzLmlzVmFsaWQoa2V5KSkgdGhpcy5hZGQoa2V5LCBjYik7XG4gIH1cblxuICBlbWl0KGtleTogc3RyaW5nLCBhcmdzOiBhbnkpIHtcbiAgICBpZiAodGhpcy53aWxkY2FyZHMuaW5kZXhPZihrZXkpID4gLTEpIHtcbiAgICAgIHRoaXMud2lsZGNhcmQoa2V5LCAuLi5hcmd1bWVudHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB0eXBlID0gdGhpcy5nZXRUeXBlKGtleSk7XG4gICAgICBjb25zdCBuYW1lID0gdGhpcy5nZXROYW1lKGtleSk7XG5cbiAgICAgIGlmICh0aGlzLnN0b3JlW3R5cGVdKSB7XG4gICAgICAgIGNvbnN0IGNiID0gdGhpcy5zdG9yZVt0eXBlXVtuYW1lXSB8fCB0aGlzLmVtcHR5RnVuYztcbiAgICAgICAgY2IuY2FsbChudWxsLCBhcmdzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLndpbGRjYXJkKCcqJywga2V5LCBhcmdzKTtcbiAgfVxuXG4gIHdpbGRjYXJkKGtleTogc3RyaW5nLCBhY3Rpb25LZXk6IHN0cmluZywgYXJnczogYW55KSB7XG4gICAgaWYgKHRoaXMuc3RvcmUud2lsZGNhcmRba2V5XSkge1xuICAgICAgdGhpcy5zdG9yZS53aWxkY2FyZFtrZXldLmNhbGwobnVsbCwgYWN0aW9uS2V5LCBhcmdzKTtcbiAgICB9XG4gIH1cblxuICBhZGQoa2V5OiBzdHJpbmcsIGNiOiBGdW5jdGlvbik6IHZvaWQge1xuICAgIGlmICh0aGlzLndpbGRjYXJkcy5pbmRleE9mKGtleSkgPi0xKSB7XG4gICAgICB0aGlzLnN0b3JlLndpbGRjYXJkW2tleV0gPSBjYjtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgdHlwZSA9IHRoaXMuZ2V0VHlwZShrZXkpO1xuICAgICAgY29uc3QgbmFtZSA9IHRoaXMuZ2V0TmFtZShrZXkpO1xuICAgICAgdGhpcy5zdG9yZVt0eXBlXVtuYW1lXSA9IGNiO1xuICAgIH1cbiAgfVxuXG4gIGhhcyhrZXk6IHN0cmluZykge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBrZXlzID0ga2V5LnNwbGl0KCc6Jyk7XG4gICAgICByZXR1cm4ga2V5cy5sZW5ndGggPiAxID8gISEgdGhpcy5zdG9yZVtrZXlzWzFdXVtrZXlzWzBdXSA6ICEhIHRoaXMuc3RvcmUud2lsZGNhcmRba2V5c1swXV07XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgZ2V0TmFtZShrZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGtleS5tYXRjaCgvKC4qKVxcOi4qLylbMV07XG4gIH1cblxuICBnZXRUeXBlKGtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4ga2V5Lm1hdGNoKC9eW2EtejAtOVxcLVxcX10rXFw6KC4qKS8pWzFdO1xuICB9XG5cbiAgaXNWYWxpZChrZXk6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLnZlcmlmaWVyUGF0dGVybi50ZXN0KGtleSkgfHwgdGhpcy53aWxkY2FyZHMuaW5kZXhPZihrZXkpID4tMTtcbiAgfVxufVxuIiwiaW1wb3J0IFF1ZXVlIGZyb20gJy4vcXVldWUnO1xuXG53aW5kb3cuUXVldWUgPSBRdWV1ZTtcblxuZXhwb3J0IGRlZmF1bHQgUXVldWU7XG4iLCIvKiBAZmxvdyAqL1xuaW1wb3J0IHR5cGUgSUNvbmZpZyBmcm9tIFwiLi4vaW50ZXJmYWNlcy9jb25maWdcIjtcbmltcG9ydCB0eXBlIElUYXNrIGZyb20gXCIuLi9pbnRlcmZhY2VzL3Rhc2tcIjtcbmltcG9ydCB0eXBlIElKb2IgZnJvbSBcIi4uL2ludGVyZmFjZXMvam9iXCI7XG5pbXBvcnQgQ29udGFpbmVyIGZyb20gXCIuL2NvbnRhaW5lclwiO1xuaW1wb3J0IFN0b3JhZ2VDYXBzdWxlIGZyb20gXCIuL3N0b3JhZ2UtY2Fwc3VsZVwiO1xuaW1wb3J0IENvbmZpZyBmcm9tIFwiLi9jb25maWdcIjtcbmltcG9ydCBFdmVudCBmcm9tIFwiLi9ldmVudFwiO1xuaW1wb3J0IHtcbiAgY2xvbmUsXG4gIGhhc01ldGhvZCxcbiAgaXNGdW5jdGlvbixcbiAgZXhjbHVkZVNwZWNpZmljVGFza3MsXG4gIHV0aWxDbGVhckJ5VGFnXG59IGZyb20gXCIuL3V0aWxzXCI7XG5pbXBvcnQgTG9jYWxTdG9yYWdlIGZyb20gXCIuL3N0b3JhZ2UvbG9jYWxzdG9yYWdlXCI7XG5cbmludGVyZmFjZSBJSm9iSW5zdGFuY2Uge1xuICBwcmlvcml0eTogbnVtYmVyO1xuICByZXRyeTogbnVtYmVyO1xuICBoYW5kbGUoYXJnczogYW55KTogYW55O1xuICBiZWZvcmUoYXJnczogYW55KTogdm9pZDtcbiAgYWZ0ZXIoYXJnczogYW55KTogdm9pZDtcbn1cblxubGV0IFF1ZXVlID0gKCgpID0+IHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgUXVldWUuRklGTyA9IFwiZmlmb1wiO1xuICBRdWV1ZS5MSUZPID0gXCJsaWZvXCI7XG5cbiAgZnVuY3Rpb24gUXVldWUoY29uZmlnOiBJQ29uZmlnKSB7XG4gICAgX2NvbnN0cnVjdG9yLmNhbGwodGhpcywgY29uZmlnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIF9jb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICB0aGlzLmN1cnJlbnRDaGFubmVsO1xuICAgIHRoaXMuY3VycmVudFRpbWVvdXQ7XG4gICAgdGhpcy5zdG9wcGVkID0gdHJ1ZTtcbiAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICB0aGlzLmNoYW5uZWxzID0ge307XG4gICAgdGhpcy5jb25maWcgPSBuZXcgQ29uZmlnKGNvbmZpZyk7XG4gICAgdGhpcy5zdG9yYWdlID0gbmV3IFN0b3JhZ2VDYXBzdWxlKFxuICAgICAgdGhpcy5jb25maWcsXG4gICAgICBuZXcgTG9jYWxTdG9yYWdlKHRoaXMuY29uZmlnKVxuICAgICk7XG4gICAgdGhpcy5ldmVudCA9IG5ldyBFdmVudCgpO1xuICAgIHRoaXMuY29udGFpbmVyID0gbmV3IENvbnRhaW5lcigpO1xuICAgIHRoaXMudGltZW91dCA9IHRoaXMuY29uZmlnLmdldChcInRpbWVvdXRcIik7XG4gIH1cblxuICBRdWV1ZS5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24odGFzayk6IHN0cmluZyB8IGJvb2xlYW4ge1xuICAgIGlmICghY2FuTXVsdGlwbGUuY2FsbCh0aGlzLCB0YXNrKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgY29uc3QgaWQgPSBzYXZlVGFzay5jYWxsKHRoaXMsIHRhc2spO1xuXG4gICAgaWYgKGlkICYmIHRoaXMuc3RvcHBlZCAmJiB0aGlzLnJ1bm5pbmcgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuc3RhcnQoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gaWQ7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5zdG9wcGVkKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIltzdG9wcGVkXS0+IG5leHRcIik7XG4gICAgICBzdGF0dXNPZmYuY2FsbCh0aGlzKTtcbiAgICAgIHJldHVybiBzdG9wUXVldWUuY2FsbCh0aGlzKTtcbiAgICB9XG4gICAgY29uc29sZS5sb2coXCJbbmV4dF0tPlwiKTtcbiAgICB0aGlzLnN0YXJ0KCk7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKTogYm9vbGVhbiB7XG4gICAgLy8gU3RvcCB0aGUgcXVldWUgZm9yIHJlc3RhcnRcbiAgICB0aGlzLnN0b3BwZWQgPSBmYWxzZTtcblxuICAgIC8vIFJlZ2lzdGVyIHRhc2tzLCBpZiBub3QgcmVnaXN0ZXJlZFxuICAgIHJlZ2lzdGVySm9icy5jYWxsKHRoaXMpO1xuXG4gICAgLy8gQ3JlYXRlIGEgdGltZW91dCBmb3Igc3RhcnQgcXVldWVcbiAgICB0aGlzLnJ1bm5pbmcgPSBjcmVhdGVUaW1lb3V0LmNhbGwodGhpcykgPiAwO1xuICAgIGNvbnNvbGUubG9nKFwiW3N0YXJ0ZWRdLT5cIiwgdGhpcy5ydW5uaW5nKTtcbiAgICByZXR1cm4gdGhpcy5ydW5uaW5nO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coXCJbc3RvcHBpbmddLT5cIik7XG4gICAgdGhpcy5zdG9wcGVkID0gdHJ1ZTsgLy90aGlzLnJ1bm5pbmc7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLmZvcmNlU3RvcCA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKFwiW2ZvcmNlU3RvcHBlZF0tPlwiKTtcbiAgICBzdG9wUXVldWUuY2FsbCh0aGlzKTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oY2hhbm5lbDogc3RyaW5nKSB7XG4gICAgaWYgKCEoY2hhbm5lbCBpbiB0aGlzLmNoYW5uZWxzKSkge1xuICAgICAgdGhpcy5jdXJyZW50Q2hhbm5lbCA9IGNoYW5uZWw7XG4gICAgICB0aGlzLmNoYW5uZWxzW2NoYW5uZWxdID0gY2xvbmUodGhpcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuY2hhbm5lbHNbY2hhbm5lbF07XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLmNoYW5uZWwgPSBmdW5jdGlvbihuYW1lOiBzdHJpbmcpIHtcbiAgICBpZiAoIXRoaXMuY2hhbm5lbHNbbmFtZV0pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2hhbm5lbCBvZiBcIiR7bmFtZX1cIiBub3QgZm91bmRgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5jaGFubmVsc1tuYW1lXTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuaXNFbXB0eSA9IGZ1bmN0aW9uKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNvdW50KCkgPCAxO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5jb3VudCA9IGZ1bmN0aW9uKCk6IEFycmF5PElUYXNrPiB7XG4gICAgcmV0dXJuIGdldFRhc2tzV2l0aG91dEZyZWV6ZWQuY2FsbCh0aGlzKS5sZW5ndGg7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLmNvdW50QnlUYWcgPSBmdW5jdGlvbih0YWc6IHN0cmluZyk6IEFycmF5PElUYXNrPiB7XG4gICAgcmV0dXJuIGdldFRhc2tzV2l0aG91dEZyZWV6ZWQuY2FsbCh0aGlzKS5maWx0ZXIodCA9PiB0LnRhZyA9PT0gdGFnKS5sZW5ndGg7XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuY3VycmVudENoYW5uZWwpIHtcbiAgICAgIHRoaXMuc3RvcmFnZS5jbGVhcih0aGlzLmN1cnJlbnRDaGFubmVsKTtcbiAgICB9XG4gIH07XG5cbiAgUXVldWUucHJvdG90eXBlLmNsZWFyQnlUYWcgPSBmdW5jdGlvbih0YWc6IHN0cmluZyk6IHZvaWQge1xuICAgIGRiXG4gICAgICAuY2FsbCh0aGlzKVxuICAgICAgLmFsbCgpXG4gICAgICAuZmlsdGVyKHV0aWxDbGVhckJ5VGFnLmJpbmQodGFnKSlcbiAgICAgIC5mb3JFYWNoKHQgPT4gZGIuY2FsbCh0aGlzKS5kZWxldGUodC5faWQpKTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24oaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBnZXRUYXNrc1dpdGhvdXRGcmVlemVkLmNhbGwodGhpcykuZmluZEluZGV4KHQgPT4gdC5faWQgPT09IGlkKSA+IC0xO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5oYXNCeVRhZyA9IGZ1bmN0aW9uKHRhZzogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGdldFRhc2tzV2l0aG91dEZyZWV6ZWQuY2FsbCh0aGlzKS5maW5kSW5kZXgodCA9PiB0LnRhZyA9PT0gdGFnKSA+IC0xO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5zZXRUaW1lb3V0ID0gZnVuY3Rpb24odmFsOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnRpbWVvdXQgPSB2YWw7XG4gICAgdGhpcy5jb25maWcuc2V0KFwidGltZW91dFwiLCB2YWwpO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5zZXRMaW1pdCA9IGZ1bmN0aW9uKHZhbDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5jb25maWcuc2V0KFwibGltaXRcIiwgdmFsKTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuc2V0UHJlZml4ID0gZnVuY3Rpb24odmFsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmNvbmZpZy5zZXQoXCJwcmVmaXhcIiwgdmFsKTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUuc2V0UHJpbmNpcGxlID0gZnVuY3Rpb24odmFsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmNvbmZpZy5zZXQoXCJwcmluY2lwbGVcIiwgdmFsKTtcbiAgfTtcblxuICBRdWV1ZS5wcm90b3R5cGUub24gPSBmdW5jdGlvbihrZXk6IHN0cmluZywgY2I6IEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgdGhpcy5ldmVudC5vbiguLi5hcmd1bWVudHMpO1xuICB9O1xuXG4gIFF1ZXVlLnByb3RvdHlwZS5lcnJvciA9IGZ1bmN0aW9uKGNiOiBGdW5jdGlvbik6IHZvaWQge1xuICAgIHRoaXMuZXZlbnQub24oXCJlcnJvclwiLCBjYik7XG4gIH07XG5cbiAgUXVldWUucmVnaXN0ZXIgPSBmdW5jdGlvbihqb2JzOiBBcnJheTxJSm9iPikge1xuICAgIGlmICghKGpvYnMgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlF1ZXVlIGpvYnMgc2hvdWxkIGJlIG9iamVjdHMgd2l0aGluIGFuIGFycmF5XCIpO1xuICAgIH1cblxuICAgIFF1ZXVlLmlzUmVnaXN0ZXJlZCA9IGZhbHNlO1xuICAgIFF1ZXVlLmpvYnMgPSBqb2JzO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGdldFRhc2tzV2l0aG91dEZyZWV6ZWQoKSB7XG4gICAgcmV0dXJuIGRiXG4gICAgICAuY2FsbCh0aGlzKVxuICAgICAgLmFsbCgpXG4gICAgICAuZmlsdGVyKGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzLmJpbmQoW1wiZnJlZXplZFwiXSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gZGlzcGF0Y2hFdmVudHModGFzazogSVRhc2ssIHR5cGU6IHN0cmluZykge1xuICAgIGlmIChcInRhZ1wiIGluIHRhc2spIHtcbiAgICAgIHRoaXMuZXZlbnQuZW1pdChgJHt0YXNrLnRhZ306JHt0eXBlfWAsIHRhc2spO1xuICAgICAgdGhpcy5ldmVudC5lbWl0KGAke3Rhc2sudGFnfToqYCwgdGFzayk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZGIoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmFnZS5jaGFubmVsKHRoaXMuY3VycmVudENoYW5uZWwpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2F2ZVRhc2sodGFzazogSVRhc2spIHtcbiAgICByZXR1cm4gZGIuY2FsbCh0aGlzKS5zYXZlKHRhc2spO1xuICB9XG5cbiAgZnVuY3Rpb24gc2F2ZVRhc2sodGFzazogSVRhc2spIHtcbiAgICByZXR1cm4gZGIuY2FsbCh0aGlzKS5zYXZlKGNoZWNrUHJpb3JpdHkodGFzaykpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tQcmlvcml0eSh0YXNrOiBJVGFzaykge1xuICAgIHRhc2sucHJpb3JpdHkgPSB0YXNrLnByaW9yaXR5IHx8IDA7XG5cbiAgICBpZiAoaXNOYU4odGFzay5wcmlvcml0eSkpIHRhc2sucHJpb3JpdHkgPSAwO1xuXG4gICAgcmV0dXJuIHRhc2s7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVUaW1lb3V0KCk6IG51bWJlciB7XG4gICAgY29uc3QgdGltZW91dCA9IHRoaXMuY29uZmlnLmdldChcInRpbWVvdXRcIik7XG4gICAgcmV0dXJuICh0aGlzLmN1cnJlbnRUaW1lb3V0ID0gc2V0VGltZW91dChsb29wSGFuZGxlci5iaW5kKHRoaXMpLCB0aW1lb3V0KSk7XG4gIH1cblxuICBmdW5jdGlvbiBsb2NrVGFzayh0YXNrKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGRiLmNhbGwodGhpcykudXBkYXRlKHRhc2suX2lkLCB7IGxvY2tlZDogdHJ1ZSB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZVRhc2soaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBkYi5jYWxsKHRoaXMpLmRlbGV0ZShpZCk7XG4gIH1cblxuICBmdW5jdGlvbiBsb29wSGFuZGxlcigpOiB2b2lkIHtcbiAgICBjb25zdCBzZWxmOiBRdWV1ZSA9IHRoaXM7XG4gICAgY29uc3QgdGFzazogSVRhc2sgPSBkYlxuICAgICAgLmNhbGwoc2VsZilcbiAgICAgIC5mZXRjaCgpXG4gICAgICAuc2hpZnQoKTtcblxuICAgIGlmICh0YXNrID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnNvbGUubG9nKGAtPiAke3RoaXMuY3VycmVudENoYW5uZWx9IGNoYW5uZWwgaXMgZW1wdHkuLi5gKTtcbiAgICAgIHN0b3BRdWV1ZS5jYWxsKHRoaXMpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghc2VsZi5jb250YWluZXIuaGFzKHRhc2suaGFuZGxlcikpIHtcbiAgICAgIGNvbnNvbGUud2Fybih0YXNrLmhhbmRsZXIgKyBcIi0+IGpvYiBub3QgZm91bmRcIik7XG4gICAgfVxuXG4gICAgY29uc3Qgam9iOiBJSm9iID0gc2VsZi5jb250YWluZXIuZ2V0KHRhc2suaGFuZGxlcik7XG4gICAgY29uc3Qgam9iSW5zdGFuY2U6IElKb2JJbnN0YW5jZSA9IG5ldyBqb2IuaGFuZGxlcigpO1xuXG4gICAgLy8gbG9jayB0aGUgY3VycmVudCB0YXNrIGZvciBwcmV2ZW50IHJhY2UgY29uZGl0aW9uXG4gICAgbG9ja1Rhc2suY2FsbChzZWxmLCB0YXNrKTtcblxuICAgIC8vIGZpcmUgam9iIGJlZm9yZSBldmVudFxuICAgIGZpcmVKb2JJbmxpbmVFdmVudC5jYWxsKHRoaXMsIFwiYmVmb3JlXCIsIGpvYkluc3RhbmNlLCB0YXNrLmFyZ3MpO1xuXG4gICAgLy8gZGlzcGFjdGggY3VzdG9tIGJlZm9yZSBldmVudFxuICAgIGRpc3BhdGNoRXZlbnRzLmNhbGwodGhpcywgdGFzaywgXCJiZWZvcmVcIik7XG5cbiAgICAvLyBwcmVwYXJpbmcgd29ya2VyIGRlcGVuZGVuY2llc1xuICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9IE9iamVjdC52YWx1ZXMoam9iLmRlcHMgfHwge30pO1xuXG4gICAgLy8gVGFzayBydW5uZXIgcHJvbWlzZVxuICAgIGpvYkluc3RhbmNlLmhhbmRsZVxuICAgICAgLmNhbGwoam9iSW5zdGFuY2UsIHRhc2suYXJncywgLi4uZGVwZW5kZW5jaWVzKVxuICAgICAgLnRoZW4oam9iUmVzcG9uc2UuY2FsbChzZWxmLCB0YXNrLCBqb2JJbnN0YW5jZSkuYmluZChzZWxmKSlcbiAgICAgIC5jYXRjaChqb2JGYWlsZWRSZXNwb25zZS5jYWxsKHNlbGYsIHRhc2ssIGpvYkluc3RhbmNlKS5iaW5kKHNlbGYpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGpvYlJlc3BvbnNlKHRhc2s6IElUYXNrLCBqb2I6IElKb2JJbnN0YW5jZSk6IEZ1bmN0aW9uIHtcbiAgICBjb25zdCBzZWxmOiBRdWV1ZSA9IHRoaXM7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHJlc3VsdDogYm9vbGVhbikge1xuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICBzdWNjZXNzUHJvY2Vzcy5jYWxsKHNlbGYsIHRhc2ssIGpvYik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXRyeVByb2Nlc3MuY2FsbChzZWxmLCB0YXNrLCBqb2IpO1xuICAgICAgfVxuXG4gICAgICAvLyBmaXJlIGpvYiBhZnRlciBldmVudFxuICAgICAgZmlyZUpvYklubGluZUV2ZW50LmNhbGwodGhpcywgXCJhZnRlclwiLCBqb2IsIHRhc2suYXJncyk7XG5cbiAgICAgIC8vIGRpc3BhY3RoIGN1c3RvbSBhZnRlciBldmVudFxuICAgICAgZGlzcGF0Y2hFdmVudHMuY2FsbCh0aGlzLCB0YXNrLCBcImFmdGVyXCIpO1xuXG4gICAgICAvLyB0cnkgbmV4dCBxdWV1ZSBqb2JcbiAgICAgIHNlbGYubmV4dCgpO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBqb2JGYWlsZWRSZXNwb25zZSh0YXNrOiBJVGFzaywgam9iOiBJSm9iSW5zdGFuY2UpOiBGdW5jdGlvbiB7XG4gICAgcmV0dXJuIChyZXN1bHQ6IGJvb2xlYW4pID0+IHtcbiAgICAgIHJlbW92ZVRhc2suY2FsbCh0aGlzLCB0YXNrLl9pZCk7XG5cbiAgICAgIHRoaXMuZXZlbnQuZW1pdChcImVycm9yXCIsIHRhc2spO1xuXG4gICAgICB0aGlzLm5leHQoKTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gZmlyZUpvYklubGluZUV2ZW50KFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBqb2I6IElKb2JJbnN0YW5jZSxcbiAgICBhcmdzOiBhbnlcbiAgKTogdm9pZCB7XG4gICAgaWYgKCFoYXNNZXRob2Qoam9iLCBuYW1lKSkgcmV0dXJuO1xuXG4gICAgaWYgKG5hbWUgPT0gXCJiZWZvcmVcIiAmJiBpc0Z1bmN0aW9uKGpvYi5iZWZvcmUpKSB7XG4gICAgICBqb2IuYmVmb3JlLmNhbGwoam9iLCBhcmdzKTtcbiAgICB9IGVsc2UgaWYgKG5hbWUgPT0gXCJhZnRlclwiICYmIGlzRnVuY3Rpb24oam9iLmFmdGVyKSkge1xuICAgICAgam9iLmFmdGVyLmNhbGwoam9iLCBhcmdzKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzdGF0dXNPZmYoKTogdm9pZCB7XG4gICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBzdG9wUXVldWUoKTogdm9pZCB7XG4gICAgdGhpcy5zdG9wKCk7XG5cbiAgICBpZiAodGhpcy5jdXJyZW50VGltZW91dCkge1xuICAgICAgLy8gdW5zZXQgY3VycmVudCB0aW1lb3V0IHZhbHVlXG4gICAgICB0aGlzLmN1cnJlbnRUaW1lb3V0ID0gY2xlYXJUaW1lb3V0KHRoaXMuY3VycmVudFRpbWVvdXQpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHN1Y2Nlc3NQcm9jZXNzKHRhc2s6IElUYXNrLCBqb2I6IElKb2JJbnN0YW5jZSk6IHZvaWQge1xuICAgIHJlbW92ZVRhc2suY2FsbCh0aGlzLCB0YXNrLl9pZCk7XG4gIH1cblxuICBmdW5jdGlvbiByZXRyeVByb2Nlc3ModGFzazogSVRhc2ssIGpvYjogSUpvYkluc3RhbmNlKTogYm9vbGVhbiB7XG4gICAgLy8gZGlzcGFjdGggY3VzdG9tIHJldHJ5IGV2ZW50XG4gICAgZGlzcGF0Y2hFdmVudHMuY2FsbCh0aGlzLCB0YXNrLCBcInJldHJ5XCIpO1xuXG4gICAgLy8gdXBkYXRlIHJldHJ5IHZhbHVlXG4gICAgbGV0IHVwZGF0ZVRhc2s6IElUYXNrID0gdXBkYXRlUmV0cnkuY2FsbCh0aGlzLCB0YXNrLCBqb2IpO1xuXG4gICAgLy8gZGVsZXRlIGxvY2sgcHJvcGVydHkgZm9yIG5leHQgcHJvY2Vzc1xuICAgIHVwZGF0ZVRhc2subG9ja2VkID0gZmFsc2U7XG5cbiAgICByZXR1cm4gZGIuY2FsbCh0aGlzKS51cGRhdGUodGFzay5faWQsIHVwZGF0ZVRhc2spO1xuICB9XG5cbiAgZnVuY3Rpb24gY2FuTXVsdGlwbGUodGFzazogSVRhc2spOiBib29sZWFuIHtcbiAgICBpZiAodHlwZW9mIHRhc2sgIT09IFwib2JqZWN0XCIgfHwgdGFzay51bmlxdWUgIT09IHRydWUpIHJldHVybiB0cnVlO1xuXG4gICAgcmV0dXJuIHRoaXMuaGFzQnlUYWcodGFzay50YWcpIDwgMTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZVJldHJ5KHRhc2s6IElUYXNrLCBqb2I6IElKb2JJbnN0YW5jZSk6IElUYXNrIHtcbiAgICBpZiAoIShcInJldHJ5XCIgaW4gam9iKSkge1xuICAgICAgam9iLnJldHJ5ID0gMTtcbiAgICB9XG5cbiAgICBpZiAoIShcInRyaWVkXCIgaW4gdGFzaykpIHtcbiAgICAgIHRhc2sudHJpZWQgPSAwO1xuICAgICAgdGFzay5yZXRyeSA9IGpvYi5yZXRyeTtcbiAgICB9XG5cbiAgICArK3Rhc2sudHJpZWQ7XG5cbiAgICBpZiAodGFzay50cmllZCA+PSBqb2IucmV0cnkpIHtcbiAgICAgIHRhc2suZnJlZXplZCA9IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRhc2s7XG4gIH1cblxuICBmdW5jdGlvbiByZWdpc3RlckpvYnMoKTogdm9pZCB7XG4gICAgaWYgKFF1ZXVlLmlzUmVnaXN0ZXJlZCkgcmV0dXJuO1xuXG4gICAgY29uc3Qgam9icyA9IFF1ZXVlLmpvYnMgfHwgW107XG5cbiAgICBmb3IgKGNvbnN0IGpvYiBvZiBqb2JzKSB7XG4gICAgICBjb25zdCBmdW5jU3RyID0gam9iLmhhbmRsZXIudG9TdHJpbmcoKTtcbiAgICAgIGNvbnN0IFtzdHJGdW5jdGlvbiwgbmFtZV0gPSBmdW5jU3RyLm1hdGNoKC9mdW5jdGlvblxccyhbYS16QS1aX10rKS4qPy8pO1xuICAgICAgaWYgKG5hbWUpIHRoaXMuY29udGFpbmVyLmJpbmQobmFtZSwgam9iKTtcbiAgICB9XG5cbiAgICBRdWV1ZS5pc1JlZ2lzdGVyZWQgPSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIFF1ZXVlO1xufSkoKTtcblxuZXhwb3J0IGRlZmF1bHQgUXVldWU7XG4iLCIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgZ3JvdXBCeSBmcm9tIFwiZ3JvdXAtYnlcIjtcbmltcG9ydCBMb2NhbFN0b3JhZ2UgZnJvbSBcIi4vc3RvcmFnZS9sb2NhbHN0b3JhZ2VcIjtcbmltcG9ydCB0eXBlIElDb25maWcgZnJvbSBcIi4uL2ludGVyZmFjZXMvY29uZmlnXCI7XG5pbXBvcnQgdHlwZSBJU3RvcmFnZSBmcm9tIFwiLi4vaW50ZXJmYWNlcy9zdG9yYWdlXCI7XG5pbXBvcnQgdHlwZSBJVGFzayBmcm9tIFwiLi4vaW50ZXJmYWNlcy90YXNrXCI7XG5pbXBvcnQgQ29uZmlnIGZyb20gXCIuL2NvbmZpZ1wiO1xuaW1wb3J0IHsgZXhjbHVkZVNwZWNpZmljVGFza3MsIGxpZm8sIGZpZm8gfSBmcm9tIFwiLi91dGlsc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdG9yYWdlQ2Fwc3VsZSB7XG4gIGNvbmZpZzogSUNvbmZpZztcbiAgc3RvcmFnZTogSVN0b3JhZ2U7XG4gIHN0b3JhZ2VDaGFubmVsOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBJQ29uZmlnLCBzdG9yYWdlOiBJU3RvcmFnZSkge1xuICAgIHRoaXMuc3RvcmFnZSA9IHN0b3JhZ2U7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gIH1cblxuICBjaGFubmVsKG5hbWU6IHN0cmluZyk6IFN0b3JhZ2VDYXBzdWxlIHtcbiAgICB0aGlzLnN0b3JhZ2VDaGFubmVsID0gbmFtZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGZldGNoKCk6IEFycmF5PGFueT4ge1xuICAgIGNvbnN0IGFsbCA9IHRoaXMuYWxsKCkuZmlsdGVyKGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzKTtcbiAgICBjb25zdCB0YXNrcyA9IGdyb3VwQnkoYWxsLCBcInByaW9yaXR5XCIpO1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0YXNrcylcbiAgICAgIC5tYXAoa2V5ID0+IHBhcnNlSW50KGtleSkpXG4gICAgICAuc29ydCgoYSwgYikgPT4gYiAtIGEpXG4gICAgICAucmVkdWNlKHRoaXMucmVkdWNlVGFza3ModGFza3MpLCBbXSk7XG4gIH1cblxuICBzYXZlKHRhc2s6IElUYXNrKTogc3RyaW5nIHwgYm9vbGVhbiB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIGdldCBhbGwgdGFza3MgY3VycmVudCBjaGFubmVsJ3NcbiAgICAgIGNvbnN0IHRhc2tzOiBJVGFza1tdID0gdGhpcy5zdG9yYWdlLmdldCh0aGlzLnN0b3JhZ2VDaGFubmVsKTtcblxuICAgICAgLy8gY2hlY2sgY2hhbm5lbCBsaW1pdC5cbiAgICAgIC8vIGlmIGxpbWl0IGlzIGV4Y2VlZGVkLCBkb2VzIG5vdCBpbnNlcnQgbmV3IHRhc2tcbiAgICAgIGlmICh0aGlzLmlzRXhjZWVkZWQoKSkge1xuICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgYFRhc2sgbGltaXQgZXhjZWVkZWQ6IFRoZSAnJHtcbiAgICAgICAgICAgIHRoaXMuc3RvcmFnZUNoYW5uZWxcbiAgICAgICAgICB9JyBjaGFubmVsIGxpbWl0IGlzICR7dGhpcy5jb25maWcuZ2V0KFwibGltaXRcIil9YFxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIHByZXBhcmUgYWxsIHByb3BlcnRpZXMgYmVmb3JlIHNhdmVcbiAgICAgIC8vIGV4YW1wbGU6IGNyZWF0ZWRBdCBldGMuXG4gICAgICB0YXNrID0gdGhpcy5wcmVwYXJlVGFzayh0YXNrKTtcblxuICAgICAgLy8gYWRkIHRhc2sgdG8gc3RvcmFnZVxuICAgICAgdGFza3MucHVzaCh0YXNrKTtcblxuICAgICAgLy8gc2F2ZSB0YXNrc1xuICAgICAgdGhpcy5zdG9yYWdlLnNldCh0aGlzLnN0b3JhZ2VDaGFubmVsLCBKU09OLnN0cmluZ2lmeSh0YXNrcykpO1xuXG4gICAgICByZXR1cm4gdGFzay5faWQ7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZShpZDogc3RyaW5nLCB1cGRhdGU6IHsgW3Byb3BlcnR5OiBzdHJpbmddOiBhbnkgfSk6IGJvb2xlYW4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkYXRhOiBhbnlbXSA9IHRoaXMuYWxsKCk7XG4gICAgICBjb25zdCBpbmRleDogbnVtYmVyID0gZGF0YS5maW5kSW5kZXgodCA9PiB0Ll9pZCA9PSBpZCk7XG5cbiAgICAgIGlmIChpbmRleCA8IDApIHJldHVybiBmYWxzZTtcblxuICAgICAgLy8gbWVyZ2UgZXhpc3Rpbmcgb2JqZWN0IHdpdGggZ2l2ZW4gdXBkYXRlIG9iamVjdFxuICAgICAgZGF0YVtpbmRleF0gPSBPYmplY3QuYXNzaWduKHt9LCBkYXRhW2luZGV4XSwgdXBkYXRlKTtcblxuICAgICAgLy8gc2F2ZSB0byB0aGUgc3RvcmFnZSBhcyBzdHJpbmdcbiAgICAgIHRoaXMuc3RvcmFnZS5zZXQodGhpcy5zdG9yYWdlQ2hhbm5lbCwgSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgZGVsZXRlKGlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZGF0YTogYW55W10gPSB0aGlzLmFsbCgpO1xuICAgICAgY29uc3QgaW5kZXg6IG51bWJlciA9IGRhdGEuZmluZEluZGV4KGQgPT4gZC5faWQgPT09IGlkKTtcblxuICAgICAgaWYgKGluZGV4IDwgMCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICBkZWxldGUgZGF0YVtpbmRleF07XG5cbiAgICAgIHRoaXMuc3RvcmFnZS5zZXQoXG4gICAgICAgIHRoaXMuc3RvcmFnZUNoYW5uZWwsXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KGRhdGEuZmlsdGVyKGQgPT4gZCkpXG4gICAgICApO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGFsbCgpOiBBcnJheTxhbnk+IHtcbiAgICByZXR1cm4gdGhpcy5zdG9yYWdlLmdldCh0aGlzLnN0b3JhZ2VDaGFubmVsKTtcbiAgfVxuXG4gIGdlbmVyYXRlSWQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gKCgxICsgTWF0aC5yYW5kb20oKSkgKiAweDEwMDAwKS50b1N0cmluZygxNik7XG4gIH1cblxuICBwcmVwYXJlVGFzayh0YXNrOiBJVGFzayk6IElUYXNrIHtcbiAgICB0YXNrLmNyZWF0ZWRBdCA9IERhdGUubm93KCk7XG4gICAgdGFzay5faWQgPSB0aGlzLmdlbmVyYXRlSWQoKTtcbiAgICByZXR1cm4gdGFzaztcbiAgfVxuXG4gIHJlZHVjZVRhc2tzKHRhc2tzOiBJVGFza1tdKSB7XG4gICAgY29uc3QgcmVkdWNlRnVuYyA9IChyZXN1bHQ6IElUYXNrW10sIGtleTogYW55KSA9PiB7XG4gICAgICBpZiAodGhpcy5jb25maWcuZ2V0KFwicHJpbmNpcGxlXCIpID09PSBcImxpZm9cIikge1xuICAgICAgICByZXR1cm4gcmVzdWx0LmNvbmNhdCh0YXNrc1trZXldLnNvcnQobGlmbykpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5jb25jYXQodGFza3Nba2V5XS5zb3J0KGZpZm8pKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIHJlZHVjZUZ1bmMuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGlzRXhjZWVkZWQoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgbGltaXQ6IG51bWJlciA9IHRoaXMuY29uZmlnLmdldChcImxpbWl0XCIpO1xuICAgIGNvbnN0IHRhc2tzOiBJVGFza1tdID0gdGhpcy5hbGwoKS5maWx0ZXIoZXhjbHVkZVNwZWNpZmljVGFza3MpO1xuICAgIHJldHVybiAhKGxpbWl0ID09PSAtMSB8fCBsaW1pdCA+IHRhc2tzLmxlbmd0aCk7XG4gIH1cblxuICBjbGVhcihjaGFubmVsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnN0b3JhZ2UuY2xlYXIoY2hhbm5lbCk7XG4gIH1cbn1cbiIsIi8qIEBmbG93ICovXG5cbmltcG9ydCB0eXBlIElTdG9yYWdlIGZyb20gJy4uLy4uL2ludGVyZmFjZXMvc3RvcmFnZSc7XG5pbXBvcnQgdHlwZSBJQ29uZmlnIGZyb20gJy4uLy4uL2ludGVyZmFjZXMvc3RvcmFnZSc7XG5pbXBvcnQgdHlwZSBJSm9iIGZyb20gJy4uLy4uL2ludGVyZmFjZXMvam9iJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9jYWxTdG9yYWdlIGltcGxlbWVudHMgSVN0b3JhZ2Uge1xuICBzdG9yYWdlOiBPYmplY3Q7XG4gIGNvbmZpZzogSUNvbmZpZztcblxuICBjb25zdHJ1Y3Rvcihjb25maWc6IElDb25maWcpIHtcbiAgICB0aGlzLnN0b3JhZ2UgPSBsb2NhbFN0b3JhZ2U7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gIH1cblxuICBnZXQoa2V5OiBzdHJpbmcpOiBBcnJheTxJSm9ifFtdPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG5hbWUgPSB0aGlzLnN0b3JhZ2VOYW1lKGtleSk7XG4gICAgICByZXR1cm4gdGhpcy5oYXMobmFtZSkgPyBKU09OLnBhcnNlKHRoaXMuc3RvcmFnZS5nZXRJdGVtKG5hbWUpKSA6IFtdO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfVxuXG4gIHNldChrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmFnZS5zZXRJdGVtKHRoaXMuc3RvcmFnZU5hbWUoa2V5KSwgdmFsdWUpO1xuICB9XG5cbiAgaGFzKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGtleSBpbiB0aGlzLnN0b3JhZ2U7XG4gIH1cblxuICBjbGVhcihrZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmFnZS5yZW1vdmVJdGVtKHRoaXMuc3RvcmFnZU5hbWUoa2V5KSk7XG4gIH1cblxuICBjbGVhckFsbCgpOiB2b2lkIHtcbiAgICB0aGlzLnN0b3JhZ2UuY2xlYXIoKTtcbiAgfVxuXG4gIHN0b3JhZ2VOYW1lKHN1ZmZpeDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIGAke3RoaXMuZ2V0UHJlZml4KCl9XyR7c3VmZml4fWA7XG4gIH1cblxuICBnZXRQcmVmaXgoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnLmdldCgncHJlZml4Jyk7XG4gIH1cbn1cbiIsIi8qIEBmbG93ICovXG5pbXBvcnQgdHlwZSBJVGFzayBmcm9tICcuLi9pbnRlcmZhY2VzL3Rhc2snO1xuXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUob2JqOiBPYmplY3QpIHtcbiAgdmFyIG5ld0NsYXNzID0gT2JqZWN0LmNyZWF0ZShcbiAgICBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKSxcbiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvYmopLnJlZHVjZSgocHJvcHMsIG5hbWUpID0+IHtcbiAgICAgIHByb3BzW25hbWVdID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmosIG5hbWUpO1xuICAgICAgcmV0dXJuIHByb3BzO1xuICAgIH0sIHt9KVxuICApO1xuXG4gIGlmICghIE9iamVjdC5pc0V4dGVuc2libGUob2JqKSkge1xuICAgIE9iamVjdC5wcmV2ZW50RXh0ZW5zaW9ucyhuZXdDbGFzcyk7XG4gIH1cbiAgaWYgKE9iamVjdC5pc1NlYWxlZChvYmopKSB7XG4gICAgT2JqZWN0LnNlYWwobmV3Q2xhc3MpO1xuICB9XG4gIGlmIChPYmplY3QuaXNGcm96ZW4ob2JqKSkge1xuICAgIE9iamVjdC5mcmVlemUobmV3Q2xhc3MpO1xuICB9XG5cbiAgcmV0dXJuIG5ld0NsYXNzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzUHJvcGVydHkob2JqOiBGdW5jdGlvbiwgbmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBuYW1lKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc01ldGhvZChpbnN0YW5jZTogYW55LCBtZXRob2Q6IHN0cmluZykge1xuICByZXR1cm4gaW5zdGFuY2UgaW5zdGFuY2VvZiBPYmplY3QgJiYgKG1ldGhvZCBpbiBpbnN0YW5jZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Z1bmN0aW9uKGZ1bmM6IEZ1bmN0aW9uKSB7XG4gIHJldHVybiBmdW5jIGluc3RhbmNlb2YgRnVuY3Rpb247XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleGNsdWRlU3BlY2lmaWNUYXNrcyh0YXNrOiBJVGFzaykge1xuICBjb25zdCBjb25kaXRpb25zID0gQXJyYXkuaXNBcnJheSh0aGlzKSA/IHRoaXMgOiBbJ2ZyZWV6ZWQnLCAnbG9ja2VkJ107XG4gIGNvbnN0IHJlc3VsdHMgPSBbXTtcblxuICBmb3IgKGNvbnN0IGMgb2YgY29uZGl0aW9ucykge1xuICAgIHJlc3VsdHMucHVzaChoYXNQcm9wZXJ0eSh0YXNrLCBjKSA9PT0gZmFsc2UgfHwgdGFza1tjXSA9PT0gZmFsc2UpO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdHMuaW5kZXhPZihmYWxzZSkgPiAtMSA/IGZhbHNlIDogdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHV0aWxDbGVhckJ5VGFnKHRhc2s6IElUYXNrKTogYm9vbGVhbiB7XG4gIGlmICghIGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzLmNhbGwoWydsb2NrZWQnXSwgdGFzaykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRhc2sudGFnID09PSB0aGlzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmlmbyhhOiBJVGFzaywgYjogSVRhc2spIHtcbiAgcmV0dXJuIGEuY3JlYXRlZEF0IC0gYi5jcmVhdGVkQXQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaWZvKGE6IElUYXNrLCBiOiBJVGFzaykge1xuICByZXR1cm4gYi5jcmVhdGVkQXQgLSBhLmNyZWF0ZWRBdDtcbn1cbiJdfQ==
