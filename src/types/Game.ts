export type GameStatus =
  | 'Platino'
  | 'Completado'
  | 'Pasado'
  | 'Empezado'
  | 'Sin probar'
  | 'Abandonado'
  | 'Probado'
  | 'No aplica';

export type GameRanking = 'S+' | 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export interface Game {
  id: string;
  title: string;
  platform: string;
  status: GameStatus;
  ranking: GameRanking;
  comment: string;
  createdAt: string;
  releaseDate?: string;
  publisher?: string;
  genres?: string;
  firstPlayedAt?: string;
  startDate?: string;
  endDate?: string;
  lastSessionHours?: number | null;
  yearsPlayed?: string;
  totalHours?: number | null;
}
