// @flow
export interface IConfig {
  [key: string]: any;
  storage: string;
  prefix: string;
  timeout: number;
  limit: number;
  principle: string;
  get(id: string): any;
}
