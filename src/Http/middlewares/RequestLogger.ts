import express from 'express';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { ConfigParam } from '../../Config';
import { InjectLogger, LoggerInterface, LogLevel } from '../../Logger';

@Middleware({ type: 'before' })
export class RequestLogger implements ExpressMiddlewareInterface {
  private readonly level;

  private readonly logger;

  constructor(
    @InjectLogger() logger: LoggerInterface,
    @ConfigParam('http.log_level') level: LogLevel = LogLevel.debug,
  ) {
    this.logger = logger;
    this.level = level;
  }

  public use(
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) {
    const startedAt = process.hrtime();
    const oldEnd = response.end;

    response.end = (...restArgs: any[]): void => {
      const timeDiff = process.hrtime(startedAt);

      const meta = {
        executionTime: timeDiff[0] * 1e3 + timeDiff[1] * 1e-6,
        httpVersion: request.httpVersion,
        ip: request.ip,
        method: request.method,
        origin: request.headers.origin,
        pathname: request.path,
        referer: request.headers.referer,
        status: response.statusCode,
        timestamp: new Date().toUTCString(),
        url: request.originalUrl,
        userAgent: request.headers['user-agent'],
      };

      const message = [
        `HTTP ${meta.status}`,
        `${Math.round(meta.executionTime)} ms`,
        meta.method,
        meta.url,
      ].join(' ');

      let level = this.level;
      if (meta.status >= 400) {
        level = LogLevel.warning;
      }
      if (meta.status >= 500) {
        level = LogLevel.error;
      }

      this.logger.log(level, message, meta);

      oldEnd.apply(response, restArgs);
    };

    next();
  }
}
