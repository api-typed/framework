/* eslint-disable @typescript-eslint/no-empty-function */
import { Config } from '../Config';
import { App } from './App';
import { ModuleInterface } from './types';

/**
 * Convenient abstract AppModule that implements the interface with no-op methods,
 * so you don't have to.
 */
export abstract class AbstractModule implements ModuleInterface {
  abstract name;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public loadConfig(config: Config): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public init(app: App): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public close(exitCode: number, app: App): void {}
}
