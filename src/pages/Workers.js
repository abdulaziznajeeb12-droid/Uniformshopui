import { useState } from 'react'
import { api, run } from '../api/client'
import useLoad from '../hooks/useLoad'
import Stat from '../components/Stat'
import WorkerDetail from '../components/WorkerDetail'
import { rs, isoDate } from '../utils/format'

const empty = { name: '', phone: '', payType: 'Monthly', monthlySalary: '' }

export default function Workers() {
  const [month, setMonth] = useState(isoDate(new Date()).slice(0, 7))
  const [list, load] = useLoad(`/workers?month=${month}`)
  const [f, setF] = useState(empty)
  const [open, setOpen] = useState(null)
  const sum = k => list.reduce((a, w) => a + w[k], 0)

  const save = async () => {
    if (!f.name.trim()) return alert('Enter Name')
    if (f.payType === 'Monthly' && !(+f.monthlySalary > 0)) return alert('Enter Monthly Salary')
    if (await run(() => api('/workers', 'POST', { ...f, monthlySalary: +f.monthlySalary || 0 }))) { setF(empty); load() }
  }
  const remove = async w => {
    if (window.confirm(`${w.name} ko list se hatayein? Purana hisaab bacha rahega.`)) {
      await run(() => api('/workers/' + w.id, 'DELETE')); if (open === w.id) setOpen(null); load()
    }
  }

  return (
    <>
      <div className="box">
        <h3>New worker</h3>
        <div className="row">
          <input placeholder="Name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
          <input placeholder="Phone" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} />
          <select value={f.payType} onChange={e => setF({ ...f, payType: e.target.value })}>
            <option value="Monthly">Monthly Salary</option><option value="PerPiece">Per piece (sewing)</option>
          </select>
          {f.payType === 'Monthly' && <input type="number" placeholder="Monthly Salary" value={f.monthlySalary} onChange={e => setF({ ...f, monthlySalary: e.target.value })} />}
        </div>
        <button className="p" onClick={save}>Add Worker</button>
      </div>

      <div className="row" style={{ alignItems: 'center' }}>
        <label>Month <input type="month" value={month} onChange={e => { setMonth(e.target.value); setOpen(null) }} /></label>
      </div>
      <div className="grid" style={{ marginBottom: 14 }}>
        <Stat label="Workers" value={list.length} />
        <Stat label="This month's Total earnings" value={rs(sum('earned'))} />
        <Stat label="Amount paid" value={rs(sum('paid'))} />
        <Stat label="Remaining" value={rs(sum('balance'))} />
      </div>

      <div className="box">
        {list.length ? (
          <table>
            <thead><tr><th>Name</th><th>Payment Type</th><th>Earnings</th><th>Amount Paid</th><th>Remaining</th><th></th></tr></thead>
            <tbody>
              {list.map(w => (
                <tr key={w.id}>
                  <td>{w.name}</td>
                  <td>{w.payType === 'Monthly' ? `Monthly (${rs(w.monthlySalary)})` : `Per piece (${w.pieces} piece)`}</td>
                  <td>{rs(w.earned)}</td><td>{rs(w.paid)}</td>
                  <td className={w.balance > 0 ? 'low' : 'good'}>{rs(w.balance)}</td>
                  <td><button className="p" onClick={() => setOpen(w.id)}>Hisaab</button> <button onClick={() => remove(w)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p>Abhi koi worker nahi. Upar se add karein.</p>}
      </div>

      {open && <WorkerDetail key={open + month} id={open} month={month} onChanged={load} onClose={() => setOpen(null)} />}
    </>
  )
}