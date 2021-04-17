import { AbstractModule, App } from '@api-typed/app';
import {
  CommandLineModule,
  HasCommands,
  loadCommands,
} from '@api-typed/command-line';
import { Config } from '@api-typed/config';
import { HttpModule } from '@api-typed/http-module';
import { HasEntities, TypeORMModule } from '@api-typed/typeorm-module';

class AppModule extends AbstractModule implements HasCommands, HasEntities {
  public readonly name = 'app';

  public loadConfig(config: Config) {
    return config.loadFromFile(`${__dirname}/config`);
  }

  public loadCommands() {
    return loadCommands(`${__dirname}/commands/*.ts`);
  }

  public loadEntities() {
    return [`${__dirname}/entities/**.{ts,js}`];
  }
}

export default new App(__dirname, [
  new HttpModule(),
  new CommandLineModule(),
  new TypeORMModule(),
  new AppModule(),
]);
