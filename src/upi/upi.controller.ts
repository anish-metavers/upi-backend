import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { UpiService } from './upi.service';
import { CreateUpiDto, VerifyUtrDto } from './dto/create-upi.dto';
import { UpdateUpiDto } from './dto/update-upi.dto';

@Controller('upi')
export class UpiController {
  constructor(private readonly upiService: UpiService) {}

  //Create businessUpiId APIs
  @Post('/create-business-upi-id')
  async businessUpiId(@Body() createUpiDto: CreateUpiDto) {
    const data = await this.upiService.create(createUpiDto);
    return {
      message: 'Created successfully',
      statusCode: 201,
      response: {
        data: data,
      },
      success: 'true',
    };
  }

  //Utr number update APIs
  @Put('/utr-number-update/:id')
  async utrNumberUpdate(
    @Param('id') id: string,
    @Body() verifyUtrDto: VerifyUtrDto,
  ) {
    const data = await this.upiService.utrNumberUpdate(+id, verifyUtrDto);
    return {
      statusCode: 201,
      response: {
        data: data,
      },
      success: 'true',
    };
  }

  //Get all user history by order number APIs
  @Get(':orderNumber')
  async findOne(@Param('orderNumber') orderNumber: string) {
    const data = await this.upiService.findOne(orderNumber);
    return {
      message: 'Get all information',
      statusCode: 201,
      response: {
        data: data,
      },
      success: 'true',
    };
  }

  //Update userUpiId APIs
  @Put('/upi-number-update/:id')
  async updateUserUpi(
    @Param('id') id: string,
    @Body() updateUpiDto: UpdateUpiDto,
  ) {
    const data = await this.upiService.update(+id, updateUpiDto);
    return {
      statusCode: 201,
      response: data,

      success: true,
    };
  }
}
