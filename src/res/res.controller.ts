import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ResService } from './res.service';
import { CreateReDto } from './dto/create-re.dto';
import { UpdateReDto } from './dto/update-re.dto';

@Controller('res')
export class ResController {
  constructor(private readonly resService: ResService) {}

  @Post()
  create(@Body() createReDto: CreateReDto) {
    return this.resService.create(createReDto);
  }

  @Get()
  findAll() {
    return this.resService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReDto: UpdateReDto) {
    return this.resService.update(+id, updateReDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.resService.remove(+id);
  }
}
