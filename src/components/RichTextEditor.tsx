'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { FontFamily } from '@tiptap/extension-font-family'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useEditorContext } from './EditorManager'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  onFocus?: () => void
  onBlur?: () => void
  placeholder?: string
  isReadOnly?: boolean
  className?: string
}

export function RichTextEditor({
  content,
  onChange,
  onFocus,
  onBlur,
  placeholder = 'Click here to start typing...',
  isReadOnly = false,
  className = ''
}: RichTextEditorProps) {
  const { setActiveEditor } = useEditorContext()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      FontFamily.configure({
        types: ['textStyle'],
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable: !isReadOnly,
    immediatelyRender: false, // Disable SSR for TipTap
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    onFocus: ({ editor }) => {
      setActiveEditor(editor)
      onFocus?.()
    },
    onBlur: ({ editor }) => {
      // Don't clear activeEditor on blur - keep it for toolbar use
      onBlur?.()
    },
  })

  // Set the active editor when component mounts/editor is created
  useEffect(() => {
    if (editor) {
      setActiveEditor(editor)
    }
    return () => {
      // Clean up when component unmounts
      if (editor) {
        setActiveEditor(null)
      }
    }
  }, [editor, setActiveEditor])

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  // Update editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(!isReadOnly)
    }
  }, [isReadOnly, editor])

  return (
    <div className={cn('tiptap-editor', className)}>
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none focus:outline-none"
      />
      <style jsx global>{`
        /* TipTap Editor Styles */
        .tiptap-editor .ProseMirror {
          padding: 1rem;
          min-height: 150px;
          outline: none;
        }

        .tiptap-editor .ProseMirror p {
          margin: 0.5rem 0;
        }

        /* Highlight styles */
        .tiptap-editor .ProseMirror mark {
          padding: 0.125rem 0;
          border-radius: 0.125rem;
        }

        /* Font family styles */
        .tiptap-editor .ProseMirror [style*="font-family"] {
          font-family: var(--font-family);
        }

        .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }

        /* Task list styles */
        .tiptap-editor ul[data-type="taskList"] {
          list-style: none;
          padding: 0;
          margin: 0.5rem 0;
        }

        .tiptap-editor ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          margin: 0.25rem 0;
        }

        .tiptap-editor ul[data-type="taskList"] li > label {
          flex: 0 0 auto;
          margin-right: 0.5rem;
          user-select: none;
        }

        .tiptap-editor ul[data-type="taskList"] li > label input[type="checkbox"] {
          cursor: pointer;
          margin-top: 0.25rem;
          width: 16px;
          height: 16px;
          transform: scale(1.2);
        }

        .tiptap-editor ul[data-type="taskList"] li > div {
          flex: 1 1 auto;
        }

        .tiptap-editor ul[data-type="taskList"] li[data-checked="true"] > div > p {
          text-decoration: line-through;
          opacity: 0.5;
        }

        /* Regular list styles */
        .tiptap-editor ul:not([data-type="taskList"]) {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
          list-style-type: disc;
        }

        .tiptap-editor ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
          list-style-type: decimal;
        }

        .tiptap-editor ul:not([data-type="taskList"]) li,
        .tiptap-editor ol li {
          margin: 0.25rem 0;
          list-style-position: outside;
        }

        /* Basic text styles */
        .tiptap-editor strong {
          font-weight: bold;
        }

        .tiptap-editor em {
          font-style: italic;
        }

        .tiptap-editor u {
          text-decoration: underline;
        }

        .tiptap-editor h1,
        .tiptap-editor h2,
        .tiptap-editor h3 {
          font-weight: bold;
          margin: 1rem 0 0.5rem 0;
        }

        .tiptap-editor h1 { font-size: 1.5rem; }
        .tiptap-editor h2 { font-size: 1.25rem; }
        .tiptap-editor h3 { font-size: 1.1rem; }

        .tiptap-editor blockquote {
          border-left: 3px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
        }
      `}</style>
    </div>
  )
}