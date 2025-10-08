'use client'

import {
  Plus, Settings,
  Bold, Italic, Underline, List, ListOrdered, CheckSquare,
  Highlighter, Type, Palette, ChevronDown, Moon, Sun, Trees, Waves
} from 'lucide-react'
import { useState } from 'react'
import { MusicPlayer } from './MusicPlayer'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
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

interface UnifiedHeaderProps {
  onAddCard: (type: 'session' | 'break') => void
  canEdit: boolean
  isEditing: boolean
  activeCardId: string | null
  // Music props
  selectedTrack?: string
  volume: number
  isMusicPlaying: boolean
  onTrackSelect: (trackId: string) => void
  onVolumeChange: (volume: number) => void
  onMusicToggle: () => void
  // Theme props
  theme: 'default' | 'dark' | 'forest' | 'ocean'
  onThemeChange: (theme: 'default' | 'dark' | 'forest' | 'ocean') => void
}

export function UnifiedHeader({
  onAddCard,
  canEdit,
  isEditing,
  activeCardId,
  selectedTrack,
  volume,
  isMusicPlaying,
  onTrackSelect,
  onVolumeChange,
  onMusicToggle,
  theme,
  onThemeChange,
}: UnifiedHeaderProps) {
  const { activeEditor } = useEditorContext()
  const [highlightColor, setHighlightColor] = useState('#FFFF00')
  const [textColor, setTextColor] = useState('#000000')
  const [fontFamily, setFontFamily] = useState('Inter')

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
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Logo/Title - Far Left */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-primary-foreground rounded-sm" />
              </div>
              <h1 className="text-xl font-semibold">
                Session-Break
              </h1>
            {/* Music Player - Always visible in header */}
              <div className="mx-4">
                <MusicPlayer
                  selectedTrack={selectedTrack}
                  volume={volume}
                  isMusicPlaying={isMusicPlaying}
                  onTrackSelect={onTrackSelect}
                  onVolumeChange={onVolumeChange}
                  onPlayToggle={onMusicToggle}
                  className="min-w-[320px]"
                />
              </div>

            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* Formatting Tools - Center Left */}
            <div className="flex items-center gap-1 flex-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Toggle
                      size="sm"
                      pressed={activeEditor?.isActive('bold') || false}
                      onPressedChange={() => handleCommand('bold')}
                      onMouseDown={handleMouseDown}
                      aria-label="Bold"
                      disabled={!isEditing || !activeEditor}
                    >
                      <Bold className="h-4 w-4" />
                    </Toggle>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Bold (Ctrl+B)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Toggle
                      size="sm"
                      pressed={activeEditor?.isActive('italic') || false}
                      onPressedChange={() => handleCommand('italic')}
                      onMouseDown={handleMouseDown}
                      aria-label="Italic"
                      disabled={!isEditing || !activeEditor}
                    >
                      <Italic className="h-4 w-4" />
                    </Toggle>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Italic (Ctrl+I)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Toggle
                      size="sm"
                      pressed={activeEditor?.isActive('underline') || false}
                      onPressedChange={() => handleCommand('underline')}
                      onMouseDown={handleMouseDown}
                      aria-label="Underline"
                      disabled={!isEditing || !activeEditor}
                    >
                      <Underline className="h-4 w-4" />
                    </Toggle>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Underline (Ctrl+U)</p>
                </TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-6 mx-2" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Toggle
                      size="sm"
                      pressed={activeEditor?.isActive('bulletList') || false}
                      onPressedChange={() => handleCommand('bulletList')}
                      onMouseDown={handleMouseDown}
                      aria-label="Bullet List"
                      disabled={!isEditing || !activeEditor}
                    >
                      <List className="h-4 w-4" />
                    </Toggle>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Bullet List</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Toggle
                      size="sm"
                      pressed={activeEditor?.isActive('orderedList') || false}
                      onPressedChange={() => handleCommand('orderedList')}
                      onMouseDown={handleMouseDown}
                      aria-label="Numbered List"
                      disabled={!isEditing || !activeEditor}
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Toggle>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Numbered List</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Toggle
                      size="sm"
                      pressed={activeEditor?.isActive('taskList') || false}
                      onPressedChange={() => handleCommand('taskList')}
                      onMouseDown={handleMouseDown}
                      aria-label="Task List"
                      disabled={!isEditing || !activeEditor}
                    >
                      <CheckSquare className="h-4 w-4" />
                    </Toggle>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Task List (Checkboxes)</p>
                </TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-6 mx-2" />

              {/* Highlighter with color picker */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!isEditing || !activeEditor}
                    className="h-9 px-2"
                  >
                    <Highlighter className="h-4 w-4" style={{ color: highlightColor }} />
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <div className="p-2">
                    <div className="text-xs font-medium mb-2">Highlight Color</div>
                    <div className="grid grid-cols-5 gap-1">
                      {['#FFFF00', '#00FF00', '#00FFFF', '#FF00FF', '#FFA500', '#FF69B4', '#87CEEB', '#DDA0DD', '#F0E68C', '#FFB6C1'].map((color) => (
                        <button
                          key={color}
                          className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setHighlightColor(color)
                            if (activeEditor) {
                              activeEditor.chain().focus().toggleHighlight({ color }).run()
                            }
                          }}
                        />
                      ))}
                    </div>
                    <button
                      className="w-full mt-2 text-xs py-1 hover:bg-gray-100 rounded"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => activeEditor?.chain().focus().unsetHighlight().run()}
                    >
                      Clear Highlight
                    </button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Text Color picker */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!isEditing || !activeEditor}
                    className="h-9 px-2"
                  >
                    <Palette className="h-4 w-4" style={{ color: textColor }} />
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <div className="p-2">
                    <div className="text-xs font-medium mb-2">Text Color</div>
                    <div className="grid grid-cols-5 gap-1">
                      {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000', '#000080'].map((color) => (
                        <button
                          key={color}
                          className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setTextColor(color)
                            activeEditor?.chain().focus().setColor(color).run()
                          }}
                        />
                      ))}
                    </div>
                    <button
                      className="w-full mt-2 text-xs py-1 hover:bg-gray-100 rounded"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => activeEditor?.chain().focus().unsetColor().run()}
                    >
                      Reset Color
                    </button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Font Family */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!isEditing || !activeEditor}
                    className="h-9 px-2"
                  >
                    <Type className="h-4 w-4" />
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => {
                    setFontFamily('Inter')
                    activeEditor?.chain().focus().setFontFamily('Inter').run()
                  }}>
                    Inter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setFontFamily('Arial')
                    activeEditor?.chain().focus().setFontFamily('Arial').run()
                  }}>
                    Arial
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setFontFamily('Georgia')
                    activeEditor?.chain().focus().setFontFamily('Georgia, serif').run()
                  }}>
                    Georgia
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setFontFamily('monospace')
                    activeEditor?.chain().focus().setFontFamily('monospace').run()
                  }}>
                    Monospace
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    activeEditor?.chain().focus().unsetFontFamily().run()
                  }}>
                    Default
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {isEditing && activeCardId && (
                <Badge variant="outline" className="ml-auto">
                  Editing: {activeCardId}
                </Badge>
              )}
            </div>

            {/* Main Controls - Right */}
            <div className="flex items-center gap-2">
              {/* Add Card Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    aria-label="Add new card"
                  >
                    <Plus className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onAddCard('session')}>
                    Add Session
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAddCard('break')}>
                    Add Break
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    aria-label="Select theme"
                  >
                    {theme === 'dark' ? (
                      <Moon className="h-5 w-5" aria-hidden="true" />
                    ) : theme === 'forest' ? (
                      <Trees className="h-5 w-5" aria-hidden="true" />
                    ) : theme === 'ocean' ? (
                      <Waves className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Sun className="h-5 w-5" aria-hidden="true" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onThemeChange('default')}>
                    <Sun className="h-4 w-4 mr-2" />
                    Default
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onThemeChange('dark')}>
                    <Moon className="h-4 w-4 mr-2" />
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onThemeChange('forest')}>
                    <Trees className="h-4 w-4 mr-2" />
                    Forest
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onThemeChange('ocean')}>
                    <Waves className="h-4 w-4 mr-2" />
                    Ocean
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>


              {/* Settings (future feature) */}
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
                disabled
                aria-label="Settings (coming soon)"
              >
                <Settings className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </header>
    </TooltipProvider>
  )
}
