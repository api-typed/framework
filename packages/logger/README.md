# 🛠 Api-Typed/Common

> 🥣 An [Api-Typed](https://github.com/api-typed/framework) component.

Logger and logging tools.

- Provides a `LoggerInterface` with industry standard methods.
- Provides an `AbstractLogger` class that implements `LoggerInterface` so you don't have to.
- Provides a `NullLogger` class that can be useful in tests or default values of params to silence any logging transparently.
- Inject logger via `@InjectLogger()` decorator when combined with [TypeDI](https://github.com/typestack/typedi).

This needs work so probably shouldn't be used outside of Api-Typed. But gets the job done for now.

# Installation

```
$ npm i -S @api-typed/config
```

No configuration needed.
