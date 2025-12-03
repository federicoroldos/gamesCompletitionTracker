# Games Progress Tracker
Webapp simple en React + TypeScript para llevar un registro de videojuegos con CRUD y persistencia en `localStorage`.

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
Abrirá el servidor de Vite en modo desarrollo.

## Build de producción
```bash
npm run build
```
El resultado quedará en `dist/`. Puedes previsualizarlo con:
```bash
npm run preview
```

## Campos principales
- Título, Plataforma(s), Estado (Platino/Completado/Pasado/Empezado/Abandonado/Probado/No aplica), Ranking (S+ a G), Publisher/Desarrollador, Género(s), fechas (lanzamiento, primera vez, inicio última, fin), horas (última y totales), años jugados, fotos (URL) y comentario.

## Respaldo y sincronización
- Exportar JSON: desde la app, sección "Respaldo y sincronización" → "Exportar JSON".
- Importar JSON: "Importar JSON" y selecciona el archivo.
- Google Drive: inicia sesión con Google (scope `drive.appdata`). El backup se guarda en la carpeta oculta `appDataFolder`, la app prepara el archivo automáticamente y no necesitas un `fileId`. Usa "Preparar archivo", luego "Subir a Drive" / "Descargar de Drive".

### Configuración de Firebase (auth con Google)
1) Crea un proyecto en Firebase, habilita Google Sign-In en Authentication.  
2) Añade la configuración web en un archivo `.env` (ejemplo):
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```
3) En la pantalla de OAuth (Google Cloud), añade el scope `https://www.googleapis.com/auth/drive.appdata` y habilita la Google Drive API.  
Nota: el token de Drive se obtiene al iniciar sesión; tras recargar es posible que necesites volver a iniciar para renovarlo.
