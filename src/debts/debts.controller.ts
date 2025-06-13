import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { DebtsService } from './debts.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { DebtEntity } from './entities/debt.entity';
import { addPaymentDto } from './dto/add-payment.dto';

@Controller('debts')
export class DebtsController {
  constructor(private readonly debtsService: DebtsService,) { }

  @Post('create')
  createDebt(@Body() createDebtDto: CreateDebtDto) {
    return this.debtsService.CrearDebt(createDebtDto)
  }

  @Get('all-debts')
  listAllDebts(): Promise<DebtEntity[]> {
    return this.debtsService.findAllDebts()
  }

  @Post('add-payment')
  async addPay(
    @Query('_id') _id: string,
    @Body() addPaymentDto: addPaymentDto) {
    const updated = await this.debtsService.addPay(_id, addPaymentDto);
    console.log(_id, addPaymentDto)
  }

  // debts.controller.ts
  @Get('with-stats')
  async findAllWithStats() {
    return this.debtsService.findAllWithStats();
  }

  @Get('all-payments')
  async findAllPayments() {
    return this.debtsService.findAllPayments();
  }

  // debts.controller.ts
  @Get('with-stats-detailed')
  async statsDetailed() {
    return this.debtsService.findAllWithStatsDetailed();
  }

    /** GET /stats/progress-general */
  @Get('progress-general')
  async progressGeneral() {
    return this.debtsService.getProgressGeneral();
  }


}
