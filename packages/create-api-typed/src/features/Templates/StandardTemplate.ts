import { ConfigParam } from 'api-typed';
import path from 'path';
import { Service } from 'typedi';
import { AbstractTemplate } from '../Templating/AbstractTemplate';
import { NpmPackage } from '../Templating/types';

@Service()
export class StandardTemplate extends AbstractTemplate {
  public name = 'standard';
  protected templateDir: string;

  constructor(
    @ConfigParam('templateDir')
    templateDir: string,
  ) {
    super();
    this.templateDir = path.join(templateDir, 'standard');
  }

  public getPackages(): NpmPackage[] {
    return [
      'class-transformer',
      'class-validator',
      'typedi',
      'typeorm',
      'routing-controllers',
    ];
  }

  public getDevPackages(): NpmPackage[] {
    return ['rimraf'];
  }
}
