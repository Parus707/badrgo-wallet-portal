import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { WalletTransactionDto } from './dto/wallet-transaction.dto';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { Wallet, WalletStatus } from './entities/wallet.entity';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreateWalletDto): Promise<Wallet> {
    await this.usersService.findOne(dto.userId);
    const wallet = this.walletRepository.create({ ...dto, balance: 0 });
    return this.walletRepository.save(wallet);
  }

  async findByUser(userId: string): Promise<Wallet[]> {
    return this.walletRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!wallet) {
      throw new NotFoundException(`Wallet ${id} not found`);
    }
    return wallet;
  }

  async getTransactions(walletId: string): Promise<Transaction[]> {
    await this.findOne(walletId);
    return this.transactionRepository.find({
      where: { walletId },
      order: { createdAt: 'DESC' },
    });
  }

  async credit(walletId: string, dto: WalletTransactionDto): Promise<Transaction> {
    return this.processTransaction(walletId, dto, TransactionType.CREDIT);
  }

  async debit(walletId: string, dto: WalletTransactionDto): Promise<Transaction> {
    return this.processTransaction(walletId, dto, TransactionType.DEBIT);
  }

  private async processTransaction(
    walletId: string,
    dto: WalletTransactionDto,
    type: TransactionType,
  ): Promise<Transaction> {
    const existing = await this.transactionRepository.findOne({
      where: { referenceId: dto.referenceId },
    });
    if (existing) {
      throw new ConflictException(
        `Transaction with referenceId "${dto.referenceId}" already processed`,
      );
    }

    try {
      return await this.dataSource.transaction(async (manager) => {
        const wallet = await manager.findOne(Wallet, {
          where: { id: walletId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!wallet) {
          throw new NotFoundException(`Wallet ${walletId} not found`);
        }

        if (wallet.status !== WalletStatus.ACTIVE) {
          throw new BadRequestException(
            `Wallet is ${wallet.status} and cannot process transactions`,
          );
        }

        const balanceBefore = Number(wallet.balance);
        let balanceAfter: number;

        if (type === TransactionType.CREDIT) {
          balanceAfter = balanceBefore + dto.amount;
        } else {
          if (balanceBefore < dto.amount) {
            throw new BadRequestException(
              `Insufficient balance. Available: ${balanceBefore} cents, Requested: ${dto.amount} cents`,
            );
          }
          balanceAfter = balanceBefore - dto.amount;
        }

        wallet.balance = balanceAfter;
        await manager.save(Wallet, wallet);

        const transaction = manager.create(Transaction, {
          walletId,
          type,
          amount: dto.amount,
          balanceBefore,
          balanceAfter,
          referenceId: dto.referenceId,
          description: dto.description,
        });

        return manager.save(Transaction, transaction);
      });
    } catch (err) {
      if (err instanceof QueryFailedError && (err as any).code === '23505') {
        throw new ConflictException(
          `Transaction with referenceId "${dto.referenceId}" already processed`,
        );
      }
      throw err;
    }
  }
}
