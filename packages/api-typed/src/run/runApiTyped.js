/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { locateAppFile } = require('./locateAppFile');
const { runApp } = require('./runApp');

/**
 * Run Api-Typed app programmatically.
 *
 * @param {String} command Command to run or "run" to execute specific runMode.
 * @param {String} runMode Run mode if using "run" command.
 * @param {String[]} argv Any other argv.
 * @param {String | undefined} appFile Optional app file if known.
 */
function runApiTyped(command, runMode, argv, appFile) {
  const isRun = command === 'run';
  if (isRun && !runMode) {
    throw new Error('Run mode expected, e.g.\n\n    $ api-typed run http');
  }

  const isRunDev = isRun && runMode.endsWith('-dev');

  appFile = appFile || locateAppFile(isRunDev || !isRun ? 'ts' : 'js');
  const appRootDir = path.dirname(appFile);

  const devDirs = [appRootDir];
  if (process.env.API_TYPED_DEV_DIRS) {
    process.env.API_TYPED_DEV_DIRS.split(',').map((dir) =>
      devDirs.push(path.resolve(process.cwd(), dir)),
    );
  }

  if (isRunDev) {
    require('nodemon')({
      script: path.resolve(__dirname, './runApp'),
      exec: 'ts-node -r tsconfig-paths/register',
      env: {
        API_TYPED_APP_FILE: appFile,
        API_TYPED_RUN_MODE: runMode.replace(/-dev$/, ''),
        API_TYPED_RUN_ARGV: argv.join(' '),
      },
      watch: devDirs.map((dir) => `${dir}/**`),
      ext: 'ts,json',
      ignore: devDirs.map((dir) => `${dir}/**/*.@(test|spec).ts`),
    })
      .on('log', ({ colour }) => console.log(colour))
      .on('start', () => {
        console.clear();
        console.log(`Starting Api-Typed App using ${appFile} ...`);
      })
      .on('restart', () => console.clear());
    return;
  }

  if (isRun) {
    runApp(appFile, runMode, argv);
    return;
  }

  require('ts-node/register');
  require('tsconfig-paths/register');
  runApp(appFile, 'command');
}

module.exports = { runApiTyped };
