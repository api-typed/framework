import { globRequire } from '@api-typed/common';

/**
 * Easily load commands from a directory using a glob pattern.
 *
 * @param pattern Glob pattern
 */
export const loadCommands = (pattern: string): Function[] => {
  return Object.values(globRequire(pattern) as Record<string, Function>);
};
