import { HttpException, Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
// import { Sequelize } from 'sequelize';
import { ThirdPartyService } from 'src/third-party/third-party.service';
import { UpdateUpiDto, VerifyUtrDto } from './dto/update-upi.dto';

@Injectable()
export class TransactionService {
  constructor(private readonly thirdPartyService: ThirdPartyService) {}

  async getTransactionList(client_id: number, query: any) {
    const transactions = await global.DB.Transaction.findAll({
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
        //[Sequelize.fn('Count', Sequelize.col('client_id')), 'TransactionID']
      ],
      where: { client_id },
    });
    if (!transactions) throw new HttpException('Invalid client id', 400);
    return transactions;
  }

  async initTransaction(order_id: string, query: any) {
    const { client_id } = query;
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
      where: { order_id, client_id },
    });

    if (!data) {
      const ApiRes = await this.thirdPartyService.callApiForClient({
        apiReq: { query: { order_id } },
        apiType: 'GET_TRANSACTION',
        client_id,
      });

      //   if (!ApiRes || !ApiRes.response || !ApiRes.response.isError )
      //     throw new HttpException('Something Went Wrong on Client Side!!', 401);
      const data = ApiRes.response.response;
      if (data.status != 'OPEN')
        throw new HttpException('This Transaction Status is not OPEN!', 401);

      const clientUpi = await global.DB.ClientUpi.findAll({
        where: { status: '1' },
      });

      const randIndex = Math.floor(Math.random() * clientUpi.length);

      await global.DB.Transaction.create({
        client_upi: clientUpi[randIndex].upi,
        client_upi_id: clientUpi[randIndex].id,
        client_id,
        order_id,
        amount: data.amount,
        note: data.note,
        status: data.status,
      });

      return await global.DB.Transaction.findOne({
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
        where: { order_id, client_id },
      });
    }

    return data;
  }

  async updateUserUpi(id: number, updateUpiDto: UpdateUpiDto) {
    const { user_upi } = updateUpiDto;

    const transaction = await global.DB.Transaction.findOne({ where: { id } });

    if (!transaction) throw new HttpException('Transaction Not Found', 404);

    if (transaction.status != 'OPEN')
      throw new HttpException('This Transaction is already Submitted!!', 400);

    const end_at = new Date(new Date().getTime() + 30 * 60000);

    await transaction.update({
      user_upi,
      end_at,
    });

    return {
      message: 'Updated successfully',
      data: transaction,
    };
  }

  async updateUtr(id: number, verifyUtrDto: VerifyUtrDto) {
    const { utr } = verifyUtrDto;
    const transaction = await global.DB.Transaction.findOne({ where: { id } });

    if (!transaction) throw new HttpException('Transaction Not Found', 404);

    if (transaction.status != 'OPEN')
      throw new HttpException('This Transaction is already Submitted!!', 400);

    await transaction.update({
      utr,
      status: 'SUBMITTED',
    });
    return {
      statusCode: 201,
      success: true,
      message: 'Utr updated successfully',
    };
  }
}
