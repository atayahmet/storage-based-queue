// @flow
export interface IContainer {
  // add(value: any): void;
  has(id: string): boolean;
  get(id: string): any;
  all(): Object;
  bind(id: string, value: any): void;
  // freeze(id: string): void;
}
