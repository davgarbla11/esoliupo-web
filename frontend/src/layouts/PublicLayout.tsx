import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import HeroBackground from '../components/HeroBackground'

function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <HeroBackground />
      <Navbar />
      <main className="relative z-10 flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default PublicLayout
