/* @flow */
import obj from 'object-path';
import debug from 'debug';
import type ITask from '../interfaces/task';
import logEvents from './enum/log.events';

/* eslint comma-dangle: ["error", "never"] */
/* global localStorage:true */

/**
 * Check property in object
 *
 * @param  {Object} obj
 * @return {Boolean}
 *
 * @api public
 */
export function hasProperty(func: Function, name: string): boolean {
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
export function hasMethod(instance: any, method: string): boolean {
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
export function isFunction(func: Function): boolean {
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
export function excludeSpecificTasks(task: ITask): boolean {
  const conditions = Array.isArray(this) ? this : ['freezed', 'locked'];
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
export function utilClearByTag(task: ITask): boolean {
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
export function fifo(a: ITask, b: ITask): any {
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
export function lifo(a: ITask, b: ITask): any {
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
export function log(key: string, data: string = ''): void {
  if (this !== true) {
    localStorage.removeItem('debug');
    return;
  }

  // debug mode on always
  localStorage.setItem('debug', 'worker:*');

  // get new debug function instance
  const logger = debug(`worker:${data} ->`);

  // the output push to console
  logger(obj.get(logEvents, key));
}
