export const Tables = {
  USERS: 'users',
  TODOS: 'todos',
  // добавляй новые таблицы здесь
} as const;

export type TableName = (typeof Tables)[keyof typeof Tables];
