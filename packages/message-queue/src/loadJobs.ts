import { globRequire } from '@api-typed/common';
import { JobInterface } from './JobInterface';

/**
 * Easily load jobs from a directory using a glob pattern.
 *
 * @param pattern Glob pattern.
 */
export const loadJobs = (pattern: string): JobInterface[] => {
  return Object.values(globRequire(pattern) as Record<string, JobInterface>);
};
