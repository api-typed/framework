import { ClassName } from './ClassName';

export function classNameToString(target: ClassName): string {
  let className = '';
  target.toString().replace(/^class ([\w\d]+) /i, (_, resourceName) => {
    className = resourceName;
    return '';
  });
  return className;
}
