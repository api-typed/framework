# ⚙️ Api-Typed/Config

> 🥣 An [Api-Typed](https://github.com/api-typed/framework) component.

Simple configuration container.

- Exports a global default instance.
- But allows multiple instances.
- Load configuration from objects, files (`.ts`, `.js`, `.json`) or dirs (all files from a directory).
- Freeze to make sure no configuration can be overwritten at later time.
- Reference config params inside other params.
- Inject config params via `@ConfigParam()` decorator when combined with [TypeDI](https://github.com/typestack/typedi).

# Installation

```
$ npm i -S @api-typed/config
```

No configuration needed.

# Usage

The default export of the package is a default global instance of `Config` class. This is the most convenient way to use it (especially if you want to use `@ConfigParam()` decorator).

## Load configuration

```ts
import Config from '@api-typed/config';

// load an object directly
Config.loadFromObject({
  database: {
    hostname: 'localhost',
    username: 'root',
    password: 'root',
    database: 'api_typed',
  },
});

// load config from a file
// - the configuration object should be the default export
// - you can omit extension to load TS or JS file
// - also supports .json
Config.loadFromFile(`${__dirname}/config.ts`);

// load all config files from the given directory
// - will load all TS, JS and JSON files
// - the configuration object should be the default export from all files
Config.loadFromDir(`${__dirname}/config`);

// you can freeze the config to prevent loading any more config params
// useful when bootstrapping an app and you don't want something
// randomly overwriting your configuration
Config.freeze();

// will throw an error at this point
Config.loadFromObject({});
```

## Read configuration

Once your configuration has been loaded you have multiple ways to read it.

```ts
import Config from '@api-typed/config';

// read config param (will read the whole object)
const databaseConfig = Config.get('database');

// you can use dot notation to access nested configuration
const dbHost = Config.get('database.host');

// you can type the return value
const dbPassword = Config.get<string>('database.password');

// you can specify a default value to return if the config param is missing
const dbPort = Config.get<number>('database.port', 5432);

// use `.getRequired()` to throw an error if the config param is missing
const dbUsername = Config.getRequired<string>('database.username');

// pass an array of property names that you expect to be set on the returned object
// if any of them is null or undefined then it will throw
const dbConfig = Config.getRequired('database', [
  'hostname',
  'username',
  'password',
]);
```

## Reference other config params

Sometimes you may want to have config params that depend on other config params.

The most common example are path configurations where they may depend on a single root dir:

Let's say in entry point of your app you have:

```ts
import Config from '@api-typed/config';

Config.loadFromObject({
  rootDir: process.cwd(),
});
```

Then you can have a configuration file e.g. `log.config.ts`:

```ts
export default {
  log: {
    logDir: '<rootDir>/logs',
    outputs: {
      errorLog: '<logDir>/error.log',
      requestLog: '<logDir>/requests.log',
    },
  },
});
```

When you retrieve `log.outputs.errorLog` config param it will be set to `${process.cwd()}/logs/error.log` (where `process.cwd()` will of course resolve to your working dir).

You can use dot notation when referencing other config params.

## Use @ConfigParam() decorator to inject values

If your project uses [TypeDI](https://github.com/typestack/typedi) for a dependency injection container, you may want to inject configuration parameters into your services.

```ts
import { ConfigParam } from '@api-typed/config';
import { Service } from 'typedi';

@Service()
export class DatabaseService {
  constructor(
    @ConfigParam<string>('database.hostname')
    private readonly hostname: string,

    @ConfigParam<string>('database.username')
    private readonly username: string,

    @ConfigParam<string>('database.password')
    private readonly password: string,

    @ConfigParam<number>('database.port', { optional: true })
    private readonly host: number = 5432,
  ) {}
}
```

## Create other instances of `Config`

You can create more instance of the config if you wish so. Just use the exported `Config` class:

```ts
import { Config } from '@api-typed/config';

const myConfig = new Config();
myConfig.loadFromObject({
  port: 3000,
});

const myOtherConfig = new Config();
myOtherConfig.loadFromObject({
  port: 4000,
});

myConfig.get('port'); // 3000
myOtherConfig.get('port'); // 4000
```

NOTE: `@ConfigParam()` doesn't have access to custom instances of the config, so you won't be able to use it.
