export default {
  appName: 'Api-Typed Example App',
  log: {
    level: process.env.LOG_LEVEL || 'debug',
  },
  typeorm: {
    connection: {
      // match what's in docker-compose.yml
      hostname: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'api_typed',
    },
  },
};
