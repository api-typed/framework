import { ConfigParam } from '@api-typed/config';
import { InjectLogger, LoggerInterface, LogLevel } from '@api-typed/logger';
import { NextFunction, Request, Response } from 'express';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';

@Middleware({ type: 'before' })
export class RequestLogger implements ExpressMiddlewareInterface {
  constructor(
    @InjectLogger() private readonly logger: LoggerInterface,
    @ConfigParam('http.log_level')
    private readonly level: LogLevel = LogLevel.debug,
  ) {}

  public use(request: Request, response: Response, next: NextFunction) {
    const startedAt = process.hrtime();
    const oldEnd = response.end;

    response.end = (...restArgs: unknown[]): void => {
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
