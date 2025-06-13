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


  async addPay(_id: string, addPaymentDto: addPaymentDto) {

    const debt = await this.debtEntityModel.findById(addPaymentDto._id);
    if (!debt) throw new NotFoundException();

    debt.amount -= addPaymentDto.payAmount;
    const updated = await debt.save();


    await this.payEntityModel.create({
      debtId: addPaymentDto._id,
      payAmount: addPaymentDto.payAmount,
      interestPay: addPaymentDto.interestPay,
      payDate: addPaymentDto.payDate
    });

    return "La deuda fue actualizada" + updated;

  }



  async findAllWithStats() {
    return this.debtEntityModel.aggregate([
      {
        $lookup: {
          from: 'pays',
          let: { debtIdStr: { $toString: '$_id' } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$debtId', '$$debtIdStr'] }
              }
            }
          ],
          as: 'payments'
        }
      },
      {
        $addFields: {
          totalPaid: { $sum: '$payments.payAmount' },
          initialAmount: { $add: ['$amount', { $sum: '$payments.payAmount' }] }
        }
      },
      {
        $addFields: {
          percentage: {
            $round: [
              { $multiply: [{ $divide: ['$totalPaid', '$initialAmount'] }, 100] },
              0
            ]
          }
        }
      },
      {
        $project: { payments: 0, totalPaid: 0, initialAmount: 0 }
      }
    ]);
  }

  // src/debts/payments.service.ts

  async findAllPayments(): Promise<(PayEntity & { debtName: string })[]> {
    try {
      // populate('debtId', 'debtName') → en lugar de debtId tendrás sólo debtName
      const payments = await this.payEntityModel
        .find()
        .populate('debtId', 'debtName')  // <— aquí
        .lean()                          // opcional: para devolver POJOs
        .exec();

      // Si usas .lean(), cada payment.debtId será un objeto { _id, debtName }.
      // Vamos a aplanarlo para que venga como { …, debtName }
      return payments.map(p => ({
        _id: p._id,
        payAmount: p.payAmount,
        interestPay: p.interestPay,
        payDate: p.payDate,
        debtId: p.debtId._id,        // si aún quieres mantener id
        debtName: (p.debtId as any).debtName,
        __v: p.__v
      }));
    } catch (err) {
      throw new InternalServerErrorException('Error al obtener los pagos');
    }
  }

  // debts.service.ts
// debts.service.ts
async findAllWithStatsDetailed(): Promise<any[]> {
  return this.debtEntityModel.aggregate([
    {
      $lookup: {
        from: 'pays',
        let: { idStr: { $toString: '$_id' } },
        pipeline: [
          { $match: {
              $expr: { $eq: ['$debtId', '$$idStr'] }
          }}
        ],
        as: 'payments'
      }
    },
    {
      $addFields: {
        totalPaid:     { $sum: '$payments.payAmount' },
        initialAmount: { $add: ['$amount', { $sum: '$payments.payAmount' }] }
      }
    },
    {
      $addFields: {
        percentage: {
          $round: [
            {
              $cond: [
                { $eq: ['$initialAmount', 0] },
                0,
                { $multiply: [{ $divide: ['$totalPaid', '$initialAmount'] }, 100] }
              ]
            },
            0
          ]
        }
      }
    },
    { $project: { payments: 0 } }
  ]).exec();
}


async getProgressGeneral(): Promise<ProgressGeneral> {
    try {
      // 1) Sumar todos los saldos pendientes de las deudas
      const debtAgg = await this.debtEntityModel.aggregate([
        { $group: {
            _id: null,
            totalPending: { $sum: '$amount' }
        }}
      ]).exec();
      const totalPending = debtAgg[0]?.totalPending ?? 0;

      // 2) Sumar todos los pagos de capital e intereses
      const payAgg = await this.payEntityModel.aggregate([
        { $group: {
            _id: null,
            totalPaid:     { $sum: '$payAmount' },
            totalInterest: { $sum: '$interestPay' }
        }}
      ]).exec();
      const totalPaid     = payAgg[0]?.totalPaid     ?? 0;
      const totalInterest = payAgg[0]?.totalInterest ?? 0;

      // 3) Calcular total inicial (pendiente + pagado)
      const totalInitial = totalPending + totalPaid;

      // 4) Porcentaje de capital pagado
      const paidPercentage = totalInitial
        ? Math.round((totalPaid / totalInitial) * 100)
        : 0;

      return { totalInitial, totalPaid, totalInterest, totalPending, paidPercentage };
    } catch (err) {
      console.error('Error en getProgressGeneral:', err);
      throw new InternalServerErrorException('No se pudo calcular el progreso general');
    }
  }


}
