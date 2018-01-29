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

},{"./debug":3,"_process":7}],3:[function(require,module,exports){

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

},{"ms":5}],4:[function(require,module,exports){

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
},{"to-function":8}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){

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

},{"component-props":1,"props":1}],9:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.default = {
  storage: 'localstorage',
  prefix: 'sq_jobs',
  timeout: 1000,
  limit: -1,
  principle: 'fifo',
  network: false,
  debug: true };

},{}],10:[function(require,module,exports){
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

},{"./config.data":9}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.default = {
  queue: {
    'created': 'New task created.',
    'next': 'Next task processing.',
    'starting': 'Queue listener starting.',
    'stopping': 'Queue listener stopping.',
    'stopped': 'Queue listener stopped.',
    'empty': 'channel is empty...',
    'not-found': 'job not found' },

  event: {
    'created': 'New event created',
    'fired': 'Event fired.',
    'wildcard-fired': 'Wildcard event fired.' } };

},{}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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


























registerJobs = registerJobs;var _queue = require('./queue');var _queue2 = _interopRequireDefault(_queue);var _utils = require('./utils');var _storageCapsule = require('./storage-capsule');var _storageCapsule2 = _interopRequireDefault(_storageCapsule);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {arr2[i] = arr[i];}return arr2;} else {return Array.from(arr);}} /**
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         */function registerJobs() {if (_queue2.default.isRegistered) return;var jobs = _queue2.default.jobs || [];var _iteratorNormalCompletion2 = true;var _didIteratorError2 = false;var _iteratorError2 = undefined;try {for (var _iterator2 = jobs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {var job = _step2.value;var funcStr = job.handler.toString();var _funcStr$match = funcStr.match(/function\s([a-zA-Z_]+).*?/),_funcStr$match2 = _slicedToArray(_funcStr$match, 2),strFunction = _funcStr$match2[0],name = _funcStr$match2[1];if (name) this.container.bind(name, job);}} catch (err) {_didIteratorError2 = true;_iteratorError2 = err;} finally {try {if (!_iteratorNormalCompletion2 && _iterator2.return) {_iterator2.return();}} finally {if (_didIteratorError2) {throw _iteratorError2;}}}_queue2.default.isRegistered = true;}

},{"./queue":16,"./storage-capsule":17,"./utils":19}],15:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _queue = require('./queue');var _queue2 = _interopRequireDefault(_queue);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

