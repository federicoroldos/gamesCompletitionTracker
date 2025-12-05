import { ChangeEvent, useRef, useState } from "react";
import { parseExcelFile } from "../utils/excelImport";
import { Game } from "../types/Game";

interface Props {
  onExportJson: () => string;
  onImportJson: (json: string) => { ok: boolean; message?: string; count?: number };
  onImportExcel: (games: Omit<Game, "id" | "createdAt">[]) => void;
}

const LocalImportPanel = ({ onExportJson, onImportJson, onImportExcel }: Props) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const excelInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  const handleDownloadFile = () => {
    const json = onExportJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "gametracker-backup.json";
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Exportado a archivo local");
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
      const content = String(reader.result ?? "");
      const result = onImportJson(content);
      setMessage(
        result.ok
          ? `Importado correctamente (${result.count ?? 0} registros)`
          : result.message || "Error al importar"
      );
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleExcelChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setMessage("Importando Excel...");
    try {
      const parsed = await parseExcelFile(file);
      onImportExcel(parsed);
      setMessage(`Importado desde Excel (${parsed.length} registros)`);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Error al importar Excel (usa el archivo original)";
      setMessage(msg);
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  };

  return (
    <section className="panel panel--stacked">
      <h2>Importar / Exportar archivo</h2>
      <div className="backup-buttons">
        <button className="button" onClick={handleDownloadFile}>
          Exportar JSON
        </button>
        <button className="button button--ghost" onClick={handleOpenFile} disabled={loading}>
          Importar JSON
        </button>
        <button className="button button--ghost" onClick={handleOpenExcel} disabled={loading}>
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
      {message && <p className="muted">{message}</p>}
    </section>
  );
};

export default LocalImportPanel;
