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
      { 'regenerator-runtime': 5 }
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
      { 'to-function': 7 }
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
      { './runtime': 6 }
    ],
    6: [
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
    7: [
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
    8: [
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
      { './inmemory': 9, './localstorage': 10 }
    ],
    9: [
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
    10: [
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
                              // registerWorkers.call(this);

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
        './console': 13,
        './event': 17,
        './helpers': 18,
        './queue': 20,
        './storage-capsule': 21,
        './utils': 22,
        'babel-runtime/regenerator': 1
      }
    ],
    12: [
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
      { './enum/config.data': 15 }
    ],
    13: [
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
            'color: #a0dc3c;font-weight: bold;'
          );
        }
        function workerRunninLog(_ref19) {
          var _ref20 = _slicedToArray(_ref19, 5),
            worker = _ref20[0],
            workerInstance = _ref20[1],
            task = _ref20[2],
            channel = _ref20[3],
            deps = _ref20[4];
          console.groupCollapsed(worker.name + ' - ' + task.label);
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
      { './enum/log.events': 16, 'object-path': 4 }
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
    15: [
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
    16: [
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
    17: [
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
    18: [
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
                          dependencies = Object.values(deps || {}); // show console
                          logProxy.call(
                            this,
                            _console.workerRunninLog,
                            worker,
                            workerInstance,
                            task,
                            self.name(),
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
      },
      {
        './channel': 11,
        './console': 13,
        './queue': 20,
        './storage-capsule': 21,
        './utils': 22,
        'babel-runtime/regenerator': 1
      }
    ],
    19: [
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
      { './queue': 20 }
    ],
    20: [
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
      { './channel': 11, './config': 12, './container': 14 }
    ],
    21: [
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
        './adapters': 8,
        './utils': 22,
        'babel-runtime/regenerator': 1,
        'group-by': 3
      }
    ],
    22: [
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
  [19]
);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9yZWdlbmVyYXRvci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb21wb25lbnQtcHJvcHMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZ3JvdXAtYnkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvb2JqZWN0LXBhdGgvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcmVnZW5lcmF0b3ItcnVudGltZS9ydW50aW1lLW1vZHVsZS5qcyIsIm5vZGVfbW9kdWxlcy9yZWdlbmVyYXRvci1ydW50aW1lL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvdG8tZnVuY3Rpb24vaW5kZXguanMiLCJzcmMvYWRhcHRlcnMvaW5kZXguanMiLCJzcmMvYWRhcHRlcnMvaW5tZW1vcnkuanMiLCJzcmMvYWRhcHRlcnMvbG9jYWxzdG9yYWdlLmpzIiwic3JjL2NoYW5uZWwuanMiLCJzcmMvY29uZmlnLmpzIiwic3JjL2NvbnNvbGUuanMiLCJzcmMvY29udGFpbmVyLmpzIiwic3JjL2VudW0vY29uZmlnLmRhdGEuanMiLCJzcmMvZW51bS9sb2cuZXZlbnRzLmpzIiwic3JjL2V2ZW50LmpzIiwic3JjL2hlbHBlcnMuanMiLCJzcmMvaW5kZXguanMiLCJzcmMvcXVldWUuanMiLCJzcmMvc3RvcmFnZS1jYXBzdWxlLmpzIiwic3JjL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdnRCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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UyxxQkFBVCxBQUE4QixNQUFzQixDQUN6RCxJQUFNLGFBQWEsTUFBQSxBQUFNLFFBQU4sQUFBYyxRQUFkLEFBQXNCLE9BQU8sQ0FBQSxBQUFDLFdBQWpELEFBQWdELEFBQVksVUFDNUQsSUFBTSxVQUFOLEFBQWdCLEdBRWhCLFdBQUEsQUFBVyxRQUFRLFVBQUEsQUFBQyxHQUFNLENBQ3hCLFFBQUEsQUFBUSxLQUFLLFlBQUEsQUFBWSxNQUFaLEFBQWtCLE9BQWxCLEFBQXlCLFNBQVMsS0FBQSxBQUFLLE9BQXBELEFBQTJELEFBQzVELE9BRkQsR0FJQSxPQUFPLEVBQUUsUUFBQSxBQUFRLFFBQVIsQUFBZ0IsU0FBUyxDQUFsQyxBQUFPLEFBQTRCLEFBQ3BDLEcsRUFFRDs7Ozs7Ozsya0JBUU8sU0FBQSxBQUFTLGVBQVQsQUFBd0IsTUFBc0IsQ0FDbkQsSUFBSSxDQUFDLHFCQUFBLEFBQXFCLEtBQUssQ0FBMUIsQUFBMEIsQUFBQyxXQUFoQyxBQUFLLEFBQXNDLE9BQU8sQ0FDaEQsT0FBQSxBQUFPLEFBQ1IsTUFDRCxRQUFPLEtBQUEsQUFBSyxRQUFaLEFBQW9CLEFBQ3JCLEssRUFFRDs7Ozs7Ozs7eXNCQVNPLFNBQUEsQUFBUyxLQUFULEFBQWMsR0FBZCxBQUF3QixHQUFlLENBQzVDLE9BQU8sRUFBQSxBQUFFLFlBQVksRUFBckIsQUFBdUIsQUFDeEIsVSxFQUVEOzs7Ozs7Oztvd0JBU08sU0FBQSxBQUFTLEtBQVQsQUFBYyxHQUFkLEFBQXdCLEdBQWUsQ0FDNUMsT0FBTyxFQUFBLEFBQUUsWUFBWSxFQUFyQixBQUF1QixBQUN4QiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInJlZ2VuZXJhdG9yLXJ1bnRpbWVcIik7XG4iLCIvKipcbiAqIEdsb2JhbCBOYW1lc1xuICovXG5cbnZhciBnbG9iYWxzID0gL1xcYihBcnJheXxEYXRlfE9iamVjdHxNYXRofEpTT04pXFxiL2c7XG5cbi8qKlxuICogUmV0dXJuIGltbWVkaWF0ZSBpZGVudGlmaWVycyBwYXJzZWQgZnJvbSBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge1N0cmluZ3xGdW5jdGlvbn0gbWFwIGZ1bmN0aW9uIG9yIHByZWZpeFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc3RyLCBmbil7XG4gIHZhciBwID0gdW5pcXVlKHByb3BzKHN0cikpO1xuICBpZiAoZm4gJiYgJ3N0cmluZycgPT0gdHlwZW9mIGZuKSBmbiA9IHByZWZpeGVkKGZuKTtcbiAgaWYgKGZuKSByZXR1cm4gbWFwKHN0ciwgcCwgZm4pO1xuICByZXR1cm4gcDtcbn07XG5cbi8qKlxuICogUmV0dXJuIGltbWVkaWF0ZSBpZGVudGlmaWVycyBpbiBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHByb3BzKHN0cikge1xuICByZXR1cm4gc3RyXG4gICAgLnJlcGxhY2UoL1xcLlxcdyt8XFx3KyAqXFwofFwiW15cIl0qXCJ8J1teJ10qJ3xcXC8oW14vXSspXFwvL2csICcnKVxuICAgIC5yZXBsYWNlKGdsb2JhbHMsICcnKVxuICAgIC5tYXRjaCgvW2EtekEtWl9dXFx3Ki9nKVxuICAgIHx8IFtdO1xufVxuXG4vKipcbiAqIFJldHVybiBgc3RyYCB3aXRoIGBwcm9wc2AgbWFwcGVkIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge0FycmF5fSBwcm9wc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG1hcChzdHIsIHByb3BzLCBmbikge1xuICB2YXIgcmUgPSAvXFwuXFx3K3xcXHcrICpcXCh8XCJbXlwiXSpcInwnW14nXSonfFxcLyhbXi9dKylcXC98W2EtekEtWl9dXFx3Ki9nO1xuICByZXR1cm4gc3RyLnJlcGxhY2UocmUsIGZ1bmN0aW9uKF8pe1xuICAgIGlmICgnKCcgPT0gX1tfLmxlbmd0aCAtIDFdKSByZXR1cm4gZm4oXyk7XG4gICAgaWYgKCF+cHJvcHMuaW5kZXhPZihfKSkgcmV0dXJuIF87XG4gICAgcmV0dXJuIGZuKF8pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gdW5pcXVlIGFycmF5LlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFyclxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiB1bmlxdWUoYXJyKSB7XG4gIHZhciByZXQgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgIGlmICh+cmV0LmluZGV4T2YoYXJyW2ldKSkgY29udGludWU7XG4gICAgcmV0LnB1c2goYXJyW2ldKTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59XG5cbi8qKlxuICogTWFwIHdpdGggcHJlZml4IGBzdHJgLlxuICovXG5cbmZ1bmN0aW9uIHByZWZpeGVkKHN0cikge1xuICByZXR1cm4gZnVuY3Rpb24oXyl7XG4gICAgcmV0dXJuIHN0ciArIF87XG4gIH07XG59XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgdG9GdW5jdGlvbiA9IHJlcXVpcmUoJ3RvLWZ1bmN0aW9uJyk7XG5cbi8qKlxuICogR3JvdXAgYGFycmAgd2l0aCBjYWxsYmFjayBgZm4odmFsLCBpKWAuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufFN0cmluZ30gZm4gb3IgcHJvcFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXJyLCBmbil7XG4gIHZhciByZXQgPSB7fTtcbiAgdmFyIHByb3A7XG4gIGZuID0gdG9GdW5jdGlvbihmbik7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyArK2kpIHtcbiAgICBwcm9wID0gZm4oYXJyW2ldLCBpKTtcbiAgICByZXRbcHJvcF0gPSByZXRbcHJvcF0gfHwgW107XG4gICAgcmV0W3Byb3BdLnB1c2goYXJyW2ldKTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59OyIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSl7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvKmlzdGFuYnVsIGlnbm9yZSBuZXh0OmNhbnQgdGVzdCovXG4gIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgIGRlZmluZShbXSwgZmFjdG9yeSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gQnJvd3NlciBnbG9iYWxzXG4gICAgcm9vdC5vYmplY3RQYXRoID0gZmFjdG9yeSgpO1xuICB9XG59KSh0aGlzLCBmdW5jdGlvbigpe1xuICAndXNlIHN0cmljdCc7XG5cbiAgdmFyIHRvU3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbiAgZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gICAgaWYob2JqID09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICAvL3RvIGhhbmRsZSBvYmplY3RzIHdpdGggbnVsbCBwcm90b3R5cGVzICh0b28gZWRnZSBjYXNlPylcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcClcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzRW1wdHkodmFsdWUpe1xuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgICBmb3IgKHZhciBpIGluIHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoaGFzT3duUHJvcGVydHkodmFsdWUsIGkpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiB0b1N0cmluZyh0eXBlKXtcbiAgICByZXR1cm4gdG9TdHIuY2FsbCh0eXBlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzT2JqZWN0KG9iail7XG4gICAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIHRvU3RyaW5nKG9iaikgPT09IFwiW29iamVjdCBPYmplY3RdXCI7XG4gIH1cblxuICB2YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24ob2JqKXtcbiAgICAvKmlzdGFuYnVsIGlnbm9yZSBuZXh0OmNhbnQgdGVzdCovXG4gICAgcmV0dXJuIHRvU3RyLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzQm9vbGVhbihvYmope1xuICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSAnYm9vbGVhbicgfHwgdG9TdHJpbmcob2JqKSA9PT0gJ1tvYmplY3QgQm9vbGVhbl0nO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0S2V5KGtleSl7XG4gICAgdmFyIGludEtleSA9IHBhcnNlSW50KGtleSk7XG4gICAgaWYgKGludEtleS50b1N0cmluZygpID09PSBrZXkpIHtcbiAgICAgIHJldHVybiBpbnRLZXk7XG4gICAgfVxuICAgIHJldHVybiBrZXk7XG4gIH1cblxuICBmdW5jdGlvbiBmYWN0b3J5KG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuXG4gICAgdmFyIG9iamVjdFBhdGggPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmplY3RQYXRoKS5yZWR1Y2UoZnVuY3Rpb24ocHJveHksIHByb3ApIHtcbiAgICAgICAgaWYocHJvcCA9PT0gJ2NyZWF0ZScpIHtcbiAgICAgICAgICByZXR1cm4gcHJveHk7XG4gICAgICAgIH1cblxuICAgICAgICAvKmlzdGFuYnVsIGlnbm9yZSBlbHNlKi9cbiAgICAgICAgaWYgKHR5cGVvZiBvYmplY3RQYXRoW3Byb3BdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgcHJveHlbcHJvcF0gPSBvYmplY3RQYXRoW3Byb3BdLmJpbmQob2JqZWN0UGF0aCwgb2JqKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwcm94eTtcbiAgICAgIH0sIHt9KTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gaGFzU2hhbGxvd1Byb3BlcnR5KG9iaiwgcHJvcCkge1xuICAgICAgcmV0dXJuIChvcHRpb25zLmluY2x1ZGVJbmhlcml0ZWRQcm9wcyB8fCAodHlwZW9mIHByb3AgPT09ICdudW1iZXInICYmIEFycmF5LmlzQXJyYXkob2JqKSkgfHwgaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSlcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRTaGFsbG93UHJvcGVydHkob2JqLCBwcm9wKSB7XG4gICAgICBpZiAoaGFzU2hhbGxvd1Byb3BlcnR5KG9iaiwgcHJvcCkpIHtcbiAgICAgICAgcmV0dXJuIG9ialtwcm9wXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXQob2JqLCBwYXRoLCB2YWx1ZSwgZG9Ob3RSZXBsYWNlKXtcbiAgICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcGF0aCA9IFtwYXRoXTtcbiAgICAgIH1cbiAgICAgIGlmICghcGF0aCB8fCBwYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBwYXRoID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gc2V0KG9iaiwgcGF0aC5zcGxpdCgnLicpLm1hcChnZXRLZXkpLCB2YWx1ZSwgZG9Ob3RSZXBsYWNlKTtcbiAgICAgIH1cbiAgICAgIHZhciBjdXJyZW50UGF0aCA9IHBhdGhbMF07XG4gICAgICB2YXIgY3VycmVudFZhbHVlID0gZ2V0U2hhbGxvd1Byb3BlcnR5KG9iaiwgY3VycmVudFBhdGgpO1xuICAgICAgaWYgKHBhdGgubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGlmIChjdXJyZW50VmFsdWUgPT09IHZvaWQgMCB8fCAhZG9Ob3RSZXBsYWNlKSB7XG4gICAgICAgICAgb2JqW2N1cnJlbnRQYXRoXSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjdXJyZW50VmFsdWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChjdXJyZW50VmFsdWUgPT09IHZvaWQgMCkge1xuICAgICAgICAvL2NoZWNrIGlmIHdlIGFzc3VtZSBhbiBhcnJheVxuICAgICAgICBpZih0eXBlb2YgcGF0aFsxXSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICBvYmpbY3VycmVudFBhdGhdID0gW107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2JqW2N1cnJlbnRQYXRoXSA9IHt9O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZXQob2JqW2N1cnJlbnRQYXRoXSwgcGF0aC5zbGljZSgxKSwgdmFsdWUsIGRvTm90UmVwbGFjZSk7XG4gICAgfVxuXG4gICAgb2JqZWN0UGF0aC5oYXMgPSBmdW5jdGlvbiAob2JqLCBwYXRoKSB7XG4gICAgICBpZiAodHlwZW9mIHBhdGggPT09ICdudW1iZXInKSB7XG4gICAgICAgIHBhdGggPSBbcGF0aF07XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBwYXRoID09PSAnc3RyaW5nJykge1xuICAgICAgICBwYXRoID0gcGF0aC5zcGxpdCgnLicpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXBhdGggfHwgcGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuICEhb2JqO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhdGgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGogPSBnZXRLZXkocGF0aFtpXSk7XG5cbiAgICAgICAgaWYoKHR5cGVvZiBqID09PSAnbnVtYmVyJyAmJiBpc0FycmF5KG9iaikgJiYgaiA8IG9iai5sZW5ndGgpIHx8XG4gICAgICAgICAgKG9wdGlvbnMuaW5jbHVkZUluaGVyaXRlZFByb3BzID8gKGogaW4gT2JqZWN0KG9iaikpIDogaGFzT3duUHJvcGVydHkob2JqLCBqKSkpIHtcbiAgICAgICAgICBvYmogPSBvYmpbal07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICBvYmplY3RQYXRoLmVuc3VyZUV4aXN0cyA9IGZ1bmN0aW9uIChvYmosIHBhdGgsIHZhbHVlKXtcbiAgICAgIHJldHVybiBzZXQob2JqLCBwYXRoLCB2YWx1ZSwgdHJ1ZSk7XG4gICAgfTtcblxuICAgIG9iamVjdFBhdGguc2V0ID0gZnVuY3Rpb24gKG9iaiwgcGF0aCwgdmFsdWUsIGRvTm90UmVwbGFjZSl7XG4gICAgICByZXR1cm4gc2V0KG9iaiwgcGF0aCwgdmFsdWUsIGRvTm90UmVwbGFjZSk7XG4gICAgfTtcblxuICAgIG9iamVjdFBhdGguaW5zZXJ0ID0gZnVuY3Rpb24gKG9iaiwgcGF0aCwgdmFsdWUsIGF0KXtcbiAgICAgIHZhciBhcnIgPSBvYmplY3RQYXRoLmdldChvYmosIHBhdGgpO1xuICAgICAgYXQgPSB+fmF0O1xuICAgICAgaWYgKCFpc0FycmF5KGFycikpIHtcbiAgICAgICAgYXJyID0gW107XG4gICAgICAgIG9iamVjdFBhdGguc2V0KG9iaiwgcGF0aCwgYXJyKTtcbiAgICAgIH1cbiAgICAgIGFyci5zcGxpY2UoYXQsIDAsIHZhbHVlKTtcbiAgICB9O1xuXG4gICAgb2JqZWN0UGF0aC5lbXB0eSA9IGZ1bmN0aW9uKG9iaiwgcGF0aCkge1xuICAgICAgaWYgKGlzRW1wdHkocGF0aCkpIHtcbiAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICAgIH1cbiAgICAgIGlmIChvYmogPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgfVxuXG4gICAgICB2YXIgdmFsdWUsIGk7XG4gICAgICBpZiAoISh2YWx1ZSA9IG9iamVjdFBhdGguZ2V0KG9iaiwgcGF0aCkpKSB7XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBvYmplY3RQYXRoLnNldChvYmosIHBhdGgsICcnKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNCb29sZWFuKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gb2JqZWN0UGF0aC5zZXQob2JqLCBwYXRoLCBmYWxzZSk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdFBhdGguc2V0KG9iaiwgcGF0aCwgMCk7XG4gICAgICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgIHZhbHVlLmxlbmd0aCA9IDA7XG4gICAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KHZhbHVlKSkge1xuICAgICAgICBmb3IgKGkgaW4gdmFsdWUpIHtcbiAgICAgICAgICBpZiAoaGFzU2hhbGxvd1Byb3BlcnR5KHZhbHVlLCBpKSkge1xuICAgICAgICAgICAgZGVsZXRlIHZhbHVlW2ldO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdFBhdGguc2V0KG9iaiwgcGF0aCwgbnVsbCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIG9iamVjdFBhdGgucHVzaCA9IGZ1bmN0aW9uIChvYmosIHBhdGggLyosIHZhbHVlcyAqLyl7XG4gICAgICB2YXIgYXJyID0gb2JqZWN0UGF0aC5nZXQob2JqLCBwYXRoKTtcbiAgICAgIGlmICghaXNBcnJheShhcnIpKSB7XG4gICAgICAgIGFyciA9IFtdO1xuICAgICAgICBvYmplY3RQYXRoLnNldChvYmosIHBhdGgsIGFycik7XG4gICAgICB9XG5cbiAgICAgIGFyci5wdXNoLmFwcGx5KGFyciwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKSk7XG4gICAgfTtcblxuICAgIG9iamVjdFBhdGguY29hbGVzY2UgPSBmdW5jdGlvbiAob2JqLCBwYXRocywgZGVmYXVsdFZhbHVlKSB7XG4gICAgICB2YXIgdmFsdWU7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBwYXRocy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAoKHZhbHVlID0gb2JqZWN0UGF0aC5nZXQob2JqLCBwYXRoc1tpXSkpICE9PSB2b2lkIDApIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICB9O1xuXG4gICAgb2JqZWN0UGF0aC5nZXQgPSBmdW5jdGlvbiAob2JqLCBwYXRoLCBkZWZhdWx0VmFsdWUpe1xuICAgICAgaWYgKHR5cGVvZiBwYXRoID09PSAnbnVtYmVyJykge1xuICAgICAgICBwYXRoID0gW3BhdGhdO1xuICAgICAgfVxuICAgICAgaWYgKCFwYXRoIHx8IHBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgICB9XG4gICAgICBpZiAob2JqID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdFBhdGguZ2V0KG9iaiwgcGF0aC5zcGxpdCgnLicpLCBkZWZhdWx0VmFsdWUpO1xuICAgICAgfVxuXG4gICAgICB2YXIgY3VycmVudFBhdGggPSBnZXRLZXkocGF0aFswXSk7XG4gICAgICB2YXIgbmV4dE9iaiA9IGdldFNoYWxsb3dQcm9wZXJ0eShvYmosIGN1cnJlbnRQYXRoKVxuICAgICAgaWYgKG5leHRPYmogPT09IHZvaWQgMCkge1xuICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICAgICAgfVxuXG4gICAgICBpZiAocGF0aC5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIG5leHRPYmo7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvYmplY3RQYXRoLmdldChvYmpbY3VycmVudFBhdGhdLCBwYXRoLnNsaWNlKDEpLCBkZWZhdWx0VmFsdWUpO1xuICAgIH07XG5cbiAgICBvYmplY3RQYXRoLmRlbCA9IGZ1bmN0aW9uIGRlbChvYmosIHBhdGgpIHtcbiAgICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcGF0aCA9IFtwYXRoXTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9iaiA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc0VtcHR5KHBhdGgpKSB7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgICB9XG4gICAgICBpZih0eXBlb2YgcGF0aCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdFBhdGguZGVsKG9iaiwgcGF0aC5zcGxpdCgnLicpKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGN1cnJlbnRQYXRoID0gZ2V0S2V5KHBhdGhbMF0pO1xuICAgICAgaWYgKCFoYXNTaGFsbG93UHJvcGVydHkob2JqLCBjdXJyZW50UGF0aCkpIHtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgIH1cblxuICAgICAgaWYocGF0aC5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgICAgICAgIG9iai5zcGxpY2UoY3VycmVudFBhdGgsIDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZSBvYmpbY3VycmVudFBhdGhdO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gb2JqZWN0UGF0aC5kZWwob2JqW2N1cnJlbnRQYXRoXSwgcGF0aC5zbGljZSgxKSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iamVjdFBhdGg7XG4gIH1cblxuICB2YXIgbW9kID0gZmFjdG9yeSgpO1xuICBtb2QuY3JlYXRlID0gZmFjdG9yeTtcbiAgbW9kLndpdGhJbmhlcml0ZWRQcm9wcyA9IGZhY3Rvcnkoe2luY2x1ZGVJbmhlcml0ZWRQcm9wczogdHJ1ZX0pXG4gIHJldHVybiBtb2Q7XG59KTtcbiIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLy8gVGhpcyBtZXRob2Qgb2Ygb2J0YWluaW5nIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0IG5lZWRzIHRvIGJlXG4vLyBrZXB0IGlkZW50aWNhbCB0byB0aGUgd2F5IGl0IGlzIG9idGFpbmVkIGluIHJ1bnRpbWUuanNcbnZhciBnID0gKGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcyB9KSgpIHx8IEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKTtcblxuLy8gVXNlIGBnZXRPd25Qcm9wZXJ0eU5hbWVzYCBiZWNhdXNlIG5vdCBhbGwgYnJvd3NlcnMgc3VwcG9ydCBjYWxsaW5nXG4vLyBgaGFzT3duUHJvcGVydHlgIG9uIHRoZSBnbG9iYWwgYHNlbGZgIG9iamVjdCBpbiBhIHdvcmtlci4gU2VlICMxODMuXG52YXIgaGFkUnVudGltZSA9IGcucmVnZW5lcmF0b3JSdW50aW1lICYmXG4gIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGcpLmluZGV4T2YoXCJyZWdlbmVyYXRvclJ1bnRpbWVcIikgPj0gMDtcblxuLy8gU2F2ZSB0aGUgb2xkIHJlZ2VuZXJhdG9yUnVudGltZSBpbiBjYXNlIGl0IG5lZWRzIHRvIGJlIHJlc3RvcmVkIGxhdGVyLlxudmFyIG9sZFJ1bnRpbWUgPSBoYWRSdW50aW1lICYmIGcucmVnZW5lcmF0b3JSdW50aW1lO1xuXG4vLyBGb3JjZSByZWV2YWx1dGF0aW9uIG9mIHJ1bnRpbWUuanMuXG5nLnJlZ2VuZXJhdG9yUnVudGltZSA9IHVuZGVmaW5lZDtcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi9ydW50aW1lXCIpO1xuXG5pZiAoaGFkUnVudGltZSkge1xuICAvLyBSZXN0b3JlIHRoZSBvcmlnaW5hbCBydW50aW1lLlxuICBnLnJlZ2VuZXJhdG9yUnVudGltZSA9IG9sZFJ1bnRpbWU7XG59IGVsc2Uge1xuICAvLyBSZW1vdmUgdGhlIGdsb2JhbCBwcm9wZXJ0eSBhZGRlZCBieSBydW50aW1lLmpzLlxuICB0cnkge1xuICAgIGRlbGV0ZSBnLnJlZ2VuZXJhdG9yUnVudGltZTtcbiAgfSBjYXRjaChlKSB7XG4gICAgZy5yZWdlbmVyYXRvclJ1bnRpbWUgPSB1bmRlZmluZWQ7XG4gIH1cbn1cbiIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuIShmdW5jdGlvbihnbG9iYWwpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIE9wID0gT2JqZWN0LnByb3RvdHlwZTtcbiAgdmFyIGhhc093biA9IE9wLmhhc093blByb3BlcnR5O1xuICB2YXIgdW5kZWZpbmVkOyAvLyBNb3JlIGNvbXByZXNzaWJsZSB0aGFuIHZvaWQgMC5cbiAgdmFyICRTeW1ib2wgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgPyBTeW1ib2wgOiB7fTtcbiAgdmFyIGl0ZXJhdG9yU3ltYm9sID0gJFN5bWJvbC5pdGVyYXRvciB8fCBcIkBAaXRlcmF0b3JcIjtcbiAgdmFyIGFzeW5jSXRlcmF0b3JTeW1ib2wgPSAkU3ltYm9sLmFzeW5jSXRlcmF0b3IgfHwgXCJAQGFzeW5jSXRlcmF0b3JcIjtcbiAgdmFyIHRvU3RyaW5nVGFnU3ltYm9sID0gJFN5bWJvbC50b1N0cmluZ1RhZyB8fCBcIkBAdG9TdHJpbmdUYWdcIjtcblxuICB2YXIgaW5Nb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiO1xuICB2YXIgcnVudGltZSA9IGdsb2JhbC5yZWdlbmVyYXRvclJ1bnRpbWU7XG4gIGlmIChydW50aW1lKSB7XG4gICAgaWYgKGluTW9kdWxlKSB7XG4gICAgICAvLyBJZiByZWdlbmVyYXRvclJ1bnRpbWUgaXMgZGVmaW5lZCBnbG9iYWxseSBhbmQgd2UncmUgaW4gYSBtb2R1bGUsXG4gICAgICAvLyBtYWtlIHRoZSBleHBvcnRzIG9iamVjdCBpZGVudGljYWwgdG8gcmVnZW5lcmF0b3JSdW50aW1lLlxuICAgICAgbW9kdWxlLmV4cG9ydHMgPSBydW50aW1lO1xuICAgIH1cbiAgICAvLyBEb24ndCBib3RoZXIgZXZhbHVhdGluZyB0aGUgcmVzdCBvZiB0aGlzIGZpbGUgaWYgdGhlIHJ1bnRpbWUgd2FzXG4gICAgLy8gYWxyZWFkeSBkZWZpbmVkIGdsb2JhbGx5LlxuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIERlZmluZSB0aGUgcnVudGltZSBnbG9iYWxseSAoYXMgZXhwZWN0ZWQgYnkgZ2VuZXJhdGVkIGNvZGUpIGFzIGVpdGhlclxuICAvLyBtb2R1bGUuZXhwb3J0cyAoaWYgd2UncmUgaW4gYSBtb2R1bGUpIG9yIGEgbmV3LCBlbXB0eSBvYmplY3QuXG4gIHJ1bnRpbWUgPSBnbG9iYWwucmVnZW5lcmF0b3JSdW50aW1lID0gaW5Nb2R1bGUgPyBtb2R1bGUuZXhwb3J0cyA6IHt9O1xuXG4gIGZ1bmN0aW9uIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBJZiBvdXRlckZuIHByb3ZpZGVkIGFuZCBvdXRlckZuLnByb3RvdHlwZSBpcyBhIEdlbmVyYXRvciwgdGhlbiBvdXRlckZuLnByb3RvdHlwZSBpbnN0YW5jZW9mIEdlbmVyYXRvci5cbiAgICB2YXIgcHJvdG9HZW5lcmF0b3IgPSBvdXRlckZuICYmIG91dGVyRm4ucHJvdG90eXBlIGluc3RhbmNlb2YgR2VuZXJhdG9yID8gb3V0ZXJGbiA6IEdlbmVyYXRvcjtcbiAgICB2YXIgZ2VuZXJhdG9yID0gT2JqZWN0LmNyZWF0ZShwcm90b0dlbmVyYXRvci5wcm90b3R5cGUpO1xuICAgIHZhciBjb250ZXh0ID0gbmV3IENvbnRleHQodHJ5TG9jc0xpc3QgfHwgW10pO1xuXG4gICAgLy8gVGhlIC5faW52b2tlIG1ldGhvZCB1bmlmaWVzIHRoZSBpbXBsZW1lbnRhdGlvbnMgb2YgdGhlIC5uZXh0LFxuICAgIC8vIC50aHJvdywgYW5kIC5yZXR1cm4gbWV0aG9kcy5cbiAgICBnZW5lcmF0b3IuX2ludm9rZSA9IG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCk7XG5cbiAgICByZXR1cm4gZ2VuZXJhdG9yO1xuICB9XG4gIHJ1bnRpbWUud3JhcCA9IHdyYXA7XG5cbiAgLy8gVHJ5L2NhdGNoIGhlbHBlciB0byBtaW5pbWl6ZSBkZW9wdGltaXphdGlvbnMuIFJldHVybnMgYSBjb21wbGV0aW9uXG4gIC8vIHJlY29yZCBsaWtlIGNvbnRleHQudHJ5RW50cmllc1tpXS5jb21wbGV0aW9uLiBUaGlzIGludGVyZmFjZSBjb3VsZFxuICAvLyBoYXZlIGJlZW4gKGFuZCB3YXMgcHJldmlvdXNseSkgZGVzaWduZWQgdG8gdGFrZSBhIGNsb3N1cmUgdG8gYmVcbiAgLy8gaW52b2tlZCB3aXRob3V0IGFyZ3VtZW50cywgYnV0IGluIGFsbCB0aGUgY2FzZXMgd2UgY2FyZSBhYm91dCB3ZVxuICAvLyBhbHJlYWR5IGhhdmUgYW4gZXhpc3RpbmcgbWV0aG9kIHdlIHdhbnQgdG8gY2FsbCwgc28gdGhlcmUncyBubyBuZWVkXG4gIC8vIHRvIGNyZWF0ZSBhIG5ldyBmdW5jdGlvbiBvYmplY3QuIFdlIGNhbiBldmVuIGdldCBhd2F5IHdpdGggYXNzdW1pbmdcbiAgLy8gdGhlIG1ldGhvZCB0YWtlcyBleGFjdGx5IG9uZSBhcmd1bWVudCwgc2luY2UgdGhhdCBoYXBwZW5zIHRvIGJlIHRydWVcbiAgLy8gaW4gZXZlcnkgY2FzZSwgc28gd2UgZG9uJ3QgaGF2ZSB0byB0b3VjaCB0aGUgYXJndW1lbnRzIG9iamVjdC4gVGhlXG4gIC8vIG9ubHkgYWRkaXRpb25hbCBhbGxvY2F0aW9uIHJlcXVpcmVkIGlzIHRoZSBjb21wbGV0aW9uIHJlY29yZCwgd2hpY2hcbiAgLy8gaGFzIGEgc3RhYmxlIHNoYXBlIGFuZCBzbyBob3BlZnVsbHkgc2hvdWxkIGJlIGNoZWFwIHRvIGFsbG9jYXRlLlxuICBmdW5jdGlvbiB0cnlDYXRjaChmbiwgb2JqLCBhcmcpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJub3JtYWxcIiwgYXJnOiBmbi5jYWxsKG9iaiwgYXJnKSB9O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJ0aHJvd1wiLCBhcmc6IGVyciB9O1xuICAgIH1cbiAgfVxuXG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0ID0gXCJzdXNwZW5kZWRTdGFydFwiO1xuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRZaWVsZCA9IFwic3VzcGVuZGVkWWllbGRcIjtcbiAgdmFyIEdlblN0YXRlRXhlY3V0aW5nID0gXCJleGVjdXRpbmdcIjtcbiAgdmFyIEdlblN0YXRlQ29tcGxldGVkID0gXCJjb21wbGV0ZWRcIjtcblxuICAvLyBSZXR1cm5pbmcgdGhpcyBvYmplY3QgZnJvbSB0aGUgaW5uZXJGbiBoYXMgdGhlIHNhbWUgZWZmZWN0IGFzXG4gIC8vIGJyZWFraW5nIG91dCBvZiB0aGUgZGlzcGF0Y2ggc3dpdGNoIHN0YXRlbWVudC5cbiAgdmFyIENvbnRpbnVlU2VudGluZWwgPSB7fTtcblxuICAvLyBEdW1teSBjb25zdHJ1Y3RvciBmdW5jdGlvbnMgdGhhdCB3ZSB1c2UgYXMgdGhlIC5jb25zdHJ1Y3RvciBhbmRcbiAgLy8gLmNvbnN0cnVjdG9yLnByb3RvdHlwZSBwcm9wZXJ0aWVzIGZvciBmdW5jdGlvbnMgdGhhdCByZXR1cm4gR2VuZXJhdG9yXG4gIC8vIG9iamVjdHMuIEZvciBmdWxsIHNwZWMgY29tcGxpYW5jZSwgeW91IG1heSB3aXNoIHRvIGNvbmZpZ3VyZSB5b3VyXG4gIC8vIG1pbmlmaWVyIG5vdCB0byBtYW5nbGUgdGhlIG5hbWVzIG9mIHRoZXNlIHR3byBmdW5jdGlvbnMuXG4gIGZ1bmN0aW9uIEdlbmVyYXRvcigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUoKSB7fVxuXG4gIC8vIFRoaXMgaXMgYSBwb2x5ZmlsbCBmb3IgJUl0ZXJhdG9yUHJvdG90eXBlJSBmb3IgZW52aXJvbm1lbnRzIHRoYXRcbiAgLy8gZG9uJ3QgbmF0aXZlbHkgc3VwcG9ydCBpdC5cbiAgdmFyIEl0ZXJhdG9yUHJvdG90eXBlID0ge307XG4gIEl0ZXJhdG9yUHJvdG90eXBlW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB2YXIgZ2V0UHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Y7XG4gIHZhciBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSA9IGdldFByb3RvICYmIGdldFByb3RvKGdldFByb3RvKHZhbHVlcyhbXSkpKTtcbiAgaWYgKE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlICYmXG4gICAgICBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSAhPT0gT3AgJiZcbiAgICAgIGhhc093bi5jYWxsKE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlLCBpdGVyYXRvclN5bWJvbCkpIHtcbiAgICAvLyBUaGlzIGVudmlyb25tZW50IGhhcyBhIG5hdGl2ZSAlSXRlcmF0b3JQcm90b3R5cGUlOyB1c2UgaXQgaW5zdGVhZFxuICAgIC8vIG9mIHRoZSBwb2x5ZmlsbC5cbiAgICBJdGVyYXRvclByb3RvdHlwZSA9IE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlO1xuICB9XG5cbiAgdmFyIEdwID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUucHJvdG90eXBlID1cbiAgICBHZW5lcmF0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShJdGVyYXRvclByb3RvdHlwZSk7XG4gIEdlbmVyYXRvckZ1bmN0aW9uLnByb3RvdHlwZSA9IEdwLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb247XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlW3RvU3RyaW5nVGFnU3ltYm9sXSA9XG4gICAgR2VuZXJhdG9yRnVuY3Rpb24uZGlzcGxheU5hbWUgPSBcIkdlbmVyYXRvckZ1bmN0aW9uXCI7XG5cbiAgLy8gSGVscGVyIGZvciBkZWZpbmluZyB0aGUgLm5leHQsIC50aHJvdywgYW5kIC5yZXR1cm4gbWV0aG9kcyBvZiB0aGVcbiAgLy8gSXRlcmF0b3IgaW50ZXJmYWNlIGluIHRlcm1zIG9mIGEgc2luZ2xlIC5faW52b2tlIG1ldGhvZC5cbiAgZnVuY3Rpb24gZGVmaW5lSXRlcmF0b3JNZXRob2RzKHByb3RvdHlwZSkge1xuICAgIFtcIm5leHRcIiwgXCJ0aHJvd1wiLCBcInJldHVyblwiXS5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgcHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbihhcmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludm9rZShtZXRob2QsIGFyZyk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgcnVudGltZS5pc0dlbmVyYXRvckZ1bmN0aW9uID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgdmFyIGN0b3IgPSB0eXBlb2YgZ2VuRnVuID09PSBcImZ1bmN0aW9uXCIgJiYgZ2VuRnVuLmNvbnN0cnVjdG9yO1xuICAgIHJldHVybiBjdG9yXG4gICAgICA/IGN0b3IgPT09IEdlbmVyYXRvckZ1bmN0aW9uIHx8XG4gICAgICAgIC8vIEZvciB0aGUgbmF0aXZlIEdlbmVyYXRvckZ1bmN0aW9uIGNvbnN0cnVjdG9yLCB0aGUgYmVzdCB3ZSBjYW5cbiAgICAgICAgLy8gZG8gaXMgdG8gY2hlY2sgaXRzIC5uYW1lIHByb3BlcnR5LlxuICAgICAgICAoY3Rvci5kaXNwbGF5TmFtZSB8fCBjdG9yLm5hbWUpID09PSBcIkdlbmVyYXRvckZ1bmN0aW9uXCJcbiAgICAgIDogZmFsc2U7XG4gIH07XG5cbiAgcnVudGltZS5tYXJrID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgaWYgKE9iamVjdC5zZXRQcm90b3R5cGVPZikge1xuICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKGdlbkZ1biwgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnZW5GdW4uX19wcm90b19fID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gICAgICBpZiAoISh0b1N0cmluZ1RhZ1N5bWJvbCBpbiBnZW5GdW4pKSB7XG4gICAgICAgIGdlbkZ1blt0b1N0cmluZ1RhZ1N5bWJvbF0gPSBcIkdlbmVyYXRvckZ1bmN0aW9uXCI7XG4gICAgICB9XG4gICAgfVxuICAgIGdlbkZ1bi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEdwKTtcbiAgICByZXR1cm4gZ2VuRnVuO1xuICB9O1xuXG4gIC8vIFdpdGhpbiB0aGUgYm9keSBvZiBhbnkgYXN5bmMgZnVuY3Rpb24sIGBhd2FpdCB4YCBpcyB0cmFuc2Zvcm1lZCB0b1xuICAvLyBgeWllbGQgcmVnZW5lcmF0b3JSdW50aW1lLmF3cmFwKHgpYCwgc28gdGhhdCB0aGUgcnVudGltZSBjYW4gdGVzdFxuICAvLyBgaGFzT3duLmNhbGwodmFsdWUsIFwiX19hd2FpdFwiKWAgdG8gZGV0ZXJtaW5lIGlmIHRoZSB5aWVsZGVkIHZhbHVlIGlzXG4gIC8vIG1lYW50IHRvIGJlIGF3YWl0ZWQuXG4gIHJ1bnRpbWUuYXdyYXAgPSBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4geyBfX2F3YWl0OiBhcmcgfTtcbiAgfTtcblxuICBmdW5jdGlvbiBBc3luY0l0ZXJhdG9yKGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZywgcmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goZ2VuZXJhdG9yW21ldGhvZF0sIGdlbmVyYXRvciwgYXJnKTtcbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHJlamVjdChyZWNvcmQuYXJnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciByZXN1bHQgPSByZWNvcmQuYXJnO1xuICAgICAgICB2YXIgdmFsdWUgPSByZXN1bHQudmFsdWU7XG4gICAgICAgIGlmICh2YWx1ZSAmJlxuICAgICAgICAgICAgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgICAgICBoYXNPd24uY2FsbCh2YWx1ZSwgXCJfX2F3YWl0XCIpKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZS5fX2F3YWl0KS50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICBpbnZva2UoXCJuZXh0XCIsIHZhbHVlLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgaW52b2tlKFwidGhyb3dcIiwgZXJyLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSkudGhlbihmdW5jdGlvbih1bndyYXBwZWQpIHtcbiAgICAgICAgICAvLyBXaGVuIGEgeWllbGRlZCBQcm9taXNlIGlzIHJlc29sdmVkLCBpdHMgZmluYWwgdmFsdWUgYmVjb21lc1xuICAgICAgICAgIC8vIHRoZSAudmFsdWUgb2YgdGhlIFByb21pc2U8e3ZhbHVlLGRvbmV9PiByZXN1bHQgZm9yIHRoZVxuICAgICAgICAgIC8vIGN1cnJlbnQgaXRlcmF0aW9uLiBJZiB0aGUgUHJvbWlzZSBpcyByZWplY3RlZCwgaG93ZXZlciwgdGhlXG4gICAgICAgICAgLy8gcmVzdWx0IGZvciB0aGlzIGl0ZXJhdGlvbiB3aWxsIGJlIHJlamVjdGVkIHdpdGggdGhlIHNhbWVcbiAgICAgICAgICAvLyByZWFzb24uIE5vdGUgdGhhdCByZWplY3Rpb25zIG9mIHlpZWxkZWQgUHJvbWlzZXMgYXJlIG5vdFxuICAgICAgICAgIC8vIHRocm93biBiYWNrIGludG8gdGhlIGdlbmVyYXRvciBmdW5jdGlvbiwgYXMgaXMgdGhlIGNhc2VcbiAgICAgICAgICAvLyB3aGVuIGFuIGF3YWl0ZWQgUHJvbWlzZSBpcyByZWplY3RlZC4gVGhpcyBkaWZmZXJlbmNlIGluXG4gICAgICAgICAgLy8gYmVoYXZpb3IgYmV0d2VlbiB5aWVsZCBhbmQgYXdhaXQgaXMgaW1wb3J0YW50LCBiZWNhdXNlIGl0XG4gICAgICAgICAgLy8gYWxsb3dzIHRoZSBjb25zdW1lciB0byBkZWNpZGUgd2hhdCB0byBkbyB3aXRoIHRoZSB5aWVsZGVkXG4gICAgICAgICAgLy8gcmVqZWN0aW9uIChzd2FsbG93IGl0IGFuZCBjb250aW51ZSwgbWFudWFsbHkgLnRocm93IGl0IGJhY2tcbiAgICAgICAgICAvLyBpbnRvIHRoZSBnZW5lcmF0b3IsIGFiYW5kb24gaXRlcmF0aW9uLCB3aGF0ZXZlcikuIFdpdGhcbiAgICAgICAgICAvLyBhd2FpdCwgYnkgY29udHJhc3QsIHRoZXJlIGlzIG5vIG9wcG9ydHVuaXR5IHRvIGV4YW1pbmUgdGhlXG4gICAgICAgICAgLy8gcmVqZWN0aW9uIHJlYXNvbiBvdXRzaWRlIHRoZSBnZW5lcmF0b3IgZnVuY3Rpb24sIHNvIHRoZVxuICAgICAgICAgIC8vIG9ubHkgb3B0aW9uIGlzIHRvIHRocm93IGl0IGZyb20gdGhlIGF3YWl0IGV4cHJlc3Npb24sIGFuZFxuICAgICAgICAgIC8vIGxldCB0aGUgZ2VuZXJhdG9yIGZ1bmN0aW9uIGhhbmRsZSB0aGUgZXhjZXB0aW9uLlxuICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IHVud3JhcHBlZDtcbiAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH0sIHJlamVjdCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHByZXZpb3VzUHJvbWlzZTtcblxuICAgIGZ1bmN0aW9uIGVucXVldWUobWV0aG9kLCBhcmcpIHtcbiAgICAgIGZ1bmN0aW9uIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgaW52b2tlKG1ldGhvZCwgYXJnLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHByZXZpb3VzUHJvbWlzZSA9XG4gICAgICAgIC8vIElmIGVucXVldWUgaGFzIGJlZW4gY2FsbGVkIGJlZm9yZSwgdGhlbiB3ZSB3YW50IHRvIHdhaXQgdW50aWxcbiAgICAgICAgLy8gYWxsIHByZXZpb3VzIFByb21pc2VzIGhhdmUgYmVlbiByZXNvbHZlZCBiZWZvcmUgY2FsbGluZyBpbnZva2UsXG4gICAgICAgIC8vIHNvIHRoYXQgcmVzdWx0cyBhcmUgYWx3YXlzIGRlbGl2ZXJlZCBpbiB0aGUgY29ycmVjdCBvcmRlci4gSWZcbiAgICAgICAgLy8gZW5xdWV1ZSBoYXMgbm90IGJlZW4gY2FsbGVkIGJlZm9yZSwgdGhlbiBpdCBpcyBpbXBvcnRhbnQgdG9cbiAgICAgICAgLy8gY2FsbCBpbnZva2UgaW1tZWRpYXRlbHksIHdpdGhvdXQgd2FpdGluZyBvbiBhIGNhbGxiYWNrIHRvIGZpcmUsXG4gICAgICAgIC8vIHNvIHRoYXQgdGhlIGFzeW5jIGdlbmVyYXRvciBmdW5jdGlvbiBoYXMgdGhlIG9wcG9ydHVuaXR5IHRvIGRvXG4gICAgICAgIC8vIGFueSBuZWNlc3Nhcnkgc2V0dXAgaW4gYSBwcmVkaWN0YWJsZSB3YXkuIFRoaXMgcHJlZGljdGFiaWxpdHlcbiAgICAgICAgLy8gaXMgd2h5IHRoZSBQcm9taXNlIGNvbnN0cnVjdG9yIHN5bmNocm9ub3VzbHkgaW52b2tlcyBpdHNcbiAgICAgICAgLy8gZXhlY3V0b3IgY2FsbGJhY2ssIGFuZCB3aHkgYXN5bmMgZnVuY3Rpb25zIHN5bmNocm9ub3VzbHlcbiAgICAgICAgLy8gZXhlY3V0ZSBjb2RlIGJlZm9yZSB0aGUgZmlyc3QgYXdhaXQuIFNpbmNlIHdlIGltcGxlbWVudCBzaW1wbGVcbiAgICAgICAgLy8gYXN5bmMgZnVuY3Rpb25zIGluIHRlcm1zIG9mIGFzeW5jIGdlbmVyYXRvcnMsIGl0IGlzIGVzcGVjaWFsbHlcbiAgICAgICAgLy8gaW1wb3J0YW50IHRvIGdldCB0aGlzIHJpZ2h0LCBldmVuIHRob3VnaCBpdCByZXF1aXJlcyBjYXJlLlxuICAgICAgICBwcmV2aW91c1Byb21pc2UgPyBwcmV2aW91c1Byb21pc2UudGhlbihcbiAgICAgICAgICBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZyxcbiAgICAgICAgICAvLyBBdm9pZCBwcm9wYWdhdGluZyBmYWlsdXJlcyB0byBQcm9taXNlcyByZXR1cm5lZCBieSBsYXRlclxuICAgICAgICAgIC8vIGludm9jYXRpb25zIG9mIHRoZSBpdGVyYXRvci5cbiAgICAgICAgICBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZ1xuICAgICAgICApIDogY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcoKTtcbiAgICB9XG5cbiAgICAvLyBEZWZpbmUgdGhlIHVuaWZpZWQgaGVscGVyIG1ldGhvZCB0aGF0IGlzIHVzZWQgdG8gaW1wbGVtZW50IC5uZXh0LFxuICAgIC8vIC50aHJvdywgYW5kIC5yZXR1cm4gKHNlZSBkZWZpbmVJdGVyYXRvck1ldGhvZHMpLlxuICAgIHRoaXMuX2ludm9rZSA9IGVucXVldWU7XG4gIH1cblxuICBkZWZpbmVJdGVyYXRvck1ldGhvZHMoQXN5bmNJdGVyYXRvci5wcm90b3R5cGUpO1xuICBBc3luY0l0ZXJhdG9yLnByb3RvdHlwZVthc3luY0l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgcnVudGltZS5Bc3luY0l0ZXJhdG9yID0gQXN5bmNJdGVyYXRvcjtcblxuICAvLyBOb3RlIHRoYXQgc2ltcGxlIGFzeW5jIGZ1bmN0aW9ucyBhcmUgaW1wbGVtZW50ZWQgb24gdG9wIG9mXG4gIC8vIEFzeW5jSXRlcmF0b3Igb2JqZWN0czsgdGhleSBqdXN0IHJldHVybiBhIFByb21pc2UgZm9yIHRoZSB2YWx1ZSBvZlxuICAvLyB0aGUgZmluYWwgcmVzdWx0IHByb2R1Y2VkIGJ5IHRoZSBpdGVyYXRvci5cbiAgcnVudGltZS5hc3luYyA9IGZ1bmN0aW9uKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSB7XG4gICAgdmFyIGl0ZXIgPSBuZXcgQXN5bmNJdGVyYXRvcihcbiAgICAgIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpXG4gICAgKTtcblxuICAgIHJldHVybiBydW50aW1lLmlzR2VuZXJhdG9yRnVuY3Rpb24ob3V0ZXJGbilcbiAgICAgID8gaXRlciAvLyBJZiBvdXRlckZuIGlzIGEgZ2VuZXJhdG9yLCByZXR1cm4gdGhlIGZ1bGwgaXRlcmF0b3IuXG4gICAgICA6IGl0ZXIubmV4dCgpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdC5kb25lID8gcmVzdWx0LnZhbHVlIDogaXRlci5uZXh0KCk7XG4gICAgICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCkge1xuICAgIHZhciBzdGF0ZSA9IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQ7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnKSB7XG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlRXhlY3V0aW5nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IHJ1bm5pbmdcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVDb21wbGV0ZWQpIHtcbiAgICAgICAgaWYgKG1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgdGhyb3cgYXJnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQmUgZm9yZ2l2aW5nLCBwZXIgMjUuMy4zLjMuMyBvZiB0aGUgc3BlYzpcbiAgICAgICAgLy8gaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLWdlbmVyYXRvcnJlc3VtZVxuICAgICAgICByZXR1cm4gZG9uZVJlc3VsdCgpO1xuICAgICAgfVxuXG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IG1ldGhvZDtcbiAgICAgIGNvbnRleHQuYXJnID0gYXJnO1xuXG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICB2YXIgZGVsZWdhdGUgPSBjb250ZXh0LmRlbGVnYXRlO1xuICAgICAgICBpZiAoZGVsZWdhdGUpIHtcbiAgICAgICAgICB2YXIgZGVsZWdhdGVSZXN1bHQgPSBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KTtcbiAgICAgICAgICBpZiAoZGVsZWdhdGVSZXN1bHQpIHtcbiAgICAgICAgICAgIGlmIChkZWxlZ2F0ZVJlc3VsdCA9PT0gQ29udGludWVTZW50aW5lbCkgY29udGludWU7XG4gICAgICAgICAgICByZXR1cm4gZGVsZWdhdGVSZXN1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAgIC8vIFNldHRpbmcgY29udGV4dC5fc2VudCBmb3IgbGVnYWN5IHN1cHBvcnQgb2YgQmFiZWwnc1xuICAgICAgICAgIC8vIGZ1bmN0aW9uLnNlbnQgaW1wbGVtZW50YXRpb24uXG4gICAgICAgICAgY29udGV4dC5zZW50ID0gY29udGV4dC5fc2VudCA9IGNvbnRleHQuYXJnO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydCkge1xuICAgICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAgIHRocm93IGNvbnRleHQuYXJnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oY29udGV4dC5hcmcpO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dC5tZXRob2QgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgICBjb250ZXh0LmFicnVwdChcInJldHVyblwiLCBjb250ZXh0LmFyZyk7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZSA9IEdlblN0YXRlRXhlY3V0aW5nO1xuXG4gICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChpbm5lckZuLCBzZWxmLCBjb250ZXh0KTtcbiAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiKSB7XG4gICAgICAgICAgLy8gSWYgYW4gZXhjZXB0aW9uIGlzIHRocm93biBmcm9tIGlubmVyRm4sIHdlIGxlYXZlIHN0YXRlID09PVxuICAgICAgICAgIC8vIEdlblN0YXRlRXhlY3V0aW5nIGFuZCBsb29wIGJhY2sgZm9yIGFub3RoZXIgaW52b2NhdGlvbi5cbiAgICAgICAgICBzdGF0ZSA9IGNvbnRleHQuZG9uZVxuICAgICAgICAgICAgPyBHZW5TdGF0ZUNvbXBsZXRlZFxuICAgICAgICAgICAgOiBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkO1xuXG4gICAgICAgICAgaWYgKHJlY29yZC5hcmcgPT09IENvbnRpbnVlU2VudGluZWwpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogcmVjb3JkLmFyZyxcbiAgICAgICAgICAgIGRvbmU6IGNvbnRleHQuZG9uZVxuICAgICAgICAgIH07XG5cbiAgICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAvLyBEaXNwYXRjaCB0aGUgZXhjZXB0aW9uIGJ5IGxvb3BpbmcgYmFjayBhcm91bmQgdG8gdGhlXG4gICAgICAgICAgLy8gY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihjb250ZXh0LmFyZykgY2FsbCBhYm92ZS5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gQ2FsbCBkZWxlZ2F0ZS5pdGVyYXRvcltjb250ZXh0Lm1ldGhvZF0oY29udGV4dC5hcmcpIGFuZCBoYW5kbGUgdGhlXG4gIC8vIHJlc3VsdCwgZWl0aGVyIGJ5IHJldHVybmluZyBhIHsgdmFsdWUsIGRvbmUgfSByZXN1bHQgZnJvbSB0aGVcbiAgLy8gZGVsZWdhdGUgaXRlcmF0b3IsIG9yIGJ5IG1vZGlmeWluZyBjb250ZXh0Lm1ldGhvZCBhbmQgY29udGV4dC5hcmcsXG4gIC8vIHNldHRpbmcgY29udGV4dC5kZWxlZ2F0ZSB0byBudWxsLCBhbmQgcmV0dXJuaW5nIHRoZSBDb250aW51ZVNlbnRpbmVsLlxuICBmdW5jdGlvbiBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIG1ldGhvZCA9IGRlbGVnYXRlLml0ZXJhdG9yW2NvbnRleHQubWV0aG9kXTtcbiAgICBpZiAobWV0aG9kID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIEEgLnRocm93IG9yIC5yZXR1cm4gd2hlbiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIG5vIC50aHJvd1xuICAgICAgLy8gbWV0aG9kIGFsd2F5cyB0ZXJtaW5hdGVzIHRoZSB5aWVsZCogbG9vcC5cbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICBpZiAoZGVsZWdhdGUuaXRlcmF0b3IucmV0dXJuKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGhhcyBhIHJldHVybiBtZXRob2QsIGdpdmUgaXQgYVxuICAgICAgICAgIC8vIGNoYW5jZSB0byBjbGVhbiB1cC5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwicmV0dXJuXCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCk7XG5cbiAgICAgICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgLy8gSWYgbWF5YmVJbnZva2VEZWxlZ2F0ZShjb250ZXh0KSBjaGFuZ2VkIGNvbnRleHQubWV0aG9kIGZyb21cbiAgICAgICAgICAgIC8vIFwicmV0dXJuXCIgdG8gXCJ0aHJvd1wiLCBsZXQgdGhhdCBvdmVycmlkZSB0aGUgVHlwZUVycm9yIGJlbG93LlxuICAgICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgIGNvbnRleHQuYXJnID0gbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICBcIlRoZSBpdGVyYXRvciBkb2VzIG5vdCBwcm92aWRlIGEgJ3Rocm93JyBtZXRob2RcIik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChtZXRob2QsIGRlbGVnYXRlLml0ZXJhdG9yLCBjb250ZXh0LmFyZyk7XG5cbiAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICBjb250ZXh0LmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIHZhciBpbmZvID0gcmVjb3JkLmFyZztcblxuICAgIGlmICghIGluZm8pIHtcbiAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgY29udGV4dC5hcmcgPSBuZXcgVHlwZUVycm9yKFwiaXRlcmF0b3IgcmVzdWx0IGlzIG5vdCBhbiBvYmplY3RcIik7XG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIGlmIChpbmZvLmRvbmUpIHtcbiAgICAgIC8vIEFzc2lnbiB0aGUgcmVzdWx0IG9mIHRoZSBmaW5pc2hlZCBkZWxlZ2F0ZSB0byB0aGUgdGVtcG9yYXJ5XG4gICAgICAvLyB2YXJpYWJsZSBzcGVjaWZpZWQgYnkgZGVsZWdhdGUucmVzdWx0TmFtZSAoc2VlIGRlbGVnYXRlWWllbGQpLlxuICAgICAgY29udGV4dFtkZWxlZ2F0ZS5yZXN1bHROYW1lXSA9IGluZm8udmFsdWU7XG5cbiAgICAgIC8vIFJlc3VtZSBleGVjdXRpb24gYXQgdGhlIGRlc2lyZWQgbG9jYXRpb24gKHNlZSBkZWxlZ2F0ZVlpZWxkKS5cbiAgICAgIGNvbnRleHQubmV4dCA9IGRlbGVnYXRlLm5leHRMb2M7XG5cbiAgICAgIC8vIElmIGNvbnRleHQubWV0aG9kIHdhcyBcInRocm93XCIgYnV0IHRoZSBkZWxlZ2F0ZSBoYW5kbGVkIHRoZVxuICAgICAgLy8gZXhjZXB0aW9uLCBsZXQgdGhlIG91dGVyIGdlbmVyYXRvciBwcm9jZWVkIG5vcm1hbGx5LiBJZlxuICAgICAgLy8gY29udGV4dC5tZXRob2Qgd2FzIFwibmV4dFwiLCBmb3JnZXQgY29udGV4dC5hcmcgc2luY2UgaXQgaGFzIGJlZW5cbiAgICAgIC8vIFwiY29uc3VtZWRcIiBieSB0aGUgZGVsZWdhdGUgaXRlcmF0b3IuIElmIGNvbnRleHQubWV0aG9kIHdhc1xuICAgICAgLy8gXCJyZXR1cm5cIiwgYWxsb3cgdGhlIG9yaWdpbmFsIC5yZXR1cm4gY2FsbCB0byBjb250aW51ZSBpbiB0aGVcbiAgICAgIC8vIG91dGVyIGdlbmVyYXRvci5cbiAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCAhPT0gXCJyZXR1cm5cIikge1xuICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBSZS15aWVsZCB0aGUgcmVzdWx0IHJldHVybmVkIGJ5IHRoZSBkZWxlZ2F0ZSBtZXRob2QuXG4gICAgICByZXR1cm4gaW5mbztcbiAgICB9XG5cbiAgICAvLyBUaGUgZGVsZWdhdGUgaXRlcmF0b3IgaXMgZmluaXNoZWQsIHNvIGZvcmdldCBpdCBhbmQgY29udGludWUgd2l0aFxuICAgIC8vIHRoZSBvdXRlciBnZW5lcmF0b3IuXG4gICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gIH1cblxuICAvLyBEZWZpbmUgR2VuZXJhdG9yLnByb3RvdHlwZS57bmV4dCx0aHJvdyxyZXR1cm59IGluIHRlcm1zIG9mIHRoZVxuICAvLyB1bmlmaWVkIC5faW52b2tlIGhlbHBlciBtZXRob2QuXG4gIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhHcCk7XG5cbiAgR3BbdG9TdHJpbmdUYWdTeW1ib2xdID0gXCJHZW5lcmF0b3JcIjtcblxuICAvLyBBIEdlbmVyYXRvciBzaG91bGQgYWx3YXlzIHJldHVybiBpdHNlbGYgYXMgdGhlIGl0ZXJhdG9yIG9iamVjdCB3aGVuIHRoZVxuICAvLyBAQGl0ZXJhdG9yIGZ1bmN0aW9uIGlzIGNhbGxlZCBvbiBpdC4gU29tZSBicm93c2VycycgaW1wbGVtZW50YXRpb25zIG9mIHRoZVxuICAvLyBpdGVyYXRvciBwcm90b3R5cGUgY2hhaW4gaW5jb3JyZWN0bHkgaW1wbGVtZW50IHRoaXMsIGNhdXNpbmcgdGhlIEdlbmVyYXRvclxuICAvLyBvYmplY3QgdG8gbm90IGJlIHJldHVybmVkIGZyb20gdGhpcyBjYWxsLiBUaGlzIGVuc3VyZXMgdGhhdCBkb2Vzbid0IGhhcHBlbi5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWdlbmVyYXRvci9pc3N1ZXMvMjc0IGZvciBtb3JlIGRldGFpbHMuXG4gIEdwW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEdwLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwiW29iamVjdCBHZW5lcmF0b3JdXCI7XG4gIH07XG5cbiAgZnVuY3Rpb24gcHVzaFRyeUVudHJ5KGxvY3MpIHtcbiAgICB2YXIgZW50cnkgPSB7IHRyeUxvYzogbG9jc1swXSB9O1xuXG4gICAgaWYgKDEgaW4gbG9jcykge1xuICAgICAgZW50cnkuY2F0Y2hMb2MgPSBsb2NzWzFdO1xuICAgIH1cblxuICAgIGlmICgyIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmZpbmFsbHlMb2MgPSBsb2NzWzJdO1xuICAgICAgZW50cnkuYWZ0ZXJMb2MgPSBsb2NzWzNdO1xuICAgIH1cblxuICAgIHRoaXMudHJ5RW50cmllcy5wdXNoKGVudHJ5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0VHJ5RW50cnkoZW50cnkpIHtcbiAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbiB8fCB7fTtcbiAgICByZWNvcmQudHlwZSA9IFwibm9ybWFsXCI7XG4gICAgZGVsZXRlIHJlY29yZC5hcmc7XG4gICAgZW50cnkuY29tcGxldGlvbiA9IHJlY29yZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIENvbnRleHQodHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBUaGUgcm9vdCBlbnRyeSBvYmplY3QgKGVmZmVjdGl2ZWx5IGEgdHJ5IHN0YXRlbWVudCB3aXRob3V0IGEgY2F0Y2hcbiAgICAvLyBvciBhIGZpbmFsbHkgYmxvY2spIGdpdmVzIHVzIGEgcGxhY2UgdG8gc3RvcmUgdmFsdWVzIHRocm93biBmcm9tXG4gICAgLy8gbG9jYXRpb25zIHdoZXJlIHRoZXJlIGlzIG5vIGVuY2xvc2luZyB0cnkgc3RhdGVtZW50LlxuICAgIHRoaXMudHJ5RW50cmllcyA9IFt7IHRyeUxvYzogXCJyb290XCIgfV07XG4gICAgdHJ5TG9jc0xpc3QuZm9yRWFjaChwdXNoVHJ5RW50cnksIHRoaXMpO1xuICAgIHRoaXMucmVzZXQodHJ1ZSk7XG4gIH1cblxuICBydW50aW1lLmtleXMgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgIGtleXMucHVzaChrZXkpO1xuICAgIH1cbiAgICBrZXlzLnJldmVyc2UoKTtcblxuICAgIC8vIFJhdGhlciB0aGFuIHJldHVybmluZyBhbiBvYmplY3Qgd2l0aCBhIG5leHQgbWV0aG9kLCB3ZSBrZWVwXG4gICAgLy8gdGhpbmdzIHNpbXBsZSBhbmQgcmV0dXJuIHRoZSBuZXh0IGZ1bmN0aW9uIGl0c2VsZi5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgIHdoaWxlIChrZXlzLmxlbmd0aCkge1xuICAgICAgICB2YXIga2V5ID0ga2V5cy5wb3AoKTtcbiAgICAgICAgaWYgKGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgICBuZXh0LnZhbHVlID0ga2V5O1xuICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRvIGF2b2lkIGNyZWF0aW5nIGFuIGFkZGl0aW9uYWwgb2JqZWN0LCB3ZSBqdXN0IGhhbmcgdGhlIC52YWx1ZVxuICAgICAgLy8gYW5kIC5kb25lIHByb3BlcnRpZXMgb2ZmIHRoZSBuZXh0IGZ1bmN0aW9uIG9iamVjdCBpdHNlbGYuIFRoaXNcbiAgICAgIC8vIGFsc28gZW5zdXJlcyB0aGF0IHRoZSBtaW5pZmllciB3aWxsIG5vdCBhbm9ueW1pemUgdGhlIGZ1bmN0aW9uLlxuICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcbiAgICAgIHJldHVybiBuZXh0O1xuICAgIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gdmFsdWVzKGl0ZXJhYmxlKSB7XG4gICAgaWYgKGl0ZXJhYmxlKSB7XG4gICAgICB2YXIgaXRlcmF0b3JNZXRob2QgPSBpdGVyYWJsZVtpdGVyYXRvclN5bWJvbF07XG4gICAgICBpZiAoaXRlcmF0b3JNZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yTWV0aG9kLmNhbGwoaXRlcmFibGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGl0ZXJhYmxlLm5leHQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gaXRlcmFibGU7XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNOYU4oaXRlcmFibGUubGVuZ3RoKSkge1xuICAgICAgICB2YXIgaSA9IC0xLCBuZXh0ID0gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgaXRlcmFibGUubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoaGFzT3duLmNhbGwoaXRlcmFibGUsIGkpKSB7XG4gICAgICAgICAgICAgIG5leHQudmFsdWUgPSBpdGVyYWJsZVtpXTtcbiAgICAgICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIG5leHQudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcblxuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBuZXh0Lm5leHQgPSBuZXh0O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJldHVybiBhbiBpdGVyYXRvciB3aXRoIG5vIHZhbHVlcy5cbiAgICByZXR1cm4geyBuZXh0OiBkb25lUmVzdWx0IH07XG4gIH1cbiAgcnVudGltZS52YWx1ZXMgPSB2YWx1ZXM7XG5cbiAgZnVuY3Rpb24gZG9uZVJlc3VsdCgpIHtcbiAgICByZXR1cm4geyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH07XG4gIH1cblxuICBDb250ZXh0LnByb3RvdHlwZSA9IHtcbiAgICBjb25zdHJ1Y3RvcjogQ29udGV4dCxcblxuICAgIHJlc2V0OiBmdW5jdGlvbihza2lwVGVtcFJlc2V0KSB7XG4gICAgICB0aGlzLnByZXYgPSAwO1xuICAgICAgdGhpcy5uZXh0ID0gMDtcbiAgICAgIC8vIFJlc2V0dGluZyBjb250ZXh0Ll9zZW50IGZvciBsZWdhY3kgc3VwcG9ydCBvZiBCYWJlbCdzXG4gICAgICAvLyBmdW5jdGlvbi5zZW50IGltcGxlbWVudGF0aW9uLlxuICAgICAgdGhpcy5zZW50ID0gdGhpcy5fc2VudCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgIHRoaXMubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICB0aGlzLmFyZyA9IHVuZGVmaW5lZDtcblxuICAgICAgdGhpcy50cnlFbnRyaWVzLmZvckVhY2gocmVzZXRUcnlFbnRyeSk7XG5cbiAgICAgIGlmICghc2tpcFRlbXBSZXNldCkge1xuICAgICAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMpIHtcbiAgICAgICAgICAvLyBOb3Qgc3VyZSBhYm91dCB0aGUgb3B0aW1hbCBvcmRlciBvZiB0aGVzZSBjb25kaXRpb25zOlxuICAgICAgICAgIGlmIChuYW1lLmNoYXJBdCgwKSA9PT0gXCJ0XCIgJiZcbiAgICAgICAgICAgICAgaGFzT3duLmNhbGwodGhpcywgbmFtZSkgJiZcbiAgICAgICAgICAgICAgIWlzTmFOKCtuYW1lLnNsaWNlKDEpKSkge1xuICAgICAgICAgICAgdGhpc1tuYW1lXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuXG4gICAgICB2YXIgcm9vdEVudHJ5ID0gdGhpcy50cnlFbnRyaWVzWzBdO1xuICAgICAgdmFyIHJvb3RSZWNvcmQgPSByb290RW50cnkuY29tcGxldGlvbjtcbiAgICAgIGlmIChyb290UmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByb290UmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucnZhbDtcbiAgICB9LFxuXG4gICAgZGlzcGF0Y2hFeGNlcHRpb246IGZ1bmN0aW9uKGV4Y2VwdGlvbikge1xuICAgICAgaWYgKHRoaXMuZG9uZSkge1xuICAgICAgICB0aHJvdyBleGNlcHRpb247XG4gICAgICB9XG5cbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcztcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZShsb2MsIGNhdWdodCkge1xuICAgICAgICByZWNvcmQudHlwZSA9IFwidGhyb3dcIjtcbiAgICAgICAgcmVjb3JkLmFyZyA9IGV4Y2VwdGlvbjtcbiAgICAgICAgY29udGV4dC5uZXh0ID0gbG9jO1xuXG4gICAgICAgIGlmIChjYXVnaHQpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgZGlzcGF0Y2hlZCBleGNlcHRpb24gd2FzIGNhdWdodCBieSBhIGNhdGNoIGJsb2NrLFxuICAgICAgICAgIC8vIHRoZW4gbGV0IHRoYXQgY2F0Y2ggYmxvY2sgaGFuZGxlIHRoZSBleGNlcHRpb24gbm9ybWFsbHkuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAhISBjYXVnaHQ7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSBcInJvb3RcIikge1xuICAgICAgICAgIC8vIEV4Y2VwdGlvbiB0aHJvd24gb3V0c2lkZSBvZiBhbnkgdHJ5IGJsb2NrIHRoYXQgY291bGQgaGFuZGxlXG4gICAgICAgICAgLy8gaXQsIHNvIHNldCB0aGUgY29tcGxldGlvbiB2YWx1ZSBvZiB0aGUgZW50aXJlIGZ1bmN0aW9uIHRvXG4gICAgICAgICAgLy8gdGhyb3cgdGhlIGV4Y2VwdGlvbi5cbiAgICAgICAgICByZXR1cm4gaGFuZGxlKFwiZW5kXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYpIHtcbiAgICAgICAgICB2YXIgaGFzQ2F0Y2ggPSBoYXNPd24uY2FsbChlbnRyeSwgXCJjYXRjaExvY1wiKTtcbiAgICAgICAgICB2YXIgaGFzRmluYWxseSA9IGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIik7XG5cbiAgICAgICAgICBpZiAoaGFzQ2F0Y2ggJiYgaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0NhdGNoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidHJ5IHN0YXRlbWVudCB3aXRob3V0IGNhdGNoIG9yIGZpbmFsbHlcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGFicnVwdDogZnVuY3Rpb24odHlwZSwgYXJnKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIikgJiZcbiAgICAgICAgICAgIHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICB2YXIgZmluYWxseUVudHJ5ID0gZW50cnk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSAmJlxuICAgICAgICAgICh0eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICAgdHlwZSA9PT0gXCJjb250aW51ZVwiKSAmJlxuICAgICAgICAgIGZpbmFsbHlFbnRyeS50cnlMb2MgPD0gYXJnICYmXG4gICAgICAgICAgYXJnIDw9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgIC8vIElnbm9yZSB0aGUgZmluYWxseSBlbnRyeSBpZiBjb250cm9sIGlzIG5vdCBqdW1waW5nIHRvIGFcbiAgICAgICAgLy8gbG9jYXRpb24gb3V0c2lkZSB0aGUgdHJ5L2NhdGNoIGJsb2NrLlxuICAgICAgICBmaW5hbGx5RW50cnkgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVjb3JkID0gZmluYWxseUVudHJ5ID8gZmluYWxseUVudHJ5LmNvbXBsZXRpb24gOiB7fTtcbiAgICAgIHJlY29yZC50eXBlID0gdHlwZTtcbiAgICAgIHJlY29yZC5hcmcgPSBhcmc7XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkpIHtcbiAgICAgICAgdGhpcy5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgdGhpcy5uZXh0ID0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2M7XG4gICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5jb21wbGV0ZShyZWNvcmQpO1xuICAgIH0sXG5cbiAgICBjb21wbGV0ZTogZnVuY3Rpb24ocmVjb3JkLCBhZnRlckxvYykge1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICByZWNvcmQudHlwZSA9PT0gXCJjb250aW51ZVwiKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IHJlY29yZC5hcmc7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInJldHVyblwiKSB7XG4gICAgICAgIHRoaXMucnZhbCA9IHRoaXMuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgdGhpcy5tZXRob2QgPSBcInJldHVyblwiO1xuICAgICAgICB0aGlzLm5leHQgPSBcImVuZFwiO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIiAmJiBhZnRlckxvYykge1xuICAgICAgICB0aGlzLm5leHQgPSBhZnRlckxvYztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfSxcblxuICAgIGZpbmlzaDogZnVuY3Rpb24oZmluYWxseUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS5maW5hbGx5TG9jID09PSBmaW5hbGx5TG9jKSB7XG4gICAgICAgICAgdGhpcy5jb21wbGV0ZShlbnRyeS5jb21wbGV0aW9uLCBlbnRyeS5hZnRlckxvYyk7XG4gICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgXCJjYXRjaFwiOiBmdW5jdGlvbih0cnlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSB0cnlMb2MpIHtcbiAgICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcbiAgICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgdmFyIHRocm93biA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRocm93bjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUaGUgY29udGV4dC5jYXRjaCBtZXRob2QgbXVzdCBvbmx5IGJlIGNhbGxlZCB3aXRoIGEgbG9jYXRpb25cbiAgICAgIC8vIGFyZ3VtZW50IHRoYXQgY29ycmVzcG9uZHMgdG8gYSBrbm93biBjYXRjaCBibG9jay5cbiAgICAgIHRocm93IG5ldyBFcnJvcihcImlsbGVnYWwgY2F0Y2ggYXR0ZW1wdFwiKTtcbiAgICB9LFxuXG4gICAgZGVsZWdhdGVZaWVsZDogZnVuY3Rpb24oaXRlcmFibGUsIHJlc3VsdE5hbWUsIG5leHRMb2MpIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSB7XG4gICAgICAgIGl0ZXJhdG9yOiB2YWx1ZXMoaXRlcmFibGUpLFxuICAgICAgICByZXN1bHROYW1lOiByZXN1bHROYW1lLFxuICAgICAgICBuZXh0TG9jOiBuZXh0TG9jXG4gICAgICB9O1xuXG4gICAgICBpZiAodGhpcy5tZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgIC8vIERlbGliZXJhdGVseSBmb3JnZXQgdGhlIGxhc3Qgc2VudCB2YWx1ZSBzbyB0aGF0IHdlIGRvbid0XG4gICAgICAgIC8vIGFjY2lkZW50YWxseSBwYXNzIGl0IG9uIHRvIHRoZSBkZWxlZ2F0ZS5cbiAgICAgICAgdGhpcy5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cbiAgfTtcbn0pKFxuICAvLyBJbiBzbG9wcHkgbW9kZSwgdW5ib3VuZCBgdGhpc2AgcmVmZXJzIHRvIHRoZSBnbG9iYWwgb2JqZWN0LCBmYWxsYmFjayB0b1xuICAvLyBGdW5jdGlvbiBjb25zdHJ1Y3RvciBpZiB3ZSdyZSBpbiBnbG9iYWwgc3RyaWN0IG1vZGUuIFRoYXQgaXMgc2FkbHkgYSBmb3JtXG4gIC8vIG9mIGluZGlyZWN0IGV2YWwgd2hpY2ggdmlvbGF0ZXMgQ29udGVudCBTZWN1cml0eSBQb2xpY3kuXG4gIChmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMgfSkoKSB8fCBGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKClcbik7XG4iLCJcbi8qKlxuICogTW9kdWxlIERlcGVuZGVuY2llc1xuICovXG5cbnZhciBleHByO1xudHJ5IHtcbiAgZXhwciA9IHJlcXVpcmUoJ3Byb3BzJyk7XG59IGNhdGNoKGUpIHtcbiAgZXhwciA9IHJlcXVpcmUoJ2NvbXBvbmVudC1wcm9wcycpO1xufVxuXG4vKipcbiAqIEV4cG9zZSBgdG9GdW5jdGlvbigpYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRvRnVuY3Rpb247XG5cbi8qKlxuICogQ29udmVydCBgb2JqYCB0byBhIGBGdW5jdGlvbmAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gb2JqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHRvRnVuY3Rpb24ob2JqKSB7XG4gIHN3aXRjaCAoe30udG9TdHJpbmcuY2FsbChvYmopKSB7XG4gICAgY2FzZSAnW29iamVjdCBPYmplY3RdJzpcbiAgICAgIHJldHVybiBvYmplY3RUb0Z1bmN0aW9uKG9iaik7XG4gICAgY2FzZSAnW29iamVjdCBGdW5jdGlvbl0nOlxuICAgICAgcmV0dXJuIG9iajtcbiAgICBjYXNlICdbb2JqZWN0IFN0cmluZ10nOlxuICAgICAgcmV0dXJuIHN0cmluZ1RvRnVuY3Rpb24ob2JqKTtcbiAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOlxuICAgICAgcmV0dXJuIHJlZ2V4cFRvRnVuY3Rpb24ob2JqKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGRlZmF1bHRUb0Z1bmN0aW9uKG9iaik7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWZhdWx0IHRvIHN0cmljdCBlcXVhbGl0eS5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZGVmYXVsdFRvRnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiBmdW5jdGlvbihvYmope1xuICAgIHJldHVybiB2YWwgPT09IG9iajtcbiAgfTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGByZWAgdG8gYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1JlZ0V4cH0gcmVcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcmVnZXhwVG9GdW5jdGlvbihyZSkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqKXtcbiAgICByZXR1cm4gcmUudGVzdChvYmopO1xuICB9O1xufVxuXG4vKipcbiAqIENvbnZlcnQgcHJvcGVydHkgYHN0cmAgdG8gYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHN0cmluZ1RvRnVuY3Rpb24oc3RyKSB7XG4gIC8vIGltbWVkaWF0ZSBzdWNoIGFzIFwiPiAyMFwiXG4gIGlmICgvXiAqXFxXKy8udGVzdChzdHIpKSByZXR1cm4gbmV3IEZ1bmN0aW9uKCdfJywgJ3JldHVybiBfICcgKyBzdHIpO1xuXG4gIC8vIHByb3BlcnRpZXMgc3VjaCBhcyBcIm5hbWUuZmlyc3RcIiBvciBcImFnZSA+IDE4XCIgb3IgXCJhZ2UgPiAxOCAmJiBhZ2UgPCAzNlwiXG4gIHJldHVybiBuZXcgRnVuY3Rpb24oJ18nLCAncmV0dXJuICcgKyBnZXQoc3RyKSk7XG59XG5cbi8qKlxuICogQ29udmVydCBgb2JqZWN0YCB0byBhIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3RcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gb2JqZWN0VG9GdW5jdGlvbihvYmopIHtcbiAgdmFyIG1hdGNoID0ge307XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBtYXRjaFtrZXldID0gdHlwZW9mIG9ialtrZXldID09PSAnc3RyaW5nJ1xuICAgICAgPyBkZWZhdWx0VG9GdW5jdGlvbihvYmpba2V5XSlcbiAgICAgIDogdG9GdW5jdGlvbihvYmpba2V5XSk7XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbCl7XG4gICAgaWYgKHR5cGVvZiB2YWwgIT09ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG4gICAgZm9yICh2YXIga2V5IGluIG1hdGNoKSB7XG4gICAgICBpZiAoIShrZXkgaW4gdmFsKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgaWYgKCFtYXRjaFtrZXldKHZhbFtrZXldKSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbn1cblxuLyoqXG4gKiBCdWlsdCB0aGUgZ2V0dGVyIGZ1bmN0aW9uLiBTdXBwb3J0cyBnZXR0ZXIgc3R5bGUgZnVuY3Rpb25zXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZ2V0KHN0cikge1xuICB2YXIgcHJvcHMgPSBleHByKHN0cik7XG4gIGlmICghcHJvcHMubGVuZ3RoKSByZXR1cm4gJ18uJyArIHN0cjtcblxuICB2YXIgdmFsLCBpLCBwcm9wO1xuICBmb3IgKGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICBwcm9wID0gcHJvcHNbaV07XG4gICAgdmFsID0gJ18uJyArIHByb3A7XG4gICAgdmFsID0gXCIoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgXCIgKyB2YWwgKyBcIiA/IFwiICsgdmFsICsgXCIoKSA6IFwiICsgdmFsICsgXCIpXCI7XG5cbiAgICAvLyBtaW1pYyBuZWdhdGl2ZSBsb29rYmVoaW5kIHRvIGF2b2lkIHByb2JsZW1zIHdpdGggbmVzdGVkIHByb3BlcnRpZXNcbiAgICBzdHIgPSBzdHJpcE5lc3RlZChwcm9wLCBzdHIsIHZhbCk7XG4gIH1cblxuICByZXR1cm4gc3RyO1xufVxuXG4vKipcbiAqIE1pbWljIG5lZ2F0aXZlIGxvb2tiZWhpbmQgdG8gYXZvaWQgcHJvYmxlbXMgd2l0aCBuZXN0ZWQgcHJvcGVydGllcy5cbiAqXG4gKiBTZWU6IGh0dHA6Ly9ibG9nLnN0ZXZlbmxldml0aGFuLmNvbS9hcmNoaXZlcy9taW1pYy1sb29rYmVoaW5kLWphdmFzY3JpcHRcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc3RyaXBOZXN0ZWQgKHByb3AsIHN0ciwgdmFsKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZShuZXcgUmVnRXhwKCcoXFxcXC4pPycgKyBwcm9wLCAnZycpLCBmdW5jdGlvbigkMCwgJDEpIHtcbiAgICByZXR1cm4gJDEgPyAkMCA6IHZhbDtcbiAgfSk7XG59XG4iLCJleHBvcnQgSW5NZW1vcnlBZGFwdGVyIGZyb20gJy4vaW5tZW1vcnknO1xuZXhwb3J0IExvY2FsU3RvcmFnZUFkYXB0ZXIgZnJvbSAnLi9sb2NhbHN0b3JhZ2UnO1xuIiwiLy8gQGZsb3dcbmltcG9ydCB0eXBlIHsgSVN0b3JhZ2UgfSBmcm9tICcuLi9pbnRlcmZhY2VzL3N0b3JhZ2UnO1xuaW1wb3J0IHR5cGUgeyBJQ29uZmlnIH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9jb25maWcnO1xuaW1wb3J0IHR5cGUgSVRhc2sgZnJvbSAnLi4vaW50ZXJmYWNlcy90YXNrJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW5NZW1vcnlBZGFwdGVyIGltcGxlbWVudHMgSVN0b3JhZ2Uge1xuICBjb25maWc6IElDb25maWc7XG4gIHByZWZpeDogc3RyaW5nO1xuICBzdG9yZTogeyBbcHJvcDogc3RyaW5nXTogYW55IH0gPSB7fTtcblxuICBjb25zdHJ1Y3Rvcihjb25maWc6IElDb25maWcpIHtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLnByZWZpeCA9IHRoaXMuY29uZmlnLmdldCgncHJlZml4Jyk7XG4gIH1cblxuICAvKipcbiAgICogVGFrZSBpdGVtIGZyb20gc3RvcmUgYnkga2V5XG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge1Byb21pc2U8SVRhc2s+fSAoYXJyYXkpXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBnZXQobmFtZTogc3RyaW5nKTogUHJvbWlzZTxJVGFza1tdPiB7XG4gICAgY29uc3QgY29sbE5hbWUgPSB0aGlzLnN0b3JhZ2VOYW1lKG5hbWUpO1xuICAgIHJldHVybiBbLi4udGhpcy5nZXRDb2xsZWN0aW9uKGNvbGxOYW1lKV07XG4gIH1cblxuICAvKipcbiAgICogQWRkIGl0ZW0gdG8gc3RvcmVcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHBhcmFtICB7U3RyaW5nfSB2YWx1ZVxuICAgKiBAcmV0dXJuIHtQcm9taXNlPEFueT59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBzZXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBhbnlbXSk6IFByb21pc2U8YW55PiB7XG4gICAgdGhpcy5zdG9yZVt0aGlzLnN0b3JhZ2VOYW1lKGtleSldID0gWy4uLnZhbHVlXTtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogSXRlbSBjaGVja2VyIGluIHN0b3JlXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge1Byb21pc2U8Qm9vbGVhbj59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBoYXMoa2V5OiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuc3RvcmUsIHRoaXMuc3RvcmFnZU5hbWUoa2V5KSk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGl0ZW1cbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7UHJvbWlzZTxBbnk+fVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgY2xlYXIoa2V5OiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IChhd2FpdCB0aGlzLmhhcyhrZXkpKSA/IGRlbGV0ZSB0aGlzLnN0b3JlW3RoaXMuc3RvcmFnZU5hbWUoa2V5KV0gOiBmYWxzZTtcbiAgICB0aGlzLnN0b3JlID0geyAuLi50aGlzLnN0b3JlIH07XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wb3NlIGNvbGxlY3Rpb24gbmFtZSBieSBzdWZmaXhcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBzdWZmaXhcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgc3RvcmFnZU5hbWUoc3VmZml4OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gc3VmZml4LnN0YXJ0c1dpdGgodGhpcy5nZXRQcmVmaXgoKSkgPyBzdWZmaXggOiBgJHt0aGlzLmdldFByZWZpeCgpfV8ke3N1ZmZpeH1gO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBwcmVmaXggb2YgY2hhbm5lbCBjb2xsZWN0aW9uXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGdldFByZWZpeCgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWcuZ2V0KCdwcmVmaXgnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgY29sbGVjdGlvblxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG4gIGdldENvbGxlY3Rpb24obmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuc3RvcmUsIG5hbWUpO1xuICAgIGlmICghaGFzKSB0aGlzLnN0b3JlW25hbWVdID0gW107XG4gICAgcmV0dXJuIHRoaXMuc3RvcmVbbmFtZV07XG4gIH1cbn1cbiIsIi8vIEBmbG93XG5pbXBvcnQgdHlwZSB7IElTdG9yYWdlIH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9zdG9yYWdlJztcbmltcG9ydCB0eXBlIHsgSUNvbmZpZyB9IGZyb20gJy4uL2ludGVyZmFjZXMvY29uZmlnJztcbmltcG9ydCB0eXBlIElUYXNrIGZyb20gJy4uL2ludGVyZmFjZXMvdGFzayc7XG5cbi8qIGdsb2JhbCBsb2NhbFN0b3JhZ2UgKi9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9jYWxTdG9yYWdlQWRhcHRlciBpbXBsZW1lbnRzIElTdG9yYWdlIHtcbiAgY29uZmlnOiBJQ29uZmlnO1xuICBwcmVmaXg6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcihjb25maWc6IElDb25maWcpIHtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLnByZWZpeCA9IHRoaXMuY29uZmlnLmdldCgncHJlZml4Jyk7XG4gIH1cblxuICAvKipcbiAgICogVGFrZSBpdGVtIGZyb20gbG9jYWwgc3RvcmFnZSBieSBrZXlcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7UHJvbWlzZTxJVGFzaz59IChhcnJheSlcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGdldChuYW1lOiBzdHJpbmcpOiBQcm9taXNlPElUYXNrW10+IHtcbiAgICBjb25zdCByZXN1bHQ6IGFueSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMuc3RvcmFnZU5hbWUobmFtZSkpO1xuICAgIHJldHVybiBKU09OLnBhcnNlKHJlc3VsdCkgfHwgW107XG4gIH1cblxuICAvKipcbiAgICogQWRkIGl0ZW0gdG8gbG9jYWwgc3RvcmFnZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHZhbHVlXG4gICAqIEByZXR1cm4ge1Byb21pc2U8QW55Pn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIHNldChrZXk6IHN0cmluZywgdmFsdWU6IGFueVtdKTogUHJvbWlzZTxhbnk+IHtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLnN0b3JhZ2VOYW1lKGtleSksIEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEl0ZW0gY2hlY2tlciBpbiBsb2NhbCBzdG9yYWdlXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge1Byb21pc2U8Qm9vbGVhbj59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBoYXMoa2V5OiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGxvY2FsU3RvcmFnZSwgdGhpcy5zdG9yYWdlTmFtZShrZXkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgaXRlbVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtQcm9taXNlPEFueT59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBjbGVhcihrZXk6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gKGF3YWl0IHRoaXMuaGFzKGtleSkpID8gZGVsZXRlIGxvY2FsU3RvcmFnZVt0aGlzLnN0b3JhZ2VOYW1lKGtleSldIDogZmFsc2U7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wb3NlIGNvbGxlY3Rpb24gbmFtZSBieSBzdWZmaXhcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBzdWZmaXhcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgc3RvcmFnZU5hbWUoc3VmZml4OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gc3VmZml4LnN0YXJ0c1dpdGgodGhpcy5nZXRQcmVmaXgoKSkgPyBzdWZmaXggOiBgJHt0aGlzLmdldFByZWZpeCgpfV8ke3N1ZmZpeH1gO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBwcmVmaXggb2YgY2hhbm5lbCBjb2xsZWN0aW9uXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGdldFByZWZpeCgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWcuZ2V0KCdwcmVmaXgnKTtcbiAgfVxufVxuIiwiLy8gQGZsb3dcbmltcG9ydCB0eXBlIElUYXNrIGZyb20gJy4vaW50ZXJmYWNlcy90YXNrJztcbmltcG9ydCB0eXBlIElDb25maWcgZnJvbSAnLi9pbnRlcmZhY2VzL2NvbmZpZyc7XG5pbXBvcnQgRXZlbnQgZnJvbSAnLi9ldmVudCc7XG5pbXBvcnQgU3RvcmFnZUNhcHN1bGUgZnJvbSAnLi9zdG9yYWdlLWNhcHN1bGUnO1xuaW1wb3J0IFF1ZXVlIGZyb20gJy4vcXVldWUnO1xuaW1wb3J0IHsgdXRpbENsZWFyQnlUYWcgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7XG4gIGRiLFxuICBjYW5NdWx0aXBsZSxcbiAgc2F2ZVRhc2ssXG4gIGxvZ1Byb3h5LFxuICBjcmVhdGVUaW1lb3V0LFxuICBzdGF0dXNPZmYsXG4gIHN0b3BRdWV1ZSxcbiAgZ2V0VGFza3NXaXRob3V0RnJlZXplZCxcbn0gZnJvbSAnLi9oZWxwZXJzJztcbmltcG9ydCB7XG4gIHRhc2tBZGRlZExvZyxcbiAgbmV4dFRhc2tMb2csXG4gIHF1ZXVlU3RvcHBpbmdMb2csXG4gIHF1ZXVlU3RhcnRMb2csXG4gIGV2ZW50Q3JlYXRlZExvZyxcbn0gZnJvbSAnLi9jb25zb2xlJztcblxuLyogZXNsaW50IG5vLXVuZGVyc2NvcmUtZGFuZ2xlOiBbMiwgeyBcImFsbG93XCI6IFtcIl9pZFwiXSB9XSAqL1xuXG5jb25zdCBjaGFubmVsTmFtZSA9IFN5bWJvbCgnY2hhbm5lbC1uYW1lJyk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENoYW5uZWwge1xuICBzdG9wcGVkOiBib29sZWFuID0gdHJ1ZTtcbiAgcnVubmluZzogYm9vbGVhbiA9IGZhbHNlO1xuICB0aW1lb3V0OiBudW1iZXI7XG4gIHN0b3JhZ2U6IFN0b3JhZ2VDYXBzdWxlO1xuICBjb25maWc6IElDb25maWc7XG4gIGV2ZW50ID0gbmV3IEV2ZW50KCk7XG5cbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nLCBjb25maWc6IElDb25maWcpIHtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcblxuICAgIC8vIHNhdmUgY2hhbm5lbCBuYW1lIHRvIHRoaXMgY2xhc3Mgd2l0aCBzeW1ib2xpYyBrZXlcbiAgICAodGhpczogT2JqZWN0KVtjaGFubmVsTmFtZV0gPSBuYW1lO1xuXG4gICAgLy8gaWYgY3VzdG9tIHN0b3JhZ2UgZHJpdmVyIGV4aXN0cywgc2V0dXAgaXRcbiAgICBjb25zdCB7IGRyaXZlcnMgfTogYW55ID0gUXVldWU7XG4gICAgY29uc3Qgc3RvcmFnZSA9IG5ldyBTdG9yYWdlQ2Fwc3VsZShjb25maWcsIGRyaXZlcnMuc3RvcmFnZSk7XG4gICAgdGhpcy5zdG9yYWdlID0gc3RvcmFnZS5jaGFubmVsKG5hbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjaGFubmVsIG5hbWVcbiAgICpcbiAgICogQHJldHVybiB7U3RyaW5nfSBjaGFubmVsIG5hbWVcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIG5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gKHRoaXM6IE9iamVjdClbY2hhbm5lbE5hbWVdO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBuZXcgam9iIHRvIGNoYW5uZWxcbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSB0YXNrXG4gICAqIEByZXR1cm4ge1N0cmluZ3xCb29sZWFufSBqb2JcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGFkZCh0YXNrOiBJVGFzayk6IFByb21pc2U8c3RyaW5nIHwgYm9vbGVhbj4ge1xuICAgIGlmICghKGF3YWl0IGNhbk11bHRpcGxlLmNhbGwodGhpcywgdGFzaykpKSByZXR1cm4gZmFsc2U7XG5cbiAgICBjb25zdCBpZCA9IGF3YWl0IHNhdmVUYXNrLmNhbGwodGhpcywgdGFzayk7XG5cbiAgICBpZiAoaWQgJiYgdGhpcy5zdG9wcGVkICYmIHRoaXMucnVubmluZyA9PT0gdHJ1ZSkge1xuICAgICAgYXdhaXQgdGhpcy5zdGFydCgpO1xuICAgIH1cblxuICAgIC8vIHBhc3MgYWN0aXZpdHkgdG8gdGhlIGxvZyBzZXJ2aWNlLlxuICAgIGxvZ1Byb3h5LmNhbGwodGhpcywgdGFza0FkZGVkTG9nLCB0YXNrKTtcblxuICAgIHJldHVybiBpZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9jZXNzIG5leHQgam9iXG4gICAqXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBuZXh0KCk6IFByb21pc2U8dm9pZCB8IGJvb2xlYW4+IHtcbiAgICBpZiAodGhpcy5zdG9wcGVkKSB7XG4gICAgICBzdGF0dXNPZmYuY2FsbCh0aGlzKTtcbiAgICAgIHJldHVybiBzdG9wUXVldWUuY2FsbCh0aGlzKTtcbiAgICB9XG5cbiAgICAvLyBHZW5lcmF0ZSBhIGxvZyBtZXNzYWdlXG4gICAgbG9nUHJveHkuY2FsbCh0aGlzLCBuZXh0VGFza0xvZywgJ25leHQnKTtcblxuICAgIC8vIHN0YXJ0IHF1ZXVlIGFnYWluXG4gICAgYXdhaXQgdGhpcy5zdGFydCgpO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgcXVldWUgbGlzdGVuZXJcbiAgICpcbiAgICogQHJldHVybiB7Qm9vbGVhbn0gam9iXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBzdGFydCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAvLyBTdG9wIHRoZSBxdWV1ZSBmb3IgcmVzdGFydFxuICAgIHRoaXMuc3RvcHBlZCA9IGZhbHNlO1xuXG4gICAgLy8gUmVnaXN0ZXIgdGFza3MsIGlmIG5vdCByZWdpc3RlcmVkXG4gICAgLy8gcmVnaXN0ZXJXb3JrZXJzLmNhbGwodGhpcyk7XG5cbiAgICBsb2dQcm94eS5jYWxsKHRoaXMsIHF1ZXVlU3RhcnRMb2csICdzdGFydCcpO1xuXG4gICAgLy8gQ3JlYXRlIGEgdGltZW91dCBmb3Igc3RhcnQgcXVldWVcbiAgICB0aGlzLnJ1bm5pbmcgPSAoYXdhaXQgY3JlYXRlVGltZW91dC5jYWxsKHRoaXMpKSA+IDA7XG5cbiAgICByZXR1cm4gdGhpcy5ydW5uaW5nO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgcXVldWUgbGlzdGVuZXIgYWZ0ZXIgZW5kIG9mIGN1cnJlbnQgdGFza1xuICAgKlxuICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgc3RvcCgpOiB2b2lkIHtcbiAgICBsb2dQcm94eS5jYWxsKHRoaXMsIHF1ZXVlU3RvcHBpbmdMb2csICdzdG9wJyk7XG4gICAgdGhpcy5zdG9wcGVkID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wIHF1ZXVlIGxpc3RlbmVyIGluY2x1ZGluZyBjdXJyZW50IHRhc2tcbiAgICpcbiAgICogQHJldHVybiB7Vm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGZvcmNlU3RvcCgpOiB2b2lkIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIHN0b3BRdWV1ZS5jYWxsKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgdGhlcmUgaXMgYW55IHRhc2tcbiAgICpcbiAgICogQHJldHVybiB7Qm9vZWxhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGlzRW1wdHkoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmNvdW50KCkpIDwgMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGFzayBjb3VudFxuICAgKlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBjb3VudCgpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIHJldHVybiAoYXdhaXQgZ2V0VGFza3NXaXRob3V0RnJlZXplZC5jYWxsKHRoaXMpKS5sZW5ndGg7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRhc2sgY291bnQgYnkgdGFnXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gdGFnXG4gICAqIEByZXR1cm4ge0FycmF5PElUYXNrPn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGNvdW50QnlUYWcodGFnOiBzdHJpbmcpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIHJldHVybiAoYXdhaXQgZ2V0VGFza3NXaXRob3V0RnJlZXplZC5jYWxsKHRoaXMpKS5maWx0ZXIodCA9PiB0LnRhZyA9PT0gdGFnKS5sZW5ndGg7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFsbCB0YXNrcyBmcm9tIGNoYW5uZWxcbiAgICpcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGNsZWFyKCk6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy5uYW1lKCkpIHJldHVybiBmYWxzZTtcbiAgICB0aGlzLnN0b3JhZ2UuY2xlYXIodGhpcy5uYW1lKCkpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbGwgdGFza3MgZnJvbSBjaGFubmVsIGJ5IHRhZ1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHRhZ1xuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgY2xlYXJCeVRhZyh0YWc6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBkYi5jYWxsKHNlbGYpLmFsbCgpO1xuICAgIGNvbnN0IHJlbW92ZXMgPSBkYXRhLmZpbHRlcih1dGlsQ2xlYXJCeVRhZy5iaW5kKHRhZykpLm1hcChhc3luYyAodCkgPT4ge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZGIuY2FsbChzZWxmKS5kZWxldGUodC5faWQpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9KTtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChyZW1vdmVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBhIHRhc2sgd2hldGhlciBleGlzdHMgYnkgam9iIGlkXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gdGFnXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBoYXMoaWQ6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgZ2V0VGFza3NXaXRob3V0RnJlZXplZC5jYWxsKHRoaXMpKS5maW5kSW5kZXgodCA9PiB0Ll9pZCA9PT0gaWQpID4gLTE7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgYSB0YXNrIHdoZXRoZXIgZXhpc3RzIGJ5IHRhZ1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHRhZ1xuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgaGFzQnlUYWcodGFnOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gKGF3YWl0IGdldFRhc2tzV2l0aG91dEZyZWV6ZWQuY2FsbCh0aGlzKSkuZmluZEluZGV4KHQgPT4gdC50YWcgPT09IHRhZykgPiAtMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgYWN0aW9uIGV2ZW50c1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gY2JcbiAgICogQHJldHVybiB7Vm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIG9uKGtleTogc3RyaW5nLCBjYjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICB0aGlzLmV2ZW50Lm9uKC4uLltrZXksIGNiXSk7XG4gICAgbG9nUHJveHkuY2FsbCh0aGlzLCBldmVudENyZWF0ZWRMb2csIGtleSk7XG4gIH1cbn1cbiIsIi8qIEBmbG93ICovXG5pbXBvcnQgdHlwZSBJQ29uZmlnIGZyb20gJy4vaW50ZXJmYWNlcy9jb25maWcnO1xuaW1wb3J0IGNvbmZpZ0RhdGEgZnJvbSAnLi9lbnVtL2NvbmZpZy5kYXRhJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29uZmlnIHtcbiAgY29uZmlnOiBJQ29uZmlnID0gY29uZmlnRGF0YTtcblxuICBjb25zdHJ1Y3Rvcihjb25maWc6IElDb25maWcgPSB7fSkge1xuICAgIHRoaXMubWVyZ2UoY29uZmlnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgY29uZmlnIHRvIGdsb2JhbCBjb25maWcgcmVmZXJlbmNlXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0gIHtBbnl9IHZhbHVlXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBzZXQobmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgdGhpcy5jb25maWdbbmFtZV0gPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBjb25maWdcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm4ge2FueX1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGdldChuYW1lOiBzdHJpbmcpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZ1tuYW1lXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBjb25maWcgcHJvcGVydHlcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm4ge2FueX1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGhhcyhuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuY29uZmlnLCBuYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXJnZSB0d28gY29uZmlnIG9iamVjdFxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIG1lcmdlKGNvbmZpZzogeyBbc3RyaW5nXTogYW55IH0pOiB2b2lkIHtcbiAgICB0aGlzLmNvbmZpZyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuY29uZmlnLCBjb25maWcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIGNvbmZpZ1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHJlbW92ZShuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZGVsZXRlIHRoaXMuY29uZmlnW25hbWVdO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgY29uZmlnXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHtJQ29uZmlnW119XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhbGwoKTogSUNvbmZpZyB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnO1xuICB9XG59XG4iLCIvLyBAZmxvd1xuaW1wb3J0IG9iaiBmcm9tICdvYmplY3QtcGF0aCc7XG5pbXBvcnQgbG9nRXZlbnRzIGZyb20gJy4vZW51bS9sb2cuZXZlbnRzJztcblxuLyogZXNsaW50IG5vLWNvbnNvbGU6IFtcImVycm9yXCIsIHsgYWxsb3c6IFtcImxvZ1wiLCBcImdyb3VwQ29sbGFwc2VkXCIsIFwiZ3JvdXBFbmRcIl0gfV0gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGxvZyguLi5hcmdzOiBhbnkpIHtcbiAgY29uc29sZS5sb2coLi4uYXJncyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0YXNrQWRkZWRMb2coW3Rhc2tdOiBhbnlbXSkge1xuICBsb2coXG4gICAgYCVjJHtTdHJpbmcuZnJvbUNoYXJDb2RlKDQzKX0gKCR7dGFzay5oYW5kbGVyfSkgLT4gJHtvYmouZ2V0KGxvZ0V2ZW50cywgJ3F1ZXVlLmNyZWF0ZWQnKX1gLFxuICAgICdjb2xvcjogZ3JlZW47Zm9udC13ZWlnaHQ6IGJvbGQ7JyxcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHF1ZXVlU3RhcnRMb2coW3R5cGVdOiBhbnlbXSkge1xuICBsb2coXG4gICAgYCVjJHtTdHJpbmcuZnJvbUNoYXJDb2RlKDgyMTEpfSAoJHt0eXBlfSkgLT4gJHtvYmouZ2V0KGxvZ0V2ZW50cywgJ3F1ZXVlLnN0YXJ0aW5nJyl9YCxcbiAgICAnY29sb3I6ICMzZmE1ZjM7Zm9udC13ZWlnaHQ6IGJvbGQ7JyxcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5leHRUYXNrTG9nKFt0eXBlXTogYW55W10pIHtcbiAgbG9nKFxuICAgIGAlYyR7U3RyaW5nLmZyb21DaGFyQ29kZSgxODcpfSAoJHt0eXBlfSkgLT4gJHtvYmouZ2V0KGxvZ0V2ZW50cywgJ3F1ZXVlLm5leHQnKX1gLFxuICAgICdjb2xvcjogIzNmYTVmMztmb250LXdlaWdodDogYm9sZDsnLFxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcXVldWVTdG9wcGluZ0xvZyhbdHlwZV06IGFueVtdKSB7XG4gIGxvZyhcbiAgICBgJWMke1N0cmluZy5mcm9tQ2hhckNvZGUoODIyNil9ICgke3R5cGV9KSAtPiAke29iai5nZXQobG9nRXZlbnRzLCAncXVldWUuc3RvcHBpbmcnKX1gLFxuICAgICdjb2xvcjogI2ZmN2Y5NDtmb250LXdlaWdodDogYm9sZDsnLFxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcXVldWVTdG9wcGVkTG9nKFt0eXBlXTogYW55W10pIHtcbiAgbG9nKFxuICAgIGAlYyR7U3RyaW5nLmZyb21DaGFyQ29kZSg4MjI2KX0gKCR7dHlwZX0pIC0+ICR7b2JqLmdldChsb2dFdmVudHMsICdxdWV1ZS5zdG9wcGVkJyl9YCxcbiAgICAnY29sb3I6ICNmZjdmOTQ7Zm9udC13ZWlnaHQ6IGJvbGQ7JyxcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHF1ZXVlRW1wdHlMb2coW3R5cGVdOiBhbnlbXSkge1xuICBsb2coYCVjJHt0eXBlfSAke29iai5nZXQobG9nRXZlbnRzLCAncXVldWUuZW1wdHknKX1gLCAnY29sb3I6ICNmZjdmOTQ7Zm9udC13ZWlnaHQ6IGJvbGQ7Jyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBldmVudENyZWF0ZWRMb2coW2tleV06IGFueVtdKSB7XG4gIGxvZyhgJWMoJHtrZXl9KSAtPiAke29iai5nZXQobG9nRXZlbnRzLCAnZXZlbnQuY3JlYXRlZCcpfWAsICdjb2xvcjogIzY2Y2VlMztmb250LXdlaWdodDogYm9sZDsnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV2ZW50RmlyZWRMb2coW2tleSwgbmFtZV06IGFueVtdKSB7XG4gIGxvZyhgJWMoJHtrZXl9KSAtPiAke29iai5nZXQobG9nRXZlbnRzLCBgZXZlbnQuJHtuYW1lfWApfWAsICdjb2xvcjogI2EwZGMzYztmb250LXdlaWdodDogYm9sZDsnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vdEZvdW5kTG9nKFtuYW1lXTogYW55W10pIHtcbiAgbG9nKFxuICAgIGAlYyR7U3RyaW5nLmZyb21DaGFyQ29kZSgyMTUpfSAoJHtuYW1lfSkgLT4gJHtvYmouZ2V0KGxvZ0V2ZW50cywgJ3F1ZXVlLm5vdC1mb3VuZCcpfWAsXG4gICAgJ2NvbG9yOiAjYTBkYzNjO2ZvbnQtd2VpZ2h0OiBib2xkOycsXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3b3JrZXJSdW5uaW5Mb2coW1xuICB3b3JrZXI6IEZ1bmN0aW9uLFxuICB3b3JrZXJJbnN0YW5jZSxcbiAgdGFzayxcbiAgY2hhbm5lbDogc3RyaW5nLFxuICBkZXBzOiB7IFtzdHJpbmddOiBhbnlbXSB9LFxuXTogYW55W10pIHtcbiAgY29uc29sZS5ncm91cENvbGxhcHNlZChgJHt3b3JrZXIubmFtZX0gLSAke3Rhc2subGFiZWx9YCk7XG4gIGxvZyhgJWNjaGFubmVsOiAke2NoYW5uZWx9YCwgJ2NvbG9yOiBibHVlOycpO1xuICBsb2coYCVjbGFiZWw6ICR7dGFzay5sYWJlbCB8fCAnJ31gLCAnY29sb3I6IGJsdWU7Jyk7XG4gIGxvZyhgJWNoYW5kbGVyOiAke3Rhc2suaGFuZGxlcn1gLCAnY29sb3I6IGJsdWU7Jyk7XG4gIGxvZyhgJWNwcmlvcml0eTogJHt0YXNrLnByaW9yaXR5fWAsICdjb2xvcjogYmx1ZTsnKTtcbiAgbG9nKGAlY3VuaXF1ZTogJHt0YXNrLnVuaXF1ZSB8fCAnZmFsc2UnfWAsICdjb2xvcjogYmx1ZTsnKTtcbiAgbG9nKGAlY3JldHJ5OiAke3dvcmtlckluc3RhbmNlLnJldHJ5IHx8ICcxJ31gLCAnY29sb3I6IGJsdWU7Jyk7XG4gIGxvZyhgJWN0cmllZDogJHt0YXNrLnRyaWVkID8gdGFzay50cmllZCArIDEgOiAnMSd9YCwgJ2NvbG9yOiBibHVlOycpO1xuICBsb2coYCVjdGFnOiAke3Rhc2sudGFnIHx8ICcnfWAsICdjb2xvcjogYmx1ZTsnKTtcbiAgbG9nKCclY2FyZ3M6JywgJ2NvbG9yOiBibHVlOycpO1xuICBsb2codGFzay5hcmdzIHx8ICcnKTtcbiAgY29uc29sZS5ncm91cENvbGxhcHNlZCgnZGVwZW5kZW5jaWVzJyk7XG4gIGxvZyguLi4oZGVwc1t3b3JrZXIubmFtZV0gfHwgW10pKTtcbiAgY29uc29sZS5ncm91cEVuZCgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd29ya2VyRG9uZUxvZyhbcmVzdWx0LCB0YXNrLCB3b3JrZXJJbnN0YW5jZV06IGFueVtdKSB7XG4gIGlmIChyZXN1bHQgPT09IHRydWUpIHtcbiAgICBsb2coYCVjJHtTdHJpbmcuZnJvbUNoYXJDb2RlKDEwMDAzKX0gVGFzayBjb21wbGV0ZWQhYCwgJ2NvbG9yOiBncmVlbjsnKTtcbiAgfSBlbHNlIGlmICghcmVzdWx0ICYmIHRhc2sudHJpZWQgPCB3b3JrZXJJbnN0YW5jZS5yZXRyeSkge1xuICAgIGxvZygnJWNUYXNrIHdpbGwgYmUgcmV0cmllZCEnLCAnY29sb3I6ICNkODQxMGM7Jyk7XG4gIH0gZWxzZSB7XG4gICAgbG9nKGAlYyR7U3RyaW5nLmZyb21DaGFyQ29kZSgxMDAwNSl9IFRhc2sgZmFpbGVkIGFuZCBmcmVlemVkIWAsICdjb2xvcjogI2VmNjM2MzsnKTtcbiAgfVxuICBjb25zb2xlLmdyb3VwRW5kKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3b3JrZXJGYWlsZWRMb2coKSB7XG4gIGxvZyhgJWMke1N0cmluZy5mcm9tQ2hhckNvZGUoMTAwMDUpfSBUYXNrIGZhaWxlZCFgLCAnY29sb3I6IHJlZDsnKTtcbiAgY29uc29sZS5ncm91cEVuZCgpO1xufVxuIiwiLyogQGZsb3cgKi9cbmltcG9ydCB0eXBlIElDb250YWluZXIgZnJvbSAnLi9pbnRlcmZhY2VzL2NvbnRhaW5lcic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbnRhaW5lciBpbXBsZW1lbnRzIElDb250YWluZXIge1xuICBzdG9yZTogeyBbcHJvcGVydHk6IHN0cmluZ106IGFueSB9ID0ge307XG5cbiAgLyoqXG4gICAqIENoZWNrIGl0ZW0gaW4gY29udGFpbmVyXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gaWRcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGhhcyhpZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLnN0b3JlLCBpZCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGl0ZW0gZnJvbSBjb250YWluZXJcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBpZFxuICAgKiBAcmV0dXJuIHtBbnl9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBnZXQoaWQ6IHN0cmluZyk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmVbaWRdO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgaXRlbXMgZnJvbSBjb250YWluZXJcbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYWxsKCkge1xuICAgIHJldHVybiB0aGlzLnN0b3JlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBpdGVtIHRvIGNvbnRhaW5lclxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGlkXG4gICAqIEBwYXJhbSAge0FueX0gdmFsdWVcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGJpbmQoaWQ6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmVbaWRdID0gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogTWVyZ2UgY29udGluZXJzXG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gZGF0YVxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgbWVyZ2UoZGF0YTogeyBbcHJvcGVydHk6IHN0cmluZ106IGFueSB9ID0ge30pOiB2b2lkIHtcbiAgICB0aGlzLnN0b3JlID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5zdG9yZSwgZGF0YSk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGl0ZW0gZnJvbSBjb250YWluZXJcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBpZFxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgcmVtb3ZlKGlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBpZiAoIXRoaXMuaGFzKGlkKSkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiBkZWxldGUgdGhpcy5zdG9yZVtpZF07XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFsbCBpdGVtcyBmcm9tIGNvbnRhaW5lclxuICAgKlxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgcmVtb3ZlQWxsKCk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmUgPSB7fTtcbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQge1xuICBkZWZhdWx0U3RvcmFnZTogJ2xvY2Fsc3RvcmFnZScsXG4gIHByZWZpeDogJ3NxX2pvYnMnLFxuICB0aW1lb3V0OiAxMDAwLFxuICBsaW1pdDogLTEsXG4gIHByaW5jaXBsZTogJ2ZpZm8nLFxuICBkZWJ1ZzogdHJ1ZSxcbn07XG4iLCJleHBvcnQgZGVmYXVsdCB7XG4gIHF1ZXVlOiB7XG4gICAgY3JlYXRlZDogJ05ldyB0YXNrIGNyZWF0ZWQuJyxcbiAgICBuZXh0OiAnTmV4dCB0YXNrIHByb2Nlc3NpbmcuJyxcbiAgICBzdGFydGluZzogJ1F1ZXVlIGxpc3RlbmVyIHN0YXJ0aW5nLicsXG4gICAgc3RvcHBpbmc6ICdRdWV1ZSBsaXN0ZW5lciBzdG9wcGluZy4nLFxuICAgIHN0b3BwZWQ6ICdRdWV1ZSBsaXN0ZW5lciBzdG9wcGVkLicsXG4gICAgZW1wdHk6ICdjaGFubmVsIGlzIGVtcHR5Li4uJyxcbiAgICAnbm90LWZvdW5kJzogJ3dvcmtlciBub3QgZm91bmQnLFxuICAgIG9mZmxpbmU6ICdEaXNjb25uZWN0ZWQnLFxuICAgIG9ubGluZTogJ0Nvbm5lY3RlZCcsXG4gIH0sXG4gIGV2ZW50OiB7XG4gICAgY3JlYXRlZDogJ05ldyBldmVudCBjcmVhdGVkJyxcbiAgICBmaXJlZDogJ0V2ZW50IGZpcmVkLicsXG4gICAgJ3dpbGRjYXJkLWZpcmVkJzogJ1dpbGRjYXJkIGV2ZW50IGZpcmVkLicsXG4gIH0sXG59O1xuIiwiLyogZXNsaW50IGNsYXNzLW1ldGhvZHMtdXNlLXRoaXM6IFtcImVycm9yXCIsIHsgXCJleGNlcHRNZXRob2RzXCI6IFtcImdldE5hbWVcIiwgXCJnZXRUeXBlXCJdIH1dICovXG4vKiBlc2xpbnQtZW52IGVzNiAqL1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFdmVudCB7XG4gIHN0b3JlOiB7IFtwcm9wOiBzdHJpbmddOiBhbnkgfSA9IHt9O1xuICB2ZXJpZmllclBhdHRlcm46IHN0cmluZyA9IC9eW2EtejAtOS1fXSs6YmVmb3JlJHxhZnRlciR8cmV0cnkkfFxcKiQvO1xuICB3aWxkY2FyZHM6IHN0cmluZ1tdID0gWycqJywgJ2Vycm9yJ107XG4gIGVtcHR5RnVuYzogRnVuY3Rpb24gPSAoKSA9PiB7fTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnN0b3JlLmJlZm9yZSA9IHt9O1xuICAgIHRoaXMuc3RvcmUuYWZ0ZXIgPSB7fTtcbiAgICB0aGlzLnN0b3JlLnJldHJ5ID0ge307XG4gICAgdGhpcy5zdG9yZS53aWxkY2FyZCA9IHt9O1xuICAgIHRoaXMuc3RvcmUuZXJyb3IgPSB0aGlzLmVtcHR5RnVuYztcbiAgICB0aGlzLnN0b3JlWycqJ10gPSB0aGlzLmVtcHR5RnVuYztcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgZXZlbnRcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHBhcmFtICB7RnVuY3Rpb259IGNiXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBvbihrZXk6IHN0cmluZywgY2I6IEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgaWYgKHR5cGVvZiBjYiAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgbmV3IEVycm9yKCdFdmVudCBzaG91bGQgYmUgYW4gZnVuY3Rpb24nKTtcbiAgICBpZiAodGhpcy5pc1ZhbGlkKGtleSkpIHRoaXMuYWRkKGtleSwgY2IpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biBldmVudCB2aWEgaXQncyBrZXlcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHBhcmFtICB7QW55fSBhcmdzXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBlbWl0KGtleTogc3RyaW5nLCBhcmdzOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAodGhpcy53aWxkY2FyZHMuaW5kZXhPZihrZXkpID4gLTEpIHtcbiAgICAgIHRoaXMud2lsZGNhcmQoa2V5LCAuLi5ba2V5LCBhcmdzXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHR5cGU6IHN0cmluZyA9IHRoaXMuZ2V0VHlwZShrZXkpO1xuICAgICAgY29uc3QgbmFtZTogc3RyaW5nID0gdGhpcy5nZXROYW1lKGtleSk7XG5cbiAgICAgIGlmICh0aGlzLnN0b3JlW3R5cGVdKSB7XG4gICAgICAgIGNvbnN0IGNiOiBGdW5jdGlvbiA9IHRoaXMuc3RvcmVbdHlwZV1bbmFtZV0gfHwgdGhpcy5lbXB0eUZ1bmM7XG4gICAgICAgIGNiLmNhbGwobnVsbCwgYXJncyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy53aWxkY2FyZCgnKicsIGtleSwgYXJncyk7XG4gIH1cblxuICAvKipcbiAgICogUnVuIHdpbGRjYXJkIGV2ZW50c1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGFjdGlvbktleVxuICAgKiBAcGFyYW0gIHtBbnl9IGFyZ3NcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHdpbGRjYXJkKGtleTogc3RyaW5nLCBhY3Rpb25LZXk6IHN0cmluZywgYXJnczogYW55KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc3RvcmUud2lsZGNhcmRba2V5XSkge1xuICAgICAgdGhpcy5zdG9yZS53aWxkY2FyZFtrZXldLmNhbGwobnVsbCwgYWN0aW9uS2V5LCBhcmdzKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkIGV2ZW50IHRvIHN0b3JlXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjYlxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYWRkKGtleTogc3RyaW5nLCBjYjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICBpZiAodGhpcy53aWxkY2FyZHMuaW5kZXhPZihrZXkpID4gLTEpIHtcbiAgICAgIHRoaXMuc3RvcmUud2lsZGNhcmRba2V5XSA9IGNiO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB0eXBlOiBzdHJpbmcgPSB0aGlzLmdldFR5cGUoa2V5KTtcbiAgICAgIGNvbnN0IG5hbWU6IHN0cmluZyA9IHRoaXMuZ2V0TmFtZShrZXkpO1xuICAgICAgdGhpcy5zdG9yZVt0eXBlXVtuYW1lXSA9IGNiO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBldmVudCBpbiBzdG9yZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgaGFzKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGtleXM6IHN0cmluZ1tdID0ga2V5LnNwbGl0KCc6Jyk7XG4gICAgICByZXR1cm4ga2V5cy5sZW5ndGggPiAxID8gISF0aGlzLnN0b3JlW2tleXNbMV1dW2tleXNbMF1dIDogISF0aGlzLnN0b3JlLndpbGRjYXJkW2tleXNbMF1dO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IGV2ZW50IG5hbWUgYnkgcGFyc2Uga2V5XG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGdldE5hbWUoa2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBrZXkubWF0Y2goLyguKik6LiovKVsxXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZXZlbnQgdHlwZSBieSBwYXJzZSBrZXlcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgZ2V0VHlwZShrZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGtleS5tYXRjaCgvXlthLXowLTktX10rOiguKikvKVsxXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja2VyIG9mIGV2ZW50IGtleXNcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGlzVmFsaWQoa2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy52ZXJpZmllclBhdHRlcm4udGVzdChrZXkpIHx8IHRoaXMud2lsZGNhcmRzLmluZGV4T2Yoa2V5KSA+IC0xO1xuICB9XG59XG4iLCIvKiBAZmxvdyAqL1xuaW1wb3J0IHR5cGUgSVRhc2sgZnJvbSAnLi9pbnRlcmZhY2VzL3Rhc2snO1xuaW1wb3J0IHR5cGUgSVdvcmtlciBmcm9tICcuL2ludGVyZmFjZXMvd29ya2VyJztcbmltcG9ydCBRdWV1ZSBmcm9tICcuL3F1ZXVlJztcbmltcG9ydCBDaGFubmVsIGZyb20gJy4vY2hhbm5lbCc7XG5pbXBvcnQgU3RvcmFnZUNhcHN1bGUgZnJvbSAnLi9zdG9yYWdlLWNhcHN1bGUnO1xuaW1wb3J0IHsgZXhjbHVkZVNwZWNpZmljVGFza3MsIGhhc01ldGhvZCwgaXNGdW5jdGlvbiB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtcbiAgZXZlbnRGaXJlZExvZyxcbiAgcXVldWVTdG9wcGVkTG9nLFxuICB3b3JrZXJSdW5uaW5Mb2csXG4gIHF1ZXVlRW1wdHlMb2csXG4gIG5vdEZvdW5kTG9nLFxuICB3b3JrZXJEb25lTG9nLFxuICB3b3JrZXJGYWlsZWRMb2csXG59IGZyb20gJy4vY29uc29sZSc7XG5cbi8qIGVzbGludCBuby11bmRlcnNjb3JlLWRhbmdsZTogWzIsIHsgXCJhbGxvd1wiOiBbXCJfaWRcIl0gfV0gKi9cbi8qIGVzbGludCBuby1wYXJhbS1yZWFzc2lnbjogXCJlcnJvclwiICovXG4vKiBlc2xpbnQgdXNlLWlzbmFuOiBcImVycm9yXCIgKi9cblxuLyoqXG4gKiBUYXNrIHByaW9yaXR5IGNvbnRyb2xsZXIgaGVscGVyXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHJldHVybiB7SVRhc2t9XG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVja1ByaW9yaXR5KHRhc2s6IElUYXNrKTogSVRhc2sge1xuICB0YXNrLnByaW9yaXR5ID0gdGFzay5wcmlvcml0eSB8fCAwO1xuXG4gIGlmICh0eXBlb2YgdGFzay5wcmlvcml0eSAhPT0gJ251bWJlcicpIHRhc2sucHJpb3JpdHkgPSAwO1xuXG4gIHJldHVybiB0YXNrO1xufVxuXG4vKipcbiAqIFNob3J0ZW5zIGZ1bmN0aW9uIHRoZSBkYiBiZWxvbmdzdG8gY3VycmVudCBjaGFubmVsXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHJldHVybiB7U3RvcmFnZUNhcHN1bGV9XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkYigpOiBTdG9yYWdlQ2Fwc3VsZSB7XG4gIHJldHVybiAodGhpczogYW55KS5zdG9yYWdlLmNoYW5uZWwoKHRoaXM6IGFueSkubmFtZSgpKTtcbn1cblxuLyoqXG4gKiBHZXQgdW5mcmVlemVkIHRhc2tzIGJ5IHRoZSBmaWx0ZXIgZnVuY3Rpb25cbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcmV0dXJuIHtJVGFza31cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFRhc2tzV2l0aG91dEZyZWV6ZWQoKTogUHJvbWlzZTxJVGFza1tdPiB7XG4gIHJldHVybiAoYXdhaXQgZGIuY2FsbCh0aGlzKS5hbGwoKSkuZmlsdGVyKGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzLmJpbmQoWydmcmVlemVkJ10pKTtcbn1cblxuLyoqXG4gKiBMb2cgcHJveHkgaGVscGVyXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHJldHVybiB7dm9pZH1cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7c3RyaW5nfSBkYXRhXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGNvbmRcbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvZ1Byb3h5KHdyYXBwZXJGdW5jOiBGdW5jdGlvbiwgLi4uYXJnczogYW55KTogdm9pZCB7XG4gIGlmICgodGhpczogYW55KS5jb25maWcuZ2V0KCdkZWJ1ZycpICYmIHR5cGVvZiB3cmFwcGVyRnVuYyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHdyYXBwZXJGdW5jKGFyZ3MpO1xuICB9XG59XG5cbi8qKlxuICogTmV3IHRhc2sgc2F2ZSBoZWxwZXJcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcmV0dXJuIHtzdHJpbmd8Ym9vbGVhbn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVUYXNrKHRhc2s6IElUYXNrKTogUHJvbWlzZTxzdHJpbmcgfCBib29sZWFuPiB7XG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRiLmNhbGwodGhpcykuc2F2ZShjaGVja1ByaW9yaXR5KHRhc2spKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBUYXNrIHJlbW92ZSBoZWxwZXJcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gaWRcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZW1vdmVUYXNrKGlkOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZGIuY2FsbCh0aGlzKS5kZWxldGUoaWQpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEV2ZW50cyBkaXNwYXRjaGVyIGhlbHBlclxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gKiBAcmV0dXJuIHt2b2lkfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzcGF0Y2hFdmVudHModGFzazogSVRhc2ssIHR5cGU6IHN0cmluZyk6IGJvb2xlYW4gfCB2b2lkIHtcbiAgaWYgKCEoJ3RhZycgaW4gdGFzaykpIHJldHVybiBmYWxzZTtcblxuICBjb25zdCBldmVudHMgPSBbW2Ake3Rhc2sudGFnfToke3R5cGV9YCwgJ2ZpcmVkJ10sIFtgJHt0YXNrLnRhZ306KmAsICd3aWxkY2FyZC1maXJlZCddXTtcblxuICBldmVudHMuZm9yRWFjaCgoZSkgPT4ge1xuICAgIHRoaXMuZXZlbnQuZW1pdChlWzBdLCB0YXNrKTtcbiAgICBsb2dQcm94eS5jYWxsKCh0aGlzOiBhbnkpLCBldmVudEZpcmVkTG9nLCAuLi5lKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogUXVldWUgc3RvcHBlciBoZWxwZXJcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcmV0dXJuIHt2b2lkfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RvcFF1ZXVlKCk6IHZvaWQge1xuICB0aGlzLnN0b3AoKTtcblxuICBjbGVhclRpbWVvdXQodGhpcy5jdXJyZW50VGltZW91dCk7XG5cbiAgbG9nUHJveHkuY2FsbCh0aGlzLCBxdWV1ZVN0b3BwZWRMb2csICdzdG9wJyk7XG59XG5cbi8qKlxuICogRmFpbGVkIGpvYiBoYW5kbGVyXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHJldHVybiB7SVRhc2t9IGpvYlxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmYWlsZWRKb2JIYW5kbGVyKHRhc2s6IElUYXNrKTogUHJvbWlzZTxGdW5jdGlvbj4ge1xuICByZXR1cm4gYXN5bmMgZnVuY3Rpb24gY2hpbGRGYWlsZWRIYW5kbGVyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJlbW92ZVRhc2suY2FsbCh0aGlzLCB0YXNrLl9pZCk7XG5cbiAgICB0aGlzLmV2ZW50LmVtaXQoJ2Vycm9yJywgdGFzayk7XG5cbiAgICBsb2dQcm94eS5jYWxsKHRoaXMsIHdvcmtlckZhaWxlZExvZyk7XG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGF3YWl0IHRoaXMubmV4dCgpO1xuICB9O1xufVxuXG4vKipcbiAqIEhlbHBlciBvZiB0aGUgbG9jayB0YXNrIG9mIHRoZSBjdXJyZW50IGpvYlxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2NrVGFzayh0YXNrOiBJVGFzayk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICBjb25zdCByZXN1bHQgPSBhd2FpdCBkYi5jYWxsKHRoaXMpLnVwZGF0ZSh0YXNrLl9pZCwgeyBsb2NrZWQ6IHRydWUgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogQ2xhc3MgZXZlbnQgbHVhbmNoZXIgaGVscGVyXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7SVdvcmtlcn0gd29ya2VyXG4gKiBAcGFyYW0ge2FueX0gYXJnc1xuICogQHJldHVybiB7Ym9vbGVhbnx2b2lkfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZmlyZUpvYklubGluZUV2ZW50KG5hbWU6IHN0cmluZywgd29ya2VyOiBJV29ya2VyLCBhcmdzOiBhbnkpOiBib29sZWFuIHtcbiAgaWYgKGhhc01ldGhvZCh3b3JrZXIsIG5hbWUpICYmIGlzRnVuY3Rpb24od29ya2VyW25hbWVdKSkge1xuICAgIHdvcmtlcltuYW1lXS5jYWxsKHdvcmtlciwgYXJncyk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIFByb2Nlc3MgaGFuZGxlciBvZiBzdWNjZWVkZWQgam9iXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHJldHVybiB7dm9pZH1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1Y2Nlc3NQcm9jZXNzKHRhc2s6IElUYXNrKTogdm9pZCB7XG4gIHJlbW92ZVRhc2suY2FsbCh0aGlzLCB0YXNrLl9pZCk7XG59XG5cbi8qKlxuICogVXBkYXRlIHRhc2sncyByZXRyeSB2YWx1ZVxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqIEBwYXJhbSB7SVdvcmtlcn0gd29ya2VyXG4gKiBAcmV0dXJuIHtJVGFza31cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVJldHJ5KHRhc2s6IElUYXNrLCB3b3JrZXI6IElXb3JrZXIpOiBJVGFzayB7XG4gIGlmICghKCdyZXRyeScgaW4gd29ya2VyKSkgd29ya2VyLnJldHJ5ID0gMTtcblxuICBpZiAoISgndHJpZWQnIGluIHRhc2spKSB7XG4gICAgdGFzay50cmllZCA9IDA7XG4gICAgdGFzay5yZXRyeSA9IHdvcmtlci5yZXRyeTtcbiAgfVxuXG4gIHRhc2sudHJpZWQgKz0gMTtcblxuICBpZiAodGFzay50cmllZCA+PSB3b3JrZXIucmV0cnkpIHtcbiAgICB0YXNrLmZyZWV6ZWQgPSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIHRhc2s7XG59XG5cbi8qKlxuICogUHJvY2VzcyBoYW5kbGVyIG9mIHJldHJpZWQgam9iXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHBhcmFtIHtJV29ya2VyfSB3b3JrZXJcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZXRyeVByb2Nlc3ModGFzazogSVRhc2ssIHdvcmtlcjogSVdvcmtlcik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAvLyBkaXNwYWN0aCBjdXN0b20gcmV0cnkgZXZlbnRcbiAgZGlzcGF0Y2hFdmVudHMuY2FsbCh0aGlzLCB0YXNrLCAncmV0cnknKTtcblxuICAvLyB1cGRhdGUgcmV0cnkgdmFsdWVcbiAgY29uc3QgdXBkYXRlVGFzazogSVRhc2sgPSB1cGRhdGVSZXRyeS5jYWxsKHRoaXMsIHRhc2ssIHdvcmtlcik7XG5cbiAgLy8gZGVsZXRlIGxvY2sgcHJvcGVydHkgZm9yIG5leHQgcHJvY2Vzc1xuICB1cGRhdGVUYXNrLmxvY2tlZCA9IGZhbHNlO1xuXG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRiLmNhbGwodGhpcykudXBkYXRlKHRhc2suX2lkLCB1cGRhdGVUYXNrKTtcblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFN1Y2NlZWQgam9iIGhhbmRsZXJcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcGFyYW0ge0lXb3JrZXJ9IHdvcmtlclxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdWNjZXNzSm9iSGFuZGxlcih0YXNrOiBJVGFzaywgd29ya2VyOiBJV29ya2VyKTogUHJvbWlzZTxGdW5jdGlvbj4ge1xuICBjb25zdCBzZWxmOiBDaGFubmVsID0gdGhpcztcbiAgcmV0dXJuIGFzeW5jIGZ1bmN0aW9uIGNoaWxkU3VjY2Vzc0pvYkhhbmRsZXIocmVzdWx0OiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gZGlzcGF0Y2ggam9iIHByb2Nlc3MgYWZ0ZXIgcnVucyBhIHRhc2sgYnV0IG9ubHkgbm9uIGVycm9yIGpvYnNcbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICAvLyBnbyBhaGVhZCB0byBzdWNjZXNzIHByb2Nlc3NcbiAgICAgIHN1Y2Nlc3NQcm9jZXNzLmNhbGwoc2VsZiwgdGFzayk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGdvIGFoZWFkIHRvIHJldHJ5IHByb2Nlc3NcbiAgICAgIGF3YWl0IHJldHJ5UHJvY2Vzcy5jYWxsKHNlbGYsIHRhc2ssIHdvcmtlcik7XG4gICAgfVxuXG4gICAgLy8gZmlyZSBqb2IgYWZ0ZXIgZXZlbnRcbiAgICBmaXJlSm9iSW5saW5lRXZlbnQuY2FsbChzZWxmLCAnYWZ0ZXInLCB3b3JrZXIsIHRhc2suYXJncyk7XG5cbiAgICAvLyBkaXNwYWN0aCBjdXN0b20gYWZ0ZXIgZXZlbnRcbiAgICBkaXNwYXRjaEV2ZW50cy5jYWxsKHNlbGYsIHRhc2ssICdhZnRlcicpO1xuXG4gICAgLy8gc2hvdyBjb25zb2xlXG4gICAgbG9nUHJveHkuY2FsbChzZWxmLCB3b3JrZXJEb25lTG9nLCByZXN1bHQsIHRhc2ssIHdvcmtlcik7XG5cbiAgICAvLyB0cnkgbmV4dCBxdWV1ZSBqb2JcbiAgICBhd2FpdCBzZWxmLm5leHQoKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBKb2IgaGFuZGxlciBoZWxwZXJcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcGFyYW0ge0lKb2J9IHdvcmtlclxuICogQHBhcmFtIHtJV29ya2VyfSB3b3JrZXJJbnN0YW5jZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0IC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovIGZ1bmN0aW9uIGxvb3BIYW5kbGVyKFxuICB0YXNrOiBJVGFzayxcbiAgd29ya2VyOiBGdW5jdGlvbixcbiAgd29ya2VySW5zdGFuY2U6IElXb3JrZXIsXG4pOiBGdW5jdGlvbiB7XG4gIHJldHVybiBhc3luYyBmdW5jdGlvbiBjaGlsZExvb3BIYW5kbGVyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHNlbGY6IENoYW5uZWwgPSB0aGlzO1xuXG4gICAgLy8gbG9jayB0aGUgY3VycmVudCB0YXNrIGZvciBwcmV2ZW50IHJhY2UgY29uZGl0aW9uXG4gICAgYXdhaXQgbG9ja1Rhc2suY2FsbChzZWxmLCB0YXNrKTtcblxuICAgIC8vIGZpcmUgam9iIGJlZm9yZSBldmVudFxuICAgIGZpcmVKb2JJbmxpbmVFdmVudC5jYWxsKHRoaXMsICdiZWZvcmUnLCB3b3JrZXJJbnN0YW5jZSwgdGFzay5hcmdzKTtcblxuICAgIC8vIGRpc3BhY3RoIGN1c3RvbSBiZWZvcmUgZXZlbnRcbiAgICBkaXNwYXRjaEV2ZW50cy5jYWxsKHRoaXMsIHRhc2ssICdiZWZvcmUnKTtcblxuICAgIGNvbnN0IGRlcHMgPSBRdWV1ZS53b3JrZXJEZXBzW3dvcmtlci5uYW1lXTtcblxuICAgIC8vIHByZXBhcmluZyB3b3JrZXIgZGVwZW5kZW5jaWVzXG4gICAgY29uc3QgZGVwZW5kZW5jaWVzID0gT2JqZWN0LnZhbHVlcyhkZXBzIHx8IHt9KTtcblxuICAgIC8vIHNob3cgY29uc29sZVxuICAgIGxvZ1Byb3h5LmNhbGwoXG4gICAgICB0aGlzLFxuICAgICAgd29ya2VyUnVubmluTG9nLFxuICAgICAgd29ya2VyLFxuICAgICAgd29ya2VySW5zdGFuY2UsXG4gICAgICB0YXNrLFxuICAgICAgc2VsZi5uYW1lKCksXG4gICAgICBRdWV1ZS53b3JrZXJEZXBzLFxuICAgICk7XG5cbiAgICAvLyBUYXNrIHJ1bm5lciBwcm9taXNlXG4gICAgd29ya2VySW5zdGFuY2UuaGFuZGxlXG4gICAgICAuY2FsbCh3b3JrZXJJbnN0YW5jZSwgdGFzay5hcmdzLCAuLi5kZXBlbmRlbmNpZXMpXG4gICAgICAudGhlbigoYXdhaXQgc3VjY2Vzc0pvYkhhbmRsZXIuY2FsbChzZWxmLCB0YXNrLCB3b3JrZXJJbnN0YW5jZSkpLmJpbmQoc2VsZikpXG4gICAgICAuY2F0Y2goKGF3YWl0IGZhaWxlZEpvYkhhbmRsZXIuY2FsbChzZWxmLCB0YXNrKSkuYmluZChzZWxmKSk7XG4gIH07XG59XG5cbi8qKlxuICogVGltZW91dCBjcmVhdG9yIGhlbHBlclxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEByZXR1cm4ge251bWJlcn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVRpbWVvdXQoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgLy8gaWYgcnVubmluZyBhbnkgam9iLCBzdG9wIGl0XG4gIC8vIHRoZSBwdXJwb3NlIGhlcmUgaXMgdG8gcHJldmVudCBjb2N1cnJlbnQgb3BlcmF0aW9uIGluIHNhbWUgY2hhbm5lbFxuICBjbGVhclRpbWVvdXQodGhpcy5jdXJyZW50VGltZW91dCk7XG5cbiAgLy8gR2V0IG5leHQgdGFza1xuICBjb25zdCB0YXNrOiBJVGFzayA9IChhd2FpdCBkYi5jYWxsKHRoaXMpLmZldGNoKCkpLnNoaWZ0KCk7XG5cbiAgaWYgKHRhc2sgPT09IHVuZGVmaW5lZCkge1xuICAgIGxvZ1Byb3h5LmNhbGwodGhpcywgcXVldWVFbXB0eUxvZywgdGhpcy5uYW1lKCkpO1xuICAgIHN0b3BRdWV1ZS5jYWxsKHRoaXMpO1xuICAgIHJldHVybiAxO1xuICB9XG5cbiAgaWYgKCFRdWV1ZS53b3JrZXIuaGFzKHRhc2suaGFuZGxlcikpIHtcbiAgICBsb2dQcm94eS5jYWxsKHRoaXMsIG5vdEZvdW5kTG9nLCB0YXNrLmhhbmRsZXIpO1xuICAgIGF3YWl0IChhd2FpdCBmYWlsZWRKb2JIYW5kbGVyLmNhbGwodGhpcywgdGFzaykpLmNhbGwodGhpcyk7XG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICAvLyBHZXQgd29ya2VyIHdpdGggaGFuZGxlciBuYW1lXG4gIGNvbnN0IEpvYldvcmtlcjogRnVuY3Rpb24gPSBRdWV1ZS53b3JrZXIuZ2V0KHRhc2suaGFuZGxlcik7XG5cbiAgLy8gQ3JlYXRlIGEgd29ya2VyIGluc3RhbmNlXG4gIGNvbnN0IHdvcmtlckluc3RhbmNlOiBJV29ya2VyID0gbmV3IEpvYldvcmtlcigpO1xuXG4gIC8vIGdldCBhbHdheXMgbGFzdCB1cGRhdGVkIGNvbmZpZyB2YWx1ZVxuICBjb25zdCB0aW1lb3V0OiBudW1iZXIgPSB0aGlzLmNvbmZpZy5nZXQoJ3RpbWVvdXQnKTtcblxuICAvLyBjcmVhdGUgYSBhcnJheSB3aXRoIGhhbmRsZXIgcGFyYW1ldGVycyBmb3Igc2hvcnRlbiBsaW5lIG51bWJlcnNcbiAgY29uc3QgcGFyYW1zID0gW3Rhc2ssIEpvYldvcmtlciwgd29ya2VySW5zdGFuY2VdO1xuXG4gIC8vIEdldCBoYW5kbGVyIGZ1bmN0aW9uIGZvciBoYW5kbGUgb24gY29tcGxldGVkIGV2ZW50XG4gIGNvbnN0IGhhbmRsZXI6IEZ1bmN0aW9uID0gKGF3YWl0IGxvb3BIYW5kbGVyLmNhbGwodGhpcywgLi4ucGFyYW1zKSkuYmluZCh0aGlzKTtcblxuICAvLyBjcmVhdGUgbmV3IHRpbWVvdXQgZm9yIHByb2Nlc3MgYSBqb2IgaW4gcXVldWVcbiAgLy8gYmluZGluZyBsb29wSGFuZGxlciBmdW5jdGlvbiB0byBzZXRUaW1lb3V0XG4gIC8vIHRoZW4gcmV0dXJuIHRoZSB0aW1lb3V0IGluc3RhbmNlXG4gIHRoaXMuY3VycmVudFRpbWVvdXQgPSBzZXRUaW1lb3V0KGhhbmRsZXIsIHRpbWVvdXQpO1xuXG4gIHJldHVybiB0aGlzLmN1cnJlbnRUaW1lb3V0O1xufVxuXG4vKipcbiAqIFNldCB0aGUgc3RhdHVzIHRvIGZhbHNlIG9mIHF1ZXVlXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHJldHVybiB7dm9pZH1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXR1c09mZigpOiB2b2lkIHtcbiAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgYSB0YXNrIGlzIHJlcGxpY2FibGUgb3Igbm90XG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNhbk11bHRpcGxlKHRhc2s6IElUYXNrKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGlmICh0eXBlb2YgdGFzayAhPT0gJ29iamVjdCcgfHwgdGFzay51bmlxdWUgIT09IHRydWUpIHJldHVybiB0cnVlO1xuICByZXR1cm4gKGF3YWl0IHRoaXMuaGFzQnlUYWcodGFzay50YWcpKSA9PT0gZmFsc2U7XG59XG4iLCJpbXBvcnQgUXVldWUgZnJvbSAnLi9xdWV1ZSc7XG5cbi8qIGdsb2JhbCB3aW5kb3c6dHJ1ZSAqL1xuXG53aW5kb3cuUXVldWUgPSBRdWV1ZTtcblxuZXhwb3J0IGRlZmF1bHQgUXVldWU7XG4iLCIvKiBAZmxvdyAqL1xuaW1wb3J0IHR5cGUgSUNvbmZpZyBmcm9tICcuL2ludGVyZmFjZXMvY29uZmlnJztcbmltcG9ydCBDaGFubmVsIGZyb20gJy4vY2hhbm5lbCc7XG5pbXBvcnQgQ29udGFpbmVyIGZyb20gJy4vY29udGFpbmVyJztcbmltcG9ydCBDb25maWcgZnJvbSAnLi9jb25maWcnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBRdWV1ZShjb25maWc6IElDb25maWcpIHtcbiAgdGhpcy5jb25maWcgPSBuZXcgQ29uZmlnKGNvbmZpZyk7XG59XG5cblF1ZXVlLkZJRk8gPSAnZmlmbyc7XG5RdWV1ZS5MSUZPID0gJ2xpZm8nO1xuUXVldWUuZHJpdmVycyA9IHt9O1xuUXVldWUud29ya2VyRGVwcyA9IHt9O1xuUXVldWUud29ya2VyID0gbmV3IENvbnRhaW5lcigpO1xuUXVldWUucHJvdG90eXBlLmNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoKTtcblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgY2hhbm5lbFxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gdGFza1xuICogQHJldHVybiB7UXVldWV9IGNoYW5uZWxcbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5RdWV1ZS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKGNoYW5uZWw6IHN0cmluZyk6IFF1ZXVlIHtcbiAgaWYgKCF0aGlzLmNvbnRhaW5lci5oYXMoY2hhbm5lbCkpIHtcbiAgICB0aGlzLmNvbnRhaW5lci5iaW5kKGNoYW5uZWwsIG5ldyBDaGFubmVsKGNoYW5uZWwsIHRoaXMuY29uZmlnKSk7XG4gIH1cbiAgcmV0dXJuIHRoaXMuY29udGFpbmVyLmdldChjaGFubmVsKTtcbn07XG5cbi8qKlxuICogR2V0IGNoYW5uZWwgaW5zdGFuY2UgYnkgY2hhbm5lbCBuYW1lXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtRdWV1ZX1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5RdWV1ZS5wcm90b3R5cGUuY2hhbm5lbCA9IGZ1bmN0aW9uIGNoYW5uZWwobmFtZTogc3RyaW5nKTogUXVldWUge1xuICBpZiAoIXRoaXMuY29udGFpbmVyLmhhcyhuYW1lKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgXCIke25hbWV9XCIgY2hhbm5lbCBub3QgZm91bmRgKTtcbiAgfVxuICByZXR1cm4gdGhpcy5jb250YWluZXIuZ2V0KG5hbWUpO1xufTtcblxuLyoqXG4gKiBTZXQgY29uZmlnIHRpbWVvdXQgdmFsdWVcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZhbFxuICogQHJldHVybiB7Vm9pZH1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5RdWV1ZS5wcm90b3R5cGUuc2V0VGltZW91dCA9IGZ1bmN0aW9uIHNldFRpbWVvdXQodmFsOiBudW1iZXIpOiB2b2lkIHtcbiAgdGhpcy5jb25maWcuc2V0KCd0aW1lb3V0JywgdmFsKTtcbn07XG5cbi8qKlxuICogU2V0IGNvbmZpZyBsaW1pdCB2YWx1ZVxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gdmFsXG4gKiBAcmV0dXJuIHtWb2lkfVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblF1ZXVlLnByb3RvdHlwZS5zZXRMaW1pdCA9IGZ1bmN0aW9uIHNldExpbWl0KHZhbDogbnVtYmVyKTogdm9pZCB7XG4gIHRoaXMuY29uZmlnLnNldCgnbGltaXQnLCB2YWwpO1xufTtcblxuLyoqXG4gKiBTZXQgY29uZmlnIHByZWZpeCB2YWx1ZVxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gdmFsXG4gKiBAcmV0dXJuIHtWb2lkfVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblF1ZXVlLnByb3RvdHlwZS5zZXRQcmVmaXggPSBmdW5jdGlvbiBzZXRQcmVmaXgodmFsOiBzdHJpbmcpOiB2b2lkIHtcbiAgdGhpcy5jb25maWcuc2V0KCdwcmVmaXgnLCB2YWwpO1xufTtcblxuLyoqXG4gKiBTZXQgY29uZmlnIHByaWNpcGxlIHZhbHVlXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1ZvaWR9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUXVldWUucHJvdG90eXBlLnNldFByaW5jaXBsZSA9IGZ1bmN0aW9uIHNldFByaW5jaXBsZSh2YWw6IHN0cmluZyk6IHZvaWQge1xuICB0aGlzLmNvbmZpZy5zZXQoJ3ByaW5jaXBsZScsIHZhbCk7XG59O1xuXG4vKipcbiAqIFNldCBjb25maWcgZGVidWcgdmFsdWVcbiAqXG4gKiBAcGFyYW0gIHtCb29sZWFufSB2YWxcbiAqIEByZXR1cm4ge1ZvaWR9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUXVldWUucHJvdG90eXBlLnNldERlYnVnID0gZnVuY3Rpb24gc2V0RGVidWcodmFsOiBib29sZWFuKTogdm9pZCB7XG4gIHRoaXMuY29uZmlnLnNldCgnZGVidWcnLCB2YWwpO1xufTtcblxuUXVldWUucHJvdG90eXBlLnNldFN0b3JhZ2UgPSBmdW5jdGlvbiBzZXRTdG9yYWdlKHZhbDogc3RyaW5nKTogdm9pZCB7XG4gIHRoaXMuY29uZmlnLnNldCgnc3RvcmFnZScsIHZhbCk7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVyIHdvcmtlclxuICpcbiAqIEBwYXJhbSAge0FycmF5PElKb2I+fSBqb2JzXG4gKiBAcmV0dXJuIHtWb2lkfVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblF1ZXVlLndvcmtlcnMgPSBmdW5jdGlvbiB3b3JrZXJzKHdvcmtlcnNPYmo6IHsgW3Byb3A6IHN0cmluZ106IGFueSB9ID0ge30pOiB2b2lkIHtcbiAgaWYgKCEod29ya2Vyc09iaiBpbnN0YW5jZW9mIE9iamVjdCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBwYXJhbWV0ZXJzIHNob3VsZCBiZSBvYmplY3QuJyk7XG4gIH1cblxuICBRdWV1ZS53b3JrZXIubWVyZ2Uod29ya2Vyc09iaik7XG59O1xuXG4vKipcbiAqIEFkZGVkIHdvcmtlcnMgZGVwZW5kZW5jaWVzXG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSBkcml2ZXJcbiAqIEByZXR1cm4ge1ZvaWR9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUXVldWUuZGVwcyA9IGZ1bmN0aW9uIGRlcHMoZGVwZW5kZW5jaWVzOiB7IFtwcm9wOiBzdHJpbmddOiBhbnkgfSA9IHt9KTogdm9pZCB7XG4gIGlmICghKGRlcGVuZGVuY2llcyBpbnN0YW5jZW9mIE9iamVjdCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBwYXJhbWV0ZXJzIHNob3VsZCBiZSBvYmplY3QuJyk7XG4gIH1cbiAgUXVldWUud29ya2VyRGVwcyA9IGRlcGVuZGVuY2llcztcbn07XG5cbi8qKlxuICogU2V0dXAgYSBjdXN0b20gZHJpdmVyXG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSBkcml2ZXJcbiAqIEByZXR1cm4ge1ZvaWR9XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUXVldWUudXNlID0gZnVuY3Rpb24gdXNlKGRyaXZlcjogeyBbcHJvcDogc3RyaW5nXTogYW55IH0gPSB7fSk6IHZvaWQge1xuICBRdWV1ZS5kcml2ZXJzID0geyAuLi5RdWV1ZS5kcml2ZXJzLCAuLi5kcml2ZXIgfTtcbn07XG4iLCIvKiBAZmxvdyAqL1xuaW1wb3J0IGdyb3VwQnkgZnJvbSAnZ3JvdXAtYnknO1xuaW1wb3J0IHR5cGUgSUNvbmZpZyBmcm9tICcuL2ludGVyZmFjZXMvY29uZmlnJztcbmltcG9ydCB0eXBlIHsgSVN0b3JhZ2UgfSBmcm9tICcuL2ludGVyZmFjZXMvc3RvcmFnZSc7XG5pbXBvcnQgdHlwZSBJVGFzayBmcm9tICcuL2ludGVyZmFjZXMvdGFzayc7XG5pbXBvcnQgeyBMb2NhbFN0b3JhZ2VBZGFwdGVyLCBJbk1lbW9yeUFkYXB0ZXIgfSBmcm9tICcuL2FkYXB0ZXJzJztcbmltcG9ydCB7IGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzLCBsaWZvLCBmaWZvIH0gZnJvbSAnLi91dGlscyc7XG5cbi8qIGVzbGludCBuby1jb25zb2xlOiBbXCJlcnJvclwiLCB7IGFsbG93OiBbXCJ3YXJuXCIsIFwiZXJyb3JcIl0gfV0gKi9cbi8qIGVzbGludCBuby11bmRlcnNjb3JlLWRhbmdsZTogWzIsIHsgXCJhbGxvd1wiOiBbXCJfaWRcIl0gfV0gKi9cbi8qIGVzbGludCBjbGFzcy1tZXRob2RzLXVzZS10aGlzOiBbXCJlcnJvclwiLCB7IFwiZXhjZXB0TWV0aG9kc1wiOiBbXCJnZW5lcmF0ZUlkXCJdIH1dICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0b3JhZ2VDYXBzdWxlIHtcbiAgY29uZmlnOiBJQ29uZmlnO1xuICBzdG9yYWdlOiBJU3RvcmFnZTtcbiAgc3RvcmFnZUNoYW5uZWw6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcihjb25maWc6IElDb25maWcsIHN0b3JhZ2U6IElTdG9yYWdlKSB7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5zdG9yYWdlID0gdGhpcy5pbml0aWFsaXplKHN0b3JhZ2UpO1xuICB9XG5cbiAgaW5pdGlhbGl6ZShTdG9yYWdlOiBhbnkpIHtcbiAgICBpZiAodHlwZW9mIFN0b3JhZ2UgPT09ICdvYmplY3QnKSB7XG4gICAgICByZXR1cm4gU3RvcmFnZTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBTdG9yYWdlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gbmV3IFN0b3JhZ2UodGhpcy5jb25maWcpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5jb25maWcuZ2V0KCdzdG9yYWdlJykgPT09ICdsb2NhbHN0b3JhZ2UnKSB7XG4gICAgICByZXR1cm4gbmV3IExvY2FsU3RvcmFnZUFkYXB0ZXIodGhpcy5jb25maWcpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IEluTWVtb3J5QWRhcHRlcih0aGlzLmNvbmZpZyk7XG4gIH1cblxuICAvKipcbiAgICogU2VsZWN0IGEgY2hhbm5lbCBieSBjaGFubmVsIG5hbWVcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm4ge1N0b3JhZ2VDYXBzdWxlfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgY2hhbm5lbChuYW1lOiBzdHJpbmcpOiBTdG9yYWdlQ2Fwc3VsZSB7XG4gICAgdGhpcy5zdG9yYWdlQ2hhbm5lbCA9IG5hbWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogRmV0Y2ggdGFza3MgZnJvbSBzdG9yYWdlIHdpdGggb3JkZXJlZFxuICAgKlxuICAgKiBAcmV0dXJuIHthbnlbXX1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGZldGNoKCk6IFByb21pc2U8YW55W10+IHtcbiAgICBjb25zdCBhbGwgPSAoYXdhaXQgdGhpcy5hbGwoKSkuZmlsdGVyKGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzKTtcbiAgICBjb25zdCB0YXNrcyA9IGdyb3VwQnkoYWxsLCAncHJpb3JpdHknKTtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGFza3MpXG4gICAgICAubWFwKGtleSA9PiBwYXJzZUludChrZXksIDEwKSlcbiAgICAgIC5zb3J0KChhLCBiKSA9PiBiIC0gYSlcbiAgICAgIC5yZWR1Y2UodGhpcy5yZWR1Y2VUYXNrcyh0YXNrcyksIFtdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTYXZlIHRhc2sgdG8gc3RvcmFnZVxuICAgKlxuICAgKiBAcGFyYW0gIHtJVGFza30gdGFza1xuICAgKiBAcmV0dXJuIHtTdHJpbmd8Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIHNhdmUodGFzazogSVRhc2spOiBQcm9taXNlPHN0cmluZyB8IGJvb2xlYW4+IHtcbiAgICBpZiAodHlwZW9mIHRhc2sgIT09ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBnZXQgYWxsIHRhc2tzIGN1cnJlbnQgY2hhbm5lbCdzXG4gICAgY29uc3QgdGFza3M6IElUYXNrW10gPSBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0KHRoaXMuc3RvcmFnZUNoYW5uZWwpO1xuXG4gICAgLy8gQ2hlY2sgdGhlIGNoYW5uZWwgbGltaXQuXG4gICAgLy8gSWYgbGltaXQgaXMgZXhjZWVkZWQsIGRvZXMgbm90IGluc2VydCBuZXcgdGFza1xuICAgIGlmIChhd2FpdCB0aGlzLmlzRXhjZWVkZWQoKSkge1xuICAgICAgY29uc29sZS53YXJuKGBUYXNrIGxpbWl0IGV4Y2VlZGVkOiBUaGUgJyR7dGhpcy5zdG9yYWdlQ2hhbm5lbH0nIGNoYW5uZWwgbGltaXQgaXMgJHt0aGlzLmNvbmZpZy5nZXQoJ2xpbWl0Jyl9YCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gcHJlcGFyZSBhbGwgcHJvcGVydGllcyBiZWZvcmUgc2F2ZVxuICAgIC8vIGV4YW1wbGU6IGNyZWF0ZWRBdCBldGMuXG4gICAgY29uc3QgbmV3VGFzayA9IHRoaXMucHJlcGFyZVRhc2sodGFzayk7XG5cbiAgICAvLyBhZGQgdGFzayB0byBzdG9yYWdlXG4gICAgdGFza3MucHVzaChuZXdUYXNrKTtcblxuICAgIC8vIHNhdmUgdGFza3NcbiAgICBhd2FpdCB0aGlzLnN0b3JhZ2Uuc2V0KHRoaXMuc3RvcmFnZUNoYW5uZWwsIHRhc2tzKTtcblxuICAgIHJldHVybiBuZXdUYXNrLl9pZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgY2hhbm5lbCBzdG9yZS5cbiAgICpcbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKiAgIFRoZSB2YWx1ZS4gVGhpcyBhbm5vdGF0aW9uIGNhbiBiZSB1c2VkIGZvciB0eXBlIGhpbnRpbmcgcHVycG9zZXMuXG4gICAqL1xuICBhc3luYyB1cGRhdGUoaWQ6IHN0cmluZywgdXBkYXRlOiB7IFtwcm9wZXJ0eTogc3RyaW5nXTogYW55IH0pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBkYXRhOiBhbnlbXSA9IGF3YWl0IHRoaXMuYWxsKCk7XG4gICAgY29uc3QgaW5kZXg6IG51bWJlciA9IGRhdGEuZmluZEluZGV4KHQgPT4gdC5faWQgPT09IGlkKTtcblxuICAgIC8vIGlmIGluZGV4IG5vdCBmb3VuZCwgcmV0dXJuIGZhbHNlXG4gICAgaWYgKGluZGV4IDwgMCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gbWVyZ2UgZXhpc3Rpbmcgb2JqZWN0IHdpdGggZ2l2ZW4gdXBkYXRlIG9iamVjdFxuICAgIGRhdGFbaW5kZXhdID0gT2JqZWN0LmFzc2lnbih7fSwgZGF0YVtpbmRleF0sIHVwZGF0ZSk7XG5cbiAgICAvLyBzYXZlIHRvIHRoZSBzdG9yYWdlIGFzIHN0cmluZ1xuICAgIGF3YWl0IHRoaXMuc3RvcmFnZS5zZXQodGhpcy5zdG9yYWdlQ2hhbm5lbCwgZGF0YSk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgdGFzayBmcm9tIHN0b3JhZ2VcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBpZFxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgZGVsZXRlKGlkOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBkYXRhOiBhbnlbXSA9IGF3YWl0IHRoaXMuYWxsKCk7XG4gICAgY29uc3QgaW5kZXg6IG51bWJlciA9IGRhdGEuZmluZEluZGV4KGQgPT4gZC5faWQgPT09IGlkKTtcblxuICAgIGlmIChpbmRleCA8IDApIHJldHVybiBmYWxzZTtcblxuICAgIGRlbGV0ZSBkYXRhW2luZGV4XTtcblxuICAgIGF3YWl0IHRoaXMuc3RvcmFnZS5zZXQodGhpcy5zdG9yYWdlQ2hhbm5lbCwgZGF0YS5maWx0ZXIoZCA9PiBkKSk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIHRhc2tzXG4gICAqXG4gICAqIEByZXR1cm4ge0FueVtdfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgYWxsKCk6IFByb21pc2U8SVRhc2tbXT4ge1xuICAgIGNvbnN0IGl0ZW1zID0gYXdhaXQgdGhpcy5zdG9yYWdlLmdldCh0aGlzLnN0b3JhZ2VDaGFubmVsKTtcbiAgICByZXR1cm4gaXRlbXM7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgdW5pcXVlIGlkXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGdlbmVyYXRlSWQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gKCgxICsgTWF0aC5yYW5kb20oKSkgKiAweDEwMDAwKS50b1N0cmluZygxNik7XG4gIH1cblxuICAvKipcbiAgICogQWRkIHNvbWUgbmVjZXNzYXJ5IHByb3BlcnRpZXNcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBpZFxuICAgKiBAcmV0dXJuIHtJVGFza31cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHByZXBhcmVUYXNrKHRhc2s6IElUYXNrKTogSVRhc2sge1xuICAgIGNvbnN0IG5ld1Rhc2sgPSB7IC4uLnRhc2sgfTtcbiAgICBuZXdUYXNrLmNyZWF0ZWRBdCA9IERhdGUubm93KCk7XG4gICAgbmV3VGFzay5faWQgPSB0aGlzLmdlbmVyYXRlSWQoKTtcbiAgICByZXR1cm4gbmV3VGFzaztcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgc29tZSBuZWNlc3NhcnkgcHJvcGVydGllc1xuICAgKlxuICAgKiBAcGFyYW0gIHtJVGFza1tdfSB0YXNrc1xuICAgKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHJlZHVjZVRhc2tzKHRhc2tzOiBJVGFza1tdKSB7XG4gICAgY29uc3QgcmVkdWNlRnVuYyA9IChyZXN1bHQ6IElUYXNrW10sIGtleTogYW55KTogSVRhc2tbXSA9PiB7XG4gICAgICBpZiAodGhpcy5jb25maWcuZ2V0KCdwcmluY2lwbGUnKSA9PT0gJ2xpZm8nKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQuY29uY2F0KHRhc2tzW2tleV0uc29ydChsaWZvKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0LmNvbmNhdCh0YXNrc1trZXldLnNvcnQoZmlmbykpO1xuICAgIH07XG5cbiAgICByZXR1cm4gcmVkdWNlRnVuYy5iaW5kKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRhc2sgbGltaXQgY2hlY2tlclxuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgaXNFeGNlZWRlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBsaW1pdDogbnVtYmVyID0gdGhpcy5jb25maWcuZ2V0KCdsaW1pdCcpO1xuICAgIGNvbnN0IHRhc2tzOiBJVGFza1tdID0gKGF3YWl0IHRoaXMuYWxsKCkpLmZpbHRlcihleGNsdWRlU3BlY2lmaWNUYXNrcyk7XG4gICAgcmV0dXJuICEobGltaXQgPT09IC0xIHx8IGxpbWl0ID4gdGFza3MubGVuZ3RoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciB0YXNrcyB3aXRoIGdpdmVuIGNoYW5uZWwgbmFtZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGNoYW5uZWxcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGNsZWFyKGNoYW5uZWw6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuc3RvcmFnZS5jbGVhcihjaGFubmVsKTtcbiAgfVxufVxuIiwiLyogQGZsb3cgKi9cbmltcG9ydCB0eXBlIElUYXNrIGZyb20gJy4vaW50ZXJmYWNlcy90YXNrJztcblxuLyogZXNsaW50IGNvbW1hLWRhbmdsZTogW1wiZXJyb3JcIiwgXCJuZXZlclwiXSAqL1xuXG4vKipcbiAqIENoZWNrIHByb3BlcnR5IGluIG9iamVjdFxuICpcbiAqIEBwYXJhbSAge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXNQcm9wZXJ0eShmdW5jOiBGdW5jdGlvbiwgbmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZnVuYywgbmFtZSk7XG59XG5cbi8qKlxuICogQ2hlY2sgbWV0aG9kIGluIGluaXRpYXRlZCBjbGFzc1xuICpcbiAqIEBwYXJhbSAge0NsYXNzfSBpbnN0YW5jZVxuICogQHBhcmFtICB7U3RyaW5nfSBtZXRob2RcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc01ldGhvZChpbnN0YW5jZTogYW55LCBtZXRob2Q6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gaW5zdGFuY2UgaW5zdGFuY2VvZiBPYmplY3QgJiYgbWV0aG9kIGluIGluc3RhbmNlO1xufVxuXG4vKipcbiAqIENoZWNrIGZ1bmN0aW9uIHR5cGVcbiAqXG4gKiBAcGFyYW0gIHtGdW5jdGlvbn0gZnVuY1xuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gaXNGdW5jdGlvbihmdW5jOiBGdW5jdGlvbik6IGJvb2xlYW4ge1xuICByZXR1cm4gZnVuYyBpbnN0YW5jZW9mIEZ1bmN0aW9uO1xufVxuXG4vKipcbiAqIFJlbW92ZSBzb21lIHRhc2tzIGJ5IHNvbWUgY29uZGl0aW9uc1xuICpcbiAqIEBwYXJhbSAge0Z1bmN0aW9ufSBmdW5jXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleGNsdWRlU3BlY2lmaWNUYXNrcyh0YXNrOiBJVGFzayk6IGJvb2xlYW4ge1xuICBjb25zdCBjb25kaXRpb25zID0gQXJyYXkuaXNBcnJheSh0aGlzKSA/IHRoaXMgOiBbJ2ZyZWV6ZWQnLCAnbG9ja2VkJ107XG4gIGNvbnN0IHJlc3VsdHMgPSBbXTtcblxuICBjb25kaXRpb25zLmZvckVhY2goKGMpID0+IHtcbiAgICByZXN1bHRzLnB1c2goaGFzUHJvcGVydHkodGFzaywgYykgPT09IGZhbHNlIHx8IHRhc2tbY10gPT09IGZhbHNlKTtcbiAgfSk7XG5cbiAgcmV0dXJuICEocmVzdWx0cy5pbmRleE9mKGZhbHNlKSA+IC0xKTtcbn1cblxuLyoqXG4gKiBDbGVhciB0YXNrcyBieSBpdCdzIHRhZ3NcbiAqXG4gKiBAcGFyYW0gIHtJVGFza30gdGFza1xuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gdXRpbENsZWFyQnlUYWcodGFzazogSVRhc2spOiBib29sZWFuIHtcbiAgaWYgKCFleGNsdWRlU3BlY2lmaWNUYXNrcy5jYWxsKFsnbG9ja2VkJ10sIHRhc2spKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0YXNrLnRhZyA9PT0gdGhpcztcbn1cblxuLyoqXG4gKiBTb3J0IGJ5IGZpZm9cbiAqXG4gKiBAcGFyYW0gIHtJVGFza30gYVxuICogQHBhcmFtICB7SVRhc2t9IGJcbiAqIEByZXR1cm4ge0FueX1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gZmlmbyhhOiBJVGFzaywgYjogSVRhc2spOiBhbnkge1xuICByZXR1cm4gYS5jcmVhdGVkQXQgLSBiLmNyZWF0ZWRBdDtcbn1cblxuLyoqXG4gKiBTb3J0IGJ5IGxpZm9cbiAqXG4gKiBAcGFyYW0gIHtJVGFza30gYVxuICogQHBhcmFtICB7SVRhc2t9IGJcbiAqIEByZXR1cm4ge0FueX1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gbGlmbyhhOiBJVGFzaywgYjogSVRhc2spOiBhbnkge1xuICByZXR1cm4gYi5jcmVhdGVkQXQgLSBhLmNyZWF0ZWRBdDtcbn1cbiJdfQ==
