import { ChangeEvent, FormEvent, useState } from 'react';
import { Game, GameStatus } from '../types/Game';

type GameInput = Omit<Game, 'id' | 'createdAt'>;

interface Props {
  initialGame: Game | null;
  onSubmit: (data: GameInput, existingId?: string) => void;
  onCancelEdit?: () => void;
}

const defaultFormState: GameInput = {
  title: '',
  platform: '',
  status: 'pendiente',
  ranking: 'F',
  comment: ''
};

const GameForm = ({ initialGame, onSubmit, onCancelEdit }: Props) => {
  const [formState, setFormState] = useState<GameInput>(
    initialGame
      ? {
          title: initialGame.title,
          platform: initialGame.platform,
          status: initialGame.status,
          ranking: initialGame.ranking,
          comment: initialGame.comment
        }
      : defaultFormState
  );

  const [error, setError] = useState<string | null>(null);

  const handleChange =
    (key: keyof GameInput) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setFormState((prev) => ({ ...prev, [key]: event.target.value }));
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.title.trim()) {
      setError('El título es obligatorio');
      return;
    }

    setError(null);
    onSubmit(formState, initialGame?.id);
    setFormState(defaultFormState);
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Título *</span>
        <input
          type="text"
          value={formState.title}
          onChange={handleChange('title')}
          placeholder="Ej. Baldur's Gate 3"
          required
        />
      </label>

      <label className="field">
        <span>Plataforma</span>
        <input
          type="text"
          value={formState.platform}
          onChange={handleChange('platform')}
          placeholder="PC, PS5, Switch..."
        />
      </label>

      <label className="field">
        <span>Estado</span>
        <select value={formState.status} onChange={handleChange('status')}>
          <option value="pendiente">Pendiente</option>
          <option value="jugando">Jugando</option>
          <option value="pasado">Pasado</option>
        </select>
      </label>

      <label className="field">
        <span>Ranking</span>
        <select value={formState.ranking} onChange={handleChange('ranking')}>
          <option value="GOTY">GOTY</option>
          <option value="S">S</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
          <option value="E">E</option>
          <option value="F">F</option>
        </select>
      </label>

      <label className="field">
        <span>Comentario</span>
        <textarea
          value={formState.comment}
          onChange={handleChange('comment')}
          rows={3}
          placeholder="Notas rápidas, impresiones, etc."
        />
      </label>

      {error && <p className="form__error">{error}</p>}

      <div className="form__actions">
        {initialGame && onCancelEdit && (
          <button type="button" className="button button--ghost" onClick={onCancelEdit}>
            Cancelar
          </button>
        )}
        <button type="submit" className="button">
          {initialGame ? 'Guardar cambios' : 'Agregar juego'}
        </button>
      </div>
    </form>
  );
};

export default GameForm;
