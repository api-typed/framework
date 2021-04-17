import { Config } from '@api-typed/config';

export interface HasEntitySubscribers {
  /**
   * Load and return a list of entity subscribers that this module should
   * register.
   *
   * @param config Config instance for convenience.
   */
  loadEntitySubscribers(config: Config): (Function | string)[];
}
