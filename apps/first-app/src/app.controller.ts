import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
// d
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello() {
    return this.appService.getHello();
  }
}
