(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = require("core-js/library/fn/array/from");
},{"core-js/library/fn/array/from":19}],2:[function(require,module,exports){
module.exports = require("core-js/library/fn/array/is-array");
},{"core-js/library/fn/array/is-array":20}],3:[function(require,module,exports){
module.exports = require("core-js/library/fn/date/now");
},{"core-js/library/fn/date/now":21}],4:[function(require,module,exports){
module.exports = require("core-js/library/fn/json/stringify");
},{"core-js/library/fn/json/stringify":22}],5:[function(require,module,exports){
module.exports = require("core-js/library/fn/object/define-properties");
},{"core-js/library/fn/object/define-properties":23}],6:[function(require,module,exports){
module.exports = require("core-js/library/fn/object/define-property");
},{"core-js/library/fn/object/define-property":24}],7:[function(require,module,exports){
module.exports = require("core-js/library/fn/object/get-own-property-descriptor");
},{"core-js/library/fn/object/get-own-property-descriptor":25}],8:[function(require,module,exports){
module.exports = require("core-js/library/fn/object/get-own-property-descriptors");
},{"core-js/library/fn/object/get-own-property-descriptors":26}],9:[function(require,module,exports){
module.exports = require("core-js/library/fn/object/get-own-property-symbols");
},{"core-js/library/fn/object/get-own-property-symbols":27}],10:[function(require,module,exports){
module.exports = require("core-js/library/fn/object/keys");
},{"core-js/library/fn/object/keys":28}],11:[function(require,module,exports){
module.exports = require("core-js/library/fn/object/values");
},{"core-js/library/fn/object/values":29}],12:[function(require,module,exports){
module.exports = require("core-js/library/fn/parse-int");
},{"core-js/library/fn/parse-int":30}],13:[function(require,module,exports){
module.exports = require("core-js/library/fn/promise");
},{"core-js/library/fn/promise":31}],14:[function(require,module,exports){
module.exports = require("core-js/library/fn/symbol");
},{"core-js/library/fn/symbol":32}],15:[function(require,module,exports){
module.exports = require("core-js/library/fn/symbol/iterator");
},{"core-js/library/fn/symbol/iterator":33}],16:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

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
  exports.wrap = wrap;

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
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
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
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
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
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
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
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
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

  define(Gp, toStringTagSymbol, "Generator");

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

  exports.keys = function(object) {
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
  exports.values = values;

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

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  typeof module === "object" ? module.exports : {}
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}

},{}],17:[function(require,module,exports){
module.exports = require("regenerator-runtime");

},{"regenerator-runtime":16}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/es6.array.from');
module.exports = require('../../modules/_core').Array.from;

},{"../../modules/_core":41,"../../modules/es6.array.from":113,"../../modules/es6.string.iterator":124}],20:[function(require,module,exports){
require('../../modules/es6.array.is-array');
module.exports = require('../../modules/_core').Array.isArray;

},{"../../modules/_core":41,"../../modules/es6.array.is-array":114}],21:[function(require,module,exports){
require('../../modules/es6.date.now');
module.exports = require('../../modules/_core').Date.now;

},{"../../modules/_core":41,"../../modules/es6.date.now":116}],22:[function(require,module,exports){
var core = require('../../modules/_core');
var $JSON = core.JSON || (core.JSON = { stringify: JSON.stringify });
module.exports = function stringify(it) { // eslint-disable-line no-unused-vars
  return $JSON.stringify.apply($JSON, arguments);
};

},{"../../modules/_core":41}],23:[function(require,module,exports){
require('../../modules/es6.object.define-properties');
var $Object = require('../../modules/_core').Object;
module.exports = function defineProperties(T, D) {
  return $Object.defineProperties(T, D);
};

},{"../../modules/_core":41,"../../modules/es6.object.define-properties":117}],24:[function(require,module,exports){
require('../../modules/es6.object.define-property');
var $Object = require('../../modules/_core').Object;
module.exports = function defineProperty(it, key, desc) {
  return $Object.defineProperty(it, key, desc);
};

},{"../../modules/_core":41,"../../modules/es6.object.define-property":118}],25:[function(require,module,exports){
require('../../modules/es6.object.get-own-property-descriptor');
var $Object = require('../../modules/_core').Object;
module.exports = function getOwnPropertyDescriptor(it, key) {
  return $Object.getOwnPropertyDescriptor(it, key);
};

},{"../../modules/_core":41,"../../modules/es6.object.get-own-property-descriptor":119}],26:[function(require,module,exports){
require('../../modules/es7.object.get-own-property-descriptors');
module.exports = require('../../modules/_core').Object.getOwnPropertyDescriptors;

},{"../../modules/_core":41,"../../modules/es7.object.get-own-property-descriptors":126}],27:[function(require,module,exports){
require('../../modules/es6.symbol');
module.exports = require('../../modules/_core').Object.getOwnPropertySymbols;

},{"../../modules/_core":41,"../../modules/es6.symbol":125}],28:[function(require,module,exports){
require('../../modules/es6.object.keys');
module.exports = require('../../modules/_core').Object.keys;

},{"../../modules/_core":41,"../../modules/es6.object.keys":120}],29:[function(require,module,exports){
require('../../modules/es7.object.values');
module.exports = require('../../modules/_core').Object.values;

},{"../../modules/_core":41,"../../modules/es7.object.values":127}],30:[function(require,module,exports){
require('../modules/es6.parse-int');
module.exports = require('../modules/_core').parseInt;

},{"../modules/_core":41,"../modules/es6.parse-int":122}],31:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.promise');
require('../modules/es7.promise.finally');
require('../modules/es7.promise.try');
module.exports = require('../modules/_core').Promise;

},{"../modules/_core":41,"../modules/es6.object.to-string":121,"../modules/es6.promise":123,"../modules/es6.string.iterator":124,"../modules/es7.promise.finally":128,"../modules/es7.promise.try":129,"../modules/web.dom.iterable":132}],32:[function(require,module,exports){
require('../../modules/es6.symbol');
require('../../modules/es6.object.to-string');
require('../../modules/es7.symbol.async-iterator');
require('../../modules/es7.symbol.observable');
module.exports = require('../../modules/_core').Symbol;

},{"../../modules/_core":41,"../../modules/es6.object.to-string":121,"../../modules/es6.symbol":125,"../../modules/es7.symbol.async-iterator":130,"../../modules/es7.symbol.observable":131}],33:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/web.dom.iterable');
module.exports = require('../../modules/_wks-ext').f('iterator');

},{"../../modules/_wks-ext":110,"../../modules/es6.string.iterator":124,"../../modules/web.dom.iterable":132}],34:[function(require,module,exports){
module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

},{}],35:[function(require,module,exports){
module.exports = function () { /* empty */ };

},{}],36:[function(require,module,exports){
module.exports = function (it, Constructor, name, forbiddenField) {
  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};

},{}],37:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

},{"./_is-object":61}],38:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject');
var toLength = require('./_to-length');
var toAbsoluteIndex = require('./_to-absolute-index');
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

},{"./_to-absolute-index":101,"./_to-iobject":103,"./_to-length":104}],39:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./_cof');
var TAG = require('./_wks')('toStringTag');
// ES3 wrong here
var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};

},{"./_cof":40,"./_wks":111}],40:[function(require,module,exports){
var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};

},{}],41:[function(require,module,exports){
var core = module.exports = { version: '2.6.12' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

},{}],42:[function(require,module,exports){
'use strict';
var $defineProperty = require('./_object-dp');
var createDesc = require('./_property-desc');

module.exports = function (object, index, value) {
  if (index in object) $defineProperty.f(object, index, createDesc(0, value));
  else object[index] = value;
};

},{"./_object-dp":73,"./_property-desc":89}],43:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

},{"./_a-function":34}],44:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

},{}],45:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_fails":50}],46:[function(require,module,exports){
var isObject = require('./_is-object');
var document = require('./_global').document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};

},{"./_global":52,"./_is-object":61}],47:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');

},{}],48:[function(require,module,exports){
// all enumerable object keys, includes symbols
var getKeys = require('./_object-keys');
var gOPS = require('./_object-gops');
var pIE = require('./_object-pie');
module.exports = function (it) {
  var result = getKeys(it);
  var getSymbols = gOPS.f;
  if (getSymbols) {
    var symbols = getSymbols(it);
    var isEnum = pIE.f;
    var i = 0;
    var key;
    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
  } return result;
};

},{"./_object-gops":78,"./_object-keys":81,"./_object-pie":82}],49:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var ctx = require('./_ctx');
var hide = require('./_hide');
var has = require('./_has');
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var IS_WRAP = type & $export.W;
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE];
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE];
  var key, own, out;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if (own && has(exports, key)) continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function (C) {
      var F = function (a, b, c) {
        if (this instanceof C) {
          switch (arguments.length) {
            case 0: return new C();
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if (IS_PROTO) {
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if (type & $export.R && expProto && !expProto[key]) hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;

},{"./_core":41,"./_ctx":43,"./_global":52,"./_has":53,"./_hide":54}],50:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

},{}],51:[function(require,module,exports){
var ctx = require('./_ctx');
var call = require('./_iter-call');
var isArrayIter = require('./_is-array-iter');
var anObject = require('./_an-object');
var toLength = require('./_to-length');
var getIterFn = require('./core.get-iterator-method');
var BREAK = {};
var RETURN = {};
var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
  var iterFn = ITERATOR ? function () { return iterable; } : getIterFn(iterable);
  var f = ctx(fn, that, entries ? 2 : 1);
  var index = 0;
  var length, step, iterator, result;
  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if (result === BREAK || result === RETURN) return result;
  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
    result = call(iterator, f, step.value, entries);
    if (result === BREAK || result === RETURN) return result;
  }
};
exports.BREAK = BREAK;
exports.RETURN = RETURN;

},{"./_an-object":37,"./_ctx":43,"./_is-array-iter":59,"./_iter-call":62,"./_to-length":104,"./core.get-iterator-method":112}],52:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

},{}],53:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};

},{}],54:[function(require,module,exports){
var dP = require('./_object-dp');
var createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

},{"./_descriptors":45,"./_object-dp":73,"./_property-desc":89}],55:[function(require,module,exports){
var document = require('./_global').document;
module.exports = document && document.documentElement;

},{"./_global":52}],56:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function () {
  return Object.defineProperty(require('./_dom-create')('div'), 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_descriptors":45,"./_dom-create":46,"./_fails":50}],57:[function(require,module,exports){
// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function (fn, args, that) {
  var un = that === undefined;
  switch (args.length) {
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return fn.apply(that, args);
};

},{}],58:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};

},{"./_cof":40}],59:[function(require,module,exports){
// check on default Array iterator
var Iterators = require('./_iterators');
var ITERATOR = require('./_wks')('iterator');
var ArrayProto = Array.prototype;

module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};

},{"./_iterators":67,"./_wks":111}],60:[function(require,module,exports){
// 7.2.2 IsArray(argument)
var cof = require('./_cof');
module.exports = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};

},{"./_cof":40}],61:[function(require,module,exports){
module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

},{}],62:[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./_an-object');
module.exports = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) anObject(ret.call(iterator));
    throw e;
  }
};

},{"./_an-object":37}],63:[function(require,module,exports){
'use strict';
var create = require('./_object-create');
var descriptor = require('./_property-desc');
var setToStringTag = require('./_set-to-string-tag');
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};

},{"./_hide":54,"./_object-create":72,"./_property-desc":89,"./_set-to-string-tag":93,"./_wks":111}],64:[function(require,module,exports){
'use strict';
var LIBRARY = require('./_library');
var $export = require('./_export');
var redefine = require('./_redefine');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var $iterCreate = require('./_iter-create');
var setToStringTag = require('./_set-to-string-tag');
var getPrototypeOf = require('./_object-gpo');
var ITERATOR = require('./_wks')('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && typeof IteratorPrototype[ITERATOR] != 'function') hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};

},{"./_export":49,"./_hide":54,"./_iter-create":63,"./_iterators":67,"./_library":68,"./_object-gpo":79,"./_redefine":91,"./_set-to-string-tag":93,"./_wks":111}],65:[function(require,module,exports){
var ITERATOR = require('./_wks')('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function () { SAFE_CLOSING = true; };
  // eslint-disable-next-line no-throw-literal
  Array.from(riter, function () { throw 2; });
} catch (e) { /* empty */ }

module.exports = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7];
    var iter = arr[ITERATOR]();
    iter.next = function () { return { done: safe = true }; };
    arr[ITERATOR] = function () { return iter; };
    exec(arr);
  } catch (e) { /* empty */ }
  return safe;
};

},{"./_wks":111}],66:[function(require,module,exports){
module.exports = function (done, value) {
  return { value: value, done: !!done };
};

},{}],67:[function(require,module,exports){
module.exports = {};

},{}],68:[function(require,module,exports){
module.exports = true;

},{}],69:[function(require,module,exports){
var META = require('./_uid')('meta');
var isObject = require('./_is-object');
var has = require('./_has');
var setDesc = require('./_object-dp').f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
  return true;
};
var FREEZE = !require('./_fails')(function () {
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
  setDesc(it, META, { value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  } });
};
var fastKey = function (it, create) {
  // return primitive with prefix
  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function (it, create) {
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};

},{"./_fails":50,"./_has":53,"./_is-object":61,"./_object-dp":73,"./_uid":107}],70:[function(require,module,exports){
var global = require('./_global');
var macrotask = require('./_task').set;
var Observer = global.MutationObserver || global.WebKitMutationObserver;
var process = global.process;
var Promise = global.Promise;
var isNode = require('./_cof')(process) == 'process';

module.exports = function () {
  var head, last, notify;

  var flush = function () {
    var parent, fn;
    if (isNode && (parent = process.domain)) parent.exit();
    while (head) {
      fn = head.fn;
      head = head.next;
      try {
        fn();
      } catch (e) {
        if (head) notify();
        else last = undefined;
        throw e;
      }
    } last = undefined;
    if (parent) parent.enter();
  };

  // Node.js
  if (isNode) {
    notify = function () {
      process.nextTick(flush);
    };
  // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339
  } else if (Observer && !(global.navigator && global.navigator.standalone)) {
    var toggle = true;
    var node = document.createTextNode('');
    new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
    notify = function () {
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if (Promise && Promise.resolve) {
    // Promise.resolve without an argument throws an error in LG WebOS 2
    var promise = Promise.resolve(undefined);
    notify = function () {
      promise.then(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function () {
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global, flush);
    };
  }

  return function (fn) {
    var task = { fn: fn, next: undefined };
    if (last) last.next = task;
    if (!head) {
      head = task;
      notify();
    } last = task;
  };
};

},{"./_cof":40,"./_global":52,"./_task":100}],71:[function(require,module,exports){
'use strict';
// 25.4.1.5 NewPromiseCapability(C)
var aFunction = require('./_a-function');

function PromiseCapability(C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject = aFunction(reject);
}

module.exports.f = function (C) {
  return new PromiseCapability(C);
};

},{"./_a-function":34}],72:[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = require('./_an-object');
var dPs = require('./_object-dps');
var enumBugKeys = require('./_enum-bug-keys');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = require('./_dom-create')('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};

},{"./_an-object":37,"./_dom-create":46,"./_enum-bug-keys":47,"./_html":55,"./_object-dps":74,"./_shared-key":94}],73:[function(require,module,exports){
var anObject = require('./_an-object');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var toPrimitive = require('./_to-primitive');
var dP = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

},{"./_an-object":37,"./_descriptors":45,"./_ie8-dom-define":56,"./_to-primitive":106}],74:[function(require,module,exports){
var dP = require('./_object-dp');
var anObject = require('./_an-object');
var getKeys = require('./_object-keys');

module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};

},{"./_an-object":37,"./_descriptors":45,"./_object-dp":73,"./_object-keys":81}],75:[function(require,module,exports){
var pIE = require('./_object-pie');
var createDesc = require('./_property-desc');
var toIObject = require('./_to-iobject');
var toPrimitive = require('./_to-primitive');
var has = require('./_has');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var gOPD = Object.getOwnPropertyDescriptor;

exports.f = require('./_descriptors') ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};

},{"./_descriptors":45,"./_has":53,"./_ie8-dom-define":56,"./_object-pie":82,"./_property-desc":89,"./_to-iobject":103,"./_to-primitive":106}],76:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = require('./_to-iobject');
var gOPN = require('./_object-gopn').f;
var toString = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return gOPN(it);
  } catch (e) {
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it) {
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};

},{"./_object-gopn":77,"./_to-iobject":103}],77:[function(require,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys = require('./_object-keys-internal');
var hiddenKeys = require('./_enum-bug-keys').concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};

},{"./_enum-bug-keys":47,"./_object-keys-internal":80}],78:[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;

},{}],79:[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = require('./_has');
var toObject = require('./_to-object');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};

},{"./_has":53,"./_shared-key":94,"./_to-object":105}],80:[function(require,module,exports){
var has = require('./_has');
var toIObject = require('./_to-iobject');
var arrayIndexOf = require('./_array-includes')(false);
var IE_PROTO = require('./_shared-key')('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};

},{"./_array-includes":38,"./_has":53,"./_shared-key":94,"./_to-iobject":103}],81:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = require('./_object-keys-internal');
var enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};

},{"./_enum-bug-keys":47,"./_object-keys-internal":80}],82:[function(require,module,exports){
exports.f = {}.propertyIsEnumerable;

},{}],83:[function(require,module,exports){
// most Object methods by ES6 should accept primitives
var $export = require('./_export');
var core = require('./_core');
var fails = require('./_fails');
module.exports = function (KEY, exec) {
  var fn = (core.Object || {})[KEY] || Object[KEY];
  var exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function () { fn(1); }), 'Object', exp);
};

},{"./_core":41,"./_export":49,"./_fails":50}],84:[function(require,module,exports){
var DESCRIPTORS = require('./_descriptors');
var getKeys = require('./_object-keys');
var toIObject = require('./_to-iobject');
var isEnum = require('./_object-pie').f;
module.exports = function (isEntries) {
  return function (it) {
    var O = toIObject(it);
    var keys = getKeys(O);
    var length = keys.length;
    var i = 0;
    var result = [];
    var key;
    while (length > i) {
      key = keys[i++];
      if (!DESCRIPTORS || isEnum.call(O, key)) {
        result.push(isEntries ? [key, O[key]] : O[key]);
      }
    }
    return result;
  };
};

},{"./_descriptors":45,"./_object-keys":81,"./_object-pie":82,"./_to-iobject":103}],85:[function(require,module,exports){
// all object keys, includes non-enumerable and symbols
var gOPN = require('./_object-gopn');
var gOPS = require('./_object-gops');
var anObject = require('./_an-object');
var Reflect = require('./_global').Reflect;
module.exports = Reflect && Reflect.ownKeys || function ownKeys(it) {
  var keys = gOPN.f(anObject(it));
  var getSymbols = gOPS.f;
  return getSymbols ? keys.concat(getSymbols(it)) : keys;
};

},{"./_an-object":37,"./_global":52,"./_object-gopn":77,"./_object-gops":78}],86:[function(require,module,exports){
var $parseInt = require('./_global').parseInt;
var $trim = require('./_string-trim').trim;
var ws = require('./_string-ws');
var hex = /^[-+]?0[xX]/;

module.exports = $parseInt(ws + '08') !== 8 || $parseInt(ws + '0x16') !== 22 ? function parseInt(str, radix) {
  var string = $trim(String(str), 3);
  return $parseInt(string, (radix >>> 0) || (hex.test(string) ? 16 : 10));
} : $parseInt;

},{"./_global":52,"./_string-trim":98,"./_string-ws":99}],87:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return { e: false, v: exec() };
  } catch (e) {
    return { e: true, v: e };
  }
};

},{}],88:[function(require,module,exports){
var anObject = require('./_an-object');
var isObject = require('./_is-object');
var newPromiseCapability = require('./_new-promise-capability');

module.exports = function (C, x) {
  anObject(C);
  if (isObject(x) && x.constructor === C) return x;
  var promiseCapability = newPromiseCapability.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};

},{"./_an-object":37,"./_is-object":61,"./_new-promise-capability":71}],89:[function(require,module,exports){
module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

},{}],90:[function(require,module,exports){
var hide = require('./_hide');
module.exports = function (target, src, safe) {
  for (var key in src) {
    if (safe && target[key]) target[key] = src[key];
    else hide(target, key, src[key]);
  } return target;
};

},{"./_hide":54}],91:[function(require,module,exports){
module.exports = require('./_hide');

},{"./_hide":54}],92:[function(require,module,exports){
'use strict';
var global = require('./_global');
var core = require('./_core');
var dP = require('./_object-dp');
var DESCRIPTORS = require('./_descriptors');
var SPECIES = require('./_wks')('species');

module.exports = function (KEY) {
  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
    configurable: true,
    get: function () { return this; }
  });
};

},{"./_core":41,"./_descriptors":45,"./_global":52,"./_object-dp":73,"./_wks":111}],93:[function(require,module,exports){
var def = require('./_object-dp').f;
var has = require('./_has');
var TAG = require('./_wks')('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};

},{"./_has":53,"./_object-dp":73,"./_wks":111}],94:[function(require,module,exports){
var shared = require('./_shared')('keys');
var uid = require('./_uid');
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};

},{"./_shared":95,"./_uid":107}],95:[function(require,module,exports){
var core = require('./_core');
var global = require('./_global');
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: core.version,
  mode: require('./_library') ? 'pure' : 'global',
  copyright: '© 2020 Denis Pushkarev (zloirock.ru)'
});

},{"./_core":41,"./_global":52,"./_library":68}],96:[function(require,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject = require('./_an-object');
var aFunction = require('./_a-function');
var SPECIES = require('./_wks')('species');
module.exports = function (O, D) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};

},{"./_a-function":34,"./_an-object":37,"./_wks":111}],97:[function(require,module,exports){
var toInteger = require('./_to-integer');
var defined = require('./_defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var s = String(defined(that));
    var i = toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};

},{"./_defined":44,"./_to-integer":102}],98:[function(require,module,exports){
var $export = require('./_export');
var defined = require('./_defined');
var fails = require('./_fails');
var spaces = require('./_string-ws');
var space = '[' + spaces + ']';
var non = '\u200b\u0085';
var ltrim = RegExp('^' + space + space + '*');
var rtrim = RegExp(space + space + '*$');

var exporter = function (KEY, exec, ALIAS) {
  var exp = {};
  var FORCE = fails(function () {
    return !!spaces[KEY]() || non[KEY]() != non;
  });
  var fn = exp[KEY] = FORCE ? exec(trim) : spaces[KEY];
  if (ALIAS) exp[ALIAS] = fn;
  $export($export.P + $export.F * FORCE, 'String', exp);
};

// 1 -> String#trimLeft
// 2 -> String#trimRight
// 3 -> String#trim
var trim = exporter.trim = function (string, TYPE) {
  string = String(defined(string));
  if (TYPE & 1) string = string.replace(ltrim, '');
  if (TYPE & 2) string = string.replace(rtrim, '');
  return string;
};

module.exports = exporter;

},{"./_defined":44,"./_export":49,"./_fails":50,"./_string-ws":99}],99:[function(require,module,exports){
module.exports = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
  '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

},{}],100:[function(require,module,exports){
var ctx = require('./_ctx');
var invoke = require('./_invoke');
var html = require('./_html');
var cel = require('./_dom-create');
var global = require('./_global');
var process = global.process;
var setTask = global.setImmediate;
var clearTask = global.clearImmediate;
var MessageChannel = global.MessageChannel;
var Dispatch = global.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var defer, channel, port;
var run = function () {
  var id = +this;
  // eslint-disable-next-line no-prototype-builtins
  if (queue.hasOwnProperty(id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function (event) {
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!setTask || !clearTask) {
  setTask = function setImmediate(fn) {
    var args = [];
    var i = 1;
    while (arguments.length > i) args.push(arguments[i++]);
    queue[++counter] = function () {
      // eslint-disable-next-line no-new-func
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (require('./_cof')(process) == 'process') {
    defer = function (id) {
      process.nextTick(ctx(run, id, 1));
    };
  // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if (MessageChannel) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts) {
    defer = function (id) {
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listener, false);
  // IE8-
  } else if (ONREADYSTATECHANGE in cel('script')) {
    defer = function (id) {
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function () {
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function (id) {
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set: setTask,
  clear: clearTask
};

},{"./_cof":40,"./_ctx":43,"./_dom-create":46,"./_global":52,"./_html":55,"./_invoke":57}],101:[function(require,module,exports){
var toInteger = require('./_to-integer');
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};

},{"./_to-integer":102}],102:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

},{}],103:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject');
var defined = require('./_defined');
module.exports = function (it) {
  return IObject(defined(it));
};

},{"./_defined":44,"./_iobject":58}],104:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer');
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

},{"./_to-integer":102}],105:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function (it) {
  return Object(defined(it));
};

},{"./_defined":44}],106:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

},{"./_is-object":61}],107:[function(require,module,exports){
var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

},{}],108:[function(require,module,exports){
var global = require('./_global');
var navigator = global.navigator;

module.exports = navigator && navigator.userAgent || '';

},{"./_global":52}],109:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var LIBRARY = require('./_library');
var wksExt = require('./_wks-ext');
var defineProperty = require('./_object-dp').f;
module.exports = function (name) {
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
};

},{"./_core":41,"./_global":52,"./_library":68,"./_object-dp":73,"./_wks-ext":110}],110:[function(require,module,exports){
exports.f = require('./_wks');

},{"./_wks":111}],111:[function(require,module,exports){
var store = require('./_shared')('wks');
var uid = require('./_uid');
var Symbol = require('./_global').Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;

},{"./_global":52,"./_shared":95,"./_uid":107}],112:[function(require,module,exports){
var classof = require('./_classof');
var ITERATOR = require('./_wks')('iterator');
var Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};

},{"./_classof":39,"./_core":41,"./_iterators":67,"./_wks":111}],113:[function(require,module,exports){
'use strict';
var ctx = require('./_ctx');
var $export = require('./_export');
var toObject = require('./_to-object');
var call = require('./_iter-call');
var isArrayIter = require('./_is-array-iter');
var toLength = require('./_to-length');
var createProperty = require('./_create-property');
var getIterFn = require('./core.get-iterator-method');

$export($export.S + $export.F * !require('./_iter-detect')(function (iter) { Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
    var O = toObject(arrayLike);
    var C = typeof this == 'function' ? this : Array;
    var aLen = arguments.length;
    var mapfn = aLen > 1 ? arguments[1] : undefined;
    var mapping = mapfn !== undefined;
    var index = 0;
    var iterFn = getIterFn(O);
    var length, result, step, iterator;
    if (mapping) mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if (iterFn != undefined && !(C == Array && isArrayIter(iterFn))) {
      for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = toLength(O.length);
      for (result = new C(length); length > index; index++) {
        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});

},{"./_create-property":42,"./_ctx":43,"./_export":49,"./_is-array-iter":59,"./_iter-call":62,"./_iter-detect":65,"./_to-length":104,"./_to-object":105,"./core.get-iterator-method":112}],114:[function(require,module,exports){
// 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
var $export = require('./_export');

$export($export.S, 'Array', { isArray: require('./_is-array') });

},{"./_export":49,"./_is-array":60}],115:[function(require,module,exports){
'use strict';
var addToUnscopables = require('./_add-to-unscopables');
var step = require('./_iter-step');
var Iterators = require('./_iterators');
var toIObject = require('./_to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./_iter-define')(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');

},{"./_add-to-unscopables":35,"./_iter-define":64,"./_iter-step":66,"./_iterators":67,"./_to-iobject":103}],116:[function(require,module,exports){
// 20.3.3.1 / 15.9.4.4 Date.now()
var $export = require('./_export');

$export($export.S, 'Date', { now: function () { return new Date().getTime(); } });

},{"./_export":49}],117:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
$export($export.S + $export.F * !require('./_descriptors'), 'Object', { defineProperties: require('./_object-dps') });

},{"./_descriptors":45,"./_export":49,"./_object-dps":74}],118:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !require('./_descriptors'), 'Object', { defineProperty: require('./_object-dp').f });

},{"./_descriptors":45,"./_export":49,"./_object-dp":73}],119:[function(require,module,exports){
// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
var toIObject = require('./_to-iobject');
var $getOwnPropertyDescriptor = require('./_object-gopd').f;

require('./_object-sap')('getOwnPropertyDescriptor', function () {
  return function getOwnPropertyDescriptor(it, key) {
    return $getOwnPropertyDescriptor(toIObject(it), key);
  };
});

},{"./_object-gopd":75,"./_object-sap":83,"./_to-iobject":103}],120:[function(require,module,exports){
// 19.1.2.14 Object.keys(O)
var toObject = require('./_to-object');
var $keys = require('./_object-keys');

require('./_object-sap')('keys', function () {
  return function keys(it) {
    return $keys(toObject(it));
  };
});

},{"./_object-keys":81,"./_object-sap":83,"./_to-object":105}],121:[function(require,module,exports){

},{}],122:[function(require,module,exports){
var $export = require('./_export');
var $parseInt = require('./_parse-int');
// 18.2.5 parseInt(string, radix)
$export($export.G + $export.F * (parseInt != $parseInt), { parseInt: $parseInt });

},{"./_export":49,"./_parse-int":86}],123:[function(require,module,exports){
'use strict';
var LIBRARY = require('./_library');
var global = require('./_global');
var ctx = require('./_ctx');
var classof = require('./_classof');
var $export = require('./_export');
var isObject = require('./_is-object');
var aFunction = require('./_a-function');
var anInstance = require('./_an-instance');
var forOf = require('./_for-of');
var speciesConstructor = require('./_species-constructor');
var task = require('./_task').set;
var microtask = require('./_microtask')();
var newPromiseCapabilityModule = require('./_new-promise-capability');
var perform = require('./_perform');
var userAgent = require('./_user-agent');
var promiseResolve = require('./_promise-resolve');
var PROMISE = 'Promise';
var TypeError = global.TypeError;
var process = global.process;
var versions = process && process.versions;
var v8 = versions && versions.v8 || '';
var $Promise = global[PROMISE];
var isNode = classof(process) == 'process';
var empty = function () { /* empty */ };
var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
var newPromiseCapability = newGenericPromiseCapability = newPromiseCapabilityModule.f;

var USE_NATIVE = !!function () {
  try {
    // correct subclassing with @@species support
    var promise = $Promise.resolve(1);
    var FakePromise = (promise.constructor = {})[require('./_wks')('species')] = function (exec) {
      exec(empty, empty);
    };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function')
      && promise.then(empty) instanceof FakePromise
      // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
      // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
      // we can't detect it synchronously, so just check versions
      && v8.indexOf('6.6') !== 0
      && userAgent.indexOf('Chrome/66') === -1;
  } catch (e) { /* empty */ }
}();

// helpers
var isThenable = function (it) {
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var notify = function (promise, isReject) {
  if (promise._n) return;
  promise._n = true;
  var chain = promise._c;
  microtask(function () {
    var value = promise._v;
    var ok = promise._s == 1;
    var i = 0;
    var run = function (reaction) {
      var handler = ok ? reaction.ok : reaction.fail;
      var resolve = reaction.resolve;
      var reject = reaction.reject;
      var domain = reaction.domain;
      var result, then, exited;
      try {
        if (handler) {
          if (!ok) {
            if (promise._h == 2) onHandleUnhandled(promise);
            promise._h = 1;
          }
          if (handler === true) result = value;
          else {
            if (domain) domain.enter();
            result = handler(value); // may throw
            if (domain) {
              domain.exit();
              exited = true;
            }
          }
          if (result === reaction.promise) {
            reject(TypeError('Promise-chain cycle'));
          } else if (then = isThenable(result)) {
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch (e) {
        if (domain && !exited) domain.exit();
        reject(e);
      }
    };
    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
    promise._c = [];
    promise._n = false;
    if (isReject && !promise._h) onUnhandled(promise);
  });
};
var onUnhandled = function (promise) {
  task.call(global, function () {
    var value = promise._v;
    var unhandled = isUnhandled(promise);
    var result, handler, console;
    if (unhandled) {
      result = perform(function () {
        if (isNode) {
          process.emit('unhandledRejection', value, promise);
        } else if (handler = global.onunhandledrejection) {
          handler({ promise: promise, reason: value });
        } else if ((console = global.console) && console.error) {
          console.error('Unhandled promise rejection', value);
        }
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if (unhandled && result.e) throw result.v;
  });
};
var isUnhandled = function (promise) {
  return promise._h !== 1 && (promise._a || promise._c).length === 0;
};
var onHandleUnhandled = function (promise) {
  task.call(global, function () {
    var handler;
    if (isNode) {
      process.emit('rejectionHandled', promise);
    } else if (handler = global.onrejectionhandled) {
      handler({ promise: promise, reason: promise._v });
    }
  });
};
var $reject = function (value) {
  var promise = this;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  promise._v = value;
  promise._s = 2;
  if (!promise._a) promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function (value) {
  var promise = this;
  var then;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  try {
    if (promise === value) throw TypeError("Promise can't be resolved itself");
    if (then = isThenable(value)) {
      microtask(function () {
        var wrapper = { _w: promise, _d: false }; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch (e) {
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch (e) {
    $reject.call({ _w: promise, _d: false }, e); // wrap
  }
};

// constructor polyfill
if (!USE_NATIVE) {
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor) {
    anInstance(this, $Promise, PROMISE, '_h');
    aFunction(executor);
    Internal.call(this);
    try {
      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
    } catch (err) {
      $reject.call(this, err);
    }
  };
  // eslint-disable-next-line no-unused-vars
  Internal = function Promise(executor) {
    this._c = [];             // <- awaiting reactions
    this._a = undefined;      // <- checked in isUnhandled reactions
    this._s = 0;              // <- state
    this._d = false;          // <- done
    this._v = undefined;      // <- value
    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
    this._n = false;          // <- notify
  };
  Internal.prototype = require('./_redefine-all')($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected) {
      var reaction = newPromiseCapability(speciesConstructor(this, $Promise));
      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode ? process.domain : undefined;
      this._c.push(reaction);
      if (this._a) this._a.push(reaction);
      if (this._s) notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function (onRejected) {
      return this.then(undefined, onRejected);
    }
  });
  OwnPromiseCapability = function () {
    var promise = new Internal();
    this.promise = promise;
    this.resolve = ctx($resolve, promise, 1);
    this.reject = ctx($reject, promise, 1);
  };
  newPromiseCapabilityModule.f = newPromiseCapability = function (C) {
    return C === $Promise || C === Wrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Promise: $Promise });
require('./_set-to-string-tag')($Promise, PROMISE);
require('./_set-species')(PROMISE);
Wrapper = require('./_core')[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r) {
    var capability = newPromiseCapability(this);
    var $$reject = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x) {
    return promiseResolve(LIBRARY && this === Wrapper ? $Promise : this, x);
  }
});
$export($export.S + $export.F * !(USE_NATIVE && require('./_iter-detect')(function (iter) {
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var values = [];
      var index = 0;
      var remaining = 1;
      forOf(iterable, false, function (promise) {
        var $index = index++;
        var alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.e) reject(result.v);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var reject = capability.reject;
    var result = perform(function () {
      forOf(iterable, false, function (promise) {
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if (result.e) reject(result.v);
    return capability.promise;
  }
});

},{"./_a-function":34,"./_an-instance":36,"./_classof":39,"./_core":41,"./_ctx":43,"./_export":49,"./_for-of":51,"./_global":52,"./_is-object":61,"./_iter-detect":65,"./_library":68,"./_microtask":70,"./_new-promise-capability":71,"./_perform":87,"./_promise-resolve":88,"./_redefine-all":90,"./_set-species":92,"./_set-to-string-tag":93,"./_species-constructor":96,"./_task":100,"./_user-agent":108,"./_wks":111}],124:[function(require,module,exports){
'use strict';
var $at = require('./_string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./_iter-define')(String, 'String', function (iterated) {
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});

},{"./_iter-define":64,"./_string-at":97}],125:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var global = require('./_global');
var has = require('./_has');
var DESCRIPTORS = require('./_descriptors');
var $export = require('./_export');
var redefine = require('./_redefine');
var META = require('./_meta').KEY;
var $fails = require('./_fails');
var shared = require('./_shared');
var setToStringTag = require('./_set-to-string-tag');
var uid = require('./_uid');
var wks = require('./_wks');
var wksExt = require('./_wks-ext');
var wksDefine = require('./_wks-define');
var enumKeys = require('./_enum-keys');
var isArray = require('./_is-array');
var anObject = require('./_an-object');
var isObject = require('./_is-object');
var toObject = require('./_to-object');
var toIObject = require('./_to-iobject');
var toPrimitive = require('./_to-primitive');
var createDesc = require('./_property-desc');
var _create = require('./_object-create');
var gOPNExt = require('./_object-gopn-ext');
var $GOPD = require('./_object-gopd');
var $GOPS = require('./_object-gops');
var $DP = require('./_object-dp');
var $keys = require('./_object-keys');
var gOPD = $GOPD.f;
var dP = $DP.f;
var gOPN = gOPNExt.f;
var $Symbol = global.Symbol;
var $JSON = global.JSON;
var _stringify = $JSON && $JSON.stringify;
var PROTOTYPE = 'prototype';
var HIDDEN = wks('_hidden');
var TO_PRIMITIVE = wks('toPrimitive');
var isEnum = {}.propertyIsEnumerable;
var SymbolRegistry = shared('symbol-registry');
var AllSymbols = shared('symbols');
var OPSymbols = shared('op-symbols');
var ObjectProto = Object[PROTOTYPE];
var USE_NATIVE = typeof $Symbol == 'function' && !!$GOPS.f;
var QObject = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function () {
  return _create(dP({}, 'a', {
    get: function () { return dP(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (it, key, D) {
  var protoDesc = gOPD(ObjectProto, key);
  if (protoDesc) delete ObjectProto[key];
  dP(it, key, D);
  if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function (tag) {
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D) {
  if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if (has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = _create(D, { enumerable: createDesc(0, false) });
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P) {
  anObject(it);
  var keys = enumKeys(P = toIObject(P));
  var i = 0;
  var l = keys.length;
  var key;
  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P) {
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  it = toIObject(it);
  key = toPrimitive(key, true);
  if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
  var D = gOPD(it, key);
  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = gOPN(toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var IS_OP = it === ObjectProto;
  var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if (!USE_NATIVE) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function (value) {
      if (this === ObjectProto) $set.call(OPSymbols, value);
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f = $defineProperty;
  require('./_object-gopn').f = gOPNExt.f = $getOwnPropertyNames;
  require('./_object-pie').f = $propertyIsEnumerable;
  $GOPS.f = $getOwnPropertySymbols;

  if (DESCRIPTORS && !require('./_library')) {
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function (name) {
    return wrap(wks(name));
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });

for (var es6Symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), j = 0; es6Symbols.length > j;)wks(es6Symbols[j++]);

for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function (key) {
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
  },
  useSetter: function () { setter = true; },
  useSimple: function () { setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
// https://bugs.chromium.org/p/v8/issues/detail?id=3443
var FAILS_ON_PRIMITIVES = $fails(function () { $GOPS.f(1); });

$export($export.S + $export.F * FAILS_ON_PRIMITIVES, 'Object', {
  getOwnPropertySymbols: function getOwnPropertySymbols(it) {
    return $GOPS.f(toObject(it));
  }
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it) {
    var args = [it];
    var i = 1;
    var replacer, $replacer;
    while (arguments.length > i) args.push(arguments[i++]);
    $replacer = replacer = args[1];
    if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
    if (!isArray(replacer)) replacer = function (key, value) {
      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
      if (!isSymbol(value)) return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || require('./_hide')($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);

},{"./_an-object":37,"./_descriptors":45,"./_enum-keys":48,"./_export":49,"./_fails":50,"./_global":52,"./_has":53,"./_hide":54,"./_is-array":60,"./_is-object":61,"./_library":68,"./_meta":69,"./_object-create":72,"./_object-dp":73,"./_object-gopd":75,"./_object-gopn":77,"./_object-gopn-ext":76,"./_object-gops":78,"./_object-keys":81,"./_object-pie":82,"./_property-desc":89,"./_redefine":91,"./_set-to-string-tag":93,"./_shared":95,"./_to-iobject":103,"./_to-object":105,"./_to-primitive":106,"./_uid":107,"./_wks":111,"./_wks-define":109,"./_wks-ext":110}],126:[function(require,module,exports){
// https://github.com/tc39/proposal-object-getownpropertydescriptors
var $export = require('./_export');
var ownKeys = require('./_own-keys');
var toIObject = require('./_to-iobject');
var gOPD = require('./_object-gopd');
var createProperty = require('./_create-property');

$export($export.S, 'Object', {
  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
    var O = toIObject(object);
    var getDesc = gOPD.f;
    var keys = ownKeys(O);
    var result = {};
    var i = 0;
    var key, desc;
    while (keys.length > i) {
      desc = getDesc(O, key = keys[i++]);
      if (desc !== undefined) createProperty(result, key, desc);
    }
    return result;
  }
});

},{"./_create-property":42,"./_export":49,"./_object-gopd":75,"./_own-keys":85,"./_to-iobject":103}],127:[function(require,module,exports){
// https://github.com/tc39/proposal-object-values-entries
var $export = require('./_export');
var $values = require('./_object-to-array')(false);

$export($export.S, 'Object', {
  values: function values(it) {
    return $values(it);
  }
});

},{"./_export":49,"./_object-to-array":84}],128:[function(require,module,exports){
// https://github.com/tc39/proposal-promise-finally
'use strict';
var $export = require('./_export');
var core = require('./_core');
var global = require('./_global');
var speciesConstructor = require('./_species-constructor');
var promiseResolve = require('./_promise-resolve');

$export($export.P + $export.R, 'Promise', { 'finally': function (onFinally) {
  var C = speciesConstructor(this, core.Promise || global.Promise);
  var isFunction = typeof onFinally == 'function';
  return this.then(
    isFunction ? function (x) {
      return promiseResolve(C, onFinally()).then(function () { return x; });
    } : onFinally,
    isFunction ? function (e) {
      return promiseResolve(C, onFinally()).then(function () { throw e; });
    } : onFinally
  );
} });

},{"./_core":41,"./_export":49,"./_global":52,"./_promise-resolve":88,"./_species-constructor":96}],129:[function(require,module,exports){
'use strict';
// https://github.com/tc39/proposal-promise-try
var $export = require('./_export');
var newPromiseCapability = require('./_new-promise-capability');
var perform = require('./_perform');

$export($export.S, 'Promise', { 'try': function (callbackfn) {
  var promiseCapability = newPromiseCapability.f(this);
  var result = perform(callbackfn);
  (result.e ? promiseCapability.reject : promiseCapability.resolve)(result.v);
  return promiseCapability.promise;
} });

},{"./_export":49,"./_new-promise-capability":71,"./_perform":87}],130:[function(require,module,exports){
require('./_wks-define')('asyncIterator');

},{"./_wks-define":109}],131:[function(require,module,exports){
require('./_wks-define')('observable');

},{"./_wks-define":109}],132:[function(require,module,exports){
require('./es6.array.iterator');
var global = require('./_global');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var TO_STRING_TAG = require('./_wks')('toStringTag');

var DOMIterables = ('CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,' +
  'DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,' +
  'MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,' +
  'SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,' +
  'TextTrackList,TouchList').split(',');

for (var i = 0; i < DOMIterables.length; i++) {
  var NAME = DOMIterables[i];
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  if (proto && !proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = Iterators.Array;
}

},{"./_global":52,"./_hide":54,"./_iterators":67,"./_wks":111,"./es6.array.iterator":115}],133:[function(require,module,exports){

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
},{"to-function":137}],134:[function(require,module,exports){
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

    var hasShallowProperty
    if (options.includeInheritedProps) {
      hasShallowProperty = function () {
        return true
      }
    } else {
      hasShallowProperty = function (obj, prop) {
        return (typeof prop === 'number' && Array.isArray(obj)) || hasOwnProperty(obj, prop)
      }
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
      if (options.includeInheritedProps && (currentPath === '__proto__' ||
        (currentPath === 'constructor' && typeof currentValue === 'function'))) {
        throw new Error('For security reasons, object\'s magic properties cannot be set')
      }
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

},{}],135:[function(require,module,exports){
(function (global){(function (){
'use strict';

function doEval(self, __pseudoworker_script) {
  /* jshint unused:false */
  (function () {
    /* jshint evil:true */
    eval(__pseudoworker_script);
  }).call(global);
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
    return function (listener) {
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

  function runPostMessage(msg, transfer) {
    function callFun(listener) {
      try {
        listener({data: msg, ports: transfer});
      } catch (err) {
        postError(err);
      }
    }
    if (workerSelf && typeof workerSelf.onmessage === 'function') {
      callFun(workerSelf.onmessage);
    }
    executeEach(workerMessageListeners, callFun);
  }

  function postMessage(msg, transfer) {
    if (typeof msg === 'undefined') {
      throw new Error('postMessage() requires an argument');
    }
    if (terminated) {
      return;
    }
    if (!script) {
      postMessageListeners.push({msg: msg, transfer: (transfer ? transfer : undefined)});
      return;
    }
    runPostMessage(msg, transfer);
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
  xhr.onreadystatechange = function () {
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
          runPostMessage(currentListeners[i].msg, currentListeners[i].transfer);
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

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],136:[function(require,module,exports){
(function (global){(function (){
'use strict';

var PseudoWorker = require('./');

if (typeof Worker === 'undefined') {
  global.Worker = PseudoWorker;
}

module.exports = PseudoWorker;
}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./":135}],137:[function(require,module,exports){

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

},{"component-props":18,"props":18}],138:[function(require,module,exports){
"use strict";var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");_Object$defineProperty(exports, "__esModule", { value: true });_Object$defineProperty(exports, "InMemoryAdapter", { enumerable: true, get: function get() {return _inmemory["default"];} });_Object$defineProperty(exports, "LocalStorageAdapter", { enumerable: true, get: function get() {return _localstorage["default"];} });var _inmemory = _interopRequireDefault(require("./inmemory"));
var _localstorage = _interopRequireDefault(require("./localstorage"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { "default": obj };}

},{"./inmemory":139,"./localstorage":140,"@babel/runtime-corejs2/core-js/object/define-property":6}],139:[function(require,module,exports){
"use strict";var _Object$defineProperty2 = require("@babel/runtime-corejs2/core-js/object/define-property");var _Promise = require("@babel/runtime-corejs2/core-js/promise");var _Array$isArray = require("@babel/runtime-corejs2/core-js/array/is-array");var _Symbol = require("@babel/runtime-corejs2/core-js/symbol");var _Symbol$iterator = require("@babel/runtime-corejs2/core-js/symbol/iterator");var _Array$from = require("@babel/runtime-corejs2/core-js/array/from");var _Object$keys = require("@babel/runtime-corejs2/core-js/object/keys");var _Object$getOwnPropertySymbols = require("@babel/runtime-corejs2/core-js/object/get-own-property-symbols");var _Object$getOwnPropertyDescriptor = require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptor");var _Object$getOwnPropertyDescriptors = require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptors");var _Object$defineProperties = require("@babel/runtime-corejs2/core-js/object/define-properties");_Object$defineProperty2(exports, "__esModule", { value: true });exports["default"] = void 0;var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs2/regenerator"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { "default": obj };}function ownKeys(object, enumerableOnly) {var keys = _Object$keys(object);if (_Object$getOwnPropertySymbols) {var symbols = _Object$getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return _Object$getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (_Object$getOwnPropertyDescriptors) {_Object$defineProperties(target, _Object$getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {_Object$defineProperty2(target, key, _Object$getOwnPropertyDescriptor(source, key));});}}return target;}function _toConsumableArray(arr) {return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();}function _nonIterableSpread() {throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return _Array$from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _iterableToArray(iter) {if (typeof _Symbol !== "undefined" && iter[_Symbol$iterator] != null || iter["@@iterator"] != null) return _Array$from(iter);}function _arrayWithoutHoles(arr) {if (_Array$isArray(arr)) return _arrayLikeToArray(arr);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {arr2[i] = arr[i];}return arr2;}function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {_Promise.resolve(value).then(_next, _throw);}}function _asyncToGenerator(fn) {return function () {var self = this,args = arguments;return new _Promise(function (resolve, reject) {var gen = fn.apply(self, args);function _next(value) {asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);}function _throw(err) {asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);}_next(undefined);});};}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;_Object$defineProperty2(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _defineProperty(obj, key, value) {if (key in obj) {(0, _defineProperty2["default"])(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}var




InMemoryAdapter = /*#__PURE__*/function () {






  function InMemoryAdapter(config) {_classCallCheck(this, InMemoryAdapter);_defineProperty(this, "config", void 0);_defineProperty(this, "prefix", void 0);_defineProperty(this, "store", {});
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
   */_createClass(InMemoryAdapter, [{ key: "get", value: function () {var _get = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(
      function _callee(name) {var collName;return _regenerator["default"].wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:
                collName = this.storageName(name);return _context.abrupt("return", _toConsumableArray(
                this.getCollection(collName)));case 2:case "end":return _context.stop();}}}, _callee, this);}));function get(_x) {return _get.apply(this, arguments);}return get;}()


    /**
     * Add item to store
     *
     * @param  {String} key
     * @param  {String} value
     * @return {Promise<Any>}
     *
     * @api public
     */ }, { key: "set", value: function () {var _set = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(
      function _callee2(key, value) {return _regenerator["default"].wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:
                this.store[this.storageName(key)] = _toConsumableArray(value);return _context2.abrupt("return",
                value);case 2:case "end":return _context2.stop();}}}, _callee2, this);}));function set(_x2, _x3) {return _set.apply(this, arguments);}return set;}()


    /**
     * Item checker in store
     *
     * @param  {String} key
     * @return {Promise<Boolean>}
     *
     * @api public
     */ }, { key: "has", value: function () {var _has = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(
      function _callee3(key) {return _regenerator["default"].wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:return _context3.abrupt("return",
                Object.prototype.hasOwnProperty.call(this.store, this.storageName(key)));case 1:case "end":return _context3.stop();}}}, _callee3, this);}));function has(_x4) {return _has.apply(this, arguments);}return has;}()


    /**
     * Remove item
     *
     * @param  {String} key
     * @return {Promise<Any>}
     *
     * @api public
     */ }, { key: "clear", value: function () {var _clear = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(
      function _callee4(key) {var result;return _regenerator["default"].wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:_context4.next = 2;return (
                  this.has(key));case 2:if (!_context4.sent) {_context4.next = 6;break;}_context4.t0 = delete this.store[this.storageName(key)];_context4.next = 7;break;case 6:_context4.t0 = false;case 7:result = _context4.t0;
                this.store = _objectSpread({}, this.store);return _context4.abrupt("return",
                result);case 10:case "end":return _context4.stop();}}}, _callee4, this);}));function clear(_x5) {return _clear.apply(this, arguments);}return clear;}()


    /**
     * Compose collection name by suffix
     *
     * @param  {String} suffix
     * @return {String}
     *
     * @api public
     */ }, { key: "storageName", value:
    function storageName(suffix) {
      return suffix.startsWith(this.getPrefix()) ? suffix : "".concat(this.getPrefix(), "_").concat(suffix);
    }

    /**
     * Get prefix of channel collection
     *
     * @return {String}
     *
     * @api public
     */ }, { key: "getPrefix", value:
    function getPrefix() {
      return this.config.get('prefix');
    }

    /**
     * Get collection
     *
     * @param  {String} name
     * @return {String}
     *
     * @api private
     */ }, { key: "getCollection", value:
    function getCollection(name) {
      var has = Object.prototype.hasOwnProperty.call(this.store, name);
      if (!has) this.store[name] = [];
      return this.store[name];
    } }]);return InMemoryAdapter;}();exports["default"] = InMemoryAdapter;

},{"@babel/runtime-corejs2/core-js/array/from":1,"@babel/runtime-corejs2/core-js/array/is-array":2,"@babel/runtime-corejs2/core-js/object/define-properties":5,"@babel/runtime-corejs2/core-js/object/define-property":6,"@babel/runtime-corejs2/core-js/object/get-own-property-descriptor":7,"@babel/runtime-corejs2/core-js/object/get-own-property-descriptors":8,"@babel/runtime-corejs2/core-js/object/get-own-property-symbols":9,"@babel/runtime-corejs2/core-js/object/keys":10,"@babel/runtime-corejs2/core-js/promise":13,"@babel/runtime-corejs2/core-js/symbol":14,"@babel/runtime-corejs2/core-js/symbol/iterator":15,"@babel/runtime-corejs2/regenerator":17}],140:[function(require,module,exports){
"use strict";var _Object$defineProperty2 = require("@babel/runtime-corejs2/core-js/object/define-property");var _Promise = require("@babel/runtime-corejs2/core-js/promise");_Object$defineProperty2(exports, "__esModule", { value: true });exports["default"] = void 0;var _stringify = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/json/stringify"));var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs2/regenerator"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { "default": obj };}function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {_Promise.resolve(value).then(_next, _throw);}}function _asyncToGenerator(fn) {return function () {var self = this,args = arguments;return new _Promise(function (resolve, reject) {var gen = fn.apply(self, args);function _next(value) {asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);}function _throw(err) {asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);}_next(undefined);});};}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;_Object$defineProperty2(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _defineProperty(obj, key, value) {if (key in obj) {(0, _defineProperty2["default"])(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}




/* global localStorage */var

LocalStorageAdapter = /*#__PURE__*/function () {




  function LocalStorageAdapter(config) {_classCallCheck(this, LocalStorageAdapter);_defineProperty(this, "config", void 0);_defineProperty(this, "prefix", void 0);
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
   */_createClass(LocalStorageAdapter, [{ key: "get", value: function () {var _get = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(
      function _callee(name) {var result;return _regenerator["default"].wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:
                result = localStorage.getItem(this.storageName(name));return _context.abrupt("return",
                JSON.parse(result) || []);case 2:case "end":return _context.stop();}}}, _callee, this);}));function get(_x) {return _get.apply(this, arguments);}return get;}()


    /**
     * Add item to local storage
     *
     * @param  {String} key
     * @param  {String} value
     * @return {Promise<Any>}
     *
     * @api public
     */ }, { key: "set", value: function () {var _set = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(
      function _callee2(key, value) {return _regenerator["default"].wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:
                localStorage.setItem(this.storageName(key), (0, _stringify["default"])(value));return _context2.abrupt("return",
                value);case 2:case "end":return _context2.stop();}}}, _callee2, this);}));function set(_x2, _x3) {return _set.apply(this, arguments);}return set;}()


    /**
     * Item checker in local storage
     *
     * @param  {String} key
     * @return {Promise<Boolean>}
     *
     * @api public
     */ }, { key: "has", value: function () {var _has = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(
      function _callee3(key) {return _regenerator["default"].wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:return _context3.abrupt("return",
                Object.prototype.hasOwnProperty.call(localStorage, this.storageName(key)));case 1:case "end":return _context3.stop();}}}, _callee3, this);}));function has(_x4) {return _has.apply(this, arguments);}return has;}()


    /**
     * Remove item
     *
     * @param  {String} key
     * @return {Promise<Any>}
     *
     * @api public
     */ }, { key: "clear", value: function () {var _clear = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(
      function _callee4(key) {var result;return _regenerator["default"].wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:_context4.next = 2;return (
                  this.has(key));case 2:if (!_context4.sent) {_context4.next = 6;break;}_context4.t0 = delete localStorage[this.storageName(key)];_context4.next = 7;break;case 6:_context4.t0 = false;case 7:result = _context4.t0;return _context4.abrupt("return",
                result);case 9:case "end":return _context4.stop();}}}, _callee4, this);}));function clear(_x5) {return _clear.apply(this, arguments);}return clear;}()


    /**
     * Compose collection name by suffix
     *
     * @param  {String} suffix
     * @return {String}
     *
     * @api public
     */ }, { key: "storageName", value:
    function storageName(suffix) {
      return suffix.startsWith(this.getPrefix()) ? suffix : "".concat(this.getPrefix(), "_").concat(suffix);
    }

    /**
     * Get prefix of channel collection
     *
     * @return {String}
     *
     * @api public
     */ }, { key: "getPrefix", value:
    function getPrefix() {
      return this.config.get('prefix');
    } }]);return LocalStorageAdapter;}();exports["default"] = LocalStorageAdapter;

},{"@babel/runtime-corejs2/core-js/json/stringify":4,"@babel/runtime-corejs2/core-js/object/define-property":6,"@babel/runtime-corejs2/core-js/promise":13,"@babel/runtime-corejs2/regenerator":17}],141:[function(require,module,exports){
"use strict";var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");var _Promise2 = require("@babel/runtime-corejs2/core-js/promise");_Object$defineProperty(exports, "__esModule", { value: true });exports["default"] = void 0;var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs2/regenerator"));var _symbol = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/symbol"));var _promise = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/promise"));



var _event = _interopRequireDefault(require("./event"));
var _storageCapsule = _interopRequireDefault(require("./storage-capsule"));
var _queue = _interopRequireDefault(require("./queue"));
var _utils = require("./utils");
var _helpers = require("./helpers");








var _console = require("./console");function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { "default": obj };}function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {_Promise2.resolve(value).then(_next, _throw);}}function _asyncToGenerator(fn) {return function () {var self = this,args = arguments;return new _Promise2(function (resolve, reject) {var gen = fn.apply(self, args);function _next(value) {asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);}function _throw(err) {asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);}_next(undefined);});};}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;_Object$defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _defineProperty(obj, key, value) {if (key in obj) {_Object$defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}







/* eslint no-underscore-dangle: [2, { "allow": ["_id"] }] */

var channelName = (0, _symbol["default"])('channel-name');var

Channel = /*#__PURE__*/function () {












  function Channel(name, config) {_classCallCheck(this, Channel);_defineProperty(this, "stopped", true);_defineProperty(this, "running", false);_defineProperty(this, "timeout", void 0);_defineProperty(this, "storage", void 0);_defineProperty(this, "config", void 0);_defineProperty(this, "event", new _event["default"]());
    this.config = config;

    // save channel name to this class with symbolic key
    this[channelName] = name;

    // if custom storage driver exists, setup it
    var drivers = _queue["default"].drivers;
    var storage = new _storageCapsule["default"](config, drivers.storage);
    this.storage = storage.channel(name);
  }

  /**
   * Get channel name
   *
   * @return {String} channel name
   *
   * @api public
   */_createClass(Channel, [{ key: "name", value:
    function name() {
      return this[channelName];
    }

    /**
     * Create new job to channel
     *
     * @param  {Object} task
     * @return {String|Boolean} job
     *
     * @api public
     */ }, { key: "add", value: function () {var _add = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(
      function _callee(task) {var id;return _regenerator["default"].wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.next = 2;return (
                  _helpers.canMultiple.call(this, task));case 2:if (_context.sent) {_context.next = 4;break;}return _context.abrupt("return", false);case 4:_context.next = 6;return (

                  _helpers.saveTask.call(this, task));case 6:id = _context.sent;if (!(

                id && this.running === true)) {_context.next = 10;break;}_context.next = 10;return (
                  this.start());case 10:


                // pass activity to the log service.
                _helpers.logProxy.call(this, _console.taskAddedLog, task);return _context.abrupt("return",

                id);case 12:case "end":return _context.stop();}}}, _callee, this);}));function add(_x) {return _add.apply(this, arguments);}return add;}()


    /**
     * Process next job
     *
     * @return {void}
     *
     * @api public
     */ }, { key: "next", value: function () {var _next2 = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(
      function _callee2() {return _regenerator["default"].wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:if (!
                this.stopped) {_context2.next = 2;break;}return _context2.abrupt("return",
                _helpers.stopQueue.call(this));case 2:


                // Generate a log message
                _helpers.logProxy.call(this, _console.nextTaskLog, 'next');

                // start queue again
                _context2.next = 5;return this.start();case 5:return _context2.abrupt("return",

                true);case 6:case "end":return _context2.stop();}}}, _callee2, this);}));function next() {return _next2.apply(this, arguments);}return next;}()


    /**
     * Start queue listener
     *
     * @return {Boolean} job
     *
     * @api public
     */ }, { key: "start", value: function () {var _start = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(
      function _callee3() {return _regenerator["default"].wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:
                this.stopped = false;
                this.running = true;

                _helpers.logProxy.call(this, _console.queueStartLog, 'start');

                // Create a timeout for start the queue
                _context3.next = 5;return _helpers.createTimeout.call(this);case 5:case "end":return _context3.stop();}}}, _callee3, this);}));function start() {return _start.apply(this, arguments);}return start;}()


    /**
     * Stop queue listener after end of current task
     *
     * @return {Void}
     *
     * @api public
     */ }, { key: "stop", value:
    function stop() {
      _helpers.logProxy.call(this, _console.queueStoppingLog, 'stop');
      this.stopped = true;
    }

    /**
     * Stop queue listener including current task
     *
     * @return {Void}
     *
     * @api public
     */ }, { key: "forceStop", value:
    function forceStop() {
      /* istanbul ignore next */
      _helpers.stopQueue.call(this);
    }

    /**
     * Check if the channel working
     *
     * @return {Boolean}
     *
     * @api public
     */ }, { key: "status", value:
    function status() {
      return this.running;
    }

    /**
     * Check whether there is any task
     *
     * @return {Booelan}
     *
     * @api public
     */ }, { key: "isEmpty", value: function () {var _isEmpty = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(
      function _callee4() {return _regenerator["default"].wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:_context4.next = 2;return (
                  this.count());case 2:_context4.t0 = _context4.sent;return _context4.abrupt("return", _context4.t0 < 1);case 4:case "end":return _context4.stop();}}}, _callee4, this);}));function isEmpty() {return _isEmpty.apply(this, arguments);}return isEmpty;}()


    /**
     * Get task count
     *
     * @return {Number}
     *
     * @api public
     */ }, { key: "count", value: function () {var _count = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(
      function _callee5() {return _regenerator["default"].wrap(function _callee5$(_context5) {while (1) {switch (_context5.prev = _context5.next) {case 0:_context5.next = 2;return (
                  _helpers.getTasksWithoutFreezed.call(this));case 2:return _context5.abrupt("return", _context5.sent.length);case 3:case "end":return _context5.stop();}}}, _callee5, this);}));function count() {return _count.apply(this, arguments);}return count;}()


    /**
     * Get task count by tag
     *
     * @param  {String} tag
     * @return {Array<ITask>}
     *
     * @api public
     */ }, { key: "countByTag", value: function () {var _countByTag = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(
      function _callee6(tag) {return _regenerator["default"].wrap(function _callee6$(_context6) {while (1) {switch (_context6.prev = _context6.next) {case 0:_context6.next = 2;return (
                  _helpers.getTasksWithoutFreezed.call(this));case 2:return _context6.abrupt("return", _context6.sent.filter(function (t) {return t.tag === tag;}).length);case 3:case "end":return _context6.stop();}}}, _callee6, this);}));function countByTag(_x2) {return _countByTag.apply(this, arguments);}return countByTag;}()


    /**
     * Remove all tasks from channel
     *
     * @return {Boolean}
     *
     * @api public
     */ }, { key: "clear", value: function () {var _clear = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(
      function _callee7() {return _regenerator["default"].wrap(function _callee7$(_context7) {while (1) {switch (_context7.prev = _context7.next) {case 0:if (
                this.name()) {_context7.next = 2;break;}return _context7.abrupt("return", false);case 2:_context7.next = 4;return (
                  this.storage.clear(this.name()));case 4:return _context7.abrupt("return",
                true);case 5:case "end":return _context7.stop();}}}, _callee7, this);}));function clear() {return _clear.apply(this, arguments);}return clear;}()


    /**
     * Remove all tasks from channel by tag
     *
     * @param  {String} tag
     * @return {Boolean}
     *
     * @api public
     */ }, { key: "clearByTag", value: function () {var _clearByTag = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(
      function _callee9(tag) {var self, data, removes;return _regenerator["default"].wrap(function _callee9$(_context9) {while (1) {switch (_context9.prev = _context9.next) {case 0:
                self = this;_context9.next = 3;return (
                  _helpers.db.call(self).all());case 3:data = _context9.sent;
                removes = data.filter(_utils.utilClearByTag.bind(tag)).map( /*#__PURE__*/function () {var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(function _callee8(t) {var result;return _regenerator["default"].wrap(function _callee8$(_context8) {while (1) {switch (_context8.prev = _context8.next) {case 0:_context8.next = 2;return (
                              _helpers.db.call(self)["delete"](t._id));case 2:result = _context8.sent;return _context8.abrupt("return",
                            result);case 4:case "end":return _context8.stop();}}}, _callee8);}));return function (_x4) {return _ref.apply(this, arguments);};}());_context9.next = 7;return (

                  _promise["default"].all(removes));case 7:case "end":return _context9.stop();}}}, _callee9, this);}));function clearByTag(_x3) {return _clearByTag.apply(this, arguments);}return clearByTag;}()


    /**
     * Check a task whether exists by job id
     *
     * @param  {String} tag
     * @return {Boolean}
     *
     * @api public
     */ }, { key: "has", value: function () {var _has = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(
      function _callee10(id) {return _regenerator["default"].wrap(function _callee10$(_context10) {while (1) {switch (_context10.prev = _context10.next) {case 0:_context10.next = 2;return (
                  _helpers.getTasksWithoutFreezed.call(this));case 2:_context10.t0 = _context10.sent.findIndex(function (t) {return t._id === id;});_context10.t1 = -1;return _context10.abrupt("return", _context10.t0 > _context10.t1);case 5:case "end":return _context10.stop();}}}, _callee10, this);}));function has(_x5) {return _has.apply(this, arguments);}return has;}()


    /**
     * Check a task whether exists by tag
     *
     * @param  {String} tag
     * @return {Boolean}
     *
     * @api public
     */ }, { key: "hasByTag", value: function () {var _hasByTag = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(
      function _callee11(tag) {return _regenerator["default"].wrap(function _callee11$(_context11) {while (1) {switch (_context11.prev = _context11.next) {case 0:_context11.next = 2;return (
                  _helpers.getTasksWithoutFreezed.call(this));case 2:_context11.t0 = _context11.sent.findIndex(function (t) {return t.tag === tag;});_context11.t1 = -1;return _context11.abrupt("return", _context11.t0 > _context11.t1);case 5:case "end":return _context11.stop();}}}, _callee11, this);}));function hasByTag(_x6) {return _hasByTag.apply(this, arguments);}return hasByTag;}()


    /**
     * Set action events
     *
     * @param  {String} key
     * @param  {Function} cb
     * @return {Void}
     *
     * @api public
     */ }, { key: "on", value:
    function on(key, cb) {var _this$event;
      (_this$event = this.event).on.apply(_this$event, [key, cb]);
      _helpers.logProxy.call(this, _console.eventCreatedLog, key, this.name());
    } }]);return Channel;}();exports["default"] = Channel;

},{"./console":143,"./event":147,"./helpers":148,"./queue":150,"./storage-capsule":151,"./utils":152,"@babel/runtime-corejs2/core-js/object/define-property":6,"@babel/runtime-corejs2/core-js/promise":13,"@babel/runtime-corejs2/core-js/symbol":14,"@babel/runtime-corejs2/regenerator":17}],142:[function(require,module,exports){
"use strict";var _Object$defineProperty2 = require("@babel/runtime-corejs2/core-js/object/define-property");_Object$defineProperty2(exports, "__esModule", { value: true });exports["default"] = void 0;var _keys = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/keys"));var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

var _config = _interopRequireDefault(require("./enum/config.data"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { "default": obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;_Object$defineProperty2(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _defineProperty(obj, key, value) {if (key in obj) {(0, _defineProperty2["default"])(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}var

Config = /*#__PURE__*/function () {












  function Config() {var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};_classCallCheck(this, Config);_defineProperty(this, "config", {});_defineProperty(this, "timeout", void 0);_defineProperty(this, "storage", void 0);_defineProperty(this, "principle", void 0);_defineProperty(this, "prefix", void 0);_defineProperty(this, "limit", void 0);
    this.merge(_config["default"]);
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
   */_createClass(Config, [{ key: "set", value:
    function set(name, value) {
      this.config[name] = value;
    }

    /**
     * Get a config
     *
     * @param  {String} name
     * @return {any}
     *
     * @api public
     */ }, { key: "get", value:
    function get(name) {
      return this.config[name];
    }

    /**
     * Check config property
     *
     * @param  {String} name
     * @return {any}
     *
     * @api public
     */ }, { key: "has", value:
    function has(name) {
      return Object.prototype.hasOwnProperty.call(this.config, name);
    }

    /**
     * Merge two config object
     *
     * @param  {String} name
     * @return {void}
     *
     * @api public
     */ }, { key: "merge", value:
    function merge(config) {var _this = this;
      (0, _keys["default"])(config).forEach(function (key) {
        _this.config[key] = config[key];
      });
    }

    /**
     * Remove a config
     *
     * @param  {String} name
     * @return {Boolean}
     *
     * @api public
     */ }, { key: "remove", value:
    function remove(name) {
      return delete this.config[name];
    }

    /**
     * Get all config
     *
     * @param  {String} name
     * @return {IConfig[]}
     *
     * @api public
     */ }, { key: "all", value:
    function all() {
      return this.config;
    } }]);return Config;}();exports["default"] = Config;

},{"./enum/config.data":145,"@babel/runtime-corejs2/core-js/object/define-property":6,"@babel/runtime-corejs2/core-js/object/keys":10}],143:[function(require,module,exports){
"use strict";var _Symbol = require("@babel/runtime-corejs2/core-js/symbol");var _Symbol$iterator = require("@babel/runtime-corejs2/core-js/symbol/iterator");var _Array$from = require("@babel/runtime-corejs2/core-js/array/from");var _Array$isArray2 = require("@babel/runtime-corejs2/core-js/array/is-array");var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");_Object$defineProperty(exports, "__esModule", { value: true });exports.log = log;exports.taskAddedLog = taskAddedLog;exports.queueStartLog = queueStartLog;exports.nextTaskLog = nextTaskLog;exports.queueStoppingLog = queueStoppingLog;exports.queueStoppedLog = queueStoppedLog;exports.queueEmptyLog = queueEmptyLog;exports.eventCreatedLog = eventCreatedLog;exports.eventFiredLog = eventFiredLog;exports.notFoundLog = notFoundLog;exports.workerRunninLog = workerRunninLog;exports.workerDoneLog = workerDoneLog;exports.workerFailedLog = workerFailedLog;var _isArray = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/array/is-array"));
var _objectPath = _interopRequireDefault(require("object-path"));
var _log = _interopRequireDefault(require("./enum/log.events"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { "default": obj };}function _toConsumableArray(arr) {return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();}function _nonIterableSpread() {throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}function _iterableToArray(iter) {if (typeof _Symbol !== "undefined" && iter[_Symbol$iterator] != null || iter["@@iterator"] != null) return _Array$from(iter);}function _arrayWithoutHoles(arr) {if (_Array$isArray2(arr)) return _arrayLikeToArray(arr);}function _slicedToArray(arr, i) {return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();}function _nonIterableRest() {throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return _Array$from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {arr2[i] = arr[i];}return arr2;}function _iterableToArrayLimit(arr, i) {var _i = arr && (typeof _Symbol !== "undefined" && arr[_Symbol$iterator] || arr["@@iterator"]);if (_i == null) return;var _arr = [];var _n = true;var _d = false;var _s, _e;try {for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"] != null) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}function _arrayWithHoles(arr) {if ((0, _isArray["default"])(arr)) return arr;}

/* eslint no-console: ["error", { allow: ["log", "groupCollapsed", "groupEnd"] }] */

function log() {var _console;
  (_console = console).log.apply(_console, arguments);
}

function taskAddedLog(_ref) {var _ref2 = _slicedToArray(_ref, 1),task = _ref2[0];
  log("%c".concat(
  String.fromCharCode(43), " (").concat(task.handler, ") -> ").concat(_objectPath["default"].get(_log["default"], 'queue.created')),
  'color: green;font-weight: bold;');

}

function queueStartLog(_ref3) {var _ref4 = _slicedToArray(_ref3, 1),type = _ref4[0];
  log("%c".concat(
  String.fromCharCode(8211), " (").concat(type, ") -> ").concat(_objectPath["default"].get(_log["default"], 'queue.starting')),
  'color: #3fa5f3;font-weight: bold;');

}

function nextTaskLog(_ref5) {var _ref6 = _slicedToArray(_ref5, 1),type = _ref6[0];
  log("%c".concat(
  String.fromCharCode(187), " (").concat(type, ") -> ").concat(_objectPath["default"].get(_log["default"], 'queue.next')),
  'color: #3fa5f3;font-weight: bold;');

}

function queueStoppingLog(_ref7) {var _ref8 = _slicedToArray(_ref7, 1),type = _ref8[0];
  log("%c".concat(
  String.fromCharCode(8226), " (").concat(type, ") -> ").concat(_objectPath["default"].get(_log["default"], 'queue.stopping')),
  'color: #ff7f94;font-weight: bold;');

}

function queueStoppedLog(_ref9) {var _ref10 = _slicedToArray(_ref9, 1),type = _ref10[0];
  log("%c".concat(
  String.fromCharCode(8226), " (").concat(type, ") -> ").concat(_objectPath["default"].get(_log["default"], 'queue.stopped')),
  'color: #ff7f94;font-weight: bold;');

}

function queueEmptyLog(_ref11) {var _ref12 = _slicedToArray(_ref11, 1),type = _ref12[0];
  log("%c".concat(type, " ").concat(_objectPath["default"].get(_log["default"], 'queue.empty')), 'color: #ff7f94;font-weight: bold;');
}

function eventCreatedLog(_ref13) {var _ref14 = _slicedToArray(_ref13, 2),key = _ref14[0],name = _ref14[1];
  log("%c(".concat(
  name, ") -> ").concat(key, " ").concat(_objectPath["default"].get(_log["default"], 'event.created')),
  'color: #66cee3;font-weight: bold;');

}

function eventFiredLog(_ref15) {var _ref16 = _slicedToArray(_ref15, 2),key = _ref16[0],name = _ref16[1];
  log("%c(".concat(key, ") -> ").concat(_objectPath["default"].get(_log["default"], "event.".concat(name))), 'color: #a0dc3c;font-weight: bold;');
}

function notFoundLog(_ref17) {var _ref18 = _slicedToArray(_ref17, 1),name = _ref18[0];
  log("%c".concat(
  String.fromCharCode(215), " (").concat(name, ") -> ").concat(_objectPath["default"].get(_log["default"], 'queue.not-found')),
  'color: #b92e2e;font-weight: bold;');

}

function workerRunninLog(_ref19)





{var _ref20 = _slicedToArray(_ref19, 5),worker = _ref20[0],workerInstance = _ref20[1],task = _ref20[2],channel = _ref20[3],deps = _ref20[4];
  console.groupCollapsed("".concat(worker.name || task.handler, " - ").concat(task.label));
  log("%cchannel: ".concat(channel), 'color: blue;');
  log("%clabel: ".concat(task.label || ''), 'color: blue;');
  log("%chandler: ".concat(task.handler), 'color: blue;');
  log("%cpriority: ".concat(task.priority), 'color: blue;');
  log("%cunique: ".concat(task.unique || 'false'), 'color: blue;');
  log("%cretry: ".concat(workerInstance.retry || '1'), 'color: blue;');
  log("%ctried: ".concat(task.tried ? task.tried + 1 : '1'), 'color: blue;');
  log("%ctag: ".concat(task.tag || ''), 'color: blue;');
  log('%cargs:', 'color: blue;');
  log(task.args || '');
  console.groupCollapsed('dependencies');
  log.apply(void 0, _toConsumableArray(deps[worker.name] || []));
  console.groupEnd();
}

function workerDoneLog(_ref21) {var _ref22 = _slicedToArray(_ref21, 3),result = _ref22[0],task = _ref22[1],workerInstance = _ref22[2];
  if (result === true) {
    log("%c".concat(String.fromCharCode(10003), " Task completed!"), 'color: green;');
  } else if (!result && task.tried < workerInstance.retry) {
    log('%cTask will be retried!', 'color: #d8410c;');
  } else {
    log("%c".concat(String.fromCharCode(10005), " Task failed and freezed!"), 'color: #ef6363;');
  }
  console.groupEnd();
}

function workerFailedLog() {
  log("%c".concat(String.fromCharCode(10005), " Task failed!"), 'color: red;');
  console.groupEnd();
}

},{"./enum/log.events":146,"@babel/runtime-corejs2/core-js/array/from":1,"@babel/runtime-corejs2/core-js/array/is-array":2,"@babel/runtime-corejs2/core-js/object/define-property":6,"@babel/runtime-corejs2/core-js/symbol":14,"@babel/runtime-corejs2/core-js/symbol/iterator":15,"object-path":134}],144:[function(require,module,exports){
"use strict";var _Object$defineProperty2 = require("@babel/runtime-corejs2/core-js/object/define-property");var _Object$keys = require("@babel/runtime-corejs2/core-js/object/keys");var _Object$getOwnPropertySymbols = require("@babel/runtime-corejs2/core-js/object/get-own-property-symbols");var _Object$getOwnPropertyDescriptor = require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptor");var _Object$getOwnPropertyDescriptors = require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptors");var _Object$defineProperties = require("@babel/runtime-corejs2/core-js/object/define-properties");_Object$defineProperty2(exports, "__esModule", { value: true });exports["default"] = void 0;var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { "default": obj };}function ownKeys(object, enumerableOnly) {var keys = _Object$keys(object);if (_Object$getOwnPropertySymbols) {var symbols = _Object$getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return _Object$getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (_Object$getOwnPropertyDescriptors) {_Object$defineProperties(target, _Object$getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {_Object$defineProperty2(target, key, _Object$getOwnPropertyDescriptor(source, key));});}}return target;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;_Object$defineProperty2(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _defineProperty(obj, key, value) {if (key in obj) {(0, _defineProperty2["default"])(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}var


Container = /*#__PURE__*/function () {function Container() {_classCallCheck(this, Container);_defineProperty(this, "store",
    {});}_createClass(Container, [{ key: "has", value:

    // freeze(id: string): void {
    //   console.log(this, id);
    // }

    // add(value: any): void {
    //   console.log(this, value);
    // }

    /**
     * Check item in container
     *
     * @param  {String} id
     * @return {Boolean}
     *
     * @api public
     */
    function has(id) {
      return Object.prototype.hasOwnProperty.call(this.store, id);
    }

    /**
     * Get item from container
     *
     * @param  {String} id
     * @return {Any}
     *
     * @api public
     */ }, { key: "get", value:
    function get(id) {
      return this.store[id];
    }

    /**
     * Get all items from container
     *
     * @return {Object}
     *
     * @api public
     */ }, { key: "all", value:
    function all() {
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
     */ }, { key: "bind", value:
    function bind(id, value) {
      this.store[id] = value;
    }

    /**
     * Merge continers
     *
     * @param  {Object} data
     * @return {void}
     *
     * @api public
     */ }, { key: "merge", value:
    function merge() {var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.store = _objectSpread(_objectSpread({}, this.store), data);
    }

    /**
     * Remove item from container
     *
     * @param  {String} id
     * @return {Boolean}
     *
     * @api public
     */ }, { key: "remove", value:
    function remove(id) {
      if (!this.has(id)) return false;
      return delete this.store[id];
    }

    /**
     * Remove all items from container
     *
     * @return {void}
     *
     * @api public
     */ }, { key: "removeAll", value:
    function removeAll() {
      this.store = {};
    } }]);return Container;}();exports["default"] = Container;

},{"@babel/runtime-corejs2/core-js/object/define-properties":5,"@babel/runtime-corejs2/core-js/object/define-property":6,"@babel/runtime-corejs2/core-js/object/get-own-property-descriptor":7,"@babel/runtime-corejs2/core-js/object/get-own-property-descriptors":8,"@babel/runtime-corejs2/core-js/object/get-own-property-symbols":9,"@babel/runtime-corejs2/core-js/object/keys":10}],145:[function(require,module,exports){
"use strict";var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");_Object$defineProperty(exports, "__esModule", { value: true });exports["default"] = void 0;var _default = {
  defaultStorage: 'localstorage',
  prefix: 'sq_jobs',
  timeout: 1000,
  limit: -1,
  principle: 'fifo',
  debug: true };exports["default"] = _default;

},{"@babel/runtime-corejs2/core-js/object/define-property":6}],146:[function(require,module,exports){
"use strict";var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");_Object$defineProperty(exports, "__esModule", { value: true });exports["default"] = void 0;var _default = {
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
    created: 'event created',
    fired: 'Event fired.',
    'wildcard-fired': 'Wildcard event fired.' } };exports["default"] = _default;

},{"@babel/runtime-corejs2/core-js/object/define-property":6}],147:[function(require,module,exports){
"use strict";var _Object$defineProperty2 = require("@babel/runtime-corejs2/core-js/object/define-property");_Object$defineProperty2(exports, "__esModule", { value: true });exports["default"] = void 0;var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { "default": obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;_Object$defineProperty2(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _defineProperty(obj, key, value) {if (key in obj) {(0, _defineProperty2["default"])(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;} /* eslint class-methods-use-this: ["error", { "exceptMethods": ["getName", "getType"] }] */
/* eslint-env es6 */var

Event = /*#__PURE__*/function () {








  function Event() {_classCallCheck(this, Event);_defineProperty(this, "store", {});_defineProperty(this, "verifierPattern", /^[a-z0-9-_]+:before$|after$|retry$|\*$/);_defineProperty(this, "wildcards", ['*', 'error', 'completed']);_defineProperty(this, "emptyFunc", function () {});
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
   */_createClass(Event, [{ key: "on", value:
    function on(key, cb) {
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
     */ }, { key: "emit", value:
    function emit(key, args) {
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
     */ }, { key: "wildcard", value:
    function wildcard(key, actionKey, args) {
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
     */ }, { key: "add", value:
    function add(key, cb) {
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
     */ }, { key: "has", value:
    function has(key) {
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
     */ }, { key: "getName", value:
    function getName(key) {
      var parsed = key.match(/(.*):.*/);
      return parsed ? parsed[1] : '';
    }

    /**
     * Get event type by parse key
     *
     * @param  {String} key
     * @return {String}
     *
     * @api public
     */ }, { key: "getType", value:
    function getType(key) {
      var parsed = key.match(/^[a-z0-9-_]+:(.*)/);
      return parsed ? parsed[1] : '';
    }

    /**
     * Checker of event keys
     *
     * @param  {String} key
     * @return {Boolean}
     *
     * @api public
     */ }, { key: "isValid", value:
    function isValid(key) {
      return this.verifierPattern.test(key) || this.wildcards.indexOf(key) > -1;
    } }]);return Event;}();exports["default"] = Event;

},{"@babel/runtime-corejs2/core-js/object/define-property":6}],148:[function(require,module,exports){
"use strict";var _Array$isArray = require("@babel/runtime-corejs2/core-js/array/is-array");var _Symbol = require("@babel/runtime-corejs2/core-js/symbol");var _Symbol$iterator = require("@babel/runtime-corejs2/core-js/symbol/iterator");var _Array$from = require("@babel/runtime-corejs2/core-js/array/from");var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");_Object$defineProperty(exports, "__esModule", { value: true });exports.checkPriority = checkPriority;exports.db = db;exports.getTasksWithoutFreezed = getTasksWithoutFreezed;exports.logProxy = logProxy;exports.saveTask = saveTask;exports.removeTask = removeTask;exports.dispatchEvents = dispatchEvents;exports.stopQueue = stopQueue;exports.failedJobHandler = failedJobHandler;exports.lockTask = lockTask;exports.fireJobInlineEvent = fireJobInlineEvent;exports.successProcess = successProcess;exports.updateRetry = updateRetry;exports.retryProcess = retryProcess;exports.successJobHandler = successJobHandler;exports.loopHandler = loopHandler;exports.createTimeout = createTimeout;exports.statusOff = statusOff;exports.canMultiple = canMultiple;var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs2/regenerator"));var _values = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/values"));var _promise = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/promise"));



var _queue = _interopRequireDefault(require("./queue"));
var _channel = _interopRequireDefault(require("./channel"));
var _storageCapsule = _interopRequireDefault(require("./storage-capsule"));
var _utils = require("./utils");
var _console = require("./console");function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { "default": obj };}function _typeof(obj) {"@babel/helpers - typeof";if (typeof _Symbol === "function" && typeof _Symbol$iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof _Symbol === "function" && obj.constructor === _Symbol && obj !== _Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}function _toConsumableArray(arr) {return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();}function _nonIterableSpread() {throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return _Array$from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _iterableToArray(iter) {if (typeof _Symbol !== "undefined" && iter[_Symbol$iterator] != null || iter["@@iterator"] != null) return _Array$from(iter);}function _arrayWithoutHoles(arr) {if (_Array$isArray(arr)) return _arrayLikeToArray(arr);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {arr2[i] = arr[i];}return arr2;}function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {_promise["default"].resolve(value).then(_next, _throw);}}function _asyncToGenerator(fn) {return function () {var self = this,args = arguments;return new _promise["default"](function (resolve, reject) {var gen = fn.apply(self, args);function _next(value) {asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);}function _throw(err) {asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);}_next(undefined);});};}









/* global Worker */
/* eslint no-underscore-dangle: [2, { "allow": ["_id"] }] */
/* eslint no-param-reassign: "error" */
/* eslint use-isnan: "error" */

/**
 * Task priority controller helper
 * Context: Channel
 *
 * @return {ITask}
 * @param {ITask} task
 *
 * @api private
 */
function checkPriority(task) {
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
 */
function db() {
  return this.storage.channel(this.name());
}

/**
 * Get unfreezed tasks by the filter function
 * Context: Channel
 *
 * @return {ITask}
 *
 * @api private
 */function
getTasksWithoutFreezed() {return _getTasksWithoutFreezed.apply(this, arguments);}



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
 */function _getTasksWithoutFreezed() {_getTasksWithoutFreezed = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {return _regenerator["default"].wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:_context2.next = 2;return db.call(this).all();case 2:return _context2.abrupt("return", _context2.sent.filter(_utils.excludeSpecificTasks.bind(['freezed'])));case 3:case "end":return _context2.stop();}}}, _callee2, this);}));return _getTasksWithoutFreezed.apply(this, arguments);}
function logProxy(wrapperFunc) {
  if (this.config.get('debug') && typeof wrapperFunc === 'function') {for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {args[_key - 1] = arguments[_key];}
    wrapperFunc(args);
  }
}

/**
 * New task save helper
 * Context: Channel
 *
 * @param {ITask} task
 * @return {string|boolean}
 *
 * @api private
 */function
saveTask(_x) {return _saveTask.apply(this, arguments);}




/**
 * Task remove helper
 * Context: Channel
 *
 * @param {string} id
 * @return {boolean}
 *
 * @api private
 */function _saveTask() {_saveTask = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(function _callee3(task) {var result;return _regenerator["default"].wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:_context3.next = 2;return db.call(this).save(checkPriority(task));case 2:result = _context3.sent;return _context3.abrupt("return", result);case 4:case "end":return _context3.stop();}}}, _callee3, this);}));return _saveTask.apply(this, arguments);}function
removeTask(_x2) {return _removeTask.apply(this, arguments);}




/**
 * Events dispatcher helper
 * Context: Channel
 *
 * @param {ITask} task
 * @param {string} type
 * @return {void}
 *
 * @api private
 */function _removeTask() {_removeTask = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(function _callee4(id) {var result;return _regenerator["default"].wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:_context4.next = 2;return db.call(this)["delete"](id);case 2:result = _context4.sent;return _context4.abrupt("return", result);case 4:case "end":return _context4.stop();}}}, _callee4, this);}));return _removeTask.apply(this, arguments);}
function dispatchEvents(task, type) {var _this = this;
  if (!('tag' in task)) return false;

  var events = [["".concat(task.tag, ":").concat(type), 'fired'], ["".concat(task.tag, ":*"), 'wildcard-fired']];

  events.forEach(function (e) {
    _this.event.emit(e[0], task);
    logProxy.call.apply(logProxy, [_this, _console.eventFiredLog].concat(_toConsumableArray(e)));
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
 */
function stopQueue() {
  this.stop();

  this.running = false;

  clearTimeout(this.currentTimeout);

  logProxy.call(this, _console.queueStoppedLog, 'stop');
}

/**
 * Failed job handler
 * Context: Channel
 *
 * @param {ITask} task
 * @return {ITask} job
 * @return {Function}
 *
 * @api private
 */function
failedJobHandler(_x3) {return _failedJobHandler.apply(this, arguments);}












/**
 * Helper of the lock task of the current job
 * Context: Channel
 *
 * @param {ITask} task
 * @return {boolean}
 *
 * @api private
 */function _failedJobHandler() {_failedJobHandler = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(function _callee6(task) {return _regenerator["default"].wrap(function _callee6$(_context6) {while (1) {switch (_context6.prev = _context6.next) {case 0:return _context6.abrupt("return", /*#__PURE__*/function () {var _childFailedHandler = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(function _callee5() {return _regenerator["default"].wrap(function _callee5$(_context5) {while (1) {switch (_context5.prev = _context5.next) {case 0:removeTask.call(this, task._id);this.event.emit('error', task);logProxy.call(this, _console.workerFailedLog); /* istanbul ignore next */_context5.next = 5;return this.next();case 5:case "end":return _context5.stop();}}}, _callee5, this);}));function childFailedHandler() {return _childFailedHandler.apply(this, arguments);}return childFailedHandler;}());case 1:case "end":return _context6.stop();}}}, _callee6);}));return _failedJobHandler.apply(this, arguments);}function
lockTask(_x4) {return _lockTask.apply(this, arguments);}




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
 */function _lockTask() {_lockTask = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(function _callee7(task) {var result;return _regenerator["default"].wrap(function _callee7$(_context7) {while (1) {switch (_context7.prev = _context7.next) {case 0:_context7.next = 2;return db.call(this).update(task._id, { locked: true });case 2:result = _context7.sent;return _context7.abrupt("return", result);case 4:case "end":return _context7.stop();}}}, _callee7, this);}));return _lockTask.apply(this, arguments);}
function fireJobInlineEvent(name, worker, args) {
  if ((0, _utils.hasMethod)(worker, name) && (0, _utils.isFunction)(worker[name])) {
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
 */
function successProcess(task) {
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
 */
function updateRetry(task, worker) {
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

/**
 * Process handler of retried job
 * Context: Channel
 *
 * @param {ITask} task
 * @param {IWorker} worker
 * @return {boolean}
 *
 * @api private
 */function
retryProcess(_x5, _x6) {return _retryProcess.apply(this, arguments);}














/**
 * Succeed job handler
 * Context: Channel
 *
 * @param {ITask} task
 * @param {IWorker} worker
 * @return {Function}
 *
 * @api private
 */function _retryProcess() {_retryProcess = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(function _callee8(task, worker) {var updateTask, result;return _regenerator["default"].wrap(function _callee8$(_context8) {while (1) {switch (_context8.prev = _context8.next) {case 0: // dispacth custom retry event
            dispatchEvents.call(this, task, 'retry'); // update retry value
            updateTask = updateRetry.call(this, task, worker); // delete lock property for next process
            updateTask.locked = false;_context8.next = 5;return db.call(this).update(task._id, updateTask);case 5:result = _context8.sent;return _context8.abrupt("return", result);case 7:case "end":return _context8.stop();}}}, _callee8, this);}));return _retryProcess.apply(this, arguments);}function successJobHandler(_x7, _x8) {return _successJobHandler.apply(this, arguments);}























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
 */function _successJobHandler() {_successJobHandler = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(function _callee10(task, worker) {var self;return _regenerator["default"].wrap(function _callee10$(_context10) {while (1) {switch (_context10.prev = _context10.next) {case 0:self = this;return _context10.abrupt("return", /*#__PURE__*/function () {var _childSuccessJobHandler = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(function _callee9(result) {return _regenerator["default"].wrap(function _callee9$(_context9) {while (1) {switch (_context9.prev = _context9.next) {case 0:if (!result) {_context9.next = 4;break;} // go ahead to success process
                        successProcess.call(self, task);_context9.next = 6;break;case 4:_context9.next = 6;return retryProcess.call(self, task, worker);case 6: // fire job after event
                        fireJobInlineEvent.call(self, 'after', worker, task.args); // dispacth custom after event
                        // dispacth custom after event
                        dispatchEvents.call(self, task, 'after'); // show console
                        // show console
                        logProxy.call(self, _console.workerDoneLog, result, task, worker); // try next queue job
                        _context9.next = 11;return self.next();case 11:case "end":return _context9.stop();}}}, _callee9);}));function childSuccessJobHandler(_x10) {return _childSuccessJobHandler.apply(this, arguments);}return childSuccessJobHandler;}());case 2:case "end":return _context10.stop();}}}, _callee10, this);}));return _successJobHandler.apply(this, arguments);} /* istanbul ignore next */function loopHandler(task, worker, workerInstance) {return /*#__PURE__*/function () {var _childLoopHandler = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(function _callee() {var workerPromise, self, deps, dependencies, _workerInstance$handl;return _regenerator["default"].wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:
              self = this;

              // lock the current task for prevent race condition
              _context.next = 3;return lockTask.call(self, task);case 3:

              // fire job before event
              fireJobInlineEvent.call(this, 'before', workerInstance, task.args);

              // dispacth custom before event
              dispatchEvents.call(this, task, 'before');

              // if has any dependency in dependencies, get it
              deps = _queue["default"].workerDeps[task.handler];

              // preparing worker dependencies
              dependencies = (0, _values["default"])(deps || {});

              // show console
              logProxy.call(
              this,
              _console.workerRunninLog,
              worker,
              workerInstance,
              task,
              self.name(),
              _queue["default"].workerDeps);


              // Check worker instance and route the process via instance
              if (workerInstance instanceof Worker) {
                // start the native worker by passing task parameters and dependencies.
                // Note: Native worker parameters can not be class or function.
                workerInstance.postMessage({ args: task.args, dependencies: dependencies });

                // Wrap the worker with promise class.
                workerPromise = new _promise["default"](function (resolve) {
                  // Set function to worker onmessage event for handle the repsonse of worker.
                  workerInstance.onmessage = function (response) {
                    resolve(worker.handler(response));

                    // Terminate browser worker.
                    workerInstance.terminate();
                  };
                });
              } else {
                // This is custom worker class.
                // Call the handle function in worker and get promise instance.
                workerPromise = (_workerInstance$handl = workerInstance.handle).call.apply(_workerInstance$handl, [workerInstance, task.args].concat(_toConsumableArray(dependencies)));
              }_context.t1 =

              workerPromise
              // Handle worker return process.
              ;_context.next = 12;return successJobHandler.call(self, task, workerInstance);case 12:_context.t2 = _context.sent.bind(self);_context.t0 = _context.t1.then.call(_context.t1, _context.t2);_context.next = 16;return (

                failedJobHandler.call(self, task));case 16:_context.t3 = _context.sent.bind(self);_context.t0["catch"].call(_context.t0, _context.t3);case 18:case "end":return _context.stop();}}}, _callee, this);}));function childLoopHandler() {return _childLoopHandler.apply(this, arguments);}return childLoopHandler;}();

}

/**
 * Timeout creator helper
 * Context: Channel
 *
 * @return {number}
 *
 * @api private
 */function
createTimeout() {return _createTimeout.apply(this, arguments);}











































/**
 * Set the status to false of queue
 * Context: Channel
 *
 * @return {void}
 *
 * @api private
 */function _createTimeout() {_createTimeout = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(function _callee11() {var task, JobWorker, workerInstance, timeout, params, handler;return _regenerator["default"].wrap(function _callee11$(_context11) {while (1) {switch (_context11.prev = _context11.next) {case 0: // if running any job, stop it
            // the purpose here is to prevent cocurrent operation in same channel
            clearTimeout(this.currentTimeout); // Get next task
            _context11.next = 3;return db.call(this).fetch();case 3:task = _context11.sent.shift();if (!(task === undefined)) {_context11.next = 8;break;}logProxy.call(this, _console.queueEmptyLog, this.name());this.event.emit('completed', task);return _context11.abrupt("return", 0);case 8:if (_queue["default"].worker.has(task.handler)) {_context11.next = 15;break;}logProxy.call(this, _console.notFoundLog, task.handler);_context11.next = 12;return failedJobHandler.call(this, task);case 12:_context11.next = 14;return _context11.sent.call(this);case 14:return _context11.abrupt("return", 0);case 15: // Get worker with handler name
            JobWorker = _queue["default"].worker.get(task.handler); // Create a worker instance
            workerInstance = _typeof(JobWorker) === 'object' ? new Worker(JobWorker.uri) : new JobWorker(); // get always last updated config value
            timeout = this.config.get('timeout'); // create a array with handler parameters for shorten line numbers
            params = [task, JobWorker, workerInstance]; // Get handler function for handle on completed event
            _context11.next = 21;return loopHandler.call.apply(loopHandler, [this].concat(params));case 21:handler = _context11.sent.bind(this); // create new timeout for process a job in queue
            // binding loopHandler function to setTimeout
            // then return the timeout instance
            this.currentTimeout = setTimeout(handler, timeout);return _context11.abrupt("return", this.currentTimeout);case 24:case "end":return _context11.stop();}}}, _callee11, this);}));return _createTimeout.apply(this, arguments);}function statusOff() {this.running = false;} /**
* Checks whether a task is replicable or not
* Context: Channel
*
* @param {ITask} task
* @return {boolean}
*
* @api private
*/function canMultiple(_x9) {return _canMultiple.apply(this, arguments);}function _canMultiple() {_canMultiple = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(function _callee12(task) {return _regenerator["default"].wrap(function _callee12$(_context12) {while (1) {switch (_context12.prev = _context12.next) {case 0:if (!(_typeof(task) !== 'object' || task.unique !== true)) {_context12.next = 2;break;}return _context12.abrupt("return", true);case 2:_context12.next = 4;return this.hasByTag(task.tag);case 4:_context12.t0 = _context12.sent;return _context12.abrupt("return", _context12.t0 === false);case 6:case "end":return _context12.stop();}}}, _callee12, this);}));return _canMultiple.apply(this, arguments);}

},{"./channel":141,"./console":143,"./queue":150,"./storage-capsule":151,"./utils":152,"@babel/runtime-corejs2/core-js/array/from":1,"@babel/runtime-corejs2/core-js/array/is-array":2,"@babel/runtime-corejs2/core-js/object/define-property":6,"@babel/runtime-corejs2/core-js/object/values":11,"@babel/runtime-corejs2/core-js/promise":13,"@babel/runtime-corejs2/core-js/symbol":14,"@babel/runtime-corejs2/core-js/symbol/iterator":15,"@babel/runtime-corejs2/regenerator":17}],149:[function(require,module,exports){
"use strict";var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");_Object$defineProperty(exports, "__esModule", { value: true });exports["default"] = void 0;require("pseudo-worker/polyfill");
var _queue = _interopRequireDefault(require("./queue"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { "default": obj };}

/* global window:true */

if (typeof window !== 'undefined') {
  window.Queue = _queue["default"];
}var _default =

_queue["default"];exports["default"] = _default;

},{"./queue":150,"@babel/runtime-corejs2/core-js/object/define-property":6,"pseudo-worker/polyfill":136}],150:[function(require,module,exports){
"use strict";var _Object$defineProperty2 = require("@babel/runtime-corejs2/core-js/object/define-property");_Object$defineProperty2(exports, "__esModule", { value: true });exports["default"] = void 0;var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));var _keys = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/keys"));


var _channel = _interopRequireDefault(require("./channel"));
var _container = _interopRequireDefault(require("./container"));
var _config = _interopRequireDefault(require("./config"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { "default": obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;_Object$defineProperty2(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _defineProperty(obj, key, value) {if (key in obj) {(0, _defineProperty2["default"])(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}var

Queue = /*#__PURE__*/function () {






















  function Queue(config) {_classCallCheck(this, Queue);_defineProperty(this, "config", void 0);_defineProperty(this, "container", void 0);
    this.config = new _config["default"](config);
    this.container = Queue.container;
  }

  /**
   * Create a new channel
   *
   * @param  {String} task
   * @return {Queue} channel
   *
   * @api public
   */_createClass(Queue, [{ key: "create", value:
    function create(channel) {
      if (!this.container.has(channel)) {
        this.container.bind(channel, new _channel["default"](channel, this.config));
      }
      return this.container.get(channel);
    }

    /**
     * Get channel instance by channel name
     *
     * @param  {String} name
     * @return {Queue}
     *
     * @api public
     */ }, { key: "channel", value:
    function channel(name) {
      if (!this.container.has(name)) {
        throw new Error("\"".concat(name, "\" channel not found"));
      }
      return this.container.get(name);
    }

    /**
     * Set config timeout value
     *
     * @param  {Number} val
     * @return {Void}
     *
     * @api public
     */ }, { key: "setTimeout", value:
    function setTimeout(val) {
      this.config.set('timeout', val);
    }

    /**
     * Set config limit value
     *
     * @param  {Number} val
     * @return {Void}
     *
     * @api public
     */ }, { key: "setLimit", value:
    function setLimit(val) {
      this.config.set('limit', val);
    }

    /**
     * Set config prefix value
     *
     * @param  {String} val
     * @return {Void}
     *
     * @api public
     */ }, { key: "setPrefix", value:
    function setPrefix(val) {
      this.config.set('prefix', val);
    }

    /**
     * Set config priciple value
     *
     * @param  {String} val
     * @return {Void}
     *
     * @api public
     */ }, { key: "setPrinciple", value:
    function setPrinciple(val) {
      this.config.set('principle', val);
    }

    /**
     * Set config debug value
     *
     * @param  {Boolean} val
     * @return {Void}
     *
     * @api public
     */ }, { key: "setDebug", value:
    function setDebug(val) {
      this.config.set('debug', val);
    } }, { key: "setStorage", value:

    function setStorage(val) {
      this.config.set('storage', val);
    } }]);return Queue;}();exports["default"] = Queue;_defineProperty(Queue, "FIFO", 'fifo');_defineProperty(Queue, "LIFO", 'lifo');_defineProperty(Queue, "drivers", {});_defineProperty(Queue, "workerDeps", {});_defineProperty(Queue, "container", void 0);_defineProperty(Queue, "worker", void 0);_defineProperty(Queue, "workers", void 0);_defineProperty(Queue, "deps", void 0);_defineProperty(Queue, "use", void 0);


Queue.worker = new _container["default"]();

Queue.container = new _container["default"]();

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
  (0, _keys["default"])(driver).forEach(function (name) {
    Queue.drivers[name] = driver[name];
  });
};

},{"./channel":141,"./config":142,"./container":144,"@babel/runtime-corejs2/core-js/object/define-property":6,"@babel/runtime-corejs2/core-js/object/keys":10}],151:[function(require,module,exports){
"use strict";var _Object$defineProperty2 = require("@babel/runtime-corejs2/core-js/object/define-property");var _Symbol = require("@babel/runtime-corejs2/core-js/symbol");var _Symbol$iterator = require("@babel/runtime-corejs2/core-js/symbol/iterator");var _Promise = require("@babel/runtime-corejs2/core-js/promise");var _Object$keys2 = require("@babel/runtime-corejs2/core-js/object/keys");var _Object$getOwnPropertySymbols = require("@babel/runtime-corejs2/core-js/object/get-own-property-symbols");var _Object$getOwnPropertyDescriptor = require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptor");var _Object$getOwnPropertyDescriptors = require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptors");var _Object$defineProperties = require("@babel/runtime-corejs2/core-js/object/define-properties");_Object$defineProperty2(exports, "__esModule", { value: true });exports["default"] = void 0;var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs2/regenerator"));var _keys = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/keys"));var _parseInt2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/parse-int"));var _now = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/date/now"));var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));
var _groupBy = _interopRequireDefault(require("group-by"));



var _adapters = require("./adapters");
var _utils = require("./utils");function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { "default": obj };}function ownKeys(object, enumerableOnly) {var keys = _Object$keys2(object);if (_Object$getOwnPropertySymbols) {var symbols = _Object$getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return _Object$getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (_Object$getOwnPropertyDescriptors) {_Object$defineProperties(target, _Object$getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {_Object$defineProperty2(target, key, _Object$getOwnPropertyDescriptor(source, key));});}}return target;}function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {_Promise.resolve(value).then(_next, _throw);}}function _asyncToGenerator(fn) {return function () {var self = this,args = arguments;return new _Promise(function (resolve, reject) {var gen = fn.apply(self, args);function _next(value) {asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);}function _throw(err) {asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);}_next(undefined);});};}function _typeof(obj) {"@babel/helpers - typeof";if (typeof _Symbol === "function" && typeof _Symbol$iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof _Symbol === "function" && obj.constructor === _Symbol && obj !== _Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;_Object$defineProperty2(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _defineProperty(obj, key, value) {if (key in obj) {(0, _defineProperty2["default"])(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}

/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
/* eslint no-underscore-dangle: [2, { "allow": ["_id"] }] */
/* eslint class-methods-use-this: ["error", { "exceptMethods": ["generateId"] }] */var

StorageCapsule = /*#__PURE__*/function () {






  function StorageCapsule(config, storage) {_classCallCheck(this, StorageCapsule);_defineProperty(this, "config", void 0);_defineProperty(this, "storage", void 0);_defineProperty(this, "storageChannel", void 0);
    this.config = config;
    this.storage = this.initialize(storage);
  }_createClass(StorageCapsule, [{ key: "initialize", value:

    function initialize(Storage) {
      /* eslint no-else-return: off */
      if (_typeof(Storage) === 'object') {
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
     */ }, { key: "channel", value:
    function channel(name) {
      this.storageChannel = name;
      return this;
    }

    /**
     * Fetch tasks from storage with ordered
     *
     * @return {any[]}
     *
     * @api public
     */ }, { key: "fetch", value: function () {var _fetch = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(
      function _callee() {var all, tasks;return _regenerator["default"].wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.next = 2;return (
                  this.all());case 2:all = _context.sent.filter(_utils.excludeSpecificTasks);
                tasks = (0, _groupBy["default"])(all, 'priority');return _context.abrupt("return",
                (0, _keys["default"])(tasks).
                map(function (key) {return (0, _parseInt2["default"])(key, 10);}).
                sort(function (a, b) {return b - a;}).
                reduce(this.reduceTasks(tasks), []));case 5:case "end":return _context.stop();}}}, _callee, this);}));function fetch() {return _fetch.apply(this, arguments);}return fetch;}()


    /**
     * Save task to storage
     *
     * @param  {ITask} task
     * @return {String|Boolean}
     *
     * @api public
     */ }, { key: "save", value: function () {var _save = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(
      function _callee2(task) {var tasks, newTask;return _regenerator["default"].wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:if (!(
                _typeof(task) !== 'object')) {_context2.next = 2;break;}return _context2.abrupt("return", false);case 2:_context2.next = 4;return (


                  this.storage.get(this.storageChannel));case 4:tasks = _context2.sent;_context2.next = 7;return (



                  this.isExceeded());case 7:if (!_context2.sent) {_context2.next = 10;break;}
                console.warn("Task limit exceeded: The '".concat(this.storageChannel, "' channel limit is ").concat(this.config.get('limit')));return _context2.abrupt("return",
                false);case 10:


                // prepare all properties before save
                // example: createdAt etc.
                newTask = this.prepareTask(task);

                // add task to storage
                tasks.push(newTask);

                // save tasks
                _context2.next = 14;return this.storage.set(this.storageChannel, tasks);case 14:return _context2.abrupt("return",

                newTask._id);case 15:case "end":return _context2.stop();}}}, _callee2, this);}));function save(_x) {return _save.apply(this, arguments);}return save;}()


    /**
     * Update channel store.
     *
     * @return {string}
     *   The value. This annotation can be used for type hinting purposes.
     */ }, { key: "update", value: function () {var _update2 = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(
      function _callee3(id, _update) {var data, index;return _regenerator["default"].wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:_context3.next = 2;return (
                  this.all());case 2:data = _context3.sent;
                index = data.findIndex(function (t) {return t._id === id;});

                // if index not found, return false
                if (!(index < 0)) {_context3.next = 6;break;}return _context3.abrupt("return", false);case 6:

                // merge existing object with given update object
                data[index] = _objectSpread(_objectSpread({}, data[index]), _update);

                // save to the storage as string
                _context3.next = 9;return this.storage.set(this.storageChannel, data);case 9:return _context3.abrupt("return",

                true);case 10:case "end":return _context3.stop();}}}, _callee3, this);}));function update(_x2, _x3) {return _update2.apply(this, arguments);}return update;}()


    /**
     * Remove task from storage
     *
     * @param  {String} id
     * @return {Boolean}
     *
     * @api public
     */ }, { key: "delete", value: function () {var _delete2 = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(
      function _callee4(id) {var data, index;return _regenerator["default"].wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:_context4.next = 2;return (
                  this.all());case 2:data = _context4.sent;
                index = data.findIndex(function (d) {return d._id === id;});if (!(

                index < 0)) {_context4.next = 6;break;}return _context4.abrupt("return", false);case 6:

                delete data[index];_context4.next = 9;return (

                  this.storage.set(this.storageChannel, data.filter(function (d) {return d;})));case 9:return _context4.abrupt("return",

                true);case 10:case "end":return _context4.stop();}}}, _callee4, this);}));function _delete(_x4) {return _delete2.apply(this, arguments);}return _delete;}()


    /**
     * Get all tasks
     *
     * @return {Any[]}
     *
     * @api public
     */ }, { key: "all", value: function () {var _all = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(
      function _callee5() {var items;return _regenerator["default"].wrap(function _callee5$(_context5) {while (1) {switch (_context5.prev = _context5.next) {case 0:_context5.next = 2;return (
                  this.storage.get(this.storageChannel));case 2:items = _context5.sent;return _context5.abrupt("return",
                items);case 4:case "end":return _context5.stop();}}}, _callee5, this);}));function all() {return _all.apply(this, arguments);}return all;}()


    /**
     * Generate unique id
     *
     * @return {String}
     *
     * @api public
     */ }, { key: "generateId", value:
    function generateId() {
      return ((1 + Math.random()) * 0x10000).toString(16);
    }

    /**
     * Add some necessary properties
     *
     * @param  {String} id
     * @return {ITask}
     *
     * @api public
     */ }, { key: "prepareTask", value:
    function prepareTask(task) {
      /* eslint no-param-reassign: off */
      var newTask = {};
      (0, _keys["default"])(task).forEach(function (key) {
        newTask[key] = task[key];
      });
      newTask.createdAt = (0, _now["default"])();
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
     */ }, { key: "reduceTasks", value:
    function reduceTasks(tasks) {var _this = this;
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
     */ }, { key: "isExceeded", value: function () {var _isExceeded = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(
      function _callee6() {var limit, tasks;return _regenerator["default"].wrap(function _callee6$(_context6) {while (1) {switch (_context6.prev = _context6.next) {case 0:
                limit = this.config.get('limit');_context6.next = 3;return (
                  this.all());case 3:tasks = _context6.sent.filter(_utils.excludeSpecificTasks);return _context6.abrupt("return",
                !(limit === -1 || limit > tasks.length));case 5:case "end":return _context6.stop();}}}, _callee6, this);}));function isExceeded() {return _isExceeded.apply(this, arguments);}return isExceeded;}()


    /**
     * Clear tasks with given channel name
     *
     * @param  {String} channel
     * @return {void}
     *
     * @api public
     */ }, { key: "clear", value: function () {var _clear = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(
      function _callee7(channel) {return _regenerator["default"].wrap(function _callee7$(_context7) {while (1) {switch (_context7.prev = _context7.next) {case 0:_context7.next = 2;return (
                  this.storage.clear(channel));case 2:case "end":return _context7.stop();}}}, _callee7, this);}));function clear(_x5) {return _clear.apply(this, arguments);}return clear;}() }]);return StorageCapsule;}();exports["default"] = StorageCapsule;

},{"./adapters":138,"./utils":152,"@babel/runtime-corejs2/core-js/date/now":3,"@babel/runtime-corejs2/core-js/object/define-properties":5,"@babel/runtime-corejs2/core-js/object/define-property":6,"@babel/runtime-corejs2/core-js/object/get-own-property-descriptor":7,"@babel/runtime-corejs2/core-js/object/get-own-property-descriptors":8,"@babel/runtime-corejs2/core-js/object/get-own-property-symbols":9,"@babel/runtime-corejs2/core-js/object/keys":10,"@babel/runtime-corejs2/core-js/parse-int":12,"@babel/runtime-corejs2/core-js/promise":13,"@babel/runtime-corejs2/core-js/symbol":14,"@babel/runtime-corejs2/core-js/symbol/iterator":15,"@babel/runtime-corejs2/regenerator":17,"group-by":133}],152:[function(require,module,exports){
"use strict";var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");_Object$defineProperty(exports, "__esModule", { value: true });exports.hasProperty = hasProperty;exports.hasMethod = hasMethod;exports.isFunction = isFunction;exports.excludeSpecificTasks = excludeSpecificTasks;exports.utilClearByTag = utilClearByTag;exports.fifo = fifo;exports.lifo = lifo;var _isArray = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/array/is-array"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { "default": obj };}


/* eslint comma-dangle: ["error", "never"] */

/**
 * Check property in object
 *
 * @param  {Object} obj
 * @return {Boolean}
 *
 * @api public
 */
function hasProperty(func, name) {
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
 */
function hasMethod(instance, method) {
  return instance instanceof Object && method in instance;
}

/**
 * Check function type
 *
 * @param  {Function} func
 * @return {Boolean}
 *
 * @api public
 */
function isFunction(func) {
  return func instanceof Function;
}

/**
 * Remove some tasks by some conditions
 *
 * @param  {Function} func
 * @return {Boolean}
 *
 * @api public
 */
function excludeSpecificTasks(task) {
  var conditions = (0, _isArray["default"])(this) ? this : ['freezed', 'locked'];
  var results = [];

  conditions.forEach(function (c) {
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
 */
function utilClearByTag(task) {
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
 */
function fifo(a, b) {
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
 */
function lifo(a, b) {
  return b.createdAt - a.createdAt;
}

},{"@babel/runtime-corejs2/core-js/array/is-array":2,"@babel/runtime-corejs2/core-js/object/define-property":6}]},{},[149])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUtY29yZWpzMi9jb3JlLWpzL2FycmF5L2Zyb20uanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUtY29yZWpzMi9jb3JlLWpzL2FycmF5L2lzLWFycmF5LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lLWNvcmVqczIvY29yZS1qcy9kYXRlL25vdy5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS1jb3JlanMyL2NvcmUtanMvanNvbi9zdHJpbmdpZnkuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUtY29yZWpzMi9jb3JlLWpzL29iamVjdC9kZWZpbmUtcHJvcGVydGllcy5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS1jb3JlanMyL2NvcmUtanMvb2JqZWN0L2RlZmluZS1wcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS1jb3JlanMyL2NvcmUtanMvb2JqZWN0L2dldC1vd24tcHJvcGVydHktZGVzY3JpcHRvci5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS1jb3JlanMyL2NvcmUtanMvb2JqZWN0L2dldC1vd24tcHJvcGVydHktZGVzY3JpcHRvcnMuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUtY29yZWpzMi9jb3JlLWpzL29iamVjdC9nZXQtb3duLXByb3BlcnR5LXN5bWJvbHMuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUtY29yZWpzMi9jb3JlLWpzL29iamVjdC9rZXlzLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lLWNvcmVqczIvY29yZS1qcy9vYmplY3QvdmFsdWVzLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lLWNvcmVqczIvY29yZS1qcy9wYXJzZS1pbnQuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUtY29yZWpzMi9jb3JlLWpzL3Byb21pc2UuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUtY29yZWpzMi9jb3JlLWpzL3N5bWJvbC5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS1jb3JlanMyL2NvcmUtanMvc3ltYm9sL2l0ZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lLWNvcmVqczIvbm9kZV9tb2R1bGVzL3JlZ2VuZXJhdG9yLXJ1bnRpbWUvcnVudGltZS5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS1jb3JlanMyL3JlZ2VuZXJhdG9yL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NvbXBvbmVudC1wcm9wcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vYXJyYXkvZnJvbS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vYXJyYXkvaXMtYXJyYXkuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL2RhdGUvbm93LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9qc29uL3N0cmluZ2lmeS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2RlZmluZS1wcm9wZXJ0aWVzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZGVmaW5lLXByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9ycy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2dldC1vd24tcHJvcGVydHktc3ltYm9scy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2tleXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC92YWx1ZXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL3BhcnNlLWludC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vcHJvbWlzZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vc3ltYm9sL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9zeW1ib2wvaXRlcmF0b3IuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2EtZnVuY3Rpb24uanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2FkZC10by11bnNjb3BhYmxlcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYW4taW5zdGFuY2UuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2FuLW9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYXJyYXktaW5jbHVkZXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2NsYXNzb2YuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2NvZi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY29yZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY3JlYXRlLXByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19jdHguanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2RlZmluZWQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2Rlc2NyaXB0b3JzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19kb20tY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19lbnVtLWJ1Zy1rZXlzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19lbnVtLWtleXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2V4cG9ydC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZmFpbHMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2Zvci1vZi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZ2xvYmFsLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19oYXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2hpZGUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2h0bWwuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2llOC1kb20tZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pbnZva2UuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2lvYmplY3QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2lzLWFycmF5LWl0ZXIuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2lzLWFycmF5LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pcy1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2l0ZXItY2FsbC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faXRlci1jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2l0ZXItZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pdGVyLWRldGVjdC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faXRlci1zdGVwLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pdGVyYXRvcnMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2xpYnJhcnkuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX21ldGEuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX21pY3JvdGFzay5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fbmV3LXByb21pc2UtY2FwYWJpbGl0eS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWNyZWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWRwLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtZHBzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtZ29wZC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWdvcG4tZXh0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtZ29wbi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWdvcHMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1ncG8uanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1rZXlzLWludGVybmFsLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3Qta2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LXBpZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LXNhcC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LXRvLWFycmF5LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vd24ta2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fcGFyc2UtaW50LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19wZXJmb3JtLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19wcm9taXNlLXJlc29sdmUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3Byb3BlcnR5LWRlc2MuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3JlZGVmaW5lLWFsbC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fcmVkZWZpbmUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3NldC1zcGVjaWVzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zZXQtdG8tc3RyaW5nLXRhZy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fc2hhcmVkLWtleS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fc2hhcmVkLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zcGVjaWVzLWNvbnN0cnVjdG9yLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zdHJpbmctYXQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3N0cmluZy10cmltLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zdHJpbmctd3MuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3Rhc2suanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3RvLWFic29sdXRlLWluZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL190by1pbnRlZ2VyLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL190by1pb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL190by1sZW5ndGguanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3RvLW9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fdG8tcHJpbWl0aXZlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL191aWQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3VzZXItYWdlbnQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3drcy1kZWZpbmUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3drcy1leHQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3drcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LmFycmF5LmZyb20uanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LmFycmF5LmlzLWFycmF5LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5hcnJheS5pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuZGF0ZS5ub3cuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5kZWZpbmUtcHJvcGVydGllcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmRlZmluZS1wcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmdldC1vd24tcHJvcGVydHktZGVzY3JpcHRvci5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmtleXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LnBhcnNlLWludC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYucHJvbWlzZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5zeW1ib2wuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM3Lm9iamVjdC5nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3JzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNy5vYmplY3QudmFsdWVzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNy5wcm9taXNlLmZpbmFsbHkuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM3LnByb21pc2UudHJ5LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNy5zeW1ib2wuYXN5bmMtaXRlcmF0b3IuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM3LnN5bWJvbC5vYnNlcnZhYmxlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUuanMiLCJub2RlX21vZHVsZXMvZ3JvdXAtYnkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvb2JqZWN0LXBhdGgvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcHNldWRvLXdvcmtlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wc2V1ZG8td29ya2VyL3BvbHlmaWxsLmpzIiwibm9kZV9tb2R1bGVzL3RvLWZ1bmN0aW9uL2luZGV4LmpzIiwic3JjL2FkYXB0ZXJzL2luZGV4LmpzIiwic3JjL2FkYXB0ZXJzL2lubWVtb3J5LmpzIiwic3JjL2FkYXB0ZXJzL2xvY2Fsc3RvcmFnZS5qcyIsInNyYy9jaGFubmVsLmpzIiwic3JjL2NvbmZpZy5qcyIsInNyYy9jb25zb2xlLmpzIiwic3JjL2NvbnRhaW5lci5qcyIsInNyYy9lbnVtL2NvbmZpZy5kYXRhLmpzIiwic3JjL2VudW0vbG9nLmV2ZW50cy5qcyIsInNyYy9ldmVudC5qcyIsInNyYy9oZWxwZXJzLmpzIiwic3JjL2luZGV4LmpzIiwic3JjL3F1ZXVlLmpzIiwic3JjL3N0b3JhZ2UtY2Fwc3VsZS5qcyIsInNyYy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQ0FBOztBQ0FBOztBQ0FBOztBQ0FBOztBQ0FBOztBQ0FBOztBQ0FBOztBQ0FBOztBQ0FBOztBQ0FBOztBQ0FBOztBQ0FBOztBQ0FBOztBQ0FBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNXVCQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBOztBQ0RBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBOztBQ0RBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQy9TQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUM5S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUtBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPO0FBQ0UsZUFBQSxRQUFBLENBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxDQUFBLE9BQUEsWUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLFNBQUEsQ0FBQSxTQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQSxDQUFBLFFBQUEsU0FBQSxDQUFBLElBQUEsR0FBQSxTQUFBLENBQUEsSUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNFLGdCQUFBLFlBQVksQ0FBWixPQUFBLENBQXFCLEtBQUEsV0FBQSxDQUFyQixHQUFxQixDQUFyQixFQUE0QyxDQUFBLEdBQUEsVUFBQSxDQUFBLFNBQUEsQ0FBQSxFQUE1QyxLQUE0QyxDQUE1QyxFQURGLE9BQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBO0FBQUEsZ0JBQUEsS0FBQSxDQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsT0FBQSxTQUFBLENBQUEsSUFBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQSxRQUFBLEVBQUEsSUFBQSxDQUFBLEM7OztBQUtBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTztBQUNFLGVBQUEsUUFBQSxDQUFBLEdBQUEsRUFBQSxDQUFBLE9BQUEsWUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLFNBQUEsQ0FBQSxTQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQSxDQUFBLFFBQUEsU0FBQSxDQUFBLElBQUEsR0FBQSxTQUFBLENBQUEsSUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUFBLE9BQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBO0FBQ1MsZ0JBQUEsTUFBTSxDQUFOLFNBQUEsQ0FBQSxjQUFBLENBQUEsSUFBQSxDQUFBLFlBQUEsRUFBbUQsS0FBQSxXQUFBLENBRDVELEdBQzRELENBQW5ELENBRFQsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEtBQUEsS0FB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U0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsUUFBQSxFQUFBLElBQUEsQ0FBQSxDOzs7QUFJQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPO0FBQ0UsZUFBQSxRQUFBLEdBQUEsQ0FBQSxPQUFBLFlBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxTQUFBLENBQUEsU0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLEVBQUEsQ0FBQSxRQUFBLFNBQUEsQ0FBQSxJQUFBLEdBQUEsU0FBQSxDQUFBLElBQUEsR0FBQSxLQUFBLENBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxHQUFBLENBQUEsQ0FBQTtBQUNnQixrQkFBQSxRQUFBLENBQUEsc0JBQUEsQ0FBQSxJQUFBLENBRGhCLElBQ2dCLENBRGhCLEVBQUEsS0FBQSxDQUFBLENBQUEsT0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsRUFBQSxTQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEtBQUEsS0FBQSxDQUFBLE9BQUEsU0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsUUFBQSxFQUFBLElBQUEsQ0FBQSxDOzs7QUFJQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE87QUFDRSxlQUFBLFFBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxPQUFBLFlBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxTQUFBLENBQUEsU0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLEVBQUEsQ0FBQSxRQUFBLFNBQUEsQ0FBQSxJQUFBLEdBQUEsU0FBQSxDQUFBLElBQUEsR0FBQSxLQUFBLENBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxHQUFBLENBQUEsQ0FBQTtBQUNnQixrQkFBQSxRQUFBLENBQUEsc0JBQUEsQ0FBQSxJQUFBLENBRGhCLElBQ2dCLENBRGhCLEVBQUEsS0FBQSxDQUFBLENBQUEsT0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsRUFBQSxTQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FDMEQsVUFBQSxDQUFBLEVBQUEsQ0FBQSxPQUFPLENBQUMsQ0FBRCxHQUFBLEtBQVAsR0FBQSxDQUQxRCxDQUFBLEVBQUEsTUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsT0FBQSxTQUFBLENBQUEsSUFBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQSxRQUFBLEVBQUEsSUFBQSxDQUFBLEM7OztBQUlBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE87QUFDRSxlQUFBLFFBQUEsR0FBQSxDQUFBLE9BQUEsWUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLFNBQUEsQ0FBQSxTQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQSxDQUFBLFFBQUEsU0FBQSxDQUFBLElBQUEsR0FBQSxTQUFBLENBQUEsSUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ08scUJBRFAsSUFDTyxFQURQLEVBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxHQUFBLENBQUEsQ0FBQSxNQUFBLFFBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLEVBQUEsS0FBQSxDQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsR0FBQSxDQUFBLENBQUE7QUFFUSx1QkFBQSxPQUFBLENBQUEsS0FBQSxDQUFtQixLQUYzQixJQUUyQixFQUFuQixDQUZSLEVBQUEsS0FBQSxDQUFBLENBQUEsT0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLFFBQUE7QUFBQSxvQkFBQSxDQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsT0FBQSxTQUFBLENBQUEsSUFBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQSxRQUFBLEVBQUEsSUFBQSxDQUFBLEM7OztBQU1BO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTztBQUNFLGVBQUEsUUFBQSxDQUFBLEdBQUEsRUFBQSxDQUFBLElBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLENBQUEsT0FBQSxZQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsU0FBQSxDQUFBLFNBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFBLENBQUEsUUFBQSxTQUFBLENBQUEsSUFBQSxHQUFBLFNBQUEsQ0FBQSxJQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ1EsZ0JBQUEsSUFEUixHQUFBLElBQ1EsQ0FEUixTQUFBLENBQUEsSUFBQSxHQUFBLENBQUEsQ0FBQTtBQUVxQixrQkFBQSxRQUFBLENBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLEVBRnJCLEdBRXFCLEVBRnJCLEVBQUEsS0FBQSxDQUFBLENBRVEsSUFGUixHQUFBLFNBQUEsQ0FBQSxJQUVRO0FBQ0EsZ0JBQUEsT0FIUixHQUdrQixJQUFJLENBQUosTUFBQSxDQUFZLE1BQUEsQ0FBQSxjQUFBLENBQUEsSUFBQSxDQUFaLEdBQVksQ0FBWixFQUFBLEdBQUEsRUFBQSxhQUFBLFlBQUEsQ0FBQSxJQUFBLElBQUEsR0FBQSxpQkFBQSxFQUFBLGFBQUEsWUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMEMsU0FBQSxRQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsSUFBQSxNQUFBLENBQUEsT0FBQSxZQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsU0FBQSxDQUFBLFNBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFBLENBQUEsUUFBQSxTQUFBLENBQUEsSUFBQSxHQUFBLFNBQUEsQ0FBQSxJQUFBLEdBQUEsS0FBQSxDQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsR0FBQSxDQUFBLENBQUE7QUFDbkMsOEJBQUEsUUFBQSxDQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxFQUFBLFFBQUEsRUFBcUIsQ0FBQyxDQURhLEdBQ25DLENBRG1DLEVBQUEsS0FBQSxDQUFBLENBQ2xELE1BRGtELEdBQUEsU0FBQSxDQUFBLElBQ2xELENBRGtELE9BQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBO0FBQUEsNEJBQUEsTUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsT0FBQSxTQUFBLENBQUEsSUFBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQSxRQUFBLENBQUEsQ0FBMUMsQ0FBQSxDQUFBLENBQUEsQ0FBQSxPQUFBLFVBQUEsR0FBQSxFQUFBLENBQUEsT0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQSxDQUFBLENBSGxCLENBR2tCLEVBQUEsQ0FBVixDQUhSLFNBQUEsQ0FBQSxJQUFBLEdBQUEsQ0FBQSxDQUFBOztBQU9RLGtCQUFBLFFBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxHQUFBLENBUFIsT0FPUSxDQVBSLEVBQUEsS0FBQSxDQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsT0FBQSxTQUFBLENBQUEsSUFBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQSxRQUFBLEVBQUEsSUFBQSxDQUFBLEM7OztBQVVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTztBQUNFLGVBQUEsU0FBQSxDQUFBLEVBQUEsRUFBQSxDQUFBLE9BQUEsWUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLFVBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQSxDQUFBLFFBQUEsVUFBQSxDQUFBLElBQUEsR0FBQSxVQUFBLENBQUEsSUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ2dCLGtCQUFBLFFBQUEsQ0FBQSxzQkFBQSxDQUFBLElBQUEsQ0FEaEIsSUFDZ0IsQ0FEaEIsRUFBQSxLQUFBLENBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxHQUFBLFVBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUM2RCxVQUFBLENBQUEsRUFBQSxDQUFBLE9BQU8sQ0FBQyxDQUFELEdBQUEsS0FBUCxFQUFBLENBRDdELENBQUEsQ0FBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLEdBQ29GLENBRHBGLENBQUEsQ0FBQSxPQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxFQUFBLFVBQUEsQ0FBQSxFQUFBLEdBQUEsVUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEtBQUEsS0FBQSxDQUFBLE9BQUEsVUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsU0FBQSxFQUFBLElBQUEsQ0FBQSxDOzs7QUFJQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE87QUFDRSxlQUFBLFNBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxPQUFBLFlBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxVQUFBLENBQUEsVUFBQSxFQUFBLENBQUEsT0FBQSxDQUFBLEVBQUEsQ0FBQSxRQUFBLFVBQUEsQ0FBQSxJQUFBLEdBQUEsVUFBQSxDQUFBLElBQUEsR0FBQSxLQUFBLENBQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxHQUFBLENBQUEsQ0FBQTtBQUNnQixrQkFBQSxRQUFBLENBQUEsc0JBQUEsQ0FBQSxJQUFBLENBRGhCLElBQ2dCLENBRGhCLEVBQUEsS0FBQSxDQUFBLENBQUEsVUFBQSxDQUFBLEVBQUEsR0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FDNkQsVUFBQSxDQUFBLEVBQUEsQ0FBQSxPQUFPLENBQUMsQ0FBRCxHQUFBLEtBQVAsR0FBQSxDQUQ3RCxDQUFBLENBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxHQUNxRixDQURyRixDQUFBLENBQUEsT0FBQSxVQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsRUFBQSxVQUFBLENBQUEsRUFBQSxHQUFBLFVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQSxPQUFBLFVBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FB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LENBQUEsRUFBdUM7QUFDNUMsU0FBTyxDQUFDLENBQUQsU0FBQSxHQUFjLENBQUMsQ0FBdEIsU0FBQTtBQUNEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL2FycmF5L2Zyb21cIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL2FycmF5L2lzLWFycmF5XCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9kYXRlL25vd1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vanNvbi9zdHJpbmdpZnlcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9kZWZpbmUtcHJvcGVydGllc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2RlZmluZS1wcm9wZXJ0eVwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2dldC1vd24tcHJvcGVydHktZGVzY3JpcHRvclwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2dldC1vd24tcHJvcGVydHktZGVzY3JpcHRvcnNcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9nZXQtb3duLXByb3BlcnR5LXN5bWJvbHNcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9rZXlzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvdmFsdWVzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9wYXJzZS1pbnRcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL3Byb21pc2VcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL3N5bWJvbFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vc3ltYm9sL2l0ZXJhdG9yXCIpOyIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxudmFyIHJ1bnRpbWUgPSAoZnVuY3Rpb24gKGV4cG9ydHMpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIE9wID0gT2JqZWN0LnByb3RvdHlwZTtcbiAgdmFyIGhhc093biA9IE9wLmhhc093blByb3BlcnR5O1xuICB2YXIgdW5kZWZpbmVkOyAvLyBNb3JlIGNvbXByZXNzaWJsZSB0aGFuIHZvaWQgMC5cbiAgdmFyICRTeW1ib2wgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgPyBTeW1ib2wgOiB7fTtcbiAgdmFyIGl0ZXJhdG9yU3ltYm9sID0gJFN5bWJvbC5pdGVyYXRvciB8fCBcIkBAaXRlcmF0b3JcIjtcbiAgdmFyIGFzeW5jSXRlcmF0b3JTeW1ib2wgPSAkU3ltYm9sLmFzeW5jSXRlcmF0b3IgfHwgXCJAQGFzeW5jSXRlcmF0b3JcIjtcbiAgdmFyIHRvU3RyaW5nVGFnU3ltYm9sID0gJFN5bWJvbC50b1N0cmluZ1RhZyB8fCBcIkBAdG9TdHJpbmdUYWdcIjtcblxuICBmdW5jdGlvbiBkZWZpbmUob2JqLCBrZXksIHZhbHVlKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7XG4gICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9KTtcbiAgICByZXR1cm4gb2JqW2tleV07XG4gIH1cbiAgdHJ5IHtcbiAgICAvLyBJRSA4IGhhcyBhIGJyb2tlbiBPYmplY3QuZGVmaW5lUHJvcGVydHkgdGhhdCBvbmx5IHdvcmtzIG9uIERPTSBvYmplY3RzLlxuICAgIGRlZmluZSh7fSwgXCJcIik7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGRlZmluZSA9IGZ1bmN0aW9uKG9iaiwga2V5LCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIG9ialtrZXldID0gdmFsdWU7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBJZiBvdXRlckZuIHByb3ZpZGVkIGFuZCBvdXRlckZuLnByb3RvdHlwZSBpcyBhIEdlbmVyYXRvciwgdGhlbiBvdXRlckZuLnByb3RvdHlwZSBpbnN0YW5jZW9mIEdlbmVyYXRvci5cbiAgICB2YXIgcHJvdG9HZW5lcmF0b3IgPSBvdXRlckZuICYmIG91dGVyRm4ucHJvdG90eXBlIGluc3RhbmNlb2YgR2VuZXJhdG9yID8gb3V0ZXJGbiA6IEdlbmVyYXRvcjtcbiAgICB2YXIgZ2VuZXJhdG9yID0gT2JqZWN0LmNyZWF0ZShwcm90b0dlbmVyYXRvci5wcm90b3R5cGUpO1xuICAgIHZhciBjb250ZXh0ID0gbmV3IENvbnRleHQodHJ5TG9jc0xpc3QgfHwgW10pO1xuXG4gICAgLy8gVGhlIC5faW52b2tlIG1ldGhvZCB1bmlmaWVzIHRoZSBpbXBsZW1lbnRhdGlvbnMgb2YgdGhlIC5uZXh0LFxuICAgIC8vIC50aHJvdywgYW5kIC5yZXR1cm4gbWV0aG9kcy5cbiAgICBnZW5lcmF0b3IuX2ludm9rZSA9IG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCk7XG5cbiAgICByZXR1cm4gZ2VuZXJhdG9yO1xuICB9XG4gIGV4cG9ydHMud3JhcCA9IHdyYXA7XG5cbiAgLy8gVHJ5L2NhdGNoIGhlbHBlciB0byBtaW5pbWl6ZSBkZW9wdGltaXphdGlvbnMuIFJldHVybnMgYSBjb21wbGV0aW9uXG4gIC8vIHJlY29yZCBsaWtlIGNvbnRleHQudHJ5RW50cmllc1tpXS5jb21wbGV0aW9uLiBUaGlzIGludGVyZmFjZSBjb3VsZFxuICAvLyBoYXZlIGJlZW4gKGFuZCB3YXMgcHJldmlvdXNseSkgZGVzaWduZWQgdG8gdGFrZSBhIGNsb3N1cmUgdG8gYmVcbiAgLy8gaW52b2tlZCB3aXRob3V0IGFyZ3VtZW50cywgYnV0IGluIGFsbCB0aGUgY2FzZXMgd2UgY2FyZSBhYm91dCB3ZVxuICAvLyBhbHJlYWR5IGhhdmUgYW4gZXhpc3RpbmcgbWV0aG9kIHdlIHdhbnQgdG8gY2FsbCwgc28gdGhlcmUncyBubyBuZWVkXG4gIC8vIHRvIGNyZWF0ZSBhIG5ldyBmdW5jdGlvbiBvYmplY3QuIFdlIGNhbiBldmVuIGdldCBhd2F5IHdpdGggYXNzdW1pbmdcbiAgLy8gdGhlIG1ldGhvZCB0YWtlcyBleGFjdGx5IG9uZSBhcmd1bWVudCwgc2luY2UgdGhhdCBoYXBwZW5zIHRvIGJlIHRydWVcbiAgLy8gaW4gZXZlcnkgY2FzZSwgc28gd2UgZG9uJ3QgaGF2ZSB0byB0b3VjaCB0aGUgYXJndW1lbnRzIG9iamVjdC4gVGhlXG4gIC8vIG9ubHkgYWRkaXRpb25hbCBhbGxvY2F0aW9uIHJlcXVpcmVkIGlzIHRoZSBjb21wbGV0aW9uIHJlY29yZCwgd2hpY2hcbiAgLy8gaGFzIGEgc3RhYmxlIHNoYXBlIGFuZCBzbyBob3BlZnVsbHkgc2hvdWxkIGJlIGNoZWFwIHRvIGFsbG9jYXRlLlxuICBmdW5jdGlvbiB0cnlDYXRjaChmbiwgb2JqLCBhcmcpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJub3JtYWxcIiwgYXJnOiBmbi5jYWxsKG9iaiwgYXJnKSB9O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJ0aHJvd1wiLCBhcmc6IGVyciB9O1xuICAgIH1cbiAgfVxuXG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0ID0gXCJzdXNwZW5kZWRTdGFydFwiO1xuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRZaWVsZCA9IFwic3VzcGVuZGVkWWllbGRcIjtcbiAgdmFyIEdlblN0YXRlRXhlY3V0aW5nID0gXCJleGVjdXRpbmdcIjtcbiAgdmFyIEdlblN0YXRlQ29tcGxldGVkID0gXCJjb21wbGV0ZWRcIjtcblxuICAvLyBSZXR1cm5pbmcgdGhpcyBvYmplY3QgZnJvbSB0aGUgaW5uZXJGbiBoYXMgdGhlIHNhbWUgZWZmZWN0IGFzXG4gIC8vIGJyZWFraW5nIG91dCBvZiB0aGUgZGlzcGF0Y2ggc3dpdGNoIHN0YXRlbWVudC5cbiAgdmFyIENvbnRpbnVlU2VudGluZWwgPSB7fTtcblxuICAvLyBEdW1teSBjb25zdHJ1Y3RvciBmdW5jdGlvbnMgdGhhdCB3ZSB1c2UgYXMgdGhlIC5jb25zdHJ1Y3RvciBhbmRcbiAgLy8gLmNvbnN0cnVjdG9yLnByb3RvdHlwZSBwcm9wZXJ0aWVzIGZvciBmdW5jdGlvbnMgdGhhdCByZXR1cm4gR2VuZXJhdG9yXG4gIC8vIG9iamVjdHMuIEZvciBmdWxsIHNwZWMgY29tcGxpYW5jZSwgeW91IG1heSB3aXNoIHRvIGNvbmZpZ3VyZSB5b3VyXG4gIC8vIG1pbmlmaWVyIG5vdCB0byBtYW5nbGUgdGhlIG5hbWVzIG9mIHRoZXNlIHR3byBmdW5jdGlvbnMuXG4gIGZ1bmN0aW9uIEdlbmVyYXRvcigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUoKSB7fVxuXG4gIC8vIFRoaXMgaXMgYSBwb2x5ZmlsbCBmb3IgJUl0ZXJhdG9yUHJvdG90eXBlJSBmb3IgZW52aXJvbm1lbnRzIHRoYXRcbiAgLy8gZG9uJ3QgbmF0aXZlbHkgc3VwcG9ydCBpdC5cbiAgdmFyIEl0ZXJhdG9yUHJvdG90eXBlID0ge307XG4gIEl0ZXJhdG9yUHJvdG90eXBlW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB2YXIgZ2V0UHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Y7XG4gIHZhciBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSA9IGdldFByb3RvICYmIGdldFByb3RvKGdldFByb3RvKHZhbHVlcyhbXSkpKTtcbiAgaWYgKE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlICYmXG4gICAgICBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSAhPT0gT3AgJiZcbiAgICAgIGhhc093bi5jYWxsKE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlLCBpdGVyYXRvclN5bWJvbCkpIHtcbiAgICAvLyBUaGlzIGVudmlyb25tZW50IGhhcyBhIG5hdGl2ZSAlSXRlcmF0b3JQcm90b3R5cGUlOyB1c2UgaXQgaW5zdGVhZFxuICAgIC8vIG9mIHRoZSBwb2x5ZmlsbC5cbiAgICBJdGVyYXRvclByb3RvdHlwZSA9IE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlO1xuICB9XG5cbiAgdmFyIEdwID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUucHJvdG90eXBlID1cbiAgICBHZW5lcmF0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShJdGVyYXRvclByb3RvdHlwZSk7XG4gIEdlbmVyYXRvckZ1bmN0aW9uLnByb3RvdHlwZSA9IEdwLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb247XG4gIEdlbmVyYXRvckZ1bmN0aW9uLmRpc3BsYXlOYW1lID0gZGVmaW5lKFxuICAgIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLFxuICAgIHRvU3RyaW5nVGFnU3ltYm9sLFxuICAgIFwiR2VuZXJhdG9yRnVuY3Rpb25cIlxuICApO1xuXG4gIC8vIEhlbHBlciBmb3IgZGVmaW5pbmcgdGhlIC5uZXh0LCAudGhyb3csIGFuZCAucmV0dXJuIG1ldGhvZHMgb2YgdGhlXG4gIC8vIEl0ZXJhdG9yIGludGVyZmFjZSBpbiB0ZXJtcyBvZiBhIHNpbmdsZSAuX2ludm9rZSBtZXRob2QuXG4gIGZ1bmN0aW9uIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhwcm90b3R5cGUpIHtcbiAgICBbXCJuZXh0XCIsIFwidGhyb3dcIiwgXCJyZXR1cm5cIl0uZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgIGRlZmluZShwcm90b3R5cGUsIG1ldGhvZCwgZnVuY3Rpb24oYXJnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbnZva2UobWV0aG9kLCBhcmcpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBleHBvcnRzLmlzR2VuZXJhdG9yRnVuY3Rpb24gPSBmdW5jdGlvbihnZW5GdW4pIHtcbiAgICB2YXIgY3RvciA9IHR5cGVvZiBnZW5GdW4gPT09IFwiZnVuY3Rpb25cIiAmJiBnZW5GdW4uY29uc3RydWN0b3I7XG4gICAgcmV0dXJuIGN0b3JcbiAgICAgID8gY3RvciA9PT0gR2VuZXJhdG9yRnVuY3Rpb24gfHxcbiAgICAgICAgLy8gRm9yIHRoZSBuYXRpdmUgR2VuZXJhdG9yRnVuY3Rpb24gY29uc3RydWN0b3IsIHRoZSBiZXN0IHdlIGNhblxuICAgICAgICAvLyBkbyBpcyB0byBjaGVjayBpdHMgLm5hbWUgcHJvcGVydHkuXG4gICAgICAgIChjdG9yLmRpc3BsYXlOYW1lIHx8IGN0b3IubmFtZSkgPT09IFwiR2VuZXJhdG9yRnVuY3Rpb25cIlxuICAgICAgOiBmYWxzZTtcbiAgfTtcblxuICBleHBvcnRzLm1hcmsgPSBmdW5jdGlvbihnZW5GdW4pIHtcbiAgICBpZiAoT2JqZWN0LnNldFByb3RvdHlwZU9mKSB7XG4gICAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YoZ2VuRnVuLCBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdlbkZ1bi5fX3Byb3RvX18gPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgICAgIGRlZmluZShnZW5GdW4sIHRvU3RyaW5nVGFnU3ltYm9sLCBcIkdlbmVyYXRvckZ1bmN0aW9uXCIpO1xuICAgIH1cbiAgICBnZW5GdW4ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShHcCk7XG4gICAgcmV0dXJuIGdlbkZ1bjtcbiAgfTtcblxuICAvLyBXaXRoaW4gdGhlIGJvZHkgb2YgYW55IGFzeW5jIGZ1bmN0aW9uLCBgYXdhaXQgeGAgaXMgdHJhbnNmb3JtZWQgdG9cbiAgLy8gYHlpZWxkIHJlZ2VuZXJhdG9yUnVudGltZS5hd3JhcCh4KWAsIHNvIHRoYXQgdGhlIHJ1bnRpbWUgY2FuIHRlc3RcbiAgLy8gYGhhc093bi5jYWxsKHZhbHVlLCBcIl9fYXdhaXRcIilgIHRvIGRldGVybWluZSBpZiB0aGUgeWllbGRlZCB2YWx1ZSBpc1xuICAvLyBtZWFudCB0byBiZSBhd2FpdGVkLlxuICBleHBvcnRzLmF3cmFwID0gZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIHsgX19hd2FpdDogYXJnIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gQXN5bmNJdGVyYXRvcihnZW5lcmF0b3IsIFByb21pc2VJbXBsKSB7XG4gICAgZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnLCByZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChnZW5lcmF0b3JbbWV0aG9kXSwgZ2VuZXJhdG9yLCBhcmcpO1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgcmVqZWN0KHJlY29yZC5hcmcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHJlY29yZC5hcmc7XG4gICAgICAgIHZhciB2YWx1ZSA9IHJlc3VsdC52YWx1ZTtcbiAgICAgICAgaWYgKHZhbHVlICYmXG4gICAgICAgICAgICB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKHZhbHVlLCBcIl9fYXdhaXRcIikpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZUltcGwucmVzb2x2ZSh2YWx1ZS5fX2F3YWl0KS50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICBpbnZva2UoXCJuZXh0XCIsIHZhbHVlLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgaW52b2tlKFwidGhyb3dcIiwgZXJyLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFByb21pc2VJbXBsLnJlc29sdmUodmFsdWUpLnRoZW4oZnVuY3Rpb24odW53cmFwcGVkKSB7XG4gICAgICAgICAgLy8gV2hlbiBhIHlpZWxkZWQgUHJvbWlzZSBpcyByZXNvbHZlZCwgaXRzIGZpbmFsIHZhbHVlIGJlY29tZXNcbiAgICAgICAgICAvLyB0aGUgLnZhbHVlIG9mIHRoZSBQcm9taXNlPHt2YWx1ZSxkb25lfT4gcmVzdWx0IGZvciB0aGVcbiAgICAgICAgICAvLyBjdXJyZW50IGl0ZXJhdGlvbi5cbiAgICAgICAgICByZXN1bHQudmFsdWUgPSB1bndyYXBwZWQ7XG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgIC8vIElmIGEgcmVqZWN0ZWQgUHJvbWlzZSB3YXMgeWllbGRlZCwgdGhyb3cgdGhlIHJlamVjdGlvbiBiYWNrXG4gICAgICAgICAgLy8gaW50byB0aGUgYXN5bmMgZ2VuZXJhdG9yIGZ1bmN0aW9uIHNvIGl0IGNhbiBiZSBoYW5kbGVkIHRoZXJlLlxuICAgICAgICAgIHJldHVybiBpbnZva2UoXCJ0aHJvd1wiLCBlcnJvciwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHByZXZpb3VzUHJvbWlzZTtcblxuICAgIGZ1bmN0aW9uIGVucXVldWUobWV0aG9kLCBhcmcpIHtcbiAgICAgIGZ1bmN0aW9uIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2VJbXBsKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgIGludm9rZShtZXRob2QsIGFyZywgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwcmV2aW91c1Byb21pc2UgPVxuICAgICAgICAvLyBJZiBlbnF1ZXVlIGhhcyBiZWVuIGNhbGxlZCBiZWZvcmUsIHRoZW4gd2Ugd2FudCB0byB3YWl0IHVudGlsXG4gICAgICAgIC8vIGFsbCBwcmV2aW91cyBQcm9taXNlcyBoYXZlIGJlZW4gcmVzb2x2ZWQgYmVmb3JlIGNhbGxpbmcgaW52b2tlLFxuICAgICAgICAvLyBzbyB0aGF0IHJlc3VsdHMgYXJlIGFsd2F5cyBkZWxpdmVyZWQgaW4gdGhlIGNvcnJlY3Qgb3JkZXIuIElmXG4gICAgICAgIC8vIGVucXVldWUgaGFzIG5vdCBiZWVuIGNhbGxlZCBiZWZvcmUsIHRoZW4gaXQgaXMgaW1wb3J0YW50IHRvXG4gICAgICAgIC8vIGNhbGwgaW52b2tlIGltbWVkaWF0ZWx5LCB3aXRob3V0IHdhaXRpbmcgb24gYSBjYWxsYmFjayB0byBmaXJlLFxuICAgICAgICAvLyBzbyB0aGF0IHRoZSBhc3luYyBnZW5lcmF0b3IgZnVuY3Rpb24gaGFzIHRoZSBvcHBvcnR1bml0eSB0byBkb1xuICAgICAgICAvLyBhbnkgbmVjZXNzYXJ5IHNldHVwIGluIGEgcHJlZGljdGFibGUgd2F5LiBUaGlzIHByZWRpY3RhYmlsaXR5XG4gICAgICAgIC8vIGlzIHdoeSB0aGUgUHJvbWlzZSBjb25zdHJ1Y3RvciBzeW5jaHJvbm91c2x5IGludm9rZXMgaXRzXG4gICAgICAgIC8vIGV4ZWN1dG9yIGNhbGxiYWNrLCBhbmQgd2h5IGFzeW5jIGZ1bmN0aW9ucyBzeW5jaHJvbm91c2x5XG4gICAgICAgIC8vIGV4ZWN1dGUgY29kZSBiZWZvcmUgdGhlIGZpcnN0IGF3YWl0LiBTaW5jZSB3ZSBpbXBsZW1lbnQgc2ltcGxlXG4gICAgICAgIC8vIGFzeW5jIGZ1bmN0aW9ucyBpbiB0ZXJtcyBvZiBhc3luYyBnZW5lcmF0b3JzLCBpdCBpcyBlc3BlY2lhbGx5XG4gICAgICAgIC8vIGltcG9ydGFudCB0byBnZXQgdGhpcyByaWdodCwgZXZlbiB0aG91Z2ggaXQgcmVxdWlyZXMgY2FyZS5cbiAgICAgICAgcHJldmlvdXNQcm9taXNlID8gcHJldmlvdXNQcm9taXNlLnRoZW4oXG4gICAgICAgICAgY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcsXG4gICAgICAgICAgLy8gQXZvaWQgcHJvcGFnYXRpbmcgZmFpbHVyZXMgdG8gUHJvbWlzZXMgcmV0dXJuZWQgYnkgbGF0ZXJcbiAgICAgICAgICAvLyBpbnZvY2F0aW9ucyBvZiB0aGUgaXRlcmF0b3IuXG4gICAgICAgICAgY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmdcbiAgICAgICAgKSA6IGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnKCk7XG4gICAgfVxuXG4gICAgLy8gRGVmaW5lIHRoZSB1bmlmaWVkIGhlbHBlciBtZXRob2QgdGhhdCBpcyB1c2VkIHRvIGltcGxlbWVudCAubmV4dCxcbiAgICAvLyAudGhyb3csIGFuZCAucmV0dXJuIChzZWUgZGVmaW5lSXRlcmF0b3JNZXRob2RzKS5cbiAgICB0aGlzLl9pbnZva2UgPSBlbnF1ZXVlO1xuICB9XG5cbiAgZGVmaW5lSXRlcmF0b3JNZXRob2RzKEFzeW5jSXRlcmF0b3IucHJvdG90eXBlKTtcbiAgQXN5bmNJdGVyYXRvci5wcm90b3R5cGVbYXN5bmNJdGVyYXRvclN5bWJvbF0gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIGV4cG9ydHMuQXN5bmNJdGVyYXRvciA9IEFzeW5jSXRlcmF0b3I7XG5cbiAgLy8gTm90ZSB0aGF0IHNpbXBsZSBhc3luYyBmdW5jdGlvbnMgYXJlIGltcGxlbWVudGVkIG9uIHRvcCBvZlxuICAvLyBBc3luY0l0ZXJhdG9yIG9iamVjdHM7IHRoZXkganVzdCByZXR1cm4gYSBQcm9taXNlIGZvciB0aGUgdmFsdWUgb2ZcbiAgLy8gdGhlIGZpbmFsIHJlc3VsdCBwcm9kdWNlZCBieSB0aGUgaXRlcmF0b3IuXG4gIGV4cG9ydHMuYXN5bmMgPSBmdW5jdGlvbihpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCwgUHJvbWlzZUltcGwpIHtcbiAgICBpZiAoUHJvbWlzZUltcGwgPT09IHZvaWQgMCkgUHJvbWlzZUltcGwgPSBQcm9taXNlO1xuXG4gICAgdmFyIGl0ZXIgPSBuZXcgQXN5bmNJdGVyYXRvcihcbiAgICAgIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpLFxuICAgICAgUHJvbWlzZUltcGxcbiAgICApO1xuXG4gICAgcmV0dXJuIGV4cG9ydHMuaXNHZW5lcmF0b3JGdW5jdGlvbihvdXRlckZuKVxuICAgICAgPyBpdGVyIC8vIElmIG91dGVyRm4gaXMgYSBnZW5lcmF0b3IsIHJldHVybiB0aGUgZnVsbCBpdGVyYXRvci5cbiAgICAgIDogaXRlci5uZXh0KCkudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0LmRvbmUgPyByZXN1bHQudmFsdWUgOiBpdGVyLm5leHQoKTtcbiAgICAgICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gbWFrZUludm9rZU1ldGhvZChpbm5lckZuLCBzZWxmLCBjb250ZXh0KSB7XG4gICAgdmFyIHN0YXRlID0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydDtcblxuICAgIHJldHVybiBmdW5jdGlvbiBpbnZva2UobWV0aG9kLCBhcmcpIHtcbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVFeGVjdXRpbmcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgcnVubmluZ1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZUNvbXBsZXRlZCkge1xuICAgICAgICBpZiAobWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICB0aHJvdyBhcmc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBCZSBmb3JnaXZpbmcsIHBlciAyNS4zLjMuMy4zIG9mIHRoZSBzcGVjOlxuICAgICAgICAvLyBodHRwczovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtZ2VuZXJhdG9ycmVzdW1lXG4gICAgICAgIHJldHVybiBkb25lUmVzdWx0KCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnRleHQubWV0aG9kID0gbWV0aG9kO1xuICAgICAgY29udGV4dC5hcmcgPSBhcmc7XG5cbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHZhciBkZWxlZ2F0ZSA9IGNvbnRleHQuZGVsZWdhdGU7XG4gICAgICAgIGlmIChkZWxlZ2F0ZSkge1xuICAgICAgICAgIHZhciBkZWxlZ2F0ZVJlc3VsdCA9IG1heWJlSW52b2tlRGVsZWdhdGUoZGVsZWdhdGUsIGNvbnRleHQpO1xuICAgICAgICAgIGlmIChkZWxlZ2F0ZVJlc3VsdCkge1xuICAgICAgICAgICAgaWYgKGRlbGVnYXRlUmVzdWx0ID09PSBDb250aW51ZVNlbnRpbmVsKSBjb250aW51ZTtcbiAgICAgICAgICAgIHJldHVybiBkZWxlZ2F0ZVJlc3VsdDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgICAgLy8gU2V0dGluZyBjb250ZXh0Ll9zZW50IGZvciBsZWdhY3kgc3VwcG9ydCBvZiBCYWJlbCdzXG4gICAgICAgICAgLy8gZnVuY3Rpb24uc2VudCBpbXBsZW1lbnRhdGlvbi5cbiAgICAgICAgICBjb250ZXh0LnNlbnQgPSBjb250ZXh0Ll9zZW50ID0gY29udGV4dC5hcmc7XG5cbiAgICAgICAgfSBlbHNlIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0KSB7XG4gICAgICAgICAgICBzdGF0ZSA9IEdlblN0YXRlQ29tcGxldGVkO1xuICAgICAgICAgICAgdGhyb3cgY29udGV4dC5hcmc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihjb250ZXh0LmFyZyk7XG5cbiAgICAgICAgfSBlbHNlIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICAgIGNvbnRleHQuYWJydXB0KFwicmV0dXJuXCIsIGNvbnRleHQuYXJnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRlID0gR2VuU3RhdGVFeGVjdXRpbmc7XG5cbiAgICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpO1xuICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwibm9ybWFsXCIpIHtcbiAgICAgICAgICAvLyBJZiBhbiBleGNlcHRpb24gaXMgdGhyb3duIGZyb20gaW5uZXJGbiwgd2UgbGVhdmUgc3RhdGUgPT09XG4gICAgICAgICAgLy8gR2VuU3RhdGVFeGVjdXRpbmcgYW5kIGxvb3AgYmFjayBmb3IgYW5vdGhlciBpbnZvY2F0aW9uLlxuICAgICAgICAgIHN0YXRlID0gY29udGV4dC5kb25lXG4gICAgICAgICAgICA/IEdlblN0YXRlQ29tcGxldGVkXG4gICAgICAgICAgICA6IEdlblN0YXRlU3VzcGVuZGVkWWllbGQ7XG5cbiAgICAgICAgICBpZiAocmVjb3JkLmFyZyA9PT0gQ29udGludWVTZW50aW5lbCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiByZWNvcmQuYXJnLFxuICAgICAgICAgICAgZG9uZTogY29udGV4dC5kb25lXG4gICAgICAgICAgfTtcblxuICAgICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICBzdGF0ZSA9IEdlblN0YXRlQ29tcGxldGVkO1xuICAgICAgICAgIC8vIERpc3BhdGNoIHRoZSBleGNlcHRpb24gYnkgbG9vcGluZyBiYWNrIGFyb3VuZCB0byB0aGVcbiAgICAgICAgICAvLyBjb250ZXh0LmRpc3BhdGNoRXhjZXB0aW9uKGNvbnRleHQuYXJnKSBjYWxsIGFib3ZlLlxuICAgICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgICAgIGNvbnRleHQuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvLyBDYWxsIGRlbGVnYXRlLml0ZXJhdG9yW2NvbnRleHQubWV0aG9kXShjb250ZXh0LmFyZykgYW5kIGhhbmRsZSB0aGVcbiAgLy8gcmVzdWx0LCBlaXRoZXIgYnkgcmV0dXJuaW5nIGEgeyB2YWx1ZSwgZG9uZSB9IHJlc3VsdCBmcm9tIHRoZVxuICAvLyBkZWxlZ2F0ZSBpdGVyYXRvciwgb3IgYnkgbW9kaWZ5aW5nIGNvbnRleHQubWV0aG9kIGFuZCBjb250ZXh0LmFyZyxcbiAgLy8gc2V0dGluZyBjb250ZXh0LmRlbGVnYXRlIHRvIG51bGwsIGFuZCByZXR1cm5pbmcgdGhlIENvbnRpbnVlU2VudGluZWwuXG4gIGZ1bmN0aW9uIG1heWJlSW52b2tlRGVsZWdhdGUoZGVsZWdhdGUsIGNvbnRleHQpIHtcbiAgICB2YXIgbWV0aG9kID0gZGVsZWdhdGUuaXRlcmF0b3JbY29udGV4dC5tZXRob2RdO1xuICAgIGlmIChtZXRob2QgPT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gQSAudGhyb3cgb3IgLnJldHVybiB3aGVuIHRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBoYXMgbm8gLnRocm93XG4gICAgICAvLyBtZXRob2QgYWx3YXlzIHRlcm1pbmF0ZXMgdGhlIHlpZWxkKiBsb29wLlxuICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIC8vIE5vdGU6IFtcInJldHVyblwiXSBtdXN0IGJlIHVzZWQgZm9yIEVTMyBwYXJzaW5nIGNvbXBhdGliaWxpdHkuXG4gICAgICAgIGlmIChkZWxlZ2F0ZS5pdGVyYXRvcltcInJldHVyblwiXSkge1xuICAgICAgICAgIC8vIElmIHRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBoYXMgYSByZXR1cm4gbWV0aG9kLCBnaXZlIGl0IGFcbiAgICAgICAgICAvLyBjaGFuY2UgdG8gY2xlYW4gdXAuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInJldHVyblwiO1xuICAgICAgICAgIGNvbnRleHQuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgICAgIG1heWJlSW52b2tlRGVsZWdhdGUoZGVsZWdhdGUsIGNvbnRleHQpO1xuXG4gICAgICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgIC8vIElmIG1heWJlSW52b2tlRGVsZWdhdGUoY29udGV4dCkgY2hhbmdlZCBjb250ZXh0Lm1ldGhvZCBmcm9tXG4gICAgICAgICAgICAvLyBcInJldHVyblwiIHRvIFwidGhyb3dcIiwgbGV0IHRoYXQgb3ZlcnJpZGUgdGhlIFR5cGVFcnJvciBiZWxvdy5cbiAgICAgICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgICBjb250ZXh0LmFyZyA9IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgXCJUaGUgaXRlcmF0b3IgZG9lcyBub3QgcHJvdmlkZSBhICd0aHJvdycgbWV0aG9kXCIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG5cbiAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2gobWV0aG9kLCBkZWxlZ2F0ZS5pdGVyYXRvciwgY29udGV4dC5hcmcpO1xuXG4gICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgY29udGV4dC5hcmcgPSByZWNvcmQuYXJnO1xuICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG5cbiAgICB2YXIgaW5mbyA9IHJlY29yZC5hcmc7XG5cbiAgICBpZiAoISBpbmZvKSB7XG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgIGNvbnRleHQuYXJnID0gbmV3IFR5cGVFcnJvcihcIml0ZXJhdG9yIHJlc3VsdCBpcyBub3QgYW4gb2JqZWN0XCIpO1xuICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG5cbiAgICBpZiAoaW5mby5kb25lKSB7XG4gICAgICAvLyBBc3NpZ24gdGhlIHJlc3VsdCBvZiB0aGUgZmluaXNoZWQgZGVsZWdhdGUgdG8gdGhlIHRlbXBvcmFyeVxuICAgICAgLy8gdmFyaWFibGUgc3BlY2lmaWVkIGJ5IGRlbGVnYXRlLnJlc3VsdE5hbWUgKHNlZSBkZWxlZ2F0ZVlpZWxkKS5cbiAgICAgIGNvbnRleHRbZGVsZWdhdGUucmVzdWx0TmFtZV0gPSBpbmZvLnZhbHVlO1xuXG4gICAgICAvLyBSZXN1bWUgZXhlY3V0aW9uIGF0IHRoZSBkZXNpcmVkIGxvY2F0aW9uIChzZWUgZGVsZWdhdGVZaWVsZCkuXG4gICAgICBjb250ZXh0Lm5leHQgPSBkZWxlZ2F0ZS5uZXh0TG9jO1xuXG4gICAgICAvLyBJZiBjb250ZXh0Lm1ldGhvZCB3YXMgXCJ0aHJvd1wiIGJ1dCB0aGUgZGVsZWdhdGUgaGFuZGxlZCB0aGVcbiAgICAgIC8vIGV4Y2VwdGlvbiwgbGV0IHRoZSBvdXRlciBnZW5lcmF0b3IgcHJvY2VlZCBub3JtYWxseS4gSWZcbiAgICAgIC8vIGNvbnRleHQubWV0aG9kIHdhcyBcIm5leHRcIiwgZm9yZ2V0IGNvbnRleHQuYXJnIHNpbmNlIGl0IGhhcyBiZWVuXG4gICAgICAvLyBcImNvbnN1bWVkXCIgYnkgdGhlIGRlbGVnYXRlIGl0ZXJhdG9yLiBJZiBjb250ZXh0Lm1ldGhvZCB3YXNcbiAgICAgIC8vIFwicmV0dXJuXCIsIGFsbG93IHRoZSBvcmlnaW5hbCAucmV0dXJuIGNhbGwgdG8gY29udGludWUgaW4gdGhlXG4gICAgICAvLyBvdXRlciBnZW5lcmF0b3IuXG4gICAgICBpZiAoY29udGV4dC5tZXRob2QgIT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgY29udGV4dC5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gUmUteWllbGQgdGhlIHJlc3VsdCByZXR1cm5lZCBieSB0aGUgZGVsZWdhdGUgbWV0aG9kLlxuICAgICAgcmV0dXJuIGluZm87XG4gICAgfVxuXG4gICAgLy8gVGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGlzIGZpbmlzaGVkLCBzbyBmb3JnZXQgaXQgYW5kIGNvbnRpbnVlIHdpdGhcbiAgICAvLyB0aGUgb3V0ZXIgZ2VuZXJhdG9yLlxuICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICB9XG5cbiAgLy8gRGVmaW5lIEdlbmVyYXRvci5wcm90b3R5cGUue25leHQsdGhyb3cscmV0dXJufSBpbiB0ZXJtcyBvZiB0aGVcbiAgLy8gdW5pZmllZCAuX2ludm9rZSBoZWxwZXIgbWV0aG9kLlxuICBkZWZpbmVJdGVyYXRvck1ldGhvZHMoR3ApO1xuXG4gIGRlZmluZShHcCwgdG9TdHJpbmdUYWdTeW1ib2wsIFwiR2VuZXJhdG9yXCIpO1xuXG4gIC8vIEEgR2VuZXJhdG9yIHNob3VsZCBhbHdheXMgcmV0dXJuIGl0c2VsZiBhcyB0aGUgaXRlcmF0b3Igb2JqZWN0IHdoZW4gdGhlXG4gIC8vIEBAaXRlcmF0b3IgZnVuY3Rpb24gaXMgY2FsbGVkIG9uIGl0LiBTb21lIGJyb3dzZXJzJyBpbXBsZW1lbnRhdGlvbnMgb2YgdGhlXG4gIC8vIGl0ZXJhdG9yIHByb3RvdHlwZSBjaGFpbiBpbmNvcnJlY3RseSBpbXBsZW1lbnQgdGhpcywgY2F1c2luZyB0aGUgR2VuZXJhdG9yXG4gIC8vIG9iamVjdCB0byBub3QgYmUgcmV0dXJuZWQgZnJvbSB0aGlzIGNhbGwuIFRoaXMgZW5zdXJlcyB0aGF0IGRvZXNuJ3QgaGFwcGVuLlxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlZ2VuZXJhdG9yL2lzc3Vlcy8yNzQgZm9yIG1vcmUgZGV0YWlscy5cbiAgR3BbaXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgR3AudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXCJbb2JqZWN0IEdlbmVyYXRvcl1cIjtcbiAgfTtcblxuICBmdW5jdGlvbiBwdXNoVHJ5RW50cnkobG9jcykge1xuICAgIHZhciBlbnRyeSA9IHsgdHJ5TG9jOiBsb2NzWzBdIH07XG5cbiAgICBpZiAoMSBpbiBsb2NzKSB7XG4gICAgICBlbnRyeS5jYXRjaExvYyA9IGxvY3NbMV07XG4gICAgfVxuXG4gICAgaWYgKDIgaW4gbG9jcykge1xuICAgICAgZW50cnkuZmluYWxseUxvYyA9IGxvY3NbMl07XG4gICAgICBlbnRyeS5hZnRlckxvYyA9IGxvY3NbM107XG4gICAgfVxuXG4gICAgdGhpcy50cnlFbnRyaWVzLnB1c2goZW50cnkpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzZXRUcnlFbnRyeShlbnRyeSkge1xuICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uIHx8IHt9O1xuICAgIHJlY29yZC50eXBlID0gXCJub3JtYWxcIjtcbiAgICBkZWxldGUgcmVjb3JkLmFyZztcbiAgICBlbnRyeS5jb21wbGV0aW9uID0gcmVjb3JkO1xuICB9XG5cbiAgZnVuY3Rpb24gQ29udGV4dCh0cnlMb2NzTGlzdCkge1xuICAgIC8vIFRoZSByb290IGVudHJ5IG9iamVjdCAoZWZmZWN0aXZlbHkgYSB0cnkgc3RhdGVtZW50IHdpdGhvdXQgYSBjYXRjaFxuICAgIC8vIG9yIGEgZmluYWxseSBibG9jaykgZ2l2ZXMgdXMgYSBwbGFjZSB0byBzdG9yZSB2YWx1ZXMgdGhyb3duIGZyb21cbiAgICAvLyBsb2NhdGlvbnMgd2hlcmUgdGhlcmUgaXMgbm8gZW5jbG9zaW5nIHRyeSBzdGF0ZW1lbnQuXG4gICAgdGhpcy50cnlFbnRyaWVzID0gW3sgdHJ5TG9jOiBcInJvb3RcIiB9XTtcbiAgICB0cnlMb2NzTGlzdC5mb3JFYWNoKHB1c2hUcnlFbnRyeSwgdGhpcyk7XG4gICAgdGhpcy5yZXNldCh0cnVlKTtcbiAgfVxuXG4gIGV4cG9ydHMua2V5cyA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgfVxuICAgIGtleXMucmV2ZXJzZSgpO1xuXG4gICAgLy8gUmF0aGVyIHRoYW4gcmV0dXJuaW5nIGFuIG9iamVjdCB3aXRoIGEgbmV4dCBtZXRob2QsIHdlIGtlZXBcbiAgICAvLyB0aGluZ3Mgc2ltcGxlIGFuZCByZXR1cm4gdGhlIG5leHQgZnVuY3Rpb24gaXRzZWxmLlxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgd2hpbGUgKGtleXMubGVuZ3RoKSB7XG4gICAgICAgIHZhciBrZXkgPSBrZXlzLnBvcCgpO1xuICAgICAgICBpZiAoa2V5IGluIG9iamVjdCkge1xuICAgICAgICAgIG5leHQudmFsdWUgPSBrZXk7XG4gICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVG8gYXZvaWQgY3JlYXRpbmcgYW4gYWRkaXRpb25hbCBvYmplY3QsIHdlIGp1c3QgaGFuZyB0aGUgLnZhbHVlXG4gICAgICAvLyBhbmQgLmRvbmUgcHJvcGVydGllcyBvZmYgdGhlIG5leHQgZnVuY3Rpb24gb2JqZWN0IGl0c2VsZi4gVGhpc1xuICAgICAgLy8gYWxzbyBlbnN1cmVzIHRoYXQgdGhlIG1pbmlmaWVyIHdpbGwgbm90IGFub255bWl6ZSB0aGUgZnVuY3Rpb24uXG4gICAgICBuZXh0LmRvbmUgPSB0cnVlO1xuICAgICAgcmV0dXJuIG5leHQ7XG4gICAgfTtcbiAgfTtcblxuICBmdW5jdGlvbiB2YWx1ZXMoaXRlcmFibGUpIHtcbiAgICBpZiAoaXRlcmFibGUpIHtcbiAgICAgIHZhciBpdGVyYXRvck1ldGhvZCA9IGl0ZXJhYmxlW2l0ZXJhdG9yU3ltYm9sXTtcbiAgICAgIGlmIChpdGVyYXRvck1ldGhvZCkge1xuICAgICAgICByZXR1cm4gaXRlcmF0b3JNZXRob2QuY2FsbChpdGVyYWJsZSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgaXRlcmFibGUubmV4dCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBpdGVyYWJsZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFpc05hTihpdGVyYWJsZS5sZW5ndGgpKSB7XG4gICAgICAgIHZhciBpID0gLTEsIG5leHQgPSBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgICAgIHdoaWxlICgrK2kgPCBpdGVyYWJsZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmIChoYXNPd24uY2FsbChpdGVyYWJsZSwgaSkpIHtcbiAgICAgICAgICAgICAgbmV4dC52YWx1ZSA9IGl0ZXJhYmxlW2ldO1xuICAgICAgICAgICAgICBuZXh0LmRvbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbmV4dC52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBuZXh0LmRvbmUgPSB0cnVlO1xuXG4gICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG5leHQubmV4dCA9IG5leHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmV0dXJuIGFuIGl0ZXJhdG9yIHdpdGggbm8gdmFsdWVzLlxuICAgIHJldHVybiB7IG5leHQ6IGRvbmVSZXN1bHQgfTtcbiAgfVxuICBleHBvcnRzLnZhbHVlcyA9IHZhbHVlcztcblxuICBmdW5jdGlvbiBkb25lUmVzdWx0KCkge1xuICAgIHJldHVybiB7IHZhbHVlOiB1bmRlZmluZWQsIGRvbmU6IHRydWUgfTtcbiAgfVxuXG4gIENvbnRleHQucHJvdG90eXBlID0ge1xuICAgIGNvbnN0cnVjdG9yOiBDb250ZXh0LFxuXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKHNraXBUZW1wUmVzZXQpIHtcbiAgICAgIHRoaXMucHJldiA9IDA7XG4gICAgICB0aGlzLm5leHQgPSAwO1xuICAgICAgLy8gUmVzZXR0aW5nIGNvbnRleHQuX3NlbnQgZm9yIGxlZ2FjeSBzdXBwb3J0IG9mIEJhYmVsJ3NcbiAgICAgIC8vIGZ1bmN0aW9uLnNlbnQgaW1wbGVtZW50YXRpb24uXG4gICAgICB0aGlzLnNlbnQgPSB0aGlzLl9zZW50ID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5kb25lID0gZmFsc2U7XG4gICAgICB0aGlzLmRlbGVnYXRlID0gbnVsbDtcblxuICAgICAgdGhpcy5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgIHRoaXMuYXJnID0gdW5kZWZpbmVkO1xuXG4gICAgICB0aGlzLnRyeUVudHJpZXMuZm9yRWFjaChyZXNldFRyeUVudHJ5KTtcblxuICAgICAgaWYgKCFza2lwVGVtcFJlc2V0KSB7XG4gICAgICAgIGZvciAodmFyIG5hbWUgaW4gdGhpcykge1xuICAgICAgICAgIC8vIE5vdCBzdXJlIGFib3V0IHRoZSBvcHRpbWFsIG9yZGVyIG9mIHRoZXNlIGNvbmRpdGlvbnM6XG4gICAgICAgICAgaWYgKG5hbWUuY2hhckF0KDApID09PSBcInRcIiAmJlxuICAgICAgICAgICAgICBoYXNPd24uY2FsbCh0aGlzLCBuYW1lKSAmJlxuICAgICAgICAgICAgICAhaXNOYU4oK25hbWUuc2xpY2UoMSkpKSB7XG4gICAgICAgICAgICB0aGlzW25hbWVdID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBzdG9wOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG5cbiAgICAgIHZhciByb290RW50cnkgPSB0aGlzLnRyeUVudHJpZXNbMF07XG4gICAgICB2YXIgcm9vdFJlY29yZCA9IHJvb3RFbnRyeS5jb21wbGV0aW9uO1xuICAgICAgaWYgKHJvb3RSZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHRocm93IHJvb3RSZWNvcmQuYXJnO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5ydmFsO1xuICAgIH0sXG5cbiAgICBkaXNwYXRjaEV4Y2VwdGlvbjogZnVuY3Rpb24oZXhjZXB0aW9uKSB7XG4gICAgICBpZiAodGhpcy5kb25lKSB7XG4gICAgICAgIHRocm93IGV4Y2VwdGlvbjtcbiAgICAgIH1cblxuICAgICAgdmFyIGNvbnRleHQgPSB0aGlzO1xuICAgICAgZnVuY3Rpb24gaGFuZGxlKGxvYywgY2F1Z2h0KSB7XG4gICAgICAgIHJlY29yZC50eXBlID0gXCJ0aHJvd1wiO1xuICAgICAgICByZWNvcmQuYXJnID0gZXhjZXB0aW9uO1xuICAgICAgICBjb250ZXh0Lm5leHQgPSBsb2M7XG5cbiAgICAgICAgaWYgKGNhdWdodCkge1xuICAgICAgICAgIC8vIElmIHRoZSBkaXNwYXRjaGVkIGV4Y2VwdGlvbiB3YXMgY2F1Z2h0IGJ5IGEgY2F0Y2ggYmxvY2ssXG4gICAgICAgICAgLy8gdGhlbiBsZXQgdGhhdCBjYXRjaCBibG9jayBoYW5kbGUgdGhlIGV4Y2VwdGlvbiBub3JtYWxseS5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICAgIGNvbnRleHQuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICEhIGNhdWdodDtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uO1xuXG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPT09IFwicm9vdFwiKSB7XG4gICAgICAgICAgLy8gRXhjZXB0aW9uIHRocm93biBvdXRzaWRlIG9mIGFueSB0cnkgYmxvY2sgdGhhdCBjb3VsZCBoYW5kbGVcbiAgICAgICAgICAvLyBpdCwgc28gc2V0IHRoZSBjb21wbGV0aW9uIHZhbHVlIG9mIHRoZSBlbnRpcmUgZnVuY3Rpb24gdG9cbiAgICAgICAgICAvLyB0aHJvdyB0aGUgZXhjZXB0aW9uLlxuICAgICAgICAgIHJldHVybiBoYW5kbGUoXCJlbmRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jIDw9IHRoaXMucHJldikge1xuICAgICAgICAgIHZhciBoYXNDYXRjaCA9IGhhc093bi5jYWxsKGVudHJ5LCBcImNhdGNoTG9jXCIpO1xuICAgICAgICAgIHZhciBoYXNGaW5hbGx5ID0gaGFzT3duLmNhbGwoZW50cnksIFwiZmluYWxseUxvY1wiKTtcblxuICAgICAgICAgIGlmIChoYXNDYXRjaCAmJiBoYXNGaW5hbGx5KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5maW5hbGx5TG9jKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSBpZiAoaGFzQ2F0Y2gpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5jYXRjaExvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmNhdGNoTG9jLCB0cnVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSBpZiAoaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5maW5hbGx5TG9jKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0cnkgc3RhdGVtZW50IHdpdGhvdXQgY2F0Y2ggb3IgZmluYWxseVwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgYWJydXB0OiBmdW5jdGlvbih0eXBlLCBhcmcpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jIDw9IHRoaXMucHJldiAmJlxuICAgICAgICAgICAgaGFzT3duLmNhbGwoZW50cnksIFwiZmluYWxseUxvY1wiKSAmJlxuICAgICAgICAgICAgdGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgIHZhciBmaW5hbGx5RW50cnkgPSBlbnRyeTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZmluYWxseUVudHJ5ICYmXG4gICAgICAgICAgKHR5cGUgPT09IFwiYnJlYWtcIiB8fFxuICAgICAgICAgICB0eXBlID09PSBcImNvbnRpbnVlXCIpICYmXG4gICAgICAgICAgZmluYWxseUVudHJ5LnRyeUxvYyA8PSBhcmcgJiZcbiAgICAgICAgICBhcmcgPD0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgLy8gSWdub3JlIHRoZSBmaW5hbGx5IGVudHJ5IGlmIGNvbnRyb2wgaXMgbm90IGp1bXBpbmcgdG8gYVxuICAgICAgICAvLyBsb2NhdGlvbiBvdXRzaWRlIHRoZSB0cnkvY2F0Y2ggYmxvY2suXG4gICAgICAgIGZpbmFsbHlFbnRyeSA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHZhciByZWNvcmQgPSBmaW5hbGx5RW50cnkgPyBmaW5hbGx5RW50cnkuY29tcGxldGlvbiA6IHt9O1xuICAgICAgcmVjb3JkLnR5cGUgPSB0eXBlO1xuICAgICAgcmVjb3JkLmFyZyA9IGFyZztcblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSkge1xuICAgICAgICB0aGlzLm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICB0aGlzLm5leHQgPSBmaW5hbGx5RW50cnkuZmluYWxseUxvYztcbiAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLmNvbXBsZXRlKHJlY29yZCk7XG4gICAgfSxcblxuICAgIGNvbXBsZXRlOiBmdW5jdGlvbihyZWNvcmQsIGFmdGVyTG9jKSB7XG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByZWNvcmQuYXJnO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwiYnJlYWtcIiB8fFxuICAgICAgICAgIHJlY29yZC50eXBlID09PSBcImNvbnRpbnVlXCIpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gcmVjb3JkLmFyZztcbiAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgdGhpcy5ydmFsID0gdGhpcy5hcmcgPSByZWNvcmQuYXJnO1xuICAgICAgICB0aGlzLm1ldGhvZCA9IFwicmV0dXJuXCI7XG4gICAgICAgIHRoaXMubmV4dCA9IFwiZW5kXCI7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiICYmIGFmdGVyTG9jKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IGFmdGVyTG9jO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9LFxuXG4gICAgZmluaXNoOiBmdW5jdGlvbihmaW5hbGx5TG9jKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LmZpbmFsbHlMb2MgPT09IGZpbmFsbHlMb2MpIHtcbiAgICAgICAgICB0aGlzLmNvbXBsZXRlKGVudHJ5LmNvbXBsZXRpb24sIGVudHJ5LmFmdGVyTG9jKTtcbiAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBcImNhdGNoXCI6IGZ1bmN0aW9uKHRyeUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPT09IHRyeUxvYykge1xuICAgICAgICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uO1xuICAgICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgICB2YXIgdGhyb3duID0gcmVjb3JkLmFyZztcbiAgICAgICAgICAgIHJlc2V0VHJ5RW50cnkoZW50cnkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGhyb3duO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRoZSBjb250ZXh0LmNhdGNoIG1ldGhvZCBtdXN0IG9ubHkgYmUgY2FsbGVkIHdpdGggYSBsb2NhdGlvblxuICAgICAgLy8gYXJndW1lbnQgdGhhdCBjb3JyZXNwb25kcyB0byBhIGtub3duIGNhdGNoIGJsb2NrLlxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaWxsZWdhbCBjYXRjaCBhdHRlbXB0XCIpO1xuICAgIH0sXG5cbiAgICBkZWxlZ2F0ZVlpZWxkOiBmdW5jdGlvbihpdGVyYWJsZSwgcmVzdWx0TmFtZSwgbmV4dExvYykge1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IHtcbiAgICAgICAgaXRlcmF0b3I6IHZhbHVlcyhpdGVyYWJsZSksXG4gICAgICAgIHJlc3VsdE5hbWU6IHJlc3VsdE5hbWUsXG4gICAgICAgIG5leHRMb2M6IG5leHRMb2NcbiAgICAgIH07XG5cbiAgICAgIGlmICh0aGlzLm1ldGhvZCA9PT0gXCJuZXh0XCIpIHtcbiAgICAgICAgLy8gRGVsaWJlcmF0ZWx5IGZvcmdldCB0aGUgbGFzdCBzZW50IHZhbHVlIHNvIHRoYXQgd2UgZG9uJ3RcbiAgICAgICAgLy8gYWNjaWRlbnRhbGx5IHBhc3MgaXQgb24gdG8gdGhlIGRlbGVnYXRlLlxuICAgICAgICB0aGlzLmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuICB9O1xuXG4gIC8vIFJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGlzIHNjcmlwdCBpcyBleGVjdXRpbmcgYXMgYSBDb21tb25KUyBtb2R1bGVcbiAgLy8gb3Igbm90LCByZXR1cm4gdGhlIHJ1bnRpbWUgb2JqZWN0IHNvIHRoYXQgd2UgY2FuIGRlY2xhcmUgdGhlIHZhcmlhYmxlXG4gIC8vIHJlZ2VuZXJhdG9yUnVudGltZSBpbiB0aGUgb3V0ZXIgc2NvcGUsIHdoaWNoIGFsbG93cyB0aGlzIG1vZHVsZSB0byBiZVxuICAvLyBpbmplY3RlZCBlYXNpbHkgYnkgYGJpbi9yZWdlbmVyYXRvciAtLWluY2x1ZGUtcnVudGltZSBzY3JpcHQuanNgLlxuICByZXR1cm4gZXhwb3J0cztcblxufShcbiAgLy8gSWYgdGhpcyBzY3JpcHQgaXMgZXhlY3V0aW5nIGFzIGEgQ29tbW9uSlMgbW9kdWxlLCB1c2UgbW9kdWxlLmV4cG9ydHNcbiAgLy8gYXMgdGhlIHJlZ2VuZXJhdG9yUnVudGltZSBuYW1lc3BhY2UuIE90aGVyd2lzZSBjcmVhdGUgYSBuZXcgZW1wdHlcbiAgLy8gb2JqZWN0LiBFaXRoZXIgd2F5LCB0aGUgcmVzdWx0aW5nIG9iamVjdCB3aWxsIGJlIHVzZWQgdG8gaW5pdGlhbGl6ZVxuICAvLyB0aGUgcmVnZW5lcmF0b3JSdW50aW1lIHZhcmlhYmxlIGF0IHRoZSB0b3Agb2YgdGhpcyBmaWxlLlxuICB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiID8gbW9kdWxlLmV4cG9ydHMgOiB7fVxuKSk7XG5cbnRyeSB7XG4gIHJlZ2VuZXJhdG9yUnVudGltZSA9IHJ1bnRpbWU7XG59IGNhdGNoIChhY2NpZGVudGFsU3RyaWN0TW9kZSkge1xuICAvLyBUaGlzIG1vZHVsZSBzaG91bGQgbm90IGJlIHJ1bm5pbmcgaW4gc3RyaWN0IG1vZGUsIHNvIHRoZSBhYm92ZVxuICAvLyBhc3NpZ25tZW50IHNob3VsZCBhbHdheXMgd29yayB1bmxlc3Mgc29tZXRoaW5nIGlzIG1pc2NvbmZpZ3VyZWQuIEp1c3RcbiAgLy8gaW4gY2FzZSBydW50aW1lLmpzIGFjY2lkZW50YWxseSBydW5zIGluIHN0cmljdCBtb2RlLCB3ZSBjYW4gZXNjYXBlXG4gIC8vIHN0cmljdCBtb2RlIHVzaW5nIGEgZ2xvYmFsIEZ1bmN0aW9uIGNhbGwuIFRoaXMgY291bGQgY29uY2VpdmFibHkgZmFpbFxuICAvLyBpZiBhIENvbnRlbnQgU2VjdXJpdHkgUG9saWN5IGZvcmJpZHMgdXNpbmcgRnVuY3Rpb24sIGJ1dCBpbiB0aGF0IGNhc2VcbiAgLy8gdGhlIHByb3BlciBzb2x1dGlvbiBpcyB0byBmaXggdGhlIGFjY2lkZW50YWwgc3RyaWN0IG1vZGUgcHJvYmxlbS4gSWZcbiAgLy8geW91J3ZlIG1pc2NvbmZpZ3VyZWQgeW91ciBidW5kbGVyIHRvIGZvcmNlIHN0cmljdCBtb2RlIGFuZCBhcHBsaWVkIGFcbiAgLy8gQ1NQIHRvIGZvcmJpZCBGdW5jdGlvbiwgYW5kIHlvdSdyZSBub3Qgd2lsbGluZyB0byBmaXggZWl0aGVyIG9mIHRob3NlXG4gIC8vIHByb2JsZW1zLCBwbGVhc2UgZGV0YWlsIHlvdXIgdW5pcXVlIHByZWRpY2FtZW50IGluIGEgR2l0SHViIGlzc3VlLlxuICBGdW5jdGlvbihcInJcIiwgXCJyZWdlbmVyYXRvclJ1bnRpbWUgPSByXCIpKHJ1bnRpbWUpO1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicmVnZW5lcmF0b3ItcnVudGltZVwiKTtcbiIsIi8qKlxuICogR2xvYmFsIE5hbWVzXG4gKi9cblxudmFyIGdsb2JhbHMgPSAvXFxiKEFycmF5fERhdGV8T2JqZWN0fE1hdGh8SlNPTilcXGIvZztcblxuLyoqXG4gKiBSZXR1cm4gaW1tZWRpYXRlIGlkZW50aWZpZXJzIHBhcnNlZCBmcm9tIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSBtYXAgZnVuY3Rpb24gb3IgcHJlZml4XG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdHIsIGZuKXtcbiAgdmFyIHAgPSB1bmlxdWUocHJvcHMoc3RyKSk7XG4gIGlmIChmbiAmJiAnc3RyaW5nJyA9PSB0eXBlb2YgZm4pIGZuID0gcHJlZml4ZWQoZm4pO1xuICBpZiAoZm4pIHJldHVybiBtYXAoc3RyLCBwLCBmbik7XG4gIHJldHVybiBwO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gaW1tZWRpYXRlIGlkZW50aWZpZXJzIGluIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcHJvcHMoc3RyKSB7XG4gIHJldHVybiBzdHJcbiAgICAucmVwbGFjZSgvXFwuXFx3K3xcXHcrICpcXCh8XCJbXlwiXSpcInwnW14nXSonfFxcLyhbXi9dKylcXC8vZywgJycpXG4gICAgLnJlcGxhY2UoZ2xvYmFscywgJycpXG4gICAgLm1hdGNoKC9bYS16QS1aX11cXHcqL2cpXG4gICAgfHwgW107XG59XG5cbi8qKlxuICogUmV0dXJuIGBzdHJgIHdpdGggYHByb3BzYCBtYXBwZWQgd2l0aCBgZm5gLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7QXJyYXl9IHByb3BzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbWFwKHN0ciwgcHJvcHMsIGZuKSB7XG4gIHZhciByZSA9IC9cXC5cXHcrfFxcdysgKlxcKHxcIlteXCJdKlwifCdbXiddKid8XFwvKFteL10rKVxcL3xbYS16QS1aX11cXHcqL2c7XG4gIHJldHVybiBzdHIucmVwbGFjZShyZSwgZnVuY3Rpb24oXyl7XG4gICAgaWYgKCcoJyA9PSBfW18ubGVuZ3RoIC0gMV0pIHJldHVybiBmbihfKTtcbiAgICBpZiAoIX5wcm9wcy5pbmRleE9mKF8pKSByZXR1cm4gXztcbiAgICByZXR1cm4gZm4oXyk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFJldHVybiB1bmlxdWUgYXJyYXkuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHVuaXF1ZShhcnIpIHtcbiAgdmFyIHJldCA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKH5yZXQuaW5kZXhPZihhcnJbaV0pKSBjb250aW51ZTtcbiAgICByZXQucHVzaChhcnJbaV0pO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn1cblxuLyoqXG4gKiBNYXAgd2l0aCBwcmVmaXggYHN0cmAuXG4gKi9cblxuZnVuY3Rpb24gcHJlZml4ZWQoc3RyKSB7XG4gIHJldHVybiBmdW5jdGlvbihfKXtcbiAgICByZXR1cm4gc3RyICsgXztcbiAgfTtcbn1cbiIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvcicpO1xucmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYuYXJyYXkuZnJvbScpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzL19jb3JlJykuQXJyYXkuZnJvbTtcbiIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2LmFycmF5LmlzLWFycmF5Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvX2NvcmUnKS5BcnJheS5pc0FycmF5O1xuIiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYuZGF0ZS5ub3cnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fY29yZScpLkRhdGUubm93O1xuIiwidmFyIGNvcmUgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzL19jb3JlJyk7XG52YXIgJEpTT04gPSBjb3JlLkpTT04gfHwgKGNvcmUuSlNPTiA9IHsgc3RyaW5naWZ5OiBKU09OLnN0cmluZ2lmeSB9KTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3RyaW5naWZ5KGl0KSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgcmV0dXJuICRKU09OLnN0cmluZ2lmeS5hcHBseSgkSlNPTiwgYXJndW1lbnRzKTtcbn07XG4iLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3QuZGVmaW5lLXByb3BlcnRpZXMnKTtcbnZhciAkT2JqZWN0ID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fY29yZScpLk9iamVjdDtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyhULCBEKSB7XG4gIHJldHVybiAkT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoVCwgRCk7XG59O1xuIiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYub2JqZWN0LmRlZmluZS1wcm9wZXJ0eScpO1xudmFyICRPYmplY3QgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzL19jb3JlJykuT2JqZWN0O1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eShpdCwga2V5LCBkZXNjKSB7XG4gIHJldHVybiAkT2JqZWN0LmRlZmluZVByb3BlcnR5KGl0LCBrZXksIGRlc2MpO1xufTtcbiIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3InKTtcbnZhciAkT2JqZWN0ID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fY29yZScpLk9iamVjdDtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpIHtcbiAgcmV0dXJuICRPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpO1xufTtcbiIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM3Lm9iamVjdC5nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3JzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvX2NvcmUnKS5PYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycztcbiIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2LnN5bWJvbCcpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzL19jb3JlJykuT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scztcbiIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5rZXlzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvX2NvcmUnKS5PYmplY3Qua2V5cztcbiIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM3Lm9iamVjdC52YWx1ZXMnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fY29yZScpLk9iamVjdC52YWx1ZXM7XG4iLCJyZXF1aXJlKCcuLi9tb2R1bGVzL2VzNi5wYXJzZS1pbnQnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9fY29yZScpLnBhcnNlSW50O1xuIiwicmVxdWlyZSgnLi4vbW9kdWxlcy9lczYub2JqZWN0LnRvLXN0cmluZycpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2LnByb21pc2UnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM3LnByb21pc2UuZmluYWxseScpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczcucHJvbWlzZS50cnknKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9fY29yZScpLlByb21pc2U7XG4iLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5zeW1ib2wnKTtcbnJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcnKTtcbnJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM3LnN5bWJvbC5hc3luYy1pdGVyYXRvcicpO1xucmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczcuc3ltYm9sLm9ic2VydmFibGUnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fY29yZScpLlN5bWJvbDtcbiIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvcicpO1xucmVxdWlyZSgnLi4vLi4vbW9kdWxlcy93ZWIuZG9tLml0ZXJhYmxlJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvX3drcy1leHQnKS5mKCdpdGVyYXRvcicpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKHR5cGVvZiBpdCAhPSAnZnVuY3Rpb24nKSB0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhIGZ1bmN0aW9uIScpO1xuICByZXR1cm4gaXQ7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7IC8qIGVtcHR5ICovIH07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCwgQ29uc3RydWN0b3IsIG5hbWUsIGZvcmJpZGRlbkZpZWxkKSB7XG4gIGlmICghKGl0IGluc3RhbmNlb2YgQ29uc3RydWN0b3IpIHx8IChmb3JiaWRkZW5GaWVsZCAhPT0gdW5kZWZpbmVkICYmIGZvcmJpZGRlbkZpZWxkIGluIGl0KSkge1xuICAgIHRocm93IFR5cGVFcnJvcihuYW1lICsgJzogaW5jb3JyZWN0IGludm9jYXRpb24hJyk7XG4gIH0gcmV0dXJuIGl0O1xufTtcbiIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKCFpc09iamVjdChpdCkpIHRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGFuIG9iamVjdCEnKTtcbiAgcmV0dXJuIGl0O1xufTtcbiIsIi8vIGZhbHNlIC0+IEFycmF5I2luZGV4T2Zcbi8vIHRydWUgIC0+IEFycmF5I2luY2x1ZGVzXG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpO1xudmFyIHRvTGVuZ3RoID0gcmVxdWlyZSgnLi9fdG8tbGVuZ3RoJyk7XG52YXIgdG9BYnNvbHV0ZUluZGV4ID0gcmVxdWlyZSgnLi9fdG8tYWJzb2x1dGUtaW5kZXgnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKElTX0lOQ0xVREVTKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoJHRoaXMsIGVsLCBmcm9tSW5kZXgpIHtcbiAgICB2YXIgTyA9IHRvSU9iamVjdCgkdGhpcyk7XG4gICAgdmFyIGxlbmd0aCA9IHRvTGVuZ3RoKE8ubGVuZ3RoKTtcbiAgICB2YXIgaW5kZXggPSB0b0Fic29sdXRlSW5kZXgoZnJvbUluZGV4LCBsZW5ndGgpO1xuICAgIHZhciB2YWx1ZTtcbiAgICAvLyBBcnJheSNpbmNsdWRlcyB1c2VzIFNhbWVWYWx1ZVplcm8gZXF1YWxpdHkgYWxnb3JpdGhtXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXNlbGYtY29tcGFyZVxuICAgIGlmIChJU19JTkNMVURFUyAmJiBlbCAhPSBlbCkgd2hpbGUgKGxlbmd0aCA+IGluZGV4KSB7XG4gICAgICB2YWx1ZSA9IE9baW5kZXgrK107XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tc2VsZi1jb21wYXJlXG4gICAgICBpZiAodmFsdWUgIT0gdmFsdWUpIHJldHVybiB0cnVlO1xuICAgIC8vIEFycmF5I2luZGV4T2YgaWdub3JlcyBob2xlcywgQXJyYXkjaW5jbHVkZXMgLSBub3RcbiAgICB9IGVsc2UgZm9yICg7bGVuZ3RoID4gaW5kZXg7IGluZGV4KyspIGlmIChJU19JTkNMVURFUyB8fCBpbmRleCBpbiBPKSB7XG4gICAgICBpZiAoT1tpbmRleF0gPT09IGVsKSByZXR1cm4gSVNfSU5DTFVERVMgfHwgaW5kZXggfHwgMDtcbiAgICB9IHJldHVybiAhSVNfSU5DTFVERVMgJiYgLTE7XG4gIH07XG59O1xuIiwiLy8gZ2V0dGluZyB0YWcgZnJvbSAxOS4xLjMuNiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nKClcbnZhciBjb2YgPSByZXF1aXJlKCcuL19jb2YnKTtcbnZhciBUQUcgPSByZXF1aXJlKCcuL193a3MnKSgndG9TdHJpbmdUYWcnKTtcbi8vIEVTMyB3cm9uZyBoZXJlXG52YXIgQVJHID0gY29mKGZ1bmN0aW9uICgpIHsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKSA9PSAnQXJndW1lbnRzJztcblxuLy8gZmFsbGJhY2sgZm9yIElFMTEgU2NyaXB0IEFjY2VzcyBEZW5pZWQgZXJyb3JcbnZhciB0cnlHZXQgPSBmdW5jdGlvbiAoaXQsIGtleSkge1xuICB0cnkge1xuICAgIHJldHVybiBpdFtrZXldO1xuICB9IGNhdGNoIChlKSB7IC8qIGVtcHR5ICovIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHZhciBPLCBULCBCO1xuICByZXR1cm4gaXQgPT09IHVuZGVmaW5lZCA/ICdVbmRlZmluZWQnIDogaXQgPT09IG51bGwgPyAnTnVsbCdcbiAgICAvLyBAQHRvU3RyaW5nVGFnIGNhc2VcbiAgICA6IHR5cGVvZiAoVCA9IHRyeUdldChPID0gT2JqZWN0KGl0KSwgVEFHKSkgPT0gJ3N0cmluZycgPyBUXG4gICAgLy8gYnVpbHRpblRhZyBjYXNlXG4gICAgOiBBUkcgPyBjb2YoTylcbiAgICAvLyBFUzMgYXJndW1lbnRzIGZhbGxiYWNrXG4gICAgOiAoQiA9IGNvZihPKSkgPT0gJ09iamVjdCcgJiYgdHlwZW9mIE8uY2FsbGVlID09ICdmdW5jdGlvbicgPyAnQXJndW1lbnRzJyA6IEI7XG59O1xuIiwidmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKGl0KS5zbGljZSg4LCAtMSk7XG59O1xuIiwidmFyIGNvcmUgPSBtb2R1bGUuZXhwb3J0cyA9IHsgdmVyc2lvbjogJzIuNi4xMicgfTtcbmlmICh0eXBlb2YgX19lID09ICdudW1iZXInKSBfX2UgPSBjb3JlOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmXG4iLCIndXNlIHN0cmljdCc7XG52YXIgJGRlZmluZVByb3BlcnR5ID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJyk7XG52YXIgY3JlYXRlRGVzYyA9IHJlcXVpcmUoJy4vX3Byb3BlcnR5LWRlc2MnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob2JqZWN0LCBpbmRleCwgdmFsdWUpIHtcbiAgaWYgKGluZGV4IGluIG9iamVjdCkgJGRlZmluZVByb3BlcnR5LmYob2JqZWN0LCBpbmRleCwgY3JlYXRlRGVzYygwLCB2YWx1ZSkpO1xuICBlbHNlIG9iamVjdFtpbmRleF0gPSB2YWx1ZTtcbn07XG4iLCIvLyBvcHRpb25hbCAvIHNpbXBsZSBjb250ZXh0IGJpbmRpbmdcbnZhciBhRnVuY3Rpb24gPSByZXF1aXJlKCcuL19hLWZ1bmN0aW9uJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChmbiwgdGhhdCwgbGVuZ3RoKSB7XG4gIGFGdW5jdGlvbihmbik7XG4gIGlmICh0aGF0ID09PSB1bmRlZmluZWQpIHJldHVybiBmbjtcbiAgc3dpdGNoIChsZW5ndGgpIHtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbiAoYSkge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSk7XG4gICAgfTtcbiAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYik7XG4gICAgfTtcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbiAoYSwgYiwgYykge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYiwgYyk7XG4gICAgfTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gKC8qIC4uLmFyZ3MgKi8pIHtcbiAgICByZXR1cm4gZm4uYXBwbHkodGhhdCwgYXJndW1lbnRzKTtcbiAgfTtcbn07XG4iLCIvLyA3LjIuMSBSZXF1aXJlT2JqZWN0Q29lcmNpYmxlKGFyZ3VtZW50KVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKGl0ID09IHVuZGVmaW5lZCkgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY2FsbCBtZXRob2Qgb24gIFwiICsgaXQpO1xuICByZXR1cm4gaXQ7XG59O1xuIiwiLy8gVGhhbmsncyBJRTggZm9yIGhpcyBmdW5ueSBkZWZpbmVQcm9wZXJ0eVxubW9kdWxlLmV4cG9ydHMgPSAhcmVxdWlyZSgnLi9fZmFpbHMnKShmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdhJywgeyBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDc7IH0gfSkuYSAhPSA3O1xufSk7XG4iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbnZhciBkb2N1bWVudCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpLmRvY3VtZW50O1xuLy8gdHlwZW9mIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgaXMgJ29iamVjdCcgaW4gb2xkIElFXG52YXIgaXMgPSBpc09iamVjdChkb2N1bWVudCkgJiYgaXNPYmplY3QoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXMgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGl0KSA6IHt9O1xufTtcbiIsIi8vIElFIDgtIGRvbid0IGVudW0gYnVnIGtleXNcbm1vZHVsZS5leHBvcnRzID0gKFxuICAnY29uc3RydWN0b3IsaGFzT3duUHJvcGVydHksaXNQcm90b3R5cGVPZixwcm9wZXJ0eUlzRW51bWVyYWJsZSx0b0xvY2FsZVN0cmluZyx0b1N0cmluZyx2YWx1ZU9mJ1xuKS5zcGxpdCgnLCcpO1xuIiwiLy8gYWxsIGVudW1lcmFibGUgb2JqZWN0IGtleXMsIGluY2x1ZGVzIHN5bWJvbHNcbnZhciBnZXRLZXlzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMnKTtcbnZhciBnT1BTID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdvcHMnKTtcbnZhciBwSUUgPSByZXF1aXJlKCcuL19vYmplY3QtcGllJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICB2YXIgcmVzdWx0ID0gZ2V0S2V5cyhpdCk7XG4gIHZhciBnZXRTeW1ib2xzID0gZ09QUy5mO1xuICBpZiAoZ2V0U3ltYm9scykge1xuICAgIHZhciBzeW1ib2xzID0gZ2V0U3ltYm9scyhpdCk7XG4gICAgdmFyIGlzRW51bSA9IHBJRS5mO1xuICAgIHZhciBpID0gMDtcbiAgICB2YXIga2V5O1xuICAgIHdoaWxlIChzeW1ib2xzLmxlbmd0aCA+IGkpIGlmIChpc0VudW0uY2FsbChpdCwga2V5ID0gc3ltYm9sc1tpKytdKSkgcmVzdWx0LnB1c2goa2V5KTtcbiAgfSByZXR1cm4gcmVzdWx0O1xufTtcbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciBjb3JlID0gcmVxdWlyZSgnLi9fY29yZScpO1xudmFyIGN0eCA9IHJlcXVpcmUoJy4vX2N0eCcpO1xudmFyIGhpZGUgPSByZXF1aXJlKCcuL19oaWRlJyk7XG52YXIgaGFzID0gcmVxdWlyZSgnLi9faGFzJyk7XG52YXIgUFJPVE9UWVBFID0gJ3Byb3RvdHlwZSc7XG5cbnZhciAkZXhwb3J0ID0gZnVuY3Rpb24gKHR5cGUsIG5hbWUsIHNvdXJjZSkge1xuICB2YXIgSVNfRk9SQ0VEID0gdHlwZSAmICRleHBvcnQuRjtcbiAgdmFyIElTX0dMT0JBTCA9IHR5cGUgJiAkZXhwb3J0Lkc7XG4gIHZhciBJU19TVEFUSUMgPSB0eXBlICYgJGV4cG9ydC5TO1xuICB2YXIgSVNfUFJPVE8gPSB0eXBlICYgJGV4cG9ydC5QO1xuICB2YXIgSVNfQklORCA9IHR5cGUgJiAkZXhwb3J0LkI7XG4gIHZhciBJU19XUkFQID0gdHlwZSAmICRleHBvcnQuVztcbiAgdmFyIGV4cG9ydHMgPSBJU19HTE9CQUwgPyBjb3JlIDogY29yZVtuYW1lXSB8fCAoY29yZVtuYW1lXSA9IHt9KTtcbiAgdmFyIGV4cFByb3RvID0gZXhwb3J0c1tQUk9UT1RZUEVdO1xuICB2YXIgdGFyZ2V0ID0gSVNfR0xPQkFMID8gZ2xvYmFsIDogSVNfU1RBVElDID8gZ2xvYmFsW25hbWVdIDogKGdsb2JhbFtuYW1lXSB8fCB7fSlbUFJPVE9UWVBFXTtcbiAgdmFyIGtleSwgb3duLCBvdXQ7XG4gIGlmIChJU19HTE9CQUwpIHNvdXJjZSA9IG5hbWU7XG4gIGZvciAoa2V5IGluIHNvdXJjZSkge1xuICAgIC8vIGNvbnRhaW5zIGluIG5hdGl2ZVxuICAgIG93biA9ICFJU19GT1JDRUQgJiYgdGFyZ2V0ICYmIHRhcmdldFtrZXldICE9PSB1bmRlZmluZWQ7XG4gICAgaWYgKG93biAmJiBoYXMoZXhwb3J0cywga2V5KSkgY29udGludWU7XG4gICAgLy8gZXhwb3J0IG5hdGl2ZSBvciBwYXNzZWRcbiAgICBvdXQgPSBvd24gPyB0YXJnZXRba2V5XSA6IHNvdXJjZVtrZXldO1xuICAgIC8vIHByZXZlbnQgZ2xvYmFsIHBvbGx1dGlvbiBmb3IgbmFtZXNwYWNlc1xuICAgIGV4cG9ydHNba2V5XSA9IElTX0dMT0JBTCAmJiB0eXBlb2YgdGFyZ2V0W2tleV0gIT0gJ2Z1bmN0aW9uJyA/IHNvdXJjZVtrZXldXG4gICAgLy8gYmluZCB0aW1lcnMgdG8gZ2xvYmFsIGZvciBjYWxsIGZyb20gZXhwb3J0IGNvbnRleHRcbiAgICA6IElTX0JJTkQgJiYgb3duID8gY3R4KG91dCwgZ2xvYmFsKVxuICAgIC8vIHdyYXAgZ2xvYmFsIGNvbnN0cnVjdG9ycyBmb3IgcHJldmVudCBjaGFuZ2UgdGhlbSBpbiBsaWJyYXJ5XG4gICAgOiBJU19XUkFQICYmIHRhcmdldFtrZXldID09IG91dCA/IChmdW5jdGlvbiAoQykge1xuICAgICAgdmFyIEYgPSBmdW5jdGlvbiAoYSwgYiwgYykge1xuICAgICAgICBpZiAodGhpcyBpbnN0YW5jZW9mIEMpIHtcbiAgICAgICAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNhc2UgMDogcmV0dXJuIG5ldyBDKCk7XG4gICAgICAgICAgICBjYXNlIDE6IHJldHVybiBuZXcgQyhhKTtcbiAgICAgICAgICAgIGNhc2UgMjogcmV0dXJuIG5ldyBDKGEsIGIpO1xuICAgICAgICAgIH0gcmV0dXJuIG5ldyBDKGEsIGIsIGMpO1xuICAgICAgICB9IHJldHVybiBDLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9O1xuICAgICAgRltQUk9UT1RZUEVdID0gQ1tQUk9UT1RZUEVdO1xuICAgICAgcmV0dXJuIEY7XG4gICAgLy8gbWFrZSBzdGF0aWMgdmVyc2lvbnMgZm9yIHByb3RvdHlwZSBtZXRob2RzXG4gICAgfSkob3V0KSA6IElTX1BST1RPICYmIHR5cGVvZiBvdXQgPT0gJ2Z1bmN0aW9uJyA/IGN0eChGdW5jdGlvbi5jYWxsLCBvdXQpIDogb3V0O1xuICAgIC8vIGV4cG9ydCBwcm90byBtZXRob2RzIHRvIGNvcmUuJUNPTlNUUlVDVE9SJS5tZXRob2RzLiVOQU1FJVxuICAgIGlmIChJU19QUk9UTykge1xuICAgICAgKGV4cG9ydHMudmlydHVhbCB8fCAoZXhwb3J0cy52aXJ0dWFsID0ge30pKVtrZXldID0gb3V0O1xuICAgICAgLy8gZXhwb3J0IHByb3RvIG1ldGhvZHMgdG8gY29yZS4lQ09OU1RSVUNUT1IlLnByb3RvdHlwZS4lTkFNRSVcbiAgICAgIGlmICh0eXBlICYgJGV4cG9ydC5SICYmIGV4cFByb3RvICYmICFleHBQcm90b1trZXldKSBoaWRlKGV4cFByb3RvLCBrZXksIG91dCk7XG4gICAgfVxuICB9XG59O1xuLy8gdHlwZSBiaXRtYXBcbiRleHBvcnQuRiA9IDE7ICAgLy8gZm9yY2VkXG4kZXhwb3J0LkcgPSAyOyAgIC8vIGdsb2JhbFxuJGV4cG9ydC5TID0gNDsgICAvLyBzdGF0aWNcbiRleHBvcnQuUCA9IDg7ICAgLy8gcHJvdG9cbiRleHBvcnQuQiA9IDE2OyAgLy8gYmluZFxuJGV4cG9ydC5XID0gMzI7ICAvLyB3cmFwXG4kZXhwb3J0LlUgPSA2NDsgIC8vIHNhZmVcbiRleHBvcnQuUiA9IDEyODsgLy8gcmVhbCBwcm90byBtZXRob2QgZm9yIGBsaWJyYXJ5YFxubW9kdWxlLmV4cG9ydHMgPSAkZXhwb3J0O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZXhlYykge1xuICB0cnkge1xuICAgIHJldHVybiAhIWV4ZWMoKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59O1xuIiwidmFyIGN0eCA9IHJlcXVpcmUoJy4vX2N0eCcpO1xudmFyIGNhbGwgPSByZXF1aXJlKCcuL19pdGVyLWNhbGwnKTtcbnZhciBpc0FycmF5SXRlciA9IHJlcXVpcmUoJy4vX2lzLWFycmF5LWl0ZXInKTtcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIHRvTGVuZ3RoID0gcmVxdWlyZSgnLi9fdG8tbGVuZ3RoJyk7XG52YXIgZ2V0SXRlckZuID0gcmVxdWlyZSgnLi9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QnKTtcbnZhciBCUkVBSyA9IHt9O1xudmFyIFJFVFVSTiA9IHt9O1xudmFyIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdGVyYWJsZSwgZW50cmllcywgZm4sIHRoYXQsIElURVJBVE9SKSB7XG4gIHZhciBpdGVyRm4gPSBJVEVSQVRPUiA/IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGl0ZXJhYmxlOyB9IDogZ2V0SXRlckZuKGl0ZXJhYmxlKTtcbiAgdmFyIGYgPSBjdHgoZm4sIHRoYXQsIGVudHJpZXMgPyAyIDogMSk7XG4gIHZhciBpbmRleCA9IDA7XG4gIHZhciBsZW5ndGgsIHN0ZXAsIGl0ZXJhdG9yLCByZXN1bHQ7XG4gIGlmICh0eXBlb2YgaXRlckZuICE9ICdmdW5jdGlvbicpIHRocm93IFR5cGVFcnJvcihpdGVyYWJsZSArICcgaXMgbm90IGl0ZXJhYmxlIScpO1xuICAvLyBmYXN0IGNhc2UgZm9yIGFycmF5cyB3aXRoIGRlZmF1bHQgaXRlcmF0b3JcbiAgaWYgKGlzQXJyYXlJdGVyKGl0ZXJGbikpIGZvciAobGVuZ3RoID0gdG9MZW5ndGgoaXRlcmFibGUubGVuZ3RoKTsgbGVuZ3RoID4gaW5kZXg7IGluZGV4KyspIHtcbiAgICByZXN1bHQgPSBlbnRyaWVzID8gZihhbk9iamVjdChzdGVwID0gaXRlcmFibGVbaW5kZXhdKVswXSwgc3RlcFsxXSkgOiBmKGl0ZXJhYmxlW2luZGV4XSk7XG4gICAgaWYgKHJlc3VsdCA9PT0gQlJFQUsgfHwgcmVzdWx0ID09PSBSRVRVUk4pIHJldHVybiByZXN1bHQ7XG4gIH0gZWxzZSBmb3IgKGl0ZXJhdG9yID0gaXRlckZuLmNhbGwoaXRlcmFibGUpOyAhKHN0ZXAgPSBpdGVyYXRvci5uZXh0KCkpLmRvbmU7KSB7XG4gICAgcmVzdWx0ID0gY2FsbChpdGVyYXRvciwgZiwgc3RlcC52YWx1ZSwgZW50cmllcyk7XG4gICAgaWYgKHJlc3VsdCA9PT0gQlJFQUsgfHwgcmVzdWx0ID09PSBSRVRVUk4pIHJldHVybiByZXN1bHQ7XG4gIH1cbn07XG5leHBvcnRzLkJSRUFLID0gQlJFQUs7XG5leHBvcnRzLlJFVFVSTiA9IFJFVFVSTjtcbiIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy84NiNpc3N1ZWNvbW1lbnQtMTE1NzU5MDI4XG52YXIgZ2xvYmFsID0gbW9kdWxlLmV4cG9ydHMgPSB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnICYmIHdpbmRvdy5NYXRoID09IE1hdGhcbiAgPyB3aW5kb3cgOiB0eXBlb2Ygc2VsZiAhPSAndW5kZWZpbmVkJyAmJiBzZWxmLk1hdGggPT0gTWF0aCA/IHNlbGZcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLW5ldy1mdW5jXG4gIDogRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcbmlmICh0eXBlb2YgX19nID09ICdudW1iZXInKSBfX2cgPSBnbG9iYWw7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWZcbiIsInZhciBoYXNPd25Qcm9wZXJ0eSA9IHt9Lmhhc093blByb3BlcnR5O1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQsIGtleSkge1xuICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChpdCwga2V5KTtcbn07XG4iLCJ2YXIgZFAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKTtcbnZhciBjcmVhdGVEZXNjID0gcmVxdWlyZSgnLi9fcHJvcGVydHktZGVzYycpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gZnVuY3Rpb24gKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICByZXR1cm4gZFAuZihvYmplY3QsIGtleSwgY3JlYXRlRGVzYygxLCB2YWx1ZSkpO1xufSA6IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgcmV0dXJuIG9iamVjdDtcbn07XG4iLCJ2YXIgZG9jdW1lbnQgPSByZXF1aXJlKCcuL19nbG9iYWwnKS5kb2N1bWVudDtcbm1vZHVsZS5leHBvcnRzID0gZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuIiwibW9kdWxlLmV4cG9ydHMgPSAhcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSAmJiAhcmVxdWlyZSgnLi9fZmFpbHMnKShmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkocmVxdWlyZSgnLi9fZG9tLWNyZWF0ZScpKCdkaXYnKSwgJ2EnLCB7IGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gNzsgfSB9KS5hICE9IDc7XG59KTtcbiIsIi8vIGZhc3QgYXBwbHksIGh0dHA6Ly9qc3BlcmYubG5raXQuY29tL2Zhc3QtYXBwbHkvNVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZm4sIGFyZ3MsIHRoYXQpIHtcbiAgdmFyIHVuID0gdGhhdCA9PT0gdW5kZWZpbmVkO1xuICBzd2l0Y2ggKGFyZ3MubGVuZ3RoKSB7XG4gICAgY2FzZSAwOiByZXR1cm4gdW4gPyBmbigpXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQpO1xuICAgIGNhc2UgMTogcmV0dXJuIHVuID8gZm4oYXJnc1swXSlcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSk7XG4gICAgY2FzZSAyOiByZXR1cm4gdW4gPyBmbihhcmdzWzBdLCBhcmdzWzFdKVxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdKTtcbiAgICBjYXNlIDM6IHJldHVybiB1biA/IGZuKGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQsIGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pO1xuICAgIGNhc2UgNDogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSlcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSk7XG4gIH0gcmV0dXJuIGZuLmFwcGx5KHRoYXQsIGFyZ3MpO1xufTtcbiIsIi8vIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgYW5kIG5vbi1lbnVtZXJhYmxlIG9sZCBWOCBzdHJpbmdzXG52YXIgY29mID0gcmVxdWlyZSgnLi9fY29mJyk7XG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcHJvdG90eXBlLWJ1aWx0aW5zXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdCgneicpLnByb3BlcnR5SXNFbnVtZXJhYmxlKDApID8gT2JqZWN0IDogZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBjb2YoaXQpID09ICdTdHJpbmcnID8gaXQuc3BsaXQoJycpIDogT2JqZWN0KGl0KTtcbn07XG4iLCIvLyBjaGVjayBvbiBkZWZhdWx0IEFycmF5IGl0ZXJhdG9yXG52YXIgSXRlcmF0b3JzID0gcmVxdWlyZSgnLi9faXRlcmF0b3JzJyk7XG52YXIgSVRFUkFUT1IgPSByZXF1aXJlKCcuL193a3MnKSgnaXRlcmF0b3InKTtcbnZhciBBcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXQgIT09IHVuZGVmaW5lZCAmJiAoSXRlcmF0b3JzLkFycmF5ID09PSBpdCB8fCBBcnJheVByb3RvW0lURVJBVE9SXSA9PT0gaXQpO1xufTtcbiIsIi8vIDcuMi4yIElzQXJyYXkoYXJndW1lbnQpXG52YXIgY29mID0gcmVxdWlyZSgnLi9fY29mJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gaXNBcnJheShhcmcpIHtcbiAgcmV0dXJuIGNvZihhcmcpID09ICdBcnJheSc7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PT0gJ29iamVjdCcgPyBpdCAhPT0gbnVsbCA6IHR5cGVvZiBpdCA9PT0gJ2Z1bmN0aW9uJztcbn07XG4iLCIvLyBjYWxsIHNvbWV0aGluZyBvbiBpdGVyYXRvciBzdGVwIHdpdGggc2FmZSBjbG9zaW5nIG9uIGVycm9yXG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0ZXJhdG9yLCBmbiwgdmFsdWUsIGVudHJpZXMpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZW50cmllcyA/IGZuKGFuT2JqZWN0KHZhbHVlKVswXSwgdmFsdWVbMV0pIDogZm4odmFsdWUpO1xuICAvLyA3LjQuNiBJdGVyYXRvckNsb3NlKGl0ZXJhdG9yLCBjb21wbGV0aW9uKVxuICB9IGNhdGNoIChlKSB7XG4gICAgdmFyIHJldCA9IGl0ZXJhdG9yWydyZXR1cm4nXTtcbiAgICBpZiAocmV0ICE9PSB1bmRlZmluZWQpIGFuT2JqZWN0KHJldC5jYWxsKGl0ZXJhdG9yKSk7XG4gICAgdGhyb3cgZTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBjcmVhdGUgPSByZXF1aXJlKCcuL19vYmplY3QtY3JlYXRlJyk7XG52YXIgZGVzY3JpcHRvciA9IHJlcXVpcmUoJy4vX3Byb3BlcnR5LWRlc2MnKTtcbnZhciBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4vX3NldC10by1zdHJpbmctdGFnJyk7XG52YXIgSXRlcmF0b3JQcm90b3R5cGUgPSB7fTtcblxuLy8gMjUuMS4yLjEuMSAlSXRlcmF0b3JQcm90b3R5cGUlW0BAaXRlcmF0b3JdKClcbnJlcXVpcmUoJy4vX2hpZGUnKShJdGVyYXRvclByb3RvdHlwZSwgcmVxdWlyZSgnLi9fd2tzJykoJ2l0ZXJhdG9yJyksIGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgTkFNRSwgbmV4dCkge1xuICBDb25zdHJ1Y3Rvci5wcm90b3R5cGUgPSBjcmVhdGUoSXRlcmF0b3JQcm90b3R5cGUsIHsgbmV4dDogZGVzY3JpcHRvcigxLCBuZXh0KSB9KTtcbiAgc2V0VG9TdHJpbmdUYWcoQ29uc3RydWN0b3IsIE5BTUUgKyAnIEl0ZXJhdG9yJyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIExJQlJBUlkgPSByZXF1aXJlKCcuL19saWJyYXJ5Jyk7XG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpO1xudmFyIHJlZGVmaW5lID0gcmVxdWlyZSgnLi9fcmVkZWZpbmUnKTtcbnZhciBoaWRlID0gcmVxdWlyZSgnLi9faGlkZScpO1xudmFyIEl0ZXJhdG9ycyA9IHJlcXVpcmUoJy4vX2l0ZXJhdG9ycycpO1xudmFyICRpdGVyQ3JlYXRlID0gcmVxdWlyZSgnLi9faXRlci1jcmVhdGUnKTtcbnZhciBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4vX3NldC10by1zdHJpbmctdGFnJyk7XG52YXIgZ2V0UHJvdG90eXBlT2YgPSByZXF1aXJlKCcuL19vYmplY3QtZ3BvJyk7XG52YXIgSVRFUkFUT1IgPSByZXF1aXJlKCcuL193a3MnKSgnaXRlcmF0b3InKTtcbnZhciBCVUdHWSA9ICEoW10ua2V5cyAmJiAnbmV4dCcgaW4gW10ua2V5cygpKTsgLy8gU2FmYXJpIGhhcyBidWdneSBpdGVyYXRvcnMgdy9vIGBuZXh0YFxudmFyIEZGX0lURVJBVE9SID0gJ0BAaXRlcmF0b3InO1xudmFyIEtFWVMgPSAna2V5cyc7XG52YXIgVkFMVUVTID0gJ3ZhbHVlcyc7XG5cbnZhciByZXR1cm5UaGlzID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoQmFzZSwgTkFNRSwgQ29uc3RydWN0b3IsIG5leHQsIERFRkFVTFQsIElTX1NFVCwgRk9SQ0VEKSB7XG4gICRpdGVyQ3JlYXRlKENvbnN0cnVjdG9yLCBOQU1FLCBuZXh0KTtcbiAgdmFyIGdldE1ldGhvZCA9IGZ1bmN0aW9uIChraW5kKSB7XG4gICAgaWYgKCFCVUdHWSAmJiBraW5kIGluIHByb3RvKSByZXR1cm4gcHJvdG9ba2luZF07XG4gICAgc3dpdGNoIChraW5kKSB7XG4gICAgICBjYXNlIEtFWVM6IHJldHVybiBmdW5jdGlvbiBrZXlzKCkgeyByZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRoaXMsIGtpbmQpOyB9O1xuICAgICAgY2FzZSBWQUxVRVM6IHJldHVybiBmdW5jdGlvbiB2YWx1ZXMoKSB7IHJldHVybiBuZXcgQ29uc3RydWN0b3IodGhpcywga2luZCk7IH07XG4gICAgfSByZXR1cm4gZnVuY3Rpb24gZW50cmllcygpIHsgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0aGlzLCBraW5kKTsgfTtcbiAgfTtcbiAgdmFyIFRBRyA9IE5BTUUgKyAnIEl0ZXJhdG9yJztcbiAgdmFyIERFRl9WQUxVRVMgPSBERUZBVUxUID09IFZBTFVFUztcbiAgdmFyIFZBTFVFU19CVUcgPSBmYWxzZTtcbiAgdmFyIHByb3RvID0gQmFzZS5wcm90b3R5cGU7XG4gIHZhciAkbmF0aXZlID0gcHJvdG9bSVRFUkFUT1JdIHx8IHByb3RvW0ZGX0lURVJBVE9SXSB8fCBERUZBVUxUICYmIHByb3RvW0RFRkFVTFRdO1xuICB2YXIgJGRlZmF1bHQgPSAkbmF0aXZlIHx8IGdldE1ldGhvZChERUZBVUxUKTtcbiAgdmFyICRlbnRyaWVzID0gREVGQVVMVCA/ICFERUZfVkFMVUVTID8gJGRlZmF1bHQgOiBnZXRNZXRob2QoJ2VudHJpZXMnKSA6IHVuZGVmaW5lZDtcbiAgdmFyICRhbnlOYXRpdmUgPSBOQU1FID09ICdBcnJheScgPyBwcm90by5lbnRyaWVzIHx8ICRuYXRpdmUgOiAkbmF0aXZlO1xuICB2YXIgbWV0aG9kcywga2V5LCBJdGVyYXRvclByb3RvdHlwZTtcbiAgLy8gRml4IG5hdGl2ZVxuICBpZiAoJGFueU5hdGl2ZSkge1xuICAgIEl0ZXJhdG9yUHJvdG90eXBlID0gZ2V0UHJvdG90eXBlT2YoJGFueU5hdGl2ZS5jYWxsKG5ldyBCYXNlKCkpKTtcbiAgICBpZiAoSXRlcmF0b3JQcm90b3R5cGUgIT09IE9iamVjdC5wcm90b3R5cGUgJiYgSXRlcmF0b3JQcm90b3R5cGUubmV4dCkge1xuICAgICAgLy8gU2V0IEBAdG9TdHJpbmdUYWcgdG8gbmF0aXZlIGl0ZXJhdG9yc1xuICAgICAgc2V0VG9TdHJpbmdUYWcoSXRlcmF0b3JQcm90b3R5cGUsIFRBRywgdHJ1ZSk7XG4gICAgICAvLyBmaXggZm9yIHNvbWUgb2xkIGVuZ2luZXNcbiAgICAgIGlmICghTElCUkFSWSAmJiB0eXBlb2YgSXRlcmF0b3JQcm90b3R5cGVbSVRFUkFUT1JdICE9ICdmdW5jdGlvbicpIGhpZGUoSXRlcmF0b3JQcm90b3R5cGUsIElURVJBVE9SLCByZXR1cm5UaGlzKTtcbiAgICB9XG4gIH1cbiAgLy8gZml4IEFycmF5I3t2YWx1ZXMsIEBAaXRlcmF0b3J9Lm5hbWUgaW4gVjggLyBGRlxuICBpZiAoREVGX1ZBTFVFUyAmJiAkbmF0aXZlICYmICRuYXRpdmUubmFtZSAhPT0gVkFMVUVTKSB7XG4gICAgVkFMVUVTX0JVRyA9IHRydWU7XG4gICAgJGRlZmF1bHQgPSBmdW5jdGlvbiB2YWx1ZXMoKSB7IHJldHVybiAkbmF0aXZlLmNhbGwodGhpcyk7IH07XG4gIH1cbiAgLy8gRGVmaW5lIGl0ZXJhdG9yXG4gIGlmICgoIUxJQlJBUlkgfHwgRk9SQ0VEKSAmJiAoQlVHR1kgfHwgVkFMVUVTX0JVRyB8fCAhcHJvdG9bSVRFUkFUT1JdKSkge1xuICAgIGhpZGUocHJvdG8sIElURVJBVE9SLCAkZGVmYXVsdCk7XG4gIH1cbiAgLy8gUGx1ZyBmb3IgbGlicmFyeVxuICBJdGVyYXRvcnNbTkFNRV0gPSAkZGVmYXVsdDtcbiAgSXRlcmF0b3JzW1RBR10gPSByZXR1cm5UaGlzO1xuICBpZiAoREVGQVVMVCkge1xuICAgIG1ldGhvZHMgPSB7XG4gICAgICB2YWx1ZXM6IERFRl9WQUxVRVMgPyAkZGVmYXVsdCA6IGdldE1ldGhvZChWQUxVRVMpLFxuICAgICAga2V5czogSVNfU0VUID8gJGRlZmF1bHQgOiBnZXRNZXRob2QoS0VZUyksXG4gICAgICBlbnRyaWVzOiAkZW50cmllc1xuICAgIH07XG4gICAgaWYgKEZPUkNFRCkgZm9yIChrZXkgaW4gbWV0aG9kcykge1xuICAgICAgaWYgKCEoa2V5IGluIHByb3RvKSkgcmVkZWZpbmUocHJvdG8sIGtleSwgbWV0aG9kc1trZXldKTtcbiAgICB9IGVsc2UgJGV4cG9ydCgkZXhwb3J0LlAgKyAkZXhwb3J0LkYgKiAoQlVHR1kgfHwgVkFMVUVTX0JVRyksIE5BTUUsIG1ldGhvZHMpO1xuICB9XG4gIHJldHVybiBtZXRob2RzO1xufTtcbiIsInZhciBJVEVSQVRPUiA9IHJlcXVpcmUoJy4vX3drcycpKCdpdGVyYXRvcicpO1xudmFyIFNBRkVfQ0xPU0lORyA9IGZhbHNlO1xuXG50cnkge1xuICB2YXIgcml0ZXIgPSBbN11bSVRFUkFUT1JdKCk7XG4gIHJpdGVyWydyZXR1cm4nXSA9IGZ1bmN0aW9uICgpIHsgU0FGRV9DTE9TSU5HID0gdHJ1ZTsgfTtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXRocm93LWxpdGVyYWxcbiAgQXJyYXkuZnJvbShyaXRlciwgZnVuY3Rpb24gKCkgeyB0aHJvdyAyOyB9KTtcbn0gY2F0Y2ggKGUpIHsgLyogZW1wdHkgKi8gfVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChleGVjLCBza2lwQ2xvc2luZykge1xuICBpZiAoIXNraXBDbG9zaW5nICYmICFTQUZFX0NMT1NJTkcpIHJldHVybiBmYWxzZTtcbiAgdmFyIHNhZmUgPSBmYWxzZTtcbiAgdHJ5IHtcbiAgICB2YXIgYXJyID0gWzddO1xuICAgIHZhciBpdGVyID0gYXJyW0lURVJBVE9SXSgpO1xuICAgIGl0ZXIubmV4dCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHsgZG9uZTogc2FmZSA9IHRydWUgfTsgfTtcbiAgICBhcnJbSVRFUkFUT1JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gaXRlcjsgfTtcbiAgICBleGVjKGFycik7XG4gIH0gY2F0Y2ggKGUpIHsgLyogZW1wdHkgKi8gfVxuICByZXR1cm4gc2FmZTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkb25lLCB2YWx1ZSkge1xuICByZXR1cm4geyB2YWx1ZTogdmFsdWUsIGRvbmU6ICEhZG9uZSB9O1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge307XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHRydWU7XG4iLCJ2YXIgTUVUQSA9IHJlcXVpcmUoJy4vX3VpZCcpKCdtZXRhJyk7XG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbnZhciBoYXMgPSByZXF1aXJlKCcuL19oYXMnKTtcbnZhciBzZXREZXNjID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJykuZjtcbnZhciBpZCA9IDA7XG52YXIgaXNFeHRlbnNpYmxlID0gT2JqZWN0LmlzRXh0ZW5zaWJsZSB8fCBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0cnVlO1xufTtcbnZhciBGUkVFWkUgPSAhcmVxdWlyZSgnLi9fZmFpbHMnKShmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBpc0V4dGVuc2libGUoT2JqZWN0LnByZXZlbnRFeHRlbnNpb25zKHt9KSk7XG59KTtcbnZhciBzZXRNZXRhID0gZnVuY3Rpb24gKGl0KSB7XG4gIHNldERlc2MoaXQsIE1FVEEsIHsgdmFsdWU6IHtcbiAgICBpOiAnTycgKyArK2lkLCAvLyBvYmplY3QgSURcbiAgICB3OiB7fSAgICAgICAgICAvLyB3ZWFrIGNvbGxlY3Rpb25zIElEc1xuICB9IH0pO1xufTtcbnZhciBmYXN0S2V5ID0gZnVuY3Rpb24gKGl0LCBjcmVhdGUpIHtcbiAgLy8gcmV0dXJuIHByaW1pdGl2ZSB3aXRoIHByZWZpeFxuICBpZiAoIWlzT2JqZWN0KGl0KSkgcmV0dXJuIHR5cGVvZiBpdCA9PSAnc3ltYm9sJyA/IGl0IDogKHR5cGVvZiBpdCA9PSAnc3RyaW5nJyA/ICdTJyA6ICdQJykgKyBpdDtcbiAgaWYgKCFoYXMoaXQsIE1FVEEpKSB7XG4gICAgLy8gY2FuJ3Qgc2V0IG1ldGFkYXRhIHRvIHVuY2F1Z2h0IGZyb3plbiBvYmplY3RcbiAgICBpZiAoIWlzRXh0ZW5zaWJsZShpdCkpIHJldHVybiAnRic7XG4gICAgLy8gbm90IG5lY2Vzc2FyeSB0byBhZGQgbWV0YWRhdGFcbiAgICBpZiAoIWNyZWF0ZSkgcmV0dXJuICdFJztcbiAgICAvLyBhZGQgbWlzc2luZyBtZXRhZGF0YVxuICAgIHNldE1ldGEoaXQpO1xuICAvLyByZXR1cm4gb2JqZWN0IElEXG4gIH0gcmV0dXJuIGl0W01FVEFdLmk7XG59O1xudmFyIGdldFdlYWsgPSBmdW5jdGlvbiAoaXQsIGNyZWF0ZSkge1xuICBpZiAoIWhhcyhpdCwgTUVUQSkpIHtcbiAgICAvLyBjYW4ndCBzZXQgbWV0YWRhdGEgdG8gdW5jYXVnaHQgZnJvemVuIG9iamVjdFxuICAgIGlmICghaXNFeHRlbnNpYmxlKGl0KSkgcmV0dXJuIHRydWU7XG4gICAgLy8gbm90IG5lY2Vzc2FyeSB0byBhZGQgbWV0YWRhdGFcbiAgICBpZiAoIWNyZWF0ZSkgcmV0dXJuIGZhbHNlO1xuICAgIC8vIGFkZCBtaXNzaW5nIG1ldGFkYXRhXG4gICAgc2V0TWV0YShpdCk7XG4gIC8vIHJldHVybiBoYXNoIHdlYWsgY29sbGVjdGlvbnMgSURzXG4gIH0gcmV0dXJuIGl0W01FVEFdLnc7XG59O1xuLy8gYWRkIG1ldGFkYXRhIG9uIGZyZWV6ZS1mYW1pbHkgbWV0aG9kcyBjYWxsaW5nXG52YXIgb25GcmVlemUgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKEZSRUVaRSAmJiBtZXRhLk5FRUQgJiYgaXNFeHRlbnNpYmxlKGl0KSAmJiAhaGFzKGl0LCBNRVRBKSkgc2V0TWV0YShpdCk7XG4gIHJldHVybiBpdDtcbn07XG52YXIgbWV0YSA9IG1vZHVsZS5leHBvcnRzID0ge1xuICBLRVk6IE1FVEEsXG4gIE5FRUQ6IGZhbHNlLFxuICBmYXN0S2V5OiBmYXN0S2V5LFxuICBnZXRXZWFrOiBnZXRXZWFrLFxuICBvbkZyZWV6ZTogb25GcmVlemVcbn07XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgbWFjcm90YXNrID0gcmVxdWlyZSgnLi9fdGFzaycpLnNldDtcbnZhciBPYnNlcnZlciA9IGdsb2JhbC5NdXRhdGlvbk9ic2VydmVyIHx8IGdsb2JhbC5XZWJLaXRNdXRhdGlvbk9ic2VydmVyO1xudmFyIHByb2Nlc3MgPSBnbG9iYWwucHJvY2VzcztcbnZhciBQcm9taXNlID0gZ2xvYmFsLlByb21pc2U7XG52YXIgaXNOb2RlID0gcmVxdWlyZSgnLi9fY29mJykocHJvY2VzcykgPT0gJ3Byb2Nlc3MnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGhlYWQsIGxhc3QsIG5vdGlmeTtcblxuICB2YXIgZmx1c2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHBhcmVudCwgZm47XG4gICAgaWYgKGlzTm9kZSAmJiAocGFyZW50ID0gcHJvY2Vzcy5kb21haW4pKSBwYXJlbnQuZXhpdCgpO1xuICAgIHdoaWxlIChoZWFkKSB7XG4gICAgICBmbiA9IGhlYWQuZm47XG4gICAgICBoZWFkID0gaGVhZC5uZXh0O1xuICAgICAgdHJ5IHtcbiAgICAgICAgZm4oKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKGhlYWQpIG5vdGlmeSgpO1xuICAgICAgICBlbHNlIGxhc3QgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfSBsYXN0ID0gdW5kZWZpbmVkO1xuICAgIGlmIChwYXJlbnQpIHBhcmVudC5lbnRlcigpO1xuICB9O1xuXG4gIC8vIE5vZGUuanNcbiAgaWYgKGlzTm9kZSkge1xuICAgIG5vdGlmeSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soZmx1c2gpO1xuICAgIH07XG4gIC8vIGJyb3dzZXJzIHdpdGggTXV0YXRpb25PYnNlcnZlciwgZXhjZXB0IGlPUyBTYWZhcmkgLSBodHRwczovL2dpdGh1Yi5jb20vemxvaXJvY2svY29yZS1qcy9pc3N1ZXMvMzM5XG4gIH0gZWxzZSBpZiAoT2JzZXJ2ZXIgJiYgIShnbG9iYWwubmF2aWdhdG9yICYmIGdsb2JhbC5uYXZpZ2F0b3Iuc3RhbmRhbG9uZSkpIHtcbiAgICB2YXIgdG9nZ2xlID0gdHJ1ZTtcbiAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKTtcbiAgICBuZXcgT2JzZXJ2ZXIoZmx1c2gpLm9ic2VydmUobm9kZSwgeyBjaGFyYWN0ZXJEYXRhOiB0cnVlIH0pOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLW5ld1xuICAgIG5vdGlmeSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIG5vZGUuZGF0YSA9IHRvZ2dsZSA9ICF0b2dnbGU7XG4gICAgfTtcbiAgLy8gZW52aXJvbm1lbnRzIHdpdGggbWF5YmUgbm9uLWNvbXBsZXRlbHkgY29ycmVjdCwgYnV0IGV4aXN0ZW50IFByb21pc2VcbiAgfSBlbHNlIGlmIChQcm9taXNlICYmIFByb21pc2UucmVzb2x2ZSkge1xuICAgIC8vIFByb21pc2UucmVzb2x2ZSB3aXRob3V0IGFuIGFyZ3VtZW50IHRocm93cyBhbiBlcnJvciBpbiBMRyBXZWJPUyAyXG4gICAgdmFyIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUodW5kZWZpbmVkKTtcbiAgICBub3RpZnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBwcm9taXNlLnRoZW4oZmx1c2gpO1xuICAgIH07XG4gIC8vIGZvciBvdGhlciBlbnZpcm9ubWVudHMgLSBtYWNyb3Rhc2sgYmFzZWQgb246XG4gIC8vIC0gc2V0SW1tZWRpYXRlXG4gIC8vIC0gTWVzc2FnZUNoYW5uZWxcbiAgLy8gLSB3aW5kb3cucG9zdE1lc3NhZ1xuICAvLyAtIG9ucmVhZHlzdGF0ZWNoYW5nZVxuICAvLyAtIHNldFRpbWVvdXRcbiAgfSBlbHNlIHtcbiAgICBub3RpZnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBzdHJhbmdlIElFICsgd2VicGFjayBkZXYgc2VydmVyIGJ1ZyAtIHVzZSAuY2FsbChnbG9iYWwpXG4gICAgICBtYWNyb3Rhc2suY2FsbChnbG9iYWwsIGZsdXNoKTtcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChmbikge1xuICAgIHZhciB0YXNrID0geyBmbjogZm4sIG5leHQ6IHVuZGVmaW5lZCB9O1xuICAgIGlmIChsYXN0KSBsYXN0Lm5leHQgPSB0YXNrO1xuICAgIGlmICghaGVhZCkge1xuICAgICAgaGVhZCA9IHRhc2s7XG4gICAgICBub3RpZnkoKTtcbiAgICB9IGxhc3QgPSB0YXNrO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0Jztcbi8vIDI1LjQuMS41IE5ld1Byb21pc2VDYXBhYmlsaXR5KEMpXG52YXIgYUZ1bmN0aW9uID0gcmVxdWlyZSgnLi9fYS1mdW5jdGlvbicpO1xuXG5mdW5jdGlvbiBQcm9taXNlQ2FwYWJpbGl0eShDKSB7XG4gIHZhciByZXNvbHZlLCByZWplY3Q7XG4gIHRoaXMucHJvbWlzZSA9IG5ldyBDKGZ1bmN0aW9uICgkJHJlc29sdmUsICQkcmVqZWN0KSB7XG4gICAgaWYgKHJlc29sdmUgIT09IHVuZGVmaW5lZCB8fCByZWplY3QgIT09IHVuZGVmaW5lZCkgdGhyb3cgVHlwZUVycm9yKCdCYWQgUHJvbWlzZSBjb25zdHJ1Y3RvcicpO1xuICAgIHJlc29sdmUgPSAkJHJlc29sdmU7XG4gICAgcmVqZWN0ID0gJCRyZWplY3Q7XG4gIH0pO1xuICB0aGlzLnJlc29sdmUgPSBhRnVuY3Rpb24ocmVzb2x2ZSk7XG4gIHRoaXMucmVqZWN0ID0gYUZ1bmN0aW9uKHJlamVjdCk7XG59XG5cbm1vZHVsZS5leHBvcnRzLmYgPSBmdW5jdGlvbiAoQykge1xuICByZXR1cm4gbmV3IFByb21pc2VDYXBhYmlsaXR5KEMpO1xufTtcbiIsIi8vIDE5LjEuMi4yIC8gMTUuMi4zLjUgT2JqZWN0LmNyZWF0ZShPIFssIFByb3BlcnRpZXNdKVxudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0Jyk7XG52YXIgZFBzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwcycpO1xudmFyIGVudW1CdWdLZXlzID0gcmVxdWlyZSgnLi9fZW51bS1idWcta2V5cycpO1xudmFyIElFX1BST1RPID0gcmVxdWlyZSgnLi9fc2hhcmVkLWtleScpKCdJRV9QUk9UTycpO1xudmFyIEVtcHR5ID0gZnVuY3Rpb24gKCkgeyAvKiBlbXB0eSAqLyB9O1xudmFyIFBST1RPVFlQRSA9ICdwcm90b3R5cGUnO1xuXG4vLyBDcmVhdGUgb2JqZWN0IHdpdGggZmFrZSBgbnVsbGAgcHJvdG90eXBlOiB1c2UgaWZyYW1lIE9iamVjdCB3aXRoIGNsZWFyZWQgcHJvdG90eXBlXG52YXIgY3JlYXRlRGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gVGhyYXNoLCB3YXN0ZSBhbmQgc29kb215OiBJRSBHQyBidWdcbiAgdmFyIGlmcmFtZSA9IHJlcXVpcmUoJy4vX2RvbS1jcmVhdGUnKSgnaWZyYW1lJyk7XG4gIHZhciBpID0gZW51bUJ1Z0tleXMubGVuZ3RoO1xuICB2YXIgbHQgPSAnPCc7XG4gIHZhciBndCA9ICc+JztcbiAgdmFyIGlmcmFtZURvY3VtZW50O1xuICBpZnJhbWUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgcmVxdWlyZSgnLi9faHRtbCcpLmFwcGVuZENoaWxkKGlmcmFtZSk7XG4gIGlmcmFtZS5zcmMgPSAnamF2YXNjcmlwdDonOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNjcmlwdC11cmxcbiAgLy8gY3JlYXRlRGljdCA9IGlmcmFtZS5jb250ZW50V2luZG93Lk9iamVjdDtcbiAgLy8gaHRtbC5yZW1vdmVDaGlsZChpZnJhbWUpO1xuICBpZnJhbWVEb2N1bWVudCA9IGlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50O1xuICBpZnJhbWVEb2N1bWVudC5vcGVuKCk7XG4gIGlmcmFtZURvY3VtZW50LndyaXRlKGx0ICsgJ3NjcmlwdCcgKyBndCArICdkb2N1bWVudC5GPU9iamVjdCcgKyBsdCArICcvc2NyaXB0JyArIGd0KTtcbiAgaWZyYW1lRG9jdW1lbnQuY2xvc2UoKTtcbiAgY3JlYXRlRGljdCA9IGlmcmFtZURvY3VtZW50LkY7XG4gIHdoaWxlIChpLS0pIGRlbGV0ZSBjcmVhdGVEaWN0W1BST1RPVFlQRV1bZW51bUJ1Z0tleXNbaV1dO1xuICByZXR1cm4gY3JlYXRlRGljdCgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlIHx8IGZ1bmN0aW9uIGNyZWF0ZShPLCBQcm9wZXJ0aWVzKSB7XG4gIHZhciByZXN1bHQ7XG4gIGlmIChPICE9PSBudWxsKSB7XG4gICAgRW1wdHlbUFJPVE9UWVBFXSA9IGFuT2JqZWN0KE8pO1xuICAgIHJlc3VsdCA9IG5ldyBFbXB0eSgpO1xuICAgIEVtcHR5W1BST1RPVFlQRV0gPSBudWxsO1xuICAgIC8vIGFkZCBcIl9fcHJvdG9fX1wiIGZvciBPYmplY3QuZ2V0UHJvdG90eXBlT2YgcG9seWZpbGxcbiAgICByZXN1bHRbSUVfUFJPVE9dID0gTztcbiAgfSBlbHNlIHJlc3VsdCA9IGNyZWF0ZURpY3QoKTtcbiAgcmV0dXJuIFByb3BlcnRpZXMgPT09IHVuZGVmaW5lZCA/IHJlc3VsdCA6IGRQcyhyZXN1bHQsIFByb3BlcnRpZXMpO1xufTtcbiIsInZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIElFOF9ET01fREVGSU5FID0gcmVxdWlyZSgnLi9faWU4LWRvbS1kZWZpbmUnKTtcbnZhciB0b1ByaW1pdGl2ZSA9IHJlcXVpcmUoJy4vX3RvLXByaW1pdGl2ZScpO1xudmFyIGRQID0gT2JqZWN0LmRlZmluZVByb3BlcnR5O1xuXG5leHBvcnRzLmYgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gT2JqZWN0LmRlZmluZVByb3BlcnR5IDogZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcykge1xuICBhbk9iamVjdChPKTtcbiAgUCA9IHRvUHJpbWl0aXZlKFAsIHRydWUpO1xuICBhbk9iamVjdChBdHRyaWJ1dGVzKTtcbiAgaWYgKElFOF9ET01fREVGSU5FKSB0cnkge1xuICAgIHJldHVybiBkUChPLCBQLCBBdHRyaWJ1dGVzKTtcbiAgfSBjYXRjaCAoZSkgeyAvKiBlbXB0eSAqLyB9XG4gIGlmICgnZ2V0JyBpbiBBdHRyaWJ1dGVzIHx8ICdzZXQnIGluIEF0dHJpYnV0ZXMpIHRocm93IFR5cGVFcnJvcignQWNjZXNzb3JzIG5vdCBzdXBwb3J0ZWQhJyk7XG4gIGlmICgndmFsdWUnIGluIEF0dHJpYnV0ZXMpIE9bUF0gPSBBdHRyaWJ1dGVzLnZhbHVlO1xuICByZXR1cm4gTztcbn07XG4iLCJ2YXIgZFAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKTtcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIGdldEtleXMgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgPyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyA6IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXMoTywgUHJvcGVydGllcykge1xuICBhbk9iamVjdChPKTtcbiAgdmFyIGtleXMgPSBnZXRLZXlzKFByb3BlcnRpZXMpO1xuICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gIHZhciBpID0gMDtcbiAgdmFyIFA7XG4gIHdoaWxlIChsZW5ndGggPiBpKSBkUC5mKE8sIFAgPSBrZXlzW2krK10sIFByb3BlcnRpZXNbUF0pO1xuICByZXR1cm4gTztcbn07XG4iLCJ2YXIgcElFID0gcmVxdWlyZSgnLi9fb2JqZWN0LXBpZScpO1xudmFyIGNyZWF0ZURlc2MgPSByZXF1aXJlKCcuL19wcm9wZXJ0eS1kZXNjJyk7XG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpO1xudmFyIHRvUHJpbWl0aXZlID0gcmVxdWlyZSgnLi9fdG8tcHJpbWl0aXZlJyk7XG52YXIgaGFzID0gcmVxdWlyZSgnLi9faGFzJyk7XG52YXIgSUU4X0RPTV9ERUZJTkUgPSByZXF1aXJlKCcuL19pZTgtZG9tLWRlZmluZScpO1xudmFyIGdPUEQgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xuXG5leHBvcnRzLmYgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gZ09QRCA6IGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKSB7XG4gIE8gPSB0b0lPYmplY3QoTyk7XG4gIFAgPSB0b1ByaW1pdGl2ZShQLCB0cnVlKTtcbiAgaWYgKElFOF9ET01fREVGSU5FKSB0cnkge1xuICAgIHJldHVybiBnT1BEKE8sIFApO1xuICB9IGNhdGNoIChlKSB7IC8qIGVtcHR5ICovIH1cbiAgaWYgKGhhcyhPLCBQKSkgcmV0dXJuIGNyZWF0ZURlc2MoIXBJRS5mLmNhbGwoTywgUCksIE9bUF0pO1xufTtcbiIsIi8vIGZhbGxiYWNrIGZvciBJRTExIGJ1Z2d5IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHdpdGggaWZyYW1lIGFuZCB3aW5kb3dcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG52YXIgZ09QTiA9IHJlcXVpcmUoJy4vX29iamVjdC1nb3BuJykuZjtcbnZhciB0b1N0cmluZyA9IHt9LnRvU3RyaW5nO1xuXG52YXIgd2luZG93TmFtZXMgPSB0eXBlb2Ygd2luZG93ID09ICdvYmplY3QnICYmIHdpbmRvdyAmJiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lc1xuICA/IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHdpbmRvdykgOiBbXTtcblxudmFyIGdldFdpbmRvd05hbWVzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGdPUE4oaXQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHdpbmRvd05hbWVzLnNsaWNlKCk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzLmYgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eU5hbWVzKGl0KSB7XG4gIHJldHVybiB3aW5kb3dOYW1lcyAmJiB0b1N0cmluZy5jYWxsKGl0KSA9PSAnW29iamVjdCBXaW5kb3ddJyA/IGdldFdpbmRvd05hbWVzKGl0KSA6IGdPUE4odG9JT2JqZWN0KGl0KSk7XG59O1xuIiwiLy8gMTkuMS4yLjcgLyAxNS4yLjMuNCBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhPKVxudmFyICRrZXlzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMtaW50ZXJuYWwnKTtcbnZhciBoaWRkZW5LZXlzID0gcmVxdWlyZSgnLi9fZW51bS1idWcta2V5cycpLmNvbmNhdCgnbGVuZ3RoJywgJ3Byb3RvdHlwZScpO1xuXG5leHBvcnRzLmYgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyB8fCBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eU5hbWVzKE8pIHtcbiAgcmV0dXJuICRrZXlzKE8sIGhpZGRlbktleXMpO1xufTtcbiIsImV4cG9ydHMuZiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG4iLCIvLyAxOS4xLjIuOSAvIDE1LjIuMy4yIE9iamVjdC5nZXRQcm90b3R5cGVPZihPKVxudmFyIGhhcyA9IHJlcXVpcmUoJy4vX2hhcycpO1xudmFyIHRvT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8tb2JqZWN0Jyk7XG52YXIgSUVfUFJPVE8gPSByZXF1aXJlKCcuL19zaGFyZWQta2V5JykoJ0lFX1BST1RPJyk7XG52YXIgT2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5nZXRQcm90b3R5cGVPZiB8fCBmdW5jdGlvbiAoTykge1xuICBPID0gdG9PYmplY3QoTyk7XG4gIGlmIChoYXMoTywgSUVfUFJPVE8pKSByZXR1cm4gT1tJRV9QUk9UT107XG4gIGlmICh0eXBlb2YgTy5jb25zdHJ1Y3RvciA9PSAnZnVuY3Rpb24nICYmIE8gaW5zdGFuY2VvZiBPLmNvbnN0cnVjdG9yKSB7XG4gICAgcmV0dXJuIE8uY29uc3RydWN0b3IucHJvdG90eXBlO1xuICB9IHJldHVybiBPIGluc3RhbmNlb2YgT2JqZWN0ID8gT2JqZWN0UHJvdG8gOiBudWxsO1xufTtcbiIsInZhciBoYXMgPSByZXF1aXJlKCcuL19oYXMnKTtcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG52YXIgYXJyYXlJbmRleE9mID0gcmVxdWlyZSgnLi9fYXJyYXktaW5jbHVkZXMnKShmYWxzZSk7XG52YXIgSUVfUFJPVE8gPSByZXF1aXJlKCcuL19zaGFyZWQta2V5JykoJ0lFX1BST1RPJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZXMpIHtcbiAgdmFyIE8gPSB0b0lPYmplY3Qob2JqZWN0KTtcbiAgdmFyIGkgPSAwO1xuICB2YXIgcmVzdWx0ID0gW107XG4gIHZhciBrZXk7XG4gIGZvciAoa2V5IGluIE8pIGlmIChrZXkgIT0gSUVfUFJPVE8pIGhhcyhPLCBrZXkpICYmIHJlc3VsdC5wdXNoKGtleSk7XG4gIC8vIERvbid0IGVudW0gYnVnICYgaGlkZGVuIGtleXNcbiAgd2hpbGUgKG5hbWVzLmxlbmd0aCA+IGkpIGlmIChoYXMoTywga2V5ID0gbmFtZXNbaSsrXSkpIHtcbiAgICB+YXJyYXlJbmRleE9mKHJlc3VsdCwga2V5KSB8fCByZXN1bHQucHVzaChrZXkpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59O1xuIiwiLy8gMTkuMS4yLjE0IC8gMTUuMi4zLjE0IE9iamVjdC5rZXlzKE8pXG52YXIgJGtleXMgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cy1pbnRlcm5hbCcpO1xudmFyIGVudW1CdWdLZXlzID0gcmVxdWlyZSgnLi9fZW51bS1idWcta2V5cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIGtleXMoTykge1xuICByZXR1cm4gJGtleXMoTywgZW51bUJ1Z0tleXMpO1xufTtcbiIsImV4cG9ydHMuZiA9IHt9LnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuIiwiLy8gbW9zdCBPYmplY3QgbWV0aG9kcyBieSBFUzYgc2hvdWxkIGFjY2VwdCBwcmltaXRpdmVzXG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpO1xudmFyIGNvcmUgPSByZXF1aXJlKCcuL19jb3JlJyk7XG52YXIgZmFpbHMgPSByZXF1aXJlKCcuL19mYWlscycpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoS0VZLCBleGVjKSB7XG4gIHZhciBmbiA9IChjb3JlLk9iamVjdCB8fCB7fSlbS0VZXSB8fCBPYmplY3RbS0VZXTtcbiAgdmFyIGV4cCA9IHt9O1xuICBleHBbS0VZXSA9IGV4ZWMoZm4pO1xuICAkZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqIGZhaWxzKGZ1bmN0aW9uICgpIHsgZm4oMSk7IH0pLCAnT2JqZWN0JywgZXhwKTtcbn07XG4iLCJ2YXIgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpO1xudmFyIGdldEtleXMgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cycpO1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKTtcbnZhciBpc0VudW0gPSByZXF1aXJlKCcuL19vYmplY3QtcGllJykuZjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGlzRW50cmllcykge1xuICByZXR1cm4gZnVuY3Rpb24gKGl0KSB7XG4gICAgdmFyIE8gPSB0b0lPYmplY3QoaXQpO1xuICAgIHZhciBrZXlzID0gZ2V0S2V5cyhPKTtcbiAgICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgdmFyIGkgPSAwO1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICB2YXIga2V5O1xuICAgIHdoaWxlIChsZW5ndGggPiBpKSB7XG4gICAgICBrZXkgPSBrZXlzW2krK107XG4gICAgICBpZiAoIURFU0NSSVBUT1JTIHx8IGlzRW51bS5jYWxsKE8sIGtleSkpIHtcbiAgICAgICAgcmVzdWx0LnB1c2goaXNFbnRyaWVzID8gW2tleSwgT1trZXldXSA6IE9ba2V5XSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59O1xuIiwiLy8gYWxsIG9iamVjdCBrZXlzLCBpbmNsdWRlcyBub24tZW51bWVyYWJsZSBhbmQgc3ltYm9sc1xudmFyIGdPUE4gPSByZXF1aXJlKCcuL19vYmplY3QtZ29wbicpO1xudmFyIGdPUFMgPSByZXF1aXJlKCcuL19vYmplY3QtZ29wcycpO1xudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0Jyk7XG52YXIgUmVmbGVjdCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpLlJlZmxlY3Q7XG5tb2R1bGUuZXhwb3J0cyA9IFJlZmxlY3QgJiYgUmVmbGVjdC5vd25LZXlzIHx8IGZ1bmN0aW9uIG93bktleXMoaXQpIHtcbiAgdmFyIGtleXMgPSBnT1BOLmYoYW5PYmplY3QoaXQpKTtcbiAgdmFyIGdldFN5bWJvbHMgPSBnT1BTLmY7XG4gIHJldHVybiBnZXRTeW1ib2xzID8ga2V5cy5jb25jYXQoZ2V0U3ltYm9scyhpdCkpIDoga2V5cztcbn07XG4iLCJ2YXIgJHBhcnNlSW50ID0gcmVxdWlyZSgnLi9fZ2xvYmFsJykucGFyc2VJbnQ7XG52YXIgJHRyaW0gPSByZXF1aXJlKCcuL19zdHJpbmctdHJpbScpLnRyaW07XG52YXIgd3MgPSByZXF1aXJlKCcuL19zdHJpbmctd3MnKTtcbnZhciBoZXggPSAvXlstK10/MFt4WF0vO1xuXG5tb2R1bGUuZXhwb3J0cyA9ICRwYXJzZUludCh3cyArICcwOCcpICE9PSA4IHx8ICRwYXJzZUludCh3cyArICcweDE2JykgIT09IDIyID8gZnVuY3Rpb24gcGFyc2VJbnQoc3RyLCByYWRpeCkge1xuICB2YXIgc3RyaW5nID0gJHRyaW0oU3RyaW5nKHN0ciksIDMpO1xuICByZXR1cm4gJHBhcnNlSW50KHN0cmluZywgKHJhZGl4ID4+PiAwKSB8fCAoaGV4LnRlc3Qoc3RyaW5nKSA/IDE2IDogMTApKTtcbn0gOiAkcGFyc2VJbnQ7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChleGVjKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHsgZTogZmFsc2UsIHY6IGV4ZWMoKSB9O1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHsgZTogdHJ1ZSwgdjogZSB9O1xuICB9XG59O1xuIiwidmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0Jyk7XG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbnZhciBuZXdQcm9taXNlQ2FwYWJpbGl0eSA9IHJlcXVpcmUoJy4vX25ldy1wcm9taXNlLWNhcGFiaWxpdHknKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoQywgeCkge1xuICBhbk9iamVjdChDKTtcbiAgaWYgKGlzT2JqZWN0KHgpICYmIHguY29uc3RydWN0b3IgPT09IEMpIHJldHVybiB4O1xuICB2YXIgcHJvbWlzZUNhcGFiaWxpdHkgPSBuZXdQcm9taXNlQ2FwYWJpbGl0eS5mKEMpO1xuICB2YXIgcmVzb2x2ZSA9IHByb21pc2VDYXBhYmlsaXR5LnJlc29sdmU7XG4gIHJlc29sdmUoeCk7XG4gIHJldHVybiBwcm9taXNlQ2FwYWJpbGl0eS5wcm9taXNlO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGJpdG1hcCwgdmFsdWUpIHtcbiAgcmV0dXJuIHtcbiAgICBlbnVtZXJhYmxlOiAhKGJpdG1hcCAmIDEpLFxuICAgIGNvbmZpZ3VyYWJsZTogIShiaXRtYXAgJiAyKSxcbiAgICB3cml0YWJsZTogIShiaXRtYXAgJiA0KSxcbiAgICB2YWx1ZTogdmFsdWVcbiAgfTtcbn07XG4iLCJ2YXIgaGlkZSA9IHJlcXVpcmUoJy4vX2hpZGUnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHRhcmdldCwgc3JjLCBzYWZlKSB7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIHtcbiAgICBpZiAoc2FmZSAmJiB0YXJnZXRba2V5XSkgdGFyZ2V0W2tleV0gPSBzcmNba2V5XTtcbiAgICBlbHNlIGhpZGUodGFyZ2V0LCBrZXksIHNyY1trZXldKTtcbiAgfSByZXR1cm4gdGFyZ2V0O1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9faGlkZScpO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpO1xudmFyIGNvcmUgPSByZXF1aXJlKCcuL19jb3JlJyk7XG52YXIgZFAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKTtcbnZhciBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJyk7XG52YXIgU1BFQ0lFUyA9IHJlcXVpcmUoJy4vX3drcycpKCdzcGVjaWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKEtFWSkge1xuICB2YXIgQyA9IHR5cGVvZiBjb3JlW0tFWV0gPT0gJ2Z1bmN0aW9uJyA/IGNvcmVbS0VZXSA6IGdsb2JhbFtLRVldO1xuICBpZiAoREVTQ1JJUFRPUlMgJiYgQyAmJiAhQ1tTUEVDSUVTXSkgZFAuZihDLCBTUEVDSUVTLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfVxuICB9KTtcbn07XG4iLCJ2YXIgZGVmID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJykuZjtcbnZhciBoYXMgPSByZXF1aXJlKCcuL19oYXMnKTtcbnZhciBUQUcgPSByZXF1aXJlKCcuL193a3MnKSgndG9TdHJpbmdUYWcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQsIHRhZywgc3RhdCkge1xuICBpZiAoaXQgJiYgIWhhcyhpdCA9IHN0YXQgPyBpdCA6IGl0LnByb3RvdHlwZSwgVEFHKSkgZGVmKGl0LCBUQUcsIHsgY29uZmlndXJhYmxlOiB0cnVlLCB2YWx1ZTogdGFnIH0pO1xufTtcbiIsInZhciBzaGFyZWQgPSByZXF1aXJlKCcuL19zaGFyZWQnKSgna2V5cycpO1xudmFyIHVpZCA9IHJlcXVpcmUoJy4vX3VpZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIHJldHVybiBzaGFyZWRba2V5XSB8fCAoc2hhcmVkW2tleV0gPSB1aWQoa2V5KSk7XG59O1xuIiwidmFyIGNvcmUgPSByZXF1aXJlKCcuL19jb3JlJyk7XG52YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgU0hBUkVEID0gJ19fY29yZS1qc19zaGFyZWRfXyc7XG52YXIgc3RvcmUgPSBnbG9iYWxbU0hBUkVEXSB8fCAoZ2xvYmFsW1NIQVJFRF0gPSB7fSk7XG5cbihtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gIHJldHVybiBzdG9yZVtrZXldIHx8IChzdG9yZVtrZXldID0gdmFsdWUgIT09IHVuZGVmaW5lZCA/IHZhbHVlIDoge30pO1xufSkoJ3ZlcnNpb25zJywgW10pLnB1c2goe1xuICB2ZXJzaW9uOiBjb3JlLnZlcnNpb24sXG4gIG1vZGU6IHJlcXVpcmUoJy4vX2xpYnJhcnknKSA/ICdwdXJlJyA6ICdnbG9iYWwnLFxuICBjb3B5cmlnaHQ6ICfCqSAyMDIwIERlbmlzIFB1c2hrYXJldiAoemxvaXJvY2sucnUpJ1xufSk7XG4iLCIvLyA3LjMuMjAgU3BlY2llc0NvbnN0cnVjdG9yKE8sIGRlZmF1bHRDb25zdHJ1Y3RvcilcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4vX2EtZnVuY3Rpb24nKTtcbnZhciBTUEVDSUVTID0gcmVxdWlyZSgnLi9fd2tzJykoJ3NwZWNpZXMnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE8sIEQpIHtcbiAgdmFyIEMgPSBhbk9iamVjdChPKS5jb25zdHJ1Y3RvcjtcbiAgdmFyIFM7XG4gIHJldHVybiBDID09PSB1bmRlZmluZWQgfHwgKFMgPSBhbk9iamVjdChDKVtTUEVDSUVTXSkgPT0gdW5kZWZpbmVkID8gRCA6IGFGdW5jdGlvbihTKTtcbn07XG4iLCJ2YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi9fdG8taW50ZWdlcicpO1xudmFyIGRlZmluZWQgPSByZXF1aXJlKCcuL19kZWZpbmVkJyk7XG4vLyB0cnVlICAtPiBTdHJpbmcjYXRcbi8vIGZhbHNlIC0+IFN0cmluZyNjb2RlUG9pbnRBdFxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoVE9fU1RSSU5HKSB7XG4gIHJldHVybiBmdW5jdGlvbiAodGhhdCwgcG9zKSB7XG4gICAgdmFyIHMgPSBTdHJpbmcoZGVmaW5lZCh0aGF0KSk7XG4gICAgdmFyIGkgPSB0b0ludGVnZXIocG9zKTtcbiAgICB2YXIgbCA9IHMubGVuZ3RoO1xuICAgIHZhciBhLCBiO1xuICAgIGlmIChpIDwgMCB8fCBpID49IGwpIHJldHVybiBUT19TVFJJTkcgPyAnJyA6IHVuZGVmaW5lZDtcbiAgICBhID0gcy5jaGFyQ29kZUF0KGkpO1xuICAgIHJldHVybiBhIDwgMHhkODAwIHx8IGEgPiAweGRiZmYgfHwgaSArIDEgPT09IGwgfHwgKGIgPSBzLmNoYXJDb2RlQXQoaSArIDEpKSA8IDB4ZGMwMCB8fCBiID4gMHhkZmZmXG4gICAgICA/IFRPX1NUUklORyA/IHMuY2hhckF0KGkpIDogYVxuICAgICAgOiBUT19TVFJJTkcgPyBzLnNsaWNlKGksIGkgKyAyKSA6IChhIC0gMHhkODAwIDw8IDEwKSArIChiIC0gMHhkYzAwKSArIDB4MTAwMDA7XG4gIH07XG59O1xuIiwidmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcbnZhciBkZWZpbmVkID0gcmVxdWlyZSgnLi9fZGVmaW5lZCcpO1xudmFyIGZhaWxzID0gcmVxdWlyZSgnLi9fZmFpbHMnKTtcbnZhciBzcGFjZXMgPSByZXF1aXJlKCcuL19zdHJpbmctd3MnKTtcbnZhciBzcGFjZSA9ICdbJyArIHNwYWNlcyArICddJztcbnZhciBub24gPSAnXFx1MjAwYlxcdTAwODUnO1xudmFyIGx0cmltID0gUmVnRXhwKCdeJyArIHNwYWNlICsgc3BhY2UgKyAnKicpO1xudmFyIHJ0cmltID0gUmVnRXhwKHNwYWNlICsgc3BhY2UgKyAnKiQnKTtcblxudmFyIGV4cG9ydGVyID0gZnVuY3Rpb24gKEtFWSwgZXhlYywgQUxJQVMpIHtcbiAgdmFyIGV4cCA9IHt9O1xuICB2YXIgRk9SQ0UgPSBmYWlscyhmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICEhc3BhY2VzW0tFWV0oKSB8fCBub25bS0VZXSgpICE9IG5vbjtcbiAgfSk7XG4gIHZhciBmbiA9IGV4cFtLRVldID0gRk9SQ0UgPyBleGVjKHRyaW0pIDogc3BhY2VzW0tFWV07XG4gIGlmIChBTElBUykgZXhwW0FMSUFTXSA9IGZuO1xuICAkZXhwb3J0KCRleHBvcnQuUCArICRleHBvcnQuRiAqIEZPUkNFLCAnU3RyaW5nJywgZXhwKTtcbn07XG5cbi8vIDEgLT4gU3RyaW5nI3RyaW1MZWZ0XG4vLyAyIC0+IFN0cmluZyN0cmltUmlnaHRcbi8vIDMgLT4gU3RyaW5nI3RyaW1cbnZhciB0cmltID0gZXhwb3J0ZXIudHJpbSA9IGZ1bmN0aW9uIChzdHJpbmcsIFRZUEUpIHtcbiAgc3RyaW5nID0gU3RyaW5nKGRlZmluZWQoc3RyaW5nKSk7XG4gIGlmIChUWVBFICYgMSkgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UobHRyaW0sICcnKTtcbiAgaWYgKFRZUEUgJiAyKSBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShydHJpbSwgJycpO1xuICByZXR1cm4gc3RyaW5nO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRlcjtcbiIsIm1vZHVsZS5leHBvcnRzID0gJ1xceDA5XFx4MEFcXHgwQlxceDBDXFx4MERcXHgyMFxceEEwXFx1MTY4MFxcdTE4MEVcXHUyMDAwXFx1MjAwMVxcdTIwMDJcXHUyMDAzJyArXG4gICdcXHUyMDA0XFx1MjAwNVxcdTIwMDZcXHUyMDA3XFx1MjAwOFxcdTIwMDlcXHUyMDBBXFx1MjAyRlxcdTIwNUZcXHUzMDAwXFx1MjAyOFxcdTIwMjlcXHVGRUZGJztcbiIsInZhciBjdHggPSByZXF1aXJlKCcuL19jdHgnKTtcbnZhciBpbnZva2UgPSByZXF1aXJlKCcuL19pbnZva2UnKTtcbnZhciBodG1sID0gcmVxdWlyZSgnLi9faHRtbCcpO1xudmFyIGNlbCA9IHJlcXVpcmUoJy4vX2RvbS1jcmVhdGUnKTtcbnZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciBwcm9jZXNzID0gZ2xvYmFsLnByb2Nlc3M7XG52YXIgc2V0VGFzayA9IGdsb2JhbC5zZXRJbW1lZGlhdGU7XG52YXIgY2xlYXJUYXNrID0gZ2xvYmFsLmNsZWFySW1tZWRpYXRlO1xudmFyIE1lc3NhZ2VDaGFubmVsID0gZ2xvYmFsLk1lc3NhZ2VDaGFubmVsO1xudmFyIERpc3BhdGNoID0gZ2xvYmFsLkRpc3BhdGNoO1xudmFyIGNvdW50ZXIgPSAwO1xudmFyIHF1ZXVlID0ge307XG52YXIgT05SRUFEWVNUQVRFQ0hBTkdFID0gJ29ucmVhZHlzdGF0ZWNoYW5nZSc7XG52YXIgZGVmZXIsIGNoYW5uZWwsIHBvcnQ7XG52YXIgcnVuID0gZnVuY3Rpb24gKCkge1xuICB2YXIgaWQgPSArdGhpcztcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXByb3RvdHlwZS1idWlsdGluc1xuICBpZiAocXVldWUuaGFzT3duUHJvcGVydHkoaWQpKSB7XG4gICAgdmFyIGZuID0gcXVldWVbaWRdO1xuICAgIGRlbGV0ZSBxdWV1ZVtpZF07XG4gICAgZm4oKTtcbiAgfVxufTtcbnZhciBsaXN0ZW5lciA9IGZ1bmN0aW9uIChldmVudCkge1xuICBydW4uY2FsbChldmVudC5kYXRhKTtcbn07XG4vLyBOb2RlLmpzIDAuOSsgJiBJRTEwKyBoYXMgc2V0SW1tZWRpYXRlLCBvdGhlcndpc2U6XG5pZiAoIXNldFRhc2sgfHwgIWNsZWFyVGFzaykge1xuICBzZXRUYXNrID0gZnVuY3Rpb24gc2V0SW1tZWRpYXRlKGZuKSB7XG4gICAgdmFyIGFyZ3MgPSBbXTtcbiAgICB2YXIgaSA9IDE7XG4gICAgd2hpbGUgKGFyZ3VtZW50cy5sZW5ndGggPiBpKSBhcmdzLnB1c2goYXJndW1lbnRzW2krK10pO1xuICAgIHF1ZXVlWysrY291bnRlcl0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tbmV3LWZ1bmNcbiAgICAgIGludm9rZSh0eXBlb2YgZm4gPT0gJ2Z1bmN0aW9uJyA/IGZuIDogRnVuY3Rpb24oZm4pLCBhcmdzKTtcbiAgICB9O1xuICAgIGRlZmVyKGNvdW50ZXIpO1xuICAgIHJldHVybiBjb3VudGVyO1xuICB9O1xuICBjbGVhclRhc2sgPSBmdW5jdGlvbiBjbGVhckltbWVkaWF0ZShpZCkge1xuICAgIGRlbGV0ZSBxdWV1ZVtpZF07XG4gIH07XG4gIC8vIE5vZGUuanMgMC44LVxuICBpZiAocmVxdWlyZSgnLi9fY29mJykocHJvY2VzcykgPT0gJ3Byb2Nlc3MnKSB7XG4gICAgZGVmZXIgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY3R4KHJ1biwgaWQsIDEpKTtcbiAgICB9O1xuICAvLyBTcGhlcmUgKEpTIGdhbWUgZW5naW5lKSBEaXNwYXRjaCBBUElcbiAgfSBlbHNlIGlmIChEaXNwYXRjaCAmJiBEaXNwYXRjaC5ub3cpIHtcbiAgICBkZWZlciA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgRGlzcGF0Y2gubm93KGN0eChydW4sIGlkLCAxKSk7XG4gICAgfTtcbiAgLy8gQnJvd3NlcnMgd2l0aCBNZXNzYWdlQ2hhbm5lbCwgaW5jbHVkZXMgV2ViV29ya2Vyc1xuICB9IGVsc2UgaWYgKE1lc3NhZ2VDaGFubmVsKSB7XG4gICAgY2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbCgpO1xuICAgIHBvcnQgPSBjaGFubmVsLnBvcnQyO1xuICAgIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gbGlzdGVuZXI7XG4gICAgZGVmZXIgPSBjdHgocG9ydC5wb3N0TWVzc2FnZSwgcG9ydCwgMSk7XG4gIC8vIEJyb3dzZXJzIHdpdGggcG9zdE1lc3NhZ2UsIHNraXAgV2ViV29ya2Vyc1xuICAvLyBJRTggaGFzIHBvc3RNZXNzYWdlLCBidXQgaXQncyBzeW5jICYgdHlwZW9mIGl0cyBwb3N0TWVzc2FnZSBpcyAnb2JqZWN0J1xuICB9IGVsc2UgaWYgKGdsb2JhbC5hZGRFdmVudExpc3RlbmVyICYmIHR5cGVvZiBwb3N0TWVzc2FnZSA9PSAnZnVuY3Rpb24nICYmICFnbG9iYWwuaW1wb3J0U2NyaXB0cykge1xuICAgIGRlZmVyID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgICBnbG9iYWwucG9zdE1lc3NhZ2UoaWQgKyAnJywgJyonKTtcbiAgICB9O1xuICAgIGdsb2JhbC5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgbGlzdGVuZXIsIGZhbHNlKTtcbiAgLy8gSUU4LVxuICB9IGVsc2UgaWYgKE9OUkVBRFlTVEFURUNIQU5HRSBpbiBjZWwoJ3NjcmlwdCcpKSB7XG4gICAgZGVmZXIgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgIGh0bWwuYXBwZW5kQ2hpbGQoY2VsKCdzY3JpcHQnKSlbT05SRUFEWVNUQVRFQ0hBTkdFXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaHRtbC5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICAgICAgcnVuLmNhbGwoaWQpO1xuICAgICAgfTtcbiAgICB9O1xuICAvLyBSZXN0IG9sZCBicm93c2Vyc1xuICB9IGVsc2Uge1xuICAgIGRlZmVyID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgICBzZXRUaW1lb3V0KGN0eChydW4sIGlkLCAxKSwgMCk7XG4gICAgfTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNldDogc2V0VGFzayxcbiAgY2xlYXI6IGNsZWFyVGFza1xufTtcbiIsInZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuL190by1pbnRlZ2VyJyk7XG52YXIgbWF4ID0gTWF0aC5tYXg7XG52YXIgbWluID0gTWF0aC5taW47XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbmRleCwgbGVuZ3RoKSB7XG4gIGluZGV4ID0gdG9JbnRlZ2VyKGluZGV4KTtcbiAgcmV0dXJuIGluZGV4IDwgMCA/IG1heChpbmRleCArIGxlbmd0aCwgMCkgOiBtaW4oaW5kZXgsIGxlbmd0aCk7XG59O1xuIiwiLy8gNy4xLjQgVG9JbnRlZ2VyXG52YXIgY2VpbCA9IE1hdGguY2VpbDtcbnZhciBmbG9vciA9IE1hdGguZmxvb3I7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXNOYU4oaXQgPSAraXQpID8gMCA6IChpdCA+IDAgPyBmbG9vciA6IGNlaWwpKGl0KTtcbn07XG4iLCIvLyB0byBpbmRleGVkIG9iamVjdCwgdG9PYmplY3Qgd2l0aCBmYWxsYmFjayBmb3Igbm9uLWFycmF5LWxpa2UgRVMzIHN0cmluZ3NcbnZhciBJT2JqZWN0ID0gcmVxdWlyZSgnLi9faW9iamVjdCcpO1xudmFyIGRlZmluZWQgPSByZXF1aXJlKCcuL19kZWZpbmVkJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gSU9iamVjdChkZWZpbmVkKGl0KSk7XG59O1xuIiwiLy8gNy4xLjE1IFRvTGVuZ3RoXG52YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi9fdG8taW50ZWdlcicpO1xudmFyIG1pbiA9IE1hdGgubWluO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGl0ID4gMCA/IG1pbih0b0ludGVnZXIoaXQpLCAweDFmZmZmZmZmZmZmZmZmKSA6IDA7IC8vIHBvdygyLCA1MykgLSAxID09IDkwMDcxOTkyNTQ3NDA5OTFcbn07XG4iLCIvLyA3LjEuMTMgVG9PYmplY3QoYXJndW1lbnQpXG52YXIgZGVmaW5lZCA9IHJlcXVpcmUoJy4vX2RlZmluZWQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBPYmplY3QoZGVmaW5lZChpdCkpO1xufTtcbiIsIi8vIDcuMS4xIFRvUHJpbWl0aXZlKGlucHV0IFssIFByZWZlcnJlZFR5cGVdKVxudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG4vLyBpbnN0ZWFkIG9mIHRoZSBFUzYgc3BlYyB2ZXJzaW9uLCB3ZSBkaWRuJ3QgaW1wbGVtZW50IEBAdG9QcmltaXRpdmUgY2FzZVxuLy8gYW5kIHRoZSBzZWNvbmQgYXJndW1lbnQgLSBmbGFnIC0gcHJlZmVycmVkIHR5cGUgaXMgYSBzdHJpbmdcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0LCBTKSB7XG4gIGlmICghaXNPYmplY3QoaXQpKSByZXR1cm4gaXQ7XG4gIHZhciBmbiwgdmFsO1xuICBpZiAoUyAmJiB0eXBlb2YgKGZuID0gaXQudG9TdHJpbmcpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSkgcmV0dXJuIHZhbDtcbiAgaWYgKHR5cGVvZiAoZm4gPSBpdC52YWx1ZU9mKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpIHJldHVybiB2YWw7XG4gIGlmICghUyAmJiB0eXBlb2YgKGZuID0gaXQudG9TdHJpbmcpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSkgcmV0dXJuIHZhbDtcbiAgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY29udmVydCBvYmplY3QgdG8gcHJpbWl0aXZlIHZhbHVlXCIpO1xufTtcbiIsInZhciBpZCA9IDA7XG52YXIgcHggPSBNYXRoLnJhbmRvbSgpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIHJldHVybiAnU3ltYm9sKCcuY29uY2F0KGtleSA9PT0gdW5kZWZpbmVkID8gJycgOiBrZXksICcpXycsICgrK2lkICsgcHgpLnRvU3RyaW5nKDM2KSk7XG59O1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpO1xudmFyIG5hdmlnYXRvciA9IGdsb2JhbC5uYXZpZ2F0b3I7XG5cbm1vZHVsZS5leHBvcnRzID0gbmF2aWdhdG9yICYmIG5hdmlnYXRvci51c2VyQWdlbnQgfHwgJyc7XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgY29yZSA9IHJlcXVpcmUoJy4vX2NvcmUnKTtcbnZhciBMSUJSQVJZID0gcmVxdWlyZSgnLi9fbGlicmFyeScpO1xudmFyIHdrc0V4dCA9IHJlcXVpcmUoJy4vX3drcy1leHQnKTtcbnZhciBkZWZpbmVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpLmY7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHZhciAkU3ltYm9sID0gY29yZS5TeW1ib2wgfHwgKGNvcmUuU3ltYm9sID0gTElCUkFSWSA/IHt9IDogZ2xvYmFsLlN5bWJvbCB8fCB7fSk7XG4gIGlmIChuYW1lLmNoYXJBdCgwKSAhPSAnXycgJiYgIShuYW1lIGluICRTeW1ib2wpKSBkZWZpbmVQcm9wZXJ0eSgkU3ltYm9sLCBuYW1lLCB7IHZhbHVlOiB3a3NFeHQuZihuYW1lKSB9KTtcbn07XG4iLCJleHBvcnRzLmYgPSByZXF1aXJlKCcuL193a3MnKTtcbiIsInZhciBzdG9yZSA9IHJlcXVpcmUoJy4vX3NoYXJlZCcpKCd3a3MnKTtcbnZhciB1aWQgPSByZXF1aXJlKCcuL191aWQnKTtcbnZhciBTeW1ib2wgPSByZXF1aXJlKCcuL19nbG9iYWwnKS5TeW1ib2w7XG52YXIgVVNFX1NZTUJPTCA9IHR5cGVvZiBTeW1ib2wgPT0gJ2Z1bmN0aW9uJztcblxudmFyICRleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobmFtZSkge1xuICByZXR1cm4gc3RvcmVbbmFtZV0gfHwgKHN0b3JlW25hbWVdID1cbiAgICBVU0VfU1lNQk9MICYmIFN5bWJvbFtuYW1lXSB8fCAoVVNFX1NZTUJPTCA/IFN5bWJvbCA6IHVpZCkoJ1N5bWJvbC4nICsgbmFtZSkpO1xufTtcblxuJGV4cG9ydHMuc3RvcmUgPSBzdG9yZTtcbiIsInZhciBjbGFzc29mID0gcmVxdWlyZSgnLi9fY2xhc3NvZicpO1xudmFyIElURVJBVE9SID0gcmVxdWlyZSgnLi9fd2tzJykoJ2l0ZXJhdG9yJyk7XG52YXIgSXRlcmF0b3JzID0gcmVxdWlyZSgnLi9faXRlcmF0b3JzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2NvcmUnKS5nZXRJdGVyYXRvck1ldGhvZCA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAoaXQgIT0gdW5kZWZpbmVkKSByZXR1cm4gaXRbSVRFUkFUT1JdXG4gICAgfHwgaXRbJ0BAaXRlcmF0b3InXVxuICAgIHx8IEl0ZXJhdG9yc1tjbGFzc29mKGl0KV07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGN0eCA9IHJlcXVpcmUoJy4vX2N0eCcpO1xudmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcbnZhciB0b09iamVjdCA9IHJlcXVpcmUoJy4vX3RvLW9iamVjdCcpO1xudmFyIGNhbGwgPSByZXF1aXJlKCcuL19pdGVyLWNhbGwnKTtcbnZhciBpc0FycmF5SXRlciA9IHJlcXVpcmUoJy4vX2lzLWFycmF5LWl0ZXInKTtcbnZhciB0b0xlbmd0aCA9IHJlcXVpcmUoJy4vX3RvLWxlbmd0aCcpO1xudmFyIGNyZWF0ZVByb3BlcnR5ID0gcmVxdWlyZSgnLi9fY3JlYXRlLXByb3BlcnR5Jyk7XG52YXIgZ2V0SXRlckZuID0gcmVxdWlyZSgnLi9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QnKTtcblxuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAhcmVxdWlyZSgnLi9faXRlci1kZXRlY3QnKShmdW5jdGlvbiAoaXRlcikgeyBBcnJheS5mcm9tKGl0ZXIpOyB9KSwgJ0FycmF5Jywge1xuICAvLyAyMi4xLjIuMSBBcnJheS5mcm9tKGFycmF5TGlrZSwgbWFwZm4gPSB1bmRlZmluZWQsIHRoaXNBcmcgPSB1bmRlZmluZWQpXG4gIGZyb206IGZ1bmN0aW9uIGZyb20oYXJyYXlMaWtlIC8qICwgbWFwZm4gPSB1bmRlZmluZWQsIHRoaXNBcmcgPSB1bmRlZmluZWQgKi8pIHtcbiAgICB2YXIgTyA9IHRvT2JqZWN0KGFycmF5TGlrZSk7XG4gICAgdmFyIEMgPSB0eXBlb2YgdGhpcyA9PSAnZnVuY3Rpb24nID8gdGhpcyA6IEFycmF5O1xuICAgIHZhciBhTGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICB2YXIgbWFwZm4gPSBhTGVuID4gMSA/IGFyZ3VtZW50c1sxXSA6IHVuZGVmaW5lZDtcbiAgICB2YXIgbWFwcGluZyA9IG1hcGZuICE9PSB1bmRlZmluZWQ7XG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICB2YXIgaXRlckZuID0gZ2V0SXRlckZuKE8pO1xuICAgIHZhciBsZW5ndGgsIHJlc3VsdCwgc3RlcCwgaXRlcmF0b3I7XG4gICAgaWYgKG1hcHBpbmcpIG1hcGZuID0gY3R4KG1hcGZuLCBhTGVuID4gMiA/IGFyZ3VtZW50c1syXSA6IHVuZGVmaW5lZCwgMik7XG4gICAgLy8gaWYgb2JqZWN0IGlzbid0IGl0ZXJhYmxlIG9yIGl0J3MgYXJyYXkgd2l0aCBkZWZhdWx0IGl0ZXJhdG9yIC0gdXNlIHNpbXBsZSBjYXNlXG4gICAgaWYgKGl0ZXJGbiAhPSB1bmRlZmluZWQgJiYgIShDID09IEFycmF5ICYmIGlzQXJyYXlJdGVyKGl0ZXJGbikpKSB7XG4gICAgICBmb3IgKGl0ZXJhdG9yID0gaXRlckZuLmNhbGwoTyksIHJlc3VsdCA9IG5ldyBDKCk7ICEoc3RlcCA9IGl0ZXJhdG9yLm5leHQoKSkuZG9uZTsgaW5kZXgrKykge1xuICAgICAgICBjcmVhdGVQcm9wZXJ0eShyZXN1bHQsIGluZGV4LCBtYXBwaW5nID8gY2FsbChpdGVyYXRvciwgbWFwZm4sIFtzdGVwLnZhbHVlLCBpbmRleF0sIHRydWUpIDogc3RlcC52YWx1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGxlbmd0aCA9IHRvTGVuZ3RoKE8ubGVuZ3RoKTtcbiAgICAgIGZvciAocmVzdWx0ID0gbmV3IEMobGVuZ3RoKTsgbGVuZ3RoID4gaW5kZXg7IGluZGV4KyspIHtcbiAgICAgICAgY3JlYXRlUHJvcGVydHkocmVzdWx0LCBpbmRleCwgbWFwcGluZyA/IG1hcGZuKE9baW5kZXhdLCBpbmRleCkgOiBPW2luZGV4XSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJlc3VsdC5sZW5ndGggPSBpbmRleDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59KTtcbiIsIi8vIDIyLjEuMi4yIC8gMTUuNC4zLjIgQXJyYXkuaXNBcnJheShhcmcpXG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpO1xuXG4kZXhwb3J0KCRleHBvcnQuUywgJ0FycmF5JywgeyBpc0FycmF5OiByZXF1aXJlKCcuL19pcy1hcnJheScpIH0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGFkZFRvVW5zY29wYWJsZXMgPSByZXF1aXJlKCcuL19hZGQtdG8tdW5zY29wYWJsZXMnKTtcbnZhciBzdGVwID0gcmVxdWlyZSgnLi9faXRlci1zdGVwJyk7XG52YXIgSXRlcmF0b3JzID0gcmVxdWlyZSgnLi9faXRlcmF0b3JzJyk7XG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpO1xuXG4vLyAyMi4xLjMuNCBBcnJheS5wcm90b3R5cGUuZW50cmllcygpXG4vLyAyMi4xLjMuMTMgQXJyYXkucHJvdG90eXBlLmtleXMoKVxuLy8gMjIuMS4zLjI5IEFycmF5LnByb3RvdHlwZS52YWx1ZXMoKVxuLy8gMjIuMS4zLjMwIEFycmF5LnByb3RvdHlwZVtAQGl0ZXJhdG9yXSgpXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2l0ZXItZGVmaW5lJykoQXJyYXksICdBcnJheScsIGZ1bmN0aW9uIChpdGVyYXRlZCwga2luZCkge1xuICB0aGlzLl90ID0gdG9JT2JqZWN0KGl0ZXJhdGVkKTsgLy8gdGFyZ2V0XG4gIHRoaXMuX2kgPSAwOyAgICAgICAgICAgICAgICAgICAvLyBuZXh0IGluZGV4XG4gIHRoaXMuX2sgPSBraW5kOyAgICAgICAgICAgICAgICAvLyBraW5kXG4vLyAyMi4xLjUuMi4xICVBcnJheUl0ZXJhdG9yUHJvdG90eXBlJS5uZXh0KClcbn0sIGZ1bmN0aW9uICgpIHtcbiAgdmFyIE8gPSB0aGlzLl90O1xuICB2YXIga2luZCA9IHRoaXMuX2s7XG4gIHZhciBpbmRleCA9IHRoaXMuX2krKztcbiAgaWYgKCFPIHx8IGluZGV4ID49IE8ubGVuZ3RoKSB7XG4gICAgdGhpcy5fdCA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gc3RlcCgxKTtcbiAgfVxuICBpZiAoa2luZCA9PSAna2V5cycpIHJldHVybiBzdGVwKDAsIGluZGV4KTtcbiAgaWYgKGtpbmQgPT0gJ3ZhbHVlcycpIHJldHVybiBzdGVwKDAsIE9baW5kZXhdKTtcbiAgcmV0dXJuIHN0ZXAoMCwgW2luZGV4LCBPW2luZGV4XV0pO1xufSwgJ3ZhbHVlcycpO1xuXG4vLyBhcmd1bWVudHNMaXN0W0BAaXRlcmF0b3JdIGlzICVBcnJheVByb3RvX3ZhbHVlcyUgKDkuNC40LjYsIDkuNC40LjcpXG5JdGVyYXRvcnMuQXJndW1lbnRzID0gSXRlcmF0b3JzLkFycmF5O1xuXG5hZGRUb1Vuc2NvcGFibGVzKCdrZXlzJyk7XG5hZGRUb1Vuc2NvcGFibGVzKCd2YWx1ZXMnKTtcbmFkZFRvVW5zY29wYWJsZXMoJ2VudHJpZXMnKTtcbiIsIi8vIDIwLjMuMy4xIC8gMTUuOS40LjQgRGF0ZS5ub3coKVxudmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcblxuJGV4cG9ydCgkZXhwb3J0LlMsICdEYXRlJywgeyBub3c6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpOyB9IH0pO1xuIiwidmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcbi8vIDE5LjEuMi4zIC8gMTUuMi4zLjcgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoTywgUHJvcGVydGllcylcbiRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogIXJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJyksICdPYmplY3QnLCB7IGRlZmluZVByb3BlcnRpZXM6IHJlcXVpcmUoJy4vX29iamVjdC1kcHMnKSB9KTtcbiIsInZhciAkZXhwb3J0ID0gcmVxdWlyZSgnLi9fZXhwb3J0Jyk7XG4vLyAxOS4xLjIuNCAvIDE1LjIuMy42IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShPLCBQLCBBdHRyaWJ1dGVzKVxuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAhcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSwgJ09iamVjdCcsIHsgZGVmaW5lUHJvcGVydHk6IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpLmYgfSk7XG4iLCIvLyAxOS4xLjIuNiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApXG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpO1xudmFyICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSByZXF1aXJlKCcuL19vYmplY3QtZ29wZCcpLmY7XG5cbnJlcXVpcmUoJy4vX29iamVjdC1zYXAnKSgnZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yJywgZnVuY3Rpb24gKCkge1xuICByZXR1cm4gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpIHtcbiAgICByZXR1cm4gJGdldE93blByb3BlcnR5RGVzY3JpcHRvcih0b0lPYmplY3QoaXQpLCBrZXkpO1xuICB9O1xufSk7XG4iLCIvLyAxOS4xLjIuMTQgT2JqZWN0LmtleXMoTylcbnZhciB0b09iamVjdCA9IHJlcXVpcmUoJy4vX3RvLW9iamVjdCcpO1xudmFyICRrZXlzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMnKTtcblxucmVxdWlyZSgnLi9fb2JqZWN0LXNhcCcpKCdrZXlzJywgZnVuY3Rpb24gKCkge1xuICByZXR1cm4gZnVuY3Rpb24ga2V5cyhpdCkge1xuICAgIHJldHVybiAka2V5cyh0b09iamVjdChpdCkpO1xuICB9O1xufSk7XG4iLCIiLCJ2YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpO1xudmFyICRwYXJzZUludCA9IHJlcXVpcmUoJy4vX3BhcnNlLWludCcpO1xuLy8gMTguMi41IHBhcnNlSW50KHN0cmluZywgcmFkaXgpXG4kZXhwb3J0KCRleHBvcnQuRyArICRleHBvcnQuRiAqIChwYXJzZUludCAhPSAkcGFyc2VJbnQpLCB7IHBhcnNlSW50OiAkcGFyc2VJbnQgfSk7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgTElCUkFSWSA9IHJlcXVpcmUoJy4vX2xpYnJhcnknKTtcbnZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciBjdHggPSByZXF1aXJlKCcuL19jdHgnKTtcbnZhciBjbGFzc29mID0gcmVxdWlyZSgnLi9fY2xhc3NvZicpO1xudmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xudmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4vX2EtZnVuY3Rpb24nKTtcbnZhciBhbkluc3RhbmNlID0gcmVxdWlyZSgnLi9fYW4taW5zdGFuY2UnKTtcbnZhciBmb3JPZiA9IHJlcXVpcmUoJy4vX2Zvci1vZicpO1xudmFyIHNwZWNpZXNDb25zdHJ1Y3RvciA9IHJlcXVpcmUoJy4vX3NwZWNpZXMtY29uc3RydWN0b3InKTtcbnZhciB0YXNrID0gcmVxdWlyZSgnLi9fdGFzaycpLnNldDtcbnZhciBtaWNyb3Rhc2sgPSByZXF1aXJlKCcuL19taWNyb3Rhc2snKSgpO1xudmFyIG5ld1Byb21pc2VDYXBhYmlsaXR5TW9kdWxlID0gcmVxdWlyZSgnLi9fbmV3LXByb21pc2UtY2FwYWJpbGl0eScpO1xudmFyIHBlcmZvcm0gPSByZXF1aXJlKCcuL19wZXJmb3JtJyk7XG52YXIgdXNlckFnZW50ID0gcmVxdWlyZSgnLi9fdXNlci1hZ2VudCcpO1xudmFyIHByb21pc2VSZXNvbHZlID0gcmVxdWlyZSgnLi9fcHJvbWlzZS1yZXNvbHZlJyk7XG52YXIgUFJPTUlTRSA9ICdQcm9taXNlJztcbnZhciBUeXBlRXJyb3IgPSBnbG9iYWwuVHlwZUVycm9yO1xudmFyIHByb2Nlc3MgPSBnbG9iYWwucHJvY2VzcztcbnZhciB2ZXJzaW9ucyA9IHByb2Nlc3MgJiYgcHJvY2Vzcy52ZXJzaW9ucztcbnZhciB2OCA9IHZlcnNpb25zICYmIHZlcnNpb25zLnY4IHx8ICcnO1xudmFyICRQcm9taXNlID0gZ2xvYmFsW1BST01JU0VdO1xudmFyIGlzTm9kZSA9IGNsYXNzb2YocHJvY2VzcykgPT0gJ3Byb2Nlc3MnO1xudmFyIGVtcHR5ID0gZnVuY3Rpb24gKCkgeyAvKiBlbXB0eSAqLyB9O1xudmFyIEludGVybmFsLCBuZXdHZW5lcmljUHJvbWlzZUNhcGFiaWxpdHksIE93blByb21pc2VDYXBhYmlsaXR5LCBXcmFwcGVyO1xudmFyIG5ld1Byb21pc2VDYXBhYmlsaXR5ID0gbmV3R2VuZXJpY1Byb21pc2VDYXBhYmlsaXR5ID0gbmV3UHJvbWlzZUNhcGFiaWxpdHlNb2R1bGUuZjtcblxudmFyIFVTRV9OQVRJVkUgPSAhIWZ1bmN0aW9uICgpIHtcbiAgdHJ5IHtcbiAgICAvLyBjb3JyZWN0IHN1YmNsYXNzaW5nIHdpdGggQEBzcGVjaWVzIHN1cHBvcnRcbiAgICB2YXIgcHJvbWlzZSA9ICRQcm9taXNlLnJlc29sdmUoMSk7XG4gICAgdmFyIEZha2VQcm9taXNlID0gKHByb21pc2UuY29uc3RydWN0b3IgPSB7fSlbcmVxdWlyZSgnLi9fd2tzJykoJ3NwZWNpZXMnKV0gPSBmdW5jdGlvbiAoZXhlYykge1xuICAgICAgZXhlYyhlbXB0eSwgZW1wdHkpO1xuICAgIH07XG4gICAgLy8gdW5oYW5kbGVkIHJlamVjdGlvbnMgdHJhY2tpbmcgc3VwcG9ydCwgTm9kZUpTIFByb21pc2Ugd2l0aG91dCBpdCBmYWlscyBAQHNwZWNpZXMgdGVzdFxuICAgIHJldHVybiAoaXNOb2RlIHx8IHR5cGVvZiBQcm9taXNlUmVqZWN0aW9uRXZlbnQgPT0gJ2Z1bmN0aW9uJylcbiAgICAgICYmIHByb21pc2UudGhlbihlbXB0eSkgaW5zdGFuY2VvZiBGYWtlUHJvbWlzZVxuICAgICAgLy8gdjggNi42IChOb2RlIDEwIGFuZCBDaHJvbWUgNjYpIGhhdmUgYSBidWcgd2l0aCByZXNvbHZpbmcgY3VzdG9tIHRoZW5hYmxlc1xuICAgICAgLy8gaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9ODMwNTY1XG4gICAgICAvLyB3ZSBjYW4ndCBkZXRlY3QgaXQgc3luY2hyb25vdXNseSwgc28ganVzdCBjaGVjayB2ZXJzaW9uc1xuICAgICAgJiYgdjguaW5kZXhPZignNi42JykgIT09IDBcbiAgICAgICYmIHVzZXJBZ2VudC5pbmRleE9mKCdDaHJvbWUvNjYnKSA9PT0gLTE7XG4gIH0gY2F0Y2ggKGUpIHsgLyogZW1wdHkgKi8gfVxufSgpO1xuXG4vLyBoZWxwZXJzXG52YXIgaXNUaGVuYWJsZSA9IGZ1bmN0aW9uIChpdCkge1xuICB2YXIgdGhlbjtcbiAgcmV0dXJuIGlzT2JqZWN0KGl0KSAmJiB0eXBlb2YgKHRoZW4gPSBpdC50aGVuKSA9PSAnZnVuY3Rpb24nID8gdGhlbiA6IGZhbHNlO1xufTtcbnZhciBub3RpZnkgPSBmdW5jdGlvbiAocHJvbWlzZSwgaXNSZWplY3QpIHtcbiAgaWYgKHByb21pc2UuX24pIHJldHVybjtcbiAgcHJvbWlzZS5fbiA9IHRydWU7XG4gIHZhciBjaGFpbiA9IHByb21pc2UuX2M7XG4gIG1pY3JvdGFzayhmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHZhbHVlID0gcHJvbWlzZS5fdjtcbiAgICB2YXIgb2sgPSBwcm9taXNlLl9zID09IDE7XG4gICAgdmFyIGkgPSAwO1xuICAgIHZhciBydW4gPSBmdW5jdGlvbiAocmVhY3Rpb24pIHtcbiAgICAgIHZhciBoYW5kbGVyID0gb2sgPyByZWFjdGlvbi5vayA6IHJlYWN0aW9uLmZhaWw7XG4gICAgICB2YXIgcmVzb2x2ZSA9IHJlYWN0aW9uLnJlc29sdmU7XG4gICAgICB2YXIgcmVqZWN0ID0gcmVhY3Rpb24ucmVqZWN0O1xuICAgICAgdmFyIGRvbWFpbiA9IHJlYWN0aW9uLmRvbWFpbjtcbiAgICAgIHZhciByZXN1bHQsIHRoZW4sIGV4aXRlZDtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChoYW5kbGVyKSB7XG4gICAgICAgICAgaWYgKCFvaykge1xuICAgICAgICAgICAgaWYgKHByb21pc2UuX2ggPT0gMikgb25IYW5kbGVVbmhhbmRsZWQocHJvbWlzZSk7XG4gICAgICAgICAgICBwcm9taXNlLl9oID0gMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGhhbmRsZXIgPT09IHRydWUpIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKGRvbWFpbikgZG9tYWluLmVudGVyKCk7XG4gICAgICAgICAgICByZXN1bHQgPSBoYW5kbGVyKHZhbHVlKTsgLy8gbWF5IHRocm93XG4gICAgICAgICAgICBpZiAoZG9tYWluKSB7XG4gICAgICAgICAgICAgIGRvbWFpbi5leGl0KCk7XG4gICAgICAgICAgICAgIGV4aXRlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChyZXN1bHQgPT09IHJlYWN0aW9uLnByb21pc2UpIHtcbiAgICAgICAgICAgIHJlamVjdChUeXBlRXJyb3IoJ1Byb21pc2UtY2hhaW4gY3ljbGUnKSk7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGVuID0gaXNUaGVuYWJsZShyZXN1bHQpKSB7XG4gICAgICAgICAgICB0aGVuLmNhbGwocmVzdWx0LCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0gZWxzZSByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH0gZWxzZSByZWplY3QodmFsdWUpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoZG9tYWluICYmICFleGl0ZWQpIGRvbWFpbi5leGl0KCk7XG4gICAgICAgIHJlamVjdChlKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHdoaWxlIChjaGFpbi5sZW5ndGggPiBpKSBydW4oY2hhaW5baSsrXSk7IC8vIHZhcmlhYmxlIGxlbmd0aCAtIGNhbid0IHVzZSBmb3JFYWNoXG4gICAgcHJvbWlzZS5fYyA9IFtdO1xuICAgIHByb21pc2UuX24gPSBmYWxzZTtcbiAgICBpZiAoaXNSZWplY3QgJiYgIXByb21pc2UuX2gpIG9uVW5oYW5kbGVkKHByb21pc2UpO1xuICB9KTtcbn07XG52YXIgb25VbmhhbmRsZWQgPSBmdW5jdGlvbiAocHJvbWlzZSkge1xuICB0YXNrLmNhbGwoZ2xvYmFsLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHZhbHVlID0gcHJvbWlzZS5fdjtcbiAgICB2YXIgdW5oYW5kbGVkID0gaXNVbmhhbmRsZWQocHJvbWlzZSk7XG4gICAgdmFyIHJlc3VsdCwgaGFuZGxlciwgY29uc29sZTtcbiAgICBpZiAodW5oYW5kbGVkKSB7XG4gICAgICByZXN1bHQgPSBwZXJmb3JtKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGlzTm9kZSkge1xuICAgICAgICAgIHByb2Nlc3MuZW1pdCgndW5oYW5kbGVkUmVqZWN0aW9uJywgdmFsdWUsIHByb21pc2UpO1xuICAgICAgICB9IGVsc2UgaWYgKGhhbmRsZXIgPSBnbG9iYWwub251bmhhbmRsZWRyZWplY3Rpb24pIHtcbiAgICAgICAgICBoYW5kbGVyKHsgcHJvbWlzZTogcHJvbWlzZSwgcmVhc29uOiB2YWx1ZSB9KTtcbiAgICAgICAgfSBlbHNlIGlmICgoY29uc29sZSA9IGdsb2JhbC5jb25zb2xlKSAmJiBjb25zb2xlLmVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignVW5oYW5kbGVkIHByb21pc2UgcmVqZWN0aW9uJywgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIC8vIEJyb3dzZXJzIHNob3VsZCBub3QgdHJpZ2dlciBgcmVqZWN0aW9uSGFuZGxlZGAgZXZlbnQgaWYgaXQgd2FzIGhhbmRsZWQgaGVyZSwgTm9kZUpTIC0gc2hvdWxkXG4gICAgICBwcm9taXNlLl9oID0gaXNOb2RlIHx8IGlzVW5oYW5kbGVkKHByb21pc2UpID8gMiA6IDE7XG4gICAgfSBwcm9taXNlLl9hID0gdW5kZWZpbmVkO1xuICAgIGlmICh1bmhhbmRsZWQgJiYgcmVzdWx0LmUpIHRocm93IHJlc3VsdC52O1xuICB9KTtcbn07XG52YXIgaXNVbmhhbmRsZWQgPSBmdW5jdGlvbiAocHJvbWlzZSkge1xuICByZXR1cm4gcHJvbWlzZS5faCAhPT0gMSAmJiAocHJvbWlzZS5fYSB8fCBwcm9taXNlLl9jKS5sZW5ndGggPT09IDA7XG59O1xudmFyIG9uSGFuZGxlVW5oYW5kbGVkID0gZnVuY3Rpb24gKHByb21pc2UpIHtcbiAgdGFzay5jYWxsKGdsb2JhbCwgZnVuY3Rpb24gKCkge1xuICAgIHZhciBoYW5kbGVyO1xuICAgIGlmIChpc05vZGUpIHtcbiAgICAgIHByb2Nlc3MuZW1pdCgncmVqZWN0aW9uSGFuZGxlZCcsIHByb21pc2UpO1xuICAgIH0gZWxzZSBpZiAoaGFuZGxlciA9IGdsb2JhbC5vbnJlamVjdGlvbmhhbmRsZWQpIHtcbiAgICAgIGhhbmRsZXIoeyBwcm9taXNlOiBwcm9taXNlLCByZWFzb246IHByb21pc2UuX3YgfSk7XG4gICAgfVxuICB9KTtcbn07XG52YXIgJHJlamVjdCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICB2YXIgcHJvbWlzZSA9IHRoaXM7XG4gIGlmIChwcm9taXNlLl9kKSByZXR1cm47XG4gIHByb21pc2UuX2QgPSB0cnVlO1xuICBwcm9taXNlID0gcHJvbWlzZS5fdyB8fCBwcm9taXNlOyAvLyB1bndyYXBcbiAgcHJvbWlzZS5fdiA9IHZhbHVlO1xuICBwcm9taXNlLl9zID0gMjtcbiAgaWYgKCFwcm9taXNlLl9hKSBwcm9taXNlLl9hID0gcHJvbWlzZS5fYy5zbGljZSgpO1xuICBub3RpZnkocHJvbWlzZSwgdHJ1ZSk7XG59O1xudmFyICRyZXNvbHZlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHZhciBwcm9taXNlID0gdGhpcztcbiAgdmFyIHRoZW47XG4gIGlmIChwcm9taXNlLl9kKSByZXR1cm47XG4gIHByb21pc2UuX2QgPSB0cnVlO1xuICBwcm9taXNlID0gcHJvbWlzZS5fdyB8fCBwcm9taXNlOyAvLyB1bndyYXBcbiAgdHJ5IHtcbiAgICBpZiAocHJvbWlzZSA9PT0gdmFsdWUpIHRocm93IFR5cGVFcnJvcihcIlByb21pc2UgY2FuJ3QgYmUgcmVzb2x2ZWQgaXRzZWxmXCIpO1xuICAgIGlmICh0aGVuID0gaXNUaGVuYWJsZSh2YWx1ZSkpIHtcbiAgICAgIG1pY3JvdGFzayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB3cmFwcGVyID0geyBfdzogcHJvbWlzZSwgX2Q6IGZhbHNlIH07IC8vIHdyYXBcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGVuLmNhbGwodmFsdWUsIGN0eCgkcmVzb2x2ZSwgd3JhcHBlciwgMSksIGN0eCgkcmVqZWN0LCB3cmFwcGVyLCAxKSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAkcmVqZWN0LmNhbGwod3JhcHBlciwgZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcm9taXNlLl92ID0gdmFsdWU7XG4gICAgICBwcm9taXNlLl9zID0gMTtcbiAgICAgIG5vdGlmeShwcm9taXNlLCBmYWxzZSk7XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgJHJlamVjdC5jYWxsKHsgX3c6IHByb21pc2UsIF9kOiBmYWxzZSB9LCBlKTsgLy8gd3JhcFxuICB9XG59O1xuXG4vLyBjb25zdHJ1Y3RvciBwb2x5ZmlsbFxuaWYgKCFVU0VfTkFUSVZFKSB7XG4gIC8vIDI1LjQuMy4xIFByb21pc2UoZXhlY3V0b3IpXG4gICRQcm9taXNlID0gZnVuY3Rpb24gUHJvbWlzZShleGVjdXRvcikge1xuICAgIGFuSW5zdGFuY2UodGhpcywgJFByb21pc2UsIFBST01JU0UsICdfaCcpO1xuICAgIGFGdW5jdGlvbihleGVjdXRvcik7XG4gICAgSW50ZXJuYWwuY2FsbCh0aGlzKTtcbiAgICB0cnkge1xuICAgICAgZXhlY3V0b3IoY3R4KCRyZXNvbHZlLCB0aGlzLCAxKSwgY3R4KCRyZWplY3QsIHRoaXMsIDEpKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICRyZWplY3QuY2FsbCh0aGlzLCBlcnIpO1xuICAgIH1cbiAgfTtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC12YXJzXG4gIEludGVybmFsID0gZnVuY3Rpb24gUHJvbWlzZShleGVjdXRvcikge1xuICAgIHRoaXMuX2MgPSBbXTsgICAgICAgICAgICAgLy8gPC0gYXdhaXRpbmcgcmVhY3Rpb25zXG4gICAgdGhpcy5fYSA9IHVuZGVmaW5lZDsgICAgICAvLyA8LSBjaGVja2VkIGluIGlzVW5oYW5kbGVkIHJlYWN0aW9uc1xuICAgIHRoaXMuX3MgPSAwOyAgICAgICAgICAgICAgLy8gPC0gc3RhdGVcbiAgICB0aGlzLl9kID0gZmFsc2U7ICAgICAgICAgIC8vIDwtIGRvbmVcbiAgICB0aGlzLl92ID0gdW5kZWZpbmVkOyAgICAgIC8vIDwtIHZhbHVlXG4gICAgdGhpcy5faCA9IDA7ICAgICAgICAgICAgICAvLyA8LSByZWplY3Rpb24gc3RhdGUsIDAgLSBkZWZhdWx0LCAxIC0gaGFuZGxlZCwgMiAtIHVuaGFuZGxlZFxuICAgIHRoaXMuX24gPSBmYWxzZTsgICAgICAgICAgLy8gPC0gbm90aWZ5XG4gIH07XG4gIEludGVybmFsLnByb3RvdHlwZSA9IHJlcXVpcmUoJy4vX3JlZGVmaW5lLWFsbCcpKCRQcm9taXNlLnByb3RvdHlwZSwge1xuICAgIC8vIDI1LjQuNS4zIFByb21pc2UucHJvdG90eXBlLnRoZW4ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpXG4gICAgdGhlbjogZnVuY3Rpb24gdGhlbihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCkge1xuICAgICAgdmFyIHJlYWN0aW9uID0gbmV3UHJvbWlzZUNhcGFiaWxpdHkoc3BlY2llc0NvbnN0cnVjdG9yKHRoaXMsICRQcm9taXNlKSk7XG4gICAgICByZWFjdGlvbi5vayA9IHR5cGVvZiBvbkZ1bGZpbGxlZCA9PSAnZnVuY3Rpb24nID8gb25GdWxmaWxsZWQgOiB0cnVlO1xuICAgICAgcmVhY3Rpb24uZmFpbCA9IHR5cGVvZiBvblJlamVjdGVkID09ICdmdW5jdGlvbicgJiYgb25SZWplY3RlZDtcbiAgICAgIHJlYWN0aW9uLmRvbWFpbiA9IGlzTm9kZSA/IHByb2Nlc3MuZG9tYWluIDogdW5kZWZpbmVkO1xuICAgICAgdGhpcy5fYy5wdXNoKHJlYWN0aW9uKTtcbiAgICAgIGlmICh0aGlzLl9hKSB0aGlzLl9hLnB1c2gocmVhY3Rpb24pO1xuICAgICAgaWYgKHRoaXMuX3MpIG5vdGlmeSh0aGlzLCBmYWxzZSk7XG4gICAgICByZXR1cm4gcmVhY3Rpb24ucHJvbWlzZTtcbiAgICB9LFxuICAgIC8vIDI1LjQuNS4xIFByb21pc2UucHJvdG90eXBlLmNhdGNoKG9uUmVqZWN0ZWQpXG4gICAgJ2NhdGNoJzogZnVuY3Rpb24gKG9uUmVqZWN0ZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLnRoZW4odW5kZWZpbmVkLCBvblJlamVjdGVkKTtcbiAgICB9XG4gIH0pO1xuICBPd25Qcm9taXNlQ2FwYWJpbGl0eSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcHJvbWlzZSA9IG5ldyBJbnRlcm5hbCgpO1xuICAgIHRoaXMucHJvbWlzZSA9IHByb21pc2U7XG4gICAgdGhpcy5yZXNvbHZlID0gY3R4KCRyZXNvbHZlLCBwcm9taXNlLCAxKTtcbiAgICB0aGlzLnJlamVjdCA9IGN0eCgkcmVqZWN0LCBwcm9taXNlLCAxKTtcbiAgfTtcbiAgbmV3UHJvbWlzZUNhcGFiaWxpdHlNb2R1bGUuZiA9IG5ld1Byb21pc2VDYXBhYmlsaXR5ID0gZnVuY3Rpb24gKEMpIHtcbiAgICByZXR1cm4gQyA9PT0gJFByb21pc2UgfHwgQyA9PT0gV3JhcHBlclxuICAgICAgPyBuZXcgT3duUHJvbWlzZUNhcGFiaWxpdHkoQylcbiAgICAgIDogbmV3R2VuZXJpY1Byb21pc2VDYXBhYmlsaXR5KEMpO1xuICB9O1xufVxuXG4kZXhwb3J0KCRleHBvcnQuRyArICRleHBvcnQuVyArICRleHBvcnQuRiAqICFVU0VfTkFUSVZFLCB7IFByb21pc2U6ICRQcm9taXNlIH0pO1xucmVxdWlyZSgnLi9fc2V0LXRvLXN0cmluZy10YWcnKSgkUHJvbWlzZSwgUFJPTUlTRSk7XG5yZXF1aXJlKCcuL19zZXQtc3BlY2llcycpKFBST01JU0UpO1xuV3JhcHBlciA9IHJlcXVpcmUoJy4vX2NvcmUnKVtQUk9NSVNFXTtcblxuLy8gc3RhdGljc1xuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAhVVNFX05BVElWRSwgUFJPTUlTRSwge1xuICAvLyAyNS40LjQuNSBQcm9taXNlLnJlamVjdChyKVxuICByZWplY3Q6IGZ1bmN0aW9uIHJlamVjdChyKSB7XG4gICAgdmFyIGNhcGFiaWxpdHkgPSBuZXdQcm9taXNlQ2FwYWJpbGl0eSh0aGlzKTtcbiAgICB2YXIgJCRyZWplY3QgPSBjYXBhYmlsaXR5LnJlamVjdDtcbiAgICAkJHJlamVjdChyKTtcbiAgICByZXR1cm4gY2FwYWJpbGl0eS5wcm9taXNlO1xuICB9XG59KTtcbiRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogKExJQlJBUlkgfHwgIVVTRV9OQVRJVkUpLCBQUk9NSVNFLCB7XG4gIC8vIDI1LjQuNC42IFByb21pc2UucmVzb2x2ZSh4KVxuICByZXNvbHZlOiBmdW5jdGlvbiByZXNvbHZlKHgpIHtcbiAgICByZXR1cm4gcHJvbWlzZVJlc29sdmUoTElCUkFSWSAmJiB0aGlzID09PSBXcmFwcGVyID8gJFByb21pc2UgOiB0aGlzLCB4KTtcbiAgfVxufSk7XG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICEoVVNFX05BVElWRSAmJiByZXF1aXJlKCcuL19pdGVyLWRldGVjdCcpKGZ1bmN0aW9uIChpdGVyKSB7XG4gICRQcm9taXNlLmFsbChpdGVyKVsnY2F0Y2gnXShlbXB0eSk7XG59KSksIFBST01JU0UsIHtcbiAgLy8gMjUuNC40LjEgUHJvbWlzZS5hbGwoaXRlcmFibGUpXG4gIGFsbDogZnVuY3Rpb24gYWxsKGl0ZXJhYmxlKSB7XG4gICAgdmFyIEMgPSB0aGlzO1xuICAgIHZhciBjYXBhYmlsaXR5ID0gbmV3UHJvbWlzZUNhcGFiaWxpdHkoQyk7XG4gICAgdmFyIHJlc29sdmUgPSBjYXBhYmlsaXR5LnJlc29sdmU7XG4gICAgdmFyIHJlamVjdCA9IGNhcGFiaWxpdHkucmVqZWN0O1xuICAgIHZhciByZXN1bHQgPSBwZXJmb3JtKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciB2YWx1ZXMgPSBbXTtcbiAgICAgIHZhciBpbmRleCA9IDA7XG4gICAgICB2YXIgcmVtYWluaW5nID0gMTtcbiAgICAgIGZvck9mKGl0ZXJhYmxlLCBmYWxzZSwgZnVuY3Rpb24gKHByb21pc2UpIHtcbiAgICAgICAgdmFyICRpbmRleCA9IGluZGV4Kys7XG4gICAgICAgIHZhciBhbHJlYWR5Q2FsbGVkID0gZmFsc2U7XG4gICAgICAgIHZhbHVlcy5wdXNoKHVuZGVmaW5lZCk7XG4gICAgICAgIHJlbWFpbmluZysrO1xuICAgICAgICBDLnJlc29sdmUocHJvbWlzZSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICBpZiAoYWxyZWFkeUNhbGxlZCkgcmV0dXJuO1xuICAgICAgICAgIGFscmVhZHlDYWxsZWQgPSB0cnVlO1xuICAgICAgICAgIHZhbHVlc1skaW5kZXhdID0gdmFsdWU7XG4gICAgICAgICAgLS1yZW1haW5pbmcgfHwgcmVzb2x2ZSh2YWx1ZXMpO1xuICAgICAgICB9LCByZWplY3QpO1xuICAgICAgfSk7XG4gICAgICAtLXJlbWFpbmluZyB8fCByZXNvbHZlKHZhbHVlcyk7XG4gICAgfSk7XG4gICAgaWYgKHJlc3VsdC5lKSByZWplY3QocmVzdWx0LnYpO1xuICAgIHJldHVybiBjYXBhYmlsaXR5LnByb21pc2U7XG4gIH0sXG4gIC8vIDI1LjQuNC40IFByb21pc2UucmFjZShpdGVyYWJsZSlcbiAgcmFjZTogZnVuY3Rpb24gcmFjZShpdGVyYWJsZSkge1xuICAgIHZhciBDID0gdGhpcztcbiAgICB2YXIgY2FwYWJpbGl0eSA9IG5ld1Byb21pc2VDYXBhYmlsaXR5KEMpO1xuICAgIHZhciByZWplY3QgPSBjYXBhYmlsaXR5LnJlamVjdDtcbiAgICB2YXIgcmVzdWx0ID0gcGVyZm9ybShmdW5jdGlvbiAoKSB7XG4gICAgICBmb3JPZihpdGVyYWJsZSwgZmFsc2UsIGZ1bmN0aW9uIChwcm9taXNlKSB7XG4gICAgICAgIEMucmVzb2x2ZShwcm9taXNlKS50aGVuKGNhcGFiaWxpdHkucmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIGlmIChyZXN1bHQuZSkgcmVqZWN0KHJlc3VsdC52KTtcbiAgICByZXR1cm4gY2FwYWJpbGl0eS5wcm9taXNlO1xuICB9XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciAkYXQgPSByZXF1aXJlKCcuL19zdHJpbmctYXQnKSh0cnVlKTtcblxuLy8gMjEuMS4zLjI3IFN0cmluZy5wcm90b3R5cGVbQEBpdGVyYXRvcl0oKVxucmVxdWlyZSgnLi9faXRlci1kZWZpbmUnKShTdHJpbmcsICdTdHJpbmcnLCBmdW5jdGlvbiAoaXRlcmF0ZWQpIHtcbiAgdGhpcy5fdCA9IFN0cmluZyhpdGVyYXRlZCk7IC8vIHRhcmdldFxuICB0aGlzLl9pID0gMDsgICAgICAgICAgICAgICAgLy8gbmV4dCBpbmRleFxuLy8gMjEuMS41LjIuMSAlU3RyaW5nSXRlcmF0b3JQcm90b3R5cGUlLm5leHQoKVxufSwgZnVuY3Rpb24gKCkge1xuICB2YXIgTyA9IHRoaXMuX3Q7XG4gIHZhciBpbmRleCA9IHRoaXMuX2k7XG4gIHZhciBwb2ludDtcbiAgaWYgKGluZGV4ID49IE8ubGVuZ3RoKSByZXR1cm4geyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH07XG4gIHBvaW50ID0gJGF0KE8sIGluZGV4KTtcbiAgdGhpcy5faSArPSBwb2ludC5sZW5ndGg7XG4gIHJldHVybiB7IHZhbHVlOiBwb2ludCwgZG9uZTogZmFsc2UgfTtcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuLy8gRUNNQVNjcmlwdCA2IHN5bWJvbHMgc2hpbVxudmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpO1xudmFyIGhhcyA9IHJlcXVpcmUoJy4vX2hhcycpO1xudmFyIERFU0NSSVBUT1JTID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKTtcbnZhciAkZXhwb3J0ID0gcmVxdWlyZSgnLi9fZXhwb3J0Jyk7XG52YXIgcmVkZWZpbmUgPSByZXF1aXJlKCcuL19yZWRlZmluZScpO1xudmFyIE1FVEEgPSByZXF1aXJlKCcuL19tZXRhJykuS0VZO1xudmFyICRmYWlscyA9IHJlcXVpcmUoJy4vX2ZhaWxzJyk7XG52YXIgc2hhcmVkID0gcmVxdWlyZSgnLi9fc2hhcmVkJyk7XG52YXIgc2V0VG9TdHJpbmdUYWcgPSByZXF1aXJlKCcuL19zZXQtdG8tc3RyaW5nLXRhZycpO1xudmFyIHVpZCA9IHJlcXVpcmUoJy4vX3VpZCcpO1xudmFyIHdrcyA9IHJlcXVpcmUoJy4vX3drcycpO1xudmFyIHdrc0V4dCA9IHJlcXVpcmUoJy4vX3drcy1leHQnKTtcbnZhciB3a3NEZWZpbmUgPSByZXF1aXJlKCcuL193a3MtZGVmaW5lJyk7XG52YXIgZW51bUtleXMgPSByZXF1aXJlKCcuL19lbnVtLWtleXMnKTtcbnZhciBpc0FycmF5ID0gcmVxdWlyZSgnLi9faXMtYXJyYXknKTtcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG52YXIgdG9PYmplY3QgPSByZXF1aXJlKCcuL190by1vYmplY3QnKTtcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG52YXIgdG9QcmltaXRpdmUgPSByZXF1aXJlKCcuL190by1wcmltaXRpdmUnKTtcbnZhciBjcmVhdGVEZXNjID0gcmVxdWlyZSgnLi9fcHJvcGVydHktZGVzYycpO1xudmFyIF9jcmVhdGUgPSByZXF1aXJlKCcuL19vYmplY3QtY3JlYXRlJyk7XG52YXIgZ09QTkV4dCA9IHJlcXVpcmUoJy4vX29iamVjdC1nb3BuLWV4dCcpO1xudmFyICRHT1BEID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdvcGQnKTtcbnZhciAkR09QUyA9IHJlcXVpcmUoJy4vX29iamVjdC1nb3BzJyk7XG52YXIgJERQID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJyk7XG52YXIgJGtleXMgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cycpO1xudmFyIGdPUEQgPSAkR09QRC5mO1xudmFyIGRQID0gJERQLmY7XG52YXIgZ09QTiA9IGdPUE5FeHQuZjtcbnZhciAkU3ltYm9sID0gZ2xvYmFsLlN5bWJvbDtcbnZhciAkSlNPTiA9IGdsb2JhbC5KU09OO1xudmFyIF9zdHJpbmdpZnkgPSAkSlNPTiAmJiAkSlNPTi5zdHJpbmdpZnk7XG52YXIgUFJPVE9UWVBFID0gJ3Byb3RvdHlwZSc7XG52YXIgSElEREVOID0gd2tzKCdfaGlkZGVuJyk7XG52YXIgVE9fUFJJTUlUSVZFID0gd2tzKCd0b1ByaW1pdGl2ZScpO1xudmFyIGlzRW51bSA9IHt9LnByb3BlcnR5SXNFbnVtZXJhYmxlO1xudmFyIFN5bWJvbFJlZ2lzdHJ5ID0gc2hhcmVkKCdzeW1ib2wtcmVnaXN0cnknKTtcbnZhciBBbGxTeW1ib2xzID0gc2hhcmVkKCdzeW1ib2xzJyk7XG52YXIgT1BTeW1ib2xzID0gc2hhcmVkKCdvcC1zeW1ib2xzJyk7XG52YXIgT2JqZWN0UHJvdG8gPSBPYmplY3RbUFJPVE9UWVBFXTtcbnZhciBVU0VfTkFUSVZFID0gdHlwZW9mICRTeW1ib2wgPT0gJ2Z1bmN0aW9uJyAmJiAhISRHT1BTLmY7XG52YXIgUU9iamVjdCA9IGdsb2JhbC5RT2JqZWN0O1xuLy8gRG9uJ3QgdXNlIHNldHRlcnMgaW4gUXQgU2NyaXB0LCBodHRwczovL2dpdGh1Yi5jb20vemxvaXJvY2svY29yZS1qcy9pc3N1ZXMvMTczXG52YXIgc2V0dGVyID0gIVFPYmplY3QgfHwgIVFPYmplY3RbUFJPVE9UWVBFXSB8fCAhUU9iamVjdFtQUk9UT1RZUEVdLmZpbmRDaGlsZDtcblxuLy8gZmFsbGJhY2sgZm9yIG9sZCBBbmRyb2lkLCBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9Njg3XG52YXIgc2V0U3ltYm9sRGVzYyA9IERFU0NSSVBUT1JTICYmICRmYWlscyhmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBfY3JlYXRlKGRQKHt9LCAnYScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGRQKHRoaXMsICdhJywgeyB2YWx1ZTogNyB9KS5hOyB9XG4gIH0pKS5hICE9IDc7XG59KSA/IGZ1bmN0aW9uIChpdCwga2V5LCBEKSB7XG4gIHZhciBwcm90b0Rlc2MgPSBnT1BEKE9iamVjdFByb3RvLCBrZXkpO1xuICBpZiAocHJvdG9EZXNjKSBkZWxldGUgT2JqZWN0UHJvdG9ba2V5XTtcbiAgZFAoaXQsIGtleSwgRCk7XG4gIGlmIChwcm90b0Rlc2MgJiYgaXQgIT09IE9iamVjdFByb3RvKSBkUChPYmplY3RQcm90bywga2V5LCBwcm90b0Rlc2MpO1xufSA6IGRQO1xuXG52YXIgd3JhcCA9IGZ1bmN0aW9uICh0YWcpIHtcbiAgdmFyIHN5bSA9IEFsbFN5bWJvbHNbdGFnXSA9IF9jcmVhdGUoJFN5bWJvbFtQUk9UT1RZUEVdKTtcbiAgc3ltLl9rID0gdGFnO1xuICByZXR1cm4gc3ltO1xufTtcblxudmFyIGlzU3ltYm9sID0gVVNFX05BVElWRSAmJiB0eXBlb2YgJFN5bWJvbC5pdGVyYXRvciA9PSAnc3ltYm9sJyA/IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gdHlwZW9mIGl0ID09ICdzeW1ib2wnO1xufSA6IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXQgaW5zdGFuY2VvZiAkU3ltYm9sO1xufTtcblxudmFyICRkZWZpbmVQcm9wZXJ0eSA9IGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KGl0LCBrZXksIEQpIHtcbiAgaWYgKGl0ID09PSBPYmplY3RQcm90bykgJGRlZmluZVByb3BlcnR5KE9QU3ltYm9scywga2V5LCBEKTtcbiAgYW5PYmplY3QoaXQpO1xuICBrZXkgPSB0b1ByaW1pdGl2ZShrZXksIHRydWUpO1xuICBhbk9iamVjdChEKTtcbiAgaWYgKGhhcyhBbGxTeW1ib2xzLCBrZXkpKSB7XG4gICAgaWYgKCFELmVudW1lcmFibGUpIHtcbiAgICAgIGlmICghaGFzKGl0LCBISURERU4pKSBkUChpdCwgSElEREVOLCBjcmVhdGVEZXNjKDEsIHt9KSk7XG4gICAgICBpdFtISURERU5dW2tleV0gPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoaGFzKGl0LCBISURERU4pICYmIGl0W0hJRERFTl1ba2V5XSkgaXRbSElEREVOXVtrZXldID0gZmFsc2U7XG4gICAgICBEID0gX2NyZWF0ZShELCB7IGVudW1lcmFibGU6IGNyZWF0ZURlc2MoMCwgZmFsc2UpIH0pO1xuICAgIH0gcmV0dXJuIHNldFN5bWJvbERlc2MoaXQsIGtleSwgRCk7XG4gIH0gcmV0dXJuIGRQKGl0LCBrZXksIEQpO1xufTtcbnZhciAkZGVmaW5lUHJvcGVydGllcyA9IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXMoaXQsIFApIHtcbiAgYW5PYmplY3QoaXQpO1xuICB2YXIga2V5cyA9IGVudW1LZXlzKFAgPSB0b0lPYmplY3QoUCkpO1xuICB2YXIgaSA9IDA7XG4gIHZhciBsID0ga2V5cy5sZW5ndGg7XG4gIHZhciBrZXk7XG4gIHdoaWxlIChsID4gaSkgJGRlZmluZVByb3BlcnR5KGl0LCBrZXkgPSBrZXlzW2krK10sIFBba2V5XSk7XG4gIHJldHVybiBpdDtcbn07XG52YXIgJGNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShpdCwgUCkge1xuICByZXR1cm4gUCA9PT0gdW5kZWZpbmVkID8gX2NyZWF0ZShpdCkgOiAkZGVmaW5lUHJvcGVydGllcyhfY3JlYXRlKGl0KSwgUCk7XG59O1xudmFyICRwcm9wZXJ0eUlzRW51bWVyYWJsZSA9IGZ1bmN0aW9uIHByb3BlcnR5SXNFbnVtZXJhYmxlKGtleSkge1xuICB2YXIgRSA9IGlzRW51bS5jYWxsKHRoaXMsIGtleSA9IHRvUHJpbWl0aXZlKGtleSwgdHJ1ZSkpO1xuICBpZiAodGhpcyA9PT0gT2JqZWN0UHJvdG8gJiYgaGFzKEFsbFN5bWJvbHMsIGtleSkgJiYgIWhhcyhPUFN5bWJvbHMsIGtleSkpIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIEUgfHwgIWhhcyh0aGlzLCBrZXkpIHx8ICFoYXMoQWxsU3ltYm9scywga2V5KSB8fCBoYXModGhpcywgSElEREVOKSAmJiB0aGlzW0hJRERFTl1ba2V5XSA/IEUgOiB0cnVlO1xufTtcbnZhciAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpIHtcbiAgaXQgPSB0b0lPYmplY3QoaXQpO1xuICBrZXkgPSB0b1ByaW1pdGl2ZShrZXksIHRydWUpO1xuICBpZiAoaXQgPT09IE9iamVjdFByb3RvICYmIGhhcyhBbGxTeW1ib2xzLCBrZXkpICYmICFoYXMoT1BTeW1ib2xzLCBrZXkpKSByZXR1cm47XG4gIHZhciBEID0gZ09QRChpdCwga2V5KTtcbiAgaWYgKEQgJiYgaGFzKEFsbFN5bWJvbHMsIGtleSkgJiYgIShoYXMoaXQsIEhJRERFTikgJiYgaXRbSElEREVOXVtrZXldKSkgRC5lbnVtZXJhYmxlID0gdHJ1ZTtcbiAgcmV0dXJuIEQ7XG59O1xudmFyICRnZXRPd25Qcm9wZXJ0eU5hbWVzID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhpdCkge1xuICB2YXIgbmFtZXMgPSBnT1BOKHRvSU9iamVjdChpdCkpO1xuICB2YXIgcmVzdWx0ID0gW107XG4gIHZhciBpID0gMDtcbiAgdmFyIGtleTtcbiAgd2hpbGUgKG5hbWVzLmxlbmd0aCA+IGkpIHtcbiAgICBpZiAoIWhhcyhBbGxTeW1ib2xzLCBrZXkgPSBuYW1lc1tpKytdKSAmJiBrZXkgIT0gSElEREVOICYmIGtleSAhPSBNRVRBKSByZXN1bHQucHVzaChrZXkpO1xuICB9IHJldHVybiByZXN1bHQ7XG59O1xudmFyICRnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMoaXQpIHtcbiAgdmFyIElTX09QID0gaXQgPT09IE9iamVjdFByb3RvO1xuICB2YXIgbmFtZXMgPSBnT1BOKElTX09QID8gT1BTeW1ib2xzIDogdG9JT2JqZWN0KGl0KSk7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgdmFyIGkgPSAwO1xuICB2YXIga2V5O1xuICB3aGlsZSAobmFtZXMubGVuZ3RoID4gaSkge1xuICAgIGlmIChoYXMoQWxsU3ltYm9scywga2V5ID0gbmFtZXNbaSsrXSkgJiYgKElTX09QID8gaGFzKE9iamVjdFByb3RvLCBrZXkpIDogdHJ1ZSkpIHJlc3VsdC5wdXNoKEFsbFN5bWJvbHNba2V5XSk7XG4gIH0gcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8vIDE5LjQuMS4xIFN5bWJvbChbZGVzY3JpcHRpb25dKVxuaWYgKCFVU0VfTkFUSVZFKSB7XG4gICRTeW1ib2wgPSBmdW5jdGlvbiBTeW1ib2woKSB7XG4gICAgaWYgKHRoaXMgaW5zdGFuY2VvZiAkU3ltYm9sKSB0aHJvdyBUeXBlRXJyb3IoJ1N5bWJvbCBpcyBub3QgYSBjb25zdHJ1Y3RvciEnKTtcbiAgICB2YXIgdGFnID0gdWlkKGFyZ3VtZW50cy5sZW5ndGggPiAwID8gYXJndW1lbnRzWzBdIDogdW5kZWZpbmVkKTtcbiAgICB2YXIgJHNldCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKHRoaXMgPT09IE9iamVjdFByb3RvKSAkc2V0LmNhbGwoT1BTeW1ib2xzLCB2YWx1ZSk7XG4gICAgICBpZiAoaGFzKHRoaXMsIEhJRERFTikgJiYgaGFzKHRoaXNbSElEREVOXSwgdGFnKSkgdGhpc1tISURERU5dW3RhZ10gPSBmYWxzZTtcbiAgICAgIHNldFN5bWJvbERlc2ModGhpcywgdGFnLCBjcmVhdGVEZXNjKDEsIHZhbHVlKSk7XG4gICAgfTtcbiAgICBpZiAoREVTQ1JJUFRPUlMgJiYgc2V0dGVyKSBzZXRTeW1ib2xEZXNjKE9iamVjdFByb3RvLCB0YWcsIHsgY29uZmlndXJhYmxlOiB0cnVlLCBzZXQ6ICRzZXQgfSk7XG4gICAgcmV0dXJuIHdyYXAodGFnKTtcbiAgfTtcbiAgcmVkZWZpbmUoJFN5bWJvbFtQUk9UT1RZUEVdLCAndG9TdHJpbmcnLCBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5faztcbiAgfSk7XG5cbiAgJEdPUEQuZiA9ICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG4gICREUC5mID0gJGRlZmluZVByb3BlcnR5O1xuICByZXF1aXJlKCcuL19vYmplY3QtZ29wbicpLmYgPSBnT1BORXh0LmYgPSAkZ2V0T3duUHJvcGVydHlOYW1lcztcbiAgcmVxdWlyZSgnLi9fb2JqZWN0LXBpZScpLmYgPSAkcHJvcGVydHlJc0VudW1lcmFibGU7XG4gICRHT1BTLmYgPSAkZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xuXG4gIGlmIChERVNDUklQVE9SUyAmJiAhcmVxdWlyZSgnLi9fbGlicmFyeScpKSB7XG4gICAgcmVkZWZpbmUoT2JqZWN0UHJvdG8sICdwcm9wZXJ0eUlzRW51bWVyYWJsZScsICRwcm9wZXJ0eUlzRW51bWVyYWJsZSwgdHJ1ZSk7XG4gIH1cblxuICB3a3NFeHQuZiA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgcmV0dXJuIHdyYXAod2tzKG5hbWUpKTtcbiAgfTtcbn1cblxuJGV4cG9ydCgkZXhwb3J0LkcgKyAkZXhwb3J0LlcgKyAkZXhwb3J0LkYgKiAhVVNFX05BVElWRSwgeyBTeW1ib2w6ICRTeW1ib2wgfSk7XG5cbmZvciAodmFyIGVzNlN5bWJvbHMgPSAoXG4gIC8vIDE5LjQuMi4yLCAxOS40LjIuMywgMTkuNC4yLjQsIDE5LjQuMi42LCAxOS40LjIuOCwgMTkuNC4yLjksIDE5LjQuMi4xMCwgMTkuNC4yLjExLCAxOS40LjIuMTIsIDE5LjQuMi4xMywgMTkuNC4yLjE0XG4gICdoYXNJbnN0YW5jZSxpc0NvbmNhdFNwcmVhZGFibGUsaXRlcmF0b3IsbWF0Y2gscmVwbGFjZSxzZWFyY2gsc3BlY2llcyxzcGxpdCx0b1ByaW1pdGl2ZSx0b1N0cmluZ1RhZyx1bnNjb3BhYmxlcydcbikuc3BsaXQoJywnKSwgaiA9IDA7IGVzNlN5bWJvbHMubGVuZ3RoID4gajspd2tzKGVzNlN5bWJvbHNbaisrXSk7XG5cbmZvciAodmFyIHdlbGxLbm93blN5bWJvbHMgPSAka2V5cyh3a3Muc3RvcmUpLCBrID0gMDsgd2VsbEtub3duU3ltYm9scy5sZW5ndGggPiBrOykgd2tzRGVmaW5lKHdlbGxLbm93blN5bWJvbHNbaysrXSk7XG5cbiRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogIVVTRV9OQVRJVkUsICdTeW1ib2wnLCB7XG4gIC8vIDE5LjQuMi4xIFN5bWJvbC5mb3Ioa2V5KVxuICAnZm9yJzogZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiBoYXMoU3ltYm9sUmVnaXN0cnksIGtleSArPSAnJylcbiAgICAgID8gU3ltYm9sUmVnaXN0cnlba2V5XVxuICAgICAgOiBTeW1ib2xSZWdpc3RyeVtrZXldID0gJFN5bWJvbChrZXkpO1xuICB9LFxuICAvLyAxOS40LjIuNSBTeW1ib2wua2V5Rm9yKHN5bSlcbiAga2V5Rm9yOiBmdW5jdGlvbiBrZXlGb3Ioc3ltKSB7XG4gICAgaWYgKCFpc1N5bWJvbChzeW0pKSB0aHJvdyBUeXBlRXJyb3Ioc3ltICsgJyBpcyBub3QgYSBzeW1ib2whJyk7XG4gICAgZm9yICh2YXIga2V5IGluIFN5bWJvbFJlZ2lzdHJ5KSBpZiAoU3ltYm9sUmVnaXN0cnlba2V5XSA9PT0gc3ltKSByZXR1cm4ga2V5O1xuICB9LFxuICB1c2VTZXR0ZXI6IGZ1bmN0aW9uICgpIHsgc2V0dGVyID0gdHJ1ZTsgfSxcbiAgdXNlU2ltcGxlOiBmdW5jdGlvbiAoKSB7IHNldHRlciA9IGZhbHNlOyB9XG59KTtcblxuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAhVVNFX05BVElWRSwgJ09iamVjdCcsIHtcbiAgLy8gMTkuMS4yLjIgT2JqZWN0LmNyZWF0ZShPIFssIFByb3BlcnRpZXNdKVxuICBjcmVhdGU6ICRjcmVhdGUsXG4gIC8vIDE5LjEuMi40IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShPLCBQLCBBdHRyaWJ1dGVzKVxuICBkZWZpbmVQcm9wZXJ0eTogJGRlZmluZVByb3BlcnR5LFxuICAvLyAxOS4xLjIuMyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhPLCBQcm9wZXJ0aWVzKVxuICBkZWZpbmVQcm9wZXJ0aWVzOiAkZGVmaW5lUHJvcGVydGllcyxcbiAgLy8gMTkuMS4yLjYgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKVxuICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I6ICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IsXG4gIC8vIDE5LjEuMi43IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKE8pXG4gIGdldE93blByb3BlcnR5TmFtZXM6ICRnZXRPd25Qcm9wZXJ0eU5hbWVzLFxuICAvLyAxOS4xLjIuOCBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKE8pXG4gIGdldE93blByb3BlcnR5U3ltYm9sczogJGdldE93blByb3BlcnR5U3ltYm9sc1xufSk7XG5cbi8vIENocm9tZSAzOCBhbmQgMzkgYE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHNgIGZhaWxzIG9uIHByaW1pdGl2ZXNcbi8vIGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTM0NDNcbnZhciBGQUlMU19PTl9QUklNSVRJVkVTID0gJGZhaWxzKGZ1bmN0aW9uICgpIHsgJEdPUFMuZigxKTsgfSk7XG5cbiRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogRkFJTFNfT05fUFJJTUlUSVZFUywgJ09iamVjdCcsIHtcbiAgZ2V0T3duUHJvcGVydHlTeW1ib2xzOiBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMoaXQpIHtcbiAgICByZXR1cm4gJEdPUFMuZih0b09iamVjdChpdCkpO1xuICB9XG59KTtcblxuLy8gMjQuMy4yIEpTT04uc3RyaW5naWZ5KHZhbHVlIFssIHJlcGxhY2VyIFssIHNwYWNlXV0pXG4kSlNPTiAmJiAkZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICghVVNFX05BVElWRSB8fCAkZmFpbHMoZnVuY3Rpb24gKCkge1xuICB2YXIgUyA9ICRTeW1ib2woKTtcbiAgLy8gTVMgRWRnZSBjb252ZXJ0cyBzeW1ib2wgdmFsdWVzIHRvIEpTT04gYXMge31cbiAgLy8gV2ViS2l0IGNvbnZlcnRzIHN5bWJvbCB2YWx1ZXMgdG8gSlNPTiBhcyBudWxsXG4gIC8vIFY4IHRocm93cyBvbiBib3hlZCBzeW1ib2xzXG4gIHJldHVybiBfc3RyaW5naWZ5KFtTXSkgIT0gJ1tudWxsXScgfHwgX3N0cmluZ2lmeSh7IGE6IFMgfSkgIT0gJ3t9JyB8fCBfc3RyaW5naWZ5KE9iamVjdChTKSkgIT0gJ3t9Jztcbn0pKSwgJ0pTT04nLCB7XG4gIHN0cmluZ2lmeTogZnVuY3Rpb24gc3RyaW5naWZ5KGl0KSB7XG4gICAgdmFyIGFyZ3MgPSBbaXRdO1xuICAgIHZhciBpID0gMTtcbiAgICB2YXIgcmVwbGFjZXIsICRyZXBsYWNlcjtcbiAgICB3aGlsZSAoYXJndW1lbnRzLmxlbmd0aCA+IGkpIGFyZ3MucHVzaChhcmd1bWVudHNbaSsrXSk7XG4gICAgJHJlcGxhY2VyID0gcmVwbGFjZXIgPSBhcmdzWzFdO1xuICAgIGlmICghaXNPYmplY3QocmVwbGFjZXIpICYmIGl0ID09PSB1bmRlZmluZWQgfHwgaXNTeW1ib2woaXQpKSByZXR1cm47IC8vIElFOCByZXR1cm5zIHN0cmluZyBvbiB1bmRlZmluZWRcbiAgICBpZiAoIWlzQXJyYXkocmVwbGFjZXIpKSByZXBsYWNlciA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICBpZiAodHlwZW9mICRyZXBsYWNlciA9PSAnZnVuY3Rpb24nKSB2YWx1ZSA9ICRyZXBsYWNlci5jYWxsKHRoaXMsIGtleSwgdmFsdWUpO1xuICAgICAgaWYgKCFpc1N5bWJvbCh2YWx1ZSkpIHJldHVybiB2YWx1ZTtcbiAgICB9O1xuICAgIGFyZ3NbMV0gPSByZXBsYWNlcjtcbiAgICByZXR1cm4gX3N0cmluZ2lmeS5hcHBseSgkSlNPTiwgYXJncyk7XG4gIH1cbn0pO1xuXG4vLyAxOS40LjMuNCBTeW1ib2wucHJvdG90eXBlW0BAdG9QcmltaXRpdmVdKGhpbnQpXG4kU3ltYm9sW1BST1RPVFlQRV1bVE9fUFJJTUlUSVZFXSB8fCByZXF1aXJlKCcuL19oaWRlJykoJFN5bWJvbFtQUk9UT1RZUEVdLCBUT19QUklNSVRJVkUsICRTeW1ib2xbUFJPVE9UWVBFXS52YWx1ZU9mKTtcbi8vIDE5LjQuMy41IFN5bWJvbC5wcm90b3R5cGVbQEB0b1N0cmluZ1RhZ11cbnNldFRvU3RyaW5nVGFnKCRTeW1ib2wsICdTeW1ib2wnKTtcbi8vIDIwLjIuMS45IE1hdGhbQEB0b1N0cmluZ1RhZ11cbnNldFRvU3RyaW5nVGFnKE1hdGgsICdNYXRoJywgdHJ1ZSk7XG4vLyAyNC4zLjMgSlNPTltAQHRvU3RyaW5nVGFnXVxuc2V0VG9TdHJpbmdUYWcoZ2xvYmFsLkpTT04sICdKU09OJywgdHJ1ZSk7XG4iLCIvLyBodHRwczovL2dpdGh1Yi5jb20vdGMzOS9wcm9wb3NhbC1vYmplY3QtZ2V0b3ducHJvcGVydHlkZXNjcmlwdG9yc1xudmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcbnZhciBvd25LZXlzID0gcmVxdWlyZSgnLi9fb3duLWtleXMnKTtcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG52YXIgZ09QRCA9IHJlcXVpcmUoJy4vX29iamVjdC1nb3BkJyk7XG52YXIgY3JlYXRlUHJvcGVydHkgPSByZXF1aXJlKCcuL19jcmVhdGUtcHJvcGVydHknKTtcblxuJGV4cG9ydCgkZXhwb3J0LlMsICdPYmplY3QnLCB7XG4gIGdldE93blByb3BlcnR5RGVzY3JpcHRvcnM6IGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcnMob2JqZWN0KSB7XG4gICAgdmFyIE8gPSB0b0lPYmplY3Qob2JqZWN0KTtcbiAgICB2YXIgZ2V0RGVzYyA9IGdPUEQuZjtcbiAgICB2YXIga2V5cyA9IG93bktleXMoTyk7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIHZhciBpID0gMDtcbiAgICB2YXIga2V5LCBkZXNjO1xuICAgIHdoaWxlIChrZXlzLmxlbmd0aCA+IGkpIHtcbiAgICAgIGRlc2MgPSBnZXREZXNjKE8sIGtleSA9IGtleXNbaSsrXSk7XG4gICAgICBpZiAoZGVzYyAhPT0gdW5kZWZpbmVkKSBjcmVhdGVQcm9wZXJ0eShyZXN1bHQsIGtleSwgZGVzYyk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn0pO1xuIiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL3RjMzkvcHJvcG9zYWwtb2JqZWN0LXZhbHVlcy1lbnRyaWVzXG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpO1xudmFyICR2YWx1ZXMgPSByZXF1aXJlKCcuL19vYmplY3QtdG8tYXJyYXknKShmYWxzZSk7XG5cbiRleHBvcnQoJGV4cG9ydC5TLCAnT2JqZWN0Jywge1xuICB2YWx1ZXM6IGZ1bmN0aW9uIHZhbHVlcyhpdCkge1xuICAgIHJldHVybiAkdmFsdWVzKGl0KTtcbiAgfVxufSk7XG4iLCIvLyBodHRwczovL2dpdGh1Yi5jb20vdGMzOS9wcm9wb3NhbC1wcm9taXNlLWZpbmFsbHlcbid1c2Ugc3RyaWN0JztcbnZhciAkZXhwb3J0ID0gcmVxdWlyZSgnLi9fZXhwb3J0Jyk7XG52YXIgY29yZSA9IHJlcXVpcmUoJy4vX2NvcmUnKTtcbnZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciBzcGVjaWVzQ29uc3RydWN0b3IgPSByZXF1aXJlKCcuL19zcGVjaWVzLWNvbnN0cnVjdG9yJyk7XG52YXIgcHJvbWlzZVJlc29sdmUgPSByZXF1aXJlKCcuL19wcm9taXNlLXJlc29sdmUnKTtcblxuJGV4cG9ydCgkZXhwb3J0LlAgKyAkZXhwb3J0LlIsICdQcm9taXNlJywgeyAnZmluYWxseSc6IGZ1bmN0aW9uIChvbkZpbmFsbHkpIHtcbiAgdmFyIEMgPSBzcGVjaWVzQ29uc3RydWN0b3IodGhpcywgY29yZS5Qcm9taXNlIHx8IGdsb2JhbC5Qcm9taXNlKTtcbiAgdmFyIGlzRnVuY3Rpb24gPSB0eXBlb2Ygb25GaW5hbGx5ID09ICdmdW5jdGlvbic7XG4gIHJldHVybiB0aGlzLnRoZW4oXG4gICAgaXNGdW5jdGlvbiA/IGZ1bmN0aW9uICh4KSB7XG4gICAgICByZXR1cm4gcHJvbWlzZVJlc29sdmUoQywgb25GaW5hbGx5KCkpLnRoZW4oZnVuY3Rpb24gKCkgeyByZXR1cm4geDsgfSk7XG4gICAgfSA6IG9uRmluYWxseSxcbiAgICBpc0Z1bmN0aW9uID8gZnVuY3Rpb24gKGUpIHtcbiAgICAgIHJldHVybiBwcm9taXNlUmVzb2x2ZShDLCBvbkZpbmFsbHkoKSkudGhlbihmdW5jdGlvbiAoKSB7IHRocm93IGU7IH0pO1xuICAgIH0gOiBvbkZpbmFsbHlcbiAgKTtcbn0gfSk7XG4iLCIndXNlIHN0cmljdCc7XG4vLyBodHRwczovL2dpdGh1Yi5jb20vdGMzOS9wcm9wb3NhbC1wcm9taXNlLXRyeVxudmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcbnZhciBuZXdQcm9taXNlQ2FwYWJpbGl0eSA9IHJlcXVpcmUoJy4vX25ldy1wcm9taXNlLWNhcGFiaWxpdHknKTtcbnZhciBwZXJmb3JtID0gcmVxdWlyZSgnLi9fcGVyZm9ybScpO1xuXG4kZXhwb3J0KCRleHBvcnQuUywgJ1Byb21pc2UnLCB7ICd0cnknOiBmdW5jdGlvbiAoY2FsbGJhY2tmbikge1xuICB2YXIgcHJvbWlzZUNhcGFiaWxpdHkgPSBuZXdQcm9taXNlQ2FwYWJpbGl0eS5mKHRoaXMpO1xuICB2YXIgcmVzdWx0ID0gcGVyZm9ybShjYWxsYmFja2ZuKTtcbiAgKHJlc3VsdC5lID8gcHJvbWlzZUNhcGFiaWxpdHkucmVqZWN0IDogcHJvbWlzZUNhcGFiaWxpdHkucmVzb2x2ZSkocmVzdWx0LnYpO1xuICByZXR1cm4gcHJvbWlzZUNhcGFiaWxpdHkucHJvbWlzZTtcbn0gfSk7XG4iLCJyZXF1aXJlKCcuL193a3MtZGVmaW5lJykoJ2FzeW5jSXRlcmF0b3InKTtcbiIsInJlcXVpcmUoJy4vX3drcy1kZWZpbmUnKSgnb2JzZXJ2YWJsZScpO1xuIiwicmVxdWlyZSgnLi9lczYuYXJyYXkuaXRlcmF0b3InKTtcbnZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciBoaWRlID0gcmVxdWlyZSgnLi9faGlkZScpO1xudmFyIEl0ZXJhdG9ycyA9IHJlcXVpcmUoJy4vX2l0ZXJhdG9ycycpO1xudmFyIFRPX1NUUklOR19UQUcgPSByZXF1aXJlKCcuL193a3MnKSgndG9TdHJpbmdUYWcnKTtcblxudmFyIERPTUl0ZXJhYmxlcyA9ICgnQ1NTUnVsZUxpc3QsQ1NTU3R5bGVEZWNsYXJhdGlvbixDU1NWYWx1ZUxpc3QsQ2xpZW50UmVjdExpc3QsRE9NUmVjdExpc3QsRE9NU3RyaW5nTGlzdCwnICtcbiAgJ0RPTVRva2VuTGlzdCxEYXRhVHJhbnNmZXJJdGVtTGlzdCxGaWxlTGlzdCxIVE1MQWxsQ29sbGVjdGlvbixIVE1MQ29sbGVjdGlvbixIVE1MRm9ybUVsZW1lbnQsSFRNTFNlbGVjdEVsZW1lbnQsJyArXG4gICdNZWRpYUxpc3QsTWltZVR5cGVBcnJheSxOYW1lZE5vZGVNYXAsTm9kZUxpc3QsUGFpbnRSZXF1ZXN0TGlzdCxQbHVnaW4sUGx1Z2luQXJyYXksU1ZHTGVuZ3RoTGlzdCxTVkdOdW1iZXJMaXN0LCcgK1xuICAnU1ZHUGF0aFNlZ0xpc3QsU1ZHUG9pbnRMaXN0LFNWR1N0cmluZ0xpc3QsU1ZHVHJhbnNmb3JtTGlzdCxTb3VyY2VCdWZmZXJMaXN0LFN0eWxlU2hlZXRMaXN0LFRleHRUcmFja0N1ZUxpc3QsJyArXG4gICdUZXh0VHJhY2tMaXN0LFRvdWNoTGlzdCcpLnNwbGl0KCcsJyk7XG5cbmZvciAodmFyIGkgPSAwOyBpIDwgRE9NSXRlcmFibGVzLmxlbmd0aDsgaSsrKSB7XG4gIHZhciBOQU1FID0gRE9NSXRlcmFibGVzW2ldO1xuICB2YXIgQ29sbGVjdGlvbiA9IGdsb2JhbFtOQU1FXTtcbiAgdmFyIHByb3RvID0gQ29sbGVjdGlvbiAmJiBDb2xsZWN0aW9uLnByb3RvdHlwZTtcbiAgaWYgKHByb3RvICYmICFwcm90b1tUT19TVFJJTkdfVEFHXSkgaGlkZShwcm90bywgVE9fU1RSSU5HX1RBRywgTkFNRSk7XG4gIEl0ZXJhdG9yc1tOQU1FXSA9IEl0ZXJhdG9ycy5BcnJheTtcbn1cbiIsIlxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciB0b0Z1bmN0aW9uID0gcmVxdWlyZSgndG8tZnVuY3Rpb24nKTtcblxuLyoqXG4gKiBHcm91cCBgYXJyYCB3aXRoIGNhbGxiYWNrIGBmbih2YWwsIGkpYC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJcbiAqIEBwYXJhbSB7RnVuY3Rpb258U3RyaW5nfSBmbiBvciBwcm9wXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcnIsIGZuKXtcbiAgdmFyIHJldCA9IHt9O1xuICB2YXIgcHJvcDtcbiAgZm4gPSB0b0Z1bmN0aW9uKGZuKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7ICsraSkge1xuICAgIHByb3AgPSBmbihhcnJbaV0sIGkpO1xuICAgIHJldFtwcm9wXSA9IHJldFtwcm9wXSB8fCBbXTtcbiAgICByZXRbcHJvcF0ucHVzaChhcnJbaV0pO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn07IiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KXtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qaXN0YW5idWwgaWdub3JlIG5leHQ6Y2FudCB0ZXN0Ki9cbiAgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKFtdLCBmYWN0b3J5KTtcbiAgfSBlbHNlIHtcbiAgICAvLyBCcm93c2VyIGdsb2JhbHNcbiAgICByb290Lm9iamVjdFBhdGggPSBmYWN0b3J5KCk7XG4gIH1cbn0pKHRoaXMsIGZ1bmN0aW9uKCl7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgdG9TdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuICBmdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgICBpZihvYmogPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIC8vdG8gaGFuZGxlIG9iamVjdHMgd2l0aCBudWxsIHByb3RvdHlwZXMgKHRvbyBlZGdlIGNhc2U/KVxuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKVxuICB9XG5cbiAgZnVuY3Rpb24gaXNFbXB0eSh2YWx1ZSl7XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmIChpc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGZvciAodmFyIGkgaW4gdmFsdWUpIHtcbiAgICAgICAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgaSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRvU3RyaW5nKHR5cGUpe1xuICAgIHJldHVybiB0b1N0ci5jYWxsKHR5cGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNPYmplY3Qob2JqKXtcbiAgICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgdG9TdHJpbmcob2JqKSA9PT0gXCJbb2JqZWN0IE9iamVjdF1cIjtcbiAgfVxuXG4gIHZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbihvYmope1xuICAgIC8qaXN0YW5idWwgaWdub3JlIG5leHQ6Y2FudCB0ZXN0Ki9cbiAgICByZXR1cm4gdG9TdHIuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNCb29sZWFuKG9iail7XG4gICAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdib29sZWFuJyB8fCB0b1N0cmluZyhvYmopID09PSAnW29iamVjdCBCb29sZWFuXSc7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRLZXkoa2V5KXtcbiAgICB2YXIgaW50S2V5ID0gcGFyc2VJbnQoa2V5KTtcbiAgICBpZiAoaW50S2V5LnRvU3RyaW5nKCkgPT09IGtleSkge1xuICAgICAgcmV0dXJuIGludEtleTtcbiAgICB9XG4gICAgcmV0dXJuIGtleTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZhY3Rvcnkob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG5cbiAgICB2YXIgb2JqZWN0UGF0aCA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iamVjdFBhdGgpLnJlZHVjZShmdW5jdGlvbihwcm94eSwgcHJvcCkge1xuICAgICAgICBpZihwcm9wID09PSAnY3JlYXRlJykge1xuICAgICAgICAgIHJldHVybiBwcm94eTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qaXN0YW5idWwgaWdub3JlIGVsc2UqL1xuICAgICAgICBpZiAodHlwZW9mIG9iamVjdFBhdGhbcHJvcF0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBwcm94eVtwcm9wXSA9IG9iamVjdFBhdGhbcHJvcF0uYmluZChvYmplY3RQYXRoLCBvYmopO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHByb3h5O1xuICAgICAgfSwge30pO1xuICAgIH07XG5cbiAgICB2YXIgaGFzU2hhbGxvd1Byb3BlcnR5XG4gICAgaWYgKG9wdGlvbnMuaW5jbHVkZUluaGVyaXRlZFByb3BzKSB7XG4gICAgICBoYXNTaGFsbG93UHJvcGVydHkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGhhc1NoYWxsb3dQcm9wZXJ0eSA9IGZ1bmN0aW9uIChvYmosIHByb3ApIHtcbiAgICAgICAgcmV0dXJuICh0eXBlb2YgcHJvcCA9PT0gJ251bWJlcicgJiYgQXJyYXkuaXNBcnJheShvYmopKSB8fCBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApXG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0U2hhbGxvd1Byb3BlcnR5KG9iaiwgcHJvcCkge1xuICAgICAgaWYgKGhhc1NoYWxsb3dQcm9wZXJ0eShvYmosIHByb3ApKSB7XG4gICAgICAgIHJldHVybiBvYmpbcHJvcF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2V0KG9iaiwgcGF0aCwgdmFsdWUsIGRvTm90UmVwbGFjZSl7XG4gICAgICBpZiAodHlwZW9mIHBhdGggPT09ICdudW1iZXInKSB7XG4gICAgICAgIHBhdGggPSBbcGF0aF07XG4gICAgICB9XG4gICAgICBpZiAoIXBhdGggfHwgcGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIHNldChvYmosIHBhdGguc3BsaXQoJy4nKS5tYXAoZ2V0S2V5KSwgdmFsdWUsIGRvTm90UmVwbGFjZSk7XG4gICAgICB9XG4gICAgICB2YXIgY3VycmVudFBhdGggPSBwYXRoWzBdO1xuICAgICAgdmFyIGN1cnJlbnRWYWx1ZSA9IGdldFNoYWxsb3dQcm9wZXJ0eShvYmosIGN1cnJlbnRQYXRoKTtcbiAgICAgIGlmIChvcHRpb25zLmluY2x1ZGVJbmhlcml0ZWRQcm9wcyAmJiAoY3VycmVudFBhdGggPT09ICdfX3Byb3RvX18nIHx8XG4gICAgICAgIChjdXJyZW50UGF0aCA9PT0gJ2NvbnN0cnVjdG9yJyAmJiB0eXBlb2YgY3VycmVudFZhbHVlID09PSAnZnVuY3Rpb24nKSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGb3Igc2VjdXJpdHkgcmVhc29ucywgb2JqZWN0XFwncyBtYWdpYyBwcm9wZXJ0aWVzIGNhbm5vdCBiZSBzZXQnKVxuICAgICAgfVxuICAgICAgaWYgKHBhdGgubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGlmIChjdXJyZW50VmFsdWUgPT09IHZvaWQgMCB8fCAhZG9Ob3RSZXBsYWNlKSB7XG4gICAgICAgICAgb2JqW2N1cnJlbnRQYXRoXSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjdXJyZW50VmFsdWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChjdXJyZW50VmFsdWUgPT09IHZvaWQgMCkge1xuICAgICAgICAvL2NoZWNrIGlmIHdlIGFzc3VtZSBhbiBhcnJheVxuICAgICAgICBpZih0eXBlb2YgcGF0aFsxXSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICBvYmpbY3VycmVudFBhdGhdID0gW107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2JqW2N1cnJlbnRQYXRoXSA9IHt9O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZXQob2JqW2N1cnJlbnRQYXRoXSwgcGF0aC5zbGljZSgxKSwgdmFsdWUsIGRvTm90UmVwbGFjZSk7XG4gICAgfVxuXG4gICAgb2JqZWN0UGF0aC5oYXMgPSBmdW5jdGlvbiAob2JqLCBwYXRoKSB7XG4gICAgICBpZiAodHlwZW9mIHBhdGggPT09ICdudW1iZXInKSB7XG4gICAgICAgIHBhdGggPSBbcGF0aF07XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBwYXRoID09PSAnc3RyaW5nJykge1xuICAgICAgICBwYXRoID0gcGF0aC5zcGxpdCgnLicpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXBhdGggfHwgcGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuICEhb2JqO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhdGgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGogPSBnZXRLZXkocGF0aFtpXSk7XG5cbiAgICAgICAgaWYoKHR5cGVvZiBqID09PSAnbnVtYmVyJyAmJiBpc0FycmF5KG9iaikgJiYgaiA8IG9iai5sZW5ndGgpIHx8XG4gICAgICAgICAgKG9wdGlvbnMuaW5jbHVkZUluaGVyaXRlZFByb3BzID8gKGogaW4gT2JqZWN0KG9iaikpIDogaGFzT3duUHJvcGVydHkob2JqLCBqKSkpIHtcbiAgICAgICAgICBvYmogPSBvYmpbal07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICBvYmplY3RQYXRoLmVuc3VyZUV4aXN0cyA9IGZ1bmN0aW9uIChvYmosIHBhdGgsIHZhbHVlKXtcbiAgICAgIHJldHVybiBzZXQob2JqLCBwYXRoLCB2YWx1ZSwgdHJ1ZSk7XG4gICAgfTtcblxuICAgIG9iamVjdFBhdGguc2V0ID0gZnVuY3Rpb24gKG9iaiwgcGF0aCwgdmFsdWUsIGRvTm90UmVwbGFjZSl7XG4gICAgICByZXR1cm4gc2V0KG9iaiwgcGF0aCwgdmFsdWUsIGRvTm90UmVwbGFjZSk7XG4gICAgfTtcblxuICAgIG9iamVjdFBhdGguaW5zZXJ0ID0gZnVuY3Rpb24gKG9iaiwgcGF0aCwgdmFsdWUsIGF0KXtcbiAgICAgIHZhciBhcnIgPSBvYmplY3RQYXRoLmdldChvYmosIHBhdGgpO1xuICAgICAgYXQgPSB+fmF0O1xuICAgICAgaWYgKCFpc0FycmF5KGFycikpIHtcbiAgICAgICAgYXJyID0gW107XG4gICAgICAgIG9iamVjdFBhdGguc2V0KG9iaiwgcGF0aCwgYXJyKTtcbiAgICAgIH1cbiAgICAgIGFyci5zcGxpY2UoYXQsIDAsIHZhbHVlKTtcbiAgICB9O1xuXG4gICAgb2JqZWN0UGF0aC5lbXB0eSA9IGZ1bmN0aW9uKG9iaiwgcGF0aCkge1xuICAgICAgaWYgKGlzRW1wdHkocGF0aCkpIHtcbiAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICAgIH1cbiAgICAgIGlmIChvYmogPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgfVxuXG4gICAgICB2YXIgdmFsdWUsIGk7XG4gICAgICBpZiAoISh2YWx1ZSA9IG9iamVjdFBhdGguZ2V0KG9iaiwgcGF0aCkpKSB7XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBvYmplY3RQYXRoLnNldChvYmosIHBhdGgsICcnKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNCb29sZWFuKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gb2JqZWN0UGF0aC5zZXQob2JqLCBwYXRoLCBmYWxzZSk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdFBhdGguc2V0KG9iaiwgcGF0aCwgMCk7XG4gICAgICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgIHZhbHVlLmxlbmd0aCA9IDA7XG4gICAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KHZhbHVlKSkge1xuICAgICAgICBmb3IgKGkgaW4gdmFsdWUpIHtcbiAgICAgICAgICBpZiAoaGFzU2hhbGxvd1Byb3BlcnR5KHZhbHVlLCBpKSkge1xuICAgICAgICAgICAgZGVsZXRlIHZhbHVlW2ldO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdFBhdGguc2V0KG9iaiwgcGF0aCwgbnVsbCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIG9iamVjdFBhdGgucHVzaCA9IGZ1bmN0aW9uIChvYmosIHBhdGggLyosIHZhbHVlcyAqLyl7XG4gICAgICB2YXIgYXJyID0gb2JqZWN0UGF0aC5nZXQob2JqLCBwYXRoKTtcbiAgICAgIGlmICghaXNBcnJheShhcnIpKSB7XG4gICAgICAgIGFyciA9IFtdO1xuICAgICAgICBvYmplY3RQYXRoLnNldChvYmosIHBhdGgsIGFycik7XG4gICAgICB9XG5cbiAgICAgIGFyci5wdXNoLmFwcGx5KGFyciwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKSk7XG4gICAgfTtcblxuICAgIG9iamVjdFBhdGguY29hbGVzY2UgPSBmdW5jdGlvbiAob2JqLCBwYXRocywgZGVmYXVsdFZhbHVlKSB7XG4gICAgICB2YXIgdmFsdWU7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBwYXRocy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAoKHZhbHVlID0gb2JqZWN0UGF0aC5nZXQob2JqLCBwYXRoc1tpXSkpICE9PSB2b2lkIDApIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICB9O1xuXG4gICAgb2JqZWN0UGF0aC5nZXQgPSBmdW5jdGlvbiAob2JqLCBwYXRoLCBkZWZhdWx0VmFsdWUpe1xuICAgICAgaWYgKHR5cGVvZiBwYXRoID09PSAnbnVtYmVyJykge1xuICAgICAgICBwYXRoID0gW3BhdGhdO1xuICAgICAgfVxuICAgICAgaWYgKCFwYXRoIHx8IHBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgICB9XG4gICAgICBpZiAob2JqID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdFBhdGguZ2V0KG9iaiwgcGF0aC5zcGxpdCgnLicpLCBkZWZhdWx0VmFsdWUpO1xuICAgICAgfVxuXG4gICAgICB2YXIgY3VycmVudFBhdGggPSBnZXRLZXkocGF0aFswXSk7XG4gICAgICB2YXIgbmV4dE9iaiA9IGdldFNoYWxsb3dQcm9wZXJ0eShvYmosIGN1cnJlbnRQYXRoKVxuICAgICAgaWYgKG5leHRPYmogPT09IHZvaWQgMCkge1xuICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICAgICAgfVxuXG4gICAgICBpZiAocGF0aC5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIG5leHRPYmo7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvYmplY3RQYXRoLmdldChvYmpbY3VycmVudFBhdGhdLCBwYXRoLnNsaWNlKDEpLCBkZWZhdWx0VmFsdWUpO1xuICAgIH07XG5cbiAgICBvYmplY3RQYXRoLmRlbCA9IGZ1bmN0aW9uIGRlbChvYmosIHBhdGgpIHtcbiAgICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcGF0aCA9IFtwYXRoXTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9iaiA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc0VtcHR5KHBhdGgpKSB7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgICB9XG4gICAgICBpZih0eXBlb2YgcGF0aCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdFBhdGguZGVsKG9iaiwgcGF0aC5zcGxpdCgnLicpKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGN1cnJlbnRQYXRoID0gZ2V0S2V5KHBhdGhbMF0pO1xuICAgICAgaWYgKCFoYXNTaGFsbG93UHJvcGVydHkob2JqLCBjdXJyZW50UGF0aCkpIHtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgIH1cblxuICAgICAgaWYocGF0aC5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgICAgICAgIG9iai5zcGxpY2UoY3VycmVudFBhdGgsIDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZSBvYmpbY3VycmVudFBhdGhdO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gb2JqZWN0UGF0aC5kZWwob2JqW2N1cnJlbnRQYXRoXSwgcGF0aC5zbGljZSgxKSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iamVjdFBhdGg7XG4gIH1cblxuICB2YXIgbW9kID0gZmFjdG9yeSgpO1xuICBtb2QuY3JlYXRlID0gZmFjdG9yeTtcbiAgbW9kLndpdGhJbmhlcml0ZWRQcm9wcyA9IGZhY3Rvcnkoe2luY2x1ZGVJbmhlcml0ZWRQcm9wczogdHJ1ZX0pXG4gIHJldHVybiBtb2Q7XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gZG9FdmFsKHNlbGYsIF9fcHNldWRvd29ya2VyX3NjcmlwdCkge1xuICAvKiBqc2hpbnQgdW51c2VkOmZhbHNlICovXG4gIChmdW5jdGlvbiAoKSB7XG4gICAgLyoganNoaW50IGV2aWw6dHJ1ZSAqL1xuICAgIGV2YWwoX19wc2V1ZG93b3JrZXJfc2NyaXB0KTtcbiAgfSkuY2FsbChnbG9iYWwpO1xufVxuXG5mdW5jdGlvbiBQc2V1ZG9Xb3JrZXIocGF0aCkge1xuICB2YXIgbWVzc2FnZUxpc3RlbmVycyA9IFtdO1xuICB2YXIgZXJyb3JMaXN0ZW5lcnMgPSBbXTtcbiAgdmFyIHdvcmtlck1lc3NhZ2VMaXN0ZW5lcnMgPSBbXTtcbiAgdmFyIHdvcmtlckVycm9yTGlzdGVuZXJzID0gW107XG4gIHZhciBwb3N0TWVzc2FnZUxpc3RlbmVycyA9IFtdO1xuICB2YXIgdGVybWluYXRlZCA9IGZhbHNlO1xuICB2YXIgc2NyaXB0O1xuICB2YXIgd29ya2VyU2VsZjtcblxuICB2YXIgYXBpID0gdGhpcztcblxuICAvLyBjdXN0b20gZWFjaCBsb29wIGlzIGZvciBJRTggc3VwcG9ydFxuICBmdW5jdGlvbiBleGVjdXRlRWFjaChhcnIsIGZ1bikge1xuICAgIHZhciBpID0gLTE7XG4gICAgd2hpbGUgKCsraSA8IGFyci5sZW5ndGgpIHtcbiAgICAgIGlmIChhcnJbaV0pIHtcbiAgICAgICAgZnVuKGFycltpXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2FsbEVycm9yTGlzdGVuZXIoZXJyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuICAgICAgbGlzdGVuZXIoe1xuICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICBlcnJvcjogZXJyLFxuICAgICAgICBtZXNzYWdlOiBlcnIubWVzc2FnZVxuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXIodHlwZSwgZnVuKSB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICBpZiAodHlwZSA9PT0gJ21lc3NhZ2UnKSB7XG4gICAgICBtZXNzYWdlTGlzdGVuZXJzLnB1c2goZnVuKTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICAgIGVycm9yTGlzdGVuZXJzLnB1c2goZnVuKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGZ1bikge1xuICAgICAgdmFyIGxpc3RlbmVycztcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICBpZiAodHlwZSA9PT0gJ21lc3NhZ2UnKSB7XG4gICAgICAgIGxpc3RlbmVycyA9IG1lc3NhZ2VMaXN0ZW5lcnM7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICAgICAgbGlzdGVuZXJzID0gZXJyb3JMaXN0ZW5lcnM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgaSA9IC0xO1xuICAgICAgd2hpbGUgKCsraSA8IGxpc3RlbmVycy5sZW5ndGgpIHtcbiAgICAgICAgdmFyIGxpc3RlbmVyID0gbGlzdGVuZXJzW2ldO1xuICAgICAgICBpZiAobGlzdGVuZXIgPT09IGZ1bikge1xuICAgICAgICAgIGRlbGV0ZSBsaXN0ZW5lcnNbaV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHBvc3RFcnJvcihlcnIpIHtcbiAgICB2YXIgY2FsbEZ1biA9IGNhbGxFcnJvckxpc3RlbmVyKGVycik7XG4gICAgaWYgKHR5cGVvZiBhcGkub25lcnJvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY2FsbEZ1bihhcGkub25lcnJvcik7XG4gICAgfVxuICAgIGlmICh3b3JrZXJTZWxmICYmIHR5cGVvZiB3b3JrZXJTZWxmLm9uZXJyb3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNhbGxGdW4od29ya2VyU2VsZi5vbmVycm9yKTtcbiAgICB9XG4gICAgZXhlY3V0ZUVhY2goZXJyb3JMaXN0ZW5lcnMsIGNhbGxGdW4pO1xuICAgIGV4ZWN1dGVFYWNoKHdvcmtlckVycm9yTGlzdGVuZXJzLCBjYWxsRnVuKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJ1blBvc3RNZXNzYWdlKG1zZywgdHJhbnNmZXIpIHtcbiAgICBmdW5jdGlvbiBjYWxsRnVuKGxpc3RlbmVyKSB7XG4gICAgICB0cnkge1xuICAgICAgICBsaXN0ZW5lcih7ZGF0YTogbXNnLCBwb3J0czogdHJhbnNmZXJ9KTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBwb3N0RXJyb3IoZXJyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHdvcmtlclNlbGYgJiYgdHlwZW9mIHdvcmtlclNlbGYub25tZXNzYWdlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjYWxsRnVuKHdvcmtlclNlbGYub25tZXNzYWdlKTtcbiAgICB9XG4gICAgZXhlY3V0ZUVhY2god29ya2VyTWVzc2FnZUxpc3RlbmVycywgY2FsbEZ1bik7XG4gIH1cblxuICBmdW5jdGlvbiBwb3N0TWVzc2FnZShtc2csIHRyYW5zZmVyKSB7XG4gICAgaWYgKHR5cGVvZiBtc2cgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Bvc3RNZXNzYWdlKCkgcmVxdWlyZXMgYW4gYXJndW1lbnQnKTtcbiAgICB9XG4gICAgaWYgKHRlcm1pbmF0ZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCFzY3JpcHQpIHtcbiAgICAgIHBvc3RNZXNzYWdlTGlzdGVuZXJzLnB1c2goe21zZzogbXNnLCB0cmFuc2ZlcjogKHRyYW5zZmVyID8gdHJhbnNmZXIgOiB1bmRlZmluZWQpfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJ1blBvc3RNZXNzYWdlKG1zZywgdHJhbnNmZXIpO1xuICB9XG5cbiAgZnVuY3Rpb24gdGVybWluYXRlKCkge1xuICAgIHRlcm1pbmF0ZWQgPSB0cnVlO1xuICB9XG5cbiAgZnVuY3Rpb24gd29ya2VyUG9zdE1lc3NhZ2UobXNnKSB7XG4gICAgaWYgKHRlcm1pbmF0ZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZnVuY3Rpb24gY2FsbEZ1bihsaXN0ZW5lcikge1xuICAgICAgbGlzdGVuZXIoe1xuICAgICAgICBkYXRhOiBtc2dcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGFwaS5vbm1lc3NhZ2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNhbGxGdW4oYXBpLm9ubWVzc2FnZSk7XG4gICAgfVxuICAgIGV4ZWN1dGVFYWNoKG1lc3NhZ2VMaXN0ZW5lcnMsIGNhbGxGdW4pO1xuICB9XG5cbiAgZnVuY3Rpb24gd29ya2VyQWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBmdW4pIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgIGlmICh0eXBlID09PSAnbWVzc2FnZScpIHtcbiAgICAgIHdvcmtlck1lc3NhZ2VMaXN0ZW5lcnMucHVzaChmdW4pO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgICAgd29ya2VyRXJyb3JMaXN0ZW5lcnMucHVzaChmdW4pO1xuICAgIH1cbiAgfVxuXG4gIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICB4aHIub3BlbignR0VUJywgcGF0aCk7XG4gIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICBpZiAoeGhyLnN0YXR1cyA+PSAyMDAgJiYgeGhyLnN0YXR1cyA8IDQwMCkge1xuICAgICAgICBzY3JpcHQgPSB4aHIucmVzcG9uc2VUZXh0O1xuICAgICAgICB3b3JrZXJTZWxmID0ge1xuICAgICAgICAgIHBvc3RNZXNzYWdlOiB3b3JrZXJQb3N0TWVzc2FnZSxcbiAgICAgICAgICBhZGRFdmVudExpc3RlbmVyOiB3b3JrZXJBZGRFdmVudExpc3RlbmVyLFxuICAgICAgICAgIGNsb3NlOiB0ZXJtaW5hdGVcbiAgICAgICAgfTtcbiAgICAgICAgZG9FdmFsKHdvcmtlclNlbGYsIHNjcmlwdCk7XG4gICAgICAgIHZhciBjdXJyZW50TGlzdGVuZXJzID0gcG9zdE1lc3NhZ2VMaXN0ZW5lcnM7XG4gICAgICAgIHBvc3RNZXNzYWdlTGlzdGVuZXJzID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY3VycmVudExpc3RlbmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHJ1blBvc3RNZXNzYWdlKGN1cnJlbnRMaXN0ZW5lcnNbaV0ubXNnLCBjdXJyZW50TGlzdGVuZXJzW2ldLnRyYW5zZmVyKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcG9zdEVycm9yKG5ldyBFcnJvcignY2Fubm90IGZpbmQgc2NyaXB0ICcgKyBwYXRoKSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHhoci5zZW5kKCk7XG5cbiAgYXBpLnBvc3RNZXNzYWdlID0gcG9zdE1lc3NhZ2U7XG4gIGFwaS5hZGRFdmVudExpc3RlbmVyID0gYWRkRXZlbnRMaXN0ZW5lcjtcbiAgYXBpLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSByZW1vdmVFdmVudExpc3RlbmVyO1xuICBhcGkudGVybWluYXRlID0gdGVybWluYXRlO1xuXG4gIHJldHVybiBhcGk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUHNldWRvV29ya2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgUHNldWRvV29ya2VyID0gcmVxdWlyZSgnLi8nKTtcblxuaWYgKHR5cGVvZiBXb3JrZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gIGdsb2JhbC5Xb3JrZXIgPSBQc2V1ZG9Xb3JrZXI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUHNldWRvV29ya2VyOyIsIlxuLyoqXG4gKiBNb2R1bGUgRGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIGV4cHI7XG50cnkge1xuICBleHByID0gcmVxdWlyZSgncHJvcHMnKTtcbn0gY2F0Y2goZSkge1xuICBleHByID0gcmVxdWlyZSgnY29tcG9uZW50LXByb3BzJyk7XG59XG5cbi8qKlxuICogRXhwb3NlIGB0b0Z1bmN0aW9uKClgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gdG9GdW5jdGlvbjtcblxuLyoqXG4gKiBDb252ZXJ0IGBvYmpgIHRvIGEgYEZ1bmN0aW9uYC5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSBvYmpcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gdG9GdW5jdGlvbihvYmopIHtcbiAgc3dpdGNoICh7fS50b1N0cmluZy5jYWxsKG9iaikpIHtcbiAgICBjYXNlICdbb2JqZWN0IE9iamVjdF0nOlxuICAgICAgcmV0dXJuIG9iamVjdFRvRnVuY3Rpb24ob2JqKTtcbiAgICBjYXNlICdbb2JqZWN0IEZ1bmN0aW9uXSc6XG4gICAgICByZXR1cm4gb2JqO1xuICAgIGNhc2UgJ1tvYmplY3QgU3RyaW5nXSc6XG4gICAgICByZXR1cm4gc3RyaW5nVG9GdW5jdGlvbihvYmopO1xuICAgIGNhc2UgJ1tvYmplY3QgUmVnRXhwXSc6XG4gICAgICByZXR1cm4gcmVnZXhwVG9GdW5jdGlvbihvYmopO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZGVmYXVsdFRvRnVuY3Rpb24ob2JqKTtcbiAgfVxufVxuXG4vKipcbiAqIERlZmF1bHQgdG8gc3RyaWN0IGVxdWFsaXR5LlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBkZWZhdWx0VG9GdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iail7XG4gICAgcmV0dXJuIHZhbCA9PT0gb2JqO1xuICB9O1xufVxuXG4vKipcbiAqIENvbnZlcnQgYHJlYCB0byBhIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7UmVnRXhwfSByZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiByZWdleHBUb0Z1bmN0aW9uKHJlKSB7XG4gIHJldHVybiBmdW5jdGlvbihvYmope1xuICAgIHJldHVybiByZS50ZXN0KG9iaik7XG4gIH07XG59XG5cbi8qKlxuICogQ29udmVydCBwcm9wZXJ0eSBgc3RyYCB0byBhIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc3RyaW5nVG9GdW5jdGlvbihzdHIpIHtcbiAgLy8gaW1tZWRpYXRlIHN1Y2ggYXMgXCI+IDIwXCJcbiAgaWYgKC9eICpcXFcrLy50ZXN0KHN0cikpIHJldHVybiBuZXcgRnVuY3Rpb24oJ18nLCAncmV0dXJuIF8gJyArIHN0cik7XG5cbiAgLy8gcHJvcGVydGllcyBzdWNoIGFzIFwibmFtZS5maXJzdFwiIG9yIFwiYWdlID4gMThcIiBvciBcImFnZSA+IDE4ICYmIGFnZSA8IDM2XCJcbiAgcmV0dXJuIG5ldyBGdW5jdGlvbignXycsICdyZXR1cm4gJyArIGdldChzdHIpKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGBvYmplY3RgIHRvIGEgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdFxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBvYmplY3RUb0Z1bmN0aW9uKG9iaikge1xuICB2YXIgbWF0Y2ggPSB7fTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIG1hdGNoW2tleV0gPSB0eXBlb2Ygb2JqW2tleV0gPT09ICdzdHJpbmcnXG4gICAgICA/IGRlZmF1bHRUb0Z1bmN0aW9uKG9ialtrZXldKVxuICAgICAgOiB0b0Z1bmN0aW9uKG9ialtrZXldKTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24odmFsKXtcbiAgICBpZiAodHlwZW9mIHZhbCAhPT0gJ29iamVjdCcpIHJldHVybiBmYWxzZTtcbiAgICBmb3IgKHZhciBrZXkgaW4gbWF0Y2gpIHtcbiAgICAgIGlmICghKGtleSBpbiB2YWwpKSByZXR1cm4gZmFsc2U7XG4gICAgICBpZiAoIW1hdGNoW2tleV0odmFsW2tleV0pKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xufVxuXG4vKipcbiAqIEJ1aWx0IHRoZSBnZXR0ZXIgZnVuY3Rpb24uIFN1cHBvcnRzIGdldHRlciBzdHlsZSBmdW5jdGlvbnNcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBnZXQoc3RyKSB7XG4gIHZhciBwcm9wcyA9IGV4cHIoc3RyKTtcbiAgaWYgKCFwcm9wcy5sZW5ndGgpIHJldHVybiAnXy4nICsgc3RyO1xuXG4gIHZhciB2YWwsIGksIHByb3A7XG4gIGZvciAoaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgIHByb3AgPSBwcm9wc1tpXTtcbiAgICB2YWwgPSAnXy4nICsgcHJvcDtcbiAgICB2YWwgPSBcIignZnVuY3Rpb24nID09IHR5cGVvZiBcIiArIHZhbCArIFwiID8gXCIgKyB2YWwgKyBcIigpIDogXCIgKyB2YWwgKyBcIilcIjtcblxuICAgIC8vIG1pbWljIG5lZ2F0aXZlIGxvb2tiZWhpbmQgdG8gYXZvaWQgcHJvYmxlbXMgd2l0aCBuZXN0ZWQgcHJvcGVydGllc1xuICAgIHN0ciA9IHN0cmlwTmVzdGVkKHByb3AsIHN0ciwgdmFsKTtcbiAgfVxuXG4gIHJldHVybiBzdHI7XG59XG5cbi8qKlxuICogTWltaWMgbmVnYXRpdmUgbG9va2JlaGluZCB0byBhdm9pZCBwcm9ibGVtcyB3aXRoIG5lc3RlZCBwcm9wZXJ0aWVzLlxuICpcbiAqIFNlZTogaHR0cDovL2Jsb2cuc3RldmVubGV2aXRoYW4uY29tL2FyY2hpdmVzL21pbWljLWxvb2tiZWhpbmQtamF2YXNjcmlwdFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzdHJpcE5lc3RlZCAocHJvcCwgc3RyLCB2YWwpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKG5ldyBSZWdFeHAoJyhcXFxcLik/JyArIHByb3AsICdnJyksIGZ1bmN0aW9uKCQwLCAkMSkge1xuICAgIHJldHVybiAkMSA/ICQwIDogdmFsO1xuICB9KTtcbn1cbiIsImltcG9ydCBJbk1lbW9yeUFkYXB0ZXIgZnJvbSAnLi9pbm1lbW9yeSc7XG5pbXBvcnQgTG9jYWxTdG9yYWdlQWRhcHRlciBmcm9tICcuL2xvY2Fsc3RvcmFnZSc7XG5cbmV4cG9ydCB7IEluTWVtb3J5QWRhcHRlciwgTG9jYWxTdG9yYWdlQWRhcHRlciB9O1xuIiwiLy8gQGZsb3dcbmltcG9ydCB0eXBlIHsgSVN0b3JhZ2UgfSBmcm9tICcuLi9pbnRlcmZhY2VzL3N0b3JhZ2UnO1xuaW1wb3J0IHR5cGUgeyBJQ29uZmlnIH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9jb25maWcnO1xuaW1wb3J0IHR5cGUgeyBJVGFzayB9IGZyb20gJy4uL2ludGVyZmFjZXMvdGFzayc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEluTWVtb3J5QWRhcHRlciBpbXBsZW1lbnRzIElTdG9yYWdlIHtcbiAgY29uZmlnOiBJQ29uZmlnO1xuXG4gIHByZWZpeDogc3RyaW5nO1xuXG4gIHN0b3JlOiB7IFtwcm9wOiBzdHJpbmddOiBhbnkgfSA9IHt9O1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogSUNvbmZpZykge1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgIHRoaXMucHJlZml4ID0gdGhpcy5jb25maWcuZ2V0KCdwcmVmaXgnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlIGl0ZW0gZnJvbSBzdG9yZSBieSBrZXlcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7UHJvbWlzZTxJVGFzaz59IChhcnJheSlcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGdldChuYW1lOiBzdHJpbmcpOiBQcm9taXNlPElUYXNrW10+IHtcbiAgICBjb25zdCBjb2xsTmFtZSA9IHRoaXMuc3RvcmFnZU5hbWUobmFtZSk7XG4gICAgcmV0dXJuIFsuLi50aGlzLmdldENvbGxlY3Rpb24oY29sbE5hbWUpXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgaXRlbSB0byBzdG9yZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHZhbHVlXG4gICAqIEByZXR1cm4ge1Byb21pc2U8QW55Pn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIHNldChrZXk6IHN0cmluZywgdmFsdWU6IGFueVtdKTogUHJvbWlzZTxhbnk+IHtcbiAgICB0aGlzLnN0b3JlW3RoaXMuc3RvcmFnZU5hbWUoa2V5KV0gPSBbLi4udmFsdWVdO1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdGVtIGNoZWNrZXIgaW4gc3RvcmVcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7UHJvbWlzZTxCb29sZWFuPn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGhhcyhrZXk6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5zdG9yZSwgdGhpcy5zdG9yYWdlTmFtZShrZXkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgaXRlbVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtQcm9taXNlPEFueT59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBjbGVhcihrZXk6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gKGF3YWl0IHRoaXMuaGFzKGtleSkpID8gZGVsZXRlIHRoaXMuc3RvcmVbdGhpcy5zdG9yYWdlTmFtZShrZXkpXSA6IGZhbHNlO1xuICAgIHRoaXMuc3RvcmUgPSB7IC4uLnRoaXMuc3RvcmUgfTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXBvc2UgY29sbGVjdGlvbiBuYW1lIGJ5IHN1ZmZpeFxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHN1ZmZpeFxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBzdG9yYWdlTmFtZShzdWZmaXg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHN1ZmZpeC5zdGFydHNXaXRoKHRoaXMuZ2V0UHJlZml4KCkpID8gc3VmZml4IDogYCR7dGhpcy5nZXRQcmVmaXgoKX1fJHtzdWZmaXh9YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgcHJlZml4IG9mIGNoYW5uZWwgY29sbGVjdGlvblxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBnZXRQcmVmaXgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWcuZ2V0KCdwcmVmaXgnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgY29sbGVjdGlvblxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG4gIGdldENvbGxlY3Rpb24obmFtZTogc3RyaW5nKTogYW55IHtcbiAgICBjb25zdCBoYXMgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5zdG9yZSwgbmFtZSk7XG4gICAgaWYgKCFoYXMpIHRoaXMuc3RvcmVbbmFtZV0gPSBbXTtcbiAgICByZXR1cm4gdGhpcy5zdG9yZVtuYW1lXTtcbiAgfVxufVxuIiwiLy8gQGZsb3dcbmltcG9ydCB0eXBlIHsgSVN0b3JhZ2UgfSBmcm9tICcuLi9pbnRlcmZhY2VzL3N0b3JhZ2UnO1xuaW1wb3J0IHR5cGUgeyBJQ29uZmlnIH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9jb25maWcnO1xuaW1wb3J0IHR5cGUgeyBJVGFzayB9IGZyb20gJy4uL2ludGVyZmFjZXMvdGFzayc7XG5cbi8qIGdsb2JhbCBsb2NhbFN0b3JhZ2UgKi9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9jYWxTdG9yYWdlQWRhcHRlciBpbXBsZW1lbnRzIElTdG9yYWdlIHtcbiAgY29uZmlnOiBJQ29uZmlnO1xuXG4gIHByZWZpeDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogSUNvbmZpZykge1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgIHRoaXMucHJlZml4ID0gdGhpcy5jb25maWcuZ2V0KCdwcmVmaXgnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlIGl0ZW0gZnJvbSBsb2NhbCBzdG9yYWdlIGJ5IGtleVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtQcm9taXNlPElUYXNrPn0gKGFycmF5KVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgZ2V0KG5hbWU6IHN0cmluZyk6IFByb21pc2U8SVRhc2tbXT4ge1xuICAgIGNvbnN0IHJlc3VsdDogYW55ID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5zdG9yYWdlTmFtZShuYW1lKSk7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UocmVzdWx0KSB8fCBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgaXRlbSB0byBsb2NhbCBzdG9yYWdlXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSAge1N0cmluZ30gdmFsdWVcbiAgICogQHJldHVybiB7UHJvbWlzZTxBbnk+fVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogYW55W10pOiBQcm9taXNlPGFueT4ge1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuc3RvcmFnZU5hbWUoa2V5KSwgSlNPTi5zdHJpbmdpZnkodmFsdWUpKTtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogSXRlbSBjaGVja2VyIGluIGxvY2FsIHN0b3JhZ2VcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7UHJvbWlzZTxCb29sZWFuPn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGhhcyhrZXk6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobG9jYWxTdG9yYWdlLCB0aGlzLnN0b3JhZ2VOYW1lKGtleSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBpdGVtXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge1Byb21pc2U8QW55Pn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGNsZWFyKGtleTogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCByZXN1bHQgPSAoYXdhaXQgdGhpcy5oYXMoa2V5KSkgPyBkZWxldGUgbG9jYWxTdG9yYWdlW3RoaXMuc3RvcmFnZU5hbWUoa2V5KV0gOiBmYWxzZTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXBvc2UgY29sbGVjdGlvbiBuYW1lIGJ5IHN1ZmZpeFxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHN1ZmZpeFxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBzdG9yYWdlTmFtZShzdWZmaXg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHN1ZmZpeC5zdGFydHNXaXRoKHRoaXMuZ2V0UHJlZml4KCkpID8gc3VmZml4IDogYCR7dGhpcy5nZXRQcmVmaXgoKX1fJHtzdWZmaXh9YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgcHJlZml4IG9mIGNoYW5uZWwgY29sbGVjdGlvblxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBnZXRQcmVmaXgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWcuZ2V0KCdwcmVmaXgnKTtcbiAgfVxufVxuIiwiLy8gQGZsb3dcbi8qIGVzbGludCBpbXBvcnQvbm8tY3ljbGU6IFwib2ZmXCIgKi9cbmltcG9ydCB0eXBlIHsgSVRhc2sgfSBmcm9tICcuL2ludGVyZmFjZXMvdGFzayc7XG5pbXBvcnQgdHlwZSB7IElDb25maWcgfSBmcm9tICcuL2ludGVyZmFjZXMvY29uZmlnJztcbmltcG9ydCBFdmVudCBmcm9tICcuL2V2ZW50JztcbmltcG9ydCBTdG9yYWdlQ2Fwc3VsZSBmcm9tICcuL3N0b3JhZ2UtY2Fwc3VsZSc7XG5pbXBvcnQgUXVldWUgZnJvbSAnLi9xdWV1ZSc7XG5pbXBvcnQgeyB1dGlsQ2xlYXJCeVRhZyB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtcbiAgZGIsXG4gIGNhbk11bHRpcGxlLFxuICBzYXZlVGFzayxcbiAgbG9nUHJveHksXG4gIGNyZWF0ZVRpbWVvdXQsXG4gIHN0b3BRdWV1ZSxcbiAgZ2V0VGFza3NXaXRob3V0RnJlZXplZCxcbn0gZnJvbSAnLi9oZWxwZXJzJztcbmltcG9ydCB7XG4gIHRhc2tBZGRlZExvZyxcbiAgbmV4dFRhc2tMb2csXG4gIHF1ZXVlU3RvcHBpbmdMb2csXG4gIHF1ZXVlU3RhcnRMb2csXG4gIGV2ZW50Q3JlYXRlZExvZyxcbn0gZnJvbSAnLi9jb25zb2xlJztcblxuLyogZXNsaW50IG5vLXVuZGVyc2NvcmUtZGFuZ2xlOiBbMiwgeyBcImFsbG93XCI6IFtcIl9pZFwiXSB9XSAqL1xuXG5jb25zdCBjaGFubmVsTmFtZSA9IFN5bWJvbCgnY2hhbm5lbC1uYW1lJyk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENoYW5uZWwge1xuICBzdG9wcGVkOiBib29sZWFuID0gdHJ1ZTtcblxuICBydW5uaW5nOiBib29sZWFuID0gZmFsc2U7XG5cbiAgdGltZW91dDogbnVtYmVyO1xuXG4gIHN0b3JhZ2U6IFN0b3JhZ2VDYXBzdWxlO1xuXG4gIGNvbmZpZzogSUNvbmZpZztcblxuICBldmVudDogRXZlbnQgPSBuZXcgRXZlbnQoKTtcblxuICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIGNvbmZpZzogSUNvbmZpZykge1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuXG4gICAgLy8gc2F2ZSBjaGFubmVsIG5hbWUgdG8gdGhpcyBjbGFzcyB3aXRoIHN5bWJvbGljIGtleVxuICAgICh0aGlzOiBPYmplY3QpW2NoYW5uZWxOYW1lXSA9IG5hbWU7XG5cbiAgICAvLyBpZiBjdXN0b20gc3RvcmFnZSBkcml2ZXIgZXhpc3RzLCBzZXR1cCBpdFxuICAgIGNvbnN0IHsgZHJpdmVycyB9OiBhbnkgPSBRdWV1ZTtcbiAgICBjb25zdCBzdG9yYWdlID0gbmV3IFN0b3JhZ2VDYXBzdWxlKGNvbmZpZywgZHJpdmVycy5zdG9yYWdlKTtcbiAgICB0aGlzLnN0b3JhZ2UgPSBzdG9yYWdlLmNoYW5uZWwobmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGNoYW5uZWwgbmFtZVxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9IGNoYW5uZWwgbmFtZVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgbmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiAodGhpczogT2JqZWN0KVtjaGFubmVsTmFtZV07XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIG5ldyBqb2IgdG8gY2hhbm5lbFxuICAgKlxuICAgKiBAcGFyYW0gIHtPYmplY3R9IHRhc2tcbiAgICogQHJldHVybiB7U3RyaW5nfEJvb2xlYW59IGpvYlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgYWRkKHRhc2s6IElUYXNrKTogUHJvbWlzZTxzdHJpbmcgfCBib29sZWFuPiB7XG4gICAgaWYgKCEoYXdhaXQgY2FuTXVsdGlwbGUuY2FsbCh0aGlzLCB0YXNrKSkpIHJldHVybiBmYWxzZTtcblxuICAgIGNvbnN0IGlkID0gYXdhaXQgc2F2ZVRhc2suY2FsbCh0aGlzLCB0YXNrKTtcblxuICAgIGlmIChpZCAmJiB0aGlzLnJ1bm5pbmcgPT09IHRydWUpIHtcbiAgICAgIGF3YWl0IHRoaXMuc3RhcnQoKTtcbiAgICB9XG5cbiAgICAvLyBwYXNzIGFjdGl2aXR5IHRvIHRoZSBsb2cgc2VydmljZS5cbiAgICBsb2dQcm94eS5jYWxsKHRoaXMsIHRhc2tBZGRlZExvZywgdGFzayk7XG5cbiAgICByZXR1cm4gaWQ7XG4gIH1cblxuICAvKipcbiAgICogUHJvY2VzcyBuZXh0IGpvYlxuICAgKlxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgbmV4dCgpOiBQcm9taXNlPHZvaWQgfCBib29sZWFuPiB7XG4gICAgaWYgKHRoaXMuc3RvcHBlZCkge1xuICAgICAgcmV0dXJuIHN0b3BRdWV1ZS5jYWxsKHRoaXMpO1xuICAgIH1cblxuICAgIC8vIEdlbmVyYXRlIGEgbG9nIG1lc3NhZ2VcbiAgICBsb2dQcm94eS5jYWxsKHRoaXMsIG5leHRUYXNrTG9nLCAnbmV4dCcpO1xuXG4gICAgLy8gc3RhcnQgcXVldWUgYWdhaW5cbiAgICBhd2FpdCB0aGlzLnN0YXJ0KCk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCBxdWV1ZSBsaXN0ZW5lclxuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufSBqb2JcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIHN0YXJ0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuc3RvcHBlZCA9IGZhbHNlO1xuICAgIHRoaXMucnVubmluZyA9IHRydWU7XG5cbiAgICBsb2dQcm94eS5jYWxsKHRoaXMsIHF1ZXVlU3RhcnRMb2csICdzdGFydCcpO1xuXG4gICAgLy8gQ3JlYXRlIGEgdGltZW91dCBmb3Igc3RhcnQgdGhlIHF1ZXVlXG4gICAgYXdhaXQgY3JlYXRlVGltZW91dC5jYWxsKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgcXVldWUgbGlzdGVuZXIgYWZ0ZXIgZW5kIG9mIGN1cnJlbnQgdGFza1xuICAgKlxuICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgc3RvcCgpOiB2b2lkIHtcbiAgICBsb2dQcm94eS5jYWxsKHRoaXMsIHF1ZXVlU3RvcHBpbmdMb2csICdzdG9wJyk7XG4gICAgdGhpcy5zdG9wcGVkID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wIHF1ZXVlIGxpc3RlbmVyIGluY2x1ZGluZyBjdXJyZW50IHRhc2tcbiAgICpcbiAgICogQHJldHVybiB7Vm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGZvcmNlU3RvcCgpOiB2b2lkIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIHN0b3BRdWV1ZS5jYWxsKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSBjaGFubmVsIHdvcmtpbmdcbiAgICpcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHN0YXR1cygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5ydW5uaW5nO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgdGhlcmUgaXMgYW55IHRhc2tcbiAgICpcbiAgICogQHJldHVybiB7Qm9vZWxhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGlzRW1wdHkoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmNvdW50KCkpIDwgMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGFzayBjb3VudFxuICAgKlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBjb3VudCgpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIHJldHVybiAoYXdhaXQgZ2V0VGFza3NXaXRob3V0RnJlZXplZC5jYWxsKHRoaXMpKS5sZW5ndGg7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRhc2sgY291bnQgYnkgdGFnXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gdGFnXG4gICAqIEByZXR1cm4ge0FycmF5PElUYXNrPn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGNvdW50QnlUYWcodGFnOiBzdHJpbmcpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIHJldHVybiAoYXdhaXQgZ2V0VGFza3NXaXRob3V0RnJlZXplZC5jYWxsKHRoaXMpKS5maWx0ZXIoKHQpID0+IHQudGFnID09PSB0YWcpLmxlbmd0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYWxsIHRhc2tzIGZyb20gY2hhbm5lbFxuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgY2xlYXIoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKCF0aGlzLm5hbWUoKSkgcmV0dXJuIGZhbHNlO1xuICAgIGF3YWl0IHRoaXMuc3RvcmFnZS5jbGVhcih0aGlzLm5hbWUoKSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFsbCB0YXNrcyBmcm9tIGNoYW5uZWwgYnkgdGFnXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gdGFnXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBjbGVhckJ5VGFnKHRhZzogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IGRiLmNhbGwoc2VsZikuYWxsKCk7XG4gICAgY29uc3QgcmVtb3ZlcyA9IGRhdGEuZmlsdGVyKHV0aWxDbGVhckJ5VGFnLmJpbmQodGFnKSkubWFwKGFzeW5jICh0KSA9PiB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBkYi5jYWxsKHNlbGYpLmRlbGV0ZSh0Ll9pZCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0pO1xuICAgIGF3YWl0IFByb21pc2UuYWxsKHJlbW92ZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGEgdGFzayB3aGV0aGVyIGV4aXN0cyBieSBqb2IgaWRcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSB0YWdcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGhhcyhpZDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCBnZXRUYXNrc1dpdGhvdXRGcmVlemVkLmNhbGwodGhpcykpLmZpbmRJbmRleCgodCkgPT4gdC5faWQgPT09IGlkKSA+IC0xO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGEgdGFzayB3aGV0aGVyIGV4aXN0cyBieSB0YWdcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSB0YWdcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGhhc0J5VGFnKHRhZzogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCBnZXRUYXNrc1dpdGhvdXRGcmVlemVkLmNhbGwodGhpcykpLmZpbmRJbmRleCgodCkgPT4gdC50YWcgPT09IHRhZykgPiAtMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgYWN0aW9uIGV2ZW50c1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gY2JcbiAgICogQHJldHVybiB7Vm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIG9uKGtleTogc3RyaW5nLCBjYjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICB0aGlzLmV2ZW50Lm9uKC4uLltrZXksIGNiXSk7XG4gICAgbG9nUHJveHkuY2FsbCh0aGlzLCBldmVudENyZWF0ZWRMb2csIGtleSwgdGhpcy5uYW1lKCkpO1xuICB9XG59XG4iLCIvKiBAZmxvdyAqL1xuaW1wb3J0IHR5cGUgeyBJQ29uZmlnIH0gZnJvbSAnLi9pbnRlcmZhY2VzL2NvbmZpZyc7XG5pbXBvcnQgY29uZmlnRGF0YSBmcm9tICcuL2VudW0vY29uZmlnLmRhdGEnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25maWcge1xuICBjb25maWc6IGFueSA9IHt9XG5cbiAgdGltZW91dDogbnVtYmVyO1xuXG4gIHN0b3JhZ2U6IHN0cmluZztcblxuICBwcmluY2lwbGU6IHN0cmluZztcblxuICBwcmVmaXg6IHN0cmluZztcblxuICBsaW1pdDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogYW55ID0ge30pIHtcbiAgICB0aGlzLm1lcmdlKGNvbmZpZ0RhdGEpO1xuICAgIHRoaXMubWVyZ2UoY29uZmlnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgY29uZmlnIHRvIGdsb2JhbCBjb25maWcgcmVmZXJlbmNlXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0gIHtBbnl9IHZhbHVlXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBzZXQobmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgdGhpcy5jb25maWdbbmFtZV0gPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBjb25maWdcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm4ge2FueX1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGdldChuYW1lOiBzdHJpbmcpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZ1tuYW1lXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBjb25maWcgcHJvcGVydHlcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm4ge2FueX1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGhhcyhuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuY29uZmlnLCBuYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXJnZSB0d28gY29uZmlnIG9iamVjdFxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIG1lcmdlKGNvbmZpZzogeyBbc3RyaW5nXTogYW55IH0pOiB2b2lkIHtcbiAgICBPYmplY3Qua2V5cyhjb25maWcpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgdGhpcy5jb25maWdba2V5XSA9IGNvbmZpZ1trZXldO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIGNvbmZpZ1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHJlbW92ZShuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZGVsZXRlIHRoaXMuY29uZmlnW25hbWVdO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgY29uZmlnXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHtJQ29uZmlnW119XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhbGwoKTogSUNvbmZpZyB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnO1xuICB9XG59XG4iLCIvLyBAZmxvd1xuaW1wb3J0IG9iaiBmcm9tICdvYmplY3QtcGF0aCc7XG5pbXBvcnQgbG9nRXZlbnRzIGZyb20gJy4vZW51bS9sb2cuZXZlbnRzJztcblxuLyogZXNsaW50IG5vLWNvbnNvbGU6IFtcImVycm9yXCIsIHsgYWxsb3c6IFtcImxvZ1wiLCBcImdyb3VwQ29sbGFwc2VkXCIsIFwiZ3JvdXBFbmRcIl0gfV0gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGxvZyguLi5hcmdzOiBhbnkpIHtcbiAgY29uc29sZS5sb2coLi4uYXJncyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0YXNrQWRkZWRMb2coW3Rhc2tdOiBhbnlbXSkge1xuICBsb2coXG4gICAgYCVjJHtTdHJpbmcuZnJvbUNoYXJDb2RlKDQzKX0gKCR7dGFzay5oYW5kbGVyfSkgLT4gJHtvYmouZ2V0KGxvZ0V2ZW50cywgJ3F1ZXVlLmNyZWF0ZWQnKX1gLFxuICAgICdjb2xvcjogZ3JlZW47Zm9udC13ZWlnaHQ6IGJvbGQ7JyxcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHF1ZXVlU3RhcnRMb2coW3R5cGVdOiBhbnlbXSkge1xuICBsb2coXG4gICAgYCVjJHtTdHJpbmcuZnJvbUNoYXJDb2RlKDgyMTEpfSAoJHt0eXBlfSkgLT4gJHtvYmouZ2V0KGxvZ0V2ZW50cywgJ3F1ZXVlLnN0YXJ0aW5nJyl9YCxcbiAgICAnY29sb3I6ICMzZmE1ZjM7Zm9udC13ZWlnaHQ6IGJvbGQ7JyxcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5leHRUYXNrTG9nKFt0eXBlXTogYW55W10pIHtcbiAgbG9nKFxuICAgIGAlYyR7U3RyaW5nLmZyb21DaGFyQ29kZSgxODcpfSAoJHt0eXBlfSkgLT4gJHtvYmouZ2V0KGxvZ0V2ZW50cywgJ3F1ZXVlLm5leHQnKX1gLFxuICAgICdjb2xvcjogIzNmYTVmMztmb250LXdlaWdodDogYm9sZDsnLFxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcXVldWVTdG9wcGluZ0xvZyhbdHlwZV06IGFueVtdKSB7XG4gIGxvZyhcbiAgICBgJWMke1N0cmluZy5mcm9tQ2hhckNvZGUoODIyNil9ICgke3R5cGV9KSAtPiAke29iai5nZXQobG9nRXZlbnRzLCAncXVldWUuc3RvcHBpbmcnKX1gLFxuICAgICdjb2xvcjogI2ZmN2Y5NDtmb250LXdlaWdodDogYm9sZDsnLFxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcXVldWVTdG9wcGVkTG9nKFt0eXBlXTogYW55W10pIHtcbiAgbG9nKFxuICAgIGAlYyR7U3RyaW5nLmZyb21DaGFyQ29kZSg4MjI2KX0gKCR7dHlwZX0pIC0+ICR7b2JqLmdldChsb2dFdmVudHMsICdxdWV1ZS5zdG9wcGVkJyl9YCxcbiAgICAnY29sb3I6ICNmZjdmOTQ7Zm9udC13ZWlnaHQ6IGJvbGQ7JyxcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHF1ZXVlRW1wdHlMb2coW3R5cGVdOiBhbnlbXSkge1xuICBsb2coYCVjJHt0eXBlfSAke29iai5nZXQobG9nRXZlbnRzLCAncXVldWUuZW1wdHknKX1gLCAnY29sb3I6ICNmZjdmOTQ7Zm9udC13ZWlnaHQ6IGJvbGQ7Jyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBldmVudENyZWF0ZWRMb2coW2tleSwgbmFtZV06IHN0cmluZ1tdKSB7XG4gIGxvZyhcbiAgICBgJWMoJHtuYW1lfSkgLT4gJHtrZXl9ICR7b2JqLmdldChsb2dFdmVudHMsICdldmVudC5jcmVhdGVkJyl9YCxcbiAgICAnY29sb3I6ICM2NmNlZTM7Zm9udC13ZWlnaHQ6IGJvbGQ7JyxcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV2ZW50RmlyZWRMb2coW2tleSwgbmFtZV06IGFueVtdKSB7XG4gIGxvZyhgJWMoJHtrZXl9KSAtPiAke29iai5nZXQobG9nRXZlbnRzLCBgZXZlbnQuJHtuYW1lfWApfWAsICdjb2xvcjogI2EwZGMzYztmb250LXdlaWdodDogYm9sZDsnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vdEZvdW5kTG9nKFtuYW1lXTogYW55W10pIHtcbiAgbG9nKFxuICAgIGAlYyR7U3RyaW5nLmZyb21DaGFyQ29kZSgyMTUpfSAoJHtuYW1lfSkgLT4gJHtvYmouZ2V0KGxvZ0V2ZW50cywgJ3F1ZXVlLm5vdC1mb3VuZCcpfWAsXG4gICAgJ2NvbG9yOiAjYjkyZTJlO2ZvbnQtd2VpZ2h0OiBib2xkOycsXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3b3JrZXJSdW5uaW5Mb2coW1xuICB3b3JrZXI6IEZ1bmN0aW9uLFxuICB3b3JrZXJJbnN0YW5jZSxcbiAgdGFzayxcbiAgY2hhbm5lbDogc3RyaW5nLFxuICBkZXBzOiB7IFtzdHJpbmddOiBhbnlbXSB9LFxuXTogYW55W10pIHtcbiAgY29uc29sZS5ncm91cENvbGxhcHNlZChgJHt3b3JrZXIubmFtZSB8fCB0YXNrLmhhbmRsZXJ9IC0gJHt0YXNrLmxhYmVsfWApO1xuICBsb2coYCVjY2hhbm5lbDogJHtjaGFubmVsfWAsICdjb2xvcjogYmx1ZTsnKTtcbiAgbG9nKGAlY2xhYmVsOiAke3Rhc2subGFiZWwgfHwgJyd9YCwgJ2NvbG9yOiBibHVlOycpO1xuICBsb2coYCVjaGFuZGxlcjogJHt0YXNrLmhhbmRsZXJ9YCwgJ2NvbG9yOiBibHVlOycpO1xuICBsb2coYCVjcHJpb3JpdHk6ICR7dGFzay5wcmlvcml0eX1gLCAnY29sb3I6IGJsdWU7Jyk7XG4gIGxvZyhgJWN1bmlxdWU6ICR7dGFzay51bmlxdWUgfHwgJ2ZhbHNlJ31gLCAnY29sb3I6IGJsdWU7Jyk7XG4gIGxvZyhgJWNyZXRyeTogJHt3b3JrZXJJbnN0YW5jZS5yZXRyeSB8fCAnMSd9YCwgJ2NvbG9yOiBibHVlOycpO1xuICBsb2coYCVjdHJpZWQ6ICR7dGFzay50cmllZCA/IHRhc2sudHJpZWQgKyAxIDogJzEnfWAsICdjb2xvcjogYmx1ZTsnKTtcbiAgbG9nKGAlY3RhZzogJHt0YXNrLnRhZyB8fCAnJ31gLCAnY29sb3I6IGJsdWU7Jyk7XG4gIGxvZygnJWNhcmdzOicsICdjb2xvcjogYmx1ZTsnKTtcbiAgbG9nKHRhc2suYXJncyB8fCAnJyk7XG4gIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoJ2RlcGVuZGVuY2llcycpO1xuICBsb2coLi4uKGRlcHNbd29ya2VyLm5hbWVdIHx8IFtdKSk7XG4gIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdvcmtlckRvbmVMb2coW3Jlc3VsdCwgdGFzaywgd29ya2VySW5zdGFuY2VdOiBhbnlbXSkge1xuICBpZiAocmVzdWx0ID09PSB0cnVlKSB7XG4gICAgbG9nKGAlYyR7U3RyaW5nLmZyb21DaGFyQ29kZSgxMDAwMyl9IFRhc2sgY29tcGxldGVkIWAsICdjb2xvcjogZ3JlZW47Jyk7XG4gIH0gZWxzZSBpZiAoIXJlc3VsdCAmJiB0YXNrLnRyaWVkIDwgd29ya2VySW5zdGFuY2UucmV0cnkpIHtcbiAgICBsb2coJyVjVGFzayB3aWxsIGJlIHJldHJpZWQhJywgJ2NvbG9yOiAjZDg0MTBjOycpO1xuICB9IGVsc2Uge1xuICAgIGxvZyhgJWMke1N0cmluZy5mcm9tQ2hhckNvZGUoMTAwMDUpfSBUYXNrIGZhaWxlZCBhbmQgZnJlZXplZCFgLCAnY29sb3I6ICNlZjYzNjM7Jyk7XG4gIH1cbiAgY29uc29sZS5ncm91cEVuZCgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd29ya2VyRmFpbGVkTG9nKCkge1xuICBsb2coYCVjJHtTdHJpbmcuZnJvbUNoYXJDb2RlKDEwMDA1KX0gVGFzayBmYWlsZWQhYCwgJ2NvbG9yOiByZWQ7Jyk7XG4gIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbn1cbiIsIi8qIEBmbG93ICovXG5pbXBvcnQgdHlwZSB7IElDb250YWluZXIgfSBmcm9tICcuL2ludGVyZmFjZXMvY29udGFpbmVyJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29udGFpbmVyIGltcGxlbWVudHMgSUNvbnRhaW5lciB7XG4gIHN0b3JlOiB7IFtwcm9wZXJ0eTogc3RyaW5nXTogYW55IH0gPSB7fTtcblxuICAvLyBmcmVlemUoaWQ6IHN0cmluZyk6IHZvaWQge1xuICAvLyAgIGNvbnNvbGUubG9nKHRoaXMsIGlkKTtcbiAgLy8gfVxuXG4gIC8vIGFkZCh2YWx1ZTogYW55KTogdm9pZCB7XG4gIC8vICAgY29uc29sZS5sb2codGhpcywgdmFsdWUpO1xuICAvLyB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGl0ZW0gaW4gY29udGFpbmVyXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gaWRcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGhhcyhpZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLnN0b3JlLCBpZCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGl0ZW0gZnJvbSBjb250YWluZXJcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBpZFxuICAgKiBAcmV0dXJuIHtBbnl9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBnZXQoaWQ6IHN0cmluZyk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmVbaWRdO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgaXRlbXMgZnJvbSBjb250YWluZXJcbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYWxsKCk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmU7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGl0ZW0gdG8gY29udGFpbmVyXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gaWRcbiAgICogQHBhcmFtICB7QW55fSB2YWx1ZVxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYmluZChpZDogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgdGhpcy5zdG9yZVtpZF0gPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXJnZSBjb250aW5lcnNcbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSBkYXRhXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBtZXJnZShkYXRhOiB7IFtwcm9wZXJ0eTogc3RyaW5nXTogYW55IH0gPSB7fSk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmUgPSB7IC4uLnRoaXMuc3RvcmUsIC4uLmRhdGEgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgaXRlbSBmcm9tIGNvbnRhaW5lclxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGlkXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICByZW1vdmUoaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy5oYXMoaWQpKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIGRlbGV0ZSB0aGlzLnN0b3JlW2lkXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYWxsIGl0ZW1zIGZyb20gY29udGFpbmVyXG4gICAqXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICByZW1vdmVBbGwoKTogdm9pZCB7XG4gICAgdGhpcy5zdG9yZSA9IHt9O1xuICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCB7XG4gIGRlZmF1bHRTdG9yYWdlOiAnbG9jYWxzdG9yYWdlJyxcbiAgcHJlZml4OiAnc3Ffam9icycsXG4gIHRpbWVvdXQ6IDEwMDAsXG4gIGxpbWl0OiAtMSxcbiAgcHJpbmNpcGxlOiAnZmlmbycsXG4gIGRlYnVnOiB0cnVlLFxufTtcbiIsImV4cG9ydCBkZWZhdWx0IHtcbiAgcXVldWU6IHtcbiAgICBjcmVhdGVkOiAnTmV3IHRhc2sgY3JlYXRlZC4nLFxuICAgIG5leHQ6ICdOZXh0IHRhc2sgcHJvY2Vzc2luZy4nLFxuICAgIHN0YXJ0aW5nOiAnUXVldWUgbGlzdGVuZXIgc3RhcnRpbmcuJyxcbiAgICBzdG9wcGluZzogJ1F1ZXVlIGxpc3RlbmVyIHN0b3BwaW5nLicsXG4gICAgc3RvcHBlZDogJ1F1ZXVlIGxpc3RlbmVyIHN0b3BwZWQuJyxcbiAgICBlbXB0eTogJ2NoYW5uZWwgaXMgZW1wdHkuLi4nLFxuICAgICdub3QtZm91bmQnOiAnd29ya2VyIG5vdCBmb3VuZCcsXG4gICAgb2ZmbGluZTogJ0Rpc2Nvbm5lY3RlZCcsXG4gICAgb25saW5lOiAnQ29ubmVjdGVkJyxcbiAgfSxcbiAgZXZlbnQ6IHtcbiAgICBjcmVhdGVkOiAnZXZlbnQgY3JlYXRlZCcsXG4gICAgZmlyZWQ6ICdFdmVudCBmaXJlZC4nLFxuICAgICd3aWxkY2FyZC1maXJlZCc6ICdXaWxkY2FyZCBldmVudCBmaXJlZC4nLFxuICB9LFxufTtcbiIsIi8qIGVzbGludCBjbGFzcy1tZXRob2RzLXVzZS10aGlzOiBbXCJlcnJvclwiLCB7IFwiZXhjZXB0TWV0aG9kc1wiOiBbXCJnZXROYW1lXCIsIFwiZ2V0VHlwZVwiXSB9XSAqL1xuLyogZXNsaW50LWVudiBlczYgKi9cbi8vIEBmbG93XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFdmVudCB7XG4gIHN0b3JlOiB7IFtwcm9wOiBzdHJpbmddOiBhbnkgfSA9IHt9O1xuXG4gIHZlcmlmaWVyUGF0dGVybjogUmVnRXhwID0gL15bYS16MC05LV9dKzpiZWZvcmUkfGFmdGVyJHxyZXRyeSR8XFwqJC87XG5cbiAgd2lsZGNhcmRzOiBzdHJpbmdbXSA9IFsnKicsICdlcnJvcicsICdjb21wbGV0ZWQnXTtcblxuICBlbXB0eUZ1bmM6IEZ1bmN0aW9uID0gKCkgPT4ge307XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5zdG9yZS5iZWZvcmUgPSB7fTtcbiAgICB0aGlzLnN0b3JlLmFmdGVyID0ge307XG4gICAgdGhpcy5zdG9yZS5yZXRyeSA9IHt9O1xuICAgIHRoaXMuc3RvcmUud2lsZGNhcmQgPSB7fTtcbiAgICB0aGlzLnN0b3JlLmVycm9yID0gdGhpcy5lbXB0eUZ1bmM7XG4gICAgdGhpcy5zdG9yZS5jb21wbGV0ZWQgPSB0aGlzLmVtcHR5RnVuYztcbiAgICB0aGlzLnN0b3JlWycqJ10gPSB0aGlzLmVtcHR5RnVuYztcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgZXZlbnRcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHBhcmFtICB7RnVuY3Rpb259IGNiXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBvbihrZXk6IHN0cmluZywgY2I6IEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgaWYgKHR5cGVvZiBjYiAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgbmV3IEVycm9yKCdFdmVudCBzaG91bGQgYmUgYW4gZnVuY3Rpb24nKTtcbiAgICBpZiAodGhpcy5pc1ZhbGlkKGtleSkpIHRoaXMuYWRkKGtleSwgY2IpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biBldmVudCB2aWEgaXQncyBrZXlcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHBhcmFtICB7QW55fSBhcmdzXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBlbWl0KGtleTogc3RyaW5nLCBhcmdzOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAodGhpcy53aWxkY2FyZHMuaW5kZXhPZihrZXkpID4gLTEpIHtcbiAgICAgIHRoaXMud2lsZGNhcmQoa2V5LCAuLi5ba2V5LCBhcmdzXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHR5cGU6IHN0cmluZyA9IHRoaXMuZ2V0VHlwZShrZXkpO1xuICAgICAgY29uc3QgbmFtZTogc3RyaW5nID0gdGhpcy5nZXROYW1lKGtleSk7XG5cbiAgICAgIGlmICh0aGlzLnN0b3JlW3R5cGVdKSB7XG4gICAgICAgIGNvbnN0IGNiOiBGdW5jdGlvbiA9IHRoaXMuc3RvcmVbdHlwZV1bbmFtZV0gfHwgdGhpcy5lbXB0eUZ1bmM7XG4gICAgICAgIGNiLmNhbGwobnVsbCwgYXJncyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy53aWxkY2FyZCgnKicsIGtleSwgYXJncyk7XG4gIH1cblxuICAvKipcbiAgICogUnVuIHdpbGRjYXJkIGV2ZW50c1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGFjdGlvbktleVxuICAgKiBAcGFyYW0gIHtBbnl9IGFyZ3NcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHdpbGRjYXJkKGtleTogc3RyaW5nLCBhY3Rpb25LZXk6IHN0cmluZywgYXJnczogYW55KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc3RvcmUud2lsZGNhcmRba2V5XSkge1xuICAgICAgdGhpcy5zdG9yZS53aWxkY2FyZFtrZXldLmNhbGwobnVsbCwgYWN0aW9uS2V5LCBhcmdzKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkIGV2ZW50IHRvIHN0b3JlXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjYlxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYWRkKGtleTogc3RyaW5nLCBjYjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICBpZiAodGhpcy53aWxkY2FyZHMuaW5kZXhPZihrZXkpID4gLTEpIHtcbiAgICAgIHRoaXMuc3RvcmUud2lsZGNhcmRba2V5XSA9IGNiO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB0eXBlOiBzdHJpbmcgPSB0aGlzLmdldFR5cGUoa2V5KTtcbiAgICAgIGNvbnN0IG5hbWU6IHN0cmluZyA9IHRoaXMuZ2V0TmFtZShrZXkpO1xuICAgICAgdGhpcy5zdG9yZVt0eXBlXVtuYW1lXSA9IGNiO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBldmVudCBpbiBzdG9yZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgaGFzKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGtleXM6IHN0cmluZ1tdID0ga2V5LnNwbGl0KCc6Jyk7XG4gICAgICByZXR1cm4ga2V5cy5sZW5ndGggPiAxID8gISF0aGlzLnN0b3JlW2tleXNbMV1dW2tleXNbMF1dIDogISF0aGlzLnN0b3JlLndpbGRjYXJkW2tleXNbMF1dO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IGV2ZW50IG5hbWUgYnkgcGFyc2Uga2V5XG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGdldE5hbWUoa2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IHBhcnNlZCA9IGtleS5tYXRjaCgvKC4qKTouKi8pO1xuICAgIHJldHVybiBwYXJzZWQgPyBwYXJzZWRbMV0gOiAnJztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZXZlbnQgdHlwZSBieSBwYXJzZSBrZXlcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgZ2V0VHlwZShrZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgcGFyc2VkID0ga2V5Lm1hdGNoKC9eW2EtejAtOS1fXSs6KC4qKS8pO1xuICAgIHJldHVybiBwYXJzZWQgPyBwYXJzZWRbMV0gOiAnJztcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja2VyIG9mIGV2ZW50IGtleXNcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGlzVmFsaWQoa2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy52ZXJpZmllclBhdHRlcm4udGVzdChrZXkpIHx8IHRoaXMud2lsZGNhcmRzLmluZGV4T2Yoa2V5KSA+IC0xO1xuICB9XG59XG4iLCIvKiBAZmxvdyAqL1xuLyogZXNsaW50IGltcG9ydC9uby1jeWNsZTogXCJvZmZcIiAqL1xuaW1wb3J0IHR5cGUgeyBJVGFzayB9IGZyb20gJy4vaW50ZXJmYWNlcy90YXNrJztcbmltcG9ydCB0eXBlIHsgSVdvcmtlciB9IGZyb20gJy4vaW50ZXJmYWNlcy93b3JrZXInO1xuaW1wb3J0IFF1ZXVlIGZyb20gJy4vcXVldWUnO1xuaW1wb3J0IENoYW5uZWwgZnJvbSAnLi9jaGFubmVsJztcbmltcG9ydCBTdG9yYWdlQ2Fwc3VsZSBmcm9tICcuL3N0b3JhZ2UtY2Fwc3VsZSc7XG5pbXBvcnQgeyBleGNsdWRlU3BlY2lmaWNUYXNrcywgaGFzTWV0aG9kLCBpc0Z1bmN0aW9uIH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge1xuICBldmVudEZpcmVkTG9nLFxuICBxdWV1ZVN0b3BwZWRMb2csXG4gIHdvcmtlclJ1bm5pbkxvZyxcbiAgcXVldWVFbXB0eUxvZyxcbiAgbm90Rm91bmRMb2csXG4gIHdvcmtlckRvbmVMb2csXG4gIHdvcmtlckZhaWxlZExvZyxcbn0gZnJvbSAnLi9jb25zb2xlJztcblxuLyogZ2xvYmFsIFdvcmtlciAqL1xuLyogZXNsaW50IG5vLXVuZGVyc2NvcmUtZGFuZ2xlOiBbMiwgeyBcImFsbG93XCI6IFtcIl9pZFwiXSB9XSAqL1xuLyogZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOiBcImVycm9yXCIgKi9cbi8qIGVzbGludCB1c2UtaXNuYW46IFwiZXJyb3JcIiAqL1xuXG4vKipcbiAqIFRhc2sgcHJpb3JpdHkgY29udHJvbGxlciBoZWxwZXJcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcmV0dXJuIHtJVGFza31cbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrUHJpb3JpdHkodGFzazogSVRhc2spOiBJVGFzayB7XG4gIHRhc2sucHJpb3JpdHkgPSB0YXNrLnByaW9yaXR5IHx8IDA7XG5cbiAgaWYgKHR5cGVvZiB0YXNrLnByaW9yaXR5ICE9PSAnbnVtYmVyJykgdGFzay5wcmlvcml0eSA9IDA7XG5cbiAgcmV0dXJuIHRhc2s7XG59XG5cbi8qKlxuICogU2hvcnRlbnMgZnVuY3Rpb24gdGhlIGRiIGJlbG9uZ3N0byBjdXJyZW50IGNoYW5uZWxcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcmV0dXJuIHtTdG9yYWdlQ2Fwc3VsZX1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRiKCk6IFN0b3JhZ2VDYXBzdWxlIHtcbiAgcmV0dXJuICh0aGlzOiBhbnkpLnN0b3JhZ2UuY2hhbm5lbCgodGhpczogYW55KS5uYW1lKCkpO1xufVxuXG4vKipcbiAqIEdldCB1bmZyZWV6ZWQgdGFza3MgYnkgdGhlIGZpbHRlciBmdW5jdGlvblxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEByZXR1cm4ge0lUYXNrfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VGFza3NXaXRob3V0RnJlZXplZCgpOiBQcm9taXNlPElUYXNrW10+IHtcbiAgcmV0dXJuIChhd2FpdCBkYi5jYWxsKHRoaXMpLmFsbCgpKS5maWx0ZXIoZXhjbHVkZVNwZWNpZmljVGFza3MuYmluZChbJ2ZyZWV6ZWQnXSkpO1xufVxuXG4vKipcbiAqIExvZyBwcm94eSBoZWxwZXJcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcmV0dXJuIHt2b2lkfVxuICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICogQHBhcmFtIHtzdHJpbmd9IGRhdGFcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gY29uZFxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9nUHJveHkod3JhcHBlckZ1bmM6IEZ1bmN0aW9uLCAuLi5hcmdzOiBhbnkpOiB2b2lkIHtcbiAgaWYgKCh0aGlzOiBhbnkpLmNvbmZpZy5nZXQoJ2RlYnVnJykgJiYgdHlwZW9mIHdyYXBwZXJGdW5jID09PSAnZnVuY3Rpb24nKSB7XG4gICAgd3JhcHBlckZ1bmMoYXJncyk7XG4gIH1cbn1cblxuLyoqXG4gKiBOZXcgdGFzayBzYXZlIGhlbHBlclxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqIEByZXR1cm4ge3N0cmluZ3xib29sZWFufVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVRhc2sodGFzazogSVRhc2spOiBQcm9taXNlPHN0cmluZyB8IGJvb2xlYW4+IHtcbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZGIuY2FsbCh0aGlzKS5zYXZlKGNoZWNrUHJpb3JpdHkodGFzaykpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFRhc2sgcmVtb3ZlIGhlbHBlclxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbW92ZVRhc2soaWQ6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICBjb25zdCByZXN1bHQgPSBhd2FpdCBkYi5jYWxsKHRoaXMpLmRlbGV0ZShpZCk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRXZlbnRzIGRpc3BhdGNoZXIgaGVscGVyXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAqIEByZXR1cm4ge3ZvaWR9XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXNwYXRjaEV2ZW50cyh0YXNrOiBJVGFzaywgdHlwZTogc3RyaW5nKTogYm9vbGVhbiB8IHZvaWQge1xuICBpZiAoISgndGFnJyBpbiB0YXNrKSkgcmV0dXJuIGZhbHNlO1xuXG4gIGNvbnN0IGV2ZW50cyA9IFtbYCR7dGFzay50YWd9OiR7dHlwZX1gLCAnZmlyZWQnXSwgW2Ake3Rhc2sudGFnfToqYCwgJ3dpbGRjYXJkLWZpcmVkJ11dO1xuXG4gIGV2ZW50cy5mb3JFYWNoKChlKSA9PiB7XG4gICAgdGhpcy5ldmVudC5lbWl0KGVbMF0sIHRhc2spO1xuICAgIGxvZ1Byb3h5LmNhbGwoKHRoaXM6IGFueSksIGV2ZW50RmlyZWRMb2csIC4uLmUpO1xuICB9KTtcblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBRdWV1ZSBzdG9wcGVyIGhlbHBlclxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEByZXR1cm4ge3ZvaWR9XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdG9wUXVldWUoKTogdm9pZCB7XG4gIHRoaXMuc3RvcCgpO1xuXG4gIHRoaXMucnVubmluZyA9IGZhbHNlO1xuXG4gIGNsZWFyVGltZW91dCh0aGlzLmN1cnJlbnRUaW1lb3V0KTtcblxuICBsb2dQcm94eS5jYWxsKHRoaXMsIHF1ZXVlU3RvcHBlZExvZywgJ3N0b3AnKTtcbn1cblxuLyoqXG4gKiBGYWlsZWQgam9iIGhhbmRsZXJcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcmV0dXJuIHtJVGFza30gam9iXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZhaWxlZEpvYkhhbmRsZXIodGFzazogSVRhc2spOiBQcm9taXNlPEZ1bmN0aW9uPiB7XG4gIHJldHVybiBhc3luYyBmdW5jdGlvbiBjaGlsZEZhaWxlZEhhbmRsZXIoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmVtb3ZlVGFzay5jYWxsKHRoaXMsIHRhc2suX2lkKTtcblxuICAgIHRoaXMuZXZlbnQuZW1pdCgnZXJyb3InLCB0YXNrKTtcblxuICAgIGxvZ1Byb3h5LmNhbGwodGhpcywgd29ya2VyRmFpbGVkTG9nKTtcblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgYXdhaXQgdGhpcy5uZXh0KCk7XG4gIH07XG59XG5cbi8qKlxuICogSGVscGVyIG9mIHRoZSBsb2NrIHRhc2sgb2YgdGhlIGN1cnJlbnQgam9iXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvY2tUYXNrKHRhc2s6IElUYXNrKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRiLmNhbGwodGhpcykudXBkYXRlKHRhc2suX2lkLCB7IGxvY2tlZDogdHJ1ZSB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBDbGFzcyBldmVudCBsdWFuY2hlciBoZWxwZXJcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtJV29ya2VyfSB3b3JrZXJcbiAqIEBwYXJhbSB7YW55fSBhcmdzXG4gKiBAcmV0dXJuIHtib29sZWFufHZvaWR9XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaXJlSm9iSW5saW5lRXZlbnQobmFtZTogc3RyaW5nLCB3b3JrZXI6IElXb3JrZXIsIGFyZ3M6IGFueSk6IGJvb2xlYW4ge1xuICBpZiAoaGFzTWV0aG9kKHdvcmtlciwgbmFtZSkgJiYgaXNGdW5jdGlvbih3b3JrZXJbbmFtZV0pKSB7XG4gICAgd29ya2VyW25hbWVdLmNhbGwod29ya2VyLCBhcmdzKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogUHJvY2VzcyBoYW5kbGVyIG9mIHN1Y2NlZWRlZCBqb2JcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcmV0dXJuIHt2b2lkfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3VjY2Vzc1Byb2Nlc3ModGFzazogSVRhc2spOiB2b2lkIHtcbiAgcmVtb3ZlVGFzay5jYWxsKHRoaXMsIHRhc2suX2lkKTtcbn1cblxuLyoqXG4gKiBVcGRhdGUgdGFzaydzIHJldHJ5IHZhbHVlXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHBhcmFtIHtJVGFza30gdGFza1xuICogQHBhcmFtIHtJV29ya2VyfSB3b3JrZXJcbiAqIEByZXR1cm4ge0lUYXNrfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlUmV0cnkodGFzazogSVRhc2ssIHdvcmtlcjogSVdvcmtlcik6IElUYXNrIHtcbiAgaWYgKCEoJ3JldHJ5JyBpbiB3b3JrZXIpKSB3b3JrZXIucmV0cnkgPSAxO1xuXG4gIGlmICghKCd0cmllZCcgaW4gdGFzaykpIHtcbiAgICB0YXNrLnRyaWVkID0gMDtcbiAgICB0YXNrLnJldHJ5ID0gd29ya2VyLnJldHJ5O1xuICB9XG5cbiAgdGFzay50cmllZCArPSAxO1xuXG4gIGlmICh0YXNrLnRyaWVkID49IHdvcmtlci5yZXRyeSkge1xuICAgIHRhc2suZnJlZXplZCA9IHRydWU7XG4gIH1cblxuICByZXR1cm4gdGFzaztcbn1cblxuLyoqXG4gKiBQcm9jZXNzIGhhbmRsZXIgb2YgcmV0cmllZCBqb2JcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcGFyYW0ge0lXb3JrZXJ9IHdvcmtlclxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJldHJ5UHJvY2Vzcyh0YXNrOiBJVGFzaywgd29ya2VyOiBJV29ya2VyKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIC8vIGRpc3BhY3RoIGN1c3RvbSByZXRyeSBldmVudFxuICBkaXNwYXRjaEV2ZW50cy5jYWxsKHRoaXMsIHRhc2ssICdyZXRyeScpO1xuXG4gIC8vIHVwZGF0ZSByZXRyeSB2YWx1ZVxuICBjb25zdCB1cGRhdGVUYXNrOiBJVGFzayA9IHVwZGF0ZVJldHJ5LmNhbGwodGhpcywgdGFzaywgd29ya2VyKTtcblxuICAvLyBkZWxldGUgbG9jayBwcm9wZXJ0eSBmb3IgbmV4dCBwcm9jZXNzXG4gIHVwZGF0ZVRhc2subG9ja2VkID0gZmFsc2U7XG5cbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZGIuY2FsbCh0aGlzKS51cGRhdGUodGFzay5faWQsIHVwZGF0ZVRhc2spO1xuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogU3VjY2VlZCBqb2IgaGFuZGxlclxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqIEBwYXJhbSB7SVdvcmtlcn0gd29ya2VyXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN1Y2Nlc3NKb2JIYW5kbGVyKHRhc2s6IElUYXNrLCB3b3JrZXI6IElXb3JrZXIpOiBQcm9taXNlPEZ1bmN0aW9uPiB7XG4gIGNvbnN0IHNlbGY6IENoYW5uZWwgPSB0aGlzO1xuICByZXR1cm4gYXN5bmMgZnVuY3Rpb24gY2hpbGRTdWNjZXNzSm9iSGFuZGxlcihyZXN1bHQ6IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBkaXNwYXRjaCBqb2IgcHJvY2VzcyBhZnRlciBydW5zIGEgdGFzayBidXQgb25seSBub24gZXJyb3Igam9ic1xuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIC8vIGdvIGFoZWFkIHRvIHN1Y2Nlc3MgcHJvY2Vzc1xuICAgICAgc3VjY2Vzc1Byb2Nlc3MuY2FsbChzZWxmLCB0YXNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZ28gYWhlYWQgdG8gcmV0cnkgcHJvY2Vzc1xuICAgICAgYXdhaXQgcmV0cnlQcm9jZXNzLmNhbGwoc2VsZiwgdGFzaywgd29ya2VyKTtcbiAgICB9XG5cbiAgICAvLyBmaXJlIGpvYiBhZnRlciBldmVudFxuICAgIGZpcmVKb2JJbmxpbmVFdmVudC5jYWxsKHNlbGYsICdhZnRlcicsIHdvcmtlciwgdGFzay5hcmdzKTtcblxuICAgIC8vIGRpc3BhY3RoIGN1c3RvbSBhZnRlciBldmVudFxuICAgIGRpc3BhdGNoRXZlbnRzLmNhbGwoc2VsZiwgdGFzaywgJ2FmdGVyJyk7XG5cbiAgICAvLyBzaG93IGNvbnNvbGVcbiAgICBsb2dQcm94eS5jYWxsKHNlbGYsIHdvcmtlckRvbmVMb2csIHJlc3VsdCwgdGFzaywgd29ya2VyKTtcblxuICAgIC8vIHRyeSBuZXh0IHF1ZXVlIGpvYlxuICAgIGF3YWl0IHNlbGYubmV4dCgpO1xuICB9O1xufVxuXG4vKipcbiAqIEpvYiBoYW5kbGVyIGhlbHBlclxuICogQ29udGV4dDogQ2hhbm5lbFxuICpcbiAqIEBwYXJhbSB7SVRhc2t9IHRhc2tcbiAqIEBwYXJhbSB7SUpvYn0gd29ya2VyXG4gKiBAcGFyYW0ge0lXb3JrZXJ9IHdvcmtlckluc3RhbmNlXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovIGZ1bmN0aW9uIGxvb3BIYW5kbGVyKFxuICB0YXNrOiBJVGFzayxcbiAgd29ya2VyOiBGdW5jdGlvbiB8IE9iamVjdCxcbiAgd29ya2VySW5zdGFuY2U6IGFueSxcbik6IEZ1bmN0aW9uIHtcbiAgcmV0dXJuIGFzeW5jIGZ1bmN0aW9uIGNoaWxkTG9vcEhhbmRsZXIoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IHdvcmtlclByb21pc2U6IFByb21pc2U8Ym9vbGVhbj47XG4gICAgY29uc3Qgc2VsZjogQ2hhbm5lbCA9IHRoaXM7XG5cbiAgICAvLyBsb2NrIHRoZSBjdXJyZW50IHRhc2sgZm9yIHByZXZlbnQgcmFjZSBjb25kaXRpb25cbiAgICBhd2FpdCBsb2NrVGFzay5jYWxsKHNlbGYsIHRhc2spO1xuXG4gICAgLy8gZmlyZSBqb2IgYmVmb3JlIGV2ZW50XG4gICAgZmlyZUpvYklubGluZUV2ZW50LmNhbGwodGhpcywgJ2JlZm9yZScsIHdvcmtlckluc3RhbmNlLCB0YXNrLmFyZ3MpO1xuXG4gICAgLy8gZGlzcGFjdGggY3VzdG9tIGJlZm9yZSBldmVudFxuICAgIGRpc3BhdGNoRXZlbnRzLmNhbGwodGhpcywgdGFzaywgJ2JlZm9yZScpO1xuXG4gICAgLy8gaWYgaGFzIGFueSBkZXBlbmRlbmN5IGluIGRlcGVuZGVuY2llcywgZ2V0IGl0XG4gICAgY29uc3QgZGVwcyA9IFF1ZXVlLndvcmtlckRlcHNbdGFzay5oYW5kbGVyXTtcblxuICAgIC8vIHByZXBhcmluZyB3b3JrZXIgZGVwZW5kZW5jaWVzXG4gICAgY29uc3QgZGVwZW5kZW5jaWVzID0gT2JqZWN0LnZhbHVlcyhkZXBzIHx8IHt9KTtcblxuICAgIC8vIHNob3cgY29uc29sZVxuICAgIGxvZ1Byb3h5LmNhbGwoXG4gICAgICB0aGlzLFxuICAgICAgd29ya2VyUnVubmluTG9nLFxuICAgICAgd29ya2VyLFxuICAgICAgd29ya2VySW5zdGFuY2UsXG4gICAgICB0YXNrLFxuICAgICAgc2VsZi5uYW1lKCksXG4gICAgICBRdWV1ZS53b3JrZXJEZXBzLFxuICAgICk7XG5cbiAgICAvLyBDaGVjayB3b3JrZXIgaW5zdGFuY2UgYW5kIHJvdXRlIHRoZSBwcm9jZXNzIHZpYSBpbnN0YW5jZVxuICAgIGlmICh3b3JrZXJJbnN0YW5jZSBpbnN0YW5jZW9mIFdvcmtlcikge1xuICAgICAgLy8gc3RhcnQgdGhlIG5hdGl2ZSB3b3JrZXIgYnkgcGFzc2luZyB0YXNrIHBhcmFtZXRlcnMgYW5kIGRlcGVuZGVuY2llcy5cbiAgICAgIC8vIE5vdGU6IE5hdGl2ZSB3b3JrZXIgcGFyYW1ldGVycyBjYW4gbm90IGJlIGNsYXNzIG9yIGZ1bmN0aW9uLlxuICAgICAgd29ya2VySW5zdGFuY2UucG9zdE1lc3NhZ2UoeyBhcmdzOiB0YXNrLmFyZ3MsIGRlcGVuZGVuY2llcyB9KTtcblxuICAgICAgLy8gV3JhcCB0aGUgd29ya2VyIHdpdGggcHJvbWlzZSBjbGFzcy5cbiAgICAgIHdvcmtlclByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAvLyBTZXQgZnVuY3Rpb24gdG8gd29ya2VyIG9ubWVzc2FnZSBldmVudCBmb3IgaGFuZGxlIHRoZSByZXBzb25zZSBvZiB3b3JrZXIuXG4gICAgICAgIHdvcmtlckluc3RhbmNlLm9ubWVzc2FnZSA9IChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgIHJlc29sdmUod29ya2VyLmhhbmRsZXIocmVzcG9uc2UpKTtcblxuICAgICAgICAgIC8vIFRlcm1pbmF0ZSBicm93c2VyIHdvcmtlci5cbiAgICAgICAgICB3b3JrZXJJbnN0YW5jZS50ZXJtaW5hdGUoKTtcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGlzIGlzIGN1c3RvbSB3b3JrZXIgY2xhc3MuXG4gICAgICAvLyBDYWxsIHRoZSBoYW5kbGUgZnVuY3Rpb24gaW4gd29ya2VyIGFuZCBnZXQgcHJvbWlzZSBpbnN0YW5jZS5cbiAgICAgIHdvcmtlclByb21pc2UgPSB3b3JrZXJJbnN0YW5jZS5oYW5kbGUuY2FsbCh3b3JrZXJJbnN0YW5jZSwgdGFzay5hcmdzLCAuLi5kZXBlbmRlbmNpZXMpO1xuICAgIH1cblxuICAgIHdvcmtlclByb21pc2VcbiAgICAgIC8vIEhhbmRsZSB3b3JrZXIgcmV0dXJuIHByb2Nlc3MuXG4gICAgICAudGhlbigoYXdhaXQgc3VjY2Vzc0pvYkhhbmRsZXIuY2FsbChzZWxmLCB0YXNrLCB3b3JrZXJJbnN0YW5jZSkpLmJpbmQoc2VsZikpXG4gICAgICAvLyBIYW5kbGUgZXJyb3JzIGluIHdvcmtlciB3aGlsZSBpdCB3YXMgcnVubmluZy5cbiAgICAgIC5jYXRjaCgoYXdhaXQgZmFpbGVkSm9iSGFuZGxlci5jYWxsKHNlbGYsIHRhc2spKS5iaW5kKHNlbGYpKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBUaW1lb3V0IGNyZWF0b3IgaGVscGVyXG4gKiBDb250ZXh0OiBDaGFubmVsXG4gKlxuICogQHJldHVybiB7bnVtYmVyfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlVGltZW91dCgpOiBQcm9taXNlPGFueT4ge1xuICAvLyBpZiBydW5uaW5nIGFueSBqb2IsIHN0b3AgaXRcbiAgLy8gdGhlIHB1cnBvc2UgaGVyZSBpcyB0byBwcmV2ZW50IGNvY3VycmVudCBvcGVyYXRpb24gaW4gc2FtZSBjaGFubmVsXG4gIGNsZWFyVGltZW91dCh0aGlzLmN1cnJlbnRUaW1lb3V0KTtcblxuICAvLyBHZXQgbmV4dCB0YXNrXG4gIGNvbnN0IHRhc2s6IElUYXNrID0gKGF3YWl0IGRiLmNhbGwodGhpcykuZmV0Y2goKSkuc2hpZnQoKTtcblxuICBpZiAodGFzayA9PT0gdW5kZWZpbmVkKSB7XG4gICAgbG9nUHJveHkuY2FsbCh0aGlzLCBxdWV1ZUVtcHR5TG9nLCB0aGlzLm5hbWUoKSk7XG4gICAgdGhpcy5ldmVudC5lbWl0KCdjb21wbGV0ZWQnLCB0YXNrKTtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIGlmICghUXVldWUud29ya2VyLmhhcyh0YXNrLmhhbmRsZXIpKSB7XG4gICAgbG9nUHJveHkuY2FsbCh0aGlzLCBub3RGb3VuZExvZywgdGFzay5oYW5kbGVyKTtcbiAgICBhd2FpdCAoYXdhaXQgZmFpbGVkSm9iSGFuZGxlci5jYWxsKHRoaXMsIHRhc2spKS5jYWxsKHRoaXMpO1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgLy8gR2V0IHdvcmtlciB3aXRoIGhhbmRsZXIgbmFtZVxuICBjb25zdCBKb2JXb3JrZXI6IEZ1bmN0aW9uIHwgT2JqZWN0ID0gUXVldWUud29ya2VyLmdldCh0YXNrLmhhbmRsZXIpO1xuXG4gIC8vIENyZWF0ZSBhIHdvcmtlciBpbnN0YW5jZVxuICBjb25zdCB3b3JrZXJJbnN0YW5jZTogYW55IHxcbiAgICBXb3JrZXIgPSB0eXBlb2YgSm9iV29ya2VyID09PSAnb2JqZWN0JyA/IG5ldyBXb3JrZXIoSm9iV29ya2VyLnVyaSkgOiBuZXcgSm9iV29ya2VyKCk7XG5cbiAgLy8gZ2V0IGFsd2F5cyBsYXN0IHVwZGF0ZWQgY29uZmlnIHZhbHVlXG4gIGNvbnN0IHRpbWVvdXQ6IG51bWJlciA9IHRoaXMuY29uZmlnLmdldCgndGltZW91dCcpO1xuXG4gIC8vIGNyZWF0ZSBhIGFycmF5IHdpdGggaGFuZGxlciBwYXJhbWV0ZXJzIGZvciBzaG9ydGVuIGxpbmUgbnVtYmVyc1xuICBjb25zdCBwYXJhbXMgPSBbdGFzaywgSm9iV29ya2VyLCB3b3JrZXJJbnN0YW5jZV07XG5cbiAgLy8gR2V0IGhhbmRsZXIgZnVuY3Rpb24gZm9yIGhhbmRsZSBvbiBjb21wbGV0ZWQgZXZlbnRcbiAgY29uc3QgaGFuZGxlcjogRnVuY3Rpb24gPSAoYXdhaXQgbG9vcEhhbmRsZXIuY2FsbCh0aGlzLCAuLi5wYXJhbXMpKS5iaW5kKHRoaXMpO1xuXG4gIC8vIGNyZWF0ZSBuZXcgdGltZW91dCBmb3IgcHJvY2VzcyBhIGpvYiBpbiBxdWV1ZVxuICAvLyBiaW5kaW5nIGxvb3BIYW5kbGVyIGZ1bmN0aW9uIHRvIHNldFRpbWVvdXRcbiAgLy8gdGhlbiByZXR1cm4gdGhlIHRpbWVvdXQgaW5zdGFuY2VcbiAgdGhpcy5jdXJyZW50VGltZW91dCA9IHNldFRpbWVvdXQoaGFuZGxlciwgdGltZW91dCk7XG5cbiAgcmV0dXJuIHRoaXMuY3VycmVudFRpbWVvdXQ7XG59XG5cbi8qKlxuICogU2V0IHRoZSBzdGF0dXMgdG8gZmFsc2Ugb2YgcXVldWVcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcmV0dXJuIHt2b2lkfVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RhdHVzT2ZmKCk6IHZvaWQge1xuICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciBhIHRhc2sgaXMgcmVwbGljYWJsZSBvciBub3RcbiAqIENvbnRleHQ6IENoYW5uZWxcbiAqXG4gKiBAcGFyYW0ge0lUYXNrfSB0YXNrXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2FuTXVsdGlwbGUodGFzazogSVRhc2spOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgaWYgKHR5cGVvZiB0YXNrICE9PSAnb2JqZWN0JyB8fCB0YXNrLnVuaXF1ZSAhPT0gdHJ1ZSkgcmV0dXJuIHRydWU7XG4gIHJldHVybiAoYXdhaXQgdGhpcy5oYXNCeVRhZyh0YXNrLnRhZykpID09PSBmYWxzZTtcbn1cbiIsImltcG9ydCAncHNldWRvLXdvcmtlci9wb2x5ZmlsbCc7XG5pbXBvcnQgUXVldWUgZnJvbSAnLi9xdWV1ZSc7XG5cbi8qIGdsb2JhbCB3aW5kb3c6dHJ1ZSAqL1xuXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgd2luZG93LlF1ZXVlID0gUXVldWU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IFF1ZXVlO1xuIiwiLyogQGZsb3cgKi9cbi8qIGVzbGludCBpbXBvcnQvbm8tY3ljbGU6IFwib2ZmXCIgKi9cbmltcG9ydCB0eXBlIHsgSUNvbmZpZyB9IGZyb20gJy4vaW50ZXJmYWNlcy9jb25maWcnO1xuaW1wb3J0IENoYW5uZWwgZnJvbSAnLi9jaGFubmVsJztcbmltcG9ydCBDb250YWluZXIgZnJvbSAnLi9jb250YWluZXInO1xuaW1wb3J0IENvbmZpZyBmcm9tICcuL2NvbmZpZyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFF1ZXVlIHtcbiAgc3RhdGljIEZJRk86IHN0cmluZyA9ICdmaWZvJztcblxuICBzdGF0aWMgTElGTzogc3RyaW5nID0gJ2xpZm8nO1xuXG4gIHN0YXRpYyBkcml2ZXJzOiBPYmplY3QgPSB7fTtcblxuICBzdGF0aWMgd29ya2VyRGVwczogT2JqZWN0ID0ge307XG5cbiAgc3RhdGljIGNvbnRhaW5lcjogQ29udGFpbmVyO1xuXG4gIHN0YXRpYyB3b3JrZXI6IENvbnRhaW5lcjtcblxuICBzdGF0aWMgd29ya2VyczogKHtbcHJvcDogc3RyaW5nXTogYW55IH0pID0+IHZvaWQ7XG5cbiAgc3RhdGljIGRlcHM6ICh7W3Byb3A6IHN0cmluZ106IGFueSB9KSA9PiB2b2lkO1xuXG4gIHN0YXRpYyB1c2U6ICh7W3Byb3A6IHN0cmluZ106IGFueSB9KSA9PiB2b2lkO1xuXG4gIGNvbmZpZzogQ29uZmlnO1xuXG4gIGNvbnRhaW5lcjogQ29udGFpbmVyO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogSUNvbmZpZykge1xuICAgIHRoaXMuY29uZmlnID0gbmV3IENvbmZpZyhjb25maWcpO1xuICAgIHRoaXMuY29udGFpbmVyID0gUXVldWUuY29udGFpbmVyO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBjaGFubmVsXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gdGFza1xuICAgKiBAcmV0dXJuIHtRdWV1ZX0gY2hhbm5lbFxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgY3JlYXRlKGNoYW5uZWw6IHN0cmluZyk6IFF1ZXVlIHtcbiAgICBpZiAoIXRoaXMuY29udGFpbmVyLmhhcyhjaGFubmVsKSkge1xuICAgICAgdGhpcy5jb250YWluZXIuYmluZChjaGFubmVsLCBuZXcgQ2hhbm5lbChjaGFubmVsLCB0aGlzLmNvbmZpZykpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jb250YWluZXIuZ2V0KGNoYW5uZWwpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjaGFubmVsIGluc3RhbmNlIGJ5IGNoYW5uZWwgbmFtZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVcbiAgICogQHJldHVybiB7UXVldWV9XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBjaGFubmVsKG5hbWU6IHN0cmluZyk6IFF1ZXVlIHtcbiAgICBpZiAoIXRoaXMuY29udGFpbmVyLmhhcyhuYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBcIiR7bmFtZX1cIiBjaGFubmVsIG5vdCBmb3VuZGApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jb250YWluZXIuZ2V0KG5hbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBjb25maWcgdGltZW91dCB2YWx1ZVxuICAgKlxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHZhbFxuICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgc2V0VGltZW91dCh2YWw6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuY29uZmlnLnNldCgndGltZW91dCcsIHZhbCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGNvbmZpZyBsaW1pdCB2YWx1ZVxuICAgKlxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHZhbFxuICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgc2V0TGltaXQodmFsOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLmNvbmZpZy5zZXQoJ2xpbWl0JywgdmFsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgY29uZmlnIHByZWZpeCB2YWx1ZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHZhbFxuICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgc2V0UHJlZml4KHZhbDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5jb25maWcuc2V0KCdwcmVmaXgnLCB2YWwpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBjb25maWcgcHJpY2lwbGUgdmFsdWVcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSB2YWxcbiAgICogQHJldHVybiB7Vm9pZH1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHNldFByaW5jaXBsZSh2YWw6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuY29uZmlnLnNldCgncHJpbmNpcGxlJywgdmFsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgY29uZmlnIGRlYnVnIHZhbHVlXG4gICAqXG4gICAqIEBwYXJhbSAge0Jvb2xlYW59IHZhbFxuICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgc2V0RGVidWcodmFsOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5jb25maWcuc2V0KCdkZWJ1ZycsIHZhbCk7XG4gIH1cblxuICBzZXRTdG9yYWdlKHZhbDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5jb25maWcuc2V0KCdzdG9yYWdlJywgdmFsKTtcbiAgfVxufVxuXG5RdWV1ZS53b3JrZXIgPSBuZXcgQ29udGFpbmVyKCk7XG5cblF1ZXVlLmNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoKTtcblxuLyoqXG4gKiBSZWdpc3RlciB3b3JrZXJcbiAqXG4gKiBAcGFyYW0gIHtBcnJheTxJSm9iPn0gam9ic1xuICogQHJldHVybiB7Vm9pZH1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5RdWV1ZS53b3JrZXJzID0gZnVuY3Rpb24gd29ya2Vycyh3b3JrZXJzT2JqOiB7IFtwcm9wOiBzdHJpbmddOiBhbnkgfSA9IHt9KTogdm9pZCB7XG4gIGlmICghKHdvcmtlcnNPYmogaW5zdGFuY2VvZiBPYmplY3QpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgcGFyYW1ldGVycyBzaG91bGQgYmUgb2JqZWN0LicpO1xuICB9XG5cbiAgUXVldWUud29ya2VyLm1lcmdlKHdvcmtlcnNPYmopO1xufTtcblxuLyoqXG4gKiBBZGRlZCB3b3JrZXJzIGRlcGVuZGVuY2llc1xuICpcbiAqIEBwYXJhbSAge09iamVjdH0gZHJpdmVyXG4gKiBAcmV0dXJuIHtWb2lkfVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblF1ZXVlLmRlcHMgPSBmdW5jdGlvbiBkZXBzKGRlcGVuZGVuY2llczogeyBbcHJvcDogc3RyaW5nXTogYW55IH0gPSB7fSk6IHZvaWQge1xuICBpZiAoIShkZXBlbmRlbmNpZXMgaW5zdGFuY2VvZiBPYmplY3QpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgcGFyYW1ldGVycyBzaG91bGQgYmUgb2JqZWN0LicpO1xuICB9XG4gIFF1ZXVlLndvcmtlckRlcHMgPSBkZXBlbmRlbmNpZXM7XG59O1xuXG4vKipcbiAqIFNldHVwIGEgY3VzdG9tIGRyaXZlclxuICpcbiAqIEBwYXJhbSAge09iamVjdH0gZHJpdmVyXG4gKiBAcmV0dXJuIHtWb2lkfVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblF1ZXVlLnVzZSA9IGZ1bmN0aW9uIHVzZShkcml2ZXI6IHsgW3Byb3A6IHN0cmluZ106IGFueSB9ID0ge30pOiB2b2lkIHtcbiAgT2JqZWN0LmtleXMoZHJpdmVyKS5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgUXVldWUuZHJpdmVyc1tuYW1lXSA9IGRyaXZlcltuYW1lXTtcbiAgfSk7XG59O1xuIiwiLyogQGZsb3cgKi9cbmltcG9ydCBncm91cEJ5IGZyb20gJ2dyb3VwLWJ5JztcbmltcG9ydCB0eXBlIHsgSUNvbmZpZyB9IGZyb20gJy4vaW50ZXJmYWNlcy9jb25maWcnO1xuaW1wb3J0IHR5cGUgeyBJU3RvcmFnZSB9IGZyb20gJy4vaW50ZXJmYWNlcy9zdG9yYWdlJztcbmltcG9ydCB0eXBlIHsgSVRhc2sgfSBmcm9tICcuL2ludGVyZmFjZXMvdGFzayc7XG5pbXBvcnQgeyBMb2NhbFN0b3JhZ2VBZGFwdGVyLCBJbk1lbW9yeUFkYXB0ZXIgfSBmcm9tICcuL2FkYXB0ZXJzJztcbmltcG9ydCB7IGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzLCBsaWZvLCBmaWZvIH0gZnJvbSAnLi91dGlscyc7XG5cbi8qIGVzbGludCBuby1jb25zb2xlOiBbXCJlcnJvclwiLCB7IGFsbG93OiBbXCJ3YXJuXCIsIFwiZXJyb3JcIl0gfV0gKi9cbi8qIGVzbGludCBuby11bmRlcnNjb3JlLWRhbmdsZTogWzIsIHsgXCJhbGxvd1wiOiBbXCJfaWRcIl0gfV0gKi9cbi8qIGVzbGludCBjbGFzcy1tZXRob2RzLXVzZS10aGlzOiBbXCJlcnJvclwiLCB7IFwiZXhjZXB0TWV0aG9kc1wiOiBbXCJnZW5lcmF0ZUlkXCJdIH1dICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0b3JhZ2VDYXBzdWxlIHtcbiAgY29uZmlnOiBJQ29uZmlnO1xuXG4gIHN0b3JhZ2U6IElTdG9yYWdlO1xuXG4gIHN0b3JhZ2VDaGFubmVsOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBJQ29uZmlnLCBzdG9yYWdlOiBJU3RvcmFnZSkge1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgIHRoaXMuc3RvcmFnZSA9IHRoaXMuaW5pdGlhbGl6ZShzdG9yYWdlKTtcbiAgfVxuXG4gIGluaXRpYWxpemUoU3RvcmFnZTogYW55KTogSVN0b3JhZ2Uge1xuICAgIC8qIGVzbGludCBuby1lbHNlLXJldHVybjogb2ZmICovXG4gICAgaWYgKHR5cGVvZiBTdG9yYWdlID09PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIFN0b3JhZ2U7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgU3RvcmFnZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIG5ldyBTdG9yYWdlKHRoaXMuY29uZmlnKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuY29uZmlnLmdldCgnc3RvcmFnZScpID09PSAnbG9jYWxzdG9yYWdlJykge1xuICAgICAgcmV0dXJuIG5ldyBMb2NhbFN0b3JhZ2VBZGFwdGVyKHRoaXMuY29uZmlnKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBJbk1lbW9yeUFkYXB0ZXIodGhpcy5jb25maWcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbGVjdCBhIGNoYW5uZWwgYnkgY2hhbm5lbCBuYW1lXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHtTdG9yYWdlQ2Fwc3VsZX1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGNoYW5uZWwobmFtZTogc3RyaW5nKTogU3RvcmFnZUNhcHN1bGUge1xuICAgIHRoaXMuc3RvcmFnZUNoYW5uZWwgPSBuYW1lO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoIHRhc2tzIGZyb20gc3RvcmFnZSB3aXRoIG9yZGVyZWRcbiAgICpcbiAgICogQHJldHVybiB7YW55W119XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBmZXRjaCgpOiBQcm9taXNlPGFueVtdPiB7XG4gICAgY29uc3QgYWxsID0gKGF3YWl0IHRoaXMuYWxsKCkpLmZpbHRlcihleGNsdWRlU3BlY2lmaWNUYXNrcyk7XG4gICAgY29uc3QgdGFza3MgPSBncm91cEJ5KGFsbCwgJ3ByaW9yaXR5Jyk7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRhc2tzKVxuICAgICAgLm1hcCgoa2V5KSA9PiBwYXJzZUludChrZXksIDEwKSlcbiAgICAgIC5zb3J0KChhLCBiKSA9PiBiIC0gYSlcbiAgICAgIC5yZWR1Y2UodGhpcy5yZWR1Y2VUYXNrcyh0YXNrcyksIFtdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTYXZlIHRhc2sgdG8gc3RvcmFnZVxuICAgKlxuICAgKiBAcGFyYW0gIHtJVGFza30gdGFza1xuICAgKiBAcmV0dXJuIHtTdHJpbmd8Qm9vbGVhbn1cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGFzeW5jIHNhdmUodGFzazogSVRhc2spOiBQcm9taXNlPHN0cmluZyB8IGJvb2xlYW4+IHtcbiAgICBpZiAodHlwZW9mIHRhc2sgIT09ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBnZXQgYWxsIHRhc2tzIGN1cnJlbnQgY2hhbm5lbCdzXG4gICAgY29uc3QgdGFza3M6IElUYXNrW10gPSBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0KHRoaXMuc3RvcmFnZUNoYW5uZWwpO1xuXG4gICAgLy8gQ2hlY2sgdGhlIGNoYW5uZWwgbGltaXQuXG4gICAgLy8gSWYgbGltaXQgaXMgZXhjZWVkZWQsIGRvZXMgbm90IGluc2VydCBuZXcgdGFza1xuICAgIGlmIChhd2FpdCB0aGlzLmlzRXhjZWVkZWQoKSkge1xuICAgICAgY29uc29sZS53YXJuKGBUYXNrIGxpbWl0IGV4Y2VlZGVkOiBUaGUgJyR7dGhpcy5zdG9yYWdlQ2hhbm5lbH0nIGNoYW5uZWwgbGltaXQgaXMgJHt0aGlzLmNvbmZpZy5nZXQoJ2xpbWl0Jyl9YCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gcHJlcGFyZSBhbGwgcHJvcGVydGllcyBiZWZvcmUgc2F2ZVxuICAgIC8vIGV4YW1wbGU6IGNyZWF0ZWRBdCBldGMuXG4gICAgY29uc3QgbmV3VGFzayA9IHRoaXMucHJlcGFyZVRhc2sodGFzayk7XG5cbiAgICAvLyBhZGQgdGFzayB0byBzdG9yYWdlXG4gICAgdGFza3MucHVzaChuZXdUYXNrKTtcblxuICAgIC8vIHNhdmUgdGFza3NcbiAgICBhd2FpdCB0aGlzLnN0b3JhZ2Uuc2V0KHRoaXMuc3RvcmFnZUNoYW5uZWwsIHRhc2tzKTtcblxuICAgIHJldHVybiBuZXdUYXNrLl9pZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgY2hhbm5lbCBzdG9yZS5cbiAgICpcbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKiAgIFRoZSB2YWx1ZS4gVGhpcyBhbm5vdGF0aW9uIGNhbiBiZSB1c2VkIGZvciB0eXBlIGhpbnRpbmcgcHVycG9zZXMuXG4gICAqL1xuICBhc3luYyB1cGRhdGUoaWQ6IHN0cmluZywgdXBkYXRlOiB7IFtwcm9wZXJ0eTogc3RyaW5nXTogYW55IH0pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBkYXRhOiBhbnlbXSA9IGF3YWl0IHRoaXMuYWxsKCk7XG4gICAgY29uc3QgaW5kZXg6IG51bWJlciA9IGRhdGEuZmluZEluZGV4KCh0KSA9PiB0Ll9pZCA9PT0gaWQpO1xuXG4gICAgLy8gaWYgaW5kZXggbm90IGZvdW5kLCByZXR1cm4gZmFsc2VcbiAgICBpZiAoaW5kZXggPCAwKSByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBtZXJnZSBleGlzdGluZyBvYmplY3Qgd2l0aCBnaXZlbiB1cGRhdGUgb2JqZWN0XG4gICAgZGF0YVtpbmRleF0gPSB7IC4uLmRhdGFbaW5kZXhdLCAuLi51cGRhdGUgfTtcblxuICAgIC8vIHNhdmUgdG8gdGhlIHN0b3JhZ2UgYXMgc3RyaW5nXG4gICAgYXdhaXQgdGhpcy5zdG9yYWdlLnNldCh0aGlzLnN0b3JhZ2VDaGFubmVsLCBkYXRhKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSB0YXNrIGZyb20gc3RvcmFnZVxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGlkXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBkZWxldGUoaWQ6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGRhdGE6IGFueVtdID0gYXdhaXQgdGhpcy5hbGwoKTtcbiAgICBjb25zdCBpbmRleDogbnVtYmVyID0gZGF0YS5maW5kSW5kZXgoKGQpID0+IGQuX2lkID09PSBpZCk7XG5cbiAgICBpZiAoaW5kZXggPCAwKSByZXR1cm4gZmFsc2U7XG5cbiAgICBkZWxldGUgZGF0YVtpbmRleF07XG5cbiAgICBhd2FpdCB0aGlzLnN0b3JhZ2Uuc2V0KHRoaXMuc3RvcmFnZUNoYW5uZWwsIGRhdGEuZmlsdGVyKChkKSA9PiBkKSk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIHRhc2tzXG4gICAqXG4gICAqIEByZXR1cm4ge0FueVtdfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgYWxsKCk6IFByb21pc2U8SVRhc2tbXT4ge1xuICAgIGNvbnN0IGl0ZW1zID0gYXdhaXQgdGhpcy5zdG9yYWdlLmdldCh0aGlzLnN0b3JhZ2VDaGFubmVsKTtcbiAgICByZXR1cm4gaXRlbXM7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgdW5pcXVlIGlkXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIGdlbmVyYXRlSWQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gKCgxICsgTWF0aC5yYW5kb20oKSkgKiAweDEwMDAwKS50b1N0cmluZygxNik7XG4gIH1cblxuICAvKipcbiAgICogQWRkIHNvbWUgbmVjZXNzYXJ5IHByb3BlcnRpZXNcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBpZFxuICAgKiBAcmV0dXJuIHtJVGFza31cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHByZXBhcmVUYXNrKHRhc2s6IElUYXNrKTogSVRhc2sge1xuICAgIC8qIGVzbGludCBuby1wYXJhbS1yZWFzc2lnbjogb2ZmICovXG4gICAgY29uc3QgbmV3VGFzazogYW55ID0ge307XG4gICAgT2JqZWN0LmtleXModGFzaykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICBuZXdUYXNrW2tleV0gPSB0YXNrW2tleV07XG4gICAgfSk7XG4gICAgbmV3VGFzay5jcmVhdGVkQXQgPSBEYXRlLm5vdygpO1xuICAgIG5ld1Rhc2suX2lkID0gdGhpcy5nZW5lcmF0ZUlkKCk7XG4gICAgcmV0dXJuIG5ld1Rhc2s7XG4gIH1cblxuICAvKipcbiAgICogQWRkIHNvbWUgbmVjZXNzYXJ5IHByb3BlcnRpZXNcbiAgICpcbiAgICogQHBhcmFtICB7SVRhc2tbXX0gdGFza3NcbiAgICogQHJldHVybiB7RnVuY3Rpb259XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICByZWR1Y2VUYXNrcyh0YXNrczogSVRhc2tbXSk6IEZ1bmN0aW9uIHtcbiAgICBjb25zdCByZWR1Y2VGdW5jID0gKHJlc3VsdDogSVRhc2tbXSwga2V5OiBhbnkpOiBJVGFza1tdID0+IHtcbiAgICAgIGlmICh0aGlzLmNvbmZpZy5nZXQoJ3ByaW5jaXBsZScpID09PSAnbGlmbycpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5jb25jYXQodGFza3Nba2V5XS5zb3J0KGxpZm8pKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQuY29uY2F0KHRhc2tzW2tleV0uc29ydChmaWZvKSk7XG4gICAgfTtcblxuICAgIHJldHVybiByZWR1Y2VGdW5jLmJpbmQodGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogVGFzayBsaW1pdCBjaGVja2VyXG4gICAqXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBhc3luYyBpc0V4Y2VlZGVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGxpbWl0OiBudW1iZXIgPSB0aGlzLmNvbmZpZy5nZXQoJ2xpbWl0Jyk7XG4gICAgY29uc3QgdGFza3M6IElUYXNrW10gPSAoYXdhaXQgdGhpcy5hbGwoKSkuZmlsdGVyKGV4Y2x1ZGVTcGVjaWZpY1Rhc2tzKTtcbiAgICByZXR1cm4gIShsaW1pdCA9PT0gLTEgfHwgbGltaXQgPiB0YXNrcy5sZW5ndGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFyIHRhc2tzIHdpdGggZ2l2ZW4gY2hhbm5lbCBuYW1lXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gY2hhbm5lbFxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgY2xlYXIoY2hhbm5lbDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5zdG9yYWdlLmNsZWFyKGNoYW5uZWwpO1xuICB9XG59XG4iLCIvKiBAZmxvdyAqL1xuaW1wb3J0IHR5cGUgeyBJVGFzayB9IGZyb20gJy4vaW50ZXJmYWNlcy90YXNrJztcblxuLyogZXNsaW50IGNvbW1hLWRhbmdsZTogW1wiZXJyb3JcIiwgXCJuZXZlclwiXSAqL1xuXG4vKipcbiAqIENoZWNrIHByb3BlcnR5IGluIG9iamVjdFxuICpcbiAqIEBwYXJhbSAge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXNQcm9wZXJ0eShmdW5jOiBGdW5jdGlvbiwgbmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZnVuYywgbmFtZSk7XG59XG5cbi8qKlxuICogQ2hlY2sgbWV0aG9kIGluIGluaXRpYXRlZCBjbGFzc1xuICpcbiAqIEBwYXJhbSAge0NsYXNzfSBpbnN0YW5jZVxuICogQHBhcmFtICB7U3RyaW5nfSBtZXRob2RcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc01ldGhvZChpbnN0YW5jZTogYW55LCBtZXRob2Q6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gaW5zdGFuY2UgaW5zdGFuY2VvZiBPYmplY3QgJiYgbWV0aG9kIGluIGluc3RhbmNlO1xufVxuXG4vKipcbiAqIENoZWNrIGZ1bmN0aW9uIHR5cGVcbiAqXG4gKiBAcGFyYW0gIHtGdW5jdGlvbn0gZnVuY1xuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gaXNGdW5jdGlvbihmdW5jOiBGdW5jdGlvbik6IGJvb2xlYW4ge1xuICByZXR1cm4gZnVuYyBpbnN0YW5jZW9mIEZ1bmN0aW9uO1xufVxuXG4vKipcbiAqIFJlbW92ZSBzb21lIHRhc2tzIGJ5IHNvbWUgY29uZGl0aW9uc1xuICpcbiAqIEBwYXJhbSAge0Z1bmN0aW9ufSBmdW5jXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleGNsdWRlU3BlY2lmaWNUYXNrcyh0YXNrOiBJVGFzayk6IGJvb2xlYW4ge1xuICBjb25zdCBjb25kaXRpb25zID0gQXJyYXkuaXNBcnJheSh0aGlzKSA/IHRoaXMgOiBbJ2ZyZWV6ZWQnLCAnbG9ja2VkJ107XG4gIGNvbnN0IHJlc3VsdHMgPSBbXTtcblxuICBjb25kaXRpb25zLmZvckVhY2goKGMpID0+IHtcbiAgICByZXN1bHRzLnB1c2goaGFzUHJvcGVydHkodGFzaywgYykgPT09IGZhbHNlIHx8IHRhc2tbY10gPT09IGZhbHNlKTtcbiAgfSk7XG5cbiAgcmV0dXJuICEocmVzdWx0cy5pbmRleE9mKGZhbHNlKSA+IC0xKTtcbn1cblxuLyoqXG4gKiBDbGVhciB0YXNrcyBieSBpdCdzIHRhZ3NcbiAqXG4gKiBAcGFyYW0gIHtJVGFza30gdGFza1xuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gdXRpbENsZWFyQnlUYWcodGFzazogSVRhc2spOiBib29sZWFuIHtcbiAgaWYgKCFleGNsdWRlU3BlY2lmaWNUYXNrcy5jYWxsKFsnbG9ja2VkJ10sIHRhc2spKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0YXNrLnRhZyA9PT0gdGhpcztcbn1cblxuLyoqXG4gKiBTb3J0IGJ5IGZpZm9cbiAqXG4gKiBAcGFyYW0gIHtJVGFza30gYVxuICogQHBhcmFtICB7SVRhc2t9IGJcbiAqIEByZXR1cm4ge0FueX1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gZmlmbyhhOiBJVGFzaywgYjogSVRhc2spOiBhbnkge1xuICByZXR1cm4gYS5jcmVhdGVkQXQgLSBiLmNyZWF0ZWRBdDtcbn1cblxuLyoqXG4gKiBTb3J0IGJ5IGxpZm9cbiAqXG4gKiBAcGFyYW0gIHtJVGFza30gYVxuICogQHBhcmFtICB7SVRhc2t9IGJcbiAqIEByZXR1cm4ge0FueX1cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gbGlmbyhhOiBJVGFzaywgYjogSVRhc2spOiBhbnkge1xuICByZXR1cm4gYi5jcmVhdGVkQXQgLSBhLmNyZWF0ZWRBdDtcbn1cbiJdfQ==
