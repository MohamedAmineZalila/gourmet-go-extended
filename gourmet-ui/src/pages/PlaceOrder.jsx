import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Zap, CheckCircle, XCircle } from 'lucide-react'

export function PlaceOrder({ placeOrder, onSuccess }) {
  const [orderId, setOrderId]   = useState('')
  const [amount, setAmount]     = useState('50')
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState(null) // { status, orderId }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    const id = orderId.trim() || 'order-' + Math.random().toString(36).substring(2, 8)
    try {
      const data = await placeOrder(id, parseFloat(amount) || 50)
      setResult(data)
      if (data.status === 'APPROVED' || data.status === 'REJECTED') {
        onSuccess && onSuccess()
        setOrderId('')
      }
    } catch (err) {
      setResult({ status: 'ERROR', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  const isApproved = result?.status === 'APPROVED'
  const isRejected = result?.status === 'REJECTED'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-lg mx-auto"
    >
      <div className="card">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#f97316]/10 flex items-center justify-center">
            <ShoppingBag size={20} className="text-[#f97316]" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-white">Create New Order</h2>
            <p className="text-xs text-slate-500">Fill in the details below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
              Order ID
            </label>
            <input
              className="inp"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              placeholder="e.g. order-001  (leave blank to auto-generate)"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
              Amount ($)
            </label>
            <input
              className="inp"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
            {/* Visual threshold indicator */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-[#2d3148] overflow-hidden">
                <motion.div
                  className={`h-full rounded-full transition-colors duration-500 ${parseFloat(amount) >= 100 ? 'bg-red-500' : 'bg-emerald-500'}`}
                  animate={{ width: `${Math.min((parseFloat(amount) || 0) / 2, 100)}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className={`text-xs font-semibold transition-colors duration-300 ${parseFloat(amount) >= 100 ? 'text-red-400' : 'text-emerald-400'}`}>
                {parseFloat(amount) >= 100 ? '→ REJECTED' : '→ APPROVED'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">Amount &lt; $100 gets approved · Amount ≥ $100 triggers compensation</p>
          </div>

          <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2">
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                Processing Saga…
              </>
            ) : (
              <>
                <Zap size={16} />
                Place Order
              </>
            )}
          </button>
        </form>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit={{    opacity: 0, y: 12, scale: 0.97  }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`mt-4 p-4 rounded-xl border flex items-center gap-3 ${
                isApproved ? 'bg-emerald-900/30 border-emerald-500/30'
                : isRejected ? 'bg-red-900/30 border-red-500/30'
                : 'bg-purple-900/30 border-purple-500/30'
              }`}
            >
              {isApproved
                ? <CheckCircle size={20} className="text-emerald-400 shrink-0" />
                : <XCircle    size={20} className="text-red-400 shrink-0" />
              }
              <div>
                <p className={`font-bold text-sm ${isApproved ? 'text-emerald-400' : isRejected ? 'text-red-400' : 'text-purple-400'}`}>
                  {isApproved ? 'Order Approved!' : isRejected ? 'Order Rejected' : result.status}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isApproved
                    ? `Order ${result.orderId} was successfully approved.`
                    : isRejected
                    ? `Payment failed — kitchen ticket cancelled (compensation triggered).`
                    : result.message || ''}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {[
          { label: 'Happy Path',       desc: 'Amount < $100',  color: 'emerald', icon: '✅' },
          { label: 'Compensation',     desc: 'Amount ≥ $100',  color: 'red',     icon: '❌' },
        ].map(c => (
          <motion.div
            key={c.label}
            whileHover={{ scale: 1.02 }}
            className="card text-center cursor-default"
          >
            <span className="text-2xl">{c.icon}</span>
            <p className="font-semibold text-sm text-white mt-1">{c.label}</p>
            <p className="text-xs text-slate-500">{c.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
