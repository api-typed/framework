import { App } from '@api-typed/app';
import { deleteFile, writeFile } from '@api-typed/common';
import { ConfigParam } from '@api-typed/config';
import path from 'path';
import { Inject, Service } from 'typedi';
import { TypeORMModule } from '../../TypeORMModule';

@Service()
export class ConfigDumper {
  private readonly path: string;

  constructor(
    @Inject(() => App) private readonly app: App,
    @ConfigParam('typeorm.connection') private readonly connectionInfo,
    @ConfigParam('typeorm.migrationsDir') private readonly migrationsDir,
    @ConfigParam('cacheDir') cacheDir: string,
  ) {
    this.path = path.resolve(cacheDir, 'typeorm/ormconfig.js');
  }

  public async dump(): Promise<string> {
    const typeormModule = this.app.getModule('typeorm') as TypeORMModule;

    const configData = {
      ...this.connectionInfo,
      entities: typeormModule.getEntities(),
      migrations: typeormModule.getMigrations(),
      cli: {
        // have to make the migration dir relative to cwd because of how
        // TypeORM uses it (cwd + / + dir), so just make it go up to the dir
        // root and in again
        migrationsDir: this.migrationsDir
          .split('/')
          .filter(Boolean)
          .reduce((path, dir) => {
            return ['..', ...path, dir];
          }, [])
          .join('/'),
      },
    };

    await writeFile(
      this.path,
      `module.exports = ${JSON.stringify(configData)};`,
    );
    return this.path;
  }

  public async clear(): Promise<void> {
    await deleteFile(this.path);
  }
}
