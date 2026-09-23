import { isAxiosError } from 'axios'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Camera,
  CircleAlert,
  Eye,
  EyeOff,
  Loader2,
  Save,
} from 'lucide-react'
import { type ChangeEvent, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import RichTextEditor from '../../components/dashboard/RichTextEditor'
import api from '../../lib/api'
import type { EsoliupoEvent } from '../../types/event'

function getErrorMessage(err: unknown, fallback: string) {
  return isAxiosError<{ error?: string }>(err) ? err.response?.data.error ?? fallback : fallback
}

function toInputDateTime(value: string) {
  const date = new Date(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`
}

function EventEditor() {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(isEditing)
  const [loadError, setLoadError] = useState('')

  const [title, setTitle] = useState('')
  const [place, setPlace] = useState('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [published, setPublished] = useState(false)

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      setLoading(true)
      setLoadError('')
      try {
        const res = await api.get<{ event: EsoliupoEvent }>(`/events/${id}`)
        const event = res.data.event
        setTitle(event.title)
        setPlace(event.place)
        setDate(toInputDateTime(event.date))
        setDescription(event.description)
        setContent(event.content)
        setCoverImageUrl(event.coverImageUrl)
        setPublished(event.published)
      } catch (err) {
        setLoadError(getErrorMessage(err, 'No se ha podido cargar el evento.'))
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  async function handleSave() {
    if (!title.trim() || !description.trim() || !place.trim() || !date) {
      setSaveError('Rellena nombre, descripción, lugar y fecha.')
      return
    }

    setSaving(true)
    setSaveError('')
    try {
      if (isEditing) {
        await api.patch(`/events/${id}`, {
          title,
          description,
          place,
          date: new Date(date).toISOString(),
          content,
        })
      } else {
        const res = await api.post<{ event: EsoliupoEvent }>('/events', {
          title,
          description,
          place,
          date: new Date(date).toISOString(),
          content,
        })
        navigate(`/dashboard/eventos/${res.data.event.id}`, { replace: true })
      }
    } catch (err) {
      setSaveError(getErrorMessage(err, 'No se ha podido guardar el evento.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleTogglePublished() {
    if (!id) return
    setPublishing(true)
    setSaveError('')
    try {
      const res = await api.patch<{ event: EsoliupoEvent }>(`/events/${id}`, {
        published: !published,
      })
      setPublished(res.data.event.published)
    } catch (err) {
      setSaveError(getErrorMessage(err, 'No se ha podido cambiar la publicación.'))
    } finally {
      setPublishing(false)
    }
  }

  async function handleCoverSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !id) return

    setUploadingCover(true)
    setSaveError('')
    try {
      const formData = new FormData()
      formData.append('cover', file)
      const res = await api.post<{ event: EsoliupoEvent }>(`/events/${id}/cover`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setCoverImageUrl(res.data.event.coverImageUrl)
    } catch (err) {
      setSaveError(getErrorMessage(err, 'No se ha podido subir la imagen.'))
    } finally {
      setUploadingCover(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-gold-400" size={28} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <button
          type="button"
          onClick={() => navigate('/dashboard/eventos')}
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
        >
          <ArrowLeft size={16} />
          Volver a eventos
        </button>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">
          {isEditing ? 'Editar evento' : 'Nuevo evento'}
        </h1>
      </motion.div>

      {loadError && (
        <p className="mt-6 flex items-center gap-2 text-sm text-red-400">
          <CircleAlert size={14} />
          {loadError}
        </p>
      )}

      {!loadError && (
        <div className="mt-8 space-y-6">
          {isEditing && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-xl bg-black/30 text-white/40 hover:text-white"
              >
                {coverImageUrl ? (
                  <img
                    src={coverImageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex items-center gap-2 text-sm">
                    <Camera size={18} />
                    Subir imagen de portada
                  </span>
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                  {uploadingCover ? (
                    <Loader2 size={20} className="animate-spin text-white" />
                  ) : (
                    <Camera size={20} className="text-white" />
                  )}
                </span>
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleCoverSelected}
                className="hidden"
              />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/80">
                Nombre del evento
              </label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ej. Hackathon de primavera"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-gold-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/80">Lugar</label>
              <input
                value={place}
                onChange={(event) => setPlace(event.target.value)}
                placeholder="Ej. ETSII, Sala de Grados"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-gold-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/80">
              Fecha y hora
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 text-white focus:border-gold-400 focus:outline-none [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/80">
              Descripción breve
            </label>
            <p className="mb-2 text-xs text-white/40">
              Resumen corto que aparece junto al título en Actividades.
            </p>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="De qué va el evento, en una o dos frases..."
              className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-gold-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/80">
              Contenido de la publicación
            </label>
            <p className="mb-2 text-xs text-white/40">
              Texto completo con formato e imágenes, tal y como se mostrará en la web.
            </p>
            <RichTextEditor value={content} onChange={setContent} />
          </div>

          {saveError && (
            <p className="flex items-center gap-2 text-sm text-red-400">
              <CircleAlert size={14} />
              {saveError}
            </p>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-neutral-900 transition-transform hover:scale-105 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Guardar
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={handleTogglePublished}
                disabled={publishing}
                className={`inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-colors disabled:opacity-60 ${
                  published
                    ? 'border-white/20 text-white/70 hover:bg-white/5'
                    : 'border-gold-400/40 text-gold-400 hover:bg-gold-400/10'
                }`}
              >
                {publishing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : published ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
                {published ? 'Ocultar de Actividades' : 'Publicar en Actividades'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default EventEditor
