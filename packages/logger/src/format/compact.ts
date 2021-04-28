import omit from 'lodash.omit';
import { MESSAGE } from 'triple-beam';
import { format } from 'winston';
import { LogLevel } from '../LogLevel';

export default format((info) => {
  info[MESSAGE] = [
    new Date().toLocaleTimeString(),
    info.level.toUpperCase(),
    `[${info.channel}]`,
    info[MESSAGE] || info.message,
  ]
    .filter(Boolean)
    .join(' ');

  const outputData =
    info.level !== LogLevel.debug
      ? omit(info, [MESSAGE, 'level', 'message', 'channel'])
      : info.data || {};

  if (Object.keys(outputData).length > 0) {
    info[MESSAGE] += `\n${JSON.stringify(outputData, null, 2)}`;
  }

  return info;
});
