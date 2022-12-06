import { HttpException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Op } from 'sequelize';
import { ThirdPartyService } from 'src/third-party/third-party.service';
import { TransactionListFilterDto } from './dto/create-upi.dto';
import {
  InitTransactionDTO,
  UpdateStatusDto,
  UpdateUpiDto,
  VerifyUtrDto,
} from './dto/update-upi.dto';

@Injectable()
export class TransactionService {
  constructor(private readonly thirdPartyService: ThirdPartyService) {}

  async getTransactionList(
    req: Request,
    transactionListQuery: TransactionListFilterDto,
  ) {
    const {
      utr,
      client_upi_id,
      user_upi,
      order_id,
      amount_end,
      amount_start,
      status,
      verify_timestamp_end,
      verify_timestamp_start,
      created_at_start,
      created_at_end,
      updated_at_end,
      updated_at_start,
      note,
    } = transactionListQuery;

    const client_id = req['client_id'];
    const user_id = req['user_id'];
    const isMaster = req['isMaster'];

    const userUpis = await global.DB.UserUpi.findAll({
      where: { user_id },
    });

    let filterObject: any = { ...(!isMaster ? { client_id } : {}) };

    if (!isMaster && userUpis && userUpis.length > 0) {
      filterObject.client_upi_id = {
        [Op.in]: userUpis.map((item) => item.client_upi_id),
      };
    }

    if (utr) filterObject.utr = { [Op.like]: `%${utr}%` };
    if (user_upi) filterObject.user_upi = { [Op.like]: `%${user_upi}%` };
    if (note) filterObject.note = { [Op.like]: `%${note}%` };
    if (status) filterObject.status = status;
    if (client_upi_id) filterObject.client_upi_id = client_upi_id;
    if (order_id) filterObject.order_id = order_id;
    if (amount_start && amount_end)
      filterObject.amount = { [Op.between]: [amount_start, amount_end] };
    if (created_at_end && created_at_start)
      filterObject.created_at = {
        [Op.between]: [new Date(created_at_start), new Date(created_at_end)],
      };
    if (updated_at_end && updated_at_start)
      filterObject.updated_at = {
        [Op.between]: [new Date(updated_at_start), new Date(updated_at_end)],
      };
    if (verify_timestamp_end && verify_timestamp_start)
      filterObject.verify_timestamp = {
        [Op.between]: [
          new Date(verify_timestamp_start),
          new Date(verify_timestamp_end),
        ],
      };

    const transactions = await global.DB.Transaction.findAll({
      where: filterObject,
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
        'created_at',
        'updated_at',
      ],
    });
    if (!transactions) throw new HttpException('Invalid client id', 400);

    return {
      success: true,
      statusCode: 200,
      response: { data: transactions },
    };
  }

  async initTransaction(order_id: string, query: InitTransactionDTO) {
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

      if (
        !ApiRes ||
        !ApiRes.response ||
        !ApiRes.response.status ||
        ApiRes.response.response
      )
        throw new HttpException(
          {
            message: 'Something Went Wrong on Client Side!!',
            errorMessage: ApiRes?.response?.message,
          },
          401,
        );
      const data = ApiRes.response.response.transaction;

      if (data.status != 'OPEN')
        throw new HttpException('This Transaction Status is not OPEN!', 401);

      const clientUpi = await global.DB.ClientUpi.findAll({
        where: { client_id, status: '1' },
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
      status: 'PROCESSING',
    });

    const ApiRes = await this.thirdPartyService.callApiForClient({
      apiReq: {
        query: { order_id: transaction.order_id },
        body: { status: 'PROCESSING' },
      },
      apiType: 'UPDATE_TRANSACTION',
      client_id: transaction.client_id,
    });

    if (!ApiRes.response.success)
      throw new HttpException('Client API Error', 400);

    return {
      statusCode: 201,
      success: true,
      message: 'Utr updated successfully',
    };
  }

  async updateTrxnStatus(
    id: number,
    client_id: string | number,
    updateStatusDto: UpdateStatusDto,
  ) {
    const { status } = updateStatusDto;

    if (!client_id)
      throw new HttpException(
        { message: 'Master Admin can not change Transaction Status!!' },
        404,
      );

    const transaction = await global.DB.Transaction.findOne({ where: { id } });

    if (!transaction) throw new HttpException('Transaction Not Found', 404);

    if (status != 'PROCESSING' && status != 'COMPLETED' && status != 'FAILED')
      throw new HttpException('Invalid Status Value!!', 400);

    if (status == 'PROCESSING' && transaction.status != 'OPEN')
      throw new HttpException('Transaction Status is Not OPEN!!', 400);

    if (
      (status == 'COMPLETED' || status == 'FAILED') &&
      transaction.status != 'PROCESSING'
    )
      throw new HttpException('Transaction Status is Not PROCESSING!!', 400);

    const ApiRes = await this.thirdPartyService.callApiForClient({
      apiReq: { query: { order_id: transaction.order_id }, body: { status } },
      apiType: 'UPDATE_TRANSACTION',
      client_id,
    });
    if (!ApiRes.response.success)
      throw new HttpException('Client API Error', 400);
    else await transaction.update({ status });

    return transaction;
  }
}
