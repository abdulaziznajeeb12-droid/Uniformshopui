import { useState } from 'react'
import useLoad from '../hooks/useLoad'
import Stat from '../components/Stat'
import { rs, isoDate } from '../utils/format'

const start = new Date(); start.setDate(start.getDate() - 29)

export default function Profit() {
  const [from, setFrom] = useState(isoDate(start))
  const [to, setTo] = useState(isoDate(new Date()))
  const [d] = useLoad(`/reports/profit?from=${from}&to=${to}`, null)

  return (
    <>
      <div className="row">
        <label>Se <input type="date" value={from} onChange={e => setFrom(e.target.value)} /></label>
        <label>Tak <input type="date" value={to} onChange={e => setTo(e.target.value)} /></label>
      </div>
      {!d ? <p>Data loading...</p> : (
        <>
          <div className="grid">
            <Stat label="Bills" value={d.bills} />
            <Stat label="Total Sales" value={rs(d.salesTotal)} />
            <Stat label="Gross Profit" value={rs(d.grossProfit)} />
            <Stat label="Expenses" value={rs(d.expenses)} />
            <Stat label="Net Profit" value={<span className={d.netProfit < 0 ? 'low' : 'good'}>{rs(d.netProfit)}</span>} />
          </div>
          <div className="box" style={{ marginTop: 14 }}>
            <h3>Day-wise Breakdown</h3>
            {d.days.length ? (
              <table>
                <thead><tr><th>Date</th><th>Sale</th><th>Profit</th><th>Expense</th><th>Profit</th></tr></thead>
                <tbody>
                  {d.days.map(x => {
                    const net = x.profit - x.expenses
                    return (
                      <tr key={x.date}>
                        <td>{x.date}</td><td>{rs(x.sales)}</td><td>{rs(x.profit)}</td><td>{rs(x.expenses)}</td>
                        <td className={net < 0 ? 'low' : 'good'}>{rs(net)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : <p>No sales or expenses in this period.</p>}
          </div>
        </>
      )}
    </>
  )
}