#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { locateAppFile } = require('../src/locateAppFile');
const { runApp } = require('../src/runApp');

function main(command, runMode) {
  const isRun = command === 'run';
  if (isRun && !runMode) {
    throw new Error('Run mode expected, e.g.\n\n    $ api-typed run http');
  }

  const isRunDev = isRun && runMode.endsWith('-dev');

  const appFile = locateAppFile(isRunDev || !isRun ? 'ts' : 'js');
  const appRootDir = path.dirname(appFile);

  if (isRunDev) {
    return require('nodemon')({
      script: path.resolve(__dirname, '../src/run'),
      exec: 'ts-node',
      env: {
        API_TYPED_APP_FILE: appFile,
        API_TYPED_RUN_MODE: runMode.replace(/-dev$/, ''),
      },
      watch: [`${appRootDir}/**`],
      ext: 'ts,json',
      ignore: [`${appRootDir}/**/*.@(test|spec).ts`],
    })
      .on('log', ({ colour }) => console.log(colour))
      .on('start', () => {
        console.clear();
        console.log(`Starting Api-Typed App using ${appFile} ...`);
      })
      .on('restart', () => console.clear());
  }

  if (isRun) {
    return runApp(appFile, runMode);
  }

  require('ts-node/register');
  runApp(appFile, 'command');
}

try {
  const [, , command, runMode] = process.argv;
  main(command, runMode);
} catch (e) {
  console.error('\n' + e.message + '\n');
  process.exit(1);
}
