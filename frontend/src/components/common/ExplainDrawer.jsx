// ExplainDrawer — modal overlay for AI-generated explanations.
// Phase γ wires it to /api/v1/ai/explain — live RAG-grounded response with citations.

import { useEffect, useState } from 'react';
import { explain } from '../../services/aiExplainApi';

export default function ExplainDrawer({ open, onClose, context }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    // Seed a sensible default question from the context.
    if (context && !question) {
      setQuestion(defaultQuestionFor(context));
    }
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, context, question]);

  const ask = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await explain({ question, context });
      setResult(r);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,23,42,0.45)',
        display: 'flex',
        justifyContent: 'flex-end',
        zIndex: 1000,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="AI Explanation"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(560px, 100vw)',
          height: '100vh',
          background: '#fff',
          boxShadow: '-12px 0 32px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <header
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3 style={{ margin: 0, fontSize: 16 }}>🤖 AI Explanation</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            ×
          </button>
        </header>

        <section style={{ padding: '20px', overflow: 'auto', flex: 1 }}>
          <label
            style={{
              display: 'block',
              fontSize: 12,
              color: '#64748b',
              marginBottom: 4,
            }}
          >
            Ask a question
          </label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && ask()}
              placeholder="What drove this change?"
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
              }}
            />
            <button
              onClick={ask}
              disabled={loading || !question.trim()}
              style={{
                padding: '8px 14px',
                background: loading ? '#cbd5e1' : '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: loading ? 'wait' : 'pointer',
              }}
            >
              {loading ? '…' : 'Ask'}
            </button>
          </div>

          {context && (
            <details style={{ marginBottom: 12 }}>
              <summary
                style={{ cursor: 'pointer', fontSize: 11, color: '#64748b' }}
              >
                Context passed to AI
              </summary>
              <pre
                style={{
                  margin: '6px 0 0',
                  padding: 8,
                  background: '#f8fafc',
                  borderRadius: 4,
                  fontSize: 11,
                  overflow: 'auto',
                }}
              >
                {JSON.stringify(context, null, 2)}
              </pre>
            </details>
          )}

          {error && (
            <div
              style={{
                padding: 12,
                background: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fecaca',
                borderRadius: 6,
                marginBottom: 12,
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          {result && (
            <>
              <div
                style={{
                  padding: 12,
                  background: '#f8fafc',
                  borderRadius: 6,
                  fontSize: 13,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {result.markdown}
              </div>

              <h4
                style={{
                  fontSize: 12,
                  color: '#64748b',
                  margin: '16px 0 6px',
                }}
              >
                Citations ({result.citations.length})
              </h4>
              <ul style={{ paddingLeft: 16, margin: 0 }}>
                {result.citations.map((c, i) => (
                  <li
                    key={c.chunk_id}
                    style={{ marginBottom: 8, fontSize: 12 }}
                  >
                    <strong>[ref {i + 1}]</strong>{' '}
                    <code style={{ fontSize: 11 }}>{c.source}</code>
                    <div
                      style={{
                        color: '#64748b',
                        fontSize: 11,
                        marginTop: 2,
                      }}
                    >
                      {c.snippet}
                    </div>
                  </li>
                ))}
              </ul>

              <div
                style={{ fontSize: 10, color: '#94a3b8', marginTop: 12 }}
              >
                {result.model} · retrieval {result.retrieval_time_ms}ms ·
                generation {result.generation_time_ms}ms
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function defaultQuestionFor(context) {
  if (context?.screen === 'ForecastTab') {
    return `What drives the forecast for store ${context.store_id}?`;
  }
  if (context?.screen === 'RevenueDrillDownTab') {
    return `Why does store type ${context.store_type} perform the way it does?`;
  }
  if (context?.screen === 'StockoutRiskTab') {
    return `Why is SKU ${context.sku_id} in the ${context.risk_band ?? ''} stockout risk band?`;
  }
  if (context?.screen === 'SupplierScorecardTab') {
    return `Why does supplier ${context.supplier_name ?? context.supplier_id} have a score of ${
      typeof context.score === 'number' ? context.score.toFixed(1) : context.score
    }?`;
  }
  if (context?.screen === 'NetworkSimTab') {
    return `What drives the revenue-at-risk if supplier ${context.supplier_id} is delayed ${context.delay_days} days?`;
  }
  return 'What does this mean?';
}
