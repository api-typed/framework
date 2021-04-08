import { Config } from '@api-typed/config';

export interface HasMiddlewares {
  /**
   * Load and return a list of middlewares from this module that should be
   * applied globally.
   *
   * @param config Config instance for convenience.
   */
  loadMiddlewares(config: Config): Function[];
}
