import { useState } from 'react'
import { api, run } from '../api/client'
import useLoad from '../hooks/useLoad'
import { PAYMENTS } from '../utils/constants'
import { rs } from '../utils/format'
import { printReceipt } from '../utils/print'
import { fromSale } from '../utils/receiptData'

export default function POS() {
  const [products, load] = useLoad('/products')
  const [cart, setCart] = useState([])
  const [q, setQ] = useState('')
  const [disc, setDisc] = useState('')
  const [pay, setPay] = useState('Cash')
  const [cust, setCust] = useState('')

  const n = i => +i.qty || 0
  const add = p => setCart(c => c.find(i => i.p.id === p.id)
    ? c.map(i => i.p.id === p.id ? { ...i, qty: Math.min(n(i) + 1, p.qty) } : i)
    : [...c, { p, qty: 1 }])
  const change = (id, d) => setCart(c => c.map(i => i.p.id === id ? { ...i, qty: Math.min(n(i) + d, i.p.qty) } : i).filter(i => i.qty !== 0))
  // Qty seedha type karein (jaise 1000). Stock se zyada nahi ja sakti.
  const setQty = (id, v) => setCart(c => c.map(i => i.p.id === id ? { ...i, qty: v === '' ? '' : Math.min(Math.max(+v || 0, 0), i.p.qty) } : i))
  const fixQty = id => setCart(c => c.map(i => i.p.id === id && n(i) < 1 ? { ...i, qty: 1 } : i))

  const sub = cart.reduce((a, i) => a + n(i) * i.p.price, 0)
  const total = sub - Math.min(+disc || 0, sub)
  const list = products.filter(p => !q || (p.name + (p.sku || '')).toLowerCase().includes(q.toLowerCase()))

  const checkout = async () => {
    const body = { customer: cust, payment: pay, discount: +disc || 0, items: cart.map(i => ({ productId: i.p.id, qty: n(i) })) }
    const s = await run(() => api('/sales', 'POST', body))
    if (s) { printReceipt(fromSale(s)); setCart([]); setDisc(''); setCust(''); load() }
  }

  return (
    <div className="row" style={{ alignItems: 'flex-start' }}>
      <div className="box">
        <input placeholder="Search products..." value={q} onChange={e => setQ(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />
        {list.slice(0, 50).map(p => (
          <button key={p.id} disabled={p.qty < 1} onClick={() => add(p)} style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 6 }}>
            <span>{p.name} <small>(stock {p.qty})</small></span><b>{rs(p.price)}</b>
          </button>
        ))}
      </div>
      <div className="box">
        <h3>Bill</h3>
        {cart.map(i => (
          <div key={i.p.id} className="row" style={{ marginBottom: 4, alignItems: 'center' }}>
            <span>{i.p.name} <small>(max {i.p.qty})</small></span>
            <span style={{ whiteSpace: 'nowrap' }}>
              <button onClick={() => change(i.p.id, -1)}>-</button>{' '}
              <input type="number" min="1" max={i.p.qty} value={i.qty} onChange={e => setQty(i.p.id, e.target.value)} onBlur={() => fixQty(i.p.id)}
                onFocus={e => e.target.select()} style={{ width: 80, flex: 'none', textAlign: 'center' }} />{' '}
              <button disabled={n(i) >= i.p.qty} onClick={() => change(i.p.id, 1)}>+</button>
            </span>
            <b>{rs(n(i) * i.p.price)}</b>
          </div>
        ))}
        <div className="row">
          <input type="number" placeholder="Discount" value={disc} onChange={e => setDisc(e.target.value)} />
          <select value={pay} onChange={e => setPay(e.target.value)}>{PAYMENTS.map(x => <option key={x}>{x}</option>)}</select>
        </div>
        <input placeholder="Customer Name" value={cust} onChange={e => setCust(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />
        <h3>Total {rs(total)}</h3>
        <button className="p" disabled={!cart.length || cart.some(i => n(i) < 1)} onClick={checkout}>Bill banayein</button>
      </div>
    </div>
  )
}