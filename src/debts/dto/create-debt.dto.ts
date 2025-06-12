import { Type } from 'class-transformer';
import { IsArray, IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDebtDto {

    @IsString()
    debtName: string;

    @IsNumber()
    @Type(() => Number)
    amount: number;

    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    interestRate: number;

    @IsDate()
    @Type(() => Date)
    endDate: Date;

    @IsNumber()
    @Type(() => Number)
    minimumPayment: number;

}