window.Queue = _queue2.default;exports.default = _queue2.default;

},{"./queue":16}],16:[function(require,module,exports){
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

    this.timeout = this.config.get("timeout");
  }

  Queue.prototype.currentChannel;
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
      console.log('WWEEE', id, this.stopped, this.running);
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

},{"./config":10,"./container":11,"./event":13,"./helpers":14,"./storage-capsule":17,"./storage/localstorage":18,"./utils":19}],17:[function(require,module,exports){
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

},{"./config":10,"./storage/localstorage":18,"./utils":19,"group-by":4}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
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

},{"./enum/log.events":12,"debug":2,"object-path":6}]},{},[15])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY29tcG9uZW50LXByb3BzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RlYnVnL3NyYy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2RlYnVnL3NyYy9kZWJ1Zy5qcyIsIm5vZGVfbW9kdWxlcy9ncm91cC1ieS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9vYmplY3QtcGF0aC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvdG8tZnVuY3Rpb24vaW5kZXguanMiLCJzcmMvY29uZmlnLmRhdGEuanMiLCJzcmMvY29uZmlnLmpzIiwic3JjL2NvbnRhaW5lci5qcyIsInNyYy9lbnVtL2xvZy5ldmVudHMuanMiLCJzcmMvZXZlbnQuanMiLCJzcmMvaGVscGVycy5qcyIsInNyYy9pbmRleC5qcyIsInNyYy9xdWV1ZS5qcyIsInNyYy9zdG9yYWdlLWNhcHN1bGUuanMiLCJzcmMvc3RvcmFnZS9sb2NhbHN0b3JhZ2UuanMiLCJzcmMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNuTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDak9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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Q29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogR2xvYmFsIE5hbWVzXG4gKi9cblxudmFyIGdsb2JhbHMgPSAvXFxiKEFycmF5fERhdGV8T2JqZWN0fE1hdGh8SlNPTilcXGIvZztcblxuLyoqXG4gKiBSZXR1cm4gaW1tZWRpYXRlIGlkZW50aWZpZXJzIHBhcnNlZCBmcm9tIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSBtYXAgZnVuY3Rpb24gb3IgcHJlZml4XG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdHIsIGZuKXtcbiAgdmFyIHAgPSB1bmlxdWUocHJvcHMoc3RyKSk7XG4gIGlmIChmbiAmJiAnc3RyaW5nJyA9PSB0eXBlb2YgZm4pIGZuID0gcHJlZml4ZWQoZm4pO1xuICBpZiAoZm4pIHJldHVybiBtYXAoc3RyLCBwLCBmbik7XG4gIHJldHVybiBwO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gaW1tZWRpYXRlIGlkZW50aWZpZXJzIGluIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcHJvcHMoc3RyKSB7XG4gIHJldHVybiBzdHJcbiAgICAucmVwbGFjZSgvXFwuXFx3K3xcXHcrICpcXCh8XCJbXlwiXSpcInwnW14nXSonfFxcLyhbXi9dKylcXC8vZywgJycpXG4gICAgLnJlcGxhY2UoZ2xvYmFscywgJycpXG4gICAgLm1hdGNoKC9bYS16QS1aX11cXHcqL2cpXG4gICAgfHwgW107XG59XG5cbi8qKlxuICogUmV0dXJuIGBzdHJgIHdpdGggYHByb3BzYCBtYXBwZWQgd2l0aCBgZm5gLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7QXJyYXl9IHByb3BzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbWFwKHN0ciwgcHJvcHMsIGZuKSB7XG4gIHZhciByZSA9IC9cXC5cXHcrfFxcdysgKlxcKHxcIlteXCJdKlwifCdbXiddKid8XFwvKFteL10rKVxcL3xbYS16QS1aX11cXHcqL2c7XG4gIHJldHVybiBzdHIucmVwbGFjZShyZSwgZnVuY3Rpb24oXyl7XG4gICAgaWYgKCcoJyA9PSBfW18ubGVuZ3RoIC0gMV0pIHJldHVybiBmbihfKTtcbiAgICBpZiAoIX5wcm9wcy5pbmRleE9mKF8pKSByZXR1cm4gXztcbiAgICByZXR1cm4gZm4oXyk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFJldHVybiB1bmlxdWUgYXJyYXkuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHVuaXF1ZShhcnIpIHtcbiAgdmFyIHJldCA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKH5yZXQuaW5kZXhPZihhcnJbaV0pKSBjb250aW51ZTtcbiAgICByZXQucHVzaChhcnJbaV0pO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn1cblxuLyoqXG4gKiBNYXAgd2l0aCBwcmVmaXggYHN0cmAuXG4gKi9cblxuZnVuY3Rpb24gcHJlZml4ZWQoc3RyKSB7XG4gIHJldHVybiBmdW5jdGlvbihfKXtcbiAgICByZXR1cm4gc3RyICsgXztcbiAgfTtcbn1cbiIsIi8qKlxuICogVGhpcyBpcyB0aGUgd2ViIGJyb3dzZXIgaW1wbGVtZW50YXRpb24gb2YgYGRlYnVnKClgLlxuICpcbiAqIEV4cG9zZSBgZGVidWcoKWAgYXMgdGhlIG1vZHVsZS5cbiAqL1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2RlYnVnJyk7XG5leHBvcnRzLmxvZyA9IGxvZztcbmV4cG9ydHMuZm9ybWF0QXJncyA9IGZvcm1hdEFyZ3M7XG5leHBvcnRzLnNhdmUgPSBzYXZlO1xuZXhwb3J0cy5sb2FkID0gbG9hZDtcbmV4cG9ydHMudXNlQ29sb3JzID0gdXNlQ29sb3JzO1xuZXhwb3J0cy5zdG9yYWdlID0gJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGNocm9tZVxuICAgICAgICAgICAgICAgJiYgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGNocm9tZS5zdG9yYWdlXG4gICAgICAgICAgICAgICAgICA/IGNocm9tZS5zdG9yYWdlLmxvY2FsXG4gICAgICAgICAgICAgICAgICA6IGxvY2Fsc3RvcmFnZSgpO1xuXG4vKipcbiAqIENvbG9ycy5cbiAqL1xuXG5leHBvcnRzLmNvbG9ycyA9IFtcbiAgJyMwMDAwQ0MnLCAnIzAwMDBGRicsICcjMDAzM0NDJywgJyMwMDMzRkYnLCAnIzAwNjZDQycsICcjMDA2NkZGJywgJyMwMDk5Q0MnLFxuICAnIzAwOTlGRicsICcjMDBDQzAwJywgJyMwMENDMzMnLCAnIzAwQ0M2NicsICcjMDBDQzk5JywgJyMwMENDQ0MnLCAnIzAwQ0NGRicsXG4gICcjMzMwMENDJywgJyMzMzAwRkYnLCAnIzMzMzNDQycsICcjMzMzM0ZGJywgJyMzMzY2Q0MnLCAnIzMzNjZGRicsICcjMzM5OUNDJyxcbiAgJyMzMzk5RkYnLCAnIzMzQ0MwMCcsICcjMzNDQzMzJywgJyMzM0NDNjYnLCAnIzMzQ0M5OScsICcjMzNDQ0NDJywgJyMzM0NDRkYnLFxuICAnIzY2MDBDQycsICcjNjYwMEZGJywgJyM2NjMzQ0MnLCAnIzY2MzNGRicsICcjNjZDQzAwJywgJyM2NkNDMzMnLCAnIzk5MDBDQycsXG4gICcjOTkwMEZGJywgJyM5OTMzQ0MnLCAnIzk5MzNGRicsICcjOTlDQzAwJywgJyM5OUNDMzMnLCAnI0NDMDAwMCcsICcjQ0MwMDMzJyxcbiAgJyNDQzAwNjYnLCAnI0NDMDA5OScsICcjQ0MwMENDJywgJyNDQzAwRkYnLCAnI0NDMzMwMCcsICcjQ0MzMzMzJywgJyNDQzMzNjYnLFxuICAnI0NDMzM5OScsICcjQ0MzM0NDJywgJyNDQzMzRkYnLCAnI0NDNjYwMCcsICcjQ0M2NjMzJywgJyNDQzk5MDAnLCAnI0NDOTkzMycsXG4gICcjQ0NDQzAwJywgJyNDQ0NDMzMnLCAnI0ZGMDAwMCcsICcjRkYwMDMzJywgJyNGRjAwNjYnLCAnI0ZGMDA5OScsICcjRkYwMENDJyxcbiAgJyNGRjAwRkYnLCAnI0ZGMzMwMCcsICcjRkYzMzMzJywgJyNGRjMzNjYnLCAnI0ZGMzM5OScsICcjRkYzM0NDJywgJyNGRjMzRkYnLFxuICAnI0ZGNjYwMCcsICcjRkY2NjMzJywgJyNGRjk5MDAnLCAnI0ZGOTkzMycsICcjRkZDQzAwJywgJyNGRkNDMzMnXG5dO1xuXG4vKipcbiAqIEN1cnJlbnRseSBvbmx5IFdlYktpdC1iYXNlZCBXZWIgSW5zcGVjdG9ycywgRmlyZWZveCA+PSB2MzEsXG4gKiBhbmQgdGhlIEZpcmVidWcgZXh0ZW5zaW9uIChhbnkgRmlyZWZveCB2ZXJzaW9uKSBhcmUga25vd25cbiAqIHRvIHN1cHBvcnQgXCIlY1wiIENTUyBjdXN0b21pemF0aW9ucy5cbiAqXG4gKiBUT0RPOiBhZGQgYSBgbG9jYWxTdG9yYWdlYCB2YXJpYWJsZSB0byBleHBsaWNpdGx5IGVuYWJsZS9kaXNhYmxlIGNvbG9yc1xuICovXG5cbmZ1bmN0aW9uIHVzZUNvbG9ycygpIHtcbiAgLy8gTkI6IEluIGFuIEVsZWN0cm9uIHByZWxvYWQgc2NyaXB0LCBkb2N1bWVudCB3aWxsIGJlIGRlZmluZWQgYnV0IG5vdCBmdWxseVxuICAvLyBpbml0aWFsaXplZC4gU2luY2Ugd2Uga25vdyB3ZSdyZSBpbiBDaHJvbWUsIHdlJ2xsIGp1c3QgZGV0ZWN0IHRoaXMgY2FzZVxuICAvLyBleHBsaWNpdGx5XG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cucHJvY2VzcyAmJiB3aW5kb3cucHJvY2Vzcy50eXBlID09PSAncmVuZGVyZXInKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBJbnRlcm5ldCBFeHBsb3JlciBhbmQgRWRnZSBkbyBub3Qgc3VwcG9ydCBjb2xvcnMuXG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IudXNlckFnZW50ICYmIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5tYXRjaCgvKGVkZ2V8dHJpZGVudClcXC8oXFxkKykvKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIGlzIHdlYmtpdD8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTY0NTk2MDYvMzc2NzczXG4gIC8vIGRvY3VtZW50IGlzIHVuZGVmaW5lZCBpbiByZWFjdC1uYXRpdmU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWFjdC1uYXRpdmUvcHVsbC8xNjMyXG4gIHJldHVybiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5XZWJraXRBcHBlYXJhbmNlKSB8fFxuICAgIC8vIGlzIGZpcmVidWc/IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzM5ODEyMC8zNzY3NzNcbiAgICAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmNvbnNvbGUgJiYgKHdpbmRvdy5jb25zb2xlLmZpcmVidWcgfHwgKHdpbmRvdy5jb25zb2xlLmV4Y2VwdGlvbiAmJiB3aW5kb3cuY29uc29sZS50YWJsZSkpKSB8fFxuICAgIC8vIGlzIGZpcmVmb3ggPj0gdjMxP1xuICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvVG9vbHMvV2ViX0NvbnNvbGUjU3R5bGluZ19tZXNzYWdlc1xuICAgICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IudXNlckFnZW50ICYmIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5tYXRjaCgvZmlyZWZveFxcLyhcXGQrKS8pICYmIHBhcnNlSW50KFJlZ0V4cC4kMSwgMTApID49IDMxKSB8fFxuICAgIC8vIGRvdWJsZSBjaGVjayB3ZWJraXQgaW4gdXNlckFnZW50IGp1c3QgaW4gY2FzZSB3ZSBhcmUgaW4gYSB3b3JrZXJcbiAgICAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudCAmJiBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkubWF0Y2goL2FwcGxld2Via2l0XFwvKFxcZCspLykpO1xufVxuXG4vKipcbiAqIE1hcCAlaiB0byBgSlNPTi5zdHJpbmdpZnkoKWAsIHNpbmNlIG5vIFdlYiBJbnNwZWN0b3JzIGRvIHRoYXQgYnkgZGVmYXVsdC5cbiAqL1xuXG5leHBvcnRzLmZvcm1hdHRlcnMuaiA9IGZ1bmN0aW9uKHYpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodik7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiAnW1VuZXhwZWN0ZWRKU09OUGFyc2VFcnJvcl06ICcgKyBlcnIubWVzc2FnZTtcbiAgfVxufTtcblxuXG4vKipcbiAqIENvbG9yaXplIGxvZyBhcmd1bWVudHMgaWYgZW5hYmxlZC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGZvcm1hdEFyZ3MoYXJncykge1xuICB2YXIgdXNlQ29sb3JzID0gdGhpcy51c2VDb2xvcnM7XG5cbiAgYXJnc1swXSA9ICh1c2VDb2xvcnMgPyAnJWMnIDogJycpXG4gICAgKyB0aGlzLm5hbWVzcGFjZVxuICAgICsgKHVzZUNvbG9ycyA/ICcgJWMnIDogJyAnKVxuICAgICsgYXJnc1swXVxuICAgICsgKHVzZUNvbG9ycyA/ICclYyAnIDogJyAnKVxuICAgICsgJysnICsgZXhwb3J0cy5odW1hbml6ZSh0aGlzLmRpZmYpO1xuXG4gIGlmICghdXNlQ29sb3JzKSByZXR1cm47XG5cbiAgdmFyIGMgPSAnY29sb3I6ICcgKyB0aGlzLmNvbG9yO1xuICBhcmdzLnNwbGljZSgxLCAwLCBjLCAnY29sb3I6IGluaGVyaXQnKVxuXG4gIC8vIHRoZSBmaW5hbCBcIiVjXCIgaXMgc29tZXdoYXQgdHJpY2t5LCBiZWNhdXNlIHRoZXJlIGNvdWxkIGJlIG90aGVyXG4gIC8vIGFyZ3VtZW50cyBwYXNzZWQgZWl0aGVyIGJlZm9yZSBvciBhZnRlciB0aGUgJWMsIHNvIHdlIG5lZWQgdG9cbiAgLy8gZmlndXJlIG91dCB0aGUgY29ycmVjdCBpbmRleCB0byBpbnNlcnQgdGhlIENTUyBpbnRvXG4gIHZhciBpbmRleCA9IDA7XG4gIHZhciBsYXN0QyA9IDA7XG4gIGFyZ3NbMF0ucmVwbGFjZSgvJVthLXpBLVolXS9nLCBmdW5jdGlvbihtYXRjaCkge1xuICAgIGlmICgnJSUnID09PSBtYXRjaCkgcmV0dXJuO1xuICAgIGluZGV4Kys7XG4gICAgaWYgKCclYycgPT09IG1hdGNoKSB7XG4gICAgICAvLyB3ZSBvbmx5IGFyZSBpbnRlcmVzdGVkIGluIHRoZSAqbGFzdCogJWNcbiAgICAgIC8vICh0aGUgdXNlciBtYXkgaGF2ZSBwcm92aWRlZCB0aGVpciBvd24pXG4gICAgICBsYXN0QyA9IGluZGV4O1xuICAgIH1cbiAgfSk7XG5cbiAgYXJncy5zcGxpY2UobGFzdEMsIDAsIGMpO1xufVxuXG4vKipcbiAqIEludm9rZXMgYGNvbnNvbGUubG9nKClgIHdoZW4gYXZhaWxhYmxlLlxuICogTm8tb3Agd2hlbiBgY29uc29sZS5sb2dgIGlzIG5vdCBhIFwiZnVuY3Rpb25cIi5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGxvZygpIHtcbiAgLy8gdGhpcyBoYWNrZXJ5IGlzIHJlcXVpcmVkIGZvciBJRTgvOSwgd2hlcmVcbiAgLy8gdGhlIGBjb25zb2xlLmxvZ2AgZnVuY3Rpb24gZG9lc24ndCBoYXZlICdhcHBseSdcbiAgcmV0dXJuICdvYmplY3QnID09PSB0eXBlb2YgY29uc29sZVxuICAgICYmIGNvbnNvbGUubG9nXG4gICAgJiYgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5LmNhbGwoY29uc29sZS5sb2csIGNvbnNvbGUsIGFyZ3VtZW50cyk7XG59XG5cbi8qKlxuICogU2F2ZSBgbmFtZXNwYWNlc2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNhdmUobmFtZXNwYWNlcykge1xuICB0cnkge1xuICAgIGlmIChudWxsID09IG5hbWVzcGFjZXMpIHtcbiAgICAgIGV4cG9ydHMuc3RvcmFnZS5yZW1vdmVJdGVtKCdkZWJ1ZycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBleHBvcnRzLnN0b3JhZ2UuZGVidWcgPSBuYW1lc3BhY2VzO1xuICAgIH1cbiAgfSBjYXRjaChlKSB7fVxufVxuXG4vKipcbiAqIExvYWQgYG5hbWVzcGFjZXNgLlxuICpcbiAqIEByZXR1cm4ge1N0cmluZ30gcmV0dXJucyB0aGUgcHJldmlvdXNseSBwZXJzaXN0ZWQgZGVidWcgbW9kZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGxvYWQoKSB7XG4gIHZhciByO1xuICB0cnkge1xuICAgIHIgPSBleHBvcnRzLnN0b3JhZ2UuZGVidWc7XG4gIH0gY2F0Y2goZSkge31cblxuICAvLyBJZiBkZWJ1ZyBpc24ndCBzZXQgaW4gTFMsIGFuZCB3ZSdyZSBpbiBFbGVjdHJvbiwgdHJ5IHRvIGxvYWQgJERFQlVHXG4gIGlmICghciAmJiB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgJ2VudicgaW4gcHJvY2Vzcykge1xuICAgIHIgPSBwcm9jZXNzLmVudi5ERUJVRztcbiAgfVxuXG4gIHJldHVybiByO1xufVxuXG4vKipcbiAqIEVuYWJsZSBuYW1lc3BhY2VzIGxpc3RlZCBpbiBgbG9jYWxTdG9yYWdlLmRlYnVnYCBpbml0aWFsbHkuXG4gKi9cblxuZXhwb3J0cy5lbmFibGUobG9hZCgpKTtcblxuLyoqXG4gKiBMb2NhbHN0b3JhZ2UgYXR0ZW1wdHMgdG8gcmV0dXJuIHRoZSBsb2NhbHN0b3JhZ2UuXG4gKlxuICogVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSBzYWZhcmkgdGhyb3dzXG4gKiB3aGVuIGEgdXNlciBkaXNhYmxlcyBjb29raWVzL2xvY2Fsc3RvcmFnZVxuICogYW5kIHlvdSBhdHRlbXB0IHRvIGFjY2VzcyBpdC5cbiAqXG4gKiBAcmV0dXJuIHtMb2NhbFN0b3JhZ2V9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBsb2NhbHN0b3JhZ2UoKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHdpbmRvdy5sb2NhbFN0b3JhZ2U7XG4gIH0gY2F0Y2ggKGUpIHt9XG59XG4iLCJcbi8qKlxuICogVGhpcyBpcyB0aGUgY29tbW9uIGxvZ2ljIGZvciBib3RoIHRoZSBOb2RlLmpzIGFuZCB3ZWIgYnJvd3NlclxuICogaW1wbGVtZW50YXRpb25zIG9mIGBkZWJ1ZygpYC5cbiAqXG4gKiBFeHBvc2UgYGRlYnVnKClgIGFzIHRoZSBtb2R1bGUuXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gY3JlYXRlRGVidWcuZGVidWcgPSBjcmVhdGVEZWJ1Z1snZGVmYXVsdCddID0gY3JlYXRlRGVidWc7XG5leHBvcnRzLmNvZXJjZSA9IGNvZXJjZTtcbmV4cG9ydHMuZGlzYWJsZSA9IGRpc2FibGU7XG5leHBvcnRzLmVuYWJsZSA9IGVuYWJsZTtcbmV4cG9ydHMuZW5hYmxlZCA9IGVuYWJsZWQ7XG5leHBvcnRzLmh1bWFuaXplID0gcmVxdWlyZSgnbXMnKTtcblxuLyoqXG4gKiBBY3RpdmUgYGRlYnVnYCBpbnN0YW5jZXMuXG4gKi9cbmV4cG9ydHMuaW5zdGFuY2VzID0gW107XG5cbi8qKlxuICogVGhlIGN1cnJlbnRseSBhY3RpdmUgZGVidWcgbW9kZSBuYW1lcywgYW5kIG5hbWVzIHRvIHNraXAuXG4gKi9cblxuZXhwb3J0cy5uYW1lcyA9IFtdO1xuZXhwb3J0cy5za2lwcyA9IFtdO1xuXG4vKipcbiAqIE1hcCBvZiBzcGVjaWFsIFwiJW5cIiBoYW5kbGluZyBmdW5jdGlvbnMsIGZvciB0aGUgZGVidWcgXCJmb3JtYXRcIiBhcmd1bWVudC5cbiAqXG4gKiBWYWxpZCBrZXkgbmFtZXMgYXJlIGEgc2luZ2xlLCBsb3dlciBvciB1cHBlci1jYXNlIGxldHRlciwgaS5lLiBcIm5cIiBhbmQgXCJOXCIuXG4gKi9cblxuZXhwb3J0cy5mb3JtYXR0ZXJzID0ge307XG5cbi8qKlxuICogU2VsZWN0IGEgY29sb3IuXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzZWxlY3RDb2xvcihuYW1lc3BhY2UpIHtcbiAgdmFyIGhhc2ggPSAwLCBpO1xuXG4gIGZvciAoaSBpbiBuYW1lc3BhY2UpIHtcbiAgICBoYXNoICA9ICgoaGFzaCA8PCA1KSAtIGhhc2gpICsgbmFtZXNwYWNlLmNoYXJDb2RlQXQoaSk7XG4gICAgaGFzaCB8PSAwOyAvLyBDb252ZXJ0IHRvIDMyYml0IGludGVnZXJcbiAgfVxuXG4gIHJldHVybiBleHBvcnRzLmNvbG9yc1tNYXRoLmFicyhoYXNoKSAlIGV4cG9ydHMuY29sb3JzLmxlbmd0aF07XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgZGVidWdnZXIgd2l0aCB0aGUgZ2l2ZW4gYG5hbWVzcGFjZWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGNyZWF0ZURlYnVnKG5hbWVzcGFjZSkge1xuXG4gIHZhciBwcmV2VGltZTtcblxuICBmdW5jdGlvbiBkZWJ1ZygpIHtcbiAgICAvLyBkaXNhYmxlZD9cbiAgICBpZiAoIWRlYnVnLmVuYWJsZWQpIHJldHVybjtcblxuICAgIHZhciBzZWxmID0gZGVidWc7XG5cbiAgICAvLyBzZXQgYGRpZmZgIHRpbWVzdGFtcFxuICAgIHZhciBjdXJyID0gK25ldyBEYXRlKCk7XG4gICAgdmFyIG1zID0gY3VyciAtIChwcmV2VGltZSB8fCBjdXJyKTtcbiAgICBzZWxmLmRpZmYgPSBtcztcbiAgICBzZWxmLnByZXYgPSBwcmV2VGltZTtcbiAgICBzZWxmLmN1cnIgPSBjdXJyO1xuICAgIHByZXZUaW1lID0gY3VycjtcblxuICAgIC8vIHR1cm4gdGhlIGBhcmd1bWVudHNgIGludG8gYSBwcm9wZXIgQXJyYXlcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuXG4gICAgYXJnc1swXSA9IGV4cG9ydHMuY29lcmNlKGFyZ3NbMF0pO1xuXG4gICAgaWYgKCdzdHJpbmcnICE9PSB0eXBlb2YgYXJnc1swXSkge1xuICAgICAgLy8gYW55dGhpbmcgZWxzZSBsZXQncyBpbnNwZWN0IHdpdGggJU9cbiAgICAgIGFyZ3MudW5zaGlmdCgnJU8nKTtcbiAgICB9XG5cbiAgICAvLyBhcHBseSBhbnkgYGZvcm1hdHRlcnNgIHRyYW5zZm9ybWF0aW9uc1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgYXJnc1swXSA9IGFyZ3NbMF0ucmVwbGFjZSgvJShbYS16QS1aJV0pL2csIGZ1bmN0aW9uKG1hdGNoLCBmb3JtYXQpIHtcbiAgICAgIC8vIGlmIHdlIGVuY291bnRlciBhbiBlc2NhcGVkICUgdGhlbiBkb24ndCBpbmNyZWFzZSB0aGUgYXJyYXkgaW5kZXhcbiAgICAgIGlmIChtYXRjaCA9PT0gJyUlJykgcmV0dXJuIG1hdGNoO1xuICAgICAgaW5kZXgrKztcbiAgICAgIHZhciBmb3JtYXR0ZXIgPSBleHBvcnRzLmZvcm1hdHRlcnNbZm9ybWF0XTtcbiAgICAgIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgZm9ybWF0dGVyKSB7XG4gICAgICAgIHZhciB2YWwgPSBhcmdzW2luZGV4XTtcbiAgICAgICAgbWF0Y2ggPSBmb3JtYXR0ZXIuY2FsbChzZWxmLCB2YWwpO1xuXG4gICAgICAgIC8vIG5vdyB3ZSBuZWVkIHRvIHJlbW92ZSBgYXJnc1tpbmRleF1gIHNpbmNlIGl0J3MgaW5saW5lZCBpbiB0aGUgYGZvcm1hdGBcbiAgICAgICAgYXJncy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICBpbmRleC0tO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH0pO1xuXG4gICAgLy8gYXBwbHkgZW52LXNwZWNpZmljIGZvcm1hdHRpbmcgKGNvbG9ycywgZXRjLilcbiAgICBleHBvcnRzLmZvcm1hdEFyZ3MuY2FsbChzZWxmLCBhcmdzKTtcblxuICAgIHZhciBsb2dGbiA9IGRlYnVnLmxvZyB8fCBleHBvcnRzLmxvZyB8fCBjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpO1xuICAgIGxvZ0ZuLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICB9XG5cbiAgZGVidWcubmFtZXNwYWNlID0gbmFtZXNwYWNlO1xuICBkZWJ1Zy5lbmFibGVkID0gZXhwb3J0cy5lbmFibGVkKG5hbWVzcGFjZSk7XG4gIGRlYnVnLnVzZUNvbG9ycyA9IGV4cG9ydHMudXNlQ29sb3JzKCk7XG4gIGRlYnVnLmNvbG9yID0gc2VsZWN0Q29sb3IobmFtZXNwYWNlKTtcbiAgZGVidWcuZGVzdHJveSA9IGRlc3Ryb3k7XG5cbiAgLy8gZW52LXNwZWNpZmljIGluaXRpYWxpemF0aW9uIGxvZ2ljIGZvciBkZWJ1ZyBpbnN0YW5jZXNcbiAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBleHBvcnRzLmluaXQpIHtcbiAgICBleHBvcnRzLmluaXQoZGVidWcpO1xuICB9XG5cbiAgZXhwb3J0cy5pbnN0YW5jZXMucHVzaChkZWJ1Zyk7XG5cbiAgcmV0dXJuIGRlYnVnO1xufVxuXG5mdW5jdGlvbiBkZXN0cm95ICgpIHtcbiAgdmFyIGluZGV4ID0gZXhwb3J0cy5pbnN0YW5jZXMuaW5kZXhPZih0aGlzKTtcbiAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgIGV4cG9ydHMuaW5zdGFuY2VzLnNwbGljZShpbmRleCwgMSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qKlxuICogRW5hYmxlcyBhIGRlYnVnIG1vZGUgYnkgbmFtZXNwYWNlcy4gVGhpcyBjYW4gaW5jbHVkZSBtb2Rlc1xuICogc2VwYXJhdGVkIGJ5IGEgY29sb24gYW5kIHdpbGRjYXJkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBlbmFibGUobmFtZXNwYWNlcykge1xuICBleHBvcnRzLnNhdmUobmFtZXNwYWNlcyk7XG5cbiAgZXhwb3J0cy5uYW1lcyA9IFtdO1xuICBleHBvcnRzLnNraXBzID0gW107XG5cbiAgdmFyIGk7XG4gIHZhciBzcGxpdCA9ICh0eXBlb2YgbmFtZXNwYWNlcyA9PT0gJ3N0cmluZycgPyBuYW1lc3BhY2VzIDogJycpLnNwbGl0KC9bXFxzLF0rLyk7XG4gIHZhciBsZW4gPSBzcGxpdC5sZW5ndGg7XG5cbiAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKCFzcGxpdFtpXSkgY29udGludWU7IC8vIGlnbm9yZSBlbXB0eSBzdHJpbmdzXG4gICAgbmFtZXNwYWNlcyA9IHNwbGl0W2ldLnJlcGxhY2UoL1xcKi9nLCAnLio/Jyk7XG4gICAgaWYgKG5hbWVzcGFjZXNbMF0gPT09ICctJykge1xuICAgICAgZXhwb3J0cy5za2lwcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZXNwYWNlcy5zdWJzdHIoMSkgKyAnJCcpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXhwb3J0cy5uYW1lcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZXNwYWNlcyArICckJykpO1xuICAgIH1cbiAgfVxuXG4gIGZvciAoaSA9IDA7IGkgPCBleHBvcnRzLmluc3RhbmNlcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpbnN0YW5jZSA9IGV4cG9ydHMuaW5zdGFuY2VzW2ldO1xuICAgIGluc3RhbmNlLmVuYWJsZWQgPSBleHBvcnRzLmVuYWJsZWQoaW5zdGFuY2UubmFtZXNwYWNlKTtcbiAgfVxufVxuXG4vKipcbiAqIERpc2FibGUgZGVidWcgb3V0cHV0LlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZGlzYWJsZSgpIHtcbiAgZXhwb3J0cy5lbmFibGUoJycpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gbW9kZSBuYW1lIGlzIGVuYWJsZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZW5hYmxlZChuYW1lKSB7XG4gIGlmIChuYW1lW25hbWUubGVuZ3RoIC0gMV0gPT09ICcqJykge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHZhciBpLCBsZW47XG4gIGZvciAoaSA9IDAsIGxlbiA9IGV4cG9ydHMuc2tpcHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoZXhwb3J0cy5za2lwc1tpXS50ZXN0KG5hbWUpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIGZvciAoaSA9IDAsIGxlbiA9IGV4cG9ydHMubmFtZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoZXhwb3J0cy5uYW1lc1tpXS50ZXN0KG5hbWUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIENvZXJjZSBgdmFsYC5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge01peGVkfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gY29lcmNlKHZhbCkge1xuICBpZiAodmFsIGluc3RhbmNlb2YgRXJyb3IpIHJldHVybiB2YWwuc3RhY2sgfHwgdmFsLm1lc3NhZ2U7XG4gIHJldHVybiB2YWw7XG59XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgdG9GdW5jdGlvbiA9IHJlcXVpcmUoJ3RvLWZ1bmN0aW9uJyk7XG5cbi8qKlxuICogR3JvdXAgYGFycmAgd2l0aCBjYWxsYmFjayBgZm4odmFsLCBpKWAuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufFN0cmluZ30gZm4gb3IgcHJvcFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXJyLCBmbil7XG4gIHZhciByZXQgPSB7fTtcbiAgdmFyIHByb3A7XG4gIGZuID0gdG9GdW5jdGlvbihmbik7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyArK2kpIHtcbiAgICBwcm9wID0gZm4oYXJyW2ldLCBpKTtcbiAgICByZXRbcHJvcF0gPSByZXRbcHJvcF0gfHwgW107XG4gICAgcmV0W3Byb3BdLnB1c2goYXJyW2ldKTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59OyIsIi8qKlxuICogSGVscGVycy5cbiAqL1xuXG52YXIgcyA9IDEwMDA7XG52YXIgbSA9IHMgKiA2MDtcbnZhciBoID0gbSAqIDYwO1xudmFyIGQgPSBoICogMjQ7XG52YXIgeSA9IGQgKiAzNjUuMjU7XG5cbi8qKlxuICogUGFyc2Ugb3IgZm9ybWF0IHRoZSBnaXZlbiBgdmFsYC5cbiAqXG4gKiBPcHRpb25zOlxuICpcbiAqICAtIGBsb25nYCB2ZXJib3NlIGZvcm1hdHRpbmcgW2ZhbHNlXVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE51bWJlcn0gdmFsXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKiBAdGhyb3dzIHtFcnJvcn0gdGhyb3cgYW4gZXJyb3IgaWYgdmFsIGlzIG5vdCBhIG5vbi1lbXB0eSBzdHJpbmcgb3IgYSBudW1iZXJcbiAqIEByZXR1cm4ge1N0cmluZ3xOdW1iZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odmFsLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWw7XG4gIGlmICh0eXBlID09PSAnc3RyaW5nJyAmJiB2YWwubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiBwYXJzZSh2YWwpO1xuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdudW1iZXInICYmIGlzTmFOKHZhbCkgPT09IGZhbHNlKSB7XG4gICAgcmV0dXJuIG9wdGlvbnMubG9uZyA/IGZtdExvbmcodmFsKSA6IGZtdFNob3J0KHZhbCk7XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKFxuICAgICd2YWwgaXMgbm90IGEgbm9uLWVtcHR5IHN0cmluZyBvciBhIHZhbGlkIG51bWJlci4gdmFsPScgK1xuICAgICAgSlNPTi5zdHJpbmdpZnkodmFsKVxuICApO1xufTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gYHN0cmAgYW5kIHJldHVybiBtaWxsaXNlY29uZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7TnVtYmVyfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyc2Uoc3RyKSB7XG4gIHN0ciA9IFN0cmluZyhzdHIpO1xuICBpZiAoc3RyLmxlbmd0aCA+IDEwMCkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbWF0Y2ggPSAvXigoPzpcXGQrKT9cXC4/XFxkKykgKihtaWxsaXNlY29uZHM/fG1zZWNzP3xtc3xzZWNvbmRzP3xzZWNzP3xzfG1pbnV0ZXM/fG1pbnM/fG18aG91cnM/fGhycz98aHxkYXlzP3xkfHllYXJzP3x5cnM/fHkpPyQvaS5leGVjKFxuICAgIHN0clxuICApO1xuICBpZiAoIW1hdGNoKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBuID0gcGFyc2VGbG9hdChtYXRjaFsxXSk7XG4gIHZhciB0eXBlID0gKG1hdGNoWzJdIHx8ICdtcycpLnRvTG93ZXJDYXNlKCk7XG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ3llYXJzJzpcbiAgICBjYXNlICd5ZWFyJzpcbiAgICBjYXNlICd5cnMnOlxuICAgIGNhc2UgJ3lyJzpcbiAgICBjYXNlICd5JzpcbiAgICAgIHJldHVybiBuICogeTtcbiAgICBjYXNlICdkYXlzJzpcbiAgICBjYXNlICdkYXknOlxuICAgIGNhc2UgJ2QnOlxuICAgICAgcmV0dXJuIG4gKiBkO1xuICAgIGNhc2UgJ2hvdXJzJzpcbiAgICBjYXNlICdob3VyJzpcbiAgICBjYXNlICdocnMnOlxuICAgIGNhc2UgJ2hyJzpcbiAgICBjYXNlICdoJzpcbiAgICAgIHJldHVybiBuICogaDtcbiAgICBjYXNlICdtaW51dGVzJzpcbiAgICBjYXNlICdtaW51dGUnOlxuICAgIGNhc2UgJ21pbnMnOlxuICAgIGNhc2UgJ21pbic6XG4gICAgY2FzZSAnbSc6XG4gICAgICByZXR1cm4gbiAqIG07XG4gICAgY2FzZSAnc2Vjb25kcyc6XG4gICAgY2FzZSAnc2Vjb25kJzpcbiAgICBjYXNlICdzZWNzJzpcbiAgICBjYXNlICdzZWMnOlxuICAgIGNhc2UgJ3MnOlxuICAgICAgcmV0dXJuIG4gKiBzO1xuICAgIGNhc2UgJ21pbGxpc2Vjb25kcyc6XG4gICAgY2FzZSAnbWlsbGlzZWNvbmQnOlxuICAgIGNhc2UgJ21zZWNzJzpcbiAgICBjYXNlICdtc2VjJzpcbiAgICBjYXNlICdtcyc6XG4gICAgICByZXR1cm4gbjtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxufVxuXG4vKipcbiAqIFNob3J0IGZvcm1hdCBmb3IgYG1zYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbXNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGZtdFNob3J0KG1zKSB7XG4gIGlmIChtcyA+PSBkKSB7XG4gICAgcmV0dXJuIE1hdGgucm91bmQobXMgLyBkKSArICdkJztcbiAgfVxuICBpZiAobXMgPj0gaCkge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gaCkgKyAnaCc7XG4gIH1cbiAgaWYgKG1zID49IG0pIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIG0pICsgJ20nO1xuICB9XG4gIGlmIChtcyA+PSBzKSB7XG4gICAgcmV0dXJuIE1hdGgucm91bmQobXMgLyBzKSArICdzJztcbiAgfVxuICByZXR1cm4gbXMgKyAnbXMnO1xufVxuXG4vKipcbiAqIExvbmcgZm9ybWF0IGZvciBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtc1xuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZm10TG9uZyhtcykge1xuICByZXR1cm4gcGx1cmFsKG1zLCBkLCAnZGF5JykgfHxcbiAgICBwbHVyYWwobXMsIGgsICdob3VyJykgfHxcbiAgICBwbHVyYWwobXMsIG0sICdtaW51dGUnKSB8fFxuICAgIHBsdXJhbChtcywgcywgJ3NlY29uZCcpIHx8XG4gICAgbXMgKyAnIG1zJztcbn1cblxuLyoqXG4gKiBQbHVyYWxpemF0aW9uIGhlbHBlci5cbiAqL1xuXG5mdW5jdGlvbiBwbHVyYWwobXMsIG4sIG5hbWUpIHtcbiAgaWYgKG1zIDwgbikge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAobXMgPCBuICogMS41KSB7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IobXMgLyBuKSArICcgJyArIG5hbWU7XG4gIH1cbiAgcmV0dXJuIE1hdGguY2VpbChtcyAvIG4pICsgJyAnICsgbmFtZSArICdzJztcbn1cbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSl7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvKmlzdGFuYnVsIGlnbm9yZSBuZXh0OmNhbnQgdGVzdCovXG4gIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgIGRlZmluZShbXSwgZmFjdG9yeSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gQnJvd3NlciBnbG9iYWxzXG4gICAgcm9vdC5vYmplY3RQYXRoID0gZmFjdG9yeSgpO1xuICB9XG59KSh0aGlzLCBmdW5jdGlvbigpe1xuICAndXNlIHN0cmljdCc7XG5cbiAgdmFyIHRvU3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbiAgZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gICAgaWYob2JqID09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICAvL3RvIGhhbmRsZSBvYmplY3RzIHdpdGggbnVsbCBwcm90b3R5cGVzICh0b28gZWRnZSBjYXNlPylcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcClcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzRW1wdHkodmFsdWUpe1xuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgICBmb3IgKHZhciBpIGluIHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoaGFzT3duUHJvcGVydHkodmFsdWUsIGkpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiB0b1N0cmluZyh0eXBlKXtcbiAgICByZXR1cm4gdG9TdHIuY2FsbCh0eXBlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzT2JqZWN0KG9iail7XG4gICAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIHRvU3RyaW5nKG9iaikgPT09IFwiW29iamVjdCBPYmplY3RdXCI7XG4gIH1cblxuICB2YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24ob2JqKXtcbiAgICAvKmlzdGFuYnVsIGlnbm9yZSBuZXh0OmNhbnQgdGVzdCovXG4gICAgcmV0dXJuIHRvU3RyLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzQm9vbGVhbihvYmope1xuICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSAnYm9vbGVhbicgfHwgdG9TdHJpbmcob2JqKSA9PT0gJ1tvYmplY3QgQm9vbGVhbl0nO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0S2V5KGtleSl7XG4gICAgdmFyIGludEtleSA9IHBhcnNlSW50KGtleSk7XG4gICAgaWYgKGludEtleS50b1N0cmluZygpID09PSBrZXkpIHtcbiAgICAgIHJldHVybiBpbnRLZXk7XG4gICAgfVxuICAgIHJldHVybiBrZXk7XG4gIH1cblxuICBmdW5jdGlvbiBmYWN0b3J5KG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuXG4gICAgdmFyIG9iamVjdFBhdGggPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmplY3RQYXRoKS5yZWR1Y2UoZnVuY3Rpb24ocHJveHksIHByb3ApIHtcbiAgICAgICAgaWYocHJvcCA9PT0gJ2NyZWF0ZScpIHtcbiAgICAgICAgICByZXR1cm4gcHJveHk7XG4gICAgICAgIH1cblxuICAgICAgICAvKmlzdGFuYnVsIGlnbm9yZSBlbHNlKi9cbiAgICAgICAgaWYgKHR5cGVvZiBvYmplY3RQYXRoW3Byb3BdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgcHJveHlbcHJvcF0gPSBvYmplY3RQYXRoW3Byb3BdLmJpbmQob2JqZWN0UGF0aCwgb2JqKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwcm94eTtcbiAgICAgIH0sIHt9KTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gaGFzU2hhbGxvd1Byb3BlcnR5KG9iaiwgcHJvcCkge1xuICAgICAgcmV0dXJuIChvcHRpb25zLmluY2x1ZGVJbmhlcml0ZWRQcm9wcyB8fCAodHlwZW9mIHByb3AgPT09ICdudW1iZXInICYmIEFycmF5LmlzQXJyYXkob2JqKSkgfHwgaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSlcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRTaGFsbG93UHJvcGVydHkob2JqLCBwcm9wKSB7XG4gICAgICBpZiAoaGFzU2hhbGxvd1Byb3BlcnR5KG9iaiwgcHJvcCkpIHtcbiAgICAgICAgcmV0dXJuIG9ialtwcm9wXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXQob2JqLCBwYXRoLCB2YWx1ZSwgZG9Ob3RSZXBsYWNlKXtcbiAgICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcGF0aCA9IFtwYXRoXTtcbiAgICAgIH1cbiAgICAgIGlmICghcGF0aCB8fCBwYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBwYXRoID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gc2V0KG9iaiwgcGF0aC5zcGxpdCgnLicpLm1hcChnZXRLZXkpLCB2YWx1ZSwgZG9Ob3RSZXBsYWNlKTtcbiAgICAgIH1cbiAgICAgIHZhciBjdXJyZW50UGF0aCA9IHBhdGhbMF07XG4gICAgICB2YXIgY3VycmVudFZhbHVlID0gZ2V0U2hhbGxvd1Byb3BlcnR5KG9iaiwgY3VycmVudFBhdGgpO1xuICAgICAgaWYgKHBhdGgubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGlmIChjdXJyZW50VmFsdWUgPT09IHZvaWQgMCB8fCAhZG9Ob3RSZXBsYWNlKSB7XG4gICAgICAgICAgb2JqW2N1cnJlbnRQYXRoXSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjdXJyZW50VmFsdWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChjdXJyZW50VmFsdWUgPT09IHZvaWQgMCkge1xuICAgICAgICAvL2NoZWNrIGlmIHdlIGFzc3VtZSBhbiBhcnJheVxuICAgICAgICBpZih0eXBlb2YgcGF0aFsxXSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICBvYmpbY3VycmVudFBhdGhdID0gW107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2JqW2N1cnJlbnRQYXRoXSA9IHt9O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZXQob2JqW2N1cnJlbnRQYXRoXSwgcGF0aC5zbGljZSgxKSwgdmFsdWUsIGRvTm90UmVwbGFjZSk7XG4gICAgfVxuXG4gICAgb2JqZWN0UGF0aC5oYXMgPSBmdW5jdGlvbiAob2JqLCBwYXRoKSB7XG4gICAgICBpZiAodHlwZW9mIHBhdGggPT09ICdudW1iZXInKSB7XG4gICAgICAgIHBhdGggPSBbcGF0aF07XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBwYXRoID09PSAnc3RyaW5nJykge1xuICAgICAgICBwYXRoID0gcGF0aC5zcGxpdCgnLicpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXBhdGggfHwgcGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuICEhb2JqO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhdGgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGogPSBnZXRLZXkocGF0aFtpXSk7XG5cbiAgICAgICAgaWYoKHR5cGVvZiBqID09PSAnbnVtYmVyJyAmJiBpc0FycmF5KG9iaikgJiYgaiA8IG9iai5sZW5ndGgpIHx8XG4gICAgICAgICAgKG9wdGlvbnMuaW5jbHVkZUluaGVyaXRlZFByb3BzID8gKGogaW4gT2JqZWN0KG9iaikpIDogaGFzT3duUHJvcGVydHkob2JqLCBqKSkpIHtcbiAgICAgICAgICBvYmogPSBvYmpbal07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICBvYmplY3RQYXRoLmVuc3VyZUV4aXN0cyA9IGZ1bmN0aW9uIChvYmosIHBhdGgsIHZhbHVlKXtcbiAgICAgIHJldHVybiBzZXQob2JqLCBwYXRoLCB2YWx1ZSwgdHJ1ZSk7XG4gICAgfTtcblxuICAgIG9iamVjdFBhdGguc2V0ID0gZnVuY3Rpb24gKG9iaiwgcGF0aCwgdmFsdWUsIGRvTm90UmVwbGFjZSl7XG4gICAgICByZXR1cm4gc2V0KG9iaiwgcGF0aCwgdmFsdWUsIGRvTm90UmVwbGFjZSk7XG4gICAgfTtcblxuICAgIG9iamVjdFBhdGguaW5zZXJ0ID0gZnVuY3Rpb24gKG9iaiwgcGF0aCwgdmFsdWUsIGF0KXtcbiAgICAgIHZhciBhcnIgPSBvYmplY3RQYXRoLmdldChvYmosIHBhdGgpO1xuICAgICAgYXQgPSB+fmF0O1xuICAgICAgaWYgKCFpc0FycmF5KGFycikpIHtcbiAgICAgICAgYXJyID0gW107XG4gICAgICAgIG9iamVjdFBhdGguc2V0KG9iaiwgcGF0aCwgYXJyKTtcbiAgICAgIH1cbiAgICAgIGFyci5zcGxpY2UoYXQsIDAsIHZhbHVlKTtcbiAgICB9O1xuXG4gICAgb2JqZWN0UGF0aC5lbXB0eSA9IGZ1bmN0aW9uKG9iaiwgcGF0aCkge1xuICAgICAgaWYgKGlzRW1wdHkocGF0aCkpIHtcbiAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICAgIH1cbiAgICAgIGlmIChvYmogPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgfVxuXG4gICAgICB2YXIgdmFsdWUsIGk7XG4gICAgICBpZiAoISh2YWx1ZSA9IG9iamVjdFBhdGguZ2V0KG9iaiwgcGF0aCkpKSB7XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBvYmplY3RQYXRoLnNldChvYmosIHBhdGgsICcnKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNCb29sZWFuKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gb2JqZWN0UGF0aC5zZXQob2JqLCBwYXRoLCBmYWxzZSk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdFBhdGguc2V0KG9iaiwgcGF0aCwgMCk7XG4gICAgICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgIHZhbHVlLmxlbmd0aCA9IDA7XG4gICAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KHZhbHVlKSkge1xuICAgICAgICBmb3IgKGkgaW4gdmFsdWUpIHtcbiAgICAgICAgICBpZiAoaGFzU2hhbGxvd1Byb3BlcnR5KHZhbHVlLCBpKSkge1xuICAgICAgICAgICAgZGVsZXRlIHZhbHVlW2ldO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdFBhdGguc2V0KG9iaiwgcGF0aCwgbnVsbCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIG9iamVjdFBhdGgucHVzaCA9IGZ1bmN0aW9uIChvYmosIHBhdGggLyosIHZhbHVlcyAqLyl7XG4gICAgICB2YXIgYXJyID0gb2JqZWN0UGF0aC5nZXQob2JqLCBwYXRoKTtcbiAgICAgIGlmICghaXNBcnJheShhcnIpKSB7XG4gICAgICAgIGFyciA9IFtdO1xuICAgICAgICBvYmplY3RQYXRoLnNldChvYmosIHBhdGgsIGFycik7XG4gICAgICB9XG5cbiAgICAgIGFyci5wdXNoLmFwcGx5KGFyciwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKSk7XG4gICAgfTtcblxuICAgIG9iamVjdFBhdGguY29hbGVzY2UgPSBmdW5jdGlvbiAob2JqLCBwYXRocywgZGVmYXVsdFZhbHVlKSB7XG4gICAgICB2YXIgdmFsdWU7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBwYXRocy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAoKHZhbHVlID0gb2JqZWN0UGF0aC5nZXQob2JqLCBwYXRoc1tpXSkpICE9PSB2b2lkIDApIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICB9O1xuXG4gICAgb2JqZWN0UGF0aC5nZXQgPSBmdW5jdGlvbiAob2JqLCBwYXRoLCBkZWZhdWx0VmFsdWUpe1xuICAgICAgaWYgKHR5cGVvZiBwYXRoID09PSAnbnVtYmVyJykge1xuICAgICAgICBwYXRoID0gW3BhdGhdO1xuICAgICAgfVxuICAgICAgaWYgKCFwYXRoIHx8IHBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgICB9XG4gICAgICBpZiAob2JqID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdFBhdGguZ2V0KG9iaiwgcGF0aC5zcGxpdCgnLicpLCBkZWZhdWx0VmFsdWUpO1xuICAgICAgfVxuXG4gICAgICB2YXIgY3VycmVudFBhdGggPSBnZXRLZXkocGF0aFswXSk7XG4gICAgICB2YXIgbmV4dE9iaiA9IGdldFNoYWxsb3dQcm9wZXJ0eShvYmosIGN1cnJlbnRQYXRoKVxuICAgICAgaWYgKG5leHRPYmogPT09IHZvaWQgMCkge1xuICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICAgICAgfVxuXG4gICAgICBpZiAocGF0aC5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIG5leHRPYmo7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvYmplY3RQYXRoLmdldChvYmpbY3VycmVudFBhdGhdLCBwYXRoLnNsaWNlKDEpLCBkZWZhdWx0VmFsdWUpO1xuICAgIH07XG5cbiAgICBvYmplY3RQYXRoLmRlbCA9IGZ1bmN0aW9uIGRlbChvYmosIHBhdGgpIHtcbiAgICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcGF0aCA9IFtwYXRoXTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9iaiA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc0VtcHR5KHBhdGgpKSB7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgICB9XG4gICAgICBpZih0eXBlb2YgcGF0aCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdFBhdGguZGVsKG9iaiwgcGF0aC5zcGxpdCgnLicpKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGN1cnJlbnRQYXRoID0gZ2V0S2V5KHBhdGhbMF0pO1xuICAgICAgaWYgKCFoYXNTaGFsbG93UHJvcGVydHkob2JqLCBjdXJyZW50UGF0aCkpIHtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgIH1cblxuICAgICAgaWYocGF0aC5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgICAgICAgIG9iai5zcGxpY2UoY3VycmVudFBhdGgsIDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZSBvYmpbY3VycmVudFBhdGhdO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gb2JqZWN0UGF0aC5kZWwob2JqW2N1cnJlbnRQYXRoXSwgcGF0aC5zbGljZSgxKSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iamVjdFBhdGg7XG4gIH1cblxuICB2YXIgbW9kID0gZmFjdG9yeSgpO1xuICBtb2QuY3JlYXRlID0gZmFjdG9yeTtcbiAgbW9kLndpdGhJbmhlcml0ZWRQcm9wcyA9IGZhY3Rvcnkoe2luY2x1ZGVJbmhlcml0ZWRQcm9wczogdHJ1ZX0pXG4gIHJldHVybiBtb2Q7XG59KTtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJcbi8qKlxuICogTW9kdWxlIERlcGVuZGVuY2llc1xuICovXG5cbnZhciBleHByO1xudHJ5IHtcbiAgZXhwciA9IHJlcXVpcmUoJ3Byb3BzJyk7XG59IGNhdGNoKGUpIHtcbiAgZXhwciA9IHJlcXVpcmUoJ2NvbXBvbmVudC1wcm9wcycpO1xufVxuXG4vKipcbiAqIEV4cG9zZSBgdG9GdW5jdGlvbigpYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRvRnVuY3Rpb247XG5cbi8qKlxuICogQ29udmVydCBgb2JqYCB0byBhIGBGdW5jdGlvbmAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gb2JqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHRvRnVuY3Rpb24ob2JqKSB7XG4gIHN3aXRjaCAoe30udG9TdHJpbmcuY2FsbChvYmopKSB7XG4gICAgY2FzZSAnW29iamVjdCBPYmplY3RdJzpcbiAgICAgIHJldHVybiBvYmplY3RUb0Z1bmN0aW9uKG9iaik7XG4gICAgY2FzZSAnW29iamVjdCBGdW5jdGlvbl0nOlxuICAgICAgcmV0dXJuIG9iajtcbiAgICBjYXNlICdbb2JqZWN0IFN0cmluZ10nOlxuICAgICAgcmV0dXJuIHN0cmluZ1RvRnVuY3Rpb24ob2JqKTtcbiAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOlxuICAgICAgcmV0dXJuIHJlZ2V4cFRvRnVuY3Rpb24ob2JqKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGRlZmF1bHRUb0Z1bmN0aW9uKG9iaik7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWZhdWx0IHRvIHN0cmljdCBlcXVhbGl0eS5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZGVmYXVsdFRvRnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiBmdW5jdGlvbihvYmope1xuICAgIHJldHVybiB2YWwgPT09IG9iajtcbiAgfTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGByZWAgdG8gYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1JlZ0V4cH0gcmVcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcmVnZXhwVG9GdW5jdGlvbihyZSkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqKXtcbiAgICByZXR1cm4gcmUudGVzdChvYmopO1xuICB9O1xufVxuXG4vKipcbiAqIENvbnZlcnQgcHJvcGVydHkgYHN0cmAgdG8gYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHN0cmluZ1RvRnVuY3Rpb24oc3RyKSB7XG4gIC8vIGltbWVkaWF0ZSBzdWNoIGFzIFwiPiAyMFwiXG4gIGlmICgvXiAqXFxXKy8udGVzdChzdHIpKSByZXR1cm4gbmV3IEZ1bmN0aW9uKCdfJywgJ3JldHVybiBfICcgKyBzdHIpO1xuXG4gIC8vIHByb3BlcnRpZXMgc3VjaCBhcyBcIm5hbWUuZmlyc3RcIiBvciBcImFnZSA+IDE4XCIgb3IgXCJhZ2UgPiAxOCAmJiBhZ2UgPCAzNlwiXG4gIHJldHVybiBuZXcgRnVuY3Rpb24oJ18nLCAncmV0dXJuICcgKyBnZXQoc3RyKSk7XG59XG5cbi8qKlxuICogQ29udmVydCBgb2JqZWN0YCB0byBhIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3RcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gb2JqZWN0VG9GdW5jdGlvbihvYmopIHtcbiAgdmFyIG1hdGNoID0ge307XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBtYXRjaFtrZXldID0gdHlwZW9mIG9ialtrZXldID09PSAnc3RyaW5nJ1xuICAgICAgPyBkZWZhdWx0VG9GdW5jdGlvbihvYmpba2V5XSlcbiAgICAgIDogdG9GdW5jdGlvbihvYmpba2V5XSk7XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbCl7XG4gICAgaWYgKHR5cGVvZiB2YWwgIT09ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG4gICAgZm9yICh2YXIga2V5IGluIG1hdGNoKSB7XG4gICAgICBpZiAoIShrZXkgaW4gdmFsKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgaWYgKCFtYXRjaFtrZXldKHZhbFtrZXldKSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbn1cblxuLyoqXG4gKiBCdWlsdCB0aGUgZ2V0dGVyIGZ1bmN0aW9uLiBTdXBwb3J0cyBnZXR0ZXIgc3R5bGUgZnVuY3Rpb25zXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZ2V0KHN0cikge1xuICB2YXIgcHJvcHMgPSBleHByKHN0cik7XG4gIGlmICghcHJvcHMubGVuZ3RoKSByZXR1cm4gJ18uJyArIHN0cjtcblxuICB2YXIgdmFsLCBpLCBwcm9wO1xuICBmb3IgKGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICBwcm9wID0gcHJvcHNbaV07XG4gICAgdmFsID0gJ18uJyArIHByb3A7XG4gICAgdmFsID0gXCIoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgXCIgKyB2YWwgKyBcIiA/IFwiICsgdmFsICsgXCIoKSA6IFwiICsgdmFsICsgXCIpXCI7XG5cbiAgICAvLyBtaW1pYyBuZWdhdGl2ZSBsb29rYmVoaW5kIHRvIGF2b2lkIHByb2JsZW1zIHdpdGggbmVzdGVkIHByb3BlcnRpZXNcbiAgICBzdHIgPSBzdHJpcE5lc3RlZChwcm9wLCBzdHIsIHZhbCk7XG4gIH1cblxuICByZXR1cm4gc3RyO1xufVxuXG4vKipcbiAqIE1pbWljIG5lZ2F0aXZlIGxvb2tiZWhpbmQgdG8gYXZvaWQgcHJvYmxlbXMgd2l0aCBuZXN0ZWQgcHJvcGVydGllcy5cbiAqXG4gKiBTZWU6IGh0dHA6Ly9ibG9nLnN0ZXZlbmxldml0aGFuLmNvbS9hcmNoaXZlcy9taW1pYy1sb29rYmVoaW5kLWphdmFzY3JpcHRcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc3RyaXBOZXN0ZWQgKHByb3AsIHN0ciwgdmFsKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZShuZXcgUmVnRXhwKCcoXFxcXC4pPycgKyBwcm9wLCAnZycpLCBmdW5jdGlvbigkMCwgJDEpIHtcbiAgICByZXR1cm4gJDEgPyAkMCA6IHZhbDtcbiAgfSk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCB7XG4gIHN0b3JhZ2U6ICdsb2NhbHN0b3JhZ2UnLFxuICBwcmVmaXg6ICdzcV9qb2JzJyxcbiAgdGltZW91dDogMTAwMCxcbiAgbGltaXQ6IC0xLFxuICBwcmluY2lwbGU6ICdmaWZvJyxcbiAgbmV0d29yazogZmFsc2UsXG4gIGRlYnVnOiB0cnVlXG59O1xuIiwiLyogQGZsb3cgKi9cbmltcG9ydCB0eXBlIElDb25maWcgZnJvbSAnLi4vaW50ZXJmYWNlcy9jb25maWcnO1xuaW1wb3J0IGNvbmZpZ0RhdGEgZnJvbSAnLi9jb25maWcuZGF0YSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbmZpZyB7XG4gIGNvbmZpZzogSUNvbmZpZyA9IGNvbmZpZ0RhdGE7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBJQ29uZmlnID0ge30pIHtcbiAgICB0aGlzLm1lcmdlKGNvbmZpZyk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGNvbmZpZyB0byBnbG9iYWwgY29uZmlnIHJlZmVyZW5jZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtICB7QW55fSB2YWx1ZVxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgc2V0KG5hbWU6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQge1xuICAgIHRoaXMuY29uZmlnW25hbWVdID0gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgY29uZmlnXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHthbnl9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBnZXQobmFtZTogc3RyaW5nKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWdbbmFtZV07XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgY29uZmlnIHByb3BlcnR5XG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHthbnl9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBoYXMobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLmNvbmZpZywgbmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogTWVyZ2UgdHdvIGNvbmZpZyBvYmplY3RcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBtZXJnZShjb25maWc6IHtbc3RyaW5nXTogYW55fSk6IHZvaWQge1xuICAgIHRoaXMuY29uZmlnID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5jb25maWcsIGNvbmZpZyk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGEgY29uZmlnXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgcmVtb3ZlKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBkZWxldGUgdGhpcy5jb25maWdbbmFtZV07XG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBjb25maWdcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm4ge0lDb25maWdbXX1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFsbCgpOiBJQ29uZmlnIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc7XG4gIH1cbn1cbiIsIi8qIEBmbG93ICovXG5pbXBvcnQgdHlwZSBJQ29udGFpbmVyIGZyb20gJy4uL2ludGVyZmFjZXMvY29udGFpbmVyJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29udGFpbmVyIGltcGxlbWVudHMgSUNvbnRhaW5lciB7XG5cbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIF9jb250YWluZXI6IHtbcHJvcGVydHk6IHN0cmluZ106IGFueX0gPSB7fTtcblxuICAvKipcbiAgICogQ2hlY2sgaXRlbSBpbiBjb250YWluZXJcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBpZFxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgaGFzKGlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuX2NvbnRhaW5lciwgaWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBpdGVtIGZyb20gY29udGFpbmVyXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gaWRcbiAgICogQHJldHVybiB7QW55fVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgZ2V0KGlkOiBzdHJpbmcpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLl9jb250YWluZXJbaWRdO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgaXRlbXMgZnJvbSBjb250YWluZXJcbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYWxsKCkge1xuICAgIHJldHVybiB0aGlzLl9jb250YWluZXI7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGl0ZW0gdG8gY29udGFpbmVyXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gaWRcbiAgICogQHBhcmFtICB7QW55fSB2YWx1ZVxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYmluZChpZDogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgdGhpcy5fY29udGFpbmVyW2lkXSA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBpdGVtIGZyb20gY29udGFpbmVyXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gaWRcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHJlbW92ZShpZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgaWYgKCEgdGhpcy5oYXMoaWQpKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIGRlbGV0ZSB0aGlzLl9jb250YWluZXJbaWRdO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbGwgaXRlbXMgZnJvbSBjb250YWluZXJcbiAgICpcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHJlbW92ZUFsbCgpOiB2b2lkIHtcbiAgICB0aGlzLl9jb250YWluZXIgPSB7fTtcbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQge1xuICBxdWV1ZToge1xuICAgICdjcmVhdGVkJzogJ05ldyB0YXNrIGNyZWF0ZWQuJyxcbiAgICAnbmV4dCc6ICdOZXh0IHRhc2sgcHJvY2Vzc2luZy4nLFxuICAgICdzdGFydGluZyc6ICdRdWV1ZSBsaXN0ZW5lciBzdGFydGluZy4nLFxuICAgICdzdG9wcGluZyc6ICdRdWV1ZSBsaXN0ZW5lciBzdG9wcGluZy4nLFxuICAgICdzdG9wcGVkJzogJ1F1ZXVlIGxpc3RlbmVyIHN0b3BwZWQuJyxcbiAgICAnZW1wdHknOiAnY2hhbm5lbCBpcyBlbXB0eS4uLicsXG4gICAgJ25vdC1mb3VuZCc6ICdqb2Igbm90IGZvdW5kJ1xuICB9LFxuICBldmVudDoge1xuICAgICdjcmVhdGVkJzogJ05ldyBldmVudCBjcmVhdGVkJyxcbiAgICAnZmlyZWQnOiAnRXZlbnQgZmlyZWQuJyxcbiAgICAnd2lsZGNhcmQtZmlyZWQnOiAnV2lsZGNhcmQgZXZlbnQgZmlyZWQuJ1xuICB9XG5cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIEV2ZW50IHtcbiAgc3RvcmU6IHtbcHJvcDogc3RyaW5nXTogYW55fSA9IHt9O1xuICB2ZXJpZmllclBhdHRlcm46IHN0cmluZyA9IC9eW2EtejAtOVxcLVxcX10rXFw6YmVmb3JlJHxhZnRlciR8cmV0cnkkfFxcKiQvO1xuICB3aWxkY2FyZHM6IHN0cmluZ1tdID0gWycqJywgJ2Vycm9yJ107XG4gIGVtcHR5RnVuYzogRnVuY3Rpb24gPSAoKSA9PiB7fTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnN0b3JlLmJlZm9yZSA9IHt9O1xuICAgIHRoaXMuc3RvcmUuYWZ0ZXIgPSB7fTtcbiAgICB0aGlzLnN0b3JlLnJldHJ5ID0ge307XG4gICAgdGhpcy5zdG9yZS53aWxkY2FyZCA9IHt9O1xuICAgIHRoaXMuc3RvcmUuZXJyb3IgPSB0aGlzLmVtcHR5RnVuYztcbiAgICB0aGlzLnN0b3JlWycqJ10gPSB0aGlzLmVtcHR5RnVuYztcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgZXZlbnRcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHBhcmFtICB7RnVuY3Rpb259IGNiXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBvbihrZXk6IHN0cmluZywgY2I6IEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgaWYgKHR5cGVvZihjYikgIT09ICdmdW5jdGlvbicpIHRocm93IG5ldyBFcnJvcignRXZlbnQgc2hvdWxkIGJlIGFuIGZ1bmN0aW9uJyk7XG4gICAgaWYgKHRoaXMuaXNWYWxpZChrZXkpKSB0aGlzLmFkZChrZXksIGNiKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gZXZlbnQgdmlhIGl0J3Mga2V5XG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSAge0FueX0gYXJnc1xuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgZW1pdChrZXk6IHN0cmluZywgYXJnczogYW55KTogdm9pZCB7XG4gICAgaWYgKHRoaXMud2lsZGNhcmRzLmluZGV4T2Yoa2V5KSA+IC0xKSB7XG4gICAgICB0aGlzLndpbGRjYXJkKGtleSwgLi4uYXJndW1lbnRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgdHlwZTogc3RyaW5nID0gdGhpcy5nZXRUeXBlKGtleSk7XG4gICAgICBjb25zdCBuYW1lOiBzdHJpbmcgPSB0aGlzLmdldE5hbWUoa2V5KTtcblxuICAgICAgaWYgKHRoaXMuc3RvcmVbdHlwZV0pIHtcbiAgICAgICAgY29uc3QgY2I6IEZ1bmN0aW9uID0gdGhpcy5zdG9yZVt0eXBlXVtuYW1lXSB8fCB0aGlzLmVtcHR5RnVuYztcbiAgICAgICAgY2IuY2FsbChudWxsLCBhcmdzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLndpbGRjYXJkKCcqJywga2V5LCBhcmdzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gd2lsZGNhcmQgZXZlbnRzXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSAge1N0cmluZ30gYWN0aW9uS2V5XG4gICAqIEBwYXJhbSAge0FueX0gYXJnc1xuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgd2lsZGNhcmQoa2V5OiBzdHJpbmcsIGFjdGlvbktleTogc3RyaW5nLCBhcmdzOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5zdG9yZS53aWxkY2FyZFtrZXldKSB7XG4gICAgICB0aGlzLnN0b3JlLndpbGRjYXJkW2tleV0uY2FsbChudWxsLCBhY3Rpb25LZXksIGFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgZXZlbnQgdG8gc3RvcmVcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHBhcmFtICB7RnVuY3Rpb259IGNiXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhZGQoa2V5OiBzdHJpbmcsIGNiOiBGdW5jdGlvbik6IHZvaWQge1xuICAgIGlmICh0aGlzLndpbGRjYXJkcy5pbmRleE9mKGtleSkgPi0xKSB7XG4gICAgICB0aGlzLnN0b3JlLndpbGRjYXJkW2tleV0gPSBjYjtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgdHlwZTogc3RyaW5nID0gdGhpcy5nZXRUeXBlKGtleSk7XG4gICAgICBjb25zdCBuYW1lOiBzdHJpbmcgPSB0aGlzLmdldE5hbWUoa2V5KTtcbiAgICAgIHRoaXMuc3RvcmVbdHlwZV1bbmFtZV0gPSBjYjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgZXZlbnQgaW4gc3RvcmVcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGhhcyhrZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBrZXlzOiBzdHJpbmdbXSA9IGtleS5zcGxpdCgnOicpO1xuICAgICAgcmV0dXJuIGtleXMubGVuZ3RoID4gMSA/ICEhIHRoaXMuc3RvcmVba2V5c1sxXV1ba2V5c1swXV0gOiAhISB0aGlzLnN0b3JlLndpbGRjYXJkW2tleXNbMF1dO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZXZlbnQgbmFtZSBieSBwYXJzZSBrZXlcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgZ2V0TmFtZShrZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGtleS5tYXRjaCgvKC4qKVxcOi4qLylbMV07XG4gIH1cblxuICAvKipcbiAgICogR2V0IGV2ZW50IHR5cGUgYnkgcGFyc2Uga2V5XG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGdldFR5cGUoa2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBrZXkubWF0Y2goL15bYS16MC05XFwtXFxfXStcXDooLiopLylbMV07XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tlciBvZiBldmVudCBrZXlzXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBpc1ZhbGlkKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMudmVyaWZpZXJQYXR0ZXJuLnRlc3Qoa2V5KSB8fCB0aGlzLndpbGRjYXJkcy5pbmRleE9mKGtleSkgPi0xO1xuICB9XG59XG4iLCIvKiBAZmxvdyAqL1xuaW1wb3J0IFF1ZXVlIGZyb20gJy4vcXVldWUnO1xuaW1wb3J0IHsgZXhjbHVkZVNwZWNpZmljVGFza3MsIGxvZywgaGFzTWV0aG9kLCBpc0Z1bmN0aW9uIH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgU3RvcmFnZUNhcHN1bGUgZnJvbSAnLi9zdG9yYWdlLWNhcHN1bGUnO1xuaW1wb3J0IHR5cGUgSVRhc2sgZnJvbSAnLi4vaW50ZXJmYWNlcy90YXNrJztcbmltcG9ydCB0eXBlIElKb2IgZnJvbSAnLi4vaW50ZXJmYWNlcy9qb2InO1xuaW1wb3J0IHR5cGUgSUpvYkluc3RhbmNlIGZyb20gJy4uL2ludGVyZmFjZXMvam9iJztcblxuLyoqXG4gKiBHZXQgdW5mcmVlemVkIHRhc2tzIGJ5IHRoZSBmaWx0ZXIgZnVuY3Rpb25cbiAqIENvbnRleHQ6IFF1ZXVlXG4gKlxuICogQHJldHVybiB7SVRhc2t9XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUYXNrc1dpdGhvdXRGcmVlemVkKCk6IElUYXNrIHtcbiAgcmV0dXJuIGRiXG4gICAgLmNhbGwodGhpcylcbiAgICAuYWxsKClcbiAgICAuZmlsdGVyKGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzLmJpbmQoW1wiZnJlZXplZFwiXSkpO1xufVxuXG4vKipcbiAqIFNob3J0ZW5zIGZ1bmN0aW9uIHRoZSBkYiBiZWxvbmdzdG8gY3VycmVudCBjaGFubmVsXG4gKiBDb250ZXh0OiBRdWV1ZVxuICpcbiAqIEByZXR1cm4ge1N0b3JhZ2VDYXBzdWxlfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGIoKTogU3RvcmFnZUNhcHN1bGUge1xuICByZXR1cm4gKHRoaXM6YW55KS5zdG9yYWdlLmNoYW5uZWwoKHRoaXM6YW55KS5jdXJyZW50Q2hhbm5lbCk7XG59XG5cbi8qKlxuICogTG9nIHByb3h5IGhlbHBlclxuICogQ29udGV4dDogUXVldWVcbiAqXG4gKiBAcmV0dXJuIHt2b2lkfVxuICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICogQHBhcmFtIHtzdHJpbmd9IGRhdGFcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gY29uZFxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9nUHJveHkoa2V5OiBzdHJpbmcsIGRhdGE6IHN0cmluZywgY29uZDogYm9vbGVhbiA9IHRydWUpOiB2b2lkIHtcbiAgbG9nLmNhbGwoXG4gICAgLy8gZGVidWcgbW9kZSBzdGF0dXNcbiAgICAodGhpczphbnkpLmNvbmZpZy5nZXQoJ2RlYnVnJyksXG5cbiAgICAvLyBsb2cgYXJndW1lbnRzXG4gICAgLi4uYXJndW1lbnRzXG4gICk7XG59XG5cbi8qKlxuICogTmV3IHRhc2sgc2F2ZSBoZWxwZXJcbiAqIENvbnRleHQ6IFF1ZXVlXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHJldHVybiB7c3RyaW5nfGJvb2xlYW59XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzYXZlVGFzayh0YXNrOiBJVGFzayk6IHN0cmluZyB8IGJvb2xlYW4ge1xuICByZXR1cm4gZGIuY2FsbCh0aGlzKS5zYXZlKGNoZWNrUHJpb3JpdHkodGFzaykpO1xufVxuXG4vKipcbiAqIFRhc2sgcmVtb3ZlIGhlbHBlclxuICogQ29udGV4dDogUXVldWVcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gaWRcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVUYXNrKGlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIGRiLmNhbGwodGhpcykuZGVsZXRlKGlkKTtcbn1cblxuLyoqXG4gKiBFdmVudHMgZGlzcGF0Y2hlciBoZWxwZXJcbiAqIENvbnRleHQ6IFF1ZXVlXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAqIEByZXR1cm4ge3ZvaWR9XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXNwYXRjaEV2ZW50cyh0YXNrOiBJVGFzaywgdHlwZTogc3RyaW5nKTogYm9vbGVhbnx2b2lkIHtcbiAgaWYgKCEgKFwidGFnXCIgaW4gdGFzaykpIHJldHVybiBmYWxzZTtcbiAgY29uc3QgZXZlbnRzID0gW1xuICAgIFtgJHt0YXNrLnRhZ306JHt0eXBlfWAsICdmaXJlZCddLFxuICAgIFtgJHt0YXNrLnRhZ306KmAsICd3aWxkY2FyZC1maXJlZCddXG4gIF07XG5cbiAgZm9yIChjb25zdCBldmVudCBvZiBldmVudHMpIHtcbiAgICB0aGlzLmV2ZW50LmVtaXQoZXZlbnRbMF0sIHRhc2spO1xuICAgIGxvZ1Byb3h5LmNhbGwoKHRoaXM6YW55KSwgYGV2ZW50LiR7ZXZlbnRbMV19YCwgZXZlbnRbMF0pO1xuICB9XG59XG5cbi8qKlxuICogVGFzayBwcmlvcml0eSBjb250cm9sbGVyIGhlbHBlclxuICogQ29udGV4dDogUXVldWVcbiAqXG4gKiBAcmV0dXJuIHtJVGFza31cbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrUHJpb3JpdHkodGFzazogSVRhc2spOiBJVGFzayB7XG4gIHRhc2sucHJpb3JpdHkgPSB0YXNrLnByaW9yaXR5IHx8IDA7XG5cbiAgaWYgKGlzTmFOKHRhc2sucHJpb3JpdHkpKSB0YXNrLnByaW9yaXR5ID0gMDtcblxuICByZXR1cm4gdGFzaztcbn1cblxuLyoqXG4gKiBUaW1lb3V0IGNyZWF0b3IgaGVscGVyXG4gKiBDb250ZXh0OiBRdWV1ZVxuICpcbiAqIEByZXR1cm4ge251bWJlcn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRpbWVvdXQoKTogbnVtYmVyIHtcbiAgLy8gaWYgcnVubmluZyBhbnkgam9iLCBzdG9wIGl0XG4gIC8vIHRoZSBwdXJwb3NlIGhlcmUgaXMgdG8gcHJldmVudCBjb2N1cnJlbnQgb3BlcmF0aW9uIGluIHNhbWUgY2hhbm5lbFxuICBjbGVhclRpbWVvdXQodGhpcy5jdXJyZW50VGltZW91dCk7XG5cbiAgY29uc3QgdGFzazogSVRhc2sgPSBkYi5jYWxsKHRoaXMpLmZldGNoKCkuc2hpZnQoKTtcblxuICBpZiAodGFzayA9PT0gdW5kZWZpbmVkKSB7XG4gICAgbG9nUHJveHkuY2FsbCh0aGlzLCAncXVldWUuZW1wdHknLCB0aGlzLmN1cnJlbnRDaGFubmVsKTtcbiAgICBzdG9wUXVldWUuY2FsbCh0aGlzKTtcbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIGlmICghIHRoaXMuY29udGFpbmVyLmhhcyh0YXNrLmhhbmRsZXIpKSB7XG4gICAgbG9nUHJveHkuY2FsbCh0aGlzLCAncXVldWUubm90LWZvdW5kJywgdGFzay5oYW5kbGVyKTtcbiAgICBmYWlsZWRKb2JIYW5kbGVyLmNhbGwodGhpcywgdGFzaykuY2FsbCgpO1xuICAgIHJldHVybiAxO1xuICB9XG5cbiAgY29uc3Qgam9iOiBJSm9iID0gdGhpcy5jb250YWluZXIuZ2V0KHRhc2suaGFuZGxlcik7XG4gIGNvbnN0IGpvYkluc3RhbmNlOiBJSm9iSW5zdGFuY2UgPSBuZXcgam9iLmhhbmRsZXIoKTtcblxuICAvLyBnZXQgYWx3YXlzIGxhc3QgdXBkYXRlZCBjb25maWcgdmFsdWVcbiAgY29uc3QgdGltZW91dDogbnVtYmVyID0gam9iSW5zdGFuY2UudGltZW91dCB8fCB0aGlzLmNvbmZpZy5nZXQoXCJ0aW1lb3V0XCIpO1xuXG4gIGNvbnN0IGhhbmRsZXI6IEZ1bmN0aW9uID0gbG9vcEhhbmRsZXIuY2FsbCh0aGlzLCB0YXNrLCBqb2IsIGpvYkluc3RhbmNlKS5iaW5kKHRoaXMpO1xuXG4gIC8vIGNyZWF0ZSBuZXcgdGltZW91dCBmb3IgcHJvY2VzcyBhIGpvYiBpbiBxdWV1ZVxuICAvLyBiaW5kaW5nIGxvb3BIYW5kbGVyIGZ1bmN0aW9uIHRvIHNldFRpbWVvdXRcbiAgLy8gdGhlbiByZXR1cm4gdGhlIHRpbWVvdXQgaW5zdGFuY2VcbiAgcmV0dXJuICh0aGlzLmN1cnJlbnRUaW1lb3V0ID0gc2V0VGltZW91dChoYW5kbGVyLCB0aW1lb3V0KSk7XG59XG5cbi8qKlxuICogSm9iIGhhbmRsZXIgaGVscGVyXG4gKiBDb250ZXh0OiBRdWV1ZVxuICpcbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqIEBwYXJhbSB7SUpvYn0gam9iXG4gKiBAcGFyYW0ge0lKb2JJbnN0YW5jZX0gam9iSW5zdGFuY2VcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9vcEhhbmRsZXIodGFzazogSVRhc2ssIGpvYjogSUpvYiwgam9iSW5zdGFuY2U6IElKb2JJbnN0YW5jZSk6IEZ1bmN0aW9uIHtcbiAgcmV0dXJuICgpOiB2b2lkID0+IHtcbiAgICBjb25zdCBzZWxmOiBRdWV1ZSA9IHRoaXM7XG5cbiAgICAvLyBsb2NrIHRoZSBjdXJyZW50IHRhc2sgZm9yIHByZXZlbnQgcmFjZSBjb25kaXRpb25cbiAgICBsb2NrVGFzay5jYWxsKHNlbGYsIHRhc2spO1xuXG4gICAgLy8gZmlyZSBqb2IgYmVmb3JlIGV2ZW50XG4gICAgZmlyZUpvYklubGluZUV2ZW50LmNhbGwodGhpcywgXCJiZWZvcmVcIiwgam9iSW5zdGFuY2UsIHRhc2suYXJncyk7XG5cbiAgICAvLyBkaXNwYWN0aCBjdXN0b20gYmVmb3JlIGV2ZW50XG4gICAgZGlzcGF0Y2hFdmVudHMuY2FsbCh0aGlzLCB0YXNrLCBcImJlZm9yZVwiKTtcblxuICAgIC8vIHByZXBhcmluZyB3b3JrZXIgZGVwZW5kZW5jaWVzXG4gICAgY29uc3QgZGVwZW5kZW5jaWVzID0gT2JqZWN0LnZhbHVlcyhqb2IuZGVwcyB8fCB7fSk7XG5cbiAgICAvLyBUYXNrIHJ1bm5lciBwcm9taXNlXG4gICAgam9iSW5zdGFuY2UuaGFuZGxlXG4gICAgICAuY2FsbChqb2JJbnN0YW5jZSwgdGFzay5hcmdzLCAuLi5kZXBlbmRlbmNpZXMpXG4gICAgICAudGhlbihzdWNjZXNzSm9iSGFuZGxlci5jYWxsKHNlbGYsIHRhc2ssIGpvYkluc3RhbmNlKS5iaW5kKHNlbGYpKVxuICAgICAgLmNhdGNoKGZhaWxlZEpvYkhhbmRsZXIuY2FsbChzZWxmLCB0YXNrLCBqb2JJbnN0YW5jZSkuYmluZChzZWxmKSk7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgb2YgdGhlIGxvY2sgdGFzayBvZiB0aGUgY3VycmVudCBqb2JcbiAqIENvbnRleHQ6IFF1ZXVlXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvY2tUYXNrKHRhc2s6IElUYXNrKTogYm9vbGVhbiB7XG4gIHJldHVybiBkYi5jYWxsKHRoaXMpLnVwZGF0ZSh0YXNrLl9pZCwgeyBsb2NrZWQ6IHRydWUgfSk7XG59XG5cbi8qKlxuICogUXVldWUgc3RvcHBlciBoZWxwZXJcbiAqIENvbnRleHQ6IFF1ZXVlXG4gKlxuICogQHJldHVybiB7dm9pZH1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0b3BRdWV1ZSgpOiB2b2lkIHtcbiAgdGhpcy5zdG9wKCk7XG5cbiAgY2xlYXJUaW1lb3V0KHRoaXMuY3VycmVudFRpbWVvdXQpO1xuXG4gIGxvZ1Byb3h5LmNhbGwodGhpcywgJ3F1ZXVlLnN0b3BwZWQnLCAnc3RvcCcpO1xufVxuXG4vKipcbiAqIENsYXNzIGV2ZW50IGx1YW5jaGVyIGhlbHBlclxuICogQ29udGV4dDogUXVldWVcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtJSm9iSW5zdGFuY2V9IGpvYlxuICogQHBhcmFtIHthbnl9IGFyZ3NcbiAqIEByZXR1cm4ge2Jvb2xlYW58dm9pZH1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpcmVKb2JJbmxpbmVFdmVudChuYW1lOiBzdHJpbmcsIGpvYjogSUpvYkluc3RhbmNlLCBhcmdzOiBhbnkpOiBib29sZWFufHZvaWQge1xuICBpZiAoIWhhc01ldGhvZChqb2IsIG5hbWUpKSByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKG5hbWUgPT0gXCJiZWZvcmVcIiAmJiBpc0Z1bmN0aW9uKGpvYi5iZWZvcmUpKSB7XG4gICAgam9iLmJlZm9yZS5jYWxsKGpvYiwgYXJncyk7XG4gIH0gZWxzZSBpZiAobmFtZSA9PSBcImFmdGVyXCIgJiYgaXNGdW5jdGlvbihqb2IuYWZ0ZXIpKSB7XG4gICAgam9iLmFmdGVyLmNhbGwoam9iLCBhcmdzKTtcbiAgfVxufVxuXG4vKipcbiAqIFN1Y2NlZWQgam9iIGhhbmRsZXJcbiAqIENvbnRleHQ6IFF1ZXVlXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHBhcmFtIHtJSm9iSW5zdGFuY2V9IGpvYlxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdWNjZXNzSm9iSGFuZGxlcih0YXNrOiBJVGFzaywgam9iOiBJSm9iSW5zdGFuY2UpOiBGdW5jdGlvbiB7XG4gIGNvbnN0IHNlbGY6IFF1ZXVlID0gdGhpcztcbiAgcmV0dXJuIGZ1bmN0aW9uKHJlc3VsdDogYm9vbGVhbik6IHZvaWQge1xuICAgIC8vIGRpc3BhdGNoIGpvYiBwcm9jZXNzIGFmdGVyIHJ1bnMgYSB0YXNrIGJ1dCBvbmx5IG5vbiBlcnJvciBqb2JzXG4gICAgZGlzcGF0Y2hQcm9jZXNzLmNhbGwoc2VsZiwgcmVzdWx0LCB0YXNrLCBqb2IpO1xuXG4gICAgLy8gZmlyZSBqb2IgYWZ0ZXIgZXZlbnRcbiAgICBmaXJlSm9iSW5saW5lRXZlbnQuY2FsbChzZWxmLCBcImFmdGVyXCIsIGpvYiwgdGFzay5hcmdzKTtcblxuICAgIC8vIGRpc3BhY3RoIGN1c3RvbSBhZnRlciBldmVudFxuICAgIGRpc3BhdGNoRXZlbnRzLmNhbGwoc2VsZiwgdGFzaywgXCJhZnRlclwiKTtcblxuICAgIC8vIHRyeSBuZXh0IHF1ZXVlIGpvYlxuICAgIHNlbGYubmV4dCgpO1xuICB9O1xufVxuXG4vKipcbiAqIEZhaWxlZCBqb2IgaGFuZGxlclxuICogQ29udGV4dDogUXVldWVcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcmV0dXJuIHtJVGFza30gam9iXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZhaWxlZEpvYkhhbmRsZXIodGFzazogSVRhc2ssIGpvYj86IElKb2JJbnN0YW5jZSk6IEZ1bmN0aW9uIHtcbiAgcmV0dXJuIChyZXN1bHQ6IGJvb2xlYW4pOiB2b2lkID0+IHtcbiAgICByZW1vdmVUYXNrLmNhbGwodGhpcywgdGFzay5faWQpO1xuXG4gICAgdGhpcy5ldmVudC5lbWl0KFwiZXJyb3JcIiwgdGFzayk7XG5cbiAgICB0aGlzLm5leHQoKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBub24tZXJyb3Igam9iIHByb2Nlc3MgYWZ0ZXIgcnVuc1xuICogQ29udGV4dDogUXVldWVcbiAqXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHJlc3VsdFxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHBhcmFtIHtJSm9iSW5zdGFuY2V9IGpvYlxuICogQHJldHVybiB7dm9pZH1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpc3BhdGNoUHJvY2VzcyhyZXN1bHQ6IGJvb2xlYW4sIHRhc2s6IElUYXNrLCBqb2I6IElKb2IpOiB2b2lkIHtcbiAgY29uc3Qgc2VsZjogUXVldWUgPSB0aGlzO1xuICBpZiAocmVzdWx0KSB7XG4gICAgc3VjY2Vzc1Byb2Nlc3MuY2FsbChzZWxmLCB0YXNrLCBqb2IpO1xuICB9IGVsc2Uge1xuICAgIHJldHJ5UHJvY2Vzcy5jYWxsKHNlbGYsIHRhc2ssIGpvYik7XG4gIH1cbn1cblxuLyoqXG4gKiBQcm9jZXNzIGhhbmRsZXIgb2Ygc3VjY2VlZGVkIGpvYlxuICogQ29udGV4dDogUXVldWVcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcGFyYW0ge0lKb2JJbnN0YW5jZX0gam9iXG4gKiBAcmV0dXJuIHt2b2lkfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3VjY2Vzc1Byb2Nlc3ModGFzazogSVRhc2ssIGpvYjogSUpvYkluc3RhbmNlKTogdm9pZCB7XG4gIHJlbW92ZVRhc2suY2FsbCh0aGlzLCB0YXNrLl9pZCk7XG59XG5cbi8qKlxuICogUHJvY2VzcyBoYW5kbGVyIG9mIHN1Y2NlZWRlZCBqb2JcbiAqIENvbnRleHQ6IFF1ZXVlXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHBhcmFtIHtJSm9iSW5zdGFuY2V9IGpvYlxuICogQHJldHVybiB7dm9pZH1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXR1c09mZigpOiB2b2lkIHtcbiAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG59XG5cbi8qKlxuICogUHJvY2VzcyBoYW5kbGVyIG9mIHJldHJpZWQgam9iXG4gKiBDb250ZXh0OiBRdWV1ZVxuICpcbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqIEBwYXJhbSB7SUpvYkluc3RhbmNlfSBqb2JcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXRyeVByb2Nlc3ModGFzazogSVRhc2ssIGpvYjogSUpvYkluc3RhbmNlKTogYm9vbGVhbiB7XG4gIC8vIGRpc3BhY3RoIGN1c3RvbSByZXRyeSBldmVudFxuICBkaXNwYXRjaEV2ZW50cy5jYWxsKHRoaXMsIHRhc2ssIFwicmV0cnlcIik7XG5cbiAgLy8gdXBkYXRlIHJldHJ5IHZhbHVlXG4gIGxldCB1cGRhdGVUYXNrOiBJVGFzayA9IHVwZGF0ZVJldHJ5LmNhbGwodGhpcywgdGFzaywgam9iKTtcblxuICAvLyBkZWxldGUgbG9jayBwcm9wZXJ0eSBmb3IgbmV4dCBwcm9jZXNzXG4gIHVwZGF0ZVRhc2subG9ja2VkID0gZmFsc2U7XG5cbiAgcmV0dXJuIGRiLmNhbGwodGhpcykudXBkYXRlKHRhc2suX2lkLCB1cGRhdGVUYXNrKTtcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciBhIHRhc2sgaXMgcmVwbGljYWJsZSBvciBub3RcbiAqIENvbnRleHQ6IFF1ZXVlXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhbk11bHRpcGxlKHRhc2s6IElUYXNrKTogYm9vbGVhbiB7XG4gIGlmICh0eXBlb2YgdGFzayAhPT0gXCJvYmplY3RcIiB8fCB0YXNrLnVuaXF1ZSAhPT0gdHJ1ZSkgcmV0dXJuIHRydWU7XG5cbiAgcmV0dXJuIHRoaXMuaGFzQnlUYWcodGFzay50YWcpIDwgMTtcbn1cblxuLyoqXG4gKiBVcGRhdGUgdGFzaydzIHJldHJ5IHZhbHVlXG4gKiBDb250ZXh0OiBRdWV1ZVxuICpcbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqIEBwYXJhbSB7SUpvYkluc3RhbmNlfSBqb2JcbiAqIEByZXR1cm4ge0lUYXNrfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlUmV0cnkodGFzazogSVRhc2ssIGpvYjogSUpvYkluc3RhbmNlKTogSVRhc2sge1xuICBpZiAoIShcInJldHJ5XCIgaW4gam9iKSkgam9iLnJldHJ5ID0gMTtcblxuICBpZiAoIShcInRyaWVkXCIgaW4gdGFzaykpIHtcbiAgICB0YXNrLnRyaWVkID0gMDtcbiAgICB0YXNrLnJldHJ5ID0gam9iLnJldHJ5O1xuICB9XG5cbiAgKyt0YXNrLnRyaWVkO1xuXG4gIGlmICh0YXNrLnRyaWVkID49IGpvYi5yZXRyeSkge1xuICAgIHRhc2suZnJlZXplZCA9IHRydWU7XG4gIH1cblxuICByZXR1cm4gdGFzaztcbn1cblxuLyoqXG4gKiBKb2IgaGFuZGxlciBjbGFzcyByZWdpc3RlclxuICogQ29udGV4dDogUXVldWVcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcGFyYW0ge0lKb2JJbnN0YW5jZX0gam9iXG4gKiBAcmV0dXJuIHt2b2lkfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJKb2JzKCk6IHZvaWQge1xuICBpZiAoUXVldWUuaXNSZWdpc3RlcmVkKSByZXR1cm47XG5cbiAgY29uc3Qgam9iczogSUpvYltdID0gUXVldWUuam9icyB8fCBbXTtcblxuICBmb3IgKGNvbnN0IGpvYiBvZiBqb2JzKSB7XG4gICAgY29uc3QgZnVuY1N0ciA9IGpvYi5oYW5kbGVyLnRvU3RyaW5nKCk7XG4gICAgY29uc3QgW3N0ckZ1bmN0aW9uLCBuYW1lXSA9IGZ1bmNTdHIubWF0Y2goL2Z1bmN0aW9uXFxzKFthLXpBLVpfXSspLio/Lyk7XG4gICAgaWYgKG5hbWUpIHRoaXMuY29udGFpbmVyLmJpbmQobmFtZSwgam9iKTtcbiAgfVxuXG4gIFF1ZXVlLmlzUmVnaXN0ZXJlZCA9IHRydWU7XG59XG4iLCJpbXBvcnQgUXVldWUgZnJvbSAnLi9xdWV1ZSc7XG5cbndpbmRvdy5RdWV1ZSA9IFF1ZXVlO1xuXG5leHBvcnQgZGVmYXVsdCBRdWV1ZTtcbiIsIi8qIEBmbG93ICovXG5pbXBvcnQgdHlwZSBJQ29uZmlnIGZyb20gXCIuLi9pbnRlcmZhY2VzL2NvbmZpZ1wiO1xuaW1wb3J0IHR5cGUgSVRhc2sgZnJvbSBcIi4uL2ludGVyZmFjZXMvdGFza1wiO1xuaW1wb3J0IHR5cGUgSUpvYiBmcm9tIFwiLi4vaW50ZXJmYWNlcy9qb2JcIjtcbmltcG9ydCB0eXBlIElKb2JJbnN0YW5jZSBmcm9tIFwiLi4vaW50ZXJmYWNlcy9qb2JcIjtcbmltcG9ydCBMb2NhbFN0b3JhZ2UgZnJvbSBcIi4vc3RvcmFnZS9sb2NhbHN0b3JhZ2VcIjtcbmltcG9ydCBDb250YWluZXIgZnJvbSBcIi4vY29udGFpbmVyXCI7XG5pbXBvcnQgU3RvcmFnZUNhcHN1bGUgZnJvbSBcIi4vc3RvcmFnZS1jYXBzdWxlXCI7XG5pbXBvcnQgQ29uZmlnIGZyb20gXCIuL2NvbmZpZ1wiO1xuaW1wb3J0IEV2ZW50IGZyb20gXCIuL2V2ZW50XCI7XG5cbmltcG9ydCB7XG4gIGxvZyxcbiAgY2xvbmUsXG4gIGhhc01ldGhvZCxcbiAgaXNGdW5jdGlvbixcbiAgZXhjbHVkZVNwZWNpZmljVGFza3MsXG4gIHV0aWxDbGVhckJ5VGFnXG59IGZyb20gXCIuL3V0aWxzXCI7XG5cbmltcG9ydCB7XG4gIGdldFRhc2tzV2l0aG91dEZyZWV6ZWQsXG4gIGZpcmVKb2JJbmxpbmVFdmVudCxcbiAgZGlzcGF0Y2hFdmVudHMsXG4gIGNyZWF0ZVRpbWVvdXQsXG4gIGxvb3BIYW5kbGVyLFxuICByZWdpc3RlckpvYnMsXG4gIGNhbk11bHRpcGxlLFxuICBzdG9wUXVldWUsXG4gIHN0YXR1c09mZixcbiAgbG9nUHJveHksXG4gIHNhdmVUYXNrLFxuICBkYlxufSBmcm9tICcuL2hlbHBlcnMnO1xuXG5cbmxldCBRdWV1ZSA9ICgoKSA9PiB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIFF1ZXVlLkZJRk8gPSBcImZpZm9cIjtcbiAgUXVldWUuTElGTyA9IFwibGlmb1wiO1xuXG4gIGZ1bmN0aW9uIFF1ZXVlKGNvbmZpZzogSUNvbmZpZykge1xuICAgIF9jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsIGNvbmZpZyk7XG4gIH1cblxuICBmdW5jdGlvbiBfY29uc3RydWN0b3IoY29uZmlnKSB7XG4gICAgdGhpcy5jaGFubmVscyA9IHt9XG4gICAgdGhpcy5jb25maWcgPSBuZXcgQ29uZmlnKGNvbmZpZyk7XG4gICAgdGhpcy5zdG9yYWdlID0gbmV3IFN0b3JhZ2VDYXBzdWxlKFxuICAgICAgdGhpcy5jb25maWcsXG4gICAgICBuZXcgTG9jYWxTdG9yYWdlKHRoaXMuY29uZmlnKVxuICAgICk7XG4gICAgdGhpcy50aW1lb3V0ID0gdGhpcy5jb25maWcuZ2V0KFwidGltZW91dFwiKTtcbiAgfVxuXG4gIFF1ZXVlLnByb3RvdHlwZS5jdXJyZW50Q2hhbm5lbDtcbiAgUXVldWUucHJvdG90eXBlLmN1cnJlbnRDaGFubmVsO1xuICBRdWV1ZS5wcm90b3R5cGUuc3RvcHBlZCA9IHRydWU7XG4gIFF1ZXVlLnByb3RvdHlwZS5ydW5uaW5nID0gZmFsc2U7XG4gIFF1ZXVlLnByb3RvdHlwZS5ldmVudCA9IG5ldyBFdmVudDtcbiAgUXVldWUucHJvdG90eXBlLmNvbnRhaW5lciA9IG5ldyBDb250YWluZXI7XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBuZXcgam9iIHRvIGNoYW5uZWxcbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSB0YXNrXG4gICAqIEByZXR1cm4ge1N0cmluZ3xCb29sZWFufSBqb2JcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIFF1ZXVlLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbih0YXNrKTogc3RyaW5nIHwgYm9vbGVhbiB7XG4gICAgaWYgKCFjYW5NdWx0aXBsZS5jYWxsKHRoaXMsIHRhc2spKSByZXR1cm4gZmFsc2U7XG5cbiAgICBjb25zdCBpZCA9IHNhdmVUYXNrLmNhbGwodGhpcywgdGFzayk7XG5cbiAgICBpZiAoaWQgJiYgdGhpcy5zdG9wcGVkICYmIHRoaXMucnVubmluZyA9PT0gdHJ1ZSkge1xuICAgICAgY29uc29sZS5sb2coJ1dXRUVFJyxpZCwgdGhpcy5zdG9wcGVkLCB0aGlzLnJ1bm5pbmcpO1xuICAgICAgdGhpcy5zdGFydCgpO1xuICAgIH1cblxuICAgIC8vIHBhc3MgYWN0aXZpdHkgdG8gdGhlIGxvZyBzZXJ2aWNlLlxuICAgIGxvZ1Byb3h5LmNhbGwodGhpcywgJ3F1ZXVlLmNyZWF0ZWQnLCB0YXNrLmhhbmRsZXIpO1xuXG4gICAgcmV0dXJuIGlkO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQcm9jZXNzIG5leHQgam9iXG4gICAqXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBRdWV1ZS5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnN0b3BwZWQpIHtcbiAgICAgIHN0YXR1c09mZi5jYWxsKHRoaXMpO1xuICAgICAgcmV0dXJuIHN0b3BRdWV1ZS5jYWxsKHRoaXMpO1xuICAgIH1cblxuICAgIGxvZ1Byb3h5LmNhbGwodGhpcywgJ3F1ZXVlLm5leHQnLCAnbmV4dCcpO1xuXG4gICAgdGhpcy5zdGFydCgpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTdGFydCBxdWV1ZSBsaXN0ZW5lclxuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufSBqb2JcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIFF1ZXVlLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCk6IGJvb2xlYW4ge1xuICAgIC8vIFN0b3AgdGhlIHF1ZXVlIGZvciByZXN0YXJ0XG4gICAgdGhpcy5zdG9wcGVkID0gZmFsc2U7XG5cbiAgICAvLyBSZWdpc3RlciB0YXNrcywgaWYgbm90IHJlZ2lzdGVyZWRcbiAgICByZWdpc3RlckpvYnMuY2FsbCh0aGlzKTtcblxuICAgIGxvZ1Byb3h5LmNhbGwodGhpcywgJ3F1ZXVlLnN0YXJ0aW5nJywgJ3N0YXJ0Jyk7XG5cbiAgICAvLyBDcmVhdGUgYSB0aW1lb3V0IGZvciBzdGFydCBxdWV1ZVxuICAgIHRoaXMucnVubmluZyA9IGNyZWF0ZVRpbWVvdXQuY2FsbCh0aGlzKSA+IDA7XG5cbiAgICByZXR1cm4gdGhpcy5ydW5uaW5nO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTdG9wIHF1ZXVlIGxpc3RlbmVyIGFmdGVyIGVuZCBvZiBjdXJyZW50IHRhc2tcbiAgICpcbiAgICogQHJldHVybiB7Vm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIFF1ZXVlLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKTogdm9pZCB7XG4gICAgbG9nUHJveHkuY2FsbCh0aGlzLCAncXVldWUuc3RvcHBpbmcnLCAnc3RvcCcpO1xuICAgIHRoaXMuc3RvcHBlZCA9IHRydWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIFN0b3AgcXVldWUgbGlzdGVuZXIgaW5jbHVkaW5nIGN1cnJlbnQgdGFza1xuICAgKlxuICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgUXVldWUucHJvdG90eXBlLmZvcmNlU3RvcCA9IGZ1bmN0aW9uKCk6IHZvaWQge1xuICAgIHN0b3BRdWV1ZS5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgY2hhbm5lbFxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHRhc2tcbiAgICogQHJldHVybiB7UXVldWV9IGNoYW5uZWxcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIFF1ZXVlLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbihjaGFubmVsOiBzdHJpbmcpOiBRdWV1ZSB7XG4gICAgaWYgKCEoY2hhbm5lbCBpbiB0aGlzLmNoYW5uZWxzKSkge1xuICAgICAgdGhpcy5jdXJyZW50Q2hhbm5lbCA9IGNoYW5uZWw7XG4gICAgICB0aGlzLmNoYW5uZWxzW2NoYW5uZWxdID0gY2xvbmUodGhpcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuY2hhbm5lbHNbY2hhbm5lbF07XG4gIH07XG5cbiAgLyoqXG4gICAqIEdldCBjaGFubmVsIGluc3RhbmNlIGJ5IGNoYW5uZWwgbmFtZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVcbiAgICogQHJldHVybiB7UXVldWV9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBRdWV1ZS5wcm90b3R5cGUuY2hhbm5lbCA9IGZ1bmN0aW9uKG5hbWU6IHN0cmluZyk6IFF1ZXVlIHtcbiAgICBpZiAoIXRoaXMuY2hhbm5lbHNbbmFtZV0pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2hhbm5lbCBvZiBcIiR7bmFtZX1cIiBub3QgZm91bmRgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5jaGFubmVsc1tuYW1lXTtcbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciB0aGVyZSBpcyBhbnkgdGFza1xuICAgKlxuICAgKiBAcmV0dXJuIHtCb29lbGFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgUXVldWUucHJvdG90eXBlLmlzRW1wdHkgPSBmdW5jdGlvbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jb3VudCgpIDwgMTtcbiAgfTtcblxuICAvKipcbiAgICogR2V0IHRhc2sgY291bnRcbiAgICpcbiAgICogQHJldHVybiB7TnVtYmVyfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgUXVldWUucHJvdG90eXBlLmNvdW50ID0gZnVuY3Rpb24oKTogQXJyYXk8SVRhc2s+IHtcbiAgICByZXR1cm4gZ2V0VGFza3NXaXRob3V0RnJlZXplZC5jYWxsKHRoaXMpLmxlbmd0aDtcbiAgfTtcblxuICAvKipcbiAgICogR2V0IHRhc2sgY291bnQgYnkgdGFnXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gdGFnXG4gICAqIEByZXR1cm4ge0FycmF5PElUYXNrPn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIFF1ZXVlLnByb3RvdHlwZS5jb3VudEJ5VGFnID0gZnVuY3Rpb24odGFnOiBzdHJpbmcpOiBBcnJheTxJVGFzaz4ge1xuICAgIHJldHVybiBnZXRUYXNrc1dpdGhvdXRGcmVlemVkLmNhbGwodGhpcykuZmlsdGVyKHQgPT4gdC50YWcgPT09IHRhZykubGVuZ3RoO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZW1vdmUgYWxsIHRhc2tzIGZyb20gY2hhbm5lbFxuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgUXVldWUucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKTogYm9vbGVhbiB7XG4gICAgaWYgKCEgdGhpcy5jdXJyZW50Q2hhbm5lbCkgcmV0dXJuIGZhbHNlO1xuICAgIHRoaXMuc3RvcmFnZS5jbGVhcih0aGlzLmN1cnJlbnRDaGFubmVsKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvKipcbiAgICogUmVtb3ZlIGFsbCB0YXNrcyBmcm9tIGNoYW5uZWwgYnkgdGFnXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gdGFnXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBRdWV1ZS5wcm90b3R5cGUuY2xlYXJCeVRhZyA9IGZ1bmN0aW9uKHRhZzogc3RyaW5nKTogdm9pZCB7XG4gICAgZGJcbiAgICAgIC5jYWxsKHRoaXMpXG4gICAgICAuYWxsKClcbiAgICAgIC5maWx0ZXIodXRpbENsZWFyQnlUYWcuYmluZCh0YWcpKVxuICAgICAgLmZvckVhY2godCA9PiBkYi5jYWxsKHRoaXMpLmRlbGV0ZSh0Ll9pZCkpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVjayBhIHRhc2sgd2hldGhlciBleGlzdHMgYnkgam9iIGlkXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gdGFnXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBRdWV1ZS5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24oaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBnZXRUYXNrc1dpdGhvdXRGcmVlemVkLmNhbGwodGhpcykuZmluZEluZGV4KHQgPT4gdC5faWQgPT09IGlkKSA+IC0xO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVjayBhIHRhc2sgd2hldGhlciBleGlzdHMgYnkgdGFnXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gdGFnXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBRdWV1ZS5wcm90b3R5cGUuaGFzQnlUYWcgPSBmdW5jdGlvbih0YWc6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBnZXRUYXNrc1dpdGhvdXRGcmVlemVkLmNhbGwodGhpcykuZmluZEluZGV4KHQgPT4gdC50YWcgPT09IHRhZykgPiAtMTtcbiAgfTtcblxuICAvKipcbiAgICogU2V0IGNvbmZpZyB0aW1lb3V0IHZhbHVlXG4gICAqXG4gICAqIEBwYXJhbSAge051bWJlcn0gdmFsXG4gICAqIEByZXR1cm4ge1ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBRdWV1ZS5wcm90b3R5cGUuc2V0VGltZW91dCA9IGZ1bmN0aW9uKHZhbDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy50aW1lb3V0ID0gdmFsO1xuICAgIHRoaXMuY29uZmlnLnNldChcInRpbWVvdXRcIiwgdmFsKTtcbiAgfTtcblxuICAvKipcbiAgICogU2V0IGNvbmZpZyBsaW1pdCB2YWx1ZVxuICAgKlxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHZhbFxuICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgUXVldWUucHJvdG90eXBlLnNldExpbWl0ID0gZnVuY3Rpb24odmFsOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLmNvbmZpZy5zZXQoXCJsaW1pdFwiLCB2YWwpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTZXQgY29uZmlnIHByZWZpeCB2YWx1ZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHZhbFxuICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgUXVldWUucHJvdG90eXBlLnNldFByZWZpeCA9IGZ1bmN0aW9uKHZhbDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5jb25maWcuc2V0KFwicHJlZml4XCIsIHZhbCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNldCBjb25maWcgcHJpY2lwbGUgdmFsdWVcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSB2YWxcbiAgICogQHJldHVybiB7Vm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIFF1ZXVlLnByb3RvdHlwZS5zZXRQcmluY2lwbGUgPSBmdW5jdGlvbih2YWw6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuY29uZmlnLnNldChcInByaW5jaXBsZVwiLCB2YWwpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTZXQgY29uZmlnIGRlYnVnIHZhbHVlXG4gICAqXG4gICAqIEBwYXJhbSAge0Jvb2xlYW59IHZhbFxuICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgUXVldWUucHJvdG90eXBlLnNldERlYnVnID0gZnVuY3Rpb24odmFsOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5jb25maWcuc2V0KFwiZGVidWdcIiwgdmFsKTtcbiAgfTtcblxuICAvKipcbiAgICogU2V0IGFjdGlvbiBldmVudHNcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHBhcmFtICB7RnVuY3Rpb259IGNiXG4gICAqIEByZXR1cm4ge1ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBRdWV1ZS5wcm90b3R5cGUub24gPSBmdW5jdGlvbihrZXk6IHN0cmluZywgY2I6IEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgdGhpcy5ldmVudC5vbiguLi5hcmd1bWVudHMpO1xuICAgIGxvZ1Byb3h5LmNhbGwodGhpcywgJ2V2ZW50LmNyZWF0ZWQnLCBrZXkpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZWdpc3RlciB3b3JrZXJcbiAgICpcbiAgICogQHBhcmFtICB7QXJyYXk8SUpvYj59IGpvYnNcbiAgICogQHJldHVybiB7Vm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIFF1ZXVlLnJlZ2lzdGVyID0gZnVuY3Rpb24oam9iczogQXJyYXk8SUpvYj4pOiB2b2lkIHtcbiAgICBpZiAoIShqb2JzIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJRdWV1ZSBqb2JzIHNob3VsZCBiZSBvYmplY3RzIHdpdGhpbiBhbiBhcnJheVwiKTtcbiAgICB9XG5cbiAgICBRdWV1ZS5pc1JlZ2lzdGVyZWQgPSBmYWxzZTtcbiAgICBRdWV1ZS5qb2JzID0gam9icztcbiAgfTtcblxuICByZXR1cm4gUXVldWU7XG59KSgpO1xuXG5leHBvcnQgZGVmYXVsdCBRdWV1ZTtcbiIsIi8qIEBmbG93ICovXG5cbmltcG9ydCBncm91cEJ5IGZyb20gXCJncm91cC1ieVwiO1xuaW1wb3J0IExvY2FsU3RvcmFnZSBmcm9tIFwiLi9zdG9yYWdlL2xvY2Fsc3RvcmFnZVwiO1xuaW1wb3J0IHR5cGUgSUNvbmZpZyBmcm9tIFwiLi4vaW50ZXJmYWNlcy9jb25maWdcIjtcbmltcG9ydCB0eXBlIElTdG9yYWdlIGZyb20gXCIuLi9pbnRlcmZhY2VzL3N0b3JhZ2VcIjtcbmltcG9ydCB0eXBlIElUYXNrIGZyb20gXCIuLi9pbnRlcmZhY2VzL3Rhc2tcIjtcbmltcG9ydCBDb25maWcgZnJvbSBcIi4vY29uZmlnXCI7XG5pbXBvcnQgeyBleGNsdWRlU3BlY2lmaWNUYXNrcywgbGlmbywgZmlmbyB9IGZyb20gXCIuL3V0aWxzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0b3JhZ2VDYXBzdWxlIHtcbiAgY29uZmlnOiBJQ29uZmlnO1xuICBzdG9yYWdlOiBJU3RvcmFnZTtcbiAgc3RvcmFnZUNoYW5uZWw6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcihjb25maWc6IElDb25maWcsIHN0b3JhZ2U6IElTdG9yYWdlKSB7XG4gICAgdGhpcy5zdG9yYWdlID0gc3RvcmFnZTtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWxlY3QgYSBjaGFubmVsIGJ5IGNoYW5uZWwgbmFtZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVcbiAgICogQHJldHVybiB7U3RvcmFnZUNhcHN1bGV9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBjaGFubmVsKG5hbWU6IHN0cmluZyk6IFN0b3JhZ2VDYXBzdWxlIHtcbiAgICB0aGlzLnN0b3JhZ2VDaGFubmVsID0gbmFtZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaCB0YXNrcyBmcm9tIHN0b3JhZ2Ugd2l0aCBvcmRlcmVkXG4gICAqXG4gICAqIEByZXR1cm4ge2FueVtdfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgZmV0Y2goKTogQXJyYXk8YW55PiB7XG4gICAgY29uc3QgYWxsID0gdGhpcy5hbGwoKS5maWx0ZXIoZXhjbHVkZVNwZWNpZmljVGFza3MpO1xuICAgIGNvbnN0IHRhc2tzID0gZ3JvdXBCeShhbGwsIFwicHJpb3JpdHlcIik7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRhc2tzKVxuICAgICAgLm1hcChrZXkgPT4gcGFyc2VJbnQoa2V5KSlcbiAgICAgIC5zb3J0KChhLCBiKSA9PiBiIC0gYSlcbiAgICAgIC5yZWR1Y2UodGhpcy5yZWR1Y2VUYXNrcyh0YXNrcyksIFtdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTYXZlIHRhc2sgdG8gc3RvcmFnZVxuICAgKlxuICAgKiBAcGFyYW0gIHtJVGFza30gdGFza1xuICAgKiBAcmV0dXJuIHtTdHJpbmd8Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHNhdmUodGFzazogSVRhc2spOiBzdHJpbmcgfCBib29sZWFuIHtcbiAgICAvLyBnZXQgYWxsIHRhc2tzIGN1cnJlbnQgY2hhbm5lbCdzXG4gICAgY29uc3QgdGFza3M6IElUYXNrW10gPSB0aGlzLnN0b3JhZ2UuZ2V0KHRoaXMuc3RvcmFnZUNoYW5uZWwpO1xuXG4gICAgLy8gQ2hlY2sgdGhlIGNoYW5uZWwgbGltaXQuXG4gICAgLy8gSWYgbGltaXQgaXMgZXhjZWVkZWQsIGRvZXMgbm90IGluc2VydCBuZXcgdGFza1xuICAgIGlmICh0aGlzLmlzRXhjZWVkZWQoKSkge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBgVGFzayBsaW1pdCBleGNlZWRlZDogVGhlICcke1xuICAgICAgICAgIHRoaXMuc3RvcmFnZUNoYW5uZWxcbiAgICAgICAgfScgY2hhbm5lbCBsaW1pdCBpcyAke3RoaXMuY29uZmlnLmdldChcImxpbWl0XCIpfWBcbiAgICAgICk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gcHJlcGFyZSBhbGwgcHJvcGVydGllcyBiZWZvcmUgc2F2ZVxuICAgIC8vIGV4YW1wbGU6IGNyZWF0ZWRBdCBldGMuXG4gICAgdGFzayA9IHRoaXMucHJlcGFyZVRhc2sodGFzayk7XG5cbiAgICAvLyBhZGQgdGFzayB0byBzdG9yYWdlXG4gICAgdGFza3MucHVzaCh0YXNrKTtcblxuICAgIC8vIHNhdmUgdGFza3NcbiAgICB0aGlzLnN0b3JhZ2Uuc2V0KHRoaXMuc3RvcmFnZUNoYW5uZWwsIEpTT04uc3RyaW5naWZ5KHRhc2tzKSk7XG5cbiAgICByZXR1cm4gdGFzay5faWQ7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIGNoYW5uZWwgc3RvcmUuXG4gICAqXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICogICBUaGUgdmFsdWUuIFRoaXMgYW5ub3RhdGlvbiBjYW4gYmUgdXNlZCBmb3IgdHlwZSBoaW50aW5nIHB1cnBvc2VzLlxuICAgKi9cbiAgdXBkYXRlKGlkOiBzdHJpbmcsIHVwZGF0ZTogeyBbcHJvcGVydHk6IHN0cmluZ106IGFueSB9KTogYm9vbGVhbiB7XG4gICAgY29uc3QgZGF0YTogYW55W10gPSB0aGlzLmFsbCgpO1xuICAgIGNvbnN0IGluZGV4OiBudW1iZXIgPSBkYXRhLmZpbmRJbmRleCh0ID0+IHQuX2lkID09IGlkKTtcblxuICAgIGlmIChpbmRleCA8IDApIHJldHVybiBmYWxzZTtcblxuICAgIC8vIG1lcmdlIGV4aXN0aW5nIG9iamVjdCB3aXRoIGdpdmVuIHVwZGF0ZSBvYmplY3RcbiAgICBkYXRhW2luZGV4XSA9IE9iamVjdC5hc3NpZ24oe30sIGRhdGFbaW5kZXhdLCB1cGRhdGUpO1xuXG4gICAgLy8gc2F2ZSB0byB0aGUgc3RvcmFnZSBhcyBzdHJpbmdcbiAgICB0aGlzLnN0b3JhZ2Uuc2V0KHRoaXMuc3RvcmFnZUNoYW5uZWwsIEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSB0YXNrIGZyb20gc3RvcmFnZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGlkXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBkZWxldGUoaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGRhdGE6IGFueVtdID0gdGhpcy5hbGwoKTtcbiAgICBjb25zdCBpbmRleDogbnVtYmVyID0gZGF0YS5maW5kSW5kZXgoZCA9PiBkLl9pZCA9PT0gaWQpO1xuXG4gICAgaWYgKGluZGV4IDwgMCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgZGVsZXRlIGRhdGFbaW5kZXhdO1xuXG4gICAgdGhpcy5zdG9yYWdlLnNldChcbiAgICAgIHRoaXMuc3RvcmFnZUNoYW5uZWwsXG4gICAgICBKU09OLnN0cmluZ2lmeShkYXRhLmZpbHRlcihkID0+IGQpKVxuICAgICk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCB0YXNrc1xuICAgKlxuICAgKiBAcmV0dXJuIHtBbnlbXX1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFsbCgpOiBBcnJheTxhbnk+IHtcbiAgICByZXR1cm4gdGhpcy5zdG9yYWdlLmdldCh0aGlzLnN0b3JhZ2VDaGFubmVsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSB1bmlxdWUgaWRcbiAgICpcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgZ2VuZXJhdGVJZCgpOiBzdHJpbmcge1xuICAgIHJldHVybiAoKDEgKyBNYXRoLnJhbmRvbSgpKSAqIDB4MTAwMDApLnRvU3RyaW5nKDE2KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgc29tZSBuZWNlc3NhcnkgcHJvcGVydGllc1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGlkXG4gICAqIEByZXR1cm4ge0lUYXNrfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgcHJlcGFyZVRhc2sodGFzazogSVRhc2spOiBJVGFzayB7XG4gICAgdGFzay5jcmVhdGVkQXQgPSBEYXRlLm5vdygpO1xuICAgIHRhc2suX2lkID0gdGhpcy5nZW5lcmF0ZUlkKCk7XG4gICAgcmV0dXJuIHRhc2s7XG4gIH1cblxuICAvKipcbiAgICogQWRkIHNvbWUgbmVjZXNzYXJ5IHByb3BlcnRpZXNcbiAgICpcbiAgICogQHBhcmFtICB7SVRhc2tbXX0gdGFza3NcbiAgICogQHJldHVybiB7RnVuY3Rpb259XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICByZWR1Y2VUYXNrcyh0YXNrczogSVRhc2tbXSkge1xuICAgIGNvbnN0IHJlZHVjZUZ1bmMgPSAocmVzdWx0OiBJVGFza1tdLCBrZXk6IGFueSk6IElUYXNrW10gPT4ge1xuICAgICAgaWYgKHRoaXMuY29uZmlnLmdldChcInByaW5jaXBsZVwiKSA9PT0gXCJsaWZvXCIpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5jb25jYXQodGFza3Nba2V5XS5zb3J0KGxpZm8pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByZXN1bHQuY29uY2F0KHRhc2tzW2tleV0uc29ydChmaWZvKSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiByZWR1Y2VGdW5jLmJpbmQodGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogVGFzayBsaW1pdCBjaGVja2VyXG4gICAqXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBpc0V4Y2VlZGVkKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGxpbWl0OiBudW1iZXIgPSB0aGlzLmNvbmZpZy5nZXQoXCJsaW1pdFwiKTtcbiAgICBjb25zdCB0YXNrczogSVRhc2tbXSA9IHRoaXMuYWxsKCkuZmlsdGVyKGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzKTtcbiAgICByZXR1cm4gIShsaW1pdCA9PT0gLTEgfHwgbGltaXQgPiB0YXNrcy5sZW5ndGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFyIHRhc2tzIHdpdGggZ2l2ZW4gY2hhbm5lbCBuYW1lXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gY2hhbm5lbFxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgY2xlYXIoY2hhbm5lbDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5zdG9yYWdlLmNsZWFyKGNoYW5uZWwpO1xuICB9XG59XG4iLCIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgdHlwZSBJU3RvcmFnZSBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL3N0b3JhZ2UnO1xuaW1wb3J0IHR5cGUgSUNvbmZpZyBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL3N0b3JhZ2UnO1xuaW1wb3J0IHR5cGUgSVRhc2sgZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy90YXNrJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9jYWxTdG9yYWdlIGltcGxlbWVudHMgSVN0b3JhZ2Uge1xuICBzdG9yYWdlOiBPYmplY3Q7XG4gIGNvbmZpZzogSUNvbmZpZztcblxuICBjb25zdHJ1Y3Rvcihjb25maWc6IElDb25maWcpIHtcbiAgICB0aGlzLnN0b3JhZ2UgPSBsb2NhbFN0b3JhZ2U7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gIH1cblxuICAvKipcbiAgICogVGFrZSBpdGVtIGZyb20gc3RvcmFnZSBieSBrZXlcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7SVRhc2tbXX1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGdldChrZXk6IHN0cmluZyk6IEFycmF5PElUYXNrfFtdPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG5hbWUgPSB0aGlzLnN0b3JhZ2VOYW1lKGtleSk7XG4gICAgICByZXR1cm4gdGhpcy5oYXMobmFtZSkgPyBKU09OLnBhcnNlKHRoaXMuc3RvcmFnZS5nZXRJdGVtKG5hbWUpKSA6IFtdO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgaXRlbSB0byBsb2NhbCBzdG9yYWdlXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSAge1N0cmluZ30gdmFsdWVcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHNldChrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmFnZS5zZXRJdGVtKHRoaXMuc3RvcmFnZU5hbWUoa2V5KSwgdmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEl0ZW0gY2hlY2tlciBpbiBsb2NhbCBzdG9yYWdlXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBoYXMoa2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4ga2V5IGluIHRoaXMuc3RvcmFnZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgaXRlbVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgY2xlYXIoa2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnN0b3JhZ2UucmVtb3ZlSXRlbSh0aGlzLnN0b3JhZ2VOYW1lKGtleSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbGwgaXRlbXNcbiAgICpcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGNsZWFyQWxsKCk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmFnZS5jbGVhcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXBvc2Ugc3RvcmFnZSBuYW1lIGJ5IHN1ZmZpeFxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHN1ZmZpeFxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBzdG9yYWdlTmFtZShzdWZmaXg6IHN0cmluZykge1xuICAgIHJldHVybiBgJHt0aGlzLmdldFByZWZpeCgpfV8ke3N1ZmZpeH1gO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBwcmVmaXggb2YgY2hhbm5lbCBzdG9yYWdlXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGdldFByZWZpeCgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWcuZ2V0KCdwcmVmaXgnKTtcbiAgfVxufVxuIiwiLyogQGZsb3cgKi9cbmltcG9ydCBvYmogZnJvbSAnb2JqZWN0LXBhdGgnO1xuaW1wb3J0IGRlYnVnIGZyb20gJ2RlYnVnJztcbmltcG9ydCB0eXBlIElUYXNrIGZyb20gJy4uL2ludGVyZmFjZXMvdGFzayc7XG5pbXBvcnQgbG9nRXZlbnRzIGZyb20gJy4vZW51bS9sb2cuZXZlbnRzJztcblxuLyoqXG4gKiBDbG9uZSBjbGFzc1xuICpcbiAqIEBwYXJhbSAge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsb25lKG9iajogT2JqZWN0KSB7XG4gIHZhciBuZXdDbGFzcyA9IE9iamVjdC5jcmVhdGUoXG4gICAgT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaiksXG4gICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMob2JqKS5yZWR1Y2UoKHByb3BzLCBuYW1lKSA9PiB7XG4gICAgICBwcm9wc1tuYW1lXSA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqLCBuYW1lKTtcbiAgICAgIHJldHVybiBwcm9wcztcbiAgICB9LCB7fSlcbiAgKTtcblxuICBpZiAoISBPYmplY3QuaXNFeHRlbnNpYmxlKG9iaikpIHtcbiAgICBPYmplY3QucHJldmVudEV4dGVuc2lvbnMobmV3Q2xhc3MpO1xuICB9XG4gIGlmIChPYmplY3QuaXNTZWFsZWQob2JqKSkge1xuICAgIE9iamVjdC5zZWFsKG5ld0NsYXNzKTtcbiAgfVxuICBpZiAoT2JqZWN0LmlzRnJvemVuKG9iaikpIHtcbiAgICBPYmplY3QuZnJlZXplKG5ld0NsYXNzKTtcbiAgfVxuXG4gIHJldHVybiBuZXdDbGFzcztcbn1cblxuLyoqXG4gKiBDaGVjayBwcm9wZXJ0eSBpbiBvYmplY3RcbiAqXG4gKiBAcGFyYW0gIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gaGFzUHJvcGVydHkob2JqOiBGdW5jdGlvbiwgbmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBuYW1lKTtcbn1cblxuLyoqXG4gKiBDaGVjayBtZXRob2QgaW4gaW5pdGlhdGVkIGNsYXNzXG4gKlxuICogQHBhcmFtICB7Q2xhc3N9IGluc3RhbmNlXG4gKiBAcGFyYW0gIHtTdHJpbmd9IG1ldGhvZFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gaGFzTWV0aG9kKGluc3RhbmNlOiBhbnksIG1ldGhvZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBpbnN0YW5jZSBpbnN0YW5jZW9mIE9iamVjdCAmJiAobWV0aG9kIGluIGluc3RhbmNlKTtcbn1cblxuLyoqXG4gKiBDaGVjayBmdW5jdGlvbiB0eXBlXG4gKlxuICogQHBhcmFtICB7RnVuY3Rpb259IGZ1bmNcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRnVuY3Rpb24oZnVuYzogRnVuY3Rpb24pOiBib29sZWFuIHtcbiAgcmV0dXJuIGZ1bmMgaW5zdGFuY2VvZiBGdW5jdGlvbjtcbn1cblxuLyoqXG4gKiBSZW1vdmUgc29tZSB0YXNrcyBieSBzb21lIGNvbmRpdGlvbnNcbiAqXG4gKiBAcGFyYW0gIHtGdW5jdGlvbn0gZnVuY1xuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gZXhjbHVkZVNwZWNpZmljVGFza3ModGFzazogSVRhc2spOiBib29sZWFuIHtcbiAgY29uc3QgY29uZGl0aW9ucyA9IEFycmF5LmlzQXJyYXkodGhpcykgPyB0aGlzIDogWydmcmVlemVkJywgJ2xvY2tlZCddO1xuICBjb25zdCByZXN1bHRzID0gW107XG5cbiAgZm9yIChjb25zdCBjIG9mIGNvbmRpdGlvbnMpIHtcbiAgICByZXN1bHRzLnB1c2goaGFzUHJvcGVydHkodGFzaywgYykgPT09IGZhbHNlIHx8IHRhc2tbY10gPT09IGZhbHNlKTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHRzLmluZGV4T2YoZmFsc2UpID4gLTEgPyBmYWxzZSA6IHRydWU7XG59XG5cbi8qKlxuICogQ2xlYXIgdGFza3MgYnkgaXQncyB0YWdzXG4gKlxuICogQHBhcmFtICB7SVRhc2t9IHRhc2tcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHV0aWxDbGVhckJ5VGFnKHRhc2s6IElUYXNrKTogYm9vbGVhbiB7XG4gIGlmICghIGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzLmNhbGwoWydsb2NrZWQnXSwgdGFzaykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRhc2sudGFnID09PSB0aGlzO1xufVxuXG4vKipcbiAqIFNvcnQgYnkgZmlmb1xuICpcbiAqIEBwYXJhbSAge0lUYXNrfSBhXG4gKiBAcGFyYW0gIHtJVGFza30gYlxuICogQHJldHVybiB7QW55fVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaWZvKGE6IElUYXNrLCBiOiBJVGFzayk6IGFueSB7XG4gIHJldHVybiBhLmNyZWF0ZWRBdCAtIGIuY3JlYXRlZEF0O1xufVxuXG4vKipcbiAqIFNvcnQgYnkgbGlmb1xuICpcbiAqIEBwYXJhbSAge0lUYXNrfSBhXG4gKiBAcGFyYW0gIHtJVGFza30gYlxuICogQHJldHVybiB7QW55fVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsaWZvKGE6IElUYXNrLCBiOiBJVGFzayk6IGFueSB7XG4gIHJldHVybiBiLmNyZWF0ZWRBdCAtIGEuY3JlYXRlZEF0O1xufVxuXG4vKipcbiAqIExvZyBoZWxwZXJcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICogQHBhcmFtICB7U3RyaW5nfSBkYXRhXG4gKiBAcGFyYW0gIHtCb29sZWFufSBjb25kaXRpb25cbiAqIEByZXR1cm4ge3ZvaWR9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvZyhrZXk6IHN0cmluZywgZGF0YTogc3RyaW5nID0gJycsIGNvbmRpdGlvbjogYm9vbGVhbiA9IHRydWUpOiB2b2lkIHtcbiAgaWYgKHRoaXMgIT09IHRydWUpIHtcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnZGVidWcnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBkZWJ1ZyBtb2RlIG9uIGFsd2F5c1xuICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZGVidWcnLCAnd29ya2VyOionKTtcblxuICAvLyBnZXQgbmV3IGRlYnVnIGZ1bmN0aW9uIGluc3RhbmNlXG4gIGNvbnN0IGxvZyA9IGRlYnVnKGB3b3JrZXI6JHtkYXRhfSAtPmApO1xuXG4gIC8vIHRoZSBvdXRwdXQgcHVzaCB0byBjb25zb2xlXG4gIGxvZyhvYmouZ2V0KGxvZ0V2ZW50cywga2V5KSk7XG59XG4iXX0=
