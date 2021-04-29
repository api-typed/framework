import { LoggerInterface, NullLogger } from '@api-typed/logger';
import { Job, Worker } from 'bullmq';
import { ConnectionOptions } from 'node:tls';
import { JobInterface } from './JobInterface';
import { JobMetaDataRegistry } from './JobMetaDataRegistry';

interface ContainerInterface {
  get<T = any>(identifier: Function): T;
}

export interface WorkerRunnerOptions {
  connection?: ConnectionOptions;
}

export class WorkerRunner {
  private readonly workers: Record<string, Worker> = {};

  private container: ContainerInterface;

  constructor(
    private readonly registry: JobMetaDataRegistry = JobMetaDataRegistry.defaultInstance,
    private readonly options: WorkerRunnerOptions = {},
    private readonly logger: LoggerInterface = new NullLogger(),
  ) {}

  public start(): void {
    const queueNames = this.registry.getQueueNames();

    this.logger.debug(`Starting worker for ${queueNames.length} queues`, {
      data: queueNames,
    });

    queueNames.forEach((queueName) => this.startForQueue(queueName));
  }

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
      data: job.data,
      attempt: job.attemptsMade,
    };

    const jobMetaData = this.registry.getJobMetaData(job.name);

    this.logger.debug(
      `${logPrefix} Processing ${
        job.attemptsMade > 0 ? `(#${job.attemptsMade})` : ''
      }`,
      logData,
    );

    try {
      const { target } = jobMetaData;
      const jobHandler = this.container
        ? this.container.get<JobInterface>(target)
        : (new target() as JobInterface);

      const result = await jobHandler.run(...job.data);

      this.logger.debug(`${logPrefix} Completed`, {
        ...logData,
        result,
      });

      return result;
    } catch (e) {
      this.logger.error(`${logPrefix} Failed`, {
        ...logData,
        error: e?.message || e,
        trace: e?.stack?.split('\n'),
      });
      throw e;
    }
  }
}
