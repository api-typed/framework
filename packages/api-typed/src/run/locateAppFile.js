/* eslint-disable @typescript-eslint/no-var-requires */
const glob = require('glob');
const path = require('path');

/**
 * Locates Api-Typed App File.
 *
 * @param {string} use What file extension is allowed? 'ts' | 'js'.
 * @returns
 */
function locateAppFile(use = 'ts') {
  const { API_TYPED_APP_FILE } = process.env;
  const rootDir = process.cwd();

  if (API_TYPED_APP_FILE) {
    return path.resolve(rootDir, API_TYPED_APP_FILE);
  }

  if (!['js', 'ts'].includes(use)) {
    throw new Error(
      'Invalid argument passed to locateAppFile(). Only "js" or "ts" is allowed.',
    );
  }

  const pattern = `${rootDir}/{**/,!node_modules/,}app.api-typed.${use}`;
  const files = glob.sync(pattern);

  if (files.length === 0) {
    if (use === 'js') {
      throw new Error(
        'Could not locate compiled app file for Api-Typed.\nMake sure your "app.api-typed.ts" file is getting compiled to JavaScript.',
      );
    }

    throw new Error(
      `Could not locate an app file for Api-Typed.\nPlease create "src/app.api-typed.${use}".`,
    );
  }

  return files[0];
}

module.exports = { locateAppFile };
