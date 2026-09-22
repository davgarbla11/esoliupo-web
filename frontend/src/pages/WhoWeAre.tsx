import { isAxiosError } from 'axios'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import TeamMemberCard from '../components/TeamMemberCard'
import api from '../lib/api'

type PublicMember = {
  id: string
  name: string
  position: string | null
  studies: string | null
  photoUrl: string | null
}

function WhoWeAre() {
  const [board, setBoard] = useState<PublicMember[]>([])
  const [collaborators, setCollaborators] = useState<PublicMember[]>([])
  const [members, setMembers] = useState<PublicMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get<{ board: PublicMember[]; collaborators: PublicMember[]; members: PublicMember[] }>(
        '/members',
      )
      .then((res) => {
        setBoard(res.data.board)
        setCollaborators(res.data.collaborators)
        setMembers(res.data.members)
      })
      .catch((err) => {
        const message = isAxiosError<{ error?: string }>(err)
          ? err.response?.data.error
          : undefined
        setError(message ?? 'No se ha podido cargar el equipo.')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="mx-auto max-w-6xl px-6 py-32">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl"
      >
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-gold-400">
          Conócenos
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Quiénes somos
        </h1>
        <p className="mt-4 text-white/60">
          La asociación ESOLIUPO está formada por estudiantes de la Universidad
          Pablo de Olavide que dedican su tiempo a que la asociación siga
          creciendo.
        </p>
      </motion.div>

      {loading && (
        <div className="mt-16 flex justify-center">
          <Loader2 className="animate-spin text-gold-400" size={28} />
        </div>
      )}

      {!loading && error && (
        <p className="mt-16 text-center text-white/50">{error}</p>
      )}

      {!loading && !error && (
        <>
          <div className="mt-16">
            <h2 className="text-xl font-medium text-white">Junta Directiva</h2>
            {board.length === 0 ? (
              <p className="mt-3 text-white/50">
                Próximamente: composición de la junta directiva.
              </p>
            ) : (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {board.map((member, index) => (
                  <TeamMemberCard
                    key={member.id}
                    index={index}
                    name={member.name}
                    role={member.position ?? ''}
                    studies={member.studies}
                    photo={member.photoUrl}
                  />
                ))}
              </div>
            )}
          </div>

          {collaborators.length > 0 && (
            <div className="mt-16">
              <h2 className="text-xl font-medium text-white">Colaboradores externos</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {collaborators.map((member, index) => (
                  <TeamMemberCard
                    key={member.id}
                    index={index}
                    name={member.name}
                    role="Colaborador externo"
                    studies={member.studies}
                    photo={member.photoUrl}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-16">
            <h2 className="text-xl font-medium text-white">Socios</h2>
            {members.length === 0 ? (
              <p className="mt-3 text-white/50">Aún no hay socios registrados.</p>
            ) : (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((member, index) => (
                  <TeamMemberCard
                    key={member.id}
                    index={index}
                    name={member.name}
                    role="Socio"
                    studies={member.studies}
                    photo={member.photoUrl}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}

export default WhoWeAre
