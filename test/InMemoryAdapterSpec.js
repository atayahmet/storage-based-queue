import InMemoryAdapter from './../src/adapters/inmemory';
import Config from './../src/config';

describe('InMemoryAdapter tests', () => {
  const getKey = suffix => `${config.get('prefix')}_${suffix}`;
  const config = new Config();
  const storageAdapter = new InMemoryAdapter(config);

  afterAll(() => {
    storageAdapter.store = {};
  });

  it('it should be set an item, -> set()', async () => {
    const data = ['hello', 'world'];
    const result = await storageAdapter.set('hello', data);
    expect(result).toEqual(data);
    expect(Object.keys(storageAdapter.store).includes(getKey('hello'))).toBeTruthy();
    expect(storageAdapter.store[getKey('hello')]).toEqual(data);
  });

  it('it should be get an item from storage, -> get()', async () => {
    await storageAdapter.set('test-1', ['test-1', 'value']);
    expect(await storageAdapter.get('test-1')).toEqual(['test-1', 'value']);
  });

  it('it should be check item key, -> has()', async () => {
    expect(await storageAdapter.has('test-2')).toBeFalsy();
    expect(Object.keys(storageAdapter.store).includes(getKey('test-2'))).toBeFalsy();
    await storageAdapter.set('test-2', ['hello', 'world']);
    expect(await storageAdapter.has('test-2')).toBeTruthy();
    expect(Object.keys(storageAdapter.store).includes(getKey('test-2'))).toBeTruthy();
  });

  it('should be remove an item from storage, -> clear()', async () => {
    await storageAdapter.set('test-3', ['hello', 'world']);
    expect(await storageAdapter.has('test-3')).toBeTruthy();
    expect(Object.keys(storageAdapter.store).includes(getKey('test-3'))).toBeTruthy();
    expect(await storageAdapter.clear('test-3')).toBeTruthy();
    expect(await storageAdapter.has('test-3')).toBeFalsy();
    expect(Object.keys(storageAdapter.store).includes(getKey('test-3'))).toBeFalsy();
    expect(await storageAdapter.clear('test-4xxx')).toBeFalsy();
  });

  it('should be get collection and create a new collection if not exists', () => {
    expect(storageAdapter.store[getKey('test-4')]).not.toBeDefined();
    const collection = storageAdapter.getCollection('test-4');
    expect(storageAdapter.store['test-4']).toBeDefined();
    expect(Array.isArray(collection)).toBeTruthy();
  });
});
