import { useState } from 'react'
import { api, run } from '../api/client'
import useLoad from '../hooks/useLoad'
import { rs } from '../utils/format'

const empty = { name: '', sku: '', category: '', cost: '', price: '', qty: '', minQty: '' }
const FIELDS = [['name', 'Name'], ['sku', 'SKU / Barcode'], ['category', 'Category'], ['cost', 'Purchase Price'], ['price', 'Selling Price'], ['qty', 'Stock'], ['minQty', 'Minimum Stock Alert']]

export default function Products() {
  const [products, load] = useLoad('/products')
  const [f, setF] = useState(empty)
  const [q, setQ] = useState('')
  const list = products.filter(p => !q || `${p.name} ${p.sku || ''} ${p.category || ''}`.toLowerCase().includes(q.toLowerCase()))

  const save = async () => {
    if (!f.name.trim()) return alert('Enter product name')
    const body = { ...f, sku: f.sku || null, cost: +f.cost || 0, price: +f.price || 0, qty: +f.qty || 0, minQty: +f.minQty || 0 }
    const ok = await run(() => f.id ? api('/products/' + f.id, 'PUT', body) : api('/products', 'POST', body))
    if (ok) { setF(empty); load() }
  }
  const del = async p => {
    if (window.confirm('Delete ?')) { await run(() => api('/products/' + p.id, 'DELETE')); load() }
  }

  return (
    <>
      <div className="box">
        <h3>{f.id ? 'Product edit' : 'New product'}</h3>
        <div className="row">
          {FIELDS.map(([k, l]) => <input key={k} placeholder={l} title={l} value={f[k] ?? ''} onChange={e => setF({ ...f, [k]: e.target.value })} />)}
        </div>
        <button className="p" onClick={save}>Save</button> {f.id && <button onClick={() => setF(empty)}>Cancel</button>}
      </div>
      <div className="box">
        <input placeholder="Search products..." value={q} onChange={e => setQ(e.target.value)} style={{ width: '100%', marginBottom: 10 }} />
        <p style={{ margin: '0 0 8px' }}>{list.length} products</p>
        <table>
          <thead><tr><th>Name</th><th>SKU</th><th>Category</th><th>Cost</th><th>Price</th><th>Stock</th><th></th></tr></thead>
          <tbody>
            {list.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td><td>{p.sku}</td><td>{p.category}</td><td>{rs(p.cost)}</td><td>{rs(p.price)}</td>
                <td className={p.qty <= p.minQty ? 'low' : ''}>{p.qty}</td>
                <td><button onClick={() => setF(p)}>Edit</button> <button onClick={() => del(p)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}