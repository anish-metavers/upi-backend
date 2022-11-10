import { HttpException, Injectable } from '@nestjs/common';
import { CreateUpiDto } from './dto/create-upi.dto';
import { UpdateUpiDto, VerifyUtrDto } from './dto/update-upi.dto';

@Injectable()
export class UpiService {
  async createClientUpi(createUpiDto: CreateUpiDto) {
    const { amount, client_upi_id, order_id } = createUpiDto;

    const check = await global.DB.Transaction.findOne({
      where: { order_id },
    });
    if (check) {
      throw new HttpException('Order id already exists', 401);
    }

    const busUpiId = await global.DB.Transaction.create({
      amount,
      client_upi_id,
      order_id,
    });
    return {
      message: 'Created successfully',
      data: {
        id: busUpiId.id,
        orderNumber: busUpiId.order_id,
      },
    };
  }

  async findOrderId(order_id: string) {
    const data = await global.DB.Transaction.findOne({
      attributes: [
        'id',
        'amount',
        'client_upi_id',
        'user_upi_id',
        'order_id',
        'utr',
        'status',
        'verifyTimestamp',
        'endAt',
      ],
      where: { order_id },
    });
    if (!data) throw new HttpException('No data found with this order id', 401);

    return data;
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
      message: 'Utr updated successfully',
    };
  }

  async updateUserUpi(id: number, updateUpiDto: UpdateUpiDto) {
    const { user_upi_id } = updateUpiDto;
    const endAt = new Date(new Date().getTime() + 30 * 60000);
    const update = await global.DB.Transaction.update(
      {
        user_upi_id,
        endAt,
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
}
