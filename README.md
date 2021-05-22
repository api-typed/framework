# 🥣 Api-Typed

![Tests](https://github.com/api-typed/framework/actions/workflows/tests.yml/badge.svg?branch=main)
![E2E Tests](https://github.com/api-typed/framework/actions/workflows/e2e-tests.yml/badge.svg?branch=main)
![Lint](https://github.com/api-typed/framework/actions/workflows/lint.yml/badge.svg?branch=main)
[![codecov](https://codecov.io/gh/api-typed/framework/branch/main/graph/badge.svg?token=XF35AW6T60)](https://codecov.io/gh/api-typed/framework)

🔥 **Early Beta / PoC** - do not try at home!

Opinionated TypeScript framework built on the shoulders of giants.

Api-Typed combines several popular librariers into one framework removing the overhead of setting up a new project and wiring things up together:

- [TypeDI](https://github.com/typestack/typedi) for a friendly dependency injection container
- [TypeORM](https://typeorm.io/) for convenient working with databases
- [Routing Controllers](https://github.com/typestack/routing-controllers) with [express](https://expressjs.com/) for declarative HTTP endpoints definition
- [Commander](https://github.com/tj/commander.js) for building CLI programs
- [winston](https://github.com/winstonjs/winston) for logging

Api-Typed ties these powerful tools together and exposes a convenient pluggable modules design with easy configuration.

# Features

TBD.

# Components

Api-Typed is composed of several components that are published as self-contained npm packages that can be used stand-alone.

### ⌨️ @api-typed/command-line

Helps in creating CLI commands in a structured way, leveraging the goods of TypeScript and making it easy to use powerful tools like Dependency Injection Containers.

[Read more](https://github.com/api-typed/framework/tree/main/packages/command-line#readme)

### ⚙️ @api-typed/config

A simple configuration container with support for injecting params via `@ConfigParam()` decorator.

[Read more](https://github.com/api-typed/framework/tree/main/packages/config#readme)

### 📯 @api-typed/message-queue

Wrapper around BullMQ that abstracts away queue implementation and allows to register jobs handlers with `@Job()` decorator.

[Read more](https://github.com/api-typed/framework/tree/main/packages/message-queue#readme)

### @api-typed/logger

Logger and logging tools.

[Read more](https://github.com/api-typed/framework/tree/main/packages/logger#readme)

# Documentation

TBD.
