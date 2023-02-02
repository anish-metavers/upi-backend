import {
  Body,
  Controller,
  Get,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { AuthGuard } from 'guard/auth.guard';
import { PermissionGuard } from 'guard/permission.guard';
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

  @UseGuards(AuthGuard, PermissionGuard)
  @Get('list')
  async getTransactionList(
    @Req() req: Request,
    @Query() transactionListQuery: TransactionListFilterDto,
  ) {
    return await this.transactionService.getTransactionList(
      req,
      transactionListQuery,
    );
  }

  @UseGuards(AuthGuard, PermissionGuard)
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
      success: true,
      message: 'Transaction Status Updated Successfully!!',
      response: { data },
    };
  }

  @Get('init/:order_id')
  async initTransaction(
    @Param('order_id') order_id: string,
    @Query() query: InitTransactionDTO,
  ) {
    const data = await this.transactionService.initTransaction(order_id, query);
    return {
      message: 'Transaction Fetch Successfully!!',
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
      success: true,
      message: 'Updated successfully',
      response: { data },
    };
  }

  @Post('image/:trxn_id')
  @UseInterceptors(FileInterceptor('file'))
  async uploadTrxnImage(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 2097152 })
        .addFileTypeValidator({ fileType: 'image/' })
        .build(),
    )
    file: Express.Multer.File,
    @Param('trxn_id') trxn_id: string,
    @Body() body: VerifyUtrDto,
  ) {
    return await this.transactionService.uploadTrxnImage(file, trxn_id, body);
  }
}
