import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import PublicLayout from './layouts/PublicLayout'
import Activities from './pages/Activities'
import Contact from './pages/Contact'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import WhoWeAre from './pages/WhoWeAre'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="quienes-somos" element={<WhoWeAre />} />
          <Route path="actividades" element={<Activities />} />
          <Route path="contacto" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
