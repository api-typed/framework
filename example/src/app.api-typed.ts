import { AbstractModule, App } from '@api-typed/app';
import {
  CommandLineModule,
  HasCommands,
  loadCommands,
} from '@api-typed/command-line';
import { HttpModule } from '@api-typed/http-module';

class AppModule extends AbstractModule implements HasCommands {
  public readonly name = 'app';

  public loadCommands(): Function[] {
    return loadCommands(`${__dirname}/commands/*.ts`);
  }
}

export default new App(__dirname, [
  new HttpModule(),
  new CommandLineModule(),
  new AppModule(),
]);
