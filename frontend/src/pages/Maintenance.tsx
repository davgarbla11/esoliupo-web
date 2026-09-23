import { motion } from 'framer-motion'
import { Wrench } from 'lucide-react'
import logoIcon from '../assets/icon-mark.png'
import HeroBackground from '../components/HeroBackground'

function Maintenance() {
  return (
    <div className="relative min-h-screen">
      <HeroBackground />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md"
        >
          <div className="flex flex-col items-center">
            <img src={logoIcon} alt="ESOLIUPO" className="h-12 w-auto" />
            <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-gold-400/10 text-gold-400">
              <Wrench size={22} />
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">
              Volvemos enseguida
            </h1>
            <p className="mt-2 text-sm text-white/60">
              Estamos actualizando la web de ESOLIUPO. Vuelve a intentarlo en unos
              minutos.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Maintenance
