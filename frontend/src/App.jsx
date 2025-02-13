import { useState } from 'react'
import { UserProvider } from './context/userContext'
import AppRoutes from './routes/AppRoutes'


function App() {
  return (
    <UserProvider>
      <AppRoutes></AppRoutes>
    </UserProvider>
  )
}

export default App
