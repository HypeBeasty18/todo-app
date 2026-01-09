export type ListRequest<F extends Record<string, any> = Record<string, any>> = {
  filters?: F & {
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    ids?: string[];
  };

  pagination?: {
    limit?: number;
    offset?: number;
  };
};
