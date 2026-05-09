const styles = {
  APPROVED:         'bg-emerald-900/60 text-emerald-400 border border-emerald-500/30',
  REJECTED:         'bg-red-900/60 text-red-400 border border-red-500/30',
  CANCELLED:        'bg-yellow-900/60 text-yellow-400 border border-yellow-500/30',
  APPROVAL_PENDING: 'bg-blue-900/60 text-blue-400 border border-blue-500/30',
  PENDING:          'bg-slate-800 text-slate-400 border border-slate-600/30',
}

const labels = {
  APPROVED:         '✅ Approved',
  REJECTED:         '❌ Rejected',
  CANCELLED:        '🚫 Cancelled',
  APPROVAL_PENDING: '⏳ Pending',
  PENDING:          '⏳ Pending',
}

export function StatusBadge({ status }) {
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide ${styles[status] || styles.PENDING}`}>
      {labels[status] || status}
    </span>
  )
}
