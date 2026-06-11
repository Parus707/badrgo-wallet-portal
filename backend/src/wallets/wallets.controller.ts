import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { WalletTransactionDto } from './dto/wallet-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { Wallet } from './entities/wallet.entity';
import { WalletsService } from './wallets.service';

@ApiTags('Wallets')
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a wallet for a user' })
  @ApiResponse({ status: 201, type: Wallet })
  create(@Body() dto: CreateWalletDto): Promise<Wallet> {
    return this.walletsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List wallets, optionally filtered by userId' })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiResponse({ status: 200, type: [Wallet] })
  findByUser(@Query('userId') userId?: string): Promise<Wallet[]> {
    if (userId) {
      return this.walletsService.findByUser(userId);
    }
    return Promise.resolve([]);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get wallet by ID' })
  @ApiResponse({ status: 200, type: Wallet })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Wallet> {
    return this.walletsService.findOne(id);
  }

  @Post(':id/credit')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Credit (add funds to) a wallet' })
  @ApiResponse({ status: 201, type: Transaction })
  @ApiResponse({ status: 409, description: 'Duplicate referenceId' })
  credit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: WalletTransactionDto,
  ): Promise<Transaction> {
    return this.walletsService.credit(id, dto);
  }

  @Post(':id/debit')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Debit (withdraw funds from) a wallet' })
  @ApiResponse({ status: 201, type: Transaction })
  @ApiResponse({ status: 400, description: 'Insufficient balance' })
  @ApiResponse({ status: 409, description: 'Duplicate referenceId' })
  debit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: WalletTransactionDto,
  ): Promise<Transaction> {
    return this.walletsService.debit(id, dto);
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Get all transactions for a wallet' })
  @ApiResponse({ status: 200, type: [Transaction] })
  getTransactions(@Param('id', ParseUUIDPipe) id: string): Promise<Transaction[]> {
    return this.walletsService.getTransactions(id);
  }
}
