import { AbstractModule, App, AppDelegate } from '@api-typed/app';
import { Config } from '@api-typed/config';
import { LogLevel } from '@api-typed/logger';
import { Option } from 'commander';
import CommandRegistry, { CommandDescription } from './CommandRegistry';
import CommandRunner from './CommandRunner';
import { HasCommands } from './HasCommands';

/**
 * App module that is responsible for handling CLI configuration.
 */
export class CommandLineModule extends AbstractModule implements AppDelegate {
  public readonly name = 'command';

  private app: App;

  private registry = CommandRegistry;

  private runner = CommandRunner;

  public loadConfig(config: Config) {
    const verbose =
      process.argv.includes('-vvv') || process.argv.includes('--verbose');
    config.loadFromObject({
      log_level: verbose
        ? LogLevel.debug
        : process.env.LOG_LEVEL_CLI || LogLevel.info,
    });
  }

  public init(app: App): void | AppDelegate {
    this.app = app;

    if (app.getRunMode() === 'command') {
      return this;
    }
  }

  public async start(): Promise<void> {
    this.runner.useContainer(this.app.container);
    this.runner.setAppBanner(
      this.app.config.get('appName'),
      this.app.config.get('version'),
    );
    this.runner.onExit(async (exitCode) => {
      await this.app.stop(exitCode);
    });

    this.runner.program.addOption(
      new Option(
        '-vvv, --verbose',
        'set log level to debug regardless of config setting',
      ),
    );

    this.app.loadFromModules<HasCommands, Function>('loadCommands');

    await this.runner.run(process.argv);
  }

  public async stop(exitCode = 0): Promise<void> {
    process.exit(exitCode);
  }

  public addCommand(command: CommandDescription) {
    this.registry.addCommand(command);
  }
}
