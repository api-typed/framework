import { Controller, Get } from 'routing-controllers';
import { Service } from 'typedi';

@Controller('/')
@Service()
export class HomeController {
  @Get()
  public home(): string {
    return '👍';
  }
}
