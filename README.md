# Games Progress Tracker
Webapp simple en React + TypeScript para llevar un registro de videojuegos, filtros y persistencia en Google Drive.

## Uso
Para utilizar la app puedes hacerlo a traves del [enlace](https://federicoroldos.github.io/gamesCompletitionTracker/).

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

## Funcionalidades
- Agregar, listar, editar y eliminar juegos.
- Búsqueda por título, filtro por estado y ranking, y filtrar orden (título A-Z o ranking). Incluye paginación.
- Persistencia en `localStorage` y exportación/importación de backups JSON.
- Importación y exportacion desde Excel.
- Respaldo en Google Drive (carpeta oculta `appDataFolder`) autenticándote con Google.
- Eleccion de idioma entre Inglés y Español

## Campos principales
- Título, Plataforma, Estado (Platino / Completado / Pasado / Empezado / Sin probar / Abandonado / Probado / No aplica), Ranking (S+ a G), Publisher, Género, fechas (lanzamiento, primera vez, inicio última, fin), horas (última sesión y totales), años jugados y comentario.

## Respaldo y sincronización
- Exportar JSON: sección "Respaldo y sincronización" → "Exportar JSON".
- Importar JSON: "Importar JSON" y selecciona el archivo.
- Google Drive: inicia sesión con Google. El backup se guarda en `appDataFolder` y la app prepara el archivo automáticamente. Usa "Subir a Drive" para guardar y "Descargar de Drive" para restaurar (replicable en cualquier equipo donde se inicie sesión).
- Importar Excel: en "Archivo local" usa "Importar Excel" con tu archivo Excel (recomendado que dicho archivo cuente con los mismos campos del formulario en forma de columnas).
- Exportar Excel: sección "Respaldo y sincronización" → "Exportar Excel".
