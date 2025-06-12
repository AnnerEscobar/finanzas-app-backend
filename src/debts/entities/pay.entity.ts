import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";


@Schema({ collection: 'pays' })
export class PayEntity {

    @Prop()
    payAmount: number;

    @Prop()
    interestPay?: number;

    @Prop()
    payDate: Date;

    @Prop()
    debtId: string;

}

export const paySchema = SchemaFactory.createForClass(PayEntity);