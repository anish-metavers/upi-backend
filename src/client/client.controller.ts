import {
  Controller,
  Put,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
  Get,
} from '@nestjs/common';
import { AuthGuard } from 'guard/authGuard';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Request } from 'express';

@Controller('client')
@UseGuards(AuthGuard)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post('/upi/create')
  async create(@Req() req: Request, @Body() createClientDto: CreateClientDto) {
    const client = await this.clientService.createClientUpi(
      req,
      createClientDto,
    );
    return client;
  }

  @Put('/upi/update/:id')
  async update(
    @Req() req: Request,
    @Param('id') id: number,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    const updateClient = await this.clientService.updateClientUpiStatus(
      req,
      id,
      updateClientDto,
    );
    return updateClient;
  }

  @Get('/upi/list')
  async getClientApiList(@Req() req: Request) {
    const client_id = req['client_id'];
    const clientList = await this.clientService.getClientList(client_id);
    return clientList;
  }
}
