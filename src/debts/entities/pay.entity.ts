import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { DebtEntity } from "./debt.entity";
import { Types } from "mongoose";


@Schema({ collection: 'pays' })
export class PayEntity {

    @Prop()
    payAmount: number;

    @Prop()
    interestPay?: number;

    @Prop()
    payDate: Date;

    @Prop({ type: Types.ObjectId, ref: DebtEntity.name, required: true })
    debtId: Types.ObjectId;

}

export const paySchema = SchemaFactory.createForClass(PayEntity);