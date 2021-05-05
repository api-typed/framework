import { InjectLogger, LoggerInterface } from '@api-typed/logger';
import { Job, JobInterface } from '@api-typed/message-queue';
import { Service } from 'typedi';

@Job<GreetingJob>('greeting_job', 'high_priority', {
  delay: 10000,
  generateId: (name) => `job_${name}_${Date.now()}`,
})
@Service()
export class GreetingJob implements JobInterface {
  constructor(@InjectLogger() private readonly logger: LoggerInterface) {}

  public async run(name: string, question?: string): Promise<void> {
    this.logger.info(`Hello ${name}!`);
    if (question) {
      this.logger.info(question);
    }
  }
}
