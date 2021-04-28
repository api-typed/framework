import { AbstractModule, App, AppDelegate } from '@api-typed/app';
import { HasJobs } from './HasJobs';
import JobMetaDataRegistry from './JobMetaDataRegistry';

export class MessageQueueModule extends AbstractModule implements AppDelegate {
  public readonly name = 'message_queue';

  private app: App;

  private registry = JobMetaDataRegistry;

  public init(app: App): void | AppDelegate {
    this.app = app;

    if (app.getRunMode() === 'worker') {
      return this;
    }
  }

  public async start(): Promise<void> {
    this.app.loadFromModules<HasJobs, Function>('loadJobs');
  }

  public async stop(): Promise<void> {
    // noop
  }
}
