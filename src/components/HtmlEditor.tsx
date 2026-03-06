'use client'

import { useEffect, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'

interface HtmlEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function HtmlEditor({ value, onChange }: HtmlEditorProps) {
  const [sourceMode, setSourceMode] = useState(false)
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content: value || '<p></p>',
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          'prose max-w-none min-h-[300px] p-4 outline-none',
      },
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    if (!editor || sourceMode) return
    const current = editor.getHTML()
    if (value !== current) {
      editor.commands.setContent(value || '<p></p>', { emitUpdate: false })
    }
  }, [editor, value, sourceMode])

  const setLink = () => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL do link', previousUrl || 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().unsetLink().run()
      return
    }
    editor.chain().focus().setLink({ href: url }).run()
  }

  const insertImage = () => {
    if (!editor) return
    const url = window.prompt('URL da imagem', 'https://')
    if (!url) return
    editor.chain().focus().setImage({ src: url }).run()
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-100 p-2 flex flex-wrap gap-1 border-b">
        <button
          type="button"
          onClick={() => setSourceMode(!sourceMode)}
          className={`px-3 py-1 border rounded text-sm ${sourceMode ? 'bg-[var(--primary)] text-white' : 'bg-white hover:bg-gray-50'}`}
        >
          {sourceMode ? 'Rich Text' : 'HTML'}
        </button>
        {!sourceMode && editor && (
          <>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="px-3 py-1 bg-white border rounded hover:bg-gray-50 text-sm font-bold">H2</button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className="px-3 py-1 bg-white border rounded hover:bg-gray-50 text-sm font-bold">H3</button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} className="px-3 py-1 bg-white border rounded hover:bg-gray-50 text-sm font-bold">H4</button>
            <span className="w-px h-6 bg-gray-300 mx-1" />
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className="px-3 py-1 bg-white border rounded hover:bg-gray-50 text-sm font-bold">B</button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className="px-3 py-1 bg-white border rounded hover:bg-gray-50 text-sm italic">I</button>
            <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className="px-3 py-1 bg-white border rounded hover:bg-gray-50 text-sm underline">U</button>
            <span className="w-px h-6 bg-gray-300 mx-1" />
            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className="px-3 py-1 bg-white border rounded hover:bg-gray-50 text-sm">• List</button>
            <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className="px-3 py-1 bg-white border rounded hover:bg-gray-50 text-sm">1. List</button>
            <span className="w-px h-6 bg-gray-300 mx-1" />
            <button type="button" onClick={setLink} className="px-3 py-1 bg-white border rounded hover:bg-gray-50 text-sm">Link</button>
            <button type="button" onClick={insertImage} className="px-3 py-1 bg-white border rounded hover:bg-gray-50 text-sm">Image</button>
          </>
        )}
      </div>

      {sourceMode ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-4 min-h-[300px] font-mono text-sm outline-none"
          placeholder="Write raw HTML..."
        />
      ) : (
        <EditorContent editor={editor} className="bg-white min-h-[300px]" />
      )}
    </div>
  )
}
