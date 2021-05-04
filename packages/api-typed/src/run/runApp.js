/* eslint-disable @typescript-eslint/no-var-requires */
require('reflect-metadata');
const { requireApp } = require('./requireApp');

async function runApp(appFile, runMode, argv) {
  const app = requireApp(appFile);
  try {
    await app.start(runMode, argv);
  } catch (e) {
    console.error(e);
  }
}

const {
  API_TYPED_APP_FILE,
  API_TYPED_RUN_MODE,
  API_TYPED_RUN_ARGV,
} = process.env;
if (API_TYPED_APP_FILE && API_TYPED_RUN_MODE) {
  const argv = API_TYPED_RUN_ARGV ? API_TYPED_RUN_ARGV.split(' ') : [];
  runApp(API_TYPED_APP_FILE, API_TYPED_RUN_MODE, argv);
}

module.exports = { runApp };
