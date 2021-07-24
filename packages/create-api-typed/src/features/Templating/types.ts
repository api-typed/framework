export interface TemplateParams {
  appName: string;
  packageName: string;
  snakeCaseName: string;
  kabebCaseName: string;
}

export interface TemplateFile {
  srcPath: string;
  projectPath: string;
  fileName: string;
  isTemplate?: boolean;
}

type NpmPackageName = string;
type NpmPackageVersion = string;
export type NpmPackage = NpmPackageName | [NpmPackageName, NpmPackageVersion];

export interface Template {
  name: string;

  getFiles(): TemplateFile[];

  getPackages(): NpmPackage[];

  getDevPackages(): NpmPackage[];
}
