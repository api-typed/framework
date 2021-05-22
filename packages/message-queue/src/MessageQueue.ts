import { ClassName } from '@api-typed/common';
import { LoggerInterface, NullLogger } from '@api-typed/logger';
import {
  ConnectionOptions,
  Job,
  JobsOptions,
  Queue,
  RepeatOptions,
} from 'bullmq';
import { JobInterface } from './JobInterface';
import { JobMetaDataRegistry } from './JobMetaDataRegistry';

export interface MessageQueueOptions {
  /**
   * Redis connection configuration or redisio connection itself.
   */
  connection?: ConnectionOptions;
}

/**
 * Adds jobs to their configured queues.
 */
export class MessageQueue {
  private readonly queues: Record<string, Queue> = {};

  constructor(
    /**
     * Registry of all jobs and their metadata. The registry is required for
     * proper routing of jobs to their queues.
     *
     * By default it uses a global exported default instance of
     * JobMetaDataRegistry, the same that `@Job` decorators use to register jobs.
     */
    private readonly registry: JobMetaDataRegistry = JobMetaDataRegistry.defaultInstance,
    /**
     * Configuration options.
     */
    private readonly options: MessageQueueOptions = {},
    /**
     * Logger for debug messages.
     */
    private readonly logger: LoggerInterface = new NullLogger(),
  ) {}

  /**
   * Get an instance of a queue.
   *
   * @param name Queue name.
   */
  public getQueue(name: string): Queue {
    if (!this.queues[name]) {
      this.queues[name] = new Queue(name, {
        connection: this.options.connection,
      });
    }

    return this.queues[name];
  }

  /**
   * Add a new job to its designated queue.
   *
   * @param jobClassName Class of the job handler.
   * @param data Job data / payload, as an array, that will be passed as
   *             arguments to the `.run()` method of the job handler.
   * @param options Any job options.
   * @returns Instance of the added job.
   */
  public async addJob<T extends JobInterface>(
    jobClassName: ClassName<T>,
    data?: Parameters<T['run']>,
    options?: JobsOptions,
  ): Promise<Job<Parameters<T['run']>, ReturnType<T['run']>>> {
    const jobMetaData = this.registry.getJobMetaData(jobClassName);

    const queue = this.getQueue(jobMetaData.queue);

    const jobId = jobMetaData.generateId
      ? jobMetaData.generateId(...data)
      : undefined;

    const job = await queue.add(jobMetaData.name, data, {
      ...jobMetaData.jobOptions,
      jobId,
      ...options,
    });

    this.logger.debug(
      `Added job "${job.name}" to the "${jobMetaData.queue}" queue with ID: ${job.id}`,
      {
        queue: jobMetaData.queue,
        name: job.name,
        jobId: job.id,
        data,
      },
    );

    return job;
  }

  /**
   * Dispatch a job to be processed asap.
   *
   *      messageQueue.dispatch(SomeJob, 'arg1', 'arg2', 'arg3');
   *
   * @param jobClassName Class of the job handler.
   * @param data Job data / payload that will be passed as
   *             arguments to the `.run()` method of the job handler.
   * @returns Instance of the dispatched job.
   */
  public async dispatch<T extends JobInterface>(
    jobClassName: ClassName<T>,
    ...data: Parameters<T['run']>
  ): Promise<Job<Parameters<T['run']>, ReturnType<T['run']>>> {
    return this.addJob(jobClassName, data);
  }

  /**
   * Schedule a job to be processed not sooner than the given date.
   *
   * When this date comes the job will be added to its queue and then processed
   * as a regular job. Therefore, there is no guarantee that the job will be
   * processed exactly at the given date - it depends on the queue's backlog.
   *
   * If the date has already passed then the job will be processed asap.
   *
   * E.g. this job will not be processed until 1st of May, 2022:
   *
   *      messageQueue.schedule(
   *        new Date('2022-05-01T00:20:00'),
   *        SomeJob,
   *        'arg1',
   *        'arg2',
   *        'arg3',
   *      );
   *
   * Requires a scheduler to be running for the job's queue.
   *
   * @param date Date at which the job should be added to its queue.
   * @param jobClassName Class of the job handler.
   * @param data Job data / payload that will be passed as
   *             arguments to the `.run()` method of the job handler.
   * @returns Instance of the dispatched job.
   */
  public async schedule<T extends JobInterface>(
    date: Date,
    jobClassName,
    ...data: Parameters<T['run']>
  ): Promise<Job<Parameters<T['run']>, ReturnType<T['run']>>>;
  /**
   * Schedule a job to be processed with a delay.
   *
   * E.g. this job will be delayed by 5s:
   *
   *      messageQueue.schedule(5000, SomeJob, 'arg1', 'arg2');
   *
   * Requires a scheduler to be running for the job's queue.
   *
   * @param delay Number of miliseconds by which the job should be delayed.
   * @param jobClassName Class of the job handler.
   * @param data Job data / payload that will be passed as
   *             arguments to the `.run()` method of the job handler.
   * @returns Instance of the dispatched job.
   */
  public async schedule<T extends JobInterface>(
    delay: number,
    jobClassName,
    ...data: Parameters<T['run']>
  ): Promise<Job<Parameters<T['run']>, ReturnType<T['run']>>>;
  public async schedule<T extends JobInterface>(
    time: Date | string | number,
    jobClassName: ClassName<T>,
    ...data: Parameters<T['run']>
  ): Promise<Job<Parameters<T['run']>, ReturnType<T['run']>>> {
    let delay: number;
    if (typeof time === 'string' || time instanceof Date) {
      const date = typeof time === 'string' ? new Date(time) : time;
      delay = date.getTime() - Date.now();
    } else {
      delay = time;
    }
    return this.addJob(jobClassName, data, {
      delay,
    });
  }

  /**
   * Schedule a job to be repeated on the given schedule.
   *
   * E.g. this job will be repeated every hour:
   *
   *      messageQueue.repeat(
   *        { every: 3600 * 1000 },
   *        SomeJob,
   *        'arg1',
   *        'arg2',
   *      );
   *
   * @param schedule Repeat schedule.
   * @param jobClassName Class of the job handler.
   * @param data Job data / payload that will be passed as
   *             arguments to the `.run()` method of the job handler.
   * @returns Instance of the dispatched job.
   */
  public async repeat<T extends JobInterface>(
    schedule: RepeatOptions,
    jobClassName: ClassName<T>,
    ...data: Parameters<T['run']>
  ): Promise<Job<Parameters<T['run']>, ReturnType<T['run']>>> {
    return this.addJob(jobClassName, data, {
      repeat: schedule,
    });
  }
}
