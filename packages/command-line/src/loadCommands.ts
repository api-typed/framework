import { globRequire } from '@api-typed/common';

export const loadCommands = (pattern: string): Function[] => {
  return Object.values(globRequire(pattern) as Record<string, Function>);
};
