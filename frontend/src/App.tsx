import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import ModulePlaceholder from './components/dashboard/ModulePlaceholder'
import { AuthProvider } from './context/AuthContext'
import DashboardLayout from './layouts/DashboardLayout'
import PublicLayout from './layouts/PublicLayout'
import Activities from './pages/Activities'
import Contact from './pages/Contact'
import DashboardHome from './pages/dashboard/DashboardHome'
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
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route
            path="eventos"
            element={
              <ModulePlaceholder
                title="Eventos"
                description="Próximamente: inscríbete y consulta el histórico de eventos de la asociación."
              />
            }
          />
          <Route
            path="formaciones"
            element={
              <ModulePlaceholder
                title="Formaciones"
                description="Próximamente: talleres y formaciones organizadas por ESOLIUPO."
              />
            }
          />
          <Route
            path="perfil"
            element={
              <ModulePlaceholder
                title="Mi perfil"
                description="Próximamente: edita tu foto de perfil, alias y contraseña."
              />
            }
          />
          <Route
            path="comisiones"
            element={
              <ProtectedRoute minRole="JUNTA_DIRECTIVA">
                <ModulePlaceholder
                  title="Comisiones"
                  description="Próximamente: crea y gestiona comisiones de trabajo y grupos."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="socios"
            element={
              <ProtectedRoute minRole="JUNTA_DIRECTIVA">
                <ModulePlaceholder
                  title="Socios"
                  description="Próximamente: aprueba las solicitudes de nuevos socios."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="usuarios"
            element={
              <ProtectedRoute minRole="ADMINISTRADOR">
                <ModulePlaceholder
                  title="Usuarios y roles"
                  description="Próximamente: gestiona usuarios y otorga roles."
                />
              </ProtectedRoute>
            }
          />
        </Route>

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
