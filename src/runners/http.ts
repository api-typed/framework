import { App, AppRunMode } from '../App';
import requireApp from '../lib/requireApp';

const run = async (appFile: string): Promise<void> => {
  const app = requireApp(appFile) as App;
  try {
    await app.start(AppRunMode.HTTP);
  } catch (e) {
    console.error(e);
  }
};

if (
  process.env.API_TYPED_MODE === 'http-dev' &&
  process.env.API_TYPED_APP_FILE
) {
  run(process.env.API_TYPED_APP_FILE);
}

export default run;
