import CommandRegistry, { CommandOption } from '../CommandRegistry';

export function Command(
  signature: string,
  description?: string,
  options?: Record<string, CommandOption | string>,
): ClassDecorator {
  return function (target) {
    CommandRegistry.register({
      target,
      signature,
      description,
      options,
    });
  };
}
