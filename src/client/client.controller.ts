import {
  Controller,
  Put,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
  Get,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from 'guard/authGuard';
import { ClientService } from './client.service';
import { CreateClientDto, CreateClientUpiDto } from './dto/create-client.dto';
import { UpdateClientDto, UpdateClientUpiDto } from './dto/update-client.dto';
import { Request } from 'express';

@Controller('client')
@UseGuards(AuthGuard)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get()
  async findAll() {
    return await this.clientService.findAll();
  }

  @Post()
  async createClient(@Body() createClientDto: CreateClientDto) {
    return await this.clientService.createClient(createClientDto);
  }

  @Patch(':client_id')
  update(
    @Param('client_id') client_id: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return this.clientService.updateClient(+client_id, updateClientDto);
  }

  @Post('/upi/create')
  async createClientUpi(
    @Req() req: Request,
    @Body() createClientDto: CreateClientUpiDto,
  ) {
    const client = await this.clientService.createClientUpi(
      req,
      createClientDto,
    );
    return client;
  }

  @Patch('/upi/update/:id')
  async updateClientUpiStatus(
    @Req() req: Request,
    @Param('id') id: number,
    @Body() updateClientDto: UpdateClientUpiDto,
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
