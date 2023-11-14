import { Module } from '@nestjs/common';
import { ResService } from './res.service';
import { ResController } from './res.controller';

@Module({
  controllers: [ResController],
  providers: [ResService]
})
export class ResModule {}
