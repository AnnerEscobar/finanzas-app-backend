import { Module } from '@nestjs/common';
import { DebtsService } from './debts.service';
import { DebtsController } from './debts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DebtEntity, DebtSchema } from './entities/debt.entity';
import { PayEntity, paySchema } from './entities/pay.entity';

@Module({
  controllers: [DebtsController],
  providers: [DebtsService],
  imports: [
    MongooseModule.forFeature([
      {name: DebtEntity.name, schema: DebtSchema},
      {name: PayEntity.name, schema: paySchema},
    ])]
})
export class DebtsModule {}
