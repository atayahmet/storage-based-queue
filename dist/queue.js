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

},{"./debug":3,"_process":8}],3:[function(require,module,exports){

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

},{"ms":6}],4:[function(require,module,exports){

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
},{"to-function":9}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function listen(evts, func, toAdd) {
	var fn = window[(toAdd ? 'add' : 'remove') + 'EventListener'];
	evts.split(' ').forEach(function (ev) {
		fn(ev, func);
	});
}

function check() {
	return Promise.resolve(!navigator.onLine);
}

function watch(cb) {
	var fn = function (_) { return check().then(cb); };
	var listener = listen.bind(null, 'online offline', fn);
	listener(true);
	return function (_) {
		listener(false);
	}
}

exports.check = check;
exports.watch = watch;

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){

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

},{"component-props":1,"props":1}],10:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.default = {
  storage: 'localstorage',
  prefix: 'sq_jobs',
  timeout: 1000,
  limit: -1,
  principle: 'fifo',
  network: false,
  debug: true };

},{}],11:[function(require,module,exports){
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

},{"./config.data":10}],12:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var


Container = function () {

  function Container() {_classCallCheck(this, Container);this.

    _container = {};}_createClass(Container, [{ key: 'has',

    /**
                                                                                                                     * Check item in container
                                                                                                                     *
                                                                                                                     * @param  {String} id
                                                                                                                     * @return {Boolean}
                                                                                                                     *
                                                                                                                     * @api public
                                                                                                                     */value: function has(
    id) {
      return Object.prototype.hasOwnProperty.call(this._container, id);
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
      return this._container[id];
    }

    /**
         * Get all items from container
         *
         * @return {Object}
         *
         * @api public
         */ }, { key: 'all', value: function all()
    {
      return this._container;
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
      this._container[id] = value;
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
      return delete this._container[id];
    }

    /**
         * Remove all items from container
         *
         * @return {void}
         *
         * @api public
         */ }, { key: 'removeAll', value: function removeAll()
    {
      this._container = {};
    } }]);return Container;}();exports.default = Container;

},{}],13:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.default = {
  queue: {
    'created': 'New task created.',
    'next': 'Next task processing.',
    'starting': 'Queue listener starting.',
    'stopping': 'Queue listener stopping.',
    'stopped': 'Queue listener stopped.',
    'empty': 'channel is empty...',
    'not-found': 'job not found',
    'offline': 'Disconnected',
    'online': 'Connected' },

  event: {
    'created': 'New event created',
    'fired': 'Event fired.',
    'wildcard-fired': 'Wildcard event fired.' } };

},{}],14:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var Event = function () {





  function Event() {_classCallCheck(this, Event);this.store = {};this.verifierPattern = /^[a-z0-9\-\_]+\:before$|after$|retry$|\*$/;this.wildcards = ['*', 'error'];this.emptyFunc = function () {};
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
      return key.match(/(.*)\:.*/)[1];
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
      return key.match(/^[a-z0-9\-\_]+\:(.*)/)[1];
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

},{}],15:[function(require,module,exports){
'use strict';var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};Object.defineProperty(exports, "__esModule", { value: true });var _slicedToArray = function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"]) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}();var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {return typeof obj === "undefined" ? "undefined" : _typeof2(obj);} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);};exports.
















getTasksWithoutFreezed = getTasksWithoutFreezed;exports.














db = db;exports.














logProxy = logProxy;exports.


















saveTask = saveTask;exports.












removeTask = removeTask;exports.













dispatchEvents = dispatchEvents;exports.





















checkPriority = checkPriority;exports.















createTimeout = createTimeout;exports.











































loopHandler = loopHandler;exports.
































lockTask = lockTask;exports.











stopQueue = stopQueue;exports.


















fireJobInlineEvent = fireJobInlineEvent;exports.



















successJobHandler = successJobHandler;exports.


























failedJobHandler = failedJobHandler;exports.




















dispatchProcess = dispatchProcess;exports.


















successProcess = successProcess;exports.













statusOff = statusOff;exports.













retryProcess = retryProcess;exports.





















canMultiple = canMultiple;exports.















updateRetry = updateRetry;exports.


























registerJobs = registerJobs;exports.






















checkNetwork = checkNetwork;exports.













removeNetworkEvent = removeNetworkEvent;exports.












createNetworkEvent = createNetworkEvent;exports.












queueCtrl = queueCtrl;var _isOffline = require('is-offline');var _queue = require('./queue');var _queue2 = _interopRequireDefault(_queue);var _utils = require('./utils');var _storageCapsule = require('./storage-capsule');var _storageCapsule2 = _interopRequireDefault(_storageCapsule);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {arr2[i] = arr[i];}return arr2;} else {return Array.from(arr);}} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Get unfreezed tasks by the filter function
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * @return {ITask}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */function getTasksWithoutFreezed() {return db.call(this).all().filter(_utils.excludeSpecificTasks.bind(["freezed"]));} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * Shortens function the db belongsto current channel
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @return {StorageCapsule}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              */function db() {return this.storage.channel(this.currentChannel);} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * Log proxy helper
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * @return {void}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * @param {string} key
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * @param {string} data
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * @param {boolean} cond
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   */function logProxy(key, data) {var cond = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;_utils.log.call.apply(_utils.log, [// debug mode status
                                                             this.config.get('debug')].concat(Array.prototype.slice.call(arguments)));} /**
                                                                                                                                         * New task save helper
                                                                                                                                         * Context: Queue
                                                                                                                                         *
                                                                                                                                         * @param {ITask} task
                                                                                                                                         * @return {string|boolean}
                                                                                                                                         *
                                                                                                                                         * @api private
                                                                                                                                         */function saveTask(task) {return db.call(this).save(checkPriority(task));} /**
                                                                                                                                                                                                                      * Task remove helper
                                                                                                                                                                                                                      * Context: Queue
                                                                                                                                                                                                                      *
                                                                                                                                                                                                                      * @param {string} id
                                                                                                                                                                                                                      * @return {boolean}
                                                                                                                                                                                                                      *
                                                                                                                                                                                                                      * @api private
                                                                                                                                                                                                                      */function removeTask(id) {return db.call(this).delete(id);} /**
                                                                                                                                                                                                                                                                                    * Events dispatcher helper
                                                                                                                                                                                                                                                                                    * Context: Queue
                                                                                                                                                                                                                                                                                    *
                                                                                                                                                                                                                                                                                    * @param {ITask} task
                                                                                                                                                                                                                                                                                    * @param {string} type
                                                                                                                                                                                                                                                                                    * @return {void}
                                                                                                                                                                                                                                                                                    *
                                                                                                                                                                                                                                                                                    * @api private
                                                                                                                                                                                                                                                                                    */function dispatchEvents(task, type) {if (!("tag" in task)) return false;var events = [[task.tag + ':' + type, 'fired'], [task.tag + ':*', 'wildcard-fired']];var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {for (var _iterator = events[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var event = _step.value;this.event.emit(event[0], task);logProxy.call(this, 'event.' + event[1], event[0]);}} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator.return) {_iterator.return();}} finally {if (_didIteratorError) {throw _iteratorError;}}}} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    * Task priority controller helper
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    * @return {ITask}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    * @param {ITask} task
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    */function checkPriority(task) {task.priority = task.priority || 0;if (isNaN(task.priority)) task.priority = 0;return task;} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * Timeout creator helper
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * @return {number}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  */function createTimeout() {// if running any job, stop it
                                                             // the purpose here is to prevent cocurrent operation in same channel
                                                             clearTimeout(this.currentTimeout);var task = db.call(this).fetch().shift();if (task === undefined) {logProxy.call(this, 'queue.empty', this.currentChannel);stopQueue.call(this);return 1;}if (!this.container.has(task.handler)) {logProxy.call(this, 'queue.not-found', task.handler);failedJobHandler.call(this, task).call();return 1;}var job = this.container.get(task.handler);var jobInstance = new job.handler(); // get always last updated config value
                                                             var timeout = jobInstance.timeout || this.config.get("timeout");var handler = loopHandler.call(this, task, job, jobInstance).bind(this); // create new timeout for process a job in queue
                                                             // binding loopHandler function to setTimeout
                                                             // then return the timeout instance
                                                             return this.currentTimeout = setTimeout(handler, timeout);} /**
                                                                                                                          * Job handler helper
                                                                                                                          * Context: Queue
                                                                                                                          *
                                                                                                                          * @param {ITask} task
                                                                                                                          * @param {IJob} job
                                                                                                                          * @param {IJobInstance} jobInstance
                                                                                                                          * @return {Function}
                                                                                                                          *
                                                                                                                          * @api private
                                                                                                                          */function loopHandler(task, job, jobInstance) {var _this = this;return function () {var _jobInstance$handle;var self = _this; // lock the current task for prevent race condition
                                                                                                                          lockTask.call(self, task); // fire job before event
                                                                                                                          fireJobInlineEvent.call(_this, "before", jobInstance, task.args); // dispacth custom before event
                                                                                                                          dispatchEvents.call(_this, task, "before"); // preparing worker dependencies
                                                                                                                          var dependencies = Object.values(job.deps || {}); // Task runner promise
                                                                                                                          (_jobInstance$handle = jobInstance.handle).call.apply(_jobInstance$handle, [jobInstance, task.args].concat(_toConsumableArray(dependencies))).then(successJobHandler.call(self, task, jobInstance).bind(self)).catch(failedJobHandler.call(self, task, jobInstance).bind(self));};} /**
                                                                                                                                                                                                                                                                                                                                                                                                               * Helper of the lock task of the current job
                                                                                                                                                                                                                                                                                                                                                                                                               * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                                               * @param {ITask} task
                                                                                                                                                                                                                                                                                                                                                                                                               * @return {boolean}
                                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                                               * @api private
                                                                                                                                                                                                                                                                                                                                                                                                               */function lockTask(task) {return db.call(this).update(task._id, { locked: true });} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Queue stopper helper
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * @return {void}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */function stopQueue() {this.stop();clearTimeout(this.currentTimeout);logProxy.call(this, 'queue.stopped', 'stop');} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * Class event luancher helper
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * @param {string} name
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * @param {IJobInstance} job
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * @param {any} args
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * @return {boolean|void}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           */function fireJobInlineEvent(name, job, args) {if (!(0, _utils.hasMethod)(job, name)) return false;if (name == "before" && (0, _utils.isFunction)(job.before)) {job.before.call(job, args);} else if (name == "after" && (0, _utils.isFunction)(job.after)) {job.after.call(job, args);}} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * Succeed job handler
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * @param {ITask} task
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * @param {IJobInstance} job
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * @return {Function}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       */function successJobHandler(task, job) {var self = this;return function (result) {// dispatch job process after runs a task but only non error jobs
                                                                                                                          dispatchProcess.call(self, result, task, job); // fire job after event
                                                                                                                          fireJobInlineEvent.call(self, "after", job, task.args); // dispacth custom after event
                                                                                                                          dispatchEvents.call(self, task, "after"); // try next queue job
                                                                                                                          self.next();};} /**
                                                                                                                                           * Failed job handler
                                                                                                                                           * Context: Queue
                                                                                                                                           *
                                                                                                                                           * @param {ITask} task
                                                                                                                                           * @return {ITask} job
                                                                                                                                           * @return {Function}
                                                                                                                                           *
                                                                                                                                           * @api private
                                                                                                                                           */function failedJobHandler(task, job) {var _this2 = this;return function (result) {removeTask.call(_this2, task._id);_this2.event.emit("error", task);_this2.next();};} /**
                                                                                                                                                                                                                                                                                                                     * Dispatch non-error job process after runs
                                                                                                                                                                                                                                                                                                                     * Context: Queue
                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                     * @param {boolean} result
                                                                                                                                                                                                                                                                                                                     * @param {ITask} task
                                                                                                                                                                                                                                                                                                                     * @param {IJobInstance} job
                                                                                                                                                                                                                                                                                                                     * @return {void}
                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                     * @api private
                                                                                                                                                                                                                                                                                                                     */function dispatchProcess(result, task, job) {var self = this;if (result) {successProcess.call(self, task, job);} else {retryProcess.call(self, task, job);}} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Process handler of succeeded job
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * @param {ITask} task
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * @param {IJobInstance} job
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * @return {void}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */function successProcess(task, job) {removeTask.call(this, task._id);} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * Process handler of succeeded job
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @param {ITask} task
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @param {IJobInstance} job
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @return {void}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              */function statusOff() {this.running = false;} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * Process handler of retried job
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @param {ITask} task
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @param {IJobInstance} job
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @return {boolean}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              */function retryProcess(task, job) {// dispacth custom retry event
                                                             dispatchEvents.call(this, task, "retry"); // update retry value
                                                             var updateTask = updateRetry.call(this, task, job); // delete lock property for next process
                                                             updateTask.locked = false;return db.call(this).update(task._id, updateTask);} /**
                                                                                                                                            * Checks whether a task is replicable or not
                                                                                                                                            * Context: Queue
                                                                                                                                            *
                                                                                                                                            * @param {ITask} task
                                                                                                                                            * @return {boolean}
                                                                                                                                            *
                                                                                                                                            * @api private
                                                                                                                                            */function canMultiple(task) {if ((typeof task === 'undefined' ? 'undefined' : _typeof(task)) !== "object" || task.unique !== true) return true;return this.hasByTag(task.tag) < 1;} /**
                                                                                                                                                                                                                                                                                                                                  * Update task's retry value
                                                                                                                                                                                                                                                                                                                                  * Context: Queue
                                                                                                                                                                                                                                                                                                                                  *
                                                                                                                                                                                                                                                                                                                                  * @param {ITask} task
                                                                                                                                                                                                                                                                                                                                  * @param {IJobInstance} job
                                                                                                                                                                                                                                                                                                                                  * @return {ITask}
                                                                                                                                                                                                                                                                                                                                  *
                                                                                                                                                                                                                                                                                                                                  * @api private
                                                                                                                                                                                                                                                                                                                                  */function updateRetry(task, job) {if (!("retry" in job)) job.retry = 1;if (!("tried" in task)) {task.tried = 0;task.retry = job.retry;}++task.tried;if (task.tried >= job.retry) {task.freezed = true;}return task;} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * Job handler class register
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * @param {ITask} task
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * @param {IJobInstance} job
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * @return {void}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         */function registerJobs() {if (_queue2.default.isRegistered) return;var jobs = _queue2.default.jobs || [];var _iteratorNormalCompletion2 = true;var _didIteratorError2 = false;var _iteratorError2 = undefined;try {for (var _iterator2 = jobs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {var job = _step2.value;var funcStr = job.handler.toString();var _funcStr$match = funcStr.match(/function\s([a-zA-Z_]+).*?/),_funcStr$match2 = _slicedToArray(_funcStr$match, 2),strFunction = _funcStr$match2[0],name = _funcStr$match2[1];if (name) this.container.bind(name, job);}} catch (err) {_didIteratorError2 = true;_iteratorError2 = err;} finally {try {if (!_iteratorNormalCompletion2 && _iterator2.return) {_iterator2.return();}} finally {if (_didIteratorError2) {throw _iteratorError2;}}}_queue2.default.isRegistered = true;} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * Check network and return queue avaibility status
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * @param {Boolean} status
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * @return {Boolean}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               */function checkNetwork() {var status = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : navigator.onLine;var network = this.config.get('network');return !status && network ? false : true;} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * Remove network observer event
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * @param {Boolean} status
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * @return {void}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 */function removeNetworkEvent() {if (typeof this.networkObserver === 'function') this.networkObserver();} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * if network status true, create new network event
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @param {Boolean} network
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @return {void}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */function createNetworkEvent(network) {if (network) this.networkObserver = (0, _isOffline.watch)(queueCtrl.bind(this));} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * Queue controller via boolean value
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * Context: Queue
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * @param {Boolean} status
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * @return {void}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       */function queueCtrl(status) {var channel = this.channels[this.currentChannel];if (status) {channel.forceStop();logProxy.call(this, 'queue.offline', 'offline');} else {setTimeout(channel.start.bind(this), 2000);logProxy.call(this, 'queue.online', 'online');}}

},{"./queue":17,"./storage-capsule":18,"./utils":20,"is-offline":5}],16:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _queue = require('./queue');var _queue2 = _interopRequireDefault(_queue);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

