import { motion } from 'framer-motion'

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
    </motion.section>
  )
}

export default Contact
