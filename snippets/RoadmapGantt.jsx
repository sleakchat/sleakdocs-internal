export const RoadmapGantt = () => {
  const projects = [
    {
      name: 'Dashboard UIV3',
      items: [
        { name: 'Laatste onderdelen afwerken', start: '2026-10-01', end: '2026-10-31' },
        { name: 'Polishing & improvements (kevin/bas)', start: '2026-10-22', end: '2026-11-15' },
        { name: 'Testing & improvements (team)', start: '2026-11-01', end: '2026-11-15' },
        { name: 'Early public testing (beta users)', start: '2026-11-10', end: '2026-11-25' },
        { name: 'Public release', start: '2026-11-16', end: '2026-11-30' },
        { name: 'Refinements & openstaande features', start: '2026-12-01', end: '2026-12-31' }
      ]
    },
    {
      name: 'Omnichannel',
      items: [
        { name: 'Meta verification', start: '2026-10-05', end: '2026-10-25' },
        { name: 'Explorations & prototyping', start: '2026-10-01', end: '2026-11-30' },
        { name: 'Development', start: '2026-12-01', end: '2026-12-31' },
        { name: 'Release', start: '2026-12-01', end: '2026-12-31' }
      ]
    },
    { name: 'Website redesign', start: '2026-11-01', end: '2026-11-30', paused: true },
    {
      name: 'Knowledge gaps & AI insights',
      items: [
        { name: 'Prototyping & running evals', start: '2026-10-01', end: '2026-11-30' },
        { name: 'Development', start: '2027-01-01', end: '2027-01-31' }
      ]
    }
  ];
  const later = ['Public docs re-do', 'Sidekick assistant', 'Public API/MCP upgrade', 'Agents 2.0'];

  const rangeStart = new Date(2026, 9, 1);
  const rangeEnd = new Date(2027, 3, 1);
  const total = rangeEnd - rangeStart;
  const pct = d => ((new Date(d) - rangeStart) / total) * 100;
  const today = new Date();
  const todayPct = pct(today);
  const showToday = todayPct > 0 && todayPct < 100;
  const fmt = d => new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });

  const isoWeek = d => {
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
    return Math.ceil(((t - Date.UTC(t.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7);
  };
  const toMonday = s => {
    const [y, m, d] = s.split('-').map(Number);
    const x = new Date(y, m - 1, d);
    const offset = (x.getDay() + 6) % 7;
    x.setDate(x.getDate() + (offset <= 3 ? -offset : 7 - offset));
    return new Date(Math.min(Math.max(x, rangeStart), rangeEnd));
  };

  const months = [];
  for (let d = new Date(rangeStart); d < rangeEnd; d.setMonth(d.getMonth() + 1)) {
    months.push({ label: d.toLocaleDateString('nl-NL', { month: 'short' }), left: pct(d) });
  }

  const quarters = [];
  for (let d = new Date(rangeStart); d < rangeEnd; d.setMonth(d.getMonth() + 3)) {
    const next = new Date(d);
    next.setMonth(next.getMonth() + 3);
    quarters.push({ label: `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`, left: pct(d), width: pct(next < rangeEnd ? next : rangeEnd) - pct(d) });
  }

  const weeks = [];
  const w = new Date(rangeStart);
  w.setDate(w.getDate() + ((8 - w.getDay()) % 7));
  for (; w < rangeEnd; w.setDate(w.getDate() + 7)) {
    weeks.push({ label: isoWeek(w), left: pct(w) });
  }
  const weekW = ((7 * 864e5) / total) * 100;

  const [open, setOpen] = useState({ 'Dashboard UIV3': true, Omnichannel: true, 'Knowledge gaps & AI insights': true });

  const line = 'rgba(128,128,128,0.18)';
  const border = `1px solid ${line}`;
  const green = '#22C55E';
  const purple = '#8551FB';
  const orange = '#FBBF24';
  const red = '#EF4444';

  const Grid = () => (
    <>
      {weeks.map(wk => (
        <div key={wk.label} style={{ position: 'absolute', top: 0, bottom: 0, left: `${wk.left}%`, borderLeft: '1px dashed rgba(128,128,128,0.1)' }} />
      ))}
      {months.map(m => (
        <div key={m.label} style={{ position: 'absolute', top: 0, bottom: 0, left: `${m.left}%`, borderLeft: border }} />
      ))}
      {showToday && <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${todayPct}%`, width: 2, background: red, pointerEvents: 'none', zIndex: 1 }} />}
    </>
  );

  const Bar = ({ start, end, color, faded }) => {
    const s = toMonday(start);
    const e = toMonday(end);
    const left = pct(s);
    const width = Math.max(pct(e) - left, weekW);
    const title = `${fmt(start)} - ${fmt(end)} (W${isoWeek(s)} - W${isoWeek(new Date(e - 864e5))})`;
    return (
      <div
        title={title}
        style={{
          position: 'absolute',
          top: '50%',
          background: color,
          opacity: faded ? 0.55 : 1,
          left: `${left}%`,
          width: `${width}%`,
          height: faded ? 10 : 14,
          borderRadius: 7,
          transform: 'translateY(-50%)'
        }}
      />
    );
  };

  const labelCell = { padding: '0 16px 0 12px', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', borderRight: border, borderBottom: border };
  const timeCell = { position: 'relative', borderBottom: border };

  const Row = ({ label, bold, indent, onClick, children }) => {
    const height = indent ? 30 : 40;
    return (
      <>
        <div
          onClick={onClick}
          style={{ ...labelCell, height, paddingLeft: indent ? 28 : 12, fontSize: 13, fontWeight: bold ? 600 : 400, opacity: indent ? 0.8 : 1, cursor: onClick ? 'pointer' : 'default' }}>
          {label}
        </div>
        <div style={{ ...timeCell, height }}>
          <Grid />
          {children}
        </div>
      </>
    );
  };

  const HeaderRow = ({ label, height, items, render }) => (
    <>
      <div style={{ ...labelCell, height, fontSize: 12, opacity: 0.6 }}>{label}</div>
      <div style={{ ...timeCell, height, overflow: 'hidden' }}>
        {items.map((it, i) => (
          <div
            key={it.label}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${it.left}%`,
              width: `${it.width}%`,
              borderLeft: i ? border : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...render
            }}>
            {it.label}
          </div>
        ))}
      </div>
    </>
  );

  const span = p => (p.items ? { start: p.items[0].start, end: p.items.reduce((m, i) => (i.end > m ? i.end : m), p.items[0].end) } : { start: p.start, end: p.end });

  const Legend = ({ color, label }) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: 5, background: color }} />
      {label}
    </span>
  );

  return (
    <div>
      <div style={{ border, borderRadius: 12, overflow: 'hidden', display: 'grid', gridTemplateColumns: '300px 1fr' }}>
        <HeaderRow label='' height={30} items={quarters} render={{ fontSize: 12, fontWeight: 600, opacity: 0.7 }} />
        <HeaderRow label='Project' height={36} items={months.map(m => ({ ...m, width: 100 / months.length }))} render={{ fontSize: 12, opacity: 0.6, textTransform: 'capitalize' }} />
        <HeaderRow label='Week' height={24} items={weeks.map(wk => ({ ...wk, width: weekW }))} render={{ fontSize: 10, opacity: 0.5, borderLeft: '1px dashed rgba(128,128,128,0.15)' }} />

        {projects.map(p => {
          const s = span(p);
          const color = p.paused ? orange : p.started || new Date(s.start) <= today ? green : purple;
          return (
            <>
              <Row key={p.name} label={p.items ? `${open[p.name] ? '▾' : '▸'} ${p.name}` : p.name} bold onClick={p.items ? () => setOpen({ ...open, [p.name]: !open[p.name] }) : undefined}>
                <Bar start={s.start} end={s.end} color={color} />
              </Row>
              {p.items &&
                open[p.name] &&
                p.items.map(i => (
                  <Row key={i.name} label={i.name} indent>
                    <Bar start={i.start} end={i.end} color={i.paused ? orange : i.started || new Date(i.start) <= today ? green : purple} faded />
                  </Row>
                ))}
            </>
          );
        })}

        <div style={{ height: 30, borderRight: border }} />
        <div style={{ position: 'relative', height: 30 }}>
          <Grid />
          {showToday && (
            <div
              style={{
                position: 'absolute',
                bottom: 6,
                left: `calc(${todayPct}% + 1px)`,
                transform: 'translateX(-50%)',
                padding: '2px 8px',
                borderRadius: 999,
                background: red,
                color: '#fff',
                fontSize: 11,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                zIndex: 2
              }}>
              {fmt(today)}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 10, fontSize: 12, opacity: 0.7 }}>
        <Legend color={green} label='In progress' />
        <Legend color={purple} label='Gepland' />
        <Legend color={orange} label='On hold' />
        <Legend color={red} label='Vandaag' />
      </div>

      <div style={{ maxWidth: 480, margin: '32px auto 0', border, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: 36, borderBottom: border, fontSize: 12, opacity: 0.6 }}>
          <span>Daarna</span>
          <span>{later.length} projecten</span>
        </div>
        {later.map((l, i) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', height: 40, borderTop: i ? border : 'none', fontSize: 13, fontWeight: 500 }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, border: `1.5px solid ${purple}`, flexShrink: 0 }} />
            {l}
          </div>
        ))}
      </div>
    </div>
  );
};
