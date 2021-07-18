import { Command, CommandInterface } from '@api-typed/command-line';
import { InjectLogger } from '@api-typed/logger';
import { MessageQueue } from '@api-typed/message-queue';
import { Inject, Service } from 'typedi';
import { GreetingJob } from '../jobs/GreetingJob';

interface HelloOptions {
  shout?: boolean;
  level?: 'notice' | 'error' | 'info';
}

@Command<HelloOptions>('hello <name> [question]', {
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
  constructor(
    @InjectLogger() private readonly logger,
    @Inject(() => MessageQueue) private readonly mq: MessageQueue,
  ) {}

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

    await this.mq.dispatch(GreetingJob, name, question);
    await this.mq.schedule(2000, GreetingJob, name, question);
    await this.mq.schedule(
      new Date(Date.now() + 10000),
      GreetingJob,
      name,
      question,
    );
  }
}
