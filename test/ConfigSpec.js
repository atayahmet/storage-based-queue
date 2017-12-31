import Config from "../lib/config";

describe('Config class tests', () => {
  let config;

  beforeEach(() => {
    config = new Config({})
    config.set('test', true);
  });

  it('should be set new item, ->set()', () => {
    config.set('test2', true);
    expect(config.config.test2).toEqual(true);
  });

  it('should be get an item, -> get()', () => {
    expect(config.get('test')).toBeTruthy(config.config.test);
  });

  it('should be check an item, ->has()', () => {
    expect(config.has('test')).toBeTruthy();
    config.remove('test');
    expect(config.has('test')).toBeFalsy();
  });

  it('should be merge multiple config objects, -> merge()', () => {
    config.merge({test2: false, test3: true});
    expect(config.has('test2')).toBeTruthy();
    expect(config.get('test2')).toBeFalsy();
    expect(config.has('test3')).toBeTruthy();
    expect(config.get('test3')).toBeTruthy();
  });

  it('should be remove an item, -> remove()', () => {
    config.merge({test2: false});
    expect(config.has('test2')).toBeTruthy();
    config.remove('test2');
    expect(config.has('test2')).toBeFalsy();
  });

  it('should be get all items', () => {
    expect(config.all()).toEqual(config.config);
  });

  afterEach(() => {
    config = null;
  });
});
