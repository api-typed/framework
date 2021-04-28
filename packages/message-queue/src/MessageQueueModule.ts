import { AbstractModule, App, AppDelegate } from '@api-typed/app';
import { HasJobs } from './HasJobs';
import JobMetaDataRegistry from './JobMetaDataRegistry';
import { MessageQueue } from './MessageQueue';

export class MessageQueueModule extends AbstractModule implements AppDelegate {
  public readonly name = 'message_queue';

  private app: App;

  private registry = JobMetaDataRegistry;

  private messageQueue: MessageQueue;

  public init(app: App): void | AppDelegate {
    this.app = app;

    this.messageQueue = new MessageQueue(this.registry, {}, this.app.logger);
    this.app.container.set(MessageQueue, this.messageQueue);

    this.app.loadFromModules<HasJobs, Function>('loadJobs');

    if (app.getRunMode() === 'worker') {
      return this;
    }
  }

  public async start(): Promise<void> {
    // noop
  }

  public async stop(): Promise<void> {
    // noop
  }
}
