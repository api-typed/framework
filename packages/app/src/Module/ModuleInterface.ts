import { Config } from '@api-typed/config';
import { App, AppDelegate } from '../App';

export interface ModuleInterface {
  name: string;

  /**
   * Load configuration specific to the module.
   *
   * @param config Config instance on which the configuration should be loaded.
   */
  loadConfig(config: Config): void;

  /**
   * Perform any initialization.
   *
   * Optionally return an AppDelegate that will be responsible for running the
   * app in appropriate run mode.
   *
   * One and only one registered module must register an app delegate.
   */
  init(app: App): void | Promise<void> | AppDelegate | Promise<AppDelegate>;

  /**
   * Perform any cleanup when the app is closing.
   */
  close(exitCode: number, app: App): void | Promise<void>;
}
