import { GameRanking, GameStatus } from '../types/Game';

type SortOption = 'fecha' | 'titulo' | 'ranking';

interface Props {
  statusFilter: GameStatus | 'todos';
  rankingFilter: GameRanking | 'todos';
  sortBy: SortOption;
  onStatusChange: (value: GameStatus | 'todos') => void;
  onRankingChange: (value: GameRanking | 'todos') => void;
  onSortChange: (value: SortOption) => void;
}

const statusLabels: Record<GameStatus | 'todos', string> = {
  todos: 'Todos',
  pendiente: 'Pendiente',
  jugando: 'Jugando',
  pasado: 'Pasado'
};

const rankingOptions: Record<GameRanking | 'todos', string> = {
  todos: 'Todos',
  GOTY: 'GOTY',
  S: 'S',
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
  E: 'E',
  F: 'F'
};

const GameFilters = ({
  statusFilter,
  rankingFilter,
  sortBy,
  onStatusChange,
  onRankingChange,
  onSortChange
}: Props) => {
  return (
    <div className="filters">
      <label className="field">
        <span>Estado</span>
        <select
          value={statusFilter}
          onChange={(event) => onStatusChange(event.target.value as GameStatus | 'todos')}
        >
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Ranking</span>
        <select
          value={rankingFilter}
          onChange={(event) => onRankingChange(event.target.value as GameRanking | 'todos')}
        >
          {Object.entries(rankingOptions).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Ordenar por</span>
        <select
          value={sortBy}
          onChange={(event) => onSortChange(event.target.value as SortOption)}
        >
          <option value="fecha">Fecha (más reciente)</option>
          <option value="titulo">Título (A-Z)</option>
          <option value="ranking">Ranking</option>
        </select>
      </label>
    </div>
  );
};

export default GameFilters;
