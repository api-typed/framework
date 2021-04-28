import { classNameToString } from '@api-typed/common';
import { JobsOptions } from 'bullmq';
import JobMetaDataRegistry, {
  GenerateJobIdFunction,
} from '../JobMetaDataRegistry';

interface JobOptions extends JobsOptions {
  name?: string;
  queue?: string;
  generateId?: GenerateJobIdFunction;
}

function Job(options?: JobOptions): ClassDecorator;
function Job(name: string, options?: Omit<JobOptions, 'name'>): ClassDecorator;
function Job(
  name: string,
  queue: string,
  options?: Omit<JobOptions, 'name' | 'queue'>,
): ClassDecorator;
function Job(
  nameOrOptions?: string | JobOptions,
  queueOrOptions?: string | JobOptions,
  maybeOptions?: JobOptions,
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
