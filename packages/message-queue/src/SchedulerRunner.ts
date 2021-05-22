import { LoggerInterface, NullLogger } from '@api-typed/logger';
import { ConnectionOptions, QueueScheduler } from 'bullmq';
import { JobMetaDataRegistry } from './JobMetaDataRegistry';

export interface SchedulerRunnerOptions {
  /**
   * Redis connection configuration or redisio connection itself.
   */
  connection?: ConnectionOptions;
}

/**
 * Runs a scheduler for one or more queues. Running a scheduler is required
 * if you want to handle jobs with a delay or schedule jobs to be processed
 * at a later time.
 *
 * Usually it should be enough to run one scheduler for a queue.
 *
 * See BullMQ docs for more information.
 *
 * By default it will subscribe to all known queues (from `JobMetaDataRegistry`),
 * but you can also subscribe only to specific ones.
 */
export class SchedulerRunner {
  private readonly schedulers: Record<string, QueueScheduler> = {};

  constructor(
    /**
     * Registry of all jobs and their metadata.
     *
     * By default it uses a global exported default instance of
     * JobMetaDataRegistry, the same that `@Job` decorators use to register jobs.
     */
    private readonly registry: JobMetaDataRegistry = JobMetaDataRegistry.defaultInstance,
    /**
     * Runner options.
     */
    private readonly options: SchedulerRunnerOptions = {},
    /**
     * Logger for debug messages.
     */
    private readonly logger: LoggerInterface = new NullLogger(),
  ) {}

  /**
   * Start the scheduler.
   *
   * @param onlyQueues Names of queues that this scheduler should handle.
   *                   Will handle all known queues if empty.
   */
  public async start(onlyQueues: string[] = []): Promise<void> {
    const queueNames =
      onlyQueues.length > 0 ? onlyQueues : this.registry.getQueueNames();

    if (queueNames.length === 0) {
      throw new Error('Could not find any registered queues (or jobs)');
    }

    this.logger.debug(`Starting scheduler for ${queueNames.length} queues`, {
      data: queueNames,
    });

    queueNames.forEach((queueName) => this.startForQueue(queueName));
  }

  /**
   * Stop the scheduler.
   */
  public async stop(): Promise<void> {
    await Promise.all(
      Object.values(this.schedulers).map((scheduler) => scheduler.close()),
    );
  }

  private startForQueue(queueName: string): QueueScheduler {
    const scheduler = new QueueScheduler(queueName, {
      connection: this.options.connection,
    });

    this.schedulers[queueName] = scheduler;
    return scheduler;
  }
}
