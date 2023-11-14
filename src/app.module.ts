import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CatsController } from './cats/cats.controller'
import { ResModule } from './res/res.module'
import { CoffeesModule } from './coffees/coffees.module'

@Module({
  imports: [ResModule, CoffeesModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'hello_world',
      useValue: {
        name: 'hello',
        age: 4000000000,
      },
    },
  ],
})
export class AppModule {}
