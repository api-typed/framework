import { AbstractModule } from '@api-typed/app';
import { HasCommands, loadCommands } from '@api-typed/command-line';
import { Config } from '@api-typed/config';
import {
  HasControllers,
  HasMiddlewares,
  loadControllers,
  loadMiddlewares,
} from '@api-typed/http-module';
import { HasEntities } from '@api-typed/typeorm-module';

export class StandardAppModule
  extends AbstractModule
  implements HasMiddlewares, HasControllers, HasCommands, HasEntities {
  public readonly name = 'standard_app';

  public loadConfig(config: Config) {
    config.loadFromObject({
      cacheDir: '<projectDir>/.cache',
      standard_app: {
        commands: '<rootDir>/commands/**/*{.ts,.js}',
        controllers: '<rootDir>/controllers/**/*{.ts,.js}',
        entities: '<rootDir>/entities/**/*{.ts,.js}',
        middlewares: '<rootDir>/middlewares/**/*{.ts,.js}',
      },
    });
    config.loadFromDir(config.get<string>('rootDir') + '/config');
  }

  public loadControllers(config: Config) {
    const pattern = config.get<string>('standard_app.controllers');
    return loadControllers(pattern);
  }

  public loadMiddlewares(config: Config) {
    const pattern = config.get<string>('standard_app.middlewares');
    return loadMiddlewares(pattern);
  }

  public loadCommands(config: Config) {
    const pattern = config.get<string>('standard_app.commands');
    return loadCommands(pattern);
  }

  public loadEntities(config: Config): string[] {
    const pattern = config.get<string>('standard_app.entities');
    return [pattern];
  }
}
