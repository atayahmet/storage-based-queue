/* @flow */
import type IContainer from '../interfaces/container';

export default class Container implements IContainer {

  constructor() {}

  _container: {[property: string]: any} = {};

  /**
   * Check item in container
   *
   * @param  {String} id
   * @return {Boolean}
   *
   * @api public
   */
  has(id: string): boolean {
    return Object.prototype.hasOwnProperty.call(this._container, id);
  }

  /**
   * Get item from container
   *
   * @param  {String} id
   * @return {Any}
   *
   * @api public
   */
  get(id: string): any {
    return this._container[id];
  }

  /**
   * Get all items from container
   *
   * @return {Object}
   *
   * @api public
   */
  all() {
    return this._container;
  }

  /**
   * Add item to container
   *
   * @param  {String} id
   * @param  {Any} value
   * @return {void}
   *
   * @api public
   */
  bind(id: string, value: any): void {
    this._container[id] = value;
  }

  /**
   * Remove item from container
   *
   * @param  {String} id
   * @return {Boolean}
   *
   * @api public
   */
  remove(id: string): boolean {
    if (! this.has(id)) return false;
    return delete this._container[id];
  }

  /**
   * Remove all items from container
   *
   * @return {void}
   *
   * @api public
   */
  removeAll(): void {
    this._container = {};
  }
}
