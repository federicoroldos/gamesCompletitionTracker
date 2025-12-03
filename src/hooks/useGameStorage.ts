import { useEffect, useState } from 'react';
import { Game, GameRanking, GameStatus } from '../types/Game';

const STORAGE_KEY = 'gametracker_games';

type GameInput = Omit<Game, 'id' | 'createdAt'>;

const DEFAULT_RANKING: GameRanking = 'G';
const DEFAULT_STATUS: GameStatus = 'Probado';
const VALID_STATUSES: GameStatus[] = [
  'Platino',
  'Completado',
  'Pasado',
  'Empezado',
  'Sin probar',
  'Abandonado',
  'Probado',
  'No aplica'
];
const VALID_RANKINGS: GameRanking[] = ['S+', 'S', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];

const loadGames = (): Game[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    // Datos mínimos para no romper la UI si hay basura en localStorage.
    return parsed
      .filter(
        (item): item is Game =>
          Boolean(item) &&
          typeof item === 'object' &&
          'id' in (item as Game) &&
          'title' in (item as Game) &&
          'createdAt' in (item as Game)
      )
      .map((item) => ({
        ...item,
        ranking: VALID_RANKINGS.includes(item.ranking as GameRanking)
          ? (item.ranking as GameRanking)
          : DEFAULT_RANKING,
        status: VALID_STATUSES.includes(item.status as GameStatus)
          ? (item.status as GameStatus)
          : DEFAULT_STATUS,
        lastSessionHours: item.lastSessionHours ?? null,
        totalHours: item.totalHours ?? null
      }));
  } catch {
    return [];
  }
};

export const useGameStorage = () => {
  const [games, setGames] = useState<Game[]>(() => loadGames());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
  }, [games]);

  const addGame = (input: GameInput) => {
    const newGame: Game = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };

    setGames((prev) => [...prev, newGame]);
  };

  const updateGame = (id: string, input: GameInput) => {
    setGames((prev) => prev.map((game) => (game.id === id ? { ...game, ...input } : game)));
  };

  const deleteGame = (id: string) => {
    setGames((prev) => prev.filter((game) => game.id !== id));
  };

  const exportJson = () => JSON.stringify(games, null, 2);

  const importJson = (json: string) => {
    try {
      const data = JSON.parse(json);
      if (!Array.isArray(data)) {
        throw new Error('El archivo no tiene el formato esperado');
      }
      const sanitized = data
        .map((item) => ({
          ...item,
          ranking: (item.ranking as GameRanking) ?? DEFAULT_RANKING
        }))
        .filter(
          (item): item is Game =>
            Boolean(item.id) &&
            typeof item.id === 'string' &&
            Boolean(item.title) &&
            typeof item.title === 'string' &&
            Boolean(item.createdAt)
        );
      setGames(sanitized);
      return { ok: true, count: sanitized.length };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al importar JSON';
      return { ok: false, message };
    }
  };

  return { games, addGame, updateGame, deleteGame, exportJson, importJson };
};
