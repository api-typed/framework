export interface CommandInterface {
  run(...args: any[]): number | void | Promise<number | void>;
}
