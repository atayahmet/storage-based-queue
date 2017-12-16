


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

