import * as glob from 'glob';
import { get, merge } from 'lodash';

/**
 * Holds application configuration that can be loaded from files.
 */
export class Config {
  /**
   * Holds all the configuration.
   */
  private readonly params: Record<string, any> = {};

  /**
   * All the loaded config files.
   */
  private loadedFiles: string[] = [];

  /**
   * Is the config frozen?
   */
  private isFrozen = false;

  /**
   * Freeze the config to prevent from loading any new configuration.
   */
  public freeze(): void {
    this.isFrozen = true;
  }

  /**
   * Loads all files in the given folder as config files and merges them with
   * the existing configuration.
   *
   * Looks for JS, TS and JSON files.
   *
   * @param configDir Path to a config directory.
   */
  public loadFromDir(configDir: string): void {
    glob.sync(`${configDir}/**/*{.js,.ts,.json}`).map((filePath) => {
      this.loadFromFile(filePath);
    });
  }

  /**
   * Loads configuration from file and merges it with the existing configuration.
   *
   * @param filePath Path to a config file. Best to omit extension if it's
   *                 a TypeScript file so it can be loaded after compilation too.
   */
  public loadFromFile(filePath: string): void {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const loadedFile = require(filePath);

    this.loadFromObject(loadedFile.default || loadedFile);

    this.loadedFiles.push(filePath);
  }

  /**
   * Merges the passed object with the existing configuration.
   *
   * @param obj Configuration object.
   */
  public loadFromObject(obj: Record<string, any>): void {
    if (this.isFrozen) {
      throw new Error('Cannot load new configuration into a frozen config');
    }

    merge(this.params, obj);
  }

  /**
   * Return a configuration parameter.
   *
   * @param key Param name. Use dot notation to access nested params.
   * @param defaultValue Default value if not found.
   */
  public get<T = any>(key: string, defaultValue?: T): T {
    let param = get(this.params, key, defaultValue);

    // resolve <references>
    if (typeof param === 'string') {
      param = this.resolve(param);
    }

    return param;
  }

  /**
   * Return a configuration parameter and throw an error if it's not found or
   * doesn't have the required shape.
   *
   * @param key Param name. Use dot notation to access nested params.
   * @param requiredKeys If the value is an object then check for these required
   *                     keys.
   */
  public getRequired<T = any>(key: string, requiredKeys: string[] = []): T {
    const param = this.get<T>(key);

    if (param === undefined || param === null) {
      throw new Error(`Could not find required config param for ${key}`);
    }

    if (typeof param === 'object') {
      const objKeys = Object.keys(param);
      const missingKeys = requiredKeys.filter(
        (requiredKey) =>
          !objKeys.includes(requiredKey) ||
          param[requiredKey] === undefined ||
          param[requiredKey] === null,
      );
      if (missingKeys.length > 0) {
        const missingKeysList = missingKeys.join(', ');
        throw new Error(
          `Config param "${key}" is missing required keys: ${missingKeysList}`,
        );
      }
    }

    return param;
  }

  /**
   * Resolve <references> to config params in the given string.
   *
   * @param value String value.
   */
  public resolve(value: string): string {
    return value.replace(/<([\w\d.]+)>/g, (match, refName) => {
      const resolved = this.get(refName);
      if (!['string', 'number', 'undefined'].includes(typeof resolved)) {
        throw new Error(
          `Cannot reference non-scalar param "${refName}" while resolving "${value}"`,
        );
      }
      return resolved;
    });
  }
}
