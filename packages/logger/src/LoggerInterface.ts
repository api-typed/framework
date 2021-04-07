import { LogLevel } from './LogLevel';

export type LogMessageData = Record<string, unknown>;

export interface LoggerInterface {
  log(level: LogLevel, message: string, data?: LogMessageData): void;
  debug(message: string, data?: LogMessageData): void;
  info(message: string, data?: LogMessageData): void;
  notice(message: string, data?: LogMessageData): void;
  warning(message: string, data?: LogMessageData): void;
  error(message: string, data?: LogMessageData): void;
  crit(message: string, data?: LogMessageData): void;
  alert(message: string, data?: LogMessageData): void;
  emerg(message: string, data?: LogMessageData): void;
}
