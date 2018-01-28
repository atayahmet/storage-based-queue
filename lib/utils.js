
import obj from 'object-path';
import debug from 'debug';

import logEvents from './enum/log.events';

/**
                                            * Clone class
                                            *
                                            * @param  {Object} obj
                                            * @return {Object}
                                            *
                                            * @api public
                                            */
export function clone(obj) {
  var newClass = Object.create(
  Object.getPrototypeOf(obj),
  Object.getOwnPropertyNames(obj).reduce((props, name) => {
    props[name] = Object.getOwnPropertyDescriptor(obj, name);
    return props;
  }, {}));


  if (!Object.isExtensible(obj)) {
    Object.preventExtensions(newClass);
  }
  if (Object.isSealed(obj)) {
    Object.seal(newClass);
  }
  if (Object.isFrozen(obj)) {
    Object.freeze(newClass);
  }

  return newClass;
}

/**
   * Check property in object
   *
   * @param  {Object} obj
   * @return {Boolean}
   *
   * @api public
   */
export function hasProperty(obj, name) {
  return Object.prototype.hasOwnProperty.call(obj, name);
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
export function hasMethod(instance, method) {
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
export function isFunction(func) {
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
export function excludeSpecificTasks(task) {
  const conditions = Array.isArray(this) ? this : ['freezed', 'locked'];
  const results = [];

  for (const c of conditions) {
    results.push(hasProperty(task, c) === false || task[c] === false);
  }

  return results.indexOf(false) > -1 ? false : true;
}

/**
   * Clear tasks by it's tags
   *
   * @param  {ITask} task
   * @return {Boolean}
   *
   * @api public
   */
export function utilClearByTag(task) {
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
export function fifo(a, b) {
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
export function lifo(a, b) {
  return b.createdAt - a.createdAt;
}

/**
   * Log helper
   *
   * @param  {String} key
   * @param  {String} data
   * @param  {Boolean} condition
   * @return {void}
   *
   * @api public
   */
export function log(key) {let data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';let condition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  if (this !== true) {
    localStorage.removeItem('debug');
    return;
  }

  // debug mode on always
  localStorage.setItem('debug', 'worker:*');

  // get new debug function instance
  const log = debug(`worker:${data} ->`);

  // the output push to console
  log(obj.get(logEvents, key));
}

