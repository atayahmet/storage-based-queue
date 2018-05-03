import obj from 'object-path';
import logEvents from './enum/log.events';

/* eslint no-console: ["error", { allow: ["log", "groupCollapsed", "groupEnd"] }] */

export function log() {
  console.log(...arguments);
}

export function taskAddedLog(_ref) {
  const [task] = _ref;
  log(
    `%c(${task.handler}) -> ${obj.get(logEvents, 'queue.created')}`,
    'color: green;font-weight: bold;',
  );
}

export function queueStartLog(_ref2) {
  const [type] = _ref2;
  log(
    `%c(${type}) -> ▶️ ${obj.get(logEvents, 'queue.starting')}`,
    'color: #3fa5f3;font-weight: bold;',
  );
}

export function nextTaskLog(_ref3) {
  const [type] = _ref3;
  log(`%c(${type}) -> ⏭️ ${obj.get(logEvents, 'queue.next')}`, 'color: #3fa5f3;font-weight: bold;');
}

export function queueStoppingLog(_ref4) {
  const [type] = _ref4;
  log(
    `%c(${type}) ->🚦 ${obj.get(logEvents, 'queue.stopping')}`,
    'color: #ff7f94;font-weight: bold;',
  );
}

export function queueStoppedLog(_ref5) {
  const [type] = _ref5;
  log(
    `%c(${type}) -> 🛑 ${obj.get(logEvents, 'queue.stopped')}`,
    'color: #ff7f94;font-weight: bold;',
  );
}

export function queueEmptyLog(_ref6) {
  const [type] = _ref6;
  log(`🗑️ %c${type} ${obj.get(logEvents, 'queue.empty')}`, 'color: #ff7f94;font-weight: bold;');
}

export function eventCreatedLog(_ref7) {
  const [key] = _ref7;
  log(
    `%c(${key}) -> 🎉 ${obj.get(logEvents, 'event.created')}`,
    'color: #66cee3;font-weight: bold;',
  );
}

export function eventFiredLog(_ref8) {
  const [key, name] = _ref8;
  log(
    `%c(${key}) -> 🎉 ${obj.get(logEvents, `event.${name}`)}`,
    'color: #a0dc3c;font-weight: bold;',
  );
}

export function notFoundLog(_ref9) {
  const [name] = _ref9;
  log(
    `%c(${name}) -> ⚠️ ${obj.get(logEvents, 'queue.not-found')}`,
    'color: #a0dc3c;font-weight: bold;',
  );
}

export function workerRunninLog(_ref10) {
  const [worker, task, deps] = _ref10;
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

export function workerDoneLog(_ref11) {
  const [result] = _ref11;
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
