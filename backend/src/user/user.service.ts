import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { User } from 'src/entities/user/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly db: DatabaseService) {}

  private get table() {
    return this.db.tables.USERS;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const [user] = await this.db.query<User>(
      `INSERT INTO ${this.table} (name, email)
       VALUES ($1, $2)
       RETURNING *`,
      [createUserDto.email, createUserDto.email],
    );
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.db.query<User>(`SELECT * FROM ${this.table}`);
  }

  async findOne(id: number): Promise<User | null> {
    const [user] = await this.db.query<User>(
      `SELECT * FROM ${this.table} WHERE id = $1`,
      [id],
    );
    return user || null;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    const [user] = await this.db.query<User>(
      `UPDATE ${this.table}
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [updateUserDto.email, updateUserDto.email, id],
    );
    return user || null;
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.db.query(
      `DELETE FROM ${this.table} WHERE id = $1 RETURNING id`,
      [id],
    );
    return result.length > 0;
  }
}
