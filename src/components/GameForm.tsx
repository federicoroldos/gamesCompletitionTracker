import { ChangeEvent, FormEvent, useState } from 'react';
import { Game } from '../types/Game';

type GameInput = Omit<Game, 'id' | 'createdAt'>;

interface Props {
  initialGame: Game | null;
  onSubmit: (data: GameInput, existingId?: string) => void;
  onCancelEdit?: () => void;
}

const defaultFormState: GameInput = {
  title: '',
  platform: '',
  status: 'Empezado',
  ranking: 'G',
  comment: '',
  releaseDate: '',
  publisher: '',
  genres: '',
  firstPlayedAt: '',
  startDate: '',
  endDate: '',
  lastSessionHours: null,
  yearsPlayed: '',
  totalHours: null
};

const GameForm = ({ initialGame, onSubmit, onCancelEdit }: Props) => {
  const [formState, setFormState] = useState<GameInput>(
    initialGame
      ? {
          title: initialGame.title,
          platform: initialGame.platform,
          status: initialGame.status,
          ranking: initialGame.ranking,
          comment: initialGame.comment,
          releaseDate: initialGame.releaseDate || '',
          publisher: initialGame.publisher || '',
          genres: initialGame.genres || '',
          firstPlayedAt: initialGame.firstPlayedAt || '',
          startDate: initialGame.startDate || '',
          endDate: initialGame.endDate || '',
          lastSessionHours: initialGame.lastSessionHours ?? null,
          yearsPlayed: initialGame.yearsPlayed || '',
          totalHours: initialGame.totalHours ?? null
        }
      : defaultFormState
  );

  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange =
    (key: keyof GameInput) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setFormState((prev) => ({ ...prev, [key]: value === '' ? '' : value }));
    };

  const handleNumberChange =
    (key: keyof GameInput) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setFormState((prev) => ({
        ...prev,
        [key]: value === '' ? null : Number(value)
      }));
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
      <div className="form-grid">
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
          <span>Plataforma(s)</span>
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
            <option value="Platino">Platino</option>
            <option value="Completado">Completado</option>
            <option value="Pasado">Pasado</option>
            <option value="Empezado">Empezado</option>
            <option value="Sin probar">Sin probar</option>
            <option value="Abandonado">Abandonado</option>
            <option value="Probado">Probado</option>
            <option value="No aplica">No aplica</option>
          </select>
        </label>

        <label className="field">
          <span>Ranking</span>
          <select value={formState.ranking} onChange={handleChange('ranking')}>
            <option value="S+">S+</option>
            <option value="S">S</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="E">E</option>
            <option value="F">F</option>
            <option value="G">G</option>
          </select>
        </label>
      </div>

      <div className="collapse-toggle">
        <button
          type="button"
          className="collapse-toggle__btn"
          onClick={() => setShowAdvanced((prev) => !prev)}
          aria-expanded={showAdvanced}
          aria-label={showAdvanced ? 'Ocultar campos avanzados' : 'Mostrar campos avanzados'}
        >
          <span className={`chevron ${showAdvanced ? 'chevron--up' : 'chevron--down'}`} />
          <span>{showAdvanced ? 'Ocultar campos avanzados' : 'Mostrar campos avanzados'}</span>
        </button>
      </div>

      {showAdvanced && (
        <div className="form-grid">
          <label className="field">
            <span>Fecha de lanzamiento</span>
            <input
              type="text"
              inputMode="numeric"
              value={formState.releaseDate || ''}
              onChange={handleChange('releaseDate')}
              placeholder="dd/mm/yyyy"
            />
          </label>

          <label className="field">
            <span>Publisher / Desarrollador</span>
            <input
              type="text"
              value={formState.publisher || ''}
              onChange={handleChange('publisher')}
              placeholder="Ej. FromSoftware, Bandai Namco"
            />
          </label>

          <label className="field">
            <span>Género(s)</span>
            <input
              type="text"
              value={formState.genres || ''}
              onChange={handleChange('genres')}
              placeholder="Acción, RPG, Soulslike"
            />
          </label>

          <label className="field">
            <span>Fecha primera vez</span>
            <input
              type="text"
              inputMode="numeric"
              value={formState.firstPlayedAt || ''}
              onChange={handleChange('firstPlayedAt')}
              placeholder="dd/mm/yyyy"
            />
          </label>

          <label className="field">
            <span>Fecha comienzo (última partida)</span>
            <input
              type="text"
              inputMode="numeric"
              value={formState.startDate || ''}
              onChange={handleChange('startDate')}
              placeholder="dd/mm/yyyy"
            />
          </label>

          <label className="field">
            <span>Fecha de fin</span>
            <input
              type="text"
              inputMode="numeric"
              value={formState.endDate || ''}
              onChange={handleChange('endDate')}
              placeholder="dd/mm/yyyy"
            />
          </label>

          <label className="field">
            <span>Horas jugadas (última partida)</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={formState.lastSessionHours ?? ''}
              onChange={handleNumberChange('lastSessionHours')}
              placeholder="Ej. 12.5"
            />
          </label>

          <label className="field">
            <span>Años pasado</span>
            <input
              type="text"
              value={formState.yearsPlayed || ''}
              onChange={handleChange('yearsPlayed')}
              placeholder="Ej. 2018, 2021"
            />
          </label>

          <label className="field">
            <span>Horas totales</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={formState.totalHours ?? ''}
              onChange={handleNumberChange('totalHours')}
              placeholder="Ej. 140"
            />
          </label>
        </div>
      )}

      {showAdvanced && (
        <label className="field">
          <span>Comentario</span>
          <textarea
            value={formState.comment}
            onChange={handleChange('comment')}
            rows={3}
            placeholder="Notas rápidas, impresiones, etc."
          />
        </label>
      )}

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
