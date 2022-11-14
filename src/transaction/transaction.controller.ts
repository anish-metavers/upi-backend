import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'guard/authGuard';
import { TransactionService } from './transaction.service';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @UseGuards(AuthGuard)
  @Get('list')
  async getTransactionList(@Req() req: Request, @Query() query: any) {
    const client_id = req['client_id'];
    return {
      statusCode: 200,
      response: {
        user: req.headers.user,
        data: await this.transactionService.getTransactionList(
          client_id,
          query,
        ),
      },
      success: true,
    };
  }
}
