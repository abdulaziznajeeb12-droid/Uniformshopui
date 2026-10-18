export const rs = n => 'Rs ' + Math.round(n || 0).toLocaleString('en-PK')
export const fmtDate = d => new Date(d).toLocaleString('en-PK')
// yyyy-mm-dd (apne local time ke hisaab se)
export const isoDate = d =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// Line ka naam: Shirt (Boy) | Student: Ali | School: ABC
export const itemText = i =>
  [i.name + (i.gender ? ` (${i.gender})` : ''), i.studentName && `Student: ${i.studentName}`, i.schoolName && `School: ${i.schoolName}`]
    .filter(Boolean).join(' | ')