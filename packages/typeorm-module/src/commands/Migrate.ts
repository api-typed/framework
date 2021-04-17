import { Command, CommandInterface } from '@api-typed/command-line';
import { Inject, Service } from 'typedi';
import { TypeORMCliExecutor } from './utils/TypeORMCliExecutor';

@Command(
  'db:migrate',
  'Update database schema by running any pending migrations',
)
@Service()
export class Migrate implements CommandInterface {
  constructor(
    @Inject(() => TypeORMCliExecutor)
    private readonly executor: TypeORMCliExecutor,
  ) {}

  public async run() {
    await this.executor.execStream('migration:run');
  }
}
