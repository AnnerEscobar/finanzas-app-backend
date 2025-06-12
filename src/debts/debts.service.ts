import { addPaymentDto } from './dto/add-payment.dto';
import { DebtEntity } from './entities/debt.entity';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateDebtDto } from './dto/create-debt.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PayEntity } from './entities/pay.entity';

@Injectable()
export class DebtsService {

  constructor(
    @InjectModel(DebtEntity.name)
    private readonly debtEntityModel: Model<DebtEntity>,
    @InjectModel(PayEntity.name)
    private readonly payEntityModel: Model<PayEntity>
  ) { }

  async CrearDebt(createDebtDto: CreateDebtDto): Promise<DebtEntity> {

    if (
      createDebtDto.amount <= 0 ||
      createDebtDto.endDate.getTime() <= Date.now() ||
      createDebtDto.interestRate <= 0 ||
      createDebtDto.minimumPayment <= 0) {
      throw new InternalServerErrorException('Debes Ingresar un monto mayor a 0 y una fecha de vencimiento futura');
    }


    const newDebt = new this.debtEntityModel(createDebtDto);
    return await newDebt.save();
  }


  async findAllDebts(): Promise<DebtEntity[]> {

    try {
      return await this.debtEntityModel.find().exec();
    } catch (err) {
      throw new InternalServerErrorException('Error al obtener las deudas')
    }
  }

  async addPay(_id: string, addPaymentDto: addPaymentDto){

    const debt= await this.debtEntityModel.findById(addPaymentDto._id);
    if(!debt) throw new NotFoundException();

    debt.amount -= addPaymentDto.payAmount;
    const updated = await debt.save();


    await this.payEntityModel.create({
      debtId: addPaymentDto._id,
      payAmount: addPaymentDto.payAmount,
      interestPay: addPaymentDto.interestPay,
      payDate: addPaymentDto.payDate
    });

    return "La deuda fue actualizada" + updated ;
    

  }

  

}
