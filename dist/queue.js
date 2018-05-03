(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = require("regenerator-runtime");

},{"regenerator-runtime":6}],2:[function(require,module,exports){
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
},{"to-function":8}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{"./runtime":7}],7:[function(require,module,exports){
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

},{"component-props":2,"props":2}],9:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.InMemoryAdapter = exports.LocalForageAdapter = undefined;var _localforage = require('./localforage');var _localforage2 = _interopRequireDefault(_localforage);var _inmemory = require('./inmemory');var _inmemory2 = _interopRequireDefault(_inmemory);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}exports.LocalForageAdapter = _localforage2.default;exports.
InMemoryAdapter = _inmemory2.default;

},{"./inmemory":10,"./localforage":11}],10:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _regenerator = require('babel-runtime/regenerator');var _regenerator2 = _interopRequireDefault(_regenerator);var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {arr2[i] = arr[i];}return arr2;} else {return Array.from(arr);}}function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var




InMemoryAdapter = function () {




  function InMemoryAdapter(config) {_classCallCheck(this, InMemoryAdapter);this.store = {};
    this.config = config;
    this.prefix = this.config.get('prefix');
  }

  /**
       * Take item from store by key
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
                                                                                                                                                                                                                                                                                                                                                                         * Add item to store
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
                                                                                                                                                                                                                                                                                                                                         * Item checker in store
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
      key) {var result;return _regenerator2.default.wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:_context4.next = 2;return (
                  this.has(key));case 2:if (!_context4.sent) {_context4.next = 6;break;}_context4.t0 = delete this.store[this.storageName(key)];_context4.next = 7;break;case 6:_context4.t0 = false;case 7:result = _context4.t0;
                this.store = _extends({}, this.store);return _context4.abrupt('return',
                result);case 10:case 'end':return _context4.stop();}}}, _callee4, this);}));function clear(_x5) {return _ref4.apply(this, arguments);}return clear;}()


    /**
                                                                                                                                                                                                                                                                                                                                           * Compose collection name by suffix
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
         * Get prefix of channel collection
         *
         * @return {String}
         *
         * @api public
         */ }, { key: 'getPrefix', value: function getPrefix()
    {
      return this.config.get('prefix');
    }

    /**
         * Get collection
         *
         * @param  {String} name
         * @return {String}
         *
         * @api private
         */ }, { key: 'getCollection', value: function getCollection(
    name) {
      var has = Object.prototype.hasOwnProperty.call(this.store, name);
      if (!has) this.store[name] = [];
      return this.store[name];
    } }]);return InMemoryAdapter;}();exports.default = InMemoryAdapter;

},{"babel-runtime/regenerator":1}],11:[function(require,module,exports){
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

},{"babel-runtime/regenerator":1,"localforage":4}],12:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _regenerator = require('babel-runtime/regenerator');var _regenerator2 = _interopRequireDefault(_regenerator);var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();


var _event2 = require('./event');var _event3 = _interopRequireDefault(_event2);
var _container = require('./container');var _container2 = _interopRequireDefault(_container);
var _storageCapsule = require('./storage-capsule');var _storageCapsule2 = _interopRequireDefault(_storageCapsule);
var _queue = require('./queue');var _queue2 = _interopRequireDefault(_queue);
var _utils = require('./utils');
var _helpers = require('./helpers');










var _console = require('./console');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}







/* eslint no-underscore-dangle: [2, { "allow": ["_id"] }] */

var channelName = Symbol('channel-name');var

Channel = function () {








  function Channel(name, config) {_classCallCheck(this, Channel);this.stopped = true;this.running = false;this.event = new _event3.default();this.container = new _container2.default();
    this.config = config;

    // save channel name to this class with symbolic key
    this[channelName] = name;

    // if custom storage driver exists, setup it
    var drivers = _queue2.default.drivers;
    var storage = new _storageCapsule2.default(config, drivers.storage);
    this.storage = storage.channel(name);
  }

  /**
       * Get channel name
       *
       * @return {String} channel name
       *
       * @api public
       */_createClass(Channel, [{ key: 'name', value: function name()
    {
      return this[channelName];
    }

    /**
         * Create new job to channel
         *
         * @param  {Object} task
         * @return {String|Boolean} job
         *
         * @api public
         */ }, { key: 'add', value: function () {var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(
      task) {var id;return _regenerator2.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.next = 2;return (
                  _helpers.canMultiple.call(this, task));case 2:if (_context.sent) {_context.next = 4;break;}return _context.abrupt('return', false);case 4:_context.next = 6;return (

                  _helpers.saveTask.call(this, task));case 6:id = _context.sent;if (!(

                id && this.stopped && this.running === true)) {_context.next = 10;break;}_context.next = 10;return (
                  this.start());case 10:


                // pass activity to the log service.
                _helpers.logProxy.call(this, _console.taskAddedLog, task);return _context.abrupt('return',

                id);case 12:case 'end':return _context.stop();}}}, _callee, this);}));function add(_x) {return _ref.apply(this, arguments);}return add;}()


    /**
                                                                                                                                                                                                                                                                                                                   * Process next job
                                                                                                                                                                                                                                                                                                                   *
                                                                                                                                                                                                                                                                                                                   * @return {void}
                                                                                                                                                                                                                                                                                                                   *
                                                                                                                                                                                                                                                                                                                   * @api public
                                                                                                                                                                                                                                                                                                                   */ }, { key: 'next', value: function () {var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {return _regenerator2.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:if (!

                this.stopped) {_context2.next = 3;break;}
                _helpers.statusOff.call(this);return _context2.abrupt('return',
                _helpers.stopQueue.call(this));case 3:


                // Generate a log message
                _helpers.logProxy.call(this, _console.nextTaskLog, 'next');

                // start queue again
                _context2.next = 6;return this.start();case 6:return _context2.abrupt('return',

                true);case 7:case 'end':return _context2.stop();}}}, _callee2, this);}));function next() {return _ref2.apply(this, arguments);}return next;}()


    /**
                                                                                                                                                                                                                                                                                                                           * Start queue listener
                                                                                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                                                                                           * @return {Boolean} job
                                                                                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                                                                                           * @api public
                                                                                                                                                                                                                                                                                                                           */ }, { key: 'start', value: function () {var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {return _regenerator2.default.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:

                // Stop the queue for restart
                this.stopped = false;

                // Register tasks, if not registered
                _helpers.registerWorkers.call(this);

                _helpers.logProxy.call(this, _console.queueStartLog, 'start');

                // Create a timeout for start queue
                _context3.next = 5;return _helpers.createTimeout.call(this);case 5:_context3.t0 = _context3.sent;this.running = _context3.t0 > 0;return _context3.abrupt('return',

                this.running);case 8:case 'end':return _context3.stop();}}}, _callee3, this);}));function start() {return _ref3.apply(this, arguments);}return start;}()


    /**
                                                                                                                                                                                                                                                                                                                                               * Stop queue listener after end of current task
                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                               * @return {Void}
                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                               * @api public
                                                                                                                                                                                                                                                                                                                                               */ }, { key: 'stop', value: function stop()
    {
      _helpers.logProxy.call(this, _console.queueStoppingLog, 'stop');
      this.stopped = true;
    }

    /**
         * Stop queue listener including current task
         *
         * @return {Void}
         *
         * @api public
         */ }, { key: 'forceStop', value: function forceStop()
    {
      /* istanbul ignore next */
      _helpers.stopQueue.call(this);
    }

    /**
         * Check whether there is any task
         *
         * @return {Booelan}
         *
         * @api public
         */ }, { key: 'isEmpty', value: function () {var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {return _regenerator2.default.wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:_context4.next = 2;return (

                  this.count());case 2:_context4.t0 = _context4.sent;return _context4.abrupt('return', _context4.t0 < 1);case 4:case 'end':return _context4.stop();}}}, _callee4, this);}));function isEmpty() {return _ref4.apply(this, arguments);}return isEmpty;}()


    /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * Get task count
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @return {Number}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @api public
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             */ }, { key: 'count', value: function () {var _ref5 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {return _regenerator2.default.wrap(function _callee5$(_context5) {while (1) {switch (_context5.prev = _context5.next) {case 0:_context5.next = 2;return (

                  _helpers.getTasksWithoutFreezed.call(this));case 2:return _context5.abrupt('return', _context5.sent.length);case 3:case 'end':return _context5.stop();}}}, _callee5, this);}));function count() {return _ref5.apply(this, arguments);}return count;}()


    /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * Get task count by tag
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * @param  {String} tag
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * @return {Array<ITask>}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * @api public
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               */ }, { key: 'countByTag', value: function () {var _ref6 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee6(
      tag) {return _regenerator2.default.wrap(function _callee6$(_context6) {while (1) {switch (_context6.prev = _context6.next) {case 0:_context6.next = 2;return (
                  _helpers.getTasksWithoutFreezed.call(this));case 2:_context6.t0 = function (t) {return t.tag === tag;};return _context6.abrupt('return', _context6.sent.filter(_context6.t0).length);case 4:case 'end':return _context6.stop();}}}, _callee6, this);}));function countByTag(_x2) {return _ref6.apply(this, arguments);}return countByTag;}()


    /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * Remove all tasks from channel
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * @return {Boolean}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * @api public
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           */ }, { key: 'clear', value: function clear()
    {
      if (!this.name()) return false;
      this.storage.clear(this.name());
      return true;
    }

    /**
         * Remove all tasks from channel by tag
         *
         * @param  {String} tag
         * @return {Boolean}
         *
         * @api public
         */ }, { key: 'clearByTag', value: function () {var _ref7 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee8(
      tag) {var _this = this;var self, data, removes;return _regenerator2.default.wrap(function _callee8$(_context8) {while (1) {switch (_context8.prev = _context8.next) {case 0:
                self = this;_context8.next = 3;return (
                  _helpers.db.call(self).all());case 3:data = _context8.sent;
                removes = data.filter(_utils.utilClearByTag.bind(tag)).map(function () {var _ref8 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee7(t) {var result;return _regenerator2.default.wrap(function _callee7$(_context7) {while (1) {switch (_context7.prev = _context7.next) {case 0:_context7.next = 2;return (
                              _helpers.db.call(self).delete(t._id));case 2:result = _context7.sent;return _context7.abrupt('return',
                            result);case 4:case 'end':return _context7.stop();}}}, _callee7, _this);}));return function (_x4) {return _ref8.apply(this, arguments);};}());_context8.next = 7;return (

                  Promise.all(removes));case 7:case 'end':return _context8.stop();}}}, _callee8, this);}));function clearByTag(_x3) {return _ref7.apply(this, arguments);}return clearByTag;}()


    /**
                                                                                                                                                                                                                                                                                                                                                                                             * Check a task whether exists by job id
                                                                                                                                                                                                                                                                                                                                                                                             *
                                                                                                                                                                                                                                                                                                                                                                                             * @param  {String} tag
                                                                                                                                                                                                                                                                                                                                                                                             * @return {Boolean}
                                                                                                                                                                                                                                                                                                                                                                                             *
                                                                                                                                                                                                                                                                                                                                                                                             * @api public
                                                                                                                                                                                                                                                                                                                                                                                             */ }, { key: 'has', value: function () {var _ref9 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee9(
      id) {return _regenerator2.default.wrap(function _callee9$(_context9) {while (1) {switch (_context9.prev = _context9.next) {case 0:_context9.next = 2;return (
                  _helpers.getTasksWithoutFreezed.call(this));case 2:_context9.t0 = function (t) {return t._id === id;};_context9.t1 = _context9.sent.findIndex(_context9.t0);_context9.t2 = -1;return _context9.abrupt('return', _context9.t1 > _context9.t2);case 6:case 'end':return _context9.stop();}}}, _callee9, this);}));function has(_x5) {return _ref9.apply(this, arguments);}return has;}()


    /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * Check a task whether exists by tag
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * @param  {String} tag
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * @return {Boolean}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * @api public
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               */ }, { key: 'hasByTag', value: function () {var _ref10 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee10(
      tag) {return _regenerator2.default.wrap(function _callee10$(_context10) {while (1) {switch (_context10.prev = _context10.next) {case 0:_context10.next = 2;return (
                  _helpers.getTasksWithoutFreezed.call(this));case 2:_context10.t0 = function (t) {return t.tag === tag;};_context10.t1 = _context10.sent.findIndex(_context10.t0);_context10.t2 = -1;return _context10.abrupt('return', _context10.t1 > _context10.t2);case 6:case 'end':return _context10.stop();}}}, _callee10, this);}));function hasByTag(_x6) {return _ref10.apply(this, arguments);}return hasByTag;}()


    /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * Set action events
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * @param  {String} key
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * @param  {Function} cb
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * @return {Void}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * @api public
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           */ }, { key: 'on', value: function on(
    key, cb) {var _event;
      (_event = this.event).on.apply(_event, [key, cb]);
      _helpers.logProxy.call(this, _console.eventCreatedLog, key);
    } }]);return Channel;}();exports.default = Channel;

},{"./console":14,"./container":15,"./event":18,"./helpers":19,"./queue":21,"./storage-capsule":22,"./utils":23,"babel-runtime/regenerator":1}],13:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();

var _config = require('./enum/config.data');var _config2 = _interopRequireDefault(_config);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var

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

},{"./enum/config.data":16}],14:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _slicedToArray = function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"]) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}();exports.





log = log;exports.



taskAddedLog = taskAddedLog;exports.






queueStartLog = queueStartLog;exports.






nextTaskLog = nextTaskLog;exports.



queueStoppingLog = queueStoppingLog;exports.






queueStoppedLog = queueStoppedLog;exports.






queueEmptyLog = queueEmptyLog;exports.



eventCreatedLog = eventCreatedLog;exports.






eventFiredLog = eventFiredLog;exports.






notFoundLog = notFoundLog;exports.






workerRunninLog = workerRunninLog;exports.














workerDoneLog = workerDoneLog;exports.








workerFailedLog = workerFailedLog;var _objectPath = require('object-path');var _objectPath2 = _interopRequireDefault(_objectPath);var _log = require('./enum/log.events');var _log2 = _interopRequireDefault(_log);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {arr2[i] = arr[i];}return arr2;} else {return Array.from(arr);}} /* eslint no-console: ["error", { allow: ["log", "groupCollapsed", "groupEnd"] }] */function log() {var _console;(_console = console).log.apply(_console, arguments);}function taskAddedLog(_ref) {var _ref2 = _slicedToArray(_ref, 1),task = _ref2[0];log('%c(' + task.handler + ') -> ' + _objectPath2.default.get(_log2.default, 'queue.created'), 'color: green;font-weight: bold;');}function queueStartLog(_ref3) {var _ref4 = _slicedToArray(_ref3, 1),type = _ref4[0];log('%c(' + type + ") -> \u25B6\uFE0F " + _objectPath2.default.get(_log2.default, 'queue.starting'), 'color: #3fa5f3;font-weight: bold;');}function nextTaskLog(_ref5) {var _ref6 = _slicedToArray(_ref5, 1),type = _ref6[0];log('%c(' + type + ") -> \u23ED\uFE0F " + _objectPath2.default.get(_log2.default, 'queue.next'), 'color: #3fa5f3;font-weight: bold;');}function queueStoppingLog(_ref7) {var _ref8 = _slicedToArray(_ref7, 1),type = _ref8[0];log('%c(' + type + ") ->\uD83D\uDEA6 " + _objectPath2.default.get(_log2.default, 'queue.stopping'), 'color: #ff7f94;font-weight: bold;');}function queueStoppedLog(_ref9) {var _ref10 = _slicedToArray(_ref9, 1),type = _ref10[0];log('%c(' + type + ") -> \uD83D\uDED1 " + _objectPath2.default.get(_log2.default, 'queue.stopped'), 'color: #ff7f94;font-weight: bold;');}function queueEmptyLog(_ref11) {var _ref12 = _slicedToArray(_ref11, 1),type = _ref12[0];log("\uD83D\uDDD1\uFE0F %c" + type + ' ' + _objectPath2.default.get(_log2.default, 'queue.empty'), 'color: #ff7f94;font-weight: bold;');}function eventCreatedLog(_ref13) {var _ref14 = _slicedToArray(_ref13, 1),key = _ref14[0];log('%c(' + key + ") -> \uD83C\uDF89 " + _objectPath2.default.get(_log2.default, 'event.created'), 'color: #66cee3;font-weight: bold;');}function eventFiredLog(_ref15) {var _ref16 = _slicedToArray(_ref15, 2),key = _ref16[0],name = _ref16[1];log('%c(' + key + ") -> \uD83C\uDF89 " + _objectPath2.default.get(_log2.default, 'event.' + name), 'color: #a0dc3c;font-weight: bold;');}function notFoundLog(_ref17) {var _ref18 = _slicedToArray(_ref17, 1),name = _ref18[0];log('%c(' + name + ") -> \u26A0\uFE0F " + _objectPath2.default.get(_log2.default, 'queue.not-found'), 'color: #a0dc3c;font-weight: bold;');}function workerRunninLog(_ref19) {var _ref20 = _slicedToArray(_ref19, 3),worker = _ref20[0],task = _ref20[1],deps = _ref20[2];console.groupCollapsed(worker.name + ' -  ' + task.label);log('%clabel: ' + task.label, 'color: blue;');log('%chandler: ' + task.handler, 'color: blue;');log('%cpriority: ' + task.priority, 'color: blue;');log('%cunique: ' + (task.unique || 'false'), 'color: blue;');log('%cretried: ' + (task.tried || '0'), 'color: blue;');log('%ctag: ' + task.tag, 'color: blue;');log('%cargs:', 'color: blue;');log(task.args);console.groupCollapsed('dependencies');log.apply(undefined, _toConsumableArray(deps[worker.name] || []));console.groupEnd();}function workerDoneLog(_ref21) {var _ref22 = _slicedToArray(_ref21, 1),result = _ref22[0];if (result === true) {log('%cTask completed!', 'color: green;');} else {log('%cTask will be retried!', 'color: #ef6363;');}console.groupEnd();}function workerFailedLog() {
  log('%cTask failed!', 'color: red;');
  console.groupEnd();
}

},{"./enum/log.events":17,"object-path":5}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.default = {
  defaultStorage: 'localstorage',
  prefix: 'sq_jobs',
  timeout: 1000,
  limit: -1,
  principle: 'fifo',
  debug: true };

},{}],17:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.default = {
  queue: {
    created: 'New task created.',
    next: 'Next task processing.',
    starting: 'Queue listener starting.',
    stopping: 'Queue listener stopping.',
    stopped: 'Queue listener stopped.',
    empty: 'channel is empty...',
    'not-found': 'worker not found',
    offline: 'Disconnected',
    online: 'Connected' },

  event: {
    created: 'New event created',
    fired: 'Event fired.',
    'wildcard-fired': 'Wildcard event fired.' } };

},{}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
'use strict';var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};Object.defineProperty(exports, "__esModule", { value: true });exports.canMultiple = exports.createTimeout = exports.successJobHandler = exports.retryProcess = exports.lockTask = exports.failedJobHandler = exports.removeTask = exports.saveTask = exports.getTasksWithoutFreezed = undefined;var _regenerator = require('babel-runtime/regenerator');var _regenerator2 = _interopRequireDefault(_regenerator);var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {return typeof obj === 'undefined' ? 'undefined' : _typeof2(obj);} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === 'undefined' ? 'undefined' : _typeof2(obj);};

















































/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * Get unfreezed tasks by the filter function
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * Context: Channel
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @return {ITask}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */var getTasksWithoutFreezed = exports.getTasksWithoutFreezed = function () {var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(
  function _callee() {return _regenerator2.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.next = 2;return (
              db.call(this).all());case 2:_context.t0 = _utils.excludeSpecificTasks.bind(['freezed']);return _context.abrupt('return', _context.sent.filter(_context.t0));case 4:case 'end':return _context.stop();}}}, _callee, this);}));return function getTasksWithoutFreezed() {return _ref.apply(this, arguments);};}();


/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * Log proxy helper
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * Context: Channel
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Context: Channel
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
                                                                                                                                                                                                                                                                                                                                 * Context: Channel
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
                                                                                                                                                                                                                                                                                                                                       * Context: Channel
                                                                                                                                                                                                                                                                                                                                       *
                                                                                                                                                                                                                                                                                                                                       * @param {ITask} task
                                                                                                                                                                                                                                                                                                                                       * @param {string} type
                                                                                                                                                                                                                                                                                                                                       * @return {void}
                                                                                                                                                                                                                                                                                                                                       *
                                                                                                                                                                                                                                                                                                                                       * @api private
                                                                                                                                                                                                                                                                                                                                       */





























/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * Failed job handler
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * Context: Channel
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

                        logProxy.call(this, _console.workerFailedLog);

                        /* istanbul ignore next */_context4.next = 5;return (
                          this.next());case 5:case 'end':return _context4.stop();}}}, _callee4, this);}));function childFailedHandler() {return _ref5.apply(this, arguments);}return childFailedHandler;}());case 1:case 'end':return _context5.stop();}}}, _callee5, this);}));return function failedJobHandler(_x3) {return _ref4.apply(this, arguments);};}();



/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Helper of the lock task of the current job
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Context: Channel
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
                                                                                                                                                                                                                                                                                                                                   * Context: Channel
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Context: Channel
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
                                                                                                                                                                                                                                                                                                                                                     * Context: Channel
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

                        // show console
                        logProxy.call(self, _console.workerDoneLog, result);

                        // try next queue job
                        _context8.next = 6;return self.next();case 6:case 'end':return _context8.stop();}}}, _callee8, this);}));function childSuccessJobHandler(_x9) {return _ref9.apply(this, arguments);}return childSuccessJobHandler;}());case 2:case 'end':return _context9.stop();}}}, _callee9, this);}));return function successJobHandler(_x7, _x8) {return _ref8.apply(this, arguments);};}();



/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Job handler helper
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Context: Channel
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * Context: Channel
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * @return {number}
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
            logProxy.call(this, _console.queueEmptyLog, this.name());
            stopQueue.call(this);return _context11.abrupt('return',
            1);case 8:if (


            this.container.has(task.handler)) {_context11.next = 16;break;}
            logProxy.call(this, _console.notFoundLog, task.handler);_context11.next = 12;return (
              failedJobHandler.call(this, task));case 12:_context11.t0 = this;_context11.next = 15;return _context11.sent.call(_context11.t0);case 15:return _context11.abrupt('return',
            1);case 16:


            // Get worker with handler name
            JobWorker = this.container.get(task.handler);

            // Create a worker instance
            workerInstance = new JobWorker();

            // get always last updated config value
            timeout = this.config.get('timeout');

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
                                                                                                                                                                                                                                                                                                                                                                         * Context: Channel
                                                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                                                         * @return {void}
                                                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                                                         * @api private
                                                                                                                                                                                                                                                                                                                                                                         */




/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Checks whether a task is replicable or not
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Context: Channel
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * Context: Channel
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @param {ITask} task
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @param {IWorker} worker
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @return {void}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             */exports.checkPriority = checkPriority;exports.db = db;exports.logProxy = logProxy;exports.dispatchEvents = dispatchEvents;exports.stopQueue = stopQueue;exports.fireJobInlineEvent = fireJobInlineEvent;exports.successProcess = successProcess;exports.updateRetry = updateRetry;exports.loopHandler = loopHandler;exports.statusOff = statusOff;exports.
registerWorkers = registerWorkers;var _queue = require('./queue');var _queue2 = _interopRequireDefault(_queue);var _channel = require('./channel');var _channel2 = _interopRequireDefault(_channel);var _storageCapsule = require('./storage-capsule');var _storageCapsule2 = _interopRequireDefault(_storageCapsule);var _utils = require('./utils');var _console = require('./console');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {arr2[i] = arr[i];}return arr2;} else {return Array.from(arr);}}function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};} /* eslint no-underscore-dangle: [2, { "allow": ["_id"] }] */ /* eslint no-param-reassign: "error" */ /* eslint use-isnan: "error" */ /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * Task priority controller helper
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * Context: Channel
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * @return {ITask}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * @param {ITask} task
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         */function checkPriority(task) {task.priority = task.priority || 0;if (typeof task.priority !== 'number') task.priority = 0;return task;} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    * Shortens function the db belongsto current channel
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    * Context: Channel
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    * @return {StorageCapsule}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    */function db() {return this.storage.channel(this.name());}function logProxy(wrapperFunc) {if (this.config.get('debug') && typeof wrapperFunc === 'function') {for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {args[_key - 1] = arguments[_key];}wrapperFunc(args);}}function dispatchEvents(task, type) {var _this = this;if (!('tag' in task)) return false;var events = [[task.tag + ':' + type, 'fired'], [task.tag + ':*', 'wildcard-fired']];events.forEach(function (e) {_this.event.emit(e[0], task);logProxy.call.apply(logProxy, [_this, _console.eventFiredLog].concat(_toConsumableArray(e)));});return true;} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * Queue stopper helper
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * Context: Channel
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * @return {void}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         */function stopQueue() {this.stop();clearTimeout(this.currentTimeout);logProxy.call(this, _console.queueStoppedLog, 'stop');}function fireJobInlineEvent(name, worker, args) {if ((0, _utils.hasMethod)(worker, name) && (0, _utils.isFunction)(worker[name])) {worker[name].call(worker, args);return true;}return false;} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Process handler of succeeded job
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Context: Channel
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @param {ITask} task
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @return {void}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @api private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */function successProcess(task) {removeTask.call(this, task._id);} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * Update task's retry value
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * Context: Channel
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
              dependencies = Object.values(deps || {});logProxy.call(this, _console.workerRunninLog, worker, task, _queue2.default.workerDeps); // Task runner promise
              _context10.t1 = (_workerInstance$handl = workerInstance.handle).call.apply(_workerInstance$handl, [workerInstance, task.args].concat(_toConsumableArray(dependencies)));_context10.next = 11;return successJobHandler.call(self, task, workerInstance);case 11:_context10.t2 = self;_context10.t3 = _context10.sent.bind(_context10.t2);_context10.t0 = _context10.t1.then.call(_context10.t1, _context10.t3);_context10.next = 16;return failedJobHandler.call(self, task);case 16:_context10.t4 = self;_context10.t5 = _context10.sent.bind(_context10.t4);_context10.t0.catch.call(_context10.t0, _context10.t5);case 19:case 'end':return _context10.stop();}}}, _callee10, this);}));function childLoopHandler() {return _ref10.apply(this, arguments);}return childLoopHandler;}();}function statusOff() {this.running = false;}function registerWorkers() {if (_queue2.default.isRegistered) return false;var workers = _queue2.default.queueWorkers || {};this.container.merge(workers);_queue2.default.isRegistered = true;return true;}

},{"./channel":12,"./console":14,"./queue":21,"./storage-capsule":22,"./utils":23,"babel-runtime/regenerator":1}],20:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _queue = require('./queue');var _queue2 = _interopRequireDefault(_queue);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

/* global window:true */

window.Queue = _queue2.default;exports.default = _queue2.default;

},{"./queue":21}],21:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};exports.default =





Queue;var _channel = require('./channel');var _channel2 = _interopRequireDefault(_channel);var _container = require('./container');var _container2 = _interopRequireDefault(_container);var _config = require('./config');var _config2 = _interopRequireDefault(_config);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function Queue(config) {
  this.config = new _config2.default(config);
}

Queue.FIFO = 'fifo';
Queue.LIFO = 'lifo';
Queue.drivers = {};
Queue.queueWorkers = {};
Queue.workerDeps = {};

Queue.prototype.container = new _container2.default();

/**
                                                                                                               * Create a new channel
                                                                                                               *
                                                                                                               * @param  {String} task
                                                                                                               * @return {Queue} channel
                                                                                                               *
                                                                                                               * @api public
                                                                                                               */
Queue.prototype.create = function create(channel) {
  if (!this.container.has(channel)) {
    this.container.bind(channel, new _channel2.default(channel, this.config));
  }
  return this.container.get(channel);
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
  if (!this.container.has(name)) {
    throw new Error('"' + name + '" channel not found');
  }
  return this.container.get(name);
};

/**
       * Set config timeout value
       *
       * @param  {Number} val
       * @return {Void}
       *
       * @api public
       */
Queue.prototype.setTimeout = function setTimeout(val) {
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
Queue.use = function use() {var driver = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  Queue.drivers = _extends({}, Queue.drivers, driver);
};

},{"./channel":12,"./config":13,"./container":15}],22:[function(require,module,exports){
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
    this.storage = this.initialize(storage);
  }_createClass(StorageCapsule, [{ key: 'initialize', value: function initialize(

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

},{"./adapters":9,"./utils":23,"babel-runtime/regenerator":1,"group-by":3}],23:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.












hasProperty = hasProperty;exports.












hasMethod = hasMethod;exports.











isFunction = isFunction;exports.











excludeSpecificTasks = excludeSpecificTasks;exports.


















utilClearByTag = utilClearByTag;exports.















fifo = fifo;exports.












lifo = lifo; /* eslint comma-dangle: ["error", "never"] */ /**
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  */function lifo(a, b) {return b.createdAt - a.createdAt;}

},{}]},{},[20])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9yZWdlbmVyYXRvci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb21wb25lbnQtcHJvcHMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZ3JvdXAtYnkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9jYWxmb3JhZ2UvZGlzdC9sb2NhbGZvcmFnZS5qcyIsIm5vZGVfbW9kdWxlcy9vYmplY3QtcGF0aC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWdlbmVyYXRvci1ydW50aW1lL3J1bnRpbWUtbW9kdWxlLmpzIiwibm9kZV9tb2R1bGVzL3JlZ2VuZXJhdG9yLXJ1bnRpbWUvcnVudGltZS5qcyIsIm5vZGVfbW9kdWxlcy90by1mdW5jdGlvbi9pbmRleC5qcyIsInNyYy9hZGFwdGVycy9pbmRleC5qcyIsInNyYy9hZGFwdGVycy9pbm1lbW9yeS5qcyIsInNyYy9hZGFwdGVycy9sb2NhbGZvcmFnZS5qcyIsInNyYy9jaGFubmVsLmpzIiwic3JjL2NvbmZpZy5qcyIsInNyYy9jb25zb2xlLmpzIiwic3JjL2NvbnRhaW5lci5qcyIsInNyYy9lbnVtL2NvbmZpZy5kYXRhLmpzIiwic3JjL2VudW0vbG9nLmV2ZW50cy5qcyIsInNyYy9ldmVudC5qcyIsInNyYy9oZWxwZXJzLmpzIiwic3JjL2luZGV4LmpzIiwic3JjL3F1ZXVlLmpzIiwic3JjL3N0b3JhZ2UtY2Fwc3VsZS5qcyIsInNyYy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM3dUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2dEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7K2EsQUN4Sk87QSxBQUNBOzs7Ozs7OztBLEFDSWMsOEJBS25COzs7OzsyQkFBQSxBQUFZLFFBQWlCLDZDQUY3QixBQUU2QixRQUZJLEFBRUosQUFDM0I7U0FBQSxBQUFLLFNBQUwsQUFBYyxBQUNkO1NBQUEsQUFBSyxTQUFTLEtBQUEsQUFBSyxPQUFMLEFBQVksSUFBMUIsQUFBYyxBQUFnQixBQUMvQjtBQUVEOzs7Ozs7Ozs7eUpBUVU7QSxpSkFDRjtBLDJCQUFXLEtBQUEsQUFBSyxZLEFBQUwsQUFBaUI7cUJBQ3ZCLEFBQUssYyxBQUFMLEFBQW1CLFNBQW5CLHNJQUdiOzs7Ozs7Ozs7OztpZUFTVTtBLFcsQUFBYSxtSUFDckI7cUJBQUEsQUFBSyxNQUFNLEtBQUEsQUFBSyxZQUFoQixBQUFXLEFBQWlCLHFDQUE1QixBQUF3QyxnQ0FDakM7QSxzQiw0SUFHVDs7Ozs7Ozs7OztpY0FRVTtBLGlLQUNEO3VCQUFBLEFBQU8sVUFBUCxBQUFpQixlQUFqQixBQUFnQyxLQUFLLEtBQXJDLEFBQTBDLE9BQU8sS0FBQSxBQUFLLFksQUFBdEQsQUFBaUQsQUFBaUIsNklBRzNFOzs7Ozs7Ozs7OzZqQkFRWTtBO3VCQUNZLEFBQUssSSxBQUFMLEFBQVMsSUFBVCx3RUFBaUIsT0FBTyxLQUFBLEFBQUssTUFBTSxLQUFBLEFBQUssWSxBQUFoQixBQUFXLEFBQWlCLHFELEFBQVEsYSxBQUE1RSxtQkFDTjtxQkFBQSxBQUFLLHFCQUFhLEtBQWxCLEFBQXVCLCtCQUNoQjtBLHVCLDRJQUdUOzs7Ozs7Ozs7O3VYQVFZO0EsWUFBZ0IsQUFDMUI7YUFBTyxPQUFBLEFBQU8sV0FBVyxLQUFsQixBQUFrQixBQUFLLGVBQXZCLEFBQXNDLFNBQVksS0FBbEQsQUFBa0QsQUFBSyxvQkFBOUQsQUFBNkUsQUFDOUU7QUFFRDs7Ozs7Ozs7bURBT1k7QUFDVjthQUFPLEtBQUEsQUFBSyxPQUFMLEFBQVksSUFBbkIsQUFBTyxBQUFnQixBQUN4QjtBQUVEOzs7Ozs7Ozs7dURBUWM7QSxVQUFjLEFBQzFCO1VBQU0sTUFBTSxPQUFBLEFBQU8sVUFBUCxBQUFpQixlQUFqQixBQUFnQyxLQUFLLEtBQXJDLEFBQTBDLE9BQXRELEFBQVksQUFBaUQsQUFDN0Q7VUFBSSxDQUFKLEFBQUssS0FBSyxLQUFBLEFBQUssTUFBTCxBQUFXLFFBQVgsQUFBbUIsQUFDN0I7YUFBTyxLQUFBLEFBQUssTUFBWixBQUFPLEFBQVcsQUFDbkI7QSx1RCxBQWxHa0I7Ozs7QUNKckIsMEM7Ozs7O0EsQUFLcUIsaUNBS25COzs7Ozs4QkFBQSxBQUFZLFFBQWlCLGdEQUg3QixBQUc2QixVQUhULENBQUEsQUFBQyxnQkFBRCxBQUFpQixhQUFqQixBQUE4QixBQUdyQixBQUMzQjtTQUFBLEFBQUssU0FBTCxBQUFjLEFBQ2Q7U0FBQSxBQUFLLFNBQVMsS0FBQSxBQUFLLE9BQUwsQUFBWSxJQUExQixBQUFjLEFBQWdCLEFBQzlCOzBCQUFBLEFBQVksT0FBTyxFQUFFLFFBQVEsS0FBVixBQUFVLEFBQUssYUFBYSxNQUFNLEtBQXJELEFBQW1CLEFBQXVDLEFBQzNEO0FBRUQ7Ozs7Ozs7Ozs0SkFRVTtBO3dDQUNZLEFBQVksUUFBUSxLQUFBLEFBQUssWSxBQUF6QixBQUFvQixBQUFpQixLQUFyQyxTLEFBQWQsNkNBQ0M7aUJBQUMsT0FBQSxBQUFPLFVBQVAsQUFBaUIsV0FBVyxLQUFBLEFBQUssTUFBakMsQUFBNEIsQUFBVyxTQUF4QyxBQUFpRCxVLEFBQVUsc0lBR3BFOzs7Ozs7Ozs7OzsraEJBU1U7QSxXLEFBQWE7d0NBQ0EsQUFBWSxRQUFRLEtBQUEsQUFBSyxZQUF6QixBQUFvQixBQUFpQixNLEFBQXJDLEFBQTJDLE1BQTNDLFMsQUFBZixnREFDQztBLG1LQUdUOzs7Ozs7Ozs7O21jQVFVO0E7d0MsQUFDcUIsQUFBWSxNQUFaLFMsQUFBdkIsOENBQ0M7cUJBQUEsQUFBSyxRQUFRLEtBQUEsQUFBSyxZQUFsQixBQUFhLEFBQWlCLFFBQVEsQyxBQUFDLHlJQUdoRDs7Ozs7Ozs7OzsrZkFRWTtBO3dDQUNXLEFBQVksV0FBVyxLQUFBLEFBQUssWSxBQUE1QixBQUF1QixBQUFpQixLQUF4QyxTLEFBQWYsZ0RBQ0M7QSxrS0FHVDs7Ozs7Ozs7Ozs7d0MsQUFRK0IsQUFBWSxNQUFaLFMsQUFBdkIseUNBQ2U7MEJBQUEsQUFBUSxJQUFJLEtBQUEsQUFBSyx3RkFBSSxrQkFBQSxBQUFPO3NDQUN6QixBQUFLLE1BRGEsQUFDbEIsQUFBVyxJQUFYLFNBRGtCLEFBQ2xDLGlEQUNDO0FBRmlDLHVHQUFULGlFLEFBQVosYyxBQUFmLGdEQUlDOztBLHFLQUdUOzs7Ozs7Ozs7OzJYQVFZO0EsWUFBZ0IsQUFDMUI7YUFBTyxPQUFBLEFBQU8sV0FBVyxLQUFsQixBQUFrQixBQUFLLGVBQXZCLEFBQXNDLFNBQVksS0FBbEQsQUFBa0QsQUFBSyxvQkFBOUQsQUFBNkUsQUFDOUU7QUFFRDs7Ozs7Ozs7bURBT1k7QUFDVjthQUFPLEtBQUEsQUFBSyxPQUFMLEFBQVksSUFBbkIsQUFBTyxBQUFnQixBQUN4QjtBLDZDQUVXOztBQUNWO1VBQU0sZ0JBQXdCLEtBQUEsQUFBSyxPQUFMLEFBQVksSUFBMUMsQUFBOEIsQUFBZ0IsQUFDOUM7VUFBTSxTQUFpQixDQUFDLEtBQUEsQUFBSyxPQUFMLEFBQVksSUFBWixBQUFnQixjQUFqQixBQUErQixlQUF0RCxBQUF1QixBQUE4QyxBQUNyRTthQUFPLEtBQUEsQUFBSyxRQUFMLEFBQWEsUUFBYixBQUFxQixVQUFVLENBQS9CLEFBQWdDLEFBQ25DOzRCQUFZLE9BRFQsQUFDSCxBQUFZLEFBQU8sQUFDbkI7NEJBQVksY0FGaEIsQUFFSSxBQUFZLEFBQWMsQUFDL0I7QSwwRCxBQTdHa0I7Ozs7OztBQ0hyQixpQztBQUNBLHdDO0FBQ0EsbUQ7QUFDQSxnQztBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0FBV0Esb0M7Ozs7Ozs7O0FBUUE7O0FBRUEsSUFBTSxjQUFjLE9BQXBCLEFBQW9CLEFBQU87O0EsQUFFTixzQkFTbkI7Ozs7Ozs7OzttQkFBQSxBQUFZLE1BQVosQUFBMEIsUUFBaUIscUNBUjNDLEFBUTJDLFVBUnhCLEFBUXdCLFVBUDNDLEFBTzJDLFVBUHhCLEFBT3dCLFdBSDNDLEFBRzJDLFFBSG5DLFlBR21DLGVBRjNDLEFBRTJDLFlBRi9CLGdCQUUrQixBQUN6QztTQUFBLEFBQUssU0FBTCxBQUFjLEFBRWQ7O0FBQ0M7QUFBRCxTQUFBLEFBQWUsZUFBZixBQUE4QixBQUU5Qjs7QUFOeUM7UUFBQSxBQU9qQywwQkFQaUMsQUFPakMsQUFDUjtRQUFNLFVBQVUsNkJBQUEsQUFBbUIsUUFBUSxRQUEzQyxBQUFnQixBQUFtQyxBQUNuRDtTQUFBLEFBQUssVUFBVSxRQUFBLEFBQVEsUUFBdkIsQUFBZSxBQUFnQixBQUNoQztBQUVEOzs7Ozs7OzsrREFPZTtBQUNiO2FBQU8sQUFBQyxLQUFSLEFBQU8sQUFBZSxBQUN2QjtBQUVEOzs7Ozs7Ozs7Z0lBUVU7QTt1Q0FDSSxBQUFZLEtBQVosQUFBaUIsTSxBQUFqQixBQUF1QixLQUF2Qix1RixBQUFzQzs7b0NBRWpDLEFBQVMsS0FBVCxBQUFjLE0sQUFBZCxBQUFvQixLQUFwQixTLEFBQVg7O3NCQUVJLEtBQU4sQUFBVyxXQUFXLEtBQUEsQUFBSyxZLEFBQVksSUFBdkM7dUIsQUFDSSxBQUFLLE9BQUwsT0FHUjs7O0FBQ0E7a0NBQUEsQUFBUyxLQUFULEFBQWMsNkJBQWQsQUFBa0MsNkJBRTNCOztBLG1CLG9JQUdUOzs7Ozs7Ozs7eWpCQVFNOztxQixBQUFLLG1DQUNQO21DQUFBLEFBQVUsS0FBVixBQUFlLE0sd0JBQ1I7bUNBQUEsQUFBVSxLLEFBQVYsQUFBZSxZQUd4Qjs7O0FBQ0E7a0NBQUEsQUFBUyxLQUFULEFBQWMsNEJBQWQsQUFBaUMsQUFFakM7OzswQ0FDTSxLLEFBQUEsQUFBSyx1Q0FFSjs7QSwySkFHVDs7Ozs7Ozs7OzRqQkFRRTs7QUFDQTtxQkFBQSxBQUFLLFVBQUwsQUFBZSxBQUVmOztBQUNBO3lDQUFBLEFBQWdCLEtBQWhCLEFBQXFCLEFBRXJCOztrQ0FBQSxBQUFTLEtBQVQsQUFBYyw4QkFBZCxBQUFtQyxBQUVuQzs7OzBDQUNzQix1QkFBQSxBQUFjLEssQUFBZCxBQUFtQiwyQ0FBekMsSyxBQUFLLHlCLEFBQTZDLDBCQUUzQzs7cUIsQUFBSyxnSkFHZDs7Ozs7Ozs7O29YQU9hO0FBQ1g7d0JBQUEsQUFBUyxLQUFULEFBQWMsaUNBQWQsQUFBc0MsQUFDdEM7V0FBQSxBQUFLLFVBQUwsQUFBZSxBQUNoQjtBQUVEOzs7Ozs7OzttREFPa0I7QUFDaEI7QUFDQTt5QkFBQSxBQUFVLEtBQVYsQUFBZSxBQUNoQjtBQUVEOzs7Ozs7Ozs7O3VCLEFBUWdCLEFBQUssT0FBTCx3RixBQUFnQiw4SUFHaEM7Ozs7Ozs7Ozs7O2tEQVFnQixBQUF1QixLLEFBQXZCLEFBQTRCLEtBQTVCLDBELEFBQW1DLCtJQUduRDs7Ozs7Ozs7Ozs4b0JBUWlCO0E7a0RBQ0QsQUFBdUIsSyxBQUF2QixBQUE0QixLQUE1Qix3QkFBMEMscUJBQUssRUFBQSxBQUFFLFFBQVAsQUFBZSxJLG1ELEFBQXRCLHFCLEFBQTJCLDRKQUc5RTs7Ozs7Ozs7O2l1QkFPaUI7QUFDZjtVQUFJLENBQUMsS0FBTCxBQUFLLEFBQUssUUFBUSxPQUFBLEFBQU8sQUFDekI7V0FBQSxBQUFLLFFBQUwsQUFBYSxNQUFNLEtBQW5CLEFBQW1CLEFBQUssQUFDeEI7YUFBQSxBQUFPLEFBQ1I7QUFFRDs7Ozs7Ozs7O3dJQVFpQjtBLGdMQUNUO0EsdUIsQUFBTzs4QkFDTSxBQUFHLEtBQUgsQUFBUSxNLEFBQVIsQUFBYyxLQUFkLFMsQUFBYixpQkFDQTtBLDBCQUFVLEtBQUEsQUFBSyxPQUFPLHNCQUFBLEFBQWUsS0FBM0IsQUFBWSxBQUFvQixNQUFoQyxBQUFzQyx3RkFBSSxrQkFBQSxBQUFPOzBDQUMxQyxBQUFHLEtBQUgsQUFBUSxNQUFSLEFBQWMsT0FBTyxFQURjLEFBQ25DLEFBQXVCLElBQXZCLFNBRG1DLEFBQ2xELGdEQUNDO0FBRmlELG9HQUExQyxpRTs7MEJBSVYsQUFBUSxJLEFBQVIsQUFBWSxRQUFaLHNKQUdSOzs7Ozs7Ozs7O3FmQVFVO0E7a0RBQ00sQUFBdUIsSyxBQUF2QixBQUE0QixLQUE1Qix3QkFBNkMscUJBQUssRUFBQSxBQUFFLFFBQVAsQUFBZSxHLGdDLEFBQXpCLHVDQUErQixDLEFBQUMsdU1BR25GOzs7Ozs7Ozs7OzY0QkFRZTtBO2tEQUNDLEFBQXVCLEssQUFBdkIsQUFBNEIsS0FBNUIseUJBQTZDLHFCQUFLLEVBQUEsQUFBRSxRQUFQLEFBQWUsSSxrQyxBQUF6Qix5Q0FBZ0MsQyxBQUFDLHVOQUdwRjs7Ozs7Ozs7Ozs7ODFCQVNHO0EsUyxBQUFhLElBQW9CLEtBQ2xDO3FCQUFBLEFBQUssT0FBTCxBQUFXLGlCQUFNLENBQUEsQUFBQyxLQUFsQixBQUFpQixBQUFNLEFBQ3ZCO3dCQUFBLEFBQVMsS0FBVCxBQUFjLGdDQUFkLEFBQXFDLEFBQ3RDO0EsNEIsbUIsQUFoT2tCOzs7OztBQzdCckIsNEM7O0EsQUFFcUIscUJBR25COzs7b0JBQWtDLEtBQXRCLEFBQXNCLDZFQUFKLEFBQUksc0NBRmxDLEFBRWtDLGtCQUNoQztTQUFBLEFBQUssTUFBTCxBQUFXLEFBQ1o7QUFFRDs7Ozs7Ozs7Ozs2REFTSTtBLFUsQUFBYyxPQUFrQixBQUNsQztXQUFBLEFBQUssT0FBTCxBQUFZLFFBQVosQUFBb0IsQUFDckI7QUFFRDs7Ozs7Ozs7OzZDQVFJO0EsVUFBbUIsQUFDckI7YUFBTyxLQUFBLEFBQUssT0FBWixBQUFPLEFBQVksQUFDcEI7QUFFRDs7Ozs7Ozs7OzZDQVFJO0EsVUFBdUIsQUFDekI7YUFBTyxPQUFBLEFBQU8sVUFBUCxBQUFpQixlQUFqQixBQUFnQyxLQUFLLEtBQXJDLEFBQTBDLFFBQWpELEFBQU8sQUFBa0QsQUFDMUQ7QUFFRDs7Ozs7Ozs7OytDQVFNO0EsWUFBaUMsQUFDckM7V0FBQSxBQUFLLFNBQVMsT0FBQSxBQUFPLE9BQVAsQUFBYyxJQUFJLEtBQWxCLEFBQXVCLFFBQXJDLEFBQWMsQUFBK0IsQUFDOUM7QUFFRDs7Ozs7Ozs7O2dEQVFPO0EsVUFBdUIsQUFDNUI7YUFBTyxPQUFPLEtBQUEsQUFBSyxPQUFuQixBQUFjLEFBQVksQUFDM0I7QUFFRDs7Ozs7Ozs7OzZDQVFlO0FBQ2I7YUFBTyxLQUFQLEFBQVksQUFDYjtBLDhDLEFBOUVrQjs7Ozs7Ozs7O0EsQUNFTCxNLEFBQUE7Ozs7QSxBQUlBLGUsQUFBQTs7Ozs7OztBLEFBT0EsZ0IsQUFBQTs7Ozs7OztBLEFBT0EsYyxBQUFBOzs7O0EsQUFJQSxtQixBQUFBOzs7Ozs7O0EsQUFPQSxrQixBQUFBOzs7Ozs7O0EsQUFPQSxnQixBQUFBOzs7O0EsQUFJQSxrQixBQUFBOzs7Ozs7O0EsQUFPQSxnQixBQUFBOzs7Ozs7O0EsQUFPQSxjLEFBQUE7Ozs7Ozs7QSxBQU9BLGtCLEFBQUE7Ozs7Ozs7Ozs7Ozs7OztBLEFBZUEsZ0IsQUFBQTs7Ozs7Ozs7O0EsQUFTQSxrQixBQUFBLGdCQTFGaEIseUMsdURBQ0Esd0MsaVVBRUEsb0ZBRU8sU0FBQSxBQUFTLE1BQWtCLGNBQ2hDLHFCQUFBLEFBQVEsb0JBQ1QsV0FFTSxVQUFBLEFBQVMsbUJBQTRCLHFDQUFkLEFBQWMsZ0JBQzFDLFlBQ1EsS0FEUixBQUNhLG9CQUFlLHFCQUFBLEFBQUksbUJBRGhDLEFBQzRCLEFBQW1CLGtCQUQvQyxBQUVFLEFBRUgsbUNBRU0sVUFBQSxBQUFTLHFCQUE2QixzQ0FBZCxBQUFjLGdCQUMzQyxZQUFBLEFBQ1EsOEJBQWUscUJBQUEsQUFBSSxtQkFEM0IsQUFDdUIsQUFBbUIsbUJBRDFDLEFBRUUsQUFFSCxxQ0FFTSxVQUFBLEFBQVMsbUJBQTJCLHNDQUFkLEFBQWMsZ0JBQ3pDLFlBQUEsQUFBVSw4QkFBZSxxQkFBQSxBQUFJLG1CQUE3QixBQUF5QixBQUFtQixlQUE1QyxBQUE2RCxBQUM5RCxxQ0FFTSxVQUFBLEFBQVMsd0JBQWdDLHNDQUFkLEFBQWMsZ0JBQzlDLFlBQUEsQUFDUSw2QkFBYyxxQkFBQSxBQUFJLG1CQUQxQixBQUNzQixBQUFtQixtQkFEekMsQUFFRSxBQUVILHFDQUVNLFVBQUEsQUFBUyx1QkFBK0IsdUNBQWQsQUFBYyxpQkFDN0MsWUFBQSxBQUNRLDhCQUFlLHFCQUFBLEFBQUksbUJBRDNCLEFBQ3VCLEFBQW1CLGtCQUQxQyxBQUVFLEFBRUgscUNBRU0sVUFBQSxBQUFTLHNCQUE2Qix3Q0FBZCxBQUFjLGlCQUMzQyw4QkFBQSxBQUFhLGFBQVEscUJBQUEsQUFBSSxtQkFBekIsQUFBcUIsQUFBbUIsZ0JBQXhDLEFBQTBELEFBQzNELHFDQUVNLFVBQUEsQUFBUyx3QkFBOEIsd0NBQWIsQUFBYSxnQkFDNUMsWUFBQSxBQUNRLDZCQUFjLHFCQUFBLEFBQUksbUJBRDFCLEFBQ3NCLEFBQW1CLGtCQUR6QyxBQUVFLEFBRUgscUNBRU0sVUFBQSxBQUFTLHNCQUFrQyx3Q0FBbkIsQUFBbUIsZ0JBQWQsQUFBYyxpQkFDaEQsWUFBQSxBQUNRLDZCQUFjLHFCQUFBLEFBQUksOEJBRDFCLEFBQ3NCLEFBQTRCLE9BRGxELEFBRUUsQUFFSCxxQ0FFTSxVQUFBLEFBQVMsb0JBQTJCLHdDQUFkLEFBQWMsaUJBQ3pDLFlBQUEsQUFDUSw4QkFBZSxxQkFBQSxBQUFJLG1CQUQzQixBQUN1QixBQUFtQixvQkFEMUMsQUFFRSxBQUVILHFDQUVNLFVBQUEsQUFBUyx3QkFBNkMsd0NBQTVCLEFBQTRCLG1CQUFwQixBQUFvQixpQkFBZCxBQUFjLGlCQUMzRCxRQUFBLEFBQVEsZUFBa0IsT0FBMUIsQUFBaUMsZ0JBQVcsS0FBNUMsQUFBaUQsT0FDakQsa0JBQWdCLEtBQWhCLEFBQXFCLE9BQXJCLEFBQThCLGdCQUM5QixvQkFBa0IsS0FBbEIsQUFBdUIsU0FBdkIsQUFBa0MsZ0JBQ2xDLHFCQUFtQixLQUFuQixBQUF3QixVQUF4QixBQUFvQyxnQkFDcEMsb0JBQWlCLEtBQUEsQUFBSyxVQUF0QixBQUFnQyxVQUFoQyxBQUEyQyxnQkFDM0MscUJBQWtCLEtBQUEsQUFBSyxTQUF2QixBQUFnQyxNQUFoQyxBQUF1QyxnQkFDdkMsZ0JBQWMsS0FBZCxBQUFtQixLQUFuQixBQUEwQixnQkFDMUIsSUFBQSxBQUFJLFdBQUosQUFBZSxnQkFDZixJQUFJLEtBQUosQUFBUyxNQUNULFFBQUEsQUFBUSxlQUFSLEFBQXVCLGdCQUN2Qix3Q0FBUSxLQUFLLE9BQUwsQUFBWSxTQUFwQixBQUE2QixLQUM3QixRQUFBLEFBQVEsQUFDVCxXQUVNLFVBQUEsQUFBUyxzQkFBK0Isd0NBQWhCLEFBQWdCLG1CQUM3QyxJQUFJLFdBQUosQUFBZSxNQUFNLENBQ25CLElBQUEsQUFBSSxxQkFBSixBQUF5QixBQUMxQixpQkFGRCxPQUVPLENBQ0wsSUFBQSxBQUFJLDJCQUFKLEFBQStCLEFBQ2hDLG1CQUNELFNBQUEsQUFBUSxBQUNULFdBRU0sVUFBQSxBQUFTLGtCQUFrQixBQUNoQztNQUFBLEFBQUksa0JBQUosQUFBc0IsQUFDdEI7VUFBQSxBQUFRLEFBQ1Q7Ozs7Ozs7QSxBQzNGb0I7QSxTQUNuQixHLEFBQXFDLG9DQUVyQzs7Ozs7Ozs7OzZIQVFJO0EsUUFBcUIsQUFDdkI7YUFBTyxPQUFBLEFBQU8sVUFBUCxBQUFpQixlQUFqQixBQUFnQyxLQUFLLEtBQXJDLEFBQTBDLE9BQWpELEFBQU8sQUFBaUQsQUFDekQ7QUFFRDs7Ozs7Ozs7OzZDQVFJO0EsUUFBaUIsQUFDbkI7YUFBTyxLQUFBLEFBQUssTUFBWixBQUFPLEFBQVcsQUFDbkI7QUFFRDs7Ozs7Ozs7NkNBT007QUFDSjthQUFPLEtBQVAsQUFBWSxBQUNiO0FBRUQ7Ozs7Ozs7Ozs7OENBU0s7QSxRLEFBQVksT0FBa0IsQUFDakM7V0FBQSxBQUFLLE1BQUwsQUFBVyxNQUFYLEFBQWlCLEFBQ2xCO0FBRUQ7Ozs7Ozs7OzsrQ0FRb0Q7U0FBOUMsQUFBOEMsMkVBQVYsQUFBVSxBQUNsRDtXQUFBLEFBQUssUUFBUSxPQUFBLEFBQU8sT0FBUCxBQUFjLElBQUksS0FBbEIsQUFBdUIsT0FBcEMsQUFBYSxBQUE4QixBQUM1QztBQUVEOzs7Ozs7Ozs7Z0RBUU87QSxRQUFxQixBQUMxQjtVQUFJLENBQUMsS0FBQSxBQUFLLElBQVYsQUFBSyxBQUFTLEtBQUssT0FBQSxBQUFPLEFBQzFCO2FBQU8sT0FBTyxLQUFBLEFBQUssTUFBbkIsQUFBYyxBQUFXLEFBQzFCO0FBRUQ7Ozs7Ozs7O21EQU9rQjtBQUNoQjtXQUFBLEFBQUssUUFBTCxBQUFhLEFBQ2Q7QSxpRCxBQXJGa0I7Ozs7a0JDSE4sQUFDRyxBQUNoQjtVQUZhLEFBRUwsQUFDUjtXQUhhLEFBR0osQUFDVDtTQUFPLENBSk0sQUFJTCxBQUNSLENBTGEsQUFDYjthQURhLEFBS0YsQUFDWDtTLEFBTmEsQUFNTjs7OztTQ0xBLEFBQ0w7YUFESyxBQUNJLEFBQ1Q7VUFGSyxBQUVDLEFBQ047Y0FISyxBQUdLLEFBQ1Y7Y0FKSyxBQUlLLEFBQ1Y7YUFMSyxBQUtJLEFBQ1Q7V0FOSyxBQU1FLEFBQ1A7aUJBUEssQUFPUSxBQUNiO2FBUkssQUFRSSxBQUNUO1lBVlcsQUFDTixBQVNHLEFBRVYsYUFaYSxBQUNiOztTQVdPLEFBQ0w7YUFESyxBQUNJLEFBQ1Q7V0FGSyxBQUVFLEFBQ1A7c0IsQUFmVyxBQVlOLEFBR2E7Oztzd0JDZnRCO0FBQ0Esb0I7O0EsQUFFcUIsb0JBTW5COzs7Ozs7bUJBQWMsbUNBTGQsQUFLYyxRQUxtQixBQUtuQixRQUpkLEFBSWMsa0JBSlksQUFJWiw4Q0FIZCxBQUdjLFlBSFEsQ0FBQSxBQUFDLEtBQUQsQUFBTSxBQUdkLGNBRmQsQUFFYyxZQUZRLFlBQU0sQUFBRSxDQUVoQixBQUNaO1NBQUEsQUFBSyxNQUFMLEFBQVcsU0FBWCxBQUFvQixBQUNwQjtTQUFBLEFBQUssTUFBTCxBQUFXLFFBQVgsQUFBbUIsQUFDbkI7U0FBQSxBQUFLLE1BQUwsQUFBVyxRQUFYLEFBQW1CLEFBQ25CO1NBQUEsQUFBSyxNQUFMLEFBQVcsV0FBWCxBQUFzQixBQUN0QjtTQUFBLEFBQUssTUFBTCxBQUFXLFFBQVEsS0FBbkIsQUFBd0IsQUFDeEI7U0FBQSxBQUFLLE1BQUwsQUFBVyxPQUFPLEtBQWxCLEFBQXVCLEFBQ3hCO0FBRUQ7Ozs7Ozs7Ozs7MkRBU0c7QSxTLEFBQWEsSUFBb0IsQUFDbEM7VUFBSSxPQUFBLEFBQU8sT0FBWCxBQUFrQixZQUFZLE1BQU0sSUFBQSxBQUFJLE1BQVYsQUFBTSxBQUFVLEFBQzlDO1VBQUksS0FBQSxBQUFLLFFBQVQsQUFBSSxBQUFhLE1BQU0sS0FBQSxBQUFLLElBQUwsQUFBUyxLQUFULEFBQWMsQUFDdEM7QUFFRDs7Ozs7Ozs7Ozs4Q0FTSztBLFMsQUFBYSxNQUFpQixBQUNqQztVQUFJLEtBQUEsQUFBSyxVQUFMLEFBQWUsUUFBZixBQUF1QixPQUFPLENBQWxDLEFBQW1DLEdBQUcsQUFDcEM7YUFBQSxBQUFLLHNCQUFMLEFBQWMsWUFBUSxDQUFBLEFBQUMsS0FBdkIsQUFBc0IsQUFBTSxBQUM3QjtBQUZELGFBRU8sQUFDTDtZQUFNLE9BQWUsS0FBQSxBQUFLLFFBQTFCLEFBQXFCLEFBQWEsQUFDbEM7WUFBTSxPQUFlLEtBQUEsQUFBSyxRQUExQixBQUFxQixBQUFhLEFBRWxDOztZQUFJLEtBQUEsQUFBSyxNQUFULEFBQUksQUFBVyxPQUFPLEFBQ3BCO2NBQU0sS0FBZSxLQUFBLEFBQUssTUFBTCxBQUFXLE1BQVgsQUFBaUIsU0FBUyxLQUEvQyxBQUFvRCxBQUNwRDthQUFBLEFBQUcsS0FBSCxBQUFRLE1BQVIsQUFBYyxBQUNmO0FBQ0Y7QUFFRDs7V0FBQSxBQUFLLFNBQUwsQUFBYyxLQUFkLEFBQW1CLEtBQW5CLEFBQXdCLEFBQ3pCO0FBRUQ7Ozs7Ozs7Ozs7O2tEQVVTO0EsUyxBQUFhLFcsQUFBbUIsTUFBaUIsQUFDeEQ7VUFBSSxLQUFBLEFBQUssTUFBTCxBQUFXLFNBQWYsQUFBSSxBQUFvQixNQUFNLEFBQzVCO2FBQUEsQUFBSyxNQUFMLEFBQVcsU0FBWCxBQUFvQixLQUFwQixBQUF5QixLQUF6QixBQUE4QixNQUE5QixBQUFvQyxXQUFwQyxBQUErQyxBQUNoRDtBQUNGO0FBRUQ7Ozs7Ozs7Ozs7NkNBU0k7QSxTLEFBQWEsSUFBb0IsQUFDbkM7VUFBSSxLQUFBLEFBQUssVUFBTCxBQUFlLFFBQWYsQUFBdUIsT0FBTyxDQUFsQyxBQUFtQyxHQUFHLEFBQ3BDO2FBQUEsQUFBSyxNQUFMLEFBQVcsU0FBWCxBQUFvQixPQUFwQixBQUEyQixBQUM1QjtBQUZELGFBRU8sQUFDTDtZQUFNLE9BQWUsS0FBQSxBQUFLLFFBQTFCLEFBQXFCLEFBQWEsQUFDbEM7WUFBTSxPQUFlLEtBQUEsQUFBSyxRQUExQixBQUFxQixBQUFhLEFBQ2xDO2FBQUEsQUFBSyxNQUFMLEFBQVcsTUFBWCxBQUFpQixRQUFqQixBQUF5QixBQUMxQjtBQUNGO0FBRUQ7Ozs7Ozs7Ozs2Q0FRSTtBLFNBQXNCLEFBQ3hCO1VBQUksQUFDRjtZQUFNLE9BQWlCLElBQUEsQUFBSSxNQUEzQixBQUF1QixBQUFVLEFBQ2pDO2VBQU8sS0FBQSxBQUFLLFNBQUwsQUFBYyxJQUFJLENBQUMsQ0FBQyxLQUFBLEFBQUssTUFBTSxLQUFYLEFBQVcsQUFBSyxJQUFJLEtBQXhDLEFBQW9CLEFBQW9CLEFBQUssTUFBTSxDQUFDLENBQUMsS0FBQSxBQUFLLE1BQUwsQUFBVyxTQUFTLEtBQWhGLEFBQTRELEFBQW9CLEFBQUssQUFDdEY7QUFIRCxRQUdFLE9BQUEsQUFBTyxHQUFHLEFBQ1Y7ZUFBQSxBQUFPLEFBQ1I7QUFDRjtBQUVEOzs7Ozs7Ozs7aURBUVE7QSxTQUFxQixBQUMzQjthQUFPLElBQUEsQUFBSSxNQUFKLEFBQVUsV0FBakIsQUFBTyxBQUFxQixBQUM3QjtBQUVEOzs7Ozs7Ozs7aURBUVE7QSxTQUFxQixBQUMzQjthQUFPLElBQUEsQUFBSSxNQUFKLEFBQVUscUJBQWpCLEFBQU8sQUFBK0IsQUFDdkM7QUFFRDs7Ozs7Ozs7O2lEQVFRO0EsU0FBc0IsQUFDNUI7YUFBTyxLQUFBLEFBQUssZ0JBQUwsQUFBcUIsS0FBckIsQUFBMEIsUUFBUSxLQUFBLEFBQUssVUFBTCxBQUFlLFFBQWYsQUFBdUIsT0FBTyxDQUF2RSxBQUF3RSxBQUN6RTtBLDZDLEFBNUlrQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMrQ3JCOzs7Ozs7O3cwREFRTzs7aUJBQ1MsQUFBRyxLQUFILEFBQVEsTUFEakIsQUFDUyxBQUFjLEtBQWQsdUJBQTRCLDRCQUFBLEFBQXFCLEtBQUssQ0FEL0QsQUFDcUMsQUFBMEIsQUFBQywyREFEaEUsQUFDOEIsa0Ysb0IsQUFEZjs7O0FBSXRCOzs7Ozs7Ozs7Ozs7Ozs7OztBQWlCQTs7Ozs7Ozs7eWpDQVNPO29CQUFBLEFBQXdCO2lCQUNSLEFBQUcsS0FBSCxBQUFRLE1BQVIsQUFBYyxLQUFLLGNBRG5DLEFBQ2dCLEFBQW1CLEFBQWMsTUFBakMsU0FEaEIsQUFDQyxnREFDQztBQUZGLG1GLG9CLEFBQWU7OztBQUt0Qjs7Ozs7Ozs7d2JBU087b0JBQUEsQUFBMEI7aUJBQ1YsQUFBRyxLQUFILEFBQVEsTUFBUixBQUFjLE9BRDlCLEFBQ2dCLEFBQXFCLEdBQXJCLFNBRGhCLEFBQ0MsZ0RBQ0M7QUFGRixtRixvQixBQUFlOzs7QUFLdEI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXVDQTs7Ozs7Ozs7O3FuQkFVTztvQkFBQSxBQUFnQyxxUEFDOUI7OEpBQ0w7bUNBQUEsQUFBVyxLQUFYLEFBQWdCLE1BQU0sS0FBdEIsQUFBMkIsQUFFM0I7OzZCQUFBLEFBQUssTUFBTCxBQUFXLEtBQVgsQUFBZ0IsU0FBaEIsQUFBeUIsQUFFekI7O2lDQUFBLEFBQVMsS0FBVCxBQUFjLGVBRWQ7O2tEQVBLOytCQUFBLEFBUUMsQUFBSyxNQUFMLGlFQVRILGFBQUEsQUFDaUIsa0VBRGpCLEFBQ2lCLHVGLG9CLEFBREY7Ozs7QUFhdEI7Ozs7Ozs7O3d6QkFTTztvQkFBQSxBQUF3QjtpQkFDUixBQUFHLEtBQUgsQUFBUSxNQUFSLEFBQWMsT0FBTyxLQUFyQixBQUEwQixLQUFLLEVBQUUsUUFEakQsQUFDZ0IsQUFBK0IsQUFBVSxPQUF6QyxTQURoQixBQUNDLGdEQUNDO0FBRkYsbUYsb0IsQUFBZTs7O0FBS3RCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTJEQTs7Ozs7Ozs7O3VtQkFVTztvQkFBQSxBQUE0QixNQUE1QixBQUF5QywySkFDOUM7QUFDQTsyQkFBQSxBQUFlLEtBQWYsQUFBb0IsTUFBcEIsQUFBMEIsTUFBMUIsQUFBZ0MsQUFFaEM7O0FBQ007QUFMRCx5QkFLcUIsWUFBQSxBQUFZLEtBQVosQUFBaUIsTUFBakIsQUFBdUIsTUFMNUMsQUFLcUIsQUFBNkIsQUFFdkQ7O0FBQ0E7dUJBQUEsQUFBVyxTQUFYLEFBQW9CLE1BUmY7O2lCQVVnQixBQUFHLEtBQUgsQUFBUSxNQUFSLEFBQWMsT0FBTyxLQUFyQixBQUEwQixLQVYxQyxBQVVnQixBQUErQixXQUEvQixTQVZoQixBQVVDLGdEQUVDOztBQVpGLG1GLG9CLEFBQWU7OztBQWV0Qjs7Ozs7Ozs7OzBkQVVPO29CQUFBLEFBQWlDLE1BQWpDLEFBQThDLDZJQUM3QztBQURELG1CQUFBLEFBQ2lCLHNIQUNmO2dDQUFBLEFBQXNDLG9JQUMzQztBQUNBOzRCQUFBLEFBQUksUUFBUSxBQUNWO0FBQ0E7eUNBQUEsQUFBZSxLQUFmLEFBQW9CLE1BQXBCLEFBQTBCLEFBQzNCO0FBSEQsK0JBR08sQUFDTDtBQUNBO3VDQUFBLEFBQWEsS0FBYixBQUFrQixNQUFsQixBQUF3QixNQUF4QixBQUE4QixBQUMvQjtBQUVEOztBQUNBOzJDQUFBLEFBQW1CLEtBQW5CLEFBQXdCLE1BQXhCLEFBQThCLFNBQTlCLEFBQXVDLFFBQVEsS0FBL0MsQUFBb0QsQUFFcEQ7O0FBQ0E7dUNBQUEsQUFBZSxLQUFmLEFBQW9CLE1BQXBCLEFBQTBCLE1BQTFCLEFBQWdDLEFBRWhDOztBQUNBO2lDQUFBLEFBQVMsS0FBVCxBQUFjLDhCQUFkLEFBQW1DLEFBRW5DOztBQW5CSztrREFvQkMsS0FwQkQsQUFvQkMsQUFBSyxzRUF0QlIsYUFBQSxBQUVpQix5RUFGakIsQUFFaUIsMkYsb0IsQUFGRjs7OztBQTBCdEI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNENBOzs7Ozs7O3F5Q0FRTztxTkFDTDtBQUNBO0FBQ0E7eUJBQWEsS0FBYixBQUFrQixBQUVsQjs7QUFMSzt1Q0FNc0IsR0FBQSxBQUFHLEtBQUgsQUFBUSxNQU45QixBQU1zQixBQUFjLGVBTnBDLEFBTUMsdUJBTkQsQUFNNkM7O3FCQU43QyxBQVFRLFNBQVQsOEJBQ0Y7cUJBQUEsQUFBUyxLQUFULEFBQWMsOEJBQXFCLEtBQW5DLEFBQW1DLEFBQUssQUFDeEM7c0JBQUEsQUFBVSxLQUFWLEFBQWUsK0JBQ1I7QUFYSixjQUFBLFFBY0E7OztpQkFBQSxBQUFLLFVBQUwsQUFBZSxJQUFJLEtBZG5CLEFBY0EsQUFBd0Isc0NBQzNCO3FCQUFBLEFBQVMsS0FBVCxBQUFjLDRCQUFtQixLQUFqQyxBQUFzQyxTQWZuQzsrQkFnQlUsQUFBaUIsS0FBakIsQUFBc0IsTUFoQmhDLEFBZ0JVLEFBQTRCLEtBQTVCLDBCQWhCVixBQWdCa0QsaURBaEJsRCxBQWdCNkMscURBQ3pDO0FBakJKLG9CQW9CTDs7O0FBQ007QUFyQkQsd0JBcUJ1QixLQUFBLEFBQUssVUFBTCxBQUFlLElBQUksS0FyQjFDLEFBcUJ1QixBQUF3QixBQUVwRDs7QUFDTTtBQXhCRCw2QkF3QjJCLElBeEIzQixBQXdCMkIsQUFBSSxBQUVwQzs7QUFDTTtBQTNCRCxzQkEyQm1CLEtBQUEsQUFBSyxPQUFMLEFBQVksSUEzQi9CLEFBMkJtQixBQUFnQixBQUV4Qzs7QUFDTTtBQTlCRCxxQkE4QlUsQ0FBQSxBQUFDLE1BQUQsQUFBTyxXQTlCakIsQUE4QlUsQUFBa0IsQUFFakM7O0FBaENLO3dDQWlDNEIsWUFBQSxBQUFZLHlCQUFaLEFBQWlCLGFBakM3QyxBQWlDNEIsQUFBMEIsaUNBakN0RCxBQWlDb0UsS0FqQ3BFLEFBaUNDLDBCQWpDRCxBQWlDK0QsZ0JBRXBFOztBQUNBO0FBQ0E7QUFDQTtpQkFBQSxBQUFLLGlCQUFpQixXQUFBLEFBQVcsU0FBakMsQUFBc0IsQUFBb0Isa0NBRW5DOztpQkF4Q0YsQUF3Q08sZUF4Q1AsbUUsb0IsQUFBZTs7O0FBMkN0Qjs7Ozs7Ozs7Ozs7O0FBWUE7Ozs7Ozs7OytwQkFTTztxQkFBQSxBQUEyQjtvQkFDNUIsQUFBTyw2Q0FBUCxBQUFPLFdBQVAsQUFBZ0IsWUFBWSxLQUFBLEFBQUssV0FEaEMsQUFDMkMsSUFBNUMsa0VBREMsQUFDd0Q7bUJBQy9DLEFBQUssU0FBUyxLQUZ2QixBQUVTLEFBQW1CLElBQW5CLDhGQUZULEFBRXNDLHdFLG9CLEFBRnZCOzs7QUFLdEI7Ozs7Ozs7Ozt1a0IsQUExWWdCLGdCLEFBQUEsc0IsQUFnQkEsSyxBQUFBLFcsQUEyQkEsVyxBQUFBLGlCLEFBNENBLGlCLEFBQUEsdUIsQUFxQkEsWSxBQUFBLGtCLEFBd0RBLHFCLEFBQUEsMkIsQUFpQkEsaUIsQUFBQSx1QixBQWNBLGMsQUFBQSxvQixBQTBGMkIsYyxBQUFBLG9CLEFBMkYzQixZLEFBQUE7QSxBQTRCQSxrQixBQUFBLGdCQS9haEIsZ0MsNkNBQ0Esb0MsaURBQ0EsbUQsK0RBQ0EsZ0NBQ0Esb0MseXNCLEFBVUEsNkQsQUFDQSx3QyxBQUNBLGdDQUVBOzs7Ozs7Ozsyc0NBU08sU0FBQSxBQUFTLGNBQVQsQUFBdUIsTUFBb0IsQ0FDaEQsS0FBQSxBQUFLLFdBQVcsS0FBQSxBQUFLLFlBQXJCLEFBQWlDLEVBRWpDLElBQUksT0FBTyxLQUFQLEFBQVksYUFBaEIsQUFBNkIsVUFBVSxLQUFBLEFBQUssV0FBTCxBQUFnQixFQUV2RCxPQUFBLEFBQU8sQUFDUixLLEVBRUQ7Ozs7Ozs7czFDQVFPLFNBQUEsQUFBUyxLQUFxQixDQUNuQyxPQUFPLEFBQUMsS0FBRCxBQUFZLFFBQVosQUFBb0IsUUFBUSxBQUFDLEtBQXBDLEFBQU8sQUFBNEIsQUFBWSxBQUNoRCxRQXlCTSxVQUFBLEFBQVMsU0FBVCxBQUFrQixhQUEyQyxDQUNsRSxJQUFJLEFBQUMsS0FBRCxBQUFZLE9BQVosQUFBbUIsSUFBbkIsQUFBdUIsWUFBWSxPQUFBLEFBQU8sZ0JBQTlDLEFBQThELFlBQVksbUNBRHpCLEFBQ3lCLHVFQUR6QixBQUN5QixpQ0FDeEUsYUFBQSxBQUFZLEFBQ2IsTUFDRixDQXdDTSxVQUFBLEFBQVMsZUFBVCxBQUF3QixNQUF4QixBQUFxQyxNQUE4QixrQkFDeEUsSUFBSSxFQUFFLFNBQU4sQUFBSSxBQUFXLE9BQU8sT0FBQSxBQUFPLE1BRTdCLElBQU0sU0FBUyxDQUFDLENBQUksS0FBSixBQUFTLFlBQVQsQUFBZ0IsTUFBakIsQUFBQyxBQUF3QixVQUFVLENBQUksS0FBSixBQUFTLFlBQTNELEFBQWUsQUFBbUMsQUFBa0IsbUJBRXBFLE9BQUEsQUFBTyxRQUFRLFVBQUEsQUFBQyxHQUFNLENBQ3BCLE1BQUEsQUFBSyxNQUFMLEFBQVcsS0FBSyxFQUFoQixBQUFnQixBQUFFLElBQWxCLEFBQXNCLE1BQ3RCLFNBQUEsQUFBUywrRUFBVCxBQUE2QyxBQUM5QyxLQUhELEdBS0EsT0FBQSxBQUFPLEFBQ1IsSyxFQUVEOzs7Ozs7OzIrREFRTyxTQUFBLEFBQVMsWUFBa0IsQ0FDaEMsS0FBQSxBQUFLLE9BRUwsYUFBYSxLQUFiLEFBQWtCLGdCQUVsQixTQUFBLEFBQVMsS0FBVCxBQUFjLGdDQUFkLEFBQXFDLEFBQ3RDLFFBa0RNLFVBQUEsQUFBUyxtQkFBVCxBQUE0QixNQUE1QixBQUEwQyxRQUExQyxBQUEyRCxNQUFvQixDQUNwRixJQUFJLHNCQUFBLEFBQVUsUUFBVixBQUFrQixTQUFTLHVCQUFXLE9BQTFDLEFBQStCLEFBQVcsQUFBTyxRQUFRLENBQ3ZELE9BQUEsQUFBTyxNQUFQLEFBQWEsS0FBYixBQUFrQixRQUFsQixBQUEwQixNQUMxQixPQUFBLEFBQU8sQUFDUixLQUNELFFBQUEsQUFBTyxBQUNSLE0sRUFFRDs7Ozs7Ozs7d3lFQVNPLFNBQUEsQUFBUyxlQUFULEFBQXdCLE1BQW1CLENBQ2hELFdBQUEsQUFBVyxLQUFYLEFBQWdCLE1BQU0sS0FBdEIsQUFBMkIsQUFDNUIsSyxFQUVEOzs7Ozs7Ozs7NDJFQVVPLFNBQUEsQUFBUyxZQUFULEFBQXFCLE1BQXJCLEFBQWtDLFFBQXdCLENBQy9ELElBQUksRUFBRSxXQUFOLEFBQUksQUFBYSxTQUFTLE9BQUEsQUFBTyxRQUFQLEFBQWUsRUFFekMsSUFBSSxFQUFFLFdBQU4sQUFBSSxBQUFhLE9BQU8sQ0FDdEIsS0FBQSxBQUFLLFFBQUwsQUFBYSxFQUNiLEtBQUEsQUFBSyxRQUFRLE9BQWIsQUFBb0IsQUFDckIsTUFFRCxNQUFBLEFBQUssU0FBTCxBQUFjLEVBRWQsSUFBSSxLQUFBLEFBQUssU0FBUyxPQUFsQixBQUF5QixPQUFPLENBQzlCLEtBQUEsQUFBSyxVQUFMLEFBQWUsQUFDaEIsS0FFRCxRQUFBLEFBQU8sQUFDUixLLEVBMkVNLDBCQUEyQixTQUFBLEFBQVMsWUFBVCxBQUNoQyxNQURnQyxBQUVoQyxRQUZnQyxBQUdoQyxnQkFDVSw2RkFDSCw4TUFBQSxBQUNDLE9BREQsQUFDaUIsTUFEakIsQUFHTDt5Q0FDTSxTQUFBLEFBQVMsS0FBVCxBQUFjLE1BSmYsQUFJQyxBQUFvQixjQUUxQixBQUNBO2lDQUFBLEFBQW1CLEtBQW5CLEFBQXdCLE1BQXhCLEFBQThCLFVBQTlCLEFBQXdDLGdCQUFnQixLQVBuRCxBQU9MLEFBQTZELE9BRTdELEFBQ0E7NkJBQUEsQUFBZSxLQUFmLEFBQW9CLE1BQXBCLEFBQTBCLE1BQTFCLEFBQWdDLFVBVjNCLEFBWUMsT0FBTyxnQkFBQSxBQUFNLFdBQVcsT0FaekIsQUFZUSxBQUF3QixPQUVyQyxBQUNNO0FBZkQsNkJBZWdCLE9BQUEsQUFBTyxPQUFPLFFBZjlCLEFBZWdCLEFBQXNCLElBRTNDLFNBQUEsQUFBUyxLQUFULEFBQWMsZ0NBQWQsQUFBcUMsUUFBckMsQUFBNkMsTUFBTSxnQkFqQjlDLEFBaUJMLEFBQXlELGFBakJwRCxBQW1CTDs4QkFDQSx3Q0FBQSxBQUFlLFFBQWYsQUFDRyxtQ0FESCxBQUNRLGdCQUFnQixLQUR4QixBQUM2QixnQ0FyQnhCLEFBb0JMLEFBQ3NDLDRDQUN2QixrQkFBQSxBQUFrQixLQUFsQixBQUF1QixNQUF2QixBQUE2QixNQXRCdkMsQUFzQlUsQUFBbUMsd0NBdEI3QyxBQXNCbUUscUNBdEJuRSxBQXNCOEQsa0RBdEI5RCxBQXNCRixvRUFDYSxpQkFBQSxBQUFpQixLQUFqQixBQUFzQixNQXZCakMsQUF1QlcsQUFBNEIsOEJBdkJ2QyxBQXVCbUQscUNBdkJuRCxBQXVCOEMsa0NBdkI5QyxBQXVCRiwyR0F2QkwsYUFBQSxBQUFzQixpRUFBdEIsQUFBc0IsaUJBeUJ2QixHQXpCQyxDQXNGSyxVQUFBLEFBQVMsWUFBa0IsQ0FDaEMsS0FBQSxBQUFLLFVBQUwsQUFBZSxBQUNoQixNQTBCTSxVQUFBLEFBQVMsa0JBQTJCLENBQ3pDLElBQUksZ0JBQUosQUFBVSxjQUFjLE9BQUEsQUFBTyxNQUUvQixJQUFNLFVBQVUsZ0JBQUEsQUFBTSxnQkFBdEIsQUFBc0MsR0FFdEMsS0FBQSxBQUFLLFVBQUwsQUFBZSxNQUFmLEFBQXFCLFNBRXJCLGdCQUFBLEFBQU0sZUFBTixBQUFxQixLQUVyQixPQUFBLEFBQU8sQUFDUjs7OzJFQzViRCxnQzs7QUFFQTs7QUFFQSxPQUFBLEFBQU8sd0I7Ozs7Ozs7OztBLEFDRWlCLE1BSnhCLG9DLGlEQUNBLHdDLHFEQUNBLGtDLDJJQUVlLFVBQUEsQUFBUyxNQUFULEFBQWUsUUFBaUIsQUFDN0M7T0FBQSxBQUFLLFNBQVMscUJBQWQsQUFBYyxBQUFXLEFBQzFCOzs7QUFFRCxNQUFBLEFBQU0sT0FBTixBQUFhO0FBQ2IsTUFBQSxBQUFNLE9BQU4sQUFBYTtBQUNiLE1BQUEsQUFBTSxVQUFOLEFBQWdCO0FBQ2hCLE1BQUEsQUFBTSxlQUFOLEFBQXFCO0FBQ3JCLE1BQUEsQUFBTSxhQUFOLEFBQW1COztBQUVuQixNQUFBLEFBQU0sVUFBTixBQUFnQixZQUFZLGdCQUE1Qjs7QUFFQTs7Ozs7Ozs7QUFRQSxNQUFBLEFBQU0sVUFBTixBQUFnQixTQUFTLFNBQUEsQUFBUyxPQUFULEFBQWdCLFNBQXdCLEFBQy9EO01BQUksQ0FBQyxLQUFBLEFBQUssVUFBTCxBQUFlLElBQXBCLEFBQUssQUFBbUIsVUFBVSxBQUNoQztTQUFBLEFBQUssVUFBTCxBQUFlLEtBQWYsQUFBb0IsU0FBUyxzQkFBQSxBQUFZLFNBQVMsS0FBbEQsQUFBNkIsQUFBMEIsQUFDeEQ7QUFDRDtTQUFPLEtBQUEsQUFBSyxVQUFMLEFBQWUsSUFBdEIsQUFBTyxBQUFtQixBQUMzQjtBQUxEOztBQU9BOzs7Ozs7OztBQVFBLE1BQUEsQUFBTSxVQUFOLEFBQWdCLFVBQVUsU0FBQSxBQUFTLFFBQVQsQUFBaUIsTUFBcUIsQUFDOUQ7TUFBSSxDQUFDLEtBQUEsQUFBSyxVQUFMLEFBQWUsSUFBcEIsQUFBSyxBQUFtQixPQUFPLEFBQzdCO1VBQU0sSUFBQSxBQUFJLFlBQUosQUFBYyxPQUFwQixBQUNEO0FBQ0Q7U0FBTyxLQUFBLEFBQUssVUFBTCxBQUFlLElBQXRCLEFBQU8sQUFBbUIsQUFDM0I7QUFMRDs7QUFPQTs7Ozs7Ozs7QUFRQSxNQUFBLEFBQU0sVUFBTixBQUFnQixhQUFhLFNBQUEsQUFBUyxXQUFULEFBQW9CLEtBQW1CLEFBQ2xFO09BQUEsQUFBSyxPQUFMLEFBQVksSUFBWixBQUFnQixXQUFoQixBQUEyQixBQUM1QjtBQUZEOztBQUlBOzs7Ozs7OztBQVFBLE1BQUEsQUFBTSxVQUFOLEFBQWdCLFdBQVcsU0FBQSxBQUFTLFNBQVQsQUFBa0IsS0FBbUIsQUFDOUQ7T0FBQSxBQUFLLE9BQUwsQUFBWSxJQUFaLEFBQWdCLFNBQWhCLEFBQXlCLEFBQzFCO0FBRkQ7O0FBSUE7Ozs7Ozs7O0FBUUEsTUFBQSxBQUFNLFVBQU4sQUFBZ0IsWUFBWSxTQUFBLEFBQVMsVUFBVCxBQUFtQixLQUFtQixBQUNoRTtPQUFBLEFBQUssT0FBTCxBQUFZLElBQVosQUFBZ0IsVUFBaEIsQUFBMEIsQUFDM0I7QUFGRDs7QUFJQTs7Ozs7Ozs7QUFRQSxNQUFBLEFBQU0sVUFBTixBQUFnQixlQUFlLFNBQUEsQUFBUyxhQUFULEFBQXNCLEtBQW1CLEFBQ3RFO09BQUEsQUFBSyxPQUFMLEFBQVksSUFBWixBQUFnQixhQUFoQixBQUE2QixBQUM5QjtBQUZEOztBQUlBOzs7Ozs7OztBQVFBLE1BQUEsQUFBTSxVQUFOLEFBQWdCLFdBQVcsU0FBQSxBQUFTLFNBQVQsQUFBa0IsS0FBb0IsQUFDL0Q7T0FBQSxBQUFLLE9BQUwsQUFBWSxJQUFaLEFBQWdCLFNBQWhCLEFBQXlCLEFBQzFCO0FBRkQ7O0FBSUEsTUFBQSxBQUFNLFVBQU4sQUFBZ0IsYUFBYSxTQUFBLEFBQVMsV0FBVCxBQUFvQixLQUFtQixBQUNsRTtPQUFBLEFBQUssT0FBTCxBQUFZLElBQVosQUFBZ0IsV0FBaEIsQUFBMkIsQUFDNUI7QUFGRDs7QUFJQTs7Ozs7Ozs7QUFRQSxNQUFBLEFBQU0sVUFBVSxTQUFBLEFBQVMsVUFBd0QsS0FBaEQsQUFBZ0QsaUZBQVYsQUFBVSxBQUMvRTtNQUFJLEVBQUUsc0JBQU4sQUFBSSxBQUF3QixTQUFTLEFBQ25DO1VBQU0sSUFBQSxBQUFJLE1BQVYsQUFBTSxBQUFVLEFBQ2pCO0FBQ0Q7UUFBQSxBQUFNLGVBQU4sQUFBcUIsQUFDckI7UUFBQSxBQUFNLGVBQU4sQUFBcUIsQUFDdEI7QUFORDs7QUFRQTs7Ozs7Ozs7QUFRQSxNQUFBLEFBQU0sT0FBTyxTQUFBLEFBQVMsT0FBdUQsS0FBbEQsQUFBa0QsbUZBQVYsQUFBVSxBQUMzRTtNQUFJLEVBQUUsd0JBQU4sQUFBSSxBQUEwQixTQUFTLEFBQ3JDO1VBQU0sSUFBQSxBQUFJLE1BQVYsQUFBTSxBQUFVLEFBQ2pCO0FBQ0Q7UUFBQSxBQUFNLGFBQU4sQUFBbUIsQUFDcEI7QUFMRDs7QUFPQTs7Ozs7Ozs7QUFRQSxNQUFBLEFBQU0sTUFBTSxTQUFBLEFBQVMsTUFBZ0QsS0FBNUMsQUFBNEMsNkVBQVYsQUFBVSxBQUNuRTtRQUFBLEFBQU0sdUJBQWUsTUFBckIsQUFBMkIsU0FBM0IsQUFBdUMsQUFDeEM7QUFGRDs7OztBQ3RKQSxtQzs7OztBQUlBO0FBQ0EsZ0M7O0FBRUE7QUFDQTtBQUNBLG1GOztBLEFBRXFCLDZCQUtuQjs7Ozs7MEJBQUEsQUFBWSxRQUFaLEFBQTZCLFNBQW1CLHVCQUM5QztTQUFBLEFBQUssU0FBTCxBQUFjLEFBQ2Q7U0FBQSxBQUFLLFVBQVUsS0FBQSxBQUFLLFdBQXBCLEFBQWUsQUFBZ0IsQUFDaEM7QSxzRUFFVTs7QSxhQUFjLEFBQ3ZCO1VBQUksUUFBQSxBQUFPLGdEQUFQLEFBQU8sY0FBWCxBQUF1QixVQUFVLEFBQy9CO2VBQUEsQUFBTyxBQUNSO0FBRkQsaUJBRVcsT0FBQSxBQUFPLFlBQVgsQUFBdUIsWUFBWSxBQUN4QztlQUFPLElBQUEsQUFBSSxRQUFRLEtBQW5CLEFBQU8sQUFBaUIsQUFDekI7QUFGTSxPQUFBLE1BRUEsSUFBSSxLQUFBLEFBQUssT0FBTCxBQUFZLElBQVosQUFBZ0IsZUFBcEIsQUFBbUMsWUFBWSxBQUNwRDtlQUFPLDhCQUFvQixLQUEzQixBQUFPLEFBQXlCLEFBQ2pDO0FBQ0Q7YUFBTyxpQ0FBdUIsS0FBOUIsQUFBTyxBQUE0QixBQUNwQztBQUVEOzs7Ozs7Ozs7aURBUVE7QSxVQUE4QixBQUNwQztXQUFBLEFBQUssaUJBQUwsQUFBc0IsQUFDdEI7YUFBQSxBQUFPLEFBQ1I7QUFFRDs7Ozs7Ozs7Ozt1QixBQVFxQixBQUFLLEtBQUwsbUQsQUFBYixvQixBQUF5QixnQkFDekI7QSx3QkFBUSx1QkFBQSxBQUFRLEssQUFBUixBQUFhLG1DQUNwQjt1QkFBQSxBQUFPLEtBQVAsQUFBWSxBQUNoQjtBQURJLG9CQUNBLHVCQUFPLFNBQUEsQUFBUyxLQUFoQixBQUFPLEFBQWMsSUFEckIsQUFFSjtBQUZJLHFCQUVDLFVBQUEsQUFBQyxHQUFELEFBQUksV0FBTSxJQUFWLEFBQWMsRUFGZixBQUdKO0FBSEksdUJBR0csS0FBQSxBQUFLLFlBSFIsQUFHRyxBQUFpQixRLEFBSHBCLEFBRzRCLHlJQUdyQzs7Ozs7Ozs7OztnZkFRVztBO3dCQUNMLEFBQU8sNkNBQVAsQUFBTyxXLEFBQVMsUUFBaEIsZ0UsQUFBaUM7Ozt1QkFHUixBQUFLLFFBQUwsQUFBYSxJQUFJLEssQUFBakIsQUFBc0IsZUFBdEIsUyxBQUF2Qjs7Ozt1QixBQUlJLEFBQUssWUFBTCx5REFDUjt3QkFBQSxBQUFRLHFDQUFrQyxLQUExQyxBQUErQywwQ0FBb0MsS0FBQSxBQUFLLE9BQUwsQUFBWSxJQUEvRixBQUFtRixBQUFnQixrQ0FDNUY7QSxzQixNQUdUOzs7QUFDQTtBQUNNO0EsMEJBQVUsS0FBQSxBQUFLLFksQUFBTCxBQUFpQixBQUVqQzs7QUFDQTtzQkFBQSxBQUFNLEtBQU4sQUFBVyxBQUVYOzs7MkNBQ00sS0FBQSxBQUFLLFFBQUwsQUFBYSxJQUFJLEtBQWpCLEFBQXNCLGdCLEFBQXRCLEFBQXNDLHVDQUVyQzs7d0IsQUFBUSw2SUFHakI7Ozs7Ozs7OzBjQU1hO0EsVSxBQUFZO3VCLEFBQ0csQUFBSyxLQUFMLFMsQUFBcEIsaUJBQ0E7QSx3QkFBZ0IsS0FBQSxBQUFLLFVBQVUscUJBQUssRUFBQSxBQUFFLFFBQVAsQUFBZSxHLEFBQTlCLEFBRXRCOzs7c0JBQ0ksUSxBQUFRLGlFLEFBQVUsWUFFdEI7O0FBQ0E7cUJBQUEsQUFBSyxTQUFTLE9BQUEsQUFBTyxPQUFQLEFBQWMsSUFBSSxLQUFsQixBQUFrQixBQUFLLFFBQXJDLEFBQWMsQUFBK0IsQUFFN0M7OzswQ0FDTSxLQUFBLEFBQUssUUFBTCxBQUFhLElBQUksS0FBakIsQUFBc0IsZ0IsQUFBdEIsQUFBc0MscUNBRXJDOztBLHdLQUdUOzs7Ozs7Ozs7O2dkQVFhO0E7dUIsQUFDZSxBQUFLLEtBQUwsUyxBQUFwQixpQkFDQTtBLHdCQUFnQixLQUFBLEFBQUssVUFBVSxxQkFBSyxFQUFBLEFBQUUsUUFBUCxBQUFlLEcsQUFBOUI7O3dCLEFBRVYsQ0FBUixnRSxBQUFrQixZQUV0Qjs7dUJBQU8sS0FBUCxBQUFPLEFBQUssTyxtQkFFTjs7dUJBQUEsQUFBSyxRQUFMLEFBQWEsSUFBSSxLQUFqQixBQUFzQixnQkFBZ0IsS0FBQSxBQUFLLE9BQU8scUJBQUEsQUFBSyxFLEFBQXZELEFBQXNDLG9DQUVyQzs7QSxxS0FHVDs7Ozs7Ozs7Ozs7dUJBUXNCLEFBQUssUUFBTCxBQUFhLElBQUksSyxBQUFqQixBQUFzQixlQUF0QixTLEFBQWQsK0NBQ0M7QSwwSkFHVDs7Ozs7Ozs7O29XQU9xQjtBQUNuQjthQUFPLENBQUMsQ0FBQyxJQUFJLEtBQUwsQUFBSyxBQUFLLFlBQVgsQUFBdUIsU0FBdkIsQUFBZ0MsU0FBdkMsQUFBTyxBQUF5QyxBQUNqRDtBQUVEOzs7Ozs7Ozs7cURBUVk7QSxVQUFvQixBQUM5QjtVQUFNLHVCQUFOLEFBQU0sQUFBZSxBQUNyQjtjQUFBLEFBQVEsWUFBWSxLQUFwQixBQUFvQixBQUFLLEFBQ3pCO2NBQUEsQUFBUSxNQUFNLEtBQWQsQUFBYyxBQUFLLEFBQ25CO2FBQUEsQUFBTyxBQUNSO0FBRUQ7Ozs7Ozs7OztxREFRWTtBLFdBQWdCLGFBQzFCO1VBQU0sYUFBYSxTQUFiLEFBQWEsV0FBQSxBQUFDLFFBQUQsQUFBa0IsS0FBc0IsQUFDekQ7WUFBSSxNQUFBLEFBQUssT0FBTCxBQUFZLElBQVosQUFBZ0IsaUJBQXBCLEFBQXFDLFFBQVEsQUFDM0M7aUJBQU8sT0FBQSxBQUFPLE9BQU8sTUFBQSxBQUFNLEtBQU4sQUFBVyxZQUFoQyxBQUFPLEFBQ1I7QUFDRDtlQUFPLE9BQUEsQUFBTyxPQUFPLE1BQUEsQUFBTSxLQUFOLEFBQVcsWUFBaEMsQUFBTyxBQUNSO0FBTEQsQUFPQTs7YUFBTyxXQUFBLEFBQVcsS0FBbEIsQUFBTyxBQUFnQixBQUN4QjtBQUVEOzs7Ozs7OztnU0FRUTs7QSx3QkFBZ0IsS0FBQSxBQUFLLE9BQUwsQUFBWSxJLEFBQVosQUFBZ0I7dUIsQUFDUixBQUFLLEtBQUwsb0QsQUFBeEIsdUIsQUFBb0MsNkNBQ25DO2tCQUFFLFVBQVUsQ0FBVixBQUFXLEtBQUssUUFBUSxNLEFBQTFCLEFBQWdDLDBKQUd6Qzs7Ozs7Ozs7OzttaEJBUVk7QTt1QkFDSixBQUFLLFFBQUwsQUFBYSxNLEFBQWIsQUFBbUIsUUFBbkIsZ00sQUE5TVc7Ozs7Ozs7Ozs7Ozs7Ozs7QSxBQ0NMLGMsQUFBQTs7Ozs7Ozs7Ozs7OztBLEFBYUEsWSxBQUFBOzs7Ozs7Ozs7Ozs7QSxBQVlBLGEsQUFBQTs7Ozs7Ozs7Ozs7O0EsQUFZQSx1QixBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0EsQUFtQkEsaUIsQUFBQTs7Ozs7Ozs7Ozs7Ozs7OztBLEFBZ0JBLE8sQUFBQTs7Ozs7Ozs7Ozs7OztBLEFBYUEsTyxBQUFBLE0sQUEvRmhCLDhDQUVBOzs7Ozs7OzhEQVFPLFNBQUEsQUFBUyxZQUFULEFBQXFCLE1BQXJCLEFBQXFDLE1BQXVCLENBQ2pFLE9BQU8sT0FBQSxBQUFPLFVBQVAsQUFBaUIsZUFBakIsQUFBZ0MsS0FBaEMsQUFBcUMsTUFBNUMsQUFBTyxBQUEyQyxBQUNuRCxNLEVBRUQ7Ozs7Ozs7OzZKQVNPLFNBQUEsQUFBUyxVQUFULEFBQW1CLFVBQW5CLEFBQWtDLFFBQXlCLENBQ2hFLE9BQU8sb0JBQUEsQUFBb0IsVUFBVSxVQUFyQyxBQUErQyxBQUNoRCxTLEVBRUQ7Ozs7Ozs7Z1FBUU8sU0FBQSxBQUFTLFdBQVQsQUFBb0IsTUFBeUIsQ0FDbEQsT0FBTyxnQkFBUCxBQUF1QixBQUN4QixTLEVBRUQ7Ozs7Ozs7Z1VBUU8sU0FBQSxBQUFTLHFCQUFULEFBQThCLE1BQXNCLENBQ3pELElBQU0sYUFBYSxNQUFBLEFBQU0sUUFBTixBQUFjLFFBQWQsQUFBc0IsT0FBTyxDQUFBLEFBQUMsV0FBakQsQUFBZ0QsQUFBWSxVQUM1RCxJQUFNLFVBQU4sQUFBZ0IsR0FFaEIsV0FBQSxBQUFXLFFBQVEsVUFBQSxBQUFDLEdBQU0sQ0FDeEIsUUFBQSxBQUFRLEtBQUssWUFBQSxBQUFZLE1BQVosQUFBa0IsT0FBbEIsQUFBeUIsU0FBUyxLQUFBLEFBQUssT0FBcEQsQUFBMkQsQUFDNUQsT0FGRCxHQUlBLE9BQU8sRUFBRSxRQUFBLEFBQVEsUUFBUixBQUFnQixTQUFTLENBQWxDLEFBQU8sQUFBNEIsQUFDcEMsRyxFQUVEOzs7Ozs7OzJrQkFRTyxTQUFBLEFBQVMsZUFBVCxBQUF3QixNQUFzQixDQUNuRCxJQUFJLENBQUMscUJBQUEsQUFBcUIsS0FBSyxDQUExQixBQUEwQixBQUFDLFdBQWhDLEFBQUssQUFBc0MsT0FBTyxDQUNoRCxPQUFBLEFBQU8sQUFDUixNQUNELFFBQU8sS0FBQSxBQUFLLFFBQVosQUFBb0IsQUFDckIsSyxFQUVEOzs7Ozs7Ozt5c0JBU08sU0FBQSxBQUFTLEtBQVQsQUFBYyxHQUFkLEFBQXdCLEdBQWUsQ0FDNUMsT0FBTyxFQUFBLEFBQUUsWUFBWSxFQUFyQixBQUF1QixBQUN4QixVLEVBRUQ7Ozs7Ozs7O293QkFTTyxTQUFBLEFBQVMsS0FBVCxBQUFjLEdBQWQsQUFBd0IsR0FBZSxDQUM1QyxPQUFPLEVBQUEsQUFBRSxZQUFZLEVBQXJCLEFBQXVCLEFBQ3hCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicmVnZW5lcmF0b3ItcnVudGltZVwiKTtcbiIsIi8qKlxuICogR2xvYmFsIE5hbWVzXG4gKi9cblxudmFyIGdsb2JhbHMgPSAvXFxiKEFycmF5fERhdGV8T2JqZWN0fE1hdGh8SlNPTilcXGIvZztcblxuLyoqXG4gKiBSZXR1cm4gaW1tZWRpYXRlIGlkZW50aWZpZXJzIHBhcnNlZCBmcm9tIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSBtYXAgZnVuY3Rpb24gb3IgcHJlZml4XG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdHIsIGZuKXtcbiAgdmFyIHAgPSB1bmlxdWUocHJvcHMoc3RyKSk7XG4gIGlmIChmbiAmJiAnc3RyaW5nJyA9PSB0eXBlb2YgZm4pIGZuID0gcHJlZml4ZWQoZm4pO1xuICBpZiAoZm4pIHJldHVybiBtYXAoc3RyLCBwLCBmbik7XG4gIHJldHVybiBwO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gaW1tZWRpYXRlIGlkZW50aWZpZXJzIGluIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcHJvcHMoc3RyKSB7XG4gIHJldHVybiBzdHJcbiAgICAucmVwbGFjZSgvXFwuXFx3K3xcXHcrICpcXCh8XCJbXlwiXSpcInwnW14nXSonfFxcLyhbXi9dKylcXC8vZywgJycpXG4gICAgLnJlcGxhY2UoZ2xvYmFscywgJycpXG4gICAgLm1hdGNoKC9bYS16QS1aX11cXHcqL2cpXG4gICAgfHwgW107XG59XG5cbi8qKlxuICogUmV0dXJuIGBzdHJgIHdpdGggYHByb3BzYCBtYXBwZWQgd2l0aCBgZm5gLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7QXJyYXl9IHByb3BzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbWFwKHN0ciwgcHJvcHMsIGZuKSB7XG4gIHZhciByZSA9IC9cXC5cXHcrfFxcdysgKlxcKHxcIlteXCJdKlwifCdbXiddKid8XFwvKFteL10rKVxcL3xbYS16QS1aX11cXHcqL2c7XG4gIHJldHVybiBzdHIucmVwbGFjZShyZSwgZnVuY3Rpb24oXyl7XG4gICAgaWYgKCcoJyA9PSBfW18ubGVuZ3RoIC0gMV0pIHJldHVybiBmbihfKTtcbiAgICBpZiAoIX5wcm9wcy5pbmRleE9mKF8pKSByZXR1cm4gXztcbiAgICByZXR1cm4gZm4oXyk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFJldHVybiB1bmlxdWUgYXJyYXkuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHVuaXF1ZShhcnIpIHtcbiAgdmFyIHJldCA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKH5yZXQuaW5kZXhPZihhcnJbaV0pKSBjb250aW51ZTtcbiAgICByZXQucHVzaChhcnJbaV0pO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn1cblxuLyoqXG4gKiBNYXAgd2l0aCBwcmVmaXggYHN0cmAuXG4gKi9cblxuZnVuY3Rpb24gcHJlZml4ZWQoc3RyKSB7XG4gIHJldHVybiBmdW5jdGlvbihfKXtcbiAgICByZXR1cm4gc3RyICsgXztcbiAgfTtcbn1cbiIsIlxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciB0b0Z1bmN0aW9uID0gcmVxdWlyZSgndG8tZnVuY3Rpb24nKTtcblxuLyoqXG4gKiBHcm91cCBgYXJyYCB3aXRoIGNhbGxiYWNrIGBmbih2YWwsIGkpYC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJcbiAqIEBwYXJhbSB7RnVuY3Rpb258U3RyaW5nfSBmbiBvciBwcm9wXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcnIsIGZuKXtcbiAgdmFyIHJldCA9IHt9O1xuICB2YXIgcHJvcDtcbiAgZm4gPSB0b0Z1bmN0aW9uKGZuKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7ICsraSkge1xuICAgIHByb3AgPSBmbihhcnJbaV0sIGkpO1xuICAgIHJldFtwcm9wXSA9IHJldFtwcm9wXSB8fCBbXTtcbiAgICByZXRbcHJvcF0ucHVzaChhcnJbaV0pO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn07IiwiLyohXG4gICAgbG9jYWxGb3JhZ2UgLS0gT2ZmbGluZSBTdG9yYWdlLCBJbXByb3ZlZFxuICAgIFZlcnNpb24gMS43LjFcbiAgICBodHRwczovL2xvY2FsZm9yYWdlLmdpdGh1Yi5pby9sb2NhbEZvcmFnZVxuICAgIChjKSAyMDEzLTIwMTcgTW96aWxsYSwgQXBhY2hlIExpY2Vuc2UgMi4wXG4qL1xuKGZ1bmN0aW9uKGYpe2lmKHR5cGVvZiBleHBvcnRzPT09XCJvYmplY3RcIiYmdHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCIpe21vZHVsZS5leHBvcnRzPWYoKX1lbHNlIGlmKHR5cGVvZiBkZWZpbmU9PT1cImZ1bmN0aW9uXCImJmRlZmluZS5hbWQpe2RlZmluZShbXSxmKX1lbHNle3ZhciBnO2lmKHR5cGVvZiB3aW5kb3chPT1cInVuZGVmaW5lZFwiKXtnPXdpbmRvd31lbHNlIGlmKHR5cGVvZiBnbG9iYWwhPT1cInVuZGVmaW5lZFwiKXtnPWdsb2JhbH1lbHNlIGlmKHR5cGVvZiBzZWxmIT09XCJ1bmRlZmluZWRcIil7Zz1zZWxmfWVsc2V7Zz10aGlzfWcubG9jYWxmb3JhZ2UgPSBmKCl9fSkoZnVuY3Rpb24oKXt2YXIgZGVmaW5lLG1vZHVsZSxleHBvcnRzO3JldHVybiAoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgKGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIiwgZil9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSh7MTpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG4oZnVuY3Rpb24gKGdsb2JhbCl7XG4ndXNlIHN0cmljdCc7XG52YXIgTXV0YXRpb24gPSBnbG9iYWwuTXV0YXRpb25PYnNlcnZlciB8fCBnbG9iYWwuV2ViS2l0TXV0YXRpb25PYnNlcnZlcjtcblxudmFyIHNjaGVkdWxlRHJhaW47XG5cbntcbiAgaWYgKE11dGF0aW9uKSB7XG4gICAgdmFyIGNhbGxlZCA9IDA7XG4gICAgdmFyIG9ic2VydmVyID0gbmV3IE11dGF0aW9uKG5leHRUaWNrKTtcbiAgICB2YXIgZWxlbWVudCA9IGdsb2JhbC5kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG4gICAgb2JzZXJ2ZXIub2JzZXJ2ZShlbGVtZW50LCB7XG4gICAgICBjaGFyYWN0ZXJEYXRhOiB0cnVlXG4gICAgfSk7XG4gICAgc2NoZWR1bGVEcmFpbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGVsZW1lbnQuZGF0YSA9IChjYWxsZWQgPSArK2NhbGxlZCAlIDIpO1xuICAgIH07XG4gIH0gZWxzZSBpZiAoIWdsb2JhbC5zZXRJbW1lZGlhdGUgJiYgdHlwZW9mIGdsb2JhbC5NZXNzYWdlQ2hhbm5lbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB2YXIgY2hhbm5lbCA9IG5ldyBnbG9iYWwuTWVzc2FnZUNoYW5uZWwoKTtcbiAgICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IG5leHRUaWNrO1xuICAgIHNjaGVkdWxlRHJhaW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICBjaGFubmVsLnBvcnQyLnBvc3RNZXNzYWdlKDApO1xuICAgIH07XG4gIH0gZWxzZSBpZiAoJ2RvY3VtZW50JyBpbiBnbG9iYWwgJiYgJ29ucmVhZHlzdGF0ZWNoYW5nZScgaW4gZ2xvYmFsLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpKSB7XG4gICAgc2NoZWR1bGVEcmFpbiA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgLy8gQ3JlYXRlIGEgPHNjcmlwdD4gZWxlbWVudDsgaXRzIHJlYWR5c3RhdGVjaGFuZ2UgZXZlbnQgd2lsbCBiZSBmaXJlZCBhc3luY2hyb25vdXNseSBvbmNlIGl0IGlzIGluc2VydGVkXG4gICAgICAvLyBpbnRvIHRoZSBkb2N1bWVudC4gRG8gc28sIHRodXMgcXVldWluZyB1cCB0aGUgdGFzay4gUmVtZW1iZXIgdG8gY2xlYW4gdXAgb25jZSBpdCdzIGJlZW4gY2FsbGVkLlxuICAgICAgdmFyIHNjcmlwdEVsID0gZ2xvYmFsLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgc2NyaXB0RWwub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBuZXh0VGljaygpO1xuXG4gICAgICAgIHNjcmlwdEVsLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgICAgIHNjcmlwdEVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2NyaXB0RWwpO1xuICAgICAgICBzY3JpcHRFbCA9IG51bGw7XG4gICAgICB9O1xuICAgICAgZ2xvYmFsLmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hcHBlbmRDaGlsZChzY3JpcHRFbCk7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBzY2hlZHVsZURyYWluID0gZnVuY3Rpb24gKCkge1xuICAgICAgc2V0VGltZW91dChuZXh0VGljaywgMCk7XG4gICAgfTtcbiAgfVxufVxuXG52YXIgZHJhaW5pbmc7XG52YXIgcXVldWUgPSBbXTtcbi8vbmFtZWQgbmV4dFRpY2sgZm9yIGxlc3MgY29uZnVzaW5nIHN0YWNrIHRyYWNlc1xuZnVuY3Rpb24gbmV4dFRpY2soKSB7XG4gIGRyYWluaW5nID0gdHJ1ZTtcbiAgdmFyIGksIG9sZFF1ZXVlO1xuICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICB3aGlsZSAobGVuKSB7XG4gICAgb2xkUXVldWUgPSBxdWV1ZTtcbiAgICBxdWV1ZSA9IFtdO1xuICAgIGkgPSAtMTtcbiAgICB3aGlsZSAoKytpIDwgbGVuKSB7XG4gICAgICBvbGRRdWV1ZVtpXSgpO1xuICAgIH1cbiAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gIH1cbiAgZHJhaW5pbmcgPSBmYWxzZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbW1lZGlhdGU7XG5mdW5jdGlvbiBpbW1lZGlhdGUodGFzaykge1xuICBpZiAocXVldWUucHVzaCh0YXNrKSA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICBzY2hlZHVsZURyYWluKCk7XG4gIH1cbn1cblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pXG59LHt9XSwyOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcbid1c2Ugc3RyaWN0JztcbnZhciBpbW1lZGlhdGUgPSBfZGVyZXFfKDEpO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuZnVuY3Rpb24gSU5URVJOQUwoKSB7fVxuXG52YXIgaGFuZGxlcnMgPSB7fTtcblxudmFyIFJFSkVDVEVEID0gWydSRUpFQ1RFRCddO1xudmFyIEZVTEZJTExFRCA9IFsnRlVMRklMTEVEJ107XG52YXIgUEVORElORyA9IFsnUEVORElORyddO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFByb21pc2U7XG5cbmZ1bmN0aW9uIFByb21pc2UocmVzb2x2ZXIpIHtcbiAgaWYgKHR5cGVvZiByZXNvbHZlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3Jlc29sdmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICB9XG4gIHRoaXMuc3RhdGUgPSBQRU5ESU5HO1xuICB0aGlzLnF1ZXVlID0gW107XG4gIHRoaXMub3V0Y29tZSA9IHZvaWQgMDtcbiAgaWYgKHJlc29sdmVyICE9PSBJTlRFUk5BTCkge1xuICAgIHNhZmVseVJlc29sdmVUaGVuYWJsZSh0aGlzLCByZXNvbHZlcik7XG4gIH1cbn1cblxuUHJvbWlzZS5wcm90b3R5cGVbXCJjYXRjaFwiXSA9IGZ1bmN0aW9uIChvblJlamVjdGVkKSB7XG4gIHJldHVybiB0aGlzLnRoZW4obnVsbCwgb25SZWplY3RlZCk7XG59O1xuUHJvbWlzZS5wcm90b3R5cGUudGhlbiA9IGZ1bmN0aW9uIChvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCkge1xuICBpZiAodHlwZW9mIG9uRnVsZmlsbGVkICE9PSAnZnVuY3Rpb24nICYmIHRoaXMuc3RhdGUgPT09IEZVTEZJTExFRCB8fFxuICAgIHR5cGVvZiBvblJlamVjdGVkICE9PSAnZnVuY3Rpb24nICYmIHRoaXMuc3RhdGUgPT09IFJFSkVDVEVEKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgdmFyIHByb21pc2UgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcihJTlRFUk5BTCk7XG4gIGlmICh0aGlzLnN0YXRlICE9PSBQRU5ESU5HKSB7XG4gICAgdmFyIHJlc29sdmVyID0gdGhpcy5zdGF0ZSA9PT0gRlVMRklMTEVEID8gb25GdWxmaWxsZWQgOiBvblJlamVjdGVkO1xuICAgIHVud3JhcChwcm9taXNlLCByZXNvbHZlciwgdGhpcy5vdXRjb21lKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLnF1ZXVlLnB1c2gobmV3IFF1ZXVlSXRlbShwcm9taXNlLCBvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCkpO1xuICB9XG5cbiAgcmV0dXJuIHByb21pc2U7XG59O1xuZnVuY3Rpb24gUXVldWVJdGVtKHByb21pc2UsIG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKSB7XG4gIHRoaXMucHJvbWlzZSA9IHByb21pc2U7XG4gIGlmICh0eXBlb2Ygb25GdWxmaWxsZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICB0aGlzLm9uRnVsZmlsbGVkID0gb25GdWxmaWxsZWQ7XG4gICAgdGhpcy5jYWxsRnVsZmlsbGVkID0gdGhpcy5vdGhlckNhbGxGdWxmaWxsZWQ7XG4gIH1cbiAgaWYgKHR5cGVvZiBvblJlamVjdGVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhpcy5vblJlamVjdGVkID0gb25SZWplY3RlZDtcbiAgICB0aGlzLmNhbGxSZWplY3RlZCA9IHRoaXMub3RoZXJDYWxsUmVqZWN0ZWQ7XG4gIH1cbn1cblF1ZXVlSXRlbS5wcm90b3R5cGUuY2FsbEZ1bGZpbGxlZCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBoYW5kbGVycy5yZXNvbHZlKHRoaXMucHJvbWlzZSwgdmFsdWUpO1xufTtcblF1ZXVlSXRlbS5wcm90b3R5cGUub3RoZXJDYWxsRnVsZmlsbGVkID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHVud3JhcCh0aGlzLnByb21pc2UsIHRoaXMub25GdWxmaWxsZWQsIHZhbHVlKTtcbn07XG5RdWV1ZUl0ZW0ucHJvdG90eXBlLmNhbGxSZWplY3RlZCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBoYW5kbGVycy5yZWplY3QodGhpcy5wcm9taXNlLCB2YWx1ZSk7XG59O1xuUXVldWVJdGVtLnByb3RvdHlwZS5vdGhlckNhbGxSZWplY3RlZCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICB1bndyYXAodGhpcy5wcm9taXNlLCB0aGlzLm9uUmVqZWN0ZWQsIHZhbHVlKTtcbn07XG5cbmZ1bmN0aW9uIHVud3JhcChwcm9taXNlLCBmdW5jLCB2YWx1ZSkge1xuICBpbW1lZGlhdGUoZnVuY3Rpb24gKCkge1xuICAgIHZhciByZXR1cm5WYWx1ZTtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuVmFsdWUgPSBmdW5jKHZhbHVlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gaGFuZGxlcnMucmVqZWN0KHByb21pc2UsIGUpO1xuICAgIH1cbiAgICBpZiAocmV0dXJuVmFsdWUgPT09IHByb21pc2UpIHtcbiAgICAgIGhhbmRsZXJzLnJlamVjdChwcm9taXNlLCBuZXcgVHlwZUVycm9yKCdDYW5ub3QgcmVzb2x2ZSBwcm9taXNlIHdpdGggaXRzZWxmJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICBoYW5kbGVycy5yZXNvbHZlKHByb21pc2UsIHJldHVyblZhbHVlKTtcbiAgICB9XG4gIH0pO1xufVxuXG5oYW5kbGVycy5yZXNvbHZlID0gZnVuY3Rpb24gKHNlbGYsIHZhbHVlKSB7XG4gIHZhciByZXN1bHQgPSB0cnlDYXRjaChnZXRUaGVuLCB2YWx1ZSk7XG4gIGlmIChyZXN1bHQuc3RhdHVzID09PSAnZXJyb3InKSB7XG4gICAgcmV0dXJuIGhhbmRsZXJzLnJlamVjdChzZWxmLCByZXN1bHQudmFsdWUpO1xuICB9XG4gIHZhciB0aGVuYWJsZSA9IHJlc3VsdC52YWx1ZTtcblxuICBpZiAodGhlbmFibGUpIHtcbiAgICBzYWZlbHlSZXNvbHZlVGhlbmFibGUoc2VsZiwgdGhlbmFibGUpO1xuICB9IGVsc2Uge1xuICAgIHNlbGYuc3RhdGUgPSBGVUxGSUxMRUQ7XG4gICAgc2VsZi5vdXRjb21lID0gdmFsdWU7XG4gICAgdmFyIGkgPSAtMTtcbiAgICB2YXIgbGVuID0gc2VsZi5xdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUgKCsraSA8IGxlbikge1xuICAgICAgc2VsZi5xdWV1ZVtpXS5jYWxsRnVsZmlsbGVkKHZhbHVlKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHNlbGY7XG59O1xuaGFuZGxlcnMucmVqZWN0ID0gZnVuY3Rpb24gKHNlbGYsIGVycm9yKSB7XG4gIHNlbGYuc3RhdGUgPSBSRUpFQ1RFRDtcbiAgc2VsZi5vdXRjb21lID0gZXJyb3I7XG4gIHZhciBpID0gLTE7XG4gIHZhciBsZW4gPSBzZWxmLnF1ZXVlLmxlbmd0aDtcbiAgd2hpbGUgKCsraSA8IGxlbikge1xuICAgIHNlbGYucXVldWVbaV0uY2FsbFJlamVjdGVkKGVycm9yKTtcbiAgfVxuICByZXR1cm4gc2VsZjtcbn07XG5cbmZ1bmN0aW9uIGdldFRoZW4ob2JqKSB7XG4gIC8vIE1ha2Ugc3VyZSB3ZSBvbmx5IGFjY2VzcyB0aGUgYWNjZXNzb3Igb25jZSBhcyByZXF1aXJlZCBieSB0aGUgc3BlY1xuICB2YXIgdGhlbiA9IG9iaiAmJiBvYmoudGhlbjtcbiAgaWYgKG9iaiAmJiAodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJykgJiYgdHlwZW9mIHRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gYXBweVRoZW4oKSB7XG4gICAgICB0aGVuLmFwcGx5KG9iaiwgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9XG59XG5cbmZ1bmN0aW9uIHNhZmVseVJlc29sdmVUaGVuYWJsZShzZWxmLCB0aGVuYWJsZSkge1xuICAvLyBFaXRoZXIgZnVsZmlsbCwgcmVqZWN0IG9yIHJlamVjdCB3aXRoIGVycm9yXG4gIHZhciBjYWxsZWQgPSBmYWxzZTtcbiAgZnVuY3Rpb24gb25FcnJvcih2YWx1ZSkge1xuICAgIGlmIChjYWxsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY2FsbGVkID0gdHJ1ZTtcbiAgICBoYW5kbGVycy5yZWplY3Qoc2VsZiwgdmFsdWUpO1xuICB9XG5cbiAgZnVuY3Rpb24gb25TdWNjZXNzKHZhbHVlKSB7XG4gICAgaWYgKGNhbGxlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjYWxsZWQgPSB0cnVlO1xuICAgIGhhbmRsZXJzLnJlc29sdmUoc2VsZiwgdmFsdWUpO1xuICB9XG5cbiAgZnVuY3Rpb24gdHJ5VG9VbndyYXAoKSB7XG4gICAgdGhlbmFibGUob25TdWNjZXNzLCBvbkVycm9yKTtcbiAgfVxuXG4gIHZhciByZXN1bHQgPSB0cnlDYXRjaCh0cnlUb1Vud3JhcCk7XG4gIGlmIChyZXN1bHQuc3RhdHVzID09PSAnZXJyb3InKSB7XG4gICAgb25FcnJvcihyZXN1bHQudmFsdWUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHRyeUNhdGNoKGZ1bmMsIHZhbHVlKSB7XG4gIHZhciBvdXQgPSB7fTtcbiAgdHJ5IHtcbiAgICBvdXQudmFsdWUgPSBmdW5jKHZhbHVlKTtcbiAgICBvdXQuc3RhdHVzID0gJ3N1Y2Nlc3MnO1xuICB9IGNhdGNoIChlKSB7XG4gICAgb3V0LnN0YXR1cyA9ICdlcnJvcic7XG4gICAgb3V0LnZhbHVlID0gZTtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG5Qcm9taXNlLnJlc29sdmUgPSByZXNvbHZlO1xuZnVuY3Rpb24gcmVzb2x2ZSh2YWx1ZSkge1xuICBpZiAodmFsdWUgaW5zdGFuY2VvZiB0aGlzKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHJldHVybiBoYW5kbGVycy5yZXNvbHZlKG5ldyB0aGlzKElOVEVSTkFMKSwgdmFsdWUpO1xufVxuXG5Qcm9taXNlLnJlamVjdCA9IHJlamVjdDtcbmZ1bmN0aW9uIHJlamVjdChyZWFzb24pIHtcbiAgdmFyIHByb21pc2UgPSBuZXcgdGhpcyhJTlRFUk5BTCk7XG4gIHJldHVybiBoYW5kbGVycy5yZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbn1cblxuUHJvbWlzZS5hbGwgPSBhbGw7XG5mdW5jdGlvbiBhbGwoaXRlcmFibGUpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGl0ZXJhYmxlKSAhPT0gJ1tvYmplY3QgQXJyYXldJykge1xuICAgIHJldHVybiB0aGlzLnJlamVjdChuZXcgVHlwZUVycm9yKCdtdXN0IGJlIGFuIGFycmF5JykpO1xuICB9XG5cbiAgdmFyIGxlbiA9IGl0ZXJhYmxlLmxlbmd0aDtcbiAgdmFyIGNhbGxlZCA9IGZhbHNlO1xuICBpZiAoIWxlbikge1xuICAgIHJldHVybiB0aGlzLnJlc29sdmUoW10pO1xuICB9XG5cbiAgdmFyIHZhbHVlcyA9IG5ldyBBcnJheShsZW4pO1xuICB2YXIgcmVzb2x2ZWQgPSAwO1xuICB2YXIgaSA9IC0xO1xuICB2YXIgcHJvbWlzZSA9IG5ldyB0aGlzKElOVEVSTkFMKTtcblxuICB3aGlsZSAoKytpIDwgbGVuKSB7XG4gICAgYWxsUmVzb2x2ZXIoaXRlcmFibGVbaV0sIGkpO1xuICB9XG4gIHJldHVybiBwcm9taXNlO1xuICBmdW5jdGlvbiBhbGxSZXNvbHZlcih2YWx1ZSwgaSkge1xuICAgIHNlbGYucmVzb2x2ZSh2YWx1ZSkudGhlbihyZXNvbHZlRnJvbUFsbCwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICBpZiAoIWNhbGxlZCkge1xuICAgICAgICBjYWxsZWQgPSB0cnVlO1xuICAgICAgICBoYW5kbGVycy5yZWplY3QocHJvbWlzZSwgZXJyb3IpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGZ1bmN0aW9uIHJlc29sdmVGcm9tQWxsKG91dFZhbHVlKSB7XG4gICAgICB2YWx1ZXNbaV0gPSBvdXRWYWx1ZTtcbiAgICAgIGlmICgrK3Jlc29sdmVkID09PSBsZW4gJiYgIWNhbGxlZCkge1xuICAgICAgICBjYWxsZWQgPSB0cnVlO1xuICAgICAgICBoYW5kbGVycy5yZXNvbHZlKHByb21pc2UsIHZhbHVlcyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cblByb21pc2UucmFjZSA9IHJhY2U7XG5mdW5jdGlvbiByYWNlKGl0ZXJhYmxlKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChpdGVyYWJsZSkgIT09ICdbb2JqZWN0IEFycmF5XScpIHtcbiAgICByZXR1cm4gdGhpcy5yZWplY3QobmV3IFR5cGVFcnJvcignbXVzdCBiZSBhbiBhcnJheScpKTtcbiAgfVxuXG4gIHZhciBsZW4gPSBpdGVyYWJsZS5sZW5ndGg7XG4gIHZhciBjYWxsZWQgPSBmYWxzZTtcbiAgaWYgKCFsZW4pIHtcbiAgICByZXR1cm4gdGhpcy5yZXNvbHZlKFtdKTtcbiAgfVxuXG4gIHZhciBpID0gLTE7XG4gIHZhciBwcm9taXNlID0gbmV3IHRoaXMoSU5URVJOQUwpO1xuXG4gIHdoaWxlICgrK2kgPCBsZW4pIHtcbiAgICByZXNvbHZlcihpdGVyYWJsZVtpXSk7XG4gIH1cbiAgcmV0dXJuIHByb21pc2U7XG4gIGZ1bmN0aW9uIHJlc29sdmVyKHZhbHVlKSB7XG4gICAgc2VsZi5yZXNvbHZlKHZhbHVlKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgaWYgKCFjYWxsZWQpIHtcbiAgICAgICAgY2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgaGFuZGxlcnMucmVzb2x2ZShwcm9taXNlLCByZXNwb25zZSk7XG4gICAgICB9XG4gICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICBpZiAoIWNhbGxlZCkge1xuICAgICAgICBjYWxsZWQgPSB0cnVlO1xuICAgICAgICBoYW5kbGVycy5yZWplY3QocHJvbWlzZSwgZXJyb3IpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbn0se1wiMVwiOjF9XSwzOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcbihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcbmlmICh0eXBlb2YgZ2xvYmFsLlByb21pc2UgIT09ICdmdW5jdGlvbicpIHtcbiAgZ2xvYmFsLlByb21pc2UgPSBfZGVyZXFfKDIpO1xufVxuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSlcbn0se1wiMlwiOjJ9XSw0OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIF90eXBlb2YgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIiA/IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH0gOiBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9O1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBnZXRJREIoKSB7XG4gICAgLyogZ2xvYmFsIGluZGV4ZWREQix3ZWJraXRJbmRleGVkREIsbW96SW5kZXhlZERCLE9JbmRleGVkREIsbXNJbmRleGVkREIgKi9cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGluZGV4ZWREQiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHJldHVybiBpbmRleGVkREI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiB3ZWJraXRJbmRleGVkREIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gd2Via2l0SW5kZXhlZERCO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgbW96SW5kZXhlZERCICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmV0dXJuIG1vekluZGV4ZWREQjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIE9JbmRleGVkREIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gT0luZGV4ZWREQjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIG1zSW5kZXhlZERCICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmV0dXJuIG1zSW5kZXhlZERCO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxufVxuXG52YXIgaWRiID0gZ2V0SURCKCk7XG5cbmZ1bmN0aW9uIGlzSW5kZXhlZERCVmFsaWQoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBJbmRleGVkREI7IGZhbGwgYmFjayB0byB2ZW5kb3ItcHJlZml4ZWQgdmVyc2lvbnNcbiAgICAgICAgLy8gaWYgbmVlZGVkLlxuICAgICAgICBpZiAoIWlkYikge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIC8vIFdlIG1pbWljIFBvdWNoREIgaGVyZTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gV2UgdGVzdCBmb3Igb3BlbkRhdGFiYXNlIGJlY2F1c2UgSUUgTW9iaWxlIGlkZW50aWZpZXMgaXRzZWxmXG4gICAgICAgIC8vIGFzIFNhZmFyaS4gT2ggdGhlIGx1bHouLi5cbiAgICAgICAgdmFyIGlzU2FmYXJpID0gdHlwZW9mIG9wZW5EYXRhYmFzZSAhPT0gJ3VuZGVmaW5lZCcgJiYgLyhTYWZhcml8aVBob25lfGlQYWR8aVBvZCkvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgJiYgIS9DaHJvbWUvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgJiYgIS9CbGFja0JlcnJ5Ly50ZXN0KG5hdmlnYXRvci5wbGF0Zm9ybSk7XG5cbiAgICAgICAgdmFyIGhhc0ZldGNoID0gdHlwZW9mIGZldGNoID09PSAnZnVuY3Rpb24nICYmIGZldGNoLnRvU3RyaW5nKCkuaW5kZXhPZignW25hdGl2ZSBjb2RlJykgIT09IC0xO1xuXG4gICAgICAgIC8vIFNhZmFyaSA8MTAuMSBkb2VzIG5vdCBtZWV0IG91ciByZXF1aXJlbWVudHMgZm9yIElEQiBzdXBwb3J0ICgjNTU3MilcbiAgICAgICAgLy8gc2luY2UgU2FmYXJpIDEwLjEgc2hpcHBlZCB3aXRoIGZldGNoLCB3ZSBjYW4gdXNlIHRoYXQgdG8gZGV0ZWN0IGl0XG4gICAgICAgIHJldHVybiAoIWlzU2FmYXJpIHx8IGhhc0ZldGNoKSAmJiB0eXBlb2YgaW5kZXhlZERCICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgICAvLyBzb21lIG91dGRhdGVkIGltcGxlbWVudGF0aW9ucyBvZiBJREIgdGhhdCBhcHBlYXIgb24gU2Ftc3VuZ1xuICAgICAgICAvLyBhbmQgSFRDIEFuZHJvaWQgZGV2aWNlcyA8NC40IGFyZSBtaXNzaW5nIElEQktleVJhbmdlXG4gICAgICAgIC8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL21vemlsbGEvbG9jYWxGb3JhZ2UvaXNzdWVzLzEyOFxuICAgICAgICAvLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9tb3ppbGxhL2xvY2FsRm9yYWdlL2lzc3Vlcy8yNzJcbiAgICAgICAgdHlwZW9mIElEQktleVJhbmdlICE9PSAndW5kZWZpbmVkJztcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbi8vIEFic3RyYWN0cyBjb25zdHJ1Y3RpbmcgYSBCbG9iIG9iamVjdCwgc28gaXQgYWxzbyB3b3JrcyBpbiBvbGRlclxuLy8gYnJvd3NlcnMgdGhhdCBkb24ndCBzdXBwb3J0IHRoZSBuYXRpdmUgQmxvYiBjb25zdHJ1Y3Rvci4gKGkuZS5cbi8vIG9sZCBRdFdlYktpdCB2ZXJzaW9ucywgYXQgbGVhc3QpLlxuLy8gQWJzdHJhY3RzIGNvbnN0cnVjdGluZyBhIEJsb2Igb2JqZWN0LCBzbyBpdCBhbHNvIHdvcmtzIGluIG9sZGVyXG4vLyBicm93c2VycyB0aGF0IGRvbid0IHN1cHBvcnQgdGhlIG5hdGl2ZSBCbG9iIGNvbnN0cnVjdG9yLiAoaS5lLlxuLy8gb2xkIFF0V2ViS2l0IHZlcnNpb25zLCBhdCBsZWFzdCkuXG5mdW5jdGlvbiBjcmVhdGVCbG9iKHBhcnRzLCBwcm9wZXJ0aWVzKSB7XG4gICAgLyogZ2xvYmFsIEJsb2JCdWlsZGVyLE1TQmxvYkJ1aWxkZXIsTW96QmxvYkJ1aWxkZXIsV2ViS2l0QmxvYkJ1aWxkZXIgKi9cbiAgICBwYXJ0cyA9IHBhcnRzIHx8IFtdO1xuICAgIHByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzIHx8IHt9O1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBuZXcgQmxvYihwYXJ0cywgcHJvcGVydGllcyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoZS5uYW1lICE9PSAnVHlwZUVycm9yJykge1xuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgQnVpbGRlciA9IHR5cGVvZiBCbG9iQnVpbGRlciAhPT0gJ3VuZGVmaW5lZCcgPyBCbG9iQnVpbGRlciA6IHR5cGVvZiBNU0Jsb2JCdWlsZGVyICE9PSAndW5kZWZpbmVkJyA/IE1TQmxvYkJ1aWxkZXIgOiB0eXBlb2YgTW96QmxvYkJ1aWxkZXIgIT09ICd1bmRlZmluZWQnID8gTW96QmxvYkJ1aWxkZXIgOiBXZWJLaXRCbG9iQnVpbGRlcjtcbiAgICAgICAgdmFyIGJ1aWxkZXIgPSBuZXcgQnVpbGRlcigpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBidWlsZGVyLmFwcGVuZChwYXJ0c1tpXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJ1aWxkZXIuZ2V0QmxvYihwcm9wZXJ0aWVzLnR5cGUpO1xuICAgIH1cbn1cblxuLy8gVGhpcyBpcyBDb21tb25KUyBiZWNhdXNlIGxpZSBpcyBhbiBleHRlcm5hbCBkZXBlbmRlbmN5LCBzbyBSb2xsdXBcbi8vIGNhbiBqdXN0IGlnbm9yZSBpdC5cbmlmICh0eXBlb2YgUHJvbWlzZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBJbiB0aGUgXCJub3Byb21pc2VzXCIgYnVpbGQgdGhpcyB3aWxsIGp1c3QgdGhyb3cgaWYgeW91IGRvbid0IGhhdmVcbiAgICAvLyBhIGdsb2JhbCBwcm9taXNlIG9iamVjdCwgYnV0IGl0IHdvdWxkIHRocm93IGFueXdheSBsYXRlci5cbiAgICBfZGVyZXFfKDMpO1xufVxudmFyIFByb21pc2UkMSA9IFByb21pc2U7XG5cbmZ1bmN0aW9uIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjaykge1xuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICBwcm9taXNlLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnJvcik7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZXhlY3V0ZVR3b0NhbGxiYWNrcyhwcm9taXNlLCBjYWxsYmFjaywgZXJyb3JDYWxsYmFjaykge1xuICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcHJvbWlzZS50aGVuKGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGVycm9yQ2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcHJvbWlzZVtcImNhdGNoXCJdKGVycm9yQ2FsbGJhY2spO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplS2V5KGtleSkge1xuICAgIC8vIENhc3QgdGhlIGtleSB0byBhIHN0cmluZywgYXMgdGhhdCdzIGFsbCB3ZSBjYW4gc2V0IGFzIGEga2V5LlxuICAgIGlmICh0eXBlb2Yga2V5ICE9PSAnc3RyaW5nJykge1xuICAgICAgICBjb25zb2xlLndhcm4oa2V5ICsgJyB1c2VkIGFzIGEga2V5LCBidXQgaXQgaXMgbm90IGEgc3RyaW5nLicpO1xuICAgICAgICBrZXkgPSBTdHJpbmcoa2V5KTtcbiAgICB9XG5cbiAgICByZXR1cm4ga2V5O1xufVxuXG5mdW5jdGlvbiBnZXRDYWxsYmFjaygpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCAmJiB0eXBlb2YgYXJndW1lbnRzW2FyZ3VtZW50cy5sZW5ndGggLSAxXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gYXJndW1lbnRzW2FyZ3VtZW50cy5sZW5ndGggLSAxXTtcbiAgICB9XG59XG5cbi8vIFNvbWUgY29kZSBvcmlnaW5hbGx5IGZyb20gYXN5bmNfc3RvcmFnZS5qcyBpblxuLy8gW0dhaWFdKGh0dHBzOi8vZ2l0aHViLmNvbS9tb3ppbGxhLWIyZy9nYWlhKS5cblxudmFyIERFVEVDVF9CTE9CX1NVUFBPUlRfU1RPUkUgPSAnbG9jYWwtZm9yYWdlLWRldGVjdC1ibG9iLXN1cHBvcnQnO1xudmFyIHN1cHBvcnRzQmxvYnMgPSB2b2lkIDA7XG52YXIgZGJDb250ZXh0cyA9IHt9O1xudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLy8gVHJhbnNhY3Rpb24gTW9kZXNcbnZhciBSRUFEX09OTFkgPSAncmVhZG9ubHknO1xudmFyIFJFQURfV1JJVEUgPSAncmVhZHdyaXRlJztcblxuLy8gVHJhbnNmb3JtIGEgYmluYXJ5IHN0cmluZyB0byBhbiBhcnJheSBidWZmZXIsIGJlY2F1c2Ugb3RoZXJ3aXNlXG4vLyB3ZWlyZCBzdHVmZiBoYXBwZW5zIHdoZW4geW91IHRyeSB0byB3b3JrIHdpdGggdGhlIGJpbmFyeSBzdHJpbmcgZGlyZWN0bHkuXG4vLyBJdCBpcyBrbm93bi5cbi8vIEZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNDk2NzY0Ny8gKGNvbnRpbnVlcyBvbiBuZXh0IGxpbmUpXG4vLyBlbmNvZGUtZGVjb2RlLWltYWdlLXdpdGgtYmFzZTY0LWJyZWFrcy1pbWFnZSAoMjAxMy0wNC0yMSlcbmZ1bmN0aW9uIF9iaW5TdHJpbmdUb0FycmF5QnVmZmVyKGJpbikge1xuICAgIHZhciBsZW5ndGggPSBiaW4ubGVuZ3RoO1xuICAgIHZhciBidWYgPSBuZXcgQXJyYXlCdWZmZXIobGVuZ3RoKTtcbiAgICB2YXIgYXJyID0gbmV3IFVpbnQ4QXJyYXkoYnVmKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGFycltpXSA9IGJpbi5jaGFyQ29kZUF0KGkpO1xuICAgIH1cbiAgICByZXR1cm4gYnVmO1xufVxuXG4vL1xuLy8gQmxvYnMgYXJlIG5vdCBzdXBwb3J0ZWQgaW4gYWxsIHZlcnNpb25zIG9mIEluZGV4ZWREQiwgbm90YWJseVxuLy8gQ2hyb21lIDwzNyBhbmQgQW5kcm9pZCA8NS4gSW4gdGhvc2UgdmVyc2lvbnMsIHN0b3JpbmcgYSBibG9iIHdpbGwgdGhyb3cuXG4vL1xuLy8gVmFyaW91cyBvdGhlciBibG9iIGJ1Z3MgZXhpc3QgaW4gQ2hyb21lIHYzNy00MiAoaW5jbHVzaXZlKS5cbi8vIERldGVjdGluZyB0aGVtIGlzIGV4cGVuc2l2ZSBhbmQgY29uZnVzaW5nIHRvIHVzZXJzLCBhbmQgQ2hyb21lIDM3LTQyXG4vLyBpcyBhdCB2ZXJ5IGxvdyB1c2FnZSB3b3JsZHdpZGUsIHNvIHdlIGRvIGEgaGFja3kgdXNlckFnZW50IGNoZWNrIGluc3RlYWQuXG4vL1xuLy8gY29udGVudC10eXBlIGJ1ZzogaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTQwODEyMFxuLy8gNDA0IGJ1ZzogaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTQ0NzkxNlxuLy8gRmlsZVJlYWRlciBidWc6IGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD00NDc4MzZcbi8vXG4vLyBDb2RlIGJvcnJvd2VkIGZyb20gUG91Y2hEQi4gU2VlOlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3BvdWNoZGIvcG91Y2hkYi9ibG9iL21hc3Rlci9wYWNrYWdlcy9ub2RlX21vZHVsZXMvcG91Y2hkYi1hZGFwdGVyLWlkYi9zcmMvYmxvYlN1cHBvcnQuanNcbi8vXG5mdW5jdGlvbiBfY2hlY2tCbG9iU3VwcG9ydFdpdGhvdXRDYWNoaW5nKGlkYikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSQxKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgICAgIHZhciB0eG4gPSBpZGIudHJhbnNhY3Rpb24oREVURUNUX0JMT0JfU1VQUE9SVF9TVE9SRSwgUkVBRF9XUklURSk7XG4gICAgICAgIHZhciBibG9iID0gY3JlYXRlQmxvYihbJyddKTtcbiAgICAgICAgdHhuLm9iamVjdFN0b3JlKERFVEVDVF9CTE9CX1NVUFBPUlRfU1RPUkUpLnB1dChibG9iLCAna2V5Jyk7XG5cbiAgICAgICAgdHhuLm9uYWJvcnQgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgLy8gSWYgdGhlIHRyYW5zYWN0aW9uIGFib3J0cyBub3cgaXRzIGR1ZSB0byBub3QgYmVpbmcgYWJsZSB0b1xuICAgICAgICAgICAgLy8gd3JpdGUgdG8gdGhlIGRhdGFiYXNlLCBsaWtlbHkgZHVlIHRvIHRoZSBkaXNrIGJlaW5nIGZ1bGxcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0eG4ub25jb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBtYXRjaGVkQ2hyb21lID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvQ2hyb21lXFwvKFxcZCspLyk7XG4gICAgICAgICAgICB2YXIgbWF0Y2hlZEVkZ2UgPSBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9FZGdlXFwvLyk7XG4gICAgICAgICAgICAvLyBNUyBFZGdlIHByZXRlbmRzIHRvIGJlIENocm9tZSA0MjpcbiAgICAgICAgICAgIC8vIGh0dHBzOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvaGg4NjkzMDElMjh2PXZzLjg1JTI5LmFzcHhcbiAgICAgICAgICAgIHJlc29sdmUobWF0Y2hlZEVkZ2UgfHwgIW1hdGNoZWRDaHJvbWUgfHwgcGFyc2VJbnQobWF0Y2hlZENocm9tZVsxXSwgMTApID49IDQzKTtcbiAgICAgICAgfTtcbiAgICB9KVtcImNhdGNoXCJdKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyBlcnJvciwgc28gYXNzdW1lIHVuc3VwcG9ydGVkXG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIF9jaGVja0Jsb2JTdXBwb3J0KGlkYikge1xuICAgIGlmICh0eXBlb2Ygc3VwcG9ydHNCbG9icyA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlJDEucmVzb2x2ZShzdXBwb3J0c0Jsb2JzKTtcbiAgICB9XG4gICAgcmV0dXJuIF9jaGVja0Jsb2JTdXBwb3J0V2l0aG91dENhY2hpbmcoaWRiKS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBzdXBwb3J0c0Jsb2JzID0gdmFsdWU7XG4gICAgICAgIHJldHVybiBzdXBwb3J0c0Jsb2JzO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBfZGVmZXJSZWFkaW5lc3MoZGJJbmZvKSB7XG4gICAgdmFyIGRiQ29udGV4dCA9IGRiQ29udGV4dHNbZGJJbmZvLm5hbWVdO1xuXG4gICAgLy8gQ3JlYXRlIGEgZGVmZXJyZWQgb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgY3VycmVudCBkYXRhYmFzZSBvcGVyYXRpb24uXG4gICAgdmFyIGRlZmVycmVkT3BlcmF0aW9uID0ge307XG5cbiAgICBkZWZlcnJlZE9wZXJhdGlvbi5wcm9taXNlID0gbmV3IFByb21pc2UkMShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGRlZmVycmVkT3BlcmF0aW9uLnJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgICBkZWZlcnJlZE9wZXJhdGlvbi5yZWplY3QgPSByZWplY3Q7XG4gICAgfSk7XG5cbiAgICAvLyBFbnF1ZXVlIHRoZSBkZWZlcnJlZCBvcGVyYXRpb24uXG4gICAgZGJDb250ZXh0LmRlZmVycmVkT3BlcmF0aW9ucy5wdXNoKGRlZmVycmVkT3BlcmF0aW9uKTtcblxuICAgIC8vIENoYWluIGl0cyBwcm9taXNlIHRvIHRoZSBkYXRhYmFzZSByZWFkaW5lc3MuXG4gICAgaWYgKCFkYkNvbnRleHQuZGJSZWFkeSkge1xuICAgICAgICBkYkNvbnRleHQuZGJSZWFkeSA9IGRlZmVycmVkT3BlcmF0aW9uLnByb21pc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZGJDb250ZXh0LmRiUmVhZHkgPSBkYkNvbnRleHQuZGJSZWFkeS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZE9wZXJhdGlvbi5wcm9taXNlO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIF9hZHZhbmNlUmVhZGluZXNzKGRiSW5mbykge1xuICAgIHZhciBkYkNvbnRleHQgPSBkYkNvbnRleHRzW2RiSW5mby5uYW1lXTtcblxuICAgIC8vIERlcXVldWUgYSBkZWZlcnJlZCBvcGVyYXRpb24uXG4gICAgdmFyIGRlZmVycmVkT3BlcmF0aW9uID0gZGJDb250ZXh0LmRlZmVycmVkT3BlcmF0aW9ucy5wb3AoKTtcblxuICAgIC8vIFJlc29sdmUgaXRzIHByb21pc2UgKHdoaWNoIGlzIHBhcnQgb2YgdGhlIGRhdGFiYXNlIHJlYWRpbmVzc1xuICAgIC8vIGNoYWluIG9mIHByb21pc2VzKS5cbiAgICBpZiAoZGVmZXJyZWRPcGVyYXRpb24pIHtcbiAgICAgICAgZGVmZXJyZWRPcGVyYXRpb24ucmVzb2x2ZSgpO1xuICAgICAgICByZXR1cm4gZGVmZXJyZWRPcGVyYXRpb24ucHJvbWlzZTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIF9yZWplY3RSZWFkaW5lc3MoZGJJbmZvLCBlcnIpIHtcbiAgICB2YXIgZGJDb250ZXh0ID0gZGJDb250ZXh0c1tkYkluZm8ubmFtZV07XG5cbiAgICAvLyBEZXF1ZXVlIGEgZGVmZXJyZWQgb3BlcmF0aW9uLlxuICAgIHZhciBkZWZlcnJlZE9wZXJhdGlvbiA9IGRiQ29udGV4dC5kZWZlcnJlZE9wZXJhdGlvbnMucG9wKCk7XG5cbiAgICAvLyBSZWplY3QgaXRzIHByb21pc2UgKHdoaWNoIGlzIHBhcnQgb2YgdGhlIGRhdGFiYXNlIHJlYWRpbmVzc1xuICAgIC8vIGNoYWluIG9mIHByb21pc2VzKS5cbiAgICBpZiAoZGVmZXJyZWRPcGVyYXRpb24pIHtcbiAgICAgICAgZGVmZXJyZWRPcGVyYXRpb24ucmVqZWN0KGVycik7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZE9wZXJhdGlvbi5wcm9taXNlO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gX2dldENvbm5lY3Rpb24oZGJJbmZvLCB1cGdyYWRlTmVlZGVkKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBkYkNvbnRleHRzW2RiSW5mby5uYW1lXSA9IGRiQ29udGV4dHNbZGJJbmZvLm5hbWVdIHx8IGNyZWF0ZURiQ29udGV4dCgpO1xuXG4gICAgICAgIGlmIChkYkluZm8uZGIpIHtcbiAgICAgICAgICAgIGlmICh1cGdyYWRlTmVlZGVkKSB7XG4gICAgICAgICAgICAgICAgX2RlZmVyUmVhZGluZXNzKGRiSW5mbyk7XG4gICAgICAgICAgICAgICAgZGJJbmZvLmRiLmNsb3NlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKGRiSW5mby5kYik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZGJBcmdzID0gW2RiSW5mby5uYW1lXTtcblxuICAgICAgICBpZiAodXBncmFkZU5lZWRlZCkge1xuICAgICAgICAgICAgZGJBcmdzLnB1c2goZGJJbmZvLnZlcnNpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG9wZW5yZXEgPSBpZGIub3Blbi5hcHBseShpZGIsIGRiQXJncyk7XG5cbiAgICAgICAgaWYgKHVwZ3JhZGVOZWVkZWQpIHtcbiAgICAgICAgICAgIG9wZW5yZXEub251cGdyYWRlbmVlZGVkID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGIgPSBvcGVucmVxLnJlc3VsdDtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBkYi5jcmVhdGVPYmplY3RTdG9yZShkYkluZm8uc3RvcmVOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUub2xkVmVyc2lvbiA8PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBBZGRlZCB3aGVuIHN1cHBvcnQgZm9yIGJsb2Igc2hpbXMgd2FzIGFkZGVkXG4gICAgICAgICAgICAgICAgICAgICAgICBkYi5jcmVhdGVPYmplY3RTdG9yZShERVRFQ1RfQkxPQl9TVVBQT1JUX1NUT1JFKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChleC5uYW1lID09PSAnQ29uc3RyYWludEVycm9yJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdUaGUgZGF0YWJhc2UgXCInICsgZGJJbmZvLm5hbWUgKyAnXCInICsgJyBoYXMgYmVlbiB1cGdyYWRlZCBmcm9tIHZlcnNpb24gJyArIGUub2xkVmVyc2lvbiArICcgdG8gdmVyc2lvbiAnICsgZS5uZXdWZXJzaW9uICsgJywgYnV0IHRoZSBzdG9yYWdlIFwiJyArIGRiSW5mby5zdG9yZU5hbWUgKyAnXCIgYWxyZWFkeSBleGlzdHMuJyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBleDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBvcGVucmVxLm9uZXJyb3IgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgcmVqZWN0KG9wZW5yZXEuZXJyb3IpO1xuICAgICAgICB9O1xuXG4gICAgICAgIG9wZW5yZXEub25zdWNjZXNzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmVzb2x2ZShvcGVucmVxLnJlc3VsdCk7XG4gICAgICAgICAgICBfYWR2YW5jZVJlYWRpbmVzcyhkYkluZm8pO1xuICAgICAgICB9O1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBfZ2V0T3JpZ2luYWxDb25uZWN0aW9uKGRiSW5mbykge1xuICAgIHJldHVybiBfZ2V0Q29ubmVjdGlvbihkYkluZm8sIGZhbHNlKTtcbn1cblxuZnVuY3Rpb24gX2dldFVwZ3JhZGVkQ29ubmVjdGlvbihkYkluZm8pIHtcbiAgICByZXR1cm4gX2dldENvbm5lY3Rpb24oZGJJbmZvLCB0cnVlKTtcbn1cblxuZnVuY3Rpb24gX2lzVXBncmFkZU5lZWRlZChkYkluZm8sIGRlZmF1bHRWZXJzaW9uKSB7XG4gICAgaWYgKCFkYkluZm8uZGIpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgdmFyIGlzTmV3U3RvcmUgPSAhZGJJbmZvLmRiLm9iamVjdFN0b3JlTmFtZXMuY29udGFpbnMoZGJJbmZvLnN0b3JlTmFtZSk7XG4gICAgdmFyIGlzRG93bmdyYWRlID0gZGJJbmZvLnZlcnNpb24gPCBkYkluZm8uZGIudmVyc2lvbjtcbiAgICB2YXIgaXNVcGdyYWRlID0gZGJJbmZvLnZlcnNpb24gPiBkYkluZm8uZGIudmVyc2lvbjtcblxuICAgIGlmIChpc0Rvd25ncmFkZSkge1xuICAgICAgICAvLyBJZiB0aGUgdmVyc2lvbiBpcyBub3QgdGhlIGRlZmF1bHQgb25lXG4gICAgICAgIC8vIHRoZW4gd2FybiBmb3IgaW1wb3NzaWJsZSBkb3duZ3JhZGUuXG4gICAgICAgIGlmIChkYkluZm8udmVyc2lvbiAhPT0gZGVmYXVsdFZlcnNpb24pIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignVGhlIGRhdGFiYXNlIFwiJyArIGRiSW5mby5uYW1lICsgJ1wiJyArIFwiIGNhbid0IGJlIGRvd25ncmFkZWQgZnJvbSB2ZXJzaW9uIFwiICsgZGJJbmZvLmRiLnZlcnNpb24gKyAnIHRvIHZlcnNpb24gJyArIGRiSW5mby52ZXJzaW9uICsgJy4nKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBBbGlnbiB0aGUgdmVyc2lvbnMgdG8gcHJldmVudCBlcnJvcnMuXG4gICAgICAgIGRiSW5mby52ZXJzaW9uID0gZGJJbmZvLmRiLnZlcnNpb247XG4gICAgfVxuXG4gICAgaWYgKGlzVXBncmFkZSB8fCBpc05ld1N0b3JlKSB7XG4gICAgICAgIC8vIElmIHRoZSBzdG9yZSBpcyBuZXcgdGhlbiBpbmNyZW1lbnQgdGhlIHZlcnNpb24gKGlmIG5lZWRlZCkuXG4gICAgICAgIC8vIFRoaXMgd2lsbCB0cmlnZ2VyIGFuIFwidXBncmFkZW5lZWRlZFwiIGV2ZW50IHdoaWNoIGlzIHJlcXVpcmVkXG4gICAgICAgIC8vIGZvciBjcmVhdGluZyBhIHN0b3JlLlxuICAgICAgICBpZiAoaXNOZXdTdG9yZSkge1xuICAgICAgICAgICAgdmFyIGluY1ZlcnNpb24gPSBkYkluZm8uZGIudmVyc2lvbiArIDE7XG4gICAgICAgICAgICBpZiAoaW5jVmVyc2lvbiA+IGRiSW5mby52ZXJzaW9uKSB7XG4gICAgICAgICAgICAgICAgZGJJbmZvLnZlcnNpb24gPSBpbmNWZXJzaW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG4vLyBlbmNvZGUgYSBibG9iIGZvciBpbmRleGVkZGIgZW5naW5lcyB0aGF0IGRvbid0IHN1cHBvcnQgYmxvYnNcbmZ1bmN0aW9uIF9lbmNvZGVCbG9iKGJsb2IpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UkMShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgICByZWFkZXIub25lcnJvciA9IHJlamVjdDtcbiAgICAgICAgcmVhZGVyLm9ubG9hZGVuZCA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgYmFzZTY0ID0gYnRvYShlLnRhcmdldC5yZXN1bHQgfHwgJycpO1xuICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgX19sb2NhbF9mb3JhZ2VfZW5jb2RlZF9ibG9iOiB0cnVlLFxuICAgICAgICAgICAgICAgIGRhdGE6IGJhc2U2NCxcbiAgICAgICAgICAgICAgICB0eXBlOiBibG9iLnR5cGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICByZWFkZXIucmVhZEFzQmluYXJ5U3RyaW5nKGJsb2IpO1xuICAgIH0pO1xufVxuXG4vLyBkZWNvZGUgYW4gZW5jb2RlZCBibG9iXG5mdW5jdGlvbiBfZGVjb2RlQmxvYihlbmNvZGVkQmxvYikge1xuICAgIHZhciBhcnJheUJ1ZmYgPSBfYmluU3RyaW5nVG9BcnJheUJ1ZmZlcihhdG9iKGVuY29kZWRCbG9iLmRhdGEpKTtcbiAgICByZXR1cm4gY3JlYXRlQmxvYihbYXJyYXlCdWZmXSwgeyB0eXBlOiBlbmNvZGVkQmxvYi50eXBlIH0pO1xufVxuXG4vLyBpcyB0aGlzIG9uZSBvZiBvdXIgZmFuY3kgZW5jb2RlZCBibG9icz9cbmZ1bmN0aW9uIF9pc0VuY29kZWRCbG9iKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlICYmIHZhbHVlLl9fbG9jYWxfZm9yYWdlX2VuY29kZWRfYmxvYjtcbn1cblxuLy8gU3BlY2lhbGl6ZSB0aGUgZGVmYXVsdCBgcmVhZHkoKWAgZnVuY3Rpb24gYnkgbWFraW5nIGl0IGRlcGVuZGVudFxuLy8gb24gdGhlIGN1cnJlbnQgZGF0YWJhc2Ugb3BlcmF0aW9ucy4gVGh1cywgdGhlIGRyaXZlciB3aWxsIGJlIGFjdHVhbGx5XG4vLyByZWFkeSB3aGVuIGl0J3MgYmVlbiBpbml0aWFsaXplZCAoZGVmYXVsdCkgKmFuZCogdGhlcmUgYXJlIG5vIHBlbmRpbmdcbi8vIG9wZXJhdGlvbnMgb24gdGhlIGRhdGFiYXNlIChpbml0aWF0ZWQgYnkgc29tZSBvdGhlciBpbnN0YW5jZXMpLlxuZnVuY3Rpb24gX2Z1bGx5UmVhZHkoY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgcHJvbWlzZSA9IHNlbGYuX2luaXRSZWFkeSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZGJDb250ZXh0ID0gZGJDb250ZXh0c1tzZWxmLl9kYkluZm8ubmFtZV07XG5cbiAgICAgICAgaWYgKGRiQ29udGV4dCAmJiBkYkNvbnRleHQuZGJSZWFkeSkge1xuICAgICAgICAgICAgcmV0dXJuIGRiQ29udGV4dC5kYlJlYWR5O1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBleGVjdXRlVHdvQ2FsbGJhY2tzKHByb21pc2UsIGNhbGxiYWNrLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cbi8vIFRyeSB0byBlc3RhYmxpc2ggYSBuZXcgZGIgY29ubmVjdGlvbiB0byByZXBsYWNlIHRoZVxuLy8gY3VycmVudCBvbmUgd2hpY2ggaXMgYnJva2VuIChpLmUuIGV4cGVyaWVuY2luZ1xuLy8gSW52YWxpZFN0YXRlRXJyb3Igd2hpbGUgY3JlYXRpbmcgYSB0cmFuc2FjdGlvbikuXG5mdW5jdGlvbiBfdHJ5UmVjb25uZWN0KGRiSW5mbykge1xuICAgIF9kZWZlclJlYWRpbmVzcyhkYkluZm8pO1xuXG4gICAgdmFyIGRiQ29udGV4dCA9IGRiQ29udGV4dHNbZGJJbmZvLm5hbWVdO1xuICAgIHZhciBmb3JhZ2VzID0gZGJDb250ZXh0LmZvcmFnZXM7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZvcmFnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGZvcmFnZSA9IGZvcmFnZXNbaV07XG4gICAgICAgIGlmIChmb3JhZ2UuX2RiSW5mby5kYikge1xuICAgICAgICAgICAgZm9yYWdlLl9kYkluZm8uZGIuY2xvc2UoKTtcbiAgICAgICAgICAgIGZvcmFnZS5fZGJJbmZvLmRiID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBkYkluZm8uZGIgPSBudWxsO1xuXG4gICAgcmV0dXJuIF9nZXRPcmlnaW5hbENvbm5lY3Rpb24oZGJJbmZvKS50aGVuKGZ1bmN0aW9uIChkYikge1xuICAgICAgICBkYkluZm8uZGIgPSBkYjtcbiAgICAgICAgaWYgKF9pc1VwZ3JhZGVOZWVkZWQoZGJJbmZvKSkge1xuICAgICAgICAgICAgLy8gUmVvcGVuIHRoZSBkYXRhYmFzZSBmb3IgdXBncmFkaW5nLlxuICAgICAgICAgICAgcmV0dXJuIF9nZXRVcGdyYWRlZENvbm5lY3Rpb24oZGJJbmZvKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGI7XG4gICAgfSkudGhlbihmdW5jdGlvbiAoZGIpIHtcbiAgICAgICAgLy8gc3RvcmUgdGhlIGxhdGVzdCBkYiByZWZlcmVuY2VcbiAgICAgICAgLy8gaW4gY2FzZSB0aGUgZGIgd2FzIHVwZ3JhZGVkXG4gICAgICAgIGRiSW5mby5kYiA9IGRiQ29udGV4dC5kYiA9IGRiO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZvcmFnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGZvcmFnZXNbaV0uX2RiSW5mby5kYiA9IGRiO1xuICAgICAgICB9XG4gICAgfSlbXCJjYXRjaFwiXShmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgIF9yZWplY3RSZWFkaW5lc3MoZGJJbmZvLCBlcnIpO1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgfSk7XG59XG5cbi8vIEZGIGRvZXNuJ3QgbGlrZSBQcm9taXNlcyAobWljcm8tdGFza3MpIGFuZCBJRERCIHN0b3JlIG9wZXJhdGlvbnMsXG4vLyBzbyB3ZSBoYXZlIHRvIGRvIGl0IHdpdGggY2FsbGJhY2tzXG5mdW5jdGlvbiBjcmVhdGVUcmFuc2FjdGlvbihkYkluZm8sIG1vZGUsIGNhbGxiYWNrLCByZXRyaWVzKSB7XG4gICAgaWYgKHJldHJpZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXRyaWVzID0gMTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICB2YXIgdHggPSBkYkluZm8uZGIudHJhbnNhY3Rpb24oZGJJbmZvLnN0b3JlTmFtZSwgbW9kZSk7XG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHR4KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgaWYgKHJldHJpZXMgPiAwICYmICghZGJJbmZvLmRiIHx8IGVyci5uYW1lID09PSAnSW52YWxpZFN0YXRlRXJyb3InIHx8IGVyci5uYW1lID09PSAnTm90Rm91bmRFcnJvcicpKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZSQxLnJlc29sdmUoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWRiSW5mby5kYiB8fCBlcnIubmFtZSA9PT0gJ05vdEZvdW5kRXJyb3InICYmICFkYkluZm8uZGIub2JqZWN0U3RvcmVOYW1lcy5jb250YWlucyhkYkluZm8uc3RvcmVOYW1lKSAmJiBkYkluZm8udmVyc2lvbiA8PSBkYkluZm8uZGIudmVyc2lvbikge1xuICAgICAgICAgICAgICAgICAgICAvLyBpbmNyZWFzZSB0aGUgZGIgdmVyc2lvbiwgdG8gY3JlYXRlIHRoZSBuZXcgT2JqZWN0U3RvcmVcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRiSW5mby5kYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGJJbmZvLnZlcnNpb24gPSBkYkluZm8uZGIudmVyc2lvbiArIDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gUmVvcGVuIHRoZSBkYXRhYmFzZSBmb3IgdXBncmFkaW5nLlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX2dldFVwZ3JhZGVkQ29ubmVjdGlvbihkYkluZm8pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfdHJ5UmVjb25uZWN0KGRiSW5mbykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZVRyYW5zYWN0aW9uKGRiSW5mbywgbW9kZSwgY2FsbGJhY2ssIHJldHJpZXMgLSAxKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pW1wiY2F0Y2hcIl0oY2FsbGJhY2spO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZURiQ29udGV4dCgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAvLyBSdW5uaW5nIGxvY2FsRm9yYWdlcyBzaGFyaW5nIGEgZGF0YWJhc2UuXG4gICAgICAgIGZvcmFnZXM6IFtdLFxuICAgICAgICAvLyBTaGFyZWQgZGF0YWJhc2UuXG4gICAgICAgIGRiOiBudWxsLFxuICAgICAgICAvLyBEYXRhYmFzZSByZWFkaW5lc3MgKHByb21pc2UpLlxuICAgICAgICBkYlJlYWR5OiBudWxsLFxuICAgICAgICAvLyBEZWZlcnJlZCBvcGVyYXRpb25zIG9uIHRoZSBkYXRhYmFzZS5cbiAgICAgICAgZGVmZXJyZWRPcGVyYXRpb25zOiBbXVxuICAgIH07XG59XG5cbi8vIE9wZW4gdGhlIEluZGV4ZWREQiBkYXRhYmFzZSAoYXV0b21hdGljYWxseSBjcmVhdGVzIG9uZSBpZiBvbmUgZGlkbid0XG4vLyBwcmV2aW91c2x5IGV4aXN0KSwgdXNpbmcgYW55IG9wdGlvbnMgc2V0IGluIHRoZSBjb25maWcuXG5mdW5jdGlvbiBfaW5pdFN0b3JhZ2Uob3B0aW9ucykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZGJJbmZvID0ge1xuICAgICAgICBkYjogbnVsbFxuICAgIH07XG5cbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgICBmb3IgKHZhciBpIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGRiSW5mb1tpXSA9IG9wdGlvbnNbaV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBHZXQgdGhlIGN1cnJlbnQgY29udGV4dCBvZiB0aGUgZGF0YWJhc2U7XG4gICAgdmFyIGRiQ29udGV4dCA9IGRiQ29udGV4dHNbZGJJbmZvLm5hbWVdO1xuXG4gICAgLy8gLi4ub3IgY3JlYXRlIGEgbmV3IGNvbnRleHQuXG4gICAgaWYgKCFkYkNvbnRleHQpIHtcbiAgICAgICAgZGJDb250ZXh0ID0gY3JlYXRlRGJDb250ZXh0KCk7XG4gICAgICAgIC8vIFJlZ2lzdGVyIHRoZSBuZXcgY29udGV4dCBpbiB0aGUgZ2xvYmFsIGNvbnRhaW5lci5cbiAgICAgICAgZGJDb250ZXh0c1tkYkluZm8ubmFtZV0gPSBkYkNvbnRleHQ7XG4gICAgfVxuXG4gICAgLy8gUmVnaXN0ZXIgaXRzZWxmIGFzIGEgcnVubmluZyBsb2NhbEZvcmFnZSBpbiB0aGUgY3VycmVudCBjb250ZXh0LlxuICAgIGRiQ29udGV4dC5mb3JhZ2VzLnB1c2goc2VsZik7XG5cbiAgICAvLyBSZXBsYWNlIHRoZSBkZWZhdWx0IGByZWFkeSgpYCBmdW5jdGlvbiB3aXRoIHRoZSBzcGVjaWFsaXplZCBvbmUuXG4gICAgaWYgKCFzZWxmLl9pbml0UmVhZHkpIHtcbiAgICAgICAgc2VsZi5faW5pdFJlYWR5ID0gc2VsZi5yZWFkeTtcbiAgICAgICAgc2VsZi5yZWFkeSA9IF9mdWxseVJlYWR5O1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSBhbiBhcnJheSBvZiBpbml0aWFsaXphdGlvbiBzdGF0ZXMgb2YgdGhlIHJlbGF0ZWQgbG9jYWxGb3JhZ2VzLlxuICAgIHZhciBpbml0UHJvbWlzZXMgPSBbXTtcblxuICAgIGZ1bmN0aW9uIGlnbm9yZUVycm9ycygpIHtcbiAgICAgICAgLy8gRG9uJ3QgaGFuZGxlIGVycm9ycyBoZXJlLFxuICAgICAgICAvLyBqdXN0IG1ha2VzIHN1cmUgcmVsYXRlZCBsb2NhbEZvcmFnZXMgYXJlbid0IHBlbmRpbmcuXG4gICAgICAgIHJldHVybiBQcm9taXNlJDEucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgZGJDb250ZXh0LmZvcmFnZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgdmFyIGZvcmFnZSA9IGRiQ29udGV4dC5mb3JhZ2VzW2pdO1xuICAgICAgICBpZiAoZm9yYWdlICE9PSBzZWxmKSB7XG4gICAgICAgICAgICAvLyBEb24ndCB3YWl0IGZvciBpdHNlbGYuLi5cbiAgICAgICAgICAgIGluaXRQcm9taXNlcy5wdXNoKGZvcmFnZS5faW5pdFJlYWR5KClbXCJjYXRjaFwiXShpZ25vcmVFcnJvcnMpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRha2UgYSBzbmFwc2hvdCBvZiB0aGUgcmVsYXRlZCBsb2NhbEZvcmFnZXMuXG4gICAgdmFyIGZvcmFnZXMgPSBkYkNvbnRleHQuZm9yYWdlcy5zbGljZSgwKTtcblxuICAgIC8vIEluaXRpYWxpemUgdGhlIGNvbm5lY3Rpb24gcHJvY2VzcyBvbmx5IHdoZW5cbiAgICAvLyBhbGwgdGhlIHJlbGF0ZWQgbG9jYWxGb3JhZ2VzIGFyZW4ndCBwZW5kaW5nLlxuICAgIHJldHVybiBQcm9taXNlJDEuYWxsKGluaXRQcm9taXNlcykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgIGRiSW5mby5kYiA9IGRiQ29udGV4dC5kYjtcbiAgICAgICAgLy8gR2V0IHRoZSBjb25uZWN0aW9uIG9yIG9wZW4gYSBuZXcgb25lIHdpdGhvdXQgdXBncmFkZS5cbiAgICAgICAgcmV0dXJuIF9nZXRPcmlnaW5hbENvbm5lY3Rpb24oZGJJbmZvKTtcbiAgICB9KS50aGVuKGZ1bmN0aW9uIChkYikge1xuICAgICAgICBkYkluZm8uZGIgPSBkYjtcbiAgICAgICAgaWYgKF9pc1VwZ3JhZGVOZWVkZWQoZGJJbmZvLCBzZWxmLl9kZWZhdWx0Q29uZmlnLnZlcnNpb24pKSB7XG4gICAgICAgICAgICAvLyBSZW9wZW4gdGhlIGRhdGFiYXNlIGZvciB1cGdyYWRpbmcuXG4gICAgICAgICAgICByZXR1cm4gX2dldFVwZ3JhZGVkQ29ubmVjdGlvbihkYkluZm8pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkYjtcbiAgICB9KS50aGVuKGZ1bmN0aW9uIChkYikge1xuICAgICAgICBkYkluZm8uZGIgPSBkYkNvbnRleHQuZGIgPSBkYjtcbiAgICAgICAgc2VsZi5fZGJJbmZvID0gZGJJbmZvO1xuICAgICAgICAvLyBTaGFyZSB0aGUgZmluYWwgY29ubmVjdGlvbiBhbW9uZ3N0IHJlbGF0ZWQgbG9jYWxGb3JhZ2VzLlxuICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IGZvcmFnZXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgIHZhciBmb3JhZ2UgPSBmb3JhZ2VzW2tdO1xuICAgICAgICAgICAgaWYgKGZvcmFnZSAhPT0gc2VsZikge1xuICAgICAgICAgICAgICAgIC8vIFNlbGYgaXMgYWxyZWFkeSB1cC10by1kYXRlLlxuICAgICAgICAgICAgICAgIGZvcmFnZS5fZGJJbmZvLmRiID0gZGJJbmZvLmRiO1xuICAgICAgICAgICAgICAgIGZvcmFnZS5fZGJJbmZvLnZlcnNpb24gPSBkYkluZm8udmVyc2lvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRJdGVtKGtleSwgY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBrZXkgPSBub3JtYWxpemVLZXkoa2V5KTtcblxuICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UkMShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNyZWF0ZVRyYW5zYWN0aW9uKHNlbGYuX2RiSW5mbywgUkVBRF9PTkxZLCBmdW5jdGlvbiAoZXJyLCB0cmFuc2FjdGlvbikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdG9yZSA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKHNlbGYuX2RiSW5mby5zdG9yZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVxID0gc3RvcmUuZ2V0KGtleSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmVxLm9uc3VjY2VzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHJlcS5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfaXNFbmNvZGVkQmxvYih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IF9kZWNvZGVCbG9iKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHJlcS5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHJlcS5lcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pW1wiY2F0Y2hcIl0ocmVqZWN0KTtcbiAgICB9KTtcblxuICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cbi8vIEl0ZXJhdGUgb3ZlciBhbGwgaXRlbXMgc3RvcmVkIGluIGRhdGFiYXNlLlxuZnVuY3Rpb24gaXRlcmF0ZShpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjcmVhdGVUcmFuc2FjdGlvbihzZWxmLl9kYkluZm8sIFJFQURfT05MWSwgZnVuY3Rpb24gKGVyciwgdHJhbnNhY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZShzZWxmLl9kYkluZm8uc3RvcmVOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlcSA9IHN0b3JlLm9wZW5DdXJzb3IoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZXJhdGlvbk51bWJlciA9IDE7XG5cbiAgICAgICAgICAgICAgICAgICAgcmVxLm9uc3VjY2VzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjdXJzb3IgPSByZXEucmVzdWx0O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3Vyc29yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gY3Vyc29yLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfaXNFbmNvZGVkQmxvYih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBfZGVjb2RlQmxvYih2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBpdGVyYXRvcih2YWx1ZSwgY3Vyc29yLmtleSwgaXRlcmF0aW9uTnVtYmVyKyspO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2hlbiB0aGUgaXRlcmF0b3IgY2FsbGJhY2sgcmV0dW5zIGFueVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIChub24tYHVuZGVmaW5lZGApIHZhbHVlLCB0aGVuIHdlIHN0b3BcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgaXRlcmF0aW9uIGltbWVkaWF0ZWx5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCAhPT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJzb3JbXCJjb250aW51ZVwiXSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHJlcS5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHJlcS5lcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pW1wiY2F0Y2hcIl0ocmVqZWN0KTtcbiAgICB9KTtcblxuICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuZnVuY3Rpb24gc2V0SXRlbShrZXksIHZhbHVlLCBjYWxsYmFjaykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGtleSA9IG5vcm1hbGl6ZUtleShrZXkpO1xuXG4gICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSQxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgdmFyIGRiSW5mbztcbiAgICAgICAgc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZGJJbmZvID0gc2VsZi5fZGJJbmZvO1xuICAgICAgICAgICAgaWYgKHRvU3RyaW5nLmNhbGwodmFsdWUpID09PSAnW29iamVjdCBCbG9iXScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2NoZWNrQmxvYlN1cHBvcnQoZGJJbmZvLmRiKS50aGVuKGZ1bmN0aW9uIChibG9iU3VwcG9ydCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYmxvYlN1cHBvcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX2VuY29kZUJsb2IodmFsdWUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgY3JlYXRlVHJhbnNhY3Rpb24oc2VsZi5fZGJJbmZvLCBSRUFEX1dSSVRFLCBmdW5jdGlvbiAoZXJyLCB0cmFuc2FjdGlvbikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdG9yZSA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKHNlbGYuX2RiSW5mby5zdG9yZU5hbWUpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZSByZWFzb24gd2UgZG9uJ3QgX3NhdmVfIG51bGwgaXMgYmVjYXVzZSBJRSAxMCBkb2VzXG4gICAgICAgICAgICAgICAgICAgIC8vIG5vdCBzdXBwb3J0IHNhdmluZyB0aGUgYG51bGxgIHR5cGUgaW4gSW5kZXhlZERCLiBIb3dcbiAgICAgICAgICAgICAgICAgICAgLy8gaXJvbmljLCBnaXZlbiB0aGUgYnVnIGJlbG93IVxuICAgICAgICAgICAgICAgICAgICAvLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9tb3ppbGxhL2xvY2FsRm9yYWdlL2lzc3Vlcy8xNjFcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhciByZXEgPSBzdG9yZS5wdXQodmFsdWUsIGtleSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb24ub25jb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENhc3QgdG8gdW5kZWZpbmVkIHNvIHRoZSB2YWx1ZSBwYXNzZWQgdG9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhbGxiYWNrL3Byb21pc2UgaXMgdGhlIHNhbWUgYXMgd2hhdCBvbmUgd291bGQgZ2V0IG91dFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gb2YgYGdldEl0ZW0oKWAgbGF0ZXIuIFRoaXMgbGVhZHMgdG8gc29tZSB3ZWlyZG5lc3NcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIChzZXRJdGVtKCdmb28nLCB1bmRlZmluZWQpIHdpbGwgcmV0dXJuIGBudWxsYCksIGJ1dFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaXQncyBub3QgbXkgZmF1bHQgbG9jYWxTdG9yYWdlIGlzIG91ciBiYXNlbGluZSBhbmQgdGhhdFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaXQncyB3ZWlyZC5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb24ub25hYm9ydCA9IHRyYW5zYWN0aW9uLm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZXJyID0gcmVxLmVycm9yID8gcmVxLmVycm9yIDogcmVxLnRyYW5zYWN0aW9uLmVycm9yO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pW1wiY2F0Y2hcIl0ocmVqZWN0KTtcbiAgICB9KTtcblxuICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUl0ZW0oa2V5LCBjYWxsYmFjaykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGtleSA9IG5vcm1hbGl6ZUtleShrZXkpO1xuXG4gICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSQxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY3JlYXRlVHJhbnNhY3Rpb24oc2VsZi5fZGJJbmZvLCBSRUFEX1dSSVRFLCBmdW5jdGlvbiAoZXJyLCB0cmFuc2FjdGlvbikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdG9yZSA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKHNlbGYuX2RiSW5mby5zdG9yZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAvLyBXZSB1c2UgYSBHcnVudCB0YXNrIHRvIG1ha2UgdGhpcyBzYWZlIGZvciBJRSBhbmQgc29tZVxuICAgICAgICAgICAgICAgICAgICAvLyB2ZXJzaW9ucyBvZiBBbmRyb2lkIChpbmNsdWRpbmcgdGhvc2UgdXNlZCBieSBDb3Jkb3ZhKS5cbiAgICAgICAgICAgICAgICAgICAgLy8gTm9ybWFsbHkgSUUgd29uJ3QgbGlrZSBgLmRlbGV0ZSgpYCBhbmQgd2lsbCBpbnNpc3Qgb25cbiAgICAgICAgICAgICAgICAgICAgLy8gdXNpbmcgYFsnZGVsZXRlJ10oKWAsIGJ1dCB3ZSBoYXZlIGEgYnVpbGQgc3RlcCB0aGF0XG4gICAgICAgICAgICAgICAgICAgIC8vIGZpeGVzIHRoaXMgZm9yIHVzIG5vdy5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlcSA9IHN0b3JlW1wiZGVsZXRlXCJdKGtleSk7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uLm9uY29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb24ub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChyZXEuZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZSByZXF1ZXN0IHdpbGwgYmUgYWxzbyBiZSBhYm9ydGVkIGlmIHdlJ3ZlIGV4Y2VlZGVkIG91ciBzdG9yYWdlXG4gICAgICAgICAgICAgICAgICAgIC8vIHNwYWNlLlxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbi5vbmFib3J0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVyciA9IHJlcS5lcnJvciA/IHJlcS5lcnJvciA6IHJlcS50cmFuc2FjdGlvbi5lcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVtcImNhdGNoXCJdKHJlamVjdCk7XG4gICAgfSk7XG5cbiAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG5mdW5jdGlvbiBjbGVhcihjYWxsYmFjaykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UkMShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNyZWF0ZVRyYW5zYWN0aW9uKHNlbGYuX2RiSW5mbywgUkVBRF9XUklURSwgZnVuY3Rpb24gKGVyciwgdHJhbnNhY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZShzZWxmLl9kYkluZm8uc3RvcmVOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlcSA9IHN0b3JlLmNsZWFyKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb24ub25jb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbi5vbmFib3J0ID0gdHJhbnNhY3Rpb24ub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlcnIgPSByZXEuZXJyb3IgPyByZXEuZXJyb3IgOiByZXEudHJhbnNhY3Rpb24uZXJyb3I7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlbXCJjYXRjaFwiXShyZWplY3QpO1xuICAgIH0pO1xuXG4gICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuZnVuY3Rpb24gbGVuZ3RoKGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSQxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY3JlYXRlVHJhbnNhY3Rpb24oc2VsZi5fZGJJbmZvLCBSRUFEX09OTFksIGZ1bmN0aW9uIChlcnIsIHRyYW5zYWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0b3JlID0gdHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUoc2VsZi5fZGJJbmZvLnN0b3JlTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXEgPSBzdG9yZS5jb3VudCgpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJlcS5vbnN1Y2Nlc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlcS5yZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHJlcS5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHJlcS5lcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pW1wiY2F0Y2hcIl0ocmVqZWN0KTtcbiAgICB9KTtcblxuICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cbmZ1bmN0aW9uIGtleShuLCBjYWxsYmFjaykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UkMShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGlmIChuIDwgMCkge1xuICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY3JlYXRlVHJhbnNhY3Rpb24oc2VsZi5fZGJJbmZvLCBSRUFEX09OTFksIGZ1bmN0aW9uIChlcnIsIHRyYW5zYWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0b3JlID0gdHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUoc2VsZi5fZGJJbmZvLnN0b3JlTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhZHZhbmNlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVxID0gc3RvcmUub3BlbkN1cnNvcigpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJlcS5vbnN1Y2Nlc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3Vyc29yID0gcmVxLnJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY3Vyc29yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhpcyBtZWFucyB0aGVyZSB3ZXJlbid0IGVub3VnaCBrZXlzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG4gPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBoYXZlIHRoZSBmaXJzdCBrZXksIHJldHVybiBpdCBpZiB0aGF0J3Mgd2hhdCB0aGV5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2FudGVkLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoY3Vyc29yLmtleSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYWR2YW5jZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gT3RoZXJ3aXNlLCBhc2sgdGhlIGN1cnNvciB0byBza2lwIGFoZWFkIG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVjb3Jkcy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWR2YW5jZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJzb3IuYWR2YW5jZShuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXaGVuIHdlIGdldCBoZXJlLCB3ZSd2ZSBnb3QgdGhlIG50aCBrZXkuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoY3Vyc29yLmtleSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHJlcS5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHJlcS5lcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pW1wiY2F0Y2hcIl0ocmVqZWN0KTtcbiAgICB9KTtcblxuICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cbmZ1bmN0aW9uIGtleXMoY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjcmVhdGVUcmFuc2FjdGlvbihzZWxmLl9kYkluZm8sIFJFQURfT05MWSwgZnVuY3Rpb24gKGVyciwgdHJhbnNhY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZShzZWxmLl9kYkluZm8uc3RvcmVOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlcSA9IHN0b3JlLm9wZW5DdXJzb3IoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleXMgPSBbXTtcblxuICAgICAgICAgICAgICAgICAgICByZXEub25zdWNjZXNzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnNvciA9IHJlcS5yZXN1bHQ7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY3Vyc29yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShrZXlzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGtleXMucHVzaChjdXJzb3Iua2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnNvcltcImNvbnRpbnVlXCJdKCk7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgcmVxLm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QocmVxLmVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlbXCJjYXRjaFwiXShyZWplY3QpO1xuICAgIH0pO1xuXG4gICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuZnVuY3Rpb24gZHJvcEluc3RhbmNlKG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgY2FsbGJhY2sgPSBnZXRDYWxsYmFjay5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgdmFyIGN1cnJlbnRDb25maWcgPSB0aGlzLmNvbmZpZygpO1xuICAgIG9wdGlvbnMgPSB0eXBlb2Ygb3B0aW9ucyAhPT0gJ2Z1bmN0aW9uJyAmJiBvcHRpb25zIHx8IHt9O1xuICAgIGlmICghb3B0aW9ucy5uYW1lKSB7XG4gICAgICAgIG9wdGlvbnMubmFtZSA9IG9wdGlvbnMubmFtZSB8fCBjdXJyZW50Q29uZmlnLm5hbWU7XG4gICAgICAgIG9wdGlvbnMuc3RvcmVOYW1lID0gb3B0aW9ucy5zdG9yZU5hbWUgfHwgY3VycmVudENvbmZpZy5zdG9yZU5hbWU7XG4gICAgfVxuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBwcm9taXNlO1xuICAgIGlmICghb3B0aW9ucy5uYW1lKSB7XG4gICAgICAgIHByb21pc2UgPSBQcm9taXNlJDEucmVqZWN0KCdJbnZhbGlkIGFyZ3VtZW50cycpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBpc0N1cnJlbnREYiA9IG9wdGlvbnMubmFtZSA9PT0gY3VycmVudENvbmZpZy5uYW1lICYmIHNlbGYuX2RiSW5mby5kYjtcblxuICAgICAgICB2YXIgZGJQcm9taXNlID0gaXNDdXJyZW50RGIgPyBQcm9taXNlJDEucmVzb2x2ZShzZWxmLl9kYkluZm8uZGIpIDogX2dldE9yaWdpbmFsQ29ubmVjdGlvbihvcHRpb25zKS50aGVuKGZ1bmN0aW9uIChkYikge1xuICAgICAgICAgICAgdmFyIGRiQ29udGV4dCA9IGRiQ29udGV4dHNbb3B0aW9ucy5uYW1lXTtcbiAgICAgICAgICAgIHZhciBmb3JhZ2VzID0gZGJDb250ZXh0LmZvcmFnZXM7XG4gICAgICAgICAgICBkYkNvbnRleHQuZGIgPSBkYjtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZm9yYWdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGZvcmFnZXNbaV0uX2RiSW5mby5kYiA9IGRiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGRiO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIW9wdGlvbnMuc3RvcmVOYW1lKSB7XG4gICAgICAgICAgICBwcm9taXNlID0gZGJQcm9taXNlLnRoZW4oZnVuY3Rpb24gKGRiKSB7XG4gICAgICAgICAgICAgICAgX2RlZmVyUmVhZGluZXNzKG9wdGlvbnMpO1xuXG4gICAgICAgICAgICAgICAgdmFyIGRiQ29udGV4dCA9IGRiQ29udGV4dHNbb3B0aW9ucy5uYW1lXTtcbiAgICAgICAgICAgICAgICB2YXIgZm9yYWdlcyA9IGRiQ29udGV4dC5mb3JhZ2VzO1xuXG4gICAgICAgICAgICAgICAgZGIuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZvcmFnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZvcmFnZSA9IGZvcmFnZXNbaV07XG4gICAgICAgICAgICAgICAgICAgIGZvcmFnZS5fZGJJbmZvLmRiID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgZHJvcERCUHJvbWlzZSA9IG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVxID0gaWRiLmRlbGV0ZURhdGFiYXNlKG9wdGlvbnMubmFtZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmVxLm9uZXJyb3IgPSByZXEub25ibG9ja2VkID0gZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRiID0gcmVxLnJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRiLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICByZXEub25zdWNjZXNzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRiID0gcmVxLnJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRiLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGRiKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBkcm9wREJQcm9taXNlLnRoZW4oZnVuY3Rpb24gKGRiKSB7XG4gICAgICAgICAgICAgICAgICAgIGRiQ29udGV4dC5kYiA9IGRiO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZvcmFnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBfZm9yYWdlID0gZm9yYWdlc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hZHZhbmNlUmVhZGluZXNzKF9mb3JhZ2UuX2RiSW5mbyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVtcImNhdGNoXCJdKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgKF9yZWplY3RSZWFkaW5lc3Mob3B0aW9ucywgZXJyKSB8fCBQcm9taXNlJDEucmVzb2x2ZSgpKVtcImNhdGNoXCJdKGZ1bmN0aW9uICgpIHt9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwcm9taXNlID0gZGJQcm9taXNlLnRoZW4oZnVuY3Rpb24gKGRiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFkYi5vYmplY3RTdG9yZU5hbWVzLmNvbnRhaW5zKG9wdGlvbnMuc3RvcmVOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIG5ld1ZlcnNpb24gPSBkYi52ZXJzaW9uICsgMTtcblxuICAgICAgICAgICAgICAgIF9kZWZlclJlYWRpbmVzcyhvcHRpb25zKTtcblxuICAgICAgICAgICAgICAgIHZhciBkYkNvbnRleHQgPSBkYkNvbnRleHRzW29wdGlvbnMubmFtZV07XG4gICAgICAgICAgICAgICAgdmFyIGZvcmFnZXMgPSBkYkNvbnRleHQuZm9yYWdlcztcblxuICAgICAgICAgICAgICAgIGRiLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmb3JhZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmb3JhZ2UgPSBmb3JhZ2VzW2ldO1xuICAgICAgICAgICAgICAgICAgICBmb3JhZ2UuX2RiSW5mby5kYiA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGZvcmFnZS5fZGJJbmZvLnZlcnNpb24gPSBuZXdWZXJzaW9uO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBkcm9wT2JqZWN0UHJvbWlzZSA9IG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVxID0gaWRiLm9wZW4ob3B0aW9ucy5uYW1lLCBuZXdWZXJzaW9uKTtcblxuICAgICAgICAgICAgICAgICAgICByZXEub25lcnJvciA9IGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYiA9IHJlcS5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYi5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgcmVxLm9udXBncmFkZW5lZWRlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYiA9IHJlcS5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYi5kZWxldGVPYmplY3RTdG9yZShvcHRpb25zLnN0b3JlTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgcmVxLm9uc3VjY2VzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYiA9IHJlcS5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYi5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShkYik7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZHJvcE9iamVjdFByb21pc2UudGhlbihmdW5jdGlvbiAoZGIpIHtcbiAgICAgICAgICAgICAgICAgICAgZGJDb250ZXh0LmRiID0gZGI7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZm9yYWdlcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIF9mb3JhZ2UyID0gZm9yYWdlc1tqXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9mb3JhZ2UyLl9kYkluZm8uZGIgPSBkYjtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hZHZhbmNlUmVhZGluZXNzKF9mb3JhZ2UyLl9kYkluZm8pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlbXCJjYXRjaFwiXShmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIChfcmVqZWN0UmVhZGluZXNzKG9wdGlvbnMsIGVycikgfHwgUHJvbWlzZSQxLnJlc29sdmUoKSlbXCJjYXRjaFwiXShmdW5jdGlvbiAoKSB7fSk7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxudmFyIGFzeW5jU3RvcmFnZSA9IHtcbiAgICBfZHJpdmVyOiAnYXN5bmNTdG9yYWdlJyxcbiAgICBfaW5pdFN0b3JhZ2U6IF9pbml0U3RvcmFnZSxcbiAgICBfc3VwcG9ydDogaXNJbmRleGVkREJWYWxpZCgpLFxuICAgIGl0ZXJhdGU6IGl0ZXJhdGUsXG4gICAgZ2V0SXRlbTogZ2V0SXRlbSxcbiAgICBzZXRJdGVtOiBzZXRJdGVtLFxuICAgIHJlbW92ZUl0ZW06IHJlbW92ZUl0ZW0sXG4gICAgY2xlYXI6IGNsZWFyLFxuICAgIGxlbmd0aDogbGVuZ3RoLFxuICAgIGtleToga2V5LFxuICAgIGtleXM6IGtleXMsXG4gICAgZHJvcEluc3RhbmNlOiBkcm9wSW5zdGFuY2Vcbn07XG5cbmZ1bmN0aW9uIGlzV2ViU1FMVmFsaWQoKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvcGVuRGF0YWJhc2UgPT09ICdmdW5jdGlvbic7XG59XG5cbi8vIFNhZGx5LCB0aGUgYmVzdCB3YXkgdG8gc2F2ZSBiaW5hcnkgZGF0YSBpbiBXZWJTUUwvbG9jYWxTdG9yYWdlIGlzIHNlcmlhbGl6aW5nXG4vLyBpdCB0byBCYXNlNjQsIHNvIHRoaXMgaXMgaG93IHdlIHN0b3JlIGl0IHRvIHByZXZlbnQgdmVyeSBzdHJhbmdlIGVycm9ycyB3aXRoIGxlc3Ncbi8vIHZlcmJvc2Ugd2F5cyBvZiBiaW5hcnkgPC0+IHN0cmluZyBkYXRhIHN0b3JhZ2UuXG52YXIgQkFTRV9DSEFSUyA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcblxudmFyIEJMT0JfVFlQRV9QUkVGSVggPSAnfn5sb2NhbF9mb3JhZ2VfdHlwZX4nO1xudmFyIEJMT0JfVFlQRV9QUkVGSVhfUkVHRVggPSAvXn5+bG9jYWxfZm9yYWdlX3R5cGV+KFtefl0rKX4vO1xuXG52YXIgU0VSSUFMSVpFRF9NQVJLRVIgPSAnX19sZnNjX186JztcbnZhciBTRVJJQUxJWkVEX01BUktFUl9MRU5HVEggPSBTRVJJQUxJWkVEX01BUktFUi5sZW5ndGg7XG5cbi8vIE9NRyB0aGUgc2VyaWFsaXphdGlvbnMhXG52YXIgVFlQRV9BUlJBWUJVRkZFUiA9ICdhcmJmJztcbnZhciBUWVBFX0JMT0IgPSAnYmxvYic7XG52YXIgVFlQRV9JTlQ4QVJSQVkgPSAnc2kwOCc7XG52YXIgVFlQRV9VSU5UOEFSUkFZID0gJ3VpMDgnO1xudmFyIFRZUEVfVUlOVDhDTEFNUEVEQVJSQVkgPSAndWljOCc7XG52YXIgVFlQRV9JTlQxNkFSUkFZID0gJ3NpMTYnO1xudmFyIFRZUEVfSU5UMzJBUlJBWSA9ICdzaTMyJztcbnZhciBUWVBFX1VJTlQxNkFSUkFZID0gJ3VyMTYnO1xudmFyIFRZUEVfVUlOVDMyQVJSQVkgPSAndWkzMic7XG52YXIgVFlQRV9GTE9BVDMyQVJSQVkgPSAnZmwzMic7XG52YXIgVFlQRV9GTE9BVDY0QVJSQVkgPSAnZmw2NCc7XG52YXIgVFlQRV9TRVJJQUxJWkVEX01BUktFUl9MRU5HVEggPSBTRVJJQUxJWkVEX01BUktFUl9MRU5HVEggKyBUWVBFX0FSUkFZQlVGRkVSLmxlbmd0aDtcblxudmFyIHRvU3RyaW5nJDEgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5mdW5jdGlvbiBzdHJpbmdUb0J1ZmZlcihzZXJpYWxpemVkU3RyaW5nKSB7XG4gICAgLy8gRmlsbCB0aGUgc3RyaW5nIGludG8gYSBBcnJheUJ1ZmZlci5cbiAgICB2YXIgYnVmZmVyTGVuZ3RoID0gc2VyaWFsaXplZFN0cmluZy5sZW5ndGggKiAwLjc1O1xuICAgIHZhciBsZW4gPSBzZXJpYWxpemVkU3RyaW5nLmxlbmd0aDtcbiAgICB2YXIgaTtcbiAgICB2YXIgcCA9IDA7XG4gICAgdmFyIGVuY29kZWQxLCBlbmNvZGVkMiwgZW5jb2RlZDMsIGVuY29kZWQ0O1xuXG4gICAgaWYgKHNlcmlhbGl6ZWRTdHJpbmdbc2VyaWFsaXplZFN0cmluZy5sZW5ndGggLSAxXSA9PT0gJz0nKSB7XG4gICAgICAgIGJ1ZmZlckxlbmd0aC0tO1xuICAgICAgICBpZiAoc2VyaWFsaXplZFN0cmluZ1tzZXJpYWxpemVkU3RyaW5nLmxlbmd0aCAtIDJdID09PSAnPScpIHtcbiAgICAgICAgICAgIGJ1ZmZlckxlbmd0aC0tO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihidWZmZXJMZW5ndGgpO1xuICAgIHZhciBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpICs9IDQpIHtcbiAgICAgICAgZW5jb2RlZDEgPSBCQVNFX0NIQVJTLmluZGV4T2Yoc2VyaWFsaXplZFN0cmluZ1tpXSk7XG4gICAgICAgIGVuY29kZWQyID0gQkFTRV9DSEFSUy5pbmRleE9mKHNlcmlhbGl6ZWRTdHJpbmdbaSArIDFdKTtcbiAgICAgICAgZW5jb2RlZDMgPSBCQVNFX0NIQVJTLmluZGV4T2Yoc2VyaWFsaXplZFN0cmluZ1tpICsgMl0pO1xuICAgICAgICBlbmNvZGVkNCA9IEJBU0VfQ0hBUlMuaW5kZXhPZihzZXJpYWxpemVkU3RyaW5nW2kgKyAzXSk7XG5cbiAgICAgICAgLypqc2xpbnQgYml0d2lzZTogdHJ1ZSAqL1xuICAgICAgICBieXRlc1twKytdID0gZW5jb2RlZDEgPDwgMiB8IGVuY29kZWQyID4+IDQ7XG4gICAgICAgIGJ5dGVzW3ArK10gPSAoZW5jb2RlZDIgJiAxNSkgPDwgNCB8IGVuY29kZWQzID4+IDI7XG4gICAgICAgIGJ5dGVzW3ArK10gPSAoZW5jb2RlZDMgJiAzKSA8PCA2IHwgZW5jb2RlZDQgJiA2MztcbiAgICB9XG4gICAgcmV0dXJuIGJ1ZmZlcjtcbn1cblxuLy8gQ29udmVydHMgYSBidWZmZXIgdG8gYSBzdHJpbmcgdG8gc3RvcmUsIHNlcmlhbGl6ZWQsIGluIHRoZSBiYWNrZW5kXG4vLyBzdG9yYWdlIGxpYnJhcnkuXG5mdW5jdGlvbiBidWZmZXJUb1N0cmluZyhidWZmZXIpIHtcbiAgICAvLyBiYXNlNjQtYXJyYXlidWZmZXJcbiAgICB2YXIgYnl0ZXMgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICAgIHZhciBiYXNlNjRTdHJpbmcgPSAnJztcbiAgICB2YXIgaTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkgKz0gMykge1xuICAgICAgICAvKmpzbGludCBiaXR3aXNlOiB0cnVlICovXG4gICAgICAgIGJhc2U2NFN0cmluZyArPSBCQVNFX0NIQVJTW2J5dGVzW2ldID4+IDJdO1xuICAgICAgICBiYXNlNjRTdHJpbmcgKz0gQkFTRV9DSEFSU1soYnl0ZXNbaV0gJiAzKSA8PCA0IHwgYnl0ZXNbaSArIDFdID4+IDRdO1xuICAgICAgICBiYXNlNjRTdHJpbmcgKz0gQkFTRV9DSEFSU1soYnl0ZXNbaSArIDFdICYgMTUpIDw8IDIgfCBieXRlc1tpICsgMl0gPj4gNl07XG4gICAgICAgIGJhc2U2NFN0cmluZyArPSBCQVNFX0NIQVJTW2J5dGVzW2kgKyAyXSAmIDYzXTtcbiAgICB9XG5cbiAgICBpZiAoYnl0ZXMubGVuZ3RoICUgMyA9PT0gMikge1xuICAgICAgICBiYXNlNjRTdHJpbmcgPSBiYXNlNjRTdHJpbmcuc3Vic3RyaW5nKDAsIGJhc2U2NFN0cmluZy5sZW5ndGggLSAxKSArICc9JztcbiAgICB9IGVsc2UgaWYgKGJ5dGVzLmxlbmd0aCAlIDMgPT09IDEpIHtcbiAgICAgICAgYmFzZTY0U3RyaW5nID0gYmFzZTY0U3RyaW5nLnN1YnN0cmluZygwLCBiYXNlNjRTdHJpbmcubGVuZ3RoIC0gMikgKyAnPT0nO1xuICAgIH1cblxuICAgIHJldHVybiBiYXNlNjRTdHJpbmc7XG59XG5cbi8vIFNlcmlhbGl6ZSBhIHZhbHVlLCBhZnRlcndhcmRzIGV4ZWN1dGluZyBhIGNhbGxiYWNrICh3aGljaCB1c3VhbGx5XG4vLyBpbnN0cnVjdHMgdGhlIGBzZXRJdGVtKClgIGNhbGxiYWNrL3Byb21pc2UgdG8gYmUgZXhlY3V0ZWQpLiBUaGlzIGlzIGhvd1xuLy8gd2Ugc3RvcmUgYmluYXJ5IGRhdGEgd2l0aCBsb2NhbFN0b3JhZ2UuXG5mdW5jdGlvbiBzZXJpYWxpemUodmFsdWUsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHZhbHVlVHlwZSA9ICcnO1xuICAgIGlmICh2YWx1ZSkge1xuICAgICAgICB2YWx1ZVR5cGUgPSB0b1N0cmluZyQxLmNhbGwodmFsdWUpO1xuICAgIH1cblxuICAgIC8vIENhbm5vdCB1c2UgYHZhbHVlIGluc3RhbmNlb2YgQXJyYXlCdWZmZXJgIG9yIHN1Y2ggaGVyZSwgYXMgdGhlc2VcbiAgICAvLyBjaGVja3MgZmFpbCB3aGVuIHJ1bm5pbmcgdGhlIHRlc3RzIHVzaW5nIGNhc3Blci5qcy4uLlxuICAgIC8vXG4gICAgLy8gVE9ETzogU2VlIHdoeSB0aG9zZSB0ZXN0cyBmYWlsIGFuZCB1c2UgYSBiZXR0ZXIgc29sdXRpb24uXG4gICAgaWYgKHZhbHVlICYmICh2YWx1ZVR5cGUgPT09ICdbb2JqZWN0IEFycmF5QnVmZmVyXScgfHwgdmFsdWUuYnVmZmVyICYmIHRvU3RyaW5nJDEuY2FsbCh2YWx1ZS5idWZmZXIpID09PSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nKSkge1xuICAgICAgICAvLyBDb252ZXJ0IGJpbmFyeSBhcnJheXMgdG8gYSBzdHJpbmcgYW5kIHByZWZpeCB0aGUgc3RyaW5nIHdpdGhcbiAgICAgICAgLy8gYSBzcGVjaWFsIG1hcmtlci5cbiAgICAgICAgdmFyIGJ1ZmZlcjtcbiAgICAgICAgdmFyIG1hcmtlciA9IFNFUklBTElaRURfTUFSS0VSO1xuXG4gICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgICAgICAgICBidWZmZXIgPSB2YWx1ZTtcbiAgICAgICAgICAgIG1hcmtlciArPSBUWVBFX0FSUkFZQlVGRkVSO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnVmZmVyID0gdmFsdWUuYnVmZmVyO1xuXG4gICAgICAgICAgICBpZiAodmFsdWVUeXBlID09PSAnW29iamVjdCBJbnQ4QXJyYXldJykge1xuICAgICAgICAgICAgICAgIG1hcmtlciArPSBUWVBFX0lOVDhBUlJBWTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWVUeXBlID09PSAnW29iamVjdCBVaW50OEFycmF5XScpIHtcbiAgICAgICAgICAgICAgICBtYXJrZXIgKz0gVFlQRV9VSU5UOEFSUkFZO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVR5cGUgPT09ICdbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XScpIHtcbiAgICAgICAgICAgICAgICBtYXJrZXIgKz0gVFlQRV9VSU5UOENMQU1QRURBUlJBWTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWVUeXBlID09PSAnW29iamVjdCBJbnQxNkFycmF5XScpIHtcbiAgICAgICAgICAgICAgICBtYXJrZXIgKz0gVFlQRV9JTlQxNkFSUkFZO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVR5cGUgPT09ICdbb2JqZWN0IFVpbnQxNkFycmF5XScpIHtcbiAgICAgICAgICAgICAgICBtYXJrZXIgKz0gVFlQRV9VSU5UMTZBUlJBWTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWVUeXBlID09PSAnW29iamVjdCBJbnQzMkFycmF5XScpIHtcbiAgICAgICAgICAgICAgICBtYXJrZXIgKz0gVFlQRV9JTlQzMkFSUkFZO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVR5cGUgPT09ICdbb2JqZWN0IFVpbnQzMkFycmF5XScpIHtcbiAgICAgICAgICAgICAgICBtYXJrZXIgKz0gVFlQRV9VSU5UMzJBUlJBWTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWVUeXBlID09PSAnW29iamVjdCBGbG9hdDMyQXJyYXldJykge1xuICAgICAgICAgICAgICAgIG1hcmtlciArPSBUWVBFX0ZMT0FUMzJBUlJBWTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWVUeXBlID09PSAnW29iamVjdCBGbG9hdDY0QXJyYXldJykge1xuICAgICAgICAgICAgICAgIG1hcmtlciArPSBUWVBFX0ZMT0FUNjRBUlJBWTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobmV3IEVycm9yKCdGYWlsZWQgdG8gZ2V0IHR5cGUgZm9yIEJpbmFyeUFycmF5JykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY2FsbGJhY2sobWFya2VyICsgYnVmZmVyVG9TdHJpbmcoYnVmZmVyKSk7XG4gICAgfSBlbHNlIGlmICh2YWx1ZVR5cGUgPT09ICdbb2JqZWN0IEJsb2JdJykge1xuICAgICAgICAvLyBDb252ZXIgdGhlIGJsb2IgdG8gYSBiaW5hcnlBcnJheSBhbmQgdGhlbiB0byBhIHN0cmluZy5cbiAgICAgICAgdmFyIGZpbGVSZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuXG4gICAgICAgIGZpbGVSZWFkZXIub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gQmFja3dhcmRzLWNvbXBhdGlibGUgcHJlZml4IGZvciB0aGUgYmxvYiB0eXBlLlxuICAgICAgICAgICAgdmFyIHN0ciA9IEJMT0JfVFlQRV9QUkVGSVggKyB2YWx1ZS50eXBlICsgJ34nICsgYnVmZmVyVG9TdHJpbmcodGhpcy5yZXN1bHQpO1xuXG4gICAgICAgICAgICBjYWxsYmFjayhTRVJJQUxJWkVEX01BUktFUiArIFRZUEVfQkxPQiArIHN0cik7XG4gICAgICAgIH07XG5cbiAgICAgICAgZmlsZVJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcih2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNhbGxiYWNrKEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJDb3VsZG4ndCBjb252ZXJ0IHZhbHVlIGludG8gYSBKU09OIHN0cmluZzogXCIsIHZhbHVlKTtcblxuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8vIERlc2VyaWFsaXplIGRhdGEgd2UndmUgaW5zZXJ0ZWQgaW50byBhIHZhbHVlIGNvbHVtbi9maWVsZC4gV2UgcGxhY2Vcbi8vIHNwZWNpYWwgbWFya2VycyBpbnRvIG91ciBzdHJpbmdzIHRvIG1hcmsgdGhlbSBhcyBlbmNvZGVkOyB0aGlzIGlzbid0XG4vLyBhcyBuaWNlIGFzIGEgbWV0YSBmaWVsZCwgYnV0IGl0J3MgdGhlIG9ubHkgc2FuZSB0aGluZyB3ZSBjYW4gZG8gd2hpbHN0XG4vLyBrZWVwaW5nIGxvY2FsU3RvcmFnZSBzdXBwb3J0IGludGFjdC5cbi8vXG4vLyBPZnRlbnRpbWVzIHRoaXMgd2lsbCBqdXN0IGRlc2VyaWFsaXplIEpTT04gY29udGVudCwgYnV0IGlmIHdlIGhhdmUgYVxuLy8gc3BlY2lhbCBtYXJrZXIgKFNFUklBTElaRURfTUFSS0VSLCBkZWZpbmVkIGFib3ZlKSwgd2Ugd2lsbCBleHRyYWN0XG4vLyBzb21lIGtpbmQgb2YgYXJyYXlidWZmZXIvYmluYXJ5IGRhdGEvdHlwZWQgYXJyYXkgb3V0IG9mIHRoZSBzdHJpbmcuXG5mdW5jdGlvbiBkZXNlcmlhbGl6ZSh2YWx1ZSkge1xuICAgIC8vIElmIHdlIGhhdmVuJ3QgbWFya2VkIHRoaXMgc3RyaW5nIGFzIGJlaW5nIHNwZWNpYWxseSBzZXJpYWxpemVkIChpLmUuXG4gICAgLy8gc29tZXRoaW5nIG90aGVyIHRoYW4gc2VyaWFsaXplZCBKU09OKSwgd2UgY2FuIGp1c3QgcmV0dXJuIGl0IGFuZCBiZVxuICAgIC8vIGRvbmUgd2l0aCBpdC5cbiAgICBpZiAodmFsdWUuc3Vic3RyaW5nKDAsIFNFUklBTElaRURfTUFSS0VSX0xFTkdUSCkgIT09IFNFUklBTElaRURfTUFSS0VSKSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICB9XG5cbiAgICAvLyBUaGUgZm9sbG93aW5nIGNvZGUgZGVhbHMgd2l0aCBkZXNlcmlhbGl6aW5nIHNvbWUga2luZCBvZiBCbG9iIG9yXG4gICAgLy8gVHlwZWRBcnJheS4gRmlyc3Qgd2Ugc2VwYXJhdGUgb3V0IHRoZSB0eXBlIG9mIGRhdGEgd2UncmUgZGVhbGluZ1xuICAgIC8vIHdpdGggZnJvbSB0aGUgZGF0YSBpdHNlbGYuXG4gICAgdmFyIHNlcmlhbGl6ZWRTdHJpbmcgPSB2YWx1ZS5zdWJzdHJpbmcoVFlQRV9TRVJJQUxJWkVEX01BUktFUl9MRU5HVEgpO1xuICAgIHZhciB0eXBlID0gdmFsdWUuc3Vic3RyaW5nKFNFUklBTElaRURfTUFSS0VSX0xFTkdUSCwgVFlQRV9TRVJJQUxJWkVEX01BUktFUl9MRU5HVEgpO1xuXG4gICAgdmFyIGJsb2JUeXBlO1xuICAgIC8vIEJhY2t3YXJkcy1jb21wYXRpYmxlIGJsb2IgdHlwZSBzZXJpYWxpemF0aW9uIHN0cmF0ZWd5LlxuICAgIC8vIERCcyBjcmVhdGVkIHdpdGggb2xkZXIgdmVyc2lvbnMgb2YgbG9jYWxGb3JhZ2Ugd2lsbCBzaW1wbHkgbm90IGhhdmUgdGhlIGJsb2IgdHlwZS5cbiAgICBpZiAodHlwZSA9PT0gVFlQRV9CTE9CICYmIEJMT0JfVFlQRV9QUkVGSVhfUkVHRVgudGVzdChzZXJpYWxpemVkU3RyaW5nKSkge1xuICAgICAgICB2YXIgbWF0Y2hlciA9IHNlcmlhbGl6ZWRTdHJpbmcubWF0Y2goQkxPQl9UWVBFX1BSRUZJWF9SRUdFWCk7XG4gICAgICAgIGJsb2JUeXBlID0gbWF0Y2hlclsxXTtcbiAgICAgICAgc2VyaWFsaXplZFN0cmluZyA9IHNlcmlhbGl6ZWRTdHJpbmcuc3Vic3RyaW5nKG1hdGNoZXJbMF0ubGVuZ3RoKTtcbiAgICB9XG4gICAgdmFyIGJ1ZmZlciA9IHN0cmluZ1RvQnVmZmVyKHNlcmlhbGl6ZWRTdHJpbmcpO1xuXG4gICAgLy8gUmV0dXJuIHRoZSByaWdodCB0eXBlIGJhc2VkIG9uIHRoZSBjb2RlL3R5cGUgc2V0IGR1cmluZ1xuICAgIC8vIHNlcmlhbGl6YXRpb24uXG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgVFlQRV9BUlJBWUJVRkZFUjpcbiAgICAgICAgICAgIHJldHVybiBidWZmZXI7XG4gICAgICAgIGNhc2UgVFlQRV9CTE9COlxuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUJsb2IoW2J1ZmZlcl0sIHsgdHlwZTogYmxvYlR5cGUgfSk7XG4gICAgICAgIGNhc2UgVFlQRV9JTlQ4QVJSQVk6XG4gICAgICAgICAgICByZXR1cm4gbmV3IEludDhBcnJheShidWZmZXIpO1xuICAgICAgICBjYXNlIFRZUEVfVUlOVDhBUlJBWTpcbiAgICAgICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICAgICAgICBjYXNlIFRZUEVfVUlOVDhDTEFNUEVEQVJSQVk6XG4gICAgICAgICAgICByZXR1cm4gbmV3IFVpbnQ4Q2xhbXBlZEFycmF5KGJ1ZmZlcik7XG4gICAgICAgIGNhc2UgVFlQRV9JTlQxNkFSUkFZOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBJbnQxNkFycmF5KGJ1ZmZlcik7XG4gICAgICAgIGNhc2UgVFlQRV9VSU5UMTZBUlJBWTpcbiAgICAgICAgICAgIHJldHVybiBuZXcgVWludDE2QXJyYXkoYnVmZmVyKTtcbiAgICAgICAgY2FzZSBUWVBFX0lOVDMyQVJSQVk6XG4gICAgICAgICAgICByZXR1cm4gbmV3IEludDMyQXJyYXkoYnVmZmVyKTtcbiAgICAgICAgY2FzZSBUWVBFX1VJTlQzMkFSUkFZOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBVaW50MzJBcnJheShidWZmZXIpO1xuICAgICAgICBjYXNlIFRZUEVfRkxPQVQzMkFSUkFZOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBGbG9hdDMyQXJyYXkoYnVmZmVyKTtcbiAgICAgICAgY2FzZSBUWVBFX0ZMT0FUNjRBUlJBWTpcbiAgICAgICAgICAgIHJldHVybiBuZXcgRmxvYXQ2NEFycmF5KGJ1ZmZlcik7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua293biB0eXBlOiAnICsgdHlwZSk7XG4gICAgfVxufVxuXG52YXIgbG9jYWxmb3JhZ2VTZXJpYWxpemVyID0ge1xuICAgIHNlcmlhbGl6ZTogc2VyaWFsaXplLFxuICAgIGRlc2VyaWFsaXplOiBkZXNlcmlhbGl6ZSxcbiAgICBzdHJpbmdUb0J1ZmZlcjogc3RyaW5nVG9CdWZmZXIsXG4gICAgYnVmZmVyVG9TdHJpbmc6IGJ1ZmZlclRvU3RyaW5nXG59O1xuXG4vKlxuICogSW5jbHVkZXMgY29kZSBmcm9tOlxuICpcbiAqIGJhc2U2NC1hcnJheWJ1ZmZlclxuICogaHR0cHM6Ly9naXRodWIuY29tL25pa2xhc3ZoL2Jhc2U2NC1hcnJheWJ1ZmZlclxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMiBOaWtsYXMgdm9uIEhlcnR6ZW5cbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqL1xuXG5mdW5jdGlvbiBjcmVhdGVEYlRhYmxlKHQsIGRiSW5mbywgY2FsbGJhY2ssIGVycm9yQ2FsbGJhY2spIHtcbiAgICB0LmV4ZWN1dGVTcWwoJ0NSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTICcgKyBkYkluZm8uc3RvcmVOYW1lICsgJyAnICsgJyhpZCBJTlRFR0VSIFBSSU1BUlkgS0VZLCBrZXkgdW5pcXVlLCB2YWx1ZSknLCBbXSwgY2FsbGJhY2ssIGVycm9yQ2FsbGJhY2spO1xufVxuXG4vLyBPcGVuIHRoZSBXZWJTUUwgZGF0YWJhc2UgKGF1dG9tYXRpY2FsbHkgY3JlYXRlcyBvbmUgaWYgb25lIGRpZG4ndFxuLy8gcHJldmlvdXNseSBleGlzdCksIHVzaW5nIGFueSBvcHRpb25zIHNldCBpbiB0aGUgY29uZmlnLlxuZnVuY3Rpb24gX2luaXRTdG9yYWdlJDEob3B0aW9ucykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZGJJbmZvID0ge1xuICAgICAgICBkYjogbnVsbFxuICAgIH07XG5cbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgICBmb3IgKHZhciBpIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGRiSW5mb1tpXSA9IHR5cGVvZiBvcHRpb25zW2ldICE9PSAnc3RyaW5nJyA/IG9wdGlvbnNbaV0udG9TdHJpbmcoKSA6IG9wdGlvbnNbaV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgZGJJbmZvUHJvbWlzZSA9IG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAvLyBPcGVuIHRoZSBkYXRhYmFzZTsgdGhlIG9wZW5EYXRhYmFzZSBBUEkgd2lsbCBhdXRvbWF0aWNhbGx5XG4gICAgICAgIC8vIGNyZWF0ZSBpdCBmb3IgdXMgaWYgaXQgZG9lc24ndCBleGlzdC5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGRiSW5mby5kYiA9IG9wZW5EYXRhYmFzZShkYkluZm8ubmFtZSwgU3RyaW5nKGRiSW5mby52ZXJzaW9uKSwgZGJJbmZvLmRlc2NyaXB0aW9uLCBkYkluZm8uc2l6ZSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDcmVhdGUgb3VyIGtleS92YWx1ZSB0YWJsZSBpZiBpdCBkb2Vzbid0IGV4aXN0LlxuICAgICAgICBkYkluZm8uZGIudHJhbnNhY3Rpb24oZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIGNyZWF0ZURiVGFibGUodCwgZGJJbmZvLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZGJJbmZvID0gZGJJbmZvO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICh0LCBlcnJvcikge1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgcmVqZWN0KTtcbiAgICB9KTtcblxuICAgIGRiSW5mby5zZXJpYWxpemVyID0gbG9jYWxmb3JhZ2VTZXJpYWxpemVyO1xuICAgIHJldHVybiBkYkluZm9Qcm9taXNlO1xufVxuXG5mdW5jdGlvbiB0cnlFeGVjdXRlU3FsKHQsIGRiSW5mbywgc3FsU3RhdGVtZW50LCBhcmdzLCBjYWxsYmFjaywgZXJyb3JDYWxsYmFjaykge1xuICAgIHQuZXhlY3V0ZVNxbChzcWxTdGF0ZW1lbnQsIGFyZ3MsIGNhbGxiYWNrLCBmdW5jdGlvbiAodCwgZXJyb3IpIHtcbiAgICAgICAgaWYgKGVycm9yLmNvZGUgPT09IGVycm9yLlNZTlRBWF9FUlIpIHtcbiAgICAgICAgICAgIHQuZXhlY3V0ZVNxbCgnU0VMRUNUIG5hbWUgRlJPTSBzcWxpdGVfbWFzdGVyICcgKyBcIldIRVJFIHR5cGU9J3RhYmxlJyBBTkQgbmFtZSA9ID9cIiwgW25hbWVdLCBmdW5jdGlvbiAodCwgcmVzdWx0cykge1xuICAgICAgICAgICAgICAgIGlmICghcmVzdWx0cy5yb3dzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGUgdGFibGUgaXMgbWlzc2luZyAod2FzIGRlbGV0ZWQpXG4gICAgICAgICAgICAgICAgICAgIC8vIHJlLWNyZWF0ZSBpdCB0YWJsZSBhbmQgcmV0cnlcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlRGJUYWJsZSh0LCBkYkluZm8sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQuZXhlY3V0ZVNxbChzcWxTdGF0ZW1lbnQsIGFyZ3MsIGNhbGxiYWNrLCBlcnJvckNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgZXJyb3JDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JDYWxsYmFjayh0LCBlcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgZXJyb3JDYWxsYmFjayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlcnJvckNhbGxiYWNrKHQsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH0sIGVycm9yQ2FsbGJhY2spO1xufVxuXG5mdW5jdGlvbiBnZXRJdGVtJDEoa2V5LCBjYWxsYmFjaykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGtleSA9IG5vcm1hbGl6ZUtleShrZXkpO1xuXG4gICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSQxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGRiSW5mbyA9IHNlbGYuX2RiSW5mbztcbiAgICAgICAgICAgIGRiSW5mby5kYi50cmFuc2FjdGlvbihmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgICAgIHRyeUV4ZWN1dGVTcWwodCwgZGJJbmZvLCAnU0VMRUNUICogRlJPTSAnICsgZGJJbmZvLnN0b3JlTmFtZSArICcgV0hFUkUga2V5ID0gPyBMSU1JVCAxJywgW2tleV0sIGZ1bmN0aW9uICh0LCByZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSByZXN1bHRzLnJvd3MubGVuZ3RoID8gcmVzdWx0cy5yb3dzLml0ZW0oMCkudmFsdWUgOiBudWxsO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiB0aGlzIGlzIHNlcmlhbGl6ZWQgY29udGVudCB3ZSBuZWVkIHRvXG4gICAgICAgICAgICAgICAgICAgIC8vIHVucGFjay5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZGJJbmZvLnNlcmlhbGl6ZXIuZGVzZXJpYWxpemUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAodCwgZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVtcImNhdGNoXCJdKHJlamVjdCk7XG4gICAgfSk7XG5cbiAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG5mdW5jdGlvbiBpdGVyYXRlJDEoaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSQxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGRiSW5mbyA9IHNlbGYuX2RiSW5mbztcblxuICAgICAgICAgICAgZGJJbmZvLmRiLnRyYW5zYWN0aW9uKGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICAgICAgdHJ5RXhlY3V0ZVNxbCh0LCBkYkluZm8sICdTRUxFQ1QgKiBGUk9NICcgKyBkYkluZm8uc3RvcmVOYW1lLCBbXSwgZnVuY3Rpb24gKHQsIHJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJvd3MgPSByZXN1bHRzLnJvd3M7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsZW5ndGggPSByb3dzLmxlbmd0aDtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHJvd3MuaXRlbShpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBpdGVtLnZhbHVlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayB0byBzZWUgaWYgdGhpcyBpcyBzZXJpYWxpemVkIGNvbnRlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlIG5lZWQgdG8gdW5wYWNrLlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGRiSW5mby5zZXJpYWxpemVyLmRlc2VyaWFsaXplKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGl0ZXJhdG9yKHJlc3VsdCwgaXRlbS5rZXksIGkgKyAxKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdm9pZCgwKSBwcmV2ZW50cyBwcm9ibGVtcyB3aXRoIHJlZGVmaW5pdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gb2YgYHVuZGVmaW5lZGAuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICE9PSB2b2lkIDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICh0LCBlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pW1wiY2F0Y2hcIl0ocmVqZWN0KTtcbiAgICB9KTtcblxuICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cbmZ1bmN0aW9uIF9zZXRJdGVtKGtleSwgdmFsdWUsIGNhbGxiYWNrLCByZXRyaWVzTGVmdCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGtleSA9IG5vcm1hbGl6ZUtleShrZXkpO1xuXG4gICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSQxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gVGhlIGxvY2FsU3RvcmFnZSBBUEkgZG9lc24ndCByZXR1cm4gdW5kZWZpbmVkIHZhbHVlcyBpbiBhblxuICAgICAgICAgICAgLy8gXCJleHBlY3RlZFwiIHdheSwgc28gdW5kZWZpbmVkIGlzIGFsd2F5cyBjYXN0IHRvIG51bGwgaW4gYWxsXG4gICAgICAgICAgICAvLyBkcml2ZXJzLiBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9tb3ppbGxhL2xvY2FsRm9yYWdlL3B1bGwvNDJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTYXZlIHRoZSBvcmlnaW5hbCB2YWx1ZSB0byBwYXNzIHRvIHRoZSBjYWxsYmFjay5cbiAgICAgICAgICAgIHZhciBvcmlnaW5hbFZhbHVlID0gdmFsdWU7XG5cbiAgICAgICAgICAgIHZhciBkYkluZm8gPSBzZWxmLl9kYkluZm87XG4gICAgICAgICAgICBkYkluZm8uc2VyaWFsaXplci5zZXJpYWxpemUodmFsdWUsIGZ1bmN0aW9uICh2YWx1ZSwgZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkYkluZm8uZGIudHJhbnNhY3Rpb24oZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeUV4ZWN1dGVTcWwodCwgZGJJbmZvLCAnSU5TRVJUIE9SIFJFUExBQ0UgSU5UTyAnICsgZGJJbmZvLnN0b3JlTmFtZSArICcgJyArICcoa2V5LCB2YWx1ZSkgVkFMVUVTICg/LCA/KScsIFtrZXksIHZhbHVlXSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUob3JpZ2luYWxWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAodCwgZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChzcWxFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIHRyYW5zYWN0aW9uIGZhaWxlZDsgY2hlY2tcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRvIHNlZSBpZiBpdCdzIGEgcXVvdGEgZXJyb3IuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3FsRXJyb3IuY29kZSA9PT0gc3FsRXJyb3IuUVVPVEFfRVJSKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2UgcmVqZWN0IHRoZSBjYWxsYmFjayBvdXRyaWdodCBmb3Igbm93LCBidXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpdCdzIHdvcnRoIHRyeWluZyB0byByZS1ydW4gdGhlIHRyYW5zYWN0aW9uLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEV2ZW4gaWYgdGhlIHVzZXIgYWNjZXB0cyB0aGUgcHJvbXB0IHRvIHVzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1vcmUgc3RvcmFnZSBvbiBTYWZhcmksIHRoaXMgZXJyb3Igd2lsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJlIGNhbGxlZC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRyeSB0byByZS1ydW4gdGhlIHRyYW5zYWN0aW9uLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXRyaWVzTGVmdCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShfc2V0SXRlbS5hcHBseShzZWxmLCBba2V5LCBvcmlnaW5hbFZhbHVlLCBjYWxsYmFjaywgcmV0cmllc0xlZnQgLSAxXSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChzcWxFcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVtcImNhdGNoXCJdKHJlamVjdCk7XG4gICAgfSk7XG5cbiAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG5mdW5jdGlvbiBzZXRJdGVtJDEoa2V5LCB2YWx1ZSwgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gX3NldEl0ZW0uYXBwbHkodGhpcywgW2tleSwgdmFsdWUsIGNhbGxiYWNrLCAxXSk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUl0ZW0kMShrZXksIGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAga2V5ID0gbm9ybWFsaXplS2V5KGtleSk7XG5cbiAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZGJJbmZvID0gc2VsZi5fZGJJbmZvO1xuICAgICAgICAgICAgZGJJbmZvLmRiLnRyYW5zYWN0aW9uKGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICAgICAgdHJ5RXhlY3V0ZVNxbCh0LCBkYkluZm8sICdERUxFVEUgRlJPTSAnICsgZGJJbmZvLnN0b3JlTmFtZSArICcgV0hFUkUga2V5ID0gPycsIFtrZXldLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAodCwgZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVtcImNhdGNoXCJdKHJlamVjdCk7XG4gICAgfSk7XG5cbiAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG4vLyBEZWxldGVzIGV2ZXJ5IGl0ZW0gaW4gdGhlIHRhYmxlLlxuLy8gVE9ETzogRmluZCBvdXQgaWYgdGhpcyByZXNldHMgdGhlIEFVVE9fSU5DUkVNRU5UIG51bWJlci5cbmZ1bmN0aW9uIGNsZWFyJDEoY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZGJJbmZvID0gc2VsZi5fZGJJbmZvO1xuICAgICAgICAgICAgZGJJbmZvLmRiLnRyYW5zYWN0aW9uKGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICAgICAgdHJ5RXhlY3V0ZVNxbCh0LCBkYkluZm8sICdERUxFVEUgRlJPTSAnICsgZGJJbmZvLnN0b3JlTmFtZSwgW10sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICh0LCBlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pW1wiY2F0Y2hcIl0ocmVqZWN0KTtcbiAgICB9KTtcblxuICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cbi8vIERvZXMgYSBzaW1wbGUgYENPVU5UKGtleSlgIHRvIGdldCB0aGUgbnVtYmVyIG9mIGl0ZW1zIHN0b3JlZCBpblxuLy8gbG9jYWxGb3JhZ2UuXG5mdW5jdGlvbiBsZW5ndGgkMShjYWxsYmFjaykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UkMShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBkYkluZm8gPSBzZWxmLl9kYkluZm87XG4gICAgICAgICAgICBkYkluZm8uZGIudHJhbnNhY3Rpb24oZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgICAgICAvLyBBaGhoLCBTUUwgbWFrZXMgdGhpcyBvbmUgc29vb29vbyBlYXN5LlxuICAgICAgICAgICAgICAgIHRyeUV4ZWN1dGVTcWwodCwgZGJJbmZvLCAnU0VMRUNUIENPVU5UKGtleSkgYXMgYyBGUk9NICcgKyBkYkluZm8uc3RvcmVOYW1lLCBbXSwgZnVuY3Rpb24gKHQsIHJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHJlc3VsdHMucm93cy5pdGVtKDApLmM7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAodCwgZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVtcImNhdGNoXCJdKHJlamVjdCk7XG4gICAgfSk7XG5cbiAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG4vLyBSZXR1cm4gdGhlIGtleSBsb2NhdGVkIGF0IGtleSBpbmRleCBYOyBlc3NlbnRpYWxseSBnZXRzIHRoZSBrZXkgZnJvbSBhXG4vLyBgV0hFUkUgaWQgPSA/YC4gVGhpcyBpcyB0aGUgbW9zdCBlZmZpY2llbnQgd2F5IEkgY2FuIHRoaW5rIHRvIGltcGxlbWVudFxuLy8gdGhpcyByYXJlbHktdXNlZCAoaW4gbXkgZXhwZXJpZW5jZSkgcGFydCBvZiB0aGUgQVBJLCBidXQgaXQgY2FuIHNlZW1cbi8vIGluY29uc2lzdGVudCwgYmVjYXVzZSB3ZSBkbyBgSU5TRVJUIE9SIFJFUExBQ0UgSU5UT2Agb24gYHNldEl0ZW0oKWAsIHNvXG4vLyB0aGUgSUQgb2YgZWFjaCBrZXkgd2lsbCBjaGFuZ2UgZXZlcnkgdGltZSBpdCdzIHVwZGF0ZWQuIFBlcmhhcHMgYSBzdG9yZWRcbi8vIHByb2NlZHVyZSBmb3IgdGhlIGBzZXRJdGVtKClgIFNRTCB3b3VsZCBzb2x2ZSB0aGlzIHByb2JsZW0/XG4vLyBUT0RPOiBEb24ndCBjaGFuZ2UgSUQgb24gYHNldEl0ZW0oKWAuXG5mdW5jdGlvbiBrZXkkMShuLCBjYWxsYmFjaykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UkMShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBkYkluZm8gPSBzZWxmLl9kYkluZm87XG4gICAgICAgICAgICBkYkluZm8uZGIudHJhbnNhY3Rpb24oZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgICAgICB0cnlFeGVjdXRlU3FsKHQsIGRiSW5mbywgJ1NFTEVDVCBrZXkgRlJPTSAnICsgZGJJbmZvLnN0b3JlTmFtZSArICcgV0hFUkUgaWQgPSA/IExJTUlUIDEnLCBbbiArIDFdLCBmdW5jdGlvbiAodCwgcmVzdWx0cykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gcmVzdWx0cy5yb3dzLmxlbmd0aCA/IHJlc3VsdHMucm93cy5pdGVtKDApLmtleSA6IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAodCwgZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVtcImNhdGNoXCJdKHJlamVjdCk7XG4gICAgfSk7XG5cbiAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG5mdW5jdGlvbiBrZXlzJDEoY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZGJJbmZvID0gc2VsZi5fZGJJbmZvO1xuICAgICAgICAgICAgZGJJbmZvLmRiLnRyYW5zYWN0aW9uKGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICAgICAgdHJ5RXhlY3V0ZVNxbCh0LCBkYkluZm8sICdTRUxFQ1Qga2V5IEZST00gJyArIGRiSW5mby5zdG9yZU5hbWUsIFtdLCBmdW5jdGlvbiAodCwgcmVzdWx0cykge1xuICAgICAgICAgICAgICAgICAgICB2YXIga2V5cyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVzdWx0cy5yb3dzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXlzLnB1c2gocmVzdWx0cy5yb3dzLml0ZW0oaSkua2V5KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoa2V5cyk7XG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHQsIGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlbXCJjYXRjaFwiXShyZWplY3QpO1xuICAgIH0pO1xuXG4gICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuLy8gaHR0cHM6Ly93d3cudzMub3JnL1RSL3dlYmRhdGFiYXNlLyNkYXRhYmFzZXNcbi8vID4gVGhlcmUgaXMgbm8gd2F5IHRvIGVudW1lcmF0ZSBvciBkZWxldGUgdGhlIGRhdGFiYXNlcyBhdmFpbGFibGUgZm9yIGFuIG9yaWdpbiBmcm9tIHRoaXMgQVBJLlxuZnVuY3Rpb24gZ2V0QWxsU3RvcmVOYW1lcyhkYikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSQxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZGIudHJhbnNhY3Rpb24oZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIHQuZXhlY3V0ZVNxbCgnU0VMRUNUIG5hbWUgRlJPTSBzcWxpdGVfbWFzdGVyICcgKyBcIldIRVJFIHR5cGU9J3RhYmxlJyBBTkQgbmFtZSA8PiAnX19XZWJLaXREYXRhYmFzZUluZm9UYWJsZV9fJ1wiLCBbXSwgZnVuY3Rpb24gKHQsIHJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RvcmVOYW1lcyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXN1bHRzLnJvd3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgc3RvcmVOYW1lcy5wdXNoKHJlc3VsdHMucm93cy5pdGVtKGkpLm5hbWUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICBkYjogZGIsXG4gICAgICAgICAgICAgICAgICAgIHN0b3JlTmFtZXM6IHN0b3JlTmFtZXNcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICh0LCBlcnJvcikge1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKHNxbEVycm9yKSB7XG4gICAgICAgICAgICByZWplY3Qoc3FsRXJyb3IpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gZHJvcEluc3RhbmNlJDEob3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICBjYWxsYmFjayA9IGdldENhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICB2YXIgY3VycmVudENvbmZpZyA9IHRoaXMuY29uZmlnKCk7XG4gICAgb3B0aW9ucyA9IHR5cGVvZiBvcHRpb25zICE9PSAnZnVuY3Rpb24nICYmIG9wdGlvbnMgfHwge307XG4gICAgaWYgKCFvcHRpb25zLm5hbWUpIHtcbiAgICAgICAgb3B0aW9ucy5uYW1lID0gb3B0aW9ucy5uYW1lIHx8IGN1cnJlbnRDb25maWcubmFtZTtcbiAgICAgICAgb3B0aW9ucy5zdG9yZU5hbWUgPSBvcHRpb25zLnN0b3JlTmFtZSB8fCBjdXJyZW50Q29uZmlnLnN0b3JlTmFtZTtcbiAgICB9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHByb21pc2U7XG4gICAgaWYgKCFvcHRpb25zLm5hbWUpIHtcbiAgICAgICAgcHJvbWlzZSA9IFByb21pc2UkMS5yZWplY3QoJ0ludmFsaWQgYXJndW1lbnRzJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcHJvbWlzZSA9IG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICAgICAgICAgIHZhciBkYjtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLm5hbWUgPT09IGN1cnJlbnRDb25maWcubmFtZSkge1xuICAgICAgICAgICAgICAgIC8vIHVzZSB0aGUgZGIgcmVmZXJlbmNlIG9mIHRoZSBjdXJyZW50IGluc3RhbmNlXG4gICAgICAgICAgICAgICAgZGIgPSBzZWxmLl9kYkluZm8uZGI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRiID0gb3BlbkRhdGFiYXNlKG9wdGlvbnMubmFtZSwgJycsICcnLCAwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFvcHRpb25zLnN0b3JlTmFtZSkge1xuICAgICAgICAgICAgICAgIC8vIGRyb3AgYWxsIGRhdGFiYXNlIHRhYmxlc1xuICAgICAgICAgICAgICAgIHJlc29sdmUoZ2V0QWxsU3RvcmVOYW1lcyhkYikpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgZGI6IGRiLFxuICAgICAgICAgICAgICAgICAgICBzdG9yZU5hbWVzOiBbb3B0aW9ucy5zdG9yZU5hbWVdXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKG9wZXJhdGlvbkluZm8pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSQxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb25JbmZvLmRiLnRyYW5zYWN0aW9uKGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGRyb3BUYWJsZShzdG9yZU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSQxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0LmV4ZWN1dGVTcWwoJ0RST1AgVEFCTEUgSUYgRVhJU1RTICcgKyBzdG9yZU5hbWUsIFtdLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAodCwgZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIG9wZXJhdGlvbnMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IG9wZXJhdGlvbkluZm8uc3RvcmVOYW1lcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3BlcmF0aW9ucy5wdXNoKGRyb3BUYWJsZShvcGVyYXRpb25JbmZvLnN0b3JlTmFtZXNbaV0pKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIFByb21pc2UkMS5hbGwob3BlcmF0aW9ucykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pW1wiY2F0Y2hcIl0oZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHNxbEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChzcWxFcnJvcik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxudmFyIHdlYlNRTFN0b3JhZ2UgPSB7XG4gICAgX2RyaXZlcjogJ3dlYlNRTFN0b3JhZ2UnLFxuICAgIF9pbml0U3RvcmFnZTogX2luaXRTdG9yYWdlJDEsXG4gICAgX3N1cHBvcnQ6IGlzV2ViU1FMVmFsaWQoKSxcbiAgICBpdGVyYXRlOiBpdGVyYXRlJDEsXG4gICAgZ2V0SXRlbTogZ2V0SXRlbSQxLFxuICAgIHNldEl0ZW06IHNldEl0ZW0kMSxcbiAgICByZW1vdmVJdGVtOiByZW1vdmVJdGVtJDEsXG4gICAgY2xlYXI6IGNsZWFyJDEsXG4gICAgbGVuZ3RoOiBsZW5ndGgkMSxcbiAgICBrZXk6IGtleSQxLFxuICAgIGtleXM6IGtleXMkMSxcbiAgICBkcm9wSW5zdGFuY2U6IGRyb3BJbnN0YW5jZSQxXG59O1xuXG5mdW5jdGlvbiBpc0xvY2FsU3RvcmFnZVZhbGlkKCkge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB0eXBlb2YgbG9jYWxTdG9yYWdlICE9PSAndW5kZWZpbmVkJyAmJiAnc2V0SXRlbScgaW4gbG9jYWxTdG9yYWdlICYmXG4gICAgICAgIC8vIGluIElFOCB0eXBlb2YgbG9jYWxTdG9yYWdlLnNldEl0ZW0gPT09ICdvYmplY3QnXG4gICAgICAgICEhbG9jYWxTdG9yYWdlLnNldEl0ZW07XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBfZ2V0S2V5UHJlZml4KG9wdGlvbnMsIGRlZmF1bHRDb25maWcpIHtcbiAgICB2YXIga2V5UHJlZml4ID0gb3B0aW9ucy5uYW1lICsgJy8nO1xuXG4gICAgaWYgKG9wdGlvbnMuc3RvcmVOYW1lICE9PSBkZWZhdWx0Q29uZmlnLnN0b3JlTmFtZSkge1xuICAgICAgICBrZXlQcmVmaXggKz0gb3B0aW9ucy5zdG9yZU5hbWUgKyAnLyc7XG4gICAgfVxuICAgIHJldHVybiBrZXlQcmVmaXg7XG59XG5cbi8vIENoZWNrIGlmIGxvY2FsU3RvcmFnZSB0aHJvd3Mgd2hlbiBzYXZpbmcgYW4gaXRlbVxuZnVuY3Rpb24gY2hlY2tJZkxvY2FsU3RvcmFnZVRocm93cygpIHtcbiAgICB2YXIgbG9jYWxTdG9yYWdlVGVzdEtleSA9ICdfbG9jYWxmb3JhZ2Vfc3VwcG9ydF90ZXN0JztcblxuICAgIHRyeSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGxvY2FsU3RvcmFnZVRlc3RLZXksIHRydWUpO1xuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShsb2NhbFN0b3JhZ2VUZXN0S2V5KTtcblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59XG5cbi8vIENoZWNrIGlmIGxvY2FsU3RvcmFnZSBpcyB1c2FibGUgYW5kIGFsbG93cyB0byBzYXZlIGFuIGl0ZW1cbi8vIFRoaXMgbWV0aG9kIGNoZWNrcyBpZiBsb2NhbFN0b3JhZ2UgaXMgdXNhYmxlIGluIFNhZmFyaSBQcml2YXRlIEJyb3dzaW5nXG4vLyBtb2RlLCBvciBpbiBhbnkgb3RoZXIgY2FzZSB3aGVyZSB0aGUgYXZhaWxhYmxlIHF1b3RhIGZvciBsb2NhbFN0b3JhZ2Vcbi8vIGlzIDAgYW5kIHRoZXJlIHdhc24ndCBhbnkgc2F2ZWQgaXRlbXMgeWV0LlxuZnVuY3Rpb24gX2lzTG9jYWxTdG9yYWdlVXNhYmxlKCkge1xuICAgIHJldHVybiAhY2hlY2tJZkxvY2FsU3RvcmFnZVRocm93cygpIHx8IGxvY2FsU3RvcmFnZS5sZW5ndGggPiAwO1xufVxuXG4vLyBDb25maWcgdGhlIGxvY2FsU3RvcmFnZSBiYWNrZW5kLCB1c2luZyBvcHRpb25zIHNldCBpbiB0aGUgY29uZmlnLlxuZnVuY3Rpb24gX2luaXRTdG9yYWdlJDIob3B0aW9ucykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZGJJbmZvID0ge307XG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgICAgZm9yICh2YXIgaSBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICBkYkluZm9baV0gPSBvcHRpb25zW2ldO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGJJbmZvLmtleVByZWZpeCA9IF9nZXRLZXlQcmVmaXgob3B0aW9ucywgc2VsZi5fZGVmYXVsdENvbmZpZyk7XG5cbiAgICBpZiAoIV9pc0xvY2FsU3RvcmFnZVVzYWJsZSgpKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlJDEucmVqZWN0KCk7XG4gICAgfVxuXG4gICAgc2VsZi5fZGJJbmZvID0gZGJJbmZvO1xuICAgIGRiSW5mby5zZXJpYWxpemVyID0gbG9jYWxmb3JhZ2VTZXJpYWxpemVyO1xuXG4gICAgcmV0dXJuIFByb21pc2UkMS5yZXNvbHZlKCk7XG59XG5cbi8vIFJlbW92ZSBhbGwga2V5cyBmcm9tIHRoZSBkYXRhc3RvcmUsIGVmZmVjdGl2ZWx5IGRlc3Ryb3lpbmcgYWxsIGRhdGEgaW5cbi8vIHRoZSBhcHAncyBrZXkvdmFsdWUgc3RvcmUhXG5mdW5jdGlvbiBjbGVhciQyKGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBwcm9taXNlID0gc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIga2V5UHJlZml4ID0gc2VsZi5fZGJJbmZvLmtleVByZWZpeDtcblxuICAgICAgICBmb3IgKHZhciBpID0gbG9jYWxTdG9yYWdlLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICB2YXIga2V5ID0gbG9jYWxTdG9yYWdlLmtleShpKTtcblxuICAgICAgICAgICAgaWYgKGtleS5pbmRleE9mKGtleVByZWZpeCkgPT09IDApIHtcbiAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG4vLyBSZXRyaWV2ZSBhbiBpdGVtIGZyb20gdGhlIHN0b3JlLiBVbmxpa2UgdGhlIG9yaWdpbmFsIGFzeW5jX3N0b3JhZ2Vcbi8vIGxpYnJhcnkgaW4gR2FpYSwgd2UgZG9uJ3QgbW9kaWZ5IHJldHVybiB2YWx1ZXMgYXQgYWxsLiBJZiBhIGtleSdzIHZhbHVlXG4vLyBpcyBgdW5kZWZpbmVkYCwgd2UgcGFzcyB0aGF0IHZhbHVlIHRvIHRoZSBjYWxsYmFjayBmdW5jdGlvbi5cbmZ1bmN0aW9uIGdldEl0ZW0kMihrZXksIGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAga2V5ID0gbm9ybWFsaXplS2V5KGtleSk7XG5cbiAgICB2YXIgcHJvbWlzZSA9IHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGRiSW5mbyA9IHNlbGYuX2RiSW5mbztcbiAgICAgICAgdmFyIHJlc3VsdCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKGRiSW5mby5rZXlQcmVmaXggKyBrZXkpO1xuXG4gICAgICAgIC8vIElmIGEgcmVzdWx0IHdhcyBmb3VuZCwgcGFyc2UgaXQgZnJvbSB0aGUgc2VyaWFsaXplZFxuICAgICAgICAvLyBzdHJpbmcgaW50byBhIEpTIG9iamVjdC4gSWYgcmVzdWx0IGlzbid0IHRydXRoeSwgdGhlIGtleVxuICAgICAgICAvLyBpcyBsaWtlbHkgdW5kZWZpbmVkIGFuZCB3ZSdsbCBwYXNzIGl0IHN0cmFpZ2h0IHRvIHRoZVxuICAgICAgICAvLyBjYWxsYmFjay5cbiAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgcmVzdWx0ID0gZGJJbmZvLnNlcmlhbGl6ZXIuZGVzZXJpYWxpemUocmVzdWx0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSk7XG5cbiAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG4vLyBJdGVyYXRlIG92ZXIgYWxsIGl0ZW1zIGluIHRoZSBzdG9yZS5cbmZ1bmN0aW9uIGl0ZXJhdGUkMihpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgcHJvbWlzZSA9IHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGRiSW5mbyA9IHNlbGYuX2RiSW5mbztcbiAgICAgICAgdmFyIGtleVByZWZpeCA9IGRiSW5mby5rZXlQcmVmaXg7XG4gICAgICAgIHZhciBrZXlQcmVmaXhMZW5ndGggPSBrZXlQcmVmaXgubGVuZ3RoO1xuICAgICAgICB2YXIgbGVuZ3RoID0gbG9jYWxTdG9yYWdlLmxlbmd0aDtcblxuICAgICAgICAvLyBXZSB1c2UgYSBkZWRpY2F0ZWQgaXRlcmF0b3IgaW5zdGVhZCBvZiB0aGUgYGlgIHZhcmlhYmxlIGJlbG93XG4gICAgICAgIC8vIHNvIG90aGVyIGtleXMgd2UgZmV0Y2ggaW4gbG9jYWxTdG9yYWdlIGFyZW4ndCBjb3VudGVkIGluXG4gICAgICAgIC8vIHRoZSBgaXRlcmF0aW9uTnVtYmVyYCBhcmd1bWVudCBwYXNzZWQgdG8gdGhlIGBpdGVyYXRlKClgXG4gICAgICAgIC8vIGNhbGxiYWNrLlxuICAgICAgICAvL1xuICAgICAgICAvLyBTZWU6IGdpdGh1Yi5jb20vbW96aWxsYS9sb2NhbEZvcmFnZS9wdWxsLzQzNSNkaXNjdXNzaW9uX3IzODA2MTUzMFxuICAgICAgICB2YXIgaXRlcmF0aW9uTnVtYmVyID0gMTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIga2V5ID0gbG9jYWxTdG9yYWdlLmtleShpKTtcbiAgICAgICAgICAgIGlmIChrZXkuaW5kZXhPZihrZXlQcmVmaXgpICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpO1xuXG4gICAgICAgICAgICAvLyBJZiBhIHJlc3VsdCB3YXMgZm91bmQsIHBhcnNlIGl0IGZyb20gdGhlIHNlcmlhbGl6ZWRcbiAgICAgICAgICAgIC8vIHN0cmluZyBpbnRvIGEgSlMgb2JqZWN0LiBJZiByZXN1bHQgaXNuJ3QgdHJ1dGh5LCB0aGVcbiAgICAgICAgICAgIC8vIGtleSBpcyBsaWtlbHkgdW5kZWZpbmVkIGFuZCB3ZSdsbCBwYXNzIGl0IHN0cmFpZ2h0XG4gICAgICAgICAgICAvLyB0byB0aGUgaXRlcmF0b3IuXG4gICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGRiSW5mby5zZXJpYWxpemVyLmRlc2VyaWFsaXplKHZhbHVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFsdWUgPSBpdGVyYXRvcih2YWx1ZSwga2V5LnN1YnN0cmluZyhrZXlQcmVmaXhMZW5ndGgpLCBpdGVyYXRpb25OdW1iZXIrKyk7XG5cbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG4vLyBTYW1lIGFzIGxvY2FsU3RvcmFnZSdzIGtleSgpIG1ldGhvZCwgZXhjZXB0IHRha2VzIGEgY2FsbGJhY2suXG5mdW5jdGlvbiBrZXkkMihuLCBjYWxsYmFjaykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgcHJvbWlzZSA9IHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGRiSW5mbyA9IHNlbGYuX2RiSW5mbztcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJlc3VsdCA9IGxvY2FsU3RvcmFnZS5rZXkobik7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBwcmVmaXggZnJvbSB0aGUga2V5LCBpZiBhIGtleSBpcyBmb3VuZC5cbiAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnN1YnN0cmluZyhkYkluZm8ua2V5UHJlZml4Lmxlbmd0aCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0pO1xuXG4gICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuZnVuY3Rpb24ga2V5cyQyKGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBwcm9taXNlID0gc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZGJJbmZvID0gc2VsZi5fZGJJbmZvO1xuICAgICAgICB2YXIgbGVuZ3RoID0gbG9jYWxTdG9yYWdlLmxlbmd0aDtcbiAgICAgICAgdmFyIGtleXMgPSBbXTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgaXRlbUtleSA9IGxvY2FsU3RvcmFnZS5rZXkoaSk7XG4gICAgICAgICAgICBpZiAoaXRlbUtleS5pbmRleE9mKGRiSW5mby5rZXlQcmVmaXgpID09PSAwKSB7XG4gICAgICAgICAgICAgICAga2V5cy5wdXNoKGl0ZW1LZXkuc3Vic3RyaW5nKGRiSW5mby5rZXlQcmVmaXgubGVuZ3RoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ga2V5cztcbiAgICB9KTtcblxuICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cbi8vIFN1cHBseSB0aGUgbnVtYmVyIG9mIGtleXMgaW4gdGhlIGRhdGFzdG9yZSB0byB0aGUgY2FsbGJhY2sgZnVuY3Rpb24uXG5mdW5jdGlvbiBsZW5ndGgkMihjYWxsYmFjaykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgcHJvbWlzZSA9IHNlbGYua2V5cygpLnRoZW4oZnVuY3Rpb24gKGtleXMpIHtcbiAgICAgICAgcmV0dXJuIGtleXMubGVuZ3RoO1xuICAgIH0pO1xuXG4gICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuLy8gUmVtb3ZlIGFuIGl0ZW0gZnJvbSB0aGUgc3RvcmUsIG5pY2UgYW5kIHNpbXBsZS5cbmZ1bmN0aW9uIHJlbW92ZUl0ZW0kMihrZXksIGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAga2V5ID0gbm9ybWFsaXplS2V5KGtleSk7XG5cbiAgICB2YXIgcHJvbWlzZSA9IHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGRiSW5mbyA9IHNlbGYuX2RiSW5mbztcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oZGJJbmZvLmtleVByZWZpeCArIGtleSk7XG4gICAgfSk7XG5cbiAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG4vLyBTZXQgYSBrZXkncyB2YWx1ZSBhbmQgcnVuIGFuIG9wdGlvbmFsIGNhbGxiYWNrIG9uY2UgdGhlIHZhbHVlIGlzIHNldC5cbi8vIFVubGlrZSBHYWlhJ3MgaW1wbGVtZW50YXRpb24sIHRoZSBjYWxsYmFjayBmdW5jdGlvbiBpcyBwYXNzZWQgdGhlIHZhbHVlLFxuLy8gaW4gY2FzZSB5b3Ugd2FudCB0byBvcGVyYXRlIG9uIHRoYXQgdmFsdWUgb25seSBhZnRlciB5b3UncmUgc3VyZSBpdFxuLy8gc2F2ZWQsIG9yIHNvbWV0aGluZyBsaWtlIHRoYXQuXG5mdW5jdGlvbiBzZXRJdGVtJDIoa2V5LCB2YWx1ZSwgY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBrZXkgPSBub3JtYWxpemVLZXkoa2V5KTtcblxuICAgIHZhciBwcm9taXNlID0gc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBDb252ZXJ0IHVuZGVmaW5lZCB2YWx1ZXMgdG8gbnVsbC5cbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL21vemlsbGEvbG9jYWxGb3JhZ2UvcHVsbC80MlxuICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdmFsdWUgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2F2ZSB0aGUgb3JpZ2luYWwgdmFsdWUgdG8gcGFzcyB0byB0aGUgY2FsbGJhY2suXG4gICAgICAgIHZhciBvcmlnaW5hbFZhbHVlID0gdmFsdWU7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgdmFyIGRiSW5mbyA9IHNlbGYuX2RiSW5mbztcbiAgICAgICAgICAgIGRiSW5mby5zZXJpYWxpemVyLnNlcmlhbGl6ZSh2YWx1ZSwgZnVuY3Rpb24gKHZhbHVlLCBlcnJvcikge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShkYkluZm8ua2V5UHJlZml4ICsga2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG9yaWdpbmFsVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBsb2NhbFN0b3JhZ2UgY2FwYWNpdHkgZXhjZWVkZWQuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBNYWtlIHRoaXMgYSBzcGVjaWZpYyBlcnJvci9ldmVudC5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlLm5hbWUgPT09ICdRdW90YUV4Y2VlZGVkRXJyb3InIHx8IGUubmFtZSA9PT0gJ05TX0VSUk9SX0RPTV9RVU9UQV9SRUFDSEVEJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cbmZ1bmN0aW9uIGRyb3BJbnN0YW5jZSQyKG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgY2FsbGJhY2sgPSBnZXRDYWxsYmFjay5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgb3B0aW9ucyA9IHR5cGVvZiBvcHRpb25zICE9PSAnZnVuY3Rpb24nICYmIG9wdGlvbnMgfHwge307XG4gICAgaWYgKCFvcHRpb25zLm5hbWUpIHtcbiAgICAgICAgdmFyIGN1cnJlbnRDb25maWcgPSB0aGlzLmNvbmZpZygpO1xuICAgICAgICBvcHRpb25zLm5hbWUgPSBvcHRpb25zLm5hbWUgfHwgY3VycmVudENvbmZpZy5uYW1lO1xuICAgICAgICBvcHRpb25zLnN0b3JlTmFtZSA9IG9wdGlvbnMuc3RvcmVOYW1lIHx8IGN1cnJlbnRDb25maWcuc3RvcmVOYW1lO1xuICAgIH1cblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgcHJvbWlzZTtcbiAgICBpZiAoIW9wdGlvbnMubmFtZSkge1xuICAgICAgICBwcm9taXNlID0gUHJvbWlzZSQxLnJlamVjdCgnSW52YWxpZCBhcmd1bWVudHMnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBwcm9taXNlID0gbmV3IFByb21pc2UkMShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgICAgICAgICAgaWYgKCFvcHRpb25zLnN0b3JlTmFtZSkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUob3B0aW9ucy5uYW1lICsgJy8nKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShfZ2V0S2V5UHJlZml4KG9wdGlvbnMsIHNlbGYuX2RlZmF1bHRDb25maWcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoa2V5UHJlZml4KSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gbG9jYWxTdG9yYWdlLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICAgICAgdmFyIGtleSA9IGxvY2FsU3RvcmFnZS5rZXkoaSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoa2V5LmluZGV4T2Yoa2V5UHJlZml4KSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxudmFyIGxvY2FsU3RvcmFnZVdyYXBwZXIgPSB7XG4gICAgX2RyaXZlcjogJ2xvY2FsU3RvcmFnZVdyYXBwZXInLFxuICAgIF9pbml0U3RvcmFnZTogX2luaXRTdG9yYWdlJDIsXG4gICAgX3N1cHBvcnQ6IGlzTG9jYWxTdG9yYWdlVmFsaWQoKSxcbiAgICBpdGVyYXRlOiBpdGVyYXRlJDIsXG4gICAgZ2V0SXRlbTogZ2V0SXRlbSQyLFxuICAgIHNldEl0ZW06IHNldEl0ZW0kMixcbiAgICByZW1vdmVJdGVtOiByZW1vdmVJdGVtJDIsXG4gICAgY2xlYXI6IGNsZWFyJDIsXG4gICAgbGVuZ3RoOiBsZW5ndGgkMixcbiAgICBrZXk6IGtleSQyLFxuICAgIGtleXM6IGtleXMkMixcbiAgICBkcm9wSW5zdGFuY2U6IGRyb3BJbnN0YW5jZSQyXG59O1xuXG52YXIgc2FtZVZhbHVlID0gZnVuY3Rpb24gc2FtZVZhbHVlKHgsIHkpIHtcbiAgICByZXR1cm4geCA9PT0geSB8fCB0eXBlb2YgeCA9PT0gJ251bWJlcicgJiYgdHlwZW9mIHkgPT09ICdudW1iZXInICYmIGlzTmFOKHgpICYmIGlzTmFOKHkpO1xufTtcblxudmFyIGluY2x1ZGVzID0gZnVuY3Rpb24gaW5jbHVkZXMoYXJyYXksIHNlYXJjaEVsZW1lbnQpIHtcbiAgICB2YXIgbGVuID0gYXJyYXkubGVuZ3RoO1xuICAgIHZhciBpID0gMDtcbiAgICB3aGlsZSAoaSA8IGxlbikge1xuICAgICAgICBpZiAoc2FtZVZhbHVlKGFycmF5W2ldLCBzZWFyY2hFbGVtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaSsrO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoYXJnKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhcmcpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxuLy8gRHJpdmVycyBhcmUgc3RvcmVkIGhlcmUgd2hlbiBgZGVmaW5lRHJpdmVyKClgIGlzIGNhbGxlZC5cbi8vIFRoZXkgYXJlIHNoYXJlZCBhY3Jvc3MgYWxsIGluc3RhbmNlcyBvZiBsb2NhbEZvcmFnZS5cbnZhciBEZWZpbmVkRHJpdmVycyA9IHt9O1xuXG52YXIgRHJpdmVyU3VwcG9ydCA9IHt9O1xuXG52YXIgRGVmYXVsdERyaXZlcnMgPSB7XG4gICAgSU5ERVhFRERCOiBhc3luY1N0b3JhZ2UsXG4gICAgV0VCU1FMOiB3ZWJTUUxTdG9yYWdlLFxuICAgIExPQ0FMU1RPUkFHRTogbG9jYWxTdG9yYWdlV3JhcHBlclxufTtcblxudmFyIERlZmF1bHREcml2ZXJPcmRlciA9IFtEZWZhdWx0RHJpdmVycy5JTkRFWEVEREIuX2RyaXZlciwgRGVmYXVsdERyaXZlcnMuV0VCU1FMLl9kcml2ZXIsIERlZmF1bHREcml2ZXJzLkxPQ0FMU1RPUkFHRS5fZHJpdmVyXTtcblxudmFyIE9wdGlvbmFsRHJpdmVyTWV0aG9kcyA9IFsnZHJvcEluc3RhbmNlJ107XG5cbnZhciBMaWJyYXJ5TWV0aG9kcyA9IFsnY2xlYXInLCAnZ2V0SXRlbScsICdpdGVyYXRlJywgJ2tleScsICdrZXlzJywgJ2xlbmd0aCcsICdyZW1vdmVJdGVtJywgJ3NldEl0ZW0nXS5jb25jYXQoT3B0aW9uYWxEcml2ZXJNZXRob2RzKTtcblxudmFyIERlZmF1bHRDb25maWcgPSB7XG4gICAgZGVzY3JpcHRpb246ICcnLFxuICAgIGRyaXZlcjogRGVmYXVsdERyaXZlck9yZGVyLnNsaWNlKCksXG4gICAgbmFtZTogJ2xvY2FsZm9yYWdlJyxcbiAgICAvLyBEZWZhdWx0IERCIHNpemUgaXMgX0pVU1QgVU5ERVJfIDVNQiwgYXMgaXQncyB0aGUgaGlnaGVzdCBzaXplXG4gICAgLy8gd2UgY2FuIHVzZSB3aXRob3V0IGEgcHJvbXB0LlxuICAgIHNpemU6IDQ5ODA3MzYsXG4gICAgc3RvcmVOYW1lOiAna2V5dmFsdWVwYWlycycsXG4gICAgdmVyc2lvbjogMS4wXG59O1xuXG5mdW5jdGlvbiBjYWxsV2hlblJlYWR5KGxvY2FsRm9yYWdlSW5zdGFuY2UsIGxpYnJhcnlNZXRob2QpIHtcbiAgICBsb2NhbEZvcmFnZUluc3RhbmNlW2xpYnJhcnlNZXRob2RdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX2FyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgIHJldHVybiBsb2NhbEZvcmFnZUluc3RhbmNlLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gbG9jYWxGb3JhZ2VJbnN0YW5jZVtsaWJyYXJ5TWV0aG9kXS5hcHBseShsb2NhbEZvcmFnZUluc3RhbmNlLCBfYXJncyk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbmZ1bmN0aW9uIGV4dGVuZCgpIHtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgYXJnID0gYXJndW1lbnRzW2ldO1xuXG4gICAgICAgIGlmIChhcmcpIHtcbiAgICAgICAgICAgIGZvciAodmFyIF9rZXkgaW4gYXJnKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFyZy5oYXNPd25Qcm9wZXJ0eShfa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNBcnJheShhcmdbX2tleV0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmd1bWVudHNbMF1bX2tleV0gPSBhcmdbX2tleV0uc2xpY2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3VtZW50c1swXVtfa2V5XSA9IGFyZ1tfa2V5XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBhcmd1bWVudHNbMF07XG59XG5cbnZhciBMb2NhbEZvcmFnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBMb2NhbEZvcmFnZShvcHRpb25zKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBMb2NhbEZvcmFnZSk7XG5cbiAgICAgICAgZm9yICh2YXIgZHJpdmVyVHlwZUtleSBpbiBEZWZhdWx0RHJpdmVycykge1xuICAgICAgICAgICAgaWYgKERlZmF1bHREcml2ZXJzLmhhc093blByb3BlcnR5KGRyaXZlclR5cGVLZXkpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRyaXZlciA9IERlZmF1bHREcml2ZXJzW2RyaXZlclR5cGVLZXldO1xuICAgICAgICAgICAgICAgIHZhciBkcml2ZXJOYW1lID0gZHJpdmVyLl9kcml2ZXI7XG4gICAgICAgICAgICAgICAgdGhpc1tkcml2ZXJUeXBlS2V5XSA9IGRyaXZlck5hbWU7XG5cbiAgICAgICAgICAgICAgICBpZiAoIURlZmluZWREcml2ZXJzW2RyaXZlck5hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHdlIGRvbid0IG5lZWQgdG8gd2FpdCBmb3IgdGhlIHByb21pc2UsXG4gICAgICAgICAgICAgICAgICAgIC8vIHNpbmNlIHRoZSBkZWZhdWx0IGRyaXZlcnMgY2FuIGJlIGRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgLy8gaW4gYSBibG9ja2luZyBtYW5uZXJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWZpbmVEcml2ZXIoZHJpdmVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9kZWZhdWx0Q29uZmlnID0gZXh0ZW5kKHt9LCBEZWZhdWx0Q29uZmlnKTtcbiAgICAgICAgdGhpcy5fY29uZmlnID0gZXh0ZW5kKHt9LCB0aGlzLl9kZWZhdWx0Q29uZmlnLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5fZHJpdmVyU2V0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5faW5pdERyaXZlciA9IG51bGw7XG4gICAgICAgIHRoaXMuX3JlYWR5ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2RiSW5mbyA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5fd3JhcExpYnJhcnlNZXRob2RzV2l0aFJlYWR5KCk7XG4gICAgICAgIHRoaXMuc2V0RHJpdmVyKHRoaXMuX2NvbmZpZy5kcml2ZXIpW1wiY2F0Y2hcIl0oZnVuY3Rpb24gKCkge30pO1xuICAgIH1cblxuICAgIC8vIFNldCBhbnkgY29uZmlnIHZhbHVlcyBmb3IgbG9jYWxGb3JhZ2U7IGNhbiBiZSBjYWxsZWQgYW55dGltZSBiZWZvcmVcbiAgICAvLyB0aGUgZmlyc3QgQVBJIGNhbGwgKGUuZy4gYGdldEl0ZW1gLCBgc2V0SXRlbWApLlxuICAgIC8vIFdlIGxvb3AgdGhyb3VnaCBvcHRpb25zIHNvIHdlIGRvbid0IG92ZXJ3cml0ZSBleGlzdGluZyBjb25maWdcbiAgICAvLyB2YWx1ZXMuXG5cblxuICAgIExvY2FsRm9yYWdlLnByb3RvdHlwZS5jb25maWcgPSBmdW5jdGlvbiBjb25maWcob3B0aW9ucykge1xuICAgICAgICAvLyBJZiB0aGUgb3B0aW9ucyBhcmd1bWVudCBpcyBhbiBvYmplY3QsIHdlIHVzZSBpdCB0byBzZXQgdmFsdWVzLlxuICAgICAgICAvLyBPdGhlcndpc2UsIHdlIHJldHVybiBlaXRoZXIgYSBzcGVjaWZpZWQgY29uZmlnIHZhbHVlIG9yIGFsbFxuICAgICAgICAvLyBjb25maWcgdmFsdWVzLlxuICAgICAgICBpZiAoKHR5cGVvZiBvcHRpb25zID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZihvcHRpb25zKSkgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAvLyBJZiBsb2NhbGZvcmFnZSBpcyByZWFkeSBhbmQgZnVsbHkgaW5pdGlhbGl6ZWQsIHdlIGNhbid0IHNldFxuICAgICAgICAgICAgLy8gYW55IG5ldyBjb25maWd1cmF0aW9uIHZhbHVlcy4gSW5zdGVhZCwgd2UgcmV0dXJuIGFuIGVycm9yLlxuICAgICAgICAgICAgaWYgKHRoaXMuX3JlYWR5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBFcnJvcihcIkNhbid0IGNhbGwgY29uZmlnKCkgYWZ0ZXIgbG9jYWxmb3JhZ2UgXCIgKyAnaGFzIGJlZW4gdXNlZC4nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgaWYgKGkgPT09ICdzdG9yZU5hbWUnKSB7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnNbaV0gPSBvcHRpb25zW2ldLnJlcGxhY2UoL1xcVy9nLCAnXycpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChpID09PSAndmVyc2lvbicgJiYgdHlwZW9mIG9wdGlvbnNbaV0gIT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRXJyb3IoJ0RhdGFiYXNlIHZlcnNpb24gbXVzdCBiZSBhIG51bWJlci4nKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9jb25maWdbaV0gPSBvcHRpb25zW2ldO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBhZnRlciBhbGwgY29uZmlnIG9wdGlvbnMgYXJlIHNldCBhbmRcbiAgICAgICAgICAgIC8vIHRoZSBkcml2ZXIgb3B0aW9uIGlzIHVzZWQsIHRyeSBzZXR0aW5nIGl0XG4gICAgICAgICAgICBpZiAoJ2RyaXZlcicgaW4gb3B0aW9ucyAmJiBvcHRpb25zLmRyaXZlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldERyaXZlcih0aGlzLl9jb25maWcuZHJpdmVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY29uZmlnW29wdGlvbnNdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NvbmZpZztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBVc2VkIHRvIGRlZmluZSBhIGN1c3RvbSBkcml2ZXIsIHNoYXJlZCBhY3Jvc3MgYWxsIGluc3RhbmNlcyBvZlxuICAgIC8vIGxvY2FsRm9yYWdlLlxuXG5cbiAgICBMb2NhbEZvcmFnZS5wcm90b3R5cGUuZGVmaW5lRHJpdmVyID0gZnVuY3Rpb24gZGVmaW5lRHJpdmVyKGRyaXZlck9iamVjdCwgY2FsbGJhY2ssIGVycm9yQ2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSQxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdmFyIGRyaXZlck5hbWUgPSBkcml2ZXJPYmplY3QuX2RyaXZlcjtcbiAgICAgICAgICAgICAgICB2YXIgY29tcGxpYW5jZUVycm9yID0gbmV3IEVycm9yKCdDdXN0b20gZHJpdmVyIG5vdCBjb21wbGlhbnQ7IHNlZSAnICsgJ2h0dHBzOi8vbW96aWxsYS5naXRodWIuaW8vbG9jYWxGb3JhZ2UvI2RlZmluZWRyaXZlcicpO1xuXG4gICAgICAgICAgICAgICAgLy8gQSBkcml2ZXIgbmFtZSBzaG91bGQgYmUgZGVmaW5lZCBhbmQgbm90IG92ZXJsYXAgd2l0aCB0aGVcbiAgICAgICAgICAgICAgICAvLyBsaWJyYXJ5LWRlZmluZWQsIGRlZmF1bHQgZHJpdmVycy5cbiAgICAgICAgICAgICAgICBpZiAoIWRyaXZlck9iamVjdC5fZHJpdmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChjb21wbGlhbmNlRXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGRyaXZlck1ldGhvZHMgPSBMaWJyYXJ5TWV0aG9kcy5jb25jYXQoJ19pbml0U3RvcmFnZScpO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBkcml2ZXJNZXRob2RzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkcml2ZXJNZXRob2ROYW1lID0gZHJpdmVyTWV0aG9kc1tpXTtcblxuICAgICAgICAgICAgICAgICAgICAvLyB3aGVuIHRoZSBwcm9wZXJ0eSBpcyB0aGVyZSxcbiAgICAgICAgICAgICAgICAgICAgLy8gaXQgc2hvdWxkIGJlIGEgbWV0aG9kIGV2ZW4gd2hlbiBvcHRpb25hbFxuICAgICAgICAgICAgICAgICAgICB2YXIgaXNSZXF1aXJlZCA9ICFpbmNsdWRlcyhPcHRpb25hbERyaXZlck1ldGhvZHMsIGRyaXZlck1ldGhvZE5hbWUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoKGlzUmVxdWlyZWQgfHwgZHJpdmVyT2JqZWN0W2RyaXZlck1ldGhvZE5hbWVdKSAmJiB0eXBlb2YgZHJpdmVyT2JqZWN0W2RyaXZlck1ldGhvZE5hbWVdICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoY29tcGxpYW5jZUVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBjb25maWd1cmVNaXNzaW5nTWV0aG9kcyA9IGZ1bmN0aW9uIGNvbmZpZ3VyZU1pc3NpbmdNZXRob2RzKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWV0aG9kTm90SW1wbGVtZW50ZWRGYWN0b3J5ID0gZnVuY3Rpb24gbWV0aG9kTm90SW1wbGVtZW50ZWRGYWN0b3J5KG1ldGhvZE5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVycm9yID0gbmV3IEVycm9yKCdNZXRob2QgJyArIG1ldGhvZE5hbWUgKyAnIGlzIG5vdCBpbXBsZW1lbnRlZCBieSB0aGUgY3VycmVudCBkcml2ZXInKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHJvbWlzZSA9IFByb21pc2UkMS5yZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aCAtIDFdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfbGVuID0gT3B0aW9uYWxEcml2ZXJNZXRob2RzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3B0aW9uYWxEcml2ZXJNZXRob2QgPSBPcHRpb25hbERyaXZlck1ldGhvZHNbX2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFkcml2ZXJPYmplY3Rbb3B0aW9uYWxEcml2ZXJNZXRob2RdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZHJpdmVyT2JqZWN0W29wdGlvbmFsRHJpdmVyTWV0aG9kXSA9IG1ldGhvZE5vdEltcGxlbWVudGVkRmFjdG9yeShvcHRpb25hbERyaXZlck1ldGhvZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgY29uZmlndXJlTWlzc2luZ01ldGhvZHMoKTtcblxuICAgICAgICAgICAgICAgIHZhciBzZXREcml2ZXJTdXBwb3J0ID0gZnVuY3Rpb24gc2V0RHJpdmVyU3VwcG9ydChzdXBwb3J0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChEZWZpbmVkRHJpdmVyc1tkcml2ZXJOYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKCdSZWRlZmluaW5nIExvY2FsRm9yYWdlIGRyaXZlcjogJyArIGRyaXZlck5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIERlZmluZWREcml2ZXJzW2RyaXZlck5hbWVdID0gZHJpdmVyT2JqZWN0O1xuICAgICAgICAgICAgICAgICAgICBEcml2ZXJTdXBwb3J0W2RyaXZlck5hbWVdID0gc3VwcG9ydDtcbiAgICAgICAgICAgICAgICAgICAgLy8gZG9uJ3QgdXNlIGEgdGhlbiwgc28gdGhhdCB3ZSBjYW4gZGVmaW5lXG4gICAgICAgICAgICAgICAgICAgIC8vIGRyaXZlcnMgdGhhdCBoYXZlIHNpbXBsZSBfc3VwcG9ydCBtZXRob2RzXG4gICAgICAgICAgICAgICAgICAgIC8vIGluIGEgYmxvY2tpbmcgbWFubmVyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgaWYgKCdfc3VwcG9ydCcgaW4gZHJpdmVyT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkcml2ZXJPYmplY3QuX3N1cHBvcnQgJiYgdHlwZW9mIGRyaXZlck9iamVjdC5fc3VwcG9ydCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJpdmVyT2JqZWN0Ll9zdXBwb3J0KCkudGhlbihzZXREcml2ZXJTdXBwb3J0LCByZWplY3QpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0RHJpdmVyU3VwcG9ydCghIWRyaXZlck9iamVjdC5fc3VwcG9ydCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZXREcml2ZXJTdXBwb3J0KHRydWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGV4ZWN1dGVUd29DYWxsYmFja3MocHJvbWlzZSwgY2FsbGJhY2ssIGVycm9yQ2FsbGJhY2spO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9O1xuXG4gICAgTG9jYWxGb3JhZ2UucHJvdG90eXBlLmRyaXZlciA9IGZ1bmN0aW9uIGRyaXZlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RyaXZlciB8fCBudWxsO1xuICAgIH07XG5cbiAgICBMb2NhbEZvcmFnZS5wcm90b3R5cGUuZ2V0RHJpdmVyID0gZnVuY3Rpb24gZ2V0RHJpdmVyKGRyaXZlck5hbWUsIGNhbGxiYWNrLCBlcnJvckNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBnZXREcml2ZXJQcm9taXNlID0gRGVmaW5lZERyaXZlcnNbZHJpdmVyTmFtZV0gPyBQcm9taXNlJDEucmVzb2x2ZShEZWZpbmVkRHJpdmVyc1tkcml2ZXJOYW1lXSkgOiBQcm9taXNlJDEucmVqZWN0KG5ldyBFcnJvcignRHJpdmVyIG5vdCBmb3VuZC4nKSk7XG5cbiAgICAgICAgZXhlY3V0ZVR3b0NhbGxiYWNrcyhnZXREcml2ZXJQcm9taXNlLCBjYWxsYmFjaywgZXJyb3JDYWxsYmFjayk7XG4gICAgICAgIHJldHVybiBnZXREcml2ZXJQcm9taXNlO1xuICAgIH07XG5cbiAgICBMb2NhbEZvcmFnZS5wcm90b3R5cGUuZ2V0U2VyaWFsaXplciA9IGZ1bmN0aW9uIGdldFNlcmlhbGl6ZXIoY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHNlcmlhbGl6ZXJQcm9taXNlID0gUHJvbWlzZSQxLnJlc29sdmUobG9jYWxmb3JhZ2VTZXJpYWxpemVyKTtcbiAgICAgICAgZXhlY3V0ZVR3b0NhbGxiYWNrcyhzZXJpYWxpemVyUHJvbWlzZSwgY2FsbGJhY2spO1xuICAgICAgICByZXR1cm4gc2VyaWFsaXplclByb21pc2U7XG4gICAgfTtcblxuICAgIExvY2FsRm9yYWdlLnByb3RvdHlwZS5yZWFkeSA9IGZ1bmN0aW9uIHJlYWR5KGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICB2YXIgcHJvbWlzZSA9IHNlbGYuX2RyaXZlclNldC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChzZWxmLl9yZWFkeSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHNlbGYuX3JlYWR5ID0gc2VsZi5faW5pdERyaXZlcigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc2VsZi5fcmVhZHk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGV4ZWN1dGVUd29DYWxsYmFja3MocHJvbWlzZSwgY2FsbGJhY2ssIGNhbGxiYWNrKTtcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfTtcblxuICAgIExvY2FsRm9yYWdlLnByb3RvdHlwZS5zZXREcml2ZXIgPSBmdW5jdGlvbiBzZXREcml2ZXIoZHJpdmVycywgY2FsbGJhY2ssIGVycm9yQ2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIGlmICghaXNBcnJheShkcml2ZXJzKSkge1xuICAgICAgICAgICAgZHJpdmVycyA9IFtkcml2ZXJzXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzdXBwb3J0ZWREcml2ZXJzID0gdGhpcy5fZ2V0U3VwcG9ydGVkRHJpdmVycyhkcml2ZXJzKTtcblxuICAgICAgICBmdW5jdGlvbiBzZXREcml2ZXJUb0NvbmZpZygpIHtcbiAgICAgICAgICAgIHNlbGYuX2NvbmZpZy5kcml2ZXIgPSBzZWxmLmRyaXZlcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZXh0ZW5kU2VsZldpdGhEcml2ZXIoZHJpdmVyKSB7XG4gICAgICAgICAgICBzZWxmLl9leHRlbmQoZHJpdmVyKTtcbiAgICAgICAgICAgIHNldERyaXZlclRvQ29uZmlnKCk7XG5cbiAgICAgICAgICAgIHNlbGYuX3JlYWR5ID0gc2VsZi5faW5pdFN0b3JhZ2Uoc2VsZi5fY29uZmlnKTtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLl9yZWFkeTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGluaXREcml2ZXIoc3VwcG9ydGVkRHJpdmVycykge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudERyaXZlckluZGV4ID0gMDtcblxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGRyaXZlclByb21pc2VMb29wKCkge1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoY3VycmVudERyaXZlckluZGV4IDwgc3VwcG9ydGVkRHJpdmVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkcml2ZXJOYW1lID0gc3VwcG9ydGVkRHJpdmVyc1tjdXJyZW50RHJpdmVySW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudERyaXZlckluZGV4Kys7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX2RiSW5mbyA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9yZWFkeSA9IG51bGw7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmdldERyaXZlcihkcml2ZXJOYW1lKS50aGVuKGV4dGVuZFNlbGZXaXRoRHJpdmVyKVtcImNhdGNoXCJdKGRyaXZlclByb21pc2VMb29wKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHNldERyaXZlclRvQ29uZmlnKCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlcnJvciA9IG5ldyBFcnJvcignTm8gYXZhaWxhYmxlIHN0b3JhZ2UgbWV0aG9kIGZvdW5kLicpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9kcml2ZXJTZXQgPSBQcm9taXNlJDEucmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuX2RyaXZlclNldDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZHJpdmVyUHJvbWlzZUxvb3AoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGVyZSBtaWdodCBiZSBhIGRyaXZlciBpbml0aWFsaXphdGlvbiBpbiBwcm9ncmVzc1xuICAgICAgICAvLyBzbyB3YWl0IGZvciBpdCB0byBmaW5pc2ggaW4gb3JkZXIgdG8gYXZvaWQgYSBwb3NzaWJsZVxuICAgICAgICAvLyByYWNlIGNvbmRpdGlvbiB0byBzZXQgX2RiSW5mb1xuICAgICAgICB2YXIgb2xkRHJpdmVyU2V0RG9uZSA9IHRoaXMuX2RyaXZlclNldCAhPT0gbnVsbCA/IHRoaXMuX2RyaXZlclNldFtcImNhdGNoXCJdKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlJDEucmVzb2x2ZSgpO1xuICAgICAgICB9KSA6IFByb21pc2UkMS5yZXNvbHZlKCk7XG5cbiAgICAgICAgdGhpcy5fZHJpdmVyU2V0ID0gb2xkRHJpdmVyU2V0RG9uZS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBkcml2ZXJOYW1lID0gc3VwcG9ydGVkRHJpdmVyc1swXTtcbiAgICAgICAgICAgIHNlbGYuX2RiSW5mbyA9IG51bGw7XG4gICAgICAgICAgICBzZWxmLl9yZWFkeSA9IG51bGw7XG5cbiAgICAgICAgICAgIHJldHVybiBzZWxmLmdldERyaXZlcihkcml2ZXJOYW1lKS50aGVuKGZ1bmN0aW9uIChkcml2ZXIpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9kcml2ZXIgPSBkcml2ZXIuX2RyaXZlcjtcbiAgICAgICAgICAgICAgICBzZXREcml2ZXJUb0NvbmZpZygpO1xuICAgICAgICAgICAgICAgIHNlbGYuX3dyYXBMaWJyYXJ5TWV0aG9kc1dpdGhSZWFkeSgpO1xuICAgICAgICAgICAgICAgIHNlbGYuX2luaXREcml2ZXIgPSBpbml0RHJpdmVyKHN1cHBvcnRlZERyaXZlcnMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pW1wiY2F0Y2hcIl0oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2V0RHJpdmVyVG9Db25maWcoKTtcbiAgICAgICAgICAgIHZhciBlcnJvciA9IG5ldyBFcnJvcignTm8gYXZhaWxhYmxlIHN0b3JhZ2UgbWV0aG9kIGZvdW5kLicpO1xuICAgICAgICAgICAgc2VsZi5fZHJpdmVyU2V0ID0gUHJvbWlzZSQxLnJlamVjdChlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gc2VsZi5fZHJpdmVyU2V0O1xuICAgICAgICB9KTtcblxuICAgICAgICBleGVjdXRlVHdvQ2FsbGJhY2tzKHRoaXMuX2RyaXZlclNldCwgY2FsbGJhY2ssIGVycm9yQ2FsbGJhY2spO1xuICAgICAgICByZXR1cm4gdGhpcy5fZHJpdmVyU2V0O1xuICAgIH07XG5cbiAgICBMb2NhbEZvcmFnZS5wcm90b3R5cGUuc3VwcG9ydHMgPSBmdW5jdGlvbiBzdXBwb3J0cyhkcml2ZXJOYW1lKSB7XG4gICAgICAgIHJldHVybiAhIURyaXZlclN1cHBvcnRbZHJpdmVyTmFtZV07XG4gICAgfTtcblxuICAgIExvY2FsRm9yYWdlLnByb3RvdHlwZS5fZXh0ZW5kID0gZnVuY3Rpb24gX2V4dGVuZChsaWJyYXJ5TWV0aG9kc0FuZFByb3BlcnRpZXMpIHtcbiAgICAgICAgZXh0ZW5kKHRoaXMsIGxpYnJhcnlNZXRob2RzQW5kUHJvcGVydGllcyk7XG4gICAgfTtcblxuICAgIExvY2FsRm9yYWdlLnByb3RvdHlwZS5fZ2V0U3VwcG9ydGVkRHJpdmVycyA9IGZ1bmN0aW9uIF9nZXRTdXBwb3J0ZWREcml2ZXJzKGRyaXZlcnMpIHtcbiAgICAgICAgdmFyIHN1cHBvcnRlZERyaXZlcnMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGRyaXZlcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBkcml2ZXJOYW1lID0gZHJpdmVyc1tpXTtcbiAgICAgICAgICAgIGlmICh0aGlzLnN1cHBvcnRzKGRyaXZlck5hbWUpKSB7XG4gICAgICAgICAgICAgICAgc3VwcG9ydGVkRHJpdmVycy5wdXNoKGRyaXZlck5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdXBwb3J0ZWREcml2ZXJzO1xuICAgIH07XG5cbiAgICBMb2NhbEZvcmFnZS5wcm90b3R5cGUuX3dyYXBMaWJyYXJ5TWV0aG9kc1dpdGhSZWFkeSA9IGZ1bmN0aW9uIF93cmFwTGlicmFyeU1ldGhvZHNXaXRoUmVhZHkoKSB7XG4gICAgICAgIC8vIEFkZCBhIHN0dWIgZm9yIGVhY2ggZHJpdmVyIEFQSSBtZXRob2QgdGhhdCBkZWxheXMgdGhlIGNhbGwgdG8gdGhlXG4gICAgICAgIC8vIGNvcnJlc3BvbmRpbmcgZHJpdmVyIG1ldGhvZCB1bnRpbCBsb2NhbEZvcmFnZSBpcyByZWFkeS4gVGhlc2Ugc3R1YnNcbiAgICAgICAgLy8gd2lsbCBiZSByZXBsYWNlZCBieSB0aGUgZHJpdmVyIG1ldGhvZHMgYXMgc29vbiBhcyB0aGUgZHJpdmVyIGlzXG4gICAgICAgIC8vIGxvYWRlZCwgc28gdGhlcmUgaXMgbm8gcGVyZm9ybWFuY2UgaW1wYWN0LlxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gTGlicmFyeU1ldGhvZHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGNhbGxXaGVuUmVhZHkodGhpcywgTGlicmFyeU1ldGhvZHNbaV0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIExvY2FsRm9yYWdlLnByb3RvdHlwZS5jcmVhdGVJbnN0YW5jZSA9IGZ1bmN0aW9uIGNyZWF0ZUluc3RhbmNlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBMb2NhbEZvcmFnZShvcHRpb25zKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIExvY2FsRm9yYWdlO1xufSgpO1xuXG4vLyBUaGUgYWN0dWFsIGxvY2FsRm9yYWdlIG9iamVjdCB0aGF0IHdlIGV4cG9zZSBhcyBhIG1vZHVsZSBvciB2aWEgYVxuLy8gZ2xvYmFsLiBJdCdzIGV4dGVuZGVkIGJ5IHB1bGxpbmcgaW4gb25lIG9mIG91ciBvdGhlciBsaWJyYXJpZXMuXG5cblxudmFyIGxvY2FsZm9yYWdlX2pzID0gbmV3IExvY2FsRm9yYWdlKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gbG9jYWxmb3JhZ2VfanM7XG5cbn0se1wiM1wiOjN9XX0se30sWzRdKSg0KVxufSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3Rvcnkpe1xuICAndXNlIHN0cmljdCc7XG5cbiAgLyppc3RhbmJ1bCBpZ25vcmUgbmV4dDpjYW50IHRlc3QqL1xuICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICBkZWZpbmUoW10sIGZhY3RvcnkpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFsc1xuICAgIHJvb3Qub2JqZWN0UGF0aCA9IGZhY3RvcnkoKTtcbiAgfVxufSkodGhpcywgZnVuY3Rpb24oKXtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciB0b1N0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG4gIGZ1bmN0aW9uIGhhc093blByb3BlcnR5KG9iaiwgcHJvcCkge1xuICAgIGlmKG9iaiA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgLy90byBoYW5kbGUgb2JqZWN0cyB3aXRoIG51bGwgcHJvdG90eXBlcyAodG9vIGVkZ2UgY2FzZT8pXG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApXG4gIH1cblxuICBmdW5jdGlvbiBpc0VtcHR5KHZhbHVlKXtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgZm9yICh2YXIgaSBpbiB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKGhhc093blByb3BlcnR5KHZhbHVlLCBpKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gdG9TdHJpbmcodHlwZSl7XG4gICAgcmV0dXJuIHRvU3RyLmNhbGwodHlwZSk7XG4gIH1cblxuICBmdW5jdGlvbiBpc09iamVjdChvYmope1xuICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiB0b1N0cmluZyhvYmopID09PSBcIltvYmplY3QgT2JqZWN0XVwiO1xuICB9XG5cbiAgdmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uKG9iail7XG4gICAgLyppc3RhbmJ1bCBpZ25vcmUgbmV4dDpjYW50IHRlc3QqL1xuICAgIHJldHVybiB0b1N0ci5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gIH1cblxuICBmdW5jdGlvbiBpc0Jvb2xlYW4ob2JqKXtcbiAgICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ2Jvb2xlYW4nIHx8IHRvU3RyaW5nKG9iaikgPT09ICdbb2JqZWN0IEJvb2xlYW5dJztcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldEtleShrZXkpe1xuICAgIHZhciBpbnRLZXkgPSBwYXJzZUludChrZXkpO1xuICAgIGlmIChpbnRLZXkudG9TdHJpbmcoKSA9PT0ga2V5KSB7XG4gICAgICByZXR1cm4gaW50S2V5O1xuICAgIH1cbiAgICByZXR1cm4ga2V5O1xuICB9XG5cbiAgZnVuY3Rpb24gZmFjdG9yeShvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cblxuICAgIHZhciBvYmplY3RQYXRoID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqZWN0UGF0aCkucmVkdWNlKGZ1bmN0aW9uKHByb3h5LCBwcm9wKSB7XG4gICAgICAgIGlmKHByb3AgPT09ICdjcmVhdGUnKSB7XG4gICAgICAgICAgcmV0dXJuIHByb3h5O1xuICAgICAgICB9XG5cbiAgICAgICAgLyppc3RhbmJ1bCBpZ25vcmUgZWxzZSovXG4gICAgICAgIGlmICh0eXBlb2Ygb2JqZWN0UGF0aFtwcm9wXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHByb3h5W3Byb3BdID0gb2JqZWN0UGF0aFtwcm9wXS5iaW5kKG9iamVjdFBhdGgsIG9iaik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcHJveHk7XG4gICAgICB9LCB7fSk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGhhc1NoYWxsb3dQcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgICAgIHJldHVybiAob3B0aW9ucy5pbmNsdWRlSW5oZXJpdGVkUHJvcHMgfHwgKHR5cGVvZiBwcm9wID09PSAnbnVtYmVyJyAmJiBBcnJheS5pc0FycmF5KG9iaikpIHx8IGhhc093blByb3BlcnR5KG9iaiwgcHJvcCkpXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0U2hhbGxvd1Byb3BlcnR5KG9iaiwgcHJvcCkge1xuICAgICAgaWYgKGhhc1NoYWxsb3dQcm9wZXJ0eShvYmosIHByb3ApKSB7XG4gICAgICAgIHJldHVybiBvYmpbcHJvcF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2V0KG9iaiwgcGF0aCwgdmFsdWUsIGRvTm90UmVwbGFjZSl7XG4gICAgICBpZiAodHlwZW9mIHBhdGggPT09ICdudW1iZXInKSB7XG4gICAgICAgIHBhdGggPSBbcGF0aF07XG4gICAgICB9XG4gICAgICBpZiAoIXBhdGggfHwgcGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIHNldChvYmosIHBhdGguc3BsaXQoJy4nKS5tYXAoZ2V0S2V5KSwgdmFsdWUsIGRvTm90UmVwbGFjZSk7XG4gICAgICB9XG4gICAgICB2YXIgY3VycmVudFBhdGggPSBwYXRoWzBdO1xuICAgICAgdmFyIGN1cnJlbnRWYWx1ZSA9IGdldFNoYWxsb3dQcm9wZXJ0eShvYmosIGN1cnJlbnRQYXRoKTtcbiAgICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICBpZiAoY3VycmVudFZhbHVlID09PSB2b2lkIDAgfHwgIWRvTm90UmVwbGFjZSkge1xuICAgICAgICAgIG9ialtjdXJyZW50UGF0aF0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY3VycmVudFZhbHVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoY3VycmVudFZhbHVlID09PSB2b2lkIDApIHtcbiAgICAgICAgLy9jaGVjayBpZiB3ZSBhc3N1bWUgYW4gYXJyYXlcbiAgICAgICAgaWYodHlwZW9mIHBhdGhbMV0gPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgb2JqW2N1cnJlbnRQYXRoXSA9IFtdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9ialtjdXJyZW50UGF0aF0gPSB7fTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2V0KG9ialtjdXJyZW50UGF0aF0sIHBhdGguc2xpY2UoMSksIHZhbHVlLCBkb05vdFJlcGxhY2UpO1xuICAgIH1cblxuICAgIG9iamVjdFBhdGguaGFzID0gZnVuY3Rpb24gKG9iaiwgcGF0aCkge1xuICAgICAgaWYgKHR5cGVvZiBwYXRoID09PSAnbnVtYmVyJykge1xuICAgICAgICBwYXRoID0gW3BhdGhdO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgcGF0aCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcGF0aCA9IHBhdGguc3BsaXQoJy4nKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFwYXRoIHx8IHBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiAhIW9iajtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXRoLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBqID0gZ2V0S2V5KHBhdGhbaV0pO1xuXG4gICAgICAgIGlmKCh0eXBlb2YgaiA9PT0gJ251bWJlcicgJiYgaXNBcnJheShvYmopICYmIGogPCBvYmoubGVuZ3RoKSB8fFxuICAgICAgICAgIChvcHRpb25zLmluY2x1ZGVJbmhlcml0ZWRQcm9wcyA/IChqIGluIE9iamVjdChvYmopKSA6IGhhc093blByb3BlcnR5KG9iaiwgaikpKSB7XG4gICAgICAgICAgb2JqID0gb2JqW2pdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgb2JqZWN0UGF0aC5lbnN1cmVFeGlzdHMgPSBmdW5jdGlvbiAob2JqLCBwYXRoLCB2YWx1ZSl7XG4gICAgICByZXR1cm4gc2V0KG9iaiwgcGF0aCwgdmFsdWUsIHRydWUpO1xuICAgIH07XG5cbiAgICBvYmplY3RQYXRoLnNldCA9IGZ1bmN0aW9uIChvYmosIHBhdGgsIHZhbHVlLCBkb05vdFJlcGxhY2Upe1xuICAgICAgcmV0dXJuIHNldChvYmosIHBhdGgsIHZhbHVlLCBkb05vdFJlcGxhY2UpO1xuICAgIH07XG5cbiAgICBvYmplY3RQYXRoLmluc2VydCA9IGZ1bmN0aW9uIChvYmosIHBhdGgsIHZhbHVlLCBhdCl7XG4gICAgICB2YXIgYXJyID0gb2JqZWN0UGF0aC5nZXQob2JqLCBwYXRoKTtcbiAgICAgIGF0ID0gfn5hdDtcbiAgICAgIGlmICghaXNBcnJheShhcnIpKSB7XG4gICAgICAgIGFyciA9IFtdO1xuICAgICAgICBvYmplY3RQYXRoLnNldChvYmosIHBhdGgsIGFycik7XG4gICAgICB9XG4gICAgICBhcnIuc3BsaWNlKGF0LCAwLCB2YWx1ZSk7XG4gICAgfTtcblxuICAgIG9iamVjdFBhdGguZW1wdHkgPSBmdW5jdGlvbihvYmosIHBhdGgpIHtcbiAgICAgIGlmIChpc0VtcHR5KHBhdGgpKSB7XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICB9XG4gICAgICBpZiAob2JqID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICAgIH1cblxuICAgICAgdmFyIHZhbHVlLCBpO1xuICAgICAgaWYgKCEodmFsdWUgPSBvYmplY3RQYXRoLmdldChvYmosIHBhdGgpKSkge1xuICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gb2JqZWN0UGF0aC5zZXQob2JqLCBwYXRoLCAnJyk7XG4gICAgICB9IGVsc2UgaWYgKGlzQm9vbGVhbih2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdFBhdGguc2V0KG9iaiwgcGF0aCwgZmFsc2UpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHJldHVybiBvYmplY3RQYXRoLnNldChvYmosIHBhdGgsIDApO1xuICAgICAgfSBlbHNlIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgICAgICB2YWx1ZS5sZW5ndGggPSAwO1xuICAgICAgfSBlbHNlIGlmIChpc09iamVjdCh2YWx1ZSkpIHtcbiAgICAgICAgZm9yIChpIGluIHZhbHVlKSB7XG4gICAgICAgICAgaWYgKGhhc1NoYWxsb3dQcm9wZXJ0eSh2YWx1ZSwgaSkpIHtcbiAgICAgICAgICAgIGRlbGV0ZSB2YWx1ZVtpXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBvYmplY3RQYXRoLnNldChvYmosIHBhdGgsIG51bGwpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBvYmplY3RQYXRoLnB1c2ggPSBmdW5jdGlvbiAob2JqLCBwYXRoIC8qLCB2YWx1ZXMgKi8pe1xuICAgICAgdmFyIGFyciA9IG9iamVjdFBhdGguZ2V0KG9iaiwgcGF0aCk7XG4gICAgICBpZiAoIWlzQXJyYXkoYXJyKSkge1xuICAgICAgICBhcnIgPSBbXTtcbiAgICAgICAgb2JqZWN0UGF0aC5zZXQob2JqLCBwYXRoLCBhcnIpO1xuICAgICAgfVxuXG4gICAgICBhcnIucHVzaC5hcHBseShhcnIsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMikpO1xuICAgIH07XG5cbiAgICBvYmplY3RQYXRoLmNvYWxlc2NlID0gZnVuY3Rpb24gKG9iaiwgcGF0aHMsIGRlZmF1bHRWYWx1ZSkge1xuICAgICAgdmFyIHZhbHVlO1xuXG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gcGF0aHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgaWYgKCh2YWx1ZSA9IG9iamVjdFBhdGguZ2V0KG9iaiwgcGF0aHNbaV0pKSAhPT0gdm9pZCAwKSB7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gICAgfTtcblxuICAgIG9iamVjdFBhdGguZ2V0ID0gZnVuY3Rpb24gKG9iaiwgcGF0aCwgZGVmYXVsdFZhbHVlKXtcbiAgICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcGF0aCA9IFtwYXRoXTtcbiAgICAgIH1cbiAgICAgIGlmICghcGF0aCB8fCBwYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgfVxuICAgICAgaWYgKG9iaiA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHBhdGggPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBvYmplY3RQYXRoLmdldChvYmosIHBhdGguc3BsaXQoJy4nKSwgZGVmYXVsdFZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGN1cnJlbnRQYXRoID0gZ2V0S2V5KHBhdGhbMF0pO1xuICAgICAgdmFyIG5leHRPYmogPSBnZXRTaGFsbG93UHJvcGVydHkob2JqLCBjdXJyZW50UGF0aClcbiAgICAgIGlmIChuZXh0T2JqID09PSB2b2lkIDApIHtcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHBhdGgubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHJldHVybiBuZXh0T2JqO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb2JqZWN0UGF0aC5nZXQob2JqW2N1cnJlbnRQYXRoXSwgcGF0aC5zbGljZSgxKSwgZGVmYXVsdFZhbHVlKTtcbiAgICB9O1xuXG4gICAgb2JqZWN0UGF0aC5kZWwgPSBmdW5jdGlvbiBkZWwob2JqLCBwYXRoKSB7XG4gICAgICBpZiAodHlwZW9mIHBhdGggPT09ICdudW1iZXInKSB7XG4gICAgICAgIHBhdGggPSBbcGF0aF07XG4gICAgICB9XG5cbiAgICAgIGlmIChvYmogPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNFbXB0eShwYXRoKSkge1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgfVxuICAgICAgaWYodHlwZW9mIHBhdGggPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBvYmplY3RQYXRoLmRlbChvYmosIHBhdGguc3BsaXQoJy4nKSk7XG4gICAgICB9XG5cbiAgICAgIHZhciBjdXJyZW50UGF0aCA9IGdldEtleShwYXRoWzBdKTtcbiAgICAgIGlmICghaGFzU2hhbGxvd1Byb3BlcnR5KG9iaiwgY3VycmVudFBhdGgpKSB7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgICB9XG5cbiAgICAgIGlmKHBhdGgubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAgICAgICBvYmouc3BsaWNlKGN1cnJlbnRQYXRoLCAxKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWxldGUgb2JqW2N1cnJlbnRQYXRoXTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdFBhdGguZGVsKG9ialtjdXJyZW50UGF0aF0sIHBhdGguc2xpY2UoMSkpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb2JqO1xuICAgIH1cblxuICAgIHJldHVybiBvYmplY3RQYXRoO1xuICB9XG5cbiAgdmFyIG1vZCA9IGZhY3RvcnkoKTtcbiAgbW9kLmNyZWF0ZSA9IGZhY3Rvcnk7XG4gIG1vZC53aXRoSW5oZXJpdGVkUHJvcHMgPSBmYWN0b3J5KHtpbmNsdWRlSW5oZXJpdGVkUHJvcHM6IHRydWV9KVxuICByZXR1cm4gbW9kO1xufSk7XG4iLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxNC1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbi8vIFRoaXMgbWV0aG9kIG9mIG9idGFpbmluZyBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsIG9iamVjdCBuZWVkcyB0byBiZVxuLy8ga2VwdCBpZGVudGljYWwgdG8gdGhlIHdheSBpdCBpcyBvYnRhaW5lZCBpbiBydW50aW1lLmpzXG52YXIgZyA9IChmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMgfSkoKSB8fCBGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCk7XG5cbi8vIFVzZSBgZ2V0T3duUHJvcGVydHlOYW1lc2AgYmVjYXVzZSBub3QgYWxsIGJyb3dzZXJzIHN1cHBvcnQgY2FsbGluZ1xuLy8gYGhhc093blByb3BlcnR5YCBvbiB0aGUgZ2xvYmFsIGBzZWxmYCBvYmplY3QgaW4gYSB3b3JrZXIuIFNlZSAjMTgzLlxudmFyIGhhZFJ1bnRpbWUgPSBnLnJlZ2VuZXJhdG9yUnVudGltZSAmJlxuICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhnKS5pbmRleE9mKFwicmVnZW5lcmF0b3JSdW50aW1lXCIpID49IDA7XG5cbi8vIFNhdmUgdGhlIG9sZCByZWdlbmVyYXRvclJ1bnRpbWUgaW4gY2FzZSBpdCBuZWVkcyB0byBiZSByZXN0b3JlZCBsYXRlci5cbnZhciBvbGRSdW50aW1lID0gaGFkUnVudGltZSAmJiBnLnJlZ2VuZXJhdG9yUnVudGltZTtcblxuLy8gRm9yY2UgcmVldmFsdXRhdGlvbiBvZiBydW50aW1lLmpzLlxuZy5yZWdlbmVyYXRvclJ1bnRpbWUgPSB1bmRlZmluZWQ7XG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4vcnVudGltZVwiKTtcblxuaWYgKGhhZFJ1bnRpbWUpIHtcbiAgLy8gUmVzdG9yZSB0aGUgb3JpZ2luYWwgcnVudGltZS5cbiAgZy5yZWdlbmVyYXRvclJ1bnRpbWUgPSBvbGRSdW50aW1lO1xufSBlbHNlIHtcbiAgLy8gUmVtb3ZlIHRoZSBnbG9iYWwgcHJvcGVydHkgYWRkZWQgYnkgcnVudGltZS5qcy5cbiAgdHJ5IHtcbiAgICBkZWxldGUgZy5yZWdlbmVyYXRvclJ1bnRpbWU7XG4gIH0gY2F0Y2goZSkge1xuICAgIGcucmVnZW5lcmF0b3JSdW50aW1lID0gdW5kZWZpbmVkO1xuICB9XG59XG4iLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxNC1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbiEoZnVuY3Rpb24oZ2xvYmFsKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBPcCA9IE9iamVjdC5wcm90b3R5cGU7XG4gIHZhciBoYXNPd24gPSBPcC5oYXNPd25Qcm9wZXJ0eTtcbiAgdmFyIHVuZGVmaW5lZDsgLy8gTW9yZSBjb21wcmVzc2libGUgdGhhbiB2b2lkIDAuXG4gIHZhciAkU3ltYm9sID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiID8gU3ltYm9sIDoge307XG4gIHZhciBpdGVyYXRvclN5bWJvbCA9ICRTeW1ib2wuaXRlcmF0b3IgfHwgXCJAQGl0ZXJhdG9yXCI7XG4gIHZhciBhc3luY0l0ZXJhdG9yU3ltYm9sID0gJFN5bWJvbC5hc3luY0l0ZXJhdG9yIHx8IFwiQEBhc3luY0l0ZXJhdG9yXCI7XG4gIHZhciB0b1N0cmluZ1RhZ1N5bWJvbCA9ICRTeW1ib2wudG9TdHJpbmdUYWcgfHwgXCJAQHRvU3RyaW5nVGFnXCI7XG5cbiAgdmFyIGluTW9kdWxlID0gdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIjtcbiAgdmFyIHJ1bnRpbWUgPSBnbG9iYWwucmVnZW5lcmF0b3JSdW50aW1lO1xuICBpZiAocnVudGltZSkge1xuICAgIGlmIChpbk1vZHVsZSkge1xuICAgICAgLy8gSWYgcmVnZW5lcmF0b3JSdW50aW1lIGlzIGRlZmluZWQgZ2xvYmFsbHkgYW5kIHdlJ3JlIGluIGEgbW9kdWxlLFxuICAgICAgLy8gbWFrZSB0aGUgZXhwb3J0cyBvYmplY3QgaWRlbnRpY2FsIHRvIHJlZ2VuZXJhdG9yUnVudGltZS5cbiAgICAgIG1vZHVsZS5leHBvcnRzID0gcnVudGltZTtcbiAgICB9XG4gICAgLy8gRG9uJ3QgYm90aGVyIGV2YWx1YXRpbmcgdGhlIHJlc3Qgb2YgdGhpcyBmaWxlIGlmIHRoZSBydW50aW1lIHdhc1xuICAgIC8vIGFscmVhZHkgZGVmaW5lZCBnbG9iYWxseS5cbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBEZWZpbmUgdGhlIHJ1bnRpbWUgZ2xvYmFsbHkgKGFzIGV4cGVjdGVkIGJ5IGdlbmVyYXRlZCBjb2RlKSBhcyBlaXRoZXJcbiAgLy8gbW9kdWxlLmV4cG9ydHMgKGlmIHdlJ3JlIGluIGEgbW9kdWxlKSBvciBhIG5ldywgZW1wdHkgb2JqZWN0LlxuICBydW50aW1lID0gZ2xvYmFsLnJlZ2VuZXJhdG9yUnVudGltZSA9IGluTW9kdWxlID8gbW9kdWxlLmV4cG9ydHMgOiB7fTtcblxuICBmdW5jdGlvbiB3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSB7XG4gICAgLy8gSWYgb3V0ZXJGbiBwcm92aWRlZCBhbmQgb3V0ZXJGbi5wcm90b3R5cGUgaXMgYSBHZW5lcmF0b3IsIHRoZW4gb3V0ZXJGbi5wcm90b3R5cGUgaW5zdGFuY2VvZiBHZW5lcmF0b3IuXG4gICAgdmFyIHByb3RvR2VuZXJhdG9yID0gb3V0ZXJGbiAmJiBvdXRlckZuLnByb3RvdHlwZSBpbnN0YW5jZW9mIEdlbmVyYXRvciA/IG91dGVyRm4gOiBHZW5lcmF0b3I7XG4gICAgdmFyIGdlbmVyYXRvciA9IE9iamVjdC5jcmVhdGUocHJvdG9HZW5lcmF0b3IucHJvdG90eXBlKTtcbiAgICB2YXIgY29udGV4dCA9IG5ldyBDb250ZXh0KHRyeUxvY3NMaXN0IHx8IFtdKTtcblxuICAgIC8vIFRoZSAuX2ludm9rZSBtZXRob2QgdW5pZmllcyB0aGUgaW1wbGVtZW50YXRpb25zIG9mIHRoZSAubmV4dCxcbiAgICAvLyAudGhyb3csIGFuZCAucmV0dXJuIG1ldGhvZHMuXG4gICAgZ2VuZXJhdG9yLl9pbnZva2UgPSBtYWtlSW52b2tlTWV0aG9kKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpO1xuXG4gICAgcmV0dXJuIGdlbmVyYXRvcjtcbiAgfVxuICBydW50aW1lLndyYXAgPSB3cmFwO1xuXG4gIC8vIFRyeS9jYXRjaCBoZWxwZXIgdG8gbWluaW1pemUgZGVvcHRpbWl6YXRpb25zLiBSZXR1cm5zIGEgY29tcGxldGlvblxuICAvLyByZWNvcmQgbGlrZSBjb250ZXh0LnRyeUVudHJpZXNbaV0uY29tcGxldGlvbi4gVGhpcyBpbnRlcmZhY2UgY291bGRcbiAgLy8gaGF2ZSBiZWVuIChhbmQgd2FzIHByZXZpb3VzbHkpIGRlc2lnbmVkIHRvIHRha2UgYSBjbG9zdXJlIHRvIGJlXG4gIC8vIGludm9rZWQgd2l0aG91dCBhcmd1bWVudHMsIGJ1dCBpbiBhbGwgdGhlIGNhc2VzIHdlIGNhcmUgYWJvdXQgd2VcbiAgLy8gYWxyZWFkeSBoYXZlIGFuIGV4aXN0aW5nIG1ldGhvZCB3ZSB3YW50IHRvIGNhbGwsIHNvIHRoZXJlJ3Mgbm8gbmVlZFxuICAvLyB0byBjcmVhdGUgYSBuZXcgZnVuY3Rpb24gb2JqZWN0LiBXZSBjYW4gZXZlbiBnZXQgYXdheSB3aXRoIGFzc3VtaW5nXG4gIC8vIHRoZSBtZXRob2QgdGFrZXMgZXhhY3RseSBvbmUgYXJndW1lbnQsIHNpbmNlIHRoYXQgaGFwcGVucyB0byBiZSB0cnVlXG4gIC8vIGluIGV2ZXJ5IGNhc2UsIHNvIHdlIGRvbid0IGhhdmUgdG8gdG91Y2ggdGhlIGFyZ3VtZW50cyBvYmplY3QuIFRoZVxuICAvLyBvbmx5IGFkZGl0aW9uYWwgYWxsb2NhdGlvbiByZXF1aXJlZCBpcyB0aGUgY29tcGxldGlvbiByZWNvcmQsIHdoaWNoXG4gIC8vIGhhcyBhIHN0YWJsZSBzaGFwZSBhbmQgc28gaG9wZWZ1bGx5IHNob3VsZCBiZSBjaGVhcCB0byBhbGxvY2F0ZS5cbiAgZnVuY3Rpb24gdHJ5Q2F0Y2goZm4sIG9iaiwgYXJnKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwibm9ybWFsXCIsIGFyZzogZm4uY2FsbChvYmosIGFyZykgfTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwidGhyb3dcIiwgYXJnOiBlcnIgfTtcbiAgICB9XG4gIH1cblxuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRTdGFydCA9IFwic3VzcGVuZGVkU3RhcnRcIjtcbiAgdmFyIEdlblN0YXRlU3VzcGVuZGVkWWllbGQgPSBcInN1c3BlbmRlZFlpZWxkXCI7XG4gIHZhciBHZW5TdGF0ZUV4ZWN1dGluZyA9IFwiZXhlY3V0aW5nXCI7XG4gIHZhciBHZW5TdGF0ZUNvbXBsZXRlZCA9IFwiY29tcGxldGVkXCI7XG5cbiAgLy8gUmV0dXJuaW5nIHRoaXMgb2JqZWN0IGZyb20gdGhlIGlubmVyRm4gaGFzIHRoZSBzYW1lIGVmZmVjdCBhc1xuICAvLyBicmVha2luZyBvdXQgb2YgdGhlIGRpc3BhdGNoIHN3aXRjaCBzdGF0ZW1lbnQuXG4gIHZhciBDb250aW51ZVNlbnRpbmVsID0ge307XG5cbiAgLy8gRHVtbXkgY29uc3RydWN0b3IgZnVuY3Rpb25zIHRoYXQgd2UgdXNlIGFzIHRoZSAuY29uc3RydWN0b3IgYW5kXG4gIC8vIC5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgcHJvcGVydGllcyBmb3IgZnVuY3Rpb25zIHRoYXQgcmV0dXJuIEdlbmVyYXRvclxuICAvLyBvYmplY3RzLiBGb3IgZnVsbCBzcGVjIGNvbXBsaWFuY2UsIHlvdSBtYXkgd2lzaCB0byBjb25maWd1cmUgeW91clxuICAvLyBtaW5pZmllciBub3QgdG8gbWFuZ2xlIHRoZSBuYW1lcyBvZiB0aGVzZSB0d28gZnVuY3Rpb25zLlxuICBmdW5jdGlvbiBHZW5lcmF0b3IoKSB7fVxuICBmdW5jdGlvbiBHZW5lcmF0b3JGdW5jdGlvbigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlKCkge31cblxuICAvLyBUaGlzIGlzIGEgcG9seWZpbGwgZm9yICVJdGVyYXRvclByb3RvdHlwZSUgZm9yIGVudmlyb25tZW50cyB0aGF0XG4gIC8vIGRvbid0IG5hdGl2ZWx5IHN1cHBvcnQgaXQuXG4gIHZhciBJdGVyYXRvclByb3RvdHlwZSA9IHt9O1xuICBJdGVyYXRvclByb3RvdHlwZVtpdGVyYXRvclN5bWJvbF0gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgdmFyIGdldFByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mO1xuICB2YXIgTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUgPSBnZXRQcm90byAmJiBnZXRQcm90byhnZXRQcm90byh2YWx1ZXMoW10pKSk7XG4gIGlmIChOYXRpdmVJdGVyYXRvclByb3RvdHlwZSAmJlxuICAgICAgTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUgIT09IE9wICYmXG4gICAgICBoYXNPd24uY2FsbChOYXRpdmVJdGVyYXRvclByb3RvdHlwZSwgaXRlcmF0b3JTeW1ib2wpKSB7XG4gICAgLy8gVGhpcyBlbnZpcm9ubWVudCBoYXMgYSBuYXRpdmUgJUl0ZXJhdG9yUHJvdG90eXBlJTsgdXNlIGl0IGluc3RlYWRcbiAgICAvLyBvZiB0aGUgcG9seWZpbGwuXG4gICAgSXRlcmF0b3JQcm90b3R5cGUgPSBOYXRpdmVJdGVyYXRvclByb3RvdHlwZTtcbiAgfVxuXG4gIHZhciBHcCA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLnByb3RvdHlwZSA9XG4gICAgR2VuZXJhdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSXRlcmF0b3JQcm90b3R5cGUpO1xuICBHZW5lcmF0b3JGdW5jdGlvbi5wcm90b3R5cGUgPSBHcC5jb25zdHJ1Y3RvciA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlO1xuICBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEdlbmVyYXRvckZ1bmN0aW9uO1xuICBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZVt0b1N0cmluZ1RhZ1N5bWJvbF0gPVxuICAgIEdlbmVyYXRvckZ1bmN0aW9uLmRpc3BsYXlOYW1lID0gXCJHZW5lcmF0b3JGdW5jdGlvblwiO1xuXG4gIC8vIEhlbHBlciBmb3IgZGVmaW5pbmcgdGhlIC5uZXh0LCAudGhyb3csIGFuZCAucmV0dXJuIG1ldGhvZHMgb2YgdGhlXG4gIC8vIEl0ZXJhdG9yIGludGVyZmFjZSBpbiB0ZXJtcyBvZiBhIHNpbmdsZSAuX2ludm9rZSBtZXRob2QuXG4gIGZ1bmN0aW9uIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhwcm90b3R5cGUpIHtcbiAgICBbXCJuZXh0XCIsIFwidGhyb3dcIiwgXCJyZXR1cm5cIl0uZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgIHByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24oYXJnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbnZva2UobWV0aG9kLCBhcmcpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIHJ1bnRpbWUuaXNHZW5lcmF0b3JGdW5jdGlvbiA9IGZ1bmN0aW9uKGdlbkZ1bikge1xuICAgIHZhciBjdG9yID0gdHlwZW9mIGdlbkZ1biA9PT0gXCJmdW5jdGlvblwiICYmIGdlbkZ1bi5jb25zdHJ1Y3RvcjtcbiAgICByZXR1cm4gY3RvclxuICAgICAgPyBjdG9yID09PSBHZW5lcmF0b3JGdW5jdGlvbiB8fFxuICAgICAgICAvLyBGb3IgdGhlIG5hdGl2ZSBHZW5lcmF0b3JGdW5jdGlvbiBjb25zdHJ1Y3RvciwgdGhlIGJlc3Qgd2UgY2FuXG4gICAgICAgIC8vIGRvIGlzIHRvIGNoZWNrIGl0cyAubmFtZSBwcm9wZXJ0eS5cbiAgICAgICAgKGN0b3IuZGlzcGxheU5hbWUgfHwgY3Rvci5uYW1lKSA9PT0gXCJHZW5lcmF0b3JGdW5jdGlvblwiXG4gICAgICA6IGZhbHNlO1xuICB9O1xuXG4gIHJ1bnRpbWUubWFyayA9IGZ1bmN0aW9uKGdlbkZ1bikge1xuICAgIGlmIChPYmplY3Quc2V0UHJvdG90eXBlT2YpIHtcbiAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihnZW5GdW4sIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZ2VuRnVuLl9fcHJvdG9fXyA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlO1xuICAgICAgaWYgKCEodG9TdHJpbmdUYWdTeW1ib2wgaW4gZ2VuRnVuKSkge1xuICAgICAgICBnZW5GdW5bdG9TdHJpbmdUYWdTeW1ib2xdID0gXCJHZW5lcmF0b3JGdW5jdGlvblwiO1xuICAgICAgfVxuICAgIH1cbiAgICBnZW5GdW4ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShHcCk7XG4gICAgcmV0dXJuIGdlbkZ1bjtcbiAgfTtcblxuICAvLyBXaXRoaW4gdGhlIGJvZHkgb2YgYW55IGFzeW5jIGZ1bmN0aW9uLCBgYXdhaXQgeGAgaXMgdHJhbnNmb3JtZWQgdG9cbiAgLy8gYHlpZWxkIHJlZ2VuZXJhdG9yUnVudGltZS5hd3JhcCh4KWAsIHNvIHRoYXQgdGhlIHJ1bnRpbWUgY2FuIHRlc3RcbiAgLy8gYGhhc093bi5jYWxsKHZhbHVlLCBcIl9fYXdhaXRcIilgIHRvIGRldGVybWluZSBpZiB0aGUgeWllbGRlZCB2YWx1ZSBpc1xuICAvLyBtZWFudCB0byBiZSBhd2FpdGVkLlxuICBydW50aW1lLmF3cmFwID0gZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIHsgX19hd2FpdDogYXJnIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gQXN5bmNJdGVyYXRvcihnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBpbnZva2UobWV0aG9kLCBhcmcsIHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKGdlbmVyYXRvclttZXRob2RdLCBnZW5lcmF0b3IsIGFyZyk7XG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICByZWplY3QocmVjb3JkLmFyZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcmVzdWx0ID0gcmVjb3JkLmFyZztcbiAgICAgICAgdmFyIHZhbHVlID0gcmVzdWx0LnZhbHVlO1xuICAgICAgICBpZiAodmFsdWUgJiZcbiAgICAgICAgICAgIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJlxuICAgICAgICAgICAgaGFzT3duLmNhbGwodmFsdWUsIFwiX19hd2FpdFwiKSkge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodmFsdWUuX19hd2FpdCkudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgaW52b2tlKFwibmV4dFwiLCB2YWx1ZSwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIGludm9rZShcInRocm93XCIsIGVyciwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodmFsdWUpLnRoZW4oZnVuY3Rpb24odW53cmFwcGVkKSB7XG4gICAgICAgICAgLy8gV2hlbiBhIHlpZWxkZWQgUHJvbWlzZSBpcyByZXNvbHZlZCwgaXRzIGZpbmFsIHZhbHVlIGJlY29tZXNcbiAgICAgICAgICAvLyB0aGUgLnZhbHVlIG9mIHRoZSBQcm9taXNlPHt2YWx1ZSxkb25lfT4gcmVzdWx0IGZvciB0aGVcbiAgICAgICAgICAvLyBjdXJyZW50IGl0ZXJhdGlvbi4gSWYgdGhlIFByb21pc2UgaXMgcmVqZWN0ZWQsIGhvd2V2ZXIsIHRoZVxuICAgICAgICAgIC8vIHJlc3VsdCBmb3IgdGhpcyBpdGVyYXRpb24gd2lsbCBiZSByZWplY3RlZCB3aXRoIHRoZSBzYW1lXG4gICAgICAgICAgLy8gcmVhc29uLiBOb3RlIHRoYXQgcmVqZWN0aW9ucyBvZiB5aWVsZGVkIFByb21pc2VzIGFyZSBub3RcbiAgICAgICAgICAvLyB0aHJvd24gYmFjayBpbnRvIHRoZSBnZW5lcmF0b3IgZnVuY3Rpb24sIGFzIGlzIHRoZSBjYXNlXG4gICAgICAgICAgLy8gd2hlbiBhbiBhd2FpdGVkIFByb21pc2UgaXMgcmVqZWN0ZWQuIFRoaXMgZGlmZmVyZW5jZSBpblxuICAgICAgICAgIC8vIGJlaGF2aW9yIGJldHdlZW4geWllbGQgYW5kIGF3YWl0IGlzIGltcG9ydGFudCwgYmVjYXVzZSBpdFxuICAgICAgICAgIC8vIGFsbG93cyB0aGUgY29uc3VtZXIgdG8gZGVjaWRlIHdoYXQgdG8gZG8gd2l0aCB0aGUgeWllbGRlZFxuICAgICAgICAgIC8vIHJlamVjdGlvbiAoc3dhbGxvdyBpdCBhbmQgY29udGludWUsIG1hbnVhbGx5IC50aHJvdyBpdCBiYWNrXG4gICAgICAgICAgLy8gaW50byB0aGUgZ2VuZXJhdG9yLCBhYmFuZG9uIGl0ZXJhdGlvbiwgd2hhdGV2ZXIpLiBXaXRoXG4gICAgICAgICAgLy8gYXdhaXQsIGJ5IGNvbnRyYXN0LCB0aGVyZSBpcyBubyBvcHBvcnR1bml0eSB0byBleGFtaW5lIHRoZVxuICAgICAgICAgIC8vIHJlamVjdGlvbiByZWFzb24gb3V0c2lkZSB0aGUgZ2VuZXJhdG9yIGZ1bmN0aW9uLCBzbyB0aGVcbiAgICAgICAgICAvLyBvbmx5IG9wdGlvbiBpcyB0byB0aHJvdyBpdCBmcm9tIHRoZSBhd2FpdCBleHByZXNzaW9uLCBhbmRcbiAgICAgICAgICAvLyBsZXQgdGhlIGdlbmVyYXRvciBmdW5jdGlvbiBoYW5kbGUgdGhlIGV4Y2VwdGlvbi5cbiAgICAgICAgICByZXN1bHQudmFsdWUgPSB1bndyYXBwZWQ7XG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9LCByZWplY3QpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBwcmV2aW91c1Byb21pc2U7XG5cbiAgICBmdW5jdGlvbiBlbnF1ZXVlKG1ldGhvZCwgYXJnKSB7XG4gICAgICBmdW5jdGlvbiBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZygpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgIGludm9rZShtZXRob2QsIGFyZywgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwcmV2aW91c1Byb21pc2UgPVxuICAgICAgICAvLyBJZiBlbnF1ZXVlIGhhcyBiZWVuIGNhbGxlZCBiZWZvcmUsIHRoZW4gd2Ugd2FudCB0byB3YWl0IHVudGlsXG4gICAgICAgIC8vIGFsbCBwcmV2aW91cyBQcm9taXNlcyBoYXZlIGJlZW4gcmVzb2x2ZWQgYmVmb3JlIGNhbGxpbmcgaW52b2tlLFxuICAgICAgICAvLyBzbyB0aGF0IHJlc3VsdHMgYXJlIGFsd2F5cyBkZWxpdmVyZWQgaW4gdGhlIGNvcnJlY3Qgb3JkZXIuIElmXG4gICAgICAgIC8vIGVucXVldWUgaGFzIG5vdCBiZWVuIGNhbGxlZCBiZWZvcmUsIHRoZW4gaXQgaXMgaW1wb3J0YW50IHRvXG4gICAgICAgIC8vIGNhbGwgaW52b2tlIGltbWVkaWF0ZWx5LCB3aXRob3V0IHdhaXRpbmcgb24gYSBjYWxsYmFjayB0byBmaXJlLFxuICAgICAgICAvLyBzbyB0aGF0IHRoZSBhc3luYyBnZW5lcmF0b3IgZnVuY3Rpb24gaGFzIHRoZSBvcHBvcnR1bml0eSB0byBkb1xuICAgICAgICAvLyBhbnkgbmVjZXNzYXJ5IHNldHVwIGluIGEgcHJlZGljdGFibGUgd2F5LiBUaGlzIHByZWRpY3RhYmlsaXR5XG4gICAgICAgIC8vIGlzIHdoeSB0aGUgUHJvbWlzZSBjb25zdHJ1Y3RvciBzeW5jaHJvbm91c2x5IGludm9rZXMgaXRzXG4gICAgICAgIC8vIGV4ZWN1dG9yIGNhbGxiYWNrLCBhbmQgd2h5IGFzeW5jIGZ1bmN0aW9ucyBzeW5jaHJvbm91c2x5XG4gICAgICAgIC8vIGV4ZWN1dGUgY29kZSBiZWZvcmUgdGhlIGZpcnN0IGF3YWl0LiBTaW5jZSB3ZSBpbXBsZW1lbnQgc2ltcGxlXG4gICAgICAgIC8vIGFzeW5jIGZ1bmN0aW9ucyBpbiB0ZXJtcyBvZiBhc3luYyBnZW5lcmF0b3JzLCBpdCBpcyBlc3BlY2lhbGx5XG4gICAgICAgIC8vIGltcG9ydGFudCB0byBnZXQgdGhpcyByaWdodCwgZXZlbiB0aG91Z2ggaXQgcmVxdWlyZXMgY2FyZS5cbiAgICAgICAgcHJldmlvdXNQcm9taXNlID8gcHJldmlvdXNQcm9taXNlLnRoZW4oXG4gICAgICAgICAgY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcsXG4gICAgICAgICAgLy8gQXZvaWQgcHJvcGFnYXRpbmcgZmFpbHVyZXMgdG8gUHJvbWlzZXMgcmV0dXJuZWQgYnkgbGF0ZXJcbiAgICAgICAgICAvLyBpbnZvY2F0aW9ucyBvZiB0aGUgaXRlcmF0b3IuXG4gICAgICAgICAgY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmdcbiAgICAgICAgKSA6IGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnKCk7XG4gICAgfVxuXG4gICAgLy8gRGVmaW5lIHRoZSB1bmlmaWVkIGhlbHBlciBtZXRob2QgdGhhdCBpcyB1c2VkIHRvIGltcGxlbWVudCAubmV4dCxcbiAgICAvLyAudGhyb3csIGFuZCAucmV0dXJuIChzZWUgZGVmaW5lSXRlcmF0b3JNZXRob2RzKS5cbiAgICB0aGlzLl9pbnZva2UgPSBlbnF1ZXVlO1xuICB9XG5cbiAgZGVmaW5lSXRlcmF0b3JNZXRob2RzKEFzeW5jSXRlcmF0b3IucHJvdG90eXBlKTtcbiAgQXN5bmNJdGVyYXRvci5wcm90b3R5cGVbYXN5bmNJdGVyYXRvclN5bWJvbF0gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIHJ1bnRpbWUuQXN5bmNJdGVyYXRvciA9IEFzeW5jSXRlcmF0b3I7XG5cbiAgLy8gTm90ZSB0aGF0IHNpbXBsZSBhc3luYyBmdW5jdGlvbnMgYXJlIGltcGxlbWVudGVkIG9uIHRvcCBvZlxuICAvLyBBc3luY0l0ZXJhdG9yIG9iamVjdHM7IHRoZXkganVzdCByZXR1cm4gYSBQcm9taXNlIGZvciB0aGUgdmFsdWUgb2ZcbiAgLy8gdGhlIGZpbmFsIHJlc3VsdCBwcm9kdWNlZCBieSB0aGUgaXRlcmF0b3IuXG4gIHJ1bnRpbWUuYXN5bmMgPSBmdW5jdGlvbihpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCkge1xuICAgIHZhciBpdGVyID0gbmV3IEFzeW5jSXRlcmF0b3IoXG4gICAgICB3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KVxuICAgICk7XG5cbiAgICByZXR1cm4gcnVudGltZS5pc0dlbmVyYXRvckZ1bmN0aW9uKG91dGVyRm4pXG4gICAgICA/IGl0ZXIgLy8gSWYgb3V0ZXJGbiBpcyBhIGdlbmVyYXRvciwgcmV0dXJuIHRoZSBmdWxsIGl0ZXJhdG9yLlxuICAgICAgOiBpdGVyLm5leHQoKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgIHJldHVybiByZXN1bHQuZG9uZSA/IHJlc3VsdC52YWx1ZSA6IGl0ZXIubmV4dCgpO1xuICAgICAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBtYWtlSW52b2tlTWV0aG9kKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpIHtcbiAgICB2YXIgc3RhdGUgPSBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZykge1xuICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZUV4ZWN1dGluZykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBydW5uaW5nXCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlQ29tcGxldGVkKSB7XG4gICAgICAgIGlmIChtZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIHRocm93IGFyZztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJlIGZvcmdpdmluZywgcGVyIDI1LjMuMy4zLjMgb2YgdGhlIHNwZWM6XG4gICAgICAgIC8vIGh0dHBzOi8vcGVvcGxlLm1vemlsbGEub3JnL35qb3JlbmRvcmZmL2VzNi1kcmFmdC5odG1sI3NlYy1nZW5lcmF0b3JyZXN1bWVcbiAgICAgICAgcmV0dXJuIGRvbmVSZXN1bHQoKTtcbiAgICAgIH1cblxuICAgICAgY29udGV4dC5tZXRob2QgPSBtZXRob2Q7XG4gICAgICBjb250ZXh0LmFyZyA9IGFyZztcblxuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgdmFyIGRlbGVnYXRlID0gY29udGV4dC5kZWxlZ2F0ZTtcbiAgICAgICAgaWYgKGRlbGVnYXRlKSB7XG4gICAgICAgICAgdmFyIGRlbGVnYXRlUmVzdWx0ID0gbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCk7XG4gICAgICAgICAgaWYgKGRlbGVnYXRlUmVzdWx0KSB7XG4gICAgICAgICAgICBpZiAoZGVsZWdhdGVSZXN1bHQgPT09IENvbnRpbnVlU2VudGluZWwpIGNvbnRpbnVlO1xuICAgICAgICAgICAgcmV0dXJuIGRlbGVnYXRlUmVzdWx0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJuZXh0XCIpIHtcbiAgICAgICAgICAvLyBTZXR0aW5nIGNvbnRleHQuX3NlbnQgZm9yIGxlZ2FjeSBzdXBwb3J0IG9mIEJhYmVsJ3NcbiAgICAgICAgICAvLyBmdW5jdGlvbi5zZW50IGltcGxlbWVudGF0aW9uLlxuICAgICAgICAgIGNvbnRleHQuc2VudCA9IGNvbnRleHQuX3NlbnQgPSBjb250ZXh0LmFyZztcblxuICAgICAgICB9IGVsc2UgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQpIHtcbiAgICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVDb21wbGV0ZWQ7XG4gICAgICAgICAgICB0aHJvdyBjb250ZXh0LmFyZztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb250ZXh0LmRpc3BhdGNoRXhjZXB0aW9uKGNvbnRleHQuYXJnKTtcblxuICAgICAgICB9IGVsc2UgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInJldHVyblwiKSB7XG4gICAgICAgICAgY29udGV4dC5hYnJ1cHQoXCJyZXR1cm5cIiwgY29udGV4dC5hcmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUV4ZWN1dGluZztcblxuICAgICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goaW5uZXJGbiwgc2VsZiwgY29udGV4dCk7XG4gICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIikge1xuICAgICAgICAgIC8vIElmIGFuIGV4Y2VwdGlvbiBpcyB0aHJvd24gZnJvbSBpbm5lckZuLCB3ZSBsZWF2ZSBzdGF0ZSA9PT1cbiAgICAgICAgICAvLyBHZW5TdGF0ZUV4ZWN1dGluZyBhbmQgbG9vcCBiYWNrIGZvciBhbm90aGVyIGludm9jYXRpb24uXG4gICAgICAgICAgc3RhdGUgPSBjb250ZXh0LmRvbmVcbiAgICAgICAgICAgID8gR2VuU3RhdGVDb21wbGV0ZWRcbiAgICAgICAgICAgIDogR2VuU3RhdGVTdXNwZW5kZWRZaWVsZDtcblxuICAgICAgICAgIGlmIChyZWNvcmQuYXJnID09PSBDb250aW51ZVNlbnRpbmVsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsdWU6IHJlY29yZC5hcmcsXG4gICAgICAgICAgICBkb25lOiBjb250ZXh0LmRvbmVcbiAgICAgICAgICB9O1xuXG4gICAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVDb21wbGV0ZWQ7XG4gICAgICAgICAgLy8gRGlzcGF0Y2ggdGhlIGV4Y2VwdGlvbiBieSBsb29waW5nIGJhY2sgYXJvdW5kIHRvIHRoZVxuICAgICAgICAgIC8vIGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oY29udGV4dC5hcmcpIGNhbGwgYWJvdmUuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSByZWNvcmQuYXJnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8vIENhbGwgZGVsZWdhdGUuaXRlcmF0b3JbY29udGV4dC5tZXRob2RdKGNvbnRleHQuYXJnKSBhbmQgaGFuZGxlIHRoZVxuICAvLyByZXN1bHQsIGVpdGhlciBieSByZXR1cm5pbmcgYSB7IHZhbHVlLCBkb25lIH0gcmVzdWx0IGZyb20gdGhlXG4gIC8vIGRlbGVnYXRlIGl0ZXJhdG9yLCBvciBieSBtb2RpZnlpbmcgY29udGV4dC5tZXRob2QgYW5kIGNvbnRleHQuYXJnLFxuICAvLyBzZXR0aW5nIGNvbnRleHQuZGVsZWdhdGUgdG8gbnVsbCwgYW5kIHJldHVybmluZyB0aGUgQ29udGludWVTZW50aW5lbC5cbiAgZnVuY3Rpb24gbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCkge1xuICAgIHZhciBtZXRob2QgPSBkZWxlZ2F0ZS5pdGVyYXRvcltjb250ZXh0Lm1ldGhvZF07XG4gICAgaWYgKG1ldGhvZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBBIC50aHJvdyBvciAucmV0dXJuIHdoZW4gdGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGhhcyBubyAudGhyb3dcbiAgICAgIC8vIG1ldGhvZCBhbHdheXMgdGVybWluYXRlcyB0aGUgeWllbGQqIGxvb3AuXG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcblxuICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgaWYgKGRlbGVnYXRlLml0ZXJhdG9yLnJldHVybikge1xuICAgICAgICAgIC8vIElmIHRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBoYXMgYSByZXR1cm4gbWV0aG9kLCBnaXZlIGl0IGFcbiAgICAgICAgICAvLyBjaGFuY2UgdG8gY2xlYW4gdXAuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInJldHVyblwiO1xuICAgICAgICAgIGNvbnRleHQuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgICAgIG1heWJlSW52b2tlRGVsZWdhdGUoZGVsZWdhdGUsIGNvbnRleHQpO1xuXG4gICAgICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgIC8vIElmIG1heWJlSW52b2tlRGVsZWdhdGUoY29udGV4dCkgY2hhbmdlZCBjb250ZXh0Lm1ldGhvZCBmcm9tXG4gICAgICAgICAgICAvLyBcInJldHVyblwiIHRvIFwidGhyb3dcIiwgbGV0IHRoYXQgb3ZlcnJpZGUgdGhlIFR5cGVFcnJvciBiZWxvdy5cbiAgICAgICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgICBjb250ZXh0LmFyZyA9IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgXCJUaGUgaXRlcmF0b3IgZG9lcyBub3QgcHJvdmlkZSBhICd0aHJvdycgbWV0aG9kXCIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG5cbiAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2gobWV0aG9kLCBkZWxlZ2F0ZS5pdGVyYXRvciwgY29udGV4dC5hcmcpO1xuXG4gICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgY29udGV4dC5hcmcgPSByZWNvcmQuYXJnO1xuICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG5cbiAgICB2YXIgaW5mbyA9IHJlY29yZC5hcmc7XG5cbiAgICBpZiAoISBpbmZvKSB7XG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgIGNvbnRleHQuYXJnID0gbmV3IFR5cGVFcnJvcihcIml0ZXJhdG9yIHJlc3VsdCBpcyBub3QgYW4gb2JqZWN0XCIpO1xuICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG5cbiAgICBpZiAoaW5mby5kb25lKSB7XG4gICAgICAvLyBBc3NpZ24gdGhlIHJlc3VsdCBvZiB0aGUgZmluaXNoZWQgZGVsZWdhdGUgdG8gdGhlIHRlbXBvcmFyeVxuICAgICAgLy8gdmFyaWFibGUgc3BlY2lmaWVkIGJ5IGRlbGVnYXRlLnJlc3VsdE5hbWUgKHNlZSBkZWxlZ2F0ZVlpZWxkKS5cbiAgICAgIGNvbnRleHRbZGVsZWdhdGUucmVzdWx0TmFtZV0gPSBpbmZvLnZhbHVlO1xuXG4gICAgICAvLyBSZXN1bWUgZXhlY3V0aW9uIGF0IHRoZSBkZXNpcmVkIGxvY2F0aW9uIChzZWUgZGVsZWdhdGVZaWVsZCkuXG4gICAgICBjb250ZXh0Lm5leHQgPSBkZWxlZ2F0ZS5uZXh0TG9jO1xuXG4gICAgICAvLyBJZiBjb250ZXh0Lm1ldGhvZCB3YXMgXCJ0aHJvd1wiIGJ1dCB0aGUgZGVsZWdhdGUgaGFuZGxlZCB0aGVcbiAgICAgIC8vIGV4Y2VwdGlvbiwgbGV0IHRoZSBvdXRlciBnZW5lcmF0b3IgcHJvY2VlZCBub3JtYWxseS4gSWZcbiAgICAgIC8vIGNvbnRleHQubWV0aG9kIHdhcyBcIm5leHRcIiwgZm9yZ2V0IGNvbnRleHQuYXJnIHNpbmNlIGl0IGhhcyBiZWVuXG4gICAgICAvLyBcImNvbnN1bWVkXCIgYnkgdGhlIGRlbGVnYXRlIGl0ZXJhdG9yLiBJZiBjb250ZXh0Lm1ldGhvZCB3YXNcbiAgICAgIC8vIFwicmV0dXJuXCIsIGFsbG93IHRoZSBvcmlnaW5hbCAucmV0dXJuIGNhbGwgdG8gY29udGludWUgaW4gdGhlXG4gICAgICAvLyBvdXRlciBnZW5lcmF0b3IuXG4gICAgICBpZiAoY29udGV4dC5tZXRob2QgIT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgY29udGV4dC5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gUmUteWllbGQgdGhlIHJlc3VsdCByZXR1cm5lZCBieSB0aGUgZGVsZWdhdGUgbWV0aG9kLlxuICAgICAgcmV0dXJuIGluZm87XG4gICAgfVxuXG4gICAgLy8gVGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGlzIGZpbmlzaGVkLCBzbyBmb3JnZXQgaXQgYW5kIGNvbnRpbnVlIHdpdGhcbiAgICAvLyB0aGUgb3V0ZXIgZ2VuZXJhdG9yLlxuICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICB9XG5cbiAgLy8gRGVmaW5lIEdlbmVyYXRvci5wcm90b3R5cGUue25leHQsdGhyb3cscmV0dXJufSBpbiB0ZXJtcyBvZiB0aGVcbiAgLy8gdW5pZmllZCAuX2ludm9rZSBoZWxwZXIgbWV0aG9kLlxuICBkZWZpbmVJdGVyYXRvck1ldGhvZHMoR3ApO1xuXG4gIEdwW3RvU3RyaW5nVGFnU3ltYm9sXSA9IFwiR2VuZXJhdG9yXCI7XG5cbiAgLy8gQSBHZW5lcmF0b3Igc2hvdWxkIGFsd2F5cyByZXR1cm4gaXRzZWxmIGFzIHRoZSBpdGVyYXRvciBvYmplY3Qgd2hlbiB0aGVcbiAgLy8gQEBpdGVyYXRvciBmdW5jdGlvbiBpcyBjYWxsZWQgb24gaXQuIFNvbWUgYnJvd3NlcnMnIGltcGxlbWVudGF0aW9ucyBvZiB0aGVcbiAgLy8gaXRlcmF0b3IgcHJvdG90eXBlIGNoYWluIGluY29ycmVjdGx5IGltcGxlbWVudCB0aGlzLCBjYXVzaW5nIHRoZSBHZW5lcmF0b3JcbiAgLy8gb2JqZWN0IHRvIG5vdCBiZSByZXR1cm5lZCBmcm9tIHRoaXMgY2FsbC4gVGhpcyBlbnN1cmVzIHRoYXQgZG9lc24ndCBoYXBwZW4uXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svcmVnZW5lcmF0b3IvaXNzdWVzLzI3NCBmb3IgbW9yZSBkZXRhaWxzLlxuICBHcFtpdGVyYXRvclN5bWJvbF0gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBHcC50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBcIltvYmplY3QgR2VuZXJhdG9yXVwiO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHB1c2hUcnlFbnRyeShsb2NzKSB7XG4gICAgdmFyIGVudHJ5ID0geyB0cnlMb2M6IGxvY3NbMF0gfTtcblxuICAgIGlmICgxIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmNhdGNoTG9jID0gbG9jc1sxXTtcbiAgICB9XG5cbiAgICBpZiAoMiBpbiBsb2NzKSB7XG4gICAgICBlbnRyeS5maW5hbGx5TG9jID0gbG9jc1syXTtcbiAgICAgIGVudHJ5LmFmdGVyTG9jID0gbG9jc1szXTtcbiAgICB9XG5cbiAgICB0aGlzLnRyeUVudHJpZXMucHVzaChlbnRyeSk7XG4gIH1cblxuICBmdW5jdGlvbiByZXNldFRyeUVudHJ5KGVudHJ5KSB7XG4gICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb24gfHwge307XG4gICAgcmVjb3JkLnR5cGUgPSBcIm5vcm1hbFwiO1xuICAgIGRlbGV0ZSByZWNvcmQuYXJnO1xuICAgIGVudHJ5LmNvbXBsZXRpb24gPSByZWNvcmQ7XG4gIH1cblxuICBmdW5jdGlvbiBDb250ZXh0KHRyeUxvY3NMaXN0KSB7XG4gICAgLy8gVGhlIHJvb3QgZW50cnkgb2JqZWN0IChlZmZlY3RpdmVseSBhIHRyeSBzdGF0ZW1lbnQgd2l0aG91dCBhIGNhdGNoXG4gICAgLy8gb3IgYSBmaW5hbGx5IGJsb2NrKSBnaXZlcyB1cyBhIHBsYWNlIHRvIHN0b3JlIHZhbHVlcyB0aHJvd24gZnJvbVxuICAgIC8vIGxvY2F0aW9ucyB3aGVyZSB0aGVyZSBpcyBubyBlbmNsb3NpbmcgdHJ5IHN0YXRlbWVudC5cbiAgICB0aGlzLnRyeUVudHJpZXMgPSBbeyB0cnlMb2M6IFwicm9vdFwiIH1dO1xuICAgIHRyeUxvY3NMaXN0LmZvckVhY2gocHVzaFRyeUVudHJ5LCB0aGlzKTtcbiAgICB0aGlzLnJlc2V0KHRydWUpO1xuICB9XG5cbiAgcnVudGltZS5rZXlzID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICB9XG4gICAga2V5cy5yZXZlcnNlKCk7XG5cbiAgICAvLyBSYXRoZXIgdGhhbiByZXR1cm5pbmcgYW4gb2JqZWN0IHdpdGggYSBuZXh0IG1ldGhvZCwgd2Uga2VlcFxuICAgIC8vIHRoaW5ncyBzaW1wbGUgYW5kIHJldHVybiB0aGUgbmV4dCBmdW5jdGlvbiBpdHNlbGYuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICB3aGlsZSAoa2V5cy5sZW5ndGgpIHtcbiAgICAgICAgdmFyIGtleSA9IGtleXMucG9wKCk7XG4gICAgICAgIGlmIChrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgbmV4dC52YWx1ZSA9IGtleTtcbiAgICAgICAgICBuZXh0LmRvbmUgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUbyBhdm9pZCBjcmVhdGluZyBhbiBhZGRpdGlvbmFsIG9iamVjdCwgd2UganVzdCBoYW5nIHRoZSAudmFsdWVcbiAgICAgIC8vIGFuZCAuZG9uZSBwcm9wZXJ0aWVzIG9mZiB0aGUgbmV4dCBmdW5jdGlvbiBvYmplY3QgaXRzZWxmLiBUaGlzXG4gICAgICAvLyBhbHNvIGVuc3VyZXMgdGhhdCB0aGUgbWluaWZpZXIgd2lsbCBub3QgYW5vbnltaXplIHRoZSBmdW5jdGlvbi5cbiAgICAgIG5leHQuZG9uZSA9IHRydWU7XG4gICAgICByZXR1cm4gbmV4dDtcbiAgICB9O1xuICB9O1xuXG4gIGZ1bmN0aW9uIHZhbHVlcyhpdGVyYWJsZSkge1xuICAgIGlmIChpdGVyYWJsZSkge1xuICAgICAgdmFyIGl0ZXJhdG9yTWV0aG9kID0gaXRlcmFibGVbaXRlcmF0b3JTeW1ib2xdO1xuICAgICAgaWYgKGl0ZXJhdG9yTWV0aG9kKSB7XG4gICAgICAgIHJldHVybiBpdGVyYXRvck1ldGhvZC5jYWxsKGl0ZXJhYmxlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBpdGVyYWJsZS5uZXh0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhYmxlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWlzTmFOKGl0ZXJhYmxlLmxlbmd0aCkpIHtcbiAgICAgICAgdmFyIGkgPSAtMSwgbmV4dCA9IGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAgICAgd2hpbGUgKCsraSA8IGl0ZXJhYmxlLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKGhhc093bi5jYWxsKGl0ZXJhYmxlLCBpKSkge1xuICAgICAgICAgICAgICBuZXh0LnZhbHVlID0gaXRlcmFibGVbaV07XG4gICAgICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZXh0LnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICAgIG5leHQuZG9uZSA9IHRydWU7XG5cbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gbmV4dC5uZXh0ID0gbmV4dDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gYW4gaXRlcmF0b3Igd2l0aCBubyB2YWx1ZXMuXG4gICAgcmV0dXJuIHsgbmV4dDogZG9uZVJlc3VsdCB9O1xuICB9XG4gIHJ1bnRpbWUudmFsdWVzID0gdmFsdWVzO1xuXG4gIGZ1bmN0aW9uIGRvbmVSZXN1bHQoKSB7XG4gICAgcmV0dXJuIHsgdmFsdWU6IHVuZGVmaW5lZCwgZG9uZTogdHJ1ZSB9O1xuICB9XG5cbiAgQ29udGV4dC5wcm90b3R5cGUgPSB7XG4gICAgY29uc3RydWN0b3I6IENvbnRleHQsXG5cbiAgICByZXNldDogZnVuY3Rpb24oc2tpcFRlbXBSZXNldCkge1xuICAgICAgdGhpcy5wcmV2ID0gMDtcbiAgICAgIHRoaXMubmV4dCA9IDA7XG4gICAgICAvLyBSZXNldHRpbmcgY29udGV4dC5fc2VudCBmb3IgbGVnYWN5IHN1cHBvcnQgb2YgQmFiZWwnc1xuICAgICAgLy8gZnVuY3Rpb24uc2VudCBpbXBsZW1lbnRhdGlvbi5cbiAgICAgIHRoaXMuc2VudCA9IHRoaXMuX3NlbnQgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLmRvbmUgPSBmYWxzZTtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICB0aGlzLm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgdGhpcy5hcmcgPSB1bmRlZmluZWQ7XG5cbiAgICAgIHRoaXMudHJ5RW50cmllcy5mb3JFYWNoKHJlc2V0VHJ5RW50cnkpO1xuXG4gICAgICBpZiAoIXNraXBUZW1wUmVzZXQpIHtcbiAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzKSB7XG4gICAgICAgICAgLy8gTm90IHN1cmUgYWJvdXQgdGhlIG9wdGltYWwgb3JkZXIgb2YgdGhlc2UgY29uZGl0aW9uczpcbiAgICAgICAgICBpZiAobmFtZS5jaGFyQXQoMCkgPT09IFwidFwiICYmXG4gICAgICAgICAgICAgIGhhc093bi5jYWxsKHRoaXMsIG5hbWUpICYmXG4gICAgICAgICAgICAgICFpc05hTigrbmFtZS5zbGljZSgxKSkpIHtcbiAgICAgICAgICAgIHRoaXNbbmFtZV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcblxuICAgICAgdmFyIHJvb3RFbnRyeSA9IHRoaXMudHJ5RW50cmllc1swXTtcbiAgICAgIHZhciByb290UmVjb3JkID0gcm9vdEVudHJ5LmNvbXBsZXRpb247XG4gICAgICBpZiAocm9vdFJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcm9vdFJlY29yZC5hcmc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJ2YWw7XG4gICAgfSxcblxuICAgIGRpc3BhdGNoRXhjZXB0aW9uOiBmdW5jdGlvbihleGNlcHRpb24pIHtcbiAgICAgIGlmICh0aGlzLmRvbmUpIHtcbiAgICAgICAgdGhyb3cgZXhjZXB0aW9uO1xuICAgICAgfVxuXG4gICAgICB2YXIgY29udGV4dCA9IHRoaXM7XG4gICAgICBmdW5jdGlvbiBoYW5kbGUobG9jLCBjYXVnaHQpIHtcbiAgICAgICAgcmVjb3JkLnR5cGUgPSBcInRocm93XCI7XG4gICAgICAgIHJlY29yZC5hcmcgPSBleGNlcHRpb247XG4gICAgICAgIGNvbnRleHQubmV4dCA9IGxvYztcblxuICAgICAgICBpZiAoY2F1Z2h0KSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGRpc3BhdGNoZWQgZXhjZXB0aW9uIHdhcyBjYXVnaHQgYnkgYSBjYXRjaCBibG9jayxcbiAgICAgICAgICAvLyB0aGVuIGxldCB0aGF0IGNhdGNoIGJsb2NrIGhhbmRsZSB0aGUgZXhjZXB0aW9uIG5vcm1hbGx5LlxuICAgICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gISEgY2F1Z2h0O1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb247XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA9PT0gXCJyb290XCIpIHtcbiAgICAgICAgICAvLyBFeGNlcHRpb24gdGhyb3duIG91dHNpZGUgb2YgYW55IHRyeSBibG9jayB0aGF0IGNvdWxkIGhhbmRsZVxuICAgICAgICAgIC8vIGl0LCBzbyBzZXQgdGhlIGNvbXBsZXRpb24gdmFsdWUgb2YgdGhlIGVudGlyZSBmdW5jdGlvbiB0b1xuICAgICAgICAgIC8vIHRocm93IHRoZSBleGNlcHRpb24uXG4gICAgICAgICAgcmV0dXJuIGhhbmRsZShcImVuZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPD0gdGhpcy5wcmV2KSB7XG4gICAgICAgICAgdmFyIGhhc0NhdGNoID0gaGFzT3duLmNhbGwoZW50cnksIFwiY2F0Y2hMb2NcIik7XG4gICAgICAgICAgdmFyIGhhc0ZpbmFsbHkgPSBoYXNPd24uY2FsbChlbnRyeSwgXCJmaW5hbGx5TG9jXCIpO1xuXG4gICAgICAgICAgaWYgKGhhc0NhdGNoICYmIGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5jYXRjaExvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmNhdGNoTG9jLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmZpbmFsbHlMb2MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIGlmIChoYXNDYXRjaCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIGlmIChoYXNGaW5hbGx5KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmZpbmFsbHlMb2MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInRyeSBzdGF0ZW1lbnQgd2l0aG91dCBjYXRjaCBvciBmaW5hbGx5XCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBhYnJ1cHQ6IGZ1bmN0aW9uKHR5cGUsIGFyZykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPD0gdGhpcy5wcmV2ICYmXG4gICAgICAgICAgICBoYXNPd24uY2FsbChlbnRyeSwgXCJmaW5hbGx5TG9jXCIpICYmXG4gICAgICAgICAgICB0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgdmFyIGZpbmFsbHlFbnRyeSA9IGVudHJ5O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkgJiZcbiAgICAgICAgICAodHlwZSA9PT0gXCJicmVha1wiIHx8XG4gICAgICAgICAgIHR5cGUgPT09IFwiY29udGludWVcIikgJiZcbiAgICAgICAgICBmaW5hbGx5RW50cnkudHJ5TG9jIDw9IGFyZyAmJlxuICAgICAgICAgIGFyZyA8PSBmaW5hbGx5RW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAvLyBJZ25vcmUgdGhlIGZpbmFsbHkgZW50cnkgaWYgY29udHJvbCBpcyBub3QganVtcGluZyB0byBhXG4gICAgICAgIC8vIGxvY2F0aW9uIG91dHNpZGUgdGhlIHRyeS9jYXRjaCBibG9jay5cbiAgICAgICAgZmluYWxseUVudHJ5ID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlY29yZCA9IGZpbmFsbHlFbnRyeSA/IGZpbmFsbHlFbnRyeS5jb21wbGV0aW9uIDoge307XG4gICAgICByZWNvcmQudHlwZSA9IHR5cGU7XG4gICAgICByZWNvcmQuYXJnID0gYXJnO1xuXG4gICAgICBpZiAoZmluYWxseUVudHJ5KSB7XG4gICAgICAgIHRoaXMubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgIHRoaXMubmV4dCA9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jO1xuICAgICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuY29tcGxldGUocmVjb3JkKTtcbiAgICB9LFxuXG4gICAgY29tcGxldGU6IGZ1bmN0aW9uKHJlY29yZCwgYWZ0ZXJMb2MpIHtcbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHRocm93IHJlY29yZC5hcmc7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJicmVha1wiIHx8XG4gICAgICAgICAgcmVjb3JkLnR5cGUgPT09IFwiY29udGludWVcIikge1xuICAgICAgICB0aGlzLm5leHQgPSByZWNvcmQuYXJnO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICB0aGlzLnJ2YWwgPSB0aGlzLmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgIHRoaXMubWV0aG9kID0gXCJyZXR1cm5cIjtcbiAgICAgICAgdGhpcy5uZXh0ID0gXCJlbmRcIjtcbiAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwibm9ybWFsXCIgJiYgYWZ0ZXJMb2MpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gYWZ0ZXJMb2M7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH0sXG5cbiAgICBmaW5pc2g6IGZ1bmN0aW9uKGZpbmFsbHlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkuZmluYWxseUxvYyA9PT0gZmluYWxseUxvYykge1xuICAgICAgICAgIHRoaXMuY29tcGxldGUoZW50cnkuY29tcGxldGlvbiwgZW50cnkuYWZ0ZXJMb2MpO1xuICAgICAgICAgIHJlc2V0VHJ5RW50cnkoZW50cnkpO1xuICAgICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIFwiY2F0Y2hcIjogZnVuY3Rpb24odHJ5TG9jKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA9PT0gdHJ5TG9jKSB7XG4gICAgICAgICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb247XG4gICAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgIHZhciB0aHJvd24gPSByZWNvcmQuYXJnO1xuICAgICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aHJvd247XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVGhlIGNvbnRleHQuY2F0Y2ggbWV0aG9kIG11c3Qgb25seSBiZSBjYWxsZWQgd2l0aCBhIGxvY2F0aW9uXG4gICAgICAvLyBhcmd1bWVudCB0aGF0IGNvcnJlc3BvbmRzIHRvIGEga25vd24gY2F0Y2ggYmxvY2suXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbGxlZ2FsIGNhdGNoIGF0dGVtcHRcIik7XG4gICAgfSxcblxuICAgIGRlbGVnYXRlWWllbGQ6IGZ1bmN0aW9uKGl0ZXJhYmxlLCByZXN1bHROYW1lLCBuZXh0TG9jKSB7XG4gICAgICB0aGlzLmRlbGVnYXRlID0ge1xuICAgICAgICBpdGVyYXRvcjogdmFsdWVzKGl0ZXJhYmxlKSxcbiAgICAgICAgcmVzdWx0TmFtZTogcmVzdWx0TmFtZSxcbiAgICAgICAgbmV4dExvYzogbmV4dExvY1xuICAgICAgfTtcblxuICAgICAgaWYgKHRoaXMubWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAvLyBEZWxpYmVyYXRlbHkgZm9yZ2V0IHRoZSBsYXN0IHNlbnQgdmFsdWUgc28gdGhhdCB3ZSBkb24ndFxuICAgICAgICAvLyBhY2NpZGVudGFsbHkgcGFzcyBpdCBvbiB0byB0aGUgZGVsZWdhdGUuXG4gICAgICAgIHRoaXMuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG4gIH07XG59KShcbiAgLy8gSW4gc2xvcHB5IG1vZGUsIHVuYm91bmQgYHRoaXNgIHJlZmVycyB0byB0aGUgZ2xvYmFsIG9iamVjdCwgZmFsbGJhY2sgdG9cbiAgLy8gRnVuY3Rpb24gY29uc3RydWN0b3IgaWYgd2UncmUgaW4gZ2xvYmFsIHN0cmljdCBtb2RlLiBUaGF0IGlzIHNhZGx5IGEgZm9ybVxuICAvLyBvZiBpbmRpcmVjdCBldmFsIHdoaWNoIHZpb2xhdGVzIENvbnRlbnQgU2VjdXJpdHkgUG9saWN5LlxuICAoZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzIH0pKCkgfHwgRnVuY3Rpb24oXCJyZXR1cm4gdGhpc1wiKSgpXG4pO1xuIiwiXG4vKipcbiAqIE1vZHVsZSBEZXBlbmRlbmNpZXNcbiAqL1xuXG52YXIgZXhwcjtcbnRyeSB7XG4gIGV4cHIgPSByZXF1aXJlKCdwcm9wcycpO1xufSBjYXRjaChlKSB7XG4gIGV4cHIgPSByZXF1aXJlKCdjb21wb25lbnQtcHJvcHMnKTtcbn1cblxuLyoqXG4gKiBFeHBvc2UgYHRvRnVuY3Rpb24oKWAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB0b0Z1bmN0aW9uO1xuXG4vKipcbiAqIENvbnZlcnQgYG9iamAgdG8gYSBgRnVuY3Rpb25gLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IG9ialxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiB0b0Z1bmN0aW9uKG9iaikge1xuICBzd2l0Y2ggKHt9LnRvU3RyaW5nLmNhbGwob2JqKSkge1xuICAgIGNhc2UgJ1tvYmplY3QgT2JqZWN0XSc6XG4gICAgICByZXR1cm4gb2JqZWN0VG9GdW5jdGlvbihvYmopO1xuICAgIGNhc2UgJ1tvYmplY3QgRnVuY3Rpb25dJzpcbiAgICAgIHJldHVybiBvYmo7XG4gICAgY2FzZSAnW29iamVjdCBTdHJpbmddJzpcbiAgICAgIHJldHVybiBzdHJpbmdUb0Z1bmN0aW9uKG9iaik7XG4gICAgY2FzZSAnW29iamVjdCBSZWdFeHBdJzpcbiAgICAgIHJldHVybiByZWdleHBUb0Z1bmN0aW9uKG9iaik7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBkZWZhdWx0VG9GdW5jdGlvbihvYmopO1xuICB9XG59XG5cbi8qKlxuICogRGVmYXVsdCB0byBzdHJpY3QgZXF1YWxpdHkuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGRlZmF1bHRUb0Z1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqKXtcbiAgICByZXR1cm4gdmFsID09PSBvYmo7XG4gIH07XG59XG5cbi8qKlxuICogQ29udmVydCBgcmVgIHRvIGEgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtSZWdFeHB9IHJlXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHJlZ2V4cFRvRnVuY3Rpb24ocmUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iail7XG4gICAgcmV0dXJuIHJlLnRlc3Qob2JqKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IHByb3BlcnR5IGBzdHJgIHRvIGEgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzdHJpbmdUb0Z1bmN0aW9uKHN0cikge1xuICAvLyBpbW1lZGlhdGUgc3VjaCBhcyBcIj4gMjBcIlxuICBpZiAoL14gKlxcVysvLnRlc3Qoc3RyKSkgcmV0dXJuIG5ldyBGdW5jdGlvbignXycsICdyZXR1cm4gXyAnICsgc3RyKTtcblxuICAvLyBwcm9wZXJ0aWVzIHN1Y2ggYXMgXCJuYW1lLmZpcnN0XCIgb3IgXCJhZ2UgPiAxOFwiIG9yIFwiYWdlID4gMTggJiYgYWdlIDwgMzZcIlxuICByZXR1cm4gbmV3IEZ1bmN0aW9uKCdfJywgJ3JldHVybiAnICsgZ2V0KHN0cikpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYG9iamVjdGAgdG8gYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0XG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG9iamVjdFRvRnVuY3Rpb24ob2JqKSB7XG4gIHZhciBtYXRjaCA9IHt9O1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgbWF0Y2hba2V5XSA9IHR5cGVvZiBvYmpba2V5XSA9PT0gJ3N0cmluZydcbiAgICAgID8gZGVmYXVsdFRvRnVuY3Rpb24ob2JqW2tleV0pXG4gICAgICA6IHRvRnVuY3Rpb24ob2JqW2tleV0pO1xuICB9XG4gIHJldHVybiBmdW5jdGlvbih2YWwpe1xuICAgIGlmICh0eXBlb2YgdmFsICE9PSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xuICAgIGZvciAodmFyIGtleSBpbiBtYXRjaCkge1xuICAgICAgaWYgKCEoa2V5IGluIHZhbCkpIHJldHVybiBmYWxzZTtcbiAgICAgIGlmICghbWF0Y2hba2V5XSh2YWxba2V5XSkpIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG59XG5cbi8qKlxuICogQnVpbHQgdGhlIGdldHRlciBmdW5jdGlvbi4gU3VwcG9ydHMgZ2V0dGVyIHN0eWxlIGZ1bmN0aW9uc1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGdldChzdHIpIHtcbiAgdmFyIHByb3BzID0gZXhwcihzdHIpO1xuICBpZiAoIXByb3BzLmxlbmd0aCkgcmV0dXJuICdfLicgKyBzdHI7XG5cbiAgdmFyIHZhbCwgaSwgcHJvcDtcbiAgZm9yIChpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgcHJvcCA9IHByb3BzW2ldO1xuICAgIHZhbCA9ICdfLicgKyBwcm9wO1xuICAgIHZhbCA9IFwiKCdmdW5jdGlvbicgPT0gdHlwZW9mIFwiICsgdmFsICsgXCIgPyBcIiArIHZhbCArIFwiKCkgOiBcIiArIHZhbCArIFwiKVwiO1xuXG4gICAgLy8gbWltaWMgbmVnYXRpdmUgbG9va2JlaGluZCB0byBhdm9pZCBwcm9ibGVtcyB3aXRoIG5lc3RlZCBwcm9wZXJ0aWVzXG4gICAgc3RyID0gc3RyaXBOZXN0ZWQocHJvcCwgc3RyLCB2YWwpO1xuICB9XG5cbiAgcmV0dXJuIHN0cjtcbn1cblxuLyoqXG4gKiBNaW1pYyBuZWdhdGl2ZSBsb29rYmVoaW5kIHRvIGF2b2lkIHByb2JsZW1zIHdpdGggbmVzdGVkIHByb3BlcnRpZXMuXG4gKlxuICogU2VlOiBodHRwOi8vYmxvZy5zdGV2ZW5sZXZpdGhhbi5jb20vYXJjaGl2ZXMvbWltaWMtbG9va2JlaGluZC1qYXZhc2NyaXB0XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHN0cmlwTmVzdGVkIChwcm9wLCBzdHIsIHZhbCkge1xuICByZXR1cm4gc3RyLnJlcGxhY2UobmV3IFJlZ0V4cCgnKFxcXFwuKT8nICsgcHJvcCwgJ2cnKSwgZnVuY3Rpb24oJDAsICQxKSB7XG4gICAgcmV0dXJuICQxID8gJDAgOiB2YWw7XG4gIH0pO1xufVxuIiwiZXhwb3J0IExvY2FsRm9yYWdlQWRhcHRlciBmcm9tICcuL2xvY2FsZm9yYWdlJztcbmV4cG9ydCBJbk1lbW9yeUFkYXB0ZXIgZnJvbSAnLi9pbm1lbW9yeSc7XG4iLCIvLyBAZmxvd1xuaW1wb3J0IHR5cGUgeyBJU3RvcmFnZSB9IGZyb20gJy4uLy4uL2ludGVyZmFjZXMvc3RvcmFnZSc7XG5pbXBvcnQgdHlwZSB7IElDb25maWcgfSBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL2NvbmZpZyc7XG5pbXBvcnQgdHlwZSBJVGFzayBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL3Rhc2snO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbk1lbW9yeUFkYXB0ZXIgaW1wbGVtZW50cyBJU3RvcmFnZSB7XG4gIGNvbmZpZzogSUNvbmZpZztcbiAgcHJlZml4OiBzdHJpbmc7XG4gIHN0b3JlOiB7IFtwcm9wOiBzdHJpbmddOiBhbnkgfSA9IHt9O1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogSUNvbmZpZykge1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgIHRoaXMucHJlZml4ID0gdGhpcy5jb25maWcuZ2V0KCdwcmVmaXgnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlIGl0ZW0gZnJvbSBzdG9yZSBieSBrZXlcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7UHJvbWlzZTxJVGFzaz59IChhcnJheSlcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGdldChuYW1lOiBzdHJpbmcpOiBQcm9taXNlPElUYXNrW10+IHtcbiAgICBjb25zdCBjb2xsTmFtZSA9IHRoaXMuc3RvcmFnZU5hbWUobmFtZSk7XG4gICAgcmV0dXJuIFsuLi50aGlzLmdldENvbGxlY3Rpb24oY29sbE5hbWUpXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgaXRlbSB0byBzdG9yZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHZhbHVlXG4gICAqIEByZXR1cm4ge1Byb21pc2U8QW55Pn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIHNldChrZXk6IHN0cmluZywgdmFsdWU6IGFueVtdKTogUHJvbWlzZTxhbnk+IHtcbiAgICB0aGlzLnN0b3JlW3RoaXMuc3RvcmFnZU5hbWUoa2V5KV0gPSBbLi4udmFsdWVdO1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdGVtIGNoZWNrZXIgaW4gc3RvcmVcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7UHJvbWlzZTxCb29sZWFuPn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGhhcyhrZXk6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5zdG9yZSwgdGhpcy5zdG9yYWdlTmFtZShrZXkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgaXRlbVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtQcm9taXNlPEFueT59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBjbGVhcihrZXk6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gKGF3YWl0IHRoaXMuaGFzKGtleSkpID8gZGVsZXRlIHRoaXMuc3RvcmVbdGhpcy5zdG9yYWdlTmFtZShrZXkpXSA6IGZhbHNlO1xuICAgIHRoaXMuc3RvcmUgPSB7IC4uLnRoaXMuc3RvcmUgfTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXBvc2UgY29sbGVjdGlvbiBuYW1lIGJ5IHN1ZmZpeFxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHN1ZmZpeFxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBzdG9yYWdlTmFtZShzdWZmaXg6IHN0cmluZykge1xuICAgIHJldHVybiBzdWZmaXguc3RhcnRzV2l0aCh0aGlzLmdldFByZWZpeCgpKSA/IHN1ZmZpeCA6IGAke3RoaXMuZ2V0UHJlZml4KCl9XyR7c3VmZml4fWA7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHByZWZpeCBvZiBjaGFubmVsIGNvbGxlY3Rpb25cbiAgICpcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgZ2V0UHJlZml4KCkge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZy5nZXQoJ3ByZWZpeCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjb2xsZWN0aW9uXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cbiAgZ2V0Q29sbGVjdGlvbihuYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBoYXMgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5zdG9yZSwgbmFtZSk7XG4gICAgaWYgKCFoYXMpIHRoaXMuc3RvcmVbbmFtZV0gPSBbXTtcbiAgICByZXR1cm4gdGhpcy5zdG9yZVtuYW1lXTtcbiAgfVxufVxuIiwiLy8gQGZsb3dcbmltcG9ydCBsb2NhbEZvcmFnZSBmcm9tICdsb2NhbGZvcmFnZSc7XG5pbXBvcnQgdHlwZSB7IElTdG9yYWdlIH0gZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9zdG9yYWdlJztcbmltcG9ydCB0eXBlIHsgSUNvbmZpZyB9IGZyb20gJy4uLy4uL2ludGVyZmFjZXMvY29uZmlnJztcbmltcG9ydCB0eXBlIElUYXNrIGZyb20gJy4uLy4uL2ludGVyZmFjZXMvdGFzayc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExvY2FsRm9yYWdlQWRhcHRlciBpbXBsZW1lbnRzIElTdG9yYWdlIHtcbiAgY29uZmlnOiBJQ29uZmlnO1xuICBkcml2ZXJzOiBzdHJpbmdbXSA9IFsnbG9jYWxzdG9yYWdlJywgJ2luZGV4ZWRkYicsICd3ZWJzcWwnXTtcbiAgcHJlZml4OiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBJQ29uZmlnKSB7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5wcmVmaXggPSB0aGlzLmNvbmZpZy5nZXQoJ3ByZWZpeCcpO1xuICAgIGxvY2FsRm9yYWdlLmNvbmZpZyh7IGRyaXZlcjogdGhpcy5nZXREcml2ZXIoKSwgbmFtZTogdGhpcy5wcmVmaXggfSk7XG4gIH1cblxuICAvKipcbiAgICogVGFrZSBpdGVtIGZyb20gc3RvcmFnZSBieSBrZXlcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7UHJvbWlzZTxJVGFzaz59IChhcnJheSlcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGdldChrZXk6IHN0cmluZyk6IFByb21pc2U8SVRhc2tbXT4ge1xuICAgIGNvbnN0IGl0ZW1zID0gYXdhaXQgbG9jYWxGb3JhZ2UuZ2V0SXRlbSh0aGlzLnN0b3JhZ2VOYW1lKGtleSkpO1xuICAgIHJldHVybiAodHlwZW9mIGl0ZW1zID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2UoaXRlbXMpIDogaXRlbXMpIHx8IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBpdGVtIHRvIGxvY2FsIHN0b3JhZ2VcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHBhcmFtICB7U3RyaW5nfSB2YWx1ZVxuICAgKiBAcmV0dXJuIHtQcm9taXNlPEFueT59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBzZXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBhbnlbXSk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgbG9jYWxGb3JhZ2Uuc2V0SXRlbSh0aGlzLnN0b3JhZ2VOYW1lKGtleSksIHZhbHVlKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIEl0ZW0gY2hlY2tlciBpbiBzdG9yYWdlXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge1Byb21pc2U8Qm9vbGVhbj59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBoYXMoa2V5OiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBrZXlzOiBzdHJpbmdbXSA9IGF3YWl0IGxvY2FsRm9yYWdlLmtleXMoKTtcbiAgICByZXR1cm4ga2V5cy5pbmRleE9mKHRoaXMuc3RvcmFnZU5hbWUoa2V5KSkgPiAtMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgaXRlbVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtQcm9taXNlPEFueT59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBjbGVhcihrZXk6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgbG9jYWxGb3JhZ2UucmVtb3ZlSXRlbSh0aGlzLnN0b3JhZ2VOYW1lKGtleSkpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFsbCBpdGVtc1xuICAgKlxuICAgKiBAcmV0dXJuIHtQcm9taXNlPEFueT59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBjbGVhckFsbCgpOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IGtleXM6IHN0cmluZ1tdID0gYXdhaXQgbG9jYWxGb3JhZ2Uua2V5cygpO1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IFByb21pc2UuYWxsKGtleXMubWFwKGFzeW5jIChrZXkpID0+IHtcbiAgICAgIGNvbnN0IGNsZWFyZWQgPSBhd2FpdCB0aGlzLmNsZWFyKGtleSk7XG4gICAgICByZXR1cm4gY2xlYXJlZDtcbiAgICB9KSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wb3NlIHN0b3JhZ2UgbmFtZSBieSBzdWZmaXhcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBzdWZmaXhcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgc3RvcmFnZU5hbWUoc3VmZml4OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gc3VmZml4LnN0YXJ0c1dpdGgodGhpcy5nZXRQcmVmaXgoKSkgPyBzdWZmaXggOiBgJHt0aGlzLmdldFByZWZpeCgpfV8ke3N1ZmZpeH1gO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBwcmVmaXggb2YgY2hhbm5lbCBzdG9yYWdlXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGdldFByZWZpeCgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWcuZ2V0KCdwcmVmaXgnKTtcbiAgfVxuXG4gIGdldERyaXZlcigpIHtcbiAgICBjb25zdCBkZWZhdWx0RHJpdmVyOiBzdHJpbmcgPSB0aGlzLmNvbmZpZy5nZXQoJ2RlZmF1bHRTdG9yYWdlJyk7XG4gICAgY29uc3QgZHJpdmVyOiBzdHJpbmcgPSAodGhpcy5jb25maWcuZ2V0KCdzdG9yYWdlJykgfHwgZGVmYXVsdERyaXZlcikudG9Mb3dlckNhc2UoKTtcbiAgICByZXR1cm4gdGhpcy5kcml2ZXJzLmluZGV4T2YoZHJpdmVyKSA+IC0xXG4gICAgICA/IGxvY2FsRm9yYWdlW2RyaXZlci50b1VwcGVyQ2FzZSgpXVxuICAgICAgOiBsb2NhbEZvcmFnZVtkZWZhdWx0RHJpdmVyLnRvVXBwZXJDYXNlKCldO1xuICB9XG59XG4iLCIvLyBAZmxvd1xuaW1wb3J0IHR5cGUgSVRhc2sgZnJvbSAnLi8uLi9pbnRlcmZhY2VzL3Rhc2snO1xuaW1wb3J0IHR5cGUgSUNvbmZpZyBmcm9tICcuLi9pbnRlcmZhY2VzL2NvbmZpZyc7XG5pbXBvcnQgRXZlbnQgZnJvbSAnLi9ldmVudCc7XG5pbXBvcnQgQ29udGFpbmVyIGZyb20gJy4vY29udGFpbmVyJztcbmltcG9ydCBTdG9yYWdlQ2Fwc3VsZSBmcm9tICcuL3N0b3JhZ2UtY2Fwc3VsZSc7XG5pbXBvcnQgUXVldWUgZnJvbSAnLi9xdWV1ZSc7XG5pbXBvcnQgeyB1dGlsQ2xlYXJCeVRhZyB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtcbiAgZGIsXG4gIGNhbk11bHRpcGxlLFxuICBzYXZlVGFzayxcbiAgbG9nUHJveHksXG4gIHJlZ2lzdGVyV29ya2VycyxcbiAgY3JlYXRlVGltZW91dCxcbiAgc3RhdHVzT2ZmLFxuICBzdG9wUXVldWUsXG4gIGdldFRhc2tzV2l0aG91dEZyZWV6ZWQsXG59IGZyb20gJy4vaGVscGVycyc7XG5pbXBvcnQge1xuICB0YXNrQWRkZWRMb2csXG4gIG5leHRUYXNrTG9nLFxuICBxdWV1ZVN0b3BwaW5nTG9nLFxuICBxdWV1ZVN0YXJ0TG9nLFxuICBldmVudENyZWF0ZWRMb2csXG59IGZyb20gJy4vY29uc29sZSc7XG5cbi8qIGVzbGludCBuby11bmRlcnNjb3JlLWRhbmdsZTogWzIsIHsgXCJhbGxvd1wiOiBbXCJfaWRcIl0gfV0gKi9cblxuY29uc3QgY2hhbm5lbE5hbWUgPSBTeW1ib2woJ2NoYW5uZWwtbmFtZScpO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDaGFubmVsIHtcbiAgc3RvcHBlZDogYm9vbGVhbiA9IHRydWU7XG4gIHJ1bm5pbmc6IGJvb2xlYW4gPSBmYWxzZTtcbiAgdGltZW91dDogbnVtYmVyO1xuICBzdG9yYWdlOiBTdG9yYWdlQ2Fwc3VsZTtcbiAgY29uZmlnOiBJQ29uZmlnO1xuICBldmVudCA9IG5ldyBFdmVudCgpO1xuICBjb250YWluZXIgPSBuZXcgQ29udGFpbmVyKCk7XG5cbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nLCBjb25maWc6IElDb25maWcpIHtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcblxuICAgIC8vIHNhdmUgY2hhbm5lbCBuYW1lIHRvIHRoaXMgY2xhc3Mgd2l0aCBzeW1ib2xpYyBrZXlcbiAgICAodGhpczogT2JqZWN0KVtjaGFubmVsTmFtZV0gPSBuYW1lO1xuXG4gICAgLy8gaWYgY3VzdG9tIHN0b3JhZ2UgZHJpdmVyIGV4aXN0cywgc2V0dXAgaXRcbiAgICBjb25zdCB7IGRyaXZlcnMgfTogYW55ID0gUXVldWU7XG4gICAgY29uc3Qgc3RvcmFnZSA9IG5ldyBTdG9yYWdlQ2Fwc3VsZShjb25maWcsIGRyaXZlcnMuc3RvcmFnZSk7XG4gICAgdGhpcy5zdG9yYWdlID0gc3RvcmFnZS5jaGFubmVsKG5hbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjaGFubmVsIG5hbWVcbiAgICpcbiAgICogQHJldHVybiB7U3RyaW5nfSBjaGFubmVsIG5hbWVcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIG5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gKHRoaXM6IE9iamVjdClbY2hhbm5lbE5hbWVdO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBuZXcgam9iIHRvIGNoYW5uZWxcbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSB0YXNrXG4gICAqIEByZXR1cm4ge1N0cmluZ3xCb29sZWFufSBqb2JcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGFkZCh0YXNrOiBJVGFzayk6IFByb21pc2U8c3RyaW5nIHwgYm9vbGVhbj4ge1xuICAgIGlmICghKGF3YWl0IGNhbk11bHRpcGxlLmNhbGwodGhpcywgdGFzaykpKSByZXR1cm4gZmFsc2U7XG5cbiAgICBjb25zdCBpZCA9IGF3YWl0IHNhdmVUYXNrLmNhbGwodGhpcywgdGFzayk7XG5cbiAgICBpZiAoaWQgJiYgdGhpcy5zdG9wcGVkICYmIHRoaXMucnVubmluZyA9PT0gdHJ1ZSkge1xuICAgICAgYXdhaXQgdGhpcy5zdGFydCgpO1xuICAgIH1cblxuICAgIC8vIHBhc3MgYWN0aXZpdHkgdG8gdGhlIGxvZyBzZXJ2aWNlLlxuICAgIGxvZ1Byb3h5LmNhbGwodGhpcywgdGFza0FkZGVkTG9nLCB0YXNrKTtcblxuICAgIHJldHVybiBpZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9jZXNzIG5leHQgam9iXG4gICAqXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBuZXh0KCk6IFByb21pc2U8dm9pZCB8IGJvb2xlYW4+IHtcbiAgICBpZiAodGhpcy5zdG9wcGVkKSB7XG4gICAgICBzdGF0dXNPZmYuY2FsbCh0aGlzKTtcbiAgICAgIHJldHVybiBzdG9wUXVldWUuY2FsbCh0aGlzKTtcbiAgICB9XG5cbiAgICAvLyBHZW5lcmF0ZSBhIGxvZyBtZXNzYWdlXG4gICAgbG9nUHJveHkuY2FsbCh0aGlzLCBuZXh0VGFza0xvZywgJ25leHQnKTtcblxuICAgIC8vIHN0YXJ0IHF1ZXVlIGFnYWluXG4gICAgYXdhaXQgdGhpcy5zdGFydCgpO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgcXVldWUgbGlzdGVuZXJcbiAgICpcbiAgICogQHJldHVybiB7Qm9vbGVhbn0gam9iXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBzdGFydCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAvLyBTdG9wIHRoZSBxdWV1ZSBmb3IgcmVzdGFydFxuICAgIHRoaXMuc3RvcHBlZCA9IGZhbHNlO1xuXG4gICAgLy8gUmVnaXN0ZXIgdGFza3MsIGlmIG5vdCByZWdpc3RlcmVkXG4gICAgcmVnaXN0ZXJXb3JrZXJzLmNhbGwodGhpcyk7XG5cbiAgICBsb2dQcm94eS5jYWxsKHRoaXMsIHF1ZXVlU3RhcnRMb2csICdzdGFydCcpO1xuXG4gICAgLy8gQ3JlYXRlIGEgdGltZW91dCBmb3Igc3RhcnQgcXVldWVcbiAgICB0aGlzLnJ1bm5pbmcgPSAoYXdhaXQgY3JlYXRlVGltZW91dC5jYWxsKHRoaXMpKSA+IDA7XG5cbiAgICByZXR1cm4gdGhpcy5ydW5uaW5nO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgcXVldWUgbGlzdGVuZXIgYWZ0ZXIgZW5kIG9mIGN1cnJlbnQgdGFza1xuICAgKlxuICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgc3RvcCgpOiB2b2lkIHtcbiAgICBsb2dQcm94eS5jYWxsKHRoaXMsIHF1ZXVlU3RvcHBpbmdMb2csICdzdG9wJyk7XG4gICAgdGhpcy5zdG9wcGVkID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wIHF1ZXVlIGxpc3RlbmVyIGluY2x1ZGluZyBjdXJyZW50IHRhc2tcbiAgICpcbiAgICogQHJldHVybiB7Vm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGZvcmNlU3RvcCgpOiB2b2lkIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIHN0b3BRdWV1ZS5jYWxsKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgdGhlcmUgaXMgYW55IHRhc2tcbiAgICpcbiAgICogQHJldHVybiB7Qm9vZWxhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGlzRW1wdHkoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmNvdW50KCkpIDwgMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGFzayBjb3VudFxuICAgKlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBjb3VudCgpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIHJldHVybiAoYXdhaXQgZ2V0VGFza3NXaXRob3V0RnJlZXplZC5jYWxsKHRoaXMpKS5sZW5ndGg7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRhc2sgY291bnQgYnkgdGFnXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gdGFnXG4gICAqIEByZXR1cm4ge0FycmF5PElUYXNrPn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGNvdW50QnlUYWcodGFnOiBzdHJpbmcpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIHJldHVybiAoYXdhaXQgZ2V0VGFza3NXaXRob3V0RnJlZXplZC5jYWxsKHRoaXMpKS5maWx0ZXIodCA9PiB0LnRhZyA9PT0gdGFnKS5sZW5ndGg7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFsbCB0YXNrcyBmcm9tIGNoYW5uZWxcbiAgICpcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGNsZWFyKCk6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy5uYW1lKCkpIHJldHVybiBmYWxzZTtcbiAgICB0aGlzLnN0b3JhZ2UuY2xlYXIodGhpcy5uYW1lKCkpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbGwgdGFza3MgZnJvbSBjaGFubmVsIGJ5IHRhZ1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHRhZ1xuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgY2xlYXJCeVRhZyh0YWc6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBkYi5jYWxsKHNlbGYpLmFsbCgpO1xuICAgIGNvbnN0IHJlbW92ZXMgPSBkYXRhLmZpbHRlcih1dGlsQ2xlYXJCeVRhZy5iaW5kKHRhZykpLm1hcChhc3luYyAodCkgPT4ge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZGIuY2FsbChzZWxmKS5kZWxldGUodC5faWQpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9KTtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChyZW1vdmVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBhIHRhc2sgd2hldGhlciBleGlzdHMgYnkgam9iIGlkXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gdGFnXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBoYXMoaWQ6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgZ2V0VGFza3NXaXRob3V0RnJlZXplZC5jYWxsKHRoaXMpKS5maW5kSW5kZXgodCA9PiB0Ll9pZCA9PT0gaWQpID4gLTE7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgYSB0YXNrIHdoZXRoZXIgZXhpc3RzIGJ5IHRhZ1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHRhZ1xuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgaGFzQnlUYWcodGFnOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gKGF3YWl0IGdldFRhc2tzV2l0aG91dEZyZWV6ZWQuY2FsbCh0aGlzKSkuZmluZEluZGV4KHQgPT4gdC50YWcgPT09IHRhZykgPiAtMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgYWN0aW9uIGV2ZW50c1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gY2JcbiAgICogQHJldHVybiB7Vm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIG9uKGtleTogc3RyaW5nLCBjYjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICB0aGlzLmV2ZW50Lm9uKC4uLltrZXksIGNiXSk7XG4gICAgbG9nUHJveHkuY2FsbCh0aGlzLCBldmVudENyZWF0ZWRMb2csIGtleSk7XG4gIH1cbn1cbiIsIi8qIEBmbG93ICovXG5pbXBvcnQgdHlwZSBJQ29uZmlnIGZyb20gJy4uL2ludGVyZmFjZXMvY29uZmlnJztcbmltcG9ydCBjb25maWdEYXRhIGZyb20gJy4vZW51bS9jb25maWcuZGF0YSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbmZpZyB7XG4gIGNvbmZpZzogSUNvbmZpZyA9IGNvbmZpZ0RhdGE7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBJQ29uZmlnID0ge30pIHtcbiAgICB0aGlzLm1lcmdlKGNvbmZpZyk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGNvbmZpZyB0byBnbG9iYWwgY29uZmlnIHJlZmVyZW5jZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtICB7QW55fSB2YWx1ZVxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgc2V0KG5hbWU6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQge1xuICAgIHRoaXMuY29uZmlnW25hbWVdID0gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgY29uZmlnXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHthbnl9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBnZXQobmFtZTogc3RyaW5nKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWdbbmFtZV07XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgY29uZmlnIHByb3BlcnR5XG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHthbnl9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBoYXMobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLmNvbmZpZywgbmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogTWVyZ2UgdHdvIGNvbmZpZyBvYmplY3RcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBtZXJnZShjb25maWc6IHsgW3N0cmluZ106IGFueSB9KTogdm9pZCB7XG4gICAgdGhpcy5jb25maWcgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmNvbmZpZywgY29uZmlnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYSBjb25maWdcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICByZW1vdmUobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGRlbGV0ZSB0aGlzLmNvbmZpZ1tuYW1lXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIGNvbmZpZ1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVcbiAgICogQHJldHVybiB7SUNvbmZpZ1tdfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYWxsKCk6IElDb25maWcge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZztcbiAgfVxufVxuIiwiLy8gQGZsb3dcbmltcG9ydCBvYmogZnJvbSAnb2JqZWN0LXBhdGgnO1xuaW1wb3J0IGxvZ0V2ZW50cyBmcm9tICcuL2VudW0vbG9nLmV2ZW50cyc7XG5cbi8qIGVzbGludCBuby1jb25zb2xlOiBbXCJlcnJvclwiLCB7IGFsbG93OiBbXCJsb2dcIiwgXCJncm91cENvbGxhcHNlZFwiLCBcImdyb3VwRW5kXCJdIH1dICovXG5cbmV4cG9ydCBmdW5jdGlvbiBsb2coLi4uYXJnczogYW55KSB7XG4gIGNvbnNvbGUubG9nKC4uLmFyZ3MpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdGFza0FkZGVkTG9nKFt0YXNrXTogYW55W10pIHtcbiAgbG9nKFxuICAgIGAlYygke3Rhc2suaGFuZGxlcn0pIC0+ICR7b2JqLmdldChsb2dFdmVudHMsICdxdWV1ZS5jcmVhdGVkJyl9YCxcbiAgICAnY29sb3I6IGdyZWVuO2ZvbnQtd2VpZ2h0OiBib2xkOycsXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBxdWV1ZVN0YXJ0TG9nKFt0eXBlXTogYW55W10pIHtcbiAgbG9nKFxuICAgIGAlYygke3R5cGV9KSAtPiDilrbvuI8gJHtvYmouZ2V0KGxvZ0V2ZW50cywgJ3F1ZXVlLnN0YXJ0aW5nJyl9YCxcbiAgICAnY29sb3I6ICMzZmE1ZjM7Zm9udC13ZWlnaHQ6IGJvbGQ7JyxcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5leHRUYXNrTG9nKFt0eXBlXTogYW55W10pIHtcbiAgbG9nKGAlYygke3R5cGV9KSAtPiDij63vuI8gJHtvYmouZ2V0KGxvZ0V2ZW50cywgJ3F1ZXVlLm5leHQnKX1gLCAnY29sb3I6ICMzZmE1ZjM7Zm9udC13ZWlnaHQ6IGJvbGQ7Jyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBxdWV1ZVN0b3BwaW5nTG9nKFt0eXBlXTogYW55W10pIHtcbiAgbG9nKFxuICAgIGAlYygke3R5cGV9KSAtPvCfmqYgJHtvYmouZ2V0KGxvZ0V2ZW50cywgJ3F1ZXVlLnN0b3BwaW5nJyl9YCxcbiAgICAnY29sb3I6ICNmZjdmOTQ7Zm9udC13ZWlnaHQ6IGJvbGQ7JyxcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHF1ZXVlU3RvcHBlZExvZyhbdHlwZV06IGFueVtdKSB7XG4gIGxvZyhcbiAgICBgJWMoJHt0eXBlfSkgLT4g8J+bkSAke29iai5nZXQobG9nRXZlbnRzLCAncXVldWUuc3RvcHBlZCcpfWAsXG4gICAgJ2NvbG9yOiAjZmY3Zjk0O2ZvbnQtd2VpZ2h0OiBib2xkOycsXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBxdWV1ZUVtcHR5TG9nKFt0eXBlXTogYW55W10pIHtcbiAgbG9nKGDwn5eR77iPICVjJHt0eXBlfSAke29iai5nZXQobG9nRXZlbnRzLCAncXVldWUuZW1wdHknKX1gLCAnY29sb3I6ICNmZjdmOTQ7Zm9udC13ZWlnaHQ6IGJvbGQ7Jyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBldmVudENyZWF0ZWRMb2coW2tleV06IGFueVtdKSB7XG4gIGxvZyhcbiAgICBgJWMoJHtrZXl9KSAtPiDwn46JICR7b2JqLmdldChsb2dFdmVudHMsICdldmVudC5jcmVhdGVkJyl9YCxcbiAgICAnY29sb3I6ICM2NmNlZTM7Zm9udC13ZWlnaHQ6IGJvbGQ7JyxcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV2ZW50RmlyZWRMb2coW2tleSwgbmFtZV06IGFueVtdKSB7XG4gIGxvZyhcbiAgICBgJWMoJHtrZXl9KSAtPiDwn46JICR7b2JqLmdldChsb2dFdmVudHMsIGBldmVudC4ke25hbWV9YCl9YCxcbiAgICAnY29sb3I6ICNhMGRjM2M7Zm9udC13ZWlnaHQ6IGJvbGQ7JyxcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vdEZvdW5kTG9nKFtuYW1lXTogYW55W10pIHtcbiAgbG9nKFxuICAgIGAlYygke25hbWV9KSAtPiDimqDvuI8gJHtvYmouZ2V0KGxvZ0V2ZW50cywgJ3F1ZXVlLm5vdC1mb3VuZCcpfWAsXG4gICAgJ2NvbG9yOiAjYTBkYzNjO2ZvbnQtd2VpZ2h0OiBib2xkOycsXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3b3JrZXJSdW5uaW5Mb2coW3dvcmtlciwgdGFzaywgZGVwc106IGFueVtdKSB7XG4gIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoYCR7d29ya2VyLm5hbWV9IC0gICR7dGFzay5sYWJlbH1gKTtcbiAgbG9nKGAlY2xhYmVsOiAke3Rhc2subGFiZWx9YCwgJ2NvbG9yOiBibHVlOycpO1xuICBsb2coYCVjaGFuZGxlcjogJHt0YXNrLmhhbmRsZXJ9YCwgJ2NvbG9yOiBibHVlOycpO1xuICBsb2coYCVjcHJpb3JpdHk6ICR7dGFzay5wcmlvcml0eX1gLCAnY29sb3I6IGJsdWU7Jyk7XG4gIGxvZyhgJWN1bmlxdWU6ICR7dGFzay51bmlxdWUgfHwgJ2ZhbHNlJ31gLCAnY29sb3I6IGJsdWU7Jyk7XG4gIGxvZyhgJWNyZXRyaWVkOiAke3Rhc2sudHJpZWQgfHwgJzAnfWAsICdjb2xvcjogYmx1ZTsnKTtcbiAgbG9nKGAlY3RhZzogJHt0YXNrLnRhZ31gLCAnY29sb3I6IGJsdWU7Jyk7XG4gIGxvZygnJWNhcmdzOicsICdjb2xvcjogYmx1ZTsnKTtcbiAgbG9nKHRhc2suYXJncyk7XG4gIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoJ2RlcGVuZGVuY2llcycpO1xuICBsb2coLi4uKGRlcHNbd29ya2VyLm5hbWVdIHx8IFtdKSk7XG4gIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdvcmtlckRvbmVMb2coW3Jlc3VsdF06IGFueVtdKSB7XG4gIGlmIChyZXN1bHQgPT09IHRydWUpIHtcbiAgICBsb2coJyVjVGFzayBjb21wbGV0ZWQhJywgJ2NvbG9yOiBncmVlbjsnKTtcbiAgfSBlbHNlIHtcbiAgICBsb2coJyVjVGFzayB3aWxsIGJlIHJldHJpZWQhJywgJ2NvbG9yOiAjZWY2MzYzOycpO1xuICB9XG4gIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdvcmtlckZhaWxlZExvZygpIHtcbiAgbG9nKCclY1Rhc2sgZmFpbGVkIScsICdjb2xvcjogcmVkOycpO1xuICBjb25zb2xlLmdyb3VwRW5kKCk7XG59XG4iLCIvKiBAZmxvdyAqL1xuaW1wb3J0IHR5cGUgSUNvbnRhaW5lciBmcm9tICcuLi9pbnRlcmZhY2VzL2NvbnRhaW5lcic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbnRhaW5lciBpbXBsZW1lbnRzIElDb250YWluZXIge1xuICBzdG9yZTogeyBbcHJvcGVydHk6IHN0cmluZ106IGFueSB9ID0ge307XG5cbiAgLyoqXG4gICAqIENoZWNrIGl0ZW0gaW4gY29udGFpbmVyXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gaWRcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGhhcyhpZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLnN0b3JlLCBpZCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGl0ZW0gZnJvbSBjb250YWluZXJcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBpZFxuICAgKiBAcmV0dXJuIHtBbnl9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBnZXQoaWQ6IHN0cmluZyk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmVbaWRdO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgaXRlbXMgZnJvbSBjb250YWluZXJcbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYWxsKCkge1xuICAgIHJldHVybiB0aGlzLnN0b3JlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBpdGVtIHRvIGNvbnRhaW5lclxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGlkXG4gICAqIEBwYXJhbSAge0FueX0gdmFsdWVcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGJpbmQoaWQ6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmVbaWRdID0gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogTWVyZ2UgY29udGluZXJzXG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gZGF0YVxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgbWVyZ2UoZGF0YTogeyBbcHJvcGVydHk6IHN0cmluZ106IGFueSB9ID0ge30pOiB2b2lkIHtcbiAgICB0aGlzLnN0b3JlID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5zdG9yZSwgZGF0YSk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGl0ZW0gZnJvbSBjb250YWluZXJcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBpZFxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgcmVtb3ZlKGlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBpZiAoIXRoaXMuaGFzKGlkKSkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiBkZWxldGUgdGhpcy5zdG9yZVtpZF07XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFsbCBpdGVtcyBmcm9tIGNvbnRhaW5lclxuICAgKlxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgcmVtb3ZlQWxsKCk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmUgPSB7fTtcbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQge1xuICBkZWZhdWx0U3RvcmFnZTogJ2xvY2Fsc3RvcmFnZScsXG4gIHByZWZpeDogJ3NxX2pvYnMnLFxuICB0aW1lb3V0OiAxMDAwLFxuICBsaW1pdDogLTEsXG4gIHByaW5jaXBsZTogJ2ZpZm8nLFxuICBkZWJ1ZzogdHJ1ZSxcbn07XG4iLCJleHBvcnQgZGVmYXVsdCB7XG4gIHF1ZXVlOiB7XG4gICAgY3JlYXRlZDogJ05ldyB0YXNrIGNyZWF0ZWQuJyxcbiAgICBuZXh0OiAnTmV4dCB0YXNrIHByb2Nlc3NpbmcuJyxcbiAgICBzdGFydGluZzogJ1F1ZXVlIGxpc3RlbmVyIHN0YXJ0aW5nLicsXG4gICAgc3RvcHBpbmc6ICdRdWV1ZSBsaXN0ZW5lciBzdG9wcGluZy4nLFxuICAgIHN0b3BwZWQ6ICdRdWV1ZSBsaXN0ZW5lciBzdG9wcGVkLicsXG4gICAgZW1wdHk6ICdjaGFubmVsIGlzIGVtcHR5Li4uJyxcbiAgICAnbm90LWZvdW5kJzogJ3dvcmtlciBub3QgZm91bmQnLFxuICAgIG9mZmxpbmU6ICdEaXNjb25uZWN0ZWQnLFxuICAgIG9ubGluZTogJ0Nvbm5lY3RlZCcsXG4gIH0sXG4gIGV2ZW50OiB7XG4gICAgY3JlYXRlZDogJ05ldyBldmVudCBjcmVhdGVkJyxcbiAgICBmaXJlZDogJ0V2ZW50IGZpcmVkLicsXG4gICAgJ3dpbGRjYXJkLWZpcmVkJzogJ1dpbGRjYXJkIGV2ZW50IGZpcmVkLicsXG4gIH0sXG59O1xuIiwiLyogZXNsaW50IGNsYXNzLW1ldGhvZHMtdXNlLXRoaXM6IFtcImVycm9yXCIsIHsgXCJleGNlcHRNZXRob2RzXCI6IFtcImdldE5hbWVcIiwgXCJnZXRUeXBlXCJdIH1dICovXG4vKiBlc2xpbnQtZW52IGVzNiAqL1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFdmVudCB7XG4gIHN0b3JlOiB7IFtwcm9wOiBzdHJpbmddOiBhbnkgfSA9IHt9O1xuICB2ZXJpZmllclBhdHRlcm46IHN0cmluZyA9IC9eW2EtejAtOS1fXSs6YmVmb3JlJHxhZnRlciR8cmV0cnkkfFxcKiQvO1xuICB3aWxkY2FyZHM6IHN0cmluZ1tdID0gWycqJywgJ2Vycm9yJ107XG4gIGVtcHR5RnVuYzogRnVuY3Rpb24gPSAoKSA9PiB7fTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnN0b3JlLmJlZm9yZSA9IHt9O1xuICAgIHRoaXMuc3RvcmUuYWZ0ZXIgPSB7fTtcbiAgICB0aGlzLnN0b3JlLnJldHJ5ID0ge307XG4gICAgdGhpcy5zdG9yZS53aWxkY2FyZCA9IHt9O1xuICAgIHRoaXMuc3RvcmUuZXJyb3IgPSB0aGlzLmVtcHR5RnVuYztcbiAgICB0aGlzLnN0b3JlWycqJ10gPSB0aGlzLmVtcHR5RnVuYztcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgZXZlbnRcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHBhcmFtICB7RnVuY3Rpb259IGNiXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBvbihrZXk6IHN0cmluZywgY2I6IEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgaWYgKHR5cGVvZiBjYiAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgbmV3IEVycm9yKCdFdmVudCBzaG91bGQgYmUgYW4gZnVuY3Rpb24nKTtcbiAgICBpZiAodGhpcy5pc1ZhbGlkKGtleSkpIHRoaXMuYWRkKGtleSwgY2IpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biBldmVudCB2aWEgaXQncyBrZXlcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHBhcmFtICB7QW55fSBhcmdzXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBlbWl0KGtleTogc3RyaW5nLCBhcmdzOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAodGhpcy53aWxkY2FyZHMuaW5kZXhPZihrZXkpID4gLTEpIHtcbiAgICAgIHRoaXMud2lsZGNhcmQoa2V5LCAuLi5ba2V5LCBhcmdzXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHR5cGU6IHN0cmluZyA9IHRoaXMuZ2V0VHlwZShrZXkpO1xuICAgICAgY29uc3QgbmFtZTogc3RyaW5nID0gdGhpcy5nZXROYW1lKGtleSk7XG5cbiAgICAgIGlmICh0aGlzLnN0b3JlW3R5cGVdKSB7XG4gICAgICAgIGNvbnN0IGNiOiBGdW5jdGlvbiA9IHRoaXMuc3RvcmVbdHlwZV1bbmFtZV0gfHwgdGhpcy5lbXB0eUZ1bmM7XG4gICAgICAgIGNiLmNhbGwobnVsbCwgYXJncyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy53aWxkY2FyZCgnKicsIGtleSwgYXJncyk7XG4gIH1cblxuICAvKipcbiAgICogUnVuIHdpbGRjYXJkIGV2ZW50c1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGFjdGlvbktleVxuICAgKiBAcGFyYW0gIHtBbnl9IGFyZ3NcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHdpbGRjYXJkKGtleTogc3RyaW5nLCBhY3Rpb25LZXk6IHN0cmluZywgYXJnczogYW55KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc3RvcmUud2lsZGNhcmRba2V5XSkge1xuICAgICAgdGhpcy5zdG9yZS53aWxkY2FyZFtrZXldLmNhbGwobnVsbCwgYWN0aW9uS2V5LCBhcmdzKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkIGV2ZW50IHRvIHN0b3JlXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjYlxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYWRkKGtleTogc3RyaW5nLCBjYjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICBpZiAodGhpcy53aWxkY2FyZHMuaW5kZXhPZihrZXkpID4gLTEpIHtcbiAgICAgIHRoaXMuc3RvcmUud2lsZGNhcmRba2V5XSA9IGNiO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB0eXBlOiBzdHJpbmcgPSB0aGlzLmdldFR5cGUoa2V5KTtcbiAgICAgIGNvbnN0IG5hbWU6IHN0cmluZyA9IHRoaXMuZ2V0TmFtZShrZXkpO1xuICAgICAgdGhpcy5zdG9yZVt0eXBlXVtuYW1lXSA9IGNiO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBldmVudCBpbiBzdG9yZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgaGFzKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGtleXM6IHN0cmluZ1tdID0ga2V5LnNwbGl0KCc6Jyk7XG4gICAgICByZXR1cm4ga2V5cy5sZW5ndGggPiAxID8gISF0aGlzLnN0b3JlW2tleXNbMV1dW2tleXNbMF1dIDogISF0aGlzLnN0b3JlLndpbGRjYXJkW2tleXNbMF1dO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IGV2ZW50IG5hbWUgYnkgcGFyc2Uga2V5XG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGdldE5hbWUoa2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBrZXkubWF0Y2goLyguKik6LiovKVsxXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZXZlbnQgdHlwZSBieSBwYXJzZSBrZXlcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgZ2V0VHlwZShrZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGtleS5tYXRjaCgvXlthLXowLTktX10rOiguKikvKVsxXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja2VyIG9mIGV2ZW50IGtleXNcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGlzVmFsaWQoa2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy52ZXJpZmllclBhdHRlcm4udGVzdChrZXkpIHx8IHRoaXMud2lsZGNhcmRzLmluZGV4T2Yoa2V5KSA+IC0xO1xuICB9XG59XG4iLCIvKiBAZmxvdyAqL1xuaW1wb3J0IHR5cGUgSVRhc2sgZnJvbSAnLi4vaW50ZXJmYWNlcy90YXNrJztcbmltcG9ydCB0eXBlIElXb3JrZXIgZnJvbSAnLi4vaW50ZXJmYWNlcy93b3JrZXInO1xuaW1wb3J0IFF1ZXVlIGZyb20gJy4vcXVldWUnO1xuaW1wb3J0IENoYW5uZWwgZnJvbSAnLi9jaGFubmVsJztcbmltcG9ydCBTdG9yYWdlQ2Fwc3VsZSBmcm9tICcuL3N0b3JhZ2UtY2Fwc3VsZSc7XG5pbXBvcnQgeyBleGNsdWRlU3BlY2lmaWNUYXNrcywgaGFzTWV0aG9kLCBpc0Z1bmN0aW9uIH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge1xuICBldmVudEZpcmVkTG9nLFxuICBxdWV1ZVN0b3BwZWRMb2csXG4gIHdvcmtlclJ1bm5pbkxvZyxcbiAgcXVldWVFbXB0eUxvZyxcbiAgbm90Rm91bmRMb2csXG4gIHdvcmtlckRvbmVMb2csXG4gIHdvcmtlckZhaWxlZExvZyxcbn0gZnJvbSAnLi9jb25zb2xlJztcblxuLyogZXNsaW50IG5vLXVuZGVyc2NvcmUtZGFuZ2xlOiBbMiwgeyBcImFsbG93XCI6IFtcIl9pZFwiXSB9XSAqL1xuLyogZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOiBcImVycm9yXCIgKi9cbi8qIGVzbGludCB1c2UtaXNuYW46IFwiZXJyb3JcIiAqL1xuXG4vKipcbiAqIFRhc2sgcHJpb3JpdHkgY29udHJvbGxlciBoZWxwZXJcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcmV0dXJuIHtJVGFza31cbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrUHJpb3JpdHkodGFzazogSVRhc2spOiBJVGFzayB7XG4gIHRhc2sucHJpb3JpdHkgPSB0YXNrLnByaW9yaXR5IHx8IDA7XG5cbiAgaWYgKHR5cGVvZiB0YXNrLnByaW9yaXR5ICE9PSAnbnVtYmVyJykgdGFzay5wcmlvcml0eSA9IDA7XG5cbiAgcmV0dXJuIHRhc2s7XG59XG5cbi8qKlxuICogU2hvcnRlbnMgZnVuY3Rpb24gdGhlIGRiIGJlbG9uZ3N0byBjdXJyZW50IGNoYW5uZWxcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcmV0dXJuIHtTdG9yYWdlQ2Fwc3VsZX1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRiKCk6IFN0b3JhZ2VDYXBzdWxlIHtcbiAgcmV0dXJuICh0aGlzOiBhbnkpLnN0b3JhZ2UuY2hhbm5lbCgodGhpczogYW55KS5uYW1lKCkpO1xufVxuXG4vKipcbiAqIEdldCB1bmZyZWV6ZWQgdGFza3MgYnkgdGhlIGZpbHRlciBmdW5jdGlvblxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEByZXR1cm4ge0lUYXNrfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VGFza3NXaXRob3V0RnJlZXplZCgpOiBQcm9taXNlPElUYXNrW10+IHtcbiAgcmV0dXJuIChhd2FpdCBkYi5jYWxsKHRoaXMpLmFsbCgpKS5maWx0ZXIoZXhjbHVkZVNwZWNpZmljVGFza3MuYmluZChbJ2ZyZWV6ZWQnXSkpO1xufVxuXG4vKipcbiAqIExvZyBwcm94eSBoZWxwZXJcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcmV0dXJuIHt2b2lkfVxuICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICogQHBhcmFtIHtzdHJpbmd9IGRhdGFcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gY29uZFxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9nUHJveHkod3JhcHBlckZ1bmM6IEZ1bmN0aW9uLCAuLi5hcmdzOiBhbnkpOiB2b2lkIHtcbiAgaWYgKCh0aGlzOiBhbnkpLmNvbmZpZy5nZXQoJ2RlYnVnJykgJiYgdHlwZW9mIHdyYXBwZXJGdW5jID09PSAnZnVuY3Rpb24nKSB7XG4gICAgd3JhcHBlckZ1bmMoYXJncyk7XG4gIH1cbn1cblxuLyoqXG4gKiBOZXcgdGFzayBzYXZlIGhlbHBlclxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqIEByZXR1cm4ge3N0cmluZ3xib29sZWFufVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVRhc2sodGFzazogSVRhc2spOiBQcm9taXNlPHN0cmluZyB8IGJvb2xlYW4+IHtcbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZGIuY2FsbCh0aGlzKS5zYXZlKGNoZWNrUHJpb3JpdHkodGFzaykpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFRhc2sgcmVtb3ZlIGhlbHBlclxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbW92ZVRhc2soaWQ6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICBjb25zdCByZXN1bHQgPSBhd2FpdCBkYi5jYWxsKHRoaXMpLmRlbGV0ZShpZCk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRXZlbnRzIGRpc3BhdGNoZXIgaGVscGVyXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAqIEByZXR1cm4ge3ZvaWR9XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXNwYXRjaEV2ZW50cyh0YXNrOiBJVGFzaywgdHlwZTogc3RyaW5nKTogYm9vbGVhbiB8IHZvaWQge1xuICBpZiAoISgndGFnJyBpbiB0YXNrKSkgcmV0dXJuIGZhbHNlO1xuXG4gIGNvbnN0IGV2ZW50cyA9IFtbYCR7dGFzay50YWd9OiR7dHlwZX1gLCAnZmlyZWQnXSwgW2Ake3Rhc2sudGFnfToqYCwgJ3dpbGRjYXJkLWZpcmVkJ11dO1xuXG4gIGV2ZW50cy5mb3JFYWNoKChlKSA9PiB7XG4gICAgdGhpcy5ldmVudC5lbWl0KGVbMF0sIHRhc2spO1xuICAgIGxvZ1Byb3h5LmNhbGwoKHRoaXM6IGFueSksIGV2ZW50RmlyZWRMb2csIC4uLmUpO1xuICB9KTtcblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBRdWV1ZSBzdG9wcGVyIGhlbHBlclxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEByZXR1cm4ge3ZvaWR9XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdG9wUXVldWUoKTogdm9pZCB7XG4gIHRoaXMuc3RvcCgpO1xuXG4gIGNsZWFyVGltZW91dCh0aGlzLmN1cnJlbnRUaW1lb3V0KTtcblxuICBsb2dQcm94eS5jYWxsKHRoaXMsIHF1ZXVlU3RvcHBlZExvZywgJ3N0b3AnKTtcbn1cblxuLyoqXG4gKiBGYWlsZWQgam9iIGhhbmRsZXJcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcmV0dXJuIHtJVGFza30gam9iXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZhaWxlZEpvYkhhbmRsZXIodGFzazogSVRhc2spOiBQcm9taXNlPEZ1bmN0aW9uPiB7XG4gIHJldHVybiBhc3luYyBmdW5jdGlvbiBjaGlsZEZhaWxlZEhhbmRsZXIoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmVtb3ZlVGFzay5jYWxsKHRoaXMsIHRhc2suX2lkKTtcblxuICAgIHRoaXMuZXZlbnQuZW1pdCgnZXJyb3InLCB0YXNrKTtcblxuICAgIGxvZ1Byb3h5LmNhbGwodGhpcywgd29ya2VyRmFpbGVkTG9nKTtcblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgYXdhaXQgdGhpcy5uZXh0KCk7XG4gIH07XG59XG5cbi8qKlxuICogSGVscGVyIG9mIHRoZSBsb2NrIHRhc2sgb2YgdGhlIGN1cnJlbnQgam9iXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvY2tUYXNrKHRhc2s6IElUYXNrKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRiLmNhbGwodGhpcykudXBkYXRlKHRhc2suX2lkLCB7IGxvY2tlZDogdHJ1ZSB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBDbGFzcyBldmVudCBsdWFuY2hlciBoZWxwZXJcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtJV29ya2VyfSB3b3JrZXJcbiAqIEBwYXJhbSB7YW55fSBhcmdzXG4gKiBAcmV0dXJuIHtib29sZWFufHZvaWR9XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaXJlSm9iSW5saW5lRXZlbnQobmFtZTogc3RyaW5nLCB3b3JrZXI6IElXb3JrZXIsIGFyZ3M6IGFueSk6IGJvb2xlYW4ge1xuICBpZiAoaGFzTWV0aG9kKHdvcmtlciwgbmFtZSkgJiYgaXNGdW5jdGlvbih3b3JrZXJbbmFtZV0pKSB7XG4gICAgd29ya2VyW25hbWVdLmNhbGwod29ya2VyLCBhcmdzKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogUHJvY2VzcyBoYW5kbGVyIG9mIHN1Y2NlZWRlZCBqb2JcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcmV0dXJuIHt2b2lkfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3VjY2Vzc1Byb2Nlc3ModGFzazogSVRhc2spOiB2b2lkIHtcbiAgcmVtb3ZlVGFzay5jYWxsKHRoaXMsIHRhc2suX2lkKTtcbn1cblxuLyoqXG4gKiBVcGRhdGUgdGFzaydzIHJldHJ5IHZhbHVlXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHBhcmFtIHtJV29ya2VyfSB3b3JrZXJcbiAqIEByZXR1cm4ge0lUYXNrfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlUmV0cnkodGFzazogSVRhc2ssIHdvcmtlcjogSVdvcmtlcik6IElUYXNrIHtcbiAgaWYgKCEoJ3JldHJ5JyBpbiB3b3JrZXIpKSB3b3JrZXIucmV0cnkgPSAxO1xuXG4gIGlmICghKCd0cmllZCcgaW4gdGFzaykpIHtcbiAgICB0YXNrLnRyaWVkID0gMDtcbiAgICB0YXNrLnJldHJ5ID0gd29ya2VyLnJldHJ5O1xuICB9XG5cbiAgdGFzay50cmllZCArPSAxO1xuXG4gIGlmICh0YXNrLnRyaWVkID49IHdvcmtlci5yZXRyeSkge1xuICAgIHRhc2suZnJlZXplZCA9IHRydWU7XG4gIH1cblxuICByZXR1cm4gdGFzaztcbn1cblxuLyoqXG4gKiBQcm9jZXNzIGhhbmRsZXIgb2YgcmV0cmllZCBqb2JcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcGFyYW0ge0lXb3JrZXJ9IHdvcmtlclxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJldHJ5UHJvY2Vzcyh0YXNrOiBJVGFzaywgd29ya2VyOiBJV29ya2VyKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIC8vIGRpc3BhY3RoIGN1c3RvbSByZXRyeSBldmVudFxuICBkaXNwYXRjaEV2ZW50cy5jYWxsKHRoaXMsIHRhc2ssICdyZXRyeScpO1xuXG4gIC8vIHVwZGF0ZSByZXRyeSB2YWx1ZVxuICBjb25zdCB1cGRhdGVUYXNrOiBJVGFzayA9IHVwZGF0ZVJldHJ5LmNhbGwodGhpcywgdGFzaywgd29ya2VyKTtcblxuICAvLyBkZWxldGUgbG9jayBwcm9wZXJ0eSBmb3IgbmV4dCBwcm9jZXNzXG4gIHVwZGF0ZVRhc2subG9ja2VkID0gZmFsc2U7XG5cbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZGIuY2FsbCh0aGlzKS51cGRhdGUodGFzay5faWQsIHVwZGF0ZVRhc2spO1xuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogU3VjY2VlZCBqb2IgaGFuZGxlclxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqIEBwYXJhbSB7SVdvcmtlcn0gd29ya2VyXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN1Y2Nlc3NKb2JIYW5kbGVyKHRhc2s6IElUYXNrLCB3b3JrZXI6IElXb3JrZXIpOiBQcm9taXNlPEZ1bmN0aW9uPiB7XG4gIGNvbnN0IHNlbGY6IENoYW5uZWwgPSB0aGlzO1xuICByZXR1cm4gYXN5bmMgZnVuY3Rpb24gY2hpbGRTdWNjZXNzSm9iSGFuZGxlcihyZXN1bHQ6IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBkaXNwYXRjaCBqb2IgcHJvY2VzcyBhZnRlciBydW5zIGEgdGFzayBidXQgb25seSBub24gZXJyb3Igam9ic1xuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIC8vIGdvIGFoZWFkIHRvIHN1Y2Nlc3MgcHJvY2Vzc1xuICAgICAgc3VjY2Vzc1Byb2Nlc3MuY2FsbChzZWxmLCB0YXNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZ28gYWhlYWQgdG8gcmV0cnkgcHJvY2Vzc1xuICAgICAgcmV0cnlQcm9jZXNzLmNhbGwoc2VsZiwgdGFzaywgd29ya2VyKTtcbiAgICB9XG5cbiAgICAvLyBmaXJlIGpvYiBhZnRlciBldmVudFxuICAgIGZpcmVKb2JJbmxpbmVFdmVudC5jYWxsKHNlbGYsICdhZnRlcicsIHdvcmtlciwgdGFzay5hcmdzKTtcblxuICAgIC8vIGRpc3BhY3RoIGN1c3RvbSBhZnRlciBldmVudFxuICAgIGRpc3BhdGNoRXZlbnRzLmNhbGwoc2VsZiwgdGFzaywgJ2FmdGVyJyk7XG5cbiAgICAvLyBzaG93IGNvbnNvbGVcbiAgICBsb2dQcm94eS5jYWxsKHNlbGYsIHdvcmtlckRvbmVMb2csIHJlc3VsdCk7XG5cbiAgICAvLyB0cnkgbmV4dCBxdWV1ZSBqb2JcbiAgICBhd2FpdCBzZWxmLm5leHQoKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBKb2IgaGFuZGxlciBoZWxwZXJcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcGFyYW0ge0lKb2J9IHdvcmtlclxuICogQHBhcmFtIHtJV29ya2VyfSB3b3JrZXJJbnN0YW5jZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0IC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovIGZ1bmN0aW9uIGxvb3BIYW5kbGVyKFxuICB0YXNrOiBJVGFzayxcbiAgd29ya2VyOiBGdW5jdGlvbixcbiAgd29ya2VySW5zdGFuY2U6IElXb3JrZXIsXG4pOiBGdW5jdGlvbiB7XG4gIHJldHVybiBhc3luYyBmdW5jdGlvbiBjaGlsZExvb3BIYW5kbGVyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHNlbGY6IENoYW5uZWwgPSB0aGlzO1xuXG4gICAgLy8gbG9jayB0aGUgY3VycmVudCB0YXNrIGZvciBwcmV2ZW50IHJhY2UgY29uZGl0aW9uXG4gICAgYXdhaXQgbG9ja1Rhc2suY2FsbChzZWxmLCB0YXNrKTtcblxuICAgIC8vIGZpcmUgam9iIGJlZm9yZSBldmVudFxuICAgIGZpcmVKb2JJbmxpbmVFdmVudC5jYWxsKHRoaXMsICdiZWZvcmUnLCB3b3JrZXJJbnN0YW5jZSwgdGFzay5hcmdzKTtcblxuICAgIC8vIGRpc3BhY3RoIGN1c3RvbSBiZWZvcmUgZXZlbnRcbiAgICBkaXNwYXRjaEV2ZW50cy5jYWxsKHRoaXMsIHRhc2ssICdiZWZvcmUnKTtcblxuICAgIGNvbnN0IGRlcHMgPSBRdWV1ZS53b3JrZXJEZXBzW3dvcmtlci5uYW1lXTtcblxuICAgIC8vIHByZXBhcmluZyB3b3JrZXIgZGVwZW5kZW5jaWVzXG4gICAgY29uc3QgZGVwZW5kZW5jaWVzID0gT2JqZWN0LnZhbHVlcyhkZXBzIHx8IHt9KTtcblxuICAgIGxvZ1Byb3h5LmNhbGwodGhpcywgd29ya2VyUnVubmluTG9nLCB3b3JrZXIsIHRhc2ssIFF1ZXVlLndvcmtlckRlcHMpO1xuXG4gICAgLy8gVGFzayBydW5uZXIgcHJvbWlzZVxuICAgIHdvcmtlckluc3RhbmNlLmhhbmRsZVxuICAgICAgLmNhbGwod29ya2VySW5zdGFuY2UsIHRhc2suYXJncywgLi4uZGVwZW5kZW5jaWVzKVxuICAgICAgLnRoZW4oKGF3YWl0IHN1Y2Nlc3NKb2JIYW5kbGVyLmNhbGwoc2VsZiwgdGFzaywgd29ya2VySW5zdGFuY2UpKS5iaW5kKHNlbGYpKVxuICAgICAgLmNhdGNoKChhd2FpdCBmYWlsZWRKb2JIYW5kbGVyLmNhbGwoc2VsZiwgdGFzaykpLmJpbmQoc2VsZikpO1xuICB9O1xufVxuXG4vKipcbiAqIFRpbWVvdXQgY3JlYXRvciBoZWxwZXJcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGVUaW1lb3V0KCk6IFByb21pc2U8bnVtYmVyPiB7XG4gIC8vIGlmIHJ1bm5pbmcgYW55IGpvYiwgc3RvcCBpdFxuICAvLyB0aGUgcHVycG9zZSBoZXJlIGlzIHRvIHByZXZlbnQgY29jdXJyZW50IG9wZXJhdGlvbiBpbiBzYW1lIGNoYW5uZWxcbiAgY2xlYXJUaW1lb3V0KHRoaXMuY3VycmVudFRpbWVvdXQpO1xuXG4gIC8vIEdldCBuZXh0IHRhc2tcbiAgY29uc3QgdGFzazogSVRhc2sgPSAoYXdhaXQgZGIuY2FsbCh0aGlzKS5mZXRjaCgpKS5zaGlmdCgpO1xuXG4gIGlmICh0YXNrID09PSB1bmRlZmluZWQpIHtcbiAgICBsb2dQcm94eS5jYWxsKHRoaXMsIHF1ZXVlRW1wdHlMb2csIHRoaXMubmFtZSgpKTtcbiAgICBzdG9wUXVldWUuY2FsbCh0aGlzKTtcbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIGlmICghdGhpcy5jb250YWluZXIuaGFzKHRhc2suaGFuZGxlcikpIHtcbiAgICBsb2dQcm94eS5jYWxsKHRoaXMsIG5vdEZvdW5kTG9nLCB0YXNrLmhhbmRsZXIpO1xuICAgIGF3YWl0IChhd2FpdCBmYWlsZWRKb2JIYW5kbGVyLmNhbGwodGhpcywgdGFzaykpLmNhbGwodGhpcyk7XG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICAvLyBHZXQgd29ya2VyIHdpdGggaGFuZGxlciBuYW1lXG4gIGNvbnN0IEpvYldvcmtlcjogRnVuY3Rpb24gPSB0aGlzLmNvbnRhaW5lci5nZXQodGFzay5oYW5kbGVyKTtcblxuICAvLyBDcmVhdGUgYSB3b3JrZXIgaW5zdGFuY2VcbiAgY29uc3Qgd29ya2VySW5zdGFuY2U6IElXb3JrZXIgPSBuZXcgSm9iV29ya2VyKCk7XG5cbiAgLy8gZ2V0IGFsd2F5cyBsYXN0IHVwZGF0ZWQgY29uZmlnIHZhbHVlXG4gIGNvbnN0IHRpbWVvdXQ6IG51bWJlciA9IHRoaXMuY29uZmlnLmdldCgndGltZW91dCcpO1xuXG4gIC8vIGNyZWF0ZSBhIGFycmF5IHdpdGggaGFuZGxlciBwYXJhbWV0ZXJzIGZvciBzaG9ydGVuIGxpbmUgbnVtYmVyc1xuICBjb25zdCBwYXJhbXMgPSBbdGFzaywgSm9iV29ya2VyLCB3b3JrZXJJbnN0YW5jZV07XG5cbiAgLy8gR2V0IGhhbmRsZXIgZnVuY3Rpb24gZm9yIGhhbmRsZSBvbiBjb21wbGV0ZWQgZXZlbnRcbiAgY29uc3QgaGFuZGxlcjogRnVuY3Rpb24gPSAoYXdhaXQgbG9vcEhhbmRsZXIuY2FsbCh0aGlzLCAuLi5wYXJhbXMpKS5iaW5kKHRoaXMpO1xuXG4gIC8vIGNyZWF0ZSBuZXcgdGltZW91dCBmb3IgcHJvY2VzcyBhIGpvYiBpbiBxdWV1ZVxuICAvLyBiaW5kaW5nIGxvb3BIYW5kbGVyIGZ1bmN0aW9uIHRvIHNldFRpbWVvdXRcbiAgLy8gdGhlbiByZXR1cm4gdGhlIHRpbWVvdXQgaW5zdGFuY2VcbiAgdGhpcy5jdXJyZW50VGltZW91dCA9IHNldFRpbWVvdXQoaGFuZGxlciwgdGltZW91dCk7XG5cbiAgcmV0dXJuIHRoaXMuY3VycmVudFRpbWVvdXQ7XG59XG5cbi8qKlxuICogU2V0IHRoZSBzdGF0dXMgdG8gZmFsc2Ugb2YgcXVldWVcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcmV0dXJuIHt2b2lkfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RhdHVzT2ZmKCk6IHZvaWQge1xuICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciBhIHRhc2sgaXMgcmVwbGljYWJsZSBvciBub3RcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2FuTXVsdGlwbGUodGFzazogSVRhc2spOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgaWYgKHR5cGVvZiB0YXNrICE9PSAnb2JqZWN0JyB8fCB0YXNrLnVuaXF1ZSAhPT0gdHJ1ZSkgcmV0dXJuIHRydWU7XG4gIHJldHVybiAoYXdhaXQgdGhpcy5oYXNCeVRhZyh0YXNrLnRhZykpID09PSBmYWxzZTtcbn1cblxuLyoqXG4gKiBKb2IgaGFuZGxlciBjbGFzcyByZWdpc3RlclxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqIEBwYXJhbSB7SVdvcmtlcn0gd29ya2VyXG4gKiBAcmV0dXJuIHt2b2lkfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJXb3JrZXJzKCk6IGJvb2xlYW4ge1xuICBpZiAoUXVldWUuaXNSZWdpc3RlcmVkKSByZXR1cm4gZmFsc2U7XG5cbiAgY29uc3Qgd29ya2VycyA9IFF1ZXVlLnF1ZXVlV29ya2VycyB8fCB7fTtcblxuICB0aGlzLmNvbnRhaW5lci5tZXJnZSh3b3JrZXJzKTtcblxuICBRdWV1ZS5pc1JlZ2lzdGVyZWQgPSB0cnVlO1xuXG4gIHJldHVybiB0cnVlO1xufVxuIiwiaW1wb3J0IFF1ZXVlIGZyb20gJy4vcXVldWUnO1xuXG4vKiBnbG9iYWwgd2luZG93OnRydWUgKi9cblxud2luZG93LlF1ZXVlID0gUXVldWU7XG5cbmV4cG9ydCBkZWZhdWx0IFF1ZXVlO1xuIiwiLyogQGZsb3cgKi9cbmltcG9ydCB0eXBlIElDb25maWcgZnJvbSAnLi4vaW50ZXJmYWNlcy9jb25maWcnO1xuaW1wb3J0IENoYW5uZWwgZnJvbSAnLi9jaGFubmVsJztcbmltcG9ydCBDb250YWluZXIgZnJvbSAnLi9jb250YWluZXInO1xuaW1wb3J0IENvbmZpZyBmcm9tICcuL2NvbmZpZyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFF1ZXVlKGNvbmZpZzogSUNvbmZpZykge1xuICB0aGlzLmNvbmZpZyA9IG5ldyBDb25maWcoY29uZmlnKTtcbn1cblxuUXVldWUuRklGTyA9ICdmaWZvJztcblF1ZXVlLkxJRk8gPSAnbGlmbyc7XG5RdWV1ZS5kcml2ZXJzID0ge307XG5RdWV1ZS5xdWV1ZVdvcmtlcnMgPSB7fTtcblF1ZXVlLndvcmtlckRlcHMgPSB7fTtcblxuUXVldWUucHJvdG90eXBlLmNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoKTtcblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgY2hhbm5lbFxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gdGFza1xuICogQHJldHVybiB7UXVldWV9IGNoYW5uZWxcbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5RdWV1ZS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKGNoYW5uZWw6IHN0cmluZyk6IFF1ZXVlIHtcbiAgaWYgKCF0aGlzLmNvbnRhaW5lci5oYXMoY2hhbm5lbCkpIHtcbiAgICB0aGlzLmNvbnRhaW5lci5iaW5kKGNoYW5uZWwsIG5ldyBDaGFubmVsKGNoYW5uZWwsIHRoaXMuY29uZmlnKSk7XG4gIH1cbiAgcmV0dXJuIHRoaXMuY29udGFpbmVyLmdldChjaGFubmVsKTtcbn07XG5cbi8qKlxuICogR2V0IGNoYW5uZWwgaW5zdGFuY2UgYnkgY2hhbm5lbCBuYW1lXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtRdWV1ZX1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5RdWV1ZS5wcm90b3R5cGUuY2hhbm5lbCA9IGZ1bmN0aW9uIGNoYW5uZWwobmFtZTogc3RyaW5nKTogUXVldWUge1xuICBpZiAoIXRoaXMuY29udGFpbmVyLmhhcyhuYW1lKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgXCIke25hbWV9XCIgY2hhbm5lbCBub3QgZm91bmRgKTtcbiAgfVxuICByZXR1cm4gdGhpcy5jb250YWluZXIuZ2V0KG5hbWUpO1xufTtcblxuLyoqXG4gKiBTZXQgY29uZmlnIHRpbWVvdXQgdmFsdWVcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZhbFxuICogQHJldHVybiB7Vm9pZH1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5RdWV1ZS5wcm90b3R5cGUuc2V0VGltZW91dCA9IGZ1bmN0aW9uIHNldFRpbWVvdXQodmFsOiBudW1iZXIpOiB2b2lkIHtcbiAgdGhpcy5jb25maWcuc2V0KCd0aW1lb3V0JywgdmFsKTtcbn07XG5cbi8qKlxuICogU2V0IGNvbmZpZyBsaW1pdCB2YWx1ZVxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gdmFsXG4gKiBAcmV0dXJuIHtWb2lkfVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblF1ZXVlLnByb3RvdHlwZS5zZXRMaW1pdCA9IGZ1bmN0aW9uIHNldExpbWl0KHZhbDogbnVtYmVyKTogdm9pZCB7XG4gIHRoaXMuY29uZmlnLnNldCgnbGltaXQnLCB2YWwpO1xufTtcblxuLyoqXG4gKiBTZXQgY29uZmlnIHByZWZpeCB2YWx1ZVxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gdmFsXG4gKiBAcmV0dXJuIHtWb2lkfVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblF1ZXVlLnByb3RvdHlwZS5zZXRQcmVmaXggPSBmdW5jdGlvbiBzZXRQcmVmaXgodmFsOiBzdHJpbmcpOiB2b2lkIHtcbiAgdGhpcy5jb25maWcuc2V0KCdwcmVmaXgnLCB2YWwpO1xufTtcblxuLyoqXG4gKiBTZXQgY29uZmlnIHByaWNpcGxlIHZhbHVlXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1ZvaWR9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUXVldWUucHJvdG90eXBlLnNldFByaW5jaXBsZSA9IGZ1bmN0aW9uIHNldFByaW5jaXBsZSh2YWw6IHN0cmluZyk6IHZvaWQge1xuICB0aGlzLmNvbmZpZy5zZXQoJ3ByaW5jaXBsZScsIHZhbCk7XG59O1xuXG4vKipcbiAqIFNldCBjb25maWcgZGVidWcgdmFsdWVcbiAqXG4gKiBAcGFyYW0gIHtCb29sZWFufSB2YWxcbiAqIEByZXR1cm4ge1ZvaWR9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUXVldWUucHJvdG90eXBlLnNldERlYnVnID0gZnVuY3Rpb24gc2V0RGVidWcodmFsOiBib29sZWFuKTogdm9pZCB7XG4gIHRoaXMuY29uZmlnLnNldCgnZGVidWcnLCB2YWwpO1xufTtcblxuUXVldWUucHJvdG90eXBlLnNldFN0b3JhZ2UgPSBmdW5jdGlvbiBzZXRTdG9yYWdlKHZhbDogc3RyaW5nKTogdm9pZCB7XG4gIHRoaXMuY29uZmlnLnNldCgnc3RvcmFnZScsIHZhbCk7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVyIHdvcmtlclxuICpcbiAqIEBwYXJhbSAge0FycmF5PElKb2I+fSBqb2JzXG4gKiBAcmV0dXJuIHtWb2lkfVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblF1ZXVlLndvcmtlcnMgPSBmdW5jdGlvbiB3b3JrZXJzKHdvcmtlcnNPYmo6IHsgW3Byb3A6IHN0cmluZ106IGFueSB9ID0ge30pOiB2b2lkIHtcbiAgaWYgKCEod29ya2Vyc09iaiBpbnN0YW5jZW9mIE9iamVjdCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBwYXJhbWV0ZXJzIHNob3VsZCBiZSBvYmplY3QuJyk7XG4gIH1cbiAgUXVldWUuaXNSZWdpc3RlcmVkID0gZmFsc2U7XG4gIFF1ZXVlLnF1ZXVlV29ya2VycyA9IHdvcmtlcnNPYmo7XG59O1xuXG4vKipcbiAqIEFkZGVkIHdvcmtlcnMgZGVwZW5kZW5jaWVzXG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSBkcml2ZXJcbiAqIEByZXR1cm4ge1ZvaWR9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUXVldWUuZGVwcyA9IGZ1bmN0aW9uIGRlcHMoZGVwZW5kZW5jaWVzOiB7IFtwcm9wOiBzdHJpbmddOiBhbnkgfSA9IHt9KTogdm9pZCB7XG4gIGlmICghKGRlcGVuZGVuY2llcyBpbnN0YW5jZW9mIE9iamVjdCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBwYXJhbWV0ZXJzIHNob3VsZCBiZSBvYmplY3QuJyk7XG4gIH1cbiAgUXVldWUud29ya2VyRGVwcyA9IGRlcGVuZGVuY2llcztcbn07XG5cbi8qKlxuICogU2V0dXAgYSBjdXN0b20gZHJpdmVyXG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSBkcml2ZXJcbiAqIEByZXR1cm4ge1ZvaWR9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUXVldWUudXNlID0gZnVuY3Rpb24gdXNlKGRyaXZlcjogeyBbcHJvcDogc3RyaW5nXTogYW55IH0gPSB7fSk6IHZvaWQge1xuICBRdWV1ZS5kcml2ZXJzID0geyAuLi5RdWV1ZS5kcml2ZXJzLCAuLi5kcml2ZXIgfTtcbn07XG4iLCIvKiBAZmxvdyAqL1xuaW1wb3J0IGdyb3VwQnkgZnJvbSAnZ3JvdXAtYnknO1xuaW1wb3J0IHR5cGUgSUNvbmZpZyBmcm9tICcuLi9pbnRlcmZhY2VzL2NvbmZpZyc7XG5pbXBvcnQgdHlwZSB7IElTdG9yYWdlIH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9zdG9yYWdlJztcbmltcG9ydCB0eXBlIElUYXNrIGZyb20gJy4uL2ludGVyZmFjZXMvdGFzayc7XG5pbXBvcnQgeyBMb2NhbEZvcmFnZUFkYXB0ZXIsIEluTWVtb3J5QWRhcHRlciB9IGZyb20gJy4vYWRhcHRlcnMnO1xuaW1wb3J0IHsgZXhjbHVkZVNwZWNpZmljVGFza3MsIGxpZm8sIGZpZm8gfSBmcm9tICcuL3V0aWxzJztcblxuLyogZXNsaW50IG5vLWNvbnNvbGU6IFtcImVycm9yXCIsIHsgYWxsb3c6IFtcIndhcm5cIiwgXCJlcnJvclwiXSB9XSAqL1xuLyogZXNsaW50IG5vLXVuZGVyc2NvcmUtZGFuZ2xlOiBbMiwgeyBcImFsbG93XCI6IFtcIl9pZFwiXSB9XSAqL1xuLyogZXNsaW50IGNsYXNzLW1ldGhvZHMtdXNlLXRoaXM6IFtcImVycm9yXCIsIHsgXCJleGNlcHRNZXRob2RzXCI6IFtcImdlbmVyYXRlSWRcIl0gfV0gKi9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RvcmFnZUNhcHN1bGUge1xuICBjb25maWc6IElDb25maWc7XG4gIHN0b3JhZ2U6IElTdG9yYWdlO1xuICBzdG9yYWdlQ2hhbm5lbDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogSUNvbmZpZywgc3RvcmFnZTogSVN0b3JhZ2UpIHtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLnN0b3JhZ2UgPSB0aGlzLmluaXRpYWxpemUoc3RvcmFnZSk7XG4gIH1cblxuICBpbml0aWFsaXplKFN0b3JhZ2U6IGFueSkge1xuICAgIGlmICh0eXBlb2YgU3RvcmFnZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiBTdG9yYWdlO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIFN0b3JhZ2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBuZXcgU3RvcmFnZSh0aGlzLmNvbmZpZyk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmNvbmZpZy5nZXQoJ3N0b3JhZ2UnKSA9PT0gJ2lubWVtb3J5Jykge1xuICAgICAgcmV0dXJuIG5ldyBJbk1lbW9yeUFkYXB0ZXIodGhpcy5jb25maWcpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IExvY2FsRm9yYWdlQWRhcHRlcih0aGlzLmNvbmZpZyk7XG4gIH1cblxuICAvKipcbiAgICogU2VsZWN0IGEgY2hhbm5lbCBieSBjaGFubmVsIG5hbWVcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm4ge1N0b3JhZ2VDYXBzdWxlfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgY2hhbm5lbChuYW1lOiBzdHJpbmcpOiBTdG9yYWdlQ2Fwc3VsZSB7XG4gICAgdGhpcy5zdG9yYWdlQ2hhbm5lbCA9IG5hbWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogRmV0Y2ggdGFza3MgZnJvbSBzdG9yYWdlIHdpdGggb3JkZXJlZFxuICAgKlxuICAgKiBAcmV0dXJuIHthbnlbXX1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGZldGNoKCk6IFByb21pc2U8YW55W10+IHtcbiAgICBjb25zdCBhbGwgPSAoYXdhaXQgdGhpcy5hbGwoKSkuZmlsdGVyKGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzKTtcbiAgICBjb25zdCB0YXNrcyA9IGdyb3VwQnkoYWxsLCAncHJpb3JpdHknKTtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGFza3MpXG4gICAgICAubWFwKGtleSA9PiBwYXJzZUludChrZXksIDEwKSlcbiAgICAgIC5zb3J0KChhLCBiKSA9PiBiIC0gYSlcbiAgICAgIC5yZWR1Y2UodGhpcy5yZWR1Y2VUYXNrcyh0YXNrcyksIFtdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTYXZlIHRhc2sgdG8gc3RvcmFnZVxuICAgKlxuICAgKiBAcGFyYW0gIHtJVGFza30gdGFza1xuICAgKiBAcmV0dXJuIHtTdHJpbmd8Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIHNhdmUodGFzazogSVRhc2spOiBQcm9taXNlPHN0cmluZyB8IGJvb2xlYW4+IHtcbiAgICBpZiAodHlwZW9mIHRhc2sgIT09ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBnZXQgYWxsIHRhc2tzIGN1cnJlbnQgY2hhbm5lbCdzXG4gICAgY29uc3QgdGFza3M6IElUYXNrW10gPSBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0KHRoaXMuc3RvcmFnZUNoYW5uZWwpO1xuXG4gICAgLy8gQ2hlY2sgdGhlIGNoYW5uZWwgbGltaXQuXG4gICAgLy8gSWYgbGltaXQgaXMgZXhjZWVkZWQsIGRvZXMgbm90IGluc2VydCBuZXcgdGFza1xuICAgIGlmIChhd2FpdCB0aGlzLmlzRXhjZWVkZWQoKSkge1xuICAgICAgY29uc29sZS53YXJuKGBUYXNrIGxpbWl0IGV4Y2VlZGVkOiBUaGUgJyR7dGhpcy5zdG9yYWdlQ2hhbm5lbH0nIGNoYW5uZWwgbGltaXQgaXMgJHt0aGlzLmNvbmZpZy5nZXQoJ2xpbWl0Jyl9YCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gcHJlcGFyZSBhbGwgcHJvcGVydGllcyBiZWZvcmUgc2F2ZVxuICAgIC8vIGV4YW1wbGU6IGNyZWF0ZWRBdCBldGMuXG4gICAgY29uc3QgbmV3VGFzayA9IHRoaXMucHJlcGFyZVRhc2sodGFzayk7XG5cbiAgICAvLyBhZGQgdGFzayB0byBzdG9yYWdlXG4gICAgdGFza3MucHVzaChuZXdUYXNrKTtcblxuICAgIC8vIHNhdmUgdGFza3NcbiAgICBhd2FpdCB0aGlzLnN0b3JhZ2Uuc2V0KHRoaXMuc3RvcmFnZUNoYW5uZWwsIHRhc2tzKTtcblxuICAgIHJldHVybiBuZXdUYXNrLl9pZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgY2hhbm5lbCBzdG9yZS5cbiAgICpcbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKiAgIFRoZSB2YWx1ZS4gVGhpcyBhbm5vdGF0aW9uIGNhbiBiZSB1c2VkIGZvciB0eXBlIGhpbnRpbmcgcHVycG9zZXMuXG4gICAqL1xuICBhc3luYyB1cGRhdGUoaWQ6IHN0cmluZywgdXBkYXRlOiB7IFtwcm9wZXJ0eTogc3RyaW5nXTogYW55IH0pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBkYXRhOiBhbnlbXSA9IGF3YWl0IHRoaXMuYWxsKCk7XG4gICAgY29uc3QgaW5kZXg6IG51bWJlciA9IGRhdGEuZmluZEluZGV4KHQgPT4gdC5faWQgPT09IGlkKTtcblxuICAgIC8vIGlmIGluZGV4IG5vdCBmb3VuZCwgcmV0dXJuIGZhbHNlXG4gICAgaWYgKGluZGV4IDwgMCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gbWVyZ2UgZXhpc3Rpbmcgb2JqZWN0IHdpdGggZ2l2ZW4gdXBkYXRlIG9iamVjdFxuICAgIGRhdGFbaW5kZXhdID0gT2JqZWN0LmFzc2lnbih7fSwgZGF0YVtpbmRleF0sIHVwZGF0ZSk7XG5cbiAgICAvLyBzYXZlIHRvIHRoZSBzdG9yYWdlIGFzIHN0cmluZ1xuICAgIGF3YWl0IHRoaXMuc3RvcmFnZS5zZXQodGhpcy5zdG9yYWdlQ2hhbm5lbCwgZGF0YSk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgdGFzayBmcm9tIHN0b3JhZ2VcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBpZFxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgZGVsZXRlKGlkOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBkYXRhOiBhbnlbXSA9IGF3YWl0IHRoaXMuYWxsKCk7XG4gICAgY29uc3QgaW5kZXg6IG51bWJlciA9IGRhdGEuZmluZEluZGV4KGQgPT4gZC5faWQgPT09IGlkKTtcblxuICAgIGlmIChpbmRleCA8IDApIHJldHVybiBmYWxzZTtcblxuICAgIGRlbGV0ZSBkYXRhW2luZGV4XTtcblxuICAgIGF3YWl0IHRoaXMuc3RvcmFnZS5zZXQodGhpcy5zdG9yYWdlQ2hhbm5lbCwgZGF0YS5maWx0ZXIoZCA9PiBkKSk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIHRhc2tzXG4gICAqXG4gICAqIEByZXR1cm4ge0FueVtdfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgYWxsKCk6IFByb21pc2U8SVRhc2tbXT4ge1xuICAgIGNvbnN0IGl0ZW1zID0gYXdhaXQgdGhpcy5zdG9yYWdlLmdldCh0aGlzLnN0b3JhZ2VDaGFubmVsKTtcbiAgICByZXR1cm4gaXRlbXM7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgdW5pcXVlIGlkXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGdlbmVyYXRlSWQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gKCgxICsgTWF0aC5yYW5kb20oKSkgKiAweDEwMDAwKS50b1N0cmluZygxNik7XG4gIH1cblxuICAvKipcbiAgICogQWRkIHNvbWUgbmVjZXNzYXJ5IHByb3BlcnRpZXNcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBpZFxuICAgKiBAcmV0dXJuIHtJVGFza31cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHByZXBhcmVUYXNrKHRhc2s6IElUYXNrKTogSVRhc2sge1xuICAgIGNvbnN0IG5ld1Rhc2sgPSB7IC4uLnRhc2sgfTtcbiAgICBuZXdUYXNrLmNyZWF0ZWRBdCA9IERhdGUubm93KCk7XG4gICAgbmV3VGFzay5faWQgPSB0aGlzLmdlbmVyYXRlSWQoKTtcbiAgICByZXR1cm4gbmV3VGFzaztcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgc29tZSBuZWNlc3NhcnkgcHJvcGVydGllc1xuICAgKlxuICAgKiBAcGFyYW0gIHtJVGFza1tdfSB0YXNrc1xuICAgKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHJlZHVjZVRhc2tzKHRhc2tzOiBJVGFza1tdKSB7XG4gICAgY29uc3QgcmVkdWNlRnVuYyA9IChyZXN1bHQ6IElUYXNrW10sIGtleTogYW55KTogSVRhc2tbXSA9PiB7XG4gICAgICBpZiAodGhpcy5jb25maWcuZ2V0KCdwcmluY2lwbGUnKSA9PT0gJ2xpZm8nKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQuY29uY2F0KHRhc2tzW2tleV0uc29ydChsaWZvKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0LmNvbmNhdCh0YXNrc1trZXldLnNvcnQoZmlmbykpO1xuICAgIH07XG5cbiAgICByZXR1cm4gcmVkdWNlRnVuYy5iaW5kKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRhc2sgbGltaXQgY2hlY2tlclxuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgaXNFeGNlZWRlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBsaW1pdDogbnVtYmVyID0gdGhpcy5jb25maWcuZ2V0KCdsaW1pdCcpO1xuICAgIGNvbnN0IHRhc2tzOiBJVGFza1tdID0gKGF3YWl0IHRoaXMuYWxsKCkpLmZpbHRlcihleGNsdWRlU3BlY2lmaWNUYXNrcyk7XG4gICAgcmV0dXJuICEobGltaXQgPT09IC0xIHx8IGxpbWl0ID4gdGFza3MubGVuZ3RoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciB0YXNrcyB3aXRoIGdpdmVuIGNoYW5uZWwgbmFtZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGNoYW5uZWxcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGNsZWFyKGNoYW5uZWw6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuc3RvcmFnZS5jbGVhcihjaGFubmVsKTtcbiAgfVxufVxuIiwiLyogQGZsb3cgKi9cbmltcG9ydCB0eXBlIElUYXNrIGZyb20gJy4uL2ludGVyZmFjZXMvdGFzayc7XG5cbi8qIGVzbGludCBjb21tYS1kYW5nbGU6IFtcImVycm9yXCIsIFwibmV2ZXJcIl0gKi9cblxuLyoqXG4gKiBDaGVjayBwcm9wZXJ0eSBpbiBvYmplY3RcbiAqXG4gKiBAcGFyYW0gIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gaGFzUHJvcGVydHkoZnVuYzogRnVuY3Rpb24sIG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGZ1bmMsIG5hbWUpO1xufVxuXG4vKipcbiAqIENoZWNrIG1ldGhvZCBpbiBpbml0aWF0ZWQgY2xhc3NcbiAqXG4gKiBAcGFyYW0gIHtDbGFzc30gaW5zdGFuY2VcbiAqIEBwYXJhbSAge1N0cmluZ30gbWV0aG9kXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXNNZXRob2QoaW5zdGFuY2U6IGFueSwgbWV0aG9kOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIGluc3RhbmNlIGluc3RhbmNlb2YgT2JqZWN0ICYmIG1ldGhvZCBpbiBpbnN0YW5jZTtcbn1cblxuLyoqXG4gKiBDaGVjayBmdW5jdGlvbiB0eXBlXG4gKlxuICogQHBhcmFtICB7RnVuY3Rpb259IGZ1bmNcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRnVuY3Rpb24oZnVuYzogRnVuY3Rpb24pOiBib29sZWFuIHtcbiAgcmV0dXJuIGZ1bmMgaW5zdGFuY2VvZiBGdW5jdGlvbjtcbn1cblxuLyoqXG4gKiBSZW1vdmUgc29tZSB0YXNrcyBieSBzb21lIGNvbmRpdGlvbnNcbiAqXG4gKiBAcGFyYW0gIHtGdW5jdGlvbn0gZnVuY1xuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gZXhjbHVkZVNwZWNpZmljVGFza3ModGFzazogSVRhc2spOiBib29sZWFuIHtcbiAgY29uc3QgY29uZGl0aW9ucyA9IEFycmF5LmlzQXJyYXkodGhpcykgPyB0aGlzIDogWydmcmVlemVkJywgJ2xvY2tlZCddO1xuICBjb25zdCByZXN1bHRzID0gW107XG5cbiAgY29uZGl0aW9ucy5mb3JFYWNoKChjKSA9PiB7XG4gICAgcmVzdWx0cy5wdXNoKGhhc1Byb3BlcnR5KHRhc2ssIGMpID09PSBmYWxzZSB8fCB0YXNrW2NdID09PSBmYWxzZSk7XG4gIH0pO1xuXG4gIHJldHVybiAhKHJlc3VsdHMuaW5kZXhPZihmYWxzZSkgPiAtMSk7XG59XG5cbi8qKlxuICogQ2xlYXIgdGFza3MgYnkgaXQncyB0YWdzXG4gKlxuICogQHBhcmFtICB7SVRhc2t9IHRhc2tcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHV0aWxDbGVhckJ5VGFnKHRhc2s6IElUYXNrKTogYm9vbGVhbiB7XG4gIGlmICghZXhjbHVkZVNwZWNpZmljVGFza3MuY2FsbChbJ2xvY2tlZCddLCB0YXNrKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdGFzay50YWcgPT09IHRoaXM7XG59XG5cbi8qKlxuICogU29ydCBieSBmaWZvXG4gKlxuICogQHBhcmFtICB7SVRhc2t9IGFcbiAqIEBwYXJhbSAge0lUYXNrfSBiXG4gKiBAcmV0dXJuIHtBbnl9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpZm8oYTogSVRhc2ssIGI6IElUYXNrKTogYW55IHtcbiAgcmV0dXJuIGEuY3JlYXRlZEF0IC0gYi5jcmVhdGVkQXQ7XG59XG5cbi8qKlxuICogU29ydCBieSBsaWZvXG4gKlxuICogQHBhcmFtICB7SVRhc2t9IGFcbiAqIEBwYXJhbSAge0lUYXNrfSBiXG4gKiBAcmV0dXJuIHtBbnl9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxpZm8oYTogSVRhc2ssIGI6IElUYXNrKTogYW55IHtcbiAgcmV0dXJuIGIuY3JlYXRlZEF0IC0gYS5jcmVhdGVkQXQ7XG59XG4iXX0=
