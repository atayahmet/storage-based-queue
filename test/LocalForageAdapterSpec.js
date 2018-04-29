import localforage from 'localforage';
import LocalForageAdapter from './../src/adapters/localforage';
import Config from './../src/config';

describe('LocalForageAdapter tests', () => {
  const getKey = suffix => `${config.get('prefix')}_${suffix}`;
  const config = new Config();
  const storageAdapter = new LocalForageAdapter(config);

  afterAll(async () => {
    await storageAdapter.clearAll();
  });

  it('it should be set an item, -> set()', async () => {
    const result = await storageAdapter.set('hello', 'world');
    expect(result).toEqual('world');
    expect((await localforage.keys()).includes(getKey('hello'))).toBeTruthy();
    expect(await localforage.getItem(getKey('hello'))).toEqual('world');

    const result2 = await storageAdapter.set('hello2', JSON.stringify(['world']));
    expect(Array.isArray(await storageAdapter.get('hello2'))).toBeTruthy();
  });

  it('it should be get an item from storage, -> get()', async () => {
    await storageAdapter.set('test-1', ['test-1', 'value']);
    expect(await storageAdapter.get('test-1')).toEqual(['test-1', 'value']);
  });

  it('it should be check item key, -> has()', async () => {
    expect(await storageAdapter.has('test-2')).toBeFalsy();
    expect((await localforage.keys()).includes(getKey('test-2'))).toBeFalsy();
    await storageAdapter.set('test-2', ['hello', 'world']);
    expect(await storageAdapter.has('test-2')).toBeTruthy();
    expect((await localforage.keys()).includes(getKey('test-2'))).toBeTruthy();
  });

  it('should be remove an item from storage, -> clear()', async () => {
    await storageAdapter.set('test-3', ['hello', 'world']);
    expect(await storageAdapter.has('test-3')).toBeTruthy();
    expect((await localforage.keys()).includes(getKey('test-3'))).toBeTruthy();
    await storageAdapter.clear('test-3');
    expect(await storageAdapter.has('test-3')).toBeFalsy();
    expect((await localforage.keys()).includes(getKey('test-3'))).toBeFalsy();
  });

  it('should be remove all items, -> clearAll()', async () => {
    await storageAdapter.set('test-4', ['hello', 'world']);
    await storageAdapter.clearAll();
    console.log('YYYY->', await storageAdapter.clearAll(), await storageAdapter.get('test-4'));
    console.log('eeR->', await storageAdapter.get('test-4'));
    expect(await storageAdapter.has('test-4')).toBeFalsy();
    expect((await localforage.keys()).includes(getKey('test-4'))).toBeFalsy();
  });
});
