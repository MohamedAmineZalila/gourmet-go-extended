import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { RefreshCw, TrendingUp } from 'lucide-react'
import { StatSkeleton } from '../components/Skeleton'

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    let start = 0
    const end = value
    if (start === end) { setDisplay(end); return }
    const duration = 600
    const step = 16
    const increment = (end - start) / (duration / step)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) { clearInterval(timer); setDisplay(end) }
      else setDisplay(Math.floor(start))
    }, step)
    return () => clearInterval(timer)
  }, [value])

  return <span>{display}</span>
}

const STAT_CARDS = [
  { key: 'total',     label: 'Total Orders', color: '#f97316', bg: 'from-orange-900/20 to-transparent' },
  { key: 'approved',  label: 'Approved',     color: '#34d399', bg: 'from-emerald-900/20 to-transparent' },
  { key: 'rejected',  label: 'Rejected',     color: '#f87171', bg: 'from-red-900/20 to-transparent' },
  { key: 'cancelled', label: 'Cancelled',    color: '#fbbf24', bg: 'from-yellow-900/20 to-transparent' },
]

const BAR_COLORS = {
  Approved:  '#34d399',
  Rejected:  '#f87171',
  Cancelled: '#fbbf24',
  Pending:   '#60a5fa',
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1e2130] border border-[#2d3148] rounded-xl px-3 py-2 text-xs text-slate-300 shadow-xl">
      <p className="font-bold" style={{ color: payload[0].fill }}>{payload[0].name}</p>
      <p>{payload[0].value} orders</p>
    </div>
  )
}

export function Dashboard({ orders, loading, onRefresh }) {
  const approved  = orders.filter(o => o.status === 'APPROVED').length
  const rejected  = orders.filter(o => o.status === 'REJECTED').length
  const cancelled = orders.filter(o => o.status === 'CANCELLED').length
  const pending   = orders.filter(o => ['PENDING', 'APPROVAL_PENDING'].includes(o.status)).length
  const total     = orders.length

  const stats = { total, approved, rejected, cancelled }

  const chartData = [
    { name: 'Approved',  value: approved  },
    { name: 'Rejected',  value: rejected  },
    { name: 'Cancelled', value: cancelled },
    { name: 'Pending',   value: pending   },
  ]

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
          <TrendingUp size={20} className="text-[#f97316]" />
          <h2 className="font-bold text-lg text-white">Live Dashboard</h2>
        </div>
        <button onClick={onRefresh} disabled={loading} className="btn-blue flex items-center gap-1.5">
          <motion.div animate={loading ? { rotate: 360 } : {}} transition={{ duration: 0.7, repeat: loading ? Infinity : 0, ease: 'linear' }}>
            <RefreshCw size={13} />
          </motion.div>
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      {loading && !total ? <StatSkeleton /> : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STAT_CARDS.map((s, i) => (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ scale: 1.03 }}
              className={`card bg-gradient-to-b ${s.bg} text-center cursor-default`}
            >
              <p className="text-3xl font-black" style={{ color: s.color }}>
                <AnimatedNumber value={stats[s.key]} />
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{s.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Orders by Status</h3>
        {total === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-600">
            <span className="text-4xl mb-3">📊</span>
            <p className="text-sm">No orders yet — place your first one!</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={40}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis hide allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map(entry => (
                  <Cell key={entry.name} fill={BAR_COLORS[entry.name]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent activity */}
      {orders.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Recent Activity</h3>
          <div className="space-y-2">
            {orders.slice(0, 5).map((o, i) => (
              <motion.div
                key={o.orderId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between py-2 border-b border-[#2d3148] last:border-0"
              >
                <span className="text-sm font-mono text-slate-300">{o.orderId}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">${Number(o.amount).toFixed(2)}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    o.status === 'APPROVED'  ? 'bg-emerald-900/50 text-emerald-400'
                    : o.status === 'REJECTED'  ? 'bg-red-900/50 text-red-400'
                    : o.status === 'CANCELLED' ? 'bg-yellow-900/50 text-yellow-400'
                    : 'bg-blue-900/50 text-blue-400'
                  }`}>{o.status}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
