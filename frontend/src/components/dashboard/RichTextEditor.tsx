import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  List,
  ListOrdered,
  Loader2,
  Quote,
} from 'lucide-react'
import { type ChangeEvent, useRef, useState } from 'react'
import api from '../../lib/api'

type RichTextEditorProps = {
  value: string
  onChange: (html: string) => void
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40 ${
        active ? 'bg-gold-400/15 text-gold-400' : ''
      }`}
    >
      {children}
    </button>
  )
}

function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image.configure({ HTMLAttributes: { class: 'event-content-image' } }),
    ],
    content: value,
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'event-content min-h-[220px] px-4 py-3 focus:outline-none',
      },
    },
  })

  async function handleImageSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !editor) return

    setUploadingImage(true)
    setUploadError('')
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await api.post<{ url: string }>('/events/content-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      editor.chain().focus().setImage({ src: res.data.url }).run()
    } catch {
      setUploadError('No se ha podido subir la imagen.')
    } finally {
      setUploadingImage(false)
    }
  }

  if (!editor) return null

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-black/30">
      <div className="flex flex-wrap items-center gap-1 border-b border-white/10 bg-white/5 p-2">
        <ToolbarButton
          label="Negrita"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Cursiva"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Título grande"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Título pequeño"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Lista"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Lista numerada"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Cita"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Insertar imagen"
          disabled={uploadingImage}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploadingImage ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ImageIcon size={16} />
          )}
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageSelected}
          className="hidden"
        />
      </div>

      {uploadError && <p className="px-4 pt-2 text-sm text-red-400">{uploadError}</p>}

      <EditorContent editor={editor} />
    </div>
  )
}

export default RichTextEditor
