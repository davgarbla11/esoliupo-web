import { Outlet } from 'react-router-dom'
import AnnouncementBanner from '../components/AnnouncementBanner'
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
      <AnnouncementBanner />
    </div>
  )
}

export default PublicLayout
