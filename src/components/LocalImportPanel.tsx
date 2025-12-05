import { ChangeEvent, useRef, useState } from "react";
import * as XLSX from "xlsx";
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

  const handleDownloadExcel = () => {
    try {
      const json = onExportJson();
      const data: Game[] = JSON.parse(json);

      if (!Array.isArray(data) || data.length === 0) {
        setMessage("No hay datos para exportar a Excel");
        return;
      }

      const rows = data.map((game) => ({
        Nombre: game.title,
        Plataforma: game.platform,
        Estado: game.status,
        Tier: game.ranking,
        Notas: game.comment,
        "Fecha de lanzamiento": game.releaseDate ?? "",
        Publisher: game.publisher ?? "",
        "Género(s)": game.genres ?? "",
        "Fecha primera vez": game.firstPlayedAt ?? "",
        "Fecha de comienzo": game.startDate ?? "",
        "Fecha de fin": game.endDate ?? "",
        "Horas jugadas (última partida)": game.lastSessionHours ?? "",
        "Año completado": game.yearsPlayed ?? "",
        "Horas totales": game.totalHours ?? "",
        "Creado el": game.createdAt
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Juegos");
      XLSX.writeFile(workbook, "gametracker-backup.xlsx");
      setMessage(`Exportado a Excel (${rows.length} registros)`);
    } catch (error) {
      setMessage("No se pudo exportar a Excel");
    }
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
        <button className="button" onClick={handleDownloadExcel}>
          Exportar Excel
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
