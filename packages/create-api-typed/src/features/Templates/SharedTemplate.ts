import { ConfigParam } from 'api-typed';
import path from 'path';
import { Service } from 'typedi';
import { AbstractTemplate } from '../Templating/AbstractTemplate';
import { NpmPackage } from '../Templating/types';

@Service()
export class SharedTemplate extends AbstractTemplate {
  public name = 'shared';
  protected templateDir: string;

  constructor(
    @ConfigParam('templateDir')
    templateDir: string,
  ) {
    super();
    this.templateDir = path.join(templateDir, 'shared');
  }

  public getPackages(): NpmPackage[] {
    return ['api-typed', 'reflect-metadata'];
  }

  public getDevPackages(): NpmPackage[] {
    return ['@types/node', 'jest', 'ts-jest', 'typescript'];
  }
}
