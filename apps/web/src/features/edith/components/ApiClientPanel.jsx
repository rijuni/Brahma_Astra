import React, { useState } from 'react';
import {
  Send,
  Globe,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Copy,
  Check,
  Code,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import { useToast } from '../../../components/feedback/Toast';

const QUICK_ENDPOINTS = [
  { label: 'Application API Health (:3000)', method: 'GET', url: 'http://localhost:3000/health/live' },
  { label: 'Application API Readiness (:3000)', method: 'GET', url: 'http://localhost:3000/health/ready' },
  { label: 'List Projects (:3000)', method: 'GET', url: 'http://localhost:3000/api/v1/projects' },
  { label: 'FRIDAY Core Health (:8001)', method: 'GET', url: 'http://localhost:8001/health/live' },
  { label: 'EDITH Engine Health (:8002)', method: 'GET', url: 'http://localhost:8002/health/live' },
  { label: 'EDITH Runner Health (:8003)', method: 'GET', url: 'http://localhost:8003/health/live' }
];

export default function ApiClientPanel() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('http://localhost:3000/health/live');
  const [activeTab, setActiveTab] = useState('body'); // 'body' | 'params' | 'headers' | 'graphql'
  const [requestBody, setRequestBody] = useState('{\n  "query": "active"\n}');
  const [headers, setHeaders] = useState([
    { key: 'Content-Type', value: 'application/json', enabled: true },
    { key: 'Accept', value: 'application/json', enabled: true }
  ]);
  const [queryParams, setQueryParams] = useState([
    { key: 'limit', value: '10', enabled: false }
  ]);
  const [graphqlQuery, setGraphqlQuery] = useState('query GetWorkspaceInfo {\n  workspace(id: "1") {\n    id\n    name\n    status\n  }\n}');
  const [graphqlVars, setGraphqlVars] = useState('{\n  "id": "1"\n}');

  const [isLoading, setIsLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState(null);
  const [responseDuration, setResponseDuration] = useState(null);
  const [responseSize, setResponseSize] = useState(null);
  const [responseBody, setResponseBody] = useState('Click "Send" to execute a live HTTP request against running services.');
  const [responseHeaders, setResponseHeaders] = useState({});
  const [isError, setIsError] = useState(false);
  const [copied, setCopied] = useState(false);

  const { addToast } = useToast();

  const handleSelectQuickEndpoint = (ep) => {
    setMethod(ep.method);
    setUrl(ep.url);
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(requestBody);
      setRequestBody(JSON.stringify(parsed, null, 2));
      addToast('JSON formatted successfully', 'info');
    } catch (err) {
      addToast(`Invalid JSON: ${err.message}`, 'error');
    }
  };

  const handleSend = async () => {
    setIsLoading(true);
    setIsError(false);
    setResponseStatus('Connecting...');
    const startTime = performance.now();

    try {
      // Build full URL with active query params
      const urlObj = new URL(url.startsWith('http') ? url : `http://${url}`);
      queryParams.forEach((p) => {
        if (p.enabled && p.key.trim()) {
          urlObj.searchParams.set(p.key.trim(), p.value.trim());
        }
      });

      // Build headers object
      const reqHeaders = {};
      headers.forEach((h) => {
        if (h.enabled && h.key.trim()) {
          reqHeaders[h.key.trim()] = h.value.trim();
        }
      });

      // Prepare request payload
      let body = undefined;
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        if (activeTab === 'graphql') {
          reqHeaders['Content-Type'] = 'application/json';
          body = JSON.stringify({
            query: graphqlQuery,
            variables: JSON.parse(graphqlVars || '{}')
          });
        } else if (requestBody.trim()) {
          body = requestBody;
        }
      }

      const res = await fetch(urlObj.toString(), {
        method,
        headers: reqHeaders,
        body
      });

      const elapsed = Math.round(performance.now() - startTime);
      setResponseDuration(`${elapsed}ms`);
      setResponseStatus(`${res.status} ${res.statusText || (res.ok ? 'OK' : 'Error')}`);

      // Extract response headers
      const resHeadersObj = {};
      res.headers.forEach((val, key) => {
        resHeadersObj[key] = val;
      });
      setResponseHeaders(resHeadersObj);

      const rawText = await res.text();
      setResponseSize(`${new Blob([rawText]).size} B`);

      try {
        const json = JSON.parse(rawText);
        setResponseBody(JSON.stringify(json, null, 2));
      } catch {
        setResponseBody(rawText || '(Empty Response)');
      }

      if (!res.ok) setIsError(true);
    } catch (err) {
      const elapsed = Math.round(performance.now() - startTime);
      setResponseDuration(`${elapsed}ms`);
      setResponseStatus('Connection Error');
      setIsError(true);
      setResponseBody(`Network / CORS Error:\n${err.message}\n\nTip: Ensure the targeted microservice is running.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResponse = async () => {
    try {
      await navigator.clipboard.writeText(responseBody);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addToast('Copied response to clipboard', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden p-3.5" style={{ borderRadius: 'var(--radius-lg)' }}>
      {/* Top Bar: Quick Endpoints Dropdown + Reality Disclosure */}
      <div className="flex items-center justify-between mb-2.5 pb-2.5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <Globe size={16} color="var(--brand-cyan)" />
          <span className="body-small text-muted" style={{ fontWeight: 600, fontSize: '12px' }}>
            REST & GRAPHQL API CLIENT
          </span>
          <Badge variant="cyan" style={{ padding: '4px 8px', fontSize: '11px' }}>VERIFIED LIVE BROWSER HTTP</Badge>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted" style={{ fontSize: '11px' }}>Preset:</span>
          <select
            onChange={(e) => {
              const ep = QUICK_ENDPOINTS.find((q) => q.label === e.target.value);
              if (ep) handleSelectQuickEndpoint(ep);
            }}
            className="glass-input"
            style={{ height: '32px', padding: '0 10px', fontSize: '12px', borderRadius: '6px' }}
          >
            <option value="">Select Local Service Endpoint...</option>
            {QUICK_ENDPOINTS.map((ep) => (
              <option key={ep.label} value={ep.label} style={{ background: '#0B0F1A' }}>
                [{ep.method}] {ep.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* URL & Method Bar */}
      <div className="flex items-center gap-2.5 mb-2.5">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="glass-input"
          style={{
            height: '36px',
            padding: '0 12px',
            fontSize: '12.5px',
            fontWeight: 700,
            borderRadius: '6px',
            minWidth: '95px',
            color: method === 'GET' ? 'var(--status-success)' : method === 'POST' ? 'var(--brand-cyan)' : 'var(--brand-gold)'
          }}
        >
          {['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].map((m) => (
            <option key={m} value={m} style={{ background: '#0B0F1A' }}>
              {m}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="http://localhost:3000/..."
          className="glass-input flex-1"
          style={{ height: '36px', padding: '0 12px', fontSize: '12.5px', borderRadius: '6px' }}
        />

        <Button
          variant="gold"
          icon={Send}
          onClick={handleSend}
          isLoading={isLoading}
          style={{ height: '36px', padding: '0 18px', fontSize: '12.5px', fontWeight: 600 }}
        >
          Send
        </Button>
      </div>

      {/* Subtab Switcher (Body, Params, Headers, GraphQL) */}
      <div className="flex items-center gap-1.5 mb-2.5 border-b border-white/5 pb-1.5">
        {[
          { id: 'body', label: 'JSON Body' },
          { id: 'params', label: `Params (${queryParams.filter((p) => p.enabled).length})` },
          { id: 'headers', label: `Headers (${headers.filter((h) => h.enabled).length})` },
          { id: 'graphql', label: 'GraphQL' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="glass-btn-ghost body-small"
            style={{
              padding: '2px 8px',
              fontSize: '10px',
              borderRadius: '3px',
              color: activeTab === tab.id ? 'var(--brand-gold)' : 'var(--text-muted)',
              background: activeTab === tab.id ? 'rgba(139, 92, 246, 0.2)' : 'transparent'
            }}
          >
            {tab.label}
          </button>
        ))}

        {activeTab === 'body' && (
          <button
            onClick={handleFormatJson}
            className="glass-btn-ghost body-small text-muted hover:text-white"
            style={{ marginLeft: 'auto', fontSize: '10px', padding: '2px 6px' }}
            title="Prettify JSON syntax"
          >
            Format JSON
          </button>
        )}
      </div>

      {/* Split: Request & Response */}
      <div className="grid grid-cols-2 gap-3 flex-1 overflow-hidden">
        {/* Request Area */}
        <div className="flex flex-col gap-1 overflow-hidden">
          {activeTab === 'body' && (
            <textarea
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              placeholder="Raw JSON Payload..."
              className="flex-1 p-2 outline-none glass-input"
              style={{
                fontFamily: 'var(--font-code)',
                fontSize: '11px',
                borderRadius: 'var(--radius-sm)',
                resize: 'none',
                background: 'rgba(7, 10, 24, 0.4)'
              }}
            />
          )}

          {activeTab === 'params' && (
            <div className="flex flex-col gap-1 flex-1 overflow-y-auto p-1">
              {queryParams.map((p, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={p.enabled}
                    onChange={(e) => {
                      const updated = [...queryParams];
                      updated[idx].enabled = e.target.checked;
                      setQueryParams(updated);
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Key"
                    value={p.key}
                    onChange={(e) => {
                      const updated = [...queryParams];
                      updated[idx].key = e.target.value;
                      setQueryParams(updated);
                    }}
                    className="glass-input flex-1"
                    style={{ padding: '3px 6px', fontSize: '11px' }}
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={p.value}
                    onChange={(e) => {
                      const updated = [...queryParams];
                      updated[idx].value = e.target.value;
                      setQueryParams(updated);
                    }}
                    className="glass-input flex-1"
                    style={{ padding: '3px 6px', fontSize: '11px' }}
                  />
                  <button
                    onClick={() => setQueryParams(queryParams.filter((_, i) => i !== idx))}
                    className="glass-btn-ghost"
                    style={{ padding: '2px' }}
                  >
                    <Trash2 size={11} color="var(--status-error)" />
                  </button>
                </div>
              ))}
              <Button
                variant="ghost"
                size="small"
                icon={Plus}
                onClick={() => setQueryParams([...queryParams, { key: '', value: '', enabled: true }])}
                style={{ alignSelf: 'flex-start', marginTop: '4px' }}
              >
                Add Parameter
              </Button>
            </div>
          )}

          {activeTab === 'headers' && (
            <div className="flex flex-col gap-1 flex-1 overflow-y-auto p-1">
              {headers.map((h, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={h.enabled}
                    onChange={(e) => {
                      const updated = [...headers];
                      updated[idx].enabled = e.target.checked;
                      setHeaders(updated);
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Header"
                    value={h.key}
                    onChange={(e) => {
                      const updated = [...headers];
                      updated[idx].key = e.target.value;
                      setHeaders(updated);
                    }}
                    className="glass-input flex-1"
                    style={{ padding: '3px 6px', fontSize: '11px' }}
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={h.value}
                    onChange={(e) => {
                      const updated = [...headers];
                      updated[idx].value = e.target.value;
                      setHeaders(updated);
                    }}
                    className="glass-input flex-1"
                    style={{ padding: '3px 6px', fontSize: '11px' }}
                  />
                  <button
                    onClick={() => setHeaders(headers.filter((_, i) => i !== idx))}
                    className="glass-btn-ghost"
                    style={{ padding: '2px' }}
                  >
                    <Trash2 size={11} color="var(--status-error)" />
                  </button>
                </div>
              ))}
              <Button
                variant="ghost"
                size="small"
                icon={Plus}
                onClick={() => setHeaders([...headers, { key: '', value: '', enabled: true }])}
                style={{ alignSelf: 'flex-start', marginTop: '4px' }}
              >
                Add Header
              </Button>
            </div>
          )}

          {activeTab === 'graphql' && (
            <div className="flex flex-col gap-2 flex-1 overflow-hidden">
              <textarea
                value={graphqlQuery}
                onChange={(e) => setGraphqlQuery(e.target.value)}
                placeholder="GraphQL Query / Mutation..."
                className="flex-1 p-2 outline-none glass-input"
                style={{
                  fontFamily: 'var(--font-code)',
                  fontSize: '11px',
                  borderRadius: 'var(--radius-sm)',
                  resize: 'none',
                  background: 'rgba(7, 10, 24, 0.4)'
                }}
              />
              <textarea
                value={graphqlVars}
                onChange={(e) => setGraphqlVars(e.target.value)}
                placeholder="Variables (JSON)..."
                rows={3}
                className="p-2 outline-none glass-input"
                style={{
                  fontFamily: 'var(--font-code)',
                  fontSize: '11px',
                  borderRadius: 'var(--radius-sm)',
                  resize: 'none',
                  background: 'rgba(7, 10, 24, 0.4)'
                }}
              />
            </div>
          )}
        </div>

        {/* Response Area */}
        <div className="flex flex-col gap-1 overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="body-small text-muted" style={{ fontSize: '10px', fontWeight: 600 }}>RESPONSE</span>
            <div className="flex items-center gap-2">
              {responseStatus && (
                <Badge variant={isError ? 'error' : 'cyan'} size="small">
                  {responseStatus}
                </Badge>
              )}
              {responseDuration && (
                <span className="text-muted" style={{ fontSize: '10px' }}>
                  {responseDuration}
                </span>
              )}
              {responseSize && (
                <span className="text-muted" style={{ fontSize: '10px' }}>
                  {responseSize}
                </span>
              )}
              <button
                onClick={handleCopyResponse}
                className="glass-btn-ghost"
                style={{ padding: '2px 4px', borderRadius: '3px' }}
                title="Copy response body"
              >
                {copied ? <Check size={11} color="var(--status-success)" /> : <Copy size={11} color="var(--text-muted)" />}
              </button>
            </div>
          </div>

          <pre
            className="flex-1 p-2 overflow-auto"
            style={{
              background: 'rgba(7, 10, 24, 0.7)',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-code)',
              fontSize: '11px',
              color: isError ? '#F87171' : '#34D399',
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {responseBody}
          </pre>
        </div>
      </div>
    </div>
  );
}
