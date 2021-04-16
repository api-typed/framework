import { Config } from '@api-typed/config';

export interface HasCommands {
  /**
   * Load and return a list of commands that this module should register.
   *
   * @param config Config instance for convenience.
   */
  loadCommands(config: Config): Function[];
}
