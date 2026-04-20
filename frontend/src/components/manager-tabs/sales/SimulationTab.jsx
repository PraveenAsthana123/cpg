import { useState } from 'react';

export default function SimulationTab() {
  const [store, setStore] = useState(1);
  const [discount, setDiscount] = useState(15);
  const [duration, setDuration] = useState(7);

  return (
    <div style={{ padding: 24 }}>
      <h3 style={{ marginTop: 0, fontSize: 16 }}>Promotion Simulator</h3>
      <p style={{ color: '#64748b', fontSize: 13, marginTop: 0 }}>
        Configure a price × promotion scenario and estimate impact.
        The simulation engine (/api/v1/sales/simulate) ships in Phase δ.
      </p>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 16, marginBottom: 20, maxWidth: 640,
      }}>
        <Field label="Store ID" type="number" value={store} onChange={setStore} min={1} max={1115} />
        <Field label="Discount %" type="number" value={discount} onChange={setDiscount} min={0} max={50} suffix="%" />
        <Field label="Duration (days)" type="number" value={duration} onChange={setDuration} min={1} max={30} />
      </div>

      <button
        disabled
        title="Simulation engine ships in Phase δ"
        style={{
          padding: '10px 20px', background: '#cbd5e1', color: '#475569',
          border: 'none', borderRadius: 6, cursor: 'not-allowed', fontWeight: 600,
        }}
      >▶ Run scenario (ships in Phase δ)</button>

      <div style={{
        marginTop: 24, padding: 20, background: 'rgba(234,88,12,0.06)',
        border: '1px dashed #ea580c', borderRadius: 8,
      }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🚧</div>
        <h4 style={{ margin: 0, fontSize: 14 }}>Coming in Phase δ</h4>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#475569' }}>
          Phase δ adds price-elasticity simulation that uses the Phase β forecast as
          baseline, then applies promo uplift + margin erosion to return a 4-step
          waterfall: Baseline → Promo uplift → Margin hit → Net impact.
        </p>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, min, max, suffix }) {
  return (
    <label>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <input
          type={type} value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
          min={min} max={max}
          style={{
            padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 6,
            width: '100%', boxSizing: 'border-box',
          }}
        />
        {suffix && <span style={{ color: '#64748b' }}>{suffix}</span>}
      </div>
    </label>
  );
}
