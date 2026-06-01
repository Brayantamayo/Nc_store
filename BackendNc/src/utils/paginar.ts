import { z } from 'zod';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export type PaginationParams = PaginationQuery & {
  skip: number;
  take: number;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export const paginar = (query: unknown, defaultLimit = 10): PaginationParams => {
  const parsed = paginationQuerySchema
    .extend({
      limit: z.coerce.number().int().min(1).max(100).default(defaultLimit),
    })
    .parse(query);

  return {
    ...parsed,
    skip: (parsed.page - 1) * parsed.limit,
    take: parsed.limit,
  };
};

export const buildPaginationMeta = (total: number, page: number, limit: number): PaginationMeta => {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};
