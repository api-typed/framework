import CommandRegistry, { CommandOption } from '../CommandRegistry';

/**
 * Register a class as a command to be run from a CLI.
 *
 * @param signature Command name and signature, e.g. `hello <name> [nickname]`,
 *    where:
 *    - `hello` is the command name,
 *    - `<name>` is a required argument,
 *    - `[nickname]` is an optional argument.
 * @param options An object describing the command's options, where key is the
 *    full option name and the value is either a short option name or an object
 *    with more detailed description of the option:
 *
 *    ```
 *    {
 *      shout: 's',
 *      level: {
 *        short: 'l',
 *        description: 'What log level to use?',
 *        value: 'required',
 *        default: 'info',
 *        choices: ['notice', 'error', 'info'],
 *      },
 *    }
 *    ```
 *
 *    Command with such options could be called with:
 *
 *    ```
 *    $ npx api-typed hello John --shout --level=notice
 *    ```
 *
 *    or
 *
 *    ```
 *    $ npx api-typed hello John -s -l notice
 *    ```
 */
export function Command<T = unknown>(
  signature: string,
  options?: Record<keyof T, CommandOption | string>,
): ClassDecorator;
/**
 * Register a class as a command to be run from a CLI.
 *
 * @param signature Command name and signature, e.g. `hello <name> [nickname]`,
 *    where:
 *    - `hello` is the command name,
 *    - `<name>` is a required argument,
 *    - `[nickname]` is an optional argument.
 * @param description Short description of the command.
 * @param options An object describing the command's options, where key is the
 *    full option name and the value is either a short option name or an object
 *    with more detailed description of the option:
 *
 *    ```
 *    {
 *      shout: 's',
 *      level: {
 *        short: 'l',
 *        description: 'What log level to use?',
 *        value: 'required',
 *        default: 'info',
 *        choices: ['notice', 'error', 'info'],
 *      },
 *    }
 *    ```
 *
 *    Command with such options could be called with:
 *
 *    ```
 *    $ npx api-typed hello John --shout --level=notice
 *    ```
 *
 *    or
 *
 *    ```
 *    $ npx api-typed hello John -s -l notice
 *    ```
 */
export function Command<T = unknown>(
  signature: string,
  description?: string,
  options?: Record<keyof T, CommandOption | string>,
): ClassDecorator;

export function Command<T = unknown>(
  signature: string,
  descriptionOrOptions?: string | Record<keyof T, CommandOption | string>,
  optionsOrNothing?: Record<keyof T, CommandOption | string>,
) {
  const description =
    typeof descriptionOrOptions === 'string' ? descriptionOrOptions : '';
  const options =
    typeof descriptionOrOptions === 'string'
      ? optionsOrNothing
      : descriptionOrOptions;

  return function (target) {
    CommandRegistry.register({
      target,
      signature,
      description,
      options,
    });
  };
}
