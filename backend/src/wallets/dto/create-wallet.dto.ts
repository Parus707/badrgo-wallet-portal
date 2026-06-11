import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { Currency, WalletStatus } from '../entities/wallet.entity';

export class CreateWalletDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsEnum(Currency)
  currency: Currency;

  @IsOptional()
  @IsEnum(WalletStatus)
  status?: WalletStatus;
}