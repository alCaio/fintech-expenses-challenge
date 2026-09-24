import { IntersectionType } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { DateRangeQueryDto } from '../../common/dto/date-range-query.dto';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';

export class ListTransactionsQueryDto extends IntersectionType(
  PaginationQueryDto,
  DateRangeQueryDto,
) {
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
