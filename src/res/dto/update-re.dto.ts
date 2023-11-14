import { PartialType } from '@nestjs/mapped-types';
import { CreateReDto } from './create-re.dto';

export class UpdateReDto extends PartialType(CreateReDto) {}
