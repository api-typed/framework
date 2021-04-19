import { TestingTool } from '@api-typed/testing';
import app from '../../example/src/app.api-typed';

describe('ErrorHandler', (): void => {
  const tt = new TestingTool(app);

  const errorCodes = [
    [400, 'Bad Request'],
    [401, 'Unauthorized'],
    [403, 'Forbidden'],
    [404, 'Not Found'],
    [409, 'Conflict'],
    [500, 'Internal Server Error'],
  ];

  test.each(errorCodes)(
    'returns normalized error object for %s code',
    async (errorCode, error) => {
      const { body } = await tt
        .get(`/test/error/${errorCode}`)
        .expect(errorCode);

      expect(body).toStrictEqual({
        status: errorCode,
        error,
        message: 'Custom test message',
        errors: [],
      });
    },
  );
});
