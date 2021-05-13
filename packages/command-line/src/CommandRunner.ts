import chalk from 'chalk';
import { Option, program } from 'commander';
import padEnd from 'lodash.padend';
import upperFirst from 'lodash.upperfirst';
import { CommandInterface } from './CommandInterface';
import { CommandDescription, CommandRegistry } from './CommandRegistry';

interface ContainerInterface {
  get<T = any>(identifier: Function): T;
}

type OnStartCallback = (signature?: string) => void;
type OnExitCallback = (exitCode: number, error?: unknown) => void;

/**
 * The main class of the package and main entry point to the commands.
 */
export class CommandRunner {
  public static readonly defaultInstance = new CommandRunner();

  public readonly program = program;

  private container: ContainerInterface;

  private appBanner: string;
  private banner: string;
  private onStartCallback: OnStartCallback;
  private onExitCallback: OnExitCallback;

  constructor(
    /**
     * Command registry to be used for this CommandRunner instance.
     *
     * By default takes the shared default instance of CommandRegistry.
     */
    public readonly registry: CommandRegistry = CommandRegistry.defaultInstance,
  ) {}

  /**
   * Run the CommandRunner by passing the `process.argv` (default value).
   * CommandRunner will then parse the input and redirect the execution to the
   * appropriate registered command instance.
   */
  public async run(argv: string[] = process.argv) {
    this.program.configureOutput({
      writeErr: (str) => {
        const clear = str.trim().replace(/^error: /i, '');
        this.writeError(upperFirst(clear));
      },
    });

    const banner = this.getBanner();
    if (banner) {
      this.program.addHelpText('beforeAll', `${banner}\n`);
    }

    this.registry.getCommands().forEach((cmd) => this.prepareCommand(cmd));

    try {
      await this.program.parseAsync(argv);
    } catch (e) {
      this.writeError(e.stack || e);
    }
  }

  /**
   * If you want to use a dependency injection container to wire up an instance
   * of a command class, pass it to this method.
   *
   * When running a command the CommandRunner will try to get an instance from
   * this container and if it fails it will simply call the command class
   * constructor without any arguments.
   *
   * @param container The container should have at least
   *    `.get(identifier: Function)` method.
   */
  public useContainer(container: ContainerInterface) {
    this.container = container;
  }

  /**
   * Set an app banner that will be displayed before executing any command.
   *
   * @param appName Name of the application.
   * @param version Application version.
   */
  public setAppBanner(appName: string, version?: string) {
    this.appBanner = [chalk.green(appName), version && `(v. ${version})`]
      .filter(Boolean)
      .join(' ');
  }

  /**
   * Set any custom banner that will be displayed before executing any command.
   *
   * @param banner Essentially a string to be displayed.
   */
  public setBanner(banner: string) {
    this.banner = banner;
  }

  /**
   * Register a callback function that will be called just before command
   * execution. It's only argument will be the command's signature.
   *
   * @param callback
   */
  public onStart(callback: OnStartCallback) {
    this.onStartCallback = callback;
  }

  /**
   * Register a callback function that will be called just after command
   * execution finishes (even if with an error). It will be called with the
   * exitCode as first arguent and potential error as second.
   *
   * @param callback
   */
  public onExit(callback: OnExitCallback) {
    this.onExitCallback = callback;

    this.program.exitOverride(async (error) => {
      await this.onExitCallback(1, error);
    });
  }

  private prepareCommand({
    target,
    signature,
    description,
    options,
  }: CommandDescription) {
    const cmd = this.program.command(signature);

    if (description) {
      cmd.description(description);
    }

    Object.entries(options || {}).map(([name, opt]) => {
      if (typeof opt === 'string') {
        cmd.addOption(new Option(`${opt}, --${name}`));
        return;
      }

      const option = new Option(
        [
          opt.short && `-${opt.short},`,
          `--${name}`,
          opt.value === 'required' && `<value${opt.variadic ? '...' : ''}>`,
          opt.value === 'optional' && `[value${opt.variadic ? '...' : ''}]`,
        ]
          .filter(Boolean)
          .join(' '),
        opt.description,
      );

      if (opt.choices) {
        option.choices(opt.choices);
      }

      if (opt.default) {
        option.default(opt.default, opt.defaultDescription);
      }

      cmd.addOption(option);
    });

    cmd.action(async (...args) => {
      const command = this.container
        ? this.container.get<CommandInterface>(target)
        : target();
      await this.exec(cmd.name(), command, args.slice(0, args.length - 1));
    });
  }

  private async exec(
    signature: string,
    cmd: CommandInterface,
    args: unknown[],
  ): Promise<void> {
    const banner = this.getBanner();
    if (banner) {
      console.log(banner);
      console.log(` ${chalk.yellow(signature)}`);
      console.log(' ');
    }
    if (this.onStartCallback) {
      await this.onStartCallback(signature);
    }

    let exitCode = await cmd.run(...args);
    exitCode = exitCode || 0;

    if (exitCode > 0) {
      console.log('');
      console.log(chalk.yellow(`Finished with exit code ${exitCode}`));
    }

    if (this.onExitCallback) {
      await this.onExitCallback(exitCode);
    }
  }

  private getBanner(): string {
    return [this.appBanner, this.banner].filter(Boolean).join('\n');
  }

  private writeError(str: string): void {
    const lines = str.split('\n');
    const maxLength = Math.max(...lines.map((l) => l.length)) + 2;
    console.log('');
    console.log(chalk.bgRed.white(padEnd('', maxLength)));
    lines.map((line) =>
      console.log(chalk.bgRed.white(padEnd(` ${line}`, maxLength))),
    );
    console.log(chalk.bgRed.white(padEnd('', maxLength)));
    console.log('');
  }
}

export default CommandRunner.defaultInstance;
