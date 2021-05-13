/**
 * Describes an option for a command.
 */
export interface CommandOption {
  /**
   * What is the short (one letter) version of the option name?
   */
  short?: string;
  /**
   * Short description of the command.
   */
  description?: string;
  /**
   * Does this option require a value?
   * - `'required'` when yes
   * - `'optional'` when value is expected, but it's optional
   * - `undefined` when there should be no value (essentially a boolean flag)
   */
  value?: 'required' | 'optional';
  /**
   * Default value (if any).
   */
  default?: any;
  /**
   * Description of the default value.
   */
  defaultDescription?: string;
  /**
   * An enum of choices that this option has.
   */
  choices?: string[];
  /**
   * Does this option support multiple / an array of values? If yes, then it can
   * be used multiple times for one command call and all the values will be
   * passed as an array to the `.run()` method.
   *
   * For example:
   *
   * ```
   * $ npx api-typed hello --name=John --name=Alice --name=Bob --name=Janet
   * ```
   */
  variadic?: boolean;
}

/**
 * Description (metadata) of a command.
 */
export interface CommandDescription {
  /**
   * Class or class constructor that should be registered as a command.
   */
  target: Function;
  /**
   * Command signature, e.g. `hello <name> [nickname]` where:
   * - `hello` is the name of the command,
   * - `<name>` is a required argument
   * - `[nickname]` is an optional argument
   *
   * Such command would then be called in CLI with e.g.
   *
   * `$ npx api-typed hello John`
   */
  signature: string;
  /**
   * Short command description.
   */
  description?: string;
  /**
   * An object describing the command's options, where key is the full option
   * name and the value is either a short option name or an object with more
   * detailed description of the option:
   *
   * ```
   * {
   *    shout: 's',
   *    level: {
   *      short: 'l',
   *      description: 'What log level to use?',
   *      value: 'required',
   *      default: 'info',
   *      choices: ['notice', 'error', 'info'],
   *    }
   * }
   * ```
   *
   * Command with such options could be called with:
   *
   * ```
   * $ npx api-typed hello John --shout --level=notice
   * ```
   *
   * or
   *
   * ```
   * $ npx api-typed hello John -s -l notice
   * ```
   */
  options?: Record<string, CommandOption | string>;
}

/**
 * Keeps registry of all the known commands.
 */
export class CommandRegistry {
  /**
   * Default shared instance of the CommandRegistry that is used by the
   * `@Command()` decorator.
   */
  public static readonly defaultInstance = new CommandRegistry();

  /**
   * List of all registered commands.
   */
  private commands: CommandDescription[] = [];

  /**
   * Register a command so that it can be used.
   *
   * @param command An object that describes the command.
   */
  public register(command: CommandDescription) {
    this.commands.push(command);
  }

  /**
   * Get an array of all the registered commands.
   */
  public getCommands(): CommandDescription[] {
    return this.commands;
  }
}

export default CommandRegistry.defaultInstance;
