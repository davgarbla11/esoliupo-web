function DashboardFooter() {
  return (
    <footer className="border-t border-white/10 px-6 py-6 text-sm text-white/40">
      <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
        <p>© {new Date().getFullYear()} ESOLIUPO. Todos los derechos reservados.</p>
        <p>Desarrollado por David García Blanco.</p>
      </div>
    </footer>
  )
}

export default DashboardFooter
