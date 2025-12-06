import { useI18n } from "../i18n";
import { GameRanking, GameStatus } from "../types/Game";

type SortOption = "titulo" | "ranking";

interface Props {
  statusFilter: GameStatus | "todos";
  rankingFilter: GameRanking | "todos";
  sortBy: SortOption;
  onStatusChange: (value: GameStatus | "todos") => void;
  onRankingChange: (value: GameRanking | "todos") => void;
  onSortChange: (value: SortOption) => void;
}

const GameFilters = ({
  statusFilter,
  rankingFilter,
  sortBy,
  onStatusChange,
  onRankingChange,
  onSortChange
}: Props) => {
  const { t, statusLabel, rankingLabel } = useI18n();
  const statusOptions = Object.keys(t.statuses) as (GameStatus | "todos")[];
  const rankingOptions = Object.keys(t.rankingLabels) as (GameRanking | "todos")[];

  return (
    <div className="filters">
      <label className="field">
        <span>{t.filters.status}</span>
        <select
          value={statusFilter}
          onChange={(event) => onStatusChange(event.target.value as GameStatus | "todos")}
        >
          {statusOptions.map((value) => (
            <option key={value} value={value}>
              {statusLabel(value)}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>{t.filters.ranking}</span>
        <select
          value={rankingFilter}
          onChange={(event) => onRankingChange(event.target.value as GameRanking | "todos")}
        >
          {rankingOptions.map((value) => (
            <option key={value} value={value}>
              {rankingLabel(value)}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>{t.filters.sortBy}</span>
        <select
          value={sortBy}
          onChange={(event) => onSortChange(event.target.value as SortOption)}
        >
          <option value="titulo">{t.filters.sortTitle}</option>
          <option value="ranking">{t.filters.sortRanking}</option>
        </select>
      </label>
    </div>
  );
};

export default GameFilters;
