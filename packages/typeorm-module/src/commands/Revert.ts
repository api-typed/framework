import { Command, CommandInterface } from '@api-typed/command-line';
import { Inject, Service } from 'typedi';
import { TypeORMCliExecutor } from './utils/TypeORMCliExecutor';

@Command('db:revert', 'Revert database changes made by last migration run')
@Service()
export class Revert implements CommandInterface {
  constructor(
    @Inject(() => TypeORMCliExecutor)
    private readonly executor: TypeORMCliExecutor,
  ) {}

  public async run() {
    await this.executor.execStream('migration:revert');
  }
}
