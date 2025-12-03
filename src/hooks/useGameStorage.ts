import { useEffect, useState } from 'react';
import { Game, GameRanking } from '../types/Game';

const STORAGE_KEY = 'gametracker_games';

type GameInput = Omit<Game, 'id' | 'createdAt'>;

const DEFAULT_RANKING: GameRanking = 'F';

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
        ranking: item.ranking ?? DEFAULT_RANKING
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

  return { games, addGame, updateGame, deleteGame };
};
