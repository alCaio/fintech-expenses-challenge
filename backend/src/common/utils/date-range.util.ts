import { BadRequestException } from '@nestjs/common';
import { DateRangeQueryDto } from '../dto/date-range-query.dto';
import { parseDateOnly } from './date.util';

export interface DateRangeFilter {
  gte?: Date;
  lte?: Date;
}

export function toDateRangeFilter({
  startDate,
  endDate,
}: DateRangeQueryDto): DateRangeFilter | undefined {
  if (startDate && endDate && startDate > endDate) {
    throw new BadRequestException(
      'A data inicial deve ser anterior ou igual à data final',
    );
  }
  if (!startDate && !endDate) {
    return undefined;
  }

  return {
    ...(startDate && { gte: parseDateOnly(startDate) }),
    ...(endDate && { lte: parseDateOnly(endDate) }),
  };
}
