const STATUS_MAP = {
  confirmed:  { color: 'var(--green)',  bg: 'var(--green-dim)',  label: 'Confirmed' },
  pending:    { color: 'var(--amber)',  bg: 'var(--amber-dim)',  label: 'Pending' },
  completed:  { color: 'var(--blue)',   bg: 'var(--blue-dim)',   label: 'Completed' },
  cancelled:  { color: 'var(--red)',    bg: 'var(--red-dim)',    label: 'Cancelled' },
}

const PAYMENT_MAP = {
  paid:     { color: 'var(--green)', label: 'Paid' },
  partial:  { color: 'var(--amber)', label: 'Partial' },
  unpaid:   { color: 'var(--red)',   label: 'Unpaid' },
  refunded: { color: 'var(--blue)',  label: 'Refunded' },
}

export function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { color: 'var(--text-muted)', bg: 'var(--bg-4)', label: status }
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.color}22`,
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 600,
      padding: '3px 10px',
      letterSpacing: '0.04em',
      whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  )
}

export function PaymentBadge({ status }) {
  const s = PAYMENT_MAP[status] || { color: 'var(--text-muted)', label: status }
  return (
    <span style={{
      color: s.color,
      fontSize: 12,
      fontWeight: 500,
    }}>
      {s.label}
    </span>
  )
}
