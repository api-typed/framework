import * as fs from 'fs';
import mkdirp from 'mkdirp';
import * as path from 'path';

/**
 * Read file to a string.
 *
 * @param filePath
 */
export const readFile = async (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (error, data) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(data.toString());
    });
  });
};

/**
 * Write string to a file.
 *
 * Will create the file and its whole path if it doesn't exist.
 *
 * @param filePath
 */
export const writeFile = async (
  filePath: string,
  data: string,
): Promise<void> => {
  await mkdirp(path.dirname(filePath));
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
};

/**
 * Delete file.
 *
 * @param filePath
 */
export const deleteFile = async (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
};

/**
 * Is there a directory at the given path?
 *
 * @param dirPath
 */
export const isDir = (dirPath: string): boolean => {
  let lstat;
  try {
    lstat = fs.lstatSync(dirPath);
  } catch {
    return false;
  }

  if (lstat?.isDirectory()) {
    return true;
  }

  return false;
};
