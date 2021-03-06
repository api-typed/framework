import * as Express from 'express';
import { Server } from 'net';
import { createExpressServer, useContainer } from 'routing-controllers';
import Container, { Token } from 'typedi';
import { App, AppDelegate, AppRunMode } from '../App';
import { AbstractModule } from '../App/AbstractModule';
import { Config } from '../Config';
import { loadMiddlewares } from '../lib/loadMiddlewares';
import { HasControllers, HasMiddlewares } from './types';

/**
 * Names of services registered by the HTTP Application.
 */
export const HttpServices = {
  ExpressApp: new Token<Express.Application>('express_app'),
  ExpressServer: new Token<Server>('express_server'),
};

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
    config.loadFromFile(__dirname + '/config');
  }

  public loadMiddlewares() {
    return loadMiddlewares(`${__dirname}/middlewares/*{.ts,.js}`);
  }

  public init(app: App): void | AppDelegate {
    this.app = app;

    useContainer(Container);

    this.expressApp = createExpressServer({
      controllers: app.loadFromModules<HasControllers, Function>(
        'loadControllers',
      ),
      middlewares: app.loadFromModules<HasMiddlewares, Function>(
        'loadMiddlewares',
      ),
    });
    Container.set(HttpServices.ExpressApp, this.expressApp);

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

    app.logger.debug('Loaded HTTP routes', { data: routes });

    if (app.getRunMode() === AppRunMode.HTTP) {
      return this;
    }
  }

  public async start(): Promise<Express.Application> {
    await new Promise((resolve) => {
      const port = this.app.config.get<number>('http.port');
      this.server = this.expressApp.listen(port, () => {
        this.app.logger.info(`HTTP server listening on port :${port}`);
        resolve(this.server);
      });
      Container.set(HttpServices.ExpressServer, this.server);
    });

    return this.expressApp;
  }

  public async stop(): Promise<void> {
    this.server.close();
  }
}
