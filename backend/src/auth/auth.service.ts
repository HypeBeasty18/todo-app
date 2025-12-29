import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthDto } from 'src/auth/dto';
import { DatabaseService } from 'src/database/database.service';

export interface UserPayload {
  id: string;
  name: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Внутренний тип — возвращается сервисом для контроллера
export interface AuthResult {
  user: UserPayload;
  tokens: AuthTokens;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
}

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;
  private readonly ACCESS_TOKEN_EXPIRY = '1m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';

  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Регистрация нового пользователя
   */
  async signup(authDto: AuthDto): Promise<AuthResult> {
    const { USERS } = this.db.tables;

    const existingUser = await this.findByEmail(authDto.email);
    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const hashedPassword = await bcrypt.hash(
      authDto.password,
      this.SALT_ROUNDS,
    );
    const name = this.extractNameFromEmail(authDto.email);

    const [user] = await this.db.query<UserRow>(
      `INSERT INTO ${USERS} (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at as "createdAt"`,
      [name, authDto.email, hashedPassword],
    );

    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      tokens,
    };
  }

  /**
   * Вход пользователя
   */
  async signin(authDto: AuthDto): Promise<AuthResult> {
    const { USERS } = this.db.tables;

    const [user] = await this.db.query<UserRow>(
      `SELECT id, name, email, password, created_at as "createdAt"
       FROM ${USERS}
       WHERE email = $1`,
      [authDto.email],
    );

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const isPasswordValid = await bcrypt.compare(
      authDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      tokens,
    };
  }

  /**
   * Обновление access токена по refresh токену
   */
  async refreshTokens(refreshToken: string): Promise<AuthResult> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.getRefreshSecret(),
      });

      const user = await this.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Пользователь не найден');
      }

      const tokens = await this.generateTokens(user);

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        tokens,
      };
    } catch {
      throw new UnauthorizedException('Невалидный refresh токен');
    }
  }

  /**
   * Генерация пары токенов
   */
  private async generateTokens(user: UserRow): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.ACCESS_TOKEN_EXPIRY,
        secret: this.getAccessSecret(),
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: this.REFRESH_TOKEN_EXPIRY,
        secret: this.getRefreshSecret(),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private getAccessSecret(): string {
    return this.configService.getOrThrow<string>('JWT_SECRET');
  }

  private getRefreshSecret(): string {
    return this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
  }

  private extractNameFromEmail(email: string): string {
    return email.split('@')[0];
  }

  private async findByEmail(email: string) {
    const { USERS } = this.db.tables;
    const [user] = await this.db.query<{ id: string; email: string }>(
      `SELECT id, email FROM ${USERS} WHERE email = $1`,
      [email],
    );
    return user;
  }

  private async findById(id: string) {
    const { USERS } = this.db.tables;
    const [user] = await this.db.query<UserRow>(
      `SELECT id, name, email, password, created_at as "createdAt"
       FROM ${USERS}
       WHERE id = $1`,
      [id],
    );
    return user;
  }
}
