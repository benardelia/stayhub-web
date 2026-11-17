// Saved hotels for the signed-in guest: a Set of ids for hearts, and toggle() with an optimistic update.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router'
import { getFavourites, removeFavourite, saveFavourite } from '../api/guest'
import { useAuth } from '../auth/useAuth'

const KEY = ['favourites', 'ids']

export function useFavourites() {
  const { signedIn } = useAuth()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const loc = useLocation()

  const ids = useQuery({
    queryKey: KEY,
    enabled: signedIn,
    queryFn: () => getFavourites({ limit: 100 }).then((p) => p.items.map((h) => h.id)),
    staleTime: 60_000,
  })
  const set = new Set(signedIn ? (ids.data ?? []) : [])

  const mutation = useMutation({
    mutationFn: ({ id, on }) => (on ? saveFavourite(id) : removeFavourite(id)),
    onMutate: async ({ id, on }) => {
      await qc.cancelQueries({ queryKey: KEY })
      const prev = qc.getQueryData(KEY)
      qc.setQueryData(KEY, (old = []) => (on ? [...new Set([...old, id])] : old.filter((x) => x !== id)))
      return { prev }
    },
    onError: (_e, _v, ctx) => qc.setQueryData(KEY, ctx?.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ['favourites'] }),
  })

  const toggle = (id) => {
    if (!signedIn) return navigate(`/signin?next=${encodeURIComponent(loc.pathname + loc.search)}`)
    mutation.mutate({ id, on: !set.has(id) })
  }

  return { has: (id) => set.has(id), toggle, count: set.size }
}
