import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ collection: 'debts' })
export class DebtEntity {

    @Prop({ required: true })
    debtName: string;

    @Prop({ required: true })
    amount: number;

    @Prop()
    interestRate: number;

    @Prop({ required: true })
    endDate: Date;

    @Prop({ required: true })
    minimumPayment: number;

}

export const DebtSchema = SchemaFactory.createForClass(DebtEntity);
