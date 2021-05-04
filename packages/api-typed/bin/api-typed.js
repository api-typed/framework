#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { locateAppFile } = require('../src/run/locateAppFile');
const { runApp } = require('../src/run/runApp');

function main(command, runMode, argv) {
  const isRun = command === 'run';
  if (isRun && !runMode) {
    throw new Error('Run mode expected, e.g.\n\n    $ api-typed run http');
  }

  const isRunDev = isRun && runMode.endsWith('-dev');

  const appFile = locateAppFile(isRunDev || !isRun ? 'ts' : 'js');
  const appRootDir = path.dirname(appFile);

  const devDirs = [appRootDir];
  if (process.env.API_TYPED_DEV_DIRS) {
    process.env.API_TYPED_DEV_DIRS.split(',').map((dir) =>
      devDirs.push(path.resolve(process.cwd(), dir)),
    );
  }

  if (isRunDev) {
    return require('nodemon')({
      script: path.resolve(__dirname, '../src/run/runApp'),
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
  }

  if (isRun) {
    return runApp(appFile, runMode, argv);
  }

  require('ts-node/register');
  require('tsconfig-paths/register');
  runApp(appFile, 'command');
}

try {
  const [, , command, runMode, ...argv] = process.argv;
  main(command, runMode, argv);
} catch (e) {
  console.error('\n' + e.message + '\n');
  process.exit(1);
}
