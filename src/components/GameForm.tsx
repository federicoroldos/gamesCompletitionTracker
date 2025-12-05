import { ChangeEvent, FormEvent, useState } from 'react';
import { useI18n } from '../i18n';
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

const statusValues: GameInput['status'][] = [
  'Platino',
  'Completado',
  'Pasado',
  'Empezado',
  'Sin probar',
  'Abandonado',
  'Probado',
  'No aplica'
];

const rankingValues: GameInput['ranking'][] = ['S+', 'S', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];

const GameForm = ({ initialGame, onSubmit, onCancelEdit }: Props) => {
  const { t, statusLabel, rankingLabel } = useI18n();
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
      setError(t.form.errorTitle);
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
          <span>{t.form.labels.title}</span>
          <input
            type="text"
            value={formState.title}
            onChange={handleChange('title')}
            placeholder={t.form.placeholders.title}
            required
          />
        </label>

        <label className="field">
          <span>{t.form.labels.platform}</span>
          <input
            type="text"
            value={formState.platform}
            onChange={handleChange('platform')}
            placeholder={t.form.placeholders.platform}
          />
        </label>

        <label className="field">
          <span>{t.form.labels.status}</span>
          <select value={formState.status} onChange={handleChange('status')}>
            {statusValues.map((value) => (
              <option key={value} value={value}>
                {statusLabel(value)}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>{t.form.labels.ranking}</span>
          <select value={formState.ranking} onChange={handleChange('ranking')}>
            {rankingValues.map((value) => (
              <option key={value} value={value}>
                {rankingLabel(value)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="collapse-toggle">
        <button
          type="button"
          className="collapse-toggle__btn"
          onClick={() => setShowAdvanced((prev) => !prev)}
          aria-expanded={showAdvanced}
          aria-label={showAdvanced ? t.form.toggleHide : t.form.toggleShow}
        >
          <span className={`chevron ${showAdvanced ? 'chevron--up' : 'chevron--down'}`} />
          <span>{showAdvanced ? t.form.toggleHide : t.form.toggleShow}</span>
        </button>
      </div>

      {showAdvanced && (
        <div className="form-grid">
          <label className="field">
            <span>{t.form.labels.releaseDate}</span>
            <input
              type="text"
              inputMode="numeric"
              value={formState.releaseDate || ''}
              onChange={handleChange('releaseDate')}
              placeholder={t.form.placeholders.releaseDate}
            />
          </label>

          <label className="field">
            <span>{t.form.labels.publisher}</span>
            <input
              type="text"
              value={formState.publisher || ''}
              onChange={handleChange('publisher')}
              placeholder={t.form.placeholders.publisher}
            />
          </label>

          <label className="field">
            <span>{t.form.labels.genres}</span>
            <input
              type="text"
              value={formState.genres || ''}
              onChange={handleChange('genres')}
              placeholder={t.form.placeholders.genres}
            />
          </label>

          <label className="field">
            <span>{t.form.labels.firstPlayed}</span>
            <input
              type="text"
              inputMode="numeric"
              value={formState.firstPlayedAt || ''}
              onChange={handleChange('firstPlayedAt')}
              placeholder={t.form.placeholders.firstPlayed}
            />
          </label>

          <label className="field">
            <span>{t.form.labels.startDate}</span>
            <input
              type="text"
              inputMode="numeric"
              value={formState.startDate || ''}
              onChange={handleChange('startDate')}
              placeholder={t.form.placeholders.startDate}
            />
          </label>

          <label className="field">
            <span>{t.form.labels.endDate}</span>
            <input
              type="text"
              inputMode="numeric"
              value={formState.endDate || ''}
              onChange={handleChange('endDate')}
              placeholder={t.form.placeholders.endDate}
            />
          </label>

          <label className="field">
            <span>{t.form.labels.lastSession}</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={formState.lastSessionHours ?? ''}
              onChange={handleNumberChange('lastSessionHours')}
              placeholder={t.form.placeholders.lastSession}
            />
          </label>

          <label className="field">
            <span>{t.form.labels.yearsPlayed}</span>
            <input
              type="text"
              value={formState.yearsPlayed || ''}
              onChange={handleChange('yearsPlayed')}
              placeholder={t.form.placeholders.yearsPlayed}
            />
          </label>

          <label className="field">
            <span>{t.form.labels.totalHours}</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={formState.totalHours ?? ''}
              onChange={handleNumberChange('totalHours')}
              placeholder={t.form.placeholders.totalHours}
            />
          </label>
        </div>
      )}

      {showAdvanced && (
        <label className="field">
          <span>{t.form.labels.comment}</span>
          <textarea
            value={formState.comment}
            onChange={handleChange('comment')}
            rows={3}
            placeholder={t.form.placeholders.comment}
          />
        </label>
      )}

      {error && <p className="form__error">{error}</p>}

      <div className="form__actions">
        {initialGame && onCancelEdit && (
          <button type="button" className="button button--ghost" onClick={onCancelEdit}>
            {t.form.cancel}
          </button>
        )}
        <button type="submit" className="button">
          {initialGame ? t.form.save : t.form.add}
        </button>
      </div>
    </form>
  );
};

export default GameForm;
