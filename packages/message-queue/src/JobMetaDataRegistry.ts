import { ClassName, classNameToString } from '@api-typed/common';
import { JobsOptions } from 'bullmq';
import omit from 'lodash.omit';
import uniq from 'lodash.uniq';
import { JobInterface } from './JobInterface';

export type GenerateJobIdFunction<T extends JobInterface = any> = (
  ...args: Parameters<T['run']>
) => string;

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
    // @todo check for name conflicts
    this.jobs.push({
      target,
      name,
      queue,
      generateId,
      jobOptions: omit(options, 'name', 'queue'),
    });
  }

  public getJobMetaData(target: ClassName): JobMetaData;
  public getJobMetaData(name: string): JobMetaData;
  public getJobMetaData(targetOrName: ClassName | string): JobMetaData {
    const predicate =
      typeof targetOrName === 'string'
        ? (job: JobMetaData) => job.name === targetOrName
        : (job: JobMetaData) => job.target === targetOrName;

    const job = this.jobs.find(predicate);

    if (!job) {
      const name =
        typeof targetOrName === 'string'
          ? targetOrName
          : classNameToString(targetOrName);
      throw new Error(`Could not find meta data for job "${name}"`);
    }

    return job;
  }

  public getAllMetaData(): JobMetaData[] {
    return this.jobs;
  }

  public getQueueNames(): string[] {
    const queueNames = this.getAllMetaData().map((job) => job.queue);
    return uniq(queueNames);
  }
}

export default JobMetaDataRegistry.defaultInstance;
