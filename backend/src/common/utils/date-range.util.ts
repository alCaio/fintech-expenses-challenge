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
      'startDate must be before or equal to endDate',
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
