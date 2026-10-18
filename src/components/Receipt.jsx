import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { SHOP } from '../utils/constants'
import { rs, fmtDate, itemText } from '../utils/format'

export default function ReceiptHost() {

  const [r, setR] = useState(null)

  useEffect(() => {

    const on = (e) => {
      setR(e.detail)

    }

    window.addEventListener('print-receipt', on)

    return () => {
      window.removeEventListener('print-receipt', on)
    }

  }, [])

  if (!r) return null

  const due = r.total - (r.advance || 0)

  const row = (a, b, bold = false) => (
    <div
      className="rc-row"
      style={bold ? { fontWeight: 700 } : undefined}
    >
      <span>{a}</span>
      <span>{b}</span>
    </div>
  )


  // =====================================================
  // SINGLE RECEIPT
  // =====================================================

  const Receipt = () => {

    return (
      <div className="receipt-copy">

        {/* SHOP NAME */}
        <div className="rc-c rc-big">
          {SHOP.name}
        </div>

        {/* PHONE */}
        {SHOP.phone && (
          <div className="rc-c">
            {SHOP.phone}
          </div>
        )}

        {/* ADDRESS */}
        {SHOP.address && (
          <div className="rc-c">
            {SHOP.address}
          </div>
        )}

        <hr />

        {/* ORDER / BILL */}
        <div>
          {r.kind === 'order' ? 'ORDER' : 'BILL'} #{r.no}
        </div>

        {/* DATE */}
        <div>
          {fmtDate(r.date)}
        </div>

        {/* CUSTOMER */}
        {r.customer && (
          <div>
            Customer: {r.customer}
          </div>
        )}

        {/* ORGANIZATION */}
        {r.org && (
          <div>
            {r.org}
          </div>
        )}

        {/* PHONE */}
        {r.phone && (
          <div>
            Phone: {r.phone}
          </div>
        )}

        {/* ADDRESS */}
        {r.address && (
          <div>
            {r.address}
          </div>
        )}

        {/* DELIVERY */}
        {r.due && (
          <div>
            Delivery: {r.due}
          </div>
        )}

        <hr />

        {/* ITEMS */}
        {r.items.map((i, x) => (

          <div
            key={x}
            className="receipt-item"
          >

            <div>
              {itemText(i)}
            </div>

            {i.measurements && (
              <div className="receipt-measurement">
                {i.measurements}
              </div>
            )}

            {row(
              `${i.qty} x ${Math.round(i.price)}`,
              Math.round(i.qty * i.price)
            )}

          </div>

        ))}

        <hr />

        {/* DISCOUNT */}
        {r.discount > 0 && (
          row(
            'Discount',
            '-' + Math.round(r.discount)
          )
        )}

        {/* TOTAL */}
        {row(
          'TOTAL',
          rs(r.total),
          true
        )}

        {/* ORDER PAYMENT */}
        {r.kind === 'order' && (
          <>
            {row(
              'Advance',
              rs(r.advance)
            )}

            {row(
              'Remaining',
              rs(due),
              true
            )}
          </>
        )}

        {/* PAYMENT */}
        {r.payment && (
          <div>
            Payment: {r.payment}
          </div>
        )}

        {/* NOTE */}
        {r.note && (
          <div>
            Note: {r.note}
          </div>
        )}

        <hr />

        <div className="rc-c">
          Thanks!
        </div>

      </div>
    )
  }


  return createPortal(

    <div className="rcm">

      {/* =================================================
          SCREEN PREVIEW
      ================================================= */}

      <div className="rcb">

        <div className="rca">

          <button
            className="p"
            onClick={() => window.print()}
          >
            Print
          </button>

          <button
            onClick={() => setR(null)}
          >
            Close
          </button>

        </div>


        {/* SCREEN PAR SIRF 1 RECEIPT */}
        {/* <div id="screen-receipt">
          <Receipt />
        </div> */}

      </div>


      {/* =================================================
          PRINT ONLY
      ================================================= */}

      <div id="print-receipts">
        <Receipt />
      </div>
      

    </div>,

    document.body
  )
}