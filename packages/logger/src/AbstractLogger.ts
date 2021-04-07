import { LoggerInterface, LogMessageData } from './LoggerInterface';
import { LogLevel } from './LogLevel';

/**
 * Abstact Logger class that implements LoggerInterface and redirects all
 * log methods to .log() method that needs to be implemented.
 *
 * When implementing your own logger just extend this abstract class for
 * convenience.
 */
export abstract class AbstractLogger implements LoggerInterface {
  public abstract log(
    level: LogLevel,
    message: string,
    data?: LogMessageData,
  ): void;

  public debug(message: string, data?: LogMessageData): void {
    this.log(LogLevel.debug, message, data);
  }

  public info(message: string, data?: LogMessageData): void {
    this.log(LogLevel.info, message, data);
  }

  public notice(message: string, data?: LogMessageData): void {
    this.log(LogLevel.notice, message, data);
  }

  public warning(message: string, data?: LogMessageData): void {
    this.log(LogLevel.warning, message, data);
  }

  public error(message: string, data?: LogMessageData): void {
    this.log(LogLevel.error, message, data);
  }

  public crit(message: string, data?: LogMessageData): void {
    this.log(LogLevel.crit, message, data);
  }

  public alert(message: string, data?: LogMessageData): void {
    this.log(LogLevel.alert, message, data);
  }

  public emerg(message: string, data?: LogMessageData): void {
    this.log(LogLevel.emerg, message, data);
  }
}
