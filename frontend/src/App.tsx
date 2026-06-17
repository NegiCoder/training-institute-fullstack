import { BrowserRouter } from 'react-router-dom'
import { ColdStartToast } from '@/components/ColdStartToast'
import { DesktopHintToast } from '@/components/DesktopHintToast'
import { AppRoutes } from '@/routes/AppRoutes'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <ColdStartToast />
      <DesktopHintToast />
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
