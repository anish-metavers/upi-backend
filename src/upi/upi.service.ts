import { HttpException, Injectable } from '@nestjs/common';
import { CreateUpiDto, VerifyUtrDto } from './dto/create-upi.dto';
import { UpdateUpiDto } from './dto/update-upi.dto';

@Injectable()
export class UpiService {
  async create(createUpiDto: CreateUpiDto) {
    const { amount, businessUpiId, orderNumber } = createUpiDto;

    const check = await global.DB.UpiModel.findOne({
      where: { orderNumber },
    });
    if (check) {
      throw new HttpException('Order number already exists', 401);
    }

    const busUpiId = await global.DB.UpiModel.create({
      amount,
      businessUpiId,
      orderNumber,
    });
    return {
      message: 'Created successfully',
      data: {
        id: busUpiId.id,
        orderNumber: busUpiId.orderNumber,
      },
    };
  }

  async utrNumberUpdate(id: number, verifyUtrDto: VerifyUtrDto) {
    const { utrNumber } = verifyUtrDto;
    const verify = await global.DB.UpiModel.update(
      {
        utrNumber,
      },
      { where: { id } },
    );
    return {
      message: 'Verify utr number successfully',
      data: {
        id: verify.id,
        utrNumber: verify.utrNumber,
      },
    };
  }

  async findOne(orderNumber: string) {
    const data = await global.DB.UpiModel.findOne({
      attributes: [
        'id',
        'amount',
        'businessUpiId',
        'userUpiId',
        'orderNumber',
        'utrNumber',
        'status',
        'verifyTimestamp',
        'endAt',
      ],
      where: { orderNumber },
    });
    if (!data)
      throw new HttpException('No data found with this orderNumber', 401);

    return data;
  }

  async update(id: number, updateUpiDto: UpdateUpiDto) {
    const { userUpiId } = updateUpiDto;
    const endAt = new Date(new Date().getTime() + 30 * 60000);
    const update = await global.DB.UpiModel.update(
      {
        userUpiId,
        endAt,
      },
      { where: { id } },
    );
    const updatedUser = await global.DB.UpiModel.findOne({
      where: { id },
    });
    return {
      message: 'Updated successfully',
      data: updatedUser,
    };
  }
}
