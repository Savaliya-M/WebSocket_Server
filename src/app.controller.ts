import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  createConnection(): string {
    // return this.socketGateway.create("created");
    return "heloo"
  }
}
