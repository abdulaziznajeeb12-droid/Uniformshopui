import { useState } from 'react'
import { api, run } from '../api/client'
import useLoad from '../hooks/useLoad'
import Stat from './Stat'
import { PIECE_ITEMS } from '../utils/constants'
import { rs, isoDate } from '../utils/format'

export default function WorkerDetail({ id, month, onChanged, onClose }) {
  const today = isoDate(new Date())
  const [d, load] = useLoad(`/workers/${id}?month=${month}`, null)
  const [rate, setRate] = useState({ item: '', rate: '' })
  const [log, setLog] = useState({ date: today, item: '', qty: '', note: '' })
  const [leave, setLeave] = useState({ date: today, kind: 'Absent' })
  const [pay, setPay] = useState({ amount: '', kind: 'Salary', note: '' })
  if (!d) return <p>Load ho raha hai...</p>

  const { worker: w, summary: s } = d
  const monthly = w.payType === 'Monthly'
  const refresh = () => { load(); onChanged() }
  const post = async (url, body, reset) => { if (await run(() => api(url, 'POST', body))) { reset(); refresh() } }
  const del = async url => { if (window.confirm('Delete karein?')) { await run(() => api(url, 'DELETE')); refresh() } }
  const changeSalary = async () => {
    const v = prompt('Naya mahana tankhwah:', w.monthlySalary)
    if (v && +v > 0) { await run(() => api('/workers/' + id, 'PUT', { ...w, monthlySalary: +v })); refresh() }
  }

  return (
    <div className="box" style={{ borderColor: '#0f5c57' }}>
      <div className="row" style={{ alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>{w.name} <small>({monthly ? 'Mahana' : 'Per piece'})</small></h3>
        <button onClick={onClose}>Close</button>
      </div>
      <div className="grid" style={{ margin: '10px 0' }}>
        <Stat label={monthly ? 'Tankhwah (chutti ke baad)' : `Kamai (${s.pieces} piece)`} value={rs(s.earned)} />
        <Stat label="Ada kiya" value={rs(s.paid)} />
        <Stat label={s.balance < 0 ? 'Peshgi (zyada di)' : 'Dena baqi'} value={<span className={s.balance > 0 ? 'low' : 'good'}>{rs(Math.abs(s.balance))}</span>} />
        {monthly && <Stat label="Chutti" value={s.absentDays + ' din'} />}
      </div>
      {monthly && <p>Mahana tankhwah: <b>{rs(w.monthlySalary)}</b> <button onClick={changeSalary}>Badlein</button></p>}

      <h4>Raqam ada karein</h4>
      <div className="row">
        <input type="number" placeholder="Raqam" value={pay.amount} onChange={e => setPay({ ...pay, amount: e.target.value })} />
        <select value={pay.kind} onChange={e => setPay({ ...pay, kind: e.target.value })}>
          <option value="Salary">Salary </option><option value="Advance"> advance</option>
        </select>
        <input placeholder="Note" value={pay.note} onChange={e => setPay({ ...pay, note: e.target.value })} />
      </div>
      <button className="p" onClick={() => post(`/workers/${id}/payments`, { ...pay, amount: +pay.amount }, () => setPay({ amount: '', kind: 'Salary', note: '' }))}>Ada karein</button>{' '}
      {s.balance > 0 && <button onClick={() => setPay({ ...pay, amount: s.balance })}>Poora baqaya ({rs(s.balance)})</button>}
      {d.payments.length > 0 && (
        <table style={{ marginTop: 8 }}><tbody>{d.payments.map(p => (
          <tr key={p.id}><td>{p.payDate}</td><td>{p.kind === 'Advance' ? 'Peshgi' : 'Tankhwah / ujrat'}</td><td>{rs(p.amount)}</td><td>{p.note}</td>
            <td><button onClick={() => del('/workers/payments/' + p.id)}>X</button></td></tr>
        ))}</tbody></table>
      )}

      {monthly ? (
        <>
          <h4>Mark Absent</h4>
          <div className="row">
            <input type="date" value={leave.date} onChange={e => setLeave({ ...leave, date: e.target.value })} />
            <select value={leave.kind} onChange={e => setLeave({ ...leave, kind: e.target.value })}>
              <option value="Absent">Full Day (absent)</option><option value="Half">Half Day</option>
            </select>
            <button onClick={() => post(`/workers/${id}/leaves`, leave, () => {})}>Mark Absent</button>
          </div>
          {d.leaves.map(l => (
            <div key={l.id}>{l.leaveDate} - {l.kind === 'Half' ? 'Half Day' : 'Full Day'} <button onClick={() => del('/workers/leaves/' + l.id)}>X</button></div>
          ))}
        </>
      ) : (
        <>
          <h4>Rate list (per piece)</h4>
          <div className="row">
            <input list="piece-items" placeholder="Item (jaise Shirt)" value={rate.item} onChange={e => setRate({ ...rate, item: e.target.value })} />
            <datalist id="piece-items">{PIECE_ITEMS.map(x => <option key={x} value={x} />)}</datalist>
            <input type="number" placeholder="Rate per piece" value={rate.rate} onChange={e => setRate({ ...rate, rate: e.target.value })} />
            <button onClick={() => post(`/workers/${id}/rates`, { item: rate.item, rate: +rate.rate }, () => setRate({ item: '', rate: '' }))}>Rate save</button>
          </div>
          {d.rates.map(r => <div key={r.id}>{r.item}: <b>{rs(r.rate)}</b> <button onClick={() => del('/workers/rates/' + r.id)}>X</button></div>)}

          <h4>Aaj ka kaam likhein</h4>
          <div className="row">
            <input type="date" value={log.date} onChange={e => setLog({ ...log, date: e.target.value })} />
            <select value={log.item} onChange={e => setLog({ ...log, item: e.target.value })}>
              <option value="">Select Item </option>{d.rates.map(r => <option key={r.id} value={r.item}>{r.item} ({rs(r.rate)})</option>)}
            </select>
            <input type="number" min="1" placeholder="Select piece" value={log.qty} onChange={e => setLog({ ...log, qty: e.target.value })} />
            <input placeholder="Note (order #)" value={log.note} onChange={e => setLog({ ...log, note: e.target.value })} />
            <button className="p" onClick={() => post(`/workers/${id}/logs`, { ...log, qty: +log.qty }, () => setLog({ ...log, item: '', qty: '', note: '' }))}>Kaam likhein</button>
          </div>
          {d.logs.length > 0 && (
            <table><thead><tr><th>Date</th><th>Item</th><th>Piece</th><th>Rate</th><th>Price</th><th></th></tr></thead>
              <tbody>{d.logs.map(l => (
                <tr key={l.id}><td>{l.workDate}</td><td>{l.item}{l.note && ` (${l.note})`}</td><td>{l.qty}</td><td>{rs(l.rate)}</td><td>{rs(l.amount)}</td>
                  <td><button onClick={() => del('/workers/logs/' + l.id)}>X</button></td></tr>
              ))}</tbody></table>
          )}
        </>
      )}
    </div>
  )
}