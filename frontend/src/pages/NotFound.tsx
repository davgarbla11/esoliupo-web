import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center px-6 py-32 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-white">
        Página no encontrada
      </h1>
      <Link
        to="/"
        className="mt-4 text-white/60 underline decoration-gold-400 hover:text-white"
      >
        Volver al inicio
      </Link>
    </section>
  )
}

export default NotFound
