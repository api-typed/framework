import { InjectLogger, LoggerInterface, LogLevel } from '@api-typed/logger';
import { NextFunction, Request, Response } from 'express';
import {
  ExpressErrorMiddlewareInterface,
  HttpError,
  Middleware,
} from 'routing-controllers';

const HttpErrorNames = {
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Payload Too Large',
  414: 'URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Range Not Satisfiable',
  417: 'Expectation Failed',
  418: "I'm A Teapot",
  421: 'Misdirected Request',
  422: 'Unprocessable Entity',
  423: 'Locked',
  424: 'Failed Dependency',
  425: 'Unordered Collection',
  426: 'Upgrade Required',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  431: 'Request Header Fields Too Large',
  451: 'Unavailable For Legal Reasons',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  506: 'Variant Also Negotiates',
  507: 'Insufficient Storage',
  508: 'Loop Detected',
  509: 'Bandwidth Limit Exceeded',
  510: 'Not Extended',
  511: 'Network Authentication Required',
};

@Middleware({ type: 'after' })
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
  constructor(@InjectLogger() private readonly logger: LoggerInterface) {}

  public error(
    error: HttpError & { errors?: unknown[]; code?: string | number },
    request: Request,
    response: Response,
    next: NextFunction,
  ): void {
    const httpCode = error.httpCode || 500;

    response.status(httpCode);
    response.json({
      status: httpCode,
      error: HttpErrorNames[httpCode] || 'Error',
      message: error.httpCode ? error.message : 'Internal Server Error',
      code: error.code,
      errors: error.errors || [],
    });

    this.logger.log(
      httpCode >= 500 ? LogLevel.error : LogLevel.warning,
      error.message || 'Error',
      { ...error },
    );

    next();
  }
}
