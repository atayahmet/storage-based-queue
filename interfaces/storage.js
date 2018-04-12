export interface IStorage {
  get(name: string): Promise<ITask[]>|null;
  set(key: string, value: string): Promise<any>;
  has(key: string): Promise<boolean>;
}
