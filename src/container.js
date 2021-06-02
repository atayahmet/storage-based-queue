/* @flow */
import type { IContainer } from './interfaces/container';

export default class Container implements IContainer {
  store: { [property: string]: any } = {};

  // freeze(id: string): void {
  //   console.log(this, id);
  // }

  // add(value: any): void {
  //   console.log(this, value);
  // }

  /**
   * Check item in container
   *
   * @param  {String} id
   * @return {Boolean}
   *
   * @api public
   */
  has(id: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.store, id);
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
    return this.store[id];
  }

  /**
   * Get all items from container
   *
   * @return {Object}
   *
   * @api public
   */
  all(): any {
    return this.store;
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
    this.store[id] = value;
  }

  /**
   * Merge continers
   *
   * @param  {Object} data
   * @return {void}
   *
   * @api public
   */
  merge(data: { [property: string]: any } = {}): void {
    this.store = { ...this.store, ...data };
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
    if (!this.has(id)) return false;
    return delete this.store[id];
  }

  /**
   * Remove all items from container
   *
   * @return {void}
   *
   * @api public
   */
  removeAll(): void {
    this.store = {};
  }
}
