import { ChangeEvent, useRef, useState } from 'react';
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
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al preparar el archivo en Drive';
      pushStatus(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnsure = () => {
    if (!accessToken) {
      pushStatus('Inicia sesión con Google para preparar el archivo en Drive');
      return;
    }
    void ensureFile(accessToken);
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
    if (!accessToken) {
      pushStatus('Inicia sesión con Google para obtener el token de Drive');
      return;
    }
    if (!driveFileId) {
      await ensureFile(accessToken);
      if (!driveFileId) return;
    }
    setLoading(true);
    pushStatus('Subiendo a Google Drive (appData)...');
    try {
      await uploadToAppData(accessToken, driveFileId, onExportJson());
      pushStatus('Backup subido a Google Drive (appData)');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al subir a Drive';
      pushStatus(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDrive = async () => {
    if (!accessToken) {
      pushStatus('Inicia sesión con Google para obtener el token de Drive');
      return;
    }
    if (!driveFileId) {
      await ensureFile(accessToken);
      if (!driveFileId) return;
    }
    setLoading(true);
    pushStatus('Descargando de Google Drive (appData)...');
    try {
      const content = await downloadFromAppData(accessToken, driveFileId);
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

  return (
    <div className="panel panel--stacked">
      <h2>Respaldo y sincronización</h2>
      <div className="backup-actions">
        <div className="backup-group">
          <h3>Google Drive</h3>
          <div className="auth-row">
            <p className="muted">
              {user ? `Sesión: ${user.email ?? user.displayName ?? 'Usuario'}` : 'Sin sesión'}
            </p>
          </div>
          <div className="backup-buttons drive-actions">
            <button className="button" type="button" onClick={handleEnsure} disabled={loading || authLoading}>
              Preparar archivo
            </button>
            <button className="button" onClick={handleUploadDrive} disabled={loading || authLoading || !accessToken}>
              Subir a Drive
            </button>
            <button
              className="button button--ghost"
              onClick={handleDownloadDrive}
              disabled={loading || authLoading || !accessToken}
            >
              Descargar de Drive
            </button>
            {user ? (
              <button className="button button--ghost" onClick={signOut} disabled={authLoading}>
                Cerrar sesión
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
          <span className="backup-console__badge">LIVE</span>
        </div>
        <div className="backup-console__body">
          {logs.length ? (
            logs.map((line, idx) => (
              <div key={idx} className="backup-console__line">
                {line}
              </div>
            ))
          ) : (
            <p className="muted">Sin eventos aún.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackupPanel;
