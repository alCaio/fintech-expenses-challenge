import { IsOptional } from 'class-validator';
import { IsDateOnly } from '../validators/is-date-only.decorator';

export class DateRangeQueryDto {
  @IsOptional()
  @IsDateOnly()
  startDate?: string;

  @IsOptional()
  @IsDateOnly()
  endDate?: string;
}
