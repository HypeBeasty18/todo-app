import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import { Tables } from './tables';

config({ path: ['.env'] });

@Injectable()
export class DatabaseService {
  public readonly sql: NeonQueryFunction<false, false>;
  public readonly tables = Tables;

  constructor() {
    this.sql = neon(process.env.DATABASE_URL!);
  }

  /**
   * Выполняет параметризованный SQL запрос
   * @param query - SQL строка с $1, $2, ... плейсхолдерами
   * @param params - массив параметров
   */
  async query<T = Record<string, unknown>>(
    query: string,
    params: unknown[] = [],
  ): Promise<T[]> {
    // Преобразуем строку в tagged template формат
    const parts = query.split(/\$\d+/);
    const strings = Object.assign(parts, {
      raw: parts,
    }) as TemplateStringsArray;
    return this.sql(strings, ...params) as Promise<T[]>;
  }
}
