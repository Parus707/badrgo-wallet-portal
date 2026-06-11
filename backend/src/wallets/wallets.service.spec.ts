import {
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';

import { UsersService } from '../users/users.service';
import { WalletTransactionDto } from './dto/wallet-transaction.dto';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { Currency, Wallet, WalletStatus } from './entities/wallet.entity';
import { WalletsService } from './wallets.service';

describe('WalletsService', () => {
  let service: WalletsService;
  let txRepo: any;
  let manager: any;

  const wallet: Wallet = {
    id: 'wallet-uuid-1',
    userId: 'user-uuid-1',
    currency: Currency.USD,
    balance: 5000,
    status: WalletStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: undefined as any,
    transactions: [],
  };

  beforeEach(async () => {
    txRepo = { findOne: jest.fn(), find: jest.fn() };
    manager = { findOne: jest.fn(), save: jest.fn(), create: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        WalletsService,
        { provide: getRepositoryToken(Wallet), useValue: { create: jest.fn(), save: jest.fn(), findOne: jest.fn(), find: jest.fn() } },
        { provide: getRepositoryToken(Transaction), useValue: txRepo },
        { provide: getDataSourceToken(), useValue: { transaction: jest.fn((cb) => cb(manager)) } },
        { provide: UsersService, useValue: { findOne: jest.fn().mockResolvedValue({ id: 'user-uuid-1' }) } },
      ],
    }).compile();

    service = module.get(WalletsService);
  });

  it('records before/after balance on credit', async () => {
    const dto: WalletTransactionDto = { amount: 1000, referenceId: 'ref-credit-001' };

    txRepo.findOne.mockResolvedValue(null);
    manager.findOne.mockResolvedValue({ ...wallet });
    manager.create.mockReturnValue({
      id: 'tx-1',
      walletId: wallet.id,
      type: TransactionType.CREDIT,
      amount: 1000,
      balanceBefore: 5000,
      balanceAfter: 6000,
      referenceId: dto.referenceId,
      createdAt: new Date(),
    } as Transaction);
    manager.save
      .mockResolvedValueOnce({ ...wallet, balance: 6000 })
      .mockResolvedValueOnce({ balanceBefore: 5000, balanceAfter: 6000, type: TransactionType.CREDIT });

    const result = await service.credit(wallet.id, dto);

    expect(result.balanceBefore).toBe(5000);
    expect(result.balanceAfter).toBe(6000);
  });

  it('reduces balance on debit', async () => {
    const dto: WalletTransactionDto = { amount: 2000, referenceId: 'ref-debit-001' };

    txRepo.findOne.mockResolvedValue(null);
    manager.findOne.mockResolvedValue({ ...wallet });
    manager.create.mockReturnValue({});
    manager.save
      .mockResolvedValueOnce({ ...wallet, balance: 3000 })
      .mockResolvedValueOnce({ balanceBefore: 5000, balanceAfter: 3000, type: TransactionType.DEBIT });

    const result = await service.debit(wallet.id, dto);

    expect(result.balanceBefore).toBe(5000);
    expect(result.balanceAfter).toBe(3000);
  });

  it('rejects debit when balance is too low', async () => {
    txRepo.findOne.mockResolvedValue(null);
    manager.findOne.mockResolvedValue({ ...wallet, balance: 5000 });

    await expect(
      service.debit(wallet.id, { amount: 9999, referenceId: 'ref-x' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects duplicate referenceId', async () => {
    txRepo.findOne.mockResolvedValue({ referenceId: 'ref-dup' });

    await expect(
      service.credit(wallet.id, { amount: 500, referenceId: 'ref-dup' }),
    ).rejects.toThrow(ConflictException);
  });
});
