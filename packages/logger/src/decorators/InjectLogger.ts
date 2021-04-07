import Container from 'typedi';
import { Logger } from '../Logger';

export function InjectLogger(): ParameterDecorator {
  return function (object: any, propertyName: string, index?: number) {
    Container.registerHandler({
      object,
      propertyName,
      index,
      value: (container) => container.get(Logger),
    });
  };
}
