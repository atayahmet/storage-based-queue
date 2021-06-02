// @flow
export interface IJob {
  handler: any
}

export interface IJobInstance {
  priority: number;
  retry: number;
  handle(args: any): any;
  before(args: any): void;
  after(args: any): void;
}
