import * as dotenv from 'dotenv';
import * as path from 'path';

/**
 * Loads .env files into memory.
 *
 * Returns list of loaded files.
 *
 * @param envName Name of the environment to load. Usually NODE_ENV value.
 * @param envFilesDir Path to dir in which .env files are located.
 */
export const loadEnvFiles = (
  envName: string,
  envFilesDir: string,
): string[] => {
  const fileList = [
    `.env.${envName}.local`,
    `.env.${envName}`,
    '.env.local',
    '.env',
  ];

  const loadedFiles = [];
  fileList.forEach((fileName) => {
    const res = dotenv.config({ path: path.resolve(envFilesDir, fileName) });
    if (res.parsed) {
      loadedFiles.push(fileName);
    }
  });

  return loadedFiles;
};
