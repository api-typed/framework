import { InjectLogger, LoggerInterface, readFile, writeFile } from 'api-typed';
import { execSync } from 'child_process';
import Handlebars from 'handlebars';
import path from 'path';
import { Inject, Service } from 'typedi';
import { SharedTemplate } from '../Templates/SharedTemplate';
import { StandardTemplate } from '../Templates/StandardTemplate';
import { NpmPackage, Template, TemplateFile, TemplateParams } from './types';

@Service()
export class TemplateProcessor {
  private templates: Template[] = [];

  constructor(
    @Inject(() => SharedTemplate)
    sharedTemplate: Template,

    @Inject(() => StandardTemplate)
    standardTemplate: Template,

    @InjectLogger()
    private readonly logger: LoggerInterface,
  ) {
    this.templates = [sharedTemplate, standardTemplate];
  }

  public getTemplate(name: string): Template {
    const template = this.templates.find((t) => t.name === name);
    if (!template) {
      throw new Error(`Could not find template called "${name}"`);
    }

    return template;
  }

  public async install(
    names: string | string[],
    projectDir: string,
    params: TemplateParams,
  ): Promise<void> {
    const templateNames = typeof names === 'string' ? [names] : names;
    const templates = templateNames.map((name) => this.getTemplate(name));

    for (const template of templates) {
      await this.installFiles(template, projectDir, params);
    }

    for (const template of templates) {
      await this.installDependencies(template, projectDir);
    }
  }

  private async installFiles(
    template: Template,
    projectDir: string,
    params: TemplateParams,
  ): Promise<void> {
    this.logger.debug(`Installing files from template "${template.name}"`);

    await Promise.all(
      template
        .getFiles()
        .map((file) => this.installFile(file, projectDir, params)),
    );
  }

  private async installFile(
    file: TemplateFile,
    projectDir: string,
    params: TemplateParams,
  ): Promise<void> {
    this.logger.debug(`Installing file "${file.projectPath}"`);

    const targetPath = path.join(projectDir, file.projectPath);

    const fileContent = await readFile(file.srcPath);

    if (!file.isTemplate) {
      await writeFile(targetPath, fileContent);
      return;
    }

    const compiled = Handlebars.compile(fileContent)(params);
    await writeFile(targetPath, compiled);
  }

  private async installDependencies(
    template: Template,
    projectDir: string,
  ): Promise<void> {
    await this.installPackages(template.getPackages(), projectDir);
    await this.installPackages(template.getDevPackages(), projectDir, {
      dev: true,
    });
  }

  private async installPackages(
    packages: NpmPackage[],
    projectDir: string,
    { dev = false }: { dev?: boolean } = {},
  ): Promise<void> {
    if (packages.length === 0) {
      return;
    }

    const pkgString = packages
      .map((pkg) => {
        if (typeof pkg === 'string') {
          return pkg;
        }

        return `${pkg[0]}@${pkg[1]}`;
      })
      .join(' ');

    const cmd = `npm i ${dev ? '-D' : '-S'} ${pkgString}`;
    this.logger.debug(cmd);

    execSync(cmd, { stdio: 'inherit', cwd: projectDir });
  }
}
