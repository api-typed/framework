import { App, ModuleInterface } from '@api-typed/app';
import { CommandLineModule } from '@api-typed/command-line';
import { HttpModule } from '@api-typed/http-module';
import { MessageQueueModule } from '@api-typed/message-queue';
import { TypeORMModule } from '@api-typed/typeorm-module';
import { StandardAppModule } from './StandardAppModule';

export class StandardApp extends App {
  constructor(rootDir: string, modules: ModuleInterface[] = []) {
    super(rootDir, [
      new HttpModule(),
      new CommandLineModule(),
      new TypeORMModule(),
      new MessageQueueModule(),
      new StandardAppModule(),
      ...modules,
    ]);
  }
}
