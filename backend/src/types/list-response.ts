export interface ListResponse<T, F = Record<string, any>> {
  aggregation: {
    count: number;
  };
  filters: F;
  pagination: {
    offset: number;
    limit: number;
  };
  results: T[];
}
