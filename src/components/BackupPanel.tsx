import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { User } from 'firebase/auth';
import { useI18n } from '../i18n';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { Game } from '../types/Game';
import { downloadFromAppData, ensureAppDataFile, uploadToAppData } from '../utils/googleDriveClient';
import { parseExcelFile } from '../utils/excelImport';

interface Props {
  onExportJson: () => string;
  onImportJson: (json: string) => { ok: boolean; message?: string; count?: number };
  onImportExcel: (games: Omit<Game, 'id' | 'createdAt'>[]) => void;
  showDrive?: boolean;
  showLocal?: boolean;
  title?: string;
  authContext?: {
    user: User | null;
    accessToken: string | null;
    loading: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
  };
}

const BackupPanel = ({
  onExportJson,
  onImportJson,
  onImportExcel,
  showDrive = true,
  showLocal = true,
  title,
  authContext
}: Props) => {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const excelInputRef = useRef<HTMLInputElement | null>(null);
  const {
    user,
    accessToken,
    loading: authLoading
  } = authContext ?? useGoogleAuth();
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
    pushStatus(t.backup.messages.ensureFile);
    try {
      const id = await ensureAppDataFile(token);
      setDriveFileId(id);
      pushStatus(t.backup.messages.fileReady);
      return id;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t.backup.messages.uploadError;
      pushStatus(message);
      return '';
    } finally {
      setLoading(false);
    }
  };

  const ensureDriveSession = () => {
    if (!hasDriveSession) {
      pushStatus(t.backup.messages.needAuth);
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
    pushStatus(t.backup.messages.localExported);
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
          ? t.backup.importedJson(result.count ?? 0)
          : result.message || t.backup.messages.importError
      );
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleExcelChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    pushStatus(t.backup.messages.excelImporting);
    try {
      const parsed = await parseExcelFile(file);
      onImportExcel(parsed);
      pushStatus(t.backup.importedExcel(parsed.length));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t.backup.messages.excelImportError;
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
    pushStatus(t.backup.messages.uploadStart);
    try {
      await uploadToAppData(token, fileId, onExportJson());
      pushStatus(t.backup.messages.uploadOk);
    } catch (error) {
      const message = error instanceof Error ? error.message : t.backup.messages.uploadError;
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
    pushStatus(t.backup.messages.downloadStart);
    try {
      const content = await downloadFromAppData(token, fileId);
      const result = onImportJson(content);
      pushStatus(
        result.ok
          ? t.backup.importedDrive(result.count ?? 0)
          : result.message || t.backup.messages.importError
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t.backup.messages.downloadError;
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
      pushStatus(t.backup.messages.hint);
      driveHintShownRef.current = true;
    }
    if (hasDriveSession) {
      driveHintShownRef.current = false;
    }
  }, [hasDriveSession, authLoading, t.backup.messages.hint]);

  return (
    <div className="panel panel--stacked">
      <h2>{title ?? t.backup.defaultTitle}</h2>
      <div className="backup-actions">
        {showDrive && (
          <div className="backup-group">
            <div className="backup-buttons drive-actions">
              <button
                className="button button--xl"
                onClick={handleUploadDrive}
                disabled={loading || authLoading}
              >
                {t.backup.driveUpload}
              </button>
              <button
                className="button button--xl"
                onClick={handleDownloadDrive}
                disabled={loading || authLoading}
              >
                {t.backup.driveDownload}
              </button>
            </div>
          </div>
        )}

        {showLocal && (
          <div className="backup-group">
            <h3>{t.backup.localTitle}</h3>
            <div className="backup-buttons">
              <button className="button" onClick={handleDownloadFile}>
                {t.backup.exportJson}
              </button>
              <button className="button button--ghost" onClick={handleOpenFile}>
                {t.backup.importJson}
              </button>
              <button className="button button--ghost" onClick={handleOpenExcel}>
                {t.backup.importExcel}
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
        )}
      </div>

      {showDrive && (
        <div className="backup-console">
          <div className="backup-console__header">
            <span>{t.backup.consoleTitle}</span>
          </div>
          <div className="backup-console__body">
            {logs.length ? (
              logs.map((line, idx) => (
                <div key={idx} className="backup-console__line">
                  {line}
                </div>
              ))
            ) : (
              <p className="muted">{t.backup.consoleEmpty}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupPanel;
