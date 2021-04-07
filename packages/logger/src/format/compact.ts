import { MESSAGE } from 'triple-beam';
import { format } from 'winston';

export default format((info) => {
  info[MESSAGE] = [
    new Date().toLocaleTimeString(),
    info.level.toUpperCase(),
    `[${info.channel}]`,
    info[MESSAGE] || info.message,
  ]
    .filter(Boolean)
    .join(' ');

  if (info.data && Object.keys(info.data).length > 0) {
    info[MESSAGE] += `\n${JSON.stringify(info.data, null, 2)}`;
  }

  return info;
});
