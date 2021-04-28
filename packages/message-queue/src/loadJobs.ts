import { globRequire } from '@api-typed/common';
import { JobInterface } from './JobInterface';

export const loadJobs = (pattern: string): JobInterface[] => {
  return Object.values(globRequire(pattern) as Record<string, JobInterface>);
};
