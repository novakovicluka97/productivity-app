'use client'

import React, { createContext, useContext, useState } from 'react'
import { Editor } from '@tiptap/react'

interface EditorContextType {
  activeEditor: Editor | null
  setActiveEditor: (editor: Editor | null) => void
}

const EditorContext = createContext<EditorContextType>({
  activeEditor: null,
  setActiveEditor: () => {}
})

export function useEditorContext() {
  return useContext(EditorContext)
}

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null)

  return (
    <EditorContext.Provider value={{ activeEditor, setActiveEditor }}>
      {children}
    </EditorContext.Provider>
  )
}