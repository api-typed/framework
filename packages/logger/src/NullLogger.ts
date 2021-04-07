import { AbstractLogger } from './AbstractLogger';

/**
 * Logger that doesn't log anything!
 *
 * Useful for tests or default values of parameters.
 */
export class NullLogger extends AbstractLogger {
  public log(): void {
    // noop
  }
}
