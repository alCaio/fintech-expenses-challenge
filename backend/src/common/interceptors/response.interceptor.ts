import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ApiSuccessResponse } from '../interfaces/api-response.interface';
import { PaginatedResult } from '../pagination/paginated-result';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T | PaginatedResult<T>,
  ApiSuccessResponse<T | T[]> | undefined
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T | PaginatedResult<T>>,
  ): Observable<ApiSuccessResponse<T | T[]> | undefined> {
    return next.handle().pipe(
      map((result) => {
        if (result === undefined) return undefined;

        if (result instanceof PaginatedResult) {
          return { data: result.items, meta: result.meta };
        }

        return { data: result };
      }),
    );
  }
}
