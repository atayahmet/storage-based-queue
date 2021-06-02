// @flow
export interface ITask {
  [key: string]: string;
  _id: string;
  tag: string;
  freezed: boolean;
  locked: boolean;
  handler: string;
  priority: number;
  createdAt: number;
  args: any;
  unique: boolean;
  tried: number;
  retry: number;
  sort(prop: any): any;
}
