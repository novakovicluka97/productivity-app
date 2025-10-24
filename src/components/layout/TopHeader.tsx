'use client'

import React, { useState, type MouseEvent } from 'react'
import Link from 'next/link'
import {
  Moon,
  Sun,
  Trees,
  Waves,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  CheckSquare,
  Highlighter,
  Type,
  Palette,
  ChevronDown
} from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useEditorContext } from '@/components/EditorManager'
import { MusicPlayer } from '@/components/MusicPlayer'
import { TemplateDropdown } from '@/components/TemplateDropdown'
import type { Card } from '@/lib/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

/**
 * TopHeader Component
 *
 * Single unified header for protected routes with:
 * - App branding/logo
 * - Music player (session builder route)
 * - Text formatting controls (for session cards)
 * - Theme switcher
 *
 * This is the ONLY header in protected routes
 */

interface TopHeaderProps {
  // Show music player and template dropdown on /app route
  showMusicAndTemplate?: boolean
  canEdit?: boolean
  isEditing?: boolean
  activeCardId?: string | null
  // Music props
  selectedTrack?: string
  volume?: number
  isMusicPlaying?: boolean
  onTrackSelect?: (trackId: string) => void
  onVolumeChange?: (volume: number) => void
  onMusicToggle?: () => void
  // Template props
  onApplyTemplate?: (cards: Card[]) => void
}

export function TopHeader({
  showMusicAndTemplate = false,
  canEdit = true,
  isEditing = false,
  activeCardId = null,
  selectedTrack,
  volume = 50,
  isMusicPlaying = false,
  onTrackSelect,
  onVolumeChange,
  onMusicToggle,
  onApplyTemplate,
}: TopHeaderProps) {
  const { theme, setTheme } = useTheme()
  const { activeEditor } = useEditorContext()
  const [highlightColor, setHighlightColor] = useState('#FFFF00')
  const [textColor, setTextColor] = useState('#000000')
  const [, setFontFamily] = useState('Inter')

  const handleThemeChange = (newTheme: typeof theme) => {
    setTheme(newTheme)
  }

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

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault()
  }

  const renderFormattingControls = ({
    className,
    showDividers = true,
    badgeClassName,
  }: {
    className: string
    showDividers?: boolean
    badgeClassName?: string
  }) => (
    <div className={className} role="toolbar" aria-label="Text formatting options">
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

      {showDividers && <Separator orientation="vertical" className="h-6 mx-2" />}

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

      {showDividers && <Separator orientation="vertical" className="h-6 mx-2" />}

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
        <Badge
          variant="outline"
          className={`text-xs ${badgeClassName ?? ''}`.trim()}
        >
          Editing: {activeCardId}
        </Badge>
      )}
    </div>
  )

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/80">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center gap-4">
            {/* Logo and Title */}
            <Link href="/app" className="flex items-center gap-2 shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 font-bold text-white shadow-lg">
                SB
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                Session-Break
              </span>
            </Link>

            {/* Music Player - Always visible on /app route */}
            {showMusicAndTemplate && onMusicToggle && (
              <>
                <Separator orientation="vertical" className="h-8" />
                <div className="min-w-[280px]">
                  <MusicPlayer
                    selectedTrack={selectedTrack}
                    volume={volume}
                    isMusicPlaying={isMusicPlaying}
                    onTrackSelect={onTrackSelect!}
                    onVolumeChange={onVolumeChange!}
                    onPlayToggle={onMusicToggle}
                    className="min-w-[280px]"
                  />
                </div>
              </>
            )}

            {/* Template Dropdown - Always visible on /app route */}
            {showMusicAndTemplate && onApplyTemplate && (
              <>
                <Separator orientation="vertical" className="h-8" />
                <TemplateDropdown onApplyTemplate={onApplyTemplate} />
              </>
            )}

            {/* Text Formatting Controls - Only visible when editing */}
            {isEditing && (
              <>
                <Separator orientation="vertical" className="h-8" />
                {renderFormattingControls({
                  className: 'flex items-center gap-1 flex-1',
                  badgeClassName: 'ml-auto',
                })}
              </>
            )}

            {/* Right Side Controls */}
            <div className="ml-auto flex items-center gap-2">
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
                  <DropdownMenuItem onClick={() => handleThemeChange('default')}>
                    <Sun className="mr-2 h-4 w-4" />
                    Default
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleThemeChange('forest')}>
                    <Trees className="mr-2 h-4 w-4" />
                    Forest
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleThemeChange('ocean')}>
                    <Waves className="mr-2 h-4 w-4" />
                    Ocean
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="flex flex-col gap-3 md:hidden">
            {/* Top Row: Logo + Controls */}
            <div className="flex items-center justify-between gap-3">
              {/* Logo and Title */}
              <Link href="/app" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 font-bold text-white shadow-lg text-sm">
                  SB
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  Session-Break
                </span>
              </Link>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      aria-label="Select theme"
                    >
                      {theme === 'dark' ? (
                        <Moon className="h-4 w-4" aria-hidden="true" />
                      ) : theme === 'forest' ? (
                        <Trees className="h-4 w-4" aria-hidden="true" />
                      ) : theme === 'ocean' ? (
                        <Waves className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Sun className="h-4 w-4" aria-hidden="true" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleThemeChange('default')}>
                      <Sun className="mr-2 h-4 w-4" />
                      Default
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
                      <Moon className="mr-2 h-4 w-4" />
                      Dark
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleThemeChange('forest')}>
                      <Trees className="mr-2 h-4 w-4" />
                      Forest
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleThemeChange('ocean')}>
                      <Waves className="mr-2 h-4 w-4" />
                      Ocean
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Music Player Row - Always visible on /app route */}
            {showMusicAndTemplate && onMusicToggle && (
              <MusicPlayer
                selectedTrack={selectedTrack}
                volume={volume}
                isMusicPlaying={isMusicPlaying}
                onTrackSelect={onTrackSelect!}
                onVolumeChange={onVolumeChange!}
                onPlayToggle={onMusicToggle}
                className="w-full"
              />
            )}

            {/* Formatting Controls Row - Only visible when editing */}
            {isEditing && (
              renderFormattingControls({
                className: 'flex flex-wrap items-center gap-2',
                showDividers: false,
                badgeClassName: 'w-full mt-2 flex justify-center text-center'
              })
            )}
          </div>
        </div>
      </header>
    </TooltipProvider>
  )
}
