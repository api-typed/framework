import { classNameToString } from '@api-typed/common';
import { JobsOptions } from 'bullmq';
import { JobInterface } from '../JobInterface';
import JobMetaDataRegistry, {
  GenerateJobIdFunction,
} from '../JobMetaDataRegistry';

interface JobOptions<T extends JobInterface = any> extends JobsOptions {
  name?: string;
  queue?: string;
  generateId?: GenerateJobIdFunction<T>;
}

function Job<T extends JobInterface = any>(
  options?: JobOptions<T>,
): ClassDecorator;
function Job<T extends JobInterface = any>(
  name: string,
  options?: Omit<JobOptions<T>, 'name'>,
): ClassDecorator;
function Job<T extends JobInterface = any>(
  name: string,
  queue: string,
  options?: Omit<JobOptions<T>, 'name' | 'queue'>,
): ClassDecorator;
function Job<T extends JobInterface = any>(
  nameOrOptions?: string | JobOptions<T>,
  queueOrOptions?: string | JobOptions<T>,
  maybeOptions?: JobOptions<T>,
): ClassDecorator {
  return function (target) {
    const gotName = typeof nameOrOptions === 'string';
    const gotQueue = typeof queueOrOptions === 'string';
    let options: JobOptions = {};

    if (gotName && gotQueue) {
      options = {
        name: nameOrOptions as string,
        queue: queueOrOptions as string,
        ...(maybeOptions || {}),
      };
    } else if (gotName && !gotQueue) {
      options = {
        name: nameOrOptions as string,
        ...((queueOrOptions as JobOptions) || {}),
      };
    } else {
      options = {
        ...((nameOrOptions as JobOptions) || {}),
      };
    }

    JobMetaDataRegistry.register(
      target as any,
      options.name || classNameToString(target as any),
      options.queue,
      options.generateId,
      options,
    );
  };
}

export { Job };
