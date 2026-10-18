import { useState } from 'react'
import { api, run } from '../api/client'
import useLoad from '../hooks/useLoad'
import { UNIFORM_ITEMS, MEASURES, GENDERS } from '../utils/constants'
import { rs, itemText } from '../utils/format'
import { printReceipt } from '../utils/print'
import { fromOrder } from '../utils/receiptData'

const empty = { orderType: 'Normal', customer: '', organization: '', phone: '', address: '', dueDate: '', advance: '', note: '', items: [] }
const emptyLn = { productId: '', item: 'Shirt', gender: '', other: '', m: {}, qty: 1, price: '', cost: '', school: '', student: '' }

export default function OrderForm({ onSaved }) {
  const [products] = useLoad('/products')
  const [f, setF] = useState(empty)
  const [ln, setLn] = useState(emptyLn)
  const uniform = f.orderType === 'Uniform'
  const kind = UNIFORM_ITEMS[ln.item]            // 'upper', 'lower' ya null
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const setL = k => e => setLn({ ...ln, [k]: e.target.value })
  const setM = (k, v) => setLn({ ...ln, m: { ...ln.m, [k]: v } })

  const addLine = () => {
    const qty = +ln.qty
    if (qty < 1) return
    // School aur student optional hain. School khali ho to upar wala School / Company le leta hai.
    const extra = { schoolName: (ln.school || f.organization).trim() || null, studentName: ln.student.trim() || null }
    if (uniform) {
      if (!(+ln.price > 0)) return alert('Rate likhein')
      const meas = kind
        ? MEASURES[kind].filter(([k]) => ln.m[k]).map(([k, l]) => `${l} ${ln.m[k]}`).join(', ')
        : ln.other.trim()
      const line = { name: ln.item, qty, price: +ln.price, cost: +ln.cost || 0, gender: ln.gender || null, measurements: meas || null, ...extra }
      setF({ ...f, items: [...f.items, line] })
      setLn({ ...ln, m: {}, other: '', student: '', qty: 1 })   // item, gender, rate, school wahi rehte hain
    } else {
      const p = products.find(x => x.id === +ln.productId)
      if (!p) return
      setF({ ...f, items: [...f.items, { productId: p.id, name: p.name, qty, price: p.price, ...extra }] })
      setLn({ ...ln, student: '', qty: 1 })
    }
  }

  const save = async () => {
    const o = await run(() => api('/orders', 'POST', { ...f, dueDate: f.dueDate || null, advance: +f.advance || 0 }))
    if (o) {
      printReceipt(fromOrder(o))   // pehle receipt dikhegi, print aap ke dabane par hoga
      setF({ ...empty, orderType: f.orderType })
      setLn(emptyLn)
      onSaved()
    }
  }

  return (
    <div className="box">
      <h3>Naya order</h3>
      <div className="row">
        <select value={f.orderType} onChange={e => { setF({ ...empty, orderType: e.target.value }); setLn(emptyLn) }}>
          <option value="Normal">Normal (products)</option>
          <option value="Uniform">Uniform (naap ke mutabiq)</option>
        </select>
        <input placeholder="Customer ka naam" value={f.customer} onChange={set('customer')} />
        {uniform && <input placeholder="School / Company (optional)" value={f.organization} onChange={set('organization')} />}
        <input placeholder="Phone" value={f.phone} onChange={set('phone')} />
        <input placeholder="Address" value={f.address} onChange={set('address')} />
        <input type="date" title="Delivery date" value={f.dueDate} onChange={set('dueDate')} />
        <input type="number" placeholder="Advance" value={f.advance} onChange={set('advance')} />
        <input placeholder="Note / colour / kapra" value={f.note} onChange={set('note')} />
      </div>

      <h4 style={{ margin: '12px 0 6px' }}> add Line</h4>
      <div className="row">
        {uniform ? (
          <>
            <select value={ln.item} onChange={e => setLn({ ...ln, item: e.target.value, m: {}, other: '' })}>
              {Object.keys(UNIFORM_ITEMS).map(x => <option key={x}>{x}</option>)}
            </select>
            <select value={ln.gender} onChange={setL('gender')}>
              <option value="">Gender (optional)</option>
              {GENDERS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </>
        ) : (
          <select value={ln.productId} onChange={setL('productId')}>
            <option value="">Product chunein</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name} - {rs(p.price)}</option>)}
          </select>
        )}
        <input placeholder="School ka naam (optional)" value={ln.school} onChange={setL('school')} />
        <input placeholder="Student ka naam (optional)" value={ln.student} onChange={setL('student')} />
      </div>

      {uniform && (
        <div className="row">
          {kind
            ? MEASURES[kind].map(([k, l]) => (
                <input key={k} type="number" step="0.25" min="0" placeholder={`${l} (inch)`} title={l}
                  value={ln.m[k] || ''} onChange={e => setM(k, e.target.value)} />
              ))
            : <input placeholder="Size / naap likhein" value={ln.other} onChange={setL('other')} />}
        </div>
      )}

      <div className="row">
        {uniform && <>
          <input type="number" placeholder="Rate" value={ln.price} onChange={setL('price')} />
          <input type="number" placeholder="Lagat (optional)" value={ln.cost} onChange={setL('cost')} />
        </>}
        <input type="number" min="1" placeholder="Miqdar" value={ln.qty} onChange={setL('qty')} />
        <button onClick={addLine}>Line add</button>
      </div>

      {f.items.map((i, x) => (
        <div key={x} style={{ marginBottom: 6 }}>
          {itemText(i)} x{i.qty} = {rs(i.qty * (i.price ?? products.find(p => p.id === i.productId)?.price ?? 0))}{' '}
          <button onClick={() => setF({ ...f, items: f.items.filter((_, j) => j !== x) })}>X</button>
          {i.measurements && <div style={{ fontSize: 12, color: '#62736f', marginLeft: 12 }}>{i.measurements}</div>}
        </div>
      ))}
      <button className="p" onClick={save} style={{ marginTop: 8 }}>Order save karein</button>
    </div>
  )
}