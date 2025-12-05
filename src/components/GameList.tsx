import { useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import { useI18n } from "../i18n";
import { Game } from "../types/Game";

interface Props {
  games: Game[];
  onEdit: (game: Game) => void;
  onDelete: (id: string) => void;
  resetScrollKey?: string | number;
}

const GameList = ({ games, onEdit, onDelete, resetScrollKey }: Props) => {
  const { t, statusLabel, formatDate } = useI18n();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const tableCols = "1.1fr 0.55fr 0.45fr 0.32fr 0.62fr 0.55fr 0.8fr";
  const tableColsWide =
    "4.0fr 1.5fr 1.8fr 1.3fr 3.5fr 3.5fr 1.9fr 1.9fr 1.9fr 1.9fr 1.9fr 1.9fr 1.9fr 4.0fr 2.0fr";
  const tableMinWidth = "2900px";

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--table-cols", tableCols);
    root.style.setProperty("--table-cols-wide", tableColsWide);
    root.style.setProperty("--table-min-width", tableMinWidth);
  }, [resetScrollKey]);

  useEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.scrollLeft = 0;
    }
  }, [resetScrollKey]);

  if (!games.length) {
    return <p className="muted">{t.list.empty}</p>;
  }

  type TableVars = CSSProperties &
    Record<"--table-cols" | "--table-cols-wide" | "--table-min-width", string>;

  const columnStyles: TableVars = {
    "--table-cols": tableCols,
    "--table-cols-wide": tableColsWide,
    "--table-min-width": tableMinWidth
  };

  const wideGridStyle: CSSProperties = {
    gridTemplateColumns: tableColsWide,
    minWidth: tableMinWidth
  };

  return (
    <div className="table-wrapper" ref={wrapperRef}>
      <div className="table wide" style={columnStyles}>
        <div className="table__header wide" style={wideGridStyle}>
          <span className="table__text-wrap">{t.list.headers.title}</span>
          <span className="table__text-wrap">{t.list.headers.platform}</span>
          <span>{t.list.headers.status}</span>
          <span>{t.list.headers.ranking}</span>
          <span className="table__text-wrap">{t.list.headers.publisher}</span>
          <span className="table__text-wrap">{t.list.headers.genres}</span>
          <span>{t.list.headers.releaseDate}</span>
          <span>{t.list.headers.firstPlayed}</span>
          <span>{t.list.headers.startDate}</span>
          <span>{t.list.headers.endDate}</span>
          <span>{t.list.headers.lastSession}</span>
          <span>{t.list.headers.yearsPlayed}</span>
          <span>{t.list.headers.totalHours}</span>
          <span>{t.list.headers.comment}</span>
          <span>{t.list.headers.actions}</span>
        </div>

        {games.map((game) => {
          const statusClass = game.status.replace(/\s+/g, "-");
          return (
            <div key={game.id} className="table__row wide" style={wideGridStyle}>
              <span className="text-strong table__text-wrap">{game.title}</span>
              <span className="table__text-wrap">{game.platform || "-"}</span>
              <span className={`badge badge--${statusClass}`}>{statusLabel(game.status)}</span>
              <span className="badge badge--ranking">{game.ranking}</span>
              <span className="table__text-wrap">{game.publisher || "-"}</span>
              <span className="table__text-wrap">{game.genres || "-"}</span>
              <span>{formatDate(game.releaseDate)}</span>
              <span>{formatDate(game.firstPlayedAt)}</span>
              <span>{formatDate(game.startDate)}</span>
              <span>{formatDate(game.endDate)}</span>
              <span>{game.lastSessionHours ?? "-"}</span>
              <span>{game.yearsPlayed || "-"}</span>
              <span>{game.totalHours ?? "-"}</span>
              <span className="table__comment">{game.comment || "-"}</span>
              <span className="table__actions">
                <button className="button button--ghost" onClick={() => onEdit(game)}>
                  {t.list.actions.edit}
                </button>
                <button
                  className="button button--danger"
                  onClick={() => onDelete(game.id)}
                  aria-label={`${t.list.actions.delete} ${game.title}`}
                >
                  {t.list.actions.delete}
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
