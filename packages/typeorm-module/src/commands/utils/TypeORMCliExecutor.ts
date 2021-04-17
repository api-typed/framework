import { ConfigParam } from '@api-typed/config';
import { InjectLogger, LoggerInterface } from '@api-typed/logger';
import { exec, spawn } from 'child_process';
import * as glob from 'glob';
import * as path from 'path';
import { Inject, Service } from 'typedi';
import { ConfigDumper } from './ConfigDumper';

interface ExecutionParams {
  cmd: string;
  cwd: string;
}

@Service()
export class TypeORMCliExecutor {
  constructor(
    @Inject(() => ConfigDumper) private readonly configDumper: ConfigDumper,
    @InjectLogger() private readonly logger: LoggerInterface,
    @ConfigParam('projectDir') private readonly projectDir: string,
  ) {}

  public async exec(command: string): Promise<string> {
    return this.execSync(command);
  }

  public async execSync(command: string): Promise<string> {
    const { cmd, cwd } = await this.prepare(command);
    this.logger.debug(`Calling typeorm cli: ${command}`);

    const output = await this.doExecSync(cmd, cwd);

    await this.cleanup();

    return output;
  }

  public async execStream(command: string): Promise<number> {
    const { cmd, cwd } = await this.prepare(command);
    this.logger.debug(`Calling typeorm cli: ${command}`);

    const exitCode = await this.doExecStream(cmd, cwd);

    await this.cleanup();

    return exitCode;
  }

  private async prepare(command: string): Promise<ExecutionParams> {
    const configPath = await this.configDumper.dump();
    const cwd = path.dirname(configPath);

    const typeormCli = glob.sync(
      `${this.projectDir}/node_modules/{**,**/*/,}typeorm/cli.js`,
    )[0];

    if (!typeormCli) {
      throw new Error(
        'Could not find TypeORM CLI. Did you install all dependencies?',
      );
    }

    const cmd = `npx ts-node ${typeormCli} ${command}`;

    return { cmd, cwd };
  }

  private async cleanup(): Promise<void> {
    await this.configDumper.clear();
  }

  private async doExecSync(command: string, cwd: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(
        command,
        {
          cwd,
        },
        (error, stdout, stderr) => {
          if (error && error.code !== 1) {
            reject(error);
            return;
          }

          if (stderr) {
            reject(stderr);
            return;
          }

          resolve(stdout);
        },
      );
    });
  }

  private async doExecStream(command: string, cwd: string): Promise<number> {
    const args = command.split(' ');
    const cmd = args.shift();
    return new Promise((resolve) => {
      const child = spawn(cmd, args, { cwd });

      child.stdout.on('data', (data) => {
        const str = data.toString();

        if (str.startsWith('query:')) {
          this.logger.debug(str.replace(/^query: /, ''));
          return;
        }

        console.log(data.toString());
      });

      child.stderr.on('data', (data) => {
        console.error(data.toString());
      });

      child.on('close', (exitCode) => {
        resolve(exitCode);
      });
    });
  }
}
