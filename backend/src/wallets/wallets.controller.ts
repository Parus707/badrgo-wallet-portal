import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';

import { WalletsService } from './wallets.service';

import { CreateWalletDto } from './dto/create-wallet.dto';
import { WalletTransactionDto } from './dto/wallet-transaction.dto';

import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';

@ApiTags('Wallets')
@Controller('wallets')
export class WalletsController {
  constructor(private readonly service: WalletsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateWalletDto): Promise<Wallet> {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('userId') userId?: string): Promise<Wallet[]> {
    if (!userId) return Promise.resolve([]);
    return this.service.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Wallet> {
    return this.service.findOne(id);
  }

  @Post(':id/credit')
  @HttpCode(HttpStatus.CREATED)
  credit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: WalletTransactionDto,
  ): Promise<Transaction> {
    return this.service.credit(id, dto);
  }

  @Post(':id/debit')
  @HttpCode(HttpStatus.CREATED)
  debit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: WalletTransactionDto,
  ): Promise<Transaction> {
    return this.service.debit(id, dto);
  }

  @Get(':id/transactions')
  transactions(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Transaction[]> {
    return this.service.getTransactions(id);
  }
}