#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
const { runApiTyped } = require('../src/run/runApiTyped');

try {
  let [, , command, runMode, ...argv] = process.argv;
  if (command !== 'run') {
    argv = [command, runMode, ...argv];
    command = 'command';
    runMode = null;
  }
  runApiTyped(command, runMode, argv);
} catch (e) {
  console.error('\n' + e.message + '\n');
  process.exit(1);
}
