// eslint-disable-next-line @typescript-eslint/no-var-requires
const { requireApp } = require('./requireApp');

async function runApp(appFile, runMode) {
  const app = requireApp(appFile);
  try {
    await app.start(runMode);
  } catch (e) {
    console.error(e);
  }
}

const { API_TYPED_APP_FILE, API_TYPED_RUN_MODE } = process.env;
if (API_TYPED_APP_FILE && API_TYPED_RUN_MODE) {
  runApp(API_TYPED_APP_FILE, API_TYPED_RUN_MODE);
}

module.exports = { runApp };
