import { useMemo, useState } from 'react';
import GameFilters from './components/GameFilters';
import GameForm from './components/GameForm';
import GameList from './components/GameList';
import { useGameStorage } from './hooks/useGameStorage';
import { Game, GameRanking, GameStatus } from './types/Game';

type SortOption = 'fecha' | 'titulo' | 'ranking';

const rankingOrder: GameRanking[] = ['GOTY', 'S', 'A', 'B', 'C', 'D', 'E', 'F'];

const App = () => {
  const { games, addGame, updateGame, deleteGame } = useGameStorage();
  const [statusFilter, setStatusFilter] = useState<GameStatus | 'todos'>('todos');
  const [rankingFilter, setRankingFilter] = useState<GameRanking | 'todos'>('todos');
  const [sortBy, setSortBy] = useState<SortOption>('fecha');
  const [editing, setEditing] = useState<Game | null>(null);

  const filteredGames = useMemo(() => {
    const byStatus =
      statusFilter === 'todos'
        ? games
        : games.filter((game) => game.status === statusFilter);

    const byRanking =
      rankingFilter === 'todos'
        ? byStatus
        : byStatus.filter((game) => game.ranking === rankingFilter);

    if (sortBy === 'titulo') {
      return [...byRanking].sort((a, b) => a.title.localeCompare(b.title, 'es'));
    }

    if (sortBy === 'ranking') {
      return [...byRanking].sort(
        (a, b) => rankingOrder.indexOf(a.ranking) - rankingOrder.indexOf(b.ranking)
      );
    }

    return [...byRanking].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [games, statusFilter, rankingFilter, sortBy]);

  const handleSubmit = (
    data: Omit<Game, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      updateGame(existingId, data);
      setEditing(null);
      return;
    }

    addGame(data);
  };

  const handleEdit = (game: Game) => {
    setEditing(game);
  };

  const handleCancelEdit = () => setEditing(null);

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <p className="app__eyebrow">GameTracker</p>
          <h1>Tu lista de videojuegos en un solo lugar</h1>
          <p className="app__subtitle">
            Agrega, edita y organiza los juegos que quieres jugar, estás jugando o ya
            terminaste.
          </p>
        </div>
        <div className="app__stats">
          <div className="stat">
            <span className="stat__label">Total</span>
            <span className="stat__value">{games.length}</span>
          </div>
          <div className="stat">
            <span className="stat__label">Jugando</span>
            <span className="stat__value">
              {games.filter((g) => g.status === 'jugando').length}
            </span>
          </div>
          <div className="stat">
            <span className="stat__label">Pendientes</span>
            <span className="stat__value">
              {games.filter((g) => g.status === 'pendiente').length}
            </span>
          </div>
        </div>
      </header>

      <main className="layout">
        <section className="panel">
          <h2>{editing ? 'Editar juego' : 'Agregar juego'}</h2>
          <GameForm
            key={editing?.id ?? 'new'}
            initialGame={editing}
            onSubmit={handleSubmit}
            onCancelEdit={editing ? handleCancelEdit : undefined}
          />
        </section>

        <section className="panel">
          <div className="panel__header">
          <h2>Juegos guardados</h2>
          <GameFilters
            statusFilter={statusFilter}
            rankingFilter={rankingFilter}
            sortBy={sortBy}
            onStatusChange={setStatusFilter}
            onRankingChange={setRankingFilter}
            onSortChange={setSortBy}
          />
        </div>

          <GameList games={filteredGames} onEdit={handleEdit} onDelete={deleteGame} />
        </section>
      </main>
    </div>
  );
};

export default App;
