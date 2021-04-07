import * as glob from 'glob';

/**
 * Load files based on a glob pattern.
 *
 * @param pattern
 */
export const globRequire = (pattern: string): Record<string, unknown> => {
  return glob.sync(pattern, { nodir: true }).reduce((imports, file) => {
    if (file.endsWith('.d.ts')) {
      return imports;
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const imprts = require(file);
    return { ...imports, ...imprts };
  }, {});
};
