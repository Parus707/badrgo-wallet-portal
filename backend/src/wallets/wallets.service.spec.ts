import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { WalletTransactionDto } from './dto/wallet-transaction.dto';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { Wallet, WalletStatus, Currency } from './entities/wallet.entity';
import { WalletsService } from './wallets.service';

const mockWallet: Wallet = {
  id: 'wallet-uuid-1',
  userId: 'user-uuid-1',
  currency: Currency.USD,
  balance: 5000,
  status: WalletStatus.ACTIVE,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: null,
  transactions: [],
};

const mockTransaction: Transaction = {
  id: 'tx-uuid-1',
  walletId: 'wallet-uuid-1',
  type: TransactionType.CREDIT,
  amount: 1000,
  balanceBefore: 5000,
  balanceAfter: 6000,
  referenceId: 'ref-001',
  description: 'Test credit',
  createdAt: new Date(),
  wallet: null,
};

describe('WalletsService', () => {
  let service: WalletsService;

  const mockManager = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn((cb) => cb(mockManager)),
  };

  const mockWalletRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockTransactionRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockUsersService = {
    findOne: jest.fn().mockResolvedValue({ id: 'user-uuid-1' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletsService,
        { provide: getRepositoryToken(Wallet), useValue: mockWalletRepository },
        { provide: getRepositoryToken(Transaction), useValue: mockTransactionRepository },
        { provide: getDataSourceToken(), useValue: mockDataSource },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<WalletsService>(WalletsService);
    jest.clearAllMocks();
  });

  describe('credit()', () => {
    it('stores balanceBefore and balanceAfter', async () => {
      const dto: WalletTransactionDto = { amount: 1000, referenceId: 'ref-credit-001' };

      mockTransactionRepository.findOne.mockResolvedValue(null);
      mockManager.findOne.mockResolvedValue({ ...mockWallet });
      mockManager.create.mockReturnValue({ ...mockTransaction });
      mockManager.save
        .mockResolvedValueOnce({ ...mockWallet, balance: 6000 })
        .mockResolvedValueOnce({ ...mockTransaction, balanceBefore: 5000, balanceAfter: 6000 });

      const result = await service.credit('wallet-uuid-1', dto);

      expect(result.balanceBefore).toBe(5000);
      expect(result.balanceAfter).toBe(6000);
      expect(result.type).toBe(TransactionType.CREDIT);
    });
  });

  describe('debit()', () => {
    it('reduces balance', async () => {
      const dto: WalletTransactionDto = { amount: 2000, referenceId: 'ref-debit-001' };

      mockTransactionRepository.findOne.mockResolvedValue(null);
      mockManager.findOne.mockResolvedValue({ ...mockWallet });
      mockManager.create.mockReturnValue({
        ...mockTransaction,
        type: TransactionType.DEBIT,
        amount: 2000,
        balanceBefore: 5000,
        balanceAfter: 3000,
      });
      mockManager.save
        .mockResolvedValueOnce({ ...mockWallet, balance: 3000 })
        .mockResolvedValueOnce({
          ...mockTransaction,
          type: TransactionType.DEBIT,
          balanceBefore: 5000,
          balanceAfter: 3000,
        });

      const result = await service.debit('wallet-uuid-1', dto);

      expect(result.balanceBefore).toBe(5000);
      expect(result.balanceAfter).toBe(3000);
    });

    it('rejects when balance is too low', async () => {
      const dto: WalletTransactionDto = { amount: 9999, referenceId: 'ref-debit-002' };

      mockTransactionRepository.findOne.mockResolvedValue(null);
      mockManager.findOne.mockResolvedValue({ ...mockWallet, balance: 5000 });

      await expect(service.debit('wallet-uuid-1', dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('referenceId idempotency', () => {
    it('rejects duplicate referenceId', async () => {
      const dto: WalletTransactionDto = { amount: 500, referenceId: 'ref-dup-001' };

      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);

      await expect(service.credit('wallet-uuid-1', dto)).rejects.toThrow(ConflictException);
    });
  });
});
