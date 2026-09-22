import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

function Contact() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-6xl px-6 py-32"
    >
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-gold-400">
        ESOLIUPO
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Contacto
      </h1>
      <p className="mt-4 max-w-2xl text-white/60">
        Próximamente: formulario de contacto y datos de la asociación.
      </p>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-medium text-white">¿Quieres ser socio?</h2>
        <p className="mt-2 max-w-xl text-white/60">
          Si eres estudiante de la Universidad Pablo de Olavide y quieres unirte a
          ESOLIUPO, rellena el formulario de solicitud y la Junta Directiva se pondrá
          en contacto contigo.
        </p>
        <Link
          to="/unete"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-neutral-900 transition-transform hover:scale-105"
        >
          Solicitar ingreso
          <ArrowRight size={16} />
        </Link>
      </div>
    </motion.section>
  )
}

export default Contact
