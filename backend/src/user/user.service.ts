import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { User } from 'src/entities/user/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// Тип без пароля для возврата клиенту
type SafeUser = Omit<User, 'password'>;

@Injectable()
export class UserService {
  constructor(private readonly db: DatabaseService) {}

  private get table() {
    return this.db.tables.USERS;
  }

  async create(createUserDto: CreateUserDto): Promise<SafeUser> {
    const [user] = await this.db.query<SafeUser>(
      `INSERT INTO ${this.table} (name, email)
       VALUES ($1, $2)
       RETURNING id, name, email, created_at as "createdAt", updated_at as "updatedAt"`,
      [createUserDto.name, createUserDto.email],
    );
    return user;
  }

  async findAll(): Promise<SafeUser[]> {
    return this.db.query<SafeUser>(
      `SELECT id, name, email, created_at as "createdAt", updated_at as "updatedAt"
       FROM ${this.table}`,
    );
  }

  async findOne(id: string): Promise<SafeUser> {
    const [user] = await this.db.query<SafeUser>(
      `SELECT id, name, email, created_at as "createdAt", updated_at as "updatedAt"
       FROM ${this.table}
       WHERE id = $1`,
      [id],
    );

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<SafeUser> {
    const [user] = await this.db.query<SafeUser>(
      `UPDATE ${this.table}
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, name, email, created_at as "createdAt", updated_at as "updatedAt"`,
      [updateUserDto.name, updateUserDto.email, id],
    );

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.db.query(
      `DELETE FROM ${this.table} WHERE id = $1 RETURNING id`,
      [id],
    );

    if (result.length === 0) {
      throw new NotFoundException('Пользователь не найден');
    }

    return { deleted: true };
  }
}
