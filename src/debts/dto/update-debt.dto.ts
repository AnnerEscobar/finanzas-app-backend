import { PartialType } from '@nestjs/mapped-types';
import { CreateDebtDto } from './create-debt.dto';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class UpdateDebtDto extends PartialType(CreateDebtDto) {




}
