import { Command, CommandInterface } from '@api-typed/command-line';
import { InjectLogger } from '@api-typed/logger';
import { Service } from 'typedi';

interface HelloOptions {
  shout?: boolean;
  level?: 'notice' | 'error' | 'info';
}

@Command('hello <name> [question]', 'Oi mate!', {
  shout: {
    short: 's',
    description: 'shout?',
  },
  level: {
    short: 'l',
    description: 'Which log level?',
    value: 'required',
    default: 'info',
    choices: ['notice', 'error', 'info'],
  },
})
@Service()
export class Hello implements CommandInterface {
  constructor(@InjectLogger() private readonly logger) {}

  public async run(
    name: string,
    question?: string,
    options: HelloOptions = {},
  ) {
    const { level, shout } = options;

    const greeting = [`Hello ${name}${shout ? '!' : '.'}`, question]
      .filter(Boolean)
      .join(' ');
    this.logger.log(level, shout ? greeting.toUpperCase() : greeting);
  }
}
