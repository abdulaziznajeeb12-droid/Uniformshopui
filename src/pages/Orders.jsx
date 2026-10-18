import { api, run } from '../api/client'
import useLoad from '../hooks/useLoad'
import OrderForm from '../components/OrderForm'
import OrderCard from '../components/OrderCard'
import { STAGES } from '../utils/constants'
import { rs } from '../utils/format'

export default function Orders() {
  const [orders, load] = useLoad('/orders')

  const next = async o => {
    const stages = STAGES[o.orderType]
    const nx = stages[stages.indexOf(o.status) + 1]
    let q = ''
    if (nx === 'Rawana') {
      const courier = prompt('Courier / rider ka name:')
      if (courier === null) return
      const tracking = prompt('Tracking number (optional):') || ''
      q = `?courier=${encodeURIComponent(courier)}&tracking=${encodeURIComponent(tracking)}`
    } else if (nx === 'Delivered' && o.total > o.advance) {
      q = `?paid=${window.confirm('Remaining ' + rs(o.total - o.advance) + ' wasool hua? OK = haan, Cancel = udhaar')}`
    }
    await run(() => api(`/orders/${o.id}/advance${q}`, 'POST')); load()
  }
  const cancel = async o => {
    if (window.confirm('Order cancel ?')) { await run(() => api(`/orders/${o.id}/cancel`, 'POST')); load() }
  }

  return (
    <>
      <OrderForm onSaved={load} />
      {orders.map(o => <OrderCard key={o.id} order={o} onNext={() => next(o)} onCancel={() => cancel(o)} />)}
    </>
  )
}