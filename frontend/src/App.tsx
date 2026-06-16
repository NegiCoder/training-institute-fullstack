import { BrowserRouter } from 'react-router-dom'
import { ColdStartToast } from '@/components/ColdStartToast'
import { AppRoutes } from '@/routes/AppRoutes'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <ColdStartToast />
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
