import { AbstractModule, App, AppDelegate } from '@api-typed/app';
import { HasJobs } from './HasJobs';
import JobMetaDataRegistry from './JobMetaDataRegistry';
import { MessageQueue } from './MessageQueue';
import { SchedulerRunner } from './SchedulerRunner';
import { WorkerRunner } from './WorkerRunner';

/**
 * Api-Typed module that is responsible for handling the message queue and jobs.
 */
export class MessageQueueModule extends AbstractModule implements AppDelegate {
  public readonly name = 'message_queue';

  private app: App;

  private registry = JobMetaDataRegistry;

  private queue: MessageQueue;

  private runner: WorkerRunner;

  private scheduler: SchedulerRunner;

  public init(app: App): void | AppDelegate {
    this.app = app;

    this.queue = new MessageQueue(this.registry, {}, this.app.logger);
    this.app.container.set(MessageQueue, this.queue);

    this.app.loadFromModules<HasJobs, Function>('loadJobs');

    if (['worker', 'scheduler'].includes(app.getRunMode())) {
      return this;
    }
  }

  public async start(onlyQueues = [], options = {}): Promise<void> {
    const withScheduler = options['with-scheduler'] ?? false;

    if (this.app.getRunMode() === 'worker') {
      await this.startRunner(onlyQueues);
    }

    if (this.app.getRunMode() === 'scheduler' || withScheduler) {
      await this.startScheduler(onlyQueues);
    }
  }

  public async stop(): Promise<void> {
    if (this.runner) {
      await this.runner.stop();
    }
    if (this.scheduler) {
      await this.scheduler.stop();
    }
  }

  private async startRunner(onlyQueues: string[] = []): Promise<void> {
    this.runner = new WorkerRunner(this.registry, {}, this.app.logger);
    this.runner.useContainer(this.app.container);
    this.app.container.set(WorkerRunner, this.runner);

    await this.runner.start(onlyQueues);
  }

  private async startScheduler(onlyQueues: string[] = []): Promise<void> {
    this.scheduler = new SchedulerRunner(this.registry, {}, this.app.logger);
    this.app.container.set(SchedulerRunner, this.scheduler);

    await this.scheduler.start(onlyQueues);
  }
}
