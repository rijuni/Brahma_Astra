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
    <div className="glass-card flex flex-col h-full overflow-hidden p-3.5" style={{ borderRadius: 'var(--radius-lg)' }}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <div className="flex items-center gap-2.5">
          <History size={16} color="var(--brand-gold)" />
          <span style={{ fontSize: '12.5px', fontWeight: 600 }}>Task & Session History</span>
          <Badge variant="cyan" style={{ padding: '4px 8px', fontSize: '11px' }}>{filtered.length} Sessions</Badge>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportHistory}
            className="glass-btn-ghost flex items-center gap-1.5 text-muted hover:text-white"
            style={{ fontSize: '11.5px', height: '28px', padding: '0 10px', borderRadius: '6px' }}
            title="Export History JSON"
          >
            <Download size={13} color="var(--brand-gold)" /> Export JSON
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="glass-input flex items-center gap-2 mb-2.5" style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
        <Search size={13} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Search past instructions or tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ background: 'transparent', border: 'none', outline: 'none', color: '#FFF', fontSize: '12px', width: '100%' }}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="glass-btn-ghost" style={{ padding: '2px' }}>
            <X size={12} color="var(--text-muted)" />
          </button>
        )}
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-muted body-small" style={{ fontSize: '12px' }}>
            No sessions match "{searchTerm}"
          </div>
        ) : (
          filtered.map((t) => (
            <div
              key={t.id}
              className="flex flex-col p-3 rounded-md transition-all"
              style={{
                background: 'rgba(7, 10, 24, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {t.title || 'Coding Task'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-muted" style={{ fontSize: '10.5px' }}>{t.timestamp}</span>
                  <Badge variant={t.status === 'completed' ? 'cyan' : 'gold'} style={{ padding: '3px 7px', fontSize: '10.5px' }}>{t.status}</Badge>
                </div>
              </div>

              <p className="body-small text-secondary mb-2" style={{ fontSize: '12px', lineHeight: '1.45' }}>
                {t.instruction}
              </p>

              {onRestoreTask && (
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      onRestoreTask(t);
                      addToast(`Restored task "${t.title || t.id}" into active studio`, 'info');
                    }}
                    className="glass-btn-ghost body-small flex items-center gap-1.5 hover:text-white"
                    style={{ height: '28px', padding: '0 10px', fontSize: '11.5px', color: 'var(--brand-gold)', borderRadius: '5px' }}
                  >
                    <RotateCcw size={12} />
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
