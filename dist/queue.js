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
      { 'regenerator-runtime': 7 }
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
      { 'to-function': 9 }
    ],
    4: [
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
    5: [
      function(require, module, exports) {
        (function(global) {
          'use strict';

          function doEval(self, __pseudoworker_script) {
            /* jshint unused:false */
            (function() {
              /* jshint evil:true */
              eval(__pseudoworker_script);
            }.call(global));
          }

          function PseudoWorker(path) {
            var messageListeners = [];
            var errorListeners = [];
            var workerMessageListeners = [];
            var workerErrorListeners = [];
            var postMessageListeners = [];
            var terminated = false;
            var script;
            var workerSelf;

            var api = this;

            // custom each loop is for IE8 support
            function executeEach(arr, fun) {
              var i = -1;
              while (++i < arr.length) {
                if (arr[i]) {
                  fun(arr[i]);
                }
              }
            }

            function callErrorListener(err) {
              return function(listener) {
                listener({
                  type: 'error',
                  error: err,
                  message: err.message
                });
              };
            }

            function addEventListener(type, fun) {
              /* istanbul ignore else */
              if (type === 'message') {
                messageListeners.push(fun);
              } else if (type === 'error') {
                errorListeners.push(fun);
              }
            }

            function removeEventListener(type, fun) {
              var listeners;
              /* istanbul ignore else */
              if (type === 'message') {
                listeners = messageListeners;
              } else if (type === 'error') {
                listeners = errorListeners;
              } else {
                return;
              }
              var i = -1;
              while (++i < listeners.length) {
                var listener = listeners[i];
                if (listener === fun) {
                  delete listeners[i];
                  break;
                }
              }
            }

            function postError(err) {
              var callFun = callErrorListener(err);
              if (typeof api.onerror === 'function') {
                callFun(api.onerror);
              }
              if (workerSelf && typeof workerSelf.onerror === 'function') {
                callFun(workerSelf.onerror);
              }
              executeEach(errorListeners, callFun);
              executeEach(workerErrorListeners, callFun);
            }

            function runPostMessage(msg) {
              function callFun(listener) {
                try {
                  listener({ data: msg });
                } catch (err) {
                  postError(err);
                }
              }

              if (workerSelf && typeof workerSelf.onmessage === 'function') {
                callFun(workerSelf.onmessage);
              }
              executeEach(workerMessageListeners, callFun);
            }

            function postMessage(msg) {
              if (typeof msg === 'undefined') {
                throw new Error('postMessage() requires an argument');
              }
              if (terminated) {
                return;
              }
              if (!script) {
                postMessageListeners.push(msg);
                return;
              }
              runPostMessage(msg);
            }

            function terminate() {
              terminated = true;
            }

            function workerPostMessage(msg) {
              if (terminated) {
                return;
              }
              function callFun(listener) {
                listener({
                  data: msg
                });
              }
              if (typeof api.onmessage === 'function') {
                callFun(api.onmessage);
              }
              executeEach(messageListeners, callFun);
            }

            function workerAddEventListener(type, fun) {
              /* istanbul ignore else */
              if (type === 'message') {
                workerMessageListeners.push(fun);
              } else if (type === 'error') {
                workerErrorListeners.push(fun);
              }
            }

            var xhr = new XMLHttpRequest();

            xhr.open('GET', path);
            xhr.onreadystatechange = function() {
              if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 400) {
                  script = xhr.responseText;
                  workerSelf = {
                    postMessage: workerPostMessage,
                    addEventListener: workerAddEventListener,
                    close: terminate
                  };
                  doEval(workerSelf, script);
                  var currentListeners = postMessageListeners;
                  postMessageListeners = [];
                  for (var i = 0; i < currentListeners.length; i++) {
                    runPostMessage(currentListeners[i]);
                  }
                } else {
                  postError(new Error('cannot find script ' + path));
                }
              }
            };

            xhr.send();

            api.postMessage = postMessage;
            api.addEventListener = addEventListener;
            api.removeEventListener = removeEventListener;
            api.terminate = terminate;

            return api;
          }

          module.exports = PseudoWorker;
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
    6: [
      function(require, module, exports) {
        (function(global) {
          'use strict';

          var PseudoWorker = require('./');

          if (typeof Worker === 'undefined') {
            global.Worker = PseudoWorker;
          }

          module.exports = PseudoWorker;
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
      { './': 5 }
    ],
    7: [
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
      { './runtime': 8 }
    ],
    8: [
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
    9: [
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
    10: [
      function(require, module, exports) {
        'use strict';
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.LocalStorageAdapter = exports.InMemoryAdapter = undefined;
        var _inmemory = require('./inmemory');
        var _inmemory2 = _interopRequireDefault(_inmemory);
        var _localstorage = require('./localstorage');
        var _localstorage2 = _interopRequireDefault(_localstorage);
        function _interopRequireDefault(obj) {
          return obj && obj.__esModule ? obj : { default: obj };
        }
        exports.InMemoryAdapter = _inmemory2.default;
        exports.LocalStorageAdapter = _localstorage2.default;
      },
      { './inmemory': 11, './localstorage': 12 }
    ],
    11: [
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

        /* global localStorage */ var LocalStorageAdapter = (function() {
          function LocalStorageAdapter(config) {
            _classCallCheck(this, LocalStorageAdapter);
            this.config = config;
            this.prefix = this.config.get('prefix');
          }

          /**
           * Take item from local storage by key
           *
           * @param  {String} key
           * @return {Promise<ITask>} (array)
           *
           * @api public
           */ _createClass(LocalStorageAdapter, [
            {
              key: 'get',
              value: (function() {
                var _ref = _asyncToGenerator(
                  /*#__PURE__*/ _regenerator2.default.mark(function _callee(
                    name
                  ) {
                    var result;
                    return _regenerator2.default.wrap(
                      function _callee$(_context) {
                        while (1) {
                          switch ((_context.prev = _context.next)) {
                            case 0:
                              result = localStorage.getItem(
                                this.storageName(name)
                              );
                              return _context.abrupt(
                                'return',
                                JSON.parse(result) || []
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
                    return _regenerator2.default.wrap(
                      function _callee2$(_context2) {
                        while (1) {
                          switch ((_context2.prev = _context2.next)) {
                            case 0:
                              localStorage.setItem(
                                this.storageName(key),
                                JSON.stringify(value)
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
               * Item checker in local storage
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
                                  localStorage,
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
                              _context4.t0 = delete localStorage[
                                this.storageName(key)
                              ];
                              _context4.next = 7;
                              break;
                            case 6:
                              _context4.t0 = false;
                            case 7:
                              result = _context4.t0;
                              return _context4.abrupt('return', result);
                            case 9:
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
            }
          ]);
          return LocalStorageAdapter;
        })();
        exports.default = LocalStorageAdapter;
      },
      { 'babel-runtime/regenerator': 1 }
    ],
    13: [
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
                              if (!(id && this.running === true)) {
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
                                _context2.next = 2;
                                break;
                              }
                              return _context2.abrupt(
                                'return',
                                _helpers.stopQueue.call(this)
                              );
                            case 2:
                              // Generate a log message
                              _helpers.logProxy.call(
                                this,
                                _console.nextTaskLog,
                                'next'
                              );

                              // start queue again
                              _context2.next = 5;
                              return this.start();
                            case 5:
                              return _context2.abrupt(
                                'return',

                                true
                              );
                            case 6:
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
                              this.stopped = false;
                              this.running = true;

                              _helpers.logProxy.call(
                                this,
                                _console.queueStartLog,
                                'start'
                              );

                              // Create a timeout for start the queue
                              _context3.next = 5;
                              return _helpers.createTimeout.call(this);
                            case 5:
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
               * Check if the channel working
               *
               * @return {Boolean}
               *
               * @api public
               */
            },
            {
              key: 'status',
              value: function status() {
                return this.running;
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
              value: (function() {
                var _ref7 = _asyncToGenerator(
                  /*#__PURE__*/ _regenerator2.default.mark(function _callee7() {
                    return _regenerator2.default.wrap(
                      function _callee7$(_context7) {
                        while (1) {
                          switch ((_context7.prev = _context7.next)) {
                            case 0:
                              if (this.name()) {
                                _context7.next = 2;
                                break;
                              }
                              return _context7.abrupt('return', false);
                            case 2:
                              _context7.next = 4;
                              return this.storage.clear(this.name());
                            case 4:
                              return _context7.abrupt('return', true);
                            case 5:
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
                function clear() {
                  return _ref7.apply(this, arguments);
                }
                return clear;
              })()

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
                var _ref8 = _asyncToGenerator(
                  /*#__PURE__*/ _regenerator2.default.mark(function _callee9(
                    tag
                  ) {
                    var _this = this;
                    var self, data, removes;
                    return _regenerator2.default.wrap(
                      function _callee9$(_context9) {
                        while (1) {
                          switch ((_context9.prev = _context9.next)) {
                            case 0:
                              self = this;
                              _context9.next = 3;
                              return _helpers.db.call(self).all();
                            case 3:
                              data = _context9.sent;
                              removes = data
                                .filter(_utils.utilClearByTag.bind(tag))
                                .map(
                                  (function() {
                                    var _ref9 = _asyncToGenerator(
                                      /*#__PURE__*/ _regenerator2.default.mark(
                                        function _callee8(t) {
                                          var result;
                                          return _regenerator2.default.wrap(
                                            function _callee8$(_context8) {
                                              while (1) {
                                                switch (
                                                  (_context8.prev =
                                                    _context8.next)
                                                ) {
                                                  case 0:
                                                    _context8.next = 2;
                                                    return _helpers.db
                                                      .call(self)
                                                      .delete(t._id);
                                                  case 2:
                                                    result = _context8.sent;
                                                    return _context8.abrupt(
                                                      'return',
                                                      result
                                                    );
                                                  case 4:
                                                  case 'end':
                                                    return _context8.stop();
                                                }
                                              }
                                            },
                                            _callee8,
                                            _this
                                          );
                                        }
                                      )
                                    );
                                    return function(_x4) {
                                      return _ref9.apply(this, arguments);
                                    };
                                  })()
                                );
                              _context9.next = 7;
                              return Promise.all(removes);
                            case 7:
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
                function clearByTag(_x3) {
                  return _ref8.apply(this, arguments);
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
                var _ref10 = _asyncToGenerator(
                  /*#__PURE__*/ _regenerator2.default.mark(function _callee10(
                    id
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
                                return t._id === id;
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
                function has(_x5) {
                  return _ref10.apply(this, arguments);
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
                var _ref11 = _asyncToGenerator(
                  /*#__PURE__*/ _regenerator2.default.mark(function _callee11(
                    tag
                  ) {
                    return _regenerator2.default.wrap(
                      function _callee11$(_context11) {
                        while (1) {
                          switch ((_context11.prev = _context11.next)) {
                            case 0:
                              _context11.next = 2;
                              return _helpers.getTasksWithoutFreezed.call(this);
                            case 2:
                              _context11.t0 = function(t) {
                                return t.tag === tag;
                              };
                              _context11.t1 = _context11.sent.findIndex(
                                _context11.t0
                              );
                              _context11.t2 = -1;
                              return _context11.abrupt(
                                'return',
                                _context11.t1 > _context11.t2
                              );
                            case 6:
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
                function hasByTag(_x6) {
                  return _ref11.apply(this, arguments);
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
                _helpers.logProxy.call(
                  this,
                  _console.eventCreatedLog,
                  key,
                  this.name()
                );
              }
            }
          ]);
          return Channel;
        })();
        exports.default = Channel;
      },
      {
        './console': 15,
        './event': 19,
        './helpers': 20,
        './queue': 22,
        './storage-capsule': 23,
        './utils': 24,
        'babel-runtime/regenerator': 1
      }
    ],
    14: [
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
      { './enum/config.data': 17 }
    ],
    15: [
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
            '%c' +
              String.fromCharCode(43) +
              ' (' +
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
            '%c' +
              String.fromCharCode(8211) +
              ' (' +
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
            '%c' +
              String.fromCharCode(187) +
              ' (' +
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
            '%c' +
              String.fromCharCode(8226) +
              ' (' +
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
            '%c' +
              String.fromCharCode(8226) +
              ' (' +
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
          var _ref14 = _slicedToArray(_ref13, 2),
            key = _ref14[0],
            name = _ref14[1];
          log(
            '%c(' +
              name +
              ') -> ' +
              key +
              ' ' +
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
            '%c' +
              String.fromCharCode(215) +
              ' (' +
              name +
              ') -> ' +
              _objectPath2.default.get(_log2.default, 'queue.not-found'),
            'color: #b92e2e;font-weight: bold;'
          );
        }
        function workerRunninLog(_ref19) {
          var _ref20 = _slicedToArray(_ref19, 5),
            worker = _ref20[0],
            workerInstance = _ref20[1],
            task = _ref20[2],
            channel = _ref20[3],
            deps = _ref20[4];
          console.groupCollapsed(
            (worker.name || task.handler) + ' - ' + task.label
          );
          log('%cchannel: ' + channel, 'color: blue;');
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
            log(
              '%c' + String.fromCharCode(10003) + ' Task completed!',
              'color: green;'
            );
          } else if (!result && task.tried < workerInstance.retry) {
            log('%cTask will be retried!', 'color: #d8410c;');
          } else {
            log(
              '%c' + String.fromCharCode(10005) + ' Task failed and freezed!',
              'color: #ef6363;'
            );
          }
          console.groupEnd();
        }
        function workerFailedLog() {
          log(
            '%c' + String.fromCharCode(10005) + ' Task failed!',
            'color: red;'
          );
          console.groupEnd();
        }
      },
      { './enum/log.events': 18, 'object-path': 4 }
    ],
    16: [
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
    17: [
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
    18: [
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
            created: 'event created',
            fired: 'Event fired.',
            'wildcard-fired': 'Wildcard event fired.'
          }
        };
      },
      {}
    ],
    19: [
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
            this.wildcards = ['*', 'error', 'completed'];
            this.emptyFunc = function() {};
            this.store.before = {};
            this.store.after = {};
            this.store.retry = {};
            this.store.wildcard = {};
            this.store.error = this.emptyFunc;
            this.store.completed = this.emptyFunc;
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
    20: [
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
                        this.event.emit('completed', task);
                        return _context11.abrupt('return', 0);
                      case 8:
                        if (_queue2.default.worker.has(task.handler)) {
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
                        return _context11.abrupt('return', 0);
                      case 16:
                        // Get worker with handler name
                        JobWorker = _queue2.default.worker.get(task.handler);

                        // Create a worker instance
                        workerInstance =
                          (typeof JobWorker === 'undefined'
                            ? 'undefined'
                            : _typeof(JobWorker)) === 'object'
                            ? new Worker(JobWorker.uri)
                            : new JobWorker();

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
        exports.checkPriority = checkPriority;
        exports.db = db;
        exports.logProxy = logProxy;
        exports.dispatchEvents = dispatchEvents;
        exports.stopQueue = stopQueue;
        exports.fireJobInlineEvent = fireJobInlineEvent;
        exports.successProcess = successProcess;
        exports.updateRetry = updateRetry;
        exports.loopHandler = loopHandler;
        exports.statusOff = statusOff;
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
        /* global Worker */ /* eslint no-underscore-dangle: [2, { "allow": ["_id"] }] */ /* eslint no-param-reassign: "error" */ /* eslint use-isnan: "error" */ /**
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
          this.running = false;
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
                var workerPromise,
                  self,
                  deps,
                  dependencies,
                  _workerInstance$handl;
                return _regenerator2.default.wrap(
                  function _callee10$(_context10) {
                    while (1) {
                      switch ((_context10.prev = _context10.next)) {
                        case 0:
                          workerPromise = void 0;
                          self = this; // lock the current task for prevent race condition
                          _context10.next = 4;
                          return lockTask.call(self, task);
                        case 4: // fire job before event
                          fireJobInlineEvent.call(
                            this,
                            'before',
                            workerInstance,
                            task.args
                          ); // dispacth custom before event
                          dispatchEvents.call(this, task, 'before'); // if has any dependency in dependencies, get it
                          deps = _queue2.default.workerDeps[task.handler]; // preparing worker dependencies
                          dependencies = Object.values(deps || {}); // show console
                          logProxy.call(
                            this,
                            _console.workerRunninLog,
                            worker,
                            workerInstance,
                            task,
                            self.name(),
                            _queue2.default.workerDeps
                          ); // Check worker instance and route the process via instance
                          if (workerInstance instanceof Worker) {
                            // start the native worker by passing task parameters and dependencies.
                            // Note: Native worker parameters can not be class or function.
                            workerInstance.postMessage({
                              args: task.args,
                              dependencies: dependencies
                            }); // Wrap the worker with promise class.
                            workerPromise = new Promise(function(resolve) {
                              // Set function to worker onmessage event for handle the repsonse of worker.
                              workerInstance.onmessage = function(response) {
                                resolve(worker.handler(response)); // Terminate browser worker.
                                workerInstance.terminate();
                              };
                            });
                          } else {
                            // This is custom worker class.
                            // Call the handle function in worker and get promise instance.
                            workerPromise = (_workerInstance$handl =
                              workerInstance.handle).call.apply(
                              _workerInstance$handl,
                              [workerInstance, task.args].concat(
                                _toConsumableArray(dependencies)
                              )
                            );
                          }
                          _context10.t1 = workerPromise; // Handle worker return process.
                          _context10.next = 13;
                          return successJobHandler.call(
                            self,
                            task,
                            workerInstance
                          );
                        case 13:
                          _context10.t2 = self;
                          _context10.t3 = _context10.sent.bind(_context10.t2);
                          _context10.t0 = _context10.t1.then.call(
                            _context10.t1,
                            _context10.t3
                          );
                          _context10.next = 18;
                          return failedJobHandler.call(self, task);
                        case 18:
                          _context10.t4 = self;
                          _context10.t5 = _context10.sent.bind(_context10.t4);
                          _context10.t0.catch // Handle errors in worker while it was running.
                            .call(_context10.t0, _context10.t5);
                        case 21:
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
      },
      {
        './channel': 13,
        './console': 15,
        './queue': 22,
        './storage-capsule': 23,
        './utils': 24,
        'babel-runtime/regenerator': 1
      }
    ],
    21: [
      function(require, module, exports) {
        'use strict';
        Object.defineProperty(exports, '__esModule', { value: true });
        require('pseudo-worker/polyfill');
        var _queue = require('./queue');
        var _queue2 = _interopRequireDefault(_queue);
        function _interopRequireDefault(obj) {
          return obj && obj.__esModule ? obj : { default: obj };
        }

        /* global window:true */

        if (typeof window !== 'undefined') {
          window.Queue = _queue2.default;
        }
        exports.default = _queue2.default;
      },
      { './queue': 22, 'pseudo-worker/polyfill': 6 }
    ],
    22: [
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
        Queue.workerDeps = {};
        Queue.worker = new _container2.default();
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

          Queue.worker.merge(workersObj);
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
      { './channel': 13, './config': 14, './container': 16 }
    ],
    23: [
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
                } else if (this.config.get('storage') === 'localstorage') {
                  return new _adapters.LocalStorageAdapter(this.config);
                }
                return new _adapters.InMemoryAdapter(this.config);
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
        './adapters': 10,
        './utils': 24,
        'babel-runtime/regenerator': 1,
        'group-by': 3
      }
    ],
    24: [
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
  [21]
);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9yZWdlbmVyYXRvci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb21wb25lbnQtcHJvcHMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZ3JvdXAtYnkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvb2JqZWN0LXBhdGgvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcHNldWRvLXdvcmtlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wc2V1ZG8td29ya2VyL3BvbHlmaWxsLmpzIiwibm9kZV9tb2R1bGVzL3JlZ2VuZXJhdG9yLXJ1bnRpbWUvcnVudGltZS1tb2R1bGUuanMiLCJub2RlX21vZHVsZXMvcmVnZW5lcmF0b3ItcnVudGltZS9ydW50aW1lLmpzIiwibm9kZV9tb2R1bGVzL3RvLWZ1bmN0aW9uL2luZGV4LmpzIiwic3JjL2FkYXB0ZXJzL2luZGV4LmpzIiwic3JjL2FkYXB0ZXJzL2lubWVtb3J5LmpzIiwic3JjL2FkYXB0ZXJzL2xvY2Fsc3RvcmFnZS5qcyIsInNyYy9jaGFubmVsLmpzIiwic3JjL2NvbmZpZy5qcyIsInNyYy9jb25zb2xlLmpzIiwic3JjL2NvbnRhaW5lci5qcyIsInNyYy9lbnVtL2NvbmZpZy5kYXRhLmpzIiwic3JjL2VudW0vbG9nLmV2ZW50cy5qcyIsInNyYy9ldmVudC5qcyIsInNyYy9oZWxwZXJzLmpzIiwic3JjL2luZGV4LmpzIiwic3JjL3F1ZXVlLmpzIiwic3JjL3N0b3JhZ2UtY2Fwc3VsZS5qcyIsInNyYy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDL0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2dEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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aEIsV0FBQSxBQUFXLFFBQVEsVUFBQSxBQUFDLEdBQU0sQ0FDeEIsUUFBQSxBQUFRLEtBQUssWUFBQSxBQUFZLE1BQVosQUFBa0IsT0FBbEIsQUFBeUIsU0FBUyxLQUFBLEFBQUssT0FBcEQsQUFBMkQsQUFDNUQsT0FGRCxHQUlBLE9BQU8sRUFBRSxRQUFBLEFBQVEsUUFBUixBQUFnQixTQUFTLENBQWxDLEFBQU8sQUFBNEIsQUFDcEMsRyxFQUVEOzs7Ozs7OzJrQkFRTyxTQUFBLEFBQVMsZUFBVCxBQUF3QixNQUFzQixDQUNuRCxJQUFJLENBQUMscUJBQUEsQUFBcUIsS0FBSyxDQUExQixBQUEwQixBQUFDLFdBQWhDLEFBQUssQUFBc0MsT0FBTyxDQUNoRCxPQUFBLEFBQU8sQUFDUixNQUNELFFBQU8sS0FBQSxBQUFLLFFBQVosQUFBb0IsQUFDckIsSyxFQUVEOzs7Ozs7Ozt5c0JBU08sU0FBQSxBQUFTLEtBQVQsQUFBYyxHQUFkLEFBQXdCLEdBQWUsQ0FDNUMsT0FBTyxFQUFBLEFBQUUsWUFBWSxFQUFyQixBQUF1QixBQUN4QixVLEVBRUQ7Ozs7Ozs7O293QkFTTyxTQUFBLEFBQVMsS0FBVCxBQUFjLEdBQWQsQUFBd0IsR0FBZSxDQUM1QyxPQUFPLEVBQUEsQUFBRSxZQUFZLEVBQXJCLEFBQXVCLEFBQ3hCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicmVnZW5lcmF0b3ItcnVudGltZVwiKTtcbiIsIi8qKlxuICogR2xvYmFsIE5hbWVzXG4gKi9cblxudmFyIGdsb2JhbHMgPSAvXFxiKEFycmF5fERhdGV8T2JqZWN0fE1hdGh8SlNPTilcXGIvZztcblxuLyoqXG4gKiBSZXR1cm4gaW1tZWRpYXRlIGlkZW50aWZpZXJzIHBhcnNlZCBmcm9tIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSBtYXAgZnVuY3Rpb24gb3IgcHJlZml4XG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdHIsIGZuKXtcbiAgdmFyIHAgPSB1bmlxdWUocHJvcHMoc3RyKSk7XG4gIGlmIChmbiAmJiAnc3RyaW5nJyA9PSB0eXBlb2YgZm4pIGZuID0gcHJlZml4ZWQoZm4pO1xuICBpZiAoZm4pIHJldHVybiBtYXAoc3RyLCBwLCBmbik7XG4gIHJldHVybiBwO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gaW1tZWRpYXRlIGlkZW50aWZpZXJzIGluIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcHJvcHMoc3RyKSB7XG4gIHJldHVybiBzdHJcbiAgICAucmVwbGFjZSgvXFwuXFx3K3xcXHcrICpcXCh8XCJbXlwiXSpcInwnW14nXSonfFxcLyhbXi9dKylcXC8vZywgJycpXG4gICAgLnJlcGxhY2UoZ2xvYmFscywgJycpXG4gICAgLm1hdGNoKC9bYS16QS1aX11cXHcqL2cpXG4gICAgfHwgW107XG59XG5cbi8qKlxuICogUmV0dXJuIGBzdHJgIHdpdGggYHByb3BzYCBtYXBwZWQgd2l0aCBgZm5gLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7QXJyYXl9IHByb3BzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbWFwKHN0ciwgcHJvcHMsIGZuKSB7XG4gIHZhciByZSA9IC9cXC5cXHcrfFxcdysgKlxcKHxcIlteXCJdKlwifCdbXiddKid8XFwvKFteL10rKVxcL3xbYS16QS1aX11cXHcqL2c7XG4gIHJldHVybiBzdHIucmVwbGFjZShyZSwgZnVuY3Rpb24oXyl7XG4gICAgaWYgKCcoJyA9PSBfW18ubGVuZ3RoIC0gMV0pIHJldHVybiBmbihfKTtcbiAgICBpZiAoIX5wcm9wcy5pbmRleE9mKF8pKSByZXR1cm4gXztcbiAgICByZXR1cm4gZm4oXyk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFJldHVybiB1bmlxdWUgYXJyYXkuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHVuaXF1ZShhcnIpIHtcbiAgdmFyIHJldCA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKH5yZXQuaW5kZXhPZihhcnJbaV0pKSBjb250aW51ZTtcbiAgICByZXQucHVzaChhcnJbaV0pO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn1cblxuLyoqXG4gKiBNYXAgd2l0aCBwcmVmaXggYHN0cmAuXG4gKi9cblxuZnVuY3Rpb24gcHJlZml4ZWQoc3RyKSB7XG4gIHJldHVybiBmdW5jdGlvbihfKXtcbiAgICByZXR1cm4gc3RyICsgXztcbiAgfTtcbn1cbiIsIlxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciB0b0Z1bmN0aW9uID0gcmVxdWlyZSgndG8tZnVuY3Rpb24nKTtcblxuLyoqXG4gKiBHcm91cCBgYXJyYCB3aXRoIGNhbGxiYWNrIGBmbih2YWwsIGkpYC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJcbiAqIEBwYXJhbSB7RnVuY3Rpb258U3RyaW5nfSBmbiBvciBwcm9wXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcnIsIGZuKXtcbiAgdmFyIHJldCA9IHt9O1xuICB2YXIgcHJvcDtcbiAgZm4gPSB0b0Z1bmN0aW9uKGZuKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7ICsraSkge1xuICAgIHByb3AgPSBmbihhcnJbaV0sIGkpO1xuICAgIHJldFtwcm9wXSA9IHJldFtwcm9wXSB8fCBbXTtcbiAgICByZXRbcHJvcF0ucHVzaChhcnJbaV0pO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn07IiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KXtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qaXN0YW5idWwgaWdub3JlIG5leHQ6Y2FudCB0ZXN0Ki9cbiAgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKFtdLCBmYWN0b3J5KTtcbiAgfSBlbHNlIHtcbiAgICAvLyBCcm93c2VyIGdsb2JhbHNcbiAgICByb290Lm9iamVjdFBhdGggPSBmYWN0b3J5KCk7XG4gIH1cbn0pKHRoaXMsIGZ1bmN0aW9uKCl7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgdG9TdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuICBmdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgICBpZihvYmogPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIC8vdG8gaGFuZGxlIG9iamVjdHMgd2l0aCBudWxsIHByb3RvdHlwZXMgKHRvbyBlZGdlIGNhc2U/KVxuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKVxuICB9XG5cbiAgZnVuY3Rpb24gaXNFbXB0eSh2YWx1ZSl7XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmIChpc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGZvciAodmFyIGkgaW4gdmFsdWUpIHtcbiAgICAgICAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgaSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRvU3RyaW5nKHR5cGUpe1xuICAgIHJldHVybiB0b1N0ci5jYWxsKHR5cGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNPYmplY3Qob2JqKXtcbiAgICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgdG9TdHJpbmcob2JqKSA9PT0gXCJbb2JqZWN0IE9iamVjdF1cIjtcbiAgfVxuXG4gIHZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbihvYmope1xuICAgIC8qaXN0YW5idWwgaWdub3JlIG5leHQ6Y2FudCB0ZXN0Ki9cbiAgICByZXR1cm4gdG9TdHIuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNCb29sZWFuKG9iail7XG4gICAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdib29sZWFuJyB8fCB0b1N0cmluZyhvYmopID09PSAnW29iamVjdCBCb29sZWFuXSc7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRLZXkoa2V5KXtcbiAgICB2YXIgaW50S2V5ID0gcGFyc2VJbnQoa2V5KTtcbiAgICBpZiAoaW50S2V5LnRvU3RyaW5nKCkgPT09IGtleSkge1xuICAgICAgcmV0dXJuIGludEtleTtcbiAgICB9XG4gICAgcmV0dXJuIGtleTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZhY3Rvcnkob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG5cbiAgICB2YXIgb2JqZWN0UGF0aCA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iamVjdFBhdGgpLnJlZHVjZShmdW5jdGlvbihwcm94eSwgcHJvcCkge1xuICAgICAgICBpZihwcm9wID09PSAnY3JlYXRlJykge1xuICAgICAgICAgIHJldHVybiBwcm94eTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qaXN0YW5idWwgaWdub3JlIGVsc2UqL1xuICAgICAgICBpZiAodHlwZW9mIG9iamVjdFBhdGhbcHJvcF0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBwcm94eVtwcm9wXSA9IG9iamVjdFBhdGhbcHJvcF0uYmluZChvYmplY3RQYXRoLCBvYmopO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHByb3h5O1xuICAgICAgfSwge30pO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBoYXNTaGFsbG93UHJvcGVydHkob2JqLCBwcm9wKSB7XG4gICAgICByZXR1cm4gKG9wdGlvbnMuaW5jbHVkZUluaGVyaXRlZFByb3BzIHx8ICh0eXBlb2YgcHJvcCA9PT0gJ251bWJlcicgJiYgQXJyYXkuaXNBcnJheShvYmopKSB8fCBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApKVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFNoYWxsb3dQcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgICAgIGlmIChoYXNTaGFsbG93UHJvcGVydHkob2JqLCBwcm9wKSkge1xuICAgICAgICByZXR1cm4gb2JqW3Byb3BdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldChvYmosIHBhdGgsIHZhbHVlLCBkb05vdFJlcGxhY2Upe1xuICAgICAgaWYgKHR5cGVvZiBwYXRoID09PSAnbnVtYmVyJykge1xuICAgICAgICBwYXRoID0gW3BhdGhdO1xuICAgICAgfVxuICAgICAgaWYgKCFwYXRoIHx8IHBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHBhdGggPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBzZXQob2JqLCBwYXRoLnNwbGl0KCcuJykubWFwKGdldEtleSksIHZhbHVlLCBkb05vdFJlcGxhY2UpO1xuICAgICAgfVxuICAgICAgdmFyIGN1cnJlbnRQYXRoID0gcGF0aFswXTtcbiAgICAgIHZhciBjdXJyZW50VmFsdWUgPSBnZXRTaGFsbG93UHJvcGVydHkob2JqLCBjdXJyZW50UGF0aCk7XG4gICAgICBpZiAocGF0aC5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgaWYgKGN1cnJlbnRWYWx1ZSA9PT0gdm9pZCAwIHx8ICFkb05vdFJlcGxhY2UpIHtcbiAgICAgICAgICBvYmpbY3VycmVudFBhdGhdID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGN1cnJlbnRWYWx1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGN1cnJlbnRWYWx1ZSA9PT0gdm9pZCAwKSB7XG4gICAgICAgIC8vY2hlY2sgaWYgd2UgYXNzdW1lIGFuIGFycmF5XG4gICAgICAgIGlmKHR5cGVvZiBwYXRoWzFdID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIG9ialtjdXJyZW50UGF0aF0gPSBbXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvYmpbY3VycmVudFBhdGhdID0ge307XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNldChvYmpbY3VycmVudFBhdGhdLCBwYXRoLnNsaWNlKDEpLCB2YWx1ZSwgZG9Ob3RSZXBsYWNlKTtcbiAgICB9XG5cbiAgICBvYmplY3RQYXRoLmhhcyA9IGZ1bmN0aW9uIChvYmosIHBhdGgpIHtcbiAgICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcGF0aCA9IFtwYXRoXTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHBhdGggPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHBhdGggPSBwYXRoLnNwbGl0KCcuJyk7XG4gICAgICB9XG5cbiAgICAgIGlmICghcGF0aCB8fCBwYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gISFvYmo7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGF0aC5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgaiA9IGdldEtleShwYXRoW2ldKTtcblxuICAgICAgICBpZigodHlwZW9mIGogPT09ICdudW1iZXInICYmIGlzQXJyYXkob2JqKSAmJiBqIDwgb2JqLmxlbmd0aCkgfHxcbiAgICAgICAgICAob3B0aW9ucy5pbmNsdWRlSW5oZXJpdGVkUHJvcHMgPyAoaiBpbiBPYmplY3Qob2JqKSkgOiBoYXNPd25Qcm9wZXJ0eShvYmosIGopKSkge1xuICAgICAgICAgIG9iaiA9IG9ialtqXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIG9iamVjdFBhdGguZW5zdXJlRXhpc3RzID0gZnVuY3Rpb24gKG9iaiwgcGF0aCwgdmFsdWUpe1xuICAgICAgcmV0dXJuIHNldChvYmosIHBhdGgsIHZhbHVlLCB0cnVlKTtcbiAgICB9O1xuXG4gICAgb2JqZWN0UGF0aC5zZXQgPSBmdW5jdGlvbiAob2JqLCBwYXRoLCB2YWx1ZSwgZG9Ob3RSZXBsYWNlKXtcbiAgICAgIHJldHVybiBzZXQob2JqLCBwYXRoLCB2YWx1ZSwgZG9Ob3RSZXBsYWNlKTtcbiAgICB9O1xuXG4gICAgb2JqZWN0UGF0aC5pbnNlcnQgPSBmdW5jdGlvbiAob2JqLCBwYXRoLCB2YWx1ZSwgYXQpe1xuICAgICAgdmFyIGFyciA9IG9iamVjdFBhdGguZ2V0KG9iaiwgcGF0aCk7XG4gICAgICBhdCA9IH5+YXQ7XG4gICAgICBpZiAoIWlzQXJyYXkoYXJyKSkge1xuICAgICAgICBhcnIgPSBbXTtcbiAgICAgICAgb2JqZWN0UGF0aC5zZXQob2JqLCBwYXRoLCBhcnIpO1xuICAgICAgfVxuICAgICAgYXJyLnNwbGljZShhdCwgMCwgdmFsdWUpO1xuICAgIH07XG5cbiAgICBvYmplY3RQYXRoLmVtcHR5ID0gZnVuY3Rpb24ob2JqLCBwYXRoKSB7XG4gICAgICBpZiAoaXNFbXB0eShwYXRoKSkge1xuICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgfVxuICAgICAgaWYgKG9iaiA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICB9XG5cbiAgICAgIHZhciB2YWx1ZSwgaTtcbiAgICAgIGlmICghKHZhbHVlID0gb2JqZWN0UGF0aC5nZXQob2JqLCBwYXRoKSkpIHtcbiAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdFBhdGguc2V0KG9iaiwgcGF0aCwgJycpO1xuICAgICAgfSBlbHNlIGlmIChpc0Jvb2xlYW4odmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBvYmplY3RQYXRoLnNldChvYmosIHBhdGgsIGZhbHNlKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgICAgICByZXR1cm4gb2JqZWN0UGF0aC5zZXQob2JqLCBwYXRoLCAwKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgdmFsdWUubGVuZ3RoID0gMDtcbiAgICAgIH0gZWxzZSBpZiAoaXNPYmplY3QodmFsdWUpKSB7XG4gICAgICAgIGZvciAoaSBpbiB2YWx1ZSkge1xuICAgICAgICAgIGlmIChoYXNTaGFsbG93UHJvcGVydHkodmFsdWUsIGkpKSB7XG4gICAgICAgICAgICBkZWxldGUgdmFsdWVbaV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gb2JqZWN0UGF0aC5zZXQob2JqLCBwYXRoLCBudWxsKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgb2JqZWN0UGF0aC5wdXNoID0gZnVuY3Rpb24gKG9iaiwgcGF0aCAvKiwgdmFsdWVzICovKXtcbiAgICAgIHZhciBhcnIgPSBvYmplY3RQYXRoLmdldChvYmosIHBhdGgpO1xuICAgICAgaWYgKCFpc0FycmF5KGFycikpIHtcbiAgICAgICAgYXJyID0gW107XG4gICAgICAgIG9iamVjdFBhdGguc2V0KG9iaiwgcGF0aCwgYXJyKTtcbiAgICAgIH1cblxuICAgICAgYXJyLnB1c2guYXBwbHkoYXJyLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpKTtcbiAgICB9O1xuXG4gICAgb2JqZWN0UGF0aC5jb2FsZXNjZSA9IGZ1bmN0aW9uIChvYmosIHBhdGhzLCBkZWZhdWx0VmFsdWUpIHtcbiAgICAgIHZhciB2YWx1ZTtcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHBhdGhzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGlmICgodmFsdWUgPSBvYmplY3RQYXRoLmdldChvYmosIHBhdGhzW2ldKSkgIT09IHZvaWQgMCkge1xuICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICAgIH07XG5cbiAgICBvYmplY3RQYXRoLmdldCA9IGZ1bmN0aW9uIChvYmosIHBhdGgsIGRlZmF1bHRWYWx1ZSl7XG4gICAgICBpZiAodHlwZW9mIHBhdGggPT09ICdudW1iZXInKSB7XG4gICAgICAgIHBhdGggPSBbcGF0aF07XG4gICAgICB9XG4gICAgICBpZiAoIXBhdGggfHwgcGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgIH1cbiAgICAgIGlmIChvYmogPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBwYXRoID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gb2JqZWN0UGF0aC5nZXQob2JqLCBwYXRoLnNwbGl0KCcuJyksIGRlZmF1bHRWYWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIHZhciBjdXJyZW50UGF0aCA9IGdldEtleShwYXRoWzBdKTtcbiAgICAgIHZhciBuZXh0T2JqID0gZ2V0U2hhbGxvd1Byb3BlcnR5KG9iaiwgY3VycmVudFBhdGgpXG4gICAgICBpZiAobmV4dE9iaiA9PT0gdm9pZCAwKSB7XG4gICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gbmV4dE9iajtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9iamVjdFBhdGguZ2V0KG9ialtjdXJyZW50UGF0aF0sIHBhdGguc2xpY2UoMSksIGRlZmF1bHRWYWx1ZSk7XG4gICAgfTtcblxuICAgIG9iamVjdFBhdGguZGVsID0gZnVuY3Rpb24gZGVsKG9iaiwgcGF0aCkge1xuICAgICAgaWYgKHR5cGVvZiBwYXRoID09PSAnbnVtYmVyJykge1xuICAgICAgICBwYXRoID0gW3BhdGhdO1xuICAgICAgfVxuXG4gICAgICBpZiAob2JqID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzRW1wdHkocGF0aCkpIHtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgIH1cbiAgICAgIGlmKHR5cGVvZiBwYXRoID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gb2JqZWN0UGF0aC5kZWwob2JqLCBwYXRoLnNwbGl0KCcuJykpO1xuICAgICAgfVxuXG4gICAgICB2YXIgY3VycmVudFBhdGggPSBnZXRLZXkocGF0aFswXSk7XG4gICAgICBpZiAoIWhhc1NoYWxsb3dQcm9wZXJ0eShvYmosIGN1cnJlbnRQYXRoKSkge1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgfVxuXG4gICAgICBpZihwYXRoLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgICAgICAgb2JqLnNwbGljZShjdXJyZW50UGF0aCwgMSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVsZXRlIG9ialtjdXJyZW50UGF0aF07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBvYmplY3RQYXRoLmRlbChvYmpbY3VycmVudFBhdGhdLCBwYXRoLnNsaWNlKDEpKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG5cbiAgICByZXR1cm4gb2JqZWN0UGF0aDtcbiAgfVxuXG4gIHZhciBtb2QgPSBmYWN0b3J5KCk7XG4gIG1vZC5jcmVhdGUgPSBmYWN0b3J5O1xuICBtb2Qud2l0aEluaGVyaXRlZFByb3BzID0gZmFjdG9yeSh7aW5jbHVkZUluaGVyaXRlZFByb3BzOiB0cnVlfSlcbiAgcmV0dXJuIG1vZDtcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBkb0V2YWwoc2VsZiwgX19wc2V1ZG93b3JrZXJfc2NyaXB0KSB7XG4gIC8qIGpzaGludCB1bnVzZWQ6ZmFsc2UgKi9cbiAgKGZ1bmN0aW9uICgpIHtcbiAgICAvKiBqc2hpbnQgZXZpbDp0cnVlICovXG4gICAgZXZhbChfX3BzZXVkb3dvcmtlcl9zY3JpcHQpO1xuICB9KS5jYWxsKGdsb2JhbCk7XG59XG5cbmZ1bmN0aW9uIFBzZXVkb1dvcmtlcihwYXRoKSB7XG4gIHZhciBtZXNzYWdlTGlzdGVuZXJzID0gW107XG4gIHZhciBlcnJvckxpc3RlbmVycyA9IFtdO1xuICB2YXIgd29ya2VyTWVzc2FnZUxpc3RlbmVycyA9IFtdO1xuICB2YXIgd29ya2VyRXJyb3JMaXN0ZW5lcnMgPSBbXTtcbiAgdmFyIHBvc3RNZXNzYWdlTGlzdGVuZXJzID0gW107XG4gIHZhciB0ZXJtaW5hdGVkID0gZmFsc2U7XG4gIHZhciBzY3JpcHQ7XG4gIHZhciB3b3JrZXJTZWxmO1xuXG4gIHZhciBhcGkgPSB0aGlzO1xuXG4gIC8vIGN1c3RvbSBlYWNoIGxvb3AgaXMgZm9yIElFOCBzdXBwb3J0XG4gIGZ1bmN0aW9uIGV4ZWN1dGVFYWNoKGFyciwgZnVuKSB7XG4gICAgdmFyIGkgPSAtMTtcbiAgICB3aGlsZSAoKytpIDwgYXJyLmxlbmd0aCkge1xuICAgICAgaWYgKGFycltpXSkge1xuICAgICAgICBmdW4oYXJyW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjYWxsRXJyb3JMaXN0ZW5lcihlcnIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgICBsaXN0ZW5lcih7XG4gICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgIGVycm9yOiBlcnIsXG4gICAgICAgIG1lc3NhZ2U6IGVyci5tZXNzYWdlXG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBmdW4pIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgIGlmICh0eXBlID09PSAnbWVzc2FnZScpIHtcbiAgICAgIG1lc3NhZ2VMaXN0ZW5lcnMucHVzaChmdW4pO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgICAgZXJyb3JMaXN0ZW5lcnMucHVzaChmdW4pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgZnVuKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzO1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICAgIGlmICh0eXBlID09PSAnbWVzc2FnZScpIHtcbiAgICAgICAgbGlzdGVuZXJzID0gbWVzc2FnZUxpc3RlbmVycztcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgICAgICBsaXN0ZW5lcnMgPSBlcnJvckxpc3RlbmVycztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhciBpID0gLTE7XG4gICAgICB3aGlsZSAoKytpIDwgbGlzdGVuZXJzLmxlbmd0aCkge1xuICAgICAgICB2YXIgbGlzdGVuZXIgPSBsaXN0ZW5lcnNbaV07XG4gICAgICAgIGlmIChsaXN0ZW5lciA9PT0gZnVuKSB7XG4gICAgICAgICAgZGVsZXRlIGxpc3RlbmVyc1tpXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcG9zdEVycm9yKGVycikge1xuICAgIHZhciBjYWxsRnVuID0gY2FsbEVycm9yTGlzdGVuZXIoZXJyKTtcbiAgICBpZiAodHlwZW9mIGFwaS5vbmVycm9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjYWxsRnVuKGFwaS5vbmVycm9yKTtcbiAgICB9XG4gICAgaWYgKHdvcmtlclNlbGYgJiYgdHlwZW9mIHdvcmtlclNlbGYub25lcnJvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY2FsbEZ1bih3b3JrZXJTZWxmLm9uZXJyb3IpO1xuICAgIH1cbiAgICBleGVjdXRlRWFjaChlcnJvckxpc3RlbmVycywgY2FsbEZ1bik7XG4gICAgZXhlY3V0ZUVhY2god29ya2VyRXJyb3JMaXN0ZW5lcnMsIGNhbGxGdW4pO1xuICB9XG5cbiAgZnVuY3Rpb24gcnVuUG9zdE1lc3NhZ2UobXNnKSB7XG4gICAgZnVuY3Rpb24gY2FsbEZ1bihsaXN0ZW5lcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbGlzdGVuZXIoe2RhdGE6IG1zZ30pO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHBvc3RFcnJvcihlcnIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh3b3JrZXJTZWxmICYmIHR5cGVvZiB3b3JrZXJTZWxmLm9ubWVzc2FnZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY2FsbEZ1bih3b3JrZXJTZWxmLm9ubWVzc2FnZSk7XG4gICAgfVxuICAgIGV4ZWN1dGVFYWNoKHdvcmtlck1lc3NhZ2VMaXN0ZW5lcnMsIGNhbGxGdW4pO1xuICB9XG5cbiAgZnVuY3Rpb24gcG9zdE1lc3NhZ2UobXNnKSB7XG4gICAgaWYgKHR5cGVvZiBtc2cgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Bvc3RNZXNzYWdlKCkgcmVxdWlyZXMgYW4gYXJndW1lbnQnKTtcbiAgICB9XG4gICAgaWYgKHRlcm1pbmF0ZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCFzY3JpcHQpIHtcbiAgICAgIHBvc3RNZXNzYWdlTGlzdGVuZXJzLnB1c2gobXNnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcnVuUG9zdE1lc3NhZ2UobXNnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRlcm1pbmF0ZSgpIHtcbiAgICB0ZXJtaW5hdGVkID0gdHJ1ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHdvcmtlclBvc3RNZXNzYWdlKG1zZykge1xuICAgIGlmICh0ZXJtaW5hdGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNhbGxGdW4obGlzdGVuZXIpIHtcbiAgICAgIGxpc3RlbmVyKHtcbiAgICAgICAgZGF0YTogbXNnXG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBhcGkub25tZXNzYWdlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjYWxsRnVuKGFwaS5vbm1lc3NhZ2UpO1xuICAgIH1cbiAgICBleGVjdXRlRWFjaChtZXNzYWdlTGlzdGVuZXJzLCBjYWxsRnVuKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHdvcmtlckFkZEV2ZW50TGlzdGVuZXIodHlwZSwgZnVuKSB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICBpZiAodHlwZSA9PT0gJ21lc3NhZ2UnKSB7XG4gICAgICB3b3JrZXJNZXNzYWdlTGlzdGVuZXJzLnB1c2goZnVuKTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICAgIHdvcmtlckVycm9yTGlzdGVuZXJzLnB1c2goZnVuKTtcbiAgICB9XG4gIH1cblxuICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgeGhyLm9wZW4oJ0dFVCcsIHBhdGgpO1xuICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgaWYgKHhoci5zdGF0dXMgPj0gMjAwICYmIHhoci5zdGF0dXMgPCA0MDApIHtcbiAgICAgICAgc2NyaXB0ID0geGhyLnJlc3BvbnNlVGV4dDtcbiAgICAgICAgd29ya2VyU2VsZiA9IHtcbiAgICAgICAgICBwb3N0TWVzc2FnZTogd29ya2VyUG9zdE1lc3NhZ2UsXG4gICAgICAgICAgYWRkRXZlbnRMaXN0ZW5lcjogd29ya2VyQWRkRXZlbnRMaXN0ZW5lcixcbiAgICAgICAgICBjbG9zZTogdGVybWluYXRlXG4gICAgICAgIH07XG4gICAgICAgIGRvRXZhbCh3b3JrZXJTZWxmLCBzY3JpcHQpO1xuICAgICAgICB2YXIgY3VycmVudExpc3RlbmVycyA9IHBvc3RNZXNzYWdlTGlzdGVuZXJzO1xuICAgICAgICBwb3N0TWVzc2FnZUxpc3RlbmVycyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGN1cnJlbnRMaXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBydW5Qb3N0TWVzc2FnZShjdXJyZW50TGlzdGVuZXJzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcG9zdEVycm9yKG5ldyBFcnJvcignY2Fubm90IGZpbmQgc2NyaXB0ICcgKyBwYXRoKSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHhoci5zZW5kKCk7XG5cbiAgYXBpLnBvc3RNZXNzYWdlID0gcG9zdE1lc3NhZ2U7XG4gIGFwaS5hZGRFdmVudExpc3RlbmVyID0gYWRkRXZlbnRMaXN0ZW5lcjtcbiAgYXBpLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSByZW1vdmVFdmVudExpc3RlbmVyO1xuICBhcGkudGVybWluYXRlID0gdGVybWluYXRlO1xuXG4gIHJldHVybiBhcGk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUHNldWRvV29ya2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgUHNldWRvV29ya2VyID0gcmVxdWlyZSgnLi8nKTtcblxuaWYgKHR5cGVvZiBXb3JrZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gIGdsb2JhbC5Xb3JrZXIgPSBQc2V1ZG9Xb3JrZXI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUHNldWRvV29ya2VyOyIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLy8gVGhpcyBtZXRob2Qgb2Ygb2J0YWluaW5nIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0IG5lZWRzIHRvIGJlXG4vLyBrZXB0IGlkZW50aWNhbCB0byB0aGUgd2F5IGl0IGlzIG9idGFpbmVkIGluIHJ1bnRpbWUuanNcbnZhciBnID0gKGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcyB9KSgpIHx8IEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKTtcblxuLy8gVXNlIGBnZXRPd25Qcm9wZXJ0eU5hbWVzYCBiZWNhdXNlIG5vdCBhbGwgYnJvd3NlcnMgc3VwcG9ydCBjYWxsaW5nXG4vLyBgaGFzT3duUHJvcGVydHlgIG9uIHRoZSBnbG9iYWwgYHNlbGZgIG9iamVjdCBpbiBhIHdvcmtlci4gU2VlICMxODMuXG52YXIgaGFkUnVudGltZSA9IGcucmVnZW5lcmF0b3JSdW50aW1lICYmXG4gIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGcpLmluZGV4T2YoXCJyZWdlbmVyYXRvclJ1bnRpbWVcIikgPj0gMDtcblxuLy8gU2F2ZSB0aGUgb2xkIHJlZ2VuZXJhdG9yUnVudGltZSBpbiBjYXNlIGl0IG5lZWRzIHRvIGJlIHJlc3RvcmVkIGxhdGVyLlxudmFyIG9sZFJ1bnRpbWUgPSBoYWRSdW50aW1lICYmIGcucmVnZW5lcmF0b3JSdW50aW1lO1xuXG4vLyBGb3JjZSByZWV2YWx1dGF0aW9uIG9mIHJ1bnRpbWUuanMuXG5nLnJlZ2VuZXJhdG9yUnVudGltZSA9IHVuZGVmaW5lZDtcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi9ydW50aW1lXCIpO1xuXG5pZiAoaGFkUnVudGltZSkge1xuICAvLyBSZXN0b3JlIHRoZSBvcmlnaW5hbCBydW50aW1lLlxuICBnLnJlZ2VuZXJhdG9yUnVudGltZSA9IG9sZFJ1bnRpbWU7XG59IGVsc2Uge1xuICAvLyBSZW1vdmUgdGhlIGdsb2JhbCBwcm9wZXJ0eSBhZGRlZCBieSBydW50aW1lLmpzLlxuICB0cnkge1xuICAgIGRlbGV0ZSBnLnJlZ2VuZXJhdG9yUnVudGltZTtcbiAgfSBjYXRjaChlKSB7XG4gICAgZy5yZWdlbmVyYXRvclJ1bnRpbWUgPSB1bmRlZmluZWQ7XG4gIH1cbn1cbiIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuIShmdW5jdGlvbihnbG9iYWwpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIE9wID0gT2JqZWN0LnByb3RvdHlwZTtcbiAgdmFyIGhhc093biA9IE9wLmhhc093blByb3BlcnR5O1xuICB2YXIgdW5kZWZpbmVkOyAvLyBNb3JlIGNvbXByZXNzaWJsZSB0aGFuIHZvaWQgMC5cbiAgdmFyICRTeW1ib2wgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgPyBTeW1ib2wgOiB7fTtcbiAgdmFyIGl0ZXJhdG9yU3ltYm9sID0gJFN5bWJvbC5pdGVyYXRvciB8fCBcIkBAaXRlcmF0b3JcIjtcbiAgdmFyIGFzeW5jSXRlcmF0b3JTeW1ib2wgPSAkU3ltYm9sLmFzeW5jSXRlcmF0b3IgfHwgXCJAQGFzeW5jSXRlcmF0b3JcIjtcbiAgdmFyIHRvU3RyaW5nVGFnU3ltYm9sID0gJFN5bWJvbC50b1N0cmluZ1RhZyB8fCBcIkBAdG9TdHJpbmdUYWdcIjtcblxuICB2YXIgaW5Nb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiO1xuICB2YXIgcnVudGltZSA9IGdsb2JhbC5yZWdlbmVyYXRvclJ1bnRpbWU7XG4gIGlmIChydW50aW1lKSB7XG4gICAgaWYgKGluTW9kdWxlKSB7XG4gICAgICAvLyBJZiByZWdlbmVyYXRvclJ1bnRpbWUgaXMgZGVmaW5lZCBnbG9iYWxseSBhbmQgd2UncmUgaW4gYSBtb2R1bGUsXG4gICAgICAvLyBtYWtlIHRoZSBleHBvcnRzIG9iamVjdCBpZGVudGljYWwgdG8gcmVnZW5lcmF0b3JSdW50aW1lLlxuICAgICAgbW9kdWxlLmV4cG9ydHMgPSBydW50aW1lO1xuICAgIH1cbiAgICAvLyBEb24ndCBib3RoZXIgZXZhbHVhdGluZyB0aGUgcmVzdCBvZiB0aGlzIGZpbGUgaWYgdGhlIHJ1bnRpbWUgd2FzXG4gICAgLy8gYWxyZWFkeSBkZWZpbmVkIGdsb2JhbGx5LlxuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIERlZmluZSB0aGUgcnVudGltZSBnbG9iYWxseSAoYXMgZXhwZWN0ZWQgYnkgZ2VuZXJhdGVkIGNvZGUpIGFzIGVpdGhlclxuICAvLyBtb2R1bGUuZXhwb3J0cyAoaWYgd2UncmUgaW4gYSBtb2R1bGUpIG9yIGEgbmV3LCBlbXB0eSBvYmplY3QuXG4gIHJ1bnRpbWUgPSBnbG9iYWwucmVnZW5lcmF0b3JSdW50aW1lID0gaW5Nb2R1bGUgPyBtb2R1bGUuZXhwb3J0cyA6IHt9O1xuXG4gIGZ1bmN0aW9uIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBJZiBvdXRlckZuIHByb3ZpZGVkIGFuZCBvdXRlckZuLnByb3RvdHlwZSBpcyBhIEdlbmVyYXRvciwgdGhlbiBvdXRlckZuLnByb3RvdHlwZSBpbnN0YW5jZW9mIEdlbmVyYXRvci5cbiAgICB2YXIgcHJvdG9HZW5lcmF0b3IgPSBvdXRlckZuICYmIG91dGVyRm4ucHJvdG90eXBlIGluc3RhbmNlb2YgR2VuZXJhdG9yID8gb3V0ZXJGbiA6IEdlbmVyYXRvcjtcbiAgICB2YXIgZ2VuZXJhdG9yID0gT2JqZWN0LmNyZWF0ZShwcm90b0dlbmVyYXRvci5wcm90b3R5cGUpO1xuICAgIHZhciBjb250ZXh0ID0gbmV3IENvbnRleHQodHJ5TG9jc0xpc3QgfHwgW10pO1xuXG4gICAgLy8gVGhlIC5faW52b2tlIG1ldGhvZCB1bmlmaWVzIHRoZSBpbXBsZW1lbnRhdGlvbnMgb2YgdGhlIC5uZXh0LFxuICAgIC8vIC50aHJvdywgYW5kIC5yZXR1cm4gbWV0aG9kcy5cbiAgICBnZW5lcmF0b3IuX2ludm9rZSA9IG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCk7XG5cbiAgICByZXR1cm4gZ2VuZXJhdG9yO1xuICB9XG4gIHJ1bnRpbWUud3JhcCA9IHdyYXA7XG5cbiAgLy8gVHJ5L2NhdGNoIGhlbHBlciB0byBtaW5pbWl6ZSBkZW9wdGltaXphdGlvbnMuIFJldHVybnMgYSBjb21wbGV0aW9uXG4gIC8vIHJlY29yZCBsaWtlIGNvbnRleHQudHJ5RW50cmllc1tpXS5jb21wbGV0aW9uLiBUaGlzIGludGVyZmFjZSBjb3VsZFxuICAvLyBoYXZlIGJlZW4gKGFuZCB3YXMgcHJldmlvdXNseSkgZGVzaWduZWQgdG8gdGFrZSBhIGNsb3N1cmUgdG8gYmVcbiAgLy8gaW52b2tlZCB3aXRob3V0IGFyZ3VtZW50cywgYnV0IGluIGFsbCB0aGUgY2FzZXMgd2UgY2FyZSBhYm91dCB3ZVxuICAvLyBhbHJlYWR5IGhhdmUgYW4gZXhpc3RpbmcgbWV0aG9kIHdlIHdhbnQgdG8gY2FsbCwgc28gdGhlcmUncyBubyBuZWVkXG4gIC8vIHRvIGNyZWF0ZSBhIG5ldyBmdW5jdGlvbiBvYmplY3QuIFdlIGNhbiBldmVuIGdldCBhd2F5IHdpdGggYXNzdW1pbmdcbiAgLy8gdGhlIG1ldGhvZCB0YWtlcyBleGFjdGx5IG9uZSBhcmd1bWVudCwgc2luY2UgdGhhdCBoYXBwZW5zIHRvIGJlIHRydWVcbiAgLy8gaW4gZXZlcnkgY2FzZSwgc28gd2UgZG9uJ3QgaGF2ZSB0byB0b3VjaCB0aGUgYXJndW1lbnRzIG9iamVjdC4gVGhlXG4gIC8vIG9ubHkgYWRkaXRpb25hbCBhbGxvY2F0aW9uIHJlcXVpcmVkIGlzIHRoZSBjb21wbGV0aW9uIHJlY29yZCwgd2hpY2hcbiAgLy8gaGFzIGEgc3RhYmxlIHNoYXBlIGFuZCBzbyBob3BlZnVsbHkgc2hvdWxkIGJlIGNoZWFwIHRvIGFsbG9jYXRlLlxuICBmdW5jdGlvbiB0cnlDYXRjaChmbiwgb2JqLCBhcmcpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJub3JtYWxcIiwgYXJnOiBmbi5jYWxsKG9iaiwgYXJnKSB9O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJ0aHJvd1wiLCBhcmc6IGVyciB9O1xuICAgIH1cbiAgfVxuXG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0ID0gXCJzdXNwZW5kZWRTdGFydFwiO1xuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRZaWVsZCA9IFwic3VzcGVuZGVkWWllbGRcIjtcbiAgdmFyIEdlblN0YXRlRXhlY3V0aW5nID0gXCJleGVjdXRpbmdcIjtcbiAgdmFyIEdlblN0YXRlQ29tcGxldGVkID0gXCJjb21wbGV0ZWRcIjtcblxuICAvLyBSZXR1cm5pbmcgdGhpcyBvYmplY3QgZnJvbSB0aGUgaW5uZXJGbiBoYXMgdGhlIHNhbWUgZWZmZWN0IGFzXG4gIC8vIGJyZWFraW5nIG91dCBvZiB0aGUgZGlzcGF0Y2ggc3dpdGNoIHN0YXRlbWVudC5cbiAgdmFyIENvbnRpbnVlU2VudGluZWwgPSB7fTtcblxuICAvLyBEdW1teSBjb25zdHJ1Y3RvciBmdW5jdGlvbnMgdGhhdCB3ZSB1c2UgYXMgdGhlIC5jb25zdHJ1Y3RvciBhbmRcbiAgLy8gLmNvbnN0cnVjdG9yLnByb3RvdHlwZSBwcm9wZXJ0aWVzIGZvciBmdW5jdGlvbnMgdGhhdCByZXR1cm4gR2VuZXJhdG9yXG4gIC8vIG9iamVjdHMuIEZvciBmdWxsIHNwZWMgY29tcGxpYW5jZSwgeW91IG1heSB3aXNoIHRvIGNvbmZpZ3VyZSB5b3VyXG4gIC8vIG1pbmlmaWVyIG5vdCB0byBtYW5nbGUgdGhlIG5hbWVzIG9mIHRoZXNlIHR3byBmdW5jdGlvbnMuXG4gIGZ1bmN0aW9uIEdlbmVyYXRvcigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUoKSB7fVxuXG4gIC8vIFRoaXMgaXMgYSBwb2x5ZmlsbCBmb3IgJUl0ZXJhdG9yUHJvdG90eXBlJSBmb3IgZW52aXJvbm1lbnRzIHRoYXRcbiAgLy8gZG9uJ3QgbmF0aXZlbHkgc3VwcG9ydCBpdC5cbiAgdmFyIEl0ZXJhdG9yUHJvdG90eXBlID0ge307XG4gIEl0ZXJhdG9yUHJvdG90eXBlW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB2YXIgZ2V0UHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Y7XG4gIHZhciBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSA9IGdldFByb3RvICYmIGdldFByb3RvKGdldFByb3RvKHZhbHVlcyhbXSkpKTtcbiAgaWYgKE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlICYmXG4gICAgICBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSAhPT0gT3AgJiZcbiAgICAgIGhhc093bi5jYWxsKE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlLCBpdGVyYXRvclN5bWJvbCkpIHtcbiAgICAvLyBUaGlzIGVudmlyb25tZW50IGhhcyBhIG5hdGl2ZSAlSXRlcmF0b3JQcm90b3R5cGUlOyB1c2UgaXQgaW5zdGVhZFxuICAgIC8vIG9mIHRoZSBwb2x5ZmlsbC5cbiAgICBJdGVyYXRvclByb3RvdHlwZSA9IE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlO1xuICB9XG5cbiAgdmFyIEdwID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUucHJvdG90eXBlID1cbiAgICBHZW5lcmF0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShJdGVyYXRvclByb3RvdHlwZSk7XG4gIEdlbmVyYXRvckZ1bmN0aW9uLnByb3RvdHlwZSA9IEdwLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb247XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlW3RvU3RyaW5nVGFnU3ltYm9sXSA9XG4gICAgR2VuZXJhdG9yRnVuY3Rpb24uZGlzcGxheU5hbWUgPSBcIkdlbmVyYXRvckZ1bmN0aW9uXCI7XG5cbiAgLy8gSGVscGVyIGZvciBkZWZpbmluZyB0aGUgLm5leHQsIC50aHJvdywgYW5kIC5yZXR1cm4gbWV0aG9kcyBvZiB0aGVcbiAgLy8gSXRlcmF0b3IgaW50ZXJmYWNlIGluIHRlcm1zIG9mIGEgc2luZ2xlIC5faW52b2tlIG1ldGhvZC5cbiAgZnVuY3Rpb24gZGVmaW5lSXRlcmF0b3JNZXRob2RzKHByb3RvdHlwZSkge1xuICAgIFtcIm5leHRcIiwgXCJ0aHJvd1wiLCBcInJldHVyblwiXS5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgcHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbihhcmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludm9rZShtZXRob2QsIGFyZyk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgcnVudGltZS5pc0dlbmVyYXRvckZ1bmN0aW9uID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgdmFyIGN0b3IgPSB0eXBlb2YgZ2VuRnVuID09PSBcImZ1bmN0aW9uXCIgJiYgZ2VuRnVuLmNvbnN0cnVjdG9yO1xuICAgIHJldHVybiBjdG9yXG4gICAgICA/IGN0b3IgPT09IEdlbmVyYXRvckZ1bmN0aW9uIHx8XG4gICAgICAgIC8vIEZvciB0aGUgbmF0aXZlIEdlbmVyYXRvckZ1bmN0aW9uIGNvbnN0cnVjdG9yLCB0aGUgYmVzdCB3ZSBjYW5cbiAgICAgICAgLy8gZG8gaXMgdG8gY2hlY2sgaXRzIC5uYW1lIHByb3BlcnR5LlxuICAgICAgICAoY3Rvci5kaXNwbGF5TmFtZSB8fCBjdG9yLm5hbWUpID09PSBcIkdlbmVyYXRvckZ1bmN0aW9uXCJcbiAgICAgIDogZmFsc2U7XG4gIH07XG5cbiAgcnVudGltZS5tYXJrID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgaWYgKE9iamVjdC5zZXRQcm90b3R5cGVPZikge1xuICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKGdlbkZ1biwgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnZW5GdW4uX19wcm90b19fID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gICAgICBpZiAoISh0b1N0cmluZ1RhZ1N5bWJvbCBpbiBnZW5GdW4pKSB7XG4gICAgICAgIGdlbkZ1blt0b1N0cmluZ1RhZ1N5bWJvbF0gPSBcIkdlbmVyYXRvckZ1bmN0aW9uXCI7XG4gICAgICB9XG4gICAgfVxuICAgIGdlbkZ1bi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEdwKTtcbiAgICByZXR1cm4gZ2VuRnVuO1xuICB9O1xuXG4gIC8vIFdpdGhpbiB0aGUgYm9keSBvZiBhbnkgYXN5bmMgZnVuY3Rpb24sIGBhd2FpdCB4YCBpcyB0cmFuc2Zvcm1lZCB0b1xuICAvLyBgeWllbGQgcmVnZW5lcmF0b3JSdW50aW1lLmF3cmFwKHgpYCwgc28gdGhhdCB0aGUgcnVudGltZSBjYW4gdGVzdFxuICAvLyBgaGFzT3duLmNhbGwodmFsdWUsIFwiX19hd2FpdFwiKWAgdG8gZGV0ZXJtaW5lIGlmIHRoZSB5aWVsZGVkIHZhbHVlIGlzXG4gIC8vIG1lYW50IHRvIGJlIGF3YWl0ZWQuXG4gIHJ1bnRpbWUuYXdyYXAgPSBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4geyBfX2F3YWl0OiBhcmcgfTtcbiAgfTtcblxuICBmdW5jdGlvbiBBc3luY0l0ZXJhdG9yKGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZywgcmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goZ2VuZXJhdG9yW21ldGhvZF0sIGdlbmVyYXRvciwgYXJnKTtcbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHJlamVjdChyZWNvcmQuYXJnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciByZXN1bHQgPSByZWNvcmQuYXJnO1xuICAgICAgICB2YXIgdmFsdWUgPSByZXN1bHQudmFsdWU7XG4gICAgICAgIGlmICh2YWx1ZSAmJlxuICAgICAgICAgICAgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgICAgICBoYXNPd24uY2FsbCh2YWx1ZSwgXCJfX2F3YWl0XCIpKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZS5fX2F3YWl0KS50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICBpbnZva2UoXCJuZXh0XCIsIHZhbHVlLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgaW52b2tlKFwidGhyb3dcIiwgZXJyLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSkudGhlbihmdW5jdGlvbih1bndyYXBwZWQpIHtcbiAgICAgICAgICAvLyBXaGVuIGEgeWllbGRlZCBQcm9taXNlIGlzIHJlc29sdmVkLCBpdHMgZmluYWwgdmFsdWUgYmVjb21lc1xuICAgICAgICAgIC8vIHRoZSAudmFsdWUgb2YgdGhlIFByb21pc2U8e3ZhbHVlLGRvbmV9PiByZXN1bHQgZm9yIHRoZVxuICAgICAgICAgIC8vIGN1cnJlbnQgaXRlcmF0aW9uLiBJZiB0aGUgUHJvbWlzZSBpcyByZWplY3RlZCwgaG93ZXZlciwgdGhlXG4gICAgICAgICAgLy8gcmVzdWx0IGZvciB0aGlzIGl0ZXJhdGlvbiB3aWxsIGJlIHJlamVjdGVkIHdpdGggdGhlIHNhbWVcbiAgICAgICAgICAvLyByZWFzb24uIE5vdGUgdGhhdCByZWplY3Rpb25zIG9mIHlpZWxkZWQgUHJvbWlzZXMgYXJlIG5vdFxuICAgICAgICAgIC8vIHRocm93biBiYWNrIGludG8gdGhlIGdlbmVyYXRvciBmdW5jdGlvbiwgYXMgaXMgdGhlIGNhc2VcbiAgICAgICAgICAvLyB3aGVuIGFuIGF3YWl0ZWQgUHJvbWlzZSBpcyByZWplY3RlZC4gVGhpcyBkaWZmZXJlbmNlIGluXG4gICAgICAgICAgLy8gYmVoYXZpb3IgYmV0d2VlbiB5aWVsZCBhbmQgYXdhaXQgaXMgaW1wb3J0YW50LCBiZWNhdXNlIGl0XG4gICAgICAgICAgLy8gYWxsb3dzIHRoZSBjb25zdW1lciB0byBkZWNpZGUgd2hhdCB0byBkbyB3aXRoIHRoZSB5aWVsZGVkXG4gICAgICAgICAgLy8gcmVqZWN0aW9uIChzd2FsbG93IGl0IGFuZCBjb250aW51ZSwgbWFudWFsbHkgLnRocm93IGl0IGJhY2tcbiAgICAgICAgICAvLyBpbnRvIHRoZSBnZW5lcmF0b3IsIGFiYW5kb24gaXRlcmF0aW9uLCB3aGF0ZXZlcikuIFdpdGhcbiAgICAgICAgICAvLyBhd2FpdCwgYnkgY29udHJhc3QsIHRoZXJlIGlzIG5vIG9wcG9ydHVuaXR5IHRvIGV4YW1pbmUgdGhlXG4gICAgICAgICAgLy8gcmVqZWN0aW9uIHJlYXNvbiBvdXRzaWRlIHRoZSBnZW5lcmF0b3IgZnVuY3Rpb24sIHNvIHRoZVxuICAgICAgICAgIC8vIG9ubHkgb3B0aW9uIGlzIHRvIHRocm93IGl0IGZyb20gdGhlIGF3YWl0IGV4cHJlc3Npb24sIGFuZFxuICAgICAgICAgIC8vIGxldCB0aGUgZ2VuZXJhdG9yIGZ1bmN0aW9uIGhhbmRsZSB0aGUgZXhjZXB0aW9uLlxuICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IHVud3JhcHBlZDtcbiAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH0sIHJlamVjdCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHByZXZpb3VzUHJvbWlzZTtcblxuICAgIGZ1bmN0aW9uIGVucXVldWUobWV0aG9kLCBhcmcpIHtcbiAgICAgIGZ1bmN0aW9uIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgaW52b2tlKG1ldGhvZCwgYXJnLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHByZXZpb3VzUHJvbWlzZSA9XG4gICAgICAgIC8vIElmIGVucXVldWUgaGFzIGJlZW4gY2FsbGVkIGJlZm9yZSwgdGhlbiB3ZSB3YW50IHRvIHdhaXQgdW50aWxcbiAgICAgICAgLy8gYWxsIHByZXZpb3VzIFByb21pc2VzIGhhdmUgYmVlbiByZXNvbHZlZCBiZWZvcmUgY2FsbGluZyBpbnZva2UsXG4gICAgICAgIC8vIHNvIHRoYXQgcmVzdWx0cyBhcmUgYWx3YXlzIGRlbGl2ZXJlZCBpbiB0aGUgY29ycmVjdCBvcmRlci4gSWZcbiAgICAgICAgLy8gZW5xdWV1ZSBoYXMgbm90IGJlZW4gY2FsbGVkIGJlZm9yZSwgdGhlbiBpdCBpcyBpbXBvcnRhbnQgdG9cbiAgICAgICAgLy8gY2FsbCBpbnZva2UgaW1tZWRpYXRlbHksIHdpdGhvdXQgd2FpdGluZyBvbiBhIGNhbGxiYWNrIHRvIGZpcmUsXG4gICAgICAgIC8vIHNvIHRoYXQgdGhlIGFzeW5jIGdlbmVyYXRvciBmdW5jdGlvbiBoYXMgdGhlIG9wcG9ydHVuaXR5IHRvIGRvXG4gICAgICAgIC8vIGFueSBuZWNlc3Nhcnkgc2V0dXAgaW4gYSBwcmVkaWN0YWJsZSB3YXkuIFRoaXMgcHJlZGljdGFiaWxpdHlcbiAgICAgICAgLy8gaXMgd2h5IHRoZSBQcm9taXNlIGNvbnN0cnVjdG9yIHN5bmNocm9ub3VzbHkgaW52b2tlcyBpdHNcbiAgICAgICAgLy8gZXhlY3V0b3IgY2FsbGJhY2ssIGFuZCB3aHkgYXN5bmMgZnVuY3Rpb25zIHN5bmNocm9ub3VzbHlcbiAgICAgICAgLy8gZXhlY3V0ZSBjb2RlIGJlZm9yZSB0aGUgZmlyc3QgYXdhaXQuIFNpbmNlIHdlIGltcGxlbWVudCBzaW1wbGVcbiAgICAgICAgLy8gYXN5bmMgZnVuY3Rpb25zIGluIHRlcm1zIG9mIGFzeW5jIGdlbmVyYXRvcnMsIGl0IGlzIGVzcGVjaWFsbHlcbiAgICAgICAgLy8gaW1wb3J0YW50IHRvIGdldCB0aGlzIHJpZ2h0LCBldmVuIHRob3VnaCBpdCByZXF1aXJlcyBjYXJlLlxuICAgICAgICBwcmV2aW91c1Byb21pc2UgPyBwcmV2aW91c1Byb21pc2UudGhlbihcbiAgICAgICAgICBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZyxcbiAgICAgICAgICAvLyBBdm9pZCBwcm9wYWdhdGluZyBmYWlsdXJlcyB0byBQcm9taXNlcyByZXR1cm5lZCBieSBsYXRlclxuICAgICAgICAgIC8vIGludm9jYXRpb25zIG9mIHRoZSBpdGVyYXRvci5cbiAgICAgICAgICBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZ1xuICAgICAgICApIDogY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcoKTtcbiAgICB9XG5cbiAgICAvLyBEZWZpbmUgdGhlIHVuaWZpZWQgaGVscGVyIG1ldGhvZCB0aGF0IGlzIHVzZWQgdG8gaW1wbGVtZW50IC5uZXh0LFxuICAgIC8vIC50aHJvdywgYW5kIC5yZXR1cm4gKHNlZSBkZWZpbmVJdGVyYXRvck1ldGhvZHMpLlxuICAgIHRoaXMuX2ludm9rZSA9IGVucXVldWU7XG4gIH1cblxuICBkZWZpbmVJdGVyYXRvck1ldGhvZHMoQXN5bmNJdGVyYXRvci5wcm90b3R5cGUpO1xuICBBc3luY0l0ZXJhdG9yLnByb3RvdHlwZVthc3luY0l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgcnVudGltZS5Bc3luY0l0ZXJhdG9yID0gQXN5bmNJdGVyYXRvcjtcblxuICAvLyBOb3RlIHRoYXQgc2ltcGxlIGFzeW5jIGZ1bmN0aW9ucyBhcmUgaW1wbGVtZW50ZWQgb24gdG9wIG9mXG4gIC8vIEFzeW5jSXRlcmF0b3Igb2JqZWN0czsgdGhleSBqdXN0IHJldHVybiBhIFByb21pc2UgZm9yIHRoZSB2YWx1ZSBvZlxuICAvLyB0aGUgZmluYWwgcmVzdWx0IHByb2R1Y2VkIGJ5IHRoZSBpdGVyYXRvci5cbiAgcnVudGltZS5hc3luYyA9IGZ1bmN0aW9uKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSB7XG4gICAgdmFyIGl0ZXIgPSBuZXcgQXN5bmNJdGVyYXRvcihcbiAgICAgIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpXG4gICAgKTtcblxuICAgIHJldHVybiBydW50aW1lLmlzR2VuZXJhdG9yRnVuY3Rpb24ob3V0ZXJGbilcbiAgICAgID8gaXRlciAvLyBJZiBvdXRlckZuIGlzIGEgZ2VuZXJhdG9yLCByZXR1cm4gdGhlIGZ1bGwgaXRlcmF0b3IuXG4gICAgICA6IGl0ZXIubmV4dCgpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdC5kb25lID8gcmVzdWx0LnZhbHVlIDogaXRlci5uZXh0KCk7XG4gICAgICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCkge1xuICAgIHZhciBzdGF0ZSA9IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQ7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnKSB7XG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlRXhlY3V0aW5nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IHJ1bm5pbmdcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVDb21wbGV0ZWQpIHtcbiAgICAgICAgaWYgKG1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgdGhyb3cgYXJnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQmUgZm9yZ2l2aW5nLCBwZXIgMjUuMy4zLjMuMyBvZiB0aGUgc3BlYzpcbiAgICAgICAgLy8gaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLWdlbmVyYXRvcnJlc3VtZVxuICAgICAgICByZXR1cm4gZG9uZVJlc3VsdCgpO1xuICAgICAgfVxuXG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IG1ldGhvZDtcbiAgICAgIGNvbnRleHQuYXJnID0gYXJnO1xuXG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICB2YXIgZGVsZWdhdGUgPSBjb250ZXh0LmRlbGVnYXRlO1xuICAgICAgICBpZiAoZGVsZWdhdGUpIHtcbiAgICAgICAgICB2YXIgZGVsZWdhdGVSZXN1bHQgPSBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KTtcbiAgICAgICAgICBpZiAoZGVsZWdhdGVSZXN1bHQpIHtcbiAgICAgICAgICAgIGlmIChkZWxlZ2F0ZVJlc3VsdCA9PT0gQ29udGludWVTZW50aW5lbCkgY29udGludWU7XG4gICAgICAgICAgICByZXR1cm4gZGVsZWdhdGVSZXN1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAgIC8vIFNldHRpbmcgY29udGV4dC5fc2VudCBmb3IgbGVnYWN5IHN1cHBvcnQgb2YgQmFiZWwnc1xuICAgICAgICAgIC8vIGZ1bmN0aW9uLnNlbnQgaW1wbGVtZW50YXRpb24uXG4gICAgICAgICAgY29udGV4dC5zZW50ID0gY29udGV4dC5fc2VudCA9IGNvbnRleHQuYXJnO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydCkge1xuICAgICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAgIHRocm93IGNvbnRleHQuYXJnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oY29udGV4dC5hcmcpO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dC5tZXRob2QgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgICBjb250ZXh0LmFicnVwdChcInJldHVyblwiLCBjb250ZXh0LmFyZyk7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZSA9IEdlblN0YXRlRXhlY3V0aW5nO1xuXG4gICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChpbm5lckZuLCBzZWxmLCBjb250ZXh0KTtcbiAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiKSB7XG4gICAgICAgICAgLy8gSWYgYW4gZXhjZXB0aW9uIGlzIHRocm93biBmcm9tIGlubmVyRm4sIHdlIGxlYXZlIHN0YXRlID09PVxuICAgICAgICAgIC8vIEdlblN0YXRlRXhlY3V0aW5nIGFuZCBsb29wIGJhY2sgZm9yIGFub3RoZXIgaW52b2NhdGlvbi5cbiAgICAgICAgICBzdGF0ZSA9IGNvbnRleHQuZG9uZVxuICAgICAgICAgICAgPyBHZW5TdGF0ZUNvbXBsZXRlZFxuICAgICAgICAgICAgOiBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkO1xuXG4gICAgICAgICAgaWYgKHJlY29yZC5hcmcgPT09IENvbnRpbnVlU2VudGluZWwpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogcmVjb3JkLmFyZyxcbiAgICAgICAgICAgIGRvbmU6IGNvbnRleHQuZG9uZVxuICAgICAgICAgIH07XG5cbiAgICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAvLyBEaXNwYXRjaCB0aGUgZXhjZXB0aW9uIGJ5IGxvb3BpbmcgYmFjayBhcm91bmQgdG8gdGhlXG4gICAgICAgICAgLy8gY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihjb250ZXh0LmFyZykgY2FsbCBhYm92ZS5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gQ2FsbCBkZWxlZ2F0ZS5pdGVyYXRvcltjb250ZXh0Lm1ldGhvZF0oY29udGV4dC5hcmcpIGFuZCBoYW5kbGUgdGhlXG4gIC8vIHJlc3VsdCwgZWl0aGVyIGJ5IHJldHVybmluZyBhIHsgdmFsdWUsIGRvbmUgfSByZXN1bHQgZnJvbSB0aGVcbiAgLy8gZGVsZWdhdGUgaXRlcmF0b3IsIG9yIGJ5IG1vZGlmeWluZyBjb250ZXh0Lm1ldGhvZCBhbmQgY29udGV4dC5hcmcsXG4gIC8vIHNldHRpbmcgY29udGV4dC5kZWxlZ2F0ZSB0byBudWxsLCBhbmQgcmV0dXJuaW5nIHRoZSBDb250aW51ZVNlbnRpbmVsLlxuICBmdW5jdGlvbiBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIG1ldGhvZCA9IGRlbGVnYXRlLml0ZXJhdG9yW2NvbnRleHQubWV0aG9kXTtcbiAgICBpZiAobWV0aG9kID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIEEgLnRocm93IG9yIC5yZXR1cm4gd2hlbiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIG5vIC50aHJvd1xuICAgICAgLy8gbWV0aG9kIGFsd2F5cyB0ZXJtaW5hdGVzIHRoZSB5aWVsZCogbG9vcC5cbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICBpZiAoZGVsZWdhdGUuaXRlcmF0b3IucmV0dXJuKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGhhcyBhIHJldHVybiBtZXRob2QsIGdpdmUgaXQgYVxuICAgICAgICAgIC8vIGNoYW5jZSB0byBjbGVhbiB1cC5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwicmV0dXJuXCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCk7XG5cbiAgICAgICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgLy8gSWYgbWF5YmVJbnZva2VEZWxlZ2F0ZShjb250ZXh0KSBjaGFuZ2VkIGNvbnRleHQubWV0aG9kIGZyb21cbiAgICAgICAgICAgIC8vIFwicmV0dXJuXCIgdG8gXCJ0aHJvd1wiLCBsZXQgdGhhdCBvdmVycmlkZSB0aGUgVHlwZUVycm9yIGJlbG93LlxuICAgICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgIGNvbnRleHQuYXJnID0gbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICBcIlRoZSBpdGVyYXRvciBkb2VzIG5vdCBwcm92aWRlIGEgJ3Rocm93JyBtZXRob2RcIik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChtZXRob2QsIGRlbGVnYXRlLml0ZXJhdG9yLCBjb250ZXh0LmFyZyk7XG5cbiAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICBjb250ZXh0LmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIHZhciBpbmZvID0gcmVjb3JkLmFyZztcblxuICAgIGlmICghIGluZm8pIHtcbiAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgY29udGV4dC5hcmcgPSBuZXcgVHlwZUVycm9yKFwiaXRlcmF0b3IgcmVzdWx0IGlzIG5vdCBhbiBvYmplY3RcIik7XG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIGlmIChpbmZvLmRvbmUpIHtcbiAgICAgIC8vIEFzc2lnbiB0aGUgcmVzdWx0IG9mIHRoZSBmaW5pc2hlZCBkZWxlZ2F0ZSB0byB0aGUgdGVtcG9yYXJ5XG4gICAgICAvLyB2YXJpYWJsZSBzcGVjaWZpZWQgYnkgZGVsZWdhdGUucmVzdWx0TmFtZSAoc2VlIGRlbGVnYXRlWWllbGQpLlxuICAgICAgY29udGV4dFtkZWxlZ2F0ZS5yZXN1bHROYW1lXSA9IGluZm8udmFsdWU7XG5cbiAgICAgIC8vIFJlc3VtZSBleGVjdXRpb24gYXQgdGhlIGRlc2lyZWQgbG9jYXRpb24gKHNlZSBkZWxlZ2F0ZVlpZWxkKS5cbiAgICAgIGNvbnRleHQubmV4dCA9IGRlbGVnYXRlLm5leHRMb2M7XG5cbiAgICAgIC8vIElmIGNvbnRleHQubWV0aG9kIHdhcyBcInRocm93XCIgYnV0IHRoZSBkZWxlZ2F0ZSBoYW5kbGVkIHRoZVxuICAgICAgLy8gZXhjZXB0aW9uLCBsZXQgdGhlIG91dGVyIGdlbmVyYXRvciBwcm9jZWVkIG5vcm1hbGx5LiBJZlxuICAgICAgLy8gY29udGV4dC5tZXRob2Qgd2FzIFwibmV4dFwiLCBmb3JnZXQgY29udGV4dC5hcmcgc2luY2UgaXQgaGFzIGJlZW5cbiAgICAgIC8vIFwiY29uc3VtZWRcIiBieSB0aGUgZGVsZWdhdGUgaXRlcmF0b3IuIElmIGNvbnRleHQubWV0aG9kIHdhc1xuICAgICAgLy8gXCJyZXR1cm5cIiwgYWxsb3cgdGhlIG9yaWdpbmFsIC5yZXR1cm4gY2FsbCB0byBjb250aW51ZSBpbiB0aGVcbiAgICAgIC8vIG91dGVyIGdlbmVyYXRvci5cbiAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCAhPT0gXCJyZXR1cm5cIikge1xuICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBSZS15aWVsZCB0aGUgcmVzdWx0IHJldHVybmVkIGJ5IHRoZSBkZWxlZ2F0ZSBtZXRob2QuXG4gICAgICByZXR1cm4gaW5mbztcbiAgICB9XG5cbiAgICAvLyBUaGUgZGVsZWdhdGUgaXRlcmF0b3IgaXMgZmluaXNoZWQsIHNvIGZvcmdldCBpdCBhbmQgY29udGludWUgd2l0aFxuICAgIC8vIHRoZSBvdXRlciBnZW5lcmF0b3IuXG4gICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gIH1cblxuICAvLyBEZWZpbmUgR2VuZXJhdG9yLnByb3RvdHlwZS57bmV4dCx0aHJvdyxyZXR1cm59IGluIHRlcm1zIG9mIHRoZVxuICAvLyB1bmlmaWVkIC5faW52b2tlIGhlbHBlciBtZXRob2QuXG4gIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhHcCk7XG5cbiAgR3BbdG9TdHJpbmdUYWdTeW1ib2xdID0gXCJHZW5lcmF0b3JcIjtcblxuICAvLyBBIEdlbmVyYXRvciBzaG91bGQgYWx3YXlzIHJldHVybiBpdHNlbGYgYXMgdGhlIGl0ZXJhdG9yIG9iamVjdCB3aGVuIHRoZVxuICAvLyBAQGl0ZXJhdG9yIGZ1bmN0aW9uIGlzIGNhbGxlZCBvbiBpdC4gU29tZSBicm93c2VycycgaW1wbGVtZW50YXRpb25zIG9mIHRoZVxuICAvLyBpdGVyYXRvciBwcm90b3R5cGUgY2hhaW4gaW5jb3JyZWN0bHkgaW1wbGVtZW50IHRoaXMsIGNhdXNpbmcgdGhlIEdlbmVyYXRvclxuICAvLyBvYmplY3QgdG8gbm90IGJlIHJldHVybmVkIGZyb20gdGhpcyBjYWxsLiBUaGlzIGVuc3VyZXMgdGhhdCBkb2Vzbid0IGhhcHBlbi5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWdlbmVyYXRvci9pc3N1ZXMvMjc0IGZvciBtb3JlIGRldGFpbHMuXG4gIEdwW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEdwLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwiW29iamVjdCBHZW5lcmF0b3JdXCI7XG4gIH07XG5cbiAgZnVuY3Rpb24gcHVzaFRyeUVudHJ5KGxvY3MpIHtcbiAgICB2YXIgZW50cnkgPSB7IHRyeUxvYzogbG9jc1swXSB9O1xuXG4gICAgaWYgKDEgaW4gbG9jcykge1xuICAgICAgZW50cnkuY2F0Y2hMb2MgPSBsb2NzWzFdO1xuICAgIH1cblxuICAgIGlmICgyIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmZpbmFsbHlMb2MgPSBsb2NzWzJdO1xuICAgICAgZW50cnkuYWZ0ZXJMb2MgPSBsb2NzWzNdO1xuICAgIH1cblxuICAgIHRoaXMudHJ5RW50cmllcy5wdXNoKGVudHJ5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0VHJ5RW50cnkoZW50cnkpIHtcbiAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbiB8fCB7fTtcbiAgICByZWNvcmQudHlwZSA9IFwibm9ybWFsXCI7XG4gICAgZGVsZXRlIHJlY29yZC5hcmc7XG4gICAgZW50cnkuY29tcGxldGlvbiA9IHJlY29yZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIENvbnRleHQodHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBUaGUgcm9vdCBlbnRyeSBvYmplY3QgKGVmZmVjdGl2ZWx5IGEgdHJ5IHN0YXRlbWVudCB3aXRob3V0IGEgY2F0Y2hcbiAgICAvLyBvciBhIGZpbmFsbHkgYmxvY2spIGdpdmVzIHVzIGEgcGxhY2UgdG8gc3RvcmUgdmFsdWVzIHRocm93biBmcm9tXG4gICAgLy8gbG9jYXRpb25zIHdoZXJlIHRoZXJlIGlzIG5vIGVuY2xvc2luZyB0cnkgc3RhdGVtZW50LlxuICAgIHRoaXMudHJ5RW50cmllcyA9IFt7IHRyeUxvYzogXCJyb290XCIgfV07XG4gICAgdHJ5TG9jc0xpc3QuZm9yRWFjaChwdXNoVHJ5RW50cnksIHRoaXMpO1xuICAgIHRoaXMucmVzZXQodHJ1ZSk7XG4gIH1cblxuICBydW50aW1lLmtleXMgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgIGtleXMucHVzaChrZXkpO1xuICAgIH1cbiAgICBrZXlzLnJldmVyc2UoKTtcblxuICAgIC8vIFJhdGhlciB0aGFuIHJldHVybmluZyBhbiBvYmplY3Qgd2l0aCBhIG5leHQgbWV0aG9kLCB3ZSBrZWVwXG4gICAgLy8gdGhpbmdzIHNpbXBsZSBhbmQgcmV0dXJuIHRoZSBuZXh0IGZ1bmN0aW9uIGl0c2VsZi5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgIHdoaWxlIChrZXlzLmxlbmd0aCkge1xuICAgICAgICB2YXIga2V5ID0ga2V5cy5wb3AoKTtcbiAgICAgICAgaWYgKGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgICBuZXh0LnZhbHVlID0ga2V5O1xuICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRvIGF2b2lkIGNyZWF0aW5nIGFuIGFkZGl0aW9uYWwgb2JqZWN0LCB3ZSBqdXN0IGhhbmcgdGhlIC52YWx1ZVxuICAgICAgLy8gYW5kIC5kb25lIHByb3BlcnRpZXMgb2ZmIHRoZSBuZXh0IGZ1bmN0aW9uIG9iamVjdCBpdHNlbGYuIFRoaXNcbiAgICAgIC8vIGFsc28gZW5zdXJlcyB0aGF0IHRoZSBtaW5pZmllciB3aWxsIG5vdCBhbm9ueW1pemUgdGhlIGZ1bmN0aW9uLlxuICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcbiAgICAgIHJldHVybiBuZXh0O1xuICAgIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gdmFsdWVzKGl0ZXJhYmxlKSB7XG4gICAgaWYgKGl0ZXJhYmxlKSB7XG4gICAgICB2YXIgaXRlcmF0b3JNZXRob2QgPSBpdGVyYWJsZVtpdGVyYXRvclN5bWJvbF07XG4gICAgICBpZiAoaXRlcmF0b3JNZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yTWV0aG9kLmNhbGwoaXRlcmFibGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGl0ZXJhYmxlLm5leHQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gaXRlcmFibGU7XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNOYU4oaXRlcmFibGUubGVuZ3RoKSkge1xuICAgICAgICB2YXIgaSA9IC0xLCBuZXh0ID0gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgaXRlcmFibGUubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoaGFzT3duLmNhbGwoaXRlcmFibGUsIGkpKSB7XG4gICAgICAgICAgICAgIG5leHQudmFsdWUgPSBpdGVyYWJsZVtpXTtcbiAgICAgICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIG5leHQudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcblxuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBuZXh0Lm5leHQgPSBuZXh0O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJldHVybiBhbiBpdGVyYXRvciB3aXRoIG5vIHZhbHVlcy5cbiAgICByZXR1cm4geyBuZXh0OiBkb25lUmVzdWx0IH07XG4gIH1cbiAgcnVudGltZS52YWx1ZXMgPSB2YWx1ZXM7XG5cbiAgZnVuY3Rpb24gZG9uZVJlc3VsdCgpIHtcbiAgICByZXR1cm4geyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH07XG4gIH1cblxuICBDb250ZXh0LnByb3RvdHlwZSA9IHtcbiAgICBjb25zdHJ1Y3RvcjogQ29udGV4dCxcblxuICAgIHJlc2V0OiBmdW5jdGlvbihza2lwVGVtcFJlc2V0KSB7XG4gICAgICB0aGlzLnByZXYgPSAwO1xuICAgICAgdGhpcy5uZXh0ID0gMDtcbiAgICAgIC8vIFJlc2V0dGluZyBjb250ZXh0Ll9zZW50IGZvciBsZWdhY3kgc3VwcG9ydCBvZiBCYWJlbCdzXG4gICAgICAvLyBmdW5jdGlvbi5zZW50IGltcGxlbWVudGF0aW9uLlxuICAgICAgdGhpcy5zZW50ID0gdGhpcy5fc2VudCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgIHRoaXMubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICB0aGlzLmFyZyA9IHVuZGVmaW5lZDtcblxuICAgICAgdGhpcy50cnlFbnRyaWVzLmZvckVhY2gocmVzZXRUcnlFbnRyeSk7XG5cbiAgICAgIGlmICghc2tpcFRlbXBSZXNldCkge1xuICAgICAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMpIHtcbiAgICAgICAgICAvLyBOb3Qgc3VyZSBhYm91dCB0aGUgb3B0aW1hbCBvcmRlciBvZiB0aGVzZSBjb25kaXRpb25zOlxuICAgICAgICAgIGlmIChuYW1lLmNoYXJBdCgwKSA9PT0gXCJ0XCIgJiZcbiAgICAgICAgICAgICAgaGFzT3duLmNhbGwodGhpcywgbmFtZSkgJiZcbiAgICAgICAgICAgICAgIWlzTmFOKCtuYW1lLnNsaWNlKDEpKSkge1xuICAgICAgICAgICAgdGhpc1tuYW1lXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuXG4gICAgICB2YXIgcm9vdEVudHJ5ID0gdGhpcy50cnlFbnRyaWVzWzBdO1xuICAgICAgdmFyIHJvb3RSZWNvcmQgPSByb290RW50cnkuY29tcGxldGlvbjtcbiAgICAgIGlmIChyb290UmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByb290UmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucnZhbDtcbiAgICB9LFxuXG4gICAgZGlzcGF0Y2hFeGNlcHRpb246IGZ1bmN0aW9uKGV4Y2VwdGlvbikge1xuICAgICAgaWYgKHRoaXMuZG9uZSkge1xuICAgICAgICB0aHJvdyBleGNlcHRpb247XG4gICAgICB9XG5cbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcztcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZShsb2MsIGNhdWdodCkge1xuICAgICAgICByZWNvcmQudHlwZSA9IFwidGhyb3dcIjtcbiAgICAgICAgcmVjb3JkLmFyZyA9IGV4Y2VwdGlvbjtcbiAgICAgICAgY29udGV4dC5uZXh0ID0gbG9jO1xuXG4gICAgICAgIGlmIChjYXVnaHQpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgZGlzcGF0Y2hlZCBleGNlcHRpb24gd2FzIGNhdWdodCBieSBhIGNhdGNoIGJsb2NrLFxuICAgICAgICAgIC8vIHRoZW4gbGV0IHRoYXQgY2F0Y2ggYmxvY2sgaGFuZGxlIHRoZSBleGNlcHRpb24gbm9ybWFsbHkuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAhISBjYXVnaHQ7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSBcInJvb3RcIikge1xuICAgICAgICAgIC8vIEV4Y2VwdGlvbiB0aHJvd24gb3V0c2lkZSBvZiBhbnkgdHJ5IGJsb2NrIHRoYXQgY291bGQgaGFuZGxlXG4gICAgICAgICAgLy8gaXQsIHNvIHNldCB0aGUgY29tcGxldGlvbiB2YWx1ZSBvZiB0aGUgZW50aXJlIGZ1bmN0aW9uIHRvXG4gICAgICAgICAgLy8gdGhyb3cgdGhlIGV4Y2VwdGlvbi5cbiAgICAgICAgICByZXR1cm4gaGFuZGxlKFwiZW5kXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYpIHtcbiAgICAgICAgICB2YXIgaGFzQ2F0Y2ggPSBoYXNPd24uY2FsbChlbnRyeSwgXCJjYXRjaExvY1wiKTtcbiAgICAgICAgICB2YXIgaGFzRmluYWxseSA9IGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIik7XG5cbiAgICAgICAgICBpZiAoaGFzQ2F0Y2ggJiYgaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0NhdGNoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidHJ5IHN0YXRlbWVudCB3aXRob3V0IGNhdGNoIG9yIGZpbmFsbHlcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGFicnVwdDogZnVuY3Rpb24odHlwZSwgYXJnKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIikgJiZcbiAgICAgICAgICAgIHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICB2YXIgZmluYWxseUVudHJ5ID0gZW50cnk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSAmJlxuICAgICAgICAgICh0eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICAgdHlwZSA9PT0gXCJjb250aW51ZVwiKSAmJlxuICAgICAgICAgIGZpbmFsbHlFbnRyeS50cnlMb2MgPD0gYXJnICYmXG4gICAgICAgICAgYXJnIDw9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgIC8vIElnbm9yZSB0aGUgZmluYWxseSBlbnRyeSBpZiBjb250cm9sIGlzIG5vdCBqdW1waW5nIHRvIGFcbiAgICAgICAgLy8gbG9jYXRpb24gb3V0c2lkZSB0aGUgdHJ5L2NhdGNoIGJsb2NrLlxuICAgICAgICBmaW5hbGx5RW50cnkgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVjb3JkID0gZmluYWxseUVudHJ5ID8gZmluYWxseUVudHJ5LmNvbXBsZXRpb24gOiB7fTtcbiAgICAgIHJlY29yZC50eXBlID0gdHlwZTtcbiAgICAgIHJlY29yZC5hcmcgPSBhcmc7XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkpIHtcbiAgICAgICAgdGhpcy5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgdGhpcy5uZXh0ID0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2M7XG4gICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5jb21wbGV0ZShyZWNvcmQpO1xuICAgIH0sXG5cbiAgICBjb21wbGV0ZTogZnVuY3Rpb24ocmVjb3JkLCBhZnRlckxvYykge1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICByZWNvcmQudHlwZSA9PT0gXCJjb250aW51ZVwiKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IHJlY29yZC5hcmc7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInJldHVyblwiKSB7XG4gICAgICAgIHRoaXMucnZhbCA9IHRoaXMuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgdGhpcy5tZXRob2QgPSBcInJldHVyblwiO1xuICAgICAgICB0aGlzLm5leHQgPSBcImVuZFwiO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIiAmJiBhZnRlckxvYykge1xuICAgICAgICB0aGlzLm5leHQgPSBhZnRlckxvYztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfSxcblxuICAgIGZpbmlzaDogZnVuY3Rpb24oZmluYWxseUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS5maW5hbGx5TG9jID09PSBmaW5hbGx5TG9jKSB7XG4gICAgICAgICAgdGhpcy5jb21wbGV0ZShlbnRyeS5jb21wbGV0aW9uLCBlbnRyeS5hZnRlckxvYyk7XG4gICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgXCJjYXRjaFwiOiBmdW5jdGlvbih0cnlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSB0cnlMb2MpIHtcbiAgICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcbiAgICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgdmFyIHRocm93biA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRocm93bjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUaGUgY29udGV4dC5jYXRjaCBtZXRob2QgbXVzdCBvbmx5IGJlIGNhbGxlZCB3aXRoIGEgbG9jYXRpb25cbiAgICAgIC8vIGFyZ3VtZW50IHRoYXQgY29ycmVzcG9uZHMgdG8gYSBrbm93biBjYXRjaCBibG9jay5cbiAgICAgIHRocm93IG5ldyBFcnJvcihcImlsbGVnYWwgY2F0Y2ggYXR0ZW1wdFwiKTtcbiAgICB9LFxuXG4gICAgZGVsZWdhdGVZaWVsZDogZnVuY3Rpb24oaXRlcmFibGUsIHJlc3VsdE5hbWUsIG5leHRMb2MpIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSB7XG4gICAgICAgIGl0ZXJhdG9yOiB2YWx1ZXMoaXRlcmFibGUpLFxuICAgICAgICByZXN1bHROYW1lOiByZXN1bHROYW1lLFxuICAgICAgICBuZXh0TG9jOiBuZXh0TG9jXG4gICAgICB9O1xuXG4gICAgICBpZiAodGhpcy5tZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgIC8vIERlbGliZXJhdGVseSBmb3JnZXQgdGhlIGxhc3Qgc2VudCB2YWx1ZSBzbyB0aGF0IHdlIGRvbid0XG4gICAgICAgIC8vIGFjY2lkZW50YWxseSBwYXNzIGl0IG9uIHRvIHRoZSBkZWxlZ2F0ZS5cbiAgICAgICAgdGhpcy5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cbiAgfTtcbn0pKFxuICAvLyBJbiBzbG9wcHkgbW9kZSwgdW5ib3VuZCBgdGhpc2AgcmVmZXJzIHRvIHRoZSBnbG9iYWwgb2JqZWN0LCBmYWxsYmFjayB0b1xuICAvLyBGdW5jdGlvbiBjb25zdHJ1Y3RvciBpZiB3ZSdyZSBpbiBnbG9iYWwgc3RyaWN0IG1vZGUuIFRoYXQgaXMgc2FkbHkgYSBmb3JtXG4gIC8vIG9mIGluZGlyZWN0IGV2YWwgd2hpY2ggdmlvbGF0ZXMgQ29udGVudCBTZWN1cml0eSBQb2xpY3kuXG4gIChmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMgfSkoKSB8fCBGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKClcbik7XG4iLCJcbi8qKlxuICogTW9kdWxlIERlcGVuZGVuY2llc1xuICovXG5cbnZhciBleHByO1xudHJ5IHtcbiAgZXhwciA9IHJlcXVpcmUoJ3Byb3BzJyk7XG59IGNhdGNoKGUpIHtcbiAgZXhwciA9IHJlcXVpcmUoJ2NvbXBvbmVudC1wcm9wcycpO1xufVxuXG4vKipcbiAqIEV4cG9zZSBgdG9GdW5jdGlvbigpYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRvRnVuY3Rpb247XG5cbi8qKlxuICogQ29udmVydCBgb2JqYCB0byBhIGBGdW5jdGlvbmAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gb2JqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHRvRnVuY3Rpb24ob2JqKSB7XG4gIHN3aXRjaCAoe30udG9TdHJpbmcuY2FsbChvYmopKSB7XG4gICAgY2FzZSAnW29iamVjdCBPYmplY3RdJzpcbiAgICAgIHJldHVybiBvYmplY3RUb0Z1bmN0aW9uKG9iaik7XG4gICAgY2FzZSAnW29iamVjdCBGdW5jdGlvbl0nOlxuICAgICAgcmV0dXJuIG9iajtcbiAgICBjYXNlICdbb2JqZWN0IFN0cmluZ10nOlxuICAgICAgcmV0dXJuIHN0cmluZ1RvRnVuY3Rpb24ob2JqKTtcbiAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOlxuICAgICAgcmV0dXJuIHJlZ2V4cFRvRnVuY3Rpb24ob2JqKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGRlZmF1bHRUb0Z1bmN0aW9uKG9iaik7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWZhdWx0IHRvIHN0cmljdCBlcXVhbGl0eS5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZGVmYXVsdFRvRnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiBmdW5jdGlvbihvYmope1xuICAgIHJldHVybiB2YWwgPT09IG9iajtcbiAgfTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGByZWAgdG8gYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1JlZ0V4cH0gcmVcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcmVnZXhwVG9GdW5jdGlvbihyZSkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqKXtcbiAgICByZXR1cm4gcmUudGVzdChvYmopO1xuICB9O1xufVxuXG4vKipcbiAqIENvbnZlcnQgcHJvcGVydHkgYHN0cmAgdG8gYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHN0cmluZ1RvRnVuY3Rpb24oc3RyKSB7XG4gIC8vIGltbWVkaWF0ZSBzdWNoIGFzIFwiPiAyMFwiXG4gIGlmICgvXiAqXFxXKy8udGVzdChzdHIpKSByZXR1cm4gbmV3IEZ1bmN0aW9uKCdfJywgJ3JldHVybiBfICcgKyBzdHIpO1xuXG4gIC8vIHByb3BlcnRpZXMgc3VjaCBhcyBcIm5hbWUuZmlyc3RcIiBvciBcImFnZSA+IDE4XCIgb3IgXCJhZ2UgPiAxOCAmJiBhZ2UgPCAzNlwiXG4gIHJldHVybiBuZXcgRnVuY3Rpb24oJ18nLCAncmV0dXJuICcgKyBnZXQoc3RyKSk7XG59XG5cbi8qKlxuICogQ29udmVydCBgb2JqZWN0YCB0byBhIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3RcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gb2JqZWN0VG9GdW5jdGlvbihvYmopIHtcbiAgdmFyIG1hdGNoID0ge307XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBtYXRjaFtrZXldID0gdHlwZW9mIG9ialtrZXldID09PSAnc3RyaW5nJ1xuICAgICAgPyBkZWZhdWx0VG9GdW5jdGlvbihvYmpba2V5XSlcbiAgICAgIDogdG9GdW5jdGlvbihvYmpba2V5XSk7XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbCl7XG4gICAgaWYgKHR5cGVvZiB2YWwgIT09ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG4gICAgZm9yICh2YXIga2V5IGluIG1hdGNoKSB7XG4gICAgICBpZiAoIShrZXkgaW4gdmFsKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgaWYgKCFtYXRjaFtrZXldKHZhbFtrZXldKSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbn1cblxuLyoqXG4gKiBCdWlsdCB0aGUgZ2V0dGVyIGZ1bmN0aW9uLiBTdXBwb3J0cyBnZXR0ZXIgc3R5bGUgZnVuY3Rpb25zXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZ2V0KHN0cikge1xuICB2YXIgcHJvcHMgPSBleHByKHN0cik7XG4gIGlmICghcHJvcHMubGVuZ3RoKSByZXR1cm4gJ18uJyArIHN0cjtcblxuICB2YXIgdmFsLCBpLCBwcm9wO1xuICBmb3IgKGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICBwcm9wID0gcHJvcHNbaV07XG4gICAgdmFsID0gJ18uJyArIHByb3A7XG4gICAgdmFsID0gXCIoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgXCIgKyB2YWwgKyBcIiA/IFwiICsgdmFsICsgXCIoKSA6IFwiICsgdmFsICsgXCIpXCI7XG5cbiAgICAvLyBtaW1pYyBuZWdhdGl2ZSBsb29rYmVoaW5kIHRvIGF2b2lkIHByb2JsZW1zIHdpdGggbmVzdGVkIHByb3BlcnRpZXNcbiAgICBzdHIgPSBzdHJpcE5lc3RlZChwcm9wLCBzdHIsIHZhbCk7XG4gIH1cblxuICByZXR1cm4gc3RyO1xufVxuXG4vKipcbiAqIE1pbWljIG5lZ2F0aXZlIGxvb2tiZWhpbmQgdG8gYXZvaWQgcHJvYmxlbXMgd2l0aCBuZXN0ZWQgcHJvcGVydGllcy5cbiAqXG4gKiBTZWU6IGh0dHA6Ly9ibG9nLnN0ZXZlbmxldml0aGFuLmNvbS9hcmNoaXZlcy9taW1pYy1sb29rYmVoaW5kLWphdmFzY3JpcHRcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc3RyaXBOZXN0ZWQgKHByb3AsIHN0ciwgdmFsKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZShuZXcgUmVnRXhwKCcoXFxcXC4pPycgKyBwcm9wLCAnZycpLCBmdW5jdGlvbigkMCwgJDEpIHtcbiAgICByZXR1cm4gJDEgPyAkMCA6IHZhbDtcbiAgfSk7XG59XG4iLCJpbXBvcnQgSW5NZW1vcnlBZGFwdGVyIGZyb20gJy4vaW5tZW1vcnknO1xuaW1wb3J0IExvY2FsU3RvcmFnZUFkYXB0ZXIgZnJvbSAnLi9sb2NhbHN0b3JhZ2UnO1xuXG5leHBvcnQgeyBJbk1lbW9yeUFkYXB0ZXIsIExvY2FsU3RvcmFnZUFkYXB0ZXIgfTtcbiIsIi8vIEBmbG93XG5pbXBvcnQgdHlwZSB7IElTdG9yYWdlIH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9zdG9yYWdlJztcbmltcG9ydCB0eXBlIHsgSUNvbmZpZyB9IGZyb20gJy4uL2ludGVyZmFjZXMvY29uZmlnJztcbmltcG9ydCB0eXBlIElUYXNrIGZyb20gJy4uL2ludGVyZmFjZXMvdGFzayc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEluTWVtb3J5QWRhcHRlciBpbXBsZW1lbnRzIElTdG9yYWdlIHtcbiAgY29uZmlnOiBJQ29uZmlnO1xuICBwcmVmaXg6IHN0cmluZztcbiAgc3RvcmU6IHsgW3Byb3A6IHN0cmluZ106IGFueSB9ID0ge307XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBJQ29uZmlnKSB7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5wcmVmaXggPSB0aGlzLmNvbmZpZy5nZXQoJ3ByZWZpeCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2UgaXRlbSBmcm9tIHN0b3JlIGJ5IGtleVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtQcm9taXNlPElUYXNrPn0gKGFycmF5KVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgZ2V0KG5hbWU6IHN0cmluZyk6IFByb21pc2U8SVRhc2tbXT4ge1xuICAgIGNvbnN0IGNvbGxOYW1lID0gdGhpcy5zdG9yYWdlTmFtZShuYW1lKTtcbiAgICByZXR1cm4gWy4uLnRoaXMuZ2V0Q29sbGVjdGlvbihjb2xsTmFtZSldO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBpdGVtIHRvIHN0b3JlXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSAge1N0cmluZ30gdmFsdWVcbiAgICogQHJldHVybiB7UHJvbWlzZTxBbnk+fVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogYW55W10pOiBQcm9taXNlPGFueT4ge1xuICAgIHRoaXMuc3RvcmVbdGhpcy5zdG9yYWdlTmFtZShrZXkpXSA9IFsuLi52YWx1ZV07XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEl0ZW0gY2hlY2tlciBpbiBzdG9yZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtQcm9taXNlPEJvb2xlYW4+fVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgaGFzKGtleTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLnN0b3JlLCB0aGlzLnN0b3JhZ2VOYW1lKGtleSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBpdGVtXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge1Byb21pc2U8QW55Pn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGNsZWFyKGtleTogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCByZXN1bHQgPSAoYXdhaXQgdGhpcy5oYXMoa2V5KSkgPyBkZWxldGUgdGhpcy5zdG9yZVt0aGlzLnN0b3JhZ2VOYW1lKGtleSldIDogZmFsc2U7XG4gICAgdGhpcy5zdG9yZSA9IHsgLi4udGhpcy5zdG9yZSB9O1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogQ29tcG9zZSBjb2xsZWN0aW9uIG5hbWUgYnkgc3VmZml4XG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gc3VmZml4XG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHN0b3JhZ2VOYW1lKHN1ZmZpeDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN1ZmZpeC5zdGFydHNXaXRoKHRoaXMuZ2V0UHJlZml4KCkpID8gc3VmZml4IDogYCR7dGhpcy5nZXRQcmVmaXgoKX1fJHtzdWZmaXh9YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgcHJlZml4IG9mIGNoYW5uZWwgY29sbGVjdGlvblxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBnZXRQcmVmaXgoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnLmdldCgncHJlZml4Jyk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGNvbGxlY3Rpb25cbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuICBnZXRDb2xsZWN0aW9uKG5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IGhhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLnN0b3JlLCBuYW1lKTtcbiAgICBpZiAoIWhhcykgdGhpcy5zdG9yZVtuYW1lXSA9IFtdO1xuICAgIHJldHVybiB0aGlzLnN0b3JlW25hbWVdO1xuICB9XG59XG4iLCIvLyBAZmxvd1xuaW1wb3J0IHR5cGUgeyBJU3RvcmFnZSB9IGZyb20gJy4uL2ludGVyZmFjZXMvc3RvcmFnZSc7XG5pbXBvcnQgdHlwZSB7IElDb25maWcgfSBmcm9tICcuLi9pbnRlcmZhY2VzL2NvbmZpZyc7XG5pbXBvcnQgdHlwZSBJVGFzayBmcm9tICcuLi9pbnRlcmZhY2VzL3Rhc2snO1xuXG4vKiBnbG9iYWwgbG9jYWxTdG9yYWdlICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExvY2FsU3RvcmFnZUFkYXB0ZXIgaW1wbGVtZW50cyBJU3RvcmFnZSB7XG4gIGNvbmZpZzogSUNvbmZpZztcbiAgcHJlZml4OiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBJQ29uZmlnKSB7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5wcmVmaXggPSB0aGlzLmNvbmZpZy5nZXQoJ3ByZWZpeCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2UgaXRlbSBmcm9tIGxvY2FsIHN0b3JhZ2UgYnkga2V5XG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge1Byb21pc2U8SVRhc2s+fSAoYXJyYXkpXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBnZXQobmFtZTogc3RyaW5nKTogUHJvbWlzZTxJVGFza1tdPiB7XG4gICAgY29uc3QgcmVzdWx0OiBhbnkgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLnN0b3JhZ2VOYW1lKG5hbWUpKTtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShyZXN1bHQpIHx8IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBpdGVtIHRvIGxvY2FsIHN0b3JhZ2VcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHBhcmFtICB7U3RyaW5nfSB2YWx1ZVxuICAgKiBAcmV0dXJuIHtQcm9taXNlPEFueT59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBzZXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBhbnlbXSk6IFByb21pc2U8YW55PiB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5zdG9yYWdlTmFtZShrZXkpLCBKU09OLnN0cmluZ2lmeSh2YWx1ZSkpO1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdGVtIGNoZWNrZXIgaW4gbG9jYWwgc3RvcmFnZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtQcm9taXNlPEJvb2xlYW4+fVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgaGFzKGtleTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChsb2NhbFN0b3JhZ2UsIHRoaXMuc3RvcmFnZU5hbWUoa2V5KSk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGl0ZW1cbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7UHJvbWlzZTxBbnk+fVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgY2xlYXIoa2V5OiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IChhd2FpdCB0aGlzLmhhcyhrZXkpKSA/IGRlbGV0ZSBsb2NhbFN0b3JhZ2VbdGhpcy5zdG9yYWdlTmFtZShrZXkpXSA6IGZhbHNlO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogQ29tcG9zZSBjb2xsZWN0aW9uIG5hbWUgYnkgc3VmZml4XG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gc3VmZml4XG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHN0b3JhZ2VOYW1lKHN1ZmZpeDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN1ZmZpeC5zdGFydHNXaXRoKHRoaXMuZ2V0UHJlZml4KCkpID8gc3VmZml4IDogYCR7dGhpcy5nZXRQcmVmaXgoKX1fJHtzdWZmaXh9YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgcHJlZml4IG9mIGNoYW5uZWwgY29sbGVjdGlvblxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBnZXRQcmVmaXgoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnLmdldCgncHJlZml4Jyk7XG4gIH1cbn1cbiIsIi8vIEBmbG93XG5pbXBvcnQgdHlwZSBJVGFzayBmcm9tICcuL2ludGVyZmFjZXMvdGFzayc7XG5pbXBvcnQgdHlwZSBJQ29uZmlnIGZyb20gJy4vaW50ZXJmYWNlcy9jb25maWcnO1xuaW1wb3J0IEV2ZW50IGZyb20gJy4vZXZlbnQnO1xuaW1wb3J0IFN0b3JhZ2VDYXBzdWxlIGZyb20gJy4vc3RvcmFnZS1jYXBzdWxlJztcbmltcG9ydCBRdWV1ZSBmcm9tICcuL3F1ZXVlJztcbmltcG9ydCB7IHV0aWxDbGVhckJ5VGFnIH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge1xuICBkYixcbiAgY2FuTXVsdGlwbGUsXG4gIHNhdmVUYXNrLFxuICBsb2dQcm94eSxcbiAgY3JlYXRlVGltZW91dCxcbiAgc3RvcFF1ZXVlLFxuICBnZXRUYXNrc1dpdGhvdXRGcmVlemVkLFxufSBmcm9tICcuL2hlbHBlcnMnO1xuaW1wb3J0IHtcbiAgdGFza0FkZGVkTG9nLFxuICBuZXh0VGFza0xvZyxcbiAgcXVldWVTdG9wcGluZ0xvZyxcbiAgcXVldWVTdGFydExvZyxcbiAgZXZlbnRDcmVhdGVkTG9nLFxufSBmcm9tICcuL2NvbnNvbGUnO1xuXG4vKiBlc2xpbnQgbm8tdW5kZXJzY29yZS1kYW5nbGU6IFsyLCB7IFwiYWxsb3dcIjogW1wiX2lkXCJdIH1dICovXG5cbmNvbnN0IGNoYW5uZWxOYW1lID0gU3ltYm9sKCdjaGFubmVsLW5hbWUnKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2hhbm5lbCB7XG4gIHN0b3BwZWQ6IGJvb2xlYW4gPSB0cnVlO1xuICBydW5uaW5nOiBib29sZWFuID0gZmFsc2U7XG4gIHRpbWVvdXQ6IG51bWJlcjtcbiAgc3RvcmFnZTogU3RvcmFnZUNhcHN1bGU7XG4gIGNvbmZpZzogSUNvbmZpZztcbiAgZXZlbnQgPSBuZXcgRXZlbnQoKTtcblxuICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIGNvbmZpZzogSUNvbmZpZykge1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuXG4gICAgLy8gc2F2ZSBjaGFubmVsIG5hbWUgdG8gdGhpcyBjbGFzcyB3aXRoIHN5bWJvbGljIGtleVxuICAgICh0aGlzOiBPYmplY3QpW2NoYW5uZWxOYW1lXSA9IG5hbWU7XG5cbiAgICAvLyBpZiBjdXN0b20gc3RvcmFnZSBkcml2ZXIgZXhpc3RzLCBzZXR1cCBpdFxuICAgIGNvbnN0IHsgZHJpdmVycyB9OiBhbnkgPSBRdWV1ZTtcbiAgICBjb25zdCBzdG9yYWdlID0gbmV3IFN0b3JhZ2VDYXBzdWxlKGNvbmZpZywgZHJpdmVycy5zdG9yYWdlKTtcbiAgICB0aGlzLnN0b3JhZ2UgPSBzdG9yYWdlLmNoYW5uZWwobmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGNoYW5uZWwgbmFtZVxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9IGNoYW5uZWwgbmFtZVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgbmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiAodGhpczogT2JqZWN0KVtjaGFubmVsTmFtZV07XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIG5ldyBqb2IgdG8gY2hhbm5lbFxuICAgKlxuICAgKiBAcGFyYW0gIHtPYmplY3R9IHRhc2tcbiAgICogQHJldHVybiB7U3RyaW5nfEJvb2xlYW59IGpvYlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgYWRkKHRhc2s6IElUYXNrKTogUHJvbWlzZTxzdHJpbmcgfCBib29sZWFuPiB7XG4gICAgaWYgKCEoYXdhaXQgY2FuTXVsdGlwbGUuY2FsbCh0aGlzLCB0YXNrKSkpIHJldHVybiBmYWxzZTtcblxuICAgIGNvbnN0IGlkID0gYXdhaXQgc2F2ZVRhc2suY2FsbCh0aGlzLCB0YXNrKTtcblxuICAgIGlmIChpZCAmJiB0aGlzLnJ1bm5pbmcgPT09IHRydWUpIHtcbiAgICAgIGF3YWl0IHRoaXMuc3RhcnQoKTtcbiAgICB9XG5cbiAgICAvLyBwYXNzIGFjdGl2aXR5IHRvIHRoZSBsb2cgc2VydmljZS5cbiAgICBsb2dQcm94eS5jYWxsKHRoaXMsIHRhc2tBZGRlZExvZywgdGFzayk7XG5cbiAgICByZXR1cm4gaWQ7XG4gIH1cblxuICAvKipcbiAgICogUHJvY2VzcyBuZXh0IGpvYlxuICAgKlxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgbmV4dCgpOiBQcm9taXNlPHZvaWQgfCBib29sZWFuPiB7XG4gICAgaWYgKHRoaXMuc3RvcHBlZCkge1xuICAgICAgcmV0dXJuIHN0b3BRdWV1ZS5jYWxsKHRoaXMpO1xuICAgIH1cblxuICAgIC8vIEdlbmVyYXRlIGEgbG9nIG1lc3NhZ2VcbiAgICBsb2dQcm94eS5jYWxsKHRoaXMsIG5leHRUYXNrTG9nLCAnbmV4dCcpO1xuXG4gICAgLy8gc3RhcnQgcXVldWUgYWdhaW5cbiAgICBhd2FpdCB0aGlzLnN0YXJ0KCk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCBxdWV1ZSBsaXN0ZW5lclxuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufSBqb2JcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIHN0YXJ0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuc3RvcHBlZCA9IGZhbHNlO1xuICAgIHRoaXMucnVubmluZyA9IHRydWU7XG5cbiAgICBsb2dQcm94eS5jYWxsKHRoaXMsIHF1ZXVlU3RhcnRMb2csICdzdGFydCcpO1xuXG4gICAgLy8gQ3JlYXRlIGEgdGltZW91dCBmb3Igc3RhcnQgdGhlIHF1ZXVlXG4gICAgYXdhaXQgY3JlYXRlVGltZW91dC5jYWxsKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgcXVldWUgbGlzdGVuZXIgYWZ0ZXIgZW5kIG9mIGN1cnJlbnQgdGFza1xuICAgKlxuICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgc3RvcCgpOiB2b2lkIHtcbiAgICBsb2dQcm94eS5jYWxsKHRoaXMsIHF1ZXVlU3RvcHBpbmdMb2csICdzdG9wJyk7XG4gICAgdGhpcy5zdG9wcGVkID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wIHF1ZXVlIGxpc3RlbmVyIGluY2x1ZGluZyBjdXJyZW50IHRhc2tcbiAgICpcbiAgICogQHJldHVybiB7Vm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGZvcmNlU3RvcCgpOiB2b2lkIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIHN0b3BRdWV1ZS5jYWxsKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSBjaGFubmVsIHdvcmtpbmdcbiAgICpcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHN0YXR1cygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5ydW5uaW5nO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgdGhlcmUgaXMgYW55IHRhc2tcbiAgICpcbiAgICogQHJldHVybiB7Qm9vZWxhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGlzRW1wdHkoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmNvdW50KCkpIDwgMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGFzayBjb3VudFxuICAgKlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBjb3VudCgpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIHJldHVybiAoYXdhaXQgZ2V0VGFza3NXaXRob3V0RnJlZXplZC5jYWxsKHRoaXMpKS5sZW5ndGg7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRhc2sgY291bnQgYnkgdGFnXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gdGFnXG4gICAqIEByZXR1cm4ge0FycmF5PElUYXNrPn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGNvdW50QnlUYWcodGFnOiBzdHJpbmcpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIHJldHVybiAoYXdhaXQgZ2V0VGFza3NXaXRob3V0RnJlZXplZC5jYWxsKHRoaXMpKS5maWx0ZXIodCA9PiB0LnRhZyA9PT0gdGFnKS5sZW5ndGg7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFsbCB0YXNrcyBmcm9tIGNoYW5uZWxcbiAgICpcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGNsZWFyKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGlmICghdGhpcy5uYW1lKCkpIHJldHVybiBmYWxzZTtcbiAgICBhd2FpdCB0aGlzLnN0b3JhZ2UuY2xlYXIodGhpcy5uYW1lKCkpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbGwgdGFza3MgZnJvbSBjaGFubmVsIGJ5IHRhZ1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHRhZ1xuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgY2xlYXJCeVRhZyh0YWc6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBkYi5jYWxsKHNlbGYpLmFsbCgpO1xuICAgIGNvbnN0IHJlbW92ZXMgPSBkYXRhLmZpbHRlcih1dGlsQ2xlYXJCeVRhZy5iaW5kKHRhZykpLm1hcChhc3luYyAodCkgPT4ge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZGIuY2FsbChzZWxmKS5kZWxldGUodC5faWQpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9KTtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChyZW1vdmVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBhIHRhc2sgd2hldGhlciBleGlzdHMgYnkgam9iIGlkXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gdGFnXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBoYXMoaWQ6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgZ2V0VGFza3NXaXRob3V0RnJlZXplZC5jYWxsKHRoaXMpKS5maW5kSW5kZXgodCA9PiB0Ll9pZCA9PT0gaWQpID4gLTE7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgYSB0YXNrIHdoZXRoZXIgZXhpc3RzIGJ5IHRhZ1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHRhZ1xuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgaGFzQnlUYWcodGFnOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gKGF3YWl0IGdldFRhc2tzV2l0aG91dEZyZWV6ZWQuY2FsbCh0aGlzKSkuZmluZEluZGV4KHQgPT4gdC50YWcgPT09IHRhZykgPiAtMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgYWN0aW9uIGV2ZW50c1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gY2JcbiAgICogQHJldHVybiB7Vm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIG9uKGtleTogc3RyaW5nLCBjYjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICB0aGlzLmV2ZW50Lm9uKC4uLltrZXksIGNiXSk7XG4gICAgbG9nUHJveHkuY2FsbCh0aGlzLCBldmVudENyZWF0ZWRMb2csIGtleSwgdGhpcy5uYW1lKCkpO1xuICB9XG59XG4iLCIvKiBAZmxvdyAqL1xuaW1wb3J0IHR5cGUgSUNvbmZpZyBmcm9tICcuL2ludGVyZmFjZXMvY29uZmlnJztcbmltcG9ydCBjb25maWdEYXRhIGZyb20gJy4vZW51bS9jb25maWcuZGF0YSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbmZpZyB7XG4gIGNvbmZpZzogSUNvbmZpZyA9IGNvbmZpZ0RhdGE7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBJQ29uZmlnID0ge30pIHtcbiAgICB0aGlzLm1lcmdlKGNvbmZpZyk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGNvbmZpZyB0byBnbG9iYWwgY29uZmlnIHJlZmVyZW5jZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtICB7QW55fSB2YWx1ZVxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgc2V0KG5hbWU6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQge1xuICAgIHRoaXMuY29uZmlnW25hbWVdID0gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgY29uZmlnXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHthbnl9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBnZXQobmFtZTogc3RyaW5nKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWdbbmFtZV07XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgY29uZmlnIHByb3BlcnR5XG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHthbnl9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBoYXMobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLmNvbmZpZywgbmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogTWVyZ2UgdHdvIGNvbmZpZyBvYmplY3RcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBtZXJnZShjb25maWc6IHsgW3N0cmluZ106IGFueSB9KTogdm9pZCB7XG4gICAgdGhpcy5jb25maWcgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmNvbmZpZywgY29uZmlnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYSBjb25maWdcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICByZW1vdmUobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGRlbGV0ZSB0aGlzLmNvbmZpZ1tuYW1lXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIGNvbmZpZ1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVcbiAgICogQHJldHVybiB7SUNvbmZpZ1tdfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYWxsKCk6IElDb25maWcge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZztcbiAgfVxufVxuIiwiLy8gQGZsb3dcbmltcG9ydCBvYmogZnJvbSAnb2JqZWN0LXBhdGgnO1xuaW1wb3J0IGxvZ0V2ZW50cyBmcm9tICcuL2VudW0vbG9nLmV2ZW50cyc7XG5cbi8qIGVzbGludCBuby1jb25zb2xlOiBbXCJlcnJvclwiLCB7IGFsbG93OiBbXCJsb2dcIiwgXCJncm91cENvbGxhcHNlZFwiLCBcImdyb3VwRW5kXCJdIH1dICovXG5cbmV4cG9ydCBmdW5jdGlvbiBsb2coLi4uYXJnczogYW55KSB7XG4gIGNvbnNvbGUubG9nKC4uLmFyZ3MpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdGFza0FkZGVkTG9nKFt0YXNrXTogYW55W10pIHtcbiAgbG9nKFxuICAgIGAlYyR7U3RyaW5nLmZyb21DaGFyQ29kZSg0Myl9ICgke3Rhc2suaGFuZGxlcn0pIC0+ICR7b2JqLmdldChsb2dFdmVudHMsICdxdWV1ZS5jcmVhdGVkJyl9YCxcbiAgICAnY29sb3I6IGdyZWVuO2ZvbnQtd2VpZ2h0OiBib2xkOycsXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBxdWV1ZVN0YXJ0TG9nKFt0eXBlXTogYW55W10pIHtcbiAgbG9nKFxuICAgIGAlYyR7U3RyaW5nLmZyb21DaGFyQ29kZSg4MjExKX0gKCR7dHlwZX0pIC0+ICR7b2JqLmdldChsb2dFdmVudHMsICdxdWV1ZS5zdGFydGluZycpfWAsXG4gICAgJ2NvbG9yOiAjM2ZhNWYzO2ZvbnQtd2VpZ2h0OiBib2xkOycsXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBuZXh0VGFza0xvZyhbdHlwZV06IGFueVtdKSB7XG4gIGxvZyhcbiAgICBgJWMke1N0cmluZy5mcm9tQ2hhckNvZGUoMTg3KX0gKCR7dHlwZX0pIC0+ICR7b2JqLmdldChsb2dFdmVudHMsICdxdWV1ZS5uZXh0Jyl9YCxcbiAgICAnY29sb3I6ICMzZmE1ZjM7Zm9udC13ZWlnaHQ6IGJvbGQ7JyxcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHF1ZXVlU3RvcHBpbmdMb2coW3R5cGVdOiBhbnlbXSkge1xuICBsb2coXG4gICAgYCVjJHtTdHJpbmcuZnJvbUNoYXJDb2RlKDgyMjYpfSAoJHt0eXBlfSkgLT4gJHtvYmouZ2V0KGxvZ0V2ZW50cywgJ3F1ZXVlLnN0b3BwaW5nJyl9YCxcbiAgICAnY29sb3I6ICNmZjdmOTQ7Zm9udC13ZWlnaHQ6IGJvbGQ7JyxcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHF1ZXVlU3RvcHBlZExvZyhbdHlwZV06IGFueVtdKSB7XG4gIGxvZyhcbiAgICBgJWMke1N0cmluZy5mcm9tQ2hhckNvZGUoODIyNil9ICgke3R5cGV9KSAtPiAke29iai5nZXQobG9nRXZlbnRzLCAncXVldWUuc3RvcHBlZCcpfWAsXG4gICAgJ2NvbG9yOiAjZmY3Zjk0O2ZvbnQtd2VpZ2h0OiBib2xkOycsXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBxdWV1ZUVtcHR5TG9nKFt0eXBlXTogYW55W10pIHtcbiAgbG9nKGAlYyR7dHlwZX0gJHtvYmouZ2V0KGxvZ0V2ZW50cywgJ3F1ZXVlLmVtcHR5Jyl9YCwgJ2NvbG9yOiAjZmY3Zjk0O2ZvbnQtd2VpZ2h0OiBib2xkOycpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXZlbnRDcmVhdGVkTG9nKFtrZXksIG5hbWVdOiBzdHJpbmdbXSkge1xuICBsb2coXG4gICAgYCVjKCR7bmFtZX0pIC0+ICR7a2V5fSAke29iai5nZXQobG9nRXZlbnRzLCAnZXZlbnQuY3JlYXRlZCcpfWAsXG4gICAgJ2NvbG9yOiAjNjZjZWUzO2ZvbnQtd2VpZ2h0OiBib2xkOycsXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBldmVudEZpcmVkTG9nKFtrZXksIG5hbWVdOiBhbnlbXSkge1xuICBsb2coYCVjKCR7a2V5fSkgLT4gJHtvYmouZ2V0KGxvZ0V2ZW50cywgYGV2ZW50LiR7bmFtZX1gKX1gLCAnY29sb3I6ICNhMGRjM2M7Zm9udC13ZWlnaHQ6IGJvbGQ7Jyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3RGb3VuZExvZyhbbmFtZV06IGFueVtdKSB7XG4gIGxvZyhcbiAgICBgJWMke1N0cmluZy5mcm9tQ2hhckNvZGUoMjE1KX0gKCR7bmFtZX0pIC0+ICR7b2JqLmdldChsb2dFdmVudHMsICdxdWV1ZS5ub3QtZm91bmQnKX1gLFxuICAgICdjb2xvcjogI2I5MmUyZTtmb250LXdlaWdodDogYm9sZDsnLFxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd29ya2VyUnVubmluTG9nKFtcbiAgd29ya2VyOiBGdW5jdGlvbixcbiAgd29ya2VySW5zdGFuY2UsXG4gIHRhc2ssXG4gIGNoYW5uZWw6IHN0cmluZyxcbiAgZGVwczogeyBbc3RyaW5nXTogYW55W10gfSxcbl06IGFueVtdKSB7XG4gIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoYCR7d29ya2VyLm5hbWUgfHwgdGFzay5oYW5kbGVyfSAtICR7dGFzay5sYWJlbH1gKTtcbiAgbG9nKGAlY2NoYW5uZWw6ICR7Y2hhbm5lbH1gLCAnY29sb3I6IGJsdWU7Jyk7XG4gIGxvZyhgJWNsYWJlbDogJHt0YXNrLmxhYmVsIHx8ICcnfWAsICdjb2xvcjogYmx1ZTsnKTtcbiAgbG9nKGAlY2hhbmRsZXI6ICR7dGFzay5oYW5kbGVyfWAsICdjb2xvcjogYmx1ZTsnKTtcbiAgbG9nKGAlY3ByaW9yaXR5OiAke3Rhc2sucHJpb3JpdHl9YCwgJ2NvbG9yOiBibHVlOycpO1xuICBsb2coYCVjdW5pcXVlOiAke3Rhc2sudW5pcXVlIHx8ICdmYWxzZSd9YCwgJ2NvbG9yOiBibHVlOycpO1xuICBsb2coYCVjcmV0cnk6ICR7d29ya2VySW5zdGFuY2UucmV0cnkgfHwgJzEnfWAsICdjb2xvcjogYmx1ZTsnKTtcbiAgbG9nKGAlY3RyaWVkOiAke3Rhc2sudHJpZWQgPyB0YXNrLnRyaWVkICsgMSA6ICcxJ31gLCAnY29sb3I6IGJsdWU7Jyk7XG4gIGxvZyhgJWN0YWc6ICR7dGFzay50YWcgfHwgJyd9YCwgJ2NvbG9yOiBibHVlOycpO1xuICBsb2coJyVjYXJnczonLCAnY29sb3I6IGJsdWU7Jyk7XG4gIGxvZyh0YXNrLmFyZ3MgfHwgJycpO1xuICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkKCdkZXBlbmRlbmNpZXMnKTtcbiAgbG9nKC4uLihkZXBzW3dvcmtlci5uYW1lXSB8fCBbXSkpO1xuICBjb25zb2xlLmdyb3VwRW5kKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3b3JrZXJEb25lTG9nKFtyZXN1bHQsIHRhc2ssIHdvcmtlckluc3RhbmNlXTogYW55W10pIHtcbiAgaWYgKHJlc3VsdCA9PT0gdHJ1ZSkge1xuICAgIGxvZyhgJWMke1N0cmluZy5mcm9tQ2hhckNvZGUoMTAwMDMpfSBUYXNrIGNvbXBsZXRlZCFgLCAnY29sb3I6IGdyZWVuOycpO1xuICB9IGVsc2UgaWYgKCFyZXN1bHQgJiYgdGFzay50cmllZCA8IHdvcmtlckluc3RhbmNlLnJldHJ5KSB7XG4gICAgbG9nKCclY1Rhc2sgd2lsbCBiZSByZXRyaWVkIScsICdjb2xvcjogI2Q4NDEwYzsnKTtcbiAgfSBlbHNlIHtcbiAgICBsb2coYCVjJHtTdHJpbmcuZnJvbUNoYXJDb2RlKDEwMDA1KX0gVGFzayBmYWlsZWQgYW5kIGZyZWV6ZWQhYCwgJ2NvbG9yOiAjZWY2MzYzOycpO1xuICB9XG4gIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdvcmtlckZhaWxlZExvZygpIHtcbiAgbG9nKGAlYyR7U3RyaW5nLmZyb21DaGFyQ29kZSgxMDAwNSl9IFRhc2sgZmFpbGVkIWAsICdjb2xvcjogcmVkOycpO1xuICBjb25zb2xlLmdyb3VwRW5kKCk7XG59XG4iLCIvKiBAZmxvdyAqL1xuaW1wb3J0IHR5cGUgSUNvbnRhaW5lciBmcm9tICcuL2ludGVyZmFjZXMvY29udGFpbmVyJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29udGFpbmVyIGltcGxlbWVudHMgSUNvbnRhaW5lciB7XG4gIHN0b3JlOiB7IFtwcm9wZXJ0eTogc3RyaW5nXTogYW55IH0gPSB7fTtcblxuICAvKipcbiAgICogQ2hlY2sgaXRlbSBpbiBjb250YWluZXJcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBpZFxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgaGFzKGlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuc3RvcmUsIGlkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgaXRlbSBmcm9tIGNvbnRhaW5lclxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGlkXG4gICAqIEByZXR1cm4ge0FueX1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGdldChpZDogc3RyaW5nKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5zdG9yZVtpZF07XG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBpdGVtcyBmcm9tIGNvbnRhaW5lclxuICAgKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhbGwoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmU7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGl0ZW0gdG8gY29udGFpbmVyXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gaWRcbiAgICogQHBhcmFtICB7QW55fSB2YWx1ZVxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYmluZChpZDogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgdGhpcy5zdG9yZVtpZF0gPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXJnZSBjb250aW5lcnNcbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSBkYXRhXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBtZXJnZShkYXRhOiB7IFtwcm9wZXJ0eTogc3RyaW5nXTogYW55IH0gPSB7fSk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmUgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnN0b3JlLCBkYXRhKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgaXRlbSBmcm9tIGNvbnRhaW5lclxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGlkXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICByZW1vdmUoaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy5oYXMoaWQpKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIGRlbGV0ZSB0aGlzLnN0b3JlW2lkXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYWxsIGl0ZW1zIGZyb20gY29udGFpbmVyXG4gICAqXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICByZW1vdmVBbGwoKTogdm9pZCB7XG4gICAgdGhpcy5zdG9yZSA9IHt9O1xuICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCB7XG4gIGRlZmF1bHRTdG9yYWdlOiAnbG9jYWxzdG9yYWdlJyxcbiAgcHJlZml4OiAnc3Ffam9icycsXG4gIHRpbWVvdXQ6IDEwMDAsXG4gIGxpbWl0OiAtMSxcbiAgcHJpbmNpcGxlOiAnZmlmbycsXG4gIGRlYnVnOiB0cnVlLFxufTtcbiIsImV4cG9ydCBkZWZhdWx0IHtcbiAgcXVldWU6IHtcbiAgICBjcmVhdGVkOiAnTmV3IHRhc2sgY3JlYXRlZC4nLFxuICAgIG5leHQ6ICdOZXh0IHRhc2sgcHJvY2Vzc2luZy4nLFxuICAgIHN0YXJ0aW5nOiAnUXVldWUgbGlzdGVuZXIgc3RhcnRpbmcuJyxcbiAgICBzdG9wcGluZzogJ1F1ZXVlIGxpc3RlbmVyIHN0b3BwaW5nLicsXG4gICAgc3RvcHBlZDogJ1F1ZXVlIGxpc3RlbmVyIHN0b3BwZWQuJyxcbiAgICBlbXB0eTogJ2NoYW5uZWwgaXMgZW1wdHkuLi4nLFxuICAgICdub3QtZm91bmQnOiAnd29ya2VyIG5vdCBmb3VuZCcsXG4gICAgb2ZmbGluZTogJ0Rpc2Nvbm5lY3RlZCcsXG4gICAgb25saW5lOiAnQ29ubmVjdGVkJyxcbiAgfSxcbiAgZXZlbnQ6IHtcbiAgICBjcmVhdGVkOiAnZXZlbnQgY3JlYXRlZCcsXG4gICAgZmlyZWQ6ICdFdmVudCBmaXJlZC4nLFxuICAgICd3aWxkY2FyZC1maXJlZCc6ICdXaWxkY2FyZCBldmVudCBmaXJlZC4nLFxuICB9LFxufTtcbiIsIi8qIGVzbGludCBjbGFzcy1tZXRob2RzLXVzZS10aGlzOiBbXCJlcnJvclwiLCB7IFwiZXhjZXB0TWV0aG9kc1wiOiBbXCJnZXROYW1lXCIsIFwiZ2V0VHlwZVwiXSB9XSAqL1xuLyogZXNsaW50LWVudiBlczYgKi9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXZlbnQge1xuICBzdG9yZTogeyBbcHJvcDogc3RyaW5nXTogYW55IH0gPSB7fTtcbiAgdmVyaWZpZXJQYXR0ZXJuOiBzdHJpbmcgPSAvXlthLXowLTktX10rOmJlZm9yZSR8YWZ0ZXIkfHJldHJ5JHxcXCokLztcbiAgd2lsZGNhcmRzOiBzdHJpbmdbXSA9IFsnKicsICdlcnJvcicsICdjb21wbGV0ZWQnXTtcbiAgZW1wdHlGdW5jOiBGdW5jdGlvbiA9ICgpID0+IHt9O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc3RvcmUuYmVmb3JlID0ge307XG4gICAgdGhpcy5zdG9yZS5hZnRlciA9IHt9O1xuICAgIHRoaXMuc3RvcmUucmV0cnkgPSB7fTtcbiAgICB0aGlzLnN0b3JlLndpbGRjYXJkID0ge307XG4gICAgdGhpcy5zdG9yZS5lcnJvciA9IHRoaXMuZW1wdHlGdW5jO1xuICAgIHRoaXMuc3RvcmUuY29tcGxldGVkID0gdGhpcy5lbXB0eUZ1bmM7XG4gICAgdGhpcy5zdG9yZVsnKiddID0gdGhpcy5lbXB0eUZ1bmM7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGV2ZW50XG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjYlxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgb24oa2V5OiBzdHJpbmcsIGNiOiBGdW5jdGlvbik6IHZvaWQge1xuICAgIGlmICh0eXBlb2YgY2IgIT09ICdmdW5jdGlvbicpIHRocm93IG5ldyBFcnJvcignRXZlbnQgc2hvdWxkIGJlIGFuIGZ1bmN0aW9uJyk7XG4gICAgaWYgKHRoaXMuaXNWYWxpZChrZXkpKSB0aGlzLmFkZChrZXksIGNiKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gZXZlbnQgdmlhIGl0J3Mga2V5XG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSAge0FueX0gYXJnc1xuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgZW1pdChrZXk6IHN0cmluZywgYXJnczogYW55KTogdm9pZCB7XG4gICAgaWYgKHRoaXMud2lsZGNhcmRzLmluZGV4T2Yoa2V5KSA+IC0xKSB7XG4gICAgICB0aGlzLndpbGRjYXJkKGtleSwgLi4uW2tleSwgYXJnc10pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB0eXBlOiBzdHJpbmcgPSB0aGlzLmdldFR5cGUoa2V5KTtcbiAgICAgIGNvbnN0IG5hbWU6IHN0cmluZyA9IHRoaXMuZ2V0TmFtZShrZXkpO1xuXG4gICAgICBpZiAodGhpcy5zdG9yZVt0eXBlXSkge1xuICAgICAgICBjb25zdCBjYjogRnVuY3Rpb24gPSB0aGlzLnN0b3JlW3R5cGVdW25hbWVdIHx8IHRoaXMuZW1wdHlGdW5jO1xuICAgICAgICBjYi5jYWxsKG51bGwsIGFyZ3MpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMud2lsZGNhcmQoJyonLCBrZXksIGFyZ3MpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biB3aWxkY2FyZCBldmVudHNcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHBhcmFtICB7U3RyaW5nfSBhY3Rpb25LZXlcbiAgICogQHBhcmFtICB7QW55fSBhcmdzXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICB3aWxkY2FyZChrZXk6IHN0cmluZywgYWN0aW9uS2V5OiBzdHJpbmcsIGFyZ3M6IGFueSk6IHZvaWQge1xuICAgIGlmICh0aGlzLnN0b3JlLndpbGRjYXJkW2tleV0pIHtcbiAgICAgIHRoaXMuc3RvcmUud2lsZGNhcmRba2V5XS5jYWxsKG51bGwsIGFjdGlvbktleSwgYXJncyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBldmVudCB0byBzdG9yZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gY2JcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFkZChrZXk6IHN0cmluZywgY2I6IEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgaWYgKHRoaXMud2lsZGNhcmRzLmluZGV4T2Yoa2V5KSA+IC0xKSB7XG4gICAgICB0aGlzLnN0b3JlLndpbGRjYXJkW2tleV0gPSBjYjtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgdHlwZTogc3RyaW5nID0gdGhpcy5nZXRUeXBlKGtleSk7XG4gICAgICBjb25zdCBuYW1lOiBzdHJpbmcgPSB0aGlzLmdldE5hbWUoa2V5KTtcbiAgICAgIHRoaXMuc3RvcmVbdHlwZV1bbmFtZV0gPSBjYjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgZXZlbnQgaW4gc3RvcmVcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGhhcyhrZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBrZXlzOiBzdHJpbmdbXSA9IGtleS5zcGxpdCgnOicpO1xuICAgICAgcmV0dXJuIGtleXMubGVuZ3RoID4gMSA/ICEhdGhpcy5zdG9yZVtrZXlzWzFdXVtrZXlzWzBdXSA6ICEhdGhpcy5zdG9yZS53aWxkY2FyZFtrZXlzWzBdXTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBldmVudCBuYW1lIGJ5IHBhcnNlIGtleVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBnZXROYW1lKGtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4ga2V5Lm1hdGNoKC8oLiopOi4qLylbMV07XG4gIH1cblxuICAvKipcbiAgICogR2V0IGV2ZW50IHR5cGUgYnkgcGFyc2Uga2V5XG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGdldFR5cGUoa2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBrZXkubWF0Y2goL15bYS16MC05LV9dKzooLiopLylbMV07XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tlciBvZiBldmVudCBrZXlzXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBpc1ZhbGlkKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMudmVyaWZpZXJQYXR0ZXJuLnRlc3Qoa2V5KSB8fCB0aGlzLndpbGRjYXJkcy5pbmRleE9mKGtleSkgPiAtMTtcbiAgfVxufVxuIiwiLyogQGZsb3cgKi9cbmltcG9ydCB0eXBlIElUYXNrIGZyb20gJy4vaW50ZXJmYWNlcy90YXNrJztcbmltcG9ydCB0eXBlIElXb3JrZXIgZnJvbSAnLi9pbnRlcmZhY2VzL3dvcmtlcic7XG5pbXBvcnQgUXVldWUgZnJvbSAnLi9xdWV1ZSc7XG5pbXBvcnQgQ2hhbm5lbCBmcm9tICcuL2NoYW5uZWwnO1xuaW1wb3J0IFN0b3JhZ2VDYXBzdWxlIGZyb20gJy4vc3RvcmFnZS1jYXBzdWxlJztcbmltcG9ydCB7IGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzLCBoYXNNZXRob2QsIGlzRnVuY3Rpb24gfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7XG4gIGV2ZW50RmlyZWRMb2csXG4gIHF1ZXVlU3RvcHBlZExvZyxcbiAgd29ya2VyUnVubmluTG9nLFxuICBxdWV1ZUVtcHR5TG9nLFxuICBub3RGb3VuZExvZyxcbiAgd29ya2VyRG9uZUxvZyxcbiAgd29ya2VyRmFpbGVkTG9nLFxufSBmcm9tICcuL2NvbnNvbGUnO1xuXG4vKiBnbG9iYWwgV29ya2VyICovXG4vKiBlc2xpbnQgbm8tdW5kZXJzY29yZS1kYW5nbGU6IFsyLCB7IFwiYWxsb3dcIjogW1wiX2lkXCJdIH1dICovXG4vKiBlc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246IFwiZXJyb3JcIiAqL1xuLyogZXNsaW50IHVzZS1pc25hbjogXCJlcnJvclwiICovXG5cbi8qKlxuICogVGFzayBwcmlvcml0eSBjb250cm9sbGVyIGhlbHBlclxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEByZXR1cm4ge0lUYXNrfVxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tQcmlvcml0eSh0YXNrOiBJVGFzayk6IElUYXNrIHtcbiAgdGFzay5wcmlvcml0eSA9IHRhc2sucHJpb3JpdHkgfHwgMDtcblxuICBpZiAodHlwZW9mIHRhc2sucHJpb3JpdHkgIT09ICdudW1iZXInKSB0YXNrLnByaW9yaXR5ID0gMDtcblxuICByZXR1cm4gdGFzaztcbn1cblxuLyoqXG4gKiBTaG9ydGVucyBmdW5jdGlvbiB0aGUgZGIgYmVsb25nc3RvIGN1cnJlbnQgY2hhbm5lbFxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEByZXR1cm4ge1N0b3JhZ2VDYXBzdWxlfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGIoKTogU3RvcmFnZUNhcHN1bGUge1xuICByZXR1cm4gKHRoaXM6IGFueSkuc3RvcmFnZS5jaGFubmVsKCh0aGlzOiBhbnkpLm5hbWUoKSk7XG59XG5cbi8qKlxuICogR2V0IHVuZnJlZXplZCB0YXNrcyBieSB0aGUgZmlsdGVyIGZ1bmN0aW9uXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHJldHVybiB7SVRhc2t9XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUYXNrc1dpdGhvdXRGcmVlemVkKCk6IFByb21pc2U8SVRhc2tbXT4ge1xuICByZXR1cm4gKGF3YWl0IGRiLmNhbGwodGhpcykuYWxsKCkpLmZpbHRlcihleGNsdWRlU3BlY2lmaWNUYXNrcy5iaW5kKFsnZnJlZXplZCddKSk7XG59XG5cbi8qKlxuICogTG9nIHByb3h5IGhlbHBlclxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEByZXR1cm4ge3ZvaWR9XG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge3N0cmluZ30gZGF0YVxuICogQHBhcmFtIHtib29sZWFufSBjb25kXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2dQcm94eSh3cmFwcGVyRnVuYzogRnVuY3Rpb24sIC4uLmFyZ3M6IGFueSk6IHZvaWQge1xuICBpZiAoKHRoaXM6IGFueSkuY29uZmlnLmdldCgnZGVidWcnKSAmJiB0eXBlb2Ygd3JhcHBlckZ1bmMgPT09ICdmdW5jdGlvbicpIHtcbiAgICB3cmFwcGVyRnVuYyhhcmdzKTtcbiAgfVxufVxuXG4vKipcbiAqIE5ldyB0YXNrIHNhdmUgaGVscGVyXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHJldHVybiB7c3RyaW5nfGJvb2xlYW59XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlVGFzayh0YXNrOiBJVGFzayk6IFByb21pc2U8c3RyaW5nIHwgYm9vbGVhbj4ge1xuICBjb25zdCByZXN1bHQgPSBhd2FpdCBkYi5jYWxsKHRoaXMpLnNhdmUoY2hlY2tQcmlvcml0eSh0YXNrKSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogVGFzayByZW1vdmUgaGVscGVyXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGlkXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVtb3ZlVGFzayhpZDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRiLmNhbGwodGhpcykuZGVsZXRlKGlkKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBFdmVudHMgZGlzcGF0Y2hlciBoZWxwZXJcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICogQHJldHVybiB7dm9pZH1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpc3BhdGNoRXZlbnRzKHRhc2s6IElUYXNrLCB0eXBlOiBzdHJpbmcpOiBib29sZWFuIHwgdm9pZCB7XG4gIGlmICghKCd0YWcnIGluIHRhc2spKSByZXR1cm4gZmFsc2U7XG5cbiAgY29uc3QgZXZlbnRzID0gW1tgJHt0YXNrLnRhZ306JHt0eXBlfWAsICdmaXJlZCddLCBbYCR7dGFzay50YWd9OipgLCAnd2lsZGNhcmQtZmlyZWQnXV07XG5cbiAgZXZlbnRzLmZvckVhY2goKGUpID0+IHtcbiAgICB0aGlzLmV2ZW50LmVtaXQoZVswXSwgdGFzayk7XG4gICAgbG9nUHJveHkuY2FsbCgodGhpczogYW55KSwgZXZlbnRGaXJlZExvZywgLi4uZSk7XG4gIH0pO1xuXG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIFF1ZXVlIHN0b3BwZXIgaGVscGVyXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHJldHVybiB7dm9pZH1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0b3BRdWV1ZSgpOiB2b2lkIHtcbiAgdGhpcy5zdG9wKCk7XG5cbiAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG5cbiAgY2xlYXJUaW1lb3V0KHRoaXMuY3VycmVudFRpbWVvdXQpO1xuXG4gIGxvZ1Byb3h5LmNhbGwodGhpcywgcXVldWVTdG9wcGVkTG9nLCAnc3RvcCcpO1xufVxuXG4vKipcbiAqIEZhaWxlZCBqb2IgaGFuZGxlclxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqIEByZXR1cm4ge0lUYXNrfSBqb2JcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmFpbGVkSm9iSGFuZGxlcih0YXNrOiBJVGFzayk6IFByb21pc2U8RnVuY3Rpb24+IHtcbiAgcmV0dXJuIGFzeW5jIGZ1bmN0aW9uIGNoaWxkRmFpbGVkSGFuZGxlcigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZW1vdmVUYXNrLmNhbGwodGhpcywgdGFzay5faWQpO1xuXG4gICAgdGhpcy5ldmVudC5lbWl0KCdlcnJvcicsIHRhc2spO1xuXG4gICAgbG9nUHJveHkuY2FsbCh0aGlzLCB3b3JrZXJGYWlsZWRMb2cpO1xuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBhd2FpdCB0aGlzLm5leHQoKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgb2YgdGhlIGxvY2sgdGFzayBvZiB0aGUgY3VycmVudCBqb2JcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9ja1Rhc2sodGFzazogSVRhc2spOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZGIuY2FsbCh0aGlzKS51cGRhdGUodGFzay5faWQsIHsgbG9ja2VkOiB0cnVlIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIENsYXNzIGV2ZW50IGx1YW5jaGVyIGhlbHBlclxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge0lXb3JrZXJ9IHdvcmtlclxuICogQHBhcmFtIHthbnl9IGFyZ3NcbiAqIEByZXR1cm4ge2Jvb2xlYW58dm9pZH1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpcmVKb2JJbmxpbmVFdmVudChuYW1lOiBzdHJpbmcsIHdvcmtlcjogSVdvcmtlciwgYXJnczogYW55KTogYm9vbGVhbiB7XG4gIGlmIChoYXNNZXRob2Qod29ya2VyLCBuYW1lKSAmJiBpc0Z1bmN0aW9uKHdvcmtlcltuYW1lXSkpIHtcbiAgICB3b3JrZXJbbmFtZV0uY2FsbCh3b3JrZXIsIGFyZ3MpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBQcm9jZXNzIGhhbmRsZXIgb2Ygc3VjY2VlZGVkIGpvYlxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqIEByZXR1cm4ge3ZvaWR9XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdWNjZXNzUHJvY2Vzcyh0YXNrOiBJVGFzayk6IHZvaWQge1xuICByZW1vdmVUYXNrLmNhbGwodGhpcywgdGFzay5faWQpO1xufVxuXG4vKipcbiAqIFVwZGF0ZSB0YXNrJ3MgcmV0cnkgdmFsdWVcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcGFyYW0ge0lXb3JrZXJ9IHdvcmtlclxuICogQHJldHVybiB7SVRhc2t9XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVSZXRyeSh0YXNrOiBJVGFzaywgd29ya2VyOiBJV29ya2VyKTogSVRhc2sge1xuICBpZiAoISgncmV0cnknIGluIHdvcmtlcikpIHdvcmtlci5yZXRyeSA9IDE7XG5cbiAgaWYgKCEoJ3RyaWVkJyBpbiB0YXNrKSkge1xuICAgIHRhc2sudHJpZWQgPSAwO1xuICAgIHRhc2sucmV0cnkgPSB3b3JrZXIucmV0cnk7XG4gIH1cblxuICB0YXNrLnRyaWVkICs9IDE7XG5cbiAgaWYgKHRhc2sudHJpZWQgPj0gd29ya2VyLnJldHJ5KSB7XG4gICAgdGFzay5mcmVlemVkID0gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiB0YXNrO1xufVxuXG4vKipcbiAqIFByb2Nlc3MgaGFuZGxlciBvZiByZXRyaWVkIGpvYlxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqIEBwYXJhbSB7SVdvcmtlcn0gd29ya2VyXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmV0cnlQcm9jZXNzKHRhc2s6IElUYXNrLCB3b3JrZXI6IElXb3JrZXIpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgLy8gZGlzcGFjdGggY3VzdG9tIHJldHJ5IGV2ZW50XG4gIGRpc3BhdGNoRXZlbnRzLmNhbGwodGhpcywgdGFzaywgJ3JldHJ5Jyk7XG5cbiAgLy8gdXBkYXRlIHJldHJ5IHZhbHVlXG4gIGNvbnN0IHVwZGF0ZVRhc2s6IElUYXNrID0gdXBkYXRlUmV0cnkuY2FsbCh0aGlzLCB0YXNrLCB3b3JrZXIpO1xuXG4gIC8vIGRlbGV0ZSBsb2NrIHByb3BlcnR5IGZvciBuZXh0IHByb2Nlc3NcbiAgdXBkYXRlVGFzay5sb2NrZWQgPSBmYWxzZTtcblxuICBjb25zdCByZXN1bHQgPSBhd2FpdCBkYi5jYWxsKHRoaXMpLnVwZGF0ZSh0YXNrLl9pZCwgdXBkYXRlVGFzayk7XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBTdWNjZWVkIGpvYiBoYW5kbGVyXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHBhcmFtIHtJV29ya2VyfSB3b3JrZXJcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3VjY2Vzc0pvYkhhbmRsZXIodGFzazogSVRhc2ssIHdvcmtlcjogSVdvcmtlcik6IFByb21pc2U8RnVuY3Rpb24+IHtcbiAgY29uc3Qgc2VsZjogQ2hhbm5lbCA9IHRoaXM7XG4gIHJldHVybiBhc3luYyBmdW5jdGlvbiBjaGlsZFN1Y2Nlc3NKb2JIYW5kbGVyKHJlc3VsdDogYm9vbGVhbik6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIGRpc3BhdGNoIGpvYiBwcm9jZXNzIGFmdGVyIHJ1bnMgYSB0YXNrIGJ1dCBvbmx5IG5vbiBlcnJvciBqb2JzXG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgLy8gZ28gYWhlYWQgdG8gc3VjY2VzcyBwcm9jZXNzXG4gICAgICBzdWNjZXNzUHJvY2Vzcy5jYWxsKHNlbGYsIHRhc2spO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBnbyBhaGVhZCB0byByZXRyeSBwcm9jZXNzXG4gICAgICBhd2FpdCByZXRyeVByb2Nlc3MuY2FsbChzZWxmLCB0YXNrLCB3b3JrZXIpO1xuICAgIH1cblxuICAgIC8vIGZpcmUgam9iIGFmdGVyIGV2ZW50XG4gICAgZmlyZUpvYklubGluZUV2ZW50LmNhbGwoc2VsZiwgJ2FmdGVyJywgd29ya2VyLCB0YXNrLmFyZ3MpO1xuXG4gICAgLy8gZGlzcGFjdGggY3VzdG9tIGFmdGVyIGV2ZW50XG4gICAgZGlzcGF0Y2hFdmVudHMuY2FsbChzZWxmLCB0YXNrLCAnYWZ0ZXInKTtcblxuICAgIC8vIHNob3cgY29uc29sZVxuICAgIGxvZ1Byb3h5LmNhbGwoc2VsZiwgd29ya2VyRG9uZUxvZywgcmVzdWx0LCB0YXNrLCB3b3JrZXIpO1xuXG4gICAgLy8gdHJ5IG5leHQgcXVldWUgam9iXG4gICAgYXdhaXQgc2VsZi5uZXh0KCk7XG4gIH07XG59XG5cbi8qKlxuICogSm9iIGhhbmRsZXIgaGVscGVyXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHBhcmFtIHtJSm9ifSB3b3JrZXJcbiAqIEBwYXJhbSB7SVdvcmtlcn0gd29ya2VySW5zdGFuY2VcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi8gZnVuY3Rpb24gbG9vcEhhbmRsZXIoXG4gIHRhc2s6IElUYXNrLFxuICB3b3JrZXI6IEZ1bmN0aW9uIHwgT2JqZWN0LFxuICB3b3JrZXJJbnN0YW5jZTogSVdvcmtlcixcbik6IEZ1bmN0aW9uIHtcbiAgcmV0dXJuIGFzeW5jIGZ1bmN0aW9uIGNoaWxkTG9vcEhhbmRsZXIoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IHdvcmtlclByb21pc2U6IFByb21pc2U8Ym9vbGVhbj47XG4gICAgY29uc3Qgc2VsZjogQ2hhbm5lbCA9IHRoaXM7XG5cbiAgICAvLyBsb2NrIHRoZSBjdXJyZW50IHRhc2sgZm9yIHByZXZlbnQgcmFjZSBjb25kaXRpb25cbiAgICBhd2FpdCBsb2NrVGFzay5jYWxsKHNlbGYsIHRhc2spO1xuXG4gICAgLy8gZmlyZSBqb2IgYmVmb3JlIGV2ZW50XG4gICAgZmlyZUpvYklubGluZUV2ZW50LmNhbGwodGhpcywgJ2JlZm9yZScsIHdvcmtlckluc3RhbmNlLCB0YXNrLmFyZ3MpO1xuXG4gICAgLy8gZGlzcGFjdGggY3VzdG9tIGJlZm9yZSBldmVudFxuICAgIGRpc3BhdGNoRXZlbnRzLmNhbGwodGhpcywgdGFzaywgJ2JlZm9yZScpO1xuXG4gICAgLy8gaWYgaGFzIGFueSBkZXBlbmRlbmN5IGluIGRlcGVuZGVuY2llcywgZ2V0IGl0XG4gICAgY29uc3QgZGVwcyA9IFF1ZXVlLndvcmtlckRlcHNbdGFzay5oYW5kbGVyXTtcblxuICAgIC8vIHByZXBhcmluZyB3b3JrZXIgZGVwZW5kZW5jaWVzXG4gICAgY29uc3QgZGVwZW5kZW5jaWVzID0gT2JqZWN0LnZhbHVlcyhkZXBzIHx8IHt9KTtcblxuICAgIC8vIHNob3cgY29uc29sZVxuICAgIGxvZ1Byb3h5LmNhbGwoXG4gICAgICB0aGlzLFxuICAgICAgd29ya2VyUnVubmluTG9nLFxuICAgICAgd29ya2VyLFxuICAgICAgd29ya2VySW5zdGFuY2UsXG4gICAgICB0YXNrLFxuICAgICAgc2VsZi5uYW1lKCksXG4gICAgICBRdWV1ZS53b3JrZXJEZXBzLFxuICAgICk7XG5cbiAgICAvLyBDaGVjayB3b3JrZXIgaW5zdGFuY2UgYW5kIHJvdXRlIHRoZSBwcm9jZXNzIHZpYSBpbnN0YW5jZVxuICAgIGlmICh3b3JrZXJJbnN0YW5jZSBpbnN0YW5jZW9mIFdvcmtlcikge1xuICAgICAgLy8gc3RhcnQgdGhlIG5hdGl2ZSB3b3JrZXIgYnkgcGFzc2luZyB0YXNrIHBhcmFtZXRlcnMgYW5kIGRlcGVuZGVuY2llcy5cbiAgICAgIC8vIE5vdGU6IE5hdGl2ZSB3b3JrZXIgcGFyYW1ldGVycyBjYW4gbm90IGJlIGNsYXNzIG9yIGZ1bmN0aW9uLlxuICAgICAgd29ya2VySW5zdGFuY2UucG9zdE1lc3NhZ2UoeyBhcmdzOiB0YXNrLmFyZ3MsIGRlcGVuZGVuY2llcyB9KTtcblxuICAgICAgLy8gV3JhcCB0aGUgd29ya2VyIHdpdGggcHJvbWlzZSBjbGFzcy5cbiAgICAgIHdvcmtlclByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAvLyBTZXQgZnVuY3Rpb24gdG8gd29ya2VyIG9ubWVzc2FnZSBldmVudCBmb3IgaGFuZGxlIHRoZSByZXBzb25zZSBvZiB3b3JrZXIuXG4gICAgICAgIHdvcmtlckluc3RhbmNlLm9ubWVzc2FnZSA9IChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgIHJlc29sdmUod29ya2VyLmhhbmRsZXIocmVzcG9uc2UpKTtcblxuICAgICAgICAgIC8vIFRlcm1pbmF0ZSBicm93c2VyIHdvcmtlci5cbiAgICAgICAgICB3b3JrZXJJbnN0YW5jZS50ZXJtaW5hdGUoKTtcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGlzIGlzIGN1c3RvbSB3b3JrZXIgY2xhc3MuXG4gICAgICAvLyBDYWxsIHRoZSBoYW5kbGUgZnVuY3Rpb24gaW4gd29ya2VyIGFuZCBnZXQgcHJvbWlzZSBpbnN0YW5jZS5cbiAgICAgIHdvcmtlclByb21pc2UgPSB3b3JrZXJJbnN0YW5jZS5oYW5kbGUuY2FsbCh3b3JrZXJJbnN0YW5jZSwgdGFzay5hcmdzLCAuLi5kZXBlbmRlbmNpZXMpO1xuICAgIH1cblxuICAgIHdvcmtlclByb21pc2VcbiAgICAgIC8vIEhhbmRsZSB3b3JrZXIgcmV0dXJuIHByb2Nlc3MuXG4gICAgICAudGhlbigoYXdhaXQgc3VjY2Vzc0pvYkhhbmRsZXIuY2FsbChzZWxmLCB0YXNrLCB3b3JrZXJJbnN0YW5jZSkpLmJpbmQoc2VsZikpXG4gICAgICAvLyBIYW5kbGUgZXJyb3JzIGluIHdvcmtlciB3aGlsZSBpdCB3YXMgcnVubmluZy5cbiAgICAgIC5jYXRjaCgoYXdhaXQgZmFpbGVkSm9iSGFuZGxlci5jYWxsKHNlbGYsIHRhc2spKS5iaW5kKHNlbGYpKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBUaW1lb3V0IGNyZWF0b3IgaGVscGVyXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHJldHVybiB7bnVtYmVyfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlVGltZW91dCgpOiBQcm9taXNlPG51bWJlcj4ge1xuICAvLyBpZiBydW5uaW5nIGFueSBqb2IsIHN0b3AgaXRcbiAgLy8gdGhlIHB1cnBvc2UgaGVyZSBpcyB0byBwcmV2ZW50IGNvY3VycmVudCBvcGVyYXRpb24gaW4gc2FtZSBjaGFubmVsXG4gIGNsZWFyVGltZW91dCh0aGlzLmN1cnJlbnRUaW1lb3V0KTtcblxuICAvLyBHZXQgbmV4dCB0YXNrXG4gIGNvbnN0IHRhc2s6IElUYXNrID0gKGF3YWl0IGRiLmNhbGwodGhpcykuZmV0Y2goKSkuc2hpZnQoKTtcblxuICBpZiAodGFzayA9PT0gdW5kZWZpbmVkKSB7XG4gICAgbG9nUHJveHkuY2FsbCh0aGlzLCBxdWV1ZUVtcHR5TG9nLCB0aGlzLm5hbWUoKSk7XG4gICAgdGhpcy5ldmVudC5lbWl0KCdjb21wbGV0ZWQnLCB0YXNrKTtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIGlmICghUXVldWUud29ya2VyLmhhcyh0YXNrLmhhbmRsZXIpKSB7XG4gICAgbG9nUHJveHkuY2FsbCh0aGlzLCBub3RGb3VuZExvZywgdGFzay5oYW5kbGVyKTtcbiAgICBhd2FpdCAoYXdhaXQgZmFpbGVkSm9iSGFuZGxlci5jYWxsKHRoaXMsIHRhc2spKS5jYWxsKHRoaXMpO1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgLy8gR2V0IHdvcmtlciB3aXRoIGhhbmRsZXIgbmFtZVxuICBjb25zdCBKb2JXb3JrZXI6IEZ1bmN0aW9uIHwgT2JqZWN0ID0gUXVldWUud29ya2VyLmdldCh0YXNrLmhhbmRsZXIpO1xuXG4gIC8vIENyZWF0ZSBhIHdvcmtlciBpbnN0YW5jZVxuICBjb25zdCB3b3JrZXJJbnN0YW5jZTogSVdvcmtlciB8IFdvcmtlciA9XG4gICAgdHlwZW9mIEpvYldvcmtlciA9PT0gJ29iamVjdCcgPyBuZXcgV29ya2VyKEpvYldvcmtlci51cmkpIDogbmV3IEpvYldvcmtlcigpO1xuXG4gIC8vIGdldCBhbHdheXMgbGFzdCB1cGRhdGVkIGNvbmZpZyB2YWx1ZVxuICBjb25zdCB0aW1lb3V0OiBudW1iZXIgPSB0aGlzLmNvbmZpZy5nZXQoJ3RpbWVvdXQnKTtcblxuICAvLyBjcmVhdGUgYSBhcnJheSB3aXRoIGhhbmRsZXIgcGFyYW1ldGVycyBmb3Igc2hvcnRlbiBsaW5lIG51bWJlcnNcbiAgY29uc3QgcGFyYW1zID0gW3Rhc2ssIEpvYldvcmtlciwgd29ya2VySW5zdGFuY2VdO1xuXG4gIC8vIEdldCBoYW5kbGVyIGZ1bmN0aW9uIGZvciBoYW5kbGUgb24gY29tcGxldGVkIGV2ZW50XG4gIGNvbnN0IGhhbmRsZXI6IEZ1bmN0aW9uID0gKGF3YWl0IGxvb3BIYW5kbGVyLmNhbGwodGhpcywgLi4ucGFyYW1zKSkuYmluZCh0aGlzKTtcblxuICAvLyBjcmVhdGUgbmV3IHRpbWVvdXQgZm9yIHByb2Nlc3MgYSBqb2IgaW4gcXVldWVcbiAgLy8gYmluZGluZyBsb29wSGFuZGxlciBmdW5jdGlvbiB0byBzZXRUaW1lb3V0XG4gIC8vIHRoZW4gcmV0dXJuIHRoZSB0aW1lb3V0IGluc3RhbmNlXG4gIHRoaXMuY3VycmVudFRpbWVvdXQgPSBzZXRUaW1lb3V0KGhhbmRsZXIsIHRpbWVvdXQpO1xuXG4gIHJldHVybiB0aGlzLmN1cnJlbnRUaW1lb3V0O1xufVxuXG4vKipcbiAqIFNldCB0aGUgc3RhdHVzIHRvIGZhbHNlIG9mIHF1ZXVlXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHJldHVybiB7dm9pZH1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXR1c09mZigpOiB2b2lkIHtcbiAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgYSB0YXNrIGlzIHJlcGxpY2FibGUgb3Igbm90XG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNhbk11bHRpcGxlKHRhc2s6IElUYXNrKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGlmICh0eXBlb2YgdGFzayAhPT0gJ29iamVjdCcgfHwgdGFzay51bmlxdWUgIT09IHRydWUpIHJldHVybiB0cnVlO1xuICByZXR1cm4gKGF3YWl0IHRoaXMuaGFzQnlUYWcodGFzay50YWcpKSA9PT0gZmFsc2U7XG59XG4iLCJpbXBvcnQgJ3BzZXVkby13b3JrZXIvcG9seWZpbGwnO1xuaW1wb3J0IFF1ZXVlIGZyb20gJy4vcXVldWUnO1xuXG4vKiBnbG9iYWwgd2luZG93OnRydWUgKi9cblxuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gIHdpbmRvdy5RdWV1ZSA9IFF1ZXVlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBRdWV1ZTtcbiIsIi8qIEBmbG93ICovXG5pbXBvcnQgdHlwZSBJQ29uZmlnIGZyb20gJy4vaW50ZXJmYWNlcy9jb25maWcnO1xuaW1wb3J0IENoYW5uZWwgZnJvbSAnLi9jaGFubmVsJztcbmltcG9ydCBDb250YWluZXIgZnJvbSAnLi9jb250YWluZXInO1xuaW1wb3J0IENvbmZpZyBmcm9tICcuL2NvbmZpZyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFF1ZXVlKGNvbmZpZzogSUNvbmZpZykge1xuICB0aGlzLmNvbmZpZyA9IG5ldyBDb25maWcoY29uZmlnKTtcbn1cblxuUXVldWUuRklGTyA9ICdmaWZvJztcblF1ZXVlLkxJRk8gPSAnbGlmbyc7XG5RdWV1ZS5kcml2ZXJzID0ge307XG5RdWV1ZS53b3JrZXJEZXBzID0ge307XG5RdWV1ZS53b3JrZXIgPSBuZXcgQ29udGFpbmVyKCk7XG5RdWV1ZS5wcm90b3R5cGUuY29udGFpbmVyID0gbmV3IENvbnRhaW5lcigpO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBjaGFubmVsXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSB0YXNrXG4gKiBAcmV0dXJuIHtRdWV1ZX0gY2hhbm5lbFxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblF1ZXVlLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoY2hhbm5lbDogc3RyaW5nKTogUXVldWUge1xuICBpZiAoIXRoaXMuY29udGFpbmVyLmhhcyhjaGFubmVsKSkge1xuICAgIHRoaXMuY29udGFpbmVyLmJpbmQoY2hhbm5lbCwgbmV3IENoYW5uZWwoY2hhbm5lbCwgdGhpcy5jb25maWcpKTtcbiAgfVxuICByZXR1cm4gdGhpcy5jb250YWluZXIuZ2V0KGNoYW5uZWwpO1xufTtcblxuLyoqXG4gKiBHZXQgY2hhbm5lbCBpbnN0YW5jZSBieSBjaGFubmVsIG5hbWVcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge1F1ZXVlfVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblF1ZXVlLnByb3RvdHlwZS5jaGFubmVsID0gZnVuY3Rpb24gY2hhbm5lbChuYW1lOiBzdHJpbmcpOiBRdWV1ZSB7XG4gIGlmICghdGhpcy5jb250YWluZXIuaGFzKG5hbWUpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBcIiR7bmFtZX1cIiBjaGFubmVsIG5vdCBmb3VuZGApO1xuICB9XG4gIHJldHVybiB0aGlzLmNvbnRhaW5lci5nZXQobmFtZSk7XG59O1xuXG4vKipcbiAqIFNldCBjb25maWcgdGltZW91dCB2YWx1ZVxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gdmFsXG4gKiBAcmV0dXJuIHtWb2lkfVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblF1ZXVlLnByb3RvdHlwZS5zZXRUaW1lb3V0ID0gZnVuY3Rpb24gc2V0VGltZW91dCh2YWw6IG51bWJlcik6IHZvaWQge1xuICB0aGlzLmNvbmZpZy5zZXQoJ3RpbWVvdXQnLCB2YWwpO1xufTtcblxuLyoqXG4gKiBTZXQgY29uZmlnIGxpbWl0IHZhbHVlXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSB2YWxcbiAqIEByZXR1cm4ge1ZvaWR9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUXVldWUucHJvdG90eXBlLnNldExpbWl0ID0gZnVuY3Rpb24gc2V0TGltaXQodmFsOiBudW1iZXIpOiB2b2lkIHtcbiAgdGhpcy5jb25maWcuc2V0KCdsaW1pdCcsIHZhbCk7XG59O1xuXG4vKipcbiAqIFNldCBjb25maWcgcHJlZml4IHZhbHVlXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1ZvaWR9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUXVldWUucHJvdG90eXBlLnNldFByZWZpeCA9IGZ1bmN0aW9uIHNldFByZWZpeCh2YWw6IHN0cmluZyk6IHZvaWQge1xuICB0aGlzLmNvbmZpZy5zZXQoJ3ByZWZpeCcsIHZhbCk7XG59O1xuXG4vKipcbiAqIFNldCBjb25maWcgcHJpY2lwbGUgdmFsdWVcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHZhbFxuICogQHJldHVybiB7Vm9pZH1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5RdWV1ZS5wcm90b3R5cGUuc2V0UHJpbmNpcGxlID0gZnVuY3Rpb24gc2V0UHJpbmNpcGxlKHZhbDogc3RyaW5nKTogdm9pZCB7XG4gIHRoaXMuY29uZmlnLnNldCgncHJpbmNpcGxlJywgdmFsKTtcbn07XG5cbi8qKlxuICogU2V0IGNvbmZpZyBkZWJ1ZyB2YWx1ZVxuICpcbiAqIEBwYXJhbSAge0Jvb2xlYW59IHZhbFxuICogQHJldHVybiB7Vm9pZH1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5RdWV1ZS5wcm90b3R5cGUuc2V0RGVidWcgPSBmdW5jdGlvbiBzZXREZWJ1Zyh2YWw6IGJvb2xlYW4pOiB2b2lkIHtcbiAgdGhpcy5jb25maWcuc2V0KCdkZWJ1ZycsIHZhbCk7XG59O1xuXG5RdWV1ZS5wcm90b3R5cGUuc2V0U3RvcmFnZSA9IGZ1bmN0aW9uIHNldFN0b3JhZ2UodmFsOiBzdHJpbmcpOiB2b2lkIHtcbiAgdGhpcy5jb25maWcuc2V0KCdzdG9yYWdlJywgdmFsKTtcbn07XG5cbi8qKlxuICogUmVnaXN0ZXIgd29ya2VyXG4gKlxuICogQHBhcmFtICB7QXJyYXk8SUpvYj59IGpvYnNcbiAqIEByZXR1cm4ge1ZvaWR9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUXVldWUud29ya2VycyA9IGZ1bmN0aW9uIHdvcmtlcnMod29ya2Vyc09iajogeyBbcHJvcDogc3RyaW5nXTogYW55IH0gPSB7fSk6IHZvaWQge1xuICBpZiAoISh3b3JrZXJzT2JqIGluc3RhbmNlb2YgT2JqZWN0KSkge1xuICAgIHRocm93IG5ldyBFcnJvcignVGhlIHBhcmFtZXRlcnMgc2hvdWxkIGJlIG9iamVjdC4nKTtcbiAgfVxuXG4gIFF1ZXVlLndvcmtlci5tZXJnZSh3b3JrZXJzT2JqKTtcbn07XG5cbi8qKlxuICogQWRkZWQgd29ya2VycyBkZXBlbmRlbmNpZXNcbiAqXG4gKiBAcGFyYW0gIHtPYmplY3R9IGRyaXZlclxuICogQHJldHVybiB7Vm9pZH1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5RdWV1ZS5kZXBzID0gZnVuY3Rpb24gZGVwcyhkZXBlbmRlbmNpZXM6IHsgW3Byb3A6IHN0cmluZ106IGFueSB9ID0ge30pOiB2b2lkIHtcbiAgaWYgKCEoZGVwZW5kZW5jaWVzIGluc3RhbmNlb2YgT2JqZWN0KSkge1xuICAgIHRocm93IG5ldyBFcnJvcignVGhlIHBhcmFtZXRlcnMgc2hvdWxkIGJlIG9iamVjdC4nKTtcbiAgfVxuICBRdWV1ZS53b3JrZXJEZXBzID0gZGVwZW5kZW5jaWVzO1xufTtcblxuLyoqXG4gKiBTZXR1cCBhIGN1c3RvbSBkcml2ZXJcbiAqXG4gKiBAcGFyYW0gIHtPYmplY3R9IGRyaXZlclxuICogQHJldHVybiB7Vm9pZH1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5RdWV1ZS51c2UgPSBmdW5jdGlvbiB1c2UoZHJpdmVyOiB7IFtwcm9wOiBzdHJpbmddOiBhbnkgfSA9IHt9KTogdm9pZCB7XG4gIFF1ZXVlLmRyaXZlcnMgPSB7IC4uLlF1ZXVlLmRyaXZlcnMsIC4uLmRyaXZlciB9O1xufTtcbiIsIi8qIEBmbG93ICovXG5pbXBvcnQgZ3JvdXBCeSBmcm9tICdncm91cC1ieSc7XG5pbXBvcnQgdHlwZSBJQ29uZmlnIGZyb20gJy4vaW50ZXJmYWNlcy9jb25maWcnO1xuaW1wb3J0IHR5cGUgeyBJU3RvcmFnZSB9IGZyb20gJy4vaW50ZXJmYWNlcy9zdG9yYWdlJztcbmltcG9ydCB0eXBlIElUYXNrIGZyb20gJy4vaW50ZXJmYWNlcy90YXNrJztcbmltcG9ydCB7IExvY2FsU3RvcmFnZUFkYXB0ZXIsIEluTWVtb3J5QWRhcHRlciB9IGZyb20gJy4vYWRhcHRlcnMnO1xuaW1wb3J0IHsgZXhjbHVkZVNwZWNpZmljVGFza3MsIGxpZm8sIGZpZm8gfSBmcm9tICcuL3V0aWxzJztcblxuLyogZXNsaW50IG5vLWNvbnNvbGU6IFtcImVycm9yXCIsIHsgYWxsb3c6IFtcIndhcm5cIiwgXCJlcnJvclwiXSB9XSAqL1xuLyogZXNsaW50IG5vLXVuZGVyc2NvcmUtZGFuZ2xlOiBbMiwgeyBcImFsbG93XCI6IFtcIl9pZFwiXSB9XSAqL1xuLyogZXNsaW50IGNsYXNzLW1ldGhvZHMtdXNlLXRoaXM6IFtcImVycm9yXCIsIHsgXCJleGNlcHRNZXRob2RzXCI6IFtcImdlbmVyYXRlSWRcIl0gfV0gKi9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RvcmFnZUNhcHN1bGUge1xuICBjb25maWc6IElDb25maWc7XG4gIHN0b3JhZ2U6IElTdG9yYWdlO1xuICBzdG9yYWdlQ2hhbm5lbDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogSUNvbmZpZywgc3RvcmFnZTogSVN0b3JhZ2UpIHtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLnN0b3JhZ2UgPSB0aGlzLmluaXRpYWxpemUoc3RvcmFnZSk7XG4gIH1cblxuICBpbml0aWFsaXplKFN0b3JhZ2U6IGFueSkge1xuICAgIGlmICh0eXBlb2YgU3RvcmFnZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiBTdG9yYWdlO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIFN0b3JhZ2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBuZXcgU3RvcmFnZSh0aGlzLmNvbmZpZyk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmNvbmZpZy5nZXQoJ3N0b3JhZ2UnKSA9PT0gJ2xvY2Fsc3RvcmFnZScpIHtcbiAgICAgIHJldHVybiBuZXcgTG9jYWxTdG9yYWdlQWRhcHRlcih0aGlzLmNvbmZpZyk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgSW5NZW1vcnlBZGFwdGVyKHRoaXMuY29uZmlnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWxlY3QgYSBjaGFubmVsIGJ5IGNoYW5uZWwgbmFtZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVcbiAgICogQHJldHVybiB7U3RvcmFnZUNhcHN1bGV9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBjaGFubmVsKG5hbWU6IHN0cmluZyk6IFN0b3JhZ2VDYXBzdWxlIHtcbiAgICB0aGlzLnN0b3JhZ2VDaGFubmVsID0gbmFtZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaCB0YXNrcyBmcm9tIHN0b3JhZ2Ugd2l0aCBvcmRlcmVkXG4gICAqXG4gICAqIEByZXR1cm4ge2FueVtdfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgZmV0Y2goKTogUHJvbWlzZTxhbnlbXT4ge1xuICAgIGNvbnN0IGFsbCA9IChhd2FpdCB0aGlzLmFsbCgpKS5maWx0ZXIoZXhjbHVkZVNwZWNpZmljVGFza3MpO1xuICAgIGNvbnN0IHRhc2tzID0gZ3JvdXBCeShhbGwsICdwcmlvcml0eScpO1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0YXNrcylcbiAgICAgIC5tYXAoa2V5ID0+IHBhcnNlSW50KGtleSwgMTApKVxuICAgICAgLnNvcnQoKGEsIGIpID0+IGIgLSBhKVxuICAgICAgLnJlZHVjZSh0aGlzLnJlZHVjZVRhc2tzKHRhc2tzKSwgW10pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNhdmUgdGFzayB0byBzdG9yYWdlXG4gICAqXG4gICAqIEBwYXJhbSAge0lUYXNrfSB0YXNrXG4gICAqIEByZXR1cm4ge1N0cmluZ3xCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgc2F2ZSh0YXNrOiBJVGFzayk6IFByb21pc2U8c3RyaW5nIHwgYm9vbGVhbj4ge1xuICAgIGlmICh0eXBlb2YgdGFzayAhPT0gJ29iamVjdCcpIHJldHVybiBmYWxzZTtcblxuICAgIC8vIGdldCBhbGwgdGFza3MgY3VycmVudCBjaGFubmVsJ3NcbiAgICBjb25zdCB0YXNrczogSVRhc2tbXSA9IGF3YWl0IHRoaXMuc3RvcmFnZS5nZXQodGhpcy5zdG9yYWdlQ2hhbm5lbCk7XG5cbiAgICAvLyBDaGVjayB0aGUgY2hhbm5lbCBsaW1pdC5cbiAgICAvLyBJZiBsaW1pdCBpcyBleGNlZWRlZCwgZG9lcyBub3QgaW5zZXJ0IG5ldyB0YXNrXG4gICAgaWYgKGF3YWl0IHRoaXMuaXNFeGNlZWRlZCgpKSB7XG4gICAgICBjb25zb2xlLndhcm4oYFRhc2sgbGltaXQgZXhjZWVkZWQ6IFRoZSAnJHt0aGlzLnN0b3JhZ2VDaGFubmVsfScgY2hhbm5lbCBsaW1pdCBpcyAke3RoaXMuY29uZmlnLmdldCgnbGltaXQnKX1gKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBwcmVwYXJlIGFsbCBwcm9wZXJ0aWVzIGJlZm9yZSBzYXZlXG4gICAgLy8gZXhhbXBsZTogY3JlYXRlZEF0IGV0Yy5cbiAgICBjb25zdCBuZXdUYXNrID0gdGhpcy5wcmVwYXJlVGFzayh0YXNrKTtcblxuICAgIC8vIGFkZCB0YXNrIHRvIHN0b3JhZ2VcbiAgICB0YXNrcy5wdXNoKG5ld1Rhc2spO1xuXG4gICAgLy8gc2F2ZSB0YXNrc1xuICAgIGF3YWl0IHRoaXMuc3RvcmFnZS5zZXQodGhpcy5zdG9yYWdlQ2hhbm5lbCwgdGFza3MpO1xuXG4gICAgcmV0dXJuIG5ld1Rhc2suX2lkO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBjaGFubmVsIHN0b3JlLlxuICAgKlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqICAgVGhlIHZhbHVlLiBUaGlzIGFubm90YXRpb24gY2FuIGJlIHVzZWQgZm9yIHR5cGUgaGludGluZyBwdXJwb3Nlcy5cbiAgICovXG4gIGFzeW5jIHVwZGF0ZShpZDogc3RyaW5nLCB1cGRhdGU6IHsgW3Byb3BlcnR5OiBzdHJpbmddOiBhbnkgfSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGRhdGE6IGFueVtdID0gYXdhaXQgdGhpcy5hbGwoKTtcbiAgICBjb25zdCBpbmRleDogbnVtYmVyID0gZGF0YS5maW5kSW5kZXgodCA9PiB0Ll9pZCA9PT0gaWQpO1xuXG4gICAgLy8gaWYgaW5kZXggbm90IGZvdW5kLCByZXR1cm4gZmFsc2VcbiAgICBpZiAoaW5kZXggPCAwKSByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBtZXJnZSBleGlzdGluZyBvYmplY3Qgd2l0aCBnaXZlbiB1cGRhdGUgb2JqZWN0XG4gICAgZGF0YVtpbmRleF0gPSBPYmplY3QuYXNzaWduKHt9LCBkYXRhW2luZGV4XSwgdXBkYXRlKTtcblxuICAgIC8vIHNhdmUgdG8gdGhlIHN0b3JhZ2UgYXMgc3RyaW5nXG4gICAgYXdhaXQgdGhpcy5zdG9yYWdlLnNldCh0aGlzLnN0b3JhZ2VDaGFubmVsLCBkYXRhKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSB0YXNrIGZyb20gc3RvcmFnZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGlkXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBkZWxldGUoaWQ6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGRhdGE6IGFueVtdID0gYXdhaXQgdGhpcy5hbGwoKTtcbiAgICBjb25zdCBpbmRleDogbnVtYmVyID0gZGF0YS5maW5kSW5kZXgoZCA9PiBkLl9pZCA9PT0gaWQpO1xuXG4gICAgaWYgKGluZGV4IDwgMCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgZGVsZXRlIGRhdGFbaW5kZXhdO1xuXG4gICAgYXdhaXQgdGhpcy5zdG9yYWdlLnNldCh0aGlzLnN0b3JhZ2VDaGFubmVsLCBkYXRhLmZpbHRlcihkID0+IGQpKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgdGFza3NcbiAgICpcbiAgICogQHJldHVybiB7QW55W119XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBhbGwoKTogUHJvbWlzZTxJVGFza1tdPiB7XG4gICAgY29uc3QgaXRlbXMgPSBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0KHRoaXMuc3RvcmFnZUNoYW5uZWwpO1xuICAgIHJldHVybiBpdGVtcztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSB1bmlxdWUgaWRcbiAgICpcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgZ2VuZXJhdGVJZCgpOiBzdHJpbmcge1xuICAgIHJldHVybiAoKDEgKyBNYXRoLnJhbmRvbSgpKSAqIDB4MTAwMDApLnRvU3RyaW5nKDE2KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgc29tZSBuZWNlc3NhcnkgcHJvcGVydGllc1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGlkXG4gICAqIEByZXR1cm4ge0lUYXNrfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgcHJlcGFyZVRhc2sodGFzazogSVRhc2spOiBJVGFzayB7XG4gICAgY29uc3QgbmV3VGFzayA9IHsgLi4udGFzayB9O1xuICAgIG5ld1Rhc2suY3JlYXRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICBuZXdUYXNrLl9pZCA9IHRoaXMuZ2VuZXJhdGVJZCgpO1xuICAgIHJldHVybiBuZXdUYXNrO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBzb21lIG5lY2Vzc2FyeSBwcm9wZXJ0aWVzXG4gICAqXG4gICAqIEBwYXJhbSAge0lUYXNrW119IHRhc2tzXG4gICAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgcmVkdWNlVGFza3ModGFza3M6IElUYXNrW10pIHtcbiAgICBjb25zdCByZWR1Y2VGdW5jID0gKHJlc3VsdDogSVRhc2tbXSwga2V5OiBhbnkpOiBJVGFza1tdID0+IHtcbiAgICAgIGlmICh0aGlzLmNvbmZpZy5nZXQoJ3ByaW5jaXBsZScpID09PSAnbGlmbycpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5jb25jYXQodGFza3Nba2V5XS5zb3J0KGxpZm8pKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQuY29uY2F0KHRhc2tzW2tleV0uc29ydChmaWZvKSk7XG4gICAgfTtcblxuICAgIHJldHVybiByZWR1Y2VGdW5jLmJpbmQodGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogVGFzayBsaW1pdCBjaGVja2VyXG4gICAqXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBpc0V4Y2VlZGVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGxpbWl0OiBudW1iZXIgPSB0aGlzLmNvbmZpZy5nZXQoJ2xpbWl0Jyk7XG4gICAgY29uc3QgdGFza3M6IElUYXNrW10gPSAoYXdhaXQgdGhpcy5hbGwoKSkuZmlsdGVyKGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzKTtcbiAgICByZXR1cm4gIShsaW1pdCA9PT0gLTEgfHwgbGltaXQgPiB0YXNrcy5sZW5ndGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFyIHRhc2tzIHdpdGggZ2l2ZW4gY2hhbm5lbCBuYW1lXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gY2hhbm5lbFxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgY2xlYXIoY2hhbm5lbDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5zdG9yYWdlLmNsZWFyKGNoYW5uZWwpO1xuICB9XG59XG4iLCIvKiBAZmxvdyAqL1xuaW1wb3J0IHR5cGUgSVRhc2sgZnJvbSAnLi9pbnRlcmZhY2VzL3Rhc2snO1xuXG4vKiBlc2xpbnQgY29tbWEtZGFuZ2xlOiBbXCJlcnJvclwiLCBcIm5ldmVyXCJdICovXG5cbi8qKlxuICogQ2hlY2sgcHJvcGVydHkgaW4gb2JqZWN0XG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc1Byb3BlcnR5KGZ1bmM6IEZ1bmN0aW9uLCBuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChmdW5jLCBuYW1lKTtcbn1cblxuLyoqXG4gKiBDaGVjayBtZXRob2QgaW4gaW5pdGlhdGVkIGNsYXNzXG4gKlxuICogQHBhcmFtICB7Q2xhc3N9IGluc3RhbmNlXG4gKiBAcGFyYW0gIHtTdHJpbmd9IG1ldGhvZFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gaGFzTWV0aG9kKGluc3RhbmNlOiBhbnksIG1ldGhvZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBpbnN0YW5jZSBpbnN0YW5jZW9mIE9iamVjdCAmJiBtZXRob2QgaW4gaW5zdGFuY2U7XG59XG5cbi8qKlxuICogQ2hlY2sgZnVuY3Rpb24gdHlwZVxuICpcbiAqIEBwYXJhbSAge0Z1bmN0aW9ufSBmdW5jXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0Z1bmN0aW9uKGZ1bmM6IEZ1bmN0aW9uKTogYm9vbGVhbiB7XG4gIHJldHVybiBmdW5jIGluc3RhbmNlb2YgRnVuY3Rpb247XG59XG5cbi8qKlxuICogUmVtb3ZlIHNvbWUgdGFza3MgYnkgc29tZSBjb25kaXRpb25zXG4gKlxuICogQHBhcmFtICB7RnVuY3Rpb259IGZ1bmNcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzKHRhc2s6IElUYXNrKTogYm9vbGVhbiB7XG4gIGNvbnN0IGNvbmRpdGlvbnMgPSBBcnJheS5pc0FycmF5KHRoaXMpID8gdGhpcyA6IFsnZnJlZXplZCcsICdsb2NrZWQnXTtcbiAgY29uc3QgcmVzdWx0cyA9IFtdO1xuXG4gIGNvbmRpdGlvbnMuZm9yRWFjaCgoYykgPT4ge1xuICAgIHJlc3VsdHMucHVzaChoYXNQcm9wZXJ0eSh0YXNrLCBjKSA9PT0gZmFsc2UgfHwgdGFza1tjXSA9PT0gZmFsc2UpO1xuICB9KTtcblxuICByZXR1cm4gIShyZXN1bHRzLmluZGV4T2YoZmFsc2UpID4gLTEpO1xufVxuXG4vKipcbiAqIENsZWFyIHRhc2tzIGJ5IGl0J3MgdGFnc1xuICpcbiAqIEBwYXJhbSAge0lUYXNrfSB0YXNrXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1dGlsQ2xlYXJCeVRhZyh0YXNrOiBJVGFzayk6IGJvb2xlYW4ge1xuICBpZiAoIWV4Y2x1ZGVTcGVjaWZpY1Rhc2tzLmNhbGwoWydsb2NrZWQnXSwgdGFzaykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRhc2sudGFnID09PSB0aGlzO1xufVxuXG4vKipcbiAqIFNvcnQgYnkgZmlmb1xuICpcbiAqIEBwYXJhbSAge0lUYXNrfSBhXG4gKiBAcGFyYW0gIHtJVGFza30gYlxuICogQHJldHVybiB7QW55fVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaWZvKGE6IElUYXNrLCBiOiBJVGFzayk6IGFueSB7XG4gIHJldHVybiBhLmNyZWF0ZWRBdCAtIGIuY3JlYXRlZEF0O1xufVxuXG4vKipcbiAqIFNvcnQgYnkgbGlmb1xuICpcbiAqIEBwYXJhbSAge0lUYXNrfSBhXG4gKiBAcGFyYW0gIHtJVGFza30gYlxuICogQHJldHVybiB7QW55fVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsaWZvKGE6IElUYXNrLCBiOiBJVGFzayk6IGFueSB7XG4gIHJldHVybiBiLmNyZWF0ZWRBdCAtIGEuY3JlYXRlZEF0O1xufVxuIl19
