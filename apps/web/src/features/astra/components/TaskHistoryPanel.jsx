import React, { useState } from 'react';
import {
  History,
  CheckCircle2,
  RotateCcw,
  FileDiff,
  Search,
  Download,
  Trash2,
  X
} from 'lucide-react';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { useToast } from '../../../components/feedback/Toast';

export default function TaskHistoryPanel({ tasks = [], onRestoreTask }) {
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();

  const sampleHistory = [
    {
      id: 'task-101',
      title: 'FastAPI Patient ID Endpoint',
      instruction: 'Create a FastAPI endpoint to get patient details by ID with proper error handling and response model.',
      status: 'completed',
      timestamp: 'Today, 2:15 PM'
    },
    {
      id: 'task-102',
      title: 'Vitals Pydantic Schema',
      instruction: 'Add Pydantic schema for patient vital signs with systolic and diastolic validation.',
      status: 'completed',
      timestamp: 'Today, 1:40 PM'
    },
    {
      id: 'task-103',
      title: 'PostgreSQL Audit Migration',
      instruction: 'Generate schema migration adding indexes on audit log created_at timestamp.',
      status: 'approved',
      timestamp: 'Yesterday, 5:30 PM'
    }
  ];

  const allTasks = tasks.length > 0 ? tasks : sampleHistory;

  const filtered = allTasks.filter((t) =>
    (t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.instruction || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportHistory = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allTasks, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', `astra-task-history-${Date.now()}.json`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
    addToast('Exported task session history JSON', 'info');
  };

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden p-3" style={{ borderRadius: 'var(--radius-md)' }}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <div className="flex items-center gap-2">
          <History size={15} color="var(--brand-gold)" />
          <span style={{ fontSize: '12px', fontWeight: 600 }}>Task & Session History</span>
          <Badge variant="cyan" size="small">{filtered.length} Sessions</Badge>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportHistory}
            className="glass-btn-ghost flex items-center gap-1 text-muted hover:text-white"
            style={{ fontSize: '10px', padding: '2px 6px' }}
            title="Export History JSON"
          >
            <Download size={11} color="var(--brand-gold)" /> Export JSON
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="glass-input flex items-center gap-2 mb-2" style={{ padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>
        <Search size={11} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Search past instructions or tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ background: 'transparent', border: 'none', outline: 'none', color: '#FFF', fontSize: '11px', width: '100%' }}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="glass-btn-ghost" style={{ padding: '2px' }}>
            <X size={10} color="var(--text-muted)" />
          </button>
        )}
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-muted body-small" style={{ fontSize: '11px' }}>
            No sessions match "{searchTerm}"
          </div>
        ) : (
          filtered.map((t) => (
            <div
              key={t.id}
              className="flex flex-col p-2.5 rounded transition-all"
              style={{
                background: 'rgba(7, 10, 24, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.04)'
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {t.title || 'Coding Task'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-muted" style={{ fontSize: '10px' }}>{t.timestamp}</span>
                  <Badge variant={t.status === 'completed' ? 'cyan' : 'gold'} size="small">{t.status}</Badge>
                </div>
              </div>

              <p className="body-small text-secondary mb-2" style={{ fontSize: '11px', lineHeight: '1.4' }}>
                {t.instruction}
              </p>

              {onRestoreTask && (
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      onRestoreTask(t);
                      addToast(`Restored task "${t.title || t.id}" into active studio`, 'info');
                    }}
                    className="glass-btn-ghost body-small flex items-center gap-1 hover:text-white"
                    style={{ padding: '2px 8px', fontSize: '10px', color: 'var(--brand-gold)' }}
                  >
                    <RotateCcw size={10} />
                    <span>Restore Session</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
