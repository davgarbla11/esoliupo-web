import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

type FeatureCardProps = {
  icon: LucideIcon
  title: string
  description: string
  index: number
}

function FeatureCard({ icon: Icon, title, description, index }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-gold-400/50 hover:bg-white/10"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-gold-400 transition-colors group-hover:bg-gold-400 group-hover:text-neutral-900">
        <Icon size={20} />
      </div>
      <h3 className="mt-4 text-lg font-medium text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/60">{description}</p>
    </motion.div>
  )
}

export default FeatureCard
