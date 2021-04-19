import { TestingTool } from '@api-typed/testing';
import { Repository } from 'typeorm';
import app from '../../example/src/app.api-typed';
import { Recipe } from '../../example/src/entities/Recipe';

describe('TestingTool', (): void => {
  const tt = new TestingTool(app);

  describe('Automatically runs the app', (): void => {
    test('Automatically migrates the database', async (): Promise<void> => {
      const pending = await tt.getConnection().showMigrations();
      expect(pending).toBe(false);
    });

    test('Sets up the app in http run mode', (): void => {
      expect(tt.app.getRunMode()).toBe('http');
    });
  });

  describe('Provides useful tools', (): void => {
    test('.getRepository() returns an entity repository', (): void => {
      const ingredientRepository = tt.getRepository(Recipe);
      expect(ingredientRepository).toBeInstanceOf(Repository);
    });

    test('.get() makes GET requests', async (): Promise<void> => {
      const { body } = await tt.get('/test').expect(200);
      expect(body).toStrictEqual({
        method: 'GET',
        body: null,
      });
    });

    test('.post() makes POST requests', async (): Promise<void> => {
      const { body } = await tt
        .post('/test', { payload: 'api-typed' })
        .expect(200);

      expect(body).toStrictEqual({
        method: 'POST',
        body: { payload: 'api-typed' },
      });
    });

    test('.patch() makes PATCH requests', async (): Promise<void> => {
      const { body } = await tt
        .patch('/test', { payload: 'api-typed' })
        .expect(200);

      expect(body).toStrictEqual({
        method: 'PATCH',
        body: { payload: 'api-typed' },
      });
    });

    test('.put() makes PUT requests', async (): Promise<void> => {
      const { body } = await tt
        .put('/test', { payload: 'api-typed' })
        .expect(200);

      expect(body).toStrictEqual({
        method: 'PUT',
        body: { payload: 'api-typed' },
      });
    });

    test('.delete() makes DELETE requests', async (): Promise<void> => {
      const { body } = await tt
        .delete('/test', { payload: 'api-typed' })
        .expect(200);

      expect(body).toStrictEqual({
        method: 'DELETE',
        body: { payload: 'api-typed' },
      });
    });
  });
});
