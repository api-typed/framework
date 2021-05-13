/**
 * Should be applied to any class that wants to be registered as a command.
 */
export interface CommandInterface {
  /**
   * Command execution handler.
   *
   * Will be called with arguments from the command line and an options object
   * as last parameter.
   *
   * Should either return nothing or a number.
   *
   * If a number is returned then it will be used as the exit code for the whole
   * process.
   *
   * Can also by an async function that returns a Promise that resolves with
   * void or number.
   */
  run(...args: any[]): number | void | Promise<number | void>;
}
