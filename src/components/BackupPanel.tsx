import { ChangeEvent, useRef, useState } from 'react';
import {
  ensureAppDataFile,
  downloadFromAppData,
  uploadToAppData
} from '../utils/googleDriveClient';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

interface Props {
  onExportJson: () => string;
  onImportJson: (json: string) => { ok: boolean; message?: string; count?: number };
}

const BackupPanel = ({ onExportJson, onImportJson }: Props) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user, accessToken, loading: authLoading, signIn, signOut } = useGoogleAuth();
  const [driveFileId, setDriveFileId] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const ensureFile = async (token: string) => {
    setLoading(true);
    setStatus('Buscando/creando backup en Drive (appData)...');
    try {
      const id = await ensureAppDataFile(token);
      setDriveFileId(id);
      setStatus('Archivo listo en appDataFolder');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al preparar el archivo en Drive';
      setStatus(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnsure = () => {
    if (!accessToken) {
      setStatus('Inicia sesión con Google para preparar el archivo en Drive');
      return;
    }
    void ensureFile(accessToken);
  };

  const canUseDrive = Boolean(accessToken && driveFileId);

  const handleDownloadFile = () => {
    const json = onExportJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gametracker-backup.json';
    link.click();
    URL.revokeObjectURL(url);
    setStatus('Exportado a archivo local');
  };

  const handleOpenFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result ?? '');
      const result = onImportJson(content);
      setStatus(
        result.ok
          ? `Importado correctamente (${result.count ?? 0} registros)`
          : result.message || 'Error al importar'
      );
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleUploadDrive = async () => {
    if (!accessToken) {
      setStatus('Inicia sesión con Google para obtener el token de Drive');
      return;
    }
    if (!driveFileId) {
      await ensureFile(accessToken);
      if (!driveFileId) return;
    }
    setLoading(true);
    setStatus('Subiendo a Google Drive (appData)...');
    try {
      await uploadToAppData(accessToken, driveFileId, onExportJson());
      setStatus('Backup subido a Google Drive (appData)');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al subir a Drive';
      setStatus(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDrive = async () => {
    if (!accessToken) {
      setStatus('Inicia sesión con Google para obtener el token de Drive');
      return;
    }
    if (!driveFileId) {
      await ensureFile(accessToken);
      if (!driveFileId) return;
    }
    setLoading(true);
    setStatus('Descargando de Google Drive (appData)...');
    try {
      const content = await downloadFromAppData(accessToken, driveFileId);
      const result = onImportJson(content);
      setStatus(
        result.ok
          ? `Importado desde Google Drive (${result.count ?? 0} registros)`
          : result.message || 'Error al importar'
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al descargar desde Drive';
      setStatus(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDriveFile = async () => {
    if (!accessToken) {
      setStatus('Inicia sesión con Google para crear el archivo en Drive');
      return;
    }
    setLoading(true);
    setStatus('Creando archivo en Google Drive...');
    try {
      const id = await createBackupFileOnDrive(accessToken, 'gametracker-backup.json');
      setDriveFileId(id);
      setStatus(`Archivo creado en Drive (fileId: ${id})`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al crear el archivo en Drive';
      setStatus(message);
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
            <div>
              <p className="muted">
                {user ? `Sesión: ${user.email ?? user.displayName ?? 'Usuario'}` : 'Sin sesión'}
              </p>
            </div>
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
          </div>
          {status && <p className="status-text">{status}</p>}
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
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              hidden
              onChange={handleFileChange}
            />
          </div>
          <p className="muted subnote">
            Exporta/Importa en JSON localmente o sincroniza con Google Drive (appDataFolder).
          </p>
        </div>
      </div>
    </div>
  );
};

export default BackupPanel;
