import { Game } from '../types/Game';

interface Props {
  games: Game[];
  onEdit: (game: Game) => void;
  onDelete: (id: string) => void;
}

const emptyMessage =
  'Aún no tienes juegos cargados. Agrega uno desde el formulario para empezar.';

const GameList = ({ games, onEdit, onDelete }: Props) => {
  if (!games.length) {
    return <p className="muted">{emptyMessage}</p>;
  }

  const formatter = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const formatDate = (value?: string) => {
    if (!value) return '—';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '—' : formatter.format(d);
  };

  return (
    <div className="table-wrapper">
      <div className="table wide">
        <div className="table__header wide">
          <span>Título</span>
          <span>Plataforma</span>
          <span>Estado</span>
          <span>Ranking</span>
          <span>Publisher</span>
          <span>Géneros</span>
          <span>Fecha lanzamiento</span>
          <span>Primera vez</span>
          <span>Inicio última</span>
          <span>Fin</span>
          <span>Horas última</span>
          <span>Años pasado</span>
          <span>Horas totales</span>
          <span>Comentario</span>
          <span>Creado</span>
          <span>Acciones</span>
        </div>

        {games.map((game) => {
          const statusClass = game.status.replace(/\s+/g, '-');
          return (
            <div key={game.id} className="table__row wide">
              <span className="text-strong">{game.title}</span>
              <span>{game.platform || '—'}</span>
              <span className={`badge badge--${statusClass}`}>{game.status}</span>
              <span className="badge badge--ranking">{game.ranking}</span>
            <span>{game.publisher || '—'}</span>
            <span className="table__comment">{game.genres || '—'}</span>
            <span>{formatDate(game.releaseDate)}</span>
            <span>{formatDate(game.firstPlayedAt)}</span>
            <span>{formatDate(game.startDate)}</span>
            <span>{formatDate(game.endDate)}</span>
            <span>{game.lastSessionHours ?? '—'}</span>
            <span>{game.yearsPlayed || '—'}</span>
            <span>{game.totalHours ?? '—'}</span>
            <span className="table__comment">{game.comment || '—'}</span>
            <span>{formatDate(game.createdAt)}</span>
            <span className="table__actions">
              <button className="button button--ghost" onClick={() => onEdit(game)}>
                Editar
              </button>
              <button
                className="button button--danger"
                onClick={() => onDelete(game.id)}
                aria-label={`Eliminar ${game.title}`}
              >
                Eliminar
              </button>
            </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GameList;
