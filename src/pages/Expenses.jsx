import { useState } from 'react'
import { api, run } from '../api/client'
import useLoad from '../hooks/useLoad'
import { EXPENSE_TITLES } from '../utils/constants'
import { rs, isoDate } from '../utils/format'

const start = new Date(); start.setDate(start.getDate() - 29)

export default function Expenses() {
  const [from, setFrom] = useState(isoDate(start))
  const [to, setTo] = useState(isoDate(new Date()))
  const [list, load] = useLoad(`/expenses?from=${from}&to=${to}`)
  const [f, setF] = useState({ title: '', amount: '', date: '' })
  const total = list.reduce((a, e) => a + e.amount, 0)

  const save = async () => {
    if (!f.title.trim() || !(+f.amount > 0)) return alert('Detail aur raqam likhein')
    const body = { title: f.title.trim(), amount: +f.amount }
    if (f.date) body.expenseDate = f.date
    if (await run(() => api('/expenses', 'POST', body))) { setF({ title: '', amount: '', date: '' }); load() }
  }
  const del = async e => {
    if (window.confirm('Yeh kharcha delete karein?')) { await run(() => api('/expenses/' + e.id, 'DELETE')); load() }
  }

  return (
    <>
      <div className="box">
        <h3>Enter Expense</h3>
        <div className="row">
          <input list="exp-titles" placeholder="Kis cheez ka (jaise Kiraya)" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} />
          <datalist id="exp-titles">{EXPENSE_TITLES.map(t => <option key={t} value={t} />)}</datalist>
          <input type="number" placeholder="Raqam (Rs)" value={f.amount} onChange={e => setF({ ...f, amount: e.target.value })} />
          <input type="date" title="Tareekh (khali = aaj)" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} />
        </div>
        <button className="p" onClick={save}>Expense save karein</button>
      </div>
      <div className="box">
        <div className="row">
          <label>From <input type="date" value={from} onChange={e => setFrom(e.target.value)} /></label>
          <label>To <input type="date" value={to} onChange={e => setTo(e.target.value)} /></label>
          <div><b>Total Expenses: {rs(total)}</b></div>
        </div>
        {list.length ? (
          <table>
            <thead><tr><th>Date</th><th>Detail</th><th>Amount</th><th></th></tr></thead>
            <tbody>
              {list.map(e => (
                <tr key={e.id}>
                  <td>{isoDate(new Date(e.expenseDate))}</td><td>{e.title}</td><td>{rs(e.amount)}</td>
                  <td><button onClick={() => del(e)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p>Is muddat mein koi kharcha nahi.</p>}
      </div>
    </>
  )
}