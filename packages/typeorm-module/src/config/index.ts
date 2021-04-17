export default {
  typeorm: {
    migrations: '<typeorm.migrationsDir>/*{.js,.ts}',
    migrationsDir: '<rootDir>/migrations',
    connection: {
      type: process.env.DB_TYPE || 'postgres',
      hostname: process.env.DB_HOSTNAME,
      port: process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      logging: process.env.DB_LOGGING,
    },
  },
};
