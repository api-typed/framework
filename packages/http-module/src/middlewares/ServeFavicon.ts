import { ConfigParam } from '@api-typed/config';
import express from 'express';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import favicon from 'serve-favicon';

@Middleware({ type: 'before', priority: 10 })
export class ServeFavicon implements ExpressMiddlewareInterface {
  private readonly favicon;

  constructor(@ConfigParam('http.favicon') private readonly path: string) {
    this.favicon = favicon(this.path);
  }

  public use(
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) {
    this.favicon(request, response, next);
  }
}
