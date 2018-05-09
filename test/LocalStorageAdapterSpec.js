import LocalStorageAdapter from './../src/adapters/localstorage';
import Config from './../src/config';

describe('LocalStorageAdapter tests', () => {
  const getKey = suffix => `${config.get('prefix')}_${suffix}`;
  const config = new Config();
  const storageAdapter = new LocalStorageAdapter(config);

  afterAll(() => {
    storageAdapter.store = {};
  });

  it('it should be set an item, -> set()', async () => {
    const data = ['hello', 'world'];
    const result = await storageAdapter.set('hello', data);
    expect(result).toEqual(data);
    expect(Object.keys(localStorage).includes(getKey('hello'))).toBeTruthy();
    const dataInStorage = JSON.parse(localStorage[getKey('hello')]);
    expect([...dataInStorage]).toEqual(data);
  });

  it('it should be get an item from storage, -> get()', async () => {
    await storageAdapter.set('test-1', ['test-1', 'value']);
    expect(await storageAdapter.get('test-1')).toEqual(['test-1', 'value']);
  });

  it('it should be check item key, -> has()', async () => {
    expect(await storageAdapter.has('test-2')).toBeFalsy();
    expect(Object.keys(localStorage).includes(getKey('test-2'))).toBeFalsy();
    await storageAdapter.set('test-2', ['hello', 'world']);
    expect(await storageAdapter.has('test-2')).toBeTruthy();
    expect(Object.keys(localStorage).includes(getKey('test-2'))).toBeTruthy();
  });

  it('should be remove an item from storage, -> clear()', async () => {
    await storageAdapter.set('test-3', ['hello', 'world']);
    expect(await storageAdapter.has('test-3')).toBeTruthy();
    expect(Object.keys(localStorage).includes(getKey('test-3'))).toBeTruthy();
    expect(await storageAdapter.clear('test-3')).toBeTruthy();
    expect(await storageAdapter.has('test-3')).toBeFalsy();
    expect(Object.keys(localStorage).includes(getKey('test-3'))).toBeFalsy();
    expect(await storageAdapter.clear('test-4xxx')).toBeFalsy();
  });
});
