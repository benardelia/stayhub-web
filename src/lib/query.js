import { QueryClient, useInfiniteQuery } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // 4xx answers are final; retry only network and server errors.
      retry: (count, err) => count < 2 && !(err?.status >= 400 && err?.status < 500),
    },
  },
})

/**
 * Cursor-paginated list ({ items, nextCursor, total }). Returns the flattened items plus the usual
 * query state and loadMore().
 */
export function usePaged(key, fetchPage, params = {}, options = {}) {
  const q = useInfiniteQuery({
    queryKey: [...key, params],
    queryFn: ({ pageParam }) => fetchPage({ ...params, cursor: pageParam || undefined }),
    initialPageParam: '',
    getNextPageParam: (last) => last?.nextCursor || undefined,
    ...options,
  })
  return {
    ...q,
    items: q.data?.pages.flatMap((p) => p.items ?? []) ?? [],
    total: q.data?.pages[0]?.total ?? null,
    loadMore: q.fetchNextPage,
  }
}
