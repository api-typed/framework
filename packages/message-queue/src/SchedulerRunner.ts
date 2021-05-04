import { LoggerInterface, NullLogger } from '@api-typed/logger';
import { ConnectionOptions, QueueScheduler } from 'bullmq';
import { JobMetaDataRegistry } from './JobMetaDataRegistry';

export interface SchedulerRunnerOptions {
  connection?: ConnectionOptions;
}

export class SchedulerRunner {
  private readonly schedulers: Record<string, QueueScheduler> = {};

  constructor(
    private readonly registry: JobMetaDataRegistry = JobMetaDataRegistry.defaultInstance,
    private readonly options: SchedulerRunnerOptions = {},
    private readonly logger: LoggerInterface = new NullLogger(),
  ) {}

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
