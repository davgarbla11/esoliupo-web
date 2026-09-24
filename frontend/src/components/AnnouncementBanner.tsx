import { AnimatePresence, motion } from 'framer-motion'
import { Megaphone, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../lib/api'

const DISMISSED_KEY = 'esoliupo:dismissed-announcements'

type Announcement = {
  id: string
  title: string
  message: string
}

function getDismissedIds(): string[] {
  try {
    const raw = sessionStorage.getItem(DISMISSED_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function addDismissedId(id: string) {
  try {
    sessionStorage.setItem(DISMISSED_KEY, JSON.stringify([...getDismissedIds(), id]))
  } catch {}
}

function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  useEffect(() => {
    let active = true
    api
      .get<{ announcements: Announcement[] }>('/announcements/active')
      .then((res) => {
        if (!active) return
        const dismissed = getDismissedIds()
        setAnnouncements(res.data.announcements.filter((item) => !dismissed.includes(item.id)))
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  function handleDismiss(id: string) {
    addDismissedId(id)
    setAnnouncements((prev) => prev.filter((item) => item.id !== id))
  }

  if (announcements.length === 0) return null

  return (
    <div className="fixed inset-x-4 bottom-4 z-40 flex flex-col gap-3 sm:inset-x-auto sm:right-4 sm:w-full sm:max-w-sm">
      <AnimatePresence>
        {announcements.map((announcement) => (
          <motion.div
            key={announcement.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="relative rounded-2xl border border-gold-400/20 bg-black/90 p-4 pr-9 shadow-lg shadow-black/40 backdrop-blur-md"
          >
            <button
              type="button"
              onClick={() => handleDismiss(announcement.id)}
              className="absolute right-3 top-3 text-white/40 hover:text-white"
              aria-label="Cerrar aviso"
            >
              <X size={16} />
            </button>
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-400/15 text-gold-400">
                <Megaphone size={14} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{announcement.title}</p>
                <p className="mt-1 text-sm text-white/70">{announcement.message}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default AnnouncementBanner
