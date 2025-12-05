import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { GameRanking, GameStatus } from './types/Game';

export type Language = 'es' | 'en';

const translations = {
  es: {
    languageName: 'Español',
    languageLabel: 'Idioma',
    header: {
      eyebrow: 'Games Progress Tracker',
      title: 'Tu lista de videojuegos en un solo lugar',
      subtitle: 'Entra con tu cuenta, gestiona tus juegos y respáldalos en Google Drive.'
    },
    stats: {
      total: 'Total',
      unplayed: 'Sin probar',
      started: 'Empezado',
      completed: 'Completado',
      platinum: 'Platino',
      abandoned: 'Abandonado'
    },
    auth: {
      title: 'Inicio de sesión',
      description: 'Primero inicia sesión para habilitar la lista de juegos y la sincronización con Google Drive.',
      activeSession: 'Sesión activa',
      signOut: 'Cerrar sesión',
      signIn: 'Iniciar con Google'
    },
    steps: ['Inicia sesión con Google.', 'Gestiona tu lista de juegos.', 'Respáldalos en Drive.'],
    form: {
      newTitle: 'Agregar juego',
      editTitle: 'Editar juego',
      labels: {
        title: 'Título *',
        platform: 'Plataforma(s)',
        status: 'Estado',
        ranking: 'Ranking',
        releaseDate: 'Fecha de lanzamiento',
        publisher: 'Publisher / Desarrollador',
        genres: 'Género(s)',
        firstPlayed: 'Fecha primera vez',
        startDate: 'Fecha comienzo (Última partida)',
        endDate: 'Fecha de fin',
        lastSession: 'Horas jugadas (Última partida)',
        yearsPlayed: 'Año completado',
        totalHours: 'Horas totales',
        comment: 'Comentario'
      },
      placeholders: {
        title: "Ej. Baldur's Gate 3",
        platform: 'PC, PS5, Switch...',
        releaseDate: 'dd/mm/yyyy',
        publisher: 'Ej. FromSoftware, Bandai Namco',
        genres: 'Acción, RPG, Soulslike',
        firstPlayed: 'dd/mm/yyyy',
        startDate: 'dd/mm/yyyy',
        endDate: 'dd/mm/yyyy',
        lastSession: 'Ej. 12.5',
        yearsPlayed: 'Ej. 2018, 2021',
        totalHours: 'Ej. 140',
        comment: 'Notas rápidas, impresiones, etc.'
      },
      toggleShow: 'Mostrar campos avanzados',
      toggleHide: 'Ocultar campos avanzados',
      errorTitle: 'El título es obligatorio',
      cancel: 'Cancelar',
      save: 'Guardar cambios',
      add: 'Agregar juego'
    },
    filters: {
      status: 'Estado',
      ranking: 'Ranking',
      sortBy: 'Ordenar por',
      sortTitle: 'Título (A-Z)',
      sortRanking: 'Ranking'
    },
    search: {
      label: 'Buscar',
      placeholder: 'Buscar por título...',
      button: 'Buscar'
    },
    list: {
      title: 'Juegos guardados',
      empty: 'Aún no tienes juegos cargados. Agrega uno desde el formulario para empezar.',
      headers: {
        title: 'Título',
        platform: 'Plataforma',
        status: 'Estado',
        ranking: 'Ranking',
        publisher: 'Publisher',
        genres: 'Géneros',
        releaseDate: 'Fecha lanzamiento',
        firstPlayed: 'Primera vez',
        startDate: 'Inicio última',
        endDate: 'Fin',
        lastSession: 'Horas última',
        yearsPlayed: 'Año completado',
        totalHours: 'Horas totales',
        comment: 'Comentario',
        actions: 'Acciones'
      },
      actions: {
        edit: 'Editar',
        delete: 'Eliminar',
        deleteAll: 'Borrar todos',
        confirmDeleteAll: 'Seguro que quieres borrar todos los registros?'
      },
      pagination: {
        first: 'Primera página',
        last: 'Última página',
        page: 'Página'
      }
    },
    backup: {
      title: 'Respaldo en Google Drive',
      defaultTitle: 'Respaldo y sincronización',
      driveUpload: 'Subir a Drive',
      driveDownload: 'Descargar de Drive',
      localTitle: 'Archivo local',
      exportJson: 'Exportar JSON',
      importJson: 'Importar JSON',
      importExcel: 'Importar Excel',
      consoleTitle: 'Salida en Consola',
      consoleEmpty: 'Sin eventos aún.',
      messages: {
        ensureFile: 'Buscando/creando backup en Drive (appData)...',
        fileReady: 'Archivo listo en appDataFolder',
        needAuth: 'Primero inicia sesión con Google para usar Google Drive.',
        hint: 'Inicia con Google para habilitar las acciones de Drive.',
        uploadStart: 'Subiendo a Google Drive (appData)...',
        uploadOk: 'Backup subido a Google Drive (appData)',
        uploadError: 'Error al subir a Drive',
        downloadStart: 'Descargando de Google Drive (appData)...',
        downloadError: 'Error al descargar desde Drive',
        importError: 'Error al importar',
        localExported: 'Exportado a archivo local',
        excelImporting: 'Importando Excel...',
        excelImportError: 'Error al importar Excel (usa el archivo original)'
      },
      importedJson: (count: number) => `Importado correctamente (${count} registros)`,
      importedDrive: (count: number) => `Importado desde Google Drive (${count} registros)`,
      importedExcel: (count: number) => `Importado desde Excel (${count} registros)`
    },
    localImport: {
      title: 'Importar / Exportar archivo',
      exportJson: 'Exportar JSON',
      exportExcel: 'Exportar Excel',
      importJson: 'Importar JSON',
      importExcel: 'Importar Excel',
      messages: {
        exportedJson: 'Exportado a archivo local',
        noDataExcel: 'No hay datos para exportar a Excel',
        exportedExcel: (count: number) => `Exportado a Excel (${count} registros)`,
        importingExcel: 'Importando Excel...',
        importedExcel: (count: number) => `Importado desde Excel (${count} registros)`,
        importExcelError: 'Error al importar Excel (usa el archivo original)',
        importJsonOk: (count: number) => `Importado correctamente (${count} registros)`,
        importJsonError: 'Error al importar'
      }
    },
    legend: {
      title: 'Leyendas',
      statusTitle: 'Estados',
      rankingTitle: 'Ranking',
      statuses: [
        { label: 'Platino', desc: 'Tengo el platino.' },
        { label: 'Completado', desc: 'Todo el contenido jugado, falta algún logro.' },
        { label: 'Pasado', desc: 'Historia pasada, no todo el secundario.' },
        { label: 'Empezado', desc: 'Empezado y pretendo terminarlo.' },
        { label: 'Abandonado', desc: 'Lo abandoné por algún motivo.' },
        { label: 'Probado', desc: 'Solo lo probé.' },
        { label: 'Sin probar', desc: 'Aún no lo probé.' },
        { label: 'No aplica', desc: 'No corresponde estado.' }
      ],
      rankings: [
        { label: 'S+', desc: 'Prácticamente igual que S pero me marcó más; juegos clave.' },
        { label: 'S', desc: 'Excelente.' },
        { label: 'A', desc: 'Sobresaliente.' },
        { label: 'B', desc: 'Muy bueno.' },
        { label: 'C', desc: 'Bueno.' },
        { label: 'D', desc: 'Decente.' },
        { label: 'E', desc: 'Mediocre.' },
        { label: 'F', desc: 'Basura infecta, pérdida de tiempo.' },
        { label: 'G', desc: 'Irrelevante, sin opinión.' }
      ]
    },
    footer: {
      createdBy: 'Creado por'
    },
    statuses: {
      todos: 'Todos',
      Platino: 'Platino',
      Completado: 'Completado',
      Pasado: 'Pasado',
      Empezado: 'Empezado',
      'Sin probar': 'Sin probar',
      Abandonado: 'Abandonado',
      Probado: 'Probado',
      'No aplica': 'No aplica'
    },
    rankingLabels: {
      todos: 'Todos',
      'S+': 'S+',
      S: 'S',
      A: 'A',
      B: 'B',
      C: 'C',
      D: 'D',
      E: 'E',
      F: 'F',
      G: 'G'
    }
  },
  en: {
    languageName: 'English',
    languageLabel: 'Language',
    header: {
      eyebrow: 'Games Progress Tracker',
      title: 'Your game list in one place',
      subtitle: 'Sign in, manage your games, and back them up to Google Drive.'
    },
    stats: {
      total: 'Total',
      unplayed: 'Not started',
      started: 'In progress',
      completed: 'Completed',
      platinum: 'Platinum',
      abandoned: 'Dropped'
    },
    auth: {
      title: 'Sign In',
      description: 'Sign in first to enable the game list and Google Drive sync.',
      activeSession: 'Session active',
      signOut: 'Sign out',
      signIn: 'Sign in with Google'
    },
    steps: ['Sign in with Google.', 'Manage your game list.', 'Back it up to Drive.'],
    form: {
      newTitle: 'Add game',
      editTitle: 'Edit game',
      labels: {
        title: 'Title *',
        platform: 'Platform(s)',
        status: 'Status',
        ranking: 'Ranking',
        releaseDate: 'Release date',
        publisher: 'Publisher / Developer',
        genres: 'Genre(s)',
        firstPlayed: 'First played',
        startDate: 'Start date (Last session)',
        endDate: 'Finish date',
        lastSession: 'Hours played (Last session)',
        yearsPlayed: 'Completed year',
        totalHours: 'Total hours',
        comment: 'Notes'
      },
      placeholders: {
        title: "e.g. Baldur's Gate 3",
        platform: 'PC, PS5, Switch...',
        releaseDate: 'dd/mm/yyyy',
        publisher: 'e.g. FromSoftware, Bandai Namco',
        genres: 'Action, RPG, Soulslike',
        firstPlayed: 'dd/mm/yyyy',
        startDate: 'dd/mm/yyyy',
        endDate: 'dd/mm/yyyy',
        lastSession: 'e.g. 12.5',
        yearsPlayed: 'e.g. 2018, 2021',
        totalHours: 'e.g. 140',
        comment: 'Quick notes, impressions, etc.'
      },
      toggleShow: 'Show advanced fields',
      toggleHide: 'Hide advanced fields',
      errorTitle: 'Title is required',
      cancel: 'Cancel',
      save: 'Save changes',
      add: 'Add game'
    },
    filters: {
      status: 'Status',
      ranking: 'Ranking',
      sortBy: 'Sort by',
      sortTitle: 'Title (A-Z)',
      sortRanking: 'Ranking'
    },
    search: {
      label: 'Search',
      placeholder: 'Search by title...',
      button: 'Search'
    },
    list: {
      title: 'Saved games',
      empty: 'No games yet. Add one from the form to get started.',
      headers: {
        title: 'Title',
        platform: 'Platform',
        status: 'Status',
        ranking: 'Ranking',
        publisher: 'Publisher',
        genres: 'Genres',
        releaseDate: 'Release date',
        firstPlayed: 'First played',
        startDate: 'Start date',
        endDate: 'Finish date',
        lastSession: 'Last session hours',
        yearsPlayed: 'Completed year',
        totalHours: 'Total hours',
        comment: 'Notes',
        actions: 'Actions'
      },
      actions: {
        edit: 'Edit',
        delete: 'Delete',
        deleteAll: 'Delete all',
        confirmDeleteAll: 'Are you sure you want to delete all records?'
      },
      pagination: {
        first: 'First page',
        last: 'Last page',
        page: 'Page'
      }
    },
    backup: {
      title: 'Backup to Google Drive',
      defaultTitle: 'Backup and sync',
      driveUpload: 'Upload to Drive',
      driveDownload: 'Download from Drive',
      localTitle: 'Local file',
      exportJson: 'Export JSON',
      importJson: 'Import JSON',
      importExcel: 'Import Excel',
      consoleTitle: 'Console output',
      consoleEmpty: 'No events yet.',
      messages: {
        ensureFile: 'Looking for/creating backup in Drive (appData)...',
        fileReady: 'File ready in appDataFolder',
        needAuth: 'Sign in with Google first to use Google Drive.',
        hint: 'Sign in with Google to enable Drive actions.',
        uploadStart: 'Uploading to Google Drive (appData)...',
        uploadOk: 'Backup uploaded to Google Drive (appData)',
        uploadError: 'Error uploading to Drive',
        downloadStart: 'Downloading from Google Drive (appData)...',
        downloadError: 'Error downloading from Drive',
        importError: 'Error importing',
        localExported: 'Exported to local file',
        excelImporting: 'Importing Excel...',
        excelImportError: 'Error importing Excel (use the original file)'
      },
      importedJson: (count: number) => `Imported successfully (${count} records)`,
      importedDrive: (count: number) => `Imported from Google Drive (${count} records)`,
      importedExcel: (count: number) => `Imported from Excel (${count} records)`
    },
    localImport: {
      title: 'Import / Export file',
      exportJson: 'Export JSON',
      exportExcel: 'Export Excel',
      importJson: 'Import JSON',
      importExcel: 'Import Excel',
      messages: {
        exportedJson: 'Exported to local file',
        noDataExcel: 'No data to export to Excel',
        exportedExcel: (count: number) => `Exported to Excel (${count} records)`,
        importingExcel: 'Importing Excel...',
        importedExcel: (count: number) => `Imported from Excel (${count} records)`,
        importExcelError: 'Error importing Excel (use the original file)',
        importJsonOk: (count: number) => `Imported successfully (${count} records)`,
        importJsonError: 'Error importing'
      }
    },
    legend: {
      title: 'Legend',
      statusTitle: 'Statuses',
      rankingTitle: 'Ranking',
      statuses: [
        { label: 'Platinum', desc: 'Platinum achieved.' },
        { label: 'Completed', desc: 'All content played, maybe missing achievements.' },
        { label: 'Finished', desc: 'Main story finished, not all side content.' },
        { label: 'In progress', desc: 'Started and intend to finish.' },
        { label: 'Dropped', desc: 'Dropped for some reason.' },
        { label: 'Tried', desc: 'Only tried it.' },
        { label: 'Not started', desc: 'Haven’t played it yet.' },
        { label: 'N/A', desc: 'State not applicable.' }
      ],
      rankings: [
        { label: 'S+', desc: 'Almost like S but resonated even more; key games.' },
        { label: 'S', desc: 'Excellent.' },
        { label: 'A', desc: 'Outstanding.' },
        { label: 'B', desc: 'Very good.' },
        { label: 'C', desc: 'Good.' },
        { label: 'D', desc: 'Decent.' },
        { label: 'E', desc: 'Mediocre.' },
        { label: 'F', desc: 'Terrible, waste of time.' },
        { label: 'G', desc: 'Irrelevant, no opinion yet.' }
      ]
    },
    footer: {
      createdBy: 'Built by'
    },
    statuses: {
      todos: 'All',
      Platino: 'Platinum',
      Completado: 'Completed',
      Pasado: 'Finished',
      Empezado: 'In progress',
      'Sin probar': 'Not started',
      Abandonado: 'Dropped',
      Probado: 'Tried',
      'No aplica': 'N/A'
    },
    rankingLabels: {
      todos: 'All',
      'S+': 'S+',
      S: 'S',
      A: 'A',
      B: 'B',
      C: 'C',
      D: 'D',
      E: 'E',
      F: 'F',
      G: 'G'
    }
  }
} as const;

type Translations = typeof translations.en;

const localeMap: Record<Language, string> = {
  es: 'es-ES',
  en: 'en-US'
};

interface I18nContextValue {
  lang: Language;
  setLang: (value: Language) => void;
  t: Translations;
  formatDate: (value?: string) => string;
  statusLabel: (value: GameStatus | 'todos') => string;
  rankingLabel: (value: GameRanking | 'todos') => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>('es');

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(localeMap[lang], {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
    [lang]
  );

  const formatDate = (value?: string) => {
    if (!value) return '-';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '-' : dateFormatter.format(d);
  };

  const contextValue = useMemo<I18nContextValue>(
    () => ({
      lang,
      setLang,
      t: translations[lang],
      formatDate,
      statusLabel: (value) => translations[lang].statuses[value] ?? value,
      rankingLabel: (value) => translations[lang].rankingLabels[value] ?? value
    }),
    [lang, formatDate]
  );

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export const supportedLanguages: Language[] = ['es', 'en'];

export const languageNames: Record<Language, string> = {
  es: translations.es.languageName,
  en: translations.en.languageName
};
