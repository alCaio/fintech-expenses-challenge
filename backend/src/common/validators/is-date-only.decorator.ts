import { applyDecorators } from '@nestjs/common';
import { IsISO8601, Matches } from 'class-validator';

export const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function IsDateOnly(): PropertyDecorator {
  return applyDecorators(
    Matches(DATE_ONLY_REGEX, {
      message: ({ property }) => `${property} must be in YYYY-MM-DD format`,
    }),
    IsISO8601({ strict: true }),
  );
}
