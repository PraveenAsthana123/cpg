// salesApi.js — thin fetch client for /api/v1/sales/*
// Uses VITE_API_BASE_URL if set, else same-origin /api path (proxied by Vite dev server).

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function fetchJson(url, init) {
  const r = await fetch(API_BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!r.ok) {
    let detail = r.statusText;
    try { detail = (await r.json())?.detail || detail; } catch { /* ignore */ }
    throw new Error(`${r.status} ${detail}`);
  }
  return r.json();
}

export async function listStores() {
  return fetchJson('/api/v1/sales/stores');
}

export async function getForecast(storeId, horizonDays = 56) {
  return fetchJson('/api/v1/sales/forecast', {
    method: 'POST',
    body: JSON.stringify({ store_id: storeId, horizon_days: horizonDays }),
  });
}
