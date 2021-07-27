import { Controller, Get } from '@nestjs/common';
import { AppService } from 'src/app.service';

// hi!
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getMyHello();
  }

  @Get('/ia')
  async getInternalApiHello(): Promise<string> {
    return this.appService.getInternalApiHello();
  }
}
