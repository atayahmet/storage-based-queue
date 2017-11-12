export interface IStorage {
  get(name: string): {[property: string]: any}|null;
  set(key: string, value: string): void;
  has(key: string): boolean;
}
