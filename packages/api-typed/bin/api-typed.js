#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
const { runApiTyped } = require('../src/run/runApiTyped');

try {
  const [, , command, runMode, ...argv] = process.argv;
  runApiTyped(command, runMode, argv);
} catch (e) {
  console.error('\n' + e.message + '\n');
  process.exit(1);
}
