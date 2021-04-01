import { Config } from './Config';

describe('Config', (): void => {
  const config = new Config();

  describe('#loadFromObject', (): void => {
    test('loads object into config', (): void => {
      config.loadFromObject({
        key1: 'val1',
        key2: {
          subkey1: 'subval1',
          subkey2: 'subval2',
          subkey3: {
            subSubKey: true,
          },
        },
      });

      expect(config['params']).toStrictEqual({
        key1: 'val1',
        key2: {
          subkey1: 'subval1',
          subkey2: 'subval2',
          subkey3: {
            subSubKey: true,
          },
        },
      });
    });
  });

  describe('#get', (): void => {
    test('returns expected value', (): void => {
      config.loadFromObject({
        thingToGet: 'the-thing',
      });
      expect(config.get('thingToGet')).toEqual('the-thing');
    });

    test('allows access by dot notation', (): void => {
      config.loadFromObject({
        my_settings: {
          nested: {
            key: 'value',
            isItTrue: false,
          },
        },
      });
      expect(config.get('my_settings.nested.key')).toEqual('value');
      expect(config.get('my_settings.nested.isItTrue')).toEqual(false);
    });

    test('returns scalar values', (): void => {
      config.loadFromObject({
        scalar: {
          key1: 'val1',
          key2: 'val2',
        },
      });
      expect(config.get('scalar')).toStrictEqual({
        key1: 'val1',
        key2: 'val2',
      });
    });

    test('returns default value if param not found', (): void => {
      expect(config.get('some.missing_value', 'default')).toEqual('default');
    });

    test('resolves <references> in string params', (): void => {
      config.loadFromObject({
        rootDir: '/var/www',
        srcDir: '<rootDir>/src',
        dirs: {
          models: '<srcDir>/models',
          userModel: '<dirs.models>/User',
          dataModel: '../../<rootDir>/<dirs.models>/User',
        },
      });

      expect(config.get('srcDir')).toEqual('/var/www/src');
      expect(config.get('dirs.models')).toEqual('/var/www/src/models');
      expect(config.get('dirs.userModel')).toEqual('/var/www/src/models/User');
      expect(config.get('dirs.dataModel')).toEqual(
        '../..//var/www//var/www/src/models/User',
      );
    });

    test('throws error if trying to resolve non-string param', (): void => {
      config.loadFromObject({
        obj: {
          key1: 'val1',
        },
        arr: [0, 1, 2, 3],
        str: 'This should throw <obj>',
        str2: 'An array <arr>',
      });

      expect(() => config.get('str')).toThrow();
      expect(() => config.get('str2')).toThrow();
    });
  });
});
