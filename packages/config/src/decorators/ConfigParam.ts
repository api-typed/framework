import Container from 'typedi';
import Config from '../Config';

interface ConfigParamOptions {
  optional?: boolean;
  requiredKeys?: string[];
}

/**
 * Inject value of the requested config parameter.
 *
 * @param key Name of the parameter.
 * @param options Options.
 */
export function ConfigParam<T = unknown>(
  key: string,
  options: ConfigParamOptions = {},
): ParameterDecorator | PropertyDecorator {
  const { optional = false, requiredKeys = [] } = options;
  return function (object: any, propertyName: string, index?) {
    Container.registerHandler({
      object,
      propertyName,
      index,
      value: () =>
        optional ? Config.get(key) : Config.getRequired<T>(key, requiredKeys),
    });
  };
}
