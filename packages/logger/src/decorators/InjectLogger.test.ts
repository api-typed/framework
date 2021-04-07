import Container, { Service } from 'typedi';
import { Logger } from '../Logger';
import { LoggerInterface } from '../LoggerInterface';
import { InjectLogger } from './InjectLogger';

@Service()
class TestClass {
  constructor(@InjectLogger() public readonly logger: LoggerInterface) {}
}

describe('@InjectLogger', (): void => {
  const testLogger = new Logger('test');

  beforeAll(() => {
    Container.set(Logger, testLogger);
  });
  test('injects logger', (): void => {
    const testObj = Container.get(TestClass);
    expect(testObj.logger).toBe(testLogger);
  });
});
