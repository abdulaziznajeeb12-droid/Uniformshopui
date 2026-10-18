import { useState } from 'react'
import Navbar from './components/Navbar'
import ReceiptHost from './components/Receipt'
import Dashboard from './pages/Dashboard'
import POS from './pages/POS'
import Orders from './pages/Orders'
import Products from './pages/Products'
import StockIn from './pages/StockIn'
import Sales from './pages/Sales'
import Expenses from './pages/Expenses'
import Profit from './pages/Profit'
import Workers from './pages/Workers'
// Naya page add karna ho to yahan ek line barha dein
const PAGES = { Dashboard, 'Naya Bill': POS, Orders, Products, 'Stock In': StockIn, Sales, Workers, Kharche: Expenses, Munafa: Profit }
export default function App() {
  const [tab, setTab] = useState('Dashboard')
  const Page = PAGES[tab]
  return (
    <>
      <header>Dukaan Stock</header>
      <Navbar tabs={Object.keys(PAGES)} active={tab} onChange={setTab} />
      <main><Page key={tab} /></main>
      <ReceiptHost />
    </>
  )
}