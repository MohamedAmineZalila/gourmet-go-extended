import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, ClipboardList, Search } from 'lucide-react'
import { StatusBadge } from '../components/StatusBadge'
import { TableSkeleton } from '../components/Skeleton'

export function OrderHistory({ orders, loading, onRefresh, cancelOrder, onCancelled }) {
  const [search, setSearch]       = useState('')
  const [cancelling, setCancelling] = useState(null)
  const [filterStatus, setFilter]   = useState('ALL')

  const statuses = ['ALL', 'APPROVED', 'REJECTED', 'CANCELLED', 'PENDING']

  const filtered = orders
    .filter(o => filterStatus === 'ALL' || o.status === filterStatus ||
      (filterStatus === 'PENDING' && ['PENDING', 'APPROVAL_PENDING'].includes(o.status)))
    .filter(o => o.orderId.toLowerCase().includes(search.toLowerCase()))

  async function handleCancel(orderId) {
    setCancelling(orderId)
    try {
      await cancelOrder(orderId)
      onCancelled && onCancelled()
    } finally {
      setCancelling(null)
    }
  }

  const canCancel = (status) => ['APPROVED', 'PENDING', 'APPROVAL_PENDING'].includes(status)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList size={20} className="text-[#f97316]" />
          <h2 className="font-bold text-lg text-white">Order History</h2>
          <span className="text-xs bg-[#2d3148] text-slate-400 px-2 py-0.5 rounded-full font-mono">{orders.length}</span>
        </div>
        <button onClick={onRefresh} disabled={loading} className="btn-blue flex items-center gap-1.5">
          <motion.div animate={loading ? { rotate: 360 } : {}} transition={{ duration: 0.7, repeat: loading ? Infinity : 0, ease: 'linear' }}>
            <RefreshCw size={13} />
          </motion.div>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border cursor-pointer ${
              filterStatus === s
                ? 'bg-[#f97316] border-[#f97316] text-white'
                : 'bg-transparent border-[#2d3148] text-slate-400 hover:border-[#f97316] hover:text-[#f97316]'
            }`}
          >
            {s}
          </button>
        ))}
        {/* Search */}
        <div className="relative ml-auto">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="inp pl-8 py-1.5 text-xs w-44"
            placeholder="Search order ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="p-6"><TableSkeleton /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-600">
            <span className="text-4xl mb-3">📋</span>
            <p className="text-sm">{orders.length === 0 ? 'No orders yet.' : 'No orders match your filter.'}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2d3148]">
                {['Order ID', 'Amount', 'Status', 'Created At', 'Action'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((o, i) => (
                  <motion.tr
                    key={o.orderId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0  }}
                    exit={{    opacity: 0, x:  10 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-[#1a1f30] hover:bg-[#161922] transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-300">{o.orderId}</td>
                    <td className="px-5 py-3.5 text-slate-400">${Number(o.amount).toFixed(2)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={o.status} /></td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      {canCancel(o.status) ? (
                        <button
                          onClick={() => handleCancel(o.orderId)}
                          disabled={cancelling === o.orderId}
                          className="btn-red flex items-center gap-1"
                        >
                          {cancelling === o.orderId ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                              className="w-3 h-3 border border-white border-t-transparent rounded-full"
                            />
                          ) : '🚫'}
                          Cancel
                        </button>
                      ) : (
                        <span className="text-slate-700 text-xs">—</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  )
}
