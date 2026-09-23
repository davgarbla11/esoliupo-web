import { Route, Routes } from 'react-router-dom'
import ForcePasswordChangeGate from './components/ForcePasswordChangeGate'
import MaintenanceGate from './components/MaintenanceGate'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { MaintenanceProvider } from './context/MaintenanceContext'
import DashboardLayout from './layouts/DashboardLayout'
import PublicLayout from './layouts/PublicLayout'
import Activities from './pages/Activities'
import Contact from './pages/Contact'
import ContactMessages from './pages/dashboard/ContactMessages'
import DashboardHome from './pages/dashboard/DashboardHome'
import EventEditor from './pages/dashboard/EventEditor'
import EventsManagement from './pages/dashboard/EventsManagement'
import FormacionesManagement from './pages/dashboard/FormacionesManagement'
import MembershipRequests from './pages/dashboard/MembershipRequests'
import MyProfile from './pages/dashboard/MyProfile'
import SuperadminPanel from './pages/dashboard/SuperadminPanel'
import UsersManagement from './pages/dashboard/UsersManagement'
import Home from './pages/Home'
import JoinRequest from './pages/JoinRequest'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import WhoWeAre from './pages/WhoWeAre'

function App() {
  return (
    <AuthProvider>
      <MaintenanceProvider>
        <ForcePasswordChangeGate>
          <Routes>
            <Route path="login" element={<Login />} />

            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="eventos" element={<EventsManagement />} />
              <Route
                path="eventos/nuevo"
                element={
                  <ProtectedRoute minRole="JUNTA_DIRECTIVA">
                    <EventEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="eventos/:id"
                element={
                  <ProtectedRoute minRole="JUNTA_DIRECTIVA">
                    <EventEditor />
                  </ProtectedRoute>
                }
              />
              <Route path="formaciones" element={<FormacionesManagement />} />
              <Route path="perfil" element={<MyProfile />} />
              <Route
                path="socios"
                element={
                  <ProtectedRoute minRole="JUNTA_DIRECTIVA">
                    <MembershipRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="mensajes"
                element={
                  <ProtectedRoute minRole="JUNTA_DIRECTIVA">
                    <ContactMessages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="usuarios"
                element={
                  <ProtectedRoute minRole="ADMINISTRADOR">
                    <UsersManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="superadmin"
                element={
                  <ProtectedRoute minRole="ADMINISTRADOR">
                    <SuperadminPanel />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route
              element={
                <MaintenanceGate>
                  <PublicLayout />
                </MaintenanceGate>
              }
            >
              <Route index element={<Home />} />
              <Route path="quienes-somos" element={<WhoWeAre />} />
              <Route path="actividades" element={<Activities />} />
              <Route path="contacto" element={<Contact />} />
              <Route path="unete" element={<JoinRequest />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </ForcePasswordChangeGate>
      </MaintenanceProvider>
    </AuthProvider>
  )
}

export default App
