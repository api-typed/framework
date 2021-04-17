import { AbstractModule, App, AppDelegate } from '@api-typed/app';
import { Config } from '@api-typed/config';
import { useContainer as useContainerForClassValidator } from 'class-validator';
import * as Express from 'express';
import { Server } from 'net';
import { createExpressServer, useContainer } from 'routing-controllers';
import { HasControllers } from './HasControllers';
import { HasMiddlewares } from './HasMiddlewares';
import { loadMiddlewares } from './lib/loadMiddlewares';

/**
 * App module that is responsible for handling HTTP server configuration.
 */
export class HttpModule
  extends AbstractModule
  implements AppDelegate, HasMiddlewares {
  public readonly name = 'http';

  private app: App;

  private expressApp: Express.Application;

  private server: Server;

  public loadConfig(config: Config) {
    config.loadFromDir(__dirname + '/config');
  }

  public loadMiddlewares() {
    return loadMiddlewares(`${__dirname}/middlewares/*{.ts,.js}`);
  }

  public init(app: App): void | AppDelegate {
    this.app = app;

    useContainer(app.container);
    useContainerForClassValidator(app.container);

    if (app.getRunMode() === 'http') {
      return this;
    }
  }

  public async start(): Promise<Express.Application> {
    this.expressApp = createExpressServer({
      defaultErrorHandler: false,
      controllers: this.app.loadFromModules<HasControllers, Function>(
        'loadControllers',
      ),
      middlewares: this.app.loadFromModules<HasMiddlewares, Function>(
        'loadMiddlewares',
      ),
    });

    this.logRoutes();

    if (!this.app.config.get('isTest')) {
      await new Promise((resolve) => {
        const port = this.app.config.get<number>('http.port');
        this.server = this.expressApp.listen(port, () => {
          this.app.logger.info(`HTTP server listening on port :${port}`);
          resolve(this.server);
        });
      });
    }

    return this.expressApp;
  }

  public async stop(): Promise<void> {
    if (this.server) {
      this.server.close();
    }
  }

  private logRoutes(): void {
    const routes: string[] = this.expressApp._router.stack.reduce(
      (routes, middleware) => {
        if (!middleware.route) {
          return routes;
        }

        const { method } = middleware.route.stack[0];
        const { path } = middleware.route;

        return [...routes, `${method.toUpperCase()} ${path}`];
      },
      [],
    );

    this.app.logger.debug('Loaded HTTP routes', { data: routes });
  }
}
