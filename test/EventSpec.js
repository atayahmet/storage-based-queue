import Event from '../lib/event';

describe("Event manager tests", function() {

  let defaultCallback, event, exampleArgs;

  beforeEach(() => {
    defaultCallback = () => {};
    exampleArgs = {ninja: 'Hello World!'};
    event = new Event;
    event.on('test:before', defaultCallback);
    event.on('test2:before', defaultCallback);
    event.on('test:after', defaultCallback);
    event.on('test2:after', defaultCallback);
    event.on('test:retry', defaultCallback);
    event.on('test2:retry', defaultCallback);
    event.on('error', defaultCallback);
    event.on('*', defaultCallback);
    event.on('test:*', defaultCallback);
    event.on('test2:*', defaultCallback);
  });

  afterEach(() => {
    event = null;
  });

  it("should be return true or false as result about the events, -> has()", () => {
    expect('test' in event.store.before).toBeTruthy();
    expect(event.has('test:before')).toBeTruthy();

    expect('test2' in event.store.before).toBeTruthy();
    expect(event.has('test2:before')).toBeTruthy();

    expect('test' in event.store.after).toBeTruthy();
    expect(event.has('test:after')).toBeTruthy();

    expect('test2' in event.store.after).toBeTruthy();
    expect(event.has('test2:after')).toBeTruthy();

    expect('test' in event.store.retry).toBeTruthy();
    expect(event.has('test:retry')).toBeTruthy();

    expect('test2' in event.store.retry).toBeTruthy();
    expect(event.has('test2:retry')).toBeTruthy();

    expect('test' in event.store['*']).toBeTruthy();
    expect(event.has('test:*')).toBeTruthy();

    expect('test2' in event.store['*']).toBeTruthy();
    expect(event.has('test2:*')).toBeTruthy();

    expect('*' in event.store).toBeTruthy();
    expect(event.has('*')).toBeTruthy();

    expect('error' in event.store).toBeTruthy();
    expect(event.has('error')).toBeTruthy();

    expect(event.has('test3:before')).toBeFalsy();
  });

  it("should be register events, -> on()", function() {
    expect(event.store.before.test.toString()).toContain('defaultCallback');
    expect(event.store.after.test.toString()).toContain('defaultCallback');
    expect(event.store.retry.test.toString()).toContain('defaultCallback');
    expect(event.store['*'].test.toString()).toContain('defaultCallback');
    expect(event.store.wildcard['*'].toString()).toContain('defaultCallback');
    expect(event.store.wildcard.error.toString()).toContain('defaultCallback')
  });

  it("should be add new event, -> add()", () => {
    spyOn(event, 'add');
    event.on('test:before', defaultCallback);
    expect(event.add).toHaveBeenCalledWith('test:before', defaultCallback)
  });

  it("should not be add new event, -> add()", () => {
    spyOn(event, 'add');
    event.on('test:before2', defaultCallback);
    expect(event.has('test:before2')).toBeFalsy();
    expect(event.add).not.toHaveBeenCalled();
  });

  it("should be get the event name, -> getName()", () => {
    expect(event.getName('test:before')).toEqual('test');
    expect(event.getName('test2:before')).toEqual('test2');
  });

  it('should be get the event type, -> getType()', () => {
    expect(event.getType('test:before')).toEqual('before');
    expect(event.getType('test:after')).toEqual('after');
  });

  it('should be validate event pattern, -> isValid()', () => {
    expect(event.isValid('test:test')).toBeFalsy();
    expect(event.isValid('test:before')).toBeTruthy();
    expect(event.isValid('test:*')).toBeTruthy();
    expect(event.isValid('*')).toBeTruthy();
  });

  it('should be emit the event, -> emit()', () => {
    const testBefore = jasmine.createSpy('testBefore');
    event.on('test:before', testBefore);
    event.emit('test:before');
    expect(testBefore).toHaveBeenCalled();

    const testAfter = jasmine.createSpy('testAfter');
    event.on('test:before', testBefore);
    event.emit('test:before');
    expect(testBefore).toHaveBeenCalled();
  });

  it('should be emit the error event, -> emit()', () => {
    const testError = jasmine.createSpy('testError');
    event.on('error', testError);
    event.emit('error', exampleArgs);
    expect(testError).toHaveBeenCalledWith('error', exampleArgs);
  });

  it('should be emit the wildcard events, ->emit()', () => {
    const testWildcard = jasmine.createSpy('testWildcard');
    event.on('*', testWildcard);

    event.emit('test:before', exampleArgs);
    expect(testWildcard).toHaveBeenCalledWith('test:before', exampleArgs);
    event.emit('test:after', exampleArgs);
    expect(testWildcard).toHaveBeenCalledWith('test:after', exampleArgs);
    event.emit('test:retry', exampleArgs);
    expect(testWildcard).toHaveBeenCalledWith('test:retry', exampleArgs);
    event.emit('test:*', exampleArgs);
    expect(testWildcard).toHaveBeenCalledWith('test:*', exampleArgs);
    event.emit('error', exampleArgs);
    expect(testWildcard).toHaveBeenCalledWith('error', exampleArgs);
  });
});
