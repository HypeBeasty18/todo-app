export const Tables = {
  USERS: 'users',
  // добавляй новые таблицы здесь
} as const;

export type TableName = (typeof Tables)[keyof typeof Tables];
