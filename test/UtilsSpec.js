import * as utils from '../src/utils';

describe('Utils functions tests', () => {
  function exampleFunc() {
    this.test = 'Hello';
  }

  exampleFunc.prototype.run = function () {
    this.test2 = 'World';
  };

  it('should be check property in an object, -> hasProperty()', () => {
    const a = { a: 'Hello World' };
    expect(utils.hasProperty(a, 'a')).toBeTruthy();
    expect(utils.hasProperty(a, 'b')).toBeFalsy();
  });

  it('should be check method in a function, -> hasMethod()', () => {
    const exmp1 = new exampleFunc();
    expect(utils.hasMethod(exmp1, 'run')).toBeTruthy();
    expect(utils.hasMethod(exmp1, 'run2')).toBeFalsy();
  });

  it('should be check a variable whether function, -> isFunction()', () => {
    const exmp1 = new exampleFunc();
    expect(utils.isFunction(exmp1.run)).toBeTruthy();
    expect(utils.isFunction(exmp1.test)).toBeFalsy();
  });

  it('should be check specific keys in object, -> exludeSpecificTask()', () => {
    const task = { freezed: true, locked: true, worker: 'SendEmail' };
    expect(utils.excludeSpecificTasks(task)).toBeFalsy();

    delete task.freezed;
    delete task.locked;

    expect(utils.excludeSpecificTasks(task)).toBeTruthy();

    task.freezed = true;
    expect(utils.excludeSpecificTasks(task)).toBeFalsy();
  });

  it('should be check specific tags in object, -> utilClearByTag()', () => {
    const task = {
      tag: 'test',
      freezed: true,
      locked: true,
      worker: 'SendEmail',
    };

    expect(utils.utilClearByTag(task)).toBeFalsy();

    task.locked = false;
    expect(utils.utilClearByTag.call('test', task)).toBeTruthy();
    expect(utils.utilClearByTag.call('test2', task)).toBeFalsy();
  });
});
