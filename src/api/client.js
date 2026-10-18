// .NET API se baat karne ki ek hi jagah. package.json ka "proxy" '/api' ko API par bhejta hai.
export async function api(url, method = 'GET', body) {
  const r = await fetch('http://localhost:5119/api' + url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!r.ok) throw new Error((await r.text()) || r.statusText)
  return r.status === 204 ? null : r.json()
}

// Error aaye to alert dikhata hai
export async function run(fn) {
  try { return await fn() } catch (e) { alert(e.message) }
}