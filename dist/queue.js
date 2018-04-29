(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = require("regenerator-runtime");

},{"regenerator-runtime":10}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
(function (process){
/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  '#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC',
  '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF',
  '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC',
  '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF',
  '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC',
  '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033',
  '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366',
  '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933',
  '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC',
  '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF',
  '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // Internet Explorer and Edge do not support colors.
  if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
    return false;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}

}).call(this,require('_process'))

},{"./debug":4,"_process":9}],4:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * Active `debug` instances.
 */
exports.instances = [];

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  var prevTime;

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);
  debug.destroy = destroy;

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  exports.instances.push(debug);

  return debug;
}

function destroy () {
  var index = exports.instances.indexOf(this);
  if (index !== -1) {
    exports.instances.splice(index, 1);
    return true;
  } else {
    return false;
  }
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var i;
  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }

  for (i = 0; i < exports.instances.length; i++) {
    var instance = exports.instances[i];
    instance.enabled = exports.enabled(instance.namespace);
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  if (name[name.length - 1] === '*') {
    return true;
  }
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":7}],5:[function(require,module,exports){

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
},{"to-function":12}],6:[function(require,module,exports){
(function (global){
/*!
    localForage -- Offline Storage, Improved
    Version 1.7.1
    https://localforage.github.io/localForage
    (c) 2013-2017 Mozilla, Apache License 2.0
*/
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.localforage = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw (f.code="MODULE_NOT_FOUND", f)}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
(function (global){
'use strict';
var Mutation = global.MutationObserver || global.WebKitMutationObserver;

var scheduleDrain;

{
  if (Mutation) {
    var called = 0;
    var observer = new Mutation(nextTick);
    var element = global.document.createTextNode('');
    observer.observe(element, {
      characterData: true
    });
    scheduleDrain = function () {
      element.data = (called = ++called % 2);
    };
  } else if (!global.setImmediate && typeof global.MessageChannel !== 'undefined') {
    var channel = new global.MessageChannel();
    channel.port1.onmessage = nextTick;
    scheduleDrain = function () {
      channel.port2.postMessage(0);
    };
  } else if ('document' in global && 'onreadystatechange' in global.document.createElement('script')) {
    scheduleDrain = function () {

      // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
      // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
      var scriptEl = global.document.createElement('script');
      scriptEl.onreadystatechange = function () {
        nextTick();

        scriptEl.onreadystatechange = null;
        scriptEl.parentNode.removeChild(scriptEl);
        scriptEl = null;
      };
      global.document.documentElement.appendChild(scriptEl);
    };
  } else {
    scheduleDrain = function () {
      setTimeout(nextTick, 0);
    };
  }
}

var draining;
var queue = [];
//named nextTick for less confusing stack traces
function nextTick() {
  draining = true;
  var i, oldQueue;
  var len = queue.length;
  while (len) {
    oldQueue = queue;
    queue = [];
    i = -1;
    while (++i < len) {
      oldQueue[i]();
    }
    len = queue.length;
  }
  draining = false;
}

module.exports = immediate;
function immediate(task) {
  if (queue.push(task) === 1 && !draining) {
    scheduleDrain();
  }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(_dereq_,module,exports){
'use strict';
var immediate = _dereq_(1);

/* istanbul ignore next */
function INTERNAL() {}

var handlers = {};

var REJECTED = ['REJECTED'];
var FULFILLED = ['FULFILLED'];
var PENDING = ['PENDING'];

module.exports = Promise;

function Promise(resolver) {
  if (typeof resolver !== 'function') {
    throw new TypeError('resolver must be a function');
  }
  this.state = PENDING;
  this.queue = [];
  this.outcome = void 0;
  if (resolver !== INTERNAL) {
    safelyResolveThenable(this, resolver);
  }
}

Promise.prototype["catch"] = function (onRejected) {
  return this.then(null, onRejected);
};
Promise.prototype.then = function (onFulfilled, onRejected) {
  if (typeof onFulfilled !== 'function' && this.state === FULFILLED ||
    typeof onRejected !== 'function' && this.state === REJECTED) {
    return this;
  }
  var promise = new this.constructor(INTERNAL);
  if (this.state !== PENDING) {
    var resolver = this.state === FULFILLED ? onFulfilled : onRejected;
    unwrap(promise, resolver, this.outcome);
  } else {
    this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
  }

  return promise;
};
function QueueItem(promise, onFulfilled, onRejected) {
  this.promise = promise;
  if (typeof onFulfilled === 'function') {
    this.onFulfilled = onFulfilled;
    this.callFulfilled = this.otherCallFulfilled;
  }
  if (typeof onRejected === 'function') {
    this.onRejected = onRejected;
    this.callRejected = this.otherCallRejected;
  }
}
QueueItem.prototype.callFulfilled = function (value) {
  handlers.resolve(this.promise, value);
};
QueueItem.prototype.otherCallFulfilled = function (value) {
  unwrap(this.promise, this.onFulfilled, value);
};
QueueItem.prototype.callRejected = function (value) {
  handlers.reject(this.promise, value);
};
QueueItem.prototype.otherCallRejected = function (value) {
  unwrap(this.promise, this.onRejected, value);
};

function unwrap(promise, func, value) {
  immediate(function () {
    var returnValue;
    try {
      returnValue = func(value);
    } catch (e) {
      return handlers.reject(promise, e);
    }
    if (returnValue === promise) {
      handlers.reject(promise, new TypeError('Cannot resolve promise with itself'));
    } else {
      handlers.resolve(promise, returnValue);
    }
  });
}

handlers.resolve = function (self, value) {
  var result = tryCatch(getThen, value);
  if (result.status === 'error') {
    return handlers.reject(self, result.value);
  }
  var thenable = result.value;

  if (thenable) {
    safelyResolveThenable(self, thenable);
  } else {
    self.state = FULFILLED;
    self.outcome = value;
    var i = -1;
    var len = self.queue.length;
    while (++i < len) {
      self.queue[i].callFulfilled(value);
    }
  }
  return self;
};
handlers.reject = function (self, error) {
  self.state = REJECTED;
  self.outcome = error;
  var i = -1;
  var len = self.queue.length;
  while (++i < len) {
    self.queue[i].callRejected(error);
  }
  return self;
};

function getThen(obj) {
  // Make sure we only access the accessor once as required by the spec
  var then = obj && obj.then;
  if (obj && (typeof obj === 'object' || typeof obj === 'function') && typeof then === 'function') {
    return function appyThen() {
      then.apply(obj, arguments);
    };
  }
}

function safelyResolveThenable(self, thenable) {
  // Either fulfill, reject or reject with error
  var called = false;
  function onError(value) {
    if (called) {
      return;
    }
    called = true;
    handlers.reject(self, value);
  }

  function onSuccess(value) {
    if (called) {
      return;
    }
    called = true;
    handlers.resolve(self, value);
  }

  function tryToUnwrap() {
    thenable(onSuccess, onError);
  }

  var result = tryCatch(tryToUnwrap);
  if (result.status === 'error') {
    onError(result.value);
  }
}

function tryCatch(func, value) {
  var out = {};
  try {
    out.value = func(value);
    out.status = 'success';
  } catch (e) {
    out.status = 'error';
    out.value = e;
  }
  return out;
}

Promise.resolve = resolve;
function resolve(value) {
  if (value instanceof this) {
    return value;
  }
  return handlers.resolve(new this(INTERNAL), value);
}

Promise.reject = reject;
function reject(reason) {
  var promise = new this(INTERNAL);
  return handlers.reject(promise, reason);
}

Promise.all = all;
function all(iterable) {
  var self = this;
  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
    return this.reject(new TypeError('must be an array'));
  }

  var len = iterable.length;
  var called = false;
  if (!len) {
    return this.resolve([]);
  }

  var values = new Array(len);
  var resolved = 0;
  var i = -1;
  var promise = new this(INTERNAL);

  while (++i < len) {
    allResolver(iterable[i], i);
  }
  return promise;
  function allResolver(value, i) {
    self.resolve(value).then(resolveFromAll, function (error) {
      if (!called) {
        called = true;
        handlers.reject(promise, error);
      }
    });
    function resolveFromAll(outValue) {
      values[i] = outValue;
      if (++resolved === len && !called) {
        called = true;
        handlers.resolve(promise, values);
      }
    }
  }
}

Promise.race = race;
function race(iterable) {
  var self = this;
  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
    return this.reject(new TypeError('must be an array'));
  }

  var len = iterable.length;
  var called = false;
  if (!len) {
    return this.resolve([]);
  }

  var i = -1;
  var promise = new this(INTERNAL);

  while (++i < len) {
    resolver(iterable[i]);
  }
  return promise;
  function resolver(value) {
    self.resolve(value).then(function (response) {
      if (!called) {
        called = true;
        handlers.resolve(promise, response);
      }
    }, function (error) {
      if (!called) {
        called = true;
        handlers.reject(promise, error);
      }
    });
  }
}

},{"1":1}],3:[function(_dereq_,module,exports){
(function (global){
'use strict';
if (typeof global.Promise !== 'function') {
  global.Promise = _dereq_(2);
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"2":2}],4:[function(_dereq_,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function getIDB() {
    /* global indexedDB,webkitIndexedDB,mozIndexedDB,OIndexedDB,msIndexedDB */
    try {
        if (typeof indexedDB !== 'undefined') {
            return indexedDB;
        }
        if (typeof webkitIndexedDB !== 'undefined') {
            return webkitIndexedDB;
        }
        if (typeof mozIndexedDB !== 'undefined') {
            return mozIndexedDB;
        }
        if (typeof OIndexedDB !== 'undefined') {
            return OIndexedDB;
        }
        if (typeof msIndexedDB !== 'undefined') {
            return msIndexedDB;
        }
    } catch (e) {
        return;
    }
}

var idb = getIDB();

function isIndexedDBValid() {
    try {
        // Initialize IndexedDB; fall back to vendor-prefixed versions
        // if needed.
        if (!idb) {
            return false;
        }
        // We mimic PouchDB here;
        //
        // We test for openDatabase because IE Mobile identifies itself
        // as Safari. Oh the lulz...
        var isSafari = typeof openDatabase !== 'undefined' && /(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent) && !/BlackBerry/.test(navigator.platform);

        var hasFetch = typeof fetch === 'function' && fetch.toString().indexOf('[native code') !== -1;

        // Safari <10.1 does not meet our requirements for IDB support (#5572)
        // since Safari 10.1 shipped with fetch, we can use that to detect it
        return (!isSafari || hasFetch) && typeof indexedDB !== 'undefined' &&
        // some outdated implementations of IDB that appear on Samsung
        // and HTC Android devices <4.4 are missing IDBKeyRange
        // See: https://github.com/mozilla/localForage/issues/128
        // See: https://github.com/mozilla/localForage/issues/272
        typeof IDBKeyRange !== 'undefined';
    } catch (e) {
        return false;
    }
}

// Abstracts constructing a Blob object, so it also works in older
// browsers that don't support the native Blob constructor. (i.e.
// old QtWebKit versions, at least).
// Abstracts constructing a Blob object, so it also works in older
// browsers that don't support the native Blob constructor. (i.e.
// old QtWebKit versions, at least).
function createBlob(parts, properties) {
    /* global BlobBuilder,MSBlobBuilder,MozBlobBuilder,WebKitBlobBuilder */
    parts = parts || [];
    properties = properties || {};
    try {
        return new Blob(parts, properties);
    } catch (e) {
        if (e.name !== 'TypeError') {
            throw e;
        }
        var Builder = typeof BlobBuilder !== 'undefined' ? BlobBuilder : typeof MSBlobBuilder !== 'undefined' ? MSBlobBuilder : typeof MozBlobBuilder !== 'undefined' ? MozBlobBuilder : WebKitBlobBuilder;
        var builder = new Builder();
        for (var i = 0; i < parts.length; i += 1) {
            builder.append(parts[i]);
        }
        return builder.getBlob(properties.type);
    }
}

// This is CommonJS because lie is an external dependency, so Rollup
// can just ignore it.
if (typeof Promise === 'undefined') {
    // In the "nopromises" build this will just throw if you don't have
    // a global promise object, but it would throw anyway later.
    _dereq_(3);
}
var Promise$1 = Promise;

function executeCallback(promise, callback) {
    if (callback) {
        promise.then(function (result) {
            callback(null, result);
        }, function (error) {
            callback(error);
        });
    }
}

function executeTwoCallbacks(promise, callback, errorCallback) {
    if (typeof callback === 'function') {
        promise.then(callback);
    }

    if (typeof errorCallback === 'function') {
        promise["catch"](errorCallback);
    }
}

function normalizeKey(key) {
    // Cast the key to a string, as that's all we can set as a key.
    if (typeof key !== 'string') {
        console.warn(key + ' used as a key, but it is not a string.');
        key = String(key);
    }

    return key;
}

function getCallback() {
    if (arguments.length && typeof arguments[arguments.length - 1] === 'function') {
        return arguments[arguments.length - 1];
    }
}

// Some code originally from async_storage.js in
// [Gaia](https://github.com/mozilla-b2g/gaia).

var DETECT_BLOB_SUPPORT_STORE = 'local-forage-detect-blob-support';
var supportsBlobs = void 0;
var dbContexts = {};
var toString = Object.prototype.toString;

// Transaction Modes
var READ_ONLY = 'readonly';
var READ_WRITE = 'readwrite';

// Transform a binary string to an array buffer, because otherwise
// weird stuff happens when you try to work with the binary string directly.
// It is known.
// From http://stackoverflow.com/questions/14967647/ (continues on next line)
// encode-decode-image-with-base64-breaks-image (2013-04-21)
function _binStringToArrayBuffer(bin) {
    var length = bin.length;
    var buf = new ArrayBuffer(length);
    var arr = new Uint8Array(buf);
    for (var i = 0; i < length; i++) {
        arr[i] = bin.charCodeAt(i);
    }
    return buf;
}

//
// Blobs are not supported in all versions of IndexedDB, notably
// Chrome <37 and Android <5. In those versions, storing a blob will throw.
//
// Various other blob bugs exist in Chrome v37-42 (inclusive).
// Detecting them is expensive and confusing to users, and Chrome 37-42
// is at very low usage worldwide, so we do a hacky userAgent check instead.
//
// content-type bug: https://code.google.com/p/chromium/issues/detail?id=408120
// 404 bug: https://code.google.com/p/chromium/issues/detail?id=447916
// FileReader bug: https://code.google.com/p/chromium/issues/detail?id=447836
//
// Code borrowed from PouchDB. See:
// https://github.com/pouchdb/pouchdb/blob/master/packages/node_modules/pouchdb-adapter-idb/src/blobSupport.js
//
function _checkBlobSupportWithoutCaching(idb) {
    return new Promise$1(function (resolve) {
        var txn = idb.transaction(DETECT_BLOB_SUPPORT_STORE, READ_WRITE);
        var blob = createBlob(['']);
        txn.objectStore(DETECT_BLOB_SUPPORT_STORE).put(blob, 'key');

        txn.onabort = function (e) {
            // If the transaction aborts now its due to not being able to
            // write to the database, likely due to the disk being full
            e.preventDefault();
            e.stopPropagation();
            resolve(false);
        };

        txn.oncomplete = function () {
            var matchedChrome = navigator.userAgent.match(/Chrome\/(\d+)/);
            var matchedEdge = navigator.userAgent.match(/Edge\//);
            // MS Edge pretends to be Chrome 42:
            // https://msdn.microsoft.com/en-us/library/hh869301%28v=vs.85%29.aspx
            resolve(matchedEdge || !matchedChrome || parseInt(matchedChrome[1], 10) >= 43);
        };
    })["catch"](function () {
        return false; // error, so assume unsupported
    });
}

function _checkBlobSupport(idb) {
    if (typeof supportsBlobs === 'boolean') {
        return Promise$1.resolve(supportsBlobs);
    }
    return _checkBlobSupportWithoutCaching(idb).then(function (value) {
        supportsBlobs = value;
        return supportsBlobs;
    });
}

function _deferReadiness(dbInfo) {
    var dbContext = dbContexts[dbInfo.name];

    // Create a deferred object representing the current database operation.
    var deferredOperation = {};

    deferredOperation.promise = new Promise$1(function (resolve, reject) {
        deferredOperation.resolve = resolve;
        deferredOperation.reject = reject;
    });

    // Enqueue the deferred operation.
    dbContext.deferredOperations.push(deferredOperation);

    // Chain its promise to the database readiness.
    if (!dbContext.dbReady) {
        dbContext.dbReady = deferredOperation.promise;
    } else {
        dbContext.dbReady = dbContext.dbReady.then(function () {
            return deferredOperation.promise;
        });
    }
}

function _advanceReadiness(dbInfo) {
    var dbContext = dbContexts[dbInfo.name];

    // Dequeue a deferred operation.
    var deferredOperation = dbContext.deferredOperations.pop();

    // Resolve its promise (which is part of the database readiness
    // chain of promises).
    if (deferredOperation) {
        deferredOperation.resolve();
        return deferredOperation.promise;
    }
}

function _rejectReadiness(dbInfo, err) {
    var dbContext = dbContexts[dbInfo.name];

    // Dequeue a deferred operation.
    var deferredOperation = dbContext.deferredOperations.pop();

    // Reject its promise (which is part of the database readiness
    // chain of promises).
    if (deferredOperation) {
        deferredOperation.reject(err);
        return deferredOperation.promise;
    }
}

function _getConnection(dbInfo, upgradeNeeded) {
    return new Promise$1(function (resolve, reject) {
        dbContexts[dbInfo.name] = dbContexts[dbInfo.name] || createDbContext();

        if (dbInfo.db) {
            if (upgradeNeeded) {
                _deferReadiness(dbInfo);
                dbInfo.db.close();
            } else {
                return resolve(dbInfo.db);
            }
        }

        var dbArgs = [dbInfo.name];

        if (upgradeNeeded) {
            dbArgs.push(dbInfo.version);
        }

        var openreq = idb.open.apply(idb, dbArgs);

        if (upgradeNeeded) {
            openreq.onupgradeneeded = function (e) {
                var db = openreq.result;
                try {
                    db.createObjectStore(dbInfo.storeName);
                    if (e.oldVersion <= 1) {
                        // Added when support for blob shims was added
                        db.createObjectStore(DETECT_BLOB_SUPPORT_STORE);
                    }
                } catch (ex) {
                    if (ex.name === 'ConstraintError') {
                        console.warn('The database "' + dbInfo.name + '"' + ' has been upgraded from version ' + e.oldVersion + ' to version ' + e.newVersion + ', but the storage "' + dbInfo.storeName + '" already exists.');
                    } else {
                        throw ex;
                    }
                }
            };
        }

        openreq.onerror = function (e) {
            e.preventDefault();
            reject(openreq.error);
        };

        openreq.onsuccess = function () {
            resolve(openreq.result);
            _advanceReadiness(dbInfo);
        };
    });
}

function _getOriginalConnection(dbInfo) {
    return _getConnection(dbInfo, false);
}

function _getUpgradedConnection(dbInfo) {
    return _getConnection(dbInfo, true);
}

function _isUpgradeNeeded(dbInfo, defaultVersion) {
    if (!dbInfo.db) {
        return true;
    }

    var isNewStore = !dbInfo.db.objectStoreNames.contains(dbInfo.storeName);
    var isDowngrade = dbInfo.version < dbInfo.db.version;
    var isUpgrade = dbInfo.version > dbInfo.db.version;

    if (isDowngrade) {
        // If the version is not the default one
        // then warn for impossible downgrade.
        if (dbInfo.version !== defaultVersion) {
            console.warn('The database "' + dbInfo.name + '"' + " can't be downgraded from version " + dbInfo.db.version + ' to version ' + dbInfo.version + '.');
        }
        // Align the versions to prevent errors.
        dbInfo.version = dbInfo.db.version;
    }

    if (isUpgrade || isNewStore) {
        // If the store is new then increment the version (if needed).
        // This will trigger an "upgradeneeded" event which is required
        // for creating a store.
        if (isNewStore) {
            var incVersion = dbInfo.db.version + 1;
            if (incVersion > dbInfo.version) {
                dbInfo.version = incVersion;
            }
        }

        return true;
    }

    return false;
}

// encode a blob for indexeddb engines that don't support blobs
function _encodeBlob(blob) {
    return new Promise$1(function (resolve, reject) {
        var reader = new FileReader();
        reader.onerror = reject;
        reader.onloadend = function (e) {
            var base64 = btoa(e.target.result || '');
            resolve({
                __local_forage_encoded_blob: true,
                data: base64,
                type: blob.type
            });
        };
        reader.readAsBinaryString(blob);
    });
}

// decode an encoded blob
function _decodeBlob(encodedBlob) {
    var arrayBuff = _binStringToArrayBuffer(atob(encodedBlob.data));
    return createBlob([arrayBuff], { type: encodedBlob.type });
}

// is this one of our fancy encoded blobs?
function _isEncodedBlob(value) {
    return value && value.__local_forage_encoded_blob;
}

// Specialize the default `ready()` function by making it dependent
// on the current database operations. Thus, the driver will be actually
// ready when it's been initialized (default) *and* there are no pending
// operations on the database (initiated by some other instances).
function _fullyReady(callback) {
    var self = this;

    var promise = self._initReady().then(function () {
        var dbContext = dbContexts[self._dbInfo.name];

        if (dbContext && dbContext.dbReady) {
            return dbContext.dbReady;
        }
    });

    executeTwoCallbacks(promise, callback, callback);
    return promise;
}

// Try to establish a new db connection to replace the
// current one which is broken (i.e. experiencing
// InvalidStateError while creating a transaction).
function _tryReconnect(dbInfo) {
    _deferReadiness(dbInfo);

    var dbContext = dbContexts[dbInfo.name];
    var forages = dbContext.forages;

    for (var i = 0; i < forages.length; i++) {
        var forage = forages[i];
        if (forage._dbInfo.db) {
            forage._dbInfo.db.close();
            forage._dbInfo.db = null;
        }
    }
    dbInfo.db = null;

    return _getOriginalConnection(dbInfo).then(function (db) {
        dbInfo.db = db;
        if (_isUpgradeNeeded(dbInfo)) {
            // Reopen the database for upgrading.
            return _getUpgradedConnection(dbInfo);
        }
        return db;
    }).then(function (db) {
        // store the latest db reference
        // in case the db was upgraded
        dbInfo.db = dbContext.db = db;
        for (var i = 0; i < forages.length; i++) {
            forages[i]._dbInfo.db = db;
        }
    })["catch"](function (err) {
        _rejectReadiness(dbInfo, err);
        throw err;
    });
}

// FF doesn't like Promises (micro-tasks) and IDDB store operations,
// so we have to do it with callbacks
function createTransaction(dbInfo, mode, callback, retries) {
    if (retries === undefined) {
        retries = 1;
    }

    try {
        var tx = dbInfo.db.transaction(dbInfo.storeName, mode);
        callback(null, tx);
    } catch (err) {
        if (retries > 0 && (!dbInfo.db || err.name === 'InvalidStateError' || err.name === 'NotFoundError')) {
            return Promise$1.resolve().then(function () {
                if (!dbInfo.db || err.name === 'NotFoundError' && !dbInfo.db.objectStoreNames.contains(dbInfo.storeName) && dbInfo.version <= dbInfo.db.version) {
                    // increase the db version, to create the new ObjectStore
                    if (dbInfo.db) {
                        dbInfo.version = dbInfo.db.version + 1;
                    }
                    // Reopen the database for upgrading.
                    return _getUpgradedConnection(dbInfo);
                }
            }).then(function () {
                return _tryReconnect(dbInfo).then(function () {
                    createTransaction(dbInfo, mode, callback, retries - 1);
                });
            })["catch"](callback);
        }

        callback(err);
    }
}

function createDbContext() {
    return {
        // Running localForages sharing a database.
        forages: [],
        // Shared database.
        db: null,
        // Database readiness (promise).
        dbReady: null,
        // Deferred operations on the database.
        deferredOperations: []
    };
}

// Open the IndexedDB database (automatically creates one if one didn't
// previously exist), using any options set in the config.
function _initStorage(options) {
    var self = this;
    var dbInfo = {
        db: null
    };

    if (options) {
        for (var i in options) {
            dbInfo[i] = options[i];
        }
    }

    // Get the current context of the database;
    var dbContext = dbContexts[dbInfo.name];

    // ...or create a new context.
    if (!dbContext) {
        dbContext = createDbContext();
        // Register the new context in the global container.
        dbContexts[dbInfo.name] = dbContext;
    }

    // Register itself as a running localForage in the current context.
    dbContext.forages.push(self);

    // Replace the default `ready()` function with the specialized one.
    if (!self._initReady) {
        self._initReady = self.ready;
        self.ready = _fullyReady;
    }

    // Create an array of initialization states of the related localForages.
    var initPromises = [];

    function ignoreErrors() {
        // Don't handle errors here,
        // just makes sure related localForages aren't pending.
        return Promise$1.resolve();
    }

    for (var j = 0; j < dbContext.forages.length; j++) {
        var forage = dbContext.forages[j];
        if (forage !== self) {
            // Don't wait for itself...
            initPromises.push(forage._initReady()["catch"](ignoreErrors));
        }
    }

    // Take a snapshot of the related localForages.
    var forages = dbContext.forages.slice(0);

    // Initialize the connection process only when
    // all the related localForages aren't pending.
    return Promise$1.all(initPromises).then(function () {
        dbInfo.db = dbContext.db;
        // Get the connection or open a new one without upgrade.
        return _getOriginalConnection(dbInfo);
    }).then(function (db) {
        dbInfo.db = db;
        if (_isUpgradeNeeded(dbInfo, self._defaultConfig.version)) {
            // Reopen the database for upgrading.
            return _getUpgradedConnection(dbInfo);
        }
        return db;
    }).then(function (db) {
        dbInfo.db = dbContext.db = db;
        self._dbInfo = dbInfo;
        // Share the final connection amongst related localForages.
        for (var k = 0; k < forages.length; k++) {
            var forage = forages[k];
            if (forage !== self) {
                // Self is already up-to-date.
                forage._dbInfo.db = dbInfo.db;
                forage._dbInfo.version = dbInfo.version;
            }
        }
    });
}

function getItem(key, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    var req = store.get(key);

                    req.onsuccess = function () {
                        var value = req.result;
                        if (value === undefined) {
                            value = null;
                        }
                        if (_isEncodedBlob(value)) {
                            value = _decodeBlob(value);
                        }
                        resolve(value);
                    };

                    req.onerror = function () {
                        reject(req.error);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

// Iterate over all items stored in database.
function iterate(iterator, callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    var req = store.openCursor();
                    var iterationNumber = 1;

                    req.onsuccess = function () {
                        var cursor = req.result;

                        if (cursor) {
                            var value = cursor.value;
                            if (_isEncodedBlob(value)) {
                                value = _decodeBlob(value);
                            }
                            var result = iterator(value, cursor.key, iterationNumber++);

                            // when the iterator callback retuns any
                            // (non-`undefined`) value, then we stop
                            // the iteration immediately
                            if (result !== void 0) {
                                resolve(result);
                            } else {
                                cursor["continue"]();
                            }
                        } else {
                            resolve();
                        }
                    };

                    req.onerror = function () {
                        reject(req.error);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);

    return promise;
}

function setItem(key, value, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = new Promise$1(function (resolve, reject) {
        var dbInfo;
        self.ready().then(function () {
            dbInfo = self._dbInfo;
            if (toString.call(value) === '[object Blob]') {
                return _checkBlobSupport(dbInfo.db).then(function (blobSupport) {
                    if (blobSupport) {
                        return value;
                    }
                    return _encodeBlob(value);
                });
            }
            return value;
        }).then(function (value) {
            createTransaction(self._dbInfo, READ_WRITE, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);

                    // The reason we don't _save_ null is because IE 10 does
                    // not support saving the `null` type in IndexedDB. How
                    // ironic, given the bug below!
                    // See: https://github.com/mozilla/localForage/issues/161
                    if (value === null) {
                        value = undefined;
                    }

                    var req = store.put(value, key);

                    transaction.oncomplete = function () {
                        // Cast to undefined so the value passed to
                        // callback/promise is the same as what one would get out
                        // of `getItem()` later. This leads to some weirdness
                        // (setItem('foo', undefined) will return `null`), but
                        // it's not my fault localStorage is our baseline and that
                        // it's weird.
                        if (value === undefined) {
                            value = null;
                        }

                        resolve(value);
                    };
                    transaction.onabort = transaction.onerror = function () {
                        var err = req.error ? req.error : req.transaction.error;
                        reject(err);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function removeItem(key, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_WRITE, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    // We use a Grunt task to make this safe for IE and some
                    // versions of Android (including those used by Cordova).
                    // Normally IE won't like `.delete()` and will insist on
                    // using `['delete']()`, but we have a build step that
                    // fixes this for us now.
                    var req = store["delete"](key);
                    transaction.oncomplete = function () {
                        resolve();
                    };

                    transaction.onerror = function () {
                        reject(req.error);
                    };

                    // The request will be also be aborted if we've exceeded our storage
                    // space.
                    transaction.onabort = function () {
                        var err = req.error ? req.error : req.transaction.error;
                        reject(err);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function clear(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_WRITE, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    var req = store.clear();

                    transaction.oncomplete = function () {
                        resolve();
                    };

                    transaction.onabort = transaction.onerror = function () {
                        var err = req.error ? req.error : req.transaction.error;
                        reject(err);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function length(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    var req = store.count();

                    req.onsuccess = function () {
                        resolve(req.result);
                    };

                    req.onerror = function () {
                        reject(req.error);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function key(n, callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        if (n < 0) {
            resolve(null);

            return;
        }

        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    var advanced = false;
                    var req = store.openCursor();

                    req.onsuccess = function () {
                        var cursor = req.result;
                        if (!cursor) {
                            // this means there weren't enough keys
                            resolve(null);

                            return;
                        }

                        if (n === 0) {
                            // We have the first key, return it if that's what they
                            // wanted.
                            resolve(cursor.key);
                        } else {
                            if (!advanced) {
                                // Otherwise, ask the cursor to skip ahead n
                                // records.
                                advanced = true;
                                cursor.advance(n);
                            } else {
                                // When we get here, we've got the nth key.
                                resolve(cursor.key);
                            }
                        }
                    };

                    req.onerror = function () {
                        reject(req.error);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function keys(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    var req = store.openCursor();
                    var keys = [];

                    req.onsuccess = function () {
                        var cursor = req.result;

                        if (!cursor) {
                            resolve(keys);
                            return;
                        }

                        keys.push(cursor.key);
                        cursor["continue"]();
                    };

                    req.onerror = function () {
                        reject(req.error);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function dropInstance(options, callback) {
    callback = getCallback.apply(this, arguments);

    var currentConfig = this.config();
    options = typeof options !== 'function' && options || {};
    if (!options.name) {
        options.name = options.name || currentConfig.name;
        options.storeName = options.storeName || currentConfig.storeName;
    }

    var self = this;
    var promise;
    if (!options.name) {
        promise = Promise$1.reject('Invalid arguments');
    } else {
        var isCurrentDb = options.name === currentConfig.name && self._dbInfo.db;

        var dbPromise = isCurrentDb ? Promise$1.resolve(self._dbInfo.db) : _getOriginalConnection(options).then(function (db) {
            var dbContext = dbContexts[options.name];
            var forages = dbContext.forages;
            dbContext.db = db;
            for (var i = 0; i < forages.length; i++) {
                forages[i]._dbInfo.db = db;
            }
            return db;
        });

        if (!options.storeName) {
            promise = dbPromise.then(function (db) {
                _deferReadiness(options);

                var dbContext = dbContexts[options.name];
                var forages = dbContext.forages;

                db.close();
                for (var i = 0; i < forages.length; i++) {
                    var forage = forages[i];
                    forage._dbInfo.db = null;
                }

                var dropDBPromise = new Promise$1(function (resolve, reject) {
                    var req = idb.deleteDatabase(options.name);

                    req.onerror = req.onblocked = function (err) {
                        var db = req.result;
                        if (db) {
                            db.close();
                        }
                        reject(err);
                    };

                    req.onsuccess = function () {
                        var db = req.result;
                        if (db) {
                            db.close();
                        }
                        resolve(db);
                    };
                });

                return dropDBPromise.then(function (db) {
                    dbContext.db = db;
                    for (var i = 0; i < forages.length; i++) {
                        var _forage = forages[i];
                        _advanceReadiness(_forage._dbInfo);
                    }
                })["catch"](function (err) {
                    (_rejectReadiness(options, err) || Promise$1.resolve())["catch"](function () {});
                    throw err;
                });
            });
        } else {
            promise = dbPromise.then(function (db) {
                if (!db.objectStoreNames.contains(options.storeName)) {
                    return;
                }

                var newVersion = db.version + 1;

                _deferReadiness(options);

                var dbContext = dbContexts[options.name];
                var forages = dbContext.forages;

                db.close();
                for (var i = 0; i < forages.length; i++) {
                    var forage = forages[i];
                    forage._dbInfo.db = null;
                    forage._dbInfo.version = newVersion;
                }

                var dropObjectPromise = new Promise$1(function (resolve, reject) {
                    var req = idb.open(options.name, newVersion);

                    req.onerror = function (err) {
                        var db = req.result;
                        db.close();
                        reject(err);
                    };

                    req.onupgradeneeded = function () {
                        var db = req.result;
                        db.deleteObjectStore(options.storeName);
                    };

                    req.onsuccess = function () {
                        var db = req.result;
                        db.close();
                        resolve(db);
                    };
                });

                return dropObjectPromise.then(function (db) {
                    dbContext.db = db;
                    for (var j = 0; j < forages.length; j++) {
                        var _forage2 = forages[j];
                        _forage2._dbInfo.db = db;
                        _advanceReadiness(_forage2._dbInfo);
                    }
                })["catch"](function (err) {
                    (_rejectReadiness(options, err) || Promise$1.resolve())["catch"](function () {});
                    throw err;
                });
            });
        }
    }

    executeCallback(promise, callback);
    return promise;
}

var asyncStorage = {
    _driver: 'asyncStorage',
    _initStorage: _initStorage,
    _support: isIndexedDBValid(),
    iterate: iterate,
    getItem: getItem,
    setItem: setItem,
    removeItem: removeItem,
    clear: clear,
    length: length,
    key: key,
    keys: keys,
    dropInstance: dropInstance
};

function isWebSQLValid() {
    return typeof openDatabase === 'function';
}

// Sadly, the best way to save binary data in WebSQL/localStorage is serializing
// it to Base64, so this is how we store it to prevent very strange errors with less
// verbose ways of binary <-> string data storage.
var BASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

var BLOB_TYPE_PREFIX = '~~local_forage_type~';
var BLOB_TYPE_PREFIX_REGEX = /^~~local_forage_type~([^~]+)~/;

var SERIALIZED_MARKER = '__lfsc__:';
var SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER.length;

// OMG the serializations!
var TYPE_ARRAYBUFFER = 'arbf';
var TYPE_BLOB = 'blob';
var TYPE_INT8ARRAY = 'si08';
var TYPE_UINT8ARRAY = 'ui08';
var TYPE_UINT8CLAMPEDARRAY = 'uic8';
var TYPE_INT16ARRAY = 'si16';
var TYPE_INT32ARRAY = 'si32';
var TYPE_UINT16ARRAY = 'ur16';
var TYPE_UINT32ARRAY = 'ui32';
var TYPE_FLOAT32ARRAY = 'fl32';
var TYPE_FLOAT64ARRAY = 'fl64';
var TYPE_SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER_LENGTH + TYPE_ARRAYBUFFER.length;

var toString$1 = Object.prototype.toString;

function stringToBuffer(serializedString) {
    // Fill the string into a ArrayBuffer.
    var bufferLength = serializedString.length * 0.75;
    var len = serializedString.length;
    var i;
    var p = 0;
    var encoded1, encoded2, encoded3, encoded4;

    if (serializedString[serializedString.length - 1] === '=') {
        bufferLength--;
        if (serializedString[serializedString.length - 2] === '=') {
            bufferLength--;
        }
    }

    var buffer = new ArrayBuffer(bufferLength);
    var bytes = new Uint8Array(buffer);

    for (i = 0; i < len; i += 4) {
        encoded1 = BASE_CHARS.indexOf(serializedString[i]);
        encoded2 = BASE_CHARS.indexOf(serializedString[i + 1]);
        encoded3 = BASE_CHARS.indexOf(serializedString[i + 2]);
        encoded4 = BASE_CHARS.indexOf(serializedString[i + 3]);

        /*jslint bitwise: true */
        bytes[p++] = encoded1 << 2 | encoded2 >> 4;
        bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
        bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
    }
    return buffer;
}

// Converts a buffer to a string to store, serialized, in the backend
// storage library.
function bufferToString(buffer) {
    // base64-arraybuffer
    var bytes = new Uint8Array(buffer);
    var base64String = '';
    var i;

    for (i = 0; i < bytes.length; i += 3) {
        /*jslint bitwise: true */
        base64String += BASE_CHARS[bytes[i] >> 2];
        base64String += BASE_CHARS[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];
        base64String += BASE_CHARS[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6];
        base64String += BASE_CHARS[bytes[i + 2] & 63];
    }

    if (bytes.length % 3 === 2) {
        base64String = base64String.substring(0, base64String.length - 1) + '=';
    } else if (bytes.length % 3 === 1) {
        base64String = base64String.substring(0, base64String.length - 2) + '==';
    }

    return base64String;
}

// Serialize a value, afterwards executing a callback (which usually
// instructs the `setItem()` callback/promise to be executed). This is how
// we store binary data with localStorage.
function serialize(value, callback) {
    var valueType = '';
    if (value) {
        valueType = toString$1.call(value);
    }

    // Cannot use `value instanceof ArrayBuffer` or such here, as these
    // checks fail when running the tests using casper.js...
    //
    // TODO: See why those tests fail and use a better solution.
    if (value && (valueType === '[object ArrayBuffer]' || value.buffer && toString$1.call(value.buffer) === '[object ArrayBuffer]')) {
        // Convert binary arrays to a string and prefix the string with
        // a special marker.
        var buffer;
        var marker = SERIALIZED_MARKER;

        if (value instanceof ArrayBuffer) {
            buffer = value;
            marker += TYPE_ARRAYBUFFER;
        } else {
            buffer = value.buffer;

            if (valueType === '[object Int8Array]') {
                marker += TYPE_INT8ARRAY;
            } else if (valueType === '[object Uint8Array]') {
                marker += TYPE_UINT8ARRAY;
            } else if (valueType === '[object Uint8ClampedArray]') {
                marker += TYPE_UINT8CLAMPEDARRAY;
            } else if (valueType === '[object Int16Array]') {
                marker += TYPE_INT16ARRAY;
            } else if (valueType === '[object Uint16Array]') {
                marker += TYPE_UINT16ARRAY;
            } else if (valueType === '[object Int32Array]') {
                marker += TYPE_INT32ARRAY;
            } else if (valueType === '[object Uint32Array]') {
                marker += TYPE_UINT32ARRAY;
            } else if (valueType === '[object Float32Array]') {
                marker += TYPE_FLOAT32ARRAY;
            } else if (valueType === '[object Float64Array]') {
                marker += TYPE_FLOAT64ARRAY;
            } else {
                callback(new Error('Failed to get type for BinaryArray'));
            }
        }

        callback(marker + bufferToString(buffer));
    } else if (valueType === '[object Blob]') {
        // Conver the blob to a binaryArray and then to a string.
        var fileReader = new FileReader();

        fileReader.onload = function () {
            // Backwards-compatible prefix for the blob type.
            var str = BLOB_TYPE_PREFIX + value.type + '~' + bufferToString(this.result);

            callback(SERIALIZED_MARKER + TYPE_BLOB + str);
        };

        fileReader.readAsArrayBuffer(value);
    } else {
        try {
            callback(JSON.stringify(value));
        } catch (e) {
            console.error("Couldn't convert value into a JSON string: ", value);

            callback(null, e);
        }
    }
}

// Deserialize data we've inserted into a value column/field. We place
// special markers into our strings to mark them as encoded; this isn't
// as nice as a meta field, but it's the only sane thing we can do whilst
// keeping localStorage support intact.
//
// Oftentimes this will just deserialize JSON content, but if we have a
// special marker (SERIALIZED_MARKER, defined above), we will extract
// some kind of arraybuffer/binary data/typed array out of the string.
function deserialize(value) {
    // If we haven't marked this string as being specially serialized (i.e.
    // something other than serialized JSON), we can just return it and be
    // done with it.
    if (value.substring(0, SERIALIZED_MARKER_LENGTH) !== SERIALIZED_MARKER) {
        return JSON.parse(value);
    }

    // The following code deals with deserializing some kind of Blob or
    // TypedArray. First we separate out the type of data we're dealing
    // with from the data itself.
    var serializedString = value.substring(TYPE_SERIALIZED_MARKER_LENGTH);
    var type = value.substring(SERIALIZED_MARKER_LENGTH, TYPE_SERIALIZED_MARKER_LENGTH);

    var blobType;
    // Backwards-compatible blob type serialization strategy.
    // DBs created with older versions of localForage will simply not have the blob type.
    if (type === TYPE_BLOB && BLOB_TYPE_PREFIX_REGEX.test(serializedString)) {
        var matcher = serializedString.match(BLOB_TYPE_PREFIX_REGEX);
        blobType = matcher[1];
        serializedString = serializedString.substring(matcher[0].length);
    }
    var buffer = stringToBuffer(serializedString);

    // Return the right type based on the code/type set during
    // serialization.
    switch (type) {
        case TYPE_ARRAYBUFFER:
            return buffer;
        case TYPE_BLOB:
            return createBlob([buffer], { type: blobType });
        case TYPE_INT8ARRAY:
            return new Int8Array(buffer);
        case TYPE_UINT8ARRAY:
            return new Uint8Array(buffer);
        case TYPE_UINT8CLAMPEDARRAY:
            return new Uint8ClampedArray(buffer);
        case TYPE_INT16ARRAY:
            return new Int16Array(buffer);
        case TYPE_UINT16ARRAY:
            return new Uint16Array(buffer);
        case TYPE_INT32ARRAY:
            return new Int32Array(buffer);
        case TYPE_UINT32ARRAY:
            return new Uint32Array(buffer);
        case TYPE_FLOAT32ARRAY:
            return new Float32Array(buffer);
        case TYPE_FLOAT64ARRAY:
            return new Float64Array(buffer);
        default:
            throw new Error('Unkown type: ' + type);
    }
}

var localforageSerializer = {
    serialize: serialize,
    deserialize: deserialize,
    stringToBuffer: stringToBuffer,
    bufferToString: bufferToString
};

/*
 * Includes code from:
 *
 * base64-arraybuffer
 * https://github.com/niklasvh/base64-arraybuffer
 *
 * Copyright (c) 2012 Niklas von Hertzen
 * Licensed under the MIT license.
 */

function createDbTable(t, dbInfo, callback, errorCallback) {
    t.executeSql('CREATE TABLE IF NOT EXISTS ' + dbInfo.storeName + ' ' + '(id INTEGER PRIMARY KEY, key unique, value)', [], callback, errorCallback);
}

// Open the WebSQL database (automatically creates one if one didn't
// previously exist), using any options set in the config.
function _initStorage$1(options) {
    var self = this;
    var dbInfo = {
        db: null
    };

    if (options) {
        for (var i in options) {
            dbInfo[i] = typeof options[i] !== 'string' ? options[i].toString() : options[i];
        }
    }

    var dbInfoPromise = new Promise$1(function (resolve, reject) {
        // Open the database; the openDatabase API will automatically
        // create it for us if it doesn't exist.
        try {
            dbInfo.db = openDatabase(dbInfo.name, String(dbInfo.version), dbInfo.description, dbInfo.size);
        } catch (e) {
            return reject(e);
        }

        // Create our key/value table if it doesn't exist.
        dbInfo.db.transaction(function (t) {
            createDbTable(t, dbInfo, function () {
                self._dbInfo = dbInfo;
                resolve();
            }, function (t, error) {
                reject(error);
            });
        }, reject);
    });

    dbInfo.serializer = localforageSerializer;
    return dbInfoPromise;
}

function tryExecuteSql(t, dbInfo, sqlStatement, args, callback, errorCallback) {
    t.executeSql(sqlStatement, args, callback, function (t, error) {
        if (error.code === error.SYNTAX_ERR) {
            t.executeSql('SELECT name FROM sqlite_master ' + "WHERE type='table' AND name = ?", [name], function (t, results) {
                if (!results.rows.length) {
                    // if the table is missing (was deleted)
                    // re-create it table and retry
                    createDbTable(t, dbInfo, function () {
                        t.executeSql(sqlStatement, args, callback, errorCallback);
                    }, errorCallback);
                } else {
                    errorCallback(t, error);
                }
            }, errorCallback);
        } else {
            errorCallback(t, error);
        }
    }, errorCallback);
}

function getItem$1(key, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'SELECT * FROM ' + dbInfo.storeName + ' WHERE key = ? LIMIT 1', [key], function (t, results) {
                    var result = results.rows.length ? results.rows.item(0).value : null;

                    // Check to see if this is serialized content we need to
                    // unpack.
                    if (result) {
                        result = dbInfo.serializer.deserialize(result);
                    }

                    resolve(result);
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function iterate$1(iterator, callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;

            dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'SELECT * FROM ' + dbInfo.storeName, [], function (t, results) {
                    var rows = results.rows;
                    var length = rows.length;

                    for (var i = 0; i < length; i++) {
                        var item = rows.item(i);
                        var result = item.value;

                        // Check to see if this is serialized content
                        // we need to unpack.
                        if (result) {
                            result = dbInfo.serializer.deserialize(result);
                        }

                        result = iterator(result, item.key, i + 1);

                        // void(0) prevents problems with redefinition
                        // of `undefined`.
                        if (result !== void 0) {
                            resolve(result);
                            return;
                        }
                    }

                    resolve();
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function _setItem(key, value, callback, retriesLeft) {
    var self = this;

    key = normalizeKey(key);

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            // The localStorage API doesn't return undefined values in an
            // "expected" way, so undefined is always cast to null in all
            // drivers. See: https://github.com/mozilla/localForage/pull/42
            if (value === undefined) {
                value = null;
            }

            // Save the original value to pass to the callback.
            var originalValue = value;

            var dbInfo = self._dbInfo;
            dbInfo.serializer.serialize(value, function (value, error) {
                if (error) {
                    reject(error);
                } else {
                    dbInfo.db.transaction(function (t) {
                        tryExecuteSql(t, dbInfo, 'INSERT OR REPLACE INTO ' + dbInfo.storeName + ' ' + '(key, value) VALUES (?, ?)', [key, value], function () {
                            resolve(originalValue);
                        }, function (t, error) {
                            reject(error);
                        });
                    }, function (sqlError) {
                        // The transaction failed; check
                        // to see if it's a quota error.
                        if (sqlError.code === sqlError.QUOTA_ERR) {
                            // We reject the callback outright for now, but
                            // it's worth trying to re-run the transaction.
                            // Even if the user accepts the prompt to use
                            // more storage on Safari, this error will
                            // be called.
                            //
                            // Try to re-run the transaction.
                            if (retriesLeft > 0) {
                                resolve(_setItem.apply(self, [key, originalValue, callback, retriesLeft - 1]));
                                return;
                            }
                            reject(sqlError);
                        }
                    });
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function setItem$1(key, value, callback) {
    return _setItem.apply(this, [key, value, callback, 1]);
}

function removeItem$1(key, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'DELETE FROM ' + dbInfo.storeName + ' WHERE key = ?', [key], function () {
                    resolve();
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

// Deletes every item in the table.
// TODO: Find out if this resets the AUTO_INCREMENT number.
function clear$1(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'DELETE FROM ' + dbInfo.storeName, [], function () {
                    resolve();
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

// Does a simple `COUNT(key)` to get the number of items stored in
// localForage.
function length$1(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                // Ahhh, SQL makes this one soooooo easy.
                tryExecuteSql(t, dbInfo, 'SELECT COUNT(key) as c FROM ' + dbInfo.storeName, [], function (t, results) {
                    var result = results.rows.item(0).c;
                    resolve(result);
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

// Return the key located at key index X; essentially gets the key from a
// `WHERE id = ?`. This is the most efficient way I can think to implement
// this rarely-used (in my experience) part of the API, but it can seem
// inconsistent, because we do `INSERT OR REPLACE INTO` on `setItem()`, so
// the ID of each key will change every time it's updated. Perhaps a stored
// procedure for the `setItem()` SQL would solve this problem?
// TODO: Don't change ID on `setItem()`.
function key$1(n, callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'SELECT key FROM ' + dbInfo.storeName + ' WHERE id = ? LIMIT 1', [n + 1], function (t, results) {
                    var result = results.rows.length ? results.rows.item(0).key : null;
                    resolve(result);
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function keys$1(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'SELECT key FROM ' + dbInfo.storeName, [], function (t, results) {
                    var keys = [];

                    for (var i = 0; i < results.rows.length; i++) {
                        keys.push(results.rows.item(i).key);
                    }

                    resolve(keys);
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

// https://www.w3.org/TR/webdatabase/#databases
// > There is no way to enumerate or delete the databases available for an origin from this API.
function getAllStoreNames(db) {
    return new Promise$1(function (resolve, reject) {
        db.transaction(function (t) {
            t.executeSql('SELECT name FROM sqlite_master ' + "WHERE type='table' AND name <> '__WebKitDatabaseInfoTable__'", [], function (t, results) {
                var storeNames = [];

                for (var i = 0; i < results.rows.length; i++) {
                    storeNames.push(results.rows.item(i).name);
                }

                resolve({
                    db: db,
                    storeNames: storeNames
                });
            }, function (t, error) {
                reject(error);
            });
        }, function (sqlError) {
            reject(sqlError);
        });
    });
}

function dropInstance$1(options, callback) {
    callback = getCallback.apply(this, arguments);

    var currentConfig = this.config();
    options = typeof options !== 'function' && options || {};
    if (!options.name) {
        options.name = options.name || currentConfig.name;
        options.storeName = options.storeName || currentConfig.storeName;
    }

    var self = this;
    var promise;
    if (!options.name) {
        promise = Promise$1.reject('Invalid arguments');
    } else {
        promise = new Promise$1(function (resolve) {
            var db;
            if (options.name === currentConfig.name) {
                // use the db reference of the current instance
                db = self._dbInfo.db;
            } else {
                db = openDatabase(options.name, '', '', 0);
            }

            if (!options.storeName) {
                // drop all database tables
                resolve(getAllStoreNames(db));
            } else {
                resolve({
                    db: db,
                    storeNames: [options.storeName]
                });
            }
        }).then(function (operationInfo) {
            return new Promise$1(function (resolve, reject) {
                operationInfo.db.transaction(function (t) {
                    function dropTable(storeName) {
                        return new Promise$1(function (resolve, reject) {
                            t.executeSql('DROP TABLE IF EXISTS ' + storeName, [], function () {
                                resolve();
                            }, function (t, error) {
                                reject(error);
                            });
                        });
                    }

                    var operations = [];
                    for (var i = 0, len = operationInfo.storeNames.length; i < len; i++) {
                        operations.push(dropTable(operationInfo.storeNames[i]));
                    }

                    Promise$1.all(operations).then(function () {
                        resolve();
                    })["catch"](function (e) {
                        reject(e);
                    });
                }, function (sqlError) {
                    reject(sqlError);
                });
            });
        });
    }

    executeCallback(promise, callback);
    return promise;
}

var webSQLStorage = {
    _driver: 'webSQLStorage',
    _initStorage: _initStorage$1,
    _support: isWebSQLValid(),
    iterate: iterate$1,
    getItem: getItem$1,
    setItem: setItem$1,
    removeItem: removeItem$1,
    clear: clear$1,
    length: length$1,
    key: key$1,
    keys: keys$1,
    dropInstance: dropInstance$1
};

function isLocalStorageValid() {
    try {
        return typeof localStorage !== 'undefined' && 'setItem' in localStorage &&
        // in IE8 typeof localStorage.setItem === 'object'
        !!localStorage.setItem;
    } catch (e) {
        return false;
    }
}

function _getKeyPrefix(options, defaultConfig) {
    var keyPrefix = options.name + '/';

    if (options.storeName !== defaultConfig.storeName) {
        keyPrefix += options.storeName + '/';
    }
    return keyPrefix;
}

// Check if localStorage throws when saving an item
function checkIfLocalStorageThrows() {
    var localStorageTestKey = '_localforage_support_test';

    try {
        localStorage.setItem(localStorageTestKey, true);
        localStorage.removeItem(localStorageTestKey);

        return false;
    } catch (e) {
        return true;
    }
}

// Check if localStorage is usable and allows to save an item
// This method checks if localStorage is usable in Safari Private Browsing
// mode, or in any other case where the available quota for localStorage
// is 0 and there wasn't any saved items yet.
function _isLocalStorageUsable() {
    return !checkIfLocalStorageThrows() || localStorage.length > 0;
}

// Config the localStorage backend, using options set in the config.
function _initStorage$2(options) {
    var self = this;
    var dbInfo = {};
    if (options) {
        for (var i in options) {
            dbInfo[i] = options[i];
        }
    }

    dbInfo.keyPrefix = _getKeyPrefix(options, self._defaultConfig);

    if (!_isLocalStorageUsable()) {
        return Promise$1.reject();
    }

    self._dbInfo = dbInfo;
    dbInfo.serializer = localforageSerializer;

    return Promise$1.resolve();
}

// Remove all keys from the datastore, effectively destroying all data in
// the app's key/value store!
function clear$2(callback) {
    var self = this;
    var promise = self.ready().then(function () {
        var keyPrefix = self._dbInfo.keyPrefix;

        for (var i = localStorage.length - 1; i >= 0; i--) {
            var key = localStorage.key(i);

            if (key.indexOf(keyPrefix) === 0) {
                localStorage.removeItem(key);
            }
        }
    });

    executeCallback(promise, callback);
    return promise;
}

// Retrieve an item from the store. Unlike the original async_storage
// library in Gaia, we don't modify return values at all. If a key's value
// is `undefined`, we pass that value to the callback function.
function getItem$2(key, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = self.ready().then(function () {
        var dbInfo = self._dbInfo;
        var result = localStorage.getItem(dbInfo.keyPrefix + key);

        // If a result was found, parse it from the serialized
        // string into a JS object. If result isn't truthy, the key
        // is likely undefined and we'll pass it straight to the
        // callback.
        if (result) {
            result = dbInfo.serializer.deserialize(result);
        }

        return result;
    });

    executeCallback(promise, callback);
    return promise;
}

// Iterate over all items in the store.
function iterate$2(iterator, callback) {
    var self = this;

    var promise = self.ready().then(function () {
        var dbInfo = self._dbInfo;
        var keyPrefix = dbInfo.keyPrefix;
        var keyPrefixLength = keyPrefix.length;
        var length = localStorage.length;

        // We use a dedicated iterator instead of the `i` variable below
        // so other keys we fetch in localStorage aren't counted in
        // the `iterationNumber` argument passed to the `iterate()`
        // callback.
        //
        // See: github.com/mozilla/localForage/pull/435#discussion_r38061530
        var iterationNumber = 1;

        for (var i = 0; i < length; i++) {
            var key = localStorage.key(i);
            if (key.indexOf(keyPrefix) !== 0) {
                continue;
            }
            var value = localStorage.getItem(key);

            // If a result was found, parse it from the serialized
            // string into a JS object. If result isn't truthy, the
            // key is likely undefined and we'll pass it straight
            // to the iterator.
            if (value) {
                value = dbInfo.serializer.deserialize(value);
            }

            value = iterator(value, key.substring(keyPrefixLength), iterationNumber++);

            if (value !== void 0) {
                return value;
            }
        }
    });

    executeCallback(promise, callback);
    return promise;
}

// Same as localStorage's key() method, except takes a callback.
function key$2(n, callback) {
    var self = this;
    var promise = self.ready().then(function () {
        var dbInfo = self._dbInfo;
        var result;
        try {
            result = localStorage.key(n);
        } catch (error) {
            result = null;
        }

        // Remove the prefix from the key, if a key is found.
        if (result) {
            result = result.substring(dbInfo.keyPrefix.length);
        }

        return result;
    });

    executeCallback(promise, callback);
    return promise;
}

function keys$2(callback) {
    var self = this;
    var promise = self.ready().then(function () {
        var dbInfo = self._dbInfo;
        var length = localStorage.length;
        var keys = [];

        for (var i = 0; i < length; i++) {
            var itemKey = localStorage.key(i);
            if (itemKey.indexOf(dbInfo.keyPrefix) === 0) {
                keys.push(itemKey.substring(dbInfo.keyPrefix.length));
            }
        }

        return keys;
    });

    executeCallback(promise, callback);
    return promise;
}

// Supply the number of keys in the datastore to the callback function.
function length$2(callback) {
    var self = this;
    var promise = self.keys().then(function (keys) {
        return keys.length;
    });

    executeCallback(promise, callback);
    return promise;
}

// Remove an item from the store, nice and simple.
function removeItem$2(key, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = self.ready().then(function () {
        var dbInfo = self._dbInfo;
        localStorage.removeItem(dbInfo.keyPrefix + key);
    });

    executeCallback(promise, callback);
    return promise;
}

// Set a key's value and run an optional callback once the value is set.
// Unlike Gaia's implementation, the callback function is passed the value,
// in case you want to operate on that value only after you're sure it
// saved, or something like that.
function setItem$2(key, value, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = self.ready().then(function () {
        // Convert undefined values to null.
        // https://github.com/mozilla/localForage/pull/42
        if (value === undefined) {
            value = null;
        }

        // Save the original value to pass to the callback.
        var originalValue = value;

        return new Promise$1(function (resolve, reject) {
            var dbInfo = self._dbInfo;
            dbInfo.serializer.serialize(value, function (value, error) {
                if (error) {
                    reject(error);
                } else {
                    try {
                        localStorage.setItem(dbInfo.keyPrefix + key, value);
                        resolve(originalValue);
                    } catch (e) {
                        // localStorage capacity exceeded.
                        // TODO: Make this a specific error/event.
                        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                            reject(e);
                        }
                        reject(e);
                    }
                }
            });
        });
    });

    executeCallback(promise, callback);
    return promise;
}

function dropInstance$2(options, callback) {
    callback = getCallback.apply(this, arguments);

    options = typeof options !== 'function' && options || {};
    if (!options.name) {
        var currentConfig = this.config();
        options.name = options.name || currentConfig.name;
        options.storeName = options.storeName || currentConfig.storeName;
    }

    var self = this;
    var promise;
    if (!options.name) {
        promise = Promise$1.reject('Invalid arguments');
    } else {
        promise = new Promise$1(function (resolve) {
            if (!options.storeName) {
                resolve(options.name + '/');
            } else {
                resolve(_getKeyPrefix(options, self._defaultConfig));
            }
        }).then(function (keyPrefix) {
            for (var i = localStorage.length - 1; i >= 0; i--) {
                var key = localStorage.key(i);

                if (key.indexOf(keyPrefix) === 0) {
                    localStorage.removeItem(key);
                }
            }
        });
    }

    executeCallback(promise, callback);
    return promise;
}

var localStorageWrapper = {
    _driver: 'localStorageWrapper',
    _initStorage: _initStorage$2,
    _support: isLocalStorageValid(),
    iterate: iterate$2,
    getItem: getItem$2,
    setItem: setItem$2,
    removeItem: removeItem$2,
    clear: clear$2,
    length: length$2,
    key: key$2,
    keys: keys$2,
    dropInstance: dropInstance$2
};

var sameValue = function sameValue(x, y) {
    return x === y || typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y);
};

var includes = function includes(array, searchElement) {
    var len = array.length;
    var i = 0;
    while (i < len) {
        if (sameValue(array[i], searchElement)) {
            return true;
        }
        i++;
    }

    return false;
};

var isArray = Array.isArray || function (arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
};

// Drivers are stored here when `defineDriver()` is called.
// They are shared across all instances of localForage.
var DefinedDrivers = {};

var DriverSupport = {};

var DefaultDrivers = {
    INDEXEDDB: asyncStorage,
    WEBSQL: webSQLStorage,
    LOCALSTORAGE: localStorageWrapper
};

var DefaultDriverOrder = [DefaultDrivers.INDEXEDDB._driver, DefaultDrivers.WEBSQL._driver, DefaultDrivers.LOCALSTORAGE._driver];

var OptionalDriverMethods = ['dropInstance'];

var LibraryMethods = ['clear', 'getItem', 'iterate', 'key', 'keys', 'length', 'removeItem', 'setItem'].concat(OptionalDriverMethods);

var DefaultConfig = {
    description: '',
    driver: DefaultDriverOrder.slice(),
    name: 'localforage',
    // Default DB size is _JUST UNDER_ 5MB, as it's the highest size
    // we can use without a prompt.
    size: 4980736,
    storeName: 'keyvaluepairs',
    version: 1.0
};

function callWhenReady(localForageInstance, libraryMethod) {
    localForageInstance[libraryMethod] = function () {
        var _args = arguments;
        return localForageInstance.ready().then(function () {
            return localForageInstance[libraryMethod].apply(localForageInstance, _args);
        });
    };
}

function extend() {
    for (var i = 1; i < arguments.length; i++) {
        var arg = arguments[i];

        if (arg) {
            for (var _key in arg) {
                if (arg.hasOwnProperty(_key)) {
                    if (isArray(arg[_key])) {
                        arguments[0][_key] = arg[_key].slice();
                    } else {
                        arguments[0][_key] = arg[_key];
                    }
                }
            }
        }
    }

    return arguments[0];
}

var LocalForage = function () {
    function LocalForage(options) {
        _classCallCheck(this, LocalForage);

        for (var driverTypeKey in DefaultDrivers) {
            if (DefaultDrivers.hasOwnProperty(driverTypeKey)) {
                var driver = DefaultDrivers[driverTypeKey];
                var driverName = driver._driver;
                this[driverTypeKey] = driverName;

                if (!DefinedDrivers[driverName]) {
                    // we don't need to wait for the promise,
                    // since the default drivers can be defined
                    // in a blocking manner
                    this.defineDriver(driver);
                }
            }
        }

        this._defaultConfig = extend({}, DefaultConfig);
        this._config = extend({}, this._defaultConfig, options);
        this._driverSet = null;
        this._initDriver = null;
        this._ready = false;
        this._dbInfo = null;

        this._wrapLibraryMethodsWithReady();
        this.setDriver(this._config.driver)["catch"](function () {});
    }

    // Set any config values for localForage; can be called anytime before
    // the first API call (e.g. `getItem`, `setItem`).
    // We loop through options so we don't overwrite existing config
    // values.


    LocalForage.prototype.config = function config(options) {
        // If the options argument is an object, we use it to set values.
        // Otherwise, we return either a specified config value or all
        // config values.
        if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
            // If localforage is ready and fully initialized, we can't set
            // any new configuration values. Instead, we return an error.
            if (this._ready) {
                return new Error("Can't call config() after localforage " + 'has been used.');
            }

            for (var i in options) {
                if (i === 'storeName') {
                    options[i] = options[i].replace(/\W/g, '_');
                }

                if (i === 'version' && typeof options[i] !== 'number') {
                    return new Error('Database version must be a number.');
                }

                this._config[i] = options[i];
            }

            // after all config options are set and
            // the driver option is used, try setting it
            if ('driver' in options && options.driver) {
                return this.setDriver(this._config.driver);
            }

            return true;
        } else if (typeof options === 'string') {
            return this._config[options];
        } else {
            return this._config;
        }
    };

    // Used to define a custom driver, shared across all instances of
    // localForage.


    LocalForage.prototype.defineDriver = function defineDriver(driverObject, callback, errorCallback) {
        var promise = new Promise$1(function (resolve, reject) {
            try {
                var driverName = driverObject._driver;
                var complianceError = new Error('Custom driver not compliant; see ' + 'https://mozilla.github.io/localForage/#definedriver');

                // A driver name should be defined and not overlap with the
                // library-defined, default drivers.
                if (!driverObject._driver) {
                    reject(complianceError);
                    return;
                }

                var driverMethods = LibraryMethods.concat('_initStorage');
                for (var i = 0, len = driverMethods.length; i < len; i++) {
                    var driverMethodName = driverMethods[i];

                    // when the property is there,
                    // it should be a method even when optional
                    var isRequired = !includes(OptionalDriverMethods, driverMethodName);
                    if ((isRequired || driverObject[driverMethodName]) && typeof driverObject[driverMethodName] !== 'function') {
                        reject(complianceError);
                        return;
                    }
                }

                var configureMissingMethods = function configureMissingMethods() {
                    var methodNotImplementedFactory = function methodNotImplementedFactory(methodName) {
                        return function () {
                            var error = new Error('Method ' + methodName + ' is not implemented by the current driver');
                            var promise = Promise$1.reject(error);
                            executeCallback(promise, arguments[arguments.length - 1]);
                            return promise;
                        };
                    };

                    for (var _i = 0, _len = OptionalDriverMethods.length; _i < _len; _i++) {
                        var optionalDriverMethod = OptionalDriverMethods[_i];
                        if (!driverObject[optionalDriverMethod]) {
                            driverObject[optionalDriverMethod] = methodNotImplementedFactory(optionalDriverMethod);
                        }
                    }
                };

                configureMissingMethods();

                var setDriverSupport = function setDriverSupport(support) {
                    if (DefinedDrivers[driverName]) {
                        console.info('Redefining LocalForage driver: ' + driverName);
                    }
                    DefinedDrivers[driverName] = driverObject;
                    DriverSupport[driverName] = support;
                    // don't use a then, so that we can define
                    // drivers that have simple _support methods
                    // in a blocking manner
                    resolve();
                };

                if ('_support' in driverObject) {
                    if (driverObject._support && typeof driverObject._support === 'function') {
                        driverObject._support().then(setDriverSupport, reject);
                    } else {
                        setDriverSupport(!!driverObject._support);
                    }
                } else {
                    setDriverSupport(true);
                }
            } catch (e) {
                reject(e);
            }
        });

        executeTwoCallbacks(promise, callback, errorCallback);
        return promise;
    };

    LocalForage.prototype.driver = function driver() {
        return this._driver || null;
    };

    LocalForage.prototype.getDriver = function getDriver(driverName, callback, errorCallback) {
        var getDriverPromise = DefinedDrivers[driverName] ? Promise$1.resolve(DefinedDrivers[driverName]) : Promise$1.reject(new Error('Driver not found.'));

        executeTwoCallbacks(getDriverPromise, callback, errorCallback);
        return getDriverPromise;
    };

    LocalForage.prototype.getSerializer = function getSerializer(callback) {
        var serializerPromise = Promise$1.resolve(localforageSerializer);
        executeTwoCallbacks(serializerPromise, callback);
        return serializerPromise;
    };

    LocalForage.prototype.ready = function ready(callback) {
        var self = this;

        var promise = self._driverSet.then(function () {
            if (self._ready === null) {
                self._ready = self._initDriver();
            }

            return self._ready;
        });

        executeTwoCallbacks(promise, callback, callback);
        return promise;
    };

    LocalForage.prototype.setDriver = function setDriver(drivers, callback, errorCallback) {
        var self = this;

        if (!isArray(drivers)) {
            drivers = [drivers];
        }

        var supportedDrivers = this._getSupportedDrivers(drivers);

        function setDriverToConfig() {
            self._config.driver = self.driver();
        }

        function extendSelfWithDriver(driver) {
            self._extend(driver);
            setDriverToConfig();

            self._ready = self._initStorage(self._config);
            return self._ready;
        }

        function initDriver(supportedDrivers) {
            return function () {
                var currentDriverIndex = 0;

                function driverPromiseLoop() {
                    while (currentDriverIndex < supportedDrivers.length) {
                        var driverName = supportedDrivers[currentDriverIndex];
                        currentDriverIndex++;

                        self._dbInfo = null;
                        self._ready = null;

                        return self.getDriver(driverName).then(extendSelfWithDriver)["catch"](driverPromiseLoop);
                    }

                    setDriverToConfig();
                    var error = new Error('No available storage method found.');
                    self._driverSet = Promise$1.reject(error);
                    return self._driverSet;
                }

                return driverPromiseLoop();
            };
        }

        // There might be a driver initialization in progress
        // so wait for it to finish in order to avoid a possible
        // race condition to set _dbInfo
        var oldDriverSetDone = this._driverSet !== null ? this._driverSet["catch"](function () {
            return Promise$1.resolve();
        }) : Promise$1.resolve();

        this._driverSet = oldDriverSetDone.then(function () {
            var driverName = supportedDrivers[0];
            self._dbInfo = null;
            self._ready = null;

            return self.getDriver(driverName).then(function (driver) {
                self._driver = driver._driver;
                setDriverToConfig();
                self._wrapLibraryMethodsWithReady();
                self._initDriver = initDriver(supportedDrivers);
            });
        })["catch"](function () {
            setDriverToConfig();
            var error = new Error('No available storage method found.');
            self._driverSet = Promise$1.reject(error);
            return self._driverSet;
        });

        executeTwoCallbacks(this._driverSet, callback, errorCallback);
        return this._driverSet;
    };

    LocalForage.prototype.supports = function supports(driverName) {
        return !!DriverSupport[driverName];
    };

    LocalForage.prototype._extend = function _extend(libraryMethodsAndProperties) {
        extend(this, libraryMethodsAndProperties);
    };

    LocalForage.prototype._getSupportedDrivers = function _getSupportedDrivers(drivers) {
        var supportedDrivers = [];
        for (var i = 0, len = drivers.length; i < len; i++) {
            var driverName = drivers[i];
            if (this.supports(driverName)) {
                supportedDrivers.push(driverName);
            }
        }
        return supportedDrivers;
    };

    LocalForage.prototype._wrapLibraryMethodsWithReady = function _wrapLibraryMethodsWithReady() {
        // Add a stub for each driver API method that delays the call to the
        // corresponding driver method until localForage is ready. These stubs
        // will be replaced by the driver methods as soon as the driver is
        // loaded, so there is no performance impact.
        for (var i = 0, len = LibraryMethods.length; i < len; i++) {
            callWhenReady(this, LibraryMethods[i]);
        }
    };

    LocalForage.prototype.createInstance = function createInstance(options) {
        return new LocalForage(options);
    };

    return LocalForage;
}();

// The actual localForage object that we expose as a module or via a
// global. It's extended by pulling in one of our other libraries.


var localforage_js = new LocalForage();

module.exports = localforage_js;

},{"3":3}]},{},[4])(4)
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],7:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],8:[function(require,module,exports){
(function (root, factory){
  'use strict';

  /*istanbul ignore next:cant test*/
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else {
    // Browser globals
    root.objectPath = factory();
  }
})(this, function(){
  'use strict';

  var toStr = Object.prototype.toString;
  function hasOwnProperty(obj, prop) {
    if(obj == null) {
      return false
    }
    //to handle objects with null prototypes (too edge case?)
    return Object.prototype.hasOwnProperty.call(obj, prop)
  }

  function isEmpty(value){
    if (!value) {
      return true;
    }
    if (isArray(value) && value.length === 0) {
        return true;
    } else if (typeof value !== 'string') {
        for (var i in value) {
            if (hasOwnProperty(value, i)) {
                return false;
            }
        }
        return true;
    }
    return false;
  }

  function toString(type){
    return toStr.call(type);
  }

  function isObject(obj){
    return typeof obj === 'object' && toString(obj) === "[object Object]";
  }

  var isArray = Array.isArray || function(obj){
    /*istanbul ignore next:cant test*/
    return toStr.call(obj) === '[object Array]';
  }

  function isBoolean(obj){
    return typeof obj === 'boolean' || toString(obj) === '[object Boolean]';
  }

  function getKey(key){
    var intKey = parseInt(key);
    if (intKey.toString() === key) {
      return intKey;
    }
    return key;
  }

  function factory(options) {
    options = options || {}

    var objectPath = function(obj) {
      return Object.keys(objectPath).reduce(function(proxy, prop) {
        if(prop === 'create') {
          return proxy;
        }

        /*istanbul ignore else*/
        if (typeof objectPath[prop] === 'function') {
          proxy[prop] = objectPath[prop].bind(objectPath, obj);
        }

        return proxy;
      }, {});
    };

    function hasShallowProperty(obj, prop) {
      return (options.includeInheritedProps || (typeof prop === 'number' && Array.isArray(obj)) || hasOwnProperty(obj, prop))
    }

    function getShallowProperty(obj, prop) {
      if (hasShallowProperty(obj, prop)) {
        return obj[prop];
      }
    }

    function set(obj, path, value, doNotReplace){
      if (typeof path === 'number') {
        path = [path];
      }
      if (!path || path.length === 0) {
        return obj;
      }
      if (typeof path === 'string') {
        return set(obj, path.split('.').map(getKey), value, doNotReplace);
      }
      var currentPath = path[0];
      var currentValue = getShallowProperty(obj, currentPath);
      if (path.length === 1) {
        if (currentValue === void 0 || !doNotReplace) {
          obj[currentPath] = value;
        }
        return currentValue;
      }

      if (currentValue === void 0) {
        //check if we assume an array
        if(typeof path[1] === 'number') {
          obj[currentPath] = [];
        } else {
          obj[currentPath] = {};
        }
      }

      return set(obj[currentPath], path.slice(1), value, doNotReplace);
    }

    objectPath.has = function (obj, path) {
      if (typeof path === 'number') {
        path = [path];
      } else if (typeof path === 'string') {
        path = path.split('.');
      }

      if (!path || path.length === 0) {
        return !!obj;
      }

      for (var i = 0; i < path.length; i++) {
        var j = getKey(path[i]);

        if((typeof j === 'number' && isArray(obj) && j < obj.length) ||
          (options.includeInheritedProps ? (j in Object(obj)) : hasOwnProperty(obj, j))) {
          obj = obj[j];
        } else {
          return false;
        }
      }

      return true;
    };

    objectPath.ensureExists = function (obj, path, value){
      return set(obj, path, value, true);
    };

    objectPath.set = function (obj, path, value, doNotReplace){
      return set(obj, path, value, doNotReplace);
    };

    objectPath.insert = function (obj, path, value, at){
      var arr = objectPath.get(obj, path);
      at = ~~at;
      if (!isArray(arr)) {
        arr = [];
        objectPath.set(obj, path, arr);
      }
      arr.splice(at, 0, value);
    };

    objectPath.empty = function(obj, path) {
      if (isEmpty(path)) {
        return void 0;
      }
      if (obj == null) {
        return void 0;
      }

      var value, i;
      if (!(value = objectPath.get(obj, path))) {
        return void 0;
      }

      if (typeof value === 'string') {
        return objectPath.set(obj, path, '');
      } else if (isBoolean(value)) {
        return objectPath.set(obj, path, false);
      } else if (typeof value === 'number') {
        return objectPath.set(obj, path, 0);
      } else if (isArray(value)) {
        value.length = 0;
      } else if (isObject(value)) {
        for (i in value) {
          if (hasShallowProperty(value, i)) {
            delete value[i];
          }
        }
      } else {
        return objectPath.set(obj, path, null);
      }
    };

    objectPath.push = function (obj, path /*, values */){
      var arr = objectPath.get(obj, path);
      if (!isArray(arr)) {
        arr = [];
        objectPath.set(obj, path, arr);
      }

      arr.push.apply(arr, Array.prototype.slice.call(arguments, 2));
    };

    objectPath.coalesce = function (obj, paths, defaultValue) {
      var value;

      for (var i = 0, len = paths.length; i < len; i++) {
        if ((value = objectPath.get(obj, paths[i])) !== void 0) {
          return value;
        }
      }

      return defaultValue;
    };

    objectPath.get = function (obj, path, defaultValue){
      if (typeof path === 'number') {
        path = [path];
      }
      if (!path || path.length === 0) {
        return obj;
      }
      if (obj == null) {
        return defaultValue;
      }
      if (typeof path === 'string') {
        return objectPath.get(obj, path.split('.'), defaultValue);
      }

      var currentPath = getKey(path[0]);
      var nextObj = getShallowProperty(obj, currentPath)
      if (nextObj === void 0) {
        return defaultValue;
      }

      if (path.length === 1) {
        return nextObj;
      }

      return objectPath.get(obj[currentPath], path.slice(1), defaultValue);
    };

    objectPath.del = function del(obj, path) {
      if (typeof path === 'number') {
        path = [path];
      }

      if (obj == null) {
        return obj;
      }

      if (isEmpty(path)) {
        return obj;
      }
      if(typeof path === 'string') {
        return objectPath.del(obj, path.split('.'));
      }

      var currentPath = getKey(path[0]);
      if (!hasShallowProperty(obj, currentPath)) {
        return obj;
      }

      if(path.length === 1) {
        if (isArray(obj)) {
          obj.splice(currentPath, 1);
        } else {
          delete obj[currentPath];
        }
      } else {
        return objectPath.del(obj[currentPath], path.slice(1));
      }

      return obj;
    }

    return objectPath;
  }

  var mod = factory();
  mod.create = factory;
  mod.withInheritedProps = factory({includeInheritedProps: true})
  return mod;
});

},{}],9:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],10:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// This method of obtaining a reference to the global object needs to be
// kept identical to the way it is obtained in runtime.js
var g = (function() { return this })() || Function("return this")();

// Use `getOwnPropertyNames` because not all browsers support calling
// `hasOwnProperty` on the global `self` object in a worker. See #183.
var hadRuntime = g.regeneratorRuntime &&
  Object.getOwnPropertyNames(g).indexOf("regeneratorRuntime") >= 0;

// Save the old regeneratorRuntime in case it needs to be restored later.
var oldRuntime = hadRuntime && g.regeneratorRuntime;

// Force reevalutation of runtime.js.
g.regeneratorRuntime = undefined;

module.exports = require("./runtime");

if (hadRuntime) {
  // Restore the original runtime.
  g.regeneratorRuntime = oldRuntime;
} else {
  // Remove the global property added by runtime.js.
  try {
    delete g.regeneratorRuntime;
  } catch(e) {
    g.regeneratorRuntime = undefined;
  }
}

},{"./runtime":11}],11:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

!(function(global) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  runtime.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration. If the Promise is rejected, however, the
          // result for this iteration will be rejected with the same
          // reason. Note that rejections of yielded Promises are not
          // thrown back into the generator function, as is the case
          // when an awaited Promise is rejected. This difference in
          // behavior between yield and await is important, because it
          // allows the consumer to decide what to do with the yielded
          // rejection (swallow it and continue, manually .throw it back
          // into the generator, abandon iteration, whatever). With
          // await, by contrast, there is no opportunity to examine the
          // rejection reason outside the generator function, so the
          // only option is to throw it from the await expression, and
          // let the generator function handle the exception.
          result.value = unwrapped;
          resolve(result);
        }, reject);
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  runtime.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        if (delegate.iterator.return) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };
})(
  // In sloppy mode, unbound `this` refers to the global object, fallback to
  // Function constructor if we're in global strict mode. That is sadly a form
  // of indirect eval which violates Content Security Policy.
  (function() { return this })() || Function("return this")()
);

},{}],12:[function(require,module,exports){

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

},{"component-props":2,"props":2}],13:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.InMemoryAdapter = exports.LocalForageAdapter = undefined;var _localforage = require('./localforage');var _localforage2 = _interopRequireDefault(_localforage);var _inmemory = require('./inmemory');var _inmemory2 = _interopRequireDefault(_inmemory);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}exports.LocalForageAdapter = _localforage2.default;exports.
InMemoryAdapter = _inmemory2.default;

},{"./inmemory":14,"./localforage":15}],14:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _regenerator = require('babel-runtime/regenerator');var _regenerator2 = _interopRequireDefault(_regenerator);var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {arr2[i] = arr[i];}return arr2;} else {return Array.from(arr);}}function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var




InMemoryAdapter = function () {




  function InMemoryAdapter(config) {_classCallCheck(this, InMemoryAdapter);this.store = {};
    this.config = config;
    this.prefix = this.config.get('prefix');
  }

  /**
       * Take item from storage by key
       *
       * @param  {String} key
       * @return {Promise<ITask>} (array)
       *
       * @api public
       */_createClass(InMemoryAdapter, [{ key: 'get', value: function () {var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(
      name) {var collName;return _regenerator2.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:
                collName = this.storageName(name);return _context.abrupt('return', [].concat(_toConsumableArray(
                this.getCollection(collName))));case 2:case 'end':return _context.stop();}}}, _callee, this);}));function get(_x) {return _ref.apply(this, arguments);}return get;}()


    /**
                                                                                                                                                                                                                                                                                                                                                                         * Add item to local storage
                                                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                                                         * @param  {String} key
                                                                                                                                                                                                                                                                                                                                                                         * @param  {String} value
                                                                                                                                                                                                                                                                                                                                                                         * @return {Promise<Any>}
                                                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                                                         * @api public
                                                                                                                                                                                                                                                                                                                                                                         */ }, { key: 'set', value: function () {var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(
      key, value) {return _regenerator2.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:
                this.store[this.storageName(key)] = [].concat(_toConsumableArray(value));return _context2.abrupt('return',
                value);case 2:case 'end':return _context2.stop();}}}, _callee2, this);}));function set(_x2, _x3) {return _ref2.apply(this, arguments);}return set;}()


    /**
                                                                                                                                                                                                                                                                                                                                         * Item checker in storage
                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                         * @param  {String} key
                                                                                                                                                                                                                                                                                                                                         * @return {Promise<Boolean>}
                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                         * @api public
                                                                                                                                                                                                                                                                                                                                         */ }, { key: 'has', value: function () {var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3(
      key) {return _regenerator2.default.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:return _context3.abrupt('return',
                Object.prototype.hasOwnProperty.call(this.store, this.storageName(key)));case 1:case 'end':return _context3.stop();}}}, _callee3, this);}));function has(_x4) {return _ref3.apply(this, arguments);}return has;}()


    /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * Remove item
                                                                                                                                                                                                                                                                                                                                                                                                                                                                   *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * @param  {String} key
                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * @return {Promise<Any>}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                   *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * @api public
                                                                                                                                                                                                                                                                                                                                                                                                                                                                   */ }, { key: 'clear', value: function () {var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4(
      key) {var collName, result;return _regenerator2.default.wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:
                collName = this.storageName(key);
                result = this.has(key) ? delete this.store[collName] : false;
                this.store = _extends({}, this.store);return _context4.abrupt('return',
                result);case 4:case 'end':return _context4.stop();}}}, _callee4, this);}));function clear(_x5) {return _ref4.apply(this, arguments);}return clear;}()


    /**
                                                                                                                                                                                                                                                                                                                                         * Compose storage name by suffix
                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                         * @param  {String} suffix
                                                                                                                                                                                                                                                                                                                                         * @return {String}
                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                         * @api public
                                                                                                                                                                                                                                                                                                                                         */ }, { key: 'storageName', value: function storageName(
    suffix) {
      return suffix.startsWith(this.getPrefix()) ? suffix : this.getPrefix() + '_' + suffix;
    }

    /**
         * Get prefix of channel storage
         *
         * @return {String}
         *
         * @api public
         */ }, { key: 'getPrefix', value: function getPrefix()
    {
      return this.config.get('prefix');
    } }, { key: 'getCollection', value: function getCollection(

    name) {
      var has = Object.prototype.hasOwnProperty.call(this.store, name);
      if (!has) this.store[name] = [];
      return this.store[name];
    } }]);return InMemoryAdapter;}();exports.default = InMemoryAdapter;

},{"babel-runtime/regenerator":1}],15:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _regenerator = require('babel-runtime/regenerator');var _regenerator2 = _interopRequireDefault(_regenerator);var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();
var _localforage = require('localforage');var _localforage2 = _interopRequireDefault(_localforage);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var




LocalForageAdapter = function () {




  function LocalForageAdapter(config) {_classCallCheck(this, LocalForageAdapter);this.drivers = ['localstorage', 'indexeddb', 'websql'];
    this.config = config;
    this.prefix = this.config.get('prefix');
    _localforage2.default.config({ driver: this.getDriver(), name: this.prefix });
  }

  /**
       * Take item from storage by key
       *
       * @param  {String} key
       * @return {Promise<ITask>} (array)
       *
       * @api public
       */_createClass(LocalForageAdapter, [{ key: 'get', value: function () {var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(
      key) {var items;return _regenerator2.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.next = 2;return (
                  _localforage2.default.getItem(this.storageName(key)));case 2:items = _context.sent;return _context.abrupt('return',
                (typeof items === 'string' ? JSON.parse(items) : items) || []);case 4:case 'end':return _context.stop();}}}, _callee, this);}));function get(_x) {return _ref.apply(this, arguments);}return get;}()


    /**
                                                                                                                                                                                                                                                                                                                                                                                                                                       * Add item to local storage
                                                                                                                                                                                                                                                                                                                                                                                                                                       *
                                                                                                                                                                                                                                                                                                                                                                                                                                       * @param  {String} key
                                                                                                                                                                                                                                                                                                                                                                                                                                       * @param  {String} value
                                                                                                                                                                                                                                                                                                                                                                                                                                       * @return {Promise<Any>}
                                                                                                                                                                                                                                                                                                                                                                                                                                       *
                                                                                                                                                                                                                                                                                                                                                                                                                                       * @api public
                                                                                                                                                                                                                                                                                                                                                                                                                                       */ }, { key: 'set', value: function () {var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(
      key, value) {var result;return _regenerator2.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:_context2.next = 2;return (
                  _localforage2.default.setItem(this.storageName(key), value));case 2:result = _context2.sent;return _context2.abrupt('return',
                result);case 4:case 'end':return _context2.stop();}}}, _callee2, this);}));function set(_x2, _x3) {return _ref2.apply(this, arguments);}return set;}()


    /**
                                                                                                                                                                                                                                                                                                                                           * Item checker in storage
                                                                                                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                                                                                                           * @param  {String} key
                                                                                                                                                                                                                                                                                                                                           * @return {Promise<Boolean>}
                                                                                                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                                                                                                           * @api public
                                                                                                                                                                                                                                                                                                                                           */ }, { key: 'has', value: function () {var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3(
      key) {var keys;return _regenerator2.default.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:_context3.next = 2;return (
                  _localforage2.default.keys());case 2:keys = _context3.sent;return _context3.abrupt('return',
                keys.indexOf(this.storageName(key)) > -1);case 4:case 'end':return _context3.stop();}}}, _callee3, this);}));function has(_x4) {return _ref3.apply(this, arguments);}return has;}()


    /**
                                                                                                                                                                                                                                                                                                                                                                                                     * Remove item
                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                     * @param  {String} key
                                                                                                                                                                                                                                                                                                                                                                                                     * @return {Promise<Any>}
                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                     * @api public
                                                                                                                                                                                                                                                                                                                                                                                                     */ }, { key: 'clear', value: function () {var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4(
      key) {var result;return _regenerator2.default.wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:_context4.next = 2;return (
                  _localforage2.default.removeItem(this.storageName(key)));case 2:result = _context4.sent;return _context4.abrupt('return',
                result);case 4:case 'end':return _context4.stop();}}}, _callee4, this);}));function clear(_x5) {return _ref4.apply(this, arguments);}return clear;}()


    /**
                                                                                                                                                                                                                                                                                                                                         * Remove all items
                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                         * @return {Promise<Any>}
                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                         * @api public
                                                                                                                                                                                                                                                                                                                                         */ }, { key: 'clearAll', value: function () {var _ref5 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {var _this = this;var keys, result;return _regenerator2.default.wrap(function _callee6$(_context6) {while (1) {switch (_context6.prev = _context6.next) {case 0:_context6.next = 2;return (

                  _localforage2.default.keys());case 2:keys = _context6.sent;_context6.next = 5;return (
                  Promise.all(keys.map(function () {var _ref6 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee5(key) {var cleared;return _regenerator2.default.wrap(function _callee5$(_context5) {while (1) {switch (_context5.prev = _context5.next) {case 0:_context5.next = 2;return (
                                _this.clear(key));case 2:cleared = _context5.sent;return _context5.abrupt('return',
                              cleared);case 4:case 'end':return _context5.stop();}}}, _callee5, _this);}));return function (_x6) {return _ref6.apply(this, arguments);};}())));case 5:result = _context6.sent;return _context6.abrupt('return',

                result);case 7:case 'end':return _context6.stop();}}}, _callee6, this);}));function clearAll() {return _ref5.apply(this, arguments);}return clearAll;}()


    /**
                                                                                                                                                                                                                                                                                                                                               * Compose storage name by suffix
                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                               * @param  {String} suffix
                                                                                                                                                                                                                                                                                                                                               * @return {String}
                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                               * @api public
                                                                                                                                                                                                                                                                                                                                               */ }, { key: 'storageName', value: function storageName(
    suffix) {
      return suffix.startsWith(this.getPrefix()) ? suffix : this.getPrefix() + '_' + suffix;
    }

    /**
         * Get prefix of channel storage
         *
         * @return {String}
         *
         * @api public
         */ }, { key: 'getPrefix', value: function getPrefix()
    {
      return this.config.get('prefix');
    } }, { key: 'getDriver', value: function getDriver()

    {
      var defaultDriver = this.config.get('defaultStorage');
      var driver = (this.config.get('storage') || defaultDriver).toLowerCase();
      return this.drivers.indexOf(driver) > -1 ?
      _localforage2.default[driver.toUpperCase()] :
      _localforage2.default[defaultDriver.toUpperCase()];
    } }]);return LocalForageAdapter;}();exports.default = LocalForageAdapter;

},{"babel-runtime/regenerator":1,"localforage":6}],16:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.default = {
  defaultStorage: 'localstorage',
  prefix: 'sq_jobs',
  timeout: 1000,
  limit: -1,
  principle: 'fifo',
  debug: true };

},{}],17:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();

var _config = require('./config.data');var _config2 = _interopRequireDefault(_config);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var

Config = function () {


  function Config() {var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};_classCallCheck(this, Config);this.config = _config2.default;
    this.merge(config);
  }

  /**
       * Set config to global config reference
       *
       * @param  {String} name
       * @param  {Any} value
       * @return {void}
       *
       * @api public
       */_createClass(Config, [{ key: 'set', value: function set(
    name, value) {
      this.config[name] = value;
    }

    /**
         * Get a config
         *
         * @param  {String} name
         * @return {any}
         *
         * @api public
         */ }, { key: 'get', value: function get(
    name) {
      return this.config[name];
    }

    /**
         * Check config property
         *
         * @param  {String} name
         * @return {any}
         *
         * @api public
         */ }, { key: 'has', value: function has(
    name) {
      return Object.prototype.hasOwnProperty.call(this.config, name);
    }

    /**
         * Merge two config object
         *
         * @param  {String} name
         * @return {void}
         *
         * @api public
         */ }, { key: 'merge', value: function merge(
    config) {
      this.config = Object.assign({}, this.config, config);
    }

    /**
         * Remove a config
         *
         * @param  {String} name
         * @return {Boolean}
         *
         * @api public
         */ }, { key: 'remove', value: function remove(
    name) {
      return delete this.config[name];
    }

    /**
         * Get all config
         *
         * @param  {String} name
         * @return {IConfig[]}
         *
         * @api public
         */ }, { key: 'all', value: function all()
    {
      return this.config;
    } }]);return Config;}();exports.default = Config;

},{"./config.data":16}],18:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var


Container = function () {function Container() {_classCallCheck(this, Container);this.
    store = {};}_createClass(Container, [{ key: 'has',

    /**
                                                                                                           * Check item in container
                                                                                                           *
                                                                                                           * @param  {String} id
                                                                                                           * @return {Boolean}
                                                                                                           *
                                                                                                           * @api public
                                                                                                           */value: function has(
    id) {
      return Object.prototype.hasOwnProperty.call(this.store, id);
    }

    /**
         * Get item from container
         *
         * @param  {String} id
         * @return {Any}
         *
         * @api public
         */ }, { key: 'get', value: function get(
    id) {
      return this.store[id];
    }

    /**
         * Get all items from container
         *
         * @return {Object}
         *
         * @api public
         */ }, { key: 'all', value: function all()
    {
      return this.store;
    }

    /**
         * Add item to container
         *
         * @param  {String} id
         * @param  {Any} value
         * @return {void}
         *
         * @api public
         */ }, { key: 'bind', value: function bind(
    id, value) {
      this.store[id] = value;
    }

    /**
         * Merge continers
         *
         * @param  {Object} data
         * @return {void}
         *
         * @api public
         */ }, { key: 'merge', value: function merge()
    {var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.store = Object.assign({}, this.store, data);
    }

    /**
         * Remove item from container
         *
         * @param  {String} id
         * @return {Boolean}
         *
         * @api public
         */ }, { key: 'remove', value: function remove(
    id) {
      if (!this.has(id)) return false;
      return delete this.store[id];
    }

    /**
         * Remove all items from container
         *
         * @return {void}
         *
         * @api public
         */ }, { key: 'removeAll', value: function removeAll()
    {
      this.store = {};
    } }]);return Container;}();exports.default = Container;

},{}],19:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.default = {
  queue: {
    created: 'New task created.',
    next: 'Next task processing.',
    starting: 'Queue listener starting.',
    stopping: 'Queue listener stopping.',
    stopped: 'Queue listener stopped.',
    empty: 'channel is empty...',
    'not-found': 'job not found',
    offline: 'Disconnected',
    online: 'Connected' },

  event: {
    created: 'New event created',
    fired: 'Event fired.',
    'wildcard-fired': 'Wildcard event fired.' } };

},{}],20:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}} /* eslint class-methods-use-this: ["error", { "exceptMethods": ["getName", "getType"] }] */
/* eslint-env es6 */var

Event = function () {





  function Event() {_classCallCheck(this, Event);this.store = {};this.verifierPattern = /^[a-z0-9-_]+:before$|after$|retry$|\*$/;this.wildcards = ['*', 'error'];this.emptyFunc = function () {};
    this.store.before = {};
    this.store.after = {};
    this.store.retry = {};
    this.store.wildcard = {};
    this.store.error = this.emptyFunc;
    this.store['*'] = this.emptyFunc;
  }

  /**
       * Create event
       *
       * @param  {String} key
       * @param  {Function} cb
       * @return {void}
       *
       * @api public
       */_createClass(Event, [{ key: 'on', value: function on(
    key, cb) {
      if (typeof cb !== 'function') throw new Error('Event should be an function');
      if (this.isValid(key)) this.add(key, cb);
    }

    /**
         * Run event via it's key
         *
         * @param  {String} key
         * @param  {Any} args
         * @return {void}
         *
         * @api public
         */ }, { key: 'emit', value: function emit(
    key, args) {
      if (this.wildcards.indexOf(key) > -1) {
        this.wildcard.apply(this, [key].concat([key, args]));
      } else {
        var type = this.getType(key);
        var name = this.getName(key);

        if (this.store[type]) {
          var cb = this.store[type][name] || this.emptyFunc;
          cb.call(null, args);
        }
      }

      this.wildcard('*', key, args);
    }

    /**
         * Run wildcard events
         *
         * @param  {String} key
         * @param  {String} actionKey
         * @param  {Any} args
         * @return {void}
         *
         * @api public
         */ }, { key: 'wildcard', value: function wildcard(
    key, actionKey, args) {
      if (this.store.wildcard[key]) {
        this.store.wildcard[key].call(null, actionKey, args);
      }
    }

    /**
         * Add event to store
         *
         * @param  {String} key
         * @param  {Function} cb
         * @return {void}
         *
         * @api public
         */ }, { key: 'add', value: function add(
    key, cb) {
      if (this.wildcards.indexOf(key) > -1) {
        this.store.wildcard[key] = cb;
      } else {
        var type = this.getType(key);
        var name = this.getName(key);
        this.store[type][name] = cb;
      }
    }

    /**
         * Check event in store
         *
         * @param  {String} key
         * @return {Boolean}
         *
         * @api public
         */ }, { key: 'has', value: function has(
    key) {
      try {
        var keys = key.split(':');
        return keys.length > 1 ? !!this.store[keys[1]][keys[0]] : !!this.store.wildcard[keys[0]];
      } catch (e) {
        return false;
      }
    }

    /**
         * Get event name by parse key
         *
         * @param  {String} key
         * @return {String}
         *
         * @api public
         */ }, { key: 'getName', value: function getName(
    key) {
      return key.match(/(.*):.*/)[1];
    }

    /**
         * Get event type by parse key
         *
         * @param  {String} key
         * @return {String}
         *
         * @api public
         */ }, { key: 'getType', value: function getType(
    key) {
      return key.match(/^[a-z0-9-_]+:(.*)/)[1];
    }

    /**
         * Checker of event keys
         *
         * @param  {String} key
         * @return {Boolean}
         *
         * @api public
         */ }, { key: 'isValid', value: function isValid(
    key) {
      return this.verifierPattern.test(key) || this.wildcards.indexOf(key) > -1;
    } }]);return Event;}();exports.default = Event;

},{}],21:[function(require,module,exports){
'use strict';var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};Object.defineProperty(exports, "__esModule", { value: true });exports.canMultiple = exports.createTimeout = exports.successJobHandler = exports.retryProcess = exports.lockTask = exports.failedJobHandler = exports.removeTask = exports.saveTask = exports.getTasksWithoutFreezed = undefined;var _regenerator = require('babel-runtime/regenerator');var _regenerator2 = _interopRequireDefault(_regenerator);var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {return typeof obj === 'undefined' ? 'undefined' : _typeof2(obj);} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === 'undefined' ? 'undefined' : _typeof2(obj);};







































/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * Get unfreezed tasks by the filter function
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @return {ITask}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */var getTasksWithoutFreezed = exports.getTasksWithoutFreezed = function () {var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(
  function _callee() {return _regenerator2.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.next = 2;return (
              db.call(this).all());case 2:_context.t0 = _utils.excludeSpecificTasks.bind(['freezed']);return _context.abrupt('return', _context.sent.filter(_context.t0));case 4:case 'end':return _context.stop();}}}, _callee, this);}));return function getTasksWithoutFreezed() {return _ref.apply(this, arguments);};}();


/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * Log proxy helper
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * @return {void}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * @param {string} key
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * @param {string} data
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * @param {boolean} cond
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               */










/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * New task save helper
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @param {ITask} task
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @return {string|boolean}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */var saveTask = exports.saveTask = function () {var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(
  function _callee2(task) {var result;return _regenerator2.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:_context2.next = 2;return (
              db.call(this).save(checkPriority(task)));case 2:result = _context2.sent;return _context2.abrupt('return',
            result);case 4:case 'end':return _context2.stop();}}}, _callee2, this);}));return function saveTask(_x) {return _ref2.apply(this, arguments);};}();


/**
                                                                                                                                                                                                                                                                                                                                 * Task remove helper
                                                                                                                                                                                                                                                                                                                                 * Context: Queue
                                                                                                                                                                                                                                                                                                                                 *
                                                                                                                                                                                                                                                                                                                                 * @param {string} id
                                                                                                                                                                                                                                                                                                                                 * @return {boolean}
                                                                                                                                                                                                                                                                                                                                 *
                                                                                                                                                                                                                                                                                                                                 * @api private
                                                                                                                                                                                                                                                                                                                                 */var removeTask = exports.removeTask = function () {var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(
  function _callee3(id) {var result;return _regenerator2.default.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:_context3.next = 2;return (
              db.call(this).delete(id));case 2:result = _context3.sent;return _context3.abrupt('return',
            result);case 4:case 'end':return _context3.stop();}}}, _callee3, this);}));return function removeTask(_x2) {return _ref3.apply(this, arguments);};}();


/**
                                                                                                                                                                                                                                                                                                                                       * Events dispatcher helper
                                                                                                                                                                                                                                                                                                                                       * Context: Queue
                                                                                                                                                                                                                                                                                                                                       *
                                                                                                                                                                                                                                                                                                                                       * @param {ITask} task
                                                                                                                                                                                                                                                                                                                                       * @param {string} type
                                                                                                                                                                                                                                                                                                                                       * @return {void}
                                                                                                                                                                                                                                                                                                                                       *
                                                                                                                                                                                                                                                                                                                                       * @api private
                                                                                                                                                                                                                                                                                                                                       */





























/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * Failed job handler
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * @param {ITask} task
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * @return {ITask} job
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * @return {Function}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  */var failedJobHandler = exports.failedJobHandler = function () {var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(
  function _callee5(task) {return _regenerator2.default.wrap(function _callee5$(_context5) {while (1) {switch (_context5.prev = _context5.next) {case 0:return _context5.abrupt('return', function () {var _ref5 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(
              function _callee4() {return _regenerator2.default.wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:
                        removeTask.call(this, task._id);

                        this.event.emit('error', task);

                        /* istanbul ignore next */_context4.next = 4;return (
                          this.next());case 4:case 'end':return _context4.stop();}}}, _callee4, this);}));function childFailedHandler() {return _ref5.apply(this, arguments);}return childFailedHandler;}());case 1:case 'end':return _context5.stop();}}}, _callee5, this);}));return function failedJobHandler(_x3) {return _ref4.apply(this, arguments);};}();



/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Helper of the lock task of the current job
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * @param {ITask} task
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * @return {boolean}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */var lockTask = exports.lockTask = function () {var _ref6 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(
  function _callee6(task) {var result;return _regenerator2.default.wrap(function _callee6$(_context6) {while (1) {switch (_context6.prev = _context6.next) {case 0:_context6.next = 2;return (
              db.call(this).update(task._id, { locked: true }));case 2:result = _context6.sent;return _context6.abrupt('return',
            result);case 4:case 'end':return _context6.stop();}}}, _callee6, this);}));return function lockTask(_x4) {return _ref6.apply(this, arguments);};}();


/**
                                                                                                                                                                                                                                                                                                                                   * Class event luancher helper
                                                                                                                                                                                                                                                                                                                                   * Context: Queue
                                                                                                                                                                                                                                                                                                                                   *
                                                                                                                                                                                                                                                                                                                                   * @param {string} name
                                                                                                                                                                                                                                                                                                                                   * @param {IWorker} worker
                                                                                                                                                                                                                                                                                                                                   * @param {any} args
                                                                                                                                                                                                                                                                                                                                   * @return {boolean|void}
                                                                                                                                                                                                                                                                                                                                   *
                                                                                                                                                                                                                                                                                                                                   * @api private
                                                                                                                                                                                                                                                                                                                                   */
















































/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Process handler of retried job
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @param {ITask} task
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @param {IWorker} worker
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @return {boolean}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */var retryProcess = exports.retryProcess = function () {var _ref7 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(
  function _callee7(task, worker) {var updateTask, result;return _regenerator2.default.wrap(function _callee7$(_context7) {while (1) {switch (_context7.prev = _context7.next) {case 0:
            // dispacth custom retry event
            dispatchEvents.call(this, task, 'retry');

            // update retry value
            updateTask = updateRetry.call(this, task, worker);

            // delete lock property for next process
            updateTask.locked = false;_context7.next = 5;return (

              db.call(this).update(task._id, updateTask));case 5:result = _context7.sent;return _context7.abrupt('return',

            result);case 7:case 'end':return _context7.stop();}}}, _callee7, this);}));return function retryProcess(_x5, _x6) {return _ref7.apply(this, arguments);};}();


/**
                                                                                                                                                                                                                                                                                                                                                     * Succeed job handler
                                                                                                                                                                                                                                                                                                                                                     * Context: Queue
                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                     * @param {ITask} task
                                                                                                                                                                                                                                                                                                                                                     * @param {IWorker} worker
                                                                                                                                                                                                                                                                                                                                                     * @return {Function}
                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                     * @api private
                                                                                                                                                                                                                                                                                                                                                     */var successJobHandler = exports.successJobHandler = function () {var _ref8 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(
  function _callee9(task, worker) {var self;return _regenerator2.default.wrap(function _callee9$(_context9) {while (1) {switch (_context9.prev = _context9.next) {case 0:
            self = this;return _context9.abrupt('return', function () {var _ref9 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(
              function _callee8(result) {return _regenerator2.default.wrap(function _callee8$(_context8) {while (1) {switch (_context8.prev = _context8.next) {case 0:
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
                        _context8.next = 5;return self.next();case 5:case 'end':return _context8.stop();}}}, _callee8, this);}));function childSuccessJobHandler(_x9) {return _ref9.apply(this, arguments);}return childSuccessJobHandler;}());case 2:case 'end':return _context9.stop();}}}, _callee9, this);}));return function successJobHandler(_x7, _x8) {return _ref8.apply(this, arguments);};}();



/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Job handler helper
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * @param {ITask} task
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * @param {IJob} worker
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * @param {IWorker} workerInstance
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * @return {Function}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */































/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * Timeout creator helper
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * @return {number}""
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       */var createTimeout = exports.createTimeout = function () {var _ref11 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(
  function _callee11() {var task, JobWorker, workerInstance, timeout, params, handler;return _regenerator2.default.wrap(function _callee11$(_context11) {while (1) {switch (_context11.prev = _context11.next) {case 0:
            // if running any job, stop it
            // the purpose here is to prevent cocurrent operation in same channel
            clearTimeout(this.currentTimeout);

            // Get next task
            _context11.next = 3;return db.call(this).fetch();case 3:task = _context11.sent.shift();if (!(

            task === undefined)) {_context11.next = 8;break;}
            logProxy.call(this, 'queue.empty', this.currentChannel);
            stopQueue.call(this);return _context11.abrupt('return',
            1);case 8:if (


            this.container.has(task.handler)) {_context11.next = 16;break;}
            logProxy.call(this, 'queue.not-found', task.handler);_context11.next = 12;return (
              failedJobHandler.call(this, task));case 12:_context11.t0 = this;_context11.next = 15;return _context11.sent.call(_context11.t0);case 15:return _context11.abrupt('return',
            1);case 16:


            // Get worker with handler name
            JobWorker = this.container.get(task.handler);

            // Create a worker instance
            workerInstance = new JobWorker();

            // get always last updated config value
            timeout = workerInstance.timeout || this.config.get('timeout');

            // create a array with handler parameters for shorten line numbers
            params = [task, JobWorker, workerInstance];

            // Get handler function for handle on completed event
            _context11.next = 22;return loopHandler.call.apply(loopHandler, [this].concat(params));case 22:_context11.t1 = this;handler = _context11.sent.bind(_context11.t1);

            // create new timeout for process a job in queue
            // binding loopHandler function to setTimeout
            // then return the timeout instance
            this.currentTimeout = setTimeout(handler, timeout);return _context11.abrupt('return',

            this.currentTimeout);case 26:case 'end':return _context11.stop();}}}, _callee11, this);}));return function createTimeout() {return _ref11.apply(this, arguments);};}();


/**
                                                                                                                                                                                                                                                                                                                                                                         * Set the status to false of queue
                                                                                                                                                                                                                                                                                                                                                                         * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                                                         * @return {void}
                                                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                                                         * @api private
                                                                                                                                                                                                                                                                                                                                                                         */




/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Checks whether a task is replicable or not
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * @param {ITask} task
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * @return {boolean}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */var canMultiple = exports.canMultiple = function () {var _ref12 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(
  function _callee12(task) {return _regenerator2.default.wrap(function _callee12$(_context12) {while (1) {switch (_context12.prev = _context12.next) {case 0:if (!(
            (typeof task === 'undefined' ? 'undefined' : _typeof(task)) !== 'object' || task.unique !== true)) {_context12.next = 2;break;}return _context12.abrupt('return', true);case 2:_context12.next = 4;return (
              this.hasByTag(task.tag));case 4:_context12.t0 = _context12.sent;return _context12.abrupt('return', _context12.t0 === false);case 6:case 'end':return _context12.stop();}}}, _callee12, this);}));return function canMultiple(_x10) {return _ref12.apply(this, arguments);};}();


/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * Job handler class register
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @param {ITask} task
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @param {IWorker} worker
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @return {void}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             */exports.checkPriority = checkPriority;exports.db = db;exports.logProxy = logProxy;exports.dispatchEvents = dispatchEvents;exports.stopQueue = stopQueue;exports.fireJobInlineEvent = fireJobInlineEvent;exports.successProcess = successProcess;exports.updateRetry = updateRetry;exports.loopHandler = loopHandler;exports.statusOff = statusOff;exports.
registerWorkers = registerWorkers;var _queue = require('./queue');var _queue2 = _interopRequireDefault(_queue);var _utils = require('./utils');var _storageCapsule = require('./storage-capsule');var _storageCapsule2 = _interopRequireDefault(_storageCapsule);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {arr2[i] = arr[i];}return arr2;} else {return Array.from(arr);}}function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};} /* eslint no-underscore-dangle: [2, { "allow": ["_id"] }] */ /* eslint no-param-reassign: "error" */ /* eslint use-isnan: "error" */ /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Task priority controller helper
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @return {ITask}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @param {ITask} task
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */function checkPriority(task) {task.priority = task.priority || 0;if (typeof task.priority !== 'number') task.priority = 0;return task;} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * Shortens function the db belongsto current channel
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * @return {StorageCapsule}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           */function db() {return this.storage.channel(this.currentChannel);}function logProxy() {for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {args[_key] = arguments[_key];}_utils.log.call.apply(_utils.log, [// debug mode status
  this.config.get('debug')].concat(_toConsumableArray(args)));}function dispatchEvents(task, type) {var _this = this;if (!('tag' in task)) return false;var events = [[task.tag + ':' + type, 'fired'], [task.tag + ':*', 'wildcard-fired']];events.forEach(function (e) {_this.event.emit(e[0], task);logProxy.call(_this, 'event.' + e[1], e[0]);});return true;} /**
                                                                                                                                                                                                                                                                                                                                                                     * Queue stopper helper
                                                                                                                                                                                                                                                                                                                                                                     * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                     * @return {void}
                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                     * @api private
                                                                                                                                                                                                                                                                                                                                                                     */function stopQueue() {this.stop();clearTimeout(this.currentTimeout);logProxy.call(this, 'queue.stopped', 'stop');}function fireJobInlineEvent(name, worker, args) {if ((0, _utils.hasMethod)(worker, name) && (0, _utils.isFunction)(worker[name])) {worker[name].call(worker, args);return true;}return false;} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * Process handler of succeeded job
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * @param {ITask} task
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * @return {void}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         */function successProcess(task) {removeTask.call(this, task._id);} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * Update task's retry value
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @param {ITask} task
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @param {IWorker} worker
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @return {ITask}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             */function updateRetry(task, worker) {if (!('retry' in worker)) worker.retry = 1;if (!('tried' in task)) {task.tried = 0;task.retry = worker.retry;}task.tried += 1;if (task.tried >= worker.retry) {task.freezed = true;}return task;} /* istanbul ignore next */function loopHandler(task, worker, workerInstance) {return function () {var _ref10 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee10() {var _workerInstance$handl;var self, deps, dependencies;return _regenerator2.default.wrap(function _callee10$(_context10) {while (1) {switch (_context10.prev = _context10.next) {case 0:self = this; // lock the current task for prevent race condition
              _context10.next = 3;return lockTask.call(self, task);case 3: // fire job before event
              fireJobInlineEvent.call(this, 'before', workerInstance, task.args); // dispacth custom before event
              dispatchEvents.call(this, task, 'before');deps = _queue2.default.workerDeps[worker.name]; // preparing worker dependencies
              dependencies = Object.values(deps || {}); // Task runner promise
              _context10.t1 = (_workerInstance$handl = workerInstance.handle).call.apply(_workerInstance$handl, [workerInstance, task.args].concat(_toConsumableArray(dependencies)));_context10.next = 10;return successJobHandler.call(self, task, workerInstance);case 10:_context10.t2 = self;_context10.t3 = _context10.sent.bind(_context10.t2);_context10.t0 = _context10.t1.then.call(_context10.t1, _context10.t3);_context10.next = 15;return failedJobHandler.call(self, task);case 15:_context10.t4 = self;_context10.t5 = _context10.sent.bind(_context10.t4);_context10.t0.catch.call(_context10.t0, _context10.t5);case 18:case 'end':return _context10.stop();}}}, _callee10, this);}));function childLoopHandler() {return _ref10.apply(this, arguments);}return childLoopHandler;}();}function statusOff() {this.running = false;}function registerWorkers() {if (_queue2.default.isRegistered) return false;var workers = _queue2.default.queueWorkers || {};this.container.merge(workers);_queue2.default.isRegistered = true;return true;}

},{"./queue":23,"./storage-capsule":24,"./utils":25,"babel-runtime/regenerator":1}],22:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _queue = require('./queue');var _queue2 = _interopRequireDefault(_queue);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

/* global window:true */

window.Queue = _queue2.default;exports.default = _queue2.default;

},{"./queue":23}],23:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _regenerator = require('babel-runtime/regenerator');var _regenerator2 = _interopRequireDefault(_regenerator);var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};exports.default =






















Queue;var _container = require('./container');var _container2 = _interopRequireDefault(_container);var _storageCapsule = require('./storage-capsule');var _storageCapsule2 = _interopRequireDefault(_storageCapsule);var _config = require('./config');var _config2 = _interopRequireDefault(_config);var _event2 = require('./event');var _event3 = _interopRequireDefault(_event2);var _utils = require('./utils');var _helpers = require('./helpers');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};} /* eslint no-underscore-dangle: [2, { "allow": ["_id"] }] */function Queue(config) {
  this.channels = {};
  this.config = new _config2.default(config);

  // if custom storage driver exists, setup it
  var storage = Queue.drivers.storage;
  this.storage = new _storageCapsule2.default(this.config, storage);

  // Default job timeout
  this.timeout = this.config.get('timeout');
}

Queue.FIFO = 'fifo';
Queue.LIFO = 'lifo';
Queue.drivers = {};
Queue.queueWorkers = {};
Queue.workerDeps = {};

Queue.prototype.currentChannel = null;
Queue.prototype.stopped = true;
Queue.prototype.running = false;
Queue.prototype.event = new _event3.default();
Queue.prototype.container = new _container2.default();

/**
                                                                                                               * Create new job to channel
                                                                                                               *
                                                                                                               * @param  {Object} task
                                                                                                               * @return {String|Boolean} job
                                                                                                               *
                                                                                                               * @api public
                                                                                                               */
Queue.prototype.add = function () {var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(task) {var id;return _regenerator2.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.next = 2;return (
              _helpers.canMultiple.call(this, task));case 2:if (_context.sent) {_context.next = 4;break;}return _context.abrupt('return', false);case 4:_context.next = 6;return (

              _helpers.saveTask.call(this, task));case 6:id = _context.sent;if (!(

            id && this.stopped && this.running === true)) {_context.next = 10;break;}_context.next = 10;return (
              this.start());case 10:


            // pass activity to the log service.
            _helpers.logProxy.call(this, 'queue.created', task.handler);return _context.abrupt('return',

            id);case 12:case 'end':return _context.stop();}}}, _callee, this);}));function add(_x) {return _ref.apply(this, arguments);}return add;}();


/**
                                                                                                                                                                                                                                                                                                                 * Process next job
                                                                                                                                                                                                                                                                                                                 *
                                                                                                                                                                                                                                                                                                                 * @return {void}
                                                                                                                                                                                                                                                                                                                 *
                                                                                                                                                                                                                                                                                                                 * @api public
                                                                                                                                                                                                                                                                                                                 */
Queue.prototype.next = function () {var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {return _regenerator2.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:if (!
            this.stopped) {_context2.next = 3;break;}
            _helpers.statusOff.call(this);return _context2.abrupt('return',
            _helpers.stopQueue.call(this));case 3:


            // Generate a log message
            _helpers.logProxy.call(this, 'queue.next', 'next');

            // start queue again
            _context2.next = 6;return this.start();case 6:return _context2.abrupt('return',

            true);case 7:case 'end':return _context2.stop();}}}, _callee2, this);}));function next() {return _ref2.apply(this, arguments);}return next;}();


/**
                                                                                                                                                                                                                                                                                                                         * Start queue listener
                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                         * @return {Boolean} job
                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                         * @api public
                                                                                                                                                                                                                                                                                                                         */
Queue.prototype.start = function () {var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {return _regenerator2.default.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:
            // Stop the queue for restart
            this.stopped = false;

            // Register tasks, if not registered
            _helpers.registerWorkers.call(this);

            _helpers.logProxy.call(this, 'queue.starting', 'start');

            // Create a timeout for start queue
            _context3.next = 5;return _helpers.createTimeout.call(this);case 5:_context3.t0 = _context3.sent;this.running = _context3.t0 > 0;return _context3.abrupt('return',

            this.running);case 8:case 'end':return _context3.stop();}}}, _callee3, this);}));function start() {return _ref3.apply(this, arguments);}return start;}();


/**
                                                                                                                                                                                                                                                                                                                                             * Stop queue listener after end of current task
                                                                                                                                                                                                                                                                                                                                             *
                                                                                                                                                                                                                                                                                                                                             * @return {Void}
                                                                                                                                                                                                                                                                                                                                             *
                                                                                                                                                                                                                                                                                                                                             * @api public
                                                                                                                                                                                                                                                                                                                                             */
Queue.prototype.stop = function stop() {
  _helpers.logProxy.call(this, 'queue.stopping', 'stop');
  this.stopped = true;
};

/**
       * Stop queue listener including current task
       *
       * @return {Void}
       *
       * @api public
       */
Queue.prototype.forceStop = function forceStop() {
  /* istanbul ignore next */
  _helpers.stopQueue.call(this);
};

/**
       * Create a new channel
       *
       * @param  {String} task
       * @return {Queue} channel
       *
       * @api public
       */
Queue.prototype.create = function create(channel) {
  if (!(channel in this.channels)) {
    this.currentChannel = channel;
    this.channels[channel] = (0, _utils.clone)(this);
  }

  return this.channels[channel];
};

/**
       * Get channel instance by channel name
       *
       * @param  {String} name
       * @return {Queue}
       *
       * @api public
       */
Queue.prototype.channel = function channel(name) {
  if (!this.channels[name]) {
    throw new Error('Channel of "' + name + '" not found');
  }

  return this.channels[name];
};

/**
       * Check whether there is any task
       *
       * @return {Booelan}
       *
       * @api public
       */
Queue.prototype.isEmpty = function () {var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {return _regenerator2.default.wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:_context4.next = 2;return (
              this.count());case 2:_context4.t0 = _context4.sent;return _context4.abrupt('return', _context4.t0 < 1);case 4:case 'end':return _context4.stop();}}}, _callee4, this);}));function isEmpty() {return _ref4.apply(this, arguments);}return isEmpty;}();


/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * Get task count
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * @return {Number}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * @api public
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           */
Queue.prototype.count = function () {var _ref5 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {return _regenerator2.default.wrap(function _callee5$(_context5) {while (1) {switch (_context5.prev = _context5.next) {case 0:_context5.next = 2;return (
              _helpers.getTasksWithoutFreezed.call(this));case 2:return _context5.abrupt('return', _context5.sent.length);case 3:case 'end':return _context5.stop();}}}, _callee5, this);}));function count() {return _ref5.apply(this, arguments);}return count;}();


/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * Get task count by tag
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @param  {String} tag
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @return {Array<ITask>}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @api public
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             */
Queue.prototype.countByTag = function () {var _ref6 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee6(tag) {return _regenerator2.default.wrap(function _callee6$(_context6) {while (1) {switch (_context6.prev = _context6.next) {case 0:_context6.next = 2;return (
              _helpers.getTasksWithoutFreezed.call(this));case 2:_context6.t0 = function (t) {return t.tag === tag;};return _context6.abrupt('return', _context6.sent.filter(_context6.t0).length);case 4:case 'end':return _context6.stop();}}}, _callee6, this);}));function countByTag(_x2) {return _ref6.apply(this, arguments);}return countByTag;}();


/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * Remove all tasks from channel
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * @return {Boolean}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * @api public
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         */
Queue.prototype.clear = function clear() {
  if (!this.currentChannel) return false;
  this.storage.clear(this.currentChannel);
  return true;
};

/**
       * Remove all tasks from channel by tag
       *
       * @param  {String} tag
       * @return {Boolean}
       *
       * @api public
       */
Queue.prototype.clearByTag = function () {var _ref7 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee8(tag) {var _this = this;var self, data, removes;return _regenerator2.default.wrap(function _callee8$(_context8) {while (1) {switch (_context8.prev = _context8.next) {case 0:
            self = this;_context8.next = 3;return (
              _helpers.db.call(self).all());case 3:data = _context8.sent;
            removes = data.filter(_utils.utilClearByTag.bind(tag)).map(function () {var _ref8 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee7(t) {var result;return _regenerator2.default.wrap(function _callee7$(_context7) {while (1) {switch (_context7.prev = _context7.next) {case 0:_context7.next = 2;return (
                          _helpers.db.call(self).delete(t._id));case 2:result = _context7.sent;return _context7.abrupt('return',
                        result);case 4:case 'end':return _context7.stop();}}}, _callee7, _this);}));return function (_x4) {return _ref8.apply(this, arguments);};}());_context8.next = 7;return (

              Promise.all(removes));case 7:case 'end':return _context8.stop();}}}, _callee8, this);}));function clearByTag(_x3) {return _ref7.apply(this, arguments);}return clearByTag;}();


/**
                                                                                                                                                                                                                                                                                                                                                                                           * Check a task whether exists by job id
                                                                                                                                                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                                                                                                                                                           * @param  {String} tag
                                                                                                                                                                                                                                                                                                                                                                                           * @return {Boolean}
                                                                                                                                                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                                                                                                                                                           * @api public
                                                                                                                                                                                                                                                                                                                                                                                           */
Queue.prototype.has = function () {var _ref9 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee9(id) {return _regenerator2.default.wrap(function _callee9$(_context9) {while (1) {switch (_context9.prev = _context9.next) {case 0:_context9.next = 2;return (
              _helpers.getTasksWithoutFreezed.call(this));case 2:_context9.t0 = function (t) {return t._id === id;};_context9.t1 = _context9.sent.findIndex(_context9.t0);_context9.t2 = -1;return _context9.abrupt('return', _context9.t1 > _context9.t2);case 6:case 'end':return _context9.stop();}}}, _callee9, this);}));function has(_x5) {return _ref9.apply(this, arguments);}return has;}();


/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * Check a task whether exists by tag
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @param  {String} tag
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @return {Boolean}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @api public
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             */
Queue.prototype.hasByTag = function () {var _ref10 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee10(tag) {return _regenerator2.default.wrap(function _callee10$(_context10) {while (1) {switch (_context10.prev = _context10.next) {case 0:_context10.next = 2;return (
              _helpers.getTasksWithoutFreezed.call(this));case 2:_context10.t0 = function (t) {return t.tag === tag;};_context10.t1 = _context10.sent.findIndex(_context10.t0);_context10.t2 = -1;return _context10.abrupt('return', _context10.t1 > _context10.t2);case 6:case 'end':return _context10.stop();}}}, _callee10, this);}));function hasByTag(_x6) {return _ref10.apply(this, arguments);}return hasByTag;}();


/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * Set config timeout value
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * @param  {Number} val
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * @return {Void}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * @api public
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         */
Queue.prototype.setTimeout = function setTimeout(val) {
  this.timeout = val;
  this.config.set('timeout', val);
};

/**
       * Set config limit value
       *
       * @param  {Number} val
       * @return {Void}
       *
       * @api public
       */
Queue.prototype.setLimit = function setLimit(val) {
  this.config.set('limit', val);
};

/**
       * Set config prefix value
       *
       * @param  {String} val
       * @return {Void}
       *
       * @api public
       */
Queue.prototype.setPrefix = function setPrefix(val) {
  this.config.set('prefix', val);
};

/**
       * Set config priciple value
       *
       * @param  {String} val
       * @return {Void}
       *
       * @api public
       */
Queue.prototype.setPrinciple = function setPrinciple(val) {
  this.config.set('principle', val);
};

/**
       * Set config debug value
       *
       * @param  {Boolean} val
       * @return {Void}
       *
       * @api public
       */
Queue.prototype.setDebug = function setDebug(val) {
  this.config.set('debug', val);
};

Queue.prototype.setStorage = function setStorage(val) {
  this.config.set('storage', val);
};

/**
       * Set action events
       *
       * @param  {String} key
       * @param  {Function} cb
       * @return {Void}
       *
       * @api public
       */
Queue.prototype.on = function on(key, cb) {var _event;
  (_event = this.event).on.apply(_event, [key, cb]);
  _helpers.logProxy.call(this, 'event.created', key);
};

/**
       * Register worker
       *
       * @param  {Array<IJob>} jobs
       * @return {Void}
       *
       * @api public
       */
Queue.workers = function workers() {var workersObj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (!(workersObj instanceof Object)) {
    throw new Error('The parameters should be object.');
  }

  Queue.isRegistered = false;
  Queue.queueWorkers = workersObj;
};

/**
       * Added workers dependencies
       *
       * @param  {Object} driver
       * @return {Void}
       *
       * @api public
       */
Queue.deps = function deps() {var dependencies = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (!(dependencies instanceof Object)) {
    throw new Error('The parameters should be object.');
  }

  Queue.workerDeps = dependencies;
};

/**
       * Setup a custom driver
       *
       * @param  {Object} driver
       * @return {Void}
       *
       * @api public
       */
Queue.use = function use(driver) {
  Queue.drivers = _extends({}, Queue.drivers, driver);
};

},{"./config":17,"./container":18,"./event":20,"./helpers":21,"./storage-capsule":24,"./utils":25,"babel-runtime/regenerator":1}],24:[function(require,module,exports){
'use strict';var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};Object.defineProperty(exports, "__esModule", { value: true });var _regenerator = require('babel-runtime/regenerator');var _regenerator2 = _interopRequireDefault(_regenerator);var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {return typeof obj === 'undefined' ? 'undefined' : _typeof2(obj);} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === 'undefined' ? 'undefined' : _typeof2(obj);};var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();
var _groupBy = require('group-by');var _groupBy2 = _interopRequireDefault(_groupBy);



var _adapters = require('./adapters');
var _utils = require('./utils');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}

/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
/* eslint no-underscore-dangle: [2, { "allow": ["_id"] }] */
/* eslint class-methods-use-this: ["error", { "exceptMethods": ["generateId"] }] */var

StorageCapsule = function () {




  function StorageCapsule(config, storage) {_classCallCheck(this, StorageCapsule);
    this.config = config;
    this.storage = this.initStorage(storage);
  }_createClass(StorageCapsule, [{ key: 'initStorage', value: function initStorage(

    Storage) {
      if ((typeof Storage === 'undefined' ? 'undefined' : _typeof(Storage)) === 'object') {
        return Storage;
      } else if (typeof Storage === 'function') {
        return new Storage(this.config);
      } else if (this.config.get('storage') === 'inmemory') {
        return new _adapters.InMemoryAdapter(this.config);
      }

      return new _adapters.LocalForageAdapter(this.config);
    }

    /**
         * Select a channel by channel name
         *
         * @param  {String} name
         * @return {StorageCapsule}
         *
         * @api public
         */ }, { key: 'channel', value: function channel(
    name) {
      this.storageChannel = name;
      return this;
    }

    /**
         * Fetch tasks from storage with ordered
         *
         * @return {any[]}
         *
         * @api public
         */ }, { key: 'fetch', value: function () {var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {var all, tasks;return _regenerator2.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.next = 2;return (

                  this.all());case 2:_context.t0 = _utils.excludeSpecificTasks;all = _context.sent.filter(_context.t0);
                tasks = (0, _groupBy2.default)(all, 'priority');return _context.abrupt('return',
                Object.keys(tasks).
                map(function (key) {return parseInt(key, 10);}).
                sort(function (a, b) {return b - a;}).
                reduce(this.reduceTasks(tasks), []));case 6:case 'end':return _context.stop();}}}, _callee, this);}));function fetch() {return _ref.apply(this, arguments);}return fetch;}()


    /**
                                                                                                                                                                                                                                                                                                                                                                                       * Save task to storage
                                                                                                                                                                                                                                                                                                                                                                                       *
                                                                                                                                                                                                                                                                                                                                                                                       * @param  {ITask} task
                                                                                                                                                                                                                                                                                                                                                                                       * @return {String|Boolean}
                                                                                                                                                                                                                                                                                                                                                                                       *
                                                                                                                                                                                                                                                                                                                                                                                       * @api public
                                                                                                                                                                                                                                                                                                                                                                                       */ }, { key: 'save', value: function () {var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(
      task) {var tasks, newTask;return _regenerator2.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:if (!(
                (typeof task === 'undefined' ? 'undefined' : _typeof(task)) !== 'object')) {_context2.next = 2;break;}return _context2.abrupt('return', false);case 2:_context2.next = 4;return (


                  this.storage.get(this.storageChannel));case 4:tasks = _context2.sent;_context2.next = 7;return (



                  this.isExceeded());case 7:if (!_context2.sent) {_context2.next = 10;break;}
                console.warn('Task limit exceeded: The \'' + this.storageChannel + '\' channel limit is ' + this.config.get('limit'));return _context2.abrupt('return',
                false);case 10:


                // prepare all properties before save
                // example: createdAt etc.
                newTask = this.prepareTask(task);

                // add task to storage
                tasks.push(newTask);

                // save tasks
                _context2.next = 14;return this.storage.set(this.storageChannel, tasks);case 14:return _context2.abrupt('return',

                newTask._id);case 15:case 'end':return _context2.stop();}}}, _callee2, this);}));function save(_x) {return _ref2.apply(this, arguments);}return save;}()


    /**
                                                                                                                                                                                                                                                                                                                                               * Update channel store.
                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                               * @return {string}
                                                                                                                                                                                                                                                                                                                                               *   The value. This annotation can be used for type hinting purposes.
                                                                                                                                                                                                                                                                                                                                               */ }, { key: 'update', value: function () {var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3(
      id, _update) {var data, index;return _regenerator2.default.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:_context3.next = 2;return (
                  this.all());case 2:data = _context3.sent;
                index = data.findIndex(function (t) {return t._id === id;});

                // if index not found, return false
                if (!(index < 0)) {_context3.next = 6;break;}return _context3.abrupt('return', false);case 6:

                // merge existing object with given update object
                data[index] = Object.assign({}, data[index], _update);

                // save to the storage as string
                _context3.next = 9;return this.storage.set(this.storageChannel, data);case 9:return _context3.abrupt('return',

                true);case 10:case 'end':return _context3.stop();}}}, _callee3, this);}));function update(_x2, _x3) {return _ref3.apply(this, arguments);}return update;}()


    /**
                                                                                                                                                                                                                                                                                                                                                     * Remove task from storage
                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                     * @param  {String} id
                                                                                                                                                                                                                                                                                                                                                     * @return {Boolean}
                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                     * @api public
                                                                                                                                                                                                                                                                                                                                                     */ }, { key: 'delete', value: function () {var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4(
      id) {var data, index;return _regenerator2.default.wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:_context4.next = 2;return (
                  this.all());case 2:data = _context4.sent;
                index = data.findIndex(function (d) {return d._id === id;});if (!(

                index < 0)) {_context4.next = 6;break;}return _context4.abrupt('return', false);case 6:

                delete data[index];_context4.next = 9;return (

                  this.storage.set(this.storageChannel, data.filter(function (d) {return d;})));case 9:return _context4.abrupt('return',

                true);case 10:case 'end':return _context4.stop();}}}, _callee4, this);}));function _delete(_x4) {return _ref4.apply(this, arguments);}return _delete;}()


    /**
                                                                                                                                                                                                                                                                                                                                               * Get all tasks
                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                               * @return {Any[]}
                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                               * @api public
                                                                                                                                                                                                                                                                                                                                               */ }, { key: 'all', value: function () {var _ref5 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {var items;return _regenerator2.default.wrap(function _callee5$(_context5) {while (1) {switch (_context5.prev = _context5.next) {case 0:_context5.next = 2;return (

                  this.storage.get(this.storageChannel));case 2:items = _context5.sent;return _context5.abrupt('return',
                items);case 4:case 'end':return _context5.stop();}}}, _callee5, this);}));function all() {return _ref5.apply(this, arguments);}return all;}()


    /**
                                                                                                                                                                                                                                                                                                                         * Generate unique id
                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                         * @return {String}
                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                         * @api public
                                                                                                                                                                                                                                                                                                                         */ }, { key: 'generateId', value: function generateId()
    {
      return ((1 + Math.random()) * 0x10000).toString(16);
    }

    /**
         * Add some necessary properties
         *
         * @param  {String} id
         * @return {ITask}
         *
         * @api public
         */ }, { key: 'prepareTask', value: function prepareTask(
    task) {
      var newTask = _extends({}, task);
      newTask.createdAt = Date.now();
      newTask._id = this.generateId();
      return newTask;
    }

    /**
         * Add some necessary properties
         *
         * @param  {ITask[]} tasks
         * @return {Function}
         *
         * @api public
         */ }, { key: 'reduceTasks', value: function reduceTasks(
    tasks) {var _this = this;
      var reduceFunc = function reduceFunc(result, key) {
        if (_this.config.get('principle') === 'lifo') {
          return result.concat(tasks[key].sort(_utils.lifo));
        }
        return result.concat(tasks[key].sort(_utils.fifo));
      };

      return reduceFunc.bind(this);
    }

    /**
         * Task limit checker
         *
         * @return {Boolean}
         *
         * @api public
         */ }, { key: 'isExceeded', value: function () {var _ref6 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {var limit, tasks;return _regenerator2.default.wrap(function _callee6$(_context6) {while (1) {switch (_context6.prev = _context6.next) {case 0:

                limit = this.config.get('limit');_context6.next = 3;return (
                  this.all());case 3:_context6.t0 = _utils.excludeSpecificTasks;tasks = _context6.sent.filter(_context6.t0);return _context6.abrupt('return',
                !(limit === -1 || limit > tasks.length));case 6:case 'end':return _context6.stop();}}}, _callee6, this);}));function isExceeded() {return _ref6.apply(this, arguments);}return isExceeded;}()


    /**
                                                                                                                                                                                                                                                                                                                                                                                                                         * Clear tasks with given channel name
                                                                                                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                                                                                                         * @param  {String} channel
                                                                                                                                                                                                                                                                                                                                                                                                                         * @return {void}
                                                                                                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                                                                                                         * @api public
                                                                                                                                                                                                                                                                                                                                                                                                                         */ }, { key: 'clear', value: function () {var _ref7 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee7(
      channel) {return _regenerator2.default.wrap(function _callee7$(_context7) {while (1) {switch (_context7.prev = _context7.next) {case 0:_context7.next = 2;return (
                  this.storage.clear(channel));case 2:case 'end':return _context7.stop();}}}, _callee7, this);}));function clear(_x5) {return _ref7.apply(this, arguments);}return clear;}() }]);return StorageCapsule;}();exports.default = StorageCapsule;

},{"./adapters":13,"./utils":25,"babel-runtime/regenerator":1,"group-by":5}],25:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};exports.
















clone = clone;exports.






























hasProperty = hasProperty;exports.












hasMethod = hasMethod;exports.











isFunction = isFunction;exports.











excludeSpecificTasks = excludeSpecificTasks;exports.


















utilClearByTag = utilClearByTag;exports.















fifo = fifo;exports.












lifo = lifo;exports.













log = log;var _objectPath = require('object-path');var _objectPath2 = _interopRequireDefault(_objectPath);var _debug = require('debug');var _debug2 = _interopRequireDefault(_debug);var _log = require('./enum/log.events');var _log2 = _interopRequireDefault(_log);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /* eslint comma-dangle: ["error", "never"] */ /* global localStorage:true */ /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                  * Clone class
                                                                                                                                                                                                                                                                                                                                                                                                                                                  *
                                                                                                                                                                                                                                                                                                                                                                                                                                                  * @param  {Object} obj
                                                                                                                                                                                                                                                                                                                                                                                                                                                  * @return {Object}
                                                                                                                                                                                                                                                                                                                                                                                                                                                  *
                                                                                                                                                                                                                                                                                                                                                                                                                                                  * @api public
                                                                                                                                                                                                                                                                                                                                                                                                                                                  */function clone(func) {var newClass = Object.create(Object.getPrototypeOf(func), Object.getOwnPropertyNames(func).reduce(function (props, name) {var newProps = _extends({}, props);newProps[name] = Object.getOwnPropertyDescriptor(func, name);return newProps;}, {}));if (!Object.isExtensible(func)) {Object.preventExtensions(newClass);}if (Object.isSealed(func)) {Object.seal(newClass);}if (Object.isFrozen(func)) {Object.freeze(newClass);}return newClass;} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Check property in object
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @param  {Object} obj
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @return {Boolean}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @api public
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */function hasProperty(func, name) {return Object.prototype.hasOwnProperty.call(func, name);} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * Check method in initiated class
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * @param  {Class} instance
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * @param  {String} method
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * @return {Boolean}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * @api public
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           */function hasMethod(instance, method) {return instance instanceof Object && method in instance;} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * Check function type
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @param  {Function} func
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @return {Boolean}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @api public
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              */function isFunction(func) {return func instanceof Function;} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * Remove some tasks by some conditions
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @param  {Function} func
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @return {Boolean}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @api public
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              */function excludeSpecificTasks(task) {var conditions = Array.isArray(this) ? this : ['freezed', 'locked'];var results = [];conditions.forEach(function (c) {results.push(hasProperty(task, c) === false || task[c] === false);});return !(results.indexOf(false) > -1);} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * Clear tasks by it's tags
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * @param  {ITask} task
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * @return {Boolean}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * @api public
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         */function utilClearByTag(task) {if (!excludeSpecificTasks.call(['locked'], task)) {return false;}return task.tag === this;} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * Sort by fifo
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * @param  {ITask} a
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * @param  {ITask} b
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * @return {Any}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * @api public
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       */function fifo(a, b) {return a.createdAt - b.createdAt;} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * Sort by lifo
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * @param  {ITask} a
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * @param  {ITask} b
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * @return {Any}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * @api public
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  */function lifo(a, b) {return b.createdAt - a.createdAt;} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * Log helper
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @param  {String} key
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @param  {String} data
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @param  {Boolean} condition
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @return {void}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @api public
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             */function log(key) {var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';if (this !== true) {localStorage.removeItem('debug');return;} // debug mode on always
                                                           localStorage.setItem('debug', 'worker:*'); // get new debug function instance
                                                           var logger = (0, _debug2.default)('worker:' + data + ' ->'); // the output push to console
                                                           logger(_objectPath2.default.get(_log2.default, key));}

},{"./enum/log.events":19,"debug":3,"object-path":8}]},{},[22])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9yZWdlbmVyYXRvci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb21wb25lbnQtcHJvcHMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZGVidWcvc3JjL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvZGVidWcvc3JjL2RlYnVnLmpzIiwibm9kZV9tb2R1bGVzL2dyb3VwLWJ5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvY2FsZm9yYWdlL2Rpc3QvbG9jYWxmb3JhZ2UuanMiLCJub2RlX21vZHVsZXMvbXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvb2JqZWN0LXBhdGgvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3JlZ2VuZXJhdG9yLXJ1bnRpbWUvcnVudGltZS1tb2R1bGUuanMiLCJub2RlX21vZHVsZXMvcmVnZW5lcmF0b3ItcnVudGltZS9ydW50aW1lLmpzIiwibm9kZV9tb2R1bGVzL3RvLWZ1bmN0aW9uL2luZGV4LmpzIiwic3JjL2FkYXB0ZXJzL2luZGV4LmpzIiwic3JjL2FkYXB0ZXJzL2lubWVtb3J5LmpzIiwic3JjL2FkYXB0ZXJzL2xvY2FsZm9yYWdlLmpzIiwic3JjL2NvbmZpZy5kYXRhLmpzIiwic3JjL2NvbmZpZy5qcyIsInNyYy9jb250YWluZXIuanMiLCJzcmMvZW51bS9sb2cuZXZlbnRzLmpzIiwic3JjL2V2ZW50LmpzIiwic3JjL2hlbHBlcnMuanMiLCJzcmMvaW5kZXguanMiLCJzcmMvcXVldWUuanMiLCJzcmMvc3RvcmFnZS1jYXBzdWxlLmpzIiwic3JjL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNuTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDak9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDN3VGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2dEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7K2EsQUN4Sk87QSxBQUNBOzs7Ozs7OztBLEFDSWMsOEJBS25COzs7OzsyQkFBQSxBQUFZLFFBQWlCLDZDQUY3QixBQUU2QixRQUZJLEFBRUosQUFDM0I7U0FBQSxBQUFLLFNBQUwsQUFBYyxBQUNkO1NBQUEsQUFBSyxTQUFTLEtBQUEsQUFBSyxPQUFMLEFBQVksSUFBMUIsQUFBYyxBQUFnQixBQUMvQjtBQUVEOzs7Ozs7Ozs7eUpBUVU7QSxpSkFDRjtBLDJCQUFXLEtBQUEsQUFBSyxZLEFBQUwsQUFBaUI7cUJBQ3ZCLEFBQUssYyxBQUFMLEFBQW1CLFNBQW5CLHNJQUdiOzs7Ozs7Ozs7OztpZUFTVTtBLFcsQUFBYSxtSUFDckI7cUJBQUEsQUFBSyxNQUFNLEtBQUEsQUFBSyxZQUFoQixBQUFXLEFBQWlCLHFDQUE1QixBQUF3QyxnQ0FDakM7QSxzQiw0SUFHVDs7Ozs7Ozs7OztpY0FRVTtBLGlLQUNEO3VCQUFBLEFBQU8sVUFBUCxBQUFpQixlQUFqQixBQUFnQyxLQUFLLEtBQXJDLEFBQTBDLE9BQU8sS0FBQSxBQUFLLFksQUFBdEQsQUFBaUQsQUFBaUIsNklBRzNFOzs7Ozs7Ozs7OzZqQkFRWTtBLDRKQUNKO0EsMkJBQVcsS0FBQSxBQUFLLFksQUFBTCxBQUFpQixBQUM1QjtBLHlCQUFTLEtBQUEsQUFBSyxJQUFMLEFBQVMsT0FBTyxPQUFPLEtBQUEsQUFBSyxNQUE1QixBQUF1QixBQUFXLFksQUFBWSxBQUM3RDtxQkFBQSxBQUFLLHFCQUFhLEtBQWxCLEFBQXVCLCtCQUNoQjtBLHVCLDJJQUdUOzs7Ozs7Ozs7O3FYQVFZO0EsWUFBZ0IsQUFDMUI7YUFBTyxPQUFBLEFBQU8sV0FBVyxLQUFsQixBQUFrQixBQUFLLGVBQXZCLEFBQXNDLFNBQVksS0FBbEQsQUFBa0QsQUFBSyxvQkFBOUQsQUFBNkUsQUFDOUU7QUFFRDs7Ozs7Ozs7bURBT1k7QUFDVjthQUFPLEtBQUEsQUFBSyxPQUFMLEFBQVksSUFBbkIsQUFBTyxBQUFnQixBQUN4QjtBLGlEQUVhOztBLFVBQWMsQUFDMUI7VUFBTSxNQUFNLE9BQUEsQUFBTyxVQUFQLEFBQWlCLGVBQWpCLEFBQWdDLEtBQUssS0FBckMsQUFBMEMsT0FBdEQsQUFBWSxBQUFpRCxBQUM3RDtVQUFJLENBQUosQUFBSyxLQUFLLEtBQUEsQUFBSyxNQUFMLEFBQVcsUUFBWCxBQUFtQixBQUM3QjthQUFPLEtBQUEsQUFBSyxNQUFaLEFBQU8sQUFBVyxBQUNuQjtBLHVELEFBM0ZrQjs7OztBQ0pyQiwwQzs7Ozs7QSxBQUtxQixpQ0FLbkI7Ozs7OzhCQUFBLEFBQVksUUFBaUIsZ0RBSDdCLEFBRzZCLFVBSFQsQ0FBQSxBQUFDLGdCQUFELEFBQWlCLGFBQWpCLEFBQThCLEFBR3JCLEFBQzNCO1NBQUEsQUFBSyxTQUFMLEFBQWMsQUFDZDtTQUFBLEFBQUssU0FBUyxLQUFBLEFBQUssT0FBTCxBQUFZLElBQTFCLEFBQWMsQUFBZ0IsQUFDOUI7MEJBQUEsQUFBWSxPQUFPLEVBQUUsUUFBUSxLQUFWLEFBQVUsQUFBSyxhQUFhLE1BQU0sS0FBckQsQUFBbUIsQUFBdUMsQUFDM0Q7QUFFRDs7Ozs7Ozs7OzRKQVFVO0E7d0NBQ1ksQUFBWSxRQUFRLEtBQUEsQUFBSyxZLEFBQXpCLEFBQW9CLEFBQWlCLEtBQXJDLFMsQUFBZCw2Q0FDQztpQkFBQyxPQUFBLEFBQU8sVUFBUCxBQUFpQixXQUFXLEtBQUEsQUFBSyxNQUFqQyxBQUE0QixBQUFXLFNBQXhDLEFBQWlELFUsQUFBVSxzSUFHcEU7Ozs7Ozs7Ozs7OytoQkFTVTtBLFcsQUFBYTt3Q0FDQSxBQUFZLFFBQVEsS0FBQSxBQUFLLFlBQXpCLEFBQW9CLEFBQWlCLE0sQUFBckMsQUFBMkMsTUFBM0MsUyxBQUFmLGdEQUNDO0EsbUtBR1Q7Ozs7Ozs7Ozs7bWNBUVU7QTt3QyxBQUNxQixBQUFZLE1BQVosUyxBQUF2Qiw4Q0FDQztxQkFBQSxBQUFLLFFBQVEsS0FBQSxBQUFLLFlBQWxCLEFBQWEsQUFBaUIsUUFBUSxDLEFBQUMseUlBR2hEOzs7Ozs7Ozs7OytmQVFZO0E7d0NBQ1csQUFBWSxXQUFXLEtBQUEsQUFBSyxZLEFBQTVCLEFBQXVCLEFBQWlCLEtBQXhDLFMsQUFBZixnREFDQztBLGtLQUdUOzs7Ozs7Ozs7Ozt3QyxBQVErQixBQUFZLE1BQVosUyxBQUF2Qix5Q0FDZTswQkFBQSxBQUFRLElBQUksS0FBQSxBQUFLLHdGQUFJLGtCQUFBLEFBQU87c0NBQ3pCLEFBQUssTUFEYSxBQUNsQixBQUFXLElBQVgsU0FEa0IsQUFDbEMsaURBQ0M7QUFGaUMsdUdBQVQsaUUsQUFBWixjLEFBQWYsZ0RBSUM7O0EscUtBR1Q7Ozs7Ozs7Ozs7MlhBUVk7QSxZQUFnQixBQUMxQjthQUFPLE9BQUEsQUFBTyxXQUFXLEtBQWxCLEFBQWtCLEFBQUssZUFBdkIsQUFBc0MsU0FBWSxLQUFsRCxBQUFrRCxBQUFLLG9CQUE5RCxBQUE2RSxBQUM5RTtBQUVEOzs7Ozs7OzttREFPWTtBQUNWO2FBQU8sS0FBQSxBQUFLLE9BQUwsQUFBWSxJQUFuQixBQUFPLEFBQWdCLEFBQ3hCO0EsNkNBRVc7O0FBQ1Y7VUFBTSxnQkFBd0IsS0FBQSxBQUFLLE9BQUwsQUFBWSxJQUExQyxBQUE4QixBQUFnQixBQUM5QztVQUFNLFNBQWlCLENBQUMsS0FBQSxBQUFLLE9BQUwsQUFBWSxJQUFaLEFBQWdCLGNBQWpCLEFBQStCLGVBQXRELEFBQXVCLEFBQThDLEFBQ3JFO2FBQU8sS0FBQSxBQUFLLFFBQUwsQUFBYSxRQUFiLEFBQXFCLFVBQVUsQ0FBL0IsQUFBZ0MsQUFDbkM7NEJBQVksT0FEVCxBQUNILEFBQVksQUFBTyxBQUNuQjs0QkFBWSxjQUZoQixBQUVJLEFBQVksQUFBYyxBQUMvQjtBLDBELEFBN0drQjs7OztrQkNOTixBQUNHLEFBQ2hCO1VBRmEsQUFFTCxBQUNSO1dBSGEsQUFHSixBQUNUO1NBQU8sQ0FKTSxBQUlMLEFBQ1IsQ0FMYSxBQUNiO2FBRGEsQUFLRixBQUNYO1MsQUFOYSxBQU1OOzs7OztBQ0pULHVDOztBLEFBRXFCLHFCQUduQjs7O29CQUFrQyxLQUF0QixBQUFzQiw2RUFBSixBQUFJLHNDQUZsQyxBQUVrQyxrQkFDaEM7U0FBQSxBQUFLLE1BQUwsQUFBVyxBQUNaO0FBRUQ7Ozs7Ozs7Ozs7NkRBU0k7QSxVLEFBQWMsT0FBa0IsQUFDbEM7V0FBQSxBQUFLLE9BQUwsQUFBWSxRQUFaLEFBQW9CLEFBQ3JCO0FBRUQ7Ozs7Ozs7Ozs2Q0FRSTtBLFVBQW1CLEFBQ3JCO2FBQU8sS0FBQSxBQUFLLE9BQVosQUFBTyxBQUFZLEFBQ3BCO0FBRUQ7Ozs7Ozs7Ozs2Q0FRSTtBLFVBQXVCLEFBQ3pCO2FBQU8sT0FBQSxBQUFPLFVBQVAsQUFBaUIsZUFBakIsQUFBZ0MsS0FBSyxLQUFyQyxBQUEwQyxRQUFqRCxBQUFPLEFBQWtELEFBQzFEO0FBRUQ7Ozs7Ozs7OzsrQ0FRTTtBLFlBQWlDLEFBQ3JDO1dBQUEsQUFBSyxTQUFTLE9BQUEsQUFBTyxPQUFQLEFBQWMsSUFBSSxLQUFsQixBQUF1QixRQUFyQyxBQUFjLEFBQStCLEFBQzlDO0FBRUQ7Ozs7Ozs7OztnREFRTztBLFVBQXVCLEFBQzVCO2FBQU8sT0FBTyxLQUFBLEFBQUssT0FBbkIsQUFBYyxBQUFZLEFBQzNCO0FBRUQ7Ozs7Ozs7Ozs2Q0FRZTtBQUNiO2FBQU8sS0FBUCxBQUFZLEFBQ2I7QSw4QyxBQTlFa0I7Ozs7OztBLEFDREE7QSxTQUNuQixHLEFBQXFDLG9DQUVyQzs7Ozs7Ozs7OzZIQVFJO0EsUUFBcUIsQUFDdkI7YUFBTyxPQUFBLEFBQU8sVUFBUCxBQUFpQixlQUFqQixBQUFnQyxLQUFLLEtBQXJDLEFBQTBDLE9BQWpELEFBQU8sQUFBaUQsQUFDekQ7QUFFRDs7Ozs7Ozs7OzZDQVFJO0EsUUFBaUIsQUFDbkI7YUFBTyxLQUFBLEFBQUssTUFBWixBQUFPLEFBQVcsQUFDbkI7QUFFRDs7Ozs7Ozs7NkNBT007QUFDSjthQUFPLEtBQVAsQUFBWSxBQUNiO0FBRUQ7Ozs7Ozs7Ozs7OENBU0s7QSxRLEFBQVksT0FBa0IsQUFDakM7V0FBQSxBQUFLLE1BQUwsQUFBVyxNQUFYLEFBQWlCLEFBQ2xCO0FBRUQ7Ozs7Ozs7OzsrQ0FRb0Q7U0FBOUMsQUFBOEMsMkVBQVYsQUFBVSxBQUNsRDtXQUFBLEFBQUssUUFBUSxPQUFBLEFBQU8sT0FBUCxBQUFjLElBQUksS0FBbEIsQUFBdUIsT0FBcEMsQUFBYSxBQUE4QixBQUM1QztBQUVEOzs7Ozs7Ozs7Z0RBUU87QSxRQUFxQixBQUMxQjtVQUFJLENBQUMsS0FBQSxBQUFLLElBQVYsQUFBSyxBQUFTLEtBQUssT0FBQSxBQUFPLEFBQzFCO2FBQU8sT0FBTyxLQUFBLEFBQUssTUFBbkIsQUFBYyxBQUFXLEFBQzFCO0FBRUQ7Ozs7Ozs7O21EQU9rQjtBQUNoQjtXQUFBLEFBQUssUUFBTCxBQUFhLEFBQ2Q7QSxpRCxBQXJGa0I7Ozs7U0NGWixBQUNMO2FBREssQUFDSSxBQUNUO1VBRkssQUFFQyxBQUNOO2NBSEssQUFHSyxBQUNWO2NBSkssQUFJSyxBQUNWO2FBTEssQUFLSSxBQUNUO1dBTkssQUFNRSxBQUNQO2lCQVBLLEFBT1EsQUFDYjthQVJLLEFBUUksQUFDVDtZQVZXLEFBQ04sQUFTRyxBQUVWLGFBWmEsQUFDYjs7U0FXTyxBQUNMO2FBREssQUFDSSxBQUNUO1dBRkssQUFFRSxBQUNQO3NCLEFBZlcsQUFZTixBQUdhOzs7c3dCQ2Z0QjtBQUNBLG9COztBLEFBRXFCLG9CQU1uQjs7Ozs7O21CQUFjLG1DQUxkLEFBS2MsUUFMbUIsQUFLbkIsUUFKZCxBQUljLGtCQUpZLEFBSVosOENBSGQsQUFHYyxZQUhRLENBQUEsQUFBQyxLQUFELEFBQU0sQUFHZCxjQUZkLEFBRWMsWUFGUSxZQUFNLEFBQUUsQ0FFaEIsQUFDWjtTQUFBLEFBQUssTUFBTCxBQUFXLFNBQVgsQUFBb0IsQUFDcEI7U0FBQSxBQUFLLE1BQUwsQUFBVyxRQUFYLEFBQW1CLEFBQ25CO1NBQUEsQUFBSyxNQUFMLEFBQVcsUUFBWCxBQUFtQixBQUNuQjtTQUFBLEFBQUssTUFBTCxBQUFXLFdBQVgsQUFBc0IsQUFDdEI7U0FBQSxBQUFLLE1BQUwsQUFBVyxRQUFRLEtBQW5CLEFBQXdCLEFBQ3hCO1NBQUEsQUFBSyxNQUFMLEFBQVcsT0FBTyxLQUFsQixBQUF1QixBQUN4QjtBQUVEOzs7Ozs7Ozs7OzJEQVNHO0EsUyxBQUFhLElBQW9CLEFBQ2xDO1VBQUksT0FBQSxBQUFPLE9BQVgsQUFBa0IsWUFBWSxNQUFNLElBQUEsQUFBSSxNQUFWLEFBQU0sQUFBVSxBQUM5QztVQUFJLEtBQUEsQUFBSyxRQUFULEFBQUksQUFBYSxNQUFNLEtBQUEsQUFBSyxJQUFMLEFBQVMsS0FBVCxBQUFjLEFBQ3RDO0FBRUQ7Ozs7Ozs7Ozs7OENBU0s7QSxTLEFBQWEsTUFBaUIsQUFDakM7VUFBSSxLQUFBLEFBQUssVUFBTCxBQUFlLFFBQWYsQUFBdUIsT0FBTyxDQUFsQyxBQUFtQyxHQUFHLEFBQ3BDO2FBQUEsQUFBSyxzQkFBTCxBQUFjLFlBQVEsQ0FBQSxBQUFDLEtBQXZCLEFBQXNCLEFBQU0sQUFDN0I7QUFGRCxhQUVPLEFBQ0w7WUFBTSxPQUFlLEtBQUEsQUFBSyxRQUExQixBQUFxQixBQUFhLEFBQ2xDO1lBQU0sT0FBZSxLQUFBLEFBQUssUUFBMUIsQUFBcUIsQUFBYSxBQUVsQzs7WUFBSSxLQUFBLEFBQUssTUFBVCxBQUFJLEFBQVcsT0FBTyxBQUNwQjtjQUFNLEtBQWUsS0FBQSxBQUFLLE1BQUwsQUFBVyxNQUFYLEFBQWlCLFNBQVMsS0FBL0MsQUFBb0QsQUFDcEQ7YUFBQSxBQUFHLEtBQUgsQUFBUSxNQUFSLEFBQWMsQUFDZjtBQUNGO0FBRUQ7O1dBQUEsQUFBSyxTQUFMLEFBQWMsS0FBZCxBQUFtQixLQUFuQixBQUF3QixBQUN6QjtBQUVEOzs7Ozs7Ozs7OztrREFVUztBLFMsQUFBYSxXLEFBQW1CLE1BQWlCLEFBQ3hEO1VBQUksS0FBQSxBQUFLLE1BQUwsQUFBVyxTQUFmLEFBQUksQUFBb0IsTUFBTSxBQUM1QjthQUFBLEFBQUssTUFBTCxBQUFXLFNBQVgsQUFBb0IsS0FBcEIsQUFBeUIsS0FBekIsQUFBOEIsTUFBOUIsQUFBb0MsV0FBcEMsQUFBK0MsQUFDaEQ7QUFDRjtBQUVEOzs7Ozs7Ozs7OzZDQVNJO0EsUyxBQUFhLElBQW9CLEFBQ25DO1VBQUksS0FBQSxBQUFLLFVBQUwsQUFBZSxRQUFmLEFBQXVCLE9BQU8sQ0FBbEMsQUFBbUMsR0FBRyxBQUNwQzthQUFBLEFBQUssTUFBTCxBQUFXLFNBQVgsQUFBb0IsT0FBcEIsQUFBMkIsQUFDNUI7QUFGRCxhQUVPLEFBQ0w7WUFBTSxPQUFlLEtBQUEsQUFBSyxRQUExQixBQUFxQixBQUFhLEFBQ2xDO1lBQU0sT0FBZSxLQUFBLEFBQUssUUFBMUIsQUFBcUIsQUFBYSxBQUNsQzthQUFBLEFBQUssTUFBTCxBQUFXLE1BQVgsQUFBaUIsUUFBakIsQUFBeUIsQUFDMUI7QUFDRjtBQUVEOzs7Ozs7Ozs7NkNBUUk7QSxTQUFzQixBQUN4QjtVQUFJLEFBQ0Y7WUFBTSxPQUFpQixJQUFBLEFBQUksTUFBM0IsQUFBdUIsQUFBVSxBQUNqQztlQUFPLEtBQUEsQUFBSyxTQUFMLEFBQWMsSUFBSSxDQUFDLENBQUMsS0FBQSxBQUFLLE1BQU0sS0FBWCxBQUFXLEFBQUssSUFBSSxLQUF4QyxBQUFvQixBQUFvQixBQUFLLE1BQU0sQ0FBQyxDQUFDLEtBQUEsQUFBSyxNQUFMLEFBQVcsU0FBUyxLQUFoRixBQUE0RCxBQUFvQixBQUFLLEFBQ3RGO0FBSEQsUUFHRSxPQUFBLEFBQU8sR0FBRyxBQUNWO2VBQUEsQUFBTyxBQUNSO0FBQ0Y7QUFFRDs7Ozs7Ozs7O2lEQVFRO0EsU0FBcUIsQUFDM0I7YUFBTyxJQUFBLEFBQUksTUFBSixBQUFVLFdBQWpCLEFBQU8sQUFBcUIsQUFDN0I7QUFFRDs7Ozs7Ozs7O2lEQVFRO0EsU0FBcUIsQUFDM0I7YUFBTyxJQUFBLEFBQUksTUFBSixBQUFVLHFCQUFqQixBQUFPLEFBQStCLEFBQ3ZDO0FBRUQ7Ozs7Ozs7OztpREFRUTtBLFNBQXNCLEFBQzVCO2FBQU8sS0FBQSxBQUFLLGdCQUFMLEFBQXFCLEtBQXJCLEFBQTBCLFFBQVEsS0FBQSxBQUFLLFVBQUwsQUFBZSxRQUFmLEFBQXVCLE9BQU8sQ0FBdkUsQUFBd0UsQUFDekU7QSw2QyxBQTVJa0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNxQ3JCOzs7Ozs7O3cwREFRTzs7aUJBQ1MsQUFBRyxLQUFILEFBQVEsTUFEakIsQUFDUyxBQUFjLEtBQWQsdUJBQTRCLDRCQUFBLEFBQXFCLEtBQUssQ0FEL0QsQUFDcUMsQUFBMEIsQUFBQywyREFEaEUsQUFDOEIsa0Ysb0IsQUFEZjs7O0FBSXRCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFxQkE7Ozs7Ozs7O3lqQ0FTTztvQkFBQSxBQUF3QjtpQkFDUixBQUFHLEtBQUgsQUFBUSxNQUFSLEFBQWMsS0FBSyxjQURuQyxBQUNnQixBQUFtQixBQUFjLE1BQWpDLFNBRGhCLEFBQ0MsZ0RBQ0M7QUFGRixtRixvQixBQUFlOzs7QUFLdEI7Ozs7Ozs7O3diQVNPO29CQUFBLEFBQTBCO2lCQUNWLEFBQUcsS0FBSCxBQUFRLE1BQVIsQUFBYyxPQUQ5QixBQUNnQixBQUFxQixHQUFyQixTQURoQixBQUNDLGdEQUNDO0FBRkYsbUYsb0IsQUFBZTs7O0FBS3RCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF1Q0E7Ozs7Ozs7OztxbkJBVU87b0JBQUEsQUFBZ0MscVBBQzlCOzhKQUNMO21DQUFBLEFBQVcsS0FBWCxBQUFnQixNQUFNLEtBQXRCLEFBQTJCLEFBRTNCOzs2QkFBQSxBQUFLLE1BQUwsQUFBVyxLQUFYLEFBQWdCLFNBQWhCLEFBQXlCLEFBRXpCOztrREFMSzsrQkFBQSxBQU1DLEFBQUssTUFBTCxpRUFQSCxhQUFBLEFBQ2lCLGtFQURqQixBQUNpQix1RixvQixBQURGOzs7O0FBV3RCOzs7Ozs7Ozt3ekJBU087b0JBQUEsQUFBd0I7aUJBQ1IsQUFBRyxLQUFILEFBQVEsTUFBUixBQUFjLE9BQU8sS0FBckIsQUFBMEIsS0FBSyxFQUFFLFFBRGpELEFBQ2dCLEFBQStCLEFBQVUsT0FBekMsU0FEaEIsQUFDQyxnREFDQztBQUZGLG1GLG9CLEFBQWU7OztBQUt0Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUEyREE7Ozs7Ozs7Ozt1bUJBVU87b0JBQUEsQUFBNEIsTUFBNUIsQUFBeUMsMkpBQzlDO0FBQ0E7MkJBQUEsQUFBZSxLQUFmLEFBQW9CLE1BQXBCLEFBQTBCLE1BQTFCLEFBQWdDLEFBRWhDOztBQUNNO0FBTEQseUJBS3FCLFlBQUEsQUFBWSxLQUFaLEFBQWlCLE1BQWpCLEFBQXVCLE1BTDVDLEFBS3FCLEFBQTZCLEFBRXZEOztBQUNBO3VCQUFBLEFBQVcsU0FBWCxBQUFvQixNQVJmOztpQkFVZ0IsQUFBRyxLQUFILEFBQVEsTUFBUixBQUFjLE9BQU8sS0FBckIsQUFBMEIsS0FWMUMsQUFVZ0IsQUFBK0IsV0FBL0IsU0FWaEIsQUFVQyxnREFFQzs7QUFaRixtRixvQixBQUFlOzs7QUFldEI7Ozs7Ozs7OzswZEFVTztvQkFBQSxBQUFpQyxNQUFqQyxBQUE4Qyw2SUFDN0M7QUFERCxtQkFBQSxBQUNlLHNIQUNiO2dDQUFBLEFBQXNDLG9JQUMzQztBQUNBOzRCQUFBLEFBQUksUUFBUSxBQUNWO0FBQ0E7eUNBQUEsQUFBZSxLQUFmLEFBQW9CLE1BQXBCLEFBQTBCLEFBQzNCO0FBSEQsK0JBR08sQUFDTDtBQUNBO3VDQUFBLEFBQWEsS0FBYixBQUFrQixNQUFsQixBQUF3QixNQUF4QixBQUE4QixBQUMvQjtBQUVEOztBQUNBOzJDQUFBLEFBQW1CLEtBQW5CLEFBQXdCLE1BQXhCLEFBQThCLFNBQTlCLEFBQXVDLFFBQVEsS0FBL0MsQUFBb0QsQUFFcEQ7O0FBQ0E7dUNBQUEsQUFBZSxLQUFmLEFBQW9CLE1BQXBCLEFBQTBCLE1BQTFCLEFBQWdDLEFBRWhDOztBQWhCSztrREFpQkMsS0FqQkQsQUFpQkMsQUFBSyxzRUFuQlIsYUFBQSxBQUVpQix5RUFGakIsQUFFaUIsMkYsb0IsQUFGRjs7OztBQXVCdEI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTBDQTs7Ozs7OztxeUNBUU87cU5BQ0w7QUFDQTtBQUNBO3lCQUFhLEtBQWIsQUFBa0IsQUFFbEI7O0FBTEs7dUNBTXNCLEdBQUEsQUFBRyxLQUFILEFBQVEsTUFOOUIsQUFNc0IsQUFBYyxlQU5wQyxBQU1DLHVCQU5ELEFBTTZDOztxQkFON0MsQUFRUSxTQUFULDhCQUNGO3FCQUFBLEFBQVMsS0FBVCxBQUFjLE1BQWQsQUFBb0IsZUFBZSxLQUFuQyxBQUF3QyxBQUN4QztzQkFBQSxBQUFVLEtBQVYsQUFBZSwrQkFDUjtBQVhKLGNBQUEsUUFjQTs7O2lCQUFBLEFBQUssVUFBTCxBQUFlLElBQUksS0FkbkIsQUFjQSxBQUF3QixzQ0FDM0I7cUJBQUEsQUFBUyxLQUFULEFBQWMsTUFBZCxBQUFvQixtQkFBbUIsS0FBdkMsQUFBNEMsU0FmekM7K0JBZ0JVLEFBQWlCLEtBQWpCLEFBQXNCLE1BaEJoQyxBQWdCVSxBQUE0QixLQUE1QiwwQkFoQlYsQUFnQmtELGlEQWhCbEQsQUFnQjZDLHFEQUN6QztBQWpCSixvQkFvQkw7OztBQUNNO0FBckJELHdCQXFCdUIsS0FBQSxBQUFLLFVBQUwsQUFBZSxJQUFJLEtBckIxQyxBQXFCdUIsQUFBd0IsQUFFcEQ7O0FBQ007QUF4QkQsNkJBd0IyQixJQXhCM0IsQUF3QjJCLEFBQUksQUFFcEM7O0FBQ007QUEzQkQsc0JBMkJtQixlQUFBLEFBQWUsV0FBVyxLQUFBLEFBQUssT0FBTCxBQUFZLElBM0J6RCxBQTJCNkMsQUFBZ0IsQUFFbEU7O0FBQ007QUE5QkQscUJBOEJVLENBQUEsQUFBQyxNQUFELEFBQU8sV0E5QmpCLEFBOEJVLEFBQWtCLEFBRWpDOztBQWhDSzt3Q0FpQzRCLFlBQUEsQUFBWSx5QkFBWixBQUFpQixhQWpDN0MsQUFpQzRCLEFBQTBCLGlDQWpDdEQsQUFpQ29FLEtBakNwRSxBQWlDQywwQkFqQ0QsQUFpQytELGdCQUVwRTs7QUFDQTtBQUNBO0FBQ0E7aUJBQUEsQUFBSyxpQkFBaUIsV0FBQSxBQUFXLFNBQWpDLEFBQXNCLEFBQW9CLGtDQUVuQzs7aUJBeENGLEFBd0NPLGVBeENQLG1FLG9CLEFBQWU7OztBQTJDdEI7Ozs7Ozs7Ozs7OztBQVlBOzs7Ozs7OzsrcEJBU087cUJBQUEsQUFBMkI7b0JBQzVCLEFBQU8sNkNBQVAsQUFBTyxXQUFQLEFBQWdCLFlBQVksS0FBQSxBQUFLLFdBRGhDLEFBQzJDLElBQTVDLGtFQURDLEFBQ3dEO21CQUMvQyxBQUFLLFNBQVMsS0FGdkIsQUFFUyxBQUFtQixJQUFuQiw4RkFGVCxBQUVzQyx3RSxvQixBQUZ2Qjs7O0FBS3RCOzs7Ozs7Ozs7dWtCLEFBdllnQixnQixBQUFBLHNCLEFBZ0JBLEssQUFBQSxXLEFBMkJBLFcsQUFBQSxpQixBQWdEQSxpQixBQUFBLHVCLEFBcUJBLFksQUFBQSxrQixBQXNEQSxxQixBQUFBLDJCLEFBaUJBLGlCLEFBQUEsdUIsQUFjQSxjLEFBQUEsb0IsQUF1RjJCLGMsQUFBQSxvQixBQXlGM0IsWSxBQUFBO0EsQUE0QkEsa0IsQUFBQSxnQkFwYWhCLGdDLDZDQUNBLGdDQUNBLG1ELHd3QixBQUlBLDZELEFBQ0Esd0MsQUFDQSxnQ0FFQTs7Ozs7Ozs7a2xDQVNPLFNBQUEsQUFBUyxjQUFULEFBQXVCLE1BQW9CLENBQ2hELEtBQUEsQUFBSyxXQUFXLEtBQUEsQUFBSyxZQUFyQixBQUFpQyxFQUVqQyxJQUFJLE9BQU8sS0FBUCxBQUFZLGFBQWhCLEFBQTZCLFVBQVUsS0FBQSxBQUFLLFdBQUwsQUFBZ0IsRUFFdkQsT0FBQSxBQUFPLEFBQ1IsSyxFQUVEOzs7Ozs7OzZ0Q0FRTyxTQUFBLEFBQVMsS0FBcUIsQ0FDbkMsT0FBTyxBQUFDLEtBQUQsQUFBWSxRQUFaLEFBQW9CLFFBQVEsQUFBQyxLQUFwQyxBQUFPLEFBQXdDLEFBQ2hELGdCQXlCTSxVQUFBLEFBQVMsV0FBNkIsbUNBQWpCLEFBQWlCLG9EQUFqQixBQUFpQix5Q0FDM0MsQUFBSSx3QkFDRixBQUNDO0FBQUQsT0FBQSxBQUFZLE9BQVosQUFBbUIsSUFGckIsQUFFRSxBQUF1QixvQ0FGekIsQUFLSyxBQUVOLE1BUEMsRUErQ0ssVUFBQSxBQUFTLGVBQVQsQUFBd0IsTUFBeEIsQUFBcUMsTUFBOEIsa0JBQ3hFLElBQUksRUFBRSxTQUFOLEFBQUksQUFBVyxPQUFPLE9BQUEsQUFBTyxNQUU3QixJQUFNLFNBQVMsQ0FBQyxDQUFJLEtBQUosQUFBUyxZQUFULEFBQWdCLE1BQWpCLEFBQUMsQUFBd0IsVUFBVSxDQUFJLEtBQUosQUFBUyxZQUEzRCxBQUFlLEFBQW1DLEFBQWtCLG1CQUVwRSxPQUFBLEFBQU8sUUFBUSxVQUFBLEFBQUMsR0FBTSxDQUNwQixNQUFBLEFBQUssTUFBTCxBQUFXLEtBQUssRUFBaEIsQUFBZ0IsQUFBRSxJQUFsQixBQUFzQixNQUN0QixTQUFBLEFBQVMsdUJBQTJCLEVBQXBDLEFBQW9DLEFBQUUsSUFBTSxFQUE1QyxBQUE0QyxBQUFFLEFBQy9DLElBSEQsR0FLQSxPQUFBLEFBQU8sQUFDUixLLEVBRUQ7Ozs7Ozs7dVdBUU8sU0FBQSxBQUFTLFlBQWtCLENBQ2hDLEtBQUEsQUFBSyxPQUVMLGFBQWEsS0FBYixBQUFrQixnQkFFbEIsU0FBQSxBQUFTLEtBQVQsQUFBYyxNQUFkLEFBQW9CLGlCQUFwQixBQUFxQyxBQUN0QyxRQWdETSxVQUFBLEFBQVMsbUJBQVQsQUFBNEIsTUFBNUIsQUFBMEMsUUFBMUMsQUFBMkQsTUFBb0IsQ0FDcEYsSUFBSSxzQkFBQSxBQUFVLFFBQVYsQUFBa0IsU0FBUyx1QkFBVyxPQUExQyxBQUErQixBQUFXLEFBQU8sUUFBUSxDQUN2RCxPQUFBLEFBQU8sTUFBUCxBQUFhLEtBQWIsQUFBa0IsUUFBbEIsQUFBMEIsTUFDMUIsT0FBQSxBQUFPLEFBQ1IsS0FDRCxRQUFBLEFBQU8sQUFDUixNLEVBRUQ7Ozs7Ozs7OzJwQkFTTyxTQUFBLEFBQVMsZUFBVCxBQUF3QixNQUFtQixDQUNoRCxXQUFBLEFBQVcsS0FBWCxBQUFnQixNQUFNLEtBQXRCLEFBQTJCLEFBQzVCLEssRUFFRDs7Ozs7Ozs7Oyt0QkFVTyxTQUFBLEFBQVMsWUFBVCxBQUFxQixNQUFyQixBQUFrQyxRQUF3QixDQUMvRCxJQUFJLEVBQUUsV0FBTixBQUFJLEFBQWEsU0FBUyxPQUFBLEFBQU8sUUFBUCxBQUFlLEVBRXpDLElBQUksRUFBRSxXQUFOLEFBQUksQUFBYSxPQUFPLENBQ3RCLEtBQUEsQUFBSyxRQUFMLEFBQWEsRUFDYixLQUFBLEFBQUssUUFBUSxPQUFiLEFBQW9CLEFBQ3JCLE1BRUQsTUFBQSxBQUFLLFNBQUwsQUFBYyxFQUVkLElBQUksS0FBQSxBQUFLLFNBQVMsT0FBbEIsQUFBeUIsT0FBTyxDQUM5QixLQUFBLEFBQUssVUFBTCxBQUFlLEFBQ2hCLEtBRUQsUUFBQSxBQUFPLEFBQ1IsSyxFQXdFTSwwQkFBMkIsU0FBQSxBQUFTLFlBQVQsQUFDaEMsTUFEZ0MsQUFFaEMsUUFGZ0MsQUFHaEMsZ0JBQ1UsNkZBQ0gsOE1BQUEsQUFDQyxPQURELEFBQ2UsTUFEZixBQUdMO3lDQUNNLFNBQUEsQUFBUyxLQUFULEFBQWMsTUFKZixBQUlDLEFBQW9CLGNBRTFCLEFBQ0E7aUNBQUEsQUFBbUIsS0FBbkIsQUFBd0IsTUFBeEIsQUFBOEIsVUFBOUIsQUFBd0MsZ0JBQWdCLEtBUG5ELEFBT0wsQUFBNkQsT0FFN0QsQUFDQTs2QkFBQSxBQUFlLEtBQWYsQUFBb0IsTUFBcEIsQUFBMEIsTUFBMUIsQUFBZ0MsVUFWM0IsQUFZQyxPQUFPLGdCQUFBLEFBQU0sV0FBVyxPQVp6QixBQVlRLEFBQXdCLE9BRXJDLEFBQ007QUFmRCw2QkFlZ0IsT0FBQSxBQUFPLE9BQU8sUUFmOUIsQUFlZ0IsQUFBc0IsS0FmdEMsQUFpQkw7OEJBQ0Esd0NBQUEsQUFBZSxRQUFmLEFBQ0csbUNBREgsQUFDUSxnQkFBZ0IsS0FEeEIsQUFDNkIsZ0NBbkJ4QixBQWtCTCxBQUNzQyw0Q0FDdkIsa0JBQUEsQUFBa0IsS0FBbEIsQUFBdUIsTUFBdkIsQUFBNkIsTUFwQnZDLEFBb0JVLEFBQW1DLHdDQXBCN0MsQUFvQm1FLHFDQXBCbkUsQUFvQjhELGtEQXBCOUQsQUFvQkYsb0VBQ2EsaUJBQUEsQUFBaUIsS0FBakIsQUFBc0IsTUFyQmpDLEFBcUJXLEFBQTRCLDhCQXJCdkMsQUFxQm1ELHFDQXJCbkQsQUFxQjhDLGtDQXJCOUMsQUFxQkYsMkdBckJMLGFBQUEsQUFBc0IsaUVBQXRCLEFBQXNCLGlCQXVCdkIsR0F2QkMsQ0FvRkssVUFBQSxBQUFTLFlBQWtCLENBQ2hDLEtBQUEsQUFBSyxVQUFMLEFBQWUsQUFDaEIsTUEwQk0sVUFBQSxBQUFTLGtCQUEyQixDQUN6QyxJQUFJLGdCQUFKLEFBQVUsY0FBYyxPQUFBLEFBQU8sTUFFL0IsSUFBTSxVQUFVLGdCQUFBLEFBQU0sZ0JBQXRCLEFBQXNDLEdBRXRDLEtBQUEsQUFBSyxVQUFMLEFBQWUsTUFBZixBQUFxQixTQUVyQixnQkFBQSxBQUFNLGVBQU4sQUFBcUIsS0FFckIsT0FBQSxBQUFPLEFBQ1I7OzsyRUMvYUQsZ0M7O0FBRUE7O0FBRUEsT0FBQSxBQUFPLHdCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBLEFDbUJpQixNQXJCeEIsd0MscURBQ0EsbUQsK0RBQ0Esa0MsK0NBQ0EsaUMsOENBRUEsZ0NBRUEsb0MsK2dCQVlBLDREQUVlLFNBQUEsQUFBUyxNQUFULEFBQWUsUUFBaUIsQUFDN0M7T0FBQSxBQUFLLFdBQUwsQUFBZ0IsQUFDaEI7T0FBQSxBQUFLLFNBQVMscUJBQWQsQUFBYyxBQUFXLEFBRXpCOztBQUo2QztNQUFBLEFBS3JDLFVBQVksTUFMeUIsQUFLbkIsUUFMbUIsQUFLckMsQUFDUjtPQUFBLEFBQUssVUFBVSw2QkFBbUIsS0FBbkIsQUFBd0IsUUFBdkMsQUFBZSxBQUFnQyxBQUUvQzs7QUFDQTtPQUFBLEFBQUssVUFBVSxLQUFBLEFBQUssT0FBTCxBQUFZLElBQTNCLEFBQWUsQUFBZ0IsQUFDaEM7OztBQUVELE1BQUEsQUFBTSxPQUFOLEFBQWE7QUFDYixNQUFBLEFBQU0sT0FBTixBQUFhO0FBQ2IsTUFBQSxBQUFNLFVBQU4sQUFBZ0I7QUFDaEIsTUFBQSxBQUFNLGVBQU4sQUFBcUI7QUFDckIsTUFBQSxBQUFNLGFBQU4sQUFBbUI7O0FBRW5CLE1BQUEsQUFBTSxVQUFOLEFBQWdCLGlCQUFoQixBQUFpQztBQUNqQyxNQUFBLEFBQU0sVUFBTixBQUFnQixVQUFoQixBQUEwQjtBQUMxQixNQUFBLEFBQU0sVUFBTixBQUFnQixVQUFoQixBQUEwQjtBQUMxQixNQUFBLEFBQU0sVUFBTixBQUFnQixRQUFRLFlBQXhCO0FBQ0EsTUFBQSxBQUFNLFVBQU4sQUFBZ0IsWUFBWSxnQkFBNUI7O0FBRUE7Ozs7Ozs7O0FBUUEsTUFBQSxBQUFNLFVBQU4sQUFBZ0IseUZBQU0saUJBQUEsQUFBbUI7bUNBQzNCLEFBQVksS0FBWixBQUFpQixNQURULEFBQ1IsQUFBdUIsS0FBdkIsdUZBRFEsQUFDOEI7O2dDQUVqQyxBQUFTLEtBQVQsQUFBYyxNQUhYLEFBR0gsQUFBb0IsS0FBcEIsU0FIRyxBQUdkOztrQkFFSSxLQUFOLEFBQVcsV0FBVyxLQUFBLEFBQUssWUFMWCxBQUt1QixJQUF2QzttQkFMZ0IsQUFNWixBQUFLLE9BQUwsT0FHUjs7O0FBQ0E7OEJBQUEsQUFBUyxLQUFULEFBQWMsTUFBZCxBQUFvQixpQkFBaUIsS0FBckMsQUFBMEMsZ0NBRW5DOztBQVphLGVBQUEsK0RBQXRCLGFBQUEsQUFBcUMsb0RBQXJDLEFBQXFDOzs7QUFlckM7Ozs7Ozs7QUFPQSxNQUFBLEFBQU0sVUFBTixBQUFnQiwyRkFBTyxzSkFDakI7aUJBRGlCLEFBQ1osbUNBQ1A7K0JBQUEsQUFBVSxLQUFWLEFBQWUsTUFGSSx3QkFHWjsrQkFBQSxBQUFVLEtBSEUsQUFHWixBQUFlLFlBR3hCOzs7QUFDQTs4QkFBQSxBQUFTLEtBQVQsQUFBYyxNQUFkLEFBQW9CLGNBQXBCLEFBQWtDLEFBRWxDOztBQVRxQjtzQ0FVZixLQVZlLEFBVWYsQUFBSyx1Q0FFSjs7QUFaYyxpRkFBdkIsYUFBQSxBQUFzQyxvREFBdEMsQUFBc0M7OztBQWV0Qzs7Ozs7OztBQU9BLE1BQUEsQUFBTSxVQUFOLEFBQWdCLDRGQUFRLGdKQUN0QjtBQUNBO2lCQUFBLEFBQUssVUFBTCxBQUFlLEFBRWY7O0FBQ0E7cUNBQUEsQUFBZ0IsS0FBaEIsQUFBcUIsQUFFckI7OzhCQUFBLEFBQVMsS0FBVCxBQUFjLE1BQWQsQUFBb0Isa0JBQXBCLEFBQXNDLEFBRXRDOztBQVRzQjtzQ0FVQSx1QkFBQSxBQUFjLEtBVmQsQUFVQSxBQUFtQiwyQ0FBekMsS0FWc0IsQUFVakIseUJBVmlCLEFBVTRCLDBCQUUzQzs7aUJBWmUsQUFZVix3RUFaZCxhQUFBLEFBQXVDLHFEQUF2QyxBQUF1Qzs7O0FBZXZDOzs7Ozs7O0FBT0EsTUFBQSxBQUFNLFVBQU4sQUFBZ0IsT0FBTyxTQUFBLEFBQVMsT0FBYSxBQUMzQztvQkFBQSxBQUFTLEtBQVQsQUFBYyxNQUFkLEFBQW9CLGtCQUFwQixBQUFzQyxBQUN0QztPQUFBLEFBQUssVUFBTCxBQUFlLEFBQ2hCO0FBSEQ7O0FBS0E7Ozs7Ozs7QUFPQSxNQUFBLEFBQU0sVUFBTixBQUFnQixZQUFZLFNBQUEsQUFBUyxZQUFrQixBQUNyRDtBQUNBO3FCQUFBLEFBQVUsS0FBVixBQUFlLEFBQ2hCO0FBSEQ7O0FBS0E7Ozs7Ozs7O0FBUUEsTUFBQSxBQUFNLFVBQU4sQUFBZ0IsU0FBUyxTQUFBLEFBQVMsT0FBVCxBQUFnQixTQUF3QixBQUMvRDtNQUFJLEVBQUUsV0FBVyxLQUFqQixBQUFJLEFBQWtCLFdBQVcsQUFDL0I7U0FBQSxBQUFLLGlCQUFMLEFBQXNCLEFBQ3RCO1NBQUEsQUFBSyxTQUFMLEFBQWMsV0FBVyxrQkFBekIsQUFBeUIsQUFBTSxBQUNoQztBQUVEOztTQUFPLEtBQUEsQUFBSyxTQUFaLEFBQU8sQUFBYyxBQUN0QjtBQVBEOztBQVNBOzs7Ozs7OztBQVFBLE1BQUEsQUFBTSxVQUFOLEFBQWdCLFVBQVUsU0FBQSxBQUFTLFFBQVQsQUFBaUIsTUFBcUIsQUFDOUQ7TUFBSSxDQUFDLEtBQUEsQUFBSyxTQUFWLEFBQUssQUFBYyxPQUFPLEFBQ3hCO1VBQU0sSUFBQSxBQUFJLHVCQUFKLEFBQXlCLE9BQS9CLEFBQ0Q7QUFFRDs7U0FBTyxLQUFBLEFBQUssU0FBWixBQUFPLEFBQWMsQUFDdEI7QUFORDs7QUFRQTs7Ozs7OztBQU9BLE1BQUEsQUFBTSxVQUFOLEFBQWdCLDhGQUFVO21CQUFBLEFBQ1YsQUFBSyxPQUFMLHdGQURVLEFBQ00sa0VBRGhDLGFBQUEsQUFBeUMsdURBQXpDLEFBQXlDOzs7QUFJekM7Ozs7Ozs7QUFPQSxNQUFBLEFBQU0sVUFBTixBQUFnQiw0RkFBUTs4Q0FDUixBQUF1QixLQURmLEFBQ1IsQUFBNEIsS0FBNUIsMERBRFEsQUFDMkIsdUVBRG5ELGFBQUEsQUFBdUMscURBQXZDLEFBQXVDOzs7QUFJdkM7Ozs7Ozs7O0FBUUEsTUFBQSxBQUFNLFVBQU4sQUFBZ0IsaUdBQWEsa0JBQUEsQUFBMEI7OENBQ3ZDLEFBQXVCLEtBRFYsQUFDYixBQUE0QixLQUE1Qix3QkFBMEMscUJBQUssRUFBQSxBQUFFLFFBQVAsQUFBZSxJQUQ1QyxtREFBQSxBQUNzQixxQkFEdEIsQUFDaUQsdUVBRDlFLGFBQUEsQUFBNEMsNkRBQTVDLEFBQTRDOzs7QUFJNUM7Ozs7Ozs7QUFPQSxNQUFBLEFBQU0sVUFBTixBQUFnQixRQUFRLFNBQUEsQUFBUyxRQUFpQixBQUNoRDtNQUFJLENBQUMsS0FBTCxBQUFVLGdCQUFnQixPQUFBLEFBQU8sQUFDakM7T0FBQSxBQUFLLFFBQUwsQUFBYSxNQUFNLEtBQW5CLEFBQXdCLEFBQ3hCO1NBQUEsQUFBTyxBQUNSO0FBSkQ7O0FBTUE7Ozs7Ozs7O0FBUUEsTUFBQSxBQUFNLFVBQU4sQUFBZ0IsaUdBQWEsa0JBQUEsQUFBMEIsMEtBQy9DO0FBRHFCLG1CQUFBLEFBQ2Q7MEJBQ00sQUFBRyxLQUFILEFBQVEsTUFGQSxBQUVSLEFBQWMsS0FBZCxTQUZRLEFBRXJCLGlCQUNBO0FBSHFCLHNCQUdYLEtBQUEsQUFBSyxPQUFPLHNCQUFBLEFBQWUsS0FBM0IsQUFBWSxBQUFvQixNQUFoQyxBQUFzQyx3RkFBSSxrQkFBQSxBQUFPO3NDQUMxQyxBQUFHLEtBQUgsQUFBUSxNQUFSLEFBQWMsT0FBTyxFQURjLEFBQ25DLEFBQXVCLElBQXZCLFNBRG1DLEFBQ2xELGdEQUNDO0FBRmlELGdHQUExQyxpRUFIVzs7c0JBT3JCLEFBQVEsSUFQYSxBQU9yQixBQUFZLFFBQVosaUVBUFIsYUFBQSxBQUE0Qyw2REFBNUMsQUFBNEM7OztBQVU1Qzs7Ozs7Ozs7QUFRQSxNQUFBLEFBQU0sVUFBTixBQUFnQiwwRkFBTSxrQkFBQSxBQUFtQjs4Q0FDekIsQUFBdUIsS0FEakIsQUFDTixBQUE0QixLQUE1Qix3QkFBNkMscUJBQUssRUFBQSxBQUFFLFFBQVAsQUFBZSxHQUR0RCxnQ0FBQSxBQUM2Qix1Q0FBK0IsQ0FENUQsQUFDNkQsZ0lBRG5GLGFBQUEsQUFBcUMsc0RBQXJDLEFBQXFDOzs7QUFJckM7Ozs7Ozs7O0FBUUEsTUFBQSxBQUFNLFVBQU4sQUFBZ0IsZ0dBQVcsbUJBQUEsQUFBd0I7OENBQ25DLEFBQXVCLEtBRFosQUFDWCxBQUE0QixLQUE1Qix5QkFBNkMscUJBQUssRUFBQSxBQUFFLFFBQVAsQUFBZSxJQURqRCxrQ0FBQSxBQUN3Qix5Q0FBZ0MsQ0FEeEQsQUFDeUQscUlBRHBGLGFBQUEsQUFBMEMsNERBQTFDLEFBQTBDOzs7QUFJMUM7Ozs7Ozs7O0FBUUEsTUFBQSxBQUFNLFVBQU4sQUFBZ0IsYUFBYSxTQUFBLEFBQVMsV0FBVCxBQUFvQixLQUFtQixBQUNsRTtPQUFBLEFBQUssVUFBTCxBQUFlLEFBQ2Y7T0FBQSxBQUFLLE9BQUwsQUFBWSxJQUFaLEFBQWdCLFdBQWhCLEFBQTJCLEFBQzVCO0FBSEQ7O0FBS0E7Ozs7Ozs7O0FBUUEsTUFBQSxBQUFNLFVBQU4sQUFBZ0IsV0FBVyxTQUFBLEFBQVMsU0FBVCxBQUFrQixLQUFtQixBQUM5RDtPQUFBLEFBQUssT0FBTCxBQUFZLElBQVosQUFBZ0IsU0FBaEIsQUFBeUIsQUFDMUI7QUFGRDs7QUFJQTs7Ozs7Ozs7QUFRQSxNQUFBLEFBQU0sVUFBTixBQUFnQixZQUFZLFNBQUEsQUFBUyxVQUFULEFBQW1CLEtBQW1CLEFBQ2hFO09BQUEsQUFBSyxPQUFMLEFBQVksSUFBWixBQUFnQixVQUFoQixBQUEwQixBQUMzQjtBQUZEOztBQUlBOzs7Ozs7OztBQVFBLE1BQUEsQUFBTSxVQUFOLEFBQWdCLGVBQWUsU0FBQSxBQUFTLGFBQVQsQUFBc0IsS0FBbUIsQUFDdEU7T0FBQSxBQUFLLE9BQUwsQUFBWSxJQUFaLEFBQWdCLGFBQWhCLEFBQTZCLEFBQzlCO0FBRkQ7O0FBSUE7Ozs7Ozs7O0FBUUEsTUFBQSxBQUFNLFVBQU4sQUFBZ0IsV0FBVyxTQUFBLEFBQVMsU0FBVCxBQUFrQixLQUFvQixBQUMvRDtPQUFBLEFBQUssT0FBTCxBQUFZLElBQVosQUFBZ0IsU0FBaEIsQUFBeUIsQUFDMUI7QUFGRDs7QUFJQSxNQUFBLEFBQU0sVUFBTixBQUFnQixhQUFhLFNBQUEsQUFBUyxXQUFULEFBQW9CLEtBQW1CLEFBQ2xFO09BQUEsQUFBSyxPQUFMLEFBQVksSUFBWixBQUFnQixXQUFoQixBQUEyQixBQUM1QjtBQUZEOztBQUlBOzs7Ozs7Ozs7QUFTQSxNQUFBLEFBQU0sVUFBTixBQUFnQixLQUFLLFNBQUEsQUFBUyxHQUFULEFBQVksS0FBWixBQUF5QixJQUFvQixLQUNoRTtpQkFBQSxBQUFLLE9BQUwsQUFBVyxpQkFBTSxDQUFBLEFBQUMsS0FBbEIsQUFBaUIsQUFBTSxBQUN2QjtvQkFBQSxBQUFTLEtBQVQsQUFBYyxNQUFkLEFBQW9CLGlCQUFwQixBQUFxQyxBQUN0QztBQUhEOztBQUtBOzs7Ozs7OztBQVFBLE1BQUEsQUFBTSxVQUFVLFNBQUEsQUFBUyxVQUF3RCxLQUFoRCxBQUFnRCxpRkFBVixBQUFVLEFBQy9FO01BQUksRUFBRSxzQkFBTixBQUFJLEFBQXdCLFNBQVMsQUFDbkM7VUFBTSxJQUFBLEFBQUksTUFBVixBQUFNLEFBQVUsQUFDakI7QUFFRDs7UUFBQSxBQUFNLGVBQU4sQUFBcUIsQUFDckI7UUFBQSxBQUFNLGVBQU4sQUFBcUIsQUFDdEI7QUFQRDs7QUFTQTs7Ozs7Ozs7QUFRQSxNQUFBLEFBQU0sT0FBTyxTQUFBLEFBQVMsT0FBdUQsS0FBbEQsQUFBa0QsbUZBQVYsQUFBVSxBQUMzRTtNQUFJLEVBQUUsd0JBQU4sQUFBSSxBQUEwQixTQUFTLEFBQ3JDO1VBQU0sSUFBQSxBQUFJLE1BQVYsQUFBTSxBQUFVLEFBQ2pCO0FBRUQ7O1FBQUEsQUFBTSxhQUFOLEFBQW1CLEFBQ3BCO0FBTkQ7O0FBUUE7Ozs7Ozs7O0FBUUEsTUFBQSxBQUFNLE1BQU0sU0FBQSxBQUFTLElBQVQsQUFBYSxRQUFjLEFBQ3JDO1FBQUEsQUFBTSx1QkFBZSxNQUFyQixBQUEyQixTQUEzQixBQUF1QyxBQUN4QztBQUZEOzs7O0FDM1hBLG1DOzs7O0FBSUE7QUFDQSxnQzs7QUFFQTtBQUNBO0FBQ0EsbUY7O0EsQUFFcUIsNkJBS25COzs7OzswQkFBQSxBQUFZLFFBQVosQUFBNkIsU0FBbUIsdUJBQzlDO1NBQUEsQUFBSyxTQUFMLEFBQWMsQUFDZDtTQUFBLEFBQUssVUFBVSxLQUFBLEFBQUssWUFBcEIsQUFBZSxBQUFpQixBQUNqQztBLHVFQUVXOztBLGFBQWMsQUFDeEI7VUFBSSxRQUFBLEFBQU8sZ0RBQVAsQUFBTyxjQUFYLEFBQXVCLFVBQVUsQUFDL0I7ZUFBQSxBQUFPLEFBQ1I7QUFGRCxpQkFFVyxPQUFBLEFBQU8sWUFBWCxBQUF1QixZQUFZLEFBQ3hDO2VBQU8sSUFBQSxBQUFJLFFBQVEsS0FBbkIsQUFBTyxBQUFpQixBQUN6QjtBQUZNLE9BQUEsTUFFQSxJQUFJLEtBQUEsQUFBSyxPQUFMLEFBQVksSUFBWixBQUFnQixlQUFwQixBQUFtQyxZQUFZLEFBQ3BEO2VBQU8sOEJBQW9CLEtBQTNCLEFBQU8sQUFBeUIsQUFDakM7QUFFRDs7YUFBTyxpQ0FBdUIsS0FBOUIsQUFBTyxBQUE0QixBQUNwQztBQUVEOzs7Ozs7Ozs7aURBUVE7QSxVQUE4QixBQUNwQztXQUFBLEFBQUssaUJBQUwsQUFBc0IsQUFDdEI7YUFBQSxBQUFPLEFBQ1I7QUFFRDs7Ozs7Ozs7Ozt1QixBQVFxQixBQUFLLEtBQUwsbUQsQUFBYixvQixBQUF5QixnQkFDekI7QSx3QkFBUSx1QkFBQSxBQUFRLEssQUFBUixBQUFhLG1DQUNwQjt1QkFBQSxBQUFPLEtBQVAsQUFBWSxBQUNoQjtBQURJLG9CQUNBLHVCQUFPLFNBQUEsQUFBUyxLQUFoQixBQUFPLEFBQWMsSUFEckIsQUFFSjtBQUZJLHFCQUVDLFVBQUEsQUFBQyxHQUFELEFBQUksV0FBTSxJQUFWLEFBQWMsRUFGZixBQUdKO0FBSEksdUJBR0csS0FBQSxBQUFLLFlBSFIsQUFHRyxBQUFpQixRLEFBSHBCLEFBRzRCLHlJQUdyQzs7Ozs7Ozs7OztnZkFRVztBO3dCQUNMLEFBQU8sNkNBQVAsQUFBTyxXLEFBQVMsUUFBaEIsZ0UsQUFBaUM7Ozt1QkFHUixBQUFLLFFBQUwsQUFBYSxJQUFJLEssQUFBakIsQUFBc0IsZUFBdEIsUyxBQUF2Qjs7Ozt1QixBQUlJLEFBQUssWUFBTCx5REFDUjt3QkFBQSxBQUFRLHFDQUFrQyxLQUExQyxBQUErQywwQ0FBb0MsS0FBQSxBQUFLLE9BQUwsQUFBWSxJQUEvRixBQUFtRixBQUFnQixrQ0FDNUY7QSxzQixNQUdUOzs7QUFDQTtBQUNNO0EsMEJBQVUsS0FBQSxBQUFLLFksQUFBTCxBQUFpQixBQUVqQzs7QUFDQTtzQkFBQSxBQUFNLEtBQU4sQUFBVyxBQUVYOzs7MkNBQ00sS0FBQSxBQUFLLFFBQUwsQUFBYSxJQUFJLEtBQWpCLEFBQXNCLGdCLEFBQXRCLEFBQXNDLHVDQUVyQzs7d0IsQUFBUSw2SUFHakI7Ozs7Ozs7OzBjQU1hO0EsVSxBQUFZO3VCLEFBQ0csQUFBSyxLQUFMLFMsQUFBcEIsaUJBQ0E7QSx3QkFBZ0IsS0FBQSxBQUFLLFVBQVUscUJBQUssRUFBQSxBQUFFLFFBQVAsQUFBZSxHLEFBQTlCLEFBRXRCOzs7c0JBQ0ksUSxBQUFRLGlFLEFBQVUsWUFFdEI7O0FBQ0E7cUJBQUEsQUFBSyxTQUFTLE9BQUEsQUFBTyxPQUFQLEFBQWMsSUFBSSxLQUFsQixBQUFrQixBQUFLLFFBQXJDLEFBQWMsQUFBK0IsQUFFN0M7OzswQ0FDTSxLQUFBLEFBQUssUUFBTCxBQUFhLElBQUksS0FBakIsQUFBc0IsZ0IsQUFBdEIsQUFBc0MscUNBRXJDOztBLHdLQUdUOzs7Ozs7Ozs7O2dkQVFhO0E7dUIsQUFDZSxBQUFLLEtBQUwsUyxBQUFwQixpQkFDQTtBLHdCQUFnQixLQUFBLEFBQUssVUFBVSxxQkFBSyxFQUFBLEFBQUUsUUFBUCxBQUFlLEcsQUFBOUI7O3dCLEFBRVYsQ0FBUixnRSxBQUFrQixZQUV0Qjs7dUJBQU8sS0FBUCxBQUFPLEFBQUssTyxtQkFFTjs7dUJBQUEsQUFBSyxRQUFMLEFBQWEsSUFBSSxLQUFqQixBQUFzQixnQkFBZ0IsS0FBQSxBQUFLLE9BQU8scUJBQUEsQUFBSyxFLEFBQXZELEFBQXNDLG9DQUVyQzs7QSxxS0FHVDs7Ozs7Ozs7Ozs7dUJBUXNCLEFBQUssUUFBTCxBQUFhLElBQUksSyxBQUFqQixBQUFzQixlQUF0QixTLEFBQWQsK0NBQ0M7QSwwSkFHVDs7Ozs7Ozs7O29XQU9xQjtBQUNuQjthQUFPLENBQUMsQ0FBQyxJQUFJLEtBQUwsQUFBSyxBQUFLLFlBQVgsQUFBdUIsU0FBdkIsQUFBZ0MsU0FBdkMsQUFBTyxBQUF5QyxBQUNqRDtBQUVEOzs7Ozs7Ozs7cURBUVk7QSxVQUFvQixBQUM5QjtVQUFNLHVCQUFOLEFBQU0sQUFBZSxBQUNyQjtjQUFBLEFBQVEsWUFBWSxLQUFwQixBQUFvQixBQUFLLEFBQ3pCO2NBQUEsQUFBUSxNQUFNLEtBQWQsQUFBYyxBQUFLLEFBQ25CO2FBQUEsQUFBTyxBQUNSO0FBRUQ7Ozs7Ozs7OztxREFRWTtBLFdBQWdCLGFBQzFCO1VBQU0sYUFBYSxTQUFiLEFBQWEsV0FBQSxBQUFDLFFBQUQsQUFBa0IsS0FBc0IsQUFDekQ7WUFBSSxNQUFBLEFBQUssT0FBTCxBQUFZLElBQVosQUFBZ0IsaUJBQXBCLEFBQXFDLFFBQVEsQUFDM0M7aUJBQU8sT0FBQSxBQUFPLE9BQU8sTUFBQSxBQUFNLEtBQU4sQUFBVyxZQUFoQyxBQUFPLEFBQ1I7QUFDRDtlQUFPLE9BQUEsQUFBTyxPQUFPLE1BQUEsQUFBTSxLQUFOLEFBQVcsWUFBaEMsQUFBTyxBQUNSO0FBTEQsQUFPQTs7YUFBTyxXQUFBLEFBQVcsS0FBbEIsQUFBTyxBQUFnQixBQUN4QjtBQUVEOzs7Ozs7OztnU0FRUTs7QSx3QkFBZ0IsS0FBQSxBQUFLLE9BQUwsQUFBWSxJLEFBQVosQUFBZ0I7dUIsQUFDUixBQUFLLEtBQUwsb0QsQUFBeEIsdUIsQUFBb0MsNkNBQ25DO2tCQUFFLFVBQVUsQ0FBVixBQUFXLEtBQUssUUFBUSxNLEFBQTFCLEFBQWdDLDBKQUd6Qzs7Ozs7Ozs7OzttaEJBUVk7QTt1QkFDSixBQUFLLFFBQUwsQUFBYSxNLEFBQWIsQUFBbUIsUUFBbkIsZ00sQUEvTVc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0EsQUNLTCxRLEFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QSxBQStCQSxjLEFBQUE7Ozs7Ozs7Ozs7Ozs7QSxBQWFBLFksQUFBQTs7Ozs7Ozs7Ozs7O0EsQUFZQSxhLEFBQUE7Ozs7Ozs7Ozs7OztBLEFBWUEsdUIsQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBLEFBbUJBLGlCLEFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7QSxBQWdCQSxPLEFBQUE7Ozs7Ozs7Ozs7Ozs7QSxBQWFBLE8sQUFBQTs7Ozs7Ozs7Ozs7Ozs7QSxBQWNBLE0sQUFBQSxJQWxKaEIseUMsdURBQ0EsOEIsNkNBRUEsd0MsdUksQUFFQSw4QyxBQUNBLCtCQUVBOzs7Ozs7O29iQVFPLFNBQUEsQUFBUyxNQUFULEFBQWUsTUFBYyxDQUNsQyxJQUFNLFdBQVcsT0FBQSxBQUFPLE9BQ3RCLE9BQUEsQUFBTyxlQURRLEFBQ2YsQUFBc0IsT0FDdEIsT0FBQSxBQUFPLG9CQUFQLEFBQTJCLE1BQTNCLEFBQWlDLE9BQU8sVUFBQSxBQUFDLE9BQUQsQUFBUSxNQUFTLENBQ3ZELElBQU0sd0JBQU4sQUFBTSxBQUFnQixPQUN0QixTQUFBLEFBQVMsUUFBUSxPQUFBLEFBQU8seUJBQVAsQUFBZ0MsTUFBakQsQUFBaUIsQUFBc0MsTUFDdkQsT0FBQSxBQUFPLEFBQ1IsU0FKRCxHQUZGLEFBQWlCLEFBRWYsQUFJRyxLQUdMLElBQUksQ0FBQyxPQUFBLEFBQU8sYUFBWixBQUFLLEFBQW9CLE9BQU8sQ0FDOUIsT0FBQSxBQUFPLGtCQUFQLEFBQXlCLEFBQzFCLFVBQ0QsS0FBSSxPQUFBLEFBQU8sU0FBWCxBQUFJLEFBQWdCLE9BQU8sQ0FDekIsT0FBQSxBQUFPLEtBQVAsQUFBWSxBQUNiLFVBQ0QsS0FBSSxPQUFBLEFBQU8sU0FBWCxBQUFJLEFBQWdCLE9BQU8sQ0FDekIsT0FBQSxBQUFPLE9BQVAsQUFBYyxBQUNmLFVBRUQsUUFBQSxBQUFPLEFBQ1IsUyxFQUVEOzs7Ozs7OzgzQkFRTyxTQUFBLEFBQVMsWUFBVCxBQUFxQixNQUFyQixBQUFxQyxNQUF1QixDQUNqRSxPQUFPLE9BQUEsQUFBTyxVQUFQLEFBQWlCLGVBQWpCLEFBQWdDLEtBQWhDLEFBQXFDLE1BQTVDLEFBQU8sQUFBMkMsQUFDbkQsTSxFQUVEOzs7Ozs7Ozs2OUJBU08sU0FBQSxBQUFTLFVBQVQsQUFBbUIsVUFBbkIsQUFBa0MsUUFBeUIsQ0FDaEUsT0FBTyxvQkFBQSxBQUFvQixVQUFVLFVBQXJDLEFBQStDLEFBQ2hELFMsRUFFRDs7Ozs7Oztna0NBUU8sU0FBQSxBQUFTLFdBQVQsQUFBb0IsTUFBeUIsQ0FDbEQsT0FBTyxnQkFBUCxBQUF1QixBQUN4QixTLEVBRUQ7Ozs7Ozs7Z29DQVFPLFNBQUEsQUFBUyxxQkFBVCxBQUE4QixNQUFzQixDQUN6RCxJQUFNLGFBQWEsTUFBQSxBQUFNLFFBQU4sQUFBYyxRQUFkLEFBQXNCLE9BQU8sQ0FBQSxBQUFDLFdBQWpELEFBQWdELEFBQVksVUFDNUQsSUFBTSxVQUFOLEFBQWdCLEdBRWhCLFdBQUEsQUFBVyxRQUFRLFVBQUEsQUFBQyxHQUFNLENBQ3hCLFFBQUEsQUFBUSxLQUFLLFlBQUEsQUFBWSxNQUFaLEFBQWtCLE9BQWxCLEFBQXlCLFNBQVMsS0FBQSxBQUFLLE9BQXBELEFBQTJELEFBQzVELE9BRkQsR0FJQSxPQUFPLEVBQUUsUUFBQSxBQUFRLFFBQVIsQUFBZ0IsU0FBUyxDQUFsQyxBQUFPLEFBQTRCLEFBQ3BDLEcsRUFFRDs7Ozs7OzsyNENBUU8sU0FBQSxBQUFTLGVBQVQsQUFBd0IsTUFBc0IsQ0FDbkQsSUFBSSxDQUFDLHFCQUFBLEFBQXFCLEtBQUssQ0FBMUIsQUFBMEIsQUFBQyxXQUFoQyxBQUFLLEFBQXNDLE9BQU8sQ0FDaEQsT0FBQSxBQUFPLEFBQ1IsTUFDRCxRQUFPLEtBQUEsQUFBSyxRQUFaLEFBQW9CLEFBQ3JCLEssRUFFRDs7Ozs7Ozs7eWdEQVNPLFNBQUEsQUFBUyxLQUFULEFBQWMsR0FBZCxBQUF3QixHQUFlLENBQzVDLE9BQU8sRUFBQSxBQUFFLFlBQVksRUFBckIsQUFBdUIsQUFDeEIsVSxFQUVEOzs7Ozs7Oztva0RBU08sU0FBQSxBQUFTLEtBQVQsQUFBYyxHQUFkLEFBQXdCLEdBQWUsQ0FDNUMsT0FBTyxFQUFBLEFBQUUsWUFBWSxFQUFyQixBQUF1QixBQUN4QixVLEVBRUQ7Ozs7Ozs7OzsrbkRBVU8sU0FBQSxBQUFTLElBQVQsQUFBYSxVQUFhLEFBQXlCLDJFQUFWLEFBQVUsR0FDeEQsSUFBSSxTQUFKLEFBQWEsTUFBTSxDQUNqQixhQUFBLEFBQWEsV0FBYixBQUF3QixTQUN4QixBQUNELE9BSnVELEVBTXhELEFBQ0E7d0VBQUEsQUFBYSxRQUFiLEFBQXFCLFNBUG1DLEFBT3hELEFBQThCLFlBUDBCLENBU3hELEFBQ0E7K0RBQU0sU0FBUyxpQ0FBQSxBQUFnQixPQVZ5QixBQVV4RCxRQUVBLEFBQ0E7a0VBQU8scUJBQUEsQUFBSSxtQkFBWCxBQUFPLEFBQW1CLEFBQzNCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicmVnZW5lcmF0b3ItcnVudGltZVwiKTtcbiIsIi8qKlxuICogR2xvYmFsIE5hbWVzXG4gKi9cblxudmFyIGdsb2JhbHMgPSAvXFxiKEFycmF5fERhdGV8T2JqZWN0fE1hdGh8SlNPTilcXGIvZztcblxuLyoqXG4gKiBSZXR1cm4gaW1tZWRpYXRlIGlkZW50aWZpZXJzIHBhcnNlZCBmcm9tIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSBtYXAgZnVuY3Rpb24gb3IgcHJlZml4XG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdHIsIGZuKXtcbiAgdmFyIHAgPSB1bmlxdWUocHJvcHMoc3RyKSk7XG4gIGlmIChmbiAmJiAnc3RyaW5nJyA9PSB0eXBlb2YgZm4pIGZuID0gcHJlZml4ZWQoZm4pO1xuICBpZiAoZm4pIHJldHVybiBtYXAoc3RyLCBwLCBmbik7XG4gIHJldHVybiBwO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gaW1tZWRpYXRlIGlkZW50aWZpZXJzIGluIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcHJvcHMoc3RyKSB7XG4gIHJldHVybiBzdHJcbiAgICAucmVwbGFjZSgvXFwuXFx3K3xcXHcrICpcXCh8XCJbXlwiXSpcInwnW14nXSonfFxcLyhbXi9dKylcXC8vZywgJycpXG4gICAgLnJlcGxhY2UoZ2xvYmFscywgJycpXG4gICAgLm1hdGNoKC9bYS16QS1aX11cXHcqL2cpXG4gICAgfHwgW107XG59XG5cbi8qKlxuICogUmV0dXJuIGBzdHJgIHdpdGggYHByb3BzYCBtYXBwZWQgd2l0aCBgZm5gLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7QXJyYXl9IHByb3BzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbWFwKHN0ciwgcHJvcHMsIGZuKSB7XG4gIHZhciByZSA9IC9cXC5cXHcrfFxcdysgKlxcKHxcIlteXCJdKlwifCdbXiddKid8XFwvKFteL10rKVxcL3xbYS16QS1aX11cXHcqL2c7XG4gIHJldHVybiBzdHIucmVwbGFjZShyZSwgZnVuY3Rpb24oXyl7XG4gICAgaWYgKCcoJyA9PSBfW18ubGVuZ3RoIC0gMV0pIHJldHVybiBmbihfKTtcbiAgICBpZiAoIX5wcm9wcy5pbmRleE9mKF8pKSByZXR1cm4gXztcbiAgICByZXR1cm4gZm4oXyk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFJldHVybiB1bmlxdWUgYXJyYXkuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHVuaXF1ZShhcnIpIHtcbiAgdmFyIHJldCA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKH5yZXQuaW5kZXhPZihhcnJbaV0pKSBjb250aW51ZTtcbiAgICByZXQucHVzaChhcnJbaV0pO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn1cblxuLyoqXG4gKiBNYXAgd2l0aCBwcmVmaXggYHN0cmAuXG4gKi9cblxuZnVuY3Rpb24gcHJlZml4ZWQoc3RyKSB7XG4gIHJldHVybiBmdW5jdGlvbihfKXtcbiAgICByZXR1cm4gc3RyICsgXztcbiAgfTtcbn1cbiIsIi8qKlxuICogVGhpcyBpcyB0aGUgd2ViIGJyb3dzZXIgaW1wbGVtZW50YXRpb24gb2YgYGRlYnVnKClgLlxuICpcbiAqIEV4cG9zZSBgZGVidWcoKWAgYXMgdGhlIG1vZHVsZS5cbiAqL1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2RlYnVnJyk7XG5leHBvcnRzLmxvZyA9IGxvZztcbmV4cG9ydHMuZm9ybWF0QXJncyA9IGZvcm1hdEFyZ3M7XG5leHBvcnRzLnNhdmUgPSBzYXZlO1xuZXhwb3J0cy5sb2FkID0gbG9hZDtcbmV4cG9ydHMudXNlQ29sb3JzID0gdXNlQ29sb3JzO1xuZXhwb3J0cy5zdG9yYWdlID0gJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGNocm9tZVxuICAgICAgICAgICAgICAgJiYgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGNocm9tZS5zdG9yYWdlXG4gICAgICAgICAgICAgICAgICA/IGNocm9tZS5zdG9yYWdlLmxvY2FsXG4gICAgICAgICAgICAgICAgICA6IGxvY2Fsc3RvcmFnZSgpO1xuXG4vKipcbiAqIENvbG9ycy5cbiAqL1xuXG5leHBvcnRzLmNvbG9ycyA9IFtcbiAgJyMwMDAwQ0MnLCAnIzAwMDBGRicsICcjMDAzM0NDJywgJyMwMDMzRkYnLCAnIzAwNjZDQycsICcjMDA2NkZGJywgJyMwMDk5Q0MnLFxuICAnIzAwOTlGRicsICcjMDBDQzAwJywgJyMwMENDMzMnLCAnIzAwQ0M2NicsICcjMDBDQzk5JywgJyMwMENDQ0MnLCAnIzAwQ0NGRicsXG4gICcjMzMwMENDJywgJyMzMzAwRkYnLCAnIzMzMzNDQycsICcjMzMzM0ZGJywgJyMzMzY2Q0MnLCAnIzMzNjZGRicsICcjMzM5OUNDJyxcbiAgJyMzMzk5RkYnLCAnIzMzQ0MwMCcsICcjMzNDQzMzJywgJyMzM0NDNjYnLCAnIzMzQ0M5OScsICcjMzNDQ0NDJywgJyMzM0NDRkYnLFxuICAnIzY2MDBDQycsICcjNjYwMEZGJywgJyM2NjMzQ0MnLCAnIzY2MzNGRicsICcjNjZDQzAwJywgJyM2NkNDMzMnLCAnIzk5MDBDQycsXG4gICcjOTkwMEZGJywgJyM5OTMzQ0MnLCAnIzk5MzNGRicsICcjOTlDQzAwJywgJyM5OUNDMzMnLCAnI0NDMDAwMCcsICcjQ0MwMDMzJyxcbiAgJyNDQzAwNjYnLCAnI0NDMDA5OScsICcjQ0MwMENDJywgJyNDQzAwRkYnLCAnI0NDMzMwMCcsICcjQ0MzMzMzJywgJyNDQzMzNjYnLFxuICAnI0NDMzM5OScsICcjQ0MzM0NDJywgJyNDQzMzRkYnLCAnI0NDNjYwMCcsICcjQ0M2NjMzJywgJyNDQzk5MDAnLCAnI0NDOTkzMycsXG4gICcjQ0NDQzAwJywgJyNDQ0NDMzMnLCAnI0ZGMDAwMCcsICcjRkYwMDMzJywgJyNGRjAwNjYnLCAnI0ZGMDA5OScsICcjRkYwMENDJyxcbiAgJyNGRjAwRkYnLCAnI0ZGMzMwMCcsICcjRkYzMzMzJywgJyNGRjMzNjYnLCAnI0ZGMzM5OScsICcjRkYzM0NDJywgJyNGRjMzRkYnLFxuICAnI0ZGNjYwMCcsICcjRkY2NjMzJywgJyNGRjk5MDAnLCAnI0ZGOTkzMycsICcjRkZDQzAwJywgJyNGRkNDMzMnXG5dO1xuXG4vKipcbiAqIEN1cnJlbnRseSBvbmx5IFdlYktpdC1iYXNlZCBXZWIgSW5zcGVjdG9ycywgRmlyZWZveCA+PSB2MzEsXG4gKiBhbmQgdGhlIEZpcmVidWcgZXh0ZW5zaW9uIChhbnkgRmlyZWZveCB2ZXJzaW9uKSBhcmUga25vd25cbiAqIHRvIHN1cHBvcnQgXCIlY1wiIENTUyBjdXN0b21pemF0aW9ucy5cbiAqXG4gKiBUT0RPOiBhZGQgYSBgbG9jYWxTdG9yYWdlYCB2YXJpYWJsZSB0byBleHBsaWNpdGx5IGVuYWJsZS9kaXNhYmxlIGNvbG9yc1xuICovXG5cbmZ1bmN0aW9uIHVzZUNvbG9ycygpIHtcbiAgLy8gTkI6IEluIGFuIEVsZWN0cm9uIHByZWxvYWQgc2NyaXB0LCBkb2N1bWVudCB3aWxsIGJlIGRlZmluZWQgYnV0IG5vdCBmdWxseVxuICAvLyBpbml0aWFsaXplZC4gU2luY2Ugd2Uga25vdyB3ZSdyZSBpbiBDaHJvbWUsIHdlJ2xsIGp1c3QgZGV0ZWN0IHRoaXMgY2FzZVxuICAvLyBleHBsaWNpdGx5XG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cucHJvY2VzcyAmJiB3aW5kb3cucHJvY2Vzcy50eXBlID09PSAncmVuZGVyZXInKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBJbnRlcm5ldCBFeHBsb3JlciBhbmQgRWRnZSBkbyBub3Qgc3VwcG9ydCBjb2xvcnMuXG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IudXNlckFnZW50ICYmIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5tYXRjaCgvKGVkZ2V8dHJpZGVudClcXC8oXFxkKykvKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIGlzIHdlYmtpdD8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTY0NTk2MDYvMzc2NzczXG4gIC8vIGRvY3VtZW50IGlzIHVuZGVmaW5lZCBpbiByZWFjdC1uYXRpdmU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWFjdC1uYXRpdmUvcHVsbC8xNjMyXG4gIHJldHVybiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5XZWJraXRBcHBlYXJhbmNlKSB8fFxuICAgIC8vIGlzIGZpcmVidWc/IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzM5ODEyMC8zNzY3NzNcbiAgICAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmNvbnNvbGUgJiYgKHdpbmRvdy5jb25zb2xlLmZpcmVidWcgfHwgKHdpbmRvdy5jb25zb2xlLmV4Y2VwdGlvbiAmJiB3aW5kb3cuY29uc29sZS50YWJsZSkpKSB8fFxuICAgIC8vIGlzIGZpcmVmb3ggPj0gdjMxP1xuICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvVG9vbHMvV2ViX0NvbnNvbGUjU3R5bGluZ19tZXNzYWdlc1xuICAgICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IudXNlckFnZW50ICYmIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5tYXRjaCgvZmlyZWZveFxcLyhcXGQrKS8pICYmIHBhcnNlSW50KFJlZ0V4cC4kMSwgMTApID49IDMxKSB8fFxuICAgIC8vIGRvdWJsZSBjaGVjayB3ZWJraXQgaW4gdXNlckFnZW50IGp1c3QgaW4gY2FzZSB3ZSBhcmUgaW4gYSB3b3JrZXJcbiAgICAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudCAmJiBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkubWF0Y2goL2FwcGxld2Via2l0XFwvKFxcZCspLykpO1xufVxuXG4vKipcbiAqIE1hcCAlaiB0byBgSlNPTi5zdHJpbmdpZnkoKWAsIHNpbmNlIG5vIFdlYiBJbnNwZWN0b3JzIGRvIHRoYXQgYnkgZGVmYXVsdC5cbiAqL1xuXG5leHBvcnRzLmZvcm1hdHRlcnMuaiA9IGZ1bmN0aW9uKHYpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodik7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiAnW1VuZXhwZWN0ZWRKU09OUGFyc2VFcnJvcl06ICcgKyBlcnIubWVzc2FnZTtcbiAgfVxufTtcblxuXG4vKipcbiAqIENvbG9yaXplIGxvZyBhcmd1bWVudHMgaWYgZW5hYmxlZC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGZvcm1hdEFyZ3MoYXJncykge1xuICB2YXIgdXNlQ29sb3JzID0gdGhpcy51c2VDb2xvcnM7XG5cbiAgYXJnc1swXSA9ICh1c2VDb2xvcnMgPyAnJWMnIDogJycpXG4gICAgKyB0aGlzLm5hbWVzcGFjZVxuICAgICsgKHVzZUNvbG9ycyA/ICcgJWMnIDogJyAnKVxuICAgICsgYXJnc1swXVxuICAgICsgKHVzZUNvbG9ycyA/ICclYyAnIDogJyAnKVxuICAgICsgJysnICsgZXhwb3J0cy5odW1hbml6ZSh0aGlzLmRpZmYpO1xuXG4gIGlmICghdXNlQ29sb3JzKSByZXR1cm47XG5cbiAgdmFyIGMgPSAnY29sb3I6ICcgKyB0aGlzLmNvbG9yO1xuICBhcmdzLnNwbGljZSgxLCAwLCBjLCAnY29sb3I6IGluaGVyaXQnKVxuXG4gIC8vIHRoZSBmaW5hbCBcIiVjXCIgaXMgc29tZXdoYXQgdHJpY2t5LCBiZWNhdXNlIHRoZXJlIGNvdWxkIGJlIG90aGVyXG4gIC8vIGFyZ3VtZW50cyBwYXNzZWQgZWl0aGVyIGJlZm9yZSBvciBhZnRlciB0aGUgJWMsIHNvIHdlIG5lZWQgdG9cbiAgLy8gZmlndXJlIG91dCB0aGUgY29ycmVjdCBpbmRleCB0byBpbnNlcnQgdGhlIENTUyBpbnRvXG4gIHZhciBpbmRleCA9IDA7XG4gIHZhciBsYXN0QyA9IDA7XG4gIGFyZ3NbMF0ucmVwbGFjZSgvJVthLXpBLVolXS9nLCBmdW5jdGlvbihtYXRjaCkge1xuICAgIGlmICgnJSUnID09PSBtYXRjaCkgcmV0dXJuO1xuICAgIGluZGV4Kys7XG4gICAgaWYgKCclYycgPT09IG1hdGNoKSB7XG4gICAgICAvLyB3ZSBvbmx5IGFyZSBpbnRlcmVzdGVkIGluIHRoZSAqbGFzdCogJWNcbiAgICAgIC8vICh0aGUgdXNlciBtYXkgaGF2ZSBwcm92aWRlZCB0aGVpciBvd24pXG4gICAgICBsYXN0QyA9IGluZGV4O1xuICAgIH1cbiAgfSk7XG5cbiAgYXJncy5zcGxpY2UobGFzdEMsIDAsIGMpO1xufVxuXG4vKipcbiAqIEludm9rZXMgYGNvbnNvbGUubG9nKClgIHdoZW4gYXZhaWxhYmxlLlxuICogTm8tb3Agd2hlbiBgY29uc29sZS5sb2dgIGlzIG5vdCBhIFwiZnVuY3Rpb25cIi5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGxvZygpIHtcbiAgLy8gdGhpcyBoYWNrZXJ5IGlzIHJlcXVpcmVkIGZvciBJRTgvOSwgd2hlcmVcbiAgLy8gdGhlIGBjb25zb2xlLmxvZ2AgZnVuY3Rpb24gZG9lc24ndCBoYXZlICdhcHBseSdcbiAgcmV0dXJuICdvYmplY3QnID09PSB0eXBlb2YgY29uc29sZVxuICAgICYmIGNvbnNvbGUubG9nXG4gICAgJiYgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5LmNhbGwoY29uc29sZS5sb2csIGNvbnNvbGUsIGFyZ3VtZW50cyk7XG59XG5cbi8qKlxuICogU2F2ZSBgbmFtZXNwYWNlc2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNhdmUobmFtZXNwYWNlcykge1xuICB0cnkge1xuICAgIGlmIChudWxsID09IG5hbWVzcGFjZXMpIHtcbiAgICAgIGV4cG9ydHMuc3RvcmFnZS5yZW1vdmVJdGVtKCdkZWJ1ZycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBleHBvcnRzLnN0b3JhZ2UuZGVidWcgPSBuYW1lc3BhY2VzO1xuICAgIH1cbiAgfSBjYXRjaChlKSB7fVxufVxuXG4vKipcbiAqIExvYWQgYG5hbWVzcGFjZXNgLlxuICpcbiAqIEByZXR1cm4ge1N0cmluZ30gcmV0dXJucyB0aGUgcHJldmlvdXNseSBwZXJzaXN0ZWQgZGVidWcgbW9kZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGxvYWQoKSB7XG4gIHZhciByO1xuICB0cnkge1xuICAgIHIgPSBleHBvcnRzLnN0b3JhZ2UuZGVidWc7XG4gIH0gY2F0Y2goZSkge31cblxuICAvLyBJZiBkZWJ1ZyBpc24ndCBzZXQgaW4gTFMsIGFuZCB3ZSdyZSBpbiBFbGVjdHJvbiwgdHJ5IHRvIGxvYWQgJERFQlVHXG4gIGlmICghciAmJiB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgJ2VudicgaW4gcHJvY2Vzcykge1xuICAgIHIgPSBwcm9jZXNzLmVudi5ERUJVRztcbiAgfVxuXG4gIHJldHVybiByO1xufVxuXG4vKipcbiAqIEVuYWJsZSBuYW1lc3BhY2VzIGxpc3RlZCBpbiBgbG9jYWxTdG9yYWdlLmRlYnVnYCBpbml0aWFsbHkuXG4gKi9cblxuZXhwb3J0cy5lbmFibGUobG9hZCgpKTtcblxuLyoqXG4gKiBMb2NhbHN0b3JhZ2UgYXR0ZW1wdHMgdG8gcmV0dXJuIHRoZSBsb2NhbHN0b3JhZ2UuXG4gKlxuICogVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSBzYWZhcmkgdGhyb3dzXG4gKiB3aGVuIGEgdXNlciBkaXNhYmxlcyBjb29raWVzL2xvY2Fsc3RvcmFnZVxuICogYW5kIHlvdSBhdHRlbXB0IHRvIGFjY2VzcyBpdC5cbiAqXG4gKiBAcmV0dXJuIHtMb2NhbFN0b3JhZ2V9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBsb2NhbHN0b3JhZ2UoKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHdpbmRvdy5sb2NhbFN0b3JhZ2U7XG4gIH0gY2F0Y2ggKGUpIHt9XG59XG4iLCJcbi8qKlxuICogVGhpcyBpcyB0aGUgY29tbW9uIGxvZ2ljIGZvciBib3RoIHRoZSBOb2RlLmpzIGFuZCB3ZWIgYnJvd3NlclxuICogaW1wbGVtZW50YXRpb25zIG9mIGBkZWJ1ZygpYC5cbiAqXG4gKiBFeHBvc2UgYGRlYnVnKClgIGFzIHRoZSBtb2R1bGUuXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gY3JlYXRlRGVidWcuZGVidWcgPSBjcmVhdGVEZWJ1Z1snZGVmYXVsdCddID0gY3JlYXRlRGVidWc7XG5leHBvcnRzLmNvZXJjZSA9IGNvZXJjZTtcbmV4cG9ydHMuZGlzYWJsZSA9IGRpc2FibGU7XG5leHBvcnRzLmVuYWJsZSA9IGVuYWJsZTtcbmV4cG9ydHMuZW5hYmxlZCA9IGVuYWJsZWQ7XG5leHBvcnRzLmh1bWFuaXplID0gcmVxdWlyZSgnbXMnKTtcblxuLyoqXG4gKiBBY3RpdmUgYGRlYnVnYCBpbnN0YW5jZXMuXG4gKi9cbmV4cG9ydHMuaW5zdGFuY2VzID0gW107XG5cbi8qKlxuICogVGhlIGN1cnJlbnRseSBhY3RpdmUgZGVidWcgbW9kZSBuYW1lcywgYW5kIG5hbWVzIHRvIHNraXAuXG4gKi9cblxuZXhwb3J0cy5uYW1lcyA9IFtdO1xuZXhwb3J0cy5za2lwcyA9IFtdO1xuXG4vKipcbiAqIE1hcCBvZiBzcGVjaWFsIFwiJW5cIiBoYW5kbGluZyBmdW5jdGlvbnMsIGZvciB0aGUgZGVidWcgXCJmb3JtYXRcIiBhcmd1bWVudC5cbiAqXG4gKiBWYWxpZCBrZXkgbmFtZXMgYXJlIGEgc2luZ2xlLCBsb3dlciBvciB1cHBlci1jYXNlIGxldHRlciwgaS5lLiBcIm5cIiBhbmQgXCJOXCIuXG4gKi9cblxuZXhwb3J0cy5mb3JtYXR0ZXJzID0ge307XG5cbi8qKlxuICogU2VsZWN0IGEgY29sb3IuXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzZWxlY3RDb2xvcihuYW1lc3BhY2UpIHtcbiAgdmFyIGhhc2ggPSAwLCBpO1xuXG4gIGZvciAoaSBpbiBuYW1lc3BhY2UpIHtcbiAgICBoYXNoICA9ICgoaGFzaCA8PCA1KSAtIGhhc2gpICsgbmFtZXNwYWNlLmNoYXJDb2RlQXQoaSk7XG4gICAgaGFzaCB8PSAwOyAvLyBDb252ZXJ0IHRvIDMyYml0IGludGVnZXJcbiAgfVxuXG4gIHJldHVybiBleHBvcnRzLmNvbG9yc1tNYXRoLmFicyhoYXNoKSAlIGV4cG9ydHMuY29sb3JzLmxlbmd0aF07XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgZGVidWdnZXIgd2l0aCB0aGUgZ2l2ZW4gYG5hbWVzcGFjZWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGNyZWF0ZURlYnVnKG5hbWVzcGFjZSkge1xuXG4gIHZhciBwcmV2VGltZTtcblxuICBmdW5jdGlvbiBkZWJ1ZygpIHtcbiAgICAvLyBkaXNhYmxlZD9cbiAgICBpZiAoIWRlYnVnLmVuYWJsZWQpIHJldHVybjtcblxuICAgIHZhciBzZWxmID0gZGVidWc7XG5cbiAgICAvLyBzZXQgYGRpZmZgIHRpbWVzdGFtcFxuICAgIHZhciBjdXJyID0gK25ldyBEYXRlKCk7XG4gICAgdmFyIG1zID0gY3VyciAtIChwcmV2VGltZSB8fCBjdXJyKTtcbiAgICBzZWxmLmRpZmYgPSBtcztcbiAgICBzZWxmLnByZXYgPSBwcmV2VGltZTtcbiAgICBzZWxmLmN1cnIgPSBjdXJyO1xuICAgIHByZXZUaW1lID0gY3VycjtcblxuICAgIC8vIHR1cm4gdGhlIGBhcmd1bWVudHNgIGludG8gYSBwcm9wZXIgQXJyYXlcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuXG4gICAgYXJnc1swXSA9IGV4cG9ydHMuY29lcmNlKGFyZ3NbMF0pO1xuXG4gICAgaWYgKCdzdHJpbmcnICE9PSB0eXBlb2YgYXJnc1swXSkge1xuICAgICAgLy8gYW55dGhpbmcgZWxzZSBsZXQncyBpbnNwZWN0IHdpdGggJU9cbiAgICAgIGFyZ3MudW5zaGlmdCgnJU8nKTtcbiAgICB9XG5cbiAgICAvLyBhcHBseSBhbnkgYGZvcm1hdHRlcnNgIHRyYW5zZm9ybWF0aW9uc1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgYXJnc1swXSA9IGFyZ3NbMF0ucmVwbGFjZSgvJShbYS16QS1aJV0pL2csIGZ1bmN0aW9uKG1hdGNoLCBmb3JtYXQpIHtcbiAgICAgIC8vIGlmIHdlIGVuY291bnRlciBhbiBlc2NhcGVkICUgdGhlbiBkb24ndCBpbmNyZWFzZSB0aGUgYXJyYXkgaW5kZXhcbiAgICAgIGlmIChtYXRjaCA9PT0gJyUlJykgcmV0dXJuIG1hdGNoO1xuICAgICAgaW5kZXgrKztcbiAgICAgIHZhciBmb3JtYXR0ZXIgPSBleHBvcnRzLmZvcm1hdHRlcnNbZm9ybWF0XTtcbiAgICAgIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgZm9ybWF0dGVyKSB7XG4gICAgICAgIHZhciB2YWwgPSBhcmdzW2luZGV4XTtcbiAgICAgICAgbWF0Y2ggPSBmb3JtYXR0ZXIuY2FsbChzZWxmLCB2YWwpO1xuXG4gICAgICAgIC8vIG5vdyB3ZSBuZWVkIHRvIHJlbW92ZSBgYXJnc1tpbmRleF1gIHNpbmNlIGl0J3MgaW5saW5lZCBpbiB0aGUgYGZvcm1hdGBcbiAgICAgICAgYXJncy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICBpbmRleC0tO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH0pO1xuXG4gICAgLy8gYXBwbHkgZW52LXNwZWNpZmljIGZvcm1hdHRpbmcgKGNvbG9ycywgZXRjLilcbiAgICBleHBvcnRzLmZvcm1hdEFyZ3MuY2FsbChzZWxmLCBhcmdzKTtcblxuICAgIHZhciBsb2dGbiA9IGRlYnVnLmxvZyB8fCBleHBvcnRzLmxvZyB8fCBjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpO1xuICAgIGxvZ0ZuLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICB9XG5cbiAgZGVidWcubmFtZXNwYWNlID0gbmFtZXNwYWNlO1xuICBkZWJ1Zy5lbmFibGVkID0gZXhwb3J0cy5lbmFibGVkKG5hbWVzcGFjZSk7XG4gIGRlYnVnLnVzZUNvbG9ycyA9IGV4cG9ydHMudXNlQ29sb3JzKCk7XG4gIGRlYnVnLmNvbG9yID0gc2VsZWN0Q29sb3IobmFtZXNwYWNlKTtcbiAgZGVidWcuZGVzdHJveSA9IGRlc3Ryb3k7XG5cbiAgLy8gZW52LXNwZWNpZmljIGluaXRpYWxpemF0aW9uIGxvZ2ljIGZvciBkZWJ1ZyBpbnN0YW5jZXNcbiAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBleHBvcnRzLmluaXQpIHtcbiAgICBleHBvcnRzLmluaXQoZGVidWcpO1xuICB9XG5cbiAgZXhwb3J0cy5pbnN0YW5jZXMucHVzaChkZWJ1Zyk7XG5cbiAgcmV0dXJuIGRlYnVnO1xufVxuXG5mdW5jdGlvbiBkZXN0cm95ICgpIHtcbiAgdmFyIGluZGV4ID0gZXhwb3J0cy5pbnN0YW5jZXMuaW5kZXhPZih0aGlzKTtcbiAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgIGV4cG9ydHMuaW5zdGFuY2VzLnNwbGljZShpbmRleCwgMSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qKlxuICogRW5hYmxlcyBhIGRlYnVnIG1vZGUgYnkgbmFtZXNwYWNlcy4gVGhpcyBjYW4gaW5jbHVkZSBtb2Rlc1xuICogc2VwYXJhdGVkIGJ5IGEgY29sb24gYW5kIHdpbGRjYXJkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBlbmFibGUobmFtZXNwYWNlcykge1xuICBleHBvcnRzLnNhdmUobmFtZXNwYWNlcyk7XG5cbiAgZXhwb3J0cy5uYW1lcyA9IFtdO1xuICBleHBvcnRzLnNraXBzID0gW107XG5cbiAgdmFyIGk7XG4gIHZhciBzcGxpdCA9ICh0eXBlb2YgbmFtZXNwYWNlcyA9PT0gJ3N0cmluZycgPyBuYW1lc3BhY2VzIDogJycpLnNwbGl0KC9bXFxzLF0rLyk7XG4gIHZhciBsZW4gPSBzcGxpdC5sZW5ndGg7XG5cbiAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKCFzcGxpdFtpXSkgY29udGludWU7IC8vIGlnbm9yZSBlbXB0eSBzdHJpbmdzXG4gICAgbmFtZXNwYWNlcyA9IHNwbGl0W2ldLnJlcGxhY2UoL1xcKi9nLCAnLio/Jyk7XG4gICAgaWYgKG5hbWVzcGFjZXNbMF0gPT09ICctJykge1xuICAgICAgZXhwb3J0cy5za2lwcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZXNwYWNlcy5zdWJzdHIoMSkgKyAnJCcpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXhwb3J0cy5uYW1lcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZXNwYWNlcyArICckJykpO1xuICAgIH1cbiAgfVxuXG4gIGZvciAoaSA9IDA7IGkgPCBleHBvcnRzLmluc3RhbmNlcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpbnN0YW5jZSA9IGV4cG9ydHMuaW5zdGFuY2VzW2ldO1xuICAgIGluc3RhbmNlLmVuYWJsZWQgPSBleHBvcnRzLmVuYWJsZWQoaW5zdGFuY2UubmFtZXNwYWNlKTtcbiAgfVxufVxuXG4vKipcbiAqIERpc2FibGUgZGVidWcgb3V0cHV0LlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZGlzYWJsZSgpIHtcbiAgZXhwb3J0cy5lbmFibGUoJycpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gbW9kZSBuYW1lIGlzIGVuYWJsZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZW5hYmxlZChuYW1lKSB7XG4gIGlmIChuYW1lW25hbWUubGVuZ3RoIC0gMV0gPT09ICcqJykge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHZhciBpLCBsZW47XG4gIGZvciAoaSA9IDAsIGxlbiA9IGV4cG9ydHMuc2tpcHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoZXhwb3J0cy5za2lwc1tpXS50ZXN0KG5hbWUpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIGZvciAoaSA9IDAsIGxlbiA9IGV4cG9ydHMubmFtZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoZXhwb3J0cy5uYW1lc1tpXS50ZXN0KG5hbWUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIENvZXJjZSBgdmFsYC5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge01peGVkfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gY29lcmNlKHZhbCkge1xuICBpZiAodmFsIGluc3RhbmNlb2YgRXJyb3IpIHJldHVybiB2YWwuc3RhY2sgfHwgdmFsLm1lc3NhZ2U7XG4gIHJldHVybiB2YWw7XG59XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgdG9GdW5jdGlvbiA9IHJlcXVpcmUoJ3RvLWZ1bmN0aW9uJyk7XG5cbi8qKlxuICogR3JvdXAgYGFycmAgd2l0aCBjYWxsYmFjayBgZm4odmFsLCBpKWAuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufFN0cmluZ30gZm4gb3IgcHJvcFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXJyLCBmbil7XG4gIHZhciByZXQgPSB7fTtcbiAgdmFyIHByb3A7XG4gIGZuID0gdG9GdW5jdGlvbihmbik7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyArK2kpIHtcbiAgICBwcm9wID0gZm4oYXJyW2ldLCBpKTtcbiAgICByZXRbcHJvcF0gPSByZXRbcHJvcF0gfHwgW107XG4gICAgcmV0W3Byb3BdLnB1c2goYXJyW2ldKTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59OyIsIi8qIVxuICAgIGxvY2FsRm9yYWdlIC0tIE9mZmxpbmUgU3RvcmFnZSwgSW1wcm92ZWRcbiAgICBWZXJzaW9uIDEuNy4xXG4gICAgaHR0cHM6Ly9sb2NhbGZvcmFnZS5naXRodWIuaW8vbG9jYWxGb3JhZ2VcbiAgICAoYykgMjAxMy0yMDE3IE1vemlsbGEsIEFwYWNoZSBMaWNlbnNlIDIuMFxuKi9cbihmdW5jdGlvbihmKXtpZih0eXBlb2YgZXhwb3J0cz09PVwib2JqZWN0XCImJnR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiKXttb2R1bGUuZXhwb3J0cz1mKCl9ZWxzZSBpZih0eXBlb2YgZGVmaW5lPT09XCJmdW5jdGlvblwiJiZkZWZpbmUuYW1kKXtkZWZpbmUoW10sZil9ZWxzZXt2YXIgZztpZih0eXBlb2Ygd2luZG93IT09XCJ1bmRlZmluZWRcIil7Zz13aW5kb3d9ZWxzZSBpZih0eXBlb2YgZ2xvYmFsIT09XCJ1bmRlZmluZWRcIil7Zz1nbG9iYWx9ZWxzZSBpZih0eXBlb2Ygc2VsZiE9PVwidW5kZWZpbmVkXCIpe2c9c2VsZn1lbHNle2c9dGhpc31nLmxvY2FsZm9yYWdlID0gZigpfX0pKGZ1bmN0aW9uKCl7dmFyIGRlZmluZSxtb2R1bGUsZXhwb3J0cztyZXR1cm4gKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IChmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsIGYpfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkoezE6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xudmFyIE11dGF0aW9uID0gZ2xvYmFsLk11dGF0aW9uT2JzZXJ2ZXIgfHwgZ2xvYmFsLldlYktpdE11dGF0aW9uT2JzZXJ2ZXI7XG5cbnZhciBzY2hlZHVsZURyYWluO1xuXG57XG4gIGlmIChNdXRhdGlvbikge1xuICAgIHZhciBjYWxsZWQgPSAwO1xuICAgIHZhciBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbihuZXh0VGljayk7XG4gICAgdmFyIGVsZW1lbnQgPSBnbG9iYWwuZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpO1xuICAgIG9ic2VydmVyLm9ic2VydmUoZWxlbWVudCwge1xuICAgICAgY2hhcmFjdGVyRGF0YTogdHJ1ZVxuICAgIH0pO1xuICAgIHNjaGVkdWxlRHJhaW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICBlbGVtZW50LmRhdGEgPSAoY2FsbGVkID0gKytjYWxsZWQgJSAyKTtcbiAgICB9O1xuICB9IGVsc2UgaWYgKCFnbG9iYWwuc2V0SW1tZWRpYXRlICYmIHR5cGVvZiBnbG9iYWwuTWVzc2FnZUNoYW5uZWwgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgdmFyIGNoYW5uZWwgPSBuZXcgZ2xvYmFsLk1lc3NhZ2VDaGFubmVsKCk7XG4gICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBuZXh0VGljaztcbiAgICBzY2hlZHVsZURyYWluID0gZnVuY3Rpb24gKCkge1xuICAgICAgY2hhbm5lbC5wb3J0Mi5wb3N0TWVzc2FnZSgwKTtcbiAgICB9O1xuICB9IGVsc2UgaWYgKCdkb2N1bWVudCcgaW4gZ2xvYmFsICYmICdvbnJlYWR5c3RhdGVjaGFuZ2UnIGluIGdsb2JhbC5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKSkge1xuICAgIHNjaGVkdWxlRHJhaW4gPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIC8vIENyZWF0ZSBhIDxzY3JpcHQ+IGVsZW1lbnQ7IGl0cyByZWFkeXN0YXRlY2hhbmdlIGV2ZW50IHdpbGwgYmUgZmlyZWQgYXN5bmNocm9ub3VzbHkgb25jZSBpdCBpcyBpbnNlcnRlZFxuICAgICAgLy8gaW50byB0aGUgZG9jdW1lbnQuIERvIHNvLCB0aHVzIHF1ZXVpbmcgdXAgdGhlIHRhc2suIFJlbWVtYmVyIHRvIGNsZWFuIHVwIG9uY2UgaXQncyBiZWVuIGNhbGxlZC5cbiAgICAgIHZhciBzY3JpcHRFbCA9IGdsb2JhbC5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgIHNjcmlwdEVsLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgbmV4dFRpY2soKTtcblxuICAgICAgICBzY3JpcHRFbC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBudWxsO1xuICAgICAgICBzY3JpcHRFbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNjcmlwdEVsKTtcbiAgICAgICAgc2NyaXB0RWwgPSBudWxsO1xuICAgICAgfTtcbiAgICAgIGdsb2JhbC5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoc2NyaXB0RWwpO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgc2NoZWR1bGVEcmFpbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHNldFRpbWVvdXQobmV4dFRpY2ssIDApO1xuICAgIH07XG4gIH1cbn1cblxudmFyIGRyYWluaW5nO1xudmFyIHF1ZXVlID0gW107XG4vL25hbWVkIG5leHRUaWNrIGZvciBsZXNzIGNvbmZ1c2luZyBzdGFjayB0cmFjZXNcbmZ1bmN0aW9uIG5leHRUaWNrKCkge1xuICBkcmFpbmluZyA9IHRydWU7XG4gIHZhciBpLCBvbGRRdWV1ZTtcbiAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgd2hpbGUgKGxlbikge1xuICAgIG9sZFF1ZXVlID0gcXVldWU7XG4gICAgcXVldWUgPSBbXTtcbiAgICBpID0gLTE7XG4gICAgd2hpbGUgKCsraSA8IGxlbikge1xuICAgICAgb2xkUXVldWVbaV0oKTtcbiAgICB9XG4gICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICB9XG4gIGRyYWluaW5nID0gZmFsc2U7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW1tZWRpYXRlO1xuZnVuY3Rpb24gaW1tZWRpYXRlKHRhc2spIHtcbiAgaWYgKHF1ZXVlLnB1c2godGFzaykgPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgc2NoZWR1bGVEcmFpbigpO1xuICB9XG59XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KVxufSx7fV0sMjpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG4ndXNlIHN0cmljdCc7XG52YXIgaW1tZWRpYXRlID0gX2RlcmVxXygxKTtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmZ1bmN0aW9uIElOVEVSTkFMKCkge31cblxudmFyIGhhbmRsZXJzID0ge307XG5cbnZhciBSRUpFQ1RFRCA9IFsnUkVKRUNURUQnXTtcbnZhciBGVUxGSUxMRUQgPSBbJ0ZVTEZJTExFRCddO1xudmFyIFBFTkRJTkcgPSBbJ1BFTkRJTkcnXTtcblxubW9kdWxlLmV4cG9ydHMgPSBQcm9taXNlO1xuXG5mdW5jdGlvbiBQcm9taXNlKHJlc29sdmVyKSB7XG4gIGlmICh0eXBlb2YgcmVzb2x2ZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdyZXNvbHZlciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgfVxuICB0aGlzLnN0YXRlID0gUEVORElORztcbiAgdGhpcy5xdWV1ZSA9IFtdO1xuICB0aGlzLm91dGNvbWUgPSB2b2lkIDA7XG4gIGlmIChyZXNvbHZlciAhPT0gSU5URVJOQUwpIHtcbiAgICBzYWZlbHlSZXNvbHZlVGhlbmFibGUodGhpcywgcmVzb2x2ZXIpO1xuICB9XG59XG5cblByb21pc2UucHJvdG90eXBlW1wiY2F0Y2hcIl0gPSBmdW5jdGlvbiAob25SZWplY3RlZCkge1xuICByZXR1cm4gdGhpcy50aGVuKG51bGwsIG9uUmVqZWN0ZWQpO1xufTtcblByb21pc2UucHJvdG90eXBlLnRoZW4gPSBmdW5jdGlvbiAob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpIHtcbiAgaWYgKHR5cGVvZiBvbkZ1bGZpbGxlZCAhPT0gJ2Z1bmN0aW9uJyAmJiB0aGlzLnN0YXRlID09PSBGVUxGSUxMRUQgfHxcbiAgICB0eXBlb2Ygb25SZWplY3RlZCAhPT0gJ2Z1bmN0aW9uJyAmJiB0aGlzLnN0YXRlID09PSBSRUpFQ1RFRCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHZhciBwcm9taXNlID0gbmV3IHRoaXMuY29uc3RydWN0b3IoSU5URVJOQUwpO1xuICBpZiAodGhpcy5zdGF0ZSAhPT0gUEVORElORykge1xuICAgIHZhciByZXNvbHZlciA9IHRoaXMuc3RhdGUgPT09IEZVTEZJTExFRCA/IG9uRnVsZmlsbGVkIDogb25SZWplY3RlZDtcbiAgICB1bndyYXAocHJvbWlzZSwgcmVzb2x2ZXIsIHRoaXMub3V0Y29tZSk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5xdWV1ZS5wdXNoKG5ldyBRdWV1ZUl0ZW0ocHJvbWlzZSwgb25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpKTtcbiAgfVxuXG4gIHJldHVybiBwcm9taXNlO1xufTtcbmZ1bmN0aW9uIFF1ZXVlSXRlbShwcm9taXNlLCBvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCkge1xuICB0aGlzLnByb21pc2UgPSBwcm9taXNlO1xuICBpZiAodHlwZW9mIG9uRnVsZmlsbGVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhpcy5vbkZ1bGZpbGxlZCA9IG9uRnVsZmlsbGVkO1xuICAgIHRoaXMuY2FsbEZ1bGZpbGxlZCA9IHRoaXMub3RoZXJDYWxsRnVsZmlsbGVkO1xuICB9XG4gIGlmICh0eXBlb2Ygb25SZWplY3RlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHRoaXMub25SZWplY3RlZCA9IG9uUmVqZWN0ZWQ7XG4gICAgdGhpcy5jYWxsUmVqZWN0ZWQgPSB0aGlzLm90aGVyQ2FsbFJlamVjdGVkO1xuICB9XG59XG5RdWV1ZUl0ZW0ucHJvdG90eXBlLmNhbGxGdWxmaWxsZWQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgaGFuZGxlcnMucmVzb2x2ZSh0aGlzLnByb21pc2UsIHZhbHVlKTtcbn07XG5RdWV1ZUl0ZW0ucHJvdG90eXBlLm90aGVyQ2FsbEZ1bGZpbGxlZCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICB1bndyYXAodGhpcy5wcm9taXNlLCB0aGlzLm9uRnVsZmlsbGVkLCB2YWx1ZSk7XG59O1xuUXVldWVJdGVtLnByb3RvdHlwZS5jYWxsUmVqZWN0ZWQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgaGFuZGxlcnMucmVqZWN0KHRoaXMucHJvbWlzZSwgdmFsdWUpO1xufTtcblF1ZXVlSXRlbS5wcm90b3R5cGUub3RoZXJDYWxsUmVqZWN0ZWQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgdW53cmFwKHRoaXMucHJvbWlzZSwgdGhpcy5vblJlamVjdGVkLCB2YWx1ZSk7XG59O1xuXG5mdW5jdGlvbiB1bndyYXAocHJvbWlzZSwgZnVuYywgdmFsdWUpIHtcbiAgaW1tZWRpYXRlKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmV0dXJuVmFsdWU7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVyblZhbHVlID0gZnVuYyh2YWx1ZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGhhbmRsZXJzLnJlamVjdChwcm9taXNlLCBlKTtcbiAgICB9XG4gICAgaWYgKHJldHVyblZhbHVlID09PSBwcm9taXNlKSB7XG4gICAgICBoYW5kbGVycy5yZWplY3QocHJvbWlzZSwgbmV3IFR5cGVFcnJvcignQ2Fubm90IHJlc29sdmUgcHJvbWlzZSB3aXRoIGl0c2VsZicpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaGFuZGxlcnMucmVzb2x2ZShwcm9taXNlLCByZXR1cm5WYWx1ZSk7XG4gICAgfVxuICB9KTtcbn1cblxuaGFuZGxlcnMucmVzb2x2ZSA9IGZ1bmN0aW9uIChzZWxmLCB2YWx1ZSkge1xuICB2YXIgcmVzdWx0ID0gdHJ5Q2F0Y2goZ2V0VGhlbiwgdmFsdWUpO1xuICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gJ2Vycm9yJykge1xuICAgIHJldHVybiBoYW5kbGVycy5yZWplY3Qoc2VsZiwgcmVzdWx0LnZhbHVlKTtcbiAgfVxuICB2YXIgdGhlbmFibGUgPSByZXN1bHQudmFsdWU7XG5cbiAgaWYgKHRoZW5hYmxlKSB7XG4gICAgc2FmZWx5UmVzb2x2ZVRoZW5hYmxlKHNlbGYsIHRoZW5hYmxlKTtcbiAgfSBlbHNlIHtcbiAgICBzZWxmLnN0YXRlID0gRlVMRklMTEVEO1xuICAgIHNlbGYub3V0Y29tZSA9IHZhbHVlO1xuICAgIHZhciBpID0gLTE7XG4gICAgdmFyIGxlbiA9IHNlbGYucXVldWUubGVuZ3RoO1xuICAgIHdoaWxlICgrK2kgPCBsZW4pIHtcbiAgICAgIHNlbGYucXVldWVbaV0uY2FsbEZ1bGZpbGxlZCh2YWx1ZSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBzZWxmO1xufTtcbmhhbmRsZXJzLnJlamVjdCA9IGZ1bmN0aW9uIChzZWxmLCBlcnJvcikge1xuICBzZWxmLnN0YXRlID0gUkVKRUNURUQ7XG4gIHNlbGYub3V0Y29tZSA9IGVycm9yO1xuICB2YXIgaSA9IC0xO1xuICB2YXIgbGVuID0gc2VsZi5xdWV1ZS5sZW5ndGg7XG4gIHdoaWxlICgrK2kgPCBsZW4pIHtcbiAgICBzZWxmLnF1ZXVlW2ldLmNhbGxSZWplY3RlZChlcnJvcik7XG4gIH1cbiAgcmV0dXJuIHNlbGY7XG59O1xuXG5mdW5jdGlvbiBnZXRUaGVuKG9iaikge1xuICAvLyBNYWtlIHN1cmUgd2Ugb25seSBhY2Nlc3MgdGhlIGFjY2Vzc29yIG9uY2UgYXMgcmVxdWlyZWQgYnkgdGhlIHNwZWNcbiAgdmFyIHRoZW4gPSBvYmogJiYgb2JqLnRoZW47XG4gIGlmIChvYmogJiYgKHR5cGVvZiBvYmogPT09ICdvYmplY3QnIHx8IHR5cGVvZiBvYmogPT09ICdmdW5jdGlvbicpICYmIHR5cGVvZiB0aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIGFwcHlUaGVuKCkge1xuICAgICAgdGhlbi5hcHBseShvYmosIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzYWZlbHlSZXNvbHZlVGhlbmFibGUoc2VsZiwgdGhlbmFibGUpIHtcbiAgLy8gRWl0aGVyIGZ1bGZpbGwsIHJlamVjdCBvciByZWplY3Qgd2l0aCBlcnJvclxuICB2YXIgY2FsbGVkID0gZmFsc2U7XG4gIGZ1bmN0aW9uIG9uRXJyb3IodmFsdWUpIHtcbiAgICBpZiAoY2FsbGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNhbGxlZCA9IHRydWU7XG4gICAgaGFuZGxlcnMucmVqZWN0KHNlbGYsIHZhbHVlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uU3VjY2Vzcyh2YWx1ZSkge1xuICAgIGlmIChjYWxsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY2FsbGVkID0gdHJ1ZTtcbiAgICBoYW5kbGVycy5yZXNvbHZlKHNlbGYsIHZhbHVlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRyeVRvVW53cmFwKCkge1xuICAgIHRoZW5hYmxlKG9uU3VjY2Vzcywgb25FcnJvcik7XG4gIH1cblxuICB2YXIgcmVzdWx0ID0gdHJ5Q2F0Y2godHJ5VG9VbndyYXApO1xuICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gJ2Vycm9yJykge1xuICAgIG9uRXJyb3IocmVzdWx0LnZhbHVlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB0cnlDYXRjaChmdW5jLCB2YWx1ZSkge1xuICB2YXIgb3V0ID0ge307XG4gIHRyeSB7XG4gICAgb3V0LnZhbHVlID0gZnVuYyh2YWx1ZSk7XG4gICAgb3V0LnN0YXR1cyA9ICdzdWNjZXNzJztcbiAgfSBjYXRjaCAoZSkge1xuICAgIG91dC5zdGF0dXMgPSAnZXJyb3InO1xuICAgIG91dC52YWx1ZSA9IGU7XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cblxuUHJvbWlzZS5yZXNvbHZlID0gcmVzb2x2ZTtcbmZ1bmN0aW9uIHJlc29sdmUodmFsdWUpIHtcbiAgaWYgKHZhbHVlIGluc3RhbmNlb2YgdGhpcykge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICByZXR1cm4gaGFuZGxlcnMucmVzb2x2ZShuZXcgdGhpcyhJTlRFUk5BTCksIHZhbHVlKTtcbn1cblxuUHJvbWlzZS5yZWplY3QgPSByZWplY3Q7XG5mdW5jdGlvbiByZWplY3QocmVhc29uKSB7XG4gIHZhciBwcm9taXNlID0gbmV3IHRoaXMoSU5URVJOQUwpO1xuICByZXR1cm4gaGFuZGxlcnMucmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG59XG5cblByb21pc2UuYWxsID0gYWxsO1xuZnVuY3Rpb24gYWxsKGl0ZXJhYmxlKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChpdGVyYWJsZSkgIT09ICdbb2JqZWN0IEFycmF5XScpIHtcbiAgICByZXR1cm4gdGhpcy5yZWplY3QobmV3IFR5cGVFcnJvcignbXVzdCBiZSBhbiBhcnJheScpKTtcbiAgfVxuXG4gIHZhciBsZW4gPSBpdGVyYWJsZS5sZW5ndGg7XG4gIHZhciBjYWxsZWQgPSBmYWxzZTtcbiAgaWYgKCFsZW4pIHtcbiAgICByZXR1cm4gdGhpcy5yZXNvbHZlKFtdKTtcbiAgfVxuXG4gIHZhciB2YWx1ZXMgPSBuZXcgQXJyYXkobGVuKTtcbiAgdmFyIHJlc29sdmVkID0gMDtcbiAgdmFyIGkgPSAtMTtcbiAgdmFyIHByb21pc2UgPSBuZXcgdGhpcyhJTlRFUk5BTCk7XG5cbiAgd2hpbGUgKCsraSA8IGxlbikge1xuICAgIGFsbFJlc29sdmVyKGl0ZXJhYmxlW2ldLCBpKTtcbiAgfVxuICByZXR1cm4gcHJvbWlzZTtcbiAgZnVuY3Rpb24gYWxsUmVzb2x2ZXIodmFsdWUsIGkpIHtcbiAgICBzZWxmLnJlc29sdmUodmFsdWUpLnRoZW4ocmVzb2x2ZUZyb21BbGwsIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgaWYgKCFjYWxsZWQpIHtcbiAgICAgICAgY2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgaGFuZGxlcnMucmVqZWN0KHByb21pc2UsIGVycm9yKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBmdW5jdGlvbiByZXNvbHZlRnJvbUFsbChvdXRWYWx1ZSkge1xuICAgICAgdmFsdWVzW2ldID0gb3V0VmFsdWU7XG4gICAgICBpZiAoKytyZXNvbHZlZCA9PT0gbGVuICYmICFjYWxsZWQpIHtcbiAgICAgICAgY2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgaGFuZGxlcnMucmVzb2x2ZShwcm9taXNlLCB2YWx1ZXMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5Qcm9taXNlLnJhY2UgPSByYWNlO1xuZnVuY3Rpb24gcmFjZShpdGVyYWJsZSkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoaXRlcmFibGUpICE9PSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgcmV0dXJuIHRoaXMucmVqZWN0KG5ldyBUeXBlRXJyb3IoJ211c3QgYmUgYW4gYXJyYXknKSk7XG4gIH1cblxuICB2YXIgbGVuID0gaXRlcmFibGUubGVuZ3RoO1xuICB2YXIgY2FsbGVkID0gZmFsc2U7XG4gIGlmICghbGVuKSB7XG4gICAgcmV0dXJuIHRoaXMucmVzb2x2ZShbXSk7XG4gIH1cblxuICB2YXIgaSA9IC0xO1xuICB2YXIgcHJvbWlzZSA9IG5ldyB0aGlzKElOVEVSTkFMKTtcblxuICB3aGlsZSAoKytpIDwgbGVuKSB7XG4gICAgcmVzb2x2ZXIoaXRlcmFibGVbaV0pO1xuICB9XG4gIHJldHVybiBwcm9taXNlO1xuICBmdW5jdGlvbiByZXNvbHZlcih2YWx1ZSkge1xuICAgIHNlbGYucmVzb2x2ZSh2YWx1ZSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgIGlmICghY2FsbGVkKSB7XG4gICAgICAgIGNhbGxlZCA9IHRydWU7XG4gICAgICAgIGhhbmRsZXJzLnJlc29sdmUocHJvbWlzZSwgcmVzcG9uc2UpO1xuICAgICAgfVxuICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgaWYgKCFjYWxsZWQpIHtcbiAgICAgICAgY2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgaGFuZGxlcnMucmVqZWN0KHByb21pc2UsIGVycm9yKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG59LHtcIjFcIjoxfV0sMzpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG4oZnVuY3Rpb24gKGdsb2JhbCl7XG4ndXNlIHN0cmljdCc7XG5pZiAodHlwZW9mIGdsb2JhbC5Qcm9taXNlICE9PSAnZnVuY3Rpb24nKSB7XG4gIGdsb2JhbC5Qcm9taXNlID0gX2RlcmVxXygyKTtcbn1cblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pXG59LHtcIjJcIjoyfV0sNDpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBfdHlwZW9mID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9IDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gZ2V0SURCKCkge1xuICAgIC8qIGdsb2JhbCBpbmRleGVkREIsd2Via2l0SW5kZXhlZERCLG1vekluZGV4ZWREQixPSW5kZXhlZERCLG1zSW5kZXhlZERCICovXG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBpbmRleGVkREIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gaW5kZXhlZERCO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2Ygd2Via2l0SW5kZXhlZERCICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmV0dXJuIHdlYmtpdEluZGV4ZWREQjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIG1vekluZGV4ZWREQiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHJldHVybiBtb3pJbmRleGVkREI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBPSW5kZXhlZERCICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmV0dXJuIE9JbmRleGVkREI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBtc0luZGV4ZWREQiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHJldHVybiBtc0luZGV4ZWREQjtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbn1cblxudmFyIGlkYiA9IGdldElEQigpO1xuXG5mdW5jdGlvbiBpc0luZGV4ZWREQlZhbGlkKCkge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIEluaXRpYWxpemUgSW5kZXhlZERCOyBmYWxsIGJhY2sgdG8gdmVuZG9yLXByZWZpeGVkIHZlcnNpb25zXG4gICAgICAgIC8vIGlmIG5lZWRlZC5cbiAgICAgICAgaWYgKCFpZGIpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBXZSBtaW1pYyBQb3VjaERCIGhlcmU7XG4gICAgICAgIC8vXG4gICAgICAgIC8vIFdlIHRlc3QgZm9yIG9wZW5EYXRhYmFzZSBiZWNhdXNlIElFIE1vYmlsZSBpZGVudGlmaWVzIGl0c2VsZlxuICAgICAgICAvLyBhcyBTYWZhcmkuIE9oIHRoZSBsdWx6Li4uXG4gICAgICAgIHZhciBpc1NhZmFyaSA9IHR5cGVvZiBvcGVuRGF0YWJhc2UgIT09ICd1bmRlZmluZWQnICYmIC8oU2FmYXJpfGlQaG9uZXxpUGFkfGlQb2QpLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpICYmICEvQ2hyb21lLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpICYmICEvQmxhY2tCZXJyeS8udGVzdChuYXZpZ2F0b3IucGxhdGZvcm0pO1xuXG4gICAgICAgIHZhciBoYXNGZXRjaCA9IHR5cGVvZiBmZXRjaCA9PT0gJ2Z1bmN0aW9uJyAmJiBmZXRjaC50b1N0cmluZygpLmluZGV4T2YoJ1tuYXRpdmUgY29kZScpICE9PSAtMTtcblxuICAgICAgICAvLyBTYWZhcmkgPDEwLjEgZG9lcyBub3QgbWVldCBvdXIgcmVxdWlyZW1lbnRzIGZvciBJREIgc3VwcG9ydCAoIzU1NzIpXG4gICAgICAgIC8vIHNpbmNlIFNhZmFyaSAxMC4xIHNoaXBwZWQgd2l0aCBmZXRjaCwgd2UgY2FuIHVzZSB0aGF0IHRvIGRldGVjdCBpdFxuICAgICAgICByZXR1cm4gKCFpc1NhZmFyaSB8fCBoYXNGZXRjaCkgJiYgdHlwZW9mIGluZGV4ZWREQiAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgLy8gc29tZSBvdXRkYXRlZCBpbXBsZW1lbnRhdGlvbnMgb2YgSURCIHRoYXQgYXBwZWFyIG9uIFNhbXN1bmdcbiAgICAgICAgLy8gYW5kIEhUQyBBbmRyb2lkIGRldmljZXMgPDQuNCBhcmUgbWlzc2luZyBJREJLZXlSYW5nZVxuICAgICAgICAvLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9tb3ppbGxhL2xvY2FsRm9yYWdlL2lzc3Vlcy8xMjhcbiAgICAgICAgLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS9sb2NhbEZvcmFnZS9pc3N1ZXMvMjcyXG4gICAgICAgIHR5cGVvZiBJREJLZXlSYW5nZSAhPT0gJ3VuZGVmaW5lZCc7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG4vLyBBYnN0cmFjdHMgY29uc3RydWN0aW5nIGEgQmxvYiBvYmplY3QsIHNvIGl0IGFsc28gd29ya3MgaW4gb2xkZXJcbi8vIGJyb3dzZXJzIHRoYXQgZG9uJ3Qgc3VwcG9ydCB0aGUgbmF0aXZlIEJsb2IgY29uc3RydWN0b3IuIChpLmUuXG4vLyBvbGQgUXRXZWJLaXQgdmVyc2lvbnMsIGF0IGxlYXN0KS5cbi8vIEFic3RyYWN0cyBjb25zdHJ1Y3RpbmcgYSBCbG9iIG9iamVjdCwgc28gaXQgYWxzbyB3b3JrcyBpbiBvbGRlclxuLy8gYnJvd3NlcnMgdGhhdCBkb24ndCBzdXBwb3J0IHRoZSBuYXRpdmUgQmxvYiBjb25zdHJ1Y3Rvci4gKGkuZS5cbi8vIG9sZCBRdFdlYktpdCB2ZXJzaW9ucywgYXQgbGVhc3QpLlxuZnVuY3Rpb24gY3JlYXRlQmxvYihwYXJ0cywgcHJvcGVydGllcykge1xuICAgIC8qIGdsb2JhbCBCbG9iQnVpbGRlcixNU0Jsb2JCdWlsZGVyLE1vekJsb2JCdWlsZGVyLFdlYktpdEJsb2JCdWlsZGVyICovXG4gICAgcGFydHMgPSBwYXJ0cyB8fCBbXTtcbiAgICBwcm9wZXJ0aWVzID0gcHJvcGVydGllcyB8fCB7fTtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gbmV3IEJsb2IocGFydHMsIHByb3BlcnRpZXMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKGUubmFtZSAhPT0gJ1R5cGVFcnJvcicpIHtcbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIEJ1aWxkZXIgPSB0eXBlb2YgQmxvYkJ1aWxkZXIgIT09ICd1bmRlZmluZWQnID8gQmxvYkJ1aWxkZXIgOiB0eXBlb2YgTVNCbG9iQnVpbGRlciAhPT0gJ3VuZGVmaW5lZCcgPyBNU0Jsb2JCdWlsZGVyIDogdHlwZW9mIE1vekJsb2JCdWlsZGVyICE9PSAndW5kZWZpbmVkJyA/IE1vekJsb2JCdWlsZGVyIDogV2ViS2l0QmxvYkJ1aWxkZXI7XG4gICAgICAgIHZhciBidWlsZGVyID0gbmV3IEJ1aWxkZXIoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgYnVpbGRlci5hcHBlbmQocGFydHNbaV0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBidWlsZGVyLmdldEJsb2IocHJvcGVydGllcy50eXBlKTtcbiAgICB9XG59XG5cbi8vIFRoaXMgaXMgQ29tbW9uSlMgYmVjYXVzZSBsaWUgaXMgYW4gZXh0ZXJuYWwgZGVwZW5kZW5jeSwgc28gUm9sbHVwXG4vLyBjYW4ganVzdCBpZ25vcmUgaXQuXG5pZiAodHlwZW9mIFByb21pc2UgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gSW4gdGhlIFwibm9wcm9taXNlc1wiIGJ1aWxkIHRoaXMgd2lsbCBqdXN0IHRocm93IGlmIHlvdSBkb24ndCBoYXZlXG4gICAgLy8gYSBnbG9iYWwgcHJvbWlzZSBvYmplY3QsIGJ1dCBpdCB3b3VsZCB0aHJvdyBhbnl3YXkgbGF0ZXIuXG4gICAgX2RlcmVxXygzKTtcbn1cbnZhciBQcm9taXNlJDEgPSBQcm9taXNlO1xuXG5mdW5jdGlvbiBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spIHtcbiAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3VsdCk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyb3IpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGV4ZWN1dGVUd29DYWxsYmFja3MocHJvbWlzZSwgY2FsbGJhY2ssIGVycm9yQ2FsbGJhY2spIHtcbiAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHByb21pc2UudGhlbihjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBlcnJvckNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHByb21pc2VbXCJjYXRjaFwiXShlcnJvckNhbGxiYWNrKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZUtleShrZXkpIHtcbiAgICAvLyBDYXN0IHRoZSBrZXkgdG8gYSBzdHJpbmcsIGFzIHRoYXQncyBhbGwgd2UgY2FuIHNldCBhcyBhIGtleS5cbiAgICBpZiAodHlwZW9mIGtleSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGtleSArICcgdXNlZCBhcyBhIGtleSwgYnV0IGl0IGlzIG5vdCBhIHN0cmluZy4nKTtcbiAgICAgICAga2V5ID0gU3RyaW5nKGtleSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGtleTtcbn1cblxuZnVuY3Rpb24gZ2V0Q2FsbGJhY2soKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggJiYgdHlwZW9mIGFyZ3VtZW50c1thcmd1bWVudHMubGVuZ3RoIC0gMV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50c1thcmd1bWVudHMubGVuZ3RoIC0gMV07XG4gICAgfVxufVxuXG4vLyBTb21lIGNvZGUgb3JpZ2luYWxseSBmcm9tIGFzeW5jX3N0b3JhZ2UuanMgaW5cbi8vIFtHYWlhXShodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS1iMmcvZ2FpYSkuXG5cbnZhciBERVRFQ1RfQkxPQl9TVVBQT1JUX1NUT1JFID0gJ2xvY2FsLWZvcmFnZS1kZXRlY3QtYmxvYi1zdXBwb3J0JztcbnZhciBzdXBwb3J0c0Jsb2JzID0gdm9pZCAwO1xudmFyIGRiQ29udGV4dHMgPSB7fTtcbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8vIFRyYW5zYWN0aW9uIE1vZGVzXG52YXIgUkVBRF9PTkxZID0gJ3JlYWRvbmx5JztcbnZhciBSRUFEX1dSSVRFID0gJ3JlYWR3cml0ZSc7XG5cbi8vIFRyYW5zZm9ybSBhIGJpbmFyeSBzdHJpbmcgdG8gYW4gYXJyYXkgYnVmZmVyLCBiZWNhdXNlIG90aGVyd2lzZVxuLy8gd2VpcmQgc3R1ZmYgaGFwcGVucyB3aGVuIHlvdSB0cnkgdG8gd29yayB3aXRoIHRoZSBiaW5hcnkgc3RyaW5nIGRpcmVjdGx5LlxuLy8gSXQgaXMga25vd24uXG4vLyBGcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTQ5Njc2NDcvIChjb250aW51ZXMgb24gbmV4dCBsaW5lKVxuLy8gZW5jb2RlLWRlY29kZS1pbWFnZS13aXRoLWJhc2U2NC1icmVha3MtaW1hZ2UgKDIwMTMtMDQtMjEpXG5mdW5jdGlvbiBfYmluU3RyaW5nVG9BcnJheUJ1ZmZlcihiaW4pIHtcbiAgICB2YXIgbGVuZ3RoID0gYmluLmxlbmd0aDtcbiAgICB2YXIgYnVmID0gbmV3IEFycmF5QnVmZmVyKGxlbmd0aCk7XG4gICAgdmFyIGFyciA9IG5ldyBVaW50OEFycmF5KGJ1Zik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBhcnJbaV0gPSBiaW4uY2hhckNvZGVBdChpKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ1Zjtcbn1cblxuLy9cbi8vIEJsb2JzIGFyZSBub3Qgc3VwcG9ydGVkIGluIGFsbCB2ZXJzaW9ucyBvZiBJbmRleGVkREIsIG5vdGFibHlcbi8vIENocm9tZSA8MzcgYW5kIEFuZHJvaWQgPDUuIEluIHRob3NlIHZlcnNpb25zLCBzdG9yaW5nIGEgYmxvYiB3aWxsIHRocm93LlxuLy9cbi8vIFZhcmlvdXMgb3RoZXIgYmxvYiBidWdzIGV4aXN0IGluIENocm9tZSB2MzctNDIgKGluY2x1c2l2ZSkuXG4vLyBEZXRlY3RpbmcgdGhlbSBpcyBleHBlbnNpdmUgYW5kIGNvbmZ1c2luZyB0byB1c2VycywgYW5kIENocm9tZSAzNy00MlxuLy8gaXMgYXQgdmVyeSBsb3cgdXNhZ2Ugd29ybGR3aWRlLCBzbyB3ZSBkbyBhIGhhY2t5IHVzZXJBZ2VudCBjaGVjayBpbnN0ZWFkLlxuLy9cbi8vIGNvbnRlbnQtdHlwZSBidWc6IGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD00MDgxMjBcbi8vIDQwNCBidWc6IGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD00NDc5MTZcbi8vIEZpbGVSZWFkZXIgYnVnOiBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9NDQ3ODM2XG4vL1xuLy8gQ29kZSBib3Jyb3dlZCBmcm9tIFBvdWNoREIuIFNlZTpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9wb3VjaGRiL3BvdWNoZGIvYmxvYi9tYXN0ZXIvcGFja2FnZXMvbm9kZV9tb2R1bGVzL3BvdWNoZGItYWRhcHRlci1pZGIvc3JjL2Jsb2JTdXBwb3J0LmpzXG4vL1xuZnVuY3Rpb24gX2NoZWNrQmxvYlN1cHBvcnRXaXRob3V0Q2FjaGluZyhpZGIpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UkMShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgICAgICB2YXIgdHhuID0gaWRiLnRyYW5zYWN0aW9uKERFVEVDVF9CTE9CX1NVUFBPUlRfU1RPUkUsIFJFQURfV1JJVEUpO1xuICAgICAgICB2YXIgYmxvYiA9IGNyZWF0ZUJsb2IoWycnXSk7XG4gICAgICAgIHR4bi5vYmplY3RTdG9yZShERVRFQ1RfQkxPQl9TVVBQT1JUX1NUT1JFKS5wdXQoYmxvYiwgJ2tleScpO1xuXG4gICAgICAgIHR4bi5vbmFib3J0ID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIC8vIElmIHRoZSB0cmFuc2FjdGlvbiBhYm9ydHMgbm93IGl0cyBkdWUgdG8gbm90IGJlaW5nIGFibGUgdG9cbiAgICAgICAgICAgIC8vIHdyaXRlIHRvIHRoZSBkYXRhYmFzZSwgbGlrZWx5IGR1ZSB0byB0aGUgZGlzayBiZWluZyBmdWxsXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdHhuLm9uY29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgbWF0Y2hlZENocm9tZSA9IG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL0Nocm9tZVxcLyhcXGQrKS8pO1xuICAgICAgICAgICAgdmFyIG1hdGNoZWRFZGdlID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvRWRnZVxcLy8pO1xuICAgICAgICAgICAgLy8gTVMgRWRnZSBwcmV0ZW5kcyB0byBiZSBDaHJvbWUgNDI6XG4gICAgICAgICAgICAvLyBodHRwczovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2hoODY5MzAxJTI4dj12cy44NSUyOS5hc3B4XG4gICAgICAgICAgICByZXNvbHZlKG1hdGNoZWRFZGdlIHx8ICFtYXRjaGVkQ2hyb21lIHx8IHBhcnNlSW50KG1hdGNoZWRDaHJvbWVbMV0sIDEwKSA+PSA0Myk7XG4gICAgICAgIH07XG4gICAgfSlbXCJjYXRjaFwiXShmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTsgLy8gZXJyb3IsIHNvIGFzc3VtZSB1bnN1cHBvcnRlZFxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBfY2hlY2tCbG9iU3VwcG9ydChpZGIpIHtcbiAgICBpZiAodHlwZW9mIHN1cHBvcnRzQmxvYnMgPT09ICdib29sZWFuJykge1xuICAgICAgICByZXR1cm4gUHJvbWlzZSQxLnJlc29sdmUoc3VwcG9ydHNCbG9icyk7XG4gICAgfVxuICAgIHJldHVybiBfY2hlY2tCbG9iU3VwcG9ydFdpdGhvdXRDYWNoaW5nKGlkYikudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgc3VwcG9ydHNCbG9icyA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gc3VwcG9ydHNCbG9icztcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gX2RlZmVyUmVhZGluZXNzKGRiSW5mbykge1xuICAgIHZhciBkYkNvbnRleHQgPSBkYkNvbnRleHRzW2RiSW5mby5uYW1lXTtcblxuICAgIC8vIENyZWF0ZSBhIGRlZmVycmVkIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIGN1cnJlbnQgZGF0YWJhc2Ugb3BlcmF0aW9uLlxuICAgIHZhciBkZWZlcnJlZE9wZXJhdGlvbiA9IHt9O1xuXG4gICAgZGVmZXJyZWRPcGVyYXRpb24ucHJvbWlzZSA9IG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBkZWZlcnJlZE9wZXJhdGlvbi5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgICAgZGVmZXJyZWRPcGVyYXRpb24ucmVqZWN0ID0gcmVqZWN0O1xuICAgIH0pO1xuXG4gICAgLy8gRW5xdWV1ZSB0aGUgZGVmZXJyZWQgb3BlcmF0aW9uLlxuICAgIGRiQ29udGV4dC5kZWZlcnJlZE9wZXJhdGlvbnMucHVzaChkZWZlcnJlZE9wZXJhdGlvbik7XG5cbiAgICAvLyBDaGFpbiBpdHMgcHJvbWlzZSB0byB0aGUgZGF0YWJhc2UgcmVhZGluZXNzLlxuICAgIGlmICghZGJDb250ZXh0LmRiUmVhZHkpIHtcbiAgICAgICAgZGJDb250ZXh0LmRiUmVhZHkgPSBkZWZlcnJlZE9wZXJhdGlvbi5wcm9taXNlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGRiQ29udGV4dC5kYlJlYWR5ID0gZGJDb250ZXh0LmRiUmVhZHkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWRPcGVyYXRpb24ucHJvbWlzZTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBfYWR2YW5jZVJlYWRpbmVzcyhkYkluZm8pIHtcbiAgICB2YXIgZGJDb250ZXh0ID0gZGJDb250ZXh0c1tkYkluZm8ubmFtZV07XG5cbiAgICAvLyBEZXF1ZXVlIGEgZGVmZXJyZWQgb3BlcmF0aW9uLlxuICAgIHZhciBkZWZlcnJlZE9wZXJhdGlvbiA9IGRiQ29udGV4dC5kZWZlcnJlZE9wZXJhdGlvbnMucG9wKCk7XG5cbiAgICAvLyBSZXNvbHZlIGl0cyBwcm9taXNlICh3aGljaCBpcyBwYXJ0IG9mIHRoZSBkYXRhYmFzZSByZWFkaW5lc3NcbiAgICAvLyBjaGFpbiBvZiBwcm9taXNlcykuXG4gICAgaWYgKGRlZmVycmVkT3BlcmF0aW9uKSB7XG4gICAgICAgIGRlZmVycmVkT3BlcmF0aW9uLnJlc29sdmUoKTtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkT3BlcmF0aW9uLnByb21pc2U7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBfcmVqZWN0UmVhZGluZXNzKGRiSW5mbywgZXJyKSB7XG4gICAgdmFyIGRiQ29udGV4dCA9IGRiQ29udGV4dHNbZGJJbmZvLm5hbWVdO1xuXG4gICAgLy8gRGVxdWV1ZSBhIGRlZmVycmVkIG9wZXJhdGlvbi5cbiAgICB2YXIgZGVmZXJyZWRPcGVyYXRpb24gPSBkYkNvbnRleHQuZGVmZXJyZWRPcGVyYXRpb25zLnBvcCgpO1xuXG4gICAgLy8gUmVqZWN0IGl0cyBwcm9taXNlICh3aGljaCBpcyBwYXJ0IG9mIHRoZSBkYXRhYmFzZSByZWFkaW5lc3NcbiAgICAvLyBjaGFpbiBvZiBwcm9taXNlcykuXG4gICAgaWYgKGRlZmVycmVkT3BlcmF0aW9uKSB7XG4gICAgICAgIGRlZmVycmVkT3BlcmF0aW9uLnJlamVjdChlcnIpO1xuICAgICAgICByZXR1cm4gZGVmZXJyZWRPcGVyYXRpb24ucHJvbWlzZTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIF9nZXRDb25uZWN0aW9uKGRiSW5mbywgdXBncmFkZU5lZWRlZCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSQxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZGJDb250ZXh0c1tkYkluZm8ubmFtZV0gPSBkYkNvbnRleHRzW2RiSW5mby5uYW1lXSB8fCBjcmVhdGVEYkNvbnRleHQoKTtcblxuICAgICAgICBpZiAoZGJJbmZvLmRiKSB7XG4gICAgICAgICAgICBpZiAodXBncmFkZU5lZWRlZCkge1xuICAgICAgICAgICAgICAgIF9kZWZlclJlYWRpbmVzcyhkYkluZm8pO1xuICAgICAgICAgICAgICAgIGRiSW5mby5kYi5jbG9zZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShkYkluZm8uZGIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRiQXJncyA9IFtkYkluZm8ubmFtZV07XG5cbiAgICAgICAgaWYgKHVwZ3JhZGVOZWVkZWQpIHtcbiAgICAgICAgICAgIGRiQXJncy5wdXNoKGRiSW5mby52ZXJzaW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBvcGVucmVxID0gaWRiLm9wZW4uYXBwbHkoaWRiLCBkYkFyZ3MpO1xuXG4gICAgICAgIGlmICh1cGdyYWRlTmVlZGVkKSB7XG4gICAgICAgICAgICBvcGVucmVxLm9udXBncmFkZW5lZWRlZCA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRiID0gb3BlbnJlcS5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgZGIuY3JlYXRlT2JqZWN0U3RvcmUoZGJJbmZvLnN0b3JlTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlLm9sZFZlcnNpb24gPD0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWRkZWQgd2hlbiBzdXBwb3J0IGZvciBibG9iIHNoaW1zIHdhcyBhZGRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgZGIuY3JlYXRlT2JqZWN0U3RvcmUoREVURUNUX0JMT0JfU1VQUE9SVF9TVE9SRSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXgubmFtZSA9PT0gJ0NvbnN0cmFpbnRFcnJvcicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignVGhlIGRhdGFiYXNlIFwiJyArIGRiSW5mby5uYW1lICsgJ1wiJyArICcgaGFzIGJlZW4gdXBncmFkZWQgZnJvbSB2ZXJzaW9uICcgKyBlLm9sZFZlcnNpb24gKyAnIHRvIHZlcnNpb24gJyArIGUubmV3VmVyc2lvbiArICcsIGJ1dCB0aGUgc3RvcmFnZSBcIicgKyBkYkluZm8uc3RvcmVOYW1lICsgJ1wiIGFscmVhZHkgZXhpc3RzLicpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXg7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgb3BlbnJlcS5vbmVycm9yID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHJlamVjdChvcGVucmVxLmVycm9yKTtcbiAgICAgICAgfTtcblxuICAgICAgICBvcGVucmVxLm9uc3VjY2VzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJlc29sdmUob3BlbnJlcS5yZXN1bHQpO1xuICAgICAgICAgICAgX2FkdmFuY2VSZWFkaW5lc3MoZGJJbmZvKTtcbiAgICAgICAgfTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gX2dldE9yaWdpbmFsQ29ubmVjdGlvbihkYkluZm8pIHtcbiAgICByZXR1cm4gX2dldENvbm5lY3Rpb24oZGJJbmZvLCBmYWxzZSk7XG59XG5cbmZ1bmN0aW9uIF9nZXRVcGdyYWRlZENvbm5lY3Rpb24oZGJJbmZvKSB7XG4gICAgcmV0dXJuIF9nZXRDb25uZWN0aW9uKGRiSW5mbywgdHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIF9pc1VwZ3JhZGVOZWVkZWQoZGJJbmZvLCBkZWZhdWx0VmVyc2lvbikge1xuICAgIGlmICghZGJJbmZvLmRiKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHZhciBpc05ld1N0b3JlID0gIWRiSW5mby5kYi5vYmplY3RTdG9yZU5hbWVzLmNvbnRhaW5zKGRiSW5mby5zdG9yZU5hbWUpO1xuICAgIHZhciBpc0Rvd25ncmFkZSA9IGRiSW5mby52ZXJzaW9uIDwgZGJJbmZvLmRiLnZlcnNpb247XG4gICAgdmFyIGlzVXBncmFkZSA9IGRiSW5mby52ZXJzaW9uID4gZGJJbmZvLmRiLnZlcnNpb247XG5cbiAgICBpZiAoaXNEb3duZ3JhZGUpIHtcbiAgICAgICAgLy8gSWYgdGhlIHZlcnNpb24gaXMgbm90IHRoZSBkZWZhdWx0IG9uZVxuICAgICAgICAvLyB0aGVuIHdhcm4gZm9yIGltcG9zc2libGUgZG93bmdyYWRlLlxuICAgICAgICBpZiAoZGJJbmZvLnZlcnNpb24gIT09IGRlZmF1bHRWZXJzaW9uKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1RoZSBkYXRhYmFzZSBcIicgKyBkYkluZm8ubmFtZSArICdcIicgKyBcIiBjYW4ndCBiZSBkb3duZ3JhZGVkIGZyb20gdmVyc2lvbiBcIiArIGRiSW5mby5kYi52ZXJzaW9uICsgJyB0byB2ZXJzaW9uICcgKyBkYkluZm8udmVyc2lvbiArICcuJyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQWxpZ24gdGhlIHZlcnNpb25zIHRvIHByZXZlbnQgZXJyb3JzLlxuICAgICAgICBkYkluZm8udmVyc2lvbiA9IGRiSW5mby5kYi52ZXJzaW9uO1xuICAgIH1cblxuICAgIGlmIChpc1VwZ3JhZGUgfHwgaXNOZXdTdG9yZSkge1xuICAgICAgICAvLyBJZiB0aGUgc3RvcmUgaXMgbmV3IHRoZW4gaW5jcmVtZW50IHRoZSB2ZXJzaW9uIChpZiBuZWVkZWQpLlxuICAgICAgICAvLyBUaGlzIHdpbGwgdHJpZ2dlciBhbiBcInVwZ3JhZGVuZWVkZWRcIiBldmVudCB3aGljaCBpcyByZXF1aXJlZFxuICAgICAgICAvLyBmb3IgY3JlYXRpbmcgYSBzdG9yZS5cbiAgICAgICAgaWYgKGlzTmV3U3RvcmUpIHtcbiAgICAgICAgICAgIHZhciBpbmNWZXJzaW9uID0gZGJJbmZvLmRiLnZlcnNpb24gKyAxO1xuICAgICAgICAgICAgaWYgKGluY1ZlcnNpb24gPiBkYkluZm8udmVyc2lvbikge1xuICAgICAgICAgICAgICAgIGRiSW5mby52ZXJzaW9uID0gaW5jVmVyc2lvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuLy8gZW5jb2RlIGEgYmxvYiBmb3IgaW5kZXhlZGRiIGVuZ2luZXMgdGhhdCBkb24ndCBzdXBwb3J0IGJsb2JzXG5mdW5jdGlvbiBfZW5jb2RlQmxvYihibG9iKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgICAgcmVhZGVyLm9uZXJyb3IgPSByZWplY3Q7XG4gICAgICAgIHJlYWRlci5vbmxvYWRlbmQgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyIGJhc2U2NCA9IGJ0b2EoZS50YXJnZXQucmVzdWx0IHx8ICcnKTtcbiAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgIF9fbG9jYWxfZm9yYWdlX2VuY29kZWRfYmxvYjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBkYXRhOiBiYXNlNjQsXG4gICAgICAgICAgICAgICAgdHlwZTogYmxvYi50eXBlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgcmVhZGVyLnJlYWRBc0JpbmFyeVN0cmluZyhibG9iKTtcbiAgICB9KTtcbn1cblxuLy8gZGVjb2RlIGFuIGVuY29kZWQgYmxvYlxuZnVuY3Rpb24gX2RlY29kZUJsb2IoZW5jb2RlZEJsb2IpIHtcbiAgICB2YXIgYXJyYXlCdWZmID0gX2JpblN0cmluZ1RvQXJyYXlCdWZmZXIoYXRvYihlbmNvZGVkQmxvYi5kYXRhKSk7XG4gICAgcmV0dXJuIGNyZWF0ZUJsb2IoW2FycmF5QnVmZl0sIHsgdHlwZTogZW5jb2RlZEJsb2IudHlwZSB9KTtcbn1cblxuLy8gaXMgdGhpcyBvbmUgb2Ygb3VyIGZhbmN5IGVuY29kZWQgYmxvYnM/XG5mdW5jdGlvbiBfaXNFbmNvZGVkQmxvYih2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSAmJiB2YWx1ZS5fX2xvY2FsX2ZvcmFnZV9lbmNvZGVkX2Jsb2I7XG59XG5cbi8vIFNwZWNpYWxpemUgdGhlIGRlZmF1bHQgYHJlYWR5KClgIGZ1bmN0aW9uIGJ5IG1ha2luZyBpdCBkZXBlbmRlbnRcbi8vIG9uIHRoZSBjdXJyZW50IGRhdGFiYXNlIG9wZXJhdGlvbnMuIFRodXMsIHRoZSBkcml2ZXIgd2lsbCBiZSBhY3R1YWxseVxuLy8gcmVhZHkgd2hlbiBpdCdzIGJlZW4gaW5pdGlhbGl6ZWQgKGRlZmF1bHQpICphbmQqIHRoZXJlIGFyZSBubyBwZW5kaW5nXG4vLyBvcGVyYXRpb25zIG9uIHRoZSBkYXRhYmFzZSAoaW5pdGlhdGVkIGJ5IHNvbWUgb3RoZXIgaW5zdGFuY2VzKS5cbmZ1bmN0aW9uIF9mdWxseVJlYWR5KGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHByb21pc2UgPSBzZWxmLl9pbml0UmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGRiQ29udGV4dCA9IGRiQ29udGV4dHNbc2VsZi5fZGJJbmZvLm5hbWVdO1xuXG4gICAgICAgIGlmIChkYkNvbnRleHQgJiYgZGJDb250ZXh0LmRiUmVhZHkpIHtcbiAgICAgICAgICAgIHJldHVybiBkYkNvbnRleHQuZGJSZWFkeTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZXhlY3V0ZVR3b0NhbGxiYWNrcyhwcm9taXNlLCBjYWxsYmFjaywgY2FsbGJhY2spO1xuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG4vLyBUcnkgdG8gZXN0YWJsaXNoIGEgbmV3IGRiIGNvbm5lY3Rpb24gdG8gcmVwbGFjZSB0aGVcbi8vIGN1cnJlbnQgb25lIHdoaWNoIGlzIGJyb2tlbiAoaS5lLiBleHBlcmllbmNpbmdcbi8vIEludmFsaWRTdGF0ZUVycm9yIHdoaWxlIGNyZWF0aW5nIGEgdHJhbnNhY3Rpb24pLlxuZnVuY3Rpb24gX3RyeVJlY29ubmVjdChkYkluZm8pIHtcbiAgICBfZGVmZXJSZWFkaW5lc3MoZGJJbmZvKTtcblxuICAgIHZhciBkYkNvbnRleHQgPSBkYkNvbnRleHRzW2RiSW5mby5uYW1lXTtcbiAgICB2YXIgZm9yYWdlcyA9IGRiQ29udGV4dC5mb3JhZ2VzO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmb3JhZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBmb3JhZ2UgPSBmb3JhZ2VzW2ldO1xuICAgICAgICBpZiAoZm9yYWdlLl9kYkluZm8uZGIpIHtcbiAgICAgICAgICAgIGZvcmFnZS5fZGJJbmZvLmRiLmNsb3NlKCk7XG4gICAgICAgICAgICBmb3JhZ2UuX2RiSW5mby5kYiA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZGJJbmZvLmRiID0gbnVsbDtcblxuICAgIHJldHVybiBfZ2V0T3JpZ2luYWxDb25uZWN0aW9uKGRiSW5mbykudGhlbihmdW5jdGlvbiAoZGIpIHtcbiAgICAgICAgZGJJbmZvLmRiID0gZGI7XG4gICAgICAgIGlmIChfaXNVcGdyYWRlTmVlZGVkKGRiSW5mbykpIHtcbiAgICAgICAgICAgIC8vIFJlb3BlbiB0aGUgZGF0YWJhc2UgZm9yIHVwZ3JhZGluZy5cbiAgICAgICAgICAgIHJldHVybiBfZ2V0VXBncmFkZWRDb25uZWN0aW9uKGRiSW5mbyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRiO1xuICAgIH0pLnRoZW4oZnVuY3Rpb24gKGRiKSB7XG4gICAgICAgIC8vIHN0b3JlIHRoZSBsYXRlc3QgZGIgcmVmZXJlbmNlXG4gICAgICAgIC8vIGluIGNhc2UgdGhlIGRiIHdhcyB1cGdyYWRlZFxuICAgICAgICBkYkluZm8uZGIgPSBkYkNvbnRleHQuZGIgPSBkYjtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmb3JhZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBmb3JhZ2VzW2ldLl9kYkluZm8uZGIgPSBkYjtcbiAgICAgICAgfVxuICAgIH0pW1wiY2F0Y2hcIl0oZnVuY3Rpb24gKGVycikge1xuICAgICAgICBfcmVqZWN0UmVhZGluZXNzKGRiSW5mbywgZXJyKTtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgIH0pO1xufVxuXG4vLyBGRiBkb2Vzbid0IGxpa2UgUHJvbWlzZXMgKG1pY3JvLXRhc2tzKSBhbmQgSUREQiBzdG9yZSBvcGVyYXRpb25zLFxuLy8gc28gd2UgaGF2ZSB0byBkbyBpdCB3aXRoIGNhbGxiYWNrc1xuZnVuY3Rpb24gY3JlYXRlVHJhbnNhY3Rpb24oZGJJbmZvLCBtb2RlLCBjYWxsYmFjaywgcmV0cmllcykge1xuICAgIGlmIChyZXRyaWVzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0cmllcyA9IDE7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgICAgdmFyIHR4ID0gZGJJbmZvLmRiLnRyYW5zYWN0aW9uKGRiSW5mby5zdG9yZU5hbWUsIG1vZGUpO1xuICAgICAgICBjYWxsYmFjayhudWxsLCB0eCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGlmIChyZXRyaWVzID4gMCAmJiAoIWRiSW5mby5kYiB8fCBlcnIubmFtZSA9PT0gJ0ludmFsaWRTdGF0ZUVycm9yJyB8fCBlcnIubmFtZSA9PT0gJ05vdEZvdW5kRXJyb3InKSkge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UkMS5yZXNvbHZlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFkYkluZm8uZGIgfHwgZXJyLm5hbWUgPT09ICdOb3RGb3VuZEVycm9yJyAmJiAhZGJJbmZvLmRiLm9iamVjdFN0b3JlTmFtZXMuY29udGFpbnMoZGJJbmZvLnN0b3JlTmFtZSkgJiYgZGJJbmZvLnZlcnNpb24gPD0gZGJJbmZvLmRiLnZlcnNpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaW5jcmVhc2UgdGhlIGRiIHZlcnNpb24sIHRvIGNyZWF0ZSB0aGUgbmV3IE9iamVjdFN0b3JlXG4gICAgICAgICAgICAgICAgICAgIGlmIChkYkluZm8uZGIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRiSW5mby52ZXJzaW9uID0gZGJJbmZvLmRiLnZlcnNpb24gKyAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIFJlb3BlbiB0aGUgZGF0YWJhc2UgZm9yIHVwZ3JhZGluZy5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9nZXRVcGdyYWRlZENvbm5lY3Rpb24oZGJJbmZvKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3RyeVJlY29ubmVjdChkYkluZm8pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjcmVhdGVUcmFuc2FjdGlvbihkYkluZm8sIG1vZGUsIGNhbGxiYWNrLCByZXRyaWVzIC0gMSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KVtcImNhdGNoXCJdKGNhbGxiYWNrKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVEYkNvbnRleHQoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLy8gUnVubmluZyBsb2NhbEZvcmFnZXMgc2hhcmluZyBhIGRhdGFiYXNlLlxuICAgICAgICBmb3JhZ2VzOiBbXSxcbiAgICAgICAgLy8gU2hhcmVkIGRhdGFiYXNlLlxuICAgICAgICBkYjogbnVsbCxcbiAgICAgICAgLy8gRGF0YWJhc2UgcmVhZGluZXNzIChwcm9taXNlKS5cbiAgICAgICAgZGJSZWFkeTogbnVsbCxcbiAgICAgICAgLy8gRGVmZXJyZWQgb3BlcmF0aW9ucyBvbiB0aGUgZGF0YWJhc2UuXG4gICAgICAgIGRlZmVycmVkT3BlcmF0aW9uczogW11cbiAgICB9O1xufVxuXG4vLyBPcGVuIHRoZSBJbmRleGVkREIgZGF0YWJhc2UgKGF1dG9tYXRpY2FsbHkgY3JlYXRlcyBvbmUgaWYgb25lIGRpZG4ndFxuLy8gcHJldmlvdXNseSBleGlzdCksIHVzaW5nIGFueSBvcHRpb25zIHNldCBpbiB0aGUgY29uZmlnLlxuZnVuY3Rpb24gX2luaXRTdG9yYWdlKG9wdGlvbnMpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGRiSW5mbyA9IHtcbiAgICAgICAgZGI6IG51bGxcbiAgICB9O1xuXG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgICAgZm9yICh2YXIgaSBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICBkYkluZm9baV0gPSBvcHRpb25zW2ldO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gR2V0IHRoZSBjdXJyZW50IGNvbnRleHQgb2YgdGhlIGRhdGFiYXNlO1xuICAgIHZhciBkYkNvbnRleHQgPSBkYkNvbnRleHRzW2RiSW5mby5uYW1lXTtcblxuICAgIC8vIC4uLm9yIGNyZWF0ZSBhIG5ldyBjb250ZXh0LlxuICAgIGlmICghZGJDb250ZXh0KSB7XG4gICAgICAgIGRiQ29udGV4dCA9IGNyZWF0ZURiQ29udGV4dCgpO1xuICAgICAgICAvLyBSZWdpc3RlciB0aGUgbmV3IGNvbnRleHQgaW4gdGhlIGdsb2JhbCBjb250YWluZXIuXG4gICAgICAgIGRiQ29udGV4dHNbZGJJbmZvLm5hbWVdID0gZGJDb250ZXh0O1xuICAgIH1cblxuICAgIC8vIFJlZ2lzdGVyIGl0c2VsZiBhcyBhIHJ1bm5pbmcgbG9jYWxGb3JhZ2UgaW4gdGhlIGN1cnJlbnQgY29udGV4dC5cbiAgICBkYkNvbnRleHQuZm9yYWdlcy5wdXNoKHNlbGYpO1xuXG4gICAgLy8gUmVwbGFjZSB0aGUgZGVmYXVsdCBgcmVhZHkoKWAgZnVuY3Rpb24gd2l0aCB0aGUgc3BlY2lhbGl6ZWQgb25lLlxuICAgIGlmICghc2VsZi5faW5pdFJlYWR5KSB7XG4gICAgICAgIHNlbGYuX2luaXRSZWFkeSA9IHNlbGYucmVhZHk7XG4gICAgICAgIHNlbGYucmVhZHkgPSBfZnVsbHlSZWFkeTtcbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgYW4gYXJyYXkgb2YgaW5pdGlhbGl6YXRpb24gc3RhdGVzIG9mIHRoZSByZWxhdGVkIGxvY2FsRm9yYWdlcy5cbiAgICB2YXIgaW5pdFByb21pc2VzID0gW107XG5cbiAgICBmdW5jdGlvbiBpZ25vcmVFcnJvcnMoKSB7XG4gICAgICAgIC8vIERvbid0IGhhbmRsZSBlcnJvcnMgaGVyZSxcbiAgICAgICAgLy8ganVzdCBtYWtlcyBzdXJlIHJlbGF0ZWQgbG9jYWxGb3JhZ2VzIGFyZW4ndCBwZW5kaW5nLlxuICAgICAgICByZXR1cm4gUHJvbWlzZSQxLnJlc29sdmUoKTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IGRiQ29udGV4dC5mb3JhZ2VzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHZhciBmb3JhZ2UgPSBkYkNvbnRleHQuZm9yYWdlc1tqXTtcbiAgICAgICAgaWYgKGZvcmFnZSAhPT0gc2VsZikge1xuICAgICAgICAgICAgLy8gRG9uJ3Qgd2FpdCBmb3IgaXRzZWxmLi4uXG4gICAgICAgICAgICBpbml0UHJvbWlzZXMucHVzaChmb3JhZ2UuX2luaXRSZWFkeSgpW1wiY2F0Y2hcIl0oaWdub3JlRXJyb3JzKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUYWtlIGEgc25hcHNob3Qgb2YgdGhlIHJlbGF0ZWQgbG9jYWxGb3JhZ2VzLlxuICAgIHZhciBmb3JhZ2VzID0gZGJDb250ZXh0LmZvcmFnZXMuc2xpY2UoMCk7XG5cbiAgICAvLyBJbml0aWFsaXplIHRoZSBjb25uZWN0aW9uIHByb2Nlc3Mgb25seSB3aGVuXG4gICAgLy8gYWxsIHRoZSByZWxhdGVkIGxvY2FsRm9yYWdlcyBhcmVuJ3QgcGVuZGluZy5cbiAgICByZXR1cm4gUHJvbWlzZSQxLmFsbChpbml0UHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICBkYkluZm8uZGIgPSBkYkNvbnRleHQuZGI7XG4gICAgICAgIC8vIEdldCB0aGUgY29ubmVjdGlvbiBvciBvcGVuIGEgbmV3IG9uZSB3aXRob3V0IHVwZ3JhZGUuXG4gICAgICAgIHJldHVybiBfZ2V0T3JpZ2luYWxDb25uZWN0aW9uKGRiSW5mbyk7XG4gICAgfSkudGhlbihmdW5jdGlvbiAoZGIpIHtcbiAgICAgICAgZGJJbmZvLmRiID0gZGI7XG4gICAgICAgIGlmIChfaXNVcGdyYWRlTmVlZGVkKGRiSW5mbywgc2VsZi5fZGVmYXVsdENvbmZpZy52ZXJzaW9uKSkge1xuICAgICAgICAgICAgLy8gUmVvcGVuIHRoZSBkYXRhYmFzZSBmb3IgdXBncmFkaW5nLlxuICAgICAgICAgICAgcmV0dXJuIF9nZXRVcGdyYWRlZENvbm5lY3Rpb24oZGJJbmZvKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGI7XG4gICAgfSkudGhlbihmdW5jdGlvbiAoZGIpIHtcbiAgICAgICAgZGJJbmZvLmRiID0gZGJDb250ZXh0LmRiID0gZGI7XG4gICAgICAgIHNlbGYuX2RiSW5mbyA9IGRiSW5mbztcbiAgICAgICAgLy8gU2hhcmUgdGhlIGZpbmFsIGNvbm5lY3Rpb24gYW1vbmdzdCByZWxhdGVkIGxvY2FsRm9yYWdlcy5cbiAgICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCBmb3JhZ2VzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICB2YXIgZm9yYWdlID0gZm9yYWdlc1trXTtcbiAgICAgICAgICAgIGlmIChmb3JhZ2UgIT09IHNlbGYpIHtcbiAgICAgICAgICAgICAgICAvLyBTZWxmIGlzIGFscmVhZHkgdXAtdG8tZGF0ZS5cbiAgICAgICAgICAgICAgICBmb3JhZ2UuX2RiSW5mby5kYiA9IGRiSW5mby5kYjtcbiAgICAgICAgICAgICAgICBmb3JhZ2UuX2RiSW5mby52ZXJzaW9uID0gZGJJbmZvLnZlcnNpb247XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0SXRlbShrZXksIGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAga2V5ID0gbm9ybWFsaXplS2V5KGtleSk7XG5cbiAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjcmVhdGVUcmFuc2FjdGlvbihzZWxmLl9kYkluZm8sIFJFQURfT05MWSwgZnVuY3Rpb24gKGVyciwgdHJhbnNhY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZShzZWxmLl9kYkluZm8uc3RvcmVOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlcSA9IHN0b3JlLmdldChrZXkpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJlcS5vbnN1Y2Nlc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSByZXEucmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX2lzRW5jb2RlZEJsb2IodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBfZGVjb2RlQmxvYih2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICByZXEub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChyZXEuZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVtcImNhdGNoXCJdKHJlamVjdCk7XG4gICAgfSk7XG5cbiAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG4vLyBJdGVyYXRlIG92ZXIgYWxsIGl0ZW1zIHN0b3JlZCBpbiBkYXRhYmFzZS5cbmZ1bmN0aW9uIGl0ZXJhdGUoaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSQxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY3JlYXRlVHJhbnNhY3Rpb24oc2VsZi5fZGJJbmZvLCBSRUFEX09OTFksIGZ1bmN0aW9uIChlcnIsIHRyYW5zYWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0b3JlID0gdHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUoc2VsZi5fZGJJbmZvLnN0b3JlTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXEgPSBzdG9yZS5vcGVuQ3Vyc29yKCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpdGVyYXRpb25OdW1iZXIgPSAxO1xuXG4gICAgICAgICAgICAgICAgICAgIHJlcS5vbnN1Y2Nlc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3Vyc29yID0gcmVxLnJlc3VsdDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnNvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IGN1cnNvci52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoX2lzRW5jb2RlZEJsb2IodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gX2RlY29kZUJsb2IodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gaXRlcmF0b3IodmFsdWUsIGN1cnNvci5rZXksIGl0ZXJhdGlvbk51bWJlcisrKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdoZW4gdGhlIGl0ZXJhdG9yIGNhbGxiYWNrIHJldHVucyBhbnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAobm9uLWB1bmRlZmluZWRgKSB2YWx1ZSwgdGhlbiB3ZSBzdG9wXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIGl0ZXJhdGlvbiBpbW1lZGlhdGVseVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgIT09IHZvaWQgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yW1wiY29udGludWVcIl0oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICByZXEub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChyZXEuZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVtcImNhdGNoXCJdKHJlamVjdCk7XG4gICAgfSk7XG5cbiAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cbmZ1bmN0aW9uIHNldEl0ZW0oa2V5LCB2YWx1ZSwgY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBrZXkgPSBub3JtYWxpemVLZXkoa2V5KTtcblxuICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UkMShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHZhciBkYkluZm87XG4gICAgICAgIHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGRiSW5mbyA9IHNlbGYuX2RiSW5mbztcbiAgICAgICAgICAgIGlmICh0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgQmxvYl0nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9jaGVja0Jsb2JTdXBwb3J0KGRiSW5mby5kYikudGhlbihmdW5jdGlvbiAoYmxvYlN1cHBvcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJsb2JTdXBwb3J0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9lbmNvZGVCbG9iKHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGNyZWF0ZVRyYW5zYWN0aW9uKHNlbGYuX2RiSW5mbywgUkVBRF9XUklURSwgZnVuY3Rpb24gKGVyciwgdHJhbnNhY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZShzZWxmLl9kYkluZm8uc3RvcmVOYW1lKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgcmVhc29uIHdlIGRvbid0IF9zYXZlXyBudWxsIGlzIGJlY2F1c2UgSUUgMTAgZG9lc1xuICAgICAgICAgICAgICAgICAgICAvLyBub3Qgc3VwcG9ydCBzYXZpbmcgdGhlIGBudWxsYCB0eXBlIGluIEluZGV4ZWREQi4gSG93XG4gICAgICAgICAgICAgICAgICAgIC8vIGlyb25pYywgZ2l2ZW4gdGhlIGJ1ZyBiZWxvdyFcbiAgICAgICAgICAgICAgICAgICAgLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS9sb2NhbEZvcmFnZS9pc3N1ZXMvMTYxXG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVxID0gc3RvcmUucHV0KHZhbHVlLCBrZXkpO1xuXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uLm9uY29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDYXN0IHRvIHVuZGVmaW5lZCBzbyB0aGUgdmFsdWUgcGFzc2VkIHRvXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjYWxsYmFjay9wcm9taXNlIGlzIHRoZSBzYW1lIGFzIHdoYXQgb25lIHdvdWxkIGdldCBvdXRcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9mIGBnZXRJdGVtKClgIGxhdGVyLiBUaGlzIGxlYWRzIHRvIHNvbWUgd2VpcmRuZXNzXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAoc2V0SXRlbSgnZm9vJywgdW5kZWZpbmVkKSB3aWxsIHJldHVybiBgbnVsbGApLCBidXRcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGl0J3Mgbm90IG15IGZhdWx0IGxvY2FsU3RvcmFnZSBpcyBvdXIgYmFzZWxpbmUgYW5kIHRoYXRcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGl0J3Mgd2VpcmQuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uLm9uYWJvcnQgPSB0cmFuc2FjdGlvbi5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVyciA9IHJlcS5lcnJvciA/IHJlcS5lcnJvciA6IHJlcS50cmFuc2FjdGlvbi5lcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVtcImNhdGNoXCJdKHJlamVjdCk7XG4gICAgfSk7XG5cbiAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG5mdW5jdGlvbiByZW1vdmVJdGVtKGtleSwgY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBrZXkgPSBub3JtYWxpemVLZXkoa2V5KTtcblxuICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UkMShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNyZWF0ZVRyYW5zYWN0aW9uKHNlbGYuX2RiSW5mbywgUkVBRF9XUklURSwgZnVuY3Rpb24gKGVyciwgdHJhbnNhY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZShzZWxmLl9kYkluZm8uc3RvcmVOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gV2UgdXNlIGEgR3J1bnQgdGFzayB0byBtYWtlIHRoaXMgc2FmZSBmb3IgSUUgYW5kIHNvbWVcbiAgICAgICAgICAgICAgICAgICAgLy8gdmVyc2lvbnMgb2YgQW5kcm9pZCAoaW5jbHVkaW5nIHRob3NlIHVzZWQgYnkgQ29yZG92YSkuXG4gICAgICAgICAgICAgICAgICAgIC8vIE5vcm1hbGx5IElFIHdvbid0IGxpa2UgYC5kZWxldGUoKWAgYW5kIHdpbGwgaW5zaXN0IG9uXG4gICAgICAgICAgICAgICAgICAgIC8vIHVzaW5nIGBbJ2RlbGV0ZSddKClgLCBidXQgd2UgaGF2ZSBhIGJ1aWxkIHN0ZXAgdGhhdFxuICAgICAgICAgICAgICAgICAgICAvLyBmaXhlcyB0aGlzIGZvciB1cyBub3cuXG4gICAgICAgICAgICAgICAgICAgIHZhciByZXEgPSBzdG9yZVtcImRlbGV0ZVwiXShrZXkpO1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbi5vbmNvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uLm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QocmVxLmVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgcmVxdWVzdCB3aWxsIGJlIGFsc28gYmUgYWJvcnRlZCBpZiB3ZSd2ZSBleGNlZWRlZCBvdXIgc3RvcmFnZVxuICAgICAgICAgICAgICAgICAgICAvLyBzcGFjZS5cbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb24ub25hYm9ydCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlcnIgPSByZXEuZXJyb3IgPyByZXEuZXJyb3IgOiByZXEudHJhbnNhY3Rpb24uZXJyb3I7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlbXCJjYXRjaFwiXShyZWplY3QpO1xuICAgIH0pO1xuXG4gICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuZnVuY3Rpb24gY2xlYXIoY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjcmVhdGVUcmFuc2FjdGlvbihzZWxmLl9kYkluZm8sIFJFQURfV1JJVEUsIGZ1bmN0aW9uIChlcnIsIHRyYW5zYWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0b3JlID0gdHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUoc2VsZi5fZGJJbmZvLnN0b3JlTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXEgPSBzdG9yZS5jbGVhcigpO1xuXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uLm9uY29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb24ub25hYm9ydCA9IHRyYW5zYWN0aW9uLm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZXJyID0gcmVxLmVycm9yID8gcmVxLmVycm9yIDogcmVxLnRyYW5zYWN0aW9uLmVycm9yO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pW1wiY2F0Y2hcIl0ocmVqZWN0KTtcbiAgICB9KTtcblxuICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cbmZ1bmN0aW9uIGxlbmd0aChjYWxsYmFjaykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UkMShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNyZWF0ZVRyYW5zYWN0aW9uKHNlbGYuX2RiSW5mbywgUkVBRF9PTkxZLCBmdW5jdGlvbiAoZXJyLCB0cmFuc2FjdGlvbikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdG9yZSA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKHNlbGYuX2RiSW5mby5zdG9yZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVxID0gc3RvcmUuY291bnQoKTtcblxuICAgICAgICAgICAgICAgICAgICByZXEub25zdWNjZXNzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXEucmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICByZXEub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChyZXEuZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVtcImNhdGNoXCJdKHJlamVjdCk7XG4gICAgfSk7XG5cbiAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG5mdW5jdGlvbiBrZXkobiwgY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBpZiAobiA8IDApIHtcbiAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNyZWF0ZVRyYW5zYWN0aW9uKHNlbGYuX2RiSW5mbywgUkVBRF9PTkxZLCBmdW5jdGlvbiAoZXJyLCB0cmFuc2FjdGlvbikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdG9yZSA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKHNlbGYuX2RiSW5mby5zdG9yZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgYWR2YW5jZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlcSA9IHN0b3JlLm9wZW5DdXJzb3IoKTtcblxuICAgICAgICAgICAgICAgICAgICByZXEub25zdWNjZXNzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnNvciA9IHJlcS5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWN1cnNvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgbWVhbnMgdGhlcmUgd2VyZW4ndCBlbm91Z2gga2V5c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2UgaGF2ZSB0aGUgZmlyc3Qga2V5LCByZXR1cm4gaXQgaWYgdGhhdCdzIHdoYXQgdGhleVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdhbnRlZC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGN1cnNvci5rZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWFkdmFuY2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE90aGVyd2lzZSwgYXNrIHRoZSBjdXJzb3IgdG8gc2tpcCBhaGVhZCBuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlY29yZHMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkdmFuY2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yLmFkdmFuY2Uobik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2hlbiB3ZSBnZXQgaGVyZSwgd2UndmUgZ290IHRoZSBudGgga2V5LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGN1cnNvci5rZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICByZXEub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChyZXEuZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVtcImNhdGNoXCJdKHJlamVjdCk7XG4gICAgfSk7XG5cbiAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG5mdW5jdGlvbiBrZXlzKGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSQxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY3JlYXRlVHJhbnNhY3Rpb24oc2VsZi5fZGJJbmZvLCBSRUFEX09OTFksIGZ1bmN0aW9uIChlcnIsIHRyYW5zYWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0b3JlID0gdHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUoc2VsZi5fZGJJbmZvLnN0b3JlTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXEgPSBzdG9yZS5vcGVuQ3Vyc29yKCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXlzID0gW107XG5cbiAgICAgICAgICAgICAgICAgICAgcmVxLm9uc3VjY2VzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjdXJzb3IgPSByZXEucmVzdWx0O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWN1cnNvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoa2V5cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXlzLnB1c2goY3Vyc29yLmtleSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJzb3JbXCJjb250aW51ZVwiXSgpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHJlcS5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHJlcS5lcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pW1wiY2F0Y2hcIl0ocmVqZWN0KTtcbiAgICB9KTtcblxuICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cbmZ1bmN0aW9uIGRyb3BJbnN0YW5jZShvcHRpb25zLCBjYWxsYmFjaykge1xuICAgIGNhbGxiYWNrID0gZ2V0Q2FsbGJhY2suYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIHZhciBjdXJyZW50Q29uZmlnID0gdGhpcy5jb25maWcoKTtcbiAgICBvcHRpb25zID0gdHlwZW9mIG9wdGlvbnMgIT09ICdmdW5jdGlvbicgJiYgb3B0aW9ucyB8fCB7fTtcbiAgICBpZiAoIW9wdGlvbnMubmFtZSkge1xuICAgICAgICBvcHRpb25zLm5hbWUgPSBvcHRpb25zLm5hbWUgfHwgY3VycmVudENvbmZpZy5uYW1lO1xuICAgICAgICBvcHRpb25zLnN0b3JlTmFtZSA9IG9wdGlvbnMuc3RvcmVOYW1lIHx8IGN1cnJlbnRDb25maWcuc3RvcmVOYW1lO1xuICAgIH1cblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgcHJvbWlzZTtcbiAgICBpZiAoIW9wdGlvbnMubmFtZSkge1xuICAgICAgICBwcm9taXNlID0gUHJvbWlzZSQxLnJlamVjdCgnSW52YWxpZCBhcmd1bWVudHMnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgaXNDdXJyZW50RGIgPSBvcHRpb25zLm5hbWUgPT09IGN1cnJlbnRDb25maWcubmFtZSAmJiBzZWxmLl9kYkluZm8uZGI7XG5cbiAgICAgICAgdmFyIGRiUHJvbWlzZSA9IGlzQ3VycmVudERiID8gUHJvbWlzZSQxLnJlc29sdmUoc2VsZi5fZGJJbmZvLmRiKSA6IF9nZXRPcmlnaW5hbENvbm5lY3Rpb24ob3B0aW9ucykudGhlbihmdW5jdGlvbiAoZGIpIHtcbiAgICAgICAgICAgIHZhciBkYkNvbnRleHQgPSBkYkNvbnRleHRzW29wdGlvbnMubmFtZV07XG4gICAgICAgICAgICB2YXIgZm9yYWdlcyA9IGRiQ29udGV4dC5mb3JhZ2VzO1xuICAgICAgICAgICAgZGJDb250ZXh0LmRiID0gZGI7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZvcmFnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBmb3JhZ2VzW2ldLl9kYkluZm8uZGIgPSBkYjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBkYjtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKCFvcHRpb25zLnN0b3JlTmFtZSkge1xuICAgICAgICAgICAgcHJvbWlzZSA9IGRiUHJvbWlzZS50aGVuKGZ1bmN0aW9uIChkYikge1xuICAgICAgICAgICAgICAgIF9kZWZlclJlYWRpbmVzcyhvcHRpb25zKTtcblxuICAgICAgICAgICAgICAgIHZhciBkYkNvbnRleHQgPSBkYkNvbnRleHRzW29wdGlvbnMubmFtZV07XG4gICAgICAgICAgICAgICAgdmFyIGZvcmFnZXMgPSBkYkNvbnRleHQuZm9yYWdlcztcblxuICAgICAgICAgICAgICAgIGRiLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmb3JhZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmb3JhZ2UgPSBmb3JhZ2VzW2ldO1xuICAgICAgICAgICAgICAgICAgICBmb3JhZ2UuX2RiSW5mby5kYiA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGRyb3BEQlByb21pc2UgPSBuZXcgUHJvbWlzZSQxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlcSA9IGlkYi5kZWxldGVEYXRhYmFzZShvcHRpb25zLm5hbWUpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJlcS5vbmVycm9yID0gcmVxLm9uYmxvY2tlZCA9IGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYiA9IHJlcS5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYi5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgcmVxLm9uc3VjY2VzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYiA9IHJlcS5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYi5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShkYik7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZHJvcERCUHJvbWlzZS50aGVuKGZ1bmN0aW9uIChkYikge1xuICAgICAgICAgICAgICAgICAgICBkYkNvbnRleHQuZGIgPSBkYjtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmb3JhZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgX2ZvcmFnZSA9IGZvcmFnZXNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBfYWR2YW5jZVJlYWRpbmVzcyhfZm9yYWdlLl9kYkluZm8pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlbXCJjYXRjaFwiXShmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIChfcmVqZWN0UmVhZGluZXNzKG9wdGlvbnMsIGVycikgfHwgUHJvbWlzZSQxLnJlc29sdmUoKSlbXCJjYXRjaFwiXShmdW5jdGlvbiAoKSB7fSk7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHJvbWlzZSA9IGRiUHJvbWlzZS50aGVuKGZ1bmN0aW9uIChkYikge1xuICAgICAgICAgICAgICAgIGlmICghZGIub2JqZWN0U3RvcmVOYW1lcy5jb250YWlucyhvcHRpb25zLnN0b3JlTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBuZXdWZXJzaW9uID0gZGIudmVyc2lvbiArIDE7XG5cbiAgICAgICAgICAgICAgICBfZGVmZXJSZWFkaW5lc3Mob3B0aW9ucyk7XG5cbiAgICAgICAgICAgICAgICB2YXIgZGJDb250ZXh0ID0gZGJDb250ZXh0c1tvcHRpb25zLm5hbWVdO1xuICAgICAgICAgICAgICAgIHZhciBmb3JhZ2VzID0gZGJDb250ZXh0LmZvcmFnZXM7XG5cbiAgICAgICAgICAgICAgICBkYi5jbG9zZSgpO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZm9yYWdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm9yYWdlID0gZm9yYWdlc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yYWdlLl9kYkluZm8uZGIgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBmb3JhZ2UuX2RiSW5mby52ZXJzaW9uID0gbmV3VmVyc2lvbjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgZHJvcE9iamVjdFByb21pc2UgPSBuZXcgUHJvbWlzZSQxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlcSA9IGlkYi5vcGVuKG9wdGlvbnMubmFtZSwgbmV3VmVyc2lvbik7XG5cbiAgICAgICAgICAgICAgICAgICAgcmVxLm9uZXJyb3IgPSBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGIgPSByZXEucmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICAgICAgZGIuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHJlcS5vbnVwZ3JhZGVuZWVkZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGIgPSByZXEucmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICAgICAgZGIuZGVsZXRlT2JqZWN0U3RvcmUob3B0aW9ucy5zdG9yZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHJlcS5vbnN1Y2Nlc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGIgPSByZXEucmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICAgICAgZGIuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZGIpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRyb3BPYmplY3RQcm9taXNlLnRoZW4oZnVuY3Rpb24gKGRiKSB7XG4gICAgICAgICAgICAgICAgICAgIGRiQ29udGV4dC5kYiA9IGRiO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGZvcmFnZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBfZm9yYWdlMiA9IGZvcmFnZXNbal07XG4gICAgICAgICAgICAgICAgICAgICAgICBfZm9yYWdlMi5fZGJJbmZvLmRiID0gZGI7XG4gICAgICAgICAgICAgICAgICAgICAgICBfYWR2YW5jZVJlYWRpbmVzcyhfZm9yYWdlMi5fZGJJbmZvKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pW1wiY2F0Y2hcIl0oZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAoX3JlamVjdFJlYWRpbmVzcyhvcHRpb25zLCBlcnIpIHx8IFByb21pc2UkMS5yZXNvbHZlKCkpW1wiY2F0Y2hcIl0oZnVuY3Rpb24gKCkge30pO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cbnZhciBhc3luY1N0b3JhZ2UgPSB7XG4gICAgX2RyaXZlcjogJ2FzeW5jU3RvcmFnZScsXG4gICAgX2luaXRTdG9yYWdlOiBfaW5pdFN0b3JhZ2UsXG4gICAgX3N1cHBvcnQ6IGlzSW5kZXhlZERCVmFsaWQoKSxcbiAgICBpdGVyYXRlOiBpdGVyYXRlLFxuICAgIGdldEl0ZW06IGdldEl0ZW0sXG4gICAgc2V0SXRlbTogc2V0SXRlbSxcbiAgICByZW1vdmVJdGVtOiByZW1vdmVJdGVtLFxuICAgIGNsZWFyOiBjbGVhcixcbiAgICBsZW5ndGg6IGxlbmd0aCxcbiAgICBrZXk6IGtleSxcbiAgICBrZXlzOiBrZXlzLFxuICAgIGRyb3BJbnN0YW5jZTogZHJvcEluc3RhbmNlXG59O1xuXG5mdW5jdGlvbiBpc1dlYlNRTFZhbGlkKCkge1xuICAgIHJldHVybiB0eXBlb2Ygb3BlbkRhdGFiYXNlID09PSAnZnVuY3Rpb24nO1xufVxuXG4vLyBTYWRseSwgdGhlIGJlc3Qgd2F5IHRvIHNhdmUgYmluYXJ5IGRhdGEgaW4gV2ViU1FML2xvY2FsU3RvcmFnZSBpcyBzZXJpYWxpemluZ1xuLy8gaXQgdG8gQmFzZTY0LCBzbyB0aGlzIGlzIGhvdyB3ZSBzdG9yZSBpdCB0byBwcmV2ZW50IHZlcnkgc3RyYW5nZSBlcnJvcnMgd2l0aCBsZXNzXG4vLyB2ZXJib3NlIHdheXMgb2YgYmluYXJ5IDwtPiBzdHJpbmcgZGF0YSBzdG9yYWdlLlxudmFyIEJBU0VfQ0hBUlMgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyc7XG5cbnZhciBCTE9CX1RZUEVfUFJFRklYID0gJ35+bG9jYWxfZm9yYWdlX3R5cGV+JztcbnZhciBCTE9CX1RZUEVfUFJFRklYX1JFR0VYID0gL15+fmxvY2FsX2ZvcmFnZV90eXBlfihbXn5dKyl+LztcblxudmFyIFNFUklBTElaRURfTUFSS0VSID0gJ19fbGZzY19fOic7XG52YXIgU0VSSUFMSVpFRF9NQVJLRVJfTEVOR1RIID0gU0VSSUFMSVpFRF9NQVJLRVIubGVuZ3RoO1xuXG4vLyBPTUcgdGhlIHNlcmlhbGl6YXRpb25zIVxudmFyIFRZUEVfQVJSQVlCVUZGRVIgPSAnYXJiZic7XG52YXIgVFlQRV9CTE9CID0gJ2Jsb2InO1xudmFyIFRZUEVfSU5UOEFSUkFZID0gJ3NpMDgnO1xudmFyIFRZUEVfVUlOVDhBUlJBWSA9ICd1aTA4JztcbnZhciBUWVBFX1VJTlQ4Q0xBTVBFREFSUkFZID0gJ3VpYzgnO1xudmFyIFRZUEVfSU5UMTZBUlJBWSA9ICdzaTE2JztcbnZhciBUWVBFX0lOVDMyQVJSQVkgPSAnc2kzMic7XG52YXIgVFlQRV9VSU5UMTZBUlJBWSA9ICd1cjE2JztcbnZhciBUWVBFX1VJTlQzMkFSUkFZID0gJ3VpMzInO1xudmFyIFRZUEVfRkxPQVQzMkFSUkFZID0gJ2ZsMzInO1xudmFyIFRZUEVfRkxPQVQ2NEFSUkFZID0gJ2ZsNjQnO1xudmFyIFRZUEVfU0VSSUFMSVpFRF9NQVJLRVJfTEVOR1RIID0gU0VSSUFMSVpFRF9NQVJLRVJfTEVOR1RIICsgVFlQRV9BUlJBWUJVRkZFUi5sZW5ndGg7XG5cbnZhciB0b1N0cmluZyQxID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuZnVuY3Rpb24gc3RyaW5nVG9CdWZmZXIoc2VyaWFsaXplZFN0cmluZykge1xuICAgIC8vIEZpbGwgdGhlIHN0cmluZyBpbnRvIGEgQXJyYXlCdWZmZXIuXG4gICAgdmFyIGJ1ZmZlckxlbmd0aCA9IHNlcmlhbGl6ZWRTdHJpbmcubGVuZ3RoICogMC43NTtcbiAgICB2YXIgbGVuID0gc2VyaWFsaXplZFN0cmluZy5sZW5ndGg7XG4gICAgdmFyIGk7XG4gICAgdmFyIHAgPSAwO1xuICAgIHZhciBlbmNvZGVkMSwgZW5jb2RlZDIsIGVuY29kZWQzLCBlbmNvZGVkNDtcblxuICAgIGlmIChzZXJpYWxpemVkU3RyaW5nW3NlcmlhbGl6ZWRTdHJpbmcubGVuZ3RoIC0gMV0gPT09ICc9Jykge1xuICAgICAgICBidWZmZXJMZW5ndGgtLTtcbiAgICAgICAgaWYgKHNlcmlhbGl6ZWRTdHJpbmdbc2VyaWFsaXplZFN0cmluZy5sZW5ndGggLSAyXSA9PT0gJz0nKSB7XG4gICAgICAgICAgICBidWZmZXJMZW5ndGgtLTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoYnVmZmVyTGVuZ3RoKTtcbiAgICB2YXIgYnl0ZXMgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSArPSA0KSB7XG4gICAgICAgIGVuY29kZWQxID0gQkFTRV9DSEFSUy5pbmRleE9mKHNlcmlhbGl6ZWRTdHJpbmdbaV0pO1xuICAgICAgICBlbmNvZGVkMiA9IEJBU0VfQ0hBUlMuaW5kZXhPZihzZXJpYWxpemVkU3RyaW5nW2kgKyAxXSk7XG4gICAgICAgIGVuY29kZWQzID0gQkFTRV9DSEFSUy5pbmRleE9mKHNlcmlhbGl6ZWRTdHJpbmdbaSArIDJdKTtcbiAgICAgICAgZW5jb2RlZDQgPSBCQVNFX0NIQVJTLmluZGV4T2Yoc2VyaWFsaXplZFN0cmluZ1tpICsgM10pO1xuXG4gICAgICAgIC8qanNsaW50IGJpdHdpc2U6IHRydWUgKi9cbiAgICAgICAgYnl0ZXNbcCsrXSA9IGVuY29kZWQxIDw8IDIgfCBlbmNvZGVkMiA+PiA0O1xuICAgICAgICBieXRlc1twKytdID0gKGVuY29kZWQyICYgMTUpIDw8IDQgfCBlbmNvZGVkMyA+PiAyO1xuICAgICAgICBieXRlc1twKytdID0gKGVuY29kZWQzICYgMykgPDwgNiB8IGVuY29kZWQ0ICYgNjM7XG4gICAgfVxuICAgIHJldHVybiBidWZmZXI7XG59XG5cbi8vIENvbnZlcnRzIGEgYnVmZmVyIHRvIGEgc3RyaW5nIHRvIHN0b3JlLCBzZXJpYWxpemVkLCBpbiB0aGUgYmFja2VuZFxuLy8gc3RvcmFnZSBsaWJyYXJ5LlxuZnVuY3Rpb24gYnVmZmVyVG9TdHJpbmcoYnVmZmVyKSB7XG4gICAgLy8gYmFzZTY0LWFycmF5YnVmZmVyXG4gICAgdmFyIGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICB2YXIgYmFzZTY0U3RyaW5nID0gJyc7XG4gICAgdmFyIGk7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDMpIHtcbiAgICAgICAgLypqc2xpbnQgYml0d2lzZTogdHJ1ZSAqL1xuICAgICAgICBiYXNlNjRTdHJpbmcgKz0gQkFTRV9DSEFSU1tieXRlc1tpXSA+PiAyXTtcbiAgICAgICAgYmFzZTY0U3RyaW5nICs9IEJBU0VfQ0hBUlNbKGJ5dGVzW2ldICYgMykgPDwgNCB8IGJ5dGVzW2kgKyAxXSA+PiA0XTtcbiAgICAgICAgYmFzZTY0U3RyaW5nICs9IEJBU0VfQ0hBUlNbKGJ5dGVzW2kgKyAxXSAmIDE1KSA8PCAyIHwgYnl0ZXNbaSArIDJdID4+IDZdO1xuICAgICAgICBiYXNlNjRTdHJpbmcgKz0gQkFTRV9DSEFSU1tieXRlc1tpICsgMl0gJiA2M107XG4gICAgfVxuXG4gICAgaWYgKGJ5dGVzLmxlbmd0aCAlIDMgPT09IDIpIHtcbiAgICAgICAgYmFzZTY0U3RyaW5nID0gYmFzZTY0U3RyaW5nLnN1YnN0cmluZygwLCBiYXNlNjRTdHJpbmcubGVuZ3RoIC0gMSkgKyAnPSc7XG4gICAgfSBlbHNlIGlmIChieXRlcy5sZW5ndGggJSAzID09PSAxKSB7XG4gICAgICAgIGJhc2U2NFN0cmluZyA9IGJhc2U2NFN0cmluZy5zdWJzdHJpbmcoMCwgYmFzZTY0U3RyaW5nLmxlbmd0aCAtIDIpICsgJz09JztcbiAgICB9XG5cbiAgICByZXR1cm4gYmFzZTY0U3RyaW5nO1xufVxuXG4vLyBTZXJpYWxpemUgYSB2YWx1ZSwgYWZ0ZXJ3YXJkcyBleGVjdXRpbmcgYSBjYWxsYmFjayAod2hpY2ggdXN1YWxseVxuLy8gaW5zdHJ1Y3RzIHRoZSBgc2V0SXRlbSgpYCBjYWxsYmFjay9wcm9taXNlIHRvIGJlIGV4ZWN1dGVkKS4gVGhpcyBpcyBob3dcbi8vIHdlIHN0b3JlIGJpbmFyeSBkYXRhIHdpdGggbG9jYWxTdG9yYWdlLlxuZnVuY3Rpb24gc2VyaWFsaXplKHZhbHVlLCBjYWxsYmFjaykge1xuICAgIHZhciB2YWx1ZVR5cGUgPSAnJztcbiAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgdmFsdWVUeXBlID0gdG9TdHJpbmckMS5jYWxsKHZhbHVlKTtcbiAgICB9XG5cbiAgICAvLyBDYW5ub3QgdXNlIGB2YWx1ZSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyYCBvciBzdWNoIGhlcmUsIGFzIHRoZXNlXG4gICAgLy8gY2hlY2tzIGZhaWwgd2hlbiBydW5uaW5nIHRoZSB0ZXN0cyB1c2luZyBjYXNwZXIuanMuLi5cbiAgICAvL1xuICAgIC8vIFRPRE86IFNlZSB3aHkgdGhvc2UgdGVzdHMgZmFpbCBhbmQgdXNlIGEgYmV0dGVyIHNvbHV0aW9uLlxuICAgIGlmICh2YWx1ZSAmJiAodmFsdWVUeXBlID09PSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nIHx8IHZhbHVlLmJ1ZmZlciAmJiB0b1N0cmluZyQxLmNhbGwodmFsdWUuYnVmZmVyKSA9PT0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJykpIHtcbiAgICAgICAgLy8gQ29udmVydCBiaW5hcnkgYXJyYXlzIHRvIGEgc3RyaW5nIGFuZCBwcmVmaXggdGhlIHN0cmluZyB3aXRoXG4gICAgICAgIC8vIGEgc3BlY2lhbCBtYXJrZXIuXG4gICAgICAgIHZhciBidWZmZXI7XG4gICAgICAgIHZhciBtYXJrZXIgPSBTRVJJQUxJWkVEX01BUktFUjtcblxuICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgICAgICAgICAgYnVmZmVyID0gdmFsdWU7XG4gICAgICAgICAgICBtYXJrZXIgKz0gVFlQRV9BUlJBWUJVRkZFUjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJ1ZmZlciA9IHZhbHVlLmJ1ZmZlcjtcblxuICAgICAgICAgICAgaWYgKHZhbHVlVHlwZSA9PT0gJ1tvYmplY3QgSW50OEFycmF5XScpIHtcbiAgICAgICAgICAgICAgICBtYXJrZXIgKz0gVFlQRV9JTlQ4QVJSQVk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlVHlwZSA9PT0gJ1tvYmplY3QgVWludDhBcnJheV0nKSB7XG4gICAgICAgICAgICAgICAgbWFya2VyICs9IFRZUEVfVUlOVDhBUlJBWTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWVUeXBlID09PSAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nKSB7XG4gICAgICAgICAgICAgICAgbWFya2VyICs9IFRZUEVfVUlOVDhDTEFNUEVEQVJSQVk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlVHlwZSA9PT0gJ1tvYmplY3QgSW50MTZBcnJheV0nKSB7XG4gICAgICAgICAgICAgICAgbWFya2VyICs9IFRZUEVfSU5UMTZBUlJBWTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWVUeXBlID09PSAnW29iamVjdCBVaW50MTZBcnJheV0nKSB7XG4gICAgICAgICAgICAgICAgbWFya2VyICs9IFRZUEVfVUlOVDE2QVJSQVk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlVHlwZSA9PT0gJ1tvYmplY3QgSW50MzJBcnJheV0nKSB7XG4gICAgICAgICAgICAgICAgbWFya2VyICs9IFRZUEVfSU5UMzJBUlJBWTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWVUeXBlID09PSAnW29iamVjdCBVaW50MzJBcnJheV0nKSB7XG4gICAgICAgICAgICAgICAgbWFya2VyICs9IFRZUEVfVUlOVDMyQVJSQVk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlVHlwZSA9PT0gJ1tvYmplY3QgRmxvYXQzMkFycmF5XScpIHtcbiAgICAgICAgICAgICAgICBtYXJrZXIgKz0gVFlQRV9GTE9BVDMyQVJSQVk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlVHlwZSA9PT0gJ1tvYmplY3QgRmxvYXQ2NEFycmF5XScpIHtcbiAgICAgICAgICAgICAgICBtYXJrZXIgKz0gVFlQRV9GTE9BVDY0QVJSQVk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG5ldyBFcnJvcignRmFpbGVkIHRvIGdldCB0eXBlIGZvciBCaW5hcnlBcnJheScpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNhbGxiYWNrKG1hcmtlciArIGJ1ZmZlclRvU3RyaW5nKGJ1ZmZlcikpO1xuICAgIH0gZWxzZSBpZiAodmFsdWVUeXBlID09PSAnW29iamVjdCBCbG9iXScpIHtcbiAgICAgICAgLy8gQ29udmVyIHRoZSBibG9iIHRvIGEgYmluYXJ5QXJyYXkgYW5kIHRoZW4gdG8gYSBzdHJpbmcuXG4gICAgICAgIHZhciBmaWxlUmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblxuICAgICAgICBmaWxlUmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIEJhY2t3YXJkcy1jb21wYXRpYmxlIHByZWZpeCBmb3IgdGhlIGJsb2IgdHlwZS5cbiAgICAgICAgICAgIHZhciBzdHIgPSBCTE9CX1RZUEVfUFJFRklYICsgdmFsdWUudHlwZSArICd+JyArIGJ1ZmZlclRvU3RyaW5nKHRoaXMucmVzdWx0KTtcblxuICAgICAgICAgICAgY2FsbGJhY2soU0VSSUFMSVpFRF9NQVJLRVIgKyBUWVBFX0JMT0IgKyBzdHIpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGZpbGVSZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIodmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjYWxsYmFjayhKU09OLnN0cmluZ2lmeSh2YWx1ZSkpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiQ291bGRuJ3QgY29udmVydCB2YWx1ZSBpbnRvIGEgSlNPTiBzdHJpbmc6IFwiLCB2YWx1ZSk7XG5cbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIGUpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vLyBEZXNlcmlhbGl6ZSBkYXRhIHdlJ3ZlIGluc2VydGVkIGludG8gYSB2YWx1ZSBjb2x1bW4vZmllbGQuIFdlIHBsYWNlXG4vLyBzcGVjaWFsIG1hcmtlcnMgaW50byBvdXIgc3RyaW5ncyB0byBtYXJrIHRoZW0gYXMgZW5jb2RlZDsgdGhpcyBpc24ndFxuLy8gYXMgbmljZSBhcyBhIG1ldGEgZmllbGQsIGJ1dCBpdCdzIHRoZSBvbmx5IHNhbmUgdGhpbmcgd2UgY2FuIGRvIHdoaWxzdFxuLy8ga2VlcGluZyBsb2NhbFN0b3JhZ2Ugc3VwcG9ydCBpbnRhY3QuXG4vL1xuLy8gT2Z0ZW50aW1lcyB0aGlzIHdpbGwganVzdCBkZXNlcmlhbGl6ZSBKU09OIGNvbnRlbnQsIGJ1dCBpZiB3ZSBoYXZlIGFcbi8vIHNwZWNpYWwgbWFya2VyIChTRVJJQUxJWkVEX01BUktFUiwgZGVmaW5lZCBhYm92ZSksIHdlIHdpbGwgZXh0cmFjdFxuLy8gc29tZSBraW5kIG9mIGFycmF5YnVmZmVyL2JpbmFyeSBkYXRhL3R5cGVkIGFycmF5IG91dCBvZiB0aGUgc3RyaW5nLlxuZnVuY3Rpb24gZGVzZXJpYWxpemUodmFsdWUpIHtcbiAgICAvLyBJZiB3ZSBoYXZlbid0IG1hcmtlZCB0aGlzIHN0cmluZyBhcyBiZWluZyBzcGVjaWFsbHkgc2VyaWFsaXplZCAoaS5lLlxuICAgIC8vIHNvbWV0aGluZyBvdGhlciB0aGFuIHNlcmlhbGl6ZWQgSlNPTiksIHdlIGNhbiBqdXN0IHJldHVybiBpdCBhbmQgYmVcbiAgICAvLyBkb25lIHdpdGggaXQuXG4gICAgaWYgKHZhbHVlLnN1YnN0cmluZygwLCBTRVJJQUxJWkVEX01BUktFUl9MRU5HVEgpICE9PSBTRVJJQUxJWkVEX01BUktFUikge1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgfVxuXG4gICAgLy8gVGhlIGZvbGxvd2luZyBjb2RlIGRlYWxzIHdpdGggZGVzZXJpYWxpemluZyBzb21lIGtpbmQgb2YgQmxvYiBvclxuICAgIC8vIFR5cGVkQXJyYXkuIEZpcnN0IHdlIHNlcGFyYXRlIG91dCB0aGUgdHlwZSBvZiBkYXRhIHdlJ3JlIGRlYWxpbmdcbiAgICAvLyB3aXRoIGZyb20gdGhlIGRhdGEgaXRzZWxmLlxuICAgIHZhciBzZXJpYWxpemVkU3RyaW5nID0gdmFsdWUuc3Vic3RyaW5nKFRZUEVfU0VSSUFMSVpFRF9NQVJLRVJfTEVOR1RIKTtcbiAgICB2YXIgdHlwZSA9IHZhbHVlLnN1YnN0cmluZyhTRVJJQUxJWkVEX01BUktFUl9MRU5HVEgsIFRZUEVfU0VSSUFMSVpFRF9NQVJLRVJfTEVOR1RIKTtcblxuICAgIHZhciBibG9iVHlwZTtcbiAgICAvLyBCYWNrd2FyZHMtY29tcGF0aWJsZSBibG9iIHR5cGUgc2VyaWFsaXphdGlvbiBzdHJhdGVneS5cbiAgICAvLyBEQnMgY3JlYXRlZCB3aXRoIG9sZGVyIHZlcnNpb25zIG9mIGxvY2FsRm9yYWdlIHdpbGwgc2ltcGx5IG5vdCBoYXZlIHRoZSBibG9iIHR5cGUuXG4gICAgaWYgKHR5cGUgPT09IFRZUEVfQkxPQiAmJiBCTE9CX1RZUEVfUFJFRklYX1JFR0VYLnRlc3Qoc2VyaWFsaXplZFN0cmluZykpIHtcbiAgICAgICAgdmFyIG1hdGNoZXIgPSBzZXJpYWxpemVkU3RyaW5nLm1hdGNoKEJMT0JfVFlQRV9QUkVGSVhfUkVHRVgpO1xuICAgICAgICBibG9iVHlwZSA9IG1hdGNoZXJbMV07XG4gICAgICAgIHNlcmlhbGl6ZWRTdHJpbmcgPSBzZXJpYWxpemVkU3RyaW5nLnN1YnN0cmluZyhtYXRjaGVyWzBdLmxlbmd0aCk7XG4gICAgfVxuICAgIHZhciBidWZmZXIgPSBzdHJpbmdUb0J1ZmZlcihzZXJpYWxpemVkU3RyaW5nKTtcblxuICAgIC8vIFJldHVybiB0aGUgcmlnaHQgdHlwZSBiYXNlZCBvbiB0aGUgY29kZS90eXBlIHNldCBkdXJpbmdcbiAgICAvLyBzZXJpYWxpemF0aW9uLlxuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlIFRZUEVfQVJSQVlCVUZGRVI6XG4gICAgICAgICAgICByZXR1cm4gYnVmZmVyO1xuICAgICAgICBjYXNlIFRZUEVfQkxPQjpcbiAgICAgICAgICAgIHJldHVybiBjcmVhdGVCbG9iKFtidWZmZXJdLCB7IHR5cGU6IGJsb2JUeXBlIH0pO1xuICAgICAgICBjYXNlIFRZUEVfSU5UOEFSUkFZOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBJbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICAgICAgY2FzZSBUWVBFX1VJTlQ4QVJSQVk6XG4gICAgICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICAgICAgY2FzZSBUWVBFX1VJTlQ4Q0xBTVBFREFSUkFZOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBVaW50OENsYW1wZWRBcnJheShidWZmZXIpO1xuICAgICAgICBjYXNlIFRZUEVfSU5UMTZBUlJBWTpcbiAgICAgICAgICAgIHJldHVybiBuZXcgSW50MTZBcnJheShidWZmZXIpO1xuICAgICAgICBjYXNlIFRZUEVfVUlOVDE2QVJSQVk6XG4gICAgICAgICAgICByZXR1cm4gbmV3IFVpbnQxNkFycmF5KGJ1ZmZlcik7XG4gICAgICAgIGNhc2UgVFlQRV9JTlQzMkFSUkFZOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBJbnQzMkFycmF5KGJ1ZmZlcik7XG4gICAgICAgIGNhc2UgVFlQRV9VSU5UMzJBUlJBWTpcbiAgICAgICAgICAgIHJldHVybiBuZXcgVWludDMyQXJyYXkoYnVmZmVyKTtcbiAgICAgICAgY2FzZSBUWVBFX0ZMT0FUMzJBUlJBWTpcbiAgICAgICAgICAgIHJldHVybiBuZXcgRmxvYXQzMkFycmF5KGJ1ZmZlcik7XG4gICAgICAgIGNhc2UgVFlQRV9GTE9BVDY0QVJSQVk6XG4gICAgICAgICAgICByZXR1cm4gbmV3IEZsb2F0NjRBcnJheShidWZmZXIpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtvd24gdHlwZTogJyArIHR5cGUpO1xuICAgIH1cbn1cblxudmFyIGxvY2FsZm9yYWdlU2VyaWFsaXplciA9IHtcbiAgICBzZXJpYWxpemU6IHNlcmlhbGl6ZSxcbiAgICBkZXNlcmlhbGl6ZTogZGVzZXJpYWxpemUsXG4gICAgc3RyaW5nVG9CdWZmZXI6IHN0cmluZ1RvQnVmZmVyLFxuICAgIGJ1ZmZlclRvU3RyaW5nOiBidWZmZXJUb1N0cmluZ1xufTtcblxuLypcbiAqIEluY2x1ZGVzIGNvZGUgZnJvbTpcbiAqXG4gKiBiYXNlNjQtYXJyYXlidWZmZXJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9uaWtsYXN2aC9iYXNlNjQtYXJyYXlidWZmZXJcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTIgTmlrbGFzIHZvbiBIZXJ0emVuXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4gKi9cblxuZnVuY3Rpb24gY3JlYXRlRGJUYWJsZSh0LCBkYkluZm8sIGNhbGxiYWNrLCBlcnJvckNhbGxiYWNrKSB7XG4gICAgdC5leGVjdXRlU3FsKCdDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyAnICsgZGJJbmZvLnN0b3JlTmFtZSArICcgJyArICcoaWQgSU5URUdFUiBQUklNQVJZIEtFWSwga2V5IHVuaXF1ZSwgdmFsdWUpJywgW10sIGNhbGxiYWNrLCBlcnJvckNhbGxiYWNrKTtcbn1cblxuLy8gT3BlbiB0aGUgV2ViU1FMIGRhdGFiYXNlIChhdXRvbWF0aWNhbGx5IGNyZWF0ZXMgb25lIGlmIG9uZSBkaWRuJ3Rcbi8vIHByZXZpb3VzbHkgZXhpc3QpLCB1c2luZyBhbnkgb3B0aW9ucyBzZXQgaW4gdGhlIGNvbmZpZy5cbmZ1bmN0aW9uIF9pbml0U3RvcmFnZSQxKG9wdGlvbnMpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGRiSW5mbyA9IHtcbiAgICAgICAgZGI6IG51bGxcbiAgICB9O1xuXG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgICAgZm9yICh2YXIgaSBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICBkYkluZm9baV0gPSB0eXBlb2Ygb3B0aW9uc1tpXSAhPT0gJ3N0cmluZycgPyBvcHRpb25zW2ldLnRvU3RyaW5nKCkgOiBvcHRpb25zW2ldO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGRiSW5mb1Byb21pc2UgPSBuZXcgUHJvbWlzZSQxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgLy8gT3BlbiB0aGUgZGF0YWJhc2U7IHRoZSBvcGVuRGF0YWJhc2UgQVBJIHdpbGwgYXV0b21hdGljYWxseVxuICAgICAgICAvLyBjcmVhdGUgaXQgZm9yIHVzIGlmIGl0IGRvZXNuJ3QgZXhpc3QuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBkYkluZm8uZGIgPSBvcGVuRGF0YWJhc2UoZGJJbmZvLm5hbWUsIFN0cmluZyhkYkluZm8udmVyc2lvbiksIGRiSW5mby5kZXNjcmlwdGlvbiwgZGJJbmZvLnNpemUpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ3JlYXRlIG91ciBrZXkvdmFsdWUgdGFibGUgaWYgaXQgZG9lc24ndCBleGlzdC5cbiAgICAgICAgZGJJbmZvLmRiLnRyYW5zYWN0aW9uKGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICBjcmVhdGVEYlRhYmxlKHQsIGRiSW5mbywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNlbGYuX2RiSW5mbyA9IGRiSW5mbztcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAodCwgZXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIHJlamVjdCk7XG4gICAgfSk7XG5cbiAgICBkYkluZm8uc2VyaWFsaXplciA9IGxvY2FsZm9yYWdlU2VyaWFsaXplcjtcbiAgICByZXR1cm4gZGJJbmZvUHJvbWlzZTtcbn1cblxuZnVuY3Rpb24gdHJ5RXhlY3V0ZVNxbCh0LCBkYkluZm8sIHNxbFN0YXRlbWVudCwgYXJncywgY2FsbGJhY2ssIGVycm9yQ2FsbGJhY2spIHtcbiAgICB0LmV4ZWN1dGVTcWwoc3FsU3RhdGVtZW50LCBhcmdzLCBjYWxsYmFjaywgZnVuY3Rpb24gKHQsIGVycm9yKSB7XG4gICAgICAgIGlmIChlcnJvci5jb2RlID09PSBlcnJvci5TWU5UQVhfRVJSKSB7XG4gICAgICAgICAgICB0LmV4ZWN1dGVTcWwoJ1NFTEVDVCBuYW1lIEZST00gc3FsaXRlX21hc3RlciAnICsgXCJXSEVSRSB0eXBlPSd0YWJsZScgQU5EIG5hbWUgPSA/XCIsIFtuYW1lXSwgZnVuY3Rpb24gKHQsIHJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdHMucm93cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlIHRhYmxlIGlzIG1pc3NpbmcgKHdhcyBkZWxldGVkKVxuICAgICAgICAgICAgICAgICAgICAvLyByZS1jcmVhdGUgaXQgdGFibGUgYW5kIHJldHJ5XG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZURiVGFibGUodCwgZGJJbmZvLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0LmV4ZWN1dGVTcWwoc3FsU3RhdGVtZW50LCBhcmdzLCBjYWxsYmFjaywgZXJyb3JDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgICAgIH0sIGVycm9yQ2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yQ2FsbGJhY2sodCwgZXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIGVycm9yQ2FsbGJhY2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXJyb3JDYWxsYmFjayh0LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9LCBlcnJvckNhbGxiYWNrKTtcbn1cblxuZnVuY3Rpb24gZ2V0SXRlbSQxKGtleSwgY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBrZXkgPSBub3JtYWxpemVLZXkoa2V5KTtcblxuICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UkMShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBkYkluZm8gPSBzZWxmLl9kYkluZm87XG4gICAgICAgICAgICBkYkluZm8uZGIudHJhbnNhY3Rpb24oZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgICAgICB0cnlFeGVjdXRlU3FsKHQsIGRiSW5mbywgJ1NFTEVDVCAqIEZST00gJyArIGRiSW5mby5zdG9yZU5hbWUgKyAnIFdIRVJFIGtleSA9ID8gTElNSVQgMScsIFtrZXldLCBmdW5jdGlvbiAodCwgcmVzdWx0cykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gcmVzdWx0cy5yb3dzLmxlbmd0aCA/IHJlc3VsdHMucm93cy5pdGVtKDApLnZhbHVlIDogbnVsbDtcblxuICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayB0byBzZWUgaWYgdGhpcyBpcyBzZXJpYWxpemVkIGNvbnRlbnQgd2UgbmVlZCB0b1xuICAgICAgICAgICAgICAgICAgICAvLyB1bnBhY2suXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGRiSW5mby5zZXJpYWxpemVyLmRlc2VyaWFsaXplKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHQsIGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlbXCJjYXRjaFwiXShyZWplY3QpO1xuICAgIH0pO1xuXG4gICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuZnVuY3Rpb24gaXRlcmF0ZSQxKGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UkMShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBkYkluZm8gPSBzZWxmLl9kYkluZm87XG5cbiAgICAgICAgICAgIGRiSW5mby5kYi50cmFuc2FjdGlvbihmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgICAgIHRyeUV4ZWN1dGVTcWwodCwgZGJJbmZvLCAnU0VMRUNUICogRlJPTSAnICsgZGJJbmZvLnN0b3JlTmFtZSwgW10sIGZ1bmN0aW9uICh0LCByZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByb3dzID0gcmVzdWx0cy5yb3dzO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGVuZ3RoID0gcm93cy5sZW5ndGg7XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSByb3dzLml0ZW0oaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gaXRlbS52YWx1ZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHRoaXMgaXMgc2VyaWFsaXplZCBjb250ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSBuZWVkIHRvIHVucGFjay5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBkYkluZm8uc2VyaWFsaXplci5kZXNlcmlhbGl6ZShyZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBpdGVyYXRvcihyZXN1bHQsIGl0ZW0ua2V5LCBpICsgMSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHZvaWQoMCkgcHJldmVudHMgcHJvYmxlbXMgd2l0aCByZWRlZmluaXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9mIGB1bmRlZmluZWRgLlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCAhPT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAodCwgZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVtcImNhdGNoXCJdKHJlamVjdCk7XG4gICAgfSk7XG5cbiAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG5mdW5jdGlvbiBfc2V0SXRlbShrZXksIHZhbHVlLCBjYWxsYmFjaywgcmV0cmllc0xlZnQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBrZXkgPSBub3JtYWxpemVLZXkoa2V5KTtcblxuICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UkMShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIFRoZSBsb2NhbFN0b3JhZ2UgQVBJIGRvZXNuJ3QgcmV0dXJuIHVuZGVmaW5lZCB2YWx1ZXMgaW4gYW5cbiAgICAgICAgICAgIC8vIFwiZXhwZWN0ZWRcIiB3YXksIHNvIHVuZGVmaW5lZCBpcyBhbHdheXMgY2FzdCB0byBudWxsIGluIGFsbFxuICAgICAgICAgICAgLy8gZHJpdmVycy4gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS9sb2NhbEZvcmFnZS9wdWxsLzQyXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gU2F2ZSB0aGUgb3JpZ2luYWwgdmFsdWUgdG8gcGFzcyB0byB0aGUgY2FsbGJhY2suXG4gICAgICAgICAgICB2YXIgb3JpZ2luYWxWYWx1ZSA9IHZhbHVlO1xuXG4gICAgICAgICAgICB2YXIgZGJJbmZvID0gc2VsZi5fZGJJbmZvO1xuICAgICAgICAgICAgZGJJbmZvLnNlcmlhbGl6ZXIuc2VyaWFsaXplKHZhbHVlLCBmdW5jdGlvbiAodmFsdWUsIGVycm9yKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGJJbmZvLmRiLnRyYW5zYWN0aW9uKGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnlFeGVjdXRlU3FsKHQsIGRiSW5mbywgJ0lOU0VSVCBPUiBSRVBMQUNFIElOVE8gJyArIGRiSW5mby5zdG9yZU5hbWUgKyAnICcgKyAnKGtleSwgdmFsdWUpIFZBTFVFUyAoPywgPyknLCBba2V5LCB2YWx1ZV0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG9yaWdpbmFsVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHQsIGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoc3FsRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSB0cmFuc2FjdGlvbiBmYWlsZWQ7IGNoZWNrXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0byBzZWUgaWYgaXQncyBhIHF1b3RhIGVycm9yLlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNxbEVycm9yLmNvZGUgPT09IHNxbEVycm9yLlFVT1RBX0VSUikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIHJlamVjdCB0aGUgY2FsbGJhY2sgb3V0cmlnaHQgZm9yIG5vdywgYnV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaXQncyB3b3J0aCB0cnlpbmcgdG8gcmUtcnVuIHRoZSB0cmFuc2FjdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBFdmVuIGlmIHRoZSB1c2VyIGFjY2VwdHMgdGhlIHByb21wdCB0byB1c2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBtb3JlIHN0b3JhZ2Ugb24gU2FmYXJpLCB0aGlzIGVycm9yIHdpbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBiZSBjYWxsZWQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUcnkgdG8gcmUtcnVuIHRoZSB0cmFuc2FjdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmV0cmllc0xlZnQgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoX3NldEl0ZW0uYXBwbHkoc2VsZiwgW2tleSwgb3JpZ2luYWxWYWx1ZSwgY2FsbGJhY2ssIHJldHJpZXNMZWZ0IC0gMV0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3Qoc3FsRXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlbXCJjYXRjaFwiXShyZWplY3QpO1xuICAgIH0pO1xuXG4gICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuZnVuY3Rpb24gc2V0SXRlbSQxKGtleSwgdmFsdWUsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIF9zZXRJdGVtLmFwcGx5KHRoaXMsIFtrZXksIHZhbHVlLCBjYWxsYmFjaywgMV0pO1xufVxuXG5mdW5jdGlvbiByZW1vdmVJdGVtJDEoa2V5LCBjYWxsYmFjaykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGtleSA9IG5vcm1hbGl6ZUtleShrZXkpO1xuXG4gICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSQxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGRiSW5mbyA9IHNlbGYuX2RiSW5mbztcbiAgICAgICAgICAgIGRiSW5mby5kYi50cmFuc2FjdGlvbihmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgICAgIHRyeUV4ZWN1dGVTcWwodCwgZGJJbmZvLCAnREVMRVRFIEZST00gJyArIGRiSW5mby5zdG9yZU5hbWUgKyAnIFdIRVJFIGtleSA9ID8nLCBba2V5XSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHQsIGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlbXCJjYXRjaFwiXShyZWplY3QpO1xuICAgIH0pO1xuXG4gICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuLy8gRGVsZXRlcyBldmVyeSBpdGVtIGluIHRoZSB0YWJsZS5cbi8vIFRPRE86IEZpbmQgb3V0IGlmIHRoaXMgcmVzZXRzIHRoZSBBVVRPX0lOQ1JFTUVOVCBudW1iZXIuXG5mdW5jdGlvbiBjbGVhciQxKGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSQxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGRiSW5mbyA9IHNlbGYuX2RiSW5mbztcbiAgICAgICAgICAgIGRiSW5mby5kYi50cmFuc2FjdGlvbihmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgICAgIHRyeUV4ZWN1dGVTcWwodCwgZGJJbmZvLCAnREVMRVRFIEZST00gJyArIGRiSW5mby5zdG9yZU5hbWUsIFtdLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAodCwgZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVtcImNhdGNoXCJdKHJlamVjdCk7XG4gICAgfSk7XG5cbiAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG4vLyBEb2VzIGEgc2ltcGxlIGBDT1VOVChrZXkpYCB0byBnZXQgdGhlIG51bWJlciBvZiBpdGVtcyBzdG9yZWQgaW5cbi8vIGxvY2FsRm9yYWdlLlxuZnVuY3Rpb24gbGVuZ3RoJDEoY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZGJJbmZvID0gc2VsZi5fZGJJbmZvO1xuICAgICAgICAgICAgZGJJbmZvLmRiLnRyYW5zYWN0aW9uKGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICAgICAgLy8gQWhoaCwgU1FMIG1ha2VzIHRoaXMgb25lIHNvb29vb28gZWFzeS5cbiAgICAgICAgICAgICAgICB0cnlFeGVjdXRlU3FsKHQsIGRiSW5mbywgJ1NFTEVDVCBDT1VOVChrZXkpIGFzIGMgRlJPTSAnICsgZGJJbmZvLnN0b3JlTmFtZSwgW10sIGZ1bmN0aW9uICh0LCByZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSByZXN1bHRzLnJvd3MuaXRlbSgwKS5jO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHQsIGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlbXCJjYXRjaFwiXShyZWplY3QpO1xuICAgIH0pO1xuXG4gICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuLy8gUmV0dXJuIHRoZSBrZXkgbG9jYXRlZCBhdCBrZXkgaW5kZXggWDsgZXNzZW50aWFsbHkgZ2V0cyB0aGUga2V5IGZyb20gYVxuLy8gYFdIRVJFIGlkID0gP2AuIFRoaXMgaXMgdGhlIG1vc3QgZWZmaWNpZW50IHdheSBJIGNhbiB0aGluayB0byBpbXBsZW1lbnRcbi8vIHRoaXMgcmFyZWx5LXVzZWQgKGluIG15IGV4cGVyaWVuY2UpIHBhcnQgb2YgdGhlIEFQSSwgYnV0IGl0IGNhbiBzZWVtXG4vLyBpbmNvbnNpc3RlbnQsIGJlY2F1c2Ugd2UgZG8gYElOU0VSVCBPUiBSRVBMQUNFIElOVE9gIG9uIGBzZXRJdGVtKClgLCBzb1xuLy8gdGhlIElEIG9mIGVhY2gga2V5IHdpbGwgY2hhbmdlIGV2ZXJ5IHRpbWUgaXQncyB1cGRhdGVkLiBQZXJoYXBzIGEgc3RvcmVkXG4vLyBwcm9jZWR1cmUgZm9yIHRoZSBgc2V0SXRlbSgpYCBTUUwgd291bGQgc29sdmUgdGhpcyBwcm9ibGVtP1xuLy8gVE9ETzogRG9uJ3QgY2hhbmdlIElEIG9uIGBzZXRJdGVtKClgLlxuZnVuY3Rpb24ga2V5JDEobiwgY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZGJJbmZvID0gc2VsZi5fZGJJbmZvO1xuICAgICAgICAgICAgZGJJbmZvLmRiLnRyYW5zYWN0aW9uKGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICAgICAgdHJ5RXhlY3V0ZVNxbCh0LCBkYkluZm8sICdTRUxFQ1Qga2V5IEZST00gJyArIGRiSW5mby5zdG9yZU5hbWUgKyAnIFdIRVJFIGlkID0gPyBMSU1JVCAxJywgW24gKyAxXSwgZnVuY3Rpb24gKHQsIHJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHJlc3VsdHMucm93cy5sZW5ndGggPyByZXN1bHRzLnJvd3MuaXRlbSgwKS5rZXkgOiBudWxsO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHQsIGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlbXCJjYXRjaFwiXShyZWplY3QpO1xuICAgIH0pO1xuXG4gICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuZnVuY3Rpb24ga2V5cyQxKGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSQxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGRiSW5mbyA9IHNlbGYuX2RiSW5mbztcbiAgICAgICAgICAgIGRiSW5mby5kYi50cmFuc2FjdGlvbihmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgICAgIHRyeUV4ZWN1dGVTcWwodCwgZGJJbmZvLCAnU0VMRUNUIGtleSBGUk9NICcgKyBkYkluZm8uc3RvcmVOYW1lLCBbXSwgZnVuY3Rpb24gKHQsIHJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleXMgPSBbXTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlc3VsdHMucm93cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5cy5wdXNoKHJlc3VsdHMucm93cy5pdGVtKGkpLmtleSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGtleXMpO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICh0LCBlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pW1wiY2F0Y2hcIl0ocmVqZWN0KTtcbiAgICB9KTtcblxuICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cbi8vIGh0dHBzOi8vd3d3LnczLm9yZy9UUi93ZWJkYXRhYmFzZS8jZGF0YWJhc2VzXG4vLyA+IFRoZXJlIGlzIG5vIHdheSB0byBlbnVtZXJhdGUgb3IgZGVsZXRlIHRoZSBkYXRhYmFzZXMgYXZhaWxhYmxlIGZvciBhbiBvcmlnaW4gZnJvbSB0aGlzIEFQSS5cbmZ1bmN0aW9uIGdldEFsbFN0b3JlTmFtZXMoZGIpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UkMShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGRiLnRyYW5zYWN0aW9uKGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICB0LmV4ZWN1dGVTcWwoJ1NFTEVDVCBuYW1lIEZST00gc3FsaXRlX21hc3RlciAnICsgXCJXSEVSRSB0eXBlPSd0YWJsZScgQU5EIG5hbWUgPD4gJ19fV2ViS2l0RGF0YWJhc2VJbmZvVGFibGVfXydcIiwgW10sIGZ1bmN0aW9uICh0LCByZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0b3JlTmFtZXMgPSBbXTtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVzdWx0cy5yb3dzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0b3JlTmFtZXMucHVzaChyZXN1bHRzLnJvd3MuaXRlbShpKS5uYW1lKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgZGI6IGRiLFxuICAgICAgICAgICAgICAgICAgICBzdG9yZU5hbWVzOiBzdG9yZU5hbWVzXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAodCwgZXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChzcWxFcnJvcikge1xuICAgICAgICAgICAgcmVqZWN0KHNxbEVycm9yKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGRyb3BJbnN0YW5jZSQxKG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgY2FsbGJhY2sgPSBnZXRDYWxsYmFjay5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgdmFyIGN1cnJlbnRDb25maWcgPSB0aGlzLmNvbmZpZygpO1xuICAgIG9wdGlvbnMgPSB0eXBlb2Ygb3B0aW9ucyAhPT0gJ2Z1bmN0aW9uJyAmJiBvcHRpb25zIHx8IHt9O1xuICAgIGlmICghb3B0aW9ucy5uYW1lKSB7XG4gICAgICAgIG9wdGlvbnMubmFtZSA9IG9wdGlvbnMubmFtZSB8fCBjdXJyZW50Q29uZmlnLm5hbWU7XG4gICAgICAgIG9wdGlvbnMuc3RvcmVOYW1lID0gb3B0aW9ucy5zdG9yZU5hbWUgfHwgY3VycmVudENvbmZpZy5zdG9yZU5hbWU7XG4gICAgfVxuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBwcm9taXNlO1xuICAgIGlmICghb3B0aW9ucy5uYW1lKSB7XG4gICAgICAgIHByb21pc2UgPSBQcm9taXNlJDEucmVqZWN0KCdJbnZhbGlkIGFyZ3VtZW50cycpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHByb21pc2UgPSBuZXcgUHJvbWlzZSQxKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgICAgICAgICB2YXIgZGI7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5uYW1lID09PSBjdXJyZW50Q29uZmlnLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAvLyB1c2UgdGhlIGRiIHJlZmVyZW5jZSBvZiB0aGUgY3VycmVudCBpbnN0YW5jZVxuICAgICAgICAgICAgICAgIGRiID0gc2VsZi5fZGJJbmZvLmRiO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkYiA9IG9wZW5EYXRhYmFzZShvcHRpb25zLm5hbWUsICcnLCAnJywgMCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghb3B0aW9ucy5zdG9yZU5hbWUpIHtcbiAgICAgICAgICAgICAgICAvLyBkcm9wIGFsbCBkYXRhYmFzZSB0YWJsZXNcbiAgICAgICAgICAgICAgICByZXNvbHZlKGdldEFsbFN0b3JlTmFtZXMoZGIpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgIGRiOiBkYixcbiAgICAgICAgICAgICAgICAgICAgc3RvcmVOYW1lczogW29wdGlvbnMuc3RvcmVOYW1lXVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChvcGVyYXRpb25JbmZvKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UkMShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uSW5mby5kYi50cmFuc2FjdGlvbihmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBkcm9wVGFibGUoc3RvcmVOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UkMShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdC5leGVjdXRlU3FsKCdEUk9QIFRBQkxFIElGIEVYSVNUUyAnICsgc3RvcmVOYW1lLCBbXSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHQsIGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhciBvcGVyYXRpb25zID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBvcGVyYXRpb25JbmZvLnN0b3JlTmFtZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wZXJhdGlvbnMucHVzaChkcm9wVGFibGUob3BlcmF0aW9uSW5mby5zdG9yZU5hbWVzW2ldKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBQcm9taXNlJDEuYWxsKG9wZXJhdGlvbnMpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KVtcImNhdGNoXCJdKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChzcWxFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3Qoc3FsRXJyb3IpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cbnZhciB3ZWJTUUxTdG9yYWdlID0ge1xuICAgIF9kcml2ZXI6ICd3ZWJTUUxTdG9yYWdlJyxcbiAgICBfaW5pdFN0b3JhZ2U6IF9pbml0U3RvcmFnZSQxLFxuICAgIF9zdXBwb3J0OiBpc1dlYlNRTFZhbGlkKCksXG4gICAgaXRlcmF0ZTogaXRlcmF0ZSQxLFxuICAgIGdldEl0ZW06IGdldEl0ZW0kMSxcbiAgICBzZXRJdGVtOiBzZXRJdGVtJDEsXG4gICAgcmVtb3ZlSXRlbTogcmVtb3ZlSXRlbSQxLFxuICAgIGNsZWFyOiBjbGVhciQxLFxuICAgIGxlbmd0aDogbGVuZ3RoJDEsXG4gICAga2V5OiBrZXkkMSxcbiAgICBrZXlzOiBrZXlzJDEsXG4gICAgZHJvcEluc3RhbmNlOiBkcm9wSW5zdGFuY2UkMVxufTtcblxuZnVuY3Rpb24gaXNMb2NhbFN0b3JhZ2VWYWxpZCgpIHtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gdHlwZW9mIGxvY2FsU3RvcmFnZSAhPT0gJ3VuZGVmaW5lZCcgJiYgJ3NldEl0ZW0nIGluIGxvY2FsU3RvcmFnZSAmJlxuICAgICAgICAvLyBpbiBJRTggdHlwZW9mIGxvY2FsU3RvcmFnZS5zZXRJdGVtID09PSAnb2JqZWN0J1xuICAgICAgICAhIWxvY2FsU3RvcmFnZS5zZXRJdGVtO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gX2dldEtleVByZWZpeChvcHRpb25zLCBkZWZhdWx0Q29uZmlnKSB7XG4gICAgdmFyIGtleVByZWZpeCA9IG9wdGlvbnMubmFtZSArICcvJztcblxuICAgIGlmIChvcHRpb25zLnN0b3JlTmFtZSAhPT0gZGVmYXVsdENvbmZpZy5zdG9yZU5hbWUpIHtcbiAgICAgICAga2V5UHJlZml4ICs9IG9wdGlvbnMuc3RvcmVOYW1lICsgJy8nO1xuICAgIH1cbiAgICByZXR1cm4ga2V5UHJlZml4O1xufVxuXG4vLyBDaGVjayBpZiBsb2NhbFN0b3JhZ2UgdGhyb3dzIHdoZW4gc2F2aW5nIGFuIGl0ZW1cbmZ1bmN0aW9uIGNoZWNrSWZMb2NhbFN0b3JhZ2VUaHJvd3MoKSB7XG4gICAgdmFyIGxvY2FsU3RvcmFnZVRlc3RLZXkgPSAnX2xvY2FsZm9yYWdlX3N1cHBvcnRfdGVzdCc7XG5cbiAgICB0cnkge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShsb2NhbFN0b3JhZ2VUZXN0S2V5LCB0cnVlKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0obG9jYWxTdG9yYWdlVGVzdEtleSk7XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufVxuXG4vLyBDaGVjayBpZiBsb2NhbFN0b3JhZ2UgaXMgdXNhYmxlIGFuZCBhbGxvd3MgdG8gc2F2ZSBhbiBpdGVtXG4vLyBUaGlzIG1ldGhvZCBjaGVja3MgaWYgbG9jYWxTdG9yYWdlIGlzIHVzYWJsZSBpbiBTYWZhcmkgUHJpdmF0ZSBCcm93c2luZ1xuLy8gbW9kZSwgb3IgaW4gYW55IG90aGVyIGNhc2Ugd2hlcmUgdGhlIGF2YWlsYWJsZSBxdW90YSBmb3IgbG9jYWxTdG9yYWdlXG4vLyBpcyAwIGFuZCB0aGVyZSB3YXNuJ3QgYW55IHNhdmVkIGl0ZW1zIHlldC5cbmZ1bmN0aW9uIF9pc0xvY2FsU3RvcmFnZVVzYWJsZSgpIHtcbiAgICByZXR1cm4gIWNoZWNrSWZMb2NhbFN0b3JhZ2VUaHJvd3MoKSB8fCBsb2NhbFN0b3JhZ2UubGVuZ3RoID4gMDtcbn1cblxuLy8gQ29uZmlnIHRoZSBsb2NhbFN0b3JhZ2UgYmFja2VuZCwgdXNpbmcgb3B0aW9ucyBzZXQgaW4gdGhlIGNvbmZpZy5cbmZ1bmN0aW9uIF9pbml0U3RvcmFnZSQyKG9wdGlvbnMpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGRiSW5mbyA9IHt9O1xuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICAgIGZvciAodmFyIGkgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgZGJJbmZvW2ldID0gb3B0aW9uc1tpXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRiSW5mby5rZXlQcmVmaXggPSBfZ2V0S2V5UHJlZml4KG9wdGlvbnMsIHNlbGYuX2RlZmF1bHRDb25maWcpO1xuXG4gICAgaWYgKCFfaXNMb2NhbFN0b3JhZ2VVc2FibGUoKSkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZSQxLnJlamVjdCgpO1xuICAgIH1cblxuICAgIHNlbGYuX2RiSW5mbyA9IGRiSW5mbztcbiAgICBkYkluZm8uc2VyaWFsaXplciA9IGxvY2FsZm9yYWdlU2VyaWFsaXplcjtcblxuICAgIHJldHVybiBQcm9taXNlJDEucmVzb2x2ZSgpO1xufVxuXG4vLyBSZW1vdmUgYWxsIGtleXMgZnJvbSB0aGUgZGF0YXN0b3JlLCBlZmZlY3RpdmVseSBkZXN0cm95aW5nIGFsbCBkYXRhIGluXG4vLyB0aGUgYXBwJ3Mga2V5L3ZhbHVlIHN0b3JlIVxuZnVuY3Rpb24gY2xlYXIkMihjYWxsYmFjaykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgcHJvbWlzZSA9IHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGtleVByZWZpeCA9IHNlbGYuX2RiSW5mby5rZXlQcmVmaXg7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IGxvY2FsU3RvcmFnZS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgdmFyIGtleSA9IGxvY2FsU3RvcmFnZS5rZXkoaSk7XG5cbiAgICAgICAgICAgIGlmIChrZXkuaW5kZXhPZihrZXlQcmVmaXgpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oa2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuLy8gUmV0cmlldmUgYW4gaXRlbSBmcm9tIHRoZSBzdG9yZS4gVW5saWtlIHRoZSBvcmlnaW5hbCBhc3luY19zdG9yYWdlXG4vLyBsaWJyYXJ5IGluIEdhaWEsIHdlIGRvbid0IG1vZGlmeSByZXR1cm4gdmFsdWVzIGF0IGFsbC4gSWYgYSBrZXkncyB2YWx1ZVxuLy8gaXMgYHVuZGVmaW5lZGAsIHdlIHBhc3MgdGhhdCB2YWx1ZSB0byB0aGUgY2FsbGJhY2sgZnVuY3Rpb24uXG5mdW5jdGlvbiBnZXRJdGVtJDIoa2V5LCBjYWxsYmFjaykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGtleSA9IG5vcm1hbGl6ZUtleShrZXkpO1xuXG4gICAgdmFyIHByb21pc2UgPSBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBkYkluZm8gPSBzZWxmLl9kYkluZm87XG4gICAgICAgIHZhciByZXN1bHQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShkYkluZm8ua2V5UHJlZml4ICsga2V5KTtcblxuICAgICAgICAvLyBJZiBhIHJlc3VsdCB3YXMgZm91bmQsIHBhcnNlIGl0IGZyb20gdGhlIHNlcmlhbGl6ZWRcbiAgICAgICAgLy8gc3RyaW5nIGludG8gYSBKUyBvYmplY3QuIElmIHJlc3VsdCBpc24ndCB0cnV0aHksIHRoZSBrZXlcbiAgICAgICAgLy8gaXMgbGlrZWx5IHVuZGVmaW5lZCBhbmQgd2UnbGwgcGFzcyBpdCBzdHJhaWdodCB0byB0aGVcbiAgICAgICAgLy8gY2FsbGJhY2suXG4gICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IGRiSW5mby5zZXJpYWxpemVyLmRlc2VyaWFsaXplKHJlc3VsdCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0pO1xuXG4gICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuLy8gSXRlcmF0ZSBvdmVyIGFsbCBpdGVtcyBpbiB0aGUgc3RvcmUuXG5mdW5jdGlvbiBpdGVyYXRlJDIoaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHByb21pc2UgPSBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBkYkluZm8gPSBzZWxmLl9kYkluZm87XG4gICAgICAgIHZhciBrZXlQcmVmaXggPSBkYkluZm8ua2V5UHJlZml4O1xuICAgICAgICB2YXIga2V5UHJlZml4TGVuZ3RoID0ga2V5UHJlZml4Lmxlbmd0aDtcbiAgICAgICAgdmFyIGxlbmd0aCA9IGxvY2FsU3RvcmFnZS5sZW5ndGg7XG5cbiAgICAgICAgLy8gV2UgdXNlIGEgZGVkaWNhdGVkIGl0ZXJhdG9yIGluc3RlYWQgb2YgdGhlIGBpYCB2YXJpYWJsZSBiZWxvd1xuICAgICAgICAvLyBzbyBvdGhlciBrZXlzIHdlIGZldGNoIGluIGxvY2FsU3RvcmFnZSBhcmVuJ3QgY291bnRlZCBpblxuICAgICAgICAvLyB0aGUgYGl0ZXJhdGlvbk51bWJlcmAgYXJndW1lbnQgcGFzc2VkIHRvIHRoZSBgaXRlcmF0ZSgpYFxuICAgICAgICAvLyBjYWxsYmFjay5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gU2VlOiBnaXRodWIuY29tL21vemlsbGEvbG9jYWxGb3JhZ2UvcHVsbC80MzUjZGlzY3Vzc2lvbl9yMzgwNjE1MzBcbiAgICAgICAgdmFyIGl0ZXJhdGlvbk51bWJlciA9IDE7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGtleSA9IGxvY2FsU3RvcmFnZS5rZXkoaSk7XG4gICAgICAgICAgICBpZiAoa2V5LmluZGV4T2Yoa2V5UHJlZml4KSAhPT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHZhbHVlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KTtcblxuICAgICAgICAgICAgLy8gSWYgYSByZXN1bHQgd2FzIGZvdW5kLCBwYXJzZSBpdCBmcm9tIHRoZSBzZXJpYWxpemVkXG4gICAgICAgICAgICAvLyBzdHJpbmcgaW50byBhIEpTIG9iamVjdC4gSWYgcmVzdWx0IGlzbid0IHRydXRoeSwgdGhlXG4gICAgICAgICAgICAvLyBrZXkgaXMgbGlrZWx5IHVuZGVmaW5lZCBhbmQgd2UnbGwgcGFzcyBpdCBzdHJhaWdodFxuICAgICAgICAgICAgLy8gdG8gdGhlIGl0ZXJhdG9yLlxuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBkYkluZm8uc2VyaWFsaXplci5kZXNlcmlhbGl6ZSh2YWx1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhbHVlID0gaXRlcmF0b3IodmFsdWUsIGtleS5zdWJzdHJpbmcoa2V5UHJlZml4TGVuZ3RoKSwgaXRlcmF0aW9uTnVtYmVyKyspO1xuXG4gICAgICAgICAgICBpZiAodmFsdWUgIT09IHZvaWQgMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuLy8gU2FtZSBhcyBsb2NhbFN0b3JhZ2UncyBrZXkoKSBtZXRob2QsIGV4Y2VwdCB0YWtlcyBhIGNhbGxiYWNrLlxuZnVuY3Rpb24ga2V5JDIobiwgY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHByb21pc2UgPSBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBkYkluZm8gPSBzZWxmLl9kYkluZm87XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXN1bHQgPSBsb2NhbFN0b3JhZ2Uua2V5KG4pO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmVzdWx0ID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgcHJlZml4IGZyb20gdGhlIGtleSwgaWYgYSBrZXkgaXMgZm91bmQuXG4gICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5zdWJzdHJpbmcoZGJJbmZvLmtleVByZWZpeC5sZW5ndGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9KTtcblxuICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cbmZ1bmN0aW9uIGtleXMkMihjYWxsYmFjaykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgcHJvbWlzZSA9IHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGRiSW5mbyA9IHNlbGYuX2RiSW5mbztcbiAgICAgICAgdmFyIGxlbmd0aCA9IGxvY2FsU3RvcmFnZS5sZW5ndGg7XG4gICAgICAgIHZhciBrZXlzID0gW107XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGl0ZW1LZXkgPSBsb2NhbFN0b3JhZ2Uua2V5KGkpO1xuICAgICAgICAgICAgaWYgKGl0ZW1LZXkuaW5kZXhPZihkYkluZm8ua2V5UHJlZml4KSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGtleXMucHVzaChpdGVtS2V5LnN1YnN0cmluZyhkYkluZm8ua2V5UHJlZml4Lmxlbmd0aCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGtleXM7XG4gICAgfSk7XG5cbiAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG4vLyBTdXBwbHkgdGhlIG51bWJlciBvZiBrZXlzIGluIHRoZSBkYXRhc3RvcmUgdG8gdGhlIGNhbGxiYWNrIGZ1bmN0aW9uLlxuZnVuY3Rpb24gbGVuZ3RoJDIoY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHByb21pc2UgPSBzZWxmLmtleXMoKS50aGVuKGZ1bmN0aW9uIChrZXlzKSB7XG4gICAgICAgIHJldHVybiBrZXlzLmxlbmd0aDtcbiAgICB9KTtcblxuICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cbi8vIFJlbW92ZSBhbiBpdGVtIGZyb20gdGhlIHN0b3JlLCBuaWNlIGFuZCBzaW1wbGUuXG5mdW5jdGlvbiByZW1vdmVJdGVtJDIoa2V5LCBjYWxsYmFjaykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGtleSA9IG5vcm1hbGl6ZUtleShrZXkpO1xuXG4gICAgdmFyIHByb21pc2UgPSBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBkYkluZm8gPSBzZWxmLl9kYkluZm87XG4gICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGRiSW5mby5rZXlQcmVmaXggKyBrZXkpO1xuICAgIH0pO1xuXG4gICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuLy8gU2V0IGEga2V5J3MgdmFsdWUgYW5kIHJ1biBhbiBvcHRpb25hbCBjYWxsYmFjayBvbmNlIHRoZSB2YWx1ZSBpcyBzZXQuXG4vLyBVbmxpa2UgR2FpYSdzIGltcGxlbWVudGF0aW9uLCB0aGUgY2FsbGJhY2sgZnVuY3Rpb24gaXMgcGFzc2VkIHRoZSB2YWx1ZSxcbi8vIGluIGNhc2UgeW91IHdhbnQgdG8gb3BlcmF0ZSBvbiB0aGF0IHZhbHVlIG9ubHkgYWZ0ZXIgeW91J3JlIHN1cmUgaXRcbi8vIHNhdmVkLCBvciBzb21ldGhpbmcgbGlrZSB0aGF0LlxuZnVuY3Rpb24gc2V0SXRlbSQyKGtleSwgdmFsdWUsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAga2V5ID0gbm9ybWFsaXplS2V5KGtleSk7XG5cbiAgICB2YXIgcHJvbWlzZSA9IHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gQ29udmVydCB1bmRlZmluZWQgdmFsdWVzIHRvIG51bGwuXG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tb3ppbGxhL2xvY2FsRm9yYWdlL3B1bGwvNDJcbiAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNhdmUgdGhlIG9yaWdpbmFsIHZhbHVlIHRvIHBhc3MgdG8gdGhlIGNhbGxiYWNrLlxuICAgICAgICB2YXIgb3JpZ2luYWxWYWx1ZSA9IHZhbHVlO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSQxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHZhciBkYkluZm8gPSBzZWxmLl9kYkluZm87XG4gICAgICAgICAgICBkYkluZm8uc2VyaWFsaXplci5zZXJpYWxpemUodmFsdWUsIGZ1bmN0aW9uICh2YWx1ZSwgZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oZGJJbmZvLmtleVByZWZpeCArIGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShvcmlnaW5hbFZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbG9jYWxTdG9yYWdlIGNhcGFjaXR5IGV4Y2VlZGVkLlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogTWFrZSB0aGlzIGEgc3BlY2lmaWMgZXJyb3IvZXZlbnQuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZS5uYW1lID09PSAnUXVvdGFFeGNlZWRlZEVycm9yJyB8fCBlLm5hbWUgPT09ICdOU19FUlJPUl9ET01fUVVPVEFfUkVBQ0hFRCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG5mdW5jdGlvbiBkcm9wSW5zdGFuY2UkMihvcHRpb25zLCBjYWxsYmFjaykge1xuICAgIGNhbGxiYWNrID0gZ2V0Q2FsbGJhY2suYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIG9wdGlvbnMgPSB0eXBlb2Ygb3B0aW9ucyAhPT0gJ2Z1bmN0aW9uJyAmJiBvcHRpb25zIHx8IHt9O1xuICAgIGlmICghb3B0aW9ucy5uYW1lKSB7XG4gICAgICAgIHZhciBjdXJyZW50Q29uZmlnID0gdGhpcy5jb25maWcoKTtcbiAgICAgICAgb3B0aW9ucy5uYW1lID0gb3B0aW9ucy5uYW1lIHx8IGN1cnJlbnRDb25maWcubmFtZTtcbiAgICAgICAgb3B0aW9ucy5zdG9yZU5hbWUgPSBvcHRpb25zLnN0b3JlTmFtZSB8fCBjdXJyZW50Q29uZmlnLnN0b3JlTmFtZTtcbiAgICB9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHByb21pc2U7XG4gICAgaWYgKCFvcHRpb25zLm5hbWUpIHtcbiAgICAgICAgcHJvbWlzZSA9IFByb21pc2UkMS5yZWplY3QoJ0ludmFsaWQgYXJndW1lbnRzJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcHJvbWlzZSA9IG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICAgICAgICAgIGlmICghb3B0aW9ucy5zdG9yZU5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKG9wdGlvbnMubmFtZSArICcvJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoX2dldEtleVByZWZpeChvcHRpb25zLCBzZWxmLl9kZWZhdWx0Q29uZmlnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKGtleVByZWZpeCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IGxvY2FsU3RvcmFnZS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgICAgIHZhciBrZXkgPSBsb2NhbFN0b3JhZ2Uua2V5KGkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGtleS5pbmRleE9mKGtleVByZWZpeCkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oa2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cbnZhciBsb2NhbFN0b3JhZ2VXcmFwcGVyID0ge1xuICAgIF9kcml2ZXI6ICdsb2NhbFN0b3JhZ2VXcmFwcGVyJyxcbiAgICBfaW5pdFN0b3JhZ2U6IF9pbml0U3RvcmFnZSQyLFxuICAgIF9zdXBwb3J0OiBpc0xvY2FsU3RvcmFnZVZhbGlkKCksXG4gICAgaXRlcmF0ZTogaXRlcmF0ZSQyLFxuICAgIGdldEl0ZW06IGdldEl0ZW0kMixcbiAgICBzZXRJdGVtOiBzZXRJdGVtJDIsXG4gICAgcmVtb3ZlSXRlbTogcmVtb3ZlSXRlbSQyLFxuICAgIGNsZWFyOiBjbGVhciQyLFxuICAgIGxlbmd0aDogbGVuZ3RoJDIsXG4gICAga2V5OiBrZXkkMixcbiAgICBrZXlzOiBrZXlzJDIsXG4gICAgZHJvcEluc3RhbmNlOiBkcm9wSW5zdGFuY2UkMlxufTtcblxudmFyIHNhbWVWYWx1ZSA9IGZ1bmN0aW9uIHNhbWVWYWx1ZSh4LCB5KSB7XG4gICAgcmV0dXJuIHggPT09IHkgfHwgdHlwZW9mIHggPT09ICdudW1iZXInICYmIHR5cGVvZiB5ID09PSAnbnVtYmVyJyAmJiBpc05hTih4KSAmJiBpc05hTih5KTtcbn07XG5cbnZhciBpbmNsdWRlcyA9IGZ1bmN0aW9uIGluY2x1ZGVzKGFycmF5LCBzZWFyY2hFbGVtZW50KSB7XG4gICAgdmFyIGxlbiA9IGFycmF5Lmxlbmd0aDtcbiAgICB2YXIgaSA9IDA7XG4gICAgd2hpbGUgKGkgPCBsZW4pIHtcbiAgICAgICAgaWYgKHNhbWVWYWx1ZShhcnJheVtpXSwgc2VhcmNoRWxlbWVudCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGkrKztcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKGFyZykge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJnKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG5cbi8vIERyaXZlcnMgYXJlIHN0b3JlZCBoZXJlIHdoZW4gYGRlZmluZURyaXZlcigpYCBpcyBjYWxsZWQuXG4vLyBUaGV5IGFyZSBzaGFyZWQgYWNyb3NzIGFsbCBpbnN0YW5jZXMgb2YgbG9jYWxGb3JhZ2UuXG52YXIgRGVmaW5lZERyaXZlcnMgPSB7fTtcblxudmFyIERyaXZlclN1cHBvcnQgPSB7fTtcblxudmFyIERlZmF1bHREcml2ZXJzID0ge1xuICAgIElOREVYRUREQjogYXN5bmNTdG9yYWdlLFxuICAgIFdFQlNRTDogd2ViU1FMU3RvcmFnZSxcbiAgICBMT0NBTFNUT1JBR0U6IGxvY2FsU3RvcmFnZVdyYXBwZXJcbn07XG5cbnZhciBEZWZhdWx0RHJpdmVyT3JkZXIgPSBbRGVmYXVsdERyaXZlcnMuSU5ERVhFRERCLl9kcml2ZXIsIERlZmF1bHREcml2ZXJzLldFQlNRTC5fZHJpdmVyLCBEZWZhdWx0RHJpdmVycy5MT0NBTFNUT1JBR0UuX2RyaXZlcl07XG5cbnZhciBPcHRpb25hbERyaXZlck1ldGhvZHMgPSBbJ2Ryb3BJbnN0YW5jZSddO1xuXG52YXIgTGlicmFyeU1ldGhvZHMgPSBbJ2NsZWFyJywgJ2dldEl0ZW0nLCAnaXRlcmF0ZScsICdrZXknLCAna2V5cycsICdsZW5ndGgnLCAncmVtb3ZlSXRlbScsICdzZXRJdGVtJ10uY29uY2F0KE9wdGlvbmFsRHJpdmVyTWV0aG9kcyk7XG5cbnZhciBEZWZhdWx0Q29uZmlnID0ge1xuICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICBkcml2ZXI6IERlZmF1bHREcml2ZXJPcmRlci5zbGljZSgpLFxuICAgIG5hbWU6ICdsb2NhbGZvcmFnZScsXG4gICAgLy8gRGVmYXVsdCBEQiBzaXplIGlzIF9KVVNUIFVOREVSXyA1TUIsIGFzIGl0J3MgdGhlIGhpZ2hlc3Qgc2l6ZVxuICAgIC8vIHdlIGNhbiB1c2Ugd2l0aG91dCBhIHByb21wdC5cbiAgICBzaXplOiA0OTgwNzM2LFxuICAgIHN0b3JlTmFtZTogJ2tleXZhbHVlcGFpcnMnLFxuICAgIHZlcnNpb246IDEuMFxufTtcblxuZnVuY3Rpb24gY2FsbFdoZW5SZWFkeShsb2NhbEZvcmFnZUluc3RhbmNlLCBsaWJyYXJ5TWV0aG9kKSB7XG4gICAgbG9jYWxGb3JhZ2VJbnN0YW5jZVtsaWJyYXJ5TWV0aG9kXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF9hcmdzID0gYXJndW1lbnRzO1xuICAgICAgICByZXR1cm4gbG9jYWxGb3JhZ2VJbnN0YW5jZS5yZWFkeSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGxvY2FsRm9yYWdlSW5zdGFuY2VbbGlicmFyeU1ldGhvZF0uYXBwbHkobG9jYWxGb3JhZ2VJbnN0YW5jZSwgX2FyZ3MpO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBleHRlbmQoKSB7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGFyZyA9IGFyZ3VtZW50c1tpXTtcblxuICAgICAgICBpZiAoYXJnKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBfa2V5IGluIGFyZykge1xuICAgICAgICAgICAgICAgIGlmIChhcmcuaGFzT3duUHJvcGVydHkoX2tleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzQXJyYXkoYXJnW19rZXldKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJndW1lbnRzWzBdW19rZXldID0gYXJnW19rZXldLnNsaWNlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmd1bWVudHNbMF1bX2tleV0gPSBhcmdbX2tleV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYXJndW1lbnRzWzBdO1xufVxuXG52YXIgTG9jYWxGb3JhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gTG9jYWxGb3JhZ2Uob3B0aW9ucykge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTG9jYWxGb3JhZ2UpO1xuXG4gICAgICAgIGZvciAodmFyIGRyaXZlclR5cGVLZXkgaW4gRGVmYXVsdERyaXZlcnMpIHtcbiAgICAgICAgICAgIGlmIChEZWZhdWx0RHJpdmVycy5oYXNPd25Qcm9wZXJ0eShkcml2ZXJUeXBlS2V5KSkge1xuICAgICAgICAgICAgICAgIHZhciBkcml2ZXIgPSBEZWZhdWx0RHJpdmVyc1tkcml2ZXJUeXBlS2V5XTtcbiAgICAgICAgICAgICAgICB2YXIgZHJpdmVyTmFtZSA9IGRyaXZlci5fZHJpdmVyO1xuICAgICAgICAgICAgICAgIHRoaXNbZHJpdmVyVHlwZUtleV0gPSBkcml2ZXJOYW1lO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFEZWZpbmVkRHJpdmVyc1tkcml2ZXJOYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICAvLyB3ZSBkb24ndCBuZWVkIHRvIHdhaXQgZm9yIHRoZSBwcm9taXNlLFxuICAgICAgICAgICAgICAgICAgICAvLyBzaW5jZSB0aGUgZGVmYXVsdCBkcml2ZXJzIGNhbiBiZSBkZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgIC8vIGluIGEgYmxvY2tpbmcgbWFubmVyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVmaW5lRHJpdmVyKGRyaXZlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fZGVmYXVsdENvbmZpZyA9IGV4dGVuZCh7fSwgRGVmYXVsdENvbmZpZyk7XG4gICAgICAgIHRoaXMuX2NvbmZpZyA9IGV4dGVuZCh7fSwgdGhpcy5fZGVmYXVsdENvbmZpZywgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuX2RyaXZlclNldCA9IG51bGw7XG4gICAgICAgIHRoaXMuX2luaXREcml2ZXIgPSBudWxsO1xuICAgICAgICB0aGlzLl9yZWFkeSA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9kYkluZm8gPSBudWxsO1xuXG4gICAgICAgIHRoaXMuX3dyYXBMaWJyYXJ5TWV0aG9kc1dpdGhSZWFkeSgpO1xuICAgICAgICB0aGlzLnNldERyaXZlcih0aGlzLl9jb25maWcuZHJpdmVyKVtcImNhdGNoXCJdKGZ1bmN0aW9uICgpIHt9KTtcbiAgICB9XG5cbiAgICAvLyBTZXQgYW55IGNvbmZpZyB2YWx1ZXMgZm9yIGxvY2FsRm9yYWdlOyBjYW4gYmUgY2FsbGVkIGFueXRpbWUgYmVmb3JlXG4gICAgLy8gdGhlIGZpcnN0IEFQSSBjYWxsIChlLmcuIGBnZXRJdGVtYCwgYHNldEl0ZW1gKS5cbiAgICAvLyBXZSBsb29wIHRocm91Z2ggb3B0aW9ucyBzbyB3ZSBkb24ndCBvdmVyd3JpdGUgZXhpc3RpbmcgY29uZmlnXG4gICAgLy8gdmFsdWVzLlxuXG5cbiAgICBMb2NhbEZvcmFnZS5wcm90b3R5cGUuY29uZmlnID0gZnVuY3Rpb24gY29uZmlnKG9wdGlvbnMpIHtcbiAgICAgICAgLy8gSWYgdGhlIG9wdGlvbnMgYXJndW1lbnQgaXMgYW4gb2JqZWN0LCB3ZSB1c2UgaXQgdG8gc2V0IHZhbHVlcy5cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCB3ZSByZXR1cm4gZWl0aGVyIGEgc3BlY2lmaWVkIGNvbmZpZyB2YWx1ZSBvciBhbGxcbiAgICAgICAgLy8gY29uZmlnIHZhbHVlcy5cbiAgICAgICAgaWYgKCh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2Yob3B0aW9ucykpID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgLy8gSWYgbG9jYWxmb3JhZ2UgaXMgcmVhZHkgYW5kIGZ1bGx5IGluaXRpYWxpemVkLCB3ZSBjYW4ndCBzZXRcbiAgICAgICAgICAgIC8vIGFueSBuZXcgY29uZmlndXJhdGlvbiB2YWx1ZXMuIEluc3RlYWQsIHdlIHJldHVybiBhbiBlcnJvci5cbiAgICAgICAgICAgIGlmICh0aGlzLl9yZWFkeSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRXJyb3IoXCJDYW4ndCBjYWxsIGNvbmZpZygpIGFmdGVyIGxvY2FsZm9yYWdlIFwiICsgJ2hhcyBiZWVuIHVzZWQuJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgICAgIGlmIChpID09PSAnc3RvcmVOYW1lJykge1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zW2ldID0gb3B0aW9uc1tpXS5yZXBsYWNlKC9cXFcvZywgJ18nKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoaSA9PT0gJ3ZlcnNpb24nICYmIHR5cGVvZiBvcHRpb25zW2ldICE9PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEVycm9yKCdEYXRhYmFzZSB2ZXJzaW9uIG11c3QgYmUgYSBudW1iZXIuJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5fY29uZmlnW2ldID0gb3B0aW9uc1tpXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gYWZ0ZXIgYWxsIGNvbmZpZyBvcHRpb25zIGFyZSBzZXQgYW5kXG4gICAgICAgICAgICAvLyB0aGUgZHJpdmVyIG9wdGlvbiBpcyB1c2VkLCB0cnkgc2V0dGluZyBpdFxuICAgICAgICAgICAgaWYgKCdkcml2ZXInIGluIG9wdGlvbnMgJiYgb3B0aW9ucy5kcml2ZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXREcml2ZXIodGhpcy5fY29uZmlnLmRyaXZlcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NvbmZpZ1tvcHRpb25zXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb25maWc7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gVXNlZCB0byBkZWZpbmUgYSBjdXN0b20gZHJpdmVyLCBzaGFyZWQgYWNyb3NzIGFsbCBpbnN0YW5jZXMgb2ZcbiAgICAvLyBsb2NhbEZvcmFnZS5cblxuXG4gICAgTG9jYWxGb3JhZ2UucHJvdG90eXBlLmRlZmluZURyaXZlciA9IGZ1bmN0aW9uIGRlZmluZURyaXZlcihkcml2ZXJPYmplY3QsIGNhbGxiYWNrLCBlcnJvckNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UkMShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHZhciBkcml2ZXJOYW1lID0gZHJpdmVyT2JqZWN0Ll9kcml2ZXI7XG4gICAgICAgICAgICAgICAgdmFyIGNvbXBsaWFuY2VFcnJvciA9IG5ldyBFcnJvcignQ3VzdG9tIGRyaXZlciBub3QgY29tcGxpYW50OyBzZWUgJyArICdodHRwczovL21vemlsbGEuZ2l0aHViLmlvL2xvY2FsRm9yYWdlLyNkZWZpbmVkcml2ZXInKTtcblxuICAgICAgICAgICAgICAgIC8vIEEgZHJpdmVyIG5hbWUgc2hvdWxkIGJlIGRlZmluZWQgYW5kIG5vdCBvdmVybGFwIHdpdGggdGhlXG4gICAgICAgICAgICAgICAgLy8gbGlicmFyeS1kZWZpbmVkLCBkZWZhdWx0IGRyaXZlcnMuXG4gICAgICAgICAgICAgICAgaWYgKCFkcml2ZXJPYmplY3QuX2RyaXZlcikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoY29tcGxpYW5jZUVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBkcml2ZXJNZXRob2RzID0gTGlicmFyeU1ldGhvZHMuY29uY2F0KCdfaW5pdFN0b3JhZ2UnKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gZHJpdmVyTWV0aG9kcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZHJpdmVyTWV0aG9kTmFtZSA9IGRyaXZlck1ldGhvZHNbaV07XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gd2hlbiB0aGUgcHJvcGVydHkgaXMgdGhlcmUsXG4gICAgICAgICAgICAgICAgICAgIC8vIGl0IHNob3VsZCBiZSBhIG1ldGhvZCBldmVuIHdoZW4gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlzUmVxdWlyZWQgPSAhaW5jbHVkZXMoT3B0aW9uYWxEcml2ZXJNZXRob2RzLCBkcml2ZXJNZXRob2ROYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKChpc1JlcXVpcmVkIHx8IGRyaXZlck9iamVjdFtkcml2ZXJNZXRob2ROYW1lXSkgJiYgdHlwZW9mIGRyaXZlck9iamVjdFtkcml2ZXJNZXRob2ROYW1lXSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGNvbXBsaWFuY2VFcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgY29uZmlndXJlTWlzc2luZ01ldGhvZHMgPSBmdW5jdGlvbiBjb25maWd1cmVNaXNzaW5nTWV0aG9kcygpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1ldGhvZE5vdEltcGxlbWVudGVkRmFjdG9yeSA9IGZ1bmN0aW9uIG1ldGhvZE5vdEltcGxlbWVudGVkRmFjdG9yeShtZXRob2ROYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlcnJvciA9IG5ldyBFcnJvcignTWV0aG9kICcgKyBtZXRob2ROYW1lICsgJyBpcyBub3QgaW1wbGVtZW50ZWQgYnkgdGhlIGN1cnJlbnQgZHJpdmVyJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHByb21pc2UgPSBQcm9taXNlJDEucmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgYXJndW1lbnRzW2FyZ3VtZW50cy5sZW5ndGggLSAxXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgX2xlbiA9IE9wdGlvbmFsRHJpdmVyTWV0aG9kcy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9wdGlvbmFsRHJpdmVyTWV0aG9kID0gT3B0aW9uYWxEcml2ZXJNZXRob2RzW19pXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZHJpdmVyT2JqZWN0W29wdGlvbmFsRHJpdmVyTWV0aG9kXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyaXZlck9iamVjdFtvcHRpb25hbERyaXZlck1ldGhvZF0gPSBtZXRob2ROb3RJbXBsZW1lbnRlZEZhY3Rvcnkob3B0aW9uYWxEcml2ZXJNZXRob2QpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyZU1pc3NpbmdNZXRob2RzKCk7XG5cbiAgICAgICAgICAgICAgICB2YXIgc2V0RHJpdmVyU3VwcG9ydCA9IGZ1bmN0aW9uIHNldERyaXZlclN1cHBvcnQoc3VwcG9ydCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoRGVmaW5lZERyaXZlcnNbZHJpdmVyTmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnUmVkZWZpbmluZyBMb2NhbEZvcmFnZSBkcml2ZXI6ICcgKyBkcml2ZXJOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBEZWZpbmVkRHJpdmVyc1tkcml2ZXJOYW1lXSA9IGRyaXZlck9iamVjdDtcbiAgICAgICAgICAgICAgICAgICAgRHJpdmVyU3VwcG9ydFtkcml2ZXJOYW1lXSA9IHN1cHBvcnQ7XG4gICAgICAgICAgICAgICAgICAgIC8vIGRvbid0IHVzZSBhIHRoZW4sIHNvIHRoYXQgd2UgY2FuIGRlZmluZVxuICAgICAgICAgICAgICAgICAgICAvLyBkcml2ZXJzIHRoYXQgaGF2ZSBzaW1wbGUgX3N1cHBvcnQgbWV0aG9kc1xuICAgICAgICAgICAgICAgICAgICAvLyBpbiBhIGJsb2NraW5nIG1hbm5lclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGlmICgnX3N1cHBvcnQnIGluIGRyaXZlck9iamVjdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZHJpdmVyT2JqZWN0Ll9zdXBwb3J0ICYmIHR5cGVvZiBkcml2ZXJPYmplY3QuX3N1cHBvcnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyaXZlck9iamVjdC5fc3VwcG9ydCgpLnRoZW4oc2V0RHJpdmVyU3VwcG9ydCwgcmVqZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldERyaXZlclN1cHBvcnQoISFkcml2ZXJPYmplY3QuX3N1cHBvcnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0RHJpdmVyU3VwcG9ydCh0cnVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBleGVjdXRlVHdvQ2FsbGJhY2tzKHByb21pc2UsIGNhbGxiYWNrLCBlcnJvckNhbGxiYWNrKTtcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfTtcblxuICAgIExvY2FsRm9yYWdlLnByb3RvdHlwZS5kcml2ZXIgPSBmdW5jdGlvbiBkcml2ZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kcml2ZXIgfHwgbnVsbDtcbiAgICB9O1xuXG4gICAgTG9jYWxGb3JhZ2UucHJvdG90eXBlLmdldERyaXZlciA9IGZ1bmN0aW9uIGdldERyaXZlcihkcml2ZXJOYW1lLCBjYWxsYmFjaywgZXJyb3JDYWxsYmFjaykge1xuICAgICAgICB2YXIgZ2V0RHJpdmVyUHJvbWlzZSA9IERlZmluZWREcml2ZXJzW2RyaXZlck5hbWVdID8gUHJvbWlzZSQxLnJlc29sdmUoRGVmaW5lZERyaXZlcnNbZHJpdmVyTmFtZV0pIDogUHJvbWlzZSQxLnJlamVjdChuZXcgRXJyb3IoJ0RyaXZlciBub3QgZm91bmQuJykpO1xuXG4gICAgICAgIGV4ZWN1dGVUd29DYWxsYmFja3MoZ2V0RHJpdmVyUHJvbWlzZSwgY2FsbGJhY2ssIGVycm9yQ2FsbGJhY2spO1xuICAgICAgICByZXR1cm4gZ2V0RHJpdmVyUHJvbWlzZTtcbiAgICB9O1xuXG4gICAgTG9jYWxGb3JhZ2UucHJvdG90eXBlLmdldFNlcmlhbGl6ZXIgPSBmdW5jdGlvbiBnZXRTZXJpYWxpemVyKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzZXJpYWxpemVyUHJvbWlzZSA9IFByb21pc2UkMS5yZXNvbHZlKGxvY2FsZm9yYWdlU2VyaWFsaXplcik7XG4gICAgICAgIGV4ZWN1dGVUd29DYWxsYmFja3Moc2VyaWFsaXplclByb21pc2UsIGNhbGxiYWNrKTtcbiAgICAgICAgcmV0dXJuIHNlcmlhbGl6ZXJQcm9taXNlO1xuICAgIH07XG5cbiAgICBMb2NhbEZvcmFnZS5wcm90b3R5cGUucmVhZHkgPSBmdW5jdGlvbiByZWFkeShjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgdmFyIHByb21pc2UgPSBzZWxmLl9kcml2ZXJTZXQudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoc2VsZi5fcmVhZHkgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9yZWFkeSA9IHNlbGYuX2luaXREcml2ZXIoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuX3JlYWR5O1xuICAgICAgICB9KTtcblxuICAgICAgICBleGVjdXRlVHdvQ2FsbGJhY2tzKHByb21pc2UsIGNhbGxiYWNrLCBjYWxsYmFjayk7XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH07XG5cbiAgICBMb2NhbEZvcmFnZS5wcm90b3R5cGUuc2V0RHJpdmVyID0gZnVuY3Rpb24gc2V0RHJpdmVyKGRyaXZlcnMsIGNhbGxiYWNrLCBlcnJvckNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICBpZiAoIWlzQXJyYXkoZHJpdmVycykpIHtcbiAgICAgICAgICAgIGRyaXZlcnMgPSBbZHJpdmVyc107XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc3VwcG9ydGVkRHJpdmVycyA9IHRoaXMuX2dldFN1cHBvcnRlZERyaXZlcnMoZHJpdmVycyk7XG5cbiAgICAgICAgZnVuY3Rpb24gc2V0RHJpdmVyVG9Db25maWcoKSB7XG4gICAgICAgICAgICBzZWxmLl9jb25maWcuZHJpdmVyID0gc2VsZi5kcml2ZXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGV4dGVuZFNlbGZXaXRoRHJpdmVyKGRyaXZlcikge1xuICAgICAgICAgICAgc2VsZi5fZXh0ZW5kKGRyaXZlcik7XG4gICAgICAgICAgICBzZXREcml2ZXJUb0NvbmZpZygpO1xuXG4gICAgICAgICAgICBzZWxmLl9yZWFkeSA9IHNlbGYuX2luaXRTdG9yYWdlKHNlbGYuX2NvbmZpZyk7XG4gICAgICAgICAgICByZXR1cm4gc2VsZi5fcmVhZHk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBpbml0RHJpdmVyKHN1cHBvcnRlZERyaXZlcnMpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnREcml2ZXJJbmRleCA9IDA7XG5cbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBkcml2ZXJQcm9taXNlTG9vcCgpIHtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGN1cnJlbnREcml2ZXJJbmRleCA8IHN1cHBvcnRlZERyaXZlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZHJpdmVyTmFtZSA9IHN1cHBvcnRlZERyaXZlcnNbY3VycmVudERyaXZlckluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnREcml2ZXJJbmRleCsrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9kYkluZm8gPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5fcmVhZHkgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5nZXREcml2ZXIoZHJpdmVyTmFtZSkudGhlbihleHRlbmRTZWxmV2l0aERyaXZlcilbXCJjYXRjaFwiXShkcml2ZXJQcm9taXNlTG9vcCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBzZXREcml2ZXJUb0NvbmZpZygpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IoJ05vIGF2YWlsYWJsZSBzdG9yYWdlIG1ldGhvZCBmb3VuZC4nKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fZHJpdmVyU2V0ID0gUHJvbWlzZSQxLnJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLl9kcml2ZXJTZXQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRyaXZlclByb21pc2VMb29wKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlcmUgbWlnaHQgYmUgYSBkcml2ZXIgaW5pdGlhbGl6YXRpb24gaW4gcHJvZ3Jlc3NcbiAgICAgICAgLy8gc28gd2FpdCBmb3IgaXQgdG8gZmluaXNoIGluIG9yZGVyIHRvIGF2b2lkIGEgcG9zc2libGVcbiAgICAgICAgLy8gcmFjZSBjb25kaXRpb24gdG8gc2V0IF9kYkluZm9cbiAgICAgICAgdmFyIG9sZERyaXZlclNldERvbmUgPSB0aGlzLl9kcml2ZXJTZXQgIT09IG51bGwgPyB0aGlzLl9kcml2ZXJTZXRbXCJjYXRjaFwiXShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZSQxLnJlc29sdmUoKTtcbiAgICAgICAgfSkgOiBQcm9taXNlJDEucmVzb2x2ZSgpO1xuXG4gICAgICAgIHRoaXMuX2RyaXZlclNldCA9IG9sZERyaXZlclNldERvbmUudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZHJpdmVyTmFtZSA9IHN1cHBvcnRlZERyaXZlcnNbMF07XG4gICAgICAgICAgICBzZWxmLl9kYkluZm8gPSBudWxsO1xuICAgICAgICAgICAgc2VsZi5fcmVhZHkgPSBudWxsO1xuXG4gICAgICAgICAgICByZXR1cm4gc2VsZi5nZXREcml2ZXIoZHJpdmVyTmFtZSkudGhlbihmdW5jdGlvbiAoZHJpdmVyKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZHJpdmVyID0gZHJpdmVyLl9kcml2ZXI7XG4gICAgICAgICAgICAgICAgc2V0RHJpdmVyVG9Db25maWcoKTtcbiAgICAgICAgICAgICAgICBzZWxmLl93cmFwTGlicmFyeU1ldGhvZHNXaXRoUmVhZHkoKTtcbiAgICAgICAgICAgICAgICBzZWxmLl9pbml0RHJpdmVyID0gaW5pdERyaXZlcihzdXBwb3J0ZWREcml2ZXJzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVtcImNhdGNoXCJdKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNldERyaXZlclRvQ29uZmlnKCk7XG4gICAgICAgICAgICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IoJ05vIGF2YWlsYWJsZSBzdG9yYWdlIG1ldGhvZCBmb3VuZC4nKTtcbiAgICAgICAgICAgIHNlbGYuX2RyaXZlclNldCA9IFByb21pc2UkMS5yZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIHNlbGYuX2RyaXZlclNldDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZXhlY3V0ZVR3b0NhbGxiYWNrcyh0aGlzLl9kcml2ZXJTZXQsIGNhbGxiYWNrLCBlcnJvckNhbGxiYWNrKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RyaXZlclNldDtcbiAgICB9O1xuXG4gICAgTG9jYWxGb3JhZ2UucHJvdG90eXBlLnN1cHBvcnRzID0gZnVuY3Rpb24gc3VwcG9ydHMoZHJpdmVyTmFtZSkge1xuICAgICAgICByZXR1cm4gISFEcml2ZXJTdXBwb3J0W2RyaXZlck5hbWVdO1xuICAgIH07XG5cbiAgICBMb2NhbEZvcmFnZS5wcm90b3R5cGUuX2V4dGVuZCA9IGZ1bmN0aW9uIF9leHRlbmQobGlicmFyeU1ldGhvZHNBbmRQcm9wZXJ0aWVzKSB7XG4gICAgICAgIGV4dGVuZCh0aGlzLCBsaWJyYXJ5TWV0aG9kc0FuZFByb3BlcnRpZXMpO1xuICAgIH07XG5cbiAgICBMb2NhbEZvcmFnZS5wcm90b3R5cGUuX2dldFN1cHBvcnRlZERyaXZlcnMgPSBmdW5jdGlvbiBfZ2V0U3VwcG9ydGVkRHJpdmVycyhkcml2ZXJzKSB7XG4gICAgICAgIHZhciBzdXBwb3J0ZWREcml2ZXJzID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBkcml2ZXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgZHJpdmVyTmFtZSA9IGRyaXZlcnNbaV07XG4gICAgICAgICAgICBpZiAodGhpcy5zdXBwb3J0cyhkcml2ZXJOYW1lKSkge1xuICAgICAgICAgICAgICAgIHN1cHBvcnRlZERyaXZlcnMucHVzaChkcml2ZXJOYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3VwcG9ydGVkRHJpdmVycztcbiAgICB9O1xuXG4gICAgTG9jYWxGb3JhZ2UucHJvdG90eXBlLl93cmFwTGlicmFyeU1ldGhvZHNXaXRoUmVhZHkgPSBmdW5jdGlvbiBfd3JhcExpYnJhcnlNZXRob2RzV2l0aFJlYWR5KCkge1xuICAgICAgICAvLyBBZGQgYSBzdHViIGZvciBlYWNoIGRyaXZlciBBUEkgbWV0aG9kIHRoYXQgZGVsYXlzIHRoZSBjYWxsIHRvIHRoZVxuICAgICAgICAvLyBjb3JyZXNwb25kaW5nIGRyaXZlciBtZXRob2QgdW50aWwgbG9jYWxGb3JhZ2UgaXMgcmVhZHkuIFRoZXNlIHN0dWJzXG4gICAgICAgIC8vIHdpbGwgYmUgcmVwbGFjZWQgYnkgdGhlIGRyaXZlciBtZXRob2RzIGFzIHNvb24gYXMgdGhlIGRyaXZlciBpc1xuICAgICAgICAvLyBsb2FkZWQsIHNvIHRoZXJlIGlzIG5vIHBlcmZvcm1hbmNlIGltcGFjdC5cbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IExpYnJhcnlNZXRob2RzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBjYWxsV2hlblJlYWR5KHRoaXMsIExpYnJhcnlNZXRob2RzW2ldKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBMb2NhbEZvcmFnZS5wcm90b3R5cGUuY3JlYXRlSW5zdGFuY2UgPSBmdW5jdGlvbiBjcmVhdGVJbnN0YW5jZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBuZXcgTG9jYWxGb3JhZ2Uob3B0aW9ucyk7XG4gICAgfTtcblxuICAgIHJldHVybiBMb2NhbEZvcmFnZTtcbn0oKTtcblxuLy8gVGhlIGFjdHVhbCBsb2NhbEZvcmFnZSBvYmplY3QgdGhhdCB3ZSBleHBvc2UgYXMgYSBtb2R1bGUgb3IgdmlhIGFcbi8vIGdsb2JhbC4gSXQncyBleHRlbmRlZCBieSBwdWxsaW5nIGluIG9uZSBvZiBvdXIgb3RoZXIgbGlicmFyaWVzLlxuXG5cbnZhciBsb2NhbGZvcmFnZV9qcyA9IG5ldyBMb2NhbEZvcmFnZSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGxvY2FsZm9yYWdlX2pzO1xuXG59LHtcIjNcIjozfV19LHt9LFs0XSkoNClcbn0pO1xuIiwiLyoqXG4gKiBIZWxwZXJzLlxuICovXG5cbnZhciBzID0gMTAwMDtcbnZhciBtID0gcyAqIDYwO1xudmFyIGggPSBtICogNjA7XG52YXIgZCA9IGggKiAyNDtcbnZhciB5ID0gZCAqIDM2NS4yNTtcblxuLyoqXG4gKiBQYXJzZSBvciBmb3JtYXQgdGhlIGdpdmVuIGB2YWxgLlxuICpcbiAqIE9wdGlvbnM6XG4gKlxuICogIC0gYGxvbmdgIHZlcmJvc2UgZm9ybWF0dGluZyBbZmFsc2VdXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8TnVtYmVyfSB2YWxcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAqIEB0aHJvd3Mge0Vycm9yfSB0aHJvdyBhbiBlcnJvciBpZiB2YWwgaXMgbm90IGEgbm9uLWVtcHR5IHN0cmluZyBvciBhIG51bWJlclxuICogQHJldHVybiB7U3RyaW5nfE51bWJlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih2YWwsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbDtcbiAgaWYgKHR5cGUgPT09ICdzdHJpbmcnICYmIHZhbC5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIHBhcnNlKHZhbCk7XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ251bWJlcicgJiYgaXNOYU4odmFsKSA9PT0gZmFsc2UpIHtcbiAgICByZXR1cm4gb3B0aW9ucy5sb25nID8gZm10TG9uZyh2YWwpIDogZm10U2hvcnQodmFsKTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgJ3ZhbCBpcyBub3QgYSBub24tZW1wdHkgc3RyaW5nIG9yIGEgdmFsaWQgbnVtYmVyLiB2YWw9JyArXG4gICAgICBKU09OLnN0cmluZ2lmeSh2YWwpXG4gICk7XG59O1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBgc3RyYCBhbmQgcmV0dXJuIG1pbGxpc2Vjb25kcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZShzdHIpIHtcbiAgc3RyID0gU3RyaW5nKHN0cik7XG4gIGlmIChzdHIubGVuZ3RoID4gMTAwKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBtYXRjaCA9IC9eKCg/OlxcZCspP1xcLj9cXGQrKSAqKG1pbGxpc2Vjb25kcz98bXNlY3M/fG1zfHNlY29uZHM/fHNlY3M/fHN8bWludXRlcz98bWlucz98bXxob3Vycz98aHJzP3xofGRheXM/fGR8eWVhcnM/fHlycz98eSk/JC9pLmV4ZWMoXG4gICAgc3RyXG4gICk7XG4gIGlmICghbWF0Y2gpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIG4gPSBwYXJzZUZsb2F0KG1hdGNoWzFdKTtcbiAgdmFyIHR5cGUgPSAobWF0Y2hbMl0gfHwgJ21zJykudG9Mb3dlckNhc2UoKTtcbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSAneWVhcnMnOlxuICAgIGNhc2UgJ3llYXInOlxuICAgIGNhc2UgJ3lycyc6XG4gICAgY2FzZSAneXInOlxuICAgIGNhc2UgJ3knOlxuICAgICAgcmV0dXJuIG4gKiB5O1xuICAgIGNhc2UgJ2RheXMnOlxuICAgIGNhc2UgJ2RheSc6XG4gICAgY2FzZSAnZCc6XG4gICAgICByZXR1cm4gbiAqIGQ7XG4gICAgY2FzZSAnaG91cnMnOlxuICAgIGNhc2UgJ2hvdXInOlxuICAgIGNhc2UgJ2hycyc6XG4gICAgY2FzZSAnaHInOlxuICAgIGNhc2UgJ2gnOlxuICAgICAgcmV0dXJuIG4gKiBoO1xuICAgIGNhc2UgJ21pbnV0ZXMnOlxuICAgIGNhc2UgJ21pbnV0ZSc6XG4gICAgY2FzZSAnbWlucyc6XG4gICAgY2FzZSAnbWluJzpcbiAgICBjYXNlICdtJzpcbiAgICAgIHJldHVybiBuICogbTtcbiAgICBjYXNlICdzZWNvbmRzJzpcbiAgICBjYXNlICdzZWNvbmQnOlxuICAgIGNhc2UgJ3NlY3MnOlxuICAgIGNhc2UgJ3NlYyc6XG4gICAgY2FzZSAncyc6XG4gICAgICByZXR1cm4gbiAqIHM7XG4gICAgY2FzZSAnbWlsbGlzZWNvbmRzJzpcbiAgICBjYXNlICdtaWxsaXNlY29uZCc6XG4gICAgY2FzZSAnbXNlY3MnOlxuICAgIGNhc2UgJ21zZWMnOlxuICAgIGNhc2UgJ21zJzpcbiAgICAgIHJldHVybiBuO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG5cbi8qKlxuICogU2hvcnQgZm9ybWF0IGZvciBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtc1xuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZm10U2hvcnQobXMpIHtcbiAgaWYgKG1zID49IGQpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIGQpICsgJ2QnO1xuICB9XG4gIGlmIChtcyA+PSBoKSB7XG4gICAgcmV0dXJuIE1hdGgucm91bmQobXMgLyBoKSArICdoJztcbiAgfVxuICBpZiAobXMgPj0gbSkge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gbSkgKyAnbSc7XG4gIH1cbiAgaWYgKG1zID49IHMpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIHMpICsgJ3MnO1xuICB9XG4gIHJldHVybiBtcyArICdtcyc7XG59XG5cbi8qKlxuICogTG9uZyBmb3JtYXQgZm9yIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBmbXRMb25nKG1zKSB7XG4gIHJldHVybiBwbHVyYWwobXMsIGQsICdkYXknKSB8fFxuICAgIHBsdXJhbChtcywgaCwgJ2hvdXInKSB8fFxuICAgIHBsdXJhbChtcywgbSwgJ21pbnV0ZScpIHx8XG4gICAgcGx1cmFsKG1zLCBzLCAnc2Vjb25kJykgfHxcbiAgICBtcyArICcgbXMnO1xufVxuXG4vKipcbiAqIFBsdXJhbGl6YXRpb24gaGVscGVyLlxuICovXG5cbmZ1bmN0aW9uIHBsdXJhbChtcywgbiwgbmFtZSkge1xuICBpZiAobXMgPCBuKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChtcyA8IG4gKiAxLjUpIHtcbiAgICByZXR1cm4gTWF0aC5mbG9vcihtcyAvIG4pICsgJyAnICsgbmFtZTtcbiAgfVxuICByZXR1cm4gTWF0aC5jZWlsKG1zIC8gbikgKyAnICcgKyBuYW1lICsgJ3MnO1xufVxuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KXtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qaXN0YW5idWwgaWdub3JlIG5leHQ6Y2FudCB0ZXN0Ki9cbiAgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKFtdLCBmYWN0b3J5KTtcbiAgfSBlbHNlIHtcbiAgICAvLyBCcm93c2VyIGdsb2JhbHNcbiAgICByb290Lm9iamVjdFBhdGggPSBmYWN0b3J5KCk7XG4gIH1cbn0pKHRoaXMsIGZ1bmN0aW9uKCl7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgdG9TdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuICBmdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgICBpZihvYmogPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIC8vdG8gaGFuZGxlIG9iamVjdHMgd2l0aCBudWxsIHByb3RvdHlwZXMgKHRvbyBlZGdlIGNhc2U/KVxuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKVxuICB9XG5cbiAgZnVuY3Rpb24gaXNFbXB0eSh2YWx1ZSl7XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmIChpc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGZvciAodmFyIGkgaW4gdmFsdWUpIHtcbiAgICAgICAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgaSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRvU3RyaW5nKHR5cGUpe1xuICAgIHJldHVybiB0b1N0ci5jYWxsKHR5cGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNPYmplY3Qob2JqKXtcbiAgICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgdG9TdHJpbmcob2JqKSA9PT0gXCJbb2JqZWN0IE9iamVjdF1cIjtcbiAgfVxuXG4gIHZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbihvYmope1xuICAgIC8qaXN0YW5idWwgaWdub3JlIG5leHQ6Y2FudCB0ZXN0Ki9cbiAgICByZXR1cm4gdG9TdHIuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNCb29sZWFuKG9iail7XG4gICAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdib29sZWFuJyB8fCB0b1N0cmluZyhvYmopID09PSAnW29iamVjdCBCb29sZWFuXSc7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRLZXkoa2V5KXtcbiAgICB2YXIgaW50S2V5ID0gcGFyc2VJbnQoa2V5KTtcbiAgICBpZiAoaW50S2V5LnRvU3RyaW5nKCkgPT09IGtleSkge1xuICAgICAgcmV0dXJuIGludEtleTtcbiAgICB9XG4gICAgcmV0dXJuIGtleTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZhY3Rvcnkob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG5cbiAgICB2YXIgb2JqZWN0UGF0aCA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iamVjdFBhdGgpLnJlZHVjZShmdW5jdGlvbihwcm94eSwgcHJvcCkge1xuICAgICAgICBpZihwcm9wID09PSAnY3JlYXRlJykge1xuICAgICAgICAgIHJldHVybiBwcm94eTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qaXN0YW5idWwgaWdub3JlIGVsc2UqL1xuICAgICAgICBpZiAodHlwZW9mIG9iamVjdFBhdGhbcHJvcF0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBwcm94eVtwcm9wXSA9IG9iamVjdFBhdGhbcHJvcF0uYmluZChvYmplY3RQYXRoLCBvYmopO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHByb3h5O1xuICAgICAgfSwge30pO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBoYXNTaGFsbG93UHJvcGVydHkob2JqLCBwcm9wKSB7XG4gICAgICByZXR1cm4gKG9wdGlvbnMuaW5jbHVkZUluaGVyaXRlZFByb3BzIHx8ICh0eXBlb2YgcHJvcCA9PT0gJ251bWJlcicgJiYgQXJyYXkuaXNBcnJheShvYmopKSB8fCBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApKVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFNoYWxsb3dQcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgICAgIGlmIChoYXNTaGFsbG93UHJvcGVydHkob2JqLCBwcm9wKSkge1xuICAgICAgICByZXR1cm4gb2JqW3Byb3BdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldChvYmosIHBhdGgsIHZhbHVlLCBkb05vdFJlcGxhY2Upe1xuICAgICAgaWYgKHR5cGVvZiBwYXRoID09PSAnbnVtYmVyJykge1xuICAgICAgICBwYXRoID0gW3BhdGhdO1xuICAgICAgfVxuICAgICAgaWYgKCFwYXRoIHx8IHBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHBhdGggPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBzZXQob2JqLCBwYXRoLnNwbGl0KCcuJykubWFwKGdldEtleSksIHZhbHVlLCBkb05vdFJlcGxhY2UpO1xuICAgICAgfVxuICAgICAgdmFyIGN1cnJlbnRQYXRoID0gcGF0aFswXTtcbiAgICAgIHZhciBjdXJyZW50VmFsdWUgPSBnZXRTaGFsbG93UHJvcGVydHkob2JqLCBjdXJyZW50UGF0aCk7XG4gICAgICBpZiAocGF0aC5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgaWYgKGN1cnJlbnRWYWx1ZSA9PT0gdm9pZCAwIHx8ICFkb05vdFJlcGxhY2UpIHtcbiAgICAgICAgICBvYmpbY3VycmVudFBhdGhdID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGN1cnJlbnRWYWx1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGN1cnJlbnRWYWx1ZSA9PT0gdm9pZCAwKSB7XG4gICAgICAgIC8vY2hlY2sgaWYgd2UgYXNzdW1lIGFuIGFycmF5XG4gICAgICAgIGlmKHR5cGVvZiBwYXRoWzFdID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIG9ialtjdXJyZW50UGF0aF0gPSBbXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvYmpbY3VycmVudFBhdGhdID0ge307XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNldChvYmpbY3VycmVudFBhdGhdLCBwYXRoLnNsaWNlKDEpLCB2YWx1ZSwgZG9Ob3RSZXBsYWNlKTtcbiAgICB9XG5cbiAgICBvYmplY3RQYXRoLmhhcyA9IGZ1bmN0aW9uIChvYmosIHBhdGgpIHtcbiAgICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcGF0aCA9IFtwYXRoXTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHBhdGggPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHBhdGggPSBwYXRoLnNwbGl0KCcuJyk7XG4gICAgICB9XG5cbiAgICAgIGlmICghcGF0aCB8fCBwYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gISFvYmo7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGF0aC5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgaiA9IGdldEtleShwYXRoW2ldKTtcblxuICAgICAgICBpZigodHlwZW9mIGogPT09ICdudW1iZXInICYmIGlzQXJyYXkob2JqKSAmJiBqIDwgb2JqLmxlbmd0aCkgfHxcbiAgICAgICAgICAob3B0aW9ucy5pbmNsdWRlSW5oZXJpdGVkUHJvcHMgPyAoaiBpbiBPYmplY3Qob2JqKSkgOiBoYXNPd25Qcm9wZXJ0eShvYmosIGopKSkge1xuICAgICAgICAgIG9iaiA9IG9ialtqXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIG9iamVjdFBhdGguZW5zdXJlRXhpc3RzID0gZnVuY3Rpb24gKG9iaiwgcGF0aCwgdmFsdWUpe1xuICAgICAgcmV0dXJuIHNldChvYmosIHBhdGgsIHZhbHVlLCB0cnVlKTtcbiAgICB9O1xuXG4gICAgb2JqZWN0UGF0aC5zZXQgPSBmdW5jdGlvbiAob2JqLCBwYXRoLCB2YWx1ZSwgZG9Ob3RSZXBsYWNlKXtcbiAgICAgIHJldHVybiBzZXQob2JqLCBwYXRoLCB2YWx1ZSwgZG9Ob3RSZXBsYWNlKTtcbiAgICB9O1xuXG4gICAgb2JqZWN0UGF0aC5pbnNlcnQgPSBmdW5jdGlvbiAob2JqLCBwYXRoLCB2YWx1ZSwgYXQpe1xuICAgICAgdmFyIGFyciA9IG9iamVjdFBhdGguZ2V0KG9iaiwgcGF0aCk7XG4gICAgICBhdCA9IH5+YXQ7XG4gICAgICBpZiAoIWlzQXJyYXkoYXJyKSkge1xuICAgICAgICBhcnIgPSBbXTtcbiAgICAgICAgb2JqZWN0UGF0aC5zZXQob2JqLCBwYXRoLCBhcnIpO1xuICAgICAgfVxuICAgICAgYXJyLnNwbGljZShhdCwgMCwgdmFsdWUpO1xuICAgIH07XG5cbiAgICBvYmplY3RQYXRoLmVtcHR5ID0gZnVuY3Rpb24ob2JqLCBwYXRoKSB7XG4gICAgICBpZiAoaXNFbXB0eShwYXRoKSkge1xuICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgfVxuICAgICAgaWYgKG9iaiA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICB9XG5cbiAgICAgIHZhciB2YWx1ZSwgaTtcbiAgICAgIGlmICghKHZhbHVlID0gb2JqZWN0UGF0aC5nZXQob2JqLCBwYXRoKSkpIHtcbiAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdFBhdGguc2V0KG9iaiwgcGF0aCwgJycpO1xuICAgICAgfSBlbHNlIGlmIChpc0Jvb2xlYW4odmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBvYmplY3RQYXRoLnNldChvYmosIHBhdGgsIGZhbHNlKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgICAgICByZXR1cm4gb2JqZWN0UGF0aC5zZXQob2JqLCBwYXRoLCAwKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgdmFsdWUubGVuZ3RoID0gMDtcbiAgICAgIH0gZWxzZSBpZiAoaXNPYmplY3QodmFsdWUpKSB7XG4gICAgICAgIGZvciAoaSBpbiB2YWx1ZSkge1xuICAgICAgICAgIGlmIChoYXNTaGFsbG93UHJvcGVydHkodmFsdWUsIGkpKSB7XG4gICAgICAgICAgICBkZWxldGUgdmFsdWVbaV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gb2JqZWN0UGF0aC5zZXQob2JqLCBwYXRoLCBudWxsKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgb2JqZWN0UGF0aC5wdXNoID0gZnVuY3Rpb24gKG9iaiwgcGF0aCAvKiwgdmFsdWVzICovKXtcbiAgICAgIHZhciBhcnIgPSBvYmplY3RQYXRoLmdldChvYmosIHBhdGgpO1xuICAgICAgaWYgKCFpc0FycmF5KGFycikpIHtcbiAgICAgICAgYXJyID0gW107XG4gICAgICAgIG9iamVjdFBhdGguc2V0KG9iaiwgcGF0aCwgYXJyKTtcbiAgICAgIH1cblxuICAgICAgYXJyLnB1c2guYXBwbHkoYXJyLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpKTtcbiAgICB9O1xuXG4gICAgb2JqZWN0UGF0aC5jb2FsZXNjZSA9IGZ1bmN0aW9uIChvYmosIHBhdGhzLCBkZWZhdWx0VmFsdWUpIHtcbiAgICAgIHZhciB2YWx1ZTtcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHBhdGhzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGlmICgodmFsdWUgPSBvYmplY3RQYXRoLmdldChvYmosIHBhdGhzW2ldKSkgIT09IHZvaWQgMCkge1xuICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICAgIH07XG5cbiAgICBvYmplY3RQYXRoLmdldCA9IGZ1bmN0aW9uIChvYmosIHBhdGgsIGRlZmF1bHRWYWx1ZSl7XG4gICAgICBpZiAodHlwZW9mIHBhdGggPT09ICdudW1iZXInKSB7XG4gICAgICAgIHBhdGggPSBbcGF0aF07XG4gICAgICB9XG4gICAgICBpZiAoIXBhdGggfHwgcGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgIH1cbiAgICAgIGlmIChvYmogPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBwYXRoID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gb2JqZWN0UGF0aC5nZXQob2JqLCBwYXRoLnNwbGl0KCcuJyksIGRlZmF1bHRWYWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIHZhciBjdXJyZW50UGF0aCA9IGdldEtleShwYXRoWzBdKTtcbiAgICAgIHZhciBuZXh0T2JqID0gZ2V0U2hhbGxvd1Byb3BlcnR5KG9iaiwgY3VycmVudFBhdGgpXG4gICAgICBpZiAobmV4dE9iaiA9PT0gdm9pZCAwKSB7XG4gICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gbmV4dE9iajtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9iamVjdFBhdGguZ2V0KG9ialtjdXJyZW50UGF0aF0sIHBhdGguc2xpY2UoMSksIGRlZmF1bHRWYWx1ZSk7XG4gICAgfTtcblxuICAgIG9iamVjdFBhdGguZGVsID0gZnVuY3Rpb24gZGVsKG9iaiwgcGF0aCkge1xuICAgICAgaWYgKHR5cGVvZiBwYXRoID09PSAnbnVtYmVyJykge1xuICAgICAgICBwYXRoID0gW3BhdGhdO1xuICAgICAgfVxuXG4gICAgICBpZiAob2JqID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzRW1wdHkocGF0aCkpIHtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgIH1cbiAgICAgIGlmKHR5cGVvZiBwYXRoID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gb2JqZWN0UGF0aC5kZWwob2JqLCBwYXRoLnNwbGl0KCcuJykpO1xuICAgICAgfVxuXG4gICAgICB2YXIgY3VycmVudFBhdGggPSBnZXRLZXkocGF0aFswXSk7XG4gICAgICBpZiAoIWhhc1NoYWxsb3dQcm9wZXJ0eShvYmosIGN1cnJlbnRQYXRoKSkge1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgfVxuXG4gICAgICBpZihwYXRoLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgICAgICAgb2JqLnNwbGljZShjdXJyZW50UGF0aCwgMSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVsZXRlIG9ialtjdXJyZW50UGF0aF07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBvYmplY3RQYXRoLmRlbChvYmpbY3VycmVudFBhdGhdLCBwYXRoLnNsaWNlKDEpKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG5cbiAgICByZXR1cm4gb2JqZWN0UGF0aDtcbiAgfVxuXG4gIHZhciBtb2QgPSBmYWN0b3J5KCk7XG4gIG1vZC5jcmVhdGUgPSBmYWN0b3J5O1xuICBtb2Qud2l0aEluaGVyaXRlZFByb3BzID0gZmFjdG9yeSh7aW5jbHVkZUluaGVyaXRlZFByb3BzOiB0cnVlfSlcbiAgcmV0dXJuIG1vZDtcbn0pO1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLy8gVGhpcyBtZXRob2Qgb2Ygb2J0YWluaW5nIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0IG5lZWRzIHRvIGJlXG4vLyBrZXB0IGlkZW50aWNhbCB0byB0aGUgd2F5IGl0IGlzIG9idGFpbmVkIGluIHJ1bnRpbWUuanNcbnZhciBnID0gKGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcyB9KSgpIHx8IEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKTtcblxuLy8gVXNlIGBnZXRPd25Qcm9wZXJ0eU5hbWVzYCBiZWNhdXNlIG5vdCBhbGwgYnJvd3NlcnMgc3VwcG9ydCBjYWxsaW5nXG4vLyBgaGFzT3duUHJvcGVydHlgIG9uIHRoZSBnbG9iYWwgYHNlbGZgIG9iamVjdCBpbiBhIHdvcmtlci4gU2VlICMxODMuXG52YXIgaGFkUnVudGltZSA9IGcucmVnZW5lcmF0b3JSdW50aW1lICYmXG4gIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGcpLmluZGV4T2YoXCJyZWdlbmVyYXRvclJ1bnRpbWVcIikgPj0gMDtcblxuLy8gU2F2ZSB0aGUgb2xkIHJlZ2VuZXJhdG9yUnVudGltZSBpbiBjYXNlIGl0IG5lZWRzIHRvIGJlIHJlc3RvcmVkIGxhdGVyLlxudmFyIG9sZFJ1bnRpbWUgPSBoYWRSdW50aW1lICYmIGcucmVnZW5lcmF0b3JSdW50aW1lO1xuXG4vLyBGb3JjZSByZWV2YWx1dGF0aW9uIG9mIHJ1bnRpbWUuanMuXG5nLnJlZ2VuZXJhdG9yUnVudGltZSA9IHVuZGVmaW5lZDtcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi9ydW50aW1lXCIpO1xuXG5pZiAoaGFkUnVudGltZSkge1xuICAvLyBSZXN0b3JlIHRoZSBvcmlnaW5hbCBydW50aW1lLlxuICBnLnJlZ2VuZXJhdG9yUnVudGltZSA9IG9sZFJ1bnRpbWU7XG59IGVsc2Uge1xuICAvLyBSZW1vdmUgdGhlIGdsb2JhbCBwcm9wZXJ0eSBhZGRlZCBieSBydW50aW1lLmpzLlxuICB0cnkge1xuICAgIGRlbGV0ZSBnLnJlZ2VuZXJhdG9yUnVudGltZTtcbiAgfSBjYXRjaChlKSB7XG4gICAgZy5yZWdlbmVyYXRvclJ1bnRpbWUgPSB1bmRlZmluZWQ7XG4gIH1cbn1cbiIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuIShmdW5jdGlvbihnbG9iYWwpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIE9wID0gT2JqZWN0LnByb3RvdHlwZTtcbiAgdmFyIGhhc093biA9IE9wLmhhc093blByb3BlcnR5O1xuICB2YXIgdW5kZWZpbmVkOyAvLyBNb3JlIGNvbXByZXNzaWJsZSB0aGFuIHZvaWQgMC5cbiAgdmFyICRTeW1ib2wgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgPyBTeW1ib2wgOiB7fTtcbiAgdmFyIGl0ZXJhdG9yU3ltYm9sID0gJFN5bWJvbC5pdGVyYXRvciB8fCBcIkBAaXRlcmF0b3JcIjtcbiAgdmFyIGFzeW5jSXRlcmF0b3JTeW1ib2wgPSAkU3ltYm9sLmFzeW5jSXRlcmF0b3IgfHwgXCJAQGFzeW5jSXRlcmF0b3JcIjtcbiAgdmFyIHRvU3RyaW5nVGFnU3ltYm9sID0gJFN5bWJvbC50b1N0cmluZ1RhZyB8fCBcIkBAdG9TdHJpbmdUYWdcIjtcblxuICB2YXIgaW5Nb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiO1xuICB2YXIgcnVudGltZSA9IGdsb2JhbC5yZWdlbmVyYXRvclJ1bnRpbWU7XG4gIGlmIChydW50aW1lKSB7XG4gICAgaWYgKGluTW9kdWxlKSB7XG4gICAgICAvLyBJZiByZWdlbmVyYXRvclJ1bnRpbWUgaXMgZGVmaW5lZCBnbG9iYWxseSBhbmQgd2UncmUgaW4gYSBtb2R1bGUsXG4gICAgICAvLyBtYWtlIHRoZSBleHBvcnRzIG9iamVjdCBpZGVudGljYWwgdG8gcmVnZW5lcmF0b3JSdW50aW1lLlxuICAgICAgbW9kdWxlLmV4cG9ydHMgPSBydW50aW1lO1xuICAgIH1cbiAgICAvLyBEb24ndCBib3RoZXIgZXZhbHVhdGluZyB0aGUgcmVzdCBvZiB0aGlzIGZpbGUgaWYgdGhlIHJ1bnRpbWUgd2FzXG4gICAgLy8gYWxyZWFkeSBkZWZpbmVkIGdsb2JhbGx5LlxuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIERlZmluZSB0aGUgcnVudGltZSBnbG9iYWxseSAoYXMgZXhwZWN0ZWQgYnkgZ2VuZXJhdGVkIGNvZGUpIGFzIGVpdGhlclxuICAvLyBtb2R1bGUuZXhwb3J0cyAoaWYgd2UncmUgaW4gYSBtb2R1bGUpIG9yIGEgbmV3LCBlbXB0eSBvYmplY3QuXG4gIHJ1bnRpbWUgPSBnbG9iYWwucmVnZW5lcmF0b3JSdW50aW1lID0gaW5Nb2R1bGUgPyBtb2R1bGUuZXhwb3J0cyA6IHt9O1xuXG4gIGZ1bmN0aW9uIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBJZiBvdXRlckZuIHByb3ZpZGVkIGFuZCBvdXRlckZuLnByb3RvdHlwZSBpcyBhIEdlbmVyYXRvciwgdGhlbiBvdXRlckZuLnByb3RvdHlwZSBpbnN0YW5jZW9mIEdlbmVyYXRvci5cbiAgICB2YXIgcHJvdG9HZW5lcmF0b3IgPSBvdXRlckZuICYmIG91dGVyRm4ucHJvdG90eXBlIGluc3RhbmNlb2YgR2VuZXJhdG9yID8gb3V0ZXJGbiA6IEdlbmVyYXRvcjtcbiAgICB2YXIgZ2VuZXJhdG9yID0gT2JqZWN0LmNyZWF0ZShwcm90b0dlbmVyYXRvci5wcm90b3R5cGUpO1xuICAgIHZhciBjb250ZXh0ID0gbmV3IENvbnRleHQodHJ5TG9jc0xpc3QgfHwgW10pO1xuXG4gICAgLy8gVGhlIC5faW52b2tlIG1ldGhvZCB1bmlmaWVzIHRoZSBpbXBsZW1lbnRhdGlvbnMgb2YgdGhlIC5uZXh0LFxuICAgIC8vIC50aHJvdywgYW5kIC5yZXR1cm4gbWV0aG9kcy5cbiAgICBnZW5lcmF0b3IuX2ludm9rZSA9IG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCk7XG5cbiAgICByZXR1cm4gZ2VuZXJhdG9yO1xuICB9XG4gIHJ1bnRpbWUud3JhcCA9IHdyYXA7XG5cbiAgLy8gVHJ5L2NhdGNoIGhlbHBlciB0byBtaW5pbWl6ZSBkZW9wdGltaXphdGlvbnMuIFJldHVybnMgYSBjb21wbGV0aW9uXG4gIC8vIHJlY29yZCBsaWtlIGNvbnRleHQudHJ5RW50cmllc1tpXS5jb21wbGV0aW9uLiBUaGlzIGludGVyZmFjZSBjb3VsZFxuICAvLyBoYXZlIGJlZW4gKGFuZCB3YXMgcHJldmlvdXNseSkgZGVzaWduZWQgdG8gdGFrZSBhIGNsb3N1cmUgdG8gYmVcbiAgLy8gaW52b2tlZCB3aXRob3V0IGFyZ3VtZW50cywgYnV0IGluIGFsbCB0aGUgY2FzZXMgd2UgY2FyZSBhYm91dCB3ZVxuICAvLyBhbHJlYWR5IGhhdmUgYW4gZXhpc3RpbmcgbWV0aG9kIHdlIHdhbnQgdG8gY2FsbCwgc28gdGhlcmUncyBubyBuZWVkXG4gIC8vIHRvIGNyZWF0ZSBhIG5ldyBmdW5jdGlvbiBvYmplY3QuIFdlIGNhbiBldmVuIGdldCBhd2F5IHdpdGggYXNzdW1pbmdcbiAgLy8gdGhlIG1ldGhvZCB0YWtlcyBleGFjdGx5IG9uZSBhcmd1bWVudCwgc2luY2UgdGhhdCBoYXBwZW5zIHRvIGJlIHRydWVcbiAgLy8gaW4gZXZlcnkgY2FzZSwgc28gd2UgZG9uJ3QgaGF2ZSB0byB0b3VjaCB0aGUgYXJndW1lbnRzIG9iamVjdC4gVGhlXG4gIC8vIG9ubHkgYWRkaXRpb25hbCBhbGxvY2F0aW9uIHJlcXVpcmVkIGlzIHRoZSBjb21wbGV0aW9uIHJlY29yZCwgd2hpY2hcbiAgLy8gaGFzIGEgc3RhYmxlIHNoYXBlIGFuZCBzbyBob3BlZnVsbHkgc2hvdWxkIGJlIGNoZWFwIHRvIGFsbG9jYXRlLlxuICBmdW5jdGlvbiB0cnlDYXRjaChmbiwgb2JqLCBhcmcpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJub3JtYWxcIiwgYXJnOiBmbi5jYWxsKG9iaiwgYXJnKSB9O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJ0aHJvd1wiLCBhcmc6IGVyciB9O1xuICAgIH1cbiAgfVxuXG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0ID0gXCJzdXNwZW5kZWRTdGFydFwiO1xuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRZaWVsZCA9IFwic3VzcGVuZGVkWWllbGRcIjtcbiAgdmFyIEdlblN0YXRlRXhlY3V0aW5nID0gXCJleGVjdXRpbmdcIjtcbiAgdmFyIEdlblN0YXRlQ29tcGxldGVkID0gXCJjb21wbGV0ZWRcIjtcblxuICAvLyBSZXR1cm5pbmcgdGhpcyBvYmplY3QgZnJvbSB0aGUgaW5uZXJGbiBoYXMgdGhlIHNhbWUgZWZmZWN0IGFzXG4gIC8vIGJyZWFraW5nIG91dCBvZiB0aGUgZGlzcGF0Y2ggc3dpdGNoIHN0YXRlbWVudC5cbiAgdmFyIENvbnRpbnVlU2VudGluZWwgPSB7fTtcblxuICAvLyBEdW1teSBjb25zdHJ1Y3RvciBmdW5jdGlvbnMgdGhhdCB3ZSB1c2UgYXMgdGhlIC5jb25zdHJ1Y3RvciBhbmRcbiAgLy8gLmNvbnN0cnVjdG9yLnByb3RvdHlwZSBwcm9wZXJ0aWVzIGZvciBmdW5jdGlvbnMgdGhhdCByZXR1cm4gR2VuZXJhdG9yXG4gIC8vIG9iamVjdHMuIEZvciBmdWxsIHNwZWMgY29tcGxpYW5jZSwgeW91IG1heSB3aXNoIHRvIGNvbmZpZ3VyZSB5b3VyXG4gIC8vIG1pbmlmaWVyIG5vdCB0byBtYW5nbGUgdGhlIG5hbWVzIG9mIHRoZXNlIHR3byBmdW5jdGlvbnMuXG4gIGZ1bmN0aW9uIEdlbmVyYXRvcigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUoKSB7fVxuXG4gIC8vIFRoaXMgaXMgYSBwb2x5ZmlsbCBmb3IgJUl0ZXJhdG9yUHJvdG90eXBlJSBmb3IgZW52aXJvbm1lbnRzIHRoYXRcbiAgLy8gZG9uJ3QgbmF0aXZlbHkgc3VwcG9ydCBpdC5cbiAgdmFyIEl0ZXJhdG9yUHJvdG90eXBlID0ge307XG4gIEl0ZXJhdG9yUHJvdG90eXBlW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB2YXIgZ2V0UHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Y7XG4gIHZhciBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSA9IGdldFByb3RvICYmIGdldFByb3RvKGdldFByb3RvKHZhbHVlcyhbXSkpKTtcbiAgaWYgKE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlICYmXG4gICAgICBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSAhPT0gT3AgJiZcbiAgICAgIGhhc093bi5jYWxsKE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlLCBpdGVyYXRvclN5bWJvbCkpIHtcbiAgICAvLyBUaGlzIGVudmlyb25tZW50IGhhcyBhIG5hdGl2ZSAlSXRlcmF0b3JQcm90b3R5cGUlOyB1c2UgaXQgaW5zdGVhZFxuICAgIC8vIG9mIHRoZSBwb2x5ZmlsbC5cbiAgICBJdGVyYXRvclByb3RvdHlwZSA9IE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlO1xuICB9XG5cbiAgdmFyIEdwID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUucHJvdG90eXBlID1cbiAgICBHZW5lcmF0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShJdGVyYXRvclByb3RvdHlwZSk7XG4gIEdlbmVyYXRvckZ1bmN0aW9uLnByb3RvdHlwZSA9IEdwLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb247XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlW3RvU3RyaW5nVGFnU3ltYm9sXSA9XG4gICAgR2VuZXJhdG9yRnVuY3Rpb24uZGlzcGxheU5hbWUgPSBcIkdlbmVyYXRvckZ1bmN0aW9uXCI7XG5cbiAgLy8gSGVscGVyIGZvciBkZWZpbmluZyB0aGUgLm5leHQsIC50aHJvdywgYW5kIC5yZXR1cm4gbWV0aG9kcyBvZiB0aGVcbiAgLy8gSXRlcmF0b3IgaW50ZXJmYWNlIGluIHRlcm1zIG9mIGEgc2luZ2xlIC5faW52b2tlIG1ldGhvZC5cbiAgZnVuY3Rpb24gZGVmaW5lSXRlcmF0b3JNZXRob2RzKHByb3RvdHlwZSkge1xuICAgIFtcIm5leHRcIiwgXCJ0aHJvd1wiLCBcInJldHVyblwiXS5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgcHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbihhcmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludm9rZShtZXRob2QsIGFyZyk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgcnVudGltZS5pc0dlbmVyYXRvckZ1bmN0aW9uID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgdmFyIGN0b3IgPSB0eXBlb2YgZ2VuRnVuID09PSBcImZ1bmN0aW9uXCIgJiYgZ2VuRnVuLmNvbnN0cnVjdG9yO1xuICAgIHJldHVybiBjdG9yXG4gICAgICA/IGN0b3IgPT09IEdlbmVyYXRvckZ1bmN0aW9uIHx8XG4gICAgICAgIC8vIEZvciB0aGUgbmF0aXZlIEdlbmVyYXRvckZ1bmN0aW9uIGNvbnN0cnVjdG9yLCB0aGUgYmVzdCB3ZSBjYW5cbiAgICAgICAgLy8gZG8gaXMgdG8gY2hlY2sgaXRzIC5uYW1lIHByb3BlcnR5LlxuICAgICAgICAoY3Rvci5kaXNwbGF5TmFtZSB8fCBjdG9yLm5hbWUpID09PSBcIkdlbmVyYXRvckZ1bmN0aW9uXCJcbiAgICAgIDogZmFsc2U7XG4gIH07XG5cbiAgcnVudGltZS5tYXJrID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgaWYgKE9iamVjdC5zZXRQcm90b3R5cGVPZikge1xuICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKGdlbkZ1biwgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnZW5GdW4uX19wcm90b19fID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gICAgICBpZiAoISh0b1N0cmluZ1RhZ1N5bWJvbCBpbiBnZW5GdW4pKSB7XG4gICAgICAgIGdlbkZ1blt0b1N0cmluZ1RhZ1N5bWJvbF0gPSBcIkdlbmVyYXRvckZ1bmN0aW9uXCI7XG4gICAgICB9XG4gICAgfVxuICAgIGdlbkZ1bi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEdwKTtcbiAgICByZXR1cm4gZ2VuRnVuO1xuICB9O1xuXG4gIC8vIFdpdGhpbiB0aGUgYm9keSBvZiBhbnkgYXN5bmMgZnVuY3Rpb24sIGBhd2FpdCB4YCBpcyB0cmFuc2Zvcm1lZCB0b1xuICAvLyBgeWllbGQgcmVnZW5lcmF0b3JSdW50aW1lLmF3cmFwKHgpYCwgc28gdGhhdCB0aGUgcnVudGltZSBjYW4gdGVzdFxuICAvLyBgaGFzT3duLmNhbGwodmFsdWUsIFwiX19hd2FpdFwiKWAgdG8gZGV0ZXJtaW5lIGlmIHRoZSB5aWVsZGVkIHZhbHVlIGlzXG4gIC8vIG1lYW50IHRvIGJlIGF3YWl0ZWQuXG4gIHJ1bnRpbWUuYXdyYXAgPSBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4geyBfX2F3YWl0OiBhcmcgfTtcbiAgfTtcblxuICBmdW5jdGlvbiBBc3luY0l0ZXJhdG9yKGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZywgcmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goZ2VuZXJhdG9yW21ldGhvZF0sIGdlbmVyYXRvciwgYXJnKTtcbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHJlamVjdChyZWNvcmQuYXJnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciByZXN1bHQgPSByZWNvcmQuYXJnO1xuICAgICAgICB2YXIgdmFsdWUgPSByZXN1bHQudmFsdWU7XG4gICAgICAgIGlmICh2YWx1ZSAmJlxuICAgICAgICAgICAgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgICAgICBoYXNPd24uY2FsbCh2YWx1ZSwgXCJfX2F3YWl0XCIpKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZS5fX2F3YWl0KS50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICBpbnZva2UoXCJuZXh0XCIsIHZhbHVlLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgaW52b2tlKFwidGhyb3dcIiwgZXJyLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSkudGhlbihmdW5jdGlvbih1bndyYXBwZWQpIHtcbiAgICAgICAgICAvLyBXaGVuIGEgeWllbGRlZCBQcm9taXNlIGlzIHJlc29sdmVkLCBpdHMgZmluYWwgdmFsdWUgYmVjb21lc1xuICAgICAgICAgIC8vIHRoZSAudmFsdWUgb2YgdGhlIFByb21pc2U8e3ZhbHVlLGRvbmV9PiByZXN1bHQgZm9yIHRoZVxuICAgICAgICAgIC8vIGN1cnJlbnQgaXRlcmF0aW9uLiBJZiB0aGUgUHJvbWlzZSBpcyByZWplY3RlZCwgaG93ZXZlciwgdGhlXG4gICAgICAgICAgLy8gcmVzdWx0IGZvciB0aGlzIGl0ZXJhdGlvbiB3aWxsIGJlIHJlamVjdGVkIHdpdGggdGhlIHNhbWVcbiAgICAgICAgICAvLyByZWFzb24uIE5vdGUgdGhhdCByZWplY3Rpb25zIG9mIHlpZWxkZWQgUHJvbWlzZXMgYXJlIG5vdFxuICAgICAgICAgIC8vIHRocm93biBiYWNrIGludG8gdGhlIGdlbmVyYXRvciBmdW5jdGlvbiwgYXMgaXMgdGhlIGNhc2VcbiAgICAgICAgICAvLyB3aGVuIGFuIGF3YWl0ZWQgUHJvbWlzZSBpcyByZWplY3RlZC4gVGhpcyBkaWZmZXJlbmNlIGluXG4gICAgICAgICAgLy8gYmVoYXZpb3IgYmV0d2VlbiB5aWVsZCBhbmQgYXdhaXQgaXMgaW1wb3J0YW50LCBiZWNhdXNlIGl0XG4gICAgICAgICAgLy8gYWxsb3dzIHRoZSBjb25zdW1lciB0byBkZWNpZGUgd2hhdCB0byBkbyB3aXRoIHRoZSB5aWVsZGVkXG4gICAgICAgICAgLy8gcmVqZWN0aW9uIChzd2FsbG93IGl0IGFuZCBjb250aW51ZSwgbWFudWFsbHkgLnRocm93IGl0IGJhY2tcbiAgICAgICAgICAvLyBpbnRvIHRoZSBnZW5lcmF0b3IsIGFiYW5kb24gaXRlcmF0aW9uLCB3aGF0ZXZlcikuIFdpdGhcbiAgICAgICAgICAvLyBhd2FpdCwgYnkgY29udHJhc3QsIHRoZXJlIGlzIG5vIG9wcG9ydHVuaXR5IHRvIGV4YW1pbmUgdGhlXG4gICAgICAgICAgLy8gcmVqZWN0aW9uIHJlYXNvbiBvdXRzaWRlIHRoZSBnZW5lcmF0b3IgZnVuY3Rpb24sIHNvIHRoZVxuICAgICAgICAgIC8vIG9ubHkgb3B0aW9uIGlzIHRvIHRocm93IGl0IGZyb20gdGhlIGF3YWl0IGV4cHJlc3Npb24sIGFuZFxuICAgICAgICAgIC8vIGxldCB0aGUgZ2VuZXJhdG9yIGZ1bmN0aW9uIGhhbmRsZSB0aGUgZXhjZXB0aW9uLlxuICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IHVud3JhcHBlZDtcbiAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH0sIHJlamVjdCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHByZXZpb3VzUHJvbWlzZTtcblxuICAgIGZ1bmN0aW9uIGVucXVldWUobWV0aG9kLCBhcmcpIHtcbiAgICAgIGZ1bmN0aW9uIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgaW52b2tlKG1ldGhvZCwgYXJnLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHByZXZpb3VzUHJvbWlzZSA9XG4gICAgICAgIC8vIElmIGVucXVldWUgaGFzIGJlZW4gY2FsbGVkIGJlZm9yZSwgdGhlbiB3ZSB3YW50IHRvIHdhaXQgdW50aWxcbiAgICAgICAgLy8gYWxsIHByZXZpb3VzIFByb21pc2VzIGhhdmUgYmVlbiByZXNvbHZlZCBiZWZvcmUgY2FsbGluZyBpbnZva2UsXG4gICAgICAgIC8vIHNvIHRoYXQgcmVzdWx0cyBhcmUgYWx3YXlzIGRlbGl2ZXJlZCBpbiB0aGUgY29ycmVjdCBvcmRlci4gSWZcbiAgICAgICAgLy8gZW5xdWV1ZSBoYXMgbm90IGJlZW4gY2FsbGVkIGJlZm9yZSwgdGhlbiBpdCBpcyBpbXBvcnRhbnQgdG9cbiAgICAgICAgLy8gY2FsbCBpbnZva2UgaW1tZWRpYXRlbHksIHdpdGhvdXQgd2FpdGluZyBvbiBhIGNhbGxiYWNrIHRvIGZpcmUsXG4gICAgICAgIC8vIHNvIHRoYXQgdGhlIGFzeW5jIGdlbmVyYXRvciBmdW5jdGlvbiBoYXMgdGhlIG9wcG9ydHVuaXR5IHRvIGRvXG4gICAgICAgIC8vIGFueSBuZWNlc3Nhcnkgc2V0dXAgaW4gYSBwcmVkaWN0YWJsZSB3YXkuIFRoaXMgcHJlZGljdGFiaWxpdHlcbiAgICAgICAgLy8gaXMgd2h5IHRoZSBQcm9taXNlIGNvbnN0cnVjdG9yIHN5bmNocm9ub3VzbHkgaW52b2tlcyBpdHNcbiAgICAgICAgLy8gZXhlY3V0b3IgY2FsbGJhY2ssIGFuZCB3aHkgYXN5bmMgZnVuY3Rpb25zIHN5bmNocm9ub3VzbHlcbiAgICAgICAgLy8gZXhlY3V0ZSBjb2RlIGJlZm9yZSB0aGUgZmlyc3QgYXdhaXQuIFNpbmNlIHdlIGltcGxlbWVudCBzaW1wbGVcbiAgICAgICAgLy8gYXN5bmMgZnVuY3Rpb25zIGluIHRlcm1zIG9mIGFzeW5jIGdlbmVyYXRvcnMsIGl0IGlzIGVzcGVjaWFsbHlcbiAgICAgICAgLy8gaW1wb3J0YW50IHRvIGdldCB0aGlzIHJpZ2h0LCBldmVuIHRob3VnaCBpdCByZXF1aXJlcyBjYXJlLlxuICAgICAgICBwcmV2aW91c1Byb21pc2UgPyBwcmV2aW91c1Byb21pc2UudGhlbihcbiAgICAgICAgICBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZyxcbiAgICAgICAgICAvLyBBdm9pZCBwcm9wYWdhdGluZyBmYWlsdXJlcyB0byBQcm9taXNlcyByZXR1cm5lZCBieSBsYXRlclxuICAgICAgICAgIC8vIGludm9jYXRpb25zIG9mIHRoZSBpdGVyYXRvci5cbiAgICAgICAgICBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZ1xuICAgICAgICApIDogY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcoKTtcbiAgICB9XG5cbiAgICAvLyBEZWZpbmUgdGhlIHVuaWZpZWQgaGVscGVyIG1ldGhvZCB0aGF0IGlzIHVzZWQgdG8gaW1wbGVtZW50IC5uZXh0LFxuICAgIC8vIC50aHJvdywgYW5kIC5yZXR1cm4gKHNlZSBkZWZpbmVJdGVyYXRvck1ldGhvZHMpLlxuICAgIHRoaXMuX2ludm9rZSA9IGVucXVldWU7XG4gIH1cblxuICBkZWZpbmVJdGVyYXRvck1ldGhvZHMoQXN5bmNJdGVyYXRvci5wcm90b3R5cGUpO1xuICBBc3luY0l0ZXJhdG9yLnByb3RvdHlwZVthc3luY0l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgcnVudGltZS5Bc3luY0l0ZXJhdG9yID0gQXN5bmNJdGVyYXRvcjtcblxuICAvLyBOb3RlIHRoYXQgc2ltcGxlIGFzeW5jIGZ1bmN0aW9ucyBhcmUgaW1wbGVtZW50ZWQgb24gdG9wIG9mXG4gIC8vIEFzeW5jSXRlcmF0b3Igb2JqZWN0czsgdGhleSBqdXN0IHJldHVybiBhIFByb21pc2UgZm9yIHRoZSB2YWx1ZSBvZlxuICAvLyB0aGUgZmluYWwgcmVzdWx0IHByb2R1Y2VkIGJ5IHRoZSBpdGVyYXRvci5cbiAgcnVudGltZS5hc3luYyA9IGZ1bmN0aW9uKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSB7XG4gICAgdmFyIGl0ZXIgPSBuZXcgQXN5bmNJdGVyYXRvcihcbiAgICAgIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpXG4gICAgKTtcblxuICAgIHJldHVybiBydW50aW1lLmlzR2VuZXJhdG9yRnVuY3Rpb24ob3V0ZXJGbilcbiAgICAgID8gaXRlciAvLyBJZiBvdXRlckZuIGlzIGEgZ2VuZXJhdG9yLCByZXR1cm4gdGhlIGZ1bGwgaXRlcmF0b3IuXG4gICAgICA6IGl0ZXIubmV4dCgpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdC5kb25lID8gcmVzdWx0LnZhbHVlIDogaXRlci5uZXh0KCk7XG4gICAgICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCkge1xuICAgIHZhciBzdGF0ZSA9IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQ7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnKSB7XG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlRXhlY3V0aW5nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IHJ1bm5pbmdcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVDb21wbGV0ZWQpIHtcbiAgICAgICAgaWYgKG1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgdGhyb3cgYXJnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQmUgZm9yZ2l2aW5nLCBwZXIgMjUuMy4zLjMuMyBvZiB0aGUgc3BlYzpcbiAgICAgICAgLy8gaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLWdlbmVyYXRvcnJlc3VtZVxuICAgICAgICByZXR1cm4gZG9uZVJlc3VsdCgpO1xuICAgICAgfVxuXG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IG1ldGhvZDtcbiAgICAgIGNvbnRleHQuYXJnID0gYXJnO1xuXG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICB2YXIgZGVsZWdhdGUgPSBjb250ZXh0LmRlbGVnYXRlO1xuICAgICAgICBpZiAoZGVsZWdhdGUpIHtcbiAgICAgICAgICB2YXIgZGVsZWdhdGVSZXN1bHQgPSBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KTtcbiAgICAgICAgICBpZiAoZGVsZWdhdGVSZXN1bHQpIHtcbiAgICAgICAgICAgIGlmIChkZWxlZ2F0ZVJlc3VsdCA9PT0gQ29udGludWVTZW50aW5lbCkgY29udGludWU7XG4gICAgICAgICAgICByZXR1cm4gZGVsZWdhdGVSZXN1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAgIC8vIFNldHRpbmcgY29udGV4dC5fc2VudCBmb3IgbGVnYWN5IHN1cHBvcnQgb2YgQmFiZWwnc1xuICAgICAgICAgIC8vIGZ1bmN0aW9uLnNlbnQgaW1wbGVtZW50YXRpb24uXG4gICAgICAgICAgY29udGV4dC5zZW50ID0gY29udGV4dC5fc2VudCA9IGNvbnRleHQuYXJnO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydCkge1xuICAgICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAgIHRocm93IGNvbnRleHQuYXJnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oY29udGV4dC5hcmcpO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dC5tZXRob2QgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgICBjb250ZXh0LmFicnVwdChcInJldHVyblwiLCBjb250ZXh0LmFyZyk7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZSA9IEdlblN0YXRlRXhlY3V0aW5nO1xuXG4gICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChpbm5lckZuLCBzZWxmLCBjb250ZXh0KTtcbiAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiKSB7XG4gICAgICAgICAgLy8gSWYgYW4gZXhjZXB0aW9uIGlzIHRocm93biBmcm9tIGlubmVyRm4sIHdlIGxlYXZlIHN0YXRlID09PVxuICAgICAgICAgIC8vIEdlblN0YXRlRXhlY3V0aW5nIGFuZCBsb29wIGJhY2sgZm9yIGFub3RoZXIgaW52b2NhdGlvbi5cbiAgICAgICAgICBzdGF0ZSA9IGNvbnRleHQuZG9uZVxuICAgICAgICAgICAgPyBHZW5TdGF0ZUNvbXBsZXRlZFxuICAgICAgICAgICAgOiBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkO1xuXG4gICAgICAgICAgaWYgKHJlY29yZC5hcmcgPT09IENvbnRpbnVlU2VudGluZWwpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogcmVjb3JkLmFyZyxcbiAgICAgICAgICAgIGRvbmU6IGNvbnRleHQuZG9uZVxuICAgICAgICAgIH07XG5cbiAgICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAvLyBEaXNwYXRjaCB0aGUgZXhjZXB0aW9uIGJ5IGxvb3BpbmcgYmFjayBhcm91bmQgdG8gdGhlXG4gICAgICAgICAgLy8gY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihjb250ZXh0LmFyZykgY2FsbCBhYm92ZS5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gQ2FsbCBkZWxlZ2F0ZS5pdGVyYXRvcltjb250ZXh0Lm1ldGhvZF0oY29udGV4dC5hcmcpIGFuZCBoYW5kbGUgdGhlXG4gIC8vIHJlc3VsdCwgZWl0aGVyIGJ5IHJldHVybmluZyBhIHsgdmFsdWUsIGRvbmUgfSByZXN1bHQgZnJvbSB0aGVcbiAgLy8gZGVsZWdhdGUgaXRlcmF0b3IsIG9yIGJ5IG1vZGlmeWluZyBjb250ZXh0Lm1ldGhvZCBhbmQgY29udGV4dC5hcmcsXG4gIC8vIHNldHRpbmcgY29udGV4dC5kZWxlZ2F0ZSB0byBudWxsLCBhbmQgcmV0dXJuaW5nIHRoZSBDb250aW51ZVNlbnRpbmVsLlxuICBmdW5jdGlvbiBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIG1ldGhvZCA9IGRlbGVnYXRlLml0ZXJhdG9yW2NvbnRleHQubWV0aG9kXTtcbiAgICBpZiAobWV0aG9kID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIEEgLnRocm93IG9yIC5yZXR1cm4gd2hlbiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIG5vIC50aHJvd1xuICAgICAgLy8gbWV0aG9kIGFsd2F5cyB0ZXJtaW5hdGVzIHRoZSB5aWVsZCogbG9vcC5cbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICBpZiAoZGVsZWdhdGUuaXRlcmF0b3IucmV0dXJuKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGhhcyBhIHJldHVybiBtZXRob2QsIGdpdmUgaXQgYVxuICAgICAgICAgIC8vIGNoYW5jZSB0byBjbGVhbiB1cC5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwicmV0dXJuXCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCk7XG5cbiAgICAgICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgLy8gSWYgbWF5YmVJbnZva2VEZWxlZ2F0ZShjb250ZXh0KSBjaGFuZ2VkIGNvbnRleHQubWV0aG9kIGZyb21cbiAgICAgICAgICAgIC8vIFwicmV0dXJuXCIgdG8gXCJ0aHJvd1wiLCBsZXQgdGhhdCBvdmVycmlkZSB0aGUgVHlwZUVycm9yIGJlbG93LlxuICAgICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgIGNvbnRleHQuYXJnID0gbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICBcIlRoZSBpdGVyYXRvciBkb2VzIG5vdCBwcm92aWRlIGEgJ3Rocm93JyBtZXRob2RcIik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChtZXRob2QsIGRlbGVnYXRlLml0ZXJhdG9yLCBjb250ZXh0LmFyZyk7XG5cbiAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICBjb250ZXh0LmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIHZhciBpbmZvID0gcmVjb3JkLmFyZztcblxuICAgIGlmICghIGluZm8pIHtcbiAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgY29udGV4dC5hcmcgPSBuZXcgVHlwZUVycm9yKFwiaXRlcmF0b3IgcmVzdWx0IGlzIG5vdCBhbiBvYmplY3RcIik7XG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIGlmIChpbmZvLmRvbmUpIHtcbiAgICAgIC8vIEFzc2lnbiB0aGUgcmVzdWx0IG9mIHRoZSBmaW5pc2hlZCBkZWxlZ2F0ZSB0byB0aGUgdGVtcG9yYXJ5XG4gICAgICAvLyB2YXJpYWJsZSBzcGVjaWZpZWQgYnkgZGVsZWdhdGUucmVzdWx0TmFtZSAoc2VlIGRlbGVnYXRlWWllbGQpLlxuICAgICAgY29udGV4dFtkZWxlZ2F0ZS5yZXN1bHROYW1lXSA9IGluZm8udmFsdWU7XG5cbiAgICAgIC8vIFJlc3VtZSBleGVjdXRpb24gYXQgdGhlIGRlc2lyZWQgbG9jYXRpb24gKHNlZSBkZWxlZ2F0ZVlpZWxkKS5cbiAgICAgIGNvbnRleHQubmV4dCA9IGRlbGVnYXRlLm5leHRMb2M7XG5cbiAgICAgIC8vIElmIGNvbnRleHQubWV0aG9kIHdhcyBcInRocm93XCIgYnV0IHRoZSBkZWxlZ2F0ZSBoYW5kbGVkIHRoZVxuICAgICAgLy8gZXhjZXB0aW9uLCBsZXQgdGhlIG91dGVyIGdlbmVyYXRvciBwcm9jZWVkIG5vcm1hbGx5LiBJZlxuICAgICAgLy8gY29udGV4dC5tZXRob2Qgd2FzIFwibmV4dFwiLCBmb3JnZXQgY29udGV4dC5hcmcgc2luY2UgaXQgaGFzIGJlZW5cbiAgICAgIC8vIFwiY29uc3VtZWRcIiBieSB0aGUgZGVsZWdhdGUgaXRlcmF0b3IuIElmIGNvbnRleHQubWV0aG9kIHdhc1xuICAgICAgLy8gXCJyZXR1cm5cIiwgYWxsb3cgdGhlIG9yaWdpbmFsIC5yZXR1cm4gY2FsbCB0byBjb250aW51ZSBpbiB0aGVcbiAgICAgIC8vIG91dGVyIGdlbmVyYXRvci5cbiAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCAhPT0gXCJyZXR1cm5cIikge1xuICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBSZS15aWVsZCB0aGUgcmVzdWx0IHJldHVybmVkIGJ5IHRoZSBkZWxlZ2F0ZSBtZXRob2QuXG4gICAgICByZXR1cm4gaW5mbztcbiAgICB9XG5cbiAgICAvLyBUaGUgZGVsZWdhdGUgaXRlcmF0b3IgaXMgZmluaXNoZWQsIHNvIGZvcmdldCBpdCBhbmQgY29udGludWUgd2l0aFxuICAgIC8vIHRoZSBvdXRlciBnZW5lcmF0b3IuXG4gICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gIH1cblxuICAvLyBEZWZpbmUgR2VuZXJhdG9yLnByb3RvdHlwZS57bmV4dCx0aHJvdyxyZXR1cm59IGluIHRlcm1zIG9mIHRoZVxuICAvLyB1bmlmaWVkIC5faW52b2tlIGhlbHBlciBtZXRob2QuXG4gIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhHcCk7XG5cbiAgR3BbdG9TdHJpbmdUYWdTeW1ib2xdID0gXCJHZW5lcmF0b3JcIjtcblxuICAvLyBBIEdlbmVyYXRvciBzaG91bGQgYWx3YXlzIHJldHVybiBpdHNlbGYgYXMgdGhlIGl0ZXJhdG9yIG9iamVjdCB3aGVuIHRoZVxuICAvLyBAQGl0ZXJhdG9yIGZ1bmN0aW9uIGlzIGNhbGxlZCBvbiBpdC4gU29tZSBicm93c2VycycgaW1wbGVtZW50YXRpb25zIG9mIHRoZVxuICAvLyBpdGVyYXRvciBwcm90b3R5cGUgY2hhaW4gaW5jb3JyZWN0bHkgaW1wbGVtZW50IHRoaXMsIGNhdXNpbmcgdGhlIEdlbmVyYXRvclxuICAvLyBvYmplY3QgdG8gbm90IGJlIHJldHVybmVkIGZyb20gdGhpcyBjYWxsLiBUaGlzIGVuc3VyZXMgdGhhdCBkb2Vzbid0IGhhcHBlbi5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWdlbmVyYXRvci9pc3N1ZXMvMjc0IGZvciBtb3JlIGRldGFpbHMuXG4gIEdwW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEdwLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwiW29iamVjdCBHZW5lcmF0b3JdXCI7XG4gIH07XG5cbiAgZnVuY3Rpb24gcHVzaFRyeUVudHJ5KGxvY3MpIHtcbiAgICB2YXIgZW50cnkgPSB7IHRyeUxvYzogbG9jc1swXSB9O1xuXG4gICAgaWYgKDEgaW4gbG9jcykge1xuICAgICAgZW50cnkuY2F0Y2hMb2MgPSBsb2NzWzFdO1xuICAgIH1cblxuICAgIGlmICgyIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmZpbmFsbHlMb2MgPSBsb2NzWzJdO1xuICAgICAgZW50cnkuYWZ0ZXJMb2MgPSBsb2NzWzNdO1xuICAgIH1cblxuICAgIHRoaXMudHJ5RW50cmllcy5wdXNoKGVudHJ5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0VHJ5RW50cnkoZW50cnkpIHtcbiAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbiB8fCB7fTtcbiAgICByZWNvcmQudHlwZSA9IFwibm9ybWFsXCI7XG4gICAgZGVsZXRlIHJlY29yZC5hcmc7XG4gICAgZW50cnkuY29tcGxldGlvbiA9IHJlY29yZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIENvbnRleHQodHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBUaGUgcm9vdCBlbnRyeSBvYmplY3QgKGVmZmVjdGl2ZWx5IGEgdHJ5IHN0YXRlbWVudCB3aXRob3V0IGEgY2F0Y2hcbiAgICAvLyBvciBhIGZpbmFsbHkgYmxvY2spIGdpdmVzIHVzIGEgcGxhY2UgdG8gc3RvcmUgdmFsdWVzIHRocm93biBmcm9tXG4gICAgLy8gbG9jYXRpb25zIHdoZXJlIHRoZXJlIGlzIG5vIGVuY2xvc2luZyB0cnkgc3RhdGVtZW50LlxuICAgIHRoaXMudHJ5RW50cmllcyA9IFt7IHRyeUxvYzogXCJyb290XCIgfV07XG4gICAgdHJ5TG9jc0xpc3QuZm9yRWFjaChwdXNoVHJ5RW50cnksIHRoaXMpO1xuICAgIHRoaXMucmVzZXQodHJ1ZSk7XG4gIH1cblxuICBydW50aW1lLmtleXMgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgIGtleXMucHVzaChrZXkpO1xuICAgIH1cbiAgICBrZXlzLnJldmVyc2UoKTtcblxuICAgIC8vIFJhdGhlciB0aGFuIHJldHVybmluZyBhbiBvYmplY3Qgd2l0aCBhIG5leHQgbWV0aG9kLCB3ZSBrZWVwXG4gICAgLy8gdGhpbmdzIHNpbXBsZSBhbmQgcmV0dXJuIHRoZSBuZXh0IGZ1bmN0aW9uIGl0c2VsZi5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgIHdoaWxlIChrZXlzLmxlbmd0aCkge1xuICAgICAgICB2YXIga2V5ID0ga2V5cy5wb3AoKTtcbiAgICAgICAgaWYgKGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgICBuZXh0LnZhbHVlID0ga2V5O1xuICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRvIGF2b2lkIGNyZWF0aW5nIGFuIGFkZGl0aW9uYWwgb2JqZWN0LCB3ZSBqdXN0IGhhbmcgdGhlIC52YWx1ZVxuICAgICAgLy8gYW5kIC5kb25lIHByb3BlcnRpZXMgb2ZmIHRoZSBuZXh0IGZ1bmN0aW9uIG9iamVjdCBpdHNlbGYuIFRoaXNcbiAgICAgIC8vIGFsc28gZW5zdXJlcyB0aGF0IHRoZSBtaW5pZmllciB3aWxsIG5vdCBhbm9ueW1pemUgdGhlIGZ1bmN0aW9uLlxuICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcbiAgICAgIHJldHVybiBuZXh0O1xuICAgIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gdmFsdWVzKGl0ZXJhYmxlKSB7XG4gICAgaWYgKGl0ZXJhYmxlKSB7XG4gICAgICB2YXIgaXRlcmF0b3JNZXRob2QgPSBpdGVyYWJsZVtpdGVyYXRvclN5bWJvbF07XG4gICAgICBpZiAoaXRlcmF0b3JNZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yTWV0aG9kLmNhbGwoaXRlcmFibGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGl0ZXJhYmxlLm5leHQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gaXRlcmFibGU7XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNOYU4oaXRlcmFibGUubGVuZ3RoKSkge1xuICAgICAgICB2YXIgaSA9IC0xLCBuZXh0ID0gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgaXRlcmFibGUubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoaGFzT3duLmNhbGwoaXRlcmFibGUsIGkpKSB7XG4gICAgICAgICAgICAgIG5leHQudmFsdWUgPSBpdGVyYWJsZVtpXTtcbiAgICAgICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIG5leHQudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcblxuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBuZXh0Lm5leHQgPSBuZXh0O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJldHVybiBhbiBpdGVyYXRvciB3aXRoIG5vIHZhbHVlcy5cbiAgICByZXR1cm4geyBuZXh0OiBkb25lUmVzdWx0IH07XG4gIH1cbiAgcnVudGltZS52YWx1ZXMgPSB2YWx1ZXM7XG5cbiAgZnVuY3Rpb24gZG9uZVJlc3VsdCgpIHtcbiAgICByZXR1cm4geyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH07XG4gIH1cblxuICBDb250ZXh0LnByb3RvdHlwZSA9IHtcbiAgICBjb25zdHJ1Y3RvcjogQ29udGV4dCxcblxuICAgIHJlc2V0OiBmdW5jdGlvbihza2lwVGVtcFJlc2V0KSB7XG4gICAgICB0aGlzLnByZXYgPSAwO1xuICAgICAgdGhpcy5uZXh0ID0gMDtcbiAgICAgIC8vIFJlc2V0dGluZyBjb250ZXh0Ll9zZW50IGZvciBsZWdhY3kgc3VwcG9ydCBvZiBCYWJlbCdzXG4gICAgICAvLyBmdW5jdGlvbi5zZW50IGltcGxlbWVudGF0aW9uLlxuICAgICAgdGhpcy5zZW50ID0gdGhpcy5fc2VudCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgIHRoaXMubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICB0aGlzLmFyZyA9IHVuZGVmaW5lZDtcblxuICAgICAgdGhpcy50cnlFbnRyaWVzLmZvckVhY2gocmVzZXRUcnlFbnRyeSk7XG5cbiAgICAgIGlmICghc2tpcFRlbXBSZXNldCkge1xuICAgICAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMpIHtcbiAgICAgICAgICAvLyBOb3Qgc3VyZSBhYm91dCB0aGUgb3B0aW1hbCBvcmRlciBvZiB0aGVzZSBjb25kaXRpb25zOlxuICAgICAgICAgIGlmIChuYW1lLmNoYXJBdCgwKSA9PT0gXCJ0XCIgJiZcbiAgICAgICAgICAgICAgaGFzT3duLmNhbGwodGhpcywgbmFtZSkgJiZcbiAgICAgICAgICAgICAgIWlzTmFOKCtuYW1lLnNsaWNlKDEpKSkge1xuICAgICAgICAgICAgdGhpc1tuYW1lXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuXG4gICAgICB2YXIgcm9vdEVudHJ5ID0gdGhpcy50cnlFbnRyaWVzWzBdO1xuICAgICAgdmFyIHJvb3RSZWNvcmQgPSByb290RW50cnkuY29tcGxldGlvbjtcbiAgICAgIGlmIChyb290UmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByb290UmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucnZhbDtcbiAgICB9LFxuXG4gICAgZGlzcGF0Y2hFeGNlcHRpb246IGZ1bmN0aW9uKGV4Y2VwdGlvbikge1xuICAgICAgaWYgKHRoaXMuZG9uZSkge1xuICAgICAgICB0aHJvdyBleGNlcHRpb247XG4gICAgICB9XG5cbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcztcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZShsb2MsIGNhdWdodCkge1xuICAgICAgICByZWNvcmQudHlwZSA9IFwidGhyb3dcIjtcbiAgICAgICAgcmVjb3JkLmFyZyA9IGV4Y2VwdGlvbjtcbiAgICAgICAgY29udGV4dC5uZXh0ID0gbG9jO1xuXG4gICAgICAgIGlmIChjYXVnaHQpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgZGlzcGF0Y2hlZCBleGNlcHRpb24gd2FzIGNhdWdodCBieSBhIGNhdGNoIGJsb2NrLFxuICAgICAgICAgIC8vIHRoZW4gbGV0IHRoYXQgY2F0Y2ggYmxvY2sgaGFuZGxlIHRoZSBleGNlcHRpb24gbm9ybWFsbHkuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAhISBjYXVnaHQ7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSBcInJvb3RcIikge1xuICAgICAgICAgIC8vIEV4Y2VwdGlvbiB0aHJvd24gb3V0c2lkZSBvZiBhbnkgdHJ5IGJsb2NrIHRoYXQgY291bGQgaGFuZGxlXG4gICAgICAgICAgLy8gaXQsIHNvIHNldCB0aGUgY29tcGxldGlvbiB2YWx1ZSBvZiB0aGUgZW50aXJlIGZ1bmN0aW9uIHRvXG4gICAgICAgICAgLy8gdGhyb3cgdGhlIGV4Y2VwdGlvbi5cbiAgICAgICAgICByZXR1cm4gaGFuZGxlKFwiZW5kXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYpIHtcbiAgICAgICAgICB2YXIgaGFzQ2F0Y2ggPSBoYXNPd24uY2FsbChlbnRyeSwgXCJjYXRjaExvY1wiKTtcbiAgICAgICAgICB2YXIgaGFzRmluYWxseSA9IGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIik7XG5cbiAgICAgICAgICBpZiAoaGFzQ2F0Y2ggJiYgaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0NhdGNoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidHJ5IHN0YXRlbWVudCB3aXRob3V0IGNhdGNoIG9yIGZpbmFsbHlcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGFicnVwdDogZnVuY3Rpb24odHlwZSwgYXJnKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIikgJiZcbiAgICAgICAgICAgIHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICB2YXIgZmluYWxseUVudHJ5ID0gZW50cnk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSAmJlxuICAgICAgICAgICh0eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICAgdHlwZSA9PT0gXCJjb250aW51ZVwiKSAmJlxuICAgICAgICAgIGZpbmFsbHlFbnRyeS50cnlMb2MgPD0gYXJnICYmXG4gICAgICAgICAgYXJnIDw9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgIC8vIElnbm9yZSB0aGUgZmluYWxseSBlbnRyeSBpZiBjb250cm9sIGlzIG5vdCBqdW1waW5nIHRvIGFcbiAgICAgICAgLy8gbG9jYXRpb24gb3V0c2lkZSB0aGUgdHJ5L2NhdGNoIGJsb2NrLlxuICAgICAgICBmaW5hbGx5RW50cnkgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVjb3JkID0gZmluYWxseUVudHJ5ID8gZmluYWxseUVudHJ5LmNvbXBsZXRpb24gOiB7fTtcbiAgICAgIHJlY29yZC50eXBlID0gdHlwZTtcbiAgICAgIHJlY29yZC5hcmcgPSBhcmc7XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkpIHtcbiAgICAgICAgdGhpcy5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgdGhpcy5uZXh0ID0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2M7XG4gICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5jb21wbGV0ZShyZWNvcmQpO1xuICAgIH0sXG5cbiAgICBjb21wbGV0ZTogZnVuY3Rpb24ocmVjb3JkLCBhZnRlckxvYykge1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICByZWNvcmQudHlwZSA9PT0gXCJjb250aW51ZVwiKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IHJlY29yZC5hcmc7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInJldHVyblwiKSB7XG4gICAgICAgIHRoaXMucnZhbCA9IHRoaXMuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgdGhpcy5tZXRob2QgPSBcInJldHVyblwiO1xuICAgICAgICB0aGlzLm5leHQgPSBcImVuZFwiO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIiAmJiBhZnRlckxvYykge1xuICAgICAgICB0aGlzLm5leHQgPSBhZnRlckxvYztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfSxcblxuICAgIGZpbmlzaDogZnVuY3Rpb24oZmluYWxseUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS5maW5hbGx5TG9jID09PSBmaW5hbGx5TG9jKSB7XG4gICAgICAgICAgdGhpcy5jb21wbGV0ZShlbnRyeS5jb21wbGV0aW9uLCBlbnRyeS5hZnRlckxvYyk7XG4gICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgXCJjYXRjaFwiOiBmdW5jdGlvbih0cnlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSB0cnlMb2MpIHtcbiAgICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcbiAgICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgdmFyIHRocm93biA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRocm93bjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUaGUgY29udGV4dC5jYXRjaCBtZXRob2QgbXVzdCBvbmx5IGJlIGNhbGxlZCB3aXRoIGEgbG9jYXRpb25cbiAgICAgIC8vIGFyZ3VtZW50IHRoYXQgY29ycmVzcG9uZHMgdG8gYSBrbm93biBjYXRjaCBibG9jay5cbiAgICAgIHRocm93IG5ldyBFcnJvcihcImlsbGVnYWwgY2F0Y2ggYXR0ZW1wdFwiKTtcbiAgICB9LFxuXG4gICAgZGVsZWdhdGVZaWVsZDogZnVuY3Rpb24oaXRlcmFibGUsIHJlc3VsdE5hbWUsIG5leHRMb2MpIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSB7XG4gICAgICAgIGl0ZXJhdG9yOiB2YWx1ZXMoaXRlcmFibGUpLFxuICAgICAgICByZXN1bHROYW1lOiByZXN1bHROYW1lLFxuICAgICAgICBuZXh0TG9jOiBuZXh0TG9jXG4gICAgICB9O1xuXG4gICAgICBpZiAodGhpcy5tZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgIC8vIERlbGliZXJhdGVseSBmb3JnZXQgdGhlIGxhc3Qgc2VudCB2YWx1ZSBzbyB0aGF0IHdlIGRvbid0XG4gICAgICAgIC8vIGFjY2lkZW50YWxseSBwYXNzIGl0IG9uIHRvIHRoZSBkZWxlZ2F0ZS5cbiAgICAgICAgdGhpcy5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cbiAgfTtcbn0pKFxuICAvLyBJbiBzbG9wcHkgbW9kZSwgdW5ib3VuZCBgdGhpc2AgcmVmZXJzIHRvIHRoZSBnbG9iYWwgb2JqZWN0LCBmYWxsYmFjayB0b1xuICAvLyBGdW5jdGlvbiBjb25zdHJ1Y3RvciBpZiB3ZSdyZSBpbiBnbG9iYWwgc3RyaWN0IG1vZGUuIFRoYXQgaXMgc2FkbHkgYSBmb3JtXG4gIC8vIG9mIGluZGlyZWN0IGV2YWwgd2hpY2ggdmlvbGF0ZXMgQ29udGVudCBTZWN1cml0eSBQb2xpY3kuXG4gIChmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMgfSkoKSB8fCBGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKClcbik7XG4iLCJcbi8qKlxuICogTW9kdWxlIERlcGVuZGVuY2llc1xuICovXG5cbnZhciBleHByO1xudHJ5IHtcbiAgZXhwciA9IHJlcXVpcmUoJ3Byb3BzJyk7XG59IGNhdGNoKGUpIHtcbiAgZXhwciA9IHJlcXVpcmUoJ2NvbXBvbmVudC1wcm9wcycpO1xufVxuXG4vKipcbiAqIEV4cG9zZSBgdG9GdW5jdGlvbigpYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRvRnVuY3Rpb247XG5cbi8qKlxuICogQ29udmVydCBgb2JqYCB0byBhIGBGdW5jdGlvbmAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gb2JqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHRvRnVuY3Rpb24ob2JqKSB7XG4gIHN3aXRjaCAoe30udG9TdHJpbmcuY2FsbChvYmopKSB7XG4gICAgY2FzZSAnW29iamVjdCBPYmplY3RdJzpcbiAgICAgIHJldHVybiBvYmplY3RUb0Z1bmN0aW9uKG9iaik7XG4gICAgY2FzZSAnW29iamVjdCBGdW5jdGlvbl0nOlxuICAgICAgcmV0dXJuIG9iajtcbiAgICBjYXNlICdbb2JqZWN0IFN0cmluZ10nOlxuICAgICAgcmV0dXJuIHN0cmluZ1RvRnVuY3Rpb24ob2JqKTtcbiAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOlxuICAgICAgcmV0dXJuIHJlZ2V4cFRvRnVuY3Rpb24ob2JqKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGRlZmF1bHRUb0Z1bmN0aW9uKG9iaik7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWZhdWx0IHRvIHN0cmljdCBlcXVhbGl0eS5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZGVmYXVsdFRvRnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiBmdW5jdGlvbihvYmope1xuICAgIHJldHVybiB2YWwgPT09IG9iajtcbiAgfTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGByZWAgdG8gYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1JlZ0V4cH0gcmVcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcmVnZXhwVG9GdW5jdGlvbihyZSkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqKXtcbiAgICByZXR1cm4gcmUudGVzdChvYmopO1xuICB9O1xufVxuXG4vKipcbiAqIENvbnZlcnQgcHJvcGVydHkgYHN0cmAgdG8gYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHN0cmluZ1RvRnVuY3Rpb24oc3RyKSB7XG4gIC8vIGltbWVkaWF0ZSBzdWNoIGFzIFwiPiAyMFwiXG4gIGlmICgvXiAqXFxXKy8udGVzdChzdHIpKSByZXR1cm4gbmV3IEZ1bmN0aW9uKCdfJywgJ3JldHVybiBfICcgKyBzdHIpO1xuXG4gIC8vIHByb3BlcnRpZXMgc3VjaCBhcyBcIm5hbWUuZmlyc3RcIiBvciBcImFnZSA+IDE4XCIgb3IgXCJhZ2UgPiAxOCAmJiBhZ2UgPCAzNlwiXG4gIHJldHVybiBuZXcgRnVuY3Rpb24oJ18nLCAncmV0dXJuICcgKyBnZXQoc3RyKSk7XG59XG5cbi8qKlxuICogQ29udmVydCBgb2JqZWN0YCB0byBhIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3RcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gb2JqZWN0VG9GdW5jdGlvbihvYmopIHtcbiAgdmFyIG1hdGNoID0ge307XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBtYXRjaFtrZXldID0gdHlwZW9mIG9ialtrZXldID09PSAnc3RyaW5nJ1xuICAgICAgPyBkZWZhdWx0VG9GdW5jdGlvbihvYmpba2V5XSlcbiAgICAgIDogdG9GdW5jdGlvbihvYmpba2V5XSk7XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbCl7XG4gICAgaWYgKHR5cGVvZiB2YWwgIT09ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG4gICAgZm9yICh2YXIga2V5IGluIG1hdGNoKSB7XG4gICAgICBpZiAoIShrZXkgaW4gdmFsKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgaWYgKCFtYXRjaFtrZXldKHZhbFtrZXldKSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbn1cblxuLyoqXG4gKiBCdWlsdCB0aGUgZ2V0dGVyIGZ1bmN0aW9uLiBTdXBwb3J0cyBnZXR0ZXIgc3R5bGUgZnVuY3Rpb25zXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZ2V0KHN0cikge1xuICB2YXIgcHJvcHMgPSBleHByKHN0cik7XG4gIGlmICghcHJvcHMubGVuZ3RoKSByZXR1cm4gJ18uJyArIHN0cjtcblxuICB2YXIgdmFsLCBpLCBwcm9wO1xuICBmb3IgKGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICBwcm9wID0gcHJvcHNbaV07XG4gICAgdmFsID0gJ18uJyArIHByb3A7XG4gICAgdmFsID0gXCIoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgXCIgKyB2YWwgKyBcIiA/IFwiICsgdmFsICsgXCIoKSA6IFwiICsgdmFsICsgXCIpXCI7XG5cbiAgICAvLyBtaW1pYyBuZWdhdGl2ZSBsb29rYmVoaW5kIHRvIGF2b2lkIHByb2JsZW1zIHdpdGggbmVzdGVkIHByb3BlcnRpZXNcbiAgICBzdHIgPSBzdHJpcE5lc3RlZChwcm9wLCBzdHIsIHZhbCk7XG4gIH1cblxuICByZXR1cm4gc3RyO1xufVxuXG4vKipcbiAqIE1pbWljIG5lZ2F0aXZlIGxvb2tiZWhpbmQgdG8gYXZvaWQgcHJvYmxlbXMgd2l0aCBuZXN0ZWQgcHJvcGVydGllcy5cbiAqXG4gKiBTZWU6IGh0dHA6Ly9ibG9nLnN0ZXZlbmxldml0aGFuLmNvbS9hcmNoaXZlcy9taW1pYy1sb29rYmVoaW5kLWphdmFzY3JpcHRcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc3RyaXBOZXN0ZWQgKHByb3AsIHN0ciwgdmFsKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZShuZXcgUmVnRXhwKCcoXFxcXC4pPycgKyBwcm9wLCAnZycpLCBmdW5jdGlvbigkMCwgJDEpIHtcbiAgICByZXR1cm4gJDEgPyAkMCA6IHZhbDtcbiAgfSk7XG59XG4iLCJleHBvcnQgTG9jYWxGb3JhZ2VBZGFwdGVyIGZyb20gJy4vbG9jYWxmb3JhZ2UnO1xuZXhwb3J0IEluTWVtb3J5QWRhcHRlciBmcm9tICcuL2lubWVtb3J5JztcbiIsIi8vIEBmbG93XG5pbXBvcnQgdHlwZSB7IElTdG9yYWdlIH0gZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9zdG9yYWdlJztcbmltcG9ydCB0eXBlIHsgSUNvbmZpZyB9IGZyb20gJy4uLy4uL2ludGVyZmFjZXMvY29uZmlnJztcbmltcG9ydCB0eXBlIElUYXNrIGZyb20gJy4uLy4uL2ludGVyZmFjZXMvdGFzayc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEluTWVtb3J5QWRhcHRlciBpbXBsZW1lbnRzIElTdG9yYWdlIHtcbiAgY29uZmlnOiBJQ29uZmlnO1xuICBwcmVmaXg6IHN0cmluZztcbiAgc3RvcmU6IHsgW3Byb3A6IHN0cmluZ106IGFueSB9ID0ge307XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBJQ29uZmlnKSB7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5wcmVmaXggPSB0aGlzLmNvbmZpZy5nZXQoJ3ByZWZpeCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2UgaXRlbSBmcm9tIHN0b3JhZ2UgYnkga2V5XG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge1Byb21pc2U8SVRhc2s+fSAoYXJyYXkpXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBnZXQobmFtZTogc3RyaW5nKTogUHJvbWlzZTxJVGFza1tdPiB7XG4gICAgY29uc3QgY29sbE5hbWUgPSB0aGlzLnN0b3JhZ2VOYW1lKG5hbWUpO1xuICAgIHJldHVybiBbLi4udGhpcy5nZXRDb2xsZWN0aW9uKGNvbGxOYW1lKV07XG4gIH1cblxuICAvKipcbiAgICogQWRkIGl0ZW0gdG8gbG9jYWwgc3RvcmFnZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHZhbHVlXG4gICAqIEByZXR1cm4ge1Byb21pc2U8QW55Pn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIHNldChrZXk6IHN0cmluZywgdmFsdWU6IGFueVtdKTogUHJvbWlzZTxhbnk+IHtcbiAgICB0aGlzLnN0b3JlW3RoaXMuc3RvcmFnZU5hbWUoa2V5KV0gPSBbLi4udmFsdWVdO1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdGVtIGNoZWNrZXIgaW4gc3RvcmFnZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtQcm9taXNlPEJvb2xlYW4+fVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgaGFzKGtleTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLnN0b3JlLCB0aGlzLnN0b3JhZ2VOYW1lKGtleSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBpdGVtXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge1Byb21pc2U8QW55Pn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGNsZWFyKGtleTogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCBjb2xsTmFtZSA9IHRoaXMuc3RvcmFnZU5hbWUoa2V5KTtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLmhhcyhrZXkpID8gZGVsZXRlIHRoaXMuc3RvcmVbY29sbE5hbWVdIDogZmFsc2U7XG4gICAgdGhpcy5zdG9yZSA9IHsgLi4udGhpcy5zdG9yZSB9O1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogQ29tcG9zZSBzdG9yYWdlIG5hbWUgYnkgc3VmZml4XG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gc3VmZml4XG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHN0b3JhZ2VOYW1lKHN1ZmZpeDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN1ZmZpeC5zdGFydHNXaXRoKHRoaXMuZ2V0UHJlZml4KCkpID8gc3VmZml4IDogYCR7dGhpcy5nZXRQcmVmaXgoKX1fJHtzdWZmaXh9YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgcHJlZml4IG9mIGNoYW5uZWwgc3RvcmFnZVxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBnZXRQcmVmaXgoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnLmdldCgncHJlZml4Jyk7XG4gIH1cblxuICBnZXRDb2xsZWN0aW9uKG5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IGhhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLnN0b3JlLCBuYW1lKTtcbiAgICBpZiAoIWhhcykgdGhpcy5zdG9yZVtuYW1lXSA9IFtdO1xuICAgIHJldHVybiB0aGlzLnN0b3JlW25hbWVdO1xuICB9XG59XG4iLCIvLyBAZmxvd1xuaW1wb3J0IGxvY2FsRm9yYWdlIGZyb20gJ2xvY2FsZm9yYWdlJztcbmltcG9ydCB0eXBlIHsgSVN0b3JhZ2UgfSBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL3N0b3JhZ2UnO1xuaW1wb3J0IHR5cGUgeyBJQ29uZmlnIH0gZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9jb25maWcnO1xuaW1wb3J0IHR5cGUgSVRhc2sgZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy90YXNrJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9jYWxGb3JhZ2VBZGFwdGVyIGltcGxlbWVudHMgSVN0b3JhZ2Uge1xuICBjb25maWc6IElDb25maWc7XG4gIGRyaXZlcnM6IHN0cmluZ1tdID0gWydsb2NhbHN0b3JhZ2UnLCAnaW5kZXhlZGRiJywgJ3dlYnNxbCddO1xuICBwcmVmaXg6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcihjb25maWc6IElDb25maWcpIHtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLnByZWZpeCA9IHRoaXMuY29uZmlnLmdldCgncHJlZml4Jyk7XG4gICAgbG9jYWxGb3JhZ2UuY29uZmlnKHsgZHJpdmVyOiB0aGlzLmdldERyaXZlcigpLCBuYW1lOiB0aGlzLnByZWZpeCB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlIGl0ZW0gZnJvbSBzdG9yYWdlIGJ5IGtleVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtQcm9taXNlPElUYXNrPn0gKGFycmF5KVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgZ2V0KGtleTogc3RyaW5nKTogUHJvbWlzZTxJVGFza1tdPiB7XG4gICAgY29uc3QgaXRlbXMgPSBhd2FpdCBsb2NhbEZvcmFnZS5nZXRJdGVtKHRoaXMuc3RvcmFnZU5hbWUoa2V5KSk7XG4gICAgcmV0dXJuICh0eXBlb2YgaXRlbXMgPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZShpdGVtcykgOiBpdGVtcykgfHwgW107XG4gIH1cblxuICAvKipcbiAgICogQWRkIGl0ZW0gdG8gbG9jYWwgc3RvcmFnZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHZhbHVlXG4gICAqIEByZXR1cm4ge1Byb21pc2U8QW55Pn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIHNldChrZXk6IHN0cmluZywgdmFsdWU6IGFueVtdKTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBsb2NhbEZvcmFnZS5zZXRJdGVtKHRoaXMuc3RvcmFnZU5hbWUoa2V5KSwgdmFsdWUpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogSXRlbSBjaGVja2VyIGluIHN0b3JhZ2VcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7UHJvbWlzZTxCb29sZWFuPn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGhhcyhrZXk6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGtleXM6IHN0cmluZ1tdID0gYXdhaXQgbG9jYWxGb3JhZ2Uua2V5cygpO1xuICAgIHJldHVybiBrZXlzLmluZGV4T2YodGhpcy5zdG9yYWdlTmFtZShrZXkpKSA+IC0xO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBpdGVtXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge1Byb21pc2U8QW55Pn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGNsZWFyKGtleTogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBsb2NhbEZvcmFnZS5yZW1vdmVJdGVtKHRoaXMuc3RvcmFnZU5hbWUoa2V5KSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYWxsIGl0ZW1zXG4gICAqXG4gICAqIEByZXR1cm4ge1Byb21pc2U8QW55Pn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGNsZWFyQWxsKCk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3Qga2V5czogc3RyaW5nW10gPSBhd2FpdCBsb2NhbEZvcmFnZS5rZXlzKCk7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgUHJvbWlzZS5hbGwoa2V5cy5tYXAoYXN5bmMgKGtleSkgPT4ge1xuICAgICAgY29uc3QgY2xlYXJlZCA9IGF3YWl0IHRoaXMuY2xlYXIoa2V5KTtcbiAgICAgIHJldHVybiBjbGVhcmVkO1xuICAgIH0pKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXBvc2Ugc3RvcmFnZSBuYW1lIGJ5IHN1ZmZpeFxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHN1ZmZpeFxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBzdG9yYWdlTmFtZShzdWZmaXg6IHN0cmluZykge1xuICAgIHJldHVybiBzdWZmaXguc3RhcnRzV2l0aCh0aGlzLmdldFByZWZpeCgpKSA/IHN1ZmZpeCA6IGAke3RoaXMuZ2V0UHJlZml4KCl9XyR7c3VmZml4fWA7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHByZWZpeCBvZiBjaGFubmVsIHN0b3JhZ2VcbiAgICpcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgZ2V0UHJlZml4KCkge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZy5nZXQoJ3ByZWZpeCcpO1xuICB9XG5cbiAgZ2V0RHJpdmVyKCkge1xuICAgIGNvbnN0IGRlZmF1bHREcml2ZXI6IHN0cmluZyA9IHRoaXMuY29uZmlnLmdldCgnZGVmYXVsdFN0b3JhZ2UnKTtcbiAgICBjb25zdCBkcml2ZXI6IHN0cmluZyA9ICh0aGlzLmNvbmZpZy5nZXQoJ3N0b3JhZ2UnKSB8fCBkZWZhdWx0RHJpdmVyKS50b0xvd2VyQ2FzZSgpO1xuICAgIHJldHVybiB0aGlzLmRyaXZlcnMuaW5kZXhPZihkcml2ZXIpID4gLTFcbiAgICAgID8gbG9jYWxGb3JhZ2VbZHJpdmVyLnRvVXBwZXJDYXNlKCldXG4gICAgICA6IGxvY2FsRm9yYWdlW2RlZmF1bHREcml2ZXIudG9VcHBlckNhc2UoKV07XG4gIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IHtcbiAgZGVmYXVsdFN0b3JhZ2U6ICdsb2NhbHN0b3JhZ2UnLFxuICBwcmVmaXg6ICdzcV9qb2JzJyxcbiAgdGltZW91dDogMTAwMCxcbiAgbGltaXQ6IC0xLFxuICBwcmluY2lwbGU6ICdmaWZvJyxcbiAgZGVidWc6IHRydWUsXG59O1xuIiwiLyogQGZsb3cgKi9cbmltcG9ydCB0eXBlIElDb25maWcgZnJvbSAnLi4vaW50ZXJmYWNlcy9jb25maWcnO1xuaW1wb3J0IGNvbmZpZ0RhdGEgZnJvbSAnLi9jb25maWcuZGF0YSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbmZpZyB7XG4gIGNvbmZpZzogSUNvbmZpZyA9IGNvbmZpZ0RhdGE7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBJQ29uZmlnID0ge30pIHtcbiAgICB0aGlzLm1lcmdlKGNvbmZpZyk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGNvbmZpZyB0byBnbG9iYWwgY29uZmlnIHJlZmVyZW5jZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtICB7QW55fSB2YWx1ZVxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgc2V0KG5hbWU6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQge1xuICAgIHRoaXMuY29uZmlnW25hbWVdID0gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgY29uZmlnXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHthbnl9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBnZXQobmFtZTogc3RyaW5nKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWdbbmFtZV07XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgY29uZmlnIHByb3BlcnR5XG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHthbnl9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBoYXMobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLmNvbmZpZywgbmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogTWVyZ2UgdHdvIGNvbmZpZyBvYmplY3RcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBtZXJnZShjb25maWc6IHsgW3N0cmluZ106IGFueSB9KTogdm9pZCB7XG4gICAgdGhpcy5jb25maWcgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmNvbmZpZywgY29uZmlnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYSBjb25maWdcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICByZW1vdmUobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGRlbGV0ZSB0aGlzLmNvbmZpZ1tuYW1lXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIGNvbmZpZ1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVcbiAgICogQHJldHVybiB7SUNvbmZpZ1tdfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYWxsKCk6IElDb25maWcge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZztcbiAgfVxufVxuIiwiLyogQGZsb3cgKi9cbmltcG9ydCB0eXBlIElDb250YWluZXIgZnJvbSAnLi4vaW50ZXJmYWNlcy9jb250YWluZXInO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb250YWluZXIgaW1wbGVtZW50cyBJQ29udGFpbmVyIHtcbiAgc3RvcmU6IHsgW3Byb3BlcnR5OiBzdHJpbmddOiBhbnkgfSA9IHt9O1xuXG4gIC8qKlxuICAgKiBDaGVjayBpdGVtIGluIGNvbnRhaW5lclxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGlkXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBoYXMoaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5zdG9yZSwgaWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBpdGVtIGZyb20gY29udGFpbmVyXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gaWRcbiAgICogQHJldHVybiB7QW55fVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgZ2V0KGlkOiBzdHJpbmcpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLnN0b3JlW2lkXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIGl0ZW1zIGZyb20gY29udGFpbmVyXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFsbCgpIHtcbiAgICByZXR1cm4gdGhpcy5zdG9yZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgaXRlbSB0byBjb250YWluZXJcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBpZFxuICAgKiBAcGFyYW0gIHtBbnl9IHZhbHVlXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBiaW5kKGlkOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLnN0b3JlW2lkXSA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIE1lcmdlIGNvbnRpbmVyc1xuICAgKlxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGRhdGFcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIG1lcmdlKGRhdGE6IHsgW3Byb3BlcnR5OiBzdHJpbmddOiBhbnkgfSA9IHt9KTogdm9pZCB7XG4gICAgdGhpcy5zdG9yZSA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuc3RvcmUsIGRhdGEpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBpdGVtIGZyb20gY29udGFpbmVyXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gaWRcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHJlbW92ZShpZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgaWYgKCF0aGlzLmhhcyhpZCkpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gZGVsZXRlIHRoaXMuc3RvcmVbaWRdO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbGwgaXRlbXMgZnJvbSBjb250YWluZXJcbiAgICpcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHJlbW92ZUFsbCgpOiB2b2lkIHtcbiAgICB0aGlzLnN0b3JlID0ge307XG4gIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IHtcbiAgcXVldWU6IHtcbiAgICBjcmVhdGVkOiAnTmV3IHRhc2sgY3JlYXRlZC4nLFxuICAgIG5leHQ6ICdOZXh0IHRhc2sgcHJvY2Vzc2luZy4nLFxuICAgIHN0YXJ0aW5nOiAnUXVldWUgbGlzdGVuZXIgc3RhcnRpbmcuJyxcbiAgICBzdG9wcGluZzogJ1F1ZXVlIGxpc3RlbmVyIHN0b3BwaW5nLicsXG4gICAgc3RvcHBlZDogJ1F1ZXVlIGxpc3RlbmVyIHN0b3BwZWQuJyxcbiAgICBlbXB0eTogJ2NoYW5uZWwgaXMgZW1wdHkuLi4nLFxuICAgICdub3QtZm91bmQnOiAnam9iIG5vdCBmb3VuZCcsXG4gICAgb2ZmbGluZTogJ0Rpc2Nvbm5lY3RlZCcsXG4gICAgb25saW5lOiAnQ29ubmVjdGVkJyxcbiAgfSxcbiAgZXZlbnQ6IHtcbiAgICBjcmVhdGVkOiAnTmV3IGV2ZW50IGNyZWF0ZWQnLFxuICAgIGZpcmVkOiAnRXZlbnQgZmlyZWQuJyxcbiAgICAnd2lsZGNhcmQtZmlyZWQnOiAnV2lsZGNhcmQgZXZlbnQgZmlyZWQuJyxcbiAgfSxcbn07XG4iLCIvKiBlc2xpbnQgY2xhc3MtbWV0aG9kcy11c2UtdGhpczogW1wiZXJyb3JcIiwgeyBcImV4Y2VwdE1ldGhvZHNcIjogW1wiZ2V0TmFtZVwiLCBcImdldFR5cGVcIl0gfV0gKi9cbi8qIGVzbGludC1lbnYgZXM2ICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV2ZW50IHtcbiAgc3RvcmU6IHsgW3Byb3A6IHN0cmluZ106IGFueSB9ID0ge307XG4gIHZlcmlmaWVyUGF0dGVybjogc3RyaW5nID0gL15bYS16MC05LV9dKzpiZWZvcmUkfGFmdGVyJHxyZXRyeSR8XFwqJC87XG4gIHdpbGRjYXJkczogc3RyaW5nW10gPSBbJyonLCAnZXJyb3InXTtcbiAgZW1wdHlGdW5jOiBGdW5jdGlvbiA9ICgpID0+IHt9O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc3RvcmUuYmVmb3JlID0ge307XG4gICAgdGhpcy5zdG9yZS5hZnRlciA9IHt9O1xuICAgIHRoaXMuc3RvcmUucmV0cnkgPSB7fTtcbiAgICB0aGlzLnN0b3JlLndpbGRjYXJkID0ge307XG4gICAgdGhpcy5zdG9yZS5lcnJvciA9IHRoaXMuZW1wdHlGdW5jO1xuICAgIHRoaXMuc3RvcmVbJyonXSA9IHRoaXMuZW1wdHlGdW5jO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBldmVudFxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gY2JcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIG9uKGtleTogc3RyaW5nLCBjYjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICBpZiAodHlwZW9mIGNiICE9PSAnZnVuY3Rpb24nKSB0aHJvdyBuZXcgRXJyb3IoJ0V2ZW50IHNob3VsZCBiZSBhbiBmdW5jdGlvbicpO1xuICAgIGlmICh0aGlzLmlzVmFsaWQoa2V5KSkgdGhpcy5hZGQoa2V5LCBjYik7XG4gIH1cblxuICAvKipcbiAgICogUnVuIGV2ZW50IHZpYSBpdCdzIGtleVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcGFyYW0gIHtBbnl9IGFyZ3NcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGVtaXQoa2V5OiBzdHJpbmcsIGFyZ3M6IGFueSk6IHZvaWQge1xuICAgIGlmICh0aGlzLndpbGRjYXJkcy5pbmRleE9mKGtleSkgPiAtMSkge1xuICAgICAgdGhpcy53aWxkY2FyZChrZXksIC4uLltrZXksIGFyZ3NdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgdHlwZTogc3RyaW5nID0gdGhpcy5nZXRUeXBlKGtleSk7XG4gICAgICBjb25zdCBuYW1lOiBzdHJpbmcgPSB0aGlzLmdldE5hbWUoa2V5KTtcblxuICAgICAgaWYgKHRoaXMuc3RvcmVbdHlwZV0pIHtcbiAgICAgICAgY29uc3QgY2I6IEZ1bmN0aW9uID0gdGhpcy5zdG9yZVt0eXBlXVtuYW1lXSB8fCB0aGlzLmVtcHR5RnVuYztcbiAgICAgICAgY2IuY2FsbChudWxsLCBhcmdzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLndpbGRjYXJkKCcqJywga2V5LCBhcmdzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gd2lsZGNhcmQgZXZlbnRzXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSAge1N0cmluZ30gYWN0aW9uS2V5XG4gICAqIEBwYXJhbSAge0FueX0gYXJnc1xuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgd2lsZGNhcmQoa2V5OiBzdHJpbmcsIGFjdGlvbktleTogc3RyaW5nLCBhcmdzOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5zdG9yZS53aWxkY2FyZFtrZXldKSB7XG4gICAgICB0aGlzLnN0b3JlLndpbGRjYXJkW2tleV0uY2FsbChudWxsLCBhY3Rpb25LZXksIGFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgZXZlbnQgdG8gc3RvcmVcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHBhcmFtICB7RnVuY3Rpb259IGNiXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhZGQoa2V5OiBzdHJpbmcsIGNiOiBGdW5jdGlvbik6IHZvaWQge1xuICAgIGlmICh0aGlzLndpbGRjYXJkcy5pbmRleE9mKGtleSkgPiAtMSkge1xuICAgICAgdGhpcy5zdG9yZS53aWxkY2FyZFtrZXldID0gY2I7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHR5cGU6IHN0cmluZyA9IHRoaXMuZ2V0VHlwZShrZXkpO1xuICAgICAgY29uc3QgbmFtZTogc3RyaW5nID0gdGhpcy5nZXROYW1lKGtleSk7XG4gICAgICB0aGlzLnN0b3JlW3R5cGVdW25hbWVdID0gY2I7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGV2ZW50IGluIHN0b3JlXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBoYXMoa2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qga2V5czogc3RyaW5nW10gPSBrZXkuc3BsaXQoJzonKTtcbiAgICAgIHJldHVybiBrZXlzLmxlbmd0aCA+IDEgPyAhIXRoaXMuc3RvcmVba2V5c1sxXV1ba2V5c1swXV0gOiAhIXRoaXMuc3RvcmUud2lsZGNhcmRba2V5c1swXV07XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZXZlbnQgbmFtZSBieSBwYXJzZSBrZXlcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgZ2V0TmFtZShrZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGtleS5tYXRjaCgvKC4qKTouKi8pWzFdO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBldmVudCB0eXBlIGJ5IHBhcnNlIGtleVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBnZXRUeXBlKGtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4ga2V5Lm1hdGNoKC9eW2EtejAtOS1fXSs6KC4qKS8pWzFdO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrZXIgb2YgZXZlbnQga2V5c1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgaXNWYWxpZChrZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnZlcmlmaWVyUGF0dGVybi50ZXN0KGtleSkgfHwgdGhpcy53aWxkY2FyZHMuaW5kZXhPZihrZXkpID4gLTE7XG4gIH1cbn1cbiIsIi8qIEBmbG93ICovXG5pbXBvcnQgUXVldWUgZnJvbSAnLi9xdWV1ZSc7XG5pbXBvcnQgeyBleGNsdWRlU3BlY2lmaWNUYXNrcywgbG9nLCBoYXNNZXRob2QsIGlzRnVuY3Rpb24gfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCBTdG9yYWdlQ2Fwc3VsZSBmcm9tICcuL3N0b3JhZ2UtY2Fwc3VsZSc7XG5pbXBvcnQgdHlwZSBJVGFzayBmcm9tICcuLi9pbnRlcmZhY2VzL3Rhc2snO1xuaW1wb3J0IHR5cGUgSVdvcmtlciBmcm9tICcuLi9pbnRlcmZhY2VzL3dvcmtlcic7XG5cbi8qIGVzbGludCBuby11bmRlcnNjb3JlLWRhbmdsZTogWzIsIHsgXCJhbGxvd1wiOiBbXCJfaWRcIl0gfV0gKi9cbi8qIGVzbGludCBuby1wYXJhbS1yZWFzc2lnbjogXCJlcnJvclwiICovXG4vKiBlc2xpbnQgdXNlLWlzbmFuOiBcImVycm9yXCIgKi9cblxuLyoqXG4gKiBUYXNrIHByaW9yaXR5IGNvbnRyb2xsZXIgaGVscGVyXG4gKiBDb250ZXh0OiBRdWV1ZVxuICpcbiAqIEByZXR1cm4ge0lUYXNrfVxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tQcmlvcml0eSh0YXNrOiBJVGFzayk6IElUYXNrIHtcbiAgdGFzay5wcmlvcml0eSA9IHRhc2sucHJpb3JpdHkgfHwgMDtcblxuICBpZiAodHlwZW9mIHRhc2sucHJpb3JpdHkgIT09ICdudW1iZXInKSB0YXNrLnByaW9yaXR5ID0gMDtcblxuICByZXR1cm4gdGFzaztcbn1cblxuLyoqXG4gKiBTaG9ydGVucyBmdW5jdGlvbiB0aGUgZGIgYmVsb25nc3RvIGN1cnJlbnQgY2hhbm5lbFxuICogQ29udGV4dDogUXVldWVcbiAqXG4gKiBAcmV0dXJuIHtTdG9yYWdlQ2Fwc3VsZX1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRiKCk6IFN0b3JhZ2VDYXBzdWxlIHtcbiAgcmV0dXJuICh0aGlzOiBhbnkpLnN0b3JhZ2UuY2hhbm5lbCgodGhpczogYW55KS5jdXJyZW50Q2hhbm5lbCk7XG59XG5cbi8qKlxuICogR2V0IHVuZnJlZXplZCB0YXNrcyBieSB0aGUgZmlsdGVyIGZ1bmN0aW9uXG4gKiBDb250ZXh0OiBRdWV1ZVxuICpcbiAqIEByZXR1cm4ge0lUYXNrfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VGFza3NXaXRob3V0RnJlZXplZCgpOiBQcm9taXNlPElUYXNrW10+IHtcbiAgcmV0dXJuIChhd2FpdCBkYi5jYWxsKHRoaXMpLmFsbCgpKS5maWx0ZXIoZXhjbHVkZVNwZWNpZmljVGFza3MuYmluZChbJ2ZyZWV6ZWQnXSkpO1xufVxuXG4vKipcbiAqIExvZyBwcm94eSBoZWxwZXJcbiAqIENvbnRleHQ6IFF1ZXVlXG4gKlxuICogQHJldHVybiB7dm9pZH1cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7c3RyaW5nfSBkYXRhXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGNvbmRcbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvZ1Byb3h5KC4uLmFyZ3M6IGFueSk6IHZvaWQge1xuICBsb2cuY2FsbChcbiAgICAvLyBkZWJ1ZyBtb2RlIHN0YXR1c1xuICAgICh0aGlzOiBhbnkpLmNvbmZpZy5nZXQoJ2RlYnVnJyksXG5cbiAgICAvLyBsb2cgYXJndW1lbnRzXG4gICAgLi4uYXJncyxcbiAgKTtcbn1cblxuLyoqXG4gKiBOZXcgdGFzayBzYXZlIGhlbHBlclxuICogQ29udGV4dDogUXVldWVcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcmV0dXJuIHtzdHJpbmd8Ym9vbGVhbn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVUYXNrKHRhc2s6IElUYXNrKTogUHJvbWlzZTxzdHJpbmcgfCBib29sZWFuPiB7XG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRiLmNhbGwodGhpcykuc2F2ZShjaGVja1ByaW9yaXR5KHRhc2spKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBUYXNrIHJlbW92ZSBoZWxwZXJcbiAqIENvbnRleHQ6IFF1ZXVlXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGlkXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVtb3ZlVGFzayhpZDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRiLmNhbGwodGhpcykuZGVsZXRlKGlkKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBFdmVudHMgZGlzcGF0Y2hlciBoZWxwZXJcbiAqIENvbnRleHQ6IFF1ZXVlXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAqIEByZXR1cm4ge3ZvaWR9XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXNwYXRjaEV2ZW50cyh0YXNrOiBJVGFzaywgdHlwZTogc3RyaW5nKTogYm9vbGVhbiB8IHZvaWQge1xuICBpZiAoISgndGFnJyBpbiB0YXNrKSkgcmV0dXJuIGZhbHNlO1xuXG4gIGNvbnN0IGV2ZW50cyA9IFtbYCR7dGFzay50YWd9OiR7dHlwZX1gLCAnZmlyZWQnXSwgW2Ake3Rhc2sudGFnfToqYCwgJ3dpbGRjYXJkLWZpcmVkJ11dO1xuXG4gIGV2ZW50cy5mb3JFYWNoKChlKSA9PiB7XG4gICAgdGhpcy5ldmVudC5lbWl0KGVbMF0sIHRhc2spO1xuICAgIGxvZ1Byb3h5LmNhbGwoKHRoaXM6IGFueSksIGBldmVudC4ke2VbMV19YCwgZVswXSk7XG4gIH0pO1xuXG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIFF1ZXVlIHN0b3BwZXIgaGVscGVyXG4gKiBDb250ZXh0OiBRdWV1ZVxuICpcbiAqIEByZXR1cm4ge3ZvaWR9XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdG9wUXVldWUoKTogdm9pZCB7XG4gIHRoaXMuc3RvcCgpO1xuXG4gIGNsZWFyVGltZW91dCh0aGlzLmN1cnJlbnRUaW1lb3V0KTtcblxuICBsb2dQcm94eS5jYWxsKHRoaXMsICdxdWV1ZS5zdG9wcGVkJywgJ3N0b3AnKTtcbn1cblxuLyoqXG4gKiBGYWlsZWQgam9iIGhhbmRsZXJcbiAqIENvbnRleHQ6IFF1ZXVlXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHJldHVybiB7SVRhc2t9IGpvYlxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmYWlsZWRKb2JIYW5kbGVyKHRhc2s6IElUYXNrKTogUHJvbWlzZTxGdW5jdGlvbj4ge1xuICByZXR1cm4gYXN5bmMgZnVuY3Rpb24gY2hpbGRGYWlsZWRIYW5kbGVyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJlbW92ZVRhc2suY2FsbCh0aGlzLCB0YXNrLl9pZCk7XG5cbiAgICB0aGlzLmV2ZW50LmVtaXQoJ2Vycm9yJywgdGFzayk7XG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGF3YWl0IHRoaXMubmV4dCgpO1xuICB9O1xufVxuXG4vKipcbiAqIEhlbHBlciBvZiB0aGUgbG9jayB0YXNrIG9mIHRoZSBjdXJyZW50IGpvYlxuICogQ29udGV4dDogUXVldWVcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9ja1Rhc2sodGFzazogSVRhc2spOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZGIuY2FsbCh0aGlzKS51cGRhdGUodGFzay5faWQsIHsgbG9ja2VkOiB0cnVlIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIENsYXNzIGV2ZW50IGx1YW5jaGVyIGhlbHBlclxuICogQ29udGV4dDogUXVldWVcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtJV29ya2VyfSB3b3JrZXJcbiAqIEBwYXJhbSB7YW55fSBhcmdzXG4gKiBAcmV0dXJuIHtib29sZWFufHZvaWR9XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaXJlSm9iSW5saW5lRXZlbnQobmFtZTogc3RyaW5nLCB3b3JrZXI6IElXb3JrZXIsIGFyZ3M6IGFueSk6IGJvb2xlYW4ge1xuICBpZiAoaGFzTWV0aG9kKHdvcmtlciwgbmFtZSkgJiYgaXNGdW5jdGlvbih3b3JrZXJbbmFtZV0pKSB7XG4gICAgd29ya2VyW25hbWVdLmNhbGwod29ya2VyLCBhcmdzKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogUHJvY2VzcyBoYW5kbGVyIG9mIHN1Y2NlZWRlZCBqb2JcbiAqIENvbnRleHQ6IFF1ZXVlXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHJldHVybiB7dm9pZH1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1Y2Nlc3NQcm9jZXNzKHRhc2s6IElUYXNrKTogdm9pZCB7XG4gIHJlbW92ZVRhc2suY2FsbCh0aGlzLCB0YXNrLl9pZCk7XG59XG5cbi8qKlxuICogVXBkYXRlIHRhc2sncyByZXRyeSB2YWx1ZVxuICogQ29udGV4dDogUXVldWVcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcGFyYW0ge0lXb3JrZXJ9IHdvcmtlclxuICogQHJldHVybiB7SVRhc2t9XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVSZXRyeSh0YXNrOiBJVGFzaywgd29ya2VyOiBJV29ya2VyKTogSVRhc2sge1xuICBpZiAoISgncmV0cnknIGluIHdvcmtlcikpIHdvcmtlci5yZXRyeSA9IDE7XG5cbiAgaWYgKCEoJ3RyaWVkJyBpbiB0YXNrKSkge1xuICAgIHRhc2sudHJpZWQgPSAwO1xuICAgIHRhc2sucmV0cnkgPSB3b3JrZXIucmV0cnk7XG4gIH1cblxuICB0YXNrLnRyaWVkICs9IDE7XG5cbiAgaWYgKHRhc2sudHJpZWQgPj0gd29ya2VyLnJldHJ5KSB7XG4gICAgdGFzay5mcmVlemVkID0gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiB0YXNrO1xufVxuXG4vKipcbiAqIFByb2Nlc3MgaGFuZGxlciBvZiByZXRyaWVkIGpvYlxuICogQ29udGV4dDogUXVldWVcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcGFyYW0ge0lXb3JrZXJ9IHdvcmtlclxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJldHJ5UHJvY2Vzcyh0YXNrOiBJVGFzaywgd29ya2VyOiBJV29ya2VyKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIC8vIGRpc3BhY3RoIGN1c3RvbSByZXRyeSBldmVudFxuICBkaXNwYXRjaEV2ZW50cy5jYWxsKHRoaXMsIHRhc2ssICdyZXRyeScpO1xuXG4gIC8vIHVwZGF0ZSByZXRyeSB2YWx1ZVxuICBjb25zdCB1cGRhdGVUYXNrOiBJVGFzayA9IHVwZGF0ZVJldHJ5LmNhbGwodGhpcywgdGFzaywgd29ya2VyKTtcblxuICAvLyBkZWxldGUgbG9jayBwcm9wZXJ0eSBmb3IgbmV4dCBwcm9jZXNzXG4gIHVwZGF0ZVRhc2subG9ja2VkID0gZmFsc2U7XG5cbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZGIuY2FsbCh0aGlzKS51cGRhdGUodGFzay5faWQsIHVwZGF0ZVRhc2spO1xuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogU3VjY2VlZCBqb2IgaGFuZGxlclxuICogQ29udGV4dDogUXVldWVcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcGFyYW0ge0lXb3JrZXJ9IHdvcmtlclxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdWNjZXNzSm9iSGFuZGxlcih0YXNrOiBJVGFzaywgd29ya2VyOiBJV29ya2VyKTogUHJvbWlzZTxGdW5jdGlvbj4ge1xuICBjb25zdCBzZWxmOiBRdWV1ZSA9IHRoaXM7XG4gIHJldHVybiBhc3luYyBmdW5jdGlvbiBjaGlsZFN1Y2Nlc3NKb2JIYW5kbGVyKHJlc3VsdDogYm9vbGVhbik6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIGRpc3BhdGNoIGpvYiBwcm9jZXNzIGFmdGVyIHJ1bnMgYSB0YXNrIGJ1dCBvbmx5IG5vbiBlcnJvciBqb2JzXG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgLy8gZ28gYWhlYWQgdG8gc3VjY2VzcyBwcm9jZXNzXG4gICAgICBzdWNjZXNzUHJvY2Vzcy5jYWxsKHNlbGYsIHRhc2spO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBnbyBhaGVhZCB0byByZXRyeSBwcm9jZXNzXG4gICAgICByZXRyeVByb2Nlc3MuY2FsbChzZWxmLCB0YXNrLCB3b3JrZXIpO1xuICAgIH1cblxuICAgIC8vIGZpcmUgam9iIGFmdGVyIGV2ZW50XG4gICAgZmlyZUpvYklubGluZUV2ZW50LmNhbGwoc2VsZiwgJ2FmdGVyJywgd29ya2VyLCB0YXNrLmFyZ3MpO1xuXG4gICAgLy8gZGlzcGFjdGggY3VzdG9tIGFmdGVyIGV2ZW50XG4gICAgZGlzcGF0Y2hFdmVudHMuY2FsbChzZWxmLCB0YXNrLCAnYWZ0ZXInKTtcblxuICAgIC8vIHRyeSBuZXh0IHF1ZXVlIGpvYlxuICAgIGF3YWl0IHNlbGYubmV4dCgpO1xuICB9O1xufVxuXG4vKipcbiAqIEpvYiBoYW5kbGVyIGhlbHBlclxuICogQ29udGV4dDogUXVldWVcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcGFyYW0ge0lKb2J9IHdvcmtlclxuICogQHBhcmFtIHtJV29ya2VyfSB3b3JrZXJJbnN0YW5jZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0IC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovIGZ1bmN0aW9uIGxvb3BIYW5kbGVyKFxuICB0YXNrOiBJVGFzayxcbiAgd29ya2VyOiBGdW5jdGlvbixcbiAgd29ya2VySW5zdGFuY2U6IElXb3JrZXIsXG4pOiBGdW5jdGlvbiB7XG4gIHJldHVybiBhc3luYyBmdW5jdGlvbiBjaGlsZExvb3BIYW5kbGVyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHNlbGY6IFF1ZXVlID0gdGhpcztcblxuICAgIC8vIGxvY2sgdGhlIGN1cnJlbnQgdGFzayBmb3IgcHJldmVudCByYWNlIGNvbmRpdGlvblxuICAgIGF3YWl0IGxvY2tUYXNrLmNhbGwoc2VsZiwgdGFzayk7XG5cbiAgICAvLyBmaXJlIGpvYiBiZWZvcmUgZXZlbnRcbiAgICBmaXJlSm9iSW5saW5lRXZlbnQuY2FsbCh0aGlzLCAnYmVmb3JlJywgd29ya2VySW5zdGFuY2UsIHRhc2suYXJncyk7XG5cbiAgICAvLyBkaXNwYWN0aCBjdXN0b20gYmVmb3JlIGV2ZW50XG4gICAgZGlzcGF0Y2hFdmVudHMuY2FsbCh0aGlzLCB0YXNrLCAnYmVmb3JlJyk7XG5cbiAgICBjb25zdCBkZXBzID0gUXVldWUud29ya2VyRGVwc1t3b3JrZXIubmFtZV07XG5cbiAgICAvLyBwcmVwYXJpbmcgd29ya2VyIGRlcGVuZGVuY2llc1xuICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9IE9iamVjdC52YWx1ZXMoZGVwcyB8fCB7fSk7XG5cbiAgICAvLyBUYXNrIHJ1bm5lciBwcm9taXNlXG4gICAgd29ya2VySW5zdGFuY2UuaGFuZGxlXG4gICAgICAuY2FsbCh3b3JrZXJJbnN0YW5jZSwgdGFzay5hcmdzLCAuLi5kZXBlbmRlbmNpZXMpXG4gICAgICAudGhlbigoYXdhaXQgc3VjY2Vzc0pvYkhhbmRsZXIuY2FsbChzZWxmLCB0YXNrLCB3b3JrZXJJbnN0YW5jZSkpLmJpbmQoc2VsZikpXG4gICAgICAuY2F0Y2goKGF3YWl0IGZhaWxlZEpvYkhhbmRsZXIuY2FsbChzZWxmLCB0YXNrKSkuYmluZChzZWxmKSk7XG4gIH07XG59XG5cbi8qKlxuICogVGltZW91dCBjcmVhdG9yIGhlbHBlclxuICogQ29udGV4dDogUXVldWVcbiAqXG4gKiBAcmV0dXJuIHtudW1iZXJ9XCJcIlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlVGltZW91dCgpOiBQcm9taXNlPG51bWJlcj4ge1xuICAvLyBpZiBydW5uaW5nIGFueSBqb2IsIHN0b3AgaXRcbiAgLy8gdGhlIHB1cnBvc2UgaGVyZSBpcyB0byBwcmV2ZW50IGNvY3VycmVudCBvcGVyYXRpb24gaW4gc2FtZSBjaGFubmVsXG4gIGNsZWFyVGltZW91dCh0aGlzLmN1cnJlbnRUaW1lb3V0KTtcblxuICAvLyBHZXQgbmV4dCB0YXNrXG4gIGNvbnN0IHRhc2s6IElUYXNrID0gKGF3YWl0IGRiLmNhbGwodGhpcykuZmV0Y2goKSkuc2hpZnQoKTtcblxuICBpZiAodGFzayA9PT0gdW5kZWZpbmVkKSB7XG4gICAgbG9nUHJveHkuY2FsbCh0aGlzLCAncXVldWUuZW1wdHknLCB0aGlzLmN1cnJlbnRDaGFubmVsKTtcbiAgICBzdG9wUXVldWUuY2FsbCh0aGlzKTtcbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIGlmICghdGhpcy5jb250YWluZXIuaGFzKHRhc2suaGFuZGxlcikpIHtcbiAgICBsb2dQcm94eS5jYWxsKHRoaXMsICdxdWV1ZS5ub3QtZm91bmQnLCB0YXNrLmhhbmRsZXIpO1xuICAgIGF3YWl0IChhd2FpdCBmYWlsZWRKb2JIYW5kbGVyLmNhbGwodGhpcywgdGFzaykpLmNhbGwodGhpcyk7XG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICAvLyBHZXQgd29ya2VyIHdpdGggaGFuZGxlciBuYW1lXG4gIGNvbnN0IEpvYldvcmtlcjogRnVuY3Rpb24gPSB0aGlzLmNvbnRhaW5lci5nZXQodGFzay5oYW5kbGVyKTtcblxuICAvLyBDcmVhdGUgYSB3b3JrZXIgaW5zdGFuY2VcbiAgY29uc3Qgd29ya2VySW5zdGFuY2U6IElXb3JrZXIgPSBuZXcgSm9iV29ya2VyKCk7XG5cbiAgLy8gZ2V0IGFsd2F5cyBsYXN0IHVwZGF0ZWQgY29uZmlnIHZhbHVlXG4gIGNvbnN0IHRpbWVvdXQ6IG51bWJlciA9IHdvcmtlckluc3RhbmNlLnRpbWVvdXQgfHwgdGhpcy5jb25maWcuZ2V0KCd0aW1lb3V0Jyk7XG5cbiAgLy8gY3JlYXRlIGEgYXJyYXkgd2l0aCBoYW5kbGVyIHBhcmFtZXRlcnMgZm9yIHNob3J0ZW4gbGluZSBudW1iZXJzXG4gIGNvbnN0IHBhcmFtcyA9IFt0YXNrLCBKb2JXb3JrZXIsIHdvcmtlckluc3RhbmNlXTtcblxuICAvLyBHZXQgaGFuZGxlciBmdW5jdGlvbiBmb3IgaGFuZGxlIG9uIGNvbXBsZXRlZCBldmVudFxuICBjb25zdCBoYW5kbGVyOiBGdW5jdGlvbiA9IChhd2FpdCBsb29wSGFuZGxlci5jYWxsKHRoaXMsIC4uLnBhcmFtcykpLmJpbmQodGhpcyk7XG5cbiAgLy8gY3JlYXRlIG5ldyB0aW1lb3V0IGZvciBwcm9jZXNzIGEgam9iIGluIHF1ZXVlXG4gIC8vIGJpbmRpbmcgbG9vcEhhbmRsZXIgZnVuY3Rpb24gdG8gc2V0VGltZW91dFxuICAvLyB0aGVuIHJldHVybiB0aGUgdGltZW91dCBpbnN0YW5jZVxuICB0aGlzLmN1cnJlbnRUaW1lb3V0ID0gc2V0VGltZW91dChoYW5kbGVyLCB0aW1lb3V0KTtcblxuICByZXR1cm4gdGhpcy5jdXJyZW50VGltZW91dDtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIHN0YXR1cyB0byBmYWxzZSBvZiBxdWV1ZVxuICogQ29udGV4dDogUXVldWVcbiAqXG4gKiBAcmV0dXJuIHt2b2lkfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RhdHVzT2ZmKCk6IHZvaWQge1xuICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciBhIHRhc2sgaXMgcmVwbGljYWJsZSBvciBub3RcbiAqIENvbnRleHQ6IFF1ZXVlXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNhbk11bHRpcGxlKHRhc2s6IElUYXNrKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGlmICh0eXBlb2YgdGFzayAhPT0gJ29iamVjdCcgfHwgdGFzay51bmlxdWUgIT09IHRydWUpIHJldHVybiB0cnVlO1xuICByZXR1cm4gKGF3YWl0IHRoaXMuaGFzQnlUYWcodGFzay50YWcpKSA9PT0gZmFsc2U7XG59XG5cbi8qKlxuICogSm9iIGhhbmRsZXIgY2xhc3MgcmVnaXN0ZXJcbiAqIENvbnRleHQ6IFF1ZXVlXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHBhcmFtIHtJV29ya2VyfSB3b3JrZXJcbiAqIEByZXR1cm4ge3ZvaWR9XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlcldvcmtlcnMoKTogYm9vbGVhbiB7XG4gIGlmIChRdWV1ZS5pc1JlZ2lzdGVyZWQpIHJldHVybiBmYWxzZTtcblxuICBjb25zdCB3b3JrZXJzID0gUXVldWUucXVldWVXb3JrZXJzIHx8IHt9O1xuXG4gIHRoaXMuY29udGFpbmVyLm1lcmdlKHdvcmtlcnMpO1xuXG4gIFF1ZXVlLmlzUmVnaXN0ZXJlZCA9IHRydWU7XG5cbiAgcmV0dXJuIHRydWU7XG59XG4iLCJpbXBvcnQgUXVldWUgZnJvbSAnLi9xdWV1ZSc7XG5cbi8qIGdsb2JhbCB3aW5kb3c6dHJ1ZSAqL1xuXG53aW5kb3cuUXVldWUgPSBRdWV1ZTtcblxuZXhwb3J0IGRlZmF1bHQgUXVldWU7XG4iLCIvKiBAZmxvdyAqL1xuaW1wb3J0IHR5cGUgSUNvbmZpZyBmcm9tICcuLi9pbnRlcmZhY2VzL2NvbmZpZyc7XG5pbXBvcnQgQ29udGFpbmVyIGZyb20gJy4vY29udGFpbmVyJztcbmltcG9ydCBTdG9yYWdlQ2Fwc3VsZSBmcm9tICcuL3N0b3JhZ2UtY2Fwc3VsZSc7XG5pbXBvcnQgQ29uZmlnIGZyb20gJy4vY29uZmlnJztcbmltcG9ydCBFdmVudCBmcm9tICcuL2V2ZW50JztcblxuaW1wb3J0IHsgY2xvbmUsIHV0aWxDbGVhckJ5VGFnIH0gZnJvbSAnLi91dGlscyc7XG5cbmltcG9ydCB7XG4gIGdldFRhc2tzV2l0aG91dEZyZWV6ZWQsXG4gIGNyZWF0ZVRpbWVvdXQsXG4gIHJlZ2lzdGVyV29ya2VycyxcbiAgY2FuTXVsdGlwbGUsXG4gIHN0b3BRdWV1ZSxcbiAgc3RhdHVzT2ZmLFxuICBsb2dQcm94eSxcbiAgc2F2ZVRhc2ssXG4gIGRiLFxufSBmcm9tICcuL2hlbHBlcnMnO1xuXG4vKiBlc2xpbnQgbm8tdW5kZXJzY29yZS1kYW5nbGU6IFsyLCB7IFwiYWxsb3dcIjogW1wiX2lkXCJdIH1dICovXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFF1ZXVlKGNvbmZpZzogSUNvbmZpZykge1xuICB0aGlzLmNoYW5uZWxzID0ge307XG4gIHRoaXMuY29uZmlnID0gbmV3IENvbmZpZyhjb25maWcpO1xuXG4gIC8vIGlmIGN1c3RvbSBzdG9yYWdlIGRyaXZlciBleGlzdHMsIHNldHVwIGl0XG4gIGNvbnN0IHsgc3RvcmFnZSB9ID0gUXVldWUuZHJpdmVycztcbiAgdGhpcy5zdG9yYWdlID0gbmV3IFN0b3JhZ2VDYXBzdWxlKHRoaXMuY29uZmlnLCBzdG9yYWdlKTtcblxuICAvLyBEZWZhdWx0IGpvYiB0aW1lb3V0XG4gIHRoaXMudGltZW91dCA9IHRoaXMuY29uZmlnLmdldCgndGltZW91dCcpO1xufVxuXG5RdWV1ZS5GSUZPID0gJ2ZpZm8nO1xuUXVldWUuTElGTyA9ICdsaWZvJztcblF1ZXVlLmRyaXZlcnMgPSB7fTtcblF1ZXVlLnF1ZXVlV29ya2VycyA9IHt9O1xuUXVldWUud29ya2VyRGVwcyA9IHt9O1xuXG5RdWV1ZS5wcm90b3R5cGUuY3VycmVudENoYW5uZWwgPSBudWxsO1xuUXVldWUucHJvdG90eXBlLnN0b3BwZWQgPSB0cnVlO1xuUXVldWUucHJvdG90eXBlLnJ1bm5pbmcgPSBmYWxzZTtcblF1ZXVlLnByb3RvdHlwZS5ldmVudCA9IG5ldyBFdmVudCgpO1xuUXVldWUucHJvdG90eXBlLmNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoKTtcblxuLyoqXG4gKiBDcmVhdGUgbmV3IGpvYiB0byBjaGFubmVsXG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSB0YXNrXG4gKiBAcmV0dXJuIHtTdHJpbmd8Qm9vbGVhbn0gam9iXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUXVldWUucHJvdG90eXBlLmFkZCA9IGFzeW5jIGZ1bmN0aW9uIGFkZCh0YXNrKTogUHJvbWlzZTxzdHJpbmcgfCBib29sZWFuPiB7XG4gIGlmICghKGF3YWl0IGNhbk11bHRpcGxlLmNhbGwodGhpcywgdGFzaykpKSByZXR1cm4gZmFsc2U7XG5cbiAgY29uc3QgaWQgPSBhd2FpdCBzYXZlVGFzay5jYWxsKHRoaXMsIHRhc2spO1xuXG4gIGlmIChpZCAmJiB0aGlzLnN0b3BwZWQgJiYgdGhpcy5ydW5uaW5nID09PSB0cnVlKSB7XG4gICAgYXdhaXQgdGhpcy5zdGFydCgpO1xuICB9XG5cbiAgLy8gcGFzcyBhY3Rpdml0eSB0byB0aGUgbG9nIHNlcnZpY2UuXG4gIGxvZ1Byb3h5LmNhbGwodGhpcywgJ3F1ZXVlLmNyZWF0ZWQnLCB0YXNrLmhhbmRsZXIpO1xuXG4gIHJldHVybiBpZDtcbn07XG5cbi8qKlxuICogUHJvY2VzcyBuZXh0IGpvYlxuICpcbiAqIEByZXR1cm4ge3ZvaWR9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUXVldWUucHJvdG90eXBlLm5leHQgPSBhc3luYyBmdW5jdGlvbiBuZXh0KCk6IFByb21pc2U8dm9pZCB8IGJvb2xlYW4+IHtcbiAgaWYgKHRoaXMuc3RvcHBlZCkge1xuICAgIHN0YXR1c09mZi5jYWxsKHRoaXMpO1xuICAgIHJldHVybiBzdG9wUXVldWUuY2FsbCh0aGlzKTtcbiAgfVxuXG4gIC8vIEdlbmVyYXRlIGEgbG9nIG1lc3NhZ2VcbiAgbG9nUHJveHkuY2FsbCh0aGlzLCAncXVldWUubmV4dCcsICduZXh0Jyk7XG5cbiAgLy8gc3RhcnQgcXVldWUgYWdhaW5cbiAgYXdhaXQgdGhpcy5zdGFydCgpO1xuXG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBTdGFydCBxdWV1ZSBsaXN0ZW5lclxuICpcbiAqIEByZXR1cm4ge0Jvb2xlYW59IGpvYlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblF1ZXVlLnByb3RvdHlwZS5zdGFydCA9IGFzeW5jIGZ1bmN0aW9uIHN0YXJ0KCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAvLyBTdG9wIHRoZSBxdWV1ZSBmb3IgcmVzdGFydFxuICB0aGlzLnN0b3BwZWQgPSBmYWxzZTtcblxuICAvLyBSZWdpc3RlciB0YXNrcywgaWYgbm90IHJlZ2lzdGVyZWRcbiAgcmVnaXN0ZXJXb3JrZXJzLmNhbGwodGhpcyk7XG5cbiAgbG9nUHJveHkuY2FsbCh0aGlzLCAncXVldWUuc3RhcnRpbmcnLCAnc3RhcnQnKTtcblxuICAvLyBDcmVhdGUgYSB0aW1lb3V0IGZvciBzdGFydCBxdWV1ZVxuICB0aGlzLnJ1bm5pbmcgPSAoYXdhaXQgY3JlYXRlVGltZW91dC5jYWxsKHRoaXMpKSA+IDA7XG5cbiAgcmV0dXJuIHRoaXMucnVubmluZztcbn07XG5cbi8qKlxuICogU3RvcCBxdWV1ZSBsaXN0ZW5lciBhZnRlciBlbmQgb2YgY3VycmVudCB0YXNrXG4gKlxuICogQHJldHVybiB7Vm9pZH1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5RdWV1ZS5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uIHN0b3AoKTogdm9pZCB7XG4gIGxvZ1Byb3h5LmNhbGwodGhpcywgJ3F1ZXVlLnN0b3BwaW5nJywgJ3N0b3AnKTtcbiAgdGhpcy5zdG9wcGVkID0gdHJ1ZTtcbn07XG5cbi8qKlxuICogU3RvcCBxdWV1ZSBsaXN0ZW5lciBpbmNsdWRpbmcgY3VycmVudCB0YXNrXG4gKlxuICogQHJldHVybiB7Vm9pZH1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5RdWV1ZS5wcm90b3R5cGUuZm9yY2VTdG9wID0gZnVuY3Rpb24gZm9yY2VTdG9wKCk6IHZvaWQge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBzdG9wUXVldWUuY2FsbCh0aGlzKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IGNoYW5uZWxcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHRhc2tcbiAqIEByZXR1cm4ge1F1ZXVlfSBjaGFubmVsXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUXVldWUucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShjaGFubmVsOiBzdHJpbmcpOiBRdWV1ZSB7XG4gIGlmICghKGNoYW5uZWwgaW4gdGhpcy5jaGFubmVscykpIHtcbiAgICB0aGlzLmN1cnJlbnRDaGFubmVsID0gY2hhbm5lbDtcbiAgICB0aGlzLmNoYW5uZWxzW2NoYW5uZWxdID0gY2xvbmUodGhpcyk7XG4gIH1cblxuICByZXR1cm4gdGhpcy5jaGFubmVsc1tjaGFubmVsXTtcbn07XG5cbi8qKlxuICogR2V0IGNoYW5uZWwgaW5zdGFuY2UgYnkgY2hhbm5lbCBuYW1lXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtRdWV1ZX1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5RdWV1ZS5wcm90b3R5cGUuY2hhbm5lbCA9IGZ1bmN0aW9uIGNoYW5uZWwobmFtZTogc3RyaW5nKTogUXVldWUge1xuICBpZiAoIXRoaXMuY2hhbm5lbHNbbmFtZV0pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYENoYW5uZWwgb2YgXCIke25hbWV9XCIgbm90IGZvdW5kYCk7XG4gIH1cblxuICByZXR1cm4gdGhpcy5jaGFubmVsc1tuYW1lXTtcbn07XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGVyZSBpcyBhbnkgdGFza1xuICpcbiAqIEByZXR1cm4ge0Jvb2VsYW59XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUXVldWUucHJvdG90eXBlLmlzRW1wdHkgPSBhc3luYyBmdW5jdGlvbiBpc0VtcHR5KCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICByZXR1cm4gKGF3YWl0IHRoaXMuY291bnQoKSkgPCAxO1xufTtcblxuLyoqXG4gKiBHZXQgdGFzayBjb3VudFxuICpcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5RdWV1ZS5wcm90b3R5cGUuY291bnQgPSBhc3luYyBmdW5jdGlvbiBjb3VudCgpOiBQcm9taXNlPG51bWJlcj4ge1xuICByZXR1cm4gKGF3YWl0IGdldFRhc2tzV2l0aG91dEZyZWV6ZWQuY2FsbCh0aGlzKSkubGVuZ3RoO1xufTtcblxuLyoqXG4gKiBHZXQgdGFzayBjb3VudCBieSB0YWdcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHRhZ1xuICogQHJldHVybiB7QXJyYXk8SVRhc2s+fVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblF1ZXVlLnByb3RvdHlwZS5jb3VudEJ5VGFnID0gYXN5bmMgZnVuY3Rpb24gY291bnRCeVRhZyh0YWc6IHN0cmluZyk6IFByb21pc2U8bnVtYmVyPiB7XG4gIHJldHVybiAoYXdhaXQgZ2V0VGFza3NXaXRob3V0RnJlZXplZC5jYWxsKHRoaXMpKS5maWx0ZXIodCA9PiB0LnRhZyA9PT0gdGFnKS5sZW5ndGg7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbGwgdGFza3MgZnJvbSBjaGFubmVsXG4gKlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5RdWV1ZS5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiBjbGVhcigpOiBib29sZWFuIHtcbiAgaWYgKCF0aGlzLmN1cnJlbnRDaGFubmVsKSByZXR1cm4gZmFsc2U7XG4gIHRoaXMuc3RvcmFnZS5jbGVhcih0aGlzLmN1cnJlbnRDaGFubmVsKTtcbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbGwgdGFza3MgZnJvbSBjaGFubmVsIGJ5IHRhZ1xuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gdGFnXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblF1ZXVlLnByb3RvdHlwZS5jbGVhckJ5VGFnID0gYXN5bmMgZnVuY3Rpb24gY2xlYXJCeVRhZyh0YWc6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCBzZWxmID0gdGhpcztcbiAgY29uc3QgZGF0YSA9IGF3YWl0IGRiLmNhbGwoc2VsZikuYWxsKCk7XG4gIGNvbnN0IHJlbW92ZXMgPSBkYXRhLmZpbHRlcih1dGlsQ2xlYXJCeVRhZy5iaW5kKHRhZykpLm1hcChhc3luYyAodCkgPT4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRiLmNhbGwoc2VsZikuZGVsZXRlKHQuX2lkKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9KTtcbiAgYXdhaXQgUHJvbWlzZS5hbGwocmVtb3Zlcyk7XG59O1xuXG4vKipcbiAqIENoZWNrIGEgdGFzayB3aGV0aGVyIGV4aXN0cyBieSBqb2IgaWRcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHRhZ1xuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5RdWV1ZS5wcm90b3R5cGUuaGFzID0gYXN5bmMgZnVuY3Rpb24gaGFzKGlkOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgcmV0dXJuIChhd2FpdCBnZXRUYXNrc1dpdGhvdXRGcmVlemVkLmNhbGwodGhpcykpLmZpbmRJbmRleCh0ID0+IHQuX2lkID09PSBpZCkgPiAtMTtcbn07XG5cbi8qKlxuICogQ2hlY2sgYSB0YXNrIHdoZXRoZXIgZXhpc3RzIGJ5IHRhZ1xuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gdGFnXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblF1ZXVlLnByb3RvdHlwZS5oYXNCeVRhZyA9IGFzeW5jIGZ1bmN0aW9uIGhhc0J5VGFnKHRhZzogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIHJldHVybiAoYXdhaXQgZ2V0VGFza3NXaXRob3V0RnJlZXplZC5jYWxsKHRoaXMpKS5maW5kSW5kZXgodCA9PiB0LnRhZyA9PT0gdGFnKSA+IC0xO1xufTtcblxuLyoqXG4gKiBTZXQgY29uZmlnIHRpbWVvdXQgdmFsdWVcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZhbFxuICogQHJldHVybiB7Vm9pZH1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5RdWV1ZS5wcm90b3R5cGUuc2V0VGltZW91dCA9IGZ1bmN0aW9uIHNldFRpbWVvdXQodmFsOiBudW1iZXIpOiB2b2lkIHtcbiAgdGhpcy50aW1lb3V0ID0gdmFsO1xuICB0aGlzLmNvbmZpZy5zZXQoJ3RpbWVvdXQnLCB2YWwpO1xufTtcblxuLyoqXG4gKiBTZXQgY29uZmlnIGxpbWl0IHZhbHVlXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSB2YWxcbiAqIEByZXR1cm4ge1ZvaWR9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUXVldWUucHJvdG90eXBlLnNldExpbWl0ID0gZnVuY3Rpb24gc2V0TGltaXQodmFsOiBudW1iZXIpOiB2b2lkIHtcbiAgdGhpcy5jb25maWcuc2V0KCdsaW1pdCcsIHZhbCk7XG59O1xuXG4vKipcbiAqIFNldCBjb25maWcgcHJlZml4IHZhbHVlXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1ZvaWR9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUXVldWUucHJvdG90eXBlLnNldFByZWZpeCA9IGZ1bmN0aW9uIHNldFByZWZpeCh2YWw6IHN0cmluZyk6IHZvaWQge1xuICB0aGlzLmNvbmZpZy5zZXQoJ3ByZWZpeCcsIHZhbCk7XG59O1xuXG4vKipcbiAqIFNldCBjb25maWcgcHJpY2lwbGUgdmFsdWVcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHZhbFxuICogQHJldHVybiB7Vm9pZH1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5RdWV1ZS5wcm90b3R5cGUuc2V0UHJpbmNpcGxlID0gZnVuY3Rpb24gc2V0UHJpbmNpcGxlKHZhbDogc3RyaW5nKTogdm9pZCB7XG4gIHRoaXMuY29uZmlnLnNldCgncHJpbmNpcGxlJywgdmFsKTtcbn07XG5cbi8qKlxuICogU2V0IGNvbmZpZyBkZWJ1ZyB2YWx1ZVxuICpcbiAqIEBwYXJhbSAge0Jvb2xlYW59IHZhbFxuICogQHJldHVybiB7Vm9pZH1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5RdWV1ZS5wcm90b3R5cGUuc2V0RGVidWcgPSBmdW5jdGlvbiBzZXREZWJ1Zyh2YWw6IGJvb2xlYW4pOiB2b2lkIHtcbiAgdGhpcy5jb25maWcuc2V0KCdkZWJ1ZycsIHZhbCk7XG59O1xuXG5RdWV1ZS5wcm90b3R5cGUuc2V0U3RvcmFnZSA9IGZ1bmN0aW9uIHNldFN0b3JhZ2UodmFsOiBzdHJpbmcpOiB2b2lkIHtcbiAgdGhpcy5jb25maWcuc2V0KCdzdG9yYWdlJywgdmFsKTtcbn07XG5cbi8qKlxuICogU2V0IGFjdGlvbiBldmVudHNcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICogQHBhcmFtICB7RnVuY3Rpb259IGNiXG4gKiBAcmV0dXJuIHtWb2lkfVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblF1ZXVlLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIG9uKGtleTogc3RyaW5nLCBjYjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgdGhpcy5ldmVudC5vbiguLi5ba2V5LCBjYl0pO1xuICBsb2dQcm94eS5jYWxsKHRoaXMsICdldmVudC5jcmVhdGVkJywga2V5KTtcbn07XG5cbi8qKlxuICogUmVnaXN0ZXIgd29ya2VyXG4gKlxuICogQHBhcmFtICB7QXJyYXk8SUpvYj59IGpvYnNcbiAqIEByZXR1cm4ge1ZvaWR9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUXVldWUud29ya2VycyA9IGZ1bmN0aW9uIHdvcmtlcnMod29ya2Vyc09iajogeyBbcHJvcDogc3RyaW5nXTogYW55IH0gPSB7fSk6IHZvaWQge1xuICBpZiAoISh3b3JrZXJzT2JqIGluc3RhbmNlb2YgT2JqZWN0KSkge1xuICAgIHRocm93IG5ldyBFcnJvcignVGhlIHBhcmFtZXRlcnMgc2hvdWxkIGJlIG9iamVjdC4nKTtcbiAgfVxuXG4gIFF1ZXVlLmlzUmVnaXN0ZXJlZCA9IGZhbHNlO1xuICBRdWV1ZS5xdWV1ZVdvcmtlcnMgPSB3b3JrZXJzT2JqO1xufTtcblxuLyoqXG4gKiBBZGRlZCB3b3JrZXJzIGRlcGVuZGVuY2llc1xuICpcbiAqIEBwYXJhbSAge09iamVjdH0gZHJpdmVyXG4gKiBAcmV0dXJuIHtWb2lkfVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblF1ZXVlLmRlcHMgPSBmdW5jdGlvbiBkZXBzKGRlcGVuZGVuY2llczogeyBbcHJvcDogc3RyaW5nXTogYW55IH0gPSB7fSk6IHZvaWQge1xuICBpZiAoIShkZXBlbmRlbmNpZXMgaW5zdGFuY2VvZiBPYmplY3QpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgcGFyYW1ldGVycyBzaG91bGQgYmUgb2JqZWN0LicpO1xuICB9XG5cbiAgUXVldWUud29ya2VyRGVwcyA9IGRlcGVuZGVuY2llcztcbn07XG5cbi8qKlxuICogU2V0dXAgYSBjdXN0b20gZHJpdmVyXG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSBkcml2ZXJcbiAqIEByZXR1cm4ge1ZvaWR9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUXVldWUudXNlID0gZnVuY3Rpb24gdXNlKGRyaXZlcik6IHZvaWQge1xuICBRdWV1ZS5kcml2ZXJzID0geyAuLi5RdWV1ZS5kcml2ZXJzLCAuLi5kcml2ZXIgfTtcbn07XG4iLCIvKiBAZmxvdyAqL1xuaW1wb3J0IGdyb3VwQnkgZnJvbSAnZ3JvdXAtYnknO1xuaW1wb3J0IHR5cGUgSUNvbmZpZyBmcm9tICcuLi9pbnRlcmZhY2VzL2NvbmZpZyc7XG5pbXBvcnQgdHlwZSB7IElTdG9yYWdlIH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9zdG9yYWdlJztcbmltcG9ydCB0eXBlIElUYXNrIGZyb20gJy4uL2ludGVyZmFjZXMvdGFzayc7XG5pbXBvcnQgeyBMb2NhbEZvcmFnZUFkYXB0ZXIsIEluTWVtb3J5QWRhcHRlciB9IGZyb20gJy4vYWRhcHRlcnMnO1xuaW1wb3J0IHsgZXhjbHVkZVNwZWNpZmljVGFza3MsIGxpZm8sIGZpZm8gfSBmcm9tICcuL3V0aWxzJztcblxuLyogZXNsaW50IG5vLWNvbnNvbGU6IFtcImVycm9yXCIsIHsgYWxsb3c6IFtcIndhcm5cIiwgXCJlcnJvclwiXSB9XSAqL1xuLyogZXNsaW50IG5vLXVuZGVyc2NvcmUtZGFuZ2xlOiBbMiwgeyBcImFsbG93XCI6IFtcIl9pZFwiXSB9XSAqL1xuLyogZXNsaW50IGNsYXNzLW1ldGhvZHMtdXNlLXRoaXM6IFtcImVycm9yXCIsIHsgXCJleGNlcHRNZXRob2RzXCI6IFtcImdlbmVyYXRlSWRcIl0gfV0gKi9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RvcmFnZUNhcHN1bGUge1xuICBjb25maWc6IElDb25maWc7XG4gIHN0b3JhZ2U6IElTdG9yYWdlO1xuICBzdG9yYWdlQ2hhbm5lbDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogSUNvbmZpZywgc3RvcmFnZTogSVN0b3JhZ2UpIHtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLnN0b3JhZ2UgPSB0aGlzLmluaXRTdG9yYWdlKHN0b3JhZ2UpO1xuICB9XG5cbiAgaW5pdFN0b3JhZ2UoU3RvcmFnZTogYW55KSB7XG4gICAgaWYgKHR5cGVvZiBTdG9yYWdlID09PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIFN0b3JhZ2U7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgU3RvcmFnZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIG5ldyBTdG9yYWdlKHRoaXMuY29uZmlnKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuY29uZmlnLmdldCgnc3RvcmFnZScpID09PSAnaW5tZW1vcnknKSB7XG4gICAgICByZXR1cm4gbmV3IEluTWVtb3J5QWRhcHRlcih0aGlzLmNvbmZpZyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBMb2NhbEZvcmFnZUFkYXB0ZXIodGhpcy5jb25maWcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbGVjdCBhIGNoYW5uZWwgYnkgY2hhbm5lbCBuYW1lXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHtTdG9yYWdlQ2Fwc3VsZX1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGNoYW5uZWwobmFtZTogc3RyaW5nKTogU3RvcmFnZUNhcHN1bGUge1xuICAgIHRoaXMuc3RvcmFnZUNoYW5uZWwgPSBuYW1lO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoIHRhc2tzIGZyb20gc3RvcmFnZSB3aXRoIG9yZGVyZWRcbiAgICpcbiAgICogQHJldHVybiB7YW55W119XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBmZXRjaCgpOiBQcm9taXNlPGFueVtdPiB7XG4gICAgY29uc3QgYWxsID0gKGF3YWl0IHRoaXMuYWxsKCkpLmZpbHRlcihleGNsdWRlU3BlY2lmaWNUYXNrcyk7XG4gICAgY29uc3QgdGFza3MgPSBncm91cEJ5KGFsbCwgJ3ByaW9yaXR5Jyk7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRhc2tzKVxuICAgICAgLm1hcChrZXkgPT4gcGFyc2VJbnQoa2V5LCAxMCkpXG4gICAgICAuc29ydCgoYSwgYikgPT4gYiAtIGEpXG4gICAgICAucmVkdWNlKHRoaXMucmVkdWNlVGFza3ModGFza3MpLCBbXSk7XG4gIH1cblxuICAvKipcbiAgICogU2F2ZSB0YXNrIHRvIHN0b3JhZ2VcbiAgICpcbiAgICogQHBhcmFtICB7SVRhc2t9IHRhc2tcbiAgICogQHJldHVybiB7U3RyaW5nfEJvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBzYXZlKHRhc2s6IElUYXNrKTogUHJvbWlzZTxzdHJpbmcgfCBib29sZWFuPiB7XG4gICAgaWYgKHR5cGVvZiB0YXNrICE9PSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gZ2V0IGFsbCB0YXNrcyBjdXJyZW50IGNoYW5uZWwnc1xuICAgIGNvbnN0IHRhc2tzOiBJVGFza1tdID0gYXdhaXQgdGhpcy5zdG9yYWdlLmdldCh0aGlzLnN0b3JhZ2VDaGFubmVsKTtcblxuICAgIC8vIENoZWNrIHRoZSBjaGFubmVsIGxpbWl0LlxuICAgIC8vIElmIGxpbWl0IGlzIGV4Y2VlZGVkLCBkb2VzIG5vdCBpbnNlcnQgbmV3IHRhc2tcbiAgICBpZiAoYXdhaXQgdGhpcy5pc0V4Y2VlZGVkKCkpIHtcbiAgICAgIGNvbnNvbGUud2FybihgVGFzayBsaW1pdCBleGNlZWRlZDogVGhlICcke3RoaXMuc3RvcmFnZUNoYW5uZWx9JyBjaGFubmVsIGxpbWl0IGlzICR7dGhpcy5jb25maWcuZ2V0KCdsaW1pdCcpfWApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIHByZXBhcmUgYWxsIHByb3BlcnRpZXMgYmVmb3JlIHNhdmVcbiAgICAvLyBleGFtcGxlOiBjcmVhdGVkQXQgZXRjLlxuICAgIGNvbnN0IG5ld1Rhc2sgPSB0aGlzLnByZXBhcmVUYXNrKHRhc2spO1xuXG4gICAgLy8gYWRkIHRhc2sgdG8gc3RvcmFnZVxuICAgIHRhc2tzLnB1c2gobmV3VGFzayk7XG5cbiAgICAvLyBzYXZlIHRhc2tzXG4gICAgYXdhaXQgdGhpcy5zdG9yYWdlLnNldCh0aGlzLnN0b3JhZ2VDaGFubmVsLCB0YXNrcyk7XG5cbiAgICByZXR1cm4gbmV3VGFzay5faWQ7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIGNoYW5uZWwgc3RvcmUuXG4gICAqXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICogICBUaGUgdmFsdWUuIFRoaXMgYW5ub3RhdGlvbiBjYW4gYmUgdXNlZCBmb3IgdHlwZSBoaW50aW5nIHB1cnBvc2VzLlxuICAgKi9cbiAgYXN5bmMgdXBkYXRlKGlkOiBzdHJpbmcsIHVwZGF0ZTogeyBbcHJvcGVydHk6IHN0cmluZ106IGFueSB9KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgZGF0YTogYW55W10gPSBhd2FpdCB0aGlzLmFsbCgpO1xuICAgIGNvbnN0IGluZGV4OiBudW1iZXIgPSBkYXRhLmZpbmRJbmRleCh0ID0+IHQuX2lkID09PSBpZCk7XG5cbiAgICAvLyBpZiBpbmRleCBub3QgZm91bmQsIHJldHVybiBmYWxzZVxuICAgIGlmIChpbmRleCA8IDApIHJldHVybiBmYWxzZTtcblxuICAgIC8vIG1lcmdlIGV4aXN0aW5nIG9iamVjdCB3aXRoIGdpdmVuIHVwZGF0ZSBvYmplY3RcbiAgICBkYXRhW2luZGV4XSA9IE9iamVjdC5hc3NpZ24oe30sIGRhdGFbaW5kZXhdLCB1cGRhdGUpO1xuXG4gICAgLy8gc2F2ZSB0byB0aGUgc3RvcmFnZSBhcyBzdHJpbmdcbiAgICBhd2FpdCB0aGlzLnN0b3JhZ2Uuc2V0KHRoaXMuc3RvcmFnZUNoYW5uZWwsIGRhdGEpO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIHRhc2sgZnJvbSBzdG9yYWdlXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gaWRcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGRlbGV0ZShpZDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgZGF0YTogYW55W10gPSBhd2FpdCB0aGlzLmFsbCgpO1xuICAgIGNvbnN0IGluZGV4OiBudW1iZXIgPSBkYXRhLmZpbmRJbmRleChkID0+IGQuX2lkID09PSBpZCk7XG5cbiAgICBpZiAoaW5kZXggPCAwKSByZXR1cm4gZmFsc2U7XG5cbiAgICBkZWxldGUgZGF0YVtpbmRleF07XG5cbiAgICBhd2FpdCB0aGlzLnN0b3JhZ2Uuc2V0KHRoaXMuc3RvcmFnZUNoYW5uZWwsIGRhdGEuZmlsdGVyKGQgPT4gZCkpO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCB0YXNrc1xuICAgKlxuICAgKiBAcmV0dXJuIHtBbnlbXX1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGFsbCgpOiBQcm9taXNlPElUYXNrW10+IHtcbiAgICBjb25zdCBpdGVtcyA9IGF3YWl0IHRoaXMuc3RvcmFnZS5nZXQodGhpcy5zdG9yYWdlQ2hhbm5lbCk7XG4gICAgcmV0dXJuIGl0ZW1zO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIHVuaXF1ZSBpZFxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBnZW5lcmF0ZUlkKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICgoMSArIE1hdGgucmFuZG9tKCkpICogMHgxMDAwMCkudG9TdHJpbmcoMTYpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBzb21lIG5lY2Vzc2FyeSBwcm9wZXJ0aWVzXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gaWRcbiAgICogQHJldHVybiB7SVRhc2t9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBwcmVwYXJlVGFzayh0YXNrOiBJVGFzayk6IElUYXNrIHtcbiAgICBjb25zdCBuZXdUYXNrID0geyAuLi50YXNrIH07XG4gICAgbmV3VGFzay5jcmVhdGVkQXQgPSBEYXRlLm5vdygpO1xuICAgIG5ld1Rhc2suX2lkID0gdGhpcy5nZW5lcmF0ZUlkKCk7XG4gICAgcmV0dXJuIG5ld1Rhc2s7XG4gIH1cblxuICAvKipcbiAgICogQWRkIHNvbWUgbmVjZXNzYXJ5IHByb3BlcnRpZXNcbiAgICpcbiAgICogQHBhcmFtICB7SVRhc2tbXX0gdGFza3NcbiAgICogQHJldHVybiB7RnVuY3Rpb259XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICByZWR1Y2VUYXNrcyh0YXNrczogSVRhc2tbXSkge1xuICAgIGNvbnN0IHJlZHVjZUZ1bmMgPSAocmVzdWx0OiBJVGFza1tdLCBrZXk6IGFueSk6IElUYXNrW10gPT4ge1xuICAgICAgaWYgKHRoaXMuY29uZmlnLmdldCgncHJpbmNpcGxlJykgPT09ICdsaWZvJykge1xuICAgICAgICByZXR1cm4gcmVzdWx0LmNvbmNhdCh0YXNrc1trZXldLnNvcnQobGlmbykpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdC5jb25jYXQodGFza3Nba2V5XS5zb3J0KGZpZm8pKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHJlZHVjZUZ1bmMuYmluZCh0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYXNrIGxpbWl0IGNoZWNrZXJcbiAgICpcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGlzRXhjZWVkZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgbGltaXQ6IG51bWJlciA9IHRoaXMuY29uZmlnLmdldCgnbGltaXQnKTtcbiAgICBjb25zdCB0YXNrczogSVRhc2tbXSA9IChhd2FpdCB0aGlzLmFsbCgpKS5maWx0ZXIoZXhjbHVkZVNwZWNpZmljVGFza3MpO1xuICAgIHJldHVybiAhKGxpbWl0ID09PSAtMSB8fCBsaW1pdCA+IHRhc2tzLmxlbmd0aCk7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXIgdGFza3Mgd2l0aCBnaXZlbiBjaGFubmVsIG5hbWVcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBjaGFubmVsXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBjbGVhcihjaGFubmVsOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLnN0b3JhZ2UuY2xlYXIoY2hhbm5lbCk7XG4gIH1cbn1cbiIsIi8qIEBmbG93ICovXG5pbXBvcnQgb2JqIGZyb20gJ29iamVjdC1wYXRoJztcbmltcG9ydCBkZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5pbXBvcnQgdHlwZSBJVGFzayBmcm9tICcuLi9pbnRlcmZhY2VzL3Rhc2snO1xuaW1wb3J0IGxvZ0V2ZW50cyBmcm9tICcuL2VudW0vbG9nLmV2ZW50cyc7XG5cbi8qIGVzbGludCBjb21tYS1kYW5nbGU6IFtcImVycm9yXCIsIFwibmV2ZXJcIl0gKi9cbi8qIGdsb2JhbCBsb2NhbFN0b3JhZ2U6dHJ1ZSAqL1xuXG4vKipcbiAqIENsb25lIGNsYXNzXG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUoZnVuYzogT2JqZWN0KSB7XG4gIGNvbnN0IG5ld0NsYXNzID0gT2JqZWN0LmNyZWF0ZShcbiAgICBPYmplY3QuZ2V0UHJvdG90eXBlT2YoZnVuYyksXG4gICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoZnVuYykucmVkdWNlKChwcm9wcywgbmFtZSkgPT4ge1xuICAgICAgY29uc3QgbmV3UHJvcHMgPSB7IC4uLnByb3BzIH07XG4gICAgICBuZXdQcm9wc1tuYW1lXSA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZnVuYywgbmFtZSk7XG4gICAgICByZXR1cm4gbmV3UHJvcHM7XG4gICAgfSwge30pLFxuICApO1xuXG4gIGlmICghT2JqZWN0LmlzRXh0ZW5zaWJsZShmdW5jKSkge1xuICAgIE9iamVjdC5wcmV2ZW50RXh0ZW5zaW9ucyhuZXdDbGFzcyk7XG4gIH1cbiAgaWYgKE9iamVjdC5pc1NlYWxlZChmdW5jKSkge1xuICAgIE9iamVjdC5zZWFsKG5ld0NsYXNzKTtcbiAgfVxuICBpZiAoT2JqZWN0LmlzRnJvemVuKGZ1bmMpKSB7XG4gICAgT2JqZWN0LmZyZWV6ZShuZXdDbGFzcyk7XG4gIH1cblxuICByZXR1cm4gbmV3Q2xhc3M7XG59XG5cbi8qKlxuICogQ2hlY2sgcHJvcGVydHkgaW4gb2JqZWN0XG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc1Byb3BlcnR5KGZ1bmM6IEZ1bmN0aW9uLCBuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChmdW5jLCBuYW1lKTtcbn1cblxuLyoqXG4gKiBDaGVjayBtZXRob2QgaW4gaW5pdGlhdGVkIGNsYXNzXG4gKlxuICogQHBhcmFtICB7Q2xhc3N9IGluc3RhbmNlXG4gKiBAcGFyYW0gIHtTdHJpbmd9IG1ldGhvZFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gaGFzTWV0aG9kKGluc3RhbmNlOiBhbnksIG1ldGhvZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBpbnN0YW5jZSBpbnN0YW5jZW9mIE9iamVjdCAmJiBtZXRob2QgaW4gaW5zdGFuY2U7XG59XG5cbi8qKlxuICogQ2hlY2sgZnVuY3Rpb24gdHlwZVxuICpcbiAqIEBwYXJhbSAge0Z1bmN0aW9ufSBmdW5jXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0Z1bmN0aW9uKGZ1bmM6IEZ1bmN0aW9uKTogYm9vbGVhbiB7XG4gIHJldHVybiBmdW5jIGluc3RhbmNlb2YgRnVuY3Rpb247XG59XG5cbi8qKlxuICogUmVtb3ZlIHNvbWUgdGFza3MgYnkgc29tZSBjb25kaXRpb25zXG4gKlxuICogQHBhcmFtICB7RnVuY3Rpb259IGZ1bmNcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzKHRhc2s6IElUYXNrKTogYm9vbGVhbiB7XG4gIGNvbnN0IGNvbmRpdGlvbnMgPSBBcnJheS5pc0FycmF5KHRoaXMpID8gdGhpcyA6IFsnZnJlZXplZCcsICdsb2NrZWQnXTtcbiAgY29uc3QgcmVzdWx0cyA9IFtdO1xuXG4gIGNvbmRpdGlvbnMuZm9yRWFjaCgoYykgPT4ge1xuICAgIHJlc3VsdHMucHVzaChoYXNQcm9wZXJ0eSh0YXNrLCBjKSA9PT0gZmFsc2UgfHwgdGFza1tjXSA9PT0gZmFsc2UpO1xuICB9KTtcblxuICByZXR1cm4gIShyZXN1bHRzLmluZGV4T2YoZmFsc2UpID4gLTEpO1xufVxuXG4vKipcbiAqIENsZWFyIHRhc2tzIGJ5IGl0J3MgdGFnc1xuICpcbiAqIEBwYXJhbSAge0lUYXNrfSB0YXNrXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1dGlsQ2xlYXJCeVRhZyh0YXNrOiBJVGFzayk6IGJvb2xlYW4ge1xuICBpZiAoIWV4Y2x1ZGVTcGVjaWZpY1Rhc2tzLmNhbGwoWydsb2NrZWQnXSwgdGFzaykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRhc2sudGFnID09PSB0aGlzO1xufVxuXG4vKipcbiAqIFNvcnQgYnkgZmlmb1xuICpcbiAqIEBwYXJhbSAge0lUYXNrfSBhXG4gKiBAcGFyYW0gIHtJVGFza30gYlxuICogQHJldHVybiB7QW55fVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaWZvKGE6IElUYXNrLCBiOiBJVGFzayk6IGFueSB7XG4gIHJldHVybiBhLmNyZWF0ZWRBdCAtIGIuY3JlYXRlZEF0O1xufVxuXG4vKipcbiAqIFNvcnQgYnkgbGlmb1xuICpcbiAqIEBwYXJhbSAge0lUYXNrfSBhXG4gKiBAcGFyYW0gIHtJVGFza30gYlxuICogQHJldHVybiB7QW55fVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsaWZvKGE6IElUYXNrLCBiOiBJVGFzayk6IGFueSB7XG4gIHJldHVybiBiLmNyZWF0ZWRBdCAtIGEuY3JlYXRlZEF0O1xufVxuXG4vKipcbiAqIExvZyBoZWxwZXJcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICogQHBhcmFtICB7U3RyaW5nfSBkYXRhXG4gKiBAcGFyYW0gIHtCb29sZWFufSBjb25kaXRpb25cbiAqIEByZXR1cm4ge3ZvaWR9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvZyhrZXk6IHN0cmluZywgZGF0YTogc3RyaW5nID0gJycpOiB2b2lkIHtcbiAgaWYgKHRoaXMgIT09IHRydWUpIHtcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnZGVidWcnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBkZWJ1ZyBtb2RlIG9uIGFsd2F5c1xuICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZGVidWcnLCAnd29ya2VyOionKTtcblxuICAvLyBnZXQgbmV3IGRlYnVnIGZ1bmN0aW9uIGluc3RhbmNlXG4gIGNvbnN0IGxvZ2dlciA9IGRlYnVnKGB3b3JrZXI6JHtkYXRhfSAtPmApO1xuXG4gIC8vIHRoZSBvdXRwdXQgcHVzaCB0byBjb25zb2xlXG4gIGxvZ2dlcihvYmouZ2V0KGxvZ0V2ZW50cywga2V5KSk7XG59XG4iXX0=
