import { useState } from "react";

import type { Subscription } from "../../data";
import Icon from "../ui/Icon";

type ImportRow = {
  name: string;
  tariff: string;
  price: string;
  renewal: string;
  selected: boolean;
  state: string;
};

type ImportFlowProps = {
  existing: Subscription[];
  onImport: (subscriptions: Subscription[]) => void;
};

// Разбор CSV с поддержкой кавычек и разделителей
function parseCSV(text: string): string[][] {
  const delimiter = text.split(/\r?\n/)[0].includes(";")
    ? ";"
    : ",";

  const rows: string[][] = [];

  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (char === delimiter && !quoted) {
      row.push(cell);
      cell = "";
    } else if (
      (char === "\n" || char === "\r") &&
      !quoted
    ) {
      if (char === "\r" && text[i + 1] === "\n") {
        i++;
      }

      row.push(cell);

      if (row.some((value) => value.trim())) {
        rows.push(row);
      }

      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);

  if (row.some((value) => value.trim())) {
    rows.push(row);
  }

  if (quoted) {
    throw new Error("Незакрытая кавычка в CSV");
  }

  return rows;
}

export default function ImportFlow({
  existing,
  onImport,
}: ImportFlowProps) {
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [filename, setFilename] = useState("");
  const [count, setCount] = useState(0);

  const readFile = async (file?: File) => {
    if (!file) return;

    setError("");

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Выберите файл в формате CSV");
      return;
    }

    if (file.size > 1024 * 1024) {
      setError("Максимальный размер файла — 1 МБ");
      return;
    }

    try {
      const parsed = parseCSV(
        (await file.text()).replace(/^\uFEFF/, ""),
      );

      const header =
        parsed.shift()?.map((value) =>
          value.trim().toLowerCase(),
        ) || [];

      const nameIndex = header.findIndex((value) =>
        ["name", "название", "сервис"].includes(value),
      );

      if (nameIndex < 0) {
        throw new Error(
          "Не найдена колонка name или «Сервис»",
        );
      }

      const get = (
        row: string[],
        names: string[],
      ) =>
        row[
          header.findIndex((value) =>
            names.includes(value),
          )
        ]?.trim() || "";

      if (!parsed.length) {
        throw new Error("В файле нет строк для импорта");
      }

      setRows(
        parsed.slice(0, 100).map((row) => {
          const name =
            row[nameIndex]?.trim() || "";

          const match = existing.some(
            (subscription) =>
              subscription.name.toLowerCase() ===
              name.toLowerCase(),
          );

          const similar = existing.some(
            (subscription) =>
              subscription.name
                .toLowerCase()
                .includes(name.toLowerCase()),
          );

          return {
            name,
            tariff: get(row, ["tariff", "тариф"]),
            price: get(row, [
              "price_month",
              "price",
              "цена",
            ]),
            renewal: get(row, [
              "renewal_date",
              "дата",
            ]),
            selected: !!name && !match,
            state: match
              ? "Уже в реестре"
              : similar
                ? "Возможное совпадение"
                : [
                    "figma",
                    "notion",
                    "slack",
                    "miro",
                    "zoom",
                    "linear",
                    "dropbox",
                    "onlyoffice",
                  ].includes(name.toLowerCase())
                  ? "Распознан"
                  : "Неизвестный сервис",
          };
        }),
      );

      setFilename(file.name);
      setStep(1);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Не удалось прочитать файл",
      );
    }
  };

  return (
    <>
      <div className="concept-label">
        <Icon name="info" size={17} />

        <span>
          <strong>
            Концепт · требует доработки backend
          </strong>

          <small>
            Предпросмотр, исправление и подтверждение
            показаны только в прототипе. Текущий API
            не поддерживает этот процесс.
          </small>
        </span>
      </div>

      <div className="import-steps">
        {[
          "Загрузка файла",
          "Проверка строк",
          "Результат",
        ].map((label, index) => (
          <span
            className={index <= step ? "active" : ""}
            key={label}
          >
            <b>
              {index < step ? (
                <Icon name="check" size={12} />
              ) : (
                index + 1
              )}
            </b>

            {label}

            {index < 2 && (
              <Icon name="chevron" size={13} />
            )}
          </span>
        ))}
      </div>

      {step === 0 && (
        <>
          <label
            className="upload-zone"
            onDragOver={(event) =>
              event.preventDefault()
            }
            onDrop={(event) => {
              event.preventDefault();
              void readFile(
                event.dataTransfer.files[0],
              );
            }}
          >
            <span className="upload-symbol">
              <Icon name="upload" size={27} />
            </span>

            <strong>
              Выберите CSV или перетащите его сюда
            </strong>

            <span>
              До 1 МБ · первые 100 строк
            </span>

            <input
              type="file"
              accept=".csv"
              onChange={(event) =>
                void readFile(
                  event.target.files?.[0],
                )
              }
            />

            <span className="btn">
              Выбрать файл
            </span>
          </label>

          <p className="form-hint">
            Колонки: name (обязательно), tariff,
            price_month, renewal_date (ГГГГ-ММ-ДД).
            Остальные условия уточняются после импорта.
          </p>

          <button
            className="text-link"
            onClick={() => {
              const blob = new Blob(
                [
                  "name,tariff,price_month,renewal_date\nFigma,Professional,12000,2025-07-20\nLoom,Business,2400,2025-07-25\nAcme,Team,5000,2025-08-01",
                ],
                {
                  type: "text/csv;charset=utf-8",
                },
              );

              const url =
                URL.createObjectURL(blob);

              const anchor =
                document.createElement("a");

              anchor.href = url;
              anchor.download =
                "subcontrol-example.csv";

              anchor.click();

              URL.revokeObjectURL(url);
            }}
          >
            Скачать пример CSV
            <Icon name="arrow" size={15} />
          </button>
        </>
      )}

      {error && (
        <p
          className="field-error"
          role="alert"
        >
          {error}
        </p>
      )}

      {step === 1 && (
        <>
          <p className="form-intro">
            {filename} · {rows.length} строк.
            Выберите нужные записи и проверьте значения.
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault();

              const selected = rows.filter(
                (row) => row.selected,
              );

              if (!selected.length) return;

              onImport(
                selected.map((row, index) => ({
                  id: Date.now() + index,
                  name: row.name,
                  tariff: row.tariff || "Уточнить",
                  vendor: row.name,
                  price: Number(row.price || 0),
                  currency: "RUB",
                  renewal: row.renewal,
                  owner: "Анна Смирнова",
                  status: "Активна",
                  paySource: "Не указан",
                })),
              );

              setCount(selected.length);
              setStep(2);
            }}
          >
            <div className="table-scroll import-table">
              <table>
                <thead>
                  <tr>
                    <th />

                    <th>
                      Сервис / распознавание
                    </th>

                    <th>Тариф</th>

                    <th>
                      Цена / мес., ₽
                    </th>

                    <th>
                      Продление *
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="checkbox"
                          checked={row.selected}
                          aria-label={`Импортировать строку ${index + 1}`}
                          onChange={(event) =>
                            setRows((previous) =>
                              previous.map(
                                (current, currentIndex) =>
                                  currentIndex === index
                                    ? {
                                        ...current,
                                        selected:
                                          event.target.checked,
                                      }
                                    : current,
                              ),
                            )
                          }
                        />
                      </td>

                      <td>
                        <input
                          required={row.selected}
                          aria-label={`Название ${index + 1}`}
                          value={row.name}
                          onChange={(event) =>
                            setRows((previous) =>
                              previous.map(
                                (current, currentIndex) =>
                                  currentIndex === index
                                    ? {
                                        ...current,
                                        name:
                                          event.target.value,
                                      }
                                    : current,
                              ),
                            )
                          }
                        />

                        <span
                          className={`import-state ${
                            row.state === "Распознан"
                              ? "green-text"
                              : ""
                          }`}
                        >
                          {row.state}
                        </span>
                      </td>

                      <td>
                        <input
                          aria-label={`Тариф ${index + 1}`}
                          value={row.tariff}
                          onChange={(event) =>
                            setRows((previous) =>
                              previous.map(
                                (current, currentIndex) =>
                                  currentIndex === index
                                    ? {
                                        ...current,
                                        tariff:
                                          event.target.value,
                                      }
                                    : current,
                              ),
                            )
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          aria-label={`Цена ${index + 1}`}
                          value={row.price}
                          required={row.selected}
                          onChange={(event) =>
                            setRows((previous) =>
                              previous.map(
                                (current, currentIndex) =>
                                  currentIndex === index
                                    ? {
                                        ...current,
                                        price:
                                          event.target.value,
                                      }
                                    : current,
                              ),
                            )
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="date"
                          required={row.selected}
                          aria-label={`Продление ${index + 1}`}
                          value={row.renewal}
                          onChange={(event) =>
                            setRows((previous) =>
                              previous.map(
                                (current, currentIndex) =>
                                  currentIndex === index
                                    ? {
                                        ...current,
                                        renewal:
                                          event.target.value,
                                      }
                                    : current,
                              ),
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="inline-note">
              Совпадения определены по названиям.
              Неизвестные строки проверьте вручную.
              Источник оплаты и ответственного
              уточните в карточке.
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn"
                onClick={() => setStep(0)}
              >
                Другой файл
              </button>

              <button
                className="btn primary"
                disabled={
                  !rows.some(
                    (row) => row.selected,
                  )
                }
                type="submit"
              >
                Подтвердить импорт (
                {
                  rows.filter(
                    (row) => row.selected,
                  ).length
                }
                )
              </button>
            </div>
          </form>
        </>
      )}

      {step === 2 && (
        <div className="import-success">
          <span>
            <Icon name="check" size={32} />
          </span>

          <h2>
            Импорт подтверждён
          </h2>

          <p>
            Добавлено в демо-реестр: {count}.
            <br />
            Проверьте условия в карточках подписок.
          </p>

          <div className="inline-note">
            Это локальный концепт импорта.
            API не вызывался.
          </div>
        </div>
      )}
    </>
  );
}
