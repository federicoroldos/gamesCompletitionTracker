export type GameStatus = 'pendiente' | 'jugando' | 'pasado';
export type GameRanking = 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'GOTY';

export interface Game {
  id: string;
  title: string;
  platform: string;
  status: GameStatus;
  ranking: GameRanking;
  comment: string;
  createdAt: string;
}
