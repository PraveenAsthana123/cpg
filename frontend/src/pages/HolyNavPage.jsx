import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './HolyNavPage.css';

const HOLY_DEPTS = [
  'digital-marketing', 'customer-experience', 'supply-chain', 'manufacturing',
  'product-rd', 'retail-operations', 'sales', 'finance', 'hr', 'procurement',
  'executive-leadership', 'e-commerce',
];

const ALL_AUDIENCES = ['b2b', 'b2c', 'b2e'];

export default function HolyNavPage() {
  const { departmentId } = useParams();
  const [nav, setNav] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState({ process: null, sub: null });
  const [activeTab, setActiveTab] = useState('Overview');
  const [audiences, setAudiences] = useState(ALL_AUDIENCES);

  useEffect(() => {
    if (!departmentId) {
      setNav(null);
      return;
    }
    setError(null);
    setSelected({ process: null, sub: null });
    setAudiences(ALL_AUDIENCES);
    fetch(`/holy-nav/${departmentId}.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load nav for ${departmentId}: HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setNav(data);
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

  // Filter nav by selected audiences
  const filteredNav = useMemo(() => {
    if (!nav) return null;
    const filtered = nav.left_nav
      .map((proc) => ({
        ...proc,
        sub_processes: proc.sub_processes.filter((s) => {
          const subAudiences = s.audiences ?? ALL_AUDIENCES;
          return subAudiences.some((a) => audiences.includes(a));
        }),
      }))
      .filter((proc) => proc.sub_processes.length > 0);
    return { ...nav, left_nav: filtered };
  }, [nav, audiences]);

  const totalVisibleSubs = useMemo(() => {
    if (!filteredNav) return 0;
    return filteredNav.left_nav.reduce((acc, p) => acc + p.sub_processes.length, 0);
  }, [filteredNav]);

  const toggleAudience = (a) => {
    setAudiences((prev) => {
      if (prev.includes(a)) {
        if (prev.length === 1) return prev; // don't allow all-off
        return prev.filter((x) => x !== a);
      }
      return [...prev, a];
    });
  };

  // No dept selected — dept picker
  if (!departmentId) {
    return (
      <div className="holy-nav-container">
        <h1>HOLY Beverage — Department Navigator</h1>
        <p className="holy-subtitle">
          Pick a department to explore its processes, sub-processes, data inputs, AI models, outputs, and KPIs.
          Filter by audience: B2B (business customers) / B2C (consumers) / B2E (employees).
        </p>
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

  if (!nav || !filteredNav) {
    return (
      <div className="holy-nav-container">
        <p>Loading nav for {departmentId}…</p>
      </div>
    );
  }

  const { sub, process: procName } = selected;
  const subStillVisible =
    sub && filteredNav.left_nav.some((p) => p.sub_processes.some((s) => s.slug === sub.slug));

  return (
    <div className="holy-nav-page">
      {/* Left sidebar: process → sub-process tree */}
      <aside className="holy-sidebar">
        <div className="holy-sidebar-header">
          <Link to="/holy" className="holy-back-link">← All HOLY depts</Link>
          <h2>{nav.display_name}</h2>
          <p className="holy-sidebar-sub">
            {filteredNav.left_nav.length} processes · {totalVisibleSubs} sub-processes shown
          </p>
          <div className="holy-spec-link-wrap">
            <a
              href={`/holy-specs/${departmentId}.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="holy-spec-link"
            >
              📄 View full HOLY_SPEC.md ↗
            </a>
          </div>

          {/* Audience filter chips */}
          <div className="holy-audience-filter">
            <span className="holy-audience-label">Filter by audience:</span>
            <div className="holy-audience-chips">
              {ALL_AUDIENCES.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAudience(a)}
                  className={
                    'holy-audience-chip' +
                    (audiences.includes(a) ? ' holy-audience-chip--active' : '')
                  }
                  aria-pressed={audiences.includes(a)}
                >
                  {a.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <nav className="holy-sidebar-nav">
          {filteredNav.left_nav.length === 0 ? (
            <p className="holy-empty-nav">No sub-processes match the current audience filter.</p>
          ) : (
            filteredNav.left_nav.map((proc) => (
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
                        <span>{s.name}</span>
                        {s.audiences && s.audiences.length < 3 && (
                          <span className="holy-sub-aud-badge">
                            {s.audiences.map((a) => a.toUpperCase()).join(' · ')}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </nav>
      </aside>

      {/* Main: tabbed view */}
      <section className="holy-main">
        {!sub || !subStillVisible ? (
          <div className="holy-empty">
            <p>
              {!sub
                ? 'Pick a sub-process from the left sidebar.'
                : 'The previously-selected sub-process is hidden by the current audience filter. Toggle a filter chip or pick another sub-process.'}
            </p>
          </div>
        ) : (
          <>
            <header className="holy-main-header">
              <p className="holy-breadcrumb">
                <span>{nav.display_name}</span> ›{' '}
                <span>{procName}</span> ›{' '}
                <span className="holy-breadcrumb-current">{sub.name}</span>
              </p>
              <div className="holy-main-title-row">
                <h1>{sub.name}</h1>
                {sub.audiences && (
                  <div className="holy-sub-audiences">
                    {sub.audiences.map((a) => (
                      <span key={a} className="holy-aud-badge">
                        {a.toUpperCase()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
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
