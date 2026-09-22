import { motion } from 'framer-motion'

type TeamMemberCardProps = {
  name: string
  role: string
  studies?: string | null
  photo?: string | null
  index: number
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function TeamMemberCard({ name, role, studies, photo, index }: TeamMemberCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-gold-400/50"
    >
      {photo ? (
        <img
          src={photo}
          alt={name}
          className="h-20 w-20 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold-400 text-lg font-semibold text-neutral-900">
          {getInitials(name)}
        </div>
      )}

      <h3 className="mt-5 text-lg font-medium text-white">{name}</h3>
      <p className="mt-1 text-sm font-medium uppercase tracking-wide text-gold-400">
        {role}
      </p>
      {studies && (
        <p className="mt-2 text-sm leading-relaxed text-white/50">{studies}</p>
      )}
    </motion.div>
  )
}

export default TeamMemberCard
