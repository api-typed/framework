import Container from 'typedi';
import Config from '../Config';

export function ConfigParam<T = unknown>(key: string): ParameterDecorator {
  return function (object: any, propertyName: string, index?) {
    Container.registerHandler({
      object,
      propertyName,
      index,
      value: () => Config.get<T>(key),
    });
  };
}

export function RequireConfigParam<T = unknown>(
  key: string,
  requiredKeys: string[] = [],
): ParameterDecorator {
  return function (object: any, propertyName: string, index?) {
    Container.registerHandler({
      object,
      propertyName,
      index,
      value: () => Config.getRequired<T>(key, requiredKeys),
    });
  };
}
