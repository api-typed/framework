import { Timer } from '@api-typed/common';
import { LoggerInterface, NullLogger } from '@api-typed/logger';
import { ConnectionOptions, Job, Worker } from 'bullmq';
import { JobInterface } from './JobInterface';
import { JobMetaDataRegistry } from './JobMetaDataRegistry';

interface ContainerInterface {
  get<T = any>(identifier: Function): T;
}

export interface WorkerRunnerOptions {
  /**
   * Redis connection configuration or redisio connection itself.
   */
  connection?: ConnectionOptions;
}

/**
 * Runs a worker for one or more queues.
 *
 * By default it will subscribe to all known queues (from `JobMetaDataRegistry`),
 * but you can also subscribe only to specific ones (e.g. if you want to
 * prioritize some queue with dedicated worker or two).
 */
export class WorkerRunner {
  private readonly workers: Record<string, Worker> = {};

  private container: ContainerInterface;

  constructor(
    /**
     * Registry of all jobs and their metadata. The registry is required for
     * proper routing of queue messages to job handlers.
     *
     * By default it uses a global exported default instance of
     * JobMetaDataRegistry, the same that `@Job` decorators use to register jobs.
     */
    private readonly registry: JobMetaDataRegistry = JobMetaDataRegistry.defaultInstance,
    /**
     * Runner options.
     */
    private readonly options: WorkerRunnerOptions = {},
    /**
     * Logger for debug messages.
     */
    private readonly logger: LoggerInterface = new NullLogger(),
  ) {}

  /**
   * Start the worker.
   *
   * @param onlyQueues Names of queues that this worker should subscribe to.
   *                   Will subscribe to all known queues if empty.
   */
  public async start(onlyQueues: string[] = []): Promise<void> {
    const queueNames =
      onlyQueues.length > 0 ? onlyQueues : this.registry.getQueueNames();

    if (queueNames.length === 0) {
      throw new Error('Could not find any registered queues (or jobs)');
    }

    this.logger.debug(`Starting worker for ${queueNames.length} queues`, {
      data: queueNames,
    });

    queueNames.forEach((queueName) => this.startForQueue(queueName));
  }

  /**
   * Stop the worker.
   */
  public async stop(): Promise<void> {
    await Promise.all(
      Object.values(this.workers).map((worker) => worker.close()),
    );
  }

  /**
   * If you want job handlers to be constucted using a dependency injection
   * container pass it here.
   *
   * When handling a job it will try to get an instance of the designated job
   * handler class from this container and if it fails it will simply create
   * an instance of the class without passing any arguments to its constructor.
   *
   * @param container The container should have at least
   *    `.get(identifier: Function)` method.
   */
  public useContainer(container: ContainerInterface) {
    this.container = container;
  }

  private startForQueue(queueName: string): Worker {
    const worker = new Worker(
      queueName,
      async (job) => {
        await this.processJob(job, queueName);
      },
      {
        connection: this.options.connection,
      },
    );

    this.workers[queueName] = worker;
    return worker;
  }

  private async processJob(job: Job, queueName: string): Promise<unknown> {
    const logPrefix = `[queue: ${queueName}] [job: ${job.name}] [id: ${job.id}]`;
    const logData = {
      queue: queueName,
      job: job.name,
      jobId: job.id,
      attempt: job.attemptsMade,
    };

    const jobMetaData = this.registry.getJobMetaData(job.name);

    this.logger.debug(
      `${logPrefix} Processing ${
        job.attemptsMade > 0 ? `(#${job.attemptsMade})` : ''
      }`,
      logData,
    );

    const timer = new Timer();

    try {
      const { target } = jobMetaData;
      const jobHandler = this.container
        ? this.container.get<JobInterface>(target)
        : (new target() as JobInterface);

      const result = await jobHandler.run(...job.data);

      const time = timer.stop('ms');
      this.logger.debug(`${logPrefix} Completed in ${time} ms`, {
        ...logData,
        data: job.data,
        result,
        ms: time,
      });

      return result;
    } catch (e) {
      const time = timer.stop('ms');
      this.logger.error(`${logPrefix} Failed in ${time} ms`, {
        ...logData,
        data: job.data,
        error: e?.message || e,
        trace: e?.stack?.split('\n'),
        ms: time,
      });
      throw e;
    }
  }
}
