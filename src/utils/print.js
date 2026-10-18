// Kahin se bhi receipt print karne ke liye: printReceipt(data)
export const printReceipt = data =>
  window.dispatchEvent(new CustomEvent('print-receipt', { detail: data }))