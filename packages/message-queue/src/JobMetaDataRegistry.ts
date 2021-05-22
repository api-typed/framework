import { ClassName, classNameToString } from '@api-typed/common';
import { JobsOptions } from 'bullmq';
import omit from 'lodash.omit';
import uniq from 'lodash.uniq';
import { JobInterface } from './JobInterface';

/**
 * Function that is called before adding a job to a queue. Should return
 * a string that will be the new job's ID.
 *
 * The same params that are passed to the job handler's `run()` method are
 * passed to this function, so the ID can be based on the job payload.
 */
export type GenerateJobIdFunction<T extends JobInterface = any> = (
  ...args: Parameters<T['run']>
) => string;

/**
 * Job configuration.
 */
interface JobMetaData {
  /**
   * Class or class constructor that should be registered as a job handler.
   */
  target: ClassName;
  /**
   * Name of the job.
   */
  name: string;
  /**
   * Name of the queue on which the jobs for this handler are added.
   */
  queue: string;
  /**
   * A function to generate job's ID.
   */
  generateId?: GenerateJobIdFunction;
  /**
   * Any other job options.
   */
  jobOptions?: JobsOptions;
}

/**
 * Keeps registry of all known jobs and their configuration.
 */
export class JobMetaDataRegistry {
  /**
   * Default shared instance of the JobMetaDataRegistry that is used by the
   * `@Job()` decorator.
   */
  public static readonly defaultInstance = new JobMetaDataRegistry();

  /**
   * List of all registered jobs.
   */
  private jobs: JobMetaData[] = [];

  /**
   * Register a class to be a job handler.
   *
   * @param target Class or class constructor that should be registered as a job
   *               handler.
   * @param name Name of the job it should handle.
   * @param queue Name of the queue to which the jobs will be added.
   * @param generateId A function that will be used to generate the job's ID.
   * @param options Any other job options.
   */
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

  /**
   * Get meta data of a job.
   *
   * @param target Job handler class.
   */
  public getJobMetaData(target: ClassName): JobMetaData;
  /**
   * Get meta data of a job.
   *
   * @param name Job name.
   */
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

  /**
   * Get all the jobs meta data.
   */
  public getAllMetaData(): JobMetaData[] {
    return this.jobs;
  }

  /**
   * Extract names of all known queues from all the registered jobs.
   */
  public getQueueNames(): string[] {
    const queueNames = this.getAllMetaData().map((job) => job.queue);
    return uniq(queueNames);
  }
}

export default JobMetaDataRegistry.defaultInstance;
