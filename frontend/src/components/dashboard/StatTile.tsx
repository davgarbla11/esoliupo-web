import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

type StatTileProps = {
  icon: LucideIcon
  label: string
  value: string
  index: number
}

function StatTile({ icon: Icon, label, value, index }: StatTileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="rounded-2xl border border-white/10 bg-white/5 p-6"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-gold-400">
          <Icon size={18} />
        </div>
        <p className="text-sm text-white/60">{label}</p>
      </div>
      <p className="mt-4 font-sans text-3xl font-semibold text-white">{value}</p>
    </motion.div>
  )
}

export default StatTile
