import { useState, type FormEvent } from "react";

import {
  importSubscriptionsCsv,
  type CsvImportResult,
} from "../../api/subscriptions";

import Icon from "../ui/Icon";

type ImportFlowProps = {
  onImported: () => Promise<void>;
};

export default function ImportFlow({
  onImported,
}: ImportFlowProps) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<CsvImportResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const selectFile = (selectedFile?: File) => {
    if (!selectedFile) return;

    setFile(null);
    setResult(null);
    setError(null);
    setRefreshError(null);

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setError("Выберите файл в формате CSV");
      return;
    }

    if (selectedFile.size === 0) {
      setError("Файл пустой");
      return;
    }

    if (selectedFile.size > 1024 * 1024) {
      setError("Максимальный размер файла — 1 МБ");
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!file || isUploading) return;

    setIsUploading(true);
    setError(null);
    setRefreshError(null);

    try {
      const importResult = await importSubscriptionsCsv(file);

      setResult(importResult);

      try {
        await onImported();
      } catch {
        setRefreshError(
          "Импорт выполнен, но обновить реестр не удалось. " +
          "Обновите страницу вручную.",
        );
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Не удалось импортировать CSV",
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (result) {
    return (
      <div>
        <div className="inline-note" role="status">
          <Icon name="check" size={18} />
          Импорт завершён. Создано подписок: {result.created}.
        </div>

        {refreshError && (
          <p className="field-error" role="alert">
            {refreshError}
          </p>
        )}

        {result.candidates.length > 0 ? (
          <div
            className="table-scroll import-table"
            style={{ marginTop: 20 }}
          >
            <table>
              <thead>
                <tr>
                  <th>Сервис</th>
                  <th>Результат</th>
                </tr>
              </thead>

              <tbody>
                {result.candidates.map((candidate, index) => (
                  <tr key={`${candidate.name}-${index}`}>
                    <td>{candidate.name}</td>
                    <td>
                      {candidate.status === "created"
                        ? "Добавлен"
                        : "Уже существует"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="form-hint">
            В файле не найдено поддерживаемых сервисов.
            Новые подписки не созданы.
          </p>
        )}

        <div className="modal-actions">
          <button
            className="btn"
            type="button"
            onClick={() => {
              setFile(null);
              setResult(null);
              setError(null);
              setRefreshError(null);
            }}
          >
            Импортировать другой файл
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="form-intro">
        Загрузите CSV-выписку с платежами.
        SubControl найдёт известные сервисы и добавит
        новые подписки в реестр.
      </p>

      <label className="upload-zone">
        <span className="upload-symbol">
          <Icon name="upload" size={27} />
        </span>

        <strong>
          Выберите CSV-файл
        </strong>

        <span>Формат CSV · до 1 МБ</span>

        <input
          type="file"
          accept=".csv,text/csv"
          disabled={isUploading}
          onChange={(event) =>
            selectFile(event.target.files?.[0])
          }
        />

        <span className="btn">
          Выбрать файл
        </span>
      </label>

      {file && (
        <div className="inline-note">
          <Icon name="check" size={17} />
          <span>Выбран файл: {file.name}</span>
        </div>
      )}

      <div className="warning-box">
        <Icon name="info" size={18} />

        <span>
          Сейчас система распознаёт ограниченный список
          сервисов: Figma, Notion, Slack, Google Workspace,
          Atlassian, Jira, Zoom и GitHub.
          Тариф, стоимость и дату продления нужно
          заполнить после импорта.
        </span>
      </div>

      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}

      <div className="modal-actions">
        <button
          className="btn primary"
          type="submit"
          disabled={!file || isUploading}
        >
          {isUploading
            ? "Импортируем..."
            : "Импортировать"}

          {!isUploading && (
            <Icon name="upload" size={17} />
          )}
        </button>
      </div>
    </form>
  );
}
