import Container from "../lib/container";

describe('Container class tests', () => {
  let container, defaultCallback, spyCb;

  beforeEach(() => {
    container = new Container;
    defaultCallback = () => { return 'Hello World'; };
    spyCb = jasmine.createSpy('testWildcard');
    container.bind('item1', spyCb);
  });

  it('should be bind new item to custom key, -> bind()', () => {
    container._container.item1.call();
    expect(spyCb).toEqual(spyCb);
    expect(spyCb).toHaveBeenCalled();
  });

  it('should be get an item, -> get()', () => {
    expect(container.get('item1')).toEqual(spyCb);
    expect(container._container.item1).toEqual(spyCb);
  });

  it('should be get all items, -> all()', () => {
    container.bind('item2', spyCb);
    expect(Object.keys(container.all()).length).toEqual(2)
  });

  it('should be check items, -> has()', () => {
    expect(container.has('item1')).toBeTruthy();
    container.remove('item1');
    expect(container.has('item1')).toBeFalsy();
  });

  it('should be remove an item by item key, -> remove()', () => {
    expect('item1' in container._container).toBeTruthy();
    container.remove('item1');
    expect('item1' in container._container).toBeFalsy();

    expect(container.remove('item2')).toBeFalsy();
  });

  it('should be remove all items, -> removeAll()', () => {
    container.bind('item1', spyCb);
    expect(container.has('item1')).toBeTruthy();
    container.removeAll();
    expect(container.has('item1')).toBeFalsy();
  });
});
