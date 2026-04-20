const API_BASE = '';

async function fetchJson(url, init) {
  const r = await fetch(API_BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!r.ok) {
    let detail = r.statusText;
    try {
      detail = (await r.json())?.detail || detail;
    } catch {
      /* ignore */
    }
    throw new Error(`${r.status} ${detail}`);
  }
  return r.json();
}

export async function explain({ question, context }) {
  return fetchJson('/api/v1/ai/explain', {
    method: 'POST',
    body: JSON.stringify({ question, context }),
  });
}
