import { HttpException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Op } from 'sequelize';
import { ThirdPartyService } from 'src/third-party/third-party.service';
import { PAGINATION } from 'utils/config';
import { uploadFile } from 'utils/fileUploader';
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
      client_id: client_id_filter,
      portal_id,
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

    let { limit, page } = transactionListQuery;

    limit = Number(limit) || PAGINATION.LIMIT;
    page = Number(page) || PAGINATION.PAGE;

    const client_id = req['client_id'];
    const user_id = req['user_id'];
    const user_role_name = req['role_name'];

    // const userUpis = await global.DB.UserUpi.findAll({
    //   where: { user_id },
    // });

    const filterObject: any = {};
    console.log('user_role_name:', user_role_name);

    if (user_role_name === 'Admin') filterObject.client_id = client_id;
    else if (user_role_name === 'Portal Manager') {
      const userPortals = await global.DB.UserPortal.findAll({
        where: { user_id },
        attributes: ['id', 'portal_id'],
      });
      filterObject.portal_id =
        userPortals.length > 0
          ? {
              [Op.in]: userPortals.map((item: any) => item.portal_id),
            }
          : 0;
    } else if (user_role_name === 'Transaction Manager') {
      const userUpis = await global.DB.UserUpi.findAll({
        where: { user_id },
        attributes: ['id', 'client_upi_id'],
      });
      filterObject.client_upi_id =
        userUpis.length > 0
          ? {
              [Op.in]: userUpis.map((item: any) => item.client_upi_id),
            }
          : 0;
    }
    // if (!isMaster && userUpis && userUpis.length > 0) {
    //   filterObject.client_upi_id = {
    //     [Op.in]: userUpis.map((item) => item.client_upi_id),
    //   };
    // }

    if (utr) filterObject.utr = { [Op.like]: `%${utr}%` };
    if (user_upi) filterObject.user_upi = { [Op.like]: `%${user_upi}%` };
    if (note) filterObject.note = { [Op.like]: `%${note}%` };
    if (status) filterObject.status = status;
    if (client_upi_id) filterObject.client_upi_id = client_upi_id;
    if (client_id_filter) filterObject.client_id = client_id_filter;
    if (portal_id) filterObject.portal_id = portal_id;
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

    const totalItems = await global.DB.Transaction.count({
      where: filterObject,
    });
    const offset = limit * (page - 1);
    const totalPages = limit ? Math.ceil(totalItems / limit) : 1;

    const transactions = await global.DB.Transaction.findAll({
      where: filterObject,
      attributes: [
        'id',
        'client_id',
        'portal_id',
        'order_id',
        'amount',
        'client_upi',
        'image_url',
        'client_upi_name',
        'user_upi',
        'note',
        'utr',
        'verify_timestamp',
        'end_at',
        'status',
        'created_at',
        'updated_at',
      ],
      include: [
        {
          model: global.DB.Portal,
          as: 'portal_data',
          attributes: ['id', 'name'],
        },
        {
          model: global.DB.Client,
          as: 'client_data',
          attributes: ['id', 'name'],
        },
      ],
      ...(limit ? { limit } : {}),
      offset,
      order: [['created_at', 'DESC']],
    });

    return {
      success: true,
      message: 'Transaction List Fetched Successfully!!',
      statusCode: 200,
      response: {
        data: transactions,
        limit,
        page,
        totalItems,
        totalPages,
      },
    };
  }

  async initTransaction(order_id: string, query: InitTransactionDTO) {
    const { portal_id: portal_public_key } = query;

    const portal = await global.DB.Portal.findOne({
      where: { public_key: portal_public_key, status: 'ACTIVE' },
    });
    if (!portal) throw new HttpException({ message: 'Portal not found' }, 404);

    let TrxnData = await global.DB.Transaction.findOne({
      attributes: [
        'id',
        'amount',
        'client_upi',
        'client_upi_name',
        'user_upi',
        'is_user_upi',
        'order_id',
        'utr',
        'status',
        'verify_timestamp',
        'end_at',
        'note',
      ],
      where: { order_id, portal_id: portal.id },
    });

    if (!TrxnData) {
      const [client, clientUpi] = await Promise.all([
        global.DB.Client.findOne({
          where: { id: portal.client_id, status: 'ACTIVE' },
        }),
        global.DB.ClientUpi.findAll({
          where: { portal_id: portal.id, status: 'ACTIVE' },
        }),
      ]);

      if (!clientUpi || clientUpi.length == 0) {
        throw new HttpException({ message: 'Client UPI is Empty!' }, 401);
      }

      if (!client) {
        throw new HttpException(
          { message: 'Client Status is Not Active!!' },
          401,
        );
      }

      const ApiRes = await this.thirdPartyService.callApiForClient({
        apiReq: { query: { order_id } },
        apiType: 'GET_TRANSACTION',
        portal_id: portal.id,
      });

      if (
        !ApiRes ||
        !ApiRes.response ||
        !ApiRes.response.success ||
        !ApiRes.response.response
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

      const randIndex = Math.floor(Math.random() * clientUpi.length);

      const end_at = new Date(new Date().getTime() + 20 * 60000);

      await global.DB.Transaction.create({
        client_upi_name: clientUpi[randIndex].name,
        client_upi: clientUpi[randIndex].upi,
        client_upi_id: clientUpi[randIndex].id,
        client_id: portal.client_id,
        portal_id: portal.id,
        end_at,
        order_id,
        amount: data.amount,
        note: data.note,
        status: data.status,
      });

      TrxnData = await global.DB.Transaction.findOne({
        attributes: [
          'id',
          'amount',
          'client_upi',
          'client_upi_name',
          'user_upi',
          'is_user_upi',
          'order_id',
          'utr',
          'status',
          'verify_timestamp',
          'end_at',
          'note',
        ],
        where: { order_id, portal_id: portal.id },
      });
    }

    return { ...TrxnData.toJSON(), redirect_url: portal.redirect_url };
  }

  async updateUserUpi(id: number, updateUpiDto: UpdateUpiDto) {
    const { user_upi } = updateUpiDto;

    const transaction = await global.DB.Transaction.findOne({ where: { id } });

    if (!transaction) throw new HttpException('Transaction Not Found', 404);

    // if (transaction.is_user_upi)
    //   throw new HttpException(
    //     { message: 'User Upi is Already Submitted!!' },
    //     400,
    //   );

    if (transaction.status != 'OPEN')
      throw new HttpException('This Transaction is already Submitted!!', 400);

    await transaction.update({
      user_upi,
      is_user_upi: true,
    });
    await transaction.reload();
    return transaction;
  }

  async updateUtr(id: number, verifyUtrDto: VerifyUtrDto) {
    const { utr } = verifyUtrDto;
    const transaction = await global.DB.Transaction.findOne({ where: { id } });

    if (!transaction) throw new HttpException('Transaction Not Found', 404);

    if (transaction.status != 'OPEN')
      throw new HttpException('This Transaction is already Submitted!!', 400);

    if (!transaction.is_user_upi)
      throw new HttpException({ message: 'Enter your UPI First!!' }, 400);

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
      portal_id: transaction.portal_id,
    });

    if (!ApiRes.response.success)
      throw new HttpException('Client API Error', 400);
    await transaction.reload();

    return {
      statusCode: 201,
      success: true,
      message: 'Utr updated successfully',
      response: { data: transaction },
    };
  }

  async updateTrxnStatus(
    id: number,
    client_id: string | number,
    updateStatusDto: UpdateStatusDto,
  ) {
    const { status } = updateStatusDto;

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
      portal_id: transaction.portal_id,
    });
    if (!ApiRes.response.success)
      throw new HttpException('Client API Error', 400);
    else
      await transaction.update({
        status,
        ...(status == 'COMPLETED' || status == 'FAILED'
          ? { verify_timestamp: new Date() }
          : {}),
      });
    await transaction.reload();
    return transaction;
  }

  async uploadTrxnImage(
    file: Express.Multer.File,
    trxn_id: string,
    body: VerifyUtrDto,
  ) {
    const { utr } = body;
    const trxn = await global.DB.Transaction.findOne({
      where: { id: trxn_id },
    });
    if (!file)
      throw new HttpException(
        { message: 'Please select an Image File!!' },
        400,
      );

    if (!trxn)
      throw new HttpException(
        { message: 'No Transaction found with this Id!!' },
        400,
      );
    if (trxn.status != 'OPEN')
      throw new HttpException(
        { message: 'Transaction is not in Open State!!' },
        400,
      );

    if (!trxn.is_user_upi)
      throw new HttpException({ message: 'Enter your UPI First!!' }, 400);

    const s3Res = await uploadFile(file);

    const ApiRes = await this.thirdPartyService.callApiForClient({
      apiReq: {
        query: { order_id: trxn.order_id },
        body: { status: 'PROCESSING' },
      },
      apiType: 'UPDATE_TRANSACTION',
      portal_id: trxn.portal_id,
    });

    if (!ApiRes.response.success)
      throw new HttpException('Client API Error', 400);

    if (!s3Res.success)
      throw new HttpException(
        { message: 'Error in Image Upload!', error: s3Res.error },
        400,
      );

    await trxn.update({
      image_url: s3Res.data.Location,
      utr,
      status: 'PROCESSING',
    });

    await trxn.reload();

    return {
      message: 'Image Uploaded Successfully!!',
      success: true,
      response: { data: trxn },
    };
  }
}
