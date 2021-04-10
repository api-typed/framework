/* eslint-disable @typescript-eslint/no-var-requires */
const { App } = require('@api-typed/app');

/**
 * Require the given app file and make sure it returns Api-Typed App instance.
 *
 * @param {string} appFile Path to the app file.
 * @returns
 */
function requireApp(appFile) {
  const app = require(appFile).default;

  if (!(app instanceof App)) {
    throw new Error(
      `App file "${appFile} did not export instance of Api-Typed App as a default.`,
    );
  }

  return app;
}

module.exports = { requireApp };
