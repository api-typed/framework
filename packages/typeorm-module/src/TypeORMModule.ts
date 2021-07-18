import { AbstractModule, App } from '@api-typed/app';
import { HasCommands, loadCommands } from '@api-typed/command-line';
import { Config } from '@api-typed/config';
import { Connection, createConnection, useContainer } from 'typeorm';
import { HasEntities } from './HasEntities';
import { HasEntitySubscribers } from './HasEntitySubscribers';

export class TypeORMModule extends AbstractModule implements HasCommands {
  public readonly name = 'typeorm';

  private entities: string[] = [];

  private migrations: string[] = [];

  private subscribers: (Function | string)[] = [];

  private connection: Connection;

  public loadConfig(config: Config): void {
    config.loadFromDir(__dirname + '/config');
  }

  public loadCommands() {
    return loadCommands(`${__dirname}/commands/**/*{.ts,.js}`);
  }

  public async init(app: App): Promise<void> {
    const options = app.config.getRequired<any>('typeorm.connection', [
      'type',
      'hostname',
      'port',
      'username',
      'password',
      'database',
    ]);

    useContainer(app.container, {
      fallback: true,
      fallbackOnErrors: true,
    });

    this.entities = app.loadFromModules<HasEntities, string>('loadEntities');
    this.migrations = [app.config.getRequired('typeorm.migrations')];
    this.subscribers = app.loadFromModules<HasEntitySubscribers>(
      'loadEntitySubscribers',
    );

    this.connection = await createConnection({
      ...options,
      entities: this.entities,
      migrations: this.migrations,
      subscribers: this.subscribers,
    });
  }

  public async close(): Promise<void> {
    await this.connection.close();
  }

  public getConnection(): Connection {
    return this.connection;
  }

  public getEntities(): string[] {
    return this.entities;
  }

  public getMigrations(): string[] {
    return this.migrations;
  }

  public getSubscribers(): (Function | string)[] {
    return this.subscribers;
  }
}
