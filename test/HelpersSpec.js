import Queue from "../lib/queue";
import SendEmail from './ExampleWorker';
import StorageCapsule from "../lib/storage-capsule";
import {
  getTasksWithoutFreezed,
  db,
  saveTask,
  dispatchEvents,
  checkPriority,
  fireJobInlineEvent,
  successJobHandler,
  failedJobHandler,
  updateRetry,
  dispatchProcess
} from '../lib/helpers';

describe('Helper functions tests', () => {
  let queue, channelA, storage, config, defaultTimeout;

  beforeEach(() => {
    Queue.register([
      { handler: SendEmail}
    ]);

    queue = new Queue;
    channelA = queue.create('channel-a');
    defaultTimeout = 1000;
  });

  afterEach(() => {
    queue.setLimit(-1);
    channelA.clear();
  })

  it('filter freezed tasks, -> getTasksWithoutFreezed()', () => {
    channelA.add({tag: 'tag:channel-a', handler: 'SendEmail', priority: 1, args: 'jobs args 2'});
    channelA.add({tag: 'tag:channel-a', handler: 'SendEmail', freezed: true, priority: 1, args: 'jobs args 2'});
    expect(getTasksWithoutFreezed.call(channelA).length).toEqual(1);
  });

  it('should be return storage class instance, -> db()', () => {
    expect(db.call(channelA) instanceof StorageCapsule).toBeTruthy();
    expect(db.call(channelA).storageChannel).toEqual('channel-a');
  });

  it('should be save task, -> saveTask()', () => {
    const task = {tag: 'tag:channel-a', handler: 'SendEmail', priority: 1, args: 'jobs args 2'};
    expect(saveTask.call(channelA, task)).toBeTruthy();
    expect(queue.hasByTag('tag:channel-a')).toBeTruthy();
  });

  it('should be save task, -> saveTask()', () => {
    const task = {tag: 'tag:channel-a', handler: 'SendEmail', priority: 1, args: 'jobs args 2'};
    expect(saveTask.call(channelA, task)).toBeTruthy();
    expect(queue.hasByTag('tag:channel-a')).toBeTruthy();
  });

  it('should be dispatch events, -> dispatchEvents()', () => {
    const task = {tag: 'tag:channel-a', handler: 'SendEmail', priority: 1, args: 'jobs args 2'};
    spyOn(channelA.event, 'emit');
    dispatchEvents.call(channelA, task, 'before');
    expect(channelA.event.emit).toHaveBeenCalled();

    delete task.tag;
    expect(dispatchEvents.call(channelA, task, 'before')).toBeFalsy();
  });

  it('should be check priority of task, -> checkPriority()', () => {
    const task = {tag: 'tag:channel-a', handler: 'SendEmail', args: 'jobs args 2'};
    expect(checkPriority.call(channelA, task).priority).toEqual(0);

    task.priority = 'asdasdasda';
    expect(checkPriority.call(channelA, task).priority).toEqual(0);
  });

  it('should be check priority of task, -> fireJobInlineEvent()', () => {
    const job = new SendEmail;

    const falseResult = fireJobInlineEvent.call(channelA, 'before2', job, {name: 'john'});

    expect(falseResult).toBeFalsy();

    spyOn(job, 'before');
    fireJobInlineEvent.call(channelA, 'before', job, {name: 'john'});
    expect(job.before).toHaveBeenCalled();

    spyOn(job, 'after');
    fireJobInlineEvent.call(channelA, 'after', job, {name: 'john'});
    expect(job.after).toHaveBeenCalled();
  });

  it('should be dispatch non-error processs, -> successJobHandler()', () => {
    const job = new SendEmail;
    spyOn(job, 'after');
    spyOn(channelA.event, 'emit');
    spyOn(channelA, 'next');
    spyOn(channelA.storage, 'delete');
    spyOn(channelA.storage, 'update');

    const task = {tag: 'tag:channel-a', handler: 'SendEmail', args: 'jobs args 2'};
    const handler = successJobHandler.call(channelA, task, job);
    expect(typeof handler === 'function').toBeTruthy();

    handler(true);
    expect(job.after).toHaveBeenCalled();
    expect(channelA.event.emit).toHaveBeenCalled();
    expect(channelA.next).toHaveBeenCalled();
    expect(channelA.storage.delete).toHaveBeenCalled();

    handler(false);
    expect(channelA.storage.update).toHaveBeenCalled();
    expect(channelA.next).toHaveBeenCalled();
    expect(channelA.event.emit).toHaveBeenCalled();
  });

  it('should be dispatch failed processs, -> failedJobHandler()', () => {
    const job = new SendEmail;
    const task = {tag: 'tag:channel-a', handler: 'SendEmail', args: 'jobs args 2'};

    spyOn(channelA, 'next');
    spyOn(channelA.event, 'emit');
    spyOn(channelA.storage, 'delete');

    const handler = failedJobHandler.call(channelA, task, job);
    expect(typeof handler === 'function').toBeTruthy();

    handler(true);
    expect(channelA.event.emit).toHaveBeenCalled();
    expect(channelA.next).toHaveBeenCalled();
    expect(channelA.storage.delete).toHaveBeenCalled();
  });

  it('should be update the retry value of task, -> updateRetry()', () => {
    const job = new SendEmail;
    const task = {tag: 'tag:channel-a', handler: 'SendEmail', args: 'jobs args 2'};

    delete job.retry;
    const updatedTask = updateRetry(task, job);

    expect(job.retry).toEqual(1);
    expect(updatedTask.retry).toEqual(1);
    expect(updatedTask.tried).toEqual(1);
    expect(updatedTask.freezed).toBeTruthy();
  });
});
