import { Module } from '@nestjs/common';
import { DebtsModule } from './debts/debts.module';

@Module({
  imports: [DebtsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

