import { useEffect, useMemo, useState } from "react";
import GameFilters from "./components/GameFilters";
import GameForm from "./components/GameForm";
import GameList from "./components/GameList";
import BackupPanel from "./components/BackupPanel";
import LegendPanel from "./components/LegendPanel";
import LocalImportPanel from "./components/LocalImportPanel";
import { useGameStorage } from "./hooks/useGameStorage";
import { useGoogleAuth } from "./hooks/useGoogleAuth";
import { Game, GameRanking, GameStatus } from "./types/Game";

type SortOption = "titulo" | "ranking";

const rankingOrder: GameRanking[] = ["S+", "S", "A", "B", "C", "D", "E", "F", "G"];

const App = () => {
  const { games, addGame, addMany, updateGame, deleteGame, clearGames, exportJson, importJson } =
    useGameStorage();

  const { user, accessToken, loading: authLoading, signIn, signOut } = useGoogleAuth();
  const isAuthenticated = Boolean(user && accessToken);

  const [statusFilter, setStatusFilter] = useState<GameStatus | "todos">("todos");
  const [rankingFilter, setRankingFilter] = useState<GameRanking | "todos">("todos");
  const [sortBy, setSortBy] = useState<SortOption>("titulo");
  const [editing, setEditing] = useState<Game | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const itemsPerPage = 9;

  const filteredGames = useMemo(() => {
    const bySearch = search
      ? games.filter((game) => game.title.toLowerCase().includes(search.toLowerCase()))
      : games;

    const byStatus = statusFilter === "todos" ? bySearch : bySearch.filter((game) => game.status === statusFilter);

    const byRanking = rankingFilter === "todos" ? byStatus : byStatus.filter((game) => game.ranking === rankingFilter);

    if (sortBy === "ranking") {
      return [...byRanking].sort((a, b) => rankingOrder.indexOf(a.ranking) - rankingOrder.indexOf(b.ranking));
    }

    return [...byRanking].sort((a, b) => a.title.localeCompare(b.title, "es"));
  }, [games, search, statusFilter, rankingFilter, sortBy]);

  const pageCount = Math.max(1, Math.ceil(filteredGames.length / itemsPerPage));

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, rankingFilter, sortBy, search]);

  const pagedGames = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredGames.slice(start, start + itemsPerPage);
  }, [filteredGames, page]);

  const handleSearchSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleSubmit = (data: Omit<Game, "id" | "createdAt">, existingId?: string) => {
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

  const handleDeleteAll = () => {
    if (!games.length) return;
    const confirmed = window.confirm("Seguro que quieres borrar todos los registros?");
    if (confirmed) {
      clearGames();
      setPage(1);
    }
  };

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <p className="app__eyebrow">Games Progress Tracker</p>
          <h1>Tu lista de videojuegos en un solo lugar</h1>
          <p className="app__subtitle">Entra con tu cuenta, gestiona tus juegos y respaldalos en Google Drive.</p>
        </div>
        <div className="app__stats">
          <div className="stat">
            <span className="stat__label">Total</span>
            <span className="stat__value">{games.length}</span>
          </div>
          <div className="stat">
            <span className="stat__label">Sin probar</span>
            <span className="stat__value">{games.filter((g) => g.status === "Sin probar").length}</span>
          </div>
          <div className="stat">
            <span className="stat__label">Empezado</span>
            <span className="stat__value">{games.filter((g) => g.status === "Empezado").length}</span>
          </div>
          <div className="stat">
            <span className="stat__label">Completado</span>
            <span className="stat__value">{games.filter((g) => g.status === "Completado").length}</span>
          </div>
          <div className="stat">
            <span className="stat__label">Platino</span>
            <span className="stat__value">{games.filter((g) => g.status === "Platino").length}</span>
          </div>
          <div className="stat">
            <span className="stat__label">Abandonado</span>
            <span className="stat__value">{games.filter((g) => g.status === "Abandonado").length}</span>
          </div>
        </div>
      </header>

      <section className="panel auth-hero">
        <div className="hero-grid">
          <div className="hero-login">
            <h2>Inicio de Sesión</h2>
            <p className="muted">
              Primero inicia sesión para habilitar la lista de juegos y la sincronización con Google Drive.
            </p>
            <div className="auth-actions">
              {isAuthenticated ? (
                <>
                  <span className="pill pill--success pill--xl">
                    Sesión activa {user?.email ? `· ${user.email}` : ""}
                  </span>
                  <button className="button button--xl button--secondary" onClick={signOut} disabled={authLoading}>
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <button className="button button--xl" onClick={signIn} disabled={authLoading}>
                  Iniciar con Google
                </button>
              )}
            </div>
            <div className="hero-steps">
              <div className="step-card">
                <span className="pill">1</span>
                <p>Inicia sesión con Google.</p>
              </div>
              <div className="step-card">
                <span className="pill">2</span>
                <p>Gestiona tu lista de juegos.</p>
              </div>
              <div className="step-card">
                <span className="pill">3</span>
                <p>Respáldalos en Drive.</p>
              </div>
            </div>
          </div>
          <div className="hero-drive">
            <BackupPanel
              onExportJson={exportJson}
              onImportJson={importJson}
              onImportExcel={(items) => addMany(items)}
              showDrive
              showLocal={false}
              title="Respaldo en Google Drive"
              authContext={{ user, accessToken, loading: authLoading, signIn, signOut }}
            />
          </div>
        </div>
      </section>

      <main className="layout">
        <section className="panel">
          <h2>{editing ? "Editar juego" : "Agregar juego"}</h2>
          <GameForm
            key={editing?.id ?? "new"}
            initialGame={editing}
            onSubmit={handleSubmit}
            onCancelEdit={editing ? handleCancelEdit : undefined}
          />
        </section>

        <section className="panel panel--scroll">
          <div className="games-content">
            <div className="panel__header">
              <h2>Juegos guardados</h2>
              <div className="panel__controls">
                <form className="search-box" onSubmit={handleSearchSubmit}>
                  <label className="field search-box__field">
                    <span>Buscar</span>
                    <div className="search-box__row">
                      <input
                        type="text"
                        placeholder="Buscar por titulo..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                      />
                      <button type="submit" className="button button--ghost">
                        Buscar
                      </button>
                    </div>
                  </label>
                </form>
                <GameFilters
                  statusFilter={statusFilter}
                  rankingFilter={rankingFilter}
                  sortBy={sortBy}
                  onStatusChange={setStatusFilter}
                  onRankingChange={setRankingFilter}
                  onSortChange={setSortBy}
                />
              </div>
            </div>

            <GameList
              games={pagedGames}
              onEdit={handleEdit}
              onDelete={deleteGame}
              resetScrollKey={`${page}-${search}-${statusFilter}-${rankingFilter}-${sortBy}`}
            />
            <div className="table-footer">
              <div className="pagination">
                <button className="page-btn" onClick={() => setPage(1)} disabled={page === 1} aria-label="Primera pagina">
                  «
                </button>
                {Array.from({ length: pageCount }, (_, idx) => idx + 1)
                  .filter((n) => n >= page - 1 && n <= page + 4)
                  .map((n) => (
                    <button
                      key={n}
                      className={`page-btn ${n === page ? "page-btn--active" : ""}`}
                      onClick={() => setPage(n)}
                      aria-label={`Pagina ${n}`}
                    >
                      {n}
                    </button>
                  ))}
                <button className="page-btn" onClick={() => setPage(pageCount)} disabled={page === pageCount} aria-label="Ultima pagina">
                  »
                </button>
              </div>
              <button className="button button--danger delete-all-btn" onClick={handleDeleteAll} disabled={!games.length}>
                Borrar todos
              </button>
            </div>
          </div>
        </section>
      </main>

      <LocalImportPanel
        onExportJson={exportJson}
        onImportJson={importJson}
        onImportExcel={(items) => addMany(items)}
      />
      <LegendPanel />
      <footer className="app-footer">
        Creado por {" "}
        <a href="https://github.com/federicoroldos" target="_blank" rel="noreferrer">
          federicoroldos
        </a>
      </footer>
    </div>
  );
};

export default App;
