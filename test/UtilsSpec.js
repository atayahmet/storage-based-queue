import * as utils from "../lib/utils";

describe('Utils functions tests', () => {

  function exampleFunc() {
    this.test = 'Hello';
  }
  exampleFunc.prototype.run = function() {
    this.test2 = 'World';
  }

  it('should be clone an function, -> clone()', () => {
    const exmp1 = new exampleFunc;
    const exmp2 = new exampleFunc;
    expect(utils.clone(exmp1)).toEqual(exmp2);
    expect(exmp1.test).toEqual(exmp2.test);

    exmp1.test = 'Hi!';
    expect(exmp1.test).not.toEqual(exmp2.test);
  });

  it('should be check property in an object, -> hasProperty()', () => {
    const a = {a: 'Hello World'};
    expect(utils.hasProperty(a, 'a')).toBeTruthy();
    expect(utils.hasProperty(a, 'b')).toBeFalsy();
  });

  it('should be check method in a function, -> hasMethod()', () => {
    const exmp1 = new exampleFunc;
    expect(utils.hasMethod(exmp1, 'run')).toBeTruthy();
    expect(utils.hasMethod(exmp1, 'run2')).toBeFalsy();
  });

  it('should be check a variable whether function, -> isFunction()', () => {
    const exmp1 = new exampleFunc;
    expect(utils.isFunction(exmp1.run)).toBeTruthy();
    expect(utils.isFunction(exmp1.test)).toBeFalsy();
  });

  it('should be check specific keys in object, -> exludeSpecificTask()', () => {
    const task = {freezed: true, locked: true, worker: 'SendEmail' };
    expect(utils.excludeSpecificTasks(task)).toBeFalsy();

    delete task.freezed;
    delete task.locked;

    expect(utils.excludeSpecificTasks(task)).toBeTruthy();

    task.freezed = true;
    expect(utils.excludeSpecificTasks(task)).toBeFalsy();
  });
});
