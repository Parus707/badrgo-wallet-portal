import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { Currency, WalletStatus } from '../entities/wallet.entity';

export class CreateWalletDto {
  @ApiProperty({ example: 'uuid-of-user' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ enum: Currency, default: Currency.USD })
  @IsEnum(Currency)
  currency: Currency;

  @ApiPropertyOptional({ enum: WalletStatus, default: WalletStatus.ACTIVE })
  @IsOptional()
  @IsEnum(WalletStatus)
  status?: WalletStatus;
}
