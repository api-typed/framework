import { Config } from '@api-typed/config';
import {
  LogFormat,
  Logger,
  LoggerInterface,
  LogLevel,
} from '@api-typed/logger';
import { useContainer as useContainerForClassValidator } from 'class-validator';
import findPackageJson from 'find-package-json';
import * as path from 'path';
import Container from 'typedi';
import { loadEnvFiles } from './lib/loadEnvFiles';
import { ModuleInterface } from './Module/ModuleInterface';

/**
 * AppDelegate is responsible for handling running the application
 * in a specific run mode.
 */
export interface AppDelegate {
  start: () => Promise<unknown>;
  stop: (exitCode: number) => Promise<void>;
}

/**
 * Application class that is responsible for wiring up things together.
 */
export class App {
  /**
   * Mode in which the application is currently running, e.g. http or cli.
   */
  private runMode: string;

  /**
   * AppDelegate is responsible for handling running the application
   * in a specific run mode.
   */
  private delegate: AppDelegate;

  /**
   * Loaded modules.
   */
  public readonly modules: ModuleInterface[];

  /**
   * Configuration.
   */
  public readonly config: Config;

  /**
   * DI container.
   */
  public readonly container = Container;

  /**
   * Application logger.
   */
  public readonly logger: LoggerInterface;

  /**
   * Initializes the application.
   *
   * @param rootDir Path to the root of the application, usually best passed as __dirname.
   * @param modules Modules to be loaded in this application.
   */
  constructor(rootDir: string, modules: ModuleInterface[] = []) {
    const packageJsonPath = findPackageJson(rootDir).next().filename;
    if (!packageJsonPath) {
      throw new Error(
        'Could not resolve path to your package.json file. Make sure to pass valid rootDir argument to the App constructor (usually __dirname).',
      );
    }

    this.container.set(App, this);
    this.modules = modules;

    const nodeEnv = process.env.NODE_ENV || 'development';

    const projectDir = path.dirname(packageJsonPath);
    const envFiles = loadEnvFiles(nodeEnv, projectDir);

    this.config = this.initConfig({
      env: nodeEnv,
      rootDir,
      projectDir,
      cacheDir: path.resolve(projectDir, 'cache'),
    });
    this.container.set(Config, this.config);

    this.logger = this.initLogger();
    this.container.set(Logger, this.logger);

    useContainerForClassValidator(this.container);

    const appName = this.config.get('appName');
    const version = this.config.get('version');
    this.logger.debug(`Application "${appName}" (v${version}) initialized`);
    this.logger.debug('Loaded env files:', {
      data: envFiles,
    });
    this.logger.debug('Loaded modules:', {
      data: this.modules.map((mod) => mod.name),
    });
  }

  /**
   * Initializes application configuration.
   */
  private initConfig(initial: Record<string, unknown> = {}): Config {
    // use default global instance of the config
    const config = Config.defaultInstance;

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const packageJson = require(path.join(
      initial.projectDir as string,
      'package.json',
    ));

    // load basic framework config
    config.loadFromObject({
      ...initial,
      appName: packageJson.name,
      version: packageJson.version,
      isProduction: initial.env === 'production',
      isDevelopment: initial.env === 'development',
      isTest: initial.env === 'test',
      log: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'compact',
      },
    });

    // load configs from all the modules
    this.modules.map((mod) => mod.loadConfig(config));

    config.freeze();

    return config;
  }

  /**
   * Initializes application main logger.
   */
  private initLogger(): LoggerInterface {
    return new Logger(
      this.config.get<string>('appName'),
      this.config.get<LogLevel>('log.level'),
      this.config.get<LogFormat>('log.format'),
    );
  }

  /**
   * Start the aplication.
   *
   * Calls init() method on all registered modules in sequence.
   */
  public async start(runMode: string): Promise<unknown> {
    this.runMode = runMode;

    const delegates: {
      moduleName: string;
      delegate: AppDelegate;
    }[] = [];

    for (const mod of this.modules) {
      const delegate = await mod.init(this);
      if (delegate) {
        delegates.push({
          moduleName: mod.name,
          delegate,
        });
      }
    }

    if (delegates.length === 0) {
      throw new Error(
        `No module returned an app delegate for ${runMode} run mode. Have you registered all modules you want?`,
      );
    }

    if (delegates.length > 1) {
      const delegateModuleNames = delegates
        .map((info) => info.moduleName)
        .join(', ');
      throw new Error(
        `More than one module returned a delegate for ${runMode} run mode, but only one is allowed. Check init() method of modules ${delegateModuleNames}.`,
      );
    }

    const { delegate, moduleName } = delegates[0];
    this.delegate = delegate;

    this.logger.debug(`Running the app delegated to module "${moduleName}"`);

    return this.delegate.start();
  }

  /**
   * Stop the application.
   *
   * Calls close() method on all registered modules in reverse sequence.
   */
  public async stop(exitCode = 0): Promise<void> {
    const reverseModules = [...this.modules].reverse();
    for (const mod of reverseModules) {
      await mod.close(exitCode, this);
    }

    await this.delegate.stop(exitCode);
  }

  /**
   * What is the run mode?
   */
  public getRunMode(): string | undefined {
    return this.runMode;
  }

  /**
   * Return the assigned delegate.
   */
  public getDelegate(): AppDelegate | undefined {
    return this.delegate;
  }

  /**
   * Get a module with the given name.
   *
   * @param name Module name.
   */
  public getModule(name: string): ModuleInterface {
    const mod = this.modules.find((mod) => mod.name === name);
    if (!mod) {
      throw new Error(`Cannot find module "${name}"`);
    }

    return mod;
  }

  /**
   * Get all registered modules tagged with the given interface.
   *
   * @param checkMethods Method names that MUST be implemented on the module.
   */
  public getTaggedModules<I>(checkMethods: string | string[]): I[] {
    const requiredMethods =
      typeof checkMethods === 'string' ? [checkMethods] : checkMethods;

    const hasInterface = (mod: any): mod is I => {
      return requiredMethods.every((method) => method in mod);
    };

    return this.modules.filter(hasInterface) as any[];
  }

  /**
   * Find all registered modules that are tagged with the given interface
   * and call a loader method on them (with config as the sole argument for
   * convenience).
   *
   * You SHOULD type at least the I interface.
   *
   * @param loaderMethod Name of the loader method that should be in the I interface.
   */
  public loadFromModules<I, R = Function | string>(loaderMethod: string): R[] {
    const providers: I[] = this.getTaggedModules<I>(loaderMethod);

    return providers.reduce((items, mod: I) => {
      return [...items, ...mod[loaderMethod](this.config)];
    }, []);
  }
}
