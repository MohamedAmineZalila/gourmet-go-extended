import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, BarChart2, ClipboardList, Search } from 'lucide-react'
import { useOrders } from './hooks/useOrders'
import { Toast, useToast } from './components/Toast'
import { PlaceOrder }   from './pages/PlaceOrder'
import { Dashboard }    from './pages/Dashboard'
import { OrderHistory } from './pages/OrderHistory'
import { CheckStatus }  from './pages/CheckStatus'

const TABS = [
  { id: 'place',    label: 'Place Order',    icon: ShoppingBag  },
  { id: 'dashboard',label: 'Dashboard',      icon: BarChart2    },
  { id: 'history',  label: 'Order History',  icon: ClipboardList },
  { id: 'status',   label: 'Check Status',   icon: Search        },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('place')
  const { orders, loading, fetchOrders, placeOrder, cancelOrder, checkStatus } = useOrders()
  const { toasts, add: addToast, remove: removeToast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Refresh orders when switching to dashboard or history
  useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'history') {
      fetchOrders()
    }
  }, [activeTab])

  const handlePlaceOrder = useCallback(async (orderId, amount) => {
    const data = await placeOrder(orderId, amount)
    if (data.status === 'APPROVED') {
      addToast(`Order ${data.orderId} approved! ✅`, 'success')
    } else if (data.status === 'REJECTED') {
      addToast(`Order ${data.orderId} rejected — compensation triggered ❌`, 'error')
    }
    fetchOrders()
    return data
  }, [placeOrder, fetchOrders, addToast])

  const handleCancel = useCallback(async (orderId) => {
    await cancelOrder(orderId)
    addToast(`Order ${orderId} cancelled 🚫`, 'warning')
    fetchOrders()
  }, [cancelOrder, fetchOrders, addToast])

  return (
    <div className="min-h-screen bg-[#0f1117]">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#f97316]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="text-5xl mb-3"
          >
            🍽
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Gourmet<span className="text-[#f97316]">-Go</span>
          </h1>
          <p className="text-slate-500 text-sm mt-2">Distributed Order System · Saga Orchestration Pattern</p>

          {/* Live indicator */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs text-slate-500">System Online</span>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-1 mb-8 bg-[#1e2130] border border-[#2d3148] rounded-2xl p-1.5 max-w-xl mx-auto">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-colors duration-200 cursor-pointer border-none outline-none"
                style={{ color: isActive ? '#fff' : '#64748b' }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-[#f97316] rounded-xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon size={14} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>
              </button>
            )
          })}
        </div>

        {/* Page content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0  }}
            exit={{    opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'place' && (
              <PlaceOrder placeOrder={handlePlaceOrder} onSuccess={fetchOrders} />
            )}
            {activeTab === 'dashboard' && (
              <Dashboard orders={orders} loading={loading} onRefresh={fetchOrders} />
            )}
            {activeTab === 'history' && (
              <OrderHistory
                orders={orders}
                loading={loading}
                onRefresh={fetchOrders}
                cancelOrder={handleCancel}
                onCancelled={fetchOrders}
              />
            )}
            {activeTab === 'status' && (
              <CheckStatus checkStatus={checkStatus} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <p className="text-center text-slate-700 text-xs mt-12">
          Gourmet-Go · gRPC · PostgreSQL · Docker · GitHub Actions
        </p>
      </div>

      <Toast toasts={toasts} remove={removeToast} />
    </div>
  )
}
