const PREFIX = 'brahma-astra:v1:';
export function readLocal(key, fallback) { try { const value = localStorage.getItem(PREFIX + key); return value ? JSON.parse(value) : fallback; } catch { return fallback; } }
export function writeLocal(key, value) { try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); return true; } catch { return false; } }
export function removeLocal(key) { try { localStorage.removeItem(PREFIX + key); return true; } catch { return false; } }
export const STORAGE_PREFIX = PREFIX;
