// aiExplainApi.js — thin client for /api/v1/ai/explain.
// Uses the shared apiFetch wrapper so every call carries X-Demo-Role
// (Phase η demo-mode RBAC).

import { apiFetch } from './apiFetch';

export async function explain({ question, context }) {
  return apiFetch('/api/v1/ai/explain', {
    method: 'POST',
    body: JSON.stringify({ question, context }),
  });
}
