import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { UsersService } from '../users/users.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { WalletTransactionDto } from './dto/wallet-transaction.dto';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { Wallet, WalletStatus } from './entities/wallet.entity';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private wallets: Repository<Wallet>,
    @InjectRepository(Transaction)
    private txs: Repository<Transaction>,
    @InjectDataSource()
    private db: DataSource,
    private users: UsersService,
  ) {}

  async create(dto: CreateWalletDto) {
    await this.users.findOne(dto.userId);
    return this.wallets.save(this.wallets.create({ ...dto, balance: 0 }));
  }

  findByUser(userId: string) {
    return this.wallets.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const wallet = await this.wallets.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!wallet) throw new NotFoundException(`Wallet ${id} not found`);
    return wallet;
  }

  async getTransactions(walletId: string) {
    await this.findOne(walletId);
    return this.txs.find({
      where: { walletId },
      order: { createdAt: 'DESC' },
    });
  }

  credit(walletId: string, dto: WalletTransactionDto) {
    return this.applyTx(walletId, dto, TransactionType.CREDIT);
  }

  debit(walletId: string, dto: WalletTransactionDto) {
    return this.applyTx(walletId, dto, TransactionType.DEBIT);
  }

  private async applyTx(
    walletId: string,
    dto: WalletTransactionDto,
    type: TransactionType,
  ) {
    const existing = await this.txs.findOne({
      where: { referenceId: dto.referenceId },
    });
    if (existing) {
      throw new ConflictException(`Reference ${dto.referenceId} already used`);
    }

    return this.db.transaction(async (em) => {
      const wallet = await em.findOne(Wallet, {
        where: { id: walletId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) throw new NotFoundException(`Wallet ${walletId} not found`);
      if (wallet.status !== WalletStatus.ACTIVE) {
        throw new BadRequestException(`Wallet is ${wallet.status}`);
      }

      const before = Number(wallet.balance);
      let after: number;

      if (type === TransactionType.CREDIT) {
        after = before + dto.amount;
      } else if (before < dto.amount) {
        throw new BadRequestException(
          `Not enough balance (${before} cents available)`,
        );
      } else {
        after = before - dto.amount;
      }

      wallet.balance = after;
      await em.save(wallet);

      return em.save(
        em.create(Transaction, {
          walletId,
          type,
          amount: dto.amount,
          balanceBefore: before,
          balanceAfter: after,
          referenceId: dto.referenceId,
          description: dto.description,
        }),
      );
    });
  }
}
