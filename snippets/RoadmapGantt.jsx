export const RoadmapGantt = () => {
  const projects = [
    {
      name: 'Dashboard UIV3',
      items: [
        { name: 'Laatste onderdelen afwerken', start: '2026-10-01', end: '2026-10-31' },
        { name: 'Improvements & polishing (Kevin/Bas)', start: '2026-10-15', end: '2026-11-15' },
        { name: 'Testing team', start: '2026-11-01', end: '2026-11-15' },
        { name: 'Early public testing (beta users)', start: '2026-11-10', end: '2026-11-25' },
        { name: 'Public release', start: '2026-11-30', end: '2026-11-30' },
      ],
    },
    { name: 'Omnichannel', start: '2026-11-01', end: '2026-12-31' },
    { name: 'Website redesign', start: '2026-11-01', end: '2026-11-30' },
    { name: 'Knowledge gaps & AI insights', start: '2027-01-01', end: '2027-03-31' },
  ];
  const later = ['Public docs re-do', 'Sidekick assistant', 'Public API/MCP upgrade', 'Agents 2.0'];

  const rangeStart = new Date('2026-10-01');
  const rangeEnd = new Date('2027-04-01');
  const total = rangeEnd - rangeStart;
  const pct = (d) => ((new Date(d) - rangeStart) / total) * 100;
  const today = new Date();

  const months = [];
  for (let d = new Date(rangeStart); d < rangeEnd; d.setMonth(d.getMonth() + 1)) {
    months.push(d.toLocaleDateString('nl-NL', { month: 'short', year: '2-digit' }));
  }

  const [open, setOpen] = useState({ 'Dashboard UIV3': true });

  const border = '1px solid rgba(128,128,128,0.2)';
  const labelW = 260;

  const Bar = ({ start, end, color }) => {
    const left = pct(start);
    const width = Math.max(pct(end) - left, 0);
    if (width === 0) {
      return (
        <div style={{ position: 'absolute', left: `${left}%`, top: '50%', width: 12, height: 12, background: color, transform: 'translate(-50%,-50%) rotate(45deg)', borderRadius: 2 }} />
      );
    }
    return (
      <div style={{ position: 'absolute', left: `${left}%`, width: `${width}%`, top: '50%', height: 14, transform: 'translateY(-50%)', background: color, borderRadius: 7 }} />
    );
  };

  const Row = ({ label, children, bold, onClick, indent }) => (
    <div style={{ display: 'flex', borderBottom: border, minHeight: 40 }}>
      <div
        onClick={onClick}
        style={{ width: labelW, flexShrink: 0, padding: `10px 12px 10px ${indent ? 32 : 12}px`, fontSize: 13, fontWeight: bold ? 600 : 400, cursor: onClick ? 'pointer' : 'default', position: 'sticky', left: 0, background: 'inherit', borderRight: border }}
      >
        {label}
      </div>
      <div style={{ position: 'relative', flex: 1 }}>{children}</div>
    </div>
  );

  const span = (p) => ({
    start: p.items ? p.items[0].start : p.start,
    end: p.items ? p.items.reduce((m, i) => (i.end > m ? i.end : m), p.items[0].end) : p.end,
  });

  const todayPct = pct(today);

  return (
    <div style={{ border, borderRadius: 12, overflowX: 'auto' }}>
      <div style={{ minWidth: 800, position: 'relative' }}>
        <div style={{ display: 'flex', borderBottom: border }}>
          <div style={{ width: labelW, flexShrink: 0, padding: '8px 12px', fontSize: 12, opacity: 0.6, borderRight: border }}>Project</div>
          <div style={{ flex: 1, display: 'flex' }}>
            {months.map((m) => (
              <div key={m} style={{ flex: 1, padding: '8px 0', fontSize: 12, opacity: 0.6, textAlign: 'center', borderLeft: border }}>{m}</div>
            ))}
          </div>
        </div>

        {projects.map((p) => {
          const s = span(p);
          const active = new Date(s.start) <= today;
          const color = active ? '#22C55E' : '#8551FB';
          return (
            <div key={p.name}>
              <Row
                label={p.items ? `${open[p.name] ? '▾' : '▸'} ${p.name}` : p.name}
                bold
                onClick={p.items ? () => setOpen({ ...open, [p.name]: !open[p.name] }) : undefined}
              >
                <Bar start={s.start} end={s.end} color={color} />
              </Row>
              {p.items && open[p.name] &&
                p.items.map((i) => (
                  <Row key={i.name} label={i.name} indent>
                    <Bar start={i.start} end={i.end} color={`${color}99`} />
                  </Row>
                ))}
            </div>
          );
        })}

        <div style={{ display: 'flex', minHeight: 40 }}>
          <div style={{ width: labelW, flexShrink: 0, padding: '10px 12px', fontSize: 13, fontWeight: 600, borderRight: border }}>Daarna</div>
          <div style={{ flex: 1, padding: '10px 12px', fontSize: 13, opacity: 0.7 }}>{later.join(' · ')}</div>
        </div>

        {todayPct > 0 && todayPct < 100 && (
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: `calc(${labelW}px + (100% - ${labelW}px) * ${todayPct / 100})`, width: 2, background: '#EF4444', pointerEvents: 'none' }} />
        )}
      </div>
    </div>
  );
};
