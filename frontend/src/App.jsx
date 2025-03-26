import { useState } from 'react'
import { UserProvider } from './context/userContext'
import { CarbonFootprintProvider } from './context/carbonFootprintContext'
import AppRoutes from './routes/AppRoutes'


function App() {
  return (
    <UserProvider>
      <CarbonFootprintProvider>
        <AppRoutes></AppRoutes>
      </CarbonFootprintProvider>
    </UserProvider>
  )
}

export default App
