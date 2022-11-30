import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'guard/authGuard';
import { TransactionListFilterDto } from './dto/create-upi.dto';
import {
  InitTransactionDTO,
  UpdateStatusDto,
  UpdateUpiDto,
  VerifyUtrDto,
} from './dto/update-upi.dto';
import { TransactionService } from './transaction.service';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @UseGuards(AuthGuard)
  @Get('list')
  async getTransactionList(
    @Req() req: Request,
    @Query() transactionListQuery: TransactionListFilterDto,
  ) {
    const client_id = req['client_id'];
    return {
      statusCode: 200,
      response: {
        data: await this.transactionService.getTransactionList(
          client_id,
          transactionListQuery,
        ),
      },
      success: true,
    };
  }

  @UseGuards(AuthGuard)
  @Patch('status/:trxn_id')
  async updateStatus(
    @Param('trxn_id') trxn_id: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @Req() req: Request,
  ) {
    const client_id = req['client_id'];
    const data = await this.transactionService.updateTrxnStatus(
      +trxn_id,
      client_id,
      updateStatusDto,
    );
    return {
      statusCode: 201,
      response: { data },
      success: true,
    };
  }


  @Get('init/:order_id')
  async initTransaction(
    @Param('order_id') order_id: string,
    @Query() query: InitTransactionDTO,
  ) {
    const data = await this.transactionService.initTransaction(order_id, query);
    return {
      message: 'Get all information',
      statusCode: 201,
      response: data,
      success: 'true',
    };
  }

  //Update UTR Number
  @Patch('/utr/:trxn_id')
  async updateUtr(
    @Param('trxn_id') trxn_id: string,
    @Body() verifyUtrDto: VerifyUtrDto,
  ) {
    const data = await this.transactionService.updateUtr(
      +trxn_id,
      verifyUtrDto,
    );
    return data;
  }

  //Update userUpi APIs
  @Patch('user-upi/:trxn_id')
  async updateUserUpi(
    @Param('trxn_id') trxn_id: string,
    @Body() updateUpiDto: UpdateUpiDto,
  ) {
    const data = await this.transactionService.updateUserUpi(
      +trxn_id,
      updateUpiDto,
    );
    return {
      statusCode: 201,
      response: { data },
      success: true,
    };
  }
}
