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
                    addEventListener: workerAddEventListener
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

                              _helpers.logProxy.call(
                                this,
                                _console.queueStartLog,
                                'start'
                              );

                              // Create a timeout for start queue
                              _context3.next = 4;
                              return _helpers.createTimeout.call(this);
                            case 4:
                              _context3.t0 = _context3.sent;
                              this.running = _context3.t0 > 0;
                              return _context3.abrupt(
                                'return',

                                this.running
                              );
                            case 7:
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
                _helpers.logProxy.call(this, _console.eventCreatedLog, key);
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
            created: 'New event created',
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
                        stopQueue.call(this);
                        return _context11.abrupt('return', 1);
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
                        return _context11.abrupt('return', 1);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9yZWdlbmVyYXRvci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb21wb25lbnQtcHJvcHMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZ3JvdXAtYnkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvb2JqZWN0LXBhdGgvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcHNldWRvLXdvcmtlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wc2V1ZG8td29ya2VyL3BvbHlmaWxsLmpzIiwibm9kZV9tb2R1bGVzL3JlZ2VuZXJhdG9yLXJ1bnRpbWUvcnVudGltZS1tb2R1bGUuanMiLCJub2RlX21vZHVsZXMvcmVnZW5lcmF0b3ItcnVudGltZS9ydW50aW1lLmpzIiwibm9kZV9tb2R1bGVzL3RvLWZ1bmN0aW9uL2luZGV4LmpzIiwic3JjL2FkYXB0ZXJzL2luZGV4LmpzIiwic3JjL2FkYXB0ZXJzL2lubWVtb3J5LmpzIiwic3JjL2FkYXB0ZXJzL2xvY2Fsc3RvcmFnZS5qcyIsInNyYy9jaGFubmVsLmpzIiwic3JjL2NvbmZpZy5qcyIsInNyYy9jb25zb2xlLmpzIiwic3JjL2NvbnRhaW5lci5qcyIsInNyYy9lbnVtL2NvbmZpZy5kYXRhLmpzIiwic3JjL2VudW0vbG9nLmV2ZW50cy5qcyIsInNyYy9ldmVudC5qcyIsInNyYy9oZWxwZXJzLmpzIiwic3JjL2luZGV4LmpzIiwic3JjL3F1ZXVlLmpzIiwic3JjL3N0b3JhZ2UtY2Fwc3VsZS5qcyIsInNyYy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUMxS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3Z0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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NUQsT0FGRCxHQUlBLE9BQU8sRUFBRSxRQUFBLEFBQVEsUUFBUixBQUFnQixTQUFTLENBQWxDLEFBQU8sQUFBNEIsQUFDcEMsRyxFQUVEOzs7Ozs7OzJrQkFRTyxTQUFBLEFBQVMsZUFBVCxBQUF3QixNQUFzQixDQUNuRCxJQUFJLENBQUMscUJBQUEsQUFBcUIsS0FBSyxDQUExQixBQUEwQixBQUFDLFdBQWhDLEFBQUssQUFBc0MsT0FBTyxDQUNoRCxPQUFBLEFBQU8sQUFDUixNQUNELFFBQU8sS0FBQSxBQUFLLFFBQVosQUFBb0IsQUFDckIsSyxFQUVEOzs7Ozs7Ozt5c0JBU08sU0FBQSxBQUFTLEtBQVQsQUFBYyxHQUFkLEFBQXdCLEdBQWUsQ0FDNUMsT0FBTyxFQUFBLEFBQUUsWUFBWSxFQUFyQixBQUF1QixBQUN4QixVLEVBRUQ7Ozs7Ozs7O293QkFTTyxTQUFBLEFBQVMsS0FBVCxBQUFjLEdBQWQsQUFBd0IsR0FBZSxDQUM1QyxPQUFPLEVBQUEsQUFBRSxZQUFZLEVBQXJCLEFBQXVCLEFBQ3hCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicmVnZW5lcmF0b3ItcnVudGltZVwiKTtcbiIsIi8qKlxuICogR2xvYmFsIE5hbWVzXG4gKi9cblxudmFyIGdsb2JhbHMgPSAvXFxiKEFycmF5fERhdGV8T2JqZWN0fE1hdGh8SlNPTilcXGIvZztcblxuLyoqXG4gKiBSZXR1cm4gaW1tZWRpYXRlIGlkZW50aWZpZXJzIHBhcnNlZCBmcm9tIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSBtYXAgZnVuY3Rpb24gb3IgcHJlZml4XG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdHIsIGZuKXtcbiAgdmFyIHAgPSB1bmlxdWUocHJvcHMoc3RyKSk7XG4gIGlmIChmbiAmJiAnc3RyaW5nJyA9PSB0eXBlb2YgZm4pIGZuID0gcHJlZml4ZWQoZm4pO1xuICBpZiAoZm4pIHJldHVybiBtYXAoc3RyLCBwLCBmbik7XG4gIHJldHVybiBwO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gaW1tZWRpYXRlIGlkZW50aWZpZXJzIGluIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcHJvcHMoc3RyKSB7XG4gIHJldHVybiBzdHJcbiAgICAucmVwbGFjZSgvXFwuXFx3K3xcXHcrICpcXCh8XCJbXlwiXSpcInwnW14nXSonfFxcLyhbXi9dKylcXC8vZywgJycpXG4gICAgLnJlcGxhY2UoZ2xvYmFscywgJycpXG4gICAgLm1hdGNoKC9bYS16QS1aX11cXHcqL2cpXG4gICAgfHwgW107XG59XG5cbi8qKlxuICogUmV0dXJuIGBzdHJgIHdpdGggYHByb3BzYCBtYXBwZWQgd2l0aCBgZm5gLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7QXJyYXl9IHByb3BzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbWFwKHN0ciwgcHJvcHMsIGZuKSB7XG4gIHZhciByZSA9IC9cXC5cXHcrfFxcdysgKlxcKHxcIlteXCJdKlwifCdbXiddKid8XFwvKFteL10rKVxcL3xbYS16QS1aX11cXHcqL2c7XG4gIHJldHVybiBzdHIucmVwbGFjZShyZSwgZnVuY3Rpb24oXyl7XG4gICAgaWYgKCcoJyA9PSBfW18ubGVuZ3RoIC0gMV0pIHJldHVybiBmbihfKTtcbiAgICBpZiAoIX5wcm9wcy5pbmRleE9mKF8pKSByZXR1cm4gXztcbiAgICByZXR1cm4gZm4oXyk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFJldHVybiB1bmlxdWUgYXJyYXkuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHVuaXF1ZShhcnIpIHtcbiAgdmFyIHJldCA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKH5yZXQuaW5kZXhPZihhcnJbaV0pKSBjb250aW51ZTtcbiAgICByZXQucHVzaChhcnJbaV0pO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn1cblxuLyoqXG4gKiBNYXAgd2l0aCBwcmVmaXggYHN0cmAuXG4gKi9cblxuZnVuY3Rpb24gcHJlZml4ZWQoc3RyKSB7XG4gIHJldHVybiBmdW5jdGlvbihfKXtcbiAgICByZXR1cm4gc3RyICsgXztcbiAgfTtcbn1cbiIsIlxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciB0b0Z1bmN0aW9uID0gcmVxdWlyZSgndG8tZnVuY3Rpb24nKTtcblxuLyoqXG4gKiBHcm91cCBgYXJyYCB3aXRoIGNhbGxiYWNrIGBmbih2YWwsIGkpYC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJcbiAqIEBwYXJhbSB7RnVuY3Rpb258U3RyaW5nfSBmbiBvciBwcm9wXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcnIsIGZuKXtcbiAgdmFyIHJldCA9IHt9O1xuICB2YXIgcHJvcDtcbiAgZm4gPSB0b0Z1bmN0aW9uKGZuKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7ICsraSkge1xuICAgIHByb3AgPSBmbihhcnJbaV0sIGkpO1xuICAgIHJldFtwcm9wXSA9IHJldFtwcm9wXSB8fCBbXTtcbiAgICByZXRbcHJvcF0ucHVzaChhcnJbaV0pO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn07IiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KXtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qaXN0YW5idWwgaWdub3JlIG5leHQ6Y2FudCB0ZXN0Ki9cbiAgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKFtdLCBmYWN0b3J5KTtcbiAgfSBlbHNlIHtcbiAgICAvLyBCcm93c2VyIGdsb2JhbHNcbiAgICByb290Lm9iamVjdFBhdGggPSBmYWN0b3J5KCk7XG4gIH1cbn0pKHRoaXMsIGZ1bmN0aW9uKCl7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgdG9TdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuICBmdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgICBpZihvYmogPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIC8vdG8gaGFuZGxlIG9iamVjdHMgd2l0aCBudWxsIHByb3RvdHlwZXMgKHRvbyBlZGdlIGNhc2U/KVxuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKVxuICB9XG5cbiAgZnVuY3Rpb24gaXNFbXB0eSh2YWx1ZSl7XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmIChpc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGZvciAodmFyIGkgaW4gdmFsdWUpIHtcbiAgICAgICAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgaSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRvU3RyaW5nKHR5cGUpe1xuICAgIHJldHVybiB0b1N0ci5jYWxsKHR5cGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNPYmplY3Qob2JqKXtcbiAgICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgdG9TdHJpbmcob2JqKSA9PT0gXCJbb2JqZWN0IE9iamVjdF1cIjtcbiAgfVxuXG4gIHZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbihvYmope1xuICAgIC8qaXN0YW5idWwgaWdub3JlIG5leHQ6Y2FudCB0ZXN0Ki9cbiAgICByZXR1cm4gdG9TdHIuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNCb29sZWFuKG9iail7XG4gICAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdib29sZWFuJyB8fCB0b1N0cmluZyhvYmopID09PSAnW29iamVjdCBCb29sZWFuXSc7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRLZXkoa2V5KXtcbiAgICB2YXIgaW50S2V5ID0gcGFyc2VJbnQoa2V5KTtcbiAgICBpZiAoaW50S2V5LnRvU3RyaW5nKCkgPT09IGtleSkge1xuICAgICAgcmV0dXJuIGludEtleTtcbiAgICB9XG4gICAgcmV0dXJuIGtleTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZhY3Rvcnkob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG5cbiAgICB2YXIgb2JqZWN0UGF0aCA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iamVjdFBhdGgpLnJlZHVjZShmdW5jdGlvbihwcm94eSwgcHJvcCkge1xuICAgICAgICBpZihwcm9wID09PSAnY3JlYXRlJykge1xuICAgICAgICAgIHJldHVybiBwcm94eTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qaXN0YW5idWwgaWdub3JlIGVsc2UqL1xuICAgICAgICBpZiAodHlwZW9mIG9iamVjdFBhdGhbcHJvcF0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBwcm94eVtwcm9wXSA9IG9iamVjdFBhdGhbcHJvcF0uYmluZChvYmplY3RQYXRoLCBvYmopO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHByb3h5O1xuICAgICAgfSwge30pO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBoYXNTaGFsbG93UHJvcGVydHkob2JqLCBwcm9wKSB7XG4gICAgICByZXR1cm4gKG9wdGlvbnMuaW5jbHVkZUluaGVyaXRlZFByb3BzIHx8ICh0eXBlb2YgcHJvcCA9PT0gJ251bWJlcicgJiYgQXJyYXkuaXNBcnJheShvYmopKSB8fCBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApKVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFNoYWxsb3dQcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgICAgIGlmIChoYXNTaGFsbG93UHJvcGVydHkob2JqLCBwcm9wKSkge1xuICAgICAgICByZXR1cm4gb2JqW3Byb3BdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldChvYmosIHBhdGgsIHZhbHVlLCBkb05vdFJlcGxhY2Upe1xuICAgICAgaWYgKHR5cGVvZiBwYXRoID09PSAnbnVtYmVyJykge1xuICAgICAgICBwYXRoID0gW3BhdGhdO1xuICAgICAgfVxuICAgICAgaWYgKCFwYXRoIHx8IHBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHBhdGggPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBzZXQob2JqLCBwYXRoLnNwbGl0KCcuJykubWFwKGdldEtleSksIHZhbHVlLCBkb05vdFJlcGxhY2UpO1xuICAgICAgfVxuICAgICAgdmFyIGN1cnJlbnRQYXRoID0gcGF0aFswXTtcbiAgICAgIHZhciBjdXJyZW50VmFsdWUgPSBnZXRTaGFsbG93UHJvcGVydHkob2JqLCBjdXJyZW50UGF0aCk7XG4gICAgICBpZiAocGF0aC5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgaWYgKGN1cnJlbnRWYWx1ZSA9PT0gdm9pZCAwIHx8ICFkb05vdFJlcGxhY2UpIHtcbiAgICAgICAgICBvYmpbY3VycmVudFBhdGhdID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGN1cnJlbnRWYWx1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGN1cnJlbnRWYWx1ZSA9PT0gdm9pZCAwKSB7XG4gICAgICAgIC8vY2hlY2sgaWYgd2UgYXNzdW1lIGFuIGFycmF5XG4gICAgICAgIGlmKHR5cGVvZiBwYXRoWzFdID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIG9ialtjdXJyZW50UGF0aF0gPSBbXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvYmpbY3VycmVudFBhdGhdID0ge307XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNldChvYmpbY3VycmVudFBhdGhdLCBwYXRoLnNsaWNlKDEpLCB2YWx1ZSwgZG9Ob3RSZXBsYWNlKTtcbiAgICB9XG5cbiAgICBvYmplY3RQYXRoLmhhcyA9IGZ1bmN0aW9uIChvYmosIHBhdGgpIHtcbiAgICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcGF0aCA9IFtwYXRoXTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHBhdGggPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHBhdGggPSBwYXRoLnNwbGl0KCcuJyk7XG4gICAgICB9XG5cbiAgICAgIGlmICghcGF0aCB8fCBwYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gISFvYmo7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGF0aC5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgaiA9IGdldEtleShwYXRoW2ldKTtcblxuICAgICAgICBpZigodHlwZW9mIGogPT09ICdudW1iZXInICYmIGlzQXJyYXkob2JqKSAmJiBqIDwgb2JqLmxlbmd0aCkgfHxcbiAgICAgICAgICAob3B0aW9ucy5pbmNsdWRlSW5oZXJpdGVkUHJvcHMgPyAoaiBpbiBPYmplY3Qob2JqKSkgOiBoYXNPd25Qcm9wZXJ0eShvYmosIGopKSkge1xuICAgICAgICAgIG9iaiA9IG9ialtqXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIG9iamVjdFBhdGguZW5zdXJlRXhpc3RzID0gZnVuY3Rpb24gKG9iaiwgcGF0aCwgdmFsdWUpe1xuICAgICAgcmV0dXJuIHNldChvYmosIHBhdGgsIHZhbHVlLCB0cnVlKTtcbiAgICB9O1xuXG4gICAgb2JqZWN0UGF0aC5zZXQgPSBmdW5jdGlvbiAob2JqLCBwYXRoLCB2YWx1ZSwgZG9Ob3RSZXBsYWNlKXtcbiAgICAgIHJldHVybiBzZXQob2JqLCBwYXRoLCB2YWx1ZSwgZG9Ob3RSZXBsYWNlKTtcbiAgICB9O1xuXG4gICAgb2JqZWN0UGF0aC5pbnNlcnQgPSBmdW5jdGlvbiAob2JqLCBwYXRoLCB2YWx1ZSwgYXQpe1xuICAgICAgdmFyIGFyciA9IG9iamVjdFBhdGguZ2V0KG9iaiwgcGF0aCk7XG4gICAgICBhdCA9IH5+YXQ7XG4gICAgICBpZiAoIWlzQXJyYXkoYXJyKSkge1xuICAgICAgICBhcnIgPSBbXTtcbiAgICAgICAgb2JqZWN0UGF0aC5zZXQob2JqLCBwYXRoLCBhcnIpO1xuICAgICAgfVxuICAgICAgYXJyLnNwbGljZShhdCwgMCwgdmFsdWUpO1xuICAgIH07XG5cbiAgICBvYmplY3RQYXRoLmVtcHR5ID0gZnVuY3Rpb24ob2JqLCBwYXRoKSB7XG4gICAgICBpZiAoaXNFbXB0eShwYXRoKSkge1xuICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgfVxuICAgICAgaWYgKG9iaiA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICB9XG5cbiAgICAgIHZhciB2YWx1ZSwgaTtcbiAgICAgIGlmICghKHZhbHVlID0gb2JqZWN0UGF0aC5nZXQob2JqLCBwYXRoKSkpIHtcbiAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdFBhdGguc2V0KG9iaiwgcGF0aCwgJycpO1xuICAgICAgfSBlbHNlIGlmIChpc0Jvb2xlYW4odmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBvYmplY3RQYXRoLnNldChvYmosIHBhdGgsIGZhbHNlKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgICAgICByZXR1cm4gb2JqZWN0UGF0aC5zZXQob2JqLCBwYXRoLCAwKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgdmFsdWUubGVuZ3RoID0gMDtcbiAgICAgIH0gZWxzZSBpZiAoaXNPYmplY3QodmFsdWUpKSB7XG4gICAgICAgIGZvciAoaSBpbiB2YWx1ZSkge1xuICAgICAgICAgIGlmIChoYXNTaGFsbG93UHJvcGVydHkodmFsdWUsIGkpKSB7XG4gICAgICAgICAgICBkZWxldGUgdmFsdWVbaV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gb2JqZWN0UGF0aC5zZXQob2JqLCBwYXRoLCBudWxsKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgb2JqZWN0UGF0aC5wdXNoID0gZnVuY3Rpb24gKG9iaiwgcGF0aCAvKiwgdmFsdWVzICovKXtcbiAgICAgIHZhciBhcnIgPSBvYmplY3RQYXRoLmdldChvYmosIHBhdGgpO1xuICAgICAgaWYgKCFpc0FycmF5KGFycikpIHtcbiAgICAgICAgYXJyID0gW107XG4gICAgICAgIG9iamVjdFBhdGguc2V0KG9iaiwgcGF0aCwgYXJyKTtcbiAgICAgIH1cblxuICAgICAgYXJyLnB1c2guYXBwbHkoYXJyLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpKTtcbiAgICB9O1xuXG4gICAgb2JqZWN0UGF0aC5jb2FsZXNjZSA9IGZ1bmN0aW9uIChvYmosIHBhdGhzLCBkZWZhdWx0VmFsdWUpIHtcbiAgICAgIHZhciB2YWx1ZTtcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHBhdGhzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGlmICgodmFsdWUgPSBvYmplY3RQYXRoLmdldChvYmosIHBhdGhzW2ldKSkgIT09IHZvaWQgMCkge1xuICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICAgIH07XG5cbiAgICBvYmplY3RQYXRoLmdldCA9IGZ1bmN0aW9uIChvYmosIHBhdGgsIGRlZmF1bHRWYWx1ZSl7XG4gICAgICBpZiAodHlwZW9mIHBhdGggPT09ICdudW1iZXInKSB7XG4gICAgICAgIHBhdGggPSBbcGF0aF07XG4gICAgICB9XG4gICAgICBpZiAoIXBhdGggfHwgcGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgIH1cbiAgICAgIGlmIChvYmogPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBwYXRoID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gb2JqZWN0UGF0aC5nZXQob2JqLCBwYXRoLnNwbGl0KCcuJyksIGRlZmF1bHRWYWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIHZhciBjdXJyZW50UGF0aCA9IGdldEtleShwYXRoWzBdKTtcbiAgICAgIHZhciBuZXh0T2JqID0gZ2V0U2hhbGxvd1Byb3BlcnR5KG9iaiwgY3VycmVudFBhdGgpXG4gICAgICBpZiAobmV4dE9iaiA9PT0gdm9pZCAwKSB7XG4gICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gbmV4dE9iajtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9iamVjdFBhdGguZ2V0KG9ialtjdXJyZW50UGF0aF0sIHBhdGguc2xpY2UoMSksIGRlZmF1bHRWYWx1ZSk7XG4gICAgfTtcblxuICAgIG9iamVjdFBhdGguZGVsID0gZnVuY3Rpb24gZGVsKG9iaiwgcGF0aCkge1xuICAgICAgaWYgKHR5cGVvZiBwYXRoID09PSAnbnVtYmVyJykge1xuICAgICAgICBwYXRoID0gW3BhdGhdO1xuICAgICAgfVxuXG4gICAgICBpZiAob2JqID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzRW1wdHkocGF0aCkpIHtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgIH1cbiAgICAgIGlmKHR5cGVvZiBwYXRoID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gb2JqZWN0UGF0aC5kZWwob2JqLCBwYXRoLnNwbGl0KCcuJykpO1xuICAgICAgfVxuXG4gICAgICB2YXIgY3VycmVudFBhdGggPSBnZXRLZXkocGF0aFswXSk7XG4gICAgICBpZiAoIWhhc1NoYWxsb3dQcm9wZXJ0eShvYmosIGN1cnJlbnRQYXRoKSkge1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgfVxuXG4gICAgICBpZihwYXRoLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgICAgICAgb2JqLnNwbGljZShjdXJyZW50UGF0aCwgMSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVsZXRlIG9ialtjdXJyZW50UGF0aF07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBvYmplY3RQYXRoLmRlbChvYmpbY3VycmVudFBhdGhdLCBwYXRoLnNsaWNlKDEpKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG5cbiAgICByZXR1cm4gb2JqZWN0UGF0aDtcbiAgfVxuXG4gIHZhciBtb2QgPSBmYWN0b3J5KCk7XG4gIG1vZC5jcmVhdGUgPSBmYWN0b3J5O1xuICBtb2Qud2l0aEluaGVyaXRlZFByb3BzID0gZmFjdG9yeSh7aW5jbHVkZUluaGVyaXRlZFByb3BzOiB0cnVlfSlcbiAgcmV0dXJuIG1vZDtcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBkb0V2YWwoc2VsZiwgX19wc2V1ZG93b3JrZXJfc2NyaXB0KSB7XG4gIC8qIGpzaGludCB1bnVzZWQ6ZmFsc2UgKi9cbiAgKGZ1bmN0aW9uICgpIHtcbiAgICAvKiBqc2hpbnQgZXZpbDp0cnVlICovXG4gICAgZXZhbChfX3BzZXVkb3dvcmtlcl9zY3JpcHQpO1xuICB9KS5jYWxsKGdsb2JhbCk7XG59XG5cbmZ1bmN0aW9uIFBzZXVkb1dvcmtlcihwYXRoKSB7XG4gIHZhciBtZXNzYWdlTGlzdGVuZXJzID0gW107XG4gIHZhciBlcnJvckxpc3RlbmVycyA9IFtdO1xuICB2YXIgd29ya2VyTWVzc2FnZUxpc3RlbmVycyA9IFtdO1xuICB2YXIgd29ya2VyRXJyb3JMaXN0ZW5lcnMgPSBbXTtcbiAgdmFyIHBvc3RNZXNzYWdlTGlzdGVuZXJzID0gW107XG4gIHZhciB0ZXJtaW5hdGVkID0gZmFsc2U7XG4gIHZhciBzY3JpcHQ7XG4gIHZhciB3b3JrZXJTZWxmO1xuXG4gIHZhciBhcGkgPSB0aGlzO1xuXG4gIC8vIGN1c3RvbSBlYWNoIGxvb3AgaXMgZm9yIElFOCBzdXBwb3J0XG4gIGZ1bmN0aW9uIGV4ZWN1dGVFYWNoKGFyciwgZnVuKSB7XG4gICAgdmFyIGkgPSAtMTtcbiAgICB3aGlsZSAoKytpIDwgYXJyLmxlbmd0aCkge1xuICAgICAgaWYgKGFycltpXSkge1xuICAgICAgICBmdW4oYXJyW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjYWxsRXJyb3JMaXN0ZW5lcihlcnIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgICBsaXN0ZW5lcih7XG4gICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgIGVycm9yOiBlcnIsXG4gICAgICAgIG1lc3NhZ2U6IGVyci5tZXNzYWdlXG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBmdW4pIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgIGlmICh0eXBlID09PSAnbWVzc2FnZScpIHtcbiAgICAgIG1lc3NhZ2VMaXN0ZW5lcnMucHVzaChmdW4pO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgICAgZXJyb3JMaXN0ZW5lcnMucHVzaChmdW4pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgZnVuKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzO1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICAgIGlmICh0eXBlID09PSAnbWVzc2FnZScpIHtcbiAgICAgICAgbGlzdGVuZXJzID0gbWVzc2FnZUxpc3RlbmVycztcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgICAgICBsaXN0ZW5lcnMgPSBlcnJvckxpc3RlbmVycztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhciBpID0gLTE7XG4gICAgICB3aGlsZSAoKytpIDwgbGlzdGVuZXJzLmxlbmd0aCkge1xuICAgICAgICB2YXIgbGlzdGVuZXIgPSBsaXN0ZW5lcnNbaV07XG4gICAgICAgIGlmIChsaXN0ZW5lciA9PT0gZnVuKSB7XG4gICAgICAgICAgZGVsZXRlIGxpc3RlbmVyc1tpXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcG9zdEVycm9yKGVycikge1xuICAgIHZhciBjYWxsRnVuID0gY2FsbEVycm9yTGlzdGVuZXIoZXJyKTtcbiAgICBpZiAodHlwZW9mIGFwaS5vbmVycm9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjYWxsRnVuKGFwaS5vbmVycm9yKTtcbiAgICB9XG4gICAgaWYgKHdvcmtlclNlbGYgJiYgdHlwZW9mIHdvcmtlclNlbGYub25lcnJvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY2FsbEZ1bih3b3JrZXJTZWxmLm9uZXJyb3IpO1xuICAgIH1cbiAgICBleGVjdXRlRWFjaChlcnJvckxpc3RlbmVycywgY2FsbEZ1bik7XG4gICAgZXhlY3V0ZUVhY2god29ya2VyRXJyb3JMaXN0ZW5lcnMsIGNhbGxGdW4pO1xuICB9XG5cbiAgZnVuY3Rpb24gcnVuUG9zdE1lc3NhZ2UobXNnKSB7XG4gICAgZnVuY3Rpb24gY2FsbEZ1bihsaXN0ZW5lcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbGlzdGVuZXIoe2RhdGE6IG1zZ30pO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHBvc3RFcnJvcihlcnIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh3b3JrZXJTZWxmICYmIHR5cGVvZiB3b3JrZXJTZWxmLm9ubWVzc2FnZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY2FsbEZ1bih3b3JrZXJTZWxmLm9ubWVzc2FnZSk7XG4gICAgfVxuICAgIGV4ZWN1dGVFYWNoKHdvcmtlck1lc3NhZ2VMaXN0ZW5lcnMsIGNhbGxGdW4pO1xuICB9XG5cbiAgZnVuY3Rpb24gcG9zdE1lc3NhZ2UobXNnKSB7XG4gICAgaWYgKHR5cGVvZiBtc2cgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Bvc3RNZXNzYWdlKCkgcmVxdWlyZXMgYW4gYXJndW1lbnQnKTtcbiAgICB9XG4gICAgaWYgKHRlcm1pbmF0ZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCFzY3JpcHQpIHtcbiAgICAgIHBvc3RNZXNzYWdlTGlzdGVuZXJzLnB1c2gobXNnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcnVuUG9zdE1lc3NhZ2UobXNnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRlcm1pbmF0ZSgpIHtcbiAgICB0ZXJtaW5hdGVkID0gdHJ1ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHdvcmtlclBvc3RNZXNzYWdlKG1zZykge1xuICAgIGZ1bmN0aW9uIGNhbGxGdW4obGlzdGVuZXIpIHtcbiAgICAgIGxpc3RlbmVyKHtcbiAgICAgICAgZGF0YTogbXNnXG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBhcGkub25tZXNzYWdlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjYWxsRnVuKGFwaS5vbm1lc3NhZ2UpO1xuICAgIH1cbiAgICBleGVjdXRlRWFjaChtZXNzYWdlTGlzdGVuZXJzLCBjYWxsRnVuKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHdvcmtlckFkZEV2ZW50TGlzdGVuZXIodHlwZSwgZnVuKSB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICBpZiAodHlwZSA9PT0gJ21lc3NhZ2UnKSB7XG4gICAgICB3b3JrZXJNZXNzYWdlTGlzdGVuZXJzLnB1c2goZnVuKTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICAgIHdvcmtlckVycm9yTGlzdGVuZXJzLnB1c2goZnVuKTtcbiAgICB9XG4gIH1cblxuICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgeGhyLm9wZW4oJ0dFVCcsIHBhdGgpO1xuICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgaWYgKHhoci5zdGF0dXMgPj0gMjAwICYmIHhoci5zdGF0dXMgPCA0MDApIHtcbiAgICAgICAgc2NyaXB0ID0geGhyLnJlc3BvbnNlVGV4dDtcbiAgICAgICAgd29ya2VyU2VsZiA9IHtcbiAgICAgICAgICBwb3N0TWVzc2FnZTogd29ya2VyUG9zdE1lc3NhZ2UsXG4gICAgICAgICAgYWRkRXZlbnRMaXN0ZW5lcjogd29ya2VyQWRkRXZlbnRMaXN0ZW5lcixcbiAgICAgICAgfTtcbiAgICAgICAgZG9FdmFsKHdvcmtlclNlbGYsIHNjcmlwdCk7XG4gICAgICAgIHZhciBjdXJyZW50TGlzdGVuZXJzID0gcG9zdE1lc3NhZ2VMaXN0ZW5lcnM7XG4gICAgICAgIHBvc3RNZXNzYWdlTGlzdGVuZXJzID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY3VycmVudExpc3RlbmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHJ1blBvc3RNZXNzYWdlKGN1cnJlbnRMaXN0ZW5lcnNbaV0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwb3N0RXJyb3IobmV3IEVycm9yKCdjYW5ub3QgZmluZCBzY3JpcHQgJyArIHBhdGgpKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgeGhyLnNlbmQoKTtcblxuICBhcGkucG9zdE1lc3NhZ2UgPSBwb3N0TWVzc2FnZTtcbiAgYXBpLmFkZEV2ZW50TGlzdGVuZXIgPSBhZGRFdmVudExpc3RlbmVyO1xuICBhcGkucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IHJlbW92ZUV2ZW50TGlzdGVuZXI7XG4gIGFwaS50ZXJtaW5hdGUgPSB0ZXJtaW5hdGU7XG5cbiAgcmV0dXJuIGFwaTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQc2V1ZG9Xb3JrZXI7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgUHNldWRvV29ya2VyID0gcmVxdWlyZSgnLi8nKTtcblxuaWYgKHR5cGVvZiBXb3JrZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gIGdsb2JhbC5Xb3JrZXIgPSBQc2V1ZG9Xb3JrZXI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUHNldWRvV29ya2VyOyIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLy8gVGhpcyBtZXRob2Qgb2Ygb2J0YWluaW5nIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0IG5lZWRzIHRvIGJlXG4vLyBrZXB0IGlkZW50aWNhbCB0byB0aGUgd2F5IGl0IGlzIG9idGFpbmVkIGluIHJ1bnRpbWUuanNcbnZhciBnID0gKGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcyB9KSgpIHx8IEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKTtcblxuLy8gVXNlIGBnZXRPd25Qcm9wZXJ0eU5hbWVzYCBiZWNhdXNlIG5vdCBhbGwgYnJvd3NlcnMgc3VwcG9ydCBjYWxsaW5nXG4vLyBgaGFzT3duUHJvcGVydHlgIG9uIHRoZSBnbG9iYWwgYHNlbGZgIG9iamVjdCBpbiBhIHdvcmtlci4gU2VlICMxODMuXG52YXIgaGFkUnVudGltZSA9IGcucmVnZW5lcmF0b3JSdW50aW1lICYmXG4gIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGcpLmluZGV4T2YoXCJyZWdlbmVyYXRvclJ1bnRpbWVcIikgPj0gMDtcblxuLy8gU2F2ZSB0aGUgb2xkIHJlZ2VuZXJhdG9yUnVudGltZSBpbiBjYXNlIGl0IG5lZWRzIHRvIGJlIHJlc3RvcmVkIGxhdGVyLlxudmFyIG9sZFJ1bnRpbWUgPSBoYWRSdW50aW1lICYmIGcucmVnZW5lcmF0b3JSdW50aW1lO1xuXG4vLyBGb3JjZSByZWV2YWx1dGF0aW9uIG9mIHJ1bnRpbWUuanMuXG5nLnJlZ2VuZXJhdG9yUnVudGltZSA9IHVuZGVmaW5lZDtcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi9ydW50aW1lXCIpO1xuXG5pZiAoaGFkUnVudGltZSkge1xuICAvLyBSZXN0b3JlIHRoZSBvcmlnaW5hbCBydW50aW1lLlxuICBnLnJlZ2VuZXJhdG9yUnVudGltZSA9IG9sZFJ1bnRpbWU7XG59IGVsc2Uge1xuICAvLyBSZW1vdmUgdGhlIGdsb2JhbCBwcm9wZXJ0eSBhZGRlZCBieSBydW50aW1lLmpzLlxuICB0cnkge1xuICAgIGRlbGV0ZSBnLnJlZ2VuZXJhdG9yUnVudGltZTtcbiAgfSBjYXRjaChlKSB7XG4gICAgZy5yZWdlbmVyYXRvclJ1bnRpbWUgPSB1bmRlZmluZWQ7XG4gIH1cbn1cbiIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuIShmdW5jdGlvbihnbG9iYWwpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIE9wID0gT2JqZWN0LnByb3RvdHlwZTtcbiAgdmFyIGhhc093biA9IE9wLmhhc093blByb3BlcnR5O1xuICB2YXIgdW5kZWZpbmVkOyAvLyBNb3JlIGNvbXByZXNzaWJsZSB0aGFuIHZvaWQgMC5cbiAgdmFyICRTeW1ib2wgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgPyBTeW1ib2wgOiB7fTtcbiAgdmFyIGl0ZXJhdG9yU3ltYm9sID0gJFN5bWJvbC5pdGVyYXRvciB8fCBcIkBAaXRlcmF0b3JcIjtcbiAgdmFyIGFzeW5jSXRlcmF0b3JTeW1ib2wgPSAkU3ltYm9sLmFzeW5jSXRlcmF0b3IgfHwgXCJAQGFzeW5jSXRlcmF0b3JcIjtcbiAgdmFyIHRvU3RyaW5nVGFnU3ltYm9sID0gJFN5bWJvbC50b1N0cmluZ1RhZyB8fCBcIkBAdG9TdHJpbmdUYWdcIjtcblxuICB2YXIgaW5Nb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiO1xuICB2YXIgcnVudGltZSA9IGdsb2JhbC5yZWdlbmVyYXRvclJ1bnRpbWU7XG4gIGlmIChydW50aW1lKSB7XG4gICAgaWYgKGluTW9kdWxlKSB7XG4gICAgICAvLyBJZiByZWdlbmVyYXRvclJ1bnRpbWUgaXMgZGVmaW5lZCBnbG9iYWxseSBhbmQgd2UncmUgaW4gYSBtb2R1bGUsXG4gICAgICAvLyBtYWtlIHRoZSBleHBvcnRzIG9iamVjdCBpZGVudGljYWwgdG8gcmVnZW5lcmF0b3JSdW50aW1lLlxuICAgICAgbW9kdWxlLmV4cG9ydHMgPSBydW50aW1lO1xuICAgIH1cbiAgICAvLyBEb24ndCBib3RoZXIgZXZhbHVhdGluZyB0aGUgcmVzdCBvZiB0aGlzIGZpbGUgaWYgdGhlIHJ1bnRpbWUgd2FzXG4gICAgLy8gYWxyZWFkeSBkZWZpbmVkIGdsb2JhbGx5LlxuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIERlZmluZSB0aGUgcnVudGltZSBnbG9iYWxseSAoYXMgZXhwZWN0ZWQgYnkgZ2VuZXJhdGVkIGNvZGUpIGFzIGVpdGhlclxuICAvLyBtb2R1bGUuZXhwb3J0cyAoaWYgd2UncmUgaW4gYSBtb2R1bGUpIG9yIGEgbmV3LCBlbXB0eSBvYmplY3QuXG4gIHJ1bnRpbWUgPSBnbG9iYWwucmVnZW5lcmF0b3JSdW50aW1lID0gaW5Nb2R1bGUgPyBtb2R1bGUuZXhwb3J0cyA6IHt9O1xuXG4gIGZ1bmN0aW9uIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBJZiBvdXRlckZuIHByb3ZpZGVkIGFuZCBvdXRlckZuLnByb3RvdHlwZSBpcyBhIEdlbmVyYXRvciwgdGhlbiBvdXRlckZuLnByb3RvdHlwZSBpbnN0YW5jZW9mIEdlbmVyYXRvci5cbiAgICB2YXIgcHJvdG9HZW5lcmF0b3IgPSBvdXRlckZuICYmIG91dGVyRm4ucHJvdG90eXBlIGluc3RhbmNlb2YgR2VuZXJhdG9yID8gb3V0ZXJGbiA6IEdlbmVyYXRvcjtcbiAgICB2YXIgZ2VuZXJhdG9yID0gT2JqZWN0LmNyZWF0ZShwcm90b0dlbmVyYXRvci5wcm90b3R5cGUpO1xuICAgIHZhciBjb250ZXh0ID0gbmV3IENvbnRleHQodHJ5TG9jc0xpc3QgfHwgW10pO1xuXG4gICAgLy8gVGhlIC5faW52b2tlIG1ldGhvZCB1bmlmaWVzIHRoZSBpbXBsZW1lbnRhdGlvbnMgb2YgdGhlIC5uZXh0LFxuICAgIC8vIC50aHJvdywgYW5kIC5yZXR1cm4gbWV0aG9kcy5cbiAgICBnZW5lcmF0b3IuX2ludm9rZSA9IG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCk7XG5cbiAgICByZXR1cm4gZ2VuZXJhdG9yO1xuICB9XG4gIHJ1bnRpbWUud3JhcCA9IHdyYXA7XG5cbiAgLy8gVHJ5L2NhdGNoIGhlbHBlciB0byBtaW5pbWl6ZSBkZW9wdGltaXphdGlvbnMuIFJldHVybnMgYSBjb21wbGV0aW9uXG4gIC8vIHJlY29yZCBsaWtlIGNvbnRleHQudHJ5RW50cmllc1tpXS5jb21wbGV0aW9uLiBUaGlzIGludGVyZmFjZSBjb3VsZFxuICAvLyBoYXZlIGJlZW4gKGFuZCB3YXMgcHJldmlvdXNseSkgZGVzaWduZWQgdG8gdGFrZSBhIGNsb3N1cmUgdG8gYmVcbiAgLy8gaW52b2tlZCB3aXRob3V0IGFyZ3VtZW50cywgYnV0IGluIGFsbCB0aGUgY2FzZXMgd2UgY2FyZSBhYm91dCB3ZVxuICAvLyBhbHJlYWR5IGhhdmUgYW4gZXhpc3RpbmcgbWV0aG9kIHdlIHdhbnQgdG8gY2FsbCwgc28gdGhlcmUncyBubyBuZWVkXG4gIC8vIHRvIGNyZWF0ZSBhIG5ldyBmdW5jdGlvbiBvYmplY3QuIFdlIGNhbiBldmVuIGdldCBhd2F5IHdpdGggYXNzdW1pbmdcbiAgLy8gdGhlIG1ldGhvZCB0YWtlcyBleGFjdGx5IG9uZSBhcmd1bWVudCwgc2luY2UgdGhhdCBoYXBwZW5zIHRvIGJlIHRydWVcbiAgLy8gaW4gZXZlcnkgY2FzZSwgc28gd2UgZG9uJ3QgaGF2ZSB0byB0b3VjaCB0aGUgYXJndW1lbnRzIG9iamVjdC4gVGhlXG4gIC8vIG9ubHkgYWRkaXRpb25hbCBhbGxvY2F0aW9uIHJlcXVpcmVkIGlzIHRoZSBjb21wbGV0aW9uIHJlY29yZCwgd2hpY2hcbiAgLy8gaGFzIGEgc3RhYmxlIHNoYXBlIGFuZCBzbyBob3BlZnVsbHkgc2hvdWxkIGJlIGNoZWFwIHRvIGFsbG9jYXRlLlxuICBmdW5jdGlvbiB0cnlDYXRjaChmbiwgb2JqLCBhcmcpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJub3JtYWxcIiwgYXJnOiBmbi5jYWxsKG9iaiwgYXJnKSB9O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJ0aHJvd1wiLCBhcmc6IGVyciB9O1xuICAgIH1cbiAgfVxuXG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0ID0gXCJzdXNwZW5kZWRTdGFydFwiO1xuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRZaWVsZCA9IFwic3VzcGVuZGVkWWllbGRcIjtcbiAgdmFyIEdlblN0YXRlRXhlY3V0aW5nID0gXCJleGVjdXRpbmdcIjtcbiAgdmFyIEdlblN0YXRlQ29tcGxldGVkID0gXCJjb21wbGV0ZWRcIjtcblxuICAvLyBSZXR1cm5pbmcgdGhpcyBvYmplY3QgZnJvbSB0aGUgaW5uZXJGbiBoYXMgdGhlIHNhbWUgZWZmZWN0IGFzXG4gIC8vIGJyZWFraW5nIG91dCBvZiB0aGUgZGlzcGF0Y2ggc3dpdGNoIHN0YXRlbWVudC5cbiAgdmFyIENvbnRpbnVlU2VudGluZWwgPSB7fTtcblxuICAvLyBEdW1teSBjb25zdHJ1Y3RvciBmdW5jdGlvbnMgdGhhdCB3ZSB1c2UgYXMgdGhlIC5jb25zdHJ1Y3RvciBhbmRcbiAgLy8gLmNvbnN0cnVjdG9yLnByb3RvdHlwZSBwcm9wZXJ0aWVzIGZvciBmdW5jdGlvbnMgdGhhdCByZXR1cm4gR2VuZXJhdG9yXG4gIC8vIG9iamVjdHMuIEZvciBmdWxsIHNwZWMgY29tcGxpYW5jZSwgeW91IG1heSB3aXNoIHRvIGNvbmZpZ3VyZSB5b3VyXG4gIC8vIG1pbmlmaWVyIG5vdCB0byBtYW5nbGUgdGhlIG5hbWVzIG9mIHRoZXNlIHR3byBmdW5jdGlvbnMuXG4gIGZ1bmN0aW9uIEdlbmVyYXRvcigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUoKSB7fVxuXG4gIC8vIFRoaXMgaXMgYSBwb2x5ZmlsbCBmb3IgJUl0ZXJhdG9yUHJvdG90eXBlJSBmb3IgZW52aXJvbm1lbnRzIHRoYXRcbiAgLy8gZG9uJ3QgbmF0aXZlbHkgc3VwcG9ydCBpdC5cbiAgdmFyIEl0ZXJhdG9yUHJvdG90eXBlID0ge307XG4gIEl0ZXJhdG9yUHJvdG90eXBlW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB2YXIgZ2V0UHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Y7XG4gIHZhciBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSA9IGdldFByb3RvICYmIGdldFByb3RvKGdldFByb3RvKHZhbHVlcyhbXSkpKTtcbiAgaWYgKE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlICYmXG4gICAgICBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSAhPT0gT3AgJiZcbiAgICAgIGhhc093bi5jYWxsKE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlLCBpdGVyYXRvclN5bWJvbCkpIHtcbiAgICAvLyBUaGlzIGVudmlyb25tZW50IGhhcyBhIG5hdGl2ZSAlSXRlcmF0b3JQcm90b3R5cGUlOyB1c2UgaXQgaW5zdGVhZFxuICAgIC8vIG9mIHRoZSBwb2x5ZmlsbC5cbiAgICBJdGVyYXRvclByb3RvdHlwZSA9IE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlO1xuICB9XG5cbiAgdmFyIEdwID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUucHJvdG90eXBlID1cbiAgICBHZW5lcmF0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShJdGVyYXRvclByb3RvdHlwZSk7XG4gIEdlbmVyYXRvckZ1bmN0aW9uLnByb3RvdHlwZSA9IEdwLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb247XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlW3RvU3RyaW5nVGFnU3ltYm9sXSA9XG4gICAgR2VuZXJhdG9yRnVuY3Rpb24uZGlzcGxheU5hbWUgPSBcIkdlbmVyYXRvckZ1bmN0aW9uXCI7XG5cbiAgLy8gSGVscGVyIGZvciBkZWZpbmluZyB0aGUgLm5leHQsIC50aHJvdywgYW5kIC5yZXR1cm4gbWV0aG9kcyBvZiB0aGVcbiAgLy8gSXRlcmF0b3IgaW50ZXJmYWNlIGluIHRlcm1zIG9mIGEgc2luZ2xlIC5faW52b2tlIG1ldGhvZC5cbiAgZnVuY3Rpb24gZGVmaW5lSXRlcmF0b3JNZXRob2RzKHByb3RvdHlwZSkge1xuICAgIFtcIm5leHRcIiwgXCJ0aHJvd1wiLCBcInJldHVyblwiXS5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgcHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbihhcmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludm9rZShtZXRob2QsIGFyZyk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgcnVudGltZS5pc0dlbmVyYXRvckZ1bmN0aW9uID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgdmFyIGN0b3IgPSB0eXBlb2YgZ2VuRnVuID09PSBcImZ1bmN0aW9uXCIgJiYgZ2VuRnVuLmNvbnN0cnVjdG9yO1xuICAgIHJldHVybiBjdG9yXG4gICAgICA/IGN0b3IgPT09IEdlbmVyYXRvckZ1bmN0aW9uIHx8XG4gICAgICAgIC8vIEZvciB0aGUgbmF0aXZlIEdlbmVyYXRvckZ1bmN0aW9uIGNvbnN0cnVjdG9yLCB0aGUgYmVzdCB3ZSBjYW5cbiAgICAgICAgLy8gZG8gaXMgdG8gY2hlY2sgaXRzIC5uYW1lIHByb3BlcnR5LlxuICAgICAgICAoY3Rvci5kaXNwbGF5TmFtZSB8fCBjdG9yLm5hbWUpID09PSBcIkdlbmVyYXRvckZ1bmN0aW9uXCJcbiAgICAgIDogZmFsc2U7XG4gIH07XG5cbiAgcnVudGltZS5tYXJrID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgaWYgKE9iamVjdC5zZXRQcm90b3R5cGVPZikge1xuICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKGdlbkZ1biwgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnZW5GdW4uX19wcm90b19fID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gICAgICBpZiAoISh0b1N0cmluZ1RhZ1N5bWJvbCBpbiBnZW5GdW4pKSB7XG4gICAgICAgIGdlbkZ1blt0b1N0cmluZ1RhZ1N5bWJvbF0gPSBcIkdlbmVyYXRvckZ1bmN0aW9uXCI7XG4gICAgICB9XG4gICAgfVxuICAgIGdlbkZ1bi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEdwKTtcbiAgICByZXR1cm4gZ2VuRnVuO1xuICB9O1xuXG4gIC8vIFdpdGhpbiB0aGUgYm9keSBvZiBhbnkgYXN5bmMgZnVuY3Rpb24sIGBhd2FpdCB4YCBpcyB0cmFuc2Zvcm1lZCB0b1xuICAvLyBgeWllbGQgcmVnZW5lcmF0b3JSdW50aW1lLmF3cmFwKHgpYCwgc28gdGhhdCB0aGUgcnVudGltZSBjYW4gdGVzdFxuICAvLyBgaGFzT3duLmNhbGwodmFsdWUsIFwiX19hd2FpdFwiKWAgdG8gZGV0ZXJtaW5lIGlmIHRoZSB5aWVsZGVkIHZhbHVlIGlzXG4gIC8vIG1lYW50IHRvIGJlIGF3YWl0ZWQuXG4gIHJ1bnRpbWUuYXdyYXAgPSBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4geyBfX2F3YWl0OiBhcmcgfTtcbiAgfTtcblxuICBmdW5jdGlvbiBBc3luY0l0ZXJhdG9yKGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZywgcmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goZ2VuZXJhdG9yW21ldGhvZF0sIGdlbmVyYXRvciwgYXJnKTtcbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHJlamVjdChyZWNvcmQuYXJnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciByZXN1bHQgPSByZWNvcmQuYXJnO1xuICAgICAgICB2YXIgdmFsdWUgPSByZXN1bHQudmFsdWU7XG4gICAgICAgIGlmICh2YWx1ZSAmJlxuICAgICAgICAgICAgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgICAgICBoYXNPd24uY2FsbCh2YWx1ZSwgXCJfX2F3YWl0XCIpKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZS5fX2F3YWl0KS50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICBpbnZva2UoXCJuZXh0XCIsIHZhbHVlLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgaW52b2tlKFwidGhyb3dcIiwgZXJyLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSkudGhlbihmdW5jdGlvbih1bndyYXBwZWQpIHtcbiAgICAgICAgICAvLyBXaGVuIGEgeWllbGRlZCBQcm9taXNlIGlzIHJlc29sdmVkLCBpdHMgZmluYWwgdmFsdWUgYmVjb21lc1xuICAgICAgICAgIC8vIHRoZSAudmFsdWUgb2YgdGhlIFByb21pc2U8e3ZhbHVlLGRvbmV9PiByZXN1bHQgZm9yIHRoZVxuICAgICAgICAgIC8vIGN1cnJlbnQgaXRlcmF0aW9uLiBJZiB0aGUgUHJvbWlzZSBpcyByZWplY3RlZCwgaG93ZXZlciwgdGhlXG4gICAgICAgICAgLy8gcmVzdWx0IGZvciB0aGlzIGl0ZXJhdGlvbiB3aWxsIGJlIHJlamVjdGVkIHdpdGggdGhlIHNhbWVcbiAgICAgICAgICAvLyByZWFzb24uIE5vdGUgdGhhdCByZWplY3Rpb25zIG9mIHlpZWxkZWQgUHJvbWlzZXMgYXJlIG5vdFxuICAgICAgICAgIC8vIHRocm93biBiYWNrIGludG8gdGhlIGdlbmVyYXRvciBmdW5jdGlvbiwgYXMgaXMgdGhlIGNhc2VcbiAgICAgICAgICAvLyB3aGVuIGFuIGF3YWl0ZWQgUHJvbWlzZSBpcyByZWplY3RlZC4gVGhpcyBkaWZmZXJlbmNlIGluXG4gICAgICAgICAgLy8gYmVoYXZpb3IgYmV0d2VlbiB5aWVsZCBhbmQgYXdhaXQgaXMgaW1wb3J0YW50LCBiZWNhdXNlIGl0XG4gICAgICAgICAgLy8gYWxsb3dzIHRoZSBjb25zdW1lciB0byBkZWNpZGUgd2hhdCB0byBkbyB3aXRoIHRoZSB5aWVsZGVkXG4gICAgICAgICAgLy8gcmVqZWN0aW9uIChzd2FsbG93IGl0IGFuZCBjb250aW51ZSwgbWFudWFsbHkgLnRocm93IGl0IGJhY2tcbiAgICAgICAgICAvLyBpbnRvIHRoZSBnZW5lcmF0b3IsIGFiYW5kb24gaXRlcmF0aW9uLCB3aGF0ZXZlcikuIFdpdGhcbiAgICAgICAgICAvLyBhd2FpdCwgYnkgY29udHJhc3QsIHRoZXJlIGlzIG5vIG9wcG9ydHVuaXR5IHRvIGV4YW1pbmUgdGhlXG4gICAgICAgICAgLy8gcmVqZWN0aW9uIHJlYXNvbiBvdXRzaWRlIHRoZSBnZW5lcmF0b3IgZnVuY3Rpb24sIHNvIHRoZVxuICAgICAgICAgIC8vIG9ubHkgb3B0aW9uIGlzIHRvIHRocm93IGl0IGZyb20gdGhlIGF3YWl0IGV4cHJlc3Npb24sIGFuZFxuICAgICAgICAgIC8vIGxldCB0aGUgZ2VuZXJhdG9yIGZ1bmN0aW9uIGhhbmRsZSB0aGUgZXhjZXB0aW9uLlxuICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IHVud3JhcHBlZDtcbiAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH0sIHJlamVjdCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHByZXZpb3VzUHJvbWlzZTtcblxuICAgIGZ1bmN0aW9uIGVucXVldWUobWV0aG9kLCBhcmcpIHtcbiAgICAgIGZ1bmN0aW9uIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgaW52b2tlKG1ldGhvZCwgYXJnLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHByZXZpb3VzUHJvbWlzZSA9XG4gICAgICAgIC8vIElmIGVucXVldWUgaGFzIGJlZW4gY2FsbGVkIGJlZm9yZSwgdGhlbiB3ZSB3YW50IHRvIHdhaXQgdW50aWxcbiAgICAgICAgLy8gYWxsIHByZXZpb3VzIFByb21pc2VzIGhhdmUgYmVlbiByZXNvbHZlZCBiZWZvcmUgY2FsbGluZyBpbnZva2UsXG4gICAgICAgIC8vIHNvIHRoYXQgcmVzdWx0cyBhcmUgYWx3YXlzIGRlbGl2ZXJlZCBpbiB0aGUgY29ycmVjdCBvcmRlci4gSWZcbiAgICAgICAgLy8gZW5xdWV1ZSBoYXMgbm90IGJlZW4gY2FsbGVkIGJlZm9yZSwgdGhlbiBpdCBpcyBpbXBvcnRhbnQgdG9cbiAgICAgICAgLy8gY2FsbCBpbnZva2UgaW1tZWRpYXRlbHksIHdpdGhvdXQgd2FpdGluZyBvbiBhIGNhbGxiYWNrIHRvIGZpcmUsXG4gICAgICAgIC8vIHNvIHRoYXQgdGhlIGFzeW5jIGdlbmVyYXRvciBmdW5jdGlvbiBoYXMgdGhlIG9wcG9ydHVuaXR5IHRvIGRvXG4gICAgICAgIC8vIGFueSBuZWNlc3Nhcnkgc2V0dXAgaW4gYSBwcmVkaWN0YWJsZSB3YXkuIFRoaXMgcHJlZGljdGFiaWxpdHlcbiAgICAgICAgLy8gaXMgd2h5IHRoZSBQcm9taXNlIGNvbnN0cnVjdG9yIHN5bmNocm9ub3VzbHkgaW52b2tlcyBpdHNcbiAgICAgICAgLy8gZXhlY3V0b3IgY2FsbGJhY2ssIGFuZCB3aHkgYXN5bmMgZnVuY3Rpb25zIHN5bmNocm9ub3VzbHlcbiAgICAgICAgLy8gZXhlY3V0ZSBjb2RlIGJlZm9yZSB0aGUgZmlyc3QgYXdhaXQuIFNpbmNlIHdlIGltcGxlbWVudCBzaW1wbGVcbiAgICAgICAgLy8gYXN5bmMgZnVuY3Rpb25zIGluIHRlcm1zIG9mIGFzeW5jIGdlbmVyYXRvcnMsIGl0IGlzIGVzcGVjaWFsbHlcbiAgICAgICAgLy8gaW1wb3J0YW50IHRvIGdldCB0aGlzIHJpZ2h0LCBldmVuIHRob3VnaCBpdCByZXF1aXJlcyBjYXJlLlxuICAgICAgICBwcmV2aW91c1Byb21pc2UgPyBwcmV2aW91c1Byb21pc2UudGhlbihcbiAgICAgICAgICBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZyxcbiAgICAgICAgICAvLyBBdm9pZCBwcm9wYWdhdGluZyBmYWlsdXJlcyB0byBQcm9taXNlcyByZXR1cm5lZCBieSBsYXRlclxuICAgICAgICAgIC8vIGludm9jYXRpb25zIG9mIHRoZSBpdGVyYXRvci5cbiAgICAgICAgICBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZ1xuICAgICAgICApIDogY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcoKTtcbiAgICB9XG5cbiAgICAvLyBEZWZpbmUgdGhlIHVuaWZpZWQgaGVscGVyIG1ldGhvZCB0aGF0IGlzIHVzZWQgdG8gaW1wbGVtZW50IC5uZXh0LFxuICAgIC8vIC50aHJvdywgYW5kIC5yZXR1cm4gKHNlZSBkZWZpbmVJdGVyYXRvck1ldGhvZHMpLlxuICAgIHRoaXMuX2ludm9rZSA9IGVucXVldWU7XG4gIH1cblxuICBkZWZpbmVJdGVyYXRvck1ldGhvZHMoQXN5bmNJdGVyYXRvci5wcm90b3R5cGUpO1xuICBBc3luY0l0ZXJhdG9yLnByb3RvdHlwZVthc3luY0l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgcnVudGltZS5Bc3luY0l0ZXJhdG9yID0gQXN5bmNJdGVyYXRvcjtcblxuICAvLyBOb3RlIHRoYXQgc2ltcGxlIGFzeW5jIGZ1bmN0aW9ucyBhcmUgaW1wbGVtZW50ZWQgb24gdG9wIG9mXG4gIC8vIEFzeW5jSXRlcmF0b3Igb2JqZWN0czsgdGhleSBqdXN0IHJldHVybiBhIFByb21pc2UgZm9yIHRoZSB2YWx1ZSBvZlxuICAvLyB0aGUgZmluYWwgcmVzdWx0IHByb2R1Y2VkIGJ5IHRoZSBpdGVyYXRvci5cbiAgcnVudGltZS5hc3luYyA9IGZ1bmN0aW9uKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSB7XG4gICAgdmFyIGl0ZXIgPSBuZXcgQXN5bmNJdGVyYXRvcihcbiAgICAgIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpXG4gICAgKTtcblxuICAgIHJldHVybiBydW50aW1lLmlzR2VuZXJhdG9yRnVuY3Rpb24ob3V0ZXJGbilcbiAgICAgID8gaXRlciAvLyBJZiBvdXRlckZuIGlzIGEgZ2VuZXJhdG9yLCByZXR1cm4gdGhlIGZ1bGwgaXRlcmF0b3IuXG4gICAgICA6IGl0ZXIubmV4dCgpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdC5kb25lID8gcmVzdWx0LnZhbHVlIDogaXRlci5uZXh0KCk7XG4gICAgICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCkge1xuICAgIHZhciBzdGF0ZSA9IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQ7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnKSB7XG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlRXhlY3V0aW5nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IHJ1bm5pbmdcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVDb21wbGV0ZWQpIHtcbiAgICAgICAgaWYgKG1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgdGhyb3cgYXJnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQmUgZm9yZ2l2aW5nLCBwZXIgMjUuMy4zLjMuMyBvZiB0aGUgc3BlYzpcbiAgICAgICAgLy8gaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLWdlbmVyYXRvcnJlc3VtZVxuICAgICAgICByZXR1cm4gZG9uZVJlc3VsdCgpO1xuICAgICAgfVxuXG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IG1ldGhvZDtcbiAgICAgIGNvbnRleHQuYXJnID0gYXJnO1xuXG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICB2YXIgZGVsZWdhdGUgPSBjb250ZXh0LmRlbGVnYXRlO1xuICAgICAgICBpZiAoZGVsZWdhdGUpIHtcbiAgICAgICAgICB2YXIgZGVsZWdhdGVSZXN1bHQgPSBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KTtcbiAgICAgICAgICBpZiAoZGVsZWdhdGVSZXN1bHQpIHtcbiAgICAgICAgICAgIGlmIChkZWxlZ2F0ZVJlc3VsdCA9PT0gQ29udGludWVTZW50aW5lbCkgY29udGludWU7XG4gICAgICAgICAgICByZXR1cm4gZGVsZWdhdGVSZXN1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAgIC8vIFNldHRpbmcgY29udGV4dC5fc2VudCBmb3IgbGVnYWN5IHN1cHBvcnQgb2YgQmFiZWwnc1xuICAgICAgICAgIC8vIGZ1bmN0aW9uLnNlbnQgaW1wbGVtZW50YXRpb24uXG4gICAgICAgICAgY29udGV4dC5zZW50ID0gY29udGV4dC5fc2VudCA9IGNvbnRleHQuYXJnO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydCkge1xuICAgICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAgIHRocm93IGNvbnRleHQuYXJnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oY29udGV4dC5hcmcpO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dC5tZXRob2QgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgICBjb250ZXh0LmFicnVwdChcInJldHVyblwiLCBjb250ZXh0LmFyZyk7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZSA9IEdlblN0YXRlRXhlY3V0aW5nO1xuXG4gICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChpbm5lckZuLCBzZWxmLCBjb250ZXh0KTtcbiAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiKSB7XG4gICAgICAgICAgLy8gSWYgYW4gZXhjZXB0aW9uIGlzIHRocm93biBmcm9tIGlubmVyRm4sIHdlIGxlYXZlIHN0YXRlID09PVxuICAgICAgICAgIC8vIEdlblN0YXRlRXhlY3V0aW5nIGFuZCBsb29wIGJhY2sgZm9yIGFub3RoZXIgaW52b2NhdGlvbi5cbiAgICAgICAgICBzdGF0ZSA9IGNvbnRleHQuZG9uZVxuICAgICAgICAgICAgPyBHZW5TdGF0ZUNvbXBsZXRlZFxuICAgICAgICAgICAgOiBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkO1xuXG4gICAgICAgICAgaWYgKHJlY29yZC5hcmcgPT09IENvbnRpbnVlU2VudGluZWwpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogcmVjb3JkLmFyZyxcbiAgICAgICAgICAgIGRvbmU6IGNvbnRleHQuZG9uZVxuICAgICAgICAgIH07XG5cbiAgICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAvLyBEaXNwYXRjaCB0aGUgZXhjZXB0aW9uIGJ5IGxvb3BpbmcgYmFjayBhcm91bmQgdG8gdGhlXG4gICAgICAgICAgLy8gY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihjb250ZXh0LmFyZykgY2FsbCBhYm92ZS5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gQ2FsbCBkZWxlZ2F0ZS5pdGVyYXRvcltjb250ZXh0Lm1ldGhvZF0oY29udGV4dC5hcmcpIGFuZCBoYW5kbGUgdGhlXG4gIC8vIHJlc3VsdCwgZWl0aGVyIGJ5IHJldHVybmluZyBhIHsgdmFsdWUsIGRvbmUgfSByZXN1bHQgZnJvbSB0aGVcbiAgLy8gZGVsZWdhdGUgaXRlcmF0b3IsIG9yIGJ5IG1vZGlmeWluZyBjb250ZXh0Lm1ldGhvZCBhbmQgY29udGV4dC5hcmcsXG4gIC8vIHNldHRpbmcgY29udGV4dC5kZWxlZ2F0ZSB0byBudWxsLCBhbmQgcmV0dXJuaW5nIHRoZSBDb250aW51ZVNlbnRpbmVsLlxuICBmdW5jdGlvbiBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIG1ldGhvZCA9IGRlbGVnYXRlLml0ZXJhdG9yW2NvbnRleHQubWV0aG9kXTtcbiAgICBpZiAobWV0aG9kID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIEEgLnRocm93IG9yIC5yZXR1cm4gd2hlbiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIG5vIC50aHJvd1xuICAgICAgLy8gbWV0aG9kIGFsd2F5cyB0ZXJtaW5hdGVzIHRoZSB5aWVsZCogbG9vcC5cbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICBpZiAoZGVsZWdhdGUuaXRlcmF0b3IucmV0dXJuKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGhhcyBhIHJldHVybiBtZXRob2QsIGdpdmUgaXQgYVxuICAgICAgICAgIC8vIGNoYW5jZSB0byBjbGVhbiB1cC5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwicmV0dXJuXCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCk7XG5cbiAgICAgICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgLy8gSWYgbWF5YmVJbnZva2VEZWxlZ2F0ZShjb250ZXh0KSBjaGFuZ2VkIGNvbnRleHQubWV0aG9kIGZyb21cbiAgICAgICAgICAgIC8vIFwicmV0dXJuXCIgdG8gXCJ0aHJvd1wiLCBsZXQgdGhhdCBvdmVycmlkZSB0aGUgVHlwZUVycm9yIGJlbG93LlxuICAgICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgIGNvbnRleHQuYXJnID0gbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICBcIlRoZSBpdGVyYXRvciBkb2VzIG5vdCBwcm92aWRlIGEgJ3Rocm93JyBtZXRob2RcIik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChtZXRob2QsIGRlbGVnYXRlLml0ZXJhdG9yLCBjb250ZXh0LmFyZyk7XG5cbiAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICBjb250ZXh0LmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIHZhciBpbmZvID0gcmVjb3JkLmFyZztcblxuICAgIGlmICghIGluZm8pIHtcbiAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgY29udGV4dC5hcmcgPSBuZXcgVHlwZUVycm9yKFwiaXRlcmF0b3IgcmVzdWx0IGlzIG5vdCBhbiBvYmplY3RcIik7XG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIGlmIChpbmZvLmRvbmUpIHtcbiAgICAgIC8vIEFzc2lnbiB0aGUgcmVzdWx0IG9mIHRoZSBmaW5pc2hlZCBkZWxlZ2F0ZSB0byB0aGUgdGVtcG9yYXJ5XG4gICAgICAvLyB2YXJpYWJsZSBzcGVjaWZpZWQgYnkgZGVsZWdhdGUucmVzdWx0TmFtZSAoc2VlIGRlbGVnYXRlWWllbGQpLlxuICAgICAgY29udGV4dFtkZWxlZ2F0ZS5yZXN1bHROYW1lXSA9IGluZm8udmFsdWU7XG5cbiAgICAgIC8vIFJlc3VtZSBleGVjdXRpb24gYXQgdGhlIGRlc2lyZWQgbG9jYXRpb24gKHNlZSBkZWxlZ2F0ZVlpZWxkKS5cbiAgICAgIGNvbnRleHQubmV4dCA9IGRlbGVnYXRlLm5leHRMb2M7XG5cbiAgICAgIC8vIElmIGNvbnRleHQubWV0aG9kIHdhcyBcInRocm93XCIgYnV0IHRoZSBkZWxlZ2F0ZSBoYW5kbGVkIHRoZVxuICAgICAgLy8gZXhjZXB0aW9uLCBsZXQgdGhlIG91dGVyIGdlbmVyYXRvciBwcm9jZWVkIG5vcm1hbGx5LiBJZlxuICAgICAgLy8gY29udGV4dC5tZXRob2Qgd2FzIFwibmV4dFwiLCBmb3JnZXQgY29udGV4dC5hcmcgc2luY2UgaXQgaGFzIGJlZW5cbiAgICAgIC8vIFwiY29uc3VtZWRcIiBieSB0aGUgZGVsZWdhdGUgaXRlcmF0b3IuIElmIGNvbnRleHQubWV0aG9kIHdhc1xuICAgICAgLy8gXCJyZXR1cm5cIiwgYWxsb3cgdGhlIG9yaWdpbmFsIC5yZXR1cm4gY2FsbCB0byBjb250aW51ZSBpbiB0aGVcbiAgICAgIC8vIG91dGVyIGdlbmVyYXRvci5cbiAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCAhPT0gXCJyZXR1cm5cIikge1xuICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBSZS15aWVsZCB0aGUgcmVzdWx0IHJldHVybmVkIGJ5IHRoZSBkZWxlZ2F0ZSBtZXRob2QuXG4gICAgICByZXR1cm4gaW5mbztcbiAgICB9XG5cbiAgICAvLyBUaGUgZGVsZWdhdGUgaXRlcmF0b3IgaXMgZmluaXNoZWQsIHNvIGZvcmdldCBpdCBhbmQgY29udGludWUgd2l0aFxuICAgIC8vIHRoZSBvdXRlciBnZW5lcmF0b3IuXG4gICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gIH1cblxuICAvLyBEZWZpbmUgR2VuZXJhdG9yLnByb3RvdHlwZS57bmV4dCx0aHJvdyxyZXR1cm59IGluIHRlcm1zIG9mIHRoZVxuICAvLyB1bmlmaWVkIC5faW52b2tlIGhlbHBlciBtZXRob2QuXG4gIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhHcCk7XG5cbiAgR3BbdG9TdHJpbmdUYWdTeW1ib2xdID0gXCJHZW5lcmF0b3JcIjtcblxuICAvLyBBIEdlbmVyYXRvciBzaG91bGQgYWx3YXlzIHJldHVybiBpdHNlbGYgYXMgdGhlIGl0ZXJhdG9yIG9iamVjdCB3aGVuIHRoZVxuICAvLyBAQGl0ZXJhdG9yIGZ1bmN0aW9uIGlzIGNhbGxlZCBvbiBpdC4gU29tZSBicm93c2VycycgaW1wbGVtZW50YXRpb25zIG9mIHRoZVxuICAvLyBpdGVyYXRvciBwcm90b3R5cGUgY2hhaW4gaW5jb3JyZWN0bHkgaW1wbGVtZW50IHRoaXMsIGNhdXNpbmcgdGhlIEdlbmVyYXRvclxuICAvLyBvYmplY3QgdG8gbm90IGJlIHJldHVybmVkIGZyb20gdGhpcyBjYWxsLiBUaGlzIGVuc3VyZXMgdGhhdCBkb2Vzbid0IGhhcHBlbi5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWdlbmVyYXRvci9pc3N1ZXMvMjc0IGZvciBtb3JlIGRldGFpbHMuXG4gIEdwW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEdwLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwiW29iamVjdCBHZW5lcmF0b3JdXCI7XG4gIH07XG5cbiAgZnVuY3Rpb24gcHVzaFRyeUVudHJ5KGxvY3MpIHtcbiAgICB2YXIgZW50cnkgPSB7IHRyeUxvYzogbG9jc1swXSB9O1xuXG4gICAgaWYgKDEgaW4gbG9jcykge1xuICAgICAgZW50cnkuY2F0Y2hMb2MgPSBsb2NzWzFdO1xuICAgIH1cblxuICAgIGlmICgyIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmZpbmFsbHlMb2MgPSBsb2NzWzJdO1xuICAgICAgZW50cnkuYWZ0ZXJMb2MgPSBsb2NzWzNdO1xuICAgIH1cblxuICAgIHRoaXMudHJ5RW50cmllcy5wdXNoKGVudHJ5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0VHJ5RW50cnkoZW50cnkpIHtcbiAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbiB8fCB7fTtcbiAgICByZWNvcmQudHlwZSA9IFwibm9ybWFsXCI7XG4gICAgZGVsZXRlIHJlY29yZC5hcmc7XG4gICAgZW50cnkuY29tcGxldGlvbiA9IHJlY29yZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIENvbnRleHQodHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBUaGUgcm9vdCBlbnRyeSBvYmplY3QgKGVmZmVjdGl2ZWx5IGEgdHJ5IHN0YXRlbWVudCB3aXRob3V0IGEgY2F0Y2hcbiAgICAvLyBvciBhIGZpbmFsbHkgYmxvY2spIGdpdmVzIHVzIGEgcGxhY2UgdG8gc3RvcmUgdmFsdWVzIHRocm93biBmcm9tXG4gICAgLy8gbG9jYXRpb25zIHdoZXJlIHRoZXJlIGlzIG5vIGVuY2xvc2luZyB0cnkgc3RhdGVtZW50LlxuICAgIHRoaXMudHJ5RW50cmllcyA9IFt7IHRyeUxvYzogXCJyb290XCIgfV07XG4gICAgdHJ5TG9jc0xpc3QuZm9yRWFjaChwdXNoVHJ5RW50cnksIHRoaXMpO1xuICAgIHRoaXMucmVzZXQodHJ1ZSk7XG4gIH1cblxuICBydW50aW1lLmtleXMgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgIGtleXMucHVzaChrZXkpO1xuICAgIH1cbiAgICBrZXlzLnJldmVyc2UoKTtcblxuICAgIC8vIFJhdGhlciB0aGFuIHJldHVybmluZyBhbiBvYmplY3Qgd2l0aCBhIG5leHQgbWV0aG9kLCB3ZSBrZWVwXG4gICAgLy8gdGhpbmdzIHNpbXBsZSBhbmQgcmV0dXJuIHRoZSBuZXh0IGZ1bmN0aW9uIGl0c2VsZi5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgIHdoaWxlIChrZXlzLmxlbmd0aCkge1xuICAgICAgICB2YXIga2V5ID0ga2V5cy5wb3AoKTtcbiAgICAgICAgaWYgKGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgICBuZXh0LnZhbHVlID0ga2V5O1xuICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRvIGF2b2lkIGNyZWF0aW5nIGFuIGFkZGl0aW9uYWwgb2JqZWN0LCB3ZSBqdXN0IGhhbmcgdGhlIC52YWx1ZVxuICAgICAgLy8gYW5kIC5kb25lIHByb3BlcnRpZXMgb2ZmIHRoZSBuZXh0IGZ1bmN0aW9uIG9iamVjdCBpdHNlbGYuIFRoaXNcbiAgICAgIC8vIGFsc28gZW5zdXJlcyB0aGF0IHRoZSBtaW5pZmllciB3aWxsIG5vdCBhbm9ueW1pemUgdGhlIGZ1bmN0aW9uLlxuICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcbiAgICAgIHJldHVybiBuZXh0O1xuICAgIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gdmFsdWVzKGl0ZXJhYmxlKSB7XG4gICAgaWYgKGl0ZXJhYmxlKSB7XG4gICAgICB2YXIgaXRlcmF0b3JNZXRob2QgPSBpdGVyYWJsZVtpdGVyYXRvclN5bWJvbF07XG4gICAgICBpZiAoaXRlcmF0b3JNZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yTWV0aG9kLmNhbGwoaXRlcmFibGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGl0ZXJhYmxlLm5leHQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gaXRlcmFibGU7XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNOYU4oaXRlcmFibGUubGVuZ3RoKSkge1xuICAgICAgICB2YXIgaSA9IC0xLCBuZXh0ID0gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgaXRlcmFibGUubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoaGFzT3duLmNhbGwoaXRlcmFibGUsIGkpKSB7XG4gICAgICAgICAgICAgIG5leHQudmFsdWUgPSBpdGVyYWJsZVtpXTtcbiAgICAgICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIG5leHQudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcblxuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBuZXh0Lm5leHQgPSBuZXh0O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJldHVybiBhbiBpdGVyYXRvciB3aXRoIG5vIHZhbHVlcy5cbiAgICByZXR1cm4geyBuZXh0OiBkb25lUmVzdWx0IH07XG4gIH1cbiAgcnVudGltZS52YWx1ZXMgPSB2YWx1ZXM7XG5cbiAgZnVuY3Rpb24gZG9uZVJlc3VsdCgpIHtcbiAgICByZXR1cm4geyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH07XG4gIH1cblxuICBDb250ZXh0LnByb3RvdHlwZSA9IHtcbiAgICBjb25zdHJ1Y3RvcjogQ29udGV4dCxcblxuICAgIHJlc2V0OiBmdW5jdGlvbihza2lwVGVtcFJlc2V0KSB7XG4gICAgICB0aGlzLnByZXYgPSAwO1xuICAgICAgdGhpcy5uZXh0ID0gMDtcbiAgICAgIC8vIFJlc2V0dGluZyBjb250ZXh0Ll9zZW50IGZvciBsZWdhY3kgc3VwcG9ydCBvZiBCYWJlbCdzXG4gICAgICAvLyBmdW5jdGlvbi5zZW50IGltcGxlbWVudGF0aW9uLlxuICAgICAgdGhpcy5zZW50ID0gdGhpcy5fc2VudCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgIHRoaXMubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICB0aGlzLmFyZyA9IHVuZGVmaW5lZDtcblxuICAgICAgdGhpcy50cnlFbnRyaWVzLmZvckVhY2gocmVzZXRUcnlFbnRyeSk7XG5cbiAgICAgIGlmICghc2tpcFRlbXBSZXNldCkge1xuICAgICAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMpIHtcbiAgICAgICAgICAvLyBOb3Qgc3VyZSBhYm91dCB0aGUgb3B0aW1hbCBvcmRlciBvZiB0aGVzZSBjb25kaXRpb25zOlxuICAgICAgICAgIGlmIChuYW1lLmNoYXJBdCgwKSA9PT0gXCJ0XCIgJiZcbiAgICAgICAgICAgICAgaGFzT3duLmNhbGwodGhpcywgbmFtZSkgJiZcbiAgICAgICAgICAgICAgIWlzTmFOKCtuYW1lLnNsaWNlKDEpKSkge1xuICAgICAgICAgICAgdGhpc1tuYW1lXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuXG4gICAgICB2YXIgcm9vdEVudHJ5ID0gdGhpcy50cnlFbnRyaWVzWzBdO1xuICAgICAgdmFyIHJvb3RSZWNvcmQgPSByb290RW50cnkuY29tcGxldGlvbjtcbiAgICAgIGlmIChyb290UmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByb290UmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucnZhbDtcbiAgICB9LFxuXG4gICAgZGlzcGF0Y2hFeGNlcHRpb246IGZ1bmN0aW9uKGV4Y2VwdGlvbikge1xuICAgICAgaWYgKHRoaXMuZG9uZSkge1xuICAgICAgICB0aHJvdyBleGNlcHRpb247XG4gICAgICB9XG5cbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcztcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZShsb2MsIGNhdWdodCkge1xuICAgICAgICByZWNvcmQudHlwZSA9IFwidGhyb3dcIjtcbiAgICAgICAgcmVjb3JkLmFyZyA9IGV4Y2VwdGlvbjtcbiAgICAgICAgY29udGV4dC5uZXh0ID0gbG9jO1xuXG4gICAgICAgIGlmIChjYXVnaHQpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgZGlzcGF0Y2hlZCBleGNlcHRpb24gd2FzIGNhdWdodCBieSBhIGNhdGNoIGJsb2NrLFxuICAgICAgICAgIC8vIHRoZW4gbGV0IHRoYXQgY2F0Y2ggYmxvY2sgaGFuZGxlIHRoZSBleGNlcHRpb24gbm9ybWFsbHkuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAhISBjYXVnaHQ7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSBcInJvb3RcIikge1xuICAgICAgICAgIC8vIEV4Y2VwdGlvbiB0aHJvd24gb3V0c2lkZSBvZiBhbnkgdHJ5IGJsb2NrIHRoYXQgY291bGQgaGFuZGxlXG4gICAgICAgICAgLy8gaXQsIHNvIHNldCB0aGUgY29tcGxldGlvbiB2YWx1ZSBvZiB0aGUgZW50aXJlIGZ1bmN0aW9uIHRvXG4gICAgICAgICAgLy8gdGhyb3cgdGhlIGV4Y2VwdGlvbi5cbiAgICAgICAgICByZXR1cm4gaGFuZGxlKFwiZW5kXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYpIHtcbiAgICAgICAgICB2YXIgaGFzQ2F0Y2ggPSBoYXNPd24uY2FsbChlbnRyeSwgXCJjYXRjaExvY1wiKTtcbiAgICAgICAgICB2YXIgaGFzRmluYWxseSA9IGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIik7XG5cbiAgICAgICAgICBpZiAoaGFzQ2F0Y2ggJiYgaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0NhdGNoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidHJ5IHN0YXRlbWVudCB3aXRob3V0IGNhdGNoIG9yIGZpbmFsbHlcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGFicnVwdDogZnVuY3Rpb24odHlwZSwgYXJnKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIikgJiZcbiAgICAgICAgICAgIHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICB2YXIgZmluYWxseUVudHJ5ID0gZW50cnk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSAmJlxuICAgICAgICAgICh0eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICAgdHlwZSA9PT0gXCJjb250aW51ZVwiKSAmJlxuICAgICAgICAgIGZpbmFsbHlFbnRyeS50cnlMb2MgPD0gYXJnICYmXG4gICAgICAgICAgYXJnIDw9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgIC8vIElnbm9yZSB0aGUgZmluYWxseSBlbnRyeSBpZiBjb250cm9sIGlzIG5vdCBqdW1waW5nIHRvIGFcbiAgICAgICAgLy8gbG9jYXRpb24gb3V0c2lkZSB0aGUgdHJ5L2NhdGNoIGJsb2NrLlxuICAgICAgICBmaW5hbGx5RW50cnkgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVjb3JkID0gZmluYWxseUVudHJ5ID8gZmluYWxseUVudHJ5LmNvbXBsZXRpb24gOiB7fTtcbiAgICAgIHJlY29yZC50eXBlID0gdHlwZTtcbiAgICAgIHJlY29yZC5hcmcgPSBhcmc7XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkpIHtcbiAgICAgICAgdGhpcy5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgdGhpcy5uZXh0ID0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2M7XG4gICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5jb21wbGV0ZShyZWNvcmQpO1xuICAgIH0sXG5cbiAgICBjb21wbGV0ZTogZnVuY3Rpb24ocmVjb3JkLCBhZnRlckxvYykge1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICByZWNvcmQudHlwZSA9PT0gXCJjb250aW51ZVwiKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IHJlY29yZC5hcmc7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInJldHVyblwiKSB7XG4gICAgICAgIHRoaXMucnZhbCA9IHRoaXMuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgdGhpcy5tZXRob2QgPSBcInJldHVyblwiO1xuICAgICAgICB0aGlzLm5leHQgPSBcImVuZFwiO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIiAmJiBhZnRlckxvYykge1xuICAgICAgICB0aGlzLm5leHQgPSBhZnRlckxvYztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfSxcblxuICAgIGZpbmlzaDogZnVuY3Rpb24oZmluYWxseUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS5maW5hbGx5TG9jID09PSBmaW5hbGx5TG9jKSB7XG4gICAgICAgICAgdGhpcy5jb21wbGV0ZShlbnRyeS5jb21wbGV0aW9uLCBlbnRyeS5hZnRlckxvYyk7XG4gICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgXCJjYXRjaFwiOiBmdW5jdGlvbih0cnlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSB0cnlMb2MpIHtcbiAgICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcbiAgICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgdmFyIHRocm93biA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRocm93bjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUaGUgY29udGV4dC5jYXRjaCBtZXRob2QgbXVzdCBvbmx5IGJlIGNhbGxlZCB3aXRoIGEgbG9jYXRpb25cbiAgICAgIC8vIGFyZ3VtZW50IHRoYXQgY29ycmVzcG9uZHMgdG8gYSBrbm93biBjYXRjaCBibG9jay5cbiAgICAgIHRocm93IG5ldyBFcnJvcihcImlsbGVnYWwgY2F0Y2ggYXR0ZW1wdFwiKTtcbiAgICB9LFxuXG4gICAgZGVsZWdhdGVZaWVsZDogZnVuY3Rpb24oaXRlcmFibGUsIHJlc3VsdE5hbWUsIG5leHRMb2MpIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSB7XG4gICAgICAgIGl0ZXJhdG9yOiB2YWx1ZXMoaXRlcmFibGUpLFxuICAgICAgICByZXN1bHROYW1lOiByZXN1bHROYW1lLFxuICAgICAgICBuZXh0TG9jOiBuZXh0TG9jXG4gICAgICB9O1xuXG4gICAgICBpZiAodGhpcy5tZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgIC8vIERlbGliZXJhdGVseSBmb3JnZXQgdGhlIGxhc3Qgc2VudCB2YWx1ZSBzbyB0aGF0IHdlIGRvbid0XG4gICAgICAgIC8vIGFjY2lkZW50YWxseSBwYXNzIGl0IG9uIHRvIHRoZSBkZWxlZ2F0ZS5cbiAgICAgICAgdGhpcy5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cbiAgfTtcbn0pKFxuICAvLyBJbiBzbG9wcHkgbW9kZSwgdW5ib3VuZCBgdGhpc2AgcmVmZXJzIHRvIHRoZSBnbG9iYWwgb2JqZWN0LCBmYWxsYmFjayB0b1xuICAvLyBGdW5jdGlvbiBjb25zdHJ1Y3RvciBpZiB3ZSdyZSBpbiBnbG9iYWwgc3RyaWN0IG1vZGUuIFRoYXQgaXMgc2FkbHkgYSBmb3JtXG4gIC8vIG9mIGluZGlyZWN0IGV2YWwgd2hpY2ggdmlvbGF0ZXMgQ29udGVudCBTZWN1cml0eSBQb2xpY3kuXG4gIChmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMgfSkoKSB8fCBGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKClcbik7XG4iLCJcbi8qKlxuICogTW9kdWxlIERlcGVuZGVuY2llc1xuICovXG5cbnZhciBleHByO1xudHJ5IHtcbiAgZXhwciA9IHJlcXVpcmUoJ3Byb3BzJyk7XG59IGNhdGNoKGUpIHtcbiAgZXhwciA9IHJlcXVpcmUoJ2NvbXBvbmVudC1wcm9wcycpO1xufVxuXG4vKipcbiAqIEV4cG9zZSBgdG9GdW5jdGlvbigpYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRvRnVuY3Rpb247XG5cbi8qKlxuICogQ29udmVydCBgb2JqYCB0byBhIGBGdW5jdGlvbmAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gb2JqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHRvRnVuY3Rpb24ob2JqKSB7XG4gIHN3aXRjaCAoe30udG9TdHJpbmcuY2FsbChvYmopKSB7XG4gICAgY2FzZSAnW29iamVjdCBPYmplY3RdJzpcbiAgICAgIHJldHVybiBvYmplY3RUb0Z1bmN0aW9uKG9iaik7XG4gICAgY2FzZSAnW29iamVjdCBGdW5jdGlvbl0nOlxuICAgICAgcmV0dXJuIG9iajtcbiAgICBjYXNlICdbb2JqZWN0IFN0cmluZ10nOlxuICAgICAgcmV0dXJuIHN0cmluZ1RvRnVuY3Rpb24ob2JqKTtcbiAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOlxuICAgICAgcmV0dXJuIHJlZ2V4cFRvRnVuY3Rpb24ob2JqKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGRlZmF1bHRUb0Z1bmN0aW9uKG9iaik7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWZhdWx0IHRvIHN0cmljdCBlcXVhbGl0eS5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZGVmYXVsdFRvRnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiBmdW5jdGlvbihvYmope1xuICAgIHJldHVybiB2YWwgPT09IG9iajtcbiAgfTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGByZWAgdG8gYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1JlZ0V4cH0gcmVcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcmVnZXhwVG9GdW5jdGlvbihyZSkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqKXtcbiAgICByZXR1cm4gcmUudGVzdChvYmopO1xuICB9O1xufVxuXG4vKipcbiAqIENvbnZlcnQgcHJvcGVydHkgYHN0cmAgdG8gYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHN0cmluZ1RvRnVuY3Rpb24oc3RyKSB7XG4gIC8vIGltbWVkaWF0ZSBzdWNoIGFzIFwiPiAyMFwiXG4gIGlmICgvXiAqXFxXKy8udGVzdChzdHIpKSByZXR1cm4gbmV3IEZ1bmN0aW9uKCdfJywgJ3JldHVybiBfICcgKyBzdHIpO1xuXG4gIC8vIHByb3BlcnRpZXMgc3VjaCBhcyBcIm5hbWUuZmlyc3RcIiBvciBcImFnZSA+IDE4XCIgb3IgXCJhZ2UgPiAxOCAmJiBhZ2UgPCAzNlwiXG4gIHJldHVybiBuZXcgRnVuY3Rpb24oJ18nLCAncmV0dXJuICcgKyBnZXQoc3RyKSk7XG59XG5cbi8qKlxuICogQ29udmVydCBgb2JqZWN0YCB0byBhIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3RcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gb2JqZWN0VG9GdW5jdGlvbihvYmopIHtcbiAgdmFyIG1hdGNoID0ge307XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBtYXRjaFtrZXldID0gdHlwZW9mIG9ialtrZXldID09PSAnc3RyaW5nJ1xuICAgICAgPyBkZWZhdWx0VG9GdW5jdGlvbihvYmpba2V5XSlcbiAgICAgIDogdG9GdW5jdGlvbihvYmpba2V5XSk7XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbCl7XG4gICAgaWYgKHR5cGVvZiB2YWwgIT09ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG4gICAgZm9yICh2YXIga2V5IGluIG1hdGNoKSB7XG4gICAgICBpZiAoIShrZXkgaW4gdmFsKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgaWYgKCFtYXRjaFtrZXldKHZhbFtrZXldKSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbn1cblxuLyoqXG4gKiBCdWlsdCB0aGUgZ2V0dGVyIGZ1bmN0aW9uLiBTdXBwb3J0cyBnZXR0ZXIgc3R5bGUgZnVuY3Rpb25zXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZ2V0KHN0cikge1xuICB2YXIgcHJvcHMgPSBleHByKHN0cik7XG4gIGlmICghcHJvcHMubGVuZ3RoKSByZXR1cm4gJ18uJyArIHN0cjtcblxuICB2YXIgdmFsLCBpLCBwcm9wO1xuICBmb3IgKGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICBwcm9wID0gcHJvcHNbaV07XG4gICAgdmFsID0gJ18uJyArIHByb3A7XG4gICAgdmFsID0gXCIoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgXCIgKyB2YWwgKyBcIiA/IFwiICsgdmFsICsgXCIoKSA6IFwiICsgdmFsICsgXCIpXCI7XG5cbiAgICAvLyBtaW1pYyBuZWdhdGl2ZSBsb29rYmVoaW5kIHRvIGF2b2lkIHByb2JsZW1zIHdpdGggbmVzdGVkIHByb3BlcnRpZXNcbiAgICBzdHIgPSBzdHJpcE5lc3RlZChwcm9wLCBzdHIsIHZhbCk7XG4gIH1cblxuICByZXR1cm4gc3RyO1xufVxuXG4vKipcbiAqIE1pbWljIG5lZ2F0aXZlIGxvb2tiZWhpbmQgdG8gYXZvaWQgcHJvYmxlbXMgd2l0aCBuZXN0ZWQgcHJvcGVydGllcy5cbiAqXG4gKiBTZWU6IGh0dHA6Ly9ibG9nLnN0ZXZlbmxldml0aGFuLmNvbS9hcmNoaXZlcy9taW1pYy1sb29rYmVoaW5kLWphdmFzY3JpcHRcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc3RyaXBOZXN0ZWQgKHByb3AsIHN0ciwgdmFsKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZShuZXcgUmVnRXhwKCcoXFxcXC4pPycgKyBwcm9wLCAnZycpLCBmdW5jdGlvbigkMCwgJDEpIHtcbiAgICByZXR1cm4gJDEgPyAkMCA6IHZhbDtcbiAgfSk7XG59XG4iLCJpbXBvcnQgSW5NZW1vcnlBZGFwdGVyIGZyb20gJy4vaW5tZW1vcnknO1xuaW1wb3J0IExvY2FsU3RvcmFnZUFkYXB0ZXIgZnJvbSAnLi9sb2NhbHN0b3JhZ2UnO1xuXG5leHBvcnQgeyBJbk1lbW9yeUFkYXB0ZXIsIExvY2FsU3RvcmFnZUFkYXB0ZXIgfTtcbiIsIi8vIEBmbG93XG5pbXBvcnQgdHlwZSB7IElTdG9yYWdlIH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9zdG9yYWdlJztcbmltcG9ydCB0eXBlIHsgSUNvbmZpZyB9IGZyb20gJy4uL2ludGVyZmFjZXMvY29uZmlnJztcbmltcG9ydCB0eXBlIElUYXNrIGZyb20gJy4uL2ludGVyZmFjZXMvdGFzayc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEluTWVtb3J5QWRhcHRlciBpbXBsZW1lbnRzIElTdG9yYWdlIHtcbiAgY29uZmlnOiBJQ29uZmlnO1xuICBwcmVmaXg6IHN0cmluZztcbiAgc3RvcmU6IHsgW3Byb3A6IHN0cmluZ106IGFueSB9ID0ge307XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBJQ29uZmlnKSB7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5wcmVmaXggPSB0aGlzLmNvbmZpZy5nZXQoJ3ByZWZpeCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2UgaXRlbSBmcm9tIHN0b3JlIGJ5IGtleVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtQcm9taXNlPElUYXNrPn0gKGFycmF5KVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgZ2V0KG5hbWU6IHN0cmluZyk6IFByb21pc2U8SVRhc2tbXT4ge1xuICAgIGNvbnN0IGNvbGxOYW1lID0gdGhpcy5zdG9yYWdlTmFtZShuYW1lKTtcbiAgICByZXR1cm4gWy4uLnRoaXMuZ2V0Q29sbGVjdGlvbihjb2xsTmFtZSldO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBpdGVtIHRvIHN0b3JlXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSAge1N0cmluZ30gdmFsdWVcbiAgICogQHJldHVybiB7UHJvbWlzZTxBbnk+fVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogYW55W10pOiBQcm9taXNlPGFueT4ge1xuICAgIHRoaXMuc3RvcmVbdGhpcy5zdG9yYWdlTmFtZShrZXkpXSA9IFsuLi52YWx1ZV07XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEl0ZW0gY2hlY2tlciBpbiBzdG9yZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtQcm9taXNlPEJvb2xlYW4+fVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgaGFzKGtleTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLnN0b3JlLCB0aGlzLnN0b3JhZ2VOYW1lKGtleSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBpdGVtXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge1Byb21pc2U8QW55Pn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGNsZWFyKGtleTogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCByZXN1bHQgPSAoYXdhaXQgdGhpcy5oYXMoa2V5KSkgPyBkZWxldGUgdGhpcy5zdG9yZVt0aGlzLnN0b3JhZ2VOYW1lKGtleSldIDogZmFsc2U7XG4gICAgdGhpcy5zdG9yZSA9IHsgLi4udGhpcy5zdG9yZSB9O1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogQ29tcG9zZSBjb2xsZWN0aW9uIG5hbWUgYnkgc3VmZml4XG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gc3VmZml4XG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHN0b3JhZ2VOYW1lKHN1ZmZpeDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN1ZmZpeC5zdGFydHNXaXRoKHRoaXMuZ2V0UHJlZml4KCkpID8gc3VmZml4IDogYCR7dGhpcy5nZXRQcmVmaXgoKX1fJHtzdWZmaXh9YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgcHJlZml4IG9mIGNoYW5uZWwgY29sbGVjdGlvblxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBnZXRQcmVmaXgoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnLmdldCgncHJlZml4Jyk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGNvbGxlY3Rpb25cbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuICBnZXRDb2xsZWN0aW9uKG5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IGhhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLnN0b3JlLCBuYW1lKTtcbiAgICBpZiAoIWhhcykgdGhpcy5zdG9yZVtuYW1lXSA9IFtdO1xuICAgIHJldHVybiB0aGlzLnN0b3JlW25hbWVdO1xuICB9XG59XG4iLCIvLyBAZmxvd1xuaW1wb3J0IHR5cGUgeyBJU3RvcmFnZSB9IGZyb20gJy4uL2ludGVyZmFjZXMvc3RvcmFnZSc7XG5pbXBvcnQgdHlwZSB7IElDb25maWcgfSBmcm9tICcuLi9pbnRlcmZhY2VzL2NvbmZpZyc7XG5pbXBvcnQgdHlwZSBJVGFzayBmcm9tICcuLi9pbnRlcmZhY2VzL3Rhc2snO1xuXG4vKiBnbG9iYWwgbG9jYWxTdG9yYWdlICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExvY2FsU3RvcmFnZUFkYXB0ZXIgaW1wbGVtZW50cyBJU3RvcmFnZSB7XG4gIGNvbmZpZzogSUNvbmZpZztcbiAgcHJlZml4OiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBJQ29uZmlnKSB7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5wcmVmaXggPSB0aGlzLmNvbmZpZy5nZXQoJ3ByZWZpeCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2UgaXRlbSBmcm9tIGxvY2FsIHN0b3JhZ2UgYnkga2V5XG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge1Byb21pc2U8SVRhc2s+fSAoYXJyYXkpXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBnZXQobmFtZTogc3RyaW5nKTogUHJvbWlzZTxJVGFza1tdPiB7XG4gICAgY29uc3QgcmVzdWx0OiBhbnkgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLnN0b3JhZ2VOYW1lKG5hbWUpKTtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShyZXN1bHQpIHx8IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBpdGVtIHRvIGxvY2FsIHN0b3JhZ2VcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHBhcmFtICB7U3RyaW5nfSB2YWx1ZVxuICAgKiBAcmV0dXJuIHtQcm9taXNlPEFueT59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBzZXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBhbnlbXSk6IFByb21pc2U8YW55PiB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5zdG9yYWdlTmFtZShrZXkpLCBKU09OLnN0cmluZ2lmeSh2YWx1ZSkpO1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdGVtIGNoZWNrZXIgaW4gbG9jYWwgc3RvcmFnZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtQcm9taXNlPEJvb2xlYW4+fVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgaGFzKGtleTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChsb2NhbFN0b3JhZ2UsIHRoaXMuc3RvcmFnZU5hbWUoa2V5KSk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGl0ZW1cbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7UHJvbWlzZTxBbnk+fVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgY2xlYXIoa2V5OiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IChhd2FpdCB0aGlzLmhhcyhrZXkpKSA/IGRlbGV0ZSBsb2NhbFN0b3JhZ2VbdGhpcy5zdG9yYWdlTmFtZShrZXkpXSA6IGZhbHNlO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogQ29tcG9zZSBjb2xsZWN0aW9uIG5hbWUgYnkgc3VmZml4XG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gc3VmZml4XG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHN0b3JhZ2VOYW1lKHN1ZmZpeDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN1ZmZpeC5zdGFydHNXaXRoKHRoaXMuZ2V0UHJlZml4KCkpID8gc3VmZml4IDogYCR7dGhpcy5nZXRQcmVmaXgoKX1fJHtzdWZmaXh9YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgcHJlZml4IG9mIGNoYW5uZWwgY29sbGVjdGlvblxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBnZXRQcmVmaXgoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnLmdldCgncHJlZml4Jyk7XG4gIH1cbn1cbiIsIi8vIEBmbG93XG5pbXBvcnQgdHlwZSBJVGFzayBmcm9tICcuL2ludGVyZmFjZXMvdGFzayc7XG5pbXBvcnQgdHlwZSBJQ29uZmlnIGZyb20gJy4vaW50ZXJmYWNlcy9jb25maWcnO1xuaW1wb3J0IEV2ZW50IGZyb20gJy4vZXZlbnQnO1xuaW1wb3J0IFN0b3JhZ2VDYXBzdWxlIGZyb20gJy4vc3RvcmFnZS1jYXBzdWxlJztcbmltcG9ydCBRdWV1ZSBmcm9tICcuL3F1ZXVlJztcbmltcG9ydCB7IHV0aWxDbGVhckJ5VGFnIH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge1xuICBkYixcbiAgY2FuTXVsdGlwbGUsXG4gIHNhdmVUYXNrLFxuICBsb2dQcm94eSxcbiAgY3JlYXRlVGltZW91dCxcbiAgc3RhdHVzT2ZmLFxuICBzdG9wUXVldWUsXG4gIGdldFRhc2tzV2l0aG91dEZyZWV6ZWQsXG59IGZyb20gJy4vaGVscGVycyc7XG5pbXBvcnQge1xuICB0YXNrQWRkZWRMb2csXG4gIG5leHRUYXNrTG9nLFxuICBxdWV1ZVN0b3BwaW5nTG9nLFxuICBxdWV1ZVN0YXJ0TG9nLFxuICBldmVudENyZWF0ZWRMb2csXG59IGZyb20gJy4vY29uc29sZSc7XG5cbi8qIGVzbGludCBuby11bmRlcnNjb3JlLWRhbmdsZTogWzIsIHsgXCJhbGxvd1wiOiBbXCJfaWRcIl0gfV0gKi9cblxuY29uc3QgY2hhbm5lbE5hbWUgPSBTeW1ib2woJ2NoYW5uZWwtbmFtZScpO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDaGFubmVsIHtcbiAgc3RvcHBlZDogYm9vbGVhbiA9IHRydWU7XG4gIHJ1bm5pbmc6IGJvb2xlYW4gPSBmYWxzZTtcbiAgdGltZW91dDogbnVtYmVyO1xuICBzdG9yYWdlOiBTdG9yYWdlQ2Fwc3VsZTtcbiAgY29uZmlnOiBJQ29uZmlnO1xuICBldmVudCA9IG5ldyBFdmVudCgpO1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgY29uZmlnOiBJQ29uZmlnKSB7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG5cbiAgICAvLyBzYXZlIGNoYW5uZWwgbmFtZSB0byB0aGlzIGNsYXNzIHdpdGggc3ltYm9saWMga2V5XG4gICAgKHRoaXM6IE9iamVjdClbY2hhbm5lbE5hbWVdID0gbmFtZTtcblxuICAgIC8vIGlmIGN1c3RvbSBzdG9yYWdlIGRyaXZlciBleGlzdHMsIHNldHVwIGl0XG4gICAgY29uc3QgeyBkcml2ZXJzIH06IGFueSA9IFF1ZXVlO1xuICAgIGNvbnN0IHN0b3JhZ2UgPSBuZXcgU3RvcmFnZUNhcHN1bGUoY29uZmlnLCBkcml2ZXJzLnN0b3JhZ2UpO1xuICAgIHRoaXMuc3RvcmFnZSA9IHN0b3JhZ2UuY2hhbm5lbChuYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgY2hhbm5lbCBuYW1lXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ30gY2hhbm5lbCBuYW1lXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBuYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICh0aGlzOiBPYmplY3QpW2NoYW5uZWxOYW1lXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgbmV3IGpvYiB0byBjaGFubmVsXG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gdGFza1xuICAgKiBAcmV0dXJuIHtTdHJpbmd8Qm9vbGVhbn0gam9iXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBhZGQodGFzazogSVRhc2spOiBQcm9taXNlPHN0cmluZyB8IGJvb2xlYW4+IHtcbiAgICBpZiAoIShhd2FpdCBjYW5NdWx0aXBsZS5jYWxsKHRoaXMsIHRhc2spKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgY29uc3QgaWQgPSBhd2FpdCBzYXZlVGFzay5jYWxsKHRoaXMsIHRhc2spO1xuXG4gICAgaWYgKGlkICYmIHRoaXMuc3RvcHBlZCAmJiB0aGlzLnJ1bm5pbmcgPT09IHRydWUpIHtcbiAgICAgIGF3YWl0IHRoaXMuc3RhcnQoKTtcbiAgICB9XG5cbiAgICAvLyBwYXNzIGFjdGl2aXR5IHRvIHRoZSBsb2cgc2VydmljZS5cbiAgICBsb2dQcm94eS5jYWxsKHRoaXMsIHRhc2tBZGRlZExvZywgdGFzayk7XG5cbiAgICByZXR1cm4gaWQ7XG4gIH1cblxuICAvKipcbiAgICogUHJvY2VzcyBuZXh0IGpvYlxuICAgKlxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgbmV4dCgpOiBQcm9taXNlPHZvaWQgfCBib29sZWFuPiB7XG4gICAgaWYgKHRoaXMuc3RvcHBlZCkge1xuICAgICAgc3RhdHVzT2ZmLmNhbGwodGhpcyk7XG4gICAgICByZXR1cm4gc3RvcFF1ZXVlLmNhbGwodGhpcyk7XG4gICAgfVxuXG4gICAgLy8gR2VuZXJhdGUgYSBsb2cgbWVzc2FnZVxuICAgIGxvZ1Byb3h5LmNhbGwodGhpcywgbmV4dFRhc2tMb2csICduZXh0Jyk7XG5cbiAgICAvLyBzdGFydCBxdWV1ZSBhZ2FpblxuICAgIGF3YWl0IHRoaXMuc3RhcnQoKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHF1ZXVlIGxpc3RlbmVyXG4gICAqXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59IGpvYlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgc3RhcnQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgLy8gU3RvcCB0aGUgcXVldWUgZm9yIHJlc3RhcnRcbiAgICB0aGlzLnN0b3BwZWQgPSBmYWxzZTtcblxuICAgIGxvZ1Byb3h5LmNhbGwodGhpcywgcXVldWVTdGFydExvZywgJ3N0YXJ0Jyk7XG5cbiAgICAvLyBDcmVhdGUgYSB0aW1lb3V0IGZvciBzdGFydCBxdWV1ZVxuICAgIHRoaXMucnVubmluZyA9IChhd2FpdCBjcmVhdGVUaW1lb3V0LmNhbGwodGhpcykpID4gMDtcblxuICAgIHJldHVybiB0aGlzLnJ1bm5pbmc7XG4gIH1cblxuICAvKipcbiAgICogU3RvcCBxdWV1ZSBsaXN0ZW5lciBhZnRlciBlbmQgb2YgY3VycmVudCB0YXNrXG4gICAqXG4gICAqIEByZXR1cm4ge1ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBzdG9wKCk6IHZvaWQge1xuICAgIGxvZ1Byb3h5LmNhbGwodGhpcywgcXVldWVTdG9wcGluZ0xvZywgJ3N0b3AnKTtcbiAgICB0aGlzLnN0b3BwZWQgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgcXVldWUgbGlzdGVuZXIgaW5jbHVkaW5nIGN1cnJlbnQgdGFza1xuICAgKlxuICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgZm9yY2VTdG9wKCk6IHZvaWQge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgc3RvcFF1ZXVlLmNhbGwodGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhlIGNoYW5uZWwgd29ya2luZ1xuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgc3RhdHVzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnJ1bm5pbmc7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciB0aGVyZSBpcyBhbnkgdGFza1xuICAgKlxuICAgKiBAcmV0dXJuIHtCb29lbGFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgaXNFbXB0eSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuY291bnQoKSkgPCAxO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0YXNrIGNvdW50XG4gICAqXG4gICAqIEByZXR1cm4ge051bWJlcn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGNvdW50KCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgcmV0dXJuIChhd2FpdCBnZXRUYXNrc1dpdGhvdXRGcmVlemVkLmNhbGwodGhpcykpLmxlbmd0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGFzayBjb3VudCBieSB0YWdcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSB0YWdcbiAgICogQHJldHVybiB7QXJyYXk8SVRhc2s+fVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgY291bnRCeVRhZyh0YWc6IHN0cmluZyk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgcmV0dXJuIChhd2FpdCBnZXRUYXNrc1dpdGhvdXRGcmVlemVkLmNhbGwodGhpcykpLmZpbHRlcih0ID0+IHQudGFnID09PSB0YWcpLmxlbmd0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYWxsIHRhc2tzIGZyb20gY2hhbm5lbFxuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgY2xlYXIoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKCF0aGlzLm5hbWUoKSkgcmV0dXJuIGZhbHNlO1xuICAgIGF3YWl0IHRoaXMuc3RvcmFnZS5jbGVhcih0aGlzLm5hbWUoKSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFsbCB0YXNrcyBmcm9tIGNoYW5uZWwgYnkgdGFnXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gdGFnXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBjbGVhckJ5VGFnKHRhZzogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IGRiLmNhbGwoc2VsZikuYWxsKCk7XG4gICAgY29uc3QgcmVtb3ZlcyA9IGRhdGEuZmlsdGVyKHV0aWxDbGVhckJ5VGFnLmJpbmQodGFnKSkubWFwKGFzeW5jICh0KSA9PiB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBkYi5jYWxsKHNlbGYpLmRlbGV0ZSh0Ll9pZCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0pO1xuICAgIGF3YWl0IFByb21pc2UuYWxsKHJlbW92ZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGEgdGFzayB3aGV0aGVyIGV4aXN0cyBieSBqb2IgaWRcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSB0YWdcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGhhcyhpZDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCBnZXRUYXNrc1dpdGhvdXRGcmVlemVkLmNhbGwodGhpcykpLmZpbmRJbmRleCh0ID0+IHQuX2lkID09PSBpZCkgPiAtMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBhIHRhc2sgd2hldGhlciBleGlzdHMgYnkgdGFnXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gdGFnXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBoYXNCeVRhZyh0YWc6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgZ2V0VGFza3NXaXRob3V0RnJlZXplZC5jYWxsKHRoaXMpKS5maW5kSW5kZXgodCA9PiB0LnRhZyA9PT0gdGFnKSA+IC0xO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBhY3Rpb24gZXZlbnRzXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjYlxuICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgb24oa2V5OiBzdHJpbmcsIGNiOiBGdW5jdGlvbik6IHZvaWQge1xuICAgIHRoaXMuZXZlbnQub24oLi4uW2tleSwgY2JdKTtcbiAgICBsb2dQcm94eS5jYWxsKHRoaXMsIGV2ZW50Q3JlYXRlZExvZywga2V5KTtcbiAgfVxufVxuIiwiLyogQGZsb3cgKi9cbmltcG9ydCB0eXBlIElDb25maWcgZnJvbSAnLi9pbnRlcmZhY2VzL2NvbmZpZyc7XG5pbXBvcnQgY29uZmlnRGF0YSBmcm9tICcuL2VudW0vY29uZmlnLmRhdGEnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25maWcge1xuICBjb25maWc6IElDb25maWcgPSBjb25maWdEYXRhO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogSUNvbmZpZyA9IHt9KSB7XG4gICAgdGhpcy5tZXJnZShjb25maWcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBjb25maWcgdG8gZ2xvYmFsIGNvbmZpZyByZWZlcmVuY2VcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSAge0FueX0gdmFsdWVcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHNldChuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLmNvbmZpZ1tuYW1lXSA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIGNvbmZpZ1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVcbiAgICogQHJldHVybiB7YW55fVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgZ2V0KG5hbWU6IHN0cmluZyk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnW25hbWVdO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGNvbmZpZyBwcm9wZXJ0eVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVcbiAgICogQHJldHVybiB7YW55fVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgaGFzKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5jb25maWcsIG5hbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1lcmdlIHR3byBjb25maWcgb2JqZWN0XG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgbWVyZ2UoY29uZmlnOiB7IFtzdHJpbmddOiBhbnkgfSk6IHZvaWQge1xuICAgIHRoaXMuY29uZmlnID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5jb25maWcsIGNvbmZpZyk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGEgY29uZmlnXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgcmVtb3ZlKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBkZWxldGUgdGhpcy5jb25maWdbbmFtZV07XG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBjb25maWdcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm4ge0lDb25maWdbXX1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFsbCgpOiBJQ29uZmlnIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc7XG4gIH1cbn1cbiIsIi8vIEBmbG93XG5pbXBvcnQgb2JqIGZyb20gJ29iamVjdC1wYXRoJztcbmltcG9ydCBsb2dFdmVudHMgZnJvbSAnLi9lbnVtL2xvZy5ldmVudHMnO1xuXG4vKiBlc2xpbnQgbm8tY29uc29sZTogW1wiZXJyb3JcIiwgeyBhbGxvdzogW1wibG9nXCIsIFwiZ3JvdXBDb2xsYXBzZWRcIiwgXCJncm91cEVuZFwiXSB9XSAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbG9nKC4uLmFyZ3M6IGFueSkge1xuICBjb25zb2xlLmxvZyguLi5hcmdzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRhc2tBZGRlZExvZyhbdGFza106IGFueVtdKSB7XG4gIGxvZyhcbiAgICBgJWMke1N0cmluZy5mcm9tQ2hhckNvZGUoNDMpfSAoJHt0YXNrLmhhbmRsZXJ9KSAtPiAke29iai5nZXQobG9nRXZlbnRzLCAncXVldWUuY3JlYXRlZCcpfWAsXG4gICAgJ2NvbG9yOiBncmVlbjtmb250LXdlaWdodDogYm9sZDsnLFxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcXVldWVTdGFydExvZyhbdHlwZV06IGFueVtdKSB7XG4gIGxvZyhcbiAgICBgJWMke1N0cmluZy5mcm9tQ2hhckNvZGUoODIxMSl9ICgke3R5cGV9KSAtPiAke29iai5nZXQobG9nRXZlbnRzLCAncXVldWUuc3RhcnRpbmcnKX1gLFxuICAgICdjb2xvcjogIzNmYTVmMztmb250LXdlaWdodDogYm9sZDsnLFxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbmV4dFRhc2tMb2coW3R5cGVdOiBhbnlbXSkge1xuICBsb2coXG4gICAgYCVjJHtTdHJpbmcuZnJvbUNoYXJDb2RlKDE4Nyl9ICgke3R5cGV9KSAtPiAke29iai5nZXQobG9nRXZlbnRzLCAncXVldWUubmV4dCcpfWAsXG4gICAgJ2NvbG9yOiAjM2ZhNWYzO2ZvbnQtd2VpZ2h0OiBib2xkOycsXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBxdWV1ZVN0b3BwaW5nTG9nKFt0eXBlXTogYW55W10pIHtcbiAgbG9nKFxuICAgIGAlYyR7U3RyaW5nLmZyb21DaGFyQ29kZSg4MjI2KX0gKCR7dHlwZX0pIC0+ICR7b2JqLmdldChsb2dFdmVudHMsICdxdWV1ZS5zdG9wcGluZycpfWAsXG4gICAgJ2NvbG9yOiAjZmY3Zjk0O2ZvbnQtd2VpZ2h0OiBib2xkOycsXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBxdWV1ZVN0b3BwZWRMb2coW3R5cGVdOiBhbnlbXSkge1xuICBsb2coXG4gICAgYCVjJHtTdHJpbmcuZnJvbUNoYXJDb2RlKDgyMjYpfSAoJHt0eXBlfSkgLT4gJHtvYmouZ2V0KGxvZ0V2ZW50cywgJ3F1ZXVlLnN0b3BwZWQnKX1gLFxuICAgICdjb2xvcjogI2ZmN2Y5NDtmb250LXdlaWdodDogYm9sZDsnLFxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcXVldWVFbXB0eUxvZyhbdHlwZV06IGFueVtdKSB7XG4gIGxvZyhgJWMke3R5cGV9ICR7b2JqLmdldChsb2dFdmVudHMsICdxdWV1ZS5lbXB0eScpfWAsICdjb2xvcjogI2ZmN2Y5NDtmb250LXdlaWdodDogYm9sZDsnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV2ZW50Q3JlYXRlZExvZyhba2V5XTogYW55W10pIHtcbiAgbG9nKGAlYygke2tleX0pIC0+ICR7b2JqLmdldChsb2dFdmVudHMsICdldmVudC5jcmVhdGVkJyl9YCwgJ2NvbG9yOiAjNjZjZWUzO2ZvbnQtd2VpZ2h0OiBib2xkOycpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXZlbnRGaXJlZExvZyhba2V5LCBuYW1lXTogYW55W10pIHtcbiAgbG9nKGAlYygke2tleX0pIC0+ICR7b2JqLmdldChsb2dFdmVudHMsIGBldmVudC4ke25hbWV9YCl9YCwgJ2NvbG9yOiAjYTBkYzNjO2ZvbnQtd2VpZ2h0OiBib2xkOycpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm90Rm91bmRMb2coW25hbWVdOiBhbnlbXSkge1xuICBsb2coXG4gICAgYCVjJHtTdHJpbmcuZnJvbUNoYXJDb2RlKDIxNSl9ICgke25hbWV9KSAtPiAke29iai5nZXQobG9nRXZlbnRzLCAncXVldWUubm90LWZvdW5kJyl9YCxcbiAgICAnY29sb3I6ICNiOTJlMmU7Zm9udC13ZWlnaHQ6IGJvbGQ7JyxcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdvcmtlclJ1bm5pbkxvZyhbXG4gIHdvcmtlcjogRnVuY3Rpb24sXG4gIHdvcmtlckluc3RhbmNlLFxuICB0YXNrLFxuICBjaGFubmVsOiBzdHJpbmcsXG4gIGRlcHM6IHsgW3N0cmluZ106IGFueVtdIH0sXG5dOiBhbnlbXSkge1xuICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkKGAke3dvcmtlci5uYW1lIHx8IHRhc2suaGFuZGxlcn0gLSAke3Rhc2subGFiZWx9YCk7XG4gIGxvZyhgJWNjaGFubmVsOiAke2NoYW5uZWx9YCwgJ2NvbG9yOiBibHVlOycpO1xuICBsb2coYCVjbGFiZWw6ICR7dGFzay5sYWJlbCB8fCAnJ31gLCAnY29sb3I6IGJsdWU7Jyk7XG4gIGxvZyhgJWNoYW5kbGVyOiAke3Rhc2suaGFuZGxlcn1gLCAnY29sb3I6IGJsdWU7Jyk7XG4gIGxvZyhgJWNwcmlvcml0eTogJHt0YXNrLnByaW9yaXR5fWAsICdjb2xvcjogYmx1ZTsnKTtcbiAgbG9nKGAlY3VuaXF1ZTogJHt0YXNrLnVuaXF1ZSB8fCAnZmFsc2UnfWAsICdjb2xvcjogYmx1ZTsnKTtcbiAgbG9nKGAlY3JldHJ5OiAke3dvcmtlckluc3RhbmNlLnJldHJ5IHx8ICcxJ31gLCAnY29sb3I6IGJsdWU7Jyk7XG4gIGxvZyhgJWN0cmllZDogJHt0YXNrLnRyaWVkID8gdGFzay50cmllZCArIDEgOiAnMSd9YCwgJ2NvbG9yOiBibHVlOycpO1xuICBsb2coYCVjdGFnOiAke3Rhc2sudGFnIHx8ICcnfWAsICdjb2xvcjogYmx1ZTsnKTtcbiAgbG9nKCclY2FyZ3M6JywgJ2NvbG9yOiBibHVlOycpO1xuICBsb2codGFzay5hcmdzIHx8ICcnKTtcbiAgY29uc29sZS5ncm91cENvbGxhcHNlZCgnZGVwZW5kZW5jaWVzJyk7XG4gIGxvZyguLi4oZGVwc1t3b3JrZXIubmFtZV0gfHwgW10pKTtcbiAgY29uc29sZS5ncm91cEVuZCgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd29ya2VyRG9uZUxvZyhbcmVzdWx0LCB0YXNrLCB3b3JrZXJJbnN0YW5jZV06IGFueVtdKSB7XG4gIGlmIChyZXN1bHQgPT09IHRydWUpIHtcbiAgICBsb2coYCVjJHtTdHJpbmcuZnJvbUNoYXJDb2RlKDEwMDAzKX0gVGFzayBjb21wbGV0ZWQhYCwgJ2NvbG9yOiBncmVlbjsnKTtcbiAgfSBlbHNlIGlmICghcmVzdWx0ICYmIHRhc2sudHJpZWQgPCB3b3JrZXJJbnN0YW5jZS5yZXRyeSkge1xuICAgIGxvZygnJWNUYXNrIHdpbGwgYmUgcmV0cmllZCEnLCAnY29sb3I6ICNkODQxMGM7Jyk7XG4gIH0gZWxzZSB7XG4gICAgbG9nKGAlYyR7U3RyaW5nLmZyb21DaGFyQ29kZSgxMDAwNSl9IFRhc2sgZmFpbGVkIGFuZCBmcmVlemVkIWAsICdjb2xvcjogI2VmNjM2MzsnKTtcbiAgfVxuICBjb25zb2xlLmdyb3VwRW5kKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3b3JrZXJGYWlsZWRMb2coKSB7XG4gIGxvZyhgJWMke1N0cmluZy5mcm9tQ2hhckNvZGUoMTAwMDUpfSBUYXNrIGZhaWxlZCFgLCAnY29sb3I6IHJlZDsnKTtcbiAgY29uc29sZS5ncm91cEVuZCgpO1xufVxuIiwiLyogQGZsb3cgKi9cbmltcG9ydCB0eXBlIElDb250YWluZXIgZnJvbSAnLi9pbnRlcmZhY2VzL2NvbnRhaW5lcic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbnRhaW5lciBpbXBsZW1lbnRzIElDb250YWluZXIge1xuICBzdG9yZTogeyBbcHJvcGVydHk6IHN0cmluZ106IGFueSB9ID0ge307XG5cbiAgLyoqXG4gICAqIENoZWNrIGl0ZW0gaW4gY29udGFpbmVyXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gaWRcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGhhcyhpZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLnN0b3JlLCBpZCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGl0ZW0gZnJvbSBjb250YWluZXJcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBpZFxuICAgKiBAcmV0dXJuIHtBbnl9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBnZXQoaWQ6IHN0cmluZyk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmVbaWRdO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgaXRlbXMgZnJvbSBjb250YWluZXJcbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYWxsKCkge1xuICAgIHJldHVybiB0aGlzLnN0b3JlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBpdGVtIHRvIGNvbnRhaW5lclxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGlkXG4gICAqIEBwYXJhbSAge0FueX0gdmFsdWVcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGJpbmQoaWQ6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmVbaWRdID0gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogTWVyZ2UgY29udGluZXJzXG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gZGF0YVxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgbWVyZ2UoZGF0YTogeyBbcHJvcGVydHk6IHN0cmluZ106IGFueSB9ID0ge30pOiB2b2lkIHtcbiAgICB0aGlzLnN0b3JlID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5zdG9yZSwgZGF0YSk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGl0ZW0gZnJvbSBjb250YWluZXJcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBpZFxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgcmVtb3ZlKGlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBpZiAoIXRoaXMuaGFzKGlkKSkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiBkZWxldGUgdGhpcy5zdG9yZVtpZF07XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFsbCBpdGVtcyBmcm9tIGNvbnRhaW5lclxuICAgKlxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgcmVtb3ZlQWxsKCk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmUgPSB7fTtcbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQge1xuICBkZWZhdWx0U3RvcmFnZTogJ2xvY2Fsc3RvcmFnZScsXG4gIHByZWZpeDogJ3NxX2pvYnMnLFxuICB0aW1lb3V0OiAxMDAwLFxuICBsaW1pdDogLTEsXG4gIHByaW5jaXBsZTogJ2ZpZm8nLFxuICBkZWJ1ZzogdHJ1ZSxcbn07XG4iLCJleHBvcnQgZGVmYXVsdCB7XG4gIHF1ZXVlOiB7XG4gICAgY3JlYXRlZDogJ05ldyB0YXNrIGNyZWF0ZWQuJyxcbiAgICBuZXh0OiAnTmV4dCB0YXNrIHByb2Nlc3NpbmcuJyxcbiAgICBzdGFydGluZzogJ1F1ZXVlIGxpc3RlbmVyIHN0YXJ0aW5nLicsXG4gICAgc3RvcHBpbmc6ICdRdWV1ZSBsaXN0ZW5lciBzdG9wcGluZy4nLFxuICAgIHN0b3BwZWQ6ICdRdWV1ZSBsaXN0ZW5lciBzdG9wcGVkLicsXG4gICAgZW1wdHk6ICdjaGFubmVsIGlzIGVtcHR5Li4uJyxcbiAgICAnbm90LWZvdW5kJzogJ3dvcmtlciBub3QgZm91bmQnLFxuICAgIG9mZmxpbmU6ICdEaXNjb25uZWN0ZWQnLFxuICAgIG9ubGluZTogJ0Nvbm5lY3RlZCcsXG4gIH0sXG4gIGV2ZW50OiB7XG4gICAgY3JlYXRlZDogJ05ldyBldmVudCBjcmVhdGVkJyxcbiAgICBmaXJlZDogJ0V2ZW50IGZpcmVkLicsXG4gICAgJ3dpbGRjYXJkLWZpcmVkJzogJ1dpbGRjYXJkIGV2ZW50IGZpcmVkLicsXG4gIH0sXG59O1xuIiwiLyogZXNsaW50IGNsYXNzLW1ldGhvZHMtdXNlLXRoaXM6IFtcImVycm9yXCIsIHsgXCJleGNlcHRNZXRob2RzXCI6IFtcImdldE5hbWVcIiwgXCJnZXRUeXBlXCJdIH1dICovXG4vKiBlc2xpbnQtZW52IGVzNiAqL1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFdmVudCB7XG4gIHN0b3JlOiB7IFtwcm9wOiBzdHJpbmddOiBhbnkgfSA9IHt9O1xuICB2ZXJpZmllclBhdHRlcm46IHN0cmluZyA9IC9eW2EtejAtOS1fXSs6YmVmb3JlJHxhZnRlciR8cmV0cnkkfFxcKiQvO1xuICB3aWxkY2FyZHM6IHN0cmluZ1tdID0gWycqJywgJ2Vycm9yJ107XG4gIGVtcHR5RnVuYzogRnVuY3Rpb24gPSAoKSA9PiB7fTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnN0b3JlLmJlZm9yZSA9IHt9O1xuICAgIHRoaXMuc3RvcmUuYWZ0ZXIgPSB7fTtcbiAgICB0aGlzLnN0b3JlLnJldHJ5ID0ge307XG4gICAgdGhpcy5zdG9yZS53aWxkY2FyZCA9IHt9O1xuICAgIHRoaXMuc3RvcmUuZXJyb3IgPSB0aGlzLmVtcHR5RnVuYztcbiAgICB0aGlzLnN0b3JlWycqJ10gPSB0aGlzLmVtcHR5RnVuYztcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgZXZlbnRcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHBhcmFtICB7RnVuY3Rpb259IGNiXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBvbihrZXk6IHN0cmluZywgY2I6IEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgaWYgKHR5cGVvZiBjYiAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgbmV3IEVycm9yKCdFdmVudCBzaG91bGQgYmUgYW4gZnVuY3Rpb24nKTtcbiAgICBpZiAodGhpcy5pc1ZhbGlkKGtleSkpIHRoaXMuYWRkKGtleSwgY2IpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biBldmVudCB2aWEgaXQncyBrZXlcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHBhcmFtICB7QW55fSBhcmdzXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBlbWl0KGtleTogc3RyaW5nLCBhcmdzOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAodGhpcy53aWxkY2FyZHMuaW5kZXhPZihrZXkpID4gLTEpIHtcbiAgICAgIHRoaXMud2lsZGNhcmQoa2V5LCAuLi5ba2V5LCBhcmdzXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHR5cGU6IHN0cmluZyA9IHRoaXMuZ2V0VHlwZShrZXkpO1xuICAgICAgY29uc3QgbmFtZTogc3RyaW5nID0gdGhpcy5nZXROYW1lKGtleSk7XG5cbiAgICAgIGlmICh0aGlzLnN0b3JlW3R5cGVdKSB7XG4gICAgICAgIGNvbnN0IGNiOiBGdW5jdGlvbiA9IHRoaXMuc3RvcmVbdHlwZV1bbmFtZV0gfHwgdGhpcy5lbXB0eUZ1bmM7XG4gICAgICAgIGNiLmNhbGwobnVsbCwgYXJncyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy53aWxkY2FyZCgnKicsIGtleSwgYXJncyk7XG4gIH1cblxuICAvKipcbiAgICogUnVuIHdpbGRjYXJkIGV2ZW50c1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGFjdGlvbktleVxuICAgKiBAcGFyYW0gIHtBbnl9IGFyZ3NcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHdpbGRjYXJkKGtleTogc3RyaW5nLCBhY3Rpb25LZXk6IHN0cmluZywgYXJnczogYW55KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc3RvcmUud2lsZGNhcmRba2V5XSkge1xuICAgICAgdGhpcy5zdG9yZS53aWxkY2FyZFtrZXldLmNhbGwobnVsbCwgYWN0aW9uS2V5LCBhcmdzKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkIGV2ZW50IHRvIHN0b3JlXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjYlxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYWRkKGtleTogc3RyaW5nLCBjYjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICBpZiAodGhpcy53aWxkY2FyZHMuaW5kZXhPZihrZXkpID4gLTEpIHtcbiAgICAgIHRoaXMuc3RvcmUud2lsZGNhcmRba2V5XSA9IGNiO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB0eXBlOiBzdHJpbmcgPSB0aGlzLmdldFR5cGUoa2V5KTtcbiAgICAgIGNvbnN0IG5hbWU6IHN0cmluZyA9IHRoaXMuZ2V0TmFtZShrZXkpO1xuICAgICAgdGhpcy5zdG9yZVt0eXBlXVtuYW1lXSA9IGNiO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBldmVudCBpbiBzdG9yZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgaGFzKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGtleXM6IHN0cmluZ1tdID0ga2V5LnNwbGl0KCc6Jyk7XG4gICAgICByZXR1cm4ga2V5cy5sZW5ndGggPiAxID8gISF0aGlzLnN0b3JlW2tleXNbMV1dW2tleXNbMF1dIDogISF0aGlzLnN0b3JlLndpbGRjYXJkW2tleXNbMF1dO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IGV2ZW50IG5hbWUgYnkgcGFyc2Uga2V5XG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGdldE5hbWUoa2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBrZXkubWF0Y2goLyguKik6LiovKVsxXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZXZlbnQgdHlwZSBieSBwYXJzZSBrZXlcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgZ2V0VHlwZShrZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGtleS5tYXRjaCgvXlthLXowLTktX10rOiguKikvKVsxXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja2VyIG9mIGV2ZW50IGtleXNcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGlzVmFsaWQoa2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy52ZXJpZmllclBhdHRlcm4udGVzdChrZXkpIHx8IHRoaXMud2lsZGNhcmRzLmluZGV4T2Yoa2V5KSA+IC0xO1xuICB9XG59XG4iLCIvKiBAZmxvdyAqL1xuaW1wb3J0IHR5cGUgSVRhc2sgZnJvbSAnLi9pbnRlcmZhY2VzL3Rhc2snO1xuaW1wb3J0IHR5cGUgSVdvcmtlciBmcm9tICcuL2ludGVyZmFjZXMvd29ya2VyJztcbmltcG9ydCBRdWV1ZSBmcm9tICcuL3F1ZXVlJztcbmltcG9ydCBDaGFubmVsIGZyb20gJy4vY2hhbm5lbCc7XG5pbXBvcnQgU3RvcmFnZUNhcHN1bGUgZnJvbSAnLi9zdG9yYWdlLWNhcHN1bGUnO1xuaW1wb3J0IHsgZXhjbHVkZVNwZWNpZmljVGFza3MsIGhhc01ldGhvZCwgaXNGdW5jdGlvbiB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtcbiAgZXZlbnRGaXJlZExvZyxcbiAgcXVldWVTdG9wcGVkTG9nLFxuICB3b3JrZXJSdW5uaW5Mb2csXG4gIHF1ZXVlRW1wdHlMb2csXG4gIG5vdEZvdW5kTG9nLFxuICB3b3JrZXJEb25lTG9nLFxuICB3b3JrZXJGYWlsZWRMb2csXG59IGZyb20gJy4vY29uc29sZSc7XG5cbi8qIGdsb2JhbCBXb3JrZXIgKi9cbi8qIGVzbGludCBuby11bmRlcnNjb3JlLWRhbmdsZTogWzIsIHsgXCJhbGxvd1wiOiBbXCJfaWRcIl0gfV0gKi9cbi8qIGVzbGludCBuby1wYXJhbS1yZWFzc2lnbjogXCJlcnJvclwiICovXG4vKiBlc2xpbnQgdXNlLWlzbmFuOiBcImVycm9yXCIgKi9cblxuLyoqXG4gKiBUYXNrIHByaW9yaXR5IGNvbnRyb2xsZXIgaGVscGVyXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHJldHVybiB7SVRhc2t9XG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVja1ByaW9yaXR5KHRhc2s6IElUYXNrKTogSVRhc2sge1xuICB0YXNrLnByaW9yaXR5ID0gdGFzay5wcmlvcml0eSB8fCAwO1xuXG4gIGlmICh0eXBlb2YgdGFzay5wcmlvcml0eSAhPT0gJ251bWJlcicpIHRhc2sucHJpb3JpdHkgPSAwO1xuXG4gIHJldHVybiB0YXNrO1xufVxuXG4vKipcbiAqIFNob3J0ZW5zIGZ1bmN0aW9uIHRoZSBkYiBiZWxvbmdzdG8gY3VycmVudCBjaGFubmVsXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHJldHVybiB7U3RvcmFnZUNhcHN1bGV9XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkYigpOiBTdG9yYWdlQ2Fwc3VsZSB7XG4gIHJldHVybiAodGhpczogYW55KS5zdG9yYWdlLmNoYW5uZWwoKHRoaXM6IGFueSkubmFtZSgpKTtcbn1cblxuLyoqXG4gKiBHZXQgdW5mcmVlemVkIHRhc2tzIGJ5IHRoZSBmaWx0ZXIgZnVuY3Rpb25cbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcmV0dXJuIHtJVGFza31cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFRhc2tzV2l0aG91dEZyZWV6ZWQoKTogUHJvbWlzZTxJVGFza1tdPiB7XG4gIHJldHVybiAoYXdhaXQgZGIuY2FsbCh0aGlzKS5hbGwoKSkuZmlsdGVyKGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzLmJpbmQoWydmcmVlemVkJ10pKTtcbn1cblxuLyoqXG4gKiBMb2cgcHJveHkgaGVscGVyXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHJldHVybiB7dm9pZH1cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7c3RyaW5nfSBkYXRhXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGNvbmRcbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvZ1Byb3h5KHdyYXBwZXJGdW5jOiBGdW5jdGlvbiwgLi4uYXJnczogYW55KTogdm9pZCB7XG4gIGlmICgodGhpczogYW55KS5jb25maWcuZ2V0KCdkZWJ1ZycpICYmIHR5cGVvZiB3cmFwcGVyRnVuYyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHdyYXBwZXJGdW5jKGFyZ3MpO1xuICB9XG59XG5cbi8qKlxuICogTmV3IHRhc2sgc2F2ZSBoZWxwZXJcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcmV0dXJuIHtzdHJpbmd8Ym9vbGVhbn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVUYXNrKHRhc2s6IElUYXNrKTogUHJvbWlzZTxzdHJpbmcgfCBib29sZWFuPiB7XG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRiLmNhbGwodGhpcykuc2F2ZShjaGVja1ByaW9yaXR5KHRhc2spKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBUYXNrIHJlbW92ZSBoZWxwZXJcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gaWRcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZW1vdmVUYXNrKGlkOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZGIuY2FsbCh0aGlzKS5kZWxldGUoaWQpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEV2ZW50cyBkaXNwYXRjaGVyIGhlbHBlclxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gKiBAcmV0dXJuIHt2b2lkfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzcGF0Y2hFdmVudHModGFzazogSVRhc2ssIHR5cGU6IHN0cmluZyk6IGJvb2xlYW4gfCB2b2lkIHtcbiAgaWYgKCEoJ3RhZycgaW4gdGFzaykpIHJldHVybiBmYWxzZTtcblxuICBjb25zdCBldmVudHMgPSBbW2Ake3Rhc2sudGFnfToke3R5cGV9YCwgJ2ZpcmVkJ10sIFtgJHt0YXNrLnRhZ306KmAsICd3aWxkY2FyZC1maXJlZCddXTtcblxuICBldmVudHMuZm9yRWFjaCgoZSkgPT4ge1xuICAgIHRoaXMuZXZlbnQuZW1pdChlWzBdLCB0YXNrKTtcbiAgICBsb2dQcm94eS5jYWxsKCh0aGlzOiBhbnkpLCBldmVudEZpcmVkTG9nLCAuLi5lKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogUXVldWUgc3RvcHBlciBoZWxwZXJcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcmV0dXJuIHt2b2lkfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RvcFF1ZXVlKCk6IHZvaWQge1xuICB0aGlzLnN0b3AoKTtcblxuICBjbGVhclRpbWVvdXQodGhpcy5jdXJyZW50VGltZW91dCk7XG5cbiAgbG9nUHJveHkuY2FsbCh0aGlzLCBxdWV1ZVN0b3BwZWRMb2csICdzdG9wJyk7XG59XG5cbi8qKlxuICogRmFpbGVkIGpvYiBoYW5kbGVyXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHJldHVybiB7SVRhc2t9IGpvYlxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmYWlsZWRKb2JIYW5kbGVyKHRhc2s6IElUYXNrKTogUHJvbWlzZTxGdW5jdGlvbj4ge1xuICByZXR1cm4gYXN5bmMgZnVuY3Rpb24gY2hpbGRGYWlsZWRIYW5kbGVyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJlbW92ZVRhc2suY2FsbCh0aGlzLCB0YXNrLl9pZCk7XG5cbiAgICB0aGlzLmV2ZW50LmVtaXQoJ2Vycm9yJywgdGFzayk7XG5cbiAgICBsb2dQcm94eS5jYWxsKHRoaXMsIHdvcmtlckZhaWxlZExvZyk7XG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGF3YWl0IHRoaXMubmV4dCgpO1xuICB9O1xufVxuXG4vKipcbiAqIEhlbHBlciBvZiB0aGUgbG9jayB0YXNrIG9mIHRoZSBjdXJyZW50IGpvYlxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2NrVGFzayh0YXNrOiBJVGFzayk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICBjb25zdCByZXN1bHQgPSBhd2FpdCBkYi5jYWxsKHRoaXMpLnVwZGF0ZSh0YXNrLl9pZCwgeyBsb2NrZWQ6IHRydWUgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogQ2xhc3MgZXZlbnQgbHVhbmNoZXIgaGVscGVyXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7SVdvcmtlcn0gd29ya2VyXG4gKiBAcGFyYW0ge2FueX0gYXJnc1xuICogQHJldHVybiB7Ym9vbGVhbnx2b2lkfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZmlyZUpvYklubGluZUV2ZW50KG5hbWU6IHN0cmluZywgd29ya2VyOiBJV29ya2VyLCBhcmdzOiBhbnkpOiBib29sZWFuIHtcbiAgaWYgKGhhc01ldGhvZCh3b3JrZXIsIG5hbWUpICYmIGlzRnVuY3Rpb24od29ya2VyW25hbWVdKSkge1xuICAgIHdvcmtlcltuYW1lXS5jYWxsKHdvcmtlciwgYXJncyk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIFByb2Nlc3MgaGFuZGxlciBvZiBzdWNjZWVkZWQgam9iXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHJldHVybiB7dm9pZH1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1Y2Nlc3NQcm9jZXNzKHRhc2s6IElUYXNrKTogdm9pZCB7XG4gIHJlbW92ZVRhc2suY2FsbCh0aGlzLCB0YXNrLl9pZCk7XG59XG5cbi8qKlxuICogVXBkYXRlIHRhc2sncyByZXRyeSB2YWx1ZVxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqIEBwYXJhbSB7SVdvcmtlcn0gd29ya2VyXG4gKiBAcmV0dXJuIHtJVGFza31cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVJldHJ5KHRhc2s6IElUYXNrLCB3b3JrZXI6IElXb3JrZXIpOiBJVGFzayB7XG4gIGlmICghKCdyZXRyeScgaW4gd29ya2VyKSkgd29ya2VyLnJldHJ5ID0gMTtcblxuICBpZiAoISgndHJpZWQnIGluIHRhc2spKSB7XG4gICAgdGFzay50cmllZCA9IDA7XG4gICAgdGFzay5yZXRyeSA9IHdvcmtlci5yZXRyeTtcbiAgfVxuXG4gIHRhc2sudHJpZWQgKz0gMTtcblxuICBpZiAodGFzay50cmllZCA+PSB3b3JrZXIucmV0cnkpIHtcbiAgICB0YXNrLmZyZWV6ZWQgPSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIHRhc2s7XG59XG5cbi8qKlxuICogUHJvY2VzcyBoYW5kbGVyIG9mIHJldHJpZWQgam9iXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHBhcmFtIHtJV29ya2VyfSB3b3JrZXJcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZXRyeVByb2Nlc3ModGFzazogSVRhc2ssIHdvcmtlcjogSVdvcmtlcik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAvLyBkaXNwYWN0aCBjdXN0b20gcmV0cnkgZXZlbnRcbiAgZGlzcGF0Y2hFdmVudHMuY2FsbCh0aGlzLCB0YXNrLCAncmV0cnknKTtcblxuICAvLyB1cGRhdGUgcmV0cnkgdmFsdWVcbiAgY29uc3QgdXBkYXRlVGFzazogSVRhc2sgPSB1cGRhdGVSZXRyeS5jYWxsKHRoaXMsIHRhc2ssIHdvcmtlcik7XG5cbiAgLy8gZGVsZXRlIGxvY2sgcHJvcGVydHkgZm9yIG5leHQgcHJvY2Vzc1xuICB1cGRhdGVUYXNrLmxvY2tlZCA9IGZhbHNlO1xuXG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRiLmNhbGwodGhpcykudXBkYXRlKHRhc2suX2lkLCB1cGRhdGVUYXNrKTtcblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFN1Y2NlZWQgam9iIGhhbmRsZXJcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcGFyYW0ge0lXb3JrZXJ9IHdvcmtlclxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdWNjZXNzSm9iSGFuZGxlcih0YXNrOiBJVGFzaywgd29ya2VyOiBJV29ya2VyKTogUHJvbWlzZTxGdW5jdGlvbj4ge1xuICBjb25zdCBzZWxmOiBDaGFubmVsID0gdGhpcztcbiAgcmV0dXJuIGFzeW5jIGZ1bmN0aW9uIGNoaWxkU3VjY2Vzc0pvYkhhbmRsZXIocmVzdWx0OiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gZGlzcGF0Y2ggam9iIHByb2Nlc3MgYWZ0ZXIgcnVucyBhIHRhc2sgYnV0IG9ubHkgbm9uIGVycm9yIGpvYnNcbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICAvLyBnbyBhaGVhZCB0byBzdWNjZXNzIHByb2Nlc3NcbiAgICAgIHN1Y2Nlc3NQcm9jZXNzLmNhbGwoc2VsZiwgdGFzayk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGdvIGFoZWFkIHRvIHJldHJ5IHByb2Nlc3NcbiAgICAgIGF3YWl0IHJldHJ5UHJvY2Vzcy5jYWxsKHNlbGYsIHRhc2ssIHdvcmtlcik7XG4gICAgfVxuXG4gICAgLy8gZmlyZSBqb2IgYWZ0ZXIgZXZlbnRcbiAgICBmaXJlSm9iSW5saW5lRXZlbnQuY2FsbChzZWxmLCAnYWZ0ZXInLCB3b3JrZXIsIHRhc2suYXJncyk7XG5cbiAgICAvLyBkaXNwYWN0aCBjdXN0b20gYWZ0ZXIgZXZlbnRcbiAgICBkaXNwYXRjaEV2ZW50cy5jYWxsKHNlbGYsIHRhc2ssICdhZnRlcicpO1xuXG4gICAgLy8gc2hvdyBjb25zb2xlXG4gICAgbG9nUHJveHkuY2FsbChzZWxmLCB3b3JrZXJEb25lTG9nLCByZXN1bHQsIHRhc2ssIHdvcmtlcik7XG5cbiAgICAvLyB0cnkgbmV4dCBxdWV1ZSBqb2JcbiAgICBhd2FpdCBzZWxmLm5leHQoKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBKb2IgaGFuZGxlciBoZWxwZXJcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcGFyYW0ge0lKb2J9IHdvcmtlclxuICogQHBhcmFtIHtJV29ya2VyfSB3b3JrZXJJbnN0YW5jZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqLyBmdW5jdGlvbiBsb29wSGFuZGxlcihcbiAgdGFzazogSVRhc2ssXG4gIHdvcmtlcjogRnVuY3Rpb24gfCBPYmplY3QsXG4gIHdvcmtlckluc3RhbmNlOiBJV29ya2VyLFxuKTogRnVuY3Rpb24ge1xuICByZXR1cm4gYXN5bmMgZnVuY3Rpb24gY2hpbGRMb29wSGFuZGxlcigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgd29ya2VyUHJvbWlzZTogUHJvbWlzZTxib29sZWFuPjtcbiAgICBjb25zdCBzZWxmOiBDaGFubmVsID0gdGhpcztcblxuICAgIC8vIGxvY2sgdGhlIGN1cnJlbnQgdGFzayBmb3IgcHJldmVudCByYWNlIGNvbmRpdGlvblxuICAgIGF3YWl0IGxvY2tUYXNrLmNhbGwoc2VsZiwgdGFzayk7XG5cbiAgICAvLyBmaXJlIGpvYiBiZWZvcmUgZXZlbnRcbiAgICBmaXJlSm9iSW5saW5lRXZlbnQuY2FsbCh0aGlzLCAnYmVmb3JlJywgd29ya2VySW5zdGFuY2UsIHRhc2suYXJncyk7XG5cbiAgICAvLyBkaXNwYWN0aCBjdXN0b20gYmVmb3JlIGV2ZW50XG4gICAgZGlzcGF0Y2hFdmVudHMuY2FsbCh0aGlzLCB0YXNrLCAnYmVmb3JlJyk7XG5cbiAgICAvLyBpZiBoYXMgYW55IGRlcGVuZGVuY3kgaW4gZGVwZW5kZW5jaWVzLCBnZXQgaXRcbiAgICBjb25zdCBkZXBzID0gUXVldWUud29ya2VyRGVwc1t0YXNrLmhhbmRsZXJdO1xuXG4gICAgLy8gcHJlcGFyaW5nIHdvcmtlciBkZXBlbmRlbmNpZXNcbiAgICBjb25zdCBkZXBlbmRlbmNpZXMgPSBPYmplY3QudmFsdWVzKGRlcHMgfHwge30pO1xuXG4gICAgLy8gc2hvdyBjb25zb2xlXG4gICAgbG9nUHJveHkuY2FsbChcbiAgICAgIHRoaXMsXG4gICAgICB3b3JrZXJSdW5uaW5Mb2csXG4gICAgICB3b3JrZXIsXG4gICAgICB3b3JrZXJJbnN0YW5jZSxcbiAgICAgIHRhc2ssXG4gICAgICBzZWxmLm5hbWUoKSxcbiAgICAgIFF1ZXVlLndvcmtlckRlcHMsXG4gICAgKTtcblxuICAgIC8vIENoZWNrIHdvcmtlciBpbnN0YW5jZSBhbmQgcm91dGUgdGhlIHByb2Nlc3MgdmlhIGluc3RhbmNlXG4gICAgaWYgKHdvcmtlckluc3RhbmNlIGluc3RhbmNlb2YgV29ya2VyKSB7XG4gICAgICAvLyBzdGFydCB0aGUgbmF0aXZlIHdvcmtlciBieSBwYXNzaW5nIHRhc2sgcGFyYW1ldGVycyBhbmQgZGVwZW5kZW5jaWVzLlxuICAgICAgLy8gTm90ZTogTmF0aXZlIHdvcmtlciBwYXJhbWV0ZXJzIGNhbiBub3QgYmUgY2xhc3Mgb3IgZnVuY3Rpb24uXG4gICAgICB3b3JrZXJJbnN0YW5jZS5wb3N0TWVzc2FnZSh7IGFyZ3M6IHRhc2suYXJncywgZGVwZW5kZW5jaWVzIH0pO1xuXG4gICAgICAvLyBXcmFwIHRoZSB3b3JrZXIgd2l0aCBwcm9taXNlIGNsYXNzLlxuICAgICAgd29ya2VyUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIC8vIFNldCBmdW5jdGlvbiB0byB3b3JrZXIgb25tZXNzYWdlIGV2ZW50IGZvciBoYW5kbGUgdGhlIHJlcHNvbnNlIG9mIHdvcmtlci5cbiAgICAgICAgd29ya2VySW5zdGFuY2Uub25tZXNzYWdlID0gKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgcmVzb2x2ZSh3b3JrZXIuaGFuZGxlcihyZXNwb25zZSkpO1xuXG4gICAgICAgICAgLy8gVGVybWluYXRlIGJyb3dzZXIgd29ya2VyLlxuICAgICAgICAgIHdvcmtlckluc3RhbmNlLnRlcm1pbmF0ZSgpO1xuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRoaXMgaXMgY3VzdG9tIHdvcmtlciBjbGFzcy5cbiAgICAgIC8vIENhbGwgdGhlIGhhbmRsZSBmdW5jdGlvbiBpbiB3b3JrZXIgYW5kIGdldCBwcm9taXNlIGluc3RhbmNlLlxuICAgICAgd29ya2VyUHJvbWlzZSA9IHdvcmtlckluc3RhbmNlLmhhbmRsZS5jYWxsKHdvcmtlckluc3RhbmNlLCB0YXNrLmFyZ3MsIC4uLmRlcGVuZGVuY2llcyk7XG4gICAgfVxuXG4gICAgd29ya2VyUHJvbWlzZVxuICAgICAgLy8gSGFuZGxlIHdvcmtlciByZXR1cm4gcHJvY2Vzcy5cbiAgICAgIC50aGVuKChhd2FpdCBzdWNjZXNzSm9iSGFuZGxlci5jYWxsKHNlbGYsIHRhc2ssIHdvcmtlckluc3RhbmNlKSkuYmluZChzZWxmKSlcbiAgICAgIC8vIEhhbmRsZSBlcnJvcnMgaW4gd29ya2VyIHdoaWxlIGl0IHdhcyBydW5uaW5nLlxuICAgICAgLmNhdGNoKChhd2FpdCBmYWlsZWRKb2JIYW5kbGVyLmNhbGwoc2VsZiwgdGFzaykpLmJpbmQoc2VsZikpO1xuICB9O1xufVxuXG4vKipcbiAqIFRpbWVvdXQgY3JlYXRvciBoZWxwZXJcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGVUaW1lb3V0KCk6IFByb21pc2U8bnVtYmVyPiB7XG4gIC8vIGlmIHJ1bm5pbmcgYW55IGpvYiwgc3RvcCBpdFxuICAvLyB0aGUgcHVycG9zZSBoZXJlIGlzIHRvIHByZXZlbnQgY29jdXJyZW50IG9wZXJhdGlvbiBpbiBzYW1lIGNoYW5uZWxcbiAgY2xlYXJUaW1lb3V0KHRoaXMuY3VycmVudFRpbWVvdXQpO1xuXG4gIC8vIEdldCBuZXh0IHRhc2tcbiAgY29uc3QgdGFzazogSVRhc2sgPSAoYXdhaXQgZGIuY2FsbCh0aGlzKS5mZXRjaCgpKS5zaGlmdCgpO1xuXG4gIGlmICh0YXNrID09PSB1bmRlZmluZWQpIHtcbiAgICBsb2dQcm94eS5jYWxsKHRoaXMsIHF1ZXVlRW1wdHlMb2csIHRoaXMubmFtZSgpKTtcbiAgICBzdG9wUXVldWUuY2FsbCh0aGlzKTtcbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIGlmICghUXVldWUud29ya2VyLmhhcyh0YXNrLmhhbmRsZXIpKSB7XG4gICAgbG9nUHJveHkuY2FsbCh0aGlzLCBub3RGb3VuZExvZywgdGFzay5oYW5kbGVyKTtcbiAgICBhd2FpdCAoYXdhaXQgZmFpbGVkSm9iSGFuZGxlci5jYWxsKHRoaXMsIHRhc2spKS5jYWxsKHRoaXMpO1xuICAgIHJldHVybiAxO1xuICB9XG5cbiAgLy8gR2V0IHdvcmtlciB3aXRoIGhhbmRsZXIgbmFtZVxuICBjb25zdCBKb2JXb3JrZXI6IEZ1bmN0aW9uIHwgT2JqZWN0ID0gUXVldWUud29ya2VyLmdldCh0YXNrLmhhbmRsZXIpO1xuXG4gIC8vIENyZWF0ZSBhIHdvcmtlciBpbnN0YW5jZVxuICBjb25zdCB3b3JrZXJJbnN0YW5jZTogSVdvcmtlciB8IFdvcmtlciA9XG4gICAgdHlwZW9mIEpvYldvcmtlciA9PT0gJ29iamVjdCcgPyBuZXcgV29ya2VyKEpvYldvcmtlci51cmkpIDogbmV3IEpvYldvcmtlcigpO1xuXG4gIC8vIGdldCBhbHdheXMgbGFzdCB1cGRhdGVkIGNvbmZpZyB2YWx1ZVxuICBjb25zdCB0aW1lb3V0OiBudW1iZXIgPSB0aGlzLmNvbmZpZy5nZXQoJ3RpbWVvdXQnKTtcblxuICAvLyBjcmVhdGUgYSBhcnJheSB3aXRoIGhhbmRsZXIgcGFyYW1ldGVycyBmb3Igc2hvcnRlbiBsaW5lIG51bWJlcnNcbiAgY29uc3QgcGFyYW1zID0gW3Rhc2ssIEpvYldvcmtlciwgd29ya2VySW5zdGFuY2VdO1xuXG4gIC8vIEdldCBoYW5kbGVyIGZ1bmN0aW9uIGZvciBoYW5kbGUgb24gY29tcGxldGVkIGV2ZW50XG4gIGNvbnN0IGhhbmRsZXI6IEZ1bmN0aW9uID0gKGF3YWl0IGxvb3BIYW5kbGVyLmNhbGwodGhpcywgLi4ucGFyYW1zKSkuYmluZCh0aGlzKTtcblxuICAvLyBjcmVhdGUgbmV3IHRpbWVvdXQgZm9yIHByb2Nlc3MgYSBqb2IgaW4gcXVldWVcbiAgLy8gYmluZGluZyBsb29wSGFuZGxlciBmdW5jdGlvbiB0byBzZXRUaW1lb3V0XG4gIC8vIHRoZW4gcmV0dXJuIHRoZSB0aW1lb3V0IGluc3RhbmNlXG4gIHRoaXMuY3VycmVudFRpbWVvdXQgPSBzZXRUaW1lb3V0KGhhbmRsZXIsIHRpbWVvdXQpO1xuXG4gIHJldHVybiB0aGlzLmN1cnJlbnRUaW1lb3V0O1xufVxuXG4vKipcbiAqIFNldCB0aGUgc3RhdHVzIHRvIGZhbHNlIG9mIHF1ZXVlXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHJldHVybiB7dm9pZH1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXR1c09mZigpOiB2b2lkIHtcbiAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgYSB0YXNrIGlzIHJlcGxpY2FibGUgb3Igbm90XG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNhbk11bHRpcGxlKHRhc2s6IElUYXNrKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGlmICh0eXBlb2YgdGFzayAhPT0gJ29iamVjdCcgfHwgdGFzay51bmlxdWUgIT09IHRydWUpIHJldHVybiB0cnVlO1xuICByZXR1cm4gKGF3YWl0IHRoaXMuaGFzQnlUYWcodGFzay50YWcpKSA9PT0gZmFsc2U7XG59XG4iLCJpbXBvcnQgJ3BzZXVkby13b3JrZXIvcG9seWZpbGwnO1xuaW1wb3J0IFF1ZXVlIGZyb20gJy4vcXVldWUnO1xuXG4vKiBnbG9iYWwgd2luZG93OnRydWUgKi9cblxuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gIHdpbmRvdy5RdWV1ZSA9IFF1ZXVlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBRdWV1ZTtcbiIsIi8qIEBmbG93ICovXG5pbXBvcnQgdHlwZSBJQ29uZmlnIGZyb20gJy4vaW50ZXJmYWNlcy9jb25maWcnO1xuaW1wb3J0IENoYW5uZWwgZnJvbSAnLi9jaGFubmVsJztcbmltcG9ydCBDb250YWluZXIgZnJvbSAnLi9jb250YWluZXInO1xuaW1wb3J0IENvbmZpZyBmcm9tICcuL2NvbmZpZyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFF1ZXVlKGNvbmZpZzogSUNvbmZpZykge1xuICB0aGlzLmNvbmZpZyA9IG5ldyBDb25maWcoY29uZmlnKTtcbn1cblxuUXVldWUuRklGTyA9ICdmaWZvJztcblF1ZXVlLkxJRk8gPSAnbGlmbyc7XG5RdWV1ZS5kcml2ZXJzID0ge307XG5RdWV1ZS53b3JrZXJEZXBzID0ge307XG5RdWV1ZS53b3JrZXIgPSBuZXcgQ29udGFpbmVyKCk7XG5RdWV1ZS5wcm90b3R5cGUuY29udGFpbmVyID0gbmV3IENvbnRhaW5lcigpO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBjaGFubmVsXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSB0YXNrXG4gKiBAcmV0dXJuIHtRdWV1ZX0gY2hhbm5lbFxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblF1ZXVlLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoY2hhbm5lbDogc3RyaW5nKTogUXVldWUge1xuICBpZiAoIXRoaXMuY29udGFpbmVyLmhhcyhjaGFubmVsKSkge1xuICAgIHRoaXMuY29udGFpbmVyLmJpbmQoY2hhbm5lbCwgbmV3IENoYW5uZWwoY2hhbm5lbCwgdGhpcy5jb25maWcpKTtcbiAgfVxuICByZXR1cm4gdGhpcy5jb250YWluZXIuZ2V0KGNoYW5uZWwpO1xufTtcblxuLyoqXG4gKiBHZXQgY2hhbm5lbCBpbnN0YW5jZSBieSBjaGFubmVsIG5hbWVcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge1F1ZXVlfVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblF1ZXVlLnByb3RvdHlwZS5jaGFubmVsID0gZnVuY3Rpb24gY2hhbm5lbChuYW1lOiBzdHJpbmcpOiBRdWV1ZSB7XG4gIGlmICghdGhpcy5jb250YWluZXIuaGFzKG5hbWUpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBcIiR7bmFtZX1cIiBjaGFubmVsIG5vdCBmb3VuZGApO1xuICB9XG4gIHJldHVybiB0aGlzLmNvbnRhaW5lci5nZXQobmFtZSk7XG59O1xuXG4vKipcbiAqIFNldCBjb25maWcgdGltZW91dCB2YWx1ZVxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gdmFsXG4gKiBAcmV0dXJuIHtWb2lkfVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblF1ZXVlLnByb3RvdHlwZS5zZXRUaW1lb3V0ID0gZnVuY3Rpb24gc2V0VGltZW91dCh2YWw6IG51bWJlcik6IHZvaWQge1xuICB0aGlzLmNvbmZpZy5zZXQoJ3RpbWVvdXQnLCB2YWwpO1xufTtcblxuLyoqXG4gKiBTZXQgY29uZmlnIGxpbWl0IHZhbHVlXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSB2YWxcbiAqIEByZXR1cm4ge1ZvaWR9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUXVldWUucHJvdG90eXBlLnNldExpbWl0ID0gZnVuY3Rpb24gc2V0TGltaXQodmFsOiBudW1iZXIpOiB2b2lkIHtcbiAgdGhpcy5jb25maWcuc2V0KCdsaW1pdCcsIHZhbCk7XG59O1xuXG4vKipcbiAqIFNldCBjb25maWcgcHJlZml4IHZhbHVlXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1ZvaWR9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUXVldWUucHJvdG90eXBlLnNldFByZWZpeCA9IGZ1bmN0aW9uIHNldFByZWZpeCh2YWw6IHN0cmluZyk6IHZvaWQge1xuICB0aGlzLmNvbmZpZy5zZXQoJ3ByZWZpeCcsIHZhbCk7XG59O1xuXG4vKipcbiAqIFNldCBjb25maWcgcHJpY2lwbGUgdmFsdWVcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHZhbFxuICogQHJldHVybiB7Vm9pZH1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5RdWV1ZS5wcm90b3R5cGUuc2V0UHJpbmNpcGxlID0gZnVuY3Rpb24gc2V0UHJpbmNpcGxlKHZhbDogc3RyaW5nKTogdm9pZCB7XG4gIHRoaXMuY29uZmlnLnNldCgncHJpbmNpcGxlJywgdmFsKTtcbn07XG5cbi8qKlxuICogU2V0IGNvbmZpZyBkZWJ1ZyB2YWx1ZVxuICpcbiAqIEBwYXJhbSAge0Jvb2xlYW59IHZhbFxuICogQHJldHVybiB7Vm9pZH1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5RdWV1ZS5wcm90b3R5cGUuc2V0RGVidWcgPSBmdW5jdGlvbiBzZXREZWJ1Zyh2YWw6IGJvb2xlYW4pOiB2b2lkIHtcbiAgdGhpcy5jb25maWcuc2V0KCdkZWJ1ZycsIHZhbCk7XG59O1xuXG5RdWV1ZS5wcm90b3R5cGUuc2V0U3RvcmFnZSA9IGZ1bmN0aW9uIHNldFN0b3JhZ2UodmFsOiBzdHJpbmcpOiB2b2lkIHtcbiAgdGhpcy5jb25maWcuc2V0KCdzdG9yYWdlJywgdmFsKTtcbn07XG5cbi8qKlxuICogUmVnaXN0ZXIgd29ya2VyXG4gKlxuICogQHBhcmFtICB7QXJyYXk8SUpvYj59IGpvYnNcbiAqIEByZXR1cm4ge1ZvaWR9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUXVldWUud29ya2VycyA9IGZ1bmN0aW9uIHdvcmtlcnMod29ya2Vyc09iajogeyBbcHJvcDogc3RyaW5nXTogYW55IH0gPSB7fSk6IHZvaWQge1xuICBpZiAoISh3b3JrZXJzT2JqIGluc3RhbmNlb2YgT2JqZWN0KSkge1xuICAgIHRocm93IG5ldyBFcnJvcignVGhlIHBhcmFtZXRlcnMgc2hvdWxkIGJlIG9iamVjdC4nKTtcbiAgfVxuXG4gIFF1ZXVlLndvcmtlci5tZXJnZSh3b3JrZXJzT2JqKTtcbn07XG5cbi8qKlxuICogQWRkZWQgd29ya2VycyBkZXBlbmRlbmNpZXNcbiAqXG4gKiBAcGFyYW0gIHtPYmplY3R9IGRyaXZlclxuICogQHJldHVybiB7Vm9pZH1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5RdWV1ZS5kZXBzID0gZnVuY3Rpb24gZGVwcyhkZXBlbmRlbmNpZXM6IHsgW3Byb3A6IHN0cmluZ106IGFueSB9ID0ge30pOiB2b2lkIHtcbiAgaWYgKCEoZGVwZW5kZW5jaWVzIGluc3RhbmNlb2YgT2JqZWN0KSkge1xuICAgIHRocm93IG5ldyBFcnJvcignVGhlIHBhcmFtZXRlcnMgc2hvdWxkIGJlIG9iamVjdC4nKTtcbiAgfVxuICBRdWV1ZS53b3JrZXJEZXBzID0gZGVwZW5kZW5jaWVzO1xufTtcblxuLyoqXG4gKiBTZXR1cCBhIGN1c3RvbSBkcml2ZXJcbiAqXG4gKiBAcGFyYW0gIHtPYmplY3R9IGRyaXZlclxuICogQHJldHVybiB7Vm9pZH1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5RdWV1ZS51c2UgPSBmdW5jdGlvbiB1c2UoZHJpdmVyOiB7IFtwcm9wOiBzdHJpbmddOiBhbnkgfSA9IHt9KTogdm9pZCB7XG4gIFF1ZXVlLmRyaXZlcnMgPSB7IC4uLlF1ZXVlLmRyaXZlcnMsIC4uLmRyaXZlciB9O1xufTtcbiIsIi8qIEBmbG93ICovXG5pbXBvcnQgZ3JvdXBCeSBmcm9tICdncm91cC1ieSc7XG5pbXBvcnQgdHlwZSBJQ29uZmlnIGZyb20gJy4vaW50ZXJmYWNlcy9jb25maWcnO1xuaW1wb3J0IHR5cGUgeyBJU3RvcmFnZSB9IGZyb20gJy4vaW50ZXJmYWNlcy9zdG9yYWdlJztcbmltcG9ydCB0eXBlIElUYXNrIGZyb20gJy4vaW50ZXJmYWNlcy90YXNrJztcbmltcG9ydCB7IExvY2FsU3RvcmFnZUFkYXB0ZXIsIEluTWVtb3J5QWRhcHRlciB9IGZyb20gJy4vYWRhcHRlcnMnO1xuaW1wb3J0IHsgZXhjbHVkZVNwZWNpZmljVGFza3MsIGxpZm8sIGZpZm8gfSBmcm9tICcuL3V0aWxzJztcblxuLyogZXNsaW50IG5vLWNvbnNvbGU6IFtcImVycm9yXCIsIHsgYWxsb3c6IFtcIndhcm5cIiwgXCJlcnJvclwiXSB9XSAqL1xuLyogZXNsaW50IG5vLXVuZGVyc2NvcmUtZGFuZ2xlOiBbMiwgeyBcImFsbG93XCI6IFtcIl9pZFwiXSB9XSAqL1xuLyogZXNsaW50IGNsYXNzLW1ldGhvZHMtdXNlLXRoaXM6IFtcImVycm9yXCIsIHsgXCJleGNlcHRNZXRob2RzXCI6IFtcImdlbmVyYXRlSWRcIl0gfV0gKi9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RvcmFnZUNhcHN1bGUge1xuICBjb25maWc6IElDb25maWc7XG4gIHN0b3JhZ2U6IElTdG9yYWdlO1xuICBzdG9yYWdlQ2hhbm5lbDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogSUNvbmZpZywgc3RvcmFnZTogSVN0b3JhZ2UpIHtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLnN0b3JhZ2UgPSB0aGlzLmluaXRpYWxpemUoc3RvcmFnZSk7XG4gIH1cblxuICBpbml0aWFsaXplKFN0b3JhZ2U6IGFueSkge1xuICAgIGlmICh0eXBlb2YgU3RvcmFnZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiBTdG9yYWdlO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIFN0b3JhZ2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBuZXcgU3RvcmFnZSh0aGlzLmNvbmZpZyk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmNvbmZpZy5nZXQoJ3N0b3JhZ2UnKSA9PT0gJ2xvY2Fsc3RvcmFnZScpIHtcbiAgICAgIHJldHVybiBuZXcgTG9jYWxTdG9yYWdlQWRhcHRlcih0aGlzLmNvbmZpZyk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgSW5NZW1vcnlBZGFwdGVyKHRoaXMuY29uZmlnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWxlY3QgYSBjaGFubmVsIGJ5IGNoYW5uZWwgbmFtZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVcbiAgICogQHJldHVybiB7U3RvcmFnZUNhcHN1bGV9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBjaGFubmVsKG5hbWU6IHN0cmluZyk6IFN0b3JhZ2VDYXBzdWxlIHtcbiAgICB0aGlzLnN0b3JhZ2VDaGFubmVsID0gbmFtZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaCB0YXNrcyBmcm9tIHN0b3JhZ2Ugd2l0aCBvcmRlcmVkXG4gICAqXG4gICAqIEByZXR1cm4ge2FueVtdfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgZmV0Y2goKTogUHJvbWlzZTxhbnlbXT4ge1xuICAgIGNvbnN0IGFsbCA9IChhd2FpdCB0aGlzLmFsbCgpKS5maWx0ZXIoZXhjbHVkZVNwZWNpZmljVGFza3MpO1xuICAgIGNvbnN0IHRhc2tzID0gZ3JvdXBCeShhbGwsICdwcmlvcml0eScpO1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0YXNrcylcbiAgICAgIC5tYXAoa2V5ID0+IHBhcnNlSW50KGtleSwgMTApKVxuICAgICAgLnNvcnQoKGEsIGIpID0+IGIgLSBhKVxuICAgICAgLnJlZHVjZSh0aGlzLnJlZHVjZVRhc2tzKHRhc2tzKSwgW10pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNhdmUgdGFzayB0byBzdG9yYWdlXG4gICAqXG4gICAqIEBwYXJhbSAge0lUYXNrfSB0YXNrXG4gICAqIEByZXR1cm4ge1N0cmluZ3xCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgc2F2ZSh0YXNrOiBJVGFzayk6IFByb21pc2U8c3RyaW5nIHwgYm9vbGVhbj4ge1xuICAgIGlmICh0eXBlb2YgdGFzayAhPT0gJ29iamVjdCcpIHJldHVybiBmYWxzZTtcblxuICAgIC8vIGdldCBhbGwgdGFza3MgY3VycmVudCBjaGFubmVsJ3NcbiAgICBjb25zdCB0YXNrczogSVRhc2tbXSA9IGF3YWl0IHRoaXMuc3RvcmFnZS5nZXQodGhpcy5zdG9yYWdlQ2hhbm5lbCk7XG5cbiAgICAvLyBDaGVjayB0aGUgY2hhbm5lbCBsaW1pdC5cbiAgICAvLyBJZiBsaW1pdCBpcyBleGNlZWRlZCwgZG9lcyBub3QgaW5zZXJ0IG5ldyB0YXNrXG4gICAgaWYgKGF3YWl0IHRoaXMuaXNFeGNlZWRlZCgpKSB7XG4gICAgICBjb25zb2xlLndhcm4oYFRhc2sgbGltaXQgZXhjZWVkZWQ6IFRoZSAnJHt0aGlzLnN0b3JhZ2VDaGFubmVsfScgY2hhbm5lbCBsaW1pdCBpcyAke3RoaXMuY29uZmlnLmdldCgnbGltaXQnKX1gKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBwcmVwYXJlIGFsbCBwcm9wZXJ0aWVzIGJlZm9yZSBzYXZlXG4gICAgLy8gZXhhbXBsZTogY3JlYXRlZEF0IGV0Yy5cbiAgICBjb25zdCBuZXdUYXNrID0gdGhpcy5wcmVwYXJlVGFzayh0YXNrKTtcblxuICAgIC8vIGFkZCB0YXNrIHRvIHN0b3JhZ2VcbiAgICB0YXNrcy5wdXNoKG5ld1Rhc2spO1xuXG4gICAgLy8gc2F2ZSB0YXNrc1xuICAgIGF3YWl0IHRoaXMuc3RvcmFnZS5zZXQodGhpcy5zdG9yYWdlQ2hhbm5lbCwgdGFza3MpO1xuXG4gICAgcmV0dXJuIG5ld1Rhc2suX2lkO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBjaGFubmVsIHN0b3JlLlxuICAgKlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqICAgVGhlIHZhbHVlLiBUaGlzIGFubm90YXRpb24gY2FuIGJlIHVzZWQgZm9yIHR5cGUgaGludGluZyBwdXJwb3Nlcy5cbiAgICovXG4gIGFzeW5jIHVwZGF0ZShpZDogc3RyaW5nLCB1cGRhdGU6IHsgW3Byb3BlcnR5OiBzdHJpbmddOiBhbnkgfSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGRhdGE6IGFueVtdID0gYXdhaXQgdGhpcy5hbGwoKTtcbiAgICBjb25zdCBpbmRleDogbnVtYmVyID0gZGF0YS5maW5kSW5kZXgodCA9PiB0Ll9pZCA9PT0gaWQpO1xuXG4gICAgLy8gaWYgaW5kZXggbm90IGZvdW5kLCByZXR1cm4gZmFsc2VcbiAgICBpZiAoaW5kZXggPCAwKSByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBtZXJnZSBleGlzdGluZyBvYmplY3Qgd2l0aCBnaXZlbiB1cGRhdGUgb2JqZWN0XG4gICAgZGF0YVtpbmRleF0gPSBPYmplY3QuYXNzaWduKHt9LCBkYXRhW2luZGV4XSwgdXBkYXRlKTtcblxuICAgIC8vIHNhdmUgdG8gdGhlIHN0b3JhZ2UgYXMgc3RyaW5nXG4gICAgYXdhaXQgdGhpcy5zdG9yYWdlLnNldCh0aGlzLnN0b3JhZ2VDaGFubmVsLCBkYXRhKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSB0YXNrIGZyb20gc3RvcmFnZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGlkXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBkZWxldGUoaWQ6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGRhdGE6IGFueVtdID0gYXdhaXQgdGhpcy5hbGwoKTtcbiAgICBjb25zdCBpbmRleDogbnVtYmVyID0gZGF0YS5maW5kSW5kZXgoZCA9PiBkLl9pZCA9PT0gaWQpO1xuXG4gICAgaWYgKGluZGV4IDwgMCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgZGVsZXRlIGRhdGFbaW5kZXhdO1xuXG4gICAgYXdhaXQgdGhpcy5zdG9yYWdlLnNldCh0aGlzLnN0b3JhZ2VDaGFubmVsLCBkYXRhLmZpbHRlcihkID0+IGQpKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgdGFza3NcbiAgICpcbiAgICogQHJldHVybiB7QW55W119XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBhbGwoKTogUHJvbWlzZTxJVGFza1tdPiB7XG4gICAgY29uc3QgaXRlbXMgPSBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0KHRoaXMuc3RvcmFnZUNoYW5uZWwpO1xuICAgIHJldHVybiBpdGVtcztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSB1bmlxdWUgaWRcbiAgICpcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgZ2VuZXJhdGVJZCgpOiBzdHJpbmcge1xuICAgIHJldHVybiAoKDEgKyBNYXRoLnJhbmRvbSgpKSAqIDB4MTAwMDApLnRvU3RyaW5nKDE2KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgc29tZSBuZWNlc3NhcnkgcHJvcGVydGllc1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGlkXG4gICAqIEByZXR1cm4ge0lUYXNrfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgcHJlcGFyZVRhc2sodGFzazogSVRhc2spOiBJVGFzayB7XG4gICAgY29uc3QgbmV3VGFzayA9IHsgLi4udGFzayB9O1xuICAgIG5ld1Rhc2suY3JlYXRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICBuZXdUYXNrLl9pZCA9IHRoaXMuZ2VuZXJhdGVJZCgpO1xuICAgIHJldHVybiBuZXdUYXNrO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBzb21lIG5lY2Vzc2FyeSBwcm9wZXJ0aWVzXG4gICAqXG4gICAqIEBwYXJhbSAge0lUYXNrW119IHRhc2tzXG4gICAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgcmVkdWNlVGFza3ModGFza3M6IElUYXNrW10pIHtcbiAgICBjb25zdCByZWR1Y2VGdW5jID0gKHJlc3VsdDogSVRhc2tbXSwga2V5OiBhbnkpOiBJVGFza1tdID0+IHtcbiAgICAgIGlmICh0aGlzLmNvbmZpZy5nZXQoJ3ByaW5jaXBsZScpID09PSAnbGlmbycpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5jb25jYXQodGFza3Nba2V5XS5zb3J0KGxpZm8pKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQuY29uY2F0KHRhc2tzW2tleV0uc29ydChmaWZvKSk7XG4gICAgfTtcblxuICAgIHJldHVybiByZWR1Y2VGdW5jLmJpbmQodGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogVGFzayBsaW1pdCBjaGVja2VyXG4gICAqXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBpc0V4Y2VlZGVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGxpbWl0OiBudW1iZXIgPSB0aGlzLmNvbmZpZy5nZXQoJ2xpbWl0Jyk7XG4gICAgY29uc3QgdGFza3M6IElUYXNrW10gPSAoYXdhaXQgdGhpcy5hbGwoKSkuZmlsdGVyKGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzKTtcbiAgICByZXR1cm4gIShsaW1pdCA9PT0gLTEgfHwgbGltaXQgPiB0YXNrcy5sZW5ndGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFyIHRhc2tzIHdpdGggZ2l2ZW4gY2hhbm5lbCBuYW1lXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gY2hhbm5lbFxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgY2xlYXIoY2hhbm5lbDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5zdG9yYWdlLmNsZWFyKGNoYW5uZWwpO1xuICB9XG59XG4iLCIvKiBAZmxvdyAqL1xuaW1wb3J0IHR5cGUgSVRhc2sgZnJvbSAnLi9pbnRlcmZhY2VzL3Rhc2snO1xuXG4vKiBlc2xpbnQgY29tbWEtZGFuZ2xlOiBbXCJlcnJvclwiLCBcIm5ldmVyXCJdICovXG5cbi8qKlxuICogQ2hlY2sgcHJvcGVydHkgaW4gb2JqZWN0XG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc1Byb3BlcnR5KGZ1bmM6IEZ1bmN0aW9uLCBuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChmdW5jLCBuYW1lKTtcbn1cblxuLyoqXG4gKiBDaGVjayBtZXRob2QgaW4gaW5pdGlhdGVkIGNsYXNzXG4gKlxuICogQHBhcmFtICB7Q2xhc3N9IGluc3RhbmNlXG4gKiBAcGFyYW0gIHtTdHJpbmd9IG1ldGhvZFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gaGFzTWV0aG9kKGluc3RhbmNlOiBhbnksIG1ldGhvZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBpbnN0YW5jZSBpbnN0YW5jZW9mIE9iamVjdCAmJiBtZXRob2QgaW4gaW5zdGFuY2U7XG59XG5cbi8qKlxuICogQ2hlY2sgZnVuY3Rpb24gdHlwZVxuICpcbiAqIEBwYXJhbSAge0Z1bmN0aW9ufSBmdW5jXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0Z1bmN0aW9uKGZ1bmM6IEZ1bmN0aW9uKTogYm9vbGVhbiB7XG4gIHJldHVybiBmdW5jIGluc3RhbmNlb2YgRnVuY3Rpb247XG59XG5cbi8qKlxuICogUmVtb3ZlIHNvbWUgdGFza3MgYnkgc29tZSBjb25kaXRpb25zXG4gKlxuICogQHBhcmFtICB7RnVuY3Rpb259IGZ1bmNcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzKHRhc2s6IElUYXNrKTogYm9vbGVhbiB7XG4gIGNvbnN0IGNvbmRpdGlvbnMgPSBBcnJheS5pc0FycmF5KHRoaXMpID8gdGhpcyA6IFsnZnJlZXplZCcsICdsb2NrZWQnXTtcbiAgY29uc3QgcmVzdWx0cyA9IFtdO1xuXG4gIGNvbmRpdGlvbnMuZm9yRWFjaCgoYykgPT4ge1xuICAgIHJlc3VsdHMucHVzaChoYXNQcm9wZXJ0eSh0YXNrLCBjKSA9PT0gZmFsc2UgfHwgdGFza1tjXSA9PT0gZmFsc2UpO1xuICB9KTtcblxuICByZXR1cm4gIShyZXN1bHRzLmluZGV4T2YoZmFsc2UpID4gLTEpO1xufVxuXG4vKipcbiAqIENsZWFyIHRhc2tzIGJ5IGl0J3MgdGFnc1xuICpcbiAqIEBwYXJhbSAge0lUYXNrfSB0YXNrXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1dGlsQ2xlYXJCeVRhZyh0YXNrOiBJVGFzayk6IGJvb2xlYW4ge1xuICBpZiAoIWV4Y2x1ZGVTcGVjaWZpY1Rhc2tzLmNhbGwoWydsb2NrZWQnXSwgdGFzaykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRhc2sudGFnID09PSB0aGlzO1xufVxuXG4vKipcbiAqIFNvcnQgYnkgZmlmb1xuICpcbiAqIEBwYXJhbSAge0lUYXNrfSBhXG4gKiBAcGFyYW0gIHtJVGFza30gYlxuICogQHJldHVybiB7QW55fVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaWZvKGE6IElUYXNrLCBiOiBJVGFzayk6IGFueSB7XG4gIHJldHVybiBhLmNyZWF0ZWRBdCAtIGIuY3JlYXRlZEF0O1xufVxuXG4vKipcbiAqIFNvcnQgYnkgbGlmb1xuICpcbiAqIEBwYXJhbSAge0lUYXNrfSBhXG4gKiBAcGFyYW0gIHtJVGFza30gYlxuICogQHJldHVybiB7QW55fVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsaWZvKGE6IElUYXNrLCBiOiBJVGFzayk6IGFueSB7XG4gIHJldHVybiBiLmNyZWF0ZWRBdCAtIGEuY3JlYXRlZEF0O1xufVxuIl19
