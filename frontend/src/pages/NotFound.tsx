import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
        Página no encontrada
      </h1>
      <Link to="/" className="mt-4 text-neutral-500 underline decoration-gold-400 hover:text-neutral-900">
        Volver al inicio
      </Link>
    </section>
  )
}

export default NotFound
