const rankingLegend = [
  { label: 'S+', desc: 'Prácticamente igual que S pero me marcó más; juegos clave.' },
  { label: 'S', desc: 'Excelente.' },
  { label: 'A', desc: 'Sobresaliente.' },
  { label: 'B', desc: 'Muy bueno.' },
  { label: 'C', desc: 'Bueno.' },
  { label: 'D', desc: 'Decente.' },
  { label: 'E', desc: 'Mediocre.' },
  { label: 'F', desc: 'Basura infecta, pérdida de tiempo.' },
  { label: 'G', desc: 'Irrelevante, sin opinión.' }
];

const statusLegend = [
  { label: 'Platino', desc: 'Tengo el platino.' },
  { label: 'Completado', desc: 'Todo el contenido jugado, falta algún logro.' },
  { label: 'Pasado', desc: 'Historia pasada, no todo el secundario.' },
  { label: 'Empezado', desc: 'Empezado y pretendo terminarlo.' },
  { label: 'Abandonado', desc: 'Lo abandoné por algún motivo.' },
  { label: 'Probado', desc: 'Solo lo probé.' },
  { label: 'Sin probar', desc: 'Aún no lo probé.' },
  { label: 'No aplica', desc: 'No corresponde estado.' }
];

const LegendPanel = () => {
  return (
    <div className="panel panel--stacked legend-panel">
      <h2>Leyendas</h2>
      <div className="legend-grid">
        <div>
          <h3>Estados</h3>
          <ul>
            {statusLegend.map((item) => (
              <li key={item.label}>
                <strong>{item.label}:</strong> {item.desc}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Ranking</h3>
          <ul>
            {rankingLegend.map((item) => (
              <li key={item.label}>
                <strong>{item.label}:</strong> {item.desc}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LegendPanel;
