import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2 } from 'lucide-react'
import { StatusBadge } from '../components/StatusBadge'

export function CheckStatus({ checkStatus }) {
  const [orderId, setOrderId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(null)

  async function handleCheck(e) {
    e.preventDefault()
    if (!orderId.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const data = await checkStatus(orderId.trim())
      setResult(data)
    } catch (err) {
      setResult({ status: 'ERROR', orderId: orderId.trim() })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-lg mx-auto space-y-4"
    >
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Search size={20} className="text-blue-400" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-white">Check Order Status</h2>
            <p className="text-xs text-slate-500">Look up any order by ID</p>
          </div>
        </div>

        <form onSubmit={handleCheck} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Order ID</label>
            <input
              className="inp"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              placeholder="e.g. order-001"
            />
          </div>
          <button type="submit" disabled={loading || !orderId.trim()} className="btn-primary flex items-center justify-center gap-2 !bg-blue-600 hover:!bg-blue-700">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Checking…</> : <><Search size={16} /> Check Status</>}
          </button>
        </form>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0  }}
              exit={{    opacity: 0, y: 12  }}
              className="mt-5 p-4 rounded-xl border border-[#2d3148] bg-[#0f1117]"
            >
              {result.status === 'NOT_FOUND' || result.status === 'ERROR' ? (
                <p className="text-red-400 text-sm font-semibold">⚠️ Order not found: <span className="font-mono">{result.orderId}</span></p>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Order ID</p>
                    <p className="font-mono text-sm text-white">{result.orderId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-1">Status</p>
                    <StatusBadge status={result.status} />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
