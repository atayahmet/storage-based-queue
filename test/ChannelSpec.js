import Config from '../src/config';
import Queue from '../src/queue';
import Channel from '../src/channel';
import StorageCapsule from './../src/storage-capsule';
import { InMemoryAdapter, LocalForageAdapter } from './../src/adapters';
import SendEmail from './ExampleWorker';

describe('Channel class tests', () => {
  let channel,
    config,
    defaultTimeout;
  const { storage } = Queue.drivers;

  beforeEach(async () => {
    Queue.workers({
      SendEmail,
    });

    defaultTimeout = 1500;
    config = new Config();
  });

  afterEach(async () => {});

  it('should did force the queue including the current task, ->forceStop()', async () => {
    const channel = new Channel('channe-forceStop', config);
    await channel.start();
    expect(await channel.countByTag('tag:channel-forceStop')).toEqual(0);
    await channel.add({
      tag: 'tag:channel-forceStop',
      handler: 'SendEmail',
      priority: 1,
      args: 'jobs args 2',
    });
    expect(await channel.countByTag('tag:channel-forceStop')).toEqual(1);
    channel.forceStop();
    expect(await channel.countByTag('tag:channel-forceStop')).toEqual(1);
  });

  it('should return channel status, ->status()', async (done) => {
    const channel = new Channel('channe-status', config);
    expect(channel.status()).toBeFalsy();
    await channel.start();
    expect(channel.status()).toBeTruthy();
    channel.forceStop();
    expect(channel.status()).toBeFalsy();

    await channel.start();
    channel.stop();
    channel.next();
    setTimeout(() => {
      expect(channel.status()).toBeFalsy();
      done();
    }, defaultTimeout + 1);
  });

  it('should be add single unique task, -> add()', async () => {
    const channel = new Channel('channe-add-1', config);
    expect(await channel.count()).toEqual(0);
    const task1 = await channel.add({
      unique: true,
      tag: 'unique-channel',
      handler: 'SendEmail',
      priority: 1,
      args: 'next parameters 1',
    });
    const task2 = await channel.add({
      unique: true,
      tag: 'unique-channel',
      handler: 'SendEmail',
      priority: 1,
      args: 'next parameters 1',
    });
    const task3 = await channel.add({
      unique: true,
      tag: 'unique-channel',
      handler: 'SendEmail',
      priority: 1,
      args: 'next parameters 1',
    });
    const task4 = await channel.add({
      unique: true,
      tag: 'unique-channel',
      handler: 'SendEmail',
      priority: 1,
      args: 'next parameters 1',
    });
    const task5 = await channel.add({
      unique: true,
      tag: 'unique-channel',
      handler: 'SendEmail',
      priority: 1,
      args: 'next parameters 1',
    });
    expect(task2).toBeFalsy();
    expect(await channel.count()).toEqual(1);
    await channel.add({
      unique: true,
      tag: 'channel-a',
      handler: 'SendEmail',
      priority: 1,
      args: 'next parameters 1',
    });
    expect(await channel.count()).toEqual(2);
  });

  it('should be add new task to queue, -> add()', async (done) => {
    const channel = new Channel('channel-add-2', config);
    expect(channel.running).toBeFalsy();
    await channel.start();
    spyOn(channel, 'start');

    expect(channel.start).not.toHaveBeenCalled();
    expect(channel.running).toBeTruthy();

    await channel.add({
      tag: 'tag:channel-add-2',
      handler: 'SendEmail',
      priority: 1,
      args: 'jobs args 2',
    });
    await channel.add({
      tag: 'tag:channel-add-2',
      handler: 'SendEmail',
      priority: 1,
      args: 'jobs args 2',
    });

    setTimeout(async () => {
      const index = (await channel.storage.storage.get('channel-add-2')).findIndex(c => c.tag === 'tag:channel-add-2');
      expect(index).toBeGreaterThan(-1);
      expect(channel.start).toHaveBeenCalled();
      done();
    }, defaultTimeout + 1);
  });

  it('should be run next task, -> next()', async (done) => {
    const channel = new Channel('channel-next', config);
    await channel.start();

    spyOn(channel, 'next');

    await channel.add({
      tag: 'channel-a',
      handler: 'SendEmail',
      priority: 1,
      args: 'next parameters 1',
    });
    await channel.add({
      tag: 'channel-a',
      handler: 'SendEmail',
      priority: 1,
      args: 'next parameters 1',
    });

    setTimeout(() => {
      expect(channel.next).toHaveBeenCalled();
      expect(channel.stopped).toBeFalsy();
      done();
    }, 2001);
  });

  it('should not be run next task, -> next()', async (done) => {
    const channel = new Channel('channel-next-2', config);
    await channel.start();

    await channel.add({
      tag: 'channel-a',
      handler: 'SendEmail',
      priority: 1,
      args: 'next parameters 1',
    });
    spyOn(channel, 'start');
    channel.stop();

    setTimeout(() => {
      expect(channel.start).not.toHaveBeenCalled();
      expect(channel.stopped).toBeTruthy();
      done();
    }, defaultTimeout + 1);
  });

  it('should be return when queue listener run again, -> next()', async () => {
    const channel = new Channel('channel-next-3', config);
    channel.stopped = false;
    expect(await channel.next()).toBeTruthy();
  });

  it('should be return true if queue stack empty, -> isEmpty()', async (done) => {
    const channel = new Channel('channel-isEmpty', config);

    expect(await channel.isEmpty()).toBeTruthy();
    channel.add({
      tag: 'channel-a',
      handler: 'SendEmail',
      priority: 1,
      args: 'any parameters',
    });
    expect(await channel.isEmpty()).toBeTruthy();
    await channel.start();

    setTimeout(async () => {
      expect(await channel.isEmpty()).toBeTruthy();
      done();
    }, defaultTimeout + 1);
  });

  it('should be return total available tasks count, -> count()', async () => {
    const channel = new Channel('channel-count', config);
    expect(await channel.count()).toEqual(0);
  });

  it('should be return total available tasks count by tag, -> countByTag()', async () => {
    const channel = new Channel('channel-countByTag', config);
    await channel.add({
      tag: 'channel-a',
      handler: 'SendEmail',
      priority: 1,
      args: 'any parameters',
    });
    expect(await channel.countByTag('channel-a')).toEqual(1);
  });

  it('should be clear all tasks in current channel, -> clear()', async () => {
    const channel = new Channel('channel-clear', config);
    await channel.add({
      tag: 'channel-a',
      handler: 'SendEmail',
      priority: 1,
      args: 'any parameters',
    });
    expect(await channel.count()).toEqual(1);
    await channel.clear();
    expect(await channel.count()).toEqual(0);
  });

  it('should be clear all tasks by tag in current channel, -> clearByTag()', async () => {
    const channel = new Channel('channel-clearByTag', config);
    await channel.add({
      tag: 'member-register',
      handler: 'SendEmail',
      priority: 1,
      args: 'any parameters',
    });
    await channel.add({
      tag: 'member-payment',
      handler: 'SendEmail',
      priority: 1,
      args: 'any parameters',
    });
    expect(await channel.count()).toEqual(2);
    await channel.clearByTag('member-payment');
    expect(await channel.count()).toEqual(1);
  });

  it('should be check a task by queue id, -> has()', async () => {
    const channel = new Channel('channel-has', config);
    expect(await channel.has('a3a3fafa3')).toBeFalsy();

    const id = await channel.add({
      tag: 'member-register',
      handler: 'SendEmail',
      priority: 1,
      args: 'any parameters',
    });
    expect(await channel.has(id)).toBeTruthy();
  });

  it('should be check a task by tag, -> hasByTag()', async () => {
    const channel = new Channel('channel-hasByTag', config);
    expect(await channel.hasByTag('member-register')).toBeFalsy();
    const id = await channel.add({
      tag: 'member-register',
      handler: 'SendEmail',
      priority: 1,
      args: 'any parameters',
    });
    expect(await channel.hasByTag('member-register')).toBeTruthy();
  });

  it('should create an event, -> on()', () => {
    const channel = new Channel('channel-on', config);
    channel.on('test:before', () => {});
    expect('test' in channel.event.store.before).toBeTruthy();
  });

  it('should create an error event, -> error()', () => {
    const channel = new Channel('channel-on-error', config);
    channel.on('error', () => 'test');
    expect(channel.event.store.wildcard.error()).toEqual('test');
  });
});
