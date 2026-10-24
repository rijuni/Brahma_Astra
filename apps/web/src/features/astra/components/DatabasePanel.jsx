import React, { useState, useMemo } from 'react';
import {
  Database,
  Play,
  Table,
  AlertTriangle,
  Check,
  ShieldCheck,
  Download,
  ArrowUpDown,
  FileSpreadsheet,
  Search,
  Sparkles
} from 'lucide-react';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import { useToast } from '../../../components/feedback/Toast';

const SQL_TEMPLATES = [
  { label: 'Select Users', query: 'SELECT id, name, email, role FROM users LIMIT 10;' },
  { label: 'Select Active Projects', query: "SELECT id, name, owner_id, status FROM projects WHERE status = 'active';" },
  { label: 'List Astra Workspaces', query: 'SELECT id, project_id, name, status, created_at FROM astra_workspaces ORDER BY created_at DESC;' },
  { label: 'Patient Vitals Overview', query: "SELECT id, name, age, gender, admission_status FROM patients WHERE admission_status = 'admitted' LIMIT 15;" },
  { label: 'Task Status Aggregates', query: 'SELECT status, COUNT(*) as count FROM coding_tasks GROUP BY status;' }
];

const MOCK_DATASETS = {
  users: {
    columns: ['id', 'name', 'email', 'role', 'created_at'],
    rows: [
      ['471e1a65-37d9', 'BRAHMA Astra Lead Developer', 'developer@brahma-astra.local', 'admin', '2026-10-20 09:30:00'],
      ['928c03e1-88f2', 'Clinical Research Analyst', 'research@brahma-astra.local', 'developer', '2026-10-21 14:15:22'],
      ['104f98a2-cc31', 'Telemetry Systems Lead', 'telemetry@brahma-astra.local', 'developer', '2026-10-22 08:45:10'],
      ['883d11b7-492e', 'Security Operations Officer', 'secops@brahma-astra.local', 'auditor', '2026-10-22 18:20:05']
    ]
  },
  projects: {
    columns: ['id', 'name', 'owner_id', 'status', 'created_at'],
    rows: [
      ['proj-001', 'Clinical Trial Telemetry Service', '471e1a65-37d9', 'active', '2026-10-20 10:00:00'],
      ['proj-002', 'ASTRA Execution Boundary Runner', '471e1a65-37d9', 'active', '2026-10-22 11:30:00'],
      ['proj-003', 'Genomic Data Transformer', '928c03e1-88f2', 'completed', '2026-10-18 16:45:00']
    ]
  },
  astra_workspaces: {
    columns: ['id', 'project_id', 'name', 'status', 'created_at'],
    rows: [
      ['ws-101', 'proj-001', 'Production Service Sandbox', 'active', '2026-10-22 12:00:00'],
      ['ws-102', 'proj-002', 'Runner Integration Suite', 'active', '2026-10-23 09:15:00']
    ]
  },
  coding_tasks: {
    columns: ['id', 'workspace_id', 'instruction', 'status', 'risk_level'],
    rows: [
      ['task-01', 'ws-101', 'Implement structured JSON error response', 'applied', 'low'],
      ['task-02', 'ws-101', 'Add Redis connection pool retry loop', 'applied', 'medium'],
      ['task-03', 'ws-102', 'Enforce strict host command block', 'applied', 'high']
    ]
  },
  patients: {
    columns: ['id', 'name', 'age', 'gender', 'admission_status', 'room'],
    rows: [
      [101, 'Eleanor Vance', 48, 'Female', 'admitted', 'ICU-3'],
      [102, 'Theodora Crain', 34, 'Female', 'admitted', 'Ward-4B'],
      [103, 'Luke Sanderson', 29, 'Male', 'discharged', 'Ward-2A'],
      [104, 'Arthur Hill', 62, 'Male', 'admitted', 'ICU-1'],
      [105, 'Hugh Crain', 71, 'Male', 'outpatient', 'Clinic-A']
    ]
  }
};

