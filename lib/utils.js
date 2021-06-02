import _Array$isArray from '@babel/runtime-corejs2/core-js/array/is-array';

/* eslint comma-dangle: ["error", "never"] */

/**
 * Check property in object
 *
 * @param  {Object} obj
 * @return {Boolean}
 *
 * @api public
 */
export function hasProperty(func, name) {
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
  const conditions = _Array$isArray(this) ? this : ['freezed', 'locked'];
  const results = [];

  conditions.forEach((c) => {
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
