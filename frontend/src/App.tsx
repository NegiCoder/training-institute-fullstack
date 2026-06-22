/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

import { BrowserRouter } from 'react-router-dom'
import { ColdStartToast } from '@/components/ColdStartToast'
import { DesktopHintToast } from '@/components/DesktopHintToast'
import { AppRoutes } from '@/routes/AppRoutes'
import './styles/dashboard.css'
import './styles/home.css'
import './styles/components.css'
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
