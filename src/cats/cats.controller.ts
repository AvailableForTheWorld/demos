import {
  Controller,
  Get,
  Post,
  HttpCode,
  Query,
  Param,
  Body,
} from '@nestjs/common'

interface CreateCatDto {
  name: string
  age: number
  breed: string
}

@Controller('cats')
export class CatsController {
  @Post('create')
  createCat(@Body() createCatDto: CreateCatDto) {
    return `This action adds a new cat ${createCatDto.name}`
  }

  @Get(':id')
  getCats(@Param() params, @Query('ver') ver: number): string {
    if (ver < 3)
      return `This action returns no more than three cats ${params.id}`
    return `This action returns all cats ${params.id}`
  }
  @Post()
  @HttpCode(203)
  create() {
    return 'This action adds a new cat'
  }
}
