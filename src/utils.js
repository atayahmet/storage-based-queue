/* @flow */
import type ITask from '../interfaces/task';

export function clone(obj: Object) {
  var newClass = Object.create(
    Object.getPrototypeOf(obj),
    Object.getOwnPropertyNames(obj).reduce((props, name) => {
      props[name] = Object.getOwnPropertyDescriptor(obj, name);
      return props;
    }, {})
  );

  if (! Object.isExtensible(obj)) {
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

export function hasProperty(obj: Function, name: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, name);
}

export function hasMethod(instance: any, method: string) {
  return instance instanceof Object && (method in instance);
}

export function isFunction(func: Function) {
  return func instanceof Function;
}

export function excludeSpecificTasks(task: ITask) {
  const conditions = Array.isArray(this) ? this : ['freezed', 'locked'];
  const results = [];

  for (const c of conditions) {
    results.push(hasProperty(task, c) === false || task[c] === false);
  }

  return results.indexOf(false) > -1 ? false : true;
}

export function utilClearByTag(task: ITask): boolean {
  if (! excludeSpecificTasks.call(['locked'], task)) {
    return false;
  }
  return task.tag === this;
}

export function fifo(a: ITask, b: ITask) {
  return a.createdAt - b.createdAt;
}

export function lifo(a: ITask, b: ITask) {
  return b.createdAt - a.createdAt;
}