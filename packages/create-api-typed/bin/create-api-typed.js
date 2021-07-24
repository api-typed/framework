#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { runApiTypedCommand } = require('api-typed');

const appFile = path.resolve(__dirname, '../dist/app.api-typed.js');

try {
  const [, , ...argv] = process.argv;
  runApiTypedCommand('create', argv, appFile);
} catch (e) {
  console.error('\n' + e.message + '\n');
  process.exit(1);
}
