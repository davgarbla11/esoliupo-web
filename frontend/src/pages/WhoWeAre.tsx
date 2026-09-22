import { motion } from 'framer-motion'
import TeamMemberCard from '../components/TeamMemberCard'

const team = [
  {
    name: 'Laura Gómez',
    role: 'Presidenta',
    studies: 'Grado en Ingeniería Informática, UPO',
  },
  {
    name: 'Marcos Ruiz',
    role: 'Vicepresidente',
    studies: 'Grado en Ingeniería Informática, UPO',
  },
  {
    name: 'Elena Torres',
    role: 'Secretaria',
    studies: 'Doble Grado en Ingeniería Informática y ADE, UPO',
  },
  {
    name: 'Adrián Navarro',
    role: 'Tesorero',
    studies: 'Grado en Ingeniería Informática, UPO',
  },
  {
    name: 'Sofía Ramírez',
    role: 'Vocal de Comunicación',
    studies: 'Grado en Ingeniería Informática, UPO',
  },
  {
    name: 'Pablo Moreno',
    role: 'Vocal de Eventos',
    studies: 'Grado en Ingeniería Informática, UPO',
  },
  {
    name: 'Carmen Iglesias',
    role: 'Vocal de Formación',
    studies: 'Grado en Ingeniería Informática, UPO',
  },
  {
    name: 'Javier Delgado',
    role: 'Vocal de Proyectos',
    studies: 'Grado en Ingeniería Informática, UPO',
  },
]

function WhoWeAre() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-32">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl"
      >
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-gold-400">
          ESOLIUPO
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Quiénes somos
        </h1>
        <p className="mt-4 text-white/60">
          La junta de ESOLIUPO está formada por estudiantes de la Universidad
          Pablo de Olavide que dedican su tiempo a que la asociación siga
          creciendo.
        </p>
      </motion.div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((member, index) => (
          <TeamMemberCard key={member.name} index={index} {...member} />
        ))}
      </div>
    </section>
  )
}

export default WhoWeAre
