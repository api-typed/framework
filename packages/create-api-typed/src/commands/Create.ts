import {
  Command,
  CommandInterface,
  InjectLogger,
  LoggerInterface,
} from 'api-typed';
import { Service } from 'typedi';

const TEMPLATES = ['standard'] as const;

interface CreateOptions {
  template?: typeof TEMPLATES[number];
}

@Command<CreateOptions>('create <name>', {
  template: {
    short: 't',
    value: 'required',
    description: 'Template to use.',
    choices: (TEMPLATES as unknown) as string[],
  },
})
@Service()
export class Create implements CommandInterface {
  constructor(
    @InjectLogger()
    private readonly logger: LoggerInterface,
  ) {}

  public async run(appName: string, { template }: CreateOptions) {
    this.logger.info(
      `Creating Api-Typed app "${appName}" from ${template} template...`,
    );
  }
}
