import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { downloadFromAppData, ensureAppDataFile, uploadToAppData } from '../utils/googleDriveClient';
import { parseExcelFile } from '../utils/excelImport';
import { Game } from '../types/Game';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

interface Props {
  onExportJson: () => string;
  onImportJson: (json: string) => { ok: boolean; message?: string; count?: number };
  onImportExcel: (games: Omit<Game, 'id' | 'createdAt'>[]) => void;
}

const BackupPanel = ({ onExportJson, onImportJson, onImportExcel }: Props) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const excelInputRef = useRef<HTMLInputElement | null>(null);
  const { user, accessToken, loading: authLoading, signIn, signOut } = useGoogleAuth();
  const [driveFileId, setDriveFileId] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const hasDriveSession = Boolean(user && accessToken);
  const driveHintShownRef = useRef(false);

  const pushStatus = (message: string) => {
    const entry = `[${new Date().toLocaleTimeString()}] ${message}`;
    setLogs((prev) => [...prev, entry].slice(-80));
  };

  const ensureFile = async (token: string) => {
    setLoading(true);
    pushStatus('Buscando/creando backup en Drive (appData)...');
    try {
      const id = await ensureAppDataFile(token);
      setDriveFileId(id);
      pushStatus('Archivo listo en appDataFolder');
      return id;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al preparar el archivo en Drive';
      pushStatus(message);
      return '';
    } finally {
      setLoading(false);
    }
  };

  const ensureDriveSession = () => {
    if (!hasDriveSession) {
      pushStatus('Primero inicia sesion con Google para usar Google Drive.');
      return '';
    }
    return accessToken ?? '';
  };

  const handleDownloadFile = () => {
    const json = onExportJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gametracker-backup.json';
    link.click();
    URL.revokeObjectURL(url);
    pushStatus('Exportado a archivo local');
  };

  const handleOpenFile = () => {
    fileInputRef.current?.click();
  };

  const handleOpenExcel = () => {
    excelInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result ?? '');
      const result = onImportJson(content);
      pushStatus(
        result.ok
          ? `Importado correctamente (${result.count ?? 0} registros)`
          : result.message || 'Error al importar'
      );
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleExcelChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    pushStatus('Importando Excel...');
    try {
      const parsed = await parseExcelFile(file);
      onImportExcel(parsed);
      pushStatus(`Importado desde Excel (${parsed.length} registros)`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al importar Excel (usa el archivo original)';
      pushStatus(message);
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  const handleUploadDrive = async () => {
    const token = ensureDriveSession();
    if (!token) return;

    const fileId = driveFileId || (await ensureFile(token));
    if (!fileId) return;

    setLoading(true);
    pushStatus('Subiendo a Google Drive (appData)...');
    try {
      await uploadToAppData(token, fileId, onExportJson());
      pushStatus('Backup subido a Google Drive (appData)');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al subir a Drive';
      pushStatus(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDrive = async () => {
    const token = ensureDriveSession();
    if (!token) return;

    const fileId = driveFileId || (await ensureFile(token));
    if (!fileId) return;

    setLoading(true);
    pushStatus('Descargando de Google Drive (appData)...');
    try {
      const content = await downloadFromAppData(token, fileId);
      const result = onImportJson(content);
      pushStatus(
        result.ok
          ? `Importado desde Google Drive (${result.count ?? 0} registros)`
          : result.message || 'Error al importar'
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al descargar desde Drive';
      pushStatus(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && !driveFileId && !loading) {
      void ensureFile(accessToken);
    }
  }, [accessToken, driveFileId, loading]);

  useEffect(() => {
    if (!hasDriveSession && !authLoading && !driveHintShownRef.current) {
      pushStatus('Inicia con Google para habilitar las acciones de Drive.');
      driveHintShownRef.current = true;
    }
    if (hasDriveSession) {
      driveHintShownRef.current = false;
    }
  }, [hasDriveSession, authLoading]);

  return (
    <div className="panel panel--stacked">
      <h2>Respaldo y sincronizacion</h2>
      <div className="backup-actions">
        <div className="backup-group">
          <h3>Google Drive</h3>
          <div className="auth-row">
            <p className="muted">
              {user ? `Sesion: ${user.email ?? user.displayName ?? 'Usuario'}` : 'Sin sesion'}
            </p>
          </div>
          <div className="backup-buttons drive-actions">
            <button
              className="button"
              onClick={handleUploadDrive}
              disabled={loading || authLoading}
            >
              Subir a Drive
            </button>
            <button
              className="button button--ghost"
              onClick={handleDownloadDrive}
              disabled={loading || authLoading}
            >
              Descargar de Drive
            </button>
            {user ? (
              <button className="button button--ghost" onClick={signOut} disabled={authLoading}>
                Cerrar sesion
              </button>
            ) : (
              <button className="button" onClick={signIn} disabled={authLoading}>
                Iniciar con Google
              </button>
            )}
          </div>
        </div>

        <div className="backup-group">
          <h3>Archivo local</h3>
          <div className="backup-buttons">
            <button className="button" onClick={handleDownloadFile}>
              Exportar JSON
            </button>
            <button className="button button--ghost" onClick={handleOpenFile}>
              Importar JSON
            </button>
            <button className="button button--ghost" onClick={handleOpenExcel}>
              Importar Excel
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              hidden
              onChange={handleFileChange}
            />
            <input
              ref={excelInputRef}
              type="file"
              accept=".xls,.xlsx,.xlsm"
              hidden
              onChange={handleExcelChange}
            />
          </div>
        </div>
      </div>

      <div className="backup-console">
        <div className="backup-console__header">
          <span>Consola de respaldo</span>
        </div>
        <div className="backup-console__body">
          {logs.length ? (
            logs.map((line, idx) => (
              <div key={idx} className="backup-console__line">
                {line}
              </div>
            ))
          ) : (
            <p className="muted">Sin eventos aun.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackupPanel;
