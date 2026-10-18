import { useState } from 'react'
import useLoad from '../hooks/useLoad'
import Stat from '../components/Stat'
import { rs, fmtDate, isoDate } from '../utils/format'

const firstOfMonth = () => { const d = new Date(); d.setDate(1); return isoDate(d) }

export default function Sales() {
  const [from, setFrom] = useState(firstOfMonth())
  const [to, setTo] = useState(isoDate(new Date()))
  const [sales] = useLoad(`/sales?from=${from}&to=${to}`)
  const [sum] = useLoad(`/reports/profit?from=${from}&to=${to}`, null)
  const today = isoDate(new Date())
  const preset = (a, b) => { setFrom(a); setTo(b) }

  return (
    <>
      <div className="row" style={{ alignItems: 'center' }}>
        <label>Se <input type="date" value={from} onChange={e => setFrom(e.target.value)} /></label>
        <label>Tak <input type="date" value={to} onChange={e => setTo(e.target.value)} /></label>
        <button onClick={() => preset(today, today)}>Aaj</button>
        <button onClick={() => preset(firstOfMonth(), today)}>Is mahine</button>
        <button onClick={() => preset('2000-01-01', today)}>Sab (ab tak)</button>
      </div>
      {sum && (
        <div className="grid" style={{ marginBottom: 14 }}>
          <Stat label="Bills" value={sum.bills} />
          <Stat label="Kul sale" value={rs(sum.salesTotal)} />
          <Stat label="Munafa (kharche se pehle)" value={rs(sum.grossProfit)} />
          <Stat label="Kharche" value={rs(sum.expenses)} />
          <Stat label="Khalis munafa" value={<span className={sum.netProfit < 0 ? 'low' : 'good'}>{rs(sum.netProfit)}</span>} />
        </div>
      )}
      <div className="box">
        {sales.length ? (
          <table>
            <thead><tr><th>#</th><th>Tareekh</th><th>Customer</th><th>Payment</th><th>Items</th><th>Total</th><th>Munafa</th></tr></thead>
            <tbody>
              {sales.map(s => (
                <tr key={s.id} style={s.isVoid ? { opacity: .5, textDecoration: 'line-through' } : null}>
                  <td>{s.id}</td><td>{fmtDate(s.saleDate)}</td><td>{s.customer}</td><td>{s.payment}</td>
                  <td>{s.items.map(i => `${i.name} x${i.qty}`).join(', ')}</td><td>{rs(s.total)}</td><td>{rs(s.profit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p>Is muddat mein koi sale nahi.</p>}
      </div>
    </>
  )
}