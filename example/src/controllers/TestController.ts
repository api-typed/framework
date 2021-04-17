import {
  BadRequestError,
  Body,
  Delete,
  ForbiddenError,
  Get,
  HttpError,
  InternalServerError,
  JsonController,
  Param,
  Patch,
  Post,
  Put,
  UnauthorizedError,
} from 'routing-controllers';
import { Service } from 'typedi';

@JsonController('/test')
@Service()
export class TestController {
  @Get()
  public get(): any {
    return {
      method: 'GET',
      body: null,
    };
  }

  @Get('/error/:code')
  public getError(@Param('code') code: number): void {
    const message = 'Custom test message';
    switch (code) {
      case 400:
        throw new BadRequestError(message);
      case 401:
        throw new UnauthorizedError(message);
      case 403:
        throw new ForbiddenError(message);
      case 500:
        throw new InternalServerError(message);
      default:
        throw new HttpError(code, message);
    }
  }

  @Post()
  public post(@Body() body: any): any {
    return {
      method: 'POST',
      body,
    };
  }

  @Patch()
  public patch(@Body() body: any): any {
    return {
      method: 'PATCH',
      body,
    };
  }

  @Put()
  public put(@Body() body: any): any {
    return {
      method: 'PUT',
      body,
    };
  }

  @Delete()
  public delete(@Body() body: any): any {
    return {
      method: 'DELETE',
      body,
    };
  }
}
