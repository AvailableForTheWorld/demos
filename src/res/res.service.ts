import { Injectable } from '@nestjs/common';
import { CreateReDto } from './dto/create-re.dto';
import { UpdateReDto } from './dto/update-re.dto';

@Injectable()
export class ResService {
  create(createReDto: CreateReDto) {
    return 'This action adds a new re';
  }

  findAll() {
    return `This action returns all res`;
  }

  findOne(id: number) {
    return `This action returns a #${id} re`;
  }

  update(id: number, updateReDto: UpdateReDto) {
    return `This action updates a #${id} re`;
  }

  remove(id: number) {
    return `This action removes a #${id} re`;
  }
}
