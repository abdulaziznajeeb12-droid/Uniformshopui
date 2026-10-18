export default function Navbar({ tabs, active, onChange }) {
  return (
    <nav>
      {tabs.map(t => (
        <button key={t} className={t === active ? 'on' : ''} onClick={() => onChange(t)}>{t}</button>
      ))}
    </nav>
  )
}