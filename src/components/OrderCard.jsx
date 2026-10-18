import { STAGES } from '../utils/constants'
import { rs, fmtDate, itemText } from '../utils/format'
import { printReceipt } from '../utils/print'
import { fromOrder } from '../utils/receiptData'

export default function OrderCard({ order: o, onNext, onCancel }) {
  const stages = STAGES[o.orderType]
  const i = stages.indexOf(o.status)
  return (
    <div className="box">
      <b>#{o.id} {o.customer}{o.organization && ' | ' + o.organization}</b>
      <span style={{ float: 'right' }}>{o.status}</span>
      {o.status !== 'Cancelled' && (
        <div className="bar">{stages.map((s, x) => <i key={s} title={s} className={x <= i ? 'on' : ''} />)}</div>
      )}
      <div>
        {o.items.map(t => (
          <div key={t.id}>
            • {itemText(t)} x{t.qty}
            {t.measurements && <div style={{ fontSize: 12, color: '#62736f', marginLeft: 12 }}>{t.measurements}</div>}
          </div>
        ))}
        Total {rs(o.total)} | Advance {rs(o.advance)} | Baqaya <b>{rs(o.total - o.advance)}</b>
        {o.courier && <><br />Courier: {o.courier} {o.tracking && '| Tracking: ' + o.tracking}</>}
      </div>
      <small>{o.history.map(h => `${h.status} (${fmtDate(h.changedAt)})`).join(' > ')}</small>
      <div style={{ marginTop: 8 }}>
        {i >= 0 && i < stages.length - 1 && <><button className="p" onClick={onNext}>{stages[i + 1]} mark karein</button>{' '}</>}
        {i >= 0 && i < stages.length - 1 && <><button onClick={onCancel}>Cancel</button>{' '}</>}
        <button onClick={() => printReceipt(fromOrder(o))}>Receipt print</button>
      </div>
    </div>
  )
}