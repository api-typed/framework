export type ClassName<T = any> = {
  new (...args: any[]): T;
};
