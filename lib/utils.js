
import obj from 'object-path';
import debug from 'debug';

import logEvents from './enum/log.events';

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

export function hasProperty(obj, name) {
  return Object.prototype.hasOwnProperty.call(obj, name);
}

export function hasMethod(instance, method) {
  return instance instanceof Object && method in instance;
}

export function isFunction(func) {
  return func instanceof Function;
}

export function excludeSpecificTasks(task) {
  const conditions = Array.isArray(this) ? this : ['freezed', 'locked'];
  const results = [];

  for (const c of conditions) {
    results.push(hasProperty(task, c) === false || task[c] === false);
  }

  return results.indexOf(false) > -1 ? false : true;
}

export function utilClearByTag(task) {
  if (!excludeSpecificTasks.call(['locked'], task)) {
    return false;
  }
  return task.tag === this;
}

export function fifo(a, b) {
  return a.createdAt - b.createdAt;
}

export function lifo(a, b) {
  return b.createdAt - a.createdAt;
}

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

