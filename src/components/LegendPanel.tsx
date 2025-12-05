import { useI18n } from '../i18n';

const LegendPanel = () => {
  const { t } = useI18n();

  return (
    <div className="panel panel--stacked legend-panel">
      <h2>{t.legend.title}</h2>
      <div className="legend-grid">
        <div>
          <h3>{t.legend.statusTitle}</h3>
          <ul>
            {t.legend.statuses.map((item) => (
              <li key={item.label}>
                <strong>{item.label}:</strong> {item.desc}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>{t.legend.rankingTitle}</h3>
          <ul>
            {t.legend.rankings.map((item) => (
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
