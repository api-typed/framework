import { Command, CommandInterface } from '@api-typed/command-line';
import chalk from 'chalk';
import * as path from 'path';
import { Inject, Service } from 'typedi';
import { Migrate } from './Migrate';
import { TypeORMCliExecutor } from './utils/TypeORMCliExecutor';

@Command('db:migration <name>', 'Generate database migration')
@Service()
export class Migration implements CommandInterface {
  constructor(
    @Inject(() => TypeORMCliExecutor)
    private readonly executor: TypeORMCliExecutor,
    @Inject(() => Migrate)
    private readonly migrateCommand: Migrate,
  ) {}

  public async run(name: string) {
    // firstly, run the migrate command
    await this.migrateCommand.run();

    const output = await this.executor.execSync(
      `migration:generate -n ${name} --pretty`,
    );

    // gotta make some fixes to the generated migration
    if (output.endsWith('has been generated successfully.\n')) {
      const filePath = output.match(
        /Migration (.*) has been generated successfully/i,
      )[1];

      const fileName = path.basename(filePath);
      console.log(
        `Migration ${chalk.green(fileName)} has been generated successfully.`,
      );
      return;
    }

    // customise some outputs
    if (output.startsWith('No changes in database schema were found')) {
      console.log('Database is up to date.');
    } else {
      console.log(output);
    }
  }
}
