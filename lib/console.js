import obj from 'object-path';
import logEvents from './enum/log.events';

/* eslint no-console: ["error", { allow: ["log", "groupCollapsed", "groupEnd"] }] */

export function log(...args) {
  console.log(...args);
}

export function taskAddedLog([task]) {
  log(
    `%c${String.fromCharCode(43)} (${task.handler}) -> ${obj.get(
      logEvents,
      'queue.created'
    )}`,
    'color: green;font-weight: bold;'
  );
}

export function queueStartLog([type]) {
  log(
    `%c${String.fromCharCode(8211)} (${type}) -> ${obj.get(
      logEvents,
      'queue.starting'
    )}`,
    'color: #3fa5f3;font-weight: bold;'
  );
}

export function nextTaskLog([type]) {
  log(
    `%c${String.fromCharCode(187)} (${type}) -> ${obj.get(
      logEvents,
      'queue.next'
    )}`,
    'color: #3fa5f3;font-weight: bold;'
  );
}

export function queueStoppingLog([type]) {
  log(
    `%c${String.fromCharCode(8226)} (${type}) -> ${obj.get(
      logEvents,
      'queue.stopping'
    )}`,
    'color: #ff7f94;font-weight: bold;'
  );
}

export function queueStoppedLog([type]) {
  log(
    `%c${String.fromCharCode(8226)} (${type}) -> ${obj.get(
      logEvents,
      'queue.stopped'
    )}`,
    'color: #ff7f94;font-weight: bold;'
  );
}

export function queueEmptyLog([type]) {
  log(
    `%c${type} ${obj.get(logEvents, 'queue.empty')}`,
    'color: #ff7f94;font-weight: bold;'
  );
}

export function eventCreatedLog([key, name]) {
  log(
    `%c(${name}) -> ${key} ${obj.get(logEvents, 'event.created')}`,
    'color: #66cee3;font-weight: bold;'
  );
}

export function eventFiredLog([key, name]) {
  log(
    `%c(${key}) -> ${obj.get(logEvents, `event.${name}`)}`,
    'color: #a0dc3c;font-weight: bold;'
  );
}

export function notFoundLog([name]) {
  log(
    `%c${String.fromCharCode(215)} (${name}) -> ${obj.get(
      logEvents,
      'queue.not-found'
    )}`,
    'color: #b92e2e;font-weight: bold;'
  );
}

export function workerRunninLog([worker, workerInstance, task, channel, deps]) {
  console.groupCollapsed(`${worker.name || task.handler} - ${task.label}`);
  log(`%cchannel: ${channel}`, 'color: blue;');
  log(`%clabel: ${task.label || ''}`, 'color: blue;');
  log(`%chandler: ${task.handler}`, 'color: blue;');
  log(`%cpriority: ${task.priority}`, 'color: blue;');
  log(`%cunique: ${task.unique || 'false'}`, 'color: blue;');
  log(`%cretry: ${workerInstance.retry || '1'}`, 'color: blue;');
  log(`%ctried: ${task.tried ? task.tried + 1 : '1'}`, 'color: blue;');
  log(`%ctag: ${task.tag || ''}`, 'color: blue;');
  log('%cargs:', 'color: blue;');
  log(task.args || '');
  console.groupCollapsed('dependencies');
  log(...(deps[worker.name] || []));
  console.groupEnd();
}

export function workerDoneLog([result, task, workerInstance]) {
  if (result === true) {
    log(`%c${String.fromCharCode(10003)} Task completed!`, 'color: green;');
  } else if (!result && task.tried < workerInstance.retry) {
    log('%cTask will be retried!', 'color: #d8410c;');
  } else {
    log(
      `%c${String.fromCharCode(10005)} Task failed and freezed!`,
      'color: #ef6363;'
    );
  }
  console.groupEnd();
}

export function workerFailedLog() {
  log(`%c${String.fromCharCode(10005)} Task failed!`, 'color: red;');
  console.groupEnd();
}
