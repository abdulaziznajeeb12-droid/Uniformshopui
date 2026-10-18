import useLoad from '../hooks/useLoad'
import Stat from '../components/Stat'
import { rs } from '../utils/format'

export default function Dashboard() {
  const [d] = useLoad('/dashboard', null)
  if (!d) return <p>Load ho raha hai...</p>
  return (
    <>
      <h4>Today</h4>
      <div className="grid">
        <Stat label="Today sale" value={rs(d.todaySale)} />
        <Stat label="Today profit" value={rs(d.todayProfit)} />
        <Stat label="Today expenses" value={rs(d.todayExpenses)} />
        <Stat label="Pending orders" value={d.pendingOrders} />
      </div>
      <h4>Is mahine</h4>
      <div className="grid">
        <Stat label="Total sale" value={rs(d.monthSale)} />
        <Stat label="Profit (kharche se pehle)" value={rs(d.monthProfit)} />
        <Stat label="Expenses" value={rs(d.monthExpenses)} />
        <Stat label="Net Profit" value={<span className={d.monthNet < 0 ? 'low' : 'good'}>{rs(d.monthNet)}</span>} />
        <Stat label="Supplier ko dena baqi" value={rs(d.supplierDue)} />
      </div>
      <div className="box" style={{ marginTop: 14 }}>
        <h3>Low Stock</h3>
        {d.lowStock.length ? (
          <table><tbody>{d.lowStock.map(p => <tr key={p.id}><td>{p.name}</td><td className="low">{p.qty} bacha</td></tr>)}</tbody></table>
        ) : <p>Sab stock theek hai.</p>}
      </div>
    </>
  )
}