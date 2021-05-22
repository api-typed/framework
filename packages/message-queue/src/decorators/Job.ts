import { classNameToString } from '@api-typed/common';
import { JobsOptions } from 'bullmq';
import { JobInterface } from '../JobInterface';
import JobMetaDataRegistry, {
  GenerateJobIdFunction,
} from '../JobMetaDataRegistry';

interface JobOptions<T extends JobInterface = any> extends JobsOptions {
  /**
   * Job name.
   *
   * If omitted it will be generated from the class name.
   */
  name?: string;
  /**
   * Name of the queue on which the jobs are added.
   */
  queue?: string;
  /**
   * A function to generate job's ID.
   */
  generateId?: GenerateJobIdFunction<T>;
}

/**
 * Register the class to be a job handler.
 *
 * The job name will be generated from the class name and the queue name will
 * be "default".
 *
 *      ＠Job()
 *      class SomeJob implements JobInterface {
 *        ...
 *      }
 */
function Job(): ClassDecorator;
/**
 * Register the class to be a job handler.
 *
 *      ＠Job({
 *        queue: 'high_priority',
 *        attempts: 5,
 *        generateId: (arg1) => `some_job_${arg1}`,
 *      })
 *      class SomeJob implements JobInterface {
 *        ...
 *      }
 *
 * @param options Job options. Refer to BullMQ job options.
 */
function Job<T extends JobInterface = any>(
  options?: JobOptions<T>,
): ClassDecorator;
/**
 * Register the class to be a job handler, giving the job a custom name.
 *
 *      ＠Job('some_job', {
 *        queue: 'high_priority',
 *        attempts: 5,
 *        generateId: (arg1) => `some_job_${arg1}`,
 *      })
 *      class SomeJob implements JobInterface {
 *        ...
 *      }
 *
 * @param name Job name.
 * @param options Job options. Refer to BullMQ job options.
 */
function Job<T extends JobInterface = any>(
  name: string,
  options?: Omit<JobOptions<T>, 'name'>,
): ClassDecorator;
/**
 * Register the class to be a job handler.
 *
 *      ＠Job('some_job', 'high_priority', {
 *        attempts: 5,
 *        generateId: (arg1) => `some_job_${arg1}`,
 *      })
 *      class SomeJob implements JobInterface {
 *        ...
 *      }
 *
 * @param name Job name.
 * @param options Job options. Refer to BullMQ job options.
 */
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
