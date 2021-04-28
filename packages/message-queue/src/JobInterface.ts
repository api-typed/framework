export interface JobInterface {
  run(...args: unknown[]): void | Promise<void>;
}
