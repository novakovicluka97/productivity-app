import { format } from 'date-fns';
import type { Session } from '@/lib/supabase/types';

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

/**
 * Format session data for export
 */
export function formatSessionData(session: Session) {
  return {
    date: format(new Date(session.session_date), 'MMM dd, yyyy'),
    type: session.type.charAt(0).toUpperCase() + session.type.slice(1),
    duration: session.duration,
    timeSpent: Math.floor(session.time_spent / 60), // Convert to minutes
    timeSpentSeconds: session.time_spent,
    completed: session.is_completed ? 'Yes' : 'No',
    content: session.content?.replace(/<[^>]*>/g, '') || '', // Strip HTML tags
    tasks: session.tasks?.map(t => `${t.completed ? '[✓]' : '[ ]'} ${t.text}`).join('; ') || '',
    taskCount: session.tasks?.length || 0,
    completedTasks: session.tasks?.filter(t => t.completed).length || 0,
  };
}

/**
 * Calculate summary statistics
 */
function calculateSummary(sessions: Session[]) {
  const total = sessions.length;
  const completed = sessions.filter(s => s.is_completed).length;
  const totalTimeSpent = sessions.reduce((sum, s) => sum + s.time_spent, 0);
  const totalSessions = sessions.filter(s => s.type === 'session').length;
  const totalBreaks = sessions.filter(s => s.type === 'break').length;

  return {
    total,
    completed,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    totalTimeSpent,
    totalTimeSpentFormatted: formatDuration(totalTimeSpent),
    totalSessions,
    totalBreaks,
  };
}

/**
 * Format duration in seconds to human-readable string
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Export sessions to CSV format
 */
export function exportToCSV(sessions: Session[], dateRange?: DateRange) {
  const headers = [
    'Date',
    'Type',
    'Duration (min)',
    'Time Spent (min)',
    'Completed',
    'Content',
    'Tasks',
    'Total Tasks',
    'Completed Tasks',
  ];

  const rows = sessions.map(session => {
    const data = formatSessionData(session);
    return [
      data.date,
      data.type,
      data.duration,
      data.timeSpent,
      data.completed,
      `"${data.content.replace(/"/g, '""')}"`, // Escape quotes
      `"${data.tasks.replace(/"/g, '""')}"`, // Escape quotes
      data.taskCount,
      data.completedTasks,
    ];
  });

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  const filename = dateRange?.from && dateRange?.to
    ? `sessions_${format(dateRange.from, 'yyyy-MM-dd')}_to_${format(dateRange.to, 'yyyy-MM-dd')}.csv`
    : `sessions_${format(new Date(), 'yyyy-MM-dd')}.csv`;

  downloadFile(csv, filename, 'text/csv');
}

/**
 * Export sessions to JSON format
 */
export function exportToJSON(sessions: Session[], dateRange?: DateRange) {
  const summary = calculateSummary(sessions);

  const data = {
    exported_at: new Date().toISOString(),
    date_range: dateRange
      ? {
          from: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null,
          to: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : null,
        }
      : null,
    summary: {
      total_sessions: summary.total,
      completed_sessions: summary.completed,
      completion_rate: summary.completionRate,
      total_time_spent_seconds: summary.totalTimeSpent,
      total_time_spent: summary.totalTimeSpentFormatted,
      sessions_count: summary.totalSessions,
      breaks_count: summary.totalBreaks,
    },
    sessions: sessions.map(session => ({
      id: session.id,
      date: session.session_date,
      type: session.type,
      duration_minutes: session.duration,
      time_spent_seconds: session.time_spent,
      is_completed: session.is_completed,
      content: session.content,
      tasks: session.tasks,
      created_at: session.created_at,
      updated_at: session.updated_at,
    })),
  };

  const json = JSON.stringify(data, null, 2);

  const filename = dateRange?.from && dateRange?.to
    ? `sessions_${format(dateRange.from, 'yyyy-MM-dd')}_to_${format(dateRange.to, 'yyyy-MM-dd')}.json`
    : `sessions_${format(new Date(), 'yyyy-MM-dd')}.json`;

  downloadFile(json, filename, 'application/json');
}

/**
 * Export sessions to PDF format (simple text-based)
 */
export function exportToPDF(sessions: Session[], dateRange?: DateRange) {
  const summary = calculateSummary(sessions);

  // Create a simple HTML structure for PDF
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Session-Break Productivity Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      color: #4f46e5;
      border-bottom: 3px solid #4f46e5;
      padding-bottom: 10px;
    }
    h2 {
      color: #6366f1;
      margin-top: 30px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 5px;
    }
    .summary {
      background: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .summary-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #d1d5db;
    }
    .summary-item:last-child {
      border-bottom: none;
    }
    .session {
      border-left: 4px solid #4f46e5;
      padding: 15px;
      margin: 15px 0;
      background: #f9fafb;
    }
    .break {
      border-left: 4px solid #10b981;
      padding: 15px;
      margin: 15px 0;
      background: #f9fafb;
    }
    .session-header {
      display: flex;
      justify-content: space-between;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .session-content {
      color: #374151;
      margin: 10px 0;
      line-height: 1.5;
    }
    .tasks {
      margin-top: 10px;
      padding: 10px;
      background: white;
      border-radius: 4px;
    }
    .task {
      padding: 4px 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <h1>Session-Break Productivity Report</h1>
  <p><strong>Exported:</strong> ${format(new Date(), 'MMMM dd, yyyy - HH:mm')}</p>
  ${dateRange?.from && dateRange?.to ? `
  <p><strong>Date Range:</strong> ${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}</p>
  ` : ''}

  <div class="summary">
    <h2>Summary</h2>
    <div class="summary-item">
      <span>Total Sessions:</span>
      <strong>${summary.total}</strong>
    </div>
    <div class="summary-item">
      <span>Completed:</span>
      <strong>${summary.completed} (${summary.completionRate}%)</strong>
    </div>
    <div class="summary-item">
      <span>Total Time Spent:</span>
      <strong>${summary.totalTimeSpentFormatted}</strong>
    </div>
    <div class="summary-item">
      <span>Sessions:</span>
      <strong>${summary.totalSessions}</strong>
    </div>
    <div class="summary-item">
      <span>Breaks:</span>
      <strong>${summary.totalBreaks}</strong>
    </div>
  </div>

  <h2>Session Details</h2>
  ${sessions.map(session => {
    const data = formatSessionData(session);
    return `
    <div class="${session.type}">
      <div class="session-header">
        <span>${data.type} - ${data.date}</span>
        <span>${data.completed === 'Yes' ? '✓ Completed' : '○ Incomplete'}</span>
      </div>
      <div>
        <strong>Duration:</strong> ${data.duration} min |
        <strong>Time Spent:</strong> ${data.timeSpent} min
      </div>
      ${data.content ? `
      <div class="session-content">
        ${data.content}
      </div>
      ` : ''}
      ${session.tasks && session.tasks.length > 0 ? `
      <div class="tasks">
        <strong>Tasks (${data.completedTasks}/${data.taskCount}):</strong>
        ${session.tasks.map(task => `
        <div class="task">${task.completed ? '✓' : '○'} ${task.text}</div>
        `).join('')}
      </div>
      ` : ''}
    </div>
    `;
  }).join('')}

  <div class="footer">
    <p>Generated by Session-Break Productivity App</p>
  </div>
</body>
</html>
  `;

  // Convert HTML to PDF-like format using print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content to load, then trigger print dialog
    printWindow.onload = () => {
      printWindow.print();
      // Close window after print dialog is closed (user-initiated)
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };
  }
}

/**
 * Trigger file download
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
