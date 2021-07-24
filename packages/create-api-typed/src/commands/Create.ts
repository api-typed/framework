import {
  Command,
  CommandInterface,
  InjectLogger,
  isDir,
  LoggerInterface,
} from 'api-typed';
import snakeCase from 'lodash.snakecase';
import mkdirp from 'mkdirp';
import { Inject, Service } from 'typedi';
import { TemplateProcessor } from '../features/Templating/TemplateProcessor';
import { TemplateParams } from '../features/Templating/types';

const TEMPLATES = ['standard'] as const;

interface CreateOptions {
  template?: typeof TEMPLATES[number];
}

@Command<CreateOptions>('create <name>', {
  template: {
    short: 't',
    value: 'required',
    description: 'Template to use.',
    default: 'standard',
    choices: (TEMPLATES as unknown) as string[],
  },
})
@Service()
export class Create implements CommandInterface {
  constructor(
    @Inject(() => TemplateProcessor)
    private readonly templateProcessor: TemplateProcessor,

    @InjectLogger()
    private readonly logger: LoggerInterface,
  ) {}

  public async run(appName: string, { template }: CreateOptions) {
    this.logger.info(
      `Creating Api-Typed app "${appName}" from ${template} template...`,
    );

    const projectDir = await this.prepareDir(appName);
    this.logger.debug(`Created dir "${projectDir}"`);

    const params: TemplateParams = {
      appName,
      snakeCaseName: snakeCase(appName),
      kabebCaseName: snakeCase(appName).replace('_', '-'),
      packageName: snakeCase(appName).replace('_', '-'),
    };

    await this.templateProcessor.install(
      ['shared', template],
      projectDir,
      params,
    );
  }

  private async prepareDir(appName: string): Promise<string> {
    const dirName = appName;

    if (isDir(dirName)) {
      throw new Error(`Directory "./${appName}" already exists.`);
    }

    const result = await mkdirp(dirName);

    return result;
  }
}
