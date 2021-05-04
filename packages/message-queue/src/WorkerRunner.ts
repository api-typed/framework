import { Timer } from '@api-typed/common';
import { LoggerInterface, NullLogger } from '@api-typed/logger';
import { ConnectionOptions, Job, Worker } from 'bullmq';
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

  public async start(): Promise<void> {
    const queueNames = this.registry.getQueueNames();

    if (queueNames.length === 0) {
      throw new Error('Could not find any registered queues (or jobs)');
    }

    this.logger.debug(`Starting worker for ${queueNames.length} queues`, {
      data: queueNames,
    });

    queueNames.forEach((queueName) => this.startForQueue(queueName));
  }

  public async stop(): Promise<void> {
    await Promise.all(
      Object.values(this.workers).map((worker) => worker.close()),
    );
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
