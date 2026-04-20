export type PaginationQuery = {
  page: number;
  limit: number;
  skip: number;
};

export const getPagination = (pageInput?: unknown, limitInput?: unknown): PaginationQuery => {
  const page = Number(pageInput ?? 1);
  const limit = Number(limitInput ?? 10);
  const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
  const safeLimit = Number.isNaN(limit) || limit < 1 ? 10 : Math.min(limit, 100);

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit
  };
};
