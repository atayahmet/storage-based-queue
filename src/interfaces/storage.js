// @flow
import type { ITask } from './task';

export interface IStorage {
  get(name: string): Promise<ITask[]>;
  set(key: string, value: any[]): Promise<any>;
  has(key: string): Promise<boolean>;
  clear(key: string): Promise<any>;
}
