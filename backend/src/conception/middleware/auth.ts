import { NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';

export class AuthMiddleware implements NestMiddleware<Request, Response> {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('AuthMiddleware');
    next();
  }
}
