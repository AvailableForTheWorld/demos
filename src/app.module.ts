import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CatsController } from './cats/cats.controller'
import { ResModule } from './res/res.module'
import { CoffeesController } from './coffees/coffees.controller'
import { CoffeesService } from './coffees/coffees.service'

@Module({
  imports: [ResModule],
  controllers: [AppController, CatsController, CoffeesController],
  providers: [
    AppService,
    {
      provide: 'hello_world',
      useValue: {
        name: 'hello',
        age: 4000000000,
      },
    },
    CoffeesService,
  ],
})
export class AppModule {}
