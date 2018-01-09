/* @flow */
import type IContainer from '../interfaces/container';

export default class Container implements IContainer {

  constructor() {}

  _container: {[property: string]: any} = {};

  has(id: string): boolean {
    return Object.prototype.hasOwnProperty.call(this._container, id);
  }

  get(id: string): any {
    return this._container[id];
  }

  all() {
    return this._container;
  }

  bind(id: string, value: any): void {
    this._container[id] = value;
  }

  remove(id: string): boolean {
    if (! this.has(id)) return false;
    return delete this._container[id];
  }

  removeAll(): void {
    this._container = {};
  }
}
