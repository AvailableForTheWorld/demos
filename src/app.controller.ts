import { Controller, Get, Inject } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('hello_world') private hello_world: { name: string; age: number },
  ) {}
  @Get()
  getHello(): string {
    console.log(this.hello_world, 'this.hello_world')
    return this.appService.getHello()
  }
}
