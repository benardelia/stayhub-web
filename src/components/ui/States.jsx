// Empty, error and "load more" states shared by every list.
import Button from './Button'

export function Empty({ title = 'Nothing here yet', children, action }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-line px-6 py-14 text-center">
      <p className="text-lg font-bold">{title}</p>
      {children && <p className="mt-2 max-w-md text-sm text-muted">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorBox({ error, className = '' }) {
  if (!error) return null
  return (
    <div role="alert" className={`rounded-2xl border border-danger/30 bg-danger/8 px-4 py-3 text-sm text-danger ${className}`}>
      {error.message || String(error)}
    </div>
  )
}

/** "Load more" for usePaged lists. */
export function LoadMore({ query }) {
  if (!query.hasNextPage) return null
  return (
    <div className="mt-6 flex justify-center">
      <Button variant="outline" loading={query.isFetchingNextPage} onClick={() => query.loadMore()}>
        Load more
      </Button>
    </div>
  )
}
