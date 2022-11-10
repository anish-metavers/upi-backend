import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { UpiService } from './upi.service';
import { CreateUpiDto } from './dto/create-upi.dto';
import { UpdateUpiDto, VerifyUtrDto } from './dto/update-upi.dto';

@Controller('upi')
export class UpiController {
  constructor(private readonly upiService: UpiService) {}

  //Create businessUpiId APIs
  @Post('/create-business-upi-id')
  async clientUpiId(@Body() createUpiDto: CreateUpiDto) {
    const data = await this.upiService.createClientUpi(createUpiDto);
    return {
      message: 'Created successfully',
      statusCode: 201,
      response: {
        data: data,
      },
      success: 'true',
    };
  }

  //Get all user history by order number APIs
  @Get(':order_id')
  async findOrderId(@Param('order_id') order_id: string) {
    const data = await this.upiService.findOrderId(order_id);
    return {
      message: 'Get all information',
      statusCode: 201,
      response: {
        data,
      },
      success: 'true',
    };
  }

  //Utr number update APIs
  @Put('/utr/:id')
  async updateUtr(@Param('id') id: string, @Body() verifyUtrDto: VerifyUtrDto) {
    const data = await this.upiService.updateUtr(+id, verifyUtrDto);
    return data;
  }

  //Update userUpiId APIs
  @Put('user_upi_id/:id')
  async updateUserUpi(
    @Param('id') id: string,
    @Body() updateUpiDto: UpdateUpiDto,
  ) {
    const data = await this.upiService.updateUserUpi(+id, updateUpiDto);
    return {
      statusCode: 201,
      response: { data },

      success: true,
    };
  }
}
