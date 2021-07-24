import glob from 'glob';
import path from 'path';
import { Template, TemplateFile } from './types';

export abstract class AbstractTemplate implements Template {
  public abstract name: string;

  protected abstract readonly templateDir: string;

  public getFiles(): TemplateFile[] {
    const templateDirRegExp = new RegExp(`^${this.templateDir}/`);

    const templateFiles = glob
      .sync(`${this.templateDir}/**/*`, {
        nodir: true,
        dot: true,
      })
      .map(
        (srcPath): TemplateFile => {
          return {
            srcPath,
            fileName: path.basename(srcPath),
            projectPath: srcPath
              .replace(templateDirRegExp, '')
              .replace(/\.hbs$/, ''),
            isTemplate: srcPath.endsWith('.hbs'),
          };
        },
      );

    return templateFiles;
  }

  public getPackages(): (string | [string, string])[] {
    return [];
  }

  public getDevPackages(): (string | [string, string])[] {
    return [];
  }
}
