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
  connection?: ConnectionOptions;
}

export class MessageQueue {
  private readonly queues: Record<string, Queue> = {};

  constructor(
    private readonly registry: JobMetaDataRegistry = JobMetaDataRegistry.defaultInstance,
    private readonly options: MessageQueueOptions = {},
    private readonly logger: LoggerInterface = new NullLogger(),
  ) {}

  public getQueue(name: string): Queue {
    if (!this.queues[name]) {
      this.queues[name] = new Queue(name, {
        connection: this.options.connection,
      });
    }

    return this.queues[name];
  }

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

  public async dispatch<T extends JobInterface>(
    jobClassName: ClassName<T>,
    ...data: Parameters<T['run']>
  ): Promise<Job<Parameters<T['run']>, ReturnType<T['run']>>> {
    return this.addJob(jobClassName, data);
  }

  public async schedule<T extends JobInterface>(
    date: Date,
    jobClassName,
    ...data: Parameters<T['run']>
  ): Promise<Job<Parameters<T['run']>, ReturnType<T['run']>>>;
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
