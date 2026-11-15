export const PAGE_SIZE = 12;

export function pageCount(total: number, size = PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / size));
}

export function paginate<T>(items: readonly T[], page: number, size = PAGE_SIZE) {
  if (!Number.isSafeInteger(page) || page < 1) throw new RangeError("页码必须是正整数。");
  const count = pageCount(items.length, size);
  const start = Math.max(1, Math.min(page - 1, count - 2));
  const pages = [...new Set([1, start, start + 1, start + 2, count])]
    .filter((value) => value <= count)
    .sort((a, b) => a - b);
  return {
    items: items.slice((page - 1) * size, page * size),
    pageCount: count,
    pages,
  };
}

export function pageHref(basePath: string, page: number, search = ""): string {
  const pathname = page === 1 ? basePath : `${basePath}/page/${page}`;
  return search ? `${pathname}?${search}` : pathname;
}
