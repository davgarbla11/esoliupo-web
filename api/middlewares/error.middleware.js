export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Recurso no encontrado.' })
}

export function errorHandler(err, req, res, next) {
  console.error(err)
  const status = err.status ?? 500
  res.status(status).json({
    error: status === 500 ? 'Error interno del servidor.' : err.message,
  })
}
