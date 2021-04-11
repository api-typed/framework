import Container from 'typedi';
import Config from '../Config';

interface ConfigParamOptions {
  optional?: boolean;
  requiredKeys?: string[];
}

export function ConfigParam<T = unknown>(
  key: string,
  options: ConfigParamOptions = {},
): ParameterDecorator {
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
