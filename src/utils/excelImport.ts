import { Game, GameRanking, GameStatus } from '../types/Game';
import * as XLSX from 'xlsx';

type GameInput = Omit<Game, 'id' | 'createdAt'>;

const STATUS_VALUES: GameStatus[] = [
  'Platino',
  'Completado',
  'Pasado',
  'Empezado',
  'Sin probar',
  'Abandonado',
  'Probado',
  'No aplica'
];

const RANKING_VALUES: GameRanking[] = ['S+', 'S', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];

const trimString = (value: unknown) => String(value ?? '').trim();

const normalizeCell = (value: unknown) => {
  if (typeof value === 'string') return value.trim();
  return value;
};

const toStatus = (value: unknown): GameStatus => {
  const s = trimString(value);
  return STATUS_VALUES.includes(s as GameStatus) ? (s as GameStatus) : 'Probado';
};

const toRanking = (value: unknown): GameRanking => {
  const s = trimString(value);
  return RANKING_VALUES.includes(s as GameRanking) ? (s as GameRanking) : 'G';
};

const toDateString = (value: unknown): string => {
  if (value instanceof Date) {
    return formatDate(value);
  }
  if (typeof value === 'number') {
    const d = XLSX.SSF.parse_date_code(value);
    if (d) {
      const jsDate = new Date(d.y, (d.m ?? 1) - 1, d.d ?? 1);
      return formatDate(jsDate);
    }
  }
  if (typeof value === 'string') {
    const clean = value.trim();
    if (!clean) return '';
    const parsed = new Date(clean);
    if (!Number.isNaN(parsed.getTime())) {
      return formatDate(parsed);
    }
    return clean;
  }
  return '';
};

const formatDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

export const parseExcelFile = async (file: File): Promise<GameInput[]> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });

  // Header is in row 3 (index 2)
  const header = rows[2] || [];
  const indexOf = (name: string) =>
    header.findIndex((h) => typeof h === 'string' && h.trim().toLowerCase().startsWith(name));

  const idxNombre = indexOf('nombre');
  const idxPlataforma = indexOf('plataforma');
  const idxEstado = indexOf('estado');
  const idxTier = indexOf('tier');
  const idxNotas = indexOf('nota');
  const idxRelease = indexOf('fecha de lanzamiento');
  const idxPublisher = indexOf('publisher');
  const idxGenero = indexOf('género');
  const idxPrimera = indexOf('fecha primera');
  const idxInicio = indexOf('fecha de comienzo');
  const idxFin = indexOf('fecha de fin');
  const idxHorasUlt = indexOf('horas jugadas');
  // Soporta tanto el nombre nuevo como el anterior para compatibilidad con archivos viejos.
  const idxYears =
    indexOf('año completado') >= 0 ? indexOf('año completado') : indexOf('años pasado');
  const idxHorasTot = indexOf('horas totales');

  const dataRows = rows.slice(3); // start after header
  const games: GameInput[] = [];

  for (const row of dataRows) {
    if (!row || row.length === 0) continue;
    const normalizedRow = row.map(normalizeCell);
    const title = normalizedRow[idxNombre];
    if (!title) continue;

    const game: GameInput = {
      title: trimString(title),
      platform: idxPlataforma >= 0 ? trimString(normalizedRow[idxPlataforma]) : '',
      status: toStatus(idxEstado >= 0 ? normalizedRow[idxEstado] : ''),
      ranking: toRanking(idxTier >= 0 ? normalizedRow[idxTier] : ''),
      comment: idxNotas >= 0 ? trimString(normalizedRow[idxNotas]) : '',
      releaseDate: toDateString(idxRelease >= 0 ? normalizedRow[idxRelease] : ''),
      publisher: idxPublisher >= 0 ? trimString(normalizedRow[idxPublisher]) : '',
      genres: idxGenero >= 0 ? trimString(normalizedRow[idxGenero]) : '',
      firstPlayedAt: toDateString(idxPrimera >= 0 ? normalizedRow[idxPrimera] : ''),
      startDate: toDateString(idxInicio >= 0 ? normalizedRow[idxInicio] : ''),
      endDate: toDateString(idxFin >= 0 ? normalizedRow[idxFin] : ''),
      lastSessionHours:
        idxHorasUlt >= 0 && normalizedRow[idxHorasUlt] !== undefined && normalizedRow[idxHorasUlt] !== null
          ? Number(normalizedRow[idxHorasUlt])
          : null,
      yearsPlayed: idxYears >= 0 ? trimString(normalizedRow[idxYears]) : '',
      totalHours:
        idxHorasTot >= 0 && normalizedRow[idxHorasTot] !== undefined && normalizedRow[idxHorasTot] !== null
          ? Number(normalizedRow[idxHorasTot])
          : null
    };

    games.push(game);
  }

  return games;
};


