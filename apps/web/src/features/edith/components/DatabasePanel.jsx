import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Info,
  Clock,
  Layers
} from 'lucide-react';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import { useToast } from '../../../components/feedback/Toast';
import { edithDbService } from '../../../services/edith/edith-db-service';

export default function DatabasePanel({ projectId = null, activeProject = null }) {
  const [databases, setDatabases] = useState([]);
  const [isLoadingDatabases, setIsLoadingDatabases] = useState(true);
  const [selectedDb, setSelectedDb] = useState('');
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableSearch, setTableSearch] = useState('');
  const [activeTab, setActiveTab] = useState('records'); // 'records' | 'schema'

  // Query State
  const [query, setQuery] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryResult, setQueryResult] = useState({
    columns: [],
    rows: [],
    executionTimeMs: 0,
    rowCount: 0
  });
  const [queryError, setQueryError] = useState(null);

  // Pagination & Schema State
  const [tableSchema, setTableSchema] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);

  // Sorting
  const [sortCol, setSortCol] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  const { addToast } = useToast();
  const effectiveProjectId = projectId || activeProject?.id || '';

  // 1. Load available databases
  useEffect(() => {
    let mounted = true;
    async function loadDatabases() {
      if (!effectiveProjectId) {
        setDatabases([]);
        setSelectedDb('');
        setIsLoadingDatabases(false);
        return;
      }
      setIsLoadingDatabases(true);
      try {
        const res = await edithDbService.getDatabases(effectiveProjectId);
        if (mounted && res?.databases) {
          setDatabases(res.databases);
          const selectionExists = res.databases.some((db) => db.id === selectedDb);
          if (!selectionExists) setSelectedDb(res.databases[0]?.id || '');
        }
      } catch (err) {
        console.warn('Failed to load databases:', err);
        if (mounted) {
          setDatabases([]);
          setSelectedDb('');
        }
      } finally {
        if (mounted) setIsLoadingDatabases(false);
      }
    }
    loadDatabases();
    return () => {
      mounted = false;
    };
  }, [effectiveProjectId]);

  useEffect(() => {
    setTables([]);
    setSelectedTable(null);
    setTableSchema(null);
  }, [effectiveProjectId]);

  // 2. Load tables when database changes
  const loadTables = useCallback(async () => {
    if (!effectiveProjectId || !selectedDb) {
      setTables([]);
      setSelectedTable(null);
      return;
    }
    try {
      const res = await edithDbService.getTables(effectiveProjectId, selectedDb);
      if (res?.tables) {
        setTables(res.tables);
        if (res.tables.length > 0 && !selectedTable) {
          // Select first real table
          handleSelectTable(res.tables[0].name);
        }
      }
    } catch (err) {
      console.warn('Failed to load tables:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to list tables';
      setQueryError(msg);
    }
  }, [effectiveProjectId, selectedDb, selectedTable]);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  // 3. Load records and schema for selected table
  const loadTableData = useCallback(
    async (tableName, targetPage = 1) => {
      if (!effectiveProjectId || !tableName) return;
      setIsLoadingRecords(true);
      setQueryError(null);

      try {
        // Fetch schema
        const schemaRes = await edithDbService.getTableSchema(effectiveProjectId, tableName, selectedDb);
        setTableSchema(schemaRes);

        // Fetch records
        const recordsRes = await edithDbService.getTableRecords(
          effectiveProjectId,
          tableName,
          targetPage,
          limit,
          selectedDb
        );

        if (recordsRes) {
          setPage(recordsRes.page);
          setTotalRecords(recordsRes.total);
          setTotalPages(recordsRes.totalPages);
          setQueryResult({
            columns: recordsRes.columns || [],
            rows: recordsRes.rows || [],
            executionTimeMs: recordsRes.executionTimeMs || 0,
            rowCount: recordsRes.rows?.length || 0
          });
        }
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Failed to load table records';
        setQueryError(msg);
      } finally {
        setIsLoadingRecords(false);
      }
    },
    [effectiveProjectId, selectedDb, limit]
  );

  const handleSelectTable = (tblName) => {
    setSelectedTable(tblName);
    setPage(1);
    setQuery(`SELECT * FROM "${tblName}" LIMIT 50`);
    loadTableData(tblName, 1);
  };

  // Execute arbitrary read-only query
  const handleExecute = async (overrideQuery) => {
    const sqlToRun = (overrideQuery || query).trim();
    if (!sqlToRun) return;

    setIsExecuting(true);
    setQueryError(null);

    try {
      const res = await edithDbService.executeQuery(effectiveProjectId, sqlToRun, selectedDb, 100);
      setQueryResult({
        columns: res.columns || [],
        rows: res.rows || [],
        executionTimeMs: res.executionTimeMs || 0,
        rowCount: res.rowCount || 0
      });
      addToast(`Query executed (${res.rowCount} rows in ${res.executionTimeMs}ms)`, 'success');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Query execution failed or violated read-only policy.';
      setQueryError(msg);
      addToast(msg, 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  // Sort rows in memory
  const toggleSort = (col) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(true);
    }
  };
  const handleSort = toggleSort;

  const processedRows = useMemo(() => {
    if (!queryResult.rows || !sortCol) return queryResult.rows || [];
    return [...queryResult.rows].sort((a, b) => {
      const valA = typeof a === 'object' && a !== null ? a[sortCol] : a;
      const valB = typeof b === 'object' && b !== null ? b[sortCol] : b;
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      if (sortAsc) return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });
  }, [queryResult.rows, sortCol, sortAsc]);

  // Export CSV
  const handleExportCSV = () => {
    if (!queryResult.columns?.length || !queryResult.rows?.length) {
      addToast('No data available to export', 'info');
      return;
    }

    try {
      const headers = queryResult.columns.join(',');
      const rowsCsv = queryResult.rows.map((row) => {
        return queryResult.columns
          .map((col) => {
            const val = row[col] !== undefined && row[col] !== null ? String(row[col]) : '';
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(',');
      });

      const csvContent = [headers, ...rowsCsv].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedTable || 'query_results'}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast('CSV exported successfully', 'success');
    } catch (err) {
      addToast('Failed to export CSV', 'error');
    }
  };
  const handleExportCsv = handleExportCSV;

  const filteredTables = useMemo(() => {
    if (!tableSearch.trim()) return tables;
    return tables.filter((t) => t.name.toLowerCase().includes(tableSearch.toLowerCase()));
  }, [tables, tableSearch]);

  const SQL_TEMPLATES = selectedTable ? [
    { label: 'First 10 rows', query: `SELECT * FROM "${selectedTable}" LIMIT 10` },
    { label: 'Count rows', query: `SELECT COUNT(*) AS total FROM "${selectedTable}"` }
  ] : [];

  if (isLoadingDatabases || !effectiveProjectId || databases.length === 0) {
    return (
      <div className="edith-db-empty-state" role="status">
        <Database size={24} aria-hidden="true" />
        <div>
          <strong>{isLoadingDatabases ? 'Loading databases' : effectiveProjectId ? 'No workspace database found' : 'Select a workspace'}</strong>
          <p>{isLoadingDatabases
            ? 'Checking the connected workspace.'
            : effectiveProjectId
            ? 'Place a SQLite database inside this workspace to inspect its tables and records.'
            : 'Choose a connected workspace to see databases stored within it.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden p-4" style={{ borderRadius: 'var(--radius-lg)' }}>
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-3 mb-3" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <div className="flex items-center gap-3">
          <Database size={18} color="#00D2FF" />
          <span style={{ fontSize: '15px', fontWeight: 600 }}>Database:</span>
          <select
            value={selectedDb}
            disabled={databases.length === 0}
            onChange={(e) => {
              setSelectedDb(e.target.value);
              setSelectedTable(null);
            }}
            className="glass-input"
            style={{ height: '38px', padding: '0 12px', fontSize: '15px', borderRadius: '6px', color: '#00D2FF' }}
          >
            {databases.map((db) => (
              <option key={db.id} value={db.id} style={{ background: '#0B0F1A' }}>
                SQLite: {db.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="cyan" style={{ padding: '4px 10px', fontSize: '13px' }}>
            <ShieldCheck size={14} className="inline mr-1" />
            READ-ONLY ENFORCED
          </Badge>
          <Button
            variant="ghost"
            size="small"
            onClick={handleExportCSV}
            disabled={!queryResult.rows?.length}
            style={{ height: '34px', padding: '0 12px', fontSize: '14px', borderRadius: '6px' }}
          >
            <Download size={14} className="inline mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Main Grid: Left Tables Sidebar (260px) + Right Query & Results (1fr) */}
      <div className="edith-db-main-grid grid grid-cols-[260px_minmax(0,1fr)] gap-4 flex-1 overflow-hidden">
        {/* Left Sidebar: Tables */}
        <div className="flex flex-col gap-2 overflow-hidden" style={{ borderRight: '1px solid var(--glass-border)', paddingRight: '12px' }}>
          <div className="flex items-center gap-2">
            <Search size={15} color="var(--text-muted)" />
            <input
              type="text"
              aria-label="Filter database tables"
              placeholder="Filter tables..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="glass-input flex-1"
              style={{ height: '34px', padding: '0 8px', fontSize: '14px', borderRadius: '4px' }}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="body-small text-muted" style={{ fontSize: '13px', fontWeight: 600 }}>
              TABLES ({filteredTables.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1">
            {filteredTables.map((tbl) => {
              const isSelected = selectedTable === tbl.name;
              return (
                <button
                  key={tbl.name}
                  onClick={() => handleSelectTable(tbl.name)}
                  className={`flex items-center justify-between p-2 rounded text-left transition-all ${
                    isSelected ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300' : 'hover:bg-white/5 text-secondary'
                  }`}
                  style={{ fontSize: '14px' }}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Table size={15} color={isSelected ? '#00D2FF' : 'var(--text-muted)'} />
                    <span className="font-mono truncate">{tbl.name}</span>
                  </div>
                  {tbl.rowCount >= 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-muted">
                      {tbl.rowCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Main Content */}
        <div className="flex flex-col gap-3 overflow-hidden">
          {/* Query Input Section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="body-small text-muted" style={{ fontSize: '13px', fontWeight: 600 }}>
                  READ-ONLY SQL EDITOR
                </span>
                <span className="text-xs text-muted">(SELECT queries only)</span>
              </div>
              {/* Quick Templates */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-xs text-muted">Templates:</span>
                {SQL_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.label}
                    onClick={() => {
                      setQuery(tmpl.query);
                      handleExecute(tmpl.query);
                    }}
                    className="text-xs px-2 py-0.5 rounded bg-white/5 hover:bg-cyan-500/20 text-muted hover:text-cyan-300 transition-colors"
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={3}
                className="glass-input w-full font-mono"
                style={{
                  padding: '10px 12px',
                  fontSize: '14.5px',
                  lineHeight: '1.5',
                  borderRadius: '6px',
                  color: '#E0F2FE',
                  resize: 'none',
                  background: 'rgba(7, 10, 18, 0.75)'
                }}
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <Button
                  variant="cyan"
                  size="small"
                  onClick={() => handleExecute()}
                  disabled={isExecuting || !query.trim()}
                  style={{ height: '32px', padding: '0 14px', fontSize: '13.5px', fontWeight: 600 }}
                >
                  <Play size={13} className="inline mr-1" />
                  Run
                </Button>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {queryError && (
            <div
              className="flex items-center gap-2 p-3 rounded"
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#FCA5A5',
                fontSize: '14px'
              }}
            >
              <AlertTriangle size={18} className="flex-shrink-0" color="#F87171" />
              <span>{queryError}</span>
            </div>
          )}

          {/* Table / Results Header Bar */}
          <div className="flex items-center justify-between pb-1" style={{ borderBottom: '1px solid var(--glass-border)' }}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('records')}
                className={`flex items-center gap-1.5 pb-1 px-1 transition-colors ${
                  activeTab === 'records'
                    ? 'border-b-2 border-cyan-400 text-cyan-300 font-semibold'
                    : 'text-muted hover:text-white'
                }`}
                style={{ fontSize: '14px' }}
              >
                <Table size={15} />
                <span>Records ({queryResult.rowCount})</span>
              </button>

              {tableSchema && (
                <button
                  onClick={() => setActiveTab('schema')}
                  className={`flex items-center gap-1.5 pb-1 px-1 transition-colors ${
                    activeTab === 'schema'
                      ? 'border-b-2 border-cyan-400 text-cyan-300 font-semibold'
                      : 'text-muted hover:text-white'
                  }`}
                  style={{ fontSize: '14px' }}
                >
                  <Layers size={15} />
                  <span>Schema ({tableSchema.columns?.length || 0} columns)</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 text-muted" style={{ fontSize: '13px' }}>
              <span className="flex items-center gap-1">
                <Clock size={13} />
                {queryResult.executionTimeMs}ms
              </span>
              {selectedTable && (
                <div className="flex items-center gap-2">
                  <span>Page {page} of {totalPages}</span>
                  <button
                    onClick={() => loadTableData(selectedTable, page - 1)}
                    disabled={page <= 1 || isLoadingRecords}
                    className="glass-btn-ghost p-1 rounded disabled:opacity-30"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => loadTableData(selectedTable, page + 1)}
                    disabled={page >= totalPages || isLoadingRecords}
                    className="glass-btn-ghost p-1 rounded disabled:opacity-30"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Results Grid / Schema Tab */}
          <div className="flex-1 overflow-auto rounded" style={{ background: 'rgba(7, 10, 18, 0.4)', border: '1px solid var(--glass-border)' }}>
            {activeTab === 'schema' && tableSchema ? (
              <table className="w-full text-left font-mono" style={{ fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid var(--glass-border)' }}>
                    <th className="p-2.5 text-muted">#</th>
                    <th className="p-2.5 text-cyan-300">COLUMN NAME</th>
                    <th className="p-2.5 text-muted">TYPE</th>
                    <th className="p-2.5 text-muted">PRIMARY KEY</th>
                    <th className="p-2.5 text-muted">NOT NULL</th>
                    <th className="p-2.5 text-muted">DEFAULT</th>
                  </tr>
                </thead>
                <tbody>
                  {tableSchema.columns.map((c, i) => (
                    <tr key={c.name} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                      <td className="p-2 text-muted">{c.cid}</td>
                      <td className="p-2 text-white font-semibold">{c.name}</td>
                      <td className="p-2 text-cyan-400">{c.type}</td>
                      <td className="p-2">{c.pk ? <span className="text-amber-400 font-bold">YES</span> : 'No'}</td>
                      <td className="p-2">{c.notnull ? 'YES' : 'No'}</td>
                      <td className="p-2 text-muted">{c.defaultValue || 'NULL'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left font-mono" style={{ fontSize: '13.5px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid var(--glass-border)' }}>
                    {queryResult.columns.map((col) => (
                      <th
                        key={col}
                        onClick={() => handleSort(col)}
                        className="p-2.5 text-cyan-300 cursor-pointer select-none hover:bg-white/5"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{col}</span>
                          <ArrowUpDown size={12} color="var(--text-muted)" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {processedRows.length === 0 ? (
                    <tr>
                      <td colSpan={queryResult.columns.length || 1} className="p-8 text-center text-muted">
                        {isLoadingRecords ? 'Loading records...' : 'No records returned'}
                      </td>
                    </tr>
                  ) : (
                    processedRows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className="hover:bg-white/[0.03]"
                        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}
                      >
                        {queryResult.columns.map((col) => {
                          const rawVal = typeof row === 'object' && row !== null ? row[col] : row;
                          const displayVal =
                            rawVal === null || rawVal === undefined
                              ? '<NULL>'
                              : typeof rawVal === 'object'
                              ? JSON.stringify(rawVal)
                              : String(rawVal);
                          const isNull = rawVal === null || rawVal === undefined;
                          return (
                            <td
                              key={col}
                              className="p-2 truncate max-w-xs"
                              style={{ color: isNull ? 'var(--text-muted)' : 'var(--text-primary)' }}
                              title={displayVal}
                            >
                              {displayVal}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
