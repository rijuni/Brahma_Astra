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

  const allTasks = tasks;

  const filtered = allTasks.filter((t) =>
    (t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.instruction || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportHistory = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allTasks, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', `edith-task-history-${Date.now()}.json`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
    addToast('Exported task session history JSON', 'info');
  };

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden p-4" style={{ borderRadius: 'var(--radius-lg)' }}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <div className="flex items-center gap-2.5">
          <History size={18} color="#38BDF8" />
          <span style={{ fontSize: '16px', fontWeight: 600 }}>Task & Session History</span>
          <Badge variant="cyan" style={{ padding: '4px 10px', fontSize: '13px' }}>{filtered.length} Sessions</Badge>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportHistory}
            className="glass-btn-ghost flex items-center gap-2 text-muted hover:text-white"
            style={{ fontSize: '14px', height: '34px', padding: '0 12px', borderRadius: '6px' }}
            title="Export History JSON"
          >
            <Download size={15} color="#00D2FF" /> Export JSON
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="glass-input flex items-center gap-2.5 mb-3" style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
        <Search size={16} color="var(--text-muted)" />
        <input
          type="text"
          aria-label="Search EDITH task history"
          placeholder="Search past instructions or tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ background: 'transparent', border: 'none', outline: 'none', color: '#FFF', fontSize: '15px', width: '100%' }}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="glass-btn-ghost" style={{ padding: '2px' }}>
            <X size={14} color="var(--text-muted)" />
          </button>
        )}
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-muted body-regular" style={{ fontSize: '14px' }}>
            {searchTerm ? `No sessions match "${searchTerm}".` : 'No EDITH sessions yet. Completed tasks will appear here.'}
          </div>
        ) : (
          filtered.map((t) => (
            <div
              key={t.id}
              className="flex flex-col p-3.5 rounded-md transition-all"
              style={{
                background: 'rgba(7, 10, 24, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {t.title || 'Coding Task'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-muted" style={{ fontSize: '13px' }}>{t.timestamp}</span>
                  <Badge variant="cyan" style={{ padding: '3px 8px', fontSize: '13px' }}>{t.status}</Badge>
                </div>
              </div>

              <p className="body-regular text-secondary mb-2.5" style={{ fontSize: '15px', lineHeight: '1.5' }}>
                {t.instruction}
              </p>

              {onRestoreTask && (
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      onRestoreTask(t);
                      addToast(`Restored task "${t.title || t.id}" into active studio`, 'info');
                    }}
                    className="glass-btn-ghost body-regular flex items-center gap-2 hover:text-white"
                    style={{ height: '34px', padding: '0 12px', fontSize: '14px', color: '#00D2FF', borderRadius: '6px' }}
                  >
                    <RotateCcw size={14} />
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
