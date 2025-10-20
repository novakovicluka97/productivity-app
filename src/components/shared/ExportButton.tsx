'use client';

import { useState, useEffect } from 'react';
import { Download, FileText, FileJson, FileType } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/useToast';
import { exportToCSV, exportToJSON, exportToPDF } from '@/lib/utils/exportHelpers';
import type { Database } from '@/types/supabase'

type Session = Database['public']['Tables']['sessions']['Row'];

interface ExportButtonProps {
  sessions: Session[];
  dateRange?: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

export function ExportButton({ sessions, dateRange }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { showToast } = useToast();

  // Keyboard shortcut (Cmd/Ctrl + E)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        // Focus the dropdown trigger
        document.getElementById('export-button')?.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
    setIsExporting(true);

    try {
      switch (format) {
        case 'csv':
          exportToCSV(sessions, dateRange);
          break;
        case 'json':
          exportToJSON(sessions, dateRange);
          break;
        case 'pdf':
          exportToPDF(sessions, dateRange);
          break;
      }

      showToast({
        title: 'Export successful',
        description: `Your data has been exported as ${format.toUpperCase()}.`,
        type: 'success',
      });
    } catch (error) {
      console.error('Export error:', error);
      showToast({
        title: 'Export failed',
        description: 'There was an error exporting your data. Please try again.',
        type: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          id="export-button"
          variant="outline"
          className="gap-2"
          disabled={isExporting || sessions.length === 0}
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export'}
          <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:flex">
            <span className="text-xs">{navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}</span>E
          </kbd>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('csv')} className="gap-2">
          <FileText className="h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')} className="gap-2">
          <FileJson className="h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')} className="gap-2">
          <FileType className="h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
