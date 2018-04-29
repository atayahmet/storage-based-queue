import Config from '../src/config';
import Queue from '../src/queue';
import StorageCapsule from './../src/storage-capsule';
import { InMemoryAdapter, LocalForageAdapter } from './../src/adapters';
import SendEmail from './ExampleWorker';

describe('Queue class tests', () => {
  let queue,
    storageCapsule,
    config,
    defaultTimeout;
  const { storage } = Queue.drivers;

  beforeEach(async () => {
    Queue.workers({
      SendEmail,
    });

    defaultTimeout = 1500;
    config = new Config();
    queue = new Queue();
    storageCapsule = new StorageCapsule(config, storage);
  });

  afterEach(async () => {
    storageCapsule.clear('channel-a');
    storageCapsule.clear('channel-driver');
    queue.setLimit(-1);
  });

  it('should be register queue worker', () => {
    const SendMessage = SendEmail;
    Queue.workers({ SendEmail, SendMessage });

    expect(Object.keys(Queue.queueWorkers).length).toBeGreaterThan(1);

    expect(() => Queue.workers('worker')).toThrow();
  });

  it('should did force the queue including the current task, ->forceStop()', async () => {
    const channelA = queue.create('channel-a');
    await channelA.start();
    expect(await channelA.countByTag('tag:channel-a')).toEqual(0);
    await channelA.add({
      tag: 'tag:channel-a',
      handler: 'SendEmail',
      priority: 1,
      args: 'jobs args 2',
    });
    expect(await channelA.countByTag('tag:channel-a')).toEqual(1);
    channelA.forceStop();
    expect(await channelA.countByTag('tag:channel-a')).toEqual(1);
  });

  it('should be add single unique task, -> add()', async () => {
    const newQueue = new Queue();
    const channelA = newQueue.create('queue-channel-a');
    expect(await channelA.count()).toEqual(0);
    const task1 = await channelA.add({
      unique: true,
      tag: 'unique-channel',
      handler: 'SendEmail',
      priority: 1,
      args: 'next parameters 1',
    });
    const task2 = await channelA.add({
      unique: true,
      tag: 'unique-channel',
      handler: 'SendEmail',
      priority: 1,
      args: 'next parameters 1',
    });
    const task3 = await channelA.add({
      unique: true,
      tag: 'unique-channel',
      handler: 'SendEmail',
      priority: 1,
      args: 'next parameters 1',
    });
    const task4 = await channelA.add({
      unique: true,
      tag: 'unique-channel',
      handler: 'SendEmail',
      priority: 1,
      args: 'next parameters 1',
    });
    const task5 = await channelA.add({
      unique: true,
      tag: 'unique-channel',
      handler: 'SendEmail',
      priority: 1,
      args: 'next parameters 1',
    });
    expect(task2).toBeFalsy();
    expect(await channelA.count()).toEqual(1);
    await channelA.add({
      unique: true,
      tag: 'channel-a',
      handler: 'SendEmail',
      priority: 1,
      args: 'next parameters 1',
    });
    expect(await channelA.count()).toEqual(2);
  });

  it('should be add new task to queue, -> add()', async (done) => {
    expect(queue.running).toBeFalsy();

    const newQueue = new Queue;
    const channelA = newQueue.create('channel-aa');
    await channelA.start();
    spyOn(channelA, 'start');

    expect(channelA.start).not.toHaveBeenCalled();
    expect(channelA.running).toBeTruthy();

    await channelA.add({
      tag: 'tag:channel-aa',
      handler: 'SendEmail',
      priority: 1,
      args: 'jobs args 2',
    });
    await channelA.add({
      tag: 'tag:channel-aa',
      handler: 'SendEmail',
      priority: 1,
      args: 'jobs args 2',
    });

    setTimeout(async () => {
      const index = (await storageCapsule.storage.get('channel-aa')).findIndex(c => c.tag === 'tag:channel-aa');
      console.log('index->', index, await storageCapsule.storage.get('channel-aa'))
      expect(index).toBeGreaterThan(-1);
      expect(channelA.start).toHaveBeenCalled();
      done();
    }, defaultTimeout + 1);
  });

  it('should be run next task, -> next()', async (done) => {
    const channelA = queue.create('channel-a');
    await channelA.start();

    spyOn(channelA, 'next');

    await channelA.add({
      tag: 'channel-a',
      handler: 'SendEmail',
      priority: 1,
      args: 'next parameters 1',
    });
    await channelA.add({
      tag: 'channel-a',
      handler: 'SendEmail',
      priority: 1,
      args: 'next parameters 1',
    });

    setTimeout(() => {
      expect(channelA.next).toHaveBeenCalled();
      expect(channelA.stopped).toBeFalsy();
      done();
    }, 2001);
  });

  it('should not be run next task, -> next()', async (done) => {
    const channelA = queue.create('channel-a');
    await channelA.start();

    await channelA.add({
      tag: 'channel-a',
      handler: 'SendEmail',
      priority: 1,
      args: 'next parameters 1',
    });
    spyOn(channelA, 'start');
    channelA.stop();

    setTimeout(() => {
      expect(channelA.start).not.toHaveBeenCalled();
      expect(channelA.stopped).toBeTruthy();
      done();
    }, defaultTimeout + 1);
  });

  it('should be return when queue listener run again, -> next()', async () => {
    const channelA = queue.create('channel-b');
    channelA.stopped = false;
    expect(await channelA.next()).toBeTruthy();
  });

  it('should be create new channel, -> create()', () => {
    expect(queue.channels['channel-a']).not.toBeDefined();

    const channelA = queue.create('channel-a');

    expect(channelA.channels['channel-a'] instanceof Queue).toBeTruthy();
    expect(channelA.currentChannel).toEqual('channel-a');
    expect(queue.create('channel-a')).toEqual(channelA);
  });

  it('should be select a channel and return instance, -> channel()', () => {
    const channelA = queue.create('channel-a');

    expect(channelA.channel('channel-a') instanceof Queue).toBeTruthy();
    expect(() => {
      channelA.channel('channel-a2');
    }).toThrow();
  });

  it('should be change job runner delay, -> setTimeout()', async () => {
    const channelA = queue.create('channel-timeout');

    await channelA.start();
    expect(channelA.timeout).toEqual(1000);

    channelA.setTimeout(2000);
    expect(channelA.timeout).toEqual(2000);
  });

  it('should be return true if queue stack empty, -> isEmpty()', async (done) => {
    const channelA = queue.create('channel-a');

    expect(await channelA.isEmpty()).toBeTruthy();
    channelA.add({
      tag: 'channel-a',
      handler: 'SendEmail',
      priority: 1,
      args: 'any parameters',
    });
    expect(await channelA.isEmpty()).toBeTruthy();
    await channelA.start();

    setTimeout(async () => {
      expect(await channelA.isEmpty()).toBeTruthy();
      done();
    }, defaultTimeout + 1);
  });

  it('should be return total available tasks count, -> count()', async () => {
    const channelA = queue.create('channel-a');
    expect(await channelA.count()).toEqual(0);
  });

  it('should be return total available tasks count by tag, -> countByTag()', async () => {
    const channelA = queue.create('channel-a');
    await channelA.add({
      tag: 'channel-a',
      handler: 'SendEmail',
      priority: 1,
      args: 'any parameters',
    });
    expect(await channelA.countByTag('channel-a')).toEqual(1);
  });

  it('should be clear all tasks in current channel, -> clear()', async () => {
    const channelA = queue.create('channel-a');
    await channelA.add({
      tag: 'channel-a',
      handler: 'SendEmail',
      priority: 1,
      args: 'any parameters',
    });
    expect(await channelA.count()).toEqual(1);
    await channelA.clear();
    expect(await channelA.count()).toEqual(0);
  });

  it('if current channel null, should return false, -> clear()', async () => {
    const channelA = queue.create('channel-a');
    channelA.currentChannel = null;
    expect(await channelA.clear()).toBeFalsy();
  });

  it('should be clear all tasks by tag in current channel, -> clearByTag()', async () => {
    const channelA = queue.create('queue-channel-b');
    await channelA.add({
      tag: 'member-register',
      handler: 'SendEmail',
      priority: 1,
      args: 'any parameters',
    });
    await channelA.add({
      tag: 'member-payment',
      handler: 'SendEmail',
      priority: 1,
      args: 'any parameters',
    });
    expect(await channelA.count()).toEqual(2);
    await channelA.clearByTag('member-payment');
    expect(await channelA.count()).toEqual(1);
  });

  it('should be check a task by queue id, -> has()', async () => {
    const channelA = queue.create('channel-a');
    expect(await channelA.has('a3a3fafa3')).toBeFalsy();

    const id = await channelA.add({
      tag: 'member-register',
      handler: 'SendEmail',
      priority: 1,
      args: 'any parameters',
    });
    expect(await channelA.has(id)).toBeTruthy();
  });

  it('should be check a task by tag, -> hasByTag()', async () => {
    const channelA = queue.create('channel-a');

    expect(await channelA.hasByTag('member-register')).toBeFalsy();
    const id = await channelA.add({
      tag: 'member-register',
      handler: 'SendEmail',
      priority: 1,
      args: 'any parameters',
    });
    expect(await channelA.hasByTag('member-register')).toBeTruthy();
  });

  it('should be set limit value of config, -> setLimit()', async () => {
    queue.setLimit(1);
    const channelA = queue.create('channel-a');
    await channelA.add({
      tag: 'channel-a',
      handler: 'SendEmail',
      priority: 1,
      args: 'any parameters',
    });
    await channelA.add({
      tag: 'channel-a',
      handler: 'SendEmail',
      priority: 1,
      args: 'any parameters',
    });
    expect(await channelA.count()).toEqual(1);
  });

  it('should be set prefix value of config, ->setPrefix()', async () => {
    queue.setPrefix('browser_queue');
    const channelA = queue.create('channel-a');
    await channelA.add({
      tag: 'channel-a',
      handler: 'SendEmail',
      priority: 1,
      args: 'any parameters',
    });

    expect(await storageCapsule.storage.get('browser_queue_channel-a')).toBeDefined();
  });

  it('should be set debug value of config, ->setDebug()', () => {
    config.set('debug', false);
    queue.setDebug(true);
    expect(queue.config.get('debug')).toBeTruthy();
    queue.setDebug(false);
    expect(queue.config.get('debug')).toBeFalsy();
  });

  it('should be set debug value of config, ->setStorage()', () => {
    expect(queue.config.get('storage')).toBeUndefined();
    queue.setStorage('inmemory');
    expect(queue.config.get('storage')).toEqual('inmemory')
  });

  it('should be set principle of config', () => {
    queue.setPrinciple(Queue.FIFO);
    expect(config.get('principle')).toEqual(Queue.FIFO);

    queue.setPrinciple(Queue.LIFO);
    expect(queue.config.get('principle')).toEqual(Queue.LIFO);
  });

  it('should create an event, -> on()', () => {
    queue.on('test:before', () => {});
    expect('test' in queue.event.store.before).toBeTruthy();
  });

  it('should create an error event, -> error()', () => {
    queue.on('error', () => 'test');
    expect(queue.event.store.wildcard.error()).toEqual('test');
  });

  it('save dependencies, -> deps()', () => {
    const depMock = {test: ['dep1', 'dep2']};
    expect(() => Queue.deps('xxx')).toThrowError("The parameters should be object.");
    Queue.deps(depMock);
    expect(Queue.workerDeps).toBe(depMock);
  });

  it('driver declaration, -> use()', async () => {
    expect(queue.storage.storage instanceof LocalForageAdapter).toBeTruthy();
    Queue.use({ storage: InMemoryAdapter });
    const newQueue = new Queue();
    const channelA = newQueue.create('channel-driver');
    expect(channelA.storage.storage instanceof InMemoryAdapter).toBeTruthy();
  });
});
