import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { col, fn, Op } from 'sequelize';
import { Misc } from 'utils/misc';
import { ClientWiseTrxnStatQuery } from './dto/query.dto';

@Injectable()
export class DashboardService {
  async getClientWiseTrxnStats(req: Request, query: ClientWiseTrxnStatQuery) {
    let {
      client_id,
      portal_id,
      client_upi_id,
      created_at_from,
      created_at_to,
    } = query;

    let filterObject: any = {};

    const req_client_id = req['client_id'];
    const req_user_id = req['user_id'];
    const user_role_name = req['role_name'];

    const filterFromRole = await Misc.createFilterFromRoles(
      user_role_name,
      req_client_id,
      req_user_id,
      { client_id, portal_id },
    );
    if (filterFromRole.client_id) client_id = filterFromRole.client_id;
    if (filterFromRole.portal_id) portal_id = 'Some Thing';
    filterObject = { ...filterObject, ...filterFromRole };

    // Add to Filter Object if available
    if (client_upi_id) filterObject.client_upi_id = client_upi_id;
    if (created_at_from && created_at_to)
      filterObject.created_at = {
        [Op.between]: [new Date(created_at_from), new Date(created_at_to)],
      };

    // Fetching DBs
    const [
      total_trxn_amount,
      total_trxn_count,
      status_wise_trxn_count,
      client_wise_trxn_amount,
    ] = await Promise.all([
      global.DB.Transaction.findAll({
        where: filterObject,
        attributes: [[fn('sum', col('amount')), 'total_amount']],
      }),
      global.DB.Transaction.count({
        where: filterObject,
      }),
      global.DB.Transaction.findAll({
        where: filterObject,
        attributes: [
          'status',
          [fn('count', col('id')), 'trxn_count'],
          [fn('sum', col('amount')), 'trxn_amount'],
        ],
        group: ['status'],
      }),
      global.DB.Transaction.findAll({
        where: filterObject,
        attributes: [
          `${
            client_upi_id
              ? 'client_upi_id'
              : portal_id
              ? 'client_upi_id'
              : client_id
              ? 'portal_id'
              : 'client_id'
          }`,
          [fn('count', col('Transaction.id')), 'trxn_count'],
          [fn('sum', col('amount')), 'total_amount'],
        ],
        include: {
          model: client_upi_id
            ? global.DB.ClientUpi
            : portal_id
            ? global.DB.ClientUpi
            : client_id
            ? global.DB.Portal
            : global.DB.Client,
          as: client_upi_id
            ? 'client_upi_data'
            : portal_id
            ? 'client_upi_data'
            : client_id
            ? 'portal_data'
            : 'client_data',
          attributes: [
            'id',
            client_upi_id || portal_id ? ['upi', 'name'] : 'name',
          ],
        },
        group: [
          client_upi_id
            ? 'client_upi_id'
            : portal_id
            ? 'client_upi_id'
            : client_id
            ? 'portal_id'
            : 'client_id',
        ],
      }),
    ]);

    return {
      success: true,
      message: 'Transaction Data Fetched Successfully!',
      response: {
        data: {
          total_trxn_amount:
            total_trxn_amount &&
            total_trxn_amount.length > 0 &&
            parseFloat(total_trxn_amount[0].toJSON().total_amount)
              ? parseFloat(total_trxn_amount[0].toJSON().total_amount)
              : 0,
          total_trxn_count,
          status_wise_trxn_count,
          ...(client_upi_id
            ? { client_upi_wise_trxn_amount: client_wise_trxn_amount }
            : portal_id
            ? { client_upi_wise_trxn_amount: client_wise_trxn_amount }
            : client_id
            ? { portal_wise_trxn_amount: client_wise_trxn_amount }
            : { client_wise_trxn_amount }),
        },
      },
    };
  }
}
