// @flow
import obj from 'object-path';
import logEvents from './enum/log.events';

/* eslint no-console: ["error", { allow: ["log", "groupCollapsed", "groupEnd"] }] */

export function log(...args: any) {
  console.log(...args);
}

export function taskAddedLog([task]: any[]) {
  log(
    `%c(${task.handler}) -> ${obj.get(logEvents, 'queue.created')}`,
    'color: green;font-weight: bold;',
  );
}

export function queueStartLog([type]: any[]) {
  log(
    `%c(${type}) -> ▶️ ${obj.get(logEvents, 'queue.starting')}`,
    'color: #3fa5f3;font-weight: bold;',
  );
}

export function nextTaskLog([type]: any[]) {
  log(`%c(${type}) -> ⏭️ ${obj.get(logEvents, 'queue.next')}`, 'color: #3fa5f3;font-weight: bold;');
}

export function queueStoppingLog([type]: any[]) {
  log(
    `%c(${type}) ->🚦 ${obj.get(logEvents, 'queue.stopping')}`,
    'color: #ff7f94;font-weight: bold;',
  );
}

export function queueStoppedLog([type]: any[]) {
  log(
    `%c(${type}) -> 🛑 ${obj.get(logEvents, 'queue.stopped')}`,
    'color: #ff7f94;font-weight: bold;',
  );
}

export function queueEmptyLog([type]: any[]) {
  log(`🗑️ %c${type} ${obj.get(logEvents, 'queue.empty')}`, 'color: #ff7f94;font-weight: bold;');
}

export function eventCreatedLog([key]: any[]) {
  log(
    `%c(${key}) -> 🎉 ${obj.get(logEvents, 'event.created')}`,
    'color: #66cee3;font-weight: bold;',
  );
}

export function eventFiredLog([key, name]: any[]) {
  log(
    `%c(${key}) -> 🎉 ${obj.get(logEvents, `event.${name}`)}`,
    'color: #a0dc3c;font-weight: bold;',
  );
}

export function notFoundLog([name]: any[]) {
  log(
    `%c(${name}) -> ⚠️ ${obj.get(logEvents, 'queue.not-found')}`,
    'color: #a0dc3c;font-weight: bold;',
  );
}

export function workerRunninLog([worker, task, deps]: any[]) {
  console.groupCollapsed(`${worker.name} -  ${task.label}`);
  log(`%clabel: ${task.label}`, 'color: blue;');
  log(`%chandler: ${task.handler}`, 'color: blue;');
  log(`%cpriority: ${task.priority}`, 'color: blue;');
  log(`%cunique: ${task.unique || 'false'}`, 'color: blue;');
  log(`%cretried: ${task.tried || '0'}`, 'color: blue;');
  log(`%ctag: ${task.tag}`, 'color: blue;');
  log('%cargs:', 'color: blue;');
  log(task.args);
  console.groupCollapsed('dependencies');
  log(...(deps[worker.name] || []));
  console.groupEnd();
}

export function workerDoneLog([result]: any[]) {
  if (result === true) {
    log('%cTask completed!', 'color: green;');
  } else {
    log('%cTask will be retried!', 'color: #ef6363;');
  }
  console.groupEnd();
}

export function workerFailedLog() {
  log('%cTask failed!', 'color: red;');
  console.groupEnd();
}
