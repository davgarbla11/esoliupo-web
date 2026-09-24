import { isAxiosError } from 'axios'
import { Camera, CircleAlert, Loader2, Trash2, X, ZoomIn } from 'lucide-react'
import { type ChangeEvent, type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react'
import api from '../../lib/api'

const PREVIEW_SIZE = 240
const OUTPUT_SIZE = 512
const MIN_ZOOM = 1
const MAX_ZOOM = 3

type Step = 'menu' | 'confirm-delete' | 'crop'

type Offset = { x: number; y: number }

type NaturalSize = { w: number; h: number }

type AvatarEditorDialogProps = {
  userId: string
  userName: string
  photoUrl: string | null
  onClose: () => void
  onUpdated: (photoUrl: string | null) => void
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function getErrorMessage(err: unknown, fallback: string) {
  return isAxiosError<{ error?: string }>(err) ? err.response?.data.error ?? fallback : fallback
}

function coverScale(natural: NaturalSize) {
  return Math.max(PREVIEW_SIZE / natural.w, PREVIEW_SIZE / natural.h)
}

function clampOffset(offset: Offset, natural: NaturalSize, zoom: number): Offset {
  const scale = coverScale(natural) * zoom
  const maxX = Math.max(0, (natural.w * scale - PREVIEW_SIZE) / 2)
  const maxY = Math.max(0, (natural.h * scale - PREVIEW_SIZE) / 2)
  return {
    x: Math.min(maxX, Math.max(-maxX, offset.x)),
    y: Math.min(maxY, Math.max(-maxY, offset.y)),
  }
}

function renderCroppedBlob(imageSrc: string, natural: NaturalSize, zoom: number, offset: Offset) {
  return new Promise<Blob>((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = OUTPUT_SIZE
      canvas.height = OUTPUT_SIZE
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('No se ha podido procesar la imagen.'))
        return
      }
      const ratio = OUTPUT_SIZE / PREVIEW_SIZE
      const scale = coverScale(natural) * zoom * ratio
      const drawWidth = natural.w * scale
      const drawHeight = natural.h * scale
      const drawX = OUTPUT_SIZE / 2 + offset.x * ratio - drawWidth / 2
      const drawY = OUTPUT_SIZE / 2 + offset.y * ratio - drawHeight / 2
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('No se ha podido procesar la imagen.'))),
        'image/webp',
        0.9,
      )
    }
    img.onerror = () => reject(new Error('No se ha podido cargar la imagen.'))
    img.src = imageSrc
  })
}

