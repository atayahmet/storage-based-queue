import Config from '../src/config';
import Queue from '../src/queue';
import StorageCapsule from './../src/storage-capsule';
import { InMemoryAdapter, LocalForageAdapter } from './../src/adapters';
import SendEmail from './ExampleWorker';
import Channel from '../src/channel';

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

  it('should be create new channel, -> create()', () => {
    expect(queue.container.has('channel-create')).toBeFalsy();
    const channelA = queue.create('channel-create');
    expect(queue.container.has('channel-create')).toBeTruthy();
    expect(queue.container.get('channel-create') instanceof Channel).toBeTruthy();
    expect(queue.create('channel-create')).toEqual(channelA);
  });

  it('should be select a channel and return instance, -> channel()', () => {
    const channelA = queue.create('channel-a');
    expect(queue.channel('channel-a') instanceof Channel).toBeTruthy();
    expect(() => {
      queue.channel('channel-a2');
    }).toThrow();
  });

  it('should be change job runner delay, -> setTimeout()', async () => {
    const channelA = queue.create('channel-timeout');
    await channelA.start();
    expect(channelA.config.get('timeout')).toEqual(1000);
    queue.setTimeout(2000);
    expect(channelA.config.get('timeout')).toEqual(2000);
  });

  it('should be set limit value of config, -> setLimit()', async () => {
    queue.setLimit(1);
    const channelA = queue.create('channel-setLimit');
    await channelA.add({
      tag: 'channel-a:setLimit',
      handler: 'SendEmail',
      priority: 1,
      args: 'any parameters',
    });
    await channelA.add({
      tag: 'channel-a:setLimit',
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
    expect(queue.config.get('storage')).toEqual('inmemory');
  });

  it('should be set principle of config', () => {
    queue.setPrinciple(Queue.FIFO);
    expect(config.get('principle')).toEqual(Queue.FIFO);
    queue.setPrinciple(Queue.LIFO);
    expect(queue.config.get('principle')).toEqual(Queue.LIFO);
  });

  it('save dependencies, -> deps()', () => {
    const depMock = { test: ['dep1', 'dep2'] };
    expect(() => Queue.deps('xxx')).toThrowError('The parameters should be object.');
    Queue.deps(depMock);
    expect(Queue.workerDeps).toBe(depMock);
  });

  it('driver declaration, -> use()', async () => {
    const newQueue = new Queue();
    const channelA = newQueue.create('channel-driver-1');
    expect(channelA.storage.storage instanceof LocalForageAdapter).toBeTruthy();
    Queue.use({ storage: InMemoryAdapter });
    const channelB = newQueue.create('channel-driver-2');
    expect(channelB.storage.storage instanceof InMemoryAdapter).toBeTruthy();
  });
});
