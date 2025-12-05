# Games Progress Tracker
Webapp simple en React + TypeScript para llevar un registro de videojuegos, filtros y persistencia en Google Drive.

## Requisitos previos
- Node.js 18+

## Instalación
```bash
npm install
```

## Desarrollo
```bash
npm run dev
```
Levanta el servidor de Vite en modo desarrollo.

## Build de producción
```bash
npm run build
```
El resultado queda en `dist/`. Puedes previsualizarlo con:
```bash
npm run preview
```

## Funcionalidades
- Agregar, listar, editar y eliminar juegos.
- Búsqueda por título, filtro por estado y ranking, y filtrar orden (título A-Z o ranking). Incluye paginación.
- Persistencia en `localStorage` y exportación/importación de backups JSON.
- Importación desde Excel.
- Respaldo en Google Drive (carpeta oculta `appDataFolder`) autenticándote con Google.

## Campos principales
- Título, Plataforma, Estado (Platino / Completado / Pasado / Empezado / Sin probar / Abandonado / Probado / No aplica), Ranking (S+ a G), Publisher, Género, fechas (lanzamiento, primera vez, inicio última, fin), horas (última sesión y totales), años jugados y comentario.

## Respaldo y sincronización
- Exportar JSON: sección "Respaldo y sincronización" → "Exportar JSON".
- Importar JSON: "Importar JSON" y selecciona el archivo.
- Google Drive: inicia sesión con Google. El backup se guarda en `appDataFolder`, la app prepara el archivo automáticamente. Para utilizarlo selecciona "Preparar archivo", luego "Subir a Drive", y "Descargar de Drive" para descargar el archivo subido (replicable en cualquier equipo donde se inicie sesión).
- Importar Excel: en "Archivo local" usa "Importar Excel" con tu archivo Excel (recomendado que dicho archivo cuente con los mismos campos del formulario en forma de columnas).
