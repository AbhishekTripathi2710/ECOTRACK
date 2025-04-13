import { BrowserRouter as Router } from 'react-router-dom'
import { UserProvider } from './context/UserContext'
import { CarbonFootprintProvider } from './context/carbonFootprintContext'
import { ChallengeProvider } from './context/ChallengeContext'
import AppRoutes from './routes/AppRoutes'
import SustainabilityAssistant from './components/SustainabilityAssistant'
import { NotificationProvider } from './context/NotificationContext'

function App() {
  return (
    <NotificationProvider>
      <Router>
        <UserProvider>
          <CarbonFootprintProvider>
            <ChallengeProvider>
              <AppRoutes />
              <SustainabilityAssistant />
            </ChallengeProvider>
          </CarbonFootprintProvider>
        </UserProvider>
      </Router>
    </NotificationProvider>
  )
}

export default App
