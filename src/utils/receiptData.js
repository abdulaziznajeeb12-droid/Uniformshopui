// Order ya bill ko receipt ki shakal mein badalta hai
export const fromOrder = o => ({
  kind: 'order', no: o.id, date: o.createdAt, customer: o.customer, org: o.organization,
  phone: o.phone, address: o.address, due: o.dueDate, note: o.note,
  items: o.items, total: o.total, advance: o.advance,
})

export const fromSale = s => ({
  kind: 'bill', no: s.id, date: s.saleDate, customer: s.customer,
  items: s.items, total: s.total, discount: s.discount, payment: s.payment,
})