export default function DatabasePanel() {
  const [selectedDb, setSelectedDb] = useState('sqlite');
  const [query, setQuery] = useState('SELECT id, name, email, role, created_at FROM users LIMIT 10;');
  const [sortCol, setSortCol] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [queryResult, setQueryResult] = useState({
    columns: MOCK_DATASETS.users.columns,
    rows: MOCK_DATASETS.users.rows,
    executionTime: '8.4ms',
    rowCount: MOCK_DATASETS.users.rows.length
  });
  const [queryError, setQueryError] = useState(null);
  const { addToast } = useToast();

  const dbProfiles = [
    { id: 'sqlite', name: 'SQLite (dev.db)', status: 'Connected', host: 'Local file' },
    { id: 'postgres', name: 'PostgreSQL Prod', status: 'Standby', host: 'aws-rds.internal' },
    { id: 'mysql', name: 'MySQL Analytics', status: 'Standby', host: '10.0.1.42:3306' }
  ];

  const tables = [
    { name: 'users', count: 4, cols: ['id (PK)', 'name', 'email', 'role'] },
    { name: 'projects', count: 3, cols: ['id (PK)', 'name', 'owner_id', 'status'] },
    { name: 'astra_workspaces', count: 2, cols: ['id (PK)', 'project_id', 'name', 'status'] },
    { name: 'coding_tasks', count: 3, cols: ['id (PK)', 'workspace_id', 'instruction', 'status'] },
    { name: 'patients', count: 5, cols: ['id (PK)', 'name', 'age', 'admission_status'] }
  ];

  const handleExecute = (overrideQuery) => {
    const sql = (overrideQuery || query).trim();
    setQueryError(null);

    // Read-only validation
    const upper = sql.toUpperCase();
    if (!upper.startsWith('SELECT') && !upper.startsWith('SHOW') && !upper.startsWith('PRAGMA') && !upper.startsWith('EXPLAIN')) {
      setQueryError('Execution blocked: Read-Only sandbox boundary permits only SELECT queries.');
      return;
    }

    // Determine target table
    let matchedTable = 'users';
    if (/from\s+projects/i.test(sql)) matchedTable = 'projects';
    else if (/from\s+astra_workspaces/i.test(sql)) matchedTable = 'astra_workspaces';
    else if (/from\s+coding_tasks/i.test(sql)) matchedTable = 'coding_tasks';
    else if (/from\s+patients/i.test(sql)) matchedTable = 'patients';

    const dataset = MOCK_DATASETS[matchedTable] || MOCK_DATASETS.users;
    setQueryResult({
      columns: dataset.columns,
      rows: dataset.rows,
      executionTime: `${(Math.random() * 4 + 3).toFixed(1)}ms`,
      rowCount: dataset.rows.length
    });
    setSortCol(null);
    addToast(`Executed query against ${matchedTable}`, 'info');
  };

  const handleSelectTable = (tblName) => {
    const newQuery = `SELECT * FROM ${tblName} LIMIT 25;`;
    setQuery(newQuery);
    handleExecute(newQuery);
  };

  const handleExportCsv = () => {
    if (!queryResult || !queryResult.rows.length) return;
    const header = queryResult.columns.join(',');
    const rows = queryResult.rows.map((r) => r.map((c) => `"${c}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [header, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `query_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    addToast('Exported query results to CSV', 'success');
  };

  const sortedRows = useMemo(() => {
    if (sortCol === null) return queryResult.rows;
    const colIdx = queryResult.columns.indexOf(sortCol);
    if (colIdx === -1) return queryResult.rows;

    return [...queryResult.rows].sort((a, b) => {
      const valA = a[colIdx];
      const valB = b[colIdx];
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [queryResult.rows, queryResult.columns, sortCol, sortAsc]);

  const toggleSort = (col) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(true);
    }
  };

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden p-3" style={{ borderRadius: 'var(--radius-md)' }}>
      {/* DB Connection Bar */}
      <div className="flex items-center justify-between pb-2 mb-2" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <div className="flex items-center gap-2">
          <Database size={15} color="var(--brand-gold)" />
          <span style={{ fontSize: '12px', fontWeight: 600 }}>Active Database:</span>
          <select
            value={selectedDb}
            onChange={(e) => setSelectedDb(e.target.value)}
            className="glass-input"
            style={{ padding: '2px 8px', fontSize: '11px', borderRadius: '4px' }}
          >
            {dbProfiles.map((p) => (
              <option key={p.id} value={p.id} style={{ background: '#0B0F1A' }}>
                {p.name} ({p.status})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="cyan" size="small">SSL VERIFIED</Badge>
          <Badge variant="gold" size="small">READ-ONLY SANDBOX</Badge>
        </div>
      </div>

      {/* Main Grid: Schema Explorer + SQL Query & Grid */}
      <div className="grid grid-cols-3 gap-3 flex-1 overflow-hidden">
        {/* Left: Schema Tables Tree */}
        <div className="flex flex-col gap-1 overflow-y-auto" style={{ borderRight: '1px solid rgba(255, 255, 255, 0.05)', paddingRight: '8px' }}>
          <div className="flex items-center justify-between mb-1">
            <span className="body-small text-muted" style={{ fontSize: '10px', fontWeight: 600 }}>SCHEMA TABLES</span>
            <span className="text-muted" style={{ fontSize: '10px' }}>Click to query</span>
          </div>
          {tables.map((t) => (
            <div
              key={t.name}
              onClick={() => handleSelectTable(t.name)}
              className="flex flex-col p-2 mb-1 rounded cursor-pointer transition-all hover:bg-white/5"
              style={{
                background: 'rgba(7, 10, 24, 0.4)',
                border: '1px solid var(--glass-border)'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Table size={12} color="var(--brand-cyan)" />
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</span>
                </div>
                <span className="code-inline" style={{ fontSize: '9px' }}>{t.count} rows</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {t.cols.map((col) => (
                  <span key={col} className="text-muted" style={{ fontSize: '9px', background: 'rgba(255,255,255,0.03)', padding: '1px 4px', borderRadius: '2px' }}>
                    {col}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right: SQL Query Editor & Result Grid */}
        <div className="col-span-2 flex flex-col gap-2 overflow-hidden">
          {/* Query Editor & Templates */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="body-small text-muted" style={{ fontSize: '10px', fontWeight: 600 }}>SQL QUERY</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      setQuery(e.target.value);
                      handleExecute(e.target.value);
                    }
                  }}
                  className="glass-input"
                  style={{ padding: '1px 6px', fontSize: '10px', borderRadius: '3px' }}
                >
                  <option value="">Query Templates...</option>
                  {SQL_TEMPLATES.map((tmpl) => (
                    <option key={tmpl.label} value={tmpl.query} style={{ background: '#0B0F1A' }}>
                      {tmpl.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="gold"
                  icon={Play}
                  onClick={() => handleExecute()}
                  style={{ padding: '3px 10px', fontSize: '11px' }}
                >
                  Execute
                </Button>
              </div>
            </div>

            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={2}
              className="glass-input p-2 outline-none"
              style={{
                fontFamily: 'var(--font-code)',
                fontSize: '11px',
                borderRadius: '4px',
                background: 'rgba(7, 10, 24, 0.5)'
              }}
            />
          </div>

          {/* Query Error State */}
          {queryError && (
            <div
              className="flex items-center gap-2 p-2 rounded animate-entrance"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: 'var(--status-error)',
                fontSize: '11px'
              }}
            >
              <AlertTriangle size={13} />
              <span>{queryError}</span>
            </div>
          )}

          {/* Results Grid */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <span className="body-small text-muted" style={{ fontSize: '10px' }}>
                Results: {queryResult.rowCount} rows ({queryResult.executionTime})
              </span>
              <button
                onClick={handleExportCsv}
                className="glass-btn-ghost flex items-center gap-1 body-small text-muted hover:text-white"
                style={{ padding: '1px 6px', fontSize: '10px' }}
                title="Download CSV"
              >
                <Download size={11} color="var(--brand-gold)" /> Export CSV
              </button>
            </div>

            <div className="flex-1 overflow-auto" style={{ background: 'rgba(7, 10, 24, 0.6)', borderRadius: '4px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.03)' }}>
                    <th style={{ width: '30px', padding: '5px 8px', color: 'var(--text-muted)' }}>#</th>
                    {queryResult.columns.map((col) => (
                      <th
                        key={col}
                        onClick={() => toggleSort(col)}
                        className="cursor-pointer select-none hover:text-white transition-colors"
                        style={{ textAlign: 'left', padding: '5px 8px', color: 'var(--brand-gold-light)', fontWeight: 600 }}
                      >
                        <div className="flex items-center gap-1">
                          <span>{col}</span>
                          {sortCol === col ? (
                            <span style={{ fontSize: '9px' }}>{sortAsc ? '▲' : '▼'}</span>
                          ) : (
                            <ArrowUpDown size={9} style={{ opacity: 0.3 }} />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedRows.map((row, rIdx) => (
                    <tr key={rIdx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '4px 8px', color: 'var(--text-muted)', fontSize: '10px' }}>{rIdx + 1}</td>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} style={{ padding: '4px 8px', color: 'var(--text-secondary)', fontFamily: 'var(--font-code)' }}>
                          {String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
