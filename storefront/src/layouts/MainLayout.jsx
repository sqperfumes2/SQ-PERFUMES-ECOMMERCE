import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AnnouncementBar from '../components/layout/AnnouncementBar'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ScrollToTop from '../components/layout/ScrollToTop'
import FloatingWhatsApp from '../components/layout/FloatingWhatsApp'

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-ink text-ivory">
      <ScrollToTop />
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <Toaster
        position="top-center"
        containerStyle={{
          top: 'max(0.75rem, env(safe-area-inset-top))',
        }}
        toastOptions={{
          className: 'text-sm',
          style: {
            background: '#161616',
            color: '#F5F0E6',
            border: '1px solid rgba(201,162,39,0.35)',
            maxWidth: '92vw',
          },
        }}
      />
    </div>
  )
}
