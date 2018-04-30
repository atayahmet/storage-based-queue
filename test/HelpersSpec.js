import Queue from '../src/queue';
import SendEmail from './ExampleWorker';
import StorageCapsule from '../src/storage-capsule';
import {
  getTasksWithoutFreezed,
  db,
  saveTask,
  dispatchEvents,
  stopQueue,
  checkPriority,
  lockTask,
  fireJobInlineEvent,
  successJobHandler,
  failedJobHandler,
  updateRetry,
  retryProcess,
  loopHandler,
  createTimeout,
  canMultiple,
  registerWorkers,
} from '../src/helpers';

describe('Helper functions tests', () => {
  let queue,
    channelA,
    storage,
    config,
    defaultTimeout;

  const genericTask = {
    tag: 'tag:helpers-channel-a',
    handler: 'SendEmail',
    priority: 1,
    args: 'jobs args 2',
  };

  beforeEach(async () => {
    Queue.workers({ SendEmail });

    queue = new Queue();
    channelA = queue.create('helpers-channel-a');
    defaultTimeout = 1000;
    await channelA.clear();
  });

  afterEach(async () => {
    queue.setLimit(-1);
  });

  it('filter freezed tasks, -> getTasksWithoutFreezed()', async () => {
    await channelA.add(genericTask);
    const freezedTask = { ...genericTask, freezed: true };
    await channelA.add(freezedTask);
    expect((await getTasksWithoutFreezed.call(channelA)).length).toEqual(1);
  });

  it('should be return storage class instance, -> db()', () => {
    expect(db.call(channelA) instanceof StorageCapsule).toBeTruthy();
    expect(db.call(channelA).storageChannel).toEqual('helpers-channel-a');
  });

  it('should be save task, -> saveTask()', () => {
    expect(saveTask.call(channelA, genericTask)).toBeTruthy();
    expect(channelA.hasByTag('tag:channel-a')).toBeTruthy();
  });

  it('should be save task, -> saveTask()', () => {
    expect(saveTask.call(channelA, genericTask)).toBeTruthy();
    expect(channelA.hasByTag('tag:channel-a')).toBeTruthy();
  });

  it('should be dispatch events, -> dispatchEvents()', () => {
    const scopedTask = { ...genericTask };
    spyOn(channelA.event, 'emit');
    dispatchEvents.call(channelA, scopedTask, 'before');
    expect(channelA.event.emit).toHaveBeenCalled();

    delete scopedTask.tag;
    expect(dispatchEvents.call(channelA, scopedTask, 'before')).toBeFalsy();
  });

  it('should stop the queue listener, -> stopQueue()', async () => {
    const newQueue = new Queue();
    const newChannel = newQueue.create('helpers-channel-b');

    expect(newChannel.running).toBeFalsy();
    await newChannel.start();
    expect(newChannel.running).toBeTruthy();

    await newChannel.add(genericTask);
    expect(newChannel.stopped).toBeFalsy();
    stopQueue.call(newChannel);
    expect(newChannel.stopped).toBeTruthy();
  });

  it('should be check priority of task, -> checkPriority()', () => {
    const task = { tag: 'tag:channel-a', handler: 'SendEmail', args: 'jobs args 2' };
    expect(checkPriority.call(channelA, task).priority).toEqual(0);

    task.priority = 'asdasdasda';
    expect(checkPriority.call(channelA, task).priority).toEqual(0);
  });

  it('should be check priority of task, -> fireJobInlineEvent()', () => {
    const job = new SendEmail();
    const falseResult = fireJobInlineEvent.call(channelA, 'before2', job, { name: 'john' });
    expect(falseResult).toBeFalsy();

    spyOn(job, 'before');
    fireJobInlineEvent.call(channelA, 'before', job, { name: 'john' });
    expect(job.before).toHaveBeenCalled();

    spyOn(job, 'after');
    fireJobInlineEvent.call(channelA, 'after', job, { name: 'john' });
    expect(job.after).toHaveBeenCalled();
  });

  it('should be dispatch success processs, -> successJobHandler()', async () => {
    const job = new SendEmail();
    spyOn(job, 'after');
    spyOn(channelA.event, 'emit');
    spyOn(channelA, 'next');
    spyOn(channelA.storage, 'delete');
    spyOn(channelA.storage, 'update');

    const childSuccessJobHandler = await successJobHandler.call(channelA, genericTask, job);
    expect(typeof childSuccessJobHandler === 'function').toBeTruthy();

    await childSuccessJobHandler(true);
    expect(job.after).toHaveBeenCalled();
    expect(channelA.event.emit).toHaveBeenCalled();
    expect(channelA.next).toHaveBeenCalled();
    expect(channelA.storage.delete).toHaveBeenCalled();
  });

  it('should be dispatch retry processs, -> successJobHandler()', async () => {
    const job = new SendEmail();
    spyOn(job, 'after');
    spyOn(channelA.event, 'emit');
    spyOn(channelA, 'next');
    spyOn(channelA.storage, 'delete');
    spyOn(channelA.storage, 'update');

    const childSuccessJobHandler = await successJobHandler.call(channelA, genericTask, job);
    expect(typeof childSuccessJobHandler === 'function').toBeTruthy();

    await childSuccessJobHandler(false);
    expect(channelA.storage.update).toHaveBeenCalled();
    expect(channelA.next).toHaveBeenCalled();
    expect(channelA.event.emit).toHaveBeenCalled();
    expect(channelA.storage.delete).not.toHaveBeenCalled();
  });

  it('should be dispatch failed processs, -> failedJobHandler()', async () => {
    const newQueue = new Queue();
    const newChannel = newQueue.create('helpers-channel-c');
    const job = new SendEmail();
    const task = { tag: 'tag:channel-a', handler: 'SendEmail', args: 'jobs args 2' };

    spyOn(newChannel, 'next');
    spyOn(newChannel.event, 'emit');
    spyOn(newChannel.storage, 'delete');

    const handler = await failedJobHandler.call(newChannel, task, job);
    expect(typeof handler === 'function').toBeTruthy();

    await handler.call(newChannel, true);
    expect(newChannel.event.emit).toHaveBeenCalled();
    expect(newChannel.next).toHaveBeenCalled();
    expect(newChannel.storage.delete).toHaveBeenCalled();
  });

  it('should apply some process after failed tasks, -> retryProcess()', async () => {
    const worker = new SendEmail();
    const newQueue = new Queue();
    const newChannel = newQueue.create('helpers-channel-c');
    const _id = await newChannel.add(genericTask);
    const scopedTask = { ...genericTask, _id };
    const result = await retryProcess.call(newChannel, scopedTask, worker);
    expect(result).toBeTruthy();
  });

  it('queue generic handler, -> loopHandler()', async () => {
    const worker = new SendEmail();
    spyOn(worker, 'handle')
      .withArgs('jobs args 2')
      .and.returnValue(new Promise((resolve, reject) => resolve(true)));

    const newQueue = new Queue();
    const newChannel = newQueue.create('helpers-channel-d');
    const _id = await newChannel.add(genericTask);
    const scopedTask = { ...genericTask, _id };
    const handler = loopHandler.call(newChannel, scopedTask, SendEmail, worker);
    await handler.call(newChannel);
    expect(worker.handle).toHaveBeenCalled();
  });

  it('should be update the retry value of task, -> updateRetry()', () => {
    const worker = new SendEmail();
    const task = { tag: 'tag:channel-a', handler: 'SendEmail', args: 'jobs args 2' };

    delete worker.retry;
    const updatedTask = updateRetry(task, worker);

    expect(worker.retry).toEqual(1);
    expect(updatedTask.retry).toEqual(1);
    expect(updatedTask.tried).toEqual(1);
    expect(updatedTask.freezed).toBeTruthy();
  });

  it('create a timeout for process a task, -> createTimeout()', async () => {
    const newQueue = new Queue();
    const newChannel = newQueue.create('helpers-channel-e');
    expect(await createTimeout.call(newChannel)).toBeTruthy();
  });

  it('check the attachability of the task with the same tag', async () => {
    const newQueue = new Queue();
    const newChannel = newQueue.create('helpers-channel-f');

    expect(await canMultiple.call(newChannel, genericTask)).toBeTruthy();
    const scopedTask = { ...genericTask, unique: true };
    await newChannel.add(genericTask);
    expect(await canMultiple.call(newChannel, scopedTask)).toBeFalsy();
  });

  it('register workers', () => {
    Queue.isRegistered = true;
    Queue.queueWorkers = null;
    const newQueue = new Queue();
    const newChannel = newQueue.create('helpers-channel-g');
    expect(registerWorkers.call(newChannel)).toBeFalsy();
    Queue.isRegistered = false;
    expect(registerWorkers.call(newChannel)).toBeTruthy();
  });

  it('should be control the queue workableness, -> ()', (done) => {
    spyOn(channelA, 'forceStop').call(queue, true);
    expect(channelA.forceStop).toHaveBeenCalled();

    spyOn(channelA, 'start').call(queue, false);
    setTimeout(async () => {
      expect(await channelA.start).toHaveBeenCalled();
      done();
    }, 2001);
  });
});
