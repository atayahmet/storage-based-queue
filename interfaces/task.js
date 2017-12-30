export interface ITask {
  handler: string;
  priority: number;
  createdAt: number;
  args: any;
}
