import { HttpException, Injectable } from '@nestjs/common';

@Injectable()
export class TransactionService {
  async getTransactionList(id: number, query: any) {
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
