import { InjectLogger, LoggerInterface } from '@api-typed/logger';
import { Job, JobInterface } from '@api-typed/message-queue';
import { Service } from 'typedi';

@Job({ queue: 'test' })
@Service()
export class TestJob implements JobInterface {
  constructor(@InjectLogger() private readonly logger: LoggerInterface) {}

  public async run(): Promise<void> {
    this.logger.info('🔥🔥🔥🔥🔥🔥🔥🔥🔥 🔥🔥🔥🔥');
  }
}
