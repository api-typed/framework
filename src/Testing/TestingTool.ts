import * as supertest from 'supertest';
import { Connection, EntityTarget, Repository } from 'typeorm';
import { App, AppRunMode } from '../App';

interface TestingToolOptions {
  setup?: boolean;
  migrate?: boolean;
}

export class TestingTool {
  public readonly app: App;

  private options: TestingToolOptions = {
    setup: true,
    migrate: true,
  };

  private expressApp: Express.Application;

  private initiated = false;

  constructor(
    app: App,
    options: TestingToolOptions = {},
    runMode: AppRunMode = AppRunMode.HTTP,
  ) {
    this.app = app;
    this.options = {
      ...this.options,
      ...options,
    };

    if (this.options.setup) {
      beforeAll(
        async (): Promise<void> => {
          await this.init(runMode);
        },
      );

      afterAll(
        async (): Promise<void> => {
          await this.close();
        },
      );
    }
  }

  public async init(runMode: AppRunMode = AppRunMode.HTTP): Promise<void> {
    if (this.initiated) {
      throw new Error('App Under Test has already been initiated.');
    }

    const res = await this.app.start(runMode);

    switch (runMode) {
      case AppRunMode.Command:
        break;
      case AppRunMode.HTTP:
        this.expressApp = res;
        break;
    }

    if (this.options.migrate) {
      const connection = this.app.get(Connection);
      await connection.runMigrations();

      // seed ?
    }

    this.initiated = true;
  }

  public async close(): Promise<void> {
    if (!this.initiated) {
      return;
    }

    if (this.options.migrate) {
      const connection = this.app.get(Connection);
      await connection.dropDatabase();
    }

    await this.app.stop();
  }

  public getRepository<Entity>(
    target: EntityTarget<Entity>,
  ): Repository<Entity> {
    return this.app.get(Connection).getRepository(target);
  }

  public request(
    method: 'get' | 'post' | 'patch' | 'put' | 'delete',
    url: string,
    body: any = {},
  ): supertest.Test {
    if (!this.expressApp) {
      throw new Error('The app has not been initialized in HTTP run mode.');
    }

    const test = supertest(this.expressApp)[method](url);

    if (method !== 'get') {
      test.set('Content-Type', 'application/json');
      test.send(body);
    }

    return test;
  }

  public get(url: string): supertest.Test {
    return this.request('get', url);
  }

  public post(url: string, body: any): supertest.Test {
    return this.request('post', url, body);
  }

  public patch(url: string, body: any): supertest.Test {
    return this.request('patch', url, body);
  }

  public put(url: string, body: any): supertest.Test {
    return this.request('put', url, body);
  }

  public delete(url: string, body: any): supertest.Test {
    return this.request('delete', url, body);
  }

  // @todo exec() to test commands
}
