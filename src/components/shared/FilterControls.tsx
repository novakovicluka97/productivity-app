'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface FilterState {
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  type: 'all' | 'session' | 'break';
  status: 'all' | 'completed' | 'incomplete';
  duration: 'all' | 'short' | 'medium' | 'long';
}

interface FilterControlsProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
}

export function FilterControls({ filters, onChange, onClear }: FilterControlsProps) {
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);

  const hasActiveFilters =
    filters.dateFrom ||
    filters.dateTo ||
    filters.type !== 'all' ||
    filters.status !== 'all' ||
    filters.duration !== 'all';

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        {/* Date From */}
        <Popover open={isFromOpen} onOpenChange={setIsFromOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[200px] justify-start text-left font-normal',
                !filters.dateFrom && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateFrom ? format(filters.dateFrom, 'MMM dd, yyyy') : 'From date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.dateFrom}
              onSelect={(date) => {
                updateFilter('dateFrom', date);
                setIsFromOpen(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Date To */}
        <Popover open={isToOpen} onOpenChange={setIsToOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[200px] justify-start text-left font-normal',
                !filters.dateTo && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateTo ? format(filters.dateTo, 'MMM dd, yyyy') : 'To date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.dateTo}
              onSelect={(date) => {
                updateFilter('dateTo', date);
                setIsToOpen(false);
              }}
              disabled={(date) =>
                filters.dateFrom ? date < filters.dateFrom : false
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Type */}
        <Select
          value={filters.type}
          onValueChange={(value) =>
            updateFilter('type', value as FilterState['type'])
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="session">Sessions</SelectItem>
            <SelectItem value="break">Breaks</SelectItem>
          </SelectContent>
        </Select>

        {/* Status */}
        <Select
          value={filters.status}
          onValueChange={(value) =>
            updateFilter('status', value as FilterState['status'])
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="incomplete">Incomplete</SelectItem>
          </SelectContent>
        </Select>

        {/* Duration */}
        <Select
          value={filters.duration}
          onValueChange={(value) =>
            updateFilter('duration', value as FilterState['duration'])
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Durations</SelectItem>
            <SelectItem value="short">Short (&lt;15m)</SelectItem>
            <SelectItem value="medium">Medium (15-45m)</SelectItem>
            <SelectItem value="long">Long (&gt;45m)</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear all
          </Button>
        )}
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters</span>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="gap-2 h-8"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Date From */}
          <Popover open={isFromOpen} onOpenChange={setIsFromOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'justify-start text-left font-normal',
                  !filters.dateFrom && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateFrom ? format(filters.dateFrom, 'MMM dd') : 'From'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateFrom}
                onSelect={(date) => {
                  updateFilter('dateFrom', date);
                  setIsFromOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Date To */}
          <Popover open={isToOpen} onOpenChange={setIsToOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'justify-start text-left font-normal',
                  !filters.dateTo && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateTo ? format(filters.dateTo, 'MMM dd') : 'To'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateTo}
                onSelect={(date) => {
                  updateFilter('dateTo', date);
                  setIsToOpen(false);
                }}
                disabled={(date) =>
                  filters.dateFrom ? date < filters.dateFrom : false
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {/* Type */}
          <Select
            value={filters.type}
            onValueChange={(value) =>
              updateFilter('type', value as FilterState['type'])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="session">Sessions</SelectItem>
              <SelectItem value="break">Breaks</SelectItem>
            </SelectContent>
          </Select>

          {/* Status */}
          <Select
            value={filters.status}
            onValueChange={(value) =>
              updateFilter('status', value as FilterState['status'])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="incomplete">Incomplete</SelectItem>
            </SelectContent>
          </Select>

          {/* Duration */}
          <Select
            value={filters.duration}
            onValueChange={(value) =>
              updateFilter('duration', value as FilterState['duration'])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Durations</SelectItem>
              <SelectItem value="short">Short (&lt;15m)</SelectItem>
              <SelectItem value="medium">Medium (15-45m)</SelectItem>
              <SelectItem value="long">Long (&gt;45m)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
