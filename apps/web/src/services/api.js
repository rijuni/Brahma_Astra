// API adapter: deliberately reports unavailable integrations instead of fabricating successful AI/backend results.
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000';
export async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const text = await response.text(); let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) throw new Error(data?.message || `Request failed (${response.status})`);
  return data;
}
export async function checkApi() { try { await request('/health/live'); return { ok: true }; } catch (error) { return { ok: false, error: error.message }; } }
export async function sendChatMessage(message, conversationId) { return request('/api/v1/conversations/messages', { method: 'POST', body: JSON.stringify({ message, conversationId }) }); }
export async function createProject(project) { return request('/api/v1/projects', { method: 'POST', body: JSON.stringify(project) }); }
