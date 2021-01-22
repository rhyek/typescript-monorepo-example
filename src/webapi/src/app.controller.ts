import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { makeMessage } from '@my/lib';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    // return this.appService.getHello();
    return makeMessage();
  }
}
