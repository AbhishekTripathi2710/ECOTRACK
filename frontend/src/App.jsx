import { BrowserRouter as Router } from 'react-router-dom'
import { UserProvider } from './context/UserContext'
import { CarbonFootprintProvider } from './context/carbonFootprintContext'
import AppRoutes from './routes/AppRoutes'
import SustainabilityAssistant from './components/SustainabilityAssistant'

function App() {
  return (
    <Router>
      <UserProvider>
        <CarbonFootprintProvider>
          <AppRoutes />
          <SustainabilityAssistant />
        </CarbonFootprintProvider>
      </UserProvider>
    </Router>
  )
}

export default App
