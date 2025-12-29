import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from './auth';

/**
 * Декоратор для получения текущего пользователя из запроса
 * Использование: @CurrentUser() user: JwtPayload
 * Или конкретное поле: @CurrentUser('sub') userId: string
 */
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();
    const user = request.user;

    if (data) {
      return user?.[data];
    }

    return user;
  },
);
