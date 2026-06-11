import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class WalletTransactionDto {
  @ApiProperty({ example: 1000, description: 'Amount in cents' })
  @IsInt()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'order-abc-001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  referenceId: string;

  @ApiPropertyOptional({ example: 'Bank transfer' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
