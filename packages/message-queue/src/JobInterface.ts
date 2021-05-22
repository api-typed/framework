/**
 * Should be applied to any class that wants to be registered as a job handler.
 */
export interface JobInterface {
  /**
   * Job handler method.
   *
   * Will be called with the same arguments that were passed as a job payload.
   *
   * Can be (and most probably is) async.
   */
  run(...args: unknown[]): void | Promise<void>;
}
