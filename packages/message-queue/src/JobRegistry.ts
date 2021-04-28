import { ClassName } from '@api-typed/common';
import { JobsOptions } from 'bullmq';
import omit from 'lodash.omit';

export type GenerateJobIdFunction = (...args: unknown[]) => string;

interface JobMetadata {
  target: ClassName;
  name: string;
  queue: string;
  generateId?: GenerateJobIdFunction;
  jobOptions?: JobsOptions;
}

export class JobRegistry {
  public static readonly defaultInstance = new JobRegistry();

  private jobs: JobMetadata[] = [];

  public register(
    target: ClassName,
    name: string,
    queue = 'default',
    generateId?: GenerateJobIdFunction,
    options?: JobsOptions,
  ) {
    this.jobs.push({
      target,
      name,
      queue,
      generateId,
      jobOptions: omit(options, 'name', 'queue'),
    });
  }

  public getJobsMetadata(): JobMetadata[] {
    return this.jobs;
  }
}

export default JobRegistry.defaultInstance;