function AvatarEditorDialog({ userId, userName, photoUrl, onClose, onUpdated }: AvatarEditorDialogProps) {
  const [step, setStep] = useState<Step>('menu')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [natural, setNatural] = useState<NaturalSize | null>(null)
  const [zoom, setZoom] = useState(MIN_ZOOM)
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragRef = useRef<{ startX: number; startY: number; startOffset: Offset } | null>(null)

  useEffect(() => {
    return () => {
      if (imageSrc) URL.revokeObjectURL(imageSrc)
    }
  }, [imageSrc])

  function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setError('')
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      setImageSrc((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return url
      })
      setNatural({ w: img.naturalWidth, h: img.naturalHeight })
      setZoom(MIN_ZOOM)
      setOffset({ x: 0, y: 0 })
      setStep('crop')
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      setError('No se ha podido cargar la imagen.')
    }
    img.src = url
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!natural) return
    dragRef.current = { startX: event.clientX, startY: event.clientY, startOffset: offset }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragRef.current || !natural) return
    const dx = event.clientX - dragRef.current.startX
    const dy = event.clientY - dragRef.current.startY
    const next = {
      x: dragRef.current.startOffset.x + dx,
      y: dragRef.current.startOffset.y + dy,
    }
    setOffset(clampOffset(next, natural, zoom))
  }

  function handlePointerUp() {
    dragRef.current = null
  }

  function handleZoomChange(value: number) {
    setZoom(value)
    if (natural) setOffset((prev) => clampOffset(prev, natural, value))
  }

  async function handleSaveCrop() {
    if (!imageSrc || !natural) return
    setLoading(true)
    setError('')
    try {
      const blob = await renderCroppedBlob(imageSrc, natural, zoom, offset)
      const formData = new FormData()
      formData.append('avatar', blob, 'avatar.webp')
      const res = await api.post<{ user: { photoUrl: string | null } }>(
        `/users/${userId}/avatar`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      onUpdated(res.data.user.photoUrl ?? null)
      onClose()
    } catch (err) {
      setError(getErrorMessage(err, 'No se ha podido subir la foto.'))
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirmDelete() {
    setLoading(true)
    setError('')
    try {
      const res = await api.delete<{ user: { photoUrl: string | null } }>(`/users/${userId}/avatar`)
      onUpdated(res.data.user.photoUrl ?? null)
      onClose()
    } catch (err) {
      setError(getErrorMessage(err, 'No se ha podido eliminar la foto.'))
      setLoading(false)
    }
  }

  const displayScale = natural ? coverScale(natural) * zoom : 0

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70" onClick={() => !loading && onClose()} aria-hidden="true" />

      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-black p-6">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 text-white/40 hover:text-white disabled:opacity-50"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <h2 className="text-sm font-medium text-white/80">
          {step === 'crop' ? 'Ajusta tu foto' : 'Foto de perfil'}
        </h2>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelected}
          className="hidden"
        />

        {step === 'menu' && (
          <div className="mt-4 flex flex-col items-center">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gold-400 text-2xl font-semibold text-neutral-900">
              {photoUrl ? (
                <img src={photoUrl} alt={userName} className="h-full w-full object-cover" />
              ) : (
                getInitials(userName)
              )}
            </div>

            {error && (
              <p className="mt-3 flex items-center gap-2 text-sm text-red-400">
                <CircleAlert size={14} />
                {error}
              </p>
            )}

            <div className="mt-5 w-full space-y-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-white/80 hover:bg-white/5 hover:text-white"
              >
                <Camera size={16} />
                Subir nueva foto
              </button>
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setStep('confirm-delete')}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-300 hover:bg-red-400/10"
                >
                  <Trash2 size={16} />
                  Eliminar foto
                </button>
              )}
            </div>
          </div>
        )}

        {step === 'confirm-delete' && (
          <div className="mt-4">
            <p className="text-sm text-white/70">
              ¿Seguro que quieres eliminar tu foto de perfil? No podrás recuperarla.
            </p>
            {error && (
              <p className="mt-3 flex items-center gap-2 text-sm text-red-400">
                <CircleAlert size={14} />
                {error}
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setStep('menu')}
                disabled={loading}
                className="flex-1 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Eliminar
              </button>
            </div>
          </div>
        )}

        {step === 'crop' && imageSrc && natural && (
          <div className="mt-4 flex flex-col items-center">
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="relative h-[240px] w-[240px] cursor-grab touch-none overflow-hidden rounded-full border-2 border-white/10 bg-black/40 active:cursor-grabbing"
              style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
            >
              <img
                src={imageSrc}
                alt=""
                draggable={false}
                className="pointer-events-none absolute left-1/2 top-1/2 select-none"
                style={{
                  width: natural.w * displayScale,
                  height: natural.h * displayScale,
                  transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`,
                }}
              />
            </div>
            <p className="mt-2 text-xs text-white/40">Arrastra la imagen para centrarla</p>

            <div className="mt-3 flex w-full items-center gap-3">
              <ZoomIn size={16} className="text-white/50" />
              <input
                type="range"
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step={0.01}
                value={zoom}
                onChange={(event) => handleZoomChange(Number(event.target.value))}
                className="flex-1 accent-gold-400"
              />
            </div>

            {error && (
              <p className="mt-3 flex items-center gap-2 text-sm text-red-400">
                <CircleAlert size={14} />
                {error}
              </p>
            )}

            <div className="mt-4 flex w-full gap-2">
              <button
                type="button"
                onClick={() => setStep('menu')}
                disabled={loading}
                className="flex-1 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCrop}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-neutral-900 disabled:opacity-60"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Guardar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AvatarEditorDialog
