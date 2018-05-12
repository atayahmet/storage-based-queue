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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9yZWdlbmVyYXRvci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb21wb25lbnQtcHJvcHMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZ3JvdXAtYnkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvb2JqZWN0LXBhdGgvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcHNldWRvLXdvcmtlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wc2V1ZG8td29ya2VyL3BvbHlmaWxsLmpzIiwibm9kZV9tb2R1bGVzL3JlZ2VuZXJhdG9yLXJ1bnRpbWUvcnVudGltZS1tb2R1bGUuanMiLCJub2RlX21vZHVsZXMvcmVnZW5lcmF0b3ItcnVudGltZS9ydW50aW1lLmpzIiwibm9kZV9tb2R1bGVzL3RvLWZ1bmN0aW9uL2luZGV4LmpzIiwic3JjL2FkYXB0ZXJzL2luZGV4LmpzIiwic3JjL2FkYXB0ZXJzL2lubWVtb3J5LmpzIiwic3JjL2FkYXB0ZXJzL2xvY2Fsc3RvcmFnZS5qcyIsInNyYy9jaGFubmVsLmpzIiwic3JjL2NvbmZpZy5qcyIsInNyYy9jb25zb2xlLmpzIiwic3JjL2NvbnRhaW5lci5qcyIsInNyYy9lbnVtL2NvbmZpZy5kYXRhLmpzIiwic3JjL2VudW0vbG9nLmV2ZW50cy5qcyIsInNyYy9ldmVudC5qcyIsInNyYy9oZWxwZXJzLmpzIiwic3JjL2luZGV4LmpzIiwic3JjL3F1ZXVlLmpzIiwic3JjL3N0b3JhZ2UtY2Fwc3VsZS5qcyIsInNyYy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUMxS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3Z0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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LFNBQVMsS0FBQSxBQUFLLE9BQXBELEFBQTJELEFBQzVELE9BRkQsR0FJQSxPQUFPLEVBQUUsUUFBQSxBQUFRLFFBQVIsQUFBZ0IsU0FBUyxDQUFsQyxBQUFPLEFBQTRCLEFBQ3BDLEcsRUFFRDs7Ozs7Ozsya0JBUU8sU0FBQSxBQUFTLGVBQVQsQUFBd0IsTUFBc0IsQ0FDbkQsSUFBSSxDQUFDLHFCQUFBLEFBQXFCLEtBQUssQ0FBMUIsQUFBMEIsQUFBQyxXQUFoQyxBQUFLLEFBQXNDLE9BQU8sQ0FDaEQsT0FBQSxBQUFPLEFBQ1IsTUFDRCxRQUFPLEtBQUEsQUFBSyxRQUFaLEFBQW9CLEFBQ3JCLEssRUFFRDs7Ozs7Ozs7eXNCQVNPLFNBQUEsQUFBUyxLQUFULEFBQWMsR0FBZCxBQUF3QixHQUFlLENBQzVDLE9BQU8sRUFBQSxBQUFFLFlBQVksRUFBckIsQUFBdUIsQUFDeEIsVSxFQUVEOzs7Ozs7Oztvd0JBU08sU0FBQSxBQUFTLEtBQVQsQUFBYyxHQUFkLEFBQXdCLEdBQWUsQ0FDNUMsT0FBTyxFQUFBLEFBQUUsWUFBWSxFQUFyQixBQUF1QixBQUN4QiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInJlZ2VuZXJhdG9yLXJ1bnRpbWVcIik7XG4iLCIvKipcbiAqIEdsb2JhbCBOYW1lc1xuICovXG5cbnZhciBnbG9iYWxzID0gL1xcYihBcnJheXxEYXRlfE9iamVjdHxNYXRofEpTT04pXFxiL2c7XG5cbi8qKlxuICogUmV0dXJuIGltbWVkaWF0ZSBpZGVudGlmaWVycyBwYXJzZWQgZnJvbSBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge1N0cmluZ3xGdW5jdGlvbn0gbWFwIGZ1bmN0aW9uIG9yIHByZWZpeFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc3RyLCBmbil7XG4gIHZhciBwID0gdW5pcXVlKHByb3BzKHN0cikpO1xuICBpZiAoZm4gJiYgJ3N0cmluZycgPT0gdHlwZW9mIGZuKSBmbiA9IHByZWZpeGVkKGZuKTtcbiAgaWYgKGZuKSByZXR1cm4gbWFwKHN0ciwgcCwgZm4pO1xuICByZXR1cm4gcDtcbn07XG5cbi8qKlxuICogUmV0dXJuIGltbWVkaWF0ZSBpZGVudGlmaWVycyBpbiBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHByb3BzKHN0cikge1xuICByZXR1cm4gc3RyXG4gICAgLnJlcGxhY2UoL1xcLlxcdyt8XFx3KyAqXFwofFwiW15cIl0qXCJ8J1teJ10qJ3xcXC8oW14vXSspXFwvL2csICcnKVxuICAgIC5yZXBsYWNlKGdsb2JhbHMsICcnKVxuICAgIC5tYXRjaCgvW2EtekEtWl9dXFx3Ki9nKVxuICAgIHx8IFtdO1xufVxuXG4vKipcbiAqIFJldHVybiBgc3RyYCB3aXRoIGBwcm9wc2AgbWFwcGVkIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge0FycmF5fSBwcm9wc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG1hcChzdHIsIHByb3BzLCBmbikge1xuICB2YXIgcmUgPSAvXFwuXFx3K3xcXHcrICpcXCh8XCJbXlwiXSpcInwnW14nXSonfFxcLyhbXi9dKylcXC98W2EtekEtWl9dXFx3Ki9nO1xuICByZXR1cm4gc3RyLnJlcGxhY2UocmUsIGZ1bmN0aW9uKF8pe1xuICAgIGlmICgnKCcgPT0gX1tfLmxlbmd0aCAtIDFdKSByZXR1cm4gZm4oXyk7XG4gICAgaWYgKCF+cHJvcHMuaW5kZXhPZihfKSkgcmV0dXJuIF87XG4gICAgcmV0dXJuIGZuKF8pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gdW5pcXVlIGFycmF5LlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFyclxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiB1bmlxdWUoYXJyKSB7XG4gIHZhciByZXQgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgIGlmICh+cmV0LmluZGV4T2YoYXJyW2ldKSkgY29udGludWU7XG4gICAgcmV0LnB1c2goYXJyW2ldKTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59XG5cbi8qKlxuICogTWFwIHdpdGggcHJlZml4IGBzdHJgLlxuICovXG5cbmZ1bmN0aW9uIHByZWZpeGVkKHN0cikge1xuICByZXR1cm4gZnVuY3Rpb24oXyl7XG4gICAgcmV0dXJuIHN0ciArIF87XG4gIH07XG59XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgdG9GdW5jdGlvbiA9IHJlcXVpcmUoJ3RvLWZ1bmN0aW9uJyk7XG5cbi8qKlxuICogR3JvdXAgYGFycmAgd2l0aCBjYWxsYmFjayBgZm4odmFsLCBpKWAuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufFN0cmluZ30gZm4gb3IgcHJvcFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXJyLCBmbil7XG4gIHZhciByZXQgPSB7fTtcbiAgdmFyIHByb3A7XG4gIGZuID0gdG9GdW5jdGlvbihmbik7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyArK2kpIHtcbiAgICBwcm9wID0gZm4oYXJyW2ldLCBpKTtcbiAgICByZXRbcHJvcF0gPSByZXRbcHJvcF0gfHwgW107XG4gICAgcmV0W3Byb3BdLnB1c2goYXJyW2ldKTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59OyIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSl7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvKmlzdGFuYnVsIGlnbm9yZSBuZXh0OmNhbnQgdGVzdCovXG4gIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgIGRlZmluZShbXSwgZmFjdG9yeSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gQnJvd3NlciBnbG9iYWxzXG4gICAgcm9vdC5vYmplY3RQYXRoID0gZmFjdG9yeSgpO1xuICB9XG59KSh0aGlzLCBmdW5jdGlvbigpe1xuICAndXNlIHN0cmljdCc7XG5cbiAgdmFyIHRvU3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbiAgZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gICAgaWYob2JqID09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICAvL3RvIGhhbmRsZSBvYmplY3RzIHdpdGggbnVsbCBwcm90b3R5cGVzICh0b28gZWRnZSBjYXNlPylcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcClcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzRW1wdHkodmFsdWUpe1xuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgICBmb3IgKHZhciBpIGluIHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoaGFzT3duUHJvcGVydHkodmFsdWUsIGkpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiB0b1N0cmluZyh0eXBlKXtcbiAgICByZXR1cm4gdG9TdHIuY2FsbCh0eXBlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzT2JqZWN0KG9iail7XG4gICAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIHRvU3RyaW5nKG9iaikgPT09IFwiW29iamVjdCBPYmplY3RdXCI7XG4gIH1cblxuICB2YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24ob2JqKXtcbiAgICAvKmlzdGFuYnVsIGlnbm9yZSBuZXh0OmNhbnQgdGVzdCovXG4gICAgcmV0dXJuIHRvU3RyLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzQm9vbGVhbihvYmope1xuICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSAnYm9vbGVhbicgfHwgdG9TdHJpbmcob2JqKSA9PT0gJ1tvYmplY3QgQm9vbGVhbl0nO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0S2V5KGtleSl7XG4gICAgdmFyIGludEtleSA9IHBhcnNlSW50KGtleSk7XG4gICAgaWYgKGludEtleS50b1N0cmluZygpID09PSBrZXkpIHtcbiAgICAgIHJldHVybiBpbnRLZXk7XG4gICAgfVxuICAgIHJldHVybiBrZXk7XG4gIH1cblxuICBmdW5jdGlvbiBmYWN0b3J5KG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuXG4gICAgdmFyIG9iamVjdFBhdGggPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmplY3RQYXRoKS5yZWR1Y2UoZnVuY3Rpb24ocHJveHksIHByb3ApIHtcbiAgICAgICAgaWYocHJvcCA9PT0gJ2NyZWF0ZScpIHtcbiAgICAgICAgICByZXR1cm4gcHJveHk7XG4gICAgICAgIH1cblxuICAgICAgICAvKmlzdGFuYnVsIGlnbm9yZSBlbHNlKi9cbiAgICAgICAgaWYgKHR5cGVvZiBvYmplY3RQYXRoW3Byb3BdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgcHJveHlbcHJvcF0gPSBvYmplY3RQYXRoW3Byb3BdLmJpbmQob2JqZWN0UGF0aCwgb2JqKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwcm94eTtcbiAgICAgIH0sIHt9KTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gaGFzU2hhbGxvd1Byb3BlcnR5KG9iaiwgcHJvcCkge1xuICAgICAgcmV0dXJuIChvcHRpb25zLmluY2x1ZGVJbmhlcml0ZWRQcm9wcyB8fCAodHlwZW9mIHByb3AgPT09ICdudW1iZXInICYmIEFycmF5LmlzQXJyYXkob2JqKSkgfHwgaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSlcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRTaGFsbG93UHJvcGVydHkob2JqLCBwcm9wKSB7XG4gICAgICBpZiAoaGFzU2hhbGxvd1Byb3BlcnR5KG9iaiwgcHJvcCkpIHtcbiAgICAgICAgcmV0dXJuIG9ialtwcm9wXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXQob2JqLCBwYXRoLCB2YWx1ZSwgZG9Ob3RSZXBsYWNlKXtcbiAgICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcGF0aCA9IFtwYXRoXTtcbiAgICAgIH1cbiAgICAgIGlmICghcGF0aCB8fCBwYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBwYXRoID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gc2V0KG9iaiwgcGF0aC5zcGxpdCgnLicpLm1hcChnZXRLZXkpLCB2YWx1ZSwgZG9Ob3RSZXBsYWNlKTtcbiAgICAgIH1cbiAgICAgIHZhciBjdXJyZW50UGF0aCA9IHBhdGhbMF07XG4gICAgICB2YXIgY3VycmVudFZhbHVlID0gZ2V0U2hhbGxvd1Byb3BlcnR5KG9iaiwgY3VycmVudFBhdGgpO1xuICAgICAgaWYgKHBhdGgubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGlmIChjdXJyZW50VmFsdWUgPT09IHZvaWQgMCB8fCAhZG9Ob3RSZXBsYWNlKSB7XG4gICAgICAgICAgb2JqW2N1cnJlbnRQYXRoXSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjdXJyZW50VmFsdWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChjdXJyZW50VmFsdWUgPT09IHZvaWQgMCkge1xuICAgICAgICAvL2NoZWNrIGlmIHdlIGFzc3VtZSBhbiBhcnJheVxuICAgICAgICBpZih0eXBlb2YgcGF0aFsxXSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICBvYmpbY3VycmVudFBhdGhdID0gW107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2JqW2N1cnJlbnRQYXRoXSA9IHt9O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZXQob2JqW2N1cnJlbnRQYXRoXSwgcGF0aC5zbGljZSgxKSwgdmFsdWUsIGRvTm90UmVwbGFjZSk7XG4gICAgfVxuXG4gICAgb2JqZWN0UGF0aC5oYXMgPSBmdW5jdGlvbiAob2JqLCBwYXRoKSB7XG4gICAgICBpZiAodHlwZW9mIHBhdGggPT09ICdudW1iZXInKSB7XG4gICAgICAgIHBhdGggPSBbcGF0aF07XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBwYXRoID09PSAnc3RyaW5nJykge1xuICAgICAgICBwYXRoID0gcGF0aC5zcGxpdCgnLicpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXBhdGggfHwgcGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuICEhb2JqO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhdGgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGogPSBnZXRLZXkocGF0aFtpXSk7XG5cbiAgICAgICAgaWYoKHR5cGVvZiBqID09PSAnbnVtYmVyJyAmJiBpc0FycmF5KG9iaikgJiYgaiA8IG9iai5sZW5ndGgpIHx8XG4gICAgICAgICAgKG9wdGlvbnMuaW5jbHVkZUluaGVyaXRlZFByb3BzID8gKGogaW4gT2JqZWN0KG9iaikpIDogaGFzT3duUHJvcGVydHkob2JqLCBqKSkpIHtcbiAgICAgICAgICBvYmogPSBvYmpbal07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICBvYmplY3RQYXRoLmVuc3VyZUV4aXN0cyA9IGZ1bmN0aW9uIChvYmosIHBhdGgsIHZhbHVlKXtcbiAgICAgIHJldHVybiBzZXQob2JqLCBwYXRoLCB2YWx1ZSwgdHJ1ZSk7XG4gICAgfTtcblxuICAgIG9iamVjdFBhdGguc2V0ID0gZnVuY3Rpb24gKG9iaiwgcGF0aCwgdmFsdWUsIGRvTm90UmVwbGFjZSl7XG4gICAgICByZXR1cm4gc2V0KG9iaiwgcGF0aCwgdmFsdWUsIGRvTm90UmVwbGFjZSk7XG4gICAgfTtcblxuICAgIG9iamVjdFBhdGguaW5zZXJ0ID0gZnVuY3Rpb24gKG9iaiwgcGF0aCwgdmFsdWUsIGF0KXtcbiAgICAgIHZhciBhcnIgPSBvYmplY3RQYXRoLmdldChvYmosIHBhdGgpO1xuICAgICAgYXQgPSB+fmF0O1xuICAgICAgaWYgKCFpc0FycmF5KGFycikpIHtcbiAgICAgICAgYXJyID0gW107XG4gICAgICAgIG9iamVjdFBhdGguc2V0KG9iaiwgcGF0aCwgYXJyKTtcbiAgICAgIH1cbiAgICAgIGFyci5zcGxpY2UoYXQsIDAsIHZhbHVlKTtcbiAgICB9O1xuXG4gICAgb2JqZWN0UGF0aC5lbXB0eSA9IGZ1bmN0aW9uKG9iaiwgcGF0aCkge1xuICAgICAgaWYgKGlzRW1wdHkocGF0aCkpIHtcbiAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICAgIH1cbiAgICAgIGlmIChvYmogPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgfVxuXG4gICAgICB2YXIgdmFsdWUsIGk7XG4gICAgICBpZiAoISh2YWx1ZSA9IG9iamVjdFBhdGguZ2V0KG9iaiwgcGF0aCkpKSB7XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBvYmplY3RQYXRoLnNldChvYmosIHBhdGgsICcnKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNCb29sZWFuKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gb2JqZWN0UGF0aC5zZXQob2JqLCBwYXRoLCBmYWxzZSk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdFBhdGguc2V0KG9iaiwgcGF0aCwgMCk7XG4gICAgICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgIHZhbHVlLmxlbmd0aCA9IDA7XG4gICAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KHZhbHVlKSkge1xuICAgICAgICBmb3IgKGkgaW4gdmFsdWUpIHtcbiAgICAgICAgICBpZiAoaGFzU2hhbGxvd1Byb3BlcnR5KHZhbHVlLCBpKSkge1xuICAgICAgICAgICAgZGVsZXRlIHZhbHVlW2ldO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdFBhdGguc2V0KG9iaiwgcGF0aCwgbnVsbCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIG9iamVjdFBhdGgucHVzaCA9IGZ1bmN0aW9uIChvYmosIHBhdGggLyosIHZhbHVlcyAqLyl7XG4gICAgICB2YXIgYXJyID0gb2JqZWN0UGF0aC5nZXQob2JqLCBwYXRoKTtcbiAgICAgIGlmICghaXNBcnJheShhcnIpKSB7XG4gICAgICAgIGFyciA9IFtdO1xuICAgICAgICBvYmplY3RQYXRoLnNldChvYmosIHBhdGgsIGFycik7XG4gICAgICB9XG5cbiAgICAgIGFyci5wdXNoLmFwcGx5KGFyciwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKSk7XG4gICAgfTtcblxuICAgIG9iamVjdFBhdGguY29hbGVzY2UgPSBmdW5jdGlvbiAob2JqLCBwYXRocywgZGVmYXVsdFZhbHVlKSB7XG4gICAgICB2YXIgdmFsdWU7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBwYXRocy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAoKHZhbHVlID0gb2JqZWN0UGF0aC5nZXQob2JqLCBwYXRoc1tpXSkpICE9PSB2b2lkIDApIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICB9O1xuXG4gICAgb2JqZWN0UGF0aC5nZXQgPSBmdW5jdGlvbiAob2JqLCBwYXRoLCBkZWZhdWx0VmFsdWUpe1xuICAgICAgaWYgKHR5cGVvZiBwYXRoID09PSAnbnVtYmVyJykge1xuICAgICAgICBwYXRoID0gW3BhdGhdO1xuICAgICAgfVxuICAgICAgaWYgKCFwYXRoIHx8IHBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgICB9XG4gICAgICBpZiAob2JqID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdFBhdGguZ2V0KG9iaiwgcGF0aC5zcGxpdCgnLicpLCBkZWZhdWx0VmFsdWUpO1xuICAgICAgfVxuXG4gICAgICB2YXIgY3VycmVudFBhdGggPSBnZXRLZXkocGF0aFswXSk7XG4gICAgICB2YXIgbmV4dE9iaiA9IGdldFNoYWxsb3dQcm9wZXJ0eShvYmosIGN1cnJlbnRQYXRoKVxuICAgICAgaWYgKG5leHRPYmogPT09IHZvaWQgMCkge1xuICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICAgICAgfVxuXG4gICAgICBpZiAocGF0aC5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIG5leHRPYmo7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvYmplY3RQYXRoLmdldChvYmpbY3VycmVudFBhdGhdLCBwYXRoLnNsaWNlKDEpLCBkZWZhdWx0VmFsdWUpO1xuICAgIH07XG5cbiAgICBvYmplY3RQYXRoLmRlbCA9IGZ1bmN0aW9uIGRlbChvYmosIHBhdGgpIHtcbiAgICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcGF0aCA9IFtwYXRoXTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9iaiA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc0VtcHR5KHBhdGgpKSB7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgICB9XG4gICAgICBpZih0eXBlb2YgcGF0aCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdFBhdGguZGVsKG9iaiwgcGF0aC5zcGxpdCgnLicpKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGN1cnJlbnRQYXRoID0gZ2V0S2V5KHBhdGhbMF0pO1xuICAgICAgaWYgKCFoYXNTaGFsbG93UHJvcGVydHkob2JqLCBjdXJyZW50UGF0aCkpIHtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgIH1cblxuICAgICAgaWYocGF0aC5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgICAgICAgIG9iai5zcGxpY2UoY3VycmVudFBhdGgsIDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZSBvYmpbY3VycmVudFBhdGhdO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gb2JqZWN0UGF0aC5kZWwob2JqW2N1cnJlbnRQYXRoXSwgcGF0aC5zbGljZSgxKSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iamVjdFBhdGg7XG4gIH1cblxuICB2YXIgbW9kID0gZmFjdG9yeSgpO1xuICBtb2QuY3JlYXRlID0gZmFjdG9yeTtcbiAgbW9kLndpdGhJbmhlcml0ZWRQcm9wcyA9IGZhY3Rvcnkoe2luY2x1ZGVJbmhlcml0ZWRQcm9wczogdHJ1ZX0pXG4gIHJldHVybiBtb2Q7XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gZG9FdmFsKHNlbGYsIF9fcHNldWRvd29ya2VyX3NjcmlwdCkge1xuICAvKiBqc2hpbnQgdW51c2VkOmZhbHNlICovXG4gIChmdW5jdGlvbiAoKSB7XG4gICAgLyoganNoaW50IGV2aWw6dHJ1ZSAqL1xuICAgIGV2YWwoX19wc2V1ZG93b3JrZXJfc2NyaXB0KTtcbiAgfSkuY2FsbChnbG9iYWwpO1xufVxuXG5mdW5jdGlvbiBQc2V1ZG9Xb3JrZXIocGF0aCkge1xuICB2YXIgbWVzc2FnZUxpc3RlbmVycyA9IFtdO1xuICB2YXIgZXJyb3JMaXN0ZW5lcnMgPSBbXTtcbiAgdmFyIHdvcmtlck1lc3NhZ2VMaXN0ZW5lcnMgPSBbXTtcbiAgdmFyIHdvcmtlckVycm9yTGlzdGVuZXJzID0gW107XG4gIHZhciBwb3N0TWVzc2FnZUxpc3RlbmVycyA9IFtdO1xuICB2YXIgdGVybWluYXRlZCA9IGZhbHNlO1xuICB2YXIgc2NyaXB0O1xuICB2YXIgd29ya2VyU2VsZjtcblxuICB2YXIgYXBpID0gdGhpcztcblxuICAvLyBjdXN0b20gZWFjaCBsb29wIGlzIGZvciBJRTggc3VwcG9ydFxuICBmdW5jdGlvbiBleGVjdXRlRWFjaChhcnIsIGZ1bikge1xuICAgIHZhciBpID0gLTE7XG4gICAgd2hpbGUgKCsraSA8IGFyci5sZW5ndGgpIHtcbiAgICAgIGlmIChhcnJbaV0pIHtcbiAgICAgICAgZnVuKGFycltpXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2FsbEVycm9yTGlzdGVuZXIoZXJyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuICAgICAgbGlzdGVuZXIoe1xuICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICBlcnJvcjogZXJyLFxuICAgICAgICBtZXNzYWdlOiBlcnIubWVzc2FnZVxuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXIodHlwZSwgZnVuKSB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICBpZiAodHlwZSA9PT0gJ21lc3NhZ2UnKSB7XG4gICAgICBtZXNzYWdlTGlzdGVuZXJzLnB1c2goZnVuKTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICAgIGVycm9yTGlzdGVuZXJzLnB1c2goZnVuKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGZ1bikge1xuICAgICAgdmFyIGxpc3RlbmVycztcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICBpZiAodHlwZSA9PT0gJ21lc3NhZ2UnKSB7XG4gICAgICAgIGxpc3RlbmVycyA9IG1lc3NhZ2VMaXN0ZW5lcnM7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICAgICAgbGlzdGVuZXJzID0gZXJyb3JMaXN0ZW5lcnM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgaSA9IC0xO1xuICAgICAgd2hpbGUgKCsraSA8IGxpc3RlbmVycy5sZW5ndGgpIHtcbiAgICAgICAgdmFyIGxpc3RlbmVyID0gbGlzdGVuZXJzW2ldO1xuICAgICAgICBpZiAobGlzdGVuZXIgPT09IGZ1bikge1xuICAgICAgICAgIGRlbGV0ZSBsaXN0ZW5lcnNbaV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHBvc3RFcnJvcihlcnIpIHtcbiAgICB2YXIgY2FsbEZ1biA9IGNhbGxFcnJvckxpc3RlbmVyKGVycik7XG4gICAgaWYgKHR5cGVvZiBhcGkub25lcnJvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY2FsbEZ1bihhcGkub25lcnJvcik7XG4gICAgfVxuICAgIGlmICh3b3JrZXJTZWxmICYmIHR5cGVvZiB3b3JrZXJTZWxmLm9uZXJyb3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNhbGxGdW4od29ya2VyU2VsZi5vbmVycm9yKTtcbiAgICB9XG4gICAgZXhlY3V0ZUVhY2goZXJyb3JMaXN0ZW5lcnMsIGNhbGxGdW4pO1xuICAgIGV4ZWN1dGVFYWNoKHdvcmtlckVycm9yTGlzdGVuZXJzLCBjYWxsRnVuKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJ1blBvc3RNZXNzYWdlKG1zZykge1xuICAgIGZ1bmN0aW9uIGNhbGxGdW4obGlzdGVuZXIpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGxpc3RlbmVyKHtkYXRhOiBtc2d9KTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBwb3N0RXJyb3IoZXJyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAod29ya2VyU2VsZiAmJiB0eXBlb2Ygd29ya2VyU2VsZi5vbm1lc3NhZ2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNhbGxGdW4od29ya2VyU2VsZi5vbm1lc3NhZ2UpO1xuICAgIH1cbiAgICBleGVjdXRlRWFjaCh3b3JrZXJNZXNzYWdlTGlzdGVuZXJzLCBjYWxsRnVuKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBvc3RNZXNzYWdlKG1zZykge1xuICAgIGlmICh0eXBlb2YgbXNnID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdwb3N0TWVzc2FnZSgpIHJlcXVpcmVzIGFuIGFyZ3VtZW50Jyk7XG4gICAgfVxuICAgIGlmICh0ZXJtaW5hdGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghc2NyaXB0KSB7XG4gICAgICBwb3N0TWVzc2FnZUxpc3RlbmVycy5wdXNoKG1zZyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJ1blBvc3RNZXNzYWdlKG1zZyk7XG4gIH1cblxuICBmdW5jdGlvbiB0ZXJtaW5hdGUoKSB7XG4gICAgdGVybWluYXRlZCA9IHRydWU7XG4gIH1cblxuICBmdW5jdGlvbiB3b3JrZXJQb3N0TWVzc2FnZShtc2cpIHtcbiAgICBmdW5jdGlvbiBjYWxsRnVuKGxpc3RlbmVyKSB7XG4gICAgICBsaXN0ZW5lcih7XG4gICAgICAgIGRhdGE6IG1zZ1xuICAgICAgfSk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgYXBpLm9ubWVzc2FnZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY2FsbEZ1bihhcGkub25tZXNzYWdlKTtcbiAgICB9XG4gICAgZXhlY3V0ZUVhY2gobWVzc2FnZUxpc3RlbmVycywgY2FsbEZ1bik7XG4gIH1cblxuICBmdW5jdGlvbiB3b3JrZXJBZGRFdmVudExpc3RlbmVyKHR5cGUsIGZ1bikge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgaWYgKHR5cGUgPT09ICdtZXNzYWdlJykge1xuICAgICAgd29ya2VyTWVzc2FnZUxpc3RlbmVycy5wdXNoKGZ1bik7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgICB3b3JrZXJFcnJvckxpc3RlbmVycy5wdXNoKGZ1bik7XG4gICAgfVxuICB9XG5cbiAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gIHhoci5vcGVuKCdHRVQnLCBwYXRoKTtcbiAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgIGlmICh4aHIuc3RhdHVzID49IDIwMCAmJiB4aHIuc3RhdHVzIDwgNDAwKSB7XG4gICAgICAgIHNjcmlwdCA9IHhoci5yZXNwb25zZVRleHQ7XG4gICAgICAgIHdvcmtlclNlbGYgPSB7XG4gICAgICAgICAgcG9zdE1lc3NhZ2U6IHdvcmtlclBvc3RNZXNzYWdlLFxuICAgICAgICAgIGFkZEV2ZW50TGlzdGVuZXI6IHdvcmtlckFkZEV2ZW50TGlzdGVuZXIsXG4gICAgICAgIH07XG4gICAgICAgIGRvRXZhbCh3b3JrZXJTZWxmLCBzY3JpcHQpO1xuICAgICAgICB2YXIgY3VycmVudExpc3RlbmVycyA9IHBvc3RNZXNzYWdlTGlzdGVuZXJzO1xuICAgICAgICBwb3N0TWVzc2FnZUxpc3RlbmVycyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGN1cnJlbnRMaXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBydW5Qb3N0TWVzc2FnZShjdXJyZW50TGlzdGVuZXJzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcG9zdEVycm9yKG5ldyBFcnJvcignY2Fubm90IGZpbmQgc2NyaXB0ICcgKyBwYXRoKSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHhoci5zZW5kKCk7XG5cbiAgYXBpLnBvc3RNZXNzYWdlID0gcG9zdE1lc3NhZ2U7XG4gIGFwaS5hZGRFdmVudExpc3RlbmVyID0gYWRkRXZlbnRMaXN0ZW5lcjtcbiAgYXBpLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSByZW1vdmVFdmVudExpc3RlbmVyO1xuICBhcGkudGVybWluYXRlID0gdGVybWluYXRlO1xuXG4gIHJldHVybiBhcGk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUHNldWRvV29ya2VyOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIFBzZXVkb1dvcmtlciA9IHJlcXVpcmUoJy4vJyk7XG5cbmlmICh0eXBlb2YgV29ya2VyID09PSAndW5kZWZpbmVkJykge1xuICBnbG9iYWwuV29ya2VyID0gUHNldWRvV29ya2VyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBzZXVkb1dvcmtlcjsiLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxNC1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbi8vIFRoaXMgbWV0aG9kIG9mIG9idGFpbmluZyBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsIG9iamVjdCBuZWVkcyB0byBiZVxuLy8ga2VwdCBpZGVudGljYWwgdG8gdGhlIHdheSBpdCBpcyBvYnRhaW5lZCBpbiBydW50aW1lLmpzXG52YXIgZyA9IChmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMgfSkoKSB8fCBGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCk7XG5cbi8vIFVzZSBgZ2V0T3duUHJvcGVydHlOYW1lc2AgYmVjYXVzZSBub3QgYWxsIGJyb3dzZXJzIHN1cHBvcnQgY2FsbGluZ1xuLy8gYGhhc093blByb3BlcnR5YCBvbiB0aGUgZ2xvYmFsIGBzZWxmYCBvYmplY3QgaW4gYSB3b3JrZXIuIFNlZSAjMTgzLlxudmFyIGhhZFJ1bnRpbWUgPSBnLnJlZ2VuZXJhdG9yUnVudGltZSAmJlxuICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhnKS5pbmRleE9mKFwicmVnZW5lcmF0b3JSdW50aW1lXCIpID49IDA7XG5cbi8vIFNhdmUgdGhlIG9sZCByZWdlbmVyYXRvclJ1bnRpbWUgaW4gY2FzZSBpdCBuZWVkcyB0byBiZSByZXN0b3JlZCBsYXRlci5cbnZhciBvbGRSdW50aW1lID0gaGFkUnVudGltZSAmJiBnLnJlZ2VuZXJhdG9yUnVudGltZTtcblxuLy8gRm9yY2UgcmVldmFsdXRhdGlvbiBvZiBydW50aW1lLmpzLlxuZy5yZWdlbmVyYXRvclJ1bnRpbWUgPSB1bmRlZmluZWQ7XG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4vcnVudGltZVwiKTtcblxuaWYgKGhhZFJ1bnRpbWUpIHtcbiAgLy8gUmVzdG9yZSB0aGUgb3JpZ2luYWwgcnVudGltZS5cbiAgZy5yZWdlbmVyYXRvclJ1bnRpbWUgPSBvbGRSdW50aW1lO1xufSBlbHNlIHtcbiAgLy8gUmVtb3ZlIHRoZSBnbG9iYWwgcHJvcGVydHkgYWRkZWQgYnkgcnVudGltZS5qcy5cbiAgdHJ5IHtcbiAgICBkZWxldGUgZy5yZWdlbmVyYXRvclJ1bnRpbWU7XG4gIH0gY2F0Y2goZSkge1xuICAgIGcucmVnZW5lcmF0b3JSdW50aW1lID0gdW5kZWZpbmVkO1xuICB9XG59XG4iLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxNC1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbiEoZnVuY3Rpb24oZ2xvYmFsKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBPcCA9IE9iamVjdC5wcm90b3R5cGU7XG4gIHZhciBoYXNPd24gPSBPcC5oYXNPd25Qcm9wZXJ0eTtcbiAgdmFyIHVuZGVmaW5lZDsgLy8gTW9yZSBjb21wcmVzc2libGUgdGhhbiB2b2lkIDAuXG4gIHZhciAkU3ltYm9sID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiID8gU3ltYm9sIDoge307XG4gIHZhciBpdGVyYXRvclN5bWJvbCA9ICRTeW1ib2wuaXRlcmF0b3IgfHwgXCJAQGl0ZXJhdG9yXCI7XG4gIHZhciBhc3luY0l0ZXJhdG9yU3ltYm9sID0gJFN5bWJvbC5hc3luY0l0ZXJhdG9yIHx8IFwiQEBhc3luY0l0ZXJhdG9yXCI7XG4gIHZhciB0b1N0cmluZ1RhZ1N5bWJvbCA9ICRTeW1ib2wudG9TdHJpbmdUYWcgfHwgXCJAQHRvU3RyaW5nVGFnXCI7XG5cbiAgdmFyIGluTW9kdWxlID0gdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIjtcbiAgdmFyIHJ1bnRpbWUgPSBnbG9iYWwucmVnZW5lcmF0b3JSdW50aW1lO1xuICBpZiAocnVudGltZSkge1xuICAgIGlmIChpbk1vZHVsZSkge1xuICAgICAgLy8gSWYgcmVnZW5lcmF0b3JSdW50aW1lIGlzIGRlZmluZWQgZ2xvYmFsbHkgYW5kIHdlJ3JlIGluIGEgbW9kdWxlLFxuICAgICAgLy8gbWFrZSB0aGUgZXhwb3J0cyBvYmplY3QgaWRlbnRpY2FsIHRvIHJlZ2VuZXJhdG9yUnVudGltZS5cbiAgICAgIG1vZHVsZS5leHBvcnRzID0gcnVudGltZTtcbiAgICB9XG4gICAgLy8gRG9uJ3QgYm90aGVyIGV2YWx1YXRpbmcgdGhlIHJlc3Qgb2YgdGhpcyBmaWxlIGlmIHRoZSBydW50aW1lIHdhc1xuICAgIC8vIGFscmVhZHkgZGVmaW5lZCBnbG9iYWxseS5cbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBEZWZpbmUgdGhlIHJ1bnRpbWUgZ2xvYmFsbHkgKGFzIGV4cGVjdGVkIGJ5IGdlbmVyYXRlZCBjb2RlKSBhcyBlaXRoZXJcbiAgLy8gbW9kdWxlLmV4cG9ydHMgKGlmIHdlJ3JlIGluIGEgbW9kdWxlKSBvciBhIG5ldywgZW1wdHkgb2JqZWN0LlxuICBydW50aW1lID0gZ2xvYmFsLnJlZ2VuZXJhdG9yUnVudGltZSA9IGluTW9kdWxlID8gbW9kdWxlLmV4cG9ydHMgOiB7fTtcblxuICBmdW5jdGlvbiB3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSB7XG4gICAgLy8gSWYgb3V0ZXJGbiBwcm92aWRlZCBhbmQgb3V0ZXJGbi5wcm90b3R5cGUgaXMgYSBHZW5lcmF0b3IsIHRoZW4gb3V0ZXJGbi5wcm90b3R5cGUgaW5zdGFuY2VvZiBHZW5lcmF0b3IuXG4gICAgdmFyIHByb3RvR2VuZXJhdG9yID0gb3V0ZXJGbiAmJiBvdXRlckZuLnByb3RvdHlwZSBpbnN0YW5jZW9mIEdlbmVyYXRvciA/IG91dGVyRm4gOiBHZW5lcmF0b3I7XG4gICAgdmFyIGdlbmVyYXRvciA9IE9iamVjdC5jcmVhdGUocHJvdG9HZW5lcmF0b3IucHJvdG90eXBlKTtcbiAgICB2YXIgY29udGV4dCA9IG5ldyBDb250ZXh0KHRyeUxvY3NMaXN0IHx8IFtdKTtcblxuICAgIC8vIFRoZSAuX2ludm9rZSBtZXRob2QgdW5pZmllcyB0aGUgaW1wbGVtZW50YXRpb25zIG9mIHRoZSAubmV4dCxcbiAgICAvLyAudGhyb3csIGFuZCAucmV0dXJuIG1ldGhvZHMuXG4gICAgZ2VuZXJhdG9yLl9pbnZva2UgPSBtYWtlSW52b2tlTWV0aG9kKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpO1xuXG4gICAgcmV0dXJuIGdlbmVyYXRvcjtcbiAgfVxuICBydW50aW1lLndyYXAgPSB3cmFwO1xuXG4gIC8vIFRyeS9jYXRjaCBoZWxwZXIgdG8gbWluaW1pemUgZGVvcHRpbWl6YXRpb25zLiBSZXR1cm5zIGEgY29tcGxldGlvblxuICAvLyByZWNvcmQgbGlrZSBjb250ZXh0LnRyeUVudHJpZXNbaV0uY29tcGxldGlvbi4gVGhpcyBpbnRlcmZhY2UgY291bGRcbiAgLy8gaGF2ZSBiZWVuIChhbmQgd2FzIHByZXZpb3VzbHkpIGRlc2lnbmVkIHRvIHRha2UgYSBjbG9zdXJlIHRvIGJlXG4gIC8vIGludm9rZWQgd2l0aG91dCBhcmd1bWVudHMsIGJ1dCBpbiBhbGwgdGhlIGNhc2VzIHdlIGNhcmUgYWJvdXQgd2VcbiAgLy8gYWxyZWFkeSBoYXZlIGFuIGV4aXN0aW5nIG1ldGhvZCB3ZSB3YW50IHRvIGNhbGwsIHNvIHRoZXJlJ3Mgbm8gbmVlZFxuICAvLyB0byBjcmVhdGUgYSBuZXcgZnVuY3Rpb24gb2JqZWN0LiBXZSBjYW4gZXZlbiBnZXQgYXdheSB3aXRoIGFzc3VtaW5nXG4gIC8vIHRoZSBtZXRob2QgdGFrZXMgZXhhY3RseSBvbmUgYXJndW1lbnQsIHNpbmNlIHRoYXQgaGFwcGVucyB0byBiZSB0cnVlXG4gIC8vIGluIGV2ZXJ5IGNhc2UsIHNvIHdlIGRvbid0IGhhdmUgdG8gdG91Y2ggdGhlIGFyZ3VtZW50cyBvYmplY3QuIFRoZVxuICAvLyBvbmx5IGFkZGl0aW9uYWwgYWxsb2NhdGlvbiByZXF1aXJlZCBpcyB0aGUgY29tcGxldGlvbiByZWNvcmQsIHdoaWNoXG4gIC8vIGhhcyBhIHN0YWJsZSBzaGFwZSBhbmQgc28gaG9wZWZ1bGx5IHNob3VsZCBiZSBjaGVhcCB0byBhbGxvY2F0ZS5cbiAgZnVuY3Rpb24gdHJ5Q2F0Y2goZm4sIG9iaiwgYXJnKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwibm9ybWFsXCIsIGFyZzogZm4uY2FsbChvYmosIGFyZykgfTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwidGhyb3dcIiwgYXJnOiBlcnIgfTtcbiAgICB9XG4gIH1cblxuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRTdGFydCA9IFwic3VzcGVuZGVkU3RhcnRcIjtcbiAgdmFyIEdlblN0YXRlU3VzcGVuZGVkWWllbGQgPSBcInN1c3BlbmRlZFlpZWxkXCI7XG4gIHZhciBHZW5TdGF0ZUV4ZWN1dGluZyA9IFwiZXhlY3V0aW5nXCI7XG4gIHZhciBHZW5TdGF0ZUNvbXBsZXRlZCA9IFwiY29tcGxldGVkXCI7XG5cbiAgLy8gUmV0dXJuaW5nIHRoaXMgb2JqZWN0IGZyb20gdGhlIGlubmVyRm4gaGFzIHRoZSBzYW1lIGVmZmVjdCBhc1xuICAvLyBicmVha2luZyBvdXQgb2YgdGhlIGRpc3BhdGNoIHN3aXRjaCBzdGF0ZW1lbnQuXG4gIHZhciBDb250aW51ZVNlbnRpbmVsID0ge307XG5cbiAgLy8gRHVtbXkgY29uc3RydWN0b3IgZnVuY3Rpb25zIHRoYXQgd2UgdXNlIGFzIHRoZSAuY29uc3RydWN0b3IgYW5kXG4gIC8vIC5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgcHJvcGVydGllcyBmb3IgZnVuY3Rpb25zIHRoYXQgcmV0dXJuIEdlbmVyYXRvclxuICAvLyBvYmplY3RzLiBGb3IgZnVsbCBzcGVjIGNvbXBsaWFuY2UsIHlvdSBtYXkgd2lzaCB0byBjb25maWd1cmUgeW91clxuICAvLyBtaW5pZmllciBub3QgdG8gbWFuZ2xlIHRoZSBuYW1lcyBvZiB0aGVzZSB0d28gZnVuY3Rpb25zLlxuICBmdW5jdGlvbiBHZW5lcmF0b3IoKSB7fVxuICBmdW5jdGlvbiBHZW5lcmF0b3JGdW5jdGlvbigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlKCkge31cblxuICAvLyBUaGlzIGlzIGEgcG9seWZpbGwgZm9yICVJdGVyYXRvclByb3RvdHlwZSUgZm9yIGVudmlyb25tZW50cyB0aGF0XG4gIC8vIGRvbid0IG5hdGl2ZWx5IHN1cHBvcnQgaXQuXG4gIHZhciBJdGVyYXRvclByb3RvdHlwZSA9IHt9O1xuICBJdGVyYXRvclByb3RvdHlwZVtpdGVyYXRvclN5bWJvbF0gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgdmFyIGdldFByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mO1xuICB2YXIgTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUgPSBnZXRQcm90byAmJiBnZXRQcm90byhnZXRQcm90byh2YWx1ZXMoW10pKSk7XG4gIGlmIChOYXRpdmVJdGVyYXRvclByb3RvdHlwZSAmJlxuICAgICAgTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUgIT09IE9wICYmXG4gICAgICBoYXNPd24uY2FsbChOYXRpdmVJdGVyYXRvclByb3RvdHlwZSwgaXRlcmF0b3JTeW1ib2wpKSB7XG4gICAgLy8gVGhpcyBlbnZpcm9ubWVudCBoYXMgYSBuYXRpdmUgJUl0ZXJhdG9yUHJvdG90eXBlJTsgdXNlIGl0IGluc3RlYWRcbiAgICAvLyBvZiB0aGUgcG9seWZpbGwuXG4gICAgSXRlcmF0b3JQcm90b3R5cGUgPSBOYXRpdmVJdGVyYXRvclByb3RvdHlwZTtcbiAgfVxuXG4gIHZhciBHcCA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLnByb3RvdHlwZSA9XG4gICAgR2VuZXJhdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSXRlcmF0b3JQcm90b3R5cGUpO1xuICBHZW5lcmF0b3JGdW5jdGlvbi5wcm90b3R5cGUgPSBHcC5jb25zdHJ1Y3RvciA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlO1xuICBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEdlbmVyYXRvckZ1bmN0aW9uO1xuICBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZVt0b1N0cmluZ1RhZ1N5bWJvbF0gPVxuICAgIEdlbmVyYXRvckZ1bmN0aW9uLmRpc3BsYXlOYW1lID0gXCJHZW5lcmF0b3JGdW5jdGlvblwiO1xuXG4gIC8vIEhlbHBlciBmb3IgZGVmaW5pbmcgdGhlIC5uZXh0LCAudGhyb3csIGFuZCAucmV0dXJuIG1ldGhvZHMgb2YgdGhlXG4gIC8vIEl0ZXJhdG9yIGludGVyZmFjZSBpbiB0ZXJtcyBvZiBhIHNpbmdsZSAuX2ludm9rZSBtZXRob2QuXG4gIGZ1bmN0aW9uIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhwcm90b3R5cGUpIHtcbiAgICBbXCJuZXh0XCIsIFwidGhyb3dcIiwgXCJyZXR1cm5cIl0uZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgIHByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24oYXJnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbnZva2UobWV0aG9kLCBhcmcpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIHJ1bnRpbWUuaXNHZW5lcmF0b3JGdW5jdGlvbiA9IGZ1bmN0aW9uKGdlbkZ1bikge1xuICAgIHZhciBjdG9yID0gdHlwZW9mIGdlbkZ1biA9PT0gXCJmdW5jdGlvblwiICYmIGdlbkZ1bi5jb25zdHJ1Y3RvcjtcbiAgICByZXR1cm4gY3RvclxuICAgICAgPyBjdG9yID09PSBHZW5lcmF0b3JGdW5jdGlvbiB8fFxuICAgICAgICAvLyBGb3IgdGhlIG5hdGl2ZSBHZW5lcmF0b3JGdW5jdGlvbiBjb25zdHJ1Y3RvciwgdGhlIGJlc3Qgd2UgY2FuXG4gICAgICAgIC8vIGRvIGlzIHRvIGNoZWNrIGl0cyAubmFtZSBwcm9wZXJ0eS5cbiAgICAgICAgKGN0b3IuZGlzcGxheU5hbWUgfHwgY3Rvci5uYW1lKSA9PT0gXCJHZW5lcmF0b3JGdW5jdGlvblwiXG4gICAgICA6IGZhbHNlO1xuICB9O1xuXG4gIHJ1bnRpbWUubWFyayA9IGZ1bmN0aW9uKGdlbkZ1bikge1xuICAgIGlmIChPYmplY3Quc2V0UHJvdG90eXBlT2YpIHtcbiAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihnZW5GdW4sIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZ2VuRnVuLl9fcHJvdG9fXyA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlO1xuICAgICAgaWYgKCEodG9TdHJpbmdUYWdTeW1ib2wgaW4gZ2VuRnVuKSkge1xuICAgICAgICBnZW5GdW5bdG9TdHJpbmdUYWdTeW1ib2xdID0gXCJHZW5lcmF0b3JGdW5jdGlvblwiO1xuICAgICAgfVxuICAgIH1cbiAgICBnZW5GdW4ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShHcCk7XG4gICAgcmV0dXJuIGdlbkZ1bjtcbiAgfTtcblxuICAvLyBXaXRoaW4gdGhlIGJvZHkgb2YgYW55IGFzeW5jIGZ1bmN0aW9uLCBgYXdhaXQgeGAgaXMgdHJhbnNmb3JtZWQgdG9cbiAgLy8gYHlpZWxkIHJlZ2VuZXJhdG9yUnVudGltZS5hd3JhcCh4KWAsIHNvIHRoYXQgdGhlIHJ1bnRpbWUgY2FuIHRlc3RcbiAgLy8gYGhhc093bi5jYWxsKHZhbHVlLCBcIl9fYXdhaXRcIilgIHRvIGRldGVybWluZSBpZiB0aGUgeWllbGRlZCB2YWx1ZSBpc1xuICAvLyBtZWFudCB0byBiZSBhd2FpdGVkLlxuICBydW50aW1lLmF3cmFwID0gZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIHsgX19hd2FpdDogYXJnIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gQXN5bmNJdGVyYXRvcihnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBpbnZva2UobWV0aG9kLCBhcmcsIHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKGdlbmVyYXRvclttZXRob2RdLCBnZW5lcmF0b3IsIGFyZyk7XG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICByZWplY3QocmVjb3JkLmFyZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcmVzdWx0ID0gcmVjb3JkLmFyZztcbiAgICAgICAgdmFyIHZhbHVlID0gcmVzdWx0LnZhbHVlO1xuICAgICAgICBpZiAodmFsdWUgJiZcbiAgICAgICAgICAgIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJlxuICAgICAgICAgICAgaGFzT3duLmNhbGwodmFsdWUsIFwiX19hd2FpdFwiKSkge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodmFsdWUuX19hd2FpdCkudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgaW52b2tlKFwibmV4dFwiLCB2YWx1ZSwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIGludm9rZShcInRocm93XCIsIGVyciwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodmFsdWUpLnRoZW4oZnVuY3Rpb24odW53cmFwcGVkKSB7XG4gICAgICAgICAgLy8gV2hlbiBhIHlpZWxkZWQgUHJvbWlzZSBpcyByZXNvbHZlZCwgaXRzIGZpbmFsIHZhbHVlIGJlY29tZXNcbiAgICAgICAgICAvLyB0aGUgLnZhbHVlIG9mIHRoZSBQcm9taXNlPHt2YWx1ZSxkb25lfT4gcmVzdWx0IGZvciB0aGVcbiAgICAgICAgICAvLyBjdXJyZW50IGl0ZXJhdGlvbi4gSWYgdGhlIFByb21pc2UgaXMgcmVqZWN0ZWQsIGhvd2V2ZXIsIHRoZVxuICAgICAgICAgIC8vIHJlc3VsdCBmb3IgdGhpcyBpdGVyYXRpb24gd2lsbCBiZSByZWplY3RlZCB3aXRoIHRoZSBzYW1lXG4gICAgICAgICAgLy8gcmVhc29uLiBOb3RlIHRoYXQgcmVqZWN0aW9ucyBvZiB5aWVsZGVkIFByb21pc2VzIGFyZSBub3RcbiAgICAgICAgICAvLyB0aHJvd24gYmFjayBpbnRvIHRoZSBnZW5lcmF0b3IgZnVuY3Rpb24sIGFzIGlzIHRoZSBjYXNlXG4gICAgICAgICAgLy8gd2hlbiBhbiBhd2FpdGVkIFByb21pc2UgaXMgcmVqZWN0ZWQuIFRoaXMgZGlmZmVyZW5jZSBpblxuICAgICAgICAgIC8vIGJlaGF2aW9yIGJldHdlZW4geWllbGQgYW5kIGF3YWl0IGlzIGltcG9ydGFudCwgYmVjYXVzZSBpdFxuICAgICAgICAgIC8vIGFsbG93cyB0aGUgY29uc3VtZXIgdG8gZGVjaWRlIHdoYXQgdG8gZG8gd2l0aCB0aGUgeWllbGRlZFxuICAgICAgICAgIC8vIHJlamVjdGlvbiAoc3dhbGxvdyBpdCBhbmQgY29udGludWUsIG1hbnVhbGx5IC50aHJvdyBpdCBiYWNrXG4gICAgICAgICAgLy8gaW50byB0aGUgZ2VuZXJhdG9yLCBhYmFuZG9uIGl0ZXJhdGlvbiwgd2hhdGV2ZXIpLiBXaXRoXG4gICAgICAgICAgLy8gYXdhaXQsIGJ5IGNvbnRyYXN0LCB0aGVyZSBpcyBubyBvcHBvcnR1bml0eSB0byBleGFtaW5lIHRoZVxuICAgICAgICAgIC8vIHJlamVjdGlvbiByZWFzb24gb3V0c2lkZSB0aGUgZ2VuZXJhdG9yIGZ1bmN0aW9uLCBzbyB0aGVcbiAgICAgICAgICAvLyBvbmx5IG9wdGlvbiBpcyB0byB0aHJvdyBpdCBmcm9tIHRoZSBhd2FpdCBleHByZXNzaW9uLCBhbmRcbiAgICAgICAgICAvLyBsZXQgdGhlIGdlbmVyYXRvciBmdW5jdGlvbiBoYW5kbGUgdGhlIGV4Y2VwdGlvbi5cbiAgICAgICAgICByZXN1bHQudmFsdWUgPSB1bndyYXBwZWQ7XG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9LCByZWplY3QpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBwcmV2aW91c1Byb21pc2U7XG5cbiAgICBmdW5jdGlvbiBlbnF1ZXVlKG1ldGhvZCwgYXJnKSB7XG4gICAgICBmdW5jdGlvbiBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZygpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgIGludm9rZShtZXRob2QsIGFyZywgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwcmV2aW91c1Byb21pc2UgPVxuICAgICAgICAvLyBJZiBlbnF1ZXVlIGhhcyBiZWVuIGNhbGxlZCBiZWZvcmUsIHRoZW4gd2Ugd2FudCB0byB3YWl0IHVudGlsXG4gICAgICAgIC8vIGFsbCBwcmV2aW91cyBQcm9taXNlcyBoYXZlIGJlZW4gcmVzb2x2ZWQgYmVmb3JlIGNhbGxpbmcgaW52b2tlLFxuICAgICAgICAvLyBzbyB0aGF0IHJlc3VsdHMgYXJlIGFsd2F5cyBkZWxpdmVyZWQgaW4gdGhlIGNvcnJlY3Qgb3JkZXIuIElmXG4gICAgICAgIC8vIGVucXVldWUgaGFzIG5vdCBiZWVuIGNhbGxlZCBiZWZvcmUsIHRoZW4gaXQgaXMgaW1wb3J0YW50IHRvXG4gICAgICAgIC8vIGNhbGwgaW52b2tlIGltbWVkaWF0ZWx5LCB3aXRob3V0IHdhaXRpbmcgb24gYSBjYWxsYmFjayB0byBmaXJlLFxuICAgICAgICAvLyBzbyB0aGF0IHRoZSBhc3luYyBnZW5lcmF0b3IgZnVuY3Rpb24gaGFzIHRoZSBvcHBvcnR1bml0eSB0byBkb1xuICAgICAgICAvLyBhbnkgbmVjZXNzYXJ5IHNldHVwIGluIGEgcHJlZGljdGFibGUgd2F5LiBUaGlzIHByZWRpY3RhYmlsaXR5XG4gICAgICAgIC8vIGlzIHdoeSB0aGUgUHJvbWlzZSBjb25zdHJ1Y3RvciBzeW5jaHJvbm91c2x5IGludm9rZXMgaXRzXG4gICAgICAgIC8vIGV4ZWN1dG9yIGNhbGxiYWNrLCBhbmQgd2h5IGFzeW5jIGZ1bmN0aW9ucyBzeW5jaHJvbm91c2x5XG4gICAgICAgIC8vIGV4ZWN1dGUgY29kZSBiZWZvcmUgdGhlIGZpcnN0IGF3YWl0LiBTaW5jZSB3ZSBpbXBsZW1lbnQgc2ltcGxlXG4gICAgICAgIC8vIGFzeW5jIGZ1bmN0aW9ucyBpbiB0ZXJtcyBvZiBhc3luYyBnZW5lcmF0b3JzLCBpdCBpcyBlc3BlY2lhbGx5XG4gICAgICAgIC8vIGltcG9ydGFudCB0byBnZXQgdGhpcyByaWdodCwgZXZlbiB0aG91Z2ggaXQgcmVxdWlyZXMgY2FyZS5cbiAgICAgICAgcHJldmlvdXNQcm9taXNlID8gcHJldmlvdXNQcm9taXNlLnRoZW4oXG4gICAgICAgICAgY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcsXG4gICAgICAgICAgLy8gQXZvaWQgcHJvcGFnYXRpbmcgZmFpbHVyZXMgdG8gUHJvbWlzZXMgcmV0dXJuZWQgYnkgbGF0ZXJcbiAgICAgICAgICAvLyBpbnZvY2F0aW9ucyBvZiB0aGUgaXRlcmF0b3IuXG4gICAgICAgICAgY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmdcbiAgICAgICAgKSA6IGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnKCk7XG4gICAgfVxuXG4gICAgLy8gRGVmaW5lIHRoZSB1bmlmaWVkIGhlbHBlciBtZXRob2QgdGhhdCBpcyB1c2VkIHRvIGltcGxlbWVudCAubmV4dCxcbiAgICAvLyAudGhyb3csIGFuZCAucmV0dXJuIChzZWUgZGVmaW5lSXRlcmF0b3JNZXRob2RzKS5cbiAgICB0aGlzLl9pbnZva2UgPSBlbnF1ZXVlO1xuICB9XG5cbiAgZGVmaW5lSXRlcmF0b3JNZXRob2RzKEFzeW5jSXRlcmF0b3IucHJvdG90eXBlKTtcbiAgQXN5bmNJdGVyYXRvci5wcm90b3R5cGVbYXN5bmNJdGVyYXRvclN5bWJvbF0gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIHJ1bnRpbWUuQXN5bmNJdGVyYXRvciA9IEFzeW5jSXRlcmF0b3I7XG5cbiAgLy8gTm90ZSB0aGF0IHNpbXBsZSBhc3luYyBmdW5jdGlvbnMgYXJlIGltcGxlbWVudGVkIG9uIHRvcCBvZlxuICAvLyBBc3luY0l0ZXJhdG9yIG9iamVjdHM7IHRoZXkganVzdCByZXR1cm4gYSBQcm9taXNlIGZvciB0aGUgdmFsdWUgb2ZcbiAgLy8gdGhlIGZpbmFsIHJlc3VsdCBwcm9kdWNlZCBieSB0aGUgaXRlcmF0b3IuXG4gIHJ1bnRpbWUuYXN5bmMgPSBmdW5jdGlvbihpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCkge1xuICAgIHZhciBpdGVyID0gbmV3IEFzeW5jSXRlcmF0b3IoXG4gICAgICB3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KVxuICAgICk7XG5cbiAgICByZXR1cm4gcnVudGltZS5pc0dlbmVyYXRvckZ1bmN0aW9uKG91dGVyRm4pXG4gICAgICA/IGl0ZXIgLy8gSWYgb3V0ZXJGbiBpcyBhIGdlbmVyYXRvciwgcmV0dXJuIHRoZSBmdWxsIGl0ZXJhdG9yLlxuICAgICAgOiBpdGVyLm5leHQoKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgIHJldHVybiByZXN1bHQuZG9uZSA/IHJlc3VsdC52YWx1ZSA6IGl0ZXIubmV4dCgpO1xuICAgICAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBtYWtlSW52b2tlTWV0aG9kKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpIHtcbiAgICB2YXIgc3RhdGUgPSBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZykge1xuICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZUV4ZWN1dGluZykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBydW5uaW5nXCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlQ29tcGxldGVkKSB7XG4gICAgICAgIGlmIChtZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIHRocm93IGFyZztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJlIGZvcmdpdmluZywgcGVyIDI1LjMuMy4zLjMgb2YgdGhlIHNwZWM6XG4gICAgICAgIC8vIGh0dHBzOi8vcGVvcGxlLm1vemlsbGEub3JnL35qb3JlbmRvcmZmL2VzNi1kcmFmdC5odG1sI3NlYy1nZW5lcmF0b3JyZXN1bWVcbiAgICAgICAgcmV0dXJuIGRvbmVSZXN1bHQoKTtcbiAgICAgIH1cblxuICAgICAgY29udGV4dC5tZXRob2QgPSBtZXRob2Q7XG4gICAgICBjb250ZXh0LmFyZyA9IGFyZztcblxuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgdmFyIGRlbGVnYXRlID0gY29udGV4dC5kZWxlZ2F0ZTtcbiAgICAgICAgaWYgKGRlbGVnYXRlKSB7XG4gICAgICAgICAgdmFyIGRlbGVnYXRlUmVzdWx0ID0gbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCk7XG4gICAgICAgICAgaWYgKGRlbGVnYXRlUmVzdWx0KSB7XG4gICAgICAgICAgICBpZiAoZGVsZWdhdGVSZXN1bHQgPT09IENvbnRpbnVlU2VudGluZWwpIGNvbnRpbnVlO1xuICAgICAgICAgICAgcmV0dXJuIGRlbGVnYXRlUmVzdWx0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJuZXh0XCIpIHtcbiAgICAgICAgICAvLyBTZXR0aW5nIGNvbnRleHQuX3NlbnQgZm9yIGxlZ2FjeSBzdXBwb3J0IG9mIEJhYmVsJ3NcbiAgICAgICAgICAvLyBmdW5jdGlvbi5zZW50IGltcGxlbWVudGF0aW9uLlxuICAgICAgICAgIGNvbnRleHQuc2VudCA9IGNvbnRleHQuX3NlbnQgPSBjb250ZXh0LmFyZztcblxuICAgICAgICB9IGVsc2UgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQpIHtcbiAgICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVDb21wbGV0ZWQ7XG4gICAgICAgICAgICB0aHJvdyBjb250ZXh0LmFyZztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb250ZXh0LmRpc3BhdGNoRXhjZXB0aW9uKGNvbnRleHQuYXJnKTtcblxuICAgICAgICB9IGVsc2UgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInJldHVyblwiKSB7XG4gICAgICAgICAgY29udGV4dC5hYnJ1cHQoXCJyZXR1cm5cIiwgY29udGV4dC5hcmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUV4ZWN1dGluZztcblxuICAgICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goaW5uZXJGbiwgc2VsZiwgY29udGV4dCk7XG4gICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIikge1xuICAgICAgICAgIC8vIElmIGFuIGV4Y2VwdGlvbiBpcyB0aHJvd24gZnJvbSBpbm5lckZuLCB3ZSBsZWF2ZSBzdGF0ZSA9PT1cbiAgICAgICAgICAvLyBHZW5TdGF0ZUV4ZWN1dGluZyBhbmQgbG9vcCBiYWNrIGZvciBhbm90aGVyIGludm9jYXRpb24uXG4gICAgICAgICAgc3RhdGUgPSBjb250ZXh0LmRvbmVcbiAgICAgICAgICAgID8gR2VuU3RhdGVDb21wbGV0ZWRcbiAgICAgICAgICAgIDogR2VuU3RhdGVTdXNwZW5kZWRZaWVsZDtcblxuICAgICAgICAgIGlmIChyZWNvcmQuYXJnID09PSBDb250aW51ZVNlbnRpbmVsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsdWU6IHJlY29yZC5hcmcsXG4gICAgICAgICAgICBkb25lOiBjb250ZXh0LmRvbmVcbiAgICAgICAgICB9O1xuXG4gICAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVDb21wbGV0ZWQ7XG4gICAgICAgICAgLy8gRGlzcGF0Y2ggdGhlIGV4Y2VwdGlvbiBieSBsb29waW5nIGJhY2sgYXJvdW5kIHRvIHRoZVxuICAgICAgICAgIC8vIGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oY29udGV4dC5hcmcpIGNhbGwgYWJvdmUuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSByZWNvcmQuYXJnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8vIENhbGwgZGVsZWdhdGUuaXRlcmF0b3JbY29udGV4dC5tZXRob2RdKGNvbnRleHQuYXJnKSBhbmQgaGFuZGxlIHRoZVxuICAvLyByZXN1bHQsIGVpdGhlciBieSByZXR1cm5pbmcgYSB7IHZhbHVlLCBkb25lIH0gcmVzdWx0IGZyb20gdGhlXG4gIC8vIGRlbGVnYXRlIGl0ZXJhdG9yLCBvciBieSBtb2RpZnlpbmcgY29udGV4dC5tZXRob2QgYW5kIGNvbnRleHQuYXJnLFxuICAvLyBzZXR0aW5nIGNvbnRleHQuZGVsZWdhdGUgdG8gbnVsbCwgYW5kIHJldHVybmluZyB0aGUgQ29udGludWVTZW50aW5lbC5cbiAgZnVuY3Rpb24gbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCkge1xuICAgIHZhciBtZXRob2QgPSBkZWxlZ2F0ZS5pdGVyYXRvcltjb250ZXh0Lm1ldGhvZF07XG4gICAgaWYgKG1ldGhvZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBBIC50aHJvdyBvciAucmV0dXJuIHdoZW4gdGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGhhcyBubyAudGhyb3dcbiAgICAgIC8vIG1ldGhvZCBhbHdheXMgdGVybWluYXRlcyB0aGUgeWllbGQqIGxvb3AuXG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcblxuICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgaWYgKGRlbGVnYXRlLml0ZXJhdG9yLnJldHVybikge1xuICAgICAgICAgIC8vIElmIHRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBoYXMgYSByZXR1cm4gbWV0aG9kLCBnaXZlIGl0IGFcbiAgICAgICAgICAvLyBjaGFuY2UgdG8gY2xlYW4gdXAuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInJldHVyblwiO1xuICAgICAgICAgIGNvbnRleHQuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgICAgIG1heWJlSW52b2tlRGVsZWdhdGUoZGVsZWdhdGUsIGNvbnRleHQpO1xuXG4gICAgICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgIC8vIElmIG1heWJlSW52b2tlRGVsZWdhdGUoY29udGV4dCkgY2hhbmdlZCBjb250ZXh0Lm1ldGhvZCBmcm9tXG4gICAgICAgICAgICAvLyBcInJldHVyblwiIHRvIFwidGhyb3dcIiwgbGV0IHRoYXQgb3ZlcnJpZGUgdGhlIFR5cGVFcnJvciBiZWxvdy5cbiAgICAgICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgICBjb250ZXh0LmFyZyA9IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgXCJUaGUgaXRlcmF0b3IgZG9lcyBub3QgcHJvdmlkZSBhICd0aHJvdycgbWV0aG9kXCIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG5cbiAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2gobWV0aG9kLCBkZWxlZ2F0ZS5pdGVyYXRvciwgY29udGV4dC5hcmcpO1xuXG4gICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgY29udGV4dC5hcmcgPSByZWNvcmQuYXJnO1xuICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG5cbiAgICB2YXIgaW5mbyA9IHJlY29yZC5hcmc7XG5cbiAgICBpZiAoISBpbmZvKSB7XG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgIGNvbnRleHQuYXJnID0gbmV3IFR5cGVFcnJvcihcIml0ZXJhdG9yIHJlc3VsdCBpcyBub3QgYW4gb2JqZWN0XCIpO1xuICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG5cbiAgICBpZiAoaW5mby5kb25lKSB7XG4gICAgICAvLyBBc3NpZ24gdGhlIHJlc3VsdCBvZiB0aGUgZmluaXNoZWQgZGVsZWdhdGUgdG8gdGhlIHRlbXBvcmFyeVxuICAgICAgLy8gdmFyaWFibGUgc3BlY2lmaWVkIGJ5IGRlbGVnYXRlLnJlc3VsdE5hbWUgKHNlZSBkZWxlZ2F0ZVlpZWxkKS5cbiAgICAgIGNvbnRleHRbZGVsZWdhdGUucmVzdWx0TmFtZV0gPSBpbmZvLnZhbHVlO1xuXG4gICAgICAvLyBSZXN1bWUgZXhlY3V0aW9uIGF0IHRoZSBkZXNpcmVkIGxvY2F0aW9uIChzZWUgZGVsZWdhdGVZaWVsZCkuXG4gICAgICBjb250ZXh0Lm5leHQgPSBkZWxlZ2F0ZS5uZXh0TG9jO1xuXG4gICAgICAvLyBJZiBjb250ZXh0Lm1ldGhvZCB3YXMgXCJ0aHJvd1wiIGJ1dCB0aGUgZGVsZWdhdGUgaGFuZGxlZCB0aGVcbiAgICAgIC8vIGV4Y2VwdGlvbiwgbGV0IHRoZSBvdXRlciBnZW5lcmF0b3IgcHJvY2VlZCBub3JtYWxseS4gSWZcbiAgICAgIC8vIGNvbnRleHQubWV0aG9kIHdhcyBcIm5leHRcIiwgZm9yZ2V0IGNvbnRleHQuYXJnIHNpbmNlIGl0IGhhcyBiZWVuXG4gICAgICAvLyBcImNvbnN1bWVkXCIgYnkgdGhlIGRlbGVnYXRlIGl0ZXJhdG9yLiBJZiBjb250ZXh0Lm1ldGhvZCB3YXNcbiAgICAgIC8vIFwicmV0dXJuXCIsIGFsbG93IHRoZSBvcmlnaW5hbCAucmV0dXJuIGNhbGwgdG8gY29udGludWUgaW4gdGhlXG4gICAgICAvLyBvdXRlciBnZW5lcmF0b3IuXG4gICAgICBpZiAoY29udGV4dC5tZXRob2QgIT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgY29udGV4dC5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gUmUteWllbGQgdGhlIHJlc3VsdCByZXR1cm5lZCBieSB0aGUgZGVsZWdhdGUgbWV0aG9kLlxuICAgICAgcmV0dXJuIGluZm87XG4gICAgfVxuXG4gICAgLy8gVGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGlzIGZpbmlzaGVkLCBzbyBmb3JnZXQgaXQgYW5kIGNvbnRpbnVlIHdpdGhcbiAgICAvLyB0aGUgb3V0ZXIgZ2VuZXJhdG9yLlxuICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICB9XG5cbiAgLy8gRGVmaW5lIEdlbmVyYXRvci5wcm90b3R5cGUue25leHQsdGhyb3cscmV0dXJufSBpbiB0ZXJtcyBvZiB0aGVcbiAgLy8gdW5pZmllZCAuX2ludm9rZSBoZWxwZXIgbWV0aG9kLlxuICBkZWZpbmVJdGVyYXRvck1ldGhvZHMoR3ApO1xuXG4gIEdwW3RvU3RyaW5nVGFnU3ltYm9sXSA9IFwiR2VuZXJhdG9yXCI7XG5cbiAgLy8gQSBHZW5lcmF0b3Igc2hvdWxkIGFsd2F5cyByZXR1cm4gaXRzZWxmIGFzIHRoZSBpdGVyYXRvciBvYmplY3Qgd2hlbiB0aGVcbiAgLy8gQEBpdGVyYXRvciBmdW5jdGlvbiBpcyBjYWxsZWQgb24gaXQuIFNvbWUgYnJvd3NlcnMnIGltcGxlbWVudGF0aW9ucyBvZiB0aGVcbiAgLy8gaXRlcmF0b3IgcHJvdG90eXBlIGNoYWluIGluY29ycmVjdGx5IGltcGxlbWVudCB0aGlzLCBjYXVzaW5nIHRoZSBHZW5lcmF0b3JcbiAgLy8gb2JqZWN0IHRvIG5vdCBiZSByZXR1cm5lZCBmcm9tIHRoaXMgY2FsbC4gVGhpcyBlbnN1cmVzIHRoYXQgZG9lc24ndCBoYXBwZW4uXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svcmVnZW5lcmF0b3IvaXNzdWVzLzI3NCBmb3IgbW9yZSBkZXRhaWxzLlxuICBHcFtpdGVyYXRvclN5bWJvbF0gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBHcC50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBcIltvYmplY3QgR2VuZXJhdG9yXVwiO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHB1c2hUcnlFbnRyeShsb2NzKSB7XG4gICAgdmFyIGVudHJ5ID0geyB0cnlMb2M6IGxvY3NbMF0gfTtcblxuICAgIGlmICgxIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmNhdGNoTG9jID0gbG9jc1sxXTtcbiAgICB9XG5cbiAgICBpZiAoMiBpbiBsb2NzKSB7XG4gICAgICBlbnRyeS5maW5hbGx5TG9jID0gbG9jc1syXTtcbiAgICAgIGVudHJ5LmFmdGVyTG9jID0gbG9jc1szXTtcbiAgICB9XG5cbiAgICB0aGlzLnRyeUVudHJpZXMucHVzaChlbnRyeSk7XG4gIH1cblxuICBmdW5jdGlvbiByZXNldFRyeUVudHJ5KGVudHJ5KSB7XG4gICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb24gfHwge307XG4gICAgcmVjb3JkLnR5cGUgPSBcIm5vcm1hbFwiO1xuICAgIGRlbGV0ZSByZWNvcmQuYXJnO1xuICAgIGVudHJ5LmNvbXBsZXRpb24gPSByZWNvcmQ7XG4gIH1cblxuICBmdW5jdGlvbiBDb250ZXh0KHRyeUxvY3NMaXN0KSB7XG4gICAgLy8gVGhlIHJvb3QgZW50cnkgb2JqZWN0IChlZmZlY3RpdmVseSBhIHRyeSBzdGF0ZW1lbnQgd2l0aG91dCBhIGNhdGNoXG4gICAgLy8gb3IgYSBmaW5hbGx5IGJsb2NrKSBnaXZlcyB1cyBhIHBsYWNlIHRvIHN0b3JlIHZhbHVlcyB0aHJvd24gZnJvbVxuICAgIC8vIGxvY2F0aW9ucyB3aGVyZSB0aGVyZSBpcyBubyBlbmNsb3NpbmcgdHJ5IHN0YXRlbWVudC5cbiAgICB0aGlzLnRyeUVudHJpZXMgPSBbeyB0cnlMb2M6IFwicm9vdFwiIH1dO1xuICAgIHRyeUxvY3NMaXN0LmZvckVhY2gocHVzaFRyeUVudHJ5LCB0aGlzKTtcbiAgICB0aGlzLnJlc2V0KHRydWUpO1xuICB9XG5cbiAgcnVudGltZS5rZXlzID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICB9XG4gICAga2V5cy5yZXZlcnNlKCk7XG5cbiAgICAvLyBSYXRoZXIgdGhhbiByZXR1cm5pbmcgYW4gb2JqZWN0IHdpdGggYSBuZXh0IG1ldGhvZCwgd2Uga2VlcFxuICAgIC8vIHRoaW5ncyBzaW1wbGUgYW5kIHJldHVybiB0aGUgbmV4dCBmdW5jdGlvbiBpdHNlbGYuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICB3aGlsZSAoa2V5cy5sZW5ndGgpIHtcbiAgICAgICAgdmFyIGtleSA9IGtleXMucG9wKCk7XG4gICAgICAgIGlmIChrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgbmV4dC52YWx1ZSA9IGtleTtcbiAgICAgICAgICBuZXh0LmRvbmUgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUbyBhdm9pZCBjcmVhdGluZyBhbiBhZGRpdGlvbmFsIG9iamVjdCwgd2UganVzdCBoYW5nIHRoZSAudmFsdWVcbiAgICAgIC8vIGFuZCAuZG9uZSBwcm9wZXJ0aWVzIG9mZiB0aGUgbmV4dCBmdW5jdGlvbiBvYmplY3QgaXRzZWxmLiBUaGlzXG4gICAgICAvLyBhbHNvIGVuc3VyZXMgdGhhdCB0aGUgbWluaWZpZXIgd2lsbCBub3QgYW5vbnltaXplIHRoZSBmdW5jdGlvbi5cbiAgICAgIG5leHQuZG9uZSA9IHRydWU7XG4gICAgICByZXR1cm4gbmV4dDtcbiAgICB9O1xuICB9O1xuXG4gIGZ1bmN0aW9uIHZhbHVlcyhpdGVyYWJsZSkge1xuICAgIGlmIChpdGVyYWJsZSkge1xuICAgICAgdmFyIGl0ZXJhdG9yTWV0aG9kID0gaXRlcmFibGVbaXRlcmF0b3JTeW1ib2xdO1xuICAgICAgaWYgKGl0ZXJhdG9yTWV0aG9kKSB7XG4gICAgICAgIHJldHVybiBpdGVyYXRvck1ldGhvZC5jYWxsKGl0ZXJhYmxlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBpdGVyYWJsZS5uZXh0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhYmxlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWlzTmFOKGl0ZXJhYmxlLmxlbmd0aCkpIHtcbiAgICAgICAgdmFyIGkgPSAtMSwgbmV4dCA9IGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAgICAgd2hpbGUgKCsraSA8IGl0ZXJhYmxlLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKGhhc093bi5jYWxsKGl0ZXJhYmxlLCBpKSkge1xuICAgICAgICAgICAgICBuZXh0LnZhbHVlID0gaXRlcmFibGVbaV07XG4gICAgICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZXh0LnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICAgIG5leHQuZG9uZSA9IHRydWU7XG5cbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gbmV4dC5uZXh0ID0gbmV4dDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gYW4gaXRlcmF0b3Igd2l0aCBubyB2YWx1ZXMuXG4gICAgcmV0dXJuIHsgbmV4dDogZG9uZVJlc3VsdCB9O1xuICB9XG4gIHJ1bnRpbWUudmFsdWVzID0gdmFsdWVzO1xuXG4gIGZ1bmN0aW9uIGRvbmVSZXN1bHQoKSB7XG4gICAgcmV0dXJuIHsgdmFsdWU6IHVuZGVmaW5lZCwgZG9uZTogdHJ1ZSB9O1xuICB9XG5cbiAgQ29udGV4dC5wcm90b3R5cGUgPSB7XG4gICAgY29uc3RydWN0b3I6IENvbnRleHQsXG5cbiAgICByZXNldDogZnVuY3Rpb24oc2tpcFRlbXBSZXNldCkge1xuICAgICAgdGhpcy5wcmV2ID0gMDtcbiAgICAgIHRoaXMubmV4dCA9IDA7XG4gICAgICAvLyBSZXNldHRpbmcgY29udGV4dC5fc2VudCBmb3IgbGVnYWN5IHN1cHBvcnQgb2YgQmFiZWwnc1xuICAgICAgLy8gZnVuY3Rpb24uc2VudCBpbXBsZW1lbnRhdGlvbi5cbiAgICAgIHRoaXMuc2VudCA9IHRoaXMuX3NlbnQgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLmRvbmUgPSBmYWxzZTtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICB0aGlzLm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgdGhpcy5hcmcgPSB1bmRlZmluZWQ7XG5cbiAgICAgIHRoaXMudHJ5RW50cmllcy5mb3JFYWNoKHJlc2V0VHJ5RW50cnkpO1xuXG4gICAgICBpZiAoIXNraXBUZW1wUmVzZXQpIHtcbiAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzKSB7XG4gICAgICAgICAgLy8gTm90IHN1cmUgYWJvdXQgdGhlIG9wdGltYWwgb3JkZXIgb2YgdGhlc2UgY29uZGl0aW9uczpcbiAgICAgICAgICBpZiAobmFtZS5jaGFyQXQoMCkgPT09IFwidFwiICYmXG4gICAgICAgICAgICAgIGhhc093bi5jYWxsKHRoaXMsIG5hbWUpICYmXG4gICAgICAgICAgICAgICFpc05hTigrbmFtZS5zbGljZSgxKSkpIHtcbiAgICAgICAgICAgIHRoaXNbbmFtZV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcblxuICAgICAgdmFyIHJvb3RFbnRyeSA9IHRoaXMudHJ5RW50cmllc1swXTtcbiAgICAgIHZhciByb290UmVjb3JkID0gcm9vdEVudHJ5LmNvbXBsZXRpb247XG4gICAgICBpZiAocm9vdFJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcm9vdFJlY29yZC5hcmc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJ2YWw7XG4gICAgfSxcblxuICAgIGRpc3BhdGNoRXhjZXB0aW9uOiBmdW5jdGlvbihleGNlcHRpb24pIHtcbiAgICAgIGlmICh0aGlzLmRvbmUpIHtcbiAgICAgICAgdGhyb3cgZXhjZXB0aW9uO1xuICAgICAgfVxuXG4gICAgICB2YXIgY29udGV4dCA9IHRoaXM7XG4gICAgICBmdW5jdGlvbiBoYW5kbGUobG9jLCBjYXVnaHQpIHtcbiAgICAgICAgcmVjb3JkLnR5cGUgPSBcInRocm93XCI7XG4gICAgICAgIHJlY29yZC5hcmcgPSBleGNlcHRpb247XG4gICAgICAgIGNvbnRleHQubmV4dCA9IGxvYztcblxuICAgICAgICBpZiAoY2F1Z2h0KSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGRpc3BhdGNoZWQgZXhjZXB0aW9uIHdhcyBjYXVnaHQgYnkgYSBjYXRjaCBibG9jayxcbiAgICAgICAgICAvLyB0aGVuIGxldCB0aGF0IGNhdGNoIGJsb2NrIGhhbmRsZSB0aGUgZXhjZXB0aW9uIG5vcm1hbGx5LlxuICAgICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gISEgY2F1Z2h0O1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb247XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA9PT0gXCJyb290XCIpIHtcbiAgICAgICAgICAvLyBFeGNlcHRpb24gdGhyb3duIG91dHNpZGUgb2YgYW55IHRyeSBibG9jayB0aGF0IGNvdWxkIGhhbmRsZVxuICAgICAgICAgIC8vIGl0LCBzbyBzZXQgdGhlIGNvbXBsZXRpb24gdmFsdWUgb2YgdGhlIGVudGlyZSBmdW5jdGlvbiB0b1xuICAgICAgICAgIC8vIHRocm93IHRoZSBleGNlcHRpb24uXG4gICAgICAgICAgcmV0dXJuIGhhbmRsZShcImVuZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPD0gdGhpcy5wcmV2KSB7XG4gICAgICAgICAgdmFyIGhhc0NhdGNoID0gaGFzT3duLmNhbGwoZW50cnksIFwiY2F0Y2hMb2NcIik7XG4gICAgICAgICAgdmFyIGhhc0ZpbmFsbHkgPSBoYXNPd24uY2FsbChlbnRyeSwgXCJmaW5hbGx5TG9jXCIpO1xuXG4gICAgICAgICAgaWYgKGhhc0NhdGNoICYmIGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5jYXRjaExvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmNhdGNoTG9jLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmZpbmFsbHlMb2MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIGlmIChoYXNDYXRjaCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIGlmIChoYXNGaW5hbGx5KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmZpbmFsbHlMb2MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInRyeSBzdGF0ZW1lbnQgd2l0aG91dCBjYXRjaCBvciBmaW5hbGx5XCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBhYnJ1cHQ6IGZ1bmN0aW9uKHR5cGUsIGFyZykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPD0gdGhpcy5wcmV2ICYmXG4gICAgICAgICAgICBoYXNPd24uY2FsbChlbnRyeSwgXCJmaW5hbGx5TG9jXCIpICYmXG4gICAgICAgICAgICB0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgdmFyIGZpbmFsbHlFbnRyeSA9IGVudHJ5O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkgJiZcbiAgICAgICAgICAodHlwZSA9PT0gXCJicmVha1wiIHx8XG4gICAgICAgICAgIHR5cGUgPT09IFwiY29udGludWVcIikgJiZcbiAgICAgICAgICBmaW5hbGx5RW50cnkudHJ5TG9jIDw9IGFyZyAmJlxuICAgICAgICAgIGFyZyA8PSBmaW5hbGx5RW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAvLyBJZ25vcmUgdGhlIGZpbmFsbHkgZW50cnkgaWYgY29udHJvbCBpcyBub3QganVtcGluZyB0byBhXG4gICAgICAgIC8vIGxvY2F0aW9uIG91dHNpZGUgdGhlIHRyeS9jYXRjaCBibG9jay5cbiAgICAgICAgZmluYWxseUVudHJ5ID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlY29yZCA9IGZpbmFsbHlFbnRyeSA/IGZpbmFsbHlFbnRyeS5jb21wbGV0aW9uIDoge307XG4gICAgICByZWNvcmQudHlwZSA9IHR5cGU7XG4gICAgICByZWNvcmQuYXJnID0gYXJnO1xuXG4gICAgICBpZiAoZmluYWxseUVudHJ5KSB7XG4gICAgICAgIHRoaXMubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgIHRoaXMubmV4dCA9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jO1xuICAgICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuY29tcGxldGUocmVjb3JkKTtcbiAgICB9LFxuXG4gICAgY29tcGxldGU6IGZ1bmN0aW9uKHJlY29yZCwgYWZ0ZXJMb2MpIHtcbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHRocm93IHJlY29yZC5hcmc7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJicmVha1wiIHx8XG4gICAgICAgICAgcmVjb3JkLnR5cGUgPT09IFwiY29udGludWVcIikge1xuICAgICAgICB0aGlzLm5leHQgPSByZWNvcmQuYXJnO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICB0aGlzLnJ2YWwgPSB0aGlzLmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgIHRoaXMubWV0aG9kID0gXCJyZXR1cm5cIjtcbiAgICAgICAgdGhpcy5uZXh0ID0gXCJlbmRcIjtcbiAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwibm9ybWFsXCIgJiYgYWZ0ZXJMb2MpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gYWZ0ZXJMb2M7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH0sXG5cbiAgICBmaW5pc2g6IGZ1bmN0aW9uKGZpbmFsbHlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkuZmluYWxseUxvYyA9PT0gZmluYWxseUxvYykge1xuICAgICAgICAgIHRoaXMuY29tcGxldGUoZW50cnkuY29tcGxldGlvbiwgZW50cnkuYWZ0ZXJMb2MpO1xuICAgICAgICAgIHJlc2V0VHJ5RW50cnkoZW50cnkpO1xuICAgICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIFwiY2F0Y2hcIjogZnVuY3Rpb24odHJ5TG9jKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA9PT0gdHJ5TG9jKSB7XG4gICAgICAgICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb247XG4gICAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgIHZhciB0aHJvd24gPSByZWNvcmQuYXJnO1xuICAgICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aHJvd247XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVGhlIGNvbnRleHQuY2F0Y2ggbWV0aG9kIG11c3Qgb25seSBiZSBjYWxsZWQgd2l0aCBhIGxvY2F0aW9uXG4gICAgICAvLyBhcmd1bWVudCB0aGF0IGNvcnJlc3BvbmRzIHRvIGEga25vd24gY2F0Y2ggYmxvY2suXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbGxlZ2FsIGNhdGNoIGF0dGVtcHRcIik7XG4gICAgfSxcblxuICAgIGRlbGVnYXRlWWllbGQ6IGZ1bmN0aW9uKGl0ZXJhYmxlLCByZXN1bHROYW1lLCBuZXh0TG9jKSB7XG4gICAgICB0aGlzLmRlbGVnYXRlID0ge1xuICAgICAgICBpdGVyYXRvcjogdmFsdWVzKGl0ZXJhYmxlKSxcbiAgICAgICAgcmVzdWx0TmFtZTogcmVzdWx0TmFtZSxcbiAgICAgICAgbmV4dExvYzogbmV4dExvY1xuICAgICAgfTtcblxuICAgICAgaWYgKHRoaXMubWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAvLyBEZWxpYmVyYXRlbHkgZm9yZ2V0IHRoZSBsYXN0IHNlbnQgdmFsdWUgc28gdGhhdCB3ZSBkb24ndFxuICAgICAgICAvLyBhY2NpZGVudGFsbHkgcGFzcyBpdCBvbiB0byB0aGUgZGVsZWdhdGUuXG4gICAgICAgIHRoaXMuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG4gIH07XG59KShcbiAgLy8gSW4gc2xvcHB5IG1vZGUsIHVuYm91bmQgYHRoaXNgIHJlZmVycyB0byB0aGUgZ2xvYmFsIG9iamVjdCwgZmFsbGJhY2sgdG9cbiAgLy8gRnVuY3Rpb24gY29uc3RydWN0b3IgaWYgd2UncmUgaW4gZ2xvYmFsIHN0cmljdCBtb2RlLiBUaGF0IGlzIHNhZGx5IGEgZm9ybVxuICAvLyBvZiBpbmRpcmVjdCBldmFsIHdoaWNoIHZpb2xhdGVzIENvbnRlbnQgU2VjdXJpdHkgUG9saWN5LlxuICAoZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzIH0pKCkgfHwgRnVuY3Rpb24oXCJyZXR1cm4gdGhpc1wiKSgpXG4pO1xuIiwiXG4vKipcbiAqIE1vZHVsZSBEZXBlbmRlbmNpZXNcbiAqL1xuXG52YXIgZXhwcjtcbnRyeSB7XG4gIGV4cHIgPSByZXF1aXJlKCdwcm9wcycpO1xufSBjYXRjaChlKSB7XG4gIGV4cHIgPSByZXF1aXJlKCdjb21wb25lbnQtcHJvcHMnKTtcbn1cblxuLyoqXG4gKiBFeHBvc2UgYHRvRnVuY3Rpb24oKWAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB0b0Z1bmN0aW9uO1xuXG4vKipcbiAqIENvbnZlcnQgYG9iamAgdG8gYSBgRnVuY3Rpb25gLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IG9ialxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiB0b0Z1bmN0aW9uKG9iaikge1xuICBzd2l0Y2ggKHt9LnRvU3RyaW5nLmNhbGwob2JqKSkge1xuICAgIGNhc2UgJ1tvYmplY3QgT2JqZWN0XSc6XG4gICAgICByZXR1cm4gb2JqZWN0VG9GdW5jdGlvbihvYmopO1xuICAgIGNhc2UgJ1tvYmplY3QgRnVuY3Rpb25dJzpcbiAgICAgIHJldHVybiBvYmo7XG4gICAgY2FzZSAnW29iamVjdCBTdHJpbmddJzpcbiAgICAgIHJldHVybiBzdHJpbmdUb0Z1bmN0aW9uKG9iaik7XG4gICAgY2FzZSAnW29iamVjdCBSZWdFeHBdJzpcbiAgICAgIHJldHVybiByZWdleHBUb0Z1bmN0aW9uKG9iaik7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBkZWZhdWx0VG9GdW5jdGlvbihvYmopO1xuICB9XG59XG5cbi8qKlxuICogRGVmYXVsdCB0byBzdHJpY3QgZXF1YWxpdHkuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGRlZmF1bHRUb0Z1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqKXtcbiAgICByZXR1cm4gdmFsID09PSBvYmo7XG4gIH07XG59XG5cbi8qKlxuICogQ29udmVydCBgcmVgIHRvIGEgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtSZWdFeHB9IHJlXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHJlZ2V4cFRvRnVuY3Rpb24ocmUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iail7XG4gICAgcmV0dXJuIHJlLnRlc3Qob2JqKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IHByb3BlcnR5IGBzdHJgIHRvIGEgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzdHJpbmdUb0Z1bmN0aW9uKHN0cikge1xuICAvLyBpbW1lZGlhdGUgc3VjaCBhcyBcIj4gMjBcIlxuICBpZiAoL14gKlxcVysvLnRlc3Qoc3RyKSkgcmV0dXJuIG5ldyBGdW5jdGlvbignXycsICdyZXR1cm4gXyAnICsgc3RyKTtcblxuICAvLyBwcm9wZXJ0aWVzIHN1Y2ggYXMgXCJuYW1lLmZpcnN0XCIgb3IgXCJhZ2UgPiAxOFwiIG9yIFwiYWdlID4gMTggJiYgYWdlIDwgMzZcIlxuICByZXR1cm4gbmV3IEZ1bmN0aW9uKCdfJywgJ3JldHVybiAnICsgZ2V0KHN0cikpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYG9iamVjdGAgdG8gYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0XG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG9iamVjdFRvRnVuY3Rpb24ob2JqKSB7XG4gIHZhciBtYXRjaCA9IHt9O1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgbWF0Y2hba2V5XSA9IHR5cGVvZiBvYmpba2V5XSA9PT0gJ3N0cmluZydcbiAgICAgID8gZGVmYXVsdFRvRnVuY3Rpb24ob2JqW2tleV0pXG4gICAgICA6IHRvRnVuY3Rpb24ob2JqW2tleV0pO1xuICB9XG4gIHJldHVybiBmdW5jdGlvbih2YWwpe1xuICAgIGlmICh0eXBlb2YgdmFsICE9PSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xuICAgIGZvciAodmFyIGtleSBpbiBtYXRjaCkge1xuICAgICAgaWYgKCEoa2V5IGluIHZhbCkpIHJldHVybiBmYWxzZTtcbiAgICAgIGlmICghbWF0Y2hba2V5XSh2YWxba2V5XSkpIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG59XG5cbi8qKlxuICogQnVpbHQgdGhlIGdldHRlciBmdW5jdGlvbi4gU3VwcG9ydHMgZ2V0dGVyIHN0eWxlIGZ1bmN0aW9uc1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGdldChzdHIpIHtcbiAgdmFyIHByb3BzID0gZXhwcihzdHIpO1xuICBpZiAoIXByb3BzLmxlbmd0aCkgcmV0dXJuICdfLicgKyBzdHI7XG5cbiAgdmFyIHZhbCwgaSwgcHJvcDtcbiAgZm9yIChpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgcHJvcCA9IHByb3BzW2ldO1xuICAgIHZhbCA9ICdfLicgKyBwcm9wO1xuICAgIHZhbCA9IFwiKCdmdW5jdGlvbicgPT0gdHlwZW9mIFwiICsgdmFsICsgXCIgPyBcIiArIHZhbCArIFwiKCkgOiBcIiArIHZhbCArIFwiKVwiO1xuXG4gICAgLy8gbWltaWMgbmVnYXRpdmUgbG9va2JlaGluZCB0byBhdm9pZCBwcm9ibGVtcyB3aXRoIG5lc3RlZCBwcm9wZXJ0aWVzXG4gICAgc3RyID0gc3RyaXBOZXN0ZWQocHJvcCwgc3RyLCB2YWwpO1xuICB9XG5cbiAgcmV0dXJuIHN0cjtcbn1cblxuLyoqXG4gKiBNaW1pYyBuZWdhdGl2ZSBsb29rYmVoaW5kIHRvIGF2b2lkIHByb2JsZW1zIHdpdGggbmVzdGVkIHByb3BlcnRpZXMuXG4gKlxuICogU2VlOiBodHRwOi8vYmxvZy5zdGV2ZW5sZXZpdGhhbi5jb20vYXJjaGl2ZXMvbWltaWMtbG9va2JlaGluZC1qYXZhc2NyaXB0XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHN0cmlwTmVzdGVkIChwcm9wLCBzdHIsIHZhbCkge1xuICByZXR1cm4gc3RyLnJlcGxhY2UobmV3IFJlZ0V4cCgnKFxcXFwuKT8nICsgcHJvcCwgJ2cnKSwgZnVuY3Rpb24oJDAsICQxKSB7XG4gICAgcmV0dXJuICQxID8gJDAgOiB2YWw7XG4gIH0pO1xufVxuIiwiaW1wb3J0IEluTWVtb3J5QWRhcHRlciBmcm9tICcuL2lubWVtb3J5JztcbmltcG9ydCBMb2NhbFN0b3JhZ2VBZGFwdGVyIGZyb20gJy4vbG9jYWxzdG9yYWdlJztcblxuZXhwb3J0IHsgSW5NZW1vcnlBZGFwdGVyLCBMb2NhbFN0b3JhZ2VBZGFwdGVyIH07XG4iLCIvLyBAZmxvd1xuaW1wb3J0IHR5cGUgeyBJU3RvcmFnZSB9IGZyb20gJy4uL2ludGVyZmFjZXMvc3RvcmFnZSc7XG5pbXBvcnQgdHlwZSB7IElDb25maWcgfSBmcm9tICcuLi9pbnRlcmZhY2VzL2NvbmZpZyc7XG5pbXBvcnQgdHlwZSBJVGFzayBmcm9tICcuLi9pbnRlcmZhY2VzL3Rhc2snO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbk1lbW9yeUFkYXB0ZXIgaW1wbGVtZW50cyBJU3RvcmFnZSB7XG4gIGNvbmZpZzogSUNvbmZpZztcbiAgcHJlZml4OiBzdHJpbmc7XG4gIHN0b3JlOiB7IFtwcm9wOiBzdHJpbmddOiBhbnkgfSA9IHt9O1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogSUNvbmZpZykge1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgIHRoaXMucHJlZml4ID0gdGhpcy5jb25maWcuZ2V0KCdwcmVmaXgnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlIGl0ZW0gZnJvbSBzdG9yZSBieSBrZXlcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7UHJvbWlzZTxJVGFzaz59IChhcnJheSlcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGdldChuYW1lOiBzdHJpbmcpOiBQcm9taXNlPElUYXNrW10+IHtcbiAgICBjb25zdCBjb2xsTmFtZSA9IHRoaXMuc3RvcmFnZU5hbWUobmFtZSk7XG4gICAgcmV0dXJuIFsuLi50aGlzLmdldENvbGxlY3Rpb24oY29sbE5hbWUpXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgaXRlbSB0byBzdG9yZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHZhbHVlXG4gICAqIEByZXR1cm4ge1Byb21pc2U8QW55Pn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIHNldChrZXk6IHN0cmluZywgdmFsdWU6IGFueVtdKTogUHJvbWlzZTxhbnk+IHtcbiAgICB0aGlzLnN0b3JlW3RoaXMuc3RvcmFnZU5hbWUoa2V5KV0gPSBbLi4udmFsdWVdO1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdGVtIGNoZWNrZXIgaW4gc3RvcmVcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7UHJvbWlzZTxCb29sZWFuPn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGhhcyhrZXk6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5zdG9yZSwgdGhpcy5zdG9yYWdlTmFtZShrZXkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgaXRlbVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtQcm9taXNlPEFueT59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBjbGVhcihrZXk6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gKGF3YWl0IHRoaXMuaGFzKGtleSkpID8gZGVsZXRlIHRoaXMuc3RvcmVbdGhpcy5zdG9yYWdlTmFtZShrZXkpXSA6IGZhbHNlO1xuICAgIHRoaXMuc3RvcmUgPSB7IC4uLnRoaXMuc3RvcmUgfTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXBvc2UgY29sbGVjdGlvbiBuYW1lIGJ5IHN1ZmZpeFxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHN1ZmZpeFxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBzdG9yYWdlTmFtZShzdWZmaXg6IHN0cmluZykge1xuICAgIHJldHVybiBzdWZmaXguc3RhcnRzV2l0aCh0aGlzLmdldFByZWZpeCgpKSA/IHN1ZmZpeCA6IGAke3RoaXMuZ2V0UHJlZml4KCl9XyR7c3VmZml4fWA7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHByZWZpeCBvZiBjaGFubmVsIGNvbGxlY3Rpb25cbiAgICpcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgZ2V0UHJlZml4KCkge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZy5nZXQoJ3ByZWZpeCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjb2xsZWN0aW9uXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cbiAgZ2V0Q29sbGVjdGlvbihuYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBoYXMgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5zdG9yZSwgbmFtZSk7XG4gICAgaWYgKCFoYXMpIHRoaXMuc3RvcmVbbmFtZV0gPSBbXTtcbiAgICByZXR1cm4gdGhpcy5zdG9yZVtuYW1lXTtcbiAgfVxufVxuIiwiLy8gQGZsb3dcbmltcG9ydCB0eXBlIHsgSVN0b3JhZ2UgfSBmcm9tICcuLi9pbnRlcmZhY2VzL3N0b3JhZ2UnO1xuaW1wb3J0IHR5cGUgeyBJQ29uZmlnIH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9jb25maWcnO1xuaW1wb3J0IHR5cGUgSVRhc2sgZnJvbSAnLi4vaW50ZXJmYWNlcy90YXNrJztcblxuLyogZ2xvYmFsIGxvY2FsU3RvcmFnZSAqL1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMb2NhbFN0b3JhZ2VBZGFwdGVyIGltcGxlbWVudHMgSVN0b3JhZ2Uge1xuICBjb25maWc6IElDb25maWc7XG4gIHByZWZpeDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogSUNvbmZpZykge1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgIHRoaXMucHJlZml4ID0gdGhpcy5jb25maWcuZ2V0KCdwcmVmaXgnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlIGl0ZW0gZnJvbSBsb2NhbCBzdG9yYWdlIGJ5IGtleVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtQcm9taXNlPElUYXNrPn0gKGFycmF5KVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgZ2V0KG5hbWU6IHN0cmluZyk6IFByb21pc2U8SVRhc2tbXT4ge1xuICAgIGNvbnN0IHJlc3VsdDogYW55ID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5zdG9yYWdlTmFtZShuYW1lKSk7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UocmVzdWx0KSB8fCBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgaXRlbSB0byBsb2NhbCBzdG9yYWdlXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSAge1N0cmluZ30gdmFsdWVcbiAgICogQHJldHVybiB7UHJvbWlzZTxBbnk+fVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogYW55W10pOiBQcm9taXNlPGFueT4ge1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuc3RvcmFnZU5hbWUoa2V5KSwgSlNPTi5zdHJpbmdpZnkodmFsdWUpKTtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogSXRlbSBjaGVja2VyIGluIGxvY2FsIHN0b3JhZ2VcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7UHJvbWlzZTxCb29sZWFuPn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGhhcyhrZXk6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobG9jYWxTdG9yYWdlLCB0aGlzLnN0b3JhZ2VOYW1lKGtleSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBpdGVtXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge1Byb21pc2U8QW55Pn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGNsZWFyKGtleTogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCByZXN1bHQgPSAoYXdhaXQgdGhpcy5oYXMoa2V5KSkgPyBkZWxldGUgbG9jYWxTdG9yYWdlW3RoaXMuc3RvcmFnZU5hbWUoa2V5KV0gOiBmYWxzZTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXBvc2UgY29sbGVjdGlvbiBuYW1lIGJ5IHN1ZmZpeFxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHN1ZmZpeFxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBzdG9yYWdlTmFtZShzdWZmaXg6IHN0cmluZykge1xuICAgIHJldHVybiBzdWZmaXguc3RhcnRzV2l0aCh0aGlzLmdldFByZWZpeCgpKSA/IHN1ZmZpeCA6IGAke3RoaXMuZ2V0UHJlZml4KCl9XyR7c3VmZml4fWA7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHByZWZpeCBvZiBjaGFubmVsIGNvbGxlY3Rpb25cbiAgICpcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgZ2V0UHJlZml4KCkge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZy5nZXQoJ3ByZWZpeCcpO1xuICB9XG59XG4iLCIvLyBAZmxvd1xuaW1wb3J0IHR5cGUgSVRhc2sgZnJvbSAnLi9pbnRlcmZhY2VzL3Rhc2snO1xuaW1wb3J0IHR5cGUgSUNvbmZpZyBmcm9tICcuL2ludGVyZmFjZXMvY29uZmlnJztcbmltcG9ydCBFdmVudCBmcm9tICcuL2V2ZW50JztcbmltcG9ydCBTdG9yYWdlQ2Fwc3VsZSBmcm9tICcuL3N0b3JhZ2UtY2Fwc3VsZSc7XG5pbXBvcnQgUXVldWUgZnJvbSAnLi9xdWV1ZSc7XG5pbXBvcnQgeyB1dGlsQ2xlYXJCeVRhZyB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtcbiAgZGIsXG4gIGNhbk11bHRpcGxlLFxuICBzYXZlVGFzayxcbiAgbG9nUHJveHksXG4gIGNyZWF0ZVRpbWVvdXQsXG4gIHN0YXR1c09mZixcbiAgc3RvcFF1ZXVlLFxuICBnZXRUYXNrc1dpdGhvdXRGcmVlemVkLFxufSBmcm9tICcuL2hlbHBlcnMnO1xuaW1wb3J0IHtcbiAgdGFza0FkZGVkTG9nLFxuICBuZXh0VGFza0xvZyxcbiAgcXVldWVTdG9wcGluZ0xvZyxcbiAgcXVldWVTdGFydExvZyxcbiAgZXZlbnRDcmVhdGVkTG9nLFxufSBmcm9tICcuL2NvbnNvbGUnO1xuXG4vKiBlc2xpbnQgbm8tdW5kZXJzY29yZS1kYW5nbGU6IFsyLCB7IFwiYWxsb3dcIjogW1wiX2lkXCJdIH1dICovXG5cbmNvbnN0IGNoYW5uZWxOYW1lID0gU3ltYm9sKCdjaGFubmVsLW5hbWUnKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2hhbm5lbCB7XG4gIHN0b3BwZWQ6IGJvb2xlYW4gPSB0cnVlO1xuICBydW5uaW5nOiBib29sZWFuID0gZmFsc2U7XG4gIHRpbWVvdXQ6IG51bWJlcjtcbiAgc3RvcmFnZTogU3RvcmFnZUNhcHN1bGU7XG4gIGNvbmZpZzogSUNvbmZpZztcbiAgZXZlbnQgPSBuZXcgRXZlbnQoKTtcblxuICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIGNvbmZpZzogSUNvbmZpZykge1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuXG4gICAgLy8gc2F2ZSBjaGFubmVsIG5hbWUgdG8gdGhpcyBjbGFzcyB3aXRoIHN5bWJvbGljIGtleVxuICAgICh0aGlzOiBPYmplY3QpW2NoYW5uZWxOYW1lXSA9IG5hbWU7XG5cbiAgICAvLyBpZiBjdXN0b20gc3RvcmFnZSBkcml2ZXIgZXhpc3RzLCBzZXR1cCBpdFxuICAgIGNvbnN0IHsgZHJpdmVycyB9OiBhbnkgPSBRdWV1ZTtcbiAgICBjb25zdCBzdG9yYWdlID0gbmV3IFN0b3JhZ2VDYXBzdWxlKGNvbmZpZywgZHJpdmVycy5zdG9yYWdlKTtcbiAgICB0aGlzLnN0b3JhZ2UgPSBzdG9yYWdlLmNoYW5uZWwobmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGNoYW5uZWwgbmFtZVxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9IGNoYW5uZWwgbmFtZVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgbmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiAodGhpczogT2JqZWN0KVtjaGFubmVsTmFtZV07XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIG5ldyBqb2IgdG8gY2hhbm5lbFxuICAgKlxuICAgKiBAcGFyYW0gIHtPYmplY3R9IHRhc2tcbiAgICogQHJldHVybiB7U3RyaW5nfEJvb2xlYW59IGpvYlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgYWRkKHRhc2s6IElUYXNrKTogUHJvbWlzZTxzdHJpbmcgfCBib29sZWFuPiB7XG4gICAgaWYgKCEoYXdhaXQgY2FuTXVsdGlwbGUuY2FsbCh0aGlzLCB0YXNrKSkpIHJldHVybiBmYWxzZTtcblxuICAgIGNvbnN0IGlkID0gYXdhaXQgc2F2ZVRhc2suY2FsbCh0aGlzLCB0YXNrKTtcblxuICAgIGlmIChpZCAmJiB0aGlzLnN0b3BwZWQgJiYgdGhpcy5ydW5uaW5nID09PSB0cnVlKSB7XG4gICAgICBhd2FpdCB0aGlzLnN0YXJ0KCk7XG4gICAgfVxuXG4gICAgLy8gcGFzcyBhY3Rpdml0eSB0byB0aGUgbG9nIHNlcnZpY2UuXG4gICAgbG9nUHJveHkuY2FsbCh0aGlzLCB0YXNrQWRkZWRMb2csIHRhc2spO1xuXG4gICAgcmV0dXJuIGlkO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb2Nlc3MgbmV4dCBqb2JcbiAgICpcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIG5leHQoKTogUHJvbWlzZTx2b2lkIHwgYm9vbGVhbj4ge1xuICAgIGlmICh0aGlzLnN0b3BwZWQpIHtcbiAgICAgIHN0YXR1c09mZi5jYWxsKHRoaXMpO1xuICAgICAgcmV0dXJuIHN0b3BRdWV1ZS5jYWxsKHRoaXMpO1xuICAgIH1cblxuICAgIC8vIEdlbmVyYXRlIGEgbG9nIG1lc3NhZ2VcbiAgICBsb2dQcm94eS5jYWxsKHRoaXMsIG5leHRUYXNrTG9nLCAnbmV4dCcpO1xuXG4gICAgLy8gc3RhcnQgcXVldWUgYWdhaW5cbiAgICBhd2FpdCB0aGlzLnN0YXJ0KCk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCBxdWV1ZSBsaXN0ZW5lclxuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufSBqb2JcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIHN0YXJ0KCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIC8vIFN0b3AgdGhlIHF1ZXVlIGZvciByZXN0YXJ0XG4gICAgdGhpcy5zdG9wcGVkID0gZmFsc2U7XG5cbiAgICBsb2dQcm94eS5jYWxsKHRoaXMsIHF1ZXVlU3RhcnRMb2csICdzdGFydCcpO1xuXG4gICAgLy8gQ3JlYXRlIGEgdGltZW91dCBmb3Igc3RhcnQgcXVldWVcbiAgICB0aGlzLnJ1bm5pbmcgPSAoYXdhaXQgY3JlYXRlVGltZW91dC5jYWxsKHRoaXMpKSA+IDA7XG5cbiAgICByZXR1cm4gdGhpcy5ydW5uaW5nO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgcXVldWUgbGlzdGVuZXIgYWZ0ZXIgZW5kIG9mIGN1cnJlbnQgdGFza1xuICAgKlxuICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgc3RvcCgpOiB2b2lkIHtcbiAgICBsb2dQcm94eS5jYWxsKHRoaXMsIHF1ZXVlU3RvcHBpbmdMb2csICdzdG9wJyk7XG4gICAgdGhpcy5zdG9wcGVkID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wIHF1ZXVlIGxpc3RlbmVyIGluY2x1ZGluZyBjdXJyZW50IHRhc2tcbiAgICpcbiAgICogQHJldHVybiB7Vm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGZvcmNlU3RvcCgpOiB2b2lkIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIHN0b3BRdWV1ZS5jYWxsKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSBjaGFubmVsIHdvcmtpbmdcbiAgICpcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHN0YXR1cygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5ydW5uaW5nO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgdGhlcmUgaXMgYW55IHRhc2tcbiAgICpcbiAgICogQHJldHVybiB7Qm9vZWxhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGlzRW1wdHkoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmNvdW50KCkpIDwgMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGFzayBjb3VudFxuICAgKlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBjb3VudCgpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIHJldHVybiAoYXdhaXQgZ2V0VGFza3NXaXRob3V0RnJlZXplZC5jYWxsKHRoaXMpKS5sZW5ndGg7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRhc2sgY291bnQgYnkgdGFnXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gdGFnXG4gICAqIEByZXR1cm4ge0FycmF5PElUYXNrPn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGNvdW50QnlUYWcodGFnOiBzdHJpbmcpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIHJldHVybiAoYXdhaXQgZ2V0VGFza3NXaXRob3V0RnJlZXplZC5jYWxsKHRoaXMpKS5maWx0ZXIodCA9PiB0LnRhZyA9PT0gdGFnKS5sZW5ndGg7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFsbCB0YXNrcyBmcm9tIGNoYW5uZWxcbiAgICpcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGNsZWFyKCk6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy5uYW1lKCkpIHJldHVybiBmYWxzZTtcbiAgICB0aGlzLnN0b3JhZ2UuY2xlYXIodGhpcy5uYW1lKCkpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbGwgdGFza3MgZnJvbSBjaGFubmVsIGJ5IHRhZ1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHRhZ1xuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgY2xlYXJCeVRhZyh0YWc6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBkYi5jYWxsKHNlbGYpLmFsbCgpO1xuICAgIGNvbnN0IHJlbW92ZXMgPSBkYXRhLmZpbHRlcih1dGlsQ2xlYXJCeVRhZy5iaW5kKHRhZykpLm1hcChhc3luYyAodCkgPT4ge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZGIuY2FsbChzZWxmKS5kZWxldGUodC5faWQpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9KTtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChyZW1vdmVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBhIHRhc2sgd2hldGhlciBleGlzdHMgYnkgam9iIGlkXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gdGFnXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBoYXMoaWQ6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgZ2V0VGFza3NXaXRob3V0RnJlZXplZC5jYWxsKHRoaXMpKS5maW5kSW5kZXgodCA9PiB0Ll9pZCA9PT0gaWQpID4gLTE7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgYSB0YXNrIHdoZXRoZXIgZXhpc3RzIGJ5IHRhZ1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHRhZ1xuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgaGFzQnlUYWcodGFnOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gKGF3YWl0IGdldFRhc2tzV2l0aG91dEZyZWV6ZWQuY2FsbCh0aGlzKSkuZmluZEluZGV4KHQgPT4gdC50YWcgPT09IHRhZykgPiAtMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgYWN0aW9uIGV2ZW50c1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gY2JcbiAgICogQHJldHVybiB7Vm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIG9uKGtleTogc3RyaW5nLCBjYjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICB0aGlzLmV2ZW50Lm9uKC4uLltrZXksIGNiXSk7XG4gICAgbG9nUHJveHkuY2FsbCh0aGlzLCBldmVudENyZWF0ZWRMb2csIGtleSk7XG4gIH1cbn1cbiIsIi8qIEBmbG93ICovXG5pbXBvcnQgdHlwZSBJQ29uZmlnIGZyb20gJy4vaW50ZXJmYWNlcy9jb25maWcnO1xuaW1wb3J0IGNvbmZpZ0RhdGEgZnJvbSAnLi9lbnVtL2NvbmZpZy5kYXRhJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29uZmlnIHtcbiAgY29uZmlnOiBJQ29uZmlnID0gY29uZmlnRGF0YTtcblxuICBjb25zdHJ1Y3Rvcihjb25maWc6IElDb25maWcgPSB7fSkge1xuICAgIHRoaXMubWVyZ2UoY29uZmlnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgY29uZmlnIHRvIGdsb2JhbCBjb25maWcgcmVmZXJlbmNlXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0gIHtBbnl9IHZhbHVlXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBzZXQobmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgdGhpcy5jb25maWdbbmFtZV0gPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBjb25maWdcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm4ge2FueX1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGdldChuYW1lOiBzdHJpbmcpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZ1tuYW1lXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBjb25maWcgcHJvcGVydHlcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm4ge2FueX1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGhhcyhuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuY29uZmlnLCBuYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXJnZSB0d28gY29uZmlnIG9iamVjdFxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIG1lcmdlKGNvbmZpZzogeyBbc3RyaW5nXTogYW55IH0pOiB2b2lkIHtcbiAgICB0aGlzLmNvbmZpZyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuY29uZmlnLCBjb25maWcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIGNvbmZpZ1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHJlbW92ZShuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZGVsZXRlIHRoaXMuY29uZmlnW25hbWVdO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgY29uZmlnXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHtJQ29uZmlnW119XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhbGwoKTogSUNvbmZpZyB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnO1xuICB9XG59XG4iLCIvLyBAZmxvd1xuaW1wb3J0IG9iaiBmcm9tICdvYmplY3QtcGF0aCc7XG5pbXBvcnQgbG9nRXZlbnRzIGZyb20gJy4vZW51bS9sb2cuZXZlbnRzJztcblxuLyogZXNsaW50IG5vLWNvbnNvbGU6IFtcImVycm9yXCIsIHsgYWxsb3c6IFtcImxvZ1wiLCBcImdyb3VwQ29sbGFwc2VkXCIsIFwiZ3JvdXBFbmRcIl0gfV0gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGxvZyguLi5hcmdzOiBhbnkpIHtcbiAgY29uc29sZS5sb2coLi4uYXJncyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0YXNrQWRkZWRMb2coW3Rhc2tdOiBhbnlbXSkge1xuICBsb2coXG4gICAgYCVjJHtTdHJpbmcuZnJvbUNoYXJDb2RlKDQzKX0gKCR7dGFzay5oYW5kbGVyfSkgLT4gJHtvYmouZ2V0KGxvZ0V2ZW50cywgJ3F1ZXVlLmNyZWF0ZWQnKX1gLFxuICAgICdjb2xvcjogZ3JlZW47Zm9udC13ZWlnaHQ6IGJvbGQ7JyxcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHF1ZXVlU3RhcnRMb2coW3R5cGVdOiBhbnlbXSkge1xuICBsb2coXG4gICAgYCVjJHtTdHJpbmcuZnJvbUNoYXJDb2RlKDgyMTEpfSAoJHt0eXBlfSkgLT4gJHtvYmouZ2V0KGxvZ0V2ZW50cywgJ3F1ZXVlLnN0YXJ0aW5nJyl9YCxcbiAgICAnY29sb3I6ICMzZmE1ZjM7Zm9udC13ZWlnaHQ6IGJvbGQ7JyxcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5leHRUYXNrTG9nKFt0eXBlXTogYW55W10pIHtcbiAgbG9nKFxuICAgIGAlYyR7U3RyaW5nLmZyb21DaGFyQ29kZSgxODcpfSAoJHt0eXBlfSkgLT4gJHtvYmouZ2V0KGxvZ0V2ZW50cywgJ3F1ZXVlLm5leHQnKX1gLFxuICAgICdjb2xvcjogIzNmYTVmMztmb250LXdlaWdodDogYm9sZDsnLFxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcXVldWVTdG9wcGluZ0xvZyhbdHlwZV06IGFueVtdKSB7XG4gIGxvZyhcbiAgICBgJWMke1N0cmluZy5mcm9tQ2hhckNvZGUoODIyNil9ICgke3R5cGV9KSAtPiAke29iai5nZXQobG9nRXZlbnRzLCAncXVldWUuc3RvcHBpbmcnKX1gLFxuICAgICdjb2xvcjogI2ZmN2Y5NDtmb250LXdlaWdodDogYm9sZDsnLFxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcXVldWVTdG9wcGVkTG9nKFt0eXBlXTogYW55W10pIHtcbiAgbG9nKFxuICAgIGAlYyR7U3RyaW5nLmZyb21DaGFyQ29kZSg4MjI2KX0gKCR7dHlwZX0pIC0+ICR7b2JqLmdldChsb2dFdmVudHMsICdxdWV1ZS5zdG9wcGVkJyl9YCxcbiAgICAnY29sb3I6ICNmZjdmOTQ7Zm9udC13ZWlnaHQ6IGJvbGQ7JyxcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHF1ZXVlRW1wdHlMb2coW3R5cGVdOiBhbnlbXSkge1xuICBsb2coYCVjJHt0eXBlfSAke29iai5nZXQobG9nRXZlbnRzLCAncXVldWUuZW1wdHknKX1gLCAnY29sb3I6ICNmZjdmOTQ7Zm9udC13ZWlnaHQ6IGJvbGQ7Jyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBldmVudENyZWF0ZWRMb2coW2tleV06IGFueVtdKSB7XG4gIGxvZyhgJWMoJHtrZXl9KSAtPiAke29iai5nZXQobG9nRXZlbnRzLCAnZXZlbnQuY3JlYXRlZCcpfWAsICdjb2xvcjogIzY2Y2VlMztmb250LXdlaWdodDogYm9sZDsnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV2ZW50RmlyZWRMb2coW2tleSwgbmFtZV06IGFueVtdKSB7XG4gIGxvZyhgJWMoJHtrZXl9KSAtPiAke29iai5nZXQobG9nRXZlbnRzLCBgZXZlbnQuJHtuYW1lfWApfWAsICdjb2xvcjogI2EwZGMzYztmb250LXdlaWdodDogYm9sZDsnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vdEZvdW5kTG9nKFtuYW1lXTogYW55W10pIHtcbiAgbG9nKFxuICAgIGAlYyR7U3RyaW5nLmZyb21DaGFyQ29kZSgyMTUpfSAoJHtuYW1lfSkgLT4gJHtvYmouZ2V0KGxvZ0V2ZW50cywgJ3F1ZXVlLm5vdC1mb3VuZCcpfWAsXG4gICAgJ2NvbG9yOiAjYjkyZTJlO2ZvbnQtd2VpZ2h0OiBib2xkOycsXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3b3JrZXJSdW5uaW5Mb2coW1xuICB3b3JrZXI6IEZ1bmN0aW9uLFxuICB3b3JrZXJJbnN0YW5jZSxcbiAgdGFzayxcbiAgY2hhbm5lbDogc3RyaW5nLFxuICBkZXBzOiB7IFtzdHJpbmddOiBhbnlbXSB9LFxuXTogYW55W10pIHtcbiAgY29uc29sZS5ncm91cENvbGxhcHNlZChgJHt3b3JrZXIubmFtZSB8fCB0YXNrLmhhbmRsZXJ9IC0gJHt0YXNrLmxhYmVsfWApO1xuICBsb2coYCVjY2hhbm5lbDogJHtjaGFubmVsfWAsICdjb2xvcjogYmx1ZTsnKTtcbiAgbG9nKGAlY2xhYmVsOiAke3Rhc2subGFiZWwgfHwgJyd9YCwgJ2NvbG9yOiBibHVlOycpO1xuICBsb2coYCVjaGFuZGxlcjogJHt0YXNrLmhhbmRsZXJ9YCwgJ2NvbG9yOiBibHVlOycpO1xuICBsb2coYCVjcHJpb3JpdHk6ICR7dGFzay5wcmlvcml0eX1gLCAnY29sb3I6IGJsdWU7Jyk7XG4gIGxvZyhgJWN1bmlxdWU6ICR7dGFzay51bmlxdWUgfHwgJ2ZhbHNlJ31gLCAnY29sb3I6IGJsdWU7Jyk7XG4gIGxvZyhgJWNyZXRyeTogJHt3b3JrZXJJbnN0YW5jZS5yZXRyeSB8fCAnMSd9YCwgJ2NvbG9yOiBibHVlOycpO1xuICBsb2coYCVjdHJpZWQ6ICR7dGFzay50cmllZCA/IHRhc2sudHJpZWQgKyAxIDogJzEnfWAsICdjb2xvcjogYmx1ZTsnKTtcbiAgbG9nKGAlY3RhZzogJHt0YXNrLnRhZyB8fCAnJ31gLCAnY29sb3I6IGJsdWU7Jyk7XG4gIGxvZygnJWNhcmdzOicsICdjb2xvcjogYmx1ZTsnKTtcbiAgbG9nKHRhc2suYXJncyB8fCAnJyk7XG4gIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoJ2RlcGVuZGVuY2llcycpO1xuICBsb2coLi4uKGRlcHNbd29ya2VyLm5hbWVdIHx8IFtdKSk7XG4gIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdvcmtlckRvbmVMb2coW3Jlc3VsdCwgdGFzaywgd29ya2VySW5zdGFuY2VdOiBhbnlbXSkge1xuICBpZiAocmVzdWx0ID09PSB0cnVlKSB7XG4gICAgbG9nKGAlYyR7U3RyaW5nLmZyb21DaGFyQ29kZSgxMDAwMyl9IFRhc2sgY29tcGxldGVkIWAsICdjb2xvcjogZ3JlZW47Jyk7XG4gIH0gZWxzZSBpZiAoIXJlc3VsdCAmJiB0YXNrLnRyaWVkIDwgd29ya2VySW5zdGFuY2UucmV0cnkpIHtcbiAgICBsb2coJyVjVGFzayB3aWxsIGJlIHJldHJpZWQhJywgJ2NvbG9yOiAjZDg0MTBjOycpO1xuICB9IGVsc2Uge1xuICAgIGxvZyhgJWMke1N0cmluZy5mcm9tQ2hhckNvZGUoMTAwMDUpfSBUYXNrIGZhaWxlZCBhbmQgZnJlZXplZCFgLCAnY29sb3I6ICNlZjYzNjM7Jyk7XG4gIH1cbiAgY29uc29sZS5ncm91cEVuZCgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd29ya2VyRmFpbGVkTG9nKCkge1xuICBsb2coYCVjJHtTdHJpbmcuZnJvbUNoYXJDb2RlKDEwMDA1KX0gVGFzayBmYWlsZWQhYCwgJ2NvbG9yOiByZWQ7Jyk7XG4gIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbn1cbiIsIi8qIEBmbG93ICovXG5pbXBvcnQgdHlwZSBJQ29udGFpbmVyIGZyb20gJy4vaW50ZXJmYWNlcy9jb250YWluZXInO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb250YWluZXIgaW1wbGVtZW50cyBJQ29udGFpbmVyIHtcbiAgc3RvcmU6IHsgW3Byb3BlcnR5OiBzdHJpbmddOiBhbnkgfSA9IHt9O1xuXG4gIC8qKlxuICAgKiBDaGVjayBpdGVtIGluIGNvbnRhaW5lclxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGlkXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBoYXMoaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5zdG9yZSwgaWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBpdGVtIGZyb20gY29udGFpbmVyXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gaWRcbiAgICogQHJldHVybiB7QW55fVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgZ2V0KGlkOiBzdHJpbmcpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLnN0b3JlW2lkXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIGl0ZW1zIGZyb20gY29udGFpbmVyXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFsbCgpIHtcbiAgICByZXR1cm4gdGhpcy5zdG9yZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgaXRlbSB0byBjb250YWluZXJcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBpZFxuICAgKiBAcGFyYW0gIHtBbnl9IHZhbHVlXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBiaW5kKGlkOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLnN0b3JlW2lkXSA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIE1lcmdlIGNvbnRpbmVyc1xuICAgKlxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGRhdGFcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIG1lcmdlKGRhdGE6IHsgW3Byb3BlcnR5OiBzdHJpbmddOiBhbnkgfSA9IHt9KTogdm9pZCB7XG4gICAgdGhpcy5zdG9yZSA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuc3RvcmUsIGRhdGEpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBpdGVtIGZyb20gY29udGFpbmVyXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gaWRcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHJlbW92ZShpZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgaWYgKCF0aGlzLmhhcyhpZCkpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gZGVsZXRlIHRoaXMuc3RvcmVbaWRdO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbGwgaXRlbXMgZnJvbSBjb250YWluZXJcbiAgICpcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHJlbW92ZUFsbCgpOiB2b2lkIHtcbiAgICB0aGlzLnN0b3JlID0ge307XG4gIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IHtcbiAgZGVmYXVsdFN0b3JhZ2U6ICdsb2NhbHN0b3JhZ2UnLFxuICBwcmVmaXg6ICdzcV9qb2JzJyxcbiAgdGltZW91dDogMTAwMCxcbiAgbGltaXQ6IC0xLFxuICBwcmluY2lwbGU6ICdmaWZvJyxcbiAgZGVidWc6IHRydWUsXG59O1xuIiwiZXhwb3J0IGRlZmF1bHQge1xuICBxdWV1ZToge1xuICAgIGNyZWF0ZWQ6ICdOZXcgdGFzayBjcmVhdGVkLicsXG4gICAgbmV4dDogJ05leHQgdGFzayBwcm9jZXNzaW5nLicsXG4gICAgc3RhcnRpbmc6ICdRdWV1ZSBsaXN0ZW5lciBzdGFydGluZy4nLFxuICAgIHN0b3BwaW5nOiAnUXVldWUgbGlzdGVuZXIgc3RvcHBpbmcuJyxcbiAgICBzdG9wcGVkOiAnUXVldWUgbGlzdGVuZXIgc3RvcHBlZC4nLFxuICAgIGVtcHR5OiAnY2hhbm5lbCBpcyBlbXB0eS4uLicsXG4gICAgJ25vdC1mb3VuZCc6ICd3b3JrZXIgbm90IGZvdW5kJyxcbiAgICBvZmZsaW5lOiAnRGlzY29ubmVjdGVkJyxcbiAgICBvbmxpbmU6ICdDb25uZWN0ZWQnLFxuICB9LFxuICBldmVudDoge1xuICAgIGNyZWF0ZWQ6ICdOZXcgZXZlbnQgY3JlYXRlZCcsXG4gICAgZmlyZWQ6ICdFdmVudCBmaXJlZC4nLFxuICAgICd3aWxkY2FyZC1maXJlZCc6ICdXaWxkY2FyZCBldmVudCBmaXJlZC4nLFxuICB9LFxufTtcbiIsIi8qIGVzbGludCBjbGFzcy1tZXRob2RzLXVzZS10aGlzOiBbXCJlcnJvclwiLCB7IFwiZXhjZXB0TWV0aG9kc1wiOiBbXCJnZXROYW1lXCIsIFwiZ2V0VHlwZVwiXSB9XSAqL1xuLyogZXNsaW50LWVudiBlczYgKi9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXZlbnQge1xuICBzdG9yZTogeyBbcHJvcDogc3RyaW5nXTogYW55IH0gPSB7fTtcbiAgdmVyaWZpZXJQYXR0ZXJuOiBzdHJpbmcgPSAvXlthLXowLTktX10rOmJlZm9yZSR8YWZ0ZXIkfHJldHJ5JHxcXCokLztcbiAgd2lsZGNhcmRzOiBzdHJpbmdbXSA9IFsnKicsICdlcnJvciddO1xuICBlbXB0eUZ1bmM6IEZ1bmN0aW9uID0gKCkgPT4ge307XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5zdG9yZS5iZWZvcmUgPSB7fTtcbiAgICB0aGlzLnN0b3JlLmFmdGVyID0ge307XG4gICAgdGhpcy5zdG9yZS5yZXRyeSA9IHt9O1xuICAgIHRoaXMuc3RvcmUud2lsZGNhcmQgPSB7fTtcbiAgICB0aGlzLnN0b3JlLmVycm9yID0gdGhpcy5lbXB0eUZ1bmM7XG4gICAgdGhpcy5zdG9yZVsnKiddID0gdGhpcy5lbXB0eUZ1bmM7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGV2ZW50XG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjYlxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgb24oa2V5OiBzdHJpbmcsIGNiOiBGdW5jdGlvbik6IHZvaWQge1xuICAgIGlmICh0eXBlb2YgY2IgIT09ICdmdW5jdGlvbicpIHRocm93IG5ldyBFcnJvcignRXZlbnQgc2hvdWxkIGJlIGFuIGZ1bmN0aW9uJyk7XG4gICAgaWYgKHRoaXMuaXNWYWxpZChrZXkpKSB0aGlzLmFkZChrZXksIGNiKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gZXZlbnQgdmlhIGl0J3Mga2V5XG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSAge0FueX0gYXJnc1xuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgZW1pdChrZXk6IHN0cmluZywgYXJnczogYW55KTogdm9pZCB7XG4gICAgaWYgKHRoaXMud2lsZGNhcmRzLmluZGV4T2Yoa2V5KSA+IC0xKSB7XG4gICAgICB0aGlzLndpbGRjYXJkKGtleSwgLi4uW2tleSwgYXJnc10pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB0eXBlOiBzdHJpbmcgPSB0aGlzLmdldFR5cGUoa2V5KTtcbiAgICAgIGNvbnN0IG5hbWU6IHN0cmluZyA9IHRoaXMuZ2V0TmFtZShrZXkpO1xuXG4gICAgICBpZiAodGhpcy5zdG9yZVt0eXBlXSkge1xuICAgICAgICBjb25zdCBjYjogRnVuY3Rpb24gPSB0aGlzLnN0b3JlW3R5cGVdW25hbWVdIHx8IHRoaXMuZW1wdHlGdW5jO1xuICAgICAgICBjYi5jYWxsKG51bGwsIGFyZ3MpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMud2lsZGNhcmQoJyonLCBrZXksIGFyZ3MpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biB3aWxkY2FyZCBldmVudHNcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHBhcmFtICB7U3RyaW5nfSBhY3Rpb25LZXlcbiAgICogQHBhcmFtICB7QW55fSBhcmdzXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICB3aWxkY2FyZChrZXk6IHN0cmluZywgYWN0aW9uS2V5OiBzdHJpbmcsIGFyZ3M6IGFueSk6IHZvaWQge1xuICAgIGlmICh0aGlzLnN0b3JlLndpbGRjYXJkW2tleV0pIHtcbiAgICAgIHRoaXMuc3RvcmUud2lsZGNhcmRba2V5XS5jYWxsKG51bGwsIGFjdGlvbktleSwgYXJncyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBldmVudCB0byBzdG9yZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gY2JcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFkZChrZXk6IHN0cmluZywgY2I6IEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgaWYgKHRoaXMud2lsZGNhcmRzLmluZGV4T2Yoa2V5KSA+IC0xKSB7XG4gICAgICB0aGlzLnN0b3JlLndpbGRjYXJkW2tleV0gPSBjYjtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgdHlwZTogc3RyaW5nID0gdGhpcy5nZXRUeXBlKGtleSk7XG4gICAgICBjb25zdCBuYW1lOiBzdHJpbmcgPSB0aGlzLmdldE5hbWUoa2V5KTtcbiAgICAgIHRoaXMuc3RvcmVbdHlwZV1bbmFtZV0gPSBjYjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgZXZlbnQgaW4gc3RvcmVcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGhhcyhrZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBrZXlzOiBzdHJpbmdbXSA9IGtleS5zcGxpdCgnOicpO1xuICAgICAgcmV0dXJuIGtleXMubGVuZ3RoID4gMSA/ICEhdGhpcy5zdG9yZVtrZXlzWzFdXVtrZXlzWzBdXSA6ICEhdGhpcy5zdG9yZS53aWxkY2FyZFtrZXlzWzBdXTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBldmVudCBuYW1lIGJ5IHBhcnNlIGtleVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBnZXROYW1lKGtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4ga2V5Lm1hdGNoKC8oLiopOi4qLylbMV07XG4gIH1cblxuICAvKipcbiAgICogR2V0IGV2ZW50IHR5cGUgYnkgcGFyc2Uga2V5XG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGdldFR5cGUoa2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBrZXkubWF0Y2goL15bYS16MC05LV9dKzooLiopLylbMV07XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tlciBvZiBldmVudCBrZXlzXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBpc1ZhbGlkKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMudmVyaWZpZXJQYXR0ZXJuLnRlc3Qoa2V5KSB8fCB0aGlzLndpbGRjYXJkcy5pbmRleE9mKGtleSkgPiAtMTtcbiAgfVxufVxuIiwiLyogQGZsb3cgKi9cbmltcG9ydCB0eXBlIElUYXNrIGZyb20gJy4vaW50ZXJmYWNlcy90YXNrJztcbmltcG9ydCB0eXBlIElXb3JrZXIgZnJvbSAnLi9pbnRlcmZhY2VzL3dvcmtlcic7XG5pbXBvcnQgUXVldWUgZnJvbSAnLi9xdWV1ZSc7XG5pbXBvcnQgQ2hhbm5lbCBmcm9tICcuL2NoYW5uZWwnO1xuaW1wb3J0IFN0b3JhZ2VDYXBzdWxlIGZyb20gJy4vc3RvcmFnZS1jYXBzdWxlJztcbmltcG9ydCB7IGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzLCBoYXNNZXRob2QsIGlzRnVuY3Rpb24gfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7XG4gIGV2ZW50RmlyZWRMb2csXG4gIHF1ZXVlU3RvcHBlZExvZyxcbiAgd29ya2VyUnVubmluTG9nLFxuICBxdWV1ZUVtcHR5TG9nLFxuICBub3RGb3VuZExvZyxcbiAgd29ya2VyRG9uZUxvZyxcbiAgd29ya2VyRmFpbGVkTG9nLFxufSBmcm9tICcuL2NvbnNvbGUnO1xuXG4vKiBnbG9iYWwgV29ya2VyICovXG4vKiBlc2xpbnQgbm8tdW5kZXJzY29yZS1kYW5nbGU6IFsyLCB7IFwiYWxsb3dcIjogW1wiX2lkXCJdIH1dICovXG4vKiBlc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246IFwiZXJyb3JcIiAqL1xuLyogZXNsaW50IHVzZS1pc25hbjogXCJlcnJvclwiICovXG5cbi8qKlxuICogVGFzayBwcmlvcml0eSBjb250cm9sbGVyIGhlbHBlclxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEByZXR1cm4ge0lUYXNrfVxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tQcmlvcml0eSh0YXNrOiBJVGFzayk6IElUYXNrIHtcbiAgdGFzay5wcmlvcml0eSA9IHRhc2sucHJpb3JpdHkgfHwgMDtcblxuICBpZiAodHlwZW9mIHRhc2sucHJpb3JpdHkgIT09ICdudW1iZXInKSB0YXNrLnByaW9yaXR5ID0gMDtcblxuICByZXR1cm4gdGFzaztcbn1cblxuLyoqXG4gKiBTaG9ydGVucyBmdW5jdGlvbiB0aGUgZGIgYmVsb25nc3RvIGN1cnJlbnQgY2hhbm5lbFxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEByZXR1cm4ge1N0b3JhZ2VDYXBzdWxlfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGIoKTogU3RvcmFnZUNhcHN1bGUge1xuICByZXR1cm4gKHRoaXM6IGFueSkuc3RvcmFnZS5jaGFubmVsKCh0aGlzOiBhbnkpLm5hbWUoKSk7XG59XG5cbi8qKlxuICogR2V0IHVuZnJlZXplZCB0YXNrcyBieSB0aGUgZmlsdGVyIGZ1bmN0aW9uXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHJldHVybiB7SVRhc2t9XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUYXNrc1dpdGhvdXRGcmVlemVkKCk6IFByb21pc2U8SVRhc2tbXT4ge1xuICByZXR1cm4gKGF3YWl0IGRiLmNhbGwodGhpcykuYWxsKCkpLmZpbHRlcihleGNsdWRlU3BlY2lmaWNUYXNrcy5iaW5kKFsnZnJlZXplZCddKSk7XG59XG5cbi8qKlxuICogTG9nIHByb3h5IGhlbHBlclxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEByZXR1cm4ge3ZvaWR9XG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge3N0cmluZ30gZGF0YVxuICogQHBhcmFtIHtib29sZWFufSBjb25kXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2dQcm94eSh3cmFwcGVyRnVuYzogRnVuY3Rpb24sIC4uLmFyZ3M6IGFueSk6IHZvaWQge1xuICBpZiAoKHRoaXM6IGFueSkuY29uZmlnLmdldCgnZGVidWcnKSAmJiB0eXBlb2Ygd3JhcHBlckZ1bmMgPT09ICdmdW5jdGlvbicpIHtcbiAgICB3cmFwcGVyRnVuYyhhcmdzKTtcbiAgfVxufVxuXG4vKipcbiAqIE5ldyB0YXNrIHNhdmUgaGVscGVyXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHJldHVybiB7c3RyaW5nfGJvb2xlYW59XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlVGFzayh0YXNrOiBJVGFzayk6IFByb21pc2U8c3RyaW5nIHwgYm9vbGVhbj4ge1xuICBjb25zdCByZXN1bHQgPSBhd2FpdCBkYi5jYWxsKHRoaXMpLnNhdmUoY2hlY2tQcmlvcml0eSh0YXNrKSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogVGFzayByZW1vdmUgaGVscGVyXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGlkXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVtb3ZlVGFzayhpZDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRiLmNhbGwodGhpcykuZGVsZXRlKGlkKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBFdmVudHMgZGlzcGF0Y2hlciBoZWxwZXJcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICogQHJldHVybiB7dm9pZH1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpc3BhdGNoRXZlbnRzKHRhc2s6IElUYXNrLCB0eXBlOiBzdHJpbmcpOiBib29sZWFuIHwgdm9pZCB7XG4gIGlmICghKCd0YWcnIGluIHRhc2spKSByZXR1cm4gZmFsc2U7XG5cbiAgY29uc3QgZXZlbnRzID0gW1tgJHt0YXNrLnRhZ306JHt0eXBlfWAsICdmaXJlZCddLCBbYCR7dGFzay50YWd9OipgLCAnd2lsZGNhcmQtZmlyZWQnXV07XG5cbiAgZXZlbnRzLmZvckVhY2goKGUpID0+IHtcbiAgICB0aGlzLmV2ZW50LmVtaXQoZVswXSwgdGFzayk7XG4gICAgbG9nUHJveHkuY2FsbCgodGhpczogYW55KSwgZXZlbnRGaXJlZExvZywgLi4uZSk7XG4gIH0pO1xuXG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIFF1ZXVlIHN0b3BwZXIgaGVscGVyXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHJldHVybiB7dm9pZH1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0b3BRdWV1ZSgpOiB2b2lkIHtcbiAgdGhpcy5zdG9wKCk7XG5cbiAgY2xlYXJUaW1lb3V0KHRoaXMuY3VycmVudFRpbWVvdXQpO1xuXG4gIGxvZ1Byb3h5LmNhbGwodGhpcywgcXVldWVTdG9wcGVkTG9nLCAnc3RvcCcpO1xufVxuXG4vKipcbiAqIEZhaWxlZCBqb2IgaGFuZGxlclxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqIEByZXR1cm4ge0lUYXNrfSBqb2JcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmFpbGVkSm9iSGFuZGxlcih0YXNrOiBJVGFzayk6IFByb21pc2U8RnVuY3Rpb24+IHtcbiAgcmV0dXJuIGFzeW5jIGZ1bmN0aW9uIGNoaWxkRmFpbGVkSGFuZGxlcigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZW1vdmVUYXNrLmNhbGwodGhpcywgdGFzay5faWQpO1xuXG4gICAgdGhpcy5ldmVudC5lbWl0KCdlcnJvcicsIHRhc2spO1xuXG4gICAgbG9nUHJveHkuY2FsbCh0aGlzLCB3b3JrZXJGYWlsZWRMb2cpO1xuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBhd2FpdCB0aGlzLm5leHQoKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgb2YgdGhlIGxvY2sgdGFzayBvZiB0aGUgY3VycmVudCBqb2JcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9ja1Rhc2sodGFzazogSVRhc2spOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZGIuY2FsbCh0aGlzKS51cGRhdGUodGFzay5faWQsIHsgbG9ja2VkOiB0cnVlIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIENsYXNzIGV2ZW50IGx1YW5jaGVyIGhlbHBlclxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge0lXb3JrZXJ9IHdvcmtlclxuICogQHBhcmFtIHthbnl9IGFyZ3NcbiAqIEByZXR1cm4ge2Jvb2xlYW58dm9pZH1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpcmVKb2JJbmxpbmVFdmVudChuYW1lOiBzdHJpbmcsIHdvcmtlcjogSVdvcmtlciwgYXJnczogYW55KTogYm9vbGVhbiB7XG4gIGlmIChoYXNNZXRob2Qod29ya2VyLCBuYW1lKSAmJiBpc0Z1bmN0aW9uKHdvcmtlcltuYW1lXSkpIHtcbiAgICB3b3JrZXJbbmFtZV0uY2FsbCh3b3JrZXIsIGFyZ3MpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBQcm9jZXNzIGhhbmRsZXIgb2Ygc3VjY2VlZGVkIGpvYlxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqIEByZXR1cm4ge3ZvaWR9XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdWNjZXNzUHJvY2Vzcyh0YXNrOiBJVGFzayk6IHZvaWQge1xuICByZW1vdmVUYXNrLmNhbGwodGhpcywgdGFzay5faWQpO1xufVxuXG4vKipcbiAqIFVwZGF0ZSB0YXNrJ3MgcmV0cnkgdmFsdWVcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcGFyYW0ge0lXb3JrZXJ9IHdvcmtlclxuICogQHJldHVybiB7SVRhc2t9XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVSZXRyeSh0YXNrOiBJVGFzaywgd29ya2VyOiBJV29ya2VyKTogSVRhc2sge1xuICBpZiAoISgncmV0cnknIGluIHdvcmtlcikpIHdvcmtlci5yZXRyeSA9IDE7XG5cbiAgaWYgKCEoJ3RyaWVkJyBpbiB0YXNrKSkge1xuICAgIHRhc2sudHJpZWQgPSAwO1xuICAgIHRhc2sucmV0cnkgPSB3b3JrZXIucmV0cnk7XG4gIH1cblxuICB0YXNrLnRyaWVkICs9IDE7XG5cbiAgaWYgKHRhc2sudHJpZWQgPj0gd29ya2VyLnJldHJ5KSB7XG4gICAgdGFzay5mcmVlemVkID0gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiB0YXNrO1xufVxuXG4vKipcbiAqIFByb2Nlc3MgaGFuZGxlciBvZiByZXRyaWVkIGpvYlxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqIEBwYXJhbSB7SVdvcmtlcn0gd29ya2VyXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmV0cnlQcm9jZXNzKHRhc2s6IElUYXNrLCB3b3JrZXI6IElXb3JrZXIpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgLy8gZGlzcGFjdGggY3VzdG9tIHJldHJ5IGV2ZW50XG4gIGRpc3BhdGNoRXZlbnRzLmNhbGwodGhpcywgdGFzaywgJ3JldHJ5Jyk7XG5cbiAgLy8gdXBkYXRlIHJldHJ5IHZhbHVlXG4gIGNvbnN0IHVwZGF0ZVRhc2s6IElUYXNrID0gdXBkYXRlUmV0cnkuY2FsbCh0aGlzLCB0YXNrLCB3b3JrZXIpO1xuXG4gIC8vIGRlbGV0ZSBsb2NrIHByb3BlcnR5IGZvciBuZXh0IHByb2Nlc3NcbiAgdXBkYXRlVGFzay5sb2NrZWQgPSBmYWxzZTtcblxuICBjb25zdCByZXN1bHQgPSBhd2FpdCBkYi5jYWxsKHRoaXMpLnVwZGF0ZSh0YXNrLl9pZCwgdXBkYXRlVGFzayk7XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBTdWNjZWVkIGpvYiBoYW5kbGVyXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHBhcmFtIHtJV29ya2VyfSB3b3JrZXJcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3VjY2Vzc0pvYkhhbmRsZXIodGFzazogSVRhc2ssIHdvcmtlcjogSVdvcmtlcik6IFByb21pc2U8RnVuY3Rpb24+IHtcbiAgY29uc3Qgc2VsZjogQ2hhbm5lbCA9IHRoaXM7XG4gIHJldHVybiBhc3luYyBmdW5jdGlvbiBjaGlsZFN1Y2Nlc3NKb2JIYW5kbGVyKHJlc3VsdDogYm9vbGVhbik6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIGRpc3BhdGNoIGpvYiBwcm9jZXNzIGFmdGVyIHJ1bnMgYSB0YXNrIGJ1dCBvbmx5IG5vbiBlcnJvciBqb2JzXG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgLy8gZ28gYWhlYWQgdG8gc3VjY2VzcyBwcm9jZXNzXG4gICAgICBzdWNjZXNzUHJvY2Vzcy5jYWxsKHNlbGYsIHRhc2spO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBnbyBhaGVhZCB0byByZXRyeSBwcm9jZXNzXG4gICAgICBhd2FpdCByZXRyeVByb2Nlc3MuY2FsbChzZWxmLCB0YXNrLCB3b3JrZXIpO1xuICAgIH1cblxuICAgIC8vIGZpcmUgam9iIGFmdGVyIGV2ZW50XG4gICAgZmlyZUpvYklubGluZUV2ZW50LmNhbGwoc2VsZiwgJ2FmdGVyJywgd29ya2VyLCB0YXNrLmFyZ3MpO1xuXG4gICAgLy8gZGlzcGFjdGggY3VzdG9tIGFmdGVyIGV2ZW50XG4gICAgZGlzcGF0Y2hFdmVudHMuY2FsbChzZWxmLCB0YXNrLCAnYWZ0ZXInKTtcblxuICAgIC8vIHNob3cgY29uc29sZVxuICAgIGxvZ1Byb3h5LmNhbGwoc2VsZiwgd29ya2VyRG9uZUxvZywgcmVzdWx0LCB0YXNrLCB3b3JrZXIpO1xuXG4gICAgLy8gdHJ5IG5leHQgcXVldWUgam9iXG4gICAgYXdhaXQgc2VsZi5uZXh0KCk7XG4gIH07XG59XG5cbi8qKlxuICogSm9iIGhhbmRsZXIgaGVscGVyXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHBhcmFtIHtJSm9ifSB3b3JrZXJcbiAqIEBwYXJhbSB7SVdvcmtlcn0gd29ya2VySW5zdGFuY2VcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi8gZnVuY3Rpb24gbG9vcEhhbmRsZXIoXG4gIHRhc2s6IElUYXNrLFxuICB3b3JrZXI6IEZ1bmN0aW9uIHwgT2JqZWN0LFxuICB3b3JrZXJJbnN0YW5jZTogSVdvcmtlcixcbik6IEZ1bmN0aW9uIHtcbiAgcmV0dXJuIGFzeW5jIGZ1bmN0aW9uIGNoaWxkTG9vcEhhbmRsZXIoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IHdvcmtlclByb21pc2U6IFByb21pc2U8Ym9vbGVhbj47XG4gICAgY29uc3Qgc2VsZjogQ2hhbm5lbCA9IHRoaXM7XG5cbiAgICAvLyBsb2NrIHRoZSBjdXJyZW50IHRhc2sgZm9yIHByZXZlbnQgcmFjZSBjb25kaXRpb25cbiAgICBhd2FpdCBsb2NrVGFzay5jYWxsKHNlbGYsIHRhc2spO1xuXG4gICAgLy8gZmlyZSBqb2IgYmVmb3JlIGV2ZW50XG4gICAgZmlyZUpvYklubGluZUV2ZW50LmNhbGwodGhpcywgJ2JlZm9yZScsIHdvcmtlckluc3RhbmNlLCB0YXNrLmFyZ3MpO1xuXG4gICAgLy8gZGlzcGFjdGggY3VzdG9tIGJlZm9yZSBldmVudFxuICAgIGRpc3BhdGNoRXZlbnRzLmNhbGwodGhpcywgdGFzaywgJ2JlZm9yZScpO1xuXG4gICAgLy8gaWYgaGFzIGFueSBkZXBlbmRlbmN5IGluIGRlcGVuZGVuY2llcywgZ2V0IGl0XG4gICAgY29uc3QgZGVwcyA9IFF1ZXVlLndvcmtlckRlcHNbdGFzay5oYW5kbGVyXTtcblxuICAgIC8vIHByZXBhcmluZyB3b3JrZXIgZGVwZW5kZW5jaWVzXG4gICAgY29uc3QgZGVwZW5kZW5jaWVzID0gT2JqZWN0LnZhbHVlcyhkZXBzIHx8IHt9KTtcblxuICAgIC8vIHNob3cgY29uc29sZVxuICAgIGxvZ1Byb3h5LmNhbGwoXG4gICAgICB0aGlzLFxuICAgICAgd29ya2VyUnVubmluTG9nLFxuICAgICAgd29ya2VyLFxuICAgICAgd29ya2VySW5zdGFuY2UsXG4gICAgICB0YXNrLFxuICAgICAgc2VsZi5uYW1lKCksXG4gICAgICBRdWV1ZS53b3JrZXJEZXBzLFxuICAgICk7XG5cbiAgICAvLyBDaGVjayB3b3JrZXIgaW5zdGFuY2UgYW5kIHJvdXRlIHRoZSBwcm9jZXNzIHZpYSBpbnN0YW5jZVxuICAgIGlmICh3b3JrZXJJbnN0YW5jZSBpbnN0YW5jZW9mIFdvcmtlcikge1xuICAgICAgLy8gc3RhcnQgdGhlIG5hdGl2ZSB3b3JrZXIgYnkgcGFzc2luZyB0YXNrIHBhcmFtZXRlcnMgYW5kIGRlcGVuZGVuY2llcy5cbiAgICAgIC8vIE5vdGU6IE5hdGl2ZSB3b3JrZXIgcGFyYW1ldGVycyBjYW4gbm90IGJlIGNsYXNzIG9yIGZ1bmN0aW9uLlxuICAgICAgd29ya2VySW5zdGFuY2UucG9zdE1lc3NhZ2UoeyBhcmdzOiB0YXNrLmFyZ3MsIGRlcGVuZGVuY2llcyB9KTtcblxuICAgICAgLy8gV3JhcCB0aGUgd29ya2VyIHdpdGggcHJvbWlzZSBjbGFzcy5cbiAgICAgIHdvcmtlclByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAvLyBTZXQgZnVuY3Rpb24gdG8gd29ya2VyIG9ubWVzc2FnZSBldmVudCBmb3IgaGFuZGxlIHRoZSByZXBzb25zZSBvZiB3b3JrZXIuXG4gICAgICAgIHdvcmtlckluc3RhbmNlLm9ubWVzc2FnZSA9IChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgIHJlc29sdmUod29ya2VyLmhhbmRsZXIocmVzcG9uc2UpKTtcblxuICAgICAgICAgIC8vIFRlcm1pbmF0ZSBicm93c2VyIHdvcmtlci5cbiAgICAgICAgICB3b3JrZXJJbnN0YW5jZS50ZXJtaW5hdGUoKTtcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGlzIGlzIGN1c3RvbSB3b3JrZXIgY2xhc3MuXG4gICAgICAvLyBDYWxsIHRoZSBoYW5kbGUgZnVuY3Rpb24gaW4gd29ya2VyIGFuZCBnZXQgcHJvbWlzZSBpbnN0YW5jZS5cbiAgICAgIHdvcmtlclByb21pc2UgPSB3b3JrZXJJbnN0YW5jZS5oYW5kbGUuY2FsbCh3b3JrZXJJbnN0YW5jZSwgdGFzay5hcmdzLCAuLi5kZXBlbmRlbmNpZXMpO1xuICAgIH1cblxuICAgIHdvcmtlclByb21pc2VcbiAgICAgIC8vIEhhbmRsZSB3b3JrZXIgcmV0dXJuIHByb2Nlc3MuXG4gICAgICAudGhlbigoYXdhaXQgc3VjY2Vzc0pvYkhhbmRsZXIuY2FsbChzZWxmLCB0YXNrLCB3b3JrZXJJbnN0YW5jZSkpLmJpbmQoc2VsZikpXG4gICAgICAvLyBIYW5kbGUgZXJyb3JzIGluIHdvcmtlciB3aGlsZSBpdCB3YXMgcnVubmluZy5cbiAgICAgIC5jYXRjaCgoYXdhaXQgZmFpbGVkSm9iSGFuZGxlci5jYWxsKHNlbGYsIHRhc2spKS5iaW5kKHNlbGYpKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBUaW1lb3V0IGNyZWF0b3IgaGVscGVyXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHJldHVybiB7bnVtYmVyfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlVGltZW91dCgpOiBQcm9taXNlPG51bWJlcj4ge1xuICAvLyBpZiBydW5uaW5nIGFueSBqb2IsIHN0b3AgaXRcbiAgLy8gdGhlIHB1cnBvc2UgaGVyZSBpcyB0byBwcmV2ZW50IGNvY3VycmVudCBvcGVyYXRpb24gaW4gc2FtZSBjaGFubmVsXG4gIGNsZWFyVGltZW91dCh0aGlzLmN1cnJlbnRUaW1lb3V0KTtcblxuICAvLyBHZXQgbmV4dCB0YXNrXG4gIGNvbnN0IHRhc2s6IElUYXNrID0gKGF3YWl0IGRiLmNhbGwodGhpcykuZmV0Y2goKSkuc2hpZnQoKTtcblxuICBpZiAodGFzayA9PT0gdW5kZWZpbmVkKSB7XG4gICAgbG9nUHJveHkuY2FsbCh0aGlzLCBxdWV1ZUVtcHR5TG9nLCB0aGlzLm5hbWUoKSk7XG4gICAgc3RvcFF1ZXVlLmNhbGwodGhpcyk7XG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICBpZiAoIVF1ZXVlLndvcmtlci5oYXModGFzay5oYW5kbGVyKSkge1xuICAgIGxvZ1Byb3h5LmNhbGwodGhpcywgbm90Rm91bmRMb2csIHRhc2suaGFuZGxlcik7XG4gICAgYXdhaXQgKGF3YWl0IGZhaWxlZEpvYkhhbmRsZXIuY2FsbCh0aGlzLCB0YXNrKSkuY2FsbCh0aGlzKTtcbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIC8vIEdldCB3b3JrZXIgd2l0aCBoYW5kbGVyIG5hbWVcbiAgY29uc3QgSm9iV29ya2VyOiBGdW5jdGlvbiB8IE9iamVjdCA9IFF1ZXVlLndvcmtlci5nZXQodGFzay5oYW5kbGVyKTtcblxuICAvLyBDcmVhdGUgYSB3b3JrZXIgaW5zdGFuY2VcbiAgY29uc3Qgd29ya2VySW5zdGFuY2U6IElXb3JrZXIgfCBXb3JrZXIgPVxuICAgIHR5cGVvZiBKb2JXb3JrZXIgPT09ICdvYmplY3QnID8gbmV3IFdvcmtlcihKb2JXb3JrZXIudXJpKSA6IG5ldyBKb2JXb3JrZXIoKTtcblxuICAvLyBnZXQgYWx3YXlzIGxhc3QgdXBkYXRlZCBjb25maWcgdmFsdWVcbiAgY29uc3QgdGltZW91dDogbnVtYmVyID0gdGhpcy5jb25maWcuZ2V0KCd0aW1lb3V0Jyk7XG5cbiAgLy8gY3JlYXRlIGEgYXJyYXkgd2l0aCBoYW5kbGVyIHBhcmFtZXRlcnMgZm9yIHNob3J0ZW4gbGluZSBudW1iZXJzXG4gIGNvbnN0IHBhcmFtcyA9IFt0YXNrLCBKb2JXb3JrZXIsIHdvcmtlckluc3RhbmNlXTtcblxuICAvLyBHZXQgaGFuZGxlciBmdW5jdGlvbiBmb3IgaGFuZGxlIG9uIGNvbXBsZXRlZCBldmVudFxuICBjb25zdCBoYW5kbGVyOiBGdW5jdGlvbiA9IChhd2FpdCBsb29wSGFuZGxlci5jYWxsKHRoaXMsIC4uLnBhcmFtcykpLmJpbmQodGhpcyk7XG5cbiAgLy8gY3JlYXRlIG5ldyB0aW1lb3V0IGZvciBwcm9jZXNzIGEgam9iIGluIHF1ZXVlXG4gIC8vIGJpbmRpbmcgbG9vcEhhbmRsZXIgZnVuY3Rpb24gdG8gc2V0VGltZW91dFxuICAvLyB0aGVuIHJldHVybiB0aGUgdGltZW91dCBpbnN0YW5jZVxuICB0aGlzLmN1cnJlbnRUaW1lb3V0ID0gc2V0VGltZW91dChoYW5kbGVyLCB0aW1lb3V0KTtcblxuICByZXR1cm4gdGhpcy5jdXJyZW50VGltZW91dDtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIHN0YXR1cyB0byBmYWxzZSBvZiBxdWV1ZVxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEByZXR1cm4ge3ZvaWR9XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdGF0dXNPZmYoKTogdm9pZCB7XG4gIHRoaXMucnVubmluZyA9IGZhbHNlO1xufVxuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIGEgdGFzayBpcyByZXBsaWNhYmxlIG9yIG5vdFxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjYW5NdWx0aXBsZSh0YXNrOiBJVGFzayk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICBpZiAodHlwZW9mIHRhc2sgIT09ICdvYmplY3QnIHx8IHRhc2sudW5pcXVlICE9PSB0cnVlKSByZXR1cm4gdHJ1ZTtcbiAgcmV0dXJuIChhd2FpdCB0aGlzLmhhc0J5VGFnKHRhc2sudGFnKSkgPT09IGZhbHNlO1xufVxuIiwiaW1wb3J0ICdwc2V1ZG8td29ya2VyL3BvbHlmaWxsJztcbmltcG9ydCBRdWV1ZSBmcm9tICcuL3F1ZXVlJztcblxuLyogZ2xvYmFsIHdpbmRvdzp0cnVlICovXG5cbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICB3aW5kb3cuUXVldWUgPSBRdWV1ZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgUXVldWU7XG4iLCIvKiBAZmxvdyAqL1xuaW1wb3J0IHR5cGUgSUNvbmZpZyBmcm9tICcuL2ludGVyZmFjZXMvY29uZmlnJztcbmltcG9ydCBDaGFubmVsIGZyb20gJy4vY2hhbm5lbCc7XG5pbXBvcnQgQ29udGFpbmVyIGZyb20gJy4vY29udGFpbmVyJztcbmltcG9ydCBDb25maWcgZnJvbSAnLi9jb25maWcnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBRdWV1ZShjb25maWc6IElDb25maWcpIHtcbiAgdGhpcy5jb25maWcgPSBuZXcgQ29uZmlnKGNvbmZpZyk7XG59XG5cblF1ZXVlLkZJRk8gPSAnZmlmbyc7XG5RdWV1ZS5MSUZPID0gJ2xpZm8nO1xuUXVldWUuZHJpdmVycyA9IHt9O1xuUXVldWUud29ya2VyRGVwcyA9IHt9O1xuUXVldWUud29ya2VyID0gbmV3IENvbnRhaW5lcigpO1xuUXVldWUucHJvdG90eXBlLmNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoKTtcblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgY2hhbm5lbFxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gdGFza1xuICogQHJldHVybiB7UXVldWV9IGNoYW5uZWxcbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5RdWV1ZS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKGNoYW5uZWw6IHN0cmluZyk6IFF1ZXVlIHtcbiAgaWYgKCF0aGlzLmNvbnRhaW5lci5oYXMoY2hhbm5lbCkpIHtcbiAgICB0aGlzLmNvbnRhaW5lci5iaW5kKGNoYW5uZWwsIG5ldyBDaGFubmVsKGNoYW5uZWwsIHRoaXMuY29uZmlnKSk7XG4gIH1cbiAgcmV0dXJuIHRoaXMuY29udGFpbmVyLmdldChjaGFubmVsKTtcbn07XG5cbi8qKlxuICogR2V0IGNoYW5uZWwgaW5zdGFuY2UgYnkgY2hhbm5lbCBuYW1lXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtRdWV1ZX1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5RdWV1ZS5wcm90b3R5cGUuY2hhbm5lbCA9IGZ1bmN0aW9uIGNoYW5uZWwobmFtZTogc3RyaW5nKTogUXVldWUge1xuICBpZiAoIXRoaXMuY29udGFpbmVyLmhhcyhuYW1lKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgXCIke25hbWV9XCIgY2hhbm5lbCBub3QgZm91bmRgKTtcbiAgfVxuICByZXR1cm4gdGhpcy5jb250YWluZXIuZ2V0KG5hbWUpO1xufTtcblxuLyoqXG4gKiBTZXQgY29uZmlnIHRpbWVvdXQgdmFsdWVcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZhbFxuICogQHJldHVybiB7Vm9pZH1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5RdWV1ZS5wcm90b3R5cGUuc2V0VGltZW91dCA9IGZ1bmN0aW9uIHNldFRpbWVvdXQodmFsOiBudW1iZXIpOiB2b2lkIHtcbiAgdGhpcy5jb25maWcuc2V0KCd0aW1lb3V0JywgdmFsKTtcbn07XG5cbi8qKlxuICogU2V0IGNvbmZpZyBsaW1pdCB2YWx1ZVxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gdmFsXG4gKiBAcmV0dXJuIHtWb2lkfVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblF1ZXVlLnByb3RvdHlwZS5zZXRMaW1pdCA9IGZ1bmN0aW9uIHNldExpbWl0KHZhbDogbnVtYmVyKTogdm9pZCB7XG4gIHRoaXMuY29uZmlnLnNldCgnbGltaXQnLCB2YWwpO1xufTtcblxuLyoqXG4gKiBTZXQgY29uZmlnIHByZWZpeCB2YWx1ZVxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gdmFsXG4gKiBAcmV0dXJuIHtWb2lkfVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblF1ZXVlLnByb3RvdHlwZS5zZXRQcmVmaXggPSBmdW5jdGlvbiBzZXRQcmVmaXgodmFsOiBzdHJpbmcpOiB2b2lkIHtcbiAgdGhpcy5jb25maWcuc2V0KCdwcmVmaXgnLCB2YWwpO1xufTtcblxuLyoqXG4gKiBTZXQgY29uZmlnIHByaWNpcGxlIHZhbHVlXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1ZvaWR9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUXVldWUucHJvdG90eXBlLnNldFByaW5jaXBsZSA9IGZ1bmN0aW9uIHNldFByaW5jaXBsZSh2YWw6IHN0cmluZyk6IHZvaWQge1xuICB0aGlzLmNvbmZpZy5zZXQoJ3ByaW5jaXBsZScsIHZhbCk7XG59O1xuXG4vKipcbiAqIFNldCBjb25maWcgZGVidWcgdmFsdWVcbiAqXG4gKiBAcGFyYW0gIHtCb29sZWFufSB2YWxcbiAqIEByZXR1cm4ge1ZvaWR9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUXVldWUucHJvdG90eXBlLnNldERlYnVnID0gZnVuY3Rpb24gc2V0RGVidWcodmFsOiBib29sZWFuKTogdm9pZCB7XG4gIHRoaXMuY29uZmlnLnNldCgnZGVidWcnLCB2YWwpO1xufTtcblxuUXVldWUucHJvdG90eXBlLnNldFN0b3JhZ2UgPSBmdW5jdGlvbiBzZXRTdG9yYWdlKHZhbDogc3RyaW5nKTogdm9pZCB7XG4gIHRoaXMuY29uZmlnLnNldCgnc3RvcmFnZScsIHZhbCk7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVyIHdvcmtlclxuICpcbiAqIEBwYXJhbSAge0FycmF5PElKb2I+fSBqb2JzXG4gKiBAcmV0dXJuIHtWb2lkfVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblF1ZXVlLndvcmtlcnMgPSBmdW5jdGlvbiB3b3JrZXJzKHdvcmtlcnNPYmo6IHsgW3Byb3A6IHN0cmluZ106IGFueSB9ID0ge30pOiB2b2lkIHtcbiAgaWYgKCEod29ya2Vyc09iaiBpbnN0YW5jZW9mIE9iamVjdCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBwYXJhbWV0ZXJzIHNob3VsZCBiZSBvYmplY3QuJyk7XG4gIH1cblxuICBRdWV1ZS53b3JrZXIubWVyZ2Uod29ya2Vyc09iaik7XG59O1xuXG4vKipcbiAqIEFkZGVkIHdvcmtlcnMgZGVwZW5kZW5jaWVzXG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSBkcml2ZXJcbiAqIEByZXR1cm4ge1ZvaWR9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUXVldWUuZGVwcyA9IGZ1bmN0aW9uIGRlcHMoZGVwZW5kZW5jaWVzOiB7IFtwcm9wOiBzdHJpbmddOiBhbnkgfSA9IHt9KTogdm9pZCB7XG4gIGlmICghKGRlcGVuZGVuY2llcyBpbnN0YW5jZW9mIE9iamVjdCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBwYXJhbWV0ZXJzIHNob3VsZCBiZSBvYmplY3QuJyk7XG4gIH1cbiAgUXVldWUud29ya2VyRGVwcyA9IGRlcGVuZGVuY2llcztcbn07XG5cbi8qKlxuICogU2V0dXAgYSBjdXN0b20gZHJpdmVyXG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSBkcml2ZXJcbiAqIEByZXR1cm4ge1ZvaWR9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUXVldWUudXNlID0gZnVuY3Rpb24gdXNlKGRyaXZlcjogeyBbcHJvcDogc3RyaW5nXTogYW55IH0gPSB7fSk6IHZvaWQge1xuICBRdWV1ZS5kcml2ZXJzID0geyAuLi5RdWV1ZS5kcml2ZXJzLCAuLi5kcml2ZXIgfTtcbn07XG4iLCIvKiBAZmxvdyAqL1xuaW1wb3J0IGdyb3VwQnkgZnJvbSAnZ3JvdXAtYnknO1xuaW1wb3J0IHR5cGUgSUNvbmZpZyBmcm9tICcuL2ludGVyZmFjZXMvY29uZmlnJztcbmltcG9ydCB0eXBlIHsgSVN0b3JhZ2UgfSBmcm9tICcuL2ludGVyZmFjZXMvc3RvcmFnZSc7XG5pbXBvcnQgdHlwZSBJVGFzayBmcm9tICcuL2ludGVyZmFjZXMvdGFzayc7XG5pbXBvcnQgeyBMb2NhbFN0b3JhZ2VBZGFwdGVyLCBJbk1lbW9yeUFkYXB0ZXIgfSBmcm9tICcuL2FkYXB0ZXJzJztcbmltcG9ydCB7IGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzLCBsaWZvLCBmaWZvIH0gZnJvbSAnLi91dGlscyc7XG5cbi8qIGVzbGludCBuby1jb25zb2xlOiBbXCJlcnJvclwiLCB7IGFsbG93OiBbXCJ3YXJuXCIsIFwiZXJyb3JcIl0gfV0gKi9cbi8qIGVzbGludCBuby11bmRlcnNjb3JlLWRhbmdsZTogWzIsIHsgXCJhbGxvd1wiOiBbXCJfaWRcIl0gfV0gKi9cbi8qIGVzbGludCBjbGFzcy1tZXRob2RzLXVzZS10aGlzOiBbXCJlcnJvclwiLCB7IFwiZXhjZXB0TWV0aG9kc1wiOiBbXCJnZW5lcmF0ZUlkXCJdIH1dICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0b3JhZ2VDYXBzdWxlIHtcbiAgY29uZmlnOiBJQ29uZmlnO1xuICBzdG9yYWdlOiBJU3RvcmFnZTtcbiAgc3RvcmFnZUNoYW5uZWw6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcihjb25maWc6IElDb25maWcsIHN0b3JhZ2U6IElTdG9yYWdlKSB7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5zdG9yYWdlID0gdGhpcy5pbml0aWFsaXplKHN0b3JhZ2UpO1xuICB9XG5cbiAgaW5pdGlhbGl6ZShTdG9yYWdlOiBhbnkpIHtcbiAgICBpZiAodHlwZW9mIFN0b3JhZ2UgPT09ICdvYmplY3QnKSB7XG4gICAgICByZXR1cm4gU3RvcmFnZTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBTdG9yYWdlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gbmV3IFN0b3JhZ2UodGhpcy5jb25maWcpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5jb25maWcuZ2V0KCdzdG9yYWdlJykgPT09ICdsb2NhbHN0b3JhZ2UnKSB7XG4gICAgICByZXR1cm4gbmV3IExvY2FsU3RvcmFnZUFkYXB0ZXIodGhpcy5jb25maWcpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IEluTWVtb3J5QWRhcHRlcih0aGlzLmNvbmZpZyk7XG4gIH1cblxuICAvKipcbiAgICogU2VsZWN0IGEgY2hhbm5lbCBieSBjaGFubmVsIG5hbWVcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm4ge1N0b3JhZ2VDYXBzdWxlfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgY2hhbm5lbChuYW1lOiBzdHJpbmcpOiBTdG9yYWdlQ2Fwc3VsZSB7XG4gICAgdGhpcy5zdG9yYWdlQ2hhbm5lbCA9IG5hbWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogRmV0Y2ggdGFza3MgZnJvbSBzdG9yYWdlIHdpdGggb3JkZXJlZFxuICAgKlxuICAgKiBAcmV0dXJuIHthbnlbXX1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGZldGNoKCk6IFByb21pc2U8YW55W10+IHtcbiAgICBjb25zdCBhbGwgPSAoYXdhaXQgdGhpcy5hbGwoKSkuZmlsdGVyKGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzKTtcbiAgICBjb25zdCB0YXNrcyA9IGdyb3VwQnkoYWxsLCAncHJpb3JpdHknKTtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGFza3MpXG4gICAgICAubWFwKGtleSA9PiBwYXJzZUludChrZXksIDEwKSlcbiAgICAgIC5zb3J0KChhLCBiKSA9PiBiIC0gYSlcbiAgICAgIC5yZWR1Y2UodGhpcy5yZWR1Y2VUYXNrcyh0YXNrcyksIFtdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTYXZlIHRhc2sgdG8gc3RvcmFnZVxuICAgKlxuICAgKiBAcGFyYW0gIHtJVGFza30gdGFza1xuICAgKiBAcmV0dXJuIHtTdHJpbmd8Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIHNhdmUodGFzazogSVRhc2spOiBQcm9taXNlPHN0cmluZyB8IGJvb2xlYW4+IHtcbiAgICBpZiAodHlwZW9mIHRhc2sgIT09ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBnZXQgYWxsIHRhc2tzIGN1cnJlbnQgY2hhbm5lbCdzXG4gICAgY29uc3QgdGFza3M6IElUYXNrW10gPSBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0KHRoaXMuc3RvcmFnZUNoYW5uZWwpO1xuXG4gICAgLy8gQ2hlY2sgdGhlIGNoYW5uZWwgbGltaXQuXG4gICAgLy8gSWYgbGltaXQgaXMgZXhjZWVkZWQsIGRvZXMgbm90IGluc2VydCBuZXcgdGFza1xuICAgIGlmIChhd2FpdCB0aGlzLmlzRXhjZWVkZWQoKSkge1xuICAgICAgY29uc29sZS53YXJuKGBUYXNrIGxpbWl0IGV4Y2VlZGVkOiBUaGUgJyR7dGhpcy5zdG9yYWdlQ2hhbm5lbH0nIGNoYW5uZWwgbGltaXQgaXMgJHt0aGlzLmNvbmZpZy5nZXQoJ2xpbWl0Jyl9YCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gcHJlcGFyZSBhbGwgcHJvcGVydGllcyBiZWZvcmUgc2F2ZVxuICAgIC8vIGV4YW1wbGU6IGNyZWF0ZWRBdCBldGMuXG4gICAgY29uc3QgbmV3VGFzayA9IHRoaXMucHJlcGFyZVRhc2sodGFzayk7XG5cbiAgICAvLyBhZGQgdGFzayB0byBzdG9yYWdlXG4gICAgdGFza3MucHVzaChuZXdUYXNrKTtcblxuICAgIC8vIHNhdmUgdGFza3NcbiAgICBhd2FpdCB0aGlzLnN0b3JhZ2Uuc2V0KHRoaXMuc3RvcmFnZUNoYW5uZWwsIHRhc2tzKTtcblxuICAgIHJldHVybiBuZXdUYXNrLl9pZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgY2hhbm5lbCBzdG9yZS5cbiAgICpcbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKiAgIFRoZSB2YWx1ZS4gVGhpcyBhbm5vdGF0aW9uIGNhbiBiZSB1c2VkIGZvciB0eXBlIGhpbnRpbmcgcHVycG9zZXMuXG4gICAqL1xuICBhc3luYyB1cGRhdGUoaWQ6IHN0cmluZywgdXBkYXRlOiB7IFtwcm9wZXJ0eTogc3RyaW5nXTogYW55IH0pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBkYXRhOiBhbnlbXSA9IGF3YWl0IHRoaXMuYWxsKCk7XG4gICAgY29uc3QgaW5kZXg6IG51bWJlciA9IGRhdGEuZmluZEluZGV4KHQgPT4gdC5faWQgPT09IGlkKTtcblxuICAgIC8vIGlmIGluZGV4IG5vdCBmb3VuZCwgcmV0dXJuIGZhbHNlXG4gICAgaWYgKGluZGV4IDwgMCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gbWVyZ2UgZXhpc3Rpbmcgb2JqZWN0IHdpdGggZ2l2ZW4gdXBkYXRlIG9iamVjdFxuICAgIGRhdGFbaW5kZXhdID0gT2JqZWN0LmFzc2lnbih7fSwgZGF0YVtpbmRleF0sIHVwZGF0ZSk7XG5cbiAgICAvLyBzYXZlIHRvIHRoZSBzdG9yYWdlIGFzIHN0cmluZ1xuICAgIGF3YWl0IHRoaXMuc3RvcmFnZS5zZXQodGhpcy5zdG9yYWdlQ2hhbm5lbCwgZGF0YSk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgdGFzayBmcm9tIHN0b3JhZ2VcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBpZFxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgZGVsZXRlKGlkOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBkYXRhOiBhbnlbXSA9IGF3YWl0IHRoaXMuYWxsKCk7XG4gICAgY29uc3QgaW5kZXg6IG51bWJlciA9IGRhdGEuZmluZEluZGV4KGQgPT4gZC5faWQgPT09IGlkKTtcblxuICAgIGlmIChpbmRleCA8IDApIHJldHVybiBmYWxzZTtcblxuICAgIGRlbGV0ZSBkYXRhW2luZGV4XTtcblxuICAgIGF3YWl0IHRoaXMuc3RvcmFnZS5zZXQodGhpcy5zdG9yYWdlQ2hhbm5lbCwgZGF0YS5maWx0ZXIoZCA9PiBkKSk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIHRhc2tzXG4gICAqXG4gICAqIEByZXR1cm4ge0FueVtdfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgYWxsKCk6IFByb21pc2U8SVRhc2tbXT4ge1xuICAgIGNvbnN0IGl0ZW1zID0gYXdhaXQgdGhpcy5zdG9yYWdlLmdldCh0aGlzLnN0b3JhZ2VDaGFubmVsKTtcbiAgICByZXR1cm4gaXRlbXM7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgdW5pcXVlIGlkXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGdlbmVyYXRlSWQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gKCgxICsgTWF0aC5yYW5kb20oKSkgKiAweDEwMDAwKS50b1N0cmluZygxNik7XG4gIH1cblxuICAvKipcbiAgICogQWRkIHNvbWUgbmVjZXNzYXJ5IHByb3BlcnRpZXNcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBpZFxuICAgKiBAcmV0dXJuIHtJVGFza31cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHByZXBhcmVUYXNrKHRhc2s6IElUYXNrKTogSVRhc2sge1xuICAgIGNvbnN0IG5ld1Rhc2sgPSB7IC4uLnRhc2sgfTtcbiAgICBuZXdUYXNrLmNyZWF0ZWRBdCA9IERhdGUubm93KCk7XG4gICAgbmV3VGFzay5faWQgPSB0aGlzLmdlbmVyYXRlSWQoKTtcbiAgICByZXR1cm4gbmV3VGFzaztcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgc29tZSBuZWNlc3NhcnkgcHJvcGVydGllc1xuICAgKlxuICAgKiBAcGFyYW0gIHtJVGFza1tdfSB0YXNrc1xuICAgKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHJlZHVjZVRhc2tzKHRhc2tzOiBJVGFza1tdKSB7XG4gICAgY29uc3QgcmVkdWNlRnVuYyA9IChyZXN1bHQ6IElUYXNrW10sIGtleTogYW55KTogSVRhc2tbXSA9PiB7XG4gICAgICBpZiAodGhpcy5jb25maWcuZ2V0KCdwcmluY2lwbGUnKSA9PT0gJ2xpZm8nKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQuY29uY2F0KHRhc2tzW2tleV0uc29ydChsaWZvKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0LmNvbmNhdCh0YXNrc1trZXldLnNvcnQoZmlmbykpO1xuICAgIH07XG5cbiAgICByZXR1cm4gcmVkdWNlRnVuYy5iaW5kKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRhc2sgbGltaXQgY2hlY2tlclxuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgaXNFeGNlZWRlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBsaW1pdDogbnVtYmVyID0gdGhpcy5jb25maWcuZ2V0KCdsaW1pdCcpO1xuICAgIGNvbnN0IHRhc2tzOiBJVGFza1tdID0gKGF3YWl0IHRoaXMuYWxsKCkpLmZpbHRlcihleGNsdWRlU3BlY2lmaWNUYXNrcyk7XG4gICAgcmV0dXJuICEobGltaXQgPT09IC0xIHx8IGxpbWl0ID4gdGFza3MubGVuZ3RoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciB0YXNrcyB3aXRoIGdpdmVuIGNoYW5uZWwgbmFtZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGNoYW5uZWxcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGNsZWFyKGNoYW5uZWw6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuc3RvcmFnZS5jbGVhcihjaGFubmVsKTtcbiAgfVxufVxuIiwiLyogQGZsb3cgKi9cbmltcG9ydCB0eXBlIElUYXNrIGZyb20gJy4vaW50ZXJmYWNlcy90YXNrJztcblxuLyogZXNsaW50IGNvbW1hLWRhbmdsZTogW1wiZXJyb3JcIiwgXCJuZXZlclwiXSAqL1xuXG4vKipcbiAqIENoZWNrIHByb3BlcnR5IGluIG9iamVjdFxuICpcbiAqIEBwYXJhbSAge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXNQcm9wZXJ0eShmdW5jOiBGdW5jdGlvbiwgbmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZnVuYywgbmFtZSk7XG59XG5cbi8qKlxuICogQ2hlY2sgbWV0aG9kIGluIGluaXRpYXRlZCBjbGFzc1xuICpcbiAqIEBwYXJhbSAge0NsYXNzfSBpbnN0YW5jZVxuICogQHBhcmFtICB7U3RyaW5nfSBtZXRob2RcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc01ldGhvZChpbnN0YW5jZTogYW55LCBtZXRob2Q6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gaW5zdGFuY2UgaW5zdGFuY2VvZiBPYmplY3QgJiYgbWV0aG9kIGluIGluc3RhbmNlO1xufVxuXG4vKipcbiAqIENoZWNrIGZ1bmN0aW9uIHR5cGVcbiAqXG4gKiBAcGFyYW0gIHtGdW5jdGlvbn0gZnVuY1xuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gaXNGdW5jdGlvbihmdW5jOiBGdW5jdGlvbik6IGJvb2xlYW4ge1xuICByZXR1cm4gZnVuYyBpbnN0YW5jZW9mIEZ1bmN0aW9uO1xufVxuXG4vKipcbiAqIFJlbW92ZSBzb21lIHRhc2tzIGJ5IHNvbWUgY29uZGl0aW9uc1xuICpcbiAqIEBwYXJhbSAge0Z1bmN0aW9ufSBmdW5jXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleGNsdWRlU3BlY2lmaWNUYXNrcyh0YXNrOiBJVGFzayk6IGJvb2xlYW4ge1xuICBjb25zdCBjb25kaXRpb25zID0gQXJyYXkuaXNBcnJheSh0aGlzKSA/IHRoaXMgOiBbJ2ZyZWV6ZWQnLCAnbG9ja2VkJ107XG4gIGNvbnN0IHJlc3VsdHMgPSBbXTtcblxuICBjb25kaXRpb25zLmZvckVhY2goKGMpID0+IHtcbiAgICByZXN1bHRzLnB1c2goaGFzUHJvcGVydHkodGFzaywgYykgPT09IGZhbHNlIHx8IHRhc2tbY10gPT09IGZhbHNlKTtcbiAgfSk7XG5cbiAgcmV0dXJuICEocmVzdWx0cy5pbmRleE9mKGZhbHNlKSA+IC0xKTtcbn1cblxuLyoqXG4gKiBDbGVhciB0YXNrcyBieSBpdCdzIHRhZ3NcbiAqXG4gKiBAcGFyYW0gIHtJVGFza30gdGFza1xuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gdXRpbENsZWFyQnlUYWcodGFzazogSVRhc2spOiBib29sZWFuIHtcbiAgaWYgKCFleGNsdWRlU3BlY2lmaWNUYXNrcy5jYWxsKFsnbG9ja2VkJ10sIHRhc2spKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0YXNrLnRhZyA9PT0gdGhpcztcbn1cblxuLyoqXG4gKiBTb3J0IGJ5IGZpZm9cbiAqXG4gKiBAcGFyYW0gIHtJVGFza30gYVxuICogQHBhcmFtICB7SVRhc2t9IGJcbiAqIEByZXR1cm4ge0FueX1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gZmlmbyhhOiBJVGFzaywgYjogSVRhc2spOiBhbnkge1xuICByZXR1cm4gYS5jcmVhdGVkQXQgLSBiLmNyZWF0ZWRBdDtcbn1cblxuLyoqXG4gKiBTb3J0IGJ5IGxpZm9cbiAqXG4gKiBAcGFyYW0gIHtJVGFza30gYVxuICogQHBhcmFtICB7SVRhc2t9IGJcbiAqIEByZXR1cm4ge0FueX1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gbGlmbyhhOiBJVGFzaywgYjogSVRhc2spOiBhbnkge1xuICByZXR1cm4gYi5jcmVhdGVkQXQgLSBhLmNyZWF0ZWRBdDtcbn1cbiJdfQ==
