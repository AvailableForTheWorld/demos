import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Coffee } from './entities/coffee.entity'

@Injectable()
export class CoffeesService {
  private coffees: Coffee[] = [
    {
      id: 1,
      name: 'starbucks',
      brand: 'starbucks',
      flavors: ['chocolate', 'vanilla'],
    },
  ]

  findAll() {
    return this.coffees
  }

  findOne(id: string) {
    // throw 'A random error' // this will throw a 500 error
    const coffee = this.coffees.find((item: Coffee) => item.id === +id)
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`)
    }
    return coffee
  }

  create(createCoffeeDto: any) {
    this.coffees.push(createCoffeeDto)
    return this.coffees
  }

  update(id: string, updateCoffeeDto: any) {
    const existingCoffee = this.findOne(id)
    if (existingCoffee) {
      // update the existing entity
      // existingCoffee = { ...existingCoffee, ...updateCoffeeDto }
    }
  }

  remove(id: string) {
    const coffeeIndex = this.coffees.findIndex(
      (item: Coffee) => item.id === +id,
    )
    if (coffeeIndex >= 0) {
      this.coffees.splice(coffeeIndex, 1)
    }
  }
}
