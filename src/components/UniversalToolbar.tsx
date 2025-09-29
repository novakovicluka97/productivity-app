'use client'

import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  CheckSquare
} from 'lucide-react'
import { Toggle } from './ui/toggle'
import { Separator } from './ui/separator'
import { Badge } from './ui/badge'
import { useEditorContext } from './EditorManager'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'

interface UniversalToolbarProps {
  isEditing: boolean
  activeCardId: string | null
}

export function UniversalToolbar({ isEditing, activeCardId }: UniversalToolbarProps) {
  const { activeEditor } = useEditorContext()

  const handleCommand = (command: string) => {
    if (!activeEditor) return

    switch (command) {
      case 'bold':
        activeEditor.chain().focus().toggleBold().run()
        break
      case 'italic':
        activeEditor.chain().focus().toggleItalic().run()
        break
      case 'underline':
        activeEditor.chain().focus().toggleUnderline().run()
        break
      case 'bulletList':
        activeEditor.chain().focus().toggleBulletList().run()
        break
      case 'orderedList':
        activeEditor.chain().focus().toggleOrderedList().run()
        break
      case 'taskList':
        activeEditor.chain().focus().toggleTaskList().run()
        break
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  return (
    <TooltipProvider>
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm" data-toolbar="true">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-muted-foreground mr-2">Formatting:</span>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={activeEditor?.isActive('bold')}
                    onPressedChange={() => handleCommand('bold')}
                    onMouseDown={handleMouseDown}
                    aria-label="Bold"
                    disabled={!isEditing || !activeEditor}
                  >
                    <Bold className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Bold (Ctrl+B)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={activeEditor?.isActive('italic')}
                    onPressedChange={() => handleCommand('italic')}
                    onMouseDown={handleMouseDown}
                    aria-label="Italic"
                    disabled={!isEditing || !activeEditor}
                  >
                    <Italic className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Italic (Ctrl+I)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={activeEditor?.isActive('underline')}
                    onPressedChange={() => handleCommand('underline')}
                    onMouseDown={handleMouseDown}
                    aria-label="Underline"
                    disabled={!isEditing || !activeEditor}
                  >
                    <Underline className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Underline (Ctrl+U)</p>
                </TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-6 mx-2" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={activeEditor?.isActive('bulletList')}
                    onPressedChange={() => handleCommand('bulletList')}
                    onMouseDown={handleMouseDown}
                    aria-label="Bullet List"
                    disabled={!isEditing || !activeEditor}
                  >
                    <List className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Bullet List</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={activeEditor?.isActive('orderedList')}
                    onPressedChange={() => handleCommand('orderedList')}
                    onMouseDown={handleMouseDown}
                    aria-label="Numbered List"
                    disabled={!isEditing || !activeEditor}
                  >
                    <ListOrdered className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Numbered List</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={activeEditor?.isActive('taskList')}
                    onPressedChange={() => handleCommand('taskList')}
                    onMouseDown={handleMouseDown}
                    aria-label="Task List"
                    disabled={!isEditing || !activeEditor}
                  >
                    <CheckSquare className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Task List (Checkboxes)</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {isEditing && activeCardId && (
              <Badge variant="outline">
                Editing: {activeCardId}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}