window.Queue = _queue2.default;exports.default = _queue2.default;

},{"./queue":17}],17:[function(require,module,exports){
"use strict";Object.defineProperty(exports, "__esModule", { value: true });




var _localstorage = require("./storage/localstorage");var _localstorage2 = _interopRequireDefault(_localstorage);
var _container = require("./container");var _container2 = _interopRequireDefault(_container);
var _storageCapsule = require("./storage-capsule");var _storageCapsule2 = _interopRequireDefault(_storageCapsule);
var _config = require("./config");var _config2 = _interopRequireDefault(_config);
var _event2 = require("./event");var _event3 = _interopRequireDefault(_event2);

var _utils = require("./utils");








var _helpers = require("./helpers");function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}


















var Queue = function () {
  "use strict";

  Queue.FIFO = "fifo";
  Queue.LIFO = "lifo";

  function Queue(config) {
    _constructor.call(this, config);
  }

  function _constructor(config) {
    this.channels = {};
    this.config = new _config2.default(config);
    this.storage = new _storageCapsule2.default(
    this.config,
    new _localstorage2.default(this.config));


    // Default job timeout
    this.timeout = this.config.get("timeout");

    var network = this.config.get('network');

    // network observer
    _helpers.createNetworkEvent.call(this, network);
  }

  Queue.prototype.currentChannel;
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
  Queue.prototype.add = function (task) {
    if (!_helpers.canMultiple.call(this, task)) return false;

    var id = _helpers.saveTask.call(this, task);

    if (id && this.stopped && this.running === true) {
      this.start();
    }

    // pass activity to the log service.
    _helpers.logProxy.call(this, 'queue.created', task.handler);

    return id;
  };

  /**
         * Process next job
         *
         * @return {void}
         *
         * @api public
         */
  Queue.prototype.next = function () {
    if (this.stopped) {
      _helpers.statusOff.call(this);
      return _helpers.stopQueue.call(this);
    }

    _helpers.logProxy.call(this, 'queue.next', 'next');

    this.start();
  };

  /**
         * Start queue listener
         *
         * @return {Boolean} job
         *
         * @api public
         */
  Queue.prototype.start = function () {
    if (!_helpers.checkNetwork.call(this)) return false;

    // Stop the queue for restart
    this.stopped = false;

    // Register tasks, if not registered
    _helpers.registerJobs.call(this);

    _helpers.logProxy.call(this, 'queue.starting', 'start');

    // Create a timeout for start queue
    this.running = _helpers.createTimeout.call(this) > 0;

    return this.running;
  };

  /**
         * Stop queue listener after end of current task
         *
         * @return {Void}
         *
         * @api public
         */
  Queue.prototype.stop = function () {
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
  Queue.prototype.forceStop = function () {
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
  Queue.prototype.create = function (channel) {
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
  Queue.prototype.channel = function (name) {
    if (!this.channels[name]) {
      throw new Error("Channel of \"" + name + "\" not found");
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
  Queue.prototype.isEmpty = function () {
    return this.count() < 1;
  };

  /**
         * Get task count
         *
         * @return {Number}
         *
         * @api public
         */
  Queue.prototype.count = function () {
    return _helpers.getTasksWithoutFreezed.call(this).length;
  };

  /**
         * Get task count by tag
         *
         * @param  {String} tag
         * @return {Array<ITask>}
         *
         * @api public
         */
  Queue.prototype.countByTag = function (tag) {
    return _helpers.getTasksWithoutFreezed.call(this).filter(function (t) {return t.tag === tag;}).length;
  };

  /**
         * Remove all tasks from channel
         *
         * @return {Boolean}
         *
         * @api public
         */
  Queue.prototype.clear = function () {
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
  Queue.prototype.clearByTag = function (tag) {var _this = this;
    _helpers.db.
    call(this).
    all().
    filter(_utils.utilClearByTag.bind(tag)).
    forEach(function (t) {return _helpers.db.call(_this).delete(t._id);});
  };

  /**
         * Check a task whether exists by job id
         *
         * @param  {String} tag
         * @return {Boolean}
         *
         * @api public
         */
  Queue.prototype.has = function (id) {
    return _helpers.getTasksWithoutFreezed.call(this).findIndex(function (t) {return t._id === id;}) > -1;
  };

  /**
         * Check a task whether exists by tag
         *
         * @param  {String} tag
         * @return {Boolean}
         *
         * @api public
         */
  Queue.prototype.hasByTag = function (tag) {
    return _helpers.getTasksWithoutFreezed.call(this).findIndex(function (t) {return t.tag === tag;}) > -1;
  };

  /**
         * Set config timeout value
         *
         * @param  {Number} val
         * @return {Void}
         *
         * @api public
         */
  Queue.prototype.setTimeout = function (val) {
    this.timeout = val;
    this.config.set("timeout", val);
  };

  /**
         * Set config limit value
         *
         * @param  {Number} val
         * @return {Void}
         *
         * @api public
         */
  Queue.prototype.setLimit = function (val) {
    this.config.set("limit", val);
  };

  /**
         * Set config prefix value
         *
         * @param  {String} val
         * @return {Void}
         *
         * @api public
         */
  Queue.prototype.setPrefix = function (val) {
    this.config.set("prefix", val);
  };

  /**
         * Set config priciple value
         *
         * @param  {String} val
         * @return {Void}
         *
         * @api public
         */
  Queue.prototype.setPrinciple = function (val) {
    this.config.set("principle", val);
  };

  /**
         * Set config debug value
         *
         * @param  {Boolean} val
         * @return {Void}
         *
         * @api public
         */
  Queue.prototype.setDebug = function (val) {
    this.config.set("debug", val);
  };

  /**
         * Set config network value
         *
         * @param  {Boolean} val
         * @return {Void}
         *
         * @api public
         */
  Queue.prototype.setNetwork = function (val) {
    this.config.set("network", val);

    // clear network event if it exists
    _helpers.removeNetworkEvent.call(this);

    // if value true, create new network event
    _helpers.createNetworkEvent.call(this, val);
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
  Queue.prototype.on = function (key, cb) {var _event;
    (_event = this.event).on.apply(_event, arguments);
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
  Queue.register = function (jobs) {
    if (!(jobs instanceof Array)) {
      throw new Error("Queue jobs should be objects within an array");
    }

    Queue.isRegistered = false;
    Queue.jobs = jobs;
  };

  return Queue;
}();exports.default =

Queue;

},{"./config":11,"./container":12,"./event":14,"./helpers":15,"./storage-capsule":18,"./storage/localstorage":19,"./utils":20}],18:[function(require,module,exports){
"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();

var _groupBy = require("group-by");var _groupBy2 = _interopRequireDefault(_groupBy);
var _localstorage = require("./storage/localstorage");var _localstorage2 = _interopRequireDefault(_localstorage);



var _config = require("./config");var _config2 = _interopRequireDefault(_config);
var _utils = require("./utils");function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var

StorageCapsule = function () {




  function StorageCapsule(config, storage) {_classCallCheck(this, StorageCapsule);
    this.storage = storage;
    this.config = config;
  }

  /**
       * Select a channel by channel name
       *
       * @param  {String} name
       * @return {StorageCapsule}
       *
       * @api public
       */_createClass(StorageCapsule, [{ key: "channel", value: function channel(
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
         */ }, { key: "fetch", value: function fetch()
    {
      var all = this.all().filter(_utils.excludeSpecificTasks);
      var tasks = (0, _groupBy2.default)(all, "priority");
      return Object.keys(tasks).
      map(function (key) {return parseInt(key);}).
      sort(function (a, b) {return b - a;}).
      reduce(this.reduceTasks(tasks), []);
    }

    /**
         * Save task to storage
         *
         * @param  {ITask} task
         * @return {String|Boolean}
         *
         * @api public
         */ }, { key: "save", value: function save(
    task) {
      // get all tasks current channel's
      var tasks = this.storage.get(this.storageChannel);

      // Check the channel limit.
      // If limit is exceeded, does not insert new task
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
    }

    /**
         * Update channel store.
         *
         * @return {string}
         *   The value. This annotation can be used for type hinting purposes.
         */ }, { key: "update", value: function update(
    id, _update) {
      var data = this.all();
      var index = data.findIndex(function (t) {return t._id == id;});

      if (index < 0) return false;

      // merge existing object with given update object
      data[index] = Object.assign({}, data[index], _update);

      // save to the storage as string
      this.storage.set(this.storageChannel, JSON.stringify(data));

      return true;
    }

    /**
         * Remove task from storage
         *
         * @param  {String} id
         * @return {Boolean}
         *
         * @api public
         */ }, { key: "delete", value: function _delete(
    id) {
      var data = this.all();
      var index = data.findIndex(function (d) {return d._id === id;});

      if (index < 0) return false;

      delete data[index];

      this.storage.set(
      this.storageChannel,
      JSON.stringify(data.filter(function (d) {return d;})));

      return true;
    }

    /**
         * Get all tasks
         *
         * @return {Any[]}
         *
         * @api public
         */ }, { key: "all", value: function all()
    {
      return this.storage.get(this.storageChannel);
    }

    /**
         * Generate unique id
         *
         * @return {String}
         *
         * @api public
         */ }, { key: "generateId", value: function generateId()
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
         */ }, { key: "prepareTask", value: function prepareTask(
    task) {
      task.createdAt = Date.now();
      task._id = this.generateId();
      return task;
    }

    /**
         * Add some necessary properties
         *
         * @param  {ITask[]} tasks
         * @return {Function}
         *
         * @api public
         */ }, { key: "reduceTasks", value: function reduceTasks(
    tasks) {var _this = this;
      var reduceFunc = function reduceFunc(result, key) {
        if (_this.config.get("principle") === "lifo") {
          return result.concat(tasks[key].sort(_utils.lifo));
        } else {
          return result.concat(tasks[key].sort(_utils.fifo));
        }
      };

      return reduceFunc.bind(this);
    }

    /**
         * Task limit checker
         *
         * @return {Boolean}
         *
         * @api public
         */ }, { key: "isExceeded", value: function isExceeded()
    {
      var limit = this.config.get("limit");
      var tasks = this.all().filter(_utils.excludeSpecificTasks);
      return !(limit === -1 || limit > tasks.length);
    }

    /**
         * Clear tasks with given channel name
         *
         * @param  {String} channel
         * @return {void}
         *
         * @api public
         */ }, { key: "clear", value: function clear(
    channel) {
      this.storage.clear(channel);
    } }]);return StorageCapsule;}();exports.default = StorageCapsule;

},{"./config":11,"./storage/localstorage":19,"./utils":20,"group-by":4}],19:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var





LocalStorage = function () {



  function LocalStorage(config) {_classCallCheck(this, LocalStorage);
    this.storage = localStorage;
    this.config = config;
  }

  /**
       * Take item from storage by key
       *
       * @param  {String} key
       * @return {ITask[]}
       *
       * @api public
       */_createClass(LocalStorage, [{ key: 'get', value: function get(
    key) {
      try {
        var name = this.storageName(key);
        return this.has(name) ? JSON.parse(this.storage.getItem(name)) : [];
      } catch (e) {
        return [];
      }
    }

    /**
         * Add item to local storage
         *
         * @param  {String} key
         * @param  {String} value
         * @return {void}
         *
         * @api public
         */ }, { key: 'set', value: function set(
    key, value) {
      this.storage.setItem(this.storageName(key), value);
    }

    /**
         * Item checker in local storage
         *
         * @param  {String} key
         * @return {Boolean}
         *
         * @api public
         */ }, { key: 'has', value: function has(
    key) {
      return key in this.storage;
    }

    /**
         * Remove item
         *
         * @param  {String} key
         * @return {void}
         *
         * @api public
         */ }, { key: 'clear', value: function clear(
    key) {
      this.storage.removeItem(this.storageName(key));
    }

    /**
         * Remove all items
         *
         * @return {void}
         *
         * @api public
         */ }, { key: 'clearAll', value: function clearAll()
    {
      this.storage.clear();
    }

    /**
         * Compose storage name by suffix
         *
         * @param  {String} suffix
         * @return {String}
         *
         * @api public
         */ }, { key: 'storageName', value: function storageName(
    suffix) {
      return this.getPrefix() + '_' + suffix;
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
    } }]);return LocalStorage;}();exports.default = LocalStorage;

},{}],20:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.













clone = clone;exports.





























hasProperty = hasProperty;exports.












hasMethod = hasMethod;exports.











isFunction = isFunction;exports.











excludeSpecificTasks = excludeSpecificTasks;exports.


















utilClearByTag = utilClearByTag;exports.















fifo = fifo;exports.












lifo = lifo;exports.













log = log;var _objectPath = require('object-path');var _objectPath2 = _interopRequireDefault(_objectPath);var _debug = require('debug');var _debug2 = _interopRequireDefault(_debug);var _log = require('./enum/log.events');var _log2 = _interopRequireDefault(_log);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                                                                                                                                                                                     * Clone class
                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                     * @param  {Object} obj
                                                                                                                                                                                                                                                                                                                                                                     * @return {Object}
                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                     * @api public
                                                                                                                                                                                                                                                                                                                                                                     */function clone(obj) {var newClass = Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyNames(obj).reduce(function (props, name) {props[name] = Object.getOwnPropertyDescriptor(obj, name);return props;}, {}));if (!Object.isExtensible(obj)) {Object.preventExtensions(newClass);}if (Object.isSealed(obj)) {Object.seal(newClass);}if (Object.isFrozen(obj)) {Object.freeze(newClass);}return newClass;} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * Check property in object
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * @param  {Object} obj
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * @return {Boolean}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * @api public
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               */function hasProperty(obj, name) {return Object.prototype.hasOwnProperty.call(obj, name);} /**
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               */function excludeSpecificTasks(task) {var conditions = Array.isArray(this) ? this : ['freezed', 'locked'];var results = [];var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {for (var _iterator = conditions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var c = _step.value;results.push(hasProperty(task, c) === false || task[c] === false);}} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator.return) {_iterator.return();}} finally {if (_didIteratorError) {throw _iteratorError;}}}return results.indexOf(false) > -1 ? false : true;} /**
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 */function log(key) {var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';var condition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;if (this !== true) {localStorage.removeItem('debug');return;} // debug mode on always
                                                           localStorage.setItem('debug', 'worker:*'); // get new debug function instance
                                                           var log = (0, _debug2.default)('worker:' + data + ' ->'); // the output push to console
                                                           log(_objectPath2.default.get(_log2.default, key));}

},{"./enum/log.events":13,"debug":2,"object-path":7}]},{},[16])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY29tcG9uZW50LXByb3BzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RlYnVnL3NyYy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2RlYnVnL3NyYy9kZWJ1Zy5qcyIsIm5vZGVfbW9kdWxlcy9ncm91cC1ieS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pcy1vZmZsaW5lL2Rpc3QvaXMtb2ZmbGluZS5qcyIsIm5vZGVfbW9kdWxlcy9tcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9vYmplY3QtcGF0aC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvdG8tZnVuY3Rpb24vaW5kZXguanMiLCJzcmMvY29uZmlnLmRhdGEuanMiLCJzcmMvY29uZmlnLmpzIiwic3JjL2NvbnRhaW5lci5qcyIsInNyYy9lbnVtL2xvZy5ldmVudHMuanMiLCJzcmMvZXZlbnQuanMiLCJzcmMvaGVscGVycy5qcyIsInNyYy9pbmRleC5qcyIsInNyYy9xdWV1ZS5qcyIsInNyYy9zdG9yYWdlLWNhcHN1bGUuanMiLCJzcmMvc3RvcmFnZS9sb2NhbHN0b3JhZ2UuanMiLCJzcmMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNuTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDak9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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REFTTyxTQUFBLEFBQVMsS0FBVCxBQUFjLEdBQWQsQUFBd0IsR0FBZSxDQUM1QyxPQUFPLEVBQUEsQUFBRSxZQUFZLEVBQXJCLEFBQXVCLEFBQ3hCLFUsRUFFRDs7Ozs7Ozs7O205REFVTyxTQUFBLEFBQVMsSUFBVCxBQUFhLFVBQWEsQUFBb0QsMkVBQXJDLEFBQXFDLE9BQWpDLEFBQWlDLGdGQUFaLEFBQVksS0FDbkYsSUFBSSxTQUFKLEFBQWEsTUFBTSxDQUNqQixhQUFBLEFBQWEsV0FBYixBQUF3QixTQUN4QixBQUNELE9BSmtGLEVBTW5GLEFBQ0E7d0VBQUEsQUFBYSxRQUFiLEFBQXFCLFNBUDhELEFBT25GLEFBQThCLFlBUHFELENBU25GLEFBQ0E7K0RBQU0sTUFBTSxpQ0FBQSxBQUFnQixPQVZ1RCxBQVVuRixRQUVBLEFBQ0E7K0RBQUkscUJBQUEsQUFBSSxtQkFBUixBQUFJLEFBQW1CLEFBQ3hCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogR2xvYmFsIE5hbWVzXG4gKi9cblxudmFyIGdsb2JhbHMgPSAvXFxiKEFycmF5fERhdGV8T2JqZWN0fE1hdGh8SlNPTilcXGIvZztcblxuLyoqXG4gKiBSZXR1cm4gaW1tZWRpYXRlIGlkZW50aWZpZXJzIHBhcnNlZCBmcm9tIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSBtYXAgZnVuY3Rpb24gb3IgcHJlZml4XG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdHIsIGZuKXtcbiAgdmFyIHAgPSB1bmlxdWUocHJvcHMoc3RyKSk7XG4gIGlmIChmbiAmJiAnc3RyaW5nJyA9PSB0eXBlb2YgZm4pIGZuID0gcHJlZml4ZWQoZm4pO1xuICBpZiAoZm4pIHJldHVybiBtYXAoc3RyLCBwLCBmbik7XG4gIHJldHVybiBwO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gaW1tZWRpYXRlIGlkZW50aWZpZXJzIGluIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcHJvcHMoc3RyKSB7XG4gIHJldHVybiBzdHJcbiAgICAucmVwbGFjZSgvXFwuXFx3K3xcXHcrICpcXCh8XCJbXlwiXSpcInwnW14nXSonfFxcLyhbXi9dKylcXC8vZywgJycpXG4gICAgLnJlcGxhY2UoZ2xvYmFscywgJycpXG4gICAgLm1hdGNoKC9bYS16QS1aX11cXHcqL2cpXG4gICAgfHwgW107XG59XG5cbi8qKlxuICogUmV0dXJuIGBzdHJgIHdpdGggYHByb3BzYCBtYXBwZWQgd2l0aCBgZm5gLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7QXJyYXl9IHByb3BzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbWFwKHN0ciwgcHJvcHMsIGZuKSB7XG4gIHZhciByZSA9IC9cXC5cXHcrfFxcdysgKlxcKHxcIlteXCJdKlwifCdbXiddKid8XFwvKFteL10rKVxcL3xbYS16QS1aX11cXHcqL2c7XG4gIHJldHVybiBzdHIucmVwbGFjZShyZSwgZnVuY3Rpb24oXyl7XG4gICAgaWYgKCcoJyA9PSBfW18ubGVuZ3RoIC0gMV0pIHJldHVybiBmbihfKTtcbiAgICBpZiAoIX5wcm9wcy5pbmRleE9mKF8pKSByZXR1cm4gXztcbiAgICByZXR1cm4gZm4oXyk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFJldHVybiB1bmlxdWUgYXJyYXkuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHVuaXF1ZShhcnIpIHtcbiAgdmFyIHJldCA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKH5yZXQuaW5kZXhPZihhcnJbaV0pKSBjb250aW51ZTtcbiAgICByZXQucHVzaChhcnJbaV0pO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn1cblxuLyoqXG4gKiBNYXAgd2l0aCBwcmVmaXggYHN0cmAuXG4gKi9cblxuZnVuY3Rpb24gcHJlZml4ZWQoc3RyKSB7XG4gIHJldHVybiBmdW5jdGlvbihfKXtcbiAgICByZXR1cm4gc3RyICsgXztcbiAgfTtcbn1cbiIsIi8qKlxuICogVGhpcyBpcyB0aGUgd2ViIGJyb3dzZXIgaW1wbGVtZW50YXRpb24gb2YgYGRlYnVnKClgLlxuICpcbiAqIEV4cG9zZSBgZGVidWcoKWAgYXMgdGhlIG1vZHVsZS5cbiAqL1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2RlYnVnJyk7XG5leHBvcnRzLmxvZyA9IGxvZztcbmV4cG9ydHMuZm9ybWF0QXJncyA9IGZvcm1hdEFyZ3M7XG5leHBvcnRzLnNhdmUgPSBzYXZlO1xuZXhwb3J0cy5sb2FkID0gbG9hZDtcbmV4cG9ydHMudXNlQ29sb3JzID0gdXNlQ29sb3JzO1xuZXhwb3J0cy5zdG9yYWdlID0gJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGNocm9tZVxuICAgICAgICAgICAgICAgJiYgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGNocm9tZS5zdG9yYWdlXG4gICAgICAgICAgICAgICAgICA/IGNocm9tZS5zdG9yYWdlLmxvY2FsXG4gICAgICAgICAgICAgICAgICA6IGxvY2Fsc3RvcmFnZSgpO1xuXG4vKipcbiAqIENvbG9ycy5cbiAqL1xuXG5leHBvcnRzLmNvbG9ycyA9IFtcbiAgJyMwMDAwQ0MnLCAnIzAwMDBGRicsICcjMDAzM0NDJywgJyMwMDMzRkYnLCAnIzAwNjZDQycsICcjMDA2NkZGJywgJyMwMDk5Q0MnLFxuICAnIzAwOTlGRicsICcjMDBDQzAwJywgJyMwMENDMzMnLCAnIzAwQ0M2NicsICcjMDBDQzk5JywgJyMwMENDQ0MnLCAnIzAwQ0NGRicsXG4gICcjMzMwMENDJywgJyMzMzAwRkYnLCAnIzMzMzNDQycsICcjMzMzM0ZGJywgJyMzMzY2Q0MnLCAnIzMzNjZGRicsICcjMzM5OUNDJyxcbiAgJyMzMzk5RkYnLCAnIzMzQ0MwMCcsICcjMzNDQzMzJywgJyMzM0NDNjYnLCAnIzMzQ0M5OScsICcjMzNDQ0NDJywgJyMzM0NDRkYnLFxuICAnIzY2MDBDQycsICcjNjYwMEZGJywgJyM2NjMzQ0MnLCAnIzY2MzNGRicsICcjNjZDQzAwJywgJyM2NkNDMzMnLCAnIzk5MDBDQycsXG4gICcjOTkwMEZGJywgJyM5OTMzQ0MnLCAnIzk5MzNGRicsICcjOTlDQzAwJywgJyM5OUNDMzMnLCAnI0NDMDAwMCcsICcjQ0MwMDMzJyxcbiAgJyNDQzAwNjYnLCAnI0NDMDA5OScsICcjQ0MwMENDJywgJyNDQzAwRkYnLCAnI0NDMzMwMCcsICcjQ0MzMzMzJywgJyNDQzMzNjYnLFxuICAnI0NDMzM5OScsICcjQ0MzM0NDJywgJyNDQzMzRkYnLCAnI0NDNjYwMCcsICcjQ0M2NjMzJywgJyNDQzk5MDAnLCAnI0NDOTkzMycsXG4gICcjQ0NDQzAwJywgJyNDQ0NDMzMnLCAnI0ZGMDAwMCcsICcjRkYwMDMzJywgJyNGRjAwNjYnLCAnI0ZGMDA5OScsICcjRkYwMENDJyxcbiAgJyNGRjAwRkYnLCAnI0ZGMzMwMCcsICcjRkYzMzMzJywgJyNGRjMzNjYnLCAnI0ZGMzM5OScsICcjRkYzM0NDJywgJyNGRjMzRkYnLFxuICAnI0ZGNjYwMCcsICcjRkY2NjMzJywgJyNGRjk5MDAnLCAnI0ZGOTkzMycsICcjRkZDQzAwJywgJyNGRkNDMzMnXG5dO1xuXG4vKipcbiAqIEN1cnJlbnRseSBvbmx5IFdlYktpdC1iYXNlZCBXZWIgSW5zcGVjdG9ycywgRmlyZWZveCA+PSB2MzEsXG4gKiBhbmQgdGhlIEZpcmVidWcgZXh0ZW5zaW9uIChhbnkgRmlyZWZveCB2ZXJzaW9uKSBhcmUga25vd25cbiAqIHRvIHN1cHBvcnQgXCIlY1wiIENTUyBjdXN0b21pemF0aW9ucy5cbiAqXG4gKiBUT0RPOiBhZGQgYSBgbG9jYWxTdG9yYWdlYCB2YXJpYWJsZSB0byBleHBsaWNpdGx5IGVuYWJsZS9kaXNhYmxlIGNvbG9yc1xuICovXG5cbmZ1bmN0aW9uIHVzZUNvbG9ycygpIHtcbiAgLy8gTkI6IEluIGFuIEVsZWN0cm9uIHByZWxvYWQgc2NyaXB0LCBkb2N1bWVudCB3aWxsIGJlIGRlZmluZWQgYnV0IG5vdCBmdWxseVxuICAvLyBpbml0aWFsaXplZC4gU2luY2Ugd2Uga25vdyB3ZSdyZSBpbiBDaHJvbWUsIHdlJ2xsIGp1c3QgZGV0ZWN0IHRoaXMgY2FzZVxuICAvLyBleHBsaWNpdGx5XG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cucHJvY2VzcyAmJiB3aW5kb3cucHJvY2Vzcy50eXBlID09PSAncmVuZGVyZXInKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBJbnRlcm5ldCBFeHBsb3JlciBhbmQgRWRnZSBkbyBub3Qgc3VwcG9ydCBjb2xvcnMuXG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IudXNlckFnZW50ICYmIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5tYXRjaCgvKGVkZ2V8dHJpZGVudClcXC8oXFxkKykvKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIGlzIHdlYmtpdD8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTY0NTk2MDYvMzc2NzczXG4gIC8vIGRvY3VtZW50IGlzIHVuZGVmaW5lZCBpbiByZWFjdC1uYXRpdmU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWFjdC1uYXRpdmUvcHVsbC8xNjMyXG4gIHJldHVybiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5XZWJraXRBcHBlYXJhbmNlKSB8fFxuICAgIC8vIGlzIGZpcmVidWc/IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzM5ODEyMC8zNzY3NzNcbiAgICAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmNvbnNvbGUgJiYgKHdpbmRvdy5jb25zb2xlLmZpcmVidWcgfHwgKHdpbmRvdy5jb25zb2xlLmV4Y2VwdGlvbiAmJiB3aW5kb3cuY29uc29sZS50YWJsZSkpKSB8fFxuICAgIC8vIGlzIGZpcmVmb3ggPj0gdjMxP1xuICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvVG9vbHMvV2ViX0NvbnNvbGUjU3R5bGluZ19tZXNzYWdlc1xuICAgICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IudXNlckFnZW50ICYmIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5tYXRjaCgvZmlyZWZveFxcLyhcXGQrKS8pICYmIHBhcnNlSW50KFJlZ0V4cC4kMSwgMTApID49IDMxKSB8fFxuICAgIC8vIGRvdWJsZSBjaGVjayB3ZWJraXQgaW4gdXNlckFnZW50IGp1c3QgaW4gY2FzZSB3ZSBhcmUgaW4gYSB3b3JrZXJcbiAgICAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudCAmJiBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkubWF0Y2goL2FwcGxld2Via2l0XFwvKFxcZCspLykpO1xufVxuXG4vKipcbiAqIE1hcCAlaiB0byBgSlNPTi5zdHJpbmdpZnkoKWAsIHNpbmNlIG5vIFdlYiBJbnNwZWN0b3JzIGRvIHRoYXQgYnkgZGVmYXVsdC5cbiAqL1xuXG5leHBvcnRzLmZvcm1hdHRlcnMuaiA9IGZ1bmN0aW9uKHYpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodik7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiAnW1VuZXhwZWN0ZWRKU09OUGFyc2VFcnJvcl06ICcgKyBlcnIubWVzc2FnZTtcbiAgfVxufTtcblxuXG4vKipcbiAqIENvbG9yaXplIGxvZyBhcmd1bWVudHMgaWYgZW5hYmxlZC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGZvcm1hdEFyZ3MoYXJncykge1xuICB2YXIgdXNlQ29sb3JzID0gdGhpcy51c2VDb2xvcnM7XG5cbiAgYXJnc1swXSA9ICh1c2VDb2xvcnMgPyAnJWMnIDogJycpXG4gICAgKyB0aGlzLm5hbWVzcGFjZVxuICAgICsgKHVzZUNvbG9ycyA/ICcgJWMnIDogJyAnKVxuICAgICsgYXJnc1swXVxuICAgICsgKHVzZUNvbG9ycyA/ICclYyAnIDogJyAnKVxuICAgICsgJysnICsgZXhwb3J0cy5odW1hbml6ZSh0aGlzLmRpZmYpO1xuXG4gIGlmICghdXNlQ29sb3JzKSByZXR1cm47XG5cbiAgdmFyIGMgPSAnY29sb3I6ICcgKyB0aGlzLmNvbG9yO1xuICBhcmdzLnNwbGljZSgxLCAwLCBjLCAnY29sb3I6IGluaGVyaXQnKVxuXG4gIC8vIHRoZSBmaW5hbCBcIiVjXCIgaXMgc29tZXdoYXQgdHJpY2t5LCBiZWNhdXNlIHRoZXJlIGNvdWxkIGJlIG90aGVyXG4gIC8vIGFyZ3VtZW50cyBwYXNzZWQgZWl0aGVyIGJlZm9yZSBvciBhZnRlciB0aGUgJWMsIHNvIHdlIG5lZWQgdG9cbiAgLy8gZmlndXJlIG91dCB0aGUgY29ycmVjdCBpbmRleCB0byBpbnNlcnQgdGhlIENTUyBpbnRvXG4gIHZhciBpbmRleCA9IDA7XG4gIHZhciBsYXN0QyA9IDA7XG4gIGFyZ3NbMF0ucmVwbGFjZSgvJVthLXpBLVolXS9nLCBmdW5jdGlvbihtYXRjaCkge1xuICAgIGlmICgnJSUnID09PSBtYXRjaCkgcmV0dXJuO1xuICAgIGluZGV4Kys7XG4gICAgaWYgKCclYycgPT09IG1hdGNoKSB7XG4gICAgICAvLyB3ZSBvbmx5IGFyZSBpbnRlcmVzdGVkIGluIHRoZSAqbGFzdCogJWNcbiAgICAgIC8vICh0aGUgdXNlciBtYXkgaGF2ZSBwcm92aWRlZCB0aGVpciBvd24pXG4gICAgICBsYXN0QyA9IGluZGV4O1xuICAgIH1cbiAgfSk7XG5cbiAgYXJncy5zcGxpY2UobGFzdEMsIDAsIGMpO1xufVxuXG4vKipcbiAqIEludm9rZXMgYGNvbnNvbGUubG9nKClgIHdoZW4gYXZhaWxhYmxlLlxuICogTm8tb3Agd2hlbiBgY29uc29sZS5sb2dgIGlzIG5vdCBhIFwiZnVuY3Rpb25cIi5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGxvZygpIHtcbiAgLy8gdGhpcyBoYWNrZXJ5IGlzIHJlcXVpcmVkIGZvciBJRTgvOSwgd2hlcmVcbiAgLy8gdGhlIGBjb25zb2xlLmxvZ2AgZnVuY3Rpb24gZG9lc24ndCBoYXZlICdhcHBseSdcbiAgcmV0dXJuICdvYmplY3QnID09PSB0eXBlb2YgY29uc29sZVxuICAgICYmIGNvbnNvbGUubG9nXG4gICAgJiYgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5LmNhbGwoY29uc29sZS5sb2csIGNvbnNvbGUsIGFyZ3VtZW50cyk7XG59XG5cbi8qKlxuICogU2F2ZSBgbmFtZXNwYWNlc2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNhdmUobmFtZXNwYWNlcykge1xuICB0cnkge1xuICAgIGlmIChudWxsID09IG5hbWVzcGFjZXMpIHtcbiAgICAgIGV4cG9ydHMuc3RvcmFnZS5yZW1vdmVJdGVtKCdkZWJ1ZycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBleHBvcnRzLnN0b3JhZ2UuZGVidWcgPSBuYW1lc3BhY2VzO1xuICAgIH1cbiAgfSBjYXRjaChlKSB7fVxufVxuXG4vKipcbiAqIExvYWQgYG5hbWVzcGFjZXNgLlxuICpcbiAqIEByZXR1cm4ge1N0cmluZ30gcmV0dXJucyB0aGUgcHJldmlvdXNseSBwZXJzaXN0ZWQgZGVidWcgbW9kZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGxvYWQoKSB7XG4gIHZhciByO1xuICB0cnkge1xuICAgIHIgPSBleHBvcnRzLnN0b3JhZ2UuZGVidWc7XG4gIH0gY2F0Y2goZSkge31cblxuICAvLyBJZiBkZWJ1ZyBpc24ndCBzZXQgaW4gTFMsIGFuZCB3ZSdyZSBpbiBFbGVjdHJvbiwgdHJ5IHRvIGxvYWQgJERFQlVHXG4gIGlmICghciAmJiB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgJ2VudicgaW4gcHJvY2Vzcykge1xuICAgIHIgPSBwcm9jZXNzLmVudi5ERUJVRztcbiAgfVxuXG4gIHJldHVybiByO1xufVxuXG4vKipcbiAqIEVuYWJsZSBuYW1lc3BhY2VzIGxpc3RlZCBpbiBgbG9jYWxTdG9yYWdlLmRlYnVnYCBpbml0aWFsbHkuXG4gKi9cblxuZXhwb3J0cy5lbmFibGUobG9hZCgpKTtcblxuLyoqXG4gKiBMb2NhbHN0b3JhZ2UgYXR0ZW1wdHMgdG8gcmV0dXJuIHRoZSBsb2NhbHN0b3JhZ2UuXG4gKlxuICogVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSBzYWZhcmkgdGhyb3dzXG4gKiB3aGVuIGEgdXNlciBkaXNhYmxlcyBjb29raWVzL2xvY2Fsc3RvcmFnZVxuICogYW5kIHlvdSBhdHRlbXB0IHRvIGFjY2VzcyBpdC5cbiAqXG4gKiBAcmV0dXJuIHtMb2NhbFN0b3JhZ2V9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBsb2NhbHN0b3JhZ2UoKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHdpbmRvdy5sb2NhbFN0b3JhZ2U7XG4gIH0gY2F0Y2ggKGUpIHt9XG59XG4iLCJcbi8qKlxuICogVGhpcyBpcyB0aGUgY29tbW9uIGxvZ2ljIGZvciBib3RoIHRoZSBOb2RlLmpzIGFuZCB3ZWIgYnJvd3NlclxuICogaW1wbGVtZW50YXRpb25zIG9mIGBkZWJ1ZygpYC5cbiAqXG4gKiBFeHBvc2UgYGRlYnVnKClgIGFzIHRoZSBtb2R1bGUuXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gY3JlYXRlRGVidWcuZGVidWcgPSBjcmVhdGVEZWJ1Z1snZGVmYXVsdCddID0gY3JlYXRlRGVidWc7XG5leHBvcnRzLmNvZXJjZSA9IGNvZXJjZTtcbmV4cG9ydHMuZGlzYWJsZSA9IGRpc2FibGU7XG5leHBvcnRzLmVuYWJsZSA9IGVuYWJsZTtcbmV4cG9ydHMuZW5hYmxlZCA9IGVuYWJsZWQ7XG5leHBvcnRzLmh1bWFuaXplID0gcmVxdWlyZSgnbXMnKTtcblxuLyoqXG4gKiBBY3RpdmUgYGRlYnVnYCBpbnN0YW5jZXMuXG4gKi9cbmV4cG9ydHMuaW5zdGFuY2VzID0gW107XG5cbi8qKlxuICogVGhlIGN1cnJlbnRseSBhY3RpdmUgZGVidWcgbW9kZSBuYW1lcywgYW5kIG5hbWVzIHRvIHNraXAuXG4gKi9cblxuZXhwb3J0cy5uYW1lcyA9IFtdO1xuZXhwb3J0cy5za2lwcyA9IFtdO1xuXG4vKipcbiAqIE1hcCBvZiBzcGVjaWFsIFwiJW5cIiBoYW5kbGluZyBmdW5jdGlvbnMsIGZvciB0aGUgZGVidWcgXCJmb3JtYXRcIiBhcmd1bWVudC5cbiAqXG4gKiBWYWxpZCBrZXkgbmFtZXMgYXJlIGEgc2luZ2xlLCBsb3dlciBvciB1cHBlci1jYXNlIGxldHRlciwgaS5lLiBcIm5cIiBhbmQgXCJOXCIuXG4gKi9cblxuZXhwb3J0cy5mb3JtYXR0ZXJzID0ge307XG5cbi8qKlxuICogU2VsZWN0IGEgY29sb3IuXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzZWxlY3RDb2xvcihuYW1lc3BhY2UpIHtcbiAgdmFyIGhhc2ggPSAwLCBpO1xuXG4gIGZvciAoaSBpbiBuYW1lc3BhY2UpIHtcbiAgICBoYXNoICA9ICgoaGFzaCA8PCA1KSAtIGhhc2gpICsgbmFtZXNwYWNlLmNoYXJDb2RlQXQoaSk7XG4gICAgaGFzaCB8PSAwOyAvLyBDb252ZXJ0IHRvIDMyYml0IGludGVnZXJcbiAgfVxuXG4gIHJldHVybiBleHBvcnRzLmNvbG9yc1tNYXRoLmFicyhoYXNoKSAlIGV4cG9ydHMuY29sb3JzLmxlbmd0aF07XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgZGVidWdnZXIgd2l0aCB0aGUgZ2l2ZW4gYG5hbWVzcGFjZWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGNyZWF0ZURlYnVnKG5hbWVzcGFjZSkge1xuXG4gIHZhciBwcmV2VGltZTtcblxuICBmdW5jdGlvbiBkZWJ1ZygpIHtcbiAgICAvLyBkaXNhYmxlZD9cbiAgICBpZiAoIWRlYnVnLmVuYWJsZWQpIHJldHVybjtcblxuICAgIHZhciBzZWxmID0gZGVidWc7XG5cbiAgICAvLyBzZXQgYGRpZmZgIHRpbWVzdGFtcFxuICAgIHZhciBjdXJyID0gK25ldyBEYXRlKCk7XG4gICAgdmFyIG1zID0gY3VyciAtIChwcmV2VGltZSB8fCBjdXJyKTtcbiAgICBzZWxmLmRpZmYgPSBtcztcbiAgICBzZWxmLnByZXYgPSBwcmV2VGltZTtcbiAgICBzZWxmLmN1cnIgPSBjdXJyO1xuICAgIHByZXZUaW1lID0gY3VycjtcblxuICAgIC8vIHR1cm4gdGhlIGBhcmd1bWVudHNgIGludG8gYSBwcm9wZXIgQXJyYXlcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuXG4gICAgYXJnc1swXSA9IGV4cG9ydHMuY29lcmNlKGFyZ3NbMF0pO1xuXG4gICAgaWYgKCdzdHJpbmcnICE9PSB0eXBlb2YgYXJnc1swXSkge1xuICAgICAgLy8gYW55dGhpbmcgZWxzZSBsZXQncyBpbnNwZWN0IHdpdGggJU9cbiAgICAgIGFyZ3MudW5zaGlmdCgnJU8nKTtcbiAgICB9XG5cbiAgICAvLyBhcHBseSBhbnkgYGZvcm1hdHRlcnNgIHRyYW5zZm9ybWF0aW9uc1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgYXJnc1swXSA9IGFyZ3NbMF0ucmVwbGFjZSgvJShbYS16QS1aJV0pL2csIGZ1bmN0aW9uKG1hdGNoLCBmb3JtYXQpIHtcbiAgICAgIC8vIGlmIHdlIGVuY291bnRlciBhbiBlc2NhcGVkICUgdGhlbiBkb24ndCBpbmNyZWFzZSB0aGUgYXJyYXkgaW5kZXhcbiAgICAgIGlmIChtYXRjaCA9PT0gJyUlJykgcmV0dXJuIG1hdGNoO1xuICAgICAgaW5kZXgrKztcbiAgICAgIHZhciBmb3JtYXR0ZXIgPSBleHBvcnRzLmZvcm1hdHRlcnNbZm9ybWF0XTtcbiAgICAgIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgZm9ybWF0dGVyKSB7XG4gICAgICAgIHZhciB2YWwgPSBhcmdzW2luZGV4XTtcbiAgICAgICAgbWF0Y2ggPSBmb3JtYXR0ZXIuY2FsbChzZWxmLCB2YWwpO1xuXG4gICAgICAgIC8vIG5vdyB3ZSBuZWVkIHRvIHJlbW92ZSBgYXJnc1tpbmRleF1gIHNpbmNlIGl0J3MgaW5saW5lZCBpbiB0aGUgYGZvcm1hdGBcbiAgICAgICAgYXJncy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICBpbmRleC0tO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH0pO1xuXG4gICAgLy8gYXBwbHkgZW52LXNwZWNpZmljIGZvcm1hdHRpbmcgKGNvbG9ycywgZXRjLilcbiAgICBleHBvcnRzLmZvcm1hdEFyZ3MuY2FsbChzZWxmLCBhcmdzKTtcblxuICAgIHZhciBsb2dGbiA9IGRlYnVnLmxvZyB8fCBleHBvcnRzLmxvZyB8fCBjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpO1xuICAgIGxvZ0ZuLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICB9XG5cbiAgZGVidWcubmFtZXNwYWNlID0gbmFtZXNwYWNlO1xuICBkZWJ1Zy5lbmFibGVkID0gZXhwb3J0cy5lbmFibGVkKG5hbWVzcGFjZSk7XG4gIGRlYnVnLnVzZUNvbG9ycyA9IGV4cG9ydHMudXNlQ29sb3JzKCk7XG4gIGRlYnVnLmNvbG9yID0gc2VsZWN0Q29sb3IobmFtZXNwYWNlKTtcbiAgZGVidWcuZGVzdHJveSA9IGRlc3Ryb3k7XG5cbiAgLy8gZW52LXNwZWNpZmljIGluaXRpYWxpemF0aW9uIGxvZ2ljIGZvciBkZWJ1ZyBpbnN0YW5jZXNcbiAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBleHBvcnRzLmluaXQpIHtcbiAgICBleHBvcnRzLmluaXQoZGVidWcpO1xuICB9XG5cbiAgZXhwb3J0cy5pbnN0YW5jZXMucHVzaChkZWJ1Zyk7XG5cbiAgcmV0dXJuIGRlYnVnO1xufVxuXG5mdW5jdGlvbiBkZXN0cm95ICgpIHtcbiAgdmFyIGluZGV4ID0gZXhwb3J0cy5pbnN0YW5jZXMuaW5kZXhPZih0aGlzKTtcbiAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgIGV4cG9ydHMuaW5zdGFuY2VzLnNwbGljZShpbmRleCwgMSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qKlxuICogRW5hYmxlcyBhIGRlYnVnIG1vZGUgYnkgbmFtZXNwYWNlcy4gVGhpcyBjYW4gaW5jbHVkZSBtb2Rlc1xuICogc2VwYXJhdGVkIGJ5IGEgY29sb24gYW5kIHdpbGRjYXJkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBlbmFibGUobmFtZXNwYWNlcykge1xuICBleHBvcnRzLnNhdmUobmFtZXNwYWNlcyk7XG5cbiAgZXhwb3J0cy5uYW1lcyA9IFtdO1xuICBleHBvcnRzLnNraXBzID0gW107XG5cbiAgdmFyIGk7XG4gIHZhciBzcGxpdCA9ICh0eXBlb2YgbmFtZXNwYWNlcyA9PT0gJ3N0cmluZycgPyBuYW1lc3BhY2VzIDogJycpLnNwbGl0KC9bXFxzLF0rLyk7XG4gIHZhciBsZW4gPSBzcGxpdC5sZW5ndGg7XG5cbiAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKCFzcGxpdFtpXSkgY29udGludWU7IC8vIGlnbm9yZSBlbXB0eSBzdHJpbmdzXG4gICAgbmFtZXNwYWNlcyA9IHNwbGl0W2ldLnJlcGxhY2UoL1xcKi9nLCAnLio/Jyk7XG4gICAgaWYgKG5hbWVzcGFjZXNbMF0gPT09ICctJykge1xuICAgICAgZXhwb3J0cy5za2lwcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZXNwYWNlcy5zdWJzdHIoMSkgKyAnJCcpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXhwb3J0cy5uYW1lcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZXNwYWNlcyArICckJykpO1xuICAgIH1cbiAgfVxuXG4gIGZvciAoaSA9IDA7IGkgPCBleHBvcnRzLmluc3RhbmNlcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpbnN0YW5jZSA9IGV4cG9ydHMuaW5zdGFuY2VzW2ldO1xuICAgIGluc3RhbmNlLmVuYWJsZWQgPSBleHBvcnRzLmVuYWJsZWQoaW5zdGFuY2UubmFtZXNwYWNlKTtcbiAgfVxufVxuXG4vKipcbiAqIERpc2FibGUgZGVidWcgb3V0cHV0LlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZGlzYWJsZSgpIHtcbiAgZXhwb3J0cy5lbmFibGUoJycpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gbW9kZSBuYW1lIGlzIGVuYWJsZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZW5hYmxlZChuYW1lKSB7XG4gIGlmIChuYW1lW25hbWUubGVuZ3RoIC0gMV0gPT09ICcqJykge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHZhciBpLCBsZW47XG4gIGZvciAoaSA9IDAsIGxlbiA9IGV4cG9ydHMuc2tpcHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoZXhwb3J0cy5za2lwc1tpXS50ZXN0KG5hbWUpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIGZvciAoaSA9IDAsIGxlbiA9IGV4cG9ydHMubmFtZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoZXhwb3J0cy5uYW1lc1tpXS50ZXN0KG5hbWUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIENvZXJjZSBgdmFsYC5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge01peGVkfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gY29lcmNlKHZhbCkge1xuICBpZiAodmFsIGluc3RhbmNlb2YgRXJyb3IpIHJldHVybiB2YWwuc3RhY2sgfHwgdmFsLm1lc3NhZ2U7XG4gIHJldHVybiB2YWw7XG59XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgdG9GdW5jdGlvbiA9IHJlcXVpcmUoJ3RvLWZ1bmN0aW9uJyk7XG5cbi8qKlxuICogR3JvdXAgYGFycmAgd2l0aCBjYWxsYmFjayBgZm4odmFsLCBpKWAuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufFN0cmluZ30gZm4gb3IgcHJvcFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXJyLCBmbil7XG4gIHZhciByZXQgPSB7fTtcbiAgdmFyIHByb3A7XG4gIGZuID0gdG9GdW5jdGlvbihmbik7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyArK2kpIHtcbiAgICBwcm9wID0gZm4oYXJyW2ldLCBpKTtcbiAgICByZXRbcHJvcF0gPSByZXRbcHJvcF0gfHwgW107XG4gICAgcmV0W3Byb3BdLnB1c2goYXJyW2ldKTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59OyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcblxuZnVuY3Rpb24gbGlzdGVuKGV2dHMsIGZ1bmMsIHRvQWRkKSB7XG5cdHZhciBmbiA9IHdpbmRvd1sodG9BZGQgPyAnYWRkJyA6ICdyZW1vdmUnKSArICdFdmVudExpc3RlbmVyJ107XG5cdGV2dHMuc3BsaXQoJyAnKS5mb3JFYWNoKGZ1bmN0aW9uIChldikge1xuXHRcdGZuKGV2LCBmdW5jKTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGNoZWNrKCkge1xuXHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCFuYXZpZ2F0b3Iub25MaW5lKTtcbn1cblxuZnVuY3Rpb24gd2F0Y2goY2IpIHtcblx0dmFyIGZuID0gZnVuY3Rpb24gKF8pIHsgcmV0dXJuIGNoZWNrKCkudGhlbihjYik7IH07XG5cdHZhciBsaXN0ZW5lciA9IGxpc3Rlbi5iaW5kKG51bGwsICdvbmxpbmUgb2ZmbGluZScsIGZuKTtcblx0bGlzdGVuZXIodHJ1ZSk7XG5cdHJldHVybiBmdW5jdGlvbiAoXykge1xuXHRcdGxpc3RlbmVyKGZhbHNlKTtcblx0fVxufVxuXG5leHBvcnRzLmNoZWNrID0gY2hlY2s7XG5leHBvcnRzLndhdGNoID0gd2F0Y2g7XG4iLCIvKipcbiAqIEhlbHBlcnMuXG4gKi9cblxudmFyIHMgPSAxMDAwO1xudmFyIG0gPSBzICogNjA7XG52YXIgaCA9IG0gKiA2MDtcbnZhciBkID0gaCAqIDI0O1xudmFyIHkgPSBkICogMzY1LjI1O1xuXG4vKipcbiAqIFBhcnNlIG9yIGZvcm1hdCB0aGUgZ2l2ZW4gYHZhbGAuXG4gKlxuICogT3B0aW9uczpcbiAqXG4gKiAgLSBgbG9uZ2AgdmVyYm9zZSBmb3JtYXR0aW5nIFtmYWxzZV1cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xOdW1iZXJ9IHZhbFxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQHRocm93cyB7RXJyb3J9IHRocm93IGFuIGVycm9yIGlmIHZhbCBpcyBub3QgYSBub24tZW1wdHkgc3RyaW5nIG9yIGEgbnVtYmVyXG4gKiBAcmV0dXJuIHtTdHJpbmd8TnVtYmVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHZhbCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsO1xuICBpZiAodHlwZSA9PT0gJ3N0cmluZycgJiYgdmFsLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gcGFyc2UodmFsKTtcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJyAmJiBpc05hTih2YWwpID09PSBmYWxzZSkge1xuICAgIHJldHVybiBvcHRpb25zLmxvbmcgPyBmbXRMb25nKHZhbCkgOiBmbXRTaG9ydCh2YWwpO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcihcbiAgICAndmFsIGlzIG5vdCBhIG5vbi1lbXB0eSBzdHJpbmcgb3IgYSB2YWxpZCBudW1iZXIuIHZhbD0nICtcbiAgICAgIEpTT04uc3RyaW5naWZ5KHZhbClcbiAgKTtcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGBzdHJgIGFuZCByZXR1cm4gbWlsbGlzZWNvbmRzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlKHN0cikge1xuICBzdHIgPSBTdHJpbmcoc3RyKTtcbiAgaWYgKHN0ci5sZW5ndGggPiAxMDApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIG1hdGNoID0gL14oKD86XFxkKyk/XFwuP1xcZCspICoobWlsbGlzZWNvbmRzP3xtc2Vjcz98bXN8c2Vjb25kcz98c2Vjcz98c3xtaW51dGVzP3xtaW5zP3xtfGhvdXJzP3xocnM/fGh8ZGF5cz98ZHx5ZWFycz98eXJzP3x5KT8kL2kuZXhlYyhcbiAgICBzdHJcbiAgKTtcbiAgaWYgKCFtYXRjaCkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbiA9IHBhcnNlRmxvYXQobWF0Y2hbMV0pO1xuICB2YXIgdHlwZSA9IChtYXRjaFsyXSB8fCAnbXMnKS50b0xvd2VyQ2FzZSgpO1xuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICd5ZWFycyc6XG4gICAgY2FzZSAneWVhcic6XG4gICAgY2FzZSAneXJzJzpcbiAgICBjYXNlICd5cic6XG4gICAgY2FzZSAneSc6XG4gICAgICByZXR1cm4gbiAqIHk7XG4gICAgY2FzZSAnZGF5cyc6XG4gICAgY2FzZSAnZGF5JzpcbiAgICBjYXNlICdkJzpcbiAgICAgIHJldHVybiBuICogZDtcbiAgICBjYXNlICdob3Vycyc6XG4gICAgY2FzZSAnaG91cic6XG4gICAgY2FzZSAnaHJzJzpcbiAgICBjYXNlICdocic6XG4gICAgY2FzZSAnaCc6XG4gICAgICByZXR1cm4gbiAqIGg7XG4gICAgY2FzZSAnbWludXRlcyc6XG4gICAgY2FzZSAnbWludXRlJzpcbiAgICBjYXNlICdtaW5zJzpcbiAgICBjYXNlICdtaW4nOlxuICAgIGNhc2UgJ20nOlxuICAgICAgcmV0dXJuIG4gKiBtO1xuICAgIGNhc2UgJ3NlY29uZHMnOlxuICAgIGNhc2UgJ3NlY29uZCc6XG4gICAgY2FzZSAnc2Vjcyc6XG4gICAgY2FzZSAnc2VjJzpcbiAgICBjYXNlICdzJzpcbiAgICAgIHJldHVybiBuICogcztcbiAgICBjYXNlICdtaWxsaXNlY29uZHMnOlxuICAgIGNhc2UgJ21pbGxpc2Vjb25kJzpcbiAgICBjYXNlICdtc2Vjcyc6XG4gICAgY2FzZSAnbXNlYyc6XG4gICAgY2FzZSAnbXMnOlxuICAgICAgcmV0dXJuIG47XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cblxuLyoqXG4gKiBTaG9ydCBmb3JtYXQgZm9yIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBmbXRTaG9ydChtcykge1xuICBpZiAobXMgPj0gZCkge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gZCkgKyAnZCc7XG4gIH1cbiAgaWYgKG1zID49IGgpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIGgpICsgJ2gnO1xuICB9XG4gIGlmIChtcyA+PSBtKSB7XG4gICAgcmV0dXJuIE1hdGgucm91bmQobXMgLyBtKSArICdtJztcbiAgfVxuICBpZiAobXMgPj0gcykge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gcykgKyAncyc7XG4gIH1cbiAgcmV0dXJuIG1zICsgJ21zJztcbn1cblxuLyoqXG4gKiBMb25nIGZvcm1hdCBmb3IgYG1zYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbXNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGZtdExvbmcobXMpIHtcbiAgcmV0dXJuIHBsdXJhbChtcywgZCwgJ2RheScpIHx8XG4gICAgcGx1cmFsKG1zLCBoLCAnaG91cicpIHx8XG4gICAgcGx1cmFsKG1zLCBtLCAnbWludXRlJykgfHxcbiAgICBwbHVyYWwobXMsIHMsICdzZWNvbmQnKSB8fFxuICAgIG1zICsgJyBtcyc7XG59XG5cbi8qKlxuICogUGx1cmFsaXphdGlvbiBoZWxwZXIuXG4gKi9cblxuZnVuY3Rpb24gcGx1cmFsKG1zLCBuLCBuYW1lKSB7XG4gIGlmIChtcyA8IG4pIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKG1zIDwgbiAqIDEuNSkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKG1zIC8gbikgKyAnICcgKyBuYW1lO1xuICB9XG4gIHJldHVybiBNYXRoLmNlaWwobXMgLyBuKSArICcgJyArIG5hbWUgKyAncyc7XG59XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3Rvcnkpe1xuICAndXNlIHN0cmljdCc7XG5cbiAgLyppc3RhbmJ1bCBpZ25vcmUgbmV4dDpjYW50IHRlc3QqL1xuICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICBkZWZpbmUoW10sIGZhY3RvcnkpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFsc1xuICAgIHJvb3Qub2JqZWN0UGF0aCA9IGZhY3RvcnkoKTtcbiAgfVxufSkodGhpcywgZnVuY3Rpb24oKXtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciB0b1N0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG4gIGZ1bmN0aW9uIGhhc093blByb3BlcnR5KG9iaiwgcHJvcCkge1xuICAgIGlmKG9iaiA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgLy90byBoYW5kbGUgb2JqZWN0cyB3aXRoIG51bGwgcHJvdG90eXBlcyAodG9vIGVkZ2UgY2FzZT8pXG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApXG4gIH1cblxuICBmdW5jdGlvbiBpc0VtcHR5KHZhbHVlKXtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgZm9yICh2YXIgaSBpbiB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKGhhc093blByb3BlcnR5KHZhbHVlLCBpKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gdG9TdHJpbmcodHlwZSl7XG4gICAgcmV0dXJuIHRvU3RyLmNhbGwodHlwZSk7XG4gIH1cblxuICBmdW5jdGlvbiBpc09iamVjdChvYmope1xuICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiB0b1N0cmluZyhvYmopID09PSBcIltvYmplY3QgT2JqZWN0XVwiO1xuICB9XG5cbiAgdmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uKG9iail7XG4gICAgLyppc3RhbmJ1bCBpZ25vcmUgbmV4dDpjYW50IHRlc3QqL1xuICAgIHJldHVybiB0b1N0ci5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gIH1cblxuICBmdW5jdGlvbiBpc0Jvb2xlYW4ob2JqKXtcbiAgICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ2Jvb2xlYW4nIHx8IHRvU3RyaW5nKG9iaikgPT09ICdbb2JqZWN0IEJvb2xlYW5dJztcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldEtleShrZXkpe1xuICAgIHZhciBpbnRLZXkgPSBwYXJzZUludChrZXkpO1xuICAgIGlmIChpbnRLZXkudG9TdHJpbmcoKSA9PT0ga2V5KSB7XG4gICAgICByZXR1cm4gaW50S2V5O1xuICAgIH1cbiAgICByZXR1cm4ga2V5O1xuICB9XG5cbiAgZnVuY3Rpb24gZmFjdG9yeShvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cblxuICAgIHZhciBvYmplY3RQYXRoID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqZWN0UGF0aCkucmVkdWNlKGZ1bmN0aW9uKHByb3h5LCBwcm9wKSB7XG4gICAgICAgIGlmKHByb3AgPT09ICdjcmVhdGUnKSB7XG4gICAgICAgICAgcmV0dXJuIHByb3h5O1xuICAgICAgICB9XG5cbiAgICAgICAgLyppc3RhbmJ1bCBpZ25vcmUgZWxzZSovXG4gICAgICAgIGlmICh0eXBlb2Ygb2JqZWN0UGF0aFtwcm9wXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHByb3h5W3Byb3BdID0gb2JqZWN0UGF0aFtwcm9wXS5iaW5kKG9iamVjdFBhdGgsIG9iaik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcHJveHk7XG4gICAgICB9LCB7fSk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGhhc1NoYWxsb3dQcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgICAgIHJldHVybiAob3B0aW9ucy5pbmNsdWRlSW5oZXJpdGVkUHJvcHMgfHwgKHR5cGVvZiBwcm9wID09PSAnbnVtYmVyJyAmJiBBcnJheS5pc0FycmF5KG9iaikpIHx8IGhhc093blByb3BlcnR5KG9iaiwgcHJvcCkpXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0U2hhbGxvd1Byb3BlcnR5KG9iaiwgcHJvcCkge1xuICAgICAgaWYgKGhhc1NoYWxsb3dQcm9wZXJ0eShvYmosIHByb3ApKSB7XG4gICAgICAgIHJldHVybiBvYmpbcHJvcF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2V0KG9iaiwgcGF0aCwgdmFsdWUsIGRvTm90UmVwbGFjZSl7XG4gICAgICBpZiAodHlwZW9mIHBhdGggPT09ICdudW1iZXInKSB7XG4gICAgICAgIHBhdGggPSBbcGF0aF07XG4gICAgICB9XG4gICAgICBpZiAoIXBhdGggfHwgcGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIHNldChvYmosIHBhdGguc3BsaXQoJy4nKS5tYXAoZ2V0S2V5KSwgdmFsdWUsIGRvTm90UmVwbGFjZSk7XG4gICAgICB9XG4gICAgICB2YXIgY3VycmVudFBhdGggPSBwYXRoWzBdO1xuICAgICAgdmFyIGN1cnJlbnRWYWx1ZSA9IGdldFNoYWxsb3dQcm9wZXJ0eShvYmosIGN1cnJlbnRQYXRoKTtcbiAgICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICBpZiAoY3VycmVudFZhbHVlID09PSB2b2lkIDAgfHwgIWRvTm90UmVwbGFjZSkge1xuICAgICAgICAgIG9ialtjdXJyZW50UGF0aF0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY3VycmVudFZhbHVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoY3VycmVudFZhbHVlID09PSB2b2lkIDApIHtcbiAgICAgICAgLy9jaGVjayBpZiB3ZSBhc3N1bWUgYW4gYXJyYXlcbiAgICAgICAgaWYodHlwZW9mIHBhdGhbMV0gPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgb2JqW2N1cnJlbnRQYXRoXSA9IFtdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9ialtjdXJyZW50UGF0aF0gPSB7fTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2V0KG9ialtjdXJyZW50UGF0aF0sIHBhdGguc2xpY2UoMSksIHZhbHVlLCBkb05vdFJlcGxhY2UpO1xuICAgIH1cblxuICAgIG9iamVjdFBhdGguaGFzID0gZnVuY3Rpb24gKG9iaiwgcGF0aCkge1xuICAgICAgaWYgKHR5cGVvZiBwYXRoID09PSAnbnVtYmVyJykge1xuICAgICAgICBwYXRoID0gW3BhdGhdO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgcGF0aCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcGF0aCA9IHBhdGguc3BsaXQoJy4nKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFwYXRoIHx8IHBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiAhIW9iajtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXRoLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBqID0gZ2V0S2V5KHBhdGhbaV0pO1xuXG4gICAgICAgIGlmKCh0eXBlb2YgaiA9PT0gJ251bWJlcicgJiYgaXNBcnJheShvYmopICYmIGogPCBvYmoubGVuZ3RoKSB8fFxuICAgICAgICAgIChvcHRpb25zLmluY2x1ZGVJbmhlcml0ZWRQcm9wcyA/IChqIGluIE9iamVjdChvYmopKSA6IGhhc093blByb3BlcnR5KG9iaiwgaikpKSB7XG4gICAgICAgICAgb2JqID0gb2JqW2pdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgb2JqZWN0UGF0aC5lbnN1cmVFeGlzdHMgPSBmdW5jdGlvbiAob2JqLCBwYXRoLCB2YWx1ZSl7XG4gICAgICByZXR1cm4gc2V0KG9iaiwgcGF0aCwgdmFsdWUsIHRydWUpO1xuICAgIH07XG5cbiAgICBvYmplY3RQYXRoLnNldCA9IGZ1bmN0aW9uIChvYmosIHBhdGgsIHZhbHVlLCBkb05vdFJlcGxhY2Upe1xuICAgICAgcmV0dXJuIHNldChvYmosIHBhdGgsIHZhbHVlLCBkb05vdFJlcGxhY2UpO1xuICAgIH07XG5cbiAgICBvYmplY3RQYXRoLmluc2VydCA9IGZ1bmN0aW9uIChvYmosIHBhdGgsIHZhbHVlLCBhdCl7XG4gICAgICB2YXIgYXJyID0gb2JqZWN0UGF0aC5nZXQob2JqLCBwYXRoKTtcbiAgICAgIGF0ID0gfn5hdDtcbiAgICAgIGlmICghaXNBcnJheShhcnIpKSB7XG4gICAgICAgIGFyciA9IFtdO1xuICAgICAgICBvYmplY3RQYXRoLnNldChvYmosIHBhdGgsIGFycik7XG4gICAgICB9XG4gICAgICBhcnIuc3BsaWNlKGF0LCAwLCB2YWx1ZSk7XG4gICAgfTtcblxuICAgIG9iamVjdFBhdGguZW1wdHkgPSBmdW5jdGlvbihvYmosIHBhdGgpIHtcbiAgICAgIGlmIChpc0VtcHR5KHBhdGgpKSB7XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICB9XG4gICAgICBpZiAob2JqID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICAgIH1cblxuICAgICAgdmFyIHZhbHVlLCBpO1xuICAgICAgaWYgKCEodmFsdWUgPSBvYmplY3RQYXRoLmdldChvYmosIHBhdGgpKSkge1xuICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gb2JqZWN0UGF0aC5zZXQob2JqLCBwYXRoLCAnJyk7XG4gICAgICB9IGVsc2UgaWYgKGlzQm9vbGVhbih2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdFBhdGguc2V0KG9iaiwgcGF0aCwgZmFsc2UpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHJldHVybiBvYmplY3RQYXRoLnNldChvYmosIHBhdGgsIDApO1xuICAgICAgfSBlbHNlIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgICAgICB2YWx1ZS5sZW5ndGggPSAwO1xuICAgICAgfSBlbHNlIGlmIChpc09iamVjdCh2YWx1ZSkpIHtcbiAgICAgICAgZm9yIChpIGluIHZhbHVlKSB7XG4gICAgICAgICAgaWYgKGhhc1NoYWxsb3dQcm9wZXJ0eSh2YWx1ZSwgaSkpIHtcbiAgICAgICAgICAgIGRlbGV0ZSB2YWx1ZVtpXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBvYmplY3RQYXRoLnNldChvYmosIHBhdGgsIG51bGwpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBvYmplY3RQYXRoLnB1c2ggPSBmdW5jdGlvbiAob2JqLCBwYXRoIC8qLCB2YWx1ZXMgKi8pe1xuICAgICAgdmFyIGFyciA9IG9iamVjdFBhdGguZ2V0KG9iaiwgcGF0aCk7XG4gICAgICBpZiAoIWlzQXJyYXkoYXJyKSkge1xuICAgICAgICBhcnIgPSBbXTtcbiAgICAgICAgb2JqZWN0UGF0aC5zZXQob2JqLCBwYXRoLCBhcnIpO1xuICAgICAgfVxuXG4gICAgICBhcnIucHVzaC5hcHBseShhcnIsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMikpO1xuICAgIH07XG5cbiAgICBvYmplY3RQYXRoLmNvYWxlc2NlID0gZnVuY3Rpb24gKG9iaiwgcGF0aHMsIGRlZmF1bHRWYWx1ZSkge1xuICAgICAgdmFyIHZhbHVlO1xuXG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gcGF0aHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgaWYgKCh2YWx1ZSA9IG9iamVjdFBhdGguZ2V0KG9iaiwgcGF0aHNbaV0pKSAhPT0gdm9pZCAwKSB7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gICAgfTtcblxuICAgIG9iamVjdFBhdGguZ2V0ID0gZnVuY3Rpb24gKG9iaiwgcGF0aCwgZGVmYXVsdFZhbHVlKXtcbiAgICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcGF0aCA9IFtwYXRoXTtcbiAgICAgIH1cbiAgICAgIGlmICghcGF0aCB8fCBwYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgfVxuICAgICAgaWYgKG9iaiA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHBhdGggPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBvYmplY3RQYXRoLmdldChvYmosIHBhdGguc3BsaXQoJy4nKSwgZGVmYXVsdFZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGN1cnJlbnRQYXRoID0gZ2V0S2V5KHBhdGhbMF0pO1xuICAgICAgdmFyIG5leHRPYmogPSBnZXRTaGFsbG93UHJvcGVydHkob2JqLCBjdXJyZW50UGF0aClcbiAgICAgIGlmIChuZXh0T2JqID09PSB2b2lkIDApIHtcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHBhdGgubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHJldHVybiBuZXh0T2JqO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb2JqZWN0UGF0aC5nZXQob2JqW2N1cnJlbnRQYXRoXSwgcGF0aC5zbGljZSgxKSwgZGVmYXVsdFZhbHVlKTtcbiAgICB9O1xuXG4gICAgb2JqZWN0UGF0aC5kZWwgPSBmdW5jdGlvbiBkZWwob2JqLCBwYXRoKSB7XG4gICAgICBpZiAodHlwZW9mIHBhdGggPT09ICdudW1iZXInKSB7XG4gICAgICAgIHBhdGggPSBbcGF0aF07XG4gICAgICB9XG5cbiAgICAgIGlmIChvYmogPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNFbXB0eShwYXRoKSkge1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgfVxuICAgICAgaWYodHlwZW9mIHBhdGggPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBvYmplY3RQYXRoLmRlbChvYmosIHBhdGguc3BsaXQoJy4nKSk7XG4gICAgICB9XG5cbiAgICAgIHZhciBjdXJyZW50UGF0aCA9IGdldEtleShwYXRoWzBdKTtcbiAgICAgIGlmICghaGFzU2hhbGxvd1Byb3BlcnR5KG9iaiwgY3VycmVudFBhdGgpKSB7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgICB9XG5cbiAgICAgIGlmKHBhdGgubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAgICAgICBvYmouc3BsaWNlKGN1cnJlbnRQYXRoLCAxKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWxldGUgb2JqW2N1cnJlbnRQYXRoXTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdFBhdGguZGVsKG9ialtjdXJyZW50UGF0aF0sIHBhdGguc2xpY2UoMSkpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb2JqO1xuICAgIH1cblxuICAgIHJldHVybiBvYmplY3RQYXRoO1xuICB9XG5cbiAgdmFyIG1vZCA9IGZhY3RvcnkoKTtcbiAgbW9kLmNyZWF0ZSA9IGZhY3Rvcnk7XG4gIG1vZC53aXRoSW5oZXJpdGVkUHJvcHMgPSBmYWN0b3J5KHtpbmNsdWRlSW5oZXJpdGVkUHJvcHM6IHRydWV9KVxuICByZXR1cm4gbW9kO1xufSk7XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiXG4vKipcbiAqIE1vZHVsZSBEZXBlbmRlbmNpZXNcbiAqL1xuXG52YXIgZXhwcjtcbnRyeSB7XG4gIGV4cHIgPSByZXF1aXJlKCdwcm9wcycpO1xufSBjYXRjaChlKSB7XG4gIGV4cHIgPSByZXF1aXJlKCdjb21wb25lbnQtcHJvcHMnKTtcbn1cblxuLyoqXG4gKiBFeHBvc2UgYHRvRnVuY3Rpb24oKWAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB0b0Z1bmN0aW9uO1xuXG4vKipcbiAqIENvbnZlcnQgYG9iamAgdG8gYSBgRnVuY3Rpb25gLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IG9ialxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiB0b0Z1bmN0aW9uKG9iaikge1xuICBzd2l0Y2ggKHt9LnRvU3RyaW5nLmNhbGwob2JqKSkge1xuICAgIGNhc2UgJ1tvYmplY3QgT2JqZWN0XSc6XG4gICAgICByZXR1cm4gb2JqZWN0VG9GdW5jdGlvbihvYmopO1xuICAgIGNhc2UgJ1tvYmplY3QgRnVuY3Rpb25dJzpcbiAgICAgIHJldHVybiBvYmo7XG4gICAgY2FzZSAnW29iamVjdCBTdHJpbmddJzpcbiAgICAgIHJldHVybiBzdHJpbmdUb0Z1bmN0aW9uKG9iaik7XG4gICAgY2FzZSAnW29iamVjdCBSZWdFeHBdJzpcbiAgICAgIHJldHVybiByZWdleHBUb0Z1bmN0aW9uKG9iaik7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBkZWZhdWx0VG9GdW5jdGlvbihvYmopO1xuICB9XG59XG5cbi8qKlxuICogRGVmYXVsdCB0byBzdHJpY3QgZXF1YWxpdHkuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGRlZmF1bHRUb0Z1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqKXtcbiAgICByZXR1cm4gdmFsID09PSBvYmo7XG4gIH07XG59XG5cbi8qKlxuICogQ29udmVydCBgcmVgIHRvIGEgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtSZWdFeHB9IHJlXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHJlZ2V4cFRvRnVuY3Rpb24ocmUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iail7XG4gICAgcmV0dXJuIHJlLnRlc3Qob2JqKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IHByb3BlcnR5IGBzdHJgIHRvIGEgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzdHJpbmdUb0Z1bmN0aW9uKHN0cikge1xuICAvLyBpbW1lZGlhdGUgc3VjaCBhcyBcIj4gMjBcIlxuICBpZiAoL14gKlxcVysvLnRlc3Qoc3RyKSkgcmV0dXJuIG5ldyBGdW5jdGlvbignXycsICdyZXR1cm4gXyAnICsgc3RyKTtcblxuICAvLyBwcm9wZXJ0aWVzIHN1Y2ggYXMgXCJuYW1lLmZpcnN0XCIgb3IgXCJhZ2UgPiAxOFwiIG9yIFwiYWdlID4gMTggJiYgYWdlIDwgMzZcIlxuICByZXR1cm4gbmV3IEZ1bmN0aW9uKCdfJywgJ3JldHVybiAnICsgZ2V0KHN0cikpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYG9iamVjdGAgdG8gYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0XG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG9iamVjdFRvRnVuY3Rpb24ob2JqKSB7XG4gIHZhciBtYXRjaCA9IHt9O1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgbWF0Y2hba2V5XSA9IHR5cGVvZiBvYmpba2V5XSA9PT0gJ3N0cmluZydcbiAgICAgID8gZGVmYXVsdFRvRnVuY3Rpb24ob2JqW2tleV0pXG4gICAgICA6IHRvRnVuY3Rpb24ob2JqW2tleV0pO1xuICB9XG4gIHJldHVybiBmdW5jdGlvbih2YWwpe1xuICAgIGlmICh0eXBlb2YgdmFsICE9PSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xuICAgIGZvciAodmFyIGtleSBpbiBtYXRjaCkge1xuICAgICAgaWYgKCEoa2V5IGluIHZhbCkpIHJldHVybiBmYWxzZTtcbiAgICAgIGlmICghbWF0Y2hba2V5XSh2YWxba2V5XSkpIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG59XG5cbi8qKlxuICogQnVpbHQgdGhlIGdldHRlciBmdW5jdGlvbi4gU3VwcG9ydHMgZ2V0dGVyIHN0eWxlIGZ1bmN0aW9uc1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGdldChzdHIpIHtcbiAgdmFyIHByb3BzID0gZXhwcihzdHIpO1xuICBpZiAoIXByb3BzLmxlbmd0aCkgcmV0dXJuICdfLicgKyBzdHI7XG5cbiAgdmFyIHZhbCwgaSwgcHJvcDtcbiAgZm9yIChpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgcHJvcCA9IHByb3BzW2ldO1xuICAgIHZhbCA9ICdfLicgKyBwcm9wO1xuICAgIHZhbCA9IFwiKCdmdW5jdGlvbicgPT0gdHlwZW9mIFwiICsgdmFsICsgXCIgPyBcIiArIHZhbCArIFwiKCkgOiBcIiArIHZhbCArIFwiKVwiO1xuXG4gICAgLy8gbWltaWMgbmVnYXRpdmUgbG9va2JlaGluZCB0byBhdm9pZCBwcm9ibGVtcyB3aXRoIG5lc3RlZCBwcm9wZXJ0aWVzXG4gICAgc3RyID0gc3RyaXBOZXN0ZWQocHJvcCwgc3RyLCB2YWwpO1xuICB9XG5cbiAgcmV0dXJuIHN0cjtcbn1cblxuLyoqXG4gKiBNaW1pYyBuZWdhdGl2ZSBsb29rYmVoaW5kIHRvIGF2b2lkIHByb2JsZW1zIHdpdGggbmVzdGVkIHByb3BlcnRpZXMuXG4gKlxuICogU2VlOiBodHRwOi8vYmxvZy5zdGV2ZW5sZXZpdGhhbi5jb20vYXJjaGl2ZXMvbWltaWMtbG9va2JlaGluZC1qYXZhc2NyaXB0XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHN0cmlwTmVzdGVkIChwcm9wLCBzdHIsIHZhbCkge1xuICByZXR1cm4gc3RyLnJlcGxhY2UobmV3IFJlZ0V4cCgnKFxcXFwuKT8nICsgcHJvcCwgJ2cnKSwgZnVuY3Rpb24oJDAsICQxKSB7XG4gICAgcmV0dXJuICQxID8gJDAgOiB2YWw7XG4gIH0pO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQge1xuICBzdG9yYWdlOiAnbG9jYWxzdG9yYWdlJyxcbiAgcHJlZml4OiAnc3Ffam9icycsXG4gIHRpbWVvdXQ6IDEwMDAsXG4gIGxpbWl0OiAtMSxcbiAgcHJpbmNpcGxlOiAnZmlmbycsXG4gIG5ldHdvcms6IGZhbHNlLFxuICBkZWJ1ZzogdHJ1ZVxufTtcbiIsIi8qIEBmbG93ICovXG5pbXBvcnQgdHlwZSBJQ29uZmlnIGZyb20gJy4uL2ludGVyZmFjZXMvY29uZmlnJztcbmltcG9ydCBjb25maWdEYXRhIGZyb20gJy4vY29uZmlnLmRhdGEnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25maWcge1xuICBjb25maWc6IElDb25maWcgPSBjb25maWdEYXRhO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogSUNvbmZpZyA9IHt9KSB7XG4gICAgdGhpcy5tZXJnZShjb25maWcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBjb25maWcgdG8gZ2xvYmFsIGNvbmZpZyByZWZlcmVuY2VcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSAge0FueX0gdmFsdWVcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHNldChuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLmNvbmZpZ1tuYW1lXSA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIGNvbmZpZ1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVcbiAgICogQHJldHVybiB7YW55fVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgZ2V0KG5hbWU6IHN0cmluZyk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnW25hbWVdO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGNvbmZpZyBwcm9wZXJ0eVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVcbiAgICogQHJldHVybiB7YW55fVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgaGFzKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5jb25maWcsIG5hbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1lcmdlIHR3byBjb25maWcgb2JqZWN0XG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgbWVyZ2UoY29uZmlnOiB7W3N0cmluZ106IGFueX0pOiB2b2lkIHtcbiAgICB0aGlzLmNvbmZpZyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuY29uZmlnLCBjb25maWcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIGNvbmZpZ1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHJlbW92ZShuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZGVsZXRlIHRoaXMuY29uZmlnW25hbWVdO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgY29uZmlnXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHtJQ29uZmlnW119XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhbGwoKTogSUNvbmZpZyB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnO1xuICB9XG59XG4iLCIvKiBAZmxvdyAqL1xuaW1wb3J0IHR5cGUgSUNvbnRhaW5lciBmcm9tICcuLi9pbnRlcmZhY2VzL2NvbnRhaW5lcic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbnRhaW5lciBpbXBsZW1lbnRzIElDb250YWluZXIge1xuXG4gIGNvbnN0cnVjdG9yKCkge31cblxuICBfY29udGFpbmVyOiB7W3Byb3BlcnR5OiBzdHJpbmddOiBhbnl9ID0ge307XG5cbiAgLyoqXG4gICAqIENoZWNrIGl0ZW0gaW4gY29udGFpbmVyXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gaWRcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGhhcyhpZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLl9jb250YWluZXIsIGlkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgaXRlbSBmcm9tIGNvbnRhaW5lclxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGlkXG4gICAqIEByZXR1cm4ge0FueX1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGdldChpZDogc3RyaW5nKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5fY29udGFpbmVyW2lkXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIGl0ZW1zIGZyb20gY29udGFpbmVyXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFsbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fY29udGFpbmVyO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBpdGVtIHRvIGNvbnRhaW5lclxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGlkXG4gICAqIEBwYXJhbSAge0FueX0gdmFsdWVcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGJpbmQoaWQ6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQge1xuICAgIHRoaXMuX2NvbnRhaW5lcltpZF0gPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgaXRlbSBmcm9tIGNvbnRhaW5lclxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGlkXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICByZW1vdmUoaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmICghIHRoaXMuaGFzKGlkKSkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiBkZWxldGUgdGhpcy5fY29udGFpbmVyW2lkXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYWxsIGl0ZW1zIGZyb20gY29udGFpbmVyXG4gICAqXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICByZW1vdmVBbGwoKTogdm9pZCB7XG4gICAgdGhpcy5fY29udGFpbmVyID0ge307XG4gIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IHtcbiAgcXVldWU6IHtcbiAgICAnY3JlYXRlZCc6ICdOZXcgdGFzayBjcmVhdGVkLicsXG4gICAgJ25leHQnOiAnTmV4dCB0YXNrIHByb2Nlc3NpbmcuJyxcbiAgICAnc3RhcnRpbmcnOiAnUXVldWUgbGlzdGVuZXIgc3RhcnRpbmcuJyxcbiAgICAnc3RvcHBpbmcnOiAnUXVldWUgbGlzdGVuZXIgc3RvcHBpbmcuJyxcbiAgICAnc3RvcHBlZCc6ICdRdWV1ZSBsaXN0ZW5lciBzdG9wcGVkLicsXG4gICAgJ2VtcHR5JzogJ2NoYW5uZWwgaXMgZW1wdHkuLi4nLFxuICAgICdub3QtZm91bmQnOiAnam9iIG5vdCBmb3VuZCcsXG4gICAgJ29mZmxpbmUnOiAnRGlzY29ubmVjdGVkJyxcbiAgICAnb25saW5lJzogJ0Nvbm5lY3RlZCcsXG4gIH0sXG4gIGV2ZW50OiB7XG4gICAgJ2NyZWF0ZWQnOiAnTmV3IGV2ZW50IGNyZWF0ZWQnLFxuICAgICdmaXJlZCc6ICdFdmVudCBmaXJlZC4nLFxuICAgICd3aWxkY2FyZC1maXJlZCc6ICdXaWxkY2FyZCBldmVudCBmaXJlZC4nXG4gIH1cblxufVxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXZlbnQge1xuICBzdG9yZToge1twcm9wOiBzdHJpbmddOiBhbnl9ID0ge307XG4gIHZlcmlmaWVyUGF0dGVybjogc3RyaW5nID0gL15bYS16MC05XFwtXFxfXStcXDpiZWZvcmUkfGFmdGVyJHxyZXRyeSR8XFwqJC87XG4gIHdpbGRjYXJkczogc3RyaW5nW10gPSBbJyonLCAnZXJyb3InXTtcbiAgZW1wdHlGdW5jOiBGdW5jdGlvbiA9ICgpID0+IHt9O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc3RvcmUuYmVmb3JlID0ge307XG4gICAgdGhpcy5zdG9yZS5hZnRlciA9IHt9O1xuICAgIHRoaXMuc3RvcmUucmV0cnkgPSB7fTtcbiAgICB0aGlzLnN0b3JlLndpbGRjYXJkID0ge307XG4gICAgdGhpcy5zdG9yZS5lcnJvciA9IHRoaXMuZW1wdHlGdW5jO1xuICAgIHRoaXMuc3RvcmVbJyonXSA9IHRoaXMuZW1wdHlGdW5jO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBldmVudFxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gY2JcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIG9uKGtleTogc3RyaW5nLCBjYjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICBpZiAodHlwZW9mKGNiKSAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgbmV3IEVycm9yKCdFdmVudCBzaG91bGQgYmUgYW4gZnVuY3Rpb24nKTtcbiAgICBpZiAodGhpcy5pc1ZhbGlkKGtleSkpIHRoaXMuYWRkKGtleSwgY2IpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biBldmVudCB2aWEgaXQncyBrZXlcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHBhcmFtICB7QW55fSBhcmdzXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBlbWl0KGtleTogc3RyaW5nLCBhcmdzOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAodGhpcy53aWxkY2FyZHMuaW5kZXhPZihrZXkpID4gLTEpIHtcbiAgICAgIHRoaXMud2lsZGNhcmQoa2V5LCAuLi5hcmd1bWVudHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB0eXBlOiBzdHJpbmcgPSB0aGlzLmdldFR5cGUoa2V5KTtcbiAgICAgIGNvbnN0IG5hbWU6IHN0cmluZyA9IHRoaXMuZ2V0TmFtZShrZXkpO1xuXG4gICAgICBpZiAodGhpcy5zdG9yZVt0eXBlXSkge1xuICAgICAgICBjb25zdCBjYjogRnVuY3Rpb24gPSB0aGlzLnN0b3JlW3R5cGVdW25hbWVdIHx8IHRoaXMuZW1wdHlGdW5jO1xuICAgICAgICBjYi5jYWxsKG51bGwsIGFyZ3MpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMud2lsZGNhcmQoJyonLCBrZXksIGFyZ3MpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biB3aWxkY2FyZCBldmVudHNcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHBhcmFtICB7U3RyaW5nfSBhY3Rpb25LZXlcbiAgICogQHBhcmFtICB7QW55fSBhcmdzXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICB3aWxkY2FyZChrZXk6IHN0cmluZywgYWN0aW9uS2V5OiBzdHJpbmcsIGFyZ3M6IGFueSk6IHZvaWQge1xuICAgIGlmICh0aGlzLnN0b3JlLndpbGRjYXJkW2tleV0pIHtcbiAgICAgIHRoaXMuc3RvcmUud2lsZGNhcmRba2V5XS5jYWxsKG51bGwsIGFjdGlvbktleSwgYXJncyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBldmVudCB0byBzdG9yZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gY2JcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFkZChrZXk6IHN0cmluZywgY2I6IEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgaWYgKHRoaXMud2lsZGNhcmRzLmluZGV4T2Yoa2V5KSA+LTEpIHtcbiAgICAgIHRoaXMuc3RvcmUud2lsZGNhcmRba2V5XSA9IGNiO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB0eXBlOiBzdHJpbmcgPSB0aGlzLmdldFR5cGUoa2V5KTtcbiAgICAgIGNvbnN0IG5hbWU6IHN0cmluZyA9IHRoaXMuZ2V0TmFtZShrZXkpO1xuICAgICAgdGhpcy5zdG9yZVt0eXBlXVtuYW1lXSA9IGNiO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBldmVudCBpbiBzdG9yZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgaGFzKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGtleXM6IHN0cmluZ1tdID0ga2V5LnNwbGl0KCc6Jyk7XG4gICAgICByZXR1cm4ga2V5cy5sZW5ndGggPiAxID8gISEgdGhpcy5zdG9yZVtrZXlzWzFdXVtrZXlzWzBdXSA6ICEhIHRoaXMuc3RvcmUud2lsZGNhcmRba2V5c1swXV07XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBldmVudCBuYW1lIGJ5IHBhcnNlIGtleVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBnZXROYW1lKGtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4ga2V5Lm1hdGNoKC8oLiopXFw6LiovKVsxXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZXZlbnQgdHlwZSBieSBwYXJzZSBrZXlcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgZ2V0VHlwZShrZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGtleS5tYXRjaCgvXlthLXowLTlcXC1cXF9dK1xcOiguKikvKVsxXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja2VyIG9mIGV2ZW50IGtleXNcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGlzVmFsaWQoa2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy52ZXJpZmllclBhdHRlcm4udGVzdChrZXkpIHx8IHRoaXMud2lsZGNhcmRzLmluZGV4T2Yoa2V5KSA+LTE7XG4gIH1cbn1cbiIsIi8qIEBmbG93ICovXG5pbXBvcnQgeyB3YXRjaCB9IGZyb20gJ2lzLW9mZmxpbmUnO1xuaW1wb3J0IFF1ZXVlIGZyb20gJy4vcXVldWUnO1xuaW1wb3J0IHsgZXhjbHVkZVNwZWNpZmljVGFza3MsIGxvZywgaGFzTWV0aG9kLCBpc0Z1bmN0aW9uIH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgU3RvcmFnZUNhcHN1bGUgZnJvbSAnLi9zdG9yYWdlLWNhcHN1bGUnO1xuaW1wb3J0IHR5cGUgSVRhc2sgZnJvbSAnLi4vaW50ZXJmYWNlcy90YXNrJztcbmltcG9ydCB0eXBlIElKb2IgZnJvbSAnLi4vaW50ZXJmYWNlcy9qb2InO1xuaW1wb3J0IHR5cGUgSUpvYkluc3RhbmNlIGZyb20gJy4uL2ludGVyZmFjZXMvam9iJztcblxuLyoqXG4gKiBHZXQgdW5mcmVlemVkIHRhc2tzIGJ5IHRoZSBmaWx0ZXIgZnVuY3Rpb25cbiAqIENvbnRleHQ6IFF1ZXVlXG4gKlxuICogQHJldHVybiB7SVRhc2t9XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUYXNrc1dpdGhvdXRGcmVlemVkKCk6IElUYXNrIHtcbiAgcmV0dXJuIGRiXG4gICAgLmNhbGwodGhpcylcbiAgICAuYWxsKClcbiAgICAuZmlsdGVyKGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzLmJpbmQoW1wiZnJlZXplZFwiXSkpO1xufVxuXG4vKipcbiAqIFNob3J0ZW5zIGZ1bmN0aW9uIHRoZSBkYiBiZWxvbmdzdG8gY3VycmVudCBjaGFubmVsXG4gKiBDb250ZXh0OiBRdWV1ZVxuICpcbiAqIEByZXR1cm4ge1N0b3JhZ2VDYXBzdWxlfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGIoKTogU3RvcmFnZUNhcHN1bGUge1xuICByZXR1cm4gKHRoaXM6YW55KS5zdG9yYWdlLmNoYW5uZWwoKHRoaXM6YW55KS5jdXJyZW50Q2hhbm5lbCk7XG59XG5cbi8qKlxuICogTG9nIHByb3h5IGhlbHBlclxuICogQ29udGV4dDogUXVldWVcbiAqXG4gKiBAcmV0dXJuIHt2b2lkfVxuICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICogQHBhcmFtIHtzdHJpbmd9IGRhdGFcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gY29uZFxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9nUHJveHkoa2V5OiBzdHJpbmcsIGRhdGE6IHN0cmluZywgY29uZDogYm9vbGVhbiA9IHRydWUpOiB2b2lkIHtcbiAgbG9nLmNhbGwoXG4gICAgLy8gZGVidWcgbW9kZSBzdGF0dXNcbiAgICAodGhpczphbnkpLmNvbmZpZy5nZXQoJ2RlYnVnJyksXG5cbiAgICAvLyBsb2cgYXJndW1lbnRzXG4gICAgLi4uYXJndW1lbnRzXG4gICk7XG59XG5cbi8qKlxuICogTmV3IHRhc2sgc2F2ZSBoZWxwZXJcbiAqIENvbnRleHQ6IFF1ZXVlXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHJldHVybiB7c3RyaW5nfGJvb2xlYW59XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzYXZlVGFzayh0YXNrOiBJVGFzayk6IHN0cmluZyB8IGJvb2xlYW4ge1xuICByZXR1cm4gZGIuY2FsbCh0aGlzKS5zYXZlKGNoZWNrUHJpb3JpdHkodGFzaykpO1xufVxuXG4vKipcbiAqIFRhc2sgcmVtb3ZlIGhlbHBlclxuICogQ29udGV4dDogUXVldWVcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gaWRcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVUYXNrKGlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIGRiLmNhbGwodGhpcykuZGVsZXRlKGlkKTtcbn1cblxuLyoqXG4gKiBFdmVudHMgZGlzcGF0Y2hlciBoZWxwZXJcbiAqIENvbnRleHQ6IFF1ZXVlXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAqIEByZXR1cm4ge3ZvaWR9XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXNwYXRjaEV2ZW50cyh0YXNrOiBJVGFzaywgdHlwZTogc3RyaW5nKTogYm9vbGVhbnx2b2lkIHtcbiAgaWYgKCEgKFwidGFnXCIgaW4gdGFzaykpIHJldHVybiBmYWxzZTtcbiAgY29uc3QgZXZlbnRzID0gW1xuICAgIFtgJHt0YXNrLnRhZ306JHt0eXBlfWAsICdmaXJlZCddLFxuICAgIFtgJHt0YXNrLnRhZ306KmAsICd3aWxkY2FyZC1maXJlZCddXG4gIF07XG5cbiAgZm9yIChjb25zdCBldmVudCBvZiBldmVudHMpIHtcbiAgICB0aGlzLmV2ZW50LmVtaXQoZXZlbnRbMF0sIHRhc2spO1xuICAgIGxvZ1Byb3h5LmNhbGwoKHRoaXM6YW55KSwgYGV2ZW50LiR7ZXZlbnRbMV19YCwgZXZlbnRbMF0pO1xuICB9XG59XG5cbi8qKlxuICogVGFzayBwcmlvcml0eSBjb250cm9sbGVyIGhlbHBlclxuICogQ29udGV4dDogUXVldWVcbiAqXG4gKiBAcmV0dXJuIHtJVGFza31cbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrUHJpb3JpdHkodGFzazogSVRhc2spOiBJVGFzayB7XG4gIHRhc2sucHJpb3JpdHkgPSB0YXNrLnByaW9yaXR5IHx8IDA7XG5cbiAgaWYgKGlzTmFOKHRhc2sucHJpb3JpdHkpKSB0YXNrLnByaW9yaXR5ID0gMDtcblxuICByZXR1cm4gdGFzaztcbn1cblxuLyoqXG4gKiBUaW1lb3V0IGNyZWF0b3IgaGVscGVyXG4gKiBDb250ZXh0OiBRdWV1ZVxuICpcbiAqIEByZXR1cm4ge251bWJlcn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRpbWVvdXQoKTogbnVtYmVyIHtcbiAgLy8gaWYgcnVubmluZyBhbnkgam9iLCBzdG9wIGl0XG4gIC8vIHRoZSBwdXJwb3NlIGhlcmUgaXMgdG8gcHJldmVudCBjb2N1cnJlbnQgb3BlcmF0aW9uIGluIHNhbWUgY2hhbm5lbFxuICBjbGVhclRpbWVvdXQodGhpcy5jdXJyZW50VGltZW91dCk7XG5cbiAgY29uc3QgdGFzazogSVRhc2sgPSBkYi5jYWxsKHRoaXMpLmZldGNoKCkuc2hpZnQoKTtcblxuICBpZiAodGFzayA9PT0gdW5kZWZpbmVkKSB7XG4gICAgbG9nUHJveHkuY2FsbCh0aGlzLCAncXVldWUuZW1wdHknLCB0aGlzLmN1cnJlbnRDaGFubmVsKTtcbiAgICBzdG9wUXVldWUuY2FsbCh0aGlzKTtcbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIGlmICghIHRoaXMuY29udGFpbmVyLmhhcyh0YXNrLmhhbmRsZXIpKSB7XG4gICAgbG9nUHJveHkuY2FsbCh0aGlzLCAncXVldWUubm90LWZvdW5kJywgdGFzay5oYW5kbGVyKTtcbiAgICBmYWlsZWRKb2JIYW5kbGVyLmNhbGwodGhpcywgdGFzaykuY2FsbCgpO1xuICAgIHJldHVybiAxO1xuICB9XG5cbiAgY29uc3Qgam9iOiBJSm9iID0gdGhpcy5jb250YWluZXIuZ2V0KHRhc2suaGFuZGxlcik7XG4gIGNvbnN0IGpvYkluc3RhbmNlOiBJSm9iSW5zdGFuY2UgPSBuZXcgam9iLmhhbmRsZXIoKTtcblxuICAvLyBnZXQgYWx3YXlzIGxhc3QgdXBkYXRlZCBjb25maWcgdmFsdWVcbiAgY29uc3QgdGltZW91dDogbnVtYmVyID0gam9iSW5zdGFuY2UudGltZW91dCB8fCB0aGlzLmNvbmZpZy5nZXQoXCJ0aW1lb3V0XCIpO1xuXG4gIGNvbnN0IGhhbmRsZXI6IEZ1bmN0aW9uID0gbG9vcEhhbmRsZXIuY2FsbCh0aGlzLCB0YXNrLCBqb2IsIGpvYkluc3RhbmNlKS5iaW5kKHRoaXMpO1xuXG4gIC8vIGNyZWF0ZSBuZXcgdGltZW91dCBmb3IgcHJvY2VzcyBhIGpvYiBpbiBxdWV1ZVxuICAvLyBiaW5kaW5nIGxvb3BIYW5kbGVyIGZ1bmN0aW9uIHRvIHNldFRpbWVvdXRcbiAgLy8gdGhlbiByZXR1cm4gdGhlIHRpbWVvdXQgaW5zdGFuY2VcbiAgcmV0dXJuICh0aGlzLmN1cnJlbnRUaW1lb3V0ID0gc2V0VGltZW91dChoYW5kbGVyLCB0aW1lb3V0KSk7XG59XG5cbi8qKlxuICogSm9iIGhhbmRsZXIgaGVscGVyXG4gKiBDb250ZXh0OiBRdWV1ZVxuICpcbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqIEBwYXJhbSB7SUpvYn0gam9iXG4gKiBAcGFyYW0ge0lKb2JJbnN0YW5jZX0gam9iSW5zdGFuY2VcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9vcEhhbmRsZXIodGFzazogSVRhc2ssIGpvYjogSUpvYiwgam9iSW5zdGFuY2U6IElKb2JJbnN0YW5jZSk6IEZ1bmN0aW9uIHtcbiAgcmV0dXJuICgpOiB2b2lkID0+IHtcbiAgICBjb25zdCBzZWxmOiBRdWV1ZSA9IHRoaXM7XG5cbiAgICAvLyBsb2NrIHRoZSBjdXJyZW50IHRhc2sgZm9yIHByZXZlbnQgcmFjZSBjb25kaXRpb25cbiAgICBsb2NrVGFzay5jYWxsKHNlbGYsIHRhc2spO1xuXG4gICAgLy8gZmlyZSBqb2IgYmVmb3JlIGV2ZW50XG4gICAgZmlyZUpvYklubGluZUV2ZW50LmNhbGwodGhpcywgXCJiZWZvcmVcIiwgam9iSW5zdGFuY2UsIHRhc2suYXJncyk7XG5cbiAgICAvLyBkaXNwYWN0aCBjdXN0b20gYmVmb3JlIGV2ZW50XG4gICAgZGlzcGF0Y2hFdmVudHMuY2FsbCh0aGlzLCB0YXNrLCBcImJlZm9yZVwiKTtcblxuICAgIC8vIHByZXBhcmluZyB3b3JrZXIgZGVwZW5kZW5jaWVzXG4gICAgY29uc3QgZGVwZW5kZW5jaWVzID0gT2JqZWN0LnZhbHVlcyhqb2IuZGVwcyB8fCB7fSk7XG5cbiAgICAvLyBUYXNrIHJ1bm5lciBwcm9taXNlXG4gICAgam9iSW5zdGFuY2UuaGFuZGxlXG4gICAgICAuY2FsbChqb2JJbnN0YW5jZSwgdGFzay5hcmdzLCAuLi5kZXBlbmRlbmNpZXMpXG4gICAgICAudGhlbihzdWNjZXNzSm9iSGFuZGxlci5jYWxsKHNlbGYsIHRhc2ssIGpvYkluc3RhbmNlKS5iaW5kKHNlbGYpKVxuICAgICAgLmNhdGNoKGZhaWxlZEpvYkhhbmRsZXIuY2FsbChzZWxmLCB0YXNrLCBqb2JJbnN0YW5jZSkuYmluZChzZWxmKSk7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgb2YgdGhlIGxvY2sgdGFzayBvZiB0aGUgY3VycmVudCBqb2JcbiAqIENvbnRleHQ6IFF1ZXVlXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvY2tUYXNrKHRhc2s6IElUYXNrKTogYm9vbGVhbiB7XG4gIHJldHVybiBkYi5jYWxsKHRoaXMpLnVwZGF0ZSh0YXNrLl9pZCwgeyBsb2NrZWQ6IHRydWUgfSk7XG59XG5cbi8qKlxuICogUXVldWUgc3RvcHBlciBoZWxwZXJcbiAqIENvbnRleHQ6IFF1ZXVlXG4gKlxuICogQHJldHVybiB7dm9pZH1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0b3BRdWV1ZSgpOiB2b2lkIHtcbiAgdGhpcy5zdG9wKCk7XG5cbiAgY2xlYXJUaW1lb3V0KHRoaXMuY3VycmVudFRpbWVvdXQpO1xuXG4gIGxvZ1Byb3h5LmNhbGwodGhpcywgJ3F1ZXVlLnN0b3BwZWQnLCAnc3RvcCcpO1xufVxuXG4vKipcbiAqIENsYXNzIGV2ZW50IGx1YW5jaGVyIGhlbHBlclxuICogQ29udGV4dDogUXVldWVcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtJSm9iSW5zdGFuY2V9IGpvYlxuICogQHBhcmFtIHthbnl9IGFyZ3NcbiAqIEByZXR1cm4ge2Jvb2xlYW58dm9pZH1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpcmVKb2JJbmxpbmVFdmVudChuYW1lOiBzdHJpbmcsIGpvYjogSUpvYkluc3RhbmNlLCBhcmdzOiBhbnkpOiBib29sZWFufHZvaWQge1xuICBpZiAoIWhhc01ldGhvZChqb2IsIG5hbWUpKSByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKG5hbWUgPT0gXCJiZWZvcmVcIiAmJiBpc0Z1bmN0aW9uKGpvYi5iZWZvcmUpKSB7XG4gICAgam9iLmJlZm9yZS5jYWxsKGpvYiwgYXJncyk7XG4gIH0gZWxzZSBpZiAobmFtZSA9PSBcImFmdGVyXCIgJiYgaXNGdW5jdGlvbihqb2IuYWZ0ZXIpKSB7XG4gICAgam9iLmFmdGVyLmNhbGwoam9iLCBhcmdzKTtcbiAgfVxufVxuXG4vKipcbiAqIFN1Y2NlZWQgam9iIGhhbmRsZXJcbiAqIENvbnRleHQ6IFF1ZXVlXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHBhcmFtIHtJSm9iSW5zdGFuY2V9IGpvYlxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdWNjZXNzSm9iSGFuZGxlcih0YXNrOiBJVGFzaywgam9iOiBJSm9iSW5zdGFuY2UpOiBGdW5jdGlvbiB7XG4gIGNvbnN0IHNlbGY6IFF1ZXVlID0gdGhpcztcbiAgcmV0dXJuIGZ1bmN0aW9uKHJlc3VsdDogYm9vbGVhbik6IHZvaWQge1xuICAgIC8vIGRpc3BhdGNoIGpvYiBwcm9jZXNzIGFmdGVyIHJ1bnMgYSB0YXNrIGJ1dCBvbmx5IG5vbiBlcnJvciBqb2JzXG4gICAgZGlzcGF0Y2hQcm9jZXNzLmNhbGwoc2VsZiwgcmVzdWx0LCB0YXNrLCBqb2IpO1xuXG4gICAgLy8gZmlyZSBqb2IgYWZ0ZXIgZXZlbnRcbiAgICBmaXJlSm9iSW5saW5lRXZlbnQuY2FsbChzZWxmLCBcImFmdGVyXCIsIGpvYiwgdGFzay5hcmdzKTtcblxuICAgIC8vIGRpc3BhY3RoIGN1c3RvbSBhZnRlciBldmVudFxuICAgIGRpc3BhdGNoRXZlbnRzLmNhbGwoc2VsZiwgdGFzaywgXCJhZnRlclwiKTtcblxuICAgIC8vIHRyeSBuZXh0IHF1ZXVlIGpvYlxuICAgIHNlbGYubmV4dCgpO1xuICB9O1xufVxuXG4vKipcbiAqIEZhaWxlZCBqb2IgaGFuZGxlclxuICogQ29udGV4dDogUXVldWVcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcmV0dXJuIHtJVGFza30gam9iXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZhaWxlZEpvYkhhbmRsZXIodGFzazogSVRhc2ssIGpvYj86IElKb2JJbnN0YW5jZSk6IEZ1bmN0aW9uIHtcbiAgcmV0dXJuIChyZXN1bHQ6IGJvb2xlYW4pOiB2b2lkID0+IHtcbiAgICByZW1vdmVUYXNrLmNhbGwodGhpcywgdGFzay5faWQpO1xuXG4gICAgdGhpcy5ldmVudC5lbWl0KFwiZXJyb3JcIiwgdGFzayk7XG5cbiAgICB0aGlzLm5leHQoKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBub24tZXJyb3Igam9iIHByb2Nlc3MgYWZ0ZXIgcnVuc1xuICogQ29udGV4dDogUXVldWVcbiAqXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHJlc3VsdFxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHBhcmFtIHtJSm9iSW5zdGFuY2V9IGpvYlxuICogQHJldHVybiB7dm9pZH1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpc3BhdGNoUHJvY2VzcyhyZXN1bHQ6IGJvb2xlYW4sIHRhc2s6IElUYXNrLCBqb2I6IElKb2IpOiB2b2lkIHtcbiAgY29uc3Qgc2VsZjogUXVldWUgPSB0aGlzO1xuICBpZiAocmVzdWx0KSB7XG4gICAgc3VjY2Vzc1Byb2Nlc3MuY2FsbChzZWxmLCB0YXNrLCBqb2IpO1xuICB9IGVsc2Uge1xuICAgIHJldHJ5UHJvY2Vzcy5jYWxsKHNlbGYsIHRhc2ssIGpvYik7XG4gIH1cbn1cblxuLyoqXG4gKiBQcm9jZXNzIGhhbmRsZXIgb2Ygc3VjY2VlZGVkIGpvYlxuICogQ29udGV4dDogUXVldWVcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcGFyYW0ge0lKb2JJbnN0YW5jZX0gam9iXG4gKiBAcmV0dXJuIHt2b2lkfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3VjY2Vzc1Byb2Nlc3ModGFzazogSVRhc2ssIGpvYjogSUpvYkluc3RhbmNlKTogdm9pZCB7XG4gIHJlbW92ZVRhc2suY2FsbCh0aGlzLCB0YXNrLl9pZCk7XG59XG5cbi8qKlxuICogUHJvY2VzcyBoYW5kbGVyIG9mIHN1Y2NlZWRlZCBqb2JcbiAqIENvbnRleHQ6IFF1ZXVlXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHBhcmFtIHtJSm9iSW5zdGFuY2V9IGpvYlxuICogQHJldHVybiB7dm9pZH1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXR1c09mZigpOiB2b2lkIHtcbiAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG59XG5cbi8qKlxuICogUHJvY2VzcyBoYW5kbGVyIG9mIHJldHJpZWQgam9iXG4gKiBDb250ZXh0OiBRdWV1ZVxuICpcbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqIEBwYXJhbSB7SUpvYkluc3RhbmNlfSBqb2JcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXRyeVByb2Nlc3ModGFzazogSVRhc2ssIGpvYjogSUpvYkluc3RhbmNlKTogYm9vbGVhbiB7XG4gIC8vIGRpc3BhY3RoIGN1c3RvbSByZXRyeSBldmVudFxuICBkaXNwYXRjaEV2ZW50cy5jYWxsKHRoaXMsIHRhc2ssIFwicmV0cnlcIik7XG5cbiAgLy8gdXBkYXRlIHJldHJ5IHZhbHVlXG4gIGxldCB1cGRhdGVUYXNrOiBJVGFzayA9IHVwZGF0ZVJldHJ5LmNhbGwodGhpcywgdGFzaywgam9iKTtcblxuICAvLyBkZWxldGUgbG9jayBwcm9wZXJ0eSBmb3IgbmV4dCBwcm9jZXNzXG4gIHVwZGF0ZVRhc2subG9ja2VkID0gZmFsc2U7XG5cbiAgcmV0dXJuIGRiLmNhbGwodGhpcykudXBkYXRlKHRhc2suX2lkLCB1cGRhdGVUYXNrKTtcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciBhIHRhc2sgaXMgcmVwbGljYWJsZSBvciBub3RcbiAqIENvbnRleHQ6IFF1ZXVlXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhbk11bHRpcGxlKHRhc2s6IElUYXNrKTogYm9vbGVhbiB7XG4gIGlmICh0eXBlb2YgdGFzayAhPT0gXCJvYmplY3RcIiB8fCB0YXNrLnVuaXF1ZSAhPT0gdHJ1ZSkgcmV0dXJuIHRydWU7XG5cbiAgcmV0dXJuIHRoaXMuaGFzQnlUYWcodGFzay50YWcpIDwgMTtcbn1cblxuLyoqXG4gKiBVcGRhdGUgdGFzaydzIHJldHJ5IHZhbHVlXG4gKiBDb250ZXh0OiBRdWV1ZVxuICpcbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqIEBwYXJhbSB7SUpvYkluc3RhbmNlfSBqb2JcbiAqIEByZXR1cm4ge0lUYXNrfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlUmV0cnkodGFzazogSVRhc2ssIGpvYjogSUpvYkluc3RhbmNlKTogSVRhc2sge1xuICBpZiAoIShcInJldHJ5XCIgaW4gam9iKSkgam9iLnJldHJ5ID0gMTtcblxuICBpZiAoIShcInRyaWVkXCIgaW4gdGFzaykpIHtcbiAgICB0YXNrLnRyaWVkID0gMDtcbiAgICB0YXNrLnJldHJ5ID0gam9iLnJldHJ5O1xuICB9XG5cbiAgKyt0YXNrLnRyaWVkO1xuXG4gIGlmICh0YXNrLnRyaWVkID49IGpvYi5yZXRyeSkge1xuICAgIHRhc2suZnJlZXplZCA9IHRydWU7XG4gIH1cblxuICByZXR1cm4gdGFzaztcbn1cblxuLyoqXG4gKiBKb2IgaGFuZGxlciBjbGFzcyByZWdpc3RlclxuICogQ29udGV4dDogUXVldWVcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcGFyYW0ge0lKb2JJbnN0YW5jZX0gam9iXG4gKiBAcmV0dXJuIHt2b2lkfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJKb2JzKCk6IHZvaWQge1xuICBpZiAoUXVldWUuaXNSZWdpc3RlcmVkKSByZXR1cm47XG5cbiAgY29uc3Qgam9iczogSUpvYltdID0gUXVldWUuam9icyB8fCBbXTtcblxuICBmb3IgKGNvbnN0IGpvYiBvZiBqb2JzKSB7XG4gICAgY29uc3QgZnVuY1N0ciA9IGpvYi5oYW5kbGVyLnRvU3RyaW5nKCk7XG4gICAgY29uc3QgW3N0ckZ1bmN0aW9uLCBuYW1lXSA9IGZ1bmNTdHIubWF0Y2goL2Z1bmN0aW9uXFxzKFthLXpBLVpfXSspLio/Lyk7XG4gICAgaWYgKG5hbWUpIHRoaXMuY29udGFpbmVyLmJpbmQobmFtZSwgam9iKTtcbiAgfVxuXG4gIFF1ZXVlLmlzUmVnaXN0ZXJlZCA9IHRydWU7XG59XG5cbi8qKlxuICogQ2hlY2sgbmV0d29yayBhbmQgcmV0dXJuIHF1ZXVlIGF2YWliaWxpdHkgc3RhdHVzXG4gKiBDb250ZXh0OiBRdWV1ZVxuICpcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gc3RhdHVzXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tOZXR3b3JrKHN0YXR1czogYm9vbGVhbiA9IG5hdmlnYXRvci5vbkxpbmUpOiBib29sZWFuIHtcbiAgY29uc3QgbmV0d29yayA9IHRoaXMuY29uZmlnLmdldCgnbmV0d29yaycpO1xuICByZXR1cm4gISBzdGF0dXMgJiYgbmV0d29yayA/IGZhbHNlIDogdHJ1ZTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgbmV0d29yayBvYnNlcnZlciBldmVudFxuICogQ29udGV4dDogUXVldWVcbiAqXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHN0YXR1c1xuICogQHJldHVybiB7dm9pZH1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZU5ldHdvcmtFdmVudCgpOiB2b2lkIHtcbiAgaWYgKHR5cGVvZih0aGlzLm5ldHdvcmtPYnNlcnZlcikgPT09ICdmdW5jdGlvbicpIHRoaXMubmV0d29ya09ic2VydmVyKCk7XG59XG5cbi8qKlxuICogaWYgbmV0d29yayBzdGF0dXMgdHJ1ZSwgY3JlYXRlIG5ldyBuZXR3b3JrIGV2ZW50XG4gKiBDb250ZXh0OiBRdWV1ZVxuICpcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gbmV0d29ya1xuICogQHJldHVybiB7dm9pZH1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU5ldHdvcmtFdmVudChuZXR3b3JrOiBib29sZWFuKTogdm9pZCB7XG4gIGlmIChuZXR3b3JrKSB0aGlzLm5ldHdvcmtPYnNlcnZlciA9IHdhdGNoKHF1ZXVlQ3RybC5iaW5kKHRoaXMpKTtcbn1cblxuLyoqXG4gKiBRdWV1ZSBjb250cm9sbGVyIHZpYSBib29sZWFuIHZhbHVlXG4gKiBDb250ZXh0OiBRdWV1ZVxuICpcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gc3RhdHVzXG4gKiBAcmV0dXJuIHt2b2lkfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gcXVldWVDdHJsKHN0YXR1czogYm9vbGVhbik6IHZvaWQge1xuICBjb25zdCBjaGFubmVsID0gdGhpcy5jaGFubmVsc1t0aGlzLmN1cnJlbnRDaGFubmVsXTtcbiAgaWYgKHN0YXR1cykge1xuICAgIGNoYW5uZWwuZm9yY2VTdG9wKCk7XG4gICAgbG9nUHJveHkuY2FsbCh0aGlzLCAncXVldWUub2ZmbGluZScsICdvZmZsaW5lJyk7XG4gIH0gZWxzZSB7XG4gICAgc2V0VGltZW91dChjaGFubmVsLnN0YXJ0LmJpbmQodGhpcyksIDIwMDApO1xuICAgIGxvZ1Byb3h5LmNhbGwodGhpcywgJ3F1ZXVlLm9ubGluZScsICdvbmxpbmUnKTtcbiAgfVxufVxuIiwiaW1wb3J0IFF1ZXVlIGZyb20gJy4vcXVldWUnO1xuXG53aW5kb3cuUXVldWUgPSBRdWV1ZTtcblxuZXhwb3J0IGRlZmF1bHQgUXVldWU7XG4iLCIvKiBAZmxvdyAqL1xuaW1wb3J0IHR5cGUgSUNvbmZpZyBmcm9tIFwiLi4vaW50ZXJmYWNlcy9jb25maWdcIjtcbmltcG9ydCB0eXBlIElUYXNrIGZyb20gXCIuLi9pbnRlcmZhY2VzL3Rhc2tcIjtcbmltcG9ydCB0eXBlIElKb2IgZnJvbSBcIi4uL2ludGVyZmFjZXMvam9iXCI7XG5pbXBvcnQgdHlwZSBJSm9iSW5zdGFuY2UgZnJvbSBcIi4uL2ludGVyZmFjZXMvam9iXCI7XG5pbXBvcnQgTG9jYWxTdG9yYWdlIGZyb20gXCIuL3N0b3JhZ2UvbG9jYWxzdG9yYWdlXCI7XG5pbXBvcnQgQ29udGFpbmVyIGZyb20gXCIuL2NvbnRhaW5lclwiO1xuaW1wb3J0IFN0b3JhZ2VDYXBzdWxlIGZyb20gXCIuL3N0b3JhZ2UtY2Fwc3VsZVwiO1xuaW1wb3J0IENvbmZpZyBmcm9tIFwiLi9jb25maWdcIjtcbmltcG9ydCBFdmVudCBmcm9tIFwiLi9ldmVudFwiO1xuXG5pbXBvcnQge1xuICBsb2csXG4gIGNsb25lLFxuICBoYXNNZXRob2QsXG4gIGlzRnVuY3Rpb24sXG4gIGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzLFxuICB1dGlsQ2xlYXJCeVRhZ1xufSBmcm9tIFwiLi91dGlsc1wiO1xuXG5pbXBvcnQge1xuICBnZXRUYXNrc1dpdGhvdXRGcmVlemVkLFxuICBmaXJlSm9iSW5saW5lRXZlbnQsXG4gIGRpc3BhdGNoRXZlbnRzLFxuICBjcmVhdGVUaW1lb3V0LFxuICBsb29wSGFuZGxlcixcbiAgcmVnaXN0ZXJKb2JzLFxuICBjYW5NdWx0aXBsZSxcbiAgc3RvcFF1ZXVlLFxuICBzdGF0dXNPZmYsXG4gIGxvZ1Byb3h5LFxuICBzYXZlVGFzayxcbiAgY2hlY2tOZXR3b3JrLFxuICBjcmVhdGVOZXR3b3JrRXZlbnQsXG4gIHJlbW92ZU5ldHdvcmtFdmVudCxcbiAgZGJcbn0gZnJvbSAnLi9oZWxwZXJzJztcblxuXG5sZXQgUXVldWUgPSAoKCkgPT4ge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICBRdWV1ZS5GSUZPID0gXCJmaWZvXCI7XG4gIFF1ZXVlLkxJRk8gPSBcImxpZm9cIjtcblxuICBmdW5jdGlvbiBRdWV1ZShjb25maWc6IElDb25maWcpIHtcbiAgICBfY29uc3RydWN0b3IuY2FsbCh0aGlzLCBjb25maWcpO1xuICB9XG5cbiAgZnVuY3Rpb24gX2NvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgIHRoaXMuY2hhbm5lbHMgPSB7fTtcbiAgICB0aGlzLmNvbmZpZyA9IG5ldyBDb25maWcoY29uZmlnKTtcbiAgICB0aGlzLnN0b3JhZ2UgPSBuZXcgU3RvcmFnZUNhcHN1bGUoXG4gICAgICB0aGlzLmNvbmZpZyxcbiAgICAgIG5ldyBMb2NhbFN0b3JhZ2UodGhpcy5jb25maWcpXG4gICAgKTtcblxuICAgIC8vIERlZmF1bHQgam9iIHRpbWVvdXRcbiAgICB0aGlzLnRpbWVvdXQgPSB0aGlzLmNvbmZpZy5nZXQoXCJ0aW1lb3V0XCIpO1xuXG4gICAgY29uc3QgbmV0d29yayA9IHRoaXMuY29uZmlnLmdldCgnbmV0d29yaycpO1xuXG4gICAgLy8gbmV0d29yayBvYnNlcnZlclxuICAgIGNyZWF0ZU5ldHdvcmtFdmVudC5jYWxsKHRoaXMsIG5ldHdvcmspO1xuICB9XG5cbiAgUXVldWUucHJvdG90eXBlLmN1cnJlbnRDaGFubmVsO1xuICBRdWV1ZS5wcm90b3R5cGUuc3RvcHBlZCA9IHRydWU7XG4gIFF1ZXVlLnByb3RvdHlwZS5ydW5uaW5nID0gZmFsc2U7XG4gIFF1ZXVlLnByb3RvdHlwZS5ldmVudCA9IG5ldyBFdmVudDtcbiAgUXVldWUucHJvdG90eXBlLmNvbnRhaW5lciA9IG5ldyBDb250YWluZXI7XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBuZXcgam9iIHRvIGNoYW5uZWxcbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSB0YXNrXG4gICAqIEByZXR1cm4ge1N0cmluZ3xCb29sZWFufSBqb2JcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIFF1ZXVlLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbih0YXNrKTogc3RyaW5nIHwgYm9vbGVhbiB7XG4gICAgaWYgKCFjYW5NdWx0aXBsZS5jYWxsKHRoaXMsIHRhc2spKSByZXR1cm4gZmFsc2U7XG5cbiAgICBjb25zdCBpZCA9IHNhdmVUYXNrLmNhbGwodGhpcywgdGFzayk7XG5cbiAgICBpZiAoaWQgJiYgdGhpcy5zdG9wcGVkICYmIHRoaXMucnVubmluZyA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy5zdGFydCgpO1xuICAgIH1cblxuICAgIC8vIHBhc3MgYWN0aXZpdHkgdG8gdGhlIGxvZyBzZXJ2aWNlLlxuICAgIGxvZ1Byb3h5LmNhbGwodGhpcywgJ3F1ZXVlLmNyZWF0ZWQnLCB0YXNrLmhhbmRsZXIpO1xuXG4gICAgcmV0dXJuIGlkO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQcm9jZXNzIG5leHQgam9iXG4gICAqXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBRdWV1ZS5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnN0b3BwZWQpIHtcbiAgICAgIHN0YXR1c09mZi5jYWxsKHRoaXMpO1xuICAgICAgcmV0dXJuIHN0b3BRdWV1ZS5jYWxsKHRoaXMpO1xuICAgIH1cblxuICAgIGxvZ1Byb3h5LmNhbGwodGhpcywgJ3F1ZXVlLm5leHQnLCAnbmV4dCcpO1xuXG4gICAgdGhpcy5zdGFydCgpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTdGFydCBxdWV1ZSBsaXN0ZW5lclxuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufSBqb2JcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIFF1ZXVlLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCk6IGJvb2xlYW4ge1xuICAgIGlmICghIGNoZWNrTmV0d29yay5jYWxsKHRoaXMpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBTdG9wIHRoZSBxdWV1ZSBmb3IgcmVzdGFydFxuICAgIHRoaXMuc3RvcHBlZCA9IGZhbHNlO1xuXG4gICAgLy8gUmVnaXN0ZXIgdGFza3MsIGlmIG5vdCByZWdpc3RlcmVkXG4gICAgcmVnaXN0ZXJKb2JzLmNhbGwodGhpcyk7XG5cbiAgICBsb2dQcm94eS5jYWxsKHRoaXMsICdxdWV1ZS5zdGFydGluZycsICdzdGFydCcpO1xuXG4gICAgLy8gQ3JlYXRlIGEgdGltZW91dCBmb3Igc3RhcnQgcXVldWVcbiAgICB0aGlzLnJ1bm5pbmcgPSBjcmVhdGVUaW1lb3V0LmNhbGwodGhpcykgPiAwO1xuXG4gICAgcmV0dXJuIHRoaXMucnVubmluZztcbiAgfTtcblxuICAvKipcbiAgICogU3RvcCBxdWV1ZSBsaXN0ZW5lciBhZnRlciBlbmQgb2YgY3VycmVudCB0YXNrXG4gICAqXG4gICAqIEByZXR1cm4ge1ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBRdWV1ZS5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCk6IHZvaWQge1xuICAgIGxvZ1Byb3h5LmNhbGwodGhpcywgJ3F1ZXVlLnN0b3BwaW5nJywgJ3N0b3AnKTtcbiAgICB0aGlzLnN0b3BwZWQgPSB0cnVlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTdG9wIHF1ZXVlIGxpc3RlbmVyIGluY2x1ZGluZyBjdXJyZW50IHRhc2tcbiAgICpcbiAgICogQHJldHVybiB7Vm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIFF1ZXVlLnByb3RvdHlwZS5mb3JjZVN0b3AgPSBmdW5jdGlvbigpOiB2b2lkIHtcbiAgICBzdG9wUXVldWUuY2FsbCh0aGlzKTtcbiAgfTtcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGNoYW5uZWxcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSB0YXNrXG4gICAqIEByZXR1cm4ge1F1ZXVlfSBjaGFubmVsXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBRdWV1ZS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oY2hhbm5lbDogc3RyaW5nKTogUXVldWUge1xuICAgIGlmICghKGNoYW5uZWwgaW4gdGhpcy5jaGFubmVscykpIHtcbiAgICAgIHRoaXMuY3VycmVudENoYW5uZWwgPSBjaGFubmVsO1xuICAgICAgdGhpcy5jaGFubmVsc1tjaGFubmVsXSA9IGNsb25lKHRoaXMpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmNoYW5uZWxzW2NoYW5uZWxdO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZXQgY2hhbm5lbCBpbnN0YW5jZSBieSBjaGFubmVsIG5hbWVcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm4ge1F1ZXVlfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgUXVldWUucHJvdG90eXBlLmNoYW5uZWwgPSBmdW5jdGlvbihuYW1lOiBzdHJpbmcpOiBRdWV1ZSB7XG4gICAgaWYgKCF0aGlzLmNoYW5uZWxzW25hbWVdKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENoYW5uZWwgb2YgXCIke25hbWV9XCIgbm90IGZvdW5kYCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuY2hhbm5lbHNbbmFtZV07XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgdGhlcmUgaXMgYW55IHRhc2tcbiAgICpcbiAgICogQHJldHVybiB7Qm9vZWxhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIFF1ZXVlLnByb3RvdHlwZS5pc0VtcHR5ID0gZnVuY3Rpb24oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY291bnQoKSA8IDE7XG4gIH07XG5cbiAgLyoqXG4gICAqIEdldCB0YXNrIGNvdW50XG4gICAqXG4gICAqIEByZXR1cm4ge051bWJlcn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIFF1ZXVlLnByb3RvdHlwZS5jb3VudCA9IGZ1bmN0aW9uKCk6IEFycmF5PElUYXNrPiB7XG4gICAgcmV0dXJuIGdldFRhc2tzV2l0aG91dEZyZWV6ZWQuY2FsbCh0aGlzKS5sZW5ndGg7XG4gIH07XG5cbiAgLyoqXG4gICAqIEdldCB0YXNrIGNvdW50IGJ5IHRhZ1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHRhZ1xuICAgKiBAcmV0dXJuIHtBcnJheTxJVGFzaz59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBRdWV1ZS5wcm90b3R5cGUuY291bnRCeVRhZyA9IGZ1bmN0aW9uKHRhZzogc3RyaW5nKTogQXJyYXk8SVRhc2s+IHtcbiAgICByZXR1cm4gZ2V0VGFza3NXaXRob3V0RnJlZXplZC5jYWxsKHRoaXMpLmZpbHRlcih0ID0+IHQudGFnID09PSB0YWcpLmxlbmd0aDtcbiAgfTtcblxuICAvKipcbiAgICogUmVtb3ZlIGFsbCB0YXNrcyBmcm9tIGNoYW5uZWxcbiAgICpcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIFF1ZXVlLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCk6IGJvb2xlYW4ge1xuICAgIGlmICghIHRoaXMuY3VycmVudENoYW5uZWwpIHJldHVybiBmYWxzZTtcbiAgICB0aGlzLnN0b3JhZ2UuY2xlYXIodGhpcy5jdXJyZW50Q2hhbm5lbCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbGwgdGFza3MgZnJvbSBjaGFubmVsIGJ5IHRhZ1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHRhZ1xuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgUXVldWUucHJvdG90eXBlLmNsZWFyQnlUYWcgPSBmdW5jdGlvbih0YWc6IHN0cmluZyk6IHZvaWQge1xuICAgIGRiXG4gICAgICAuY2FsbCh0aGlzKVxuICAgICAgLmFsbCgpXG4gICAgICAuZmlsdGVyKHV0aWxDbGVhckJ5VGFnLmJpbmQodGFnKSlcbiAgICAgIC5mb3JFYWNoKHQgPT4gZGIuY2FsbCh0aGlzKS5kZWxldGUodC5faWQpKTtcbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2sgYSB0YXNrIHdoZXRoZXIgZXhpc3RzIGJ5IGpvYiBpZFxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHRhZ1xuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgUXVldWUucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uKGlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZ2V0VGFza3NXaXRob3V0RnJlZXplZC5jYWxsKHRoaXMpLmZpbmRJbmRleCh0ID0+IHQuX2lkID09PSBpZCkgPiAtMTtcbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2sgYSB0YXNrIHdoZXRoZXIgZXhpc3RzIGJ5IHRhZ1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHRhZ1xuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgUXVldWUucHJvdG90eXBlLmhhc0J5VGFnID0gZnVuY3Rpb24odGFnOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZ2V0VGFza3NXaXRob3V0RnJlZXplZC5jYWxsKHRoaXMpLmZpbmRJbmRleCh0ID0+IHQudGFnID09PSB0YWcpID4gLTE7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNldCBjb25maWcgdGltZW91dCB2YWx1ZVxuICAgKlxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHZhbFxuICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgUXVldWUucHJvdG90eXBlLnNldFRpbWVvdXQgPSBmdW5jdGlvbih2YWw6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMudGltZW91dCA9IHZhbDtcbiAgICB0aGlzLmNvbmZpZy5zZXQoXCJ0aW1lb3V0XCIsIHZhbCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNldCBjb25maWcgbGltaXQgdmFsdWVcbiAgICpcbiAgICogQHBhcmFtICB7TnVtYmVyfSB2YWxcbiAgICogQHJldHVybiB7Vm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIFF1ZXVlLnByb3RvdHlwZS5zZXRMaW1pdCA9IGZ1bmN0aW9uKHZhbDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5jb25maWcuc2V0KFwibGltaXRcIiwgdmFsKTtcbiAgfTtcblxuICAvKipcbiAgICogU2V0IGNvbmZpZyBwcmVmaXggdmFsdWVcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSB2YWxcbiAgICogQHJldHVybiB7Vm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIFF1ZXVlLnByb3RvdHlwZS5zZXRQcmVmaXggPSBmdW5jdGlvbih2YWw6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuY29uZmlnLnNldChcInByZWZpeFwiLCB2YWwpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTZXQgY29uZmlnIHByaWNpcGxlIHZhbHVlXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gdmFsXG4gICAqIEByZXR1cm4ge1ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBRdWV1ZS5wcm90b3R5cGUuc2V0UHJpbmNpcGxlID0gZnVuY3Rpb24odmFsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmNvbmZpZy5zZXQoXCJwcmluY2lwbGVcIiwgdmFsKTtcbiAgfTtcblxuICAvKipcbiAgICogU2V0IGNvbmZpZyBkZWJ1ZyB2YWx1ZVxuICAgKlxuICAgKiBAcGFyYW0gIHtCb29sZWFufSB2YWxcbiAgICogQHJldHVybiB7Vm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIFF1ZXVlLnByb3RvdHlwZS5zZXREZWJ1ZyA9IGZ1bmN0aW9uKHZhbDogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuY29uZmlnLnNldChcImRlYnVnXCIsIHZhbCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNldCBjb25maWcgbmV0d29yayB2YWx1ZVxuICAgKlxuICAgKiBAcGFyYW0gIHtCb29sZWFufSB2YWxcbiAgICogQHJldHVybiB7Vm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIFF1ZXVlLnByb3RvdHlwZS5zZXROZXR3b3JrID0gZnVuY3Rpb24odmFsOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5jb25maWcuc2V0KFwibmV0d29ya1wiLCB2YWwpO1xuXG4gICAgLy8gY2xlYXIgbmV0d29yayBldmVudCBpZiBpdCBleGlzdHNcbiAgICByZW1vdmVOZXR3b3JrRXZlbnQuY2FsbCh0aGlzKTtcblxuICAgIC8vIGlmIHZhbHVlIHRydWUsIGNyZWF0ZSBuZXcgbmV0d29yayBldmVudFxuICAgIGNyZWF0ZU5ldHdvcmtFdmVudC5jYWxsKHRoaXMsIHZhbCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNldCBhY3Rpb24gZXZlbnRzXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjYlxuICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgUXVldWUucHJvdG90eXBlLm9uID0gZnVuY3Rpb24oa2V5OiBzdHJpbmcsIGNiOiBGdW5jdGlvbik6IHZvaWQge1xuICAgIHRoaXMuZXZlbnQub24oLi4uYXJndW1lbnRzKTtcbiAgICBsb2dQcm94eS5jYWxsKHRoaXMsICdldmVudC5jcmVhdGVkJywga2V5KTtcbiAgfTtcblxuICAvKipcbiAgICogUmVnaXN0ZXIgd29ya2VyXG4gICAqXG4gICAqIEBwYXJhbSAge0FycmF5PElKb2I+fSBqb2JzXG4gICAqIEByZXR1cm4ge1ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBRdWV1ZS5yZWdpc3RlciA9IGZ1bmN0aW9uKGpvYnM6IEFycmF5PElKb2I+KTogdm9pZCB7XG4gICAgaWYgKCEoam9icyBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUXVldWUgam9icyBzaG91bGQgYmUgb2JqZWN0cyB3aXRoaW4gYW4gYXJyYXlcIik7XG4gICAgfVxuXG4gICAgUXVldWUuaXNSZWdpc3RlcmVkID0gZmFsc2U7XG4gICAgUXVldWUuam9icyA9IGpvYnM7XG4gIH07XG5cbiAgcmV0dXJuIFF1ZXVlO1xufSkoKTtcblxuZXhwb3J0IGRlZmF1bHQgUXVldWU7XG4iLCIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgZ3JvdXBCeSBmcm9tIFwiZ3JvdXAtYnlcIjtcbmltcG9ydCBMb2NhbFN0b3JhZ2UgZnJvbSBcIi4vc3RvcmFnZS9sb2NhbHN0b3JhZ2VcIjtcbmltcG9ydCB0eXBlIElDb25maWcgZnJvbSBcIi4uL2ludGVyZmFjZXMvY29uZmlnXCI7XG5pbXBvcnQgdHlwZSBJU3RvcmFnZSBmcm9tIFwiLi4vaW50ZXJmYWNlcy9zdG9yYWdlXCI7XG5pbXBvcnQgdHlwZSBJVGFzayBmcm9tIFwiLi4vaW50ZXJmYWNlcy90YXNrXCI7XG5pbXBvcnQgQ29uZmlnIGZyb20gXCIuL2NvbmZpZ1wiO1xuaW1wb3J0IHsgZXhjbHVkZVNwZWNpZmljVGFza3MsIGxpZm8sIGZpZm8gfSBmcm9tIFwiLi91dGlsc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdG9yYWdlQ2Fwc3VsZSB7XG4gIGNvbmZpZzogSUNvbmZpZztcbiAgc3RvcmFnZTogSVN0b3JhZ2U7XG4gIHN0b3JhZ2VDaGFubmVsOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBJQ29uZmlnLCBzdG9yYWdlOiBJU3RvcmFnZSkge1xuICAgIHRoaXMuc3RvcmFnZSA9IHN0b3JhZ2U7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gIH1cblxuICAvKipcbiAgICogU2VsZWN0IGEgY2hhbm5lbCBieSBjaGFubmVsIG5hbWVcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm4ge1N0b3JhZ2VDYXBzdWxlfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgY2hhbm5lbChuYW1lOiBzdHJpbmcpOiBTdG9yYWdlQ2Fwc3VsZSB7XG4gICAgdGhpcy5zdG9yYWdlQ2hhbm5lbCA9IG5hbWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogRmV0Y2ggdGFza3MgZnJvbSBzdG9yYWdlIHdpdGggb3JkZXJlZFxuICAgKlxuICAgKiBAcmV0dXJuIHthbnlbXX1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGZldGNoKCk6IEFycmF5PGFueT4ge1xuICAgIGNvbnN0IGFsbCA9IHRoaXMuYWxsKCkuZmlsdGVyKGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzKTtcbiAgICBjb25zdCB0YXNrcyA9IGdyb3VwQnkoYWxsLCBcInByaW9yaXR5XCIpO1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0YXNrcylcbiAgICAgIC5tYXAoa2V5ID0+IHBhcnNlSW50KGtleSkpXG4gICAgICAuc29ydCgoYSwgYikgPT4gYiAtIGEpXG4gICAgICAucmVkdWNlKHRoaXMucmVkdWNlVGFza3ModGFza3MpLCBbXSk7XG4gIH1cblxuICAvKipcbiAgICogU2F2ZSB0YXNrIHRvIHN0b3JhZ2VcbiAgICpcbiAgICogQHBhcmFtICB7SVRhc2t9IHRhc2tcbiAgICogQHJldHVybiB7U3RyaW5nfEJvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBzYXZlKHRhc2s6IElUYXNrKTogc3RyaW5nIHwgYm9vbGVhbiB7XG4gICAgLy8gZ2V0IGFsbCB0YXNrcyBjdXJyZW50IGNoYW5uZWwnc1xuICAgIGNvbnN0IHRhc2tzOiBJVGFza1tdID0gdGhpcy5zdG9yYWdlLmdldCh0aGlzLnN0b3JhZ2VDaGFubmVsKTtcblxuICAgIC8vIENoZWNrIHRoZSBjaGFubmVsIGxpbWl0LlxuICAgIC8vIElmIGxpbWl0IGlzIGV4Y2VlZGVkLCBkb2VzIG5vdCBpbnNlcnQgbmV3IHRhc2tcbiAgICBpZiAodGhpcy5pc0V4Y2VlZGVkKCkpIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgYFRhc2sgbGltaXQgZXhjZWVkZWQ6IFRoZSAnJHtcbiAgICAgICAgICB0aGlzLnN0b3JhZ2VDaGFubmVsXG4gICAgICAgIH0nIGNoYW5uZWwgbGltaXQgaXMgJHt0aGlzLmNvbmZpZy5nZXQoXCJsaW1pdFwiKX1gXG4gICAgICApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIHByZXBhcmUgYWxsIHByb3BlcnRpZXMgYmVmb3JlIHNhdmVcbiAgICAvLyBleGFtcGxlOiBjcmVhdGVkQXQgZXRjLlxuICAgIHRhc2sgPSB0aGlzLnByZXBhcmVUYXNrKHRhc2spO1xuXG4gICAgLy8gYWRkIHRhc2sgdG8gc3RvcmFnZVxuICAgIHRhc2tzLnB1c2godGFzayk7XG5cbiAgICAvLyBzYXZlIHRhc2tzXG4gICAgdGhpcy5zdG9yYWdlLnNldCh0aGlzLnN0b3JhZ2VDaGFubmVsLCBKU09OLnN0cmluZ2lmeSh0YXNrcykpO1xuXG4gICAgcmV0dXJuIHRhc2suX2lkO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBjaGFubmVsIHN0b3JlLlxuICAgKlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqICAgVGhlIHZhbHVlLiBUaGlzIGFubm90YXRpb24gY2FuIGJlIHVzZWQgZm9yIHR5cGUgaGludGluZyBwdXJwb3Nlcy5cbiAgICovXG4gIHVwZGF0ZShpZDogc3RyaW5nLCB1cGRhdGU6IHsgW3Byb3BlcnR5OiBzdHJpbmddOiBhbnkgfSk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGRhdGE6IGFueVtdID0gdGhpcy5hbGwoKTtcbiAgICBjb25zdCBpbmRleDogbnVtYmVyID0gZGF0YS5maW5kSW5kZXgodCA9PiB0Ll9pZCA9PSBpZCk7XG5cbiAgICBpZiAoaW5kZXggPCAwKSByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBtZXJnZSBleGlzdGluZyBvYmplY3Qgd2l0aCBnaXZlbiB1cGRhdGUgb2JqZWN0XG4gICAgZGF0YVtpbmRleF0gPSBPYmplY3QuYXNzaWduKHt9LCBkYXRhW2luZGV4XSwgdXBkYXRlKTtcblxuICAgIC8vIHNhdmUgdG8gdGhlIHN0b3JhZ2UgYXMgc3RyaW5nXG4gICAgdGhpcy5zdG9yYWdlLnNldCh0aGlzLnN0b3JhZ2VDaGFubmVsLCBKU09OLnN0cmluZ2lmeShkYXRhKSk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgdGFzayBmcm9tIHN0b3JhZ2VcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBpZFxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgZGVsZXRlKGlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCBkYXRhOiBhbnlbXSA9IHRoaXMuYWxsKCk7XG4gICAgY29uc3QgaW5kZXg6IG51bWJlciA9IGRhdGEuZmluZEluZGV4KGQgPT4gZC5faWQgPT09IGlkKTtcblxuICAgIGlmIChpbmRleCA8IDApIHJldHVybiBmYWxzZTtcblxuICAgIGRlbGV0ZSBkYXRhW2luZGV4XTtcblxuICAgIHRoaXMuc3RvcmFnZS5zZXQoXG4gICAgICB0aGlzLnN0b3JhZ2VDaGFubmVsLFxuICAgICAgSlNPTi5zdHJpbmdpZnkoZGF0YS5maWx0ZXIoZCA9PiBkKSlcbiAgICApO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgdGFza3NcbiAgICpcbiAgICogQHJldHVybiB7QW55W119XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhbGwoKTogQXJyYXk8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmFnZS5nZXQodGhpcy5zdG9yYWdlQ2hhbm5lbCk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgdW5pcXVlIGlkXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGdlbmVyYXRlSWQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gKCgxICsgTWF0aC5yYW5kb20oKSkgKiAweDEwMDAwKS50b1N0cmluZygxNik7XG4gIH1cblxuICAvKipcbiAgICogQWRkIHNvbWUgbmVjZXNzYXJ5IHByb3BlcnRpZXNcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBpZFxuICAgKiBAcmV0dXJuIHtJVGFza31cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHByZXBhcmVUYXNrKHRhc2s6IElUYXNrKTogSVRhc2sge1xuICAgIHRhc2suY3JlYXRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICB0YXNrLl9pZCA9IHRoaXMuZ2VuZXJhdGVJZCgpO1xuICAgIHJldHVybiB0YXNrO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBzb21lIG5lY2Vzc2FyeSBwcm9wZXJ0aWVzXG4gICAqXG4gICAqIEBwYXJhbSAge0lUYXNrW119IHRhc2tzXG4gICAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgcmVkdWNlVGFza3ModGFza3M6IElUYXNrW10pIHtcbiAgICBjb25zdCByZWR1Y2VGdW5jID0gKHJlc3VsdDogSVRhc2tbXSwga2V5OiBhbnkpOiBJVGFza1tdID0+IHtcbiAgICAgIGlmICh0aGlzLmNvbmZpZy5nZXQoXCJwcmluY2lwbGVcIikgPT09IFwibGlmb1wiKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQuY29uY2F0KHRhc2tzW2tleV0uc29ydChsaWZvKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVzdWx0LmNvbmNhdCh0YXNrc1trZXldLnNvcnQoZmlmbykpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gcmVkdWNlRnVuYy5iaW5kKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRhc2sgbGltaXQgY2hlY2tlclxuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgaXNFeGNlZWRlZCgpOiBib29sZWFuIHtcbiAgICBjb25zdCBsaW1pdDogbnVtYmVyID0gdGhpcy5jb25maWcuZ2V0KFwibGltaXRcIik7XG4gICAgY29uc3QgdGFza3M6IElUYXNrW10gPSB0aGlzLmFsbCgpLmZpbHRlcihleGNsdWRlU3BlY2lmaWNUYXNrcyk7XG4gICAgcmV0dXJuICEobGltaXQgPT09IC0xIHx8IGxpbWl0ID4gdGFza3MubGVuZ3RoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciB0YXNrcyB3aXRoIGdpdmVuIGNoYW5uZWwgbmFtZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGNoYW5uZWxcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGNsZWFyKGNoYW5uZWw6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmFnZS5jbGVhcihjaGFubmVsKTtcbiAgfVxufVxuIiwiLyogQGZsb3cgKi9cblxuaW1wb3J0IHR5cGUgSVN0b3JhZ2UgZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9zdG9yYWdlJztcbmltcG9ydCB0eXBlIElDb25maWcgZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9zdG9yYWdlJztcbmltcG9ydCB0eXBlIElUYXNrIGZyb20gJy4uLy4uL2ludGVyZmFjZXMvdGFzayc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExvY2FsU3RvcmFnZSBpbXBsZW1lbnRzIElTdG9yYWdlIHtcbiAgc3RvcmFnZTogT2JqZWN0O1xuICBjb25maWc6IElDb25maWc7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBJQ29uZmlnKSB7XG4gICAgdGhpcy5zdG9yYWdlID0gbG9jYWxTdG9yYWdlO1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2UgaXRlbSBmcm9tIHN0b3JhZ2UgYnkga2V5XG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge0lUYXNrW119XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBnZXQoa2V5OiBzdHJpbmcpOiBBcnJheTxJVGFza3xbXT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBuYW1lID0gdGhpcy5zdG9yYWdlTmFtZShrZXkpO1xuICAgICAgcmV0dXJuIHRoaXMuaGFzKG5hbWUpID8gSlNPTi5wYXJzZSh0aGlzLnN0b3JhZ2UuZ2V0SXRlbShuYW1lKSkgOiBbXTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkIGl0ZW0gdG8gbG9jYWwgc3RvcmFnZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHZhbHVlXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBzZXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnN0b3JhZ2Uuc2V0SXRlbSh0aGlzLnN0b3JhZ2VOYW1lKGtleSksIHZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdGVtIGNoZWNrZXIgaW4gbG9jYWwgc3RvcmFnZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgaGFzKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGtleSBpbiB0aGlzLnN0b3JhZ2U7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGl0ZW1cbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGNsZWFyKGtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5zdG9yYWdlLnJlbW92ZUl0ZW0odGhpcy5zdG9yYWdlTmFtZShrZXkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYWxsIGl0ZW1zXG4gICAqXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBjbGVhckFsbCgpOiB2b2lkIHtcbiAgICB0aGlzLnN0b3JhZ2UuY2xlYXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wb3NlIHN0b3JhZ2UgbmFtZSBieSBzdWZmaXhcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBzdWZmaXhcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgc3RvcmFnZU5hbWUoc3VmZml4OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gYCR7dGhpcy5nZXRQcmVmaXgoKX1fJHtzdWZmaXh9YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgcHJlZml4IG9mIGNoYW5uZWwgc3RvcmFnZVxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBnZXRQcmVmaXgoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnLmdldCgncHJlZml4Jyk7XG4gIH1cbn1cbiIsIi8qIEBmbG93ICovXG5pbXBvcnQgb2JqIGZyb20gJ29iamVjdC1wYXRoJztcbmltcG9ydCBkZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5pbXBvcnQgdHlwZSBJVGFzayBmcm9tICcuLi9pbnRlcmZhY2VzL3Rhc2snO1xuaW1wb3J0IGxvZ0V2ZW50cyBmcm9tICcuL2VudW0vbG9nLmV2ZW50cyc7XG5cbi8qKlxuICogQ2xvbmUgY2xhc3NcbiAqXG4gKiBAcGFyYW0gIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7T2JqZWN0fVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZShvYmo6IE9iamVjdCkge1xuICB2YXIgbmV3Q2xhc3MgPSBPYmplY3QuY3JlYXRlKFxuICAgIE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopLFxuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG9iaikucmVkdWNlKChwcm9wcywgbmFtZSkgPT4ge1xuICAgICAgcHJvcHNbbmFtZV0gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iaiwgbmFtZSk7XG4gICAgICByZXR1cm4gcHJvcHM7XG4gICAgfSwge30pXG4gICk7XG5cbiAgaWYgKCEgT2JqZWN0LmlzRXh0ZW5zaWJsZShvYmopKSB7XG4gICAgT2JqZWN0LnByZXZlbnRFeHRlbnNpb25zKG5ld0NsYXNzKTtcbiAgfVxuICBpZiAoT2JqZWN0LmlzU2VhbGVkKG9iaikpIHtcbiAgICBPYmplY3Quc2VhbChuZXdDbGFzcyk7XG4gIH1cbiAgaWYgKE9iamVjdC5pc0Zyb3plbihvYmopKSB7XG4gICAgT2JqZWN0LmZyZWV6ZShuZXdDbGFzcyk7XG4gIH1cblxuICByZXR1cm4gbmV3Q2xhc3M7XG59XG5cbi8qKlxuICogQ2hlY2sgcHJvcGVydHkgaW4gb2JqZWN0XG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc1Byb3BlcnR5KG9iajogRnVuY3Rpb24sIG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgbmFtZSk7XG59XG5cbi8qKlxuICogQ2hlY2sgbWV0aG9kIGluIGluaXRpYXRlZCBjbGFzc1xuICpcbiAqIEBwYXJhbSAge0NsYXNzfSBpbnN0YW5jZVxuICogQHBhcmFtICB7U3RyaW5nfSBtZXRob2RcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc01ldGhvZChpbnN0YW5jZTogYW55LCBtZXRob2Q6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gaW5zdGFuY2UgaW5zdGFuY2VvZiBPYmplY3QgJiYgKG1ldGhvZCBpbiBpbnN0YW5jZSk7XG59XG5cbi8qKlxuICogQ2hlY2sgZnVuY3Rpb24gdHlwZVxuICpcbiAqIEBwYXJhbSAge0Z1bmN0aW9ufSBmdW5jXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0Z1bmN0aW9uKGZ1bmM6IEZ1bmN0aW9uKTogYm9vbGVhbiB7XG4gIHJldHVybiBmdW5jIGluc3RhbmNlb2YgRnVuY3Rpb247XG59XG5cbi8qKlxuICogUmVtb3ZlIHNvbWUgdGFza3MgYnkgc29tZSBjb25kaXRpb25zXG4gKlxuICogQHBhcmFtICB7RnVuY3Rpb259IGZ1bmNcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzKHRhc2s6IElUYXNrKTogYm9vbGVhbiB7XG4gIGNvbnN0IGNvbmRpdGlvbnMgPSBBcnJheS5pc0FycmF5KHRoaXMpID8gdGhpcyA6IFsnZnJlZXplZCcsICdsb2NrZWQnXTtcbiAgY29uc3QgcmVzdWx0cyA9IFtdO1xuXG4gIGZvciAoY29uc3QgYyBvZiBjb25kaXRpb25zKSB7XG4gICAgcmVzdWx0cy5wdXNoKGhhc1Byb3BlcnR5KHRhc2ssIGMpID09PSBmYWxzZSB8fCB0YXNrW2NdID09PSBmYWxzZSk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0cy5pbmRleE9mKGZhbHNlKSA+IC0xID8gZmFsc2UgOiB0cnVlO1xufVxuXG4vKipcbiAqIENsZWFyIHRhc2tzIGJ5IGl0J3MgdGFnc1xuICpcbiAqIEBwYXJhbSAge0lUYXNrfSB0YXNrXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1dGlsQ2xlYXJCeVRhZyh0YXNrOiBJVGFzayk6IGJvb2xlYW4ge1xuICBpZiAoISBleGNsdWRlU3BlY2lmaWNUYXNrcy5jYWxsKFsnbG9ja2VkJ10sIHRhc2spKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0YXNrLnRhZyA9PT0gdGhpcztcbn1cblxuLyoqXG4gKiBTb3J0IGJ5IGZpZm9cbiAqXG4gKiBAcGFyYW0gIHtJVGFza30gYVxuICogQHBhcmFtICB7SVRhc2t9IGJcbiAqIEByZXR1cm4ge0FueX1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gZmlmbyhhOiBJVGFzaywgYjogSVRhc2spOiBhbnkge1xuICByZXR1cm4gYS5jcmVhdGVkQXQgLSBiLmNyZWF0ZWRBdDtcbn1cblxuLyoqXG4gKiBTb3J0IGJ5IGxpZm9cbiAqXG4gKiBAcGFyYW0gIHtJVGFza30gYVxuICogQHBhcmFtICB7SVRhc2t9IGJcbiAqIEByZXR1cm4ge0FueX1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gbGlmbyhhOiBJVGFzaywgYjogSVRhc2spOiBhbnkge1xuICByZXR1cm4gYi5jcmVhdGVkQXQgLSBhLmNyZWF0ZWRBdDtcbn1cblxuLyoqXG4gKiBMb2cgaGVscGVyXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSAge1N0cmluZ30gZGF0YVxuICogQHBhcmFtICB7Qm9vbGVhbn0gY29uZGl0aW9uXG4gKiBAcmV0dXJuIHt2b2lkfVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2coa2V5OiBzdHJpbmcsIGRhdGE6IHN0cmluZyA9ICcnLCBjb25kaXRpb246IGJvb2xlYW4gPSB0cnVlKTogdm9pZCB7XG4gIGlmICh0aGlzICE9PSB0cnVlKSB7XG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2RlYnVnJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gZGVidWcgbW9kZSBvbiBhbHdheXNcbiAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2RlYnVnJywgJ3dvcmtlcjoqJyk7XG5cbiAgLy8gZ2V0IG5ldyBkZWJ1ZyBmdW5jdGlvbiBpbnN0YW5jZVxuICBjb25zdCBsb2cgPSBkZWJ1Zyhgd29ya2VyOiR7ZGF0YX0gLT5gKTtcblxuICAvLyB0aGUgb3V0cHV0IHB1c2ggdG8gY29uc29sZVxuICBsb2cob2JqLmdldChsb2dFdmVudHMsIGtleSkpO1xufVxuIl19
