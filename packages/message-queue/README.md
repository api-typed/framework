# 📯 Api-Typed/Message-Queue

> 🥣 An [Api-Typed](https://github.com/api-typed/framework) component.

Wrapper around [BullMQ](https://docs.bullmq.io/) that abstracts away queue implementation and allows to register job handlers with a simple `@Job()` decorator.

- Single `MessageQueue` class for adding jobs to queues.
- One class per job helps to keep single responsibility principle.
- Job configuration (target queue, retry strategy, generating id, etc.) lives in a single place.
- Typed job payload that maps to the job handler's arguments 1:1.

# Concepts

While `@Api-Typed/Message-Queue` uses [BullMQ](https://docs.bullmq.io/) internally, it introduces several new concepts and changes how you interact with queues.

## Single place for job configuration

The main concept of `@Api-Typed/Message-Queue` is that when you add a job to a message queue, it shouldn't be your concern at this time on which queue the job should end up or with what configuration the job should be added (unless you want to).

Let's say you have a job to send log messages to Slack. This job is added to queues in many places in your code. All these places should not be concerned with how exactly this job is handled, on what queue it should be added or how many times it should be repeated until successful.

What if you want to change that strategy? Should you update all the places where the job is being added? What if another developer adds this job to a different queue and blocks it?

(Sure, sometimes it depends on the context, but 90% of the time this configuration should be the same regardless of where the job is triggered from.)

## Single service class that routes jobs to their queues

Just like the "dispatchers" of jobs should not be concerned with their configuration, they especially should not care to what queue a specific job belongs. They just want to add a job to processing and move on with their lives, most of the time not caring what happens to it.

In BullMQ you have to obtain `Queue` instance for appropriate queue and then add your job to it. With `@Api-Typed/Message-Queue` there is a single entry point, `MessageQueue` class, that takes care of adding jobs to their designated queues without having to take care of it yourself.

# Setup

## With Api-Typed

To get the best developer experience use it with [Api-Typed](https://github.com/api-typed/framework) in your `app.api-typed.ts` file:

```ts
import { App, MessageQueueModule } from 'api-typed';

export default new App(__dirname, [
  // ... your other modules
  new MessageQueueModule(),
]);
```

It's already included for you out of the box when using [StandardApp](https://github.com/api-typed/framework/tree/main/packages/standard-app#readme).

Then let your app module (or any module you create) implement `HasJobs` interface with a `loadJobs()` method that should return an array of class names that implement `JobInterface`.

The easiest way to do this:

```ts
import { AbstractModule, HasJobs, loadJobs } from 'api-typed';

export class MyModule extends AbstractModule implements HasJobs {
  public readonly name = 'my_module';

  public loadJobs() {
    // load all jobs from './jobs' dir relative to this file
    return loadJobs(`${__dirname}/jobs/**/*.{ts,js}`);
  }
}
```

Then run worker that will handle all jobs with:

```
$ npx api-typed run worker --with-scheduler
```

You can also run workers for specific queues:

```
$ npx api-typed run worker high_priority mid_priority --with-scheduler
```

Or you can run schedulers in separate processes (advised for better performance):

```
$ npx api-typed run worker
$ npx api-typed run scheduler
```

You need to run schedulers if you want to support delayed, scheduled or repeatable jobs.

## Stand-alone

You can easily use this as a stand-alone package in any project.

```
$ npm i -S @api-typed/message-queue
```

You need an entry point to run a worker:

```ts
// worker.ts
import { WorkerRunner, loadJobs } from '@api-typed/message-queue';

// register all your jobs using a glob pattern so that the runner knows about
// job handlers and all queues you're using
loadJobs(`${__dirname}/jobs/**/*.{ts,js}`);

const runner = new WorkerRunner();

runner.start();
```

If you want to run a scheduler the implementation is similar.

To start a worker just call the above script from your command line.

NOTE: You probably also want to bootstrap your application so that the job handlers have access to your whole infrastructure. Therefore, the actual integration might be a bit more complex or part of a bigger system.

# Registering jobs with `@Job()` decorator

The easiest way to create and register jobs handlers is by using the `@Job()` decorator on a class that implements `JobInterface`:

```ts
import { Job, JobInterface } from '@api-typed/message-queue';

@Job({
  queue: 'high_priority',
})
export class SomeJob implements JobInterface {
  public async run(itemId: string, theAnswerToUniverse: number): Promise<void> {
    // job implementation
  }
}
```

The above code will configure the `SomeJob` to be always added to the `high_priority` queue and be handled by this class.

The name of the job that will actually be sent to BullMQ will be generated based on the class name. You can also specify it yourself by using `name: string` option or using the decorator like this:

```ts
@Job('custom_job_name', 'queue_name', {
  // other options
})
```

# Adding jobs

Because the queue to which a job should be added is configured right in the place where the job handler is defined, it is so much easier to add jobs to queues: a single `MessageQueue` class instance will route new jobs to their destination queues.

All the methods described below return a Promise that resolves with BullMQ's `Job` instance that describes the added job.

## Dispatch job immediatelly

If you want a job to be dispatched immediatelly, meaning that it should be processed as soon as possible (which is most usually the case), you should use the `.dispatch()` method.

```ts
import { MessageQueue } from '@api-typed/message-queue';
import { SomeJob } from './jobs/SomeJob';

// this should happen somewhere in your app bootstrap
const mq = new MessageQueue();

mq.dispatch(SomeJob, 'item-id', 42);
```

Yes, the jobs are referred to by their class names. This guards you from ever making typos in strings or makes it unnecessary to come up with enums or consts with all the job names in the app.

But referring to jobs by their class names enabled one more powerful feature of `@Api-Typed/Message-Queue`:

## Job payload and the `.run()` method

Notice that in the examples above the `SomeJob.run()` method accepts two arguments: a string and a number and the call `.dispatch()` call also accepts a string and a number in its arguments.

This is because dispatching a job is almost like calling a function. You can type the job payload arguments just like you can type the job handler's `.run()` arguments.

So if your job handler expected arguments like this:

```ts
class OtherJob implements JobInterface {
  public async run(
    otherId: string,
    someValue: number,
    items: string[],
    options: {
      doSomething?: boolean;
    } = {},
  ) {
    // implementation
  }
}
```

You would dispatch it like this:

```ts
mq.dispatch(OtherJob, 'other-id', 33, ['item1', 'item2', 'item3'], {
  doSomething: true,
});
```

And all these arguments would be properly typed!

With `@Api-Typed/Message-Queue` you don't have to wonder what payload a job accepts and be sure to always send the correct one.

NOTE: Make sure the arguments you use on `.run()` method are as simple as possible, ie. they can be serialized into JSON.

## Delay a job

To dispatch a job with a delay, to be processed after some time, use the `.schedule()` method:

```ts
mq.schedule(5000, SomeJob, 'item-id');
```

The code above will add `SomeJob` to the queue to be processed after 5s (5000 ms).

NOTE: You have to have a scheduler running for `SomeJob`'s designated queue in order for scheduling to work.

## Schedule a job

To dispatch a job to be processed at a specific point in time, also use the `.schedule()` method, but with a `Date` object as the first argument:

```ts
mq.schedule(new Date('2022-05-01T00:20:00'), SomeJob, 'item-id');
```

This will schedule the job to be processed on 1st of May, 2022 at 00:20.

NOTE: If the date is in the past then the job will be processed immediatelly.

NOTE: You have to have a scheduler running for `SomeJob`'s designated queue in order for scheduling to work.

## Repeat a job on a schedule

If you want to repeat a job on a schedule, use the `.repeat()` method:

```ts
mq.repeat({ every: 3600 * 1000 }, SomeJob, 'item-id');
```

This will make the job to be repeated every hour with the given payload.

NOTE: You have to have a scheduler running for `SomeJob`'s designated queue in order for repeating to work.

## Generic adding of jobs

And if you ever need to overwrite the default configuration of a job and gain access to BullMQ's job options, use the `.addJob()` method:

```ts
mq.addJob(SomeJob, ['item-id'], {
  /* job options */
});
```

The difference here is that instead of passing payload normally as subsequent arguments, you must pass them as an array in the second argument. The third argument are BullMQ's job options that will take precedence over any other configuration (except for designated queue).

# Using Dependency Injection

If you want your job classes to be bootstrapped using a dependency injection container (like e.g. [TypeDI](https://github.com/typestack/typedi)) configure it by calling:

```ts
const runner = new WorkerRunner();
runner.useContainer(/* your container */);
```

The passed container MUST implement `.get(identifier: Function)` method that can construct and retrieve objects based on their class.

Then your job class supports any methods of dependency injection that your container offers.

# Generating job id's

To generate a job ID (e.g. so you can store a reference to it and then check its status) you can use the `generateId` option that accepts a function:

```ts
@Job<SomeJob>({
  generateId: (someId, someNumber) => `some_job_${someId}_${someNumber}`,
})
export class SomeJob implements JobInterface {
  public async run(someId: string, someNumber: number) {
    // implementation
  }
}
```

The `generateId` function accepts the same arguments as the `.run()` method making it easy to generate the id based on job's payload. By adding type argument to the `@Job()` decorator we can reuse the types.
