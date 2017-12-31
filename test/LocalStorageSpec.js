import LocalStorage from "../lib/storage/localstorage";
import Config from "../lib/config";

describe('Local Storage class tests', () => {
  let storage, config, exampleData;

  beforeEach(() => {
    config = new Config;
    storage = new LocalStorage(config);
    exampleData = [{type: 'message'}];
  });

  afterEach(() => {
    storage.clearAll();
  })

  it('should be set an item, -> set()', () => {
    storage.set('test', JSON.stringify(exampleData));
    const data = localStorage.getItem(`${config.get('prefix')}_test`);
    expect(Object.assign({}, JSON.parse(data))).toEqual(exampleData);
  });

  it('should be get an item, -> get()', () => {
    storage.set('test', 'Storage class');
    expect(storage.get('test').length).toBeLessThan(1);
  });

  it('should be clear all items, -> clearAll()', () => {
    storage.set('test', JSON.stringify(exampleData));
    expect(storage.get('test').length).toEqual(1);
    storage.clearAll();
    expect(storage.get('test').length).toEqual(0);
  });
});
