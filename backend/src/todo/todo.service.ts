import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Todo } from 'src/entities/todo/todo.entity';
import { ListRequest, ListResponse } from 'src/types';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodoService {
  constructor(private readonly db: DatabaseService) {}

  private get table() {
    return this.db.tables.TODOS;
  }

  async create(createTodoDto: CreateTodoDto, userId: string) {
    const [todo] = await this.db.query<Todo>(
      `INSERT INTO ${this.table} (title, description, priority, completed, user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, description, priority, completed, user_id as "userId", created_at as "createdAt", updated_at as "updatedAt"`,
      [
        createTodoDto.title,
        createTodoDto.description,
        createTodoDto.priority,
        false,
        userId,
      ],
    );
    return todo;
  }

  async findAll(
    request: ListRequest<{ priority?: string; completed?: boolean }>,
    userId: string,
  ): Promise<ListResponse<Todo>> {
    // Строим WHERE условия
    const whereConditions = ['user_id = $1'];
    const params: unknown[] = [userId];

    if (request.filters?.ids?.length > 0) {
      const placeholders = request.filters?.ids.map(
        (_, i) => `$${params.length + i + 1}`,
      );
      whereConditions.push(`id IN (${placeholders.join(', ')})`);
      params.push(...request.filters.ids);
    }

    if (request.filters?.search) {
      params.push(`%${request.filters?.search}%`);
      whereConditions.push(`title ILIKE $${params.length}`);
    }

    if (request.filters?.priority) {
      params.push(request.filters.priority);
      whereConditions.push(`priority = $${params.length}`);
    }

    if (request.filters?.completed) {
      params.push(request.filters.completed);
      whereConditions.push(`completed = $${params.length}`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Получаем общее количество
    const [countResult] = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM ${this.table} WHERE ${whereClause}`,
      params,
    );

    // Получаем результаты с пагинацией
    const results = await this.db.query<Todo>(
      `SELECT id, title, description, priority, completed, user_id as "userId", created_at as "createdAt", updated_at as "updatedAt"
       FROM ${this.table}
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1}
       OFFSET $${params.length + 2}`,
      [...params, request.pagination?.limit, request.pagination?.offset],
    );

    return {
      aggregation: {
        count: parseInt(countResult.count, 10),
      },
      filters: request.filters,
      pagination: {
        offset: request.pagination?.offset,
        limit: request.pagination?.limit,
      },
      results,
    };
  }

  async update(updateTodoDto: UpdateTodoDto, userId: string) {
    const [todo] = await this.db.query<Todo>(
      `UPDATE ${this.table}
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           priority = COALESCE($3, priority),
           completed = COALESCE($4, completed),
           updated_at = NOW()
       WHERE id = $5 AND user_id = $6
       RETURNING id, title, description, priority, completed, user_id as "userId", created_at as "createdAt", updated_at as "updatedAt"`,
      [
        updateTodoDto.title,
        updateTodoDto.description,
        updateTodoDto.priority,
        updateTodoDto.completed,
        updateTodoDto.id,
        userId,
      ],
    );

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    return todo;
  }

  async remove(id: string, userId: string) {
    const result = await this.db.query<Todo>(
      `DELETE FROM ${this.table}
       WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );

    if (result.length === 0) {
      throw new NotFoundException('Todo not found');
    }

    return { deleted: true };
  }
}

//todo поменять все запросы так чтобы было как в информационном стандарте /bulk and /list
