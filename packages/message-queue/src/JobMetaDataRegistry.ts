import { ClassName } from '@api-typed/common';
import { JobsOptions } from 'bullmq';
import omit from 'lodash.omit';

export type GenerateJobIdFunction = (...args: unknown[]) => string;

interface JobMetaData {
  target: ClassName;
  name: string;
  queue: string;
  generateId?: GenerateJobIdFunction;
  jobOptions?: JobsOptions;
}

export class JobMetaDataRegistry {
  public static readonly defaultInstance = new JobMetaDataRegistry();

  private jobs: JobMetaData[] = [];

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

  public getJobsMetaData(): JobMetaData[] {
    return this.jobs;
  }
}

export default JobMetaDataRegistry.defaultInstance;
