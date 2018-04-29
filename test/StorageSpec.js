import StorageCapsule from '../src/storage-capsule';
import Config from '../src/config';
import Queue from '../src/queue';

describe('Storage capsule class tests', () => {
  const config = new Config();
  let exmpTask,
    defaultTimeout,
    storageCapsule;
  const { storage } = Queue.drivers;

  beforeEach(async () => {
    exmpTask = {
      tag: 'test',
      handler: 'SendEmail',
      priority: 1,
      args: 'jobs args 2',
    };
    storageCapsule = new StorageCapsule(config, storage);
    defaultTimeout = 1000;
    await storageCapsule.clear('channel-a');
    await storageCapsule.clear('channel-b');
    await storageCapsule.clear('channel-c');
    await storageCapsule.clear('channel-d');
    await storageCapsule.clear('channel-e');
    await storageCapsule.clear('channel-f');
  });

  afterEach(() => {
    config.set('limit', -1);
  });

  it('should be select channel, -> channel()', () => {
    storageCapsule.channel('channel-a-1');
    expect(storageCapsule.storageChannel).toEqual('channel-a-1');

    storageCapsule.channel('channel-a-2');
    expect(storageCapsule.storageChannel).toEqual('channel-a-2');
  });

  it('should be save task payload to storage, -> save()', async () => {
    storageCapsule.channel('channel-b-1');
    await storageCapsule.save(exmpTask);
    const { _id, createdAt, ...task } = (await storageCapsule.storage.get('channel-b-1')).shift();
    expect(task).toEqual(exmpTask);
    expect(_id).toBeDefined();
    expect(createdAt).toBeDefined();

    storageCapsule.channel('channel-b-2');
    await storageCapsule.save(exmpTask);

    const task2 = (await storageCapsule.storage.get('channel-b-2')).shift();
    expect(task2._id).toBeDefined();
    expect(task2.createdAt).toBeDefined();

    delete task2._id;
    delete task2.createdAt;
    expect(task2).toEqual(exmpTask);
    expect(task2).toEqual(exmpTask);
    expect(await storageCapsule.save(2)).toBeFalsy();
  });

  it('shouldn`t be insert new task, if task limit exceeded, -> save()', async () => {
    storageCapsule.channel('channel-c');

    config.set('limit', 1);
    expect(await storageCapsule.isExceeded()).toBeFalsy();
    expect(await storageCapsule.save(exmpTask)).toBeTruthy();
    expect(await storageCapsule.isExceeded()).toBeTruthy();

    expect(await storageCapsule.save(exmpTask)).toBeFalsy();
    expect((await storageCapsule.fetch()).length).toEqual(1);

    config.set('limit', 2);
    expect(await storageCapsule.save(exmpTask)).toBeTruthy();
    expect((await storageCapsule.fetch()).length).toEqual(2);
    expect(await storageCapsule.save(exmpTask)).toBeFalsy();
  });

  it('should be update task in storage, -> update()', async () => {
    storageCapsule.channel('channel-d');
    await storageCapsule.save(exmpTask);
    const task = (await storageCapsule.storage.get('channel-d')).shift();
    expect(task.tag).toEqual(exmpTask.tag);
    const result = await storageCapsule.update(task._id, { tag: 'test2' });
    expect(result).toBeTruthy();
    const updatedTask = (await storageCapsule.storage.get('channel-d')).shift();
    expect(updatedTask.tag).toEqual('test2');
    const failResult = await storageCapsule.update(`${task._id}-1`, { tag: 'test3' });
    expect(failResult).toBeFalsy();
  });

  it('should be delete a payload from storage, -> delete()', async () => {
    storageCapsule.channel('channel-e');

    await storageCapsule.save(exmpTask);
    await storageCapsule.save(exmpTask);

    const tasks = await storageCapsule.storage.get('channel-e');
    const id = tasks.shift()._id;

    expect(await storageCapsule.delete(id)).toBeTruthy();

    const updatedTasks = await storageCapsule.storage.get('channel-e');
    expect(updatedTasks.findIndex(t => t._id === id)).toBeLessThan(0);
    expect(await storageCapsule.delete(423423)).toBeFalsy();
  });

  it('should be fetch workable tasks, -> fetch()', async () => {
    storageCapsule.channel('channel-f');

    expect((await storageCapsule.storage.get('test-1')).length).toBeLessThan(1);

    await storageCapsule.save(exmpTask);
    await storageCapsule.save(exmpTask);

    expect((await storageCapsule.fetch()).length).toEqual(2);

    const newTask = Object.assign({}, exmpTask, { locked: true });
    await storageCapsule.save(newTask);
    expect((await storageCapsule.fetch()).length).toEqual(2);

    const newTask2 = Object.assign({}, exmpTask, { freezed: true });
    await storageCapsule.save(newTask2);
    expect((await storageCapsule.fetch()).length).toEqual(2);

    await storageCapsule.save(exmpTask);
    expect((await storageCapsule.fetch()).length).toEqual(3);

    const newTask3 = Object.assign({}, exmpTask, { freezed: false });
    await storageCapsule.save(newTask3);
    expect((await storageCapsule.fetch()).length).toEqual(4);

    const newTask4 = Object.assign({}, exmpTask, { locked: false });
    await storageCapsule.save(newTask4);
    expect((await storageCapsule.fetch()).length).toEqual(5);
  });

  it('should be sort tasks by fifo/lifo, -> fetch()', async (done) => {
    storageCapsule.channel('channel-g');
    setTimeout(async () => {
      const newTask1 = Object.assign({}, exmpTask, { tag: 'test-1' });
      await storageCapsule.save(newTask1);
    }, 0);
    setTimeout(async () => {
      const newTask2 = Object.assign({}, exmpTask, { tag: 'test-2' });
      await storageCapsule.save(newTask2);
    }, 100);
    setTimeout(async () => {
      storageCapsule.config.set('principle', Queue.FIFO);
      expect((await storageCapsule.fetch())[0].tag).toEqual('test-1');
      storageCapsule.config.set('principle', Queue.LIFO);
      expect((await storageCapsule.fetch())[0].tag).toEqual('test-2');
      done();
    }, 101);
  });

  it('should be get all tasks, -> all()', async () => {
    storageCapsule.channel('channel-h');

    await storageCapsule.save(exmpTask);
    await storageCapsule.save(exmpTask);
    expect((await storageCapsule.all()).length).toEqual(2);

    const newTask1 = Object.assign({}, exmpTask, { freezed: true });
    await storageCapsule.save(newTask1);
    expect((await storageCapsule.all()).length).toEqual(3);
  });

  it('should be prepare a task, -> prepareTask()', () => {
    storageCapsule.channel('test-1');

    expect(exmpTask._id).not.toBeDefined();
    expect(exmpTask.createdAt).not.toBeDefined();

    const task = storageCapsule.prepareTask(exmpTask);

    expect(task._id).toBeDefined();
    expect(task.createdAt).toBeDefined();
  });

  it('should be generate unique id, -> generateId()', async () => {
    expect(typeof storageCapsule.generateId() === 'string').toBeTruthy();
  });

  it('should be remove storage by given channel name, -> clear', async () => {
    storageCapsule.channel('test-1');
    expect((await storageCapsule.all()).length).toEqual(0);

    await storageCapsule.save(exmpTask);
    await storageCapsule.save(exmpTask);

    expect((await storageCapsule.all()).length).toEqual(2);

    await storageCapsule.clear('test-1');

    expect((await storageCapsule.all()).length).toEqual(0);
  });
});
