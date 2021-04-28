import { Config } from '@api-typed/config';
import { JobInterface } from './JobInterface';

export interface HasJobs {
  /**
   * Load and return a list of jobs that this module should register.
   *
   * @param config Config instance for convenience.
   */
  loadJobs(config: Config): JobInterface[];
}
