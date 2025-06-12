import { IsDate, IsNumber, IsString } from "class-validator";

export class addPaymentDto {
    
    @IsNumber()
    payAmount: number;

    @IsNumber()
    interestPay?: number;

    @IsDate()
    payDate: Date;

    @IsString()
    _id: string;
}