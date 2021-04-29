import { AbstractModule, App, AppDelegate } from '@api-typed/app';
import { HasJobs } from './HasJobs';
import JobMetaDataRegistry from './JobMetaDataRegistry';
import { MessageQueue } from './MessageQueue';
import { WorkerRunner } from './WorkerRunner';

export class MessageQueueModule extends AbstractModule implements AppDelegate {
  public readonly name = 'message_queue';

  private app: App;

  private registry = JobMetaDataRegistry;

  private queue: MessageQueue;

  private runner: WorkerRunner;

  public init(app: App): void | AppDelegate {
    this.app = app;

    this.queue = new MessageQueue(this.registry, {}, this.app.logger);
    this.app.container.set(MessageQueue, this.queue);

    this.runner = new WorkerRunner(this.registry, {}, this.app.logger);
    this.runner.useContainer(this.app.container);
    this.app.container.set(WorkerRunner, this.runner);

    this.app.loadFromModules<HasJobs, Function>('loadJobs');

    if (app.getRunMode() === 'worker') {
      return this;
    }
  }

  public async start(): Promise<void> {
    this.runner.start();
  }

  public async stop(): Promise<void> {
    // noop
  }
}
