import { AbstractModule, App, AppDelegate } from '@api-typed/app';
import { HasJobs } from './HasJobs';
import JobMetaDataRegistry from './JobMetaDataRegistry';
import { MessageQueue } from './MessageQueue';
import { SchedulerRunner } from './SchedulerRunner';
import { WorkerRunner } from './WorkerRunner';

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

  public async start(argv: string[] = []): Promise<void> {
    // @todo accept argument for a single queue
    if (this.app.getRunMode() === 'worker') {
      await this.startRunner();
    }

    if (
      this.app.getRunMode() === 'scheduler' ||
      argv.includes('--with-scheduler')
    ) {
      await this.startScheduler();
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

  private async startRunner(): Promise<void> {
    this.runner = new WorkerRunner(this.registry, {}, this.app.logger);
    this.runner.useContainer(this.app.container);
    this.app.container.set(WorkerRunner, this.runner);

    await this.runner.start();
  }

  private async startScheduler(): Promise<void> {
    this.scheduler = new SchedulerRunner(this.registry, {}, this.app.logger);
    this.app.container.set(SchedulerRunner, this.scheduler);

    await this.scheduler.start();
  }
}
