import { App, CommandLineModule, StandardAppModule } from 'api-typed';

export default new App(__dirname, [
  new CommandLineModule(),
  new StandardAppModule(),
]);
