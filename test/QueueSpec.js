import Config from "../lib/config";
import Queue from "../lib/queue";
import LocalStorage from "../lib/storage/localstorage";
import SendEmail from './ExampleWorker';

describe('Queue class tests', () => {
  let queue, storage, config, defaultTimeout;

  beforeEach(() => {
    Queue.register([
      { handler: SendEmail}
    ]);

    defaultTimeout = 1000;
    config = new Config;
    queue = new Queue;
    storage = new LocalStorage(config);
  });

  afterEach(() => {
    storage.clear('channel-a');
    queue.setLimit(-1);
  })

  it('should be register queue worker', () => {
    Queue.register([
      { handler: SendEmail},
      { handler: SendEmail}
    ]);

    expect(Queue.jobs.length).toBeGreaterThan(1);

    expect(() => Queue.register('worker')).toThrow();
  });

  it('should did force the queue including the current task, ->forceStop()', () => {
    const channelA = queue.create('channel-a');
    channelA.start();
    expect(channelA.countByTag('tag:channel-a')).toEqual(0)
    channelA.add({tag: 'tag:channel-a', handler: 'SendEmail', priority: 1, args: 'jobs args 2'});
    expect(channelA.countByTag('tag:channel-a')).toEqual(1);
    channelA.forceStop();
    expect(channelA.countByTag('tag:channel-a')).toEqual(1);
  });

  it('should be add new task to queue, -> add()', () => {
    expect(queue.running).toBeFalsy();

    const channelA = queue.create('channel-a');
    channelA.start();
    spyOn(channelA, 'start');

    expect(channelA.start).not.toHaveBeenCalled();
    expect(channelA.running).toBeTruthy();

    channelA.add({tag: 'tag:channel-a', handler: 'SendEmail', priority: 1, args: 'jobs args 2'});
    channelA.add({tag: 'tag:channel-a', handler: 'SendEmail', priority: 1, args: 'jobs args 2'});

    let flag = false;
    runs(() => {
      setTimeout(() => {
        flag = true;
      }, (defaultTimeout + 1));
    });

    waitsFor(() => {
      return flag;
    }, "The Value should be true", (defaultTimeout + 2));

    runs(() => {
      const index = storage.get('channel-a').findIndex(c => c.tag === 'tag:channel-a');
      expect(index).toBeGreaterThan(-1);
      expect(channelA.start).toHaveBeenCalled();
    });
  });

  it('should be add single unique task, -> add()', () => {
    const channelA = queue.create('channel-a');
    expect(channelA.count()).toEqual(0);
    channelA.add({unique: true, tag: 'unique-channel', handler: 'SendEmail', priority: 1, args: 'next parameters 1'});
    channelA.add({unique: true, tag: 'unique-channel', handler: 'SendEmail', priority: 1, args: 'next parameters 1'});
    channelA.add({unique: true, tag: 'unique-channel', handler: 'SendEmail', priority: 1, args: 'next parameters 1'});
    channelA.add({unique: true, tag: 'unique-channel', handler: 'SendEmail', priority: 1, args: 'next parameters 1'});
    channelA.add({unique: true, tag: 'unique-channel', handler: 'SendEmail', priority: 1, args: 'next parameters 1'});
    expect(channelA.count()).toEqual(1);
    channelA.add({unique: true, tag: 'channel-a', handler: 'SendEmail', priority: 1, args: 'next parameters 1'});
    expect(channelA.count()).toEqual(2);
  });

  it('should be run next task, -> next()', () => {
    const channelA = queue.create('channel-a');
    channelA.start();

    spyOn(channelA, 'next');

    channelA.add({tag: 'channel-a', handler: 'SendEmail', priority: 1, args: 'next parameters 1'});
    channelA.add({tag: 'channel-a', handler: 'SendEmail', priority: 1, args: 'next parameters 1'});

    let flag = false;
    runs(() => {
      setTimeout(() => {
        flag = true;
      }, 2001);
    });

    waitsFor(() => {
      return flag;
    }, "The Value should be true", 2002);

    runs(() => {
      expect(channelA.next).toHaveBeenCalled();
      expect(channelA.stopped).toBeFalsy();
    });
  });

  it('should not be run next task, -> next()', () => {
    const channelA = queue.create('channel-a');
    channelA.start();

    spyOn(channelA, 'start');

    channelA.add({tag: 'channel-a', handler: 'SendEmail', priority: 1, args: 'next parameters 1'});
    channelA.stop();

    let flag = false;
    runs(() => {
      setTimeout(() => {
        flag = true;
      }, (defaultTimeout + 1));
    });

    waitsFor(() => {
      return flag;
    }, "The Value should be true", (defaultTimeout + 2));

    runs(() => {
      expect(channelA.start).not.toHaveBeenCalled();
      expect(channelA.stopped).toBeTruthy();
    });
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
    expect(() => { channelA.channel('channel-a2') }).toThrow();
  });

  it('should be change job runner delay, -> setTimeout()', () => {
    queue.start();

    const channelA = queue.create('channel-a');

    expect(channelA.timeout).toEqual(1000);

    channelA.setTimeout(2000);
    expect(channelA.timeout).toEqual(2000);

    channelA.add({tag: 'channel-a', handler: 'SendEmail', priority: 1, args: 'next parameters 1'});

    let flag = false;
    runs(() => {
      setTimeout(() => {
        flag = true;
      }, 2001);
    });

    waitsFor(() => {
      return flag;
    }, "The Value should be true", 2002);

    runs(() => {
      expect(storage.get('channel-a').length).toBeLessThan(1);
    });
  });

  it('should be return true if queue stack empty, -> isEmpty()', () => {
    const channelA = queue.create('channel-a');

    expect(channelA.isEmpty()).toBeTruthy();
    channelA.add({tag: 'channel-a', handler: 'SendEmail', priority: 1, args: 'any parameters'});
    expect(channelA.isEmpty()).toBeFalsy();
    channelA.start();

    let flag = false;
    runs(() => {
      setTimeout(() => {
        flag = true;
      }, (defaultTimeout + 1));
    });

    waitsFor(() => {
      return flag;
    }, "The Value should be true", (defaultTimeout + 2));

    runs(() => {
      expect(channelA.isEmpty()).toBeTruthy();
    });
  });

  it('should be return total available tasks count, -> count()', () => {
    const channelA = queue.create('channel-a');
    expect(channelA.count()).toEqual(0);
  });

  it('should be return total available tasks count by tag, -> countByTag()', () => {
    const channelA = queue.create('channel-a');
    channelA.add({tag: 'channel-a', handler: 'SendEmail', priority: 1, args: 'any parameters'});

    expect(channelA.countByTag('channel-a')).toEqual(1);
    channelA.add({tag: 'channel-a', handler: 'SendEmail', priority: 1, args: 'any parameters'});
    expect(channelA.countByTag('channel-a')).toEqual(2);
  });

  it('should be clear all tasks in current channel, -> clear()', () => {
    const channelA = queue.create('channel-a');
    expect(channelA.count()).toEqual(0);
    channelA.add({tag: 'channel-a', handler: 'SendEmail', priority: 1, args: 'any parameters'});
    expect(channelA.count()).toEqual(1);
    channelA.clear();
    expect(channelA.count()).toEqual(0);
    channelA.currentChannel = null;
    channelA.clear();
  });

  it('should be clear all tasks by tag in current channel, -> clearByTag()', () => {
    const channelA = queue.create('channel-a');
    channelA.add({tag: 'member-register', handler: 'SendEmail', priority: 1, args: 'any parameters'});
    channelA.add({tag: 'member-payment', handler: 'SendEmail', priority: 1, args: 'any parameters'});
    expect(channelA.count()).toEqual(2);

    channelA.clearByTag('member-payment');
    expect(channelA.count()).toEqual(1);
  });

  it('should be check a task by queue id, -> has()', () => {
    const channelA = queue.create('channel-a');
    expect(channelA.has('a3a3fafa3')).toBeFalsy();

    const id = channelA.add({tag: 'member-register', handler: 'SendEmail', priority: 1, args: 'any parameters'});
    expect(channelA.has(id)).toBeTruthy();
  });

  it('should be check a task by tag, -> hasByTag()', () => {
    const channelA = queue.create('channel-a');

    expect(channelA.hasByTag('member-register')).toBeFalsy();
    const id = channelA.add({tag: 'member-register', handler: 'SendEmail', priority: 1, args: 'any parameters'});
    expect(channelA.hasByTag('member-register')).toBeTruthy();
  });

  it('should be set limit value of config, -> setLimit()', () => {
    queue.setLimit(1);
    const channelA = queue.create('channel-a');
    channelA.add({tag: 'channel-a', handler: 'SendEmail', priority: 1, args: 'any parameters'});
    channelA.add({tag: 'channel-a', handler: 'SendEmail', priority: 1, args: 'any parameters'});
    expect(channelA.count()).toEqual(1);
  });

  it('should be set prefix value of config, ->setPrefix()', () => {
    queue.setPrefix('browser_queue');
    const channelA = queue.create('channel-a');
    channelA.add({tag: 'channel-a', handler: 'SendEmail', priority: 1, args: 'any parameters'});
    expect(localStorage['browser_queue_channel-a']).toBeDefined();
  });

  it('should be set debug value of config, ->setDebug()', () => {
    config.set('debug', false)
    queue.setDebug(true);
    expect(queue.config.get('debug')).toBeTruthy();
    queue.setDebug(false);
    expect(queue.config.get('debug')).toBeFalsy();
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
});
