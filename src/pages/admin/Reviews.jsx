import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getReviews, replyToReview } from '../../api/admin'
import { useHotelCtx } from '../../components/admin/HotelContext'
import { fmtDate } from '../../lib/format'
import { usePaged } from '../../lib/query'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { Textarea } from '../../components/ui/Field'
import PageHeader from '../../components/ui/PageHeader'
import { PageSpinner } from '../../components/ui/Spinner'
import Stars from '../../components/ui/Stars'
import { Empty, ErrorBox, LoadMore } from '../../components/ui/States'

export default function Reviews() {
  const { hotelId, hotel, isAdmin } = useHotelCtx()
  const list = usePaged(['admin-reviews', hotelId], (p) => getReviews(hotelId, p), { limit: 20 })
  return (
    <>
      <PageHeader title="Reviews" subtitle={hotel.reviewCount ? `★ ${hotel.rating.toFixed(1)} from ${hotel.reviewCount} reviews` : 'No reviews yet'} />
      <ErrorBox error={list.error} />
      {list.isPending ? (
        <PageSpinner />
      ) : list.items.length ? (
        <div className="max-w-3xl space-y-4">
          {list.items.map((r) => (
            <ReviewCard key={r.id} review={r} canReply={isAdmin} />
          ))}
        </div>
      ) : (
        <Empty title="No reviews yet">Guests can review a stay after they check out.</Empty>
      )}
      <LoadMore query={list} />
    </>
  )
}

function ReviewCard({ review: r, canReply }) {
  const { hotelId } = useHotelCtx()
  const qc = useQueryClient()
  const [reply, setReply] = useState(r.reply ?? '')
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const send = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await replyToReview(hotelId, r.id, reply.trim())
      setEditing(false)
      qc.invalidateQueries({ queryKey: ['admin-reviews', hotelId] })
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <p className="font-semibold">
          {r.authorName} <span className="text-xs font-normal text-muted">· {fmtDate(r.createdAt)}</span>
        </p>
        <Stars value={r.rating} size="text-sm" />
      </div>
      <p className="mt-2 text-sm">{r.comment}</p>
      {r.reply && !editing && (
        <div className="mt-3 rounded-2xl bg-field p-3 text-sm">
          <p className="font-semibold">Your reply</p>
          <p className="mt-1 text-muted">{r.reply}</p>
        </div>
      )}
      {canReply &&
        (editing ? (
          <form onSubmit={send} className="mt-3 space-y-2">
            <Textarea rows={3} required value={reply} onChange={(e) => setReply(e.target.value)} />
            <ErrorBox error={error} />
            <div className="flex gap-2">
              <Button type="submit" size="sm" loading={busy}>
                Post reply
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button size="sm" variant="ghost" className="mt-2" onClick={() => setEditing(true)}>
            {r.reply ? 'Edit reply' : 'Reply'}
          </Button>
        ))}
    </Card>
  )
}
