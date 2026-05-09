import { useState, useCallback } from 'react'

const API = `http://${window.location.hostname}:8080`

export function useOrders() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch(`${API}/api/orders`)
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const placeOrder = useCallback(async (orderId, amount) => {
    const res  = await fetch(`${API}/api/orders`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ orderId, amount }),
    })
    return res.json()
  }, [])

  const cancelOrder = useCallback(async (orderId) => {
    const res = await fetch(`${API}/api/orders/${encodeURIComponent(orderId)}/cancel`, {
      method: 'POST',
    })
    return res.json()
  }, [])

  const checkStatus = useCallback(async (orderId) => {
    const res  = await fetch(`${API}/api/orders/${encodeURIComponent(orderId)}`)
    return res.json()
  }, [])

  return { orders, loading, error, fetchOrders, placeOrder, cancelOrder, checkStatus }
}
