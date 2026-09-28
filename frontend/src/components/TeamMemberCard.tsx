import { motion } from 'framer-motion'
import { GithubIcon, LinkedinIcon } from './SocialIcons'

type TeamMemberCardProps = {
  name: string
  role: string
  studies?: string | null
  photo?: string | null
  linkedinUrl?: string | null
  githubUrl?: string | null
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

function TeamMemberCard({
  name,
  role,
  studies,
  photo,
  linkedinUrl,
  githubUrl,
  index,
}: TeamMemberCardProps) {
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

      {(linkedinUrl || githubUrl) && (
        <div className="mt-4 flex items-center gap-3">
          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`LinkedIn de ${name}`}
              className="text-white/40 transition-colors hover:text-gold-400"
            >
              <LinkedinIcon size={18} />
            </a>
          )}
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`GitHub de ${name}`}
              className="text-white/40 transition-colors hover:text-gold-400"
            >
              <GithubIcon size={18} />
            </a>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default TeamMemberCard
