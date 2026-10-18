import { useState } from 'react'
import { api, run } from '../api/client'
import useLoad from '../hooks/useLoad'
import Stat from '../components/Stat'
import { rs, isoDate } from '../utils/format'

const empty = { productId: '', qty: 1, cost: '', paidNow: '', supplier: '' }
const start = new Date(); start.setDate(start.getDate() - 29)

export default function StockIn() {
  const [products, loadP] = useLoad('/products')
  const [from, setFrom] = useState(isoDate(start))
  const [to, setTo] = useState(isoDate(new Date()))
  const [h, loadH] = useLoad(`/stock-in?from=${from}&to=${to}`, null)
  const [f, setF] = useState(empty)
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const suppliers = [...new Set((h?.rows || []).map(r => r.supplier).filter(Boolean))]

  const save = async () => {
    if (!f.productId) return alert('Product chunein')
    const body = { productId: +f.productId, qty: +f.qty, cost: +f.cost || 0, paidNow: +f.paidNow || 0, supplier: f.supplier }
    if (await run(() => api('/stock-in', 'POST', body))) { alert('Stock add ho gaya'); setF(empty); loadP(); loadH() }
  }
  const payDue = async r => {
    const v = prompt(`Kitni raqam ada ki? (baqaya ${Math.round(r.due)})`, Math.round(r.due))
    const n = +v
    if (!v || !(n > 0)) return
    if (await run(() => api(`/stock-in/${r.id}/pay`, 'POST', { amount: n }))) loadH()
  }

  return (
    <>
      <div className="box">
        <h3>New Stock (stock add karein)</h3>
        <div className="row">
          <select value={f.productId} onChange={set('productId')}>
            <option value="">Select Product</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name} (stock {p.qty})</option>)}
          </select>
          <input type="number" min="1" placeholder="Quantity" value={f.qty} onChange={set('qty')} />
          <input type="number" placeholder="New Purchase Price (empty = previous)" value={f.cost} onChange={set('cost')} />
          <input list="sup-names" placeholder="Supplier Name" value={f.supplier} onChange={set('supplier')} />
          <datalist id="sup-names">{suppliers.map(s => <option key={s} value={s} />)}</datalist>
          <input type="number" placeholder="Amount Paid Now (Rs)" value={f.paidNow} onChange={set('paidNow')} />
        </div>
        <button className="p" onClick={save}>Stock add karein</button>
      </div>

      <div className="row" style={{ alignItems: 'center' }}>
        <label>Se <input type="date" value={from} onChange={e => setFrom(e.target.value)} /></label>
        <label>Tak <input type="date" value={to} onChange={e => setTo(e.target.value)} /></label>
      </div>
      {h && (
        <>
          <div className="grid" style={{ marginBottom: 14 }}>
            <Stat label="Kul khareedari" value={rs(h.totalPurchase)} />
            <Stat label="Ada kiya" value={rs(h.totalPaid)} />
            <Stat label="Dena baqi" value={<span className={h.totalDue > 0 ? 'low' : 'good'}>{rs(h.totalDue)}</span>} />
          </div>
          <div className="box">
            <h3>Khareedari ka hisaab</h3>
            {h.rows.length ? (
              <table>
                <thead><tr><th>Date</th><th>Product</th><th>Supplier</th><th>Quantity</th><th>Total </th><th>Paid</th><th>Due</th><th></th></tr></thead>
                <tbody>
                  {h.rows.map(r => (
                    <tr key={r.id}>
                      <td>{isoDate(new Date(r.date))}</td><td>{r.product}</td><td>{r.supplier}</td><td>{r.qty}</td>
                      <td>{rs(r.total)}</td><td>{rs(r.paid)}</td>
                      <td className={r.due > 0.5 ? 'low' : 'good'}>{rs(r.due)}</td>
                      <td>{r.due > 0.5 && <button onClick={() => payDue(r)}>Ada karein</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p>Is muddat mein koi khareedari nahi.</p>}
          </div>
        </>
      )}
    </>
  )
}