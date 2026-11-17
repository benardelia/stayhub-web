import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { disableUser, enableUser, getUser, getUsers } from '../../api/platform'
import { roles } from '../../content'
import { fmtDate, fullName, plural } from '../../lib/format'
import { usePaged } from '../../lib/query'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { Row } from '../../components/ui/Card'
import { Input, Select } from '../../components/ui/Field'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/ui/PageHeader'
import { PageSpinner } from '../../components/ui/Spinner'
import Table from '../../components/ui/Table'
import { ErrorBox, LoadMore } from '../../components/ui/States'

export default function Users() {
  const [f, setF] = useState({ q: '', role: '' })
  const [open, setOpen] = useState(null)
  const list = usePaged(['platform-users'], getUsers, { ...f, limit: 25 })
  return (
    <>
      <PageHeader title="Users" subtitle={list.total != null ? plural(list.total, 'user') : ' '} />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Input placeholder="Name or email" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
        <Select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} placeholder="All roles" options={[{ value: 'guest', label: 'Guests' }, { value: 'platform_admin', label: 'Platform admins' }]} />
      </div>
      <ErrorBox error={list.error} />
      {list.isPending ? (
        <PageSpinner />
      ) : (
        <Table
          columns={[
            { key: 'name', label: 'Name', render: (u) => <b>{fullName(u)}</b> },
            { key: 'email', label: 'Email' },
            { key: 'role', label: 'Role', render: (u) => roles[u.role] ?? u.role },
            { key: 'createdAt', label: 'Joined', render: (u) => fmtDate(u.createdAt) },
            { key: 'state', label: '', render: (u) => (u.disabledAt ? <Badge tone="danger">Disabled</Badge> : null) },
          ]}
          rows={list.items}
          onRowClick={(u) => setOpen(u.id)}
          empty="No users match."
        />
      )}
      <LoadMore query={list} />
      {open && <UserModal id={open} onClose={() => setOpen(null)} />}
    </>
  )
}

function UserModal({ id, onClose }) {
  const qc = useQueryClient()
  const u = useQuery({ queryKey: ['platform-user', id], queryFn: () => getUser(id) })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const toggle = async () => {
    setBusy(true)
    setError(null)
    try {
      await (u.data.disabledAt ? enableUser(id) : disableUser(id))
      qc.invalidateQueries({ queryKey: ['platform-user', id] })
      qc.invalidateQueries({ queryKey: ['platform-users'] })
    } catch (e) {
      setError(e)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Modal open onClose={onClose} title={u.data ? fullName(u.data) : 'User'}>
      {u.isPending ? (
        <PageSpinner />
      ) : u.error ? (
        <ErrorBox error={u.error} />
      ) : (
        <>
          <Row label="Email" value={u.data.email} />
          <Row label="Phone" value={u.data.phone || '—'} />
          <Row label="Role" value={roles[u.data.role]} />
          <Row label="Joined" value={fmtDate(u.data.createdAt)} />
          <Row label="Sign-in" value={u.data.hasPassword ? 'Password' : 'Google / Apple only'} />
          {u.data.memberships?.length > 0 && (
            <div className="mt-4">
              <p className="mb-1 text-sm font-bold">Hotels</p>
              {u.data.memberships.map((m) => (
                <Row key={m.hotelId} label={m.hotelName} value={roles[m.role]} />
              ))}
            </div>
          )}
          <ErrorBox error={error} className="mt-4" />
          <Button variant={u.data.disabledAt ? 'primary' : 'danger-outline'} className="mt-5" loading={busy} onClick={toggle}>
            {u.data.disabledAt ? 'Re-enable account' : 'Disable account and sign out everywhere'}
          </Button>
        </>
      )}
    </Modal>
  )
}
