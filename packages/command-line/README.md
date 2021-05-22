# ⌨️ Api-Typed/Command-Line

> 🥣 An [Api-Typed](https://github.com/api-typed/framework) component.

`Command-Line` helps in creating CLI commands in a structured way, leveraging
the goods of TypeScript and making it easy to use powerful tools like Dependency
Injection Containers.

Using `@Command()` decorator to [register classes as command handlers](#decorator]) is the main and most powerful feature.

It wraps around [Commander](https://www.npmjs.com/package/commander) abstracting
away implementation and configuration details so that all you need to worry
about is writing your well designed code.

# Setup

## With Api-Typed

To get the best developer experience use it with [Api-Typed](https://github.com/api-typed/framework) in your `app.api-typed.ts` file:

```ts
import { App, CommandLineModule } from 'api-typed';

export default new App(__dirname, [
  // ... your other modules
  new CommandLineModule(),
]);
```

It's already included for you out of the box when using [StandardApp](https://github.com/api-typed/framework/tree/main/packages/standard-app#readme).

Then let your app module (or any module you create) implement `HasCommands` interface with a `loadCommands()` method that should return an array of class names that implement `CommandInterface`.

The easiest way to do this:

```ts
import { AbstractModule, HasCommands, loadCommands } from 'api-typed';

export class MyModule extends AbstractModule implements HasCommands {
  public readonly name = 'my_module';

  public loadCommands(config: Config) {
    // load all commands from './commands' dir relative to this file
    return loadCommands(`${__dirname}/commands/**/*.{ts,js}`);
  }
}
```

Call your command with:

```
$ npx api-typed command-name arg1 arg2 --opt1
```

## Stand-alone

You can easily use this as a stand-alone package in any project.

```
$ npm i -S @api-typed/command-line
```

Setup is pretty straight forward:

```ts
import CommandRunner, { loadCommands } from '@api-typed/command-line';

// first register your commands using a glob pattern
loadCommands(`${__dirname}/commands/**/*.{ts,js}`);

// and then call the runner to parse CLI arguments
// and delegate execution to appropriate command class
CommandRunner.run();
```

<a id="decorator"></a>

# Registering commands with `@Command()` decorator

The easiest way to create and register commands is by using the `@Command()` decorator on a class that implements `CommandInterface`:

```ts
import { Command, CommandInterface } from '@api-typed/command-line';

@Command('hello <name> [nickname]', {
  shout: 's',
})
export class Hello implements CommandInterface {
  public async run(
    name: string,
    nickname?: string,
    options: { shout?: boolean } = {},
  ) {
    // ...
  }
}
```

## Command signature

The command signature is also it's name. It's also a very convenient way to define required and optional arguments for the command.

Given:

```ts
@Command('hello <name> [nickname]')
```

The command will be called `hello` and require 1 argument and optionally accept 2nd argument. It could be called with:

```
$ npx api-typed hello Gandalf
```

or

```
$ npx api-typed hello Gandalf "The Grey"
```

These arguments will be mapped to arguments of `.run()` method of the command class:

```ts
import { Command, CommandInterface } from '@api-typed/command-line';

@Command('hello <name> [nickname]')
export class Hello implements CommandInterface {
  public async run(name: string, nickname?: string) {
    // ...
  }
}
```

Arguments are always strings.

## Defining command options

A command can also accept options from the command line in the form of `--option-name` or `-o`. But first you need to register them on the command:

```ts
import { Command, CommandInterface } from '@api-typed/command-line';

@Command('hello <name> [nickname]', {
  shout: 's',
  level: {
    short: 'l',
    description: 'What log level to use?',
    value: 'required',
    default: 'info',
    choices: ['notice', 'error', 'info'],
  },
})
export class Hello implements CommandInterface {
  public async run(name: string, nickname?: string, options = {}) {
    console.log(options);
  }
}
```

The options object is always passed as the last argument to the `.run()` method.

If the above example was called with:

```
$ npx api-typed hello Gandalf -s --level notice
```

The `options` object would look like:

```ts
{
  shout: true,
  level: 'notice',
}
```

# Using Dependency Injection

If you want your commands to be bootstrapped using a dependency injection container (like e.g. [TypeDI](https://github.com/typestack/typedi)) configure it by calling:

```ts
CommandRunner.useContainer(/* your container */);
```

The passed container MUST implement `.get(identifier: Function)` method that can construct and retrieve objects based on their class.

Then your command class supports any methods of dependency injection that your container offers.

# Misc

## Banner

If you want to print out anything before any command output, you can do so using the banner functionality:

```ts
CommandRunner.setBanner(/* any string */);
```

## App Banner

You can also output an "app banner" before any other output:

```ts
CommandRunner.setAppBanner(/* app name */, /* optional version */);
```

You can use both banner and app banner at the same time.

## Start callback

You can execute a callback just before command execution starts using the `.onStart()` method:

```ts
CommandRunner.onStart((signature?: string): void => {
  /* do something */
});
```

The callback will receive a single argument with the `signature` of the executing command.

The callback can be async.

## Custom exit handler

You can execute a callback when the command finishes (either by returning or throwing an error) using the `.onExit()` method:

```ts
CommandRunner.onExit((exitCode: number, error?: unknown) => {
  /* do something */
});
```

The callback will receive an exit code as the 1st argument and an error (if thrown) as 2nd.
