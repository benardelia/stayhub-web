import { useState } from 'react'
import Modal from './Modal'
import Button from './Button'
import { Input, Textarea } from './Field'
import { ErrorBox } from './States'

/**
 * Confirms an action, optionally asking for a reason and/or an amount.
 * onConfirm({ reason, amount }) returns a promise; the modal closes when it resolves.
 */
export default function PromptModal({ open, onClose, title, message, confirmLabel = 'Confirm', danger, askReason, askAmount, amountHint, onConfirm }) {
  const [reason, setReason] = useState('')
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const close = () => {
    setReason('')
    setAmount('')
    setError(null)
    onClose()
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await onConfirm({ reason: reason.trim(), amount: amount ? Number(amount) : undefined })
      close()
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={close} title={title}>
      <form onSubmit={submit} className="space-y-4">
        {message && <p className="text-sm text-muted">{message}</p>}
        {askAmount && (
          <Input label="Amount (TSh)" type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} hint={amountHint} />
        )}
        {askReason && <Textarea label="Reason" rows={3} required value={reason} onChange={(e) => setReason(e.target.value)} />}
        <ErrorBox error={error} />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={close}>
            Back
          </Button>
          <Button type="submit" variant={danger ? 'danger' : 'primary'} loading={busy}>
            {confirmLabel}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
