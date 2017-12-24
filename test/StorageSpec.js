import StorageCapsule from "../lib/storage-capsule";
import LocalStorage from "../lib/storage/localstorage";
import Config from "../lib/config";

describe('Storage capsule class tests', () => {

  const config = new Config;
  const lStorage = new LocalStorage(config);
  let storage, exmpTask;

  beforeEach(() => {
    exmpTask = {tag: 'test', handler: 'SendEmail', priority: 1, args: 'jobs args 2'};
    storage = new StorageCapsule(config, lStorage);
    lStorage.clear('test-1');
    lStorage.clear('test-2');
  });

  afterEach(() => {
    config.set('limit', -1);
  });

  it('should be select channel, -> channel()', () => {
    storage.channel('test-1');
    expect(storage.storageChannel).toEqual('test-1');

    storage.channel('test-2');
    expect(storage.storageChannel).toEqual('test-2');
  });

  it('should be save task payload to storage, -> save()', () => {
    storage.channel('test-1');
    storage.save(exmpTask);
    expect(lStorage.get('test-1').shift()).toEqual(exmpTask);

    storage.channel('test-2');

    const task = lStorage.get('test-1').shift();
    expect(task).toEqual(exmpTask);

    expect(task._id).toBeDefined();
    expect(task.createdAt).toBeDefined();
  });

  it('should be not insert new task, if task limit exceeded, -> save()', () => {
    storage.channel('test-1');

    config.set('limit', 1);
    spyOn(storage, 'isExceeded').andReturn(false).andCallThrough();
    expect(storage.save(exmpTask)).toBeTruthy();

    expect(storage.save(exmpTask)).toBeFalsy();
    expect(storage.fetch().length).toEqual(1);

    config.set('limit', 2);
    expect(storage.save(exmpTask)).toBeTruthy();
    expect(storage.fetch().length).toEqual(2);
    expect(storage.save(exmpTask)).toBeFalsy();
  });

  it('should be update task in storage, -> update()', () => {
    storage.channel('test-1');
    storage.save(exmpTask);

    const task = lStorage.get('test-1').shift();
    expect(task.tag).toEqual(exmpTask.tag);

    const result = storage.update(task._id, {tag: 'test2'});

    expect(result).toBeTruthy();

    const updatedTask = lStorage.get('test-1').shift();
    expect(updatedTask.tag).toEqual('test2');

    const failResult = storage.update(task._id+'-1', {tag: 'test3'});
    expect(failResult).toBeFalsy();
  });

  it('should be delete a payload from storage, -> delete()', () => {
    storage.channel('test-1');
    storage.save(exmpTask);
    storage.save(exmpTask);

    const tasks = lStorage.get('test-1');
    const id = tasks.shift()._id;

    expect(storage.delete(id)).toBeTruthy();

    const updatedTasks = lStorage.get('test-1');
    expect(updatedTasks.findIndex(t => t._id === id)).toBeLessThan(0);
  });

  it('should be fetch workable tasks, -> fetch()', () => {
    storage.channel('test-1');

    expect(lStorage.get('test-1').length).toBeLessThan(1);

    storage.save(exmpTask);
    storage.save(exmpTask);

    expect(storage.fetch().length).toEqual(2);

    const newTask = Object.assign({}, exmpTask, {locked: true});
    storage.save(newTask);
    expect(storage.fetch().length).toEqual(2);

    const newTask2 = Object.assign({}, exmpTask, {freezed: true});
    storage.save(newTask2);
    expect(storage.fetch().length).toEqual(2);

    storage.save(exmpTask);
    expect(storage.fetch().length).toEqual(3);

    const newTask3 = Object.assign({}, exmpTask, {freezed: false});
    storage.save(newTask3);
    expect(storage.fetch().length).toEqual(4);

    const newTask4 = Object.assign({}, exmpTask, {locked: false});
    storage.save(newTask4);
    expect(storage.fetch().length).toEqual(5);
  });

  it('should be get all tasks, -> all()', () => {
    storage.channel('test-1');

    storage.save(exmpTask);
    storage.save(exmpTask);

    expect(storage.all().length).toEqual(2);

    const newTask1 = Object.assign({}, exmpTask, {freezed: true});
    storage.save(newTask1);
    expect(storage.all().length).toEqual(3);
  });

  it('should be prepare a task, -> prepareTask()', () => {
    storage.channel('test-1');

    expect(exmpTask._id).not.toBeDefined();
    expect(exmpTask.createdAt).not.toBeDefined();

    const task = storage.prepareTask(exmpTask);

    expect(task._id).toBeDefined();
    expect(task.createdAt).toBeDefined();
  });

  it('should be generate unique id, -> generateId()', () => {
    expect(typeof(storage.generateId()) === 'string').toBeTruthy();
  });

  it('should be remove storage by given channel name, -> clear', () => {
    storage.channel('test-1');
    expect(storage.all().length).toEqual(0);

    storage.save(exmpTask);
    storage.save(exmpTask);

    expect(storage.all().length).toEqual(2);

    storage.clear('test-1');

    expect(storage.all().length).toEqual(0);
  });
});
