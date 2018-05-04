(function() {
  function r(e, n, t) {
    function o(i, f) {
      if (!n[i]) {
        if (!e[i]) {
          var c = 'function' == typeof require && require;
          if (!f && c) return c(i, !0);
          if (u) return u(i, !0);
          var a = new Error("Cannot find module '" + i + "'");
          throw ((a.code = 'MODULE_NOT_FOUND'), a);
        }
        var p = (n[i] = { exports: {} });
        e[i][0].call(
          p.exports,
          function(r) {
            var n = e[i][1][r];
            return o(n || r);
          },
          p,
          p.exports,
          r,
          e,
          n,
          t
        );
      }
      return n[i].exports;
    }
    for (
      var u = 'function' == typeof require && require, i = 0;
      i < t.length;
      i++
    )
      o(t[i]);
    return o;
  }
  return r;
})()(
  {
    1: [
      function(require, module, exports) {
        module.exports = require('regenerator-runtime');
      },
      { 'regenerator-runtime': 6 }
    ],
    2: [
      function(require, module, exports) {
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

        module.exports = function(str, fn) {
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
          return (
            str
              .replace(/\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\//g, '')
              .replace(globals, '')
              .match(/[a-zA-Z_]\w*/g) || []
          );
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
          return str.replace(re, function(_) {
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
          return function(_) {
            return str + _;
          };
        }
      },
      {}
    ],
    3: [
      function(require, module, exports) {
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

        module.exports = function(arr, fn) {
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
      },
      { 'to-function': 8 }
    ],
    4: [
      function(require, module, exports) {
        (function(global) {
          /*!
    localForage -- Offline Storage, Improved
    Version 1.7.1
    https://localforage.github.io/localForage
    (c) 2013-2017 Mozilla, Apache License 2.0
*/
          (function(f) {
            if (typeof exports === 'object' && typeof module !== 'undefined') {
              module.exports = f();
            } else if (typeof define === 'function' && define.amd) {
              define([], f);
            } else {
              var g;
              if (typeof window !== 'undefined') {
                g = window;
              } else if (typeof global !== 'undefined') {
                g = global;
              } else if (typeof self !== 'undefined') {
                g = self;
              } else {
                g = this;
              }
              g.localforage = f();
            }
          })(function() {
            var define, module, exports;
            return (function e(t, n, r) {
              function s(o, u) {
                if (!n[o]) {
                  if (!t[o]) {
                    var a = typeof require == 'function' && require;
                    if (!u && a) return a(o, !0);
                    if (i) return i(o, !0);
                    var f = new Error("Cannot find module '" + o + "'");
                    throw ((f.code = 'MODULE_NOT_FOUND'), f);
                  }
                  var l = (n[o] = { exports: {} });
                  t[o][0].call(
                    l.exports,
                    function(e) {
                      var n = t[o][1][e];
                      return s(n ? n : e);
                    },
                    l,
                    l.exports,
                    e,
                    t,
                    n,
                    r
                  );
                }
                return n[o].exports;
              }
              var i = typeof require == 'function' && require;
              for (var o = 0; o < r.length; o++) s(r[o]);
              return s;
            })(
              {
                1: [
                  function(_dereq_, module, exports) {
                    (function(global) {
                      'use strict';
                      var Mutation =
                        global.MutationObserver ||
                        global.WebKitMutationObserver;

                      var scheduleDrain;

                      {
                        if (Mutation) {
                          var called = 0;
                          var observer = new Mutation(nextTick);
                          var element = global.document.createTextNode('');
                          observer.observe(element, {
                            characterData: true
                          });
                          scheduleDrain = function() {
                            element.data = called = ++called % 2;
                          };
                        } else if (
                          !global.setImmediate &&
                          typeof global.MessageChannel !== 'undefined'
                        ) {
                          var channel = new global.MessageChannel();
                          channel.port1.onmessage = nextTick;
                          scheduleDrain = function() {
                            channel.port2.postMessage(0);
                          };
                        } else if (
                          'document' in global &&
                          'onreadystatechange' in
                            global.document.createElement('script')
                        ) {
                          scheduleDrain = function() {
                            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
                            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
                            var scriptEl = global.document.createElement(
                              'script'
                            );
                            scriptEl.onreadystatechange = function() {
                              nextTick();

                              scriptEl.onreadystatechange = null;
                              scriptEl.parentNode.removeChild(scriptEl);
                              scriptEl = null;
                            };
                            global.document.documentElement.appendChild(
                              scriptEl
                            );
                          };
                        } else {
                          scheduleDrain = function() {
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
                    }.call(
                      this,
                      typeof global !== 'undefined'
                        ? global
                        : typeof self !== 'undefined'
                          ? self
                          : typeof window !== 'undefined'
                            ? window
                            : {}
                    ));
                  },
                  {}
                ],
                2: [
                  function(_dereq_, module, exports) {
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

                    Promise.prototype['catch'] = function(onRejected) {
                      return this.then(null, onRejected);
                    };
                    Promise.prototype.then = function(onFulfilled, onRejected) {
                      if (
                        (typeof onFulfilled !== 'function' &&
                          this.state === FULFILLED) ||
                        (typeof onRejected !== 'function' &&
                          this.state === REJECTED)
                      ) {
                        return this;
                      }
                      var promise = new this.constructor(INTERNAL);
                      if (this.state !== PENDING) {
                        var resolver =
                          this.state === FULFILLED ? onFulfilled : onRejected;
                        unwrap(promise, resolver, this.outcome);
                      } else {
                        this.queue.push(
                          new QueueItem(promise, onFulfilled, onRejected)
                        );
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
                    QueueItem.prototype.callFulfilled = function(value) {
                      handlers.resolve(this.promise, value);
                    };
                    QueueItem.prototype.otherCallFulfilled = function(value) {
                      unwrap(this.promise, this.onFulfilled, value);
                    };
                    QueueItem.prototype.callRejected = function(value) {
                      handlers.reject(this.promise, value);
                    };
                    QueueItem.prototype.otherCallRejected = function(value) {
                      unwrap(this.promise, this.onRejected, value);
                    };

                    function unwrap(promise, func, value) {
                      immediate(function() {
                        var returnValue;
                        try {
                          returnValue = func(value);
                        } catch (e) {
                          return handlers.reject(promise, e);
                        }
                        if (returnValue === promise) {
                          handlers.reject(
                            promise,
                            new TypeError('Cannot resolve promise with itself')
                          );
                        } else {
                          handlers.resolve(promise, returnValue);
                        }
                      });
                    }

                    handlers.resolve = function(self, value) {
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
                    handlers.reject = function(self, error) {
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
                      if (
                        obj &&
                        (typeof obj === 'object' ||
                          typeof obj === 'function') &&
                        typeof then === 'function'
                      ) {
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
                      if (
                        Object.prototype.toString.call(iterable) !==
                        '[object Array]'
                      ) {
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
                        self
                          .resolve(value)
                          .then(resolveFromAll, function(error) {
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
                      if (
                        Object.prototype.toString.call(iterable) !==
                        '[object Array]'
                      ) {
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
                        self.resolve(value).then(
                          function(response) {
                            if (!called) {
                              called = true;
                              handlers.resolve(promise, response);
                            }
                          },
                          function(error) {
                            if (!called) {
                              called = true;
                              handlers.reject(promise, error);
                            }
                          }
                        );
                      }
                    }
                  },
                  { '1': 1 }
                ],
                3: [
                  function(_dereq_, module, exports) {
                    (function(global) {
                      'use strict';
                      if (typeof global.Promise !== 'function') {
                        global.Promise = _dereq_(2);
                      }
                    }.call(
                      this,
                      typeof global !== 'undefined'
                        ? global
                        : typeof self !== 'undefined'
                          ? self
                          : typeof window !== 'undefined'
                            ? window
                            : {}
                    ));
                  },
                  { '2': 2 }
                ],
                4: [
                  function(_dereq_, module, exports) {
                    'use strict';

                    var _typeof =
                      typeof Symbol === 'function' &&
                      typeof Symbol.iterator === 'symbol'
                        ? function(obj) {
                            return typeof obj;
                          }
                        : function(obj) {
                            return obj &&
                              typeof Symbol === 'function' &&
                              obj.constructor === Symbol &&
                              obj !== Symbol.prototype
                              ? 'symbol'
                              : typeof obj;
                          };

                    function _classCallCheck(instance, Constructor) {
                      if (!(instance instanceof Constructor)) {
                        throw new TypeError(
                          'Cannot call a class as a function'
                        );
                      }
                    }

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
                        var isSafari =
                          typeof openDatabase !== 'undefined' &&
                          /(Safari|iPhone|iPad|iPod)/.test(
                            navigator.userAgent
                          ) &&
                          !/Chrome/.test(navigator.userAgent) &&
                          !/BlackBerry/.test(navigator.platform);

                        var hasFetch =
                          typeof fetch === 'function' &&
                          fetch.toString().indexOf('[native code') !== -1;

                        // Safari <10.1 does not meet our requirements for IDB support (#5572)
                        // since Safari 10.1 shipped with fetch, we can use that to detect it
                        return (
                          (!isSafari || hasFetch) &&
                          typeof indexedDB !== 'undefined' &&
                          // some outdated implementations of IDB that appear on Samsung
                          // and HTC Android devices <4.4 are missing IDBKeyRange
                          // See: https://github.com/mozilla/localForage/issues/128
                          // See: https://github.com/mozilla/localForage/issues/272
                          typeof IDBKeyRange !== 'undefined'
                        );
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
                        var Builder =
                          typeof BlobBuilder !== 'undefined'
                            ? BlobBuilder
                            : typeof MSBlobBuilder !== 'undefined'
                              ? MSBlobBuilder
                              : typeof MozBlobBuilder !== 'undefined'
                                ? MozBlobBuilder
                                : WebKitBlobBuilder;
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
                        promise.then(
                          function(result) {
                            callback(null, result);
                          },
                          function(error) {
                            callback(error);
                          }
                        );
                      }
                    }

                    function executeTwoCallbacks(
                      promise,
                      callback,
                      errorCallback
                    ) {
                      if (typeof callback === 'function') {
                        promise.then(callback);
                      }

                      if (typeof errorCallback === 'function') {
                        promise['catch'](errorCallback);
                      }
                    }

                    function normalizeKey(key) {
                      // Cast the key to a string, as that's all we can set as a key.
                      if (typeof key !== 'string') {
                        console.warn(
                          key + ' used as a key, but it is not a string.'
                        );
                        key = String(key);
                      }

                      return key;
                    }

                    function getCallback() {
                      if (
                        arguments.length &&
                        typeof arguments[arguments.length - 1] === 'function'
                      ) {
                        return arguments[arguments.length - 1];
                      }
                    }

                    // Some code originally from async_storage.js in
                    // [Gaia](https://github.com/mozilla-b2g/gaia).

                    var DETECT_BLOB_SUPPORT_STORE =
                      'local-forage-detect-blob-support';
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
                      return new Promise$1(function(resolve) {
                        var txn = idb.transaction(
                          DETECT_BLOB_SUPPORT_STORE,
                          READ_WRITE
                        );
                        var blob = createBlob(['']);
                        txn
                          .objectStore(DETECT_BLOB_SUPPORT_STORE)
                          .put(blob, 'key');

                        txn.onabort = function(e) {
                          // If the transaction aborts now its due to not being able to
                          // write to the database, likely due to the disk being full
                          e.preventDefault();
                          e.stopPropagation();
                          resolve(false);
                        };

                        txn.oncomplete = function() {
                          var matchedChrome = navigator.userAgent.match(
                            /Chrome\/(\d+)/
                          );
                          var matchedEdge = navigator.userAgent.match(/Edge\//);
                          // MS Edge pretends to be Chrome 42:
                          // https://msdn.microsoft.com/en-us/library/hh869301%28v=vs.85%29.aspx
                          resolve(
                            matchedEdge ||
                              !matchedChrome ||
                              parseInt(matchedChrome[1], 10) >= 43
                          );
                        };
                      })['catch'](function() {
                        return false; // error, so assume unsupported
                      });
                    }

                    function _checkBlobSupport(idb) {
                      if (typeof supportsBlobs === 'boolean') {
                        return Promise$1.resolve(supportsBlobs);
                      }
                      return _checkBlobSupportWithoutCaching(idb).then(function(
                        value
                      ) {
                        supportsBlobs = value;
                        return supportsBlobs;
                      });
                    }

                    function _deferReadiness(dbInfo) {
                      var dbContext = dbContexts[dbInfo.name];

                      // Create a deferred object representing the current database operation.
                      var deferredOperation = {};

                      deferredOperation.promise = new Promise$1(function(
                        resolve,
                        reject
                      ) {
                        deferredOperation.resolve = resolve;
                        deferredOperation.reject = reject;
                      });

                      // Enqueue the deferred operation.
                      dbContext.deferredOperations.push(deferredOperation);

                      // Chain its promise to the database readiness.
                      if (!dbContext.dbReady) {
                        dbContext.dbReady = deferredOperation.promise;
                      } else {
                        dbContext.dbReady = dbContext.dbReady.then(function() {
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
                      return new Promise$1(function(resolve, reject) {
                        dbContexts[dbInfo.name] =
                          dbContexts[dbInfo.name] || createDbContext();

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
                          openreq.onupgradeneeded = function(e) {
                            var db = openreq.result;
                            try {
                              db.createObjectStore(dbInfo.storeName);
                              if (e.oldVersion <= 1) {
                                // Added when support for blob shims was added
                                db.createObjectStore(DETECT_BLOB_SUPPORT_STORE);
                              }
                            } catch (ex) {
                              if (ex.name === 'ConstraintError') {
                                console.warn(
                                  'The database "' +
                                    dbInfo.name +
                                    '"' +
                                    ' has been upgraded from version ' +
                                    e.oldVersion +
                                    ' to version ' +
                                    e.newVersion +
                                    ', but the storage "' +
                                    dbInfo.storeName +
                                    '" already exists.'
                                );
                              } else {
                                throw ex;
                              }
                            }
                          };
                        }

                        openreq.onerror = function(e) {
                          e.preventDefault();
                          reject(openreq.error);
                        };

                        openreq.onsuccess = function() {
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

                      var isNewStore = !dbInfo.db.objectStoreNames.contains(
                        dbInfo.storeName
                      );
                      var isDowngrade = dbInfo.version < dbInfo.db.version;
                      var isUpgrade = dbInfo.version > dbInfo.db.version;

                      if (isDowngrade) {
                        // If the version is not the default one
                        // then warn for impossible downgrade.
                        if (dbInfo.version !== defaultVersion) {
                          console.warn(
                            'The database "' +
                              dbInfo.name +
                              '"' +
                              " can't be downgraded from version " +
                              dbInfo.db.version +
                              ' to version ' +
                              dbInfo.version +
                              '.'
                          );
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
                      return new Promise$1(function(resolve, reject) {
                        var reader = new FileReader();
                        reader.onerror = reject;
                        reader.onloadend = function(e) {
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
                      var arrayBuff = _binStringToArrayBuffer(
                        atob(encodedBlob.data)
                      );
                      return createBlob([arrayBuff], {
                        type: encodedBlob.type
                      });
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

                      var promise = self._initReady().then(function() {
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

                      return _getOriginalConnection(dbInfo)
                        .then(function(db) {
                          dbInfo.db = db;
                          if (_isUpgradeNeeded(dbInfo)) {
                            // Reopen the database for upgrading.
                            return _getUpgradedConnection(dbInfo);
                          }
                          return db;
                        })
                        .then(function(db) {
                          // store the latest db reference
                          // in case the db was upgraded
                          dbInfo.db = dbContext.db = db;
                          for (var i = 0; i < forages.length; i++) {
                            forages[i]._dbInfo.db = db;
                          }
                        })
                        ['catch'](function(err) {
                          _rejectReadiness(dbInfo, err);
                          throw err;
                        });
                    }

                    // FF doesn't like Promises (micro-tasks) and IDDB store operations,
                    // so we have to do it with callbacks
                    function createTransaction(
                      dbInfo,
                      mode,
                      callback,
                      retries
                    ) {
                      if (retries === undefined) {
                        retries = 1;
                      }

                      try {
                        var tx = dbInfo.db.transaction(dbInfo.storeName, mode);
                        callback(null, tx);
                      } catch (err) {
                        if (
                          retries > 0 &&
                          (!dbInfo.db ||
                            err.name === 'InvalidStateError' ||
                            err.name === 'NotFoundError')
                        ) {
                          return Promise$1.resolve()
                            .then(function() {
                              if (
                                !dbInfo.db ||
                                (err.name === 'NotFoundError' &&
                                  !dbInfo.db.objectStoreNames.contains(
                                    dbInfo.storeName
                                  ) &&
                                  dbInfo.version <= dbInfo.db.version)
                              ) {
                                // increase the db version, to create the new ObjectStore
                                if (dbInfo.db) {
                                  dbInfo.version = dbInfo.db.version + 1;
                                }
                                // Reopen the database for upgrading.
                                return _getUpgradedConnection(dbInfo);
                              }
                            })
                            .then(function() {
                              return _tryReconnect(dbInfo).then(function() {
                                createTransaction(
                                  dbInfo,
                                  mode,
                                  callback,
                                  retries - 1
                                );
                              });
                            })
                            ['catch'](callback);
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
                          initPromises.push(
                            forage._initReady()['catch'](ignoreErrors)
                          );
                        }
                      }

                      // Take a snapshot of the related localForages.
                      var forages = dbContext.forages.slice(0);

                      // Initialize the connection process only when
                      // all the related localForages aren't pending.
                      return Promise$1.all(initPromises)
                        .then(function() {
                          dbInfo.db = dbContext.db;
                          // Get the connection or open a new one without upgrade.
                          return _getOriginalConnection(dbInfo);
                        })
                        .then(function(db) {
                          dbInfo.db = db;
                          if (
                            _isUpgradeNeeded(
                              dbInfo,
                              self._defaultConfig.version
                            )
                          ) {
                            // Reopen the database for upgrading.
                            return _getUpgradedConnection(dbInfo);
                          }
                          return db;
                        })
                        .then(function(db) {
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

                      var promise = new Promise$1(function(resolve, reject) {
                        self
                          .ready()
                          .then(function() {
                            createTransaction(self._dbInfo, READ_ONLY, function(
                              err,
                              transaction
                            ) {
                              if (err) {
                                return reject(err);
                              }

                              try {
                                var store = transaction.objectStore(
                                  self._dbInfo.storeName
                                );
                                var req = store.get(key);

                                req.onsuccess = function() {
                                  var value = req.result;
                                  if (value === undefined) {
                                    value = null;
                                  }
                                  if (_isEncodedBlob(value)) {
                                    value = _decodeBlob(value);
                                  }
                                  resolve(value);
                                };

                                req.onerror = function() {
                                  reject(req.error);
                                };
                              } catch (e) {
                                reject(e);
                              }
                            });
                          })
                          ['catch'](reject);
                      });

                      executeCallback(promise, callback);
                      return promise;
                    }

                    // Iterate over all items stored in database.
                    function iterate(iterator, callback) {
                      var self = this;

                      var promise = new Promise$1(function(resolve, reject) {
                        self
                          .ready()
                          .then(function() {
                            createTransaction(self._dbInfo, READ_ONLY, function(
                              err,
                              transaction
                            ) {
                              if (err) {
                                return reject(err);
                              }

                              try {
                                var store = transaction.objectStore(
                                  self._dbInfo.storeName
                                );
                                var req = store.openCursor();
                                var iterationNumber = 1;

                                req.onsuccess = function() {
                                  var cursor = req.result;

                                  if (cursor) {
                                    var value = cursor.value;
                                    if (_isEncodedBlob(value)) {
                                      value = _decodeBlob(value);
                                    }
                                    var result = iterator(
                                      value,
                                      cursor.key,
                                      iterationNumber++
                                    );

                                    // when the iterator callback retuns any
                                    // (non-`undefined`) value, then we stop
                                    // the iteration immediately
                                    if (result !== void 0) {
                                      resolve(result);
                                    } else {
                                      cursor['continue']();
                                    }
                                  } else {
                                    resolve();
                                  }
                                };

                                req.onerror = function() {
                                  reject(req.error);
                                };
                              } catch (e) {
                                reject(e);
                              }
                            });
                          })
                          ['catch'](reject);
                      });

                      executeCallback(promise, callback);

                      return promise;
                    }

                    function setItem(key, value, callback) {
                      var self = this;

                      key = normalizeKey(key);

                      var promise = new Promise$1(function(resolve, reject) {
                        var dbInfo;
                        self
                          .ready()
                          .then(function() {
                            dbInfo = self._dbInfo;
                            if (toString.call(value) === '[object Blob]') {
                              return _checkBlobSupport(dbInfo.db).then(function(
                                blobSupport
                              ) {
                                if (blobSupport) {
                                  return value;
                                }
                                return _encodeBlob(value);
                              });
                            }
                            return value;
                          })
                          .then(function(value) {
                            createTransaction(
                              self._dbInfo,
                              READ_WRITE,
                              function(err, transaction) {
                                if (err) {
                                  return reject(err);
                                }

                                try {
                                  var store = transaction.objectStore(
                                    self._dbInfo.storeName
                                  );

                                  // The reason we don't _save_ null is because IE 10 does
                                  // not support saving the `null` type in IndexedDB. How
                                  // ironic, given the bug below!
                                  // See: https://github.com/mozilla/localForage/issues/161
                                  if (value === null) {
                                    value = undefined;
                                  }

                                  var req = store.put(value, key);

                                  transaction.oncomplete = function() {
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
                                  transaction.onabort = transaction.onerror = function() {
                                    var err = req.error
                                      ? req.error
                                      : req.transaction.error;
                                    reject(err);
                                  };
                                } catch (e) {
                                  reject(e);
                                }
                              }
                            );
                          })
                          ['catch'](reject);
                      });

                      executeCallback(promise, callback);
                      return promise;
                    }

                    function removeItem(key, callback) {
                      var self = this;

                      key = normalizeKey(key);

                      var promise = new Promise$1(function(resolve, reject) {
                        self
                          .ready()
                          .then(function() {
                            createTransaction(
                              self._dbInfo,
                              READ_WRITE,
                              function(err, transaction) {
                                if (err) {
                                  return reject(err);
                                }

                                try {
                                  var store = transaction.objectStore(
                                    self._dbInfo.storeName
                                  );
                                  // We use a Grunt task to make this safe for IE and some
                                  // versions of Android (including those used by Cordova).
                                  // Normally IE won't like `.delete()` and will insist on
                                  // using `['delete']()`, but we have a build step that
                                  // fixes this for us now.
                                  var req = store['delete'](key);
                                  transaction.oncomplete = function() {
                                    resolve();
                                  };

                                  transaction.onerror = function() {
                                    reject(req.error);
                                  };

                                  // The request will be also be aborted if we've exceeded our storage
                                  // space.
                                  transaction.onabort = function() {
                                    var err = req.error
                                      ? req.error
                                      : req.transaction.error;
                                    reject(err);
                                  };
                                } catch (e) {
                                  reject(e);
                                }
                              }
                            );
                          })
                          ['catch'](reject);
                      });

                      executeCallback(promise, callback);
                      return promise;
                    }

                    function clear(callback) {
                      var self = this;

                      var promise = new Promise$1(function(resolve, reject) {
                        self
                          .ready()
                          .then(function() {
                            createTransaction(
                              self._dbInfo,
                              READ_WRITE,
                              function(err, transaction) {
                                if (err) {
                                  return reject(err);
                                }

                                try {
                                  var store = transaction.objectStore(
                                    self._dbInfo.storeName
                                  );
                                  var req = store.clear();

                                  transaction.oncomplete = function() {
                                    resolve();
                                  };

                                  transaction.onabort = transaction.onerror = function() {
                                    var err = req.error
                                      ? req.error
                                      : req.transaction.error;
                                    reject(err);
                                  };
                                } catch (e) {
                                  reject(e);
                                }
                              }
                            );
                          })
                          ['catch'](reject);
                      });

                      executeCallback(promise, callback);
                      return promise;
                    }

                    function length(callback) {
                      var self = this;

                      var promise = new Promise$1(function(resolve, reject) {
                        self
                          .ready()
                          .then(function() {
                            createTransaction(self._dbInfo, READ_ONLY, function(
                              err,
                              transaction
                            ) {
                              if (err) {
                                return reject(err);
                              }

                              try {
                                var store = transaction.objectStore(
                                  self._dbInfo.storeName
                                );
                                var req = store.count();

                                req.onsuccess = function() {
                                  resolve(req.result);
                                };

                                req.onerror = function() {
                                  reject(req.error);
                                };
                              } catch (e) {
                                reject(e);
                              }
                            });
                          })
                          ['catch'](reject);
                      });

                      executeCallback(promise, callback);
                      return promise;
                    }

                    function key(n, callback) {
                      var self = this;

                      var promise = new Promise$1(function(resolve, reject) {
                        if (n < 0) {
                          resolve(null);

                          return;
                        }

                        self
                          .ready()
                          .then(function() {
                            createTransaction(self._dbInfo, READ_ONLY, function(
                              err,
                              transaction
                            ) {
                              if (err) {
                                return reject(err);
                              }

                              try {
                                var store = transaction.objectStore(
                                  self._dbInfo.storeName
                                );
                                var advanced = false;
                                var req = store.openCursor();

                                req.onsuccess = function() {
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

                                req.onerror = function() {
                                  reject(req.error);
                                };
                              } catch (e) {
                                reject(e);
                              }
                            });
                          })
                          ['catch'](reject);
                      });

                      executeCallback(promise, callback);
                      return promise;
                    }

                    function keys(callback) {
                      var self = this;

                      var promise = new Promise$1(function(resolve, reject) {
                        self
                          .ready()
                          .then(function() {
                            createTransaction(self._dbInfo, READ_ONLY, function(
                              err,
                              transaction
                            ) {
                              if (err) {
                                return reject(err);
                              }

                              try {
                                var store = transaction.objectStore(
                                  self._dbInfo.storeName
                                );
                                var req = store.openCursor();
                                var keys = [];

                                req.onsuccess = function() {
                                  var cursor = req.result;

                                  if (!cursor) {
                                    resolve(keys);
                                    return;
                                  }

                                  keys.push(cursor.key);
                                  cursor['continue']();
                                };

                                req.onerror = function() {
                                  reject(req.error);
                                };
                              } catch (e) {
                                reject(e);
                              }
                            });
                          })
                          ['catch'](reject);
                      });

                      executeCallback(promise, callback);
                      return promise;
                    }

                    function dropInstance(options, callback) {
                      callback = getCallback.apply(this, arguments);

                      var currentConfig = this.config();
                      options =
                        (typeof options !== 'function' && options) || {};
                      if (!options.name) {
                        options.name = options.name || currentConfig.name;
                        options.storeName =
                          options.storeName || currentConfig.storeName;
                      }

                      var self = this;
                      var promise;
                      if (!options.name) {
                        promise = Promise$1.reject('Invalid arguments');
                      } else {
                        var isCurrentDb =
                          options.name === currentConfig.name &&
                          self._dbInfo.db;

                        var dbPromise = isCurrentDb
                          ? Promise$1.resolve(self._dbInfo.db)
                          : _getOriginalConnection(options).then(function(db) {
                              var dbContext = dbContexts[options.name];
                              var forages = dbContext.forages;
                              dbContext.db = db;
                              for (var i = 0; i < forages.length; i++) {
                                forages[i]._dbInfo.db = db;
                              }
                              return db;
                            });

                        if (!options.storeName) {
                          promise = dbPromise.then(function(db) {
                            _deferReadiness(options);

                            var dbContext = dbContexts[options.name];
                            var forages = dbContext.forages;

                            db.close();
                            for (var i = 0; i < forages.length; i++) {
                              var forage = forages[i];
                              forage._dbInfo.db = null;
                            }

                            var dropDBPromise = new Promise$1(function(
                              resolve,
                              reject
                            ) {
                              var req = idb.deleteDatabase(options.name);

                              req.onerror = req.onblocked = function(err) {
                                var db = req.result;
                                if (db) {
                                  db.close();
                                }
                                reject(err);
                              };

                              req.onsuccess = function() {
                                var db = req.result;
                                if (db) {
                                  db.close();
                                }
                                resolve(db);
                              };
                            });

                            return dropDBPromise
                              .then(function(db) {
                                dbContext.db = db;
                                for (var i = 0; i < forages.length; i++) {
                                  var _forage = forages[i];
                                  _advanceReadiness(_forage._dbInfo);
                                }
                              })
                              ['catch'](function(err) {
                                (_rejectReadiness(options, err) ||
                                  Promise$1.resolve())['catch'](function() {});
                                throw err;
                              });
                          });
                        } else {
                          promise = dbPromise.then(function(db) {
                            if (
                              !db.objectStoreNames.contains(options.storeName)
                            ) {
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

                            var dropObjectPromise = new Promise$1(function(
                              resolve,
                              reject
                            ) {
                              var req = idb.open(options.name, newVersion);

                              req.onerror = function(err) {
                                var db = req.result;
                                db.close();
                                reject(err);
                              };

                              req.onupgradeneeded = function() {
                                var db = req.result;
                                db.deleteObjectStore(options.storeName);
                              };

                              req.onsuccess = function() {
                                var db = req.result;
                                db.close();
                                resolve(db);
                              };
                            });

                            return dropObjectPromise
                              .then(function(db) {
                                dbContext.db = db;
                                for (var j = 0; j < forages.length; j++) {
                                  var _forage2 = forages[j];
                                  _forage2._dbInfo.db = db;
                                  _advanceReadiness(_forage2._dbInfo);
                                }
                              })
                              ['catch'](function(err) {
                                (_rejectReadiness(options, err) ||
                                  Promise$1.resolve())['catch'](function() {});
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
                    var BASE_CHARS =
                      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

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
                    var TYPE_SERIALIZED_MARKER_LENGTH =
                      SERIALIZED_MARKER_LENGTH + TYPE_ARRAYBUFFER.length;

                    var toString$1 = Object.prototype.toString;

                    function stringToBuffer(serializedString) {
                      // Fill the string into a ArrayBuffer.
                      var bufferLength = serializedString.length * 0.75;
                      var len = serializedString.length;
                      var i;
                      var p = 0;
                      var encoded1, encoded2, encoded3, encoded4;

                      if (
                        serializedString[serializedString.length - 1] === '='
                      ) {
                        bufferLength--;
                        if (
                          serializedString[serializedString.length - 2] === '='
                        ) {
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
                        bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
                        bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
                        bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
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
                        base64String +=
                          BASE_CHARS[
                            ((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)
                          ];
                        base64String +=
                          BASE_CHARS[
                            ((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)
                          ];
                        base64String += BASE_CHARS[bytes[i + 2] & 63];
                      }

                      if (bytes.length % 3 === 2) {
                        base64String =
                          base64String.substring(0, base64String.length - 1) +
                          '=';
                      } else if (bytes.length % 3 === 1) {
                        base64String =
                          base64String.substring(0, base64String.length - 2) +
                          '==';
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
                      if (
                        value &&
                        (valueType === '[object ArrayBuffer]' ||
                          (value.buffer &&
                            toString$1.call(value.buffer) ===
                              '[object ArrayBuffer]'))
                      ) {
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
                          } else if (
                            valueType === '[object Uint8ClampedArray]'
                          ) {
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
                            callback(
                              new Error('Failed to get type for BinaryArray')
                            );
                          }
                        }

                        callback(marker + bufferToString(buffer));
                      } else if (valueType === '[object Blob]') {
                        // Conver the blob to a binaryArray and then to a string.
                        var fileReader = new FileReader();

                        fileReader.onload = function() {
                          // Backwards-compatible prefix for the blob type.
                          var str =
                            BLOB_TYPE_PREFIX +
                            value.type +
                            '~' +
                            bufferToString(this.result);

                          callback(SERIALIZED_MARKER + TYPE_BLOB + str);
                        };

                        fileReader.readAsArrayBuffer(value);
                      } else {
                        try {
                          callback(JSON.stringify(value));
                        } catch (e) {
                          console.error(
                            "Couldn't convert value into a JSON string: ",
                            value
                          );

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
                      if (
                        value.substring(0, SERIALIZED_MARKER_LENGTH) !==
                        SERIALIZED_MARKER
                      ) {
                        return JSON.parse(value);
                      }

                      // The following code deals with deserializing some kind of Blob or
                      // TypedArray. First we separate out the type of data we're dealing
                      // with from the data itself.
                      var serializedString = value.substring(
                        TYPE_SERIALIZED_MARKER_LENGTH
                      );
                      var type = value.substring(
                        SERIALIZED_MARKER_LENGTH,
                        TYPE_SERIALIZED_MARKER_LENGTH
                      );

                      var blobType;
                      // Backwards-compatible blob type serialization strategy.
                      // DBs created with older versions of localForage will simply not have the blob type.
                      if (
                        type === TYPE_BLOB &&
                        BLOB_TYPE_PREFIX_REGEX.test(serializedString)
                      ) {
                        var matcher = serializedString.match(
                          BLOB_TYPE_PREFIX_REGEX
                        );
                        blobType = matcher[1];
                        serializedString = serializedString.substring(
                          matcher[0].length
                        );
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
                      t.executeSql(
                        'CREATE TABLE IF NOT EXISTS ' +
                          dbInfo.storeName +
                          ' ' +
                          '(id INTEGER PRIMARY KEY, key unique, value)',
                        [],
                        callback,
                        errorCallback
                      );
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
                          dbInfo[i] =
                            typeof options[i] !== 'string'
                              ? options[i].toString()
                              : options[i];
                        }
                      }

                      var dbInfoPromise = new Promise$1(function(
                        resolve,
                        reject
                      ) {
                        // Open the database; the openDatabase API will automatically
                        // create it for us if it doesn't exist.
                        try {
                          dbInfo.db = openDatabase(
                            dbInfo.name,
                            String(dbInfo.version),
                            dbInfo.description,
                            dbInfo.size
                          );
                        } catch (e) {
                          return reject(e);
                        }

                        // Create our key/value table if it doesn't exist.
                        dbInfo.db.transaction(function(t) {
                          createDbTable(
                            t,
                            dbInfo,
                            function() {
                              self._dbInfo = dbInfo;
                              resolve();
                            },
                            function(t, error) {
                              reject(error);
                            }
                          );
                        }, reject);
                      });

                      dbInfo.serializer = localforageSerializer;
                      return dbInfoPromise;
                    }

                    function tryExecuteSql(
                      t,
                      dbInfo,
                      sqlStatement,
                      args,
                      callback,
                      errorCallback
                    ) {
                      t.executeSql(
                        sqlStatement,
                        args,
                        callback,
                        function(t, error) {
                          if (error.code === error.SYNTAX_ERR) {
                            t.executeSql(
                              'SELECT name FROM sqlite_master ' +
                                "WHERE type='table' AND name = ?",
                              [name],
                              function(t, results) {
                                if (!results.rows.length) {
                                  // if the table is missing (was deleted)
                                  // re-create it table and retry
                                  createDbTable(
                                    t,
                                    dbInfo,
                                    function() {
                                      t.executeSql(
                                        sqlStatement,
                                        args,
                                        callback,
                                        errorCallback
                                      );
                                    },
                                    errorCallback
                                  );
                                } else {
                                  errorCallback(t, error);
                                }
                              },
                              errorCallback
                            );
                          } else {
                            errorCallback(t, error);
                          }
                        },
                        errorCallback
                      );
                    }

                    function getItem$1(key, callback) {
                      var self = this;

                      key = normalizeKey(key);

                      var promise = new Promise$1(function(resolve, reject) {
                        self
                          .ready()
                          .then(function() {
                            var dbInfo = self._dbInfo;
                            dbInfo.db.transaction(function(t) {
                              tryExecuteSql(
                                t,
                                dbInfo,
                                'SELECT * FROM ' +
                                  dbInfo.storeName +
                                  ' WHERE key = ? LIMIT 1',
                                [key],
                                function(t, results) {
                                  var result = results.rows.length
                                    ? results.rows.item(0).value
                                    : null;

                                  // Check to see if this is serialized content we need to
                                  // unpack.
                                  if (result) {
                                    result = dbInfo.serializer.deserialize(
                                      result
                                    );
                                  }

                                  resolve(result);
                                },
                                function(t, error) {
                                  reject(error);
                                }
                              );
                            });
                          })
                          ['catch'](reject);
                      });

                      executeCallback(promise, callback);
                      return promise;
                    }

                    function iterate$1(iterator, callback) {
                      var self = this;

                      var promise = new Promise$1(function(resolve, reject) {
                        self
                          .ready()
                          .then(function() {
                            var dbInfo = self._dbInfo;

                            dbInfo.db.transaction(function(t) {
                              tryExecuteSql(
                                t,
                                dbInfo,
                                'SELECT * FROM ' + dbInfo.storeName,
                                [],
                                function(t, results) {
                                  var rows = results.rows;
                                  var length = rows.length;

                                  for (var i = 0; i < length; i++) {
                                    var item = rows.item(i);
                                    var result = item.value;

                                    // Check to see if this is serialized content
                                    // we need to unpack.
                                    if (result) {
                                      result = dbInfo.serializer.deserialize(
                                        result
                                      );
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
                                },
                                function(t, error) {
                                  reject(error);
                                }
                              );
                            });
                          })
                          ['catch'](reject);
                      });

                      executeCallback(promise, callback);
                      return promise;
                    }

                    function _setItem(key, value, callback, retriesLeft) {
                      var self = this;

                      key = normalizeKey(key);

                      var promise = new Promise$1(function(resolve, reject) {
                        self
                          .ready()
                          .then(function() {
                            // The localStorage API doesn't return undefined values in an
                            // "expected" way, so undefined is always cast to null in all
                            // drivers. See: https://github.com/mozilla/localForage/pull/42
                            if (value === undefined) {
                              value = null;
                            }

                            // Save the original value to pass to the callback.
                            var originalValue = value;

                            var dbInfo = self._dbInfo;
                            dbInfo.serializer.serialize(value, function(
                              value,
                              error
                            ) {
                              if (error) {
                                reject(error);
                              } else {
                                dbInfo.db.transaction(
                                  function(t) {
                                    tryExecuteSql(
                                      t,
                                      dbInfo,
                                      'INSERT OR REPLACE INTO ' +
                                        dbInfo.storeName +
                                        ' ' +
                                        '(key, value) VALUES (?, ?)',
                                      [key, value],
                                      function() {
                                        resolve(originalValue);
                                      },
                                      function(t, error) {
                                        reject(error);
                                      }
                                    );
                                  },
                                  function(sqlError) {
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
                                        resolve(
                                          _setItem.apply(self, [
                                            key,
                                            originalValue,
                                            callback,
                                            retriesLeft - 1
                                          ])
                                        );
                                        return;
                                      }
                                      reject(sqlError);
                                    }
                                  }
                                );
                              }
                            });
                          })
                          ['catch'](reject);
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

                      var promise = new Promise$1(function(resolve, reject) {
                        self
                          .ready()
                          .then(function() {
                            var dbInfo = self._dbInfo;
                            dbInfo.db.transaction(function(t) {
                              tryExecuteSql(
                                t,
                                dbInfo,
                                'DELETE FROM ' +
                                  dbInfo.storeName +
                                  ' WHERE key = ?',
                                [key],
                                function() {
                                  resolve();
                                },
                                function(t, error) {
                                  reject(error);
                                }
                              );
                            });
                          })
                          ['catch'](reject);
                      });

                      executeCallback(promise, callback);
                      return promise;
                    }

                    // Deletes every item in the table.
                    // TODO: Find out if this resets the AUTO_INCREMENT number.
                    function clear$1(callback) {
                      var self = this;

                      var promise = new Promise$1(function(resolve, reject) {
                        self
                          .ready()
                          .then(function() {
                            var dbInfo = self._dbInfo;
                            dbInfo.db.transaction(function(t) {
                              tryExecuteSql(
                                t,
                                dbInfo,
                                'DELETE FROM ' + dbInfo.storeName,
                                [],
                                function() {
                                  resolve();
                                },
                                function(t, error) {
                                  reject(error);
                                }
                              );
                            });
                          })
                          ['catch'](reject);
                      });

                      executeCallback(promise, callback);
                      return promise;
                    }

                    // Does a simple `COUNT(key)` to get the number of items stored in
                    // localForage.
                    function length$1(callback) {
                      var self = this;

                      var promise = new Promise$1(function(resolve, reject) {
                        self
                          .ready()
                          .then(function() {
                            var dbInfo = self._dbInfo;
                            dbInfo.db.transaction(function(t) {
                              // Ahhh, SQL makes this one soooooo easy.
                              tryExecuteSql(
                                t,
                                dbInfo,
                                'SELECT COUNT(key) as c FROM ' +
                                  dbInfo.storeName,
                                [],
                                function(t, results) {
                                  var result = results.rows.item(0).c;
                                  resolve(result);
                                },
                                function(t, error) {
                                  reject(error);
                                }
                              );
                            });
                          })
                          ['catch'](reject);
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

                      var promise = new Promise$1(function(resolve, reject) {
                        self
                          .ready()
                          .then(function() {
                            var dbInfo = self._dbInfo;
                            dbInfo.db.transaction(function(t) {
                              tryExecuteSql(
                                t,
                                dbInfo,
                                'SELECT key FROM ' +
                                  dbInfo.storeName +
                                  ' WHERE id = ? LIMIT 1',
                                [n + 1],
                                function(t, results) {
                                  var result = results.rows.length
                                    ? results.rows.item(0).key
                                    : null;
                                  resolve(result);
                                },
                                function(t, error) {
                                  reject(error);
                                }
                              );
                            });
                          })
                          ['catch'](reject);
                      });

                      executeCallback(promise, callback);
                      return promise;
                    }

                    function keys$1(callback) {
                      var self = this;

                      var promise = new Promise$1(function(resolve, reject) {
                        self
                          .ready()
                          .then(function() {
                            var dbInfo = self._dbInfo;
                            dbInfo.db.transaction(function(t) {
                              tryExecuteSql(
                                t,
                                dbInfo,
                                'SELECT key FROM ' + dbInfo.storeName,
                                [],
                                function(t, results) {
                                  var keys = [];

                                  for (
                                    var i = 0;
                                    i < results.rows.length;
                                    i++
                                  ) {
                                    keys.push(results.rows.item(i).key);
                                  }

                                  resolve(keys);
                                },
                                function(t, error) {
                                  reject(error);
                                }
                              );
                            });
                          })
                          ['catch'](reject);
                      });

                      executeCallback(promise, callback);
                      return promise;
                    }

                    // https://www.w3.org/TR/webdatabase/#databases
                    // > There is no way to enumerate or delete the databases available for an origin from this API.
                    function getAllStoreNames(db) {
                      return new Promise$1(function(resolve, reject) {
                        db.transaction(
                          function(t) {
                            t.executeSql(
                              'SELECT name FROM sqlite_master ' +
                                "WHERE type='table' AND name <> '__WebKitDatabaseInfoTable__'",
                              [],
                              function(t, results) {
                                var storeNames = [];

                                for (var i = 0; i < results.rows.length; i++) {
                                  storeNames.push(results.rows.item(i).name);
                                }

                                resolve({
                                  db: db,
                                  storeNames: storeNames
                                });
                              },
                              function(t, error) {
                                reject(error);
                              }
                            );
                          },
                          function(sqlError) {
                            reject(sqlError);
                          }
                        );
                      });
                    }

                    function dropInstance$1(options, callback) {
                      callback = getCallback.apply(this, arguments);

                      var currentConfig = this.config();
                      options =
                        (typeof options !== 'function' && options) || {};
                      if (!options.name) {
                        options.name = options.name || currentConfig.name;
                        options.storeName =
                          options.storeName || currentConfig.storeName;
                      }

                      var self = this;
                      var promise;
                      if (!options.name) {
                        promise = Promise$1.reject('Invalid arguments');
                      } else {
                        promise = new Promise$1(function(resolve) {
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
                        }).then(function(operationInfo) {
                          return new Promise$1(function(resolve, reject) {
                            operationInfo.db.transaction(
                              function(t) {
                                function dropTable(storeName) {
                                  return new Promise$1(function(
                                    resolve,
                                    reject
                                  ) {
                                    t.executeSql(
                                      'DROP TABLE IF EXISTS ' + storeName,
                                      [],
                                      function() {
                                        resolve();
                                      },
                                      function(t, error) {
                                        reject(error);
                                      }
                                    );
                                  });
                                }

                                var operations = [];
                                for (
                                  var i = 0,
                                    len = operationInfo.storeNames.length;
                                  i < len;
                                  i++
                                ) {
                                  operations.push(
                                    dropTable(operationInfo.storeNames[i])
                                  );
                                }

                                Promise$1.all(operations)
                                  .then(function() {
                                    resolve();
                                  })
                                  ['catch'](function(e) {
                                    reject(e);
                                  });
                              },
                              function(sqlError) {
                                reject(sqlError);
                              }
                            );
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
                        return (
                          typeof localStorage !== 'undefined' &&
                          'setItem' in localStorage &&
                          // in IE8 typeof localStorage.setItem === 'object'
                          !!localStorage.setItem
                        );
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
                      return (
                        !checkIfLocalStorageThrows() || localStorage.length > 0
                      );
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

                      dbInfo.keyPrefix = _getKeyPrefix(
                        options,
                        self._defaultConfig
                      );

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
                      var promise = self.ready().then(function() {
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

                      var promise = self.ready().then(function() {
                        var dbInfo = self._dbInfo;
                        var result = localStorage.getItem(
                          dbInfo.keyPrefix + key
                        );

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

                      var promise = self.ready().then(function() {
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

                          value = iterator(
                            value,
                            key.substring(keyPrefixLength),
                            iterationNumber++
                          );

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
                      var promise = self.ready().then(function() {
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
                      var promise = self.ready().then(function() {
                        var dbInfo = self._dbInfo;
                        var length = localStorage.length;
                        var keys = [];

                        for (var i = 0; i < length; i++) {
                          var itemKey = localStorage.key(i);
                          if (itemKey.indexOf(dbInfo.keyPrefix) === 0) {
                            keys.push(
                              itemKey.substring(dbInfo.keyPrefix.length)
                            );
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
                      var promise = self.keys().then(function(keys) {
                        return keys.length;
                      });

                      executeCallback(promise, callback);
                      return promise;
                    }

                    // Remove an item from the store, nice and simple.
                    function removeItem$2(key, callback) {
                      var self = this;

                      key = normalizeKey(key);

                      var promise = self.ready().then(function() {
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

                      var promise = self.ready().then(function() {
                        // Convert undefined values to null.
                        // https://github.com/mozilla/localForage/pull/42
                        if (value === undefined) {
                          value = null;
                        }

                        // Save the original value to pass to the callback.
                        var originalValue = value;

                        return new Promise$1(function(resolve, reject) {
                          var dbInfo = self._dbInfo;
                          dbInfo.serializer.serialize(value, function(
                            value,
                            error
                          ) {
                            if (error) {
                              reject(error);
                            } else {
                              try {
                                localStorage.setItem(
                                  dbInfo.keyPrefix + key,
                                  value
                                );
                                resolve(originalValue);
                              } catch (e) {
                                // localStorage capacity exceeded.
                                // TODO: Make this a specific error/event.
                                if (
                                  e.name === 'QuotaExceededError' ||
                                  e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
                                ) {
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

                      options =
                        (typeof options !== 'function' && options) || {};
                      if (!options.name) {
                        var currentConfig = this.config();
                        options.name = options.name || currentConfig.name;
                        options.storeName =
                          options.storeName || currentConfig.storeName;
                      }

                      var self = this;
                      var promise;
                      if (!options.name) {
                        promise = Promise$1.reject('Invalid arguments');
                      } else {
                        promise = new Promise$1(function(resolve) {
                          if (!options.storeName) {
                            resolve(options.name + '/');
                          } else {
                            resolve(
                              _getKeyPrefix(options, self._defaultConfig)
                            );
                          }
                        }).then(function(keyPrefix) {
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
                      return (
                        x === y ||
                        (typeof x === 'number' &&
                          typeof y === 'number' &&
                          isNaN(x) &&
                          isNaN(y))
                      );
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

                    var isArray =
                      Array.isArray ||
                      function(arg) {
                        return (
                          Object.prototype.toString.call(arg) ===
                          '[object Array]'
                        );
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

                    var DefaultDriverOrder = [
                      DefaultDrivers.INDEXEDDB._driver,
                      DefaultDrivers.WEBSQL._driver,
                      DefaultDrivers.LOCALSTORAGE._driver
                    ];

                    var OptionalDriverMethods = ['dropInstance'];

                    var LibraryMethods = [
                      'clear',
                      'getItem',
                      'iterate',
                      'key',
                      'keys',
                      'length',
                      'removeItem',
                      'setItem'
                    ].concat(OptionalDriverMethods);

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
                      localForageInstance[libraryMethod] = function() {
                        var _args = arguments;
                        return localForageInstance.ready().then(function() {
                          return localForageInstance[libraryMethod].apply(
                            localForageInstance,
                            _args
                          );
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

                    var LocalForage = (function() {
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
                        this.setDriver(this._config.driver)['catch'](
                          function() {}
                        );
                      }

                      // Set any config values for localForage; can be called anytime before
                      // the first API call (e.g. `getItem`, `setItem`).
                      // We loop through options so we don't overwrite existing config
                      // values.

                      LocalForage.prototype.config = function config(options) {
                        // If the options argument is an object, we use it to set values.
                        // Otherwise, we return either a specified config value or all
                        // config values.
                        if (
                          (typeof options === 'undefined'
                            ? 'undefined'
                            : _typeof(options)) === 'object'
                        ) {
                          // If localforage is ready and fully initialized, we can't set
                          // any new configuration values. Instead, we return an error.
                          if (this._ready) {
                            return new Error(
                              "Can't call config() after localforage " +
                                'has been used.'
                            );
                          }

                          for (var i in options) {
                            if (i === 'storeName') {
                              options[i] = options[i].replace(/\W/g, '_');
                            }

                            if (
                              i === 'version' &&
                              typeof options[i] !== 'number'
                            ) {
                              return new Error(
                                'Database version must be a number.'
                              );
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

                      LocalForage.prototype.defineDriver = function defineDriver(
                        driverObject,
                        callback,
                        errorCallback
                      ) {
                        var promise = new Promise$1(function(resolve, reject) {
                          try {
                            var driverName = driverObject._driver;
                            var complianceError = new Error(
                              'Custom driver not compliant; see ' +
                                'https://mozilla.github.io/localForage/#definedriver'
                            );

                            // A driver name should be defined and not overlap with the
                            // library-defined, default drivers.
                            if (!driverObject._driver) {
                              reject(complianceError);
                              return;
                            }

                            var driverMethods = LibraryMethods.concat(
                              '_initStorage'
                            );
                            for (
                              var i = 0, len = driverMethods.length;
                              i < len;
                              i++
                            ) {
                              var driverMethodName = driverMethods[i];

                              // when the property is there,
                              // it should be a method even when optional
                              var isRequired = !includes(
                                OptionalDriverMethods,
                                driverMethodName
                              );
                              if (
                                (isRequired ||
                                  driverObject[driverMethodName]) &&
                                typeof driverObject[driverMethodName] !==
                                  'function'
                              ) {
                                reject(complianceError);
                                return;
                              }
                            }

                            var configureMissingMethods = function configureMissingMethods() {
                              var methodNotImplementedFactory = function methodNotImplementedFactory(
                                methodName
                              ) {
                                return function() {
                                  var error = new Error(
                                    'Method ' +
                                      methodName +
                                      ' is not implemented by the current driver'
                                  );
                                  var promise = Promise$1.reject(error);
                                  executeCallback(
                                    promise,
                                    arguments[arguments.length - 1]
                                  );
                                  return promise;
                                };
                              };

                              for (
                                var _i = 0, _len = OptionalDriverMethods.length;
                                _i < _len;
                                _i++
                              ) {
                                var optionalDriverMethod =
                                  OptionalDriverMethods[_i];
                                if (!driverObject[optionalDriverMethod]) {
                                  driverObject[
                                    optionalDriverMethod
                                  ] = methodNotImplementedFactory(
                                    optionalDriverMethod
                                  );
                                }
                              }
                            };

                            configureMissingMethods();

                            var setDriverSupport = function setDriverSupport(
                              support
                            ) {
                              if (DefinedDrivers[driverName]) {
                                console.info(
                                  'Redefining LocalForage driver: ' + driverName
                                );
                              }
                              DefinedDrivers[driverName] = driverObject;
                              DriverSupport[driverName] = support;
                              // don't use a then, so that we can define
                              // drivers that have simple _support methods
                              // in a blocking manner
                              resolve();
                            };

                            if ('_support' in driverObject) {
                              if (
                                driverObject._support &&
                                typeof driverObject._support === 'function'
                              ) {
                                driverObject
                                  ._support()
                                  .then(setDriverSupport, reject);
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

                      LocalForage.prototype.getDriver = function getDriver(
                        driverName,
                        callback,
                        errorCallback
                      ) {
                        var getDriverPromise = DefinedDrivers[driverName]
                          ? Promise$1.resolve(DefinedDrivers[driverName])
                          : Promise$1.reject(new Error('Driver not found.'));

                        executeTwoCallbacks(
                          getDriverPromise,
                          callback,
                          errorCallback
                        );
                        return getDriverPromise;
                      };

                      LocalForage.prototype.getSerializer = function getSerializer(
                        callback
                      ) {
                        var serializerPromise = Promise$1.resolve(
                          localforageSerializer
                        );
                        executeTwoCallbacks(serializerPromise, callback);
                        return serializerPromise;
                      };

                      LocalForage.prototype.ready = function ready(callback) {
                        var self = this;

                        var promise = self._driverSet.then(function() {
                          if (self._ready === null) {
                            self._ready = self._initDriver();
                          }

                          return self._ready;
                        });

                        executeTwoCallbacks(promise, callback, callback);
                        return promise;
                      };

                      LocalForage.prototype.setDriver = function setDriver(
                        drivers,
                        callback,
                        errorCallback
                      ) {
                        var self = this;

                        if (!isArray(drivers)) {
                          drivers = [drivers];
                        }

                        var supportedDrivers = this._getSupportedDrivers(
                          drivers
                        );

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
                          return function() {
                            var currentDriverIndex = 0;

                            function driverPromiseLoop() {
                              while (
                                currentDriverIndex < supportedDrivers.length
                              ) {
                                var driverName =
                                  supportedDrivers[currentDriverIndex];
                                currentDriverIndex++;

                                self._dbInfo = null;
                                self._ready = null;

                                return self
                                  .getDriver(driverName)
                                  .then(extendSelfWithDriver)
                                  ['catch'](driverPromiseLoop);
                              }

                              setDriverToConfig();
                              var error = new Error(
                                'No available storage method found.'
                              );
                              self._driverSet = Promise$1.reject(error);
                              return self._driverSet;
                            }

                            return driverPromiseLoop();
                          };
                        }

                        // There might be a driver initialization in progress
                        // so wait for it to finish in order to avoid a possible
                        // race condition to set _dbInfo
                        var oldDriverSetDone =
                          this._driverSet !== null
                            ? this._driverSet['catch'](function() {
                                return Promise$1.resolve();
                              })
                            : Promise$1.resolve();

                        this._driverSet = oldDriverSetDone
                          .then(function() {
                            var driverName = supportedDrivers[0];
                            self._dbInfo = null;
                            self._ready = null;

                            return self
                              .getDriver(driverName)
                              .then(function(driver) {
                                self._driver = driver._driver;
                                setDriverToConfig();
                                self._wrapLibraryMethodsWithReady();
                                self._initDriver = initDriver(supportedDrivers);
                              });
                          })
                          ['catch'](function() {
                            setDriverToConfig();
                            var error = new Error(
                              'No available storage method found.'
                            );
                            self._driverSet = Promise$1.reject(error);
                            return self._driverSet;
                          });

                        executeTwoCallbacks(
                          this._driverSet,
                          callback,
                          errorCallback
                        );
                        return this._driverSet;
                      };

                      LocalForage.prototype.supports = function supports(
                        driverName
                      ) {
                        return !!DriverSupport[driverName];
                      };

                      LocalForage.prototype._extend = function _extend(
                        libraryMethodsAndProperties
                      ) {
                        extend(this, libraryMethodsAndProperties);
                      };

                      LocalForage.prototype._getSupportedDrivers = function _getSupportedDrivers(
                        drivers
                      ) {
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
                        for (
                          var i = 0, len = LibraryMethods.length;
                          i < len;
                          i++
                        ) {
                          callWhenReady(this, LibraryMethods[i]);
                        }
                      };

                      LocalForage.prototype.createInstance = function createInstance(
                        options
                      ) {
                        return new LocalForage(options);
                      };

                      return LocalForage;
                    })();

                    // The actual localForage object that we expose as a module or via a
                    // global. It's extended by pulling in one of our other libraries.

                    var localforage_js = new LocalForage();

                    module.exports = localforage_js;
                  },
                  { '3': 3 }
                ]
              },
              {},
              [4]
            )(4);
          });
        }.call(
          this,
          typeof global !== 'undefined'
            ? global
            : typeof self !== 'undefined'
              ? self
              : typeof window !== 'undefined'
                ? window
                : {}
        ));
      },
      {}
    ],
    5: [
      function(require, module, exports) {
        (function(root, factory) {
          'use strict';

          /*istanbul ignore next:cant test*/
          if (
            typeof module === 'object' &&
            typeof module.exports === 'object'
          ) {
            module.exports = factory();
          } else if (typeof define === 'function' && define.amd) {
            // AMD. Register as an anonymous module.
            define([], factory);
          } else {
            // Browser globals
            root.objectPath = factory();
          }
        })(this, function() {
          'use strict';

          var toStr = Object.prototype.toString;
          function hasOwnProperty(obj, prop) {
            if (obj == null) {
              return false;
            }
            //to handle objects with null prototypes (too edge case?)
            return Object.prototype.hasOwnProperty.call(obj, prop);
          }

          function isEmpty(value) {
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

          function toString(type) {
            return toStr.call(type);
          }

          function isObject(obj) {
            return (
              typeof obj === 'object' && toString(obj) === '[object Object]'
            );
          }

          var isArray =
            Array.isArray ||
            function(obj) {
              /*istanbul ignore next:cant test*/
              return toStr.call(obj) === '[object Array]';
            };

          function isBoolean(obj) {
            return (
              typeof obj === 'boolean' || toString(obj) === '[object Boolean]'
            );
          }

          function getKey(key) {
            var intKey = parseInt(key);
            if (intKey.toString() === key) {
              return intKey;
            }
            return key;
          }

          function factory(options) {
            options = options || {};

            var objectPath = function(obj) {
              return Object.keys(objectPath).reduce(function(proxy, prop) {
                if (prop === 'create') {
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
              return (
                options.includeInheritedProps ||
                (typeof prop === 'number' && Array.isArray(obj)) ||
                hasOwnProperty(obj, prop)
              );
            }

            function getShallowProperty(obj, prop) {
              if (hasShallowProperty(obj, prop)) {
                return obj[prop];
              }
            }

            function set(obj, path, value, doNotReplace) {
              if (typeof path === 'number') {
                path = [path];
              }
              if (!path || path.length === 0) {
                return obj;
              }
              if (typeof path === 'string') {
                return set(
                  obj,
                  path.split('.').map(getKey),
                  value,
                  doNotReplace
                );
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
                if (typeof path[1] === 'number') {
                  obj[currentPath] = [];
                } else {
                  obj[currentPath] = {};
                }
              }

              return set(obj[currentPath], path.slice(1), value, doNotReplace);
            }

            objectPath.has = function(obj, path) {
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

                if (
                  (typeof j === 'number' && isArray(obj) && j < obj.length) ||
                  (options.includeInheritedProps
                    ? j in Object(obj)
                    : hasOwnProperty(obj, j))
                ) {
                  obj = obj[j];
                } else {
                  return false;
                }
              }

              return true;
            };

            objectPath.ensureExists = function(obj, path, value) {
              return set(obj, path, value, true);
            };

            objectPath.set = function(obj, path, value, doNotReplace) {
              return set(obj, path, value, doNotReplace);
            };

            objectPath.insert = function(obj, path, value, at) {
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

            objectPath.push = function(obj, path /*, values */) {
              var arr = objectPath.get(obj, path);
              if (!isArray(arr)) {
                arr = [];
                objectPath.set(obj, path, arr);
              }

              arr.push.apply(arr, Array.prototype.slice.call(arguments, 2));
            };

            objectPath.coalesce = function(obj, paths, defaultValue) {
              var value;

              for (var i = 0, len = paths.length; i < len; i++) {
                if ((value = objectPath.get(obj, paths[i])) !== void 0) {
                  return value;
                }
              }

              return defaultValue;
            };

            objectPath.get = function(obj, path, defaultValue) {
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
              var nextObj = getShallowProperty(obj, currentPath);
              if (nextObj === void 0) {
                return defaultValue;
              }

              if (path.length === 1) {
                return nextObj;
              }

              return objectPath.get(
                obj[currentPath],
                path.slice(1),
                defaultValue
              );
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
              if (typeof path === 'string') {
                return objectPath.del(obj, path.split('.'));
              }

              var currentPath = getKey(path[0]);
              if (!hasShallowProperty(obj, currentPath)) {
                return obj;
              }

              if (path.length === 1) {
                if (isArray(obj)) {
                  obj.splice(currentPath, 1);
                } else {
                  delete obj[currentPath];
                }
              } else {
                return objectPath.del(obj[currentPath], path.slice(1));
              }

              return obj;
            };

            return objectPath;
          }

          var mod = factory();
          mod.create = factory;
          mod.withInheritedProps = factory({ includeInheritedProps: true });
          return mod;
        });
      },
      {}
    ],
    6: [
      function(require, module, exports) {
        /**
         * Copyright (c) 2014-present, Facebook, Inc.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         */

        // This method of obtaining a reference to the global object needs to be
        // kept identical to the way it is obtained in runtime.js
        var g =
          (function() {
            return this;
          })() || Function('return this')();

        // Use `getOwnPropertyNames` because not all browsers support calling
        // `hasOwnProperty` on the global `self` object in a worker. See #183.
        var hadRuntime =
          g.regeneratorRuntime &&
          Object.getOwnPropertyNames(g).indexOf('regeneratorRuntime') >= 0;

        // Save the old regeneratorRuntime in case it needs to be restored later.
        var oldRuntime = hadRuntime && g.regeneratorRuntime;

        // Force reevalutation of runtime.js.
        g.regeneratorRuntime = undefined;

        module.exports = require('./runtime');

        if (hadRuntime) {
          // Restore the original runtime.
          g.regeneratorRuntime = oldRuntime;
        } else {
          // Remove the global property added by runtime.js.
          try {
            delete g.regeneratorRuntime;
          } catch (e) {
            g.regeneratorRuntime = undefined;
          }
        }
      },
      { './runtime': 7 }
    ],
    7: [
      function(require, module, exports) {
        /**
         * Copyright (c) 2014-present, Facebook, Inc.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         */

        !(function(global) {
          'use strict';

          var Op = Object.prototype;
          var hasOwn = Op.hasOwnProperty;
          var undefined; // More compressible than void 0.
          var $Symbol = typeof Symbol === 'function' ? Symbol : {};
          var iteratorSymbol = $Symbol.iterator || '@@iterator';
          var asyncIteratorSymbol = $Symbol.asyncIterator || '@@asyncIterator';
          var toStringTagSymbol = $Symbol.toStringTag || '@@toStringTag';

          var inModule = typeof module === 'object';
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
            var protoGenerator =
              outerFn && outerFn.prototype instanceof Generator
                ? outerFn
                : Generator;
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
              return { type: 'normal', arg: fn.call(obj, arg) };
            } catch (err) {
              return { type: 'throw', arg: err };
            }
          }

          var GenStateSuspendedStart = 'suspendedStart';
          var GenStateSuspendedYield = 'suspendedYield';
          var GenStateExecuting = 'executing';
          var GenStateCompleted = 'completed';

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
          IteratorPrototype[iteratorSymbol] = function() {
            return this;
          };

          var getProto = Object.getPrototypeOf;
          var NativeIteratorPrototype =
            getProto && getProto(getProto(values([])));
          if (
            NativeIteratorPrototype &&
            NativeIteratorPrototype !== Op &&
            hasOwn.call(NativeIteratorPrototype, iteratorSymbol)
          ) {
            // This environment has a native %IteratorPrototype%; use it instead
            // of the polyfill.
            IteratorPrototype = NativeIteratorPrototype;
          }

          var Gp = (GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(
            IteratorPrototype
          ));
          GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
          GeneratorFunctionPrototype.constructor = GeneratorFunction;
          GeneratorFunctionPrototype[
            toStringTagSymbol
          ] = GeneratorFunction.displayName = 'GeneratorFunction';

          // Helper for defining the .next, .throw, and .return methods of the
          // Iterator interface in terms of a single ._invoke method.
          function defineIteratorMethods(prototype) {
            ['next', 'throw', 'return'].forEach(function(method) {
              prototype[method] = function(arg) {
                return this._invoke(method, arg);
              };
            });
          }

          runtime.isGeneratorFunction = function(genFun) {
            var ctor = typeof genFun === 'function' && genFun.constructor;
            return ctor
              ? ctor === GeneratorFunction ||
                  // For the native GeneratorFunction constructor, the best we can
                  // do is to check its .name property.
                  (ctor.displayName || ctor.name) === 'GeneratorFunction'
              : false;
          };

          runtime.mark = function(genFun) {
            if (Object.setPrototypeOf) {
              Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
            } else {
              genFun.__proto__ = GeneratorFunctionPrototype;
              if (!(toStringTagSymbol in genFun)) {
                genFun[toStringTagSymbol] = 'GeneratorFunction';
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
              if (record.type === 'throw') {
                reject(record.arg);
              } else {
                var result = record.arg;
                var value = result.value;
                if (
                  value &&
                  typeof value === 'object' &&
                  hasOwn.call(value, '__await')
                ) {
                  return Promise.resolve(value.__await).then(
                    function(value) {
                      invoke('next', value, resolve, reject);
                    },
                    function(err) {
                      invoke('throw', err, resolve, reject);
                    }
                  );
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

              return (previousPromise =
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
                previousPromise
                  ? previousPromise.then(
                      callInvokeWithMethodAndArg,
                      // Avoid propagating failures to Promises returned by later
                      // invocations of the iterator.
                      callInvokeWithMethodAndArg
                    )
                  : callInvokeWithMethodAndArg());
            }

            // Define the unified helper method that is used to implement .next,
            // .throw, and .return (see defineIteratorMethods).
            this._invoke = enqueue;
          }

          defineIteratorMethods(AsyncIterator.prototype);
          AsyncIterator.prototype[asyncIteratorSymbol] = function() {
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
                throw new Error('Generator is already running');
              }

              if (state === GenStateCompleted) {
                if (method === 'throw') {
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

                if (context.method === 'next') {
                  // Setting context._sent for legacy support of Babel's
                  // function.sent implementation.
                  context.sent = context._sent = context.arg;
                } else if (context.method === 'throw') {
                  if (state === GenStateSuspendedStart) {
                    state = GenStateCompleted;
                    throw context.arg;
                  }

                  context.dispatchException(context.arg);
                } else if (context.method === 'return') {
                  context.abrupt('return', context.arg);
                }

                state = GenStateExecuting;

                var record = tryCatch(innerFn, self, context);
                if (record.type === 'normal') {
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
                } else if (record.type === 'throw') {
                  state = GenStateCompleted;
                  // Dispatch the exception by looping back around to the
                  // context.dispatchException(context.arg) call above.
                  context.method = 'throw';
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

              if (context.method === 'throw') {
                if (delegate.iterator.return) {
                  // If the delegate iterator has a return method, give it a
                  // chance to clean up.
                  context.method = 'return';
                  context.arg = undefined;
                  maybeInvokeDelegate(delegate, context);

                  if (context.method === 'throw') {
                    // If maybeInvokeDelegate(context) changed context.method from
                    // "return" to "throw", let that override the TypeError below.
                    return ContinueSentinel;
                  }
                }

                context.method = 'throw';
                context.arg = new TypeError(
                  "The iterator does not provide a 'throw' method"
                );
              }

              return ContinueSentinel;
            }

            var record = tryCatch(method, delegate.iterator, context.arg);

            if (record.type === 'throw') {
              context.method = 'throw';
              context.arg = record.arg;
              context.delegate = null;
              return ContinueSentinel;
            }

            var info = record.arg;

            if (!info) {
              context.method = 'throw';
              context.arg = new TypeError('iterator result is not an object');
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
              if (context.method !== 'return') {
                context.method = 'next';
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

          Gp[toStringTagSymbol] = 'Generator';

          // A Generator should always return itself as the iterator object when the
          // @@iterator function is called on it. Some browsers' implementations of the
          // iterator prototype chain incorrectly implement this, causing the Generator
          // object to not be returned from this call. This ensures that doesn't happen.
          // See https://github.com/facebook/regenerator/issues/274 for more details.
          Gp[iteratorSymbol] = function() {
            return this;
          };

          Gp.toString = function() {
            return '[object Generator]';
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
            record.type = 'normal';
            delete record.arg;
            entry.completion = record;
          }

          function Context(tryLocsList) {
            // The root entry object (effectively a try statement without a catch
            // or a finally block) gives us a place to store values thrown from
            // locations where there is no enclosing try statement.
            this.tryEntries = [{ tryLoc: 'root' }];
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

              if (typeof iterable.next === 'function') {
                return iterable;
              }

              if (!isNaN(iterable.length)) {
                var i = -1,
                  next = function next() {
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

                return (next.next = next);
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

              this.method = 'next';
              this.arg = undefined;

              this.tryEntries.forEach(resetTryEntry);

              if (!skipTempReset) {
                for (var name in this) {
                  // Not sure about the optimal order of these conditions:
                  if (
                    name.charAt(0) === 't' &&
                    hasOwn.call(this, name) &&
                    !isNaN(+name.slice(1))
                  ) {
                    this[name] = undefined;
                  }
                }
              }
            },

            stop: function() {
              this.done = true;

              var rootEntry = this.tryEntries[0];
              var rootRecord = rootEntry.completion;
              if (rootRecord.type === 'throw') {
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
                record.type = 'throw';
                record.arg = exception;
                context.next = loc;

                if (caught) {
                  // If the dispatched exception was caught by a catch block,
                  // then let that catch block handle the exception normally.
                  context.method = 'next';
                  context.arg = undefined;
                }

                return !!caught;
              }

              for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                var entry = this.tryEntries[i];
                var record = entry.completion;

                if (entry.tryLoc === 'root') {
                  // Exception thrown outside of any try block that could handle
                  // it, so set the completion value of the entire function to
                  // throw the exception.
                  return handle('end');
                }

                if (entry.tryLoc <= this.prev) {
                  var hasCatch = hasOwn.call(entry, 'catchLoc');
                  var hasFinally = hasOwn.call(entry, 'finallyLoc');

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
                    throw new Error('try statement without catch or finally');
                  }
                }
              }
            },

            abrupt: function(type, arg) {
              for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                var entry = this.tryEntries[i];
                if (
                  entry.tryLoc <= this.prev &&
                  hasOwn.call(entry, 'finallyLoc') &&
                  this.prev < entry.finallyLoc
                ) {
                  var finallyEntry = entry;
                  break;
                }
              }

              if (
                finallyEntry &&
                (type === 'break' || type === 'continue') &&
                finallyEntry.tryLoc <= arg &&
                arg <= finallyEntry.finallyLoc
              ) {
                // Ignore the finally entry if control is not jumping to a
                // location outside the try/catch block.
                finallyEntry = null;
              }

              var record = finallyEntry ? finallyEntry.completion : {};
              record.type = type;
              record.arg = arg;

              if (finallyEntry) {
                this.method = 'next';
                this.next = finallyEntry.finallyLoc;
                return ContinueSentinel;
              }

              return this.complete(record);
            },

            complete: function(record, afterLoc) {
              if (record.type === 'throw') {
                throw record.arg;
              }

              if (record.type === 'break' || record.type === 'continue') {
                this.next = record.arg;
              } else if (record.type === 'return') {
                this.rval = this.arg = record.arg;
                this.method = 'return';
                this.next = 'end';
              } else if (record.type === 'normal' && afterLoc) {
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

            catch: function(tryLoc) {
              for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                var entry = this.tryEntries[i];
                if (entry.tryLoc === tryLoc) {
                  var record = entry.completion;
                  if (record.type === 'throw') {
                    var thrown = record.arg;
                    resetTryEntry(entry);
                  }
                  return thrown;
                }
              }

              // The context.catch method must only be called with a location
              // argument that corresponds to a known catch block.
              throw new Error('illegal catch attempt');
            },

            delegateYield: function(iterable, resultName, nextLoc) {
              this.delegate = {
                iterator: values(iterable),
                resultName: resultName,
                nextLoc: nextLoc
              };

              if (this.method === 'next') {
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
          (function() {
            return this;
          })() || Function('return this')()
        );
      },
      {}
    ],
    8: [
      function(require, module, exports) {
        /**
         * Module Dependencies
         */

        var expr;
        try {
          expr = require('props');
        } catch (e) {
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
          return function(obj) {
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
          return function(obj) {
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
            match[key] =
              typeof obj[key] === 'string'
                ? defaultToFunction(obj[key])
                : toFunction(obj[key]);
          }
          return function(val) {
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
            val =
              "('function' == typeof " +
              val +
              ' ? ' +
              val +
              '() : ' +
              val +
              ')';

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

        function stripNested(prop, str, val) {
          return str.replace(new RegExp('(\\.)?' + prop, 'g'), function(
            $0,
            $1
          ) {
            return $1 ? $0 : val;
          });
        }
      },
      { 'component-props': 2, props: 2 }
    ],
    9: [
      function(require, module, exports) {
        'use strict';
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.InMemoryAdapter = exports.LocalForageAdapter = undefined;
        var _localforage = require('./localforage');
        var _localforage2 = _interopRequireDefault(_localforage);
        var _inmemory = require('./inmemory');
        var _inmemory2 = _interopRequireDefault(_inmemory);
        function _interopRequireDefault(obj) {
          return obj && obj.__esModule ? obj : { default: obj };
        }
        exports.LocalForageAdapter = _localforage2.default;
        exports.InMemoryAdapter = _inmemory2.default;
      },
      { './inmemory': 10, './localforage': 11 }
    ],
    10: [
      function(require, module, exports) {
        'use strict';
        Object.defineProperty(exports, '__esModule', { value: true });
        var _regenerator = require('babel-runtime/regenerator');
        var _regenerator2 = _interopRequireDefault(_regenerator);
        var _extends =
          Object.assign ||
          function(target) {
            for (var i = 1; i < arguments.length; i++) {
              var source = arguments[i];
              for (var key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                  target[key] = source[key];
                }
              }
            }
            return target;
          };
        var _createClass = (function() {
          function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
              var descriptor = props[i];
              descriptor.enumerable = descriptor.enumerable || false;
              descriptor.configurable = true;
              if ('value' in descriptor) descriptor.writable = true;
              Object.defineProperty(target, descriptor.key, descriptor);
            }
          }
          return function(Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
          };
        })();
        function _interopRequireDefault(obj) {
          return obj && obj.__esModule ? obj : { default: obj };
        }
        function _toConsumableArray(arr) {
          if (Array.isArray(arr)) {
            for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
              arr2[i] = arr[i];
            }
            return arr2;
          } else {
            return Array.from(arr);
          }
        }
        function _asyncToGenerator(fn) {
          return function() {
            var gen = fn.apply(this, arguments);
            return new Promise(function(resolve, reject) {
              function step(key, arg) {
                try {
                  var info = gen[key](arg);
                  var value = info.value;
                } catch (error) {
                  reject(error);
                  return;
                }
                if (info.done) {
                  resolve(value);
                } else {
                  return Promise.resolve(value).then(
                    function(value) {
                      step('next', value);
                    },
                    function(err) {
                      step('throw', err);
                    }
                  );
                }
              }
              return step('next');
            });
          };
        }
        function _classCallCheck(instance, Constructor) {
          if (!(instance instanceof Constructor)) {
            throw new TypeError('Cannot call a class as a function');
          }
        }
        var InMemoryAdapter = (function() {
          function InMemoryAdapter(config) {
            _classCallCheck(this, InMemoryAdapter);
            this.store = {};
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
           */ _createClass(InMemoryAdapter, [
            {
              key: 'get',
              value: (function() {
                var _ref = _asyncToGenerator(
                  /*#__PURE__*/ _regenerator2.default.mark(function _callee(
                    name
                  ) {
                    var collName;
                    return _regenerator2.default.wrap(
                      function _callee$(_context) {
                        while (1) {
                          switch ((_context.prev = _context.next)) {
                            case 0:
                              collName = this.storageName(name);
                              return _context.abrupt(
                                'return',
                                [].concat(
                                  _toConsumableArray(
                                    this.getCollection(collName)
                                  )
                                )
                              );
                            case 2:
                            case 'end':
                              return _context.stop();
                          }
                        }
                      },
                      _callee,
                      this
                    );
                  })
                );
                function get(_x) {
                  return _ref.apply(this, arguments);
                }
                return get;
              })()

              /**
               * Add item to store
               *
               * @param  {String} key
               * @param  {String} value
               * @return {Promise<Any>}
               *
               * @api public
               */
            },
            {
              key: 'set',
              value: (function() {
                var _ref2 = _asyncToGenerator(
                  /*#__PURE__*/ _regenerator2.default.mark(function _callee2(
                    key,
                    value
                  ) {
                    return _regenerator2.default.wrap(
                      function _callee2$(_context2) {
                        while (1) {
                          switch ((_context2.prev = _context2.next)) {
                            case 0:
                              this.store[this.storageName(key)] = [].concat(
                                _toConsumableArray(value)
                              );
                              return _context2.abrupt('return', value);
                            case 2:
                            case 'end':
                              return _context2.stop();
                          }
                        }
                      },
                      _callee2,
                      this
                    );
                  })
                );
                function set(_x2, _x3) {
                  return _ref2.apply(this, arguments);
                }
                return set;
              })()

              /**
               * Item checker in store
               *
               * @param  {String} key
               * @return {Promise<Boolean>}
               *
               * @api public
               */
            },
            {
              key: 'has',
              value: (function() {
                var _ref3 = _asyncToGenerator(
                  /*#__PURE__*/ _regenerator2.default.mark(function _callee3(
                    key
                  ) {
                    return _regenerator2.default.wrap(
                      function _callee3$(_context3) {
                        while (1) {
                          switch ((_context3.prev = _context3.next)) {
                            case 0:
                              return _context3.abrupt(
                                'return',
                                Object.prototype.hasOwnProperty.call(
                                  this.store,
                                  this.storageName(key)
                                )
                              );
                            case 1:
                            case 'end':
                              return _context3.stop();
                          }
                        }
                      },
                      _callee3,
                      this
                    );
                  })
                );
                function has(_x4) {
                  return _ref3.apply(this, arguments);
                }
                return has;
              })()

              /**
               * Remove item
               *
               * @param  {String} key
               * @return {Promise<Any>}
               *
               * @api public
               */
            },
            {
              key: 'clear',
              value: (function() {
                var _ref4 = _asyncToGenerator(
                  /*#__PURE__*/ _regenerator2.default.mark(function _callee4(
                    key
                  ) {
                    var result;
                    return _regenerator2.default.wrap(
                      function _callee4$(_context4) {
                        while (1) {
                          switch ((_context4.prev = _context4.next)) {
                            case 0:
                              _context4.next = 2;
                              return this.has(key);
                            case 2:
                              if (!_context4.sent) {
                                _context4.next = 6;
                                break;
                              }
                              _context4.t0 = delete this.store[
                                this.storageName(key)
                              ];
                              _context4.next = 7;
                              break;
                            case 6:
                              _context4.t0 = false;
                            case 7:
                              result = _context4.t0;
                              this.store = _extends({}, this.store);
                              return _context4.abrupt('return', result);
                            case 10:
                            case 'end':
                              return _context4.stop();
                          }
                        }
                      },
                      _callee4,
                      this
                    );
                  })
                );
                function clear(_x5) {
                  return _ref4.apply(this, arguments);
                }
                return clear;
              })()

              /**
               * Compose collection name by suffix
               *
               * @param  {String} suffix
               * @return {String}
               *
               * @api public
               */
            },
            {
              key: 'storageName',
              value: function storageName(suffix) {
                return suffix.startsWith(this.getPrefix())
                  ? suffix
                  : this.getPrefix() + '_' + suffix;
              }

              /**
               * Get prefix of channel collection
               *
               * @return {String}
               *
               * @api public
               */
            },
            {
              key: 'getPrefix',
              value: function getPrefix() {
                return this.config.get('prefix');
              }

              /**
               * Get collection
               *
               * @param  {String} name
               * @return {String}
               *
               * @api private
               */
            },
            {
              key: 'getCollection',
              value: function getCollection(name) {
                var has = Object.prototype.hasOwnProperty.call(
                  this.store,
                  name
                );
                if (!has) this.store[name] = [];
                return this.store[name];
              }
            }
          ]);
          return InMemoryAdapter;
        })();
        exports.default = InMemoryAdapter;
      },
      { 'babel-runtime/regenerator': 1 }
    ],
    11: [
      function(require, module, exports) {
        'use strict';
        Object.defineProperty(exports, '__esModule', { value: true });
        var _regenerator = require('babel-runtime/regenerator');
        var _regenerator2 = _interopRequireDefault(_regenerator);
        var _createClass = (function() {
          function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
              var descriptor = props[i];
              descriptor.enumerable = descriptor.enumerable || false;
              descriptor.configurable = true;
              if ('value' in descriptor) descriptor.writable = true;
              Object.defineProperty(target, descriptor.key, descriptor);
            }
          }
          return function(Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
          };
        })();
        var _localforage = require('localforage');
        var _localforage2 = _interopRequireDefault(_localforage);
        function _interopRequireDefault(obj) {
          return obj && obj.__esModule ? obj : { default: obj };
        }
        function _asyncToGenerator(fn) {
          return function() {
            var gen = fn.apply(this, arguments);
            return new Promise(function(resolve, reject) {
              function step(key, arg) {
                try {
                  var info = gen[key](arg);
                  var value = info.value;
                } catch (error) {
                  reject(error);
                  return;
                }
                if (info.done) {
                  resolve(value);
                } else {
                  return Promise.resolve(value).then(
                    function(value) {
                      step('next', value);
                    },
                    function(err) {
                      step('throw', err);
                    }
                  );
                }
              }
              return step('next');
            });
          };
        }
        function _classCallCheck(instance, Constructor) {
          if (!(instance instanceof Constructor)) {
            throw new TypeError('Cannot call a class as a function');
          }
        }
        var LocalForageAdapter = (function() {
          function LocalForageAdapter(config) {
            _classCallCheck(this, LocalForageAdapter);
            this.drivers = ['localstorage', 'indexeddb', 'websql'];
            this.config = config;
            this.prefix = this.config.get('prefix');
            _localforage2.default.config({
              driver: this.getDriver(),
              name: this.prefix
            });
          }

          /**
           * Take item from storage by key
           *
           * @param  {String} key
           * @return {Promise<ITask>} (array)
           *
           * @api public
           */ _createClass(LocalForageAdapter, [
            {
              key: 'get',
              value: (function() {
                var _ref = _asyncToGenerator(
                  /*#__PURE__*/ _regenerator2.default.mark(function _callee(
                    key
                  ) {
                    var items;
                    return _regenerator2.default.wrap(
                      function _callee$(_context) {
                        while (1) {
                          switch ((_context.prev = _context.next)) {
                            case 0:
                              _context.next = 2;
                              return _localforage2.default.getItem(
                                this.storageName(key)
                              );
                            case 2:
                              items = _context.sent;
                              return _context.abrupt(
                                'return',
                                (typeof items === 'string'
                                  ? JSON.parse(items)
                                  : items) || []
                              );
                            case 4:
                            case 'end':
                              return _context.stop();
                          }
                        }
                      },
                      _callee,
                      this
                    );
                  })
                );
                function get(_x) {
                  return _ref.apply(this, arguments);
                }
                return get;
              })()

              /**
               * Add item to local storage
               *
               * @param  {String} key
               * @param  {String} value
               * @return {Promise<Any>}
               *
               * @api public
               */
            },
            {
              key: 'set',
              value: (function() {
                var _ref2 = _asyncToGenerator(
                  /*#__PURE__*/ _regenerator2.default.mark(function _callee2(
                    key,
                    value
                  ) {
                    var result;
                    return _regenerator2.default.wrap(
                      function _callee2$(_context2) {
                        while (1) {
                          switch ((_context2.prev = _context2.next)) {
                            case 0:
                              _context2.next = 2;
                              return _localforage2.default.setItem(
                                this.storageName(key),
                                value
                              );
                            case 2:
                              result = _context2.sent;
                              return _context2.abrupt('return', result);
                            case 4:
                            case 'end':
                              return _context2.stop();
                          }
                        }
                      },
                      _callee2,
                      this
                    );
                  })
                );
                function set(_x2, _x3) {
                  return _ref2.apply(this, arguments);
                }
                return set;
              })()

              /**
               * Item checker in storage
               *
               * @param  {String} key
               * @return {Promise<Boolean>}
               *
               * @api public
               */
            },
            {
              key: 'has',
              value: (function() {
                var _ref3 = _asyncToGenerator(
                  /*#__PURE__*/ _regenerator2.default.mark(function _callee3(
                    key
                  ) {
                    var keys;
                    return _regenerator2.default.wrap(
                      function _callee3$(_context3) {
                        while (1) {
                          switch ((_context3.prev = _context3.next)) {
                            case 0:
                              _context3.next = 2;
                              return _localforage2.default.keys();
                            case 2:
                              keys = _context3.sent;
                              return _context3.abrupt(
                                'return',
                                keys.indexOf(this.storageName(key)) > -1
                              );
                            case 4:
                            case 'end':
                              return _context3.stop();
                          }
                        }
                      },
                      _callee3,
                      this
                    );
                  })
                );
                function has(_x4) {
                  return _ref3.apply(this, arguments);
                }
                return has;
              })()

              /**
               * Remove item
               *
               * @param  {String} key
               * @return {Promise<Any>}
               *
               * @api public
               */
            },
            {
              key: 'clear',
              value: (function() {
                var _ref4 = _asyncToGenerator(
                  /*#__PURE__*/ _regenerator2.default.mark(function _callee4(
                    key
                  ) {
                    var result;
                    return _regenerator2.default.wrap(
                      function _callee4$(_context4) {
                        while (1) {
                          switch ((_context4.prev = _context4.next)) {
                            case 0:
                              _context4.next = 2;
                              return _localforage2.default.removeItem(
                                this.storageName(key)
                              );
                            case 2:
                              result = _context4.sent;
                              return _context4.abrupt('return', result);
                            case 4:
                            case 'end':
                              return _context4.stop();
                          }
                        }
                      },
                      _callee4,
                      this
                    );
                  })
                );
                function clear(_x5) {
                  return _ref4.apply(this, arguments);
                }
                return clear;
              })()

              /**
               * Remove all items
               *
               * @return {Promise<Any>}
               *
               * @api public
               */
            },
            {
              key: 'clearAll',
              value: (function() {
                var _ref5 = _asyncToGenerator(
                  /*#__PURE__*/ _regenerator2.default.mark(function _callee6() {
                    var _this = this;
                    var keys, result;
                    return _regenerator2.default.wrap(
                      function _callee6$(_context6) {
                        while (1) {
                          switch ((_context6.prev = _context6.next)) {
                            case 0:
                              _context6.next = 2;
                              return _localforage2.default.keys();
                            case 2:
                              keys = _context6.sent;
                              _context6.next = 5;
                              return Promise.all(
                                keys.map(
                                  (function() {
                                    var _ref6 = _asyncToGenerator(
                                      /*#__PURE__*/ _regenerator2.default.mark(
                                        function _callee5(key) {
                                          var cleared;
                                          return _regenerator2.default.wrap(
                                            function _callee5$(_context5) {
                                              while (1) {
                                                switch (
                                                  (_context5.prev =
                                                    _context5.next)
                                                ) {
                                                  case 0:
                                                    _context5.next = 2;
                                                    return _this.clear(key);
                                                  case 2:
                                                    cleared = _context5.sent;
                                                    return _context5.abrupt(
                                                      'return',
                                                      cleared
                                                    );
                                                  case 4:
                                                  case 'end':
                                                    return _context5.stop();
                                                }
                                              }
                                            },
                                            _callee5,
                                            _this
                                          );
                                        }
                                      )
                                    );
                                    return function(_x6) {
                                      return _ref6.apply(this, arguments);
                                    };
                                  })()
                                )
                              );
                            case 5:
                              result = _context6.sent;
                              return _context6.abrupt(
                                'return',

                                result
                              );
                            case 7:
                            case 'end':
                              return _context6.stop();
                          }
                        }
                      },
                      _callee6,
                      this
                    );
                  })
                );
                function clearAll() {
                  return _ref5.apply(this, arguments);
                }
                return clearAll;
              })()

              /**
               * Compose storage name by suffix
               *
               * @param  {String} suffix
               * @return {String}
               *
               * @api public
               */
            },
            {
              key: 'storageName',
              value: function storageName(suffix) {
                return suffix.startsWith(this.getPrefix())
                  ? suffix
                  : this.getPrefix() + '_' + suffix;
              }

              /**
               * Get prefix of channel storage
               *
               * @return {String}
               *
               * @api public
               */
            },
            {
              key: 'getPrefix',
              value: function getPrefix() {
                return this.config.get('prefix');
              }
            },
            {
              key: 'getDriver',
              value: function getDriver() {
                var defaultDriver = this.config.get('defaultStorage');
                var driver = (
                  this.config.get('storage') || defaultDriver
                ).toLowerCase();
                return this.drivers.indexOf(driver) > -1
                  ? _localforage2.default[driver.toUpperCase()]
                  : _localforage2.default[defaultDriver.toUpperCase()];
              }
            }
          ]);
          return LocalForageAdapter;
        })();
        exports.default = LocalForageAdapter;
      },
      { 'babel-runtime/regenerator': 1, localforage: 4 }
    ],
    12: [
      function(require, module, exports) {
        'use strict';
        Object.defineProperty(exports, '__esModule', { value: true });
        var _regenerator = require('babel-runtime/regenerator');
        var _regenerator2 = _interopRequireDefault(_regenerator);
        var _createClass = (function() {
          function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
              var descriptor = props[i];
              descriptor.enumerable = descriptor.enumerable || false;
              descriptor.configurable = true;
              if ('value' in descriptor) descriptor.writable = true;
              Object.defineProperty(target, descriptor.key, descriptor);
            }
          }
          return function(Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
          };
        })();

        var _event2 = require('./event');
        var _event3 = _interopRequireDefault(_event2);
        var _storageCapsule = require('./storage-capsule');
        var _storageCapsule2 = _interopRequireDefault(_storageCapsule);
        var _queue = require('./queue');
        var _queue2 = _interopRequireDefault(_queue);
        var _utils = require('./utils');
        var _helpers = require('./helpers');

        var _console = require('./console');
        function _interopRequireDefault(obj) {
          return obj && obj.__esModule ? obj : { default: obj };
        }
        function _asyncToGenerator(fn) {
          return function() {
            var gen = fn.apply(this, arguments);
            return new Promise(function(resolve, reject) {
              function step(key, arg) {
                try {
                  var info = gen[key](arg);
                  var value = info.value;
                } catch (error) {
                  reject(error);
                  return;
                }
                if (info.done) {
                  resolve(value);
                } else {
                  return Promise.resolve(value).then(
                    function(value) {
                      step('next', value);
                    },
                    function(err) {
                      step('throw', err);
                    }
                  );
                }
              }
              return step('next');
            });
          };
        }
        function _classCallCheck(instance, Constructor) {
          if (!(instance instanceof Constructor)) {
            throw new TypeError('Cannot call a class as a function');
          }
        }

        /* eslint no-underscore-dangle: [2, { "allow": ["_id"] }] */

        var channelName = Symbol('channel-name');
        var Channel = (function() {
          function Channel(name, config) {
            _classCallCheck(this, Channel);
            this.stopped = true;
            this.running = false;
            this.event = new _event3.default();
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
           */ _createClass(Channel, [
            {
              key: 'name',
              value: function name() {
                return this[channelName];
              }

              /**
               * Create new job to channel
               *
               * @param  {Object} task
               * @return {String|Boolean} job
               *
               * @api public
               */
            },
            {
              key: 'add',
              value: (function() {
                var _ref = _asyncToGenerator(
                  /*#__PURE__*/ _regenerator2.default.mark(function _callee(
                    task
                  ) {
                    var id;
                    return _regenerator2.default.wrap(
                      function _callee$(_context) {
                        while (1) {
                          switch ((_context.prev = _context.next)) {
                            case 0:
                              _context.next = 2;
                              return _helpers.canMultiple.call(this, task);
                            case 2:
                              if (_context.sent) {
                                _context.next = 4;
                                break;
                              }
                              return _context.abrupt('return', false);
                            case 4:
                              _context.next = 6;
                              return _helpers.saveTask.call(this, task);
                            case 6:
                              id = _context.sent;
                              if (
                                !(id && this.stopped && this.running === true)
                              ) {
                                _context.next = 10;
                                break;
                              }
                              _context.next = 10;
                              return this.start();
                            case 10:
                              // pass activity to the log service.
                              _helpers.logProxy.call(
                                this,
                                _console.taskAddedLog,
                                task
                              );
                              return _context.abrupt(
                                'return',

                                id
                              );
                            case 12:
                            case 'end':
                              return _context.stop();
                          }
                        }
                      },
                      _callee,
                      this
                    );
                  })
                );
                function add(_x) {
                  return _ref.apply(this, arguments);
                }
                return add;
              })()

              /**
               * Process next job
               *
               * @return {void}
               *
               * @api public
               */
            },
            {
              key: 'next',
              value: (function() {
                var _ref2 = _asyncToGenerator(
                  /*#__PURE__*/ _regenerator2.default.mark(function _callee2() {
                    return _regenerator2.default.wrap(
                      function _callee2$(_context2) {
                        while (1) {
                          switch ((_context2.prev = _context2.next)) {
                            case 0:
                              if (!this.stopped) {
                                _context2.next = 3;
                                break;
                              }
                              _helpers.statusOff.call(this);
                              return _context2.abrupt(
                                'return',
                                _helpers.stopQueue.call(this)
                              );
                            case 3:
                              // Generate a log message
                              _helpers.logProxy.call(
                                this,
                                _console.nextTaskLog,
                                'next'
                              );

                              // start queue again
                              _context2.next = 6;
                              return this.start();
                            case 6:
                              return _context2.abrupt(
                                'return',

                                true
                              );
                            case 7:
                            case 'end':
                              return _context2.stop();
                          }
                        }
                      },
                      _callee2,
                      this
                    );
                  })
                );
                function next() {
                  return _ref2.apply(this, arguments);
                }
                return next;
              })()

              /**
               * Start queue listener
               *
               * @return {Boolean} job
               *
               * @api public
               */
            },
            {
              key: 'start',
              value: (function() {
                var _ref3 = _asyncToGenerator(
                  /*#__PURE__*/ _regenerator2.default.mark(function _callee3() {
                    return _regenerator2.default.wrap(
                      function _callee3$(_context3) {
                        while (1) {
                          switch ((_context3.prev = _context3.next)) {
                            case 0:
                              // Stop the queue for restart
                              this.stopped = false;

                              // Register tasks, if not registered
                              _helpers.registerWorkers.call(this);

                              _helpers.logProxy.call(
                                this,
                                _console.queueStartLog,
                                'start'
                              );

                              // Create a timeout for start queue
                              _context3.next = 5;
                              return _helpers.createTimeout.call(this);
                            case 5:
                              _context3.t0 = _context3.sent;
                              this.running = _context3.t0 > 0;
                              return _context3.abrupt(
                                'return',

                                this.running
                              );
                            case 8:
                            case 'end':
                              return _context3.stop();
                          }
                        }
                      },
                      _callee3,
                      this
                    );
                  })
                );
                function start() {
                  return _ref3.apply(this, arguments);
                }
                return start;
              })()

              /**
               * Stop queue listener after end of current task
               *
               * @return {Void}
               *
               * @api public
               */
            },
            {
              key: 'stop',
              value: function stop() {
                _helpers.logProxy.call(this, _console.queueStoppingLog, 'stop');
                this.stopped = true;
              }

              /**
               * Stop queue listener including current task
               *
               * @return {Void}
               *
               * @api public
               */
            },
            {
              key: 'forceStop',
              value: function forceStop() {
                /* istanbul ignore next */
                _helpers.stopQueue.call(this);
              }

              /**
               * Check whether there is any task
               *
               * @return {Booelan}
               *
               * @api public
               */
            },
            {
              key: 'isEmpty',
              value: (function() {
                var _ref4 = _asyncToGenerator(
                  /*#__PURE__*/ _regenerator2.default.mark(function _callee4() {
                    return _regenerator2.default.wrap(
                      function _callee4$(_context4) {
                        while (1) {
                          switch ((_context4.prev = _context4.next)) {
                            case 0:
                              _context4.next = 2;
                              return this.count();
                            case 2:
                              _context4.t0 = _context4.sent;
                              return _context4.abrupt(
                                'return',
                                _context4.t0 < 1
                              );
                            case 4:
                            case 'end':
                              return _context4.stop();
                          }
                        }
                      },
                      _callee4,
                      this
                    );
                  })
                );
                function isEmpty() {
                  return _ref4.apply(this, arguments);
                }
                return isEmpty;
              })()

              /**
               * Get task count
               *
               * @return {Number}
               *
               * @api public
               */
            },
            {
              key: 'count',
              value: (function() {
                var _ref5 = _asyncToGenerator(
                  /*#__PURE__*/ _regenerator2.default.mark(function _callee5() {
                    return _regenerator2.default.wrap(
                      function _callee5$(_context5) {
                        while (1) {
                          switch ((_context5.prev = _context5.next)) {
                            case 0:
                              _context5.next = 2;
                              return _helpers.getTasksWithoutFreezed.call(this);
                            case 2:
                              return _context5.abrupt(
                                'return',
                                _context5.sent.length
                              );
                            case 3:
                            case 'end':
                              return _context5.stop();
                          }
                        }
                      },
                      _callee5,
                      this
                    );
                  })
                );
                function count() {
                  return _ref5.apply(this, arguments);
                }
                return count;
              })()

              /**
               * Get task count by tag
               *
               * @param  {String} tag
               * @return {Array<ITask>}
               *
               * @api public
               */
            },
            {
              key: 'countByTag',
              value: (function() {
                var _ref6 = _asyncToGenerator(
                  /*#__PURE__*/ _regenerator2.default.mark(function _callee6(
                    tag
                  ) {
                    return _regenerator2.default.wrap(
                      function _callee6$(_context6) {
                        while (1) {
                          switch ((_context6.prev = _context6.next)) {
                            case 0:
                              _context6.next = 2;
                              return _helpers.getTasksWithoutFreezed.call(this);
                            case 2:
                              _context6.t0 = function(t) {
                                return t.tag === tag;
                              };
                              return _context6.abrupt(
                                'return',
                                _context6.sent.filter(_context6.t0).length
                              );
                            case 4:
                            case 'end':
                              return _context6.stop();
                          }
                        }
                      },
                      _callee6,
                      this
                    );
                  })
                );
                function countByTag(_x2) {
                  return _ref6.apply(this, arguments);
                }
                return countByTag;
              })()

              /**
               * Remove all tasks from channel
               *
               * @return {Boolean}
               *
               * @api public
               */
            },
            {
              key: 'clear',
              value: function clear() {
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
               */
            },
            {
              key: 'clearByTag',
              value: (function() {
                var _ref7 = _asyncToGenerator(
                  /*#__PURE__*/ _regenerator2.default.mark(function _callee8(
                    tag
                  ) {
                    var _this = this;
                    var self, data, removes;
                    return _regenerator2.default.wrap(
                      function _callee8$(_context8) {
                        while (1) {
                          switch ((_context8.prev = _context8.next)) {
                            case 0:
                              self = this;
                              _context8.next = 3;
                              return _helpers.db.call(self).all();
                            case 3:
                              data = _context8.sent;
                              removes = data
                                .filter(_utils.utilClearByTag.bind(tag))
                                .map(
                                  (function() {
                                    var _ref8 = _asyncToGenerator(
                                      /*#__PURE__*/ _regenerator2.default.mark(
                                        function _callee7(t) {
                                          var result;
                                          return _regenerator2.default.wrap(
                                            function _callee7$(_context7) {
                                              while (1) {
                                                switch (
                                                  (_context7.prev =
                                                    _context7.next)
                                                ) {
                                                  case 0:
                                                    _context7.next = 2;
                                                    return _helpers.db
                                                      .call(self)
                                                      .delete(t._id);
                                                  case 2:
                                                    result = _context7.sent;
                                                    return _context7.abrupt(
                                                      'return',
                                                      result
                                                    );
                                                  case 4:
                                                  case 'end':
                                                    return _context7.stop();
                                                }
                                              }
                                            },
                                            _callee7,
                                            _this
                                          );
                                        }
                                      )
                                    );
                                    return function(_x4) {
                                      return _ref8.apply(this, arguments);
                                    };
                                  })()
                                );
                              _context8.next = 7;
                              return Promise.all(removes);
                            case 7:
                            case 'end':
                              return _context8.stop();
                          }
                        }
                      },
                      _callee8,
                      this
                    );
                  })
                );
                function clearByTag(_x3) {
                  return _ref7.apply(this, arguments);
                }
                return clearByTag;
              })()

              /**
               * Check a task whether exists by job id
               *
               * @param  {String} tag
               * @return {Boolean}
               *
               * @api public
               */
            },
            {
              key: 'has',
              value: (function() {
                var _ref9 = _asyncToGenerator(
                  /*#__PURE__*/ _regenerator2.default.mark(function _callee9(
                    id
                  ) {
                    return _regenerator2.default.wrap(
                      function _callee9$(_context9) {
                        while (1) {
                          switch ((_context9.prev = _context9.next)) {
                            case 0:
                              _context9.next = 2;
                              return _helpers.getTasksWithoutFreezed.call(this);
                            case 2:
                              _context9.t0 = function(t) {
                                return t._id === id;
                              };
                              _context9.t1 = _context9.sent.findIndex(
                                _context9.t0
                              );
                              _context9.t2 = -1;
                              return _context9.abrupt(
                                'return',
                                _context9.t1 > _context9.t2
                              );
                            case 6:
                            case 'end':
                              return _context9.stop();
                          }
                        }
                      },
                      _callee9,
                      this
                    );
                  })
                );
                function has(_x5) {
                  return _ref9.apply(this, arguments);
                }
                return has;
              })()

              /**
               * Check a task whether exists by tag
               *
               * @param  {String} tag
               * @return {Boolean}
               *
               * @api public
               */
            },
            {
              key: 'hasByTag',
              value: (function() {
                var _ref10 = _asyncToGenerator(
                  /*#__PURE__*/ _regenerator2.default.mark(function _callee10(
                    tag
                  ) {
                    return _regenerator2.default.wrap(
                      function _callee10$(_context10) {
                        while (1) {
                          switch ((_context10.prev = _context10.next)) {
                            case 0:
                              _context10.next = 2;
                              return _helpers.getTasksWithoutFreezed.call(this);
                            case 2:
                              _context10.t0 = function(t) {
                                return t.tag === tag;
                              };
                              _context10.t1 = _context10.sent.findIndex(
                                _context10.t0
                              );
                              _context10.t2 = -1;
                              return _context10.abrupt(
                                'return',
                                _context10.t1 > _context10.t2
                              );
                            case 6:
                            case 'end':
                              return _context10.stop();
                          }
                        }
                      },
                      _callee10,
                      this
                    );
                  })
                );
                function hasByTag(_x6) {
                  return _ref10.apply(this, arguments);
                }
                return hasByTag;
              })()

              /**
               * Set action events
               *
               * @param  {String} key
               * @param  {Function} cb
               * @return {Void}
               *
               * @api public
               */
            },
            {
              key: 'on',
              value: function on(key, cb) {
                var _event;
                (_event = this.event).on.apply(_event, [key, cb]);
                _helpers.logProxy.call(this, _console.eventCreatedLog, key);
              }
            }
          ]);
          return Channel;
        })();
        exports.default = Channel;
      },
      {
        './console': 14,
        './event': 18,
        './helpers': 19,
        './queue': 21,
        './storage-capsule': 22,
        './utils': 23,
        'babel-runtime/regenerator': 1
      }
    ],
    13: [
      function(require, module, exports) {
        'use strict';
        Object.defineProperty(exports, '__esModule', { value: true });
        var _createClass = (function() {
          function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
              var descriptor = props[i];
              descriptor.enumerable = descriptor.enumerable || false;
              descriptor.configurable = true;
              if ('value' in descriptor) descriptor.writable = true;
              Object.defineProperty(target, descriptor.key, descriptor);
            }
          }
          return function(Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
          };
        })();

        var _config = require('./enum/config.data');
        var _config2 = _interopRequireDefault(_config);
        function _interopRequireDefault(obj) {
          return obj && obj.__esModule ? obj : { default: obj };
        }
        function _classCallCheck(instance, Constructor) {
          if (!(instance instanceof Constructor)) {
            throw new TypeError('Cannot call a class as a function');
          }
        }
        var Config = (function() {
          function Config() {
            var config =
              arguments.length > 0 && arguments[0] !== undefined
                ? arguments[0]
                : {};
            _classCallCheck(this, Config);
            this.config = _config2.default;
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
           */ _createClass(Config, [
            {
              key: 'set',
              value: function set(name, value) {
                this.config[name] = value;
              }

              /**
               * Get a config
               *
               * @param  {String} name
               * @return {any}
               *
               * @api public
               */
            },
            {
              key: 'get',
              value: function get(name) {
                return this.config[name];
              }

              /**
               * Check config property
               *
               * @param  {String} name
               * @return {any}
               *
               * @api public
               */
            },
            {
              key: 'has',
              value: function has(name) {
                return Object.prototype.hasOwnProperty.call(this.config, name);
              }

              /**
               * Merge two config object
               *
               * @param  {String} name
               * @return {void}
               *
               * @api public
               */
            },
            {
              key: 'merge',
              value: function merge(config) {
                this.config = Object.assign({}, this.config, config);
              }

              /**
               * Remove a config
               *
               * @param  {String} name
               * @return {Boolean}
               *
               * @api public
               */
            },
            {
              key: 'remove',
              value: function remove(name) {
                return delete this.config[name];
              }

              /**
               * Get all config
               *
               * @param  {String} name
               * @return {IConfig[]}
               *
               * @api public
               */
            },
            {
              key: 'all',
              value: function all() {
                return this.config;
              }
            }
          ]);
          return Config;
        })();
        exports.default = Config;
      },
      { './enum/config.data': 16 }
    ],
    14: [
      function(require, module, exports) {
        'use strict';
        Object.defineProperty(exports, '__esModule', { value: true });
        var _slicedToArray = (function() {
          function sliceIterator(arr, i) {
            var _arr = [];
            var _n = true;
            var _d = false;
            var _e = undefined;
            try {
              for (
                var _i = arr[Symbol.iterator](), _s;
                !(_n = (_s = _i.next()).done);
                _n = true
              ) {
                _arr.push(_s.value);
                if (i && _arr.length === i) break;
              }
            } catch (err) {
              _d = true;
              _e = err;
            } finally {
              try {
                if (!_n && _i['return']) _i['return']();
              } finally {
                if (_d) throw _e;
              }
            }
            return _arr;
          }
          return function(arr, i) {
            if (Array.isArray(arr)) {
              return arr;
            } else if (Symbol.iterator in Object(arr)) {
              return sliceIterator(arr, i);
            } else {
              throw new TypeError(
                'Invalid attempt to destructure non-iterable instance'
              );
            }
          };
        })();
        exports.log = log;
        exports.taskAddedLog = taskAddedLog;
        exports.queueStartLog = queueStartLog;
        exports.nextTaskLog = nextTaskLog;
        exports.queueStoppingLog = queueStoppingLog;
        exports.queueStoppedLog = queueStoppedLog;
        exports.queueEmptyLog = queueEmptyLog;
        exports.eventCreatedLog = eventCreatedLog;
        exports.eventFiredLog = eventFiredLog;
        exports.notFoundLog = notFoundLog;
        exports.workerRunninLog = workerRunninLog;
        exports.workerDoneLog = workerDoneLog;
        exports.workerFailedLog = workerFailedLog;
        var _objectPath = require('object-path');
        var _objectPath2 = _interopRequireDefault(_objectPath);
        var _log = require('./enum/log.events');
        var _log2 = _interopRequireDefault(_log);
        function _interopRequireDefault(obj) {
          return obj && obj.__esModule ? obj : { default: obj };
        }
        function _toConsumableArray(arr) {
          if (Array.isArray(arr)) {
            for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
              arr2[i] = arr[i];
            }
            return arr2;
          } else {
            return Array.from(arr);
          }
        }
        /* eslint no-console: ["error", { allow: ["log", "groupCollapsed", "groupEnd"] }] */ function log() {
          var _console;
          (_console = console).log.apply(_console, arguments);
        }
        function taskAddedLog(_ref) {
          var _ref2 = _slicedToArray(_ref, 1),
            task = _ref2[0];
          log(
            '%c(' +
              task.handler +
              ') -> ' +
              _objectPath2.default.get(_log2.default, 'queue.created'),
            'color: green;font-weight: bold;'
          );
        }
        function queueStartLog(_ref3) {
          var _ref4 = _slicedToArray(_ref3, 1),
            type = _ref4[0];
          log(
            '%c(' +
              type +
              ') -> ' +
              _objectPath2.default.get(_log2.default, 'queue.starting'),
            'color: #3fa5f3;font-weight: bold;'
          );
        }
        function nextTaskLog(_ref5) {
          var _ref6 = _slicedToArray(_ref5, 1),
            type = _ref6[0];
          log(
            '%c(' +
              type +
              ') -> ' +
              _objectPath2.default.get(_log2.default, 'queue.next'),
            'color: #3fa5f3;font-weight: bold;'
          );
        }
        function queueStoppingLog(_ref7) {
          var _ref8 = _slicedToArray(_ref7, 1),
            type = _ref8[0];
          log(
            '%c(' +
              type +
              ') -> ' +
              _objectPath2.default.get(_log2.default, 'queue.stopping'),
            'color: #ff7f94;font-weight: bold;'
          );
        }
        function queueStoppedLog(_ref9) {
          var _ref10 = _slicedToArray(_ref9, 1),
            type = _ref10[0];
          log(
            '%c(' +
              type +
              ') -> ' +
              _objectPath2.default.get(_log2.default, 'queue.stopped'),
            'color: #ff7f94;font-weight: bold;'
          );
        }
        function queueEmptyLog(_ref11) {
          var _ref12 = _slicedToArray(_ref11, 1),
            type = _ref12[0];
          log(
            '%c' +
              type +
              ' ' +
              _objectPath2.default.get(_log2.default, 'queue.empty'),
            'color: #ff7f94;font-weight: bold;'
          );
        }
        function eventCreatedLog(_ref13) {
          var _ref14 = _slicedToArray(_ref13, 1),
            key = _ref14[0];
          log(
            '%c(' +
              key +
              ') -> ' +
              _objectPath2.default.get(_log2.default, 'event.created'),
            'color: #66cee3;font-weight: bold;'
          );
        }
        function eventFiredLog(_ref15) {
          var _ref16 = _slicedToArray(_ref15, 2),
            key = _ref16[0],
            name = _ref16[1];
          log(
            '%c(' +
              key +
              ') -> ' +
              _objectPath2.default.get(_log2.default, 'event.' + name),
            'color: #a0dc3c;font-weight: bold;'
          );
        }
        function notFoundLog(_ref17) {
          var _ref18 = _slicedToArray(_ref17, 1),
            name = _ref18[0];
          log(
            '%c(' +
              name +
              ') -> ' +
              _objectPath2.default.get(_log2.default, 'queue.not-found'),
            'color: #a0dc3c;font-weight: bold;'
          );
        }
        function workerRunninLog(_ref19) {
          var _ref20 = _slicedToArray(_ref19, 4),
            worker = _ref20[0],
            workerInstance = _ref20[1],
            task = _ref20[2],
            deps = _ref20[3];
          console.groupCollapsed(worker.name + ' - ' + task.label);
          log('%clabel: ' + (task.label || ''), 'color: blue;');
          log('%chandler: ' + task.handler, 'color: blue;');
          log('%cpriority: ' + task.priority, 'color: blue;');
          log('%cunique: ' + (task.unique || 'false'), 'color: blue;');
          log('%cretry: ' + (workerInstance.retry || '1'), 'color: blue;');
          log(
            '%ctried: ' + (task.tried ? task.tried + 1 : '1'),
            'color: blue;'
          );
          log('%ctag: ' + (task.tag || ''), 'color: blue;');
          log('%cargs:', 'color: blue;');
          log(task.args || '');
          console.groupCollapsed('dependencies');
          log.apply(undefined, _toConsumableArray(deps[worker.name] || []));
          console.groupEnd();
        }
        function workerDoneLog(_ref21) {
          var _ref22 = _slicedToArray(_ref21, 3),
            result = _ref22[0],
            task = _ref22[1],
            workerInstance = _ref22[2];
          if (result === true) {
            log('%cTask completed!', 'color: green;');
          } else if (!result && task.tried < workerInstance.retry) {
            log('%cTask will be retried!', 'color: #d8410c;');
          } else {
            log('%cTask failed and freezed!', 'color: #ef6363;');
          }
          console.groupEnd();
        }
        function workerFailedLog() {
          log('%cTask failed!', 'color: red;');
          console.groupEnd();
        }
      },
      { './enum/log.events': 17, 'object-path': 5 }
    ],
    15: [
      function(require, module, exports) {
        'use strict';
        Object.defineProperty(exports, '__esModule', { value: true });
        var _createClass = (function() {
          function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
              var descriptor = props[i];
              descriptor.enumerable = descriptor.enumerable || false;
              descriptor.configurable = true;
              if ('value' in descriptor) descriptor.writable = true;
              Object.defineProperty(target, descriptor.key, descriptor);
            }
          }
          return function(Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
          };
        })();
        function _classCallCheck(instance, Constructor) {
          if (!(instance instanceof Constructor)) {
            throw new TypeError('Cannot call a class as a function');
          }
        }
        var Container = (function() {
          function Container() {
            _classCallCheck(this, Container);
            this.store = {};
          }
          _createClass(Container, [
            {
              key: 'has',

              /**
               * Check item in container
               *
               * @param  {String} id
               * @return {Boolean}
               *
               * @api public
               */ value: function has(id) {
                return Object.prototype.hasOwnProperty.call(this.store, id);
              }

              /**
               * Get item from container
               *
               * @param  {String} id
               * @return {Any}
               *
               * @api public
               */
            },
            {
              key: 'get',
              value: function get(id) {
                return this.store[id];
              }

              /**
               * Get all items from container
               *
               * @return {Object}
               *
               * @api public
               */
            },
            {
              key: 'all',
              value: function all() {
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
               */
            },
            {
              key: 'bind',
              value: function bind(id, value) {
                this.store[id] = value;
              }

              /**
               * Merge continers
               *
               * @param  {Object} data
               * @return {void}
               *
               * @api public
               */
            },
            {
              key: 'merge',
              value: function merge() {
                var data =
                  arguments.length > 0 && arguments[0] !== undefined
                    ? arguments[0]
                    : {};
                this.store = Object.assign({}, this.store, data);
              }

              /**
               * Remove item from container
               *
               * @param  {String} id
               * @return {Boolean}
               *
               * @api public
               */
            },
            {
              key: 'remove',
              value: function remove(id) {
                if (!this.has(id)) return false;
                return delete this.store[id];
              }

              /**
               * Remove all items from container
               *
               * @return {void}
               *
               * @api public
               */
            },
            {
              key: 'removeAll',
              value: function removeAll() {
                this.store = {};
              }
            }
          ]);
          return Container;
        })();
        exports.default = Container;
      },
      {}
    ],
    16: [
      function(require, module, exports) {
        'use strict';
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.default = {
          defaultStorage: 'localstorage',
          prefix: 'sq_jobs',
          timeout: 1000,
          limit: -1,
          principle: 'fifo',
          debug: true
        };
      },
      {}
    ],
    17: [
      function(require, module, exports) {
        'use strict';
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.default = {
          queue: {
            created: 'New task created.',
            next: 'Next task processing.',
            starting: 'Queue listener starting.',
            stopping: 'Queue listener stopping.',
            stopped: 'Queue listener stopped.',
            empty: 'channel is empty...',
            'not-found': 'worker not found',
            offline: 'Disconnected',
            online: 'Connected'
          },

          event: {
            created: 'New event created',
            fired: 'Event fired.',
            'wildcard-fired': 'Wildcard event fired.'
          }
        };
      },
      {}
    ],
    18: [
      function(require, module, exports) {
        'use strict';
        Object.defineProperty(exports, '__esModule', { value: true });
        var _createClass = (function() {
          function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
              var descriptor = props[i];
              descriptor.enumerable = descriptor.enumerable || false;
              descriptor.configurable = true;
              if ('value' in descriptor) descriptor.writable = true;
              Object.defineProperty(target, descriptor.key, descriptor);
            }
          }
          return function(Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
          };
        })();
        function _classCallCheck(instance, Constructor) {
          if (!(instance instanceof Constructor)) {
            throw new TypeError('Cannot call a class as a function');
          }
        } /* eslint class-methods-use-this: ["error", { "exceptMethods": ["getName", "getType"] }] */
        /* eslint-env es6 */ var Event = (function() {
          function Event() {
            _classCallCheck(this, Event);
            this.store = {};
            this.verifierPattern = /^[a-z0-9-_]+:before$|after$|retry$|\*$/;
            this.wildcards = ['*', 'error'];
            this.emptyFunc = function() {};
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
           */ _createClass(Event, [
            {
              key: 'on',
              value: function on(key, cb) {
                if (typeof cb !== 'function')
                  throw new Error('Event should be an function');
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
               */
            },
            {
              key: 'emit',
              value: function emit(key, args) {
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
               */
            },
            {
              key: 'wildcard',
              value: function wildcard(key, actionKey, args) {
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
               */
            },
            {
              key: 'add',
              value: function add(key, cb) {
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
               */
            },
            {
              key: 'has',
              value: function has(key) {
                try {
                  var keys = key.split(':');
                  return keys.length > 1
                    ? !!this.store[keys[1]][keys[0]]
                    : !!this.store.wildcard[keys[0]];
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
               */
            },
            {
              key: 'getName',
              value: function getName(key) {
                return key.match(/(.*):.*/)[1];
              }

              /**
               * Get event type by parse key
               *
               * @param  {String} key
               * @return {String}
               *
               * @api public
               */
            },
            {
              key: 'getType',
              value: function getType(key) {
                return key.match(/^[a-z0-9-_]+:(.*)/)[1];
              }

              /**
               * Checker of event keys
               *
               * @param  {String} key
               * @return {Boolean}
               *
               * @api public
               */
            },
            {
              key: 'isValid',
              value: function isValid(key) {
                return (
                  this.verifierPattern.test(key) ||
                  this.wildcards.indexOf(key) > -1
                );
              }
            }
          ]);
          return Event;
        })();
        exports.default = Event;
      },
      {}
    ],
    19: [
      function(require, module, exports) {
        'use strict';
        var _typeof2 =
          typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol'
            ? function(obj) {
                return typeof obj;
              }
            : function(obj) {
                return obj &&
                  typeof Symbol === 'function' &&
                  obj.constructor === Symbol &&
                  obj !== Symbol.prototype
                  ? 'symbol'
                  : typeof obj;
              };
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.canMultiple = exports.createTimeout = exports.successJobHandler = exports.retryProcess = exports.lockTask = exports.failedJobHandler = exports.removeTask = exports.saveTask = exports.getTasksWithoutFreezed = undefined;
        var _regenerator = require('babel-runtime/regenerator');
        var _regenerator2 = _interopRequireDefault(_regenerator);
        var _typeof =
          typeof Symbol === 'function' && _typeof2(Symbol.iterator) === 'symbol'
            ? function(obj) {
                return typeof obj === 'undefined' ? 'undefined' : _typeof2(obj);
              }
            : function(obj) {
                return obj &&
                  typeof Symbol === 'function' &&
                  obj.constructor === Symbol &&
                  obj !== Symbol.prototype
                  ? 'symbol'
                  : typeof obj === 'undefined'
                    ? 'undefined'
                    : _typeof2(obj);
              };

        /**
         * Get unfreezed tasks by the filter function
         * Context: Channel
         *
         * @return {ITask}
         *
         * @api private
         */ var getTasksWithoutFreezed = (exports.getTasksWithoutFreezed = (function() {
          var _ref = _asyncToGenerator(
            /*#__PURE__*/ _regenerator2.default.mark(function _callee() {
              return _regenerator2.default.wrap(
                function _callee$(_context) {
                  while (1) {
                    switch ((_context.prev = _context.next)) {
                      case 0:
                        _context.next = 2;
                        return db.call(this).all();
                      case 2:
                        _context.t0 = _utils.excludeSpecificTasks.bind([
                          'freezed'
                        ]);
                        return _context.abrupt(
                          'return',
                          _context.sent.filter(_context.t0)
                        );
                      case 4:
                      case 'end':
                        return _context.stop();
                    }
                  }
                },
                _callee,
                this
              );
            })
          );
          return function getTasksWithoutFreezed() {
            return _ref.apply(this, arguments);
          };
        })());

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
         */ var saveTask = (exports.saveTask = (function() {
          var _ref2 = _asyncToGenerator(
            /*#__PURE__*/ _regenerator2.default.mark(function _callee2(task) {
              var result;
              return _regenerator2.default.wrap(
                function _callee2$(_context2) {
                  while (1) {
                    switch ((_context2.prev = _context2.next)) {
                      case 0:
                        _context2.next = 2;
                        return db.call(this).save(checkPriority(task));
                      case 2:
                        result = _context2.sent;
                        return _context2.abrupt('return', result);
                      case 4:
                      case 'end':
                        return _context2.stop();
                    }
                  }
                },
                _callee2,
                this
              );
            })
          );
          return function saveTask(_x) {
            return _ref2.apply(this, arguments);
          };
        })());

        /**
         * Task remove helper
         * Context: Channel
         *
         * @param {string} id
         * @return {boolean}
         *
         * @api private
         */ var removeTask = (exports.removeTask = (function() {
          var _ref3 = _asyncToGenerator(
            /*#__PURE__*/ _regenerator2.default.mark(function _callee3(id) {
              var result;
              return _regenerator2.default.wrap(
                function _callee3$(_context3) {
                  while (1) {
                    switch ((_context3.prev = _context3.next)) {
                      case 0:
                        _context3.next = 2;
                        return db.call(this).delete(id);
                      case 2:
                        result = _context3.sent;
                        return _context3.abrupt('return', result);
                      case 4:
                      case 'end':
                        return _context3.stop();
                    }
                  }
                },
                _callee3,
                this
              );
            })
          );
          return function removeTask(_x2) {
            return _ref3.apply(this, arguments);
          };
        })());

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
         */ var failedJobHandler = (exports.failedJobHandler = (function() {
          var _ref4 = _asyncToGenerator(
            /*#__PURE__*/ _regenerator2.default.mark(function _callee5(task) {
              return _regenerator2.default.wrap(
                function _callee5$(_context5) {
                  while (1) {
                    switch ((_context5.prev = _context5.next)) {
                      case 0:
                        return _context5.abrupt(
                          'return',
                          (function() {
                            var _ref5 = _asyncToGenerator(
                              /*#__PURE__*/ _regenerator2.default.mark(
                                function _callee4() {
                                  return _regenerator2.default.wrap(
                                    function _callee4$(_context4) {
                                      while (1) {
                                        switch (
                                          (_context4.prev = _context4.next)
                                        ) {
                                          case 0:
                                            removeTask.call(this, task._id);

                                            this.event.emit('error', task);

                                            logProxy.call(
                                              this,
                                              _console.workerFailedLog
                                            );

                                            /* istanbul ignore next */ _context4.next = 5;
                                            return this.next();
                                          case 5:
                                          case 'end':
                                            return _context4.stop();
                                        }
                                      }
                                    },
                                    _callee4,
                                    this
                                  );
                                }
                              )
                            );
                            function childFailedHandler() {
                              return _ref5.apply(this, arguments);
                            }
                            return childFailedHandler;
                          })()
                        );
                      case 1:
                      case 'end':
                        return _context5.stop();
                    }
                  }
                },
                _callee5,
                this
              );
            })
          );
          return function failedJobHandler(_x3) {
            return _ref4.apply(this, arguments);
          };
        })());

        /**
         * Helper of the lock task of the current job
         * Context: Channel
         *
         * @param {ITask} task
         * @return {boolean}
         *
         * @api private
         */ var lockTask = (exports.lockTask = (function() {
          var _ref6 = _asyncToGenerator(
            /*#__PURE__*/ _regenerator2.default.mark(function _callee6(task) {
              var result;
              return _regenerator2.default.wrap(
                function _callee6$(_context6) {
                  while (1) {
                    switch ((_context6.prev = _context6.next)) {
                      case 0:
                        _context6.next = 2;
                        return db.call(this).update(task._id, { locked: true });
                      case 2:
                        result = _context6.sent;
                        return _context6.abrupt('return', result);
                      case 4:
                      case 'end':
                        return _context6.stop();
                    }
                  }
                },
                _callee6,
                this
              );
            })
          );
          return function lockTask(_x4) {
            return _ref6.apply(this, arguments);
          };
        })());

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
         */ var retryProcess = (exports.retryProcess = (function() {
          var _ref7 = _asyncToGenerator(
            /*#__PURE__*/ _regenerator2.default.mark(function _callee7(
              task,
              worker
            ) {
              var updateTask, result;
              return _regenerator2.default.wrap(
                function _callee7$(_context7) {
                  while (1) {
                    switch ((_context7.prev = _context7.next)) {
                      case 0:
                        // dispacth custom retry event
                        dispatchEvents.call(this, task, 'retry');

                        // update retry value
                        updateTask = updateRetry.call(this, task, worker);

                        // delete lock property for next process
                        updateTask.locked = false;
                        _context7.next = 5;
                        return db.call(this).update(task._id, updateTask);
                      case 5:
                        result = _context7.sent;
                        return _context7.abrupt(
                          'return',

                          result
                        );
                      case 7:
                      case 'end':
                        return _context7.stop();
                    }
                  }
                },
                _callee7,
                this
              );
            })
          );
          return function retryProcess(_x5, _x6) {
            return _ref7.apply(this, arguments);
          };
        })());

        /**
         * Succeed job handler
         * Context: Channel
         *
         * @param {ITask} task
         * @param {IWorker} worker
         * @return {Function}
         *
         * @api private
         */ var successJobHandler = (exports.successJobHandler = (function() {
          var _ref8 = _asyncToGenerator(
            /*#__PURE__*/ _regenerator2.default.mark(function _callee9(
              task,
              worker
            ) {
              var self;
              return _regenerator2.default.wrap(
                function _callee9$(_context9) {
                  while (1) {
                    switch ((_context9.prev = _context9.next)) {
                      case 0:
                        self = this;
                        return _context9.abrupt(
                          'return',
                          (function() {
                            var _ref9 = _asyncToGenerator(
                              /*#__PURE__*/ _regenerator2.default.mark(
                                function _callee8(result) {
                                  return _regenerator2.default.wrap(
                                    function _callee8$(_context8) {
                                      while (1) {
                                        switch (
                                          (_context8.prev = _context8.next)
                                        ) {
                                          case 0:
                                            if (!result) {
                                              _context8.next = 4;
                                              break;
                                            }
                                            // go ahead to success process
                                            successProcess.call(self, task);
                                            _context8.next = 6;
                                            break;
                                          case 4:
                                            _context8.next = 6;
                                            return retryProcess.call(
                                              self,
                                              task,
                                              worker
                                            );
                                          case 6:
                                            // fire job after event
                                            fireJobInlineEvent.call(
                                              self,
                                              'after',
                                              worker,
                                              task.args
                                            );

                                            // dispacth custom after event
                                            dispatchEvents.call(
                                              self,
                                              task,
                                              'after'
                                            );

                                            // show console
                                            logProxy.call(
                                              self,
                                              _console.workerDoneLog,
                                              result,
                                              task,
                                              worker
                                            );

                                            // try next queue job
                                            _context8.next = 11;
                                            return self.next();
                                          case 11:
                                          case 'end':
                                            return _context8.stop();
                                        }
                                      }
                                    },
                                    _callee8,
                                    this
                                  );
                                }
                              )
                            );
                            function childSuccessJobHandler(_x9) {
                              return _ref9.apply(this, arguments);
                            }
                            return childSuccessJobHandler;
                          })()
                        );
                      case 2:
                      case 'end':
                        return _context9.stop();
                    }
                  }
                },
                _callee9,
                this
              );
            })
          );
          return function successJobHandler(_x7, _x8) {
            return _ref8.apply(this, arguments);
          };
        })());

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
         */ var createTimeout = (exports.createTimeout = (function() {
          var _ref11 = _asyncToGenerator(
            /*#__PURE__*/ _regenerator2.default.mark(function _callee11() {
              var task, JobWorker, workerInstance, timeout, params, handler;
              return _regenerator2.default.wrap(
                function _callee11$(_context11) {
                  while (1) {
                    switch ((_context11.prev = _context11.next)) {
                      case 0:
                        // if running any job, stop it
                        // the purpose here is to prevent cocurrent operation in same channel
                        clearTimeout(this.currentTimeout);

                        // Get next task
                        _context11.next = 3;
                        return db.call(this).fetch();
                      case 3:
                        task = _context11.sent.shift();
                        if (!(task === undefined)) {
                          _context11.next = 8;
                          break;
                        }
                        logProxy.call(
                          this,
                          _console.queueEmptyLog,
                          this.name()
                        );
                        stopQueue.call(this);
                        return _context11.abrupt('return', 1);
                      case 8:
                        if (_queue2.default.queueWorkers[task.handler]) {
                          _context11.next = 16;
                          break;
                        }
                        logProxy.call(this, _console.notFoundLog, task.handler);
                        _context11.next = 12;
                        return failedJobHandler.call(this, task);
                      case 12:
                        _context11.t0 = this;
                        _context11.next = 15;
                        return _context11.sent.call(_context11.t0);
                      case 15:
                        return _context11.abrupt('return', 1);
                      case 16:
                        // Get worker with handler name
                        JobWorker = _queue2.default.queueWorkers[task.handler];

                        // Create a worker instance
                        workerInstance = new JobWorker();

                        // get always last updated config value
                        timeout = this.config.get('timeout');

                        // create a array with handler parameters for shorten line numbers
                        params = [task, JobWorker, workerInstance];

                        // Get handler function for handle on completed event
                        _context11.next = 22;
                        return loopHandler.call.apply(
                          loopHandler,
                          [this].concat(params)
                        );
                      case 22:
                        _context11.t1 = this;
                        handler = _context11.sent.bind(_context11.t1);

                        // create new timeout for process a job in queue
                        // binding loopHandler function to setTimeout
                        // then return the timeout instance
                        this.currentTimeout = setTimeout(handler, timeout);
                        return _context11.abrupt(
                          'return',

                          this.currentTimeout
                        );
                      case 26:
                      case 'end':
                        return _context11.stop();
                    }
                  }
                },
                _callee11,
                this
              );
            })
          );
          return function createTimeout() {
            return _ref11.apply(this, arguments);
          };
        })());

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
         */ var canMultiple = (exports.canMultiple = (function() {
          var _ref12 = _asyncToGenerator(
            /*#__PURE__*/ _regenerator2.default.mark(function _callee12(task) {
              return _regenerator2.default.wrap(
                function _callee12$(_context12) {
                  while (1) {
                    switch ((_context12.prev = _context12.next)) {
                      case 0:
                        if (
                          !(
                            (typeof task === 'undefined'
                              ? 'undefined'
                              : _typeof(task)) !== 'object' ||
                            task.unique !== true
                          )
                        ) {
                          _context12.next = 2;
                          break;
                        }
                        return _context12.abrupt('return', true);
                      case 2:
                        _context12.next = 4;
                        return this.hasByTag(task.tag);
                      case 4:
                        _context12.t0 = _context12.sent;
                        return _context12.abrupt(
                          'return',
                          _context12.t0 === false
                        );
                      case 6:
                      case 'end':
                        return _context12.stop();
                    }
                  }
                },
                _callee12,
                this
              );
            })
          );
          return function canMultiple(_x10) {
            return _ref12.apply(this, arguments);
          };
        })());

        /**
         * Job handler class register
         * Context: Channel
         *
         * @param {ITask} task
         * @param {IWorker} worker
         * @return {void}
         *
         * @api private
         */ exports.checkPriority = checkPriority;
        exports.db = db;
        exports.logProxy = logProxy;
        exports.dispatchEvents = dispatchEvents;
        exports.stopQueue = stopQueue;
        exports.fireJobInlineEvent = fireJobInlineEvent;
        exports.successProcess = successProcess;
        exports.updateRetry = updateRetry;
        exports.loopHandler = loopHandler;
        exports.statusOff = statusOff;
        exports.registerWorkers = registerWorkers;
        var _queue = require('./queue');
        var _queue2 = _interopRequireDefault(_queue);
        var _channel = require('./channel');
        var _channel2 = _interopRequireDefault(_channel);
        var _storageCapsule = require('./storage-capsule');
        var _storageCapsule2 = _interopRequireDefault(_storageCapsule);
        var _utils = require('./utils');
        var _console = require('./console');
        function _interopRequireDefault(obj) {
          return obj && obj.__esModule ? obj : { default: obj };
        }
        function _toConsumableArray(arr) {
          if (Array.isArray(arr)) {
            for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
              arr2[i] = arr[i];
            }
            return arr2;
          } else {
            return Array.from(arr);
          }
        }
        function _asyncToGenerator(fn) {
          return function() {
            var gen = fn.apply(this, arguments);
            return new Promise(function(resolve, reject) {
              function step(key, arg) {
                try {
                  var info = gen[key](arg);
                  var value = info.value;
                } catch (error) {
                  reject(error);
                  return;
                }
                if (info.done) {
                  resolve(value);
                } else {
                  return Promise.resolve(value).then(
                    function(value) {
                      step('next', value);
                    },
                    function(err) {
                      step('throw', err);
                    }
                  );
                }
              }
              return step('next');
            });
          };
        }
        /* eslint no-underscore-dangle: [2, { "allow": ["_id"] }] */ /* eslint no-param-reassign: "error" */ /* eslint use-isnan: "error" */ /**
         * Task priority controller helper
         * Context: Channel
         *
         * @return {ITask}
         * @param {ITask} task
         *
         * @api private
         */ function checkPriority(task) {
          task.priority = task.priority || 0;
          if (typeof task.priority !== 'number') task.priority = 0;
          return task;
        }
        /**
         * Shortens function the db belongsto current channel
         * Context: Channel
         *
         * @return {StorageCapsule}
         *
         * @api private
         */ function db() {
          return this.storage.channel(this.name());
        }
        function logProxy(wrapperFunc) {
          if (this.config.get('debug') && typeof wrapperFunc === 'function') {
            for (
              var _len = arguments.length,
                args = Array(_len > 1 ? _len - 1 : 0),
                _key = 1;
              _key < _len;
              _key++
            ) {
              args[_key - 1] = arguments[_key];
            }
            wrapperFunc(args);
          }
        }
        function dispatchEvents(task, type) {
          var _this = this;
          if (!('tag' in task)) return false;
          var events = [
            [task.tag + ':' + type, 'fired'],
            [task.tag + ':*', 'wildcard-fired']
          ];
          events.forEach(function(e) {
            _this.event.emit(e[0], task);
            logProxy.call.apply(
              logProxy,
              [_this, _console.eventFiredLog].concat(_toConsumableArray(e))
            );
          });
          return true;
        }
        /**
         * Queue stopper helper
         * Context: Channel
         *
         * @return {void}
         *
         * @api private
         */ function stopQueue() {
          this.stop();
          clearTimeout(this.currentTimeout);
          logProxy.call(this, _console.queueStoppedLog, 'stop');
        }
        function fireJobInlineEvent(name, worker, args) {
          if (
            (0, _utils.hasMethod)(worker, name) &&
            (0, _utils.isFunction)(worker[name])
          ) {
            worker[name].call(worker, args);
            return true;
          }
          return false;
        }
        /**
         * Process handler of succeeded job
         * Context: Channel
         *
         * @param {ITask} task
         * @return {void}
         *
         * @api private
         */ function successProcess(task) {
          removeTask.call(this, task._id);
        }
        /**
         * Update task's retry value
         * Context: Channel
         *
         * @param {ITask} task
         * @param {IWorker} worker
         * @return {ITask}
         *
         * @api private
         */ function updateRetry(task, worker) {
          if (!('retry' in worker)) worker.retry = 1;
          if (!('tried' in task)) {
            task.tried = 0;
            task.retry = worker.retry;
          }
          task.tried += 1;
          if (task.tried >= worker.retry) {
            task.freezed = true;
          }
          return task;
        }
        /* istanbul ignore next */ function loopHandler(
          task,
          worker,
          workerInstance
        ) {
          return (function() {
            var _ref10 = _asyncToGenerator(
              /*#__PURE__*/ _regenerator2.default.mark(function _callee10() {
                var _workerInstance$handl;
                var self, deps, dependencies;
                return _regenerator2.default.wrap(
                  function _callee10$(_context10) {
                    while (1) {
                      switch ((_context10.prev = _context10.next)) {
                        case 0:
                          self = this; // lock the current task for prevent race condition
                          _context10.next = 3;
                          return lockTask.call(self, task);
                        case 3: // fire job before event
                          fireJobInlineEvent.call(
                            this,
                            'before',
                            workerInstance,
                            task.args
                          ); // dispacth custom before event
                          dispatchEvents.call(this, task, 'before');
                          deps = _queue2.default.workerDeps[worker.name]; // preparing worker dependencies
                          dependencies = Object.values(deps || {});
                          logProxy.call(
                            this,
                            _console.workerRunninLog,
                            worker,
                            workerInstance,
                            task,
                            _queue2.default.workerDeps
                          ); // Task runner promise
                          _context10.t1 = (_workerInstance$handl =
                            workerInstance.handle).call.apply(
                            _workerInstance$handl,
                            [workerInstance, task.args].concat(
                              _toConsumableArray(dependencies)
                            )
                          );
                          _context10.next = 11;
                          return successJobHandler.call(
                            self,
                            task,
                            workerInstance
                          );
                        case 11:
                          _context10.t2 = self;
                          _context10.t3 = _context10.sent.bind(_context10.t2);
                          _context10.t0 = _context10.t1.then.call(
                            _context10.t1,
                            _context10.t3
                          );
                          _context10.next = 16;
                          return failedJobHandler.call(self, task);
                        case 16:
                          _context10.t4 = self;
                          _context10.t5 = _context10.sent.bind(_context10.t4);
                          _context10.t0.catch.call(
                            _context10.t0,
                            _context10.t5
                          );
                        case 19:
                        case 'end':
                          return _context10.stop();
                      }
                    }
                  },
                  _callee10,
                  this
                );
              })
            );
            function childLoopHandler() {
              return _ref10.apply(this, arguments);
            }
            return childLoopHandler;
          })();
        }
        function statusOff() {
          this.running = false;
        }
        function registerWorkers() {
          if (_queue2.default.isRegistered) return false;
          var workers = _queue2.default.queueWorkers || {};
          this.container.merge(workers);
          _queue2.default.isRegistered = true;
          return true;
        }
      },
      {
        './channel': 12,
        './console': 14,
        './queue': 21,
        './storage-capsule': 22,
        './utils': 23,
        'babel-runtime/regenerator': 1
      }
    ],
    20: [
      function(require, module, exports) {
        'use strict';
        Object.defineProperty(exports, '__esModule', { value: true });
        var _queue = require('./queue');
        var _queue2 = _interopRequireDefault(_queue);
        function _interopRequireDefault(obj) {
          return obj && obj.__esModule ? obj : { default: obj };
        }

        /* global window:true */

        window.Queue = _queue2.default;
        exports.default = _queue2.default;
      },
      { './queue': 21 }
    ],
    21: [
      function(require, module, exports) {
        'use strict';
        Object.defineProperty(exports, '__esModule', { value: true });
        var _extends =
          Object.assign ||
          function(target) {
            for (var i = 1; i < arguments.length; i++) {
              var source = arguments[i];
              for (var key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                  target[key] = source[key];
                }
              }
            }
            return target;
          };
        exports.default = Queue;
        var _channel = require('./channel');
        var _channel2 = _interopRequireDefault(_channel);
        var _container = require('./container');
        var _container2 = _interopRequireDefault(_container);
        var _config = require('./config');
        var _config2 = _interopRequireDefault(_config);
        function _interopRequireDefault(obj) {
          return obj && obj.__esModule ? obj : { default: obj };
        }
        function Queue(config) {
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
            this.container.bind(
              channel,
              new _channel2.default(channel, this.config)
            );
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
        Queue.workers = function workers() {
          var workersObj =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : {};
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
        Queue.deps = function deps() {
          var dependencies =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : {};
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
        Queue.use = function use() {
          var driver =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : {};
          Queue.drivers = _extends({}, Queue.drivers, driver);
        };
      },
      { './channel': 12, './config': 13, './container': 15 }
    ],
    22: [
      function(require, module, exports) {
        'use strict';
        var _typeof2 =
          typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol'
            ? function(obj) {
                return typeof obj;
              }
            : function(obj) {
                return obj &&
                  typeof Symbol === 'function' &&
                  obj.constructor === Symbol &&
                  obj !== Symbol.prototype
                  ? 'symbol'
                  : typeof obj;
              };
        Object.defineProperty(exports, '__esModule', { value: true });
        var _regenerator = require('babel-runtime/regenerator');
        var _regenerator2 = _interopRequireDefault(_regenerator);
        var _extends =
          Object.assign ||
          function(target) {
            for (var i = 1; i < arguments.length; i++) {
              var source = arguments[i];
              for (var key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                  target[key] = source[key];
                }
              }
            }
            return target;
          };
        var _typeof =
          typeof Symbol === 'function' && _typeof2(Symbol.iterator) === 'symbol'
            ? function(obj) {
                return typeof obj === 'undefined' ? 'undefined' : _typeof2(obj);
              }
            : function(obj) {
                return obj &&
                  typeof Symbol === 'function' &&
                  obj.constructor === Symbol &&
                  obj !== Symbol.prototype
                  ? 'symbol'
                  : typeof obj === 'undefined'
                    ? 'undefined'
                    : _typeof2(obj);
              };
        var _createClass = (function() {
          function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
              var descriptor = props[i];
              descriptor.enumerable = descriptor.enumerable || false;
              descriptor.configurable = true;
              if ('value' in descriptor) descriptor.writable = true;
              Object.defineProperty(target, descriptor.key, descriptor);
            }
          }
          return function(Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
          };
        })();
        var _groupBy = require('group-by');
        var _groupBy2 = _interopRequireDefault(_groupBy);

        var _adapters = require('./adapters');
        var _utils = require('./utils');
        function _interopRequireDefault(obj) {
          return obj && obj.__esModule ? obj : { default: obj };
        }
        function _asyncToGenerator(fn) {
          return function() {
            var gen = fn.apply(this, arguments);
            return new Promise(function(resolve, reject) {
              function step(key, arg) {
                try {
                  var info = gen[key](arg);
                  var value = info.value;
                } catch (error) {
                  reject(error);
                  return;
                }
                if (info.done) {
                  resolve(value);
                } else {
                  return Promise.resolve(value).then(
                    function(value) {
                      step('next', value);
                    },
                    function(err) {
                      step('throw', err);
                    }
                  );
                }
              }
              return step('next');
            });
          };
        }
        function _classCallCheck(instance, Constructor) {
          if (!(instance instanceof Constructor)) {
            throw new TypeError('Cannot call a class as a function');
          }
        }

        /* eslint no-console: ["error", { allow: ["warn", "error"] }] */
        /* eslint no-underscore-dangle: [2, { "allow": ["_id"] }] */
        /* eslint class-methods-use-this: ["error", { "exceptMethods": ["generateId"] }] */ var StorageCapsule = (function() {
          function StorageCapsule(config, storage) {
            _classCallCheck(this, StorageCapsule);
            this.config = config;
            this.storage = this.initialize(storage);
          }
          _createClass(StorageCapsule, [
            {
              key: 'initialize',
              value: function initialize(Storage) {
                if (
                  (typeof Storage === 'undefined'
                    ? 'undefined'
                    : _typeof(Storage)) === 'object'
                ) {
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
               */
            },
            {
              key: 'channel',
              value: function channel(name) {
                this.storageChannel = name;
                return this;
              }

              /**
               * Fetch tasks from storage with ordered
               *
               * @return {any[]}
               *
               * @api public
               */
            },
            {
              key: 'fetch',
              value: (function() {
                var _ref = _asyncToGenerator(
                  /*#__PURE__*/ _regenerator2.default.mark(function _callee() {
                    var all, tasks;
                    return _regenerator2.default.wrap(
                      function _callee$(_context) {
                        while (1) {
                          switch ((_context.prev = _context.next)) {
                            case 0:
                              _context.next = 2;
                              return this.all();
                            case 2:
                              _context.t0 = _utils.excludeSpecificTasks;
                              all = _context.sent.filter(_context.t0);
                              tasks = (0, _groupBy2.default)(all, 'priority');
                              return _context.abrupt(
                                'return',
                                Object.keys(tasks)
                                  .map(function(key) {
                                    return parseInt(key, 10);
                                  })
                                  .sort(function(a, b) {
                                    return b - a;
                                  })
                                  .reduce(this.reduceTasks(tasks), [])
                              );
                            case 6:
                            case 'end':
                              return _context.stop();
                          }
                        }
                      },
                      _callee,
                      this
                    );
                  })
                );
                function fetch() {
                  return _ref.apply(this, arguments);
                }
                return fetch;
              })()

              /**
               * Save task to storage
               *
               * @param  {ITask} task
               * @return {String|Boolean}
               *
               * @api public
               */
            },
            {
              key: 'save',
              value: (function() {
                var _ref2 = _asyncToGenerator(
                  /*#__PURE__*/ _regenerator2.default.mark(function _callee2(
                    task
                  ) {
                    var tasks, newTask;
                    return _regenerator2.default.wrap(
                      function _callee2$(_context2) {
                        while (1) {
                          switch ((_context2.prev = _context2.next)) {
                            case 0:
                              if (
                                !(
                                  (typeof task === 'undefined'
                                    ? 'undefined'
                                    : _typeof(task)) !== 'object'
                                )
                              ) {
                                _context2.next = 2;
                                break;
                              }
                              return _context2.abrupt('return', false);
                            case 2:
                              _context2.next = 4;
                              return this.storage.get(this.storageChannel);
                            case 4:
                              tasks = _context2.sent;
                              _context2.next = 7;
                              return this.isExceeded();
                            case 7:
                              if (!_context2.sent) {
                                _context2.next = 10;
                                break;
                              }
                              console.warn(
                                "Task limit exceeded: The '" +
                                  this.storageChannel +
                                  "' channel limit is " +
                                  this.config.get('limit')
                              );
                              return _context2.abrupt('return', false);
                            case 10:
                              // prepare all properties before save
                              // example: createdAt etc.
                              newTask = this.prepareTask(task);

                              // add task to storage
                              tasks.push(newTask);

                              // save tasks
                              _context2.next = 14;
                              return this.storage.set(
                                this.storageChannel,
                                tasks
                              );
                            case 14:
                              return _context2.abrupt(
                                'return',

                                newTask._id
                              );
                            case 15:
                            case 'end':
                              return _context2.stop();
                          }
                        }
                      },
                      _callee2,
                      this
                    );
                  })
                );
                function save(_x) {
                  return _ref2.apply(this, arguments);
                }
                return save;
              })()

              /**
               * Update channel store.
               *
               * @return {string}
               *   The value. This annotation can be used for type hinting purposes.
               */
            },
            {
              key: 'update',
              value: (function() {
                var _ref3 = _asyncToGenerator(
                  /*#__PURE__*/ _regenerator2.default.mark(function _callee3(
                    id,
                    _update
                  ) {
                    var data, index;
                    return _regenerator2.default.wrap(
                      function _callee3$(_context3) {
                        while (1) {
                          switch ((_context3.prev = _context3.next)) {
                            case 0:
                              _context3.next = 2;
                              return this.all();
                            case 2:
                              data = _context3.sent;
                              index = data.findIndex(function(t) {
                                return t._id === id;
                              });

                              // if index not found, return false
                              if (!(index < 0)) {
                                _context3.next = 6;
                                break;
                              }
                              return _context3.abrupt('return', false);
                            case 6:
                              // merge existing object with given update object
                              data[index] = Object.assign(
                                {},
                                data[index],
                                _update
                              );

                              // save to the storage as string
                              _context3.next = 9;
                              return this.storage.set(
                                this.storageChannel,
                                data
                              );
                            case 9:
                              return _context3.abrupt(
                                'return',

                                true
                              );
                            case 10:
                            case 'end':
                              return _context3.stop();
                          }
                        }
                      },
                      _callee3,
                      this
                    );
                  })
                );
                function update(_x2, _x3) {
                  return _ref3.apply(this, arguments);
                }
                return update;
              })()

              /**
               * Remove task from storage
               *
               * @param  {String} id
               * @return {Boolean}
               *
               * @api public
               */
            },
            {
              key: 'delete',
              value: (function() {
                var _ref4 = _asyncToGenerator(
                  /*#__PURE__*/ _regenerator2.default.mark(function _callee4(
                    id
                  ) {
                    var data, index;
                    return _regenerator2.default.wrap(
                      function _callee4$(_context4) {
                        while (1) {
                          switch ((_context4.prev = _context4.next)) {
                            case 0:
                              _context4.next = 2;
                              return this.all();
                            case 2:
                              data = _context4.sent;
                              index = data.findIndex(function(d) {
                                return d._id === id;
                              });
                              if (!(index < 0)) {
                                _context4.next = 6;
                                break;
                              }
                              return _context4.abrupt('return', false);
                            case 6:
                              delete data[index];
                              _context4.next = 9;
                              return this.storage.set(
                                this.storageChannel,
                                data.filter(function(d) {
                                  return d;
                                })
                              );
                            case 9:
                              return _context4.abrupt(
                                'return',

                                true
                              );
                            case 10:
                            case 'end':
                              return _context4.stop();
                          }
                        }
                      },
                      _callee4,
                      this
                    );
                  })
                );
                function _delete(_x4) {
                  return _ref4.apply(this, arguments);
                }
                return _delete;
              })()

              /**
               * Get all tasks
               *
               * @return {Any[]}
               *
               * @api public
               */
            },
            {
              key: 'all',
              value: (function() {
                var _ref5 = _asyncToGenerator(
                  /*#__PURE__*/ _regenerator2.default.mark(function _callee5() {
                    var items;
                    return _regenerator2.default.wrap(
                      function _callee5$(_context5) {
                        while (1) {
                          switch ((_context5.prev = _context5.next)) {
                            case 0:
                              _context5.next = 2;
                              return this.storage.get(this.storageChannel);
                            case 2:
                              items = _context5.sent;
                              return _context5.abrupt('return', items);
                            case 4:
                            case 'end':
                              return _context5.stop();
                          }
                        }
                      },
                      _callee5,
                      this
                    );
                  })
                );
                function all() {
                  return _ref5.apply(this, arguments);
                }
                return all;
              })()

              /**
               * Generate unique id
               *
               * @return {String}
               *
               * @api public
               */
            },
            {
              key: 'generateId',
              value: function generateId() {
                return ((1 + Math.random()) * 0x10000).toString(16);
              }

              /**
               * Add some necessary properties
               *
               * @param  {String} id
               * @return {ITask}
               *
               * @api public
               */
            },
            {
              key: 'prepareTask',
              value: function prepareTask(task) {
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
               */
            },
            {
              key: 'reduceTasks',
              value: function reduceTasks(tasks) {
                var _this = this;
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
               */
            },
            {
              key: 'isExceeded',
              value: (function() {
                var _ref6 = _asyncToGenerator(
                  /*#__PURE__*/ _regenerator2.default.mark(function _callee6() {
                    var limit, tasks;
                    return _regenerator2.default.wrap(
                      function _callee6$(_context6) {
                        while (1) {
                          switch ((_context6.prev = _context6.next)) {
                            case 0:
                              limit = this.config.get('limit');
                              _context6.next = 3;
                              return this.all();
                            case 3:
                              _context6.t0 = _utils.excludeSpecificTasks;
                              tasks = _context6.sent.filter(_context6.t0);
                              return _context6.abrupt(
                                'return',
                                !(limit === -1 || limit > tasks.length)
                              );
                            case 6:
                            case 'end':
                              return _context6.stop();
                          }
                        }
                      },
                      _callee6,
                      this
                    );
                  })
                );
                function isExceeded() {
                  return _ref6.apply(this, arguments);
                }
                return isExceeded;
              })()

              /**
               * Clear tasks with given channel name
               *
               * @param  {String} channel
               * @return {void}
               *
               * @api public
               */
            },
            {
              key: 'clear',
              value: (function() {
                var _ref7 = _asyncToGenerator(
                  /*#__PURE__*/ _regenerator2.default.mark(function _callee7(
                    channel
                  ) {
                    return _regenerator2.default.wrap(
                      function _callee7$(_context7) {
                        while (1) {
                          switch ((_context7.prev = _context7.next)) {
                            case 0:
                              _context7.next = 2;
                              return this.storage.clear(channel);
                            case 2:
                            case 'end':
                              return _context7.stop();
                          }
                        }
                      },
                      _callee7,
                      this
                    );
                  })
                );
                function clear(_x5) {
                  return _ref7.apply(this, arguments);
                }
                return clear;
              })()
            }
          ]);
          return StorageCapsule;
        })();
        exports.default = StorageCapsule;
      },
      {
        './adapters': 9,
        './utils': 23,
        'babel-runtime/regenerator': 1,
        'group-by': 3
      }
    ],
    23: [
      function(require, module, exports) {
        'use strict';
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.hasProperty = hasProperty;
        exports.hasMethod = hasMethod;
        exports.isFunction = isFunction;
        exports.excludeSpecificTasks = excludeSpecificTasks;
        exports.utilClearByTag = utilClearByTag;
        exports.fifo = fifo;
        exports.lifo = lifo;
        /* eslint comma-dangle: ["error", "never"] */ /**
         * Check property in object
         *
         * @param  {Object} obj
         * @return {Boolean}
         *
         * @api public
         */ function hasProperty(func, name) {
          return Object.prototype.hasOwnProperty.call(func, name);
        }
        /**
         * Check method in initiated class
         *
         * @param  {Class} instance
         * @param  {String} method
         * @return {Boolean}
         *
         * @api public
         */ function hasMethod(instance, method) {
          return instance instanceof Object && method in instance;
        }
        /**
         * Check function type
         *
         * @param  {Function} func
         * @return {Boolean}
         *
         * @api public
         */ function isFunction(func) {
          return func instanceof Function;
        }
        /**
         * Remove some tasks by some conditions
         *
         * @param  {Function} func
         * @return {Boolean}
         *
         * @api public
         */ function excludeSpecificTasks(task) {
          var conditions = Array.isArray(this) ? this : ['freezed', 'locked'];
          var results = [];
          conditions.forEach(function(c) {
            results.push(hasProperty(task, c) === false || task[c] === false);
          });
          return !(results.indexOf(false) > -1);
        }
        /**
         * Clear tasks by it's tags
         *
         * @param  {ITask} task
         * @return {Boolean}
         *
         * @api public
         */ function utilClearByTag(task) {
          if (!excludeSpecificTasks.call(['locked'], task)) {
            return false;
          }
          return task.tag === this;
        }
        /**
         * Sort by fifo
         *
         * @param  {ITask} a
         * @param  {ITask} b
         * @return {Any}
         *
         * @api public
         */ function fifo(a, b) {
          return a.createdAt - b.createdAt;
        }
        /**
         * Sort by lifo
         *
         * @param  {ITask} a
         * @param  {ITask} b
         * @return {Any}
         *
         * @api public
         */ function lifo(a, b) {
          return b.createdAt - a.createdAt;
        }
      },
      {}
    ]
  },
  {},
  [20]
);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9yZWdlbmVyYXRvci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb21wb25lbnQtcHJvcHMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZ3JvdXAtYnkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9jYWxmb3JhZ2UvZGlzdC9sb2NhbGZvcmFnZS5qcyIsIm5vZGVfbW9kdWxlcy9vYmplY3QtcGF0aC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWdlbmVyYXRvci1ydW50aW1lL3J1bnRpbWUtbW9kdWxlLmpzIiwibm9kZV9tb2R1bGVzL3JlZ2VuZXJhdG9yLXJ1bnRpbWUvcnVudGltZS5qcyIsIm5vZGVfbW9kdWxlcy90by1mdW5jdGlvbi9pbmRleC5qcyIsInNyYy9hZGFwdGVycy9pbmRleC5qcyIsInNyYy9hZGFwdGVycy9pbm1lbW9yeS5qcyIsInNyYy9hZGFwdGVycy9sb2NhbGZvcmFnZS5qcyIsInNyYy9jaGFubmVsLmpzIiwic3JjL2NvbmZpZy5qcyIsInNyYy9jb25zb2xlLmpzIiwic3JjL2NvbnRhaW5lci5qcyIsInNyYy9lbnVtL2NvbmZpZy5kYXRhLmpzIiwic3JjL2VudW0vbG9nLmV2ZW50cy5qcyIsInNyYy9ldmVudC5qcyIsInNyYy9oZWxwZXJzLmpzIiwic3JjL2luZGV4LmpzIiwic3JjL3F1ZXVlLmpzIiwic3JjL3N0b3JhZ2UtY2Fwc3VsZS5qcyIsInNyYy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM3dUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2dEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7K2EsQUN4Sk87QSxBQUNBOzs7Ozs7OztBLEFDSWMsOEJBS25COzs7OzsyQkFBQSxBQUFZLFFBQWlCLDZDQUY3QixBQUU2QixRQUZJLEFBRUosQUFDM0I7U0FBQSxBQUFLLFNBQUwsQUFBYyxBQUNkO1NBQUEsQUFBSyxTQUFTLEtBQUEsQUFBSyxPQUFMLEFBQVksSUFBMUIsQUFBYyxBQUFnQixBQUMvQjtBQUVEOzs7Ozs7Ozs7eUpBUVU7QSxpSkFDRjtBLDJCQUFXLEtBQUEsQUFBSyxZLEFBQUwsQUFBaUI7cUJBQ3ZCLEFBQUssYyxBQUFMLEFBQW1CLFNBQW5CLHNJQUdiOzs7Ozs7Ozs7OztpZUFTVTtBLFcsQUFBYSxtSUFDckI7cUJBQUEsQUFBSyxNQUFNLEtBQUEsQUFBSyxZQUFoQixBQUFXLEFBQWlCLHFDQUE1QixBQUF3QyxnQ0FDakM7QSxzQiw0SUFHVDs7Ozs7Ozs7OztpY0FRVTtBLGlLQUNEO3VCQUFBLEFBQU8sVUFBUCxBQUFpQixlQUFqQixBQUFnQyxLQUFLLEtBQXJDLEFBQTBDLE9BQU8sS0FBQSxBQUFLLFksQUFBdEQsQUFBaUQsQUFBaUIsNklBRzNFOzs7Ozs7Ozs7OzZqQkFRWTtBO3VCQUNZLEFBQUssSSxBQUFMLEFBQVMsSUFBVCx3RUFBaUIsT0FBTyxLQUFBLEFBQUssTUFBTSxLQUFBLEFBQUssWSxBQUFoQixBQUFXLEFBQWlCLHFELEFBQVEsYSxBQUE1RSxtQkFDTjtxQkFBQSxBQUFLLHFCQUFhLEtBQWxCLEFBQXVCLCtCQUNoQjtBLHVCLDRJQUdUOzs7Ozs7Ozs7O3VYQVFZO0EsWUFBZ0IsQUFDMUI7YUFBTyxPQUFBLEFBQU8sV0FBVyxLQUFsQixBQUFrQixBQUFLLGVBQXZCLEFBQXNDLFNBQVksS0FBbEQsQUFBa0QsQUFBSyxvQkFBOUQsQUFBNkUsQUFDOUU7QUFFRDs7Ozs7Ozs7bURBT1k7QUFDVjthQUFPLEtBQUEsQUFBSyxPQUFMLEFBQVksSUFBbkIsQUFBTyxBQUFnQixBQUN4QjtBQUVEOzs7Ozs7Ozs7dURBUWM7QSxVQUFjLEFBQzFCO1VBQU0sTUFBTSxPQUFBLEFBQU8sVUFBUCxBQUFpQixlQUFqQixBQUFnQyxLQUFLLEtBQXJDLEFBQTBDLE9BQXRELEFBQVksQUFBaUQsQUFDN0Q7VUFBSSxDQUFKLEFBQUssS0FBSyxLQUFBLEFBQUssTUFBTCxBQUFXLFFBQVgsQUFBbUIsQUFDN0I7YUFBTyxLQUFBLEFBQUssTUFBWixBQUFPLEFBQVcsQUFDbkI7QSx1RCxBQWxHa0I7Ozs7QUNKckIsMEM7Ozs7O0EsQUFLcUIsaUNBS25COzs7Ozs4QkFBQSxBQUFZLFFBQWlCLGdEQUg3QixBQUc2QixVQUhULENBQUEsQUFBQyxnQkFBRCxBQUFpQixhQUFqQixBQUE4QixBQUdyQixBQUMzQjtTQUFBLEFBQUssU0FBTCxBQUFjLEFBQ2Q7U0FBQSxBQUFLLFNBQVMsS0FBQSxBQUFLLE9BQUwsQUFBWSxJQUExQixBQUFjLEFBQWdCLEFBQzlCOzBCQUFBLEFBQVksT0FBTyxFQUFFLFFBQVEsS0FBVixBQUFVLEFBQUssYUFBYSxNQUFNLEtBQXJELEFBQW1CLEFBQXVDLEFBQzNEO0FBRUQ7Ozs7Ozs7Ozs0SkFRVTtBO3dDQUNZLEFBQVksUUFBUSxLQUFBLEFBQUssWSxBQUF6QixBQUFvQixBQUFpQixLQUFyQyxTLEFBQWQsNkNBQ0M7aUJBQUMsT0FBQSxBQUFPLFVBQVAsQUFBaUIsV0FBVyxLQUFBLEFBQUssTUFBakMsQUFBNEIsQUFBVyxTQUF4QyxBQUFpRCxVLEFBQVUsc0lBR3BFOzs7Ozs7Ozs7OzsraEJBU1U7QSxXLEFBQWE7d0NBQ0EsQUFBWSxRQUFRLEtBQUEsQUFBSyxZQUF6QixBQUFvQixBQUFpQixNLEFBQXJDLEFBQTJDLE1BQTNDLFMsQUFBZixnREFDQztBLG1LQUdUOzs7Ozs7Ozs7O21jQVFVO0E7d0MsQUFDcUIsQUFBWSxNQUFaLFMsQUFBdkIsOENBQ0M7cUJBQUEsQUFBSyxRQUFRLEtBQUEsQUFBSyxZQUFsQixBQUFhLEFBQWlCLFFBQVEsQyxBQUFDLHlJQUdoRDs7Ozs7Ozs7OzsrZkFRWTtBO3dDQUNXLEFBQVksV0FBVyxLQUFBLEFBQUssWSxBQUE1QixBQUF1QixBQUFpQixLQUF4QyxTLEFBQWYsZ0RBQ0M7QSxrS0FHVDs7Ozs7Ozs7Ozs7d0MsQUFRK0IsQUFBWSxNQUFaLFMsQUFBdkIseUNBQ2U7MEJBQUEsQUFBUSxJQUFJLEtBQUEsQUFBSyx3RkFBSSxrQkFBQSxBQUFPO3NDQUN6QixBQUFLLE1BRGEsQUFDbEIsQUFBVyxJQUFYLFNBRGtCLEFBQ2xDLGlEQUNDO0FBRmlDLHVHQUFULGlFLEFBQVosYyxBQUFmLGdEQUlDOztBLHFLQUdUOzs7Ozs7Ozs7OzJYQVFZO0EsWUFBZ0IsQUFDMUI7YUFBTyxPQUFBLEFBQU8sV0FBVyxLQUFsQixBQUFrQixBQUFLLGVBQXZCLEFBQXNDLFNBQVksS0FBbEQsQUFBa0QsQUFBSyxvQkFBOUQsQUFBNkUsQUFDOUU7QUFFRDs7Ozs7Ozs7bURBT1k7QUFDVjthQUFPLEtBQUEsQUFBSyxPQUFMLEFBQVksSUFBbkIsQUFBTyxBQUFnQixBQUN4QjtBLDZDQUVXOztBQUNWO1VBQU0sZ0JBQXdCLEtBQUEsQUFBSyxPQUFMLEFBQVksSUFBMUMsQUFBOEIsQUFBZ0IsQUFDOUM7VUFBTSxTQUFpQixDQUFDLEtBQUEsQUFBSyxPQUFMLEFBQVksSUFBWixBQUFnQixjQUFqQixBQUErQixlQUF0RCxBQUF1QixBQUE4QyxBQUNyRTthQUFPLEtBQUEsQUFBSyxRQUFMLEFBQWEsUUFBYixBQUFxQixVQUFVLENBQS9CLEFBQWdDLEFBQ25DOzRCQUFZLE9BRFQsQUFDSCxBQUFZLEFBQU8sQUFDbkI7NEJBQVksY0FGaEIsQUFFSSxBQUFZLEFBQWMsQUFDL0I7QSwwRCxBQTdHa0I7Ozs7OztBQ0hyQixpQztBQUNBLG1EO0FBQ0EsZ0M7QUFDQTtBQUNBOzs7Ozs7Ozs7OztBQVdBLG9DOzs7Ozs7OztBQVFBOztBQUVBLElBQU0sY0FBYyxPQUFwQixBQUFvQixBQUFPOztBLEFBRU4sc0JBUW5COzs7Ozs7OzttQkFBQSxBQUFZLE1BQVosQUFBMEIsUUFBaUIscUNBUDNDLEFBTzJDLFVBUHhCLEFBT3dCLFVBTjNDLEFBTTJDLFVBTnhCLEFBTXdCLFdBRjNDLEFBRTJDLFFBRm5DLFlBRW1DLEFBQ3pDO1NBQUEsQUFBSyxTQUFMLEFBQWMsQUFFZDs7QUFDQztBQUFELFNBQUEsQUFBZSxlQUFmLEFBQThCLEFBRTlCOztBQU55QztRQUFBLEFBT2pDLDBCQVBpQyxBQU9qQyxBQUNSO1FBQU0sVUFBVSw2QkFBQSxBQUFtQixRQUFRLFFBQTNDLEFBQWdCLEFBQW1DLEFBQ25EO1NBQUEsQUFBSyxVQUFVLFFBQUEsQUFBUSxRQUF2QixBQUFlLEFBQWdCLEFBQ2hDO0FBRUQ7Ozs7Ozs7OytEQU9lO0FBQ2I7YUFBTyxBQUFDLEtBQVIsQUFBTyxBQUFlLEFBQ3ZCO0FBRUQ7Ozs7Ozs7OztnSUFRVTtBO3VDQUNJLEFBQVksS0FBWixBQUFpQixNLEFBQWpCLEFBQXVCLEtBQXZCLHVGLEFBQXNDOztvQ0FFakMsQUFBUyxLQUFULEFBQWMsTSxBQUFkLEFBQW9CLEtBQXBCLFMsQUFBWDs7c0JBRUksS0FBTixBQUFXLFdBQVcsS0FBQSxBQUFLLFksQUFBWSxJQUF2Qzt1QixBQUNJLEFBQUssT0FBTCxPQUdSOzs7QUFDQTtrQ0FBQSxBQUFTLEtBQVQsQUFBYyw2QkFBZCxBQUFrQyw2QkFFM0I7O0EsbUIsb0lBR1Q7Ozs7Ozs7Ozt5akJBUU07O3FCLEFBQUssbUNBQ1A7bUNBQUEsQUFBVSxLQUFWLEFBQWUsTSx3QkFDUjttQ0FBQSxBQUFVLEssQUFBVixBQUFlLFlBR3hCOzs7QUFDQTtrQ0FBQSxBQUFTLEtBQVQsQUFBYyw0QkFBZCxBQUFpQyxBQUVqQzs7OzBDQUNNLEssQUFBQSxBQUFLLHVDQUVKOztBLDJKQUdUOzs7Ozs7Ozs7NGpCQVFFOztBQUNBO3FCQUFBLEFBQUssVUFBTCxBQUFlLEFBRWY7O0FBQ0E7eUNBQUEsQUFBZ0IsS0FBaEIsQUFBcUIsQUFFckI7O2tDQUFBLEFBQVMsS0FBVCxBQUFjLDhCQUFkLEFBQW1DLEFBRW5DOzs7MENBQ3NCLHVCQUFBLEFBQWMsSyxBQUFkLEFBQW1CLDJDQUF6QyxLLEFBQUsseUIsQUFBNkMsMEJBRTNDOztxQixBQUFLLGdKQUdkOzs7Ozs7Ozs7b1hBT2E7QUFDWDt3QkFBQSxBQUFTLEtBQVQsQUFBYyxpQ0FBZCxBQUFzQyxBQUN0QztXQUFBLEFBQUssVUFBTCxBQUFlLEFBQ2hCO0FBRUQ7Ozs7Ozs7O21EQU9rQjtBQUNoQjtBQUNBO3lCQUFBLEFBQVUsS0FBVixBQUFlLEFBQ2hCO0FBRUQ7Ozs7Ozs7Ozs7dUIsQUFRZ0IsQUFBSyxPQUFMLHdGLEFBQWdCLDhJQUdoQzs7Ozs7Ozs7Ozs7a0RBUWdCLEFBQXVCLEssQUFBdkIsQUFBNEIsS0FBNUIsMEQsQUFBbUMsK0lBR25EOzs7Ozs7Ozs7OzhvQkFRaUI7QTtrREFDRCxBQUF1QixLLEFBQXZCLEFBQTRCLEtBQTVCLHdCQUEwQyxxQkFBSyxFQUFBLEFBQUUsUUFBUCxBQUFlLEksbUQsQUFBdEIscUIsQUFBMkIsNEpBRzlFOzs7Ozs7Ozs7aXVCQU9pQjtBQUNmO1VBQUksQ0FBQyxLQUFMLEFBQUssQUFBSyxRQUFRLE9BQUEsQUFBTyxBQUN6QjtXQUFBLEFBQUssUUFBTCxBQUFhLE1BQU0sS0FBbkIsQUFBbUIsQUFBSyxBQUN4QjthQUFBLEFBQU8sQUFDUjtBQUVEOzs7Ozs7Ozs7d0lBUWlCO0EsZ0xBQ1Q7QSx1QixBQUFPOzhCQUNNLEFBQUcsS0FBSCxBQUFRLE0sQUFBUixBQUFjLEtBQWQsUyxBQUFiLGlCQUNBO0EsMEJBQVUsS0FBQSxBQUFLLE9BQU8sc0JBQUEsQUFBZSxLQUEzQixBQUFZLEFBQW9CLE1BQWhDLEFBQXNDLHdGQUFJLGtCQUFBLEFBQU87MENBQzFDLEFBQUcsS0FBSCxBQUFRLE1BQVIsQUFBYyxPQUFPLEVBRGMsQUFDbkMsQUFBdUIsSUFBdkIsU0FEbUMsQUFDbEQsZ0RBQ0M7QUFGaUQsb0dBQTFDLGlFOzswQkFJVixBQUFRLEksQUFBUixBQUFZLFFBQVosc0pBR1I7Ozs7Ozs7Ozs7cWZBUVU7QTtrREFDTSxBQUF1QixLLEFBQXZCLEFBQTRCLEtBQTVCLHdCQUE2QyxxQkFBSyxFQUFBLEFBQUUsUUFBUCxBQUFlLEcsZ0MsQUFBekIsdUNBQStCLEMsQUFBQyx1TUFHbkY7Ozs7Ozs7Ozs7NjRCQVFlO0E7a0RBQ0MsQUFBdUIsSyxBQUF2QixBQUE0QixLQUE1Qix5QkFBNkMscUJBQUssRUFBQSxBQUFFLFFBQVAsQUFBZSxJLGtDLEFBQXpCLHlDQUFnQyxDLEFBQUMsdU5BR3BGOzs7Ozs7Ozs7Ozs4MUJBU0c7QSxTLEFBQWEsSUFBb0IsS0FDbEM7cUJBQUEsQUFBSyxPQUFMLEFBQVcsaUJBQU0sQ0FBQSxBQUFDLEtBQWxCLEFBQWlCLEFBQU0sQUFDdkI7d0JBQUEsQUFBUyxLQUFULEFBQWMsZ0NBQWQsQUFBcUMsQUFDdEM7QSw0QixtQixBQS9Oa0I7Ozs7O0FDNUJyQiw0Qzs7QSxBQUVxQixxQkFHbkI7OztvQkFBa0MsS0FBdEIsQUFBc0IsNkVBQUosQUFBSSxzQ0FGbEMsQUFFa0Msa0JBQ2hDO1NBQUEsQUFBSyxNQUFMLEFBQVcsQUFDWjtBQUVEOzs7Ozs7Ozs7OzZEQVNJO0EsVSxBQUFjLE9BQWtCLEFBQ2xDO1dBQUEsQUFBSyxPQUFMLEFBQVksUUFBWixBQUFvQixBQUNyQjtBQUVEOzs7Ozs7Ozs7NkNBUUk7QSxVQUFtQixBQUNyQjthQUFPLEtBQUEsQUFBSyxPQUFaLEFBQU8sQUFBWSxBQUNwQjtBQUVEOzs7Ozs7Ozs7NkNBUUk7QSxVQUF1QixBQUN6QjthQUFPLE9BQUEsQUFBTyxVQUFQLEFBQWlCLGVBQWpCLEFBQWdDLEtBQUssS0FBckMsQUFBMEMsUUFBakQsQUFBTyxBQUFrRCxBQUMxRDtBQUVEOzs7Ozs7Ozs7K0NBUU07QSxZQUFpQyxBQUNyQztXQUFBLEFBQUssU0FBUyxPQUFBLEFBQU8sT0FBUCxBQUFjLElBQUksS0FBbEIsQUFBdUIsUUFBckMsQUFBYyxBQUErQixBQUM5QztBQUVEOzs7Ozs7Ozs7Z0RBUU87QSxVQUF1QixBQUM1QjthQUFPLE9BQU8sS0FBQSxBQUFLLE9BQW5CLEFBQWMsQUFBWSxBQUMzQjtBQUVEOzs7Ozs7Ozs7NkNBUWU7QUFDYjthQUFPLEtBQVAsQUFBWSxBQUNiO0EsOEMsQUE5RWtCOzs7Ozs7Ozs7QSxBQ0VMLE0sQUFBQTs7OztBLEFBSUEsZSxBQUFBOzs7Ozs7O0EsQUFPQSxnQixBQUFBOzs7Ozs7O0EsQUFPQSxjLEFBQUE7Ozs7QSxBQUlBLG1CLEFBQUE7Ozs7Ozs7QSxBQU9BLGtCLEFBQUE7Ozs7QSxBQUlBLGdCLEFBQUE7Ozs7QSxBQUlBLGtCLEFBQUE7Ozs7QSxBQUlBLGdCLEFBQUE7Ozs7QSxBQUlBLGMsQUFBQTs7Ozs7OztBLEFBT0Esa0IsQUFBQTs7Ozs7Ozs7Ozs7Ozs7OztBLEFBZ0JBLGdCLEFBQUE7Ozs7Ozs7Ozs7O0EsQUFXQSxrQixBQUFBLGdCQXBGaEIseUMsdURBQ0Esd0MsaVVBRUEsb0ZBRU8sU0FBQSxBQUFTLE1BQWtCLGNBQ2hDLHFCQUFBLEFBQVEsb0JBQ1QsV0FFTSxVQUFBLEFBQVMsbUJBQTRCLHFDQUFkLEFBQWMsZ0JBQzFDLFlBQ1EsS0FEUixBQUNhLG9CQUFlLHFCQUFBLEFBQUksbUJBRGhDLEFBQzRCLEFBQW1CLGtCQUQvQyxBQUVFLEFBRUgsbUNBRU0sVUFBQSxBQUFTLHFCQUE2QixzQ0FBZCxBQUFjLGdCQUMzQyxZQUFBLEFBQ1EsaUJBQVkscUJBQUEsQUFBSSxtQkFEeEIsQUFDb0IsQUFBbUIsbUJBRHZDLEFBRUUsQUFFSCxxQ0FFTSxVQUFBLEFBQVMsbUJBQTJCLHNDQUFkLEFBQWMsZ0JBQ3pDLFlBQUEsQUFBVSxpQkFBWSxxQkFBQSxBQUFJLG1CQUExQixBQUFzQixBQUFtQixlQUF6QyxBQUEwRCxBQUMzRCxxQ0FFTSxVQUFBLEFBQVMsd0JBQWdDLHNDQUFkLEFBQWMsZ0JBQzlDLFlBQUEsQUFDUSxpQkFBWSxxQkFBQSxBQUFJLG1CQUR4QixBQUNvQixBQUFtQixtQkFEdkMsQUFFRSxBQUVILHFDQUVNLFVBQUEsQUFBUyx1QkFBK0IsdUNBQWQsQUFBYyxpQkFDN0MsWUFBQSxBQUFVLGlCQUFZLHFCQUFBLEFBQUksbUJBQTFCLEFBQXNCLEFBQW1CLGtCQUF6QyxBQUE2RCxBQUM5RCxxQ0FFTSxVQUFBLEFBQVMsc0JBQTZCLHdDQUFkLEFBQWMsaUJBQzNDLFdBQUEsQUFBUyxhQUFRLHFCQUFBLEFBQUksbUJBQXJCLEFBQWlCLEFBQW1CLGdCQUFwQyxBQUFzRCxBQUN2RCxxQ0FFTSxVQUFBLEFBQVMsd0JBQThCLHdDQUFiLEFBQWEsZ0JBQzVDLFlBQUEsQUFBVSxnQkFBVyxxQkFBQSxBQUFJLG1CQUF6QixBQUFxQixBQUFtQixrQkFBeEMsQUFBNEQsQUFDN0QscUNBRU0sVUFBQSxBQUFTLHNCQUFrQyx3Q0FBbkIsQUFBbUIsZ0JBQWQsQUFBYyxpQkFDaEQsWUFBQSxBQUFVLGdCQUFXLHFCQUFBLEFBQUksOEJBQXpCLEFBQXFCLEFBQTRCLE9BQWpELEFBQTRELEFBQzdELHFDQUVNLFVBQUEsQUFBUyxvQkFBMkIsd0NBQWQsQUFBYyxpQkFDekMsWUFBQSxBQUNRLGlCQUFZLHFCQUFBLEFBQUksbUJBRHhCLEFBQ29CLEFBQW1CLG9CQUR2QyxBQUVFLEFBRUgscUNBRU0sVUFBQSxBQUFTLHdCQUE2RCx3Q0FBNUMsQUFBNEMsbUJBQXBDLEFBQW9DLDJCQUFwQixBQUFvQixpQkFBZCxBQUFjLGlCQUMzRSxRQUFBLEFBQVEsZUFBa0IsT0FBMUIsQUFBaUMsZUFBVSxLQUEzQyxBQUFnRCxPQUNoRCxtQkFBZ0IsS0FBQSxBQUFLLFNBQXJCLEFBQThCLEtBQTlCLEFBQW9DLGdCQUNwQyxvQkFBa0IsS0FBbEIsQUFBdUIsU0FBdkIsQUFBa0MsZ0JBQ2xDLHFCQUFtQixLQUFuQixBQUF3QixVQUF4QixBQUFvQyxnQkFDcEMsb0JBQWlCLEtBQUEsQUFBSyxVQUF0QixBQUFnQyxVQUFoQyxBQUEyQyxnQkFDM0MsbUJBQWdCLGVBQUEsQUFBZSxTQUEvQixBQUF3QyxNQUF4QyxBQUErQyxnQkFDL0MsbUJBQWdCLEtBQUEsQUFBSyxRQUFRLEtBQUEsQUFBSyxRQUFsQixBQUEwQixJQUExQyxBQUE4QyxNQUE5QyxBQUFxRCxnQkFDckQsaUJBQWMsS0FBQSxBQUFLLE9BQW5CLEFBQTBCLEtBQTFCLEFBQWdDLGdCQUNoQyxJQUFBLEFBQUksV0FBSixBQUFlLGdCQUNmLElBQUksS0FBQSxBQUFLLFFBQVQsQUFBaUIsSUFDakIsUUFBQSxBQUFRLGVBQVIsQUFBdUIsZ0JBQ3ZCLHdDQUFRLEtBQUssT0FBTCxBQUFZLFNBQXBCLEFBQTZCLEtBQzdCLFFBQUEsQUFBUSxBQUNULFdBRU0sVUFBQSxBQUFTLHNCQUFxRCx3Q0FBdEMsQUFBc0MsbUJBQTlCLEFBQThCLGlCQUF4QixBQUF3QiwyQkFDbkUsSUFBSSxXQUFKLEFBQWUsTUFBTSxDQUNuQixJQUFBLEFBQUkscUJBQUosQUFBeUIsQUFDMUIsaUJBRkQsT0FFTyxJQUFJLENBQUEsQUFBQyxVQUFVLEtBQUEsQUFBSyxRQUFRLGVBQTVCLEFBQTJDLE9BQU8sQ0FDdkQsSUFBQSxBQUFJLDJCQUFKLEFBQStCLEFBQ2hDLG1CQUZNLE9BRUEsQ0FDTCxJQUFBLEFBQUksOEJBQUosQUFBa0MsQUFDbkMsbUJBQ0QsU0FBQSxBQUFRLEFBQ1QsV0FFTSxVQUFBLEFBQVMsa0JBQWtCLEFBQ2hDO01BQUEsQUFBSSxrQkFBSixBQUFzQixBQUN0QjtVQUFBLEFBQVEsQUFDVDs7Ozs7OztBLEFDckZvQjtBLFNBQ25CLEcsQUFBcUMsb0NBRXJDOzs7Ozs7Ozs7NkhBUUk7QSxRQUFxQixBQUN2QjthQUFPLE9BQUEsQUFBTyxVQUFQLEFBQWlCLGVBQWpCLEFBQWdDLEtBQUssS0FBckMsQUFBMEMsT0FBakQsQUFBTyxBQUFpRCxBQUN6RDtBQUVEOzs7Ozs7Ozs7NkNBUUk7QSxRQUFpQixBQUNuQjthQUFPLEtBQUEsQUFBSyxNQUFaLEFBQU8sQUFBVyxBQUNuQjtBQUVEOzs7Ozs7Ozs2Q0FPTTtBQUNKO2FBQU8sS0FBUCxBQUFZLEFBQ2I7QUFFRDs7Ozs7Ozs7Ozs4Q0FTSztBLFEsQUFBWSxPQUFrQixBQUNqQztXQUFBLEFBQUssTUFBTCxBQUFXLE1BQVgsQUFBaUIsQUFDbEI7QUFFRDs7Ozs7Ozs7OytDQVFvRDtTQUE5QyxBQUE4QywyRUFBVixBQUFVLEFBQ2xEO1dBQUEsQUFBSyxRQUFRLE9BQUEsQUFBTyxPQUFQLEFBQWMsSUFBSSxLQUFsQixBQUF1QixPQUFwQyxBQUFhLEFBQThCLEFBQzVDO0FBRUQ7Ozs7Ozs7OztnREFRTztBLFFBQXFCLEFBQzFCO1VBQUksQ0FBQyxLQUFBLEFBQUssSUFBVixBQUFLLEFBQVMsS0FBSyxPQUFBLEFBQU8sQUFDMUI7YUFBTyxPQUFPLEtBQUEsQUFBSyxNQUFuQixBQUFjLEFBQVcsQUFDMUI7QUFFRDs7Ozs7Ozs7bURBT2tCO0FBQ2hCO1dBQUEsQUFBSyxRQUFMLEFBQWEsQUFDZDtBLGlELEFBckZrQjs7OztrQkNITixBQUNHLEFBQ2hCO1VBRmEsQUFFTCxBQUNSO1dBSGEsQUFHSixBQUNUO1NBQU8sQ0FKTSxBQUlMLEFBQ1IsQ0FMYSxBQUNiO2FBRGEsQUFLRixBQUNYO1MsQUFOYSxBQU1OOzs7O1NDTEEsQUFDTDthQURLLEFBQ0ksQUFDVDtVQUZLLEFBRUMsQUFDTjtjQUhLLEFBR0ssQUFDVjtjQUpLLEFBSUssQUFDVjthQUxLLEFBS0ksQUFDVDtXQU5LLEFBTUUsQUFDUDtpQkFQSyxBQU9RLEFBQ2I7YUFSSyxBQVFJLEFBQ1Q7WUFWVyxBQUNOLEFBU0csQUFFVixhQVphLEFBQ2I7O1NBV08sQUFDTDthQURLLEFBQ0ksQUFDVDtXQUZLLEFBRUUsQUFDUDtzQixBQWZXLEFBWU4sQUFHYTs7O3N3QkNmdEI7QUFDQSxvQjs7QSxBQUVxQixvQkFNbkI7Ozs7OzttQkFBYyxtQ0FMZCxBQUtjLFFBTG1CLEFBS25CLFFBSmQsQUFJYyxrQkFKWSxBQUlaLDhDQUhkLEFBR2MsWUFIUSxDQUFBLEFBQUMsS0FBRCxBQUFNLEFBR2QsY0FGZCxBQUVjLFlBRlEsWUFBTSxBQUFFLENBRWhCLEFBQ1o7U0FBQSxBQUFLLE1BQUwsQUFBVyxTQUFYLEFBQW9CLEFBQ3BCO1NBQUEsQUFBSyxNQUFMLEFBQVcsUUFBWCxBQUFtQixBQUNuQjtTQUFBLEFBQUssTUFBTCxBQUFXLFFBQVgsQUFBbUIsQUFDbkI7U0FBQSxBQUFLLE1BQUwsQUFBVyxXQUFYLEFBQXNCLEFBQ3RCO1NBQUEsQUFBSyxNQUFMLEFBQVcsUUFBUSxLQUFuQixBQUF3QixBQUN4QjtTQUFBLEFBQUssTUFBTCxBQUFXLE9BQU8sS0FBbEIsQUFBdUIsQUFDeEI7QUFFRDs7Ozs7Ozs7OzsyREFTRztBLFMsQUFBYSxJQUFvQixBQUNsQztVQUFJLE9BQUEsQUFBTyxPQUFYLEFBQWtCLFlBQVksTUFBTSxJQUFBLEFBQUksTUFBVixBQUFNLEFBQVUsQUFDOUM7VUFBSSxLQUFBLEFBQUssUUFBVCxBQUFJLEFBQWEsTUFBTSxLQUFBLEFBQUssSUFBTCxBQUFTLEtBQVQsQUFBYyxBQUN0QztBQUVEOzs7Ozs7Ozs7OzhDQVNLO0EsUyxBQUFhLE1BQWlCLEFBQ2pDO1VBQUksS0FBQSxBQUFLLFVBQUwsQUFBZSxRQUFmLEFBQXVCLE9BQU8sQ0FBbEMsQUFBbUMsR0FBRyxBQUNwQzthQUFBLEFBQUssc0JBQUwsQUFBYyxZQUFRLENBQUEsQUFBQyxLQUF2QixBQUFzQixBQUFNLEFBQzdCO0FBRkQsYUFFTyxBQUNMO1lBQU0sT0FBZSxLQUFBLEFBQUssUUFBMUIsQUFBcUIsQUFBYSxBQUNsQztZQUFNLE9BQWUsS0FBQSxBQUFLLFFBQTFCLEFBQXFCLEFBQWEsQUFFbEM7O1lBQUksS0FBQSxBQUFLLE1BQVQsQUFBSSxBQUFXLE9BQU8sQUFDcEI7Y0FBTSxLQUFlLEtBQUEsQUFBSyxNQUFMLEFBQVcsTUFBWCxBQUFpQixTQUFTLEtBQS9DLEFBQW9ELEFBQ3BEO2FBQUEsQUFBRyxLQUFILEFBQVEsTUFBUixBQUFjLEFBQ2Y7QUFDRjtBQUVEOztXQUFBLEFBQUssU0FBTCxBQUFjLEtBQWQsQUFBbUIsS0FBbkIsQUFBd0IsQUFDekI7QUFFRDs7Ozs7Ozs7Ozs7a0RBVVM7QSxTLEFBQWEsVyxBQUFtQixNQUFpQixBQUN4RDtVQUFJLEtBQUEsQUFBSyxNQUFMLEFBQVcsU0FBZixBQUFJLEFBQW9CLE1BQU0sQUFDNUI7YUFBQSxBQUFLLE1BQUwsQUFBVyxTQUFYLEFBQW9CLEtBQXBCLEFBQXlCLEtBQXpCLEFBQThCLE1BQTlCLEFBQW9DLFdBQXBDLEFBQStDLEFBQ2hEO0FBQ0Y7QUFFRDs7Ozs7Ozs7Ozs2Q0FTSTtBLFMsQUFBYSxJQUFvQixBQUNuQztVQUFJLEtBQUEsQUFBSyxVQUFMLEFBQWUsUUFBZixBQUF1QixPQUFPLENBQWxDLEFBQW1DLEdBQUcsQUFDcEM7YUFBQSxBQUFLLE1BQUwsQUFBVyxTQUFYLEFBQW9CLE9BQXBCLEFBQTJCLEFBQzVCO0FBRkQsYUFFTyxBQUNMO1lBQU0sT0FBZSxLQUFBLEFBQUssUUFBMUIsQUFBcUIsQUFBYSxBQUNsQztZQUFNLE9BQWUsS0FBQSxBQUFLLFFBQTFCLEFBQXFCLEFBQWEsQUFDbEM7YUFBQSxBQUFLLE1BQUwsQUFBVyxNQUFYLEFBQWlCLFFBQWpCLEFBQXlCLEFBQzFCO0FBQ0Y7QUFFRDs7Ozs7Ozs7OzZDQVFJO0EsU0FBc0IsQUFDeEI7VUFBSSxBQUNGO1lBQU0sT0FBaUIsSUFBQSxBQUFJLE1BQTNCLEFBQXVCLEFBQVUsQUFDakM7ZUFBTyxLQUFBLEFBQUssU0FBTCxBQUFjLElBQUksQ0FBQyxDQUFDLEtBQUEsQUFBSyxNQUFNLEtBQVgsQUFBVyxBQUFLLElBQUksS0FBeEMsQUFBb0IsQUFBb0IsQUFBSyxNQUFNLENBQUMsQ0FBQyxLQUFBLEFBQUssTUFBTCxBQUFXLFNBQVMsS0FBaEYsQUFBNEQsQUFBb0IsQUFBSyxBQUN0RjtBQUhELFFBR0UsT0FBQSxBQUFPLEdBQUcsQUFDVjtlQUFBLEFBQU8sQUFDUjtBQUNGO0FBRUQ7Ozs7Ozs7OztpREFRUTtBLFNBQXFCLEFBQzNCO2FBQU8sSUFBQSxBQUFJLE1BQUosQUFBVSxXQUFqQixBQUFPLEFBQXFCLEFBQzdCO0FBRUQ7Ozs7Ozs7OztpREFRUTtBLFNBQXFCLEFBQzNCO2FBQU8sSUFBQSxBQUFJLE1BQUosQUFBVSxxQkFBakIsQUFBTyxBQUErQixBQUN2QztBQUVEOzs7Ozs7Ozs7aURBUVE7QSxTQUFzQixBQUM1QjthQUFPLEtBQUEsQUFBSyxnQkFBTCxBQUFxQixLQUFyQixBQUEwQixRQUFRLEtBQUEsQUFBSyxVQUFMLEFBQWUsUUFBZixBQUF1QixPQUFPLENBQXZFLEFBQXdFLEFBQ3pFO0EsNkMsQUE1SWtCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQytDckI7Ozs7Ozs7dzBEQVFPOztpQkFDUyxBQUFHLEtBQUgsQUFBUSxNQURqQixBQUNTLEFBQWMsS0FBZCx1QkFBNEIsNEJBQUEsQUFBcUIsS0FBSyxDQUQvRCxBQUNxQyxBQUEwQixBQUFDLDJEQURoRSxBQUM4QixrRixvQixBQURmOzs7QUFJdEI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUJBOzs7Ozs7Ozt5akNBU087b0JBQUEsQUFBd0I7aUJBQ1IsQUFBRyxLQUFILEFBQVEsTUFBUixBQUFjLEtBQUssY0FEbkMsQUFDZ0IsQUFBbUIsQUFBYyxNQUFqQyxTQURoQixBQUNDLGdEQUNDO0FBRkYsbUYsb0IsQUFBZTs7O0FBS3RCOzs7Ozs7Ozt3YkFTTztvQkFBQSxBQUEwQjtpQkFDVixBQUFHLEtBQUgsQUFBUSxNQUFSLEFBQWMsT0FEOUIsQUFDZ0IsQUFBcUIsR0FBckIsU0FEaEIsQUFDQyxnREFDQztBQUZGLG1GLG9CLEFBQWU7OztBQUt0Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBdUNBOzs7Ozs7Ozs7cW5CQVVPO29CQUFBLEFBQWdDLHFQQUM5Qjs4SkFDTDttQ0FBQSxBQUFXLEtBQVgsQUFBZ0IsTUFBTSxLQUF0QixBQUEyQixBQUUzQjs7NkJBQUEsQUFBSyxNQUFMLEFBQVcsS0FBWCxBQUFnQixTQUFoQixBQUF5QixBQUV6Qjs7aUNBQUEsQUFBUyxLQUFULEFBQWMsZUFFZDs7a0RBUEs7K0JBQUEsQUFRQyxBQUFLLE1BQUwsaUVBVEgsYUFBQSxBQUNpQixrRUFEakIsQUFDaUIsdUYsb0IsQUFERjs7OztBQWF0Qjs7Ozs7Ozs7d3pCQVNPO29CQUFBLEFBQXdCO2lCQUNSLEFBQUcsS0FBSCxBQUFRLE1BQVIsQUFBYyxPQUFPLEtBQXJCLEFBQTBCLEtBQUssRUFBRSxRQURqRCxBQUNnQixBQUErQixBQUFVLE9BQXpDLFNBRGhCLEFBQ0MsZ0RBQ0M7QUFGRixtRixvQixBQUFlOzs7QUFLdEI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMkRBOzs7Ozs7Ozs7dW1CQVVPO29CQUFBLEFBQTRCLE1BQTVCLEFBQXlDLDJKQUM5QztBQUNBOzJCQUFBLEFBQWUsS0FBZixBQUFvQixNQUFwQixBQUEwQixNQUExQixBQUFnQyxBQUVoQzs7QUFDTTtBQUxELHlCQUtxQixZQUFBLEFBQVksS0FBWixBQUFpQixNQUFqQixBQUF1QixNQUw1QyxBQUtxQixBQUE2QixBQUV2RDs7QUFDQTt1QkFBQSxBQUFXLFNBQVgsQUFBb0IsTUFSZjs7aUJBVWdCLEFBQUcsS0FBSCxBQUFRLE1BQVIsQUFBYyxPQUFPLEtBQXJCLEFBQTBCLEtBVjFDLEFBVWdCLEFBQStCLFdBQS9CLFNBVmhCLEFBVUMsZ0RBRUM7O0FBWkYsbUYsb0IsQUFBZTs7O0FBZXRCOzs7Ozs7Ozs7MGRBVU87b0JBQUEsQUFBaUMsTUFBakMsQUFBOEMsNklBQzdDO0FBREQsbUJBQUEsQUFDaUIsc0hBQ2Y7Z0NBQUEsQUFBc0MsMElBRXZDOztBQUZDLDBEQUdIO0FBQ0E7dUNBQUEsQUFBZSxLQUFmLEFBQW9CLE1BQXBCLEFBQTBCLE1BSnZCOzs7dUNBT0csQUFBYSxLQUFiLEFBQWtCLE1BQWxCLEFBQXdCLE1BUDNCLEFBT0csQUFBOEIsT0FBOUIsT0FHUjs7O0FBQ0E7MkNBQUEsQUFBbUIsS0FBbkIsQUFBd0IsTUFBeEIsQUFBOEIsU0FBOUIsQUFBdUMsUUFBUSxLQUEvQyxBQUFvRCxBQUVwRDs7QUFDQTt1Q0FBQSxBQUFlLEtBQWYsQUFBb0IsTUFBcEIsQUFBMEIsTUFBMUIsQUFBZ0MsQUFFaEM7O0FBQ0E7aUNBQUEsQUFBUyxLQUFULEFBQWMsOEJBQWQsQUFBbUMsUUFBbkMsQUFBMkMsTUFBM0MsQUFBaUQsQUFFakQ7O0FBbkJLO21EQW9CQyxLQXBCRCxBQW9CQyxBQUFLLHVFQXRCUixhQUFBLEFBRWlCLHlFQUZqQixBQUVpQiwyRixvQixBQUZGOzs7O0FBMEJ0Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE0Q0E7Ozs7Ozs7MnlDQVFPO3FOQUNMO0FBQ0E7QUFDQTt5QkFBYSxLQUFiLEFBQWtCLEFBRWxCOztBQUxLO3VDQU1zQixHQUFBLEFBQUcsS0FBSCxBQUFRLE1BTjlCLEFBTXNCLEFBQWMsZUFOcEMsQUFNQyx1QkFORCxBQU02Qzs7cUJBTjdDLEFBUVEsU0FBVCw4QkFDRjtxQkFBQSxBQUFTLEtBQVQsQUFBYyw4QkFBcUIsS0FBbkMsQUFBbUMsQUFBSyxBQUN4QztzQkFBQSxBQUFVLEtBQVYsQUFBZSwrQkFDUjtBQVhKLGNBQUEsUUFjQTs7OzRCQUFBLEFBQU0sYUFBYSxLQWRuQixBQWNBLEFBQXdCLHNDQUMzQjtxQkFBQSxBQUFTLEtBQVQsQUFBYyw0QkFBbUIsS0FBakMsQUFBc0MsU0FmbkM7K0JBZ0JVLEFBQWlCLEtBQWpCLEFBQXNCLE1BaEJoQyxBQWdCVSxBQUE0QixLQUE1QiwwQkFoQlYsQUFnQmtELGlEQWhCbEQsQUFnQjZDLHFEQUN6QztBQWpCSixvQkFvQkw7OztBQUNNO0FBckJELHdCQXFCdUIsZ0JBQUEsQUFBTSxhQUFhLEtBckIxQyxBQXFCdUIsQUFBd0IsQUFFcEQ7O0FBQ007QUF4QkQsNkJBd0IyQixJQXhCM0IsQUF3QjJCLEFBQUksQUFFcEM7O0FBQ007QUEzQkQsc0JBMkJtQixLQUFBLEFBQUssT0FBTCxBQUFZLElBM0IvQixBQTJCbUIsQUFBZ0IsQUFFeEM7O0FBQ007QUE5QkQscUJBOEJVLENBQUEsQUFBQyxNQUFELEFBQU8sV0E5QmpCLEFBOEJVLEFBQWtCLEFBRWpDOztBQWhDSzt3Q0FpQzRCLFlBQUEsQUFBWSx5QkFBWixBQUFpQixhQWpDN0MsQUFpQzRCLEFBQTBCLGlDQWpDdEQsQUFpQ29FLEtBakNwRSxBQWlDQywwQkFqQ0QsQUFpQytELGdCQUVwRTs7QUFDQTtBQUNBO0FBQ0E7aUJBQUEsQUFBSyxpQkFBaUIsV0FBQSxBQUFXLFNBQWpDLEFBQXNCLEFBQW9CLGtDQUVuQzs7aUJBeENGLEFBd0NPLGVBeENQLG1FLG9CLEFBQWU7OztBQTJDdEI7Ozs7Ozs7Ozs7OztBQVlBOzs7Ozs7OzsrcEJBU087cUJBQUEsQUFBMkI7b0JBQzVCLEFBQU8sNkNBQVAsQUFBTyxXQUFQLEFBQWdCLFlBQVksS0FBQSxBQUFLLFdBRGhDLEFBQzJDLElBQTVDLGtFQURDLEFBQ3dEO21CQUMvQyxBQUFLLFNBQVMsS0FGdkIsQUFFUyxBQUFtQixJQUFuQiw4RkFGVCxBQUVzQyx3RSxvQixBQUZ2Qjs7O0FBS3RCOzs7Ozs7Ozs7dWtCLEFBMVlnQixnQixBQUFBLHNCLEFBZ0JBLEssQUFBQSxXLEFBMkJBLFcsQUFBQSxpQixBQTRDQSxpQixBQUFBLHVCLEFBcUJBLFksQUFBQSxrQixBQXdEQSxxQixBQUFBLDJCLEFBaUJBLGlCLEFBQUEsdUIsQUFjQSxjLEFBQUEsb0IsQUEwRjJCLGMsQUFBQSxvQixBQTJGM0IsWSxBQUFBO0EsQUE0QkEsa0IsQUFBQSxnQkEvYWhCLGdDLDZDQUNBLG9DLGlEQUNBLG1ELCtEQUNBLGdDQUNBLG9DLHlzQixBQVVBLDZELEFBQ0Esd0MsQUFDQSxnQ0FFQTs7Ozs7Ozs7MnNDQVNPLFNBQUEsQUFBUyxjQUFULEFBQXVCLE1BQW9CLENBQ2hELEtBQUEsQUFBSyxXQUFXLEtBQUEsQUFBSyxZQUFyQixBQUFpQyxFQUVqQyxJQUFJLE9BQU8sS0FBUCxBQUFZLGFBQWhCLEFBQTZCLFVBQVUsS0FBQSxBQUFLLFdBQUwsQUFBZ0IsRUFFdkQsT0FBQSxBQUFPLEFBQ1IsSyxFQUVEOzs7Ozs7O3MxQ0FRTyxTQUFBLEFBQVMsS0FBcUIsQ0FDbkMsT0FBTyxBQUFDLEtBQUQsQUFBWSxRQUFaLEFBQW9CLFFBQVEsQUFBQyxLQUFwQyxBQUFPLEFBQTRCLEFBQVksQUFDaEQsUUF5Qk0sVUFBQSxBQUFTLFNBQVQsQUFBa0IsYUFBMkMsQ0FDbEUsSUFBSSxBQUFDLEtBQUQsQUFBWSxPQUFaLEFBQW1CLElBQW5CLEFBQXVCLFlBQVksT0FBQSxBQUFPLGdCQUE5QyxBQUE4RCxZQUFZLG1DQUR6QixBQUN5Qix1RUFEekIsQUFDeUIsaUNBQ3hFLGFBQUEsQUFBWSxBQUNiLE1BQ0YsQ0F3Q00sVUFBQSxBQUFTLGVBQVQsQUFBd0IsTUFBeEIsQUFBcUMsTUFBOEIsa0JBQ3hFLElBQUksRUFBRSxTQUFOLEFBQUksQUFBVyxPQUFPLE9BQUEsQUFBTyxNQUU3QixJQUFNLFNBQVMsQ0FBQyxDQUFJLEtBQUosQUFBUyxZQUFULEFBQWdCLE1BQWpCLEFBQUMsQUFBd0IsVUFBVSxDQUFJLEtBQUosQUFBUyxZQUEzRCxBQUFlLEFBQW1DLEFBQWtCLG1CQUVwRSxPQUFBLEFBQU8sUUFBUSxVQUFBLEFBQUMsR0FBTSxDQUNwQixNQUFBLEFBQUssTUFBTCxBQUFXLEtBQUssRUFBaEIsQUFBZ0IsQUFBRSxJQUFsQixBQUFzQixNQUN0QixTQUFBLEFBQVMsK0VBQVQsQUFBNkMsQUFDOUMsS0FIRCxHQUtBLE9BQUEsQUFBTyxBQUNSLEssRUFFRDs7Ozs7OzsyK0RBUU8sU0FBQSxBQUFTLFlBQWtCLENBQ2hDLEtBQUEsQUFBSyxPQUVMLGFBQWEsS0FBYixBQUFrQixnQkFFbEIsU0FBQSxBQUFTLEtBQVQsQUFBYyxnQ0FBZCxBQUFxQyxBQUN0QyxRQWtETSxVQUFBLEFBQVMsbUJBQVQsQUFBNEIsTUFBNUIsQUFBMEMsUUFBMUMsQUFBMkQsTUFBb0IsQ0FDcEYsSUFBSSxzQkFBQSxBQUFVLFFBQVYsQUFBa0IsU0FBUyx1QkFBVyxPQUExQyxBQUErQixBQUFXLEFBQU8sUUFBUSxDQUN2RCxPQUFBLEFBQU8sTUFBUCxBQUFhLEtBQWIsQUFBa0IsUUFBbEIsQUFBMEIsTUFDMUIsT0FBQSxBQUFPLEFBQ1IsS0FDRCxRQUFBLEFBQU8sQUFDUixNLEVBRUQ7Ozs7Ozs7O3d5RUFTTyxTQUFBLEFBQVMsZUFBVCxBQUF3QixNQUFtQixDQUNoRCxXQUFBLEFBQVcsS0FBWCxBQUFnQixNQUFNLEtBQXRCLEFBQTJCLEFBQzVCLEssRUFFRDs7Ozs7Ozs7OzQyRUFVTyxTQUFBLEFBQVMsWUFBVCxBQUFxQixNQUFyQixBQUFrQyxRQUF3QixDQUMvRCxJQUFJLEVBQUUsV0FBTixBQUFJLEFBQWEsU0FBUyxPQUFBLEFBQU8sUUFBUCxBQUFlLEVBRXpDLElBQUksRUFBRSxXQUFOLEFBQUksQUFBYSxPQUFPLENBQ3RCLEtBQUEsQUFBSyxRQUFMLEFBQWEsRUFDYixLQUFBLEFBQUssUUFBUSxPQUFiLEFBQW9CLEFBQ3JCLE1BRUQsTUFBQSxBQUFLLFNBQUwsQUFBYyxFQUVkLElBQUksS0FBQSxBQUFLLFNBQVMsT0FBbEIsQUFBeUIsT0FBTyxDQUM5QixLQUFBLEFBQUssVUFBTCxBQUFlLEFBQ2hCLEtBRUQsUUFBQSxBQUFPLEFBQ1IsSyxFQTJFTSwwQkFBMkIsU0FBQSxBQUFTLFlBQVQsQUFDaEMsTUFEZ0MsQUFFaEMsUUFGZ0MsQUFHaEMsZ0JBQ1UsNkZBQ0gsOE1BQUEsQUFDQyxPQURELEFBQ2lCLE1BRGpCLEFBR0w7eUNBQ00sU0FBQSxBQUFTLEtBQVQsQUFBYyxNQUpmLEFBSUMsQUFBb0IsY0FFMUIsQUFDQTtpQ0FBQSxBQUFtQixLQUFuQixBQUF3QixNQUF4QixBQUE4QixVQUE5QixBQUF3QyxnQkFBZ0IsS0FQbkQsQUFPTCxBQUE2RCxPQUU3RCxBQUNBOzZCQUFBLEFBQWUsS0FBZixBQUFvQixNQUFwQixBQUEwQixNQUExQixBQUFnQyxVQVYzQixBQVlDLE9BQU8sZ0JBQUEsQUFBTSxXQUFXLE9BWnpCLEFBWVEsQUFBd0IsT0FFckMsQUFDTTtBQWZELDZCQWVnQixPQUFBLEFBQU8sT0FBTyxRQWY5QixBQWVnQixBQUFzQixJQUUzQyxTQUFBLEFBQVMsS0FBVCxBQUFjLGdDQUFkLEFBQXFDLFFBQXJDLEFBQTZDLGdCQUE3QyxBQUE2RCxNQUFNLGdCQWpCOUQsQUFpQkwsQUFBeUUsYUFqQnBFLEFBbUJMOzhCQUNBLHdDQUFBLEFBQWUsUUFBZixBQUNHLG1DQURILEFBQ1EsZ0JBQWdCLEtBRHhCLEFBQzZCLGdDQXJCeEIsQUFvQkwsQUFDc0MsNENBQ3ZCLGtCQUFBLEFBQWtCLEtBQWxCLEFBQXVCLE1BQXZCLEFBQTZCLE1BdEJ2QyxBQXNCVSxBQUFtQyx3Q0F0QjdDLEFBc0JtRSxxQ0F0Qm5FLEFBc0I4RCxrREF0QjlELEFBc0JGLG9FQUNhLGlCQUFBLEFBQWlCLEtBQWpCLEFBQXNCLE1BdkJqQyxBQXVCVyxBQUE0Qiw4QkF2QnZDLEFBdUJtRCxxQ0F2Qm5ELEFBdUI4QyxrQ0F2QjlDLEFBdUJGLDJHQXZCTCxhQUFBLEFBQXNCLGlFQUF0QixBQUFzQixpQkF5QnZCLEdBekJDLENBc0ZLLFVBQUEsQUFBUyxZQUFrQixDQUNoQyxLQUFBLEFBQUssVUFBTCxBQUFlLEFBQ2hCLE1BMEJNLFVBQUEsQUFBUyxrQkFBMkIsQ0FDekMsSUFBSSxnQkFBSixBQUFVLGNBQWMsT0FBQSxBQUFPLE1BRS9CLElBQU0sVUFBVSxnQkFBQSxBQUFNLGdCQUF0QixBQUFzQyxHQUV0QyxLQUFBLEFBQUssVUFBTCxBQUFlLE1BQWYsQUFBcUIsU0FFckIsZ0JBQUEsQUFBTSxlQUFOLEFBQXFCLEtBRXJCLE9BQUEsQUFBTyxBQUNSOzs7MkVDNWJELGdDOztBQUVBOztBQUVBLE9BQUEsQUFBTyx3Qjs7Ozs7Ozs7O0EsQUNFaUIsTUFKeEIsb0MsaURBQ0Esd0MscURBQ0Esa0MsMklBRWUsVUFBQSxBQUFTLE1BQVQsQUFBZSxRQUFpQixBQUM3QztPQUFBLEFBQUssU0FBUyxxQkFBZCxBQUFjLEFBQVcsQUFDMUI7OztBQUVELE1BQUEsQUFBTSxPQUFOLEFBQWE7QUFDYixNQUFBLEFBQU0sT0FBTixBQUFhO0FBQ2IsTUFBQSxBQUFNLFVBQU4sQUFBZ0I7QUFDaEIsTUFBQSxBQUFNLGVBQU4sQUFBcUI7QUFDckIsTUFBQSxBQUFNLGFBQU4sQUFBbUI7O0FBRW5CLE1BQUEsQUFBTSxVQUFOLEFBQWdCLFlBQVksZ0JBQTVCOztBQUVBOzs7Ozs7OztBQVFBLE1BQUEsQUFBTSxVQUFOLEFBQWdCLFNBQVMsU0FBQSxBQUFTLE9BQVQsQUFBZ0IsU0FBd0IsQUFDL0Q7TUFBSSxDQUFDLEtBQUEsQUFBSyxVQUFMLEFBQWUsSUFBcEIsQUFBSyxBQUFtQixVQUFVLEFBQ2hDO1NBQUEsQUFBSyxVQUFMLEFBQWUsS0FBZixBQUFvQixTQUFTLHNCQUFBLEFBQVksU0FBUyxLQUFsRCxBQUE2QixBQUEwQixBQUN4RDtBQUNEO1NBQU8sS0FBQSxBQUFLLFVBQUwsQUFBZSxJQUF0QixBQUFPLEFBQW1CLEFBQzNCO0FBTEQ7O0FBT0E7Ozs7Ozs7O0FBUUEsTUFBQSxBQUFNLFVBQU4sQUFBZ0IsVUFBVSxTQUFBLEFBQVMsUUFBVCxBQUFpQixNQUFxQixBQUM5RDtNQUFJLENBQUMsS0FBQSxBQUFLLFVBQUwsQUFBZSxJQUFwQixBQUFLLEFBQW1CLE9BQU8sQUFDN0I7VUFBTSxJQUFBLEFBQUksWUFBSixBQUFjLE9BQXBCLEFBQ0Q7QUFDRDtTQUFPLEtBQUEsQUFBSyxVQUFMLEFBQWUsSUFBdEIsQUFBTyxBQUFtQixBQUMzQjtBQUxEOztBQU9BOzs7Ozs7OztBQVFBLE1BQUEsQUFBTSxVQUFOLEFBQWdCLGFBQWEsU0FBQSxBQUFTLFdBQVQsQUFBb0IsS0FBbUIsQUFDbEU7T0FBQSxBQUFLLE9BQUwsQUFBWSxJQUFaLEFBQWdCLFdBQWhCLEFBQTJCLEFBQzVCO0FBRkQ7O0FBSUE7Ozs7Ozs7O0FBUUEsTUFBQSxBQUFNLFVBQU4sQUFBZ0IsV0FBVyxTQUFBLEFBQVMsU0FBVCxBQUFrQixLQUFtQixBQUM5RDtPQUFBLEFBQUssT0FBTCxBQUFZLElBQVosQUFBZ0IsU0FBaEIsQUFBeUIsQUFDMUI7QUFGRDs7QUFJQTs7Ozs7Ozs7QUFRQSxNQUFBLEFBQU0sVUFBTixBQUFnQixZQUFZLFNBQUEsQUFBUyxVQUFULEFBQW1CLEtBQW1CLEFBQ2hFO09BQUEsQUFBSyxPQUFMLEFBQVksSUFBWixBQUFnQixVQUFoQixBQUEwQixBQUMzQjtBQUZEOztBQUlBOzs7Ozs7OztBQVFBLE1BQUEsQUFBTSxVQUFOLEFBQWdCLGVBQWUsU0FBQSxBQUFTLGFBQVQsQUFBc0IsS0FBbUIsQUFDdEU7T0FBQSxBQUFLLE9BQUwsQUFBWSxJQUFaLEFBQWdCLGFBQWhCLEFBQTZCLEFBQzlCO0FBRkQ7O0FBSUE7Ozs7Ozs7O0FBUUEsTUFBQSxBQUFNLFVBQU4sQUFBZ0IsV0FBVyxTQUFBLEFBQVMsU0FBVCxBQUFrQixLQUFvQixBQUMvRDtPQUFBLEFBQUssT0FBTCxBQUFZLElBQVosQUFBZ0IsU0FBaEIsQUFBeUIsQUFDMUI7QUFGRDs7QUFJQSxNQUFBLEFBQU0sVUFBTixBQUFnQixhQUFhLFNBQUEsQUFBUyxXQUFULEFBQW9CLEtBQW1CLEFBQ2xFO09BQUEsQUFBSyxPQUFMLEFBQVksSUFBWixBQUFnQixXQUFoQixBQUEyQixBQUM1QjtBQUZEOztBQUlBOzs7Ozs7OztBQVFBLE1BQUEsQUFBTSxVQUFVLFNBQUEsQUFBUyxVQUF3RCxLQUFoRCxBQUFnRCxpRkFBVixBQUFVLEFBQy9FO01BQUksRUFBRSxzQkFBTixBQUFJLEFBQXdCLFNBQVMsQUFDbkM7VUFBTSxJQUFBLEFBQUksTUFBVixBQUFNLEFBQVUsQUFDakI7QUFDRDtRQUFBLEFBQU0sZUFBTixBQUFxQixBQUNyQjtRQUFBLEFBQU0sZUFBTixBQUFxQixBQUN0QjtBQU5EOztBQVFBOzs7Ozs7OztBQVFBLE1BQUEsQUFBTSxPQUFPLFNBQUEsQUFBUyxPQUF1RCxLQUFsRCxBQUFrRCxtRkFBVixBQUFVLEFBQzNFO01BQUksRUFBRSx3QkFBTixBQUFJLEFBQTBCLFNBQVMsQUFDckM7VUFBTSxJQUFBLEFBQUksTUFBVixBQUFNLEFBQVUsQUFDakI7QUFDRDtRQUFBLEFBQU0sYUFBTixBQUFtQixBQUNwQjtBQUxEOztBQU9BOzs7Ozs7OztBQVFBLE1BQUEsQUFBTSxNQUFNLFNBQUEsQUFBUyxNQUFnRCxLQUE1QyxBQUE0Qyw2RUFBVixBQUFVLEFBQ25FO1FBQUEsQUFBTSx1QkFBZSxNQUFyQixBQUEyQixTQUEzQixBQUF1QyxBQUN4QztBQUZEOzs7O0FDdEpBLG1DOzs7O0FBSUE7QUFDQSxnQzs7QUFFQTtBQUNBO0FBQ0EsbUY7O0EsQUFFcUIsNkJBS25COzs7OzswQkFBQSxBQUFZLFFBQVosQUFBNkIsU0FBbUIsdUJBQzlDO1NBQUEsQUFBSyxTQUFMLEFBQWMsQUFDZDtTQUFBLEFBQUssVUFBVSxLQUFBLEFBQUssV0FBcEIsQUFBZSxBQUFnQixBQUNoQztBLHNFQUVVOztBLGFBQWMsQUFDdkI7VUFBSSxRQUFBLEFBQU8sZ0RBQVAsQUFBTyxjQUFYLEFBQXVCLFVBQVUsQUFDL0I7ZUFBQSxBQUFPLEFBQ1I7QUFGRCxpQkFFVyxPQUFBLEFBQU8sWUFBWCxBQUF1QixZQUFZLEFBQ3hDO2VBQU8sSUFBQSxBQUFJLFFBQVEsS0FBbkIsQUFBTyxBQUFpQixBQUN6QjtBQUZNLE9BQUEsTUFFQSxJQUFJLEtBQUEsQUFBSyxPQUFMLEFBQVksSUFBWixBQUFnQixlQUFwQixBQUFtQyxZQUFZLEFBQ3BEO2VBQU8sOEJBQW9CLEtBQTNCLEFBQU8sQUFBeUIsQUFDakM7QUFDRDthQUFPLGlDQUF1QixLQUE5QixBQUFPLEFBQTRCLEFBQ3BDO0FBRUQ7Ozs7Ozs7OztpREFRUTtBLFVBQThCLEFBQ3BDO1dBQUEsQUFBSyxpQkFBTCxBQUFzQixBQUN0QjthQUFBLEFBQU8sQUFDUjtBQUVEOzs7Ozs7Ozs7O3VCLEFBUXFCLEFBQUssS0FBTCxtRCxBQUFiLG9CLEFBQXlCLGdCQUN6QjtBLHdCQUFRLHVCQUFBLEFBQVEsSyxBQUFSLEFBQWEsbUNBQ3BCO3VCQUFBLEFBQU8sS0FBUCxBQUFZLEFBQ2hCO0FBREksb0JBQ0EsdUJBQU8sU0FBQSxBQUFTLEtBQWhCLEFBQU8sQUFBYyxJQURyQixBQUVKO0FBRkkscUJBRUMsVUFBQSxBQUFDLEdBQUQsQUFBSSxXQUFNLElBQVYsQUFBYyxFQUZmLEFBR0o7QUFISSx1QkFHRyxLQUFBLEFBQUssWUFIUixBQUdHLEFBQWlCLFEsQUFIcEIsQUFHNEIseUlBR3JDOzs7Ozs7Ozs7O2dmQVFXO0E7d0JBQ0wsQUFBTyw2Q0FBUCxBQUFPLFcsQUFBUyxRQUFoQixnRSxBQUFpQzs7O3VCQUdSLEFBQUssUUFBTCxBQUFhLElBQUksSyxBQUFqQixBQUFzQixlQUF0QixTLEFBQXZCOzs7O3VCLEFBSUksQUFBSyxZQUFMLHlEQUNSO3dCQUFBLEFBQVEscUNBQWtDLEtBQTFDLEFBQStDLDBDQUFvQyxLQUFBLEFBQUssT0FBTCxBQUFZLElBQS9GLEFBQW1GLEFBQWdCLGtDQUM1RjtBLHNCLE1BR1Q7OztBQUNBO0FBQ007QSwwQkFBVSxLQUFBLEFBQUssWSxBQUFMLEFBQWlCLEFBRWpDOztBQUNBO3NCQUFBLEFBQU0sS0FBTixBQUFXLEFBRVg7OzsyQ0FDTSxLQUFBLEFBQUssUUFBTCxBQUFhLElBQUksS0FBakIsQUFBc0IsZ0IsQUFBdEIsQUFBc0MsdUNBRXJDOzt3QixBQUFRLDZJQUdqQjs7Ozs7Ozs7MGNBTWE7QSxVLEFBQVk7dUIsQUFDRyxBQUFLLEtBQUwsUyxBQUFwQixpQkFDQTtBLHdCQUFnQixLQUFBLEFBQUssVUFBVSxxQkFBSyxFQUFBLEFBQUUsUUFBUCxBQUFlLEcsQUFBOUIsQUFFdEI7OztzQkFDSSxRLEFBQVEsaUUsQUFBVSxZQUV0Qjs7QUFDQTtxQkFBQSxBQUFLLFNBQVMsT0FBQSxBQUFPLE9BQVAsQUFBYyxJQUFJLEtBQWxCLEFBQWtCLEFBQUssUUFBckMsQUFBYyxBQUErQixBQUU3Qzs7OzBDQUNNLEtBQUEsQUFBSyxRQUFMLEFBQWEsSUFBSSxLQUFqQixBQUFzQixnQixBQUF0QixBQUFzQyxxQ0FFckM7O0Esd0tBR1Q7Ozs7Ozs7Ozs7Z2RBUWE7QTt1QixBQUNlLEFBQUssS0FBTCxTLEFBQXBCLGlCQUNBO0Esd0JBQWdCLEtBQUEsQUFBSyxVQUFVLHFCQUFLLEVBQUEsQUFBRSxRQUFQLEFBQWUsRyxBQUE5Qjs7d0IsQUFFVixDQUFSLGdFLEFBQWtCLFlBRXRCOzt1QkFBTyxLQUFQLEFBQU8sQUFBSyxPLG1CQUVOOzt1QkFBQSxBQUFLLFFBQUwsQUFBYSxJQUFJLEtBQWpCLEFBQXNCLGdCQUFnQixLQUFBLEFBQUssT0FBTyxxQkFBQSxBQUFLLEUsQUFBdkQsQUFBc0Msb0NBRXJDOztBLHFLQUdUOzs7Ozs7Ozs7Ozt1QkFRc0IsQUFBSyxRQUFMLEFBQWEsSUFBSSxLLEFBQWpCLEFBQXNCLGVBQXRCLFMsQUFBZCwrQ0FDQztBLDBKQUdUOzs7Ozs7Ozs7b1dBT3FCO0FBQ25CO2FBQU8sQ0FBQyxDQUFDLElBQUksS0FBTCxBQUFLLEFBQUssWUFBWCxBQUF1QixTQUF2QixBQUFnQyxTQUF2QyxBQUFPLEFBQXlDLEFBQ2pEO0FBRUQ7Ozs7Ozs7OztxREFRWTtBLFVBQW9CLEFBQzlCO1VBQU0sdUJBQU4sQUFBTSxBQUFlLEFBQ3JCO2NBQUEsQUFBUSxZQUFZLEtBQXBCLEFBQW9CLEFBQUssQUFDekI7Y0FBQSxBQUFRLE1BQU0sS0FBZCxBQUFjLEFBQUssQUFDbkI7YUFBQSxBQUFPLEFBQ1I7QUFFRDs7Ozs7Ozs7O3FEQVFZO0EsV0FBZ0IsYUFDMUI7VUFBTSxhQUFhLFNBQWIsQUFBYSxXQUFBLEFBQUMsUUFBRCxBQUFrQixLQUFzQixBQUN6RDtZQUFJLE1BQUEsQUFBSyxPQUFMLEFBQVksSUFBWixBQUFnQixpQkFBcEIsQUFBcUMsUUFBUSxBQUMzQztpQkFBTyxPQUFBLEFBQU8sT0FBTyxNQUFBLEFBQU0sS0FBTixBQUFXLFlBQWhDLEFBQU8sQUFDUjtBQUNEO2VBQU8sT0FBQSxBQUFPLE9BQU8sTUFBQSxBQUFNLEtBQU4sQUFBVyxZQUFoQyxBQUFPLEFBQ1I7QUFMRCxBQU9BOzthQUFPLFdBQUEsQUFBVyxLQUFsQixBQUFPLEFBQWdCLEFBQ3hCO0FBRUQ7Ozs7Ozs7O2dTQVFROztBLHdCQUFnQixLQUFBLEFBQUssT0FBTCxBQUFZLEksQUFBWixBQUFnQjt1QixBQUNSLEFBQUssS0FBTCxvRCxBQUF4Qix1QixBQUFvQyw2Q0FDbkM7a0JBQUUsVUFBVSxDQUFWLEFBQVcsS0FBSyxRQUFRLE0sQUFBMUIsQUFBZ0MsMEpBR3pDOzs7Ozs7Ozs7O21oQkFRWTtBO3VCQUNKLEFBQUssUUFBTCxBQUFhLE0sQUFBYixBQUFtQixRQUFuQixnTSxBQTlNVzs7Ozs7Ozs7Ozs7Ozs7OztBLEFDQ0wsYyxBQUFBOzs7Ozs7Ozs7Ozs7O0EsQUFhQSxZLEFBQUE7Ozs7Ozs7Ozs7OztBLEFBWUEsYSxBQUFBOzs7Ozs7Ozs7Ozs7QSxBQVlBLHVCLEFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QSxBQW1CQSxpQixBQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0EsQUFnQkEsTyxBQUFBOzs7Ozs7Ozs7Ozs7O0EsQUFhQSxPLEFBQUEsTSxBQS9GaEIsOENBRUE7Ozs7Ozs7OERBUU8sU0FBQSxBQUFTLFlBQVQsQUFBcUIsTUFBckIsQUFBcUMsTUFBdUIsQ0FDakUsT0FBTyxPQUFBLEFBQU8sVUFBUCxBQUFpQixlQUFqQixBQUFnQyxLQUFoQyxBQUFxQyxNQUE1QyxBQUFPLEFBQTJDLEFBQ25ELE0sRUFFRDs7Ozs7Ozs7NkpBU08sU0FBQSxBQUFTLFVBQVQsQUFBbUIsVUFBbkIsQUFBa0MsUUFBeUIsQ0FDaEUsT0FBTyxvQkFBQSxBQUFvQixVQUFVLFVBQXJDLEFBQStDLEFBQ2hELFMsRUFFRDs7Ozs7OztnUUFRTyxTQUFBLEFBQVMsV0FBVCxBQUFvQixNQUF5QixDQUNsRCxPQUFPLGdCQUFQLEFBQXVCLEFBQ3hCLFMsRUFFRDs7Ozs7OztnVUFRTyxTQUFBLEFBQVMscUJBQVQsQUFBOEIsTUFBc0IsQ0FDekQsSUFBTSxhQUFhLE1BQUEsQUFBTSxRQUFOLEFBQWMsUUFBZCxBQUFzQixPQUFPLENBQUEsQUFBQyxXQUFqRCxBQUFnRCxBQUFZLFVBQzVELElBQU0sVUFBTixBQUFnQixHQUVoQixXQUFBLEFBQVcsUUFBUSxVQUFBLEFBQUMsR0FBTSxDQUN4QixRQUFBLEFBQVEsS0FBSyxZQUFBLEFBQVksTUFBWixBQUFrQixPQUFsQixBQUF5QixTQUFTLEtBQUEsQUFBSyxPQUFwRCxBQUEyRCxBQUM1RCxPQUZELEdBSUEsT0FBTyxFQUFFLFFBQUEsQUFBUSxRQUFSLEFBQWdCLFNBQVMsQ0FBbEMsQUFBTyxBQUE0QixBQUNwQyxHLEVBRUQ7Ozs7Ozs7MmtCQVFPLFNBQUEsQUFBUyxlQUFULEFBQXdCLE1BQXNCLENBQ25ELElBQUksQ0FBQyxxQkFBQSxBQUFxQixLQUFLLENBQTFCLEFBQTBCLEFBQUMsV0FBaEMsQUFBSyxBQUFzQyxPQUFPLENBQ2hELE9BQUEsQUFBTyxBQUNSLE1BQ0QsUUFBTyxLQUFBLEFBQUssUUFBWixBQUFvQixBQUNyQixLLEVBRUQ7Ozs7Ozs7O3lzQkFTTyxTQUFBLEFBQVMsS0FBVCxBQUFjLEdBQWQsQUFBd0IsR0FBZSxDQUM1QyxPQUFPLEVBQUEsQUFBRSxZQUFZLEVBQXJCLEFBQXVCLEFBQ3hCLFUsRUFFRDs7Ozs7Ozs7b3dCQVNPLFNBQUEsQUFBUyxLQUFULEFBQWMsR0FBZCxBQUF3QixHQUFlLENBQzVDLE9BQU8sRUFBQSxBQUFFLFlBQVksRUFBckIsQUFBdUIsQUFDeEIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJyZWdlbmVyYXRvci1ydW50aW1lXCIpO1xuIiwiLyoqXG4gKiBHbG9iYWwgTmFtZXNcbiAqL1xuXG52YXIgZ2xvYmFscyA9IC9cXGIoQXJyYXl8RGF0ZXxPYmplY3R8TWF0aHxKU09OKVxcYi9nO1xuXG4vKipcbiAqIFJldHVybiBpbW1lZGlhdGUgaWRlbnRpZmllcnMgcGFyc2VkIGZyb20gYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtTdHJpbmd8RnVuY3Rpb259IG1hcCBmdW5jdGlvbiBvciBwcmVmaXhcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHN0ciwgZm4pe1xuICB2YXIgcCA9IHVuaXF1ZShwcm9wcyhzdHIpKTtcbiAgaWYgKGZuICYmICdzdHJpbmcnID09IHR5cGVvZiBmbikgZm4gPSBwcmVmaXhlZChmbik7XG4gIGlmIChmbikgcmV0dXJuIG1hcChzdHIsIHAsIGZuKTtcbiAgcmV0dXJuIHA7XG59O1xuXG4vKipcbiAqIFJldHVybiBpbW1lZGlhdGUgaWRlbnRpZmllcnMgaW4gYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwcm9wcyhzdHIpIHtcbiAgcmV0dXJuIHN0clxuICAgIC5yZXBsYWNlKC9cXC5cXHcrfFxcdysgKlxcKHxcIlteXCJdKlwifCdbXiddKid8XFwvKFteL10rKVxcLy9nLCAnJylcbiAgICAucmVwbGFjZShnbG9iYWxzLCAnJylcbiAgICAubWF0Y2goL1thLXpBLVpfXVxcdyovZylcbiAgICB8fCBbXTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gYHN0cmAgd2l0aCBgcHJvcHNgIG1hcHBlZCB3aXRoIGBmbmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtBcnJheX0gcHJvcHNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBtYXAoc3RyLCBwcm9wcywgZm4pIHtcbiAgdmFyIHJlID0gL1xcLlxcdyt8XFx3KyAqXFwofFwiW15cIl0qXCJ8J1teJ10qJ3xcXC8oW14vXSspXFwvfFthLXpBLVpfXVxcdyovZztcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKHJlLCBmdW5jdGlvbihfKXtcbiAgICBpZiAoJygnID09IF9bXy5sZW5ndGggLSAxXSkgcmV0dXJuIGZuKF8pO1xuICAgIGlmICghfnByb3BzLmluZGV4T2YoXykpIHJldHVybiBfO1xuICAgIHJldHVybiBmbihfKTtcbiAgfSk7XG59XG5cbi8qKlxuICogUmV0dXJuIHVuaXF1ZSBhcnJheS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gdW5pcXVlKGFycikge1xuICB2YXIgcmV0ID0gW107XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAofnJldC5pbmRleE9mKGFycltpXSkpIGNvbnRpbnVlO1xuICAgIHJldC5wdXNoKGFycltpXSk7XG4gIH1cblxuICByZXR1cm4gcmV0O1xufVxuXG4vKipcbiAqIE1hcCB3aXRoIHByZWZpeCBgc3RyYC5cbiAqL1xuXG5mdW5jdGlvbiBwcmVmaXhlZChzdHIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKF8pe1xuICAgIHJldHVybiBzdHIgKyBfO1xuICB9O1xufVxuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIHRvRnVuY3Rpb24gPSByZXF1aXJlKCd0by1mdW5jdGlvbicpO1xuXG4vKipcbiAqIEdyb3VwIGBhcnJgIHdpdGggY2FsbGJhY2sgYGZuKHZhbCwgaSlgLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFyclxuICogQHBhcmFtIHtGdW5jdGlvbnxTdHJpbmd9IGZuIG9yIHByb3BcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFyciwgZm4pe1xuICB2YXIgcmV0ID0ge307XG4gIHZhciBwcm9wO1xuICBmbiA9IHRvRnVuY3Rpb24oZm4pO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgKytpKSB7XG4gICAgcHJvcCA9IGZuKGFycltpXSwgaSk7XG4gICAgcmV0W3Byb3BdID0gcmV0W3Byb3BdIHx8IFtdO1xuICAgIHJldFtwcm9wXS5wdXNoKGFycltpXSk7XG4gIH1cblxuICByZXR1cm4gcmV0O1xufTsiLCIvKiFcbiAgICBsb2NhbEZvcmFnZSAtLSBPZmZsaW5lIFN0b3JhZ2UsIEltcHJvdmVkXG4gICAgVmVyc2lvbiAxLjcuMVxuICAgIGh0dHBzOi8vbG9jYWxmb3JhZ2UuZ2l0aHViLmlvL2xvY2FsRm9yYWdlXG4gICAgKGMpIDIwMTMtMjAxNyBNb3ppbGxhLCBBcGFjaGUgTGljZW5zZSAyLjBcbiovXG4oZnVuY3Rpb24oZil7aWYodHlwZW9mIGV4cG9ydHM9PT1cIm9iamVjdFwiJiZ0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIil7bW9kdWxlLmV4cG9ydHM9ZigpfWVsc2UgaWYodHlwZW9mIGRlZmluZT09PVwiZnVuY3Rpb25cIiYmZGVmaW5lLmFtZCl7ZGVmaW5lKFtdLGYpfWVsc2V7dmFyIGc7aWYodHlwZW9mIHdpbmRvdyE9PVwidW5kZWZpbmVkXCIpe2c9d2luZG93fWVsc2UgaWYodHlwZW9mIGdsb2JhbCE9PVwidW5kZWZpbmVkXCIpe2c9Z2xvYmFsfWVsc2UgaWYodHlwZW9mIHNlbGYhPT1cInVuZGVmaW5lZFwiKXtnPXNlbGZ9ZWxzZXtnPXRoaXN9Zy5sb2NhbGZvcmFnZSA9IGYoKX19KShmdW5jdGlvbigpe3ZhciBkZWZpbmUsbW9kdWxlLGV4cG9ydHM7cmV0dXJuIChmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyAoZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLCBmKX12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pKHsxOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcbihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcbnZhciBNdXRhdGlvbiA9IGdsb2JhbC5NdXRhdGlvbk9ic2VydmVyIHx8IGdsb2JhbC5XZWJLaXRNdXRhdGlvbk9ic2VydmVyO1xuXG52YXIgc2NoZWR1bGVEcmFpbjtcblxue1xuICBpZiAoTXV0YXRpb24pIHtcbiAgICB2YXIgY2FsbGVkID0gMDtcbiAgICB2YXIgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb24obmV4dFRpY2spO1xuICAgIHZhciBlbGVtZW50ID0gZ2xvYmFsLmRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKTtcbiAgICBvYnNlcnZlci5vYnNlcnZlKGVsZW1lbnQsIHtcbiAgICAgIGNoYXJhY3RlckRhdGE6IHRydWVcbiAgICB9KTtcbiAgICBzY2hlZHVsZURyYWluID0gZnVuY3Rpb24gKCkge1xuICAgICAgZWxlbWVudC5kYXRhID0gKGNhbGxlZCA9ICsrY2FsbGVkICUgMik7XG4gICAgfTtcbiAgfSBlbHNlIGlmICghZ2xvYmFsLnNldEltbWVkaWF0ZSAmJiB0eXBlb2YgZ2xvYmFsLk1lc3NhZ2VDaGFubmVsICE9PSAndW5kZWZpbmVkJykge1xuICAgIHZhciBjaGFubmVsID0gbmV3IGdsb2JhbC5NZXNzYWdlQ2hhbm5lbCgpO1xuICAgIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gbmV4dFRpY2s7XG4gICAgc2NoZWR1bGVEcmFpbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNoYW5uZWwucG9ydDIucG9zdE1lc3NhZ2UoMCk7XG4gICAgfTtcbiAgfSBlbHNlIGlmICgnZG9jdW1lbnQnIGluIGdsb2JhbCAmJiAnb25yZWFkeXN0YXRlY2hhbmdlJyBpbiBnbG9iYWwuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0JykpIHtcbiAgICBzY2hlZHVsZURyYWluID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAvLyBDcmVhdGUgYSA8c2NyaXB0PiBlbGVtZW50OyBpdHMgcmVhZHlzdGF0ZWNoYW5nZSBldmVudCB3aWxsIGJlIGZpcmVkIGFzeW5jaHJvbm91c2x5IG9uY2UgaXQgaXMgaW5zZXJ0ZWRcbiAgICAgIC8vIGludG8gdGhlIGRvY3VtZW50LiBEbyBzbywgdGh1cyBxdWV1aW5nIHVwIHRoZSB0YXNrLiBSZW1lbWJlciB0byBjbGVhbiB1cCBvbmNlIGl0J3MgYmVlbiBjYWxsZWQuXG4gICAgICB2YXIgc2NyaXB0RWwgPSBnbG9iYWwuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICBzY3JpcHRFbC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIG5leHRUaWNrKCk7XG5cbiAgICAgICAgc2NyaXB0RWwub25yZWFkeXN0YXRlY2hhbmdlID0gbnVsbDtcbiAgICAgICAgc2NyaXB0RWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzY3JpcHRFbCk7XG4gICAgICAgIHNjcmlwdEVsID0gbnVsbDtcbiAgICAgIH07XG4gICAgICBnbG9iYWwuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmFwcGVuZENoaWxkKHNjcmlwdEVsKTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHNjaGVkdWxlRHJhaW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICBzZXRUaW1lb3V0KG5leHRUaWNrLCAwKTtcbiAgICB9O1xuICB9XG59XG5cbnZhciBkcmFpbmluZztcbnZhciBxdWV1ZSA9IFtdO1xuLy9uYW1lZCBuZXh0VGljayBmb3IgbGVzcyBjb25mdXNpbmcgc3RhY2sgdHJhY2VzXG5mdW5jdGlvbiBuZXh0VGljaygpIHtcbiAgZHJhaW5pbmcgPSB0cnVlO1xuICB2YXIgaSwgb2xkUXVldWU7XG4gIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gIHdoaWxlIChsZW4pIHtcbiAgICBvbGRRdWV1ZSA9IHF1ZXVlO1xuICAgIHF1ZXVlID0gW107XG4gICAgaSA9IC0xO1xuICAgIHdoaWxlICgrK2kgPCBsZW4pIHtcbiAgICAgIG9sZFF1ZXVlW2ldKCk7XG4gICAgfVxuICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgfVxuICBkcmFpbmluZyA9IGZhbHNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGltbWVkaWF0ZTtcbmZ1bmN0aW9uIGltbWVkaWF0ZSh0YXNrKSB7XG4gIGlmIChxdWV1ZS5wdXNoKHRhc2spID09PSAxICYmICFkcmFpbmluZykge1xuICAgIHNjaGVkdWxlRHJhaW4oKTtcbiAgfVxufVxuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSlcbn0se31dLDI6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuJ3VzZSBzdHJpY3QnO1xudmFyIGltbWVkaWF0ZSA9IF9kZXJlcV8oMSk7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5mdW5jdGlvbiBJTlRFUk5BTCgpIHt9XG5cbnZhciBoYW5kbGVycyA9IHt9O1xuXG52YXIgUkVKRUNURUQgPSBbJ1JFSkVDVEVEJ107XG52YXIgRlVMRklMTEVEID0gWydGVUxGSUxMRUQnXTtcbnZhciBQRU5ESU5HID0gWydQRU5ESU5HJ107XG5cbm1vZHVsZS5leHBvcnRzID0gUHJvbWlzZTtcblxuZnVuY3Rpb24gUHJvbWlzZShyZXNvbHZlcikge1xuICBpZiAodHlwZW9mIHJlc29sdmVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcigncmVzb2x2ZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gIH1cbiAgdGhpcy5zdGF0ZSA9IFBFTkRJTkc7XG4gIHRoaXMucXVldWUgPSBbXTtcbiAgdGhpcy5vdXRjb21lID0gdm9pZCAwO1xuICBpZiAocmVzb2x2ZXIgIT09IElOVEVSTkFMKSB7XG4gICAgc2FmZWx5UmVzb2x2ZVRoZW5hYmxlKHRoaXMsIHJlc29sdmVyKTtcbiAgfVxufVxuXG5Qcm9taXNlLnByb3RvdHlwZVtcImNhdGNoXCJdID0gZnVuY3Rpb24gKG9uUmVqZWN0ZWQpIHtcbiAgcmV0dXJuIHRoaXMudGhlbihudWxsLCBvblJlamVjdGVkKTtcbn07XG5Qcm9taXNlLnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24gKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKSB7XG4gIGlmICh0eXBlb2Ygb25GdWxmaWxsZWQgIT09ICdmdW5jdGlvbicgJiYgdGhpcy5zdGF0ZSA9PT0gRlVMRklMTEVEIHx8XG4gICAgdHlwZW9mIG9uUmVqZWN0ZWQgIT09ICdmdW5jdGlvbicgJiYgdGhpcy5zdGF0ZSA9PT0gUkVKRUNURUQpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICB2YXIgcHJvbWlzZSA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKElOVEVSTkFMKTtcbiAgaWYgKHRoaXMuc3RhdGUgIT09IFBFTkRJTkcpIHtcbiAgICB2YXIgcmVzb2x2ZXIgPSB0aGlzLnN0YXRlID09PSBGVUxGSUxMRUQgPyBvbkZ1bGZpbGxlZCA6IG9uUmVqZWN0ZWQ7XG4gICAgdW53cmFwKHByb21pc2UsIHJlc29sdmVyLCB0aGlzLm91dGNvbWUpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMucXVldWUucHVzaChuZXcgUXVldWVJdGVtKHByb21pc2UsIG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKSk7XG4gIH1cblxuICByZXR1cm4gcHJvbWlzZTtcbn07XG5mdW5jdGlvbiBRdWV1ZUl0ZW0ocHJvbWlzZSwgb25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpIHtcbiAgdGhpcy5wcm9taXNlID0gcHJvbWlzZTtcbiAgaWYgKHR5cGVvZiBvbkZ1bGZpbGxlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHRoaXMub25GdWxmaWxsZWQgPSBvbkZ1bGZpbGxlZDtcbiAgICB0aGlzLmNhbGxGdWxmaWxsZWQgPSB0aGlzLm90aGVyQ2FsbEZ1bGZpbGxlZDtcbiAgfVxuICBpZiAodHlwZW9mIG9uUmVqZWN0ZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICB0aGlzLm9uUmVqZWN0ZWQgPSBvblJlamVjdGVkO1xuICAgIHRoaXMuY2FsbFJlamVjdGVkID0gdGhpcy5vdGhlckNhbGxSZWplY3RlZDtcbiAgfVxufVxuUXVldWVJdGVtLnByb3RvdHlwZS5jYWxsRnVsZmlsbGVkID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIGhhbmRsZXJzLnJlc29sdmUodGhpcy5wcm9taXNlLCB2YWx1ZSk7XG59O1xuUXVldWVJdGVtLnByb3RvdHlwZS5vdGhlckNhbGxGdWxmaWxsZWQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgdW53cmFwKHRoaXMucHJvbWlzZSwgdGhpcy5vbkZ1bGZpbGxlZCwgdmFsdWUpO1xufTtcblF1ZXVlSXRlbS5wcm90b3R5cGUuY2FsbFJlamVjdGVkID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIGhhbmRsZXJzLnJlamVjdCh0aGlzLnByb21pc2UsIHZhbHVlKTtcbn07XG5RdWV1ZUl0ZW0ucHJvdG90eXBlLm90aGVyQ2FsbFJlamVjdGVkID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHVud3JhcCh0aGlzLnByb21pc2UsIHRoaXMub25SZWplY3RlZCwgdmFsdWUpO1xufTtcblxuZnVuY3Rpb24gdW53cmFwKHByb21pc2UsIGZ1bmMsIHZhbHVlKSB7XG4gIGltbWVkaWF0ZShmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJldHVyblZhbHVlO1xuICAgIHRyeSB7XG4gICAgICByZXR1cm5WYWx1ZSA9IGZ1bmModmFsdWUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBoYW5kbGVycy5yZWplY3QocHJvbWlzZSwgZSk7XG4gICAgfVxuICAgIGlmIChyZXR1cm5WYWx1ZSA9PT0gcHJvbWlzZSkge1xuICAgICAgaGFuZGxlcnMucmVqZWN0KHByb21pc2UsIG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCByZXNvbHZlIHByb21pc2Ugd2l0aCBpdHNlbGYnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGhhbmRsZXJzLnJlc29sdmUocHJvbWlzZSwgcmV0dXJuVmFsdWUpO1xuICAgIH1cbiAgfSk7XG59XG5cbmhhbmRsZXJzLnJlc29sdmUgPSBmdW5jdGlvbiAoc2VsZiwgdmFsdWUpIHtcbiAgdmFyIHJlc3VsdCA9IHRyeUNhdGNoKGdldFRoZW4sIHZhbHVlKTtcbiAgaWYgKHJlc3VsdC5zdGF0dXMgPT09ICdlcnJvcicpIHtcbiAgICByZXR1cm4gaGFuZGxlcnMucmVqZWN0KHNlbGYsIHJlc3VsdC52YWx1ZSk7XG4gIH1cbiAgdmFyIHRoZW5hYmxlID0gcmVzdWx0LnZhbHVlO1xuXG4gIGlmICh0aGVuYWJsZSkge1xuICAgIHNhZmVseVJlc29sdmVUaGVuYWJsZShzZWxmLCB0aGVuYWJsZSk7XG4gIH0gZWxzZSB7XG4gICAgc2VsZi5zdGF0ZSA9IEZVTEZJTExFRDtcbiAgICBzZWxmLm91dGNvbWUgPSB2YWx1ZTtcbiAgICB2YXIgaSA9IC0xO1xuICAgIHZhciBsZW4gPSBzZWxmLnF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZSAoKytpIDwgbGVuKSB7XG4gICAgICBzZWxmLnF1ZXVlW2ldLmNhbGxGdWxmaWxsZWQodmFsdWUpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc2VsZjtcbn07XG5oYW5kbGVycy5yZWplY3QgPSBmdW5jdGlvbiAoc2VsZiwgZXJyb3IpIHtcbiAgc2VsZi5zdGF0ZSA9IFJFSkVDVEVEO1xuICBzZWxmLm91dGNvbWUgPSBlcnJvcjtcbiAgdmFyIGkgPSAtMTtcbiAgdmFyIGxlbiA9IHNlbGYucXVldWUubGVuZ3RoO1xuICB3aGlsZSAoKytpIDwgbGVuKSB7XG4gICAgc2VsZi5xdWV1ZVtpXS5jYWxsUmVqZWN0ZWQoZXJyb3IpO1xuICB9XG4gIHJldHVybiBzZWxmO1xufTtcblxuZnVuY3Rpb24gZ2V0VGhlbihvYmopIHtcbiAgLy8gTWFrZSBzdXJlIHdlIG9ubHkgYWNjZXNzIHRoZSBhY2Nlc3NvciBvbmNlIGFzIHJlcXVpcmVkIGJ5IHRoZSBzcGVjXG4gIHZhciB0aGVuID0gb2JqICYmIG9iai50aGVuO1xuICBpZiAob2JqICYmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyB8fCB0eXBlb2Ygb2JqID09PSAnZnVuY3Rpb24nKSAmJiB0eXBlb2YgdGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBmdW5jdGlvbiBhcHB5VGhlbigpIHtcbiAgICAgIHRoZW4uYXBwbHkob2JqLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cbn1cblxuZnVuY3Rpb24gc2FmZWx5UmVzb2x2ZVRoZW5hYmxlKHNlbGYsIHRoZW5hYmxlKSB7XG4gIC8vIEVpdGhlciBmdWxmaWxsLCByZWplY3Qgb3IgcmVqZWN0IHdpdGggZXJyb3JcbiAgdmFyIGNhbGxlZCA9IGZhbHNlO1xuICBmdW5jdGlvbiBvbkVycm9yKHZhbHVlKSB7XG4gICAgaWYgKGNhbGxlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjYWxsZWQgPSB0cnVlO1xuICAgIGhhbmRsZXJzLnJlamVjdChzZWxmLCB2YWx1ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBvblN1Y2Nlc3ModmFsdWUpIHtcbiAgICBpZiAoY2FsbGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNhbGxlZCA9IHRydWU7XG4gICAgaGFuZGxlcnMucmVzb2x2ZShzZWxmLCB2YWx1ZSk7XG4gIH1cblxuICBmdW5jdGlvbiB0cnlUb1Vud3JhcCgpIHtcbiAgICB0aGVuYWJsZShvblN1Y2Nlc3MsIG9uRXJyb3IpO1xuICB9XG5cbiAgdmFyIHJlc3VsdCA9IHRyeUNhdGNoKHRyeVRvVW53cmFwKTtcbiAgaWYgKHJlc3VsdC5zdGF0dXMgPT09ICdlcnJvcicpIHtcbiAgICBvbkVycm9yKHJlc3VsdC52YWx1ZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdHJ5Q2F0Y2goZnVuYywgdmFsdWUpIHtcbiAgdmFyIG91dCA9IHt9O1xuICB0cnkge1xuICAgIG91dC52YWx1ZSA9IGZ1bmModmFsdWUpO1xuICAgIG91dC5zdGF0dXMgPSAnc3VjY2Vzcyc7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBvdXQuc3RhdHVzID0gJ2Vycm9yJztcbiAgICBvdXQudmFsdWUgPSBlO1xuICB9XG4gIHJldHVybiBvdXQ7XG59XG5cblByb21pc2UucmVzb2x2ZSA9IHJlc29sdmU7XG5mdW5jdGlvbiByZXNvbHZlKHZhbHVlKSB7XG4gIGlmICh2YWx1ZSBpbnN0YW5jZW9mIHRoaXMpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIGhhbmRsZXJzLnJlc29sdmUobmV3IHRoaXMoSU5URVJOQUwpLCB2YWx1ZSk7XG59XG5cblByb21pc2UucmVqZWN0ID0gcmVqZWN0O1xuZnVuY3Rpb24gcmVqZWN0KHJlYXNvbikge1xuICB2YXIgcHJvbWlzZSA9IG5ldyB0aGlzKElOVEVSTkFMKTtcbiAgcmV0dXJuIGhhbmRsZXJzLnJlamVjdChwcm9taXNlLCByZWFzb24pO1xufVxuXG5Qcm9taXNlLmFsbCA9IGFsbDtcbmZ1bmN0aW9uIGFsbChpdGVyYWJsZSkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoaXRlcmFibGUpICE9PSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgcmV0dXJuIHRoaXMucmVqZWN0KG5ldyBUeXBlRXJyb3IoJ211c3QgYmUgYW4gYXJyYXknKSk7XG4gIH1cblxuICB2YXIgbGVuID0gaXRlcmFibGUubGVuZ3RoO1xuICB2YXIgY2FsbGVkID0gZmFsc2U7XG4gIGlmICghbGVuKSB7XG4gICAgcmV0dXJuIHRoaXMucmVzb2x2ZShbXSk7XG4gIH1cblxuICB2YXIgdmFsdWVzID0gbmV3IEFycmF5KGxlbik7XG4gIHZhciByZXNvbHZlZCA9IDA7XG4gIHZhciBpID0gLTE7XG4gIHZhciBwcm9taXNlID0gbmV3IHRoaXMoSU5URVJOQUwpO1xuXG4gIHdoaWxlICgrK2kgPCBsZW4pIHtcbiAgICBhbGxSZXNvbHZlcihpdGVyYWJsZVtpXSwgaSk7XG4gIH1cbiAgcmV0dXJuIHByb21pc2U7XG4gIGZ1bmN0aW9uIGFsbFJlc29sdmVyKHZhbHVlLCBpKSB7XG4gICAgc2VsZi5yZXNvbHZlKHZhbHVlKS50aGVuKHJlc29sdmVGcm9tQWxsLCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgIGlmICghY2FsbGVkKSB7XG4gICAgICAgIGNhbGxlZCA9IHRydWU7XG4gICAgICAgIGhhbmRsZXJzLnJlamVjdChwcm9taXNlLCBlcnJvcik7XG4gICAgICB9XG4gICAgfSk7XG4gICAgZnVuY3Rpb24gcmVzb2x2ZUZyb21BbGwob3V0VmFsdWUpIHtcbiAgICAgIHZhbHVlc1tpXSA9IG91dFZhbHVlO1xuICAgICAgaWYgKCsrcmVzb2x2ZWQgPT09IGxlbiAmJiAhY2FsbGVkKSB7XG4gICAgICAgIGNhbGxlZCA9IHRydWU7XG4gICAgICAgIGhhbmRsZXJzLnJlc29sdmUocHJvbWlzZSwgdmFsdWVzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuUHJvbWlzZS5yYWNlID0gcmFjZTtcbmZ1bmN0aW9uIHJhY2UoaXRlcmFibGUpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGl0ZXJhYmxlKSAhPT0gJ1tvYmplY3QgQXJyYXldJykge1xuICAgIHJldHVybiB0aGlzLnJlamVjdChuZXcgVHlwZUVycm9yKCdtdXN0IGJlIGFuIGFycmF5JykpO1xuICB9XG5cbiAgdmFyIGxlbiA9IGl0ZXJhYmxlLmxlbmd0aDtcbiAgdmFyIGNhbGxlZCA9IGZhbHNlO1xuICBpZiAoIWxlbikge1xuICAgIHJldHVybiB0aGlzLnJlc29sdmUoW10pO1xuICB9XG5cbiAgdmFyIGkgPSAtMTtcbiAgdmFyIHByb21pc2UgPSBuZXcgdGhpcyhJTlRFUk5BTCk7XG5cbiAgd2hpbGUgKCsraSA8IGxlbikge1xuICAgIHJlc29sdmVyKGl0ZXJhYmxlW2ldKTtcbiAgfVxuICByZXR1cm4gcHJvbWlzZTtcbiAgZnVuY3Rpb24gcmVzb2x2ZXIodmFsdWUpIHtcbiAgICBzZWxmLnJlc29sdmUodmFsdWUpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICBpZiAoIWNhbGxlZCkge1xuICAgICAgICBjYWxsZWQgPSB0cnVlO1xuICAgICAgICBoYW5kbGVycy5yZXNvbHZlKHByb21pc2UsIHJlc3BvbnNlKTtcbiAgICAgIH1cbiAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgIGlmICghY2FsbGVkKSB7XG4gICAgICAgIGNhbGxlZCA9IHRydWU7XG4gICAgICAgIGhhbmRsZXJzLnJlamVjdChwcm9taXNlLCBlcnJvcik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cblxufSx7XCIxXCI6MX1dLDM6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuaWYgKHR5cGVvZiBnbG9iYWwuUHJvbWlzZSAhPT0gJ2Z1bmN0aW9uJykge1xuICBnbG9iYWwuUHJvbWlzZSA9IF9kZXJlcV8oMik7XG59XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KVxufSx7XCIyXCI6Mn1dLDQ6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgX3R5cGVvZiA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfSA6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIGdldElEQigpIHtcbiAgICAvKiBnbG9iYWwgaW5kZXhlZERCLHdlYmtpdEluZGV4ZWREQixtb3pJbmRleGVkREIsT0luZGV4ZWREQixtc0luZGV4ZWREQiAqL1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgaW5kZXhlZERCICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmV0dXJuIGluZGV4ZWREQjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHdlYmtpdEluZGV4ZWREQiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHJldHVybiB3ZWJraXRJbmRleGVkREI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBtb3pJbmRleGVkREIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gbW96SW5kZXhlZERCO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgT0luZGV4ZWREQiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHJldHVybiBPSW5kZXhlZERCO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgbXNJbmRleGVkREIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gbXNJbmRleGVkREI7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG59XG5cbnZhciBpZGIgPSBnZXRJREIoKTtcblxuZnVuY3Rpb24gaXNJbmRleGVkREJWYWxpZCgpIHtcbiAgICB0cnkge1xuICAgICAgICAvLyBJbml0aWFsaXplIEluZGV4ZWREQjsgZmFsbCBiYWNrIHRvIHZlbmRvci1wcmVmaXhlZCB2ZXJzaW9uc1xuICAgICAgICAvLyBpZiBuZWVkZWQuXG4gICAgICAgIGlmICghaWRiKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgLy8gV2UgbWltaWMgUG91Y2hEQiBoZXJlO1xuICAgICAgICAvL1xuICAgICAgICAvLyBXZSB0ZXN0IGZvciBvcGVuRGF0YWJhc2UgYmVjYXVzZSBJRSBNb2JpbGUgaWRlbnRpZmllcyBpdHNlbGZcbiAgICAgICAgLy8gYXMgU2FmYXJpLiBPaCB0aGUgbHVsei4uLlxuICAgICAgICB2YXIgaXNTYWZhcmkgPSB0eXBlb2Ygb3BlbkRhdGFiYXNlICE9PSAndW5kZWZpbmVkJyAmJiAvKFNhZmFyaXxpUGhvbmV8aVBhZHxpUG9kKS8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSAmJiAhL0Nocm9tZS8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSAmJiAhL0JsYWNrQmVycnkvLnRlc3QobmF2aWdhdG9yLnBsYXRmb3JtKTtcblxuICAgICAgICB2YXIgaGFzRmV0Y2ggPSB0eXBlb2YgZmV0Y2ggPT09ICdmdW5jdGlvbicgJiYgZmV0Y2gudG9TdHJpbmcoKS5pbmRleE9mKCdbbmF0aXZlIGNvZGUnKSAhPT0gLTE7XG5cbiAgICAgICAgLy8gU2FmYXJpIDwxMC4xIGRvZXMgbm90IG1lZXQgb3VyIHJlcXVpcmVtZW50cyBmb3IgSURCIHN1cHBvcnQgKCM1NTcyKVxuICAgICAgICAvLyBzaW5jZSBTYWZhcmkgMTAuMSBzaGlwcGVkIHdpdGggZmV0Y2gsIHdlIGNhbiB1c2UgdGhhdCB0byBkZXRlY3QgaXRcbiAgICAgICAgcmV0dXJuICghaXNTYWZhcmkgfHwgaGFzRmV0Y2gpICYmIHR5cGVvZiBpbmRleGVkREIgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICAgIC8vIHNvbWUgb3V0ZGF0ZWQgaW1wbGVtZW50YXRpb25zIG9mIElEQiB0aGF0IGFwcGVhciBvbiBTYW1zdW5nXG4gICAgICAgIC8vIGFuZCBIVEMgQW5kcm9pZCBkZXZpY2VzIDw0LjQgYXJlIG1pc3NpbmcgSURCS2V5UmFuZ2VcbiAgICAgICAgLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS9sb2NhbEZvcmFnZS9pc3N1ZXMvMTI4XG4gICAgICAgIC8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL21vemlsbGEvbG9jYWxGb3JhZ2UvaXNzdWVzLzI3MlxuICAgICAgICB0eXBlb2YgSURCS2V5UmFuZ2UgIT09ICd1bmRlZmluZWQnO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuLy8gQWJzdHJhY3RzIGNvbnN0cnVjdGluZyBhIEJsb2Igb2JqZWN0LCBzbyBpdCBhbHNvIHdvcmtzIGluIG9sZGVyXG4vLyBicm93c2VycyB0aGF0IGRvbid0IHN1cHBvcnQgdGhlIG5hdGl2ZSBCbG9iIGNvbnN0cnVjdG9yLiAoaS5lLlxuLy8gb2xkIFF0V2ViS2l0IHZlcnNpb25zLCBhdCBsZWFzdCkuXG4vLyBBYnN0cmFjdHMgY29uc3RydWN0aW5nIGEgQmxvYiBvYmplY3QsIHNvIGl0IGFsc28gd29ya3MgaW4gb2xkZXJcbi8vIGJyb3dzZXJzIHRoYXQgZG9uJ3Qgc3VwcG9ydCB0aGUgbmF0aXZlIEJsb2IgY29uc3RydWN0b3IuIChpLmUuXG4vLyBvbGQgUXRXZWJLaXQgdmVyc2lvbnMsIGF0IGxlYXN0KS5cbmZ1bmN0aW9uIGNyZWF0ZUJsb2IocGFydHMsIHByb3BlcnRpZXMpIHtcbiAgICAvKiBnbG9iYWwgQmxvYkJ1aWxkZXIsTVNCbG9iQnVpbGRlcixNb3pCbG9iQnVpbGRlcixXZWJLaXRCbG9iQnVpbGRlciAqL1xuICAgIHBhcnRzID0gcGFydHMgfHwgW107XG4gICAgcHJvcGVydGllcyA9IHByb3BlcnRpZXMgfHwge307XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIG5ldyBCbG9iKHBhcnRzLCBwcm9wZXJ0aWVzKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChlLm5hbWUgIT09ICdUeXBlRXJyb3InKSB7XG4gICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBCdWlsZGVyID0gdHlwZW9mIEJsb2JCdWlsZGVyICE9PSAndW5kZWZpbmVkJyA/IEJsb2JCdWlsZGVyIDogdHlwZW9mIE1TQmxvYkJ1aWxkZXIgIT09ICd1bmRlZmluZWQnID8gTVNCbG9iQnVpbGRlciA6IHR5cGVvZiBNb3pCbG9iQnVpbGRlciAhPT0gJ3VuZGVmaW5lZCcgPyBNb3pCbG9iQnVpbGRlciA6IFdlYktpdEJsb2JCdWlsZGVyO1xuICAgICAgICB2YXIgYnVpbGRlciA9IG5ldyBCdWlsZGVyKCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGJ1aWxkZXIuYXBwZW5kKHBhcnRzW2ldKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYnVpbGRlci5nZXRCbG9iKHByb3BlcnRpZXMudHlwZSk7XG4gICAgfVxufVxuXG4vLyBUaGlzIGlzIENvbW1vbkpTIGJlY2F1c2UgbGllIGlzIGFuIGV4dGVybmFsIGRlcGVuZGVuY3ksIHNvIFJvbGx1cFxuLy8gY2FuIGp1c3QgaWdub3JlIGl0LlxuaWYgKHR5cGVvZiBQcm9taXNlID09PSAndW5kZWZpbmVkJykge1xuICAgIC8vIEluIHRoZSBcIm5vcHJvbWlzZXNcIiBidWlsZCB0aGlzIHdpbGwganVzdCB0aHJvdyBpZiB5b3UgZG9uJ3QgaGF2ZVxuICAgIC8vIGEgZ2xvYmFsIHByb21pc2Ugb2JqZWN0LCBidXQgaXQgd291bGQgdGhyb3cgYW55d2F5IGxhdGVyLlxuICAgIF9kZXJlcV8oMyk7XG59XG52YXIgUHJvbWlzZSQxID0gUHJvbWlzZTtcblxuZnVuY3Rpb24gZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKSB7XG4gICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIHByb21pc2UudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXN1bHQpO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVycm9yKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBleGVjdXRlVHdvQ2FsbGJhY2tzKHByb21pc2UsIGNhbGxiYWNrLCBlcnJvckNhbGxiYWNrKSB7XG4gICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBwcm9taXNlLnRoZW4oY2FsbGJhY2spO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZXJyb3JDYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBwcm9taXNlW1wiY2F0Y2hcIl0oZXJyb3JDYWxsYmFjayk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBub3JtYWxpemVLZXkoa2V5KSB7XG4gICAgLy8gQ2FzdCB0aGUga2V5IHRvIGEgc3RyaW5nLCBhcyB0aGF0J3MgYWxsIHdlIGNhbiBzZXQgYXMgYSBrZXkuXG4gICAgaWYgKHR5cGVvZiBrZXkgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihrZXkgKyAnIHVzZWQgYXMgYSBrZXksIGJ1dCBpdCBpcyBub3QgYSBzdHJpbmcuJyk7XG4gICAgICAgIGtleSA9IFN0cmluZyhrZXkpO1xuICAgIH1cblxuICAgIHJldHVybiBrZXk7XG59XG5cbmZ1bmN0aW9uIGdldENhbGxiYWNrKCkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoICYmIHR5cGVvZiBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aCAtIDFdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aCAtIDFdO1xuICAgIH1cbn1cblxuLy8gU29tZSBjb2RlIG9yaWdpbmFsbHkgZnJvbSBhc3luY19zdG9yYWdlLmpzIGluXG4vLyBbR2FpYV0oaHR0cHM6Ly9naXRodWIuY29tL21vemlsbGEtYjJnL2dhaWEpLlxuXG52YXIgREVURUNUX0JMT0JfU1VQUE9SVF9TVE9SRSA9ICdsb2NhbC1mb3JhZ2UtZGV0ZWN0LWJsb2Itc3VwcG9ydCc7XG52YXIgc3VwcG9ydHNCbG9icyA9IHZvaWQgMDtcbnZhciBkYkNvbnRleHRzID0ge307XG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vLyBUcmFuc2FjdGlvbiBNb2Rlc1xudmFyIFJFQURfT05MWSA9ICdyZWFkb25seSc7XG52YXIgUkVBRF9XUklURSA9ICdyZWFkd3JpdGUnO1xuXG4vLyBUcmFuc2Zvcm0gYSBiaW5hcnkgc3RyaW5nIHRvIGFuIGFycmF5IGJ1ZmZlciwgYmVjYXVzZSBvdGhlcndpc2Vcbi8vIHdlaXJkIHN0dWZmIGhhcHBlbnMgd2hlbiB5b3UgdHJ5IHRvIHdvcmsgd2l0aCB0aGUgYmluYXJ5IHN0cmluZyBkaXJlY3RseS5cbi8vIEl0IGlzIGtub3duLlxuLy8gRnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE0OTY3NjQ3LyAoY29udGludWVzIG9uIG5leHQgbGluZSlcbi8vIGVuY29kZS1kZWNvZGUtaW1hZ2Utd2l0aC1iYXNlNjQtYnJlYWtzLWltYWdlICgyMDEzLTA0LTIxKVxuZnVuY3Rpb24gX2JpblN0cmluZ1RvQXJyYXlCdWZmZXIoYmluKSB7XG4gICAgdmFyIGxlbmd0aCA9IGJpbi5sZW5ndGg7XG4gICAgdmFyIGJ1ZiA9IG5ldyBBcnJheUJ1ZmZlcihsZW5ndGgpO1xuICAgIHZhciBhcnIgPSBuZXcgVWludDhBcnJheShidWYpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYXJyW2ldID0gYmluLmNoYXJDb2RlQXQoaSk7XG4gICAgfVxuICAgIHJldHVybiBidWY7XG59XG5cbi8vXG4vLyBCbG9icyBhcmUgbm90IHN1cHBvcnRlZCBpbiBhbGwgdmVyc2lvbnMgb2YgSW5kZXhlZERCLCBub3RhYmx5XG4vLyBDaHJvbWUgPDM3IGFuZCBBbmRyb2lkIDw1LiBJbiB0aG9zZSB2ZXJzaW9ucywgc3RvcmluZyBhIGJsb2Igd2lsbCB0aHJvdy5cbi8vXG4vLyBWYXJpb3VzIG90aGVyIGJsb2IgYnVncyBleGlzdCBpbiBDaHJvbWUgdjM3LTQyIChpbmNsdXNpdmUpLlxuLy8gRGV0ZWN0aW5nIHRoZW0gaXMgZXhwZW5zaXZlIGFuZCBjb25mdXNpbmcgdG8gdXNlcnMsIGFuZCBDaHJvbWUgMzctNDJcbi8vIGlzIGF0IHZlcnkgbG93IHVzYWdlIHdvcmxkd2lkZSwgc28gd2UgZG8gYSBoYWNreSB1c2VyQWdlbnQgY2hlY2sgaW5zdGVhZC5cbi8vXG4vLyBjb250ZW50LXR5cGUgYnVnOiBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9NDA4MTIwXG4vLyA0MDQgYnVnOiBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9NDQ3OTE2XG4vLyBGaWxlUmVhZGVyIGJ1ZzogaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTQ0NzgzNlxuLy9cbi8vIENvZGUgYm9ycm93ZWQgZnJvbSBQb3VjaERCLiBTZWU6XG4vLyBodHRwczovL2dpdGh1Yi5jb20vcG91Y2hkYi9wb3VjaGRiL2Jsb2IvbWFzdGVyL3BhY2thZ2VzL25vZGVfbW9kdWxlcy9wb3VjaGRiLWFkYXB0ZXItaWRiL3NyYy9ibG9iU3VwcG9ydC5qc1xuLy9cbmZ1bmN0aW9uIF9jaGVja0Jsb2JTdXBwb3J0V2l0aG91dENhY2hpbmcoaWRiKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICAgICAgdmFyIHR4biA9IGlkYi50cmFuc2FjdGlvbihERVRFQ1RfQkxPQl9TVVBQT1JUX1NUT1JFLCBSRUFEX1dSSVRFKTtcbiAgICAgICAgdmFyIGJsb2IgPSBjcmVhdGVCbG9iKFsnJ10pO1xuICAgICAgICB0eG4ub2JqZWN0U3RvcmUoREVURUNUX0JMT0JfU1VQUE9SVF9TVE9SRSkucHV0KGJsb2IsICdrZXknKTtcblxuICAgICAgICB0eG4ub25hYm9ydCA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGUgdHJhbnNhY3Rpb24gYWJvcnRzIG5vdyBpdHMgZHVlIHRvIG5vdCBiZWluZyBhYmxlIHRvXG4gICAgICAgICAgICAvLyB3cml0ZSB0byB0aGUgZGF0YWJhc2UsIGxpa2VseSBkdWUgdG8gdGhlIGRpc2sgYmVpbmcgZnVsbFxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHR4bi5vbmNvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG1hdGNoZWRDaHJvbWUgPSBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9DaHJvbWVcXC8oXFxkKykvKTtcbiAgICAgICAgICAgIHZhciBtYXRjaGVkRWRnZSA9IG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL0VkZ2VcXC8vKTtcbiAgICAgICAgICAgIC8vIE1TIEVkZ2UgcHJldGVuZHMgdG8gYmUgQ2hyb21lIDQyOlxuICAgICAgICAgICAgLy8gaHR0cHM6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9oaDg2OTMwMSUyOHY9dnMuODUlMjkuYXNweFxuICAgICAgICAgICAgcmVzb2x2ZShtYXRjaGVkRWRnZSB8fCAhbWF0Y2hlZENocm9tZSB8fCBwYXJzZUludChtYXRjaGVkQ2hyb21lWzFdLCAxMCkgPj0gNDMpO1xuICAgICAgICB9O1xuICAgIH0pW1wiY2F0Y2hcIl0oZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7IC8vIGVycm9yLCBzbyBhc3N1bWUgdW5zdXBwb3J0ZWRcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gX2NoZWNrQmxvYlN1cHBvcnQoaWRiKSB7XG4gICAgaWYgKHR5cGVvZiBzdXBwb3J0c0Jsb2JzID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UkMS5yZXNvbHZlKHN1cHBvcnRzQmxvYnMpO1xuICAgIH1cbiAgICByZXR1cm4gX2NoZWNrQmxvYlN1cHBvcnRXaXRob3V0Q2FjaGluZyhpZGIpLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHN1cHBvcnRzQmxvYnMgPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHN1cHBvcnRzQmxvYnM7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIF9kZWZlclJlYWRpbmVzcyhkYkluZm8pIHtcbiAgICB2YXIgZGJDb250ZXh0ID0gZGJDb250ZXh0c1tkYkluZm8ubmFtZV07XG5cbiAgICAvLyBDcmVhdGUgYSBkZWZlcnJlZCBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBjdXJyZW50IGRhdGFiYXNlIG9wZXJhdGlvbi5cbiAgICB2YXIgZGVmZXJyZWRPcGVyYXRpb24gPSB7fTtcblxuICAgIGRlZmVycmVkT3BlcmF0aW9uLnByb21pc2UgPSBuZXcgUHJvbWlzZSQxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZGVmZXJyZWRPcGVyYXRpb24ucmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICAgIGRlZmVycmVkT3BlcmF0aW9uLnJlamVjdCA9IHJlamVjdDtcbiAgICB9KTtcblxuICAgIC8vIEVucXVldWUgdGhlIGRlZmVycmVkIG9wZXJhdGlvbi5cbiAgICBkYkNvbnRleHQuZGVmZXJyZWRPcGVyYXRpb25zLnB1c2goZGVmZXJyZWRPcGVyYXRpb24pO1xuXG4gICAgLy8gQ2hhaW4gaXRzIHByb21pc2UgdG8gdGhlIGRhdGFiYXNlIHJlYWRpbmVzcy5cbiAgICBpZiAoIWRiQ29udGV4dC5kYlJlYWR5KSB7XG4gICAgICAgIGRiQ29udGV4dC5kYlJlYWR5ID0gZGVmZXJyZWRPcGVyYXRpb24ucHJvbWlzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBkYkNvbnRleHQuZGJSZWFkeSA9IGRiQ29udGV4dC5kYlJlYWR5LnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkT3BlcmF0aW9uLnByb21pc2U7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gX2FkdmFuY2VSZWFkaW5lc3MoZGJJbmZvKSB7XG4gICAgdmFyIGRiQ29udGV4dCA9IGRiQ29udGV4dHNbZGJJbmZvLm5hbWVdO1xuXG4gICAgLy8gRGVxdWV1ZSBhIGRlZmVycmVkIG9wZXJhdGlvbi5cbiAgICB2YXIgZGVmZXJyZWRPcGVyYXRpb24gPSBkYkNvbnRleHQuZGVmZXJyZWRPcGVyYXRpb25zLnBvcCgpO1xuXG4gICAgLy8gUmVzb2x2ZSBpdHMgcHJvbWlzZSAod2hpY2ggaXMgcGFydCBvZiB0aGUgZGF0YWJhc2UgcmVhZGluZXNzXG4gICAgLy8gY2hhaW4gb2YgcHJvbWlzZXMpLlxuICAgIGlmIChkZWZlcnJlZE9wZXJhdGlvbikge1xuICAgICAgICBkZWZlcnJlZE9wZXJhdGlvbi5yZXNvbHZlKCk7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZE9wZXJhdGlvbi5wcm9taXNlO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gX3JlamVjdFJlYWRpbmVzcyhkYkluZm8sIGVycikge1xuICAgIHZhciBkYkNvbnRleHQgPSBkYkNvbnRleHRzW2RiSW5mby5uYW1lXTtcblxuICAgIC8vIERlcXVldWUgYSBkZWZlcnJlZCBvcGVyYXRpb24uXG4gICAgdmFyIGRlZmVycmVkT3BlcmF0aW9uID0gZGJDb250ZXh0LmRlZmVycmVkT3BlcmF0aW9ucy5wb3AoKTtcblxuICAgIC8vIFJlamVjdCBpdHMgcHJvbWlzZSAod2hpY2ggaXMgcGFydCBvZiB0aGUgZGF0YWJhc2UgcmVhZGluZXNzXG4gICAgLy8gY2hhaW4gb2YgcHJvbWlzZXMpLlxuICAgIGlmIChkZWZlcnJlZE9wZXJhdGlvbikge1xuICAgICAgICBkZWZlcnJlZE9wZXJhdGlvbi5yZWplY3QoZXJyKTtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkT3BlcmF0aW9uLnByb21pc2U7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBfZ2V0Q29ubmVjdGlvbihkYkluZm8sIHVwZ3JhZGVOZWVkZWQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UkMShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGRiQ29udGV4dHNbZGJJbmZvLm5hbWVdID0gZGJDb250ZXh0c1tkYkluZm8ubmFtZV0gfHwgY3JlYXRlRGJDb250ZXh0KCk7XG5cbiAgICAgICAgaWYgKGRiSW5mby5kYikge1xuICAgICAgICAgICAgaWYgKHVwZ3JhZGVOZWVkZWQpIHtcbiAgICAgICAgICAgICAgICBfZGVmZXJSZWFkaW5lc3MoZGJJbmZvKTtcbiAgICAgICAgICAgICAgICBkYkluZm8uZGIuY2xvc2UoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoZGJJbmZvLmRiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkYkFyZ3MgPSBbZGJJbmZvLm5hbWVdO1xuXG4gICAgICAgIGlmICh1cGdyYWRlTmVlZGVkKSB7XG4gICAgICAgICAgICBkYkFyZ3MucHVzaChkYkluZm8udmVyc2lvbik7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgb3BlbnJlcSA9IGlkYi5vcGVuLmFwcGx5KGlkYiwgZGJBcmdzKTtcblxuICAgICAgICBpZiAodXBncmFkZU5lZWRlZCkge1xuICAgICAgICAgICAgb3BlbnJlcS5vbnVwZ3JhZGVuZWVkZWQgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIHZhciBkYiA9IG9wZW5yZXEucmVzdWx0O1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGRiLmNyZWF0ZU9iamVjdFN0b3JlKGRiSW5mby5zdG9yZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZS5vbGRWZXJzaW9uIDw9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFkZGVkIHdoZW4gc3VwcG9ydCBmb3IgYmxvYiBzaGltcyB3YXMgYWRkZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGRiLmNyZWF0ZU9iamVjdFN0b3JlKERFVEVDVF9CTE9CX1NVUFBPUlRfU1RPUkUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV4Lm5hbWUgPT09ICdDb25zdHJhaW50RXJyb3InKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1RoZSBkYXRhYmFzZSBcIicgKyBkYkluZm8ubmFtZSArICdcIicgKyAnIGhhcyBiZWVuIHVwZ3JhZGVkIGZyb20gdmVyc2lvbiAnICsgZS5vbGRWZXJzaW9uICsgJyB0byB2ZXJzaW9uICcgKyBlLm5ld1ZlcnNpb24gKyAnLCBidXQgdGhlIHN0b3JhZ2UgXCInICsgZGJJbmZvLnN0b3JlTmFtZSArICdcIiBhbHJlYWR5IGV4aXN0cy4nKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGV4O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIG9wZW5yZXEub25lcnJvciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICByZWplY3Qob3BlbnJlcS5lcnJvcik7XG4gICAgICAgIH07XG5cbiAgICAgICAgb3BlbnJlcS5vbnN1Y2Nlc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXNvbHZlKG9wZW5yZXEucmVzdWx0KTtcbiAgICAgICAgICAgIF9hZHZhbmNlUmVhZGluZXNzKGRiSW5mbyk7XG4gICAgICAgIH07XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIF9nZXRPcmlnaW5hbENvbm5lY3Rpb24oZGJJbmZvKSB7XG4gICAgcmV0dXJuIF9nZXRDb25uZWN0aW9uKGRiSW5mbywgZmFsc2UpO1xufVxuXG5mdW5jdGlvbiBfZ2V0VXBncmFkZWRDb25uZWN0aW9uKGRiSW5mbykge1xuICAgIHJldHVybiBfZ2V0Q29ubmVjdGlvbihkYkluZm8sIHRydWUpO1xufVxuXG5mdW5jdGlvbiBfaXNVcGdyYWRlTmVlZGVkKGRiSW5mbywgZGVmYXVsdFZlcnNpb24pIHtcbiAgICBpZiAoIWRiSW5mby5kYikge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICB2YXIgaXNOZXdTdG9yZSA9ICFkYkluZm8uZGIub2JqZWN0U3RvcmVOYW1lcy5jb250YWlucyhkYkluZm8uc3RvcmVOYW1lKTtcbiAgICB2YXIgaXNEb3duZ3JhZGUgPSBkYkluZm8udmVyc2lvbiA8IGRiSW5mby5kYi52ZXJzaW9uO1xuICAgIHZhciBpc1VwZ3JhZGUgPSBkYkluZm8udmVyc2lvbiA+IGRiSW5mby5kYi52ZXJzaW9uO1xuXG4gICAgaWYgKGlzRG93bmdyYWRlKSB7XG4gICAgICAgIC8vIElmIHRoZSB2ZXJzaW9uIGlzIG5vdCB0aGUgZGVmYXVsdCBvbmVcbiAgICAgICAgLy8gdGhlbiB3YXJuIGZvciBpbXBvc3NpYmxlIGRvd25ncmFkZS5cbiAgICAgICAgaWYgKGRiSW5mby52ZXJzaW9uICE9PSBkZWZhdWx0VmVyc2lvbikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdUaGUgZGF0YWJhc2UgXCInICsgZGJJbmZvLm5hbWUgKyAnXCInICsgXCIgY2FuJ3QgYmUgZG93bmdyYWRlZCBmcm9tIHZlcnNpb24gXCIgKyBkYkluZm8uZGIudmVyc2lvbiArICcgdG8gdmVyc2lvbiAnICsgZGJJbmZvLnZlcnNpb24gKyAnLicpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFsaWduIHRoZSB2ZXJzaW9ucyB0byBwcmV2ZW50IGVycm9ycy5cbiAgICAgICAgZGJJbmZvLnZlcnNpb24gPSBkYkluZm8uZGIudmVyc2lvbjtcbiAgICB9XG5cbiAgICBpZiAoaXNVcGdyYWRlIHx8IGlzTmV3U3RvcmUpIHtcbiAgICAgICAgLy8gSWYgdGhlIHN0b3JlIGlzIG5ldyB0aGVuIGluY3JlbWVudCB0aGUgdmVyc2lvbiAoaWYgbmVlZGVkKS5cbiAgICAgICAgLy8gVGhpcyB3aWxsIHRyaWdnZXIgYW4gXCJ1cGdyYWRlbmVlZGVkXCIgZXZlbnQgd2hpY2ggaXMgcmVxdWlyZWRcbiAgICAgICAgLy8gZm9yIGNyZWF0aW5nIGEgc3RvcmUuXG4gICAgICAgIGlmIChpc05ld1N0b3JlKSB7XG4gICAgICAgICAgICB2YXIgaW5jVmVyc2lvbiA9IGRiSW5mby5kYi52ZXJzaW9uICsgMTtcbiAgICAgICAgICAgIGlmIChpbmNWZXJzaW9uID4gZGJJbmZvLnZlcnNpb24pIHtcbiAgICAgICAgICAgICAgICBkYkluZm8udmVyc2lvbiA9IGluY1ZlcnNpb247XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbi8vIGVuY29kZSBhIGJsb2IgZm9yIGluZGV4ZWRkYiBlbmdpbmVzIHRoYXQgZG9uJ3Qgc3VwcG9ydCBibG9ic1xuZnVuY3Rpb24gX2VuY29kZUJsb2IoYmxvYikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSQxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgIHJlYWRlci5vbmVycm9yID0gcmVqZWN0O1xuICAgICAgICByZWFkZXIub25sb2FkZW5kID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciBiYXNlNjQgPSBidG9hKGUudGFyZ2V0LnJlc3VsdCB8fCAnJyk7XG4gICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICBfX2xvY2FsX2ZvcmFnZV9lbmNvZGVkX2Jsb2I6IHRydWUsXG4gICAgICAgICAgICAgICAgZGF0YTogYmFzZTY0LFxuICAgICAgICAgICAgICAgIHR5cGU6IGJsb2IudHlwZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHJlYWRlci5yZWFkQXNCaW5hcnlTdHJpbmcoYmxvYik7XG4gICAgfSk7XG59XG5cbi8vIGRlY29kZSBhbiBlbmNvZGVkIGJsb2JcbmZ1bmN0aW9uIF9kZWNvZGVCbG9iKGVuY29kZWRCbG9iKSB7XG4gICAgdmFyIGFycmF5QnVmZiA9IF9iaW5TdHJpbmdUb0FycmF5QnVmZmVyKGF0b2IoZW5jb2RlZEJsb2IuZGF0YSkpO1xuICAgIHJldHVybiBjcmVhdGVCbG9iKFthcnJheUJ1ZmZdLCB7IHR5cGU6IGVuY29kZWRCbG9iLnR5cGUgfSk7XG59XG5cbi8vIGlzIHRoaXMgb25lIG9mIG91ciBmYW5jeSBlbmNvZGVkIGJsb2JzP1xuZnVuY3Rpb24gX2lzRW5jb2RlZEJsb2IodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgJiYgdmFsdWUuX19sb2NhbF9mb3JhZ2VfZW5jb2RlZF9ibG9iO1xufVxuXG4vLyBTcGVjaWFsaXplIHRoZSBkZWZhdWx0IGByZWFkeSgpYCBmdW5jdGlvbiBieSBtYWtpbmcgaXQgZGVwZW5kZW50XG4vLyBvbiB0aGUgY3VycmVudCBkYXRhYmFzZSBvcGVyYXRpb25zLiBUaHVzLCB0aGUgZHJpdmVyIHdpbGwgYmUgYWN0dWFsbHlcbi8vIHJlYWR5IHdoZW4gaXQncyBiZWVuIGluaXRpYWxpemVkIChkZWZhdWx0KSAqYW5kKiB0aGVyZSBhcmUgbm8gcGVuZGluZ1xuLy8gb3BlcmF0aW9ucyBvbiB0aGUgZGF0YWJhc2UgKGluaXRpYXRlZCBieSBzb21lIG90aGVyIGluc3RhbmNlcykuXG5mdW5jdGlvbiBfZnVsbHlSZWFkeShjYWxsYmFjaykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBwcm9taXNlID0gc2VsZi5faW5pdFJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBkYkNvbnRleHQgPSBkYkNvbnRleHRzW3NlbGYuX2RiSW5mby5uYW1lXTtcblxuICAgICAgICBpZiAoZGJDb250ZXh0ICYmIGRiQ29udGV4dC5kYlJlYWR5KSB7XG4gICAgICAgICAgICByZXR1cm4gZGJDb250ZXh0LmRiUmVhZHk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGV4ZWN1dGVUd29DYWxsYmFja3MocHJvbWlzZSwgY2FsbGJhY2ssIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuLy8gVHJ5IHRvIGVzdGFibGlzaCBhIG5ldyBkYiBjb25uZWN0aW9uIHRvIHJlcGxhY2UgdGhlXG4vLyBjdXJyZW50IG9uZSB3aGljaCBpcyBicm9rZW4gKGkuZS4gZXhwZXJpZW5jaW5nXG4vLyBJbnZhbGlkU3RhdGVFcnJvciB3aGlsZSBjcmVhdGluZyBhIHRyYW5zYWN0aW9uKS5cbmZ1bmN0aW9uIF90cnlSZWNvbm5lY3QoZGJJbmZvKSB7XG4gICAgX2RlZmVyUmVhZGluZXNzKGRiSW5mbyk7XG5cbiAgICB2YXIgZGJDb250ZXh0ID0gZGJDb250ZXh0c1tkYkluZm8ubmFtZV07XG4gICAgdmFyIGZvcmFnZXMgPSBkYkNvbnRleHQuZm9yYWdlcztcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZm9yYWdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZm9yYWdlID0gZm9yYWdlc1tpXTtcbiAgICAgICAgaWYgKGZvcmFnZS5fZGJJbmZvLmRiKSB7XG4gICAgICAgICAgICBmb3JhZ2UuX2RiSW5mby5kYi5jbG9zZSgpO1xuICAgICAgICAgICAgZm9yYWdlLl9kYkluZm8uZGIgPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIGRiSW5mby5kYiA9IG51bGw7XG5cbiAgICByZXR1cm4gX2dldE9yaWdpbmFsQ29ubmVjdGlvbihkYkluZm8pLnRoZW4oZnVuY3Rpb24gKGRiKSB7XG4gICAgICAgIGRiSW5mby5kYiA9IGRiO1xuICAgICAgICBpZiAoX2lzVXBncmFkZU5lZWRlZChkYkluZm8pKSB7XG4gICAgICAgICAgICAvLyBSZW9wZW4gdGhlIGRhdGFiYXNlIGZvciB1cGdyYWRpbmcuXG4gICAgICAgICAgICByZXR1cm4gX2dldFVwZ3JhZGVkQ29ubmVjdGlvbihkYkluZm8pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkYjtcbiAgICB9KS50aGVuKGZ1bmN0aW9uIChkYikge1xuICAgICAgICAvLyBzdG9yZSB0aGUgbGF0ZXN0IGRiIHJlZmVyZW5jZVxuICAgICAgICAvLyBpbiBjYXNlIHRoZSBkYiB3YXMgdXBncmFkZWRcbiAgICAgICAgZGJJbmZvLmRiID0gZGJDb250ZXh0LmRiID0gZGI7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZm9yYWdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZm9yYWdlc1tpXS5fZGJJbmZvLmRiID0gZGI7XG4gICAgICAgIH1cbiAgICB9KVtcImNhdGNoXCJdKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgX3JlamVjdFJlYWRpbmVzcyhkYkluZm8sIGVycik7XG4gICAgICAgIHRocm93IGVycjtcbiAgICB9KTtcbn1cblxuLy8gRkYgZG9lc24ndCBsaWtlIFByb21pc2VzIChtaWNyby10YXNrcykgYW5kIElEREIgc3RvcmUgb3BlcmF0aW9ucyxcbi8vIHNvIHdlIGhhdmUgdG8gZG8gaXQgd2l0aCBjYWxsYmFja3NcbmZ1bmN0aW9uIGNyZWF0ZVRyYW5zYWN0aW9uKGRiSW5mbywgbW9kZSwgY2FsbGJhY2ssIHJldHJpZXMpIHtcbiAgICBpZiAocmV0cmllcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHJpZXMgPSAxO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAgIHZhciB0eCA9IGRiSW5mby5kYi50cmFuc2FjdGlvbihkYkluZm8uc3RvcmVOYW1lLCBtb2RlKTtcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgdHgpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBpZiAocmV0cmllcyA+IDAgJiYgKCFkYkluZm8uZGIgfHwgZXJyLm5hbWUgPT09ICdJbnZhbGlkU3RhdGVFcnJvcicgfHwgZXJyLm5hbWUgPT09ICdOb3RGb3VuZEVycm9yJykpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlJDEucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICghZGJJbmZvLmRiIHx8IGVyci5uYW1lID09PSAnTm90Rm91bmRFcnJvcicgJiYgIWRiSW5mby5kYi5vYmplY3RTdG9yZU5hbWVzLmNvbnRhaW5zKGRiSW5mby5zdG9yZU5hbWUpICYmIGRiSW5mby52ZXJzaW9uIDw9IGRiSW5mby5kYi52ZXJzaW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGluY3JlYXNlIHRoZSBkYiB2ZXJzaW9uLCB0byBjcmVhdGUgdGhlIG5ldyBPYmplY3RTdG9yZVxuICAgICAgICAgICAgICAgICAgICBpZiAoZGJJbmZvLmRiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYkluZm8udmVyc2lvbiA9IGRiSW5mby5kYi52ZXJzaW9uICsgMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBSZW9wZW4gdGhlIGRhdGFiYXNlIGZvciB1cGdyYWRpbmcuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfZ2V0VXBncmFkZWRDb25uZWN0aW9uKGRiSW5mbyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90cnlSZWNvbm5lY3QoZGJJbmZvKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlVHJhbnNhY3Rpb24oZGJJbmZvLCBtb2RlLCBjYWxsYmFjaywgcmV0cmllcyAtIDEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSlbXCJjYXRjaFwiXShjYWxsYmFjayk7XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlRGJDb250ZXh0KCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIC8vIFJ1bm5pbmcgbG9jYWxGb3JhZ2VzIHNoYXJpbmcgYSBkYXRhYmFzZS5cbiAgICAgICAgZm9yYWdlczogW10sXG4gICAgICAgIC8vIFNoYXJlZCBkYXRhYmFzZS5cbiAgICAgICAgZGI6IG51bGwsXG4gICAgICAgIC8vIERhdGFiYXNlIHJlYWRpbmVzcyAocHJvbWlzZSkuXG4gICAgICAgIGRiUmVhZHk6IG51bGwsXG4gICAgICAgIC8vIERlZmVycmVkIG9wZXJhdGlvbnMgb24gdGhlIGRhdGFiYXNlLlxuICAgICAgICBkZWZlcnJlZE9wZXJhdGlvbnM6IFtdXG4gICAgfTtcbn1cblxuLy8gT3BlbiB0aGUgSW5kZXhlZERCIGRhdGFiYXNlIChhdXRvbWF0aWNhbGx5IGNyZWF0ZXMgb25lIGlmIG9uZSBkaWRuJ3Rcbi8vIHByZXZpb3VzbHkgZXhpc3QpLCB1c2luZyBhbnkgb3B0aW9ucyBzZXQgaW4gdGhlIGNvbmZpZy5cbmZ1bmN0aW9uIF9pbml0U3RvcmFnZShvcHRpb25zKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBkYkluZm8gPSB7XG4gICAgICAgIGRiOiBudWxsXG4gICAgfTtcblxuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICAgIGZvciAodmFyIGkgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgZGJJbmZvW2ldID0gb3B0aW9uc1tpXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEdldCB0aGUgY3VycmVudCBjb250ZXh0IG9mIHRoZSBkYXRhYmFzZTtcbiAgICB2YXIgZGJDb250ZXh0ID0gZGJDb250ZXh0c1tkYkluZm8ubmFtZV07XG5cbiAgICAvLyAuLi5vciBjcmVhdGUgYSBuZXcgY29udGV4dC5cbiAgICBpZiAoIWRiQ29udGV4dCkge1xuICAgICAgICBkYkNvbnRleHQgPSBjcmVhdGVEYkNvbnRleHQoKTtcbiAgICAgICAgLy8gUmVnaXN0ZXIgdGhlIG5ldyBjb250ZXh0IGluIHRoZSBnbG9iYWwgY29udGFpbmVyLlxuICAgICAgICBkYkNvbnRleHRzW2RiSW5mby5uYW1lXSA9IGRiQ29udGV4dDtcbiAgICB9XG5cbiAgICAvLyBSZWdpc3RlciBpdHNlbGYgYXMgYSBydW5uaW5nIGxvY2FsRm9yYWdlIGluIHRoZSBjdXJyZW50IGNvbnRleHQuXG4gICAgZGJDb250ZXh0LmZvcmFnZXMucHVzaChzZWxmKTtcblxuICAgIC8vIFJlcGxhY2UgdGhlIGRlZmF1bHQgYHJlYWR5KClgIGZ1bmN0aW9uIHdpdGggdGhlIHNwZWNpYWxpemVkIG9uZS5cbiAgICBpZiAoIXNlbGYuX2luaXRSZWFkeSkge1xuICAgICAgICBzZWxmLl9pbml0UmVhZHkgPSBzZWxmLnJlYWR5O1xuICAgICAgICBzZWxmLnJlYWR5ID0gX2Z1bGx5UmVhZHk7XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIGFuIGFycmF5IG9mIGluaXRpYWxpemF0aW9uIHN0YXRlcyBvZiB0aGUgcmVsYXRlZCBsb2NhbEZvcmFnZXMuXG4gICAgdmFyIGluaXRQcm9taXNlcyA9IFtdO1xuXG4gICAgZnVuY3Rpb24gaWdub3JlRXJyb3JzKCkge1xuICAgICAgICAvLyBEb24ndCBoYW5kbGUgZXJyb3JzIGhlcmUsXG4gICAgICAgIC8vIGp1c3QgbWFrZXMgc3VyZSByZWxhdGVkIGxvY2FsRm9yYWdlcyBhcmVuJ3QgcGVuZGluZy5cbiAgICAgICAgcmV0dXJuIFByb21pc2UkMS5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBkYkNvbnRleHQuZm9yYWdlcy5sZW5ndGg7IGorKykge1xuICAgICAgICB2YXIgZm9yYWdlID0gZGJDb250ZXh0LmZvcmFnZXNbal07XG4gICAgICAgIGlmIChmb3JhZ2UgIT09IHNlbGYpIHtcbiAgICAgICAgICAgIC8vIERvbid0IHdhaXQgZm9yIGl0c2VsZi4uLlxuICAgICAgICAgICAgaW5pdFByb21pc2VzLnB1c2goZm9yYWdlLl9pbml0UmVhZHkoKVtcImNhdGNoXCJdKGlnbm9yZUVycm9ycykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gVGFrZSBhIHNuYXBzaG90IG9mIHRoZSByZWxhdGVkIGxvY2FsRm9yYWdlcy5cbiAgICB2YXIgZm9yYWdlcyA9IGRiQ29udGV4dC5mb3JhZ2VzLnNsaWNlKDApO1xuXG4gICAgLy8gSW5pdGlhbGl6ZSB0aGUgY29ubmVjdGlvbiBwcm9jZXNzIG9ubHkgd2hlblxuICAgIC8vIGFsbCB0aGUgcmVsYXRlZCBsb2NhbEZvcmFnZXMgYXJlbid0IHBlbmRpbmcuXG4gICAgcmV0dXJuIFByb21pc2UkMS5hbGwoaW5pdFByb21pc2VzKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZGJJbmZvLmRiID0gZGJDb250ZXh0LmRiO1xuICAgICAgICAvLyBHZXQgdGhlIGNvbm5lY3Rpb24gb3Igb3BlbiBhIG5ldyBvbmUgd2l0aG91dCB1cGdyYWRlLlxuICAgICAgICByZXR1cm4gX2dldE9yaWdpbmFsQ29ubmVjdGlvbihkYkluZm8pO1xuICAgIH0pLnRoZW4oZnVuY3Rpb24gKGRiKSB7XG4gICAgICAgIGRiSW5mby5kYiA9IGRiO1xuICAgICAgICBpZiAoX2lzVXBncmFkZU5lZWRlZChkYkluZm8sIHNlbGYuX2RlZmF1bHRDb25maWcudmVyc2lvbikpIHtcbiAgICAgICAgICAgIC8vIFJlb3BlbiB0aGUgZGF0YWJhc2UgZm9yIHVwZ3JhZGluZy5cbiAgICAgICAgICAgIHJldHVybiBfZ2V0VXBncmFkZWRDb25uZWN0aW9uKGRiSW5mbyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRiO1xuICAgIH0pLnRoZW4oZnVuY3Rpb24gKGRiKSB7XG4gICAgICAgIGRiSW5mby5kYiA9IGRiQ29udGV4dC5kYiA9IGRiO1xuICAgICAgICBzZWxmLl9kYkluZm8gPSBkYkluZm87XG4gICAgICAgIC8vIFNoYXJlIHRoZSBmaW5hbCBjb25uZWN0aW9uIGFtb25nc3QgcmVsYXRlZCBsb2NhbEZvcmFnZXMuXG4gICAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgZm9yYWdlcy5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgdmFyIGZvcmFnZSA9IGZvcmFnZXNba107XG4gICAgICAgICAgICBpZiAoZm9yYWdlICE9PSBzZWxmKSB7XG4gICAgICAgICAgICAgICAgLy8gU2VsZiBpcyBhbHJlYWR5IHVwLXRvLWRhdGUuXG4gICAgICAgICAgICAgICAgZm9yYWdlLl9kYkluZm8uZGIgPSBkYkluZm8uZGI7XG4gICAgICAgICAgICAgICAgZm9yYWdlLl9kYkluZm8udmVyc2lvbiA9IGRiSW5mby52ZXJzaW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldEl0ZW0oa2V5LCBjYWxsYmFjaykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGtleSA9IG5vcm1hbGl6ZUtleShrZXkpO1xuXG4gICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSQxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY3JlYXRlVHJhbnNhY3Rpb24oc2VsZi5fZGJJbmZvLCBSRUFEX09OTFksIGZ1bmN0aW9uIChlcnIsIHRyYW5zYWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0b3JlID0gdHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUoc2VsZi5fZGJJbmZvLnN0b3JlTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXEgPSBzdG9yZS5nZXQoa2V5KTtcblxuICAgICAgICAgICAgICAgICAgICByZXEub25zdWNjZXNzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gcmVxLnJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9pc0VuY29kZWRCbG9iKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gX2RlY29kZUJsb2IodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgcmVxLm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QocmVxLmVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlbXCJjYXRjaFwiXShyZWplY3QpO1xuICAgIH0pO1xuXG4gICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuLy8gSXRlcmF0ZSBvdmVyIGFsbCBpdGVtcyBzdG9yZWQgaW4gZGF0YWJhc2UuXG5mdW5jdGlvbiBpdGVyYXRlKGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UkMShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNyZWF0ZVRyYW5zYWN0aW9uKHNlbGYuX2RiSW5mbywgUkVBRF9PTkxZLCBmdW5jdGlvbiAoZXJyLCB0cmFuc2FjdGlvbikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdG9yZSA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKHNlbGYuX2RiSW5mby5zdG9yZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVxID0gc3RvcmUub3BlbkN1cnNvcigpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgaXRlcmF0aW9uTnVtYmVyID0gMTtcblxuICAgICAgICAgICAgICAgICAgICByZXEub25zdWNjZXNzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnNvciA9IHJlcS5yZXN1bHQ7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJzb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBjdXJzb3IudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9pc0VuY29kZWRCbG9iKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IF9kZWNvZGVCbG9iKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGl0ZXJhdG9yKHZhbHVlLCBjdXJzb3Iua2V5LCBpdGVyYXRpb25OdW1iZXIrKyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB3aGVuIHRoZSBpdGVyYXRvciBjYWxsYmFjayByZXR1bnMgYW55XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gKG5vbi1gdW5kZWZpbmVkYCkgdmFsdWUsIHRoZW4gd2Ugc3RvcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSBpdGVyYXRpb24gaW1tZWRpYXRlbHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICE9PSB2b2lkIDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnNvcltcImNvbnRpbnVlXCJdKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgcmVxLm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QocmVxLmVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlbXCJjYXRjaFwiXShyZWplY3QpO1xuICAgIH0pO1xuXG4gICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcblxuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG5mdW5jdGlvbiBzZXRJdGVtKGtleSwgdmFsdWUsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAga2V5ID0gbm9ybWFsaXplS2V5KGtleSk7XG5cbiAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICB2YXIgZGJJbmZvO1xuICAgICAgICBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBkYkluZm8gPSBzZWxmLl9kYkluZm87XG4gICAgICAgICAgICBpZiAodG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEJsb2JdJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBfY2hlY2tCbG9iU3VwcG9ydChkYkluZm8uZGIpLnRoZW4oZnVuY3Rpb24gKGJsb2JTdXBwb3J0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChibG9iU3VwcG9ydCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfZW5jb2RlQmxvYih2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBjcmVhdGVUcmFuc2FjdGlvbihzZWxmLl9kYkluZm8sIFJFQURfV1JJVEUsIGZ1bmN0aW9uIChlcnIsIHRyYW5zYWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0b3JlID0gdHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUoc2VsZi5fZGJJbmZvLnN0b3JlTmFtZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIHJlYXNvbiB3ZSBkb24ndCBfc2F2ZV8gbnVsbCBpcyBiZWNhdXNlIElFIDEwIGRvZXNcbiAgICAgICAgICAgICAgICAgICAgLy8gbm90IHN1cHBvcnQgc2F2aW5nIHRoZSBgbnVsbGAgdHlwZSBpbiBJbmRleGVkREIuIEhvd1xuICAgICAgICAgICAgICAgICAgICAvLyBpcm9uaWMsIGdpdmVuIHRoZSBidWcgYmVsb3chXG4gICAgICAgICAgICAgICAgICAgIC8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL21vemlsbGEvbG9jYWxGb3JhZ2UvaXNzdWVzLzE2MVxuICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlcSA9IHN0b3JlLnB1dCh2YWx1ZSwga2V5KTtcblxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbi5vbmNvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2FzdCB0byB1bmRlZmluZWQgc28gdGhlIHZhbHVlIHBhc3NlZCB0b1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FsbGJhY2svcHJvbWlzZSBpcyB0aGUgc2FtZSBhcyB3aGF0IG9uZSB3b3VsZCBnZXQgb3V0XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBvZiBgZ2V0SXRlbSgpYCBsYXRlci4gVGhpcyBsZWFkcyB0byBzb21lIHdlaXJkbmVzc1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gKHNldEl0ZW0oJ2ZvbycsIHVuZGVmaW5lZCkgd2lsbCByZXR1cm4gYG51bGxgKSwgYnV0XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpdCdzIG5vdCBteSBmYXVsdCBsb2NhbFN0b3JhZ2UgaXMgb3VyIGJhc2VsaW5lIGFuZCB0aGF0XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpdCdzIHdlaXJkLlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbi5vbmFib3J0ID0gdHJhbnNhY3Rpb24ub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlcnIgPSByZXEuZXJyb3IgPyByZXEuZXJyb3IgOiByZXEudHJhbnNhY3Rpb24uZXJyb3I7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlbXCJjYXRjaFwiXShyZWplY3QpO1xuICAgIH0pO1xuXG4gICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlSXRlbShrZXksIGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAga2V5ID0gbm9ybWFsaXplS2V5KGtleSk7XG5cbiAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjcmVhdGVUcmFuc2FjdGlvbihzZWxmLl9kYkluZm8sIFJFQURfV1JJVEUsIGZ1bmN0aW9uIChlcnIsIHRyYW5zYWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0b3JlID0gdHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUoc2VsZi5fZGJJbmZvLnN0b3JlTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIFdlIHVzZSBhIEdydW50IHRhc2sgdG8gbWFrZSB0aGlzIHNhZmUgZm9yIElFIGFuZCBzb21lXG4gICAgICAgICAgICAgICAgICAgIC8vIHZlcnNpb25zIG9mIEFuZHJvaWQgKGluY2x1ZGluZyB0aG9zZSB1c2VkIGJ5IENvcmRvdmEpLlxuICAgICAgICAgICAgICAgICAgICAvLyBOb3JtYWxseSBJRSB3b24ndCBsaWtlIGAuZGVsZXRlKClgIGFuZCB3aWxsIGluc2lzdCBvblxuICAgICAgICAgICAgICAgICAgICAvLyB1c2luZyBgWydkZWxldGUnXSgpYCwgYnV0IHdlIGhhdmUgYSBidWlsZCBzdGVwIHRoYXRcbiAgICAgICAgICAgICAgICAgICAgLy8gZml4ZXMgdGhpcyBmb3IgdXMgbm93LlxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVxID0gc3RvcmVbXCJkZWxldGVcIl0oa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb24ub25jb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbi5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHJlcS5lcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIHJlcXVlc3Qgd2lsbCBiZSBhbHNvIGJlIGFib3J0ZWQgaWYgd2UndmUgZXhjZWVkZWQgb3VyIHN0b3JhZ2VcbiAgICAgICAgICAgICAgICAgICAgLy8gc3BhY2UuXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uLm9uYWJvcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZXJyID0gcmVxLmVycm9yID8gcmVxLmVycm9yIDogcmVxLnRyYW5zYWN0aW9uLmVycm9yO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pW1wiY2F0Y2hcIl0ocmVqZWN0KTtcbiAgICB9KTtcblxuICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cbmZ1bmN0aW9uIGNsZWFyKGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSQxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY3JlYXRlVHJhbnNhY3Rpb24oc2VsZi5fZGJJbmZvLCBSRUFEX1dSSVRFLCBmdW5jdGlvbiAoZXJyLCB0cmFuc2FjdGlvbikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdG9yZSA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKHNlbGYuX2RiSW5mby5zdG9yZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVxID0gc3RvcmUuY2xlYXIoKTtcblxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbi5vbmNvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uLm9uYWJvcnQgPSB0cmFuc2FjdGlvbi5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVyciA9IHJlcS5lcnJvciA/IHJlcS5lcnJvciA6IHJlcS50cmFuc2FjdGlvbi5lcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVtcImNhdGNoXCJdKHJlamVjdCk7XG4gICAgfSk7XG5cbiAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG5mdW5jdGlvbiBsZW5ndGgoY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjcmVhdGVUcmFuc2FjdGlvbihzZWxmLl9kYkluZm8sIFJFQURfT05MWSwgZnVuY3Rpb24gKGVyciwgdHJhbnNhY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZShzZWxmLl9kYkluZm8uc3RvcmVOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlcSA9IHN0b3JlLmNvdW50KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmVxLm9uc3VjY2VzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVxLnJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgcmVxLm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QocmVxLmVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlbXCJjYXRjaFwiXShyZWplY3QpO1xuICAgIH0pO1xuXG4gICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuZnVuY3Rpb24ga2V5KG4sIGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSQxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgaWYgKG4gPCAwKSB7XG4gICAgICAgICAgICByZXNvbHZlKG51bGwpO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjcmVhdGVUcmFuc2FjdGlvbihzZWxmLl9kYkluZm8sIFJFQURfT05MWSwgZnVuY3Rpb24gKGVyciwgdHJhbnNhY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZShzZWxmLl9kYkluZm8uc3RvcmVOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFkdmFuY2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXEgPSBzdG9yZS5vcGVuQ3Vyc29yKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmVxLm9uc3VjY2VzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjdXJzb3IgPSByZXEucmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjdXJzb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIG1lYW5zIHRoZXJlIHdlcmVuJ3QgZW5vdWdoIGtleXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG51bGwpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobiA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIGhhdmUgdGhlIGZpcnN0IGtleSwgcmV0dXJuIGl0IGlmIHRoYXQncyB3aGF0IHRoZXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB3YW50ZWQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjdXJzb3Iua2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFhZHZhbmNlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPdGhlcndpc2UsIGFzayB0aGUgY3Vyc29yIHRvIHNraXAgYWhlYWQgblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZWNvcmRzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZHZhbmNlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnNvci5hZHZhbmNlKG4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdoZW4gd2UgZ2V0IGhlcmUsIHdlJ3ZlIGdvdCB0aGUgbnRoIGtleS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjdXJzb3Iua2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgcmVxLm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QocmVxLmVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlbXCJjYXRjaFwiXShyZWplY3QpO1xuICAgIH0pO1xuXG4gICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuZnVuY3Rpb24ga2V5cyhjYWxsYmFjaykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UkMShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNyZWF0ZVRyYW5zYWN0aW9uKHNlbGYuX2RiSW5mbywgUkVBRF9PTkxZLCBmdW5jdGlvbiAoZXJyLCB0cmFuc2FjdGlvbikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdG9yZSA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKHNlbGYuX2RiSW5mby5zdG9yZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVxID0gc3RvcmUub3BlbkN1cnNvcigpO1xuICAgICAgICAgICAgICAgICAgICB2YXIga2V5cyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgICAgIHJlcS5vbnN1Y2Nlc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3Vyc29yID0gcmVxLnJlc3VsdDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjdXJzb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGtleXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAga2V5cy5wdXNoKGN1cnNvci5rZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yW1wiY29udGludWVcIl0oKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICByZXEub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChyZXEuZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVtcImNhdGNoXCJdKHJlamVjdCk7XG4gICAgfSk7XG5cbiAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG5mdW5jdGlvbiBkcm9wSW5zdGFuY2Uob3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICBjYWxsYmFjayA9IGdldENhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICB2YXIgY3VycmVudENvbmZpZyA9IHRoaXMuY29uZmlnKCk7XG4gICAgb3B0aW9ucyA9IHR5cGVvZiBvcHRpb25zICE9PSAnZnVuY3Rpb24nICYmIG9wdGlvbnMgfHwge307XG4gICAgaWYgKCFvcHRpb25zLm5hbWUpIHtcbiAgICAgICAgb3B0aW9ucy5uYW1lID0gb3B0aW9ucy5uYW1lIHx8IGN1cnJlbnRDb25maWcubmFtZTtcbiAgICAgICAgb3B0aW9ucy5zdG9yZU5hbWUgPSBvcHRpb25zLnN0b3JlTmFtZSB8fCBjdXJyZW50Q29uZmlnLnN0b3JlTmFtZTtcbiAgICB9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHByb21pc2U7XG4gICAgaWYgKCFvcHRpb25zLm5hbWUpIHtcbiAgICAgICAgcHJvbWlzZSA9IFByb21pc2UkMS5yZWplY3QoJ0ludmFsaWQgYXJndW1lbnRzJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGlzQ3VycmVudERiID0gb3B0aW9ucy5uYW1lID09PSBjdXJyZW50Q29uZmlnLm5hbWUgJiYgc2VsZi5fZGJJbmZvLmRiO1xuXG4gICAgICAgIHZhciBkYlByb21pc2UgPSBpc0N1cnJlbnREYiA/IFByb21pc2UkMS5yZXNvbHZlKHNlbGYuX2RiSW5mby5kYikgOiBfZ2V0T3JpZ2luYWxDb25uZWN0aW9uKG9wdGlvbnMpLnRoZW4oZnVuY3Rpb24gKGRiKSB7XG4gICAgICAgICAgICB2YXIgZGJDb250ZXh0ID0gZGJDb250ZXh0c1tvcHRpb25zLm5hbWVdO1xuICAgICAgICAgICAgdmFyIGZvcmFnZXMgPSBkYkNvbnRleHQuZm9yYWdlcztcbiAgICAgICAgICAgIGRiQ29udGV4dC5kYiA9IGRiO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmb3JhZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZm9yYWdlc1tpXS5fZGJJbmZvLmRiID0gZGI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZGI7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICghb3B0aW9ucy5zdG9yZU5hbWUpIHtcbiAgICAgICAgICAgIHByb21pc2UgPSBkYlByb21pc2UudGhlbihmdW5jdGlvbiAoZGIpIHtcbiAgICAgICAgICAgICAgICBfZGVmZXJSZWFkaW5lc3Mob3B0aW9ucyk7XG5cbiAgICAgICAgICAgICAgICB2YXIgZGJDb250ZXh0ID0gZGJDb250ZXh0c1tvcHRpb25zLm5hbWVdO1xuICAgICAgICAgICAgICAgIHZhciBmb3JhZ2VzID0gZGJDb250ZXh0LmZvcmFnZXM7XG5cbiAgICAgICAgICAgICAgICBkYi5jbG9zZSgpO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZm9yYWdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm9yYWdlID0gZm9yYWdlc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yYWdlLl9kYkluZm8uZGIgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBkcm9wREJQcm9taXNlID0gbmV3IFByb21pc2UkMShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXEgPSBpZGIuZGVsZXRlRGF0YWJhc2Uob3B0aW9ucy5uYW1lKTtcblxuICAgICAgICAgICAgICAgICAgICByZXEub25lcnJvciA9IHJlcS5vbmJsb2NrZWQgPSBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGIgPSByZXEucmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGIuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHJlcS5vbnN1Y2Nlc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGIgPSByZXEucmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGIuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZGIpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRyb3BEQlByb21pc2UudGhlbihmdW5jdGlvbiAoZGIpIHtcbiAgICAgICAgICAgICAgICAgICAgZGJDb250ZXh0LmRiID0gZGI7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZm9yYWdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIF9mb3JhZ2UgPSBmb3JhZ2VzW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgX2FkdmFuY2VSZWFkaW5lc3MoX2ZvcmFnZS5fZGJJbmZvKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pW1wiY2F0Y2hcIl0oZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAoX3JlamVjdFJlYWRpbmVzcyhvcHRpb25zLCBlcnIpIHx8IFByb21pc2UkMS5yZXNvbHZlKCkpW1wiY2F0Y2hcIl0oZnVuY3Rpb24gKCkge30pO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHByb21pc2UgPSBkYlByb21pc2UudGhlbihmdW5jdGlvbiAoZGIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWRiLm9iamVjdFN0b3JlTmFtZXMuY29udGFpbnMob3B0aW9ucy5zdG9yZU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgbmV3VmVyc2lvbiA9IGRiLnZlcnNpb24gKyAxO1xuXG4gICAgICAgICAgICAgICAgX2RlZmVyUmVhZGluZXNzKG9wdGlvbnMpO1xuXG4gICAgICAgICAgICAgICAgdmFyIGRiQ29udGV4dCA9IGRiQ29udGV4dHNbb3B0aW9ucy5uYW1lXTtcbiAgICAgICAgICAgICAgICB2YXIgZm9yYWdlcyA9IGRiQ29udGV4dC5mb3JhZ2VzO1xuXG4gICAgICAgICAgICAgICAgZGIuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZvcmFnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZvcmFnZSA9IGZvcmFnZXNbaV07XG4gICAgICAgICAgICAgICAgICAgIGZvcmFnZS5fZGJJbmZvLmRiID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgZm9yYWdlLl9kYkluZm8udmVyc2lvbiA9IG5ld1ZlcnNpb247XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGRyb3BPYmplY3RQcm9taXNlID0gbmV3IFByb21pc2UkMShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXEgPSBpZGIub3BlbihvcHRpb25zLm5hbWUsIG5ld1ZlcnNpb24pO1xuXG4gICAgICAgICAgICAgICAgICAgIHJlcS5vbmVycm9yID0gZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRiID0gcmVxLnJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRiLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICByZXEub251cGdyYWRlbmVlZGVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRiID0gcmVxLnJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRiLmRlbGV0ZU9iamVjdFN0b3JlKG9wdGlvbnMuc3RvcmVOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICByZXEub25zdWNjZXNzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRiID0gcmVxLnJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRiLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGRiKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBkcm9wT2JqZWN0UHJvbWlzZS50aGVuKGZ1bmN0aW9uIChkYikge1xuICAgICAgICAgICAgICAgICAgICBkYkNvbnRleHQuZGIgPSBkYjtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBmb3JhZ2VzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgX2ZvcmFnZTIgPSBmb3JhZ2VzW2pdO1xuICAgICAgICAgICAgICAgICAgICAgICAgX2ZvcmFnZTIuX2RiSW5mby5kYiA9IGRiO1xuICAgICAgICAgICAgICAgICAgICAgICAgX2FkdmFuY2VSZWFkaW5lc3MoX2ZvcmFnZTIuX2RiSW5mbyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVtcImNhdGNoXCJdKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgKF9yZWplY3RSZWFkaW5lc3Mob3B0aW9ucywgZXJyKSB8fCBQcm9taXNlJDEucmVzb2x2ZSgpKVtcImNhdGNoXCJdKGZ1bmN0aW9uICgpIHt9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG52YXIgYXN5bmNTdG9yYWdlID0ge1xuICAgIF9kcml2ZXI6ICdhc3luY1N0b3JhZ2UnLFxuICAgIF9pbml0U3RvcmFnZTogX2luaXRTdG9yYWdlLFxuICAgIF9zdXBwb3J0OiBpc0luZGV4ZWREQlZhbGlkKCksXG4gICAgaXRlcmF0ZTogaXRlcmF0ZSxcbiAgICBnZXRJdGVtOiBnZXRJdGVtLFxuICAgIHNldEl0ZW06IHNldEl0ZW0sXG4gICAgcmVtb3ZlSXRlbTogcmVtb3ZlSXRlbSxcbiAgICBjbGVhcjogY2xlYXIsXG4gICAgbGVuZ3RoOiBsZW5ndGgsXG4gICAga2V5OiBrZXksXG4gICAga2V5czoga2V5cyxcbiAgICBkcm9wSW5zdGFuY2U6IGRyb3BJbnN0YW5jZVxufTtcblxuZnVuY3Rpb24gaXNXZWJTUUxWYWxpZCgpIHtcbiAgICByZXR1cm4gdHlwZW9mIG9wZW5EYXRhYmFzZSA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuLy8gU2FkbHksIHRoZSBiZXN0IHdheSB0byBzYXZlIGJpbmFyeSBkYXRhIGluIFdlYlNRTC9sb2NhbFN0b3JhZ2UgaXMgc2VyaWFsaXppbmdcbi8vIGl0IHRvIEJhc2U2NCwgc28gdGhpcyBpcyBob3cgd2Ugc3RvcmUgaXQgdG8gcHJldmVudCB2ZXJ5IHN0cmFuZ2UgZXJyb3JzIHdpdGggbGVzc1xuLy8gdmVyYm9zZSB3YXlzIG9mIGJpbmFyeSA8LT4gc3RyaW5nIGRhdGEgc3RvcmFnZS5cbnZhciBCQVNFX0NIQVJTID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nO1xuXG52YXIgQkxPQl9UWVBFX1BSRUZJWCA9ICd+fmxvY2FsX2ZvcmFnZV90eXBlfic7XG52YXIgQkxPQl9UWVBFX1BSRUZJWF9SRUdFWCA9IC9efn5sb2NhbF9mb3JhZ2VfdHlwZX4oW15+XSspfi87XG5cbnZhciBTRVJJQUxJWkVEX01BUktFUiA9ICdfX2xmc2NfXzonO1xudmFyIFNFUklBTElaRURfTUFSS0VSX0xFTkdUSCA9IFNFUklBTElaRURfTUFSS0VSLmxlbmd0aDtcblxuLy8gT01HIHRoZSBzZXJpYWxpemF0aW9ucyFcbnZhciBUWVBFX0FSUkFZQlVGRkVSID0gJ2FyYmYnO1xudmFyIFRZUEVfQkxPQiA9ICdibG9iJztcbnZhciBUWVBFX0lOVDhBUlJBWSA9ICdzaTA4JztcbnZhciBUWVBFX1VJTlQ4QVJSQVkgPSAndWkwOCc7XG52YXIgVFlQRV9VSU5UOENMQU1QRURBUlJBWSA9ICd1aWM4JztcbnZhciBUWVBFX0lOVDE2QVJSQVkgPSAnc2kxNic7XG52YXIgVFlQRV9JTlQzMkFSUkFZID0gJ3NpMzInO1xudmFyIFRZUEVfVUlOVDE2QVJSQVkgPSAndXIxNic7XG52YXIgVFlQRV9VSU5UMzJBUlJBWSA9ICd1aTMyJztcbnZhciBUWVBFX0ZMT0FUMzJBUlJBWSA9ICdmbDMyJztcbnZhciBUWVBFX0ZMT0FUNjRBUlJBWSA9ICdmbDY0JztcbnZhciBUWVBFX1NFUklBTElaRURfTUFSS0VSX0xFTkdUSCA9IFNFUklBTElaRURfTUFSS0VSX0xFTkdUSCArIFRZUEVfQVJSQVlCVUZGRVIubGVuZ3RoO1xuXG52YXIgdG9TdHJpbmckMSA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbmZ1bmN0aW9uIHN0cmluZ1RvQnVmZmVyKHNlcmlhbGl6ZWRTdHJpbmcpIHtcbiAgICAvLyBGaWxsIHRoZSBzdHJpbmcgaW50byBhIEFycmF5QnVmZmVyLlxuICAgIHZhciBidWZmZXJMZW5ndGggPSBzZXJpYWxpemVkU3RyaW5nLmxlbmd0aCAqIDAuNzU7XG4gICAgdmFyIGxlbiA9IHNlcmlhbGl6ZWRTdHJpbmcubGVuZ3RoO1xuICAgIHZhciBpO1xuICAgIHZhciBwID0gMDtcbiAgICB2YXIgZW5jb2RlZDEsIGVuY29kZWQyLCBlbmNvZGVkMywgZW5jb2RlZDQ7XG5cbiAgICBpZiAoc2VyaWFsaXplZFN0cmluZ1tzZXJpYWxpemVkU3RyaW5nLmxlbmd0aCAtIDFdID09PSAnPScpIHtcbiAgICAgICAgYnVmZmVyTGVuZ3RoLS07XG4gICAgICAgIGlmIChzZXJpYWxpemVkU3RyaW5nW3NlcmlhbGl6ZWRTdHJpbmcubGVuZ3RoIC0gMl0gPT09ICc9Jykge1xuICAgICAgICAgICAgYnVmZmVyTGVuZ3RoLS07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGJ1ZmZlckxlbmd0aCk7XG4gICAgdmFyIGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkgKz0gNCkge1xuICAgICAgICBlbmNvZGVkMSA9IEJBU0VfQ0hBUlMuaW5kZXhPZihzZXJpYWxpemVkU3RyaW5nW2ldKTtcbiAgICAgICAgZW5jb2RlZDIgPSBCQVNFX0NIQVJTLmluZGV4T2Yoc2VyaWFsaXplZFN0cmluZ1tpICsgMV0pO1xuICAgICAgICBlbmNvZGVkMyA9IEJBU0VfQ0hBUlMuaW5kZXhPZihzZXJpYWxpemVkU3RyaW5nW2kgKyAyXSk7XG4gICAgICAgIGVuY29kZWQ0ID0gQkFTRV9DSEFSUy5pbmRleE9mKHNlcmlhbGl6ZWRTdHJpbmdbaSArIDNdKTtcblxuICAgICAgICAvKmpzbGludCBiaXR3aXNlOiB0cnVlICovXG4gICAgICAgIGJ5dGVzW3ArK10gPSBlbmNvZGVkMSA8PCAyIHwgZW5jb2RlZDIgPj4gNDtcbiAgICAgICAgYnl0ZXNbcCsrXSA9IChlbmNvZGVkMiAmIDE1KSA8PCA0IHwgZW5jb2RlZDMgPj4gMjtcbiAgICAgICAgYnl0ZXNbcCsrXSA9IChlbmNvZGVkMyAmIDMpIDw8IDYgfCBlbmNvZGVkNCAmIDYzO1xuICAgIH1cbiAgICByZXR1cm4gYnVmZmVyO1xufVxuXG4vLyBDb252ZXJ0cyBhIGJ1ZmZlciB0byBhIHN0cmluZyB0byBzdG9yZSwgc2VyaWFsaXplZCwgaW4gdGhlIGJhY2tlbmRcbi8vIHN0b3JhZ2UgbGlicmFyeS5cbmZ1bmN0aW9uIGJ1ZmZlclRvU3RyaW5nKGJ1ZmZlcikge1xuICAgIC8vIGJhc2U2NC1hcnJheWJ1ZmZlclxuICAgIHZhciBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG4gICAgdmFyIGJhc2U2NFN0cmluZyA9ICcnO1xuICAgIHZhciBpO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSArPSAzKSB7XG4gICAgICAgIC8qanNsaW50IGJpdHdpc2U6IHRydWUgKi9cbiAgICAgICAgYmFzZTY0U3RyaW5nICs9IEJBU0VfQ0hBUlNbYnl0ZXNbaV0gPj4gMl07XG4gICAgICAgIGJhc2U2NFN0cmluZyArPSBCQVNFX0NIQVJTWyhieXRlc1tpXSAmIDMpIDw8IDQgfCBieXRlc1tpICsgMV0gPj4gNF07XG4gICAgICAgIGJhc2U2NFN0cmluZyArPSBCQVNFX0NIQVJTWyhieXRlc1tpICsgMV0gJiAxNSkgPDwgMiB8IGJ5dGVzW2kgKyAyXSA+PiA2XTtcbiAgICAgICAgYmFzZTY0U3RyaW5nICs9IEJBU0VfQ0hBUlNbYnl0ZXNbaSArIDJdICYgNjNdO1xuICAgIH1cblxuICAgIGlmIChieXRlcy5sZW5ndGggJSAzID09PSAyKSB7XG4gICAgICAgIGJhc2U2NFN0cmluZyA9IGJhc2U2NFN0cmluZy5zdWJzdHJpbmcoMCwgYmFzZTY0U3RyaW5nLmxlbmd0aCAtIDEpICsgJz0nO1xuICAgIH0gZWxzZSBpZiAoYnl0ZXMubGVuZ3RoICUgMyA9PT0gMSkge1xuICAgICAgICBiYXNlNjRTdHJpbmcgPSBiYXNlNjRTdHJpbmcuc3Vic3RyaW5nKDAsIGJhc2U2NFN0cmluZy5sZW5ndGggLSAyKSArICc9PSc7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJhc2U2NFN0cmluZztcbn1cblxuLy8gU2VyaWFsaXplIGEgdmFsdWUsIGFmdGVyd2FyZHMgZXhlY3V0aW5nIGEgY2FsbGJhY2sgKHdoaWNoIHVzdWFsbHlcbi8vIGluc3RydWN0cyB0aGUgYHNldEl0ZW0oKWAgY2FsbGJhY2svcHJvbWlzZSB0byBiZSBleGVjdXRlZCkuIFRoaXMgaXMgaG93XG4vLyB3ZSBzdG9yZSBiaW5hcnkgZGF0YSB3aXRoIGxvY2FsU3RvcmFnZS5cbmZ1bmN0aW9uIHNlcmlhbGl6ZSh2YWx1ZSwgY2FsbGJhY2spIHtcbiAgICB2YXIgdmFsdWVUeXBlID0gJyc7XG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICAgIHZhbHVlVHlwZSA9IHRvU3RyaW5nJDEuY2FsbCh2YWx1ZSk7XG4gICAgfVxuXG4gICAgLy8gQ2Fubm90IHVzZSBgdmFsdWUgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcmAgb3Igc3VjaCBoZXJlLCBhcyB0aGVzZVxuICAgIC8vIGNoZWNrcyBmYWlsIHdoZW4gcnVubmluZyB0aGUgdGVzdHMgdXNpbmcgY2FzcGVyLmpzLi4uXG4gICAgLy9cbiAgICAvLyBUT0RPOiBTZWUgd2h5IHRob3NlIHRlc3RzIGZhaWwgYW5kIHVzZSBhIGJldHRlciBzb2x1dGlvbi5cbiAgICBpZiAodmFsdWUgJiYgKHZhbHVlVHlwZSA9PT0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJyB8fCB2YWx1ZS5idWZmZXIgJiYgdG9TdHJpbmckMS5jYWxsKHZhbHVlLmJ1ZmZlcikgPT09ICdbb2JqZWN0IEFycmF5QnVmZmVyXScpKSB7XG4gICAgICAgIC8vIENvbnZlcnQgYmluYXJ5IGFycmF5cyB0byBhIHN0cmluZyBhbmQgcHJlZml4IHRoZSBzdHJpbmcgd2l0aFxuICAgICAgICAvLyBhIHNwZWNpYWwgbWFya2VyLlxuICAgICAgICB2YXIgYnVmZmVyO1xuICAgICAgICB2YXIgbWFya2VyID0gU0VSSUFMSVpFRF9NQVJLRVI7XG5cbiAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICAgICAgICAgIGJ1ZmZlciA9IHZhbHVlO1xuICAgICAgICAgICAgbWFya2VyICs9IFRZUEVfQVJSQVlCVUZGRVI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBidWZmZXIgPSB2YWx1ZS5idWZmZXI7XG5cbiAgICAgICAgICAgIGlmICh2YWx1ZVR5cGUgPT09ICdbb2JqZWN0IEludDhBcnJheV0nKSB7XG4gICAgICAgICAgICAgICAgbWFya2VyICs9IFRZUEVfSU5UOEFSUkFZO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVR5cGUgPT09ICdbb2JqZWN0IFVpbnQ4QXJyYXldJykge1xuICAgICAgICAgICAgICAgIG1hcmtlciArPSBUWVBFX1VJTlQ4QVJSQVk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlVHlwZSA9PT0gJ1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJykge1xuICAgICAgICAgICAgICAgIG1hcmtlciArPSBUWVBFX1VJTlQ4Q0xBTVBFREFSUkFZO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVR5cGUgPT09ICdbb2JqZWN0IEludDE2QXJyYXldJykge1xuICAgICAgICAgICAgICAgIG1hcmtlciArPSBUWVBFX0lOVDE2QVJSQVk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlVHlwZSA9PT0gJ1tvYmplY3QgVWludDE2QXJyYXldJykge1xuICAgICAgICAgICAgICAgIG1hcmtlciArPSBUWVBFX1VJTlQxNkFSUkFZO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVR5cGUgPT09ICdbb2JqZWN0IEludDMyQXJyYXldJykge1xuICAgICAgICAgICAgICAgIG1hcmtlciArPSBUWVBFX0lOVDMyQVJSQVk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlVHlwZSA9PT0gJ1tvYmplY3QgVWludDMyQXJyYXldJykge1xuICAgICAgICAgICAgICAgIG1hcmtlciArPSBUWVBFX1VJTlQzMkFSUkFZO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVR5cGUgPT09ICdbb2JqZWN0IEZsb2F0MzJBcnJheV0nKSB7XG4gICAgICAgICAgICAgICAgbWFya2VyICs9IFRZUEVfRkxPQVQzMkFSUkFZO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVR5cGUgPT09ICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nKSB7XG4gICAgICAgICAgICAgICAgbWFya2VyICs9IFRZUEVfRkxPQVQ2NEFSUkFZO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhuZXcgRXJyb3IoJ0ZhaWxlZCB0byBnZXQgdHlwZSBmb3IgQmluYXJ5QXJyYXknKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFjayhtYXJrZXIgKyBidWZmZXJUb1N0cmluZyhidWZmZXIpKTtcbiAgICB9IGVsc2UgaWYgKHZhbHVlVHlwZSA9PT0gJ1tvYmplY3QgQmxvYl0nKSB7XG4gICAgICAgIC8vIENvbnZlciB0aGUgYmxvYiB0byBhIGJpbmFyeUFycmF5IGFuZCB0aGVuIHRvIGEgc3RyaW5nLlxuICAgICAgICB2YXIgZmlsZVJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cbiAgICAgICAgZmlsZVJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBCYWNrd2FyZHMtY29tcGF0aWJsZSBwcmVmaXggZm9yIHRoZSBibG9iIHR5cGUuXG4gICAgICAgICAgICB2YXIgc3RyID0gQkxPQl9UWVBFX1BSRUZJWCArIHZhbHVlLnR5cGUgKyAnficgKyBidWZmZXJUb1N0cmluZyh0aGlzLnJlc3VsdCk7XG5cbiAgICAgICAgICAgIGNhbGxiYWNrKFNFUklBTElaRURfTUFSS0VSICsgVFlQRV9CTE9CICsgc3RyKTtcbiAgICAgICAgfTtcblxuICAgICAgICBmaWxlUmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY2FsbGJhY2soSlNPTi5zdHJpbmdpZnkodmFsdWUpKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkNvdWxkbid0IGNvbnZlcnQgdmFsdWUgaW50byBhIEpTT04gc3RyaW5nOiBcIiwgdmFsdWUpO1xuXG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCBlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLy8gRGVzZXJpYWxpemUgZGF0YSB3ZSd2ZSBpbnNlcnRlZCBpbnRvIGEgdmFsdWUgY29sdW1uL2ZpZWxkLiBXZSBwbGFjZVxuLy8gc3BlY2lhbCBtYXJrZXJzIGludG8gb3VyIHN0cmluZ3MgdG8gbWFyayB0aGVtIGFzIGVuY29kZWQ7IHRoaXMgaXNuJ3Rcbi8vIGFzIG5pY2UgYXMgYSBtZXRhIGZpZWxkLCBidXQgaXQncyB0aGUgb25seSBzYW5lIHRoaW5nIHdlIGNhbiBkbyB3aGlsc3Rcbi8vIGtlZXBpbmcgbG9jYWxTdG9yYWdlIHN1cHBvcnQgaW50YWN0LlxuLy9cbi8vIE9mdGVudGltZXMgdGhpcyB3aWxsIGp1c3QgZGVzZXJpYWxpemUgSlNPTiBjb250ZW50LCBidXQgaWYgd2UgaGF2ZSBhXG4vLyBzcGVjaWFsIG1hcmtlciAoU0VSSUFMSVpFRF9NQVJLRVIsIGRlZmluZWQgYWJvdmUpLCB3ZSB3aWxsIGV4dHJhY3Rcbi8vIHNvbWUga2luZCBvZiBhcnJheWJ1ZmZlci9iaW5hcnkgZGF0YS90eXBlZCBhcnJheSBvdXQgb2YgdGhlIHN0cmluZy5cbmZ1bmN0aW9uIGRlc2VyaWFsaXplKHZhbHVlKSB7XG4gICAgLy8gSWYgd2UgaGF2ZW4ndCBtYXJrZWQgdGhpcyBzdHJpbmcgYXMgYmVpbmcgc3BlY2lhbGx5IHNlcmlhbGl6ZWQgKGkuZS5cbiAgICAvLyBzb21ldGhpbmcgb3RoZXIgdGhhbiBzZXJpYWxpemVkIEpTT04pLCB3ZSBjYW4ganVzdCByZXR1cm4gaXQgYW5kIGJlXG4gICAgLy8gZG9uZSB3aXRoIGl0LlxuICAgIGlmICh2YWx1ZS5zdWJzdHJpbmcoMCwgU0VSSUFMSVpFRF9NQVJLRVJfTEVOR1RIKSAhPT0gU0VSSUFMSVpFRF9NQVJLRVIpIHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UodmFsdWUpO1xuICAgIH1cblxuICAgIC8vIFRoZSBmb2xsb3dpbmcgY29kZSBkZWFscyB3aXRoIGRlc2VyaWFsaXppbmcgc29tZSBraW5kIG9mIEJsb2Igb3JcbiAgICAvLyBUeXBlZEFycmF5LiBGaXJzdCB3ZSBzZXBhcmF0ZSBvdXQgdGhlIHR5cGUgb2YgZGF0YSB3ZSdyZSBkZWFsaW5nXG4gICAgLy8gd2l0aCBmcm9tIHRoZSBkYXRhIGl0c2VsZi5cbiAgICB2YXIgc2VyaWFsaXplZFN0cmluZyA9IHZhbHVlLnN1YnN0cmluZyhUWVBFX1NFUklBTElaRURfTUFSS0VSX0xFTkdUSCk7XG4gICAgdmFyIHR5cGUgPSB2YWx1ZS5zdWJzdHJpbmcoU0VSSUFMSVpFRF9NQVJLRVJfTEVOR1RILCBUWVBFX1NFUklBTElaRURfTUFSS0VSX0xFTkdUSCk7XG5cbiAgICB2YXIgYmxvYlR5cGU7XG4gICAgLy8gQmFja3dhcmRzLWNvbXBhdGlibGUgYmxvYiB0eXBlIHNlcmlhbGl6YXRpb24gc3RyYXRlZ3kuXG4gICAgLy8gREJzIGNyZWF0ZWQgd2l0aCBvbGRlciB2ZXJzaW9ucyBvZiBsb2NhbEZvcmFnZSB3aWxsIHNpbXBseSBub3QgaGF2ZSB0aGUgYmxvYiB0eXBlLlxuICAgIGlmICh0eXBlID09PSBUWVBFX0JMT0IgJiYgQkxPQl9UWVBFX1BSRUZJWF9SRUdFWC50ZXN0KHNlcmlhbGl6ZWRTdHJpbmcpKSB7XG4gICAgICAgIHZhciBtYXRjaGVyID0gc2VyaWFsaXplZFN0cmluZy5tYXRjaChCTE9CX1RZUEVfUFJFRklYX1JFR0VYKTtcbiAgICAgICAgYmxvYlR5cGUgPSBtYXRjaGVyWzFdO1xuICAgICAgICBzZXJpYWxpemVkU3RyaW5nID0gc2VyaWFsaXplZFN0cmluZy5zdWJzdHJpbmcobWF0Y2hlclswXS5sZW5ndGgpO1xuICAgIH1cbiAgICB2YXIgYnVmZmVyID0gc3RyaW5nVG9CdWZmZXIoc2VyaWFsaXplZFN0cmluZyk7XG5cbiAgICAvLyBSZXR1cm4gdGhlIHJpZ2h0IHR5cGUgYmFzZWQgb24gdGhlIGNvZGUvdHlwZSBzZXQgZHVyaW5nXG4gICAgLy8gc2VyaWFsaXphdGlvbi5cbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSBUWVBFX0FSUkFZQlVGRkVSOlxuICAgICAgICAgICAgcmV0dXJuIGJ1ZmZlcjtcbiAgICAgICAgY2FzZSBUWVBFX0JMT0I6XG4gICAgICAgICAgICByZXR1cm4gY3JlYXRlQmxvYihbYnVmZmVyXSwgeyB0eXBlOiBibG9iVHlwZSB9KTtcbiAgICAgICAgY2FzZSBUWVBFX0lOVDhBUlJBWTpcbiAgICAgICAgICAgIHJldHVybiBuZXcgSW50OEFycmF5KGJ1ZmZlcik7XG4gICAgICAgIGNhc2UgVFlQRV9VSU5UOEFSUkFZOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG4gICAgICAgIGNhc2UgVFlQRV9VSU5UOENMQU1QRURBUlJBWTpcbiAgICAgICAgICAgIHJldHVybiBuZXcgVWludDhDbGFtcGVkQXJyYXkoYnVmZmVyKTtcbiAgICAgICAgY2FzZSBUWVBFX0lOVDE2QVJSQVk6XG4gICAgICAgICAgICByZXR1cm4gbmV3IEludDE2QXJyYXkoYnVmZmVyKTtcbiAgICAgICAgY2FzZSBUWVBFX1VJTlQxNkFSUkFZOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBVaW50MTZBcnJheShidWZmZXIpO1xuICAgICAgICBjYXNlIFRZUEVfSU5UMzJBUlJBWTpcbiAgICAgICAgICAgIHJldHVybiBuZXcgSW50MzJBcnJheShidWZmZXIpO1xuICAgICAgICBjYXNlIFRZUEVfVUlOVDMyQVJSQVk6XG4gICAgICAgICAgICByZXR1cm4gbmV3IFVpbnQzMkFycmF5KGJ1ZmZlcik7XG4gICAgICAgIGNhc2UgVFlQRV9GTE9BVDMyQVJSQVk6XG4gICAgICAgICAgICByZXR1cm4gbmV3IEZsb2F0MzJBcnJheShidWZmZXIpO1xuICAgICAgICBjYXNlIFRZUEVfRkxPQVQ2NEFSUkFZOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBGbG9hdDY0QXJyYXkoYnVmZmVyKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5rb3duIHR5cGU6ICcgKyB0eXBlKTtcbiAgICB9XG59XG5cbnZhciBsb2NhbGZvcmFnZVNlcmlhbGl6ZXIgPSB7XG4gICAgc2VyaWFsaXplOiBzZXJpYWxpemUsXG4gICAgZGVzZXJpYWxpemU6IGRlc2VyaWFsaXplLFxuICAgIHN0cmluZ1RvQnVmZmVyOiBzdHJpbmdUb0J1ZmZlcixcbiAgICBidWZmZXJUb1N0cmluZzogYnVmZmVyVG9TdHJpbmdcbn07XG5cbi8qXG4gKiBJbmNsdWRlcyBjb2RlIGZyb206XG4gKlxuICogYmFzZTY0LWFycmF5YnVmZmVyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vbmlrbGFzdmgvYmFzZTY0LWFycmF5YnVmZmVyXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDEyIE5pa2xhcyB2b24gSGVydHplblxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuICovXG5cbmZ1bmN0aW9uIGNyZWF0ZURiVGFibGUodCwgZGJJbmZvLCBjYWxsYmFjaywgZXJyb3JDYWxsYmFjaykge1xuICAgIHQuZXhlY3V0ZVNxbCgnQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgJyArIGRiSW5mby5zdG9yZU5hbWUgKyAnICcgKyAnKGlkIElOVEVHRVIgUFJJTUFSWSBLRVksIGtleSB1bmlxdWUsIHZhbHVlKScsIFtdLCBjYWxsYmFjaywgZXJyb3JDYWxsYmFjayk7XG59XG5cbi8vIE9wZW4gdGhlIFdlYlNRTCBkYXRhYmFzZSAoYXV0b21hdGljYWxseSBjcmVhdGVzIG9uZSBpZiBvbmUgZGlkbid0XG4vLyBwcmV2aW91c2x5IGV4aXN0KSwgdXNpbmcgYW55IG9wdGlvbnMgc2V0IGluIHRoZSBjb25maWcuXG5mdW5jdGlvbiBfaW5pdFN0b3JhZ2UkMShvcHRpb25zKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBkYkluZm8gPSB7XG4gICAgICAgIGRiOiBudWxsXG4gICAgfTtcblxuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICAgIGZvciAodmFyIGkgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgZGJJbmZvW2ldID0gdHlwZW9mIG9wdGlvbnNbaV0gIT09ICdzdHJpbmcnID8gb3B0aW9uc1tpXS50b1N0cmluZygpIDogb3B0aW9uc1tpXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBkYkluZm9Qcm9taXNlID0gbmV3IFByb21pc2UkMShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIC8vIE9wZW4gdGhlIGRhdGFiYXNlOyB0aGUgb3BlbkRhdGFiYXNlIEFQSSB3aWxsIGF1dG9tYXRpY2FsbHlcbiAgICAgICAgLy8gY3JlYXRlIGl0IGZvciB1cyBpZiBpdCBkb2Vzbid0IGV4aXN0LlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZGJJbmZvLmRiID0gb3BlbkRhdGFiYXNlKGRiSW5mby5uYW1lLCBTdHJpbmcoZGJJbmZvLnZlcnNpb24pLCBkYkluZm8uZGVzY3JpcHRpb24sIGRiSW5mby5zaXplKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSBvdXIga2V5L3ZhbHVlIHRhYmxlIGlmIGl0IGRvZXNuJ3QgZXhpc3QuXG4gICAgICAgIGRiSW5mby5kYi50cmFuc2FjdGlvbihmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgY3JlYXRlRGJUYWJsZSh0LCBkYkluZm8sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9kYkluZm8gPSBkYkluZm87XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHQsIGVycm9yKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCByZWplY3QpO1xuICAgIH0pO1xuXG4gICAgZGJJbmZvLnNlcmlhbGl6ZXIgPSBsb2NhbGZvcmFnZVNlcmlhbGl6ZXI7XG4gICAgcmV0dXJuIGRiSW5mb1Byb21pc2U7XG59XG5cbmZ1bmN0aW9uIHRyeUV4ZWN1dGVTcWwodCwgZGJJbmZvLCBzcWxTdGF0ZW1lbnQsIGFyZ3MsIGNhbGxiYWNrLCBlcnJvckNhbGxiYWNrKSB7XG4gICAgdC5leGVjdXRlU3FsKHNxbFN0YXRlbWVudCwgYXJncywgY2FsbGJhY2ssIGZ1bmN0aW9uICh0LCBlcnJvcikge1xuICAgICAgICBpZiAoZXJyb3IuY29kZSA9PT0gZXJyb3IuU1lOVEFYX0VSUikge1xuICAgICAgICAgICAgdC5leGVjdXRlU3FsKCdTRUxFQ1QgbmFtZSBGUk9NIHNxbGl0ZV9tYXN0ZXIgJyArIFwiV0hFUkUgdHlwZT0ndGFibGUnIEFORCBuYW1lID0gP1wiLCBbbmFtZV0sIGZ1bmN0aW9uICh0LCByZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFyZXN1bHRzLnJvd3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZSB0YWJsZSBpcyBtaXNzaW5nICh3YXMgZGVsZXRlZClcbiAgICAgICAgICAgICAgICAgICAgLy8gcmUtY3JlYXRlIGl0IHRhYmxlIGFuZCByZXRyeVxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVEYlRhYmxlKHQsIGRiSW5mbywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdC5leGVjdXRlU3FsKHNxbFN0YXRlbWVudCwgYXJncywgY2FsbGJhY2ssIGVycm9yQ2FsbGJhY2spO1xuICAgICAgICAgICAgICAgICAgICB9LCBlcnJvckNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlcnJvckNhbGxiYWNrKHQsIGVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCBlcnJvckNhbGxiYWNrKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVycm9yQ2FsbGJhY2sodCwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfSwgZXJyb3JDYWxsYmFjayk7XG59XG5cbmZ1bmN0aW9uIGdldEl0ZW0kMShrZXksIGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAga2V5ID0gbm9ybWFsaXplS2V5KGtleSk7XG5cbiAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZGJJbmZvID0gc2VsZi5fZGJJbmZvO1xuICAgICAgICAgICAgZGJJbmZvLmRiLnRyYW5zYWN0aW9uKGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICAgICAgdHJ5RXhlY3V0ZVNxbCh0LCBkYkluZm8sICdTRUxFQ1QgKiBGUk9NICcgKyBkYkluZm8uc3RvcmVOYW1lICsgJyBXSEVSRSBrZXkgPSA/IExJTUlUIDEnLCBba2V5XSwgZnVuY3Rpb24gKHQsIHJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHJlc3VsdHMucm93cy5sZW5ndGggPyByZXN1bHRzLnJvd3MuaXRlbSgwKS52YWx1ZSA6IG51bGw7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHRoaXMgaXMgc2VyaWFsaXplZCBjb250ZW50IHdlIG5lZWQgdG9cbiAgICAgICAgICAgICAgICAgICAgLy8gdW5wYWNrLlxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBkYkluZm8uc2VyaWFsaXplci5kZXNlcmlhbGl6ZShyZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICh0LCBlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pW1wiY2F0Y2hcIl0ocmVqZWN0KTtcbiAgICB9KTtcblxuICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cbmZ1bmN0aW9uIGl0ZXJhdGUkMShpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZGJJbmZvID0gc2VsZi5fZGJJbmZvO1xuXG4gICAgICAgICAgICBkYkluZm8uZGIudHJhbnNhY3Rpb24oZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgICAgICB0cnlFeGVjdXRlU3FsKHQsIGRiSW5mbywgJ1NFTEVDVCAqIEZST00gJyArIGRiSW5mby5zdG9yZU5hbWUsIFtdLCBmdW5jdGlvbiAodCwgcmVzdWx0cykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcm93cyA9IHJlc3VsdHMucm93cztcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxlbmd0aCA9IHJvd3MubGVuZ3RoO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpdGVtID0gcm93cy5pdGVtKGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGl0ZW0udmFsdWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiB0aGlzIGlzIHNlcmlhbGl6ZWQgY29udGVudFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2UgbmVlZCB0byB1bnBhY2suXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZGJJbmZvLnNlcmlhbGl6ZXIuZGVzZXJpYWxpemUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gaXRlcmF0b3IocmVzdWx0LCBpdGVtLmtleSwgaSArIDEpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB2b2lkKDApIHByZXZlbnRzIHByb2JsZW1zIHdpdGggcmVkZWZpbml0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBvZiBgdW5kZWZpbmVkYC5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgIT09IHZvaWQgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHQsIGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlbXCJjYXRjaFwiXShyZWplY3QpO1xuICAgIH0pO1xuXG4gICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuZnVuY3Rpb24gX3NldEl0ZW0oa2V5LCB2YWx1ZSwgY2FsbGJhY2ssIHJldHJpZXNMZWZ0KSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAga2V5ID0gbm9ybWFsaXplS2V5KGtleSk7XG5cbiAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBUaGUgbG9jYWxTdG9yYWdlIEFQSSBkb2Vzbid0IHJldHVybiB1bmRlZmluZWQgdmFsdWVzIGluIGFuXG4gICAgICAgICAgICAvLyBcImV4cGVjdGVkXCIgd2F5LCBzbyB1bmRlZmluZWQgaXMgYWx3YXlzIGNhc3QgdG8gbnVsbCBpbiBhbGxcbiAgICAgICAgICAgIC8vIGRyaXZlcnMuIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL21vemlsbGEvbG9jYWxGb3JhZ2UvcHVsbC80MlxuICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFNhdmUgdGhlIG9yaWdpbmFsIHZhbHVlIHRvIHBhc3MgdG8gdGhlIGNhbGxiYWNrLlxuICAgICAgICAgICAgdmFyIG9yaWdpbmFsVmFsdWUgPSB2YWx1ZTtcblxuICAgICAgICAgICAgdmFyIGRiSW5mbyA9IHNlbGYuX2RiSW5mbztcbiAgICAgICAgICAgIGRiSW5mby5zZXJpYWxpemVyLnNlcmlhbGl6ZSh2YWx1ZSwgZnVuY3Rpb24gKHZhbHVlLCBlcnJvcikge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRiSW5mby5kYi50cmFuc2FjdGlvbihmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5RXhlY3V0ZVNxbCh0LCBkYkluZm8sICdJTlNFUlQgT1IgUkVQTEFDRSBJTlRPICcgKyBkYkluZm8uc3RvcmVOYW1lICsgJyAnICsgJyhrZXksIHZhbHVlKSBWQUxVRVMgKD8sID8pJywgW2tleSwgdmFsdWVdLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShvcmlnaW5hbFZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICh0LCBlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHNxbEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgdHJhbnNhY3Rpb24gZmFpbGVkOyBjaGVja1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdG8gc2VlIGlmIGl0J3MgYSBxdW90YSBlcnJvci5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzcWxFcnJvci5jb2RlID09PSBzcWxFcnJvci5RVU9UQV9FUlIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSByZWplY3QgdGhlIGNhbGxiYWNrIG91dHJpZ2h0IGZvciBub3csIGJ1dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGl0J3Mgd29ydGggdHJ5aW5nIHRvIHJlLXJ1biB0aGUgdHJhbnNhY3Rpb24uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRXZlbiBpZiB0aGUgdXNlciBhY2NlcHRzIHRoZSBwcm9tcHQgdG8gdXNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbW9yZSBzdG9yYWdlIG9uIFNhZmFyaSwgdGhpcyBlcnJvciB3aWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYmUgY2FsbGVkLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVHJ5IHRvIHJlLXJ1biB0aGUgdHJhbnNhY3Rpb24uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJldHJpZXNMZWZ0ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKF9zZXRJdGVtLmFwcGx5KHNlbGYsIFtrZXksIG9yaWdpbmFsVmFsdWUsIGNhbGxiYWNrLCByZXRyaWVzTGVmdCAtIDFdKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHNxbEVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pW1wiY2F0Y2hcIl0ocmVqZWN0KTtcbiAgICB9KTtcblxuICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cbmZ1bmN0aW9uIHNldEl0ZW0kMShrZXksIHZhbHVlLCBjYWxsYmFjaykge1xuICAgIHJldHVybiBfc2V0SXRlbS5hcHBseSh0aGlzLCBba2V5LCB2YWx1ZSwgY2FsbGJhY2ssIDFdKTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlSXRlbSQxKGtleSwgY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBrZXkgPSBub3JtYWxpemVLZXkoa2V5KTtcblxuICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UkMShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBkYkluZm8gPSBzZWxmLl9kYkluZm87XG4gICAgICAgICAgICBkYkluZm8uZGIudHJhbnNhY3Rpb24oZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgICAgICB0cnlFeGVjdXRlU3FsKHQsIGRiSW5mbywgJ0RFTEVURSBGUk9NICcgKyBkYkluZm8uc3RvcmVOYW1lICsgJyBXSEVSRSBrZXkgPSA/JywgW2tleV0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICh0LCBlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pW1wiY2F0Y2hcIl0ocmVqZWN0KTtcbiAgICB9KTtcblxuICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cbi8vIERlbGV0ZXMgZXZlcnkgaXRlbSBpbiB0aGUgdGFibGUuXG4vLyBUT0RPOiBGaW5kIG91dCBpZiB0aGlzIHJlc2V0cyB0aGUgQVVUT19JTkNSRU1FTlQgbnVtYmVyLlxuZnVuY3Rpb24gY2xlYXIkMShjYWxsYmFjaykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UkMShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBkYkluZm8gPSBzZWxmLl9kYkluZm87XG4gICAgICAgICAgICBkYkluZm8uZGIudHJhbnNhY3Rpb24oZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgICAgICB0cnlFeGVjdXRlU3FsKHQsIGRiSW5mbywgJ0RFTEVURSBGUk9NICcgKyBkYkluZm8uc3RvcmVOYW1lLCBbXSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHQsIGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlbXCJjYXRjaFwiXShyZWplY3QpO1xuICAgIH0pO1xuXG4gICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuLy8gRG9lcyBhIHNpbXBsZSBgQ09VTlQoa2V5KWAgdG8gZ2V0IHRoZSBudW1iZXIgb2YgaXRlbXMgc3RvcmVkIGluXG4vLyBsb2NhbEZvcmFnZS5cbmZ1bmN0aW9uIGxlbmd0aCQxKGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSQxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGRiSW5mbyA9IHNlbGYuX2RiSW5mbztcbiAgICAgICAgICAgIGRiSW5mby5kYi50cmFuc2FjdGlvbihmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgICAgIC8vIEFoaGgsIFNRTCBtYWtlcyB0aGlzIG9uZSBzb29vb29vIGVhc3kuXG4gICAgICAgICAgICAgICAgdHJ5RXhlY3V0ZVNxbCh0LCBkYkluZm8sICdTRUxFQ1QgQ09VTlQoa2V5KSBhcyBjIEZST00gJyArIGRiSW5mby5zdG9yZU5hbWUsIFtdLCBmdW5jdGlvbiAodCwgcmVzdWx0cykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gcmVzdWx0cy5yb3dzLml0ZW0oMCkuYztcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICh0LCBlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pW1wiY2F0Y2hcIl0ocmVqZWN0KTtcbiAgICB9KTtcblxuICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cbi8vIFJldHVybiB0aGUga2V5IGxvY2F0ZWQgYXQga2V5IGluZGV4IFg7IGVzc2VudGlhbGx5IGdldHMgdGhlIGtleSBmcm9tIGFcbi8vIGBXSEVSRSBpZCA9ID9gLiBUaGlzIGlzIHRoZSBtb3N0IGVmZmljaWVudCB3YXkgSSBjYW4gdGhpbmsgdG8gaW1wbGVtZW50XG4vLyB0aGlzIHJhcmVseS11c2VkIChpbiBteSBleHBlcmllbmNlKSBwYXJ0IG9mIHRoZSBBUEksIGJ1dCBpdCBjYW4gc2VlbVxuLy8gaW5jb25zaXN0ZW50LCBiZWNhdXNlIHdlIGRvIGBJTlNFUlQgT1IgUkVQTEFDRSBJTlRPYCBvbiBgc2V0SXRlbSgpYCwgc29cbi8vIHRoZSBJRCBvZiBlYWNoIGtleSB3aWxsIGNoYW5nZSBldmVyeSB0aW1lIGl0J3MgdXBkYXRlZC4gUGVyaGFwcyBhIHN0b3JlZFxuLy8gcHJvY2VkdXJlIGZvciB0aGUgYHNldEl0ZW0oKWAgU1FMIHdvdWxkIHNvbHZlIHRoaXMgcHJvYmxlbT9cbi8vIFRPRE86IERvbid0IGNoYW5nZSBJRCBvbiBgc2V0SXRlbSgpYC5cbmZ1bmN0aW9uIGtleSQxKG4sIGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSQxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGRiSW5mbyA9IHNlbGYuX2RiSW5mbztcbiAgICAgICAgICAgIGRiSW5mby5kYi50cmFuc2FjdGlvbihmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgICAgIHRyeUV4ZWN1dGVTcWwodCwgZGJJbmZvLCAnU0VMRUNUIGtleSBGUk9NICcgKyBkYkluZm8uc3RvcmVOYW1lICsgJyBXSEVSRSBpZCA9ID8gTElNSVQgMScsIFtuICsgMV0sIGZ1bmN0aW9uICh0LCByZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSByZXN1bHRzLnJvd3MubGVuZ3RoID8gcmVzdWx0cy5yb3dzLml0ZW0oMCkua2V5IDogbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICh0LCBlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pW1wiY2F0Y2hcIl0ocmVqZWN0KTtcbiAgICB9KTtcblxuICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cbmZ1bmN0aW9uIGtleXMkMShjYWxsYmFjaykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UkMShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBkYkluZm8gPSBzZWxmLl9kYkluZm87XG4gICAgICAgICAgICBkYkluZm8uZGIudHJhbnNhY3Rpb24oZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgICAgICB0cnlFeGVjdXRlU3FsKHQsIGRiSW5mbywgJ1NFTEVDVCBrZXkgRlJPTSAnICsgZGJJbmZvLnN0b3JlTmFtZSwgW10sIGZ1bmN0aW9uICh0LCByZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXlzID0gW107XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXN1bHRzLnJvd3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleXMucHVzaChyZXN1bHRzLnJvd3MuaXRlbShpKS5rZXkpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShrZXlzKTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAodCwgZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVtcImNhdGNoXCJdKHJlamVjdCk7XG4gICAgfSk7XG5cbiAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG4vLyBodHRwczovL3d3dy53My5vcmcvVFIvd2ViZGF0YWJhc2UvI2RhdGFiYXNlc1xuLy8gPiBUaGVyZSBpcyBubyB3YXkgdG8gZW51bWVyYXRlIG9yIGRlbGV0ZSB0aGUgZGF0YWJhc2VzIGF2YWlsYWJsZSBmb3IgYW4gb3JpZ2luIGZyb20gdGhpcyBBUEkuXG5mdW5jdGlvbiBnZXRBbGxTdG9yZU5hbWVzKGRiKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBkYi50cmFuc2FjdGlvbihmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgdC5leGVjdXRlU3FsKCdTRUxFQ1QgbmFtZSBGUk9NIHNxbGl0ZV9tYXN0ZXIgJyArIFwiV0hFUkUgdHlwZT0ndGFibGUnIEFORCBuYW1lIDw+ICdfX1dlYktpdERhdGFiYXNlSW5mb1RhYmxlX18nXCIsIFtdLCBmdW5jdGlvbiAodCwgcmVzdWx0cykge1xuICAgICAgICAgICAgICAgIHZhciBzdG9yZU5hbWVzID0gW107XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlc3VsdHMucm93cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBzdG9yZU5hbWVzLnB1c2gocmVzdWx0cy5yb3dzLml0ZW0oaSkubmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgIGRiOiBkYixcbiAgICAgICAgICAgICAgICAgICAgc3RvcmVOYW1lczogc3RvcmVOYW1lc1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHQsIGVycm9yKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoc3FsRXJyb3IpIHtcbiAgICAgICAgICAgIHJlamVjdChzcWxFcnJvcik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBkcm9wSW5zdGFuY2UkMShvcHRpb25zLCBjYWxsYmFjaykge1xuICAgIGNhbGxiYWNrID0gZ2V0Q2FsbGJhY2suYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIHZhciBjdXJyZW50Q29uZmlnID0gdGhpcy5jb25maWcoKTtcbiAgICBvcHRpb25zID0gdHlwZW9mIG9wdGlvbnMgIT09ICdmdW5jdGlvbicgJiYgb3B0aW9ucyB8fCB7fTtcbiAgICBpZiAoIW9wdGlvbnMubmFtZSkge1xuICAgICAgICBvcHRpb25zLm5hbWUgPSBvcHRpb25zLm5hbWUgfHwgY3VycmVudENvbmZpZy5uYW1lO1xuICAgICAgICBvcHRpb25zLnN0b3JlTmFtZSA9IG9wdGlvbnMuc3RvcmVOYW1lIHx8IGN1cnJlbnRDb25maWcuc3RvcmVOYW1lO1xuICAgIH1cblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgcHJvbWlzZTtcbiAgICBpZiAoIW9wdGlvbnMubmFtZSkge1xuICAgICAgICBwcm9taXNlID0gUHJvbWlzZSQxLnJlamVjdCgnSW52YWxpZCBhcmd1bWVudHMnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBwcm9taXNlID0gbmV3IFByb21pc2UkMShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgICAgICAgICAgdmFyIGRiO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMubmFtZSA9PT0gY3VycmVudENvbmZpZy5uYW1lKSB7XG4gICAgICAgICAgICAgICAgLy8gdXNlIHRoZSBkYiByZWZlcmVuY2Ugb2YgdGhlIGN1cnJlbnQgaW5zdGFuY2VcbiAgICAgICAgICAgICAgICBkYiA9IHNlbGYuX2RiSW5mby5kYjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGIgPSBvcGVuRGF0YWJhc2Uob3B0aW9ucy5uYW1lLCAnJywgJycsIDApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIW9wdGlvbnMuc3RvcmVOYW1lKSB7XG4gICAgICAgICAgICAgICAgLy8gZHJvcCBhbGwgZGF0YWJhc2UgdGFibGVzXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShnZXRBbGxTdG9yZU5hbWVzKGRiKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICBkYjogZGIsXG4gICAgICAgICAgICAgICAgICAgIHN0b3JlTmFtZXM6IFtvcHRpb25zLnN0b3JlTmFtZV1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkudGhlbihmdW5jdGlvbiAob3BlcmF0aW9uSW5mbykge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbkluZm8uZGIudHJhbnNhY3Rpb24oZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gZHJvcFRhYmxlKHN0b3JlTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQuZXhlY3V0ZVNxbCgnRFJPUCBUQUJMRSBJRiBFWElTVFMgJyArIHN0b3JlTmFtZSwgW10sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICh0LCBlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgb3BlcmF0aW9ucyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gb3BlcmF0aW9uSW5mby5zdG9yZU5hbWVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb25zLnB1c2goZHJvcFRhYmxlKG9wZXJhdGlvbkluZm8uc3RvcmVOYW1lc1tpXSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgUHJvbWlzZSQxLmFsbChvcGVyYXRpb25zKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSlbXCJjYXRjaFwiXShmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoc3FsRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHNxbEVycm9yKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG52YXIgd2ViU1FMU3RvcmFnZSA9IHtcbiAgICBfZHJpdmVyOiAnd2ViU1FMU3RvcmFnZScsXG4gICAgX2luaXRTdG9yYWdlOiBfaW5pdFN0b3JhZ2UkMSxcbiAgICBfc3VwcG9ydDogaXNXZWJTUUxWYWxpZCgpLFxuICAgIGl0ZXJhdGU6IGl0ZXJhdGUkMSxcbiAgICBnZXRJdGVtOiBnZXRJdGVtJDEsXG4gICAgc2V0SXRlbTogc2V0SXRlbSQxLFxuICAgIHJlbW92ZUl0ZW06IHJlbW92ZUl0ZW0kMSxcbiAgICBjbGVhcjogY2xlYXIkMSxcbiAgICBsZW5ndGg6IGxlbmd0aCQxLFxuICAgIGtleToga2V5JDEsXG4gICAga2V5czoga2V5cyQxLFxuICAgIGRyb3BJbnN0YW5jZTogZHJvcEluc3RhbmNlJDFcbn07XG5cbmZ1bmN0aW9uIGlzTG9jYWxTdG9yYWdlVmFsaWQoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBsb2NhbFN0b3JhZ2UgIT09ICd1bmRlZmluZWQnICYmICdzZXRJdGVtJyBpbiBsb2NhbFN0b3JhZ2UgJiZcbiAgICAgICAgLy8gaW4gSUU4IHR5cGVvZiBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSA9PT0gJ29iamVjdCdcbiAgICAgICAgISFsb2NhbFN0b3JhZ2Uuc2V0SXRlbTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIF9nZXRLZXlQcmVmaXgob3B0aW9ucywgZGVmYXVsdENvbmZpZykge1xuICAgIHZhciBrZXlQcmVmaXggPSBvcHRpb25zLm5hbWUgKyAnLyc7XG5cbiAgICBpZiAob3B0aW9ucy5zdG9yZU5hbWUgIT09IGRlZmF1bHRDb25maWcuc3RvcmVOYW1lKSB7XG4gICAgICAgIGtleVByZWZpeCArPSBvcHRpb25zLnN0b3JlTmFtZSArICcvJztcbiAgICB9XG4gICAgcmV0dXJuIGtleVByZWZpeDtcbn1cblxuLy8gQ2hlY2sgaWYgbG9jYWxTdG9yYWdlIHRocm93cyB3aGVuIHNhdmluZyBhbiBpdGVtXG5mdW5jdGlvbiBjaGVja0lmTG9jYWxTdG9yYWdlVGhyb3dzKCkge1xuICAgIHZhciBsb2NhbFN0b3JhZ2VUZXN0S2V5ID0gJ19sb2NhbGZvcmFnZV9zdXBwb3J0X3Rlc3QnO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0obG9jYWxTdG9yYWdlVGVzdEtleSwgdHJ1ZSk7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGxvY2FsU3RvcmFnZVRlc3RLZXkpO1xuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn1cblxuLy8gQ2hlY2sgaWYgbG9jYWxTdG9yYWdlIGlzIHVzYWJsZSBhbmQgYWxsb3dzIHRvIHNhdmUgYW4gaXRlbVxuLy8gVGhpcyBtZXRob2QgY2hlY2tzIGlmIGxvY2FsU3RvcmFnZSBpcyB1c2FibGUgaW4gU2FmYXJpIFByaXZhdGUgQnJvd3Npbmdcbi8vIG1vZGUsIG9yIGluIGFueSBvdGhlciBjYXNlIHdoZXJlIHRoZSBhdmFpbGFibGUgcXVvdGEgZm9yIGxvY2FsU3RvcmFnZVxuLy8gaXMgMCBhbmQgdGhlcmUgd2Fzbid0IGFueSBzYXZlZCBpdGVtcyB5ZXQuXG5mdW5jdGlvbiBfaXNMb2NhbFN0b3JhZ2VVc2FibGUoKSB7XG4gICAgcmV0dXJuICFjaGVja0lmTG9jYWxTdG9yYWdlVGhyb3dzKCkgfHwgbG9jYWxTdG9yYWdlLmxlbmd0aCA+IDA7XG59XG5cbi8vIENvbmZpZyB0aGUgbG9jYWxTdG9yYWdlIGJhY2tlbmQsIHVzaW5nIG9wdGlvbnMgc2V0IGluIHRoZSBjb25maWcuXG5mdW5jdGlvbiBfaW5pdFN0b3JhZ2UkMihvcHRpb25zKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBkYkluZm8gPSB7fTtcbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgICBmb3IgKHZhciBpIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGRiSW5mb1tpXSA9IG9wdGlvbnNbaV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkYkluZm8ua2V5UHJlZml4ID0gX2dldEtleVByZWZpeChvcHRpb25zLCBzZWxmLl9kZWZhdWx0Q29uZmlnKTtcblxuICAgIGlmICghX2lzTG9jYWxTdG9yYWdlVXNhYmxlKCkpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UkMS5yZWplY3QoKTtcbiAgICB9XG5cbiAgICBzZWxmLl9kYkluZm8gPSBkYkluZm87XG4gICAgZGJJbmZvLnNlcmlhbGl6ZXIgPSBsb2NhbGZvcmFnZVNlcmlhbGl6ZXI7XG5cbiAgICByZXR1cm4gUHJvbWlzZSQxLnJlc29sdmUoKTtcbn1cblxuLy8gUmVtb3ZlIGFsbCBrZXlzIGZyb20gdGhlIGRhdGFzdG9yZSwgZWZmZWN0aXZlbHkgZGVzdHJveWluZyBhbGwgZGF0YSBpblxuLy8gdGhlIGFwcCdzIGtleS92YWx1ZSBzdG9yZSFcbmZ1bmN0aW9uIGNsZWFyJDIoY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHByb21pc2UgPSBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBrZXlQcmVmaXggPSBzZWxmLl9kYkluZm8ua2V5UHJlZml4O1xuXG4gICAgICAgIGZvciAodmFyIGkgPSBsb2NhbFN0b3JhZ2UubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIHZhciBrZXkgPSBsb2NhbFN0b3JhZ2Uua2V5KGkpO1xuXG4gICAgICAgICAgICBpZiAoa2V5LmluZGV4T2Yoa2V5UHJlZml4KSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cbi8vIFJldHJpZXZlIGFuIGl0ZW0gZnJvbSB0aGUgc3RvcmUuIFVubGlrZSB0aGUgb3JpZ2luYWwgYXN5bmNfc3RvcmFnZVxuLy8gbGlicmFyeSBpbiBHYWlhLCB3ZSBkb24ndCBtb2RpZnkgcmV0dXJuIHZhbHVlcyBhdCBhbGwuIElmIGEga2V5J3MgdmFsdWVcbi8vIGlzIGB1bmRlZmluZWRgLCB3ZSBwYXNzIHRoYXQgdmFsdWUgdG8gdGhlIGNhbGxiYWNrIGZ1bmN0aW9uLlxuZnVuY3Rpb24gZ2V0SXRlbSQyKGtleSwgY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBrZXkgPSBub3JtYWxpemVLZXkoa2V5KTtcblxuICAgIHZhciBwcm9taXNlID0gc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZGJJbmZvID0gc2VsZi5fZGJJbmZvO1xuICAgICAgICB2YXIgcmVzdWx0ID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oZGJJbmZvLmtleVByZWZpeCArIGtleSk7XG5cbiAgICAgICAgLy8gSWYgYSByZXN1bHQgd2FzIGZvdW5kLCBwYXJzZSBpdCBmcm9tIHRoZSBzZXJpYWxpemVkXG4gICAgICAgIC8vIHN0cmluZyBpbnRvIGEgSlMgb2JqZWN0LiBJZiByZXN1bHQgaXNuJ3QgdHJ1dGh5LCB0aGUga2V5XG4gICAgICAgIC8vIGlzIGxpa2VseSB1bmRlZmluZWQgYW5kIHdlJ2xsIHBhc3MgaXQgc3RyYWlnaHQgdG8gdGhlXG4gICAgICAgIC8vIGNhbGxiYWNrLlxuICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICByZXN1bHQgPSBkYkluZm8uc2VyaWFsaXplci5kZXNlcmlhbGl6ZShyZXN1bHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9KTtcblxuICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cbi8vIEl0ZXJhdGUgb3ZlciBhbGwgaXRlbXMgaW4gdGhlIHN0b3JlLlxuZnVuY3Rpb24gaXRlcmF0ZSQyKGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBwcm9taXNlID0gc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZGJJbmZvID0gc2VsZi5fZGJJbmZvO1xuICAgICAgICB2YXIga2V5UHJlZml4ID0gZGJJbmZvLmtleVByZWZpeDtcbiAgICAgICAgdmFyIGtleVByZWZpeExlbmd0aCA9IGtleVByZWZpeC5sZW5ndGg7XG4gICAgICAgIHZhciBsZW5ndGggPSBsb2NhbFN0b3JhZ2UubGVuZ3RoO1xuXG4gICAgICAgIC8vIFdlIHVzZSBhIGRlZGljYXRlZCBpdGVyYXRvciBpbnN0ZWFkIG9mIHRoZSBgaWAgdmFyaWFibGUgYmVsb3dcbiAgICAgICAgLy8gc28gb3RoZXIga2V5cyB3ZSBmZXRjaCBpbiBsb2NhbFN0b3JhZ2UgYXJlbid0IGNvdW50ZWQgaW5cbiAgICAgICAgLy8gdGhlIGBpdGVyYXRpb25OdW1iZXJgIGFyZ3VtZW50IHBhc3NlZCB0byB0aGUgYGl0ZXJhdGUoKWBcbiAgICAgICAgLy8gY2FsbGJhY2suXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFNlZTogZ2l0aHViLmNvbS9tb3ppbGxhL2xvY2FsRm9yYWdlL3B1bGwvNDM1I2Rpc2N1c3Npb25fcjM4MDYxNTMwXG4gICAgICAgIHZhciBpdGVyYXRpb25OdW1iZXIgPSAxO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBrZXkgPSBsb2NhbFN0b3JhZ2Uua2V5KGkpO1xuICAgICAgICAgICAgaWYgKGtleS5pbmRleE9mKGtleVByZWZpeCkgIT09IDApIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSk7XG5cbiAgICAgICAgICAgIC8vIElmIGEgcmVzdWx0IHdhcyBmb3VuZCwgcGFyc2UgaXQgZnJvbSB0aGUgc2VyaWFsaXplZFxuICAgICAgICAgICAgLy8gc3RyaW5nIGludG8gYSBKUyBvYmplY3QuIElmIHJlc3VsdCBpc24ndCB0cnV0aHksIHRoZVxuICAgICAgICAgICAgLy8ga2V5IGlzIGxpa2VseSB1bmRlZmluZWQgYW5kIHdlJ2xsIHBhc3MgaXQgc3RyYWlnaHRcbiAgICAgICAgICAgIC8vIHRvIHRoZSBpdGVyYXRvci5cbiAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gZGJJbmZvLnNlcmlhbGl6ZXIuZGVzZXJpYWxpemUodmFsdWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YWx1ZSA9IGl0ZXJhdG9yKHZhbHVlLCBrZXkuc3Vic3RyaW5nKGtleVByZWZpeExlbmd0aCksIGl0ZXJhdGlvbk51bWJlcisrKTtcblxuICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB2b2lkIDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cbi8vIFNhbWUgYXMgbG9jYWxTdG9yYWdlJ3Mga2V5KCkgbWV0aG9kLCBleGNlcHQgdGFrZXMgYSBjYWxsYmFjay5cbmZ1bmN0aW9uIGtleSQyKG4sIGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBwcm9taXNlID0gc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZGJJbmZvID0gc2VsZi5fZGJJbmZvO1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmVzdWx0ID0gbG9jYWxTdG9yYWdlLmtleShuKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZW1vdmUgdGhlIHByZWZpeCBmcm9tIHRoZSBrZXksIGlmIGEga2V5IGlzIGZvdW5kLlxuICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuc3Vic3RyaW5nKGRiSW5mby5rZXlQcmVmaXgubGVuZ3RoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSk7XG5cbiAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG5mdW5jdGlvbiBrZXlzJDIoY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHByb21pc2UgPSBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBkYkluZm8gPSBzZWxmLl9kYkluZm87XG4gICAgICAgIHZhciBsZW5ndGggPSBsb2NhbFN0b3JhZ2UubGVuZ3RoO1xuICAgICAgICB2YXIga2V5cyA9IFtdO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBpdGVtS2V5ID0gbG9jYWxTdG9yYWdlLmtleShpKTtcbiAgICAgICAgICAgIGlmIChpdGVtS2V5LmluZGV4T2YoZGJJbmZvLmtleVByZWZpeCkgPT09IDApIHtcbiAgICAgICAgICAgICAgICBrZXlzLnB1c2goaXRlbUtleS5zdWJzdHJpbmcoZGJJbmZvLmtleVByZWZpeC5sZW5ndGgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBrZXlzO1xuICAgIH0pO1xuXG4gICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuLy8gU3VwcGx5IHRoZSBudW1iZXIgb2Yga2V5cyBpbiB0aGUgZGF0YXN0b3JlIHRvIHRoZSBjYWxsYmFjayBmdW5jdGlvbi5cbmZ1bmN0aW9uIGxlbmd0aCQyKGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBwcm9taXNlID0gc2VsZi5rZXlzKCkudGhlbihmdW5jdGlvbiAoa2V5cykge1xuICAgICAgICByZXR1cm4ga2V5cy5sZW5ndGg7XG4gICAgfSk7XG5cbiAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG4vLyBSZW1vdmUgYW4gaXRlbSBmcm9tIHRoZSBzdG9yZSwgbmljZSBhbmQgc2ltcGxlLlxuZnVuY3Rpb24gcmVtb3ZlSXRlbSQyKGtleSwgY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBrZXkgPSBub3JtYWxpemVLZXkoa2V5KTtcblxuICAgIHZhciBwcm9taXNlID0gc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZGJJbmZvID0gc2VsZi5fZGJJbmZvO1xuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShkYkluZm8ua2V5UHJlZml4ICsga2V5KTtcbiAgICB9KTtcblxuICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cbi8vIFNldCBhIGtleSdzIHZhbHVlIGFuZCBydW4gYW4gb3B0aW9uYWwgY2FsbGJhY2sgb25jZSB0aGUgdmFsdWUgaXMgc2V0LlxuLy8gVW5saWtlIEdhaWEncyBpbXBsZW1lbnRhdGlvbiwgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uIGlzIHBhc3NlZCB0aGUgdmFsdWUsXG4vLyBpbiBjYXNlIHlvdSB3YW50IHRvIG9wZXJhdGUgb24gdGhhdCB2YWx1ZSBvbmx5IGFmdGVyIHlvdSdyZSBzdXJlIGl0XG4vLyBzYXZlZCwgb3Igc29tZXRoaW5nIGxpa2UgdGhhdC5cbmZ1bmN0aW9uIHNldEl0ZW0kMihrZXksIHZhbHVlLCBjYWxsYmFjaykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGtleSA9IG5vcm1hbGl6ZUtleShrZXkpO1xuXG4gICAgdmFyIHByb21pc2UgPSBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIENvbnZlcnQgdW5kZWZpbmVkIHZhbHVlcyB0byBudWxsLlxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS9sb2NhbEZvcmFnZS9wdWxsLzQyXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTYXZlIHRoZSBvcmlnaW5hbCB2YWx1ZSB0byBwYXNzIHRvIHRoZSBjYWxsYmFjay5cbiAgICAgICAgdmFyIG9yaWdpbmFsVmFsdWUgPSB2YWx1ZTtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UkMShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICB2YXIgZGJJbmZvID0gc2VsZi5fZGJJbmZvO1xuICAgICAgICAgICAgZGJJbmZvLnNlcmlhbGl6ZXIuc2VyaWFsaXplKHZhbHVlLCBmdW5jdGlvbiAodmFsdWUsIGVycm9yKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGRiSW5mby5rZXlQcmVmaXggKyBrZXksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUob3JpZ2luYWxWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxvY2FsU3RvcmFnZSBjYXBhY2l0eSBleGNlZWRlZC5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IE1ha2UgdGhpcyBhIHNwZWNpZmljIGVycm9yL2V2ZW50LlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGUubmFtZSA9PT0gJ1F1b3RhRXhjZWVkZWRFcnJvcicgfHwgZS5uYW1lID09PSAnTlNfRVJST1JfRE9NX1FVT1RBX1JFQUNIRUQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuZnVuY3Rpb24gZHJvcEluc3RhbmNlJDIob3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICBjYWxsYmFjayA9IGdldENhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICBvcHRpb25zID0gdHlwZW9mIG9wdGlvbnMgIT09ICdmdW5jdGlvbicgJiYgb3B0aW9ucyB8fCB7fTtcbiAgICBpZiAoIW9wdGlvbnMubmFtZSkge1xuICAgICAgICB2YXIgY3VycmVudENvbmZpZyA9IHRoaXMuY29uZmlnKCk7XG4gICAgICAgIG9wdGlvbnMubmFtZSA9IG9wdGlvbnMubmFtZSB8fCBjdXJyZW50Q29uZmlnLm5hbWU7XG4gICAgICAgIG9wdGlvbnMuc3RvcmVOYW1lID0gb3B0aW9ucy5zdG9yZU5hbWUgfHwgY3VycmVudENvbmZpZy5zdG9yZU5hbWU7XG4gICAgfVxuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBwcm9taXNlO1xuICAgIGlmICghb3B0aW9ucy5uYW1lKSB7XG4gICAgICAgIHByb21pc2UgPSBQcm9taXNlJDEucmVqZWN0KCdJbnZhbGlkIGFyZ3VtZW50cycpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHByb21pc2UgPSBuZXcgUHJvbWlzZSQxKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgICAgICAgICBpZiAoIW9wdGlvbnMuc3RvcmVOYW1lKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShvcHRpb25zLm5hbWUgKyAnLycpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKF9nZXRLZXlQcmVmaXgob3B0aW9ucywgc2VsZi5fZGVmYXVsdENvbmZpZykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChrZXlQcmVmaXgpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSBsb2NhbFN0b3JhZ2UubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICB2YXIga2V5ID0gbG9jYWxTdG9yYWdlLmtleShpKTtcblxuICAgICAgICAgICAgICAgIGlmIChrZXkuaW5kZXhPZihrZXlQcmVmaXgpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG52YXIgbG9jYWxTdG9yYWdlV3JhcHBlciA9IHtcbiAgICBfZHJpdmVyOiAnbG9jYWxTdG9yYWdlV3JhcHBlcicsXG4gICAgX2luaXRTdG9yYWdlOiBfaW5pdFN0b3JhZ2UkMixcbiAgICBfc3VwcG9ydDogaXNMb2NhbFN0b3JhZ2VWYWxpZCgpLFxuICAgIGl0ZXJhdGU6IGl0ZXJhdGUkMixcbiAgICBnZXRJdGVtOiBnZXRJdGVtJDIsXG4gICAgc2V0SXRlbTogc2V0SXRlbSQyLFxuICAgIHJlbW92ZUl0ZW06IHJlbW92ZUl0ZW0kMixcbiAgICBjbGVhcjogY2xlYXIkMixcbiAgICBsZW5ndGg6IGxlbmd0aCQyLFxuICAgIGtleToga2V5JDIsXG4gICAga2V5czoga2V5cyQyLFxuICAgIGRyb3BJbnN0YW5jZTogZHJvcEluc3RhbmNlJDJcbn07XG5cbnZhciBzYW1lVmFsdWUgPSBmdW5jdGlvbiBzYW1lVmFsdWUoeCwgeSkge1xuICAgIHJldHVybiB4ID09PSB5IHx8IHR5cGVvZiB4ID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgeSA9PT0gJ251bWJlcicgJiYgaXNOYU4oeCkgJiYgaXNOYU4oeSk7XG59O1xuXG52YXIgaW5jbHVkZXMgPSBmdW5jdGlvbiBpbmNsdWRlcyhhcnJheSwgc2VhcmNoRWxlbWVudCkge1xuICAgIHZhciBsZW4gPSBhcnJheS5sZW5ndGg7XG4gICAgdmFyIGkgPSAwO1xuICAgIHdoaWxlIChpIDwgbGVuKSB7XG4gICAgICAgIGlmIChzYW1lVmFsdWUoYXJyYXlbaV0sIHNlYXJjaEVsZW1lbnQpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpKys7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChhcmcpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFyZykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG4vLyBEcml2ZXJzIGFyZSBzdG9yZWQgaGVyZSB3aGVuIGBkZWZpbmVEcml2ZXIoKWAgaXMgY2FsbGVkLlxuLy8gVGhleSBhcmUgc2hhcmVkIGFjcm9zcyBhbGwgaW5zdGFuY2VzIG9mIGxvY2FsRm9yYWdlLlxudmFyIERlZmluZWREcml2ZXJzID0ge307XG5cbnZhciBEcml2ZXJTdXBwb3J0ID0ge307XG5cbnZhciBEZWZhdWx0RHJpdmVycyA9IHtcbiAgICBJTkRFWEVEREI6IGFzeW5jU3RvcmFnZSxcbiAgICBXRUJTUUw6IHdlYlNRTFN0b3JhZ2UsXG4gICAgTE9DQUxTVE9SQUdFOiBsb2NhbFN0b3JhZ2VXcmFwcGVyXG59O1xuXG52YXIgRGVmYXVsdERyaXZlck9yZGVyID0gW0RlZmF1bHREcml2ZXJzLklOREVYRUREQi5fZHJpdmVyLCBEZWZhdWx0RHJpdmVycy5XRUJTUUwuX2RyaXZlciwgRGVmYXVsdERyaXZlcnMuTE9DQUxTVE9SQUdFLl9kcml2ZXJdO1xuXG52YXIgT3B0aW9uYWxEcml2ZXJNZXRob2RzID0gWydkcm9wSW5zdGFuY2UnXTtcblxudmFyIExpYnJhcnlNZXRob2RzID0gWydjbGVhcicsICdnZXRJdGVtJywgJ2l0ZXJhdGUnLCAna2V5JywgJ2tleXMnLCAnbGVuZ3RoJywgJ3JlbW92ZUl0ZW0nLCAnc2V0SXRlbSddLmNvbmNhdChPcHRpb25hbERyaXZlck1ldGhvZHMpO1xuXG52YXIgRGVmYXVsdENvbmZpZyA9IHtcbiAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgZHJpdmVyOiBEZWZhdWx0RHJpdmVyT3JkZXIuc2xpY2UoKSxcbiAgICBuYW1lOiAnbG9jYWxmb3JhZ2UnLFxuICAgIC8vIERlZmF1bHQgREIgc2l6ZSBpcyBfSlVTVCBVTkRFUl8gNU1CLCBhcyBpdCdzIHRoZSBoaWdoZXN0IHNpemVcbiAgICAvLyB3ZSBjYW4gdXNlIHdpdGhvdXQgYSBwcm9tcHQuXG4gICAgc2l6ZTogNDk4MDczNixcbiAgICBzdG9yZU5hbWU6ICdrZXl2YWx1ZXBhaXJzJyxcbiAgICB2ZXJzaW9uOiAxLjBcbn07XG5cbmZ1bmN0aW9uIGNhbGxXaGVuUmVhZHkobG9jYWxGb3JhZ2VJbnN0YW5jZSwgbGlicmFyeU1ldGhvZCkge1xuICAgIGxvY2FsRm9yYWdlSW5zdGFuY2VbbGlicmFyeU1ldGhvZF0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgcmV0dXJuIGxvY2FsRm9yYWdlSW5zdGFuY2UucmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBsb2NhbEZvcmFnZUluc3RhbmNlW2xpYnJhcnlNZXRob2RdLmFwcGx5KGxvY2FsRm9yYWdlSW5zdGFuY2UsIF9hcmdzKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gZXh0ZW5kKCkge1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBhcmcgPSBhcmd1bWVudHNbaV07XG5cbiAgICAgICAgaWYgKGFyZykge1xuICAgICAgICAgICAgZm9yICh2YXIgX2tleSBpbiBhcmcpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXJnLmhhc093blByb3BlcnR5KF9rZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0FycmF5KGFyZ1tfa2V5XSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3VtZW50c1swXVtfa2V5XSA9IGFyZ1tfa2V5XS5zbGljZSgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJndW1lbnRzWzBdW19rZXldID0gYXJnW19rZXldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGFyZ3VtZW50c1swXTtcbn1cblxudmFyIExvY2FsRm9yYWdlID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIExvY2FsRm9yYWdlKG9wdGlvbnMpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIExvY2FsRm9yYWdlKTtcblxuICAgICAgICBmb3IgKHZhciBkcml2ZXJUeXBlS2V5IGluIERlZmF1bHREcml2ZXJzKSB7XG4gICAgICAgICAgICBpZiAoRGVmYXVsdERyaXZlcnMuaGFzT3duUHJvcGVydHkoZHJpdmVyVHlwZUtleSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgZHJpdmVyID0gRGVmYXVsdERyaXZlcnNbZHJpdmVyVHlwZUtleV07XG4gICAgICAgICAgICAgICAgdmFyIGRyaXZlck5hbWUgPSBkcml2ZXIuX2RyaXZlcjtcbiAgICAgICAgICAgICAgICB0aGlzW2RyaXZlclR5cGVLZXldID0gZHJpdmVyTmFtZTtcblxuICAgICAgICAgICAgICAgIGlmICghRGVmaW5lZERyaXZlcnNbZHJpdmVyTmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gd2UgZG9uJ3QgbmVlZCB0byB3YWl0IGZvciB0aGUgcHJvbWlzZSxcbiAgICAgICAgICAgICAgICAgICAgLy8gc2luY2UgdGhlIGRlZmF1bHQgZHJpdmVycyBjYW4gYmUgZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAvLyBpbiBhIGJsb2NraW5nIG1hbm5lclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlZmluZURyaXZlcihkcml2ZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2RlZmF1bHRDb25maWcgPSBleHRlbmQoe30sIERlZmF1bHRDb25maWcpO1xuICAgICAgICB0aGlzLl9jb25maWcgPSBleHRlbmQoe30sIHRoaXMuX2RlZmF1bHRDb25maWcsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLl9kcml2ZXJTZXQgPSBudWxsO1xuICAgICAgICB0aGlzLl9pbml0RHJpdmVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5fcmVhZHkgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fZGJJbmZvID0gbnVsbDtcblxuICAgICAgICB0aGlzLl93cmFwTGlicmFyeU1ldGhvZHNXaXRoUmVhZHkoKTtcbiAgICAgICAgdGhpcy5zZXREcml2ZXIodGhpcy5fY29uZmlnLmRyaXZlcilbXCJjYXRjaFwiXShmdW5jdGlvbiAoKSB7fSk7XG4gICAgfVxuXG4gICAgLy8gU2V0IGFueSBjb25maWcgdmFsdWVzIGZvciBsb2NhbEZvcmFnZTsgY2FuIGJlIGNhbGxlZCBhbnl0aW1lIGJlZm9yZVxuICAgIC8vIHRoZSBmaXJzdCBBUEkgY2FsbCAoZS5nLiBgZ2V0SXRlbWAsIGBzZXRJdGVtYCkuXG4gICAgLy8gV2UgbG9vcCB0aHJvdWdoIG9wdGlvbnMgc28gd2UgZG9uJ3Qgb3ZlcndyaXRlIGV4aXN0aW5nIGNvbmZpZ1xuICAgIC8vIHZhbHVlcy5cblxuXG4gICAgTG9jYWxGb3JhZ2UucHJvdG90eXBlLmNvbmZpZyA9IGZ1bmN0aW9uIGNvbmZpZyhvcHRpb25zKSB7XG4gICAgICAgIC8vIElmIHRoZSBvcHRpb25zIGFyZ3VtZW50IGlzIGFuIG9iamVjdCwgd2UgdXNlIGl0IHRvIHNldCB2YWx1ZXMuXG4gICAgICAgIC8vIE90aGVyd2lzZSwgd2UgcmV0dXJuIGVpdGhlciBhIHNwZWNpZmllZCBjb25maWcgdmFsdWUgb3IgYWxsXG4gICAgICAgIC8vIGNvbmZpZyB2YWx1ZXMuXG4gICAgICAgIGlmICgodHlwZW9mIG9wdGlvbnMgPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKG9wdGlvbnMpKSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIC8vIElmIGxvY2FsZm9yYWdlIGlzIHJlYWR5IGFuZCBmdWxseSBpbml0aWFsaXplZCwgd2UgY2FuJ3Qgc2V0XG4gICAgICAgICAgICAvLyBhbnkgbmV3IGNvbmZpZ3VyYXRpb24gdmFsdWVzLiBJbnN0ZWFkLCB3ZSByZXR1cm4gYW4gZXJyb3IuXG4gICAgICAgICAgICBpZiAodGhpcy5fcmVhZHkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEVycm9yKFwiQ2FuJ3QgY2FsbCBjb25maWcoKSBhZnRlciBsb2NhbGZvcmFnZSBcIiArICdoYXMgYmVlbiB1c2VkLicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBpZiAoaSA9PT0gJ3N0b3JlTmFtZScpIHtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uc1tpXSA9IG9wdGlvbnNbaV0ucmVwbGFjZSgvXFxXL2csICdfJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGkgPT09ICd2ZXJzaW9uJyAmJiB0eXBlb2Ygb3B0aW9uc1tpXSAhPT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBFcnJvcignRGF0YWJhc2UgdmVyc2lvbiBtdXN0IGJlIGEgbnVtYmVyLicpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuX2NvbmZpZ1tpXSA9IG9wdGlvbnNbaV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGFmdGVyIGFsbCBjb25maWcgb3B0aW9ucyBhcmUgc2V0IGFuZFxuICAgICAgICAgICAgLy8gdGhlIGRyaXZlciBvcHRpb24gaXMgdXNlZCwgdHJ5IHNldHRpbmcgaXRcbiAgICAgICAgICAgIGlmICgnZHJpdmVyJyBpbiBvcHRpb25zICYmIG9wdGlvbnMuZHJpdmVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0RHJpdmVyKHRoaXMuX2NvbmZpZy5kcml2ZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb25maWdbb3B0aW9uc107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY29uZmlnO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIFVzZWQgdG8gZGVmaW5lIGEgY3VzdG9tIGRyaXZlciwgc2hhcmVkIGFjcm9zcyBhbGwgaW5zdGFuY2VzIG9mXG4gICAgLy8gbG9jYWxGb3JhZ2UuXG5cblxuICAgIExvY2FsRm9yYWdlLnByb3RvdHlwZS5kZWZpbmVEcml2ZXIgPSBmdW5jdGlvbiBkZWZpbmVEcml2ZXIoZHJpdmVyT2JqZWN0LCBjYWxsYmFjaywgZXJyb3JDYWxsYmFjaykge1xuICAgICAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB2YXIgZHJpdmVyTmFtZSA9IGRyaXZlck9iamVjdC5fZHJpdmVyO1xuICAgICAgICAgICAgICAgIHZhciBjb21wbGlhbmNlRXJyb3IgPSBuZXcgRXJyb3IoJ0N1c3RvbSBkcml2ZXIgbm90IGNvbXBsaWFudDsgc2VlICcgKyAnaHR0cHM6Ly9tb3ppbGxhLmdpdGh1Yi5pby9sb2NhbEZvcmFnZS8jZGVmaW5lZHJpdmVyJyk7XG5cbiAgICAgICAgICAgICAgICAvLyBBIGRyaXZlciBuYW1lIHNob3VsZCBiZSBkZWZpbmVkIGFuZCBub3Qgb3ZlcmxhcCB3aXRoIHRoZVxuICAgICAgICAgICAgICAgIC8vIGxpYnJhcnktZGVmaW5lZCwgZGVmYXVsdCBkcml2ZXJzLlxuICAgICAgICAgICAgICAgIGlmICghZHJpdmVyT2JqZWN0Ll9kcml2ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGNvbXBsaWFuY2VFcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgZHJpdmVyTWV0aG9kcyA9IExpYnJhcnlNZXRob2RzLmNvbmNhdCgnX2luaXRTdG9yYWdlJyk7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGRyaXZlck1ldGhvZHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRyaXZlck1ldGhvZE5hbWUgPSBkcml2ZXJNZXRob2RzW2ldO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHdoZW4gdGhlIHByb3BlcnR5IGlzIHRoZXJlLFxuICAgICAgICAgICAgICAgICAgICAvLyBpdCBzaG91bGQgYmUgYSBtZXRob2QgZXZlbiB3aGVuIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgICAgIHZhciBpc1JlcXVpcmVkID0gIWluY2x1ZGVzKE9wdGlvbmFsRHJpdmVyTWV0aG9kcywgZHJpdmVyTWV0aG9kTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICgoaXNSZXF1aXJlZCB8fCBkcml2ZXJPYmplY3RbZHJpdmVyTWV0aG9kTmFtZV0pICYmIHR5cGVvZiBkcml2ZXJPYmplY3RbZHJpdmVyTWV0aG9kTmFtZV0gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChjb21wbGlhbmNlRXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGNvbmZpZ3VyZU1pc3NpbmdNZXRob2RzID0gZnVuY3Rpb24gY29uZmlndXJlTWlzc2luZ01ldGhvZHMoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtZXRob2ROb3RJbXBsZW1lbnRlZEZhY3RvcnkgPSBmdW5jdGlvbiBtZXRob2ROb3RJbXBsZW1lbnRlZEZhY3RvcnkobWV0aG9kTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IoJ01ldGhvZCAnICsgbWV0aG9kTmFtZSArICcgaXMgbm90IGltcGxlbWVudGVkIGJ5IHRoZSBjdXJyZW50IGRyaXZlcicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwcm9taXNlID0gUHJvbWlzZSQxLnJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGFyZ3VtZW50c1thcmd1bWVudHMubGVuZ3RoIC0gMV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9sZW4gPSBPcHRpb25hbERyaXZlck1ldGhvZHMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvcHRpb25hbERyaXZlck1ldGhvZCA9IE9wdGlvbmFsRHJpdmVyTWV0aG9kc1tfaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWRyaXZlck9iamVjdFtvcHRpb25hbERyaXZlck1ldGhvZF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkcml2ZXJPYmplY3Rbb3B0aW9uYWxEcml2ZXJNZXRob2RdID0gbWV0aG9kTm90SW1wbGVtZW50ZWRGYWN0b3J5KG9wdGlvbmFsRHJpdmVyTWV0aG9kKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBjb25maWd1cmVNaXNzaW5nTWV0aG9kcygpO1xuXG4gICAgICAgICAgICAgICAgdmFyIHNldERyaXZlclN1cHBvcnQgPSBmdW5jdGlvbiBzZXREcml2ZXJTdXBwb3J0KHN1cHBvcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKERlZmluZWREcml2ZXJzW2RyaXZlck5hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oJ1JlZGVmaW5pbmcgTG9jYWxGb3JhZ2UgZHJpdmVyOiAnICsgZHJpdmVyTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgRGVmaW5lZERyaXZlcnNbZHJpdmVyTmFtZV0gPSBkcml2ZXJPYmplY3Q7XG4gICAgICAgICAgICAgICAgICAgIERyaXZlclN1cHBvcnRbZHJpdmVyTmFtZV0gPSBzdXBwb3J0O1xuICAgICAgICAgICAgICAgICAgICAvLyBkb24ndCB1c2UgYSB0aGVuLCBzbyB0aGF0IHdlIGNhbiBkZWZpbmVcbiAgICAgICAgICAgICAgICAgICAgLy8gZHJpdmVycyB0aGF0IGhhdmUgc2ltcGxlIF9zdXBwb3J0IG1ldGhvZHNcbiAgICAgICAgICAgICAgICAgICAgLy8gaW4gYSBibG9ja2luZyBtYW5uZXJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBpZiAoJ19zdXBwb3J0JyBpbiBkcml2ZXJPYmplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyaXZlck9iamVjdC5fc3VwcG9ydCAmJiB0eXBlb2YgZHJpdmVyT2JqZWN0Ll9zdXBwb3J0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkcml2ZXJPYmplY3QuX3N1cHBvcnQoKS50aGVuKHNldERyaXZlclN1cHBvcnQsIHJlamVjdCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXREcml2ZXJTdXBwb3J0KCEhZHJpdmVyT2JqZWN0Ll9zdXBwb3J0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNldERyaXZlclN1cHBvcnQodHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgZXhlY3V0ZVR3b0NhbGxiYWNrcyhwcm9taXNlLCBjYWxsYmFjaywgZXJyb3JDYWxsYmFjayk7XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH07XG5cbiAgICBMb2NhbEZvcmFnZS5wcm90b3R5cGUuZHJpdmVyID0gZnVuY3Rpb24gZHJpdmVyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZHJpdmVyIHx8IG51bGw7XG4gICAgfTtcblxuICAgIExvY2FsRm9yYWdlLnByb3RvdHlwZS5nZXREcml2ZXIgPSBmdW5jdGlvbiBnZXREcml2ZXIoZHJpdmVyTmFtZSwgY2FsbGJhY2ssIGVycm9yQ2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGdldERyaXZlclByb21pc2UgPSBEZWZpbmVkRHJpdmVyc1tkcml2ZXJOYW1lXSA/IFByb21pc2UkMS5yZXNvbHZlKERlZmluZWREcml2ZXJzW2RyaXZlck5hbWVdKSA6IFByb21pc2UkMS5yZWplY3QobmV3IEVycm9yKCdEcml2ZXIgbm90IGZvdW5kLicpKTtcblxuICAgICAgICBleGVjdXRlVHdvQ2FsbGJhY2tzKGdldERyaXZlclByb21pc2UsIGNhbGxiYWNrLCBlcnJvckNhbGxiYWNrKTtcbiAgICAgICAgcmV0dXJuIGdldERyaXZlclByb21pc2U7XG4gICAgfTtcblxuICAgIExvY2FsRm9yYWdlLnByb3RvdHlwZS5nZXRTZXJpYWxpemVyID0gZnVuY3Rpb24gZ2V0U2VyaWFsaXplcihjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VyaWFsaXplclByb21pc2UgPSBQcm9taXNlJDEucmVzb2x2ZShsb2NhbGZvcmFnZVNlcmlhbGl6ZXIpO1xuICAgICAgICBleGVjdXRlVHdvQ2FsbGJhY2tzKHNlcmlhbGl6ZXJQcm9taXNlLCBjYWxsYmFjayk7XG4gICAgICAgIHJldHVybiBzZXJpYWxpemVyUHJvbWlzZTtcbiAgICB9O1xuXG4gICAgTG9jYWxGb3JhZ2UucHJvdG90eXBlLnJlYWR5ID0gZnVuY3Rpb24gcmVhZHkoY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHZhciBwcm9taXNlID0gc2VsZi5fZHJpdmVyU2V0LnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHNlbGYuX3JlYWR5ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fcmVhZHkgPSBzZWxmLl9pbml0RHJpdmVyKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzZWxmLl9yZWFkeTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZXhlY3V0ZVR3b0NhbGxiYWNrcyhwcm9taXNlLCBjYWxsYmFjaywgY2FsbGJhY2spO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9O1xuXG4gICAgTG9jYWxGb3JhZ2UucHJvdG90eXBlLnNldERyaXZlciA9IGZ1bmN0aW9uIHNldERyaXZlcihkcml2ZXJzLCBjYWxsYmFjaywgZXJyb3JDYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgaWYgKCFpc0FycmF5KGRyaXZlcnMpKSB7XG4gICAgICAgICAgICBkcml2ZXJzID0gW2RyaXZlcnNdO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHN1cHBvcnRlZERyaXZlcnMgPSB0aGlzLl9nZXRTdXBwb3J0ZWREcml2ZXJzKGRyaXZlcnMpO1xuXG4gICAgICAgIGZ1bmN0aW9uIHNldERyaXZlclRvQ29uZmlnKCkge1xuICAgICAgICAgICAgc2VsZi5fY29uZmlnLmRyaXZlciA9IHNlbGYuZHJpdmVyKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBleHRlbmRTZWxmV2l0aERyaXZlcihkcml2ZXIpIHtcbiAgICAgICAgICAgIHNlbGYuX2V4dGVuZChkcml2ZXIpO1xuICAgICAgICAgICAgc2V0RHJpdmVyVG9Db25maWcoKTtcblxuICAgICAgICAgICAgc2VsZi5fcmVhZHkgPSBzZWxmLl9pbml0U3RvcmFnZShzZWxmLl9jb25maWcpO1xuICAgICAgICAgICAgcmV0dXJuIHNlbGYuX3JlYWR5O1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gaW5pdERyaXZlcihzdXBwb3J0ZWREcml2ZXJzKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50RHJpdmVySW5kZXggPSAwO1xuXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZHJpdmVyUHJvbWlzZUxvb3AoKSB7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChjdXJyZW50RHJpdmVySW5kZXggPCBzdXBwb3J0ZWREcml2ZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRyaXZlck5hbWUgPSBzdXBwb3J0ZWREcml2ZXJzW2N1cnJlbnREcml2ZXJJbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50RHJpdmVySW5kZXgrKztcblxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5fZGJJbmZvID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX3JlYWR5ID0gbnVsbDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuZ2V0RHJpdmVyKGRyaXZlck5hbWUpLnRoZW4oZXh0ZW5kU2VsZldpdGhEcml2ZXIpW1wiY2F0Y2hcIl0oZHJpdmVyUHJvbWlzZUxvb3ApO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgc2V0RHJpdmVyVG9Db25maWcoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVycm9yID0gbmV3IEVycm9yKCdObyBhdmFpbGFibGUgc3RvcmFnZSBtZXRob2QgZm91bmQuJyk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2RyaXZlclNldCA9IFByb21pc2UkMS5yZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5fZHJpdmVyU2V0O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBkcml2ZXJQcm9taXNlTG9vcCgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZXJlIG1pZ2h0IGJlIGEgZHJpdmVyIGluaXRpYWxpemF0aW9uIGluIHByb2dyZXNzXG4gICAgICAgIC8vIHNvIHdhaXQgZm9yIGl0IHRvIGZpbmlzaCBpbiBvcmRlciB0byBhdm9pZCBhIHBvc3NpYmxlXG4gICAgICAgIC8vIHJhY2UgY29uZGl0aW9uIHRvIHNldCBfZGJJbmZvXG4gICAgICAgIHZhciBvbGREcml2ZXJTZXREb25lID0gdGhpcy5fZHJpdmVyU2V0ICE9PSBudWxsID8gdGhpcy5fZHJpdmVyU2V0W1wiY2F0Y2hcIl0oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UkMS5yZXNvbHZlKCk7XG4gICAgICAgIH0pIDogUHJvbWlzZSQxLnJlc29sdmUoKTtcblxuICAgICAgICB0aGlzLl9kcml2ZXJTZXQgPSBvbGREcml2ZXJTZXREb25lLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGRyaXZlck5hbWUgPSBzdXBwb3J0ZWREcml2ZXJzWzBdO1xuICAgICAgICAgICAgc2VsZi5fZGJJbmZvID0gbnVsbDtcbiAgICAgICAgICAgIHNlbGYuX3JlYWR5ID0gbnVsbDtcblxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuZ2V0RHJpdmVyKGRyaXZlck5hbWUpLnRoZW4oZnVuY3Rpb24gKGRyaXZlcikge1xuICAgICAgICAgICAgICAgIHNlbGYuX2RyaXZlciA9IGRyaXZlci5fZHJpdmVyO1xuICAgICAgICAgICAgICAgIHNldERyaXZlclRvQ29uZmlnKCk7XG4gICAgICAgICAgICAgICAgc2VsZi5fd3JhcExpYnJhcnlNZXRob2RzV2l0aFJlYWR5KCk7XG4gICAgICAgICAgICAgICAgc2VsZi5faW5pdERyaXZlciA9IGluaXREcml2ZXIoc3VwcG9ydGVkRHJpdmVycyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlbXCJjYXRjaFwiXShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZXREcml2ZXJUb0NvbmZpZygpO1xuICAgICAgICAgICAgdmFyIGVycm9yID0gbmV3IEVycm9yKCdObyBhdmFpbGFibGUgc3RvcmFnZSBtZXRob2QgZm91bmQuJyk7XG4gICAgICAgICAgICBzZWxmLl9kcml2ZXJTZXQgPSBQcm9taXNlJDEucmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLl9kcml2ZXJTZXQ7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGV4ZWN1dGVUd29DYWxsYmFja3ModGhpcy5fZHJpdmVyU2V0LCBjYWxsYmFjaywgZXJyb3JDYWxsYmFjayk7XG4gICAgICAgIHJldHVybiB0aGlzLl9kcml2ZXJTZXQ7XG4gICAgfTtcblxuICAgIExvY2FsRm9yYWdlLnByb3RvdHlwZS5zdXBwb3J0cyA9IGZ1bmN0aW9uIHN1cHBvcnRzKGRyaXZlck5hbWUpIHtcbiAgICAgICAgcmV0dXJuICEhRHJpdmVyU3VwcG9ydFtkcml2ZXJOYW1lXTtcbiAgICB9O1xuXG4gICAgTG9jYWxGb3JhZ2UucHJvdG90eXBlLl9leHRlbmQgPSBmdW5jdGlvbiBfZXh0ZW5kKGxpYnJhcnlNZXRob2RzQW5kUHJvcGVydGllcykge1xuICAgICAgICBleHRlbmQodGhpcywgbGlicmFyeU1ldGhvZHNBbmRQcm9wZXJ0aWVzKTtcbiAgICB9O1xuXG4gICAgTG9jYWxGb3JhZ2UucHJvdG90eXBlLl9nZXRTdXBwb3J0ZWREcml2ZXJzID0gZnVuY3Rpb24gX2dldFN1cHBvcnRlZERyaXZlcnMoZHJpdmVycykge1xuICAgICAgICB2YXIgc3VwcG9ydGVkRHJpdmVycyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gZHJpdmVycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgdmFyIGRyaXZlck5hbWUgPSBkcml2ZXJzW2ldO1xuICAgICAgICAgICAgaWYgKHRoaXMuc3VwcG9ydHMoZHJpdmVyTmFtZSkpIHtcbiAgICAgICAgICAgICAgICBzdXBwb3J0ZWREcml2ZXJzLnB1c2goZHJpdmVyTmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN1cHBvcnRlZERyaXZlcnM7XG4gICAgfTtcblxuICAgIExvY2FsRm9yYWdlLnByb3RvdHlwZS5fd3JhcExpYnJhcnlNZXRob2RzV2l0aFJlYWR5ID0gZnVuY3Rpb24gX3dyYXBMaWJyYXJ5TWV0aG9kc1dpdGhSZWFkeSgpIHtcbiAgICAgICAgLy8gQWRkIGEgc3R1YiBmb3IgZWFjaCBkcml2ZXIgQVBJIG1ldGhvZCB0aGF0IGRlbGF5cyB0aGUgY2FsbCB0byB0aGVcbiAgICAgICAgLy8gY29ycmVzcG9uZGluZyBkcml2ZXIgbWV0aG9kIHVudGlsIGxvY2FsRm9yYWdlIGlzIHJlYWR5LiBUaGVzZSBzdHVic1xuICAgICAgICAvLyB3aWxsIGJlIHJlcGxhY2VkIGJ5IHRoZSBkcml2ZXIgbWV0aG9kcyBhcyBzb29uIGFzIHRoZSBkcml2ZXIgaXNcbiAgICAgICAgLy8gbG9hZGVkLCBzbyB0aGVyZSBpcyBubyBwZXJmb3JtYW5jZSBpbXBhY3QuXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBMaWJyYXJ5TWV0aG9kcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgY2FsbFdoZW5SZWFkeSh0aGlzLCBMaWJyYXJ5TWV0aG9kc1tpXSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgTG9jYWxGb3JhZ2UucHJvdG90eXBlLmNyZWF0ZUluc3RhbmNlID0gZnVuY3Rpb24gY3JlYXRlSW5zdGFuY2Uob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gbmV3IExvY2FsRm9yYWdlKG9wdGlvbnMpO1xuICAgIH07XG5cbiAgICByZXR1cm4gTG9jYWxGb3JhZ2U7XG59KCk7XG5cbi8vIFRoZSBhY3R1YWwgbG9jYWxGb3JhZ2Ugb2JqZWN0IHRoYXQgd2UgZXhwb3NlIGFzIGEgbW9kdWxlIG9yIHZpYSBhXG4vLyBnbG9iYWwuIEl0J3MgZXh0ZW5kZWQgYnkgcHVsbGluZyBpbiBvbmUgb2Ygb3VyIG90aGVyIGxpYnJhcmllcy5cblxuXG52YXIgbG9jYWxmb3JhZ2VfanMgPSBuZXcgTG9jYWxGb3JhZ2UoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBsb2NhbGZvcmFnZV9qcztcblxufSx7XCIzXCI6M31dfSx7fSxbNF0pKDQpXG59KTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSl7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvKmlzdGFuYnVsIGlnbm9yZSBuZXh0OmNhbnQgdGVzdCovXG4gIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgIGRlZmluZShbXSwgZmFjdG9yeSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gQnJvd3NlciBnbG9iYWxzXG4gICAgcm9vdC5vYmplY3RQYXRoID0gZmFjdG9yeSgpO1xuICB9XG59KSh0aGlzLCBmdW5jdGlvbigpe1xuICAndXNlIHN0cmljdCc7XG5cbiAgdmFyIHRvU3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbiAgZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gICAgaWYob2JqID09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICAvL3RvIGhhbmRsZSBvYmplY3RzIHdpdGggbnVsbCBwcm90b3R5cGVzICh0b28gZWRnZSBjYXNlPylcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcClcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzRW1wdHkodmFsdWUpe1xuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgICBmb3IgKHZhciBpIGluIHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoaGFzT3duUHJvcGVydHkodmFsdWUsIGkpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiB0b1N0cmluZyh0eXBlKXtcbiAgICByZXR1cm4gdG9TdHIuY2FsbCh0eXBlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzT2JqZWN0KG9iail7XG4gICAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIHRvU3RyaW5nKG9iaikgPT09IFwiW29iamVjdCBPYmplY3RdXCI7XG4gIH1cblxuICB2YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24ob2JqKXtcbiAgICAvKmlzdGFuYnVsIGlnbm9yZSBuZXh0OmNhbnQgdGVzdCovXG4gICAgcmV0dXJuIHRvU3RyLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzQm9vbGVhbihvYmope1xuICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSAnYm9vbGVhbicgfHwgdG9TdHJpbmcob2JqKSA9PT0gJ1tvYmplY3QgQm9vbGVhbl0nO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0S2V5KGtleSl7XG4gICAgdmFyIGludEtleSA9IHBhcnNlSW50KGtleSk7XG4gICAgaWYgKGludEtleS50b1N0cmluZygpID09PSBrZXkpIHtcbiAgICAgIHJldHVybiBpbnRLZXk7XG4gICAgfVxuICAgIHJldHVybiBrZXk7XG4gIH1cblxuICBmdW5jdGlvbiBmYWN0b3J5KG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuXG4gICAgdmFyIG9iamVjdFBhdGggPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmplY3RQYXRoKS5yZWR1Y2UoZnVuY3Rpb24ocHJveHksIHByb3ApIHtcbiAgICAgICAgaWYocHJvcCA9PT0gJ2NyZWF0ZScpIHtcbiAgICAgICAgICByZXR1cm4gcHJveHk7XG4gICAgICAgIH1cblxuICAgICAgICAvKmlzdGFuYnVsIGlnbm9yZSBlbHNlKi9cbiAgICAgICAgaWYgKHR5cGVvZiBvYmplY3RQYXRoW3Byb3BdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgcHJveHlbcHJvcF0gPSBvYmplY3RQYXRoW3Byb3BdLmJpbmQob2JqZWN0UGF0aCwgb2JqKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwcm94eTtcbiAgICAgIH0sIHt9KTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gaGFzU2hhbGxvd1Byb3BlcnR5KG9iaiwgcHJvcCkge1xuICAgICAgcmV0dXJuIChvcHRpb25zLmluY2x1ZGVJbmhlcml0ZWRQcm9wcyB8fCAodHlwZW9mIHByb3AgPT09ICdudW1iZXInICYmIEFycmF5LmlzQXJyYXkob2JqKSkgfHwgaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSlcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRTaGFsbG93UHJvcGVydHkob2JqLCBwcm9wKSB7XG4gICAgICBpZiAoaGFzU2hhbGxvd1Byb3BlcnR5KG9iaiwgcHJvcCkpIHtcbiAgICAgICAgcmV0dXJuIG9ialtwcm9wXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXQob2JqLCBwYXRoLCB2YWx1ZSwgZG9Ob3RSZXBsYWNlKXtcbiAgICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcGF0aCA9IFtwYXRoXTtcbiAgICAgIH1cbiAgICAgIGlmICghcGF0aCB8fCBwYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBwYXRoID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gc2V0KG9iaiwgcGF0aC5zcGxpdCgnLicpLm1hcChnZXRLZXkpLCB2YWx1ZSwgZG9Ob3RSZXBsYWNlKTtcbiAgICAgIH1cbiAgICAgIHZhciBjdXJyZW50UGF0aCA9IHBhdGhbMF07XG4gICAgICB2YXIgY3VycmVudFZhbHVlID0gZ2V0U2hhbGxvd1Byb3BlcnR5KG9iaiwgY3VycmVudFBhdGgpO1xuICAgICAgaWYgKHBhdGgubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGlmIChjdXJyZW50VmFsdWUgPT09IHZvaWQgMCB8fCAhZG9Ob3RSZXBsYWNlKSB7XG4gICAgICAgICAgb2JqW2N1cnJlbnRQYXRoXSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjdXJyZW50VmFsdWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChjdXJyZW50VmFsdWUgPT09IHZvaWQgMCkge1xuICAgICAgICAvL2NoZWNrIGlmIHdlIGFzc3VtZSBhbiBhcnJheVxuICAgICAgICBpZih0eXBlb2YgcGF0aFsxXSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICBvYmpbY3VycmVudFBhdGhdID0gW107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2JqW2N1cnJlbnRQYXRoXSA9IHt9O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZXQob2JqW2N1cnJlbnRQYXRoXSwgcGF0aC5zbGljZSgxKSwgdmFsdWUsIGRvTm90UmVwbGFjZSk7XG4gICAgfVxuXG4gICAgb2JqZWN0UGF0aC5oYXMgPSBmdW5jdGlvbiAob2JqLCBwYXRoKSB7XG4gICAgICBpZiAodHlwZW9mIHBhdGggPT09ICdudW1iZXInKSB7XG4gICAgICAgIHBhdGggPSBbcGF0aF07XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBwYXRoID09PSAnc3RyaW5nJykge1xuICAgICAgICBwYXRoID0gcGF0aC5zcGxpdCgnLicpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXBhdGggfHwgcGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuICEhb2JqO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhdGgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGogPSBnZXRLZXkocGF0aFtpXSk7XG5cbiAgICAgICAgaWYoKHR5cGVvZiBqID09PSAnbnVtYmVyJyAmJiBpc0FycmF5KG9iaikgJiYgaiA8IG9iai5sZW5ndGgpIHx8XG4gICAgICAgICAgKG9wdGlvbnMuaW5jbHVkZUluaGVyaXRlZFByb3BzID8gKGogaW4gT2JqZWN0KG9iaikpIDogaGFzT3duUHJvcGVydHkob2JqLCBqKSkpIHtcbiAgICAgICAgICBvYmogPSBvYmpbal07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICBvYmplY3RQYXRoLmVuc3VyZUV4aXN0cyA9IGZ1bmN0aW9uIChvYmosIHBhdGgsIHZhbHVlKXtcbiAgICAgIHJldHVybiBzZXQob2JqLCBwYXRoLCB2YWx1ZSwgdHJ1ZSk7XG4gICAgfTtcblxuICAgIG9iamVjdFBhdGguc2V0ID0gZnVuY3Rpb24gKG9iaiwgcGF0aCwgdmFsdWUsIGRvTm90UmVwbGFjZSl7XG4gICAgICByZXR1cm4gc2V0KG9iaiwgcGF0aCwgdmFsdWUsIGRvTm90UmVwbGFjZSk7XG4gICAgfTtcblxuICAgIG9iamVjdFBhdGguaW5zZXJ0ID0gZnVuY3Rpb24gKG9iaiwgcGF0aCwgdmFsdWUsIGF0KXtcbiAgICAgIHZhciBhcnIgPSBvYmplY3RQYXRoLmdldChvYmosIHBhdGgpO1xuICAgICAgYXQgPSB+fmF0O1xuICAgICAgaWYgKCFpc0FycmF5KGFycikpIHtcbiAgICAgICAgYXJyID0gW107XG4gICAgICAgIG9iamVjdFBhdGguc2V0KG9iaiwgcGF0aCwgYXJyKTtcbiAgICAgIH1cbiAgICAgIGFyci5zcGxpY2UoYXQsIDAsIHZhbHVlKTtcbiAgICB9O1xuXG4gICAgb2JqZWN0UGF0aC5lbXB0eSA9IGZ1bmN0aW9uKG9iaiwgcGF0aCkge1xuICAgICAgaWYgKGlzRW1wdHkocGF0aCkpIHtcbiAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICAgIH1cbiAgICAgIGlmIChvYmogPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgfVxuXG4gICAgICB2YXIgdmFsdWUsIGk7XG4gICAgICBpZiAoISh2YWx1ZSA9IG9iamVjdFBhdGguZ2V0KG9iaiwgcGF0aCkpKSB7XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBvYmplY3RQYXRoLnNldChvYmosIHBhdGgsICcnKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNCb29sZWFuKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gb2JqZWN0UGF0aC5zZXQob2JqLCBwYXRoLCBmYWxzZSk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdFBhdGguc2V0KG9iaiwgcGF0aCwgMCk7XG4gICAgICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgIHZhbHVlLmxlbmd0aCA9IDA7XG4gICAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KHZhbHVlKSkge1xuICAgICAgICBmb3IgKGkgaW4gdmFsdWUpIHtcbiAgICAgICAgICBpZiAoaGFzU2hhbGxvd1Byb3BlcnR5KHZhbHVlLCBpKSkge1xuICAgICAgICAgICAgZGVsZXRlIHZhbHVlW2ldO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdFBhdGguc2V0KG9iaiwgcGF0aCwgbnVsbCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIG9iamVjdFBhdGgucHVzaCA9IGZ1bmN0aW9uIChvYmosIHBhdGggLyosIHZhbHVlcyAqLyl7XG4gICAgICB2YXIgYXJyID0gb2JqZWN0UGF0aC5nZXQob2JqLCBwYXRoKTtcbiAgICAgIGlmICghaXNBcnJheShhcnIpKSB7XG4gICAgICAgIGFyciA9IFtdO1xuICAgICAgICBvYmplY3RQYXRoLnNldChvYmosIHBhdGgsIGFycik7XG4gICAgICB9XG5cbiAgICAgIGFyci5wdXNoLmFwcGx5KGFyciwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKSk7XG4gICAgfTtcblxuICAgIG9iamVjdFBhdGguY29hbGVzY2UgPSBmdW5jdGlvbiAob2JqLCBwYXRocywgZGVmYXVsdFZhbHVlKSB7XG4gICAgICB2YXIgdmFsdWU7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBwYXRocy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAoKHZhbHVlID0gb2JqZWN0UGF0aC5nZXQob2JqLCBwYXRoc1tpXSkpICE9PSB2b2lkIDApIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICB9O1xuXG4gICAgb2JqZWN0UGF0aC5nZXQgPSBmdW5jdGlvbiAob2JqLCBwYXRoLCBkZWZhdWx0VmFsdWUpe1xuICAgICAgaWYgKHR5cGVvZiBwYXRoID09PSAnbnVtYmVyJykge1xuICAgICAgICBwYXRoID0gW3BhdGhdO1xuICAgICAgfVxuICAgICAgaWYgKCFwYXRoIHx8IHBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgICB9XG4gICAgICBpZiAob2JqID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdFBhdGguZ2V0KG9iaiwgcGF0aC5zcGxpdCgnLicpLCBkZWZhdWx0VmFsdWUpO1xuICAgICAgfVxuXG4gICAgICB2YXIgY3VycmVudFBhdGggPSBnZXRLZXkocGF0aFswXSk7XG4gICAgICB2YXIgbmV4dE9iaiA9IGdldFNoYWxsb3dQcm9wZXJ0eShvYmosIGN1cnJlbnRQYXRoKVxuICAgICAgaWYgKG5leHRPYmogPT09IHZvaWQgMCkge1xuICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICAgICAgfVxuXG4gICAgICBpZiAocGF0aC5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIG5leHRPYmo7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvYmplY3RQYXRoLmdldChvYmpbY3VycmVudFBhdGhdLCBwYXRoLnNsaWNlKDEpLCBkZWZhdWx0VmFsdWUpO1xuICAgIH07XG5cbiAgICBvYmplY3RQYXRoLmRlbCA9IGZ1bmN0aW9uIGRlbChvYmosIHBhdGgpIHtcbiAgICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcGF0aCA9IFtwYXRoXTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9iaiA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc0VtcHR5KHBhdGgpKSB7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgICB9XG4gICAgICBpZih0eXBlb2YgcGF0aCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdFBhdGguZGVsKG9iaiwgcGF0aC5zcGxpdCgnLicpKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGN1cnJlbnRQYXRoID0gZ2V0S2V5KHBhdGhbMF0pO1xuICAgICAgaWYgKCFoYXNTaGFsbG93UHJvcGVydHkob2JqLCBjdXJyZW50UGF0aCkpIHtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgIH1cblxuICAgICAgaWYocGF0aC5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgICAgICAgIG9iai5zcGxpY2UoY3VycmVudFBhdGgsIDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZSBvYmpbY3VycmVudFBhdGhdO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gb2JqZWN0UGF0aC5kZWwob2JqW2N1cnJlbnRQYXRoXSwgcGF0aC5zbGljZSgxKSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iamVjdFBhdGg7XG4gIH1cblxuICB2YXIgbW9kID0gZmFjdG9yeSgpO1xuICBtb2QuY3JlYXRlID0gZmFjdG9yeTtcbiAgbW9kLndpdGhJbmhlcml0ZWRQcm9wcyA9IGZhY3Rvcnkoe2luY2x1ZGVJbmhlcml0ZWRQcm9wczogdHJ1ZX0pXG4gIHJldHVybiBtb2Q7XG59KTtcbiIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLy8gVGhpcyBtZXRob2Qgb2Ygb2J0YWluaW5nIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0IG5lZWRzIHRvIGJlXG4vLyBrZXB0IGlkZW50aWNhbCB0byB0aGUgd2F5IGl0IGlzIG9idGFpbmVkIGluIHJ1bnRpbWUuanNcbnZhciBnID0gKGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcyB9KSgpIHx8IEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKTtcblxuLy8gVXNlIGBnZXRPd25Qcm9wZXJ0eU5hbWVzYCBiZWNhdXNlIG5vdCBhbGwgYnJvd3NlcnMgc3VwcG9ydCBjYWxsaW5nXG4vLyBgaGFzT3duUHJvcGVydHlgIG9uIHRoZSBnbG9iYWwgYHNlbGZgIG9iamVjdCBpbiBhIHdvcmtlci4gU2VlICMxODMuXG52YXIgaGFkUnVudGltZSA9IGcucmVnZW5lcmF0b3JSdW50aW1lICYmXG4gIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGcpLmluZGV4T2YoXCJyZWdlbmVyYXRvclJ1bnRpbWVcIikgPj0gMDtcblxuLy8gU2F2ZSB0aGUgb2xkIHJlZ2VuZXJhdG9yUnVudGltZSBpbiBjYXNlIGl0IG5lZWRzIHRvIGJlIHJlc3RvcmVkIGxhdGVyLlxudmFyIG9sZFJ1bnRpbWUgPSBoYWRSdW50aW1lICYmIGcucmVnZW5lcmF0b3JSdW50aW1lO1xuXG4vLyBGb3JjZSByZWV2YWx1dGF0aW9uIG9mIHJ1bnRpbWUuanMuXG5nLnJlZ2VuZXJhdG9yUnVudGltZSA9IHVuZGVmaW5lZDtcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi9ydW50aW1lXCIpO1xuXG5pZiAoaGFkUnVudGltZSkge1xuICAvLyBSZXN0b3JlIHRoZSBvcmlnaW5hbCBydW50aW1lLlxuICBnLnJlZ2VuZXJhdG9yUnVudGltZSA9IG9sZFJ1bnRpbWU7XG59IGVsc2Uge1xuICAvLyBSZW1vdmUgdGhlIGdsb2JhbCBwcm9wZXJ0eSBhZGRlZCBieSBydW50aW1lLmpzLlxuICB0cnkge1xuICAgIGRlbGV0ZSBnLnJlZ2VuZXJhdG9yUnVudGltZTtcbiAgfSBjYXRjaChlKSB7XG4gICAgZy5yZWdlbmVyYXRvclJ1bnRpbWUgPSB1bmRlZmluZWQ7XG4gIH1cbn1cbiIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuIShmdW5jdGlvbihnbG9iYWwpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIE9wID0gT2JqZWN0LnByb3RvdHlwZTtcbiAgdmFyIGhhc093biA9IE9wLmhhc093blByb3BlcnR5O1xuICB2YXIgdW5kZWZpbmVkOyAvLyBNb3JlIGNvbXByZXNzaWJsZSB0aGFuIHZvaWQgMC5cbiAgdmFyICRTeW1ib2wgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgPyBTeW1ib2wgOiB7fTtcbiAgdmFyIGl0ZXJhdG9yU3ltYm9sID0gJFN5bWJvbC5pdGVyYXRvciB8fCBcIkBAaXRlcmF0b3JcIjtcbiAgdmFyIGFzeW5jSXRlcmF0b3JTeW1ib2wgPSAkU3ltYm9sLmFzeW5jSXRlcmF0b3IgfHwgXCJAQGFzeW5jSXRlcmF0b3JcIjtcbiAgdmFyIHRvU3RyaW5nVGFnU3ltYm9sID0gJFN5bWJvbC50b1N0cmluZ1RhZyB8fCBcIkBAdG9TdHJpbmdUYWdcIjtcblxuICB2YXIgaW5Nb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiO1xuICB2YXIgcnVudGltZSA9IGdsb2JhbC5yZWdlbmVyYXRvclJ1bnRpbWU7XG4gIGlmIChydW50aW1lKSB7XG4gICAgaWYgKGluTW9kdWxlKSB7XG4gICAgICAvLyBJZiByZWdlbmVyYXRvclJ1bnRpbWUgaXMgZGVmaW5lZCBnbG9iYWxseSBhbmQgd2UncmUgaW4gYSBtb2R1bGUsXG4gICAgICAvLyBtYWtlIHRoZSBleHBvcnRzIG9iamVjdCBpZGVudGljYWwgdG8gcmVnZW5lcmF0b3JSdW50aW1lLlxuICAgICAgbW9kdWxlLmV4cG9ydHMgPSBydW50aW1lO1xuICAgIH1cbiAgICAvLyBEb24ndCBib3RoZXIgZXZhbHVhdGluZyB0aGUgcmVzdCBvZiB0aGlzIGZpbGUgaWYgdGhlIHJ1bnRpbWUgd2FzXG4gICAgLy8gYWxyZWFkeSBkZWZpbmVkIGdsb2JhbGx5LlxuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIERlZmluZSB0aGUgcnVudGltZSBnbG9iYWxseSAoYXMgZXhwZWN0ZWQgYnkgZ2VuZXJhdGVkIGNvZGUpIGFzIGVpdGhlclxuICAvLyBtb2R1bGUuZXhwb3J0cyAoaWYgd2UncmUgaW4gYSBtb2R1bGUpIG9yIGEgbmV3LCBlbXB0eSBvYmplY3QuXG4gIHJ1bnRpbWUgPSBnbG9iYWwucmVnZW5lcmF0b3JSdW50aW1lID0gaW5Nb2R1bGUgPyBtb2R1bGUuZXhwb3J0cyA6IHt9O1xuXG4gIGZ1bmN0aW9uIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBJZiBvdXRlckZuIHByb3ZpZGVkIGFuZCBvdXRlckZuLnByb3RvdHlwZSBpcyBhIEdlbmVyYXRvciwgdGhlbiBvdXRlckZuLnByb3RvdHlwZSBpbnN0YW5jZW9mIEdlbmVyYXRvci5cbiAgICB2YXIgcHJvdG9HZW5lcmF0b3IgPSBvdXRlckZuICYmIG91dGVyRm4ucHJvdG90eXBlIGluc3RhbmNlb2YgR2VuZXJhdG9yID8gb3V0ZXJGbiA6IEdlbmVyYXRvcjtcbiAgICB2YXIgZ2VuZXJhdG9yID0gT2JqZWN0LmNyZWF0ZShwcm90b0dlbmVyYXRvci5wcm90b3R5cGUpO1xuICAgIHZhciBjb250ZXh0ID0gbmV3IENvbnRleHQodHJ5TG9jc0xpc3QgfHwgW10pO1xuXG4gICAgLy8gVGhlIC5faW52b2tlIG1ldGhvZCB1bmlmaWVzIHRoZSBpbXBsZW1lbnRhdGlvbnMgb2YgdGhlIC5uZXh0LFxuICAgIC8vIC50aHJvdywgYW5kIC5yZXR1cm4gbWV0aG9kcy5cbiAgICBnZW5lcmF0b3IuX2ludm9rZSA9IG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCk7XG5cbiAgICByZXR1cm4gZ2VuZXJhdG9yO1xuICB9XG4gIHJ1bnRpbWUud3JhcCA9IHdyYXA7XG5cbiAgLy8gVHJ5L2NhdGNoIGhlbHBlciB0byBtaW5pbWl6ZSBkZW9wdGltaXphdGlvbnMuIFJldHVybnMgYSBjb21wbGV0aW9uXG4gIC8vIHJlY29yZCBsaWtlIGNvbnRleHQudHJ5RW50cmllc1tpXS5jb21wbGV0aW9uLiBUaGlzIGludGVyZmFjZSBjb3VsZFxuICAvLyBoYXZlIGJlZW4gKGFuZCB3YXMgcHJldmlvdXNseSkgZGVzaWduZWQgdG8gdGFrZSBhIGNsb3N1cmUgdG8gYmVcbiAgLy8gaW52b2tlZCB3aXRob3V0IGFyZ3VtZW50cywgYnV0IGluIGFsbCB0aGUgY2FzZXMgd2UgY2FyZSBhYm91dCB3ZVxuICAvLyBhbHJlYWR5IGhhdmUgYW4gZXhpc3RpbmcgbWV0aG9kIHdlIHdhbnQgdG8gY2FsbCwgc28gdGhlcmUncyBubyBuZWVkXG4gIC8vIHRvIGNyZWF0ZSBhIG5ldyBmdW5jdGlvbiBvYmplY3QuIFdlIGNhbiBldmVuIGdldCBhd2F5IHdpdGggYXNzdW1pbmdcbiAgLy8gdGhlIG1ldGhvZCB0YWtlcyBleGFjdGx5IG9uZSBhcmd1bWVudCwgc2luY2UgdGhhdCBoYXBwZW5zIHRvIGJlIHRydWVcbiAgLy8gaW4gZXZlcnkgY2FzZSwgc28gd2UgZG9uJ3QgaGF2ZSB0byB0b3VjaCB0aGUgYXJndW1lbnRzIG9iamVjdC4gVGhlXG4gIC8vIG9ubHkgYWRkaXRpb25hbCBhbGxvY2F0aW9uIHJlcXVpcmVkIGlzIHRoZSBjb21wbGV0aW9uIHJlY29yZCwgd2hpY2hcbiAgLy8gaGFzIGEgc3RhYmxlIHNoYXBlIGFuZCBzbyBob3BlZnVsbHkgc2hvdWxkIGJlIGNoZWFwIHRvIGFsbG9jYXRlLlxuICBmdW5jdGlvbiB0cnlDYXRjaChmbiwgb2JqLCBhcmcpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJub3JtYWxcIiwgYXJnOiBmbi5jYWxsKG9iaiwgYXJnKSB9O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJ0aHJvd1wiLCBhcmc6IGVyciB9O1xuICAgIH1cbiAgfVxuXG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0ID0gXCJzdXNwZW5kZWRTdGFydFwiO1xuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRZaWVsZCA9IFwic3VzcGVuZGVkWWllbGRcIjtcbiAgdmFyIEdlblN0YXRlRXhlY3V0aW5nID0gXCJleGVjdXRpbmdcIjtcbiAgdmFyIEdlblN0YXRlQ29tcGxldGVkID0gXCJjb21wbGV0ZWRcIjtcblxuICAvLyBSZXR1cm5pbmcgdGhpcyBvYmplY3QgZnJvbSB0aGUgaW5uZXJGbiBoYXMgdGhlIHNhbWUgZWZmZWN0IGFzXG4gIC8vIGJyZWFraW5nIG91dCBvZiB0aGUgZGlzcGF0Y2ggc3dpdGNoIHN0YXRlbWVudC5cbiAgdmFyIENvbnRpbnVlU2VudGluZWwgPSB7fTtcblxuICAvLyBEdW1teSBjb25zdHJ1Y3RvciBmdW5jdGlvbnMgdGhhdCB3ZSB1c2UgYXMgdGhlIC5jb25zdHJ1Y3RvciBhbmRcbiAgLy8gLmNvbnN0cnVjdG9yLnByb3RvdHlwZSBwcm9wZXJ0aWVzIGZvciBmdW5jdGlvbnMgdGhhdCByZXR1cm4gR2VuZXJhdG9yXG4gIC8vIG9iamVjdHMuIEZvciBmdWxsIHNwZWMgY29tcGxpYW5jZSwgeW91IG1heSB3aXNoIHRvIGNvbmZpZ3VyZSB5b3VyXG4gIC8vIG1pbmlmaWVyIG5vdCB0byBtYW5nbGUgdGhlIG5hbWVzIG9mIHRoZXNlIHR3byBmdW5jdGlvbnMuXG4gIGZ1bmN0aW9uIEdlbmVyYXRvcigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUoKSB7fVxuXG4gIC8vIFRoaXMgaXMgYSBwb2x5ZmlsbCBmb3IgJUl0ZXJhdG9yUHJvdG90eXBlJSBmb3IgZW52aXJvbm1lbnRzIHRoYXRcbiAgLy8gZG9uJ3QgbmF0aXZlbHkgc3VwcG9ydCBpdC5cbiAgdmFyIEl0ZXJhdG9yUHJvdG90eXBlID0ge307XG4gIEl0ZXJhdG9yUHJvdG90eXBlW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB2YXIgZ2V0UHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Y7XG4gIHZhciBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSA9IGdldFByb3RvICYmIGdldFByb3RvKGdldFByb3RvKHZhbHVlcyhbXSkpKTtcbiAgaWYgKE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlICYmXG4gICAgICBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSAhPT0gT3AgJiZcbiAgICAgIGhhc093bi5jYWxsKE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlLCBpdGVyYXRvclN5bWJvbCkpIHtcbiAgICAvLyBUaGlzIGVudmlyb25tZW50IGhhcyBhIG5hdGl2ZSAlSXRlcmF0b3JQcm90b3R5cGUlOyB1c2UgaXQgaW5zdGVhZFxuICAgIC8vIG9mIHRoZSBwb2x5ZmlsbC5cbiAgICBJdGVyYXRvclByb3RvdHlwZSA9IE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlO1xuICB9XG5cbiAgdmFyIEdwID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUucHJvdG90eXBlID1cbiAgICBHZW5lcmF0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShJdGVyYXRvclByb3RvdHlwZSk7XG4gIEdlbmVyYXRvckZ1bmN0aW9uLnByb3RvdHlwZSA9IEdwLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb247XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlW3RvU3RyaW5nVGFnU3ltYm9sXSA9XG4gICAgR2VuZXJhdG9yRnVuY3Rpb24uZGlzcGxheU5hbWUgPSBcIkdlbmVyYXRvckZ1bmN0aW9uXCI7XG5cbiAgLy8gSGVscGVyIGZvciBkZWZpbmluZyB0aGUgLm5leHQsIC50aHJvdywgYW5kIC5yZXR1cm4gbWV0aG9kcyBvZiB0aGVcbiAgLy8gSXRlcmF0b3IgaW50ZXJmYWNlIGluIHRlcm1zIG9mIGEgc2luZ2xlIC5faW52b2tlIG1ldGhvZC5cbiAgZnVuY3Rpb24gZGVmaW5lSXRlcmF0b3JNZXRob2RzKHByb3RvdHlwZSkge1xuICAgIFtcIm5leHRcIiwgXCJ0aHJvd1wiLCBcInJldHVyblwiXS5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgcHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbihhcmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludm9rZShtZXRob2QsIGFyZyk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgcnVudGltZS5pc0dlbmVyYXRvckZ1bmN0aW9uID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgdmFyIGN0b3IgPSB0eXBlb2YgZ2VuRnVuID09PSBcImZ1bmN0aW9uXCIgJiYgZ2VuRnVuLmNvbnN0cnVjdG9yO1xuICAgIHJldHVybiBjdG9yXG4gICAgICA/IGN0b3IgPT09IEdlbmVyYXRvckZ1bmN0aW9uIHx8XG4gICAgICAgIC8vIEZvciB0aGUgbmF0aXZlIEdlbmVyYXRvckZ1bmN0aW9uIGNvbnN0cnVjdG9yLCB0aGUgYmVzdCB3ZSBjYW5cbiAgICAgICAgLy8gZG8gaXMgdG8gY2hlY2sgaXRzIC5uYW1lIHByb3BlcnR5LlxuICAgICAgICAoY3Rvci5kaXNwbGF5TmFtZSB8fCBjdG9yLm5hbWUpID09PSBcIkdlbmVyYXRvckZ1bmN0aW9uXCJcbiAgICAgIDogZmFsc2U7XG4gIH07XG5cbiAgcnVudGltZS5tYXJrID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgaWYgKE9iamVjdC5zZXRQcm90b3R5cGVPZikge1xuICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKGdlbkZ1biwgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnZW5GdW4uX19wcm90b19fID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gICAgICBpZiAoISh0b1N0cmluZ1RhZ1N5bWJvbCBpbiBnZW5GdW4pKSB7XG4gICAgICAgIGdlbkZ1blt0b1N0cmluZ1RhZ1N5bWJvbF0gPSBcIkdlbmVyYXRvckZ1bmN0aW9uXCI7XG4gICAgICB9XG4gICAgfVxuICAgIGdlbkZ1bi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEdwKTtcbiAgICByZXR1cm4gZ2VuRnVuO1xuICB9O1xuXG4gIC8vIFdpdGhpbiB0aGUgYm9keSBvZiBhbnkgYXN5bmMgZnVuY3Rpb24sIGBhd2FpdCB4YCBpcyB0cmFuc2Zvcm1lZCB0b1xuICAvLyBgeWllbGQgcmVnZW5lcmF0b3JSdW50aW1lLmF3cmFwKHgpYCwgc28gdGhhdCB0aGUgcnVudGltZSBjYW4gdGVzdFxuICAvLyBgaGFzT3duLmNhbGwodmFsdWUsIFwiX19hd2FpdFwiKWAgdG8gZGV0ZXJtaW5lIGlmIHRoZSB5aWVsZGVkIHZhbHVlIGlzXG4gIC8vIG1lYW50IHRvIGJlIGF3YWl0ZWQuXG4gIHJ1bnRpbWUuYXdyYXAgPSBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4geyBfX2F3YWl0OiBhcmcgfTtcbiAgfTtcblxuICBmdW5jdGlvbiBBc3luY0l0ZXJhdG9yKGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZywgcmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goZ2VuZXJhdG9yW21ldGhvZF0sIGdlbmVyYXRvciwgYXJnKTtcbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHJlamVjdChyZWNvcmQuYXJnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciByZXN1bHQgPSByZWNvcmQuYXJnO1xuICAgICAgICB2YXIgdmFsdWUgPSByZXN1bHQudmFsdWU7XG4gICAgICAgIGlmICh2YWx1ZSAmJlxuICAgICAgICAgICAgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgICAgICBoYXNPd24uY2FsbCh2YWx1ZSwgXCJfX2F3YWl0XCIpKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZS5fX2F3YWl0KS50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICBpbnZva2UoXCJuZXh0XCIsIHZhbHVlLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgaW52b2tlKFwidGhyb3dcIiwgZXJyLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSkudGhlbihmdW5jdGlvbih1bndyYXBwZWQpIHtcbiAgICAgICAgICAvLyBXaGVuIGEgeWllbGRlZCBQcm9taXNlIGlzIHJlc29sdmVkLCBpdHMgZmluYWwgdmFsdWUgYmVjb21lc1xuICAgICAgICAgIC8vIHRoZSAudmFsdWUgb2YgdGhlIFByb21pc2U8e3ZhbHVlLGRvbmV9PiByZXN1bHQgZm9yIHRoZVxuICAgICAgICAgIC8vIGN1cnJlbnQgaXRlcmF0aW9uLiBJZiB0aGUgUHJvbWlzZSBpcyByZWplY3RlZCwgaG93ZXZlciwgdGhlXG4gICAgICAgICAgLy8gcmVzdWx0IGZvciB0aGlzIGl0ZXJhdGlvbiB3aWxsIGJlIHJlamVjdGVkIHdpdGggdGhlIHNhbWVcbiAgICAgICAgICAvLyByZWFzb24uIE5vdGUgdGhhdCByZWplY3Rpb25zIG9mIHlpZWxkZWQgUHJvbWlzZXMgYXJlIG5vdFxuICAgICAgICAgIC8vIHRocm93biBiYWNrIGludG8gdGhlIGdlbmVyYXRvciBmdW5jdGlvbiwgYXMgaXMgdGhlIGNhc2VcbiAgICAgICAgICAvLyB3aGVuIGFuIGF3YWl0ZWQgUHJvbWlzZSBpcyByZWplY3RlZC4gVGhpcyBkaWZmZXJlbmNlIGluXG4gICAgICAgICAgLy8gYmVoYXZpb3IgYmV0d2VlbiB5aWVsZCBhbmQgYXdhaXQgaXMgaW1wb3J0YW50LCBiZWNhdXNlIGl0XG4gICAgICAgICAgLy8gYWxsb3dzIHRoZSBjb25zdW1lciB0byBkZWNpZGUgd2hhdCB0byBkbyB3aXRoIHRoZSB5aWVsZGVkXG4gICAgICAgICAgLy8gcmVqZWN0aW9uIChzd2FsbG93IGl0IGFuZCBjb250aW51ZSwgbWFudWFsbHkgLnRocm93IGl0IGJhY2tcbiAgICAgICAgICAvLyBpbnRvIHRoZSBnZW5lcmF0b3IsIGFiYW5kb24gaXRlcmF0aW9uLCB3aGF0ZXZlcikuIFdpdGhcbiAgICAgICAgICAvLyBhd2FpdCwgYnkgY29udHJhc3QsIHRoZXJlIGlzIG5vIG9wcG9ydHVuaXR5IHRvIGV4YW1pbmUgdGhlXG4gICAgICAgICAgLy8gcmVqZWN0aW9uIHJlYXNvbiBvdXRzaWRlIHRoZSBnZW5lcmF0b3IgZnVuY3Rpb24sIHNvIHRoZVxuICAgICAgICAgIC8vIG9ubHkgb3B0aW9uIGlzIHRvIHRocm93IGl0IGZyb20gdGhlIGF3YWl0IGV4cHJlc3Npb24sIGFuZFxuICAgICAgICAgIC8vIGxldCB0aGUgZ2VuZXJhdG9yIGZ1bmN0aW9uIGhhbmRsZSB0aGUgZXhjZXB0aW9uLlxuICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IHVud3JhcHBlZDtcbiAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH0sIHJlamVjdCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHByZXZpb3VzUHJvbWlzZTtcblxuICAgIGZ1bmN0aW9uIGVucXVldWUobWV0aG9kLCBhcmcpIHtcbiAgICAgIGZ1bmN0aW9uIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgaW52b2tlKG1ldGhvZCwgYXJnLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHByZXZpb3VzUHJvbWlzZSA9XG4gICAgICAgIC8vIElmIGVucXVldWUgaGFzIGJlZW4gY2FsbGVkIGJlZm9yZSwgdGhlbiB3ZSB3YW50IHRvIHdhaXQgdW50aWxcbiAgICAgICAgLy8gYWxsIHByZXZpb3VzIFByb21pc2VzIGhhdmUgYmVlbiByZXNvbHZlZCBiZWZvcmUgY2FsbGluZyBpbnZva2UsXG4gICAgICAgIC8vIHNvIHRoYXQgcmVzdWx0cyBhcmUgYWx3YXlzIGRlbGl2ZXJlZCBpbiB0aGUgY29ycmVjdCBvcmRlci4gSWZcbiAgICAgICAgLy8gZW5xdWV1ZSBoYXMgbm90IGJlZW4gY2FsbGVkIGJlZm9yZSwgdGhlbiBpdCBpcyBpbXBvcnRhbnQgdG9cbiAgICAgICAgLy8gY2FsbCBpbnZva2UgaW1tZWRpYXRlbHksIHdpdGhvdXQgd2FpdGluZyBvbiBhIGNhbGxiYWNrIHRvIGZpcmUsXG4gICAgICAgIC8vIHNvIHRoYXQgdGhlIGFzeW5jIGdlbmVyYXRvciBmdW5jdGlvbiBoYXMgdGhlIG9wcG9ydHVuaXR5IHRvIGRvXG4gICAgICAgIC8vIGFueSBuZWNlc3Nhcnkgc2V0dXAgaW4gYSBwcmVkaWN0YWJsZSB3YXkuIFRoaXMgcHJlZGljdGFiaWxpdHlcbiAgICAgICAgLy8gaXMgd2h5IHRoZSBQcm9taXNlIGNvbnN0cnVjdG9yIHN5bmNocm9ub3VzbHkgaW52b2tlcyBpdHNcbiAgICAgICAgLy8gZXhlY3V0b3IgY2FsbGJhY2ssIGFuZCB3aHkgYXN5bmMgZnVuY3Rpb25zIHN5bmNocm9ub3VzbHlcbiAgICAgICAgLy8gZXhlY3V0ZSBjb2RlIGJlZm9yZSB0aGUgZmlyc3QgYXdhaXQuIFNpbmNlIHdlIGltcGxlbWVudCBzaW1wbGVcbiAgICAgICAgLy8gYXN5bmMgZnVuY3Rpb25zIGluIHRlcm1zIG9mIGFzeW5jIGdlbmVyYXRvcnMsIGl0IGlzIGVzcGVjaWFsbHlcbiAgICAgICAgLy8gaW1wb3J0YW50IHRvIGdldCB0aGlzIHJpZ2h0LCBldmVuIHRob3VnaCBpdCByZXF1aXJlcyBjYXJlLlxuICAgICAgICBwcmV2aW91c1Byb21pc2UgPyBwcmV2aW91c1Byb21pc2UudGhlbihcbiAgICAgICAgICBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZyxcbiAgICAgICAgICAvLyBBdm9pZCBwcm9wYWdhdGluZyBmYWlsdXJlcyB0byBQcm9taXNlcyByZXR1cm5lZCBieSBsYXRlclxuICAgICAgICAgIC8vIGludm9jYXRpb25zIG9mIHRoZSBpdGVyYXRvci5cbiAgICAgICAgICBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZ1xuICAgICAgICApIDogY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcoKTtcbiAgICB9XG5cbiAgICAvLyBEZWZpbmUgdGhlIHVuaWZpZWQgaGVscGVyIG1ldGhvZCB0aGF0IGlzIHVzZWQgdG8gaW1wbGVtZW50IC5uZXh0LFxuICAgIC8vIC50aHJvdywgYW5kIC5yZXR1cm4gKHNlZSBkZWZpbmVJdGVyYXRvck1ldGhvZHMpLlxuICAgIHRoaXMuX2ludm9rZSA9IGVucXVldWU7XG4gIH1cblxuICBkZWZpbmVJdGVyYXRvck1ldGhvZHMoQXN5bmNJdGVyYXRvci5wcm90b3R5cGUpO1xuICBBc3luY0l0ZXJhdG9yLnByb3RvdHlwZVthc3luY0l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgcnVudGltZS5Bc3luY0l0ZXJhdG9yID0gQXN5bmNJdGVyYXRvcjtcblxuICAvLyBOb3RlIHRoYXQgc2ltcGxlIGFzeW5jIGZ1bmN0aW9ucyBhcmUgaW1wbGVtZW50ZWQgb24gdG9wIG9mXG4gIC8vIEFzeW5jSXRlcmF0b3Igb2JqZWN0czsgdGhleSBqdXN0IHJldHVybiBhIFByb21pc2UgZm9yIHRoZSB2YWx1ZSBvZlxuICAvLyB0aGUgZmluYWwgcmVzdWx0IHByb2R1Y2VkIGJ5IHRoZSBpdGVyYXRvci5cbiAgcnVudGltZS5hc3luYyA9IGZ1bmN0aW9uKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSB7XG4gICAgdmFyIGl0ZXIgPSBuZXcgQXN5bmNJdGVyYXRvcihcbiAgICAgIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpXG4gICAgKTtcblxuICAgIHJldHVybiBydW50aW1lLmlzR2VuZXJhdG9yRnVuY3Rpb24ob3V0ZXJGbilcbiAgICAgID8gaXRlciAvLyBJZiBvdXRlckZuIGlzIGEgZ2VuZXJhdG9yLCByZXR1cm4gdGhlIGZ1bGwgaXRlcmF0b3IuXG4gICAgICA6IGl0ZXIubmV4dCgpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdC5kb25lID8gcmVzdWx0LnZhbHVlIDogaXRlci5uZXh0KCk7XG4gICAgICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCkge1xuICAgIHZhciBzdGF0ZSA9IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQ7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnKSB7XG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlRXhlY3V0aW5nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IHJ1bm5pbmdcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVDb21wbGV0ZWQpIHtcbiAgICAgICAgaWYgKG1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgdGhyb3cgYXJnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQmUgZm9yZ2l2aW5nLCBwZXIgMjUuMy4zLjMuMyBvZiB0aGUgc3BlYzpcbiAgICAgICAgLy8gaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLWdlbmVyYXRvcnJlc3VtZVxuICAgICAgICByZXR1cm4gZG9uZVJlc3VsdCgpO1xuICAgICAgfVxuXG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IG1ldGhvZDtcbiAgICAgIGNvbnRleHQuYXJnID0gYXJnO1xuXG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICB2YXIgZGVsZWdhdGUgPSBjb250ZXh0LmRlbGVnYXRlO1xuICAgICAgICBpZiAoZGVsZWdhdGUpIHtcbiAgICAgICAgICB2YXIgZGVsZWdhdGVSZXN1bHQgPSBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KTtcbiAgICAgICAgICBpZiAoZGVsZWdhdGVSZXN1bHQpIHtcbiAgICAgICAgICAgIGlmIChkZWxlZ2F0ZVJlc3VsdCA9PT0gQ29udGludWVTZW50aW5lbCkgY29udGludWU7XG4gICAgICAgICAgICByZXR1cm4gZGVsZWdhdGVSZXN1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAgIC8vIFNldHRpbmcgY29udGV4dC5fc2VudCBmb3IgbGVnYWN5IHN1cHBvcnQgb2YgQmFiZWwnc1xuICAgICAgICAgIC8vIGZ1bmN0aW9uLnNlbnQgaW1wbGVtZW50YXRpb24uXG4gICAgICAgICAgY29udGV4dC5zZW50ID0gY29udGV4dC5fc2VudCA9IGNvbnRleHQuYXJnO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydCkge1xuICAgICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAgIHRocm93IGNvbnRleHQuYXJnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oY29udGV4dC5hcmcpO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dC5tZXRob2QgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgICBjb250ZXh0LmFicnVwdChcInJldHVyblwiLCBjb250ZXh0LmFyZyk7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZSA9IEdlblN0YXRlRXhlY3V0aW5nO1xuXG4gICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChpbm5lckZuLCBzZWxmLCBjb250ZXh0KTtcbiAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiKSB7XG4gICAgICAgICAgLy8gSWYgYW4gZXhjZXB0aW9uIGlzIHRocm93biBmcm9tIGlubmVyRm4sIHdlIGxlYXZlIHN0YXRlID09PVxuICAgICAgICAgIC8vIEdlblN0YXRlRXhlY3V0aW5nIGFuZCBsb29wIGJhY2sgZm9yIGFub3RoZXIgaW52b2NhdGlvbi5cbiAgICAgICAgICBzdGF0ZSA9IGNvbnRleHQuZG9uZVxuICAgICAgICAgICAgPyBHZW5TdGF0ZUNvbXBsZXRlZFxuICAgICAgICAgICAgOiBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkO1xuXG4gICAgICAgICAgaWYgKHJlY29yZC5hcmcgPT09IENvbnRpbnVlU2VudGluZWwpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogcmVjb3JkLmFyZyxcbiAgICAgICAgICAgIGRvbmU6IGNvbnRleHQuZG9uZVxuICAgICAgICAgIH07XG5cbiAgICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAvLyBEaXNwYXRjaCB0aGUgZXhjZXB0aW9uIGJ5IGxvb3BpbmcgYmFjayBhcm91bmQgdG8gdGhlXG4gICAgICAgICAgLy8gY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihjb250ZXh0LmFyZykgY2FsbCBhYm92ZS5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gQ2FsbCBkZWxlZ2F0ZS5pdGVyYXRvcltjb250ZXh0Lm1ldGhvZF0oY29udGV4dC5hcmcpIGFuZCBoYW5kbGUgdGhlXG4gIC8vIHJlc3VsdCwgZWl0aGVyIGJ5IHJldHVybmluZyBhIHsgdmFsdWUsIGRvbmUgfSByZXN1bHQgZnJvbSB0aGVcbiAgLy8gZGVsZWdhdGUgaXRlcmF0b3IsIG9yIGJ5IG1vZGlmeWluZyBjb250ZXh0Lm1ldGhvZCBhbmQgY29udGV4dC5hcmcsXG4gIC8vIHNldHRpbmcgY29udGV4dC5kZWxlZ2F0ZSB0byBudWxsLCBhbmQgcmV0dXJuaW5nIHRoZSBDb250aW51ZVNlbnRpbmVsLlxuICBmdW5jdGlvbiBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIG1ldGhvZCA9IGRlbGVnYXRlLml0ZXJhdG9yW2NvbnRleHQubWV0aG9kXTtcbiAgICBpZiAobWV0aG9kID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIEEgLnRocm93IG9yIC5yZXR1cm4gd2hlbiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIG5vIC50aHJvd1xuICAgICAgLy8gbWV0aG9kIGFsd2F5cyB0ZXJtaW5hdGVzIHRoZSB5aWVsZCogbG9vcC5cbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICBpZiAoZGVsZWdhdGUuaXRlcmF0b3IucmV0dXJuKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGhhcyBhIHJldHVybiBtZXRob2QsIGdpdmUgaXQgYVxuICAgICAgICAgIC8vIGNoYW5jZSB0byBjbGVhbiB1cC5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwicmV0dXJuXCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCk7XG5cbiAgICAgICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgLy8gSWYgbWF5YmVJbnZva2VEZWxlZ2F0ZShjb250ZXh0KSBjaGFuZ2VkIGNvbnRleHQubWV0aG9kIGZyb21cbiAgICAgICAgICAgIC8vIFwicmV0dXJuXCIgdG8gXCJ0aHJvd1wiLCBsZXQgdGhhdCBvdmVycmlkZSB0aGUgVHlwZUVycm9yIGJlbG93LlxuICAgICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgIGNvbnRleHQuYXJnID0gbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICBcIlRoZSBpdGVyYXRvciBkb2VzIG5vdCBwcm92aWRlIGEgJ3Rocm93JyBtZXRob2RcIik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChtZXRob2QsIGRlbGVnYXRlLml0ZXJhdG9yLCBjb250ZXh0LmFyZyk7XG5cbiAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICBjb250ZXh0LmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIHZhciBpbmZvID0gcmVjb3JkLmFyZztcblxuICAgIGlmICghIGluZm8pIHtcbiAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgY29udGV4dC5hcmcgPSBuZXcgVHlwZUVycm9yKFwiaXRlcmF0b3IgcmVzdWx0IGlzIG5vdCBhbiBvYmplY3RcIik7XG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIGlmIChpbmZvLmRvbmUpIHtcbiAgICAgIC8vIEFzc2lnbiB0aGUgcmVzdWx0IG9mIHRoZSBmaW5pc2hlZCBkZWxlZ2F0ZSB0byB0aGUgdGVtcG9yYXJ5XG4gICAgICAvLyB2YXJpYWJsZSBzcGVjaWZpZWQgYnkgZGVsZWdhdGUucmVzdWx0TmFtZSAoc2VlIGRlbGVnYXRlWWllbGQpLlxuICAgICAgY29udGV4dFtkZWxlZ2F0ZS5yZXN1bHROYW1lXSA9IGluZm8udmFsdWU7XG5cbiAgICAgIC8vIFJlc3VtZSBleGVjdXRpb24gYXQgdGhlIGRlc2lyZWQgbG9jYXRpb24gKHNlZSBkZWxlZ2F0ZVlpZWxkKS5cbiAgICAgIGNvbnRleHQubmV4dCA9IGRlbGVnYXRlLm5leHRMb2M7XG5cbiAgICAgIC8vIElmIGNvbnRleHQubWV0aG9kIHdhcyBcInRocm93XCIgYnV0IHRoZSBkZWxlZ2F0ZSBoYW5kbGVkIHRoZVxuICAgICAgLy8gZXhjZXB0aW9uLCBsZXQgdGhlIG91dGVyIGdlbmVyYXRvciBwcm9jZWVkIG5vcm1hbGx5LiBJZlxuICAgICAgLy8gY29udGV4dC5tZXRob2Qgd2FzIFwibmV4dFwiLCBmb3JnZXQgY29udGV4dC5hcmcgc2luY2UgaXQgaGFzIGJlZW5cbiAgICAgIC8vIFwiY29uc3VtZWRcIiBieSB0aGUgZGVsZWdhdGUgaXRlcmF0b3IuIElmIGNvbnRleHQubWV0aG9kIHdhc1xuICAgICAgLy8gXCJyZXR1cm5cIiwgYWxsb3cgdGhlIG9yaWdpbmFsIC5yZXR1cm4gY2FsbCB0byBjb250aW51ZSBpbiB0aGVcbiAgICAgIC8vIG91dGVyIGdlbmVyYXRvci5cbiAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCAhPT0gXCJyZXR1cm5cIikge1xuICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBSZS15aWVsZCB0aGUgcmVzdWx0IHJldHVybmVkIGJ5IHRoZSBkZWxlZ2F0ZSBtZXRob2QuXG4gICAgICByZXR1cm4gaW5mbztcbiAgICB9XG5cbiAgICAvLyBUaGUgZGVsZWdhdGUgaXRlcmF0b3IgaXMgZmluaXNoZWQsIHNvIGZvcmdldCBpdCBhbmQgY29udGludWUgd2l0aFxuICAgIC8vIHRoZSBvdXRlciBnZW5lcmF0b3IuXG4gICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gIH1cblxuICAvLyBEZWZpbmUgR2VuZXJhdG9yLnByb3RvdHlwZS57bmV4dCx0aHJvdyxyZXR1cm59IGluIHRlcm1zIG9mIHRoZVxuICAvLyB1bmlmaWVkIC5faW52b2tlIGhlbHBlciBtZXRob2QuXG4gIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhHcCk7XG5cbiAgR3BbdG9TdHJpbmdUYWdTeW1ib2xdID0gXCJHZW5lcmF0b3JcIjtcblxuICAvLyBBIEdlbmVyYXRvciBzaG91bGQgYWx3YXlzIHJldHVybiBpdHNlbGYgYXMgdGhlIGl0ZXJhdG9yIG9iamVjdCB3aGVuIHRoZVxuICAvLyBAQGl0ZXJhdG9yIGZ1bmN0aW9uIGlzIGNhbGxlZCBvbiBpdC4gU29tZSBicm93c2VycycgaW1wbGVtZW50YXRpb25zIG9mIHRoZVxuICAvLyBpdGVyYXRvciBwcm90b3R5cGUgY2hhaW4gaW5jb3JyZWN0bHkgaW1wbGVtZW50IHRoaXMsIGNhdXNpbmcgdGhlIEdlbmVyYXRvclxuICAvLyBvYmplY3QgdG8gbm90IGJlIHJldHVybmVkIGZyb20gdGhpcyBjYWxsLiBUaGlzIGVuc3VyZXMgdGhhdCBkb2Vzbid0IGhhcHBlbi5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWdlbmVyYXRvci9pc3N1ZXMvMjc0IGZvciBtb3JlIGRldGFpbHMuXG4gIEdwW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEdwLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwiW29iamVjdCBHZW5lcmF0b3JdXCI7XG4gIH07XG5cbiAgZnVuY3Rpb24gcHVzaFRyeUVudHJ5KGxvY3MpIHtcbiAgICB2YXIgZW50cnkgPSB7IHRyeUxvYzogbG9jc1swXSB9O1xuXG4gICAgaWYgKDEgaW4gbG9jcykge1xuICAgICAgZW50cnkuY2F0Y2hMb2MgPSBsb2NzWzFdO1xuICAgIH1cblxuICAgIGlmICgyIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmZpbmFsbHlMb2MgPSBsb2NzWzJdO1xuICAgICAgZW50cnkuYWZ0ZXJMb2MgPSBsb2NzWzNdO1xuICAgIH1cblxuICAgIHRoaXMudHJ5RW50cmllcy5wdXNoKGVudHJ5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0VHJ5RW50cnkoZW50cnkpIHtcbiAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbiB8fCB7fTtcbiAgICByZWNvcmQudHlwZSA9IFwibm9ybWFsXCI7XG4gICAgZGVsZXRlIHJlY29yZC5hcmc7XG4gICAgZW50cnkuY29tcGxldGlvbiA9IHJlY29yZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIENvbnRleHQodHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBUaGUgcm9vdCBlbnRyeSBvYmplY3QgKGVmZmVjdGl2ZWx5IGEgdHJ5IHN0YXRlbWVudCB3aXRob3V0IGEgY2F0Y2hcbiAgICAvLyBvciBhIGZpbmFsbHkgYmxvY2spIGdpdmVzIHVzIGEgcGxhY2UgdG8gc3RvcmUgdmFsdWVzIHRocm93biBmcm9tXG4gICAgLy8gbG9jYXRpb25zIHdoZXJlIHRoZXJlIGlzIG5vIGVuY2xvc2luZyB0cnkgc3RhdGVtZW50LlxuICAgIHRoaXMudHJ5RW50cmllcyA9IFt7IHRyeUxvYzogXCJyb290XCIgfV07XG4gICAgdHJ5TG9jc0xpc3QuZm9yRWFjaChwdXNoVHJ5RW50cnksIHRoaXMpO1xuICAgIHRoaXMucmVzZXQodHJ1ZSk7XG4gIH1cblxuICBydW50aW1lLmtleXMgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgIGtleXMucHVzaChrZXkpO1xuICAgIH1cbiAgICBrZXlzLnJldmVyc2UoKTtcblxuICAgIC8vIFJhdGhlciB0aGFuIHJldHVybmluZyBhbiBvYmplY3Qgd2l0aCBhIG5leHQgbWV0aG9kLCB3ZSBrZWVwXG4gICAgLy8gdGhpbmdzIHNpbXBsZSBhbmQgcmV0dXJuIHRoZSBuZXh0IGZ1bmN0aW9uIGl0c2VsZi5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgIHdoaWxlIChrZXlzLmxlbmd0aCkge1xuICAgICAgICB2YXIga2V5ID0ga2V5cy5wb3AoKTtcbiAgICAgICAgaWYgKGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgICBuZXh0LnZhbHVlID0ga2V5O1xuICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRvIGF2b2lkIGNyZWF0aW5nIGFuIGFkZGl0aW9uYWwgb2JqZWN0LCB3ZSBqdXN0IGhhbmcgdGhlIC52YWx1ZVxuICAgICAgLy8gYW5kIC5kb25lIHByb3BlcnRpZXMgb2ZmIHRoZSBuZXh0IGZ1bmN0aW9uIG9iamVjdCBpdHNlbGYuIFRoaXNcbiAgICAgIC8vIGFsc28gZW5zdXJlcyB0aGF0IHRoZSBtaW5pZmllciB3aWxsIG5vdCBhbm9ueW1pemUgdGhlIGZ1bmN0aW9uLlxuICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcbiAgICAgIHJldHVybiBuZXh0O1xuICAgIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gdmFsdWVzKGl0ZXJhYmxlKSB7XG4gICAgaWYgKGl0ZXJhYmxlKSB7XG4gICAgICB2YXIgaXRlcmF0b3JNZXRob2QgPSBpdGVyYWJsZVtpdGVyYXRvclN5bWJvbF07XG4gICAgICBpZiAoaXRlcmF0b3JNZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yTWV0aG9kLmNhbGwoaXRlcmFibGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGl0ZXJhYmxlLm5leHQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gaXRlcmFibGU7XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNOYU4oaXRlcmFibGUubGVuZ3RoKSkge1xuICAgICAgICB2YXIgaSA9IC0xLCBuZXh0ID0gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgaXRlcmFibGUubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoaGFzT3duLmNhbGwoaXRlcmFibGUsIGkpKSB7XG4gICAgICAgICAgICAgIG5leHQudmFsdWUgPSBpdGVyYWJsZVtpXTtcbiAgICAgICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIG5leHQudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcblxuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBuZXh0Lm5leHQgPSBuZXh0O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJldHVybiBhbiBpdGVyYXRvciB3aXRoIG5vIHZhbHVlcy5cbiAgICByZXR1cm4geyBuZXh0OiBkb25lUmVzdWx0IH07XG4gIH1cbiAgcnVudGltZS52YWx1ZXMgPSB2YWx1ZXM7XG5cbiAgZnVuY3Rpb24gZG9uZVJlc3VsdCgpIHtcbiAgICByZXR1cm4geyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH07XG4gIH1cblxuICBDb250ZXh0LnByb3RvdHlwZSA9IHtcbiAgICBjb25zdHJ1Y3RvcjogQ29udGV4dCxcblxuICAgIHJlc2V0OiBmdW5jdGlvbihza2lwVGVtcFJlc2V0KSB7XG4gICAgICB0aGlzLnByZXYgPSAwO1xuICAgICAgdGhpcy5uZXh0ID0gMDtcbiAgICAgIC8vIFJlc2V0dGluZyBjb250ZXh0Ll9zZW50IGZvciBsZWdhY3kgc3VwcG9ydCBvZiBCYWJlbCdzXG4gICAgICAvLyBmdW5jdGlvbi5zZW50IGltcGxlbWVudGF0aW9uLlxuICAgICAgdGhpcy5zZW50ID0gdGhpcy5fc2VudCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgIHRoaXMubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICB0aGlzLmFyZyA9IHVuZGVmaW5lZDtcblxuICAgICAgdGhpcy50cnlFbnRyaWVzLmZvckVhY2gocmVzZXRUcnlFbnRyeSk7XG5cbiAgICAgIGlmICghc2tpcFRlbXBSZXNldCkge1xuICAgICAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMpIHtcbiAgICAgICAgICAvLyBOb3Qgc3VyZSBhYm91dCB0aGUgb3B0aW1hbCBvcmRlciBvZiB0aGVzZSBjb25kaXRpb25zOlxuICAgICAgICAgIGlmIChuYW1lLmNoYXJBdCgwKSA9PT0gXCJ0XCIgJiZcbiAgICAgICAgICAgICAgaGFzT3duLmNhbGwodGhpcywgbmFtZSkgJiZcbiAgICAgICAgICAgICAgIWlzTmFOKCtuYW1lLnNsaWNlKDEpKSkge1xuICAgICAgICAgICAgdGhpc1tuYW1lXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuXG4gICAgICB2YXIgcm9vdEVudHJ5ID0gdGhpcy50cnlFbnRyaWVzWzBdO1xuICAgICAgdmFyIHJvb3RSZWNvcmQgPSByb290RW50cnkuY29tcGxldGlvbjtcbiAgICAgIGlmIChyb290UmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByb290UmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucnZhbDtcbiAgICB9LFxuXG4gICAgZGlzcGF0Y2hFeGNlcHRpb246IGZ1bmN0aW9uKGV4Y2VwdGlvbikge1xuICAgICAgaWYgKHRoaXMuZG9uZSkge1xuICAgICAgICB0aHJvdyBleGNlcHRpb247XG4gICAgICB9XG5cbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcztcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZShsb2MsIGNhdWdodCkge1xuICAgICAgICByZWNvcmQudHlwZSA9IFwidGhyb3dcIjtcbiAgICAgICAgcmVjb3JkLmFyZyA9IGV4Y2VwdGlvbjtcbiAgICAgICAgY29udGV4dC5uZXh0ID0gbG9jO1xuXG4gICAgICAgIGlmIChjYXVnaHQpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgZGlzcGF0Y2hlZCBleGNlcHRpb24gd2FzIGNhdWdodCBieSBhIGNhdGNoIGJsb2NrLFxuICAgICAgICAgIC8vIHRoZW4gbGV0IHRoYXQgY2F0Y2ggYmxvY2sgaGFuZGxlIHRoZSBleGNlcHRpb24gbm9ybWFsbHkuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAhISBjYXVnaHQ7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSBcInJvb3RcIikge1xuICAgICAgICAgIC8vIEV4Y2VwdGlvbiB0aHJvd24gb3V0c2lkZSBvZiBhbnkgdHJ5IGJsb2NrIHRoYXQgY291bGQgaGFuZGxlXG4gICAgICAgICAgLy8gaXQsIHNvIHNldCB0aGUgY29tcGxldGlvbiB2YWx1ZSBvZiB0aGUgZW50aXJlIGZ1bmN0aW9uIHRvXG4gICAgICAgICAgLy8gdGhyb3cgdGhlIGV4Y2VwdGlvbi5cbiAgICAgICAgICByZXR1cm4gaGFuZGxlKFwiZW5kXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYpIHtcbiAgICAgICAgICB2YXIgaGFzQ2F0Y2ggPSBoYXNPd24uY2FsbChlbnRyeSwgXCJjYXRjaExvY1wiKTtcbiAgICAgICAgICB2YXIgaGFzRmluYWxseSA9IGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIik7XG5cbiAgICAgICAgICBpZiAoaGFzQ2F0Y2ggJiYgaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0NhdGNoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidHJ5IHN0YXRlbWVudCB3aXRob3V0IGNhdGNoIG9yIGZpbmFsbHlcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGFicnVwdDogZnVuY3Rpb24odHlwZSwgYXJnKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIikgJiZcbiAgICAgICAgICAgIHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICB2YXIgZmluYWxseUVudHJ5ID0gZW50cnk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSAmJlxuICAgICAgICAgICh0eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICAgdHlwZSA9PT0gXCJjb250aW51ZVwiKSAmJlxuICAgICAgICAgIGZpbmFsbHlFbnRyeS50cnlMb2MgPD0gYXJnICYmXG4gICAgICAgICAgYXJnIDw9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgIC8vIElnbm9yZSB0aGUgZmluYWxseSBlbnRyeSBpZiBjb250cm9sIGlzIG5vdCBqdW1waW5nIHRvIGFcbiAgICAgICAgLy8gbG9jYXRpb24gb3V0c2lkZSB0aGUgdHJ5L2NhdGNoIGJsb2NrLlxuICAgICAgICBmaW5hbGx5RW50cnkgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVjb3JkID0gZmluYWxseUVudHJ5ID8gZmluYWxseUVudHJ5LmNvbXBsZXRpb24gOiB7fTtcbiAgICAgIHJlY29yZC50eXBlID0gdHlwZTtcbiAgICAgIHJlY29yZC5hcmcgPSBhcmc7XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkpIHtcbiAgICAgICAgdGhpcy5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgdGhpcy5uZXh0ID0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2M7XG4gICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5jb21wbGV0ZShyZWNvcmQpO1xuICAgIH0sXG5cbiAgICBjb21wbGV0ZTogZnVuY3Rpb24ocmVjb3JkLCBhZnRlckxvYykge1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICByZWNvcmQudHlwZSA9PT0gXCJjb250aW51ZVwiKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IHJlY29yZC5hcmc7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInJldHVyblwiKSB7XG4gICAgICAgIHRoaXMucnZhbCA9IHRoaXMuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgdGhpcy5tZXRob2QgPSBcInJldHVyblwiO1xuICAgICAgICB0aGlzLm5leHQgPSBcImVuZFwiO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIiAmJiBhZnRlckxvYykge1xuICAgICAgICB0aGlzLm5leHQgPSBhZnRlckxvYztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfSxcblxuICAgIGZpbmlzaDogZnVuY3Rpb24oZmluYWxseUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS5maW5hbGx5TG9jID09PSBmaW5hbGx5TG9jKSB7XG4gICAgICAgICAgdGhpcy5jb21wbGV0ZShlbnRyeS5jb21wbGV0aW9uLCBlbnRyeS5hZnRlckxvYyk7XG4gICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgXCJjYXRjaFwiOiBmdW5jdGlvbih0cnlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSB0cnlMb2MpIHtcbiAgICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcbiAgICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgdmFyIHRocm93biA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRocm93bjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUaGUgY29udGV4dC5jYXRjaCBtZXRob2QgbXVzdCBvbmx5IGJlIGNhbGxlZCB3aXRoIGEgbG9jYXRpb25cbiAgICAgIC8vIGFyZ3VtZW50IHRoYXQgY29ycmVzcG9uZHMgdG8gYSBrbm93biBjYXRjaCBibG9jay5cbiAgICAgIHRocm93IG5ldyBFcnJvcihcImlsbGVnYWwgY2F0Y2ggYXR0ZW1wdFwiKTtcbiAgICB9LFxuXG4gICAgZGVsZWdhdGVZaWVsZDogZnVuY3Rpb24oaXRlcmFibGUsIHJlc3VsdE5hbWUsIG5leHRMb2MpIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSB7XG4gICAgICAgIGl0ZXJhdG9yOiB2YWx1ZXMoaXRlcmFibGUpLFxuICAgICAgICByZXN1bHROYW1lOiByZXN1bHROYW1lLFxuICAgICAgICBuZXh0TG9jOiBuZXh0TG9jXG4gICAgICB9O1xuXG4gICAgICBpZiAodGhpcy5tZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgIC8vIERlbGliZXJhdGVseSBmb3JnZXQgdGhlIGxhc3Qgc2VudCB2YWx1ZSBzbyB0aGF0IHdlIGRvbid0XG4gICAgICAgIC8vIGFjY2lkZW50YWxseSBwYXNzIGl0IG9uIHRvIHRoZSBkZWxlZ2F0ZS5cbiAgICAgICAgdGhpcy5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cbiAgfTtcbn0pKFxuICAvLyBJbiBzbG9wcHkgbW9kZSwgdW5ib3VuZCBgdGhpc2AgcmVmZXJzIHRvIHRoZSBnbG9iYWwgb2JqZWN0LCBmYWxsYmFjayB0b1xuICAvLyBGdW5jdGlvbiBjb25zdHJ1Y3RvciBpZiB3ZSdyZSBpbiBnbG9iYWwgc3RyaWN0IG1vZGUuIFRoYXQgaXMgc2FkbHkgYSBmb3JtXG4gIC8vIG9mIGluZGlyZWN0IGV2YWwgd2hpY2ggdmlvbGF0ZXMgQ29udGVudCBTZWN1cml0eSBQb2xpY3kuXG4gIChmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMgfSkoKSB8fCBGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKClcbik7XG4iLCJcbi8qKlxuICogTW9kdWxlIERlcGVuZGVuY2llc1xuICovXG5cbnZhciBleHByO1xudHJ5IHtcbiAgZXhwciA9IHJlcXVpcmUoJ3Byb3BzJyk7XG59IGNhdGNoKGUpIHtcbiAgZXhwciA9IHJlcXVpcmUoJ2NvbXBvbmVudC1wcm9wcycpO1xufVxuXG4vKipcbiAqIEV4cG9zZSBgdG9GdW5jdGlvbigpYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRvRnVuY3Rpb247XG5cbi8qKlxuICogQ29udmVydCBgb2JqYCB0byBhIGBGdW5jdGlvbmAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gb2JqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHRvRnVuY3Rpb24ob2JqKSB7XG4gIHN3aXRjaCAoe30udG9TdHJpbmcuY2FsbChvYmopKSB7XG4gICAgY2FzZSAnW29iamVjdCBPYmplY3RdJzpcbiAgICAgIHJldHVybiBvYmplY3RUb0Z1bmN0aW9uKG9iaik7XG4gICAgY2FzZSAnW29iamVjdCBGdW5jdGlvbl0nOlxuICAgICAgcmV0dXJuIG9iajtcbiAgICBjYXNlICdbb2JqZWN0IFN0cmluZ10nOlxuICAgICAgcmV0dXJuIHN0cmluZ1RvRnVuY3Rpb24ob2JqKTtcbiAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOlxuICAgICAgcmV0dXJuIHJlZ2V4cFRvRnVuY3Rpb24ob2JqKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGRlZmF1bHRUb0Z1bmN0aW9uKG9iaik7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWZhdWx0IHRvIHN0cmljdCBlcXVhbGl0eS5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZGVmYXVsdFRvRnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiBmdW5jdGlvbihvYmope1xuICAgIHJldHVybiB2YWwgPT09IG9iajtcbiAgfTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGByZWAgdG8gYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1JlZ0V4cH0gcmVcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcmVnZXhwVG9GdW5jdGlvbihyZSkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqKXtcbiAgICByZXR1cm4gcmUudGVzdChvYmopO1xuICB9O1xufVxuXG4vKipcbiAqIENvbnZlcnQgcHJvcGVydHkgYHN0cmAgdG8gYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHN0cmluZ1RvRnVuY3Rpb24oc3RyKSB7XG4gIC8vIGltbWVkaWF0ZSBzdWNoIGFzIFwiPiAyMFwiXG4gIGlmICgvXiAqXFxXKy8udGVzdChzdHIpKSByZXR1cm4gbmV3IEZ1bmN0aW9uKCdfJywgJ3JldHVybiBfICcgKyBzdHIpO1xuXG4gIC8vIHByb3BlcnRpZXMgc3VjaCBhcyBcIm5hbWUuZmlyc3RcIiBvciBcImFnZSA+IDE4XCIgb3IgXCJhZ2UgPiAxOCAmJiBhZ2UgPCAzNlwiXG4gIHJldHVybiBuZXcgRnVuY3Rpb24oJ18nLCAncmV0dXJuICcgKyBnZXQoc3RyKSk7XG59XG5cbi8qKlxuICogQ29udmVydCBgb2JqZWN0YCB0byBhIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3RcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gb2JqZWN0VG9GdW5jdGlvbihvYmopIHtcbiAgdmFyIG1hdGNoID0ge307XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBtYXRjaFtrZXldID0gdHlwZW9mIG9ialtrZXldID09PSAnc3RyaW5nJ1xuICAgICAgPyBkZWZhdWx0VG9GdW5jdGlvbihvYmpba2V5XSlcbiAgICAgIDogdG9GdW5jdGlvbihvYmpba2V5XSk7XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbCl7XG4gICAgaWYgKHR5cGVvZiB2YWwgIT09ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG4gICAgZm9yICh2YXIga2V5IGluIG1hdGNoKSB7XG4gICAgICBpZiAoIShrZXkgaW4gdmFsKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgaWYgKCFtYXRjaFtrZXldKHZhbFtrZXldKSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbn1cblxuLyoqXG4gKiBCdWlsdCB0aGUgZ2V0dGVyIGZ1bmN0aW9uLiBTdXBwb3J0cyBnZXR0ZXIgc3R5bGUgZnVuY3Rpb25zXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZ2V0KHN0cikge1xuICB2YXIgcHJvcHMgPSBleHByKHN0cik7XG4gIGlmICghcHJvcHMubGVuZ3RoKSByZXR1cm4gJ18uJyArIHN0cjtcblxuICB2YXIgdmFsLCBpLCBwcm9wO1xuICBmb3IgKGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICBwcm9wID0gcHJvcHNbaV07XG4gICAgdmFsID0gJ18uJyArIHByb3A7XG4gICAgdmFsID0gXCIoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgXCIgKyB2YWwgKyBcIiA/IFwiICsgdmFsICsgXCIoKSA6IFwiICsgdmFsICsgXCIpXCI7XG5cbiAgICAvLyBtaW1pYyBuZWdhdGl2ZSBsb29rYmVoaW5kIHRvIGF2b2lkIHByb2JsZW1zIHdpdGggbmVzdGVkIHByb3BlcnRpZXNcbiAgICBzdHIgPSBzdHJpcE5lc3RlZChwcm9wLCBzdHIsIHZhbCk7XG4gIH1cblxuICByZXR1cm4gc3RyO1xufVxuXG4vKipcbiAqIE1pbWljIG5lZ2F0aXZlIGxvb2tiZWhpbmQgdG8gYXZvaWQgcHJvYmxlbXMgd2l0aCBuZXN0ZWQgcHJvcGVydGllcy5cbiAqXG4gKiBTZWU6IGh0dHA6Ly9ibG9nLnN0ZXZlbmxldml0aGFuLmNvbS9hcmNoaXZlcy9taW1pYy1sb29rYmVoaW5kLWphdmFzY3JpcHRcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc3RyaXBOZXN0ZWQgKHByb3AsIHN0ciwgdmFsKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZShuZXcgUmVnRXhwKCcoXFxcXC4pPycgKyBwcm9wLCAnZycpLCBmdW5jdGlvbigkMCwgJDEpIHtcbiAgICByZXR1cm4gJDEgPyAkMCA6IHZhbDtcbiAgfSk7XG59XG4iLCJleHBvcnQgTG9jYWxGb3JhZ2VBZGFwdGVyIGZyb20gJy4vbG9jYWxmb3JhZ2UnO1xuZXhwb3J0IEluTWVtb3J5QWRhcHRlciBmcm9tICcuL2lubWVtb3J5JztcbiIsIi8vIEBmbG93XG5pbXBvcnQgdHlwZSB7IElTdG9yYWdlIH0gZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9zdG9yYWdlJztcbmltcG9ydCB0eXBlIHsgSUNvbmZpZyB9IGZyb20gJy4uLy4uL2ludGVyZmFjZXMvY29uZmlnJztcbmltcG9ydCB0eXBlIElUYXNrIGZyb20gJy4uLy4uL2ludGVyZmFjZXMvdGFzayc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEluTWVtb3J5QWRhcHRlciBpbXBsZW1lbnRzIElTdG9yYWdlIHtcbiAgY29uZmlnOiBJQ29uZmlnO1xuICBwcmVmaXg6IHN0cmluZztcbiAgc3RvcmU6IHsgW3Byb3A6IHN0cmluZ106IGFueSB9ID0ge307XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBJQ29uZmlnKSB7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5wcmVmaXggPSB0aGlzLmNvbmZpZy5nZXQoJ3ByZWZpeCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2UgaXRlbSBmcm9tIHN0b3JlIGJ5IGtleVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtQcm9taXNlPElUYXNrPn0gKGFycmF5KVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgZ2V0KG5hbWU6IHN0cmluZyk6IFByb21pc2U8SVRhc2tbXT4ge1xuICAgIGNvbnN0IGNvbGxOYW1lID0gdGhpcy5zdG9yYWdlTmFtZShuYW1lKTtcbiAgICByZXR1cm4gWy4uLnRoaXMuZ2V0Q29sbGVjdGlvbihjb2xsTmFtZSldO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBpdGVtIHRvIHN0b3JlXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSAge1N0cmluZ30gdmFsdWVcbiAgICogQHJldHVybiB7UHJvbWlzZTxBbnk+fVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogYW55W10pOiBQcm9taXNlPGFueT4ge1xuICAgIHRoaXMuc3RvcmVbdGhpcy5zdG9yYWdlTmFtZShrZXkpXSA9IFsuLi52YWx1ZV07XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEl0ZW0gY2hlY2tlciBpbiBzdG9yZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtQcm9taXNlPEJvb2xlYW4+fVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgaGFzKGtleTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLnN0b3JlLCB0aGlzLnN0b3JhZ2VOYW1lKGtleSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBpdGVtXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge1Byb21pc2U8QW55Pn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGNsZWFyKGtleTogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCByZXN1bHQgPSAoYXdhaXQgdGhpcy5oYXMoa2V5KSkgPyBkZWxldGUgdGhpcy5zdG9yZVt0aGlzLnN0b3JhZ2VOYW1lKGtleSldIDogZmFsc2U7XG4gICAgdGhpcy5zdG9yZSA9IHsgLi4udGhpcy5zdG9yZSB9O1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogQ29tcG9zZSBjb2xsZWN0aW9uIG5hbWUgYnkgc3VmZml4XG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gc3VmZml4XG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHN0b3JhZ2VOYW1lKHN1ZmZpeDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN1ZmZpeC5zdGFydHNXaXRoKHRoaXMuZ2V0UHJlZml4KCkpID8gc3VmZml4IDogYCR7dGhpcy5nZXRQcmVmaXgoKX1fJHtzdWZmaXh9YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgcHJlZml4IG9mIGNoYW5uZWwgY29sbGVjdGlvblxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBnZXRQcmVmaXgoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnLmdldCgncHJlZml4Jyk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGNvbGxlY3Rpb25cbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuICBnZXRDb2xsZWN0aW9uKG5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IGhhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLnN0b3JlLCBuYW1lKTtcbiAgICBpZiAoIWhhcykgdGhpcy5zdG9yZVtuYW1lXSA9IFtdO1xuICAgIHJldHVybiB0aGlzLnN0b3JlW25hbWVdO1xuICB9XG59XG4iLCIvLyBAZmxvd1xuaW1wb3J0IGxvY2FsRm9yYWdlIGZyb20gJ2xvY2FsZm9yYWdlJztcbmltcG9ydCB0eXBlIHsgSVN0b3JhZ2UgfSBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL3N0b3JhZ2UnO1xuaW1wb3J0IHR5cGUgeyBJQ29uZmlnIH0gZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9jb25maWcnO1xuaW1wb3J0IHR5cGUgSVRhc2sgZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy90YXNrJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9jYWxGb3JhZ2VBZGFwdGVyIGltcGxlbWVudHMgSVN0b3JhZ2Uge1xuICBjb25maWc6IElDb25maWc7XG4gIGRyaXZlcnM6IHN0cmluZ1tdID0gWydsb2NhbHN0b3JhZ2UnLCAnaW5kZXhlZGRiJywgJ3dlYnNxbCddO1xuICBwcmVmaXg6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcihjb25maWc6IElDb25maWcpIHtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLnByZWZpeCA9IHRoaXMuY29uZmlnLmdldCgncHJlZml4Jyk7XG4gICAgbG9jYWxGb3JhZ2UuY29uZmlnKHsgZHJpdmVyOiB0aGlzLmdldERyaXZlcigpLCBuYW1lOiB0aGlzLnByZWZpeCB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlIGl0ZW0gZnJvbSBzdG9yYWdlIGJ5IGtleVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtQcm9taXNlPElUYXNrPn0gKGFycmF5KVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgZ2V0KGtleTogc3RyaW5nKTogUHJvbWlzZTxJVGFza1tdPiB7XG4gICAgY29uc3QgaXRlbXMgPSBhd2FpdCBsb2NhbEZvcmFnZS5nZXRJdGVtKHRoaXMuc3RvcmFnZU5hbWUoa2V5KSk7XG4gICAgcmV0dXJuICh0eXBlb2YgaXRlbXMgPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZShpdGVtcykgOiBpdGVtcykgfHwgW107XG4gIH1cblxuICAvKipcbiAgICogQWRkIGl0ZW0gdG8gbG9jYWwgc3RvcmFnZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHZhbHVlXG4gICAqIEByZXR1cm4ge1Byb21pc2U8QW55Pn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIHNldChrZXk6IHN0cmluZywgdmFsdWU6IGFueVtdKTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBsb2NhbEZvcmFnZS5zZXRJdGVtKHRoaXMuc3RvcmFnZU5hbWUoa2V5KSwgdmFsdWUpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogSXRlbSBjaGVja2VyIGluIHN0b3JhZ2VcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7UHJvbWlzZTxCb29sZWFuPn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGhhcyhrZXk6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGtleXM6IHN0cmluZ1tdID0gYXdhaXQgbG9jYWxGb3JhZ2Uua2V5cygpO1xuICAgIHJldHVybiBrZXlzLmluZGV4T2YodGhpcy5zdG9yYWdlTmFtZShrZXkpKSA+IC0xO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBpdGVtXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge1Byb21pc2U8QW55Pn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGNsZWFyKGtleTogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBsb2NhbEZvcmFnZS5yZW1vdmVJdGVtKHRoaXMuc3RvcmFnZU5hbWUoa2V5KSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYWxsIGl0ZW1zXG4gICAqXG4gICAqIEByZXR1cm4ge1Byb21pc2U8QW55Pn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGNsZWFyQWxsKCk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3Qga2V5czogc3RyaW5nW10gPSBhd2FpdCBsb2NhbEZvcmFnZS5rZXlzKCk7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgUHJvbWlzZS5hbGwoa2V5cy5tYXAoYXN5bmMgKGtleSkgPT4ge1xuICAgICAgY29uc3QgY2xlYXJlZCA9IGF3YWl0IHRoaXMuY2xlYXIoa2V5KTtcbiAgICAgIHJldHVybiBjbGVhcmVkO1xuICAgIH0pKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXBvc2Ugc3RvcmFnZSBuYW1lIGJ5IHN1ZmZpeFxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHN1ZmZpeFxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBzdG9yYWdlTmFtZShzdWZmaXg6IHN0cmluZykge1xuICAgIHJldHVybiBzdWZmaXguc3RhcnRzV2l0aCh0aGlzLmdldFByZWZpeCgpKSA/IHN1ZmZpeCA6IGAke3RoaXMuZ2V0UHJlZml4KCl9XyR7c3VmZml4fWA7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHByZWZpeCBvZiBjaGFubmVsIHN0b3JhZ2VcbiAgICpcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgZ2V0UHJlZml4KCkge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZy5nZXQoJ3ByZWZpeCcpO1xuICB9XG5cbiAgZ2V0RHJpdmVyKCkge1xuICAgIGNvbnN0IGRlZmF1bHREcml2ZXI6IHN0cmluZyA9IHRoaXMuY29uZmlnLmdldCgnZGVmYXVsdFN0b3JhZ2UnKTtcbiAgICBjb25zdCBkcml2ZXI6IHN0cmluZyA9ICh0aGlzLmNvbmZpZy5nZXQoJ3N0b3JhZ2UnKSB8fCBkZWZhdWx0RHJpdmVyKS50b0xvd2VyQ2FzZSgpO1xuICAgIHJldHVybiB0aGlzLmRyaXZlcnMuaW5kZXhPZihkcml2ZXIpID4gLTFcbiAgICAgID8gbG9jYWxGb3JhZ2VbZHJpdmVyLnRvVXBwZXJDYXNlKCldXG4gICAgICA6IGxvY2FsRm9yYWdlW2RlZmF1bHREcml2ZXIudG9VcHBlckNhc2UoKV07XG4gIH1cbn1cbiIsIi8vIEBmbG93XG5pbXBvcnQgdHlwZSBJVGFzayBmcm9tICcuLy4uL2ludGVyZmFjZXMvdGFzayc7XG5pbXBvcnQgdHlwZSBJQ29uZmlnIGZyb20gJy4uL2ludGVyZmFjZXMvY29uZmlnJztcbmltcG9ydCBFdmVudCBmcm9tICcuL2V2ZW50JztcbmltcG9ydCBTdG9yYWdlQ2Fwc3VsZSBmcm9tICcuL3N0b3JhZ2UtY2Fwc3VsZSc7XG5pbXBvcnQgUXVldWUgZnJvbSAnLi9xdWV1ZSc7XG5pbXBvcnQgeyB1dGlsQ2xlYXJCeVRhZyB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtcbiAgZGIsXG4gIGNhbk11bHRpcGxlLFxuICBzYXZlVGFzayxcbiAgbG9nUHJveHksXG4gIHJlZ2lzdGVyV29ya2VycyxcbiAgY3JlYXRlVGltZW91dCxcbiAgc3RhdHVzT2ZmLFxuICBzdG9wUXVldWUsXG4gIGdldFRhc2tzV2l0aG91dEZyZWV6ZWQsXG59IGZyb20gJy4vaGVscGVycyc7XG5pbXBvcnQge1xuICB0YXNrQWRkZWRMb2csXG4gIG5leHRUYXNrTG9nLFxuICBxdWV1ZVN0b3BwaW5nTG9nLFxuICBxdWV1ZVN0YXJ0TG9nLFxuICBldmVudENyZWF0ZWRMb2csXG59IGZyb20gJy4vY29uc29sZSc7XG5cbi8qIGVzbGludCBuby11bmRlcnNjb3JlLWRhbmdsZTogWzIsIHsgXCJhbGxvd1wiOiBbXCJfaWRcIl0gfV0gKi9cblxuY29uc3QgY2hhbm5lbE5hbWUgPSBTeW1ib2woJ2NoYW5uZWwtbmFtZScpO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDaGFubmVsIHtcbiAgc3RvcHBlZDogYm9vbGVhbiA9IHRydWU7XG4gIHJ1bm5pbmc6IGJvb2xlYW4gPSBmYWxzZTtcbiAgdGltZW91dDogbnVtYmVyO1xuICBzdG9yYWdlOiBTdG9yYWdlQ2Fwc3VsZTtcbiAgY29uZmlnOiBJQ29uZmlnO1xuICBldmVudCA9IG5ldyBFdmVudCgpO1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgY29uZmlnOiBJQ29uZmlnKSB7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG5cbiAgICAvLyBzYXZlIGNoYW5uZWwgbmFtZSB0byB0aGlzIGNsYXNzIHdpdGggc3ltYm9saWMga2V5XG4gICAgKHRoaXM6IE9iamVjdClbY2hhbm5lbE5hbWVdID0gbmFtZTtcblxuICAgIC8vIGlmIGN1c3RvbSBzdG9yYWdlIGRyaXZlciBleGlzdHMsIHNldHVwIGl0XG4gICAgY29uc3QgeyBkcml2ZXJzIH06IGFueSA9IFF1ZXVlO1xuICAgIGNvbnN0IHN0b3JhZ2UgPSBuZXcgU3RvcmFnZUNhcHN1bGUoY29uZmlnLCBkcml2ZXJzLnN0b3JhZ2UpO1xuICAgIHRoaXMuc3RvcmFnZSA9IHN0b3JhZ2UuY2hhbm5lbChuYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgY2hhbm5lbCBuYW1lXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ30gY2hhbm5lbCBuYW1lXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBuYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICh0aGlzOiBPYmplY3QpW2NoYW5uZWxOYW1lXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgbmV3IGpvYiB0byBjaGFubmVsXG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gdGFza1xuICAgKiBAcmV0dXJuIHtTdHJpbmd8Qm9vbGVhbn0gam9iXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBhZGQodGFzazogSVRhc2spOiBQcm9taXNlPHN0cmluZyB8IGJvb2xlYW4+IHtcbiAgICBpZiAoIShhd2FpdCBjYW5NdWx0aXBsZS5jYWxsKHRoaXMsIHRhc2spKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgY29uc3QgaWQgPSBhd2FpdCBzYXZlVGFzay5jYWxsKHRoaXMsIHRhc2spO1xuXG4gICAgaWYgKGlkICYmIHRoaXMuc3RvcHBlZCAmJiB0aGlzLnJ1bm5pbmcgPT09IHRydWUpIHtcbiAgICAgIGF3YWl0IHRoaXMuc3RhcnQoKTtcbiAgICB9XG5cbiAgICAvLyBwYXNzIGFjdGl2aXR5IHRvIHRoZSBsb2cgc2VydmljZS5cbiAgICBsb2dQcm94eS5jYWxsKHRoaXMsIHRhc2tBZGRlZExvZywgdGFzayk7XG5cbiAgICByZXR1cm4gaWQ7XG4gIH1cblxuICAvKipcbiAgICogUHJvY2VzcyBuZXh0IGpvYlxuICAgKlxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgbmV4dCgpOiBQcm9taXNlPHZvaWQgfCBib29sZWFuPiB7XG4gICAgaWYgKHRoaXMuc3RvcHBlZCkge1xuICAgICAgc3RhdHVzT2ZmLmNhbGwodGhpcyk7XG4gICAgICByZXR1cm4gc3RvcFF1ZXVlLmNhbGwodGhpcyk7XG4gICAgfVxuXG4gICAgLy8gR2VuZXJhdGUgYSBsb2cgbWVzc2FnZVxuICAgIGxvZ1Byb3h5LmNhbGwodGhpcywgbmV4dFRhc2tMb2csICduZXh0Jyk7XG5cbiAgICAvLyBzdGFydCBxdWV1ZSBhZ2FpblxuICAgIGF3YWl0IHRoaXMuc3RhcnQoKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHF1ZXVlIGxpc3RlbmVyXG4gICAqXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59IGpvYlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgc3RhcnQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgLy8gU3RvcCB0aGUgcXVldWUgZm9yIHJlc3RhcnRcbiAgICB0aGlzLnN0b3BwZWQgPSBmYWxzZTtcblxuICAgIC8vIFJlZ2lzdGVyIHRhc2tzLCBpZiBub3QgcmVnaXN0ZXJlZFxuICAgIHJlZ2lzdGVyV29ya2Vycy5jYWxsKHRoaXMpO1xuXG4gICAgbG9nUHJveHkuY2FsbCh0aGlzLCBxdWV1ZVN0YXJ0TG9nLCAnc3RhcnQnKTtcblxuICAgIC8vIENyZWF0ZSBhIHRpbWVvdXQgZm9yIHN0YXJ0IHF1ZXVlXG4gICAgdGhpcy5ydW5uaW5nID0gKGF3YWl0IGNyZWF0ZVRpbWVvdXQuY2FsbCh0aGlzKSkgPiAwO1xuXG4gICAgcmV0dXJuIHRoaXMucnVubmluZztcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wIHF1ZXVlIGxpc3RlbmVyIGFmdGVyIGVuZCBvZiBjdXJyZW50IHRhc2tcbiAgICpcbiAgICogQHJldHVybiB7Vm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHN0b3AoKTogdm9pZCB7XG4gICAgbG9nUHJveHkuY2FsbCh0aGlzLCBxdWV1ZVN0b3BwaW5nTG9nLCAnc3RvcCcpO1xuICAgIHRoaXMuc3RvcHBlZCA9IHRydWU7XG4gIH1cblxuICAvKipcbiAgICogU3RvcCBxdWV1ZSBsaXN0ZW5lciBpbmNsdWRpbmcgY3VycmVudCB0YXNrXG4gICAqXG4gICAqIEByZXR1cm4ge1ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBmb3JjZVN0b3AoKTogdm9pZCB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBzdG9wUXVldWUuY2FsbCh0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayB3aGV0aGVyIHRoZXJlIGlzIGFueSB0YXNrXG4gICAqXG4gICAqIEByZXR1cm4ge0Jvb2VsYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBpc0VtcHR5KCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5jb3VudCgpKSA8IDE7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRhc2sgY291bnRcbiAgICpcbiAgICogQHJldHVybiB7TnVtYmVyfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgY291bnQoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICByZXR1cm4gKGF3YWl0IGdldFRhc2tzV2l0aG91dEZyZWV6ZWQuY2FsbCh0aGlzKSkubGVuZ3RoO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0YXNrIGNvdW50IGJ5IHRhZ1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHRhZ1xuICAgKiBAcmV0dXJuIHtBcnJheTxJVGFzaz59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBjb3VudEJ5VGFnKHRhZzogc3RyaW5nKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICByZXR1cm4gKGF3YWl0IGdldFRhc2tzV2l0aG91dEZyZWV6ZWQuY2FsbCh0aGlzKSkuZmlsdGVyKHQgPT4gdC50YWcgPT09IHRhZykubGVuZ3RoO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbGwgdGFza3MgZnJvbSBjaGFubmVsXG4gICAqXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBjbGVhcigpOiBib29sZWFuIHtcbiAgICBpZiAoIXRoaXMubmFtZSgpKSByZXR1cm4gZmFsc2U7XG4gICAgdGhpcy5zdG9yYWdlLmNsZWFyKHRoaXMubmFtZSgpKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYWxsIHRhc2tzIGZyb20gY2hhbm5lbCBieSB0YWdcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSB0YWdcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGNsZWFyQnlUYWcodGFnOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgZGIuY2FsbChzZWxmKS5hbGwoKTtcbiAgICBjb25zdCByZW1vdmVzID0gZGF0YS5maWx0ZXIodXRpbENsZWFyQnlUYWcuYmluZCh0YWcpKS5tYXAoYXN5bmMgKHQpID0+IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRiLmNhbGwoc2VsZikuZGVsZXRlKHQuX2lkKTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSk7XG4gICAgYXdhaXQgUHJvbWlzZS5hbGwocmVtb3Zlcyk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgYSB0YXNrIHdoZXRoZXIgZXhpc3RzIGJ5IGpvYiBpZFxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHRhZ1xuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgaGFzKGlkOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gKGF3YWl0IGdldFRhc2tzV2l0aG91dEZyZWV6ZWQuY2FsbCh0aGlzKSkuZmluZEluZGV4KHQgPT4gdC5faWQgPT09IGlkKSA+IC0xO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGEgdGFzayB3aGV0aGVyIGV4aXN0cyBieSB0YWdcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSB0YWdcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGhhc0J5VGFnKHRhZzogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCBnZXRUYXNrc1dpdGhvdXRGcmVlemVkLmNhbGwodGhpcykpLmZpbmRJbmRleCh0ID0+IHQudGFnID09PSB0YWcpID4gLTE7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGFjdGlvbiBldmVudHNcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHBhcmFtICB7RnVuY3Rpb259IGNiXG4gICAqIEByZXR1cm4ge1ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBvbihrZXk6IHN0cmluZywgY2I6IEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgdGhpcy5ldmVudC5vbiguLi5ba2V5LCBjYl0pO1xuICAgIGxvZ1Byb3h5LmNhbGwodGhpcywgZXZlbnRDcmVhdGVkTG9nLCBrZXkpO1xuICB9XG59XG4iLCIvKiBAZmxvdyAqL1xuaW1wb3J0IHR5cGUgSUNvbmZpZyBmcm9tICcuLi9pbnRlcmZhY2VzL2NvbmZpZyc7XG5pbXBvcnQgY29uZmlnRGF0YSBmcm9tICcuL2VudW0vY29uZmlnLmRhdGEnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25maWcge1xuICBjb25maWc6IElDb25maWcgPSBjb25maWdEYXRhO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogSUNvbmZpZyA9IHt9KSB7XG4gICAgdGhpcy5tZXJnZShjb25maWcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBjb25maWcgdG8gZ2xvYmFsIGNvbmZpZyByZWZlcmVuY2VcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSAge0FueX0gdmFsdWVcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHNldChuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLmNvbmZpZ1tuYW1lXSA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIGNvbmZpZ1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVcbiAgICogQHJldHVybiB7YW55fVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgZ2V0KG5hbWU6IHN0cmluZyk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnW25hbWVdO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGNvbmZpZyBwcm9wZXJ0eVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVcbiAgICogQHJldHVybiB7YW55fVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgaGFzKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5jb25maWcsIG5hbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1lcmdlIHR3byBjb25maWcgb2JqZWN0XG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgbWVyZ2UoY29uZmlnOiB7IFtzdHJpbmddOiBhbnkgfSk6IHZvaWQge1xuICAgIHRoaXMuY29uZmlnID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5jb25maWcsIGNvbmZpZyk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGEgY29uZmlnXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgcmVtb3ZlKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBkZWxldGUgdGhpcy5jb25maWdbbmFtZV07XG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBjb25maWdcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm4ge0lDb25maWdbXX1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFsbCgpOiBJQ29uZmlnIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc7XG4gIH1cbn1cbiIsIi8vIEBmbG93XG5pbXBvcnQgb2JqIGZyb20gJ29iamVjdC1wYXRoJztcbmltcG9ydCBsb2dFdmVudHMgZnJvbSAnLi9lbnVtL2xvZy5ldmVudHMnO1xuXG4vKiBlc2xpbnQgbm8tY29uc29sZTogW1wiZXJyb3JcIiwgeyBhbGxvdzogW1wibG9nXCIsIFwiZ3JvdXBDb2xsYXBzZWRcIiwgXCJncm91cEVuZFwiXSB9XSAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbG9nKC4uLmFyZ3M6IGFueSkge1xuICBjb25zb2xlLmxvZyguLi5hcmdzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRhc2tBZGRlZExvZyhbdGFza106IGFueVtdKSB7XG4gIGxvZyhcbiAgICBgJWMoJHt0YXNrLmhhbmRsZXJ9KSAtPiAke29iai5nZXQobG9nRXZlbnRzLCAncXVldWUuY3JlYXRlZCcpfWAsXG4gICAgJ2NvbG9yOiBncmVlbjtmb250LXdlaWdodDogYm9sZDsnLFxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcXVldWVTdGFydExvZyhbdHlwZV06IGFueVtdKSB7XG4gIGxvZyhcbiAgICBgJWMoJHt0eXBlfSkgLT4gJHtvYmouZ2V0KGxvZ0V2ZW50cywgJ3F1ZXVlLnN0YXJ0aW5nJyl9YCxcbiAgICAnY29sb3I6ICMzZmE1ZjM7Zm9udC13ZWlnaHQ6IGJvbGQ7JyxcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5leHRUYXNrTG9nKFt0eXBlXTogYW55W10pIHtcbiAgbG9nKGAlYygke3R5cGV9KSAtPiAke29iai5nZXQobG9nRXZlbnRzLCAncXVldWUubmV4dCcpfWAsICdjb2xvcjogIzNmYTVmMztmb250LXdlaWdodDogYm9sZDsnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHF1ZXVlU3RvcHBpbmdMb2coW3R5cGVdOiBhbnlbXSkge1xuICBsb2coXG4gICAgYCVjKCR7dHlwZX0pIC0+ICR7b2JqLmdldChsb2dFdmVudHMsICdxdWV1ZS5zdG9wcGluZycpfWAsXG4gICAgJ2NvbG9yOiAjZmY3Zjk0O2ZvbnQtd2VpZ2h0OiBib2xkOycsXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBxdWV1ZVN0b3BwZWRMb2coW3R5cGVdOiBhbnlbXSkge1xuICBsb2coYCVjKCR7dHlwZX0pIC0+ICR7b2JqLmdldChsb2dFdmVudHMsICdxdWV1ZS5zdG9wcGVkJyl9YCwgJ2NvbG9yOiAjZmY3Zjk0O2ZvbnQtd2VpZ2h0OiBib2xkOycpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcXVldWVFbXB0eUxvZyhbdHlwZV06IGFueVtdKSB7XG4gIGxvZyhgJWMke3R5cGV9ICR7b2JqLmdldChsb2dFdmVudHMsICdxdWV1ZS5lbXB0eScpfWAsICdjb2xvcjogI2ZmN2Y5NDtmb250LXdlaWdodDogYm9sZDsnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV2ZW50Q3JlYXRlZExvZyhba2V5XTogYW55W10pIHtcbiAgbG9nKGAlYygke2tleX0pIC0+ICR7b2JqLmdldChsb2dFdmVudHMsICdldmVudC5jcmVhdGVkJyl9YCwgJ2NvbG9yOiAjNjZjZWUzO2ZvbnQtd2VpZ2h0OiBib2xkOycpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXZlbnRGaXJlZExvZyhba2V5LCBuYW1lXTogYW55W10pIHtcbiAgbG9nKGAlYygke2tleX0pIC0+ICR7b2JqLmdldChsb2dFdmVudHMsIGBldmVudC4ke25hbWV9YCl9YCwgJ2NvbG9yOiAjYTBkYzNjO2ZvbnQtd2VpZ2h0OiBib2xkOycpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm90Rm91bmRMb2coW25hbWVdOiBhbnlbXSkge1xuICBsb2coXG4gICAgYCVjKCR7bmFtZX0pIC0+ICR7b2JqLmdldChsb2dFdmVudHMsICdxdWV1ZS5ub3QtZm91bmQnKX1gLFxuICAgICdjb2xvcjogI2EwZGMzYztmb250LXdlaWdodDogYm9sZDsnLFxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd29ya2VyUnVubmluTG9nKFt3b3JrZXIsIHdvcmtlckluc3RhbmNlLCB0YXNrLCBkZXBzXTogYW55W10pIHtcbiAgY29uc29sZS5ncm91cENvbGxhcHNlZChgJHt3b3JrZXIubmFtZX0gLSAke3Rhc2subGFiZWx9YCk7XG4gIGxvZyhgJWNsYWJlbDogJHt0YXNrLmxhYmVsIHx8ICcnfWAsICdjb2xvcjogYmx1ZTsnKTtcbiAgbG9nKGAlY2hhbmRsZXI6ICR7dGFzay5oYW5kbGVyfWAsICdjb2xvcjogYmx1ZTsnKTtcbiAgbG9nKGAlY3ByaW9yaXR5OiAke3Rhc2sucHJpb3JpdHl9YCwgJ2NvbG9yOiBibHVlOycpO1xuICBsb2coYCVjdW5pcXVlOiAke3Rhc2sudW5pcXVlIHx8ICdmYWxzZSd9YCwgJ2NvbG9yOiBibHVlOycpO1xuICBsb2coYCVjcmV0cnk6ICR7d29ya2VySW5zdGFuY2UucmV0cnkgfHwgJzEnfWAsICdjb2xvcjogYmx1ZTsnKTtcbiAgbG9nKGAlY3RyaWVkOiAke3Rhc2sudHJpZWQgPyB0YXNrLnRyaWVkICsgMSA6ICcxJ31gLCAnY29sb3I6IGJsdWU7Jyk7XG4gIGxvZyhgJWN0YWc6ICR7dGFzay50YWcgfHwgJyd9YCwgJ2NvbG9yOiBibHVlOycpO1xuICBsb2coJyVjYXJnczonLCAnY29sb3I6IGJsdWU7Jyk7XG4gIGxvZyh0YXNrLmFyZ3MgfHwgJycpO1xuICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkKCdkZXBlbmRlbmNpZXMnKTtcbiAgbG9nKC4uLihkZXBzW3dvcmtlci5uYW1lXSB8fCBbXSkpO1xuICBjb25zb2xlLmdyb3VwRW5kKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3b3JrZXJEb25lTG9nKFtyZXN1bHQsIHRhc2ssIHdvcmtlckluc3RhbmNlXTogYW55W10pIHtcbiAgaWYgKHJlc3VsdCA9PT0gdHJ1ZSkge1xuICAgIGxvZygnJWNUYXNrIGNvbXBsZXRlZCEnLCAnY29sb3I6IGdyZWVuOycpO1xuICB9IGVsc2UgaWYgKCFyZXN1bHQgJiYgdGFzay50cmllZCA8IHdvcmtlckluc3RhbmNlLnJldHJ5KSB7XG4gICAgbG9nKCclY1Rhc2sgd2lsbCBiZSByZXRyaWVkIScsICdjb2xvcjogI2Q4NDEwYzsnKTtcbiAgfSBlbHNlIHtcbiAgICBsb2coJyVjVGFzayBmYWlsZWQgYW5kIGZyZWV6ZWQhJywgJ2NvbG9yOiAjZWY2MzYzOycpO1xuICB9XG4gIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdvcmtlckZhaWxlZExvZygpIHtcbiAgbG9nKCclY1Rhc2sgZmFpbGVkIScsICdjb2xvcjogcmVkOycpO1xuICBjb25zb2xlLmdyb3VwRW5kKCk7XG59XG4iLCIvKiBAZmxvdyAqL1xuaW1wb3J0IHR5cGUgSUNvbnRhaW5lciBmcm9tICcuLi9pbnRlcmZhY2VzL2NvbnRhaW5lcic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbnRhaW5lciBpbXBsZW1lbnRzIElDb250YWluZXIge1xuICBzdG9yZTogeyBbcHJvcGVydHk6IHN0cmluZ106IGFueSB9ID0ge307XG5cbiAgLyoqXG4gICAqIENoZWNrIGl0ZW0gaW4gY29udGFpbmVyXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gaWRcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGhhcyhpZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLnN0b3JlLCBpZCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGl0ZW0gZnJvbSBjb250YWluZXJcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBpZFxuICAgKiBAcmV0dXJuIHtBbnl9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBnZXQoaWQ6IHN0cmluZyk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmVbaWRdO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgaXRlbXMgZnJvbSBjb250YWluZXJcbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYWxsKCkge1xuICAgIHJldHVybiB0aGlzLnN0b3JlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBpdGVtIHRvIGNvbnRhaW5lclxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGlkXG4gICAqIEBwYXJhbSAge0FueX0gdmFsdWVcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGJpbmQoaWQ6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmVbaWRdID0gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogTWVyZ2UgY29udGluZXJzXG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gZGF0YVxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgbWVyZ2UoZGF0YTogeyBbcHJvcGVydHk6IHN0cmluZ106IGFueSB9ID0ge30pOiB2b2lkIHtcbiAgICB0aGlzLnN0b3JlID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5zdG9yZSwgZGF0YSk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGl0ZW0gZnJvbSBjb250YWluZXJcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBpZFxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgcmVtb3ZlKGlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBpZiAoIXRoaXMuaGFzKGlkKSkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiBkZWxldGUgdGhpcy5zdG9yZVtpZF07XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFsbCBpdGVtcyBmcm9tIGNvbnRhaW5lclxuICAgKlxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgcmVtb3ZlQWxsKCk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmUgPSB7fTtcbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQge1xuICBkZWZhdWx0U3RvcmFnZTogJ2xvY2Fsc3RvcmFnZScsXG4gIHByZWZpeDogJ3NxX2pvYnMnLFxuICB0aW1lb3V0OiAxMDAwLFxuICBsaW1pdDogLTEsXG4gIHByaW5jaXBsZTogJ2ZpZm8nLFxuICBkZWJ1ZzogdHJ1ZSxcbn07XG4iLCJleHBvcnQgZGVmYXVsdCB7XG4gIHF1ZXVlOiB7XG4gICAgY3JlYXRlZDogJ05ldyB0YXNrIGNyZWF0ZWQuJyxcbiAgICBuZXh0OiAnTmV4dCB0YXNrIHByb2Nlc3NpbmcuJyxcbiAgICBzdGFydGluZzogJ1F1ZXVlIGxpc3RlbmVyIHN0YXJ0aW5nLicsXG4gICAgc3RvcHBpbmc6ICdRdWV1ZSBsaXN0ZW5lciBzdG9wcGluZy4nLFxuICAgIHN0b3BwZWQ6ICdRdWV1ZSBsaXN0ZW5lciBzdG9wcGVkLicsXG4gICAgZW1wdHk6ICdjaGFubmVsIGlzIGVtcHR5Li4uJyxcbiAgICAnbm90LWZvdW5kJzogJ3dvcmtlciBub3QgZm91bmQnLFxuICAgIG9mZmxpbmU6ICdEaXNjb25uZWN0ZWQnLFxuICAgIG9ubGluZTogJ0Nvbm5lY3RlZCcsXG4gIH0sXG4gIGV2ZW50OiB7XG4gICAgY3JlYXRlZDogJ05ldyBldmVudCBjcmVhdGVkJyxcbiAgICBmaXJlZDogJ0V2ZW50IGZpcmVkLicsXG4gICAgJ3dpbGRjYXJkLWZpcmVkJzogJ1dpbGRjYXJkIGV2ZW50IGZpcmVkLicsXG4gIH0sXG59O1xuIiwiLyogZXNsaW50IGNsYXNzLW1ldGhvZHMtdXNlLXRoaXM6IFtcImVycm9yXCIsIHsgXCJleGNlcHRNZXRob2RzXCI6IFtcImdldE5hbWVcIiwgXCJnZXRUeXBlXCJdIH1dICovXG4vKiBlc2xpbnQtZW52IGVzNiAqL1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFdmVudCB7XG4gIHN0b3JlOiB7IFtwcm9wOiBzdHJpbmddOiBhbnkgfSA9IHt9O1xuICB2ZXJpZmllclBhdHRlcm46IHN0cmluZyA9IC9eW2EtejAtOS1fXSs6YmVmb3JlJHxhZnRlciR8cmV0cnkkfFxcKiQvO1xuICB3aWxkY2FyZHM6IHN0cmluZ1tdID0gWycqJywgJ2Vycm9yJ107XG4gIGVtcHR5RnVuYzogRnVuY3Rpb24gPSAoKSA9PiB7fTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnN0b3JlLmJlZm9yZSA9IHt9O1xuICAgIHRoaXMuc3RvcmUuYWZ0ZXIgPSB7fTtcbiAgICB0aGlzLnN0b3JlLnJldHJ5ID0ge307XG4gICAgdGhpcy5zdG9yZS53aWxkY2FyZCA9IHt9O1xuICAgIHRoaXMuc3RvcmUuZXJyb3IgPSB0aGlzLmVtcHR5RnVuYztcbiAgICB0aGlzLnN0b3JlWycqJ10gPSB0aGlzLmVtcHR5RnVuYztcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgZXZlbnRcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHBhcmFtICB7RnVuY3Rpb259IGNiXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBvbihrZXk6IHN0cmluZywgY2I6IEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgaWYgKHR5cGVvZiBjYiAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgbmV3IEVycm9yKCdFdmVudCBzaG91bGQgYmUgYW4gZnVuY3Rpb24nKTtcbiAgICBpZiAodGhpcy5pc1ZhbGlkKGtleSkpIHRoaXMuYWRkKGtleSwgY2IpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biBldmVudCB2aWEgaXQncyBrZXlcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHBhcmFtICB7QW55fSBhcmdzXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBlbWl0KGtleTogc3RyaW5nLCBhcmdzOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAodGhpcy53aWxkY2FyZHMuaW5kZXhPZihrZXkpID4gLTEpIHtcbiAgICAgIHRoaXMud2lsZGNhcmQoa2V5LCAuLi5ba2V5LCBhcmdzXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHR5cGU6IHN0cmluZyA9IHRoaXMuZ2V0VHlwZShrZXkpO1xuICAgICAgY29uc3QgbmFtZTogc3RyaW5nID0gdGhpcy5nZXROYW1lKGtleSk7XG5cbiAgICAgIGlmICh0aGlzLnN0b3JlW3R5cGVdKSB7XG4gICAgICAgIGNvbnN0IGNiOiBGdW5jdGlvbiA9IHRoaXMuc3RvcmVbdHlwZV1bbmFtZV0gfHwgdGhpcy5lbXB0eUZ1bmM7XG4gICAgICAgIGNiLmNhbGwobnVsbCwgYXJncyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy53aWxkY2FyZCgnKicsIGtleSwgYXJncyk7XG4gIH1cblxuICAvKipcbiAgICogUnVuIHdpbGRjYXJkIGV2ZW50c1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGFjdGlvbktleVxuICAgKiBAcGFyYW0gIHtBbnl9IGFyZ3NcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHdpbGRjYXJkKGtleTogc3RyaW5nLCBhY3Rpb25LZXk6IHN0cmluZywgYXJnczogYW55KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc3RvcmUud2lsZGNhcmRba2V5XSkge1xuICAgICAgdGhpcy5zdG9yZS53aWxkY2FyZFtrZXldLmNhbGwobnVsbCwgYWN0aW9uS2V5LCBhcmdzKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkIGV2ZW50IHRvIHN0b3JlXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjYlxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYWRkKGtleTogc3RyaW5nLCBjYjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICBpZiAodGhpcy53aWxkY2FyZHMuaW5kZXhPZihrZXkpID4gLTEpIHtcbiAgICAgIHRoaXMuc3RvcmUud2lsZGNhcmRba2V5XSA9IGNiO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB0eXBlOiBzdHJpbmcgPSB0aGlzLmdldFR5cGUoa2V5KTtcbiAgICAgIGNvbnN0IG5hbWU6IHN0cmluZyA9IHRoaXMuZ2V0TmFtZShrZXkpO1xuICAgICAgdGhpcy5zdG9yZVt0eXBlXVtuYW1lXSA9IGNiO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBldmVudCBpbiBzdG9yZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgaGFzKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGtleXM6IHN0cmluZ1tdID0ga2V5LnNwbGl0KCc6Jyk7XG4gICAgICByZXR1cm4ga2V5cy5sZW5ndGggPiAxID8gISF0aGlzLnN0b3JlW2tleXNbMV1dW2tleXNbMF1dIDogISF0aGlzLnN0b3JlLndpbGRjYXJkW2tleXNbMF1dO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IGV2ZW50IG5hbWUgYnkgcGFyc2Uga2V5XG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGdldE5hbWUoa2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBrZXkubWF0Y2goLyguKik6LiovKVsxXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZXZlbnQgdHlwZSBieSBwYXJzZSBrZXlcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgZ2V0VHlwZShrZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGtleS5tYXRjaCgvXlthLXowLTktX10rOiguKikvKVsxXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja2VyIG9mIGV2ZW50IGtleXNcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGlzVmFsaWQoa2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy52ZXJpZmllclBhdHRlcm4udGVzdChrZXkpIHx8IHRoaXMud2lsZGNhcmRzLmluZGV4T2Yoa2V5KSA+IC0xO1xuICB9XG59XG4iLCIvKiBAZmxvdyAqL1xuaW1wb3J0IHR5cGUgSVRhc2sgZnJvbSAnLi4vaW50ZXJmYWNlcy90YXNrJztcbmltcG9ydCB0eXBlIElXb3JrZXIgZnJvbSAnLi4vaW50ZXJmYWNlcy93b3JrZXInO1xuaW1wb3J0IFF1ZXVlIGZyb20gJy4vcXVldWUnO1xuaW1wb3J0IENoYW5uZWwgZnJvbSAnLi9jaGFubmVsJztcbmltcG9ydCBTdG9yYWdlQ2Fwc3VsZSBmcm9tICcuL3N0b3JhZ2UtY2Fwc3VsZSc7XG5pbXBvcnQgeyBleGNsdWRlU3BlY2lmaWNUYXNrcywgaGFzTWV0aG9kLCBpc0Z1bmN0aW9uIH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge1xuICBldmVudEZpcmVkTG9nLFxuICBxdWV1ZVN0b3BwZWRMb2csXG4gIHdvcmtlclJ1bm5pbkxvZyxcbiAgcXVldWVFbXB0eUxvZyxcbiAgbm90Rm91bmRMb2csXG4gIHdvcmtlckRvbmVMb2csXG4gIHdvcmtlckZhaWxlZExvZyxcbn0gZnJvbSAnLi9jb25zb2xlJztcblxuLyogZXNsaW50IG5vLXVuZGVyc2NvcmUtZGFuZ2xlOiBbMiwgeyBcImFsbG93XCI6IFtcIl9pZFwiXSB9XSAqL1xuLyogZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOiBcImVycm9yXCIgKi9cbi8qIGVzbGludCB1c2UtaXNuYW46IFwiZXJyb3JcIiAqL1xuXG4vKipcbiAqIFRhc2sgcHJpb3JpdHkgY29udHJvbGxlciBoZWxwZXJcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcmV0dXJuIHtJVGFza31cbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrUHJpb3JpdHkodGFzazogSVRhc2spOiBJVGFzayB7XG4gIHRhc2sucHJpb3JpdHkgPSB0YXNrLnByaW9yaXR5IHx8IDA7XG5cbiAgaWYgKHR5cGVvZiB0YXNrLnByaW9yaXR5ICE9PSAnbnVtYmVyJykgdGFzay5wcmlvcml0eSA9IDA7XG5cbiAgcmV0dXJuIHRhc2s7XG59XG5cbi8qKlxuICogU2hvcnRlbnMgZnVuY3Rpb24gdGhlIGRiIGJlbG9uZ3N0byBjdXJyZW50IGNoYW5uZWxcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcmV0dXJuIHtTdG9yYWdlQ2Fwc3VsZX1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRiKCk6IFN0b3JhZ2VDYXBzdWxlIHtcbiAgcmV0dXJuICh0aGlzOiBhbnkpLnN0b3JhZ2UuY2hhbm5lbCgodGhpczogYW55KS5uYW1lKCkpO1xufVxuXG4vKipcbiAqIEdldCB1bmZyZWV6ZWQgdGFza3MgYnkgdGhlIGZpbHRlciBmdW5jdGlvblxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEByZXR1cm4ge0lUYXNrfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VGFza3NXaXRob3V0RnJlZXplZCgpOiBQcm9taXNlPElUYXNrW10+IHtcbiAgcmV0dXJuIChhd2FpdCBkYi5jYWxsKHRoaXMpLmFsbCgpKS5maWx0ZXIoZXhjbHVkZVNwZWNpZmljVGFza3MuYmluZChbJ2ZyZWV6ZWQnXSkpO1xufVxuXG4vKipcbiAqIExvZyBwcm94eSBoZWxwZXJcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcmV0dXJuIHt2b2lkfVxuICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICogQHBhcmFtIHtzdHJpbmd9IGRhdGFcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gY29uZFxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9nUHJveHkod3JhcHBlckZ1bmM6IEZ1bmN0aW9uLCAuLi5hcmdzOiBhbnkpOiB2b2lkIHtcbiAgaWYgKCh0aGlzOiBhbnkpLmNvbmZpZy5nZXQoJ2RlYnVnJykgJiYgdHlwZW9mIHdyYXBwZXJGdW5jID09PSAnZnVuY3Rpb24nKSB7XG4gICAgd3JhcHBlckZ1bmMoYXJncyk7XG4gIH1cbn1cblxuLyoqXG4gKiBOZXcgdGFzayBzYXZlIGhlbHBlclxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqIEByZXR1cm4ge3N0cmluZ3xib29sZWFufVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVRhc2sodGFzazogSVRhc2spOiBQcm9taXNlPHN0cmluZyB8IGJvb2xlYW4+IHtcbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZGIuY2FsbCh0aGlzKS5zYXZlKGNoZWNrUHJpb3JpdHkodGFzaykpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFRhc2sgcmVtb3ZlIGhlbHBlclxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbW92ZVRhc2soaWQ6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICBjb25zdCByZXN1bHQgPSBhd2FpdCBkYi5jYWxsKHRoaXMpLmRlbGV0ZShpZCk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRXZlbnRzIGRpc3BhdGNoZXIgaGVscGVyXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAqIEByZXR1cm4ge3ZvaWR9XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXNwYXRjaEV2ZW50cyh0YXNrOiBJVGFzaywgdHlwZTogc3RyaW5nKTogYm9vbGVhbiB8IHZvaWQge1xuICBpZiAoISgndGFnJyBpbiB0YXNrKSkgcmV0dXJuIGZhbHNlO1xuXG4gIGNvbnN0IGV2ZW50cyA9IFtbYCR7dGFzay50YWd9OiR7dHlwZX1gLCAnZmlyZWQnXSwgW2Ake3Rhc2sudGFnfToqYCwgJ3dpbGRjYXJkLWZpcmVkJ11dO1xuXG4gIGV2ZW50cy5mb3JFYWNoKChlKSA9PiB7XG4gICAgdGhpcy5ldmVudC5lbWl0KGVbMF0sIHRhc2spO1xuICAgIGxvZ1Byb3h5LmNhbGwoKHRoaXM6IGFueSksIGV2ZW50RmlyZWRMb2csIC4uLmUpO1xuICB9KTtcblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBRdWV1ZSBzdG9wcGVyIGhlbHBlclxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEByZXR1cm4ge3ZvaWR9XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdG9wUXVldWUoKTogdm9pZCB7XG4gIHRoaXMuc3RvcCgpO1xuXG4gIGNsZWFyVGltZW91dCh0aGlzLmN1cnJlbnRUaW1lb3V0KTtcblxuICBsb2dQcm94eS5jYWxsKHRoaXMsIHF1ZXVlU3RvcHBlZExvZywgJ3N0b3AnKTtcbn1cblxuLyoqXG4gKiBGYWlsZWQgam9iIGhhbmRsZXJcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcmV0dXJuIHtJVGFza30gam9iXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZhaWxlZEpvYkhhbmRsZXIodGFzazogSVRhc2spOiBQcm9taXNlPEZ1bmN0aW9uPiB7XG4gIHJldHVybiBhc3luYyBmdW5jdGlvbiBjaGlsZEZhaWxlZEhhbmRsZXIoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmVtb3ZlVGFzay5jYWxsKHRoaXMsIHRhc2suX2lkKTtcblxuICAgIHRoaXMuZXZlbnQuZW1pdCgnZXJyb3InLCB0YXNrKTtcblxuICAgIGxvZ1Byb3h5LmNhbGwodGhpcywgd29ya2VyRmFpbGVkTG9nKTtcblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgYXdhaXQgdGhpcy5uZXh0KCk7XG4gIH07XG59XG5cbi8qKlxuICogSGVscGVyIG9mIHRoZSBsb2NrIHRhc2sgb2YgdGhlIGN1cnJlbnQgam9iXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvY2tUYXNrKHRhc2s6IElUYXNrKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRiLmNhbGwodGhpcykudXBkYXRlKHRhc2suX2lkLCB7IGxvY2tlZDogdHJ1ZSB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBDbGFzcyBldmVudCBsdWFuY2hlciBoZWxwZXJcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtJV29ya2VyfSB3b3JrZXJcbiAqIEBwYXJhbSB7YW55fSBhcmdzXG4gKiBAcmV0dXJuIHtib29sZWFufHZvaWR9XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaXJlSm9iSW5saW5lRXZlbnQobmFtZTogc3RyaW5nLCB3b3JrZXI6IElXb3JrZXIsIGFyZ3M6IGFueSk6IGJvb2xlYW4ge1xuICBpZiAoaGFzTWV0aG9kKHdvcmtlciwgbmFtZSkgJiYgaXNGdW5jdGlvbih3b3JrZXJbbmFtZV0pKSB7XG4gICAgd29ya2VyW25hbWVdLmNhbGwod29ya2VyLCBhcmdzKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogUHJvY2VzcyBoYW5kbGVyIG9mIHN1Y2NlZWRlZCBqb2JcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcmV0dXJuIHt2b2lkfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3VjY2Vzc1Byb2Nlc3ModGFzazogSVRhc2spOiB2b2lkIHtcbiAgcmVtb3ZlVGFzay5jYWxsKHRoaXMsIHRhc2suX2lkKTtcbn1cblxuLyoqXG4gKiBVcGRhdGUgdGFzaydzIHJldHJ5IHZhbHVlXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHBhcmFtIHtJV29ya2VyfSB3b3JrZXJcbiAqIEByZXR1cm4ge0lUYXNrfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlUmV0cnkodGFzazogSVRhc2ssIHdvcmtlcjogSVdvcmtlcik6IElUYXNrIHtcbiAgaWYgKCEoJ3JldHJ5JyBpbiB3b3JrZXIpKSB3b3JrZXIucmV0cnkgPSAxO1xuXG4gIGlmICghKCd0cmllZCcgaW4gdGFzaykpIHtcbiAgICB0YXNrLnRyaWVkID0gMDtcbiAgICB0YXNrLnJldHJ5ID0gd29ya2VyLnJldHJ5O1xuICB9XG5cbiAgdGFzay50cmllZCArPSAxO1xuXG4gIGlmICh0YXNrLnRyaWVkID49IHdvcmtlci5yZXRyeSkge1xuICAgIHRhc2suZnJlZXplZCA9IHRydWU7XG4gIH1cblxuICByZXR1cm4gdGFzaztcbn1cblxuLyoqXG4gKiBQcm9jZXNzIGhhbmRsZXIgb2YgcmV0cmllZCBqb2JcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcGFyYW0ge0lXb3JrZXJ9IHdvcmtlclxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJldHJ5UHJvY2Vzcyh0YXNrOiBJVGFzaywgd29ya2VyOiBJV29ya2VyKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIC8vIGRpc3BhY3RoIGN1c3RvbSByZXRyeSBldmVudFxuICBkaXNwYXRjaEV2ZW50cy5jYWxsKHRoaXMsIHRhc2ssICdyZXRyeScpO1xuXG4gIC8vIHVwZGF0ZSByZXRyeSB2YWx1ZVxuICBjb25zdCB1cGRhdGVUYXNrOiBJVGFzayA9IHVwZGF0ZVJldHJ5LmNhbGwodGhpcywgdGFzaywgd29ya2VyKTtcblxuICAvLyBkZWxldGUgbG9jayBwcm9wZXJ0eSBmb3IgbmV4dCBwcm9jZXNzXG4gIHVwZGF0ZVRhc2subG9ja2VkID0gZmFsc2U7XG5cbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZGIuY2FsbCh0aGlzKS51cGRhdGUodGFzay5faWQsIHVwZGF0ZVRhc2spO1xuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogU3VjY2VlZCBqb2IgaGFuZGxlclxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqIEBwYXJhbSB7SVdvcmtlcn0gd29ya2VyXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN1Y2Nlc3NKb2JIYW5kbGVyKHRhc2s6IElUYXNrLCB3b3JrZXI6IElXb3JrZXIpOiBQcm9taXNlPEZ1bmN0aW9uPiB7XG4gIGNvbnN0IHNlbGY6IENoYW5uZWwgPSB0aGlzO1xuICByZXR1cm4gYXN5bmMgZnVuY3Rpb24gY2hpbGRTdWNjZXNzSm9iSGFuZGxlcihyZXN1bHQ6IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBkaXNwYXRjaCBqb2IgcHJvY2VzcyBhZnRlciBydW5zIGEgdGFzayBidXQgb25seSBub24gZXJyb3Igam9ic1xuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIC8vIGdvIGFoZWFkIHRvIHN1Y2Nlc3MgcHJvY2Vzc1xuICAgICAgc3VjY2Vzc1Byb2Nlc3MuY2FsbChzZWxmLCB0YXNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZ28gYWhlYWQgdG8gcmV0cnkgcHJvY2Vzc1xuICAgICAgYXdhaXQgcmV0cnlQcm9jZXNzLmNhbGwoc2VsZiwgdGFzaywgd29ya2VyKTtcbiAgICB9XG5cbiAgICAvLyBmaXJlIGpvYiBhZnRlciBldmVudFxuICAgIGZpcmVKb2JJbmxpbmVFdmVudC5jYWxsKHNlbGYsICdhZnRlcicsIHdvcmtlciwgdGFzay5hcmdzKTtcblxuICAgIC8vIGRpc3BhY3RoIGN1c3RvbSBhZnRlciBldmVudFxuICAgIGRpc3BhdGNoRXZlbnRzLmNhbGwoc2VsZiwgdGFzaywgJ2FmdGVyJyk7XG5cbiAgICAvLyBzaG93IGNvbnNvbGVcbiAgICBsb2dQcm94eS5jYWxsKHNlbGYsIHdvcmtlckRvbmVMb2csIHJlc3VsdCwgdGFzaywgd29ya2VyKTtcblxuICAgIC8vIHRyeSBuZXh0IHF1ZXVlIGpvYlxuICAgIGF3YWl0IHNlbGYubmV4dCgpO1xuICB9O1xufVxuXG4vKipcbiAqIEpvYiBoYW5kbGVyIGhlbHBlclxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqIEBwYXJhbSB7SUpvYn0gd29ya2VyXG4gKiBAcGFyYW0ge0lXb3JrZXJ9IHdvcmtlckluc3RhbmNlXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnQgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi8gZnVuY3Rpb24gbG9vcEhhbmRsZXIoXG4gIHRhc2s6IElUYXNrLFxuICB3b3JrZXI6IEZ1bmN0aW9uLFxuICB3b3JrZXJJbnN0YW5jZTogSVdvcmtlcixcbik6IEZ1bmN0aW9uIHtcbiAgcmV0dXJuIGFzeW5jIGZ1bmN0aW9uIGNoaWxkTG9vcEhhbmRsZXIoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgc2VsZjogQ2hhbm5lbCA9IHRoaXM7XG5cbiAgICAvLyBsb2NrIHRoZSBjdXJyZW50IHRhc2sgZm9yIHByZXZlbnQgcmFjZSBjb25kaXRpb25cbiAgICBhd2FpdCBsb2NrVGFzay5jYWxsKHNlbGYsIHRhc2spO1xuXG4gICAgLy8gZmlyZSBqb2IgYmVmb3JlIGV2ZW50XG4gICAgZmlyZUpvYklubGluZUV2ZW50LmNhbGwodGhpcywgJ2JlZm9yZScsIHdvcmtlckluc3RhbmNlLCB0YXNrLmFyZ3MpO1xuXG4gICAgLy8gZGlzcGFjdGggY3VzdG9tIGJlZm9yZSBldmVudFxuICAgIGRpc3BhdGNoRXZlbnRzLmNhbGwodGhpcywgdGFzaywgJ2JlZm9yZScpO1xuXG4gICAgY29uc3QgZGVwcyA9IFF1ZXVlLndvcmtlckRlcHNbd29ya2VyLm5hbWVdO1xuXG4gICAgLy8gcHJlcGFyaW5nIHdvcmtlciBkZXBlbmRlbmNpZXNcbiAgICBjb25zdCBkZXBlbmRlbmNpZXMgPSBPYmplY3QudmFsdWVzKGRlcHMgfHwge30pO1xuXG4gICAgbG9nUHJveHkuY2FsbCh0aGlzLCB3b3JrZXJSdW5uaW5Mb2csIHdvcmtlciwgd29ya2VySW5zdGFuY2UsIHRhc2ssIFF1ZXVlLndvcmtlckRlcHMpO1xuXG4gICAgLy8gVGFzayBydW5uZXIgcHJvbWlzZVxuICAgIHdvcmtlckluc3RhbmNlLmhhbmRsZVxuICAgICAgLmNhbGwod29ya2VySW5zdGFuY2UsIHRhc2suYXJncywgLi4uZGVwZW5kZW5jaWVzKVxuICAgICAgLnRoZW4oKGF3YWl0IHN1Y2Nlc3NKb2JIYW5kbGVyLmNhbGwoc2VsZiwgdGFzaywgd29ya2VySW5zdGFuY2UpKS5iaW5kKHNlbGYpKVxuICAgICAgLmNhdGNoKChhd2FpdCBmYWlsZWRKb2JIYW5kbGVyLmNhbGwoc2VsZiwgdGFzaykpLmJpbmQoc2VsZikpO1xuICB9O1xufVxuXG4vKipcbiAqIFRpbWVvdXQgY3JlYXRvciBoZWxwZXJcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGVUaW1lb3V0KCk6IFByb21pc2U8bnVtYmVyPiB7XG4gIC8vIGlmIHJ1bm5pbmcgYW55IGpvYiwgc3RvcCBpdFxuICAvLyB0aGUgcHVycG9zZSBoZXJlIGlzIHRvIHByZXZlbnQgY29jdXJyZW50IG9wZXJhdGlvbiBpbiBzYW1lIGNoYW5uZWxcbiAgY2xlYXJUaW1lb3V0KHRoaXMuY3VycmVudFRpbWVvdXQpO1xuXG4gIC8vIEdldCBuZXh0IHRhc2tcbiAgY29uc3QgdGFzazogSVRhc2sgPSAoYXdhaXQgZGIuY2FsbCh0aGlzKS5mZXRjaCgpKS5zaGlmdCgpO1xuXG4gIGlmICh0YXNrID09PSB1bmRlZmluZWQpIHtcbiAgICBsb2dQcm94eS5jYWxsKHRoaXMsIHF1ZXVlRW1wdHlMb2csIHRoaXMubmFtZSgpKTtcbiAgICBzdG9wUXVldWUuY2FsbCh0aGlzKTtcbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIGlmICghUXVldWUucXVldWVXb3JrZXJzW3Rhc2suaGFuZGxlcl0pIHtcbiAgICBsb2dQcm94eS5jYWxsKHRoaXMsIG5vdEZvdW5kTG9nLCB0YXNrLmhhbmRsZXIpO1xuICAgIGF3YWl0IChhd2FpdCBmYWlsZWRKb2JIYW5kbGVyLmNhbGwodGhpcywgdGFzaykpLmNhbGwodGhpcyk7XG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICAvLyBHZXQgd29ya2VyIHdpdGggaGFuZGxlciBuYW1lXG4gIGNvbnN0IEpvYldvcmtlcjogRnVuY3Rpb24gPSBRdWV1ZS5xdWV1ZVdvcmtlcnNbdGFzay5oYW5kbGVyXTtcblxuICAvLyBDcmVhdGUgYSB3b3JrZXIgaW5zdGFuY2VcbiAgY29uc3Qgd29ya2VySW5zdGFuY2U6IElXb3JrZXIgPSBuZXcgSm9iV29ya2VyKCk7XG5cbiAgLy8gZ2V0IGFsd2F5cyBsYXN0IHVwZGF0ZWQgY29uZmlnIHZhbHVlXG4gIGNvbnN0IHRpbWVvdXQ6IG51bWJlciA9IHRoaXMuY29uZmlnLmdldCgndGltZW91dCcpO1xuXG4gIC8vIGNyZWF0ZSBhIGFycmF5IHdpdGggaGFuZGxlciBwYXJhbWV0ZXJzIGZvciBzaG9ydGVuIGxpbmUgbnVtYmVyc1xuICBjb25zdCBwYXJhbXMgPSBbdGFzaywgSm9iV29ya2VyLCB3b3JrZXJJbnN0YW5jZV07XG5cbiAgLy8gR2V0IGhhbmRsZXIgZnVuY3Rpb24gZm9yIGhhbmRsZSBvbiBjb21wbGV0ZWQgZXZlbnRcbiAgY29uc3QgaGFuZGxlcjogRnVuY3Rpb24gPSAoYXdhaXQgbG9vcEhhbmRsZXIuY2FsbCh0aGlzLCAuLi5wYXJhbXMpKS5iaW5kKHRoaXMpO1xuXG4gIC8vIGNyZWF0ZSBuZXcgdGltZW91dCBmb3IgcHJvY2VzcyBhIGpvYiBpbiBxdWV1ZVxuICAvLyBiaW5kaW5nIGxvb3BIYW5kbGVyIGZ1bmN0aW9uIHRvIHNldFRpbWVvdXRcbiAgLy8gdGhlbiByZXR1cm4gdGhlIHRpbWVvdXQgaW5zdGFuY2VcbiAgdGhpcy5jdXJyZW50VGltZW91dCA9IHNldFRpbWVvdXQoaGFuZGxlciwgdGltZW91dCk7XG5cbiAgcmV0dXJuIHRoaXMuY3VycmVudFRpbWVvdXQ7XG59XG5cbi8qKlxuICogU2V0IHRoZSBzdGF0dXMgdG8gZmFsc2Ugb2YgcXVldWVcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcmV0dXJuIHt2b2lkfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RhdHVzT2ZmKCk6IHZvaWQge1xuICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciBhIHRhc2sgaXMgcmVwbGljYWJsZSBvciBub3RcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2FuTXVsdGlwbGUodGFzazogSVRhc2spOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgaWYgKHR5cGVvZiB0YXNrICE9PSAnb2JqZWN0JyB8fCB0YXNrLnVuaXF1ZSAhPT0gdHJ1ZSkgcmV0dXJuIHRydWU7XG4gIHJldHVybiAoYXdhaXQgdGhpcy5oYXNCeVRhZyh0YXNrLnRhZykpID09PSBmYWxzZTtcbn1cblxuLyoqXG4gKiBKb2IgaGFuZGxlciBjbGFzcyByZWdpc3RlclxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqIEBwYXJhbSB7SVdvcmtlcn0gd29ya2VyXG4gKiBAcmV0dXJuIHt2b2lkfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJXb3JrZXJzKCk6IGJvb2xlYW4ge1xuICBpZiAoUXVldWUuaXNSZWdpc3RlcmVkKSByZXR1cm4gZmFsc2U7XG5cbiAgY29uc3Qgd29ya2VycyA9IFF1ZXVlLnF1ZXVlV29ya2VycyB8fCB7fTtcblxuICB0aGlzLmNvbnRhaW5lci5tZXJnZSh3b3JrZXJzKTtcblxuICBRdWV1ZS5pc1JlZ2lzdGVyZWQgPSB0cnVlO1xuXG4gIHJldHVybiB0cnVlO1xufVxuIiwiaW1wb3J0IFF1ZXVlIGZyb20gJy4vcXVldWUnO1xuXG4vKiBnbG9iYWwgd2luZG93OnRydWUgKi9cblxud2luZG93LlF1ZXVlID0gUXVldWU7XG5cbmV4cG9ydCBkZWZhdWx0IFF1ZXVlO1xuIiwiLyogQGZsb3cgKi9cbmltcG9ydCB0eXBlIElDb25maWcgZnJvbSAnLi4vaW50ZXJmYWNlcy9jb25maWcnO1xuaW1wb3J0IENoYW5uZWwgZnJvbSAnLi9jaGFubmVsJztcbmltcG9ydCBDb250YWluZXIgZnJvbSAnLi9jb250YWluZXInO1xuaW1wb3J0IENvbmZpZyBmcm9tICcuL2NvbmZpZyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFF1ZXVlKGNvbmZpZzogSUNvbmZpZykge1xuICB0aGlzLmNvbmZpZyA9IG5ldyBDb25maWcoY29uZmlnKTtcbn1cblxuUXVldWUuRklGTyA9ICdmaWZvJztcblF1ZXVlLkxJRk8gPSAnbGlmbyc7XG5RdWV1ZS5kcml2ZXJzID0ge307XG5RdWV1ZS5xdWV1ZVdvcmtlcnMgPSB7fTtcblF1ZXVlLndvcmtlckRlcHMgPSB7fTtcblxuUXVldWUucHJvdG90eXBlLmNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoKTtcblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgY2hhbm5lbFxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gdGFza1xuICogQHJldHVybiB7UXVldWV9IGNoYW5uZWxcbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5RdWV1ZS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKGNoYW5uZWw6IHN0cmluZyk6IFF1ZXVlIHtcbiAgaWYgKCF0aGlzLmNvbnRhaW5lci5oYXMoY2hhbm5lbCkpIHtcbiAgICB0aGlzLmNvbnRhaW5lci5iaW5kKGNoYW5uZWwsIG5ldyBDaGFubmVsKGNoYW5uZWwsIHRoaXMuY29uZmlnKSk7XG4gIH1cbiAgcmV0dXJuIHRoaXMuY29udGFpbmVyLmdldChjaGFubmVsKTtcbn07XG5cbi8qKlxuICogR2V0IGNoYW5uZWwgaW5zdGFuY2UgYnkgY2hhbm5lbCBuYW1lXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtRdWV1ZX1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5RdWV1ZS5wcm90b3R5cGUuY2hhbm5lbCA9IGZ1bmN0aW9uIGNoYW5uZWwobmFtZTogc3RyaW5nKTogUXVldWUge1xuICBpZiAoIXRoaXMuY29udGFpbmVyLmhhcyhuYW1lKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgXCIke25hbWV9XCIgY2hhbm5lbCBub3QgZm91bmRgKTtcbiAgfVxuICByZXR1cm4gdGhpcy5jb250YWluZXIuZ2V0KG5hbWUpO1xufTtcblxuLyoqXG4gKiBTZXQgY29uZmlnIHRpbWVvdXQgdmFsdWVcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZhbFxuICogQHJldHVybiB7Vm9pZH1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5RdWV1ZS5wcm90b3R5cGUuc2V0VGltZW91dCA9IGZ1bmN0aW9uIHNldFRpbWVvdXQodmFsOiBudW1iZXIpOiB2b2lkIHtcbiAgdGhpcy5jb25maWcuc2V0KCd0aW1lb3V0JywgdmFsKTtcbn07XG5cbi8qKlxuICogU2V0IGNvbmZpZyBsaW1pdCB2YWx1ZVxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gdmFsXG4gKiBAcmV0dXJuIHtWb2lkfVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblF1ZXVlLnByb3RvdHlwZS5zZXRMaW1pdCA9IGZ1bmN0aW9uIHNldExpbWl0KHZhbDogbnVtYmVyKTogdm9pZCB7XG4gIHRoaXMuY29uZmlnLnNldCgnbGltaXQnLCB2YWwpO1xufTtcblxuLyoqXG4gKiBTZXQgY29uZmlnIHByZWZpeCB2YWx1ZVxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gdmFsXG4gKiBAcmV0dXJuIHtWb2lkfVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblF1ZXVlLnByb3RvdHlwZS5zZXRQcmVmaXggPSBmdW5jdGlvbiBzZXRQcmVmaXgodmFsOiBzdHJpbmcpOiB2b2lkIHtcbiAgdGhpcy5jb25maWcuc2V0KCdwcmVmaXgnLCB2YWwpO1xufTtcblxuLyoqXG4gKiBTZXQgY29uZmlnIHByaWNpcGxlIHZhbHVlXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1ZvaWR9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUXVldWUucHJvdG90eXBlLnNldFByaW5jaXBsZSA9IGZ1bmN0aW9uIHNldFByaW5jaXBsZSh2YWw6IHN0cmluZyk6IHZvaWQge1xuICB0aGlzLmNvbmZpZy5zZXQoJ3ByaW5jaXBsZScsIHZhbCk7XG59O1xuXG4vKipcbiAqIFNldCBjb25maWcgZGVidWcgdmFsdWVcbiAqXG4gKiBAcGFyYW0gIHtCb29sZWFufSB2YWxcbiAqIEByZXR1cm4ge1ZvaWR9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUXVldWUucHJvdG90eXBlLnNldERlYnVnID0gZnVuY3Rpb24gc2V0RGVidWcodmFsOiBib29sZWFuKTogdm9pZCB7XG4gIHRoaXMuY29uZmlnLnNldCgnZGVidWcnLCB2YWwpO1xufTtcblxuUXVldWUucHJvdG90eXBlLnNldFN0b3JhZ2UgPSBmdW5jdGlvbiBzZXRTdG9yYWdlKHZhbDogc3RyaW5nKTogdm9pZCB7XG4gIHRoaXMuY29uZmlnLnNldCgnc3RvcmFnZScsIHZhbCk7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVyIHdvcmtlclxuICpcbiAqIEBwYXJhbSAge0FycmF5PElKb2I+fSBqb2JzXG4gKiBAcmV0dXJuIHtWb2lkfVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblF1ZXVlLndvcmtlcnMgPSBmdW5jdGlvbiB3b3JrZXJzKHdvcmtlcnNPYmo6IHsgW3Byb3A6IHN0cmluZ106IGFueSB9ID0ge30pOiB2b2lkIHtcbiAgaWYgKCEod29ya2Vyc09iaiBpbnN0YW5jZW9mIE9iamVjdCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBwYXJhbWV0ZXJzIHNob3VsZCBiZSBvYmplY3QuJyk7XG4gIH1cbiAgUXVldWUuaXNSZWdpc3RlcmVkID0gZmFsc2U7XG4gIFF1ZXVlLnF1ZXVlV29ya2VycyA9IHdvcmtlcnNPYmo7XG59O1xuXG4vKipcbiAqIEFkZGVkIHdvcmtlcnMgZGVwZW5kZW5jaWVzXG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSBkcml2ZXJcbiAqIEByZXR1cm4ge1ZvaWR9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUXVldWUuZGVwcyA9IGZ1bmN0aW9uIGRlcHMoZGVwZW5kZW5jaWVzOiB7IFtwcm9wOiBzdHJpbmddOiBhbnkgfSA9IHt9KTogdm9pZCB7XG4gIGlmICghKGRlcGVuZGVuY2llcyBpbnN0YW5jZW9mIE9iamVjdCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBwYXJhbWV0ZXJzIHNob3VsZCBiZSBvYmplY3QuJyk7XG4gIH1cbiAgUXVldWUud29ya2VyRGVwcyA9IGRlcGVuZGVuY2llcztcbn07XG5cbi8qKlxuICogU2V0dXAgYSBjdXN0b20gZHJpdmVyXG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSBkcml2ZXJcbiAqIEByZXR1cm4ge1ZvaWR9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUXVldWUudXNlID0gZnVuY3Rpb24gdXNlKGRyaXZlcjogeyBbcHJvcDogc3RyaW5nXTogYW55IH0gPSB7fSk6IHZvaWQge1xuICBRdWV1ZS5kcml2ZXJzID0geyAuLi5RdWV1ZS5kcml2ZXJzLCAuLi5kcml2ZXIgfTtcbn07XG4iLCIvKiBAZmxvdyAqL1xuaW1wb3J0IGdyb3VwQnkgZnJvbSAnZ3JvdXAtYnknO1xuaW1wb3J0IHR5cGUgSUNvbmZpZyBmcm9tICcuLi9pbnRlcmZhY2VzL2NvbmZpZyc7XG5pbXBvcnQgdHlwZSB7IElTdG9yYWdlIH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9zdG9yYWdlJztcbmltcG9ydCB0eXBlIElUYXNrIGZyb20gJy4uL2ludGVyZmFjZXMvdGFzayc7XG5pbXBvcnQgeyBMb2NhbEZvcmFnZUFkYXB0ZXIsIEluTWVtb3J5QWRhcHRlciB9IGZyb20gJy4vYWRhcHRlcnMnO1xuaW1wb3J0IHsgZXhjbHVkZVNwZWNpZmljVGFza3MsIGxpZm8sIGZpZm8gfSBmcm9tICcuL3V0aWxzJztcblxuLyogZXNsaW50IG5vLWNvbnNvbGU6IFtcImVycm9yXCIsIHsgYWxsb3c6IFtcIndhcm5cIiwgXCJlcnJvclwiXSB9XSAqL1xuLyogZXNsaW50IG5vLXVuZGVyc2NvcmUtZGFuZ2xlOiBbMiwgeyBcImFsbG93XCI6IFtcIl9pZFwiXSB9XSAqL1xuLyogZXNsaW50IGNsYXNzLW1ldGhvZHMtdXNlLXRoaXM6IFtcImVycm9yXCIsIHsgXCJleGNlcHRNZXRob2RzXCI6IFtcImdlbmVyYXRlSWRcIl0gfV0gKi9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RvcmFnZUNhcHN1bGUge1xuICBjb25maWc6IElDb25maWc7XG4gIHN0b3JhZ2U6IElTdG9yYWdlO1xuICBzdG9yYWdlQ2hhbm5lbDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogSUNvbmZpZywgc3RvcmFnZTogSVN0b3JhZ2UpIHtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLnN0b3JhZ2UgPSB0aGlzLmluaXRpYWxpemUoc3RvcmFnZSk7XG4gIH1cblxuICBpbml0aWFsaXplKFN0b3JhZ2U6IGFueSkge1xuICAgIGlmICh0eXBlb2YgU3RvcmFnZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiBTdG9yYWdlO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIFN0b3JhZ2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBuZXcgU3RvcmFnZSh0aGlzLmNvbmZpZyk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmNvbmZpZy5nZXQoJ3N0b3JhZ2UnKSA9PT0gJ2lubWVtb3J5Jykge1xuICAgICAgcmV0dXJuIG5ldyBJbk1lbW9yeUFkYXB0ZXIodGhpcy5jb25maWcpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IExvY2FsRm9yYWdlQWRhcHRlcih0aGlzLmNvbmZpZyk7XG4gIH1cblxuICAvKipcbiAgICogU2VsZWN0IGEgY2hhbm5lbCBieSBjaGFubmVsIG5hbWVcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm4ge1N0b3JhZ2VDYXBzdWxlfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgY2hhbm5lbChuYW1lOiBzdHJpbmcpOiBTdG9yYWdlQ2Fwc3VsZSB7XG4gICAgdGhpcy5zdG9yYWdlQ2hhbm5lbCA9IG5hbWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogRmV0Y2ggdGFza3MgZnJvbSBzdG9yYWdlIHdpdGggb3JkZXJlZFxuICAgKlxuICAgKiBAcmV0dXJuIHthbnlbXX1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGZldGNoKCk6IFByb21pc2U8YW55W10+IHtcbiAgICBjb25zdCBhbGwgPSAoYXdhaXQgdGhpcy5hbGwoKSkuZmlsdGVyKGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzKTtcbiAgICBjb25zdCB0YXNrcyA9IGdyb3VwQnkoYWxsLCAncHJpb3JpdHknKTtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGFza3MpXG4gICAgICAubWFwKGtleSA9PiBwYXJzZUludChrZXksIDEwKSlcbiAgICAgIC5zb3J0KChhLCBiKSA9PiBiIC0gYSlcbiAgICAgIC5yZWR1Y2UodGhpcy5yZWR1Y2VUYXNrcyh0YXNrcyksIFtdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTYXZlIHRhc2sgdG8gc3RvcmFnZVxuICAgKlxuICAgKiBAcGFyYW0gIHtJVGFza30gdGFza1xuICAgKiBAcmV0dXJuIHtTdHJpbmd8Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIHNhdmUodGFzazogSVRhc2spOiBQcm9taXNlPHN0cmluZyB8IGJvb2xlYW4+IHtcbiAgICBpZiAodHlwZW9mIHRhc2sgIT09ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBnZXQgYWxsIHRhc2tzIGN1cnJlbnQgY2hhbm5lbCdzXG4gICAgY29uc3QgdGFza3M6IElUYXNrW10gPSBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0KHRoaXMuc3RvcmFnZUNoYW5uZWwpO1xuXG4gICAgLy8gQ2hlY2sgdGhlIGNoYW5uZWwgbGltaXQuXG4gICAgLy8gSWYgbGltaXQgaXMgZXhjZWVkZWQsIGRvZXMgbm90IGluc2VydCBuZXcgdGFza1xuICAgIGlmIChhd2FpdCB0aGlzLmlzRXhjZWVkZWQoKSkge1xuICAgICAgY29uc29sZS53YXJuKGBUYXNrIGxpbWl0IGV4Y2VlZGVkOiBUaGUgJyR7dGhpcy5zdG9yYWdlQ2hhbm5lbH0nIGNoYW5uZWwgbGltaXQgaXMgJHt0aGlzLmNvbmZpZy5nZXQoJ2xpbWl0Jyl9YCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gcHJlcGFyZSBhbGwgcHJvcGVydGllcyBiZWZvcmUgc2F2ZVxuICAgIC8vIGV4YW1wbGU6IGNyZWF0ZWRBdCBldGMuXG4gICAgY29uc3QgbmV3VGFzayA9IHRoaXMucHJlcGFyZVRhc2sodGFzayk7XG5cbiAgICAvLyBhZGQgdGFzayB0byBzdG9yYWdlXG4gICAgdGFza3MucHVzaChuZXdUYXNrKTtcblxuICAgIC8vIHNhdmUgdGFza3NcbiAgICBhd2FpdCB0aGlzLnN0b3JhZ2Uuc2V0KHRoaXMuc3RvcmFnZUNoYW5uZWwsIHRhc2tzKTtcblxuICAgIHJldHVybiBuZXdUYXNrLl9pZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgY2hhbm5lbCBzdG9yZS5cbiAgICpcbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKiAgIFRoZSB2YWx1ZS4gVGhpcyBhbm5vdGF0aW9uIGNhbiBiZSB1c2VkIGZvciB0eXBlIGhpbnRpbmcgcHVycG9zZXMuXG4gICAqL1xuICBhc3luYyB1cGRhdGUoaWQ6IHN0cmluZywgdXBkYXRlOiB7IFtwcm9wZXJ0eTogc3RyaW5nXTogYW55IH0pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBkYXRhOiBhbnlbXSA9IGF3YWl0IHRoaXMuYWxsKCk7XG4gICAgY29uc3QgaW5kZXg6IG51bWJlciA9IGRhdGEuZmluZEluZGV4KHQgPT4gdC5faWQgPT09IGlkKTtcblxuICAgIC8vIGlmIGluZGV4IG5vdCBmb3VuZCwgcmV0dXJuIGZhbHNlXG4gICAgaWYgKGluZGV4IDwgMCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gbWVyZ2UgZXhpc3Rpbmcgb2JqZWN0IHdpdGggZ2l2ZW4gdXBkYXRlIG9iamVjdFxuICAgIGRhdGFbaW5kZXhdID0gT2JqZWN0LmFzc2lnbih7fSwgZGF0YVtpbmRleF0sIHVwZGF0ZSk7XG5cbiAgICAvLyBzYXZlIHRvIHRoZSBzdG9yYWdlIGFzIHN0cmluZ1xuICAgIGF3YWl0IHRoaXMuc3RvcmFnZS5zZXQodGhpcy5zdG9yYWdlQ2hhbm5lbCwgZGF0YSk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgdGFzayBmcm9tIHN0b3JhZ2VcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBpZFxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgZGVsZXRlKGlkOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBkYXRhOiBhbnlbXSA9IGF3YWl0IHRoaXMuYWxsKCk7XG4gICAgY29uc3QgaW5kZXg6IG51bWJlciA9IGRhdGEuZmluZEluZGV4KGQgPT4gZC5faWQgPT09IGlkKTtcblxuICAgIGlmIChpbmRleCA8IDApIHJldHVybiBmYWxzZTtcblxuICAgIGRlbGV0ZSBkYXRhW2luZGV4XTtcblxuICAgIGF3YWl0IHRoaXMuc3RvcmFnZS5zZXQodGhpcy5zdG9yYWdlQ2hhbm5lbCwgZGF0YS5maWx0ZXIoZCA9PiBkKSk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIHRhc2tzXG4gICAqXG4gICAqIEByZXR1cm4ge0FueVtdfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgYWxsKCk6IFByb21pc2U8SVRhc2tbXT4ge1xuICAgIGNvbnN0IGl0ZW1zID0gYXdhaXQgdGhpcy5zdG9yYWdlLmdldCh0aGlzLnN0b3JhZ2VDaGFubmVsKTtcbiAgICByZXR1cm4gaXRlbXM7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgdW5pcXVlIGlkXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGdlbmVyYXRlSWQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gKCgxICsgTWF0aC5yYW5kb20oKSkgKiAweDEwMDAwKS50b1N0cmluZygxNik7XG4gIH1cblxuICAvKipcbiAgICogQWRkIHNvbWUgbmVjZXNzYXJ5IHByb3BlcnRpZXNcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBpZFxuICAgKiBAcmV0dXJuIHtJVGFza31cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHByZXBhcmVUYXNrKHRhc2s6IElUYXNrKTogSVRhc2sge1xuICAgIGNvbnN0IG5ld1Rhc2sgPSB7IC4uLnRhc2sgfTtcbiAgICBuZXdUYXNrLmNyZWF0ZWRBdCA9IERhdGUubm93KCk7XG4gICAgbmV3VGFzay5faWQgPSB0aGlzLmdlbmVyYXRlSWQoKTtcbiAgICByZXR1cm4gbmV3VGFzaztcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgc29tZSBuZWNlc3NhcnkgcHJvcGVydGllc1xuICAgKlxuICAgKiBAcGFyYW0gIHtJVGFza1tdfSB0YXNrc1xuICAgKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHJlZHVjZVRhc2tzKHRhc2tzOiBJVGFza1tdKSB7XG4gICAgY29uc3QgcmVkdWNlRnVuYyA9IChyZXN1bHQ6IElUYXNrW10sIGtleTogYW55KTogSVRhc2tbXSA9PiB7XG4gICAgICBpZiAodGhpcy5jb25maWcuZ2V0KCdwcmluY2lwbGUnKSA9PT0gJ2xpZm8nKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQuY29uY2F0KHRhc2tzW2tleV0uc29ydChsaWZvKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0LmNvbmNhdCh0YXNrc1trZXldLnNvcnQoZmlmbykpO1xuICAgIH07XG5cbiAgICByZXR1cm4gcmVkdWNlRnVuYy5iaW5kKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRhc2sgbGltaXQgY2hlY2tlclxuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgaXNFeGNlZWRlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBsaW1pdDogbnVtYmVyID0gdGhpcy5jb25maWcuZ2V0KCdsaW1pdCcpO1xuICAgIGNvbnN0IHRhc2tzOiBJVGFza1tdID0gKGF3YWl0IHRoaXMuYWxsKCkpLmZpbHRlcihleGNsdWRlU3BlY2lmaWNUYXNrcyk7XG4gICAgcmV0dXJuICEobGltaXQgPT09IC0xIHx8IGxpbWl0ID4gdGFza3MubGVuZ3RoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciB0YXNrcyB3aXRoIGdpdmVuIGNoYW5uZWwgbmFtZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGNoYW5uZWxcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGNsZWFyKGNoYW5uZWw6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuc3RvcmFnZS5jbGVhcihjaGFubmVsKTtcbiAgfVxufVxuIiwiLyogQGZsb3cgKi9cbmltcG9ydCB0eXBlIElUYXNrIGZyb20gJy4uL2ludGVyZmFjZXMvdGFzayc7XG5cbi8qIGVzbGludCBjb21tYS1kYW5nbGU6IFtcImVycm9yXCIsIFwibmV2ZXJcIl0gKi9cblxuLyoqXG4gKiBDaGVjayBwcm9wZXJ0eSBpbiBvYmplY3RcbiAqXG4gKiBAcGFyYW0gIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gaGFzUHJvcGVydHkoZnVuYzogRnVuY3Rpb24sIG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGZ1bmMsIG5hbWUpO1xufVxuXG4vKipcbiAqIENoZWNrIG1ldGhvZCBpbiBpbml0aWF0ZWQgY2xhc3NcbiAqXG4gKiBAcGFyYW0gIHtDbGFzc30gaW5zdGFuY2VcbiAqIEBwYXJhbSAge1N0cmluZ30gbWV0aG9kXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXNNZXRob2QoaW5zdGFuY2U6IGFueSwgbWV0aG9kOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIGluc3RhbmNlIGluc3RhbmNlb2YgT2JqZWN0ICYmIG1ldGhvZCBpbiBpbnN0YW5jZTtcbn1cblxuLyoqXG4gKiBDaGVjayBmdW5jdGlvbiB0eXBlXG4gKlxuICogQHBhcmFtICB7RnVuY3Rpb259IGZ1bmNcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRnVuY3Rpb24oZnVuYzogRnVuY3Rpb24pOiBib29sZWFuIHtcbiAgcmV0dXJuIGZ1bmMgaW5zdGFuY2VvZiBGdW5jdGlvbjtcbn1cblxuLyoqXG4gKiBSZW1vdmUgc29tZSB0YXNrcyBieSBzb21lIGNvbmRpdGlvbnNcbiAqXG4gKiBAcGFyYW0gIHtGdW5jdGlvbn0gZnVuY1xuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gZXhjbHVkZVNwZWNpZmljVGFza3ModGFzazogSVRhc2spOiBib29sZWFuIHtcbiAgY29uc3QgY29uZGl0aW9ucyA9IEFycmF5LmlzQXJyYXkodGhpcykgPyB0aGlzIDogWydmcmVlemVkJywgJ2xvY2tlZCddO1xuICBjb25zdCByZXN1bHRzID0gW107XG5cbiAgY29uZGl0aW9ucy5mb3JFYWNoKChjKSA9PiB7XG4gICAgcmVzdWx0cy5wdXNoKGhhc1Byb3BlcnR5KHRhc2ssIGMpID09PSBmYWxzZSB8fCB0YXNrW2NdID09PSBmYWxzZSk7XG4gIH0pO1xuXG4gIHJldHVybiAhKHJlc3VsdHMuaW5kZXhPZihmYWxzZSkgPiAtMSk7XG59XG5cbi8qKlxuICogQ2xlYXIgdGFza3MgYnkgaXQncyB0YWdzXG4gKlxuICogQHBhcmFtICB7SVRhc2t9IHRhc2tcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHV0aWxDbGVhckJ5VGFnKHRhc2s6IElUYXNrKTogYm9vbGVhbiB7XG4gIGlmICghZXhjbHVkZVNwZWNpZmljVGFza3MuY2FsbChbJ2xvY2tlZCddLCB0YXNrKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdGFzay50YWcgPT09IHRoaXM7XG59XG5cbi8qKlxuICogU29ydCBieSBmaWZvXG4gKlxuICogQHBhcmFtICB7SVRhc2t9IGFcbiAqIEBwYXJhbSAge0lUYXNrfSBiXG4gKiBAcmV0dXJuIHtBbnl9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpZm8oYTogSVRhc2ssIGI6IElUYXNrKTogYW55IHtcbiAgcmV0dXJuIGEuY3JlYXRlZEF0IC0gYi5jcmVhdGVkQXQ7XG59XG5cbi8qKlxuICogU29ydCBieSBsaWZvXG4gKlxuICogQHBhcmFtICB7SVRhc2t9IGFcbiAqIEBwYXJhbSAge0lUYXNrfSBiXG4gKiBAcmV0dXJuIHtBbnl9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxpZm8oYTogSVRhc2ssIGI6IElUYXNrKTogYW55IHtcbiAgcmV0dXJuIGIuY3JlYXRlZEF0IC0gYS5jcmVhdGVkQXQ7XG59XG4iXX0=
