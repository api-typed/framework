import * as path from 'path';

export default {
  http: {
    port: process.env.PORT || 3000,
    log_level: 'debug',
    favicon: path.resolve(__dirname, '../../public/favicon.ico'),
  },
};
