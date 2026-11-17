import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { changeStaffRole, getStaff, inviteStaff, removeStaff, withdrawInvitation } from '../../api/admin'
import { useAuth } from '../../auth/useAuth'
import { useHotelCtx } from '../../components/admin/HotelContext'
import { roles } from '../../content'
import { fmtDate, fullName } from '../../lib/format'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { Input, Select } from '../../components/ui/Field'
import PageHeader from '../../components/ui/PageHeader'
import { PageSpinner } from '../../components/ui/Spinner'
import Table from '../../components/ui/Table'
import { ErrorBox } from '../../components/ui/States'

const ROLE_OPTIONS = [
  { value: 'hotel_staff', label: 'Staff — front desk: bookings, check-in/out' },
  { value: 'hotel_admin', label: 'Admin — everything incl. rooms, money and staff' },
]

export default function Staff() {
  const { hotelId } = useHotelCtx()
  const { user } = useAuth()
  const qc = useQueryClient()
  const staff = useQuery({ queryKey: ['staff', hotelId], queryFn: () => getStaff(hotelId) })
  const [invite, setInvite] = useState({ email: '', role: 'hotel_staff' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [note, setNote] = useState('')

  const refresh = () => qc.invalidateQueries({ queryKey: ['staff', hotelId] })
  const act = (fn) => {
    setError(null)
    return fn().then(refresh, setError)
  }

  const send = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setNote('')
    try {
      const r = await inviteStaff(hotelId, invite.email.trim(), invite.role)
      setNote(r.member ? `${invite.email} already had an account and was added.` : `Invitation sent to ${invite.email}.`)
      setInvite({ email: '', role: 'hotel_staff' })
      refresh()
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="Staff" subtitle="People who can manage this property." />
      <Card className="mb-6">
        <form onSubmit={send} className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <Input label="Invite by email" type="email" required value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} />
          <Select label="Role" value={invite.role} onChange={(e) => setInvite({ ...invite, role: e.target.value })} options={ROLE_OPTIONS} />
          <Button type="submit" loading={busy}>
            Invite
          </Button>
        </form>
        {note && <p className="mt-3 text-sm text-success">{note}</p>}
      </Card>
      <ErrorBox error={error || staff.error} className="mb-4" />
      {staff.isPending ? (
        <PageSpinner />
      ) : (
        <>
          <Table
            rowKey="userId"
            columns={[
              { key: 'name', label: 'Name', render: (m) => <b>{fullName(m)}</b> },
              { key: 'email', label: 'Email' },
              {
                key: 'role',
                label: 'Role',
                render: (m) =>
                  m.userId === user?.id ? (
                    roles[m.role]
                  ) : (
                    <select
                      value={m.role}
                      onChange={(e) => act(() => changeStaffRole(hotelId, m.userId, e.target.value))}
                      className="rounded-lg border border-line bg-field px-2 py-1 text-sm"
                    >
                      <option value="hotel_staff">{roles.hotel_staff}</option>
                      <option value="hotel_admin">{roles.hotel_admin}</option>
                    </select>
                  ),
              },
              {
                key: 'actions',
                label: '',
                render: (m) =>
                  m.userId !== user?.id && (
                    <Button size="sm" variant="ghost" onClick={() => window.confirm(`Remove ${fullName(m)}?`) && act(() => removeStaff(hotelId, m.userId))}>
                      Remove
                    </Button>
                  ),
              },
            ]}
            rows={staff.data?.members ?? []}
          />
          {staff.data?.invitations?.length > 0 && (
            <>
              <h2 className="mb-3 mt-8 font-bold">Pending invitations</h2>
              <Table
                columns={[
                  { key: 'email', label: 'Email' },
                  { key: 'role', label: 'Role', render: (i) => roles[i.role] },
                  { key: 'createdAt', label: 'Sent', render: (i) => fmtDate(i.createdAt) },
                  {
                    key: 'actions',
                    label: '',
                    render: (i) => (
                      <Button size="sm" variant="ghost" onClick={() => act(() => withdrawInvitation(hotelId, i.id))}>
                        Withdraw
                      </Button>
                    ),
                  },
                ]}
                rows={staff.data.invitations}
              />
            </>
          )}
        </>
      )}
    </>
  )
}
