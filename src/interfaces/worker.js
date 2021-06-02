// @flow
export interface IWorker {
  [key: string]: any;
  priority: number;
  retry: number;
  handle(args: any): any;
  before(args: any): void;
  after(args: any): void;
}
