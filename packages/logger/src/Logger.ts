import {
  createLogger as createWinstonLogger,
  format as winstonFormat,
  Logform,
  Logger as WinstonLogger,
  transports,
} from 'winston';
import { AbstractLogger } from './AbstractLogger';
import compact from './format/compact';
import { LogMessageData } from './LoggerInterface';
import { LogLevel } from './LogLevel';

export enum LogFormat {
  Compact = 'compact',
  JSON = 'json',
}

export class Logger extends AbstractLogger {
  private readonly logger: WinstonLogger;

  private readonly channel: string;

  private readonly level: LogLevel;

  constructor(
    channel: string,
    level: LogLevel = LogLevel.info,
    format: LogFormat = LogFormat.Compact,
  ) {
    super();

    this.channel = channel;
    this.level = level;

    this.logger = createWinstonLogger({
      level,
      format: this.createFormat(format),
      transports: [new transports.Console()],
    });
  }

  private createFormat(format: LogFormat): Logform.Format {
    switch (format) {
      case LogFormat.Compact:
        return winstonFormat.combine(
          winstonFormat.colorize({
            message: true,
            colors: {
              debug: 'dim',
              info: 'white',
              notice: 'yellow',
              warning: 'yellow',
              error: 'red',
              crit: 'red',
              alert: 'red',
              emerg: 'red',
            },
          }),
          compact(),
        );

      case LogFormat.JSON:
      default:
        return winstonFormat.json();
    }
  }

  public log(
    level: LogLevel,
    message: string,
    data: LogMessageData = {},
  ): void {
    if (this.level === LogLevel.none) {
      return;
    }

    this.logger.log(level, message, { channel: this.channel, ...data });
  }
}
