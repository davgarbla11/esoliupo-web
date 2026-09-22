import { motion } from 'framer-motion'
import { ArrowRight, Code2, GraduationCap, Rocket, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import FeatureCard from '../components/FeatureCard'
import HeroBackground from '../components/HeroBackground'

const pillars = [
  { icon: GraduationCap, label: 'Formación' },
  { icon: Code2, label: 'Proyectos reales' },
  { icon: Users, label: 'Comunidad' },
  { icon: Rocket, label: 'Empleabilidad' },
]

const features = [
  {
    icon: GraduationCap,
    title: 'Formación práctica',
    description:
      'Talleres y charlas sobre las tecnologías que de verdad se usan en la industria, dadas por estudiantes y profesionales.',
  },
  {
    icon: Code2,
    title: 'Proyectos y hackathons',
    description:
      'Aprende programando: retos, hackathons y proyectos colaborativos donde construir es más importante que memorizar.',
  },
  {
    icon: Users,
    title: 'Comunidad',
    description:
      'Un espacio de estudiantes de Ingeniería Informática que se ayudan, comparten y crecen juntos dentro de la UPO.',
  },
  {
    icon: Rocket,
    title: 'Conexión con empresas',
    description:
      'Networking con empresas del sector tecnológico y antiguos alumnos que ya están trabajando en el mundo real.',
  },
]

function Home() {
  return (
    <>
      <HeroBackground />

      <div className="relative z-10">
        <section className="flex min-h-screen items-center">
          <div className="mx-auto w-full max-w-6xl px-6 py-32 text-center">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-sm font-medium uppercase tracking-[0.2em] text-gold-400"
            >
              Asociación de Software Libre · UPO
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-6xl"
            >
              Construimos el futuro, una línea de código a la vez.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mx-auto mt-6 max-w-xl text-lg text-white/70"
            >
              ESOLIUPO conecta a los estudiantes de Ingeniería Informática entre sí y
              les ayuda a incorporarse al mundo laboral.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <Link
                to="/contacto"
                className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-neutral-900 transition-transform hover:scale-105"
              >
                Únete a la asociación
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/actividades"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
              >
                Ver actividades
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mx-auto mt-20 flex max-w-2xl flex-wrap items-center justify-center gap-x-10 gap-y-4"
            >
              {pillars.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-white/60">
                  <Icon size={16} className="text-gold-400" />
                  {label}
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Qué hacemos
            </h2>
            <p className="mt-3 text-white/60">
              Todo lo que necesitas para crecer como ingeniero, fuera del
              temario.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} index={index} {...feature} />
            ))}
          </div>
        </section>

        <section className="border-t border-white/10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-20 text-center"
          >
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              ¿Listo para formar parte?
            </h2>
            <p className="max-w-xl text-white/60">
              No hace falta saber programar desde el día uno. Solo ganas de
              aprender y construir con otros estudiantes.
            </p>
            <Link
              to="/contacto"
              className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-neutral-900 transition-transform hover:scale-105"
            >
              Contacta con nosotros
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </section>
      </div>
    </>
  )
}

export default Home
