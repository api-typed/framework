import { App } from '@api-typed/app';
import { HttpModule } from '@api-typed/http-module';

export default new App(__dirname, [new HttpModule()]);
