import { HttpException, Injectable, Req } from '@nestjs/common';
import { CreateUpiDto } from './dto/create-upi.dto';
import { UpdateUpiDto, VerifyUtrDto } from './dto/update-upi.dto';

@Injectable()
export class UpiService {
  async createClientUpi(createUpiDto: CreateUpiDto) {
    const { amount, client_upi, order_id } = createUpiDto;

    const check = await global.DB.Transaction.findOne({
      where: { order_id },
    });
    if (check) {
      throw new HttpException('Order id already exists', 401);
    }

    const busUpiId = await global.DB.Transaction.create({
      amount,
      client_upi,
      order_id,
    });
    return {
      message: 'Created successfully',
      statusCode: 201,
      data: {
        id: busUpiId.id,
        order_id: busUpiId.order_id,
        amount: busUpiId.amount,
      },
    };
  }

  async findOrderId(order_id: string) {
    const data = await global.DB.Transaction.findOne({
      attributes: [
        'id',
        'amount',
        'client_upi',
        'user_upi',
        'order_id',
        'utr',
        'status',
        'verify_timestamp',
        'end_at',
        'note',
      ],
      where: { order_id },
    });
    if (!data) throw new HttpException('No data found with this order id', 401);

    return data;
  }

  async updateUserUpi(id: number, updateUpiDto: UpdateUpiDto) {
    const { user_upi } = updateUpiDto;
    const end_at = new Date(new Date().getTime() + 30 * 60000);
    const update = await global.DB.Transaction.update(
      {
        user_upi,
        end_at,
      },
      { where: { id } },
    );
    const updatedUser = await global.DB.Transaction.findOne({
      where: { id },
    });
    return {
      message: 'Updated successfully',
      data: updatedUser,
    };
  }

  async updateUtr(id: number, verifyUtrDto: VerifyUtrDto) {
    const { utr } = verifyUtrDto;

    const update = await global.DB.Transaction.update(
      {
        utr,
      },
      { where: { id } },
    );
    if (!update[0]) {
      throw new HttpException('No data found with this id', 401);
    }
    return {
      statusCode: 201,
      success: true,
      message: 'Utr updated successfully',
    };
  }

  async transactionListUpi(id: number) {
    //const id = req['client_id'];
    const transactions = await global.DB.Transaction.findOne({
      attributes: [
        'id',
        'client_id',
        'order_id',
        'amount',
        'client_upi',
        'user_upi',
        'note',
        'utr',
        'verify_timestamp',
        'end_at',
        'status',
      ],
      where: { id },
    });
    if (!transactions) throw new HttpException('Invalid client id', 400);
    return transactions;
  }

  
}
