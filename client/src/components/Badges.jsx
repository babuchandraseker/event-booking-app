import "../admin.css";

const STATUS_MAP = {
  confirmed:  { color: 'var(--green)', bg: 'var(--green-dim)', border: 'rgba(34,160,107,0.25)',  label: 'Confirmed' },
  pending:    { color: 'var(--text-muted)', bg: 'var(--bg-muted)', border: 'var(--border)',       label: 'Pending' },
  completed:  { color: 'var(--blue)',  bg: 'var(--blue-dim)',  border: 'rgba(75,123,191,0.25)',   label: 'Completed' },
  cancelled:  { color: 'var(--red)',   bg: 'var(--red-dim)',   border: 'rgba(217,79,79,0.25)',    label: 'Cancelled' },
}

const PAYMENT_MAP = {
  paid:         { color: 'var(--green)', bg: 'var(--green-dim)', border: 'rgba(34,160,107,0.25)',  label: 'Paid' },
  partial:      { color: 'var(--amber)', bg: 'var(--amber-dim)', border: 'var(--gold-border)',     label: 'Partial' },
  unpaid:       { color: 'var(--red)',   bg: 'var(--red-dim)',   border: 'rgba(217,79,79,0.25)',   label: 'Unpaid' },
  refunded:     { color: 'var(--blue)',  bg: 'var(--blue-dim)',  border: 'rgba(75,123,191,0.25)',  label: 'Refunded' },
  advance_paid: { color: 'var(--gold)',  bg: 'var(--gold-dim)',  border: 'var(--gold-border)',     label: 'Advance Paid' },
}

export function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { color: 'var(--text-muted)', bg: 'var(--bg-muted)', border: 'var(--border)', label: status }
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 600,
      color: s.color,
      background: s.bg,
      border: `1px solid ${s.border}`,
      letterSpacing: '0.04em',
      whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  )
}

export function PaymentBadge({ status }) {
  const s = PAYMENT_MAP[status] || { color: 'var(--text-muted)', bg: 'var(--bg-muted)', border: 'var(--border)', label: status }
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 600,
      color: s.color,
      background: s.bg,
      border: `1px solid ${s.border}`,
      letterSpacing: '0.04em',
      whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  )
}
