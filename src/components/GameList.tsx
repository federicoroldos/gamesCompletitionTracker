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

  return (
    <div className="table">
      <div className="table__header">
        <span>Título</span>
        <span>Plataforma</span>
        <span>Estado</span>
        <span>Ranking</span>
        <span>Comentario</span>
        <span>Creado</span>
        <span>Acciones</span>
      </div>

      {games.map((game) => (
        <div key={game.id} className="table__row">
          <span className="text-strong">{game.title}</span>
          <span>{game.platform || '—'}</span>
          <span className={`badge badge--${game.status}`}>{game.status}</span>
          <span className="badge badge--ranking">{game.ranking}</span>
          <span className="table__comment">{game.comment || '—'}</span>
          <span>{new Date(game.createdAt).toLocaleDateString('es-ES')}</span>
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
      ))}
    </div>
  );
};

export default GameList;
