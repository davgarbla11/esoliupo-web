import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
        Página no encontrada
      </h1>
      <Link to="/" className="mt-4 text-slate-500 underline hover:text-slate-900">
        Volver al inicio
      </Link>
    </section>
  )
}

export default NotFound
