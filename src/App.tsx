import { useEffect, useMemo, useState } from "react";
import BackupPanel from "./components/BackupPanel";
import GameFilters from "./components/GameFilters";
import GameForm from "./components/GameForm";
import GameList from "./components/GameList";
import LanguageSwitcher from "./components/LanguageSwitcher";
import LegendPanel from "./components/LegendPanel";
import LocalImportPanel from "./components/LocalImportPanel";
import { useGameStorage } from "./hooks/useGameStorage";
import { useGoogleAuth } from "./hooks/useGoogleAuth";
import { useI18n } from "./i18n";
import { Game, GameRanking, GameStatus } from "./types/Game";

type SortOption = "titulo" | "ranking";

const rankingOrder: GameRanking[] = ["S+", "S", "A", "B", "C", "D", "E", "F", "G"];

const App = () => {
  const { games, addGame, addMany, updateGame, deleteGame, clearGames, exportJson, importJson } =
    useGameStorage();

  const { user, accessToken, loading: authLoading, signIn, signOut } = useGoogleAuth();
  const { t, lang } = useI18n();
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

    return [...byRanking].sort((a, b) => a.title.localeCompare(b.title, lang === "en" ? "en" : "es"));
  }, [games, search, statusFilter, rankingFilter, sortBy, lang]);

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
    const confirmed = window.confirm(t.list.actions.confirmDeleteAll);
    if (confirmed) {
      clearGames();
      setPage(1);
    }
  };

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <p className="app__eyebrow">{t.header.eyebrow}</p>
          <h1>{t.header.title}</h1>
          <p className="app__subtitle">{t.header.subtitle}</p>
        </div>
        <div className="app__header-actions">
          <LanguageSwitcher />
          <div className="app__stats">
            <div className="stat">
              <span className="stat__label">{t.stats.total}</span>
              <span className="stat__value">{games.length}</span>
            </div>
            <div className="stat">
              <span className="stat__label">{t.stats.unplayed}</span>
              <span className="stat__value">{games.filter((g) => g.status === "Sin probar").length}</span>
            </div>
            <div className="stat">
              <span className="stat__label">{t.stats.started}</span>
              <span className="stat__value">{games.filter((g) => g.status === "Empezado").length}</span>
            </div>
            <div className="stat">
              <span className="stat__label">{t.stats.completed}</span>
              <span className="stat__value">{games.filter((g) => g.status === "Completado").length}</span>
            </div>
            <div className="stat">
              <span className="stat__label">{t.stats.platinum}</span>
              <span className="stat__value">{games.filter((g) => g.status === "Platino").length}</span>
            </div>
            <div className="stat">
              <span className="stat__label">{t.stats.abandoned}</span>
              <span className="stat__value">{games.filter((g) => g.status === "Abandonado").length}</span>
            </div>
          </div>
        </div>
      </header>

      <section className="panel auth-hero">
        <div className="hero-grid">
          <div className="hero-login">
            <h2>{t.auth.title}</h2>
            <p className="muted">{t.auth.description}</p>
            <div className="auth-actions">
              {isAuthenticated ? (
                <>
                  <span className="pill pill--success pill--xl">
                    {t.auth.activeSession} {user?.email ? `· ${user.email}` : ""}
                  </span>
                  <button className="button button--xl button--secondary" onClick={signOut} disabled={authLoading}>
                    {t.auth.signOut}
                  </button>
                </>
              ) : (
                <button className="button button--xl" onClick={signIn} disabled={authLoading}>
                  {t.auth.signIn}
                </button>
              )}
            </div>
            <div className="hero-steps">
              <div className="step-card">
                <span className="pill">1</span>
                <p>{t.steps[0]}</p>
              </div>
              <div className="step-card">
                <span className="pill">2</span>
                <p>{t.steps[1]}</p>
              </div>
              <div className="step-card">
                <span className="pill">3</span>
                <p>{t.steps[2]}</p>
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
              title={t.backup.title}
              authContext={{ user, accessToken, loading: authLoading, signIn, signOut }}
            />
          </div>
        </div>
      </section>

      <main className="layout">
        <section className="panel">
          <h2>{editing ? t.form.editTitle : t.form.newTitle}</h2>
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
              <h2>{t.list.title}</h2>
              <div className="panel__controls">
                <form className="search-box" onSubmit={handleSearchSubmit}>
                  <label className="field search-box__field">
                    <span>{t.search.label}</span>
                    <div className="search-box__row">
                      <input
                        type="text"
                        placeholder={t.search.placeholder}
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                      />
                      <button type="submit" className="button button--ghost">
                        {t.search.button}
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
                <button className="page-btn" onClick={() => setPage(1)} disabled={page === 1} aria-label={t.list.pagination.first}>
                  {"<<"}
                </button>
                {Array.from({ length: pageCount }, (_, idx) => idx + 1)
                  .filter((n) => n >= page - 1 && n <= page + 4)
                  .map((n) => (
                    <button
                      key={n}
                      className={`page-btn ${n === page ? "page-btn--active" : ""}`}
                      onClick={() => setPage(n)}
                      aria-label={`${t.list.pagination.page} ${n}`}
                    >
                      {n}
                    </button>
                  ))}
                <button className="page-btn" onClick={() => setPage(pageCount)} disabled={page === pageCount} aria-label={t.list.pagination.last}>
                  {">>"}
                </button>
              </div>
              <button className="button button--danger delete-all-btn" onClick={handleDeleteAll} disabled={!games.length}>
                {t.list.actions.deleteAll}
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
        {t.footer.createdBy}{" "}
        <a href="https://github.com/federicoroldos" target="_blank" rel="noreferrer">
          federicoroldos
        </a>
      </footer>
    </div>
  );
};

export default App;
