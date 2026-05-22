import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './HolyNavPage.css';

const HOLY_DEPTS = [
  'digital-marketing', 'customer-experience', 'supply-chain', 'manufacturing',
  'product-rd', 'retail-operations', 'sales', 'finance', 'hr', 'procurement',
  'executive-leadership', 'e-commerce',
];

export default function HolyNavPage() {
  const { departmentId } = useParams();
  const [nav, setNav] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState({ process: null, sub: null });
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    if (!departmentId) {
      setNav(null);
      return;
    }
    setError(null);
    setSelected({ process: null, sub: null });
    fetch(`/holy-nav/${departmentId}.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load nav for ${departmentId}: HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setNav(data);
        // Auto-select first sub-process for convenience
        if (data.left_nav?.[0]?.sub_processes?.[0]) {
          setSelected({
            process: data.left_nav[0].process,
            sub: data.left_nav[0].sub_processes[0],
          });
          setActiveTab('Overview');
        }
      })
      .catch((e) => setError(String(e)));
  }, [departmentId]);

  // No dept selected — show dept picker
  if (!departmentId) {
    return (
      <div className="holy-nav-container">
        <h1>HOLY Beverage — Department Navigator</h1>
        <p className="holy-subtitle">Pick a department to explore its processes, sub-processes, data inputs, AI models, outputs, and KPIs.</p>
        <div className="holy-dept-grid">
          {HOLY_DEPTS.map((d) => (
            <Link key={d} to={`/holy/${d}`} className="holy-dept-card">
              <span className="holy-dept-name">{d.replace(/-/g, ' ')}</span>
              <span className="holy-dept-cta">Open →</span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="holy-nav-container">
        <p className="holy-error">{error}</p>
        <Link to="/holy" className="holy-back">← Back to department picker</Link>
      </div>
    );
  }

  if (!nav) {
    return (
      <div className="holy-nav-container">
        <p>Loading nav for {departmentId}…</p>
      </div>
    );
  }

  const { sub, process: procName } = selected;

  return (
    <div className="holy-nav-page">
      {/* Left sidebar: process → sub-process tree */}
      <aside className="holy-sidebar">
        <div className="holy-sidebar-header">
          <Link to="/holy" className="holy-back-link">← All HOLY depts</Link>
          <h2>{nav.display_name}</h2>
          <p className="holy-sidebar-sub">{nav.left_nav.length} processes</p>
        </div>
        <nav className="holy-sidebar-nav">
          {nav.left_nav.map((proc) => (
            <div key={proc.slug} className="holy-proc-group">
              <div className="holy-proc-title">{proc.process}</div>
              <ul className="holy-sub-list">
                {proc.sub_processes.map((s) => (
                  <li key={s.slug}>
                    <button
                      type="button"
                      className={
                        'holy-sub-link' +
                        (selected.sub?.slug === s.slug ? ' holy-sub-link--active' : '')
                      }
                      onClick={() => {
                        setSelected({ process: proc.process, sub: s });
                        setActiveTab('Overview');
                      }}
                    >
                      {s.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main: tabbed view */}
      <section className="holy-main">
        {!sub ? (
          <div className="holy-empty">
            <p>Pick a sub-process from the left sidebar.</p>
          </div>
        ) : (
          <>
            <header className="holy-main-header">
              <p className="holy-breadcrumb">
                <span>{nav.display_name}</span> ›{' '}
                <span>{procName}</span> ›{' '}
                <span className="holy-breadcrumb-current">{sub.name}</span>
              </p>
              <h1>{sub.name}</h1>
            </header>

            <div className="holy-tabs">
              {sub.tabs.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={'holy-tab' + (activeTab === t ? ' holy-tab--active' : '')}
                  onClick={() => setActiveTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="holy-tab-content">
              <p>{sub.tab_content?.[activeTab] ?? '(no content for this tab)'}</p>
            </div>

            <details className="holy-debug">
              <summary>Raw JSON for this sub-process</summary>
              <pre>{JSON.stringify(sub, null, 2)}</pre>
            </details>
          </>
        )}
      </section>
    </div>
  );
}
