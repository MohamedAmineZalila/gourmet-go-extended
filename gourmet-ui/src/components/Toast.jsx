import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

const icons = {
  success:  <CheckCircle  size={18} className="text-emerald-400" />,
  error:    <XCircle      size={18} className="text-red-400" />,
  warning:  <AlertCircle  size={18} className="text-yellow-400" />,
}

const borders = {
  success: 'border-emerald-500/30',
  error:   'border-red-500/30',
  warning: 'border-yellow-500/30',
}

export function Toast({ toasts, remove }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0,  scale: 1   }}
            exit={{    opacity: 0, x: 60, scale: 0.9  }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`card flex items-start gap-3 shadow-2xl border ${borders[t.type] || 'border-surface-border'}`}
          >
            <span className="mt-0.5 shrink-0">{icons[t.type]}</span>
            <p className="text-sm text-slate-200 flex-1">{t.message}</p>
            <button onClick={() => remove(t.id)} className="text-slate-500 hover:text-slate-300 transition-colors shrink-0">
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = useState([])
  const add = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }
  const remove = id => setToasts(prev => prev.filter(t => t.id !== id))
  return { toasts, add, remove }
}

import { useState } from 'react'
